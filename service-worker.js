// NeuroSim Pro 3D — Service Worker (PWA offline)
// A versão abaixo é sincronizada por `npm run sync-version` (scripts/sync-version.mjs).
// Estratégia:
//   • HTML e manifest: NETWORK-FIRST (o usuário sempre recebe a versão mais nova quando há rede;
//     cai para o cache só quando estiver offline). Isso evita o bug de "versão presa no cache".
//   • Vendor (three.js), ícones e demais assets: CACHE-FIRST com atualização em segundo plano.
const APP_VERSION = '12.66.1';
const CACHE_NAME = 'neurosim-pro-v' + APP_VERSION;
const APP_SHELL = [
    './',
    './Simulador_Neuronio_Interativo.html',
    './manifest.json',
    './icon-192.svg',
    './icon-512.svg',
    './vendor/three.module.js',
    './vendor/OrbitControls.module.js',
    // MODULOS-INICIO (GERADO por npm run sync-version, da ORDEM em scripts/mapa-modulos.mjs; não edite à mão)
    './js/targets.js?v=' + APP_VERSION,
    './js/data.js?v=' + APP_VERSION,
    './js/dominios/psicoeducacao.js?v=' + APP_VERSION,
    './js/dominios/neuronio.js?v=' + APP_VERSION,
    './js/dominios/psicofarmacos.js?v=' + APP_VERSION,
    './js/dominios/neurotransmissao.js?v=' + APP_VERSION,
    './js/dominios/circuitos.js?v=' + APP_VERSION,
    './js/store.js?v=' + APP_VERSION,
    './js/features.js?v=' + APP_VERSION,
    './js/engine.js?v=' + APP_VERSION,
    './js/ui.js?v=' + APP_VERSION,
    './js/render3d.js?v=' + APP_VERSION,
    './js/render2d.js?v=' + APP_VERSION,
    './js/main.js?v=' + APP_VERSION,
    './js/ponte.js?v=' + APP_VERSION,
    // MODULOS-FIM
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            Promise.all(APP_SHELL.map((url) =>
                cache.add(url).catch((err) => console.warn('[SW] Não foi possível pré-cachear', url, err))
            ))
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(
            names.filter((n) => n !== CACHE_NAME).map((n) => {
                console.log('[SW] Removendo cache antigo:', n);
                return caches.delete(n);
            })
        )).then(() => self.clients.claim())
    );
});

function isNavigationOrShell(request) {
    if (request.mode === 'navigate') return true;
    const url = new URL(request.url);
    return url.pathname.endsWith('.html') || url.pathname.endsWith('manifest.json');
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    if (isNavigationOrShell(request)) {
        // NETWORK-FIRST
        event.respondWith(
            fetch(request).then((response) => {
                if (response && response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            }).catch(() =>
                caches.match(request).then((cached) => cached || caches.match('./Simulador_Neuronio_Interativo.html'))
            )
        );
        return;
    }

    // CACHE-FIRST + revalidação em segundo plano (stale-while-revalidate)
    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request).then((response) => {
                if (response && response.ok && (response.type === 'basic' || response.type === 'cors')) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            }).catch(() => cached);
            return cached || network;
        })
    );
});
