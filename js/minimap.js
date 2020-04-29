/// <reference path="../modules/phaser.js" />
/** @type {import("../modules/phaser.js")} */

class cMiniMap extends Phaser.Scene {
    constructor() {
        super("miniMap");
        this.aaaaa = "miniMap";
        this.gameSpeed = 1;
        this.mute = true;
        this.tribeAi = 0;
        this.gameScene;
        this.infoContainer;
        this.spriteGroup;
        this.textGroup;
        this.plate;
        this.miniMapBubble;
        this.lang;
        this.settings = {};
    }

    create() {
        this.gameSpeed = 1;
        this.mute = false;
        this.tribeAi = 0;
        var iLine = new Phaser.Geom.Line();
        this.spriteGroup = this.add.group();
        this.textGroup = this.add.group();
        this.lang = this.cache.json.get('language');
        this.settings = JSON.parse(localStorage.getItem("settings"));

        this.miniMapBubble = this.add.sprite(0, 0, "images", 'emptyBubble');
        this.miniMapBubble.setOrigin(0.5, 0.5);
        this.miniMapBubble.alpha = 0.6;
        if (game.mobile == true) { this.miniMapBubble.scale = 3; } else { this.miniMapBubble.scale = 1.7; }
        var x = this.scale.width - this.miniMapBubble.displayWidth / 2 - 20;
        var y = this.scale.height - this.miniMapBubble.displayHeight / 2 - 20;
        this.miniMapBubble.x = x;
        this.miniMapBubble.y = y;
        //property-circle
        this.miniMap = this.add.graphics();
        this.miniMap.alpha = 0.8;

        //create some action-buttons around the minimap
        this.bubbleGroup = this.add.group();
        for (var i = 1; i < 6; i++) {
            var temp = "";
            var angle = 0;
            switch (i) {
                case 1: temp = "play"; angle = 2.7; break;
                case 2: temp = "mute"; angle = 3.25; break;
                case 3: temp = "statistics"; angle = 3.8; break;
                case 4: temp = "bot"; angle = 4.35; break;
                case 5: temp = "exit"; angle = 4.9; break;
                default: console.log("create action-buttons error", i);
            }
            var button = this.newSprite(x, y, "actionBubble", i, "images", temp, 0.5, false);
            if (game.mobile == true) { button.scale = 1; } else { button.scale = 0.6; }
            Phaser.Geom.Line.SetToAngle(iLine, x, y, angle, this.miniMapBubble.displayWidth / 2 + button.displayWidth / 1.5);
            button.x = iLine.x2;
            button.y = iLine.y2;
            button.on('pointerup', function (button) {
                //console.log("pUp", this, button); 
                this.clickOptionButton(button);
            }.bind(this, button));
            this.bubbleGroup.add(button);
        }

        //infoPlate (islandinfo, statistics, and so on)
        this.infoContainer = this.add.container();
        this.plate = this.add.graphics();
        this.infoContainer.add(this.plate);
        this.infoContainer.visible = false;

        // Listen for events from gameScene
        this.gameScene = this.scene.get('playGame');
        game.events.on('toMiniMapMsg', function (data) {
            this.newMessage(data);
        }, this);
        game.events.emit('toGameMsg', { type: 'init' });
    }

    newMessage(data) {
        //console.log("miniMap_newMessage", this, data);
        switch (data.type) {
            case 'init':
                this.gameSpeed = data.gameSpeed;
                this.updateButtonTexture(this.bubbleGroup.children.entries[0]);
                this.mute = data.mute;
                this.updateButtonTexture(this.bubbleGroup.children.entries[1]);
                this.tribeAi = data.tribeAi;
                this.updateButtonTexture(this.bubbleGroup.children.entries[3]);
                this.updateMiniMap();
                break;
            case 'newIsland':
                this.updateMiniMap();
                this.saveGame();
                this.checkEndGame();
                break;
            case 'islandInfo':
                game.events.emit('toSoundMsg', { type: 'btnClick' });
                this.setInfoPlate({ type: 'islandInfo', island: data.island });
                break;
            default:
                console.log("miniMap_newMessage_error", this, data);
                break;
        }
    }

    update(time, delta) {

    }

    updateMiniMap() {
        var startAngle = 1.5 * Math.PI;
        var tribeAngle = 0;
        var i;
        var segments = [];
        var sortSegment;
        var width = this.miniMapBubble.displayWidth;
        var tIsland;

        this.miniMap.clear();

        if (game.debug) { console.log('updateMiniMap', this.gameScene.tribes, this.gameScene.islandGroup); }
        //segments are the parts of the circle around the minimap, to show wich player is the best
        segments.push({ "nr": 0, 'angle': 2 * Math.PI, 'color': this.gameScene.tribes[0].color });

        //calculate each segment
        for (i = 1; i < this.gameScene.tribes.length; i++) {
            tribeAngle = (1 / this.gameScene.islandGroup.children.entries.length) * (2 * Math.PI) * this.gameScene.tribes[i].islands.length;
            segments.push({ "nr": i, 'angle': tribeAngle, 'color': this.gameScene.tribes[i].color });
            segments[0].angle -= tribeAngle;
        }

        //sort the segments, top down
        var swapped;
        do {
            swapped = false;
            for (i = 2; i < this.gameScene.tribes.length; i++) {
                if (segments[i - 1].angle < segments[i].angle) {
                    sortSegment = segments[i - 1];
                    segments[i - 1] = segments[i];
                    segments[i] = sortSegment;
                    swapped = true;
                }
            }
        } while (swapped == true);

        //draw each segment
        for (i = 1; i < this.gameScene.tribes.length; i++) {
            this.miniMap.beginPath();
            if (game.mobile == true) { this.miniMap.lineStyle(14, segments[i].color, 1); } else { this.miniMap.lineStyle(10, segments[i].color, 1); }
            this.miniMap.arc(this.miniMapBubble.x, this.miniMapBubble.y - 7, width / 2 - 7, startAngle, startAngle + segments[i].angle, false);
            startAngle += segments[i].angle;
            this.miniMap.strokePath();
        }
        //fill the rest with white
        this.miniMap.beginPath();
        if (game.mobile == true) { this.miniMap.lineStyle(14, '0xffffff', 1); } else { this.miniMap.lineStyle(10, '0xffffff', 1); }
        this.miniMap.arc(this.miniMapBubble.x, this.miniMapBubble.y - 7, width / 2 - 7, startAngle, startAngle + segments[0].angle, false);
        this.miniMap.strokePath();

        //paint the islands on the minimap-bubble
        var mmX = (width - 50) / this.scale.width;
        var mmY = (width - 50) / this.scale.height;
        var mmScale;
        var px;
        var py;
        if (mmX < mmY) { mmScale = mmX; } else { mmScale = mmY; }
        for (i = 0; i < this.gameScene.islandGroup.children.entries.length; i++) {
            tIsland = this.gameScene.islandGroup.children.entries[i];
            px = mmX * tIsland.x + this.miniMapBubble.x - width / 2 + 25;
            py = mmY * tIsland.y + this.miniMapBubble.y - width / 2 + 25;
            //console.log("updateMiniMap_Islands", px, py, mmScale, tIsland);
            this.miniMap.fillStyle(this.gameScene.tribes[tIsland.tribe].color, 1);
            if (game.mobile == true) { this.miniMap.fillCircleShape(new Phaser.Geom.Circle(px, py, 7)); } else { this.miniMap.fillCircleShape(new Phaser.Geom.Circle(px, py, 5)); }
        }
    };

    checkEndGame() {
        var activeTribes = 0;
        var lstTribe = 0;
        for (var i = 1; i < this.gameScene.tribes.length; i++) {
            if (this.gameScene.tribes[i].islands.length > 0) {
                activeTribes++;
                lstTribe = i;
            }
        }
        if (activeTribes == 1) { this.endGame(lstTribe); }   //toDo: perhaps end game if player has lost, now end game when there is only one player left
        //console.log("checkEndGame");
    }

    endGame(winner) {
        //pause game
        this.gameSpeed = 0;
        game.events.emit('toGameMsg', { type: 'update', gameSpeed: this.gameSpeed });
        this.updateButtonTexture(this.bubbleGroup.children.entries[0]);

        //end game (no update on play/doublespeed/pause)
        this.gameScene.status = "end";
        this.saveGameStats(winner);
        localStorage.removeItem("saveGame");
        //show the statistics
        this.setInfoPlate({ type: 'statistics', statistics: this.gameScene.statistics, subtype: 'islands' });
        game.events.emit('toSoundMsg', { type: 'endGame' });
    }

    //save this actual game
    saveGame() {
        var saveObject = {
            timestamp: Date.now(),
            tribes: new Array(),
            islands: new Array(),
            ships: new Array(),
            statistics: new Array()
        }
        //tribes
        for (var i = 0; i < this.gameScene.tribes.length; i++) {
            saveObject.tribes.push({
                name: this.gameScene.tribes[i].name,
                nr: this.gameScene.tribes[i].nr,
                color: this.gameScene.tribes[i].color,
                ai: this.gameScene.tribes[i].ai,
                aiLevel: this.gameScene.tribes[i].aiLevel,
                islands: this.gameScene.tribes[i].islands
            });
        }
        //islands
        for (var i = 0; i < this.gameScene.islandGroup.children.entries.length; i++) {
            saveObject.islands.push({
                name: this.gameScene.islandGroup.children.entries[i].name,
                buildState: this.gameScene.islandGroup.children.entries[i].buildState,
                currentBuild: this.gameScene.islandGroup.children.entries[i].currentBuild,
                currentBuildConstTime: Phaser.Math.FloorTo(this.gameScene.islandGroup.children.entries[i].currentBuildConstTime, 0),
                currentBuildConstMax: this.gameScene.islandGroup.children.entries[i].currentBuildConstMax,
                nr: this.gameScene.islandGroup.children.entries[i].nr,
                population: Phaser.Math.FloorTo(this.gameScene.islandGroup.children.entries[i].population, -2),
                populationMax: this.gameScene.islandGroup.children.entries[i].populationMax,
                rotation: Phaser.Math.FloorTo(this.gameScene.islandGroup.children.entries[i].rotation, -2),
                scale: this.gameScene.islandGroup.children.entries[i].scale,
                sprite: this.gameScene.islandGroup.children.entries[i].sprite,
                tribe: this.gameScene.islandGroup.children.entries[i].tribe,
                x: this.gameScene.islandGroup.children.entries[i].x,
                y: this.gameScene.islandGroup.children.entries[i].y
            });
        }
        //ships
        for (var i = 0; i < this.gameScene.shipGroup.children.entries.length; i++) {
            if (this.gameScene.shipGroup.children.entries[i].active == true) {
                saveObject.ships.push({
                    tribe: this.gameScene.shipGroup.children.entries[i].tribe,
                    speed: this.gameScene.shipGroup.children.entries[i].speed,
                    attack: this.gameScene.shipGroup.children.entries[i].attack,
                    defence: this.gameScene.shipGroup.children.entries[i].defence,
                    dist: this.gameScene.shipGroup.children.entries[i].dist,
                    population: this.gameScene.shipGroup.children.entries[i].population,
                    origin: this.gameScene.shipGroup.children.entries[i].origin,
                    aim: this.gameScene.shipGroup.children.entries[i].aim
                });
            }
        }
        //statistics
        for (var i = 0; i < this.gameScene.statistics.length; i++) {
            saveObject.statistics.push({
                buildingsMax: this.gameScene.statistics[i].buildingsMax,
                islands: this.gameScene.statistics[i].islands,
                populationMax: this.gameScene.statistics[i].populationMax,
                time: this.gameScene.statistics[i].time,
                tribes: this.gameScene.statistics[i].tribes,
                type: this.gameScene.statistics[i].type
            });
        };
        localStorage.setItem("saveGame", JSON.stringify(saveObject));
        //console.log("saveGame", JSON.parse(localStorage.getItem("saveGame")));
        if (game.debug) { console.log("saveGame", saveObject, JSON.parse(localStorage.getItem("saveGame"))); }
    }

    //updateRanking (games played total, ...)
    saveGameStats(tribeNr) {
        var type;
        if (tribeNr == 1) {
            type = "win"
        } else {
            type = "loss"
        }

        var saveObject = JSON.parse(localStorage.getItem("stats"));
        var diffTime = (this.gameScene.statistics[this.gameScene.statistics.length - 1].time - this.gameScene.statistics[0].time);
        saveObject.gamesTotal++;
        saveObject.enemiesTotal += this.gameScene.tribes.length - 2;
        saveObject.timeTotal += diffTime;
        if (type == "win") {
            saveObject.win += 1;
            saveObject.enemiesWonTotal += this.gameScene.tribes.length - 2;
            if (saveObject.actualStreak > 0) {
                saveObject.actualStreak++;
            } else {
                saveObject.actualStreak = 1;
            }
            if (saveObject.longestWinStreak < saveObject.actualStreak) {
                saveObject.longestWinStreak = saveObject.actualStreak;
            }
            if (saveObject.fastestWin > diffTime || saveObject.fastestWin == 0) { saveObject.fastestWin = diffTime; }
            if (saveObject.longestWin < diffTime) { saveObject.longestWin = diffTime; }
        } else {
            saveObject.loss += 1;
            saveObject.enemiesLostTotal += this.gameScene.tribes.length - 2;
            if (saveObject.actualStreak < 0) {
                saveObject.actualStreak--;
            } else {
                saveObject.actualStreak = -1;
            }
            if (saveObject.longestLossStreak > saveObject.actualStreak) {
                saveObject.longestLossStreak = saveObject.actualStreak;
            }
            if (saveObject.fastestLoss > diffTime || saveObject.fastestLoss == 0) { saveObject.fastestLoss = diffTime; }
            if (saveObject.longestLoss < diffTime) { saveObject.longestLoss = diffTime; }
        }
        localStorage.setItem("stats", JSON.stringify(saveObject));
        if (game.debug) { console.log("saveStats", JSON.parse(localStorage.getItem("stats"))); }
    }

    clickOptionButton(button) {
        //console.log("clickOptionButton", this, button);
        game.events.emit('toSoundMsg', { type: 'btnClick' });
        switch (button.nr) {
            case 1: // play, fastforward, pause
                if (this.gameScene.status != "playing") { return; }
                this.gameSpeed += 1;
                if (this.gameSpeed > 2) { this.gameSpeed = 0 };
                console.log('gameSpeed', this.gameSpeed);
                game.events.emit('toGameMsg', { type: 'update', gameSpeed: this.gameSpeed });
                break;
            case 2: //mute
                this.mute = !this.mute;
                game.events.emit('toSoundMsg', { type: 'mute', mute: this.mute });
                //console.log('mute', this.mute);
                break;
            case 3: //statistics
                //pause game
                this.gameSpeed = 0;
                game.events.emit('toGameMsg', { type: 'update', gameSpeed: this.gameSpeed });
                this.updateButtonTexture(this.bubbleGroup.children.entries[0]);
                //show the statistics
                this.setInfoPlate({ type: 'statistics', statistics: this.gameScene.statistics, subtype: 'islands' });
                break;
            case 4: //TribeAI on/off
                this.setInfoPlate({ type: 'aiHelp', statistics: this.gameScene.statistics });
                break;
            case 5: //exit game
                //pause game
                this.gameSpeed = 0;
                game.events.emit('toGameMsg', { type: 'update', gameSpeed: this.gameSpeed });
                this.updateButtonTexture(this.bubbleGroup.children.entries[0]);
                //quit confirm
                this.setInfoPlate({ type: 'exit' });
                break;
            default:
                console.log("clickOptionButton_error", this, button);
        }
        this.updateButtonTexture(button);
    };

    updateButtonTexture(button) {
        switch (button.nr) {
            case 1: // play, fastforward, pause
                if (this.gameSpeed == 1) {
                    button.setTexture('images', 'play');
                } else if (this.gameSpeed == 2) {
                    button.setTexture('images', 'fast');
                } else {
                    button.setTexture('images', 'pause');
                }
                break;
            case 2: //mute
                if (this.mute == true) {
                    button.setTexture('images', 'mute');
                } else {
                    button.setTexture('images', 'sound');
                }
                break;
            case 3: //statistic
            case 4: //ai
            case 5: //exit
                break;
            default:
                console.log("updateButtonTexture_error", this, button);
        }
    };

    setInfoPlate(data) {
        //console.log("setInfoPlate", data, this, this.infoContainer);
        //set the width and height
        if (game.mobile == true) {
            switch (data.type) {
                case 'islandInfo':
                    data.width = 800;
                    data.height = 720;
                    break;
                case "statistics":
                    data.width = this.scale.width - 100;
                    data.height = this.scale.height - 300;
                    break;
                case 'exit':
                    data.width = 640;
                    data.height = 420;
                    break;
                case 'aiHelp':
                    data.width = 620;
                    data.height = 400;
                    break;
                default:
            }
        } else {
            switch (data.type) {
                case 'islandInfo':
                    data.width = 680;
                    data.height = 570;
                    break;
                case "statistics":
                    data.width = this.scale.width - 100;
                    data.height = this.scale.height - 300;
                    break;
                case 'exit':
                    data.width = 570;
                    data.height = 350;
                    break;
                case 'aiHelp':
                    data.width = 550;
                    data.height = 380;
                    break;
                default:
            }
        }
        var x = this.scale.width + 200;  //startposition outside of the screen
        var y = this.scale.height / 2 - data.height / 2 - 20;   //in the middle of the y-axis
        this.plate.visible = true;
        this.plate.active = true;
        if (this.infoContainer.tween != undefined) { this.infoContainer.tween.stop(); }
        if (this.infoContainer.visible == true) {        //ToDo
            //infoPlate is visible, so there is no tween necessary
            x -= data.width;
            this.removeInfoPlate();
            this.infoContainer.visible = true; //set back to visible, because in "removeInfoPlate" it is set to false
        } else {
            this.removeInfoPlate();
            this.infoContainer.x = 0;
            this.plate.x = 0;
        }

        //Background
        this.plate.fillStyle('0xd2e0f4', 1);
        this.plate.fillRect(x, y, data.width, data.height);
        //Border
        this.plate.lineStyle(5, '0xe2f1ff', 1); //white
        this.plate.strokeRect(x + 2, y + 2, data.width - 4, data.height - 4);
        //back button
        var button = this.newSprite(x, y + data.height / 2 - 50, "plateBack", 0, "images", "back", 0.1);
        if (game.mobile == true) { button.scale = 1.8; } else { button.scale = 1.3 }
        button.on('pointerup', function (button, data) {
            this.tweenInfoPlate(-data.width, 700);
            this.time.addEvent({
                delay: 700, callback: function () {
                    this.removeInfoPlate();
                }, callbackScope: this
            });
        }.bind(this, button, data));

        //Header
        switch (data.type) {
            case 'islandInfo': var tHeader = this.lang.mm_i_header[this.settings.lang]; break;
            case "statistics": var tHeader = this.lang.mm_s_header[this.settings.lang]; break;
            case 'exit': var tHeader = this.lang.mm_e_header[this.settings.lang]; break;
            case 'aiHelp': var tHeader = this.lang.mm_h_header[this.settings.lang]; break;
            default:
        }
        if (game.mobile == true) { var tFont = { font: 'bold 45px Arial', fill: 'black' } } else { var tFont = { font: 'bold 35px Arial', fill: 'black' } }
        this.newText(x + 40, y + 18, tHeader, tFont, 0);
        //separator
        this.plate.fillStyle('0x7bb4f2', 1);
        this.plate.fillRoundedRect(x + 40, y + 60, data.width, 8, 4);

        //console.log("setinfoplate", type, data, x, y, this);
        //differ between the different types of information
        switch (data.type) {
            case 'islandInfo':
                //infotext
                var tIsland = data.island;
                var iInfo =
                    this.lang.mm_i_name[this.settings.lang] + ": " + tIsland.name + "\n" +
                    this.lang.mm_i_nr[this.settings.lang] + ": " + tIsland.nr + "\n" +
                    this.lang.mm_i_scale[this.settings.lang] + ": " + tIsland.scale + "\n" +
                    this.lang.mm_i_buildState[this.settings.lang] + ": " + tIsland.buildState + "\n" +
                    this.lang.mm_i_buildSpeed[this.settings.lang] + ": " + tIsland.buildSpeed + "\n" +
                    this.lang.mm_i_currBuild[this.settings.lang] + ": "
                for (var i = 0; i < this.gameScene.gameData.techObjects.length; i++) {
                    if (tIsland.currentBuild & parseInt(this.gameScene.gameData.techObjects[i].binary, 2)) {
                        iInfo = iInfo + this.lang.techobj_id[i].name[this.settings.lang];
                        break;
                    }
                }
                iInfo = iInfo + "\n" + this.lang.mm_i_currBuildConstTime[this.settings.lang] + ": " + Phaser.Math.FloorTo(tIsland.currentBuildConstTime, 0) + "\n" +
                    this.lang.mm_i_currBuildConstMax[this.settings.lang] + ": " + tIsland.currentBuildConstMax + "\n" +
                    this.lang.mm_i_population[this.settings.lang] + ": " + tIsland.population.toFixed(3) + "\n" +
                    this.lang.mm_i_populationRate[this.settings.lang] + ": " + tIsland.populationRate.toFixed(3) + "\n" +
                    this.lang.mm_i_defence[this.settings.lang] + ": " + tIsland.defence.toFixed(3) + "\n" +
                    this.lang.mm_i_attack[this.settings.lang] + ": " + tIsland.attack.toFixed(3) + "\n" + "\n" +
                    this.lang.mm_i_player[this.settings.lang] + ": " + this.gameScene.tribes[tIsland.tribe].name + "\n" +
                    this.lang.mm_i_aiLevel[this.settings.lang] + ": " + this.gameScene.tribes[tIsland.tribe].aiLevel;
                if (game.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: 'black' } } else { var tFont = { font: 'bold 28px Arial', fill: 'black' } }
                this.newText(x + 70, y + 80, iInfo, tFont, 0);

                break;
            case 'statistics':
                //statistic-plate
                var graph = this.add.graphics();
                this.infoContainer.add(graph);
                //duration
                if (game.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: 'black' } } else { var tFont = { font: 'bold 28px Arial', fill: 'black' } }
                var textAxisY = this.newText(x + data.width - 470, y + data.height - 90,
                    this.lang.mm_s_playtime[this.settings.lang] + ": 00:00", tFont, 0);
                //SubHeader
                if (game.mobile == true) { var tFont = { font: 'bold 40px Arial', fill: 'black' } } else { var tFont = { font: 'bold 34px Arial', fill: 'black' } }
                var subheader = this.newText(x + data.width / 2, y + 100, this.lang.mm_s_islands[this.settings.lang], tFont, 0);

                //different buttons
                var subTypeText;
                var subIcon;
                var subHeaderText;
                for (i = 1; i <= 3; i++) {
                    switch (i) {
                        case 1: subTypeText = "islands"; subIcon = "islands"; subHeaderText = this.lang.mm_s_islands[this.settings.lang]; break;
                        case 2: subTypeText = "population"; subIcon = "population"; subHeaderText = this.lang.mm_s_population[this.settings.lang]; break;
                        case 3: subTypeText = "buildings"; subIcon = "techTree"; subHeaderText = this.lang.mm_s_buildings[this.settings.lang]; break;
                    }
                    var button = this.newSprite(x + 200, y + i * 200, "statisticsSubtype", i, "images", subIcon, 0.5);
                    button.on('pointerup', function (x, y, data, graph, subheader, subTypeText, subHeaderText) {
                        //console.log("setInfoPlateSubType", data);
                        data.subtype = subTypeText;
                        subheader.text = subHeaderText;
                        this.setInfoPlateSubType(x, y, data, graph, textAxisY);
                    }.bind(this, x, y, data, graph, subheader, subTypeText, subHeaderText));

                }
                //color & tribe-names
                for (var i = 1; i < this.gameScene.tribes.length; i++) {
                    if (game.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: this.gameScene.tribes[i].color.replace("0x", "#") } } else { var tFont = { font: 'bold 28px Arial', fill: this.gameScene.tribes[i].color.replace("0x", "#") } }
                    var text = this.newText(x + 200 + (data.width - 600) / this.gameScene.tribes.length * i, y + data.height - 60, this.gameScene.tribes[i].name, tFont, 0);
                    text.setShadow(2, 2, "#333333", 2, true, true);
                }
                //draw the first statistic-curve
                this.setInfoPlateSubType(x, y, data, graph, textAxisY);
                break;
            case "exit":
                if (this.gameScene.status == "end") {
                    this.gameScene.status = "stop";
                    this.scene.start("mainMenu");
                    this.scene.stop("playGame");
                    this.scene.stop("miniMap");
                    return;
                }
                //infotext
                if (game.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: 'black' } } else { var tFont = { font: 'bold 28px Arial', fill: 'black' } }
                this.newText(x + 70, y + 80, this.lang.mm_e_text[this.settings.lang], tFont, 0);
                //save Button
                var button = this.newSprite(x + (data.width - 200) / 2 - 70, y + data.height - 80, "save", 0, "images", "save", 0.5);
                if (game.mobile == true) { button.scale = 1.4; } else { button.scale = 1.0 }
                button.on('pointerup', function (x, y, data, graph, subheader, subTypeText) {
                    this.scene.gameScene.status = "stop";
                    this.scene.saveGame();
                    this.scene.scene.start("mainMenu");
                    this.scene.scene.stop("playGame");
                    this.scene.scene.stop("miniMap");
                });
                //quit Button
                var button = this.newSprite(x + (data.width - 200) / 2 + 70, y + data.height - 80, "quit", 0, "images", "door", 0.5);
                if (game.mobile == true) { button.scale = 1.4; } else { button.scale = 1.0 }
                button.on('pointerup', function (x, y, data, graph, subheader, subTypeText) {
                    this.scene.gameScene.status = "stop";
                    this.scene.saveGameStats(0);
                    localStorage.removeItem("saveGame");
                    this.scene.scene.start("mainMenu");
                    this.scene.scene.stop("playGame");
                    this.scene.scene.stop("miniMap");
                });
                break;
            case "aiHelp":
                //infotext
                if (game.mobile == true) { var tFont = { font: 'bold 35px Arial', fill: 'black' } } else { var tFont = { font: 'bold 28px Arial', fill: 'black' } }
                this.newText(x + 70, y + 80, this.lang.mm_h_text[this.settings.lang], tFont, 0);
                this.newText(x + 130, y + 230, this.lang.mm_h_attack[this.settings.lang], tFont, 0.5);
                this.newText(x + 130, y + data.height - 60, this.lang.mm_h_build[this.settings.lang], tFont, 0.5);
                //attack Button
                var button = this.newSprite(x + data.width - 290, y + 230, "aiHelp", 0, "images", "aiAttack", 0.5);
                if (game.mobile == true) { button.scale = 0.9; } else { button.scale = 0.6; }
                button.on('pointerup', function () {
                    this.scene.gameScene.tribes[1].ai ^= 1;
                    if (this.scene.gameScene.tribes[1].ai & 1) {
                        this.setTint("0xed5400");
                    } else {
                        this.clearTint();
                    }
                });
                if (this.gameScene.tribes[1].ai & 1) { button.setTint("0xed5400"); }
                //build Button
                var button = this.newSprite(x + data.width - 290, y + data.height - 60, "aiHelp", 1, "images", "aiBuild", 0.5);
                if (game.mobile == true) { button.scale = 0.9; } else { button.scale = 0.6; }
                button.on('pointerup', function () {
                    this.scene.gameScene.tribes[1].ai ^= 2;
                    if (this.scene.gameScene.tribes[1].ai & 2) {
                        this.setTint("0xed5400");
                    } else {
                        this.clearTint();
                    }
                });
                if (this.gameScene.tribes[1].ai & 2) { button.setTint("0xed5400"); }

                break;
            default:
                console.log("setInfoPlate_error", this, type, data);
        }
        //when everything is created, add a smooth tween to show the data
        if (this.infoContainer.visible != true) {
            //move the infoPlate into the screen
            this.tweenInfoPlate(data.width, 1000);
            this.infoContainer.visible = true;
        }
    }

    setInfoPlateSubType(x, y, data, graph, textAxisY) {
        if (game.debug) { console.log("setInfoPlateSubType", data); }
        graph.clear();
        var duration = 0;
        //data.statistics[0].duration = 0;
        for (var i = 1; i < data.statistics.length; i++) {
            //data.statistics[i].duration = data.statistics[i].time - data.statistics[i - 1].time;
            if (data.statistics[i].type != "resume") {
                duration += data.statistics[i].duration;
            }
        }
        textAxisY.text = this.lang.mm_s_playtime[this.settings.lang] + ": " + Math.floor(duration / 1000 / 60) + ':' + ('0' + Math.floor(duration / 1000 % 60)).slice(-2);
        var stepX = duration / (data.width - 700);
        if (stepX == 0) { stepX = 1 };

        //statistic-curve   
        //draw the axis
        if (game.mobile == true) { graph.lineStyle(7, '0x000000', 1); } else { graph.lineStyle(5, '0x000000', 1); }
        graph.strokePoints([{ x: x + 400 - 3, y: y + 200 - 3 }, { x: x + 400 - 3, y: y + data.height - 100 + 3 }, { x: x + data.width - 300, y: y + data.height - 100 + 3 }], false, false);
        //differ between the subtypes (islands, polulation, builds, ...)
        switch (data.subtype) {
            case 'islands':
                //now the data
                var stepY = (data.height - 300) / data.statistics[0].islands;
                for (var j = 1; j < data.statistics[0].tribes.length; j++) {
                    var i = 0;
                    var graphDuration = 0;
                    var curvepoints = new Array();
                    curvepoints.push({ x: x + 399 + graphDuration / stepX, y: y + data.height - 100 - stepY * data.statistics[i].tribes[j].islands });
                    for (i = 0; i < data.statistics.length; i++) {
                        //console.log("curvepoints", i, j, curvepoints);
                        if (data.statistics[i].type != "resume") {
                            graphDuration += data.statistics[i].duration;
                            curvepoints.push({ x: x + 400 + graphDuration / stepX, y: y + data.height - 100 - stepY * data.statistics[i].tribes[j].islands });
                        }
                    }
                    if (game.mobile == true) { graph.lineStyle(8, this.gameScene.tribes[j].color, 1); } else { graph.lineStyle(6, this.gameScene.tribes[j].color, 1); }
                    graph.strokePoints(curvepoints, false, false);
                }
                break;
            case 'population':
                //get maxPopulation
                //var stepY = data.statistics[data.statistics.length-1].populationMax;
                var stepY = 0;
                for (var j = 1; j < data.statistics[0].tribes.length; j++) {
                    var tempY = data.statistics[data.statistics.length - 1].tribes[j].population;
                    if (tempY > stepY) { stepY = tempY }
                }
                stepY = (data.height - 300) / (stepY + 100);
                for (var j = 1; j < data.statistics[0].tribes.length; j++) {
                    var i = 0;
                    var graphDuration = 0;
                    var curvepoints = new Array();
                    curvepoints.push({ x: x + 399 + graphDuration / stepX, y: y + data.height - 100 - stepY * data.statistics[i].tribes[j].population });
                    for (i = 0; i < data.statistics.length; i++) {
                        //console.log("curvepoints", i, j, curvepoints);
                        if (data.statistics[i].type != "resume") {
                            graphDuration += data.statistics[i].duration;
                            curvepoints.push({ x: x + 400 + graphDuration / stepX, y: y + data.height - 100 - stepY * data.statistics[i].tribes[j].population });
                        }
                    }
                    if (game.mobile == true) { graph.lineStyle(8, this.gameScene.tribes[j].color, 1); } else { graph.lineStyle(6, this.gameScene.tribes[j].color, 1); }
                    graph.strokePoints(curvepoints, false, false);
                }
                break;
            case 'buildings':
                //get maxBuildings
                /*var stepY = 0;
                for (var j = 1; j < data.statistics[0].tribes.length; j++) {
                    var tempY = data.statistics[data.statistics.length - 1].tribes[j].buildings;
                    if (tempY > stepY) { stepY = tempY }
                }*/
                var stepY = data.statistics[data.statistics.length - 1].buildingsMax;
                stepY = (data.height - 400) / (stepY);
                for (var j = 1; j < data.statistics[0].tribes.length; j++) {
                    var i = 0;
                    var graphDuration = 0;
                    var curvepoints = new Array();
                    curvepoints.push({ x: x + 399 + graphDuration / stepX, y: y + data.height - 100 - stepY * data.statistics[i].tribes[j].buildings });
                    for (i = 0; i < data.statistics.length; i++) {
                        //console.log("curvepoints", "statpoint: " + i, "tribe: " + j, curvepoints);
                        if (data.statistics[i].type != "resume") {
                            graphDuration += data.statistics[i].duration;
                            curvepoints.push({ x: x + 400 + graphDuration / stepX, y: y + data.height - 100 - stepY * data.statistics[i].tribes[j].buildings });
                        }
                    }
                    if (game.mobile == true) { graph.lineStyle(8, this.gameScene.tribes[j].color, 1); } else { graph.lineStyle(6, this.gameScene.tribes[j].color, 1); }
                    graph.strokePoints(curvepoints, false, false);
                }
                break;
            default:
                console.log("setInfoPlate_subtype_error", this, data);
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
            case "aiHelp":
                break; //cancel
            case "plateBack":
                button.on('pointerover', function () {
                    this.setTint("0xaaaaaa");
                })
                button.on('pointerout', function () {
                    this.clearTint();
                });
                break;
            default:
                button.on('pointerover', function () {
                    this.setTint("0xed5400");
                })
                button.on('pointerout', function () {
                    this.clearTint();
                });
                break;
        }
        return button;
    }

    removeInfoPlate() {
        //console.log("infoPlate_destroy", this.infoContainer, this); 
        for (var i = 0; i < this.infoContainer.list.length; i++) {
            if (this.infoContainer.list[i].type == "Text") {
                this.textGroup.killAndHide(this.infoContainer.list[i]);
                this.infoContainer.list[i].setShadow(0, 0, "#000", 0, false, false);
            } else if (this.infoContainer.list[i].type == "Sprite") {
                this.spriteGroup.killAndHide(this.infoContainer.list[i]);
                this.infoContainer.list[i].clearTint();
                this.infoContainer.list[i].scale = 1;
            } else if (this.infoContainer.list[i].type == "Graphics" && i > 0) {    //statistic curves
                this.infoContainer.list[i].destroy();
            }
        };
        this.infoContainer.x = 0;
        this.infoContainer.visible = false;
        this.plate.clear();
        this.plate.x = 0;
    }

    tweenInfoPlate(x, duration) {
        if (duration === undefined) { duration = 1000 }
        if (this.infoContainer.tween != undefined) { this.infoContainer.tween.stop(); }
        this.infoContainer.tween = this.tweens.add({
            targets: this.infoContainer,
            x: this.infoContainer.x - x,
            ease: 'Back',       // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Sine.easeInOut'
            duration: duration,
            repeat: 0,            // -1: infinity
            yoyo: false,
            onComplete: function () { this.infoContainer.tween = null; }.bind(this)
        });
    }
};

