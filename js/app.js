const version = '0.1.25';
const debug = false;

window.addEventListener('beforeinstallprompt', function (event) {
    //console.log('beforeinstallprompt', this);
    event.preventDefault();
    this.promptEvent = event;
});

window.onload = function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js?version' + encodeURIComponent(version), { scope: '.' }).then(function (registration) {
            //console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    } else {
        //console.log('ServiceWorker not supported...');
    }

    //PWA chrome debug: wait a few seconds until PWA is loaded
    window.setTimeout(function () {
        // game config
        var config = {
            parent: 'content',
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            type: Phaser.WEBGL,
            disableContextMenu: true,
            scene: [cPreload, cMainMenu, cGame, cMiniMap, cSound],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        }
        game = new Phaser.Game(config);
        game.version = version;
        game.debug = debug;
    }, 1000)
};
