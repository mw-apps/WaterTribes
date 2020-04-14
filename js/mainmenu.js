/** @type {import("./node_modules/phaser.js")} */
/// <reference path="node_modules/phaser.js" />

class cMainMenu extends Phaser.Scene {
    constructor() {
        super("mainMenu");
        this.aaaaa = "mainMenu";
        this.infoContainer;
        this.spriteGroup;
        this.textGroup;
        this.plate;
        this.mobile = false;
        this.gameData = {};
        this.newGameSettings = {};
        this.lang = {};
        this.settings = {};
    }

    create() {
        // create main menu text and images -
        //set the bounds of the world
        var aspectRatio = game.scale.height / game.scale.width;
        var tWidth = Math.sqrt(2000000 / aspectRatio);
        var tHeight = tWidth * aspectRatio;
        game.scale.resize(tWidth, tHeight);
        this.cameras.main.setBounds(0, 0, tWidth, tHeight);
        //load the gameData, language and newGameSettings
        this.gameData = this.cache.json.get('gameData');    //json-parce(json.stringify -> copy of the original
        this.lang = this.cache.json.get('language');
        this.settings = JSON.parse(localStorage.getItem("settings"));
        //start settings
        this.newGameSettings = JSON.parse(localStorage.getItem("defaultNewGame"));
        //backgroundimage
        var background = this.add.sprite(-150, 0, "background");
        background.setOrigin(0);
        if (background.width - 200 < tWidth) { background.scale = (tWidth / (background.width - 200) * 2); }
        if (background.height - 200 < tHeight) { background.scale = (tHeight / (background.height - 200) * 2); }
        //init groups
        this.infoContainer = this.add.container();
        this.spriteGroup = this.add.group();
        this.textGroup = this.add.group();
        this.infoContainer.colorpickerNewGroup = this.add.group();
        this.plate = this.add.graphics();
        this.infoContainer.add(this.plate);
        setTimeout(function () { this.setInfoPlate({ type: "menu" }); }.bind(this), 200);
        //PWA support
        if (this.sys.game.device.os.android || this.sys.game.device.os.chromeOS || this.sys.game.device.os.iPad ||
            this.sys.game.device.os.iPhone || this.sys.game.device.os.kindle ||
            this.sys.game.device.browser.chrome || this.sys.game.device.browser.mobileSafari) {
            this.mobile = true;
            //check if App is running as PWA via query string parameter
            var urlParams;
            var match,
                pl = /\+/g,  // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                query = window.location.search.substring(1);

            urlParams = {};
            while (match = search.exec(query)) {
                urlParams[decode(match[1])] = decode(match[2]);
            }
            //console.log("check urlParams", urlParams, window.location.search.substring(1), window.location);

            if (urlParams["mode"] == "PWA") {
                console.log("This is running as PWA.");
            } else {
                //PWA button
                var pwaButton = this.newSprite(tWidth / 2, -150, "pwa", 0, "images", "emptyBubble", 0.5, false);
                pwaButton.scale = 3;
                pwaButton.on('pointerup', function () {
                    if (window.promptEvent) { window.promptEvent.prompt(); }
                    pwaButton.clearTint();
                    console.log("os:", this.sys.game.device.os, "browser:", this.sys.game.device.browser);
                }.bind(this));
                var pwaText = this.newText(tWidth / 2, -100, this.lang.menu_pwaBubble[this.settings.lang], { font: '30px Arial', fill: "black" }, 0.5, false);
                this.tweens.add({
                    targets: [pwaButton, pwaText],
                    y: pwaButton.displayHeight / 2 - 50,
                    ease: 'Back',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
                    duration: 2000,
                    repeat: 0,            // -1: infinity
                    yoyo: false,
                    delay: 500
                });
                console.log("pwa_support");
            }
        }
    }

    setInfoPlate(data) {
        //set the width and height
        switch (data.type) {
            case 'menu':
                data.width = 500;
                data.height = 530;
                data.backTarget = "";
                break;
            case "newGame":
                data.width = 700;
                data.height = 800;
                data.backTarget = "menu";
                break;
            case "options":
                data.width = 600;
                data.height = 670;
                data.backTarget = "menu";
                break;
            case 'statistics':
                data.width = 700;
                data.height = 670;
                data.backTarget = "menu";
                break;
            case 'credits':
                data.width = 700;
                data.height = 370;
                data.backTarget = "menu";
                break;
            default:
        }
        var x = this.scale.width + 100;  //startposition outside of the screen
        var y = this.scale.height / 2 - data.height / 2 - 20;   //in the middle of the y-axis

        this.plate.visible = true;
        this.plate.active = true;
        //Background
        this.plate.fillStyle('0xd2e0f4', 1);
        this.plate.fillRect(x, y, data.width, data.height);
        //Border
        //this.plate.lineStyle(3, '0x7bb4f2', 1); //blue
        //this.plate.strokeRect(x, y, data.width, data.height);
        this.plate.lineStyle(5, '0xe2f1ff', 1); //white
        this.plate.strokeRect(x + 2, y + 2, data.width - 4, data.height - 4);
        //separator
        this.plate.fillStyle('0x7bb4f2', 1);
        this.plate.fillRoundedRect(x + 40, y + 60, data.width, 8, 4);
        //back button
        var button = this.newSprite(x, y + data.height / 2 - 50, "plateBack", 0, "images", "back", 0.1);
        if (this.mobile == true) { button.scale = 1.7; } else { button.scale = 1.2 }
        button.on('pointerup', function (button, data) {
            this.tweenInfoPlate(-data.width, 700);
            this.time.addEvent({
                delay: 700, callback: function () {
                    this.removeInfoPlate();
                    this.setInfoPlate({ type: data.backTarget });
                }, callbackScope: this
            });
        }.bind(this, button, data));
        if (data.backTarget == "") {     //load backbutton and hide it, otherwise the backbutton would be too wide
            button.visible = false;     //i guess because the texture before is 1x1 (lxb)
        } else {
            button.visible = true;
        }

        //Header
        switch (data.type) {
            case 'menu': var tHeader = this.lang.menu_header[this.settings.lang]; break;
            case "newGame": var tHeader = this.lang.menu_nG_header[this.settings.lang]; break;
            case "options": var tHeader = this.lang.menu_o_header[this.settings.lang]; break;
            case 'statistics': var tHeader = this.lang.menu_s_header[this.settings.lang]; break;
            case 'credits': var tHeader = this.lang.menu_c_header[this.settings.lang]; break;
            case 'loadGame': var tHeader = ""; break;
            default: console.log("setInfoPlate data.type error", data.type);
        }
        if (this.mobile == true) { var tFont = { font: 'bold 45px Arial', fill: "black" } } else { var tFont = { font: 'bold 35px Arial', fill: "black" } }
        this.newText(x + 40, y + 18, tHeader, tFont, 0);

        //differ between the different types of information
        switch (data.type) {
            case 'menu':
                //different buttons
                var subTypeText;
                var subIcon;
                var subText;
                var i;
                var tX;
                for (i = 0; i <= 4; i++) {
                    switch (i) {
                        case 0: subTypeText = "newGame"; subIcon = "anchor"; subText = this.lang.menu_newGame[this.settings.lang]; break;
                        case 1: subTypeText = "loadGame"; subIcon = "load"; subText = this.lang.menu_loadGame[this.settings.lang]; break;
                        case 2: subTypeText = "options"; subIcon = "options"; subText = this.lang.menu_options[this.settings.lang]; break;
                        case 3: subTypeText = "statistics"; subIcon = "medal"; subText = this.lang.menu_statistics[this.settings.lang]; break;
                        case 4: subTypeText = "credits"; subIcon = "credits"; subText = this.lang.menu_credits[this.settings.lang]; break;
                    }
                    if (i % 2) { tX = 75 } else { tX = -75 }
                    var button = this.newSprite(x + 50 + (data.width - 200) / 2 - tX, y + 130 + i * 80, "button", i, "images", subIcon, 0.5);
                    button.scale = 0.7;
                    button.on('pointerup', function (button, data, subTypeText) {
                        this.tweenInfoPlate(-data.width, 700);
                        this.time.addEvent({
                            delay: 700, callback: function () {
                                this.removeInfoPlate();
                                this.setInfoPlate({ type: subTypeText });
                            }, callbackScope: this
                        });
                    }.bind(this, button, data, subTypeText));
                    //ButtonText
                    if (this.mobile == true) { var tFont = { font: 'bold 40px Arial', fill: "black" } } else { var tFont = { font: 'bold 30px Arial', fill: "black" } }
                    this.newText(x + 50 + (data.width - 200) / 2 + tX, y + 130 + i * 80, subText, tFont, 0.5);
                }
                break;
            case 'newGame':
                //Text
                if (this.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: "black" } } else { var tFont = { font: 'bold 28px Arial', fill: "black" } };
                this.newText(x + 80, y + 80, this.lang.menu_nG_player[this.settings.lang], tFont, 0);
                this.newText(x + 280, y + 80, this.lang.menu_nG_color[this.settings.lang], tFont, 0);
                this.newText(x + 480, y + 80, this.lang.menu_nG_level[this.settings.lang], tFont, 0);
                //separator
                this.plate.fillStyle('0x7bb4f2', 1);
                this.plate.fillRoundedRect(x + 80, y + 120, data.width, 6, 2);

                //add CPU-Player
                for (i = 0; i < this.newGameSettings.tribes.length; i++) {
                    this.newGameAddPlayer(x, y, i, 70);
                }
                //Text
                //if (this.mobile == true) { var tFont = { font: 'bold 35x Arial', fill: "black" } } else { var tFont = { font: 'bold 28px Arial', fill: "black" } };
                this.newText(x + 80, y + 140 + this.gameData.tribeMax * 70, this.lang.menu_nG_islands[this.settings.lang], tFont, 0);
                //separator
                this.plate.fillStyle('0x7bb4f2', 1);
                this.plate.fillRoundedRect(x + 80, y + 170 + this.gameData.tribeMax * 70, data.width, 6, 2);

                //slider
                this.plate.fillStyle('0x7bb4f2', 1);
                this.plate.fillRoundedRect(x + 80, y + 220 + this.gameData.tribeMax * 70, 300, 4, 2);
                var sliderHitArea = this.newSprite(x + 80, y + 200 + this.gameData.tribeMax * 70, "sliderBackground", 0, "images", 'emptyBubble', 0.0);
                sliderHitArea.alpha = 0.01;
                sliderHitArea.displayWidth = 300;
                sliderHitArea.displayHeight = 40;
                sliderHitArea.setInteractive();
                sliderHitArea.on('pointerup', function (pointer, localX, localY, event) {
                    //console.log("pUp", x, pointer.upX, sliderHitArea.x, pointer, this.width, localX);
                    slider.textObj.text = (this.scene.newGameSettings.tribes.length + (this.scene.gameData.islandsMax - this.scene.newGameSettings.tribes.length) / this.width * localX).toFixed(0);
                    this.scene.newGameSettings.islands = slider.textObj.text;
                    slider.calcNewPosition();
                });
                //if (this.mobile == true) { var tFont = { font: 'bold 35x Arial', fill: "black" } } else { var tFont = { font: 'bold 28px Arial', fill: "black" } };
                var sliderText = this.newText(x + 420, y + 220 + this.gameData.tribeMax * 70, this.newGameSettings.islands, tFont, 0.5);
                var slider = this.newSprite(x + 80, y + 220 + this.gameData.tribeMax * 70, "slider", 0, "images", 'emptyBubble', 0.5);
                if (this.mobile == true) { slider.scale = 0.5; } else { slider.scale = 0.3; }
                slider.textObj = sliderText;
                this.input.setDraggable(slider);
                slider.input.draggable = true;
                slider.slideMin = x + 80;
                slider.slideMax = slider.slideMin + 300;
                slider.calcNewPosition = function () {
                    this.x = this.slideMin + (this.textObj.text - this.scene.newGameSettings.tribes.length) * (this.slideMax - this.slideMin) / (this.scene.gameData.islandsMax - this.scene.newGameSettings.tribes.length);
                }
                slider.on('dragstart', function (pointer, dragX, dragY) {
                    this.dragstart = this.x;
                });
                slider.on('drag', function (pointer, dragX, dragY) {
                    dragX = (dragX - this.dragstart) / this.scene.cameras.main.zoom;
                    if (this.dragstart + dragX > this.slideMax) { dragX = this.slideMax - this.dragstart; }
                    if (this.dragstart + dragX < this.slideMin) { dragX = this.slideMin - this.dragstart; }
                    this.x = this.dragstart + dragX;
                    this.textObj.text = (this.scene.newGameSettings.tribes.length + (this.scene.gameData.islandsMax - this.scene.newGameSettings.tribes.length) / (this.slideMax - this.slideMin) * (this.x - this.slideMin)).toFixed(0);
                });
                slider.on('dragend', function (pointer, dragX, dragY, dropped) {
                    this.scene.newGameSettings.islands = this.textObj.text;
                });
                slider.calcNewPosition();

                //remove last enemy
                var remEnemy = this.newSprite(x + 70, y + 165 + (i - 1) * 70, "removeEnemy", 0, "images", "remove", 0.5);
                if (this.mobile == true) { remEnemy.scale = 0.6; } else { remEnemy.scale = 0.4; }
                remEnemy.on('pointerup', function (remEnemy, slider) {
                    this.newGameSettings.tribes.splice(this.newGameSettings.tribes.length - 1, 1);
                    //console.log("remEnemy", this, remEnemy, this.newGameSettings.tribes);
                    for (i = 0; i < this.infoContainer.list.length; i++) {
                        switch (this.infoContainer.list[i].name) {
                            case "pName":
                                if (this.infoContainer.list[i].nr == this.newGameSettings.tribes.length) {
                                    this.textGroup.killAndHide(this.infoContainer.list[i]);
                                }
                                break;
                            case "colorpicker":
                            case "aiLevel":
                                if (this.infoContainer.list[i].nr == this.newGameSettings.tribes.length) {
                                    this.spriteGroup.killAndHide(this.infoContainer.list[i]);
                                    this.infoContainer.list[i].clearTint();
                                    this.infoContainer.list[i].scale = 1;
                                }
                                break;
                        }
                    }
                    this.tweens.add({
                        targets: remEnemy,
                        y: y + 165 + this.newGameSettings.tribes.length * 70 - 70,
                        ease: 'Sine.easeInOut',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
                        duration: 500,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });
                    this.tweens.add({
                        targets: remEnemy.addEnemy,
                        y: y + 165 + this.newGameSettings.tribes.length * 70,
                        ease: 'Sine.easeInOut',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
                        duration: 500,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });
                    if (this.newGameSettings.tribes.length == 2) { remEnemy.visible = false }
                    remEnemy.addEnemy.visible = true;
                    slider.calcNewPosition();
                }.bind(this, remEnemy, slider));
                if (this.newGameSettings.tribes.length == 2) { remEnemy.visible = false } else { remEnemy.visible = true }
                //add enemy
                var addEnemy = this.newSprite(x + 70, y + 165 + i * 70, "addEnemy", 0, "images", "add", 0.5);
                if (this.mobile == true) { addEnemy.scale = 0.6; } else { addEnemy.scale = 0.4; }
                addEnemy.on('pointerup', function (addEnemy, slider) {
                    var i = this.newGameSettings.tribes.length;
                    //console.log("addEnemy", this, addEnemy, this.newGameSettings.tribes, this.gameData.tribeMax);
                    this.newGameSettings.tribes.push({ name: "CPU_" + i, colorNr: i, aiLevel: 1 });
                    this.newGameAddPlayer(x, y, i, 70);
                    this.tweens.add({
                        targets: addEnemy,
                        y: y + 165 + this.newGameSettings.tribes.length * 70,
                        ease: 'Sine.easeInOut',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
                        duration: 500,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });
                    this.tweens.add({
                        targets: addEnemy.remEnemy,
                        y: y + 165 + this.newGameSettings.tribes.length * 70 - 70,
                        ease: 'Sine.easeInOut',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
                        duration: 500,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });
                    if (i > 1) { addEnemy.remEnemy.visible = true }
                    if (i >= this.gameData.tribeMax - 1) { addEnemy.visible = false }
                    if (slider.textObj.text < this.newGameSettings.tribes.length) { slider.textObj.text = this.newGameSettings.tribes.length };
                    slider.calcNewPosition();
                }.bind(this, addEnemy, slider));
                remEnemy.addEnemy = addEnemy;
                addEnemy.remEnemy = remEnemy;
                if (this.newGameSettings.tribes.length == this.gameData.tribeMax) { addEnemy.visible = false } else { addEnemy.visible = true }


                //start new Game
                var button = this.newSprite(x + 100, y + data.height - 60, "startGame", 0, "images", 'anchor', 0.5);
                if (this.mobile == true) { button.scale = 0.8; } else { button.scale = 0.6; }
                button.on('pointerup', function (button, data) {
                    game.events.emit('toSoundMsg', { type: 'startGame' });
                    localStorage.setItem("defaultNewGame", JSON.stringify(this.newGameSettings));
                    this.scene.start("playGame", this.newGameSettings);
                    this.scene.stop("mainMenu");
                }.bind(this, button, data));
                //StartGame
                if (this.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: "black" } } else { var tFont = { font: 'bold 28px Arial', fill: "black" } };
                this.newText(x + 230, y + data.height - 60, this.lang.menu_nG_start[this.settings.lang], tFont, 0.5);
                break;
            case 'statistics':
                //Text
                var saveObject = JSON.parse(localStorage.getItem("stats"));

                if (saveObject == undefined) {
                    var saveObject = {
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
                var gInfo =
                    this.lang.menu_s_gamesTotal[this.settings.lang] + ": " + saveObject.gamesTotal + "\n" +
                    this.lang.menu_s_enemiesTotal[this.settings.lang] + ": " + saveObject.enemiesTotal + "\n" +
                    this.lang.menu_s_timeTotal[this.settings.lang] + ": " + (saveObject.timeTotal / 60000).toFixed(2) + "min\n" +
                    this.lang.menu_s_win[this.settings.lang] + ": " + saveObject.win + "\n" +
                    this.lang.menu_s_loss[this.settings.lang] + ": " + saveObject.loss + "\n" +
                    this.lang.menu_s_enemiesWonTotal[this.settings.lang] + ": " + saveObject.enemiesWonTotal + "\n" +
                    this.lang.menu_s_enemiesLostTotal[this.settings.lang] + ": " + saveObject.enemiesLostTotal + "\n" +
                    this.lang.menu_s_longestWinStreak[this.settings.lang] + ": " + saveObject.longestWinStreak + "\n" +
                    this.lang.menu_s_longestLossStreak[this.settings.lang] + ": " + saveObject.longestLossStreak + "\n" +
                    this.lang.menu_s_actualStreak[this.settings.lang] + ": " + saveObject.actualStreak + "\n" +
                    this.lang.menu_s_fastestWin[this.settings.lang] + ": " + (saveObject.fastestWin / 60000).toFixed(2) + "min\n" +
                    this.lang.menu_s_fastestLoss[this.settings.lang] + ": " + (saveObject.fastestLoss / 60000).toFixed(2) + "min\n" +
                    this.lang.menu_s_longestWin[this.settings.lang] + ": " + (saveObject.longestWin / 60000).toFixed(2) + "min\n" +
                    this.lang.menu_s_longestLoss[this.settings.lang] + ": " + (saveObject.longestLoss / 60000).toFixed(2) + "min";

                if (this.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: "black" } } else { var tFont = { font: 'bold 28px Arial', fill: "black" } };
                this.newText(x + 60, y + 90, gInfo, tFont, 0);
                break;
            case 'options':
                if (this.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: "black" } } else { var tFont = { font: 'bold 28px Arial', fill: "black" } };
                //tweenWaveMotion
                var button = this.newSprite(x + 100, y + 120, "options", 0, "images", 'wave', 0.5);
                if (this.mobile == true) { button.scale = 0.7; } else { button.scale = 0.5; }
                button.on('pointerup', function () {
                    this.scene.settings.waveMotion = !this.scene.settings.waveMotion;
                    localStorage.setItem("settings", JSON.stringify(this.scene.settings));
                    if (this.scene.settings.waveMotion) {
                        this.setTint("0xed5400");
                    } else {
                        this.clearTint();
                    }
                });
                if (this.settings.waveMotion) { button.setTint("0xed5400"); }
                this.newText(x + 150, y + 100, this.lang.menu_o_tweenWave[this.settings.lang], tFont, 0);
                //sound
                this.newText(x + 80, y + 180, this.lang.menu_o_sound[this.settings.lang], tFont, 0);
                //separator
                this.plate.fillStyle('0x7bb4f2', 1);
                this.plate.fillRoundedRect(x + 80, y + 215, data.width, 6, 2);
                //music
                var button = this.newSprite(x + 100, y + 280, "options", 1, "images", 'sound', 0.5);
                if (this.mobile == true) { button.scale = 0.7; } else { button.scale = 0.5; }
                button.on('pointerup', function () {
                    this.scene.settings.music = !this.scene.settings.music;
                    localStorage.setItem("settings", JSON.stringify(this.scene.settings));
                    game.events.emit('toSoundMsg', { type: 'updateSettings' });
                    if (this.scene.settings.music) {
                        this.setTint("0xed5400");
                    } else {
                        this.clearTint();
                    }
                });
                if (this.settings.music) { button.setTint("0xed5400"); }
                this.newText(x + 150, y + 260, this.lang.menu_o_music[this.settings.lang], tFont, 0);
                //sfx
                var button = this.newSprite(x + 100, y + 360, "options", 2, "images", 'sound', 0.5);
                if (this.mobile == true) { button.scale = 0.7; } else { button.scale = 0.5; }
                button.on('pointerup', function () {
                    this.scene.settings.sfx = !this.scene.settings.sfx;
                    localStorage.setItem("settings", JSON.stringify(this.scene.settings));
                    game.events.emit('toSoundMsg', { type: 'updateSettings' });
                    if (this.scene.settings.sfx) {
                        this.setTint("0xed5400");
                    } else {
                        this.clearTint();
                    }
                });
                if (this.settings.sfx) { button.setTint("0xed5400"); }
                this.newText(x + 150, y + 340, this.lang.menu_o_sfx[this.settings.lang], tFont, 0);
                //language
                this.newText(x + 80, y + 420, this.lang.menu_o_language[this.settings.lang], tFont, 0);
                //separator
                this.plate.fillStyle('0x7bb4f2', 1);
                this.plate.fillRoundedRect(x + 80, y + 455, data.width, 6, 2);
                //en
                var button = this.newSprite(x + 100, y + 520, "optionsLanguage", 0, "images", 'emptyBubble', 0.5);
                if (this.mobile == true) { button.scale = 0.7; } else { button.scale = 0.5; }
                button.on('pointerup', function () {
                    this.scene.settings.lang = "en";
                    localStorage.setItem("settings", JSON.stringify(this.scene.settings));
                    for (var i = 0; i < this.scene.spriteGroup.children.entries.length; i++) {
                        if (this.scene.spriteGroup.children.entries[i].name == "optionsLanguage") {
                            this.scene.spriteGroup.children.entries[i].clearTint();
                        }
                    }
                    this.setTint("0xed5400");
                });
                if (this.settings.lang == "en") { button.setTint("0xed5400"); }
                this.newText(x + 150, y + 500, this.lang.menu_o_lang0[this.settings.lang], tFont, 0);
                //de
                var button = this.newSprite(x + 100, y + 600, "optionsLanguage", 1, "images", 'emptyBubble', 0.5);
                if (this.mobile == true) { button.scale = 0.7; } else { button.scale = 0.5; }
                button.on('pointerup', function () {
                    this.scene.settings.lang = "de";
                    localStorage.setItem("settings", JSON.stringify(this.scene.settings));
                    for (var i = 0; i < this.scene.spriteGroup.children.entries.length; i++) {
                        if (this.scene.spriteGroup.children.entries[i].name == "optionsLanguage") {
                            this.scene.spriteGroup.children.entries[i].clearTint();
                        }
                    }
                    this.setTint("0xed5400");
                });
                if (this.settings.lang == "de") { button.setTint("0xed5400"); }
                this.newText(x + 150, y + 580, this.lang.menu_o_lang1[this.settings.lang], tFont, 0);
                break;
            case 'credits':
                //Text
                if (this.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: "black" } } else { var tFont = { font: 'bold 28px Arial', fill: "black" } };
                this.newText(x + 60, y + 90, this.lang.menu_c_text[this.settings.lang], tFont, 0);
                break;
            case 'loadGame':
                this.removeInfoPlate();
                this.setInfoPlate({ type: "menu" });
                return;
                break;
            default:
                console.log("switch_error", data);
        }
        //when everything is created, add a smooth tween to show the data
        this.tweenInfoPlate(data.width, 1000);
    }

    newGameAddPlayer(x, y, index, step) {
        //Playername
        if (this.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: "black" } } else { var tFont = { font: 'bold 28px Arial', fill: "black" } }
        var pName = this.newText(x + 110, y + 150 + index * step, this.newGameSettings.tribes[index].name, tFont, 0);
        pName.name = "pName";
        pName.nr = index;
        //colorpicker
        var button = this.newSprite(x + 320, y + 170 + index * step, "colorpicker", index, "images", "emptyBubble", 0.5);
        if (this.mobile == true) { button.scale = 0.6; } else { button.scale = 0.4; }
        button.setTintFill(this.gameData.tribeColors[this.newGameSettings.tribes[index].colorNr].replace("#", "0x"));
        button.on('pointerup', function (button) {
            //console.log("colorchange", this, button);
            //remove existing colorpickerwheel
            this.removeColorpickerNew();
            var iLine = new Phaser.Geom.Line();
            var icolors = this.gameData.tribeColors.length;
            for (var i = 0; i < icolors; i++) {
                Phaser.Geom.Line.SetToAngle(iLine, button.x, button.y, i * 2 * Math.PI / icolors, button.displayWidth / 2 + button.displayWidth / 2);
                var buttonNew = this.newSprite(iLine.x2, iLine.y2, "colorpickerNew", button.nr, "images", "emptyBubble", 0.5);
                if (this.mobile == true) { buttonNew.scale = 0.6; } else { buttonNew.scale = 0.4; }
                buttonNew.setTintFill(this.gameData.tribeColors[i].replace("#", "0x"));
                buttonNew.colorNr = i;
                buttonNew.parentButton = button;
                this.infoContainer.colorpickerNewGroup.add(buttonNew);
                buttonNew.on('pointerup', function (buttonNew) {
                    this.newGameSettings.tribes[buttonNew.nr].colorNr = buttonNew.colorNr;
                    buttonNew.parentButton.setTintFill(this.gameData.tribeColors[buttonNew.colorNr].replace("#", "0x"));
                    this.removeColorpickerNew();
                }.bind(this, buttonNew));
            }
        }.bind(this, button));
        if (index > 0) {
            //AI-Level
            var button = this.newSprite(x + 510, y + 170 + index * step, "aiLevel", index, "images", "aiLevel" + this.newGameSettings.tribes[index].aiLevel, 0.5);
            if (this.mobile == true) { button.scale = 0.6; } else { button.scale = 0.4; }
            button.on('pointerup', function (button, index) {
                this.newGameSettings.tribes[index].aiLevel += 1;
                if (this.newGameSettings.tribes[index].aiLevel > this.gameData.aiLevelMax) {
                    this.newGameSettings.tribes[index].aiLevel = 1;
                }
                button.setTexture("images", "aiLevel" + this.newGameSettings.tribes[index].aiLevel);
            }.bind(this, button, index));
        }
    }

    removeColorpickerNew() {
        //console.log("removeColorpickerNew", this.infoContainer.colorpickerNewGroup.children.entries.length, this.infoContainer.colorpickerNewGroup.children.entries)
        //remove existing colorpickerwheel
        for (var i = 0; i < this.infoContainer.colorpickerNewGroup.children.entries.length; i++) {
            this.spriteGroup.killAndHide(this.infoContainer.colorpickerNewGroup.children.entries[i]);
            this.infoContainer.colorpickerNewGroup.children.entries[i].clearTint();
            this.infoContainer.colorpickerNewGroup.children.entries[i].scale = 1;
            this.infoContainer.colorpickerNewGroup.remove(this.infoContainer.colorpickerNewGroup.children.entries[i]);
            i--;
        }
    }
    newText(x, y, value, style, origin = 0.5, addToInfoContainer = true) {
        var text = this.textGroup.getFirstDead(0, 0, false);
        if (text == undefined) { text = 0 }; //in case there is no dead element, header must be != null
        if (text.type == "Text") {
            text.text = value;
            text.setStyle(style);
            text.setPosition(x, y);
            text.visible = true;
            text.active = true;
        } else {
            text = this.add.text(x, y, value, style);
            this.textGroup.add(text);
        }
        text.setOrigin(origin);
        if (addToInfoContainer) { this.infoContainer.add(text); }
        return text;
    }
    newSprite(x, y, name, nr, image, key, origin = 0.5, addToInfoContainer = true) {
        var button = this.spriteGroup.get(x, y, image, key);
        button.setTexture(image, key);
        if (addToInfoContainer) { this.infoContainer.add(button); }
        button.visible = true;
        button.active = true;
        button.name = name;
        button.nr = nr;
        button.setOrigin(origin);
        button.removeAllListeners();
        button.setInteractive();
        button.on('pointerup', function () {
            game.events.emit('toSoundMsg', { type: 'btnClick' });
        });
        switch (name) {
            case "colorpicker":
            case "colorpickerNew":
            case "options":
            case "optionsLanguage":
                break; //cancel
            case "plateBack":
                button.on('pointerover', function () { this.setTint("0xaaaaaa"); }) //grey
                    .on('pointerout', function () { this.clearTint(); });
                break;
            default:
                button.on('pointerover', function () { this.setTint("0xed5400"); }) //orange
                    .on('pointerout', function () { this.clearTint(); });
                break;
        }
        return button;
    }

    removeInfoPlate() {
        //console.log("infoPlate_destroy", this.infoContainer, this); 
        for (var i = 0; i < this.infoContainer.list.length; i++) {
            if (this.infoContainer.list[i].type == "Text") {
                this.textGroup.killAndHide(this.infoContainer.list[i]);
            } else if (this.infoContainer.list[i].type == "Sprite") {
                this.spriteGroup.killAndHide(this.infoContainer.list[i]);
                this.infoContainer.list[i].clearTint();
                this.infoContainer.list[i].scale = 1;
                this.infoContainer.list[i].alpha = 1;
            }
        };
        this.plate.clear();
        this.plate.x = 0;
    }

    tweenInfoPlate(x, duration) {
        if (duration === undefined) { duration = 1000 }
        this.tweens.add({
            targets: this.infoContainer,
            x: this.infoContainer.x - x,
            ease: 'Back',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
            duration: duration,
            repeat: 0,            // -1: infinity
            yoyo: false
        });
    }
}
