// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import './dominios/circuitos.js?v=12.66.0';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { DOMINIOS, ESCALAS_DE_PROJECAO, MODO, dominioDaEscala, dominioDoModo } from './data.js?v=12.66.0';
import { hhSolver } from './dominios/neuronio.js?v=12.66.0';
import {
    CIRCUIT_FAMILIES, CIRCUIT_PRESETS, canonicalSubTractsData, modoDeVisaoDasCamadas, pathologyProfilesData
} from './dominios/circuitos.js?v=12.66.0';
import { renderUI } from './ui.js?v=12.66.0';
import { scene3D } from './render3d.js?v=12.66.0';
// ── fim dos módulos ──
/* NeuroSim Pro 3D — store.js. Gerado pela divisão da v12.0; a ordem de carga é definida em Simulador_Neuronio_Interativo.html.
   Scripts clássicos compartilham o escopo global: const/let/function de um arquivo são visíveis nos seguintes. */
// ==========================================
// 2. UNIDIRECTIONAL STATE STORE (Zustand Pattern)
// ==========================================
/*
 * v12.6 — REGISTRO DE EFEITOS.
 *
 * Antes desta versão o reducer chamava diretamente funções de OUTROS módulos: 51 chamadas ao
 * som (playBioTone, engine.js), 8 ao material 3D (update3DMaterials, render3d.js), 3 ao recálculo
 * eletrofisiológico (engine.js) e 1 ao háptico (features.js). A camada de estado dependia das
 * camadas de saída, e a consequência prática apareceu nos testes: era impossível exercitar o
 * reducer sem fabricar um renderizador e um sintetizador falsos.
 *
 * Agora o store declara de que efeitos precisa e cada módulo registra o seu ao carregar. O
 * padrão é NÃO FAZER NADA — o que também elimina uma fragilidade de ordem de carga: antes, um
 * dispatch disparado por features.js (que carrega antes de engine.js) encontraria playBioTone
 * ainda indefinido.
 *
 * O que este refactor NÃO faz: mudar QUANDO cada efeito ocorre. Os pontos de chamada são os
 * mesmos, na mesma ordem. Isso foi verificado contando as chamadas antes e depois numa bateria
 * fixa de 24 experimentos POE e 20 ações — os números bateram exatamente.
 */
const Effects = {
    tone: function () {},       // engine.js  → playBioTone
    materials: function () {},  // render3d.js → update3DMaterials
    recalc: function () {},     // engine.js  → recalculateElectrophysiology
    haptic: function () {}      // features.js → triggerHaptic
};
function registerEffect(nome, fn) {
    if (typeof fn !== 'function') return false;
    if (!Object.prototype.hasOwnProperty.call(Effects, nome)) return false;
    Effects[nome] = fn;
    return true;
}

// v12.31 — a escala visual é uma ENUMERAÇÃO FECHADA. O reducer aceitava qualquer string e, com uma
// escala desconhecida, renderUI punha todas as superfícies em display:none: a cena sumia sem aviso.
// Medido em 01/09/2026 com a tecla 5, que despachava 'dual' desde a v6.3 — escala que nenhum
// renderizador conhecia desde antes da v12.0. A lista é conferida contra os ramos do masterRenderLoop
// em tests/escalas.test.ts; acrescentar uma escala aqui sem o ramo correspondente derruba a trava.
const ESCALAS_VISUAIS = ['cleft2d', 'neuron2d', 'brain2d', 'brain3d', '3d'];

class NeuroStore {
    constructor(initialState) {
        this.state = initialState;
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /*
     * v12.6 — o segundo parâmetro `prev` foi REMOVIDO. Ele era `{ ...this.state }` tirado antes da
     * mutação: uma cópia RASA, que compartilhava os objetos aninhados com o estado novo. Verificado
     * por execução: depois de mudar [K+]o de 4,5 para 9, o assinante recebia prev.patchclamp ===
     * state.patchclamp e prev.patchclamp.Ko === 9. Quem perguntasse "isso mudou?" recebia "não".
     * Nenhum dos dois assinantes usava o parâmetro, então a remoção não quebra nada — mas fecha a
     * armadilha para o próximo código. Se um dia for preciso detectar mudança, o caminho correto é
     * o tipo da ação, que já diz o que mudou, e não comparar cópias.
     */
    dispatch(action) {
        switch (action.type) {
            case 'SET_MASTER_MODE': {
                // v12.37 (Bloco 2): o modo e um dominio de DOMINIOS (data.js); entrar nele poe a escala inicial do
                // dominio, como sempre fez — mas o mapa e dado, nao `if` por numero. Modo desconhecido nao muda nada.
                const dominio = dominioDoModo(action.mode);
                if (!dominio) break;
                this.state.activeMode = action.mode;
                this.state.visualScale = DOMINIOS[dominio].escalaInicial;
                Effects.tone(440 + action.mode * 80, 'sine', 0.12, 0.12);
                break;
            }
                                case 'SET_AXON_SPEED':
                this.state.axonSpeed = action.speed;
                break;
            case 'TOGGLE_BOTULINUM_TOXIN':
                this.state.botulinumToxinActive = !this.state.botulinumToxinActive;
                Effects.tone(this.state.botulinumToxinActive ? 220 : 440, 'sine', 0.15, 0.15);
                break;
            case 'TOGGLE_AMPHETAMINE':
                this.state.amphetamineActive = !this.state.amphetamineActive;
                Effects.tone(this.state.amphetamineActive ? 660 : 330, 'triangle', 0.15, 0.15);
                break;
            case 'SET_DISEASE_TREATMENT_STATE':
                this.state.diseaseTreatmentState = action.treatmentState;
                Effects.tone(action.treatmentState === 'treated' ? 587.33 : 369.99, 'sine', 0.18, 0.15);
                break;
            case 'SET_SYSTEM':
                // v12.38 (Bloco 3): SET_SYSTEM escreve so no seu dominio (Neurotransmissao). Soltar o farmaco que nao e
                // do sistema virou a PONTE escolherSistema (features.js). Reescrever camadas, sub-vias, modo de visao e
                // acordeoes do conectoma saiu sem ponte: no dominio Circuitos ninguem despacha SET_SYSTEM — as escalas
                // de cerebro sao dele desde o Bloco 2. Medido antes: 6 escritas cruzadas nesta acao.
                this.state.system = action.system;
                Effects.materials(action.system);
                Effects.tone(440, 'sine', 0.15, 0.15);
                break;
            case 'SET_ESCALA_PROJECAO': {
                // v12.53: o tamanho da projecao vira controle de aula (teclas + e -). Valor fora da lista nao muda
                // nada — o mesmo cuidado que a v12.31 teve de aprender com a tecla 5 e a escala 'dual'.
                const nivel = Number(action.escala);
                if (!ESCALAS_DE_PROJECAO.includes(nivel)) break;
                this.state.escalaProjecao = nivel;
                Effects.tone(nivel >= 1.5 ? 720 : nivel >= 1.25 ? 620 : 520, 'sine', 0.12, 0.1);
                break;
            }
            case 'SET_VISUAL_SCALE': {
                if (!ESCALAS_VISUAIS.includes(action.scale)) break;   // v12.31: escala desconhecida não muda nada
                // v12.37 (Bloco 2): cada dominio e dono das suas escalas. Pedir uma escala que o dominio atual nao
                // possui (tecla 1-5, link, painel do modelo) NAVEGA para o primeiro dominio dono dela — a navegacao
                // mais usada da aula continua funcionando, e o palco nunca fica fora do seu dominio.
                const atual = dominioDoModo(this.state.activeMode);
                if (!atual || !DOMINIOS[atual].escalas.includes(action.scale)) {
                    const dono = dominioDaEscala(action.scale);
                    if (dono) this.state.activeMode = DOMINIOS[dono].modo;
                }
                this.state.visualScale = action.scale;
                // v12.47.2: escolher uma escala na doca SAI da comparacao. Os cinco botoes estao lado a lado e
                // parecem um grupo de opcoes, mas os quatro de escala nao desfaziam o quinto: vindo de "Comparar",
                // clicar "Conectoma 2D" nao fazia nada (a escala ja era brain2d) e o palco seguia no painel duplo,
                // com dualSubMode ligado pelo resto da sessao. Foi o "os circuitos nao aparecem quando clico".
                this.state.dualSubMode = null;
                Effects.tone(550, 'sine', 0.12, 0.12);
                break;
            }
            case 'TOGGLE_PSICOEDUCACAO':
                // v12.37 (Bloco 2): a Psicoeducacao deixou de ser modo e virou FERRAMENTA — painel com estado no reducer
                // (invariante 3), nao classe imperativa. Os seis roteiros e o PDF continuam onde sempre estiveram.
                this.state.psicoeducacaoAberta = (action.aberta === undefined) ? !this.state.psicoeducacaoAberta : !!action.aberta;
                Effects.tone(500, 'sine', 0.1, 0.1);
                break;
            case 'SET_CLEFT_MICROSCOPE_LAYER':
                this.state.cleftMicroscopeLayer = action.layer;
                Effects.tone(480, 'sine', 0.1, 0.1);
                break;
            case 'SET_NEURO_STEP':
                this.state.neuroStep = action.step;
                if (action.step === 3 || action.step === 4) {
                    this.dispatch({ type: 'TRIGGER_ACTION_POTENTIAL' });
                } else {
                    Effects.tone(380 + action.step * 60, 'sine', 0.15, 0.15);
                }
                break;
            case 'SET_PATHOLOGY_STATE':
                this.state.pathologyProgression = action.progression;
                if (action.progression === 'healthy') {
                    this.state.spineHeadScale = 1.0;
                    hhSolver.V = -70.0;
                    Effects.tone(440, 'sine', 0.2, 0.15);
                } else if (action.progression === 'disease') {
                    this.state.spineHeadScale = 0.55;
                    hhSolver.V = -55.0;
                    Effects.tone(280, 'sawtooth', 0.3, 0.2);
                } else if (action.progression === 'treatment') {
                    this.state.spineHeadScale = 1.8;
                    hhSolver.V = -70.0;
                    Effects.tone(600, 'sine', 0.25, 0.2);
                }
                break;
            case 'TRIGGER_ACTION_POTENTIAL':
                // 35 µA/cm² por 60 passos × 0,04 ms = 2,4 ms: estímulo supralimiar real (15 passos = 0,6 ms não disparava o modelo)
                hhSolver.injectCurrent(35.0, 60);
                this.state.apActive = true;
                this.state.apWavePos = 0.0;
                this.state.apBurstTimer = 1.0;
                Effects.tone(660, 'sawtooth', 0.25, 0.25);
                Effects.haptic(25);
                // v12.38 (Bloco 3): as vesiculas nao sao soltas aqui. A sinapse REAGE ao potencial de acao no laco de render
                // (sinapseReageAoPA, engine.js), na borda de subida de apActive — mesmo numero, um quadro depois.
                setTimeout(() => {
                    if (store) store.dispatch({ type: 'RESET_AP' });
                }, 1400);
                break;
            case 'RESET_AP':
                this.state.apActive = false;
                this.state.apBurstTimer = 0;
                break;
            case 'INJECT_DENDRITE_INPUT':
                if (action.inputType === 'epsp') {
                    this.state.somaVoltage = Math.min(30.0, this.state.somaVoltage + 8.0);
                    hhSolver.injectCurrent(12.0, 25);
                    Effects.tone(520, 'sine', 0.1, 0.15);
                } else {
                    this.state.somaVoltage = Math.max(-90.0, this.state.somaVoltage - 6.0);
                    Effects.tone(280, 'sine', 0.1, 0.15);
                }
                break;
                                case 'SET_BRAIN_CIRCUIT':
                this.state.brainCircuitViewMode = action.circuit;
                // v12.14.1: a lista canonica de camadas vem do DADO, nao de um array digitado.
                // Havia tres listas escritas a mao e elas divergiram: 19, 21 e 21. Esta era a de 19,
                // sem 'panic' e sem 'gad' — por isso '🌐 Todas' e 'Marcar Todas' acendiam conjuntos
                // diferentes, e ninguem percebia porque as duas parecem fazer a mesma coisa.
                const allCanonicalLayers = Object.keys(canonicalSubTractsData);
                if (action.circuit === 'all') {
                    this.state.activeCircuitLayers = [...allCanonicalLayers];
                } else if (action.circuit === 'clear') {
                    this.state.activeCircuitLayers = []; this.state.activeSubTracts = [];
                } else if (CIRCUIT_PRESETS[action.circuit]) {
                    // v12.14.1: os nove presets vinham de uma cadeia de if/else aqui dentro.
                    // Agora saem de CIRCUIT_PRESETS (data.js), para que os botoes possam ser
                    // gerados da mesma fonte e nao exista preset sem porta nem porta sem preset.
                    this.state.activeCircuitLayers = [...CIRCUIT_PRESETS[action.circuit].layers];
                } else {
                    this.state.activeCircuitLayers = [action.circuit];
                    // v12.38 (Bloco 3): trocar o neurotransmissor da fenda ao escolher um circuito unico saiu — era escrita
                    // cruzada (dominio Neurotransmissao) e nao tinha porta na interface: so os presets despacham SET_BRAIN_CIRCUIT.
                }
                Effects.tone(480, 'sine', 0.15, 0.15);
                break;
                                case 'TOGGLE_SUB_TRACT':
                const subId = action.subId;
                const sysKey = action.systemKey;
                const sIdx = this.state.activeSubTracts.indexOf(subId);
                
                // If activeSubTracts is currently empty, populate it with all currently active systems' sub-tracts first
                // v12.56: materializa SO a camada clicada. Antes enchia a lista com as sub-vias de todas as camadas
                // acesas, e como o desenho filtrava globalmente, mexer num sistema calava os outros.
                const semFiltroNaCamada = !this.state.activeSubTracts.some(id =>
                    ((canonicalSubTractsData[sysKey] || {}).items || []).some(it => it.id === id));
                if (semFiltroNaCamada) {
                    const daCamada = ((canonicalSubTractsData[sysKey] || {}).items || []).map(it => it.id);
                    this.state.activeSubTracts = this.state.activeSubTracts.concat(daCamada);
                }

                const curIdx = this.state.activeSubTracts.indexOf(subId);
                if (curIdx > -1) {
                    this.state.activeSubTracts.splice(curIdx, 1);
                } else {
                    this.state.activeSubTracts.push(subId);
                }

                // Ensure parent system layer stays active if at least one sub-tract is active
                const sysObj = canonicalSubTractsData[sysKey];
                if (sysObj && sysObj.items) {
                    const hasAny = sysObj.items.some(it => this.state.activeSubTracts.includes(it.id));
                    if (hasAny && !this.state.activeCircuitLayers.includes(sysKey)) {
                        this.state.activeCircuitLayers.push(sysKey);
                    } else if (!hasAny && this.state.activeCircuitLayers.includes(sysKey)) {
                        const layerIdx = this.state.activeCircuitLayers.indexOf(sysKey);
                        if (layerIdx > -1) this.state.activeCircuitLayers.splice(layerIdx, 1);
                    }
                }
                Effects.tone(540, 'sine', 0.12, 0.12);
                break;
                                case 'EXPAND_ALL_ACCORDIONS':
                this.state.expandedSystemAccordions = Object.keys(canonicalSubTractsData);
                Effects.tone(520, 'sine', 0.10, 0.08);
                break;
            case 'COLLAPSE_ALL_ACCORDIONS':
                this.state.expandedSystemAccordions = [];
                Effects.tone(320, 'sine', 0.10, 0.08);
                break;
            case 'TOGGLE_SYSTEM_ACCORDION':
                const accKey = action.systemKey;
                const aIdx = this.state.expandedSystemAccordions.indexOf(accKey);
                if (aIdx > -1) {
                    this.state.expandedSystemAccordions.splice(aIdx, 1);
                } else {
                    this.state.expandedSystemAccordions.push(accKey);
                }
                Effects.tone(420, 'sine', 0.10, 0.08);
                break;
                                case 'CLEAR_ALL_CIRCUITS':
            case 'CLEAR_CIRCUIT_LAYERS':
                // v12.33: guarda o que vai apagar. Sao 25 camadas num clique, no meio de uma aula; Ctrl+Z devolve.
                if (this.state.activeCircuitLayers.length || this.state.activeSubTracts.length || this.state.selectedNucleusId) {
                    this.state.desfazerLimpeza = { activeCircuitLayers: this.state.activeCircuitLayers.slice(), activeSubTracts: this.state.activeSubTracts.slice(), selectedNucleusId: this.state.selectedNucleusId, brainCircuitViewMode: this.state.brainCircuitViewMode };
                }
                this.state.activeCircuitLayers = [];
                this.state.activeSubTracts = [];
                this.state.selectedNucleusId = null;
                this.state.brainCircuitViewMode = 'none';
                Effects.tone(320, 'sine', 0.12, 0.1);
                break;
            case 'SELECT_ALL_CIRCUITS':
                this.state.activeCircuitLayers = Object.keys(canonicalSubTractsData);   // v12.14.1: do dado
                this.state.activeSubTracts = [];
                this.state.brainCircuitViewMode = 'all';
                Effects.tone(580, 'sine', 0.12, 0.1);
                break;
            case 'TOGGLE_CIRCUIT_LAYER':
                const layer = action.layer;
                const idx = this.state.activeCircuitLayers.indexOf(layer);
                if (idx > -1) {
                    this.state.activeCircuitLayers.splice(idx, 1);
                } else {
                    this.state.activeCircuitLayers.push(layer);
                }
                this.state.brainCircuitViewMode = modoDeVisaoDasCamadas(this.state.activeCircuitLayers);   // v12.33: era `=== 16`
                Effects.tone(520, 'sine', 0.12, 0.12);
                break;
            case 'UNDO_CLEAR_CIRCUITS': {
                const memo = this.state.desfazerLimpeza;
                if (!memo) break;
                this.state.activeCircuitLayers = memo.activeCircuitLayers.slice();
                this.state.activeSubTracts = memo.activeSubTracts.slice();
                this.state.selectedNucleusId = memo.selectedNucleusId;
                this.state.brainCircuitViewMode = memo.brainCircuitViewMode;
                this.state.desfazerLimpeza = null;
                Effects.tone(560, 'sine', 0.12, 0.1);
                break;
            }
            case 'TOGGLE_CIRCUIT_FAMILY': {
                // v12.33: nenhum / parcial / todos. Toda acesa -> apaga a familia; senao acende a familia inteira.
                const fam = CIRCUIT_FAMILIES[action.family];
                if (!fam) break;
                const membros = fam.camadas.filter(c => canonicalSubTractsData[c]);
                const acesas = this.state.activeCircuitLayers;
                if (membros.every(c => acesas.includes(c))) {
                    this.state.activeCircuitLayers = acesas.filter(c => !membros.includes(c));
                } else {
                    membros.forEach(c => { if (!acesas.includes(c)) acesas.push(c); });
                }
                this.state.brainCircuitViewMode = modoDeVisaoDasCamadas(this.state.activeCircuitLayers);
                Effects.tone(500, 'sine', 0.12, 0.1);
                break;
            }
            case 'TOGGLE_FAMILY_ACCORDION': {
                const fi = this.state.expandedFamilies.indexOf(action.family);
                if (fi > -1) this.state.expandedFamilies.splice(fi, 1); else this.state.expandedFamilies.push(action.family);
                Effects.tone(420, 'sine', 0.10, 0.08);
                break;
            }
            case 'SELECT_NUCLEUS':
                this.state.selectedNucleusId = action.nucleusId;
                if (action.nucleusId) {
                    Effects.tone(620, 'sine', 0.16, 0.14);
                } else {
                    Effects.tone(400, 'sine', 0.12, 0.10);
                }
                break;
            // v12.59 (D12): a lente desce um degrau — dentro de uma doenca, mostrar UMA dimensao de sintoma.
            // Nao muda quais vias sao desenhadas: muda quais delas aparecem DESVIADAS, que e' o que a aula compara.
            case 'SET_SYMPTOM_DIMENSION':
                this.state.dimensaoDeSintoma = action.dimensao || null;
                Effects.tone(this.state.dimensaoDeSintoma ? 520 : 400, 'sine', 0.10, 0.10);
                break;
            case 'SET_PATHOLOGY_PROFILE':
                this.state.activePathologyProfile = action.profile;
                this.state.dimensaoDeSintoma = null;
                this.state.neurostimProtocol = 'off';
                this.state.selectedNucleusId = null;

                // v12.35 (Bloco 0 da organizacao por dominio): as camadas, o sistema e o tom de cada perfil sao DADO
                // do perfil (pathologyProfilesData[x].camadas / .sistema / .tom), nao `if` por nome. O TEPT tinha
                // perfil, cinco vias desviadas e pilula na barra — e nao tinha ramo: caia no panorama basal com as
                // cinco vias em camadas apagadas. As listas dos seis perfis que tinham ramo estao congeladas em
                // tests/perfis_patologia.test.ts: mover para dado nao muda um pixel.
                const perfilAtivo = (typeof pathologyProfilesData !== 'undefined') ? pathologyProfilesData[action.profile] : null;
                if (perfilAtivo && Array.isArray(perfilAtivo.camadas) && perfilAtivo.camadas.length) {
                    // v12.38 (Bloco 3, decisao 12 do PO): o perfil nao troca mais o neurotransmissor da fenda nem recolore o 3D.
                    this.state.activeCircuitLayers = perfilAtivo.camadas.slice();
                    const tom = perfilAtivo.tom || [440, 'sine', 0.22, 0.25];
                    Effects.tone(tom[0], tom[1], tom[2], tom[3]);
                } else {
                    // Subconjunto DELIBERADO: ao voltar para 'Fisiologia Normal' o panorama basal nao acende
                    // os circuitos de medo, panico, GAD, DMN e CEN. Nao e a lista canonica e nao deve
                    // virar Object.keys(...) — se um dia deixar de fazer sentido didatico, e decisao
                    // do autor, nao consequencia de refatoracao.
                    this.state.activeCircuitLayers = ['dopamine', 'serotonin', 'norepinephrine', 'glutamate', 'gaba', 'cholinergic', 'cstc', 'habenula', 'papez', 'salience', 'hpa', 'orexin', 'histamine'];
                    Effects.tone(400, 'sine', 0.12, 0.10);
                }
                break;
            case 'SET_NEUROSTIM_PROTOCOL':
                this.state.neurostimProtocol = action.protocol;
                if (action.protocol === 'rtms_10hz_dlpfc') {
                    this.state.neurostimFrequency = 10;
                    this.state.selectedNucleusId = 'pfc';
                    Effects.tone(520, 'triangle', 0.20, 0.25);
                } else if (action.protocol === 'rtms_1hz_sma') {
                    this.state.neurostimFrequency = 1;
                    this.state.selectedNucleusId = 'ctx_post';
                    Effects.tone(320, 'triangle', 0.20, 0.25);
                } else if (action.protocol === 'dbs_130hz_cg25') {
                    this.state.neurostimFrequency = 130;
                    this.state.selectedNucleusId = 'vmpfc';
                    Effects.tone(650, 'sawtooth', 0.15, 0.20);
                } else if (action.protocol === 'dbs_130hz_alic') {
                    this.state.neurostimFrequency = 130;
                    this.state.selectedNucleusId = 'accumbens';
                    Effects.tone(650, 'sawtooth', 0.15, 0.20);
                } else if (action.protocol === 'opto_inhibit_lhb') {
                    this.state.neurostimFrequency = 50;
                    this.state.selectedNucleusId = 'habenula';
                    Effects.tone(580, 'sine', 0.18, 0.20);
                } else {
                    this.state.neurostimFrequency = 10;
                    Effects.tone(300, 'sine', 0.10, 0.10);
                }
                break;
                                case 'UPDATE_ION_CONCENTRATION':
                if (!this.state.patchclamp) this.state.patchclamp = { Ko: 4.5, Nao: 145, Cao: 2.0 };
                this.state.patchclamp[action.ion] = action.value;
                if (action.ion === 'Ko') this.state.k_out = action.value;
                if (action.ion === 'Nao') this.state.na_out = action.value;
                if (action.ion === 'Cao') this.state.ca_out = action.value;
                Effects.recalc();
                Effects.tone(320 + action.value * 20, 'sine', 0.10, 0.08);
                break;
            case 'TOGGLE_TOXIN':
                if (!this.state.activeToxins) this.state.activeToxins = { ttx: false, tea: false, nifedipine: false, picrotoxin: false, botulinum: false };
                this.state.activeToxins[action.toxin] = !this.state.activeToxins[action.toxin];
                if (action.toxin === 'ttx') this.state.blockNav_TTX = this.state.activeToxins.ttx;
                if (action.toxin === 'tea') this.state.blockKv_TEA = this.state.activeToxins.tea;
                if (action.toxin === 'nifedipine') this.state.blockCav_Cd = this.state.activeToxins.nifedipine;
                if (action.toxin === 'picrotoxin') this.state.blockGABA_PTX = this.state.activeToxins.picrotoxin;
                // v12.38 (Bloco 3): a botulinica SAIU desta acao. Ela bloqueia a exocitose (dominio Neurotransmissao), nao um
                // canal: e a acao TOGGLE_BOTULINUM_TOXIN, com pilula no inspetor da Neurotransmissao. Aqui ficam TTX, TEA,
                // nifedipina e picrotoxina — canais e receptor, dominio Neuronio. (v12.11 tinha juntado as cinco.)
                Effects.recalc();
                Effects.tone(480, 'sawtooth', 0.15, 0.15);
                break;
            case 'UPDATE_NEUROSTIM_PARAMS':
                if (action.freq !== undefined) this.state.neurostimFrequency = action.freq;
                if (action.intensity !== undefined) this.state.neurostimIntensity = action.intensity;
                break;
            case 'SET_PHARMA_TAB':
                this.state.pharmaTab = action.tab;
                Effects.tone(500, 'sine', 0.08, 0.08);
                break;
            case 'SELECT_CLEFT_COMPONENT':
                this.state.selectedCleftComponent = action.componentId || null;
                break;
            case 'SET_D2_DOSE':
                this.state.d2DoseSlider = action.dose;
                break;
            case 'SELECT_TARGET':
                // v12.2a: navegação por alvo canônico. Clicar de novo no mesmo alvo fecha.
                this.state.selectedTargetId = (this.state.selectedTargetId === action.targetId) ? null : (action.targetId || null);
                Effects.tone(560, 'sine', 0.08, 0.08);
                break;
            case 'SET_PHARMA_DOSE': {
                const m = Object.assign({}, this.state.pharmaDoseMg || {});
                m[action.drugKey] = action.doseMg;
                this.state.pharmaDoseMg = m;
                break;
            }
            case 'SET_5HT2A_BLOCK':
                this.state.block5HT2A = action.blocked;
                break;
            case 'SET_LITEMIA':
                this.state.litemiaVal = action.val;
                break;
            case 'SET_PATIENT_STORY':
                this.state.patientStoryKey = action.story;
                Effects.tone(520, 'sine', 0.15, 0.15);
                break;
            case 'TOGGLE_POLY_DRUG':
                // v12.40 (Bloco 5, decisao 11): a prescricao e a UNICA lista de farmacos. O que a fenda acopla e derivado dela
                // (farmacoAcoplado, data.js); nao ha mais selectedDrugId/drugDocked para manter em sincronia.
                if (!this.state.selectedDrugsList) this.state.selectedDrugsList = ['fluoxetina'];
                if (this.state.selectedDrugsList.includes(action.drugKey)) this.state.selectedDrugsList = this.state.selectedDrugsList.filter(k => k !== action.drugKey);
                else if (this.state.selectedDrugsList.length < 4) this.state.selectedDrugsList.push(action.drugKey);
                Effects.tone(540, 'sine', 0.1, 0.1);
                break;
            case 'CLEAR_POLY_DRUGS':
                this.state.selectedDrugsList = [];
                Effects.tone(320, 'sine', 0.15, 0.1);
                break;
            case 'SELECT_PATHOLOGY_PROFILE':
                this.state.activePathologyProfile = action.profile;
                Effects.tone(440, 'sine', 0.12, 0.12);
                break;
            case 'SELECT_NEUROSTIM_PROTOCOL':
                this.state.neurostimProtocol = action.protocol;
                Effects.tone(480, 'sine', 0.12, 0.12);
                break;
            // v12.31: sem despachante — a tecla D passou a chamar toggleColorTheme(), o mesmo caminho do botão
            // (engine.js). Este case fica até decisão explícita de remoção; hoje só o alcançaria um despacho externo.
            case 'TOGGLE_ATLAS_THEME':
                this.state.isAtlasTheme = !this.state.isAtlasTheme;
                document.body.classList.toggle('atlas-theme', this.state.isAtlasTheme);
                if (scene3D) scene3D.background = new THREE.Color(this.state.isAtlasTheme ? 0xf8fafc : 0x020617);
                Effects.tone(560, 'sine', 0.1, 0.1);
                break;
            case 'SET_DUAL_SUBMODE':
                // alterna: clicar no submodo ativo desliga a comparacao
                this.state.dualSubMode = (this.state.dualSubMode === action.subMode) ? null : action.subMode;
                if (this.state.dualSubMode) this.state.visualScale = 'brain2d';   // so o conectoma 2D sabe se desenhar duas vezes
                Effects.tone(480, 'sine', 0.1, 0.1);
                break;
            case 'RESET_PHYSIOLOGICAL_IONS':
                this.state.k_out = 4.5;
                this.state.na_out = 145.0;
                this.state.ca_out = 2.0;
                this.state.cl_out = 120.0;
                this.state.blockNav_TTX = false;
                this.state.blockKv_TEA = false;
                this.state.blockCav_Cd = false;
                this.state.blockGABA_PTX = false;
                Effects.recalc();
                Effects.tone(600, 'sine', 0.25, 0.15);
                break;
        }

        this.listeners.forEach(l => l(this.state));
    }
}

const store = new NeuroStore({
    activeMode: MODO.neuronio,   // v12.37: o primeiro dominio da aula; a escala inicial e a dele (abaixo)
    psicoeducacaoAberta: false,  // v12.37: a Psicoeducacao e painel (ferramenta), nao modo
    system: 'da',
    visualScale: DOMINIOS.neuronio.escalaInicial,
    neuroStep: 1,
    soundEnabled: true,
    isAtlasTheme: false,
    pharmaTab: 'poly', // 'poly' | 'classes'
    selectedCleftComponent: null,
    pharmaSearch: '',
    selectedDrugsList: ['fluoxetina'],
    d2DoseSlider: 72,
    pharmaDoseMg: {}, // v12.1: dose em mg por fármaco com dados de Ki (persistida)
    selectedTargetId: null, // v12.2a: alvo canônico em foco na navegação por alvo
    block5HT2A: true,
    litemiaVal: 0.75,
    pathologyDisorder: 'mdd',
    pathologyProgression: 'disease',
    patientStoryKey: 'latency',
    brainCircuitViewMode: 'all',
    activeCircuitLayers: Object.keys(canonicalSubTractsData),   // v12.14.1: do dado, nao digitado
    selectedNucleusId: null,
    // v12.59: qual DIMENSAO do perfil esta em foco (null = a doenca inteira). Nao persiste: e' foco de aula,
    // e ficar preso numa dimensao apos recarregar seria o mesmo defeito do filtro de sub-vias (v12.56).
    dimensaoDeSintoma: null,
    activePathologyProfile: 'none', // 'none', 'schizophrenia', 'depression_melancholic', 'bipolar_mania', 'panic_disorder', 'adhd', 'ocd', 'ptsd'
    dualSubMode: null,   // v12.20.0: null = painel unico; 'physio_vs_patho' = duas cenas lado a lado
    escalaProjecao: 1.25,   // v12.53: quanto o Modo Aula aumenta o palco (ESCALAS_DE_PROJECAO); 1.25 e o de sempre
    axonSpeed: 1.0,   // v12.24.1: NUNCA existiu no estado inicial. Ate a v12.23 cada leitor
                      // fazia state.axonSpeed || 1.0 e mascarava a ausencia; o relogio da
                      // v12.24.0 fez || 0 e congelou o app inteiro ao abrir.
    neurostimProtocol: 'off',
    activeSubTracts: [], // Array of specific active sub-tract IDs. Empty = follow activeCircuitLayers
    // v12.18: nascem FECHADOS. Com dez abertos, o inspetor do modo 3 tinha 5.185 px de
    // conteudo numa coluna de 365 px — seis telas de rolagem. Isso nunca foi um desenho:
    // era um valor padrao. O botao '📂 Expandir' recria o comportamento antigo num clique.
    expandedSystemAccordions: [],
    expandedFamilies: [],     // v12.33: familias abertas no inspetor (nao persiste, como os acordeoes)
    desfazerLimpeza: null,    // v12.33: memo do "Limpar" para o Ctrl+Z
    neurostimFrequency: 10,
    neurostimIntensity: 100, // % MT (Motor Threshold)
    biophysicsSubModule: 'patchclamp',
    patchclamp: {
        Ko: 4.5,
        Nao: 145.0,
        Cao: 2.0
    },
    activeToxins: {
        ttx: false,
        tea: false,
        nifedipine: false,
        picrotoxin: false
    },
    // Patch-Clamp & Ion Concentrations (mM)
    k_out: 4.5,
    k_in: 140.0,
    na_out: 145.0,
    na_in: 12.0,
    ca_out: 2.0,
    ca_in: 0.0001,
    cl_out: 120.0,
    cl_in: 7.0,
    // Toxins & Channel Blockers
    blockNav_TTX: false,
    blockKv_TEA: false,
    blockCav_Cd: false,
    blockGABA_PTX: false,
    voltage: -70.0,
    somaVoltage: -70.0,
    spineHeadScale: 1.0,
    apActive: false,
    apWavePos: 0
});
store.subscribe(() => {
    renderUI();
});


// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { ESCALAS_VISUAIS, registerEffect, store };
// ── fim do exporta ──
