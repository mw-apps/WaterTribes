/// <reference path="modules/phaser.js" />
/** @type {import("./modules/phaser.js")} */

/**
 * LINKS:
 * http://free-tex-packer.com/app/
 * https://gammafp.com/tools/
 * 
ToDo:
* save/load Game: localStorage/json (tribes, islands, maps, ships?)
**/

class cGame extends Phaser.Scene {
    constructor() {
        super("playGame");
        this.aaaaa = "playGame";
        this.status = "constructor";
        this.debug = false;
        this.tribes = new Array();   //each tribe is stored in this group
        this.islandGroup;    //each island
        this.shipGroup;      // all active Ships are stored in this group
        this.updateTimer = 0;    //Counter for the game_Update-fuction. used for the ship and build calls
        this.plotter;            //used to paint the ship path (used if this.debug == true)
        this.gameData;  //we get the gameData out of this JSON-File
        this.gameSpeed = 1; //start-value
        this.cam;       //the camera of this scene
        this.controls;  //cursor-keys
        this.statistics = new Array();    //save all events (newIsland, buildprocess, polulation) for some statistics
    }

    preload() {
        this.load.scenePlugin('rexgesturesplugin', './modules/rexgesturesplugin.min.js', 'rexGestures', 'rexGestures');
    }

    create(data) {
        //console.log("create", data);
        if (data == undefined) {
            data.tribes = [];
            data.tribes.push({ name: "you", colorNr: 0, aiLevel: 3 });
            data.tribes.push({ name: "CPU_1", colorNr: 1, aiLevel: 1 });
            data.islands = 15;
            data.sound = 0;
            data.loadGame = 0;
        }
        //world-settings
        //set the bounds of the world
        //gamearea: 2000x2000=4000000px
        //if (game.scale.height < game.scale.width) { aspectRatio = game.scale.height / game.scale.width; } else { aspectRatio = game.scale.width / game.scale.height; };
        var aspectRatio;
        aspectRatio = game.scale.height / game.scale.width;
        var tWidth = Math.sqrt(4000000 / aspectRatio);
        var tHeight = tWidth * aspectRatio;
        game.scale.resize(tWidth, tHeight);
        this.cam = this.cameras.main;
        this.cam.setBounds(0, 0, tWidth, tHeight);
        this.cam.bounds = this.cam.getBounds();
        this.cam.setViewport(0, 0, tWidth, tHeight);
        this.camZoomMin = game.scale.width / tWidth;
        this.camZoomMax = this.camZoomMin * 3;
        this.cam.zoom = this.camZoomMax - this.camZoomMin;  //startzoom

        //console.log("camera", aspectRatio, this.cam, 0, 0, tWidth, tHeight, "game", game.scale.width, game.scale.height);

        //load the gameData and gameSettings
        this.gameData = this.cache.json.get('gameData');    //json-parce(json.stringify -> copy of the original
        //backgroundimage
        var background = this.add.sprite(-150, 0, "background");
        background.setOrigin(0);

        if (background.width - 200 < this.cam.bounds.width) { background.scale = (this.cam.bounds.width / (background.width - 200) * 2); }
        if (background.height - 200 < this.cam.bounds.height) { background.scale = (this.cam.bounds.height / (background.height - 200) * 2); }
        var settings = JSON.parse(localStorage.getItem("settings"));
        if (settings.waveMotion == true) {
            this.tweens.add({
                targets: background,
                props: {
                    x: { value: 0, duration: 8000, ease: 'Sine.easeInOut' },
                    y: { value: -50, duration: 8000, ease: 'Sine.easeInOut' }
                },
                repeat: -1,            // -1: infinity
                yoyo: true
            });
        }

        //tribes
        this.tribes = new Array();   //each tribe is stored in this group
        this.tribes[0] = (new Tribe(this, 0, 'empty', '0xffffff'));
        this.tribes[1] = (new Tribe(this, 1, data.tribes[0].name, this.gameData.tribeColors[data.tribes[0].colorNr].replace("#", "0x")));
        this.tribes[1].ai = 0;
        this.tribes[1].aiLevel = 3;
        for (var i = 1; i < data.tribes.length; i++) {
            this.tribes[i + 1] = (new Tribe(this, i + 1, data.tribes[i].name, this.gameData.tribeColors[data.tribes[i].colorNr].replace("#", "0x")));
            this.tribes[i + 1].ai = 3;
            this.tribes[i + 1].aiLevel = data.tribes[i].aiLevel;
        }

        //build the islands, incl bubbles and the ship-sprite
        this.islandGroup = this.add.group();
        this.islandGroup.count = data.islands;
        this.createIslands(this);

        //shipGroup
        this.shipGroup = this.add.group();

        //waypoint plotter  //ToDo: remove at the final stage
        if (this.debug == true) { this.plotter = this.add.graphics(); }

        //input for camzoom -> cursor-keys & mousewheel
        var cursors = this.input.keyboard.createCursorKeys();
        var controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            acceleration: 0.4,
            drag: {
                x: 0.005,
                y: 0.005
            },
            maxSpeed: 1.0
        };
        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        this.input.on('wheel', function (pointer, currentlyOver, dx, dy, dz, event) {
            var value;
            if (dy < 0) { value = -0.5 * this.cam.zoom / 3 } else { value = 0.5 * this.cam.zoom / 3 }
            //console.log("zoom", this.cam.zoom, value);
            if (this.cam.zoom + value < this.camZoomMin) {
                value = this.camZoomMin - this.cam.zoom;
            } else if (this.cam.zoom + value > this.camZoomMax) {
                value = this.camZoomMax - this.cam.zoom;
            }
            this.cam.zoomTo(this.cam.zoom + value, 250, "Linear");
        }, this);

        //set the camera to the start-island
        this.cam.centerOn(this.islandGroup.children.entries[this.tribes[1].islands[0]].x, this.islandGroup.children.entries[this.tribes[1].islands[0]].y);

        //swipe/pinch
        var gestures = this.rexGestures.add.pinch();
        gestures
            .on('drag1', function (pinch) {
                //var drag1Vector = pinch.drag1Vector;
                this.cam.scrollX -= pinch.drag1Vector.x / this.cam.zoom;
                this.cam.scrollY -= pinch.drag1Vector.y / this.cam.zoom;
            }, this)
            .on('pinch', function (pinch) {
                //var scaleFactor = pinch.scaleFactor;
                this.cam.zoom *= pinch.scaleFactor;
                if (this.cam.zoom < this.camZoomMin) { this.cam.zoom = this.camZoomMin; }
                if (this.cam.zoom > this.camZoomMax) { this.cam.zoom = this.camZoomMax; }
            }, this);

        // Listen for events
        game.events.on('toGameMsg', function (data) {
            this.newMessage(data);
        }, this);

        this.gameSpeed = 1;

        //at the end load the HUD minimap
        this.scene.launch("miniMap");

        this.statistics = new Array();
        this.getStatistics();
        this.status = "playing";
    }

    newMessage(data) {
        //kommunication with the miniMap-Screen
        //console.log("Game_newMessage", this, data); 
        switch (data.type) {
            case "init":
                game.events.emit('toMiniMapMsg', { type: 'init', gameSpeed: this.gameSpeed, tribeAi: this.tribes[1].ai });
                break;
            case 'update':
                if ("gameSpeed" in data) { this.gameSpeed = data.gameSpeed };
                if ("tribeAi" in data) { this.tribes[1].ai = data.tribeAi };
                break;
            default:
                console.log("Game_newMessage_error", this, data);
        }
    }

    update(time, delta) {
        if (this.status != "playing") { return };

        this.controls.update(delta);
        if (this.gameSpeed > 0) {
            //call the updatefunctions for each ship, island and ai-player
            //this.updateTimer += game.time.physicsElapsed * gameSpeed;
            //delta about 15-16ms   0.015
            this.updateTimer += delta * this.gameSpeed;


            //ships
            for (i = 0; i < this.shipGroup.children.entries.length; i++) {
                if (this.shipGroup.children.entries[i].isSailing == true) {
                    this.shipGroup.children.entries[i].sailCounter += this.gameSpeed / 20;
                    if (this.shipGroup.children.entries[i].sailCounter >= this.shipGroup.children.entries[i].speed) {
                        this.shipGroup.children.entries[i].sailCounter %= this.shipGroup.children.entries[i].speed;
                        this.shipGroup.children.entries[i].sailing();
                    }
                }
            }

            if (this.updateTimer >= 150) {
                var i;

                //islands
                for (i = 0; i < this.islandGroup.children.entries.length; i++) {
                    this.islandGroup.children.entries[i].checkPopulation();
                    this.islandGroup.children.entries[i].checkBuild();
                }

                //ai-players
                for (i = 0; i < this.tribes.length; i++) {
                    if (this.tribes[i].ai > 0) {
                        this.tribes[i].aiCounter += this.updateTimer / 2000;
                        if (this.tribes[i].aiCounter >= 1 + 1 / this.tribes[i].aiLevel * 2) {
                            if (this.tribes[i].ai & 1) {
                                for (var j = 1; j < this.tribes[i].aiCounter; j++) {
                                    this.tribes[i].aiAttack(this); //call attack multiple times, if we cancel at first, try again
                                }
                            }
                            if (this.tribes[i].ai & 2) {
                                this.tribes[i].aiBuild(this);
                            }
                            this.tribes[i].aiCounter -= 1 + 1 / this.tribes[i].aiLevel * 1.5;
                        }
                    }
                }

                this.updateTimer %= 50;
            }
        }
    }


    //Island
    createIslands() {
        //place the Islands randomly on the map (no overlap!)
        var i;  //loop till island max
        var j;  //check if new island overlaps with the existing
        var overlap;    //true/false
        var tIsland; //new Island
        var tChild;     //childIsland, used in the overlap-check
        var tIslandPoint = new Phaser.Geom.Point();  //position of the new Island, used for distance calculation
        var tTemp;  //islandname

        //create the Islands one by one
        for (i = 0; i < this.islandGroup.count; i++) {
            //get new Islandname
            tTemp = this.gameData.islandNames[Math.floor(Math.random() * this.gameData.islandNames.length)];
            //remove the selected name from the name pool
            var indexName = this.gameData.islandNames.indexOf(tTemp);
            if (indexName > -1) {
                this.gameData.islandNames.splice(indexName, 1);
            }

            //create new island
            var tIsland = new Island({ scene: this, x: 200, y: 200, islandNr: i, islandName: tTemp });
            if (i + 1 < this.tribes.length) {
                tIsland.tribe = i + 1;
                tIsland.text.fill = this.tribes[i + 1].color;
                tIsland.flag.tint = this.tribes[i + 1].color;
                tIsland.populationMax = 100;
                tIsland.scale = 0.5;
                tIsland.halfWidth = tIsland.displayWidth / 2;
                tIsland.halfHeight = tIsland.displayHeight / 2;
                tIsland.population = 20;
                tIsland.buildState = parseInt('10011', 2);  // ToDo     //start island has startbuildings (outpost & shipyard)
                this.tribes[i + 1].newIsland(this, i);
                //console.log("createTribeIsland", tIsland.name, tIsland);
            }
            //calculate the new position (keep some distance between the islands)3
            var looper = 0;
            var cancel = false;
            do {
                var iPositionX = Phaser.Math.Between(tIsland.width, this.cam.bounds.width - tIsland.width);
                var iPositionY = Phaser.Math.Between(tIsland.height, this.cam.bounds.height - tIsland.height);
                tIslandPoint.setTo(iPositionX, iPositionY);
                //check if islands overlap
                overlap = false;
                for (j = 0; j < this.islandGroup.children.entries.length; j++) {
                    tChild = this.islandGroup.children.entries[j];
                    //be sure the new island is away enough from the esiting ones
                    if (Phaser.Math.Distance.Between(tChild.x, tChild.y, tIslandPoint.x, tIslandPoint.y) < 250) {
                        //console.log("check island overlap", "OVERLAP");
                        overlap = true;
                        break;
                    }
                }
                looper++;
                if (looper > 700) {
                    cancel = true;
                    break;
                }
            } while (overlap == true)

            if (cancel == true) {
                //remove the Island and skip the rest
                this.islandGroup.remove(tIsland);
                tIsland.flag.destroy();
                tIsland.text.destroy();
                tIsland.destroy();
                console.log('createIslands', 'islands overlap error');
            } else {
                //set new position
                tIsland.x = iPositionX;
                tIsland.y = iPositionY;
                tIsland.text.x = tIsland.x;
                tIsland.text.y = tIsland.y;
                tIsland.flag.x = tIsland.x;
                tIsland.flag.y = tIsland.y;
                this.islandGroup.add(tIsland);
                //console.log("createIsland_checkBounds", this.cam.bounds, tIsland);

                //each island has its own bubbleGroup
                tIsland.bubbleGroup = this.add.group();
                this.createBubbles(tIsland);

                //buildShip-Bubble
                tIsland.bubbleGroup.children.entries[5].x = tIsland.x + tIsland.halfWidth + 20;
                tIsland.bubbleGroup.children.entries[5].y = tIsland.y + tIsland.halfHeight - 20;
                //attack-Bubble
                tIsland.bubbleGroup.children.entries[6].x = tIsland.x - tIsland.halfWidth - 20;
                tIsland.bubbleGroup.children.entries[6].y = tIsland.y + tIsland.halfHeight - 20;
                //ship
                tIsland.bubbleGroup.children.entries[7].x = tIsland.x - 20
                tIsland.bubbleGroup.children.entries[7].y = tIsland.y + tIsland.halfHeight;
                tIsland.bubbleGroup.children.entries[7].rotation = -1.3;
                //initialize
                tIsland.completeBuild();
                //*/
            }
        }
        //*/
    }


    //Bubble
    createBubbles(tIsland) {
        //create the bubble-sprites, the positions will be set afterwards
        //console.log("createBubbles", this, tIsland);
        var i;
        var tBubble;
        for (i = 0; i < 8; i++) {
            tBubble = new Bubble(this);
            tBubble.nr = i;
            tBubble.islandNr = tIsland.nr;
            tBubble.setting = 0;
            tBubble.constDuration = 0;
            tBubble.aiProbability = 0;
            tBubble.x = tIsland.x;
            tBubble.y = tIsland.y - tIsland.halfHeight - 30;
            tIsland.bubbleGroup.add(tBubble);
            if (i < 7) {    //the Island-Ship can not be clicked
                tBubble.setInteractive();
                tBubble.on('pointerup', function (pointer, localX, localY, event) {
                    //console.log("pUp", this, pointer, localX, localY, event, this.scene.islandGroup); 
                    var tIsland = this.scene.islandGroup.children.entries[this.islandNr];
                    tIsland.newBuild(this, pointer);
                });
            }

        }
        //tIsland.bubbleGroup.children.entries[0].setOrigin(0.5, 0.5);
        //console.log("createBubbles", tIsland);
    };


    setShipPath(startX, startY, aimIsland) {
        //console.log("setShipPath", this, startX, startY, aimIsland);
        new Phaser.Geom.Line(200, 300, 600, 300);
        var points = new Array();   //the new waypoints
        var pointsX = new Array();  //the x-koordinate of the waypoints
        var pointsY = new Array();  //the x-koordinate of the waypoints
        var waySection = new Phaser.Geom.Line(startX, startY, aimIsland.x, aimIsland.y);   //the way from the last to the next waypoint. needed to calculate the distance and the angle
        var waypoints = new Array();    //save-array for each calculalted waypoints
        var iCorner = new Array();  //the corner of the current island
        var iCenter = new Array();  //the center of the current island
        var iLine = new Phaser.Geom.Line();    //way from iCenter to iCorner
        var newWP = {};             //if there is a collision between waySection and iLine then short-term save the corner
        var i;  //counter, go through each island
        var j;  //counter, check 2 corners, of each island
        var tCorner;    //id, wich option to use (wich two corners)
        var tIsland;    //temp Island
        var maxDist;    //hole distance between start and endpoint of points
        var looper = false; //loop the calculation until there is no intersection


        points[0] = ({ 'x': startX, 'y': startY, 'dist': 0 });    //set startpoint
        maxDist = 0;

        //console.log("setShipPath0", points, points.length);
        //loop the calculation until there is no intersection any more
        do {
            //next corner waypoint
            newWP.x = 0;
            newWP.y = 0;
            newWP.dist = 0;
            //console.log('initWP', points);
            looper = false;
            //check each , exept the aim-Island
            for (i = 0; i < this.islandGroup.children.entries.length; i++) {
                if (i != aimIsland.nr) {
                    tIsland = this.islandGroup.children.entries[i];
                    iCenter.x = tIsland.x;
                    iCenter.y = tIsland.y;

                    //options: get the corners we have to check the intersection with the waySection with
                    // 6 | _7_ | 8  //1 & 8: top left, bottom right       //3 & 6: bottom left, top right
                    // 4 ||___|| 5  //2:     bottom left, bottom right    //7:     top left, top right
                    // 1 |  2  | 3  //4:     top left, bottom left        //5:     top right, bottom right
                    if (waySection.y1 > tIsland.y + tIsland.halfHeight) {
                        if (waySection.x1 < tIsland.x - tIsland.halfWidth) {
                            tCorner = 1;
                        } else if (waySection.x1 > tIsland.x + tIsland.halfWidth) {
                            tCorner = 3;
                        } else {
                            tCorner = 2;
                        }
                    } else if (waySection.y1 < tIsland.y - tIsland.halfHeight) {
                        if (waySection.x1 < tIsland.x - tIsland.halfWidth) {
                            tCorner = 6;
                        } else if (waySection.x1 > tIsland.x + tIsland.halfWidth) {
                            tCorner = 8;
                        } else {
                            tCorner = 7;
                        }
                    } else {
                        if (waySection.x1 < tIsland.x) {
                            tCorner = 4;
                        } else {
                            tCorner = 5;
                        }
                    }

                    //check if the section iCenter to iCorner intersect with the current waySection
                    //if so, set se Corner as new waypoint and check each island again
                    for (j = 0; j < 2; j++) {
                        //get the correct corner, depending on the detected option
                        if (j == 0) {
                            switch (tCorner) {
                                case 1:
                                case 4:
                                case 7:
                                case 8:
                                    iCorner = { 'x': tIsland.x - tIsland.halfWidth - 5, 'y': iCorner.y = tIsland.y - tIsland.halfHeight - 5 }; break; //top left
                                case 2:
                                case 3:
                                case 6:
                                    iCorner = { 'x': tIsland.x - tIsland.halfWidth - 5, 'y': iCorner.y = tIsland.y + tIsland.halfHeight + 5 }; break; //bottom left
                                case 5:
                                    iCorner = { 'x': tIsland.x + tIsland.halfWidth + 5, 'y': iCorner.y = tIsland.y - tIsland.halfHeight - 5 }; break; //top right
                            }
                        } else {
                            switch (tCorner) {
                                case 1:
                                case 2:
                                case 5:
                                case 8:
                                    iCorner = { 'x': tIsland.x + tIsland.halfWidth + 5, 'y': iCorner.y = tIsland.y + tIsland.halfHeight + 5 }; break; //bottom right
                                case 3:
                                case 6:
                                case 7:
                                    iCorner = { 'x': tIsland.x + tIsland.halfWidth + 5, 'y': iCorner.y = tIsland.y - tIsland.halfHeight - 5 }; break; //top right
                                case 4:
                                    iCorner = { 'x': tIsland.x - tIsland.halfWidth - 5, 'y': iCorner.y = tIsland.y + tIsland.halfHeight + 5 }; break; //bottom left
                            }
                        }
                        iCorner.dist = Phaser.Math.Distance.Between(waySection.x1, waySection.y1, iCorner.x, iCorner.y);
                        iLine.setTo(iCorner.x, iCorner.y, iCenter.x, iCenter.y);
                        //do the two lines cross? if so, set the corner as new waypoint
                        //dist check, so the bottom left corner will not count (better look) and the no cornercollisions (min dist > 5)
                        if (Phaser.Geom.Intersects.LineToLine(waySection, iLine) && iCorner.dist > 5) {
                            if (looper == false || newWP.dist > iCorner.dist) {
                                newWP = { 'x': iCorner.x, 'y': iCorner.y, 'dist': iCorner.dist };
                                //console.log('intersection', tIsland.nr, tIsland.name, newWP);
                                looper = true;
                            }
                        }

                    }
                }
            }
            if (looper != true) {
                //no intersection, so the last waypoint is the target
                newWP = { 'x': waySection.x2, 'y': waySection.y2, 'dist': Phaser.Math.Distance.Between(waySection.x2, waySection.y2, waySection.x1, waySection.y1) };
                //console.log('no_intersection', newWP);
            }
            //console.log('points.push', newWP);
            points.push({ 'x': newWP.x, 'y': newWP.y, 'dist': newWP.dist });
            maxDist += newWP.dist;
            waySection.x1 = newWP.x
            waySection.y1 = newWP.y;
        } while (looper == true);

        //let the ship end a little bit before the island
        iLine.x1 = points[points.length - 2].x;
        iLine.y1 = points[points.length - 2].y;
        iLine.x2 = points[points.length - 1].x;
        iLine.y2 = points[points.length - 1].y;
        iLine = Phaser.Geom.Line.SetToAngle(iLine, iLine.x1, iLine.y1, Phaser.Geom.Line.Angle(iLine), Phaser.Geom.Line.Length(iLine) - (aimIsland.displayWidth + aimIsland.displayHeight) / 4);
        points[points.length - 1] = { 'x': iLine.x2, 'y': iLine.y2, 'dist': Phaser.Geom.Line.Length(iLine) };

        //if we collide right after the beginning (with the startIsland), we set another waypoint, that the startcatmull isnt that extrem
        if (points.length > 2) {
            if (points[1].dist < 150 && points[2].dist > 200) {
                iLine.x1 = points[1].x;
                iLine.y1 = points[1].y;
                iLine.x2 = points[2].x;
                iLine.y2 = points[2].y;
                newWP.dist = points[2].dist / 3;
                if (newWP.dist > 150) { newWP.dist = 150; }
                points[2].dist -= newWP.dist;
                //iLine.fromAngle(points[1].x, points[1].y, iLine.angle, newWP.dist);
                iLine = Phaser.Geom.Line.SetToAngle(iLine, points[1].x, points[1].y, Phaser.Geom.Line.Angle(iLine), newWP.dist);
                newWP = { 'x': iLine.x2, 'y': iLine.y2, 'dist': iLine.length };
                points.splice(2, 0, newWP);
                //console.log("points-collide_true", points, points.length, newWP, iLine, points[1]);
            } else {
                //console.log("points-collide_false", points, points.length);
            }
        }

        var curve = new Phaser.Curves.Spline(points);
        var waypoints = curve.getDistancePoints(2);
        for (var i = 0; i < waypoints.length - 1; i++) {
            //calc the angle, so the ship faces the correct direction (- 1/2 pi, because the ship looks up at first)
            waypoints[i].angle = Math.atan2(waypoints[i + 1].y - waypoints[i].y, waypoints[i + 1].x - waypoints[i].x) + 0.5 * Math.PI;
        }
        if (this.debug == true) {
            this.plotter.clear();
            this.plotter.lineStyle(2, 0xff0000, 1);
            curve.draw(this.plotter, 64);
        }
        //console.log("setShipPath_wp", waypoints);
        //commit the data
        return waypoints;
    };

    //saveRoundStatistics
    getStatistics() {
        //console.log("getStatistics");
        var tData = new Array();
        tData.time = this.time.now;
        //tData.tribes = this.tribes.length;
        tData.islands = this.islandGroup.children.entries.length;
        tData.populationMax = 0;
        tData.buildingsMax = this.islandGroup.children.entries.length * 10; //outpost to castle
        tData.tribes = new Array();
        for (var i = 0; i < this.tribes.length; i++) {
            tData.tribes.push({ name: "" });
            tData.tribes[i].name = this.tribes[i].name;
            tData.tribes[i].aiLevel = this.tribes[i].aiLevel;
            tData.tribes[i].islands = 0;
            tData.tribes[i].population = 0;
            tData.tribes[i].buildings = 0;
        }
        for (var i = 0; i < this.islandGroup.children.entries.length; i++) {
            //islands
            tData.tribes[this.islandGroup.children.entries[i].tribe].islands += 1;
            //population
            tData.tribes[this.islandGroup.children.entries[i].tribe].population += this.islandGroup.children.entries[i].population;
            tData.populationMax += this.islandGroup.children.entries[i].populationMax;
            //buildings
            var u = this.islandGroup.children.entries[i].buildState;
            var uCount = u - ((u >> 1) & 0o33333333333) - ((u >> 2) & 0o11111111111);
            uCount = ((uCount + (uCount >> 3)) & 0o30707070707) % 63;
            tData.tribes[this.islandGroup.children.entries[i].tribe].buildings += uCount;
        }
        this.statistics.push(tData);
        //console.log("getStatistics", tData, this.statistics);

    }


};


//Tribe
class Tribe {
    constructor(scene, nr, name, color) {
        //console.log("cTribe", scene, nr, name, color);
        this.name = name;
        this.nr = nr;
        if (color) {
            this.color = color;
        } else {
            this.color = scene.gameData.tribeColors[Math.floor(Math.random() * scene.gameData.tribeColors.length)];
            //remove the selectet color from the color pool
            var indexColor = scene.gameData.tribeColors.indexOf(this.color);
            if (indexColor > -1) {
                //console.log('removedColor' + indexColor, gameData.tribeColors, this.color);
                scene.gameData.tribeColors.splice(indexColor, 1);
            }
            this.color = this.color.replace("#", "0x");
        }
        this.islands = new Array();
        this.ai = false;
        this.aiLevel = 1;
        this.aiCounter = -(Phaser.Math.Between(0, 1000) / 1000);
        this.shipCounter = 0;
        this.multiAttack = new Set();
    };

    newIsland(scene, islandNr) {
        var i;
        var indexIsland;
        var tIsland;
        //console.log("newIsland", this, scene, islandNr);
        //remove the island from the property of another tribe
        if (islandNr < scene.islandGroup.children.entries.length) {
            tIsland = scene.islandGroup.children.entries[islandNr];
            if (tIsland.tribe != 0) {
                //remove the island from the property of another tribe
                //console.log('newOwner:iNr:' + tIsland.nr);
                indexIsland = scene.tribes[tIsland.tribe].islands.indexOf(islandNr);
                //console.log('newOwner:arrayIndex:' + indexIsland, tribes[tIsland.tribe].islands);
                if (indexIsland > -1) {
                    scene.tribes[tIsland.tribe].islands.splice(indexIsland, 1);
                }
            }
            //assign the island to this tribe
            tIsland.tribe = this.nr;
            tIsland.text.fill = this.color;
            //tIsland.flag.tint = Phaser.Color.hexToRGB(this.color);
            tIsland.flag.tint = this.color;

            //just in case we where about to attack, cancel the selection (because we dont own the island anymore)
            tIsland.bubbleGroup.children.entries[6].selected = false;
            tIsland.bubbleGroup.children.entries[6].clearTint();
            scene.tribes[0].multiAttack.delete(tIsland.nr);

            //init BuildBubbles
            tIsland.completeBuild();

            //call the statistics
            scene.getStatistics();
        }
        //assign the island to this tribe
        this.islands.push(islandNr);
        //update the map
        if (scene.status == "playing") { game.events.emit('toMiniMapMsg', { type: 'newIsland' }); }
    };

    aiBuild(scene) {
        //console.log('AI_Build', this);
        var i;
        var j;
        var maxProbability;
        var tProbability;
        var tIsland;
        var tBubble = null;
        //check each island of this tribe
        for (i = 0; i < this.islands.length; i++) {
            tIsland = scene.islandGroup.children.entries[this.islands[i]];
            if (tIsland.currentBuild == 0) {
                //if this island has nothing to do atm, then do something
                //get the maximum of the probability
                maxProbability = 0;
                for (j = 1; j < tIsland.bubbleGroup.children.entries.length - 2; j++) {
                    if (tIsland.bubbleGroup.children.entries[j].setting > 0) {
                        maxProbability += tIsland.bubbleGroup.children.entries[j].aiProbability;
                    }
                }
                if (maxProbability > 0) {
                    //take a random value to get a random build depending on its probability
                    tProbability = Phaser.Math.Between(0, maxProbability);
                    //console.log('max:' + maxProbability + '_tProb:' + tProbability);
                    for (j = 1; j < tIsland.bubbleGroup.children.entries.length - 2; j++) {
                        if (tProbability <= tIsland.bubbleGroup.children.entries[j].aiProbability) {
                            tBubble = tIsland.bubbleGroup.children.entries[j];
                            break;
                        } else {
                            tProbability -= tIsland.bubbleGroup.children.entries[j].aiProbability;
                        }
                    }
                    if (tBubble != null) {
                        //console.log('aiBuild_' + this.name + '_Bubble_' + tBubble.nr + '_setting_' + tBubble.setting);
                        if (tBubble.setting != 0) {  //if the selected bubble is valid, then build this
                            tIsland.newBuild(tBubble, null);
                        }
                    }
                }
            }
        }
    };

    aiAttack(scene) {
        //console.log('AI_Attack', this);
        var i;
        var j;
        var tIsland;
        var tShip;
        var aimIsland;
        var possibleIslands = new Array();
        var maxMen = 0;

        //is there an island left to conquer?
        if (scene.islandGroup.children.entries.length == this.islands.length || this.islands.length == 0) { return; }

        //is there is a ship left to sail with?
        if (this.shipCounter == 0) { return; }

        //dimension the possibleIsland array
        for (i = 0; i < scene.islandGroup.children.entries.length; i++) {
            possibleIslands.push({ 'dist': 0, 'neededMen': 0, 'travelingMen': 0, 'otherTribesMen': 0 });
        }

        //find the nearest islands
        for (i = 0; i < this.islands.length; i++) {
            tIsland = scene.islandGroup.children.entries[this.islands[i]];
            //check each island
            for (j = 0; j < scene.islandGroup.children.entries.length; j++) {
                //get distance between this and the selected Island
                possibleIslands[j].dist += Phaser.Math.Distance.Between(scene.islandGroup.children.entries[j].x, scene.islandGroup.children.entries[j].y, tIsland.x, tIsland.y);
                if (scene.islandGroup.children.entries[j].tribe == tIsland.tribe) {
                    maxMen += tIsland.population / 2;
                }
            }
        }

        //get the troops that are on their way
        for (i = 0; i < scene.shipGroup.children.entries.length; i++) {
            tShip = scene.shipGroup.children.entries[i];
            //belongs this ship to our tribe
            if (tShip.tribe == this.nr) {
                possibleIslands[tShip.aim].travelingMen += tShip.population * tShip.defence;
            } else {
                possibleIslands[tShip.aim].otherTribesMen += tShip.population * tShip.defence;
            }
        }

        //put some rating on it (distance)
        //calculate the men we need to attack
        //set aimIsland
        aimIsland = -1;
        for (j = 0; j < scene.islandGroup.children.entries.length; j++) {
            if (possibleIslands[j].dist > 0) {
                //bigger = better; empty = better
                possibleIslands[j].dist *= (2 - scene.islandGroup.children.entries[j].scale);
                if (scene.islandGroup.children.entries[j].tribe == 0) {   // empty island, better target, no defence
                    possibleIslands[j].dist *= 0.7;
                    possibleIslands[j].neededMen = 1;
                } else if (scene.islandGroup.children.entries[j].tribe == this.nr) {   // own island, defence System
                    switch (this.aiLevel) {
                        case 1:
                            possibleIslands[j].neededMen += 500;
                            possibleIslands[j].travelingMen += 500;
                            break;
                        case 2:
                            possibleIslands[j].neededMen += 200;
                            possibleIslands[j].travelingMen += 200 + scene.islandGroup.children.entries[j].population;
                            break;
                        case 3:
                            possibleIslands[j].neededMen += 0;
                            possibleIslands[j].travelingMen += (scene.islandGroup.children.entries[j].population * scene.islandGroup.children.entries[j].defence);// - possibleIslands[j].dist / (1000-this.shipCounter*10);
                            //console.log (islandGroup.children.entries[j].population * islandGroup.children.entries[j].defence, possibleIslands[j].dist / (1000 - this.shipCounter*10));
                            break;
                    }
                } else {
                    switch (this.aiLevel) {
                        case 1:
                            possibleIslands[j].neededMen += scene.islandGroup.children.entries[j].populationMax / 0.5;
                            break;
                        case 2:
                            possibleIslands[j].neededMen += scene.islandGroup.children.entries[j].populationMax * 0.5;
                            possibleIslands[j].neededMen += scene.islandGroup.children.entries[j].population;
                            break;
                        case 3:
                            possibleIslands[j].neededMen += scene.islandGroup.children.entries[j].populationMax * 0.4;
                            possibleIslands[j].neededMen += scene.islandGroup.children.entries[j].population * 0.8;
                            possibleIslands[j].neededMen *= scene.islandGroup.children.entries[j].defence;
                            //possibleIslands[j].neededMen += (possibleIslands[j].dist / this.islands.length * islandGroup.children.entries[j].populationRate);
                            break;
                    }
                }
                //get the next aimIsland
                //check distance + men, and men on their way
                if (aimIsland >= 0) {
                    if ((possibleIslands[aimIsland].dist / 2 + possibleIslands[aimIsland].neededMen) > (possibleIslands[j].dist / 2 + possibleIslands[j].neededMen)) {
                        if (possibleIslands[j].neededMen - possibleIslands[j].travelingMen + possibleIslands[j].otherTribesMen > 0) {
                            aimIsland = j;
                        }
                    }
                } else {
                    if (scene.islandGroup.children.entries[j].tribe != this.nr) { aimIsland = j };
                }
            }
        }

        if (aimIsland >= 0) {
            tIsland = possibleIslands[aimIsland];
            if ((tIsland.neededMen - tIsland.travelingMen + tIsland.otherTribesMen) < maxMen) {
                for (i = 0; i < this.islands.length; i++) {
                    //if there are enough ships on their way, cancel the attack, otherwise attack
                    if (tIsland.neededMen - tIsland.travelingMen + tIsland.otherTribesMen >= 0) {
                        //ship is available?
                        if (scene.islandGroup.children.entries[this.islands[i]].bubbleGroup.children.entries[7].setting != 0 &&
                            scene.islandGroup.children.entries[this.islands[i]].bubbleGroup.children.entries[6].selected != true) {
                            tIsland.neededMen -= scene.islandGroup.children.entries[this.islands[i]].population / 2;
                            //send the ship to the target
                            scene.islandGroup.children.entries[this.islands[i]].setSails(aimIsland);
                        }
                    } else {
                        //loop
                        if (this.shipCounter > 0) {
                            //console.log('cancel_aiAttack', this.nr, this.shipCounter);
                            //this.aiAttack();
                        }
                        return;
                    }
                }
            } else {
                //act of despair
                if (this.shipCounter > 0 && this.aiLevel * 3 < Phaser.Math.Between(0, 10)) {
                    for (i = 0; i < this.islands.length; i++) {
                        //ship is available?
                        if (scene.islandGroup.children.entries[this.islands[i]].bubbleGroup.children.entries[7].setting != 0 &&
                            scene.islandGroup.children.entries[this.islands[i]].bubbleGroup.children.entries[6].selected != true) {
                            tIsland.neededMen -= scene.islandGroup.children.entries[this.islands[i]].population / 2;
                            //send the ship to the target
                            scene.islandGroup.children.entries[this.islands[i]].setSails(aimIsland);
                        }
                    }
                }
            }
        } else {
            //is there an island left to conquer?
            console.log('2no island left?!', scene.islandGroup.children.entries.length, this);
        }
    };

    update() {

    };
};



class Island extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, 'images', tsprite);

        var tsprite = 'island' + Phaser.Math.Between(0, 5);
        Phaser.GameObjects.Sprite.call(this, config.scene, config.x, config.y, 'images', tsprite);
        //set some default settings
        this.setOrigin(0.5, 0.5);
        this.scale = 1 - Phaser.Math.Between(3, 7) / 10;
        this.angle = Phaser.Math.Between(0, 360);
        this.halfWidth = this.displayWidth / 2;
        this.halfHeight = this.displayHeight / 2;
        this.sprite = tsprite;
        this.nr = config.islandNr;
        this.buildState = 0;
        this.buildSpeed = 1;
        this.currentBuild = 0;
        this.currentBuildConstTime = 0;
        this.currentBuildConstMax = 0;
        this.name = config.islandName;
        config.scene.add.existing(this);

        this.tribe = 0;
        this.population = 0;
        this.populationMax = Phaser.Math.CeilTo((this.scale + 0.5) * 100);
        this.populationRate = 0.001;
        this.defence = 1;
        this.attack = 1;
        //text to show the Island name and population
        this.text = config.scene.add.text(this.x, this.y, this.name + '\n' + this.population + ' / ' + this.populationMax);
        this.text.setOrigin(0.5);
        this.text.align = 'center';
        this.text.font = 'Arial';
        this.text.fontSize = 12;
        this.text.fill = '#ffffff';
        //this.text.setShadow(2, 2, 'rgba(1,1,1,1)', 2);
        this.text.stroke = '#000000';
        this.text.strokeThickness = 4;
        this.flag = config.scene.add.sprite(this.x, this.y, 'images', 'flag');
        this.flag.setOrigin(0, 1);
        this.flag.scale = 0.6;

        this.setInteractive();
        this.on('pointerup', function (pointer, localX, localY, event) {
            //console.log("click_island", Math.abs(pointer.downX - pointer.upX + pointer.downY - pointer.upY));
            if (Math.abs(pointer.downX - pointer.upX + pointer.downY - pointer.upY) < 20) {
                this.click();
            }
        }, this);
    };

    completeBuild() {
        var visibleBubbles; //Sum of all atm visible Bubbles
        var visCounter; //variable to go through the visibleBubbles
        var vx;
        var vy; // new x&y position of the bubble
        var i;
        var tBubble;
        //check, wich building is already built an witch can be build
        visibleBubbles = 0;
        this.buildSpeed = 1;
        this.populationRate = 0.001;
        this.defence = 1;
        this.attack = 1;
        for (i = 0; i < this.scene.gameData.techObjects.length; i++) {
            //get the posible Bubbles
            if (((this.buildState & parseInt(this.scene.gameData.techObjects[i].comparison, 2)) == parseInt(this.scene.gameData.techObjects[i].expectation, 2)) && this.tribe != 0) {
                tBubble = this.bubbleGroup.children.entries[this.scene.gameData.techObjects[i].bubbleNr];
                tBubble.setTexture('images', this.scene.gameData.techObjects[i].textureName);
                tBubble.setting = parseInt(this.scene.gameData.techObjects[i].binary, 2);
                tBubble.constDuration = this.scene.gameData.techObjects[i].constDuration;
                switch (this.scene.tribes[this.tribe].aiLevel) {
                    case 1:
                        tBubble.aiProbability = this.scene.gameData.defaultAiProbability + this.scene.gameData.techObjects[i].aiProbability / 2;
                        break;
                    case 2:
                        tBubble.aiProbability = this.scene.gameData.defaultAiProbability / 2 + this.scene.gameData.techObjects[i].aiProbability;
                        break;
                    case 3:
                        tBubble.aiProbability = this.scene.gameData.techObjects[i].aiProbability;
                        break;
                }
                if (this.scene.gameData.techObjects[i].addShip > 0) {
                    this.scene.tribes[this.tribe].shipCounter++;
                }
                if (this.scene.gameData.techObjects[i].bubbleNr < 5) {
                    visibleBubbles++;
                }
                //console.log(tBubble.nr + '_' + tBubble.aiProbability);
            } else {
                //calculate the island-properties, depending on the built buildings
                if (this.buildState & parseInt(this.scene.gameData.techObjects[i].binary, 2)) {
                    //console.log("already built", this.scene.gameData.techObjects[i].textureName, this.nr, this.buildState, parseInt(this.scene.gameData.techObjects[i].binary, 2));
                    this.buildSpeed += this.scene.gameData.techObjects[i].addBuildSpeed;
                    this.populationRate += this.scene.gameData.techObjects[i].addPopGrowth;
                    this.defence += this.scene.gameData.techObjects[i].addDefence;
                    this.attack += this.scene.gameData.techObjects[i].addAttack;
                }
            }
        }
        //reset the AI counter
        this.scene.tribes[this.tribe].aiCounter *= -1;
        //show the build-Bubbles    // Debug: Replace:this.tribe != 0 => this.tribe == 1    //Show the buildBubbles from the enemies too
        if (this.tribe == 1 || (this.tribe != 0 && this.scene.debug == true)) {
            visCounter = 0;
            //calculate the new bubble positions
            for (i = 1; i < this.bubbleGroup.children.entries.length; i++) {
                if (this.bubbleGroup.children.entries[i].setting > 0) {
                    if (i < this.bubbleGroup.children.entries.length - 2) {
                        visCounter++;
                    } //necessary for autoBuild
                    if (i < this.bubbleGroup.children.entries.length - 3) { // calculate the new position of the Build-Bubbles
                        vx = (this.x - (this.bubbleGroup.children.entries[i].displayWidth + 5) * (visibleBubbles - 1) / 2 + (this.bubbleGroup.children.entries[i].displayWidth + 5) * (visCounter - 1));
                        vy = this.y - this.halfHeight - 30;
                        //move the outer bubbles a litte bit down
                        if (visibleBubbles > 2) {
                            if (visCounter == 1 || visCounter == visibleBubbles) {
                                vy = vy + 25;
                            }
                        }
                        //console.log(visibleBubbles + '_Bubble' + visCounter + '_position:old:' + this.bubbleGroup.children.entries[i].x + 'new:' + vx);
                    }
                    else { //don't move the ship-Bubbles
                        vx = this.bubbleGroup.children.entries[i].x;
                        vy = this.bubbleGroup.children.entries[i].y;
                    }
                    //new bubbles will rise at the new spot, existing ones will move to its new position
                    if (this.bubbleGroup.children.entries[i].visible == false) {
                        this.bubbleGroup.children.entries[i].alpha = 0.1;
                        this.bubbleGroup.children.entries[i].x = vx;
                        this.bubbleGroup.children.entries[i].y = vy;
                        this.bubbleGroup.children.entries[i].visible = true;
                        var newAlpha = 0.5;
                        if (this.currentBuild == 0) {
                            newAlpha = 0.8;
                        }
                        else if (i == this.bubbleGroup.children.entries.length - 1) {
                            newAlpha = 1;
                        }
                        this.scene.tweens.add({
                            targets: this.bubbleGroup.children.entries[i],
                            alpha: newAlpha,
                            ease: 'Sinusoidal',
                            duration: 800,
                            repeat: 0,
                            yoyo: false
                        });
                    }
                    else {
                        this.scene.tweens.add({
                            targets: this.bubbleGroup.children.entries[i],
                            x: vx,
                            y: vy,
                            ease: 'Sinusoidal',
                            duration: 800,
                            repeat: 0,
                            yoyo: false
                        });
                        //remove the build-bleach, set the alpha back to normal
                        if (this.currentBuild == 0 && i < this.bubbleGroup.children.entries.length - 1) {
                            this.bubbleGroup.children.entries[i].alpha = 0.8;
                        }
                    }
                }
                else { // hide the bubbles we dont use
                    this.bubbleGroup.children.entries[i].visible = false;
                }
            }
            //show the construction-bubble
            if (this.currentBuild != 0) {
                this.bubbleGroup.children.entries[0].visible = true;
            }
            //if autoBuild == true
            if (1 == 1 && visCounter == 1) {
                for (i = 1; i < this.bubbleGroup.children.entries.length; i++) {
                    if (this.bubbleGroup.children.entries[i].setting > 0 && i != 6) {   //skip ship select
                        this.newBuild(this.bubbleGroup.children.entries[i], null);
                    }
                }
            }
        } else {
            //hide the bubbles from the other tribes (otherwise if the player was a former owner, the bubbles would be still visible)
            for (i = 0; i < this.bubbleGroup.children.entries.length; i++) {
                this.bubbleGroup.children.entries[i].visible = false;
            }
        }
    };


    update() {
    };

    newBuild(tBubble, pointer) {
        //console.log('Build_', this, tBubble, pointer);
        var i;
        if (pointer != null) {
            if (Phaser.Math.Distance.Between(pointer.upX, pointer.upY, pointer.downX, pointer.downY) > 20) {
                console.log('cancel_bubble_click');
                return;
            }
            ;
        }
        //cancel the current build, or start a new one
        if (tBubble.setting == this.currentBuild) {
            //cancel currentBuild
            if (pointer != null) { game.events.emit('toSoundMsg', { type: 'cancelBuild' }); }
            this.currentBuild = 0;
            this.bubbleGroup.children.entries[0].visible = false;
            this.bubbleGroup.children.entries[0].setting = 0;
            //remove the build-bleach, set the alpha back to normal
            for (i = 1; i < this.bubbleGroup.children.entries.length - 1; i++) {
                this.bubbleGroup.children.entries[i].alpha = 0.8;
            }
        }
        else {
            //console.log('Build_start_' + tIsland.nr + '_' + tBubble.setting);
            if (tBubble.nr < 6) {
                if (pointer != null) { game.events.emit('toSoundMsg', { type: 'startBuild' }); }
                //construction bubbles: overgive the settings from the bubble to the island
                this.currentBuild = tBubble.setting;
                this.currentBuildConstTime = 0;
                this.currentBuildConstMax = tBubble.constDuration;
                this.bubbleGroup.children.entries[0].x = tBubble.x;
                this.bubbleGroup.children.entries[0].y = tBubble.y + tBubble.height / 2 - 4;
                this.bubbleGroup.children.entries[0].setting = tBubble.nr;
                if (this.tribe == 1 || this.debug == true) {
                    this.bubbleGroup.children.entries[0].visible = true;
                }
                tBubble.alpha = 0.8;
                //bleach the currently not build bubbles, while the buildprocess takes palce (therefor remove existing tweens)
                for (i = 1; i < this.bubbleGroup.children.entries.length - 2; i++) {
                    if (i != tBubble.nr) {
                        //console.log("tweens", this.scene.tweens.getTweensOf(this.bubbleGroup.children.entries[i]));
                        var tweens = this.scene.tweens.getTweensOf(this.bubbleGroup.children.entries[i]);
                        for (var j = 0; j < tweens.length; j++) {
                            for (var jj = 0; jj < tweens[j].data.length; jj++) {
                                if (tweens[j].data[jj].key == "alpha") { tweens[j].stop(); break; }
                            }
                        }
                        //this.scene.tweens.killTweensOf(this.bubbleGroup.children.entries[i]);
                        this.bubbleGroup.children.entries[i].alpha = 0.5;
                    }
                }
            }
            else {
                //MultiAttack: just select the Islands, that are ready to attack - they all will send their troops to the next Island that is clicked (function setsails)
                if (tBubble.nr == 6) { //steeringweel
                    if (pointer != null) { game.events.emit('toSoundMsg', { type: 'steeringweel' }); }
                    var tTribe = this.scene.tribes[this.tribe];
                    if (tBubble.selected != true) {
                        tBubble.selected = true;
                        tBubble.setTintFill('0xf7c184');
                        tTribe.multiAttack.add(tBubble.islandNr);
                        //console.log("newBuild_multiAttack", this, tTribe, tBubble);
                    } else {
                        tBubble.selected = false;
                        tBubble.clearTint();
                        //console.log("newBuild_multiAttack_cancel", this, tTribe, tBubble);
                        tTribe.multiAttack.delete(tBubble.islandNr);
                    }
                }
            }
            //console.log('newBuild_' + this.nr + '_' + this.currentBuild);
        }
        this.checkBuild();
    };
    checkBuild() {
        //if there is nothing to do, leave
        if (this.currentBuild == 0) {
            return;
        }
        ;
        var tBubble = this.bubbleGroup.children.entries[0];
        //check if build is complete
        if (this.currentBuildConstMax - this.currentBuildConstTime <= 0) {
            //add the built building to the buildState
            this.buildState = this.buildState | this.currentBuild;
            this.currentBuild = 0;
            //remove the build-Bubble incl current built bubble
            this.bubbleGroup.children.entries[tBubble.setting].visible = false;
            this.bubbleGroup.children.entries[tBubble.setting].setting = 0;
            this.bubbleGroup.children.entries[tBubble.setting].aiProbability = 0;
            tBubble.visible = false;
            tBubble.setting = 0;
            this.currentBuildConstTime = 0;
            //console.log('Build_complete_iNr:' + this.nr + '_iBuildState:' + this.buildState);
            this.completeBuild();
        }
        else {
            //calculate new constructiontime
            //console.log("buildProcess", this, tBubble);
            this.currentBuildConstTime += (this.buildSpeed + (this.population / 10) / this.populationMax);
            //show the buildstate
            let tHeight = 3 + ((tBubble.frame.height - 3) * this.currentBuildConstTime / this.currentBuildConstMax);
            tBubble.setCrop(0, (tBubble.frame.height) - tHeight, tBubble.frame.width, tHeight)
            //in chase the build-bubble is still moving, take the current position
            tBubble.x = this.bubbleGroup.children.entries[tBubble.setting].x;
            tBubble.y = this.bubbleGroup.children.entries[tBubble.setting].y - 2;
        }
    };

    checkPopulation() {
        if (this.tribe != 0) {
            if (this.population == this.populationMax) {
                //do nothing
            } else if (this.population < this.populationMax) {
                this.population *= 1.0001;
                this.population += this.populationRate;
                this.text.text = this.name + '\n' + Phaser.Math.CeilTo(this.population, 0) + ' / ' + this.populationMax;
            }
            else {
                this.population -= 0.1;
                if (this.population < this.populationMax) { this.population = this.populationMax }
                this.text.text = this.name + '\n' + Phaser.Math.CeilTo(this.population, 0) + ' / ' + this.populationMax;
            }
        }
    };

    setSails(aimIsland) {
        //create new Ship
        var aimIslandNr;
        var hit = -1;
        var tShip;
        var i;
        if (typeof aimIsland === 'object') {
            aimIslandNr = aimIsland.nr; //click
            game.events.emit('toSoundMsg', { type: 'setSails' });
        } else {
            aimIslandNr = aimIsland;    //ai
        }

        //check if there is a free ship-sprite to use
        for (i = 0; i < this.scene.shipGroup.children.entries.length; i++) {
            if (this.scene.shipGroup.children.entries[i].active != true) {
                hit = i;
                //console.log("reused_ship");
                break;
            }
        }
        if (hit >= 0) {
            tShip = this.scene.shipGroup.children.entries[hit];
            tShip.setActive(true);
            tShip.setVisible(true);
        } else {
            tShip = new Ship(this.scene);
        }
        for (i = 0; i < this.scene.gameData.shipObjects.length; i++) {
            if (this.bubbleGroup.children.entries[7].setting == parseInt(this.scene.gameData.shipObjects[i].expectation, 2)) {
                tShip.setTexture('images', this.scene.gameData.shipObjects[i].textureName);
                tShip.speed = this.scene.gameData.shipObjects[i].speed;
                tShip.defence = this.scene.gameData.shipObjects[i].defence;
                break;
            }
        }
        tShip.x = this.bubbleGroup.children.entries[7].x;
        tShip.y = this.bubbleGroup.children.entries[7].y;
        tShip.rotation = this.bubbleGroup.children.entries[7].rotation;
        tShip.dist = 0;
        this.population /= 2;
        tShip.population = this.population;
        tShip.attack = this.attack;
        tShip.tribe = this.tribe;
        tShip.origin = this.nr;
        tShip.aim = aimIslandNr;
        tShip.waypoints = this.scene.setShipPath(tShip.x - tShip.displayWidth / 2, tShip.y + 15, this.scene.islandGroup.children.entries[aimIslandNr]);
        //rotate the Ship to the nearest angle (=> max +-180°)
        tShip.waypoints[0].angle = tShip.rotation + Math.atan2(Math.sin(tShip.waypoints[0].angle - tShip.rotation), Math.cos(tShip.waypoints[0].angle - tShip.rotation));
        //console.log("setSails", this, tShip, aimIsland)
        this.scene.shipGroup.add(tShip);

        //move the ship slowly to the starting position
        //rotate the ship slowly to the start-angle
        this.scene.tweens.add({
            targets: tShip,
            x: tShip.waypoints[0].x,
            y: tShip.waypoints[0].y,
            rotation: tShip.waypoints[0].angle,
            duration: 1000,
            ease: 'Sine.easeOut',
            repeat: 0,            // -1: infinity
            yoyo: false,
            onComplete: function (tween, targets) {
                //console.log('shipSpeed', this, tween, targets);
                targets[0].isSailing = true;
            }
        });


        //reset the buildState and remove the portShip & SteeringWeel bubble
        this.buildState ^= this.bubbleGroup.children.entries[7].setting;
        this.bubbleGroup.children.entries[6].setting = 0; //steeringweel
        this.bubbleGroup.children.entries[6].selected = false;
        this.bubbleGroup.children.entries[6].clearTint();
        this.bubbleGroup.children.entries[7].setting = 0; //portShip
        this.scene.tribes[this.tribe].shipCounter--;
        this.completeBuild();
    };

    click() {
        //console.log('island.click', this);
        if (this.scene.tribes[1].multiAttack.size > 0) {
            var i;
            var iNrs = this.scene.tribes[1].multiAttack.entries();
            var iNr;
            for (i = 0; i < this.scene.tribes[1].multiAttack.size; i++) {
                iNr = iNrs.next().value[0];
                //console.log('multiAttack: ', this.scene.islandGroup.children.entries[iNr].name, this.name);
                this.scene.islandGroup.children.entries[iNr].setSails(this);
            }
            this.scene.tribes[1].multiAttack.clear();
        } else {
            //show the details of this island
            game.events.emit('toMiniMapMsg', { type: 'islandInfo', island: this });
        }
    }
}
;


class Bubble extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'images', 'bubbleBuild');
        //load Bubble sprite and set some settings
        this.scale = 0.4;
        this.visible = false;
        scene.add.existing(this);
    }
    update() {
    }
}
;




//Ship
class Ship extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        //console.log("cShip", scene, shipType, scene.gameData, scene.gameData.shipObjects.length, parseInt(scene.gameData.shipObjects[0].expectation, 2));
        //load Ship sprite and set some settings
        super(scene, 0, 0, 'images', 'ship');   //real sprite goto setSails
        this.setOrigin(0.5, 0.5);
        this.scale = 0.4;
        this.rotation = -1.3;
        this.dist = 0;
        this.population = 0;
        this.attack = 0;
        this.tribe = 0;
        this.origin = 0;
        this.aim = 0;
        this.sailCounter = 0;
        this.waypoints = new Array();
        this.isSailing = false;
        this.visible = true;
        this.active = true;
        scene.add.existing(this);
    };

    sailing() {
        //move the ship along the waypoints
        //console.log("sailing", this);
        if (this.dist >= this.waypoints.length) {
            this.speed = 0;
            this.dist = 0;
            this.isSailing = false;
            this.arrival();
        } else {
            this.setPosition(this.waypoints[this.dist].x, this.waypoints[this.dist].y);
            this.rotation = this.waypoints[this.dist].angle;
            this.dist++;
        }
    };

    arrival() {
        //console.log("arrival", this);
        var aimIsland = this.scene.islandGroup.children.entries[this.aim]
        if (aimIsland.tribe == this.tribe) {
            //add the reinforcements to the population of the island
            aimIsland.population += this.population;
        } else {
            //remove the dead people //ToDo, perhaps better calculation/animation
            //console.log('arrival', this.population, this.attack, aimIsland.defence, this.population * this.attack / aimIsland.defence);
            var attackers = this.population * this.attack / aimIsland.defence;
            aimIsland.population -= attackers;
            if (aimIsland.population < 0) {
                //new owner
                if (aimIsland.tribe == 1) {     //loss
                    game.events.emit('toSoundMsg', { type: 'lostIsland' });
                } else if (this.tribe == 1) {   //win
                    game.events.emit('toSoundMsg', { type: 'conqueredIsland' });
                }
                aimIsland.population *= -1;
                aimIsland.currentBuildConstTime /= 2;
                this.scene.tribes[this.tribe].newIsland(this.scene, this.aim);
            } else {
                if ((aimIsland.tribe == 1 && this.tribe != 1) || (aimIsland.tribe != 1 && this.tribe == 1)) {
                    //enemy attacks my island, or I attack enemy island (both not successful)
                    game.events.emit('toSoundMsg', { type: 'arrival' });
                }
            }
        }

        this.setActive(false);
        this.setVisible(false);
    };

    update() {

    };

};


