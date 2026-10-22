// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import './features.js?v=12.66.1';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { recalculateElectrophysiology } from './dominios/neuronio.js?v=12.66.1';
import { registerEffect, store } from './store.js?v=12.66.1';
import { persistSession } from './features.js?v=12.66.1';
import { scene3D } from './render3d.js?v=12.66.1';
// ── fim dos módulos ──


// ==========================================
// 4. NUMERICAL HODGKIN-HUXLEY BIOPHYSICS SOLVER
// ==========================================

// ==========================================
// 5. AUDIO SYNTHESIS
// ==========================================
let audioCtx = null;
function playBioTone(freq, type = 'sine', duration = 0.15, gainVal = 0.15) {
    const state = store.getState();
    if (!state.soundEnabled) return;
    if (!audioCtx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) audioCtx = new AudioClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function toggleSound() {
    const s = store.getState();
    s.soundEnabled = !s.soundEnabled;
    const btn = document.getElementById('btn-toggle-sound');
    if (btn) btn.innerHTML = s.soundEnabled ? '🔊 <span class="lbl">Som</span>' : '🔇 <span class="lbl">Mudo</span>';
    if (typeof persistSession === 'function') persistSession();
}

/*
 * v12.52 (decisao D5): o FATOR DE PROJECAO lido pelo canvas. O CSS ja multiplica tudo o que a plateia le por
 * --escala-ui; o canvas 2D nao le CSS, entao pergunta aqui. Sem isto, os rotulos do conectoma ficavam em 8px na
 * projecao — o unico texto do app que o Modo Aula nunca aumentou.
 * O valor e relido no maximo quatro vezes por segundo: getComputedStyle por rotulo, a 60 quadros, seria caro, e o
 * fator so muda quando alguem entra ou sai do Modo Aula.
 */
let _fatorEscalaUI = 1, _fatorEscalaUIQuando = -1e9;
function fatorDeEscalaUI() {
    if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return 1;
    const agora = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (agora - _fatorEscalaUIQuando > 250) {
        const v = parseFloat(getComputedStyle(document.body).getPropertyValue('--escala-ui'));
        _fatorEscalaUI = (isFinite(v) && v > 0) ? v : 1;
        _fatorEscalaUIQuando = agora;
    }
    return _fatorEscalaUI;
}

function toggleColorTheme() {
    const s = store.getState();
    s.isAtlasTheme = !s.isAtlasTheme;
    document.body.classList.toggle('atlas-theme', s.isAtlasTheme);
    const btn = document.getElementById('btn-toggle-theme');
    if (btn) btn.innerHTML = s.isAtlasTheme ? '🌙 <span class="lbl">Escuro</span>' : '🎨 <span class="lbl">Tema</span>';
    if (scene3D) scene3D.background = new THREE.Color(s.isAtlasTheme ? 0xf8fafc : 0x020617);
    if (typeof persistSession === 'function') persistSession();
}

// v12.6 — registro de efeitos no store. O store declara de que precisa; cada módulo entrega o seu.
// Sem isto o efeito simplesmente não ocorre (o padrão é não fazer nada), em vez de lançar ReferenceError.
if (typeof registerEffect === 'function') {
    registerEffect('tone', playBioTone);
    registerEffect('recalc', recalculateElectrophysiology);
}

/*
 * v12.24.0 — RELOGIO DA SIMULACAO.
 *
 * Ate aqui as cenas 2D usavam `Date.now() * 0.001` — relogio de parede. Ele nao escala, nao pausa
 * e nao obedece a ninguem. Consequencia medida em 01/09/2026: `axonSpeed` existia em TRES lugares
 * no app inteiro (o setter, o conectoma 2D e o foton 3D) e em NENHUM deles estava a fenda. O
 * slider "⚡ Velocidade" ficava na doca, ao lado da fenda aberta na tela, sem governar nada do que
 * o professor estava olhando. Nao era dificil de controlar: era um controle que nao controlava.
 *
 * Mora em engine.js, e nao no renderizador, porque isto e tempo de SIMULACAO e nao de desenho — e
 * porque assim da para testar sem navegador.
 *
 * O teto de delta existe por um motivo concreto: o navegador congela requestAnimationFrame em aba
 * oculta, e ao voltar o primeiro delta pode valer minutos. Sem teto, a simulacao daria um pulo de
 * dez minutos num quadro so. (Aconteceu nesta sessao, com as medicoes no navegador.)
 */
let relogioSimulacao = 0;          // segundos de simulacao acumulados
let ultimoQuadroReal = null;       // marca de tempo real do quadro anterior
const TETO_DELTA_S = 0.10;         // no maximo 100 ms de simulacao por quadro (~10 fps)

function avancarRelogioSimulacao(agoraMs, velocidade) {
    if (ultimoQuadroReal === null) { ultimoQuadroReal = agoraMs; return relogioSimulacao; }
    const deltaReal = Math.min((agoraMs - ultimoQuadroReal) / 1000, TETO_DELTA_S);
    ultimoQuadroReal = agoraMs;
    // v12.24.1: o `|| 0` daqui estava ERRADO e congelou o app inteiro ao abrir. axonSpeed nunca
    // existiu no estado inicial do store — ate a v12.23 cada leitor fazia `state.axonSpeed || 1.0`
    // e mascarava a ausencia. Ao trocar o padrao para 0 eu transformei "nao definido" em "pausa".
    // Zero EXPLICITO e pausa; ausente e velocidade normal. Os dois casos sao diferentes.
    const v = (velocidade === undefined || velocidade === null) ? 1 : velocidade;
    relogioSimulacao += Math.max(deltaReal, 0) * Math.max(v, 0);
    return relogioSimulacao;
}

function reiniciarRelogioSimulacao() { relogioSimulacao = 0; ultimoQuadroReal = null; }


// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { avancarRelogioSimulacao, fatorDeEscalaUI, playBioTone, relogioSimulacao, toggleColorTheme, toggleSound };
// ── fim do exporta ──
