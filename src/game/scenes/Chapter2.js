// scenes/Chapter2.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter2 extends Scene {
  constructor() {
    super("Chapter2");
    this.coverImage = null;
    this.background = null;
    this.bgVideo = null;
    this.startButton = null;
    this.dialogueUI = null;
    this.script = [];
    this.currentLine = 0;
    this.bgSteps = [
      'chapter2scene1', 'chapter2scene2', 'chapter2scene3'
    ];
    this.bgStepIndex = 0;
    this.pressureBgm = null;
    this.voiceNarration = null;
    this.soundEnabled = true;
  }

  preload() {
    this.load.image('chapter2scene1', '/assets/chapter2scene1.png');
    this.load.image('chapter2scene2', '/assets/chapter2scene2.png');
    this.load.image('chapter2', '/assets/chapter2.png');

    
    this.load.audio('pressureBgm', '/assets/audio/pressurebackgroundmusic.mp3');

    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('notebook', '/assets/notebook.png');
    this.load.image('5.png', '/assets/5.png');
    this.load.image('6.png', '/assets/6.png');
    this.load.image('7.png', '/assets/7.png');
    this.load.image('8.png', '/assets/8.png');
    this.load.image('9.png', '/assets/9.png');
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?._id;
    const currentChapter = 'Chapter2';
    //saveGameProgress(userId, currentChapter);

    const storedSound = localStorage.getItem('soundEnabled');
    this.soundEnabled = storedSound === null ? true : (storedSound === 'true');
    this.sound.mute = !this.soundEnabled;

    this.pressureBgm = this.sound.add('pressureBgm', { loop: true, volume: 0.4 });
    if (this.soundEnabled) {
      this.pressureBgm.play();
    }

    this.cameras.main.setBackgroundColor('#000000');

    this.coverImage = this.add.image(0, 0, 'chapter2').setOrigin(0, 0).setDepth(0);
    // Safety: if a video with key 'chapter2' was actually preloaded, use it; otherwise use the image.
    if (this.cache.video.exists('chapter2')) {
      this.coverImage = this.add.video(0, 0, 'chapter2').setOrigin(0, 0).setDepth(0);
      this.coverImage.setMute(true);
      this.coverImage.play(true);
      this.coverImage.on('play', () => {
        const vidWidth = this.coverImage.video.videoWidth;
        const vidHeight = this.coverImage.video.videoHeight;
        const canvasWidth = this.sys.game.config.width;
        const canvasHeight = this.sys.game.config.height;
        const scale = Math.min(canvasWidth / vidWidth, canvasHeight / vidHeight);
        this.coverImage.setDisplaySize(vidWidth * scale, vidHeight * scale);
      });
    } else {
      // It's an image; images don't support .play()/.setMute() — set display size and continue.
      this.coverImage.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    }

    this.startButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 300,
      'Start',
      {
        fontSize: '48px',
        color: '#ffffff',
        padding: { left: 32, right: 32, top: 16, bottom: 16 },
        borderRadius: 12
      }
    ).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

    addStoryModeUI(this, {
         });

    this.script = [      
    { speaker: "Narrator:", text: "Kratin and Earthy arrive at a small village full of lights and dripping taps." },
    { speaker: "Earthy:", text: "Oh no... so much energy is being wasted!",sceneStep:2 },
    { speaker: "Kratin:", text: "Don’t worry, Earthy! We’ll find and fix every leak!",sceneStep:2 },
    { speaker: "Narrator:", text: "Lights on, fans spinning, and water running — all wasting energy.",sceneStep:2 },
    { speaker: "Kratin:", text: "If we save energy, the Earth can rest and smile again!",sceneStep:3 },
    { speaker: "Narrator:", text: "Let’s help Kratin find the leaks and make Earthy shine bright once more!",sceneStep:3 },

    ];

    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      this.coverImage.destroy();
      this.startStorySequence();
    });

    this.input.keyboard.on('keydown', (event) => {
      if ((event.code === 'Space' || event.code === 'Enter') && this.startButton?.active) {
        this.startButton.emit('pointerdown');
      }
    });

    this.events.on('shutdown', () => this.stopAllSounds());
    this.events.on('destroy', () => this.stopAllSounds());
  }

  startStorySequence() {
    if (this.background) this.background.destroy();

    this.bgStepIndex = 1;
    this.background = this.add.image(0, 0, this.bgSteps[this.bgStepIndex])
      .setOrigin(0, 0).setDepth(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    if (!this.dialogueUI) this.dialogueUI = new DialogueUI(this);

    this.nextButton?.destroy();
    this.backButton?.destroy();

    this.nextButton = this.add.text(900, 680, '▶ Next', {
      fontSize: '20px', fill: '#fff', backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.backButton = this.add.text(820, 680, '◀ Back', {
      fontSize: '20px', fill: '#fff', backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.nextButton.on('pointerdown', () => this.dialogueUI.advance());
    this.backButton.on('pointerdown', () => {
      if (this.currentLine > 0) {
        this.currentLine = Math.max(0, this.currentLine - 2);
        this.showCurrentLine();
      }
    });

    this.input.keyboard.on('keydown-ENTER', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-SPACE', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-RIGHT', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.currentLine > 0) {
        this.currentLine = Math.max(0, this.currentLine - 2);
        this.showCurrentLine();
      }
    });

    this.currentLine = 0;
    this.showCurrentLine();
  }

  showCurrentLine() {
    if (this.currentLine >= this.script.length) {
      this.scene.start('Chapter2game');
      return;
    }

    const nextLine = this.script[this.currentLine];

    this.dialogueUI.onLineComplete = () => {
      this.currentLine++;
      this.showCurrentLine();
    };

    if (
      typeof nextLine.sceneStep === 'number' &&
      nextLine.sceneStep !== this.bgStepIndex &&
      this.bgSteps[nextLine.sceneStep]
    ) {
      this.bgStepIndex = nextLine.sceneStep;
      this.background?.destroy();
      this.bgVideo?.destroy();

      const bgKey = this.bgSteps[this.bgStepIndex];
      if (this.cache.video.exists(bgKey)) {
        this.bgVideo = this.add.video(0, 0, bgKey).setOrigin(0, 0).setDepth(0);
        this.bgVideo.on('play', () => {
          const vidWidth = this.bgVideo.video.videoWidth;
          const vidHeight = this.bgVideo.video.videoHeight;
          const canvasWidth = this.sys.game.config.width;
          const canvasHeight = this.sys.game.config.height;
          const scale = Math.min(canvasWidth / vidWidth, canvasHeight / vidHeight);
          this.bgVideo.setDisplaySize(vidWidth * scale, vidHeight * scale);
        });
        this.bgVideo.play(true);
        this.bgVideo.setLoop(true);
      } else {
        this.background = this.add.image(0, 0, bgKey)
          .setOrigin(0, 0).setDepth(0)
          .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
      }
    }

    this.backButton.setVisible(this.currentLine > 0);
    this.dialogueUI.startDialogue([nextLine]);
  }

  stopVoiceNarration() {
    if (this.voiceNarration?.isPlaying) {
      this.voiceNarration.stop();
      this.voiceNarration.destroy();
      this.voiceNarration = null;
    }
  }

  stopAllSounds() {
    if (this.pressureBgm?.isPlaying) this.pressureBgm.stop();
    this.pressureBgm?.destroy();
    this.pressureBgm = null;
    this.stopVoiceNarration();
  }
}
