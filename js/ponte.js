// GERADO por scripts/mapa-modulos.mjs --escrever — NÃO EDITE À MÃO.
// A PONTE (D1, v12.46): os nove arquivos são módulos ES e nada deles é global. Os handlers inline do HTML e dos
// templates (onclick="…") e os scripts de verificação (page.evaluate) chamam pelo nome — este arquivo expõe no
// window exatamente esses 105 nomes, e só eles. A lista vem de data/modulos.json (ponte.handlers + ponte.checks).
// Quem cria um handler inline novo roda `node scripts/mapa-modulos.mjs --escrever`; a trava em tests/modulos.test.ts cobra.

import {
    APP_VERSION, DOMINIOS, LEITURAS_CRUZADAS, MODO, SOURCES, ehCamadaDeSistema, semiologyCounts, systemsData
} from './data.js?v=12.76.2';
import { exportPatientStory } from './dominios/psicoeducacao.js?v=12.76.2';
import {
    resetHHParams, setHHParam, setIzhikevichCurrent, setIzhikevichType, toggleModelPanel
} from './dominios/neuronio.js?v=12.76.2';
import {
    KI_RECEPTORS, closeCrossTaperingModal, desprescreverSistema, drugBindingAffinities, drugTargetsExtra,
    onCrossTaperingOverlayClick, openCrossTaperingModal, pkPresetFromDrug, updateCrossTaperingCalculations,
    updateDosingRegimen
} from './dominios/psicofarmacos.js?v=12.76.2';
import {
    dossierTargets, escolherSistema, ionParticles3D, molecularAdvancesData
} from './dominios/neurotransmissao.js?v=12.76.2';
import {
    CIRCUIT_LAYER_UI, brainCircuitsData, canonicalSubTractsData, circuitTargets, drawBrainCircuits2D, nuclei2DFor,
    nucleiCatalog, pathologyProfilesData, tractsCatalog, ultimoLayoutRotulos, ultimosRotulos, ultimosTracos
} from './dominios/circuitos.js?v=12.76.2';
import { store } from './store.js?v=12.76.2';
import {
    caseAnswer, caseApplyStep, caseGo, caseState, closeCase, closeExperimentsModal, closeSemiologyModal,
    copySceneLink, deleteSceneAt, escapeHtml, experiments, exportCasesJSON, exportExperimentsAnki, exportScenesJSON,
    exportViewportPNG, finishRenameScene, flyToPreset, importCasesJSON, importScenesJSON, limparCasosImportados,
    loadSceneAt, moveScene, onRealismBadgeClick, openCase, openExperimentsModal, openSemiologyModal,
    openTargetFromConnectome, playlistStep, playlistToggle, poeChoose, poeRun, renderCasePanel, renderExperiment,
    renderExperimentList, renderScenesList, renderSemiology, saveCurrentScene, savePlaylistPrefs, scenes,
    showTargetInConnectome, startRenameScene, storeScenes, toggleCameraOrbit, toggleCasePanel, toggleColorVisionMode,
    togglePresenterMode, toggleScenesPanel, updateSceneAt
} from './features.js?v=12.76.2';
import { toggleColorTheme, toggleSound } from './engine.js?v=12.76.2';
import { marcador, renderInspector, renderUI } from './ui.js?v=12.76.2';
import { renderer3D } from './render3d.js?v=12.76.2';
import { setRenderPaused } from './render2d.js?v=12.76.2';
import {
    closeSourcesModal, closeSpotlightModal, dismissDisclaimer, onSpotlightKeyDown, onSpotlightOverlayClick,
    onSpotlightSearch, openSourcesModal, openSpotlightModal, selectSpotlightItem
} from './main.js?v=12.76.2';

// Getters, não cópias: um binding importado é vivo, e 7 destes nomes são let (caseState, ionParticles3D, renderer3D, scenes, ultimoLayoutRotulos, ultimosRotulos, ultimosTracos) — quem lê window.nome tem de ver o valor de agora, não o do instante em que a ponte foi instalada.
function instalarPonte() {
    const nomes = {
        APP_VERSION: () => APP_VERSION, CIRCUIT_LAYER_UI: () => CIRCUIT_LAYER_UI, DOMINIOS: () => DOMINIOS,
        KI_RECEPTORS: () => KI_RECEPTORS, LEITURAS_CRUZADAS: () => LEITURAS_CRUZADAS, MODO: () => MODO,
        SOURCES: () => SOURCES, brainCircuitsData: () => brainCircuitsData,
        canonicalSubTractsData: () => canonicalSubTractsData, caseAnswer: () => caseAnswer,
        caseApplyStep: () => caseApplyStep, caseGo: () => caseGo, caseState: () => caseState,
        circuitTargets: () => circuitTargets, closeCase: () => closeCase,
        closeCrossTaperingModal: () => closeCrossTaperingModal, closeExperimentsModal: () => closeExperimentsModal,
        closeSemiologyModal: () => closeSemiologyModal, closeSourcesModal: () => closeSourcesModal,
        closeSpotlightModal: () => closeSpotlightModal, copySceneLink: () => copySceneLink,
        deleteSceneAt: () => deleteSceneAt, desprescreverSistema: () => desprescreverSistema,
        dismissDisclaimer: () => dismissDisclaimer, dossierTargets: () => dossierTargets,
        drawBrainCircuits2D: () => drawBrainCircuits2D, drugBindingAffinities: () => drugBindingAffinities,
        drugTargetsExtra: () => drugTargetsExtra, ehCamadaDeSistema: () => ehCamadaDeSistema,
        escapeHtml: () => escapeHtml, escolherSistema: () => escolherSistema, experiments: () => experiments,
        exportCasesJSON: () => exportCasesJSON, exportExperimentsAnki: () => exportExperimentsAnki,
        exportPatientStory: () => exportPatientStory, exportScenesJSON: () => exportScenesJSON,
        exportViewportPNG: () => exportViewportPNG, finishRenameScene: () => finishRenameScene,
        flyToPreset: () => flyToPreset, importCasesJSON: () => importCasesJSON,
        importScenesJSON: () => importScenesJSON, ionParticles3D: () => ionParticles3D,
        limparCasosImportados: () => limparCasosImportados, loadSceneAt: () => loadSceneAt, marcador: () => marcador,
        molecularAdvancesData: () => molecularAdvancesData, moveScene: () => moveScene,
        nuclei2DFor: () => nuclei2DFor, nucleiCatalog: () => nucleiCatalog,
        onCrossTaperingOverlayClick: () => onCrossTaperingOverlayClick,
        onRealismBadgeClick: () => onRealismBadgeClick, onSpotlightKeyDown: () => onSpotlightKeyDown,
        onSpotlightOverlayClick: () => onSpotlightOverlayClick, onSpotlightSearch: () => onSpotlightSearch,
        openCase: () => openCase, openCrossTaperingModal: () => openCrossTaperingModal,
        openExperimentsModal: () => openExperimentsModal, openSemiologyModal: () => openSemiologyModal,
        openSourcesModal: () => openSourcesModal, openSpotlightModal: () => openSpotlightModal,
        openTargetFromConnectome: () => openTargetFromConnectome, pathologyProfilesData: () => pathologyProfilesData,
        pkPresetFromDrug: () => pkPresetFromDrug, playlistStep: () => playlistStep,
        playlistToggle: () => playlistToggle, poeChoose: () => poeChoose, poeRun: () => poeRun,
        renderCasePanel: () => renderCasePanel, renderExperiment: () => renderExperiment,
        renderExperimentList: () => renderExperimentList, renderInspector: () => renderInspector,
        renderScenesList: () => renderScenesList, renderSemiology: () => renderSemiology, renderUI: () => renderUI,
        renderer3D: () => renderer3D, resetHHParams: () => resetHHParams, saveCurrentScene: () => saveCurrentScene,
        savePlaylistPrefs: () => savePlaylistPrefs, scenes: () => scenes,
        selectSpotlightItem: () => selectSpotlightItem, semiologyCounts: () => semiologyCounts,
        setHHParam: () => setHHParam, setIzhikevichCurrent: () => setIzhikevichCurrent,
        setIzhikevichType: () => setIzhikevichType, setRenderPaused: () => setRenderPaused,
        showTargetInConnectome: () => showTargetInConnectome, startRenameScene: () => startRenameScene,
        store: () => store, storeScenes: () => storeScenes, systemsData: () => systemsData,
        toggleCameraOrbit: () => toggleCameraOrbit, toggleCasePanel: () => toggleCasePanel,
        toggleColorTheme: () => toggleColorTheme, toggleColorVisionMode: () => toggleColorVisionMode,
        toggleModelPanel: () => toggleModelPanel, togglePresenterMode: () => togglePresenterMode,
        toggleScenesPanel: () => toggleScenesPanel, toggleSound: () => toggleSound,
        tractsCatalog: () => tractsCatalog, ultimoLayoutRotulos: () => ultimoLayoutRotulos,
        ultimosRotulos: () => ultimosRotulos, ultimosTracos: () => ultimosTracos,
        updateCrossTaperingCalculations: () => updateCrossTaperingCalculations,
        updateDosingRegimen: () => updateDosingRegimen, updateSceneAt: () => updateSceneAt
    };
    for (const [nome, ler] of Object.entries(nomes)) Object.defineProperty(window, nome, { get: ler, configurable: true, enumerable: false });
}

export { instalarPonte };
