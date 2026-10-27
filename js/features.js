// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import './store.js?v=12.76.2';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { TARGETS_CANON } from './targets.js?v=12.76.2';
import {
    APP_VERSION, DOMINIOS, ESCALAS_DE_PROJECAO, MODO, SEMIOLOGY_TERMS, clinicalCasesData, dominioDoModo,
    semiologyCounts, semiologyOccurrences, systemsData
} from './data.js?v=12.76.2';
import { patientStoriesData } from './dominios/psicoeducacao.js?v=12.76.2';
import { recalculateElectrophysiology, toggleModelPanel } from './dominios/neuronio.js?v=12.76.2';
import {
    drugBindingAffinities, drugsForTarget, hasKiData, normalizarFarmacoAntigo, openCrossTaperingModal, prescrever,
    updateCrossTaperingCalculations
} from './dominios/psicofarmacos.js?v=12.76.2';
import { escolherSistema } from './dominios/neurotransmissao.js?v=12.76.2';
import { circuitsForTarget, neurostimProtocolsData, pathologyProfilesData } from './dominios/circuitos.js?v=12.76.2';
import { ESCALAS_VISUAIS, registerEffect, store } from './store.js?v=12.76.2';
import { playBioTone } from './engine.js?v=12.76.2';
import { renderInspector } from './ui.js?v=12.76.2';
import { camera3D, controls3D, renderer3D, scene3D } from './render3d.js?v=12.76.2';
import { openSourcesModal } from './main.js?v=12.76.2';
// ── fim dos módulos ──
/* NeuroSim Pro 3D — features.js. Gerado pela divisão da v12.0; a ordem de carga é definida em Simulador_Neuronio_Interativo.html.
   Scripts clássicos compartilham o escopo global: const/let/function de um arquivo são visíveis nos seguintes. */
// ==========================================
// 2.1 PERSISTÊNCIA LOCAL (localStorage) — preferências e sessão de estudo
// ==========================================
const PERSIST_KEY = 'neurosim-pro-session-v1';
const PERSISTED_FIELDS = ['activeMode', 'system', 'visualScale', 'isAtlasTheme', 'soundEnabled', 'pharmaTab',
    'selectedDrugsList', 'd2DoseSlider', 'pharmaDoseMg', 'block5HT2A', 'litemiaVal',
    'pathologyDisorder', 'activePathologyProfile', 'patientStoryKey', 'activeCircuitLayers', 'activeSubTracts',
    'neurostimProtocol', 'selectedCleftComponent',
    'escalaProjecao'];   // v12.53: o tamanho da projecao e' da SALA (projetor, distancia); guardar poupa reajustar a cada aula
// v12.18: os acordeoes SAIRAM da persistencia, e e isso que faz a correcao valer. Sem esta
// linha o estado inicial vazio nunca era usado: o localStorage restaurava os 21 abertos da
// ultima sessao e o inspetor voltava com 5.708 px de conteudo. A CENA continua lembrada —
// activeCircuitLayers e activeSubTracts seguem na lista. O que se perde entre sessoes e so
// 'qual lista estava aberta', que e navegacao, nao trabalho.
let persistTimer = null;
function persistSession() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
        try {
            const st = store.getState();
            const snap = { version: APP_VERSION, v: 2, savedAt: Date.now() };   // v12.37: marcador dos modos novos
            PERSISTED_FIELDS.forEach(k => { if (st[k] !== undefined) snap[k] = st[k]; });
            localStorage.setItem(PERSIST_KEY, JSON.stringify(snap));
        } catch (e) { /* armazenamento indisponível (modo privado etc.) */ }
    }, 250);
}
/*
 * v12.37 (Bloco 2): os numeros de modo mudaram de significado — 1 Neuronio, 2 Circuitos, 3 Neurotransmissao,
 * 4 Psicofarmacos (antes: 1 Fenda & Biofisica, 2 Psicofarmacoteca, 3 Fisiopatologia & Circuitos, 4 Psicoeducacao).
 * Sessao gravada, cena salva e link #cena= de antes disso nao tem o marcador v: 2 e sao traduzidos aqui; a
 * Psicoeducacao antiga vira Neurotransmissao com o painel aberto. Com v: 2, nada muda. tests/modos.test.ts.
 */
function migrarModosAntigos(estado) {
    if (!estado || typeof estado !== 'object' || estado.v === 2 || estado.activeMode === undefined) return estado;
    const antigo = Number(estado.activeMode);
    const novo = Object.assign({}, estado, { v: 2 });
    if (antigo === 1) novo.activeMode = (estado.visualScale === 'neuron2d') ? MODO.neuronio : MODO.neurotransmissao;
    else if (antigo === 2) novo.activeMode = MODO.psicofarmacos;
    else if (antigo === 3) novo.activeMode = MODO.circuitos;
    else if (antigo === 4) { novo.activeMode = MODO.neurotransmissao; novo.psicoeducacaoAberta = true; }
    return novo;
}
/*
 * v12.64 — SANEAMENTO DO ESTADO EXTERNO.
 *
 * Tres portas trazem estado de fora do reducer: a sessao gravada (localStorage), a cena (salva, importada por JSON
 * ou vinda pelo link #cena=) e, por dentro delas, tudo o que um arquivo de colega ou um link editado quiser. Ate a
 * v12.63 as tres escreviam `st[k] = valor` sem olhar o valor — e o reducer, que tem uma trava para cada acao, nunca
 * era consultado. Medido na auditoria de 30/09/2026 (docs/Auditoria_Codigo_2026-09-30.md, 2.6): `visualScale:
 * 'dual'` (persistivel ate a v12.31) apagava o palco ate alguem apertar 1–5; `system: 'xyz'` quebrava `renderUI`
 * no primeiro assinante e, a partir dai, TODO dispatch lancava e `persistSession` nunca mais rodava;
 * `activeCircuitLayers: 'texto'` quebrava o reducer.
 *
 * Aqui cada campo passa por uma lista branca. Campos com vocabulario fechado (modo, sistema, escala, perfil...)
 * so entram se o valor existir no catalogo; os demais precisam ter o MESMO tipo do estado inicial (array e array,
 * numero e numero finito, objeto e objeto nao nulo). O que nao passa e descartado e anotado no console — a cena
 * antiga abre no padrao em vez de derrubar o app. tests/entradas_externas.test.ts prova cada caso.
 */
const VALIDADORES_DE_ESTADO = {
    activeMode: v => Object.values(MODO).includes(v),
    system: v => typeof v === 'string' && Object.prototype.hasOwnProperty.call(systemsData, v),
    visualScale: v => ESCALAS_VISUAIS.includes(v),
    pharmaTab: v => v === 'poly' || v === 'classes',
    activePathologyProfile: v => typeof v === 'string' && Object.prototype.hasOwnProperty.call(pathologyProfilesData, v),
    neurostimProtocol: v => typeof v === 'string' && Object.prototype.hasOwnProperty.call(neurostimProtocolsData, v),
    patientStoryKey: v => typeof v === 'string' && Object.prototype.hasOwnProperty.call(patientStoriesData, v),
    neuroStep: v => Number.isInteger(v) && v >= 1 && v <= 6,
    escalaProjecao: v => ESCALAS_DE_PROJECAO.includes(v),
    selectedDrugsList: v => Array.isArray(v) && v.every(x => typeof x === 'string'),
    activeCircuitLayers: v => Array.isArray(v) && v.every(x => typeof x === 'string'),
    activeSubTracts: v => Array.isArray(v) && v.every(x => typeof x === 'string'),
};
function sanearEstadoExterno(entrada, origem) {
    const referencia = store.getState();
    const saida = {}; const descartados = [];
    for (const k of Object.keys(entrada || {})) {
        const v = entrada[k], ref = referencia[k];
        let ok;
        if (VALIDADORES_DE_ESTADO[k]) ok = VALIDADORES_DE_ESTADO[k](v);
        else if (ref === null || ref === undefined) ok = true;                       // campo sem tipo de referencia (ex.: selectedCleftComponent)
        else if (Array.isArray(ref)) ok = Array.isArray(v);
        else if (typeof ref === 'number') ok = typeof v === 'number' && Number.isFinite(v);
        else if (typeof ref === 'object') ok = !!v && typeof v === 'object' && !Array.isArray(v);
        else ok = typeof v === typeof ref;
        if (ok) saida[k] = v; else descartados.push(k + '=' + String(JSON.stringify(v)).slice(0, 40));
    }
    if (descartados.length) console.warn(`[NeuroSim] ${origem}: campos descartados pelo saneamento — ${descartados.join(', ')}`);
    return saida;
}
function restoreSession() {
    try {
        const raw = localStorage.getItem(PERSIST_KEY);
        if (!raw) return false;
        const snap = sanearEstadoExterno(normalizarFarmacoAntigo(migrarModosAntigos(JSON.parse(raw))), 'sessão gravada');   // v12.37: sessao de antes da reordenacao dos modos; v12.64: saneada
        const st = store.getState();
        PERSISTED_FIELDS.forEach(k => { if (snap[k] !== undefined) st[k] = snap[k]; });
        if (Array.isArray(st.selectedDrugsList)) st.selectedDrugsList = st.selectedDrugsList.filter(k => drugBindingAffinities[k]);
        document.body.classList.toggle('atlas-theme', !!st.isAtlasTheme);
        const tb = document.getElementById('btn-toggle-theme');
        if (tb) tb.innerHTML = st.isAtlasTheme ? '🌙 <span class="lbl">Escuro</span>' : '🎨 <span class="lbl">Tema</span>';
        const sb = document.getElementById('btn-toggle-sound');
        if (sb) sb.innerHTML = st.soundEnabled === false ? '🔇 <span class="lbl">Mudo</span>' : '🔊 <span class="lbl">Som</span>';
        return true;
    } catch (e) { return false; }
}
function clearSavedSession() {
    try { localStorage.removeItem(PERSIST_KEY); } catch (e) {}
    location.reload();
}
store.subscribe(persistSession);

// ==========================================
// 2.2 CENAS (v10) — estados nomeados, link por URL, playlist e câmera
// ==========================================
const SCENES_KEY = 'neurosim-scenes-v1';
const SCENE_FIELDS = PERSISTED_FIELDS.concat(['neuroStep', 'dualSubMode', 'pathologyProgression', 'brainCircuitViewMode',
    'biophysicsSubModule', 'neurostimFrequency', 'neurostimIntensity', 'k_out', 'k_in', 'na_out', 'na_in', 'ca_out', 'ca_in', 'cl_out', 'cl_in',
    'blockNav_TTX', 'blockKv_TEA', 'blockCav_Cd', 'blockGABA_PTX', 'activeToxins', 'botulinumToxinActive', 'amphetamineActive', 'diseaseTreatmentState',
    'psicoeducacaoAberta']);   // v12.37: o painel de psicoeducacao e estado, e as cenas dos casos o abrem
let scenes = [];
let currentSceneIndex = -1;
let playlistTimer = null;
let cameraTween = null;
function definirCameraTween(t) { cameraTween = t; }   // setter: em módulos ES, quem importa não escreve
let lastVisualScale3D = null;
function definirLastVisualScale3D(v) { lastVisualScale3D = v; }
const cameraByScale = {}; // preenchido depois que o THREE existe (init3D)
let cameraOrbit = null;   // trilha cinemática (v11.2)

function loadScenes() {
    try { scenes = JSON.parse(localStorage.getItem(SCENES_KEY) || '[]'); } catch (e) { scenes = []; }
    if (!Array.isArray(scenes)) scenes = [];
}
function storeScenes() {
    try { localStorage.setItem(SCENES_KEY, JSON.stringify(scenes)); } catch (e) {}
}
function captureScene(name, note) {
    const st = store.getState();
    const snap = {};
    SCENE_FIELDS.forEach(k => { if (st[k] !== undefined) snap[k] = JSON.parse(JSON.stringify(st[k])); });
    const cam = (camera3D && controls3D) ? {
        pos: [camera3D.position.x, camera3D.position.y, camera3D.position.z].map(v => Number(v.toFixed(2))),
        target: [controls3D.target.x, controls3D.target.y, controls3D.target.z].map(v => Number(v.toFixed(2)))
    } : null;
    return { id: 'sc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name || ('Cena ' + (scenes.length + 1)),
             note: note || '', createdAt: new Date().toISOString(), version: APP_VERSION, state: snap, camera: cam };
}
function applyScene(scene, opts = {}) {
    if (!scene || !scene.state) return;
    const st = store.getState();
    const estadoDaCena = sanearEstadoExterno(normalizarFarmacoAntigo(migrarModosAntigos(scene.state)), 'cena');   // v12.37: cena de antes da reordenacao dos modos; v12.64: saneada
    SCENE_FIELDS.forEach(k => { if (estadoDaCena[k] !== undefined) st[k] = JSON.parse(JSON.stringify(estadoDaCena[k])); });
    if (Array.isArray(st.selectedDrugsList)) st.selectedDrugsList = st.selectedDrugsList.filter(k => drugBindingAffinities[k]);
    document.body.classList.toggle('atlas-theme', !!st.isAtlasTheme);
    if (scene3D) scene3D.background = new THREE.Color(st.isAtlasTheme ? 0xf8fafc : 0x020617);
    const tb = document.getElementById('btn-toggle-theme');
    if (tb) tb.innerHTML = st.isAtlasTheme ? '🌙 <span class="lbl">Escuro</span>' : '🎨 <span class="lbl">Tema</span>';
    if (typeof recalculateElectrophysiology === 'function') { try { recalculateElectrophysiology(); } catch (e) {} }
    store.dispatch({ type: 'SCENE_APPLIED' });
    if (scene.camera && camera3D && controls3D) {
        if (opts.animateCamera === false) {
            camera3D.position.set(...scene.camera.pos); controls3D.target.set(...scene.camera.target); controls3D.update();
        } else {
            cameraTween = { from: { pos: camera3D.position.clone(), target: controls3D.target.clone() },
                            to: { pos: new THREE.Vector3(...scene.camera.pos), target: new THREE.Vector3(...scene.camera.target) },
                            start: performance.now(), duration: opts.duration || 1400 };
        }
    }
    showSceneCaption(scene, opts.captionMs || 6000);
}
function updateCameraTween() {
    if (!cameraTween || !camera3D || !controls3D) return;
    const t = Math.min(1, (performance.now() - cameraTween.start) / cameraTween.duration);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // ease-in-out cubic
    camera3D.position.lerpVectors(cameraTween.from.pos, cameraTween.to.pos, e);
    controls3D.target.lerpVectors(cameraTween.from.target, cameraTween.to.target, e);
    if (t >= 1) cameraTween = null;
}
// --- Trilhas cinemáticas (v11.2) ---
function startCameraOrbit(seconds, opts = {}) {
    if (!camera3D || !controls3D) return;
    const st = store.getState(); if (!['3d', 'brain3d'].includes(st.visualScale)) store.dispatch({ type: 'SET_VISUAL_SCALE', scale: '3d' });
    cameraTween = null;
    const center = controls3D.target.clone(); const rel = camera3D.position.clone().sub(center);
    const radius = Math.hypot(rel.x, rel.z) || 30; const startAngle = Math.atan2(rel.z, rel.x);
    cameraOrbit = { start: performance.now(), duration: (seconds || 20) * 1000, center, radius, startAngle, y0: rel.y, y1: opts.elevate === false ? rel.y : rel.y + (opts.dy !== undefined ? opts.dy : 10), turns: opts.turns || 1, loop: !!opts.loop };
    const b = document.getElementById('btn-orbit'); if (b) b.innerHTML = '⏹ Parar órbita';
}
function stopCameraOrbit() { cameraOrbit = null; const b = document.getElementById('btn-orbit'); if (b) b.innerHTML = '🎥 Órbita'; }
function updateCameraOrbit() {
    if (!cameraOrbit || !camera3D || !controls3D) return;
    let t = (performance.now() - cameraOrbit.start) / cameraOrbit.duration;
    if (t >= 1) { if (cameraOrbit.loop) { cameraOrbit.start = performance.now(); t = 0; } else { stopCameraOrbit(); return; } }
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease-in-out quad
    const ang = cameraOrbit.startAngle + e * Math.PI * 2 * cameraOrbit.turns;
    const y = cameraOrbit.y0 + Math.sin(e * Math.PI) * (cameraOrbit.y1 - cameraOrbit.y0);
    camera3D.position.set(cameraOrbit.center.x + Math.cos(ang) * cameraOrbit.radius, cameraOrbit.center.y + y, cameraOrbit.center.z + Math.sin(ang) * cameraOrbit.radius);
    controls3D.target.copy(cameraOrbit.center);
}
function flyToPreset(preset, seconds) {
    if (!camera3D || !controls3D) return;
    const P = { top: { pos: [0, 42, 0.01], target: [0, 0, 0] }, cleft: { pos: [0, 0, 30], target: [0, 0, 0] }, postsynaptic: { pos: [0, -25, 20], target: [0, -2, 0] }, reset: { pos: [0, 12, 36], target: [0, 0, 0] },
                brainFront: { pos: [0, 6, 52], target: [0, 0, 0] }, brainSide: { pos: [52, 8, 0.01], target: [0, 0, 0] }, brainTop: { pos: [0.01, 56, 0.01], target: [0, 0, 0] } };
    const p = P[preset]; if (!p) return;
    stopCameraOrbit();
    cameraTween = { from: { pos: camera3D.position.clone(), target: controls3D.target.clone() }, to: { pos: new THREE.Vector3(...p.pos), target: new THREE.Vector3(...p.target) }, start: performance.now(), duration: (seconds || 4) * 1000 };
}
function toggleCameraOrbit() { if (cameraOrbit) stopCameraOrbit(); else startCameraOrbit(parseFloat(document.getElementById('orbitSeconds')?.value) || 20, { loop: !!document.getElementById('orbitLoop')?.checked }); }

let captionTimer = null;
function showSceneCaption(scene, ms) {
    const el = document.getElementById('sceneCaption');
    if (!el) return;
    if (!scene.name && !scene.note) { el.style.display = 'none'; return; }
    el.innerHTML = '<b>🎬 ' + escapeHtml(scene.name || '') + '</b>' + (scene.note ? escapeHtml(scene.note) : '');
    el.style.display = 'block';
    clearTimeout(captionTimer);
    if (ms > 0) captionTimer = setTimeout(() => { el.style.display = 'none'; }, ms);
}
function escapeHtml(str) { return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function saveCurrentScene() {
    const nameEl = document.getElementById('sceneNameInput');
    const noteEl = document.getElementById('sceneNoteInput');
    const sc = captureScene(nameEl ? nameEl.value.trim() : '', noteEl ? noteEl.value.trim() : '');
    scenes.push(sc); storeScenes(); currentSceneIndex = scenes.length - 1;
    if (nameEl) nameEl.value = ''; if (noteEl) noteEl.value = '';
    renderScenesList(); setScenesStatus('Cena "' + sc.name + '" salva.');
    playBioTone(640, 'sine', 0.1, 0.1);
}
function loadSceneAt(i) {
    if (i < 0 || i >= scenes.length) return;
    currentSceneIndex = i; applyScene(scenes[i]); renderScenesList();
}
function deleteSceneAt(i) {
    if (i < 0 || i >= scenes.length) return;
    const name = scenes[i].name; scenes.splice(i, 1); storeScenes();
    if (currentSceneIndex >= scenes.length) currentSceneIndex = scenes.length - 1;
    renderScenesList(); setScenesStatus('Cena "' + name + '" removida.');
}
function moveScene(i, dir) {
    const j = i + dir; if (j < 0 || j >= scenes.length) return;
    [scenes[i], scenes[j]] = [scenes[j], scenes[i]]; storeScenes();
    if (currentSceneIndex === i) currentSceneIndex = j; else if (currentSceneIndex === j) currentSceneIndex = i;
    renderScenesList();
}
function updateSceneAt(i) { // sobrescreve a cena com o estado atual, mantendo nome/nota
    if (i < 0 || i >= scenes.length) return;
    const old = scenes[i]; const sc = captureScene(old.name, old.note); sc.id = old.id; sc.createdAt = old.createdAt;
    scenes[i] = sc; storeScenes(); renderScenesList(); setScenesStatus('Cena "' + old.name + '" atualizada com a tela atual.');
}
function startRenameScene(i) {
    const row = document.querySelector('.scene-row[data-idx="' + i + '"] .scene-name');
    if (!row) return;
    const sc = scenes[i];
    row.innerHTML = '<input type="text" value="' + escapeHtml(sc.name) + '" style="width: 100%;" onkeydown="if (event.key === \'Enter\') { finishRenameScene(' + i + ', this.value); } else if (event.key === \'Escape\') { renderScenesList(); }" onblur="finishRenameScene(' + i + ', this.value)">' +
                    '<textarea rows="2" style="width: 100%; margin-top: 4px;" placeholder="Legenda narrativa" onblur="scenes[' + i + '].note = this.value.trim(); storeScenes();">' + escapeHtml(sc.note || '') + '</textarea>';
    const inp = row.querySelector('input'); if (inp) { inp.focus(); inp.select(); }
}
function finishRenameScene(i, value) {
    if (!scenes[i]) return;
    const v = (value || '').trim(); if (v) scenes[i].name = v; storeScenes(); renderScenesList();
}
function describeScene(sc) {
    const st = sc.state || {}; const scaleNames = { '3d': 'Fenda 3D', cleft2d: 'Fenda 2D', neuron2d: 'Neurônio', brain2d: 'Conectoma 2D', brain3d: 'Cérebro 3D', dual: 'Dual' };
    const sysName = (typeof systemsData !== 'undefined' && systemsData[st.system]) ? systemsData[st.system].name : (st.system || '');
    // v12.64: o resultado vai para innerHTML (lista de cenas, Spotlight) e os campos vem de JSON/URL — escapado aqui, uma vez.
    return escapeHtml('Modo ' + (st.activeMode || '?') + ' • ' + (scaleNames[st.visualScale] || st.visualScale || '') + ' • ' + sysName) + (sc.camera ? ' • 📷' : '');
}
function renderScenesList() {
    const list = document.getElementById('scenesList');
    if (!list) return;
    if (!scenes.length) { list.innerHTML = '<div style="color: var(--text-muted); font-size: 0.7rem; padding: 6px;">Nenhuma cena salva ainda. Monte a tela que quer mostrar, dê um nome e clique em Salvar.</div>'; return; }
    list.innerHTML = scenes.map((sc, i) => `
        <div class="scene-row ${i === currentSceneIndex ? 'current' : ''}" data-idx="${i}">
            <span style="font-size: 0.62rem; color: var(--text-muted); width: 16px; text-align: right;">${i + 1}</span>
            <div style="flex: 1; min-width: 0;">
                <div class="scene-name" title="Clique para carregar; ✏️ para renomear e editar a legenda" onclick="loadSceneAt(${i})">${escapeHtml(sc.name)}</div>
                <div class="scene-meta">${describeScene(sc)}${sc.note ? ' • 💬' : ''}</div>
            </div>
            <div class="scene-actions">
                <button class="mini-btn" title="Carregar" onclick="loadSceneAt(${i})">▶ Carregar</button>
                <button class="mini-btn" title="Renomear / legenda" onclick="startRenameScene(${i})">✏️</button>
                <button class="mini-btn" title="Sobrescrever com a tela atual" onclick="updateSceneAt(${i})">💾</button>
                <button class="mini-btn" title="Copiar link" onclick="copySceneLink(${i})">🔗</button>
                <button class="mini-btn" title="Subir" onclick="moveScene(${i}, -1)">↑</button>
                <button class="mini-btn" title="Descer" onclick="moveScene(${i}, 1)">↓</button>
                <button class="mini-btn" title="Excluir" style="color: var(--ink-red); margin-left: auto;" onclick="deleteSceneAt(${i})">✖</button>
            </div>
        </div>`).join('');
}
function setScenesStatus(msg) {
    const el = document.getElementById('scenesStatus'); if (!el) return;
    el.textContent = msg; clearTimeout(el._t); el._t = setTimeout(() => { el.textContent = ''; }, 4000);
}
function toggleScenesPanel(force) {
    const p = document.getElementById('scenesPanel'); if (!p) return;
    const open = force !== undefined ? force : !p.classList.contains('open');
    p.classList.toggle('open', open);
    if (open) renderScenesList();
}

// --- Link por URL (#cena=base64url(JSON)) ---
function encodeSceneToHash(sc) {
    const compact = { v: 2, n: sc.name, o: sc.note || '', s: sc.state, c: sc.camera };   // v12.37: marcador dos modos novos no envelope, nao no estado
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(compact)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return '#cena=' + b64;
}
function decodeSceneFromHash(hash) {
    const m = /#cena=([A-Za-z0-9_-]+)/.exec(hash || ''); if (!m) return null;
    try {
        let b64 = m[1].replace(/-/g, '+').replace(/_/g, '/'); while (b64.length % 4) b64 += '=';
        const c = JSON.parse(decodeURIComponent(escape(atob(b64))));
        return { name: c.n || '', note: c.o || '', state: normalizarFarmacoAntigo(c.v === 2 ? (c.s || {}) : migrarModosAntigos(c.s || {})), camera: c.c || null };   // v12.37: link de antes da reordenacao dos modos
    } catch (e) { return null; }
}
function copySceneLink(i) {
    const sc = (i === null || i === undefined) ? captureScene(document.getElementById('sceneNameInput')?.value.trim() || 'Tela atual', document.getElementById('sceneNoteInput')?.value.trim() || '') : scenes[i];
    if (!sc) return;
    const url = location.origin + location.pathname + encodeSceneToHash(sc);
    const done = () => setScenesStatus('Link copiado (' + url.length + ' caracteres). Cole no roteiro do vídeo ou na aula.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done).catch(() => { history.replaceState(null, '', encodeSceneToHash(sc)); setScenesStatus('Link colocado na barra de endereço — copie de lá.'); });
    else { history.replaceState(null, '', encodeSceneToHash(sc)); setScenesStatus('Link colocado na barra de endereço — copie de lá.'); }
}
function applySceneFromHash() {
    const sc = decodeSceneFromHash(location.hash);
    if (!sc) return false;
    applyScene(sc, { animateCamera: false, captionMs: 8000 });
    return true;
}
window.addEventListener('hashchange', () => { applySceneFromHash(); });

// --- Exportar / importar ---
function exportScenesJSON() {
    const blob = new Blob([JSON.stringify({ app: 'NeuroSim Pro 3D', version: APP_VERSION, exportedAt: new Date().toISOString(), scenes }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'neurosim-cenas-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    setScenesStatus(scenes.length + ' cena(s) exportada(s).');
}
function importScenesJSON(input) {
    const file = input.files && input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            const incoming = Array.isArray(data) ? data : (data.scenes || []);
            const valid = incoming.filter(sc => sc && sc.state && typeof sc.state === 'object');
            valid.forEach(sc => { if (!sc.id) sc.id = 'sc_' + Math.random().toString(36).slice(2, 10); });
            scenes = scenes.concat(valid); storeScenes(); renderScenesList();
            setScenesStatus(valid.length + ' cena(s) importada(s).');
        } catch (e) { setScenesStatus('Arquivo inválido.'); }
        input.value = '';
    };
    reader.readAsText(file);
}

// --- Playlist ---
function playlistPrefs() {
    const iv = parseFloat(document.getElementById('playlistInterval')?.value) || 8;
    const loop = document.getElementById('playlistLoop') ? document.getElementById('playlistLoop').checked : true;
    return { intervalMs: Math.max(2, iv) * 1000, loop };
}
function savePlaylistPrefs() { try { localStorage.setItem('neurosim-playlist-prefs', JSON.stringify(playlistPrefs())); } catch (e) {} }
function restorePlaylistPrefs() {
    try { const p = JSON.parse(localStorage.getItem('neurosim-playlist-prefs') || 'null'); if (!p) return;
        const iv = document.getElementById('playlistInterval'); if (iv) iv.value = Math.round(p.intervalMs / 1000);
        const lp = document.getElementById('playlistLoop'); if (lp) lp.checked = !!p.loop; } catch (e) {}
}
function playlistStep(dir) {
    if (!scenes.length) { setScenesStatus('Salve ao menos uma cena.'); return; }
    let i = currentSceneIndex + dir;
    const { loop } = playlistPrefs();
    if (i >= scenes.length) { if (!loop) { playlistStop(); return; } i = 0; }
    if (i < 0) i = scenes.length - 1;
    loadSceneAt(i);
}
function playlistToggle() { if (playlistTimer) playlistStop(); else playlistStart(); }
function playlistStart() {
    if (!scenes.length) { setScenesStatus('Salve ao menos uma cena.'); return; }
    if (currentSceneIndex < 0) loadSceneAt(0);
    const btn = document.getElementById('playlistPlayBtn'); if (btn) btn.innerHTML = '⏸ Pausar';
    const tick = () => { playlistStep(1); if (playlistTimer) playlistTimer = setTimeout(tick, playlistPrefs().intervalMs); };
    playlistTimer = setTimeout(tick, playlistPrefs().intervalMs);
    setScenesStatus('Reproduzindo ' + scenes.length + ' cena(s) a cada ' + Math.round(playlistPrefs().intervalMs / 1000) + ' s.');
}
function playlistStop() {
    clearTimeout(playlistTimer); playlistTimer = null;
    const btn = document.getElementById('playlistPlayBtn'); if (btn) btn.innerHTML = '▶ Reproduzir';
}
loadScenes();

// ==========================================
// 2.3 MODO AULA (v10.1) — projeção, apontador e tela limpa
// ==========================================
let presenterHintTimer = null;
// v12.53: main.js (casca) reagenda o sumico do aviso ao trocar o nivel da projecao; em modulo, quem importa nao escreve.
function definirPresenterHintTimer(t) { presenterHintTimer = t; }
function togglePresenterMode(force) {
    const on = force !== undefined ? force : !document.body.classList.contains('presenter-mode');
    document.body.classList.toggle('presenter-mode', on);
    if (!on) document.body.classList.remove('hide-controls');
    toggleScenesPanel(false);
    const hint = document.getElementById('presenterHint');
    if (hint) { hint.classList.remove('faded'); clearTimeout(presenterHintTimer); presenterHintTimer = setTimeout(() => hint.classList.add('faded'), 5000); }
    // legenda da cena fica persistente em aula
    if (on && currentSceneIndex >= 0 && scenes[currentSceneIndex]) showSceneCaption(scenes[currentSceneIndex], 0);
    if (!on) { const c = document.getElementById('sceneCaption'); if (c) c.style.display = 'none'; }
    setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
    playBioTone(on ? 700 : 420, 'sine', 0.12, 0.1);
}
window.addEventListener('mousemove', (e) => {
    const lp = document.getElementById('laserPointer');
    if (lp && document.body.classList.contains('presenter-mode')) { lp.style.left = e.clientX + 'px'; lp.style.top = e.clientY + 'px'; }
});

// ==========================================
// 2.2c CASOS CLÍNICOS (v11.0) — player de caso sobre cenas + POE
// ==========================================
const CASES_KEY = 'neurosim-cases-v1';
let userCases = [];   // casos importados pelo usuário (JSON)
let caseState = { caseId: null, step: 0, answered: {}, applied: {} };
function allCases() { return clinicalCasesData.concat(userCases); }
function caseProgress() { try { return JSON.parse(localStorage.getItem(CASES_KEY) || '{}'); } catch (e) { return {}; } }
function saveCaseProgress(caseId, stepIdx, ok) {
    try { const p = caseProgress(); p[caseId] = p[caseId] || { answers: {}, lastStep: 0 }; if (ok !== undefined) p[caseId].answers[stepIdx] = ok; p[caseId].lastStep = stepIdx; localStorage.setItem(CASES_KEY, JSON.stringify(p)); } catch (e) {}
}
function loadUserCases() { try { userCases = JSON.parse(localStorage.getItem('neurosim-user-cases-v1') || '[]'); if (!Array.isArray(userCases)) userCases = []; } catch (e) { userCases = []; } }
function storeUserCases() { try { localStorage.setItem('neurosim-user-cases-v1', JSON.stringify(userCases)); } catch (e) {} }
// v12.64: o botao "Remover importados" fazia `userCases = []` num handler inline. Desde a v12.46 `userCases` e' um
// `let` de modulo que a ponte nao expoe; o handler criava um `window.userCases` vazio e o modulo continuava com a
// lista cheia — o botao nao removia nada (auditoria 30/09, 2.4). Quem escreve na lista e' o dono dela.
function limparCasosImportados() { userCases = []; storeUserCases(); renderCasePanel(); }
function toggleCasePanel(force) {
    const p = document.getElementById('casePanel'); if (!p) return;
    const open = force !== undefined ? force : !p.classList.contains('open');
    p.classList.toggle('open', open);
    if (open) { toggleScenesPanel(false); renderCasePanel(); }
}
function openCase(caseId, stepIdx) {
    const c = allCases().find(x => x.id === caseId); if (!c) return;
    caseState = { caseId, step: 0, answered: {}, applied: {} };
    const prog = caseProgress()[caseId];
    caseState.step = Math.min(stepIdx !== undefined ? stepIdx : (prog ? prog.lastStep : 0), c.steps.length - 1);
    toggleCasePanel(true);
    playBioTone(560, 'sine', 0.1, 0.1);
}
function closeCase() { caseState = { caseId: null, step: 0, answered: {}, applied: {} }; renderCasePanel(); }
function caseGo(dir) {
    const c = allCases().find(x => x.id === caseState.caseId); if (!c) return false;
    const next = caseState.step + dir; if (next < 0 || next >= c.steps.length) return false;
    caseState.step = next; saveCaseProgress(c.id, next); renderCasePanel(); return true;
}
function caseApplyStep(auto) {
    const c = allCases().find(x => x.id === caseState.caseId); if (!c) return;
    const st = c.steps[caseState.step]; if (!st) return;
    const wasPresenter = document.body.classList.contains('presenter-mode');
    applyScene({ name: c.title + ' — ' + (caseState.step + 1) + '/' + c.steps.length + ' ' + st.title, note: st.observe || '', state: st.scene || {}, camera: st.camera || null }, { captionMs: wasPresenter ? 0 : 7000 });
    caseState.applied[caseState.step] = true;
    if (!auto) playBioTone(620, 'sine', 0.1, 0.1);
    renderCasePanel();
}
function caseAnswer(i) {
    const c = allCases().find(x => x.id === caseState.caseId); if (!c) return;
    const st = c.steps[caseState.step]; if (!st || !st.question) return;
    caseState.answered[caseState.step] = i;
    saveCaseProgress(c.id, caseState.step, i === st.question.correct);
    renderCasePanel();
}
function renderCasePanel() {
    const p = document.getElementById('casePanel'); if (!p) return;
    const cases = allCases(); const prog = caseProgress();
    const c = cases.find(x => x.id === caseState.caseId);
    if (!c) {
        p.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"><h2 style="font-size: 0.95rem; color: var(--ink-purple); margin: 0;">🩺 Casos clínicos roteirizados</h2><button class="action-btn" style="padding: 2px 8px; font-size: 0.68rem;" onclick="toggleCasePanel(false)">✖</button></div>
            <div style="font-size: 0.68rem; color: var(--text-muted); margin-bottom: 8px;">Cada caso percorre o simulador passo a passo: texto do professor, pergunta antes de revelar, cena aplicada na tela e o que observar. Casos fictícios, para ensino. <b>[</b> e <b>]</b> avançam passos; funciona no Modo Aula.</div>
            ${cases.map(x => { const pr = prog[x.id]; const nQ = x.steps.filter(s => s.question).length; const ok = pr ? Object.values(pr.answers).filter(Boolean).length : 0; return `<div class="scene-row" style="cursor: pointer;" onclick="openCase(${escapeHtml(JSON.stringify(String(x.id)))})">
                <div style="flex: 1; min-width: 0;"><div class="scene-name">${escapeHtml(x.title)} <span style="font-size: 0.62rem; color: var(--text-muted); font-weight: 400;">• ${escapeHtml(x.area)}</span></div>
                <div class="scene-meta">${x.steps.length} passos • ${nQ} perguntas${pr ? ' • ' + ok + '/' + Object.keys(pr.answers).length + ' acertos • parou no passo ' + (pr.lastStep + 1) : ''}</div></div>
                <button class="mini-btn">▶</button></div>`; }).join('')}
            <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
                <button class="mini-btn action-btn" style="padding: 3px 8px;" onclick="exportCasesJSON()">⬇️ Exportar casos (JSON)</button>
                <label class="mini-btn action-btn" style="padding: 3px 8px; cursor: pointer;">⬆️ Importar caso<input type="file" accept="application/json,.json" style="display: none;" onchange="importCasesJSON(this)"></label>
                ${userCases.length ? `<button class="mini-btn action-btn" style="padding: 3px 8px; color: var(--ink-red);" onclick="limparCasosImportados()">🗑️ Remover importados (${userCases.length})</button>` : ''}
            </div>
            <div style="font-size: 0.62rem; color: var(--text-faint); margin-top: 6px;">Para escrever um caso novo: exporte o JSON, copie um caso como modelo e importe. Os campos de "scene" são os mesmos de uma cena salva.</div>`;
        return;
    }
    const st = c.steps[caseState.step]; const idx = caseState.step; const n = c.steps.length;
    const ans = caseState.answered[idx]; const applied = caseState.applied[idx];
    const q = st.question;
    const needAnswer = q && ans === undefined;
    let body = `<div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
            <button class="mini-btn action-btn" style="padding: 2px 8px; font-size: 0.66rem;" onclick="closeCase()">← Casos</button>
            <div style="display: flex; gap: 4px; align-items: center;">${c.steps.map((s2, i) => `<span class="case-step-dot ${i === idx ? 'current' : (caseState.applied[i] ? 'done' : '')}" title="${escapeHtml(s2.title)}" onclick="caseState.step = ${i}; renderCasePanel();"></span>`).join('')}</div>
            <button class="action-btn" style="padding: 2px 8px; font-size: 0.68rem;" onclick="toggleCasePanel(false)">✖</button>
        </div>
        <h2 style="font-size: 0.9rem; color: var(--ink-purple); margin: 8px 0 2px;">${escapeHtml(c.title)} <span style="color: var(--text-muted); font-weight: 400; font-size: 0.7rem;">passo ${idx + 1}/${n}</span></h2>
        ${idx === 0 ? `<div style="font-size: 0.7rem; color: var(--text-soft); margin-bottom: 4px;"><b>Paciente:</b> ${escapeHtml(c.patient)}</div><div style="font-size: 0.66rem; color: var(--text-muted); margin-bottom: 4px;"><b>Objetivo:</b> ${escapeHtml(c.objective)}</div>` : ''}
        <div style="font-weight: 800; color: var(--text-main); margin-top: 4px;">${idx + 1}. ${escapeHtml(st.title)}</div>
        <div class="case-teacher">🎓 ${escapeHtml(st.teacher)}</div>`;
    if (q) {
        body += `<div style="font-size: 0.66rem; font-weight: 800; text-transform: uppercase; color: var(--ink-pink); margin-top: 6px;">🔮 Prever antes de ver</div><div style="margin: 3px 0;">${escapeHtml(q.q)}</div>` +
            q.options.map((op, i) => { let cls = 'poe-option'; if (ans !== undefined) { if (i === q.correct) cls += ' correct'; else if (i === ans) cls += ' wrong'; } return `<button class="${cls}" ${ans !== undefined ? 'disabled' : ''} onclick="caseAnswer(${i})">${String.fromCharCode(65 + i)}. ${escapeHtml(op)}</button>`; }).join('') +
            (ans !== undefined ? `<div style="margin-top: 4px; padding: 6px 8px; border-radius: 8px; background: ${ans === q.correct ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; border: 1px solid ${ans === q.correct ? '#10b981' : '#ef4444'}; font-size: 0.72rem;">${ans === q.correct ? '✅ Correto.' : '❌ Não é essa.'} ${escapeHtml(q.explain)}</div>` : '');
    }
    body += `<div style="display: flex; gap: 6px; margin-top: 8px; align-items: center; flex-wrap: wrap;">
            <button class="action-btn" ${needAnswer ? 'disabled style="opacity: 0.5;"' : 'style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff;"'} onclick="caseApplyStep()">${applied ? '↻ Reaplicar cena' : '▶ Aplicar cena no simulador'}</button>
            ${needAnswer ? '<span style="font-size: 0.66rem; color: var(--text-muted);">responda para liberar</span>' : ''}
        </div>`;
    if (applied && st.observe) body += `<div class="case-observe">👀 <b>Observar:</b> ${escapeHtml(st.observe)}</div>`;
    if (idx === n - 1 && applied) body += `<div style="margin-top: 6px; padding: 8px 10px; border-radius: 8px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.4); font-size: 0.72rem;"><b>Desfecho:</b> ${escapeHtml(c.outcome)}<br><span style="color: var(--text-muted); font-size: 0.64rem;">Referências: ${escapeHtml(c.references)}</span></div>`;
    body += `<div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <button class="mini-btn action-btn" style="padding: 3px 9px;" ${idx === 0 ? 'disabled' : ''} onclick="caseGo(-1)">◀ Anterior [</button>
            <button class="mini-btn action-btn" style="padding: 3px 9px;" ${idx === n - 1 ? 'disabled' : ''} onclick="caseGo(1)">Próximo ] ▶</button>
        </div>`;
    p.innerHTML = body;
}
function exportCasesJSON() {
    const blob = new Blob([JSON.stringify({ app: 'NeuroSim Pro 3D', version: APP_VERSION, exportedAt: new Date().toISOString(), cases: allCases() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'neurosim-casos-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function importCasesJSON(input) {
    const file = input.files && input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            const incoming = Array.isArray(data) ? data : (data.cases || [data]);
            // v12.64: o id vira atributo onclick e chave de progresso — so' entra se for um identificador simples.
            const idSeguro = c => typeof c.id === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(c.id);
            const valid = incoming.filter(c => c && idSeguro(c) && typeof c.title === 'string' && Array.isArray(c.steps) && c.steps.length);
            const recusados = incoming.filter(c => c && c.id && !idSeguro(c));
            if (recusados.length) alert(recusados.length + ' caso(s) recusado(s): o campo "id" deve ter so letras, numeros, ponto, hifen ou sublinhado (ate 64 caracteres).');
            valid.forEach(c => { const i = userCases.findIndex(u => u.id === c.id); if (i >= 0) userCases[i] = c; else if (!clinicalCasesData.find(b => b.id === c.id)) userCases.push(c); });
            storeUserCases(); renderCasePanel();
        } catch (e) { alert('Arquivo de casos inválido.'); }
        input.value = '';
    };
    reader.readAsText(file);
}
loadUserCases();

function showTargetInConnectome(canonId) {
    const circs = (typeof circuitsForTarget === 'function') ? circuitsForTarget(canonId) : [];
    if (!circs.length) return;
    store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.circuitos });
    store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'brain2d' });
    store.dispatch({ type: 'CLEAR_ALL_CIRCUITS' });
    circs.forEach(layer => store.dispatch({ type: 'TOGGLE_CIRCUIT_LAYER', layer: layer }));
    const t = (typeof TARGETS_CANON !== 'undefined' && TARGETS_CANON[canonId]) || null;
    const cap = document.getElementById('sceneCaption');
    if (cap && t) cap.textContent = `${canonId} — ${t.kind}, ${t.coupling}. Acesos: ${circs.length} circuito(s) que nomeiam este alvo.`;
}
// v12.2.1 — caminho de volta: do alvo no conectoma para a farmacoteca, já com os fármacos carregados.
function openTargetFromConnectome(canonId) {
    const quem = (typeof drugsForTarget === 'function') ? drugsForTarget(canonId) : [];
    store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos });
    store.dispatch({ type: 'SET_PHARMA_TAB', tab: 'poly' });
    if (quem.length) {
        store.dispatch({ type: 'CLEAR_POLY_DRUGS' });
        quem.slice(0, 4).forEach(x => store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: x.drug }));
    }
    store.dispatch({ type: 'SELECT_TARGET', targetId: canonId });
}
function toggleColorVisionMode(force) {
    const on = force !== undefined ? force : !document.body.classList.contains('cvd-safe');
    document.body.classList.toggle('cvd-safe', on);
    const b = document.getElementById('btn-cvd'); if (b) b.style.background = on ? 'rgba(245,158,11,0.25)' : '';
    try { localStorage.setItem('neurosim-cvd-safe', on ? '1' : '0'); } catch (e) {}
    if (force === undefined) playBioTone(on ? 640 : 400, 'sine', 0.1, 0.1);
}
(function restoreColorVisionMode() { try { if (localStorage.getItem('neurosim-cvd-safe') === '1') toggleColorVisionMode(true); } catch (e) {} })();

function initEditableCaption() {
    const cap = document.getElementById('sceneCaption'); if (!cap) return;
    cap.title = 'Duplo clique para editar a legenda (Modo Aula)';
    cap.addEventListener('dblclick', () => {
        if (!document.body.classList.contains('presenter-mode')) return;
        cap.setAttribute('contenteditable', 'true'); cap.focus();
        const sel = window.getSelection(); const range = document.createRange(); range.selectNodeContents(cap); range.collapse(false); sel.removeAllRanges(); sel.addRange(range);
    });
    const finish = () => {
        if (cap.getAttribute('contenteditable') !== 'true') return;
        cap.removeAttribute('contenteditable');
        const b = cap.querySelector('b'); const name = b ? b.textContent.replace(/^🎬\s*/, '').trim() : '';
        const note = cap.textContent.replace(b ? b.textContent : '', '').trim();
        if (currentSceneIndex >= 0 && scenes[currentSceneIndex]) { if (name) scenes[currentSceneIndex].name = name; scenes[currentSceneIndex].note = note; storeScenes(); renderScenesList(); }
    };
    cap.addEventListener('blur', finish);
    cap.addEventListener('keydown', (e) => { if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) { e.preventDefault(); cap.blur(); } e.stopPropagation(); });
}

/*
 * v12.13 — modal do índice semiológico. Toda a informação exibida vem de semiologyOccurrences(),
 * que varre a prosa do app; nada aqui é escrito à mão nem inferido.
 */
function openSemiologyModal(termo) {
    const o = document.getElementById('semiologyOverlay');
    if (!o || typeof SEMIOLOGY_TERMS === 'undefined') return;
    o.style.display = 'flex';
    renderSemiology(termo || null);
}
function closeSemiologyModal() { const o = document.getElementById('semiologyOverlay'); if (o) o.style.display = 'none'; }
function renderSemiology(termo) {
    const alvo = document.getElementById('semiologyBody');
    if (!alvo) return;
    const contagem = semiologyCounts();
    const chips = Object.keys(SEMIOLOGY_TERMS).sort((a, b) => contagem[b] - contagem[a]).map(t =>
        `<button class="pill-btn ${t === termo ? 'active' : ''}" style="font-size:0.66rem;margin:0 4px 4px 0;${t === termo ? 'background:#34d399;border-color:var(--ink-emerald);color:#04231a;' : ''}" onclick="renderSemiology('${t.replace(/'/g, "\\'")}')">${escapeHtml(t)} <span style="opacity:.65;">${contagem[t]}</span></button>`).join('');
    let detalhe = `<div style="font-size:0.7rem;color:var(--text-faint);margin-top:10px;">Escolha um termo acima para ver onde o app fala dele.</div>`;
    if (termo) {
        const ocorr = semiologyOccurrences(termo);
        const porBloco = {};
        ocorr.forEach(x => { (porBloco[x.bloco] = porBloco[x.bloco] || []).push(x); });
        detalhe = `<div style="margin-top:10px;border-top:1px solid rgba(148,163,184,0.25);padding-top:8px;">
            <b style="color:var(--ink-emerald);">${escapeHtml(termo)}</b> <span style="color:var(--text-muted);font-size:0.7rem;">— ${ocorr.length} ocorrência(s) no texto do simulador</span>
            ${Object.keys(porBloco).sort().map(b => `<div style="margin-top:8px;">
                <div style="font-size:0.66rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--accent);">${escapeHtml(b)} (${porBloco[b].length})</div>
                ${porBloco[b].map(x => `<div style="margin-top:4px;padding-left:8px;border-left:2px solid rgba(52,211,153,0.4);">
                    <div style="font-size:0.66rem;color:var(--text-muted);">${escapeHtml(x.rotulo)} · campo <code style="color:var(--text-soft);">${escapeHtml(x.campo)}</code></div>
                    <div style="font-size:0.7rem;color:var(--text-strong);">${escapeHtml(x.trecho)}</div>
                </div>`).join('')}
            </div>`).join('')}
        </div>`;
    }
    alvo.innerHTML = `<div>${chips}</div>${detalhe}`;
}

function onRealismBadgeClick() {
    const st = store.getState();
    if ((DOMINIOS[dominioDoModo(st.activeMode)] || {}).biofisica && ['3d', 'cleft2d', 'neuron2d'].includes(st.visualScale)) toggleModelPanel();
    else openSourcesModal();
}

// ==========================================
// 2.4 EXPORTAR PNG (v10.1)
// ==========================================
function exportViewportPNG() {
    const st = store.getState();
    let dataUrl = null;
    try {
        if (st.visualScale === '3d' || st.visualScale === 'brain3d') {
            if (renderer3D && scene3D && camera3D) { renderer3D.render(scene3D, camera3D); dataUrl = renderer3D.domElement.toDataURL('image/png'); }
        } else {
            const id = st.visualScale === 'neuron2d' ? 'neuronCanvas' : (st.visualScale === 'brain2d' ? 'brainCanvas' : 'synapseCanvas');
            const cv = document.getElementById(id);
            if (cv) dataUrl = cv.toDataURL('image/png');
        }
    } catch (e) { console.warn('PNG export:', e); }
    if (!dataUrl) { setScenesStatus('Não foi possível exportar esta tela.'); return; }
    const a = document.createElement('a');
    const label = (currentSceneIndex >= 0 && scenes[currentSceneIndex]) ? scenes[currentSceneIndex].name : ('neurosim-' + st.visualScale + '-' + st.system);
    a.download = label.replace(/[^\w\-]+/g, '_').slice(0, 60) + '.png';
    a.href = dataUrl; document.body.appendChild(a); a.click(); a.remove();
    playBioTone(880, 'sine', 0.08, 0.08);
}

// ==========================================
// 2.5 SELO DE NÍVEL DE REALISMO (v10.1)
// ==========================================
function updateRealismBadge(state) {
    const el = document.getElementById('realismBadge'); if (!el) return;
    let cls = 'schematic', txt = '🧪 Esquema didático';
    if (state.visualScale === 'neuron2d') { cls = 'solved'; txt = '📐 Hodgkin-Huxley resolvido (axônio de lula) • anatomia esquemática'; }
    else if (state.visualScale === 'cleft2d' || state.visualScale === '3d') { cls = ((DOMINIOS[dominioDoModo(state.activeMode)] || {}).biofisica) ? 'solved' : 'schematic'; txt = (state.activeMode === 1) ? '📐 Nernst/GHK e HH resolvidos • fenda esquemática' : '🧪 Fenda esquemática • ocupações por modelo competitivo'; }
    else if (state.visualScale === 'brain2d' || state.visualScale === 'brain3d') {
        // v12.39 (Bloco 4): o selo nomeia a LENTE de Circuitos — fisiologia, fisiopatologia (perfil) ou comparação lado a lado
        const perfil = (state.activePathologyProfile && state.activePathologyProfile !== 'none' && typeof pathologyProfilesData !== 'undefined') ? pathologyProfilesData[state.activePathologyProfile] : null;
        const nomePerfil = perfil ? (perfil.short || perfil.name) : '';
        const lente = (state.dualSubMode === 'physio_vs_patho') ? ' • comparação: sadio × ' + (nomePerfil || 'perfil')
            : (perfil ? ' • fisiopatologia: ' + nomePerfil : ' • fisiologia');
        cls = 'schematic'; txt = '🗺️ Esquema anatômico (não estereotáxico) • vias canônicas' + lente;
    }
    if (state.activeMode === MODO.psicofarmacos) {
        const pList = state.selectedDrugsList || [];
        const hasKi = typeof hasKiData === 'function' && pList.some(k => hasKiData(k));
        if (hasKi) { cls = 'solved'; txt = '📐 Ocupação por Kᵢ (literatura) calibrada por PET • carga 5-HT/QTc heurísticas'; }
        else { cls = 'heuristic'; txt = '🎲 Heurística didática: carga 5-HT e QTc são escores, não medidas'; }
    }
    el.className = cls; el.textContent = txt;
}

// ==========================================
// 2.6 EXPERIMENTOS PREVER–OBSERVAR–EXPLICAR (v10.1)
// ==========================================
const POE_KEY = 'neurosim-poe-v1';
const experiments = [
    { id: 'k_out_high', area: 'Biofísica', title: '[K⁺] extracelular 4,5 → 9 mM',
      question: 'Se o potássio extracelular dobrar (4,5 → 9 mM), o que acontece com o potencial de repouso?',
      options: ['Hiperpolariza (fica mais negativo)', 'Despolariza (fica menos negativo)', 'Não muda: o repouso depende só do Na⁺', 'Inverte de sinal'], correct: 1,
      explain: 'O repouso é dominado pela permeabilidade ao K⁺. Pela equação de Nernst, E_K = 61,5·log([K⁺]o/[K⁺]i): de −93 mV (4,5 mM) para cerca de −74 mV (9 mM). O GHK segue o mesmo caminho e o neurônio despolariza — base da hipercalemia causar arritmia e da despolarização em bloco na isquemia.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao }); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' }); store.dispatch({ type: 'UPDATE_ION_CONCENTRATION', ion: 'Ko', value: 9 }); },
      observe: 'Veja o valor de V_m no osciloscópio e o E_K no painel de Nernst subirem.' },
    { id: 'ttx_ap', area: 'Biofísica', title: 'TTX + disparo de PA',
      question: 'Com tetrodotoxina (bloqueio de Nav1.6) ativa, o que acontece ao apertar "Disparar PA"?',
      options: ['O PA ocorre normalmente, só mais lento', 'O PA ocorre com pico menor', 'Não há PA: a fase de subida depende do Na⁺', 'O PA fica mais longo (sem repolarização)'], correct: 2,
      explain: 'A despolarização rápida do potencial de ação é a corrente de Na⁺ (g_Na·m³h). Com TTX, g_Na ≈ 0 e o estímulo não ultrapassa o limiar — o traço fica plano. É o mecanismo da paralisia por baiacu e o motivo de anestésicos locais (bloqueadores de Nav) abolirem a condução.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neuronio }); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'neuron2d' }); const st = store.getState(); if (!st.activeToxins || !st.activeToxins.ttx) store.dispatch({ type: 'TOGGLE_TOXIN', toxin: 'ttx' }); setTimeout(() => store.dispatch({ type: 'TRIGGER_ACTION_POTENTIAL' }), 400); },
      observe: 'Observe o osciloscópio: nenhuma espícula após o disparo.' },
    { id: 'na_out_low', area: 'Biofísica', title: '[Na⁺] extracelular 145 → 70 mM',
      question: 'Reduzindo o sódio extracelular pela metade, o que muda no potencial de ação?',
      options: ['O pico do PA fica menor (E_Na cai)', 'O repouso hiperpolariza fortemente', 'O PA fica mais alto', 'Nada muda'], correct: 0,
      explain: 'A amplitude do pico aproxima-se de E_Na = 61,5·log([Na⁺]o/[Na⁺]i): de +67 mV (145 mM) para +47 mV (70 mM). O repouso quase não muda porque a permeabilidade ao Na⁺ em repouso é pequena (P_Na/P_K ≈ 0,04). Foi o experimento de Hodgkin & Katz (1949) que provou a hipótese do sódio.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neuronio }); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'neuron2d' }); store.dispatch({ type: 'UPDATE_ION_CONCENTRATION', ion: 'Nao', value: 70 }); setTimeout(() => store.dispatch({ type: 'TRIGGER_ACTION_POTENTIAL' }), 400); },
      observe: 'Compare o pico no osciloscópio com o valor de E_Na no painel.' },
    { id: 'botox_snare', area: 'Biofísica', title: 'Toxina botulínica + disparo de PA',
      question: 'Com a toxina botulínica ativa, o potencial de ação chega ao terminal normalmente. O que acontece com a liberação de neurotransmissor?',
      options: ['Nada muda: o PA é suficiente para liberar', 'A liberação cessa: a vesícula não consegue fundir', 'A liberação aumenta por acúmulo vesicular', 'O PA deixa de ocorrer'], correct: 1,
      explain: 'A botulínica cliva SNAP-25 e sintaxina-1, duas das quatro hélices do zíper SNARE (dossiê 4). O canal de sódio está intacto, o cálcio entra, a sinaptotagmina-1 detecta — mas sem o complexo SNARE completo a membrana vesicular não funde com a pré-sináptica. É o contraste didático com a TTX: a TTX impede o SINAL chegar; a botulínica deixa o sinal chegar e impede a EXOCITOSE. Dois bloqueios em pontos diferentes da mesma cadeia.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao }); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' }); const st = store.getState(); if (!st.activeToxins || !st.activeToxins.botulinum) store.dispatch({ type: 'TOGGLE_TOXIN', toxin: 'botulinum' }); setTimeout(() => store.dispatch({ type: 'TRIGGER_ACTION_POTENTIAL' }), 400); },
      observe: 'O potencial de ação percorre o axônio, mas as vesículas ficam paradas: nenhuma funde na membrana.' },
    { id: 'ptx_gaba', area: 'Sinapse', title: 'Picrotoxina no receptor GABA-A',
      question: 'A picrotoxina bloqueia o poro de Cl⁻ do GABA-A. Qual é a consequência no circuito?',
      options: ['Sedação profunda', 'Hiperexcitabilidade e convulsões (perda da inibição)', 'Hiperpolarização do neurônio pós-sináptico', 'Aumento da liberação de GABA'], correct: 1,
      explain: 'Sem o influxo de Cl⁻, a inibição fásica desaparece e o balanço E/I pende para a excitação: picrotoxina é convulsivante (modelo animal de epilepsia). O oposto — benzodiazepínicos e barbitúricos — aumenta frequência ou tempo de abertura do mesmo poro.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao }); escolherSistema('gaba'); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' }); const st = store.getState(); if (!st.activeToxins || !st.activeToxins.picrotoxin) store.dispatch({ type: 'TOGGLE_TOXIN', toxin: 'picrotoxin' }); },
      observe: 'Na fenda GABA, os receptores ficam bloqueados e o E_Cl deixa de "segurar" a membrana.' },
    { id: 'fluox_clomi', area: 'Polifarmácia', title: 'Fluoxetina + Clomipramina',
      question: 'Ao associar fluoxetina a clomipramina, qual é o risco farmacocinético principal?',
      options: ['A fluoxetina é eliminada mais rápido', 'O nível de clomipramina sobe (inibição de CYP2D6) — cardiotoxicidade e síndrome serotoninérgica', 'Nenhum: são da mesma classe', 'A clomipramina anula a fluoxetina'], correct: 1,
      explain: 'A fluoxetina (e a norfluoxetina, por semanas) inibe potentemente a CYP2D6, principal via da clomipramina e da desmetilclomipramina. Os níveis do tricíclico podem dobrar ou triplicar: QTc, convulsão e toxicidade serotoninérgica somam-se. Se a associação for inevitável, dosar nível sérico e ECG.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos }); store.dispatch({ type: 'CLEAR_POLY_DRUGS' }); ['fluoxetina', 'clomipramina'].forEach(k => { if (drugBindingAffinities[k]) store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: k }); }); },
      observe: 'Leia o card de Interações no Citocromo P450 e a carga serotoninérgica.' },
    { id: 'halo_cloz_d2', area: 'Polifarmácia', title: 'Haloperidol + Clozapina: ocupação D2',
      question: 'Haloperidol 5 mg ocupa ~77% de D2 (PET, Kapur 2000) e clozapina 400 mg ~45%. Juntos, a ocupação combinada é…',
      options: ['≈ 122% (soma)', '≈ 77%: a clozapina não muda nada', 'Entre 77% e 100%: ligação competitiva, nunca soma linear', 'Cai para ~61% (média)'], correct: 2,
      explain: 'Dois ligantes do mesmo receptor competem: a ocupação total é Σx/(1+Σx), onde x = [D]/Kd de cada um. Ela sobe pouco acima da do fármaco dominante (aqui ≈ 81%) e satura em 100%. A soma linear superestima SEP em qualquer combinação — foi exatamente isso que o simulador fazia até a v9.3. Desde a v12.66 os números vêm de Ki × concentração calibrada por PET, na dose em mg.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos }); store.dispatch({ type: 'CLEAR_POLY_DRUGS' }); ['haloperidol', 'clozapina'].forEach(k => store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: k })); },
      observe: 'Veja a barra de D2 no painel de ocupação estimada.' },
    { id: 'citalo_zipra_qtc', area: 'Polifarmácia', title: 'Citalopram 40 mg + Ziprasidona',
      question: 'Qual a conduta mais adequada ao encontrar citalopram 40 mg associado a ziprasidona?',
      options: ['Manter: são de classes diferentes', 'Trocar um dos dois ou reduzir o citalopram; ECG e eletrólitos antes de qualquer titulação', 'Só acrescentar um betabloqueador', 'Trocar o citalopram por metadona'], correct: 1,
      explain: 'Citalopram (dose-dependente, limite de 40 mg — 20 mg em idosos) e ziprasidona (maior prolongamento entre os atípicos) são ambos da lista de risco conhecido de torsades. A combinação de dois agentes de risco é desaconselhada; se inevitável, ECG basal, K⁺/Mg²⁺ normais e revisão de interações que elevem níveis.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos }); store.dispatch({ type: 'CLEAR_POLY_DRUGS' }); ['citalopram', 'ziprasidona'].forEach(k => store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: k })); },
      observe: 'O card de QTc nomeia os dois agentes e classifica como risco alto.' },
    { id: 'fluox_switch', area: 'Cross-tapering', title: 'Trocar fluoxetina por sertralina',
      question: 'Na troca de fluoxetina por sertralina, qual estratégia é correta?',
      options: ['Washout obrigatório de 5 semanas', 'Suspender a fluoxetina e iniciar a sertralina no dia seguinte, atento à inibição residual de CYP2D6', 'Cross-tapering lento de 6 semanas por risco de descontinuação', 'Nunca trocar: são incompatíveis'], correct: 1,
      explain: 'A meia-vida ultralonga da norfluoxetina (1–2 semanas) faz o próprio "desmame" — não há síndrome de descontinuação relevante. O washout de 5 semanas só é obrigatório para IMAO. O cuidado é a inibição residual de CYP2D6 por 4–6 semanas, que eleva substratos como tricíclicos, risperidona e aripiprazol.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos }); openCrossTaperingModal(); const f = document.getElementById('switchDrugFrom'), t = document.getElementById('switchDrugTo'); if (f) f.value = 'fluoxetina'; if (t) t.value = 'sertralina'; updateCrossTaperingCalculations(); },
      observe: 'A calculadora de cross-tapering mostra a estratégia e o alerta de CYP2D6.' },
    { id: 'tph2_limit', area: 'Bioquímica', title: 'Etapa limitante da síntese de serotonina',
      question: 'Qual é a etapa limitante da síntese de serotonina no SNC?',
      options: ['Descarboxilação do 5-HTP pela AADC', 'Hidroxilação do triptofano pela TPH2', 'Empacotamento pelo VMAT2', 'Recaptação pelo SERT'], correct: 1,
      explain: 'A triptofano-hidroxilase 2 (TPH2), dependente de BH4, Fe²⁺ e O₂, é a etapa lenta; a AADC é rápida e não saturada. Por isso a disponibilidade de triptofano (dieta, competição com outros aminoácidos neutros) altera a síntese — base do experimento de depleção aguda de triptofano.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao }); escolherSistema('5ht'); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' }); store.dispatch({ type: 'SET_NEURO_STEP', step: 1 }); },
      observe: 'No card do Passo 1, a tabela do ciclo das indolaminas marca a TPH2 como etapa limitante.' },
    { id: 'carbidopa', area: 'Bioquímica', title: 'Por que a levodopa vem com carbidopa?',
      question: 'Qual enzima a carbidopa/benserazida inibe, e onde?',
      options: ['MAO-B no estriado', 'COMT no fígado', 'AADC (DOPA-descarboxilase) na periferia — não atravessa a barreira hematoencefálica', 'Tirosina-hidroxilase na substância negra'], correct: 2,
      explain: 'A carbidopa inibe a AADC periférica e não cruza a barreira hematoencefálica: mais levodopa chega ao cérebro e menos dopamina periférica causa náusea e hipotensão. A dose de levodopa cai ~75%. A COMT periférica é o alvo do entacapone, complementar.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao }); escolherSistema('da'); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' }); store.dispatch({ type: 'SET_NEURO_STEP', step: 1 }); },
      observe: 'Na tabela das catecolaminas, a etapa 2 (AADC) traz carbidopa e benserazida como alvo.' },
    { id: 'vigabatrin', area: 'Bioquímica', title: 'Vigabatrina e GABA-T',
      question: 'A vigabatrina inibe irreversivelmente a GABA-transaminase. Efeito esperado?',
      options: ['Queda do GABA cerebral', 'Aumento do GABA cerebral — anticonvulsivante (risco de constrição do campo visual)', 'Bloqueio do receptor GABA-A', 'Aumento da recaptação de GABA por GAT-1'], correct: 1,
      explain: 'Bloquear a degradação (GABA-T) eleva o GABA cerebral e reduz crises (espasmos infantis, epilepsia focal refratária); o preço é a retinotoxicidade com constrição concêntrica do campo visual em até 30–40% dos usuários crônicos. A tiagabina age na recaptação (GAT-1), não na degradação.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao }); escolherSistema('gaba'); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' }); store.dispatch({ type: 'SET_NEURO_STEP', step: 6 }); },
      observe: 'No Passo 6 do sistema GABA, a etapa de degradação lista a vigabatrina como alvo.' },
    { id: 'ne_alpha2', area: 'Sistemas', title: 'Guanfacina e o receptor α2A',
      question: 'A guanfacina (agonista α2A) melhora a atenção no TDAH por qual mecanismo pré-frontal?',
      options: ['Aumenta a liberação de NE no locus coeruleus', 'Fecha canais HCN nas espinhas do DLPFC, aumentando a relação sinal/ruído', 'Bloqueia DAT no estriado', 'Ativa receptores β1 no hipocampo'], correct: 1,
      explain: 'No DLPFC, o α2A pós-sináptico reduz cAMP e fecha canais HCN das espinhas dendríticas, fortalecendo a conectividade de rede (Arnsten). A guanfacina age nesse alvo sem o efeito estimulante dopaminérgico; no LC, α2 pré-sináptico reduz o disparo — outro efeito, sedativo.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.circuitos }); store.dispatch({ type: 'CLEAR_ALL_CIRCUITS' }); store.dispatch({ type: 'TOGGLE_CIRCUIT_LAYER', layer: 'norepinephrine' }); store.dispatch({ type: 'SELECT_NUCLEUS', nucleusId: 'pfc' }); },
      observe: 'Sistema noradrenérgico isolado com o DLPFC selecionado: leia no dossiê os receptores α2A e canais HCN.' },
    { id: 'nmda_mg', area: 'Sistemas', title: 'O bloqueio por Mg²⁺ do NMDA',
      question: 'Por que o receptor NMDA é chamado de "detector de coincidência"?',
      options: ['Porque só abre com glutamato, sem outro requisito', 'Porque precisa de glutamato E de despolarização pós-sináptica para expulsar o Mg²⁺ do poro', 'Porque conduz apenas Na⁺', 'Porque é bloqueado pelo GABA'], correct: 1,
      explain: 'Em repouso, o Mg²⁺ obstrui o poro do NMDA; só a despolarização (via AMPA) o expulsa e, com glutamato ligado, o canal conduz Ca²⁺ — o gatilho da LTP. É a base molecular da aprendizagem hebbiana e o ponto de bloqueio da cetamina (dentro do poro, dependente de uso).',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao }); escolherSistema('glu'); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' }); store.dispatch({ type: 'SET_NEURO_STEP', step: 5 }); setTimeout(() => store.dispatch({ type: 'TRIGGER_ACTION_POTENTIAL' }), 500); },
      observe: 'Na fenda glutamatérgica, dispare o PA e veja o receptor abrir; no Passo 5, os dossiês de AMPA e CaMKII.' },
    { id: 'ache_inhib', area: 'Sistemas', title: 'Donepezila e a acetilcolinesterase',
      question: 'Como a donepezila aumenta a transmissão colinérgica?',
      options: ['Bloqueando a recaptação de acetilcolina', 'Inibindo a acetilcolinesterase e prolongando a vida da ACh na fenda', 'Aumentando a síntese pela ChAT', 'Ativando VAChT'], correct: 1,
      explain: 'A acetilcolina é o único transmissor clássico cuja ação termina por hidrólise enzimática, não por recaptação. Inibir a AChE prolonga a ACh em microssegundos→milissegundos. Efeitos adversos colinérgicos (náusea, bradicardia, cãibras) refletem o mesmo mecanismo na periferia.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao }); escolherSistema('ach'); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' }); store.dispatch({ type: 'SET_NEURO_STEP', step: 6 }); },
      observe: 'No Passo 6 do sistema colinérgico, a tabela mostra a AChE como via de término e o CHT1 recaptando colina.' },
    { id: 'thc_tonic', area: 'Sistemas', title: 'THC vs 2-AG',
      question: 'Qual a diferença essencial entre o THC e o endocanabinoide 2-AG?',
      options: ['O THC é mais potente e mais seletivo', 'O 2-AG é sintetizado sob demanda e age de forma fásica e sináptica; o THC ativa CB1 de forma tônica e difusa, dessensibilizando o sistema', 'O 2-AG age em CB2, o THC em CB1', 'Não há diferença funcional'], correct: 1,
      explain: 'O sistema endocanabinoide é um freio retrógrado dependente de atividade. O THC, agonista parcial exógeno, ocupa CB1 em todo o cérebro por horas: perde-se a seletividade sináptica, há tolerância e regulação para baixo de CB1 — base da síndrome amotivacional e do risco de psicose em uso pesado.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao }); escolherSistema('ecb'); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' }); store.dispatch({ type: 'SET_NEURO_STEP', step: 1 }); store.dispatch({ type: 'CLEAR_POLY_DRUGS' }); prescrever('thc'); },
      observe: 'Fenda endocanabinoide com o THC no CB1; no Passo 1, o ciclo mostra a síntese sob demanda (DAGLα) e a degradação por MAGL/FAAH.' },
    { id: 'naloxone', area: 'Sistemas', title: 'Naloxona na overdose',
      question: 'Em uma overdose de opioide, a naloxona reverte a depressão respiratória porque…',
      options: ['Estimula diretamente o centro respiratório', 'É antagonista competitivo de MOR, deslocando o agonista dos receptores do tronco encefálico', 'Acelera o metabolismo hepático do opioide', 'Bloqueia canais GIRK'], correct: 1,
      explain: 'A naloxona compete pelo receptor μ com afinidade alta e sem atividade intrínseca. Meia-vida curta (30–90 min): pode ser necessário repetir com opioides de ação longa (metadona). Em dependentes precipita abstinência aguda — o preço da mesma competição no sistema de recompensa.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos }); store.dispatch({ type: 'CLEAR_POLY_DRUGS' }); ['metadona', 'naltrexona'].forEach(k => store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: k })); },
      observe: 'No motor de polifarmácia, metadona e naltrexona (o antagonista de uso oral e longa duração) lado a lado — leia a nota de QTc da metadona.' },
    { id: 'caffeine_rebound', area: 'Sistemas', title: 'Cafeína e a pressão do sono',
      question: 'A cafeína reduz a sonolência, mas "cobra a conta" horas depois. Por quê?',
      options: ['Porque ela é convertida em adenosina', 'Porque bloqueia A1/A2A sem impedir o acúmulo de adenosina extracelular, que age em bloco quando o antagonista é eliminado', 'Porque esgota a dopamina', 'Porque aumenta a melatonina'], correct: 1,
      explain: 'A adenosina extracelular sobe com as horas de vigília (processo S). A cafeína é antagonista competitivo: mascara o sinal, mas o substrato continua se acumulando. Com a eliminação (t½ ~5 h; maior com anticoncepcionais e na gestação), o sinal acumulado bate de uma vez.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao }); escolherSistema('adenosine'); store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' }); store.dispatch({ type: 'SET_NEURO_STEP', step: 1 }); store.dispatch({ type: 'CLEAR_POLY_DRUGS' }); prescrever('cafeina'); },
      observe: 'Sistema adenosina com a cafeína acoplada; no Passo 1, o ciclo CD39/CD73 e a adenosina-quinase astrocitária.' },
    { id: 'rtms_freq', area: 'Neuroestimulação', title: 'rTMS: 10 Hz ou 1 Hz?',
      question: 'Na depressão, o protocolo padrão de rTMS aplica…',
      options: ['1 Hz no DLPFC esquerdo (inibitório)', '10 Hz (ou iTBS) no DLPFC esquerdo, excitatório, para reverter a hipoatividade pré-frontal', '10 Hz no córtex motor', '1 Hz no cíngulo subgenual'], correct: 1,
      explain: 'A alta frequência (≥5 Hz) e o iTBS são facilitadores (LTP-like); a baixa frequência (1 Hz) é inibitória (LTD-like). Na depressão usa-se 10 Hz/iTBS no DLPFC esquerdo (hipoativo) ou 1 Hz no direito (hiperativo); no TOC, o protocolo aprovado é dTMS 20 Hz em mPFC/ACC.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.circuitos }); store.dispatch({ type: 'SET_PATHOLOGY_PROFILE', profile: 'depression_melancholic' }); store.dispatch({ type: 'SET_NEUROSTIM_PROTOCOL', protocol: 'rtms_10hz_dlpfc' }); },
      observe: 'No conectoma, o DLPFC selecionado com o protocolo de 10 Hz ativo; leia parâmetros (120% MT, 3000 pulsos) e nível de evidência no inspector.' },
    { id: 'dbs_cg25', area: 'Neuroestimulação', title: 'DBS no cíngulo subgenual',
      question: 'Qual é o status de evidência da DBS na área CG25 (Mayberg) para depressão resistente?',
      options: ['Aprovada pelo FDA como primeira linha', 'Experimental: o ensaio multicêntrico BROADEN foi interrompido por futilidade; séries abertas mostram resposta em subgrupos', 'Contraindicada por mortalidade', 'Equivalente à ECT em eficácia'], correct: 1,
      explain: 'A DBS de CG25 é promissora em séries abertas de longo prazo, mas o único ensaio controlado grande (BROADEN, 2017) parou por futilidade na análise interina. Diferente do ALIC no TOC, que tem aprovação humanitária (HDE) do FDA.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.circuitos }); store.dispatch({ type: 'SET_PATHOLOGY_PROFILE', profile: 'depression_melancholic' }); store.dispatch({ type: 'SET_NEUROSTIM_PROTOCOL', protocol: 'dbs_130hz_cg25' }); },
      observe: 'Protocolo DBS 130 Hz em CG25 ativo: o inspector traz o alvo, os parâmetros e a nota sobre o BROADEN.' },
    { id: 'lithium_nsaid', area: 'Polifarmácia', title: 'Lítio + ibuprofeno',
      question: 'Paciente estável com litemia 0,8 começa ibuprofeno para dor lombar. O que esperar?',
      options: ['Nada: o ibuprofeno não interage com o lítio', 'A litemia sobe (AINEs reduzem a depuração renal de lítio) — risco de toxicidade em dias', 'A litemia cai por indução hepática', 'O ibuprofeno perde o efeito'], correct: 1,
      explain: 'O lítio é eliminado quase só por via renal e reabsorvido no túbulo proximal junto com o Na⁺. AINEs (exceto aspirina em dose baixa), IECA/BRA e tiazídicos reduzem a depuração e elevam a litemia em 25–60%. Preferir paracetamol; se inevitável, dosar litemia em 5–7 dias.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos }); store.dispatch({ type: 'CLEAR_POLY_DRUGS' }); store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: 'litio' }); },
      observe: 'No motor de polifarmácia, a linha do lítio lista AINEs, IECA, BRA e tiazídicos como interações críticas apesar de "nenhuma CYP".' },
    { id: 'venla_switch', area: 'Cross-tapering', title: 'Trocar venlafaxina por sertralina',
      question: 'Na troca de venlafaxina 225 mg por sertralina, qual estratégia é adequada?',
      options: ['Suspender a venlafaxina hoje e começar sertralina amanhã', 'Cross-tapering lento em degraus (reduzir 25% a cada 7–10 dias) enquanto a sertralina entra, pelo alto risco de síndrome de descontinuação', 'Washout de 5 semanas', 'Nunca associar as duas, mesmo por dias'], correct: 1,
      explain: 'A venlafaxina tem meia-vida de ~5 h (11 h o metabólito) e dissociação rápida do SERT: parar de vez causa tontura, "choques", náusea e irritabilidade em 1–3 dias. O cross-taper de 4–6 semanas com sobreposição parcial é seguro (ambos serotoninérgicos, mas em doses decrescentes/crescentes).',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos }); openCrossTaperingModal(); const f = document.getElementById('switchDrugFrom'), t = document.getElementById('switchDrugTo'); if (f) f.value = 'venlafaxina'; if (t) t.value = 'sertralina'; updateCrossTaperingCalculations(); },
      observe: 'A calculadora mostra a estratégia em degraus e, no regime posológico, a oscilação enorme da venlafaxina a cada 24 h.' },
    { id: 'parox_tamoxifen', area: 'Polifarmácia', title: 'Paroxetina em quem usa tamoxifeno',
      question: 'Mulher em uso de tamoxifeno para câncer de mama precisa de antidepressivo. Por que evitar paroxetina?',
      options: ['Porque a paroxetina é cardiotóxica', 'Porque inibe potentemente a CYP2D6, que converte o tamoxifeno em endoxifeno (o metabólito ativo), reduzindo a eficácia antitumoral', 'Porque causa hiponatremia', 'Porque prolonga o QTc'], correct: 1,
      explain: 'O tamoxifeno é um pró-fármaco ativado pela CYP2D6. Paroxetina e fluoxetina (inibidores potentes) reduzem os níveis de endoxifeno e associaram-se a maior mortalidade por câncer de mama em coorte (Kelly 2010). Preferir venlafaxina, desvenlafaxina, sertralina em dose baixa, citalopram/escitalopram ou mirtazapina.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos }); store.dispatch({ type: 'CLEAR_POLY_DRUGS' }); store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: 'paroxetina' }); },
      observe: 'A paroxetina sozinha já mostra "CYP2D6 potente" nas interações — é o dado que decide a escolha aqui.' },
    { id: 'bupropion_dat', area: 'Polifarmácia', title: 'Bupropiona: por que não dá euforia?',
      question: 'A bupropiona bloqueia DAT, mas não é uma "anfetamina de receita". Por quê?',
      options: ['Porque não atravessa a barreira hematoencefálica', 'Porque ocupa apenas ~20–25% do DAT em dose terapêutica, com cinética lenta — muito abaixo do limiar de reforço (>50% rápido)', 'Porque é antagonista D2', 'Porque age só no NET'], correct: 1,
      explain: 'Estudos de PET (Learned-Coughlin 2003) mostram ocupação modesta e gradual do DAT; o reforço exige ocupação alta e rápida (cocaína, metilfenidato IV). Isso explica a utilidade no tabagismo e a ausência de potencial de abuso relevante — e por que a dose máxima (450 mg) é limitada por convulsão, não por euforia.',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos }); store.dispatch({ type: 'CLEAR_POLY_DRUGS' }); store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: 'bupropiona' }); store.dispatch({ type: 'SET_PHARMA_TAB', tab: 'classes' }); store.getState().pharmaSearch = 'bupropiona'; renderInspector(); },
      observe: 'Na farmacoteca, a pérola da bupropiona traz a ocupação de ~20–25% do DAT e as contraindicações.' },
    { id: 'fear_circuit', area: 'Circuitos', title: 'Extinção do medo: qual freio?',
      question: 'Na extinção do medo condicionado, qual estrutura inibe a amígdala central para suprimir o congelamento?',
      options: ['Locus coeruleus', 'vmPFC (infralímbico) via células intercaladas (ITC)', 'Habênula lateral', 'Núcleo accumbens'], correct: 1,
      explain: 'O vmPFC/infralímbico ativa as células intercaladas GABAérgicas (ITC), que inibem o núcleo central da amígdala e o output para o PAG (freezing). É o circuito reforçado pela exposição prolongada em TCC e enfraquecido no TEPT (Tovote 2015; LeDoux 2000).',
      apply: () => { store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.circuitos }); store.dispatch({ type: 'CLEAR_ALL_CIRCUITS' }); store.dispatch({ type: 'TOGGLE_CIRCUIT_LAYER', layer: 'fear' }); },
      observe: 'No conectoma 2D, só o circuito do medo fica visível: localize vmPFC → ITC → CeA → PAG.' }
];
let poeCurrent = null, poeChoice = null;
function poeStats() { try { return JSON.parse(localStorage.getItem(POE_KEY) || '{}'); } catch (e) { return {}; } }
function poeRecord(id, ok) { try { const st = poeStats(); st[id] = st[id] || { tries: 0, ok: 0 }; st[id].tries++; if (ok) st[id].ok++; localStorage.setItem(POE_KEY, JSON.stringify(st)); } catch (e) {} }
function openExperimentsModal(id) {
    const o = document.getElementById('poeOverlay'); if (!o) return;
    o.style.display = 'flex';
    if (id) renderExperiment(id); else renderExperimentList();
}
function closeExperimentsModal() { const o = document.getElementById('poeOverlay'); if (o) o.style.display = 'none'; }
function poeProgressSummary() {
    const stats = poeStats();
    const areas = [...new Set(experiments.map(e => e.area))];
    const perArea = areas.map(a => { const list = experiments.filter(e => e.area === a); const done = list.filter(e => stats[e.id]); const tries = done.reduce((n, e) => n + stats[e.id].tries, 0); const ok = done.reduce((n, e) => n + stats[e.id].ok, 0); return { area: a, total: list.length, done: done.length, acc: tries ? Math.round(100 * ok / tries) : null }; });
    const never = experiments.filter(e => !stats[e.id]);
    const weakest = perArea.filter(p => p.acc !== null).sort((a, b) => a.acc - b.acc)[0];
    let next = never[0] || null;
    if (!next && weakest) next = experiments.filter(e => e.area === weakest.area).sort((a, b) => (stats[a.id].ok / stats[a.id].tries) - (stats[b.id].ok / stats[b.id].tries))[0];
    const totalDone = experiments.length - never.length;
    return { perArea, never, next, totalDone, total: experiments.length };
}
function exportExperimentsAnki() {
    // TSV importável no Anki (Arquivo > Importar; campo 1 = frente, campo 2 = verso, campo 3 = etiquetas)
    const esc = (t) => String(t).replace(/\t/g, ' ').replace(/\n/g, '<br>');
    const lines = ['#separator:tab', '#html:true', '#tags column:3'];
    experiments.forEach(e => {
        const front = `<b>${esc(e.question)}</b><br><br>` + e.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${esc(o)}`).join('<br>');
        const back = `<b>${String.fromCharCode(65 + e.correct)}. ${esc(e.options[e.correct])}</b><br><br>${esc(e.explain)}`;
        lines.push(front + '\t' + back + '\t' + 'NeuroSim::' + e.area.replace(/\s+/g, '_'));
    });
    allCases().forEach(c => c.steps.forEach((st, i) => { if (!st.question) return; const q = st.question;
        const front = `<i>${esc(c.title)} — passo ${i + 1}</i><br><b>${esc(q.q)}</b><br><br>` + q.options.map((o, k) => `${String.fromCharCode(65 + k)}. ${esc(o)}`).join('<br>');
        const back = `<b>${String.fromCharCode(65 + q.correct)}. ${esc(q.options[q.correct])}</b><br><br>${esc(q.explain)}`;
        lines.push(front + '\t' + back + '\t' + 'NeuroSim::Casos::' + c.area.replace(/\s+/g, '_')); }));
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'neurosim-anki-' + new Date().toISOString().slice(0, 10) + '.txt';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function renderExperimentList() {
    const card = document.getElementById('poeCard'); if (!card) return;
    const stats = poeStats();
    const prog = poeProgressSummary();
    const areas = [...new Set(experiments.map(e => e.area))];
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <h2 style="font-size: 1rem; color: var(--ink-purple); margin: 0;">🔮 Prever → Observar → Explicar</h2>
            <button class="action-btn" style="padding: 3px 9px;" onclick="closeExperimentsModal()">✖ Fechar</button>
        </div>
        <p style="color: var(--text-muted); font-size: 0.74rem; margin-bottom: 8px;">Escolha um experimento, <b>aposte no resultado antes de ver</b>, e o simulador executa a mudança na tela. Errar aqui é o objetivo: a explicação vem em seguida.</p>
        <div style="background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.35); border-radius: 10px; padding: 8px 10px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                <b style="color: var(--ink-purple); font-size: 0.78rem;">📊 Meu progresso: ${prog.totalDone}/${prog.total} experimentos feitos</b>
                <span style="display: flex; gap: 6px;">
                    ${prog.next ? `<button class="action-btn" style="padding: 3px 9px; font-size: 0.66rem; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff;" onclick="renderExperiment('${prog.next.id}')">▶ Sugerido: ${escapeHtml(prog.next.title)}</button>` : ''}
                    <button class="action-btn" style="padding: 3px 9px; font-size: 0.66rem;" onclick="exportExperimentsAnki()" title="Exporta as perguntas (experimentos + casos) como baralho para o Anki">🃏 Anki</button>
                </span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
                ${prog.perArea.map(p => `<span style="font-size: 0.64rem; padding: 2px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: var(--lift-04);">${escapeHtml(p.area)} <b>${p.done}/${p.total}</b>${p.acc !== null ? ` • <span style="color: ${p.acc >= 70 ? '#34d399' : (p.acc >= 40 ? '#fbbf24' : '#f87171')};">${p.acc}%</span>` : ''}</span>`).join('')}
            </div>
        </div>
        ${areas.map(a => `<div style="font-size: 0.7rem; font-weight: 800; color: var(--accent); margin: 10px 0 4px; text-transform: uppercase;">${a}</div>` +
            experiments.filter(e => e.area === a).map(e => { const st = stats[e.id]; return `<button class="poe-option" onclick="renderExperiment('${e.id}')"><b>${e.title}</b><span style="float: right; font-size: 0.66rem; color: var(--text-muted);">${st ? (st.ok + '/' + st.tries + ' acertos') : 'ainda não feito'}</span><br><span style="color: var(--text-soft);">${e.question}</span></button>`; }).join('')).join('')}`;
}
function renderExperiment(id) {
    const e = experiments.find(x => x.id === id); if (!e) return;
    poeCurrent = e; poeChoice = null;
    const card = document.getElementById('poeCard'); if (!card) return;
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <button class="action-btn" style="padding: 3px 9px;" onclick="renderExperimentList()">← Lista</button>
            <button class="action-btn" style="padding: 3px 9px;" onclick="closeExperimentsModal()">✖</button>
        </div>
        <div style="font-size: 0.68rem; color: var(--accent); font-weight: 800; text-transform: uppercase;">${e.area} • Passo 1 de 3: Prever</div>
        <h2 style="font-size: 1rem; color: var(--text-main); margin: 4px 0 10px;">${e.question}</h2>
        ${e.options.map((op, i) => `<button class="poe-option" id="poeOpt${i}" onclick="poeChoose(${i})">${String.fromCharCode(65 + i)}. ${op}</button>`).join('')}
        <div style="display: flex; gap: 8px; margin-top: 12px; align-items: center;">
            <button class="action-btn" id="poeRunBtn" disabled style="opacity: 0.5; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff;" onclick="poeRun()">▶ Executar no simulador (Observar)</button>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Escolha uma alternativa para liberar.</span>
        </div>`;
}
function poeChoose(i) {
    poeChoice = i;
    document.querySelectorAll('#poeCard .poe-option').forEach((b, idx) => b.classList.toggle('chosen', idx === i));
    const btn = document.getElementById('poeRunBtn'); if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
}
function poeRun() {
    if (!poeCurrent || poeChoice === null) return;
    const e = poeCurrent, ok = poeChoice === e.correct;
    poeRecord(e.id, ok);
    closeExperimentsModal();
    try { e.apply(); } catch (err) { console.warn('experimento:', err); }
    const r = document.getElementById('poeResult'); if (!r) return;
    r.innerHTML = `
        <div style="font-size: 0.66rem; font-weight: 800; text-transform: uppercase; color: var(--accent);">Passo 2 de 3: Observar</div>
        <div style="margin: 3px 0 8px;">👀 ${e.observe}</div>
        <div style="font-size: 0.66rem; font-weight: 800; text-transform: uppercase; color: var(--accent);">Passo 3 de 3: Explicar</div>
        <div style="margin-top: 3px; padding: 6px 8px; border-radius: 8px; background: ${ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; border: 1px solid ${ok ? '#10b981' : '#ef4444'};">
            ${ok ? '✅ Você previu corretamente' : '❌ Sua previsão: <i>' + e.options[poeChoice] + '</i>'}<br><b>Resposta:</b> ${e.options[e.correct]}
        </div>
        <div style="margin-top: 8px; color: var(--text-soft);">${e.explain}</div>
        <div style="display: flex; gap: 6px; margin-top: 10px;">
            <button class="action-btn" style="padding: 3px 9px; font-size: 0.68rem;" onclick="openExperimentsModal()">🔮 Outro experimento</button>
            <button class="action-btn" style="padding: 3px 9px; font-size: 0.68rem;" onclick="document.getElementById('poeResult').style.display = 'none'">Fechar</button>
        </div>`;
    r.style.display = 'block';
}

function triggerHaptic(durationMs = 20) {
    if ('vibrate' in navigator) {
        try { navigator.vibrate(durationMs); } catch(e) {}
    }
}

// v12.6 — registro de efeitos no store. O store declara de que precisa; cada módulo entrega o seu.
// Sem isto o efeito simplesmente não ocorre (o padrão é não fazer nada), em vez de lançar ReferenceError.
if (typeof registerEffect === 'function') {
    registerEffect('haptic', triggerHaptic);
}

// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { allCases, applySceneFromHash, cameraByScale, cameraOrbit, cameraTween, caseAnswer, caseApplyStep, caseGo,
    caseState, closeCase, closeExperimentsModal, closeSemiologyModal, copySceneLink, definirCameraTween,
    definirLastVisualScale3D, definirPresenterHintTimer, deleteSceneAt, describeScene, escapeHtml, experiments,
    exportCasesJSON, exportExperimentsAnki, exportScenesJSON, exportViewportPNG, finishRenameScene, flyToPreset,
    importCasesJSON, importScenesJSON, initEditableCaption, lastVisualScale3D, limparCasosImportados, loadSceneAt,
    moveScene, onRealismBadgeClick, openCase, openExperimentsModal, openSemiologyModal, openTargetFromConnectome,
    persistSession, playlistStep, playlistToggle, poeChoose, poeRun, presenterHintTimer, renderCasePanel,
    renderExperiment, renderExperimentList, renderScenesList, renderSemiology, restorePlaylistPrefs, restoreSession,
    saveCurrentScene, savePlaylistPrefs, scenes, showTargetInConnectome, startRenameScene, storeScenes,
    toggleCameraOrbit, toggleCasePanel, toggleColorVisionMode, togglePresenterMode, toggleScenesPanel,
    updateCameraOrbit, updateCameraTween, updateRealismBadge, updateSceneAt };
// ── fim do exporta ──
