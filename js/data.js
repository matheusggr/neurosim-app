// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import './targets.js?v=12.66.0';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { TARGETS_CANON } from './targets.js?v=12.66.0';
import { patientStoriesData } from './dominios/psicoeducacao.js?v=12.66.0';
import { hhSolver } from './dominios/neuronio.js?v=12.66.0';
import {
    antidepressantsData, antipsychoticsData, drugBindingAffinities, moodAndAnxioData
} from './dominios/psicofarmacos.js?v=12.66.0';
import { biochemicalCyclesData, molecularAdvancesData, particlePool } from './dominios/neurotransmissao.js?v=12.66.0';
import {
    brainCircuitsData, canonicalSubTractsData, neurostimProtocolsData, nucleiCatalog, nucleiClinicalData,
    pathologyProfilesData, tractsCatalog
} from './dominios/circuitos.js?v=12.66.0';
import { experiments } from './features.js?v=12.66.0';
import { scene3D } from './render3d.js?v=12.66.0';
// ── fim dos módulos ──
/* NeuroSim Pro 3D — data.js. Gerado pela divisão da v12.0; a ordem de carga é definida em Simulador_Neuronio_Interativo.html.
   Scripts clássicos compartilham o escopo global: const/let/function de um arquivo são visíveis nos seguintes. */
// ==========================================
// 0. VERSÃO ÚNICA DO APLICATIVO
//    (sincronizada com package.json, manifest e service worker por scripts/sync-version.mjs)
// ==========================================
const APP_VERSION = '12.66.0';
const APP_BUILD_LABEL = 'O filtro é da camada';

// =========================================================
// 0b. O QUE PERTENCE A QUE — os DOMINIOS do app (v12.36, Bloco 1; v12.37, Bloco 2)
//
// Quatro dominios, que sao os quatro modos, NA ORDEM DA AULA decidida pelo PO em 02/09/2026:
// 1 Neuronio (celula: membrana, Hodgkin-Huxley, ions, canais e suas toxinas, tipos de disparo),
// 2 Circuitos (conectoma; a fisiopatologia e LENTE deste dominio), 3 Neurotransmissao (fenda 2D e 3D,
// os seis passos, sistemas, vesiculas, exocitose, receptores), 4 Psicofarmacos. Psicoeducacao deixou de
// ser modo e e FERRAMENTA (painel, estado psicoeducacaoAberta) — nada some, muda de lugar.
//
// Cada dominio e dono das suas escalas de palco: a doca so mostra as do dominio atual (renderUI publica
// data-escalas no <body>; o CSS le). Pedir uma escala de outro dominio navega para o dono (teclas 1-5).
// biofisica: osciloscopio e painel do modelo aparecem; passos: a barra dos seis passos aparece.
// NENHUM numero de modo fica solto no codigo — quem precisa de um modo escreve MODO.<dominio>
// (tests/modos.test.ts proibe o literal). Cenas e sessoes gravam v: 2; sem o marcador, migrarModosAntigos
// (features.js) traduz os numeros de antes da v12.37.
// =========================================================
const DOMINIOS = {
    neuronio:         { modo: 1, rotulo: 'Neurônio',         emoji: '🧬', escalas: ['neuron2d'],           escalaInicial: 'neuron2d', biofisica: true,  passos: false },
    circuitos:        { modo: 2, rotulo: 'Circuitos',        emoji: '🧠', escalas: ['brain2d', 'brain3d'], escalaInicial: 'brain2d',  biofisica: false, passos: false },
    neurotransmissao: { modo: 3, rotulo: 'Neurotransmissão', emoji: '⚡', escalas: ['cleft2d', '3d'],      escalaInicial: '3d',       biofisica: true,  passos: true },
    psicofarmacos:    { modo: 4, rotulo: 'Psicofármacos',    emoji: '💊', escalas: ['cleft2d', '3d'],      escalaInicial: 'cleft2d',  biofisica: false, passos: false },
};
const MODO = Object.fromEntries(Object.entries(DOMINIOS).map(([k, d]) => [k, d.modo]));
function dominioDoModo(modo) { return Object.keys(DOMINIOS).find(k => DOMINIOS[k].modo === modo) || null; }
function dominioDaEscala(escala) { return Object.keys(DOMINIOS).find(k => DOMINIOS[k].escalas.includes(escala)) || null; }

// As PONTES (v12.38, Bloco 3): funcoes de features.js que atravessam dominios DE PROPOSITO — as unicas. O reducer nao
// atravessa (tests/dominios.test.ts: zero escritas cruzadas); quem precisa tocar dois dominios chama uma destas.
const PONTES = ['showTargetInConnectome', 'openTargetFromConnectome', 'applyScene'];   // v12.40: escolherSistema deixou de atravessar (a prescricao e uma lista so)

// As LEITURAS CRUZADAS (v12.47, D3): o outro jeito de um dominio tocar outro — nao escrevendo, LENDO um dado derivado.
// PONTES sao funcoes de features.js que atravessam; estas sao leituras, e cada uma tem de estar escrita aqui com o
// motivo. A trava em tests/dominios_do_codigo.test.ts compara esta tabela com o que o codigo faz: uma leitura entre
// dominios que nao esteja aqui reprova, e uma entrada aqui que ninguem faz mais tambem. E assim que a fenda pode
// mostrar o farmaco sem que Neurotransmissao e Psicofarmacos virem um dominio so.
// v12.53 — os niveis do FATOR DE PROJECAO (decisao D5, agora com controle: teclas + e - no Modo Aula). Lista
// FECHADA pelo mesmo motivo das escalas visuais: um valor que ninguem previu deixaria o palco num tamanho que
// nenhuma janela foi medida. 1 = do jeito que se edita; 1.25 = a projecao de sempre; 1.5 = sala grande.
// Os tres valores do fator em si moram no CSS (bloco MODO AULA); esta lista e o que o reducer aceita.
const ESCALAS_DE_PROJECAO = [1, 1.25, 1.5];

const LEITURAS_CRUZADAS = {
    'drawSynapse2D → farmacoAcoplado': 'a fenda 2D desenha o farmaco acoplado ao receptor (decisao 11 do PO, v12.40)',
    'drawSynapse2D → drugBindingAffinities': 'a afinidade decide em qual receptor o farmaco encaixa e com que forca',
    'buildSynapticCleft3D → farmacoAcoplado': 'o mesmo acoplamento, na fenda 3D',
    'buildSynapticCleft3D → drugBindingAffinities': 'a mesma afinidade, na fenda 3D',
};

// Cada tipo de acao do reducer -> dominio. 'ui' e o que nao e conteudo: modo, escala, tema, comparacao, paineis.
// 'psicoeducacao' e ferramenta, nao modo. O que uma acao escreve FORA do proprio dominio esta no snapshot de
// escritas cruzadas (tests/escritas_cruzadas.snapshot.json), que so pode diminuir.
const DOMINIO_DA_ACAO = {
    // Neuronio — biofisica celular: ions, canais e suas toxinas, potencial de acao, tipos de disparo
    SET_AXON_SPEED: 'neuronio', UPDATE_ION_CONCENTRATION: 'neuronio', RESET_PHYSIOLOGICAL_IONS: 'neuronio', TOGGLE_TOXIN: 'neuronio',
    TRIGGER_ACTION_POTENTIAL: 'neuronio', RESET_AP: 'neuronio', INJECT_DENDRITE_INPUT: 'neuronio', SET_PATHOLOGY_STATE: 'neuronio',
    // Neurotransmissao — fenda 2D/3D, sistemas, os seis passos, vesiculas e exocitose
    SET_SYSTEM: 'neurotransmissao', SET_NEURO_STEP: 'neurotransmissao', SELECT_CLEFT_COMPONENT: 'neurotransmissao', SET_CLEFT_MICROSCOPE_LAYER: 'neurotransmissao',
    TOGGLE_BOTULINUM_TOXIN: 'neurotransmissao', TOGGLE_AMPHETAMINE: 'neurotransmissao', SET_DISEASE_TREATMENT_STATE: 'neurotransmissao',
    // Circuitos — conectoma; a fisiopatologia (perfis) e LENTE deste dominio, nao dominio proprio
    SET_BRAIN_CIRCUIT: 'circuitos', TOGGLE_SUB_TRACT: 'circuitos', EXPAND_ALL_ACCORDIONS: 'circuitos', COLLAPSE_ALL_ACCORDIONS: 'circuitos',
    TOGGLE_SYSTEM_ACCORDION: 'circuitos', CLEAR_ALL_CIRCUITS: 'circuitos', CLEAR_CIRCUIT_LAYERS: 'circuitos', SELECT_ALL_CIRCUITS: 'circuitos',
    TOGGLE_CIRCUIT_LAYER: 'circuitos', UNDO_CLEAR_CIRCUITS: 'circuitos', TOGGLE_CIRCUIT_FAMILY: 'circuitos', TOGGLE_FAMILY_ACCORDION: 'circuitos',
    SELECT_NUCLEUS: 'circuitos', SET_PATHOLOGY_PROFILE: 'circuitos', SELECT_PATHOLOGY_PROFILE: 'circuitos',
    SET_SYMPTOM_DIMENSION: 'circuitos',
    SET_NEUROSTIM_PROTOCOL: 'circuitos', SELECT_NEUROSTIM_PROTOCOL: 'circuitos', UPDATE_NEUROSTIM_PARAMS: 'circuitos',
    // Psicofarmacos — modo 4
    SET_PHARMA_TAB: 'psicofarmacos', SET_D2_DOSE: 'psicofarmacos', SELECT_TARGET: 'psicofarmacos',
    SET_PHARMA_DOSE: 'psicofarmacos', SET_5HT2A_BLOCK: 'psicofarmacos', SET_LITEMIA: 'psicofarmacos',
    TOGGLE_POLY_DRUG: 'psicofarmacos', CLEAR_POLY_DRUGS: 'psicofarmacos',
    // Psicoeducacao — ferramenta (painel)
    SET_PATIENT_STORY: 'psicoeducacao',
    // UI
    SET_MASTER_MODE: 'ui', SET_VISUAL_SCALE: 'ui', TOGGLE_ATLAS_THEME: 'ui', SET_DUAL_SUBMODE: 'ui', TOGGLE_PSICOEDUCACAO: 'ui',
    SET_ESCALA_PROJECAO: 'ui',   // v12.53: o tamanho da projecao e' da casca, nao de um palco
    SCENE_APPLIED: 'ui',   // despachado por features.js ao aplicar uma cena; nao tem case — so acorda os assinantes
};

// Cada campo que o reducer escreve -> dominio. Inclui os objetos FORA do estado que o reducer toca (solver HH,
// particulas da fenda, materiais 3D, tema): tocar neles de fora do dominio tambem e escrita cruzada.
const DOMINIO_DO_CAMPO = {
    // neuronio
    axonSpeed: 'neuronio', patchclamp: 'neuronio', na_out: 'neuronio', k_out: 'neuronio', ca_out: 'neuronio', cl_out: 'neuronio',
    blockNav_TTX: 'neuronio', blockKv_TEA: 'neuronio', blockGABA_PTX: 'neuronio', blockCav_Cd: 'neuronio', activeToxins: 'neuronio',
    apActive: 'neuronio', apWavePos: 'neuronio', apBurstTimer: 'neuronio', somaVoltage: 'neuronio', spineHeadScale: 'neuronio',
    pathologyProgression: 'neuronio', hhSolver: 'neuronio',
    // neurotransmissao
    system: 'neurotransmissao', neuroStep: 'neurotransmissao', selectedCleftComponent: 'neurotransmissao', cleftMicroscopeLayer: 'neurotransmissao',
    botulinumToxinActive: 'neurotransmissao', amphetamineActive: 'neurotransmissao', diseaseTreatmentState: 'neurotransmissao',
    particlePool: 'neurotransmissao', 'Effects.materials': 'neurotransmissao',
    // psicofarmacos
    selectedDrugsList: 'psicofarmacos', pharmaTab: 'psicofarmacos',
    pharmaDoseMg: 'psicofarmacos', d2DoseSlider: 'psicofarmacos', block5HT2A: 'psicofarmacos', litemiaVal: 'psicofarmacos', selectedTargetId: 'psicofarmacos',
    // circuitos
    activeCircuitLayers: 'circuitos', activeSubTracts: 'circuitos', brainCircuitViewMode: 'circuitos', selectedNucleusId: 'circuitos',
    expandedSystemAccordions: 'circuitos', expandedFamilies: 'circuitos', desfazerLimpeza: 'circuitos',
    neurostimProtocol: 'circuitos', neurostimFrequency: 'circuitos', neurostimIntensity: 'circuitos', activePathologyProfile: 'circuitos', dimensaoDeSintoma: 'circuitos',
    // psicoeducacao
    patientStoryKey: 'psicoeducacao',
    // ui
    activeMode: 'ui', visualScale: 'ui', dualSubMode: 'ui', isAtlasTheme: 'ui', psicoeducacaoAberta: 'ui', escalaProjecao: 'ui', 'document.body': 'ui', scene3D: 'ui',
};

// ==========================================
// 1. DATASETS & CLINICAL MODELS
// ==========================================

// =========================================================
// v12.55 — A PALETA CENTRAL DOS SISTEMAS (pedido do autor: "cores centrais com diferença de contraste").
//
// Até aqui cada tabela escrevia a sua cor: systemsData, CIRCUIT_LAYER_UI e canonicalSubTractsData discordavam em três
// sistemas (a acetilcolina era laranja num lugar e azul no outro; o opioide, vermelho, rosa-escuro e roxo). Pior:
// DUAS COISAS DIFERENTES USAVAM A MESMA COR — serotonina e opioides em #ef4444, GABA e endocanabinoides em #22c55e.
// Num projetor, isso não é estética: é o aluno vendo duas vias e concluindo que são a mesma.
//
// Agora a cor de cada sistema mora AQUI, e as três tabelas derivam desta. Medido com ΔE2000 (a distância que
// corresponde ao que o olho separa) e com o contraste de texto nos dois temas:
//   • os seis canônicos ficam como estavam — dopamina violeta, serotonina vermelha, noradrenalina azul, glutamato
//     amarelo, GABA verde, acetilcolina laranja. São a identidade das aulas e dos vídeos; não se mexe por 3 pontos.
//   • opioides sai do vermelho da serotonina para o ROSA; endocanabinoides sai do verde do GABA para o VERDE-AZULADO
//     (o 🌿 continua dizendo "canabinoide", então o sentido não depende mais da cor); adenosina vai para um CINZA
//     QUENTE, que a afasta do azul da noradrenalina (ΔE 16,8 → 24,5).
//   • resultado: o par mais parecido sai de ΔE 0,0 (duas cores iguais) para 19,7 — serotonina × acetilcolina, o
//     vermelho e o laranja canônicos. O teto teórico, sem mexer nos canônicos, é 22,9 (dopamina × noradrenalina).
//   • todas passam 4,5:1 como texto no tema escuro E no claro.
// A trava está em tests/paleta.test.ts. Quem quiser mudar uma cor muda UMA linha aqui e a trava confere o resto.
// =========================================================
const CORES_DOS_SISTEMAS = {
    da: '#a855f7',          // dopamina — violeta (canônico)
    '5ht': '#ef4444',       // serotonina — vermelho (canônico)
    ne: '#3b82f6',          // noradrenalina — azul (canônico)
    glu: '#eab308',         // glutamato — amarelo (canônico)
    gaba: '#22c55e',        // GABA — verde (canônico)
    ach: '#f97316',         // acetilcolina — laranja (canônico; era azul no catálogo de sub-vias)
    opioid: '#ec4899',      // opioides — rosa (era o mesmo vermelho da serotonina)
    ecb: '#0d9488',         // endocanabinoides — verde-azulado (era o mesmo verde do GABA)
    adenosine: '#a8a29e',   // adenosina — cinza quente (o sistema "de fundo"; era cinza-azulado, perto do azul da NE)
};
// A camada do conectoma e o catálogo de sub-vias usam a chave longa; o registro faz a ponte entre os dois nomes.
const CAMADA_DO_SISTEMA = {
    dopamine: 'da', serotonin: '5ht', norepinephrine: 'ne', glutamate: 'glu', gaba: 'gaba',
    cholinergic: 'ach', opioid: 'opioid', ecb: 'ecb', adenosine: 'adenosine',
};
/*
 * v12.58 — A SEGUNDA DIMENSÃO VISUAL. Medida na v12.54: não existem 25 cores mutuamente distinguíveis. Doze das
 * dezesseis camadas de circuito caem a menos de ΔE 10 de algum sistema, e três (pânico, CSTC, orexina) vestem a cor
 * EXATA de um sistema — o que é conteúdo, não engano, mas deixa a cor sozinha sem poder de separar. Então a cor
 * passa a codificar UM eixo só, o dos sistemas de neurotransmissor, e a natureza da camada passa a ter forma
 * própria: traço CONTÍNUO e marcador REDONDO para sistema, traço TRACEJADO e marcador QUADRADO para circuito.
 * Duas variáveis visuais independentes, uma delas legível em preto e branco e no daltonismo.
 */
const TRACO_DO_CIRCUITO = [11, 7];   // [risco, vão] em px do canvas; some no traço fino da via 'hipo' e é isso mesmo
function ehCamadaDeSistema(camada) { return Object.prototype.hasOwnProperty.call(CAMADA_DO_SISTEMA, camada); }

// O tom claro de cada camada (o traço fino do conectoma) é a mesma cor lavada com branco: um só número decide.
function clarearCor(hex, quanto) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '')); if (!m) return hex;
    const n = parseInt(m[1], 16);
    const canal = (c) => Math.round(c + (255 - c) * quanto).toString(16).padStart(2, '0');
    return '#' + canal((n >> 16) & 255) + canal((n >> 8) & 255) + canal(n & 255);
}

const systemsData = {
    da: {
        name: 'Dopamina',
        hex: 0xa855f7,
        precursor: 'L-Tirosina',
        synthEnzyme: 'Tirosina Hidroxilase (TH) + AADC',
        reuptake: 'DAT (SLC6A3)',
        vesicle: 'VMAT-2 (SLC18A2)',
        degradEnzyme: 'MAO-A/B, COMT',
        receptors: 'D1 (Gs), D2 (Gi), D3 (Gi), D4 (Gi), D5 (Gs)',
        ions: 'Na⁺ (via D1/cAMP/PKA), K⁺ e Ca²⁺ inibido (via D2)',
        pearl: 'A via mesolímbica modula motivação e delírios; a via nigroestriatal modula motricidade extrapiramidal.',
        stepDetails: [
            "L-Tirosina é convertida em L-DOPA pela enzima limitante Tirosina Hidroxilase (TH + BH4), e depois em Dopamina pela AADC (+ Vitamina B6).",
            "A Dopamina citoplasmática é bombeada para dentro das vesículas pelo transportador VMAT2, usando um gradiente eletroquímico de prótons (H⁺).",
            "A despolarização do potencial de ação (+32 mV) atinge o botão terminal, abrindo canais de Cálcio Cav2.1 e disparando um surto de influxo de Ca²⁺.",
            "O Ca²⁺ liga-se à Sinaptotagmina-1, deflagrando o zíper do complexo SNARE (Sintaxina-1, SNAP-25, Sinaptobrevina/VAMP2) e a exocitose quântica.",
            "A Dopamina liga-se aos receptores D1 pós-sinápticos (despolarizantes via Gs/cAMP) e D2 pré/pós-sinápticos (inibitórios via Gi).",
            "80% da dopamina na fenda é recolhida pela bomba DAT para reciclagem; o restante é degradado pela MAO-A (predominante no neurônio dopaminérgico) e MAO-B glial mitocondriais e pela COMT glial/pós-sináptica."
        ]
    },
    '5ht': {
        name: 'Serotonina',
        hex: 0xef4444,
        precursor: 'L-Triptofano',
        synthEnzyme: 'Triptofano Hidroxilase-2 (TPH2) + AADC',
        reuptake: 'SERT (SLC6A4)',
        vesicle: 'VMAT-2 (SLC18A2)',
        degradEnzyme: 'MAO-A',
        receptors: '5-HT1A (Gi), 5-HT2A (Gq), 5-HT2C (Gq), 5-HT3 (Canal Catiônico), 5-HT7 (Gs)',
        ions: 'Na⁺/K⁺ (via 5-HT3), Ca²⁺ (via 5-HT2A/IP3/DAG)',
        pearl: 'Autorreceptores 5-HT1A somatodendríticos sofrem dessensibilização após 2-4 semanas de ISRS diário, destravando a produção de serotonina.',
        stepDetails: [
            "L-Triptofano plasmático cruza a barreira hematoencefálica e é hidroxilado a 5-HTP pela TPH2, seguido por descarboxilação em 5-HT pela AADC.",
            "A serotonina é concentrada em alta pressão dentro das vesículas pelo VMAT2 contra o gradiente de concentração.",
            "A onda de despolarização axonal abre os canais Cav2.1, promovendo influxo maciço de Ca²⁺ no terminal pré-sináptico.",
            "Fusão vesicular SNARE mediada por Ca²⁺ liberando dezenas de milhares de moléculas de 5-HT na fenda sináptica de 20 nm.",
            "Ativação de receptores pós-sinápticos 5-HT1A, 5-HT2A, 5-HT2C e ativação da cascata neurotrófica BDNF/TrkB.",
            "Recaptação ativa pelo transportador SERT. ISRSs bloqueiam este transportador, aumentando a permanência da serotonina na fenda."
        ]
    },
    glu: {
        name: 'Glutamato',
        hex: 0xeab308,
        precursor: 'Glutamina (Ciclo Neurônio-Glia)',
        synthEnzyme: 'Glutaminase Fosfato-Ativada (PAG)',
        reuptake: 'EAAT2 (GLT-1 no Astrócito)',
        vesicle: 'VGLUT1/2/3',
        degradEnzyme: 'Glutamina Sintetase (Glia)',
        receptors: 'AMPA (Na⁺), NMDA (Ca²⁺/Na⁺ com Mg²⁺ block), Kainato, mGlu grupos I–III',
        ions: 'Influxo maciço de Na⁺ (AMPA) e influxo de Ca²⁺ com ejeção de Mg²⁺ (NMDA)',
        pearl: 'O receptor NMDA é um detector de coincidência: necessita de ligação de Glutamato + Glicina E despolarização prévia via AMPA para ejetar o magnésio.',
        stepDetails: [
            "A Glutamina captada do astrócito vizinho é convertida em Glutamato dentro do terminal pré-sináptico pela enzima mitocondrial PAG.",
            "O Glutamato é empacotado em vesículas esféricas pelo transportador VGLUT utilizando o potencial elétrico transvesicular.",
            "Despolarização axonal deflagra abertura rápida de Cav2.1 e influxo de Ca²⁺ nos microdomínios da Active Zone.",
            "Exocitose quântica mediada por SNARE (Sintaxina/SNAP-25/VAMP2) e liberação de glutamato na fenda.",
            "O Glutamato abre os canais AMPA gerando influxo rápido de Na⁺ (-70 mV ➔ -40 mV). A despolarização ejeta o Mg²⁺ do NMDA, gerando influxo massivo de Ca²⁺ e ativando CaMKII (LTP).",
            "O Glutamato é rapidamente retirado da fenda pelo transportador EAAT2 do astrócito, onde a Glutamina Sintetase o converte em Glutamina inofensiva."
        ]
    },
    gaba: {
        name: 'GABA',
        hex: 0x22c55e,
        precursor: 'Glutamato',
        synthEnzyme: 'Ácido Glutâmico Descarboxilase (GAD65/67 + Vitamina B6)',
        reuptake: 'GAT-1 (Neuronal) e GAT-3 (Glial)',
        vesicle: 'VGAT / VIAAT',
        degradEnzyme: 'GABA-Transaminase (GABA-T)',
        receptors: 'GABAA (Canal Iônico Cl⁻ Pentamérico), GABAB (Metabotrópico Gi)',
        ions: 'Influxo de Cloreto (Cl⁻) que fixa a membrana perto de E_Cl (≈ -70 a -75 mV no neurônio maduro): inibição sobretudo por shunting, com leve hiperpolarização',
        pearl: 'Benzodiazepínicos ligam-se ao sítio alostérico da interface α/γ2 do GABAA aumentando a frequência de abertura do poro de Cl⁻; Barbitúricos aumentam o tempo de abertura.',
        stepDetails: [
            "O Glutamato citoplasmático é descarboxilado a GABA pela enzima GAD (GAD65 nas vesículas e GAD67 no citosol) com coenzima Fosfato de Piridoxal (B6).",
            "O GABA é estocado em vesículas sinápticas pleomórficas/alongadas pelo transportador vesicular VGAT.",
            "Potencial de ação pré-sináptico abre canais Cav2.1 promovendo influxo localizado de Ca²⁺.",
            "Acoplamento dependente de Ca²⁺ do complexo SNARE e liberação do GABA na fenda inibitória.",
            "O GABA liga-se às subunidades α/β do receptor GABAA, abrindo o poro central e promovendo um influxo maciço de íons Cloreto (Cl⁻), hiperpolarizando a célula para -82 mV.",
            "Término da ação por recaptação via GAT-1 e catabolismo mitocondrial pela enzima GABA-Transaminase (inibida pelo Valproato e Vigabatrina)."
        ]
    },
    ne: {
        name: 'Noradrenalina',
        hex: 0x3b82f6,
        precursor: 'Dopamina',
        synthEnzyme: 'Dopamina β-Hidroxilase (DBH + Vit C + Cobre)',
        reuptake: 'NET (SLC6A2)',
        vesicle: 'VMAT-2',
        degradEnzyme: 'MAO-A, COMT',
        receptors: 'α1 (Gq - Ca²⁺), α2 (Gi - Autoinibitório), β1 (Gs - cAMP), β2 (Gs)',
        ions: 'Ca²⁺ (via α1/IP3/DAG), Na⁺ e modulação de canais HCN pré-frontais',
        pearl: 'Os neurônios do Locus Coeruleus modulam o tônus executivo pré-frontal (relação sinal/ruído via α2A) e a resposta autonômica ao estresse.',
        stepDetails: [
            "A Dopamina é sintetizada no citosol e transportada para o interior da vesícula pelo VMAT2, onde a enzima interna DBH a converte em Noradrenalina.",
            "Armazenamento intravesicular concentrado com cromogranina A e ATP.",
            "Chegada do potencial de ação ao terminal abre canais de cálcio Cav2.1 promovendo influxo de Ca²⁺.",
            "Exocitose dependente de Ca²⁺/SNARE e liberação quântica de noradrenalina na fenda adrenérgica.",
            "Ativação de receptores pós-sinápticos α1, β1 e β2, além de autorreceptores inibitórios pré-sinápticos α2A.",
            "Recaptação ativa pelo transportador NET (alvo de Venlafaxina, Desvenlafaxina, Duloxetina e Atomoxetina)."
        ]
    },
    ach: {
        name: 'Acetilcolina',
        hex: 0xf97316,
        precursor: 'Colina + Acetil-CoA',
        synthEnzyme: 'Colina Acetiltransferase (ChAT)',
        reuptake: 'CHT1 (Recaptação de Colina de Alta Afinidade)',
        vesicle: 'VAChT (SLC18A3)',
        degradEnzyme: 'Acetilcolinesterase (AChE)',
        receptors: 'Nicotínicos (Canal Catiônico Na⁺/Ca²⁺), Muscarínicos M1-M5 (GPCR)',
        ions: 'Influxo rápido de Na⁺ e Ca²⁺ através dos receptores nicotínicos ionotrópicos',
        pearl: 'A Acetilcolina é o único neurotransmissor clássico cuja ação não termina por recaptação, mas sim por hidrólise enzimática ultrarrápida na fenda pela AChE.',
        stepDetails: [
            "A Colina reciclada da fenda junta-se ao Acetil-CoA mitocondrial e é acetilada pela enzima citoplasmática ChAT.",
            "A Acetilcolina é bombeada para as vesículas pelo transportador vesicular VAChT acoplado à saída de prótons.",
            "O potencial de ação despolariza o terminal pré-sináptico, ativando os canais de cálcio Cav2.1.",
            "O influxo de Ca²⁺ aciona o complexo SNARE, promovendo exocitose na fenda sináptica colinérgica.",
            "A Acetilcolina liga-se aos receptores nicotínicos (influxo direto de Na⁺/Ca²⁺) e muscarínicos M1/M4 (modulação de córtex e estriado).",
            "A enzima Acetilcolinesterase (AChE) hidrolisa a acetilcolina na fenda em microssegundos em Colina e Acetato; a Colina é recaptada pelo CHT1."
        ]
    },
    // v10.2: os três sistemas abaixo existiam nos botões e nos circuitos, mas não em systemsData (clicar neles quebrava a interface)
    ecb: {
        name: 'Endocanabinoides',
        hex: 0x22c55e,
        precursor: 'Fosfolipídios de membrana (PIP₂ ➔ DAG; NAPE)',
        synthEnzyme: 'DAGLα (2-AG) e NAPE-PLD (Anandamida) — síntese sob demanda',
        reuptake: 'Difusão facilitada (sem transportador vesicular; recaptação por FABP/EMT)',
        vesicle: 'Nenhuma: lipídios sintetizados na hora, não armazenados',
        degradEnzyme: 'MAGL (2-AG, pré-sináptica) e FAAH (Anandamida, pós-sináptica)',
        receptors: 'CB1 (Gi/o pré-sináptico; o GPCR mais abundante do cérebro), CB2 (microglia), TRPV1',
        ions: 'CB1 fecha Cav2.1 e abre GIRK (K⁺) no terminal, suprimindo a liberação de GABA (DSI) ou glutamato (DSE)',
        pearl: 'A sinalização é retrógrada: nasce no neurônio pós-sináptico e freia o pré-sináptico — o oposto da direção clássica. O THC ativa CB1 de forma tônica e não seletiva, e por isso dessensibiliza o sistema.',
        stepDetails: [
            "Não há síntese prévia: a despolarização pós-sináptica ou a ativação de receptores Gq (mGluR1/5, M1) ativa PLCβ ➔ DAGLα, que produz 2-AG a partir do DAG na espinha dendrítica; a NAPE-PLD gera anandamida.",
            "Não há empacotamento vesicular: os endocanabinoides são lipídios e difundem-se pela membrana pós-sináptica assim que sintetizados.",
            "A demanda é disparada pelo Ca²⁺ pós-sináptico (canais NMDA/Cav) — quanto mais forte a atividade, mais 2-AG é produzido.",
            "O 2-AG atravessa a fenda no sentido inverso (retrógrado) e liga-se ao CB1 pré-sináptico, acoplado a Gi/o.",
            "CB1 fecha canais Cav2.1 e abre GIRK: a liberação de GABA (DSI) ou de glutamato (DSE) é suprimida por segundos a minutos — plasticidade de curto prazo dependente de atividade.",
            "O 2-AG é hidrolisado pela MAGL no terminal pré-sináptico e a anandamida pela FAAH pós-sináptica; o ácido araquidônico resultante alimenta a via da COX-2."
        ]
    },
    opioid: {
        name: 'Opioides Endógenos',
        hex: 0xef4444,
        precursor: 'Pró-hormônios POMC, Pró-encefalina e Pró-dinorfina (síntese no soma)',
        synthEnzyme: 'Pró-hormônio convertases PC1/3 e PC2 + Carboxipeptidase E',
        reuptake: 'Nenhuma: inativação por proteólise extracelular',
        vesicle: 'Vesículas de núcleo denso (transporte axonal a partir do soma)',
        degradEnzyme: 'Neprilisina (enkefalinase) e Aminopeptidase N',
        receptors: 'μ (MOR), δ (DOR) e κ (KOR) — todos GPCR Gi/o; NOP/nociceptina',
        ions: 'βγ abre GIRK (K⁺) e fecha Cav; α inibe adenilato-ciclase (↓cAMP): hiperpolarização e menor liberação',
        pearl: 'MOR na VTA inibe interneurônios GABA e desinibe a dopamina (recompensa); KOR/dinorfina produz disforia — o sistema tem um acelerador (μ) e um freio anti-recompensa (κ).',
        stepDetails: [
            "Os peptídeos são sintetizados como pró-hormônios no corpo celular (POMC ➔ β-endorfina; PENK ➔ encefalinas; PDYN ➔ dinorfinas) e clivados por PC1/3, PC2 e CPE dentro dos grânulos.",
            "Os peptídeos maduros viajam em vesículas de núcleo denso por transporte axonal até o terminal — não há transportador vesicular de recarga.",
            "A liberação exige disparos de alta frequência (rajadas), que elevam o Ca²⁺ o suficiente para exocitar vesículas de núcleo denso, situadas fora da zona ativa.",
            "Os peptídeos difundem-se por transmissão de volume, alcançando receptores μ/δ/κ a distâncias maiores que as monoaminas.",
            "A ativação de MOR/DOR/KOR (Gi/o) abre GIRK, fecha Cav e reduz o cAMP: analgesia no PAG e corno dorsal, recompensa na VTA (μ) ou disforia (κ).",
            "A ação termina por proteólise extracelular (neprilisina, aminopeptidase N) — não há recaptação; a naloxona e a naltrexona bloqueiam os receptores competitivamente."
        ]
    },
    adenosine: {
        name: 'Adenosina',
        color: '#94a3b8',
        hex: 0x94a3b8,
        precursor: 'ATP extracelular (co-transmissor vesicular e liberação astrocitária)',
        synthEnzyme: 'Ectonucleotidases CD39 ➔ CD73 (ATP ➔ ADP ➔ AMP ➔ Adenosina)',
        reuptake: 'Transportadores equilibrativos ENT1/ENT2 ➔ Adenosina-quinase astrocitária',
        vesicle: 'ATP em vesículas (co-liberado com glutamato/ACh); a adenosina em si não é armazenada',
        degradEnzyme: 'Adenosina-quinase (ADK, refosforila) e Adenosina-desaminase (ADA ➔ inosina)',
        receptors: 'A1 (Gi/o; córtex, hipocampo, SRAA) e A2A (Gs; estriado, em heterodímeros com D2), A2B, A3',
        ions: 'A1 abre GIRK e fecha Cav (inibição pré e pós-sináptica); A2A eleva cAMP no estriado',
        pearl: 'A adenosina extracelular acumula-se com as horas de vigília e é o substrato molecular da pressão homeostática do sono; a cafeína bloqueia A1/A2A sem remover o acúmulo — daí o rebote.',
        stepDetails: [
            "Não há síntese enzimática clássica: o ATP liberado por neurônios (co-transmissor) e astrócitos é o precursor imediato.",
            "O ATP é empacotado em vesículas junto a outros transmissores (VNUT); a adenosina extracelular nasce fora da célula.",
            "A atividade neuronal e metabólica intensa eleva a liberação de ATP — quanto mais vigília, mais substrato extracelular.",
            "As ectonucleotidases CD39 e CD73 hidrolisam ATP ➔ ADP ➔ AMP ➔ adenosina na fenda e no espaço extrassináptico.",
            "A adenosina ativa A1 (Gi/o: GIRK, ↓Cav, ↓glutamato — sonolência) e A2A (Gs, estriado: modula a via indireta e o receptor D2).",
            "ENT1/2 recaptam a adenosina, que é refosforilada pela adenosina-quinase (sobretudo astrocitária) ou desaminada pela ADA em inosina."
        ]
    }
};

// v12.55: a cor de cada sistema vem da paleta central — a tabela nao escreve cor, ela recebe.
for (const [id, cor] of Object.entries(CORES_DOS_SISTEMAS)) if (systemsData[id]) systemsData[id].color = cor;

// ==========================================
// CASOS CLÍNICOS ROTEIRIZADOS (v11.0) — fictícios, para ensino. Cada passo = texto do professor
// + pergunta opcional (respondida ANTES de revelar) + cena do simulador + o que observar.
// Campos de cena aceitos: qualquer campo de SCENE_FIELDS (activeMode, system, visualScale, neuroStep,
// selectedDrugsList, activeCircuitLayers, activePathologyProfile, neurostimProtocol, patientStoryKey, ...).
// ==========================================
const clinicalCasesData = [
    {
        id: 'fep_2024', validado_em: '2026-08-31', title: 'Primeiro episódio psicótico', area: 'Psicose',
        patient: 'Homem, 22 anos, estudante. Há 3 meses isolado, convicto de que colegas comentam sobre ele nas redes; ouve uma voz que narra seus atos. Sem uso de substâncias nas últimas semanas; sem alterações do nível de consciência.',
        objective: 'Ir da fenomenologia da saliência aberrante ao circuito, ao receptor, à escolha do antipsicótico e à psicoeducação da família.',
        steps: [
            { title: 'Do sintoma ao circuito', teacher: 'O delírio de referência e a alucinação auditiva não são "excesso de dopamina" em abstrato: são a marcação de significado (saliência) atribuída a estímulos neutros. Antes de olhar o circuito, decida qual via explica melhor os sintomas positivos.',
              question: { q: 'Qual via dopaminérgica está hiperativa nos sintomas positivos da psicose?', options: ['Mesocortical (VTA ➔ DLPFC)', 'Mesolímbica (VTA ➔ Accumbens)', 'Nigroestriatal (SNc ➔ Estriado dorsal)', 'Tuberoinfundibular (Hipotálamo ➔ Hipófise)'], correct: 1, explain: 'A hipótese da saliência aberrante (Kapur 2003) localiza os sintomas positivos na hiperatividade fásica da via mesolímbica; a mesocortical está hipoativa (sintomas negativos/cognitivos); a nigroestriatal e a tuberoinfundibular são as vias dos efeitos adversos (SEP, prolactina).' },
              scene: { activeMode: MODO.circuitos, v: 2, visualScale: 'brain2d', system: 'da', activeCircuitLayers: ['dopamine'], activeSubTracts: [], activePathologyProfile: 'schizophrenia' },
              observe: 'No conectoma, o sistema dopaminérgico isolado com o perfil "Esquizofrenia" ativo: mesolímbica em destaque, mesocortical atenuada. Leia no inspector os 4 níveis da fisiopatologia.' },
            { title: 'O filtro talâmico e a saliência', teacher: 'Passe para o cérebro 3D e mostre onde a hiperdopaminergia estriatal "abre" o filtro talâmico: o excesso de sinal chega ao córtex como significado. É a ponte entre a clínica (tudo parece dirigido a mim) e a anatomia.',
              scene: { activeMode: MODO.circuitos, v: 2, visualScale: 'brain3d', activeCircuitLayers: ['dopamine', 'cstc'], activePathologyProfile: 'schizophrenia' },
              camera: { pos: [18, 14, 28], target: [0, 0, 0] },
              observe: 'Gire o cérebro: VTA → accumbens e o loop cortico-estriato-talâmico. O botão ⚡ Disparar PA envia fótons pelas vias ativas.' },
            { title: 'Escolher o antipsicótico', teacher: 'Sintomas positivos intensos, primeiro episódio, sem comorbidade cardíaca, paciente jovem que se preocupa com peso. Antes de abrir a farmacoteca, escolha.',
              question: { q: 'Qual seria a escolha mais razoável de primeira linha?', options: ['Clozapina 300 mg', 'Risperidona 2–4 mg', 'Haloperidol 15 mg', 'Olanzapina 20 mg'], correct: 1, explain: 'Primeiro episódio responde a doses menores; risperidona em dose baixa-moderada tem eficácia sólida e perfil metabólico intermediário. Clozapina é reservada à refratariedade (≥2 falhas); haloperidol em dose alta ultrapassa 80% de D2 (SEP); olanzapina 20 mg carrega ganho de peso e síndrome metabólica — problema real em um jovem preocupado com o peso.' },
              scene: { activeMode: MODO.psicofarmacos, v: 2, visualScale: 'cleft2d', system: 'da', pharmaTab: 'poly', selectedDrugsList: ['risperidona'] },
              observe: 'No motor de polifarmácia, veja a ocupação D2 estimada da risperidona (na janela de 65–78%) e o bloqueio 5-HT2A. Na fenda, a molécula acoplada ao receptor.' },
            { title: 'Quando a dose passa do ponto', teacher: 'Agora adicione haloperidol à prescrição — simulando uma "reforçada" na emergência. Observe o que acontece com a ocupação D2 combinada e por que o modelo competitivo importa.',
              scene: { activeMode: MODO.psicofarmacos, v: 2, visualScale: 'cleft2d', system: 'da', pharmaTab: 'poly', selectedDrugsList: ['risperidona', 'haloperidol'] },
              observe: 'A barra de D2 ultrapassa 78%: aparece o alerta de SEP/hiperprolactinemia. Dois bloqueadores de D2 não somam ocupações — competem — mas o resultado passa da zona segura.' },
            { title: 'Acatisia e o agonista parcial', teacher: 'Duas semanas depois: inquietação nas pernas, não consegue ficar sentado. Antes de reduzir dose ou trocar, pergunte: o que a acatisia diz sobre o mecanismo?',
              question: { q: 'A acatisia é mais provável com qual perfil receptorial?', options: ['Bloqueio H1 intenso', 'Ocupação D2 alta, inclusive com agonistas parciais como aripiprazol', 'Bloqueio M1', 'Agonismo 5-HT1A'], correct: 1, explain: 'A acatisia é o efeito extrapiramidal mais comum e ocorre também com aripiprazol apesar do baixo parkinsonismo: liga-se à ocupação D2 elevada e à modulação 5-HT2A/D2, não ao bloqueio histaminérgico ou muscarínico. Conduta: reduzir dose, propranolol ou trocar para agente de menor ocupação.' },
              scene: { activeMode: MODO.psicofarmacos, v: 2, visualScale: 'cleft2d', system: 'da', pharmaTab: 'classes', pharmaSearch: 'aripiprazol' },
              observe: 'Na farmacoteca por classe, leia a pérola do aripiprazol: >85% de ocupação com pouco parkinsonismo, mas acatisia frequente.' },
            { title: 'Conversar com a família', teacher: 'Feche o caso com a psicoeducação: a família pergunta se o remédio "apaga a personalidade". Use o roteiro do "detector de importância" e imprima a folha para entregar.',
              scene: { activeMode: MODO.neurotransmissao, psicoeducacaoAberta: true, v: 2, visualScale: 'cleft2d', patientStoryKey: 'antipsychotic_why' },
              observe: 'O roteiro em linguagem leiga aparece no inspector com o botão de imprimir. Leia em voz alta a metáfora: é o texto que a família leva para casa.' }
        ],
        outcome: 'Risperidona 3 mg com resposta em 4 semanas; acatisia manejada com redução para 2 mg. Manutenção por ≥ 12–24 meses após o primeiro episódio, com monitorização metabólica.',
        references: 'Kapur S. Am J Psychiatry 2003; Kapur & Seeman 2001; APA Practice Guideline for Schizophrenia 2020; Maudsley 14ª ed.'
    },
    {
        id: 'trd_2024', validado_em: '2026-08-31', title: 'Depressão resistente ao tratamento', area: 'Humor',
        patient: 'Mulher, 41 anos. Terceiro episódio depressivo, anedonia profunda, insônia terminal, ideação de morte sem plano. Falha a sertralina 200 mg (10 semanas) e a venlafaxina 225 mg (8 semanas), ambas com adesão confirmada.',
        objective: 'Entender por que a monoterapia demora e falha, o que a augmentação faz no circuito, como se monitora o lítio e onde entra a cetamina.',
        steps: [
            { title: 'Por que o ISRS demora?', teacher: 'Comece pela pergunta que a paciente fez na primeira consulta: "se o remédio já bloqueia a recaptação no primeiro dia, por que a melhora demora semanas?". Faça o aluno prever antes de mostrar a fenda.',
              question: { q: 'Qual é a explicação mais aceita para a latência dos ISRS?', options: ['A absorção do fármaco é lenta', 'Dessensibilização dos autorreceptores 5-HT1A somatodendríticos na rafe, que só então libera o disparo', 'É preciso esgotar a serotonina antiga', 'O efeito depende de síntese de novos receptores D2'], correct: 1, explain: 'No início, o aumento de 5-HT na rafe ativa autorreceptores 5-HT1A que freiam o disparo; em 2–4 semanas eles dessensibilizam e a transmissão terminal aumenta. É hipótese dominante (não consenso): parte da resposta pode surgir já na 1ª semana.' },
              scene: { activeMode: MODO.neurotransmissao, v: 2, visualScale: 'cleft2d', system: '5ht', neuroStep: 6, selectedDrugsList: ['sertralina'] },
              observe: 'Fenda serotoninérgica com a sertralina acoplada ao SERT; no Passo 6, a tabela mostra a recaptação e a MAO-A como vias de término.' },
            { title: 'O circuito da anedonia', teacher: 'Anedonia e desespero refratário não vivem só na rafe. Mostre o freio anti-recompensa: a habênula lateral hiperativa silenciando VTA e rafe via RMTg.',
              scene: { activeMode: MODO.circuitos, v: 2, visualScale: 'brain2d', activeCircuitLayers: ['habenula', 'dopamine', 'serotonin'], activePathologyProfile: 'depression_melancholic' },
              observe: 'Clique na habênula lateral no conectoma: o dossiê descreve o erro de previsão negativo e a hiperatividade sustentada na depressão.' },
            { title: 'Augmentar com lítio', teacher: 'Duas falhas adequadas: é hora de augmentação. O lítio tem o melhor dado de redução de suicídio. Monte a prescrição e leia o alerta de interações.',
              question: { q: 'Qual faixa de litemia se busca na augmentação em depressão unipolar?', options: ['0,2–0,4 mEq/L', '0,6–0,8 (até 1,0) mEq/L', '1,2–1,5 mEq/L', 'Não é preciso dosar'], correct: 1, explain: 'Na augmentação, 0,6–0,8 mEq/L (até 1,0) equilibra eficácia e tolerabilidade; acima de 1,2 começam sinais de toxicidade. Dosar 5–7 dias após ajuste e a cada 3–6 meses, com creatinina e TSH.' },
              scene: { activeMode: MODO.psicofarmacos, v: 2, visualScale: 'cleft2d', system: 'glu', pharmaTab: 'poly', selectedDrugsList: ['venlafaxina', 'litio'], litemiaVal: 0.7 },
              observe: 'No motor de polifarmácia, o lítio aparece sem interação CYP mas com a nota sobre AINEs, IECA e tiazídicos; a carga serotoninérgica segue baixa.' },
            { title: 'Explicar os exames à paciente', teacher: 'Ela pergunta por que "tanto exame de sangue". Use o roteiro do termostato de faixa estreita — é a diferença entre adesão e abandono.',
              scene: { activeMode: MODO.neurotransmissao, psicoeducacaoAberta: true, v: 2, visualScale: 'cleft2d', patientStoryKey: 'lithium_monitoring' },
              observe: 'Roteiro de psicoeducação do lítio, com a mensagem-chave sobre água, sal e anti-inflamatórios.' },
            { title: 'Se ainda assim não responder: cetamina', teacher: 'Após 6 semanas de augmentação sem resposta e ideação persistente, a esquetamina intranasal entra como opção de ação rápida. Peça ao aluno para prever onde ela age — e o que ainda não sabemos.',
              question: { q: 'Qual mecanismo é hoje o mais sustentado para o efeito rápido da cetamina?', options: ['Inibição de SERT', 'Antagonismo NMDA em interneurônios GABA ➔ surto de glutamato ➔ AMPA ➔ BDNF/mTORC1 e sinaptogênese', 'Agonismo D2', 'Bloqueio de canais de sódio'], correct: 1, explain: 'A desinibição glutamatérgica com sinaptogênese rápida via BDNF/mTORC1 é o modelo mais sustentado (Duman, Krystal); o bloqueio do bursting da habênula (Yang 2018) é achado em roedores ainda não demonstrado em humanos.' },
              scene: { activeMode: MODO.neurotransmissao, v: 2, visualScale: 'cleft2d', system: 'glu', neuroStep: 5, selectedDrugsList: ['cetamina'] },
              observe: 'Fenda glutamatérgica com a cetamina no NMDA; no Passo 5, os dossiês de AMPA e CaMKII explicam a plasticidade que se segue.' }
        ],
        outcome: 'Resposta parcial com lítio 0,7 mEq/L em 4 semanas; esquetamina intranasal em protocolo de indução com remissão da ideação em 2 semanas. Manutenção com venlafaxina + lítio e psicoterapia.',
        references: 'CANMAT 2016/2023; Cipriani BMJ 2013; Maudsley 14ª ed.; Yang et al. Nature 2018 (roedores); Krystal et al. Neuron 2019.'
    },
    {
        id: 'panic_2024', validado_em: '2026-08-31', title: 'Transtorno de pânico', area: 'Ansiedade',
        patient: 'Homem, 29 anos. Cinco crises em 2 meses: palpitação, sufocação, medo de morrer, pico em 10 minutos; agora evita o metrô. Dois atendimentos em pronto-socorro com ECG e troponina normais.',
        objective: 'Separar o circuito do pânico do circuito do medo condicionado, escolher e titular o ISRS do jeito certo, limitar o benzodiazepínico e explicar o remédio de resgate.',
        steps: [
            { title: 'Medo, pânico e ansiedade não são o mesmo circuito', teacher: 'Antes de abrir o conectoma, peça ao aluno para prever qual estrutura dispara o "alarme de sufocação" do pânico, distinto do medo condicionado da amígdala.',
              question: { q: 'Qual estrutura é central no alarme de sufocação do pânico?', options: ['Hipocampo', 'Substância cinzenta periaquedutal (PAG) e núcleo do trato solitário / parabraquial', 'Córtex occipital', 'Núcleo accumbens'], correct: 1, explain: 'No modelo de Klein/Stahl, o pânico é um alarme de sufocação falso: quimiorreceptores (NTS/parabraquial), PAG e amígdala central — a resposta de fuga surge sem um estímulo condicionado. O medo condicionado (LeDoux) parte da amígdala lateral; o TAG é o loop de preocupação CSTC.' },
              scene: { activeMode: MODO.circuitos, v: 2, visualScale: 'brain2d', activeCircuitLayers: ['panic'], activeSubTracts: [], activePathologyProfile: 'panic_disorder' },
              observe: 'Só o circuito do pânico está visível. Compare depois ativando "Medo" e "GAD/TAG" na barra: três circuitos, três clínicas.' },
            { title: 'O ISRS certo, do jeito certo', teacher: 'ISRS é primeira linha, mas no pânico o erro clássico é começar com a dose de depressão. Pergunte o porquê.',
              question: { q: 'Como iniciar sertralina no transtorno de pânico?', options: ['200 mg no primeiro dia para efeito rápido', '25 mg e titular lentamente (start low, go slow), porque a ativação inicial piora a ansiedade', 'Só usar se houver depressão associada', 'Em dias alternados'], correct: 1, explain: 'Pacientes com pânico são hipersensíveis à ativação serotoninérgica inicial (jitteriness). Começa-se com metade da dose habitual e titula-se a cada 1–2 semanas até a dose-alvo, que é semelhante à da depressão.' },
              scene: { activeMode: MODO.psicofarmacos, v: 2, visualScale: 'cleft2d', system: '5ht', pharmaTab: 'poly', selectedDrugsList: ['sertralina'] },
              observe: 'Fenda serotoninérgica com a sertralina; no painel, ocupação de SERT alta já em dose usual — a titulação é por tolerabilidade, não por ocupação.' },
            { title: 'O benzodiazepínico como ponte', teacher: 'Clonazepam por 2–4 semanas cobre a latência do ISRS. Mostre no receptor GABA-A onde ele age — e por que o uso crônico é problema.',
              scene: { activeMode: MODO.neurotransmissao, v: 2, visualScale: 'cleft2d', system: 'gaba', neuroStep: 5, selectedDrugsList: ['clonazepam'] },
              observe: 'O clonazepam na interface α/γ2 do GABA-A: aumenta a frequência de abertura do poro de Cl⁻. No Passo 5, o dossiê de GABA-A δ contrasta inibição fásica e tônica.' },
            { title: 'Remédio diário vs remédio de resgate', teacher: 'Na segunda consulta ele diz que "o clonazepam funciona, a sertralina não". Use o roteiro da aula de natação vs boia — e imprima.',
              scene: { activeMode: MODO.neurotransmissao, psicoeducacaoAberta: true, v: 2, visualScale: 'cleft2d', patientStoryKey: 'maintenance_vs_rescue' },
              observe: 'Roteiro da boia vs aula de natação, com a mensagem de que o resgate não deve virar rotina diária.' },
            { title: 'Extinção: o que a TCC faz no circuito', teacher: 'Termine mostrando o freio da extinção — vmPFC ➔ células intercaladas ➔ amígdala central — que a exposição interoceptiva fortalece. É o argumento neurobiológico para encaminhar à TCC.',
              scene: { activeMode: MODO.circuitos, v: 2, visualScale: 'brain3d', activeCircuitLayers: ['fear', 'panic'], activePathologyProfile: 'panic_disorder' },
              camera: { pos: [-20, 10, 26], target: [0, -1, 0] },
              observe: 'No cérebro 3D, medo e pânico lado a lado; localize vmPFC e amígdala. Aqui vale um experimento 🔮 sobre a extinção do medo.' }
        ],
        outcome: 'Sertralina titulada até 100 mg; clonazepam retirado em 4 semanas; TCC com exposição interoceptiva. Sem crises em 3 meses; retomou o metrô.',
        references: 'Stahl 5ª ed. (cap. Ansiedade); Klein DF, Arch Gen Psychiatry 1993; Tovote 2015; LeDoux 2000; Maudsley 14ª ed.'
    }
];

const SOURCES = {
    schobel2013: "SCHOBEL, S. A. et al. Imaging patients with psychosis and a mouse model establishes a spreading pattern of hippocampal dysfunction and implicates glutamate as a driver. <i>Neuron</i>, v. 78, n. 1, p. 81-93, 2013. DOI 10.1016/j.neuron.2013.02.011. PMID 23583108.",
    lodge2007: "LODGE, D. J.; GRACE, A. A. Aberrant hippocampal activity underlies the dopamine dysregulation in an animal model of schizophrenia. <i>Journal of Neuroscience</i>, v. 27, n. 42, p. 11424-11430, 2007. DOI 10.1523/JNEUROSCI.2847-07.2007. PMID 17942737.",
    moghaddam2012: "MOGHADDAM, B.; JAVITT, D. From revolution to evolution: the glutamate hypothesis of schizophrenia and its implication for treatment. <i>Neuropsychopharmacology</i>, v. 37, n. 1, p. 4-15, 2012. DOI 10.1038/npp.2011.181. PMID 21956446.",
    stahl5: "STAHL, S. M. <i>Stahl's Essential Psychopharmacology: Neuroscientific Basis and Practical Applications</i>. 5. ed. Cambridge: Cambridge University Press, 2021.",
    maudsley14: "TAYLOR, D. M.; BARNES, T. R. E.; YOUNG, A. H. <i>The Maudsley Prescribing Guidelines in Psychiatry</i>. 14. ed. Hoboken: Wiley-Blackwell, 2021.",
    kandel6: "KANDEL, E. R. et al. <i>Principles of Neural Science</i>. 6. ed. New York: McGraw-Hill, 2021.",
    hh1952: "HODGKIN, A. L.; HUXLEY, A. F. A quantitative description of membrane current and its application to conduction and excitation in nerve. <i>The Journal of Physiology</i>, v. 117, n. 4, p. 500-544, 1952.",
    kapur2001: "KAPUR, S.; SEEMAN, P. Does fast dissociation from the dopamine D2 receptor explain the action of atypical antipsychotics? <i>American Journal of Psychiatry</i>, v. 158, n. 3, p. 360-369, 2001.",
    kapur2000: "KAPUR, S.; ZIPURSKY, R.; JONES, C.; REMINGTON, G.; HOULE, S. Relationship between dopamine D2 occupancy, clinical response, and side effects. <i>American Journal of Psychiatry</i>, v. 157, n. 4, p. 514-520, 2000.",
    kapur2003: "KAPUR, S. Psychosis as a state of aberrant salience. <i>American Journal of Psychiatry</i>, v. 160, n. 1, p. 13-23, 2003.",
    howes2009: "HOWES, O. D.; KAPUR, S. The dopamine hypothesis of schizophrenia: version III — the final common pathway. <i>Schizophrenia Bulletin</i>, v. 35, n. 3, p. 549-562, 2009. DOI 10.1093/schbul/sbp006. PMID 19325164.",
    andreasen1982: "ANDREASEN, N. C. Negative symptoms in schizophrenia: definition and reliability. <i>Archives of General Psychiatry</i>, v. 39, n. 7, p. 784-788, 1982. DOI 10.1001/archpsyc.1982.04290070020005. PMID 7165477.",
    dunkley2003: "DUNKLEY, E. J. C. et al. The Hunter Serotonin Toxicity Criteria. <i>QJM</i>, v. 96, n. 9, p. 635-642, 2003.",
    boyer2005: "BOYER, E. W.; SHANNON, M. The serotonin syndrome. <i>New England Journal of Medicine</i>, v. 352, n. 11, p. 1112-1120, 2005.",
    cipriani2013: "CIPRIANI, A. et al. Lithium in the prevention of suicide in mood disorders: updated systematic review and meta-analysis. <i>BMJ</i>, v. 346, f3646, 2013.",
    canmat2018: "YATHAM, L. N. et al. CANMAT and ISBD 2018 guidelines for the management of patients with bipolar disorder. <i>Bipolar Disorders</i>, v. 20, n. 2, p. 97-170, 2018.",
    canmat2016: "KENNEDY, S. H. et al. CANMAT 2016 clinical guidelines for the management of adults with major depressive disorder. <i>Canadian Journal of Psychiatry</i>, v. 61, n. 9, p. 540-560, 2016.",
    tovote2015: "TOVOTE, P.; FADOK, J. P.; LÜTHI, A. Neuronal circuits for fear and anxiety. <i>Nature Reviews Neuroscience</i>, v. 16, n. 6, p. 317-331, 2015.",
    ledoux2000: "LEDOUX, J. E. Emotion circuits in the brain. <i>Annual Review of Neuroscience</i>, v. 23, p. 155-184, 2000.",
    klein1993: "KLEIN, D. F. False suffocation alarms, spontaneous panics, and related conditions. <i>Archives of General Psychiatry</i>, v. 50, n. 4, p. 306-317, 1993.",
    hu2020: "HU, H.; CUI, Y.; YANG, Y. Circuits and functions of the lateral habenula in health and in disease. <i>Nature Reviews Neuroscience</i>, v. 21, n. 5, p. 277-295, 2020.",
    treadway2011: "TREADWAY, M. T.; ZALD, D. H. Reconsidering anhedonia in depression: lessons from translational neuroscience. <i>Neuroscience and Biobehavioral Reviews</i>, v. 35, n. 3, p. 537-555, 2011. DOI 10.1016/j.neubiorev.2010.06.006. PMID 20603146.",
    yang2018: "YANG, Y. et al. Ketamine blocks bursting in the lateral habenula to rapidly relieve depression. <i>Nature</i>, v. 554, p. 317-322, 2018.",
    sudhof2012: "SÜDHOF, T. C. The presynaptic active zone. <i>Neuron</i>, v. 75, n. 1, p. 11-25, 2012.",
    tang2016: "TANG, A.-H. et al. A trans-synaptic nanocolumn aligns neurotransmitter release to receptors. <i>Nature</i>, v. 536, p. 210-214, 2016.",
    apa2020: "AMERICAN PSYCHIATRIC ASSOCIATION. <i>Practice Guideline for the Treatment of Patients With Schizophrenia</i>. 3. ed. Washington: APA, 2020.",
    crediblemeds: "WOOSLEY, R. L. et al. <i>CredibleMeds QTdrugs List</i>. Oro Valley: AZCERT. Disponível em: https://www.crediblemeds.org.",
    menon2011: "MENON, V. Large-scale brain networks and psychopathology: a unifying triple network model. <i>Trends in Cognitive Sciences</i>, v. 15, n. 10, p. 483-506, 2011.",
    ulrichlai2009: "ULRICH-LAI, Y. M.; HERMAN, J. P. Neural regulation of endocrine and autonomic stress responses. <i>Nature Reviews Neuroscience</i>, v. 10, n. 6, p. 397-409, 2009.",
    castillo2012: "CASTILLO, P. E. et al. Endocannabinoid signaling and synaptic function. <i>Neuron</i>, v. 76, n. 1, p. 70-81, 2012.",
    lefaucheur2020: "LEFAUCHEUR, J.-P. et al. Evidence-based guidelines on the therapeutic use of repetitive transcranial magnetic stimulation (rTMS): an update (2014-2018). <i>Clinical Neurophysiology</i>, v. 131, n. 2, p. 474-528, 2020.",
    krystal2019: "KRYSTAL, J. H. et al. Ketamine: a paradigm shift for depression research and treatment. <i>Neuron</i>, v. 101, n. 5, p. 774-778, 2019.",
    arnsten2011: "ARNSTEN, A. F. T. Catecholamine influences on dorsolateral prefrontal cortical networks. <i>Biological Psychiatry</i>, v. 69, n. 12, p. e89-e99, 2011.",
    borbely2016: "BORBÉLY, A. A. et al. The two-process model of sleep regulation: a reappraisal. <i>Journal of Sleep Research</i>, v. 25, n. 2, p. 131-143, 2016.",
    pdsp: "ROTH, B. L. et al. <i>PDSP Ki Database</i>. Chapel Hill: NIMH Psychoactive Drug Screening Program. Disponível em: https://pdsp.unc.edu/databases/kidb.php.",
    cortese2018: "CORTESE, S. et al. Comparative efficacy and tolerability of medications for attention-deficit hyperactivity disorder in children, adolescents, and adults: a systematic review and network meta-analysis. <i>The Lancet Psychiatry</i>, v. 5, n. 9, p. 727-738, 2018. DOI 10.1016/S2215-0366(18)30269-4. PMID 30097390.",
    li2014: "LI, X. et al. HLA-B*1502 increases the risk of phenytoin or lamotrigine induced Stevens-Johnson syndrome/toxic epidermal necrolysis: evidence from a meta-analysis of nine case-control studies. <i>Drug Research</i>, v. 65, n. 2, p. 107-111, 2014. DOI 10.1055/s-0034-1375684. PMID 24871931.",
    zeng2014: "ZENG, T. et al. Association of HLA-B*1502 allele with lamotrigine-induced Stevens-Johnson syndrome and toxic epidermal necrolysis in Han Chinese subjects: a meta-analysis. <i>International Journal of Dermatology</i>, v. 54, n. 4, p. 488-493, 2014. DOI 10.1111/ijd.12570. PMID 25428396.",
    shi2017: "SHI, Y.-W. et al. HLA-A*24:02 as a common risk factor for antiepileptic drug-induced cutaneous adverse reactions. <i>Neurology</i>, v. 88, n. 23, p. 2183-2191, 2017. DOI 10.1212/WNL.0000000000004008. PMID 28476759.",
    chen2011: "CHEN, P. et al. Carbamazepine-induced toxic effects and HLA-B*1502 screening in Taiwan. <i>The New England Journal of Medicine</i>, v. 364, n. 12, p. 1126-1133, 2011. DOI 10.1056/NEJMoa1009717. PMID 21428768.",
    lee2010: "LEE, M. T. M. et al. Pharmacogenetics of toxic epidermal necrolysis. <i>Expert Opinion on Pharmacotherapy</i>, v. 11, n. 13, p. 2153-2162, 2010. DOI 10.1517/14656566.2010.495120. PMID 20536296.",
    sun2000: "SUN, L.; LIN, S. S. The anticonvulsant SGB-017 (ADCI) blocks voltage-gated sodium channels in rat and human neurons: comparison with carbamazepine. <i>Epilepsia</i>, v. 41, n. 3, p. 263-270, 2000. DOI 10.1111/j.1528-1157.2000.tb00154.x. PMID 10714396.",
    buyan2021: "BUYAN, A.; WHITFIELD, A. A.; CORRY, B. Differences in local anaesthetic and antiepileptic binding in the inactivated state of human sodium channel Nav1.4. <i>Biophysical Journal</i>, v. 120, n. 24, p. 5553-5563, 2021. DOI 10.1016/j.bpj.2021.11.014. PMID 34774501.",
    deligiannidis2021: "DELIGIANNIDIS, K. M. et al. Effect of zuranolone vs placebo in postpartum depression: a randomized clinical trial. <i>JAMA Psychiatry</i>, v. 78, n. 9, p. 951-959, 2021. DOI 10.1001/jamapsychiatry.2021.1559. PMID 34190962.",
    deligiannidis2023: "DELIGIANNIDIS, K. M. et al. Effect of zuranolone on concurrent anxiety and insomnia symptoms in women with postpartum depression. <i>The Journal of Clinical Psychiatry</i>, v. 84, n. 1, 22m14475, 2023. DOI 10.4088/JCP.22m14475. PMID 36724109.",
    frieder2019: "FRIEDER, A. et al. Pharmacotherapy of postpartum depression: current approaches and novel drug development. <i>CNS Drugs</i>, v. 33, n. 3, p. 265-282, 2019. DOI 10.1007/s40263-019-00605-7. PMID 30790145.",
    izhikevich2003: "IZHIKEVICH, E. M. Simple model of spiking neurons. <i>IEEE Transactions on Neural Networks</i>, v. 14, n. 6, p. 1569-1572, 2003. DOI 10.1109/TNN.2003.820440. PMID 18244602.",
    sohal2009: "SOHAL, V. S. et al. Parvalbumin neurons and gamma rhythms enhance cortical circuit performance. <i>Nature</i>, v. 459, n. 7247, p. 698-702, 2009. DOI 10.1038/nature07991. PMID 19396159.",
    kann2015: "KANN, O. The interneuron energy hypothesis: implications for brain disease. <i>Neurobiology of Disease</i>, v. 90, p. 75-85, 2015. DOI 10.1016/j.nbd.2015.08.005. PMID 26284893.",
    yokoi2002: "YOKOI, F. et al. Dopamine D2 and D3 receptor occupancy in normal humans treated with the antipsychotic drug aripiprazole (OPC 14597): a study using positron emission tomography and [11C]raclopride. <i>Neuropsychopharmacology</i>, v. 27, n. 2, p. 248-259, 2002. DOI 10.1016/S0893-133X(02)00304-4. PMID 12093598.",
    mamo2007: "MAMO, D. et al. Differential effects of aripiprazole on D2, 5-HT2, and 5-HT1A receptor occupancy in patients with schizophrenia: a triple tracer PET study. <i>The American Journal of Psychiatry</i>, v. 164, n. 9, p. 1411-1417, 2007. DOI 10.1176/appi.ajp.2007.06091479. PMID 17728427.",
    hashimoto2021: "HASHIMOTO, Y. et al. Lamotrigine in the maintenance treatment of bipolar disorder. <i>Cochrane Database of Systematic Reviews</i>, v. 9, n. 9, CD013575, 2021. DOI 10.1002/14651858.CD013575.pub2. PMID 34523118.",
    large2005: "LARGE, C. H.; WEBSTER, E. L.; GOFF, D. C. The potential role of lamotrigine in schizophrenia. <i>Psychopharmacology</i>, v. 181, n. 3, p. 415-436, 2005. DOI 10.1007/s00213-005-0020-9. PMID 16001126.",
    rambeck1993: "RAMBECK, B.; WOLF, P. Lamotrigine clinical pharmacokinetics. <i>Clinical Pharmacokinetics</i>, v. 25, n. 6, p. 433-443, 1993. DOI 10.2165/00003088-199325060-00003. PMID 8119045.",
    rowland2006: "ROWLAND, A. et al. In vitro characterization of lamotrigine N2-glucuronidation and the lamotrigine-valproic acid interaction. <i>Drug Metabolism and Disposition</i>, v. 34, n. 6, p. 1055-1062, 2006. DOI 10.1124/dmd.106.009340. PMID 16565174.",
    klarica2018: "KLARICA DOMJANOVIĆ, I. et al. Interaction between ABCG2 421C>A polymorphism and valproate in their effects on steady-state disposition of lamotrigine in adults with epilepsy. <i>British Journal of Clinical Pharmacology</i>, v. 84, n. 9, p. 2106-2119, 2018. DOI 10.1111/bcp.13646. PMID 29791014.",
    guberman1999: "GUBERMAN, A. H. et al. Lamotrigine-associated rash: risk/benefit considerations in adults and children. <i>Epilepsia</i>, v. 40, n. 7, p. 985-991, 1999. DOI 10.1111/j.1528-1157.1999.tb00807.x. PMID 10403224.",
    moron2002: "MORÓN, J. A. et al. Dopamine uptake through the norepinephrine transporter in brain regions with low levels of the dopamine transporter: evidence from knock-out mouse lines. <i>The Journal of Neuroscience</i>, v. 22, n. 2, p. 389-395, 2002. DOI 10.1523/JNEUROSCI.22-02-00389.2002. PMID 11784783.",
    cools2021: "COOLS, R.; ARNSTEN, A. F. T. Neuromodulation of prefrontal cortex cognitive function in primates: the powerful roles of monoamines and acetylcholine. <i>Neuropsychopharmacology</i>, v. 47, n. 1, p. 309-328, 2021. DOI 10.1038/s41386-021-01100-8. PMID 34312496.",
    tran2025: "TRAN, S. et al. Functional and regional specificity of noradrenergic signaling for encoding and retrieval of associative recognition memory. <i>Journal of Neuroscience</i>, 2025. PMID 40312130.",
    moncrieff2022: "MONCRIEFF, J. et al. The serotonin theory of depression: a systematic umbrella review of the evidence. <i>Molecular Psychiatry</i>, v. 28, p. 3243-3256, 2022/2023. DOI 10.1038/s41380-022-01661-0.",
    barnes2021: "BARNES, N. M. et al. IUPHAR CX. Classification of receptors for 5-hydroxytryptamine; pharmacology and function. <i>Pharmacological Reviews</i>, v. 73, n. 1, p. 310-520, 2021.",
    millan1998: "MILLAN, M. J.; DEKEYNE, A.; GOBERT, A. Serotonin (5-HT)2C receptors tonically inhibit dopamine and noradrenaline, but not 5-HT, release in the frontal cortex in vivo. <i>Neuropharmacology</i>, v. 37, n. 7, p. 953-955, 1998.",
    levinstein2025: "LEVINSTEIN, M. R. et al. Redefining ketamine pharmacology for antidepressant action: synergistic NMDA and opioid receptor interactions? <i>American Journal of Psychiatry</i>, 2025. PMID 39810555.",
    rangelGuias: "RANGEL, M. G. G. <i>Coleção Circuitos e Receptores — guias comentados</i> (serotoninérgico, noradrenérgico, catecolaminérgico, glutamatérgico/GABAérgico). Material autoral de estudo, base IUPHAR/PubMed 2025-2026, 2026.",
    // v12.21.0 — fontes primarias da conferencia das vias glutamatergicas (01/09/2026, via PubMed)
    kwon2018: "KWON, O. et al. Schaffer collateral inputs to CA1 excitatory and inhibitory neurons follow different connectivity rules. <i>Journal of Neuroscience</i>, v. 38, n. 22, p. 5140-5152, 2018. DOI 10.1523/JNEUROSCI.0155-18.2018. PMID 29728449.",
    parent2009: "PARENT, M. A. et al. Identification of the hippocampal input to medial prefrontal cortex in vitro. <i>Cerebral Cortex</i>, v. 20, n. 2, p. 393-403, 2009. DOI 10.1093/cercor/bhp108. PMID 19515741.",
    hsu2017: "HSU, T. M. et al. A hippocampus to prefrontal cortex neural pathway inhibits food motivation through glucagon-like peptide-1 signaling. <i>Molecular Psychiatry</i>, v. 23, n. 7, p. 1555-1565, 2017. DOI 10.1038/mp.2017.91. PMID 28461695.",
    dolorfo1998: "DOLORFO, C. L.; AMARAL, D. G. Entorhinal cortex of the rat: topographic organization of the cells of origin of the perforant path projection to the dentate gyrus. <i>Journal of Comparative Neurology</i>, v. 398, n. 1, p. 25-48, 1998. PMID 9703026.",
    lukinic2025: "LUKINIC, E. et al. Infralimbic prefrontal cortical projections to the autonomic brainstem: quantification of inputs to cholinergic and adrenergic/noradrenergic nuclei. <i>Brain Structure and Function</i>, v. 230, n. 7, p. 117, 2025. DOI 10.1007/s00429-025-02983-9. PMID 40637880.",
    jodo1997: "JODO, E.; ASTON-JONES, G. Activation of locus coeruleus by prefrontal cortex is mediated by excitatory amino acid inputs. <i>Brain Research</i>, v. 768, n. 1-2, p. 327-332, 1997. DOI 10.1016/s0006-8993(97)00703-8. PMID 9369332.",
    lee2003: "LEE, H. S. et al. Glutamatergic afferent projections to the dorsal raphe nucleus of the rat. <i>Brain Research</i>, v. 963, n. 1-2, p. 57-71, 2003. DOI 10.1016/s0006-8993(02)03841-6. PMID 12560111.",
    // v12.25.0 — fontes primarias dos circuitos sensorial e motor (01/09/2026, via PubMed)
    obeso2008: "OBESO, J. A. et al. Functional organization of the basal ganglia: therapeutic implications for Parkinson's disease. <i>Movement Disorders</i>, v. 23, supl. 3, p. S548-559, 2008. DOI 10.1002/mds.22062. PMID 18781672.",
    eid2016: "EID, L.; PARENT, M. Chemical anatomy of pallidal afferents in primates. <i>Brain Structure and Function</i>, v. 221, n. 9, p. 4291-4317, 2016. DOI 10.1007/s00429-016-1216-y. PMID 27028222.",
    bertrangonzalez2010: "BERTRAN-GONZALEZ, J. et al. What is the degree of segregation between striatonigral and striatopallidal projections? <i>Frontiers in Neuroanatomy</i>, v. 4, 2010. DOI 10.3389/fnana.2010.00136. PMID 20953289.",
    depreter2024: "DE PRETER, C. C.; HEINRICHER, M. M. The 'in's and out's' of descending pain modulation from the rostral ventromedial medulla. <i>Trends in Neurosciences</i>, v. 47, n. 6, p. 447-460, 2024. DOI 10.1016/j.tins.2024.04.006. PMID 38749825.",
    heinricher2016: "HEINRICHER, M. M. Pain modulation and the transition from acute to chronic pain. <i>Advances in Experimental Medicine and Biology</i>, v. 904, p. 105-115, 2016. DOI 10.1007/978-94-017-7537-3_8. PMID 26900066.",
    // v12.26.0 — alcas cortico-estriado-talamo-corticais (01/09/2026, via PubMed)
    alexander1986: "ALEXANDER, G. E.; DELONG, M. R.; STRICK, P. L. Parallel organization of functionally segregated circuits linking basal ganglia and cortex. <i>Annual Review of Neuroscience</i>, v. 9, p. 357-381, 1986. DOI 10.1146/annurev.ne.09.030186.002041. PMID 3085570.",
    zapparoli2017: "ZAPPAROLI, L.; SEGHEZZI, S.; PAULESU, E. The what, the when, and the whether of intentional action in the brain: a meta-analytical review. <i>Frontiers in Human Neuroscience</i>, v. 11, p. 238, 2017. DOI 10.3389/fnhum.2017.00238. PMID 28567010.",
    kitano1998: "KITANO, H.; TANIBUCHI, I.; JINNAI, K. The distribution of neurons in the substantia nigra pars reticulata with input from the motor, premotor and prefrontal areas of the cerebral cortex in monkeys. <i>Brain Research</i>, v. 784, n. 1-2, p. 228-238, 1998. DOI 10.1016/s0006-8993(97)01332-2. PMID 9518627.",
    // v12.27.0 — receptores de ecb, opioide e adenosina na ontologia (01/09/2026, via PubMed)
    lu2016: "LU, H.-C.; MACKIE, K. An introduction to the endogenous cannabinoid system. <i>Biological Psychiatry</i>, v. 79, n. 7, p. 516-525, 2016. DOI 10.1016/j.biopsych.2015.07.028. PMID 26698193.",
    fairbanks2023: "FAIRBANKS, C. A.; PETERSON, C. D. The opioid receptor: emergence through millennia of pharmaceutical sciences. <i>Frontiers in Pain Research</i>, v. 4, p. 960389, 2023. DOI 10.3389/fpain.2023.960389. PMID 38028425.",
    burnstock2018: "BURNSTOCK, G. Purine and purinergic receptors. <i>Brain and Neuroscience Advances</i>, v. 2, 2018. DOI 10.1177/2398212818817494. PMID 32166165.",
};
// Fontes por bloco de dados (aplicadas a todos os itens do bloco; itens podem sobrescrever com `source` próprio)
const BLOCK_SOURCES = {
    systemsData: ['kandel6', 'stahl5'], antidepressantsData: ['stahl5', 'maudsley14'], antipsychoticsData: ['stahl5', 'maudsley14', 'kapur2000'], moodAndAnxioData: ['stahl5', 'maudsley14', 'canmat2018'],
    biochemicalCyclesData: ['kandel6', 'castillo2012', 'borbely2016'], molecularAdvancesData: ['sudhof2012', 'tang2016', 'kandel6'], patientStoriesData: ['stahl5', 'maudsley14'],
    brainCircuitsData: ['stahl5', 'kandel6', 'menon2011', 'rangelGuias', 'barnes2021', 'tran2025', 'moncrieff2022', 'millan1998', 'levinstein2025'], nucleiClinicalData: ['kandel6', 'stahl5', 'hu2020'], canonicalSubTractsData: ['stahl5', 'tovote2015', 'ledoux2000', 'klein1993'],
    pathologyProfilesData: ['stahl5', 'kapur2003', 'canmat2016'], neurostimProtocolsData: ['lefaucheur2020'], drugBindingAffinities: ['stahl5', 'maudsley14', 'pdsp', 'crediblemeds', 'dunkley2003'],
    experiments: ['stahl5', 'kandel6', 'hh1952', 'arnsten2011', 'krystal2019'], clinicalCasesData: ['apa2020', 'canmat2016', 'cipriani2013', 'kapur2003', 'klein1993'], hodgkinHuxley: ['hh1952']
};
function collectUsedSources() {
    const counts = {};
    const bump = (k, n = 1) => { if (SOURCES[k]) counts[k] = (counts[k] || 0) + n; };
    const sizeOf = (v) => Array.isArray(v) ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : 1);
    const blocks = { systemsData, antidepressantsData, antipsychoticsData, moodAndAnxioData, biochemicalCyclesData, molecularAdvancesData, patientStoriesData, brainCircuitsData, nucleiClinicalData, canonicalSubTractsData, pathologyProfilesData, neurostimProtocolsData, drugBindingAffinities, clinicalCasesData };
    Object.entries(blocks).forEach(([name, data]) => (BLOCK_SOURCES[name] || []).forEach(k => bump(k, sizeOf(data))));
    if (typeof experiments !== 'undefined') BLOCK_SOURCES.experiments.forEach(k => bump(k, experiments.length));
    BLOCK_SOURCES.hodgkinHuxley.forEach(k => bump(k));
    Object.values(nucleiCatalog).forEach(n => (n.source || []).forEach(k => bump(k)));
    tractsCatalog.forEach(t => (t.source || []).forEach(k => bump(k)));
    return Object.entries(counts).sort((x, y) => y[1] - x[1]);
}
function renderReferencesList() {
    const ol = document.getElementById('referencesList'); if (!ol) return;
    const used = collectUsedSources();
    ol.innerHTML = used.map(([k, n]) => `<li>${SOURCES[k]} <span style="color: var(--text-faint); font-size: 0.66rem;">(${n} item${n > 1 ? 's' : ''})</span></li>`).join('');
    const tot = document.getElementById('referencesTotal'); if (tot) tot.textContent = `${used.length} fontes • ${used.reduce((a, [, n]) => a + n, 0)} atribuições a itens de dados`;
}

/*
 * v12.23.0 — quais receptores um sistema tem, segundo a ontologia canonica.
 *
 * Mora AQUI, e nao em targets.js, porque targets.js e GERADO por scripts/build-de-para.mjs a
 * partir de data/targets.json: uma funcao escrita la some na proxima reconstrucao. A trava
 * `npm run check` pegou essa tentativa na hora — o arquivo gerado tem de bater com a origem.
 * data.js carrega depois de targets.js, entao TARGETS_CANON ja existe aqui.
 *
 * A fenda rotulava seus seis receptores com `sys.receptors.split(',')[0]` — o primeiro item de
 * uma FRASE. Em dopamina isso e sempre "D1": seis D1 e nenhum D2. E a frase nao e lista: em
 * adenosina, dividi-la por virgula devolve "hipocampo" como nome de receptor. Nao havia parser
 * que salvasse; o dado estruturado estava na ontologia o tempo todo.
 *
 * Devolve [] para sistema que a ontologia nao cobre. Vazio e resposta, nao falha: quem desenha
 * tem de dizer "nao tenho esse dado" em vez de inventar caixas.
 */
function receptoresDoSistema(sistema) {
    return Object.entries(TARGETS_CANON)
        .filter(([, t]) => t.kind === 'receptor' && t.system === sistema)
        .map(([id, t]) => ({ id, label: t.label, family: t.family, coupling: t.coupling,
                             ionotropico: /canal/i.test(t.family || '') }));
}

/*
 * v12.62 — O TRANSPORTADOR NOMEIA O SISTEMA (decisão do PO em 07/09/2026, na correção da F5 do SOPsi).
 *
 * O Gate Clínico do SOPsi (#559) mediu que a ligação fármaco → circuito, feita só pelos alvos que
 * o TEXTO de cada circuito nomeia (`circuitTargets`), dava o resultado errado para todo ISRS: nenhum
 * texto de circuito cita SERT, NET ou DAT, então o escitalopram (SERT 92, H1 10) acendia apenas o
 * sistema histaminérgico. Não é lacuna de prosa a escrever — é dado que já existe: na ontologia,
 * cada transportador de membrana declara o sistema a que pertence (SERT → 5ht, NET → ne, DAT → da,
 * EAAT → glu, GAT → gaba). Esta função só devolve esse fato, derivado, para quem consome o
 * catálogo poder tratar "toca o transportador" como "toca o sistema".
 *
 * NÃO altera `circuitTargets` (que continua sendo fato textual) nem `circuitsForTarget`. O VMAT2 fica
 * de fora de propósito: é transportador VESICULAR, transversal a todos os sistemas (system: null), e
 * incluí-lo aqui faria reserpina acender o cérebro inteiro — que é o modo de erro oposto.
 */
function transportadoresDoSistema(sistema) {
    return Object.entries(TARGETS_CANON)
        .filter(([, t]) => t.kind === 'transportador' && t.system === sistema)
        .map(([id]) => id)
        .sort();
}

/*
 * v12.13 — ÍNDICE SEMIOLÓGICO (a v12.2b do roteiro, finalmente).
 *
 * A v12.2 original queria `sintoma → circuito → receptor → fármaco com racional`, e isso é
 * INFERÊNCIA: o app passaria a afirmar que tal sintoma decorre de tal substrato. Ficou bloqueada.
 *
 * Esta é a versão descritiva, e a diferença é o ponto inteiro: **o índice não afirma nada.**
 * A única parte autoral aqui é a LISTA DE TERMOS — vocabulário semiológico, não mapa causal.
 * Onde cada termo aparece é DERIVADO por varredura do texto que o app já escreveu, e o que se
 * mostra é o trecho literal, com a origem declarada. Se o app diz "anedonia" ao descrever o
 * circuito de recompensa, o índice mostra essa frase e diz de onde ela veio. Não conclui que
 * anedonia é causada por dopamina baixa — quem conclui é o professor, com a frase à vista.
 *
 * A trava correspondente é o que torna isso confiável: um termo sem NENHUMA ocorrência é uma
 * afirmação falsa sobre o próprio app, e quebra o `npm run check`. Não é possível contrabandear
 * um termo que a prosa não sustenta.
 */
const SEMIOLOGY_TERMS = {
    'Anedonia':                        ['anedonia', 'anedôni'],
    'Alucinação':                      ['alucina'],
    'Delírio':                         ['delír', 'deliri'],
    'Apatia':                          ['apatia'],
    'Desatenção':                      ['desatenç'],
    'Hiperatividade':                  ['hiperativ'],
    'Impulsividade':                   ['impulsiv'],
    'Compulsão':                       ['compuls'],
    'Obsessão':                        ['obsess'],
    'Ruminação':                       ['ruminaç'],
    'Ansiedade':                       ['ansiedade'],
    'Pânico':                          ['pânico'],
    'Insônia':                         ['insônia'],
    'Disforia':                        ['disforia'],
    'Euforia':                         ['euforia'],
    'Mania':                           ['mania'],
    'Flashback':                       ['flashback'],
    'Hipervigilância':                 ['hipervigil'],
    'Culpa':                           ['culpa'],
    'Ideação suicida':                 ['suicíd', 'suicid'],
    'Tique':                           ['tique'],
    'Acatisia':                        ['acatisia'],
    'Tremor':                          ['tremor'],
    'Sedação':                         ['sedaç'],
    'Desinibição':                     ['desinibi'],
    'Fadiga':                          ['fadiga'],
    'Prejuízo de memória de trabalho': ['memória de trabalho'],
    'Alteração do apetite':            ['apetite'],
    /* Acrescentados depois da varredura de conferência: termos que a prosa do app sustenta e que
       a primeira redação da lista havia deixado de fora. A lista é autoral, e por isso é a parte
       falível — a varredura é que é confiável. */
    'Despersonalização':               ['despersonaliz'],
    'Distonia':                        ['distonia'],
    'Discinesia':                      ['discinesia'],
    'Parkinsonismo':                   ['parkinsonism'],
    'Craving (fissura)':               ['fissura'],
    'Pesadelo':                        ['pesadel']
};
// Os blocos de prosa varridos. Nomeados de propósito: o índice cobre esta lista e nada mais —
// se um bloco novo de texto aparecer no app, ele precisa ser acrescentado aqui.
function semiologyBlocks() {
    const b = {};
    const tenta = (nome, valor) => { if (valor) b[nome] = valor; };
    tenta('patologia', typeof pathologyProfilesData !== 'undefined' ? pathologyProfilesData : null);
    tenta('circuito', typeof brainCircuitsData !== 'undefined' ? brainCircuitsData : null);
    tenta('núcleo', typeof nucleiClinicalData !== 'undefined' ? nucleiClinicalData : null);
    tenta('dossiê', typeof molecularAdvancesData !== 'undefined' ? molecularAdvancesData : null);
    tenta('caso', typeof clinicalCasesData !== 'undefined' ? clinicalCasesData : null);
    tenta('história', typeof patientStoriesData !== 'undefined' ? patientStoriesData : null);
    tenta('ciclo', typeof biochemicalCyclesData !== 'undefined' ? biochemicalCyclesData : null);
    tenta('fármaco', typeof drugBindingAffinities !== 'undefined' ? drugBindingAffinities : null);
    tenta('sistema', typeof systemsData !== 'undefined' ? systemsData : null);
    return b;
}
// Recorta a frase em volta da ocorrência: mostra o texto do app, não uma paráfrase minha.
function trechoEmVolta(texto, pos, raio = 110) {
    const ini = Math.max(0, pos - raio), fim = Math.min(texto.length, pos + raio);
    return (ini > 0 ? '…' : '') + texto.slice(ini, fim).replace(/\s+/g, ' ').trim() + (fim < texto.length ? '…' : '');
}
/** Onde o app já fala deste termo. Devolve [{bloco, chave, rotulo, campo, trecho}] — nada inferido. */
function semiologyOccurrences(termo) {
    const variantes = SEMIOLOGY_TERMS[termo];
    if (!variantes) return [];
    const achados = [];
    const blocos = semiologyBlocks();
    Object.keys(blocos).forEach(nomeBloco => {
        const colecao = blocos[nomeBloco];
        const chaves = Array.isArray(colecao) ? colecao.map((_, i) => i) : Object.keys(colecao);
        chaves.forEach(chave => {
            const item = colecao[chave];
            if (!item || typeof item !== 'object') return;
            Object.keys(item).forEach(campo => {
                const v = item[campo];
                if (typeof v !== 'string') return;
                const alvo = v.toLowerCase();
                for (const variante of variantes) {
                    const pos = alvo.indexOf(variante);
                    if (pos !== -1) {
                        achados.push({ bloco: nomeBloco, chave: String(item.id !== undefined ? item.id : chave),
                            rotulo: item.name || item.title || String(chave), campo, trecho: trechoEmVolta(v, pos) });
                        break;
                    }
                }
            });
        });
    });
    return achados;
}
/** Quantas ocorrências cada termo tem — usado pela trava e pela lista do índice. */
function semiologyCounts() {
    const r = {};
    Object.keys(SEMIOLOGY_TERMS).forEach(t => { r[t] = semiologyOccurrences(t).length; });
    return r;
}

// =========================================================
// v12.36 (Bloco 1 da organizacao por dominio): as TABELAS CLINICAS que moravam no topo de store.js — dado,
// nao estado. Vieram inteiras, na mesma ordem, sem mudar um valor: dossies dos nucleos, UI das camadas e
// suas funcoes puras, sub-vias canonicas, perfis de patologia (+ desvioDaVia), protocolos de neuromodulacao
// e afinidades dos farmacos. store.js fica com Effects, ESCALAS_VISUAIS e o reducer. A ordem de carga
// (data.js antes de store.js) ja permitia; tests/dominios.test.ts garante que carregam sem o store.
// =========================================================


// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { APP_BUILD_LABEL, APP_VERSION, CAMADA_DO_SISTEMA, CORES_DOS_SISTEMAS, DOMINIOS, ESCALAS_DE_PROJECAO,
    LEITURAS_CRUZADAS, MODO, SEMIOLOGY_TERMS, SOURCES, TRACO_DO_CIRCUITO, clarearCor, clinicalCasesData,
    dominioDaEscala, dominioDoModo, ehCamadaDeSistema, receptoresDoSistema, renderReferencesList, semiologyCounts,
    semiologyOccurrences, systemsData };
// ── fim do exporta ──
