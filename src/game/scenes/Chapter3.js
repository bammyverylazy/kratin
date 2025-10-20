// scenes/Chapter3.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter3 extends Scene {
  constructor() {
    super("Chapter3");
    this.characterSprites = {};
    this.currentWiggleTween = null;
    this.propertyText = null;
    this.hasShaken = false;
    this.bgm = null;
    //this.voiceAudio = null; // for voice narration audio object
  }

  preload() {
    this.load.image('chapter3', '/assets/chapter3.png');
    this.load.image('chapter3scene1', '/assets/chapter3scene1.png');
   
    this.load.image('red', '/assets/red.png');
    this.load.image('blue', '/assets/blue.png');
    this.load.image('yellow', '/assets/yellow.png');
    this.load.image('green', '/assets/green.png');
    this.load.image('notebook', '/assets/notebook.png');

    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('5.png', '/assets/5.png');
    this.load.image('6.png', '/assets/6.png');
    this.load.image('7.png', '/assets/7.png');
    this.load.image('8.png', '/assets/8.png');
    this.load.image('9.png', '/assets/9.png');
    this.load.image('quest3', '/assets/quest3.png');

    this.load.audio('sadBgm', '/assets/audio/sadbackgroundmusic.mp3');
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?._id;
    const currentChapter = 'Chapter3';

    //saveGameProgress(userId, currentChapter);

    this.cameras.main.setBackgroundColor('#000000');

    this.bgm = this.sound.add('sadBgm', { loop: true, volume: 0.5 });
    this.bgm.play();

    this.coverImage = this.add.image(0, 0, 'chapter3')
      .setOrigin(0, 0)
      .setDepth(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.startButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 300,
      'Start',
      {
        fontSize: '48px',
        color: '#ffffff',
        padding: { left: 32, right: 32, top: 16, bottom: 16 }
      }
    ).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

    addStoryModeUI(this, {
            });

    this.script = [
      { speaker: "Narrator:", text: "Kratin and Earthy arrive in a busy town full of scattered trash." },
      { speaker: "Earthy:", text: "Oh no… the streets are messy, and it hurts to see the waste!"  },
      { speaker: "Kratin:", text: "Don’t worry! If we sort the trash correctly, everything will look clean again!"  },
      { speaker: "Narrator:", text: "Suddenly, four colorful bins appear — Blue, Green, Red, and Yellow — each ready to teach Kratin and Earthy how to sort trash properly." },
      { speaker: "Blue (General Waste):", 
        text: "Always be careful and keep these items separate!",
        character: "blue", 
        property:"Hi there! I’m Blue, the bin for general waste. I take care of things that can’t be recycled or composted" },
      { speaker: "Green (Organic Waste):", 
        text: " — like dirty tissues, old sponges, and snack wrappers. If it doesn’t fit anywhere else, it goes to me!",
        character: "green", 
        property:"Hello, friends! I’m Green, and I love food scraps and garden waste." },
      { speaker: "Red (Hazardous Waste):", 
        text: "  — like banana peels, apple cores, and leaves. I help turn them into compost that makes plants grow strong and healthy!",
        character: "red", 
        property:"Greetings, heroes! I’m Red, the safety bin. I handle dangerous or toxic items like batteries, old medicines, paint, and broken glass."},
      { speaker: "Yellow (Recycling Waste):", 
        text: " Every item you recycle gives the Earth a big smile!",
        character: "yellow", 
        property:"Hey everyone! I’m Yellow, the recycling bin. " },
      { speaker: "Narrator", text: "I take clean paper, plastic bottles, cans, and cardboard so they can be reused instead of wasted. Recycling helps save energy and keeps our planet happy!" }


    ];

    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      this.coverImage.destroy();
      this.add.image(0, 0, 'chapter3scene1')
      .setOrigin(0, 0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height)
      .setDepth(0);
      this.startStorySequence();
    });

    this.input.keyboard.on('keydown', (event) => {
      if ((event.code === 'Space' || event.code === 'Enter') && this.startButton && this.startButton.active) {
        this.startButton.emit('pointerdown');
      }
    });

    // Stop music when scene shuts down or destroyed
    this.events.on('shutdown', () => this.stopAudio());
    this.events.on('destroy', () => this.stopAudio());
  }

  // Stub function to play voice narration (future implementation)
  playVoiceNarration(key) {
    // If there's a currently playing narration, stop it
    if (this.voiceAudio) {
      this.voiceAudio.stop();
      this.voiceAudio.destroy();
      this.voiceAudio = null;
    }

    // TODO: Implement loading & playing of voice narration audio based on `key`
    // For now, just log the request
    //console.log(`Voice narration requested for key: ${key}`);

    // Example placeholder:
    // this.voiceAudio = this.sound.add(key);
    // this.voiceAudio.play();
  }

  startStorySequence() {
    
    const keys = ['red', 'blue', 'green', 'yellow'];
    const spacing = 200;
    const startX = (this.sys.game.config.width / 2) - spacing * (keys.length - 1) / 2;
    const y = 480;

    keys.forEach((key, i) => {
      const sprite = this.add.image(startX + i * spacing, y, key)
        .setScale(0.5)
        .setDepth(100);
      this.characterSprites[key] = sprite;
    });

    if (!this.dialogueUI) this.dialogueUI = new DialogueUI(this);

    this.nextButton = this.add.text(900, 680, '▶ Next', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.backButton = this.add.text(820, 680, '◀ Back', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.nextButton.on('pointerdown', () => this.dialogueUI.advance());
    this.backButton.on('pointerdown', () => {
      if (this.currentLine > 0) {
        this.currentLine -= 2;
        if (this.currentLine < 0) this.currentLine = 0;
        this.showCurrentLine();
      }
    });

    this.input.keyboard.on('keydown-ENTER', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-SPACE', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-RIGHT', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.currentLine > 0) {
        this.currentLine -= 2;
        if (this.currentLine < 0) this.currentLine = 0;
        this.showCurrentLine();
      }
    });

    this.currentLine = 0;
    this.showCurrentLine();
  }

  showCurrentLine() {
    if (this.currentLine >= this.script.length) {
      this.triggerEarthquakePopup();
      return;
    }

    const line = this.script[this.currentLine];

    if (this.currentWiggleTween) {
      this.currentWiggleTween.stop();
      this.currentWiggleTween = null;
    }

    Object.values(this.characterSprites).forEach(sprite => {
      this.tweens.killTweensOf(sprite);
      sprite.setScale(0.5);
      sprite.setAngle(0);
    });

    if (line.character && this.characterSprites[line.character]) {
      const char = this.characterSprites[line.character];
      char.setScale(0.65);

      this.currentWiggleTween = this.tweens.add({
        targets: char,
        angle: { from: -6, to: 6 },
        duration: 150,
        yoyo: true,
        repeat: -1
      });
    }

    if (this.propertyText) this.propertyText.destroy();

    if (line.property) {
      let emoji = '';
      switch (line.character) {
        case 'red': emoji = '🎀 '; break;
        case 'blue': emoji = '🩵 '; break;
        case 'yellow': emoji = '⭐ '; break;
        case 'green': emoji = '🥬 '; break;
      }

      const decoratedProperty = line.property
        .split('\n')
        .map(line => `${emoji}${line}`)
        .join('\n');

      this.propertyText = this.add.text(540, 160, decoratedProperty, {
        fontSize: '26px',
        color: '#ffffff',
        wordWrap: { width: 480 },
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: { left: 16, right: 16, top: 10, bottom: 10 }
      }).setAlpha(0).setDepth(200);

      this.tweens.add({
        targets: this.propertyText,
        alpha: 1,
        duration: 400,
        ease: 'Power2'
      });
    }

    this.backButton.setVisible(this.currentLine > 0);

    this.dialogueUI.onLineComplete = () => {
      // Here you can add voice narration trigger, e.g.
      // this.playVoiceNarration(`line_${this.currentLine}`);

      this.currentLine++;
      this.showCurrentLine();
    };

    this.dialogueUI.startDialogue([line]);
  }

  triggerEarthquakePopup() {
    if (this.hasShaken) return;
    this.hasShaken = true;

    this.cameras.main.shake(900, 0.04);

    this.time.delayedCall(1400, () => {
      const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7)
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(1000);

      const popup = this.add.image(512, 384, 'quest3')
        .setOrigin(0.5)
        .setDepth(1001)
        .setScale(0.48);

      const startBtn = this.add.text(512, 680, 'Start Game', {
        fontSize: '28px',
        color: '#FFD700',
        backgroundColor: '#333',
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      })
        .setOrigin(0.5)
        .setDepth(1002)
        .setInteractive({ useHandCursor: true });

      startBtn.on('pointerdown', () => {
        overlay.destroy();
        popup.destroy();
        startBtn.destroy();

        this.scene.start('Chapter3game');
      });
    });
  }

  stopAudio() {
    if (this.bgm) {
      this.bgm.stop();
      this.bgm.destroy();
      this.bgm = null;
    }
    if (this.voiceAudio) {
      this.voiceAudio.stop();
      this.voiceAudio.destroy();
      this.voiceAudio = null;
    }
    if (this.bgVideo) {
      this.bgVideo.stop();
      this.bgVideo.destroy();
      this.bgVideo = null;
    }
  }
}
