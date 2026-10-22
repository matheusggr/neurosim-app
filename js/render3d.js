// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import './ui.js?v=12.66.1';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { systemsData } from './data.js?v=12.66.1';
import {
    CLEFT_COMPONENT_INFO, buildSynapticCleft3D, camkiiGroup, cleft3DGroup, definirCleft3DGroup, postMembraneMesh,
    receptors3DGroup, showCleftTooltip, vesicles3D
} from './dominios/neurotransmissao.js?v=12.66.1';
import {
    brain3DGroup, brain3DNucleiMeshes, buildWholeBrain3D, definirBrain3DGroup, hideConnectomeTooltip,
    showConnectomeTooltip
} from './dominios/circuitos.js?v=12.66.1';
import { registerEffect, store } from './store.js?v=12.66.1';
import { cameraTween, updateCameraTween } from './features.js?v=12.66.1';
import { playBioTone } from './engine.js?v=12.66.1';
// ── fim dos módulos ──
/* NeuroSim Pro 3D — render3d.js. Gerado pela divisão da v12.0; a ordem de carga é definida em Simulador_Neuronio_Interativo.html.
   Scripts clássicos compartilham o escopo global: const/let/function de um arquivo são visíveis nos seguintes. */
// =========================================================================
// 8. THREE.JS 3D VIEWPORT ENGINE (SYNAPSE 3D & WHOLE BRAIN DTI TRACTOGRAPHY 3D)
// =========================================================================
let scene3D, camera3D, renderer3D, controls3D, clockDelta;
let autoRotate3D = true;
let raycaster3D, mouseVector3D;

// 3D Volumetric Anatomical Nuclei Coordinates (in 3D space)
// v12.0: nuclei3DCoords agora é derivado de nucleiCatalog (seção 1.9 de data.js)

// =========================================================================
// 9. KEYBOARD SHORTCUTS & 3D CAMERA PRESETS (PRO NAVIGATION)
// =========================================================================
function set3DCameraPreset(preset) {
    if (!camera3D || !controls3D) return;
    if (preset === 'top') {
        camera3D.position.set(0, 42, 0);
        controls3D.target.set(0, 0, 0);
    } else if (preset === 'cleft') {
        camera3D.position.set(0, 0, 30);
        controls3D.target.set(0, 0, 0);
    } else if (preset === 'postsynaptic') {
        camera3D.position.set(0, -25, 20);
        controls3D.target.set(0, -2, 0);
    } else if (preset === 'reset') {
        camera3D.position.set(0, 12, 36);
        controls3D.target.set(0, 0, 0);
    }
    controls3D.update();
    playBioTone(520, 'sine', 0.08, 0.08);
}

function toggleAutoRotate3D() {
    autoRotate3D = !autoRotate3D;
    if (controls3D) controls3D.autoRotate = autoRotate3D;
    playBioTone(autoRotate3D ? 580 : 380, 'sine', 0.1, 0.1);
}

function toggleSidebar() {
    const ws = document.querySelector('.workspace');
    if (ws) ws.classList.toggle('sidebar-collapsed');
    playBioTone(480, 'sine', 0.08, 0.08);
}

// (Atalhos de teclado: listener único na seção 13.6 — o antigo listener duplicado foi removido)

function init3D() {
    const container = document.getElementById('threejs-container');
    if (!container || typeof THREE === 'undefined') return;

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 500;
    const state = store.getState();

    scene3D = new THREE.Scene();
    scene3D.background = new THREE.Color(state.isAtlasTheme ? 0xf8fafc : 0x020617);

    camera3D = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera3D.position.set(0, 12, 36);

    /*
     * v12.10 — compatibilidade visual da r160.
     * A r152 ligou o ColorManagement por padrão e a r155 trocou a semântica de intensidade das
     * luzes. Sem estas duas linhas a cena escurece e dessatura de forma visível — medido: 18% dos
     * pixels mudam, com desvio médio de 51 e 55 nos canais verde e azul. Num app em que a cor
     * carrega significado clínico, isso não é estética.
     * DÍVIDA DECLARADA: `useLegacyLights` também está depreciado. A correção definitiva é
     * recalibrar as intensidades das luzes para as unidades físicas da r155+, o que é trabalho
     * visual e precisa do olho do autor — não de mais uma bandeira de compatibilidade.
     */
    if (THREE.ColorManagement) THREE.ColorManagement.enabled = false;
    renderer3D = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    if ('useLegacyLights' in renderer3D) renderer3D.useLegacyLights = true;
    renderer3D.setSize(w, h);

    // v12.15 — o canvas 3D so era avisado no resize da JANELA. Colapsar o inspetor, entrar no
    // Modo Aula ou trocar de escala mudam o tamanho do container sem disparar resize, entao o
    // canvas ficava com o tamanho errado sem ninguem perceber. Os canvas 2D nao precisam disto:
    // eles remedem o pai a cada quadro. #threejs-container e markup estatico e nunca e
    // substituido, entao o observador sobrevive a todo ciclo de renderUI.
    if (typeof ResizeObserver !== 'undefined' && !renderer3D.__ro) {
        renderer3D.__ro = new ResizeObserver(() => {
            const cw = container.clientWidth, ch = container.clientHeight;
            if (!cw || !ch) return;   // display:none -> 0x0; aspect = 0/0 = NaN corrompe a projecao
            camera3D.aspect = cw / ch;
            camera3D.updateProjectionMatrix();
            // MEDIDO: aqui o CSS NAO controla o tamanho do canvas — quem manda e o style inline
            // que o proprio setSize escreve. Com updateStyle=false o buffer crescia para
            // 1720x885 e o canvas continuava sendo EXIBIDO a 800x500 dentro de um container
            // de 1147 px: alta resolucao renderizada numa caixa pequena. O conselho generico
            // de passar false so vale onde o CSS dimensiona o canvas, e nao e o caso aqui.
            renderer3D.setSize(cw, ch);
        });
        renderer3D.__ro.observe(container);
    }
    renderer3D.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer3D.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer3D.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
        controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
        controls3D.enableDamping = true;
        controls3D.dampingFactor = 0.06;
        controls3D.maxDistance = 80;
        controls3D.minDistance = 8;
    }

    clockDelta = new THREE.Clock();
    raycaster3D = new THREE.Raycaster();
    mouseVector3D = new THREE.Vector2();

    // Lighting Setup
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene3D.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight.position.set(20, 35, 25);
    scene3D.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 1.2, 50);
    pointLight.position.set(-15, -10, 20);
    scene3D.add(pointLight);

    // Group 1: Synaptic Cleft 3D
    definirCleft3DGroup(new THREE.Group());
    buildSynapticCleft3D(cleft3DGroup);
    scene3D.add(cleft3DGroup);

    // Group 2: Whole Brain 3D & DTI Tractography
    definirBrain3DGroup(new THREE.Group());
    buildWholeBrain3D(brain3DGroup);
    scene3D.add(brain3DGroup);

    // Initial scale visibility
    cleft3DGroup.visible = (state.visualScale === '3d');
    brain3DGroup.visible = (state.visualScale === 'brain3d');

    // Setup click and hover raycasting for 3D nuclei
    renderer3D.domElement.addEventListener('click', on3DCanvasClick);
    renderer3D.domElement.addEventListener('mousemove', on3DCanvasMouseMove);
    renderer3D.domElement.addEventListener('mouseleave', hideConnectomeTooltip);
}

function on3DCanvasMouseMove(e) {
    const container = document.getElementById('threejs-container');
    const state = store.getState();
    if (!container || !camera3D) return;
    if (state.visualScale === '3d') {
        const rect = container.getBoundingClientRect();
        mouseVector3D.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouseVector3D.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
        raycaster3D.setFromCamera(mouseVector3D, camera3D);
        const hits = cleft3DGroup ? raycaster3D.intersectObjects(cleft3DGroup.children, false) : [];
        const hit = hits.find(h => h.object.userData && h.object.userData.cleftId);
        if (hit) { showCleftTooltip(hit.object.userData.cleftId, e.clientX, e.clientY); container.style.cursor = 'pointer'; return; }
        hideConnectomeTooltip(); container.style.cursor = 'default'; return;
    }
    if (state.visualScale !== 'brain3d') return;
    const rect = container.getBoundingClientRect();
    mouseVector3D.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouseVector3D.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

    raycaster3D.setFromCamera(mouseVector3D, camera3D);
    const nucleusMeshesList = Object.values(brain3DNucleiMeshes);
    const intersects = raycaster3D.intersectObjects(nucleusMeshesList);

    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const nId = clickedMesh.userData.nucleusId;
        if (nId) {
            showConnectomeTooltip(nId, e.clientX, e.clientY);
            container.style.cursor = 'pointer';
            return;
        }
    }
    hideConnectomeTooltip();
    container.style.cursor = 'default';
}

function on3DCanvasClick(event) {
    const container = document.getElementById('threejs-container');
    if (!container || !camera3D) return;
    const rect = container.getBoundingClientRect();
    mouseVector3D.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouseVector3D.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

    raycaster3D.setFromCamera(mouseVector3D, camera3D);
    const st3 = store.getState();
    if (st3.visualScale === '3d' && cleft3DGroup) {
        const hits = raycaster3D.intersectObjects(cleft3DGroup.children, false);
        const hit = hits.find(h => h.object.userData && h.object.userData.cleftId);
        if (hit) {
            const info = CLEFT_COMPONENT_INFO[hit.object.userData.cleftId];
            store.dispatch({ type: 'SELECT_CLEFT_COMPONENT', componentId: info ? info.map : null });
            if (hit.object.userData.cleftId === 'cav' || hit.object.userData.cleftId === 'vesicles') store.dispatch({ type: 'TRIGGER_ACTION_POTENTIAL' });
            playBioTone(520, 'sine', 0.1, 0.1);
        }
        return;
    }
    const nucleusMeshesList = Object.values(brain3DNucleiMeshes);
    const intersects = raycaster3D.intersectObjects(nucleusMeshesList);

    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const nId = clickedMesh.userData.nucleusId;
        if (nId) {
            store.dispatch({ type: 'SELECT_NUCLEUS', nucleusId: nId });
        }
    }
}

function update3DMaterials(systemKey) {
    const sys = systemsData[systemKey];
    if (!sys) return;

    // Update 3D Vesicles color
    vesicles3D.forEach(v => {
        v.material.color.setHex(sys.hex);
        v.material.emissive.setHex(sys.hex);
    });

    // Update 3D Receptors color
    if (receptors3DGroup) {
        receptors3DGroup.children.forEach(r => {
            r.material.color.setHex(sys.hex);
        });
    }
}

function animate3D() {
    requestAnimationFrame(animate3D);
    const delta = clockDelta ? Math.min(clockDelta.getDelta(), 0.1) : 0.016;
    const state = store.getState();

    if (cameraTween) updateCameraTween();
    if (controls3D) {
        controls3D.autoRotate = autoRotate3D && !cameraTween;
        controls3D.update();
    }

    // Brownian motion
    const timeNow = Date.now() * 0.002;
    vesicles3D.forEach((v, idx) => {
        v.position.x += Math.sin(timeNow + idx) * (1.2 * delta);
        v.position.y += Math.cos(timeNow + idx) * (1.2 * delta);
    });

    if (camkiiGroup) {
        camkiiGroup.rotation.y += (0.9 * delta);
    }

    // Plastic dendritic spine morphing
    if (postMembraneMesh) {
        const targetScale = state.spineHeadScale || 1.0;
        postMembraneMesh.scale.x += (targetScale - postMembraneMesh.scale.x) * (3.0 * delta);
        postMembraneMesh.scale.y += (targetScale - postMembraneMesh.scale.y) * (3.0 * delta);
    }

    if (renderer3D && scene3D && camera3D) {
        renderer3D.render(scene3D, camera3D);
    }
}

// v12.6 — registro de efeitos no store. O store declara de que precisa; cada módulo entrega o seu.
// Sem isto o efeito simplesmente não ocorre (o padrão é não fazer nada), em vez de lançar ReferenceError.
if (typeof registerEffect === 'function') {
    registerEffect('materials', update3DMaterials);
}

// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { autoRotate3D, camera3D, clockDelta, controls3D, init3D, renderer3D, scene3D };
// ── fim do exporta ──
