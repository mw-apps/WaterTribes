/** @type {import("./node_modules/phaser.js")} */
/// <reference path="node_modules/phaser.js" />



class cPreload extends Phaser.Scene {
    constructor() {
        super('preloadScene');
        this.aaaaa = 'preloadScene';
    }

    preload() {
        //starticon
        this.load.image('icon', 'assets\\icons\\icon_128.png');
    }

    create() {
        //splash screen
        this.cameras.main.setBackgroundColor('0x7bb4f2');
        this.add.sprite(this.scale.width / 2, this.scale.height / 2, "icon");
        setTimeout(function () { this.loadData() }.bind(this), 200);
    }

    loadData() {
        //load the rest of the data
        //load image atlas
        this.load.atlas('images', 'assets/spritesheets/imageAtlas.png', 'assets/spritesheets/imageAtlas.json');
        this.load.image('background', 'assets/background.png');
        //load techTree
        this.load.json('gameData', 'assets/gameData.json');
        //load language
        this.load.json('language', 'assets/language.json');

        //audio will be loaded in sound.js

        //init settings right at the beginning
        var settings = JSON.parse(localStorage.getItem("settings"));
        if (settings == undefined) {
            settings = {};
            settings.waveMotion = true;
            settings.music = true;
            settings.sfx = true;
            settings.lang = "en";
            localStorage.setItem("settings", JSON.stringify(settings));
        }

        //delay the mainMenu
        setTimeout(function () {
            //start sound scene
            this.scene.start("mainMenu");
            this.scene.run("soundScene");   //run: If the given Scene is paused, it will resume it. If sleeping, it will wake it. If not running at all, it will be started.
        }.bind(this), 800);
    }
}
