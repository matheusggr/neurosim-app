// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import './engine.js?v=12.76.2';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { TARGETS_CANON, TARGETS_CANON_VERSION } from './targets.js?v=12.76.2';
import { DOMINIOS, MODO, SOURCES, dominioDoModo, ehCamadaDeSistema, systemsData } from './data.js?v=12.76.2';
import { renderPsicoeducacaoPanel } from './dominios/psicoeducacao.js?v=12.76.2';
import { IZHIKEVICH_TYPES, calculateNernst, izhSolver, renderEquationsCard } from './dominios/neuronio.js?v=12.76.2';
import {
    analyzePolypharmacy, antidepressantsData, antipsychoticsData, directionConflicts, drugPKref,
    drugTargetsForaDaOntologia, drugsData, drugsForTarget, farmacoAcoplado, hasKiData, kiCompetitiveOccupancy,
    moodAndAnxioData, occupancyExceptionsIn, pharmacogenomicRiskIn, renderPharmaClasses, systemDrugsMap,
    targetsOfDrug
} from './dominios/psicofarmacos.js?v=12.76.2';
import {
    SYNAPTIC_MACHINERY, cleft3DGroup, dossiersForTarget, machineryForDossier, molecularAdvancesData, renderStepCard
} from './dominios/neurotransmissao.js?v=12.76.2';
import {
    CIRCUIT_LAYER_UI, CIRCUIT_PRESETS, DIMENSOES_DE_SINTOMA, atualizarTooltipFixado, brain3DGroup, brainCircuitsData,
    camadaFiltrada, canonicalSubTractsData, circuitTargets, circuitTargetsForaDaOntologia, circuitsForTarget,
    familiasDeCamadas, limiteDaCamada, neurostimProtocolsData, nucleiCatalog, nucleiClinicalData,
    pathologyProfilesData
} from './dominios/circuitos.js?v=12.76.2';
import { store } from './store.js?v=12.76.2';
import {
    cameraByScale, cameraTween, definirCameraTween, definirLastVisualScale3D, escapeHtml, lastVisualScale3D,
    updateRealismBadge
} from './features.js?v=12.76.2';
import { camera3D, controls3D } from './render3d.js?v=12.76.2';
// ── fim dos módulos ──
/* NeuroSim Pro 3D — ui.js. Gerado pela divisão da v12.0; a ordem de carga é definida em Simulador_Neuronio_Interativo.html.
   Scripts clássicos compartilham o escopo global: const/let/function de um arquivo são visíveis nos seguintes. */
// ==========================================
// 6. UI RENDERER & STORE SUBSCRIBER
// ==========================================
/*
 * v12.54 (decisao D4 do autor, opcao c): o MARCADOR DE COR. Onde a cor E o dado — sistema, camada, lente — o app
 * mostrava um emoji de circulo escrito a mao dentro do rotulo. Media-se: a Dopamina era 🔵 na barra e 🟣 no
 * conectoma, com o dado dizendo #a855f7; 🔵 marcava dois sistemas e 🔴 outros dois; o Colinergico era azul num
 * lugar e laranja no outro. Agora o marcador e um circulo pintado com a MESMA cor que o canvas usa: ele nao pode
 * discordar do desenho porque nasce do mesmo dado. Emoji que NAO carrega cor (🧬 🧠 ⚡ 💊) fica como esta.
 */
function marcador(cor, forma) {
    const c = String(cor || '').trim();
    // So cor de DADO: #hex ou token do CSS. Qualquer outra coisa vira o marcador neutro — o rotulo vem de tabela,
    // mas a porta fica fechada: nada que nao seja cor entra no style, e markup nunca.
    const segura = /^(#[0-9a-fA-F]{3,8}|var\(--[\w-]+\))$/.test(c) ? c : 'var(--text-muted)';
    // v12.58: a FORMA e o segundo eixo — redondo e' sistema de neurotransmissor, quadrado e' circuito. Vem de um
    // conjunto de dois valores, nunca do dado bruto: forma desconhecida cai no redondo.
    const classe = forma === 'circuito' ? 'marcador marcador--circuito' : 'marcador';
    return `<span class="${classe}" style="--cor: ${segura};"></span>`;
}

/*
 * v12.59 (D12) — A LENTE DESCE UM DEGRAU. O perfil e' uma composicao de dimensoes desde a v12.57; aqui a composicao
 * vira controle: dentro da doenca, focar UMA dimensao. O foco nao apaga vias — muda quais aparecem DESVIADAS, e o
 * resto da doenca fica no traco normal. E' a comparacao que a aula precisa ("o antipsicotico resolve isto, nao
 * aquilo") no MESMO cerebro. A descricao e as fontes da dimensao aparecem junto: conteudo clinico nao anda sem fonte.
 */
function fichasDeDimensao(perfil, emFoco) {
    const chaves = (perfil && Array.isArray(perfil.dimensoes)) ? perfil.dimensoes : [];
    if (!chaves.length) return '';
    const ficha = (chave, rotulo, ativa) => `<button class="pill-btn ${ativa ? 'active' : ''}" style="font-size: 0.68rem; padding: 2px 8px;" onclick="store.dispatch({type: 'SET_SYMPTOM_DIMENSION', dimensao: ${chave ? "'" + chave + "'" : 'null'}})">${rotulo}</button>`;
    const dim = emFoco && DIMENSOES_DE_SINTOMA[emFoco];
    const fontes = dim ? (dim.source || []).filter(k => SOURCES[k]) : [];
    return `
        <div style="margin-bottom: 6px;">
            <div style="font-size: 0.66rem; color: var(--text-muted); font-weight: 800; margin-bottom: 3px;" title="A doença é a soma das dimensões; foque uma para ver só o desvio dela">DIMENSÃO EM FOCO:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 3px;">
                ${ficha(null, 'A doença inteira', !emFoco)}
                ${chaves.filter(k => DIMENSOES_DE_SINTOMA[k]).map(k => ficha(k, DIMENSOES_DE_SINTOMA[k].rotulo, emFoco === k)).join('')}
            </div>
            ${dim ? `<div style="font-size: 0.72rem; line-height: 1.45; color: var(--text-soft); margin-top: 5px; border-left: 2px solid var(--ink-red-500); padding-left: 7px;">
                ${dim.descricao}
                <div style="margin-top: 4px; color: var(--text-muted); font-size: 0.66rem;">${Object.keys(dim.vias).length} vias desviadas · ${fontes.length} ${fontes.length === 1 ? 'fonte' : 'fontes'}: ${fontes.join(', ')}</div>
            </div>` : ''}
        </div>`;
}

function renderUI() {
    const state = store.getState();

    // v12.19: o modo ativo vira atributo do <body>, e o CSS decide o que aparece.
    // O <body> nao e reconstruido por ninguem, entao esta visibilidade sobrevive a todo
    // ciclo de innerHTML — que e a razao de ser CSS e nao JS mexendo em style.display.
    document.body.dataset.modo = String(state.activeMode);
    // v12.37 (Bloco 2): o body publica o que o DOMINIO atual possui (DOMINIOS, data.js) e o CSS decide o que aparece:
    // as escalas da doca (data-escalas, lido com ~=), o osciloscopio e o painel do modelo (data-biofisica), os passos (data-passos).
    const dominioAtual = dominioDoModo(state.activeMode) || 'neuronio';
    const defDominio = DOMINIOS[dominioAtual];
    document.body.dataset.dominio = dominioAtual;
    document.body.dataset.escalas = defDominio.escalas.join(' ');
    document.body.dataset.biofisica = defDominio.biofisica ? '1' : '0';
    document.body.dataset.passos = defDominio.passos ? '1' : '0';
    // v12.39 (Bloco 4): a LENTE de Circuitos — fisiologia (perfil none), fisiopatologia (um perfil) ou comparar (os dois
    // lado a lado). Mesmo dominio, mesmo palco (v12.20); o que muda e nomeado, e o CSS pode reagir.
    // v12.53: o nivel da projecao vai para o body como ATRIBUTO (o padrao da casa: estado no reducer, aparencia no
    // CSS). Os tres valores de --escala-ui moram no CSS, num lugar so' — ver o bloco MODO AULA no HTML.
    document.body.dataset.escalaProjecao = String(Math.round((state.escalaProjecao ?? 1.25) * 100));
    const avisoEscala = document.getElementById('hintEscala');
    if (avisoEscala) avisoEscala.textContent = Math.round((state.escalaProjecao ?? 1.25) * 100) + '%';
    document.body.dataset.lente = (state.dualSubMode === 'physio_vs_patho') ? 'comparar'
        : ((state.activePathologyProfile && state.activePathologyProfile !== 'none') ? 'fisiopatologia' : 'fisiologia');
    // v12.37: a Psicoeducacao e um painel aberto por estado (psicoeducacaoAberta), reconstruido enquanto aberto
    const painelPsico = document.getElementById('psicoeducacaoPanel');
    if (painelPsico) {
        painelPsico.classList.toggle('open', !!state.psicoeducacaoAberta);
        if (state.psicoeducacaoAberta) painelPsico.innerHTML = renderPsicoeducacaoPanel(state);
    }
    // v12.43 (D10): o nucleo selecionado tem o tooltip fixado no conectoma 2D (render3d.js carrega depois; typeof protege as travas)
    if (typeof atualizarTooltipFixado === 'function') atualizarTooltipFixado(state);

    // 1. Update Master Nav Tabs
    for (let i = 1; i <= 4; i++) {
        const b = document.getElementById(`nav-mode-${i}`);
        if (b) b.classList.toggle('active', i === state.activeMode);
    }

    // 2. Update Scale Buttons
    const b3d = document.getElementById('btn-scale-3d');
    const bcleft = document.getElementById('btn-scale-cleft');
    const bneuron = document.getElementById('btn-scale-neuron');
    const bbrain = document.getElementById('btn-scale-brain');
    const bbrain3d = document.getElementById('btn-scale-brain3d');

    if (b3d) b3d.style.background = state.visualScale === '3d' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'var(--control-60)';
    if (bcleft) bcleft.style.background = state.visualScale === 'cleft2d' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'var(--control-60)';
    if (bneuron) bneuron.style.background = state.visualScale === 'neuron2d' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'var(--control-60)';
    if (bbrain) bbrain.style.background = state.visualScale === 'brain2d' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'var(--control-60)';
    if (bbrain3d) bbrain3d.style.background = state.visualScale === 'brain3d' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'var(--control-60)';
    // v12.32: o texto acompanha o fundo. Branco sobre o gradiente quando ativo; o token do tema quando
    // inativo. No tema claro o fundo inativo e claro, e o branco herdado do markup ficava ilegivel (1,29:1).
    for (const [btn, escala] of [[b3d, '3d'], [bcleft, 'cleft2d'], [bneuron, 'neuron2d'], [bbrain, 'brain2d'], [bbrain3d, 'brain3d']]) {
        if (btn) btn.style.color = state.visualScale === escala ? '#f8fafc' : '';   // #f8fafc = o que o ativo já herdava no escuro
    }

    // 3. Update Canvas visibility
    const t3d = document.getElementById('threejs-container');
    const s2d = document.getElementById('synapseCanvas');
    const n2d = document.getElementById('neuronCanvas');
    const b2d = document.getElementById('brainCanvas');

    const is3DActive = (state.visualScale === '3d' || state.visualScale === 'brain3d');
    if (t3d) t3d.style.display = is3DActive ? 'block' : 'none';
    if (s2d) s2d.style.display = state.visualScale === 'cleft2d' ? 'block' : 'none';
    if (n2d) n2d.style.display = state.visualScale === 'neuron2d' ? 'block' : 'none';
    // v12.20 — comparacao sadio x patologia lado a lado.
    const comparando = (state.dualSubMode === 'physio_vs_patho' && state.visualScale === 'brain2d');
    if (b2d) b2d.style.display = (state.visualScale === 'brain2d' && !comparando) ? 'block' : 'none';
    const legenda = document.getElementById('legendaConectoma');   // v12.34: acompanha o canvas do conectoma
    if (legenda) legenda.style.display = (state.visualScale === 'brain2d' && !comparando) ? 'block' : 'none';
    document.body.dataset.comparando = comparando ? '1' : '0';   // o CSS esconde os rotulos da cena unica
    const dual = document.getElementById('dualViewContainer');
    if (dual) dual.style.display = comparando ? 'flex' : 'none';
    const rotDir = document.getElementById('dualRightLabel');
    if (rotDir && comparando) {
        const p = pathologyProfilesData[state.activePathologyProfile];
        // honestidade: comparar 'none' com 'none' seria mostrar duas vezes a mesma coisa
        rotDir.textContent = (!p || state.activePathologyProfile === 'none')
            ? '⚠️ Escolha uma patologia na barra acima'
            : '🔴 ' + (p.short || p.name);
    }
    const btnCmp = document.getElementById('btn-comparar');
    if (btnCmp) btnCmp.style.background = comparando ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--control-60)';
    if (btnCmp) btnCmp.style.color = comparando ? '#fff' : '';   // v12.32: idem aos botões de escala
    
    if (cleft3DGroup && brain3DGroup) {
        cleft3DGroup.visible = (state.visualScale === '3d');
        brain3DGroup.visible = (state.visualScale === 'brain3d');
    }
    // Câmera por escala (v11.2): ao alternar fenda 3D ↔ cérebro 3D, guarda a câmera da escala anterior e restaura a da nova
    if (camera3D && controls3D && is3DActive && lastVisualScale3D !== state.visualScale) {
        if (lastVisualScale3D && !cameraTween) cameraByScale[lastVisualScale3D] = { pos: camera3D.position.clone(), target: controls3D.target.clone() };
        const saved = cameraByScale[state.visualScale];
        if (saved && !cameraTween) { definirCameraTween({ from: { pos: camera3D.position.clone(), target: controls3D.target.clone() }, to: { pos: saved.pos.clone(), target: saved.target.clone() }, start: performance.now(), duration: 900 }); }
        definirLastVisualScale3D(state.visualScale);
    }

    // 4. Update Step Buttons
    for (let i = 1; i <= 6; i++) {
        const b = document.getElementById(`step-btn-${i}`);
        if (b) b.classList.toggle('active', i === state.neuroStep);
    }

    // 5. Update Badge
    const badge = document.getElementById('viewport-badge');
    const sys = systemsData[state.system] || systemsData.da;   // v12.64: como neuronio.js ja fazia — renderUI e' o 1.o assinante; se lancar, todo dispatch seguinte lanca
    if (badge) {
        if (state.visualScale === '3d') badge.innerHTML = `🎮 3D WebGL • Fenda Sináptica (${sys.name})`;
        else if (state.visualScale === 'cleft2d') badge.innerHTML = `🔬 Fenda Sináptica 2D • Íons & Exocitose (${sys.name})`;
        else if (state.visualScale === 'neuron2d') badge.innerHTML = `⚡ Neurônio Inteiro • Soma, Axônio & Nódulos de Ranvier`;
        else if (state.visualScale === 'brain2d') badge.innerHTML = `🧠 Conectoma Cerebral 2D • Mapa Sagital & Loops`;
        else if (state.visualScale === 'brain3d') badge.innerHTML = `🌐 Atlas Cerebral 3D • Tratografia DTI & Conectoma 360°`;
    }

    updateRealismBadge(state);
    renderContextBar();
    renderInspector();
}

        
// v12.40 (Bloco 5): systemDrugsMap (a prateleira por sistema) e DADO e foi para data.js.

function renderContextBar() {
    const bar = document.getElementById('dynamic-context-bar');
    if (!bar) return;
    const state = store.getState();

    if (state.activeMode === MODO.neurotransmissao) {   // v12.37: o seletor de sistema e a prateleira do sistema sao da Neurotransmissao
        const sysDrugs = systemDrugsMap[state.system] || [{ id: 'none', label: '⚪ Nenhum Fármaco' }];
        // v12.40 (Bloco 5, decisao 11 do PO): a prateleira filtra a PRESCRICAO pelo sistema — uma lista so. Pilula marcada =
        // prescrito; clicar prescreve/desprescreve (TOGGLE_POLY_DRUG, a mesma acao do modo Psicofarmacos). O farmaco
        // acoplado na fenda e DERIVADO: farmacoAcoplado(state) = o ultimo prescrito que e deste sistema (⚓).
        const prescritos = state.selectedDrugsList || [];
        const acoplado = farmacoAcoplado(state);
        const nenhumDoSistema = !sysDrugs.some(d => d.id !== 'none' && prescritos.includes(d.id));
        const cheia = prescritos.length >= 4;

        bar.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                <div class="pills-group" style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                    <span style="font-size: 0.70rem; font-weight: 800; color: var(--accent); margin-right: 4px;">SISTEMA:</span>
                    <button class="pill-btn ${state.system === 'da' ? 'active' : ''}" onclick="escolherSistema('da')">${marcador(systemsData['da'].color)}Dopamina</button>
                    <button class="pill-btn ${state.system === '5ht' ? 'active' : ''}" onclick="escolherSistema('5ht')">${marcador(systemsData['5ht'].color)}Serotonina</button>
                    <button class="pill-btn ${state.system === 'ne' ? 'active' : ''}" onclick="escolherSistema('ne')">${marcador(systemsData['ne'].color)}Noradrenalina</button>
                    <button class="pill-btn ${state.system === 'glu' ? 'active' : ''}" onclick="escolherSistema('glu')">${marcador(systemsData['glu'].color)}Glutamato</button>
                    <button class="pill-btn ${state.system === 'gaba' ? 'active' : ''}" onclick="escolherSistema('gaba')">${marcador(systemsData['gaba'].color)}GABA</button>
                    <button class="pill-btn ${state.system === 'ach' ? 'active' : ''}" onclick="escolherSistema('ach')">${marcador(systemsData['ach'].color)}Acetilcolina</button>
                    <button class="pill-btn ${state.system === 'ecb' ? 'active' : ''}" onclick="escolherSistema('ecb')">🌿 Canabinoides</button>
                    <button class="pill-btn ${state.system === 'opioid' ? 'active' : ''}" onclick="escolherSistema('opioid')">${marcador(systemsData['opioid'].color)}Opioides</button>
                    <button class="pill-btn ${state.system === 'adenosine' ? 'active' : ''}" onclick="escolherSistema('adenosine')">☕ Adenosina</button>
                </div>

                <div class="pills-group" style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 8px; padding: 4px 8px;">
                    <span style="font-size: 0.68rem; font-weight: 800; color: var(--ink-purple); margin-right: 4px;">💊 FÁRMACOS DESTE SISTEMA:</span>
                    ${sysDrugs.map(d => {
                        const marcado = d.id === 'none' ? nenhumDoSistema : prescritos.includes(d.id);
                        const acopladoAqui = d.id !== 'none' && acoplado === d.id;
                        const bloqueado = d.id !== 'none' && !marcado && cheia;
                        const titulo = d.id === 'none' ? 'Tirar da prescrição os fármacos deste sistema' : (bloqueado ? 'Prescrição cheia (4 fármacos) — tire um antes' : (marcado ? 'Prescrito — clique para tirar' + (acopladoAqui ? ' (é o que está na fenda)' : '') : 'Prescrever'));
                        // v12.42 (D9): a pilula prescrita e a classe .prescrito (CSS por tema) — branco sobre roxo-500 media 3,96:1 no escuro
                        const estilo = marcado ? '' : 'border-color: rgba(168,85,247,0.4); color: var(--ink-purple-soft);';
                        // os dois onclick ficam LITERAIS no template (nao numa variavel) para a trava 9 (snapshot de handlers) enxergar os alvos
                        if (d.id === 'none') return `<button class="pill-btn ${marcado ? 'active prescrito' : ''}" title="${titulo}" style="${estilo}" onclick="desprescreverSistema('${state.system}')">${d.label}</button>`;
                        return `<button class="pill-btn ${marcado ? 'active prescrito' : ''}" ${bloqueado ? 'disabled' : ''} title="${titulo}" style="${estilo}" onclick="store.dispatch({type: 'TOGGLE_POLY_DRUG', drugKey: '${d.id}'})">${d.label}${acopladoAqui ? ' ⚓' : ''}</button>`;
                    }).join('')}
                    <span style="font-size: 0.62rem; color: var(--text-muted); margin-left: 4px;" title="A mesma prescrição do modo Psicofármacos">${prescritos.length}/4 prescritos</span>
                </div>
            </div>
        `;
    } else if (state.activeMode === MODO.psicofarmacos) {
        bar.innerHTML = `
            <div class="pills-group" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="font-size: 0.70rem; font-weight: 800; color: var(--accent); margin-right: 4px;">PSICOFARMACOTECA:</span>
                <button class="pill-btn ${state.pharmaTab !== 'classes' ? 'active' : ''}" style="${state.pharmaTab !== 'classes' ? 'background: rgba(56,189,248,0.2); border-color: var(--accent); color: var(--accent);' : ''}" onclick="store.dispatch({type: 'SET_PHARMA_TAB', tab: 'poly'})">💊 Motor de Polifarmácia & Interações CYP450</button>
                <button class="pill-btn ${state.pharmaTab === 'classes' ? 'active' : ''}" style="${state.pharmaTab === 'classes' ? 'background: rgba(244,114,182,0.2); border-color: var(--ink-pink); color: var(--ink-pink-soft);' : 'border-color: var(--ink-pink); color: var(--ink-pink-soft);'}" onclick="store.dispatch({type: 'SET_PHARMA_TAB', tab: 'classes'})">📚 Farmacoteca por Classe (${Object.values(antidepressantsData).reduce((n, c) => n + c.drugs.length, 0) + Object.values(antipsychoticsData).reduce((n, c) => n + c.drugs.length, 0) + moodAndAnxioData.stabilizers.length + moodAndAnxioData.anxiolytics.length})</button>
                <button class="pill-btn" style="border-color: var(--ink-emerald-500); color: var(--ink-emerald);" onclick="openCrossTaperingModal()">🔄 Calculadora de Desmame & Cross-Tapering</button>
            </div>
        `;
    } else if (state.activeMode === MODO.circuitos) {
        const curProf = state.activePathologyProfile || 'none';

        // v12.33 (Fase 3.2): UMA fileira. Os 25 toggles de camada sairam daqui — despachavam a mesma acao
        // (TOGGLE_CIRCUIT_LAYER) que os acordeoes do inspetor, onde cada via tem nome e descricao e agora
        // estao agrupados por familia com contador n/N. Ficam os perfis (ESTADO, pilulas) e um par de
        // COMANDOS em texto sem borda, a direita: "Marcar todas" e "Limpar", com "Desfazer" quando ha o que
        // desfazer. "Expandir Sub-Vias" age sobre o inspetor e mora la. MEDIDO em 01/09/2026: 36 pilulas em
        // duas fileiras, e a moldura que muda de altura com o modo e a causa nº 1 do roadmap.
        bar.innerHTML = `
            <div class="pills-group" style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap; width: 100%;">
                <!-- v12.39 (Bloco 4): a fileira e a LENTE do dominio Circuitos — a primeira pilula e a Fisiologia (perfil
                     "none"), as demais sao fisiopatologia; o Comparar fica na doca, que sobrevive ao Modo Aula. -->
                <span style="font-size: 0.70rem; font-weight: 800; color: var(--accent); margin-right: 4px;" title="Fisiologia, fisiopatologia ou os dois lado a lado (⚖️ Comparar, na doca)">LENTE:</span>
                <!-- v12.14: os botoes de patologia sao GERADOS a partir de pathologyProfilesData. Antes eram
                     seis, escritos a mao, e tres despachavam ids inexistentes — gerando da fonte, id nao pode
                     divergir e perfil escrito nao fica orfao. -->
                ${Object.keys(pathologyProfilesData).map(k => {
                    const p = pathologyProfilesData[k];
                    const rotulo = p.short || p.name.split('(')[0].trim();
                    return `<button class="pill-btn ${curProf === k ? 'active' : ''}" onclick="store.dispatch({type: 'SET_PATHOLOGY_PROFILE', profile: '${k}'})">${rotulo}</button>`;
                }).join('')}
                <span style="margin-left: auto; display: inline-flex; align-items: center; gap: 2px;">
                    ${state.desfazerLimpeza ? `<button class="cmd-btn" title="Desfazer o Limpar (Ctrl+Z)" onclick="store.dispatch({type: 'UNDO_CLEAR_CIRCUITS'})">↶ Desfazer</button>` : ''}
                    <button class="cmd-btn" title="Acender todas as camadas do conectoma" onclick="store.dispatch({type: 'SELECT_ALL_CIRCUITS'})">✨ Marcar todas</button>
                    <button class="cmd-btn" title="Apagar todas as marcações — Ctrl+Z desfaz" onclick="store.dispatch({type: 'CLEAR_ALL_CIRCUITS'})">🗑️ Limpar</button>
                </span>
            </div>
        `;
    } else if (state.activeMode === MODO.neuronio) {
        // v12.37 (Bloco 2): a barra do Neuronio — os sete tipos de disparo (Izhikevich) que ja existiam no painel do
        // modelo, agora a um clique. A anatomia (piramidal, interneuronio...) e conteudo futuro do autor (Parte 4, §4.7).
        // A barra da Psicoeducacao que morava aqui virou o painel renderPsicoeducacaoPanel (ferramenta do cabecalho).
        const tipos = (typeof IZHIKEVICH_TYPES !== 'undefined') ? IZHIKEVICH_TYPES : {};
        const tipoAtual = (typeof izhSolver !== 'undefined' && izhSolver) ? izhSolver.tipo : 'RS';
        bar.innerHTML = `
            <div class="pills-group" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="font-size: 0.70rem; font-weight: 800; color: var(--accent); margin-right: 4px;">TIPO DE DISPARO:</span>
                ${Object.keys(tipos).map(k => `<button class="pill-btn ${tipoAtual === k ? 'active' : ''}" title="${escapeHtml(tipos[k].nome)}" onclick="setIzhikevichType('${k}'); renderUI();">${escapeHtml(tipos[k].nome)}</button>`).join('')}
                <button class="cmd-btn" onclick="toggleModelPanel(true)" title="Equação de Hodgkin-Huxley e trem de disparos ao vivo (tecla Q)">⚙️ Modelo</button>
            </div>
        `;
    }
}

/*
 * v12.18 — envelope que preserva rolagem e foco.
 *
 * innerHTML nao atualiza a pagina: ele DESTROI e recria todos os nos ali dentro. Morre junto
 * tudo que o navegador guardava SOBRE o no e nao no estado — o foco, a selecao de texto, a
 * posicao de rolagem, o :hover. O sintoma concreto: marcar uma sub-via no meio da lista jogava
 * a lista de volta ao topo, toda vez. Boa parte da sensacao de "confuso de usar" vem daqui.
 *
 * O envelope existe em vez de um try/finally dentro da funcao porque renderInspectorConteudo
 * tem varios return antecipados, um por ramo — envolver e mais simples e nao mexe em nenhum.
 */
function renderInspector() {
    const container = document.getElementById('inspector-content');
    // MEDIDO: quem rola NAO e o #inspector-content — e o .inspector-panel, que tem
    // overflow-y: auto. Salvar o scrollTop do filho salvava sempre 0 e nao preservava nada.
    // Guardo os dois: o painel e o proprio conteudo, para o caso de a estrutura mudar.
    const painel = container ? container.closest('.inspector-panel') : null;
    const topoPainel = painel ? painel.scrollTop : 0;
    const topo = container ? container.scrollTop : 0;
    const ativo = document.activeElement;
    const idAtivo = (ativo && container && container.contains(ativo) && ativo.id) ? ativo.id : null;
    const temSelecao = idAtivo && typeof ativo.selectionStart === 'number';
    const selIni = temSelecao ? ativo.selectionStart : null;
    const selFim = temSelecao ? ativo.selectionEnd : null;

    renderInspectorConteudo();

    if (painel) painel.scrollTop = topoPainel;
    if (container) container.scrollTop = topo;
    if (idAtivo) {
        const novo = document.getElementById(idAtivo);
        if (novo) {
            novo.focus({ preventScroll: true });
            // restaura o cursor ONDE ELE ESTAVA. O jeito antigo mandava o cursor para o fim a
            // cada tecla, entao corrigir uma letra no meio de "fluoxetina" era impossivel.
            if (selIni !== null && typeof novo.setSelectionRange === 'function') {
                try { novo.setSelectionRange(selIni, selFim); } catch (e) { /* input sem selecao */ }
            }
        }
    }
}

function renderInspectorConteudo() {
    const container = document.getElementById('inspector-content');
    const titleEl = document.getElementById('inspector-main-title');
    if (!container) return;
    const state = store.getState();

    // =========================================================
    // 1. BRAIN 2D CONNECTOME, CIRCUITS & SUB-TRACTS (ALWAYS ACCESSIBLE)
    // =========================================================
    // v12.37 (Bloco 2): o inspetor e do MODO, nunca da escala — antes, `brain2d || brain3d || modo 3` sequestrava os
    // outros modos quando a escala era de cerebro (laudo, Parte 4). Agora as escalas de cerebro so existem em Circuitos.
    if (state.activeMode === MODO.circuitos) {
        const layers = state.activeCircuitLayers || [];
        const selNucId = state.selectedNucleusId;
        const stimProt = state.neurostimProtocol || 'off';
        const stimData = neurostimProtocolsData[stimProt] || neurostimProtocolsData.off;
        const pathoProf = state.activePathologyProfile || 'none';
        const pathoData = pathologyProfilesData[pathoProf] || pathologyProfilesData.none;

        if (titleEl) {
            if (pathoProf !== 'none') titleEl.innerText = `🔬 Fisiopatologia & Vias: ${pathoData.name.split('(')[0].trim()}`;
            else if (selNucId) titleEl.innerText = `🧠 Dossiê do Núcleo & Vias Anatômicas`;
            else titleEl.innerText = `🗺️ Mapa Anatômico de Vias & Circuitos Cerebrais`;
        }

        // 1A. Pathology Profile Card (if active)
        let pathologyHeaderHtml = '';
        if (pathoProf !== 'none') {
            pathologyHeaderHtml = `
                <div class="card" style="border-color: var(--ink-red-500); background: rgba(239,68,68,0.08); margin-bottom: 8px;">
                    <div class="card-title">
                        <span style="color: var(--ink-red-500);">${pathoData.name}</span>
                        <button class="action-btn" style="padding: 2px 8px; font-size: 0.68rem;" onclick="store.dispatch({type: 'SET_PATHOLOGY_PROFILE', profile: 'none'})">🟢 Normalizar</button>
                    </div>
                    <div class="badge" style="background: rgba(239,68,68,0.2); color: var(--ink-red); margin-bottom: 6px; font-size: 0.70rem;">Perfil de Doença Ativo</div>
                    ${fichasDeDimensao(pathoData, state.dimensaoDeSintoma)}
                    <div class="card-desc" style="font-size: 0.76rem; line-height: 1.45;">
                        <b>⚡ Estado dos Circuitos:</b> ${pathoData.circuitStatus}
                    </div>
                    <div style="font-size: 0.74rem; color: var(--text-soft); margin-top: 6px; border-top: 1px solid rgba(239,68,68,0.2); padding-top: 6px;">
                        <b>💊 Farmacoterapia Racional:</b> ${pathoData.terapeutica}
                    </div>
                </div>
            `;
        }

        // 1B. Selected Nucleus Card (if clicked)
        let nucleusHeaderHtml = '';
        // v12.35 (Bloco 0): `nuclei` não existe neste arquivo (é const local de render2d/render3d) — para os
        // sete núcleos sem dossiê o `||` lançava ReferenceError e o inspetor parava de renderizar. O lado
        // direito agora é o catálogo, com o mesmo aviso do tooltip: o nome existe, o dossiê é do autor.
        const fichaDoNucleo = selNucId && nucleiCatalog[selNucId]
            ? { color: nucleiCatalog[selNucId].color, name: nucleiCatalog[selNucId].fullName || nucleiCatalog[selNucId].label, funcao: 'Dossiê clínico ainda não escrito para este núcleo.' }
            : null;
        if (selNucId && (nucleiClinicalData[selNucId] || fichaDoNucleo)) {
            const nuc = nucleiClinicalData[selNucId] || fichaDoNucleo;
            nucleusHeaderHtml = `
                <div class="card" style="border-color: ${nuc.color}; background: var(--tint-30); margin-bottom: 8px;">
                    <div class="card-title">
                        <span class="ink" style="--cor: ${nuc.color};">📍 ${nuc.name}</span>
                        <button class="action-btn" style="padding: 2px 6px; font-size: 0.65rem;" onclick="store.dispatch({type: 'SELECT_NUCLEUS', nucleusId: null})">✕ Fechar</button>
                    </div>
                    <div class="card-desc" style="font-size: 0.74rem; line-height: 1.45;">
                        ${nuc.funcao || 'Centro neuroanatômico de integração e retransmissão de sinais.'}
                    </div>
                </div>
            `;
        }

        // 1C. SUB-TRACTS AND GRANULAR VIA MARKING LIST (ALWAYS VISIBLE!)
        const acordeaoDaCamada = (sysKey) => {
            const sys = canonicalSubTractsData[sysKey];
            const isSysActive = layers.includes(sysKey);
            const isExpanded = (state.expandedSystemAccordions || []).includes(sysKey);
            const subList = state.activeSubTracts || [];

            const totalSubs = sys.items.length;
            // v12.56: o contador olha SO a propria camada — com o filtro global ele dizia 0/5 num sistema aceso
            // sempre que o professor tivesse filtrado sub-vias de outro sistema.
            const filtradaAqui = camadaFiltrada(subList, sysKey);
            let activeSubsCount = !isSysActive ? 0 : (filtradaAqui ? sys.items.filter(it => subList.includes(it.id)).length : totalSubs);

            return `
                <div style="border: 1px solid ${isSysActive ? sys.color : 'rgba(255,255,255,0.08)'}; border-radius: 6px; background: var(--tint-25); overflow: hidden; margin-bottom: 6px;">
                    <!-- Accordion Header -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; background: ${isSysActive ? 'rgba(255,255,255,0.05)' : 'transparent'};">
                        <div style="display: flex; align-items: center; gap: 6px; cursor: pointer; flex: 1;" onclick="store.dispatch({type: 'TOGGLE_CIRCUIT_LAYER', layer: '${sysKey}'})">
                            <span class="ink" style="font-size: 0.76rem; font-weight: bold; --cor: ${isSysActive ? sys.color : 'var(--text-muted)'};">${marcador(isSysActive ? sys.color : 'var(--text-muted)', ehCamadaDeSistema(sysKey) ? 'sistema' : 'circuito')}${sys.name}</span>
                            <span class="badge" style="background: ${isSysActive ? sys.color : '#64748b'}; color: #000; font-size: 0.62rem; padding: 1px 5px; font-weight: 800;">${activeSubsCount}/${totalSubs}</span>
                        </div>
                        <button class="action-btn" style="padding: 2px 7px; font-size: 0.66rem; border-color: transparent; background: var(--lift-06);" onclick="store.dispatch({type: 'TOGGLE_SYSTEM_ACCORDION', systemKey: '${sysKey}'})">
                            ${isExpanded ? '▲ Recolher' : '▼ Sub-Vias'}
                        </button>
                    </div>

                    <!-- Accordion Body (Sub-Tracts List with Individual Checkboxes) -->
                    ${isExpanded ? `
                        <div style="padding: 6px 8px; background: var(--tint-35); border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 4px;">
                            ${limiteDaCamada(sysKey) ? `<div style="font-size: 0.63rem; line-height: 1.35; color: var(--ink-amber); background: rgba(251,191,36,0.10); border: 1px solid rgba(251,191,36,0.30); border-radius: 4px; padding: 5px 7px; margin-bottom: 2px;"><b>⚠️ Limite:</b> ${limiteDaCamada(sysKey)}</div>` : ''}
                            ${sys.items.map(it => {
                                let isItemActive = isSysActive && (!filtradaAqui || subList.includes(it.id));
                                return `
                                    <div style="display: flex; align-items: flex-start; gap: 6px; padding: 4px 6px; border-radius: 4px; background: ${isItemActive ? 'rgba(255,255,255,0.06)' : 'transparent'}; cursor: pointer;" onclick="store.dispatch({type: 'TOGGLE_SUB_TRACT', subId: '${it.id}', systemKey: '${sysKey}'})">
                                        <input type="checkbox" ${isItemActive ? 'checked' : ''} style="margin-top: 2px; cursor: pointer; pointer-events: none; accent-color: ${sys.color};">
                                        <div style="font-size: 0.70rem; line-height: 1.35;">
                                            <b class="ink" style="--cor: ${isItemActive ? sys.color : 'var(--text-muted)'};">${it.name}</b><br>
                                            <span style="color: var(--text-muted); font-size: 0.66rem;">${it.desc}</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        };

        // v12.33 (Fase 3.2): as camadas agrupadas por FAMILIA, com contador n/N e um toggle de tres estados
        // (nenhum / parcial / todos). A familia abre se foi aberta ou se um acordeao dela esta aberto; assim
        // "Expandir" e "Recolher" continuam valendo para tudo. Camada sem familia cai em "Outras".
        const familiasAbertas = state.expandedFamilies || [];
        const subTractsHtml = familiasDeCamadas().map(fam => {
            const acesas = fam.camadas.filter(c => layers.includes(c)).length;
            const total = fam.camadas.length;
            const aberta = familiasAbertas.includes(fam.chave) || fam.camadas.some(c => (state.expandedSystemAccordions || []).includes(c));
            const estado = acesas === 0 ? '□' : (acesas === total ? '■' : '◪');
            return `
                <div style="border: 1px solid var(--line-14); border-radius: 8px; margin-bottom: 8px; overflow: hidden;">
                    <div style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: var(--lift-04);">
                        <button class="action-btn" style="padding: 1px 8px; font-size: 0.72rem; min-width: 30px; justify-content: center;" title="${acesas === total ? 'Apagar' : 'Acender'} todas as camadas de ${fam.rotulo}" onclick="store.dispatch({type: 'TOGGLE_CIRCUIT_FAMILY', family: '${fam.chave}'})">${estado}</button>
                        <div style="flex: 1; display: flex; align-items: center; gap: 6px; cursor: pointer;" onclick="store.dispatch({type: 'TOGGLE_FAMILY_ACCORDION', family: '${fam.chave}'})">
                            <span style="font-size: 0.78rem; font-weight: 800; color: var(--text-main);">${fam.rotulo}</span>
                            <span class="badge" style="background: var(--lift-10); color: var(--text-soft); font-size: 0.62rem; padding: 1px 6px; font-weight: 800;">${acesas}/${total}</span>
                            <span style="margin-left: auto; font-size: 0.68rem; color: var(--text-muted);">${aberta ? '▲' : '▼'}</span>
                        </div>
                    </div>
                    ${aberta ? `<div style="padding: 6px 6px 0 6px;">${fam.camadas.map(acordeaoDaCamada).join('')}</div>` : ''}
                </div>
            `;
        }).join('');

        // v12.2.1 — alvos nomeados pelos circuitos acesos, com o caminho de volta para a farmacoteca.
        let alvosCircuitoHtml = '';
        if (typeof circuitTargets !== 'undefined' && typeof TARGETS_CANON !== 'undefined') {
            const idsAlvo = [...new Set(layers.reduce((a, l) => a.concat(circuitTargets[l] || []), []))].sort();
            const foraAlvo = [...new Set(layers.reduce((a, l) => a.concat((typeof circuitTargetsForaDaOntologia !== 'undefined' && circuitTargetsForaDaOntologia[l]) || []), []))];
            if (idsAlvo.length || foraAlvo.length) {
                const chipsAlvo = idsAlvo.map(id => {
                    const t = TARGETS_CANON[id] || {};
                    const n = (typeof drugsForTarget === 'function') ? drugsForTarget(id).length : 0;
                    return `<button class="pill-btn" title="${t.kind || ''} · ${t.coupling || ''} — ${n} fármaco(s) na base" onclick="openTargetFromConnectome('${id.replace(/'/g, "\\'")}')">${id}${n ? ` <span style="opacity:.65;">${n}💊</span>` : ' <span style="opacity:.5;">—</span>'}</button>`;
                }).join('');
                alvosCircuitoHtml = `
            <div class="card" style="border-color: var(--ink-teal);">
                <div class="card-title"><span style="color: var(--ink-teal);">🎯 Alvos nomeados por estes circuitos</span></div>
                <div class="card-desc" style="font-size:0.68rem;margin-bottom:5px;">Extraídos dos textos dos circuitos acesos. Clique para ver <b>quais fármacos da base tocam o alvo</b> (o traço indica nenhum).</div>
                <div style="display:flex;gap:3px;flex-wrap:wrap;">${chipsAlvo}</div>
                ${foraAlvo.length ? `<div class="card-desc" style="font-size:0.64rem;color:var(--text-muted);margin-top:6px;">⚠️ Citados aqui mas fora da ontologia canônica v${typeof TARGETS_CANON_VERSION !== 'undefined' ? TARGETS_CANON_VERSION : '?'}: ${foraAlvo.join(' · ')}.</div>` : ''}
            </div>`;
            }
        }

        container.innerHTML = `
            ${pathologyHeaderHtml}
            ${nucleusHeaderHtml}
            ${alvosCircuitoHtml}

            <div class="card" style="border-color: var(--accent);">
                <div class="card-title">
                    <span style="color: var(--accent);">🗺️ Controle de Vias & Sub-Vias Anatômicas</span>
                    <div style="display: flex; gap: 3px; flex-wrap: wrap;">
                        <button class="action-btn" style="padding: 2px 6px; font-size: 0.64rem; border-color: var(--ink-emerald-500); color: var(--ink-emerald); background: rgba(16,185,129,0.1);" onclick="store.dispatch({type: 'SELECT_ALL_CIRCUITS'})">✨ Todos</button>
                        <button class="action-btn" style="padding: 2px 6px; font-size: 0.64rem; border-color: var(--ink-red-500); color: var(--ink-red); background: rgba(239,68,68,0.1);" onclick="store.dispatch({type: 'CLEAR_ALL_CIRCUITS'})">🗑️ Limpar</button>
                        <button class="action-btn" style="padding: 2px 6px; font-size: 0.64rem;" onclick="store.dispatch({type: 'EXPAND_ALL_ACCORDIONS'})">📂 Expandir</button>
                        <button class="action-btn" style="padding: 2px 6px; font-size: 0.64rem;" onclick="store.dispatch({type: 'COLLAPSE_ALL_ACCORDIONS'})">📁 Recolher</button>
                    </div>
                </div>
                <div class="card-desc" style="font-size: 0.72rem; margin-bottom: 8px; color: var(--text-soft);">
                    Marque ou desmarque individualmente cada via para isolar no Conectoma 2D e no Cérebro 3D:
                </div>
                <!-- v12.14.1: conjuntos clinicos de circuitos. Os nove existiam no reducer desde sempre e
                     os unicos botoes que os alcancavam estavam no bloco inalcancavel apagado nesta versao.
                     Gerados de CIRCUIT_PRESETS para que preset e botao nao possam divergir. -->
                <div style="font-size: 0.68rem; font-weight: bold; color: var(--ink-yellow); margin: 2px 0 4px 0;">⚡ CONJUNTOS CLÍNICOS DE CIRCUITOS</div>
                <div style="display: flex; gap: 3px; flex-wrap: wrap; margin-bottom: 8px;">
                    ${Object.keys(CIRCUIT_PRESETS).map(k => `<button class="action-btn" style="padding: 2px 6px; font-size: 0.64rem;" onclick="store.dispatch({type: 'SET_BRAIN_CIRCUIT', circuit: '${k}'})">${CIRCUIT_PRESETS[k].short}</button>`).join('')}
                </div>
                ${subTractsHtml}
            </div>

            <!-- Neurostimulation Protocols -->
            <div class="card" style="border-color: var(--ink-emerald-500); margin-top: 6px;">
                <div class="card-title">
                    <span style="color: var(--ink-emerald-500);">⚡ Neuromodulação & Estimulação Cerebral</span>
                </div>
                <div style="display: flex; gap: 3px; flex-wrap: wrap; margin-top: 4px;">
                    ${Object.keys(neurostimProtocolsData).map(k => {
                        const st = neurostimProtocolsData[k];
                        const isSel = (stimProt === k);
                        return `
                            <button class="pill-btn ${isSel ? 'active' : ''}" 
                                    style="${isSel ? 'background: #10b981; border-color: var(--ink-emerald-500); color: #000; font-weight: bold;' : 'font-size: 0.66rem;'}" 
                                    onclick="store.dispatch({type: 'SET_NEUROSTIM_PROTOCOL', protocol: '${k}'})">
                                ${st.name.split('(')[0].trim()}
                            </button>
                        `;
                    }).join('')}
                </div>
                ${stimProt !== 'off' ? `
                    <div style="font-size: 0.72rem; color: #a7f3d0; margin-top: 6px; border-top: 1px solid rgba(16,185,129,0.2); padding-top: 4px;">
                        <b>Alvo:</b> ${stimData.target} | <b>Efeito:</b> ${stimData.mechanism}
                    </div>
                ` : ''}
            </div>
        `;
        return;
    }

    // =========================================================
    // 1. BRAIN 2D CONNECTOME & CIRCUITS VIEW (UNIVERSAL DISPATCH)
    // =========================================================
    // v12.14.1 — aqui viviam 288 linhas que NUNCA rodaram.
    // Havia dois blocos com esta mesma condicao dentro de renderInspector, e o primeiro termina
    // em return. O segundo era, portanto, inalcancavel — e dentro dele estavam os unicos botoes
    // que davam acesso a cinco perfis clinicos (melancolica, panico, TEPT, TDAH, TOC) e aos nove
    // conjuntos de circuitos. Tudo isso foi resgatado para o bloco vivo antes da remocao: os
    // perfis na v12.14.0 (barra gerada de pathologyProfilesData) e os presets nesta versao
    // (fileira gerada de CIRCUIT_PRESETS). O git guarda o conteudo original em a6d4641.
    // A trava que impede a volta esta em tests/alcance.test.ts: nenhuma condicao longa de if
    // pode aparecer duas vezes em ui.js.

    // =========================================================
    // 2. PHARMACOTHECA & POLYPHARMACY ENGINE (MODE 2)
    // =========================================================
    if (state.activeMode === MODO.psicofarmacos && state.pharmaTab === 'classes') {
        if (titleEl) titleEl.innerText = "📚 Farmacoteca por Classe";
        container.innerHTML = renderPharmaClasses(state);
        return;
    }
    if (state.activeMode === MODO.psicofarmacos) {
        if (titleEl) titleEl.innerText = "💊 Motor de Polifarmácia & Citocromo P450";
        const pList = state.selectedDrugsList || ['fluoxetina'];

        // Calculate Combined Receptor Occupancy
        // v12.2.2: a matemática saiu daqui para analyzePolypharmacy() em data.js, onde pode ser testada.
        const poly = analyzePolypharmacy(pList, state.pharmaDoseMg);   // v12.66: K_i manda — a dose em mg entra aqui tambem
        const occ = poly.occ;
        // v12.66: cada barra diz de onde veio o numero. 'ki' = K_i x C_livre calibrada por PET; 'estimativa' = coluna didatica 0–100.
        const seloMetodo = (r) => ({ ki: '<small style="opacity:.7;" title="K_i (PDSP) × concentração livre calibrada por PET, na dose em mg">K<sub>i</sub>×PET</small>', estimativa: '<small style="opacity:.7;" title="Coluna didática 0–100 de drugBindingAffinities; sem K_i para este fármaco/receptor">estimativa</small>', misto: '<small style="opacity:.7;" title="Parte dos fármacos com K_i, parte com a coluna didática">K<sub>i</sub>+estimativa</small>', nenhum: '' }[poly.metodo[r]] || '');
        const cypInhibitions = poly.cypInhibitions;
        const qtcLabel = poly.qtcLabel, qtcColor = poly.qtcColor, qtcAdvice = poly.qtcAdvice;
        const qtcHighRiskDrugs = poly.qtcHighRiskDrugs;
        const hunterRiskLabel = poly.hunterRiskLabel, hunterRiskColor = poly.hunterRiskColor, hunterAlert = poly.hunterAlert;

        let sepWarning = "";
        // v12.66: o alerta le' o BLOQUEIO de D2 (so antagonistas), nao a ocupacao total — agonista parcial ocupa sem bloquear.
        const parciaisD2 = (poly.agonistasParciaisD2 || []).map(k => (drugsData[k] || {}).name || k);
        if (poly.d2Bloqueio >= 78) {
            sepWarning = `<div class="card" style="border-color: var(--ink-red-500); background: rgba(239,68,68,0.08); margin-top: 6px;">
                <div class="card-title"><span style="color: var(--ink-red-500);">⚠️ Bloqueio D2 acima de 78% (${poly.d2Bloqueio.toFixed(0)}%${poly.metodo.d2 === 'ki' ? ', K<sub>i</sub>×PET' : ''})</span></div>
                <div class="card-desc">Acima de ~78% de ocupação D2 estriatal por <b>antagonistas</b>, a literatura de PET (Kapur 2000) associa <b>sintomas extrapiramidais, parkinsonismo, acatisia e hiperprolactinemia</b>; a janela antipsicótica fica entre 65 e 78%.${parciaisD2.length ? ` ${parciaisD2.join(', ')} é agonista parcial: ocupa sem bloquear e <b>não entra</b> nesta conta.` : ''}</div>
            </div>`;
        } else if (parciaisD2.length && occ.d2 >= 78) {
            sepWarning = `<div class="card" style="border-color: rgba(168,85,247,0.5); margin-top: 6px;">
                <div class="card-title"><span style="color: var(--ink-purple-500);">ℹ️ Ocupação D2 alta (${occ.d2.toFixed(0)}%) sem bloqueio equivalente</span></div>
                <div class="card-desc">${parciaisD2.join(', ')} ocupa D2 como <b>agonista parcial</b>: ocupar não é bloquear, e a janela 65–78% foi estabelecida com antagonistas plenos. Bloqueio por antagonistas nesta prescrição: ${poly.d2Bloqueio.toFixed(0)}%.</div>
            </div>`;
        }

        const drugBadgesHtml = pList.map(k => {
            const d = drugsData[k] || { name: k };
            const pend = d.revisao_pendente ? ' <span title="Conteúdo redigido com fonte, aguardando revisão clínica do autor">🔬</span>' : '';
            return `<span class="badge" style="background: rgba(56,189,248,0.15); color: var(--accent); padding: 3px 7px; font-size: 0.72rem;">💊 ${d.name}${pend} <b style="cursor: pointer; margin-left: 4px;" onclick="store.dispatch({type: 'TOGGLE_POLY_DRUG', drugKey: '${k}'})">✖</b></span>`;
        }).join(' ');
        // v12.3 — o que ainda não passou pelo aval clínico do autor fica declarado, não misturado.
        const pendentes = pList.filter(k => (drugsData[k] || {}).revisao_pendente).map(k => drugsData[k].name);
        const pendenteHtml = pendentes.length ? `
            <div class="card" style="border-color:#8b5cf6;background:rgba(139,92,246,0.07);">
                <div class="card-title"><span style="color:var(--ink-violet);">🔬 Aguardando revisão clínica</span></div>
                <div class="card-desc" style="font-size:0.72rem;line-height:1.5;"><b>${pendentes.join(', ')}</b>: entrada redigida a partir de fonte verificável, mas <b>ainda não revisada pelo autor</b>. Trate como rascunho fundamentado, não como conteúdo validado. As fontes estão em <a href="#" onclick="openSourcesModal(); return false;" style="color:var(--accent);">Fontes &amp; Limitações</a>.</div>
            </div>` : '';

        // ===== v12.2a: NAVEGAÇÃO POR ALVO (ids canônicos da ontologia da Fase 0) =====
        let alvosPanelHtml = '';
        if (typeof targetsOfDrug === 'function' && typeof TARGETS_CANON !== 'undefined') {
            const porAlvo = new Map();
            pList.forEach(k => targetsOfDrug(k).forEach(t => {
                if (!porAlvo.has(t.id)) porAlvo.set(t.id, []);
                porAlvo.get(t.id).push({ drug: k, hit: t });
            }));
            const ordenados = [...porAlvo.keys()].sort((a, b) => {
                const ma = Math.max(...porAlvo.get(a).map(x => x.hit.ocupacaoRelativa || 0));
                const mb = Math.max(...porAlvo.get(b).map(x => x.hit.ocupacaoRelativa || 0));
                return mb - ma;
            });
            const sel = state.selectedTargetId;
            const chips = ordenados.map(id => {
                const t = TARGETS_CANON[id] || {};
                const ativo = sel === id;
                return `<button class="pill-btn ${ativo ? 'active' : ''}" style="${ativo ? 'background:#22c55e;border-color:var(--ink-green-500);color:#000;' : ''}" title="${(t.kind || '')} · ${(t.coupling || '')}" onclick="store.dispatch({type:'SELECT_TARGET', targetId:'${id.replace(/'/g, "\\'")}'})">${id}</button>`;
            }).join('');
            let detalhe = '';
            if (sel && TARGETS_CANON[sel]) {
                const t = TARGETS_CANON[sel];
                const quem = (typeof drugsForTarget === 'function') ? drugsForTarget(sel) : [];
                const linhas = quem.map(x => {
                    const naPrescricao = pList.includes(x.drug);
                    const val = x.hit.ocupacaoRelativa != null ? `${x.hit.ocupacaoRelativa}` : (x.hit.acao || '—');
                    return `<div style="display:flex;justify-content:space-between;gap:6px;font-size:0.70rem;padding:1px 0;${naPrescricao ? 'color:var(--ink-green-500);font-weight:600;' : 'color:var(--text-soft);'}">
                        <span>${naPrescricao ? '● ' : '○ '}${x.name}</span><span style="opacity:.8;">${val}</span></div>`;
                }).join('');
                detalhe = `<div class="card" style="margin-top:6px;border-color:var(--ink-green-500);background:rgba(34,197,94,0.06);">
                    <div class="card-title"><span style="color:var(--ink-green-500);">🎯 ${t.label}</span>
                      <button class="action-btn" style="padding:2px 7px;font-size:0.65rem;" onclick="store.dispatch({type:'SELECT_TARGET', targetId:null})">✖</button></div>
                    <div class="card-desc" style="font-size:0.70rem;line-height:1.5;">
                      <b>Tipo:</b> ${t.kind} · <b>Família:</b> ${t.family}<br>
                      <b>Acoplamento/mecanismo:</b> ${t.coupling}${t.system ? ` · <b>Sistema:</b> ${t.system}` : ''}${t.gene ? ` · <b>Gene:</b> ${t.gene}` : ''}
                    </div>
                    <div style="margin-top:5px;">${quem.length
                        ? `<b style="font-size:0.70rem;color:var(--text-muted);">Fármacos que tocam este alvo (${quem.length}) — ● na prescrição atual:</b>${linhas}`
                        : `<div style="font-size:0.68rem;color:var(--ink-amber-500);line-height:1.45;">⚠️ <b>Nenhum fármaco da base toca este alvo.</b> Ele é nomeado nos textos de circuito ou nos dossiês moleculares, mas a farmacoteca ainda não tem um agente mapeado para ele — é uma lacuna de conteúdo, não um erro.</div>`}</div>
                    ${(() => {
                        const circs = (typeof circuitsForTarget === 'function') ? circuitsForTarget(sel) : [];
                        if (!circs.length) return '';
                        const nomes = circs.map(c => marcador((CIRCUIT_LAYER_UI[c] || {}).borda, ehCamadaDeSistema(c) ? 'sistema' : 'circuito') + ((typeof brainCircuitsData !== 'undefined' && brainCircuitsData[c]) ? brainCircuitsData[c].name : c)).join(' · ');
                        return `<div style="margin-top:7px;border-top:1px solid rgba(148,163,184,0.25);padding-top:6px;">
                            <b style="font-size:0.70rem;color:var(--text-muted);">Circuitos que nomeiam este alvo (${circs.length}):</b>
                            <div style="font-size:0.68rem;color:var(--text-soft);margin:2px 0 5px;">${nomes}</div>
                            <button class="action-btn" style="font-size:0.68rem;padding:3px 9px;" onclick="showTargetInConnectome('${sel.replace(/'/g, "\\'")}')">🗺️ Ver no conectoma</button>
                        </div>`;
                    })()}
                    ${(() => {
                        // v12.8 — a quarta fonte: os dossiês moleculares. Alguns alvos (VMAT2, EAAT,
                        // AMPA, GABA-A extrasináptico) só existem AQUI — nenhum fármaco os toca e
                        // nenhum circuito os nomeia, mas um dossiê os descreve em detalhe molecular.
                        const doss = (typeof dossiersForTarget === 'function') ? dossiersForTarget(sel) : [];
                        if (!doss.length) return '';
                        const titulos = doss.map(id => {
                            const d = (typeof molecularAdvancesData !== 'undefined') ? molecularAdvancesData.find(x => x.id === id) : null;
                            return d ? escapeHtml(d.shortLabel) : ('Dossiê ' + id);
                        }).join(' · ');
                        // v12.12 — junto do dossiê, a maquinaria que ele descreve e a ontologia não cobre.
                        const maq = doss.flatMap(id => (typeof machineryForDossier === 'function' ? machineryForDossier(id) : [])
                            .map(m => ({ nome: m, cat: SYNAPTIC_MACHINERY[m].categoria })));
                        const porCat = {};
                        maq.forEach(x => { (porCat[x.cat] = porCat[x.cat] || []).push(x.nome); });
                        const blocoMaq = Object.keys(porCat).length ? `<div style="margin-top:6px;padding-top:5px;border-top:1px dashed rgba(148,163,184,0.22);">
                            <b style="font-size:0.66rem;color:var(--text-muted);">Maquinaria sináptica descrita junto (fora da ontologia canônica):</b>
                            ${Object.keys(porCat).sort().map(c => `<div style="font-size:0.64rem;color:var(--text-soft);margin-top:2px;"><span style="color:var(--ink-violet);">${escapeHtml(c)}</span> — ${porCat[c].map(escapeHtml).join(', ')}</div>`).join('')}
                        </div>` : '';
                        return `<div style="margin-top:7px;border-top:1px solid rgba(148,163,184,0.25);padding-top:6px;">
                            <b style="font-size:0.70rem;color:var(--text-muted);">Dossiês moleculares que descrevem este alvo (${doss.length}):</b>
                            <div style="font-size:0.68rem;color:var(--text-soft);margin:2px 0 0;">${titulos}</div>
                            ${blocoMaq}
                        </div>`;
                    })()}
                </div>`;
            }
            const fora = pList.flatMap(k => (typeof drugTargetsForaDaOntologia !== 'undefined' && drugTargetsForaDaOntologia[k]) ? drugTargetsForaDaOntologia[k].map(x => `${(drugsData[k] || {}).name}: ${x}`) : []);
            alvosPanelHtml = `
            <div class="card" style="border-color: var(--ink-teal);">
                <div class="card-title"><span style="color: var(--ink-teal);">🧭 Alvos desta prescrição <small style="opacity:.8;font-weight:600;">(ids canônicos)</small></span></div>
                <div class="card-desc" style="font-size:0.68rem;margin-bottom:5px;">Clique num alvo para ver o que ele é e <b>quais fármacos o tocam</b> — inclusive fora desta prescrição.</div>
                <div style="display:flex;gap:3px;flex-wrap:wrap;">${chips || '<span style="font-size:0.7rem;color:var(--text-muted);">Nenhum alvo canônico nesta seleção.</span>'}</div>
                ${detalhe}
                ${fora.length ? `<div class="card-desc" style="font-size:0.64rem;color:var(--text-muted);margin-top:6px;line-height:1.4;">⚠️ <b>Fora da ontologia canônica v${typeof TARGETS_CANON_VERSION !== 'undefined' ? TARGETS_CANON_VERSION : '?'}</b> (sistemas opioide, endocanabinoide, adenosina e canais ainda não cobertos): ${fora.join(' · ')}.</div>` : ''}
            </div>`;
        }

        // ===== v12.1: OCUPAÇÃO COM DADOS DE LITERATURA (Ki × concentração calibrada por PET) =====
        let kiPanelHtml = '';
        const kiDrugs = pList.filter(k => typeof hasKiData === 'function' && hasKiData(k));
        if (kiDrugs.length > 0) {
            const doseMap = state.pharmaDoseMg || {};
            const doseOf = (k) => (typeof doseMap[k] === 'number' ? doseMap[k] : drugPKref[k].refDoseMg);
            const doseList = kiDrugs.map(k => ({ drug: k, doseMg: doseOf(k) }));
            const recMeta = [
                { key: 'd2', label: 'D2 (Dopamina)', color: '#a855f7', note: (v) => v >= 78 ? '🔴 SEP/HiperPRL (>78%)' : (v >= 65 ? '🟢 Janela antipsicótica (65–78%)' : (v >= 50 ? '🟡 Submáximo' : '')) },
                { key: '5ht2a', label: '5-HT2A', color: '#ec4899', note: (v) => v >= 80 ? '🟢 Saturado (perfil SDA)' : '' },
                { key: 'alpha1', label: 'α1 (Adrenérgico)', color: '#3b82f6', note: (v) => v >= 60 ? '⚠️ Hipotensão ortostática' : '' },
                { key: 'h1', label: 'H1 (Histamina)', color: '#e11d48', note: (v) => v >= 60 ? '⚠️ Sedação / peso' : '' },
                { key: 'm1', label: 'M1 (Muscarínico)', color: '#f97316', note: (v) => v >= 60 ? '⚠️ Anticolinérgico' : '' }
            ];
            const barsHtml = recMeta.map(rm => {
                const res = kiCompetitiveOccupancy(doseList, rm.key);
                const v = res.total;
                const contribTxt = (kiDrugs.length > 1 && res.contrib.length > 1)
                    ? ` <small style="opacity:.65;">(${res.contrib.map(c => `${(drugsData[c.drug] || {}).name || c.drug}: ${c.occ.toFixed(0)}%`).join(' + ')})</small>` : '';
                return `<div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.70rem;"><b>${rm.label}:</b> <span>${v.toFixed(0)}% ${rm.note(v)}</span></div>
                        <div style="background: var(--lift-10); height: 6px; border-radius: 3px; overflow: hidden;"><div style="background: ${rm.color}; width: ${v}%; height: 100%;"></div></div>
                        ${contribTxt ? `<div style="font-size:0.62rem; color:var(--text-muted); margin-top:1px;">${contribTxt}</div>` : ''}
                    </div>`;
            }).join('');
            const slidersHtml = kiDrugs.map(k => {
                const p = drugPKref[k]; const dose = doseOf(k);
                const high = dose > p.usualHigh;
                return `<div style="margin-top:4px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.70rem;"><b>${(drugsData[k] || {}).name || k}</b> <span>${dose} mg${high ? ' <span style="color:var(--ink-red-500);">⚠️ dose alta</span>' : ''}</span></div>
                        <input type="range" min="${p.doseRange[0]}" max="${p.doseRange[1]}" step="${p.doseRange[1] > 100 ? 25 : (p.doseRange[1] > 20 ? 1 : 0.5)}" value="${dose}" style="width:100%;" oninput="store.dispatch({type:'SET_PHARMA_DOSE', drugKey:'${k}', doseMg: parseFloat(this.value)})">
                    </div>`;
            }).join('');
            kiPanelHtml = `
            <div class="card" style="border-color: var(--ink-green-500);">
                <div class="card-title"><span style="color: var(--ink-green-500);">🎯 Ocupação com dados de literatura <small style="opacity:.8; font-weight:600;">(PDSP K<sub>i</sub> × C<sub>livre</sub> calibrada por PET)</small></span></div>
                <div class="card-desc" style="font-size:0.68rem; margin-bottom:6px;">Modelo por isoterma de Hill/competição a partir da afinidade real (K<sub>i</sub>, nM) e da dose. Ajuste a dose em <b>mg</b>:</div>
                ${slidersHtml}
                <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 8px;">${barsHtml}</div>
                <div class="card-desc" style="font-size:0.64rem; color:var(--text-muted); margin-top:6px; line-height:1.4;">Haloperidol 5 mg ≈ 77% D2 (Kapur 2000). A concentração livre é um parâmetro <b>calibrado ao PET</b>, não uma medida de fração livre cerebral, e escala linearmente com a dose (aproximação). Fármacos sem K<sub>i</sub> tabelado continuam no modelo heurístico acima.</div>
            </div>`;
        }

        container.innerHTML = `
            <div class="card" style="border-color: var(--accent);">
                <div class="card-title">
                    <span style="color: var(--accent);">💊 Prescrição Atual (${pList.length}/4 Fármacos)</span>
                    <button class="action-btn" style="padding: 2px 7px; font-size: 0.65rem;" onclick="store.dispatch({type: 'CLEAR_POLY_DRUGS'})">🧹 Limpar</button>
                </div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px;">
                    ${drugBadgesHtml}
                </div>
                <div class="card-desc" style="font-size: 0.72rem;">
                    Clique nos botões abaixo para <b>adicionar ou remover fármacos</b> da prescrição simultânea:
                </div>
                <div style="display: flex; gap: 3px; flex-wrap: wrap; margin-top: 6px;">
                    ${Object.keys(drugsData).map(k => {
                        const d = drugsData[k];
                        const isSel = pList.includes(k);
                        return `<button class="pill-btn ${isSel ? 'active' : ''}" style="${isSel ? 'background: #38bdf8; border-color: var(--accent); color: #000;' : ''}" onclick="store.dispatch({type: 'TOGGLE_POLY_DRUG', drugKey: '${k}'})">${d.name}</button>`;
                    }).join('')}
                </div>
            </div>

            <div class="card" style="border-color: var(--ink-purple-500);">
                <div class="card-title"><span style="color: var(--ink-purple-500);">📊 Ocupação receptorial (modelo competitivo)</span> <small style="font-weight:600;opacity:.75;">K<sub>i</sub>×PET onde há dado; estimativa didática nos demais</small></div>
                <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 4px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.70rem;"><b>D2 (Dopamina):</b> <span>${occ.d2.toFixed(0)}% ${seloMetodo('d2')} ${poly.d2Bloqueio >= 65 ? (poly.d2Bloqueio >= 78 ? '🔴 Bloqueio >78%: SEP/HiperPRL' : '🟢 Janela antipsicótica (65–78%)') : (parciaisD2.length && occ.d2 >= 65 ? '🟣 ocupa sem bloquear (agonista parcial)' : '')}</span></div>
                        <div style="background: var(--lift-10); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: ${poly.d2Bloqueio >= 78 ? '#ef4444' : (poly.d2Bloqueio >= 65 ? '#22c55e' : '#a855f7')}; width: ${occ.d2}%; height: 100%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.70rem;"><b>SERT (Serotonina):</b> <span>${occ.sert.toFixed(0)}% ${seloMetodo('sert')} ${occ.sert >= 80 ? '🟢 Bloqueio Terapêutico ISRS' : ''}</span></div>
                        <div style="background: var(--lift-10); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: #ef4444; width: ${occ.sert}%; height: 100%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.70rem;"><b>NET (Noradrenalina):</b> <span>${occ.net.toFixed(0)}% ${seloMetodo('net')}</span></div>
                        <div style="background: var(--lift-10); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: #3b82f6; width: ${occ.net}%; height: 100%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.70rem;"><b>5-HT2A (Bloqueio SDA):</b> <span>${occ['5ht2a'].toFixed(0)}% ${seloMetodo('5ht2a')}</span></div>
                        <div style="background: var(--lift-10); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: #ec4899; width: ${occ['5ht2a']}%; height: 100%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.70rem;"><b>H1 (Histamina - Sedação/Peso):</b> <span>${occ.h1.toFixed(0)}% ${seloMetodo('h1')} ${occ.h1 >= 70 ? '⚠️ Alta Sedação' : ''}</span></div>
                        <div style="background: var(--lift-10); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: #e11d48; width: ${occ.h1}%; height: 100%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.70rem;"><b>M1 (Muscarínico):</b> <span>${occ.m1.toFixed(0)}% ${seloMetodo('m1')} ${occ.m1 >= 60 ? (pList.includes('clozapina') ? '⚠️ Constipação/íleo; sialorreia paradoxal (Clozapina)' : '⚠️ Boca Seca / Constipação') : ''}</span></div>
                        <div style="background: var(--lift-10); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: #f97316; width: ${occ.m1}%; height: 100%;"></div>
                        </div>
                    </div>
                    ${occ.alpha2 > 0 ? `<div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.70rem;"><b>α2 (Adrenérgico):</b> <span>${occ.alpha2.toFixed(0)}% ${seloMetodo('alpha2')}</span></div>
                        <div style="background: var(--lift-10); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: #6366f1; width: ${occ.alpha2}%; height: 100%;"></div>
                        </div>
                    </div>` : ''}
                </div>
            </div>

            ${(() => {
                // v12.3 — ocupação mede LIGAÇÃO, não efeito. Se dois fármacos disputam o mesmo
                // receptor com direções opostas, a barra somada NÃO indica efeito somado.
                const conflitos = (typeof directionConflicts === 'function') ? directionConflicts(pList) : [];
                if (!conflitos.length) return '';
                const nome = (k) => (drugsData[k] || {}).name || k;
                const linhas = conflitos.map(c => {
                    const rot = c.receptor.replace('alpha', 'α').replace('5ht', '5-HT').toUpperCase().replace('Α', 'α');
                    const partes = [];
                    if (c.agonistas.length) partes.push(c.agonistas.map(nome).join(', ') + ' <b>ativa</b>');
                    // v12.4: o agonista parcial ganha frase própria — somá-lo aos plenos apagaria o que ele é.
                    if ((c.parciais || []).length) partes.push(c.parciais.map(nome).join(', ') + ' <b>ativa parcialmente</b>');
                    partes.push(c.antagonistas.map(nome).join(', ') + ' <b>bloqueia</b>');
                    return `<div style="font-size:0.72rem;line-height:1.5;margin-top:3px;"><b>${rot}:</b> ${partes.join(' · ')}</div>` +
                        ((c.parciais || []).length ? `<div style="font-size:0.66rem;color:var(--ink-amber);margin-left:8px;">↳ com agonista parcial o resultado depende do tônus local: onde o neurotransmissor está alto ele reduz a sinalização, onde está baixo ele a sustenta.</div>` : '');
                }).join('');
                return `<div class="card" style="border-color:var(--ink-amber-500);background:rgba(245,158,11,0.08);">
                    <div class="card-title"><span style="color:var(--ink-amber-500);">⚖️ Direções opostas no mesmo receptor</span></div>
                    <div class="card-desc" style="font-size:0.72rem;line-height:1.5;">A barra de ocupação mede <b>ligação</b>, não efeito. Aqui há fármacos que ocupam o mesmo receptor em <b>sentidos contrários</b> — a ocupação somada não significa efeito somado, e pode significar efeito anulado.</div>
                    ${linhas}
                    <div class="card-desc" style="font-size:0.66rem;color:var(--text-muted);margin-top:5px;">É o <i>princípio da inversão de sinal</i>: o receptor define a linguagem molecular; a direção do ligante e a célula definem o efeito.</div>
                </div>`;
            })()}

            ${(() => {
                // v12.4 — o contraexemplo medido da janela de ocupação. Sem isto, o app ensinaria
                // o limiar de 80% como se fosse lei, e o aripiprazol mostra que não é.
                if (typeof occupancyExceptionsIn !== 'function') return '';
                const exc = occupancyExceptionsIn(pList);
                if (!exc.length) return '';
                return exc.map(e => `<div class="card" style="border-color:var(--accent);background:rgba(56,189,248,0.08);">
                    <div class="card-title"><span style="color:var(--accent);">🎯 Ocupação alta que não significa bloqueio — ${escapeHtml((drugsData[e.drug] || {}).name || e.drug)}</span></div>
                    <div class="card-desc" style="font-size:0.72rem;line-height:1.5;">${e.nota}</div>
                    <div class="card-desc" style="font-size:0.64rem;color:var(--text-muted);margin-top:5px;">Fontes: ${e.source.map(k => (typeof SOURCES !== 'undefined' && SOURCES[k]) ? k : k + ' (?)').join(' · ')}. Ver a aba de referências.</div>
                </div>`).join('');
            })()}

            ${(() => {
                // v12.5 — farmacogenômica com a limitação na mesma altura visual do dado.
                if (typeof pharmacogenomicRiskIn !== 'function') return '';
                const pg = pharmacogenomicRiskIn(pList);
                if (!pg.length) return '';
                return pg.map(g => `<div class="card" style="border-color:var(--ink-violet);background:rgba(167,139,250,0.08);">
                    <div class="card-title"><span style="color:var(--ink-violet);">🧬 Farmacogenômica — ${escapeHtml((drugsData[g.drug] || {}).name || g.drug)}</span></div>
                    <div class="card-desc" style="font-size:0.72rem;line-height:1.5;">Desfecho estudado: <b>${escapeHtml(g.desfecho)}</b>.</div>
                    ${g.alelos.map(a => `<div style="font-size:0.7rem;line-height:1.45;margin-top:6px;padding-left:8px;border-left:2px solid rgba(167,139,250,0.5);">
                        <b>${escapeHtml(a.alelo)}</b> — ${escapeHtml(a.medida)}<br>
                        <span style="color:var(--text-soft);">População: ${escapeHtml(a.populacao)}.</span><br>
                        <span style="color:var(--ink-amber);">⚠️ ${escapeHtml(a.limitacao)}</span>
                    </div>`).join('')}
                    <div class="card-desc" style="font-size:0.7rem;line-height:1.5;margin-top:8px;padding:6px 8px;border-radius:8px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.4);">${escapeHtml(g.limite)}</div>
                </div>`).join('');
            })()}

            ${pendenteHtml}

            ${kiPanelHtml}

            ${alvosPanelHtml}

            ${sepWarning}

            <div class="card" style="border-color: ${hunterRiskColor}; background: var(--tint-20);">
                <div class="card-title"><span class="ink" style="--cor: ${hunterRiskColor};">🔥 Carga Serotoninérgica Estimada <small style="opacity:.75; font-weight:600;">(heurística — não substitui os Critérios de Hunter)</small></span></div>
                <div class="badge" style="background: ${hunterRiskColor}; color: #000; margin-bottom: 4px; font-weight: bold; font-size: 0.70rem;">${hunterRiskLabel}</div>
                <div class="card-desc" style="font-size: 0.74rem;">${hunterAlert}</div>
            </div>

            <div class="card" style="border-color: ${qtcColor};">
                <div class="card-title"><span class="ink" style="--cor: ${qtcColor};">⚡ Risco de Prolongamento do QTc <small style="opacity:.75; font-weight:600;">(qualitativo)</small></span></div>
                <div class="badge" style="background: ${qtcColor}; color: #000; margin-bottom: 4px; font-weight: bold; font-size: 0.70rem;">${qtcLabel}</div>
                <div class="card-desc" style="font-size: 0.72rem;">${qtcAdvice}${qtcHighRiskDrugs.length ? '<br><b>Agentes de maior risco nesta prescrição:</b> ' + qtcHighRiskDrugs.join(', ') + (qtcHighRiskDrugs.length >= 2 ? ' — <b>combinação desaconselhada</b>.' : '.') : ''}</div>
            </div>

            <div class="card" style="border-color: #06b6d4;">
                <div class="card-title"><span style="color: #06b6d4;">🧬 Interações Farmacocinéticas no Citocromo P450</span></div>
                <div class="card-desc" style="font-size: 0.74rem; line-height: 1.45;">
                    ${cypInhibitions.length > 0 ? cypInhibitions.join('<br>') : 'Nenhuma inibição enzimática crítica detectada nesta combinação.'}
                </div>
            </div>

            <div class="card" style="border-color: rgba(148,163,184,0.35); background: rgba(148,163,184,0.06);">
                <div class="card-desc" style="font-size: 0.68rem; line-height: 1.4;">
                    ℹ️ <b>Como ler este painel:</b> as barras são estimativas de ocupação em doses usuais, combinadas por modelo competitivo; a carga serotoninérgica e o QTc são escores heurísticos do simulador para fins didáticos. Decisões de prescrição exigem avaliação clínica, ECG quando indicado e consulta a fontes primárias — ver <a href="#" onclick="openSourcesModal(); return false;" style="color:var(--accent);">Fontes & Limitações</a>.
                </div>
            </div>
        `;
        return;
    }

    // =========================================================
    // 3. ELECTROPHYSIOLOGY & PATCH-CLAMP LAB (MODE 1 - 3D/CLEFT)
    // =========================================================
    if (state.activeMode === MODO.neuronio) {   // v12.37: o cartao dos seis passos foi para a Neurotransmissao
        if (titleEl) titleEl.innerText = "⚡ Laboratório de Biofísica & Patch-Clamp";
        const pc = state.patchclamp || { Ko: state.k_out || 4.5, Nao: state.na_out || 145, Cao: state.ca_out || 2.0 };
        const tox = state.activeToxins || { ttx: state.blockNav_TTX || false, tea: state.blockKv_TEA || false, nifedipine: state.blockCav_Cd || false, picrotoxin: state.blockGABA_PTX || false };

        container.innerHTML = `
            <div class="card" style="border-color: var(--accent);">
                <div class="card-title">
                    <span style="color: var(--accent);">🧪 Concentrações Iônicas Extracelulares [mM]</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.74rem;">
                    <div>
                        <div style="display: flex; justify-content: space-between;"><b>Potássio [K+]o:</b> <span id="val-ko">${pc.Ko} mM</span> (E<sub>K</sub> = ${calculateNernst(1, state.k_out, state.k_in).toFixed(0)} mV)</div>
                        <input type="range" min="1" max="15" step="0.5" value="${pc.Ko}" style="width: 100%;" oninput="store.dispatch({type: 'UPDATE_ION_CONCENTRATION', ion: 'Ko', value: parseFloat(this.value)}); document.getElementById('val-ko').innerText = this.value + ' mM';">
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between;"><b>Sódio [Na+]o:</b> <span id="val-nao">${pc.Nao} mM</span> (E<sub>Na</sub> = +${calculateNernst(1, state.na_out, state.na_in).toFixed(0)} mV)</div>
                        <input type="range" min="80" max="180" step="5" value="${pc.Nao}" style="width: 100%;" oninput="store.dispatch({type: 'UPDATE_ION_CONCENTRATION', ion: 'Nao', value: parseFloat(this.value)}); document.getElementById('val-nao').innerText = this.value + ' mM';">
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between;"><b>Cálcio [Ca2+]o:</b> <span id="val-cao">${pc.Cao} mM</span> (E<sub>Ca</sub> = +${calculateNernst(2, state.ca_out, state.ca_in).toFixed(0)} mV)</div>
                        <input type="range" min="0.2" max="5.0" step="0.2" value="${pc.Cao}" style="width: 100%;" oninput="store.dispatch({type: 'UPDATE_ION_CONCENTRATION', ion: 'Cao', value: parseFloat(this.value)}); document.getElementById('val-cao').innerText = this.value + ' mM';">
                    </div>
                </div>
            </div>

            <div class="card" style="border-color: var(--ink-red-500);">
                <div class="card-title">
                    <span style="color: var(--ink-red-500);">🧪 Toxinas Eletrofisiológicas & Bloqueadores</span>
                </div>
                <div style="display: flex; gap: 3px; flex-wrap: wrap;">
                    <button class="pill-btn ${tox.ttx ? 'active' : ''}" style="${tox.ttx ? 'background: #ef4444; border-color: var(--ink-red-500);' : ''}" onclick="store.dispatch({type: 'TOGGLE_TOXIN', toxin: 'ttx'})">🐡 TTX (Nav1.6)</button>
                    <button class="pill-btn ${tox.tea ? 'active' : ''}" style="${tox.tea ? 'background: #f59e0b; border-color: var(--ink-amber-500);' : ''}" onclick="store.dispatch({type: 'TOGGLE_TOXIN', toxin: 'tea'})">⚡ TEA (Kv)</button>
                    <button class="pill-btn ${tox.nifedipine ? 'active' : ''}" style="${tox.nifedipine ? 'background: #38bdf8; border-color: var(--accent);' : ''}" onclick="store.dispatch({type: 'TOGGLE_TOXIN', toxin: 'nifedipine'})">💊 Nifedipina (Cav)</button>
                    <button class="pill-btn ${tox.picrotoxin ? 'active' : ''}" style="${tox.picrotoxin ? 'background: #a855f7; border-color: var(--ink-purple-500);' : ''}" onclick="store.dispatch({type: 'TOGGLE_TOXIN', toxin: 'picrotoxin'})">🌿 Picrotoxina (GABAA)</button>
                </div>
            </div>
            ${renderEquationsCard(state)}
        `;
        return;
    }

    // =========================================================
    // 4. PSYCHOEDUCATION & STEP-BY-STEP TRANSMISSION (MODE 4)
    // =========================================================
    if (state.activeMode === MODO.neurotransmissao) {
        // v12.37 (Bloco 2): o inspetor da Neurotransmissao — o cartao do passo atual (que morava no modo 1 antigo) e o
        // guia dos seis passos (que morava na Psicoeducacao). O roteiro do paciente foi para renderPsicoeducacaoPanel.
        if (titleEl) titleEl.innerText = "⚡ Neurotransmissão: os seis passos";
        container.innerHTML = renderStepCard(state) + `
            <div class="card" style="border-color: var(--ink-emerald-500);">
                <div class="card-title"><span style="color: var(--ink-emerald-500);">🧪 Toxina da transmissão</span></div>
                <div style="display: flex; gap: 3px; flex-wrap: wrap;">
                    <button class="pill-btn ${state.botulinumToxinActive ? 'active' : ''}" style="${state.botulinumToxinActive ? 'background: #10b981; border-color: var(--ink-emerald-500);' : ''}" onclick="store.dispatch({type: 'TOGGLE_BOTULINUM_TOXIN'})" title="Cliva SNAP-25 e sintaxina-1: a vesícula não funde. Bloqueio da exocitose, não do canal.">🧪 Botulínica (SNARE)</button>
                </div>
            </div>
            <div class="card-title" style="margin-top: 6px;"><span style="color: var(--accent);">🎓 Guia da Neurotransmissão Sináptica (6 passos)</span></div>
            <div class="card" style="border-color: var(--accent);">
                <div class="card-title"><span style="color: var(--accent);">1. Síntese & Precursores</span></div>
                <div class="card-desc">Produção enzimática do neurotransmissor a partir de aminoácidos precursores (ex: Tirosina ➔ L-DOPA ➔ Dopamina).</div>
            </div>
            <div class="card" style="border-color: var(--ink-purple-500);">
                <div class="card-title"><span style="color: var(--ink-purple-500);">2. Empacotamento Vesicular (VMAT2)</span></div>
                <div class="card-desc">Concentração do transmissor no interior de vesículas sinápticas através de trocadores de prótons dependentes de ATP.</div>
            </div>
            <div class="card" style="border-color: var(--ink-red-500);">
                <div class="card-title"><span style="color: var(--ink-red-500);">3. Potencial de Ação & Influxo de Ca2+</span></div>
                <div class="card-desc">Despolarização axonal atinge o terminal e abre canais de Cálcio voltagem-dependentes Cav2.1 (P/Q e N).</div>
            </div>
            <div class="card" style="border-color: var(--ink-green-500);">
                <div class="card-title"><span style="color: var(--ink-green-500);">4. Acoplamento SNARE & Exocitose</span></div>
                <div class="card-desc">O cálcio ativa a Sinaptotagmina-1, induzindo a fusão do complexo SNARE e liberando o transmissor na fenda sináptica.</div>
            </div>
            <div class="card" style="border-color: #eab308;">
                <div class="card-title"><span style="color: var(--ink-yellow-500);">5. Ativação Receptorial & Trocas Iônicas</span></div>
                <div class="card-desc">Ligação em receptores ionotrópicos rápidos e metabotrópicos GPCR acoplados a proteínas Gs, Gi/o ou Gq.</div>
            </div>
            <div class="card" style="border-color: #f97316;">
                <div class="card-title"><span style="color: #f97316;">6. Recaptação & Degradação Enzimática</span></div>
                <div class="card-desc">Depuração por transportadores de alta afinidade (DAT, SERT, NET) e metabolização por MAO e COMT.</div>
            </div>
        `;
        return;
    }
}
// ==========================================
// 7. PATIENT HANDOUT GENERATOR → ver exportPatientStory() na seção 13
// ==========================================


// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { marcador, renderInspector, renderUI };
// ── fim do exporta ──
