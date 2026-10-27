// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import '../dominios/psicoeducacao.js?v=12.76.2';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { systemsData } from '../data.js?v=12.76.2';
import { store } from '../store.js?v=12.76.2';
import { escapeHtml } from '../features.js?v=12.76.2';
import { playBioTone, relogioSimulacao } from '../engine.js?v=12.76.2';
// ── fim dos módulos ──
/*
 * DOMINIO NEURONIO — um palco inteiro num arquivo so (decisao D3 do autor, "pastas por dominio").
 *
 * Ate a v12.47 este codigo morava espalhado por 5 arquivo(s) organizados por CAMADA
 * (data.js, features.js, engine.js, render2d.js, main.js): quem quisesse mexer neste palco procurava em todos.
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

/*
 * v12.9 — TIPOS DE DISPARO DE IZHIKEVICH (2003).
 *
 * Os parâmetros a, b, c, d abaixo são os do artigo original — não foram ajustados por mim.
 * São classes de neurônio CORTICAL, e é assim que estão nomeadas: não atribuí nenhuma delas a
 * um sistema de neurotransmissor sem fonte. Onde há vínculo clínico com fonte verificável, ele
 * está no campo `clinica` com a referência; onde não há, o campo não existe.
 *
 * Significado dos parâmetros:
 *   a — velocidade de recuperação de u. Maior = recupera rápido = dispara rápido sem adaptar.
 *   b — sensibilidade de u às flutuações subliminares de v. Maior = mais propenso a rebote.
 *   c — potencial de reset após o espigão (mV).
 *   d — incremento de u após o espigão. Maior = mais adaptação, disparo desacelera.
 */
const IZHIKEVICH_TYPES = {
    RS: {
        nome: 'Disparo regular (RS)', celula: 'Neurônio piramidal excitatório do neocórtex',
        a: 0.02, b: 0.2, c: -65, d: 8,
        desc: 'Dispara em frequência decrescente sob corrente constante — adaptação de frequência. É o padrão mais comum do córtex.',
        source: ['izhikevich2003']
    },
    IB: {
        nome: 'Rajada intrínseca (IB)', celula: 'Piramidal de camada 5',
        a: 0.02, b: 0.2, c: -55, d: 4,
        desc: 'Começa com uma salva de espigões e depois passa a disparo regular. O reset menos negativo (c = −55) é o que sustenta a salva inicial.',
        source: ['izhikevich2003']
    },
    CH: {
        nome: 'Chattering (CH)', celula: 'Piramidal que dispara em salvas repetidas',
        a: 0.02, b: 0.2, c: -50, d: 2,
        desc: 'Salvas curtas e repetidas em alta frequência. Reset ainda mais alto (c = −50) e pouca adaptação (d = 2).',
        source: ['izhikevich2003']
    },
    FS: {
        nome: 'Disparo rápido (FS)', celula: 'Interneurônio inibitório parvalbumina-positivo (PV+)',
        a: 0.1, b: 0.2, c: -65, d: 2,
        desc: 'Frequência alta e sustentada, praticamente sem adaptação — a recuperação rápida (a = 0,1) é o que permite manter a taxa.',
        clinica: 'É o fenótipo dos interneurônios PV+ em cesto. Sohal (2009) mostrou por optogenética que inibi-los suprime as oscilações gama in vivo e que ativá-los basta para gerar ritmicidade gama; a hipótese de que alterações em PV+ estão por trás da sincronização gama anormal na esquizofrenia é discutida ali. Kann (2015) acrescenta que esse mesmo fenótipo tem custo energético alto e vulnerabilidade ao estresse metabólico e oxidativo.',
        source: ['izhikevich2003', 'sohal2009', 'kann2015']
    },
    LTS: {
        nome: 'Limiar baixo (LTS)', celula: 'Interneurônio inibitório de limiar baixo',
        a: 0.02, b: 0.25, c: -65, d: 2,
        desc: 'Dispara com corrente pequena e apresenta rebote pós-inibitório. O b maior (0,25) é o que confere essa sensibilidade subliminar.',
        source: ['izhikevich2003']
    },
    TC: {
        nome: 'Tálamo-cortical (TC)', celula: 'Neurônio de relé do tálamo',
        a: 0.02, b: 0.25, c: -65, d: 0.05,
        desc: 'Dispara em modo tônico quando despolarizado e em salva de rebote quando liberado de hiperpolarização — a dualidade que separa vigília de sono.',
        source: ['izhikevich2003']
    },
    RZ: {
        nome: 'Ressonador (RZ)', celula: 'Neurônio com oscilação subliminar amortecida',
        a: 0.1, b: 0.26, c: -65, d: 2,
        desc: 'Responde preferencialmente a entradas numa frequência própria, e pode ser excitado por um par de pulsos conforme o intervalo entre eles.',
        source: ['izhikevich2003']
    }
};

// ====================================================================================================
// vindo de features.js
// ====================================================================================================

/*
 * v12.65 — o repouso que o HH realmente atinge com os E's do painel, calculado e nao prometido.
 * O cartao dizia "o repouso do osciloscopio segue este Vm (GHK)". Nao segue exatamente: E_L = V_GHK + 10,6 mV e' a
 * calibracao do modelo classico (repouso ~10,6 mV abaixo de E_L com gNa 120 / gK 36), e o HH assenta ~1,6 mV acima
 * do GHK porque as condutancias de repouso de Na+ e K+ nao sao as permeabilidades do GHK. A auditoria de 30/09
 * mediu a diferenca e o autor decidiu: o texto segue o modelo. Aqui um solver descartavel roda 150 ms sem estimulo
 * com os mesmos parametros e devolve onde parou; memoizado pela tupla de parametros para nao custar a cada render.
 */
let _repousoHHCache = { chave: '', valor: -70 };
function repousoHH(eNa, eK, eL, gNa = hhSolver.gNaMax || 120, gK = hhSolver.gKMax || 36, Cm = hhSolver.Cm || 1) {
    const chave = [eNa, eK, eL, gNa, gK, Cm].map(x => Number(x).toFixed(3)).join('|');
    if (_repousoHHCache.chave === chave) return _repousoHHCache.valor;
    const s = new HodgkinHuxleySolver();
    Object.assign(s, { ENa: eNa, EK: eK, EL: eL, gNa, gK, Cm });
    for (let t = 0; t < 150; t += 0.04) s.step(0.04);
    _repousoHHCache = { chave, valor: s.V };
    return s.V;
}

function renderEquationsCard(state) {
    const f = (x, d = 1) => Number(x).toFixed(d);
    const eK = calculateNernst(1, state.k_out, state.k_in), eNa = calculateNernst(1, state.na_out, state.na_in), eCa = calculateNernst(2, state.ca_out, state.ca_in), eCl = calculateNernst(-1, state.cl_out, state.cl_in);
    const pK = state.blockKv_TEA ? 0.05 : 1.0, pNa = state.blockNav_TTX ? 0.0001 : 0.04, pCl = state.blockGABA_PTX ? 0.05 : 0.45;
    const num = pK * state.k_out + pNa * state.na_out + pCl * state.cl_in, den = pK * state.k_in + pNa * state.na_in + pCl * state.cl_out;
    const vGHK = calculateGHK(state);
    const eq = (html) => `<div style="font-family: 'Cambria Math', 'STIX Two Math', Georgia, serif; font-size: 0.8rem; color: var(--text-main); background: var(--lift-04); border-radius: 6px; padding: 5px 8px; margin: 3px 0; overflow-x: auto; white-space: nowrap;">${html}</div>`;
    return `<div class="card" style="border-color: rgba(52,211,153,0.5);">
            <div class="card-title"><span style="color: var(--ink-emerald);">📐 Equações resolvidas ao vivo (37 °C: RT/F·ln10 = 61,5 mV)</span><button class="pill-btn" style="font-size: 0.62rem;" onclick="toggleModelPanel(true)">⚙️ HH</button></div>
            <div class="card-desc" style="font-size: 0.66rem; color: var(--text-muted);">Nernst: E<sub>ion</sub> = (61,5 / z) · log<sub>10</sub>([ion]<sub>o</sub> / [ion]<sub>i</sub>)</div>
            ${eq(`E<sub>K</sub> = 61,5 · log(${f(state.k_out)} / ${f(state.k_in, 0)}) = <b style="color:var(--ink-blue);">${f(eK)} mV</b>`)}
            ${eq(`E<sub>Na</sub> = 61,5 · log(${f(state.na_out, 0)} / ${f(state.na_in, 0)}) = <b style="color:var(--ink-red);">+${f(eNa)} mV</b>`)}
            ${eq(`E<sub>Ca</sub> = (61,5/2) · log(${f(state.ca_out)} / ${state.ca_in}) = <b style="color:var(--ink-amber);">+${f(eCa)} mV</b>`)}
            ${eq(`E<sub>Cl</sub> = −61,5 · log(${f(state.cl_out, 0)} / ${f(state.cl_in, 0)}) = <b style="color:var(--ink-violet);">${f(eCl)} mV</b>`)}
            <div class="card-desc" style="font-size: 0.66rem; color: var(--text-muted); margin-top: 4px;">Goldman-Hodgkin-Katz (P<sub>K</sub> : P<sub>Na</sub> : P<sub>Cl</sub> = ${pK} : ${pNa} : ${pCl}${state.blockNav_TTX ? ' — TTX' : ''}${state.blockKv_TEA ? ' — TEA' : ''}${state.blockGABA_PTX ? ' — PTX' : ''})</div>
            ${eq(`V<sub>m</sub> = 61,5 · log[(${pK}·${f(state.k_out)} + ${pNa}·${f(state.na_out, 0)} + ${pCl}·${f(state.cl_in, 0)}) / (${pK}·${f(state.k_in, 0)} + ${pNa}·${f(state.na_in, 0)} + ${pCl}·${f(state.cl_out, 0)})] = 61,5 · log(${f(num)} / ${f(den)}) = <b style="color:var(--ink-emerald);">${f(vGHK)} mV</b>`)}
            ${eq(`E<sub>L</sub> = V<sub>m</sub> + 10,6 = <b>${f(vGHK + 10.6)} mV</b> &nbsp;→&nbsp; repouso do modelo HH = <b style="color:var(--ink-emerald);">${f(repousoHH(eNa, eK, vGHK + 10.6))} mV</b>`)}
            <div class="card-desc" style="font-size: 0.64rem; color: var(--text-faint); margin-top: 4px;">E<sub>L</sub> é a calibração do HH clássico (repouso ≈ 10,6 mV abaixo de E<sub>L</sub>); o osciloscópio repousa no valor da última linha, 1–2 mV acima do GHK porque as condutâncias de repouso de Na⁺/K⁺ não são as permeabilidades do GHK. O pico do PA aproxima-se de E<sub>Na</sub>. Arraste os íons acima e veja os números mudarem.</div>
        </div>`;
}

// ==========================================
// 2.3b PAINEL ⚙️ MODELO (v10.3) — equação de Hodgkin-Huxley ao vivo
// ==========================================
function toggleModelPanel(force) {
    const p = document.getElementById('modelPanel'); if (!p) return;
    const open = force !== undefined ? force : !p.classList.contains('open');
    p.classList.toggle('open', open);
    if (open) { const st = store.getState(); if (!['3d', 'cleft2d', 'neuron2d'].includes(st.visualScale)) store.dispatch({ type: 'SET_VISUAL_SCALE', scale: 'neuron2d' }); updateModelPanel(true); preencherTiposIzhikevich(); renderIzhikevich(); }
}

function setHHParam(key, value) {
    const v = parseFloat(value); if (isNaN(v)) return;
    hhSolver[key] = v;
    if (key === 'gNaMax') { const st = store.getState(); if (!st.blockNav_TTX) hhSolver.gNa = v; }
    if (key === 'gKMax') { const st = store.getState(); if (!st.blockKv_TEA) hhSolver.gK = v; }
    const lbl = { gNaMax: 'hh-gna-val', gKMax: 'hh-gk-val', Cm: 'hh-cm-val' }[key];
    const el = document.getElementById(lbl); if (el) el.textContent = key === 'Cm' ? v.toFixed(1) : v.toFixed(0);
}

/*
 * v12.9 — controles do modelo de Izhikevich no painel ⚙️.
 * Ele NÃO substitui o Hodgkin-Huxley: o traço do osciloscópio segue sendo HH. O que este painel
 * mostra é o PADRÃO de disparo simulado em 1 s de corrente constante — a pergunta que HH não
 * responde bem e que distingue um piramidal de um interneurônio parvalbumina-positivo.
 */
let izhCorrente = 10;

function preencherTiposIzhikevich() {
    const sel = document.getElementById('izh-tipo');
    if (!sel || sel.options.length || typeof IZHIKEVICH_TYPES === 'undefined') return;
    sel.innerHTML = Object.keys(IZHIKEVICH_TYPES).map(k =>
        `<option value="${k}">${escapeHtml(IZHIKEVICH_TYPES[k].nome)}</option>`).join('');
    sel.value = (izhSolver && izhSolver.tipo) ? izhSolver.tipo : 'RS';
}

function setIzhikevichType(chave) {
    if (!izhSolver || !izhSolver.setType(chave)) return;
    renderIzhikevich();
}

function setIzhikevichCurrent(valor) {
    const v = parseFloat(valor);
    if (isNaN(v)) return;
    izhCorrente = v;
    const el = document.getElementById('izh-corrente-val'); if (el) el.textContent = String(v);
    renderIzhikevich();
}

/*
 * v12.12 — mini-gráfico do trem de espigões, DENTRO do painel ⚙️.
 * Decisão do PO: desenhar o padrão sem tocar no osciloscópio principal, que continua sendo do
 * Hodgkin-Huxley. Assim a diferença entre um piramidal e um interneurônio PV+ deixa de ser um
 * número ("93 Hz, sem adaptação") e passa a ser uma coisa que se vê.
 * SVG puro, sem biblioteca: 500 ms do traço, com os espigões marcados no topo.
 */
function desenharTremIzhikevich(r, ms = 500, dt = 0.5) {
    const n = Math.min(r.traco.length, Math.round(ms / dt));
    if (!n) return '';
    const L = 300, A = 54, base = A - 6;
    // v vai de c (~-65) a 30; normaliza para a altura do gráfico
    const vMin = -80, vMax = 32;
    const y = v => base - ((Math.max(vMin, Math.min(vMax, v)) - vMin) / (vMax - vMin)) * (base - 4);
    let d = '';
    for (let i = 0; i < n; i++) {
        const px = (i / (n - 1)) * L;
        d += (i === 0 ? 'M' : 'L') + px.toFixed(1) + ' ' + y(r.traco[i]).toFixed(1);
    }
    // marcas dos espigões: onde o traço foi cortado em 30
    let marcas = '';
    for (let i = 0; i < n; i++) {
        if (r.traco[i] >= 30) marcas += `<line x1="${((i / (n - 1)) * L).toFixed(1)}" y1="0" x2="${((i / (n - 1)) * L).toFixed(1)}" y2="5" stroke="#a78bfa" stroke-width="1.4"/>`;
    }
    return `<svg viewBox="0 0 ${L} ${A}" width="100%" height="${A}" style="display:block;margin-bottom:5px;background:var(--overlay-70);border:1px solid rgba(148,163,184,0.25);border-radius:6px;" role="img" aria-label="Trem de espigões simulado">
        <line x1="0" y1="${y(-65).toFixed(1)}" x2="${L}" y2="${y(-65).toFixed(1)}" stroke="rgba(148,163,184,0.28)" stroke-width="0.6" stroke-dasharray="3 3"/>
        <path d="${d}" fill="none" stroke="#38bdf8" stroke-width="1.1"/>
        ${marcas}
        <text x="3" y="${A - 1}" fill="#64748b" font-size="6">${ms} ms</text>
    </svg>`;
}

function renderIzhikevich() {
    const alvo = document.getElementById('izh-resultado');
    if (!alvo || !izhSolver || typeof IZHIKEVICH_TYPES === 'undefined') return;
    const t = IZHIKEVICH_TYPES[izhSolver.tipo];
    const r = izhSolver.run(izhCorrente, 1000, 0.5);
    const adapt = r.adaptacao === null ? '—'
        : (r.adaptacao > 1.3 ? `sim (${r.adaptacao.toFixed(1)}×)` : (r.adaptacao < 1.2 ? 'não' : `leve (${r.adaptacao.toFixed(1)}×)`));
    alvo.innerHTML = desenharTremIzhikevich(r) + `<b style="color:var(--text-strong);">${escapeHtml(t.celula)}</b><br>`
        + `<span style="color:var(--ink-violet);">${r.taxaHz.toFixed(0)} Hz</span> em 1 s · adaptação: ${adapt} `
        + `· a=${t.a} b=${t.b} c=${t.c} d=${t.d}<br>`
        + `<span style="color:var(--text-muted);">${escapeHtml(t.desc)}</span>`
        + (t.clinica ? `<div style="margin-top:4px;padding:5px 7px;border-radius:6px;background:rgba(167,139,250,0.12);border:1px solid rgba(167,139,250,0.35);">${escapeHtml(t.clinica)}</div>` : '')
        + `<div style="font-size:0.58rem;color:var(--text-faint);margin-top:4px;">Fontes: ${t.source.join(' · ')}. Equações de Izhikevich (2003); parâmetros do artigo, não ajustados.</div>`;
}

function resetHHParams() {
    setHHParam('gNaMax', 120); setHHParam('gKMax', 36); setHHParam('Cm', 1.0);
    document.querySelectorAll('#modelPanel input[type=range]').forEach((r, i) => { r.value = [120, 36, 1][i]; });
    playBioTone(600, 'sine', 0.1, 0.1);
}

let modelPanelTick = 0;

function updateModelPanel(force) {
    const p = document.getElementById('modelPanel'); if (!p || !p.classList.contains('open')) return;
    if (!force && (++modelPanelTick % 2)) return; // 10 Hz
    const iNa = Math.abs(hhSolver.INa || 0), iK = Math.abs(hhSolver.IK || 0), iL = Math.abs(hhSolver.IL || 0);
    const maxI = Math.max(iNa, iK, iL, 1e-6);
    const dom = iNa >= iK && iNa >= iL ? 'na' : (iK >= iL ? 'k' : 'l');
    ['na', 'k', 'l'].forEach(t => { const el = document.getElementById('hh-term-' + t); if (el) el.classList.toggle('dom', t === dom && maxI > 2); });
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const bar = (id, v) => { const el = document.getElementById(id); if (el) el.style.width = Math.min(100, 100 * v / Math.max(maxI, 30)) + '%'; };
    bar('hh-bar-na', iNa); bar('hh-bar-k', iK); bar('hh-bar-l', iL);
    set('hh-val-na', (hhSolver.INa || 0).toFixed(1) + ' µA'); set('hh-val-k', (hhSolver.IK || 0).toFixed(1) + ' µA'); set('hh-val-l', (hhSolver.IL || 0).toFixed(1) + ' µA');
    set('hh-m', hhSolver.m.toFixed(2)); set('hh-h', hhSolver.h.toFixed(2)); set('hh-n', hhSolver.n.toFixed(2));
    set('hh-ena', (hhSolver.ENa >= 0 ? '+' : '') + hhSolver.ENa.toFixed(0)); set('hh-ek', hhSolver.EK.toFixed(0)); set('hh-el', hhSolver.EL.toFixed(0));
}

// ====================================================================================================
// vindo de engine.js
// ====================================================================================================

// ==========================================
// ELECTROPHYSIOLOGY MATH & GHK/NERNST SOLVER
// ==========================================
function calculateNernst(z, outConc, inConc) {
    if (inConc <= 0 || outConc <= 0) return 0;
    return (61.54 / z) * Math.log10(outConc / inConc);
}

function calculateGHK(s) {
    // Permeabilities: PK = 1.0, PNa = 0.04 (or 0 if TTX), PCl = 0.45 (or 0 if PTX)
    const pK = s.blockKv_TEA ? 0.05 : 1.0;
    const pNa = s.blockNav_TTX ? 0.0001 : 0.04;
    const pCl = s.blockGABA_PTX ? 0.05 : 0.45;

    const num = (pK * s.k_out) + (pNa * s.na_out) + (pCl * s.cl_in);
    const den = (pK * s.k_in) + (pNa * s.na_in) + (pCl * s.cl_out);

    if (den <= 0 || num <= 0) return -70.0;
    return 61.54 * Math.log10(num / den);
}

function recalculateElectrophysiology() {
    const s = store.getState();
    const eK = calculateNernst(1, s.k_out, s.k_in);
    const eNa = calculateNernst(1, s.na_out, s.na_in);
    const eCa = calculateNernst(2, s.ca_out, s.ca_in);
    const eCl = calculateNernst(-1, s.cl_out, s.cl_in);
    const vGHK = calculateGHK(s);

    // Update Hodgkin-Huxley parameters dynamically
    hhSolver.EK = eK;
    hhSolver.ENa = eNa;
    hhSolver.gNa = s.blockNav_TTX ? 0.0 : (hhSolver.gNaMax || 120.0);
    hhSolver.gK = s.blockKv_TEA ? 1.0 : (hhSolver.gKMax || 36.0);

    // O potencial de repouso do modelo acompanha o GHK: desloca-se E_L (repouso ≈ E_L − 10,6 mV nos parâmetros clássicos)
    hhSolver.EL = vGHK + 10.6;
    if (hhSolver.stimTimer === 0 && !s.apActive) {
        hhSolver.V += (vGHK - hhSolver.V) * 0.15;
    }
}

class HodgkinHuxleySolver {
    constructor() {
        this.Cm = 1.0;
        this.gNa = 120.0;
        this.gK = 36.0;
        this.gL = 0.3;
        this.ENa = 50.0;
        this.EK = -77.0;
        this.EL = -54.4;

        this.V = -70.0;
        this.m = 0.05;
        this.h = 0.6;
        this.n = 0.32;
        this.I_ext = 0.0;
        this.stimTimer = 0;
        this.gNaMax = 120.0; // valores editáveis pelo painel ⚙️ Modelo
        this.gKMax = 36.0;
        this.INa = 0; this.IK = 0; this.IL = 0; // últimas correntes (µA/cm²) para o painel
        // v12.63 — passo interno máximo do Euler. Com dt = 0,04 ms (o laço do osciloscópio) o Euler explícito
        // diverge para ±∞ dentro da faixa dos sliders do painel ⚙️ (ḡNa ≥ 160 ou Cm = 0,5): a fase de subida
        // do PA fica mais rápida que o passo consegue seguir. Com 0,01 ms os mesmos casos são estáveis
        // (medido em qa/probe_hh_extremos.mjs). `step(dt)` divide dt em sub-passos de no máximo dtMax.
        this.dtMax = 0.01;
        this.reinicios = 0; // quantas vezes o guarda de sanidade devolveu o solver ao repouso
    }

    /** Volta ao repouso sem mexer nas condutâncias nem nos potenciais de reversão (que são do usuário). */
    reiniciarEstado() {
        this.V = -70.0; this.m = 0.05; this.h = 0.6; this.n = 0.32;
        this.I_ext = 0.0; this.stimTimer = 0;
        this.INa = 0; this.IK = 0; this.IL = 0;
    }

    alphaM(V) { const x = (V + 40); return Math.abs(x) < 1e-4 ? 1.0 : (0.1 * x) / (1.0 - Math.exp(-x / 10.0)); }
    betaM(V) { return 4.0 * Math.exp(-(V + 65.0) / 18.0); }
    alphaH(V) { return 0.07 * Math.exp(-(V + 65.0) / 20.0); }
    betaH(V) { return 1.0 / (1.0 + Math.exp(-(V + 35.0) / 10.0)); }
    alphaN(V) { const x = (V + 55); return Math.abs(x) < 1e-4 ? 0.1 : (0.01 * x) / (1.0 - Math.exp(-x / 10.0)); }
    betaN(V) { return 0.125 * Math.exp(-(V + 65.0) / 80.0); }

    injectCurrent(amount, durationSteps = 10) {
        this.I_ext = amount;
        this.stimTimer = durationSteps;
    }

    step(dt = 0.02) {
        // O temporizador do estímulo conta CHAMADAS de step (é assim que `injectCurrent(35, 60)` é usado
        // no store), por isso fica fora do laço de sub-passos: dividir dt não encurta o estímulo.
        if (this.stimTimer > 0) {
            this.stimTimer--;
            if (this.stimTimer === 0) this.I_ext = 0.0;
        }
        const n = Math.max(1, Math.ceil(dt / this.dtMax));
        const h = dt / n;
        for (let i = 0; i < n; i++) this._euler(h);
        // Guarda de sanidade: se ainda assim algo deixou de ser finito (parâmetro absurdo vindo de uma cena
        // importada, por exemplo), o solver volta ao repouso em vez de mostrar "NaN mV" até recarregar.
        if (!Number.isFinite(this.V) || !Number.isFinite(this.m) || !Number.isFinite(this.h) || !Number.isFinite(this.n) || Math.abs(this.V) > 1000) {
            this.reiniciarEstado();
            this.reinicios++;
        }
        return this.V;
    }

    _euler(dt) {
        const V = this.V;
        const m = this.m;
        const h = this.h;
        const n = this.n;

        const INa = this.gNa * Math.pow(m, 3) * h * (V - this.ENa);
        const IK = this.gK * Math.pow(n, 4) * (V - this.EK);
        const IL = this.gL * (V - this.EL);

        this.INa = INa; this.IK = IK; this.IL = IL;
        const dV = (this.I_ext - INa - IK - IL) / this.Cm;
        const dm = this.alphaM(V) * (1 - m) - this.betaM(V) * m;
        const dh = this.alphaH(V) * (1 - h) - this.betaH(V) * h;
        const dn = this.alphaN(V) * (1 - n) - this.betaN(V) * n;

        this.V += dV * dt;
        this.m += dm * dt;
        this.h += dh * dt;
        this.n += dn * dt;

        return this.V;
    }
}

const hhSolver = new HodgkinHuxleySolver();

/*
 * v12.9 — MODELO DE IZHIKEVICH (2003).
 *
 * Por que um segundo modelo, se já existe Hodgkin-Huxley:
 * HH responde "como UM potencial de ação acontece" — quais correntes, em que ordem, com que
 * canais. Izhikevich responde outra pergunta, que HH não responde bem: "com que PADRÃO este
 * neurônio dispara". Regular, em rajada, rápido e sem adaptação, com disparo de rebote. É a
 * diferença entre a biofísica de um evento e o comportamento de uma célula ao longo do tempo —
 * e é o padrão de disparo, não o formato do espigão, que distingue um interneurônio
 * parvalbumina-positivo de um piramidal.
 *
 * As equações (Izhikevich 2003, IEEE Trans Neural Netw 14(6):1569-72):
 *     v' = 0,04·v² + 5·v + 140 − u + I
 *     u' = a·(b·v − u)
 *     se v ≥ 30 mV:  v ← c,  u ← u + d
 *
 * v está em mV e t em ms. O limiar de 30 mV NÃO é o limiar de disparo — é o pico, onde o
 * espigão é cortado e o reset acontece. O limiar real emerge da dinâmica, e é justamente isso
 * que torna o modelo capaz de rebote e de ressonância.
 *
 * Integração: o esquema de meio-passo duplo do próprio Izhikevich (dois avanços de dt/2 em v,
 * um de dt em u), que estabiliza o termo quadrático sem custo de um integrador de ordem alta.
 */
class IzhikevichSolver {
    constructor(tipo = 'RS') {
        this.setType(tipo);
    }
    setType(chave) {
        const t = (typeof IZHIKEVICH_TYPES !== 'undefined' && IZHIKEVICH_TYPES[chave]) ? IZHIKEVICH_TYPES[chave] : null;
        if (!t) return false;
        this.tipo = chave;
        this.a = t.a; this.b = t.b; this.c = t.c; this.d = t.d;
        this.reset();
        return true;
    }
    reset() {
        this.v = this.c;
        this.u = this.b * this.c;
        this.I_ext = 0;
        this.t = 0;
        this.spikes = 0;
        this.ultimoSpikeMs = null;
        this.isi = [];          // intervalos entre espigões (ms)
    }
    /** Um passo de dt ms. Devolve { v, u, disparou } — v é 30 no passo do espigão (pico cortado). */
    step(dt = 1.0) {
        const meio = dt / 2;
        for (let i = 0; i < 2; i++) {
            this.v += meio * (0.04 * this.v * this.v + 5 * this.v + 140 - this.u + this.I_ext);
        }
        this.u += dt * this.a * (this.b * this.v - this.u);
        this.t += dt;
        if (this.v >= 30) {
            this.v = this.c;
            this.u += this.d;
            this.spikes++;
            if (this.ultimoSpikeMs !== null) this.isi.push(this.t - this.ultimoSpikeMs);
            this.ultimoSpikeMs = this.t;
            return { v: 30, u: this.u, disparou: true };
        }
        return { v: this.v, u: this.u, disparou: false };
    }
    /** Roda `ms` milissegundos com corrente constante. Devolve o resumo do padrão de disparo. */
    run(I, ms = 1000, dt = 0.5) {
        this.reset();
        this.I_ext = I;
        const traco = [];
        const passos = Math.round(ms / dt);
        for (let i = 0; i < passos; i++) traco.push(this.step(dt).v);
        const isiMedio = this.isi.length ? this.isi.reduce((x, y) => x + y, 0) / this.isi.length : null;
        return {
            tipo: this.tipo,
            spikes: this.spikes,
            taxaHz: this.spikes / (ms / 1000),
            isi: this.isi.slice(),
            isiMedio,
            // adaptação: ISI final sobre ISI inicial. > 1 significa que o disparo desacelera.
            adaptacao: this.isi.length >= 2 ? this.isi[this.isi.length - 1] / this.isi[0] : null,
            traco
        };
    }
}

const izhSolver = (typeof IZHIKEVICH_TYPES !== 'undefined') ? new IzhikevichSolver('RS') : null;

// ====================================================================================================
// vindo de render2d.js
// ====================================================================================================

function drawNeuron2D() {
    const canvas = document.getElementById('neuronCanvas');
    const state = store.getState();
    if (!canvas || state.visualScale !== 'neuron2d') return;
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

    // 1. Background
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 50, w * 0.5, h * 0.5, w * 0.8);
    bgGrad.addColorStop(0, isDark ? "#0f172a" : "#f8fafc");
    bgGrad.addColorStop(1, isDark ? "#020617" : "#e2e8f0");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const cy = h * 0.50;

    // 2. Soma & Dendrites (Left)
    const somaX = w * 0.16;
    const somaR = 48;

    ctx.save();
    ctx.fillStyle = isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(2, 132, 199, 0.10)";
    ctx.strokeStyle = isAP ? "#ef4444" : "#38bdf8";
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(somaX, cy, somaR, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Nucleus
    ctx.fillStyle = isDark ? "rgba(168, 85, 247, 0.35)" : "rgba(147, 51, 234, 0.25)";
    ctx.beginPath(); ctx.arc(somaX, cy, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("NÚCLEO", somaX, cy + 3);

    // Dendrites Arborization
    for (let d = -2; d <= 2; d++) {
        const dy = cy + d * 26;
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.moveTo(somaX - somaR + 8, cy + d * 14);
        ctx.lineTo(somaX - somaR - 45, dy); ctx.stroke();
    }
    ctx.restore();

    // 3. Axon Hillock (Trigger Zone / Cono Axonal Nav1.6)
    const hillockX = somaX + somaR;
    ctx.save();
    ctx.fillStyle = isAP ? "#ef4444" : "#facc15";
    ctx.fillRect(hillockX, cy - 8, 24, 16);
    ctx.fillStyle = "#000000"; ctx.font = "bold 6.5px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Nav1.6", hillockX + 12, cy + 3);
    ctx.restore();

    // 4. Myelinated Axon with Nodes of Ranvier (Saltatory Conduction)
    const axonStartX = hillockX + 24;
    const boutonX = w * 0.86;
    const axonLen = boutonX - axonStartX;
    const numNodes = 4;
    const segmentLen = axonLen / numNodes;

    // Axon Core
    ctx.strokeStyle = isAP ? "#ef4444" : "#38bdf8";
    ctx.lineWidth = 4.0;
    ctx.beginPath(); ctx.moveTo(axonStartX, cy); ctx.lineTo(boutonX, cy); ctx.stroke();

    // Myelin Sheaths (Schwann Cells / Oligodendrocytes) & Nodes
    for (let s = 0; s < numNodes; s++) {
        const sx = axonStartX + s * segmentLen;
        const mLen = segmentLen - 16;

        // Myelin Sheath Block
        ctx.fillStyle = isDark ? "rgba(250, 204, 21, 0.25)" : "rgba(234, 179, 8, 0.20)";
        ctx.strokeStyle = "#facc15"; ctx.lineWidth = 1.5;
        ctx.fillRect(sx + 2, cy - 14, mLen, 28);
        ctx.strokeRect(sx + 2, cy - 14, mLen, 28);

        ctx.fillStyle = "#facc15"; ctx.font = "bold 6.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("MIELINA", sx + mLen / 2 + 2, cy + 3);

        // Node of Ranvier (Nav1.6 / Kv7 Channels)
        const nodeX = sx + mLen + 8;
        ctx.fillStyle = isAP ? "#ef4444" : "#38bdf8";
        ctx.beginPath(); ctx.arc(nodeX, cy, 5.5, 0, Math.PI * 2); ctx.fill();

        if (isAP) {
            ctx.fillStyle = "#ef4444"; ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(nodeX, cy, 9, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        }
    }

    // 5. Terminal Bouton (Right)
    ctx.save();
    ctx.fillStyle = isDark ? "rgba(168, 85, 247, 0.25)" : "rgba(168, 85, 247, 0.15)";
    ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(boutonX + 22, cy, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#a855f7"; ctx.font = "bold 8px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("BOTÃO", boutonX + 22, cy - 2);
    ctx.fillText("TERMINAL", boutonX + 22, cy + 9);
    ctx.restore();

    // 6. Header Banner
    ctx.fillStyle = isDark ? "#38bdf8" : "#0284c7";
    ctx.font = "bold 10px sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`⚡ NEURÔNIO INTEGRO (ESCALA MACRO) — Condução Saltatória nos Nódulos de Ranvier`, 16, 22);

    ctx.fillStyle = isAP ? "#ef4444" : "#22c55e"; ctx.font = "bold 8.5px sans-serif";
    ctx.fillText(isAP ? "⚡ DISPARO ATIVO (+30 mV) ➔ Propagação Saltatória Rápida (100 m/s)" : "⚪ REPOUSO (-70 mV) ➔ Clique no botão 'Disparar Potencial de Ação' para simular", 16, 36);
}

// ====================================================================================================
// vindo de main.js
// ====================================================================================================

/* NeuroSim Pro 3D — main.js. Gerado pela divisão da v12.0; a ordem de carga é definida em Simulador_Neuronio_Interativo.html.
   Scripts clássicos compartilham o escopo global: const/let/function de um arquivo são visíveis nos seguintes. */
// ==========================================
// 13. HODGKIN-HUXLEY OSCILLOSCOPE ENGINE
// ==========================================
let voltageTrace = Array(45).fill(-70.0);
let reiniciosVistos = 0;

function updateOscilloscope() {
    for (let s = 0; s < 5; s++) {
        hhSolver.step(0.04);
    }

    const currentV = hhSolver.V;
    updateModelPanel(false);
    const vText = document.getElementById('osc-voltage-val');
    if (vText) {
        // v12.63: se o guarda de sanidade devolveu o solver ao repouso neste tick, diz isso em vez de fingir
        // que o número é uma medida.
        if (hhSolver.reinicios !== reiniciosVistos) { reiniciosVistos = hhSolver.reinicios; vText.innerText = 'reiniciado'; }
        else vText.innerText = `${currentV.toFixed(1)} mV`;
    }

    const liveInd = document.getElementById('status-live-indicator');
    const state = store.getState();
    const sys = systemsData[state.system];
    if (liveInd) {
        liveInd.innerHTML = `● Sistema: <b>${sys.name}</b> • Potencial: <b>${currentV.toFixed(1)} mV</b> • Escala: <b>${state.visualScale}</b>`;
    }

    voltageTrace.push(currentV);
    if (voltageTrace.length > 45) voltageTrace.shift();

    const canvas = document.getElementById('voltageCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 10; y < canvas.height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw wave
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const stepX = canvas.width / (voltageTrace.length - 1);
    voltageTrace.forEach((val, idx) => {
        const norm = (val - (-90)) / (40 - (-90));
        const y = canvas.height - (norm * canvas.height);
        if (idx === 0) ctx.moveTo(0, y);
        else ctx.lineTo(idx * stepX, y);
    });
    ctx.stroke();
}


// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { IZHIKEVICH_TYPES, calculateNernst, drawNeuron2D, hhSolver, izhSolver, recalculateElectrophysiology,
    renderEquationsCard, resetHHParams, setHHParam, setIzhikevichCurrent, setIzhikevichType, toggleModelPanel,
    updateOscilloscope };
// ── fim do exporta ──
