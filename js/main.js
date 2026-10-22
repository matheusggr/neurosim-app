// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import './render2d.js?v=12.66.1';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { TARGETS_CANON } from './targets.js?v=12.66.1';
import { APP_BUILD_LABEL, APP_VERSION, ESCALAS_DE_PROJECAO, MODO, renderReferencesList } from './data.js?v=12.66.1';
import { patientStoriesData } from './dominios/psicoeducacao.js?v=12.66.1';
import { recalculateElectrophysiology, toggleModelPanel, updateOscilloscope } from './dominios/neuronio.js?v=12.66.1';
import {
    antidepressantsData, antipsychoticsData, closeCrossTaperingModal, drugBindingAffinities, drugsForTarget,
    modeledTargetIds, moodAndAnxioData, openCrossTaperingModal, prescrever
} from './dominios/psicofarmacos.js?v=12.66.1';
import {
    definirHoveredSynapseComponent, dossierByStep, molecularAdvancesData, onSynapseCanvasClick,
    onSynapseCanvasMouseMove
} from './dominios/neurotransmissao.js?v=12.66.1';
import {
    canonicalSubTractsData, hideConnectomeTooltip, neurostimProtocolsData, nucleiClinicalData, onBrainCanvasClick,
    onBrainCanvasMouseMove, pathologyProfilesData
} from './dominios/circuitos.js?v=12.66.1';
import { store } from './store.js?v=12.66.1';
import {
    allCases, applySceneFromHash, cameraByScale, caseApplyStep, caseGo, caseState, closeExperimentsModal,
    definirLastVisualScale3D, definirPresenterHintTimer, describeScene, escapeHtml, experiments, exportViewportPNG,
    initEditableCaption, loadSceneAt, openCase, openExperimentsModal, playlistStep, playlistToggle,
    presenterHintTimer, renderScenesList, restorePlaylistPrefs, restoreSession, scenes, toggleCameraOrbit,
    toggleCasePanel, togglePresenterMode, toggleScenesPanel
} from './features.js?v=12.66.1';
import { toggleColorTheme, toggleSound } from './engine.js?v=12.66.1';
import { renderUI } from './ui.js?v=12.66.1';
import { camera3D, init3D, renderer3D } from './render3d.js?v=12.66.1';
import { masterRenderLoop, toggleRenderPaused } from './render2d.js?v=12.66.1';
import { instalarPonte } from './ponte.js?v=12.66.1';
instalarPonte();   // o window recebe o que os handlers inline e os checks chamam pelo nome
// ── fim dos módulos ──

        // PWA Service Worker Registration
// Restaura a sessão anterior (se houver) e sincroniza versão na UI
restoreSession();
// v12.65: os potenciais de reversao do HH acompanham os ions do estado DESDE A CARGA. Ate a v12.64 so' o primeiro
// toque num slider ionico chamava recalculateElectrophysiology(); ao abrir, o solver ficava com os E's de fabrica
// (ENa 50 / EK -77) enquanto o cartao mostrava ENa +66,6 e GHK -71,4 (auditoria 30/09, 2.2).
recalculateElectrophysiology();
(function syncVersionUI() {
    const b = document.getElementById('appVersionBadge');
    if (b) b.textContent = 'v' + APP_VERSION;
    const f = document.getElementById('footer-version');
    if (f) f.textContent = 'NeuroSim Pro 3D • v' + APP_VERSION + ' (' + APP_BUILD_LABEL + ')';
    document.title = 'NeuroSim Pro 3D v' + APP_VERSION + ': Simulador de Neurotransmissão & Psicofarmacologia';
})();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js?v=' + APP_VERSION)
            .then((reg) => console.log('[PWA] Service Worker registrado com sucesso:', reg.scope))
            .catch((err) => console.warn('[PWA] Falha no registro do Service Worker:', err));
    });
}

// v12.47.1: estes tres ouvintes da fenda 2D moravam DENTRO do registro do service worker acima — escritos na coluna
// zero, mas em profundidade tres. Passar o mouse e clicar nos componentes da fenda dependia de o navegador ter
// service worker e de o evento `load` ter passado. Agora sao de topo, como sempre pareceram ser.
const synCv = document.getElementById('synapseCanvas');
if (synCv) {
    synCv.addEventListener('mousemove', onSynapseCanvasMouseMove);
    synCv.addEventListener('click', onSynapseCanvasClick);
    synCv.addEventListener('mouseleave', () => { definirHoveredSynapseComponent(null); });
}

// ==========================================
// 13.6 SPOTLIGHT SEARCH (Ctrl+K) & HOTKEYS
// ==========================================
let spotlightSelectedIndex = 0;
let spotlightFilteredItems = [];

function getSpotlightIndex() {
    const items = [];
    // Fármacos (base de polifarmácia)
    for (const k in drugBindingAffinities) {
        const d = drugBindingAffinities[k];
        items.push({ type: 'drug', id: k, title: d.name, subtitle: (d.class || '') + (d.target ? ' | Alvo: ' + d.target : '') + (d.cyp_substrates ? ' | ' + d.cyp_substrates[0] : ''), icon: '💊', badgeColor: '#a855f7' });
    }
    // Alvos canônicos modelados (v12.2a) — busca por receptor/transportador/enzima
    if (typeof modeledTargetIds === 'function' && typeof TARGETS_CANON !== 'undefined') {
        modeledTargetIds().forEach(id => {
            const t = TARGETS_CANON[id] || {};
            const n = (typeof drugsForTarget === 'function') ? drugsForTarget(id).length : 0;
            items.push({ type: 'target', id: id, title: id, subtitle: (t.kind || 'alvo') + ' · ' + (t.coupling || '') + ' | ' + n + ' fármaco' + (n === 1 ? '' : 's'), icon: '🎯', badgeColor: '#14b8a6' });
        });
    }
    // Núcleos anatômicos
    for (const k in nucleiClinicalData) {
        const n = nucleiClinicalData[k];
        items.push({ type: 'nucleus', id: k, title: n.name, subtitle: (n.class || '') + (n.receptors ? ' | ' + n.receptors.slice(0, 80) : ''), icon: '🧠', badgeColor: '#38bdf8' });
    }
    // Circuitos e sub-vias
    for (const k in canonicalSubTractsData) {
        const sysT = canonicalSubTractsData[k];
        items.push({ type: 'circuit', id: k, title: sysT.name, subtitle: (sysT.items || []).length + ' sub-vias', icon: '⚡', badgeColor: '#facc15' });
        (sysT.items || []).forEach(sub => items.push({ type: 'subtract', id: sub.id, systemKey: k, title: sub.name, subtitle: sub.desc || '', icon: '↳', badgeColor: '#fde68a' }));
    }
    // Patologias
    for (const k in pathologyProfilesData) {
        if (k === 'none') continue;
        const p = pathologyProfilesData[k];
        items.push({ type: 'pathology', id: k, title: p.name, subtitle: (p.fisiopatologia || '').slice(0, 100), icon: '🩺', badgeColor: '#ef4444' });
    }
    // Neuroestimulação
    for (const k in neurostimProtocolsData) {
        if (k === 'off') continue;
        const ns = neurostimProtocolsData[k];
        items.push({ type: 'neurostim', id: k, title: ns.name, subtitle: (ns.indication || '').slice(0, 100), icon: '🧲', badgeColor: '#10b981' });
    }
    // Dossiês moleculares
    molecularAdvancesData.forEach(d => items.push({ type: 'dossier', id: d.id, title: d.title, subtitle: d.category + ' — ' + d.desc.slice(0, 90), icon: '📚', badgeColor: '#fbbf24' }));
    // Farmacoteca por classe (fármacos sem perfil de ocupação)
    Object.values(antidepressantsData).concat(Object.values(antipsychoticsData)).forEach(c => c.drugs.forEach(d => { if (!drugBindingAffinities[d.id]) items.push({ type: 'classdrug', id: d.id, title: d.name, subtitle: (c.className || '') + ' | ' + d.target, icon: '📖', badgeColor: '#f472b6' }); }));
    moodAndAnxioData.stabilizers.concat(moodAndAnxioData.anxiolytics).forEach(d => { if (!drugBindingAffinities[d.id]) items.push({ type: 'classdrug', id: d.id, title: d.name, subtitle: d.target, icon: '📖', badgeColor: '#34d399' }); });
    // Roteiros de psicoeducação
    for (const k in patientStoriesData) {
        items.push({ type: 'story', id: k, title: patientStoriesData[k].title, subtitle: patientStoriesData[k].metaphor || '', icon: '🩺', badgeColor: '#c084fc' });
    }
    // Casos clínicos
    allCases().forEach(c => items.push({ type: 'case', id: c.id, title: '🩺 ' + c.title, subtitle: c.area + ' — ' + c.patient.slice(0, 90), icon: '🩺', badgeColor: '#c084fc' }));
    // Experimentos e cenas
    experiments.forEach(e => items.push({ type: 'experiment', id: e.id, title: '🔮 ' + e.title, subtitle: e.question, icon: '🔮', badgeColor: '#f472b6' }));
    scenes.forEach((sc, i) => items.push({ type: 'scene', id: i, title: '🎬 ' + sc.name, subtitle: describeScene(sc), icon: '🎬', badgeColor: '#38bdf8' }));
    return items;
}

function onSpotlightOverlayClick(e) {
    if (e.target && e.target.id === 'spotlightOverlay') closeSpotlightModal();
}

function openSourcesModal() {
    const o = document.getElementById('sourcesOverlay');
    if (o) { renderReferencesList(); o.style.display = 'flex'; }
}
function closeSourcesModal() {
    const o = document.getElementById('sourcesOverlay');
    if (o) o.style.display = 'none';
}
function dismissDisclaimer() {
    const d = document.getElementById('eduDisclaimer');
    if (d) d.style.display = 'none';
    try { localStorage.setItem('neurosim-disclaimer-ack', APP_VERSION); } catch (e) {}
}
function initDisclaimer() {
    let ack = null;
    try { ack = localStorage.getItem('neurosim-disclaimer-ack'); } catch (e) {}
    const d = document.getElementById('eduDisclaimer');
    if (d && ack !== APP_VERSION) d.style.display = 'flex';
}

function openSpotlightModal() {
    const overlay = document.getElementById('spotlightOverlay');
    const input = document.getElementById('spotlightInput');
    if (overlay && input) {
        overlay.style.display = 'flex';
        input.value = '';
        spotlightSelectedIndex = 0;
        onSpotlightSearch('');
        setTimeout(() => input.focus(), 50);
    }
}

function closeSpotlightModal() {
    const overlay = document.getElementById('spotlightOverlay');
    if (overlay) overlay.style.display = 'none';
}

function onSpotlightSearch(query) {
    const q = (query || '').toLowerCase().trim();
    const all = getSpotlightIndex();
    spotlightFilteredItems = q ? all.filter(it => String(it.title).toLowerCase().includes(q) || String(it.subtitle || '').toLowerCase().includes(q) || String(it.id).toLowerCase().includes(q)).slice(0, 40) : all.slice(0, 15);
    spotlightSelectedIndex = 0;
    renderSpotlightResults();
}

// v12.64: titulo e subtitulo passam por escapeHtml — nomes de cena e titulo/area/paciente de caso vem de JSON
// importado ou de link (#cena=). A cena e' a excecao no subtitulo porque describeScene ja devolve escapado.
function renderSpotlightResults() {
    const container = document.getElementById('spotlightResults');
    if (!container) return;
    if (spotlightFilteredItems.length === 0) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-faint); font-size: 0.85rem;">Nenhum resultado encontrado para esta busca.</div>';
        return;
    }

    container.innerHTML = spotlightFilteredItems.map((item, idx) => {
        const isSel = idx === spotlightSelectedIndex;
        return `
            <div style="padding: 10px 14px; border-radius: 8px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: ${isSel ? 'rgba(56,189,248,0.15)' : 'transparent'}; border: 1px solid ${isSel ? 'rgba(56,189,248,0.4)' : 'transparent'};" onclick="selectSpotlightItem(${idx})">
                <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                    <span style="font-size: 1.1rem;">${item.icon}</span>
                    <div style="overflow: hidden;">
                        <div style="font-size: 0.88rem; font-weight: 700; color: ${isSel ? 'var(--accent)' : 'var(--text-main)'}; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${escapeHtml(item.title)}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${item.type === 'scene' ? item.subtitle : escapeHtml(item.subtitle)}</div>
                    </div>
                </div>
                <span class="ink" style="font-size: 0.68rem; font-weight: 700; --cor: ${item.badgeColor}; background: var(--lift-06); padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${item.type}</span>
            </div>
        `;
    }).join('');
}

function onSpotlightKeyDown(e) {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        spotlightSelectedIndex = (spotlightSelectedIndex + 1) % Math.max(1, spotlightFilteredItems.length);
        renderSpotlightResults();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        spotlightSelectedIndex = (spotlightSelectedIndex - 1 + spotlightFilteredItems.length) % Math.max(1, spotlightFilteredItems.length);
        renderSpotlightResults();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (spotlightFilteredItems[spotlightSelectedIndex]) {
            selectSpotlightItem(spotlightSelectedIndex);
        }
    } else if (e.key === 'Escape') {
        closeSpotlightModal();
    }
}

function selectSpotlightItem(idx) {
    const item = spotlightFilteredItems[idx];
    if (!item) return;
    closeSpotlightModal();
    if (item.type === 'drug') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos });
        const st = store.getState();
        if (!(st.selectedDrugsList || []).includes(item.id)) store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: item.id });
        prescrever(item.id);   // v12.40: acoplar = prescrever, na mesma lista (decisao 11)
    } else if (item.type === 'target') {
        // v12.2a: abre a polifarmácia com todos os fármacos que tocam o alvo já carregados
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos });
        store.dispatch({ type: 'SET_PHARMA_TAB', tab: 'poly' });
        const quem = (typeof drugsForTarget === 'function') ? drugsForTarget(item.id) : [];
        if (quem.length) {
            store.dispatch({ type: 'CLEAR_POLY_DRUGS' });
            quem.slice(0, 4).forEach(x => store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: x.drug }));
        }
        store.dispatch({ type: 'SELECT_TARGET', targetId: item.id });
    } else if (item.type === 'nucleus') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.circuitos });
        store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'brain2d' });
        store.dispatch({ type: 'SELECT_NUCLEUS', nucleusId: item.id });
    } else if (item.type === 'circuit') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.circuitos });
        store.dispatch({ type: 'CLEAR_ALL_CIRCUITS' });
        store.dispatch({ type: 'TOGGLE_CIRCUIT_LAYER', layer: item.id });
    } else if (item.type === 'subtract') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.circuitos });
        store.dispatch({ type: 'CLEAR_ALL_CIRCUITS' });
        store.dispatch({ type: 'TOGGLE_SUB_TRACT', subId: item.id, systemKey: item.systemKey });
    } else if (item.type === 'pathology') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.circuitos });
        store.dispatch({ type: 'SET_PATHOLOGY_PROFILE', profile: item.id });
    } else if (item.type === 'neurostim') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.circuitos });
        store.dispatch({ type: 'SET_NEUROSTIM_PROTOCOL', protocol: item.id });
    } else if (item.type === 'dossier') {
        const stepOf = Object.keys(dossierByStep).find(st => dossierByStep[st].includes(item.id)) || 5;
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.neurotransmissao });
        store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' });
        store.dispatch({ type: 'SET_NEURO_STEP', step: Number(stepOf) });
    } else if (item.type === 'classdrug') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos });
        store.getState().pharmaSearch = item.title;
        store.dispatch({ type: 'SET_PHARMA_TAB', tab: 'classes' });
    } else if (item.type === 'story') {
        store.dispatch({ type: 'TOGGLE_PSICOEDUCACAO', aberta: true });   // v12.37: a Psicoeducacao e painel, nao modo
        store.dispatch({ type: 'SET_PATIENT_STORY', story: item.id });
    } else if (item.type === 'case') {
        openCase(item.id, 0);
    } else if (item.type === 'experiment') {
        openExperimentsModal(item.id);
    } else if (item.type === 'scene') {
        loadSceneAt(item.id);
    }
}

// Global Keyboard Hotkeys Listener
window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || (document.activeElement && document.activeElement.isContentEditable)) {
        if (e.key === 'Escape') {
            closeSpotlightModal();
            closeCrossTaperingModal();
            closeSourcesModal();
            closeExperimentsModal();
        }
        return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openSpotlightModal();
        return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        // v12.33: desfaz o "Limpar" do conectoma — 25 camadas num clique, no meio de uma aula (Fase 3.2)
        if (store.getState().desfazerLimpeza) { e.preventDefault(); store.dispatch({ type: 'UNDO_CLEAR_CIRCUITS' }); }
        return;
    }

    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        store.dispatch({ type: 'TRIGGER_ACTION_POTENTIAL' });
    } else if (e.key === '1') {
        store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'cleft2d' });
    } else if (e.key === '2') {
        store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'neuron2d' });
    } else if (e.key === '3') {
        store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'brain2d' });
    } else if (e.key === '4') {
        store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'brain3d' });
    } else if (e.key === '5') {
        // v12.31: era 'dual', escala que nenhum renderizador conhece desde antes da v12.0 — a tecla
        // apagava TODAS as superfícies da cena. A quinta escala da doca é a Fenda 3D.
        store.dispatch({ type: 'SET_VISUAL_SCALE', scale: '3d' });
    } else if (e.key === 'd' || e.key === 'D') {
        toggleColorTheme();   // v12.31: o MESMO caminho do botão — o despacho direto não atualizava o rótulo do botão
    } else if (e.key === 'm' || e.key === 'M') {
        toggleSound();        // v12.31: prometido no tooltip do botão desde a v10; nunca teve ramo no teclado
    } else if (e.key === 't' || e.key === 'T') {
        // v12.7 — congela/descongela o laço de renderização (travar).
        e.preventDefault();
        if (typeof toggleRenderPaused === 'function') toggleRenderPaused();
    } else if (e.key === 'p' || e.key === 'P') {
        openCrossTaperingModal();
    } else if (e.key === 'c' || e.key === 'C') {
        toggleScenesPanel();
    } else if (e.key === 'f' || e.key === 'F') {
        togglePresenterMode();
    } else if ((e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_') && document.body.classList.contains('presenter-mode')) {
        // v12.53 (D5, controle): + e - trocam o tamanho da projecao SEM sair do Modo Aula. So' aqui: fora da aula o
        // fator e 1 e nao ha o que aumentar. O aviso reaparece para dizer em quanto ficou.
        e.preventDefault();
        const niveis = ESCALAS_DE_PROJECAO;
        const atual = niveis.indexOf(store.getState().escalaProjecao);
        const passo = (e.key === '+' || e.key === '=') ? 1 : -1;
        const novo = niveis[Math.min(niveis.length - 1, Math.max(0, (atual < 0 ? 1 : atual) + passo))];
        store.dispatch({ type: 'SET_ESCALA_PROJECAO', escala: novo });
        const aviso = document.getElementById('presenterHint');
        if (aviso) { aviso.classList.remove('faded'); clearTimeout(presenterHintTimer); definirPresenterHintTimer(setTimeout(() => aviso.classList.add('faded'), 2600)); }
    } else if ((e.key === 'h' || e.key === 'H') && document.body.classList.contains('presenter-mode')) {
        document.body.classList.toggle('hide-controls');
    } else if (e.key === 'e' || e.key === 'E') {
        openExperimentsModal();
    } else if (e.key === 'i' || e.key === 'I') {
        exportViewportPNG();
    } else if (e.key === 'q' || e.key === 'Q') {
        toggleModelPanel();
    } else if (e.key === 'o' || e.key === 'O') {
        toggleCameraOrbit();
    } else if (e.key === 'k' || e.key === 'K') {
        toggleCasePanel();
    } else if (e.key === '[') {
        if (caseState.caseId && document.getElementById('casePanel').classList.contains('open')) caseGo(-1); else playlistStep(-1);
    } else if (e.key === ']') {
        if (caseState.caseId && document.getElementById('casePanel').classList.contains('open')) { if (!caseState.applied[caseState.step] && !(allCases().find(x => x.id === caseState.caseId).steps[caseState.step].question && caseState.answered[caseState.step] === undefined)) caseApplyStep(true); else caseGo(1); } else playlistStep(1);
    } else if (e.key === '\\') {
        playlistToggle();
    } else if (e.key === 'Escape') {
        const anyModal = ['spotlightOverlay', 'crossTaperingOverlay', 'sourcesOverlay', 'poeOverlay'].some(id => { const el = document.getElementById(id); return el && el.style.display === 'flex'; });
        closeSpotlightModal();
        closeCrossTaperingModal();
        closeSourcesModal();
        closeExperimentsModal();
        if (!anyModal && document.body.classList.contains('presenter-mode')) togglePresenterMode(false);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    initDisclaimer();
    renderUI();
    try {
        init3D();
    } catch (e) {
        console.warn("WebGL initialization note:", e);
    }

    const brainC = document.getElementById('brainCanvas');
    if (brainC) {
        brainC.addEventListener('mousemove', onBrainCanvasMouseMove);
        brainC.addEventListener('mouseleave', hideConnectomeTooltip);
        brainC.addEventListener('click', onBrainCanvasClick);   // v12.43 (D10): o conectoma 2D ganha clique — seleciona e fixa o tooltip
    }

    const synC = document.getElementById('synapseCanvas');
    if (synC) {
        synC.addEventListener('click', onSynapseCanvasClick);
    }
    const t3c = document.getElementById('threejs-container');
    if (t3c) t3c.addEventListener('mouseleave', hideConnectomeTooltip);

    if (typeof THREE !== 'undefined') {
        cameraByScale['3d'] = { pos: new THREE.Vector3(0, 12, 36), target: new THREE.Vector3(0, 0, 0) };
        cameraByScale['brain3d'] = { pos: new THREE.Vector3(0, 16, 46), target: new THREE.Vector3(0, 0, 0) };
        definirLastVisualScale3D(store.getState().visualScale);
    }
    masterRenderLoop();
    setInterval(updateOscilloscope, 50);

    // Cenas (v10): preferências da playlist e cena vinda por link
    initEditableCaption();
    restorePlaylistPrefs();
    renderScenesList();
    if (applySceneFromHash()) toggleScenesPanel(false);
});

window.addEventListener('resize', () => {
    const container = document.getElementById('threejs-container');
    if (container && camera3D && renderer3D) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera3D.aspect = w / h;
        camera3D.updateProjectionMatrix();
        renderer3D.setSize(w, h);
    }
});

// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { closeSourcesModal, closeSpotlightModal, dismissDisclaimer, onSpotlightKeyDown, onSpotlightOverlayClick,
    onSpotlightSearch, openSourcesModal, openSpotlightModal, selectSpotlightItem };
// ── fim do exporta ──
