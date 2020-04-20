/** @type {import("../modules/phaser.js")} */
/// <reference path="../modules/phaser.js" />

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
        var aspectRatio = window.innerHeight / window.innerWidth;
        var tWidth = Math.sqrt(2000000 / aspectRatio);
        var tHeight = tWidth * aspectRatio;
        this.scale.setGameSize(tWidth, tHeight);
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
        this.removeInfoPlate();
        setTimeout(function () { this.setInfoPlate({ type: "menu" }); }.bind(this), 200);
        //differ between mobile and desktop (action-button size)
        if (this.sys.game.device.os.android || this.sys.game.device.os.chromeOS || this.sys.game.device.os.iPad ||
            this.sys.game.device.os.iPhone || this.sys.game.device.os.kindle) {
            this.mobile = true;
        }
        //PWA support
        if (this.sys.game.device.os.android || this.sys.game.device.os.chromeOS || this.sys.game.device.os.iPad ||
            this.sys.game.device.os.iPhone || this.sys.game.device.os.kindle ||
            this.sys.game.device.browser.chrome || this.sys.game.device.browser.mobileSafari) {
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

        var tText = "debug screen resolution:" +
            "\nw.inner width: " + window.innerWidth +
            "\nw.inner height: " + window.innerHeight +
            "\ngame width: " + game.scale.width +
            "\ngame height: " + game.scale.height;
        this.newText(5, 500, tText, { font: '30px Arial', fill: "black" }, 0, false);

        this.newText(5, 5, "Version: " + game.version, { font: '20px Arial', fill: "black" }, 0, false);
    }

    setInfoPlate(data) {
        //set the width and height
        switch (data.type) {
            case 'menu':
                data.width = 600;
                data.height = 630;
                data.backTarget = "";
                break;
            case "newGame":
                data.width = 800;
                data.height = 800;
                data.backTarget = "menu";
                break;
            case "options":
                data.width = 700;
                data.height = 670;
                data.backTarget = "menu";
                break;
            case 'statistics':
                data.width = 800;
                data.height = 670;
                data.backTarget = "menu";
                break;
            case 'credits':
                data.width = 800;
                data.height = 370;
                data.backTarget = "menu";
                break;
            case 'instruction':
                data.width = 1000;
                data.height = 900;
                data.backTarget = "menu";
                break;
            default:
                console.log("setInfoPlate error size")
        }
        var x = this.scale.width + 200;  //startposition outside of the screen
        var y = this.scale.height / 2 - data.height / 2 - 20;   //in the middle of the y-axis
        if (this.infoContainer.visible == true) {        //ToDo
            //infoPlate is visible, so there is no tween necessary
            x -= data.width;
            this.removeInfoPlate();
            this.infoContainer.visible = true; //set back to visible, because in "removeInfoPlate" it is set to false
        } else {
            this.removeInfoPlate();
            //this.infoContainer.x = 0;
            //this.plate.x = 0;
        }
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
        var backButton = this.newSprite(x, y + data.height / 2 - 50, "plateBack", 0, "images", "back", 0.1);
        if (this.mobile == true) { backButton.scale = 1.7; } else { backButton.scale = 1.2 }
        backButton.on('pointerup', function (data) {
            if (backButton.tween != undefined) { backButton.tween.stop(); }
            this.tweenInfoPlate(-data.width, 700, { type: data.backTarget });
        }.bind(this, data));
        if (data.backTarget == "") {     //load backbutton and hide it, otherwise the backbutton would be too wide
            backButton.visible = false;     //i guess because the texture before is 1x1 (lxb)
        } else {
            backButton.visible = true;
        }

        //Header
        switch (data.type) {
            case 'menu': var tHeader = this.lang.menu_header[this.settings.lang]; break;
            case "newGame": var tHeader = this.lang.menu_nG_header[this.settings.lang]; break;
            case "options": var tHeader = this.lang.menu_o_header[this.settings.lang]; break;
            case 'statistics': var tHeader = this.lang.menu_s_header[this.settings.lang]; break;
            case 'credits': var tHeader = this.lang.menu_c_header[this.settings.lang]; break;
            case 'instruction': var tHeader = this.lang.menu_i_header[this.settings.lang]; break;
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
                for (i = 0; i <= 5; i++) {
                    switch (i) {
                        case 0: subTypeText = "newGame"; subIcon = "anchor"; subText = this.lang.menu_newGame[this.settings.lang]; break;
                        case 1: subTypeText = "loadGame"; subIcon = "load"; subText = this.lang.menu_loadGame[this.settings.lang]; break;
                        case 2: subTypeText = "options"; subIcon = "options"; subText = this.lang.menu_options[this.settings.lang]; break;
                        case 3: subTypeText = "statistics"; subIcon = "medal"; subText = this.lang.menu_statistics[this.settings.lang]; break;
                        case 4: subTypeText = "instruction"; subIcon = "instruction"; subText = this.lang.menu_instruction[this.settings.lang]; break;
                        case 5: subTypeText = "credits"; subIcon = "credits"; subText = this.lang.menu_credits[this.settings.lang]; break;
                    }
                    if (i % 2) { tX = 75 } else { tX = -75 }
                    var button = this.newSprite(x + 50 + (data.width - 300) / 2 - tX, y + 130 + i * 80, "button", i, "images", subIcon, 0.5);
                    button.scale = 0.7;
                    button.on('pointerup', function (data, subTypeText) {
                        this.tweenInfoPlate(-data.width, 700, { type: subTypeText });
                    }.bind(this, data, subTypeText));
                    //ButtonText
                    if (this.mobile == true) { var tFont = { font: 'bold 40px Arial', fill: "black" } } else { var tFont = { font: 'bold 30px Arial', fill: "black" } }
                    this.newText(x + 50 + (data.width - 300) / 2 + tX, y + 130 + i * 80, subText, tFont, 0.5);
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
                var sliderText = this.newText(x + 430, y + 220 + this.gameData.tribeMax * 70, this.newGameSettings.islands, tFont, 0.5);
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
                this.newText(button.x + button.displayWidth + 50, button.y, this.lang.menu_nG_start[this.settings.lang], tFont, 0.5);
                break;
            case 'statistics':
                //Text
                var saveObject = JSON.parse(localStorage.getItem("stats"));
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
                var button = this.newSprite(x + 100, y + 120, "options", 0, "images", 'waveMotion', 0.5);
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
            case 'instruction':
                if (data.bubbleId >= 0) {
                    var stepX = 0; //increment at end of for-loop
                    var stepY = 100;
                    var row = -1;
                    var maxPerRow = 6;
                    for (var i = 0; i < this.gameData.buildingsMax; i++) {
                        if (i % maxPerRow == 0) {
                            row++;
                            stepX = 0;
                            if (this.gameData.buildingsMax - row * maxPerRow < maxPerRow) { stepX = 110 * (maxPerRow - (this.gameData.buildingsMax % maxPerRow)) / 2 }
                            //console.log(i, row, stepX);
                        }
                        var button = this.newSprite(x + 90 + stepX, y + 120 + row * stepY, "techBubble", i, "images", this.gameData.techObjects[i].textureName, 0.5);
                        if (this.mobile == true) { button.scale = 0.7; } else { button.scale = 0.5; }
                        button.on('pointerup', function () {
                            this.scene.setInfoPlate({ type: "instruction", bubbleId: this.nr });
                        });
                        stepX += 110;
                    }
                    var button = this.newSprite(x + 60, button.y + 90, "bubbles", 0, "images", this.gameData.techObjects[data.bubbleId].textureName, 0);
                    //header
                    if (this.mobile == true) { var tFont = { font: 'bold 45px Arial', fill: "black" } } else { var tFont = { font: 'bold 35px Arial', fill: "black" } };
                    var iText = this.newText(button.x + button.width + 20, button.y, this.lang.techobj_id[data.bubbleId].name[this.settings.lang], tFont, 0);
                    //separator
                    this.plate.fillStyle('0x7bb4f2', 1);
                    this.plate.fillRoundedRect(iText.x, iText.y + iText.height, data.width, 6, 2);
                    //text
                    var gInfo = this.lang.techobj_id[data.bubbleId].description[this.settings.lang] + "\n\n" +
                        this.lang.techobj_expectation[this.settings.lang] + ": "
                    var expectation = parseInt(this.gameData.techObjects[data.bubbleId].expectation, 2);
                    var expNames = "";
                    for (var i = 0; i < this.gameData.buildingsMax; i++) {
                        if (expectation & parseInt(this.gameData.techObjects[i].binary, 2)) {
                            if (expNames.length > 0) { expNames = expNames + ", " }
                            expNames = expNames + this.lang.techobj_id[i].name[this.settings.lang]
                        }
                    }
                    gInfo = gInfo + expNames + "\n" +
                        this.lang.techobj_constDuration[this.settings.lang] + ": " + this.gameData.techObjects[data.bubbleId].constDuration + "\n" +
                        this.lang.techobj_addBuildSpeed[this.settings.lang] + ": +" + this.gameData.techObjects[data.bubbleId].addBuildSpeed + "\n" +
                        this.lang.techobj_addPopGrowth[this.settings.lang] + ": +" + this.gameData.techObjects[data.bubbleId].addPopGrowth + "\n" +
                        this.lang.techobj_addDefence[this.settings.lang] + ": +" + this.gameData.techObjects[data.bubbleId].addDefence + "\n" +
                        this.lang.techobj_addAttack[this.settings.lang] + ": +" + this.gameData.techObjects[data.bubbleId].addAttack
                    if (this.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: "black", wordWrap: { width: this.scale.width - iText.x - 50 } } } else { var tFont = { font: 'bold 28px Arial', fill: "black", wordWrap: { width: this.scale.width - iText.x - 50 } } };
                    var iText = this.newText(iText.x, iText.y + iText.height + 30, gInfo, tFont, 0);
                    break;
                }
                //Text
                if (this.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: "black", wordWrap: { width: data.width - 300 } } } else { var tFont = { font: 'bold 28px Arial', fill: "black", wordWrap: { width: data.width - 300 } } };
                var iText = this.newText(x + 60, y + 90, this.lang.menu_i_text[this.settings.lang], tFont, 0);
                //water
                this.plate.fillStyle('0x0988fc', 1);
                this.plate.fillRect(iText.x, iText.y + iText.height + 30, iText.width, y + data.height - (iText.y + iText.height + 30) - 80);
                //start animation
                var tween = this.instructionAnimation({ type: 'init', x: iText.x, y: iText.y + iText.height + 30, right: iText.x + iText.width, bottom: y + data.height - 80 });
                backButton.tween = tween;
                //next
                var button = this.newSprite(iText.x + iText.width / 2, y + data.height - 40, "next", 6, "images", 'next', 0.5);
                button.tween = tween;
                if (this.mobile == true) { button.scale = 0.7; } else { button.scale = 0.5; }
                button.on('pointerup', function () {
                    if (button.tween != undefined) { button.tween.stop(); }
                    this.setInfoPlate({ type: "instruction", bubbleId: 0 });
                }.bind(this));
                break;
            case 'loadGame':
                this.removeInfoPlate();
                this.setInfoPlate({ type: "menu" });
                return;
                break;
            default:
                console.log("infoPlate switch_error", data);
        }
        //when everything is created, add a smooth tween to show the data
        if (this.infoContainer.visible != true) {
            //move the infoPlate into the screen
            this.tweenInfoPlate(data.width, 1000);
            this.infoContainer.visible = true;
        }
    }

    instructionAnimation(data) {
        switch (data.type) {
            case 'init':
                //island1
                var i1 = this.newSprite(data.x + 120, data.y + 120, "island", 1, "images", 'island0', 0.5);
                i1.scale = 0.6;
                i1.angle = 30;
                var f1 = this.newSprite(i1.x + 50, i1.y, "island", 1, "images", 'flag', 1);
                f1.scale = 0.6;
                f1.setTint(this.gameData.tribeColors[0].replace("#", "0x"));
                //island2
                var i2 = this.newSprite(data.right - 120, data.bottom - 120, "island", 2, "images", 'island4', 0.5);
                i2.scale = 0.6;
                i2.angle = 50;
                var f2 = this.newSprite(i2.x + 50, i2.y, "island", 1, "images", 'flag', 1);
                f2.scale = 0.6;
                //bubbles
                var buildBubble = this.newSprite(i1.x + i1.displayWidth / 2 + 15, i1.y + i1.displayHeight / 2 - 2, "bubbles", 1, "images", 'bubbleBuild', 0.5);
                buildBubble.scale = 0.4;
                buildBubble.visible = false;
                var buildShipBubble = this.newSprite(i1.x + i1.displayWidth / 2 + 15, i1.y + i1.displayHeight / 2, "bubbles", 2, "images", 'buildShipSiege', 0.5);
                buildShipBubble.scale = 0.4;
                buildShipBubble.alpha = 0.8;
                var ship = this.newSprite(i1.x - i1.displayWidth / 2 + 25, i1.y + i1.displayHeight / 2, "bubbles", 3, "images", 'portShipSiege', 0.5);
                ship.scale = 0.5;
                ship.rotation = -1.3;
                ship.scale = 0.4;
                ship.visible = false;
                var attackBubble = this.newSprite(i1.x - i1.displayWidth / 2 - 20, i1.y + i1.displayHeight / 2, "bubbles", 4, "images", 'steeringWheel', 0.5);
                attackBubble.scale = 0.4;
                attackBubble.alpha = 0.8;
                attackBubble.visible = false;
                var outpost = this.newSprite(i2.x, i2.y - i2.displayHeight / 2 - 40, "bubbles", 5, "images", 'outpost', 0.5);
                outpost.scale = 0.4;
                outpost.alpha = 0.8;
                outpost.visible = false;
                //mouse
                var pointer = this.newSprite(data.right - 50, data.y + 50, "bubbles", 5, "images", 'steeringWheel', 0.5);   //bugfix: if directly mouse-image the size will be wrong on the next page (portShipSiege)
                pointer.setTexture("images", "mouse");
                //waypoints
                var iLine = new Phaser.Geom.Line();
                iLine.x1 = ship.x - ship.displayWidth / 2;
                iLine.y1 = ship.y + 15;
                iLine.x2 = i2.x;
                iLine.y2 = i2.y;
                var iLine = Phaser.Geom.Line.SetToAngle(iLine, iLine.x1, iLine.y1, Phaser.Geom.Line.Angle(iLine), Phaser.Geom.Line.Length(iLine) - (i2.displayWidth + i2.displayHeight) / 4);

                //animation timeline
                var timeline = this.tweens.createTimeline();
                var scene = this;
                //mouse to buildShip bubble
                timeline.add({
                    targets: pointer,
                    x: buildShipBubble.x + 10,
                    y: buildShipBubble.y + 20,
                    ease: 'Sine.easeInOut',
                    delay: 500,
                    duration: 2000,
                    onComplete: function () {
                        pointer.setTexture("images", "mouseClick");
                        scene.time.delayedCall(500, function () {
                            pointer.setTexture("images", "mouse")
                        }, [], scene);
                    }
                });
                //build ship
                timeline.add({
                    targets: pointer,
                    temp: { from: 0, to: 100 },
                    ease: 'Sine.easeInOut',
                    duration: 500,
                    onComplete: function () {
                        buildBubble.cropValue = 0;
                        buildBubble.setCrop(0, (buildBubble.frame.height) - buildBubble.cropValue, buildBubble.frame.width, buildBubble.cropValue);
                        buildBubble.visible = true;
                    }
                });
                timeline.add({  //move pointer off the bubble for visualisation
                    targets: pointer,
                    x: buildShipBubble.x + 30,
                    y: buildShipBubble.y + 40,
                    delay: 250,
                    ease: 'Sine.easeInOut',
                    duration: 500
                });
                timeline.add({
                    targets: buildBubble,
                    cropValue: { from: 0, to: buildBubble.frame.height },
                    ease: 'linear',
                    offset: '-=500',   // starts 500ms before previous tween ends
                    duration: 3000,
                    onUpdate: function () {
                        buildBubble.setCrop(0, (buildBubble.frame.height) - buildBubble.cropValue, buildBubble.frame.width, buildBubble.cropValue);
                    },
                    onComplete: function () {
                        buildBubble.visible = false;
                        buildShipBubble.visible = false;
                        buildBubble.setCrop(0, 0, buildBubble.frame.width, buildBubble.frame.height);
                        attackBubble.alpha = 0;
                        attackBubble.visible = true;
                        ship.alpha = 0;
                        ship.visible = true;
                        ship.setTexture("images", "portShipSiege");
                    }
                });

                //show ship
                timeline.add({
                    targets: [attackBubble, ship],
                    alpha: { from: 0, to: 0.8 },
                    ease: 'linar',
                    duration: 800,
                    onComplete: function () {
                        ship.alpha = 1;
                    }
                });
                //mouse to attack
                timeline.add({
                    targets: pointer,
                    x: attackBubble.x + 10,
                    y: attackBubble.y + 20,
                    ease: 'Sine.easeInOut',
                    delay: 500,
                    duration: 2000,
                    onComplete: function () {
                        pointer.setTexture("images", "mouseClick");
                        attackBubble.setTintFill('0xf7c184');
                        scene.time.delayedCall(500, function () {
                            pointer.setTexture("images", "mouse")
                        }, [], scene);
                    }
                });
                //mouse to island
                timeline.add({
                    targets: pointer,
                    x: i2.x + 20,
                    y: i2.y + 30,
                    ease: 'Sine.easeInOut',
                    delay: 1000,
                    duration: 2000,
                    onComplete: function () {
                        pointer.setTexture("images", "mouseClick");
                        attackBubble.clearTint();
                        scene.time.delayedCall(500, function () {
                            pointer.setTexture("images", "mouse")
                        }, [], scene);
                        buildShipBubble.visible = true;
                        attackBubble.visible = false;
                    }
                });
                //rotate ship to start position
                timeline.add({
                    targets: ship,
                    x: iLine.x1,
                    y: iLine.y1,
                    rotation: Math.atan2(iLine.y2 - iLine.y1, iLine.x2 - iLine.x1) + 0.5 * Math.PI,
                    duration: 1000,
                    ease: 'Sine.easeOut',
                    onComplete: function () {
                        ship.setTexture("images", "shipSiege");
                    }
                });
                //set sails
                timeline.add({
                    targets: ship,
                    x: iLine.x2,
                    y: iLine.y2,
                    duration: 3000,
                    ease: 'linear',
                    onComplete: function () {
                        ship.visible = false;
                        f2.setTint(scene.gameData.tribeColors[0].replace("#", "0x"));
                        outpost.alpha = 0;
                        outpost.visible = true;
                    }
                });
                //show outpost
                timeline.add({
                    targets: outpost,
                    alpha: { from: 0, to: 0.8 },
                    ease: 'linar',
                    duration: 800,
                    onComplete: function () {
                        scene.time.delayedCall(500, function () {
                            pointer.setTexture("images", "mouse")
                        }, [], scene);
                    }
                });
                //back to start position
                timeline.add({
                    targets: pointer,
                    alpha: { from: 1, to: 0 },
                    ease: 'linar',
                    delay: 500,
                    duration: 1500,
                    completeDelay: 2000,
                    onComplete: function () {
                        //set everyting back to start
                        f2.clearTint();
                        //bubbles
                        buildBubble.alpha = 1;
                        buildBubble.visible = false;
                        buildBubble.alpha = 0.8;
                        buildShipBubble.visible = true;
                        ship.x = i1.x - i1.displayWidth / 2 + 25;
                        ship.y = i1.y + i1.displayHeight / 2;
                        ship.rotation = -1.3;
                        ship.visible = false;
                        attackBubble.alpha = 0.8;
                        attackBubble.visible = false;
                        outpost.alpha = 0.8;
                        outpost.visible = false;
                        pointer.x = data.right - 50,
                            pointer.y = data.y + 50
                        pointer.alpha = 1;
                    }
                });
                timeline.loopDelay = 2000;
                timeline.loop = -1;
                timeline.play();
                return timeline;
                break;
            default:
                console.log("instructionAnimation_error", data);
        }
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
        //click-sound
        switch (name) {
            case "island":
            case "bubbles":
                break; //cancel
            default:
                button.on('pointerup', function () {
                    game.events.emit('toSoundMsg', { type: 'btnClick' });
                });
        }
        //tint
        switch (name) {
            case "colorpicker":
            case "colorpickerNew":
            case "options":
            case "optionsLanguage":
            case "island":
            case "bubbles":
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
                this.infoContainer.list[i].clearTint();
                this.infoContainer.list[i].scale = 1;
                this.infoContainer.list[i].alpha = 1;
                this.infoContainer.list[i].angle = 0;
                this.infoContainer.list[i].isCropped = false;
                this.infoContainer.list[i].removeAllListeners();
                this.spriteGroup.killAndHide(this.infoContainer.list[i]);
            }
        };
        this.infoContainer.x = 0;
        this.infoContainer.visible = false;
        this.plate.clear();
        this.plate.x = 0;
    }

    tweenInfoPlate(x, duration, data) {
        if (duration === undefined) { duration = 1000 }
        this.tweens.add({
            targets: this.infoContainer,
            x: this.infoContainer.x - x,
            ease: 'Back',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
            duration: duration,
            repeat: 0,            // -1: infinity
            yoyo: false,
            onComplete: function () {
                if (x < 0) {
                    this.scene.removeInfoPlate();
                    this.scene.setInfoPlate(data);
                }
            },
            onCompleteScope: this.scene
        });
    }
}
