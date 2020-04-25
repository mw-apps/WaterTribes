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
        this.sfx.mute = !this.settings.sfx;
        
        //listen to soundevents
        game.events.on('toSoundMsg', function (data) {
            this.newMessage(data);
        }, this);
    }

    newMessage(data) {
        //console.log("sound_newMessage", this, data);
        this.sfx.mute = !this.settings.sfx;     //ToDo: debug ... first hit emits always a sound
        switch (data.type) {
            case 'updateSettings':
                this.settings = JSON.parse(localStorage.getItem('settings'));
                if (this.settings.music == true && this.music.isPlaying != true) {
                    this.music.play();
                } else if (this.settings.music == false && this.music.isPlaying == true) {
                    this.music.stop();
                }
                this.sfx.mute = !this.settings.sfx;
                break;
            case 'btnClick':
                this.sfx.play('click');
                break;
            case 'startGame':
                this.sfx.play('bell');
                break;
            case 'startBuild':
                this.sfx.play('hammer');
                break;
            case 'cancelBuild':
                this.sfx.play('hammerFall');
                break;
            case 'steeringweel':
                this.sfx.play('bell');
                break;
            case 'setSails':
                this.sfx.play('wave');
                break;
            case 'arrival':
                this.sfx.play('shatter');
                break;
            case 'conqueredIsland':
                this.sfx.play('warCry');
                break;
            case 'lostIsland':
                this.sfx.play('drum');
                break;
            case 'endGame':
                //console.log("endGame", this.settings.music, this.settings.sfx);
                if (this.settings.music == true) {
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
                this.sound.mute = data.mute;
                break;
            default:
                console.log('sound_newMessage_error', this, data);
                break;
        }
    }

}
