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
            newGameSettings.loadGame = 0;
            localStorage.setItem("defaultNewGame", JSON.stringify(newGameSettings));
        }

        //ToDo
        //localStorage.setItem("saveGame", '{"timestamp":1587820541448,"tribes":[{"name":"empty","nr":0,"color":"0xffffff","islands":[],"ai":false,"aiLevel":1,"aiCounter":0.165,"shipCounter":0,"multiAttack":{}},{"name":"you","nr":1,"color":"0x0057e7","islands":[0,9,6],"ai":2,"aiLevel":3,"aiCounter":-0.9615000000002523,"shipCounter":0,"multiAttack":{}},{"name":"CPU_1","nr":2,"color":"0xd62d20","islands":[1,8],"ai":3,"aiLevel":2,"aiCounter":1.5226500000002459,"shipCounter":0,"multiAttack":{}},{"name":"CPU_2","nr":3,"color":"0x008744","islands":[2],"ai":3,"aiLevel":2,"aiCounter":0.744350000000483,"shipCounter":0,"multiAttack":{}},{"name":"CPU_3","nr":4,"color":"0xa200ff","islands":[3,7],"ai":3,"aiLevel":2,"aiCounter":0.9026499999999418,"shipCounter":0,"multiAttack":{}},{"name":"CPU_4","nr":5,"color":"0xf37735","islands":[4,10],"ai":3,"aiLevel":3,"aiCounter":0.5167500000001888,"shipCounter":0,"multiAttack":{}},{"name":"CPU_5","nr":6,"color":"0xffc425","islands":[5],"ai":3,"aiLevel":3,"aiCounter":0.42545000000012634,"shipCounter":1,"multiAttack":{}}],"islands":[{"name":"Luckebo","buildState":23,"currentBuild":64,"currentBuildConstTime":1095.363754265432,"currentBuildConstMax":3500,"nr":0,"population":23.262445057569938,"populationMax":100,"rotation":-2.094395102393195,"scale":0.5,"sprite":"island4","tribe":1,"x":1315,"y":1127},{"name":"Sunnestbyn","buildState":27,"currentBuild":2048,"currentBuildConstTime":1915.7898142472143,"currentBuildConstMax":4000,"nr":1,"population":30.774727062427022,"populationMax":100,"rotation":-2.111848394913139,"scale":0.5,"sprite":"island0","tribe":2,"x":243,"y":1170},{"name":"Kasenberg","buildState":51,"currentBuild":256,"currentBuildConstTime":6494.5258777463305,"currentBuildConstMax":7000,"nr":2,"population":47.05538137710391,"populationMax":100,"rotation":-2.443460952792061,"scale":0.5,"sprite":"island0","tribe":3,"x":480,"y":594},{"name":"Lystorp","buildState":27,"currentBuild":128,"currentBuildConstTime":2339.525485018087,"currentBuildConstMax":6000,"nr":3,"population":28.16899137629019,"populationMax":100,"rotation":-2.8099800957108707,"scale":0.5,"sprite":"island5","tribe":4,"x":1057,"y":499},{"name":"Ovanmo","buildState":87,"currentBuild":2048,"currentBuildConstTime":1960.608491094864,"currentBuildConstMax":4000,"nr":4,"population":45.258997032572786,"populationMax":100,"rotation":-0.3665191429188095,"scale":0.5,"sprite":"island5","tribe":5,"x":1745,"y":613},{"name":"Lomviken","buildState":2099,"currentBuild":8,"currentBuildConstTime":2412.212288978298,"currentBuildConstMax":3000,"nr":5,"population":47.05538137710391,"populationMax":100,"rotation":2.635447170511437,"scale":0.5,"sprite":"island1","tribe":6,"x":1308,"y":552},{"name":"Drafall","buildState":0,"currentBuild":1,"currentBuildConstTime":1.156435427912996,"currentBuildConstMax":800,"nr":6,"population":18.772251349559518,"populationMax":120,"rotation":1.8849555921538759,"scale":0.7,"sprite":"island1","tribe":1,"x":1223,"y":1584},{"name":"Repperda","buildState":0,"currentBuild":1,"currentBuildConstTime":158.36775896746246,"currentBuildConstMax":800,"nr":7,"population":22.02702831209053,"populationMax":100,"rotation":-2.827433388230814,"scale":0.5,"sprite":"island2","tribe":4,"x":765,"y":512},{"name":"Dragedet","buildState":0,"currentBuild":1,"currentBuildConstTime":425.6894057527081,"currentBuildConstMax":800,"nr":8,"population":17.439664529044183,"populationMax":100,"rotation":1.6406094968746707,"scale":0.5,"sprite":"island4","tribe":2,"x":388,"y":1618},{"name":"Risbyn","buildState":0,"currentBuild":1,"currentBuildConstTime":371.2750165336576,"currentBuildConstMax":800,"nr":9,"population":22.390166728277283,"populationMax":120,"rotation":-0.8901179185171078,"scale":0.7,"sprite":"island3","tribe":1,"x":1454,"y":1440},{"name":"Lugnvik","buildState":0,"currentBuild":1,"currentBuildConstTime":344.9080537176096,"currentBuildConstMax":800,"nr":10,"population":23.195631732782033,"populationMax":120,"rotation":-1.3613568165555776,"scale":0.7,"sprite":"island1","tribe":5,"x":1467,"y":910},{"name":"Getnabo","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":11,"population":0,"populationMax":90,"rotation":2.391101075232232,"scale":0.4,"sprite":"island3","tribe":0,"x":929,"y":1480},{"name":"Kruseboda","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":12,"population":0,"populationMax":80,"rotation":2.7576202181510396,"scale":0.30000000000000004,"sprite":"island1","tribe":0,"x":544,"y":339},{"name":"Striberg","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":13,"population":0,"populationMax":120,"rotation":0.2967059728390353,"scale":0.7,"sprite":"island5","tribe":0,"x":640,"y":1640},{"name":"Lustorp","buildState":0,"currentBuild":0,"currentBuildConstTime":0,"currentBuildConstMax":0,"nr":14,"population":0,"populationMax":90,"rotation":-1.7453292519943293,"scale":0.4,"sprite":"island4","tribe":0,"x":762,"y":1067}],"statistics":[{"buildingsMax":11,"islands":15,"populationMax":1540,"time":7785,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":20,"buildings":3},{"name":"CPU_1","aiLevel":2,"islands":1,"population":20,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":20,"buildings":3},{"name":"CPU_3","aiLevel":2,"islands":1,"population":20,"buildings":3},{"name":"CPU_4","aiLevel":3,"islands":1,"population":20,"buildings":3},{"name":"CPU_5","aiLevel":3,"islands":1,"population":20,"buildings":3}]},{"buildingsMax":22,"islands":15,"populationMax":1540,"time":34835,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":1,"population":22.150547358248055,"buildings":4},{"name":"CPU_1","aiLevel":2,"islands":2,"population":35.59941304055329,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":35.75321148937382,"buildings":4},{"name":"CPU_3","aiLevel":2,"islands":1,"population":37.00352680555573,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":1,"population":44.217943903298895,"buildings":5},{"name":"CPU_5","aiLevel":3,"islands":1,"population":35.75321148937382,"buildings":4}]},{"buildingsMax":22,"islands":15,"populationMax":1540,"time":37368,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":2,"population":46.260057624438275,"buildings":4},{"name":"CPU_1","aiLevel":2,"islands":2,"population":37.181282391589335,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":37.28572902347239,"buildings":4},{"name":"CPU_3","aiLevel":2,"islands":1,"population":38.79292473828515,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":1,"population":24.695555875429925,"buildings":4},{"name":"CPU_5","aiLevel":3,"islands":1,"population":37.28572902347239,"buildings":4}]},{"buildingsMax":22,"islands":15,"populationMax":1540,"time":38585,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":2,"population":47.644673407458924,"buildings":4},{"name":"CPU_1","aiLevel":2,"islands":2,"population":37.943393531980675,"buildings":3},{"name":"CPU_2","aiLevel":2,"islands":1,"population":38.0240635040138,"buildings":4},{"name":"CPU_3","aiLevel":2,"islands":1,"population":39.65501875270752,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":2,"population":48.25438432365168,"buildings":4},{"name":"CPU_5","aiLevel":3,"islands":1,"population":38.0240635040138,"buildings":4}]},{"buildingsMax":22,"islands":15,"populationMax":1540,"time":46584,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":2,"population":56.960853083786205,"buildings":4},{"name":"CPU_1","aiLevel":2,"islands":2,"population":43.36700119114311,"buildings":4},{"name":"CPU_2","aiLevel":2,"islands":1,"population":42.9918363448995,"buildings":4},{"name":"CPU_3","aiLevel":2,"islands":2,"population":45.323231721943216,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":2,"population":57.58039733993239,"buildings":5},{"name":"CPU_5","aiLevel":3,"islands":1,"population":42.9918363448995,"buildings":5}]},{"buildingsMax":33,"islands":15,"populationMax":1540,"time":53051,"tribes":[{"name":"empty","aiLevel":1,"islands":0,"population":0,"buildings":0},{"name":"you","aiLevel":3,"islands":3,"population":64.42486313540674,"buildings":4},{"name":"CPU_1","aiLevel":2,"islands":2,"population":48.214391591471205,"buildings":4},{"name":"CPU_2","aiLevel":2,"islands":1,"population":47.05538137710391,"buildings":4},{"name":"CPU_3","aiLevel":2,"islands":2,"population":50.196019688380716,"buildings":4},{"name":"CPU_4","aiLevel":3,"islands":2,"population":68.45462876535481,"buildings":5},{"name":"CPU_5","aiLevel":3,"islands":1,"population":47.05538137710391,"buildings":5}]}]}');

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

        this.scene.run("soundScene");   //run: If the given Scene is paused, it will resume it. If sleeping, it will wake it. If not running at all, it will be started.
        //delay the mainMenu, to show the splash-screen
        setTimeout(function () {
            game.scale.scaleMode = Phaser.Scale.FIT;        //reset scaleMode for Chrome Bug
            this.scene.start("mainMenu");
        }.bind(this), 900);
    }
}
