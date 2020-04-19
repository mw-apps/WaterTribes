//workbox.precaching.precacheAndRoute(__precacheManifest)

var cacheName = 'watertribes-sw-v3';
var filesToCache = [
    './index.html',
    './favicon.png',
    './manifest.json',
    './sw.js',
    './assets/audio/sfx.json',
    './assets/audio/sfx.mp3',
    './assets/audio/epidemicsound_Deskant_-_Sins_of_the_Fathers.mp3',
    './assets/icons/icon_128.png',
    './assets/icons/icon_192.png',
    './assets/icons/icon_512.png',
    './assets/spritesheets/imageAtlas.json',
    './assets/spritesheets/imageAtlas.png',
    './assets/back.png',
    './assets/gameData.json',
    './assets/language.json',
    './css/index.css',
    './modules/phaser.min.js',
    './modules/rexgesturesplugin.min.js',
    './js/app.js',
    './js/game.js',
    './js/mainmenu.js',
    './js/minimap.js',
    './js/preload.js',
    './js/sound.js'
];

self.addEventListener('install', function (event) {
    console.log('sw install');
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('sw install: caching files', filesToCache);
            return cache.addAll(filesToCache)
                .then(() => {
                    console.log('sw install: All files are cached');
                    return self.skipWaiting(); //To forces the waiting service worker to become the active service worker
                }).catch(function (err) {
                    console.log(err);
                })
        })
    )
});


//FETCH EVENT: triggered for every request made by index page, after install.
self.addEventListener('fetch', (event) => {
    console.log('sw fetch', event.request.url);
    //Tell the browser to wait for newtwork request and respond with below
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        }).catch(function (error) {
            console.log('sw fetch error', error, event);
        })
    );
});

//ACTIVATE EVENT: triggered once after registering, also used to clean up caches.
self.addEventListener('activate', function (event) {
    console.log('sw activate');
    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    console.log('sw removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

