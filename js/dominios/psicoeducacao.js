// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import '../data.js?v=12.66.1';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { APP_VERSION } from '../data.js?v=12.66.1';
import { store } from '../store.js?v=12.66.1';
// ── fim dos módulos ──
/*
 * DOMINIO PSICOEDUCACAO — um palco inteiro num arquivo so (decisao D3 do autor, "pastas por dominio").
 *
 * Ate a v12.47 este codigo morava espalhado por 3 arquivo(s) organizados por CAMADA
 * (data.js, ui.js, main.js): quem quisesse mexer neste palco procurava em todos.
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

const patientStoriesData = {
    latency: {
        title: "⏳ Por que meu antidepressivo demora de 2 a 4 semanas para funcionar?",
        metaphor: "🚗 Metáfora: O Carro com o Freio de Mão Puxado (Sensores 5-HT1A)",
        desc: "O medicamento fecha o ralo da serotonina, mas os sensores de segurança (freio de mão) mandam o neurônio parar a produção nos primeiros dias. Após 2 a 4 semanas de uso diário, esses sensores se acostumam e são recolhidos (dessensibilização — a explicação mais aceita, embora algumas pessoas já notem melhora na 1ª semana), soltando o freio para que a serotonina inunde o cérebro e ative o adubo neural (BDNF)!",
        takeaway: "👉 Não desista nas primeiras semanas: os efeitos colaterais costumam atenuar e o efeito real precisa desse tempo biológico para destravar o freio."
    },
    discontinuation: {
        title: "🛑 Por que não posso suspender o remédio de uma vez?",
        metaphor: "📻 Metáfora: O Ajuste de Volume das Antenas Receptoras",
        desc: "O cérebro se adapta ao remédio diminuindo o número de antenas receptoras. Se o remédio for cortado de repente, sobram pouquíssimas antenas para captar o sinal, causando choques na cabeça (brain zaps), tontura e ansiedade rebote. O desmame gradual dá tempo para as antenas voltarem a crescer.",
        takeaway: "👉 A reação ao parar de vez não é dependência química ('vício'), mas sim a necessidade do cérebro readaptar suas antenas."
    },
    neurogenesis: {
        title: "🌳 Como o estresse atrofia o cérebro e o remédio o reconstrói?",
        metaphor: "🌱 Metáfora: A Árvore Neural, a Seca do Estresse e o Adubo do Tratamento",
        desc: "Meses de estresse contínuo e tristeza agem como uma seca que quebra os galhos e seca as folhas (espinhas dendríticas). O tratamento médico funciona como chuva e adubo fértil (BDNF), fazendo a árvore florescer com milhares de novos contatos sinápticos em 3D.",
        takeaway: "👉 A depressão é uma condição biológica reversível de atrofia das conexões neurais que pode remitir plenamente e ser reconstruída."
    },
    maintenance_vs_rescue: {
        title: "🛡️ Qual a diferença entre o remédio diário e o de resgate?",
        metaphor: "🏊 Metáfora: A Aula de Natação (Tratamento) vs a Boia Salva-Vidas (Resgate)",
        desc: "O medicamento diário é a aula de natação: fortalece a musculatura mental para não se afogar a longo prazo. O remédio de resgate (ansiolítico rápido) é a boia: excelente para tirar de um afogamento agudo no pânico, mas não ensina a nadar se usada todos os dias.",
        takeaway: "👉 O remédio diário trata a base do problema e previne recaídas; o de resgate é o extintor de emergência, que não deve virar rotina diária."
    },
    lithium_monitoring: {
        title: "🧪 Por que preciso fazer exames de sangue com o lítio?",
        metaphor: "🌡️ Metáfora: O Termostato de Faixa Estreita",
        desc: "O lítio funciona como um termostato do humor, mas só dentro de uma faixa muito estreita: um pouco abaixo não protege, um pouco acima intoxica (tremor grosso, enjoo, diarreia, confusão). O nível no sangue (litemia) sobe quando o corpo perde água ou sódio — diarreia, calor intenso, jejum, dieta sem sal — e com anti-inflamatórios comuns (ibuprofeno, diclofenaco), diuréticos e alguns remédios de pressão. Por isso a litemia é medida 5 a 7 dias após cada ajuste e, depois, a cada 3 a 6 meses, junto com função renal (creatinina) e tireoide (TSH).",
        takeaway: "👉 Beba água normalmente, não corte o sal por conta própria, avise qualquer médico que você usa lítio antes de receber um anti-inflamatório, e procure atendimento se surgir tremor grosso com enjoo ou confusão."
    },
    antipsychotic_why: {
        title: "🔊 Por que o antipsicótico ajuda a 'abaixar o volume' das vozes e desconfianças?",
        metaphor: "📡 Metáfora: O Detector de Importância Desregulado",
        desc: "O cérebro tem um sistema (dopamina) que marca o que é importante e merece atenção. Na psicose, esse detector dispara sozinho: coisas banais — um olhar, uma frase na TV — parecem carregadas de significado e ameaça. O antipsicótico reduz o excesso de sinal desse detector, e por isso as vozes e a desconfiança vão perdendo força ao longo de dias a semanas. Ele não 'apaga' a pessoa nem muda quem ela é; efeitos como sonolência, rigidez ou inquietação nas pernas devem ser relatados, pois quase sempre têm ajuste.",
        takeaway: "👉 A melhora é gradual (2 a 6 semanas) e a proteção contra recaída depende de manter o remédio mesmo quando tudo parece bem; conversar sobre efeitos colaterais é melhor do que parar por conta própria."
    }
};

// ====================================================================================================
// vindo de ui.js
// ====================================================================================================

// ==========================================
// 8. PAINEL DE PSICOEDUCAÇÃO (v12.37, Bloco 2 da organização por domínio)
//    A Psicoeducação deixou de ser modo e virou FERRAMENTA do cabeçalho: este painel reúne o que eram a
//    barra (os seis roteiros) e o inspetor (o roteiro escolhido e o PDF) do modo 4 antigo. Abre e fecha por
//    estado (psicoeducacaoAberta, TOGGLE_PSICOEDUCACAO); renderUI o reconstrói enquanto aberto. Nada some.
// ==========================================
function renderPsicoeducacaoPanel(state) {
    const story = patientStoriesData[state.patientStoryKey] || patientStoriesData.latency;
    const pilulas = Object.keys(patientStoriesData).map(k => `<button class="pill-btn ${state.patientStoryKey === k ? 'active' : ''}" style="${state.patientStoryKey === k ? 'background: rgba(168,85,247,0.25); border-color: var(--ink-purple-500); color: var(--ink-purple-soft);' : ''}" onclick="store.dispatch({type: 'SET_PATIENT_STORY', story: '${k}'})">${patientStoriesData[k].title.split(' ')[0]} ${patientStoriesData[k].title.replace(/^\S+\s/, '').split('?')[0].slice(0, 46)}${patientStoriesData[k].title.length > 52 ? '…' : '?'}</button>`).join('');
    return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h2 style="font-size: 0.95rem; color: var(--ink-purple); margin: 0;">📖 Psicoeducação: roteiros para pacientes e familiares</h2>
            <button class="mini-btn" onclick="store.dispatch({type: 'TOGGLE_PSICOEDUCACAO', aberta: false})" title="Fechar">✕</button>
        </div>
        <div class="pills-group" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">${pilulas}</div>
        <div class="card" style="border-color: var(--ink-purple-500); background: rgba(168,85,247,0.06);">
            <div class="card-title"><span style="color: var(--ink-purple);">${story.title}</span></div>
            <div class="clinical-pearl" style="margin: 6px 0;">${story.metaphor}</div>
            <div class="card-desc" style="font-size: 0.8rem; line-height: 1.55;">${story.desc}</div>
            <div class="card-desc" style="margin-top: 8px; padding: 8px 10px; border-radius: 8px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.4); color: var(--ink-emerald-soft); font-weight: 600;">${story.takeaway}</div>
            <div style="display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;">
                <button class="action-btn" style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff;" onclick="exportPatientStory()">🖨️ Imprimir / salvar em PDF para o paciente</button>
            </div>
            <div class="card-desc" style="font-size: 0.66rem; color: var(--text-muted); margin-top: 6px;">Linguagem leiga, sem jargão, para entregar ao paciente ou familiar após a consulta. O texto impresso traz espaço para o nome do paciente e do médico.</div>
        </div>
    `;
}

// ====================================================================================================
// vindo de main.js
// ====================================================================================================

// ==========================================
// 14. WINDOW INITIALIZATION
// ==========================================
        // ==========================================
// 13.5 PATIENT EDUCATION & HANDOUT GENERATION
// ==========================================
function exportPatientStory() {
    const state = store.getState();
    const story = (typeof patientStoriesData !== 'undefined' && patientStoriesData[state.patientStoryKey]) || { title: "Orientações ao Paciente", metaphor: "", desc: "", takeaway: "" };
    const win = window.open('', '_blank');
    if (!win) {
        alert("Por favor, permita popups para gerar o laudo do paciente.");
        return;
    }
    const docHtml = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Laudo - ' + story.title + '</title><style>body{font-family:Segoe UI,sans-serif;margin:40px;color:#1e293b;line-height:1.6;}.header{border-bottom:2px solid #0284c7;padding-bottom:12px;margin-bottom:24px;}.logo{font-size:1.4rem;font-weight:800;color:#0284c7;}h2{color:#0f172a;}.metaphor{font-size:1.1rem;color:#0284c7;font-weight:bold;margin-bottom:12px;}.content-box{background:#f8fafc;border-left:4px solid #0284c7;padding:16px;margin:16px 0;border-radius:0 8px 8px 0;}.takeaway{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;padding:14px;border-radius:8px;font-weight:600;margin-top:24px;}</style></head><body><div class="header"><div class="logo">Orientação ao Paciente</div><div style="font-size:0.85rem;color:var(--text-faint);margin-top:6px;">Paciente: ______________________________ &nbsp;&nbsp; Data: ____/____/______<br>Médico(a): ______________________________ &nbsp;&nbsp; CRM: __________</div></div><h2>' + story.title + '</h2><div class="metaphor">' + story.metaphor + '</div><div class="content-box">' + story.desc + '</div><div class="takeaway">' + story.takeaway + '</div><p style="margin-top:28px;font-size:0.75rem;color:var(--text-faint);">Material educativo gerado com NeuroSim Pro 3D v' + APP_VERSION + '. Não substitui a orientação individual do seu médico. Em caso de dúvida ou efeito inesperado, entre em contato com o serviço que acompanha você.</p><' + '/body><' + '/html>';
    win.document.write(docHtml);
    win.document.close();
}

function generatePatientHandout() {
    exportPatientStory();
}


// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { exportPatientStory, patientStoriesData, renderPsicoeducacaoPanel };
// ── fim do exporta ──
