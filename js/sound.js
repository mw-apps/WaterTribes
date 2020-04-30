/** @type {import("../modules/phaser.js")} */
/// <reference path="../modules/phaser.js" />

class cSound extends Phaser.Scene {
    constructor() {
        super('soundScene');
        this.aaaaa = 'soundScene';
        this.settings = {};
        this.music;
        this.sfx;
    }

    preload() {
        //load sound assets
        //background muisc
        this.load.audio('music', ['./assets/audio/epidemicsound_Deskant_-_Sins_of_the_Fathers.mp3']);

        //soundeffects
        this.load.audioSprite('sfx', './assets/audio/sfx.json', ['./assets/audio/sfx.mp3']);
    }

    create() {
        //console.log("createSound");
        this.settings = JSON.parse(localStorage.getItem('settings'));

        //start the background music
        this.music = this.sound.add('music', { loop: true });
        if (this.settings.music == true) {
            this.music.play();
        }

        //define the sound effect variable
        this.sfx = this.sound.addAudioSprite('sfx');

        //listen to soundevents
        game.events.off('toSoundMsg');    //remove existing listeners (second game)
        game.events.on('toSoundMsg', function (data) {
            this.newMessage(data);
        }, this);
    }

    newMessage(data) {
        //console.log("sound_newMessage", this, data);
        switch (data.type) {
            case 'updateSettings':
                this.settings = JSON.parse(localStorage.getItem('settings'));
                if (this.settings.music == true && this.music.isPlaying != true) {
                    this.music.play();
                } else if (this.settings.music == false && this.music.isPlaying == true) {
                    this.music.stop();
                }
                break;
            case 'none':
                this.sfx.play('none');
                break;
            case 'btnClick':
                if (this.settings.sfx == true) { this.sfx.play('click'); }
                break;
            case 'startGame':
                if (this.settings.sfx == true) { this.sfx.play('bell'); }
                break;
            case 'startBuild':
                if (this.settings.sfx == true) { this.sfx.play('hammer'); }
                break;
            case 'cancelBuild':
                if (this.settings.sfx == true) { this.sfx.play('hammerFall'); }
                break;
            case 'steeringweel':
                if (this.settings.sfx == true) { this.sfx.play('bell'); }
                break;
            case 'setSails':
                if (this.settings.sfx == true) { this.sfx.play('wave'); }
                break;
            case 'arrival':
                if (this.settings.sfx == true) { this.sfx.play('shatter'); }
                break;
            case 'conqueredIsland':
                if (this.settings.sfx == true) { this.sfx.play('warCry'); }
                break;
            case 'lostIsland':
                if (this.settings.sfx == true) { this.sfx.play('drum'); }
                break;
            case 'endGame':
                //console.log("endGame", this.settings.music, this.settings.sfx);
                if (this.settings.music == true && this.settings.sfx == true) {
                    this.music.orgVolume = this.music.volume;
                    this.tweens.add({        //fadeout the background music
                        targets: this.music,
                        volume: 0,
                        duration: 1500
                    });
                }
                //play the final sound (and restart the bg music afterwards)
                if (this.settings.sfx == true) {
                    var finalSound = this.sound.addAudioSprite('sfx');  //this way the final song will not be stopped
                    finalSound.play('final');
                    finalSound.once('complete', function () {    //restart music
                        if (this.settings.music == true) {
                            this.music.volume = this.music.orgVolume;
                            this.music.play();
                        }
                    }.bind(this));
                }
                break;
            case 'mute':
                this.sound.setMute(data.mute);
                break;
            default:
                console.log('sound_newMessage_error', this, data);
                break;
        }
    }

}
