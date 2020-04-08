/// <reference path="node_modules/phaser.js" />

class cMainMenu extends Phaser.Scene {
    constructor() {
        super("mainMenu");
        this.infoContainer;
        this.spriteGroup;
        this.textGroup;
        this.plate;
        this.gameSettings;
        this.newGameSettings = {};
    }

    preload() {
        // load all game assets
        // images, spritesheets, atlases, audio etc..

        //load image atlas
        this.load.atlas('images', 'assets/spritesheets/imageAtlas.png', 'assets/spritesheets/imageAtlas.json');
        //load audio sprite
        //game.load.audio('soundEffects', ['assets/spritesheets/PaperJumpAudioAtlas.ogg'], false);
        this.load.image('backButton', 'assets/back.png');
        //load techTree
        this.load.json('gameSettings', 'assets/gameSettings.json');
    }

    create() {
        // create main menu text and images -
        //set the bounds of the world
        var aspectRatio = game.scale.height / game.scale.width;
        var tWidth = Math.sqrt(2000000 / aspectRatio);
        var tHeight = tWidth * aspectRatio;
        game.scale.resize(tWidth, tHeight);
        this.cameras.main.setBounds(0, 0, tWidth, tHeight);
        //backgroundimage
        var background = this.add.sprite(-150, 0, "images", "background");
        background.setOrigin(0);
        if (background.width - 200 < tWidth) { background.scale = (tWidth / (background.width - 200) * 2); }
        if (background.height - 200 < tHeight) { background.scale = (tHeight / (background.height - 200) * 2); }
        //load the gameSettings and gameSettings
        this.gameSettings = JSON.parse(JSON.stringify(this.cache.json.get('gameSettings')));

        //start settings
        this.newGameSettings = JSON.parse(localStorage.getItem("defaultNewGame"));
        if (this.newGameSettings == undefined) {
            this.newGameSettings = {};
            this.newGameSettings.tribes = [];
            this.newGameSettings.tribes.push({ name: "you", colorNr: 0, aiLevel: 3 });
            this.newGameSettings.tribes.push({ name: "CPU_1", colorNr: 1, aiLevel: 1 });
            this.newGameSettings.islands = 15;
            this.newGameSettings.sound = 0;
            this.newGameSettings.loadGame = 0;
        }
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
            console.log("check urlParams", urlParams, window.location.search.substring(1), window.location);
            
            if (urlParams["mode"] == "PWA") {
                console.log("This is running as PWA.");
            } else {
                //PWA button
                var pwaButton = this.newSprite(tWidth - 100, -150, "pwa", 0, "images", "emptyBubble", 0.5);
                //this.infoContainer.remove(pwaButton, false);
                pwaButton.scale = 2;
                pwaButton.on('pointerup', function () {
                    if (window.promptEvent) { window.promptEvent.prompt(); }
                    pwaButton.clearTint();
                    console.log("os:", this.sys.game.device.os, "browser:", this.sys.game.device.browser);
                }.bind(this));
                var pwaText = this.newText(tWidth - 100, -100, "Play this Game as a\nPWA-App, for best\nUserexpereance &\nPerformance", { font: '20px Arial', fill: "black" }, 0.5);
                //this.infoContainer.remove(pwaText, false);
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
                data.width = 353;
                data.height = 430;
                data.backPlate = "";
                break;
            case "newGame":
                data.width = 500;
                data.height = 570;
                data.backPlate = "menu";
                break;
            case 'statistics':
                data.width = 450;
                data.height = 570;
                data.backPlate = "menu";
                break;
            case 'credits':
                data.width = 500;
                data.height = 270;
                data.backPlate = "menu";
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
        this.plate.fillRoundedRect(x + 30, y + 50, data.width, 5, 2);
        //back button
        var button = this.newSprite(x, y + data.height / 2 - 50, "plateBack", 0, "backButton", "", 0.1);
        button.on('pointerup', function (button, data) {
            this.tweenInfoPlate(-data.width, 700);
            this.time.addEvent({
                delay: 700, callback: function () {
                    this.removeInfoPlate();
                    this.setInfoPlate({ type: data.backPlate });
                }, callbackScope: this
            });
        }.bind(this, button, data));
        if (data.backPlate == "") {     //load backbutton and hide it, otherwise the backbutton would be too wide
            button.visible = false; //i guess because the texture before is 1x1 (lxb)
        } else {
            button.visible = true;
        }
        //differ between the different types of information
        switch (data.type) {
            case 'menu':
                //Header
                this.newText(x + 30, y + 20, "Water Tribes", { font: 'bold 24px Arial', fill: "black" }, 0);
                //different buttons
                var subTypeText;
                var subIcon;
                var i;
                var tX;
                for (i = 0; i < 5; i++) {
                    switch (i) {
                        case 0: subTypeText = "newGame"; subIcon = "anchor"; break;
                        case 1: subTypeText = "loadGame"; subIcon = "load"; break;
                        case 2: subTypeText = "statistics"; subIcon = "medal"; break;
                        case 3: subTypeText = "credits"; subIcon = "credits"; break;
                        case 4: subTypeText = "quit"; subIcon = "exit"; break;
                    }
                    tX = (i % 2 + 1) * 100;
                    var button = this.newSprite(x + 275 - tX, y + 100 + i * 70, "button", i, "images", subIcon, 0.5);
                    button.scale = 0.5;
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
                    this.newText(x + tX - 20, y + 100 + i * 70, subTypeText, { font: 'bold 24px Arial', fill: "black" }, 0.5);
                }
                break;
            case 'newGame':
                //Header
                this.newText(x + 30, y + 20, "Water Tribes - New Game", { font: 'bold 24px Arial', fill: "black" }, 0);
                //Text
                var text = "Player          " + "color        " + "level"
                this.newText(x + 80, y + 80, text, { font: 'bold 20px Arial', fill: "black" }, 0);
                //separator
                this.plate.fillStyle('0x7bb4f2', 1);
                this.plate.fillRoundedRect(x + 80, y + 100, data.width, 2, 2);

                for (i = 0; i < this.newGameSettings.tribes.length; i++) {
                    this.newGameAddPlayer(x, y, i);
                }

                //Text
                var text = "Number of Islands"
                this.newText(x + 80, y + 380, text, { font: 'bold 20px Arial', fill: "black" }, 0);
                //separator
                this.plate.fillStyle('0x7bb4f2', 1);
                this.plate.fillRoundedRect(x + 80, y + 400, data.width, 2, 2);

                //slider
                this.plate.fillStyle('0x7bb4f2', 1);
                this.plate.fillRoundedRect(x + 80, y + 430, 200, 2, 2);
                var sliderHitArea = this.newSprite(x + 80, y + 420, "sliderBack", 0, "images", 'emptyBubble', 0.0);
                sliderHitArea.alpha = 0.01;
                sliderHitArea.displayWidth = 200;
                sliderHitArea.displayHeight = 20;
                sliderHitArea.setInteractive();
                sliderHitArea.on('pointerup', function (pointer, localX, localY, event) {
                    //console.log("pUp", pointer, pointer.upX, this.x + localX, slider.slideMax, this.x + this.displayWidth);
                    slider.textObj.text = (this.scene.newGameSettings.tribes.length + ((this.scene.gameSettings.islandsMax - this.scene.newGameSettings.tribes.length) / this.width) * localX).toFixed(0);
                    this.scene.newGameSettings.islands = slider.textObj.text;
                    slider.calcNewPosition();
                });
                var sliderText = this.newText(x + 310, y + 430, this.newGameSettings.islands, { font: 'bold 20px Arial', fill: "black" }, 0.5);
                var slider = this.newSprite(x + 80, y + 430, "slider", 0, "images", 'emptyBubble', 0.5);
                slider.scale = 0.2;
                slider.textObj = sliderText;
                this.input.setDraggable(slider);
                slider.input.draggable = true;
                slider.slideMin = x + 80;
                slider.slideMax = slider.slideMin + 200;
                slider.calcNewPosition = function () {
                    this.x = this.slideMin + (this.textObj.text - this.scene.newGameSettings.tribes.length) * (this.slideMax - this.slideMin) / (this.scene.gameSettings.islandsMax - this.scene.newGameSettings.tribes.length);
                }
                slider.on('dragstart', function (pointer, dragX, dragY) {
                    this.dragstart = this.x;
                });
                slider.on('drag', function (pointer, dragX, dragY) {
                    dragX = (dragX - this.dragstart) / this.scene.cameras.main.zoom;
                    if (this.dragstart + dragX > this.slideMax) { dragX = this.slideMax - this.dragstart; }
                    if (this.dragstart + dragX < this.slideMin) { dragX = this.slideMin - this.dragstart; }
                    this.x = this.dragstart + dragX;
                    this.textObj.text = (this.scene.newGameSettings.tribes.length + (this.scene.gameSettings.islandsMax - this.scene.newGameSettings.tribes.length) / (this.slideMax - this.slideMin) * (this.x - this.slideMin)).toFixed(0);
                });
                slider.on('dragend', function (pointer, dragX, dragY, dropped) {
                    this.scene.newGameSettings.islands = this.textObj.text;
                });
                slider.calcNewPosition();

                //remove last enemy
                var remEnemy = this.newSprite(x + 50, y + 135 + (i - 1) * 40, "removeEnemy", 0, "images", "remove", 0.5);
                remEnemy.scale = 0.3;
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
                        y: y + 135 + this.newGameSettings.tribes.length * 40 - 40,
                        ease: 'Sine.easeInOut',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
                        duration: 500,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });
                    this.tweens.add({
                        targets: remEnemy.addEnemy,
                        y: y + 135 + this.newGameSettings.tribes.length * 40,
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
                var addEnemy = this.newSprite(x + 50, y + 135 + i * 40, "addEnemy", 0, "images", "add", 0.5);
                addEnemy.scale = 0.3;
                addEnemy.on('pointerup', function (addEnemy, slider) {
                    var i = this.newGameSettings.tribes.length;
                    //console.log("addEnemy", this, addEnemy, this.newGameSettings.tribes, this.gameSettings.tribeMax);
                    this.newGameSettings.tribes.push({ name: "CPU_" + i, colorNr: i, aiLevel: 1 });
                    this.newGameAddPlayer(x, y, i);
                    this.tweens.add({
                        targets: addEnemy,
                        y: y + 135 + this.newGameSettings.tribes.length * 40,
                        ease: 'Sine.easeInOut',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
                        duration: 500,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });
                    this.tweens.add({
                        targets: addEnemy.remEnemy,
                        y: y + 135 + this.newGameSettings.tribes.length * 40 - 40,
                        ease: 'Sine.easeInOut',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
                        duration: 500,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });
                    if (i > 1) { addEnemy.remEnemy.visible = true }
                    if (i >= this.gameSettings.tribeMax - 1) { addEnemy.visible = false }
                    if (slider.textObj.text < this.newGameSettings.tribes.length) { slider.textObj.text = this.newGameSettings.tribes.length };
                    slider.calcNewPosition();
                }.bind(this, addEnemy, slider));
                remEnemy.addEnemy = addEnemy;
                addEnemy.remEnemy = remEnemy;
                if (this.newGameSettings.tribes.length == this.gameSettings.tribeMax) { addEnemy.visible = false } else { addEnemy.visible = true }


                //start new Game
                var button = this.newSprite(x + 50, y + data.height - 50, "startGame", 0, "images", 'anchor', 0.5);
                button.scale = 0.5;
                button.on('pointerup', function (button, data) {
                    localStorage.setItem("defaultNewGame", JSON.stringify(this.newGameSettings));
                    this.scene.start("playGame", this.newGameSettings);
                    this.scene.stop("mainMenu");
                }.bind(this, button, data));
                //StartGame
                this.newText(x + 130, y + data.height - 50, "Set Sails!", { font: 'bold 20px Arial', fill: "black" }, 0.5);
                break;
            case 'statistics':
                //Header
                this.newText(x + 30, y + 20, "Water Tribes - Statistics", { font: 'bold 24px Arial', fill: "black" }, 0);
                //Text
                var saveObject = JSON.parse(localStorage.getItem("stats"));

                if (saveObject == undefined) {
                    var saveObject = {
                        gamesTotal: 0,
                        enemysTotal: 0,
                        timeTotal: 0,
                        win: 0,
                        loss: 0,
                        enemysWonTotal: 0,
                        enemysLostTotal: 0,
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
                    "gamesTotal: " + saveObject.gamesTotal + "\n" +
                    "enemysTotal: " + saveObject.enemysTotal + "\n" +
                    "timeTotal: " + (saveObject.timeTotal / 60000).toFixed(2) + "min\n" +
                    "win: " + saveObject.win + "\n" +
                    "loss: " + saveObject.loss + "\n" +
                    "enemysWonTotal: " + saveObject.enemysWonTotal + "\n" +
                    "enemysLostTotal: " + saveObject.enemysLostTotal + "\n" +
                    "longestWinStreak: " + saveObject.longestWinStreak + "\n" +
                    "longestLossStreak: " + saveObject.longestLossStreak + "\n" +
                    "actualStreak: " + saveObject.actualStreak + "\n" +
                    "fastestWin: " + (saveObject.fastestWin / 60000).toFixed(2) + "min\n" +
                    "fastestLoss: " + (saveObject.fastestLoss / 60000).toFixed(2) + "min\n" +
                    "longestWin: " + (saveObject.longestWin / 60000).toFixed(2) + "min\n" +
                    "longestLoss: " + (saveObject.longestLoss / 60000).toFixed(2) + "min";

                this.newText(x + 30, y + 70, gInfo, { font: 'bold 20px Arial', fill: "black" }, 0);
                break;
            case 'credits':
                //Header
                this.newText(x + 30, y + 20, "Water Tribes - Credits", { font: 'bold 24px Arial', fill: "black" }, 0);
                //Text
                var gInfo = "This Game was created by MW. \n" +
                    "I hope you like it.\n\n" +
                    "Special thanks to:\n" +
                    "   - my wonderful wife\n" +
                    "   - Phaser3 (Framework)"
                this.newText(x + 30, y + 70, gInfo, { font: 'bold 20px Arial', fill: "black" }, 0);
                break;
            case 'loadGame':
            case 'quit':
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

    newGameAddPlayer(x, y, index) {
        //Playername
        var pName = this.newText(x + 80, y + 120 + index * 40, this.newGameSettings.tribes[index].name, { font: 'bold 20px Arial', fill: "black" }, 0);
        pName.name = "pName";
        pName.nr = index;
        //colorpicker
        var button = this.newSprite(x + 220, y + 130 + index * 40, "colorpicker", index, "images", "emptyBubble", 0.5);
        button.scale = 0.3;
        button.setTintFill(this.gameSettings.tribeColors[this.newGameSettings.tribes[index].colorNr].replace("#", "0x"));
        button.on('pointerup', function (button) {
            //console.log("colorchange", this, button);
            //remove existing colorpickerwheel
            this.removeColorpickerNew();
            var iLine = new Phaser.Geom.Line();
            var icolors = this.gameSettings.tribeColors.length;
            for (var i = 0; i < icolors; i++) {
                Phaser.Geom.Line.SetToAngle(iLine, button.x, button.y, i * 2 * Math.PI / icolors, button.displayWidth / 2 + button.displayWidth / 2);
                var buttonNew = this.newSprite(iLine.x2, iLine.y2, "colorpickerNew", button.nr, "images", "emptyBubble", 0.5);
                buttonNew.scale = 0.3;
                buttonNew.setTintFill(this.gameSettings.tribeColors[i].replace("#", "0x"));
                buttonNew.colorNr = i;
                buttonNew.parentButton = button;
                this.infoContainer.colorpickerNewGroup.add(buttonNew);
                buttonNew.on('pointerup', function (buttonNew) {
                    this.newGameSettings.tribes[buttonNew.nr].colorNr = buttonNew.colorNr;
                    buttonNew.parentButton.setTintFill(this.gameSettings.tribeColors[buttonNew.colorNr].replace("#", "0x"));
                    this.removeColorpickerNew();
                }.bind(this, buttonNew));
            }
        }.bind(this, button));
        if (index > 0) {
            //AI-Level
            var button = this.newSprite(x + 310, y + 130 + index * 40, "aiLevel", index, "images", "aiLevel" + this.newGameSettings.tribes[index].aiLevel, 0.5);
            button.scale = 0.3;
            button.on('pointerup', function (button, index) {
                this.newGameSettings.tribes[index].aiLevel += 1;
                if (this.newGameSettings.tribes[index].aiLevel > this.gameSettings.aiLevelMax) {
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
    newText(x, y, value, style, origin = 0.5) {
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
        this.infoContainer.add(text);
        return text;
    }
    newSprite(x, y, name, nr, image, key, origin = 0.5) {
        var button = this.spriteGroup.get(x, y, image, key);
        button.setTexture(image, key);
        this.infoContainer.add(button);
        button.visible = true;
        button.active = true;
        button.name = name;
        button.nr = nr;
        button.setOrigin(origin);
        button.removeAllListeners();
        button.setInteractive();

        switch (name) {
            case "colorpicker":
            case "colorpickerNew":
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
