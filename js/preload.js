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

        var gameData = this.cache.json.get('gameData');
        var newGameSettings = JSON.parse(localStorage.getItem("defaultNewGame"));
        if (newGameSettings == undefined) {
            newGameSettings = {};
            newGameSettings.type = "newGame";
            newGameSettings.tribes = [];
            newGameSettings.tribes.push({ name: "you", color: gameData.tribeColors[0], aiLevel: 3 });
            newGameSettings.tribes.push({ name: "CPU_1", color: gameData.tribeColors[1], aiLevel: 1 });
            newGameSettings.islands = 15;
            newGameSettings.sound = 0;
            localStorage.setItem("defaultNewGame", JSON.stringify(newGameSettings));
        }

        //ToDo
        if (game.debug) { localStorage.setItem("saveGame", '{"timestamp":1588016633225,"tribes":[{"name":"empty","nr":0,"color":"0xffffff","ai":false,"aiLevel":1,"islands":[]},{"name":"you","nr":1,"color":"0x0057e7","ai":3,"aiLevel":3,"islands":[0]},{"name":"CPU_1","nr":2,"color":"0xd62d20","ai":3,"aiLevel":1,"islands":[1]},{"name":"CPU_2","nr":3,"color":"0x008744","ai":3,"aiLevel":2,"islands":[2]},{"name":"CPU_3","nr":4,"color":"0xa200ff","ai":3,"aiLevel":3,"islands":[3]},{"name":"CPU_4","nr":5,"color":"0xf37735","ai":3,"aiLevel":3,"islands":[4]},{"name":"CPU_5","nr":6,"color":"0xffc425","ai":3,"aiLevel":3,"islands":[5,8]}],"islands":[{"name":"Kasenberg","buildState":19,"currentBuild":32,"currentBuildConstTime":513,"currentBuildConstMax":4000,"nr":0,"population":17.34,"populationMax":100,"rotation":-1.82,"scale":0.5,"sprite":"island5","tribe":1,"x":1281,"y":791},{"name":"Lugnvik","buildState":23,"currentBuild":64,"currentBuildConstTime":2348,"currentBuildConstMax":3500,"nr":1,"population":39.36,"populationMax":100,"rotation":-1.38,"scale":0.5,"sprite":"island4","tribe":2,"x":987,"y":1279},{"name":"Locknevi","buildState":19,"currentBuild":2048,"currentBuildConstTime":212,"currentBuildConstMax":4000,"nr":2,"population":16.97,"populationMax":100,"rotation":1.95,"scale":0.5,"sprite":"island5","tribe":3,"x":1616,"y":915},{"name":"Sunnestbyn","buildState":19,"currentBuild":2048,"currentBuildConstTime":469,"currentBuildConstMax":4000,"nr":3,"population":17.28,"populationMax":100,"rotation":-1.68,"scale":0.5,"sprite":"island1","tribe":4,"x":268,"y":523},{"name":"Peaboda","buildState":23,"currentBuild":32,"currentBuildConstTime":3588,"currentBuildConstMax":4000,"nr":4,"population":40.07,"populationMax":100,"rotation":-3.02,"scale":0.5,"sprite":"island4","tribe":5,"x":1074,"y":233},{"name":"Lystorp","buildState":19,"currentBuild":32,"currentBuildConstTime":536,"currentBuildConstMax":4000,"nr":5,"population":17.37,"populationMax":100,"rotation":1.29,"scale":0.5,"sprite":"island1","tribe":6,"x":1517,"y":1297},{"name":"Grinsbol","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":6,"population":0,"populationMax":120,"rotation":0.64,"scale":0.7,"sprite":"island3","tribe":0,"x":1516,"y":325},{"name":"Svaneholm","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":7,"population":0,"populationMax":80,"rotation":-1.63,"scale":0.30000000000000004,"sprite":"island1","tribe":0,"x":806,"y":530},{"name":"Yggersryd","buildState":0,"currentBuild":1,"currentBuildConstTime":1,"currentBuildConstMax":800,"nr":8,"population":16.02,"populationMax":80,"rotation":-1.89,"scale":0.30000000000000004,"sprite":"island0","tribe":6,"x":1375,"y":1503},{"name":"Getnabo","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":9,"population":0,"populationMax":80,"rotation":1.41,"scale":0.30000000000000004,"sprite":"island3","tribe":0,"x":1619,"y":662},{"name":"Lammhult","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":10,"population":0,"populationMax":90,"rotation":-0.28,"scale":0.4,"sprite":"island2","tribe":0,"x":1834,"y":1711},{"name":"Skensta","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":11,"population":0,"populationMax":90,"rotation":-1.7,"scale":0.4,"sprite":"island1","tribe":0,"x":679,"y":1322},{"name":"Pukulla","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":12,"population":0,"populationMax":111,"rotation":-1.23,"scale":0.6,"sprite":"island2","tribe":0,"x":1130,"y":1564},{"name":"Lomviken","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":13,"population":0,"populationMax":80,"rotation":-2.64,"scale":0.30000000000000004,"sprite":"island4","tribe":0,"x":824,"y":871},{"name":"Mjogaryd","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":14,"population":0,"populationMax":80,"rotation":-2.05,"scale":0.30000000000000004,"sprite":"island5","tribe":0,"x":396,"y":930}],"ships":[{"tribe":1,"speed":0.12,"attack":1,"defence":1,"dist":62,"population":16.05314032048614,"origin":0,"aim":9},{"tribe":4,"speed":0.12,"attack":1,"defence":1,"dist":52,"population":16.113570640406984,"origin":3,"aim":14}],"statistics":[{"buildingsMax":11,"islands":15,"populationMax":1411,"time":17059,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":20,"buildings":3},{"name":"CPU_1","aiLevel":1,"islands":1,"population":20,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":20,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":20,"buildings":3},{"name":"CPU_4","aiLevel":3,"islands":1,"population":20,"buildings":3},{"name":"CPU_5","aiLevel":3,"islands":1,"population":20,"buildings":3}],"type":"newIsland"},{"buildingsMax":11,"islands":15,"populationMax":1411,"time":18410,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":20.4,"buildings":3},{"name":"CPU_1","aiLevel":1,"islands":1,"population":20.4,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":20.4,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":20.4,"buildings":3},{"name":"CPU_4","aiLevel":3,"islands":1,"population":20.4,"buildings":3},{"name":"CPU_5","aiLevel":3,"islands":1,"population":20.4,"buildings":3}],"type":"pause"},{"buildingsMax":11,"islands":15,"populationMax":1411,"time":27310,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":20.4,"buildings":3},{"name":"CPU_1","aiLevel":1,"islands":1,"population":20.4,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":20.4,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":20.4,"buildings":3},{"name":"CPU_4","aiLevel":3,"islands":1,"population":20.4,"buildings":3},{"name":"CPU_5","aiLevel":3,"islands":1,"population":20.4,"buildings":3}],"type":"resume"},{"buildingsMax":11,"islands":15,"populationMax":1411,"time":36860,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":23.94,"buildings":3},{"name":"CPU_1","aiLevel":1,"islands":1,"population":23.94,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":23.94,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":23.94,"buildings":3},{"name":"CPU_4","aiLevel":3,"islands":1,"population":23.94,"buildings":3},{"name":"CPU_5","aiLevel":3,"islands":1,"population":23.94,"buildings":3}],"type":"pause"},{"buildingsMax":11,"islands":15,"populationMax":1411,"time":37042,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":23.94,"buildings":3},{"name":"CPU_1","aiLevel":1,"islands":1,"population":23.94,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":23.94,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":23.94,"buildings":3},{"name":"CPU_4","aiLevel":3,"islands":1,"population":23.94,"buildings":3},{"name":"CPU_5","aiLevel":3,"islands":1,"population":23.94,"buildings":3}],"type":"resume"},{"buildingsMax":22,"islands":15,"populationMax":1411,"time":53076,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":17.34,"buildings":3},{"name":"CPU_1","aiLevel":1,"islands":1,"population":39.36,"buildings":4},{"name":"CPU_2","aiLevel":2,"islands":1,"population":16.97,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":17.28,"buildings":3},{"name":"CPU_4","aiLevel":3,"islands":1,"population":40.07,"buildings":4},{"name":"CPU_5","aiLevel":3,"islands":2,"population":33.39,"buildings":3}],"type":"newIsland"}]}'); }

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

        //differ between mobile and desktop (action-button size)
        if (this.sys.game.device.os.android || this.sys.game.device.os.chromeOS || this.sys.game.device.os.iPad ||
            this.sys.game.device.os.iPhone || this.sys.game.device.os.kindle) {
            game.mobile = true;
        } else {
            game.mobile = false;
        }

        this.scene.run("soundScene");   //run: If the given Scene is paused, it will resume it. If sleeping, it will wake it. If not running at all, it will be started.
        //delay the mainMenu, to show the splash-screen
        setTimeout(function () {
            game.scale.scaleMode = Phaser.Scale.FIT;        //reset scaleMode for Chrome Bug
            this.scene.start("mainMenu");
        }.bind(this), 900);
    }
}
