/** @type {import("./node_modules/phaser.js")} */
/// <reference path="node_modules/phaser.js" />



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
        this.load.audio('music', [
            'assets/audio/epidemicsound_Deskant_-_Sins_of_the_Fathers.mp3'
        ]);

        //soundeffects
        this.load.audioSprite('sfx',
            'assets/audio/sfx.json', [
            'assets/audio/sfx.mp3'
        ]);
    }

    create() {
        this.settings = JSON.parse(localStorage.getItem('settings'));

        //start the background music
        this.music = this.sound.add('music', { loop: true });
        if (this.settings.music == true) {
            this.music.play();
        }

        //sefine the sound effect variable
        this.sfx = this.sound.addAudioSprite('sfx');

        //listen to soundevents
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
                if (this.settings.sfx == true) {
                    this.sfx.mute = false;
                } else {
                    this.sfx.mute = true;
                }
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
                //this.sfx.play('final');
                if (this.sfx.mute == false) { this.sound.playAudioSprite('sfx', 'final'); }    //this way the final song will not be stopped 
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
