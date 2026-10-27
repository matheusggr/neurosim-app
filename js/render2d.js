// ── módulos (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
import './render3d.js?v=12.76.2';   // primeiro: garante a ordem de avaliação dos scripts clássicos
import { drawNeuron2D } from './dominios/neuronio.js?v=12.76.2';
import {
    animateSynaptic3DVesicles, drawSynapse2D, initSynapticParticles, sinapseReageAoPA
} from './dominios/neurotransmissao.js?v=12.76.2';
import { drawBrainCircuits2D, update3DBrainTractsVisibility } from './dominios/circuitos.js?v=12.76.2';
import { store } from './store.js?v=12.76.2';
import { cameraOrbit, cameraTween, updateCameraOrbit, updateCameraTween } from './features.js?v=12.76.2';
import { avancarRelogioSimulacao } from './engine.js?v=12.76.2';
import { autoRotate3D, camera3D, controls3D, renderer3D, scene3D } from './render3d.js?v=12.76.2';
// ── fim dos módulos ──

initSynapticParticles();

/*
 * v12.7 — CONGELAR O QUADRO (tecla T, de "travar").
 *
 * MOTIVO: didático. Numa aula ou num vídeo, apontar para uma vesícula que está se movendo é pior
 * do que apontar para uma parada. Congelar é a versão simples do "pause" que todo material
 * audiovisual precisa.
 *
 * MOTIVO QUE EU SUPUS E QUE SE PROVOU FALSO — deixado escrito de propósito: eu construí isto
 * também acreditando que o laço a 60 quadros por segundo é o que impede a captura de tela por
 * ferramenta externa. Medi depois de pronto: com o quadro congelado o laço para de fato (zero
 * quadros contados) e a thread fica livre (3 milhões de somas em 8,5 ms), e a captura CONTINUA
 * falhando. A causa é outra — provavelmente os 9 canvas, alguns WebGL, no caminho de captura da
 * extensão. Congelar NÃO resolve captura externa. Se um dia isso for necessário, o caminho
 * provável é exportar o canvas de dentro do app (toDataURL), não esperar por ferramenta de fora.
 *
 * Quando congelado o próximo quadro NÃO é agendado, em vez de agendado-e-ignorado: a thread fica
 * realmente livre. Religar só acontece na transição congelado → ativo, para não haver dois laços.
 */
let renderPaused = false;
function isRenderPaused() { return renderPaused; }
function setRenderPaused(pausar) {
    const antes = renderPaused;
    renderPaused = !!pausar;
    atualizarSeloCongelado();
    if (antes && !renderPaused) masterRenderLoop();   // religa apenas na transição
    return renderPaused;
}
function toggleRenderPaused() { return setRenderPaused(!renderPaused); }
function atualizarSeloCongelado() {
    let selo = document.getElementById('renderPausedBadge');
    if (!renderPaused) { if (selo) selo.remove(); return; }
    if (selo) return;
    selo = document.createElement('div');
    selo.id = 'renderPausedBadge';
    selo.textContent = '⏸ QUADRO CONGELADO — T para voltar';
    selo.setAttribute('style', 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:var(--z-panel);'
        + 'background:rgba(3,105,161,0.95);color:#fff;font:600 0.72rem/1 system-ui,sans-serif;'   // v12.32: sky-700; sky-500 dava 3,2:1 com o branco

        + 'letter-spacing:0.04em;padding:7px 14px;border-radius:999px;pointer-events:none;'
        + 'box-shadow:0 2px 12px rgba(0,0,0,0.4);');
    document.body.appendChild(selo);
}

function masterRenderLoop() {
    if (renderPaused) return;   // não agenda o próximo quadro: a thread principal fica livre
    requestAnimationFrame(masterRenderLoop);
    const state = store.getState();
    // UMA vez por quadro: as cenas leem o relogio, nao o empurram. Se cada cena o avancasse,
    // duas cenas no mesmo quadro andariam em dobro — o erro que o painel duplo quase cometeu.
    avancarRelogioSimulacao(Date.now(), state.axonSpeed);
    sinapseReageAoPA(state);   // v12.38: o PA libera as vesiculas aqui, nao no reducer

    // Cenas (v10): interpolação de câmera entre cenas (pausa o auto-giro durante a transição)
    if (cameraTween) updateCameraTween();
    if (cameraOrbit) updateCameraOrbit();
    if (controls3D) controls3D.autoRotate = autoRotate3D && !cameraTween && !cameraOrbit;

    if (state.visualScale === 'cleft2d') {
        drawSynapse2D();
    } else if (state.visualScale === 'neuron2d') {
        drawNeuron2D();
    } else if (state.visualScale === 'brain2d') {
        if (state.dualSubMode === 'physio_vs_patho') {
            // mesmo desenho, dois estados: a esquerda a fisiologia, a direita o perfil escolhido
            const esq = document.getElementById('dualCanvasLeft');
            const dir = document.getElementById('dualCanvasRight');
            if (esq) drawBrainCircuits2D(esq, { activePathologyProfile: 'none' });
            if (dir) drawBrainCircuits2D(dir, {}, true);
        } else {
            drawBrainCircuits2D();
        }
    } else if (state.visualScale === 'brain3d') {
        if (controls3D) controls3D.update();
        update3DBrainTractsVisibility();
        if (renderer3D && scene3D && camera3D) {
            renderer3D.render(scene3D, camera3D);
        }
    } else if (state.visualScale === '3d') {
        if (controls3D) controls3D.update();
        animateSynaptic3DVesicles();
        if (renderer3D && scene3D && camera3D) {
            renderer3D.render(scene3D, camera3D);
        }
    }
}


// ── exporta (GERADO por scripts/mapa-modulos.mjs --escrever; não edite à mão) ──
export { masterRenderLoop, setRenderPaused, toggleRenderPaused };
// ── fim do exporta ──
