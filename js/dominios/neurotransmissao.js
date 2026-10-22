// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import '../dominios/psicofarmacos.js?v=12.66.0';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { TARGETS_CANON_VERSION } from '../targets.js?v=12.66.0';
import { receptoresDoSistema, systemsData } from '../data.js?v=12.66.0';
import { drugBindingAffinities, farmacoAcoplado } from '../dominios/psicofarmacos.js?v=12.66.0';
import { store } from '../store.js?v=12.66.0';
import { escapeHtml } from '../features.js?v=12.66.0';
import { playBioTone, relogioSimulacao } from '../engine.js?v=12.66.0';
import { clockDelta } from '../render3d.js?v=12.66.0';
// ── fim dos módulos ──
/*
 * DOMINIO NEUROTRANSMISSAO — um palco inteiro num arquivo so (decisao D3 do autor, "pastas por dominio").
 *
 * Ate a v12.47 este codigo morava espalhado por 5 arquivo(s) organizados por CAMADA
 * (data.js, features.js, engine.js, render3d.js, render2d.js): quem quisesse mexer neste palco procurava em todos.
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

// Patient Psychoeducation Stories
// Ciclos bioquímicos por sistema (origem: src/data/biochemicalCycles.ts + ecb/opioid/adenosine escritos na v10.2)
const biochemicalCyclesData = {
  da: {
    validado_em: '2026-08-31',
    title: "🟣 Ciclo Bioquímico das Catecolaminas (Dopamina & Noradrenalina)",
    precursors: "L-Fenilalanina ➔ L-Tirosina",
    steps: [
      { step: "1. Hidroxilação", enzyme: "Tirosina Hidroxilase (TH)", cofactor: "Tetraidrobiopterina (BH4), Fe²⁺, O₂", reaction: "L-Tirosina ➔ L-DOPA", note: "Etapa limitante da síntese de catecolaminas. Inibida por feedback negativo pela DA e ativada por fosforilação via PKA/CaMKII." },
      { step: "2. Descarboxilação", enzyme: "DOPA Descarboxilase / AADC", cofactor: "Piridoxal-5-Fosfato (Vitamina B6)", reaction: "L-DOPA ➔ Dopamina", note: "Conversão citoplasmática ultrarrápida. Alvo da Carbidopa e Benserazida (inibidores periféricos para tratar Parkinson)." },
      { step: "3. Empacotamento", enzyme: "VMAT-2 (Transportador Vesicular 2)", cofactor: "Gradiente de prótons H⁺ (V-ATPase)", reaction: "Dopamina (Citosol) ➔ Vesícula Sináptica", note: "Concentra DA em ~100 mM dentro da vesícula. Alvo da Tetrabenazina e Valbenazina (coreia e discinesia tardia)." },
      { step: "4. Conversão a NE", enzyme: "Dopamina β-Hidroxilase (DBH)", cofactor: "Ácido Ascórbico (Vit C), Cu²⁺, O₂", reaction: "Dopamina ➔ Noradrenalina", note: "Localizada exclusivamente dentro da membrana vesicular de neurônios noradrenérgicos." },
      { step: "5. Degradação MAO", enzyme: "Monoamina Oxidase A e B (MAO-A/B)", cofactor: "FAD (Membrana externa mitocondrial)", reaction: "Dopamina ➔ DOPAC / NE ➔ DHPG", note: "Desaminação oxidativa mitocondrial. Alvo da Tranilcipromina, Selegilina e Moclobemida." },
      { step: "6. Degradação COMT", enzyme: "Catecol-O-Metiltransferase (COMT)", cofactor: "S-Adenosilmetionina (SAMe), Mg²⁺", reaction: "DOPAC ➔ HVA (Ácido Homovanílico)", note: "Metilação de catecois pós-sináptica e glial. Alvo do Entacapone e Tolcapone no Parkinson." }
    ],
    clinicalSignificance: "O polimorfismo COMT Val158Met modula diretamente a disponibilidade de dopamina no córtex pré-frontal, influenciando a flexibilidade cognitiva e a vulnerabilidade à esquizofrenia."
  },
  '5ht': {
    validado_em: '2026-08-31',
    title: "🔴 Ciclo Bioquímico das Indolaminas (Serotonina & Melatonina)",
    precursors: "L-Triptofano (Aminoácido Essencial da Dieta)",
    steps: [
      { step: "1. Hidroxilação", enzyme: "Triptofano Hidroxilase 2 (TPH2)", cofactor: "BH4, Fe²⁺, O₂", reaction: "L-Triptofano ➔ 5-HTP (5-Hidroxitriptofano)", note: "Etapa limitante da síntese no SNC (TPH2 neuronal vs TPH1 periférico intestinal)." },
      { step: "2. Descarboxilação", enzyme: "Aromatic L-amino acid decarboxylase (AADC)", cofactor: "Vitamina B6 (PLP)", reaction: "5-HTP ➔ Serotonina (5-HT)", note: "Descarboxilação no botão terminal da rafe." },
      { step: "3. Empacotamento", enzyme: "VMAT-2", cofactor: "Gradiente de prótons H⁺", reaction: "5-HT ➔ Vesícula Sináptica", note: "Protege a serotonina da degradação imediata pela MAO-A citosólica." },
      { step: "4. Degradação MAO-A", enzyme: "MAO-A Mitocondrial + Aldeído Desidrogenase", cofactor: "FAD + NAD⁺", reaction: "5-HT ➔ 5-HIAA (Ácido 5-Hidroxi-indolacético)", note: "O 5-HIAA no líquor é um biomarcador clássico de turnover serotoninérgico e impulsividade/suicídio." },
      { step: "5. Conversão Pineal", enzyme: "AANAT ➔ ASMT", cofactor: "Acetil-CoA + SAMe", reaction: "5-HT ➔ N-Acetilserotonina ➔ Melatonina", note: "Ritmo circadiano sincronizado pelo Núcleo Supraquiasmático (alvo da Agomelatina)." }
    ],
    clinicalSignificance: "A depleção aguda de triptofano na dieta reduz drasticamente a síntese de 5-HT em poucas horas, provocando recidiva transitória de sintomas depressivos em pacientes vulneráveis."
  },
  glu: {
    validado_em: '2026-08-31',
    title: "🟡 Ciclo Glutamato - Glutamina - GABA (Sinapse Tripartite)",
    precursors: "Glicose / Ciclo de Krebs (α-Cetoglutarato) & Glutamina Astrocitária",
    steps: [
      { step: "1. Captação Glial", enzyme: "EAAT2 / GLT-1 (Astrócito)", cofactor: "3 Na⁺ + 1 H⁺ (Eletrogênico)", reaction: "Glutamato (Fenda) ➔ Astrócito", note: "Remove o glutamato em <1 ms para prevenir excitotoxicidade neuronal." },
      { step: "2. Amidação", enzyme: "Glutamina Sintetase (GS)", cofactor: "ATP, Mg²⁺, NH₄⁺", reaction: "Glutamato + Amônia ➔ Glutamina", note: "Neutraliza o glutamato neurotóxico em glutamina não-tóxica exclusivamente no astrócito." },
      { step: "3. Shuttle Glial-Neuronal", enzyme: "Transportadores SNAT3/5 ➔ SNAT1/2", cofactor: "Gradientes de Na⁺ / H⁺", reaction: "Glutamina (Astrócito) ➔ Neurônio", note: "Exportação astrocitária e recaptação pelo botão pré-sináptico." },
      { step: "4. Hidrólise Neuronal", enzyme: "Glutaminase Ativada por Fosfato (PAG / GLS)", cofactor: "Fosfato Inorgânico (Pi)", reaction: "Glutamina ➔ Glutamato", note: "Restaura o pool de neurotransmissor excitatório dentro da terminação nervosa." },
      { step: "5. Conversão a GABA", enzyme: "Glutamato Descarboxilase (GAD65 / GAD67)", cofactor: "Vitamina B6 (Piridoxal Fosfato)", reaction: "Glutamato ➔ GABA (em neurônios GABAérgicos)", note: "GAD65 ancorada na vesícula para síntese sob demanda; GAD67 citoplasmática para tônus basal." },
      { step: "6. Degradação GABA", enzyme: "GABA-Transaminase (GABA-T) + SSADH", cofactor: "α-Cetoglutarato ➔ Succinato", reaction: "GABA ➔ Semialdeído Sucínico ➔ Ciclo de Krebs", note: "Inibida irreversivelmente pela Vigabatrina e modulada pelo Valproato." }
    ],
    clinicalSignificance: "A disfunção de EAAT2 na glia causa acúmulo extracelular de glutamato, hiperexcitabilidade, influxo maciço de cálcio e morte neuronal em ELA, isquemia cerebral e depressão severa."
  },
  gaba: {
    validado_em: '2026-08-31',
    title: "🟢 Ciclo GABAérgico & Inibição Sináptica/Tônica",
    precursors: "Glutamato (via GAD) & Ciclo de Krebs",
    steps: [
      { step: "1. Síntese", enzyme: "GAD65 / GAD67", cofactor: "Vitamina B6", reaction: "Glutamato ➔ GABA", note: "GAD65 sintetiza GABA para exocitose fásica rápida; GAD67 para o tônus inibitório basal." },
      { step: "2. Empacotamento", enzyme: "VGAT / VIAAT", cofactor: "Gradiente de prótons H⁺", reaction: "GABA ➔ Vesícula Sináptica", note: "Transportador vesicular comum para GABA e Glicina." },
      { step: "3. Recaptação", enzyme: "GAT-1 / GAT-3", cofactor: "2 Na⁺ + 1 Cl⁻", reaction: "GABA (Fenda) ➔ Neurônio / Glia", note: "Alvo da Tiagabina (anticonvulsivante inibidor de GAT-1)." },
      { step: "4. Degradação", enzyme: "GABA-T Mitocondrial", cofactor: "α-Cetoglutarato", reaction: "GABA ➔ Semialdeído Sucínico", note: "Alvo da Vigabatrina (aumenta níveis cerebrais de GABA)." }
    ],
    clinicalSignificance: "O déficit de atividade GAD67 em interneurônios parvalbumina-positivos (PV) desinibe os neurônios piramidais, gerando assincronia cortical e sintomas cognitivos na esquizofrenia."
  },
  ne: {
    validado_em: '2026-08-31',
    title: "🔵 Ciclo da Noradrenalina & Modulação do Locus Coeruleus",
    precursors: "Dopamina vesicular (via DBH)",
    steps: [
      { step: "1. Síntese Intravesicular", enzyme: "Dopamina β-Hidroxilase (DBH)", cofactor: "Vitamina C + Cobre (Cu²⁺)", reaction: "Dopamina ➔ Noradrenalina", note: "Ocorre exclusivamente dentro das vesículas maduras do Locus Coeruleus." },
      { step: "2. Recaptação", enzyme: "NET (SLC6A2)", cofactor: "2 Na⁺ + 1 Cl⁻", reaction: "NE (Fenda) ➔ Terminal Pré-Sináptico", note: "Alvo de Reboxetina, Atomoxetina, Nortriptilina e IRSNs." },
      { step: "3. Degradação", enzyme: "MAO-A & COMT", cofactor: "SAMe + FAD", reaction: "NE ➔ VMA / MHPG", note: "Metabólitos excretados na urina refletem o tônus simpático e central." }
    ],
    clinicalSignificance: "No Transtorno de Pânico e TEPT, há hiperreatividade de descarga do Locus Coeruleus; agonistas α2 como a Clonidina e Guanfacina acionam o feedback inibitório pré-sináptico acalmando o circuito."
  },
  ach: {
    validado_em: '2026-08-31',
    title: "🟠 Ciclo Colinérgico & Degradação Ultrarrápida por AChE",
    precursors: "Colina (Dieta/Recaptação) + Acetil-CoA (Mitocôndria)",
    steps: [
      { step: "1. Recaptação de Colina", enzyme: "CHT1 (High-Affinity Choline Transporter)", cofactor: "Co-transporte com Na⁺", reaction: "Colina (Extracelular) ➔ Citosol Neuronal", note: "Etapa limitante da síntese de acetilcolina. Inibida experimentalmente pelo Hemicolínio-3." },
      { step: "2. Síntese Enzimática", enzyme: "Colina Acetiltransferase (ChAT)", cofactor: "Acetil-CoA mitocondrial", reaction: "Colina + Acetil-CoA ➔ Acetilcolina + CoASH", note: "Enzima marcadora seletiva de neurônios colinérgicos (Núcleo Basal de Meynert e Striatum)." },
      { step: "3. Empacotamento", enzyme: "VAChT (Vesicular ACh Transporter)", cofactor: "Gradiente de H⁺", reaction: "Acetilcolina ➔ Vesícula Sináptica", note: "Alvo farmacológico do Vesamicol." },
      { step: "4. Hidrólise Extracelular", enzyme: "Acetilcolinesterase (AChE)", cofactor: "Tríade catalítica Ser-His-Glu", reaction: "ACh ➔ Colina + Ácido Acético", note: "Uma das enzimas mais rápidas da natureza: turnover de 25.000 moléculas/segundo! Alvo de Donepezil, Rivastigmina e Galantamina." }
    ],
    clinicalSignificance: "Na Doença de Alzheimer, a degeneração dos corpos celulares colinérgicos no Núcleo Basal de Meynert causa perda profunda de memória; inibidores de AChE prolongam a meia-vida da ACh na fenda compensando o déficit."
  },
  ecb: {
    validado_em: '2026-08-31',
    title: "🌿 Ciclo dos Endocanabinoides (2-AG & Anandamida — síntese sob demanda)",
    precursors: "Fosfolipídios de membrana pós-sináptica (PIP₂ e NAPE)",
    steps: [
      { step: "1. Síntese de 2-AG", enzyme: "PLCβ ➔ DAGLα", cofactor: "Ca²⁺ e ativação de Gq (mGluR1/5, M1)", reaction: "PIP₂ ➔ DAG ➔ 2-Araquidonoilglicerol (2-AG)", note: "Sintetizado sob demanda na espinha dendrítica após despolarização ou ativação de Gq; não é armazenado em vesículas." },
      { step: "2. Síntese de Anandamida", enzyme: "NAPE-PLD", cofactor: "Ca²⁺", reaction: "NAPE ➔ Anandamida (AEA)", note: "Agonista parcial de CB1 e ligante de TRPV1; produzida em menor quantidade que o 2-AG." },
      { step: "3. Sinalização Retrógrada", enzyme: "Difusão lipídica ➔ CB1 pré-sináptico (Gi/o)", cofactor: "—", reaction: "2-AG (pós) ➔ CB1 (pré) ➔ ↓Cav2.1, ↑GIRK", reaction_note: "", note: "Suprime a liberação de GABA (DSI) ou glutamato (DSE) por segundos a minutos: freio retrógrado dependente de atividade." },
      { step: "4. Degradação do 2-AG", enzyme: "Monoacilglicerol Lipase (MAGL) — pré-sináptica", cofactor: "—", reaction: "2-AG ➔ Ácido Araquidônico + Glicerol", note: "MAGL responde por ~85% da hidrólise; inibidores de MAGL prolongam o DSI e reduzem a neuroinflamação (o ácido araquidônico alimenta a COX-2)." },
      { step: "5. Degradação da Anandamida", enzyme: "Amida-Hidrolase de Ácidos Graxos (FAAH) — pós-sináptica", cofactor: "—", reaction: "AEA ➔ Ácido Araquidônico + Etanolamina", note: "Alvo dos inibidores de FAAH (ex.: URB597) estudados em ansiedade e dor; o CBD inibe FAAH fracamente." }
    ],
    clinicalSignificance: "O THC é agonista parcial exógeno de CB1 que ativa o sistema de forma tônica e não seletiva — o oposto da sinalização fásica e sináptica dos endocanabinoides —, o que explica tolerância, dessensibilização de CB1 e risco de psicose em uso pesado."
  },
  opioid: {
    validado_em: '2026-08-31',
    title: "🛡️ Ciclo dos Peptídeos Opioides Endógenos (Endorfinas, Encefalinas e Dinorfinas)",
    precursors: "Pró-hormônios: POMC, Pró-encefalina e Pró-dinorfina (síntese ribossomal no soma)",
    steps: [
      { step: "1. Transcrição & Tradução", enzyme: "Ribossomo / Retículo endoplasmático rugoso", cofactor: "—", reaction: "Genes POMC / PENK / PDYN ➔ Pré-pró-peptídeos", note: "Ao contrário das monoaminas, os peptídeos são sintetizados no corpo celular e transportados ao terminal em vesículas de núcleo denso." },
      { step: "2. Processamento Proteolítico", enzyme: "Pró-hormônio convertases PC1/3 e PC2 + Carboxipeptidase E", cofactor: "pH ácido do grânulo secretor", reaction: "POMC ➔ β-endorfina (+ ACTH, α-MSH); PENK ➔ Met/Leu-encefalina; PDYN ➔ Dinorfina A/B", note: "A POMC também origina o ACTH: estresse e opioides endógenos nascem do mesmo precursor hipofisário." },
      { step: "3. Liberação", enzyme: "Exocitose de vesículas de núcleo denso", cofactor: "Ca²⁺ em disparos de alta frequência", reaction: "Peptídeo ➔ Fenda / espaço extrassináptico", note: "Liberados preferencialmente em rajadas; agem por difusão de volume em receptores μ (MOR), δ (DOR) e κ (KOR) — todos Gi/o." },
      { step: "4. Ação Receptorial", enzyme: "MOR / DOR / KOR (GPCR Gi/o)", cofactor: "βγ ➔ GIRK; α ➔ ↓AC", reaction: "↑K⁺ (GIRK), ↓Cav, ↓cAMP", note: "MOR na VTA inibe interneurônios GABA e desinibe a dopamina (recompensa); KOR/dinorfina produz disforia e anedonia (freio anti-recompensa)." },
      { step: "5. Degradação", enzyme: "Neprilisina (NEP/enkefalinase) e Aminopeptidase N", cofactor: "Zn²⁺", reaction: "Encefalina ➔ fragmentos inativos", note: "Sem recaptação: a sinalização termina por proteólise extracelular. Inibidores de enkefalinase (ex.: racecadotril) são analgésicos experimentais." }
    ],
    clinicalSignificance: "Naltrexona e naloxona bloqueiam MOR/KOR competitivamente; a buprenorfina é agonista parcial MOR com teto para depressão respiratória — base da terapia de manutenção na dependência de opioides."
  },
  adenosine: {
    validado_em: '2026-08-31',
    title: "☕ Ciclo da Adenosina & Pressão Homeostática do Sono",
    precursors: "ATP liberado por neurônios e astrócitos (co-transmissor em vesículas)",
    steps: [
      { step: "1. Liberação de ATP", enzyme: "Exocitose vesicular e hemicanais de panexina-1 / conexina-43 (astrócitos)", cofactor: "Atividade neuronal e glial", reaction: "ATP intracelular ➔ ATP extracelular", note: "Quanto mais vigília e atividade metabólica, mais ATP é lançado no espaço extracelular." },
      { step: "2. Hidrólise Extracelular", enzyme: "Ectonucleotidases CD39 (NTPDase1) ➔ CD73 (5'-nucleotidase)", cofactor: "Ca²⁺/Mg²⁺", reaction: "ATP ➔ ADP ➔ AMP ➔ Adenosina", note: "A adenosina extracelular acumula-se proporcionalmente às horas acordado — o substrato molecular do 'processo S' de Borbély." },
      { step: "3. Ação Receptorial", enzyme: "A1 (Gi/o) e A2A (Gs)", cofactor: "—", reaction: "A1: ↑GIRK, ↓Cav, ↓glutamato; A2A: ↑cAMP no estriado (via indireta)", note: "A1 inibe o sistema reticular ativador e o córtex (sonolência); A2A no estriado modula a via indireta e interage com D2 (heterodímeros A2A-D2)." },
      { step: "4. Recaptação & Reciclagem", enzyme: "Transportadores ENT1/ENT2 ➔ Adenosina-quinase (ADK, sobretudo astrocitária)", cofactor: "ATP", reaction: "Adenosina ➔ AMP (fosforilação)", note: "A ADK astrocitária é o principal 'ralo' da adenosina; sua expressão aumentada é um mecanismo de epileptogênese." },
      { step: "5. Desaminação", enzyme: "Adenosina Desaminase (ADA)", cofactor: "Zn²⁺", reaction: "Adenosina ➔ Inosina ➔ Hipoxantina", note: "Via alternativa de inativação; a deficiência de ADA é a imunodeficiência combinada grave clássica." }
    ],
    clinicalSignificance: "A cafeína é antagonista competitivo não seletivo de A1/A2A: bloqueia o sinal de sono acumulado sem removê-lo (o 'rebote' ao fim do efeito) e, via A2A estriatal, tem efeito pró-dopaminérgico leve — base do interesse em antagonistas A2A (istradefilina) no Parkinson."
  }
};

// 10 dossiês moleculares (origem: src/data/molecularAdvances.ts)
const molecularAdvancesData = [
  {
    id: 1,
    title: "1. 🫧 Bicamada Lipídica 3D & Lipid Rafts",
    shortLabel: "1. Bicamada & Rafts",
    category: "Arquitetura de Membrana",
    desc: "Mosaico fluido fosfolipídico com microdomínios de colesterol e esfingomielina agrupando GPCRs e canais.",
    pearl: "A fluidez da membrana modula diretamente a taxa de acoplamento do receptor com a proteína G."
  },
  {
    id: 2,
    title: "2. 🔄 Rocking Alternating-Access do Fold LeuT",
    shortLabel: "2. LeuT Rocking",
    category: "Transportadores SLC6 (SERT / DAT / NET)",
    desc: "Cinética acoplada 2 Na⁺ + 1 Cl⁻ + 1 Monoamina com transição Outward ➔ Oclusão ➔ Inward.",
    pearl: "O Escitalopram liga-se ao sítio ortostérico S1 e ao sítio alostérico S2, travando o transportador."
  },
  {
    id: 3,
    title: "3. 🔮 Ciclo Vesicular em 8 Passos & Clatrina",
    shortLabel: "3. Ciclo Vesicular (8)",
    category: "Tráfego de Organelas",
    desc: "VMAT2 ➔ Reserva ➔ Docking RIM/Munc13 ➔ Priming ➔ Fusão ➔ NSF/α-SNAP ➔ Clatrina/Dinamina ➔ V-ATPase.",
    pearl: "A Dinamina-1 é uma GTPase essencial que estrangula o pescoço da vesícula na endocitose."
  },
  {
    id: 4,
    title: "4. 🧲 Poro SNARE & Bolsos C2A/C2B de Syt1",
    shortLabel: "4. Poro SNARE & Syt1",
    category: "Fusão de Membrana",
    desc: "Zíper de 4 hélices gerando 65 pN com coordenação de 5 íons de Ca²⁺ em Syt1 em <100 µs.",
    pearl: "A toxina botulínica cliva SNAP-25 e Sintaxina-1, impedindo a exocitose."
  },
  {
    id: 5,
    title: "5. 🌉 Nanocolunas Sinápticas & Matriz ECM",
    shortLabel: "5. Nanocolunas & ECM",
    category: "Adesão Celular",
    desc: "Pontes Neurexina-1β ➔ Neuroligina-1 (~80 nm) alinhando sítios de fusão pré com clusters pós.",
    pearl: "Mutações em Neurexina-Neuroligina são marcadores biológicos em Transtornos do Espectro Autista."
  },
  {
    id: 6,
    title: "6. 🏗️ Andaime Estratificado da PSD-95 / Shank3",
    shortLabel: "6. Andaime PSD-95/Shank",
    category: "Densidade Pós-Sináptica",
    desc: "Camadas: Receptores ➔ PSD-95 (3 PDZ) ➔ GKAP ➔ Shank3 ➔ Homer1c conectado ao retículo.",
    pearl: "Mutações em Shank3 causam a Síndrome de Phelan-McDermid e hipotonia profunda."
  },
  {
    id: 7,
    title: "7. ✂️ Heterotetrâmeros AMPA & Edição Q/R de GluA2",
    shortLabel: "7. Edição Q/R GluA2",
    category: "Edição de RNA por ADAR2",
    desc: "Substituição de Q por R no poro TM2 de GluA2 conferindo impermeabilidade ao Ca²⁺ tóxico.",
    pearl: "A falha na edição Q/R causa influxo letal de Ca²⁺ na ELA e isquemia cerebral."
  },
  {
    id: 8,
    title: "8. 🍩 Holoenzima Dodecamérica CaMKIIα (3D)",
    shortLabel: "8. CaMKII Dodecâmero",
    category: "Memória Molecular & LTP",
    desc: "Anel duplo de 12 subunidades com autofosforilação Thr286 mantendo atividade autônoma.",
    pearl: "Fosforila GluA1 em Ser831, aumentando a condutância unitária e sustentando o LTP."
  },
  {
    id: 9,
    title: "9. ⚡ Eletrogênese do EAAT2 & Lactate Shuttle (ANLS)",
    shortLabel: "9. EAAT2 & Lactato",
    category: "Acoplamento Astrócito-Neurônio",
    desc: "1 Glu⁻ + 3 Na⁺ + 1 H⁺ ⇌ 1 K⁺ mantendo [Glu] < 1 µM; exportação de L-Lactato via MCT1/4 para MCT2.",
    pearl: "O lactato astrocitário é o substrato energético preferencial do neurônio sob alta demanda sináptica."
  },
  {
    id: 10,
    title: "10. 🛡️ GABA_A δ Extra-sináptico & Inibição Tônica",
    shortLabel: "10. GABA_A δ Tônico",
    category: "Neuroesteroides & Tônus Inibitório",
    desc: "Heteropentâmeros α4β3δ com afinidade nanomolar contínua sem dessensibilização rápida.",
    pearl: "Alvo exclusivo da Zuranolona para remissão rápida na Depressão Pós-Parto."
  }
];

// Ligação dos dossiês aos passos da storyline e aos componentes clicáveis da fenda 2D
const dossierByStep = { 1: [1], 2: [3], 3: [5], 4: [4], 5: [6, 7, 8, 10], 6: [2, 9] };

const dossierByComponent = { vesicles: [3], cav: [5], snare: [4], transporter: [2], cb1: [], cleft: [5, 1], receptors: [6, 7, 8, 10], astrocyte: [9] };

/*
 * v12.8 — VARREDURA DOS 10 DOSSIÊS MOLECULARES (quarta e última fonte de prosa da Fase 0).
 *
 * A Fase 0 já havia reconciliado três vocabulários: as 9 colunas de afinidade, a prosa da
 * farmacoteca (drugTargetsExtra, v12.2a) e os textos de circuito (circuitTargets, v12.2.1).
 * Os dossiês eram a fonte que ninguém tinha olhado — e é a que fala das moléculas mais finas.
 *
 * O que a varredura encontrou, DEPOIS de medir em vez de supor: os dossiês citam sete alvos
 * canônicos, e apenas DOIS deles não existiam em nenhuma outra camada — VMAT2 e EAAT. Eram alvos
 * que o simulador descrevia em detalhe molecular e não oferecia como objeto navegável; agora
 * oferece. Outros dois, AMPA e GABA-A extrasináptico, ganharam uma SEGUNDA rota (já vinham dos
 * circuitos glutamate e gaba), e SERT/DAT/NET já eram alcançáveis pela farmacoteca.
 * (Minha primeira redação dizia "quatro alvos promovidos". Estava errada, e o teste que mede a
 * diferença entre promoção e segunda rota existe por causa disso.)
 *
 * O grosso do que os dossiês citam fica FORA da ontologia v0.1.0 de propósito, e isso também é
 * um achado: a ontologia cobre receptores, transportadores e enzimas, mas não a maquinaria de
 * tráfego, fusão e andaime (SNARE, Syt1, PSD-95, Shank3, clatrina, dinamina). A ontologia é que
 * precisa crescer, não os dossiês que precisam encolher.
 */
const dossierTargets = {
    1: [],                                 // GPCRs e canais em geral: família, não alvo específico
    2: ['SERT', 'DAT', 'NET'],             // o fold LeuT é literalmente a família SLC6 do título
    3: ['VMAT2'],
    4: [],
    5: [],
    6: [],
    7: ['AMPA'],                           // heterotetrâmeros AMPA e a edição Q/R de GluA2
    8: ['AMPA'],                           // CaMKII fosforila GluA1 (subunidade AMPA) em Ser831
    9: ['EAAT'],                           // EAAT2 é o subtipo; a ontologia v0.1.0 é family-level aqui
    10: ['GABA-A extrasináptico']          // heteropentâmeros α4β3δ
};

// Citados nos dossiês e FORA da ontologia canônica v0.1.0 — maquinaria de tráfego, fusão,
// adesão e andaime, que a ontologia (receptores/transportadores/enzimas) não cobre.
const dossierTargetsForaDaOntologia = {
    1: ['GPCR (família)', 'lipid rafts'],
    2: ['sítio alostérico S2 do SERT'],
    3: ['RIM', 'Munc13', 'NSF', 'α-SNAP', 'clatrina', 'dinamina-1', 'V-ATPase'],
    4: ['complexo SNARE', 'SNAP-25', 'sintaxina-1', 'sinaptotagmina-1 (Syt1)'],
    5: ['neurexina-1β', 'neuroligina-1', 'matriz extracelular (ECM)'],
    6: ['PSD-95', 'GKAP', 'Shank3', 'Homer1c'],
    7: ['GluA2 (subunidade)', 'ADAR2'],
    8: ['CaMKIIα', 'GluA1 (subunidade)'],
    9: ['MCT1/MCT4', 'MCT2'],
    10: ['neuroesteroides (classe)']
};

/*
 * v12.11 — MAQUINARIA SINÁPTICA: vocabulário PRÓPRIO do NeuroSim.
 *
 * Decisão do PO (29/08): as 23 moléculas que os dossiês nomeiam e que a ontologia canônica v0.1.0
 * não cobre ganham uma camada separada, AO LADO da ontologia, sem tocá-la. Motivo: aquele
 * vocabulário é compartilhado com o SOPsi, e crescê-lo teria consequência de versão lá. Aqui não
 * tem: esta camada é local, e se um dia o SOPsi quiser, ele adota.
 *
 * O que entra: tráfego, fusão, adesão, andaime e enzimas de edição — o que faz a sinapse
 * FUNCIONAR, em oposição ao que ela SINALIZA. `categoria` é o eixo dessa distinção.
 */
const SYNAPTIC_MACHINERY = {
    'GPCR (família)':                 { categoria: 'sinalização', dossies: [1] },
    'lipid rafts':                    { categoria: 'arquitetura de membrana', dossies: [1] },
    'sítio alostérico S2 do SERT':    { categoria: 'sítio de ligação', dossies: [2] },
    'RIM':                            { categoria: 'tráfego vesicular', dossies: [3] },
    'Munc13':                         { categoria: 'tráfego vesicular', dossies: [3] },
    'NSF':                            { categoria: 'fusão de membrana', dossies: [3] },
    'α-SNAP':                         { categoria: 'fusão de membrana', dossies: [3] },
    'clatrina':                       { categoria: 'endocitose', dossies: [3] },
    'dinamina-1':                     { categoria: 'endocitose', dossies: [3] },
    'V-ATPase':                       { categoria: 'tráfego vesicular', dossies: [3] },
    'complexo SNARE':                 { categoria: 'fusão de membrana', dossies: [4] },
    'SNAP-25':                        { categoria: 'fusão de membrana', dossies: [4] },
    'sintaxina-1':                    { categoria: 'fusão de membrana', dossies: [4] },
    'sinaptotagmina-1 (Syt1)':        { categoria: 'sensor de cálcio', dossies: [4] },
    'neurexina-1β':                   { categoria: 'adesão celular', dossies: [5] },
    'neuroligina-1':                  { categoria: 'adesão celular', dossies: [5] },
    'matriz extracelular (ECM)':      { categoria: 'adesão celular', dossies: [5] },
    'PSD-95':                         { categoria: 'andaime pós-sináptico', dossies: [6] },
    'GKAP':                           { categoria: 'andaime pós-sináptico', dossies: [6] },
    'Shank3':                         { categoria: 'andaime pós-sináptico', dossies: [6] },
    'Homer1c':                        { categoria: 'andaime pós-sináptico', dossies: [6] },
    'GluA2 (subunidade)':             { categoria: 'subunidade de receptor', dossies: [7] },
    'ADAR2':                          { categoria: 'edição de RNA', dossies: [7] },
    'CaMKIIα':                        { categoria: 'quinase de plasticidade', dossies: [8] },
    'GluA1 (subunidade)':             { categoria: 'subunidade de receptor', dossies: [8] },
    'MCT1/MCT4':                      { categoria: 'transporte metabólico', dossies: [9] },
    'MCT2':                           { categoria: 'transporte metabólico', dossies: [9] },
    'neuroesteroides (classe)':       { categoria: 'modulador alostérico', dossies: [10] }
};

function machineryCategories() {
    return [...new Set(Object.keys(SYNAPTIC_MACHINERY).map(k => SYNAPTIC_MACHINERY[k].categoria))].sort();
}

function machineryForDossier(id) {
    return Object.keys(SYNAPTIC_MACHINERY).filter(k => SYNAPTIC_MACHINERY[k].dossies.indexOf(Number(id)) !== -1);
}

// Quais dossiês descrevem este alvo canônico.
function dossiersForTarget(canonId) {
    return Object.keys(dossierTargets)
        .filter(k => dossierTargets[k].indexOf(canonId) !== -1)
        .map(k => parseInt(k, 10));
}

// ====================================================================================================
// vindo de features.js
// ====================================================================================================

// ==========================================
// 2.2b CONTEÚDO (v10.2): passo atual, ciclos bioquímicos, dossiês e farmacoteca por classe
// ==========================================
const STEP_TITLES = ['Síntese & Precursores', 'Empacotamento Vesicular (VMAT2)', 'Potencial de Ação & Influxo de Ca²⁺', 'Acoplamento SNARE & Exocitose', 'Ativação Receptorial & Trocas Iônicas', 'Recaptação & Degradação Enzimática'];

function renderDossierCard(d, compact) {
    return `<div class="card" style="border-color: rgba(245,158,11,0.5); background: rgba(245,158,11,0.05); ${compact ? 'padding: 8px 10px;' : ''}">
                <div class="card-title"><span style="color: var(--ink-amber);">${d.title}</span><span style="font-size: 0.62rem; color: var(--text-muted);">${d.category}</span></div>
                <div class="card-desc" style="font-size: 0.74rem;">${d.desc}</div>
                <div class="clinical-pearl" style="margin-top: 5px; font-size: 0.7rem;">💎 ${d.pearl}</div>
            </div>`;
}

function renderCycleTable(cycle) {
    if (!cycle) return '';
    return `<div class="card" style="border-color: rgba(16,185,129,0.5);">
                <div class="card-title"><span style="color: var(--ink-emerald);">${cycle.title}</span></div>
                <div class="card-desc" style="font-size: 0.7rem; margin-bottom: 6px;"><b>Precursores:</b> ${cycle.precursors}</div>
                <div style="overflow-x: auto;"><table class="tech-table" style="font-size: 0.68rem; width: 100%;">
                    <thead><tr><th>Etapa</th><th>Enzima / Transportador</th><th>Cofator</th><th>Reação</th></tr></thead>
                    <tbody>${cycle.steps.map(st => `<tr title="${escapeHtml(st.note)}"><td><b>${st.step}</b></td><td>${st.enzyme}</td><td>${st.cofactor}</td><td>${st.reaction}</td></tr><tr><td colspan="4" style="color: var(--text-muted); font-size: 0.64rem; padding-bottom: 6px;">↳ ${st.note}</td></tr>`).join('')}</tbody>
                </table></div>
                <div class="clinical-pearl" style="margin-top: 6px; font-size: 0.7rem;">🩺 ${cycle.clinicalSignificance}</div>
            </div>`;
}

function renderStepCard(state) {
    const sys = systemsData[state.system] || {};
    const step = state.neuroStep || 1;
    const detail = (sys.stepDetails && sys.stepDetails[step - 1]) || '';
    const cycle = biochemicalCyclesData[state.system];
    const stepDossiers = (dossierByStep[step] || []).map(id => molecularAdvancesData.find(d => d.id === id)).filter(Boolean);
    const compDossiers = state.selectedCleftComponent ? (dossierByComponent[state.selectedCleftComponent] || []).map(id => molecularAdvancesData.find(d => d.id === id)).filter(Boolean) : [];
    let html = `<div class="card" style="border-color: ${sys.color || '#a855f7'};">
            <div class="card-title"><span class="ink" style="--cor: ${sys.color || '#a855f7'};">Passo ${step}/6 • ${STEP_TITLES[step - 1]} — ${sys.name || ''}</span></div>
            <div class="card-desc" style="font-size: 0.78rem; line-height: 1.5;">${detail || 'Use a barra "Passo a passo" para percorrer a transmissão sináptica deste sistema.'}</div>
            <div style="display: flex; gap: 4px; margin-top: 6px;">
                <button class="pill-btn" ${step <= 1 ? 'disabled' : ''} onclick="store.dispatch({type: 'SET_NEURO_STEP', step: ${step - 1}})">◀ Anterior</button>
                <button class="pill-btn" ${step >= 6 ? 'disabled' : ''} onclick="store.dispatch({type: 'SET_NEURO_STEP', step: ${step + 1}})">Próximo ▶</button>
            </div>
        </div>`;
    if (compDossiers.length) {
        html += `<div class="card-title" style="margin-top: 4px;"><span style="color: var(--ink-amber);">🔬 Estrutura selecionada na fenda</span><button class="pill-btn" style="font-size: 0.62rem;" onclick="store.dispatch({type: 'SELECT_CLEFT_COMPONENT', componentId: null})">✖</button></div>`;
        html += compDossiers.map(d => renderDossierCard(d, true)).join('');
    }
    if (step === 1 || step === 6) html += renderCycleTable(cycle);
    if (stepDossiers.length) {
        html += `<div class="card-title" style="margin-top: 4px;"><span style="color: var(--ink-amber);">📚 Dossiês moleculares deste passo</span></div>` + stepDossiers.map(d => renderDossierCard(d, true)).join('');
    }
    return html;
}

// ==========================================
// 2.3a ACESSIBILIDADE (v10.4): cores seguras para daltonismo; legenda editável no Modo Aula
// ==========================================
// v12.2.1 — ponte alvo → conectoma: acende só os circuitos que nomeiam o alvo e vai para o mapa.
/*
 * v12.40 (Bloco 5, decisao 11): a prescricao e a UNICA lista de farmacos (selectedDrugsList). escolherSistema so troca o
 * sistema — o que a fenda acopla e derivado (farmacoAcoplado, data.js), entao trocar de sistema nao apaga nada, e
 * voltar ao sistema traz o prescrito de volta. Deixou de ser ponte (era, na v12.38): nao atravessa mais dominio nenhum.
 */
function escolherSistema(system) {
    store.dispatch({ type: 'SET_SYSTEM', system });
}

// ====================================================================================================
// vindo de engine.js
// ====================================================================================================

/* NeuroSim Pro 3D — engine.js. Gerado pela divisão da v12.0; a ordem de carga é definida em Simulador_Neuronio_Interativo.html.
   Scripts clássicos compartilham o escopo global: const/let/function de um arquivo são visíveis nos seguintes. */
// ==========================================
// 3. ZERO-GC PARTICLES POOL (Float32Array)
// ==========================================
class ParticlePool {
    constructor(maxParticles = 350) {
        this.max = maxParticles;
        this.x = new Float32Array(maxParticles);
        this.y = new Float32Array(maxParticles);
        this.vx = new Float32Array(maxParticles);
        this.vy = new Float32Array(maxParticles);
        this.life = new Float32Array(maxParticles);
        this.type = new Uint8Array(maxParticles);
        this.color = new Array(maxParticles);
        this.activeCount = 0;
    }

    spawn(type, x, y, vx, vy, color, life = 1.0) {
        for (let i = 0; i < this.max; i++) {
            if (this.type[i] === 0) {
                this.type[i] = type;
                this.x[i] = x;
                this.y[i] = y;
                this.vx[i] = vx;
                this.vy[i] = vy;
                this.life[i] = life;
                this.color[i] = color;
                this.activeCount++;
                return i;
            }
        }
        return -1;
    }

    spawnBurst(systemKey, count = 25) {
        const sys = systemsData[systemKey];
        for (let i = 0; i < count; i++) {
            this.spawn(
                1,
                250 + (Math.random() - 0.5) * 200,
                130 + Math.random() * 20,
                (Math.random() - 0.5) * 2.5,
                1.5 + Math.random() * 2.5,
                sys.color,
                1.0
            );
        }
        for (let i = 0; i < 15; i++) {
            this.spawn(
                2,
                180 + Math.random() * 340,
                40 + Math.random() * 20,
                0,
                2.0 + Math.random() * 2.0,
                "#f59e0b",
                1.0
            );
        }
    }

    updateAndRender(ctx, w, h) {
        for (let i = 0; i < this.max; i++) {
            if (this.type[i] === 0) continue;

            this.x[i] += this.vx[i];
            this.y[i] += this.vy[i];

            if (this.type[i] === 1) {
                this.life[i] -= 0.008;
                if (this.y[i] > h * 0.62) {
                    this.vy[i] *= -0.3;
                }
            } else if (this.type[i] === 2) {
                this.life[i] -= 0.02;
                if (this.y[i] > h * 0.32) {
                    this.type[i] = 0;
                    continue;
                }
            }

            if (this.life[i] <= 0 || this.x[i] < 0 || this.x[i] > w || this.y[i] > h) {
                this.type[i] = 0;
                this.activeCount--;
                continue;
            }

            ctx.fillStyle = this.color[i];
            ctx.shadowColor = this.color[i];
            ctx.shadowBlur = this.type[i] === 2 ? 8 : 5;
            ctx.beginPath();
            ctx.arc(this.x[i], this.y[i], this.type[i] === 2 ? 3 : 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

const particlePool = new ParticlePool(350);

// v12.38 (Bloco 3): a REACAO da sinapse ao potencial de acao. Antes, o reducer (TRIGGER_ACTION_POTENTIAL, dominio
// Neuronio) soltava as vesiculas direto no particlePool (dominio Neurotransmissao) — escrita cruzada. Agora o laco de
// render pergunta a cada quadro; na borda de subida de apActive a sinapse libera. Mesmo numero (35), um quadro depois.
let apVistoNoQuadroAnterior = false;

function sinapseReageAoPA(state) {
    const ativo = !!(state && state.apActive);
    if (ativo && !apVistoNoQuadroAnterior && typeof particlePool !== 'undefined' && particlePool.spawnBurst) particlePool.spawnBurst(state.system, 35);
    apVistoNoQuadroAnterior = ativo;
}

// ====================================================================================================
// vindo de render3d.js
// ====================================================================================================

// v12.47 (D3): uma declaracao por dominio. Enquanto os dois grupos nasciam na mesma linha, o mapa de donos lia uma
// dependencia entre Neurotransmissao e Circuitos que nao existe — e uma pasta por dominio nao poderia levar a linha.
let cleft3DGroup;    // dominio Neurotransmissao
// v12.50: init3D (casca) monta o grupo da fenda; em modulo, quem importa nao escreve — o dono expoe o setter.
function definirCleft3DGroup(g) { cleft3DGroup = g; }

let postMembraneMesh, camkiiGroup, vesicles3D = [], receptors3DGroup;

// v12.47.1: era de topo com recuo de aninhada — o mapa nao a via, render2d.js ficava sem o import e a fenda 3D morria.
let ionParticles3D = [];

function buildSynapticCleft3D(parent) {
    parent.clear ? parent.clear() : (parent.children = []);

    const state = store.getState();
    const sys = systemsData[state.system] || systemsData.da;
    const isScz = (state.activePathologyProfile === 'schizophrenia');
    const activeDrugId = farmacoAcoplado(state);   // v12.40: derivado da prescricao (decisao 11)
    const aff = drugBindingAffinities[activeDrugId];

    // 1. Presynaptic Axon Bouton (Smooth Bioluminescent Dome)
    const preGeo = new THREE.SphereGeometry(8.5, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const preMat = new THREE.MeshPhongMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.38,
        shininess: 90,
        side: THREE.DoubleSide
    });
    const preMesh = new THREE.Mesh(preGeo, preMat);
    preMesh.rotation.x = Math.PI;
    preMesh.position.set(0, 7.8, 0);
    preMesh.userData.cleftId = 'bouton';
    parent.add(preMesh);

    // Presynaptic Active Zone Floor Ring
    const preFloorGeo = new THREE.RingGeometry(0.5, 8.5, 32);
    const preFloorMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25
    });
    const preFloor = new THREE.Mesh(preFloorGeo, preFloorMat);
    preFloor.rotation.x = Math.PI * 0.5;
    preFloor.position.set(0, 7.8, 0);
    parent.add(preFloor);

    // 2. Postsynaptic Mushroom Dendritic Spine Head & Neck
    const neckGeo = new THREE.CylinderGeometry(2.4, 3.2, 7.5, 32);
    const neckMat = new THREE.MeshPhongMaterial({
        color: 0x0f172a,
        transparent: true,
        opacity: 0.65,
        shininess: 60
    });
    const neckMesh = new THREE.Mesh(neckGeo, neckMat);
    neckMesh.position.set(0, -9.5, 0);
    neckMesh.userData.cleftId = 'spine';
    parent.add(neckMesh);

    const headGeo = new THREE.CylinderGeometry(9.8, 8.8, 3.2, 32);
    const headMat = new THREE.MeshPhongMaterial({
        color: isScz ? 0x991b1b : 0x065f46,
        transparent: true,
        opacity: 0.45,
        shininess: 85
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, -4.2, 0);
    headMesh.userData.cleftId = 'spine';
    parent.add(headMesh);

    // Postsynaptic Density (PSD-95 Emerald Cloud)
    const psdGeo = new THREE.CylinderGeometry(8.8, 8.8, 0.6, 32);
    const psdMat = new THREE.MeshPhongMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.55,
        shininess: 100
    });
    const psdMesh = new THREE.Mesh(psdGeo, psdMat);
    psdMesh.position.set(0, -2.4, 0);
    psdMesh.userData.cleftId = 'psd';
    parent.add(psdMesh);

    // 3. Astrocytic Process (Tripartite Envelope)
    const astroGeo = new THREE.SphereGeometry(6.5, 24, 20);
    const astroMat = new THREE.MeshPhongMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.25,
        wireframe: false,
        shininess: 70
    });
    const astroMesh = new THREE.Mesh(astroGeo, astroMat);
    astroMesh.scale.set(0.8, 1.6, 1.1);
    astroMesh.position.set(10.5, 2.0, 0);
    astroMesh.userData.cleftId = 'astrocyte';
    parent.add(astroMesh);

    // Astrocytic EAAT2 Transporters
    const eaatGeo = new THREE.BoxGeometry(1.2, 1.8, 1.2);
    const eaatMat = new THREE.MeshPhongMaterial({ color: 0x34d399, shininess: 90 });
    const eaatMesh = new THREE.Mesh(eaatGeo, eaatMat);
    eaatMesh.position.set(7.5, 1.0, 0);
    eaatMesh.userData.cleftId = 'astrocyte';
    parent.add(eaatMesh);

    // 4. Calcium Channels Cav2.1 on Presynaptic Active Zone (Gold Cylinders)
    const cavGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 16);
    const cavMat = new THREE.MeshPhongMaterial({ color: 0xfacc15, shininess: 100 });
    const cavPositions = [
        { x: -3.8, z: 0 },
        { x: 3.8, z: 0 },
        { x: 0, z: 3.8 },
        { x: 0, z: -3.8 }
    ];
    cavPositions.forEach(pos => {
        const cav = new THREE.Mesh(cavGeo, cavMat);
        cav.position.set(pos.x, 7.8, pos.z);
        cav.userData.cleftId = 'cav';
        parent.add(cav);
    });

    // 5. Postsynaptic Pentameric Receptors with Central Pores
    const recGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.6, 16);
    const recMat = new THREE.MeshPhongMaterial({
        color: parseInt(sys.color.replace('#', '0x')),
        shininess: 100
    });
    const poreGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.65, 12);
    const poreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const recPositions = [
        { x: -4.5, z: -2.0 },
        { x: -1.5, z: -4.0 },
        { x: 2.0, z: -3.5 },
        { x: 4.5, z: -1.5 },
        { x: -3.5, z: 2.5 },
        { x: 0.5, z: 4.0 },
        { x: 3.8, z: 2.2 },
        { x: -1.0, z: 0.5 },
        { x: 2.2, z: -0.5 }
    ];

    recPositions.forEach(pos => {
        const recMesh = new THREE.Mesh(recGeo, recMat);
        recMesh.position.set(pos.x, -2.1, pos.z);

        const pore = new THREE.Mesh(poreGeo, poreMat);
        pore.position.set(pos.x, -2.1, pos.z);

        recMesh.userData.cleftId = 'receptors'; pore.userData.cleftId = 'receptors';
        parent.add(recMesh);
        parent.add(pore);
    });

    // 6. Presynaptic Reuptake Transporter (DAT / SERT / NET)
    const transGeo = new THREE.BoxGeometry(1.6, 1.8, 1.6);
    const transMat = new THREE.MeshPhongMaterial({ color: 0x0284c7, shininess: 90 });
    const transMesh = new THREE.Mesh(transGeo, transMat);
    transMesh.position.set(-6.5, 7.8, 2.0);
    transMesh.userData.cleftId = 'transporter';
    parent.add(transMesh);

    // 7. Synaptic Vesicles with Transporter Dots (Reserve & Active Zone Pools)
    vesicles3D = [];
    const vesGeo = new THREE.SphereGeometry(0.9, 18, 18);
    const vesMat = new THREE.MeshPhongMaterial({
        color: 0xf43f5e,
        emissive: 0x881337,
        shininess: 100
    });

    for (let v = 0; v < 14; v++) {
        const vMesh = new THREE.Mesh(vesGeo, vesMat);
        const angle = v * 0.48;
        const rad = 2.0 + (v % 4) * 1.3;
        const vy = 9.2 + Math.floor(v / 4) * 2.2;
        vMesh.position.set(Math.cos(angle) * rad, vy, Math.sin(angle) * rad);
        vMesh.userData.cleftId = 'vesicles';
        parent.add(vMesh);
        vesicles3D.push(vMesh);
    }

    // 8. Active Drug Molecular Capsule (Floating 3D Hologram)
    if (activeDrugId !== 'none' && aff) {
        const drugGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 16);
        const drugMat = new THREE.MeshPhongMaterial({
            color: 0xa855f7,
            emissive: 0x6b21a8,
            shininess: 100
        });
        const drugMesh = new THREE.Mesh(drugGeo, drugMat);
        drugMesh.rotation.z = Math.PI * 0.35;
        drugMesh.position.set(0, 1.0, 0);
        drugMesh.userData.cleftId = 'drug';
        parent.add(drugMesh);

        const haloGeo = new THREE.RingGeometry(1.4, 1.8, 24);
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0xc084fc,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = Math.PI * 0.5;
        halo.position.set(0, 1.0, 0);
        parent.add(halo);
    }
}

        // Interactive Hover & Click Raycasting for 2D Synapse Canvas
let hoveredSynapseComponent = null;

function definirHoveredSynapseComponent(v) { hoveredSynapseComponent = v; }   // setter: em módulos ES, quem importa não escreve

function onSynapseCanvasMouseMove(e) {
    const canvas = document.getElementById('synapseCanvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const w = canvas.width;
    const h = canvas.height;
    const preY = h * 0.32;
    const postY = h * 0.65;

    hoveredSynapseComponent = null;

    if (mouseY < preY - 20 && mouseX > w * 0.15 && mouseX < w * 0.75) {
        hoveredSynapseComponent = {
            id: 'vesicles',
            title: '📦 Vesículas Sinápticas (Pool de Reserva & RRP)',
            desc: 'Armazenam neurotransmissores em alta concentração via gradiente eletroquímico de prótons gerado pela V-ATPase e transportadores vesiculares (VMAT2, VGluT, VGAT).'
        };
    } else if (mouseY >= preY - 18 && mouseY <= preY + 12 && mouseX > w * 0.12 && mouseX < w * 0.70) {
        hoveredSynapseComponent = {
            id: 'cav',
            title: '⚡ Canais de Cálcio Voltagem-Dependentes (Cav2.1 / P/Q)',
            desc: 'A despolarização do potencial de ação (+30 mV) abre os poros de Cav2.1. O influxo local de Ca2+ eleva a concentração micromolar na zona ativa, ativando a Sinaptotagmina-1.'
        };
    } else if (mouseY >= preY - 8 && mouseY <= preY + 14 && mouseX >= w * 0.25 && mouseX <= w * 0.65) {
        hoveredSynapseComponent = {
            id: 'snare',
            title: '🪢 Complexo SNARE (Sintaxina-1, SNAP-25, Sinaptobrevina/VAMP)',
            desc: 'Feixe de 4 hélices alfa que forma um zíper mecânico, superando a repulsão eletrostática entre bicamadas lipídicas para fundir a vesícula na membrana plasmática. Alvo da Toxina Botulínica.'
        };
    } else if (mouseY >= preY - 14 && mouseY <= preY + 18 && mouseX >= w * 0.70 && mouseX <= w * 0.82) {
        hoveredSynapseComponent = {
            id: 'transporter',
            title: '🔄 Transportador de Recaptação Pré-Sináptico (DAT / SERT / NET)',
            desc: 'Simporte ativo secundário acoplado a Na+/Cl- que recapta neurotransmissores da fenda para o citoplasma axonal. Alvo principal de ISRS (Fluoxetina, Escitalopram), IRSN e Bupropiona.'
        };
    } else if (mouseY >= preY - 14 && mouseY <= preY + 18 && mouseX >= w * 0.05 && mouseX <= w * 0.16) {
        hoveredSynapseComponent = {
            id: 'cb1',
            title: '🌿 Receptor Canabinoide CB1 Pré-Sináptico (Gi/o)',
            desc: 'Sensor de retro-alimentação retrógrada. Ativado por 2-AG/Anandamida pós-sinápticos, fecha canais Cav2.1 e inibe a liberação de neurotransmissores (Mecanismo DSI / DSE de Kano 2009).'
        };
    } else if (mouseY > preY + 15 && mouseY < postY - 15 && mouseX < w * 0.78) {
        hoveredSynapseComponent = {
            id: 'cleft',
            title: '🔬 Fenda Sináptica (Espaço Intercelular de 20 nm)',
            desc: 'Microambiente de difusão quantal sustentado por nanocolunas trans-sinápticas de Neurexina-Neuroligina (Tang et al. Nature 2016). Concentração de pico atinge 1 mM em < 100 microssegundos.'
        };
    } else if (mouseY >= postY - 15 && mouseY <= postY + 30 && mouseX < w * 0.78) {
        hoveredSynapseComponent = {
            id: 'receptors',
            title: '🟢 Receptores Pós-Sinápticos & Densidade PSD-95',
            desc: 'Receptores ionotrópicos (AMPA, NMDA, GABA-A) geram correntes iônicas imediatas (EPSP/IPSP). Receptores metabotrópicos (D2, 5-HT2A) modulam cascatas de segundos mensageiros (cAMP, IP3/DAG, CaMKII).'
        };
    } else if (mouseX >= w * 0.78) {
        hoveredSynapseComponent = {
            id: 'astrocyte',
            title: '🟢 Astrócito Perissináptico & Ciclo Glutamato-Glutamina (EAAT2 / GS)',
            desc: 'Processo astrocitário que isola a sinapse, capta transmissores via EAAT2/GLT-1 em < 1 ms e converte glutamato em glutamina via Glutamina Sintetase para reciclagem neuronal (Araque et al.).'
        };
    }
}

function onSynapseCanvasClick(e) {
    if (hoveredSynapseComponent) {
        playBioTone(520, 'sine', 0.1, 0.1);
        store.dispatch({ type: 'SELECT_CLEFT_COMPONENT', componentId: hoveredSynapseComponent.id });
        if (hoveredSynapseComponent.id === 'cav' || hoveredSynapseComponent.id === 'vesicles' || hoveredSynapseComponent.id === 'snare') {
            store.dispatch({ type: 'TRIGGER_ACTION_POTENTIAL' });
        }
    }
}

const CLEFT_COMPONENT_INFO = {
    bouton: { title: '🔴 Botão pré-sináptico', desc: 'Terminal axonal com zona ativa, pools de vesículas e canais Cav2.1. Clique para abrir os dossiês do ciclo vesicular.', map: 'vesicles' },
    vesicles: { title: '📦 Vesículas sinápticas', desc: 'Pool de reserva e pool prontamente liberável (RRP), carregadas por VMAT2/VGluT/VGAT via gradiente de H⁺.', map: 'vesicles' },
    cav: { title: '⚡ Canais Cav2.1 (P/Q)', desc: 'Abertos pela despolarização; o nanodomínio de Ca²⁺ ativa a sinaptotagmina-1 em < 1 ms. Bloqueio por nifedipina/ω-agatoxina.', map: 'cav' },
    transporter: { title: '🔄 Transportador de recaptação (DAT / SERT / NET)', desc: 'Simporte Na⁺/Cl⁻ da família SLC6 com mecanismo de acesso alternado (LeuT). Alvo de ISRS, IRSN, bupropiona e cocaína.', map: 'transporter' },
    receptors: { title: '🟢 Receptores pós-sinápticos', desc: 'Ionotrópicos (AMPA, NMDA, GABA-A) e metabotrópicos (D1/D2, 5-HT, α/β), ancorados pela PSD-95/Shank3.', map: 'receptors' },
    psd: { title: '🏗️ Densidade pós-sináptica (PSD)', desc: 'Andaime estratificado PSD-95 → GKAP → Shank3 → Homer que alinha receptores às nanocolunas de liberação.', map: 'receptors' },
    spine: { title: '🍄 Espinha dendrítica', desc: 'Cabeça e pescoço da espinha: compartimento de Ca²⁺ e substrato estrutural da LTP (CaMKII, actina). Atrofia no estresse, brota com BDNF/mTORC1.', map: 'receptors' },
    astrocyte: { title: '🟢 Astrócito perissináptico (PAP) & EAAT2', desc: 'Capta glutamato em < 1 ms, converte em glutamina (GS) e devolve ao neurônio; lactato como combustível (ANLS).', map: 'astrocyte' },
    drug: { title: '💊 Fármaco acoplado', desc: 'Molécula no sítio de ligação; o tempo de residência (tR = 1/k_off) define a duração do bloqueio. Veja o dossiê no inspector do Modo 2.', map: 'transporter' }
};

function showCleftTooltip(id, x, y) {
    const tt = document.getElementById('connectome-tooltip'); const info = CLEFT_COMPONENT_INFO[id]; if (!tt || !info) return;
    tt.innerHTML = `<div class="tooltip-title"><span>${info.title}</span></div><div class="tooltip-row" style="max-width: 280px;">${info.desc}</div><div style="font-size: 0.6rem; color: #94a3b8; margin-top: 4px;">clique para abrir o dossiê</div>`;
    tt.style.display = 'block'; tt.style.left = (x + 14) + 'px'; tt.style.top = (y + 14) + 'px';
}

// ====================================================================================================
// vindo de render2d.js
// ====================================================================================================

/* NeuroSim Pro 3D — render2d.js. Gerado pela divisão da v12.0; a ordem de carga é definida em Simulador_Neuronio_Interativo.html.
   Scripts clássicos compartilham o escopo global: const/let/function de um arquivo são visíveis nos seguintes. */
// ==========================================
// 9. 2D HIGH-FIDELITY SYNAPSE CLEFT ENGINE (CANVAS - SYSTEM SPECIFIC)
// ==========================================
        // =========================================================================
// 9. 2D HIGH-FIDELITY SYNAPTIC CLEFT & IONIC FLUX ENGINE
// =========================================================================
let synapticParticles = [];

let ionParticles = []; // Ca2+, Na+, Cl-, K+ particles

let receptorStates = [0, 0, 0, 0, 0, 0]; // Binding state & pore opening timer

function initSynapticParticles() {
    synapticParticles = [];
    ionParticles = [];
    for (let i = 0; i < 50; i++) {
        synapticParticles.push({
            x: Math.random(),
            y: Math.random(),
            vx: (Math.random() - 0.5) * 0.003,
            vy: 0.001 + Math.random() * 0.003,
            boundTimer: 0,
            boundReceptorIdx: -1,
            state: 'cleft' // 'docked', 'cleft', 'bound', 'reuptake'
        });
    }
    for (let i = 0; i < 60; i++) {
        ionParticles.push({
            x: Math.random(),
            y: Math.random(),
            type: (i % 4 === 0) ? 'ca' : ((i % 4 === 1) ? 'na' : ((i % 4 === 2) ? 'cl' : 'k')),
            vx: (Math.random() - 0.5) * 0.004,
            vy: (Math.random() - 0.5) * 0.004
        });
    }
}

        // ==========================================
// 9. 2D HIGH-FIDELITY SYNAPTIC CLEFT & TRIPARTITE SYNAPSE ENGINE
// ==========================================
function drawSynapse2D() {
    const canvas = document.getElementById('synapseCanvas');
    const state = store.getState();
    if (!canvas || state.visualScale !== 'cleft2d') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.parentElement.clientWidth || 800;
    const h = canvas.parentElement.clientHeight || 500;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    const isDark = !state.isAtlasTheme;
    const sys = systemsData[state.system] || systemsData.da;
    // v12.24.0: le o relogio da simulacao (engine.js). Antes era Date.now(): relogio de
    // parede, que nao escala nem pausa — e por isso o slider de velocidade nao a alcancava.
    const timeNow = relogioSimulacao;
    const isAP = state.apActive;
    const micLayer = state.cleftMicroscopeLayer || 'all';
    const activeDrugId = farmacoAcoplado(state);   // v12.40: derivado da prescricao (decisao 11)
    const aff = drugBindingAffinities[activeDrugId];
    const chelator = state.activeChelator || 'none';
    const isMMP9 = state.mmp9Active;
    const isPsychoplastogen = (activeDrugId === 'cetamina' || micLayer === 'plasticity');

    const preY = h * 0.32;
    const postY = h * 0.65;
    const cleftH = postY - preY;

    // =========================================================
    // 1. BACKGROUND & MICROSCOPY GRID
    // =========================================================
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.8);
    bgGrad.addColorStop(0, isDark ? "#0b132b" : "#f8fafc");
    bgGrad.addColorStop(1, isDark ? "#020617" : "#e2e8f0");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Nanometer Scale Calibration (20 nm cleft)
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
    ctx.lineWidth = 1;
    for (let x = 30; x < w; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }

    // =========================================================
    // 2. PARTE 6: MATRIZ EXTRACELULAR PERISSINÁPTICA (PNNs)
    // =========================================================
    const isECMFocus = (micLayer === 'ecm');
    if (isECMFocus) {
        ctx.save();
        ctx.strokeStyle = isMMP9 ? "rgba(6, 182, 212, 0.20)" : "rgba(6, 182, 212, 0.45)";
        ctx.lineWidth = 1.0;
        ctx.setLineDash(isMMP9 ? [2, 6] : [4, 4]);

        for (let mx = 40; mx < w * 0.78; mx += 36) {
            ctx.beginPath();
            ctx.moveTo(mx, preY - 20);
            ctx.bezierCurveTo(mx - 15, preY + cleftH / 2, mx + 15, preY + cleftH / 2, mx, postY + 25);
            ctx.stroke();
        }

        for (let nx = 60; nx < w * 0.76; nx += 48) {
            ctx.fillStyle = isMMP9 ? "#0891b2" : "#06b6d4";
            ctx.beginPath();
            ctx.arc(nx, preY + cleftH / 2 + Math.sin(timeNow * 2 + nx) * 6, isMMP9 ? 1.8 : 3.0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = "#06b6d4"; ctx.font = "bold 7px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(isMMP9 ? "🕸️ MATRIZ ECM CLIVADA POR MMP-9 (Plasticidade LTP Ativa / Mobilidade ↑)" : "🕸️ MATRIZ ECM / PNNs ESTÁVEL (Brevican / Tenascina-R / Barreira de Difusão)", 16, h - 70);
        ctx.restore();
    }

    // =========================================================
    // 3. PARTE 1 & 4: NANOCOLUNAS & CONDENSADOS LLPS NA PSD
    // =========================================================
    const nanoCols = [
        { x: w * 0.28, name: "NANOCOLUNA 1", pre: "NRXN-1β / RIM1", post: "NLGN-1 / PSD-95", color: "#38bdf8" },
        { x: w * 0.46, name: "NANOCOLUNA 2", pre: "NRXN-1α / Munc13", post: "LRRTM2 / GluA1", color: "#f43f5e" },
        { x: w * 0.64, name: "NANOCOLUNA 3", pre: "SynCAM-1 / Cadherina", post: "SynCAM-1 / Shank3", color: "#a855f7" }
    ];

    const isNanoFocus = (micLayer === 'nanocolumns' || micLayer === 'all');

    nanoCols.forEach((nc, idx) => {
        const nx = nc.x;
        ctx.save();

        // Quantal Alignment Corridor (Ø ≈ 80 nm)
        ctx.fillStyle = isDark ? (isNanoFocus ? "rgba(56, 189, 248, 0.07)" : "rgba(56, 189, 248, 0.03)") : "rgba(2, 132, 199, 0.04)";
        ctx.strokeStyle = isNanoFocus ? nc.color : "rgba(56, 189, 248, 0.25)";
        ctx.lineWidth = isNanoFocus ? 1.2 : 0.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.rect(nx - 28, preY, 56, cleftH);
        ctx.fill(); ctx.stroke();
        ctx.setLineDash([]);

        // Presynaptic RIM1/2 & Munc13-1 Active Zone Scaffold
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(nx - 24, preY - 5, 48, 5);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 6px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("RIM/Munc13", nx, preY - 8);

        // Trans-synaptic Adhesion Bridges
        for (let b = -1; b <= 1; b++) {
            const bx = nx + b * 12;
            ctx.strokeStyle = nc.color; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(bx, preY + 2); ctx.lineTo(bx, postY - 2); ctx.stroke();
            ctx.fillStyle = nc.color;
            ctx.beginPath(); ctx.arc(bx, preY + cleftH / 2, 2.4, 0, Math.PI * 2); ctx.fill();
        }

        // Condensado Biomolecular LLPS na PSD
        const llpsWobble = Math.sin(timeNow * 3 + idx) * 2;
        ctx.fillStyle = isDark ? "rgba(16, 185, 129, 0.35)" : "rgba(16, 185, 129, 0.25)";
        ctx.strokeStyle = "#10b981"; ctx.lineWidth = 1.2;
        ctx.beginPath();
        if (ctx.ellipse) {
            ctx.ellipse(nx, postY + 12, 32 + llpsWobble, 14, 0, 0, Math.PI * 2);
        } else {
            ctx.arc(nx, postY + 12, 22, 0, Math.PI * 2);
        }
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = "#10b981";
        ctx.fillRect(nx - 24, postY, 48, 5);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 6px sans-serif";
        ctx.fillText("PSD-95 (LLPS)", nx, postY + 10);
        ctx.font = "5px sans-serif";
        ctx.fillStyle = "#a7f3d0";
        ctx.fillText("Shank3/Homer1", nx, postY + 18);

        // PARTE 8: Sinal Protetor Don't-Eat-Me (CD47)
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath(); ctx.arc(nx + 18, postY - 4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.font = "4.5px sans-serif"; ctx.fillStyle = "#ffffff";
        ctx.fillText("CD47", nx + 18, postY - 8);

        ctx.fillStyle = isNanoFocus ? nc.color : "rgba(255,255,255,0.7)";
        ctx.font = "bold 6.5px sans-serif";
        ctx.fillText(nc.name, nx, preY + cleftH / 2 - 10);
        ctx.restore();
    });

    // =========================================================
    // 4. PARTE 10: PSICOPLASTÓGENOS & BROTAMENTO DE NOVA ESPINHA (SPINOGÊNESE RÁPIDA)
    // David E. Olson Science 2023, Duman Science 2012, Liston Science 2019
    // =========================================================
    if (isPsychoplastogen) {
        const spineX = w * 0.88;
        const spineY = postY + 18;
        ctx.save();

        // De Novo Budding Mushroom Spine Head (Golden Glow)
        ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 18;
        ctx.fillStyle = "rgba(251, 191, 36, 0.28)";
        ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(spineX, spineY, 24, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;

        // TrkB Dimer Complex & BDNF Binding
        ctx.fillStyle = "#f59e0b"; ctx.fillRect(spineX - 16, spineY - 28, 14, 10);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 5.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("TrkB", spineX - 9, spineY - 21);

        ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(spineX - 9, spineY - 34, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#000000"; ctx.font = "bold 5px sans-serif"; ctx.fillText("BDNF", spineX - 9, spineY - 32);

        // Intracellular mTORC1 / Arp2/3 Actin Polymerization Factory
        ctx.fillStyle = "#d97706"; ctx.beginPath(); ctx.arc(spineX, spineY + 6, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 5.5px sans-serif"; ctx.fillText("mTORC1", spineX, spineY + 8);
        ctx.font = "4.5px sans-serif"; ctx.fillStyle = "#fef08a"; ctx.fillText("Arp2/3 F-Actina", spineX, spineY + 15);

        // Spinogenesis HUD Callout
        ctx.fillStyle = "#fbbf24"; ctx.font = "bold 8px sans-serif"; ctx.textAlign = "left";
        ctx.fillText("🌱 PSICOPLASTICIDADE: BDNF ➔ TrkB ➔ mTORC1 ➔ Brotamento De Novo (2-24h)", 16, h - 70);
        ctx.restore();
    }

    // =========================================================
    // 5. PERISYNAPTIC ASTROCYTE PROCESS (PAP) & EAAT2
    // =========================================================
    const astroX = w * 0.80;
    const isAstroHover = (hoveredSynapseComponent && hoveredSynapseComponent.id === 'astrocyte');
    const isTripartiteFocus = (micLayer === 'tripartite');

    ctx.save();
    ctx.fillStyle = isDark ? (isTripartiteFocus || isAstroHover ? "rgba(16, 185, 129, 0.22)" : "rgba(16, 185, 129, 0.10)") : "rgba(16, 185, 129, 0.12)";
    ctx.strokeStyle = isTripartiteFocus || isAstroHover ? "#10b981" : "rgba(52, 211, 153, 0.6)";
    ctx.lineWidth = isTripartiteFocus || isAstroHover ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(w, preY - 55);
    ctx.bezierCurveTo(astroX - 15, preY - 25, astroX - 15, postY + 45, w, postY + 75);
    ctx.lineTo(w, preY - 55);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#10b981"; ctx.fillRect(astroX - 5, preY + 12, 28, 36);
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.2; ctx.strokeRect(astroX - 5, preY + 12, 28, 36);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 7.5px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("EAAT2", astroX + 9, preY + 26); ctx.fillText("GLT-1", astroX + 9, preY + 38);

    ctx.fillStyle = "#059669"; ctx.beginPath(); ctx.arc(astroX + 55, preY + 30, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#a7f3d0"; ctx.stroke();
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 7px sans-serif"; ctx.fillText("GS", astroX + 55, preY + 28);
    ctx.font = "5.5px sans-serif"; ctx.fillText("Glu➔Gln", astroX + 55, preY + 37);

    const cycleProgress = (timeNow * 1.6) % 1.0;
    ctx.fillStyle = sys.color; ctx.beginPath(); ctx.arc((astroX - 30) + cycleProgress * 25, preY + 30, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6ee7b7"; ctx.beginPath(); ctx.arc((astroX + 50) - cycleProgress * 65, (preY + 30) - cycleProgress * 38, 3.0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#34d399"; ctx.font = "bold 8.5px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("🟢 Astrócito (PAP)", astroX - 10, preY - 6);
    ctx.restore();

    // =========================================================
    // 6. BOTÃO PRÉ-SINÁPTICO & PARTE 7: RETRÓGRADO (2-AG & NO)
    // =========================================================
    ctx.save();
    ctx.fillStyle = isDark ? "#0f172a" : "#f1f5f9";
    ctx.strokeStyle = isAP ? "#ef4444" : "#38bdf8";
    ctx.lineWidth = isAP ? 3.5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w, preY);
    ctx.bezierCurveTo(w * 0.75, preY + 16, w * 0.25, preY + 16, 0, preY);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.strokeStyle = isDark ? "rgba(56, 189, 248, 0.25)" : "rgba(2, 132, 199, 0.20)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, preY - 5);
    ctx.bezierCurveTo(w * 0.75, preY + 11, w * 0.25, preY + 11, 0, preY - 5);
    ctx.stroke();

    ctx.fillStyle = isDark ? "#38bdf8" : "#0284c7";
    ctx.font = "bold 10px sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`🔴 BOTÃO PRÉ-SINÁPTICO (${sys.name.toUpperCase()}) — Zíper SNARE & Nanodomínios`, 16, 20);

    let chelatorTxt = "⚪ SINAIS RETRÓGRADOS ATIVOS: 2-AG ➔ CB1 (DSE/DSI) | NO ➔ sGC/cGMP (Pr ↑)";
    if (chelator === 'egta') chelatorTxt = "🧪 EGTA ATIVO: Acoplamento <30 nm resiste, fusão preservada!";
    else if (chelator === 'bapta') chelatorTxt = "🚫 BAPTA ATIVO: Quelação em <10 nm, FUSÃO ABOLIDA!";

    ctx.fillStyle = (chelator === 'bapta') ? "#ef4444" : ((chelator === 'egta') ? "#facc15" : (isAP ? "#ef4444" : "#22c55e"));
    ctx.font = "bold 8.5px sans-serif"; ctx.fillText(chelatorTxt, 16, 34);
    ctx.restore();

    // Presynaptic CB1 & sGC
    const cb1X = w * 0.08;
    ctx.save();
    ctx.fillStyle = "#16a34a"; ctx.fillRect(cb1X - 10, preY - 10, 20, 18);
    ctx.strokeStyle = "#4ade80"; ctx.lineWidth = 1.2; ctx.strokeRect(cb1X - 10, preY - 10, 20, 18);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 6.5px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("CB1", cb1X, preY - 12); ctx.fillText("Gi", cb1X, preY + 2);

    const sgcX = w * 0.18;
    ctx.fillStyle = "#0284c7"; ctx.fillRect(sgcX - 9, preY - 10, 18, 18);
    ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 1.0; ctx.strokeRect(sgcX - 9, preY - 10, 18, 18);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 5.5px sans-serif";
    ctx.fillText("sGC", sgcX, preY - 12); ctx.fillText("cGMP", sgcX, preY + 2);

    const daglX = w * 0.08;
    ctx.fillStyle = "#16a34a"; ctx.beginPath(); ctx.arc(daglX, postY + 8, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#4ade80"; ctx.stroke();
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 6px sans-serif"; ctx.fillText("DAGLα", daglX, postY + 7);
    ctx.font = "5px sans-serif"; ctx.fillText("2-AG", daglX, postY + 15);

    const nnosX = w * 0.18;
    ctx.fillStyle = "#0284c7"; ctx.beginPath(); ctx.arc(nnosX, postY + 8, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#38bdf8"; ctx.stroke();
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 6px sans-serif"; ctx.fillText("nNOS", nnosX, postY + 7);
    ctx.font = "5px sans-serif"; ctx.fillText("NO", nnosX, postY + 15);

    for (let r = 0; r < 3; r++) {
        const rProg = ((timeNow * 1.5 + r * 0.33) % 1.0);
        const ry = (postY - 4) - rProg * (cleftH - 8);
        ctx.fillStyle = "#4ade80"; ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(daglX + Math.sin(timeNow * 3 + r) * 4, ry, 3.0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    }

    for (let g = 0; g < 4; g++) {
        const gProg = ((timeNow * 2.0 + g * 0.25) % 1.0);
        const gy = (postY - 4) - gProg * cleftH;
        const gx = nnosX + Math.sin(timeNow * 4 + g) * 18;
        ctx.fillStyle = "rgba(56, 189, 248, 0.45)"; ctx.shadowColor = "#38bdf8"; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(gx, gy, 4.2 * (1 - gProg * 0.4), 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    }
    ctx.restore();

    // Reuptake Transporter
    const transX = w * 0.74;
    ctx.save();
    ctx.fillStyle = "#0284c7"; ctx.fillRect(transX - 10, preY - 10, 22, 18);
    ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 1.2; ctx.strokeRect(transX - 10, preY - 10, 22, 18);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 6.5px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(sys.transporter || "SERT", transX + 1, preY - 12);
    ctx.fillText("RECAP", transX + 1, preY + 2);
    ctx.restore();

    // Cav2.1 Calcium Channels with Nanodomain Sparks
    const isFusionBlocked = (chelator === 'bapta');

    for (let i = 0; i < 3; i++) {
        const cx = nanoCols[i].x - 18;
        const isChannelOpen = (isAP || Math.sin(timeNow * 4 + i) > 0.4) && !state.botulinumToxinActive;

        ctx.save();
        ctx.fillStyle = isChannelOpen ? "#facc15" : "#475569";
        ctx.fillRect(cx - 8, preY - 8, 16, 16);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.0; ctx.strokeRect(cx - 8, preY - 8, 16, 16);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 5.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Cav2.1", cx, preY - 11);
        ctx.fillText(isChannelOpen ? "Ca²⁺" : "FECH", cx, preY + 2);

        if (isChannelOpen && !isFusionBlocked) {
            ctx.fillStyle = (chelator === 'egta') ? "rgba(250, 204, 21, 0.20)" : "rgba(250, 204, 21, 0.38)";
            ctx.beginPath(); ctx.arc(cx, preY + 4, 18, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = "#facc15"; ctx.shadowColor = "#facc15"; ctx.shadowBlur = 10;
            for (let c = 0; c < 3; c++) {
                const cy = preY + 6 + ((timeNow * 45 + c * 16) % 28);
                ctx.beginPath(); ctx.arc(cx + (c - 1) * 3, cy, 2.5, 0, Math.PI * 2); ctx.fill();
            }
            ctx.shadowBlur = 0;
        }
        ctx.restore();
    }

    // Vesicular Pool Dynamics
    for (let i = 0; i < 12; i++) {
        const colIdx = i % 3;
        const nx = nanoCols[colIdx].x;
        const poolType = (i < 6) ? "reserve" : ((i < 9) ? "primed" : "fusion");

        let vx = nx + (i % 2 === 0 ? -10 : 10) + Math.sin(timeNow * 2 + i) * 3;
        let vy = 55 + Math.floor(i / 3) * 35;

        if (poolType === "primed") {
            vy = preY - 18;
            vx = nx + (i === 7 ? -8 : 8);
        } else if (poolType === "fusion" && isAP && !isFusionBlocked) {
            vy = preY - 4;
            vx = nx;
        }

        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.strokeStyle = (poolType === "fusion" && isAP && !isFusionBlocked) ? "#f43f5e" : sys.color;
        ctx.lineWidth = (poolType === "fusion" && isAP && !isFusionBlocked) ? 2.2 : 1.6;

        if (poolType === "fusion" && isAP && !isFusionBlocked) {
            ctx.beginPath();
            ctx.arc(vx, vy - 6, 11, 0.2 * Math.PI, 0.8 * Math.PI, true);
            ctx.lineTo(vx + 6, preY);
            ctx.lineTo(vx - 6, preY);
            ctx.closePath();
            ctx.fill(); ctx.stroke();

            ctx.fillStyle = sys.color; ctx.shadowColor = sys.color; ctx.shadowBlur = 10;
            for (let q = 0; q < 5; q++) {
                const qy = preY + 4 + ((timeNow * 60 + q * 10) % 24);
                ctx.beginPath(); ctx.arc(vx + (q - 2) * 4, qy, 3.2, 0, Math.PI * 2); ctx.fill();
            }
            ctx.shadowBlur = 0;
        } else {
            ctx.beginPath(); ctx.arc(vx, vy, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = sys.color; ctx.shadowColor = sys.color; ctx.shadowBlur = 5;
            ctx.beginPath(); ctx.arc(vx, vy, 7, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(vx + 10, vy - 2, 2.8, 0, Math.PI * 2); ctx.fill();

            if (poolType === "primed") {
                ctx.strokeStyle = "#f43f5e"; ctx.lineWidth = 1.6;
                ctx.beginPath(); ctx.moveTo(vx - 4, vy + 12); ctx.lineTo(vx - 4, preY); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(vx + 4, vy + 12); ctx.lineTo(vx + 4, preY); ctx.stroke();
                ctx.fillStyle = "#facc15"; ctx.fillRect(vx - 3, vy + 4, 6, 3);
            }
        }
        ctx.restore();
    }

    // =========================================================
    // 7. DIFUSÃO ESTOCÁSTICA DE NEUROTRANSMISSORES
    // =========================================================
    const particleCount = (isAP && !isFusionBlocked) ? 75 : (farmacoAcoplado(state) === 'fluoxetina' ? 55 : 28);
    for (let p = 0; p < particleCount; p++) {
        const colSource = nanoCols[p % 3].x;
        const radialDisp = (Math.sin(p * 13.7 + timeNow * 8) * (isMMP9 ? 52 : 34)) * ((p % 5) / 5);
        const px = colSource + radialDisp;
        const py = preY + 6 + ((p * 19 + timeNow * 48) % (cleftH - 12));

        ctx.save();
        ctx.fillStyle = sys.color; ctx.shadowColor = sys.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(px, py, 3.0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.restore();
    }

    // =========================================================
    // 8. POST-SYNAPTIC MEMBRANE & RECEPTORS
    // =========================================================
    ctx.save();
    ctx.fillStyle = isDark ? "#0f172a" : "#f1f5f9";
    ctx.strokeStyle = (isAP && !isFusionBlocked) ? "#10b981" : "#0284c7";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, postY);
    ctx.bezierCurveTo(w * 0.25, postY - 14, w * 0.75, postY - 14, w, postY);
    ctx.lineTo(w, h); ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.strokeStyle = isDark ? "rgba(16, 185, 129, 0.25)" : "rgba(2, 132, 199, 0.20)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, postY + 5);
    ctx.bezierCurveTo(w * 0.25, postY - 9, w * 0.75, postY - 9, w, postY + 5);
    ctx.stroke();
    ctx.restore();

    /*
     * v12.23.0 — RECEPTORES POS-SINAPTICOS, vindos da ontologia canonica.
     *
     * Antes: seis caixas, todas rotuladas com `sys.receptors.split(',')[0]` — o primeiro item de
     * uma frase. Em dopamina isso e sempre "D1": seis D1 e nenhum D2. Agora a fenda pergunta a
     * TARGETS_CANON quais receptores o sistema tem, e desenha os que existem.
     *
     * Canal e GPCR sao desenhados diferente. Os cinco receptores dopaminergicos sao GPCR e eram
     * pintados como poros piscando ABERTO/FECH — D2 acopla Gi/o e reduz AMPc, nao abre canal.
     */
    const receptores = (typeof receptoresDoSistema === "function") ? receptoresDoSistema(state.system) : [];
    if (receptores.length === 0) {
        // Vazio e resposta, nao falha: ecb, opioid e adenosine ainda nao entraram na ontologia.
        // Dizer isso e mais honesto do que desenhar caixas que nao correspondem a dado nenhum.
        ctx.save();
        ctx.fillStyle = "#94a3b8";
        ctx.font = "italic bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Receptores deste sistema ainda nao estao na ontologia canonica v" + TARGETS_CANON_VERSION,
                     w * 0.5, postY - 14);
        ctx.fillText("(a prosa do sistema os cita; o vocabulario canonico ainda nao)", w * 0.5, postY - 3);
        ctx.textAlign = "start";
        ctx.restore();
    } else {
    const nRec = Math.min(receptores.length, 6);
    for (let i = 0; i < nRec; i++) {
        const rec = receptores[i];
        const rx = w * 0.18 + i * (w * 0.66 / Math.max(nRec - 1, 1));
        // So canal tem poro que abre. GPCR sinaliza — nao ha o que abrir.
        const isRecOpen = rec.ionotropico && ((isAP && !isFusionBlocked) || (Math.sin(timeNow * 3 + i) > 0.1));
        const ativoGPCR = !rec.ionotropico && ((isAP && !isFusionBlocked) || (Math.sin(timeNow * 2 + i) > 0.3));

        ctx.save();
        ctx.fillStyle = (isRecOpen || ativoGPCR) ? sys.color : "#475569";
        if (rec.ionotropico) {
            ctx.fillRect(rx - 14, postY - 10, 28, 18);
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.2; ctx.strokeRect(rx - 14, postY - 10, 28, 18);
        } else {
            // GPCR: sete helices, nao um poro. Desenhado arredondado para nao parecer canal.
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(rx - 14, postY - 10, 28, 18, 8);
            else ctx.rect(rx - 14, postY - 10, 28, 18);
            ctx.fill();
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.2; ctx.stroke();
        }

        ctx.fillStyle = "#ffffff"; ctx.font = "bold 6.5px sans-serif"; ctx.textAlign = "center";
        const nome = rec.label.length > 16 ? rec.label.slice(0, 15) + "…" : rec.label;
        ctx.fillText(nome, rx, postY - 13);
        if (rec.ionotropico) {
            ctx.fillText(isRecOpen ? "ABERTO" : "FECH", rx, postY + 2);
        } else {
            // O acoplamento e o conteudo de ensino do GPCR: Gs sobe AMPc, Gi desce, Gq vai por IP3.
            const acoplamento = (rec.coupling || "GPCR").split(/[;→]/)[0].trim();
            ctx.fillText(acoplamento.length > 9 ? acoplamento.slice(0, 8) + "…" : acoplamento, rx, postY + 2);
        }

        if (isRecOpen) {
            ctx.fillStyle = (state.system === "gaba") ? "#22c55e" : "#38bdf8";
            for (let ion = 0; ion < 3; ion++) {
                const iy = postY + 14 + ((timeNow * 40 + ion * 14) % 32);
                ctx.beginPath(); ctx.arc(rx + (ion - 1) * 3, iy, 2.5, 0, Math.PI * 2); ctx.fill();
            }
        } else if (ativoGPCR) {
            // GPCR nao deixa ion passar: propaga sinal. Uma onda curta, nao particulas atravessando.
            ctx.strokeStyle = sys.color; ctx.lineWidth = 1.6;
            ctx.beginPath();
            const raio = 6 + ((timeNow * 18) % 10);
            ctx.arc(rx, postY + 12, raio, 0.15 * Math.PI, 0.85 * Math.PI);
            ctx.stroke();
        }
        ctx.restore();
    }
    }

    // =========================================================
    // 9. PARTE 9: ACTIVE DRUG DOCKING & RESIDENCE TIME (tR = 1/k_off)
    // Copeland Nat Rev Drug Discov 2006, Stahl 2021
    // =========================================================
    if (activeDrugId !== 'none' && aff) {
        let dockX = w * 0.40;
        let dockY = postY - 14;

        if (activeDrugId === 'fluoxetina' || activeDrugId === 'sertralina' || activeDrugId === 'escitalopram') {
            dockX = transX + 1; dockY = preY + 12;
        } else if (activeDrugId === 'bupropiona') {
            dockX = transX + 1; dockY = preY + 12;
        } else if (activeDrugId === 'cetamina') {
            dockX = w * 0.51; dockY = postY - 14;
        }

        ctx.save();
        ctx.shadowColor = "#a855f7"; ctx.shadowBlur = 14;
        ctx.fillStyle = "#a855f7"; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(dockX - 44, dockY - 14, 88, 28, 12) : ctx.rect(dockX - 44, dockY - 14, 88, 28);
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#ffffff"; ctx.font = "bold 8px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(`🔒 ${aff.name.split(' ')[0]}`, dockX, dockY + 1);
        ctx.font = "6px monospace"; ctx.fillStyle = "#f3e8ff";
        ctx.fillText(`tR: ${aff.residenceTime || '1.2s'}`, dockX, dockY + 9);
        ctx.restore();
    }

    const oscW = 135;
    const oscH = 55;
    const HUD_BOTTOM_GAP = 48; // espaço reservado para a barra de controles flutuante
    const oscX = w - oscW - 14;
    const oscY = h - oscH - 12 - HUD_BOTTOM_GAP;

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 1.2;
    ctx.fillRect(oscX, oscY, oscW, oscH);
    ctx.strokeRect(oscX, oscY, oscW, oscH);

    ctx.fillStyle = "#38bdf8"; ctx.font = "bold 6.5px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("POTENCIAL (mV) & [NT] QUANTAL", oscX + 6, oscY + 10);

    // Voltage Waveform
    ctx.strokeStyle = (isAP && !isFusionBlocked) ? "#ef4444" : "#22c55e"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let ox = 0; ox < oscW - 12; ox++) {
        const tOff = (timeNow * 8 - ox * 0.1);
        let vVal = (isAP && !isFusionBlocked) ? (Math.sin(tOff) * 14) : (Math.sin(tOff) * 2.5);
        const oy = oscY + 30 - vVal;
        if (ox === 0) ctx.moveTo(oscX + 6 + ox, oy);
        else ctx.lineTo(oscX + 6 + ox, oy);
    }
    ctx.stroke();

    // Quantal Concentration Line
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 1.2; ctx.setLineDash([2, 2]);
    ctx.beginPath();
    for (let ox = 0; ox < oscW - 12; ox++) {
        const cVal = (isAP && !isFusionBlocked) ? (Math.max(0, Math.sin(timeNow * 8 - ox * 0.1)) * 12) : 2;
        const oy = oscY + 46 - cVal;
        if (ox === 0) ctx.moveTo(oscX + 6 + ox, oy);
        else ctx.lineTo(oscX + 6 + ox, oy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = (isAP && !isFusionBlocked) ? "#ef4444" : "#22c55e"; ctx.font = "bold 7px monospace"; ctx.textAlign = "right";
    ctx.fillText((isAP && !isFusionBlocked) ? "+30 mV" : "-70 mV", oscX + oscW - 6, oscY + 20);
    ctx.fillStyle = "#f59e0b";
    ctx.fillText((isAP && !isFusionBlocked) ? "2.4 mM" : "0.01 mM", oscX + oscW - 6, oscY + 32);
    ctx.restore();

    // =========================================================
    // 10. INTERACTIVE HOVER TOOLTIP CARD (GLASSMORPHISM)
    // =========================================================
    if (hoveredSynapseComponent) {
        const comp = hoveredSynapseComponent;
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 1.5;
        ctx.fillRect(14, h - 58 - HUD_BOTTOM_GAP, w - oscW - 38, 48);
        ctx.strokeRect(14, h - 58 - HUD_BOTTOM_GAP, w - oscW - 38, 48);

        ctx.fillStyle = "#38bdf8"; ctx.font = "bold 9.5px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(comp.title, 22, h - 42 - HUD_BOTTOM_GAP);

        ctx.fillStyle = "#f8fafc"; ctx.font = "8px sans-serif";
        ctx.fillText(comp.desc, 22, h - 26 - HUD_BOTTOM_GAP);
        ctx.restore();
    } else {
        // Default Bottom Status HUD
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.35)"; ctx.lineWidth = 1.0;
        ctx.fillRect(14, h - 42 - HUD_BOTTOM_GAP, w - oscW - 38, 32);
        ctx.strokeRect(14, h - 42 - HUD_BOTTOM_GAP, w - oscW - 38, 32);

        ctx.fillStyle = "#38bdf8"; ctx.font = "bold 8.5px sans-serif"; ctx.textAlign = "left";
        if (activeDrugId !== 'none' && aff) {
            ctx.fillText(`💊 FÁRMACO ATIVO: ${aff.name.toUpperCase()} (tR: ${aff.residenceTime || '1.2s'})`, 22, h - 26 - HUD_BOTTOM_GAP);
            ctx.fillStyle = "#cbd5e1"; ctx.font = "7.5px sans-serif";
            ctx.fillText(`Mecanismo: ${aff.mechanism || 'Modulação da transmissão sináptica.'}`, 22, h - 14 - HUD_BOTTOM_GAP);
        } else {
            ctx.fillText(`🔬 TRANSMISSÃO SINÁPTICA (${sys.name.toUpperCase()}):`, 22, h - 26 - HUD_BOTTOM_GAP);
            ctx.fillStyle = "#94a3b8"; ctx.font = "7.5px sans-serif";
            ctx.fillText("Roadmap em 10 Partes 100% Integrado: Nanocolunas, LLPS, Nanodomínios, ECM, Sinais Retrógrados e Psicoplastia.", 22, h - 14 - HUD_BOTTOM_GAP);
        }
        ctx.restore();
    }
}

function animateSynaptic3DVesicles() {
    const delta = clockDelta ? clockDelta.getDelta() : 0.016;

    if (vesicles3D && vesicles3D.length > 0) {
        vesicles3D.forEach((v, idx) => {
            v.position.y -= v.userData.speed * delta * 2.2;
            if (v.position.y < 0.5) {
                v.position.y = v.userData.initialY;
            }
        });
    }

    if (ionParticles3D && ionParticles3D.length > 0) {
        ionParticles3D.forEach(p => {
            p.position.y -= p.userData.dir * p.userData.speed;
            if (p.position.y < -7.2) p.position.y = -3.8;
            if (p.position.y > -3.5) p.position.y = -7.0;
        });
    }

    if (camkiiGroup) {
        camkiiGroup.rotation.y += delta * 0.4;
    }
}


// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { CLEFT_COMPONENT_INFO, SYNAPTIC_MACHINERY, animateSynaptic3DVesicles, biochemicalCyclesData,
    buildSynapticCleft3D, camkiiGroup, cleft3DGroup, definirCleft3DGroup, definirHoveredSynapseComponent,
    dossierByStep, dossierTargets, dossiersForTarget, drawSynapse2D, escolherSistema, initSynapticParticles,
    ionParticles3D, machineryForDossier, molecularAdvancesData, onSynapseCanvasClick, onSynapseCanvasMouseMove,
    particlePool, postMembraneMesh, receptors3DGroup, renderStepCard, showCleftTooltip, sinapseReageAoPA, vesicles3D };
// ── fim do exporta ──
