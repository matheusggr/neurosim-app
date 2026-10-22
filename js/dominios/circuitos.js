// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import '../dominios/neurotransmissao.js?v=12.66.0';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import {
    CAMADA_DO_SISTEMA, CORES_DOS_SISTEMAS, TRACO_DO_CIRCUITO, clarearCor, ehCamadaDeSistema
} from '../data.js?v=12.66.0';
import { store } from '../store.js?v=12.66.0';
import { fatorDeEscalaUI } from '../engine.js?v=12.66.0';
// ── fim dos módulos ──
/*
 * DOMINIO CIRCUITOS — um palco inteiro num arquivo so (decisao D3 do autor, "pastas por dominio").
 *
 * Ate a v12.47 este codigo morava espalhado por 4 arquivo(s) organizados por CAMADA
 * (data.js, engine.js, render3d.js, render2d.js): quem quisesse mexer neste palco procurava em todos.
 * Agora esta aqui, na ordem em que estava em cada um deles, com os comentarios que cada linha ja tinha.
 *
 * A REGRA DESTE ARQUIVO: ele so pode usar o NUCLEO (versao, registros, ontologia de alvos, SOURCES, o barramento do
 * store, relogio, som) e a CASCA (a barra, o inspetor, o palco). Tocar outro dominio so pelas PONTES ou pelas
 * LEITURAS_CRUZADAS declaradas em data.js, com o motivo escrito. Quem confere: tests/dominios_do_codigo.test.ts e
 * a linha "dominios do codigo" do `npm run check`. O dono de cada nome esta em data/dominios-do-codigo.json.
 *
 * Os `import`/`export` do topo e do fim sao GERADOS por `node scripts/mapa-modulos.mjs --escrever`; nao os edite.
 */

// ====================================================================================================
// vindo de data.js
// ====================================================================================================

// Brain Circuits Data
const brainCircuitsData = {
    all: {
        name: "🌐 Grande Conectoma Global (Todas as 13 Vias)",
        desc: "Visão integrada de todas as 13 redes e sistemas de neurotransmissão (Monoaminas, Glutamato/GABA, Peptídeos, Habênula, Papez, Saliência, Eixo HPA e Loops CSTC).",
        clinical: "A neurobiologia psiquiátrica moderna entende os transtornos mentais não como desequilíbrios químicos isolados, mas como disfunções de circuito e conectividade inter-redes."
    },
    ecb: {
        name: "🌿 Sistema Endocanabinoide Retrógrado (AEA / 2-AG)",
        desc: "• <b>Sinalização Retrógrada:</b> Sintetizados sob demanda em espinhas pós-sinápticas (Hipocampo, Amígdala, Córtex e VTA) e difundidos para receptores pré-sinápticos CB1 (Gi/o).<br>• Suprime a liberação excessiva de glutamato (neuroproteção) e GABA (desinibição hedônica na VTA); modula a extinção do medo e apetite.",
        clinical: "Alvo do Canabidiol (CBD) na epilepsia refratária e ansiedade; o agonismo por THC modula a percepção de dor mas pode induzir despersonalização e psicose."
    },
    opioid: {
        name: "🛡️ Sistema Opioide Endógeno (Endorfinas / Receptores Mu e Kappa)",
        desc: "• <b>Projeções Centrais:</b> PAG ➔ Medula Rostral (Analgesia descendente) + VTA (Desinibição de dopamina via MOR no freio GABAérgico) + Amígdala (Amortecimento afetivo da dor).<br>• Receptores Mu (MOR) mediam euforia e analgesia; Receptores Kappa (KOR/Dinorfina) mediam disfória e anedonia.",
        clinical: "Morfina e fentanil são agonistas plenos MOR; a Naltrexona bloqueia receptores MOR/KOR para reduzir o craving e o consumo de álcool e opioides."
    },
    adenosine: {
        name: "☕ Sistema Purinérgico & Adenosina (Pressão Homeostática de Sono)",
        desc: "• <b>Acúmulo Córtico-Estriatal:</b> Subproduto da hidrólise de ATP por ectonucleotidases CD39/CD73 que se acumula proporcionalmente às horas de vigília.<br>• Receptores A1 inibem o córtex e o sistema reticular ativador; receptores A2A no estriado ativam a via indireta, induzindo sonolência e redução do tônus motor.",
        clinical: "A Cafeína atua como antagonista competitivo de receptores A1/A2A, bloqueando a sensação de fadiga e desinibindo dopamina no estriado."
    },
    dopamine: {
        name: "Sistema Dopaminérgico (VTA, SNc & Hipotálamo)",
        desc: "• <b>Mesolímbica (VTA ➔ Accumbens):</b> Saliência motivacional e sintomas positivos.<br>• <b>Mesocortical (VTA ➔ DLPFC):</b> Função executiva e sintomas negativos.<br>• <b>Nigroestriatal (SNc ➔ Estriado):</b> Coordenação motora (SEP/Parkinsonismo).<br>• <b>Tuberoinfundibular (Hipotálamo ➔ Hipófise):</b> Inibição de Prolactina via D2.<br>• <b>Mesolímbica-Amigdalar:</b> Saliência afetiva.",
        clinical: "O bloqueio 5-HT2A desinibe a via nigroestriatal; a explicação mais robusta do baixo SEP dos atípicos, porém, é a menor ocupação D2 e a dissociação rápida do receptor (Kapur & Seeman, 2001). A discinesia tardia é reduzida (~1%/ano vs ~3%/ano), não abolida."
    },
    serotonin: {
        name: "Sistema Serotoninérgico (Rafe Dorsal & Mediana)",
        desc: "• <b>Rafe Dorsal ➔ PFC & Cíngulo:</b> Humor, regulação afetiva e controle de impulsos;<br>• <b>Rafe Dorsal ➔ Occipital V1:</b> Densidade máxima de 5-HT2A (alvo de psicodélicos e Pimavanserina);<br>• <b>Rafe Mediana ➔ Hipocampo:</b> Contextualização e neurogênese (5-HT1A);<br>• <b>Rafe Dorsal ➔ Estriado & Amígdala:</b> Freio sobre dopamina e controle de pânico.",
        clinical: "No <b>modelo clássico de Stahl</b> (MODELO/INFERÊNCIA), a dessensibilização dos autorreceptores 5-HT1A na Rafe após 2-4 semanas destrava o fluxo serotoninérgico terminal e coincide com a resposta ao ISRS. A latência real, porém, envolve heterogeneidade de subpopulações da rafe, plasticidade e reorganização de rede — não apenas o autorreceptor. Eficácia do ISRS não prova 'deficiência de serotonina' prévia (Moncrieff, 2022)."
    },
    norepinephrine: {
        name: "Sistema Noradrenérgico Heterogêneo (LC A6 & A1-A7)",
        desc: "• <b>LC (A6) ➔ DLPFC:</b> Foco executivo e relação sinal/ruído (α2A pós-sináptico);<br>• <b>LC (A6) ➔ Hipocampo:</b> Codificação de memória associativa (β1 e co-liberação de DA);<br>• <b>LC (A6) ➔ Núcleo Reuniens:</b> Recuperação de memória (α1);<br>• <b>A1/A2 ➔ Hipotálamo:</b> Eixo HPA; <b>A5/A7 ➔ Medula:</b> Inibição descendente da dor (alvo de Duloxetina).",
        clinical: "Guanfacina (agonista α2A seletivo) fortalece as redes pré-frontais no TDAH sem os efeitos estimulantes dopaminérgicos."
    },
    glutamate: {
        name: "Sistema Glutamatérgico & Circuito Trissináptico",
        desc: "• <b>Projeções Corticocorticais & Corticoestriatais:</b> Entrada excitatória dos Loops CSTC;<br>• <b>Radiações Ópticas Talamocorticais:</b> LGN ➔ V1;<br>• <b>Circuito Trissináptico Hipocampal:</b> Córtex Entorrinal ➔ Giro Denteado ➔ CA3 ➔ CA1 ➔ Subículo (LTP/NMDA).",
        clinical: "O <b>alvo imediato estabelecido</b> da esquetamina é o bloqueio não competitivo e uso-dependente do canal NMDA. A cadeia seguinte — desinibição de interneurônios GABA ➔ surto de glutamato ➔ AMPA ➔ BDNF-TrkB/mTORC1 ➔ restauração sináptica — é um <b>modelo integrativo</b> (MODELO/INFERÊNCIA): a participação de metabólitos, do sistema opioide e de mecanismos não-NMDA permanece em debate (Levinstein, 2025)."
    },
    gaba: {
        name: "Sistema GABAérgico & Microcircuitos Corticais",
        desc: "• <b>Interneurônios PV (Parvalbumina):</b> Oscilações Gamma de 40 Hz para sincronização cognitiva;<br>• <b>Interneurônios SST:</b> Inibição de dendritos distais;<br>• <b>Vias Direta (D1) e Indireta (D2) dos Gânglios da Base:</b> Seleção de programas motores e hábitos.",
        clinical: "Zuranolona atua em receptores GABA-A sinápticos e extrassinápticos (subunidade δ), somando inibição fásica e tônica — o que a distingue dos benzodiazepínicos — na depressão pós-parto."
    },
    cholinergic: {
        name: "Sistema Colinérgico (Meynert Ch4 & Ch1-Ch3)",
        desc: "• <b>Meynert (Ch4) ➔ Neocórtex & Lobo Temporal:</b> Atenção seletiva, memória recente e reconhecimento facial (receptores M1 e α7);<br>• <b>Septo Medial ➔ Hipocampo:</b> Gerador do Ritmo Theta.",
        clinical: "A perda de neurônios de Meynert na Doença de Alzheimer é tratada com anticolinesterásicos (Donepezil, Rivastigmina, Galantamina)."
    },
    cstc: {
        name: "🔄 Os 3 Loops Cortico-Estriato-Talamo-Corticais (CSTC)",
        desc: "• <b>Loop Afetivo (10 Hz):</b> vmPFC/ACC ➔ Accumbens ➔ Tálamo MD ➔ vmPFC (Humor e Anedonia);<br>• <b>Loop Motor (20 Hz):</b> SMA ➔ Putâmen ➔ Tálamo VL ➔ SMA (TOC e Tiques);<br>• <b>Loop Executivo (15 Hz):</b> DLPFC ➔ Caudato ➔ Tálamo VA ➔ DLPFC (Foco e Flexibilidade).",
        clinical: "A Estimulação Magnética Transcraniana (EMT) e a psicocirurgia/DBS modulam especificamente a oscilação desses circuitos no TOC e Depressão Refratária."
    },
    dmn: {
        name: "🌌 Rede em Modo Padrão (Default Mode Network - DMN)",
        desc: "• <b>Conectividade Principal:</b> Precúneo & Córtex Cingulado Posterior (PCC) ⟷ Córtex Pré-Frontal Ventromedial (vmPFC) ⟷ Lóbulo Parietal Inferior ⟷ Hipocampo.<br>• Ativa durante o repouso mental; substrato da autoconsciência, narrativa autobiográfica do 'Eu' e imaginação.",
        clinical: "Hiperconectada na depressão (ruminação autocrítica crônica); o agonismo 5-HT2A por Psicodélicos (Psilocibina/LSD) desintegra temporariamente a DMN ('Dissolução do Ego'), promovendo neuroplasticidade."
    },
    cen: {
        name: "⚡ Rede Fronto-Parietal de Atenção Executiva (Central Executive Network - CEN)",
        desc: "• <b>Conectividade Principal:</b> Córtex Pré-Frontal Dorsolateral (DLPFC - Áreas 9/46) ⟷ Córtex Parietal Posterior (Área 7 / Sulco Intraparietal).<br>• Responsável pelo controle voluntário da atenção sustentada (*top-down*), memória de trabalho visuo-espacial e raciocínio lógico.",
        clinical: "Hipoativa no TDAH (déficit de foco executivo); desconectada na esquizofrenia; alvo da EMT excitatória de 10 Hz para reativação do foco cognitivo."
    },
    habenula: {
        name: "🦚 Habênula Lateral & Circuito Anti-Recompensa",
        desc: "• <b>Estria Medular ➔ Habênula Lateral (LHb):</b> Codifica o 'erro de previsão negativo' (ausência de recompensa esperada, punição e decepção);<br>• <b>LHb ➔ RMTg (GABA) ➔ VTA/Rafe:</b> A Habênula recruta o freio GABAérgico do RMTg, inibindo fortemente a dopamina e a serotonina.",
        clinical: "Hiperatividade e disparos em rajada (*bursting*) na LHb sustentam a anedonia profunda e o desespero suicida na depressão; em modelos animais, a Cetamina bloqueia o *bursting* NMDA-dependente da LHb em minutos (Yang et al., 2018) — mecanismo ainda não demonstrado em humanos."
    },
    papez: {
        name: "🌊 Circuito Límbico Clássico de Papez",
        desc: "• <b>Trajeto em Anel:</b> Hipocampo ➔ Fórnix ➔ Corpos Mamilares ➔ Trato Mamilotalâmico ➔ Núcleos Anteriores do Tálamo ➔ Giro do Cíngulo ➔ Córtex Entorrinal ➔ Hipocampo.<br>• Substrato biológico essencial para a consolidação de memórias biográficas episódicas.",
        clinical: "A degeneração dos corpos mamilares por deficiência de tiamina no etilismo crônico produz a amnésia anterógrada e confabulação da Síndrome de Wernicke-Korsakoff."
    },
    fear: {
        name: "🛡️ Circuito de Medo Condicionado & Extinção (Tovote et al., 2015)",
        desc: "• <b>Aquisição & Expressão:</b> Tálamo Sensorial ➔ Amígdala Basolateral (BLA) ➔ Amígdala Central (CeA) ➔ PAG (Congelamento/Freezing) e Hipotálamo (Taquicardia).<br>• <b>Extinção Pré-Frontal:</b> Córtex Pré-Frontal Ventromedial (vmPFC) ➔ Interneurônios GABAérgicos Intercalados (ITC) ➔ Inibição ativa do disparo da CeA (Mecanismo da TCC e Dessensibilização).",
        clinical: "No TEPT e Pânico, há falha do freio inibitório vmPFC ➔ ITC, deixando o alarme da amígdala e o congelamento do PAG hiper-reativos a pistas contextuais inofensivas."
    },
    salience: {
        name: "🎯 Rede de Saliência (Ínsula Anterior & dACC)",
        desc: "• <b>Ínsula Anterior ➔ Córtex Cingulado Anterior Dorsal (dACC) ➔ Amígdala ➔ Accumbens:</b> Integra sinais viscerais corporais (interocepção) e detecta estímulos biológicos de alta relevância.",
        clinical: "Hiperconectividade da Ínsula gera a taquicardia e sensação de catástrofe iminente no Transtorno de Pânico; processa a fissura (*craving*) na dependência química."
    },
    hpa: {
        name: "🫀 Eixo Hipotálamo-Hipófise-Adrenal (Eixo HPA)",
        desc: "• <b>Núcleo Paraventricular (PVN) ➔ Eminência Mediana ➔ Adenoipófise (ACTH) ➔ Adrenal (Cortisol);</b><br>• <b>Amígdala (Acelerador):</b> Estimula o PVN no estresse;<br>• <b>Hipocampo (Freio de Feedback):</b> Inibe o PVN através de receptores GR de glicocorticoides.",
        clinical: "O estresse crônico destrói neurônios hipocampais via toxicidade de cortisol/glutamato, desregulando o freio do Eixo HPA e mantendo inflamação crônica."
    },
    orexin: {
        name: "⚡ Sistema Orexinérgico / Hipocretinérgico",
        desc: "• <b>Hipotálamo Lateral ➔ Locus Coeruleus (A6), Rafe, VTA, Tálamo e Córtex:</b> Estabilizador maestro do interruptor da vigília (*flip-flop switch*).",
        clinical: "A destruição autoimune dos neurônios de orexina causa Narcolepsia tipo 1. Antagonistas duplos DORA (Lemborexanto, Daridorexanto) são os hipnóticos de nova geração."
    },
    histamine: {
        name: "🌿 Sistema Histaminérgico Central (TMN)",
        desc: "• <b>Núcleo Tuberomamilar do Hipotálamo (TMN) ➔ Todo o Neocórtex & Tálamo:</b> Promove alerta cortical e vigília sustentada via receptores H1.",
        clinical: "O bloqueio H1 por psicofármacos (Olanzapina, Quetiapina, Mirtazapina, Amitriptilina) é a causa direta de sedação profunda, aumento de apetite e ganho ponderal."
    }
};

// ==========================================
// 1.8 REGISTRO DE FONTES (v12.0) — cada item de dado aponta para chaves daqui; o modal 📚 Fontes é gerado a partir do uso real.
// ==========================================
// v12.14.1 — Conjuntos clinicos de circuitos.
// Estes nove presets existiam desde sempre DENTRO do reducer, como uma cadeia de if/else, e os
// botoes que os alcancavam estavam no bloco inalcancavel de ui.js. Ou seja: escritos, corretos e
// nunca usados. Aqui eles viram dado, pelo mesmo motivo que os perfis de patologia viraram na
// v12.14.0 — para que a lista de botoes NASCA da fonte e nao possa divergir dela.
// Os seis primeiros rotulos sao do autor, resgatados literalmente do bloco morto. Os tres ultimos
// nunca tiveram botao em lugar nenhum: os rotulos sao meus e o autor deve renomear se quiser.
const CIRCUIT_PRESETS = {
    preset_reward_addiction:    { short: "🎰 Recompensa & Vício",      layers: ['dopamine', 'opioid', 'cstc', 'habenula'] },
    preset_fear_anxiety:        { short: "🚨 Medo, Pânico & TEPT",     layers: ['fear', 'salience', 'norepinephrine', 'hpa'] },
    preset_cognition_attention: { short: "🎯 Cognição, Foco & DMN",    layers: ['cen', 'dmn', 'cstc', 'cholinergic', 'dopamine'] },
    preset_sleep_wake:          { short: "🌙 Sono, Vigília & Cafeína", layers: ['orexin', 'histamine', 'adenosine', 'cholinergic'] },
    preset_pain_analgesia:      { short: "🛡️ Modulação da Dor",        layers: ['opioid', 'ecb', 'norepinephrine', 'fear'] },
    preset_memory:              { short: "🌊 Memória & Papez",         layers: ['papez', 'cholinergic', 'glutamate', 'serotonin'] },
    preset_monoamines:          { short: "🧪 Monoaminas",              layers: ['dopamine', 'serotonin', 'norepinephrine', 'histamine'] },
    preset_fast_transmitters:   { short: "⚡ Transmissores Rápidos",   layers: ['glutamate', 'gaba', 'cholinergic', 'adenosine'] },
    preset_modulators:          { short: "🌿 Moduladores",             layers: ['ecb', 'opioid', 'orexin'] }
};

/*
 * v12.33 — FAMILIAS de camadas (Fase 3.2 do roadmap de frontend). Seis grupos que PARTICIONAM as 25
 * camadas do conectoma: cada camada em exatamente uma familia (trava em tests/familias.test.ts). E o
 * agrupamento do inspetor — os toggles de camada sairam da barra do modo 3 e ficam la, com contador n/N.
 * Tres familias coincidem com presets do autor (monoaminas, transmissores rapidos, moduladores). As
 * outras tres foram propostas e ratificadas pelo PO em 02/09/2026 (v12.34): mover uma camada e editar este
 * dado, nao codigo. Difere de CIRCUIT_PRESETS, que sao CONJUNTOS clinicos (uma camada em varios).
 */
const CIRCUIT_FAMILIES = {
    monoaminas:    { rotulo: "🧪 Monoaminas",                     camadas: ['dopamine', 'serotonin', 'norepinephrine', 'histamine'] },
    rapidos:       { rotulo: "⚡ Transmissores rápidos",          camadas: ['glutamate', 'gaba', 'cholinergic', 'adenosine'] },
    moduladores:   { rotulo: "🌿 Moduladores",                    camadas: ['ecb', 'opioid', 'orexin'] },
    medo_estresse: { rotulo: "🚨 Medo, estresse & aversão",       camadas: ['fear', 'panic', 'gad', 'hpa', 'habenula'] },
    redes:         { rotulo: "🌐 Redes de larga escala",          camadas: ['dmn', 'cen', 'salience'] },
    alcas:         { rotulo: "🌀 Alças e circuitos integradores", camadas: ['cstc', 'motor', 'sensorial', 'papez', 'impulsividade', 'compulsividade'] }
};

// ==========================================
// 1.9 CATÁLOGOS ÚNICOS (v12.0) — os 30 núcleos e os 71 tratos existem UMA vez; 2D e 3D derivam daqui.
//     sx/sy = fração da tela no conectoma sagital 2D; x/y/z = coordenadas do cérebro 3D. `source` = chaves de SOURCES.
// ==========================================
const nucleiCatalog = {
    pfc: { id: 'pfc', label: "DLPFC / PFC", fullName: "Córtex Pré-Frontal Dorsolateral", name3d: "DLPFC / Córtex Pré-Frontal", color: "#38bdf8", sx: 0.24, sy: 0.30, x: 3.2, y: 3.5, z: 8.2, r: 1.05, bilateral: true, source: ["kandel6", "stahl5"] },
    vmpfc: { id: 'vmpfc', label: "vmPFC / ACC", fullName: "Córtex Ventromedial & Cíngulo Anterior", name3d: "vmPFC / ACC", color: "#a855f7", sx: 0.22, sy: 0.48, x: 2.2, y: 0.5, z: 8.5, r: 1.0, bilateral: true, source: ["kandel6", "stahl5"] },
    insula: { id: 'insula', label: "Ínsula Anterior", fullName: "Córtex Insular Anterior (Interocepção & Saliência)", name3d: "Ínsula Anterior", color: "#14b8a6", sx: 0.32, sy: 0.42, x: 5.2, y: 1.0, z: 2.8, r: 0.95, bilateral: true, source: ["kandel6", "stahl5"] },
    s1: { id: 's1', label: "Córtex S1", fullName: "Córtex Somatossensorial Primário (Homúnculo)", name3d: "Córtex Somatossensorial S1", color: "#38bdf8", sx: 0.52, sy: 0.22, x: 3.8, y: 6.8, z: 1.0, r: 1.05, bilateral: true, source: ["kandel6", "stahl5"] },
    ctx_post: { id: 'ctx_post', label: "Parietal / Precúneo", fullName: "Córtex Parietal Posterior & Precúneo (Hub DMN & CEN)", name3d: "Parietal / Precúneo", color: "#38bdf8", sx: 0.64, sy: 0.26, x: 3.8, y: 5.8, z: -4.2, r: 1.15, bilateral: true, source: ["kandel6", "stahl5"] },
    ctx_temp: { id: 'ctx_temp', label: "Córtex Temporal", fullName: "Lobo Temporal (Wernicke, Fusiforme, Memória)", name3d: "Córtex Temporal", color: "#f97316", sx: 0.38, sy: 0.66, x: 6.2, y: -1.2, z: -1.0, r: 1.1, bilateral: true, source: ["kandel6", "stahl5"] },
    ctx_occ: { id: 'ctx_occ', label: "Córtex Occipital (V1)", fullName: "Córtex Visual Primário & Extraestriado (5-HT2A)", name3d: "Córtex Occipital (V1)", color: "#ef4444", sx: 0.82, sy: 0.44, x: 2.8, y: 2.2, z: -9.2, r: 1.15, bilateral: true, source: ["kandel6", "stahl5"] },
    accumbens: { id: 'accumbens', label: "N. Accumbens", fullName: "Estriado Ventral (Recompensa)", name3d: "Núcleo Accumbens", color: "#ec4899", sx: 0.36, sy: 0.52, x: 2.2, y: -1.0, z: 3.8, r: 0.85, bilateral: true, source: ["kandel6", "stahl5"] },
    estriado: { id: 'estriado', label: "Estriado Dorsal", fullName: "Caudato & Putâmen", name3d: "Estriado Dorsal (Caudato/Putâmen)", color: "#a855f7", sx: 0.42, sy: 0.40, x: 3.0, y: 1.8, z: 2.2, r: 1.15, bilateral: true, source: ["kandel6", "stahl5"] },
    talamo: { id: 'talamo', label: "Tálamo", fullName: "Núcleos Talâmicos (Relay Sensorial)", name3d: "Tálamo", color: "#eab308", sx: 0.50, sy: 0.48, x: 2.0, y: 1.2, z: -1.2, r: 1.15, bilateral: true, source: ["kandel6", "stahl5"] },
    reuniens: { id: 'reuniens', label: "N. Reuniens", fullName: "Núcleo Reuniens Talâmico", name3d: "Núcleo Reuniens", color: "#3b82f6", sx: 0.46, sy: 0.50, x: 0.8, y: 0.4, z: -0.4, r: 0.65, bilateral: true, source: ["kandel6", "stahl5"] },
    hipocampo: { id: 'hipocampo', label: "Hipocampo", fullName: "Formação Hipocampal (CA1/CA3/Giro Denteado)", name3d: "Hipocampo (CA1-CA3/DG)", color: "#10b981", sx: 0.48, sy: 0.60, x: 3.8, y: -2.2, z: -2.2, r: 0.95, bilateral: true, source: ["kandel6", "stahl5"] },
    amigdala: { id: 'amigdala', label: "Amígdala (BLA/CeA)", fullName: "Complexo Amigdalóide (Alarme)", name3d: "Amígdala (BLA/CeA)", color: "#ef4444", sx: 0.40, sy: 0.58, x: 3.4, y: -2.8, z: 1.8, r: 0.9, bilateral: true, source: ["kandel6", "stahl5"] },
    pag: { id: 'pag', label: "PAG (Subst. Cinzenta Periaquedutal)", fullName: "PAG (Freezing & Analgesia Descendente)", name3d: "PAG (Subst. Cinzenta Periaquedutal)", color: "#ef4444", sx: 0.58, sy: 0.56, x: 0, y: -3.6, z: -3.2, r: 0.8, bilateral: false, source: ["kandel6", "stahl5"] },
    hipotalamo: { id: 'hipotalamo', label: "Hipotálamo (PVN)", fullName: "Hipotálamo Neuroendócrino & Autonômico", name3d: "Hipotálamo (PVN)", color: "#f59e0b", sx: 0.42, sy: 0.54, x: 0, y: -1.8, z: 1.2, r: 0.85, bilateral: false, source: ["kandel6", "stahl5"] },
    hipofise: { id: 'hipofise', label: "Hipófise", fullName: "Glândula Pituitária Anterior & Posterior", name3d: "Hipófise (Pituitária)", color: "#f59e0b", sx: 0.40, sy: 0.68, x: 0, y: -4.8, z: 3.0, r: 0.7, bilateral: false, source: ["kandel6", "stahl5"] },
    mamilar: { id: 'mamilar', label: "Corpos Mamilares", fullName: "Corpos Mamilares do Hipotálamo (Papez)", name3d: "Corpos Mamilares", color: "#06b6d4", sx: 0.46, sy: 0.56, x: 1.2, y: -2.6, z: -0.4, r: 0.65, bilateral: true, source: ["kandel6", "stahl5"] },
    habenula: { id: 'habenula', label: "Habênula Lateral", fullName: "LHb (Hub Anti-Recompensa & Frustração)", name3d: "Habênula Lateral (LHb)", color: "#84cc16", sx: 0.52, sy: 0.44, x: 1.2, y: 0.6, z: -2.2, r: 0.65, bilateral: true, source: ["kandel6", "stahl5"] },
    rmtg: { id: 'rmtg', label: "RMTg (Freio GABA)", fullName: "Núcleo Tegmentar Rostromedial", name3d: "RMTg (Freio GABA)", color: "#84cc16", sx: 0.55, sy: 0.52, x: 0, y: -3.0, z: -1.8, r: 0.7, bilateral: false, source: ["kandel6", "stahl5"] },
    vta: { id: 'vta', label: "VTA (A10)", fullName: "Área Tegmentar Ventral (Dopamina Mesolímbica)", name3d: "Área Tegmentar Ventral (VTA A10)", color: "#a855f7", sx: 0.48, sy: 0.54, x: 0, y: -3.8, z: -1.2, r: 0.85, bilateral: false, source: ["kandel6", "stahl5"] },
    snc: { id: 'snc', label: "SNc (A9)", fullName: "Substantia Nigra pars compacta (Dopamina Motora)", name3d: "Substantia Nigra pars compacta (SNc A9)", color: "#a855f7", sx: 0.52, sy: 0.56, x: 2.4, y: -3.5, z: -0.8, r: 0.8, bilateral: true, source: ["kandel6", "stahl5"] },
    rafe_d: { id: 'rafe_d', label: "Rafe Dorsal (B6/7)", fullName: "Núcleos da Rafe Dorsal (Serotonina Cortical)", name3d: "Núcleo da Rafe Dorsal (B7)", color: "#ef4444", sx: 0.54, sy: 0.60, x: 0, y: -4.4, z: -2.6, r: 0.8, bilateral: false, source: ["kandel6", "stahl5"] },
    rafe_m: { id: 'rafe_m', label: "Rafe Mediana (B8)", fullName: "Núcleo da Rafe Mediana (Serotonina Límbica)", name3d: "Núcleo da Rafe Mediana (B8)", color: "#ef4444", sx: 0.54, sy: 0.64, x: 0, y: -4.8, z: -2.2, r: 0.75, bilateral: false, source: ["kandel6", "stahl5"] },
    lc: { id: 'lc', label: "Locus Coeruleus (A6)", fullName: "Locus Coeruleus (Noradrenalina)", name3d: "Locus Coeruleus (A6)", color: "#3b82f6", sx: 0.56, sy: 0.62, x: 1.8, y: -5.2, z: -3.4, r: 0.75, bilateral: true, source: ["kandel6", "stahl5"] },
    a1a2: { id: 'a1a2', label: "Grupos A1/A2", fullName: "Bulbo Ventrolateral & Núcleo do Trato Solitário", name3d: "Grupos Bulbares A1/A2 (NTS)", color: "#3b82f6", sx: 0.53, sy: 0.74, x: 0, y: -7.0, z: -2.5, r: 0.7, bilateral: false, source: ["kandel6", "stahl5"] },
    a5a7: { id: 'a5a7', label: "Grupos A5/A7", fullName: "Ponte & Bulbo (Controle Descendente da Dor)", name3d: "Grupos Pontinos A5/A7", color: "#3b82f6", sx: 0.55, sy: 0.78, x: 1.6, y: -6.2, z: -3.5, r: 0.7, bilateral: true, source: ["kandel6", "stahl5"] },
    meynert: { id: 'meynert', label: "Meynert (NBM)", fullName: "Núcleo Basal de Meynert (Acetilcolina)", name3d: "Núcleo Basal de Meynert (Ch4)", color: "#f97316", sx: 0.38, sy: 0.50, x: 2.8, y: -2.2, z: 2.5, r: 0.75, bilateral: true, source: ["kandel6", "stahl5"] },
    orexina: { id: 'orexina', label: "Hipot-Lat (Orexina)", fullName: "Hipotálamo Lateral (Orexina / Hipocretina)", name3d: "Hipotálamo Lateral (Orexina)", color: "#facc15", sx: 0.44, sy: 0.52, x: 1.8, y: -1.4, z: 0.5, r: 0.75, bilateral: true, source: ["kandel6", "stahl5"] },
    tmn: { id: 'tmn', label: "TMN (Histamina)", fullName: "Núcleo Tuberomamilar (Histamina H1)", name3d: "Núcleo Tuberomamilar (TMN)", color: "#e11d48", sx: 0.45, sy: 0.58, x: 0, y: -2.2, z: 0.0, r: 0.75, bilateral: false, source: ["kandel6", "stahl5"] },
    medula: { id: 'medula', label: "Corno Dorsal Medula", fullName: "Medula Espinhal (Vias Ascendentes/Descendentes)", name3d: "Corno Dorsal da Medula Espinhal", color: "#38bdf8", sx: 0.56, sy: 0.86, x: 0, y: -9.5, z: -3.8, r: 0.9, bilateral: false, source: ["kandel6", "stahl5"] },
    // v12.25.0 — nos da alca motora dos nucleos da base e do bulbo rostroventromedial.
    // Coordenadas escolhidas com >= 0,030 de distancia de qualquer vizinho: o menor espacamento que
    // ja existia no mapa era 0,0224 (mamilar x TMN), e a v12.22 acabou de corrigir sobreposicao.
    m1: { id: 'm1', label: "Córtex M1", fullName: "Córtex Motor Primário (Pré-central)", name3d: "Córtex Motor Primário M1", color: "#fb923c", sx: 0.40, sy: 0.20, x: 2.6, y: 7.0, z: 3.4, r: 1.05, bilateral: true, source: ["kandel6", "obeso2008"] },
    gpe: { id: 'gpe', label: "GPe", fullName: "Globo Pálido Externo (elo da via indireta)", name3d: "Globo Pálido Externo", color: "#fb923c", sx: 0.455, sy: 0.435, x: 4.4, y: 1.2, z: 2.0, r: 0.85, bilateral: true, source: ["obeso2008", "eid2016"] },
    gpi: { id: 'gpi', label: "GPi / SNr", fullName: "Globo Pálido Interno & Substância Negra Reticulada (saída da alça)", name3d: "GPi / SNr", color: "#fb923c", sx: 0.44, sy: 0.468, x: 4.0, y: 0.6, z: 1.6, r: 0.85, bilateral: true, source: ["obeso2008", "eid2016"] },
    stn: { id: 'stn', label: "STN", fullName: "Núcleo Subtalâmico (2ª entrada da alça)", name3d: "Núcleo Subtalâmico", color: "#fb923c", sx: 0.505, sy: 0.515, x: 3.4, y: -0.6, z: 1.0, r: 0.75, bilateral: true, source: ["obeso2008"] },
    rvm: { id: 'rvm', label: "RVM", fullName: "Bulbo Rostroventromedial (células ON/OFF)", name3d: "Bulbo Rostroventromedial", color: "#a3e635", sx: 0.585, sy: 0.70, x: 0, y: -6.6, z: -2.6, r: 0.8, bilateral: false, source: ["depreter2024", "heinricher2016"] },
    // v12.26.0 — a SMA entra porque o rotulo da alca motora do CSTC ja a nomeava enquanto o traco
    // saia do S1 (somatossensorial). O COF entra porque o rotulo da alca afetiva dizia "OFC/vmPFC"
    // como se fossem um no so. Ambos a >= 0,030 de qualquer vizinho.
    sma: { id: 'sma', label: "Pré-SMA / SMA", fullName: "Área Motora Suplementar (iniciação e temporização do ato)", name3d: "Área Motora Suplementar", color: "#c084fc", sx: 0.33, sy: 0.235, x: 1.4, y: 7.2, z: 4.6, r: 1.0, bilateral: true, source: ["zapparoli2017", "kandel6"] },
    ofc: { id: 'ofc', label: "COF (Orbitofrontal)", fullName: "Córtex Orbitofrontal (valoração e alça do hábito)", name3d: "Córtex Orbitofrontal", color: "#f472b6", sx: 0.26, sy: 0.395, x: 3.0, y: -0.8, z: 8.8, r: 1.0, bilateral: true, source: ["alexander1986", "stahl5"] }
};

const tractsCatalog = [
    { layer: 'dopamine', subId: 'da_mesolimbic', from: 'vta', to: 'accumbens', color: '#a855f7', label: '1. Mesolímbica (VTA ➔ Accumbens)', arcY: 1.5, arcX: 0, source: ["stahl5"] },
    { layer: 'dopamine', subId: 'da_mesocortical', from: 'vta', to: 'pfc', color: '#a855f7', label: '2. Mesocortical (VTA ➔ DLPFC)', arcY: 3.5, arcX: 0, source: ["stahl5"] },
    { layer: 'dopamine', subId: 'da_nigrostriatal', from: 'snc', to: 'estriado', color: '#a855f7', label: '3. Nigroestriatal (SNc ➔ Estriado)', arcY: 2.0, arcX: 1.0, source: ["stahl5"] },
    { layer: 'dopamine', subId: 'da_tuberoinfundibular', from: 'hipotalamo', to: 'hipofise', color: '#a855f7', label: '4. Tuberoinfundibular (Hipotálamo ➔ Hipófise)', arcY: -1.0, arcX: 0, source: ["stahl5"] },
    { layer: 'dopamine', subId: 'da_thalamic', from: 'vta', to: 'talamo', color: '#a855f7', label: '5. Mesotalâmica (VTA ➔ Tálamo) — via modulatória adicional', arcY: 1.0, arcX: 0, source: ["stahl5"] },
    { layer: 'serotonin', subId: '5ht_pfc', from: 'rafe_d', to: 'pfc', color: '#ef4444', label: '1. Rafe ➔ DLPFC (Afeto/Humor)', arcY: 4.5, arcX: 0, source: ["stahl5"] },
    { layer: 'serotonin', subId: '5ht_amygdala', from: 'rafe_d', to: 'amigdala', color: '#ef4444', label: '2. Rafe ➔ Amígdala (Pânico/Medo)', arcY: -0.5, arcX: 2.0, source: ["stahl5"] },
    { layer: 'serotonin', subId: '5ht_hippo', from: 'rafe_m', to: 'hipocampo', color: '#ef4444', label: '3. Rafe ➔ Hipocampo (Memória/5-HT1A)', arcY: 0.5, arcX: 2.0, source: ["stahl5"] },
    { layer: 'serotonin', subId: '5ht_striatum', from: 'rafe_d', to: 'estriado', color: '#ef4444', label: '4. Rafe ➔ Estriado (TOC/Impulsos)', arcY: 2.5, arcX: 0, source: ["stahl5"] },
    { layer: 'serotonin', subId: '5ht_hypothalamus', from: 'rafe_d', to: 'hipotalamo', color: '#ef4444', label: '5. Rafe ➔ Hipotálamo (Apetite/Sono)', arcY: 0.5, arcX: 0, source: ["stahl5"] },
    { layer: 'serotonin', subId: '5ht_occ', from: 'rafe_d', to: 'ctx_occ', color: '#ef4444', label: '6. Rafe ➔ Occipital (Percepção Visual)', arcY: 2.0, arcX: 0, source: ["stahl5"] },
    { layer: 'serotonin', subId: '5ht_parietal', from: 'rafe_d', to: 'ctx_post', color: '#ef4444', label: '7. Rafe ➔ Parietal (Esquema Corporal)', arcY: 4.0, arcX: 0, source: ["stahl5"] },
    { layer: 'norepinephrine', subId: 'ne_pfc', from: 'lc', to: 'pfc', color: '#3b82f6', label: '1. LC ➔ DLPFC (Atenção/Alfa-2A)', arcY: 4.0, arcX: 1.0, source: ["stahl5", "kandel6"] },
    { layer: 'norepinephrine', subId: 'ne_amygdala', from: 'lc', to: 'amigdala', color: '#3b82f6', label: '2. LC ➔ Amígdala (Hipervigilância)', arcY: 0.0, arcX: 2.5, source: ["stahl5", "kandel6"] },
    { layer: 'norepinephrine', subId: 'ne_hippo', from: 'lc', to: 'hipocampo', color: '#3b82f6', label: '3. LC ➔ Hipocampo (Codificação β / co-DA)', arcY: 1.0, arcX: 2.5, source: ["stahl5", "kandel6", "tran2025"] },
    { layer: 'norepinephrine', subId: 'ne_parietal', from: 'lc', to: 'ctx_post', color: '#3b82f6', label: '4. LC ➔ Parietal (Orientação)', arcY: 5.0, arcX: 1.0, source: ["stahl5", "kandel6"] },
    { layer: 'norepinephrine', subId: 'ne_reuniens', from: 'lc', to: 'reuniens', color: '#3b82f6', label: '5. LC ➔ Reuniens (Recuperação α1)', arcY: 1.5, arcX: 0, source: ["stahl5", "kandel6", "tran2025"] },
    { layer: 'norepinephrine', subId: 'ne_a1a2_pvn', from: 'a1a2', to: 'hipotalamo', color: '#3b82f6', label: '6. A1/A2 ➔ Hipotálamo PVN (HPA)', arcY: -1.5, arcX: 0, source: ["stahl5", "kandel6"] },
    { layer: 'norepinephrine', subId: 'ne_a5a7_cord', from: 'a5a7', to: 'medula', color: '#3b82f6', label: '7. A5/A7 ➔ Medula (Dor/Simpático)', arcY: -3.0, arcX: 0, source: ["stahl5", "kandel6"] },
    { layer: 'fear', subId: 'fear_low_road', from: 'talamo', to: 'amigdala', color: '#ef4444', label: 'Medo 1.1: Low Road (Tálamo ➔ BLA)', arcY: -1.0, arcX: 1.5, source: ["tovote2015", "ledoux2000"] },
    { layer: 'fear', subId: 'fear_high_road', from: 'pfc', to: 'amigdala', color: '#ef4444', label: 'Medo 1.2: High Road (Córtex ➔ BLA)', arcY: 2.0, arcX: 1.5, source: ["tovote2015", "ledoux2000"] },
    { layer: 'fear', subId: 'fear_freezing', from: 'amigdala', to: 'pag', color: '#ef4444', label: 'Medo 1.3: CeA ➔ vlPAG (Freezing)', arcY: -1.5, arcX: -1.0, source: ["tovote2015", "ledoux2000"] },
    { layer: 'fear', subId: 'fear_flight', from: 'amigdala', to: 'pag', color: '#f43f5e', label: 'Medo 1.4: CeA ➔ dPAG (Fuga/Luta)', arcY: -1.0, arcX: -1.0, source: ["tovote2015", "ledoux2000"] },
    { layer: 'fear', subId: 'fear_extinction', from: 'vmpfc', to: 'amigdala', color: '#22c55e', label: 'Medo 1.5: vmPFC ➔ ITC (Freio de Extinção)', arcY: 0.5, arcX: 1.0, source: ["tovote2015", "ledoux2000"] },
    { layer: 'panic', subId: 'panic_cea_lc', from: 'amigdala', to: 'lc', color: '#f97316', label: 'Pânico 2.1: CeA ➔ Locus Coeruleus (Descarga NA)', arcY: -1.5, arcX: -1.0, source: ["stahl5", "klein1993"] },
    { layer: 'panic', subId: 'panic_cea_hypothalamus', from: 'amigdala', to: 'hipotalamo', color: '#f97316', label: 'Pânico 2.2: CeA ➔ Hipotálamo (Eixo HPA)', arcY: -0.8, arcX: -1.5, source: ["stahl5", "klein1993"] },
    { layer: 'panic', subId: 'panic_nts_parabrachial', from: 'medula', to: 'amigdala', color: '#fb7185', label: 'Pânico 2.3: Bulbo NTS ➔ Amígdala (Alarme CO2)', arcY: 2.0, arcX: 2.0, source: ["stahl5", "klein1993"] },
    { layer: 'panic', subId: 'panic_insula_amygdala', from: 'insula', to: 'amigdala', color: '#fb7185', label: 'Pânico 2.4: Ínsula ➔ Amígdala (Interocepção)', arcY: -0.5, arcX: 0, source: ["stahl5", "klein1993"] },
    { layer: 'gad', subId: 'gad_cstc_worry', short: "DLPFC ➔ Caudado (worry)", from: 'pfc', to: 'estriado', color: '#06b6d4', label: 'TAG 3.1: Alça CSTC DLPFC ➔ Caudato (Worry Loop)', arcY: 2.5, arcX: 0, source: ["stahl5"] },
    { layer: 'gad', subId: 'gad_bnst_amygdala', from: 'estriado', to: 'amigdala', color: '#06b6d4', label: 'TAG 3.2: BNST ➔ Amígdala (Tensão Crônica)', arcY: 0.5, arcX: 1.5, source: ["stahl5"] },
    { layer: 'gad', subId: 'gad_thalamo_s1', from: 'talamo', to: 's1', color: '#0ea5e9', label: 'TAG 3.3: Tálamo ➔ S1 (Tensão Muscular)', arcY: 3.5, arcX: 0, source: ["stahl5"] },
    { layer: 'gad', subId: 'gad_raphe_pfc', from: 'rafe_d', to: 'pfc', color: '#0ea5e9', label: 'TAG 3.4: Rafe ➔ DLPFC (Freio 5-HT1A)', arcY: 4.0, arcX: 0, source: ["stahl5"] },
    // v12.21.0 — as 9 vias glutamatergicas foram conferidas contra fontes primarias em 01/09/2026     // (docs/Conferencia_Vias_Glutamatergicas.md). Tres rotulos mudaram:     //   1.3  mPFC -> LC: a projecao direta glutamatergica esta documentada e quantificada     //        (lukinic2025, aferencia do IL ao A6) e a transmissao no LC e NMDA + nao-NMDA     //        (jodo1997). Existe tambem rota indireta pelo nucleo paragigantocelular.     //   2.1  a origem do trato perfurante e a CAMADA II do cortex entorrinal (dolorfo1998),     //        nao "cortex" generico — e o ponto de ensino do Alzheimer precoce.     //   2.2  ERA "Colaterais de Schaffer" apontando para o vmPFC. As colaterais de Schaffer     //        sao CA3 -> CA1, INTRA-hipocampais, e nao saem do hipocampo (kwon2018). O traco     //        desenhado estava certo e o nome errado: e a projecao monossinaptica     //        glutamatergica do hipocampo ventral (vCA1/subiculo) ao mPFC (parent2009,     //        hsu2017). store.js dizia "CA3 -> CA1" na lista enquanto o mapa desenhava a seta     //        chegando no pre-frontal: um mesmo id afirmava duas coisas diferentes.
    { layer: 'glutamate', subId: 'glu_cortico_vta', from: 'pfc', to: 'vta', color: '#eab308', label: '1.1: mPFC ➔ VTA (controle do disparo dopaminérgico)', arcY: 3.0, arcX: 0, funcao: "O mPFC regula o disparo dopaminergico do VTA: excitacao direta dos neuronios DA e, via interneuronios GABA locais, freio sobre eles. E o controle descendente do valor.", source: ["stahl5", "kandel6", "moghaddam2012"] },
        { layer: 'glutamate', subId: 'glu_cortico_raphe', from: 'pfc', to: 'rafe_d', color: '#eab308', label: '1.2: mPFC ➔ Rafe Dorsal (aferente glutamatérgico principal)', arcY: 3.5, arcX: 0, funcao: "Aferente glutamatergico principal da Rafe Dorsal: o cortex informa o nucleo serotoninergico sobre contexto e controle percebido.", source: ["stahl5", "kandel6", "lee2003"] },
        { layer: 'glutamate', subId: 'glu_cortico_lc', from: 'pfc', to: 'lc', color: '#eab308', label: '1.3: mPFC ➔ LC (A6) — glutamatérgica direta, NMDA + AMPA', arcY: 3.8, arcX: 0, funcao: "Excitacao direta do Locus Coeruleus por NMDA e AMPA — o cortex convoca o alerta noradrenergico quando o contexto exige.", source: ["stahl5", "kandel6", "lukinic2025", "jodo1997"] },
    { layer: 'glutamate', subId: 'glu_cortico_striatal', from: 'pfc', to: 'estriado', color: '#eab308', label: '1.4: Córtico-Estriatal (alças CSTC)', arcY: 2.8, arcX: 0, funcao: "Entrada excitatoria das alcas CSTC: o cortex propoe programas ao estriado, que os seleciona ou descarta.", source: ["stahl5", "kandel6"] },
    { layer: 'glutamate', subId: 'glu_corticocortical_dir', from: 'pfc', to: 'ctx_post', color: '#eab308', label: '1.5: Córtico-Cortical Direta (PFC ➔ Parietal)', arcY: 5.5, arcX: 0, funcao: "Associacao cortical direta: carrega a representacao entre areas sem passar pelo talamo.", source: ["stahl5", "kandel6"] },
    { layer: 'glutamate', subId: 'glu_corticothalamic', from: 'pfc', to: 'talamo', color: '#eab308', label: '1.6: Córtico-Talâmica (sensory gating)', arcY: 2.5, arcX: 0, funcao: "Projecao descendente que devolve ao talamo um sinal decidindo o que merece subir: e o substrato do gating sensorial. Quando falha, estimulos irrelevantes ganham acesso e peso, e a experiencia perde hierarquia.", source: ["stahl5", "kandel6", "moghaddam2012"] },
    { layer: 'glutamate', subId: 'glu_thalamocortical', from: 'talamo', to: 'pfc', color: '#eab308', label: '1.7: Tálamo-Cortical (arousal)', arcY: 2.5, arcX: 0, funcao: "Via ascendente do arousal: entrega ao cortex o que sobreviveu ao filtro. Os nucleos especificos enderecam sua area sensorial correspondente; os inespecificos (intralaminares, reuniens) espalham excitacao difusa e sustentam a vigilia.", source: ["stahl5", "kandel6", "moghaddam2012"] },
        { layer: 'glutamate', subId: 'glu_perforant_path', short: "Entorrinal ➔ Giro Denteado", from: 'ctx_temp', to: 'hipocampo', color: '#facc15', label: '2.1: Córtex Entorrinal (camada II) ➔ Giro Denteado', arcY: -0.5, arcX: -1.0, funcao: "Primeira sinapse do circuito trissinaptico: o cortex entorrinal (camada II) entrega ao giro denteado o padrao a ser separado.", source: ["stahl5", "kandel6", "dolorfo1998"] },
        { layer: 'glutamate', subId: 'glu_vhipp_mpfc', short: "Hipocampo ventral ➔ mPFC", from: 'hipocampo', to: 'vmpfc', color: '#facc15', label: '2.2: Hipocampo Ventral (vCA1/Subículo) ➔ mPFC', arcY: 1.5, arcX: -1.5, funcao: "Carrega o contexto espacial e emocional ate a decisao: e por esta projecao que 'onde estou, e o que ja aconteceu aqui' entra no calculo do que fazer. Sustenta a discriminacao entre ambiente seguro e ameacador durante a extincao.", source: ["parent2009", "hsu2017", "kandel6", "schobel2013", "lodge2007"] },
    { layer: 'gaba', subId: 'gaba_pv_gamma', from: 'pfc', to: 'vmpfc', color: '#22c55e', label: 'GABA 1: Interneurônios PV+ (Oscilações Gama 40 Hz)', arcY: 1.5, arcX: 0, source: ["kandel6"] },
    { layer: 'gaba', subId: 'gaba_sst_dendritic', from: 'pfc', to: 'ctx_post', color: '#22c55e', label: 'GABA 2: Interneurônios SST+ (Inibição Dendrítica)', arcY: 5.0, arcX: 0, source: ["kandel6"] },
    { layer: 'gaba', subId: 'gaba_striato_pallidal', short: "Estriatonigral/-palidal", from: 'estriado', to: 'snc', color: '#22c55e', label: 'GABA 3: Estriatonigral / Estriatopalidal', arcY: 1.0, arcX: 0, source: ["kandel6"] },
    { layer: 'cholinergic', subId: 'ach_meynert_pfc', from: 'meynert', to: 'pfc', color: '#0284c7', label: 'ACh 1: Meynert Ch4 ➔ Neocórtex (Atenção)', arcY: 2.5, arcX: -1.0, source: ["kandel6"] },
    { layer: 'cholinergic', subId: 'ach_septo_hippo', from: 'meynert', to: 'hipocampo', color: '#0284c7', label: 'ACh 2: Septohipocampal (Ritmo Teta 4-8 Hz)', arcY: 0.5, arcX: 1.0, source: ["kandel6"] },
    { layer: 'habenula', subId: 'lhb_rmtg', from: 'habenula', to: 'rmtg', color: '#7c3aed', label: 'Habênula 1: LHb ➔ RMTg (GABA)', arcY: -1.0, arcX: 0, source: ["hu2020"] },
    { layer: 'habenula', subId: 'rmtg_vta_brake', from: 'rmtg', to: 'vta', color: '#7c3aed', label: 'Habênula 2: RMTg ➔ VTA (Freio da Recompensa)', arcY: -0.5, arcX: 0, source: ["hu2020"] },
    { layer: 'habenula', subId: 'rmtg_rafe_brake', from: 'rmtg', to: 'rafe_d', color: '#7c3aed', label: 'Habênula 3: RMTg ➔ Rafe (Freio da Serotonina)', arcY: -0.8, arcX: 0, source: ["hu2020"] },
    { layer: 'hpa', subId: 'hpa_pvn_pituitary', short: "PVN ➔ Adeno-hipófise", from: 'hipotalamo', to: 'hipofise', color: '#dc2626', label: 'HPA 1: Hipotálamo PVN ➔ Adeno-hipófise (CRF/ACTH)', arcY: -1.5, arcX: 0, source: ["ulrichlai2009"] },
    { layer: 'hpa', subId: 'hpa_hippo_brake', from: 'hipocampo', to: 'hipotalamo', color: '#dc2626', label: 'HPA 2: Hipocampo ➔ PVN (Feedback Negativo)', arcY: 0.5, arcX: -1.5, source: ["ulrichlai2009"] },
    { layer: 'dmn', subId: 'dmn_precuneus_vmpfc', from: 'ctx_post', to: 'vmpfc', color: '#ec4899', label: 'DMN 1: Precúneo/PCC ➔ vmPFC (Ruminação)', arcY: 4.5, arcX: 0, source: ["menon2011"] },
    { layer: 'dmn', subId: 'dmn_vmpfc_hippo', from: 'vmpfc', to: 'hipocampo', color: '#ec4899', label: 'DMN 2: vmPFC ➔ Hipocampo (Memória Autobiográfica)', arcY: 1.0, arcX: 1.5, source: ["menon2011"] },
    { layer: 'cen', subId: 'cen_pfc_parietal', short: "DLPFC ➔ Parietal", from: 'pfc', to: 'ctx_post', color: '#06b6d4', label: 'CEN 1: DLPFC ➔ Parietal Posterior (Atenção Executiva)', arcY: 5.9, arcX: 0, source: ["menon2011"] },
    { layer: 'cen', subId: 'cen_parietal_pfc', from: 'ctx_post', to: 'pfc', color: '#06b6d4', label: 'CEN 2: Parietal ➔ DLPFC (Controle Focado)', arcY: 5.5, arcX: 0, source: ["menon2011"] },
    { layer: 'salience', subId: 'salience_insula_pfc', from: 'insula', to: 'pfc', color: '#14b8a6', label: 'Saliência 1: Ínsula ➔ dACC/DLPFC (Comutador DMN/CEN)', arcY: 2.0, arcX: -1.5, source: ["menon2011"] },
    { layer: 'salience', subId: 'salience_insula_amygdala', from: 'insula', to: 'amigdala', color: '#14b8a6', label: 'Saliência 2: Ínsula ➔ Amígdala (Interocepção)', arcY: -1.0, arcX: 0, source: ["menon2011"] },
    { layer: 'orexin', subId: 'orexin_pfc', short: "Hipot. lateral ➔ Córtex", from: 'orexina', to: 'pfc', color: '#ea580c', label: 'Orexina 1: Hipotálamo Lateral ➔ Córtex (Vigília)', arcY: 3.0, arcX: -1.0, source: ["kandel6"] },
    { layer: 'orexin', subId: 'orexin_lc', from: 'orexina', to: 'lc', color: '#ea580c', label: 'Orexina 2: Hipotálamo Lateral ➔ LC (Flip-Flop Sono)', arcY: -2.0, arcX: 0, source: ["kandel6"] },
    { layer: 'histamine', subId: 'histamine_pfc', from: 'tmn', to: 'pfc', color: '#b45309', label: 'Histamina 1: TMN ➔ Córtex (H1 Alerta)', arcY: 3.5, arcX: 0, source: ["kandel6"] },
    { layer: 'histamine', subId: 'histamine_talamo', from: 'tmn', to: 'talamo', color: '#b45309', label: 'Histamina 2: TMN ➔ Tálamo (H1 Vigília)', arcY: 1.5, arcX: 0, source: ["kandel6"] },
    { layer: 'ecb', subId: 'ecb_hippo_amygdala', from: 'hipocampo', to: 'amigdala', color: '#16a34a', label: 'eCB 1: Hipocampo ➔ Amígdala (Extinção do Medo)', arcY: -0.5, arcX: 0, source: ["castillo2012"] },
    { layer: 'ecb', subId: 'ecb_pfc_vta', from: 'pfc', to: 'vta', color: '#16a34a', label: 'eCB 2: PFC ➔ VTA (Modulação Retrógrada DA)', arcY: 2.5, arcX: 0, source: ["castillo2012"] },
    { layer: 'opioid', subId: 'opioid_pag_medulla', from: 'amigdala', to: 'pag', color: '#9333ea', label: 'Opioide 1: Amígdala ➔ PAG (analgesia mu)', nota: 'a continuacao PAG ➔ RVM ➔ corno dorsal esta desenhada na camada Sensorial', arcY: -0.6, arcX: -1.0, source: ["kandel6"] },
    { layer: 'opioid', subId: 'opioid_vta_accumbens', from: 'vta', to: 'accumbens', color: '#9333ea', label: 'Opioide 2: VTA ➔ Accumbens (Valência de Alívio)', arcY: 1.0, arcX: 0, source: ["kandel6"] },
    { layer: 'adenosine', subId: 'adenosine_corticostriatal', from: 'pfc', to: 'estriado', color: '#64748b', label: 'Adenosina 1: Córtex ➔ Estriado (Pressão de Sono A1/A2A)', arcY: 3.2, arcX: 0, source: ["kandel6"] },
    { layer: 'papez', subId: 'papez_hippo_fornix', short: "Fórnix ➔ Corpos Mamilares", from: 'hipocampo', to: 'mamilar', color: '#d97706', label: 'Papez 1: Hipocampo ➔ Fórnix ➔ Corpos Mamilares', arcY: 0.5, arcX: -1.5, source: ["kandel6"] },
    { layer: 'papez', subId: 'papez_mamilo_thalamic', short: "Mamilo-talâmico", from: 'mamilar', to: 'talamo', color: '#d97706', label: 'Papez 2: Trato Mamilo-Talâmico ➔ Tálamo', arcY: 1.8, arcX: 0, source: ["kandel6"] },

        
// ===== v12.25.0 — ALCA MOTORA DOS NUCLEOS DA BASE =====
        
// Arquitetura conforme Obeso e col.: duas entradas (estriado e STN), uma saida (GPi), que fala
        
// com o cortex pelo talamo motor. A via direta chega ao GPi pelo estriado; a indireta passa
        
// pelo GPe e pelo STN. Transmissores conforme Eid & Parent: estriatopalidal GABAergico
        
// inibitorio, subtalamopalidal glutamatergico excitatorio.
        
//
        
// A segregacao D1 = direta / D2 = indireta e o MODELO PADRAO, e Bertran-Gonzalez e col. a
        
// revisam registrando que estudos anatomicos questionam a segregacao estrita, com sobreposicao
        
// variavel de receptores. Por isso os rotulos dizem D1/D2 e a nota carrega o limite: ensinar o
        
// modelo sem o limite dele e ensinar pela metade.
        
{ layer: 'motor', subId: 'motor_cortico_striatal', from: 'm1', to: 'estriado', color: '#fb923c', label: 'M1: Córtico-Estriatal (entrada da alça)', nt: 'Glutamato', sinal: 'excitatorio', arcY: 2.2, arcX: 0.5, source: ["obeso2008", "kandel6"] },
        
{ layer: 'motor', subId: 'motor_direta_gpi', short: "Via direta (D1)", from: 'estriado', to: 'gpi', color: '#fb923c', label: 'Via DIRETA (D1): Estriado ➔ GPi/SNr', nt: 'GABA', sinal: 'inibitorio', nota: 'D1 facilita a via direta; a segregacao D1/D2 e o modelo padrao e tem sobreposicao documentada', arcY: 1.2, arcX: -0.5, source: ["obeso2008", "bertrangonzalez2010", "eid2016"] },
        
{ layer: 'motor', subId: 'motor_indireta_gpe', short: "Via indireta (D2)", from: 'estriado', to: 'gpe', color: '#fb923c', label: 'Via INDIRETA (D2): Estriado ➔ GPe', nt: 'GABA', sinal: 'inibitorio', nota: 'D2 inibe a via indireta; a segregacao D1/D2 e o modelo padrao e tem sobreposicao documentada', arcY: 0.6, arcX: 0.8, source: ["obeso2008", "bertrangonzalez2010", "eid2016"] },
        
{ layer: 'motor', subId: 'motor_gpe_stn', from: 'gpe', to: 'stn', color: '#fb923c', label: 'Indireta 2: GPe ➔ STN', nt: 'GABA', sinal: 'inibitorio', arcY: -0.8, arcX: 1.2, source: ["obeso2008"] },
        
{ layer: 'motor', subId: 'motor_stn_gpi', from: 'stn', to: 'gpi', color: '#fb923c', label: 'Indireta 3: STN ➔ GPi (único excitatório da alça)', nt: 'Glutamato', sinal: 'excitatorio', arcY: -1.4, arcX: -0.8, source: ["obeso2008", "eid2016"] },
        
{ layer: 'motor', subId: 'motor_gpi_talamo', from: 'gpi', to: 'talamo', color: '#fb923c', label: 'Saída: GPi/SNr ➔ Tálamo (freio tônico)', nt: 'GABA', sinal: 'inibitorio', arcY: -2.0, arcX: 0.4, source: ["obeso2008"] },
        
{ layer: 'motor', subId: 'motor_talamo_m1', from: 'talamo', to: 'm1', color: '#fb923c', label: 'Tálamo motor ➔ M1 (fecha a alça)', nt: 'Glutamato', sinal: 'excitatorio', arcY: 4.2, arcX: -0.4, source: ["obeso2008", "kandel6"] },

        
// ===== v12.25.0 — CIRCUITO SENSORIAL: DOR E SOMATOSSENSORIAL =====
        
// Ascendente pelo espinotalamico, e a modulacao descendente PAG -> RVM -> corno dorsal. De
        
// Preter & Heinricher descrevem o RVM como no de SAIDA do circuito descendente, com celulas ON
        
// (facilitam) e OFF (suprimem) modulando a transmissao no corno dorsal — e por isso a mesma via
        
// pode aliviar ou piorar a dor, o que sustenta a transicao de dor aguda para cronica.
        
{ layer: 'sensorial', subId: 'sens_espinotalamico', short: "Espinotalâmico", from: 'medula', to: 'talamo', color: '#a3e635', label: 'Espinotalâmico: Corno Dorsal ➔ Tálamo', nt: 'Glutamato', sinal: 'excitatorio', arcY: 3.2, arcX: 1.5, source: ["kandel6", "heinricher2016"] },
        
{ layer: 'sensorial', subId: 'sens_talamo_s1', from: 'talamo', to: 's1', color: '#a3e635', label: 'Tálamo ➔ S1 (somatossensorial)', nt: 'Glutamato', sinal: 'excitatorio', arcY: 4.8, arcX: -0.6, source: ["kandel6"] },
        
{ layer: 'sensorial', subId: 'sens_desc_pag_rvm', from: 'pag', to: 'rvm', color: '#a3e635', label: 'Descendente 1: PAG ➔ RVM', nt: 'misto', sinal: 'modulatorio', arcY: -2.6, arcX: 2.0, source: ["depreter2024", "heinricher2016"] },
        
{ layer: 'sensorial', subId: 'sens_desc_rvm_medula', from: 'rvm', to: 'medula', color: '#a3e635', label: 'Descendente 2: RVM ➔ Corno Dorsal (células ON/OFF)', nt: 'misto', sinal: 'modulatorio', nota: 'celulas OFF suprimem e ON facilitam a transmissao nociceptiva', arcY: -3.0, arcX: 2.5, source: ["depreter2024"] },

        
// ===== v12.26.0 — ALCAS CORTICO-ESTRIADO-TALAMO-CORTICAIS (Alexander, DeLong & Strick) =====
        
// As tres alcas do CSTC eram arcos UNICOS cujos rotulos descreviam tres pernas ("SMA -> Putamen
        
// -> Talamo") e nenhuma voltava ao cortex: a alca nao fechava. A motora ainda saia do S1
        
// (somatossensorial) com rotulo dizendo SMA. Agora cada alca tem entrada, saida e retorno.
        
{ layer: 'cstc', subId: 'cstc_motora_in', from: 'sma', to: 'estriado', color: '#f59e0b', label: 'CSTC motora 1: SMA ➔ Putâmen', nt: 'Glutamato', sinal: 'excitatorio', arcY: 3.5, arcX: 0.6, source: ["alexander1986", "zapparoli2017"] },
        
{ layer: 'cstc', subId: 'cstc_saida_dorsal', from: 'estriado', to: 'talamo', color: '#f59e0b', label: 'CSTC 2: Estriado dorsal ➔ Tálamo (saída comum)', nt: 'GABA', sinal: 'inibitorio', nota: 'no mapa detalhado, esta saida passa por GPe/GPi/STN — ver a camada Motor', arcY: 1.9, arcX: -0.4, source: ["alexander1986", "obeso2008"] },
        
{ layer: 'cstc', subId: 'cstc_motora_out', from: 'talamo', to: 'sma', color: '#f59e0b', label: 'CSTC motora 3: Tálamo ➔ SMA (fecha)', nt: 'Glutamato', sinal: 'excitatorio', arcY: 4.4, arcX: 0.2, source: ["alexander1986"] },
        
{ layer: 'cstc', subId: 'cstc_executiva_in', from: 'pfc', to: 'estriado', color: '#f59e0b', label: 'CSTC executiva 1: DLPFC ➔ Caudado', nt: 'Glutamato', sinal: 'excitatorio', arcY: 2.6, arcX: 1.0, source: ["alexander1986"] },
        
{ layer: 'cstc', subId: 'cstc_executiva_out', from: 'talamo', to: 'pfc', color: '#f59e0b', label: 'CSTC executiva 3: Tálamo ➔ DLPFC (fecha)', nt: 'Glutamato', sinal: 'excitatorio', arcY: 3.1, arcX: -1.0, source: ["alexander1986"] },
        
{ layer: 'cstc', subId: 'cstc_afetiva_in', from: 'vmpfc', to: 'accumbens', color: '#f59e0b', label: 'CSTC afetiva 1: vmPFC/CCA ➔ Accumbens', nt: 'Glutamato', sinal: 'excitatorio', arcY: 0.5, arcX: -0.2, source: ["alexander1986"] },
        
{ layer: 'cstc', subId: 'cstc_saida_ventral', from: 'accumbens', to: 'talamo', color: '#f59e0b', label: 'CSTC afetiva 2: Accumbens ➔ Tálamo', nt: 'GABA', sinal: 'inibitorio', arcY: 0.9, arcX: 0.4, source: ["alexander1986"] },
        
{ layer: 'cstc', subId: 'cstc_afetiva_out', from: 'talamo', to: 'vmpfc', color: '#f59e0b', label: 'CSTC afetiva 3: Tálamo ➔ vmPFC/CCA (fecha)', nt: 'Glutamato', sinal: 'excitatorio', arcY: 1.4, arcX: -1.2, source: ["alexander1986"] },

        
// ===== v12.26.0 — IMPULSIVIDADE (alca ventral, Stahl fig. 13.1) =====
        
// A alca "de baixo para cima" vai do estriado VENTRAL ao talamo, do talamo ao vmPFC/CCA e de
        
// volta. E modulada "de cima para baixo" pelo pre-frontal: se esse freio e inadequado ou e
        
// superado pela atividade do estriado ventral, aparece o comportamento impulsivo.
        
{ layer: 'impulsividade', subId: 'imp_freio_topdown', short: "Freio top-down", from: 'pfc', to: 'accumbens', color: '#38bdf8', label: 'Freio top-down: PFC ➔ Estriado ventral', nt: 'Glutamato', sinal: 'excitatorio', nota: 'recruta inibicao local; a falha deste controle e o ponto do modelo', arcY: 1.8, arcX: -1.4, source: ["stahl5", "alexander1986"] },
        
{ layer: 'impulsividade', subId: 'imp_ventral_talamo', from: 'accumbens', to: 'talamo', color: '#38bdf8', label: 'Ventral 1: Estriado ventral ➔ Tálamo', nt: 'GABA', sinal: 'inibitorio', arcY: -0.4, arcX: 1.4, source: ["stahl5", "alexander1986"] },
        
{ layer: 'impulsividade', subId: 'imp_talamo_vmpfc', from: 'talamo', to: 'vmpfc', color: '#38bdf8', label: 'Ventral 2: Tálamo ➔ vmPFC/CCA (fecha)', nt: 'Glutamato', sinal: 'excitatorio', arcY: 2.1, arcX: 1.8, source: ["stahl5", "alexander1986"] },

        
// ===== v12.26.0 — COMPULSIVIDADE (alca dorsal do habito, Stahl fig. 13.2) =====
        
// Mesma arquitetura no estriado DORSAL, com o COF no lugar do vmPFC. E a alca do habito: quando
        
// o controle top-down do COF e inadequado ou superado pela atividade estriatal dorsal, aparece o
        
// comportamento compulsivo. Segundo o material de aula, a recompensa deixa de importar e o
        
// comportamento passa a ser impulsionado pelo estimulo.
        
{ layer: 'compulsividade', subId: 'comp_habito_topdown', short: "Controle top-down", from: 'ofc', to: 'estriado', color: '#f472b6', label: 'Controle top-down: COF ➔ Estriado dorsal', nt: 'Glutamato', sinal: 'excitatorio', arcY: 2.9, arcX: -1.2, source: ["stahl5", "alexander1986"] },
        
{ layer: 'compulsividade', subId: 'comp_dorsal_talamo', from: 'estriado', to: 'talamo', color: '#f472b6', label: 'Dorsal 1: Estriado dorsal ➔ Tálamo', nt: 'GABA', sinal: 'inibitorio', arcY: 0.2, arcX: 1.6, source: ["stahl5", "alexander1986"] },
        
{ layer: 'compulsividade', subId: 'comp_talamo_ofc', from: 'talamo', to: 'ofc', color: '#f472b6', label: 'Dorsal 2: Tálamo ➔ COF (fecha o hábito)', nt: 'Glutamato', sinal: 'excitatorio', arcY: 3.8, arcX: -1.6, source: ["stahl5", "alexander1986"] }
];

// Derivações para os dois renderizadores
const nuclei3DCoords = Object.fromEntries(Object.entries(nucleiCatalog).map(([id, n]) => [id, { x: n.x, y: n.y, z: n.z, color: parseInt(n.color.slice(1), 16), name: n.name3d || n.fullName, r: n.r, bilateral: n.bilateral }]));

const tractConfigs3D = tractsCatalog.map(t => ({ layer: t.layer, subId: t.subId, from: t.from, to: t.to, color: parseInt(t.color.slice(1), 16), arcY: t.arcY, arcX: t.arcX }));

/*
 * v12.34 — o nome CURTO de uma via, por autoria: `short` quando declarado no catalogo; senao derivado do
 * rotulo tirando o prefixo de numeracao ("1. ", "GABA 1: ", "CSTC executiva 3: "), o aposto final entre
 * parenteses e a coda depois de um travessao. Nunca por truncamento: "Substantia Nig…" nao e nome anatomico.
 * Os 14 `short:` escritos a mao no catalogo sao os casos em que o prefixo era o proprio conteudo (Via direta
 * (D1), Espinotalamico, Freio top-down) ou em que o derivado passava de 30 caracteres. Revisao do PO: e dado.
 */
function rotuloCurtoDaVia(t) {
    if (t && t.short) return t.short;
    let s = String((t && t.label) || '');
    s = s.replace(/^[^:➔]{1,24}:\s+/, '');
    s = s.replace(/^\d+[.)]?\s+/, '');
    s = s.replace(/\s*[—–]\s+.*$/, '');
    s = s.replace(/\s*\([^)]*\)\s*$/, '');
    return s.trim() || String((t && (t.label || t.subId)) || '');
}

function nuclei2DFor(w, h) { return Object.fromEntries(Object.entries(nucleiCatalog).map(([id, n]) => [id, { id, x: w * n.sx, y: h * n.sy, label: n.label, fullName: n.fullName, color: n.color }])); }

// v12.22.0: arcY/arcX entraram na projecao. Sem eles aqui, o renderizador le undefined e o leque
// de arcos nunca abre — o campo existe no catalogo, o codigo o consulta, e o valor nao viaja.
function tracts2DFor(nuclei) { return tractsCatalog.map(t => ({ type: t.layer, subId: t.subId, from: nuclei[t.from], to: nuclei[t.to], color: t.color, label: t.label, short: t.short, arcY: t.arcY, arcX: t.arcX })); }   // v12.34: short viaja

// Alvos nomeados nos TEXTOS DE CIRCUITO (v12.2.1) — completa o achado 3 da Fase 0, que até aqui
// só cobria a farmacoteca. Extraídos dos campos `desc`/`clinical` de brainCircuitsData e conferidos
// um a um: "A1" nos circuitos NE e glutamato é o GRUPO CELULAR A1/A2, não o receptor de adenosina.
const circuitTargets = {
    dopamine: ['D2', '5-HT2A'],
    serotonin: ['5-HT1A', '5-HT2A'],
    norepinephrine: ['α2A', 'β1', 'α1'],
    glutamate: ['NMDA', 'AMPA'],
    gaba: ['GABA-A sináptico', 'GABA-A extrasináptico', 'D1', 'D2'],
    cholinergic: ['M1'],
    histamine: ['H1'],
    habenula: ['NMDA'],
    dmn: ['5-HT2A']
};

// Alvos citados nos circuitos que a ontologia canônica v0.1.0 não cobre (achado 6 da Fase 0).
const circuitTargetsForaDaOntologia = {
    ecb: ['CB1'], opioid: ['MOR (mu)', 'KOR (kappa)'], adenosine: ['A1', 'A2A'],
    cholinergic: ['α7 (nicotínico)'], glutamate: ['TrkB']
};

// Quais circuitos envolvem este alvo canônico.
function circuitsForTarget(canonId) {
    return Object.keys(circuitTargets).filter(k => circuitTargets[k].indexOf(canonId) !== -1);
}

const nucleiClinicalData = {
    pfc: {
        name: "Córtex Pré-Frontal Dorsolateral (DLPFC - Áreas 9/46)",
        class: "Neocórtex de Associação de Ordem Superior",
        inputs: "VTA (DA via D1), LC (NE via α2A), Tálamo (VA/MD), Hipocampo.",
        outputs: "Estriado Dorsal (Loop Executivo CSTC), LC (Top-Down), Habênula Lateral, VTA.",
        receptors: "D1, α2A (fecham canais HCN aumentando sinal/ruído), 5-HT1A, 5-HT2A, NMDA/AMPA, GABAA (interneurônios PV).",
        clinical: "Sede da **memória de trabalho, flexibilidade cognitiva e planejamento executivo**. Na depressão, a hipoatividade do DLPFC esquerdo gera apatia e anedonia; na esquizofrenia, o déficit de D1 e hipofunção de interneurônios PV produz sintomas cognitivos/negativos.",
        pharma: "Alvo de psicoestimulantes (Metilfenidato/Lisdexanfetamina), Guanfacina (α2A) e protocolos de Estimulação Magnética Transcraniana (EMT 10 Hz excitatória)."
    },
    vmpfc: {
        name: "Córtex Ventromedial & Cíngulo Anterior (vmPFC / ACC - Áreas 24/25/32)",
        class: "Córtex Paralímbico de Regulação Afetiva",
        inputs: "Amígdala, Hipocampo, Rafe Dorsal (5-HT), VTA, Tálamo MD.",
        outputs: "Núcleo Accumbens (Loop Afetivo CSTC), Amígdala, Hipotálamo PVN, Tronco Encefálico.",
        receptors: "5-HT1A, 5-HT2A, D2/D3, Receptores de Glicocorticoides (GR), Cannabinoides CB1.",
        clinical: "Centro de **avaliação de valor emocional, culpa, autocrítica e extinção do medo**. A hiperconectividade do Cíngulo Subgenual (Área 25 de Mayberg) é o marco da depressão melancólica refratária (alvo de DBS).",
        pharma: "ISRSs, Antidepressivos Multimodais (Vortioxetina), Psilocibina (agonismo 5-HT2A com quebra de ruminação) e DBS (130 Hz na área CG25)."
    },
    insula: {
        name: "Córtex Insular Anterior (Ínsula Anterior)",
        class: "Córtex Interoceptivo & Hub da Rede de Saliência",
        inputs: "Tálamo VPI/VMpo (sinais autonômicos e viscerais), Amígdala, Córtex Somatossensorial.",
        outputs: "Córtex Cingulado Anterior Dorsal (dACC), Núcleo Accumbens, Amígdala, Hipotálamo.",
        receptors: "5-HT2A, 5-HT3, Opioides Mu/Kappa, Receptores Nicotínicos α4β2, CB1.",
        clinical: "Transforma **sinais corporais internos (taquicardia, dor, aperto no peito) em sentimento consciente**. No Transtorno de Pânico, hiperinterpreta sinais viscerais como catástrofe iminente; processa a fissura (*craving*) por substâncias e a aversão/nojo no TOC.",
        pharma: "Benzodiazepínicos (GABAA), Pregabalina/Gabapentina (ligantes α2δ) e Terapia de Biofeedback."
    },
    habenula: {
        name: "Habênula Lateral (LHb - O Centro Anti-Recompensa)",
        class: "Núcleo Epitalâmico Regulador de Monoaminas",
        inputs: "Estria Medular (DLPFC, Globo Pálido Interno, Hipotálamo Lateral).",
        outputs: "Núcleo Tegmentar Rostromedial (RMTg) ➔ VTA e Rafe Dorsal.",
        receptors: "NMDA (GluN2B), GABAB, Orexina OX2, Receptores Cannabinoides CB1.",
        clinical: "É o núcleo canônico do **erro de previsão negativo** — decepção, perda esperada e dor social. Emite glutamato para excitar o freio GABAérgico do RMTg, silenciando os neurônios de dopamina da VTA e serotonina da Rafe. A hiperatividade crônica da LHb sustenta o desespero e anedonia refratária.",
        pharma: "A **Cetamina / Esquetamina** bloqueia os canais NMDA na LHb, interrompendo os disparos em rajada (*bursting*) e destravando a dopamina da VTA em minutos!"
    },
    rmtg: {
        name: "Núcleo Tegmentar Rostromedial (RMTg / Cauda da VTA)",
        class: "Grupamento GABAérgico Inibitório do Tronco Encefálico",
        inputs: "Habênula Lateral (projeção glutamatérgica densa via fascículo retroflexo).",
        outputs: "Neurônios dopaminérgicos da VTA/SNc e neurônios serotoninérgicos da Rafe Dorsal.",
        receptors: "AMPA/NMDA, Opioides Mu (receptores MOR inibem o RMTg, desinibindo a VTA).",
        clinical: "Atua como o **freio mestre do sistema dopaminérgico mesolímbico**. A ativação do RMTg pela Habênula suprime a motivação e a busca por recompensa.",
        pharma: "Opioides (Morfina, Fentanil) inibem o RMTg via receptores Mu, desinibindo a dopamina na VTA (mecanismo central da dependência opioide)."
    },
    accumbens: {
        name: "Núcleo Accumbens (Estriado Ventral - Shell & Core)",
        class: "Interface Límbico-Motora & Hub da Recompensa",
        inputs: "VTA (Dopamina via feixe prosencefálico medial), Hipocampo (Contexto), Amígdala (Emoção), PFC (Glutamato).",
        outputs: "Pálido Ventral ➔ Tálamo MD ➔ vmPFC (Loop Afetivo CSTC), VTA (Feedback GABAérgico).",
        receptors: "D1 (Via Direta - reforço e aproximação), D2/D3 (Via Indireta - aversão e flexibilidade), Opioides Mu/Delta, NMDA/AMPA.",
        clinical: "Sede da **saliência de incentivo, motivação dirigida a metas e antecipação de prazer**. Na depressão grave, há hiporresponsividade do Accumbens; nas dependências químicas, há hiperestimulação supra-fisiológica por drogas de abuso.",
        pharma: "Bupropiona (bloqueio DAT/NET), Antipsicóticos (bloqueio D2/D3), Naltrexona (bloqueio opioide Mu)."
    },
    estriado: {
        name: "Estriado Dorsal (Núcleo Caudato & Putâmen)",
        class: "Gânglios da Base / Hub Motor & Executivo",
        inputs: "SNc (Dopamina Nigroestriatal), Neocórtex Motor e Associativo (Glutamato), Rafe (5-HT).",
        outputs: "Globo Pálido Interno (GPi) / Substância Negra Reticulata (SNr) ➔ Tálamo.",
        receptors: "D1 (Via Direta), D2 (Via Indireta), 5-HT2A (freio inibitório sobre DA), Receptores Muscarínicos M1/M4.",
        clinical: "Regulação do **controle motor fino, formação de hábitos e automatismos**. O bloqueio excessivo de D2 (>80%) gera sintomas extrapiramidais (SEP, parkinsonismo, distonia); a hiperconectividade caudato-talâmica sustenta as compulsões no TOC.",
        pharma: "Antipsicóticos de 1ª e 2ª geração, Biperideno (anticolinérgico para reverter SEP), Pramipexol."
    },
    talamo: {
        name: "Núcleos Talâmicos (VA, VL, MD, LGN & TRN)",
        class: "Relé Central & Gating Sensório-Cognitivo",
        inputs: "Todos os sistemas sensoriais (exceto olfato), Gânglios da Base, Cerebelo, Tronco Encefálico.",
        outputs: "Todo o Neocórtex Cerebral (Radiações Talamocorticais).",
        receptors: "NMDA/AMPA, GABAA (no TRN), 5-HT2A, H1, Receptores Nicotínicos e Muscarínicos.",
        clinical: "Filtro mestre da consciência e relé de informação. O Núcleo Reticular do Tálamo (TRN) inibe o tálamo para permitir o sono de ondas lentas; a perda do gating talâmico na esquizofrenia sobrecarrega o córtex de ruído sensorial.",
        pharma: "Zolpidem/Zopiclona (moduladores GABAA no TRN), Gabapentinoides, Modafinil."
    },
    reuniens: {
        name: "Núcleo Reuniens do Tálamo (Linha Média)",
        class: "Conector Talâmico Pré-Frontal-Hipocampal",
        inputs: "Locus Coeruleus (A6 - via receptores α1), Córtex Pré-Frontal Medial.",
        outputs: "Hipocampo (Área CA1 e Subículo) e Córtex Pré-Frontal.",
        receptors: "α1 Adrenérgicos, NMDA/AMPA, 5-HT1A.",
        clinical: "Coordena a **recuperação de memórias contexto-dependentes e a navegação espacial** (*Cassel et al., 2013*). Permite que o córtex frontal consulte o hipocampo para saber onde um fato ocorreu.",
        pharma: "Moduladores noradrenérgicos e glutamatérgicos."
    },
    mamilar: {
        name: "Corpos Mamilares do Hipotálamo",
        class: "Hub Mnemônico do Circuito de Papez",
        inputs: "Hipocampo e Subículo via Fórnix.",
        outputs: "Núcleos Anteriores do Tálamo via Trato Mamilotalâmico (de Vicq d'Azyr).",
        receptors: "NMDA/AMPA, Histamina H1/H3, Receptores GABAérgicos.",
        clinical: "Estrutura vulnerável à deficiência de tiamina (Vitamina B1) no etilismo crônico. Sua degeneração causa a **Síndrome de Wernicke-Korsakoff** com amnésia anterógrada densa e confabulações.",
        pharma: "Tiamina intravenosa em altas doses (tratamento profilático e de resgate na encefalopatia de Wernicke)."
    },
    hipocampo: {
        name: "Hipocampo & Giro Denteado (Estrutura Arquicortical)",
        class: "Centro de Consolidação de Memória & Neuroplasticidade",
        inputs: "Córtex Entorrinal (Glutamato), Rafe Mediana (5-HT1A), LC (NE/DA via β1), Meynert (ACh via M1).",
        outputs: "Corpos Mamilares (Fórnix), Córtex Pré-Frontal, Amígdala, Hipotálamo PVN (Freio de feedback negativo).",
        receptors: "Receptores de Glicocorticoides (GR/MR), NMDA (LTP), 5-HT1A (neurogênese), TrkB (BDNF), CB1.",
        clinical: "Converte **memórias de curto prazo em longo prazo** e fornece o freio inibitório sobre o Eixo HPA. Na depressão crônica, a perda de BDNF induz atrofia hipocampal, revertida pelo uso sustentado de antidepressivos e atividade física.",
        pharma: "ISRSs/ISRNs (aumento de BDNF), Cetamina (mTORC1 sinaptogênese), Memantina (antagonista NMDA não competitivo)."
    },
    amigdala: {
        name: "Complexo Amigdaloide (Núcleos Basolateral & Central)",
        class: "Hub Límbico de Saliência & Alarme do Medo",
        inputs: "Tálamo Sensorial, Córtex Sensorial, Locus Coeruleus (NE via β1/α1), Rafe Dorsal (5-HT).",
        outputs: "Hipotálamo PVN (Disparo do Eixo HPA), Substância Cinzenta Periaquedutal (Congelamento/Freeze), Locus Coeruleus.",
        receptors: "β1, α1, 5-HT2A, 5-HT2C, GABAA (interneurônios locais), Receptores de CRF.",
        clinical: "Codifica **memórias de medo condicionado e alarme afetivo**. A hiper-reatividade da amígdala é a base biológica do TEPT, Transtorno de Pânico e Fobia Social.",
        pharma: "ISRSs (dessensibilizam receptores excitatórios amigdalares), Prazosina (bloqueador α1 para pesadelos no TEPT), Benzodiazepínicos (GABAA)."
    },
    hipotalamo: {
        name: "Núcleo Paraventricular do Hipotálamo (PVN / Eixo HPA)",
        class: "Centro Neuroendócrino e Autonômico",
        inputs: "Amígdala (excitação via estresse), Hipocampo (freio inibitório de feedback), Tronco Medular (Grupos A1/A2).",
        outputs: "Eminência Mediana (CRH) ➔ Adenoipófise (ACTH) ➔ Córtex da Adrenal (Cortisol).",
        receptors: "Receptores GR/MR de Cortisol, Receptores α1 e β Adrenérgicos, 5-HT1A/2A.",
        clinical: "Comanda a **resposta de estresse sistêmica 'luta ou fuga'**. A hipercortisolemia sustentada na depressão causa imunossupressão, resistência insulínica e neurotoxicidade.",
        pharma: "Antagonistas de CRF, Antidepressivos (resgatam a densidade de receptores GR hipocampais)."
    },
    orexina: {
        name: "Hipotálamo Lateral (Neurônios de Orexina / Hipocretina)",
        class: "Centro Peptídico Mestre de Vigília & Alimentação",
        inputs: "Glicose circulante, Leptina/Grelina, Amígdala, Córtex Pré-Frontal.",
        outputs: "Locus Coeruleus (A6), Rafe Dorsal, VTA, Tálamo, Córtex Cerebral.",
        receptors: "Receptores OX1 (seletivo para Orexina-A) e OX2 (Orexina-A e B).",
        clinical: "Mantém a **estabilidade do alerta e impede a intrusão súbita de sono REM na vigília**. A perda autoimune de 70.000 neurônios de orexina causa Narcolepsia tipo 1 com episódios de cataplexia.",
        pharma: "Antagonistas Duplos dos Receptores de Orexina (DORA: **Lemborexanto, Daridorexanto, Suvorexanto**) tratam a insônia com menos ataxia e rebote que os BZD, embora sejam substâncias controladas com potencial de abuso baixo, porém não nulo."
    },
    tmn: {
        name: "Núcleo Tuberomamilar do Hipotálamo (TMN)",
        class: "Origem Central Exclusiva da Histamina Cerebral",
        inputs: "Núcleo Pré-Óptico Ventrolateral (VLPO - inibição GABAérgica durante o sono).",
        outputs: "Todo o Neocórtex, Tálamo e Sistema Reticular Ativador Ascendente.",
        receptors: "Autorreceptores H3 pré-sinápticos; receptores pós-sinápticos H1 e H2 excitatórios.",
        clinical: "Mantém a **vigília consciente e o tônus de alerta diurno**. O bloqueio de H1 por psicofármacos é o maior responsável por sonolência diurna e aumento excessivo de apetite/ganho ponderal.",
        pharma: "Antipsicóticos sedativos (Olanzapina, Quetiapina, Clorpromazina), Antidepressivos sedativos (Mirtazapina, Amitriptilina), Pitolisanto (antagonista H3 para narcolepsia)."
    },
    hipofise: {
        name: "Hipófise (Adenoipófise & Neuroipófise)",
        class: "Glândula Mestre do Sistema Endócrino",
        inputs: "Hipotálamo Tuberoinfundibular (Dopamina via D2 para inibição de Prolactina) e Hipotálamo PVN (CRH/TRH/GnRH).",
        outputs: "Hormônios tróficos na corrente sanguínea: ACTH, TSH, LH/FSH, GH e Prolactina.",
        receptors: "D2 (lactotrofos da hipófise anterior).",
        clinical: "O bloqueio potente de D2 hipofisário por antipsicóticos típicos (Haloperidol) e alguns atípicos (Risperidona) causa **hiperprolactinemia, galactorreia, amenorreia e disfunção sexual**.",
        pharma: "Agonistas D2 (Cabergolina, Bromocriptina) ou troca para antipsicóticos poupadores de prolactina (Aripiprazol, Quetiapina)."
    },
    vta: {
        name: "Área Tegmentar Ventral (VTA - Grupo Dopaminérgico A10)",
        class: "Origem das Vias Mesolímbica e Mesocortical",
        inputs: "Habênula Lateral via freio RMTg (GABA), Córtex Pré-Frontal (Glutamato), Orexina.",
        outputs: "Núcleo Accumbens (Mesolímbica), DLPFC/vmPFC (Mesocortical), Amígdala e Hipocampo.",
        receptors: "D2 autorreceptores somatodendríticos, GABAB, Receptores Opioides Mu, Receptores Nicotínicos α4β2/α7.",
        clinical: "Origem dos **circuitos de motivação, reforço e cognição**. A desregulação da VTA está presente na dependência química, TDAH e na esquizofrenia.",
        pharma: "Nicotina, Bupropiona, Psicoestimulantes, Antipsicóticos moduladores."
    },
    snc: {
        name: "Substância Negra Pars Compacta (SNc - Grupo A9)",
        class: "Origem da Via Dopaminérgica Nigroestriatal",
        inputs: "Via Direta Estriatonigral (GABA D1), Núcleo Subtalâmico (Glutamato).",
        outputs: "Estriado Dorsal (Caudato e Putâmen).",
        receptors: "D2 autorreceptores, GABAA, NMDA.",
        clinical: "A morte de neurônios dopaminérgicos ricos em neuromelanina na SNc é a causa primordial da **Doença de Parkinson**. O bloqueio iatrogênico de D2 por antipsicóticos mimetiza esse déficit.",
        pharma: "Levodopa/Benserazida, Agonistas Dopaminérgicos (Pramipexol, Rotigotina), Inibidores da MAO-B (Selegilina, Rasagilina)."
    },
    rafe_d: {
        name: "Núcleo Dorsal da Rafe (DRN - Grupos Serotoninérgicos B6/B7)",
        class: "Origem Principal da Serotonina Forebrain",
        inputs: "Córtex Pré-Frontal (Glutamato Top-Down), Habênula Lateral via RMTg, Locus Coeruleus (Heterorreceptores α2).",
        outputs: "Neocórtex (DLPFC, Cíngulo, Occipital V1), Estriado Dorsal (Freio 5-HT2A), Amígdala e Hipotálamo.",
        receptors: "5-HT1A somatodendríticos (freio autócrino Gi/o), α2 Heterorreceptores, Receptores GABAA.",
        clinical: "Regula o **humor, tolerância à frustração, impulsividade e ansiedade**. A dessensibilização dos seus autorreceptores 5-HT1A é o mecanismo comum de todos os antidepressivos ISRS e IRSN.",
        pharma: "Fluoxetina, Sertralina, Escitalopram, Buspirona (agonista parcial 5-HT1A)."
    },
    rafe_m: {
        name: "Núcleo Mediano da Rafe (MRN - Grupo Serotoninérgico B8)",
        class: "Origem da Serotonina Límbica & Hipocampal",
        inputs: "Córtex Pré-Frontal Medial e Hipotálamo.",
        outputs: "Hipocampo (CA1-CA3, Giro Denteado) e Córtex Paripocampal.",
        receptors: "5-HT1A somatodendríticos e heterorreceptores.",
        clinical: "Especializado na **contextualização da memória, resiliência ao estresse e controle do sono de ondas lentas**.",
        pharma: "Antidepressivos serotoninérgicos e moduladores do sono."
    },
    lc: {
        name: "Locus Coeruleus (LC - Grupo Noradrenérgico A6)",
        class: "Origem de praticamente toda a noradrenalina do neocórtex, hipocampo e cerebelo",
        inputs: "Córtex Pré-Frontal (Top-Down via concha peri-coerulear), Amígdala, Orexina.",
        outputs: "DLPFC (α2A), Amígdala (β1/α1), Hipocampo (β1/DA), Núcleo Reuniens (α1), Tálamo e Córtex Occipital.",
        receptors: "α2A autorreceptores somatodendríticos, Opioides Mu, Receptores de Orexina OX1/OX2.",
        clinical: "Regulador central da **atenção focada, vigilância e resposta aguda ao pânico/estresse**. Disparos tônicos excessivos desorganizam as redes pré-frontais e ativam a amígdala no Transtorno de Pânico.",
        pharma: "Clonidina/Guanfacina (agonistas α2A), Atomoxetina, Venlafaxina/Duloxetina, Desipramina."
    },
    a1a2: {
        name: "Grupos Noradrenérgicos Medulares (A1/A2)",
        class: "Vias Noradrenérgicas Bulbares / Tronco Medular",
        inputs: "Nervo Vago (Aferências viscerais do trato solitário - NTS).",
        outputs: "Núcleo Paraventricular do Hipotálamo (PVN) e Eixo HPA.",
        receptors: "α2 Adrenérgicos, Receptores GABAérgicos.",
        clinical: "Converte o **estresse fisiológico visceral (hipotensão, hipoglicemia, inflamação sistêmica) em ativação neuroendócrina do Eixo HPA** (*Ulrich-Lai & Herman, 2009*).",
        pharma: "Moduladores autonômicos e anti-inflamatórios de ação central."
    },
    a5a7: {
        name: "Grupos Noradrenérgicos Pontinos (A5/A7)",
        class: "Origem da Via Descendente Inibitória da Dor",
        inputs: "Substância Cinzenta Periaquedutal (PAG) e Córtex Cingulado.",
        outputs: "Corno Dorsal da Medula Espinhal.",
        receptors: "α2A e α2C pré e pós-sinápticos no corno dorsal medular.",
        clinical: "Bloqueia a entrada de estímulos de dor nociceptiva e neuropática no corno dorsal da medula antes de alcançarem o córtex.",
        pharma: "Duloxetina, Venlafaxina, Amitriptilina, Clonidina peridural (analgesia por ativação α2)."
    },
    meynert: {
        name: "Núcleo Basal de Meynert (Complexo Colinérgico Ch4)",
        class: "Origem Principal da Acetilcolina Neocortical",
        inputs: "Córtex Pré-Frontal, Amígdala e Tronco Encefálico.",
        outputs: "Todo o Neocórtex, Córtex Temporal (FFA/Wernicke) e Córtex Occipital.",
        receptors: "Receptores Muscarínicos M2 autorreceptores, Receptores Nicotínicos α7.",
        clinical: "Regula o **ganho de processamento sensorial, atenção seletiva e plasticidade sináptica**. A perda desses neurônios (50-75% nos casos avançados) contribui para o déficit atencional e mnêmico, mas o declínio cognitivo na Doença de Alzheimer decorre sobretudo da patologia tau e da perda sináptica neocortical.",
        pharma: "Inibidores da Acetilcolinesterase (Donepezil, Rivastigmina, Galantamina)."
    },
    ctx_temp: {
        name: "Lobo Temporal (Wernicke, Fusiforme & Córtex Entorrinal)",
        class: "Córtex de Associação Auditiva, Semântica e Reconhecimento",
        inputs: "Núcleo Basal de Meynert (Ch4 - M1/α7), Córtex Occipital V1 (Corrente Ventral 'What'), Rafe Mediana.",
        outputs: "Hipocampo, Córtex Pré-Frontal, Amígdala.",
        receptors: "M1, α7 Nicotínico, 5-HT1A, AMPA/NMDA.",
        clinical: "Processamento da linguagem compreensiva (Área de Wernicke), reconhecimento de rostos familiares (Giro Fusiforme - FFA) e porta de entrada da memória (Córtex Entorrinal).",
        pharma: "Anticolinesterásicos e psicofármacos reguladores mnemônicos."
    },
    ctx_occ: {
        name: "Córtex Occipital Visual (Áreas V1 / V2 / V3 / V4)",
        class: "Córtex Visual Primário & Extraestriado",
        inputs: "Corpo Geniculado Lateral do Tálamo (Radiações Ópticas de Glutamato), Rafe Dorsal (5-HT), LC (NE).",
        outputs: "Corrente Ventral 'What' (para Lobo Temporal) e Corrente Dorsal 'Where' (para Lobo Parietal).",
        receptors: "Altíssima concentração de 5-HT2A nas camadas IVC/V, AMPA/NMDA, Receptores α2.",
        clinical: "Sede primária do processamento visual. O agonismo em 5-HT2A por psicodélicos gera alucinações visuais; o antagonismo por Pimavanserina e atípicos reverte alucinações na psicose de Parkinson/Lewy.",
        pharma: "Pimavanserina (agonista inverso 5-HT2A seletivo), Antipsicóticos de 2ª geração."
    },
    s1: {
        name: "Córtex Somatossensorial Primário (S1 - Áreas 3, 1, 2 de Brodmann)",
        class: "Córtex Sensorial Primário / Giro Pós-Central",
        inputs: "Tálamo Ventroposterolateral (VPL) e Ventroposteromedial (VPM) via radiação talamocortical somatossensorial.",
        outputs: "Córtex Parietal Posterior (Área 5/7), Córtex Motor Primário (M1), Córtex Insular.",
        receptors: "AMPA/NMDA, Receptores GABAA locais, Receptores α2 e 5-HT1A.",
        clinical: "Representação somatotópica do corpo (Homúnculo Sensorial de Penfield). Discrimina a localização, intensidade e qualidade da dor somática, temperatura, tato e propriocepção.",
        pharma: "Anestésicos locais, Bloqueadores de canal de sódio, Pregabalina e Gabapentina."
    },
    ctx_post: {
        name: "Córtex Associativo Parietal Posterior (Área 7 de Brodmann)",
        class: "Córtex Associativo Visuo-Espacial & Atenção",
        inputs: "Córtex Visual Occipital (Corrente Dorsal 'Where'), Córtex Somatossensorial, Tálamo Lateral Posterior.",
        outputs: "Córtex Pré-Frontal Dorsolateral (DLPFC) e Córtex Motor Suplementar.",
        receptors: "AMPA/NMDA, 5-HT2A, Receptores α2A e D1.",
        clinical: "Integração do mapa corporal e atenção espacial. Lesões causam heminegligência; alterações na esquizofrenia provocam distorções na percepção do esquema corporal.",
        pharma: "Moduladores glutamatérgicos e noradrenérgicos."
    },
    pag: {
        name: "Substância Cinzenta Periaquedutal (PAG - Mesencéfalo)",
        class: "Centro de Coordenação de Respostas de Defesa & Modulação da Dor",
        inputs: "Amígdala Central (CeA), Córtex Cingulado Anterior, Hipotálamo Lateral, Trato Espinotalâmico.",
        outputs: "Medula Ventral Rostral (RVM - analgesia descendente), Formação Reticular Pontina, Bulbo (controle cardiorrespiratório).",
        receptors: "Receptores Opioides Mu (MOR), Receptores Canabinoides CB1, GABA-A, Receptores 5-HT1A.",
        clinical: "Coordena comportamentos defensivos estereotipados: o PAG ventrolateral media o **Congelamento (*Freezing*)** e bradicardia; o PAG dorsolateral media a **Fuga/Luta explosiva**. É o principal sítio de analgesia mediada por opioides e endocanabinoides endógenos.",
        pharma: "Opioides (Morfina/Fentanil ativando vias descendentes de inibição da dor), Canabinoides e ISRSs."
    },
    medula: {
        name: "Corno Dorsal da Medula Espinhal",
        class: "Portão de Entrada da Nocicepção e Reflexos Espinhais",
        inputs: "Fibras A-delta e C de dor periférica, Vias Noradrenérgicas Descendentes A5/A7, Vias Serotoninérgicas Caudais da Rafe.",
        outputs: "Trato Espinotalâmico ➔ Tálamo VPL ➔ Córtex Somatossensorial e Ínsula.",
        receptors: "α2A e α2C pré-sinápticos (inibem liberação de Substância P e Glutamato), Receptores Opioides Mu/Delta/Kappa, 5-HT1B/1D.",
        clinical: "É o 'Portão da Dor' (*Gate Control Theory*). A potenciação noradrenérgica e serotoninérgica descendente fecha o portão medular da dor crônica e fibromialgia.",
        pharma: "Duloxetina, Venlafaxina, Pregabalina/Gabapentina, Tramadol e Opioides."
    }
};

/*
 * v12.25.0 — aparencia dos botoes de camada.
 *
 * Os 21 botoes estavam escritos a mao em ui.js, um por um. Acrescentar camada no dado e esquecer
 * o botao produz o defeito da v12.14: conteudo escrito que nada alcanca. Agora a barra e GERADA
 * a partir das camadas que existem em tractsCatalog, e este mapa so diz como cada uma aparece.
 *
 * Camada sem entrada aqui NAO fica sem botao — cai no nome e na cor da lista lateral. O padrao e
 * feio de proposito: e para dar na vista que falta caprichar, nao para esconder a via.
 */
const CIRCUIT_LAYER_UI = {
    dopamine: { rotulo: "Dopamina" },
    serotonin: { rotulo: "Serotonina" },
    norepinephrine: { rotulo: "Noradrenalina" },
    glutamate: { rotulo: "Glutamato" },
    gaba: { rotulo: "GABA" },
    cholinergic: { rotulo: "Colinérgico" },
    fear: { rotulo: "⚡ Medo", borda: "#f43f5e", cor: "#fb7185" },
    panic: { rotulo: "🚨 Pânico", borda: "#ef4444", cor: "#f87171" },
    gad: { rotulo: "⚠️ GAD/TAG", borda: "#f59e0b", cor: "#fbbf24" },
    cstc: { rotulo: "🌀 CSTC (TOC)", borda: "#ec4899", cor: "#f472b6" },
    dmn: { rotulo: "🌐 DMN", borda: "#06b6d4", cor: "#67e8f9" },
    salience: { rotulo: "🎯 Saliência", borda: "#10b981", cor: "#34d399" },
    cen: { rotulo: "🧠 CEN", borda: "#6366f1", cor: "#a5b4fc" },
    hpa: { rotulo: "🔥 Eixo HPA", borda: "#d97706", cor: "#fcd34d" },
    habenula: { rotulo: "🛑 Habênula", borda: "#8b5cf6", cor: "#c4b5fd" },
    ecb: { rotulo: "🌿 Canabinoides", borda: "#84cc16", cor: "#bef264" },
    opioid: { rotulo: "Opioides", borda: "#e11d48", cor: "#fda4af" },
    adenosine: { rotulo: "☕ Adenosina", borda: "#78716c", cor: "#d6d3d1" },
    orexin: { rotulo: "🌙 Orexina", borda: "#a855f7", cor: "#e9d5ff" },
    histamine: { rotulo: "🌾 Histamina", borda: "#0284c7", cor: "#7dd3fc" },
    papez: { rotulo: "📜 Papez", borda: "#d946ef", cor: "#f5d0fe" },
    motor: { rotulo: "🦾 Motor (Núcleos da Base)", borda: "#fb923c", cor: "#fdba74" },
    sensorial: { rotulo: "✋ Sensorial & Dor", borda: "#a3e635", cor: "#d9f99d" },
    impulsividade: { rotulo: "Impulsividade", borda: "#38bdf8", cor: "#7dd3fc" },
    compulsividade: { rotulo: "🩷 Compulsividade", borda: "#f472b6", cor: "#f9a8d4" }
};

/*
 * A lista de botoes da barra de camadas, derivada do MAPA — nao de uma lista escrita a mao.
 *
 * E funcao, e nao um trecho de template dentro do ui.js, por uma razao pratica: assim da para
 * testar a COBERTURA (toda camada do mapa vira botao) sem navegador. A primeira versao da trava
 * procurava o nome da camada como texto dentro do ui.js e ficou vermelha justamente quando o
 * codigo melhorou — casar com texto nao e casar com resultado.
 */
/*
 * O limite epistemologico de uma camada, ou null se ela nao declara nenhum.
 *
 * E funcao, e nao um `${sys.limite ? ...}` solto no ui.js, porque a trava precisa medir RESULTADO.
 * A primeira versao checava se o texto "sys.limite" aparecia no ui.js — e a mutacao que trocava a
 * condicao por `false ?` passou VERDE, porque o nome seguia no corpo do template. Quinta vez nesta
 * sessao que casar com o texto do codigo deixa o defeito passar.
 */
function limiteDaCamada(chave) {
    const c = canonicalSubTractsData[chave];
    return (c && c.limite) ? c.limite : null;
}

function camadasParaBotoes() {
    const camadas = [...new Set(tractsCatalog.map(t => t.layer))];
    return camadas.map(c => {
        const ui = CIRCUIT_LAYER_UI[c] || {};
        const lado = canonicalSubTractsData[c] || {};
        return {
            camada: c,
            rotulo: ui.rotulo || lado.name || c,
            borda: ui.borda || lado.color || '#94a3b8',
            cor: ui.cor || lado.color || '#cbd5e1'
        };
    });
}

/*
 * v12.33 — as familias do inspetor, derivadas do DADO (CIRCUIT_FAMILIES, em data.js) e filtradas pelas
 * camadas que existem. Camada sem familia cai num grupo residual, para nunca sumir do inspetor: a trava
 * proibe a orfa, mas o app nao pode depender da trava para mostrar conteudo.
 */
function familiasDeCamadas() {
    const todas = Object.keys(canonicalSubTractsData);
    const usadas = new Set();
    const lista = Object.keys(CIRCUIT_FAMILIES).map(k => {
        const camadas = CIRCUIT_FAMILIES[k].camadas.filter(c => canonicalSubTractsData[c]);
        camadas.forEach(c => usadas.add(c));
        return { chave: k, rotulo: CIRCUIT_FAMILIES[k].rotulo, camadas };
    });
    const orfas = todas.filter(c => !usadas.has(c));
    if (orfas.length) lista.push({ chave: 'outras', rotulo: '📦 Outras camadas', camadas: orfas });
    return lista;
}

// v12.33 — um lugar so decide o modo de visao a partir das camadas acesas. Antes o reducer testava
// `=== 16`, um numero que nao correspondia a nenhuma contagem real de camadas (sao 25).
function modoDeVisaoDasCamadas(acesas) {
    const total = Object.keys(canonicalSubTractsData).length;
    if (acesas.length === 0) return 'none';
    if (acesas.length === total) return 'all';
    if (acesas.length === 1) return acesas[0];
    return 'custom';
}

const canonicalSubTractsData = {
    dopamine: {
        name: "Sistema Dopaminérgico (5 Vias de Stahl)",
        items: [
            { id: "da_mesolimbic", name: "1. Mesolímbica (VTA ➔ Accumbens)", desc: "Recompensa, saliência motivacional e delírios/alucinações na psicose." },
            { id: "da_mesocortical", name: "2. Mesocortical (VTA ➔ DLPFC)", desc: "Cognição executiva, memória de trabalho e sintomas negativos." },
            { id: "da_nigrostriatal", name: "3. Nigroestriatal (SNc ➔ Estriado)", desc: "Controle motor extrapiramidal; degeneração no Parkinson e SEP por D2." },
            { id: "da_tuberoinfundibular", name: "4. Tuberoinfundibular (Hipotálamo ➔ Hipófise)", desc: "Inibição tônica da secreção de prolactina via receptores D2." },
            { id: "da_thalamic", name: "5. Talâmica (VTA ➔ Tálamo)", desc: "Sensory gating, filtragem de estímulos e modulação do arousal." }
        ]
    },
    serotonin: {
        name: "Sistema Serotoninérgico (7 Projeções da Rafe)",
        items: [
            { id: "5ht_pfc", name: "1. Rafe Dorsal ➔ DLPFC (5-HT1A/2A)", desc: "Afeto, flexibilidade cognitiva, ideação suicida e impulsividade." },
            { id: "5ht_amygdala", name: "2. Rafe Dorsal ➔ Amígdala (5-HT2A/2C)", desc: "Processamento emocional, pânico e limiar de ansiedade." },
            { id: "5ht_hippo", name: "3. Rafe Mediana ➔ Hipocampo (5-HT1A)", desc: "Memória, neurogênese e resiliência ao estresse." },
            { id: "5ht_striatum", name: "4. Rafe Dorsal ➔ Estriado (5-HT2A)", desc: "Freio sobre hábitos motores e circuitos repetitivos do TOC." },
            { id: "5ht_hypothalamus", name: "5. Rafe Dorsal ➔ Hipotálamo (5-HT2C)", desc: "Regulação do apetite, saciedade, temperatura e sono." },
            { id: "5ht_occ", name: "6. Rafe Dorsal ➔ Occipital V1 (5-HT2A)", desc: "Percepção visual; alvo da ação alucinógena dos psicodélicos." },
            { id: "5ht_parietal", name: "7. Rafe Dorsal ➔ Parietal Posterior", desc: "Integração do esquema corporal e despersonalização." }
        ]
    },
    norepinephrine: {
        name: "Sistema Noradrenérgico (LC & Grupos A1-A7)",
        items: [
            { id: "ne_pfc", name: "1. LC ➔ DLPFC (Alfa-2A)", desc: "Atenção sustentada, foco executivo e memória de trabalho." },
            { id: "ne_amygdala", name: "2. LC ➔ Amígdala (Beta-1/Alfa-1)", desc: "Memórias traumáticas e hipervigilância no TEPT." },
            { id: "ne_hippo", name: "3. LC ➔ Hipocampo (Beta-1)", desc: "Recuperação mnemônica e alerta sob estresse." },
            { id: "ne_parietal", name: "4. LC ➔ Parietal (Alfa-1)", desc: "Atenção visuoespacial e orientação postural." },
            { id: "ne_reuniens", name: "5. LC ➔ Núcleo Reuniens do Tálamo", desc: "Coordenação córtico-hipocampal e gating atencional." },
            { id: "ne_a1a2_pvn", name: "6. Grupo A1/A2 ➔ Hipotálamo PVN", desc: "Ativação autonômica simpática e disparo do eixo HHA." },
            { id: "ne_a5a7_cord", name: "7. Grupo A5/A7 ➔ Medula Espinhal", desc: "Modulação descendente da dor e tônus simpático." }
        ]
    },
    fear: {
        name: "1. Circuito do Medo & Extinção (LeDoux / Tovote 2015)",
        color: "#ef4444",
        items: [
            { id: "fear_low_road", name: "1.1 Low Road (Tálamo ➔ BLA)", desc: "Reconhecimento subcortical ultrarrápido de perigo iminente." },
            { id: "fear_high_road", name: "1.2 High Road (Córtex Sensorial ➔ BLA)", desc: "Avaliação cognitiva contextual detalhada." },
            { id: "fear_freezing", name: "1.3 Freezing (CeA ➔ vlPAG)", desc: "Congelamento comportamental e imobilidade atenta." },
            { id: "fear_flight", name: "1.4 Fuga / Luta (CeA ➔ dPAG)", desc: "Escape motor ativo e taquicardia." },
            { id: "fear_extinction", name: "1.5 Freio vmPFC (vmPFC ➔ ITC ➔ CeA)", desc: "Inibição ativa do alarme da amígdala (Base da TCC)." }
        ]
    },
    panic: {
        name: "⚡ 2. Circuito do Pânico & Alarme de Sufocação (Stahl / Klein)",
        color: "#f97316",
        items: [
            { id: "panic_cea_lc", name: "2.1 Descarga Noradrenérgica (CeA ➔ Locus Coeruleus)", desc: "Surto adrenérgico maciço, pavor agudo e hipervigilância." },
            { id: "panic_cea_hypothalamus", name: "2.2 Eixo HPA Agudo (CeA ➔ Hipotálamo PVN)", desc: "Disparo neuroendócrino imediato de CRF e Cortisol." },
            { id: "panic_nts_parabrachial", name: "2.3 Alarme de Sufocação CO2 (Bulbo NTS ➔ Amígdala)", desc: "Hipersensibilidade a CO2 e sensação de asfixia iminente." },
            { id: "panic_insula_amygdala", name: "2.4 Interocepção Catastrófica (Ínsula ➔ Amígdala)", desc: "Interpretação distorcida e catastrófica de taquicardia." }
        ]
    },
    gad: {
        name: "🌀 3. Circuito da Ansiedade Generalizada / TAG (Stahl CSTC)",
        color: "#06b6d4",
        items: [
            { id: "gad_cstc_worry", name: "3.1 Alça de Preocupação CSTC (DLPFC ➔ Caudato ➔ Tálamo ➔ DLPFC)", desc: "Loop reverberante de ruminação e preocupação contínua." },
            { id: "gad_bnst_amygdala", name: "3.2 Ansiedade Sustentada (BNST ➔ Amígdala/Hipotálamo)", desc: "Tensão crônica antecipatória da Extended Amygdala." },
            { id: "gad_thalamo_s1", name: "3.3 Tensão Muscular (Tálamo ➔ Córtex Somatossensorial S1)", desc: "Rigidez corporal, cefaleia tensional e inquietação." },
            { id: "gad_raphe_pfc", name: "3.4 Modulação Serotoninérgica (Rafe ➔ DLPFC)", desc: "Freio inibitório 5-HT1A sobre o córtex pré-frontal." }
        ]
    },
    glutamate: {
        name: "Sistema Glutamatérgico (5 Vias Descendentes & Vias Hipocampais)",
        items: [
            { id: "glu_cortico_vta", name: "1.1 mPFC ➔ VTA (controle do disparo dopaminérgico)", desc: "Modulação piramidal descendente sobre a dopamina." },
            { id: "glu_cortico_raphe", name: "1.2 mPFC ➔ Rafe Dorsal (aferente glutamatérgico principal)", desc: "Controle pré-frontal descendente sobre a serotonina." },
            { id: "glu_cortico_lc", name: "1.3 mPFC ➔ LC / A6 (glutamatérgica direta — NMDA + AMPA)", desc: "Ajuste do tônus noradrenérgico e do alerta; há também rota indireta pelo paragigantocelular." },
            { id: "glu_cortico_striatal", name: "1.4 Córtico-Estriatal (PFC ➔ Estriado)", desc: "Iniciação motora, hábitos e alças CSTC." },
            { id: "glu_corticocortical_dir", name: "1.5 Córtico-Cortical Direta (PFC ➔ Parietal)", desc: "Integração cognitiva inter-hemisférica." },
            { id: "glu_corticothalamic", name: "1.6 Córtico-Talâmica (PFC ➔ Tálamo)", desc: "Sensory Gating e filtragem de estímulos." },
            { id: "glu_thalamocortical", name: "1.7 Tálamo-Cortical (Tálamo ➔ Córtex)", desc: "Arousal, vigília e reverberação talamocortical." },
            { id: "glu_perforant_path", name: "2.1 Trato Perfurante (Córtex Entorrinal camada II ➔ Giro Denteado)", desc: "Porta de entrada mnemônica; camadas II/III entorrinais são as primeiras a degenerar no Alzheimer." },
            { id: "glu_vhipp_mpfc", name: "2.2 Hipocampo Ventral ➔ mPFC (vCA1/Subículo)", desc: "Projeção glutamatérgica monossináptica; contexto hipocampal regulando o pré-frontal." }
        ]
    },
    gaba: {
        name: "Sistema GABAérgico & Microcircuitos Inibitórios",
        items: [
            { id: "gaba_pv_gamma", name: "1. Interneurônios PV+ (Oscilações Gama 40 Hz)", desc: "Inibição perissomática geradora de sincronia cortical." },
            { id: "gaba_sst_dendritic", name: "2. Interneurônios SST+ (Inibição Dendrítica)", desc: "Filtragem de inputs excitatórios distais." },
            { id: "gaba_striato_pallidal", name: "3. Vias Estriato-Palidais Direta/Indireta", desc: "Seleção motora e freio dos gânglios da base." }
        ]
    },
    cholinergic: {
        name: "Sistema Colinérgico (Meynert Ch4 & Septo)",
        color: "#0284c7",
        items: [
            { id: "ach_meynert_pfc", name: "1. Meynert Ch4 ➔ Neocórtex", desc: "Atenção sustentada, plasticidade e decodificação." },
            { id: "ach_septo_hippo", name: "2. Septohipocampal (Ch1/Ch2 ➔ Hipocampo)", desc: "Ritmo Teta (4-8 Hz) e consolidação da memória." }
        ]
    },
    habenula: {
        name: "Circuito da Habênula Lateral & RMTg (Anti-Reward)",
        color: "#7c3aed",
        items: [
            { id: "lhb_rmtg", name: "1. Habênula Lateral ➔ RMTg (GABA)", desc: "Detecção de ausência de recompensa e frustração." },
            { id: "rmtg_vta_brake", name: "2. RMTg ➔ VTA (Freio da Recompensa)", desc: "Silenciamento de recompensa na depressão." },
            { id: "rmtg_rafe_brake", name: "3. RMTg ➔ Rafe (Freio da Serotonina)", desc: "Desamparo aprendido e anedonia profunda." }
        ]
    },
    hpa: {
        name: "Eixo Neuroendócrino HHA (Estresse & Cortisol)",
        color: "#dc2626",
        items: [
            { id: "hpa_pvn_pituitary", name: "1. Hipotálamo PVN ➔ Adeno-hipófise", desc: "Disparo de CRF e secreção de ACTH." },
            { id: "hpa_hippo_brake", name: "2. Freio Hipocampal (GR/MR ➔ PVN)", desc: "Feedback negativo inibitório sobre o estresse." }
        ]
    },
    cstc: {
        limite: "As alças são paralelas, não isoladas: Kitano e col. sustentam a organização paralela e concluem que a interação entre as alças não pode ser ignorada. Nenhuma região, isoladamente, corresponde a vontade, impulso ou compulsão.",
        name: "🔄 Os 3 Loops CSTC (Alexander & Crutcher)",
        color: "#f59e0b",
        items: [
            { id: "cstc_motora_in", name: "Motora 1: SMA ➔ Putâmen", desc: "Entrada cortical da alça motora. Antes o traço saía do S1 (somatossensorial) com rótulo dizendo SMA." },
            { id: "cstc_saida_dorsal", name: "2: Estriado dorsal ➔ Tálamo (saída comum)", desc: "GABAérgica. No mapa detalhado passa por GPe/GPi/STN — veja a camada Motor." },
            { id: "cstc_motora_out", name: "Motora 3: Tálamo ➔ SMA (fecha)", desc: "O retorno que faltava: sem ele a alça não era alça." },
            { id: "cstc_executiva_in", name: "Executiva 1: DLPFC ➔ Caudado", desc: "Entrada da alça associativa/executiva." },
            { id: "cstc_executiva_out", name: "Executiva 3: Tálamo ➔ DLPFC (fecha)", desc: "Fecha a alça executiva." },
            { id: "cstc_afetiva_in", name: "Afetiva 1: vmPFC/CCA ➔ Accumbens", desc: "Entrada da alça límbica." },
            { id: "cstc_saida_ventral", name: "Afetiva 2: Accumbens ➔ Tálamo", desc: "Saída ventral." },
            { id: "cstc_afetiva_out", name: "Afetiva 3: Tálamo ➔ vmPFC/CCA (fecha)", desc: "Fecha a alça afetiva." }
        ]
    },
    dmn: {
        name: "🌐 Rede em Modo Padrão (DMN)",
        color: "#ec4899",
        items: [
            { id: "dmn_precuneus_vmpfc", name: "1. Precúneo/PCC ➔ vmPFC", desc: "Pensamento autorreferencial e ruminação." },
            { id: "dmn_vmpfc_hippo", name: "2. vmPFC ➔ Hipocampo", desc: "Memória autobiográfica e projeção do futuro." }
        ]
    },
    cen: {
        name: "🌐 Rede Executiva Central (CEN)",
        color: "#06b6d4",
        items: [
            { id: "cen_pfc_parietal", name: "1. DLPFC ➔ Parietal Posterior", desc: "Atenção focada em objetivos externos." },
            { id: "cen_parietal_pfc", name: "2. Parietal ➔ DLPFC", desc: "Feedback atencional e controle executivo." }
        ]
    },
    salience: {
        name: "🌐 Rede de Saliência & Ínsula Anterior",
        color: "#14b8a6",
        items: [
            { id: "salience_insula_pfc", name: "1. Ínsula Anterior ➔ dACC/DLPFC", desc: "Comutador dinâmico entre DMN e CEN." },
            { id: "salience_insula_amygdala", name: "2. Ínsula ➔ Amígdala", desc: "Processamento interoceptivo visceral." }
        ]
    },
    orexin: {
        name: "Sistema Orexinérgico (Hipotálamo Lateral)",
        color: "#ea580c",
        items: [
            { id: "orexin_pfc", name: "1. Hipotálamo Lateral ➔ Córtex", desc: "Manutenção do tônus de vigília estável." },
            { id: "orexin_lc", name: "2. Hipotálamo Lateral ➔ Locus Coeruleus", desc: "Estabilização do Flip-Flop Switch do sono." }
        ]
    },
    histamine: {
        name: "Sistema Histaminérgico (TMN Hipotalâmico)",
        color: "#b45309",
        items: [
            { id: "histamine_pfc", name: "1. TMN ➔ Córtex Cerebral (H1)", desc: "Alerta e vigilância; alvo sedativo de anti-histamínicos." },
            { id: "histamine_talamo", name: "2. TMN ➔ Tálamo (H1)", desc: "Gating talamocortical do despertar." }
        ]
    },
    ecb: {
        name: "Sistema Endocanabinoide Retrógrado (AEA / 2-AG)",
        color: "#16a34a",
        items: [
            { id: "ecb_hippo_amygdala", name: "1. Retro-sinalização Hipocampo ➔ Amígdala", desc: "Extinção de memórias aversivas e DSI/DSE." },
            { id: "ecb_pfc_vta", name: "2. Retro-sinalização PFC ➔ VTA", desc: "Modulação retrógrada da liberação de dopamina." }
        ]
    },
    opioid: {
        name: "Sistema Opioide Endógeno (Mu / PAG)",
        color: "#9333ea",
        items: [
            { id: "opioid_pag_medulla", name: "1. Amígdala ➔ PAG ➔ Medula Espinhal", desc: "Analgesia descendente e bloqueio nociceptivo." },
            { id: "opioid_vta_accumbens", name: "2. VTA ➔ Accumbens (Receptores Mu)", desc: "Valência hedônica de alívio e 'liking'." }
        ]
    },
    adenosine: {
        name: "Sistema Purinérgico & Adenosina (A1/A2A)",
        color: "#64748b",
        items: [
            { id: "adenosine_corticostriatal", name: "1. Acúmulo Extracelular ➔ Córtex & Estriado", desc: "Pressão homeostática de sono; bloqueada por cafeína." }
        ]
    },
    papez: {
        name: "🔄 Circuito Mnemônico de Papez",
        color: "#d97706",
        items: [
            { id: "papez_hippo_fornix", name: "1. Hipocampo ➔ Fórnix ➔ Corpos Mamilares", desc: "Condução inicial do circuito de memória episódica." },
            { id: "papez_mamilo_thalamic", name: "2. Mamilo-Talâmica ➔ Tálamo", desc: "Consolidação e reverberação mnemônica." }
        ]
    },
    motor: {
        name: "Circuito Motor (Alça dos Núcleos da Base)",
        color: "#fb923c",
        items: [
            { id: "motor_cortico_striatal", name: "1. M1 ➔ Estriado (entrada da alça)", desc: "Aferente cortical glutamatérgico; facilita a via direta e inibe a indireta." },
            { id: "motor_direta_gpi", name: "2. Via DIRETA (D1): Estriado ➔ GPi/SNr", desc: "GABAérgica. Reduz o freio do GPi sobre o tálamo — facilita o movimento." },
            { id: "motor_indireta_gpe", name: "3. Via INDIRETA (D2): Estriado ➔ GPe", desc: "GABAérgica. Primeiro elo do ramo que acaba aumentando o freio." },
            { id: "motor_gpe_stn", name: "4. GPe ➔ STN", desc: "GABAérgica. Tira o freio do subtalâmico." },
            { id: "motor_stn_gpi", name: "5. STN ➔ GPi (único excitatório da alça)", desc: "Glutamatérgica. Aumenta a saída inibitória do GPi." },
            { id: "motor_gpi_talamo", name: "6. Saída: GPi/SNr ➔ Tálamo", desc: "GABAérgica e tônica. É o freio que a via direta alivia e a indireta reforça." },
            { id: "motor_talamo_m1", name: "7. Tálamo motor ➔ M1 (fecha a alça)", desc: "Glutamatérgica. A nigroestriatal (SNc ➔ Estriado) está na camada dopaminérgica." }
        ]
    },
    sensorial: {
        name: "Circuito Sensorial (Dor & Somatossensorial)",
        color: "#a3e635",
        items: [
            { id: "sens_espinotalamico", name: "1. Espinotalâmico: Corno Dorsal ➔ Tálamo", desc: "Via ascendente da dor e da temperatura." },
            { id: "sens_talamo_s1", name: "2. Tálamo ➔ S1", desc: "Relé talamocortical somatossensorial." },
            { id: "sens_desc_pag_rvm", name: "3. Descendente: PAG ➔ RVM", desc: "Início do controle descendente; alvo dos opioides." },
            { id: "sens_desc_rvm_medula", name: "4. RVM ➔ Corno Dorsal (células ON/OFF)", desc: "Células OFF suprimem e ON facilitam a nocicepção — a mesma via alivia ou piora." }
        ]
    },
    impulsividade: {
        name: "Impulsividade (alça ventral)",
        color: "#38bdf8",
        limite: "Modelo de alça, não localização: a impulsividade não mora no estriado ventral. O freio top-down e a atividade ventral são descrições de rede — correlato neural não equivale a causa única, e alteração de rede não estabelece diagnóstico.",
        items: [
            { id: "imp_freio_topdown", name: "Freio top-down: PFC ➔ Estriado ventral", desc: "Se este controle é inadequado ou superado pela atividade ventral, aparece o comportamento impulsivo." },
            { id: "imp_ventral_talamo", name: "Ventral 1: Estriado ventral ➔ Tálamo", desc: "Perna ascendente da alça de recompensa." },
            { id: "imp_talamo_vmpfc", name: "Ventral 2: Tálamo ➔ vmPFC/CCA (fecha)", desc: "Fecha a alça no córtex ventromedial e cingulado anterior." }
        ]
    },
    compulsividade: {
        name: "🩷 Compulsividade (alça dorsal do hábito)",
        color: "#f472b6",
        limite: "Impulsividade e compulsividade não são etapas obrigatórias de uma sequência: podem coexistir, dissociar-se e envolver mecanismos diferentes. Hábito e compulsividade não explicam todas as dependências.",
        items: [
            { id: "comp_habito_topdown", name: "Controle top-down: COF ➔ Estriado dorsal", desc: "A alça do hábito, modulada pelo orbitofrontal." },
            { id: "comp_dorsal_talamo", name: "Dorsal 1: Estriado dorsal ➔ Tálamo", desc: "Perna ascendente do hábito." },
            { id: "comp_talamo_ofc", name: "Dorsal 2: Tálamo ➔ COF (fecha o hábito)", desc: "Quando o comportamento se torna compulsivo, a recompensa deixa de importar e o estímulo passa a impulsionar." }
        ]
    }
};

// v12.55 — a cor da camada e a do catalogo vem da PALETA CENTRAL (CORES_DOS_SISTEMAS, em data.js). Antes cada
// tabela escrevia a sua: a acetilcolina era laranja aqui e azul no catalogo, o opioide tinha tres tons diferentes.
// O tom claro do traco fino e a mesma cor lavada com branco — um numero, nao uma segunda escolha.
for (const [camada, sistema] of Object.entries(CAMADA_DO_SISTEMA)) {
    const cor = CORES_DOS_SISTEMAS[sistema];
    if (!cor) continue;
    if (CIRCUIT_LAYER_UI[camada]) { CIRCUIT_LAYER_UI[camada].borda = cor; CIRCUIT_LAYER_UI[camada].cor = clarearCor(cor, 0.3); }
    if (canonicalSubTractsData[camada]) canonicalSubTractsData[camada].color = cor;
}

/*
 * v12.56 — O FILTRO DE SUB-VIAS E' DA CAMADA, NAO DO CONECTOMA INTEIRO.
 *
 * `activeSubTracts` e' uma lista achatada de sub-vias, e o desenho aplicava "se a lista nao esta vazia, so desenha o
 * que esta nela" a TODAS as camadas. Quem escolhesse sub-vias dentro de um sistema calava todos os outros: acender
 * Dopamina depois disso nao mostrava nada. Como o campo e' persistido, o silencio atravessava recargas — foi o
 * "as vias eu clico e nao estao aparecendo, a unica que aparece e do glutamato" que o autor relatou em 04/09/2026.
 *
 * A regra certa e' local: a lista so restringe as camadas que ela MENCIONA. Camada sem nenhuma sub-via na lista
 * mostra todas as suas — que e' o que o acordeao da a entender quando filtra "dentro" de um sistema.
 */
function camadaFiltrada(subList, camada) {
    if (!subList || !subList.length) return false;
    const itens = ((canonicalSubTractsData[camada] || {}).items) || [];
    return itens.some(it => subList.includes(it.id));
}
function viaVisivel(subList, camada, subId) {
    return !camadaFiltrada(subList, camada) || subList.includes(subId);
}

const pathologyProfilesData = {
    none: {
        vias: {},
        short: "Fisiologia Normal",
        name: "Fisiologia Normal & Homeostase",
        circuitStatus: "Todos os 13 circuitos em equilíbrio sináptico basal.",
        fisiopatologia: "Balanço excitatório/inibitório (E/I) preservado, tônus monoaminérgico fisiológico e feedback do Eixo HPA competente.",
        bioquimica: "Disparos fásicos e tônicos adequados, sem hiperativação de freios anti-recompensa ou hiper-ressonância em loops.",
        terapeutica: "Manutenção da saúde cerebral e reserva cognitiva."
    },
    schizophrenia: {
        // v12.57 (D12): o diagnostico virou COMPOSICAO. O mapa `vias` deste perfil nao esta escrito aqui — e' derivado
        // da uniao das dimensoes logo abaixo de DIMENSOES_DE_SINTOMA. Uma verdade so, e a trava 2 de dimensoes.test.ts
        // reprova qualquer contradicao hiper/hipo entre elas.
        dimensoes: ['positivos', 'negativos'],
        short: "⚡ Esquizofrenia",
        camadas: ['dopamine', 'glutamate', 'gaba'], tom: [440, 'sawtooth', 0.22, 0.25],   // v12.35: era `if` no reducer
        name: "⚡ Esquizofrenia (Hipótese Integrada DA-Glu-GABA)",
        circuitStatus: "🔴 Hiperatividade Mesolímbica (VTA ➔ Accumbens) + 🔵 Hipoatividade Mesocortical (VTA ➔ DLPFC) + 🟡 Hipofunção NMDA/PV-GABA.",
        fisiopatologia: "• <b>Sintomas Positivos:</b> Hiperativação de neurônios de dopamina na via mesolímbica estimulando receptores D2 no Accumbens (delírios e alucinações auditivas).<br>• <b>Sintomas Negativos & Cognitivos:</b> Hipoestimulação D1 no DLPFC e hipofunção de receptores NMDA em interneurônios PV-GABA, destruindo as oscilações Gamma de 40 Hz necessárias para memória de trabalho.",
        bioquimica: "Desconexão cortico-subcortical e falha no gating sensorial talâmico: o freio córtico-talâmico cai e o fluxo tálamo-cortical sobe, levando ao córtex sinal que deveria ter sido barrado. A hipofunção NMDA no interneurônio PV <b>desinibe</b> o piramidal — o glutamato cortical aumenta em volume enquanto <i>perde</i> relação sinal-ruído, e é por isso que \"sobe ou desce\" é a pergunta errada. A montante, a hiperatividade do hipocampo ventral eleva a atividade populacional dos neurônios dopaminérgicos do VTA, e a perda do controle glutamatérgico mPFC ➔ VTA deixa esse disparo sem freio.",
        terapeutica: "<b>Antipsicóticos de 2ª Geração</b> (Risperidona, Olanzapina, Aripiprazol) bloqueando D2 mesolímbico e 5-HT2A; <b>Clozapina reservada à refratariedade</b> (falha de ≥2 antipsicóticos em dose e tempo adequados)."
    },
    depression_melancholic: {
        // v12.60 (D12): tres dimensoes, e o mapa de vias e' a soma delas (derivado abaixo de DIMENSOES_DE_SINTOMA).
        // As sete vias sao exatamente as que o perfil ja desenhava — a figura nao mudou, a origem sim.
        dimensoes: ['anedonia', 'humor_deprimido', 'eixo_do_estresse'],
        short: "🌧️ Depressão Maior",
        camadas: ['serotonin', 'habenula', 'hpa', 'dopamine'], tom: [330, 'sine', 0.25, 0.30],
        name: "🖤 Depressão Maior Melancólica com Anedonia",
        circuitStatus: "🦚 Hiperativação da Habênula Lateral (LHb) + 🔴 Silenciamento VTA/Rafe pelo Freio RMTg + 🫀 Hiperativação Eixo HPA.",
        fisiopatologia: "• <b>Anedonia & Desespero:</b> A Habênula Lateral dispara em rajada (*bursting* contínuo), recrutando o freio GABAérgico do RMTg que desliga a liberação de Dopamina e Serotonina.<br>• <b>Neurotoxicidade por Cortisol:</b> O excesso sustentado de glicocorticoides causa atrofia das espinhas dendríticas hipocampais (queda de BDNF) e destrói o freio sobre o PVN.",
        bioquimica: "Queda global de monoaminas, esgotamento de BDNF/TrkB e bloqueio da neurogênese hipocampal.",
        terapeutica: "<b>ISRSs / IRSNs</b> (dessensibilização 5-HT1A), <b>Cetamina / Esquetamina</b> (silencia a LHb via bloqueio NMDA e ativa mTORC1 em minutos) e <b>EMT 10 Hz no DLPFC</b>."
    },
    bipolar_mania: {
        vias: {
            da_mesolimbic: 'hiper', da_mesocortical: 'hiper', cstc_afetiva_in: 'hiper',
            cstc_saida_ventral: 'hiper', cstc_afetiva_out: 'hiper', fear_extinction: 'hipo'
        },
        short: "🔥 Mania Bipolar",
        camadas: ['dopamine', 'cstc', 'salience', 'fear'], tom: [580, 'triangle', 0.22, 0.25],   // v12.41 (D11, autor, 03/09/2026): 'fear' entra — fear_extinction desviava em camada apagada
        name: "🔥 Transtorno Bipolar - Mania Aguda",
        circuitStatus: "🟣 Hiperatividade Dopaminérgica Mesolímbica/Mesocortical + 🔄 Aceleração do Loop Afetivo CSTC + ⚡ Hiperativação PKC.",
        fisiopatologia: "• <b>Grandiosidade, Fuga de Ideias & Insônia:</b> Hiperativação difusa dos circuitos de dopamina e noradrenalina, com perda do freio inibitório pré-frontal ventromedial sobre a amígdala.<br>• <b>Instabilidade de Membrana:</b> Influxo excessivo de Cálcio via canais Cav1.2, ativando a cascata intracelular da Proteína Quinase C (PKC) e GSK-3β.",
        bioquimica: "Hiperestimulação Gs/Golf e desregulação mitocondrial com estresse oxidativo neuronal.",
        terapeutica: "<b>Lítio</b> (inibe GSK-3β e depleta inositol), <b>Valproato de Sódio</b> (inibe PKC e eleva GABA — <b>contraindicado em mulheres com potencial reprodutivo</b> sem programa de prevenção de gravidez) e <b>Antipsicóticos Antimaniacos</b> (bloqueio rápido de D2)."
    },
    panic_disorder: {
        vias: {
            ne_amygdala: 'hiper', panic_cea_lc: 'hiper', panic_cea_hypothalamus: 'hiper',
            panic_insula_amygdala: 'hiper', salience_insula_pfc: 'hiper'
        },
        short: "⚠️ Ansiedade & Pânico",
        camadas: ['norepinephrine', 'salience', 'hpa', 'panic'], tom: [620, 'sawtooth', 0.22, 0.25],   // v12.41 (D11, autor, 03/09/2026): 'panic' entra — tres vias panic_* desviavam em camada apagada
        name: "🚨 Transtorno de Pânico & Ansiedade Aguda",
        circuitStatus: "🔵 Hiperativação em Salva do Locus Coeruleus (A6) + 🎯 Hiperconectividade da Ínsula + 🔴 Alarme Amigdalar.",
        fisiopatologia: "• <b>Ataques de Pânico & Sensação de Morte:</b> O Locus Coeruleus descarrega noradrenalina maciça na Amígdala (receptores β1 e α1) e no Hipotálamo PVN, disparando taquicardia, sudorese e dispneia.<br>• <b>Hiper-Reatividade Interoceptiva:</b> A Ínsula Anterior amplifica os sinais viscerais e o córtex pré-frontal os interpreta como catástrofe iminente.",
        bioquimica: "Esgotamento da inibição GABAérgica amigdalar e falha de autorreceptores inibitórios α2.",
        terapeutica: "<b>ISRSs iniciados em dose baixa e titulados lentamente</b> (Sertralina 25mg, Fluoxetina 10mg — 'start low, go slow' evita a piora ansiosa inicial), <b>Benzodiazepínicos por tempo limitado</b> (modulação alostérica positiva GABAA) e <b>TCC</b>. Beta-bloqueadores (Propranolol) ajudam apenas na ansiedade de desempenho, sem eficácia no Transtorno de Pânico."
    },
    ptsd: {
        vias: {
            fear_extinction: 'hipo', fear_freezing: 'hiper', panic_cea_hypothalamus: 'hiper',
            ne_amygdala: 'hiper', ecb_hippo_amygdala: 'hipo'
        },
        short: "🛡️ TEPT",
        camadas: ['fear', 'panic', 'norepinephrine', 'ecb'], tom: [400, 'sine', 0.12, 0.10],   // v12.35: as camadas das proprias vias desviadas; nao tinha ramo (caia no panorama basal); sem `sistema`, como antes
        name: "🛡️ TEPT (Falha de Extinção & Hiper-Reatividade Amígdala/PAG)",
        circuitStatus: "🔴 Hiperatividade Amígdala ➔ PAG/Hipotálamo + 🟢 Falha do Freio de Extinção vmPFC ➔ ITC + 🔵 Descarga LC.",
        fisiopatologia: "• <b>Flashbacks & Hipervigilância:</b> O vmPFC perde a capacidade de ativar os neurônios GABAérgicos intercalados (ITC) da amígdala. Sem esse freio, memórias traumáticas hipocampais disparam diretamente a Amígdala Central (CeA), acionando o congelamento no PAG e taquicardia hipotalâmica.<br>• <b>Pesadelos & Sobressalto:</b> O Locus Coeruleus descarrega noradrenalina em excesso em receptores α1 centrais.",
        bioquimica: "Tônus noradrenérgico hiperativo e falha da plasticidade dependente de NMDA/endocanabinoides (CB1) para extinção.",
        terapeutica: "<b>Prazosina</b> (antagonista α1 para pesadelos — evidência conflitante após o ensaio negativo do VA, 2018), <b>ISRSs</b> (Sertralina/Paroxetina aprovados), <b>TCC com Exposição Prolongada</b> (reativação do freio vmPFC ➔ ITC) e <b>Canabidiol / Moduladores CB1</b> em investigação."
    },
    adhd: {
        vias: {
            ne_pfc: 'hipo', da_mesocortical: 'hipo'
        },
        short: "🎯 TDAH",
        camadas: ['norepinephrine', 'dopamine', 'cstc'], tom: [480, 'sine', 0.18, 0.20],
        name: "🎯 TDAH (Desregulação Catecolaminérgica Pré-Frontal)",
        circuitStatus: "🔵 Déficit de Noradrenalina LC ➔ DLPFC + 🟣 Déficit de Dopamina VTA ➔ DLPFC (Curva Yerkes-Dodson).",
        fisiopatologia: "• <b>Desatenção & Distraibilidade:</b> No DLPFC, a falta de Noradrenalina deixa os canais de potássio HCN abertos nas espinhas dendríticas, causando 'vazamento' de corrente elétrica e ruído mental.<br>• <b>Impulsividade & Desmotivação:</b> A falta de Dopamina em receptores D1 enfraquece a sustentação do sinal de foco e recompensa atrasada.",
        bioquimica: "Transmissão tônica subótima de catecolaminas no córtex pré-frontal.",
        terapeutica: "<b>Psicoestimulantes</b> (Metilfenidato, Lisdexanfetamina bloqueando DAT/NET) e <b>Guanfacina</b> (agonista α2A que fecha canais HCN e blinda o sinal de foco no DLPFC)."
    },
    ocd: {
        vias: {
            cstc_executiva_in: 'hiper', cstc_executiva_out: 'hiper', cstc_motora_in: 'hiper',
            cstc_motora_out: 'hiper', cstc_saida_dorsal: 'hiper', '5ht_striatum': 'hipo',
            glu_cortico_striatal: 'hiper'
        },
        short: "🧩 TOC",
        camadas: ['cstc', 'serotonin', 'glutamate'], tom: [520, 'triangle', 0.20, 0.22],
        name: "🧩 Transtorno Obsessivo-Compulsivo (TOC)",
        circuitStatus: "🔄 Hiper-Ressonância em Loop Fechado do Circuito Cortico-Estriato-Talamo-Cortical (CSTC).",
        fisiopatologia: "• <b>Obsessões & Rituais Compulsivos:</b> Hiperconectividade excitatória contínua entre Córtex Orbitofrontal (OFC), Córtex Cingulado Anterior (ACC), Cabeça do Caudato e Tálamo.<br>• <b>Falha do Freio Serotoninérgico:</b> Perda do controle inibitório da Rafe Dorsal sobre o estriado dorsal, travando o cérebro na sensação de que 'algo está incompleto ou perigoso'.",
        bioquimica: "Excesso de sinalização glutamatérgica corticoestriatal e dessensibilização heterogênea de 5-HT1B/1D.",
        terapeutica: "<b>ISRSs em Doses Altas</b> (Fluoxetina até 80mg, Sertralina até 200mg, Escitalopram até 20mg — dose máxima de bula), <b>Clomipramina</b>, <b>EMT profunda 20 Hz em mPFC/ACC</b> (protocolo aprovado pelo FDA para TOC) ou <b>DBS no ALIC</b>."
    }
};

/*
 * v12.28.0 -- desvioDaVia(perfil, subId): o desvio patologico de UMA via, como dado.
 *
 * Medido na v12.20, com a comparacao lado a lado ligada e Esquizofrenia ativa: fora da faixa de
 * legenda, apenas 0,03% do desenho diferia entre o painel sadio e o patologico. A causa estava no
 * codigo: `activePathologyProfile` mudava so o `stimSpeedMult` e a linha de texto do rodape. Nao
 * mudava espessura, opacidade nem quais vias apareciam -- e, sendo a diferenca apenas temporal,
 * sumia por completo num print de slide.
 *
 * O conteudo ja existia em prosa: o `circuitStatus` de cada perfil nomeia exatamente o que muda.
 * O mapa `vias` acima apenas ESTRUTURA essa frase; nenhuma afirmacao clinica nova entra aqui, e a
 * trava `o mapa nao contradiz o que o proprio perfil afirma por escrito` confere os dois lados.
 *
 * Funcao, e nao um `perfil.vias[subId]` solto no meio do desenho, porque as travas desta sessao ja
 * passaram verdes CINCO vezes casando com o texto do codigo em vez de medir o valor que chega.
 */
function desvioDaVia(perfil, subId, dimensao) {
    const p = pathologyProfilesData[perfil];
    if (!p || !p.vias) return null;
    // v12.59: com uma dimensao em foco, so' as vias DELA aparecem desviadas. As outras vias da doenca continuam
    // desenhadas, no traco normal — e' assim que se ve, no mesmo cerebro, o que e' do positivo e o que nao e'.
    if (dimensao) {
        const dim = DIMENSOES_DE_SINTOMA[dimensao];
        if (!dim || !dim.vias || !dim.vias[subId]) return null;
    }
    const d = p.vias[subId];
    return (d === "hiper" || d === "hipo") ? d : null;
}

// =========================================================
// v12.44 (D12, decisao do autor em 03/09/2026): DIMENSOES DE SINTOMA. A unidade da fisiopatologia passa a ser a
// dimensao (sintomas positivos, negativos, anedonia, hipobulia, mania, compulsao...), transdiagnostica; o perfil
// (diagnostico) vira uma COMPOSICAO de dimensoes. Esta tabela nasce VAZIA de proposito: cada dimensao e do autor,
// com fonte em SOURCES (invariante: conteudo clinico nasce com fonte ou nao nasce). O gabarito para escrever esta em
// docs/Dimensoes_de_Sintoma.md. Quando um perfil declarar `dimensoes: ['a', 'b']`, tests/dimensoes.test.ts exige
// que o seu mapa `vias` seja EXATAMENTE a uniao dos mapas das dimensoes, sem contradicao hiper/hipo — o perfil
// deixa de ser uma segunda afirmacao e passa a ser consequencia. Ate la, o mapa `vias` de cada perfil continua
// sendo a verdade desenhada (desvioDaVia).
//
// Forma de uma dimensao:
//   sintomas_positivos: {
//       rotulo: 'Sintomas positivos', descricao: 'Delirios e alucinacoes por saliencia aberrante...',
//       vias: { da_mesolimbic: 'hiper' }, source: ['kapur2003', 'howes2009'],
//   },
// =========================================================
const DIMENSOES_DE_SINTOMA = {
    // v12.57 (04/09/2026): as duas primeiras dimensoes, escritas pelo autor. Nenhuma afirmacao aqui e' inferencia da
    // simulacao: cada uma tem fonte na biblioteca dele (levantamento em docs/Fontes_no_Drive_2026-09-03.md).
    positivos: {
        rotulo: 'Sintomas positivos',
        descricao: 'A dopamina mesolímbica em excesso transforma estímulo neutro em estímulo saliente — a saliência '
            + 'aberrante de Kapur; o delírio é o sentido que a pessoa dá a essa experiência. O excesso não nasce no VTA: '
            + 'vem de cima. O hipocampo ventral hiperativo empurra a atividade populacional dos neurônios dopaminérgicos, '
            + 'o córtex perde o freio sobre o VTA, o portão córtico-talâmico deixa de fechar e os interneurônios PV+ que '
            + 'sustentam o ritmo gama estão em falta.',
        vias: {
            da_mesolimbic: 'hiper',        // a via final comum da psicose
            glu_vhipp_mpfc: 'hiper',       // o empurrao que vem do hipocampo ventral
            glu_cortico_vta: 'hipo',       // o freio cortical sobre o VTA que se perde
            glu_thalamocortical: 'hiper',  // arousal sem filtro
            glu_corticothalamic: 'hipo',   // o portao sensorial que deixa de fechar
            gaba_pv_gamma: 'hipo',         // PV+ em falta desinibe o piramidal
        },
        source: ['kapur2003', 'howes2009', 'lodge2007', 'schobel2013', 'moghaddam2012', 'sohal2009'],
    },
    negativos: {
        rotulo: 'Sintomas negativos',
        descricao: 'A mesma doença pelo eixo oposto: a via mesocortical hipoativa deixa o pré-frontal dorsolateral sem '
            + 'dopamina, e é disso que se fazem avolição, embotamento afetivo e anedonia — o que a SANS operacionaliza. '
            + 'O déficit de interneurônios PV+ entra aqui também: sem ritmo gama, o córtex perde desempenho de circuito. '
            + 'Por isso o antipsicótico que resolve o positivo não resolve o negativo — bloquear D2 não repõe dopamina '
            + 'onde ela falta.',
        vias: {
            da_mesocortical: 'hipo',       // hipofrontalidade
            gaba_pv_gamma: 'hipo',         // compartilhada com os positivos, no MESMO sentido: soma, nao contradiz
        },
        source: ['stahl5', 'howes2009', 'sohal2009', 'andreasen1982'],
    },
    /*
     * v12.60 — as tres dimensoes da depressao melancolica. Juntas cobrem exatamente as sete vias que o perfil ja
     * desenhava: nada mudou na figura, mudou a origem. A HIPOBULIA nao virou dimensao aqui, e o motivo esta no
     * relatorio ao autor: no catalogo atual ela nao se separa da anedonia na depressao (mesma via mesolimbica), e
     * uma hipobulia transdiagnostica precisaria de vias diferentes por doenca (mesocortical na esquizofrenia),
     * o que o modelo de hoje nao permite — decisao do autor, nao consequencia de codigo.
     */
    anedonia: {
        rotulo: 'Anedonia',
        descricao: 'A habênula lateral dispara em rajada e recruta o freio GABAérgico do RMTg sobre o VTA: a '
            + 'dopamina mesolímbica cai, e com ela a resposta à recompensa e a disposição de gastar esforço para '
            + 'obtê-la. É por isso que a anedonia se mede em duas peças — o prazer de consumar e a vontade de '
            + 'buscar — e por que a cetamina, que silencia a rajada da LHb, alivia em horas o que a monoamina '
            + 'demora semanas para tocar.',
        vias: {
            lhb_rmtg: 'hiper',        // a habenula em rajada
            rmtg_vta_brake: 'hiper',  // o freio que ela recruta
            da_mesolimbic: 'hipo',    // o resultado: recompensa sem sinal
        },
        source: ['hu2020', 'yang2018', 'treadway2011', 'stahl5'],
    },
    humor_deprimido: {
        rotulo: 'Humor deprimido',
        descricao: 'O mesmo freio do RMTg alcança a rafe, e o tônus serotoninérgico que chega ao córtex pré-frontal '
            + 'cai. É o eixo em que o antidepressivo monoaminérgico age — e a demora de semanas até a '
            + 'dessensibilização do autorreceptor 5-HT1A é a razão de a melhora do humor não vir junto com o '
            + 'primeiro comprimido.',
        vias: {
            rmtg_rafe_brake: 'hiper',  // o freio sobre a rafe
            '5ht_pfc': 'hipo',         // o tonus que chega ao cortex
        },
        // v12.61: cipriani2013 saiu — e' o meta de LITIO na prevencao do suicidio, nao tem relacao com
        // o eixo RMTg->rafe nem com a latencia do antidepressivo. Fonte errada e' pior que fonte nenhuma.
        source: ['hu2020', 'stahl5'],
    },
    eixo_do_estresse: {
        rotulo: 'Desregulação do eixo do estresse',
        descricao: 'O PVN mantém a alça HPA acesa e o freio hipocampal por glicocorticoide, que deveria desligá-la, '
            + 'está fraco: o cortisol não volta ao basal. É a dimensão que responde pelo despertar precoce e pela '
            + 'não supressão à dexametasona, e a que liga a depressão melancólica ao estresse crônico — e não uma '
            + 'segunda doença.',
        vias: {
            hpa_pvn_pituitary: 'hiper',  // a alca acesa
            hpa_hippo_brake: 'hipo',     // o freio que nao desliga
        },
        source: ['ulrichlai2009', 'stahl5'],
    },
};

// A uniao dos mapas `vias` de uma lista de dimensoes, com a lista de sub-vias em contradicao (hiper numa, hipo noutra).
function viasDasDimensoes(chaves, tabela) {
    const t = tabela || DIMENSOES_DE_SINTOMA;
    const vias = {}; const conflitos = [];
    for (const chave of chaves || []) {
        const d = t[chave]; if (!d || !d.vias) continue;
        for (const [sub, desvio] of Object.entries(d.vias)) {
            if (vias[sub] && vias[sub] !== desvio) { if (!conflitos.includes(sub)) conflitos.push(sub); continue; }
            vias[sub] = desvio;
        }
    }
    return { vias, conflitos };
}

// D12: um perfil que declara dimensoes NAO escreve o seu mapa de vias — ele e' consequencia da soma. Roda uma vez,
// na carga do modulo, antes de qualquer desenho (desvioDaVia le `p.vias` so' em tempo de clique).
for (const [chave, perfil] of Object.entries(pathologyProfilesData)) {
    if (!Array.isArray(perfil.dimensoes) || !perfil.dimensoes.length) continue;
    const soma = viasDasDimensoes(perfil.dimensoes);
    if (soma.conflitos.length) console.warn('[NeuroSim] dimensoes em contradicao no perfil ' + chave + ': ' + soma.conflitos.join(', '));
    perfil.vias = soma.vias;
}

const neurostimProtocolsData = {
    off: {
        name: "⚡ Neuroestimulação Desligada",
        device: "Nenhum dispositivo ativo",
        target: "Selecione um protocolo abaixo para posicionar a bobina ou eletrodo",
        bio: "A estimulação magnética transcraniana (EMT) e a estimulação cerebral profunda (DBS) modulam a plasticidade sináptica e sincronia de redes.",
        evidence: "Padrão de referência (Baseline)"
    },
    rtms_10hz_dlpfc: {
        name: "🧲 EMT de Alta Frequência (rTMS 10 Hz no DLPFC Esquerdo)",
        device: "Bobina Magnética em Formato de Oito (Figure-8 Coil)",
        target: "Córtex Pré-Frontal Dorsolateral Esquerdo (DLPFC - Área 9/46 de Brodmann)",
        params: "10 Hz (ou protocolo theta-burst iTBS de 3 min), 120% do Limiar Motor (MT), trens de 4s com 26s de intervalo, 3000 pulsos/sessão.",
        bio: "O campo magnético variável induz correntes elétricas paralelas que despolarizam neurônios piramidais da camada V. Induz potenciação de longa duração (LTP) dependente de NMDA/BDNF, reativando o Loop Executivo e desinibindo a liberação de dopamina e serotonina no estriado e córtex.",
        indication: "Depressão Maior Unipolar Resistente (TRD), Sintomas Negativos na Esquizofrenia e Reabilitação pós-AVC.",
        evidence: "Nível A de Evidência (Aprovado FDA, ANVISA e CFM)."
    },
    rtms_1hz_sma: {
        name: "🧲 EMT Inibitória de Baixa Frequência (rTMS 1 Hz no SMA / dACC)",
        device: "Bobina Magnética Circular / Figure-8",
        target: "Córtex Motor Suplementar (SMA) e Cíngulo Anterior Dorsal (dACC)",
        params: "1 Hz contínuo (ou cTBS contínuo), 100-110% do MT, 1200 a 1800 pulsos contínuos por sessão.",
        bio: "Pulsos de 1 Hz recrutam interneurônios GABAérgicos corticais e induzem depressão de longa duração (LTD), amortecendo a hiperatividade hiper-ressonante do Loop Motor Cortico-Estriato-Talâmico.",
        indication: "Transtorno Obsessivo-Compulsivo (TOC Refratário), Tiques Motores e Síndrome de Tourette.",
        evidence: "Nível B (provável eficácia) para 1 Hz em SMA; o protocolo aprovado pelo FDA para TOC é dTMS 20 Hz em mPFC/ACC (Carmi 2019)."
    },
    dbs_130hz_cg25: {
        name: "📍 DBS de Alta Frequência no Cíngulo Subgenual (Área CG25 de Mayberg)",
        device: "Eletrodo Estereotáxico Quadripolar Conectado a Neuroestimulador Subclavicular",
        target: "Córtex Cingulado Ventral / Subgenual (Área 25 de Brodmann - Matéria Branca Subcalosa)",
        params: "130 Hz, largura de pulso de 90 µs, voltagem de 3.0 a 4.5 V contínua.",
        bio: "A estimulação de alta frequência gera uma 'lesão funcional reversível', silenciando a hiperconectividade patológica do CG25 com a amígdala e o hipotálamo, aliviando o sofrimento melancólico e a ideação de ruína em horas a dias.",
        indication: "Depressão Maior Grave Resistente a Tratamentos Biológicos Múltiplos (incluindo falha a ECT).",
        evidence: "Experimental: o ensaio multicêntrico BROADEN foi interrompido por futilidade; séries abertas de Mayberg mostram resposta em subgrupos (Pioneirismo Helen Mayberg)."
    },
    dbs_130hz_alic: {
        name: "📍 DBS no Braço Anterior da Cápsula Interna & Accumbens (ALIC / NAc)",
        device: "Eletrodo Estereotáxico de Platina-Irídio",
        target: "Braço Anterior da Cápsula Interna (ALIC) e Core do Núcleo Accumbens",
        params: "130 Hz, 120-210 µs, 4.0 a 6.0 V.",
        bio: "Interrompe as fibras fronto-talâmicas aberrantes que alimentam os pensamentos intrusivos e rituais compulsivos, restaurando a flexibilidade comportamental.",
        indication: "Transtorno Obsessivo-Compulsivo Refratário Grave (dependência química permanece experimental).",
        evidence: "Aprovado pelo FDA sob Isenção de Dispositivo Humanitário (HDE) apenas para TOC."
    },
    opto_inhibit_lhb: {
        name: "💡 Optogenética Virtual: Inibição Óptica da Habênula Lateral (NpHR)",
        device: "Cânula de Fibra Óptica com Luz Amarela (590 nm) em Neurônios Transfectados com Halo-Rodopsina",
        target: "Habênula Lateral (LHb - Centro Anti-Recompensa)",
        params: "590 nm luz amarela contínua, ativação de bomba de cloreto NpHR (hiperpolarização imediata).",
        bio: "A luz amarela hiperpolariza a Habênula Lateral, silenciando completamente seu disparo para o RMTg. Sem o freio do RMTg, os neurônios de dopamina da VTA e serotonina da Rafe voltam a disparar imediatamente, revertendo a anedonia e o desespero em segundos em modelos animais!",
        indication: "Resgate Imediato de Anedonia e Desespero (Modelo Translacional de Próxima Geração).",
        evidence: "Padrão-Ouro de Demonstração Causal em Neurociência Fundamental."
    }
};

// ====================================================================================================
// vindo de engine.js
// ====================================================================================================

/*
 * v12.34 — POSICIONAMENTO DE ROTULOS do conectoma 2D (Fase 4.2 do roadmap de frontend).
 *
 * Geometria pura, sem canvas: recebe ancoras, textos e uma funcao de medir texto INJETADA (no
 * navegador, measureText; no teste, comprimento × 4,4) e devolve caixas. E por isso que mora em
 * engine.js, como os solvers: testavel em Node exatamente como eles (tests/rotulos.test.ts).
 *
 * As regras, e de onde vem cada uma (docs/Roadmap_Frontend.md, Fase 4):
 *
 *  1. O NUCLEO GANHA SEMPRE. O nome do nucleo e um toponimo, o referente estavel do mapa; o nome
 *     da via e um predicado entre dois toponimos. Se "VTA" some, "Mesolimbica (VTA -> Accumbens)"
 *     fica ilegivel como conhecimento; se "Mesolimbica" some e VTA e Accumbens ficam, com a curva
 *     roxa entre eles, o aluno ainda aprende a via — e o professor completa o nome com a voz.
 *  2. ESTABILIDADE. O layout dos nucleos e calculado para TODOS os nucleos, acesos ou nao, e so
 *     os acesos sao desenhados. Assim "Talamo" esta no mesmo pixel acesa a dopamina ou a
 *     serotonina: o aluno constroi a costa uma vez e ve rios diferentes passarem sobre ela.
 *  3. GULOSO COM CANDIDATOS DISCRETOS. Cada rotulo tem oito posicoes possiveis, em ordem de
 *     preferencia; aceita-se a primeira sem intersecao. Nada de simulacao de forcas: ela converge
 *     ao longo de quadros e os nomes ficam DESLIZANDO durante a aula e a gravacao.
 *  4. CALHA. Quem nao couber vai para as faixas laterais do canvas, que estao vazias (o cerebro
 *     ocupa de 0,18 a 0,85 da largura), com linha de chamada ate a ancora.
 *  5. ORCAMENTO E DEGRADACAO EM TRES DEGRAUS. Ate 8 rotulos de via: nome curto ao lado da curva.
 *     De 9 a 20: disco numerado + linha na legenda. Acima de 20: nada no canvas, e a legenda em
 *     DOM carrega tudo. O 8 nao vem da geometria, vem da pedagogia: quem ouve alguem falar
 *     acompanha 7 ± 2 nomes simultaneos.
 *  6. CONSERVACAO. Todo item da entrada aparece na saida — colocado, na calha, numerado ou
 *     oculto. "Nada some" virado geometria: o que nao esta no canvas esta na legenda.
 *
 * Determinismo: mesma entrada, mesma saida, sempre (sem Math.random, sem ordem de Set). Duas
 * chamadas identicas por quadro produzem o mesmo desenho — e isso e testado.
 */
function posicionarRotulos(spec) {
    const W = spec.largura, H = spec.altura;
    const medir = spec.medir;
    const folga = spec.folga == null ? 2 : spec.folga;
    const raio = spec.raioNucleo == null ? 9 : spec.raioNucleo;
    const orcamento = spec.orcamentoVias == null ? 8 : spec.orcamentoVias;
    const limiteNumerados = spec.limiteNumerados == null ? 20 : spec.limiteNumerados;
    const calhaLargura = spec.calhaLargura == null ? Math.round(W * 0.15) : spec.calhaLargura;
    const debug = !!spec.debug;
    const nucleos = spec.nucleos || [];
    const vias = spec.vias || [];

    const cruza = (a, b) => !(a.x2 + folga <= b.x1 || a.x1 - folga >= b.x2 || a.y2 + folga <= b.y1 || a.y1 - folga >= b.y2);
    const dentro = (c) => c.x1 >= 0 && c.y1 >= 0 && c.x2 <= W && c.y2 <= H;
    // v12.34: retangulos que o DOM poe por cima do canvas (legenda, osciloscopio, cracha) — nenhuma caixa nem vaga
    // de calha cai debaixo deles. A primeira captura de referencia mostrou a legenda tapando tres nucleos do tronco.
    const reservadas = (spec.reservadas || []).map(r => ({ x1: r.x1, y1: r.y1, x2: r.x2, y2: r.y2 }));
    const livre = (c) => dentro(c) && !reservadas.some(r => cruza(c, r));
    // caixa contra o "quadrado" do no: um rotulo nao pode cobrir o ponto de nenhum nucleo
    const cobreNo = (c, n) => !(c.x2 < n.x - raio || c.x1 > n.x + raio || c.y2 < n.y - raio || c.y1 > n.y + raio);
    const arred = (c, i) => ({ x1: Math.round(c.x1), y1: Math.round(c.y1), x2: Math.round(c.x1 + c.w), y2: Math.round(c.y1 + c.h), candidato: i });
    // oito candidatos ao redor da ancora, em ordem de preferencia: direita, esquerda, acima, abaixo, diagonais
    const candidatos = (ax, ay, w, h, afast) => [
        { x1: ax + afast, y1: ay - h / 2, w, h },
        { x1: ax - afast - w, y1: ay - h / 2, w, h },
        { x1: ax - w / 2, y1: ay - afast - h, w, h },
        { x1: ax - w / 2, y1: ay + afast, w, h },
        { x1: ax + afast * 0.75, y1: ay - afast * 0.75 - h, w, h },
        { x1: ax - afast * 0.75 - w, y1: ay - afast * 0.75 - h, w, h },
        { x1: ax + afast * 0.75, y1: ay + afast * 0.75, w, h },
        { x1: ax - afast * 0.75 - w, y1: ay + afast * 0.75, w, h },
    ].map(arred);

    const pilhas = { esq: [], dir: [] };
    const vagaNaCalha = (lado, ancora, w, h, bloqueios) => {
        const pilha = lado === 'dir' ? pilhas.dir : pilhas.esq;
        const larg = Math.min(w, calhaLargura - 8);
        const x1 = lado === 'dir' ? W - 4 - larg : 4;
        const y0 = Math.max(4, Math.round(ancora.y - h / 2));
        const cabe = (y1) => {
            const c = { x1, y1, x2: x1 + larg, y2: y1 + h, candidato: -1 };
            if (y1 < 4 || c.y2 > H - 4) return null;
            if (pilha.some(p => cruza(c, p)) || bloqueios.some(p => cruza(c, p)) || reservadas.some(r => cruza(c, r))) return null;
            return c;
        };
        // desce a partir da ancora; se a faixa de baixo estiver tomada (legenda, painel), sobe a partir dela
        for (let y1 = y0; y1 + h <= H - 4; y1 += h + folga) { const c = cabe(y1); if (c) { pilha.push(c); return c; } }
        for (let y1 = y0 - h - folga; y1 >= 4; y1 -= h + folga) { const c = cabe(y1); if (c) { pilha.push(c); return c; } }
        return null;
    };
    // o lado mais perto primeiro; o outro lado e o ultimo recurso antes de "forcado"/"oculto" — a linha de
    // chamada atravessa o mapa, mas o nome continua no desenho
    const naCalha = (ancora, w, h, bloqueios) => {
        const perto = ancora.x > W / 2 ? 'dir' : 'esq';
        return vagaNaCalha(perto, ancora, w, h, bloqueios) || vagaNaCalha(perto === 'dir' ? 'esq' : 'dir', ancora, w, h, bloqueios);
    };

    // 1) NUCLEOS — todos, para o layout nao mudar quando uma camada acende ou apaga
    const caixasNucleos = [];
    const outNucleos = nucleos.map(n => {
        const m = medir(n.texto, 'nucleo');
        const cands = candidatos(n.x, n.y, m.w, m.h, raio + 3);
        const outros = nucleos.filter(o => o.id !== n.id);
        let caixa = cands.find(c => livre(c) &&!caixasNucleos.some(o => cruza(c, o)) && !outros.some(o => cobreNo(c, o)));
        let modo = 'texto', de = null;
        if (!caixa) { const cc = naCalha(n, m.w, m.h, caixasNucleos); if (cc) { caixa = cc; modo = 'calha'; de = { x: n.x, y: n.y }; } }
        if (!caixa) { caixa = cands[0]; modo = 'forcado'; }   // nunca some: o pior caso e sobrepor, e isso e contado
        caixasNucleos.push(caixa);
        const saida = { id: n.id, tipo: 'nucleo', texto: n.texto, modo, de, visivel: !!n.aceso, x1: caixa.x1, y1: caixa.y1, x2: caixa.x2, y2: caixa.y2, candidato: caixa.candidato };
        if (debug) saida.candidatos = cands;
        return saida;
    });

    // 2) VIAS — regime pela quantidade; evitam os rotulos de nucleo VISIVEIS, todos os nos e umas as outras
    const n = vias.length;
    const regime = n <= orcamento ? 'texto' : (n <= limiteNumerados ? 'numerado' : 'legenda');
    const bloqueios = outNucleos.filter(x => x.visivel).map(x => ({ x1: x.x1, y1: x.y1, x2: x.x2, y2: x.y2 }));
    const outVias = vias.map((v, idx) => {
        const numero = idx + 1;
        if (regime === 'legenda') return { id: v.id, tipo: 'via', texto: v.texto, modo: 'oculto', numero };
        const rotulo = regime === 'texto' ? v.texto : String(numero);
        const m = medir(rotulo, regime === 'texto' ? 'via' : 'numero');
        const cands = candidatos(v.x, v.y, m.w, m.h, 4);
        let caixa = cands.find(c => livre(c) &&!bloqueios.some(o => cruza(c, o)) && !nucleos.some(o => cobreNo(c, o)));
        let modo = regime === 'texto' ? 'texto' : 'numero', de = null;
        if (!caixa) { const cc = naCalha(v, m.w, m.h, bloqueios); if (cc) { caixa = cc; modo = 'calha'; de = { x: v.x, y: v.y }; } }
        if (!caixa) return { id: v.id, tipo: 'via', texto: v.texto, modo: 'oculto', numero };
        bloqueios.push(caixa);
        const saida = { id: v.id, tipo: 'via', texto: v.texto, rotulo, modo, numero, de, x1: caixa.x1, y1: caixa.y1, x2: caixa.x2, y2: caixa.y2, candidato: caixa.candidato };
        if (debug) saida.candidatos = cands;
        return saida;
    });

    return { regime, reservadas, nucleos: outNucleos, vias: outVias };
}

// ====================================================================================================
// vindo de render3d.js
// ====================================================================================================

let brain3DGroup;    // dominio Circuitos
// v12.51: init3D (casca) monta o grupo do cerebro; em modulo, quem importa nao escreve — o dono expoe o setter.
function definirBrain3DGroup(g) { brain3DGroup = g; }

let brain3DNucleiMeshes = {}, brain3DTractMeshes = [], brain3DPhotonParticles = null;

function buildWholeBrain3D(parent) {
    // 1. Translucent Glass Brain Cortical Hull
    const brainHullMat = new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.16,
        shininess: 90,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const brainWireMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });

    // Left Hemisphere
    const leftHemiGeo = new THREE.SphereGeometry(10, 32, 24);
    leftHemiGeo.scale(0.68, 0.85, 1.15);
    const leftHemiMesh = new THREE.Mesh(leftHemiGeo, brainHullMat);
    leftHemiMesh.position.set(-3.2, 1.5, -0.5);
    parent.add(leftHemiMesh);
    parent.add(new THREE.Mesh(leftHemiGeo, brainWireMat));

    // Right Hemisphere
    const rightHemiGeo = new THREE.SphereGeometry(10, 32, 24);
    rightHemiGeo.scale(0.68, 0.85, 1.15);
    const rightHemiMesh = new THREE.Mesh(rightHemiGeo, brainHullMat);
    rightHemiMesh.position.set(3.2, 1.5, -0.5);
    parent.add(rightHemiMesh);
    const rightWire = new THREE.Mesh(rightHemiGeo, brainWireMat);
    rightWire.position.set(3.2, 1.5, -0.5);
    parent.add(rightWire);

    // Cerebellum (Posterior-Inferior)
    const cerebGeo = new THREE.SphereGeometry(4.5, 24, 16);
    cerebGeo.scale(1.2, 0.65, 0.75);
    const cerebMesh = new THREE.Mesh(cerebGeo, brainHullMat);
    cerebMesh.position.set(0, -3.5, -6.8);
    parent.add(cerebMesh);

    // Brainstem (Descending Trunk)
    const stemGeo = new THREE.CylinderGeometry(1.6, 1.2, 8.5, 20);
    const stemMesh = new THREE.Mesh(stemGeo, brainHullMat);
    stemMesh.position.set(0, -5.5, -2.8);
    stemMesh.rotation.x = -0.22;
    parent.add(stemMesh);

    // 2. Build 3D Volumetric Nuclei Spheres
    brain3DNucleiMeshes = {};
    Object.keys(nuclei3DCoords).forEach(id => {
        const nuc = nuclei3DCoords[id];
        const geo = new THREE.SphereGeometry(nuc.r, 20, 20);
        const mat = new THREE.MeshPhongMaterial({
            color: nuc.color,
            emissive: nuc.color,
            emissiveIntensity: 0.55,
            transparent: true,
            opacity: 0.88
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(nuc.x, nuc.y, nuc.z);
        mesh.userData = { nucleusId: id, name: nuc.name };
        parent.add(mesh);
        brain3DNucleiMeshes[id] = mesh;

        // Pulsing Halo Ring
        const ringGeo = new THREE.RingGeometry(nuc.r * 1.2, nuc.r * 1.45, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: nuc.color, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(nuc.x, nuc.y, nuc.z);
        ring.rotation.x = Math.PI * 0.5;
        parent.add(ring);
    });

    // 3. Build 3D DTI Tractography Spline Tubes
    build3DTractographySplines(parent);

    // 4. Build 3D Flowing Action Potential Photons
    build3DPhotonParticles(parent);
}

function build3DTractographySplines(parent) {
    brain3DTractMeshes = [];

    // Complete 3D Tractography Splines for all 71 Canonical Sub-Tracts
    const tractConfigs = tractConfigs3D; // v12.0: derivado de tractsCatalog

    // Generate Bilateral 3D DTI Tract Splines (Right & Left Hemispheres)
    tractConfigs.forEach(cfg => {
        const n1 = nuclei3DCoords[cfg.from];
        const n2 = nuclei3DCoords[cfg.to];
        if (!n1 || !n2) return;

        const isBilateral = (n1.bilateral || n2.bilateral || n1.x !== 0 || n2.x !== 0);
        const sides = isBilateral ? [1, -1] : [1];

        sides.forEach(sign => {
            const p1 = new THREE.Vector3(n1.x * (n1.bilateral || n1.x !== 0 ? sign : 1), n1.y, n1.z);
            const p2 = new THREE.Vector3(n2.x * (n2.bilateral || n2.x !== 0 ? sign : 1), n2.y, n2.z);

            // Create a smooth 3D Catmull-Rom arc curve mirrored for each hemisphere
            const midPoint = new THREE.Vector3(
                (p1.x + p2.x) / 2 + ((cfg.arcX || 0) * sign),
                (p1.y + p2.y) / 2 + (cfg.arcY || 2.0),
                (p1.z + p2.z) / 2
            );

            const curve = new THREE.CatmullRomCurve3([p1, midPoint, p2]);

            // Tube Geometry representing the Bilateral DTI Fiber Bundle
            const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.22, 8, false);
            const tubeMat = new THREE.MeshPhongMaterial({
                color: cfg.color,
                emissive: cfg.color,
                emissiveIntensity: 0.45,
                transparent: true,
                opacity: 0.85,
                shininess: 80
            });

            const tractMesh = new THREE.Mesh(tubeGeo, tubeMat);
            tractMesh.userData = {
                layer: cfg.layer,
                subId: cfg.subId,
                from: cfg.from,
                to: cfg.to,
                hemisphere: sign === 1 ? 'right' : 'left',
                curve: curve
            };

            parent.add(tractMesh);
            brain3DTractMeshes.push(tractMesh);
        });
    });

    build3DPhotonParticles(parent);
}

function build3DPhotonParticles(parent) {
    if (brain3DPhotonParticles && parent) {
        parent.remove(brain3DPhotonParticles);
    }
    const particleCount = 220;
    const geometry = new THREE.BufferGeometry ? new THREE.BufferGeometry() : new THREE.Geometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const offsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        offsets[i] = Math.random();
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;

        colors[i * 3] = 0.22;
        colors[i * 3 + 1] = 0.74;
        colors[i * 3 + 2] = 0.97;
    }

    if (geometry.setAttribute) {
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    const material = new THREE.PointsMaterial({
        size: 0.85,
        vertexColors: true,
        transparent: true,
        opacity: 0.92
    });

    brain3DPhotonParticles = new THREE.Points(geometry, material);
    brain3DPhotonParticles.userData = { offsets: offsets };
    parent.add(brain3DPhotonParticles);
}

function update3DBrainTractsVisibility() {
    const state = store.getState();
    const activeLayers = state.activeCircuitLayers || [];
    const subList = state.activeSubTracts || [];

    brain3DTractMeshes.forEach(mesh => {
        const u = mesh.userData;
        // v12.56: o mesmo filtro por camada do 2D
        let isActive = activeLayers.includes(u.layer);
        if (isActive) {
            isActive = viaVisivel(subList, u.layer, u.subId);
        }

        mesh.visible = isActive;
        mesh.material.opacity = isActive ? 0.90 : 0.05;
    });

    // Update Photon Particles traveling along active tracts
    if (brain3DPhotonParticles && brain3DTractMeshes.length > 0) {
        const positions = brain3DPhotonParticles.geometry.attributes.position.array;
        const colors = brain3DPhotonParticles.geometry.attributes.color.array;
        const offsets = brain3DPhotonParticles.userData.offsets;
        const activeMeshes = brain3DTractMeshes.filter(m => m.visible);

        if (activeMeshes.length > 0) {
            const photonSpeed = state.apActive ? 0.05 : (0.015 * (state.axonSpeed || 1.0));
            for (let i = 0; i < offsets.length; i++) {
                offsets[i] = (offsets[i] + photonSpeed) % 1.0;
                const targetTract = activeMeshes[i % activeMeshes.length];
                const pt = targetTract.userData.curve.getPoint(offsets[i]);

                positions[i * 3] = pt.x;
                positions[i * 3 + 1] = pt.y;
                positions[i * 3 + 2] = pt.z;

                const hexCol = targetTract.userData.baseColor;
                colors[i * 3] = ((hexCol >> 16) & 255) / 255;
                colors[i * 3 + 1] = ((hexCol >> 8) & 255) / 255;
                colors[i * 3 + 2] = (hexCol & 255) / 255;
            }
            brain3DPhotonParticles.geometry.attributes.position.needsUpdate = true;
            brain3DPhotonParticles.geometry.attributes.color.needsUpdate = true;
            brain3DPhotonParticles.visible = true;
        } else {
            brain3DPhotonParticles.visible = false;
        }
    }
}

        // Tooltip Engine for 2D Conectoma & 3D Brain
function showConnectomeTooltip(nucleusId, screenX, screenY) {
    const tt = document.getElementById('connectome-tooltip');
    const data = nucleiClinicalData[nucleusId];
    if (!tt) return;
    delete tt.dataset.fixado;   // v12.43 (D10): quem chama decide se este tooltip e o fixado (atualizarTooltipFixado)
    const fixado = (typeof store !== 'undefined') && store.getState().selectedNucleusId === nucleusId;
    const marcaFixado = fixado ? '<div class="tooltip-row" style="color: var(--text-faint); margin-top: 4px;">📌 fixado — clique fora para soltar</div>' : '';
    if (!data) {
        // v12.34: o passe do mouse passou a vir do catálogo (37 núcleos), e sete deles ainda não têm dossiê
        // clínico — m1, gpe, gpi, stn, rvm, sma, ofc. Antes, este return calado não abria nada, e o hover
        // parecia quebrado nesses sete. Mostra o nome do catálogo e diz o que falta: nada some.
        const ficha = (typeof nucleiCatalog !== 'undefined' && nucleiCatalog[nucleusId]) || null;
        if (!ficha) return;
        tt.innerHTML = `
        <div class="tooltip-title">
            <span>🧠</span>
            <span>${fixado ? '📌 ' : ''}${ficha.fullName || ficha.label || nucleusId}</span>
        </div>
        <div class="tooltip-row"><em>Dossiê clínico ainda não escrito para este núcleo.</em></div>${marcaFixado}
    `;
    } else tt.innerHTML = `
        <div class="tooltip-title">
            <span>🧠</span>
            <span>${fixado ? '📌 ' : ''}${data.name}</span>
        </div>
        <div style="font-size: 0.65rem; color: #38bdf8; font-weight: 700; margin-bottom: 6px;">${data.class}</div>
        <div class="tooltip-row"><span class="tooltip-label">📥 Aferências:</span> ${data.inputs}</div>
        <div class="tooltip-row"><span class="tooltip-label">📤 Eferências:</span> ${data.outputs}</div>
        <div class="tooltip-row"><span class="tooltip-label">🧪 Receptores:</span> ${data.receptors}</div>
        <div class="tooltip-row" style="color: #fde68a; margin-top: 6px;"><span class="tooltip-label" style="color: #f59e0b;">💡 Clínica:</span> ${data.clinical}</div>${marcaFixado}
    `;
    tt.style.display = 'block';
    tt.style.left = `${Math.min(screenX + 15, window.innerWidth - 300)}px`;
    tt.style.top = `${Math.min(screenY + 15, window.innerHeight - 200)}px`;
}

function hideConnectomeTooltip() {
    const tt = document.getElementById('connectome-tooltip');
    if (!tt) return;
    tt.style.display = 'none'; delete tt.dataset.fixado;
    // v12.43 (D10): o mouse saiu — se ha nucleo selecionado no conectoma 2D, o tooltip DELE volta, fixado
    if (typeof store !== 'undefined') atualizarTooltipFixado(store.getState());
}

/*
 * v12.43 (D10, Fase 4.3 `pinned`): o nucleo SELECIONADO tem o tooltip FIXADO no conectoma 2D — fica quando o mouse
 * sai, para o professor apontar e falar; o hover mostra o de outro nucleo por cima e, ao sair, o fixado volta.
 * Derivado de selectedNucleusId (estado no reducer): nenhum estado novo. renderUI chama esta funcao, entao
 * selecionar pelo Spotlight, pelo inspetor ou pelo clique no 3D tambem fixa. Fora do conectoma 2D, nada fica.
 */
function atualizarTooltipFixado(state) {
    const tt = document.getElementById('connectome-tooltip'); if (!tt) return;
    const id = state && state.selectedNucleusId;
    const canvas = document.getElementById('brainCanvas');
    const conhecido = id && ((typeof nucleiCatalog !== 'undefined' && nucleiCatalog[id]) || nucleiClinicalData[id]);
    if (!conhecido || !canvas || state.visualScale !== 'brain2d') {
        if (tt.dataset.fixado === '1') { tt.style.display = 'none'; delete tt.dataset.fixado; }
        return;
    }
    const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
    const n = nuclei2DFor(w, h)[id]; if (!n) return;
    const rect = canvas.getBoundingClientRect();
    showConnectomeTooltip(id, rect.left + n.x, rect.top + n.y);
    tt.dataset.fixado = '1';
}

// v12.43 (D10): o conectoma 2D nao tinha clique — SELECT_NUCLEUS so vinha do cerebro 3D, do Spotlight e dos perfis,
// e a legenda prometia "clique fora para desmarcar" sem ninguem escutar. No nucleo seleciona; de novo, ou fora, solta.
function onBrainCanvasClick(e) {
    const canvas = document.getElementById('brainCanvas');
    const state = store.getState();
    if (!canvas || state.visualScale !== 'brain2d') return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const nuclei = nuclei2DFor(canvas.clientWidth || canvas.width, canvas.clientHeight || canvas.height);
    let alvo = null;
    for (const id in nuclei) { if (Math.hypot(x - nuclei[id].x, y - nuclei[id].y) <= 20) { alvo = id; break; } }
    store.dispatch({ type: 'SELECT_NUCLEUS', nucleusId: (alvo && alvo !== state.selectedNucleusId) ? alvo : null });
}

function onBrainCanvasMouseMove(e) {
    const canvas = document.getElementById('brainCanvas');
    const state = store.getState();
    if (!canvas || state.visualScale !== 'brain2d') return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // v12.34: as coordenadas vem do MESMO catalogo que desenha (nuclei2DFor). A tabela redigitada a mao
    // que vivia aqui tinha 30 nucleos contra 37 no catalogo: os sete mais novos nunca mostravam tooltip.
    const nuclei = nuclei2DFor(w, h);

    let hoveredId = null;
    for (let id in nuclei) {
        const n = nuclei[id];
        const dist = Math.hypot(mouseX - n.x, mouseY - n.y);
        if (dist <= 20) {
            hoveredId = id;
            break;
        }
    }

    if (hoveredId) {
        showConnectomeTooltip(hoveredId, e.clientX, e.clientY);
        canvas.style.cursor = 'pointer';
    } else {
        hideConnectomeTooltip();
        canvas.style.cursor = 'default';
    }
}

// ====================================================================================================
// vindo de render2d.js
// ====================================================================================================

let brainPulseOffset = 0;

// v12.34 — instrumento: as caixas dos rotulos desenhados no ultimo quadro do conectoma principal
// ({ tipo: 'via'|'nucleo', texto, x1, y1, x2, y2 }). E o que o check-rotulos.mjs e a medicao da
// Fase 4.2 leem para contar sobreposicoes. Nao muda o desenho.
let ultimosRotulos = [];

let ultimoLayoutRotulos = null;   // v12.34: o layout do ultimo quadro (regime, caixas), para a legenda e o check
let ultimosTracos = [];           // v12.58: [{camada, tracejado}] do ultimo quadro, lido do canvas

let assinaturaLegenda = '';

/*
 * v12.34 — a legenda do conectoma em DOM. Reescreve o innerHTML so quando o conteudo muda (assinatura),
 * porque roda a cada quadro. No regime numerado lista "① Mesolímbica…"; nos demais, as camadas acesas com
 * a cor da camada. Cores vindas de dados entram como --cor (o tema claro as escurece), como nas pilulas.
 */
function atualizarLegendaConectoma(state, layout, vias, nuclei, totalCamadas) {
    const el = document.getElementById('legendaConectoma'); if (!el) return;
    const camadas = state.activeCircuitLayers || [];
    const sel = state.selectedNucleusId && nuclei[state.selectedNucleusId];
    const perfil = state.activePathologyProfile && state.activePathologyProfile !== 'none' && pathologyProfilesData[state.activePathologyProfile];
    const assinatura = [layout.regime, camadas.join(','), vias.map(v => v.id).join(','), state.selectedNucleusId || '', state.activePathologyProfile || '', state.dimensaoDeSintoma || '', state.isAtlasTheme ? 'c' : 'e'].join('|');
    if (assinatura === assinaturaLegenda) return;
    assinaturaLegenda = assinatura;
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    // v12.39 (Bloco 4): a legenda nomeia a LENTE — Fisiologia (perfil none) ou Fisiopatologia (um perfil). Na comparacao a
    // legenda nao aparece (os dois paineis tem os seus rotulos).
    const lenteFisiologia = '<b style="color: var(--ink-emerald-500);"><span class="marcador" style="--cor: var(--ink-emerald-500);"></span>Fisiologia</b> · ';
    let cabecalho = '';
    const dim = state.dimensaoDeSintoma && DIMENSOES_DE_SINTOMA[state.dimensaoDeSintoma];
    if (perfil) cabecalho = '<b class="ink" style="--cor: #f87171;">🧪 Fisiopatologia:</b> ' + esc(perfil.name)
        + (dim ? ' <span class="legenda-dimensao">· em foco: <b>' + esc(dim.rotulo) + '</b> (' + Object.keys(dim.vias).length + ' vias desviadas; as demais no traço normal)</span>' : '');
    else if (sel) cabecalho = lenteFisiologia + '<b style="color: var(--accent);">🎯 Núcleo:</b> ' + esc(sel.fullName) + ' <span style="color: var(--text-muted);">· clique fora para desmarcar</span>';
    else if (camadas.length === 0) cabecalho = lenteFisiologia + '<span style="color: var(--text-muted);">Nenhuma via ativa — marque no painel lateral</span>';
    else cabecalho = lenteFisiologia + '<b style="color: var(--accent);">' + (camadas.length === totalCamadas ? '🌐 Todas as camadas' : camadas.length + (camadas.length === 1 ? ' camada' : ' camadas')) + '</b> · ' + vias.length + (vias.length === 1 ? ' via acesa' : ' vias acesas')
        + (layout.regime === 'numerado' ? ' · números no mapa' : (layout.regime === 'legenda' ? ' · nomes só aqui (mais de 20 vias)' : ''));
    // v12.34.1: as camadas acesas (os sistemas — Dopamina, Serotonina...) aparecem em TODO regime. A barra pintada
    // antiga nomeava os sistemas; a legenda numerada da v12.34.0 listava so as vias — "sumiu neurotransmissores" (PO).
    const ui = (typeof CIRCUIT_LAYER_UI !== 'undefined') ? CIRCUIT_LAYER_UI : {};
    // v12.58: a forma separa sistema de circuito — redondo/continuo contra quadrado/tracejado.
    const itens = camadas.map(c => { const u = ui[c] || {}; const cor = u.borda || '#94a3b8'; const forma = ehCamadaDeSistema(c) ? '' : ' marcador--circuito'; return '<span class="legenda-item ink" style="--cor: ' + esc(cor) + ';"><span class="marcador' + forma + '" style="background: ' + esc(cor) + ';"></span>' + esc(u.rotulo || c) + '</span>'; }).join('');
    const temCircuito = camadas.some(c => !ehCamadaDeSistema(c));
    const chave = temCircuito ? '<div class="legenda-chave"><span class="marcador"></span>sistema (traço contínuo) · <span class="marcador marcador--circuito"></span>circuito (traço tracejado)</div>' : '';
    let itensVias = '';
    if (layout.regime === 'numerado') {
        itensVias = layout.vias.map(v => { const cor = (vias.find(x => x.id === v.id) || {}).cor || '#94a3b8'; return '<span class="legenda-item ink" style="--cor: ' + esc(cor) + ';"><span class="legenda-num" style="background: ' + esc(cor) + ';">' + v.numero + '</span>' + esc(v.texto) + '</span>'; }).join('');
    }
    el.innerHTML = '<div class="legenda-cabecalho">' + cabecalho + '</div>'
        + (itens ? '<div class="legenda-itens">' + itens + '</div>' : '') + chave
        + (itensVias ? '<div class="legenda-itens legenda-vias">' + itensVias + '</div>' : '');
}

function drawTractVectorArrow(ctx, x, y, angle, color, isBurst) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(isBurst ? 7 : 5, 0);
    ctx.lineTo(isBurst ? -6 : -4, isBurst ? -4 : -3);
    ctx.lineTo(isBurst ? -3 : -2, 0);
    ctx.lineTo(isBurst ? -6 : -4, isBurst ? 4 : 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

/*
 * v12.22.0 — o ponto de controle da bezier, calculado num lugar so.
 *
 * Os 71 tratos declaram arcY e arcX desde sempre, e o renderizador lia esses campos ZERO vezes:
 * todo arco entre os mesmos dois nos era desenhado com a mesma curvatura. O no 'pfc' tem 14
 * tratos saindo dele — catorze arcos identicos, catorze rotulos no mesmo ponto. Era essa a
 * "confusao de camadas sobrepostas".
 *
 * A expressao estava copiada em QUATRO lugares (curva fantasma, curva ativa, seta de fluxo e
 * rotulo). Copias soltas da mesma decisao: mexer numa e esquecer as outras faz a seta de fluxo
 * viajar fora da curva desenhada. Agora ha uma funcao e quatro chamadas.
 *
 * Os fatores sao proporcionais ao canvas (nao pixels fixos) para o leque abrir igual em qualquer
 * tamanho de tela. arcY vai de -3 a 5.5 e arcX de -1.5 a 2.5, entao o leque abre cerca de 0,26 da
 * altura e 0,08 da largura.
 */
function pontoDeControleDoArco(t, w, h) {
    return {
        cx: (t.from.x + t.to.x) / 2 + (t.arcX || 0) * w * 0.020,
        cy: Math.min(t.from.y, t.to.y) - 20 - (t.arcY || 0) * h * 0.030
    };
}

/*
 * v12.20 — a funcao passa a aceitar UM CANVAS e um punhado de sobrescritas de estado.
 * Sem argumentos ela se comporta exatamente como antes (desenha o #brainCanvas com o estado
 * real), entao nenhum chamador existente muda. Com argumentos, ela desenha o MESMO conectoma
 * noutro canvas fingindo outro estado — e e isso que torna a comparacao sadio x patologia
 * possivel sem duplicar uma linha de desenho.
 */
/*
 * v12.34: retangulos, em coordenadas do canvas, dos elementos [data-sobre-canvas] que o DOM sobrepoe ao desenho
 * (legenda do conectoma, osciloscopio flutuante, cracha do viewport). O posicionador de rotulos os recebe como
 * area reservada. O buffer do brainCanvas tem o tamanho CSS do pai (canvas.width = clientWidth), logo a escala
 * e 1:1 hoje; a divisao fica para o dia em que deixar de ser. Elementos escondidos medem 0x0 e saem.
 */
function areasReservadasSobre(canvas) {
    if (typeof document === 'undefined' || !canvas || typeof canvas.getBoundingClientRect !== 'function') return [];
    const rc = canvas.getBoundingClientRect();
    if (!rc.width || !rc.height) return [];
    const sx = canvas.width / rc.width, sy = canvas.height / rc.height;
    const out = [];
    document.querySelectorAll('[data-sobre-canvas]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const x1 = (r.left - rc.left) * sx, y1 = (r.top - rc.top) * sy, x2 = (r.right - rc.left) * sx, y2 = (r.bottom - rc.top) * sy;
        if (x2 <= 0 || y2 <= 0 || x1 >= canvas.width || y1 >= canvas.height) return;   // nao esta sobre este canvas
        out.push({ x1: Math.round(x1), y1: Math.round(y1), x2: Math.round(x2), y2: Math.round(y2) });
    });
    return out;
}

function drawBrainCircuits2D(canvasAlvo, sobrescritas, congelarPulso) {
    const canvas = canvasAlvo || document.getElementById('brainCanvas');
    const base = store.getState();
    const state = sobrescritas ? Object.assign({}, base, sobrescritas) : base;
    if (!canvas || state.visualScale !== 'brain2d') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.parentElement.clientWidth || 800;
    const h = canvas.parentElement.clientHeight || 500;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    const isDark = !state.isAtlasTheme;

    if (!canvasAlvo) ultimosRotulos = [];   // v12.34: so o conectoma principal e medido (o painel duplo passa canvasAlvo)

    // Increment pulse animation offset on every frame
    const baseSpeed = state.apActive ? 2.4 : 0.65;
    const speedMultiplier = (state.axonSpeed || 1.0) * baseSpeed;
    // v12.20.0: no painel duplo a funcao roda duas vezes por quadro. Sem esta trava o
    // pulso andaria em dobro — a animacao ficaria 2x mais rapida so por comparar.
    if (!congelarPulso) brainPulseOffset = (brainPulseOffset + speedMultiplier) % 1000;

    // 1. Draw Sagittal Brain Outline Profile
    ctx.fillStyle = isDark ? "rgba(11, 19, 41, 0.92)" : "#f8fafc";
    ctx.strokeStyle = isDark ? "rgba(56, 189, 248, 0.55)" : "#0284c7";
    ctx.lineWidth = 3.0;

    ctx.beginPath();
    ctx.moveTo(w * 0.18, h * 0.48);
    ctx.bezierCurveTo(w * 0.15, h * 0.25, w * 0.35, h * 0.12, w * 0.55, h * 0.12);
    ctx.bezierCurveTo(w * 0.78, h * 0.12, w * 0.88, h * 0.30, w * 0.85, h * 0.50);
    ctx.bezierCurveTo(w * 0.85, h * 0.65, w * 0.78, h * 0.78, w * 0.70, h * 0.80);
    ctx.bezierCurveTo(w * 0.62, h * 0.82, w * 0.58, h * 0.90, w * 0.55, h * 0.95);
    ctx.lineTo(w * 0.50, h * 0.95);
    ctx.bezierCurveTo(w * 0.48, h * 0.78, w * 0.45, h * 0.70, w * 0.40, h * 0.65);
    ctx.bezierCurveTo(w * 0.28, h * 0.68, w * 0.20, h * 0.60, w * 0.18, h * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Corpus Callosum arch
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.15)" : "#cbd5e1";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(w * 0.48, h * 0.45, 60, Math.PI, 0, false);
    ctx.stroke();

    // 2. Define Comprehensive Canonical Anatomical Nuclei Coordinates
                const nuclei = nuclei2DFor(w, h); // v12.0: derivado de nucleiCatalog

    const tracts = tracts2DFor(nuclei); // v12.0: derivado de tractsCatalog

    const activeNucleiSet = new Set();
    const activeLayers = state.activeCircuitLayers || [];

                const subList = state.activeSubTracts || [];
    // First pass: Draw Inactive ghost tracts (considering selected nucleus and active sub-tracts)
    tracts.forEach(t => {
        // v12.56: o filtro e' da camada — filtrar sub-vias do glutamato nao pode apagar a dopamina.
        let isSelected = activeLayers.includes(t.type) && viaVisivel(subList, t.type, t.subId);
        if (state.selectedNucleusId) {
            isSelected = isSelected && (t.from.id === state.selectedNucleusId || t.to.id === state.selectedNucleusId);
        }

        if (!isSelected) {
            ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)";
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(t.from.x, t.from.y);
            (function(){ const c = pontoDeControleDoArco(t, w, h); ctx.quadraticCurveTo(c.cx, c.cy, t.to.x, t.to.y); })();
            ctx.stroke();
        } else {
            activeNucleiSet.add(t.from.id);
            activeNucleiSet.add(t.to.id);
        }
    });

    const rotulosPendentes = [];   // v12.22.0: coletados no laco, afastados e desenhados depois
    const tracosDoQuadro = [];     // v12.58: o que este quadro tracejou, lido do proprio ctx (para o check e a trava)

    /*
     * v12.28.0 -- consulta ao mapa de vias que cada perfil de patologia declara em store.js.
     * Ate a v12.20 a patologia mexia apenas no `stimSpeedMult` e na legenda: 0,03% do desenho, e
     * a unica diferenca era temporal, entao sumia num print de slide. Agora ela muda o traco.
     */
    const vias = (typeof desvioDaVia === 'function') ? desvioDaVia : () => null;

    // Second pass: Draw Active Glowing Tracts
    tracts.forEach(t => {
        // v12.56: o filtro e da camada — filtrar sub-vias do glutamato nao pode apagar a dopamina.
        let isSelected = activeLayers.includes(t.type) && viaVisivel(subList, t.type, t.subId);
        if (state.selectedNucleusId) {
            isSelected = isSelected && (t.from.id === state.selectedNucleusId || t.to.id === state.selectedNucleusId);
        }
        if (!isSelected) return;

        const desvio = vias(state.activePathologyProfile, t.subId, state.dimensaoDeSintoma);
        const larguraBase = state.selectedNucleusId ? 4.8 : (activeLayers.length >= 8 ? 2.2 : 4.2);

        ctx.strokeStyle = t.color;
        // v12.58: a forma do traço diz a NATUREZA da camada (a cor ficou com os sistemas). Sistema, contínuo;
        // circuito, tracejado. O risco acompanha a espessura para o tracejado da via 'hiper' não virar corrente.
        const daSistema = ehCamadaDeSistema(t.type);
        ctx.lineWidth = desvio === 'hiper' ? larguraBase * 2.2
                      : desvio === 'hipo'  ? larguraBase * 0.30
                      : larguraBase;
        ctx.setLineDash(daSistema ? [] : TRACO_DO_CIRCUITO.map(n => n * Math.max(1, ctx.lineWidth / larguraBase)));
        // a via silenciada precisa APAGAR, e nao apenas afinar -- so espessura nao le num slide
        ctx.globalAlpha = desvio === 'hipo' ? 0.20 : 1.0;
        ctx.shadowColor = t.color;
        ctx.shadowBlur = desvio === 'hiper' ? 30 : (desvio === 'hipo' ? 0 : 14);
        ctx.beginPath();
        ctx.moveTo(t.from.x, t.from.y);
        (function(){ const c = pontoDeControleDoArco(t, w, h); ctx.quadraticCurveTo(c.cx, c.cy, t.to.x, t.to.y); })();
        ctx.stroke();
        // o registro do quadro guarda o que o CANVAS diz, nao o que o codigo quis: getLineDash le' o estado real.
        tracosDoQuadro.push({ camada: t.type, tracejado: ctx.getLineDash().length > 0, largura: ctx.lineWidth });
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Frequency-Adjusted Traveling Action Potential Pulses
        let stimSpeedMult = 1.0;
        if (state.neurostimProtocol === 'rtms_10hz_dlpfc') stimSpeedMult = 2.4;
        else if (state.neurostimProtocol === 'rtms_1hz_sma') stimSpeedMult = 0.5;
        else if (state.neurostimProtocol === 'dbs_130hz_cg25' || state.neurostimProtocol === 'dbs_130hz_alic') stimSpeedMult = 3.5;
        else if (state.neurostimProtocol === 'opto_inhibit_lhb') stimSpeedMult = 1.8;
        /*
         * v12.28.0 -- a velocidade do pulso sai do MESMO mapa que a espessura. Antes eram dois
         * blocos paralelos: aqui por CAMADA (todo dopaminergico acelera na mania), no texto por
         * VIA. O app podia afirmar duas coisas -- o defeito das alcas CSTC e das colaterais de
         * Schaffer. Uma fonte so, e a contradicao deixa de ser possivel.
         */
        else if (desvio === 'hiper') stimSpeedMult = 3.0;
        else if (desvio === 'hipo') stimSpeedMult = 0.4;

        // Multi-Vector Flow Stream along Axonal Tract
        const isBurst = state.apActive;
        const c = pontoDeControleDoArco(t, w, h);
        const midX = c.cx, midY = c.cy;   // o pulso anda sobre a MESMA curva que foi desenhada
        const numVectors = isBurst ? 4 : 3;

        for (let k = 0; k < numVectors; k++) {
            const stepOffset = k * (1.0 / numVectors);
            const tNorm = ((brainPulseOffset * 0.008 * stimSpeedMult + stepOffset) % 1.0);

            // Position along Quadratic Bezier: B(t) = (1-t)^2 P0 + 2(1-t)t Pmid + t^2 P1
            const qx = (1 - tNorm) * (1 - tNorm) * t.from.x + 2 * (1 - tNorm) * tNorm * midX + tNorm * tNorm * t.to.x;
            const qy = (1 - tNorm) * (1 - tNorm) * t.from.y + 2 * (1 - tNorm) * tNorm * midY + tNorm * tNorm * t.to.y;

            // Tangent Vector: B'(t) = 2(1-t)(Pmid - P0) + 2t(P1 - Pmid)
            const dx = 2 * (1 - tNorm) * (midX - t.from.x) + 2 * tNorm * (t.to.x - midX);
            const dy = 2 * (1 - tNorm) * (midY - t.from.y) + 2 * tNorm * (t.to.y - midY);
            const angle = Math.atan2(dy, dx);

            drawTractVectorArrow(ctx, qx, qy, angle, t.color, isBurst);
        }

        // v12.34: TODA via acesa entra na lista; o regime (texto / numerado / legenda) e decidido por
        // posicionarRotulos, nao por um portao de "ate 3 camadas" — o portao escondia 93 vias sem nome.
        (function(){ const cr = pontoDeControleDoArco(t, w, h);
            rotulosPendentes.push({ id: t.subId, texto: (typeof rotuloCurtoDaVia === 'function') ? rotuloCurtoDaVia(t) : t.label, completo: t.label, cor: t.color,
                x: cr.cx, y: (cr.cy + (t.from.y + t.to.y) / 2) / 2 }); })();
        ctx.globalAlpha = 1.0;   // v12.28.0: o apagamento do desvio nao vaza para o proximo trato
    });

    /*
     * v12.34 — POSICIONAMENTO DOS ROTULOS (Fase 4.2 do roadmap). A geometria e de posicionarRotulos
     * (engine.js), pura e testada em Node; aqui so se mede o texto com a fonte real e se desenha o
     * resultado. Nucleos primeiro, TODOS, acesos ou nao: o layout anatomico nao muda quando uma camada
     * acende. Medido antes, em 02/09/2026 (tres sistemas a 899x482): 18 pares sobrepostos, 11 deles via
     * cobrindo nucleo; com tudo aceso, 23 pares de nucleos e 93 vias sem nome (o portao de 3 camadas).
     * Quem nao cabe vai para a calha (faixas laterais vazias) com linha de chamada, ou para a legenda.
     */
    const totalCamadas = Object.keys(canonicalSubTractsData).length;
    const nucleoAceso = (id) => state.selectedNucleusId
        ? (id === state.selectedNucleusId || activeNucleiSet.has(id))
        : (activeLayers.length === totalCamadas || activeNucleiSet.has(id));   // v12.34: era `=== 13`
    // v12.52 (D5): os rotulos do conectoma crescem com o fator de projecao, como o resto do palco.
    const escalaUI = fatorDeEscalaUI();
    const px = (n) => (n * escalaUI).toFixed(1);
    const FONTE_NUCLEO = `bold ${px(8.5)}px sans-serif`, FONTE_VIA = `bold ${px(8)}px sans-serif`, FONTE_NUMERO = `bold ${px(9)}px sans-serif`;
    const medirTexto = (texto, tipo) => {
        if (tipo === 'numero') return { w: Math.round(16 * escalaUI), h: Math.round(16 * escalaUI) };
        ctx.font = tipo === 'nucleo' ? FONTE_NUCLEO : FONTE_VIA;
        return { w: Math.ceil(ctx.measureText(texto).width) + (tipo === 'nucleo' ? 6 : 8), h: tipo === 'nucleo' ? 12 : 14 };
    };
    const debugRotulos = (typeof location !== 'undefined') && /[?&]labels=debug/.test(location.search || '');   // as travas rodam sem location
    // v12.34: o que o DOM poe por cima do canvas e area reservada — nenhuma caixa nem vaga de calha cai debaixo.
    // A primeira captura de referencia desta versao mostrou a legenda tapando tres nucleos do tronco: o que nao esta
    // no desenho tem que estar no texto, nao debaixo dele. Nas copias (comparar, PNG) nao ha DOM por cima.
    const reservadas = canvasAlvo ? [] : areasReservadasSobre(canvas);
    const layout = posicionarRotulos({
        largura: w, altura: h, medir: medirTexto, debug: debugRotulos, reservadas,
        nucleos: Object.values(nuclei).map(n => ({ id: n.id, texto: n.label, x: n.x, y: n.y, aceso: nucleoAceso(n.id) })),
        vias: rotulosPendentes
    });
    const corDaVia = Object.fromEntries(rotulosPendentes.map(r => [r.id, r.cor]));
    if (!canvasAlvo) { ultimoLayoutRotulos = layout; ultimosTracos = tracosDoQuadro; }
    const linhaDeChamada = (de, caixa, cor) => {
        ctx.strokeStyle = cor; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(de.x, de.y);
        const px = de.x < caixa.x1 ? caixa.x1 : (de.x > caixa.x2 ? caixa.x2 : (caixa.x1 + caixa.x2) / 2);
        ctx.lineTo(px, (caixa.y1 + caixa.y2) / 2); ctx.stroke(); ctx.setLineDash([]);
    };
    if (debugRotulos) {   // ?labels=debug: todos os candidatos avaliados a 15%, o aceito destacado
        for (const item of [...layout.nucleos, ...layout.vias]) {
            for (const c of item.candidatos || []) { ctx.fillStyle = "rgba(56, 189, 248, 0.15)"; ctx.fillRect(c.x1, c.y1, c.x2 - c.x1, c.y2 - c.y1); }
            if (item.modo !== 'oculto') { ctx.strokeStyle = item.modo === 'forcado' ? '#ef4444' : '#22c55e'; ctx.lineWidth = 1; ctx.strokeRect(item.x1 - 1, item.y1 - 1, item.x2 - item.x1 + 2, item.y2 - item.y1 + 2); }
        }
    }
    // rotulos de VIA: antes dos nucleos, para o ponto do nucleo ficar por cima
    for (const v of layout.vias) {
        if (v.modo === 'oculto') continue;
        const cor = corDaVia[v.id] || '#94a3b8';
        if (v.de) linhaDeChamada(v.de, v, cor);
        if (v.modo === 'numero') {
            const cx = (v.x1 + v.x2) / 2, cy = (v.y1 + v.y2) / 2;
            ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 2 * Math.PI); ctx.fill();
            ctx.strokeStyle = isDark ? "#020617" : "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = "#ffffff"; ctx.font = FONTE_VIA; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(String(v.numero), cx, cy + 0.5); ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
        } else {
            ctx.fillStyle = isDark ? "rgba(15, 23, 42, 0.90)" : "#ffffff";
            ctx.fillRect(v.x1, v.y1, v.x2 - v.x1, v.y2 - v.y1);
            ctx.strokeStyle = cor; ctx.lineWidth = 1; ctx.strokeRect(v.x1, v.y1, v.x2 - v.x1, v.y2 - v.y1);
            ctx.fillStyle = cor; ctx.font = FONTE_VIA; ctx.textAlign = "center";
            ctx.fillText(v.rotulo, (v.x1 + v.x2) / 2, v.y2 - 4); ctx.textAlign = "start";
        }
        if (!canvasAlvo) ultimosRotulos.push({ tipo: 'via', texto: v.texto, x1: v.x1, y1: v.y1, x2: v.x2, y2: v.y2 });
    }
    // Nucleos: o no como antes; o ROTULO na caixa que a geometria decidiu (antes: x+10, sem colisao)
    const caixaDoNucleo = Object.fromEntries(layout.nucleos.map(n => [n.id, n]));
    for (let k in nuclei) {
        const n = nuclei[k];
        const isSelectedNucleus = state.selectedNucleusId === n.id;
        const isActive = nucleoAceso(n.id);

        if (isSelectedNucleus) {
            const pulseRing = 12 + Math.sin(Date.now() * 0.008) * 3;
            ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.5; ctx.shadowColor = "#38bdf8"; ctx.shadowBlur = 18;
            ctx.beginPath(); ctx.arc(n.x, n.y, pulseRing, 0, 2 * Math.PI); ctx.stroke(); ctx.shadowBlur = 0;
        }

        if (isActive) {
            ctx.fillStyle = n.color; ctx.shadowColor = n.color; ctx.shadowBlur = isSelectedNucleus ? 20 : 14;
            ctx.beginPath(); ctx.arc(n.x, n.y, isSelectedNucleus ? 9.5 : 7.5, 0, 2 * Math.PI); ctx.fill(); ctx.shadowBlur = 0;
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = isSelectedNucleus ? 2.5 : 1.6; ctx.stroke();
            const cx = caixaDoNucleo[n.id];
            if (cx) {
                if (cx.de) linhaDeChamada(cx.de, cx, isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(15, 23, 42, 0.45)");
                ctx.fillStyle = isSelectedNucleus ? "#38bdf8" : (isDark ? "#ffffff" : "#0f172a");
                ctx.font = FONTE_NUCLEO;
                ctx.fillText(n.label, cx.x1 + 3, cx.y2 - 3);
                if (!canvasAlvo) ultimosRotulos.push({ tipo: 'nucleo', texto: n.label, x1: cx.x1, y1: cx.y1, x2: cx.x2, y2: cx.y2 });
            }
        } else {
            ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
            ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, 2 * Math.PI); ctx.fill();
        }
    }
                // Draw Virtual Neurostimulation Devices (TMS Coils, DBS Electrodes, Optogenetics)
    if (state.neurostimProtocol !== 'off') {
        const nowTime = Date.now();
        const stimPulse = Math.sin(nowTime * 0.015);

        if (state.neurostimProtocol === 'rtms_10hz_dlpfc' && nuclei.pfc) {
            // Draw TMS Figure-8 Coil over DLPFC
            const cx = nuclei.pfc.x - 10;
            const cy = nuclei.pfc.y - 35;
            
            ctx.save();
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 3.5;
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 18;
            
            // Left loop
            ctx.beginPath();
            ctx.arc(cx - 12, cy, 14, 0, 2 * Math.PI);
            ctx.stroke();
            // Right loop
            ctx.beginPath();
            ctx.arc(cx + 12, cy, 14, 0, 2 * Math.PI);
            ctx.stroke();

            // Magnetic Field Arc Lines penetrating into cortex
            const waveR = 20 + (nowTime * 0.04 % 30);
            ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 1 - waveR / 50)})`;
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.arc(cx, cy, waveR, Math.PI * 0.2, Math.PI * 0.8);
            ctx.stroke();

            // Label
            ctx.fillStyle = "#38bdf8";
            ctx.font = FONTE_NUMERO;
            ctx.fillText("🧲 Bobina EMT (10 Hz)", cx - 45, cy - 20);
            ctx.restore();
        } else if (state.neurostimProtocol === 'rtms_1hz_sma' && nuclei.ctx_post) {
            // Draw Inhibitory TMS Coil over SMA
            const cx = nuclei.ctx_post.x;
            const cy = nuclei.ctx_post.y - 32;

            ctx.save();
            ctx.strokeStyle = "#eab308";
            ctx.lineWidth = 3.5;
            ctx.shadowColor = "#eab308";
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.arc(cx - 10, cy, 12, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx + 10, cy, 12, 0, 2 * Math.PI);
            ctx.stroke();

            // Slow inhibitory waves
            const waveR = 15 + (nowTime * 0.01 % 25);
            ctx.strokeStyle = `rgba(234, 179, 8, ${Math.max(0, 1 - waveR / 40)})`;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(cx, cy, waveR, Math.PI * 0.2, Math.PI * 0.8);
            ctx.stroke();

            ctx.fillStyle = "#eab308";
            ctx.font = FONTE_NUMERO;
            ctx.fillText("🧲 EMT Inibitória (1 Hz)", cx - 45, cy - 18);
            ctx.restore();
        } else if ((state.neurostimProtocol === 'dbs_130hz_cg25' || state.neurostimProtocol === 'dbs_130hz_alic')) {
            const targetNode = state.neurostimProtocol === 'dbs_130hz_cg25' ? nuclei.vmpfc : nuclei.accumbens;
            if (targetNode) {
                // Draw DBS Lead Shafty wire from top of skull into target
                ctx.save();
                ctx.strokeStyle = "#f8fafc";
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                ctx.moveTo(targetNode.x + 30, h * 0.08); // Entry burr hole
                ctx.lineTo(targetNode.x, targetNode.y);
                ctx.stroke();

                // Quadripolar Contact rings at tip
                for (let c = 0; c < 4; c++) {
                    const contY = targetNode.y - c * 5;
                    ctx.fillStyle = c % 2 === 0 ? "#38bdf8" : "#94a3b8";
                    ctx.fillRect(targetNode.x - 2, contY - 2, 4, 3);
                }

                // High Frequency 130 Hz Electric Sparks Field
                const sparkR = 10 + (nowTime * 0.08 % 20);
                ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 0.9 - sparkR / 25)})`;
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                ctx.arc(targetNode.x, targetNode.y, sparkR, 0, 2 * Math.PI);
                ctx.stroke();

                ctx.fillStyle = "#38bdf8";
                ctx.font = FONTE_NUMERO;
                ctx.fillText(`📍 Eletrodo DBS (130 Hz - ${targetNode.label})`, targetNode.x - 60, targetNode.y - 18);
                ctx.restore();
            }
        } else if (state.neurostimProtocol === 'opto_inhibit_lhb' && nuclei.habenula) {
            // Draw Optogenetic Fiber Optic Yellow Laser (590 nm)
            ctx.save();
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            ctx.moveTo(nuclei.habenula.x + 20, h * 0.08);
            ctx.lineTo(nuclei.habenula.x, nuclei.habenula.y);
            ctx.stroke();

            // Yellow Laser Light Cone illuminating LHb
            ctx.fillStyle = "rgba(250, 204, 21, 0.35)";
            ctx.shadowColor = "#facc15";
            ctx.shadowBlur = 24;
            ctx.beginPath();
            ctx.moveTo(nuclei.habenula.x, nuclei.habenula.y);
            ctx.arc(nuclei.habenula.x, nuclei.habenula.y, 22, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = "#facc15";
            ctx.font = FONTE_NUMERO;
            ctx.fillText("💡 Laser NpHR 590 nm (Inibição LHb)", nuclei.habenula.x - 65, nuclei.habenula.y - 22);
            ctx.restore();
        }
    }

    // v12.34 — a legenda sai do canvas e vai para o DOM (#legendaConectoma): texto completo, em portugues,
    // sempre visivel e gravado no video. E ela que carrega o que nao coube no canvas (regimes numerado e
    // legenda). A faixa pintada ("Combinação Ativa: ... DOPAMINE + SEROTONIN") era imagem, e em ingles.
    if (!canvasAlvo) atualizarLegendaConectoma(state, layout, rotulosPendentes, nuclei, totalCamadas);
}


// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { CIRCUIT_FAMILIES, CIRCUIT_LAYER_UI, CIRCUIT_PRESETS, DIMENSOES_DE_SINTOMA, atualizarTooltipFixado,
    brain3DGroup, brain3DNucleiMeshes, brainCircuitsData, buildWholeBrain3D, camadaFiltrada, canonicalSubTractsData,
    circuitTargets, circuitTargetsForaDaOntologia, circuitsForTarget, definirBrain3DGroup, drawBrainCircuits2D,
    familiasDeCamadas, hideConnectomeTooltip, limiteDaCamada, modoDeVisaoDasCamadas, neurostimProtocolsData,
    nuclei2DFor, nucleiCatalog, nucleiClinicalData, onBrainCanvasClick, onBrainCanvasMouseMove, pathologyProfilesData,
    showConnectomeTooltip, tractsCatalog, ultimoLayoutRotulos, ultimosRotulos, ultimosTracos,
    update3DBrainTractsVisibility };
// ── fim do exporta ──
