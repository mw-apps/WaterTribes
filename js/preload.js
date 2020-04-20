/** @type {import("../modules/phaser.js")} */
/// <reference path="../modules/phaser.js" />

class cPreload extends Phaser.Scene {
    constructor() {
        super('preloadScene');
        this.aaaaa = 'preloadScene';
    }

    preload() {
        //starticon
        this.load.image('icon', './assets/icons/icon_128.png');

        //load image atlas
        this.load.atlas('images', './assets/spritesheets/imageAtlas.png', './assets/spritesheets/imageAtlas.json');
        this.load.image('background', './assets/background.png');
        //load techTree
        this.load.json('gameData', './assets/gameData.json');
        //load language
        this.load.json('language', './assets/language.json');

        //audio will be loaded in sound.js, so we can start faster (slow on mobile device)
    }

    create() {
        //splash screen
        this.cameras.main.setBackgroundColor('0x7bb4f2');
        this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'icon');
        setTimeout(function () { this.loadData() }.bind(this), 100);
    }

    loadData() {
        //init local-storage settings right at the beginning
        var settings = JSON.parse(localStorage.getItem("settings"));
        if (settings == undefined) {
            settings = {};
            settings.waveMotion = true;
            settings.music = true;
            settings.sfx = true;
            settings.lang = "en";
            localStorage.setItem("settings", JSON.stringify(settings));
        }

        var newGameSettings = JSON.parse(localStorage.getItem("defaultNewGame"));
        if (newGameSettings == undefined) {
            newGameSettings = {};
            newGameSettings.tribes = [];
            newGameSettings.tribes.push({ name: "you", colorNr: 0, aiLevel: 3 });
            newGameSettings.tribes.push({ name: "CPU_1", colorNr: 1, aiLevel: 1 });
            newGameSettings.islands = 15;
            newGameSettings.sound = 0;
            newGameSettings.loadGame = 0;
            localStorage.setItem("defaultNewGame", JSON.stringify(newGameSettings));
        }

        var saveObject = JSON.parse(localStorage.getItem("stats"));
        if (saveObject == undefined) {
            saveObject = {
                gamesTotal: 0,
                enemiesTotal: 0,
                timeTotal: 0,
                win: 0,
                loss: 0,
                enemiesWonTotal: 0,
                enemiesLostTotal: 0,
                actualStreak: 0,
                longestWinStreak: 0,
                longestLossStreak: 0,
                fastestWin: 0,
                fastestLoss: 0,
                longestWin: 0,
                longestLoss: 0
            };
            localStorage.setItem("stats", JSON.stringify(saveObject));
        }
        
        //delay the mainMenu, to show the splash-screen
        setTimeout(function () {
            this.scene.run("soundScene");   //run: If the given Scene is paused, it will resume it. If sleeping, it will wake it. If not running at all, it will be started.
            this.scene.start("mainMenu");
        }.bind(this), 500);
    }
}
