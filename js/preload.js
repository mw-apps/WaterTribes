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
        if (game.debug) { localStorage.setItem("saveGame", '{"timestamp":1588667628890,"tribes":[{"name":"empty","nr":0,"color":"0xffffff","ai":false,"aiLevel":1,"islands":[]},{"name":"you","nr":1,"color":"0x0057e7","ai":0,"aiLevel":3,"islands":[0,11,14]},{"name":"CPU_1","nr":2,"color":"0xd62d20","ai":3,"aiLevel":1,"islands":[1,7]},{"name":"CPU_2","nr":3,"color":"0x008744","ai":3,"aiLevel":2,"islands":[2]},{"name":"CPU_3","nr":4,"color":"0xa200ff","ai":3,"aiLevel":3,"islands":[3]},{"name":"CPU_4","nr":5,"color":"0xf37735","ai":3,"aiLevel":3,"islands":[4,10]},{"name":"CPU_5","nr":6,"color":"0xffc425","ai":3,"aiLevel":3,"islands":[5,12]}],"islands":[{"name":"Drafall","buildState":23,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":4000,"nr":0,"population":24.05,"populationMax":100,"rotation":-0.04,"scale":0.5,"sprite":"island1","tribe":1,"x":261,"y":597},{"name":"Lugnvik","buildState":27,"currentBuild":2048,"currentBuildConstTime":872,"currentBuildConstMax":4000,"nr":1,"population":30.15,"populationMax":100,"rotation":2.98,"scale":0.5,"sprite":"island2","tribe":2,"x":1603,"y":1282},{"name":"Luckebo","buildState":27,"currentBuild":128,"currentBuildConstTime":1989,"currentBuildConstMax":6000,"nr":2,"population":30.94,"populationMax":100,"rotation":-1.07,"scale":0.5,"sprite":"island9","tribe":3,"x":1706,"y":1039},{"name":"Grinsbol","buildState":51,"currentBuild":4,"currentBuildConstTime":882,"currentBuildConstMax":2000,"nr":3,"population":24.19,"populationMax":100,"rotation":-2.73,"scale":0.5,"sprite":"island2","tribe":4,"x":1439,"y":958},{"name":"Repperda","buildState":23,"currentBuild":2048,"currentBuildConstTime":3777,"currentBuildConstMax":4000,"nr":4,"population":36.27,"populationMax":100,"rotation":1.6,"scale":0.5,"sprite":"island10","tribe":5,"x":1435,"y":666},{"name":"Striberg","buildState":87,"currentBuild":2048,"currentBuildConstTime":1824,"currentBuildConstMax":4000,"nr":5,"population":44.62,"populationMax":100,"rotation":-0.58,"scale":0.5,"sprite":"island6","tribe":6,"x":1223,"y":530},{"name":"Lammhult","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":6,"population":0,"populationMax":120,"rotation":2.23,"scale":0.7,"sprite":"island9","tribe":0,"x":555,"y":937},{"name":"Getnabo","buildState":0,"currentBuild":1,"currentBuildConstTime":435,"currentBuildConstMax":800,"nr":7,"population":17.68,"populationMax":100,"rotation":-1.24,"scale":0.5,"sprite":"island7","tribe":2,"x":1508,"y":1618},{"name":"Lomviken","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":8,"population":0,"populationMax":90,"rotation":2.79,"scale":0.4,"sprite":"island11","tribe":0,"x":390,"y":1380},{"name":"Arendal","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":9,"population":0,"populationMax":100,"rotation":-1.87,"scale":0.5,"sprite":"island6","tribe":0,"x":922,"y":1276},{"name":"Risbyn","buildState":0,"currentBuild":1,"currentBuildConstTime":249,"currentBuildConstMax":800,"nr":10,"population":1.22,"populationMax":100,"rotation":2.39,"scale":0.5,"sprite":"island8","tribe":5,"x":1805,"y":784},{"name":"Peaboda","buildState":0,"currentBuild":1,"currentBuildConstTime":356,"currentBuildConstMax":800,"nr":11,"population":21.81,"populationMax":90,"rotation":0.95,"scale":0.4,"sprite":"island5","tribe":1,"x":608,"y":385},{"name":"Kasenberg","buildState":0,"currentBuild":1,"currentBuildConstTime":324,"currentBuildConstMax":800,"nr":12,"population":22.84,"populationMax":111,"rotation":-1.98,"scale":0.6,"sprite":"island4","tribe":6,"x":884,"y":871},{"name":"Kruseboda","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":13,"population":0,"populationMax":80,"rotation":-1.84,"scale":0.30000000000000004,"sprite":"island1","tribe":0,"x":670,"y":1631},{"name":"Vendelsoe","buildState":0,"currentBuild":1,"currentBuildConstTime":1,"currentBuildConstMax":800,"nr":14,"population":18.64,"populationMax":100,"rotation":1.67,"scale":0.5,"sprite":"island6","tribe":1,"x":283,"y":252}],"ships":[{"tribe":1,"speed":0,"attack":1,"defence":1,"dist":0,"population":18.640382111282346,"origin":0,"aim":14},{"tribe":4,"speed":0.12,"attack":1.1,"defence":1,"dist":103,"population":22.406186210862252,"origin":3,"aim":2}],"statistics":[{"buildingsMax":11,"islands":15,"populationMax":1491,"time":437389,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":20,"buildings":3},{"name":"CPU_1","aiLevel":1,"islands":1,"population":20,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":20,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":20,"buildings":3},{"name":"CPU_4","aiLevel":3,"islands":1,"population":20,"buildings":3},{"name":"CPU_5","aiLevel":3,"islands":1,"population":20,"buildings":3}],"type":"newIsland"},{"buildingsMax":22,"islands":15,"populationMax":1491,"time":465289,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":21.83,"buildings":4},{"name":"CPU_1","aiLevel":1,"islands":1,"population":18.13,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":2,"population":34.74,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":34.89,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":1,"population":17.74,"buildings":3},{"name":"CPU_5","aiLevel":3,"islands":1,"population":42.43,"buildings":5}],"type":"newIsland"},{"buildingsMax":22,"islands":15,"populationMax":1491,"time":465772,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":22.38,"buildings":4},{"name":"CPU_1","aiLevel":1,"islands":2,"population":35.09,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":2,"population":35.05,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":35.2,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":1,"population":18.03,"buildings":3},{"name":"CPU_5","aiLevel":3,"islands":1,"population":42.99,"buildings":5}],"type":"newIsland"},{"buildingsMax":22,"islands":15,"populationMax":1491,"time":468689,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":25.53,"buildings":4},{"name":"CPU_1","aiLevel":1,"islands":2,"population":36.92,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":20.66,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":36.97,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":2,"population":20.58,"buildings":3},{"name":"CPU_5","aiLevel":3,"islands":1,"population":24.2,"buildings":4}],"type":"newIsland"},{"buildingsMax":22,"islands":15,"populationMax":1491,"time":469972,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":2,"population":47.86,"buildings":4},{"name":"CPU_1","aiLevel":1,"islands":2,"population":37.75,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":21.42,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":37.77,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":2,"population":21.44,"buildings":4},{"name":"CPU_5","aiLevel":3,"islands":1,"population":25.62,"buildings":4}],"type":"newIsland"},{"buildingsMax":22,"islands":15,"populationMax":1491,"time":470871,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":2,"population":48.91,"buildings":4},{"name":"CPU_1","aiLevel":1,"islands":2,"population":38.32,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":21.94,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":38.33,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":2,"population":22.44,"buildings":4},{"name":"CPU_5","aiLevel":3,"islands":2,"population":48.57,"buildings":4}],"type":"newIsland"},{"buildingsMax":22,"islands":15,"populationMax":1491,"time":471072,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":2,"population":49.14,"buildings":4},{"name":"CPU_1","aiLevel":1,"islands":2,"population":38.45,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":22.06,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":38.45,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":2,"population":22.65,"buildings":4},{"name":"CPU_5","aiLevel":3,"islands":2,"population":48.81,"buildings":4}],"type":"pause"},{"buildingsMax":22,"islands":15,"populationMax":1491,"time":476938,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":2,"population":49.14,"buildings":4},{"name":"CPU_1","aiLevel":1,"islands":2,"population":38.45,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":22.06,"buildings":3},{"name":"CPU_3","aiLevel":3,"islands":1,"population":38.45,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":2,"population":22.65,"buildings":4},{"name":"CPU_5","aiLevel":3,"islands":2,"population":48.81,"buildings":4}],"type":"resume"},{"buildingsMax":33,"islands":15,"populationMax":1491,"time":490638,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":3,"population":64.5,"buildings":4},{"name":"CPU_1","aiLevel":1,"islands":2,"population":47.83,"buildings":4},{"name":"CPU_2","aiLevel":2,"islands":1,"population":30.94,"buildings":4},{"name":"CPU_3","aiLevel":3,"islands":1,"population":24.19,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":2,"population":37.49,"buildings":4},{"name":"CPU_5","aiLevel":3,"islands":2,"population":67.46,"buildings":5}],"type":"newIsland"}]}'); }

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
