
window.addEventListener('beforeinstallprompt', function (event) {
    //console.log('beforeinstallprompt', this);
    event.preventDefault();
    this.promptEvent = event;
});

window.onload = function () {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js', { scope: '.' }).then(function (registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    }

    // game config
    var config = {
        parent: 'content',
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#000000',
        type: Phaser.WEBGL,
        scene: [cPreload, cMainMenu, cGame, cMiniMap, cSound],
        physics: {
            default: "arcade",
            arcade: {
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.NO_CENTER
        }
    }
    //game = new Phaser.Game(800, 500);
    game = new Phaser.Game(config);

};
