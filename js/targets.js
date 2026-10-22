// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
// ── fim dos módulos ──
// GERADO por scripts/build-de-para.mjs — NÃO EDITE À MÃO.
// Ontologia canônica de alvos v0.3.0 (2026-09-02), vendorizada de data/targets.json.
// Origem: ROADMAP-INTEGRACAO-SOPSI.md — Fase 0 (decisão do PO, 2026-08-26).
const TARGETS_CANON_VERSION = "0.3.0";
const TARGETS_CANON = {
 "5-HT1A": {
  "label": "5-HT1A",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o → GIRK; ↓AMPc",
  "system": "5ht"
 },
 "5-HT1B": {
  "label": "5-HT1B",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o; ↓liberação",
  "system": "5ht",
  "nota": "no atlas vive na linha agregada '5-HT1B/1D'"
 },
 "5-HT1D": {
  "label": "5-HT1D",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o; ↓liberação",
  "system": "5ht",
  "nota": "no atlas vive na linha agregada '5-HT1B/1D'"
 },
 "5-HT2A": {
  "label": "5-HT2A",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gq/11 → PLCβ → IP3/DAG",
  "system": "5ht"
 },
 "5-HT2C": {
  "label": "5-HT2C",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gq/11 → PLC",
  "system": "5ht"
 },
 "5-HT3": {
  "label": "5-HT3",
  "kind": "receptor",
  "family": "Canal catiônico",
  "coupling": "Na⁺/K⁺ e, conforme a composição, Ca²⁺",
  "system": "5ht"
 },
 "5-HT4": {
  "label": "5-HT4",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Principalmente Gs → ↑AMPc",
  "system": "5ht",
  "nota": "no atlas vive na linha agregada '5-HT4/6/7'"
 },
 "5-HT6": {
  "label": "5-HT6",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Principalmente Gs → ↑AMPc",
  "system": "5ht",
  "nota": "no atlas vive na linha agregada '5-HT4/6/7'"
 },
 "5-HT7": {
  "label": "5-HT7",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Principalmente Gs → ↑AMPc",
  "system": "5ht",
  "nota": "no atlas vive na linha agregada '5-HT4/6/7'"
 },
 "SERT": {
  "label": "SERT",
  "kind": "transportador",
  "family": "SLC6/SLC1",
  "coupling": "Simporte dependente de Na⁺/Cl⁻",
  "system": "5ht",
  "gene": "SLC6A4"
 },
 "α1A": {
  "label": "α1A",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gq/11 → PLCβ",
  "system": "ne",
  "nota": "no atlas vive na linha agregada 'α1A/α1B/α1D'"
 },
 "α1B": {
  "label": "α1B",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gq/11 → PLCβ",
  "system": "ne",
  "nota": "no atlas vive na linha agregada 'α1A/α1B/α1D'"
 },
 "α1D": {
  "label": "α1D",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gq/11 → PLCβ",
  "system": "ne",
  "nota": "no atlas vive na linha agregada 'α1A/α1B/α1D'"
 },
 "α2A": {
  "label": "α2A",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o → ↓AMPc; modula HCN",
  "system": "ne"
 },
 "α2B": {
  "label": "α2B",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o",
  "system": "ne",
  "nota": "no atlas vive na linha agregada 'α2B/α2C'"
 },
 "α2C": {
  "label": "α2C",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o",
  "system": "ne",
  "nota": "no atlas vive na linha agregada 'α2B/α2C'"
 },
 "β1": {
  "label": "β1",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gs → ↑AMPc/PKA",
  "system": "ne"
 },
 "β2": {
  "label": "β2",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gs; sinalização contextual",
  "system": "ne"
 },
 "β3": {
  "label": "β3",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gs",
  "system": "ne"
 },
 "NET": {
  "label": "NET",
  "kind": "transportador",
  "family": "SLC6/SLC1",
  "coupling": "Simporte dependente de Na⁺/Cl⁻",
  "system": "ne",
  "gene": "SLC6A2"
 },
 "D1": {
  "label": "D1",
  "kind": "receptor",
  "family": "D1-like GPCR",
  "coupling": "Gs/Golf → ↑AMPc/PKA",
  "system": "da"
 },
 "D5": {
  "label": "D5",
  "kind": "receptor",
  "family": "D1-like GPCR",
  "coupling": "Gs/Golf",
  "system": "da"
 },
 "D2": {
  "label": "D2",
  "kind": "receptor",
  "family": "D2-like GPCR",
  "coupling": "Gi/o → ↓AMPc; canais e β-arrestina",
  "system": "da"
 },
 "D3": {
  "label": "D3",
  "kind": "receptor",
  "family": "D2-like GPCR",
  "coupling": "Gi/o, com sinalização contextual",
  "system": "da"
 },
 "D4": {
  "label": "D4",
  "kind": "receptor",
  "family": "D2-like GPCR",
  "coupling": "Gi/o",
  "system": "da"
 },
 "DAT": {
  "label": "DAT",
  "kind": "transportador",
  "family": "SLC6/SLC1",
  "coupling": "Simporte dependente de Na⁺/Cl⁻",
  "system": "da",
  "gene": "SLC6A3"
 },
 "AMPA": {
  "label": "AMPA",
  "kind": "receptor",
  "family": "Canal catiônico tetramérico",
  "coupling": "Na⁺/K⁺; Ca²⁺ conforme GluA2",
  "system": "glu",
  "cascata": "Abre em ~1 ms: Na⁺ para dentro, K⁺ para fora — o EPSP rápido. É essa despolarização que ejeta o Mg²⁺ do NMDA vizinho; sem AMPA antes, não há NMDA depois. A inserção de novas GluA1 na membrana é o substrato expresso da LTP."
 },
 "NMDA": {
  "label": "NMDA",
  "kind": "receptor",
  "family": "Canal catiônico tetramérico",
  "coupling": "Na⁺/Ca²⁺; bloqueio por Mg²⁺ dependente de voltagem",
  "system": "glu",
  "cascata": "Detector de coincidência: exige glutamato + glicina/D-serina E despolarização prévia. Ejetado o Mg²⁺, entra Ca²⁺ ➔ CaMKII (autofosforilação em Thr286, que a mantém ativa depois que o Ca²⁺ cai) ➔ inserção de AMPA ➔ LTP. O MESMO Ca²⁺, excessivo e sustentado, ativa calpaínas e nNOS: é a excitotoxicidade. Uma via, dois destinos, separados por dose e tempo."
 },
 "Kainato": {
  "label": "Kainato",
  "kind": "receptor",
  "family": "Canal catiônico",
  "coupling": "Na⁺/K⁺; funções pré e pós-sinápticas",
  "system": "glu",
  "cascata": "Pós-sináptico gera correntes lentas; pré-sináptico modula a própria liberação de glutamato e de GABA. Parte dos efeitos é metabotrópica (Gi/o) apesar de o receptor ser canal — exceção útil para quebrar a dicotomia canal/GPCR na aula."
 },
 "mGlu grupo I": {
  "label": "mGlu grupo I",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gq/11",
  "system": "glu",
  "cascata": "Gq/11 ➔ PLCβ ➔ PIP₂ em IP₃ + DAG. O IP₃ libera Ca²⁺ dos estoques; o DAG alimenta a DAGLα e vira 2-AG, que atravessa a fenda AO CONTRÁRIO e ativa CB1 pré-sináptico, reduzindo a liberação do próprio glutamato. É a ponte com a camada endocanabinoide: sinalização retrógrada, o pós falando com o pré."
 },
 "mGlu grupos II/III": {
  "label": "mGlu grupos II/III",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o",
  "system": "glu",
  "cascata": "Gi/o ➔ queda da adenilato-ciclase ➔ queda do AMPc. Majoritariamente pré-sinápticos e perissinápticos: o freio autorreceptor que limita a própria liberação quando o glutamato transborda da fenda."
 },
 "EAAT": {
  "label": "EAAT",
  "kind": "transportador",
  "family": "SLC6/SLC1",
  "coupling": "Cotransporte dependente de Na⁺/K⁺, majoritariamente astrocitário",
  "system": "glu",
  "gene": "SLC1A1–3",
  "cascata": "Cotransporte eletrogênico (3 Na⁺ + 1 H⁺ para dentro, 1 K⁺ para fora) — a captação em si gera corrente. No astrócito o glutamato captado vira glutamina pela glutamina sintetase e volta ao neurônio; a mesma carga acopla captação de glicose e shuttle de lactato."
 },
 "GABA-A sináptico": {
  "label": "GABA-A sináptico",
  "kind": "receptor",
  "family": "Canal aniônico pentamérico",
  "coupling": "Cl⁻/HCO₃⁻",
  "system": "gaba"
 },
 "GABA-A extrasináptico": {
  "label": "GABA-A extrasináptico",
  "kind": "receptor",
  "family": "Canal aniônico pentamérico",
  "coupling": "Cl⁻/HCO₃⁻",
  "system": "gaba"
 },
 "GABA-A α5": {
  "label": "GABA-A α5",
  "kind": "receptor",
  "family": "Canal aniônico pentamérico",
  "coupling": "Cl⁻/HCO₃⁻",
  "system": "gaba"
 },
 "GABA-B": {
  "label": "GABA-B",
  "kind": "receptor",
  "family": "GPCR heterodimérico",
  "coupling": "Gi/o → GIRK; ↓Ca²⁺ pré-sináptico",
  "system": "gaba"
 },
 "GAT": {
  "label": "GAT",
  "kind": "transportador",
  "family": "SLC6/SLC1",
  "coupling": "Simporte dependente de Na⁺/Cl⁻",
  "system": "gaba",
  "gene": "SLC6A1"
 },
 "5-HT1": {
  "label": "5-HT1",
  "kind": "familia",
  "family": "agrupamento",
  "coupling": "—",
  "system": "5ht",
  "nota": "família, não subtipo; membros: 5-HT1A, 5-HT1B, 5-HT1D"
 },
 "5-HT2": {
  "label": "5-HT2",
  "kind": "familia",
  "family": "agrupamento",
  "coupling": "—",
  "system": "5ht",
  "nota": "família, não subtipo; membros: 5-HT2A, 5-HT2C"
 },
 "α1": {
  "label": "α1",
  "kind": "familia",
  "family": "agrupamento",
  "coupling": "—",
  "system": "ne",
  "nota": "família, não subtipo; membros: α1A, α1B, α1D"
 },
 "α2": {
  "label": "α2",
  "kind": "familia",
  "family": "agrupamento",
  "coupling": "—",
  "system": "ne",
  "nota": "família, não subtipo; membros: α2A, α2B, α2C"
 },
 "β": {
  "label": "β",
  "kind": "familia",
  "family": "agrupamento",
  "coupling": "—",
  "system": "ne",
  "nota": "família, não subtipo; membros: β1, β2, β3"
 },
 "D1-like": {
  "label": "D1-like",
  "kind": "familia",
  "family": "agrupamento",
  "coupling": "—",
  "system": "da",
  "nota": "família, não subtipo; membros: D1, D5"
 },
 "D2-like": {
  "label": "D2-like",
  "kind": "familia",
  "family": "agrupamento",
  "coupling": "—",
  "system": "da",
  "nota": "família, não subtipo; membros: D2, D3, D4"
 },
 "TH": {
  "label": "Tirosina-hidroxilase",
  "kind": "enzima",
  "family": "enzima/transporte vesicular",
  "coupling": "—",
  "system": "da"
 },
 "AADC": {
  "label": "Descarboxilase de L-aminoácidos aromáticos",
  "kind": "enzima",
  "family": "enzima/transporte vesicular",
  "coupling": "—",
  "system": "da"
 },
 "DBH": {
  "label": "Dopamina β-hidroxilase",
  "kind": "enzima",
  "family": "enzima/transporte vesicular",
  "coupling": "—",
  "system": "ne"
 },
 "MAO-A": {
  "label": "Monoamina-oxidase A",
  "kind": "enzima",
  "family": "enzima/transporte vesicular",
  "coupling": "—",
  "system": null
 },
 "COMT": {
  "label": "Catecol-O-metiltransferase",
  "kind": "enzima",
  "family": "enzima/transporte vesicular",
  "coupling": "—",
  "system": null
 },
 "NOS": {
  "label": "Óxido nítrico sintase",
  "kind": "enzima",
  "family": "enzima/transporte vesicular",
  "coupling": "—",
  "system": null
 },
 "H1": {
  "label": "Receptor histaminérgico H1",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gq/11",
  "system": "his",
  "nota": "sistema ausente do atlas do simulador"
 },
 "M1": {
  "label": "Receptor muscarínico M1",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gq/11",
  "system": "ach",
  "nota": "sistema ausente do atlas do simulador"
 },
 "σ1": {
  "label": "Receptor sigma-1",
  "kind": "receptor",
  "family": "chaperona",
  "coupling": "chaperona de RE",
  "system": "outro",
  "nota": "sistema ausente do atlas do simulador"
 },
 "VMAT2": {
  "label": "Transportador vesicular de monoaminas 2",
  "kind": "transportador vesicular",
  "family": "SLC18",
  "coupling": "Antiporte dependente de H⁺ (carrega a monoamina para a vesícula)",
  "system": null,
  "gene": "SLC18A2"
 },
 "CB1": {
  "label": "CB1",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o → ↓AMPc; ↓Cav e ↑GIRK no terminal (sinalização retrógrada)",
  "system": "ecb",
  "gene": "CNR1",
  "nota": "GPCR mais abundante do cérebro; pré-sináptico, medeia DSI/DSE",
  "cascata": "Gi/o pré-sináptico ➔ queda do AMPc e inibição de canais de Ca²⁺ N/P/Q ➔ menos liberação do transmissor. É o alvo do 2-AG produzido no pós-sináptico: o receptor que fecha o arco retrógrado aberto pelo mGlu grupo I."
 },
 "CB2": {
  "label": "CB2",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o → ↓AMPc",
  "system": "ecb",
  "gene": "CNR2",
  "nota": "predomina em microglia e periferia"
 },
 "TRPV1": {
  "label": "TRPV1",
  "kind": "receptor",
  "family": "Canal catiônico TRP",
  "coupling": "Ca²⁺/Na⁺; ativado por anandamida, calor e capsaicina",
  "system": "ecb",
  "gene": "TRPV1",
  "nota": "canal, não GPCR; engajado por alguns canabinoides"
 },
 "MOR": {
  "label": "μ (MOR)",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o → ↓AMPc; ↑GIRK e ↓Cav (hiperpolariza)",
  "system": "opioid",
  "gene": "OPRM1",
  "nota": "alvo da morfina e da metadona; analgesia, euforia e depressão respiratória"
 },
 "DOR": {
  "label": "δ (DOR)",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o → ↓AMPc",
  "system": "opioid",
  "gene": "OPRD1"
 },
 "KOR": {
  "label": "κ (KOR)",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o → ↓AMPc",
  "system": "opioid",
  "gene": "OPRK1",
  "nota": "disforia e efeitos psicotomiméticos; dinorfina é o ligante endógeno"
 },
 "NOP": {
  "label": "NOP (nociceptina)",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o → ↓AMPc",
  "system": "opioid",
  "gene": "OPRL1",
  "nota": "não é bloqueado pela naloxona clássica"
 },
 "A1": {
  "label": "A1",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o → ↑GIRK, ↓Cav; ↓liberação de glutamato",
  "system": "adenosine",
  "gene": "ADORA1",
  "nota": "córtex, hipocampo e SRAA; medeia a sonolência da pressão de sono"
 },
 "A2A": {
  "label": "A2A",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gs → ↑AMPc",
  "system": "adenosine",
  "gene": "ADORA2A",
  "nota": "estriado; forma heterodímero com D2 — é por aí que a cafeína conversa com o antipsicótico"
 },
 "A2B": {
  "label": "A2B",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gs → ↑AMPc (baixa afinidade)",
  "system": "adenosine",
  "gene": "ADORA2B"
 },
 "A3": {
  "label": "A3",
  "kind": "receptor",
  "family": "GPCR",
  "coupling": "Gi/o → ↓AMPc",
  "system": "adenosine",
  "gene": "ADORA3"
 }
};
// de-para: chave de alvo do NeuroSim → id canônico. nivel 'familia' = o canônico tem subtipos.
const TARGET_MAP = {
 "sert": {
  "id": "SERT",
  "nivel": "subtipo"
 },
 "net": {
  "id": "NET",
  "nivel": "subtipo"
 },
 "d2": {
  "id": "D2",
  "nivel": "subtipo"
 },
 "5ht2a": {
  "id": "5-HT2A",
  "nivel": "subtipo"
 },
 "5ht2c": {
  "id": "5-HT2C",
  "nivel": "subtipo"
 },
 "h1": {
  "id": "H1",
  "nivel": "subtipo"
 },
 "m1": {
  "id": "M1",
  "nivel": "subtipo"
 },
 "alpha1": {
  "id": "α1",
  "nivel": "familia"
 },
 "alpha2": {
  "id": "α2",
  "nivel": "familia"
 }
};
// índice de aliases normalizados → id canônico (mesma normalização do build_ontologia.py)
const TARGET_ALIAS_INDEX = {
 "5ht1a": "5-HT1A",
 "5ht1b": "5-HT1B",
 "5ht1d": "5-HT1D",
 "5ht2a": "5-HT2A",
 "5ht2c": "5-HT2C",
 "5ht3": "5-HT3",
 "5ht4": "5-HT4",
 "5ht6": "5-HT6",
 "5ht7": "5-HT7",
 "sert": "SERT",
 "5htt": "SERT",
 "slc6a4": "SERT",
 "alpha1a": "α1A",
 "alpha1b": "α1B",
 "alpha1d": "α1D",
 "alpha2a": "α2A",
 "alpha2b": "α2B",
 "alpha2c": "α2C",
 "beta1": "β1",
 "beta2": "β2",
 "beta3": "β3",
 "net": "NET",
 "nat": "NET",
 "noradrenalina(nat)": "NET",
 "slc6a2": "NET",
 "d1": "D1",
 "d5": "D5",
 "d2": "D2",
 "d3": "D3",
 "d4": "D4",
 "dat": "DAT",
 "slc6a3": "DAT",
 "ampa": "AMPA",
 "nmda": "NMDA",
 "kainato": "Kainato",
 "mglugrupoi": "mGlu grupo I",
 "mglugruposiiiii": "mGlu grupos II/III",
 "eaat": "EAAT",
 "glast": "EAAT",
 "glt1": "EAAT",
 "gabaasinaptico": "GABA-A sináptico",
 "gabaaextrasinaptico": "GABA-A extrasináptico",
 "gabaaalpha5": "GABA-A α5",
 "gabab": "GABA-B",
 "gat": "GAT",
 "gat1": "GAT",
 "slc6a1": "GAT",
 "5ht1": "5-HT1",
 "5ht2": "5-HT2",
 "alpha1": "α1",
 "alpha2": "α2",
 "beta": "β",
 "d1like": "D1-like",
 "d2like": "D2-like",
 "th": "TH",
 "tirosinahidroxilase": "TH",
 "aadc": "AADC",
 "ddc": "AADC",
 "descarboxilasedelaminoacidosaromaticos": "AADC",
 "dbh": "DBH",
 "dopaminabetahidroxilase": "DBH",
 "maoa": "MAO-A",
 "mao": "MAO-A",
 "monoaminaoxidasea": "MAO-A",
 "comt": "COMT",
 "catecolometiltransferase": "COMT",
 "nos": "NOS",
 "oxidonitrico(nos)": "NOS",
 "oxidonitricosintase": "NOS",
 "h1": "H1",
 "receptorhistaminergicoh1": "H1",
 "m1": "M1",
 "receptormuscarinicom1": "M1",
 "sigma1": "σ1",
 "receptorsigma1": "σ1",
 "σ1": "σ1",
 "vmat2": "VMAT2",
 "slc18a2": "VMAT2",
 "transportadorvesiculardemonoaminas2": "VMAT2",
 "cb1": "CB1",
 "cnr1": "CB1",
 "receptor canabinoide 1": "CB1",
 "cb2": "CB2",
 "cnr2": "CB2",
 "receptor canabinoide 2": "CB2",
 "trpv1": "TRPV1",
 "receptor vaniloide": "TRPV1",
 "capsaicina": "TRPV1",
 "mor": "MOR",
 "mu": "MOR",
 "µ": "MOR",
 "oprm1": "MOR",
 "receptor mu": "MOR",
 "dor": "DOR",
 "delta": "DOR",
 "δ": "DOR",
 "oprd1": "DOR",
 "receptor delta": "DOR",
 "kor": "KOR",
 "kappa": "KOR",
 "κ": "KOR",
 "oprk1": "KOR",
 "receptor kappa": "KOR",
 "nop": "NOP",
 "orl-1": "NOP",
 "orl1": "NOP",
 "oprl1": "NOP",
 "nociceptina": "NOP",
 "orfanina fq": "NOP",
 "a1": "A1",
 "adora1": "A1",
 "receptor a1": "A1",
 "a2a": "A2A",
 "adora2a": "A2A",
 "receptor a2a": "A2A",
 "a2b": "A2B",
 "adora2b": "A2B",
 "a3": "A3",
 "adora3": "A3"
};
function normTargetName(s) {
  let x = String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  x = x.replace(/\u03b1/g, 'alpha').replace(/\u03b2/g, 'beta').replace(/\u03c3/g, 'sigma').replace(/alfa/g, 'alpha');
  return x.replace(/[\s\-._/]/g, '');
}
// resolve um nome livre ("5-HT2A", "alpha1", "NAT") para o id canônico, ou null
function resolveTargetId(s) { return TARGET_ALIAS_INDEX[normTargetName(s)] || null; }
// id canônico da chave local do app ('d2' → 'D2')
function canonicalTarget(key) { return (TARGET_MAP[key] || {}).id || null; }

// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { TARGETS_CANON, TARGETS_CANON_VERSION, canonicalTarget };
// ── fim do exporta ──
