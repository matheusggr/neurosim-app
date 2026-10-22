// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import '../dominios/neuronio.js?v=12.66.0';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { canonicalTarget } from '../targets.js?v=12.66.0';
import { MODO } from '../data.js?v=12.66.0';
import { store } from '../store.js?v=12.66.0';
import { escapeHtml } from '../features.js?v=12.66.0';
import { playBioTone } from '../engine.js?v=12.66.0';
// ── fim dos módulos ──
/*
 * DOMINIO PSICOFARMACOS — um palco inteiro num arquivo so (decisao D3 do autor, "pastas por dominio").
 *
 * Ate a v12.47 este codigo morava espalhado por 4 arquivo(s) organizados por CAMADA
 * (data.js, features.js, render3d.js, main.js): quem quisesse mexer neste palco procurava em todos.
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

// =========================================================
// v12.40 (Bloco 5, decisao 11 do PO): UM SO FARMACO ATIVO. A prescricao (selectedDrugsList) e a UNICA lista; a prateleira
// "farmacos deste sistema" e DADO (vinha de ui.js) e filtra essa lista; o farmaco acoplado na fenda e DERIVADO —
// farmacoAcoplado(state) = o ultimo prescrito que pertence ao sistema atual. Nao existe mais selectedDrugId/drugDocked.
// =========================================================
const systemDrugsMap = {
    da: [
        { id: 'none', label: '⚪ Nenhum Fármaco' },
        { id: 'risperidona', label: '💊 Risperidona (SDA)' },
        { id: 'haloperidol', label: '💊 Haloperidol (D2 Slow-off)' },
        { id: 'clozapina', label: '💊 Clozapina (D2 Fast-off)' },
        { id: 'olanzapina', label: '💊 Olanzapina' },
        { id: 'quetiapina', label: '💊 Quetiapina' },
        { id: 'ziprasidona', label: '💊 Ziprasidona (SDA / QTc)' },
        { id: 'bupropiona', label: '💊 Bupropiona (DAT)' }
    ],
    '5ht': [
        { id: 'none', label: '⚪ Nenhum Fármaco' },
        { id: 'escitalopram', label: '💊 Escitalopram (ISRS Puro)' },
        { id: 'fluoxetina', label: '💊 Fluoxetina (ISRS/5HT2C)' },
        { id: 'sertralina', label: '💊 Sertralina (ISRS/DAT)' },
        { id: 'venlafaxina', label: '💊 Venlafaxina (IRSN)' },
        { id: 'mirtazapina', label: '💊 Mirtazapina (NaSSA)' },
        { id: 'paroxetina', label: '💊 Paroxetina (ISRS + M1)' },
        { id: 'citalopram', label: '💊 Citalopram (ISRS / QTc)' },
        { id: 'clomipramina', label: '💊 Clomipramina (ADT / SERT)' }
    ],
    ne: [
        { id: 'none', label: '⚪ Nenhum Fármaco' },
        { id: 'venlafaxina', label: '💊 Venlafaxina (IRSN)' },
        { id: 'duloxetina', label: '💊 Duloxetina (IRSN Dual)' },
        { id: 'bupropiona', label: '💊 Bupropiona (NET/DAT)' }
    ],
    glu: [
        { id: 'none', label: '⚪ Nenhum Fármaco' },
        { id: 'cetamina', label: '💊 Esquetamina / Cetamina (NMDA/TrkB)' },
        { id: 'litio', label: '💊 Lítio (Neuroproteção)' }
    ],
    gaba: [
        { id: 'none', label: '⚪ Nenhum Fármaco' },
        { id: 'clonazepam', label: '💊 Clonazepam (BZD/GABA-A)' },
        { id: 'valproato', label: '💊 Valproato (GABA-T)' }
    ],
    ecb: [
        { id: 'none', label: '⚪ Nenhum Fármaco' },
        { id: 'cbd', label: '💊 Canabidiol (CBD)' },
        { id: 'thc', label: '💊 Delta-9-THC (CB1)' }
    ],
    opioid: [
        { id: 'none', label: '⚪ Nenhum Fármaco' },
        { id: 'morfina', label: '💊 Morfina (μ-Opioide)' },
        { id: 'metadona', label: '💊 Metadona (μ + NMDA / QTc)' },
        { id: 'naltrexona', label: '💊 Naltrexona (Antagonista)' }
    ],
    adenosine: [
        { id: 'none', label: '⚪ Nenhum Fármaco' },
        { id: 'cafeina', label: '💊 Cafeína (Antag. A1/A2A)' }
    ],
    ach: [
        { id: 'none', label: '⚪ Nenhum Fármaco' }
    ]
};

function farmacoAcoplado(state) {
    const lista = (state && Array.isArray(state.selectedDrugsList)) ? state.selectedDrugsList : [];
    const doSistema = ((typeof systemDrugsMap !== 'undefined' && state && systemDrugsMap[state.system]) || []).map(d => d.id);
    for (let i = lista.length - 1; i >= 0; i--) if (doSistema.includes(lista[i])) return lista[i];
    return 'none';
}

// Antidepressants Data (33 Drugs)
// 33 antidepressivos em 7 classes (origem: src/data/antidepressants.ts — v10.2 ligou à interface)
const antidepressantsData = {
  isrs: {
    className: "ISRS (Inibidores Seletivos de Recaptação de Serotonina)",
    drugs: [
      { id: 'escitalopram', name: 'Escitalopram', system: '5ht', target: 'Transportador SERT (S1 + S2)', mechanism: 'Bloqueio seletivo puro de SERT.', therapeutic: 'Remissão do TDM, Pânico, TAG, TOC.', adverse: 'Náusea transitória, retardo ejaculatório.', cyp: 'CYP2C19, CYP3A4.', pearl: 'O mais puro e seletivo dos ISRSs.' },
      { id: 'sertralina', name: 'Sertralina', system: '5ht', target: 'SERT + Leve DAT + Sigma-1', mechanism: 'Inibe SERT e leve reforço dopaminérgico.', therapeutic: 'Depressão atípica, TOC, pós-IAM e amamentação.', adverse: 'Diarreia e queixas GI iniciais.', cyp: 'CYP2B6, CYP2C19, CYP3A4.', pearl: 'Primeira escolha para cardiopatas pós-IAM.' },
      { id: 'fluoxetina', name: 'Fluoxetina', system: '5ht', target: 'SERT + Antagonismo 5-HT2C', mechanism: 'Bloqueio 5-HT2C desinibe DA/NE frontal.', therapeutic: 'Depressão anérgica, Bulimia, Bipolar.', adverse: 'Ansiedade inicial, insônia.', cyp: 'Inibidor potente de CYP2D6 e CYP2C19.', pearl: 'Meia-vida ultralonga (washout de 5 semanas antes de IMAO).' },
      { id: 'paroxetina', name: 'Paroxetina', system: '5ht', target: 'SERT + Anticolinérgico M1 + NOS', mechanism: 'Bloqueio SERT + ação antimuscarínica.', therapeutic: 'Depressão com ansiedade grave e pânico.', adverse: 'Sedação, ganho de peso, disfunção sexual.', cyp: 'Inibidor potente de CYP2D6.', pearl: 'Maior risco de síndrome de descontinuação.' },
      { id: 'fluvoxamina', name: 'Fluvoxamina', system: '5ht', target: 'SERT + Potente Agonismo Sigma-1', mechanism: 'Inibe SERT e ativa chaperonas σ1.', therapeutic: 'Padrão-ouro em TOC e fobia social.', adverse: 'Sedação, náusea e interações CYP.', cyp: 'Inibidor potente de CYP1A2 e CYP2C19.', pearl: 'Potente anti-inflamatório cerebral via Sigma-1.' },
      { id: 'citalopram', name: 'Citalopram', system: '5ht', target: 'SERT (Mistura Racêmica)', mechanism: 'Bloqueio de recaptação de serotonina.', therapeutic: 'Depressão maior em adultos e idosos.', adverse: 'Prolongamento dose-dependente do QTc: máximo 40 mg/dia (20 mg em >65 anos, hepatopatas e com inibidores de CYP2C19).', cyp: 'Substrato CYP2C19 e CYP3A4.', pearl: 'Dose máxima limitada a 40mg (20mg em idosos).' }
    ]
  },
  irsn: {
    className: "IRSN / Duais (Inibidores de Recaptação de 5-HT e NE)",
    drugs: [
      { id: 'venlafaxina', name: 'Venlafaxina', system: 'ne', target: 'SERT (<150mg) + NET (>150mg)', mechanism: 'Ação 5-HT em dose baixa e dual em dose alta.', therapeutic: 'Depressão resistente e dor neuropática.', adverse: 'Elevação da PA diastólica e sudorese.', cyp: 'Substrato CYP2D6.', pearl: 'Requer desmame lento (brain zaps).' },
      { id: 'desvenlafaxina', name: 'Desvenlafaxina', system: 'ne', target: 'Bloqueio balanceado SERT/NET (10:1)', mechanism: 'Metabólito ativo independente de CYP2D6.', therapeutic: 'Depressão Maior e fogachos da menopausa.', adverse: 'Náusea, insônia e boca seca.', cyp: 'Glicuronidação (independente de CYP2D6).', pearl: 'Excelente previsibilidade em polifarmácia.' },
      { id: 'duloxetina', name: 'Duloxetina', system: 'ne', target: 'Bloqueio potente SERT/NET (10:1)', mechanism: 'Aumenta 5-HT/NE na medula e córtex.', therapeutic: 'Depressão com dor crônica e fibromialgia.', adverse: 'Boca seca, constipação e sudorese.', cyp: 'Substrato CYP1A2 e CYP2D6.', pearl: 'Primeira escolha para dor crônica comorbida.' },
      { id: 'milnaciprano', name: 'Milnaciprano', system: 'ne', target: 'Inibição 1:1 de SERT e NET', mechanism: 'Potente estímulo noradrenérgico descendente.', therapeutic: 'Tratamento de Fibromialgia e fadiga.', adverse: 'Disúria e taquicardia.', cyp: 'Excreção predominantemente renal.', pearl: 'Alto tônus inibitório da dor musculoesquelética.' },
      { id: 'levomilnaciprano', name: 'Levomilnaciprano', system: 'ne', target: 'Inibição NET > SERT (2:1)', mechanism: 'Enantiômero 1R,2S com predomínio noradrenérgico.', therapeutic: 'Depressão com apatia e lentificação.', adverse: 'Aumento da FC e sudorese.', cyp: 'Substrato CYP3A4.', pearl: 'Resgata motivação e funcionalidade executiva.' }
    ]
  },
  atypical: {
    className: "Atípicos / NDRI / NaSSA / Melatonina",
    drugs: [
      { id: 'bupropiona', name: 'Bupropiona', system: 'da', target: 'Inibição DAT e NET (NDRI)', mechanism: 'Eleva DA e NE sem tocar na serotonina.', therapeutic: 'Depressão anedônica, TDAH e tabagismo.', adverse: 'Insônia, perda de peso (disfunção sexual baixíssima); contraindicada em epilepsia, bulimia/anorexia e retirada abrupta de álcool/BZD.', cyp: 'Substrato CYP2B6; inibe CYP2D6.', pearl: 'Contraindicado em epilepsia e bulimia.' },
      { id: 'mirtazapina', name: 'Mirtazapina', system: 'ne', target: 'Antagonismo α2 + 5-HT2/3 + H1 (NaSSA)', mechanism: 'Desinibe disparo de 5-HT e NE.', therapeutic: 'Depressão com insônia grave e perda de peso.', adverse: 'Sedação e ganho de peso (apetite por carboidrato).', cyp: 'Substrato CYP1A2, 2D6, 3A4.', pearl: 'Paradoxo: 15mg dá mais sono que 45mg.' },
      { id: 'agomelatina', name: 'Agomelatina', system: '5ht', target: 'Agonista MT1/MT2 + Antagonista 5-HT2C', mechanism: 'Ressincroniza ritmos circadianos.', therapeutic: 'Depressão com insônia e anedonia.', adverse: 'Elevação assintomática de transaminases.', cyp: 'Metabolismo CYP1A2 intenso.', pearl: 'Preserva arquitetura do sono REM e função sexual.' },
      { id: 'tianeptina', name: 'Tianeptina', system: 'glu', target: 'Modulador AMPA/NMDA + Opioide μ', mechanism: 'Normaliza neuroplasticidade hipocampal.', therapeutic: 'Depressão com sintomas somáticos/ansiedade.', adverse: 'Boca seca e constipação.', cyp: 'Beta-oxidação hepática.', pearl: 'Reverte atrofia dendrítica induzida pelo estresse em modelos animais; o agonismo μ explica relatos de abuso e dependência (não é isento de risco).' }
    ]
  },
  multimodal: {
    className: "Multimodais & SARIs",
    drugs: [
      { id: 'vortioxetina', name: 'Vortioxetina', system: '5ht', target: 'SERT + 5-HT1A/1B/1D/3/7', mechanism: 'Ação multimodal ampla desinibindo ACh, DA e Glu.', therapeutic: 'Depressão com comprometimento cognitivo.', adverse: 'Náusea transitória (baixa disfunção sexual).', cyp: 'Substrato CYP2D6.', pearl: 'Efeito pró-cognitivo demonstrado em ECRs (DSST), em parte independente da melhora do humor.' },
      { id: 'vilazodona', name: 'Vilazodona', system: '5ht', target: 'SERT + Agonismo Parcial 5-HT1A (SPARI)', mechanism: 'Combina efeito de ISRS com buspirona.', therapeutic: 'Depressão com altos níveis de ansiedade.', adverse: 'Diarreia e náusea (tomar com alimentos).', cyp: 'Substrato CYP3A4.', pearl: 'Menor taxa de ganho de peso e disfunção sexual.' },
      { id: 'trazodona', name: 'Trazodona', system: '5ht', target: 'Antagonista 5-HT2A/2C + anti-H1/α1', mechanism: 'Bloqueio 5-HT2A indutor de sono.', therapeutic: 'Insônia (50-100mg) e Depressão (>150mg).', adverse: 'Sedação, hipotensão e priapismo raro.', cyp: 'Substrato CYP3A4.', pearl: 'Indutor de sono que não desestrutura sono REM.' },
      { id: 'nefazodona', name: 'Nefazodona', system: '5ht', target: 'Antagonista 5-HT2A + SERT/NET', mechanism: 'SARI com excelente perfil sexual.', therapeutic: 'Depressão com ansiedade e insônia.', adverse: 'Risco de hepatotoxicidade rara.', cyp: 'Inibidor potente de CYP3A4.', pearl: 'Excelente eficácia limitada por risco hepático.' }
    ]
  },
  tca: {
    className: "Tricíclicos / ADTs",
    drugs: [
      { id: 'amitriptilina', name: 'Amitriptilina', system: '5ht', target: 'SERT/NET + M1/H1/α1 + Na+ cardíaco', mechanism: 'Potente aumento de 5-HT/NE com efeitos múltiplos.', therapeutic: 'Depressão grave, enxaqueca e dor neuropática.', adverse: 'Boca seca, sedação, ganho de peso, cardiotóxico.', cyp: 'Substrato CYP2D6 e CYP2C19.', pearl: 'Letal em overdose por bloqueio de canais de sódio.' },
      { id: 'nortriptilina', name: 'Nortriptilina', system: 'ne', target: 'Inibição Seletiva NET > SERT', mechanism: 'Amina secundária mais limpa.', therapeutic: 'Depressão no idoso e dor pós-herpética.', adverse: 'Menor hipotensão que a amitriptilina.', cyp: 'Substrato CYP2D6.', pearl: 'Janela terapêutica clássica (50 a 150 ng/mL).' },
      { id: 'clomipramina', name: 'Clomipramina', system: '5ht', target: 'Inibidor de SERT mais potente dos ADTs', mechanism: 'Bloqueio maciço de SERT.', therapeutic: 'Padrão-ouro para TOC grave e refratário.', adverse: 'Sedação, constipação e hipotensão.', cyp: 'CYP2C19 e CYP2D6.', pearl: 'Eficácia máxima entre os antidepressivos no TOC (meta-análises), ao custo de tolerabilidade e cardiotoxicidade em overdose.' },
      { id: 'imipramina', name: 'Imipramina', system: '5ht', target: 'Inibição balanceada SERT e NET', mechanism: 'Primeiro tricíclico moderno (1957).', therapeutic: 'Depressão Maior e enurese noturna.', adverse: 'Efeitos anticolinérgicos típicos.', cyp: 'Desmetilada em desipramina.', pearl: 'Marco histórico da psicofarmacologia.' },
      { id: 'desipramina', name: 'Desipramina', system: 'ne', target: 'Inibidor altamente seletivo de NET', mechanism: 'Amina secundária pura noradrenérgica.', therapeutic: 'Depressão anérgica e dor.', adverse: 'Boca seca e taquicardia.', cyp: 'Substrato CYP2D6.', pearl: 'Excelente seletividade adrenérgica.' },
      { id: 'doxepina', name: 'Doxepina', system: '5ht', target: 'Altíssima afinidade anti-H1 (3-6mg)', mechanism: 'Anti-histamínico seletivo em microdoses.', therapeutic: 'Insônia de manutenção do sono.', adverse: 'Sedação residual mínima em 3-6mg.', cyp: 'CYP2D6 e CYP2C19.', pearl: 'Aprovada como Silenor para insônia crônica.' }
    ]
  },
  maoi: {
    className: "IMAOs (Inibidores de MAO)",
    drugs: [
      { id: 'tranilcipromina', name: 'Tranilcipromina', system: 'da', target: 'Inibição Irreversível MAO-A e MAO-B', mechanism: 'Impede degradação de DA, 5-HT e NE.', therapeutic: 'Depressão atípica e altamente refratária.', adverse: 'Crise hipertensiva por tiramina (queijos).', cyp: 'Inibição enzimática irreversível.', pearl: 'Requer dieta sem tiramina e 14 dias de washout.' },
      { id: 'moclobemida', name: 'Moclobemida', system: '5ht', target: 'Inibidor Reversível de MAO-A (RIMA)', mechanism: 'Inibe MAO-A reversivelmente.', therapeutic: 'Depressão Maior e fobia social.', adverse: 'Náusea leve e insônia.', cyp: 'Substrato CYP2C19.', pearl: 'Mais seguro que os IMAO irreversíveis (a tiramina desloca a droga da enzima); ainda assim evitar grandes cargas de tiramina e associar a serotoninérgicos.' },
      { id: 'selegilina_patch', name: 'Selegilina Transdérmica', system: 'da', target: 'MAO-B (6mg) e MAO-A/B (>9mg)', mechanism: 'Adesivo transdérmico com bypass hepático.', therapeutic: 'Depressão resistente e Parkinson.', adverse: 'Reação no local do adesivo.', cyp: 'Bypass hepático inicial.', pearl: 'Dose de 6mg/24h não exige restrição de queijos.' },
      { id: 'fenelzina', name: 'Fenelzina', system: '5ht', target: 'IMAO Irreversível + Inibição GABA-T', mechanism: 'Eleva monoaminas e níveis de GABA cerebral.', therapeutic: 'Depressão fóbica extrema e pânico grave.', adverse: 'Ganho de peso e sedação.', cyp: 'Inativação irreversível.', pearl: 'Ação GABAérgica potente confere alta ansiólise.' }
    ]
  },
  novel: {
    className: "Glutamatérgicos & Neuroesteroides",
    drugs: [
      { id: 'esketamina', name: 'Esquetamina Spray Nasal', system: 'glu', target: 'Antagonista Não-Competitivo NMDA', mechanism: 'Bloqueia NMDA em interneurônios GABA ➔ Surto AMPA ➔ mTORC1/BDNF.', therapeutic: 'Depressão Resistente e Risco de Suicídio.', adverse: 'Dissociação perceptual e pico pressórico transitório.', cyp: 'Substrato CYP2B6 e CYP3A4.', pearl: 'Ação antidepressiva e antissuicida em horas.' },
      { id: 'cetamina_iv', name: 'Cetamina Intravenosa', system: 'glu', target: 'Antagonismo NMDA + Metabólito HNK', mechanism: 'Infusão lenta (0.5 mg/kg em 40 min).', therapeutic: 'Depressão unipolar/bipolar resistente.', adverse: 'Dissociação e taquicardia transitória.', cyp: 'Metabolizada em HNK.', pearl: 'O metabólito (2R,6R)-HNK induz sinaptogênese duradoura.' },
      { id: 'zuranolona', name: 'Zuranolona', system: 'gaba', target: 'PAM da Subunidade δ Extra-sináptica de GABA_A', mechanism: 'Restaura inibição tônica contínua.', therapeutic: 'Curso de 14 dias para Depressão Pós-Parto e TDM.', adverse: 'Sonolência e tontura (tomar com gordura).', cyp: 'Substrato CYP3A4.', pearl: 'Primeiro neuroesteroide oral de remissão rápida.' },
      { id: 'axs05', name: 'Auvelity (AXS-05)', system: 'glu', target: 'Dextrometorfano (NMDA/σ1) + Bupropiona (CYP2D6i)', mechanism: 'Bupropiona bloqueia degradação de DXM.', therapeutic: 'Depressão Maior com início em 1 semana.', adverse: 'Tontura e cefaleia leve.', cyp: 'Inibição farmacocinética planejada de CYP2D6.', pearl: 'Combinação inteligente que potencializa ação NMDA/σ1.' }
    ]
  }
};

const antipsychoticsData = {
    typical: {
        className: "Típicos / 1ª Geração (FGA - Antagonistas D2 Puros)",
        drugs: [
            { id: 'haloperidol', name: 'Haloperidol', target: 'D2 Potente (Ki = 0.7 nM)', pearl: 'Padrão-ouro em delírios agudos; ultrapassa 78% D2 acima de 4-5mg.' },
            { id: 'clorpromazina', name: 'Clorpromazina', target: 'D2 Baixa Potência + anti-H1/M1/α1', pearl: 'Alta sedação e hipotensão postural; primeiro antipsicótico moderno (1952).' },
            { id: 'levomepromazina', name: 'Levomepromazina', target: 'D2 + Potente anti-α1/H1', pearl: 'Excelente sedativo noturno e ansiolítico em cuidados paliativos.' },
            { id: 'flufenazina', name: 'Flufenazina', target: 'D2 Incisivo Depot', pearl: 'Injeção intramuscular a cada 2 a 4 semanas garante adesão completa.' }
        ]
    },
    atypical: {
        className: "Atípicos / 2ª Geração (SDA - 5-HT2A / D2)",
        drugs: [
            { id: 'risperidona', name: 'Risperidona', target: 'D2 (Ki = 3 nM) + 5-HT2A', pearl: 'Comporta-se como atípico em 2-4mg e como típico em doses >6mg/dia.' },
            { id: 'olanzapina', name: 'Olanzapina', target: '5-HT2A > D2 + 5-HT2C/H1/M1', pearl: 'Alta eficácia antipsicótica e estabilizadora; monitorar perfil metabólico e peso.' },
            { id: 'quetiapina', name: 'Quetiapina', target: '5-HT2A > D2 (Hit & Run) + H1 + NETi via norquetiapina', pearl: 'Baixo risco de SEP; opção na Doença de Parkinson, embora só a Clozapina tenha eficácia comprovada nessa psicose.' },
            { id: 'clozapina', name: 'Clozapina', target: '5-HT2A > D4 > D2 + M1-M5/α1', pearl: 'Padrão-ouro para esquizofrenia refratária e redução de suicídio; hemograma semanal por 18 semanas e depois mensal; vigiar miocardite (1º mês), convulsão e íleo.' },
            { id: 'lurasidona', name: 'Lurasidona', target: 'D2 + 5-HT2A + Potente 5-HT7/1A', pearl: 'Excelente perfil metabólico na Depressão Bipolar; efeito pró-cognitivo via 5-HT7 é pré-clínico e ainda não confirmado em ECR.' }
        ]
    },
    partial: {
        className: "Agonistas Parciais D2/D3 / 3ª Geração",
        drugs: [
            { id: 'aripiprazol', name: 'Aripiprazol', target: 'Agonista Parcial D2 (30%) + 5-HT1A/2A', pearl: 'Ocupa >85% D2 com pouco parkinsonismo pela atividade agonista parcial; acatisia continua sendo o efeito adverso mais comum.' },
            { id: 'brexpiprazol', name: 'Brexpiprazol', target: 'Agonista Parcial D2 (15%) + 5-HT1A/2A', pearl: 'Menor taxa de acatisia que o aripiprazol; aprovado para agitação na demência de Alzheimer (mantém alerta de mortalidade em idosos).' },
            { id: 'cariprazina', name: 'Cariprazina', target: 'Agonista Parcial D3 > D2 (10x preferência)', pearl: 'Vantagem sobre risperidona em sintomas negativos predominantes em um ECR (Németh 2017); apatia e anedonia são extrapolação do agonismo D3.' }
        ]
    },
    novel: {
        className: "Inovações Não-D2 & Colinérgicos",
        drugs: [
            { id: 'pimavanserina', name: 'Pimavanserina', target: '5-HT2A Puro sem afinidade D2', pearl: 'Trata psicose na Doença de Parkinson sem piorar o tremor; mantém alerta de mortalidade em psicose por demência.' },
            { id: 'karxt', name: 'KarXT / Cobenfy', target: 'Agonista M1/M4 Central + Tróspio Periférico', pearl: 'Primeiro antipsicótico de classe inédita em 70 anos sem bloqueio D2!' }
        ]
    }
};

// Mood Stabilizers & Anxiolytics Data
const moodAndAnxioData = {
    stabilizers: [
        { id: 'lithium', name: 'Carbonato de Lítio', target: 'Inibição GSK-3β + IMPase + ↑Bcl-2/BDNF', pearl: 'Único estabilizador com redução consistente de suicídio (~60%, meta-análise de Cipriani 2013). Litemia: 0.6-1.0 mEq/L na manutenção; 0.8-1.2 na mania aguda.' },
        { id: 'valproate', name: 'Valproato / Divalproato', target: 'GABA-T + Canais Nav + Inibição HDAC', pearl: 'Excelente para mania mista e ciclagem rápida; proibido na gestação (teratogênese e QI reduzido).' },
        { id: 'lamotrigina', name: 'Lamotrigina', target: 'Canais Nav pré-sinápticos (↓Glutamato)', pearl: 'Prevenção da depressão bipolar; titulação lenta previne Stevens-Johnson.' }
    ],
    anxiolytics: [
        { id: 'clonazepam', name: 'Clonazepam', target: 'PAM GABAA na interface α1-3,5/γ2', pearl: 'Meia-vida intermediária-longa (30-40h) uniforme no Pânico e TAG.' },
        { id: 'lorazepam', name: 'Lorazepam', target: 'PAM GABAA (Glicuronidação Direta)', pearl: 'BZD preferido quando indispensável em idosos e hepatopatas (glicuronidação direta); ainda assim, os Critérios de Beers recomendam evitar BZD nessa faixa etária.' },
        { id: 'zolpidem', name: 'Zolpidem', target: 'PAM Seletivo GABAA α1', pearl: 'Indução rápida; tomar já deitado (5mg em mulheres e idosos) — risco de comportamentos complexos do sono (alerta FDA 2019).' },
        { id: 'suvorexant', name: 'Suvorexant / DORA', target: 'Antagonista Duplo Orexina OX1/OX2', pearl: 'Desliga o switch de vigília sem suprimir o REM; na polissonografia aumenta o tempo de REM e encurta sua latência.' }
    ]
};

// ==========================================
// 1.10 OCUPAÇÃO RECEPTORIAL COM DADOS DE LITERATURA (v12.1) — Caminho G
// Ki (nM) in vitro do PDSP Ki Database / literatura; a "concentração livre efetiva" por dose
// é CALIBRADA para reproduzir a ocupação D2 medida em PET (Kapur 2000; Nyberg; Nordström),
// e depois a MESMA concentração alimenta a ocupação dos demais receptores via isoterma de Hill.
// Ocup(1 fármaco) = C/(C+Ki).  Competição (n fármacos, mesmo receptor) = Σ(Ci/Ki_i)/(1+Σ(Ci/Ki_i)).
// LIMITE: a concentração é um parâmetro AJUSTADO ao PET, não uma medida de fração livre cerebral;
// escala linearmente com a dose (aproximação de 1º compartimento, dose única em equilíbrio).
// ==========================================
const KI_RECEPTORS = ['d2', '5ht2a', 'h1', 'm1', 'alpha1'];

const drugKiData = {
    // Ki (nM). Fontes: PDSP Ki DB, Maudsley 14ª, Kapur 2000. Menor Ki = maior afinidade.
    haloperidol: { d2: 1.4, '5ht2a': 25, h1: 440, m1: 1500, alpha1: 6, kind: 'antagonista' },
    risperidona: { d2: 3.3, '5ht2a': 0.2, h1: 19, m1: 2800, alpha1: 1.4, kind: 'antagonista' },
    olanzapina: { d2: 11, '5ht2a': 1.5, h1: 7, m1: 2, alpha1: 19, kind: 'antagonista' },
    clozapina: { d2: 126, '5ht2a': 3.3, h1: 1.1, m1: 1.4, alpha1: 1.6, kind: 'antagonista' },
    quetiapina: { d2: 380, '5ht2a': 220, h1: 4.4, m1: 120, alpha1: 4.5, kind: 'antagonista' },
    ziprasidona: { d2: 3.1, '5ht2a': 0.4, h1: 47, m1: 5000, alpha1: 10, kind: 'antagonista' }
};

const drugPKref = {
    // refDoseMg → cFreeNm calibrado ao PET D2; doseRange = faixa do slider (mg); usualHigh = alerta de dose alta.
    haloperidol: { refDoseMg: 5, cFreeNm: 4.7, doseRange: [1, 20], usualHigh: 10 },
    risperidona: { refDoseMg: 4, cFreeNm: 7.7, doseRange: [0.5, 12], usualHigh: 6 },
    olanzapina: { refDoseMg: 10, cFreeNm: 25.7, doseRange: [2.5, 30], usualHigh: 20 },
    clozapina: { refDoseMg: 400, cFreeNm: 103, doseRange: [25, 900], usualHigh: 600 },
    quetiapina: { refDoseMg: 400, cFreeNm: 163, doseRange: [25, 800], usualHigh: 800 },
    ziprasidona: { refDoseMg: 120, cFreeNm: 4.65, doseRange: [20, 200], usualHigh: 160 }
};

// ==========================================
// 1.11 NAVEGAÇÃO POR ALVO (v12.2a) — fecha o achado 3 da Fase 0: o app citava 36 alvos que não modelava.
// NADA de farmacologia nova aqui. Cada linha apenas dá id canônico ao que os campos
// `class` / `target` / `mechanism` do próprio app JÁ afirmam; `de` registra a origem da afirmação.
// Os alvos das colunas numéricas de afinidade são DERIVADOS automaticamente via TARGET_MAP.
// ==========================================
const drugTargetsExtra = {
    sertralina: [{ id: 'DAT', acao: 'inibidor fraco', de: 'classe: "ISRS (+ Leve DAT)"' }],
    bupropiona: [{ id: 'DAT', acao: 'inibidor fraco', de: 'classe: "IRND (NET + DAT)"' }],
    mirtazapina: [{ id: '5-HT3', acao: 'antagonista', de: 'classe: "NaSSA (Antagonista α2 + 5-HT2A/2C/3)"' }],
    paroxetina: [{ id: 'NOS', acao: 'inibidor', de: 'campo target: "SERT + M1 + NOS"' }],
    ziprasidona: [
        { id: '5-HT1A', acao: 'agonista', de: 'campo target: "5-HT1A (agonista)"' },
        { id: '5-HT1D', acao: 'antagonista', de: 'classe: "SDA + 5-HT1A/1D"' }],
    cetamina: [{ id: 'NMDA', acao: 'antagonista não competitivo (uso-dependente)', de: 'mecanismo declarado no circuito glutamatérgico' }],
    metadona: [{ id: 'NMDA', acao: 'antagonista', de: 'campo target: "Receptor Mu (MOR) + NMDA + SERT/NET fraco"' }],
    clonazepam: [{ id: 'GABA-A sináptico', acao: 'modulador alostérico positivo (interface α/γ2)', de: 'experimento POE do clonazepam' }],
    cbd: [{ id: '5-HT1A', acao: 'agonista parcial', de: 'campo target: "CB1 (Alostérico) + 5-HT1A + FAAH"' }],
    guanfacina: [{ id: 'α2A', acao: 'agonista', de: 'campo target: "α2A pós-sináptico (agonista)"' }],
    atomoxetina: [{ id: 'DAT', acao: 'depuração indireta via NET no CPF', de: 'mecanismo: NET depura DA no córtex frontal (Morón 2002)' }],
    aripiprazol: [
        { id: 'D3', acao: 'agonista parcial', de: 'PET com [11C]raclopride mede D2 e D3 em conjunto (Yokoi 2002)' },
        { id: '5-HT1A', acao: 'agonista parcial', de: 'ocupação de 16% no PET de triplo traçador (Mamo 2007)' }],
    carbamazepina: [{ id: 'NMDA', acao: 'redução INDIRETA do tônus glutamatérgico (não se liga ao receptor)', de: 'mecanismo: bloqueio de Nav uso-dependente (Sun & Lin 2000)' }],
    zuranolona: [{ id: 'GABA-A extrasináptico', acao: 'modulador alostérico positivo (esteroide neuroativo)', de: 'dossiê 10: heteropentâmeros α4β3δ, alvo declarado da zuranolona' }],
    lamotrigina: [{ id: 'NMDA', acao: 'redução INDIRETA do tônus glutamatérgico (não se liga ao receptor)', de: 'mecanismo: bloqueio de Nav reduz a liberação pré-sináptica de glutamato (Large 2005)' }]
};

// v12.3 — DIREÇÃO do efeito por chave de afinidade. A ocupação mede LIGAÇÃO, não efeito:
// guanfacina (agonista α2A) e mirtazapina (antagonista α2) competem pelo mesmo receptor com
// efeitos opostos. Sem isto, o painel somaria as duas como se fossem a mesma coisa.
const drugTargetDirection = {
    guanfacina: { alpha2: 'agonista' },
    mirtazapina: { alpha2: 'antagonista', '5ht2a': 'antagonista', '5ht2c': 'antagonista', h1: 'antagonista' },
    atomoxetina: { net: 'inibidor', sert: 'inibidor' },
    ziprasidona: { d2: 'antagonista', '5ht2a': 'antagonista', sert: 'inibidor', net: 'inibidor' },
    haloperidol: { d2: 'antagonista', alpha1: 'antagonista' },
    risperidona: { d2: 'antagonista', '5ht2a': 'antagonista', alpha1: 'antagonista', h1: 'antagonista' },
    olanzapina: { d2: 'antagonista', '5ht2a': 'antagonista', h1: 'antagonista', m1: 'antagonista' },
    clozapina: { d2: 'antagonista', '5ht2a': 'antagonista', h1: 'antagonista', m1: 'antagonista' },
    quetiapina: { d2: 'antagonista', '5ht2a': 'antagonista', h1: 'antagonista' },
    fluoxetina: { sert: 'inibidor' }, sertralina: { sert: 'inibidor' }, escitalopram: { sert: 'inibidor' },
    citalopram: { sert: 'inibidor' }, paroxetina: { sert: 'inibidor', m1: 'antagonista' },
    venlafaxina: { sert: 'inibidor', net: 'inibidor' }, duloxetina: { sert: 'inibidor', net: 'inibidor' },
    zuranolona: { },
    aripiprazol: { d2: 'agonista parcial', '5ht2c': 'agonista parcial', '5ht2a': 'antagonista', h1: 'antagonista', alpha1: 'antagonista' },
    bupropiona: { net: 'inibidor' }, clomipramina: { sert: 'inibidor', net: 'inibidor', m1: 'antagonista', h1: 'antagonista', alpha1: 'antagonista' }
};

function directionOf(drugKey, receptorKey) {
    return (drugTargetDirection[drugKey] || {})[receptorKey] || null;
}

// Ações que se OPÕEM no mesmo receptor (ligação competitiva, efeito contrário).
// v12.4 — três classes, não duas. O agonista PARCIAL não é meio-agonista nem antagonista fraco:
// num tecido de tônus alto ele reduz a sinalização, num de tônus baixo ele a sustenta. Somá-lo aos
// agonistas plenos apagaria justamente a propriedade que define o aripiprazol.
function opposingActionsAt(drugList, receptorKey) {
    const agon = [], parc = [], anta = [];
    (drugList || []).forEach(k => {
        const d = directionOf(k, receptorKey);
        if (!d) return;
        if (d === 'agonista parcial') parc.push(k);          // testar ANTES do prefixo 'agonista'
        else if (d.indexOf('agonista') === 0) agon.push(k);
        else if (d === 'antagonista' || d === 'inibidor') anta.push(k);
    });
    if (!anta.length || !(agon.length + parc.length)) return null;
    return { receptor: receptorKey, agonistas: agon, parciais: parc, antagonistas: anta };
}

// Todos os conflitos de direção numa prescrição.
function directionConflicts(drugList) {
    return (typeof POLY_RECEPTORS !== 'undefined' ? POLY_RECEPTORS : [])
        .map(r => opposingActionsAt(drugList, r)).filter(Boolean);
}

// v12.4 — onde a OCUPAÇÃO deixa de prever o EFEITO. O app ensina uma janela de ocupação de D2;
// o aripiprazol é o contraexemplo medido, e esconder isso ensinaria uma regra falsa como se fosse lei.
const occupancyEffectExceptions = {
    aripiprazol: {
        receptor: 'd2',
        nota: 'O aripiprazol atinge 87–93% de ocupação D2 estriatal em PET — acima do limiar clássico de 80% para efeitos extrapiramidais — sem produzir EPS na maioria dos casos. A janela de ocupação foi estabelecida com antagonistas plenos e NÃO se transfere para um agonista parcial: aqui, ocupar não é o mesmo que bloquear.',
        source: ['mamo2007', 'yokoi2002']
    }
};

function occupancyExceptionsIn(drugList) {
    return (drugList || []).filter(k => occupancyEffectExceptions[k])
        .map(k => Object.assign({ drug: k }, occupancyEffectExceptions[k]));
}

// v12.5 — CAMADA FARMACOGENÔMICA. Estrutura de propósito verbosa: cada alelo carrega a população
// em que foi medido e a limitação do estudo, porque o risco de uso indevido aqui é maior que o de
// não usar. Todos os dados abaixo vêm de populações do Leste Asiático; extrapolar para a população
// brasileira, altamente miscigenada, NÃO é sustentado por estas fontes.
const pharmacogenomicRisk = {
    carbamazepina: {
        desfecho: 'Síndrome de Stevens-Johnson / necrólise epidérmica tóxica',
        alelos: [
            { alelo: 'HLA-B*15:02', medida: 'rastreamento prospectivo: NENHUM caso entre os não portadores que tomaram o fármaco, contra ~10 esperados (p < 0,001)', populacao: '4.877 participantes, 23 hospitais em Taiwan; 7,7% portadores',
              limitacao: 'É um estudo de INTERVENÇÃO com controle histórico, não randomizado — o braço de comparação é a incidência esperada de 0,23%, não um grupo concorrente. Ainda assim, é o nível de evidência mais alto desta camada.', source: ['chen2011'] },
            { alelo: 'HLA-B*15:02', medida: 'associação forte e replicada; a FDA alterou a bula para recomendar teste genético', populacao: 'ancestralidade do Sudeste Asiático',
              limitacao: 'A associação NÃO é observada em populações com baixa frequência do alelo. É específica do fármaco e da ancestralidade — não se transporta por analogia.', source: ['lee2010'] }
        ],
        limite: 'Este é o CONTRASTE da lamotrigina: aqui a evidência vem de rastreamento prospectivo em quase 5.000 pessoas com desfecho clínico, e não de meta-análises sobre poucas dezenas de casos. Mesmo assim, a dependência de ancestralidade é a mesma, e nada disso foi estudado em população brasileira.'
    },
    lamotrigina: {
        desfecho: 'Síndrome de Stevens-Johnson / necrólise epidérmica tóxica',
        alelos: [
            { alelo: 'HLA-B*15:02', medida: 'OR 4,51 (IC 95% 1,57–12,98)', populacao: 'pacientes com epilepsia, chineses Han',
              limitacao: 'meta-análise de estudos caso-controle; o título do artigo diz nove estudos e o resumo diz seis — divergência do próprio registro.', source: ['li2014'] },
            { alelo: 'HLA-B*15:02', medida: 'OR 4,98 (IC 95% 1,43–17,28)', populacao: 'chineses Han',
              limitacao: 'apenas 12 casos de SJS/NET no total, quatro deles portadores do alelo. O intervalo de confiança larguíssimo é consequência disso, e os próprios autores pedem amostras maiores.', source: ['zeng2014'] },
            { alelo: 'HLA-A*24:02', medida: 'associação com p = 0,005 para lamotrigina', populacao: '91 casos e 322 controles, Han do sul da China, 8 centros',
              limitacao: 'o estudo mais robusto dos três, com replicação em meta-análise de seis países. Ainda assim, A*24:02 e/ou B*15:02 tem sensibilidade de 72,5% e especificidade de 69,0% — longe de um teste limpo.', source: ['shi2017'] }
        ],
        limite: 'A associação da lamotrigina é substancialmente MAIS FRACA que a da carbamazepina, e toda a evidência disponível é do Leste Asiático. Nada aqui autoriza rastreamento indiscriminado nem substitui a titulação lenta, que continua sendo a medida protetora com melhor sustentação.'
    }
};

function pharmacogenomicRiskIn(drugList) {
    return (drugList || []).filter(k => pharmacogenomicRisk[k])
        .map(k => Object.assign({ drug: k }, pharmacogenomicRisk[k]));
}

// Fármacos ainda pendentes de revisão clínica do autor.
function pendingReviewDrugs() {
    if (typeof drugBindingAffinities === 'undefined') return [];
    return Object.keys(drugBindingAffinities).filter(k => drugBindingAffinities[k].revisao_pendente);
}

// Alvos que o app cita mas a ontologia canônica v0.1.0 NÃO cobre (sistemas ecb/opioid/adenosine e canais).
// Ficam visíveis de propósito: são o achado 6 da Fase 0 — a ontologia é que precisa crescer, não o inverso.
const drugTargetsForaDaOntologia = {
    morfina: ['MOR (mu)'], naltrexona: ['MOR (mu)', 'KOR (kappa)', 'DOR (delta)'],
    cbd: ['CB1 (modulador alostérico)', 'FAAH'], thc: ['CB1 (agonista parcial)'],
    cafeina: ['A1', 'A2A'], clomipramina: ['Nav (canal de sódio)'],
    litio: ['GSK-3β / inositol'], valproato: ['múltiplos (HDAC, canais, metabolismo GABAérgico)'],
    lamotrigina: ['Nav (canal de sódio dependente de voltagem, estado inativado)'],
    carbamazepina: ['Nav (canal de sódio, bloqueio uso-dependente)']
};

// Alvos canônicos de um fármaco: derivados das afinidades + os declarados na prosa. Sem duplicar.
function targetsOfDrug(drugKey) {
    const out = [], vistos = new Set();
    const aff = (typeof drugBindingAffinities !== 'undefined' && drugBindingAffinities[drugKey]) || null;
    if (aff && typeof canonicalTarget === 'function') {
        Object.keys(aff).forEach(k => {
            const id = canonicalTarget(k);
            if (!id || vistos.has(id)) return;
            const v = aff[k];
            if (typeof v !== 'number' || v <= 0) return;
            vistos.add(id);
            out.push({ id: id, acao: null, ocupacaoRelativa: v, de: 'afinidade (escala relativa do simulador)' });
        });
    }
    (drugTargetsExtra[drugKey] || []).forEach(t => {
        if (!vistos.has(t.id)) { vistos.add(t.id); out.push({ id: t.id, acao: t.acao, ocupacaoRelativa: null, de: t.de }); }
    });
    return out;
}

// Caminho inverso: quais fármacos tocam este alvo canônico.
function drugsForTarget(canonId) {
    if (typeof drugBindingAffinities === 'undefined') return [];
    return Object.keys(drugBindingAffinities)
        .map(k => ({ drug: k, name: drugBindingAffinities[k].name, hit: targetsOfDrug(k).find(t => t.id === canonId) }))
        .filter(x => x.hit)
        .sort((a, b) => (b.hit.ocupacaoRelativa || 0) - (a.hit.ocupacaoRelativa || 0));
}

// Todos os alvos canônicos que o app efetivamente modela (para o Spotlight e o painel).
function modeledTargetIds() {
    if (typeof drugBindingAffinities === 'undefined') return [];
    const s = new Set();
    Object.keys(drugBindingAffinities).forEach(k => targetsOfDrug(k).forEach(t => s.add(t.id)));
    return [...s].sort();
}

// ==========================================
// 1.12 MOTOR DE POLIFARMÁCIA (v12.2.2) — extraído de dentro de renderInspector para poder ser TESTADO.
// Até aqui esta matemática vivia embutida na função que desenha a interface: rodava no app,
// mas nenhum teste a alcançava. A UI agora apenas consome o resultado.
// Ocupação combinada por ligação COMPETITIVA (isoterma de Langmuir):
//   cada fármaco isolado ocupa a_i = x_i/(1+x_i), com x_i = [D]/Kd na dose usual;
//   em conjunto, Ocup = Σx_i / (1 + Σx_i). Nunca ultrapassa 100% e não é soma linear.
// ==========================================
// v12.3: `alpha2` entrou na lista. Até a v12.2.2 ele era calculado em lugar nenhum — o alvo
// DEFINIDOR da mirtazapina (antagonismo α2 pré-sináptico) não aparecia no painel de ocupação.
const POLY_RECEPTORS = ['d2', 'sert', 'net', '5ht2a', '5ht2c', 'h1', 'm1', 'alpha1', 'alpha2'];

/*
 * v12.66 — "K_i MANDA" (decisao do autor, 30/09/2026).
 *
 * Ate a v12.65 havia DOIS motores de D2 na mesma tela: este, com as colunas didaticas 0–100 de drugBindingAffinities
 * (haloperidol d2: 92), e o painel K_i x C_livre calibrada por PET (haloperidol 5 mg: 77%, Kapur 2000). Discordavam
 * em 15 pontos e, pior, discordavam nos alertas: 92% acendia "risco iminente de SEP" enquanto o painel ao lado dizia
 * "janela antipsicotica" (auditoria 30/09, 2.3). Agora, para cada (farmaco, receptor) em que existe K_i e
 * calibracao (drugKiData + drugPKref), a razao competitiva vem de C_livre(dose)/K_i — a MESMA moeda que a coluna
 * didatica ja usava (occ/(1−occ) = C/K_d) — e a coluna 0–100 deixa de ser fonte independente. Onde nao ha K_i, a
 * coluna didatica continua, e `metodo[r]` diz de onde veio cada barra ('ki', 'estimativa' ou 'misto') para a UI
 * rotular em vez de misturar.
 *
 * SEP: um agonista parcial ocupa D2 sem bloquear — o aripiprazol chega a 87–93% no PET sem SEP (occupancyExceptions).
 * O alerta de SEP passa a ler `d2Bloqueio`, a ocupacao competitiva so dos ANTAGONISTAS de D2; `agonistasParciaisD2`
 * lista quem foi deixado de fora, para a UI dizer por que.
 *
 * `doseMap` e o state.pharmaDoseMg (dose em mg por farmaco com K_i); ausente, vale a dose de referencia do PET.
 */
function analyzePolypharmacy(drugList, doseMap) {
    const occ = {}, ratioSum = {}, metodo = {};
    POLY_RECEPTORS.forEach(r => { occ[r] = 0; ratioSum[r] = 0; metodo[r] = { ki: [], estimativa: [] }; });
    const toRatio = (pct) => { const a = Math.min(99, Math.max(0, pct || 0)) / 100; return a / (1 - a); };
    const doses = doseMap || {};
    const doseDe = (k) => (typeof doses[k] === 'number' && doses[k] >= 0) ? doses[k] : (drugPKref[k] ? drugPKref[k].refDoseMg : undefined);
    const razaoDe = (k, aff, r) => {
        const ki = hasKiData(k) && drugKiData[k][r];
        if (ki) return { razao: kiFreeConc(k, doseDe(k)) / ki, fonte: 'ki' };
        return { razao: toRatio(aff[r]), fonte: 'estimativa' };
    };
    let ratioD2Bloqueio = 0; const agonistasParciaisD2 = [];
    let totalQtc = 0, total5HTPotency = 0;
    const cypInhibitions = [];
    (drugList || []).forEach(k => {
        const aff = (typeof drugBindingAffinities !== 'undefined') ? drugBindingAffinities[k] : null;
        if (!aff) return;
        POLY_RECEPTORS.forEach(r => {
            const { razao, fonte } = razaoDe(k, aff, r);
            ratioSum[r] += razao;
            if (razao > 0) metodo[r][fonte].push(k);
            if (r === 'd2' && razao > 0) {
                const dir = directionOf(k, 'd2');
                if (dir === 'agonista parcial' || dir === 'agonista') agonistasParciaisD2.push(k); else ratioD2Bloqueio += razao;
            }
        });
        totalQtc += aff.qtc_score || 0;
        total5HTPotency += aff.serotonin_potency || 0;
        (aff.cyp_inhibits || []).forEach(ci => {
            if (ci.indexOf('Mínima') === -1 && ci.indexOf('Nenhuma') === -1) cypInhibitions.push('<b>' + aff.name + ':</b> ' + ci);
        });
    });
    POLY_RECEPTORS.forEach(r => { occ[r] = 100 * ratioSum[r] / (1 + ratioSum[r]); });
    const d2Bloqueio = 100 * ratioD2Bloqueio / (1 + ratioD2Bloqueio);
    const metodoDe = (r) => (metodo[r].ki.length && metodo[r].estimativa.length) ? 'misto' : (metodo[r].ki.length ? 'ki' : (metodo[r].estimativa.length ? 'estimativa' : 'nenhum'));
    const metodoPorReceptor = {}; POLY_RECEPTORS.forEach(r => { metodoPorReceptor[r] = metodoDe(r); });

    // QTc: estratificação QUALITATIVA (escores adimensionais; efeitos não são aditivos em ms)
    let qtcLabel = 'Risco Baixo', qtcColor = '#22c55e';
    let qtcAdvice = 'Nenhum fármaco de alto risco nesta combinação. Lembrar fatores do paciente: sexo feminino, idade, bradicardia, K⁺/Mg²⁺ baixos, cardiopatia.';
    if (totalQtc >= 4.5) { qtcLabel = 'RISCO ALTO — solicitar ECG basal e corrigir K⁺/Mg²⁺'; qtcColor = '#ef4444'; qtcAdvice = 'Combinação com ≥2 agentes que prolongam QTc ou um agente de alto risco em dose elevada. Considerar alternativa, ECG antes e após titulação e revisar interações CYP que elevem níveis séricos.'; }
    else if (totalQtc >= 3.0) { qtcLabel = 'RISCO INTERMEDIÁRIO — ECG recomendado'; qtcColor = '#f59e0b'; qtcAdvice = 'Ao menos um agente com efeito conhecido sobre o QTc. ECG basal se houver fatores de risco do paciente; evitar somar outro agente da lista CredibleMeds.'; }
    else if (totalQtc >= 2.0) { qtcLabel = 'RISCO BAIXO A MODERADO'; qtcColor = '#eab308'; qtcAdvice = 'Efeito pequeno em doses usuais; vigilância se dose máxima, idosos ou interação farmacocinética.'; }

    // Carga serotoninérgica: HEURÍSTICA do simulador (NÃO são os Critérios de Hunter, que são clínicos)
    let hunterRiskLabel = 'Carga Baixa', hunterRiskColor = '#22c55e';
    let hunterAlert = 'Sem combinações de risco serotoninérgico relevante. Lembrar: IMAO + qualquer serotoninérgico é combinação proibida; tramadol, linezolida e triptanos também contam.';
    if (total5HTPotency >= 7.0) {
        hunterRiskLabel = 'CARGA SEROTONINÉRGICA ALTA — avaliar clônus e temperatura à beira do leito'; hunterRiskColor = '#ef4444';
        hunterAlert = '⚠️ <b>ALERTA:</b> múltiplos agentes de alta potência serotoninérgica. Se houver sintomas, aplicar os <b>Critérios de Hunter</b> (Dunkley 2003): clônus espontâneo; ou clônus induzível/ocular + agitação ou diaforese; ou tremor + hiper-reflexia; ou hipertonia + T > 38 °C + clônus.';
    } else if (total5HTPotency >= 4.5) {
        hunterRiskLabel = 'Carga Moderada'; hunterRiskColor = '#f59e0b';
        hunterAlert = 'Monitorar sinais precoces: tremor fino, hiper-reflexia em MMII, náuseas, insônia e agitação. Os Critérios de Hunter só se aplicam ao exame físico do paciente exposto.';
    }
    const qtcHighRiskDrugs = (drugList || [])
        .filter(k => typeof drugBindingAffinities !== 'undefined' && drugBindingAffinities[k] && drugBindingAffinities[k].qtc_score >= 2.5)
        .map(k => drugBindingAffinities[k].name);
    return { occ: occ, metodo: metodoPorReceptor, metodoDetalhe: metodo, d2Bloqueio: d2Bloqueio, agonistasParciaisD2: agonistasParciaisD2,
        totalQtc: totalQtc, total5HTPotency: total5HTPotency, cypInhibitions: cypInhibitions,
        qtcLabel: qtcLabel, qtcColor: qtcColor, qtcAdvice: qtcAdvice, qtcHighRiskDrugs: qtcHighRiskDrugs,
        hunterRiskLabel: hunterRiskLabel, hunterRiskColor: hunterRiskColor, hunterAlert: hunterAlert };
}

function hasKiData(drugKey) { return !!(drugKiData[drugKey] && drugPKref[drugKey]); }

// concentração livre efetiva (nM) na dose informada (linear na dose)
function kiFreeConc(drugKey, doseMg) { const p = drugPKref[drugKey]; if (!p) return 0; const d = (typeof doseMg === 'number' && doseMg >= 0) ? doseMg : p.refDoseMg; return p.cFreeNm * (d / p.refDoseMg); }

// ocupação (%) de UM fármaco num receptor, dose em mg — isoterma de Hill (n=1)
function kiOccupancy(drugKey, receptor, doseMg) { const ki = drugKiData[drugKey] && drugKiData[drugKey][receptor]; if (!ki) return 0; const c = kiFreeConc(drugKey, doseMg); return 100 * c / (c + ki); }

// ocupação competitiva (%) de vários fármacos num receptor + contribuição de cada um
// doseList: [{ drug, doseMg }]
function kiCompetitiveOccupancy(doseList, receptor) {
    let sum = 0; const ratios = [];
    (doseList || []).forEach(({ drug, doseMg }) => {
        const ki = drugKiData[drug] && drugKiData[drug][receptor];
        if (ki) { const r = kiFreeConc(drug, doseMg) / ki; sum += r; ratios.push({ drug, ratio: r }); }
    });
    const total = 100 * sum / (1 + sum);
    const contrib = ratios.map(x => ({ drug: x.drug, occ: sum > 0 ? total * (x.ratio / sum) : 0 }));
    return { total, contrib, anyData: ratios.length > 0 };
}

const drugBindingAffinities = {
    fluoxetina: {
        name: "Fluoxetina", class: "ISRS",
        sert: 85, d2: 0, '5ht2a': 20, '5ht2c': 35, net: 10, h1: 15, m1: 5, alpha1: 5,
        cyp_inhibits: ["CYP2D6 (Potente)", "CYP2C19 (Moderado)", "CYP3A4 (Leve)"],
        cyp_substrates: ["CYP2D6", "CYP2C9"],
        qtc_score: 1.5, // 1 to 3
        serotonin_potency: 3.5, // 0 to 5
        hunter_risk: "Moderado se combinado a outros serotoninérgicos"
    },
    sertralina: {
        name: "Sertralina", class: "ISRS (+ Leve DAT)",
        sert: 90, d2: 0, '5ht2a': 5, '5ht2c': 5, net: 5, h1: 5, m1: 0, alpha1: 5,
        cyp_inhibits: ["CYP2D6 (Leve a moderado, dose-dependente)", "CYP2C19 (Moderado — atenção a clopidogrel e diazepam)"],
        cyp_substrates: ["CYP2B6", "CYP2C19", "CYP3A4"],
        qtc_score: 1.0,
        serotonin_potency: 4.0,
        hunter_risk: "Moderado"
    },
    escitalopram: {
        name: "Escitalopram", class: "ISRS Puro (Alostérico)",
        sert: 92, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 10, m1: 0, alpha1: 0,
        cyp_inhibits: ["CYP2D6 (Mínimo/Insignificante)"],
        cyp_substrates: ["CYP2C19", "CYP3A4"],
        qtc_score: 1.5, // Prolongamento modesto (~4-7 ms) e dose-dependente; evitar >20mg
        serotonin_potency: 4.5,
        hunter_risk: "Moderado"
    },
    venlafaxina: {
        name: "Venlafaxina", class: "IRSN Dual",
        sert: 80, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 45, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["CYP2D6 (Leve)"],
        cyp_substrates: ["CYP2D6 ➔ Desvenlafaxina"],
        qtc_score: 1.5,
        serotonin_potency: 3.8,
        hunter_risk: "Muito elevado com IMAO (combinação proibida)"
    },
    duloxetina: {
        name: "Duloxetina", class: "IRSN Balanceado",
        sert: 85, d2: 0, '5ht2a': 5, '5ht2c': 5, net: 70, h1: 5, m1: 0, alpha1: 5,
        cyp_inhibits: ["CYP2D6 (Moderado)"],
        cyp_substrates: ["CYP1A2", "CYP2D6"],
        qtc_score: 1.0,
        serotonin_potency: 4.0,
        hunter_risk: "Moderado a Alto"
    },
    bupropiona: {
        name: "Bupropiona", class: "IRND (NET + DAT)",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 50, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["CYP2D6 (Potente - eleva níveis de atípicos e tricíclicos!)"],
        cyp_substrates: ["CYP2B6"],
        qtc_score: 1.0,
        serotonin_potency: 0,
        hunter_risk: "Zero (Não atua na serotonina)"
    },
    mirtazapina: {
        name: "Mirtazapina", class: "NaSSA (Antagonista α2 + 5-HT2A/2C/3)",
        sert: 0, d2: 0, '5ht2a': 85, '5ht2c': 80, net: 0, h1: 95, m1: 10, alpha1: 10, alpha2: 90 /* alvo definidor: antagonismo α2 pré-sináptico */,
        cyp_inhibits: ["Mínima inibição hepática"],
        cyp_substrates: ["CYP1A2", "CYP2D6", "CYP3A4"],
        qtc_score: 1.0,
        serotonin_potency: 1.0,
        hunter_risk: "Baixo (Bloqueia 5-HT2A/3, o que protege contra náusea)"
    },
    risperidona: {
        name: "Risperidona", class: "Antipsicótico Atípico (SDA)",
        sert: 0, d2: 72 /* 2-4 mg: ~65-80% no PET (Kapur 1999); 6 mg ultrapassa 80% */, '5ht2a': 90, '5ht2c': 65, net: 0, h1: 60, m1: 0, alpha1: 85,
        cyp_inhibits: ["CYP2D6 (Leve)"],
        cyp_substrates: ["CYP2D6 ➔ 9-OH-Risperidona (Paliperidona)", "CYP3A4"],
        qtc_score: 2.0,
        serotonin_potency: 0,
        hunter_risk: "Zero"
    },
    olanzapina: {
        name: "Olanzapina", class: "Antipsicótico Atípico (MARTA)",
        sert: 0, d2: 70, '5ht2a': 85, '5ht2c': 75, net: 0, h1: 90, m1: 75, alpha1: 70,
        cyp_inhibits: ["Mínima"],
        cyp_substrates: ["CYP1A2 (Induzido por tabagismo!)", "CYP2D6"],
        qtc_score: 1.5,
        serotonin_potency: 0,
        hunter_risk: "Zero"
    },
    quetiapina: {
        name: "Quetiapina", class: "Antipsicótico Atípico (Hit-and-Run D2)",
        sert: 0, d2: 45, '5ht2a': 75, '5ht2c': 40, net: 30 /* via norquetiapina */, h1: 95, m1: 40, alpha1: 75,
        cyp_inhibits: ["Mínima"],
        cyp_substrates: ["CYP3A4 (Exclusivo - inibidores como Cetoconazol disparam níveis!)"],
        qtc_score: 2.2,
        serotonin_potency: 0,
        hunter_risk: "Zero"
    },
    clozapina: {
        name: "Clozapina", class: "Antipsicótico Padrão-Ouro Refratário",
        sert: 0, d2: 40, '5ht2a': 90, '5ht2c': 85, net: 0, h1: 95, m1: 95, alpha1: 90,
        cyp_inhibits: ["Mínima"],
        cyp_substrates: ["CYP1A2 (Principal)", "CYP2C19", "CYP3A4"],
        qtc_score: 2.2,
        serotonin_potency: 0,
        hunter_risk: "Zero"
    },
    haloperidol: {
        name: "Haloperidol", class: "Antipsicótico Típico de Alta Potência",
        sert: 0, d2: 92, '5ht2a': 20, '5ht2c': 10, net: 0, h1: 20, m1: 5, alpha1: 65,
        cyp_inhibits: ["CYP2D6 (Moderado)"],
        cyp_substrates: ["CYP2D6", "CYP3A4"],
        qtc_score: 2.8, // Alto em EV / altas doses
        serotonin_potency: 0,
        hunter_risk: "Zero"
    },
    litio: {
        name: "Carbonato de Lítio", class: "Estabilizador de Humor Canônico",
        // v12.62: SERT 10 e 5-HT2A 10 saíram. Eram heurística sem lastro — o lítio não age por ocupação de
        // receptor ou transportador (GSK-3β/inositol, ver drugTargetsExtra), e o Gate Clínico do SOPsi mediu
        // que esses dois números acendiam Dopamina, Serotonina e DMN no atlas por "afinidade" que não existe.
        // Zero aqui é resposta, não lacuna: o que o lítio faz está na prosa, com fonte.
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["Nenhuma (~95% renal: filtração glomerular com reabsorção proximal competindo com Na⁺ — por isso desidratação, hiponatremia, tiazídicos e IECA intoxicam)"],
        cyp_substrates: ["Nenhum (Interação crítica com AINEs, IECA, BRA e Tiazídicos)"],
        qtc_score: 1.0,
        serotonin_potency: 0.5, // Contribuição fraca/incerta (relatos isolados); o risco real da associação é toxicidade por lítio
        hunter_risk: "Contribuição fraca/incerta; vigiar litemia, não síndrome serotoninérgica"
    },
    valproato: {
        name: "Valproato de Sódio", class: "Estabilizador de Humor & Anticonvulsivante",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["CYP2C9", "UGT (Inibe glucuronidação da Lamotrigina - risco de Stevens-Johnson!)"],
        cyp_substrates: ["Metabolismo hepático mitocondrial / Glucuronidação"],
        qtc_score: 0.5,
        serotonin_potency: 0,
        hunter_risk: "Zero"
    },
    clonazepam: {
        name: "Clonazepam", class: "Benzodiazepínico de Alta Potência",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["Mínima"],
        cyp_substrates: ["CYP3A4"],
        qtc_score: 0.5,
        serotonin_potency: 0,
        hunter_risk: "Zero"
    },
    cbd: {
        name: "Canabidiol (CBD)", class: "Canabinoide (Modulador CB1/5-HT1A)",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["CYP3A4 (Moderado)", "CYP2C19 (Potente - eleva Clobazam!)", "CYP2D6 (Leve)"],
        cyp_substrates: ["CYP3A4", "CYP2C19"],
        qtc_score: 0.5,
        serotonin_potency: 1.5,
        hunter_risk: "Baixo",
        system: "ecb",
        target: "CB1 (Alostérico) + 5-HT1A + FAAH",
        mechanism: "Modulação alostérica negativa de CB1, agonismo parcial 5-HT1A, inibição de FAAH (aumentando anandamida) e antagonismo GPR55.",
        clinical: "Epilepsia refratária (Síndromes de Dravet e Lennox-Gastaut), ansiedade refratária e potencial antipsicótico sem induzir euforia.",
        dose: "10 a 20 mg/kg/dia"
    },
    thc: {
        name: "Delta-9-THC", class: "Agonista CB1 Psicoativo",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["CYP1A2 (Leve)"],
        cyp_substrates: ["CYP2C9", "CYP3A4"],
        qtc_score: 1.0,
        serotonin_potency: 0,
        hunter_risk: "Zero",
        system: "ecb",
        target: "CB1 (Ortostérico Pré-Sináptico)",
        mechanism: "Agonista parcial CB1 em terminais de GABA e Glutamato, suprimindo a liberação de transmissores (DSI/DSE) e desinibindo dopamina mesolímbica.",
        clinical: "Analgesia em dor neuropática crônica, antiemético pós-quimioterapia e estimulante de apetite; risco de psicose aguda e dependência.",
        dose: "2.5 a 10 mg/dia"
    },
    morfina: {
        name: "Morfina", class: "Agonista Opioide Mu Pleno",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 15, m1: 0, alpha1: 0,
        cyp_inhibits: ["Nenhuma"],
        cyp_substrates: ["UGT2B7 (Glucuronidação)"],
        qtc_score: 1.0,
        serotonin_potency: 0,
        hunter_risk: "Zero (Cuidado com Tramadol/Petidina que têm ação SERT!)",
        system: "opioid",
        target: "Receptor Mu (MOR) Gi/o",
        mechanism: "Abertura de canais GIRK de K+ e inibição de Cav pré-sináptico no corno dorsal e substância cinzenta periaquedutal (PAG); inibe o freio RMTg desinibindo a VTA.",
        clinical: "Padrão-ouro em dor aguda grave e oncológica; risco de depressão respiratória, constipação severa e dependência/tolerância.",
        dose: "10 a 30 mg a cada 4h"
    },
    naltrexona: {
        name: "Naltrexona", class: "Antagonista Opioide Mu/Kappa",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["Mínima"],
        cyp_substrates: ["Metabolismo hepático redutase"],
        qtc_score: 0.5,
        serotonin_potency: 0,
        hunter_risk: "Zero",
        system: "opioid",
        target: "Receptores Mu, Kappa e Delta",
        mechanism: "Bloqueio competitivo de receptores opioides na VTA e Accumbens, extinguindo o reforço hedônico do consumo de álcool e opioides.",
        clinical: "Tratamento de dependência de álcool (reduz fissura e 'dias de beber pesado') e prevenção de recaída em dependência de opioides.",
        dose: "50 mg/dia"
    },
    cafeina: {
        name: "Cafeína", class: "Antagonista Purinérgico A1/A2A",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 15, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["CYP1A2 (Substrato competitivo)"],
        cyp_substrates: ["CYP1A2 (95% depuração hepática!)"],
        qtc_score: 0.5,
        serotonin_potency: 0,
        hunter_risk: "Zero",
        system: "adenosine",
        target: "Receptores de Adenosina A1 e A2A",
        mechanism: "Bloqueia competitivamente o sinal de fadiga da adenosina nos receptores A1 corticais e A2A estriatais, desinibindo a liberação de dopamina e noradrenalina.",
        clinical: "Aumento do estado de alerta, redução do tempo de reação e atenuação da sonolência diurna; em excesso pode induzir ansiedade e taquicardia.",
        dose: "50 a 200 mg"
    },
    cetamina: {
        name: "Esquetamina / Cetamina", class: "Antidepressivo Glutamatérgico Rápido",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0, /* antagonista NMDA; afinidade D2/M1 clinicamente irrelevante */
        cyp_inhibits: ["Mínima"],
        cyp_substrates: ["CYP2B6", "CYP3A4 ➔ Norcetamina"],
        qtc_score: 1.0,
        serotonin_potency: 0,
        hunter_risk: "Zero"
    },
    paroxetina: {
        name: "Paroxetina", class: "ISRS (+ M1 + NOS) — o mais 'sujo' dos ISRS",
        sert: 92, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 15, h1: 5, m1: 25, alpha1: 5,
        cyp_inhibits: ["CYP2D6 (Potente — autoinibição, cinética não linear: pequenas mudanças de dose alteram muito o nível sérico)"],
        cyp_substrates: ["CYP2D6"],
        qtc_score: 1.0,
        serotonin_potency: 4.5,
        hunter_risk: "Moderado; risco alto de síndrome de descontinuação (meia-vida ~21h, sem metabólito ativo)",
        system: "5ht",
        target: "SERT + M1 + NOS",
        mechanism: "Bloqueio potente de SERT com ação anticolinérgica (M1) e inibição de NOS; inibidor potente de CYP2D6.",
        clinical: "Depressão, pânico, TAG, TOC, fobia social e TEPT. Maior ganho ponderal e disfunção sexual entre os ISRS; evitar na gestação (sinal de malformações cardíacas) e em polifarmácia com substratos de CYP2D6 (ADTs, risperidona, aripiprazol, tamoxifeno).",
        dose: "20 a 50 mg/dia (10 mg em idosos)"
    },
    citalopram: {
        name: "Citalopram", class: "ISRS Racêmico (S + R-citalopram)",
        sert: 85, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 10, m1: 0, alpha1: 0,
        cyp_inhibits: ["CYP2D6 (Leve)"],
        cyp_substrates: ["CYP2C19 (Principal)", "CYP3A4", "CYP2D6"],
        qtc_score: 2.5, // Prolongamento dose-dependente (~8-9 ms a 20mg, ~18 ms a 60mg): FDA 2011 limitou a 40 mg (20 mg se >65 anos, hepatopatia ou inibidor de CYP2C19)
        serotonin_potency: 4.0,
        hunter_risk: "Moderado",
        system: "5ht",
        target: "SERT (sítio primário)",
        mechanism: "Inibição seletiva de SERT; o enantiômero R é inerte e dilui a potência em relação ao escitalopram.",
        clinical: "Depressão e pânico; barato e com poucas interações, mas é o ISRS de maior efeito sobre o QTc: máximo 40 mg/dia (20 mg em idosos, hepatopatas e com omeprazol/fluconazol). ECG se combinado a outro prolongador de QTc.",
        dose: "20 a 40 mg/dia (máx. 20 mg >65 anos)"
    },
    ziprasidona: {
        name: "Ziprasidona", class: "Antipsicótico Atípico (SDA + 5-HT1A/1D + SERT/NET)",
        sert: 20, d2: 70, '5ht2a': 90, '5ht2c': 60, net: 20, h1: 30, m1: 0, alpha1: 40,
        cyp_inhibits: ["Mínima"],
        cyp_substrates: ["Aldeído-oxidase (2/3 da depuração — via não-CYP)", "CYP3A4 (1/3)"],
        qtc_score: 3.0, // Maior prolongamento entre os atípicos (~10-15 ms); contraindicada com outros prolongadores, QTc basal >500 ms, IAM recente e ICC descompensada
        serotonin_potency: 1.0,
        hunter_risk: "Baixo (inibição fraca de SERT/NET)",
        system: "da",
        target: "D2 + 5-HT2A + 5-HT1A (agonista) + SERT/NET",
        mechanism: "Antagonismo D2/5-HT2A com agonismo 5-HT1A e inibição fraca de SERT/NET; perfil metabólico neutro (sem ganho de peso relevante).",
        clinical: "Esquizofrenia e mania bipolar. Exige refeição de ≥500 kcal para absorver (biodisponibilidade cai ~50% em jejum). Contraindicada com outros prolongadores de QTc (metadona, citalopram alto, haloperidol EV, tioridazina, antiarrítmicos).",
        dose: "40 a 80 mg 2x/dia com alimento"
    },
    clomipramina: {
        name: "Clomipramina", class: "Antidepressivo Tricíclico (o mais serotoninérgico)",
        sert: 92, d2: 5, '5ht2a': 30, '5ht2c': 25, net: 60, h1: 70, m1: 65, alpha1: 60,
        cyp_inhibits: ["CYP2D6 (Moderado)"],
        cyp_substrates: ["CYP2D6 (hidroxilação — inibidores como fluoxetina/paroxetina elevam 2-3x)", "CYP1A2/2C19/3A4 (desmetilação ➔ desmetilclomipramina, mais noradrenérgica)"],
        qtc_score: 3.0, // Tricíclicos: bloqueio de Nav e hERG; QRS/QTc alargam em overdose
        serotonin_potency: 5.0,
        hunter_risk: "Alto: o tricíclico mais potente no SERT; proibido com IMAO e de risco com ISRS",
        system: "5ht",
        target: "SERT >> NET + M1/H1/α1 + Nav",
        mechanism: "Inibição potente de SERT (molécula-mãe) e de NET (desmetilclomipramina), com bloqueio muscarínico, histaminérgico, α1 e de canais de Na⁺.",
        clinical: "Padrão histórico no TOC (Clomipramine Collaborative Study) e em depressão grave/melancólica. Letal em overdose (cardiotoxicidade): prescrever quantidades pequenas em risco suicida; ECG basal e nível sérico quando associada a inibidores de CYP2D6.",
        dose: "75 a 250 mg/dia (TOC: até 250 mg)"
    },
    guanfacina: {
        name: "Guanfacina", class: "Agonista α2A Seletivo (não estimulante)",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0, alpha2: 85 /* alvo definidor: AGONISTA α2A — ver campo `acao` em drugTargetsExtra */,
        cyp_inhibits: ["Mínima"],
        cyp_substrates: ["CYP3A4 (indutores como carbamazepina reduzem o nível; inibidores o elevam)"],
        qtc_score: 0.5,
        serotonin_potency: 0,
        hunter_risk: "Zero",
        system: "ne",
        target: "α2A pós-sináptico (agonista)",
        mechanism: "Agonismo α2A: em espinhas dendríticas pré-frontais reduz a sinalização cAMP–HCN, fechando canais HCN e fortalecendo conexões recorrentes da rede de memória de trabalho. Em autorreceptores do LC reduz o disparo — por isso sedação e melhora executiva não são efeitos contraditórios.",
        clinical: "TDAH (isolada ou associada a estimulante), sobretudo com tiques, ansiedade ou hiperatividade/impulsividade proeminentes. Efeitos adversos dose-dependentes: sedação, hipotensão, bradicardia. ⚠️ Na meta-análise em rede de Cortese (2018) a guanfacina foi INFERIOR ao placebo em tolerabilidade em crianças e adolescentes (OR 2,64; IC 1,20–5,81) — o benefício sintomático convive com custo de tolerabilidade. Não retirar abruptamente (hipertensão rebote).",
        dose: "1 a 4 mg/dia (liberação prolongada, à noite)",
        source: ["cortese2018", "cools2021", "rangelGuias"],
        validado_em: "2026-08-29"
    },
    atomoxetina: {
        name: "Atomoxetina", class: "Inibidor Seletivo de NET (não estimulante)",
        sert: 10, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 85, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["Mínima"],
        cyp_substrates: ["CYP2D6 (metabolizadores lentos têm exposição muito maior; paroxetina e fluoxetina elevam o nível)"],
        qtc_score: 1.0,
        serotonin_potency: 0.5,
        hunter_risk: "Baixo (inibição fraca de SERT)",
        system: "ne",
        target: "NET (inibidor) — e, no CPF, também a depuração de dopamina",
        mechanism: "Inibe o NET. No córtex pré-frontal, onde a expressão de DAT é baixa, o NET é o principal responsável pela depuração da DOPAMINA (Morón 2002) — por isso a atomoxetina eleva NA e DA pré-frontais sem produzir o perfil estriatal de um bloqueador potente de DAT. É a base do seu perfil não estimulante e do baixo potencial de abuso.",
        clinical: "TDAH em crianças, adolescentes e adultos; alternativa quando estimulante é indesejado (tique, abuso de substância, ansiedade). Eficácia menor que a dos estimulantes na meta-análise de Cortese (2018): SMD −0,56 em crianças e −0,45 em adultos, ambas pela avaliação do clínico. Início lento (semanas). Atenção ao metabolizador lento de CYP2D6 e à associação com ISRS inibidores dessa via.",
        dose: "40 a 100 mg/dia (0,5 a 1,2 mg/kg/dia)",
        source: ["cortese2018", "moron2002", "rangelGuias"],
        validado_em: "2026-08-29"
    },
    aripiprazol: {
        name: "Aripiprazol", class: "Agonista Parcial D2 (ASD — antipsicótico de terceira geração)",
        /* As colunas abaixo estão ancoradas em OCUPAÇÃO medida por PET (Mamo 2007), não em palpite:
           D2 estriatal 87–93%, 5-HT2 54–60%, 5-HT1A 16%. Ver docs/Evidencia_Lamotrigina_Aripiprazol.md. */
        sert: 0, d2: 90 /* agonista PARCIAL — ver drugTargetDirection */, '5ht2a': 57, '5ht2c': 40,
        net: 0, h1: 30, m1: 0, alpha1: 40,
        cyp_inhibits: ["Mínima"],
        cyp_substrates: ["CYP2D6 e CYP3A4 (metabolizador lento de 2D6 e inibidores de 3A4 elevam o nível)"],
        qtc_score: 0.5,
        serotonin_potency: 0,
        hunter_risk: "Zero",
        system: "da",
        mechanism: "Agonista parcial de D2 com afinidade altíssima: ocupa o receptor quase por completo e nele produz sinalização submáxima. Onde a dopamina está alta, desloca o agonista pleno e o efeito líquido é de redução; onde está baixa, sustenta um tônus mínimo. É por isso que a mesma molécula é descrita como estabilizadora. Também é antagonista de 5-HT2A e agonista parcial de 5-HT1A.",
        clinical: "Esquizofrenia, mania, e adjuvante na depressão unipolar. ⚠️ ACHADO QUE CONTRARIA A REGRA DA JANELA D2: em PET, o aripiprazol atinge 87–93% de ocupação estriatal — bem acima do limiar clássico de 80% para efeitos extrapiramidais — SEM produzir EPS na maioria dos casos (Yokoi 2002; Mamo 2007). Em Mamo, mesmo a dose de 10 mg já levou a 85% de ocupação, e EPS ocorreu em 2 de 4 participantes acima de 90%. Acatisia é o efeito adverso característico.",
        dose: "10 a 30 mg/dia (10 mg já satura D2)",
        source: ["mamo2007", "yokoi2002", "rangelGuias"],
        validado_em: "2026-08-29"
    },
    zuranolona: {
        name: "Zuranolona", class: "Esteroide neuroativo — modulador alostérico positivo de GABA-A",
        /* Zeros honestos: não age em receptores monoaminérgicos. O alvo é o GABA-A, sobretudo o
           extrassináptico contendo δ, que está na ontologia mas fora das 9 colunas de afinidade. */
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["Nenhuma"],
        cyp_substrates: ["CYP3A4"],
        qtc_score: 0,
        serotonin_potency: 0,
        hunter_risk: "Zero",
        system: "gaba",
        mechanism: "Análogo sintético da alopregnanolona, com biodisponibilidade oral. Atua como modulador alostérico positivo do receptor GABA-A, incluindo os heteropentâmeros extrassinápticos contendo a subunidade δ, que sustentam a inibição TÔNICA — corrente contínua, sem dessensibilização rápida, distinta da inibição fásica dos benzodiazepínicos no sítio α/γ2. Frieder (2019) situa o racional: a queda abrupta de esteroides neuroativos no pós-parto é a base fisiopatológica que motivou esta classe.",
        clinical: "Depressão pós-parto, em curso ORAL DE 14 DIAS — não é uso contínuo. No ensaio de fase 3 (Deligiannidis 2021, n = 153), o HAMD-17 caiu −17,8 com zuranolona contra −13,6 com placebo no dia 15: diferença de −4,2 (IC 95% −6,9 a −1,5; p = 0,003), com separação já no dia 3 e mantida até o dia 45. ⚠️ Repare que o braço placebo melhorou 13,6 pontos — a maior parte da recuperação não é do fármaco. NNT de 5 para resposta e para remissão no dia 15 (Deligiannidis 2023, análise exploratória). Sonolência e sedação são os efeitos característicos; um evento adverso grave em cada braço.",
        dose: "30 mg/dia à noite, por 14 dias",
        source: ["deligiannidis2021", "deligiannidis2023", "frieder2019"],
        validado_em: "2026-08-29"
    },
    carbamazepina: {
        name: "Carbamazepina", class: "Estabilizador — bloqueador de canal de sódio; indutor enzimático potente",
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["Nenhuma (é INDUTOR, não inibidor)"],
        cyp_substrates: ["CYP3A4 (autoindução: o próprio nível cai nas primeiras semanas)"],
        qtc_score: 0.5,
        serotonin_potency: 0,
        hunter_risk: "Zero",
        system: "glu",
        mechanism: "Bloqueia canais de sódio dependentes de voltagem de forma voltagem- e uso-dependente, com preferência pelo estado inativado — mesma família de mecanismo da lamotrigina (Sun & Lin 2000). Simulações de dinâmica molecular no Nav1.4 humano situam carbamazepina e lamotrigina em sítios semelhantes dentro do poro, ambos sem ocluí-lo centralmente (Buyan 2021 — simulação, e em canal de músculo esquelético, não neuronal). É também INDUTOR potente de CYP3A4 e de UGT, e é por essa via que derruba o nível de outros fármacos.",
        clinical: "Epilepsia focal, transtorno bipolar e neuralgia do trigêmeo. ⚠️ Como indutor, reduz a meia-vida da lamotrigina de 22,8–37,4 h para 13,5–15 h (Rambeck 1993) — o espelho exato do valproato, que a eleva. ⚠️ FARMACOGENÔMICA COM FORÇA DE INTERVENÇÃO, ao contrário da lamotrigina: no rastreamento prospectivo de Chen (2011, NEJM, 4.877 participantes em Taiwan), 7,7% eram portadores de HLA-B*15:02 e evitaram o fármaco; entre os NÃO portadores que o tomaram, NENHUM caso de SJS/NET, contra cerca de 10 esperados pela incidência histórica de 0,23% (p < 0,001). A FDA alterou a bula para recomendar teste genético. A associação, porém, é dependente de ancestralidade e não se observa onde a frequência do alelo é baixa (Lee 2010).",
        dose: "400 a 1200 mg/dia, com titulação e monitorização de hemograma e sódio",
        source: ["chen2011", "lee2010", "sun2000", "buyan2021", "rambeck1993"],
        validado_em: "2026-08-29"
    },
    lamotrigina: {
        name: "Lamotrigina", class: "Estabilizador — bloqueador de canal de sódio dependente de voltagem",
        /* Zeros honestos: a lamotrigina não age em receptores monoaminérgicos. Seu alvo (Nav) está
           FORA das 9 colunas e fora da ontologia canônica v0.1.0 — ver drugTargetsForaDaOntologia. */
        sert: 0, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 0, h1: 0, m1: 0, alpha1: 0,
        cyp_inhibits: ["Nenhuma"],
        cyp_substrates: ["UGT2B7 e UGT1A4 (glucuronidação, NÃO citocromo P450) — o valproato inibe a UGT2B7"],
        qtc_score: 0,
        serotonin_potency: 0,
        hunter_risk: "Zero",
        system: "glu",
        mechanism: "Bloqueia canais de sódio dependentes de voltagem no estado inativado, estabilizando a membrana neuronal e reduzindo a liberação de glutamato — o efeito é maior justamente onde o disparo é de alta frequência, que é o que lhe dá seletividade para o tecido hiperexcitável. Large (2005) sustenta a via do canal de sódio como a mais provável, mas registra que outras interações moleculares não estão descartadas.",
        clinical: "Manutenção do transtorno bipolar e epilepsia. Revisão Cochrane (Hashimoto 2021, 11 ECRs, 2314 participantes): superior ao placebo com certeza BAIXA A MODERADA; frente ao lítio a eficácia foi semelhante, com melhor tolerabilidade (RR 0,70; IC 0,51–0,96) porém MAIS recorrência de mania (RR 2,13; IC 1,32–3,44). ⚠️ Reação cutânea alérgica em ~10% dos pacientes, quase sempre nas 8 primeiras semanas; exantema com internação (incluindo Stevens-Johnson) em ~1/300 adultos e ~1/100 crianças, aumentado por titulação rápida e por valproato concomitante (Guberman 1999). 🧬 Há associação entre alelos HLA e SJS/NET por lamotrigina, mas TODA a evidência vem de populações do Leste Asiático e é mais fraca que a da carbamazepina — ver o cartão de farmacogenômica no app antes de extrapolar.",
        dose: "25 a 200 mg/dia, com titulação lenta obrigatória — e METADE da velocidade se houver valproato",
        source: ["hashimoto2021", "large2005", "guberman1999", "rowland2006", "klarica2018", "rambeck1993", "li2014", "zeng2014", "shi2017"],
        validado_em: "2026-08-29"
    },
    metadona: {
        name: "Metadona", class: "Agonista Opioide Mu Pleno + Antagonista NMDA",
        sert: 10, d2: 0, '5ht2a': 0, '5ht2c': 0, net: 10, h1: 5, m1: 0, alpha1: 0,
        cyp_inhibits: ["CYP2D6 (Moderado)"],
        cyp_substrates: ["CYP3A4 (Principal)", "CYP2B6", "CYP2C19"],
        qtc_score: 3.5, // Bloqueio de hERG dose-dependente: ECG basal, aos 30 dias e anualmente (SAMHSA/CSAT 2009); risco marcante >100 mg/dia
        serotonin_potency: 1.5,
        hunter_risk: "Baixo a moderado (inibição fraca de SERT/NET; relatos com ISRS/IMAO)",
        system: "opioid",
        target: "Receptor Mu (MOR) + NMDA + SERT/NET fraco",
        mechanism: "Agonismo pleno MOR de meia-vida longa (15-60h, altamente variável) com antagonismo NMDA que reduz tolerância e dor neuropática.",
        clinical: "Terapia de manutenção na dependência de opioides e dor crônica. Meia-vida longa e variável → acúmulo e depressão respiratória na titulação (incrementos só a cada 5-7 dias). Indutores de CYP3A4 (carbamazepina, rifampicina, fenitoína) precipitam abstinência; inibidores elevam o nível.",
        dose: "20 a 120 mg/dia (manutenção)"
    }
};

const drugsData = drugBindingAffinities;

// ====================================================================================================
// vindo de features.js
// ====================================================================================================

function renderPharmaClasses(state) {
    const q = (state.pharmaSearch || '').toLowerCase();
    const match = (d) => !q || [d.name, d.target, d.mechanism, d.therapeutic, d.adverse, d.cyp, d.pearl].filter(Boolean).join(' ').toLowerCase().includes(q);
    const row = (d, color) => {
        const inPoly = !!drugBindingAffinities[d.id];
        return `<div style="padding: 6px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin: 4px 0; background: rgba(255,255,255,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                <b style="color: ${color};">${d.name}</b>
                ${inPoly ? `<button class="pill-btn" style="font-size: 0.6rem; padding: 2px 7px;" title="Adicionar ao motor de polifarmácia" onclick="store.dispatch({type: 'TOGGLE_POLY_DRUG', drugKey: '${d.id}'}); store.dispatch({type: 'SET_PHARMA_TAB', tab: 'poly'})">➕ Prescrever</button>` : '<span style="font-size: 0.6rem; color: var(--text-faint);">sem perfil de ocupação</span>'}
            </div>
            <div style="font-size: 0.68rem; color: var(--text-soft); margin-top: 2px;"><b>Alvo:</b> ${d.target}${d.mechanism ? ' • ' + d.mechanism : ''}</div>
            ${d.therapeutic ? `<div style="font-size: 0.66rem; color: var(--text-muted);"><b>Uso:</b> ${d.therapeutic} <b>• Adversos:</b> ${d.adverse || '—'} <b>• CYP:</b> ${d.cyp || '—'}</div>` : ''}
            ${d.pearl ? `<div style="font-size: 0.66rem; color: var(--ink-amber-soft); margin-top: 2px;">💎 ${d.pearl}</div>` : ''}
        </div>`;
    };
    const group = (title, color, drugs) => { const list = drugs.filter(match); return list.length ? `<div class="card" style="border-color: ${color}55;"><div class="card-title"><span style="color: ${color};">${title}</span><span style="font-size: 0.62rem; color: var(--text-muted);">${list.length}</span></div>${list.map(d => row(d, color)).join('')}</div>` : ''; };
    let html = `<div class="card" style="border-color: var(--accent);">
            <input type="text" id="filtro-farmacoteca" placeholder="🔎 Filtrar por nome, alvo, uso, adverso ou CYP…" value="${escapeHtml(state.pharmaSearch || '')}" style="width: 100%; background: var(--surface-inset); border: 1px solid var(--line-15); color: var(--text-main); border-radius: 6px; padding: 6px 9px; font-size: 0.76rem;" oninput="store.getState().pharmaSearch = this.value; renderInspector(); const el = document.querySelector('#inspector-content input[type=text]'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }">
            <div style="font-size: 0.64rem; color: var(--text-muted); margin-top: 4px;">${Object.values(antidepressantsData).reduce((n, c) => n + c.drugs.length, 0)} antidepressivos • ${Object.values(antipsychoticsData).reduce((n, c) => n + c.drugs.length, 0)} antipsicóticos • ${moodAndAnxioData.stabilizers.length + moodAndAnxioData.anxiolytics.length} estabilizadores/ansiolíticos. "➕ Prescrever" leva o fármaco ao motor de polifarmácia.</div>
        </div>`;
    html += `<div class="card-title"><span style="color: var(--ink-pink);">💊 Antidepressivos</span></div>` + Object.values(antidepressantsData).map(c => group(c.className, '#f472b6', c.drugs)).join('');
    html += `<div class="card-title" style="margin-top: 6px;"><span style="color: var(--ink-purple-500);">🧠 Antipsicóticos</span></div>` + Object.values(antipsychoticsData).map(c => group(c.className, '#a855f7', c.drugs)).join('');
    html += `<div class="card-title" style="margin-top: 6px;"><span style="color: var(--ink-emerald);">🛡️ Estabilizadores do humor</span></div>` + group('Estabilizadores', '#34d399', moodAndAnxioData.stabilizers);
    html += `<div class="card-title" style="margin-top: 6px;"><span style="color: var(--accent);">😴 Ansiolíticos & Hipnóticos</span></div>` + group('Ansiolíticos / Hipnóticos', '#38bdf8', moodAndAnxioData.anxiolytics);
    return html;
}

// Acoplar um farmaco a partir de outro lugar (Spotlight, experimentos POE) = PRESCREVE-LO, na mesma lista. Se a
// prescricao esta cheia (4), o ultimo prescrito sai para dar lugar. (v12.40: era SELECT_DRUG, o segundo vocabulario.)
function prescrever(drugKey) {
    const lista = store.getState().selectedDrugsList || [];
    if (lista.includes(drugKey)) return;
    if (lista.length >= 4) store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: lista[lista.length - 1] });
    store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey });
}

// "Nenhum farmaco" na prateleira: tira da prescricao os farmacos DESTE sistema, e so eles (dominio Psicofarmacos).
function desprescreverSistema(system) {
    const ids = ((typeof systemDrugsMap !== 'undefined' && systemDrugsMap[system]) || []).map(d => d.id);
    for (const k of (store.getState().selectedDrugsList || []).slice()) if (ids.includes(k)) store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: k });
}

/*
 * v12.40: cena, sessao ou link de antes desta versao gravavam selectedDrugId/drugDocked (o farmaco acoplado). O acoplado
 * antigo entra na prescricao (na ultima vaga, se estiver cheia) e as duas chaves somem. Com "none", so somem.
 */
function normalizarFarmacoAntigo(estado) {
    if (!estado || typeof estado !== 'object' || !('selectedDrugId' in estado || 'drugDocked' in estado)) return estado;
    const novo = Object.assign({}, estado);
    const antigo = novo.selectedDrugId; delete novo.selectedDrugId; delete novo.drugDocked;
    if (antigo && antigo !== 'none') {
        const lista = Array.isArray(novo.selectedDrugsList) ? novo.selectedDrugsList.slice() : [];
        if (!lista.includes(antigo)) { if (lista.length >= 4) lista[3] = antigo; else lista.push(antigo); }
        novo.selectedDrugsList = lista;
    }
    return novo;
}

// ====================================================================================================
// vindo de render3d.js
// ====================================================================================================

function applyClinicalPreset(presetId) {
    if (presetId === 'mdd_ssri') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos });
        store.dispatch({ type: 'CLEAR_POLY_DRUGS' });
        store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: 'escitalopram' });
    } else if (presetId === 'trd_augment') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos });
        store.dispatch({ type: 'CLEAR_POLY_DRUGS' });
        store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: 'venlafaxina' });
        store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: 'quetiapina' });
    } else if (presetId === 'bipolar_mania') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos });
        store.dispatch({ type: 'CLEAR_POLY_DRUGS' });
        store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: 'litio' });
        store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: 'olanzapina' });
    } else if (presetId === 'scz_refractory') {
        store.dispatch({ type: 'SET_MASTER_MODE', mode: MODO.psicofarmacos });
        store.dispatch({ type: 'CLEAR_POLY_DRUGS' });
        store.dispatch({ type: 'TOGGLE_POLY_DRUG', drugKey: 'clozapina' });
    }
    playBioTone(600, 'sine', 0.15, 0.15);
}

// ====================================================================================================
// vindo de main.js
// ====================================================================================================

function onCrossTaperingOverlayClick(e) {
    if (e.target && e.target.id === 'crossTaperingOverlay') closeCrossTaperingModal();
}

// ==========================================
// 13.7 CROSS-TAPERING CALCULATOR ENGINE
// ==========================================
function openCrossTaperingModal() {
    const overlay = document.getElementById('crossTaperingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        updateCrossTaperingCalculations();
    }
}

function closeCrossTaperingModal() {
    const overlay = document.getElementById('crossTaperingOverlay');
    if (overlay) overlay.style.display = 'none';
}

// --- Regime posológico (v10.3): C(t) por superposição de doses, 1 compartimento, absorção instantânea ---
const PK_HALF_LIVES = {
    fluoxetina: { t: 96, label: 'Fluoxetina (t½ ~4 dias; norfluoxetina ~10 dias)', metab: 240 },
    sertralina: { t: 26, label: 'Sertralina (t½ ~26 h)' }, escitalopram: { t: 30, label: 'Escitalopram (t½ ~30 h)' }, citalopram: { t: 35, label: 'Citalopram (t½ ~35 h)' },
    paroxetina: { t: 21, label: 'Paroxetina (t½ ~21 h, sem metabólito ativo)' }, fluvoxamina: { t: 15, label: 'Fluvoxamina (t½ ~15 h)' },
    venlafaxina: { t: 5, label: 'Venlafaxina (t½ ~5 h; O-desmetil ~11 h)', metab: 11 }, desvenlafaxina: { t: 11, label: 'Desvenlafaxina (t½ ~11 h)' }, duloxetina: { t: 12, label: 'Duloxetina (t½ ~12 h)' },
    bupropiona: { t: 21, label: 'Bupropiona (t½ ~21 h; hidroxibupropiona ~20 h)' }, mirtazapina: { t: 30, label: 'Mirtazapina (t½ ~30 h)' }, vortioxetina: { t: 66, label: 'Vortioxetina (t½ ~66 h)' },
    clomipramina: { t: 32, label: 'Clomipramina (t½ ~32 h)' }, amitriptilina: { t: 20, label: 'Amitriptilina (t½ ~20 h)' }, agomelatina: { t: 2, label: 'Agomelatina (t½ ~2 h)' },
    risperidona: { t: 20, label: 'Risperidona + 9-OH (t½ ~20 h)' }, olanzapina: { t: 33, label: 'Olanzapina (t½ ~33 h)' }, quetiapina: { t: 7, label: 'Quetiapina IR (t½ ~7 h)' },
    aripiprazol: { t: 75, label: 'Aripiprazol (t½ ~75 h)' }, haloperidol: { t: 20, label: 'Haloperidol (t½ ~20 h)' }, clozapina: { t: 12, label: 'Clozapina (t½ ~12 h)' },
    litio: { t: 24, label: 'Lítio (t½ ~24 h; maior em idosos/DRC)' }, valproato: { t: 12, label: 'Valproato (t½ ~12 h)' }, lamotrigina: { t: 30, label: 'Lamotrigina (t½ ~30 h; 60 h com valproato)' },
    metadona: { t: 30, label: 'Metadona (t½ 15–60 h, variável)' }, diazepam: { t: 45, label: 'Diazepam (t½ ~45 h; nordiazepam ~100 h)', metab: 100 }, lorazepam: { t: 12, label: 'Lorazepam (t½ ~12 h)' }, clonazepam: { t: 35, label: 'Clonazepam (t½ ~35 h)' }
};

function pkFillDrugSelect() {
    const sel = document.getElementById('pkDrug'); if (!sel || sel.options.length) return;
    Object.keys(PK_HALF_LIVES).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = PK_HALF_LIVES[k].label; sel.appendChild(o); });
    const from = document.getElementById('switchDrugFrom'); if (from && PK_HALF_LIVES[from.value]) sel.value = from.value;
    pkPresetFromDrug();
}

function pkPresetFromDrug() {
    const sel = document.getElementById('pkDrug'); const d = sel && PK_HALF_LIVES[sel.value]; if (!d) return;
    const hl = document.getElementById('pkHalfLife'); if (hl) hl.value = d.t;
    updateDosingRegimen();
}

function updateDosingRegimen() {
    const canvas = document.getElementById('pkCanvas'); if (!canvas) return;
    const t12 = Math.max(1, parseFloat(document.getElementById('pkHalfLife')?.value) || 24);
    const tau = Math.max(1, parseFloat(document.getElementById('pkInterval')?.value) || 24);
    const days = Math.max(2, parseFloat(document.getElementById('pkDays')?.value) || 21);
    const sel = document.getElementById('pkDrug'); const meta = sel && PK_HALF_LIVES[sel.value]; const tMetab = meta && meta.metab;
    const k = Math.LN2 / t12;
    const R = 1 / (1 - Math.exp(-k * tau));          // razão de acúmulo
    const tSS90 = 3.32 * t12;                          // ~90% do estado estacionário
    const cssMax = R;                                  // Cmáx no estado estacionário em unidades de dose
    const totalH = days * 24 + Math.max(tSS90 * 1.5, 5 * t12, 72);
    const nPts = 700; const dt = totalH / nPts;
    const conc = new Float32Array(nPts), concM = new Float32Array(nPts);
    const kM = tMetab ? Math.LN2 / tMetab : 0;
    for (let i = 0; i < nPts; i++) {
        const t = i * dt; let c = 0, cm = 0;
        for (let n = 0; n * tau <= Math.min(t, days * 24); n++) { const dtn = t - n * tau; c += Math.exp(-k * dtn); if (kM) cm += 0.6 * (Math.exp(-kM * dtn) - Math.exp(-k * dtn)) * (k / (k - kM || 1e-6)); }
        conc[i] = c; concM[i] = Math.max(0, cm);
    }
    const ymax = Math.max(cssMax * 1.15, 1.2, ...(kM ? Array.from(concM) : [0]));
    const w = canvas.width, h = canvas.height, ctx = canvas.getContext('2d');
    ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, w, h);
    const padL = 34, padB = 22, padT = 8, plotW = w - padL - 10, plotH = h - padT - padB;
    const X = (tH) => padL + plotW * tH / totalH, Y = (c) => padT + plotH * (1 - c / ymax);
    // grade por dias
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    const dayStep = totalH / 24 > 40 ? 7 : (totalH / 24 > 20 ? 5 : 2);
    for (let d = 0; d * 24 <= totalH; d += dayStep) { ctx.beginPath(); ctx.moveTo(X(d * 24), padT); ctx.lineTo(X(d * 24), padT + plotH); ctx.stroke(); ctx.fillText('d' + d, X(d * 24), h - 8); }
    // faixa de estado estacionário (Cmín–Cmáx)
    const cssMin = cssMax * Math.exp(-k * tau);
    ctx.fillStyle = 'rgba(52,211,153,0.10)'; ctx.fillRect(padL, Y(cssMax), plotW, Y(cssMin) - Y(cssMax));
    ctx.strokeStyle = 'rgba(52,211,153,0.5)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(padL, Y(cssMax)); ctx.lineTo(padL + plotW, Y(cssMax)); ctx.stroke(); ctx.setLineDash([]);
    // marcadores: 90% do SS e suspensão
    ctx.strokeStyle = 'rgba(56,189,248,0.6)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(tSS90), padT); ctx.lineTo(X(tSS90), padT + plotH); ctx.stroke();
    ctx.strokeStyle = 'rgba(248,113,113,0.7)'; ctx.beginPath(); ctx.moveTo(X(days * 24), padT); ctx.lineTo(X(days * 24), padT + plotH); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8'; ctx.textAlign = 'left'; ctx.fillText('≈90% SS (' + (tSS90 / 24).toFixed(1) + ' d)', X(tSS90) + 3, padT + 10);
    ctx.fillStyle = '#f87171'; ctx.fillText('suspensão', X(days * 24) + 3, padT + 22);
    // metabólito ativo
    if (kM) { ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let i = 0; i < nPts; i++) { const x = X(i * dt), y = Y(concM[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    // fármaco-mãe
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < nPts; i++) { const x = X(i * dt), y = Y(conc[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    // eixo y
    ctx.fillStyle = '#64748b'; ctx.textAlign = 'right'; ctx.fillText('C/D', padL - 4, padT + 10); ctx.fillText('0', padL - 4, padT + plotH);
    // resumo
    const washout90 = 3.32 * t12, washoutMetab = tMetab ? 3.32 * tMetab : 0;
    const sum = document.getElementById('pkSummary'); if (sum) sum.textContent = `R = ${R.toFixed(2)} • Cmáx/Cmín no SS = ${(cssMax / cssMin).toFixed(2)} • 90% do SS em ${(tSS90 / 24).toFixed(1)} d • 90% eliminado ${(washout90 / 24).toFixed(1)} d após suspender` + (tMetab ? ` (metabólito ativo: ${(washoutMetab / 24).toFixed(0)} d)` : '');
    const note = document.getElementById('pkNote'); if (note) note.innerHTML = `<b>Leitura:</b> a curva roxa é o fármaco-mãe em unidades de dose (F/V = 1); a faixa verde é a janela C<sub>mín</sub>–C<sub>máx</sub> do estado estacionário${tMetab ? '; a curva amarela é o metabólito ativo de meia-vida longa, que explica por que a fluoxetina não precisa de desmame e por que a inibição de CYP2D6 persiste semanas' : ''}. Regra prática: <b>≈3,3 meias-vidas</b> para atingir 90% do estado estacionário e o mesmo tempo para eliminar 90% após suspender — é isso que define quando avaliar resposta, quando dosar nível sérico e quanto tempo de washout um IMAO exige. Modelo de 1 compartimento com absorção instantânea: ignora Tmáx, ligação proteica, cinética não linear (paroxetina, fluoxetina) e variação de CYP.`;
}

function updateCrossTaperingCalculations() {
    pkFillDrugSelect();
    const pkSel = document.getElementById('pkDrug'); const fromSel = document.getElementById('switchDrugFrom');
    if (pkSel && fromSel && PK_HALF_LIVES[fromSel.value] && pkSel.dataset.lastFrom !== fromSel.value) { pkSel.value = fromSel.value; pkSel.dataset.lastFrom = fromSel.value; pkPresetFromDrug(); }
    const fromEl = document.getElementById('switchDrugFrom');
    const toEl = document.getElementById('switchDrugTo');
    const stratCard = document.getElementById('switchStrategyCard');
    const warnCard = document.getElementById('switchWarningCard');
    const canvas = document.getElementById('crossTaperingCanvas');
    if (!fromEl || !toEl || !stratCard || !warnCard || !canvas) return;

    const fromDrug = fromEl.value;
    const toDrug = toEl.value;

    // Half-lives and clinical rules
    let strategyText = "";
    let warningText = "";
    let isWashoutStrict = false;

    if (toDrug === 'tranilcipromina') {
        isWashoutStrict = true;
        const washoutWeeks = fromDrug === 'fluoxetina' ? '5 SEMANAS' : '2 SEMANAS';
        strategyText = `<b style="color: var(--ink-red-500);">🚨 ESTRATÉGIA: WASHOUT COMPLETO OBRIGATÓRIO (${washoutWeeks})</b><br>Descontinuar completamente ${fromDrug.toUpperCase()}, aguardar ${washoutWeeks} de depuração plasmática e só então iniciar o IMAO com dose baixa (10 mg/dia).`;
        warningText = `⚠️ <b>RISCO GRAVE DE CRISE HIPERTENSIVA & SÍNDROME SEROTONINÉRGICA FATAL:</b> A introdução de IMAO sem o período estrito de washout após ISRS/IRSN pode precipitar toxicidade letal por hiperestimulação 5-HT2A.`;
    } else if (fromDrug === 'fluoxetina') {
        strategyText = `<b style="color: var(--accent);">🔄 ESTRATÉGIA: DIRECT SWITCH OU CROSS-TAPERING ACELERADO</b><br>Devido à meia-vida ultralonga da Fluoxetina e da Norfluoxetina (~7-15 dias), o desmame é 'auto-sustentado'. Pode-se suspender a Fluoxetina e iniciar ${toDrug.toUpperCase()} no dia seguinte; <b>reduzir a dose inicial se o novo fármaco for substrato de CYP2D6</b> (ADTs, risperidona, aripiprazol, atomoxetina), pois a norfluoxetina mantém a inibição por 4-6 semanas.`;
        warningText = `ℹ️ <b>Dica de Stahl:</b> Não há necessidade de desmame lento da Fluoxetina devido ao seu próprio washout gradual. Monitorar interações pelo bloqueio prolongado de CYP2D6.`;
    } else if (fromDrug === 'venlafaxina' || fromDrug === 'paroxetina') {
        strategyText = `<b style="color: var(--ink-amber-500);">📉 ESTRATÉGIA: CROSS-TAPERING LENTO EM DEGRAUS (4 A 6 SEMANAS)</b><br>Reduzir ${fromDrug.toUpperCase()} em 25% a cada 7-10 dias, enquanto ${toDrug.toUpperCase()} é introduzido simultaneamente em dose submáxima inicial.`;
        warningText = `⚠️ <b>ALTO RISCO DE SÍNDROME DE DESCONTINUAÇÃO:</b> Paroxetina e Venlafaxina possuem meias-vidas curtas e meia-vida de dissociação rápida dos receptores SERT, podendo deflagrar choque elétrico cerebral (*brain zaps*), tontura, náusea e ansiedade de rebote.`;
    } else {
        strategyText = `<b style="color: var(--ink-green-500);">⚖️ ESTRATÉGIA: CROSS-TAPERING MODERADO (2 A 3 SEMANAS)</b><br>Reduzir 50% de ${fromDrug.toUpperCase()} na 1ª semana e 25% na 2ª semana, enquanto ${toDrug.toUpperCase()} é titulado até a dose alvo.`;
        warningText = `✅ <b>Transição Segura:</b> Monitore sintomas de sobreposição serotoninérgica e resposta clínica a cada 2 semanas.`;
    }

    stratCard.innerHTML = strategyText;
    warnCard.innerHTML = warningText;

    // Draw Canvas Transition Graph
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, h - 30);
    ctx.lineTo(w - 20, h - 30);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText("100%", 15, 25);
    ctx.fillText("50%", 20, (h - 30 + 20) / 2);
    ctx.fillText("0%", 25, h - 30);

    const weeks = ["Dia 0", "Semana 1", "Semana 2", "Semana 3", "Semana 4"];
    const stepX = (w - 70) / 4;
    weeks.forEach((wk, i) => {
        ctx.fillText(wk, 45 + i * stepX, h - 12);
    });

    // Curve Drug A (Decay)
    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(50, 25);
    for (let i = 0; i <= 4; i++) {
        const x = 50 + i * stepX;
        const decayRatio = isWashoutStrict ? Math.max(0, 1.0 - i * 0.45) : (fromDrug === 'fluoxetina' ? Math.pow(0.75, i) : Math.pow(0.5, i));
        const y = (h - 30) - decayRatio * (h - 55);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Curve Drug B (Titration)
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    const startWeek = isWashoutStrict ? 2 : 0;
    ctx.moveTo(50 + startWeek * stepX, h - 30);
    for (let i = startWeek; i <= 4; i++) {
        const x = 50 + i * stepX;
        const titrRatio = (i - startWeek) / (4 - startWeek);
        const y = (h - 30) - titrRatio * (h - 55);
        ctx.lineTo(x, y);
    }
    ctx.stroke();
}


// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { KI_RECEPTORS, analyzePolypharmacy, antidepressantsData, antipsychoticsData, closeCrossTaperingModal,
    desprescreverSistema, directionConflicts, drugBindingAffinities, drugPKref, drugTargetsExtra,
    drugTargetsForaDaOntologia, drugsData, drugsForTarget, farmacoAcoplado, hasKiData, kiCompetitiveOccupancy,
    modeledTargetIds, moodAndAnxioData, normalizarFarmacoAntigo, occupancyExceptionsIn, onCrossTaperingOverlayClick,
    openCrossTaperingModal, pharmacogenomicRiskIn, pkPresetFromDrug, prescrever, renderPharmaClasses, systemDrugsMap,
    targetsOfDrug, updateCrossTaperingCalculations, updateDosingRegimen };
// ── fim do exporta ──
