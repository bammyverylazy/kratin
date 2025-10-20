// scenes/Chapter1.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';
import { saveGameProgress } from '../utils/saveProgress.js';
// Voice narration manager temporarily disabled:
// import VoiceNarratorManager from '../utils/VoiceNarratorManager.js';
// NOTE: Narrative audio features commented out to avoid runtime errors until
// per-line audio assets and VoiceNarratorManager are verified.

export class Chapter1 extends Phaser.Scene {
  constructor() {
    super("Chapter1");
    this.currentChapter = 'Chapter1';

    this.coverImage = null;
    this.background = null;
    this.bgVideo = null;
    this.startButton = null;
    this.dialogueUI = null;
   // this.voiceNarrator = null;

    this.popupContainer = null;
    this.popupBook = null;
    this.popupText = null;

    this.userId = null;
    this.musicStarted = false;

    this.script = [
      { speaker: "Narrator:", text: "Once upon a time, our beautiful planet was full of green forests, clean rivers, and fresh air." ,sceneStep:1},
      { speaker: "Narrator:", text: "But as time passed, humans began to forget how to take care of nature. The world became polluted and sad.",sceneStep:2 },
      { speaker: "Earthy:", text: "Oh no... The smoke makes it hard for me to breathe! The rivers are full of trash...",sceneStep:3 },
      { speaker: "Narrator:", text: "But don’t worry! Deep inside the forest, a tiny sparkle of hope begins to shine.",sceneStep:8 },
      { speaker: "Narrator:", text: "From the roots of a magical tree, a little green spirit is born — Kratin!" ,sceneStep:8},
      { speaker: "Kratin:", text: "Hi there! I’m Kratin, the guardian of the Earth! I love helping nature stay happy and healthy!",sceneStep:4},
      { speaker: "Narrator:", text: "Kratin looks around and sees how the world needs help. But Kratin can’t do it alone...",sceneStep:5 },
      { speaker: "Kratin:", text: "Hey, friend! Would you like to join me? Together, we can make the world bright again!" ,sceneStep:5},
      { speaker: "Earthy:", text: "Yay! Let’s find out which actions are good or bad for me — so I can smile again!",sceneStep:6 },
      { speaker: "Narrator:", text: "Your journey begins now. Help Kratin sort good and bad behaviors for the Earth!" ,sceneStep:7},
      { speaker: "Kratin:", text: "Let’s start our first challenge! Ready? Let’s go! ☆*: .｡. o(≧▽≦)o .｡.:*☆" ,sceneStep:7},   ];

    this.currentLine = 0;
    this.bgSteps = [
      'chapter1scene0','chapter1scene1','chapter1scene2','chapter1scene3','chapter1scene4','chapter1scene5','chapter1scene6','chapter1scene3'
    ];
    this.bgStepIndex = 0;
  }

  preload() {
    this.load.audio('openingsong', '/assets/audio/openingsong.mp3');
    this.load.audio('backgroundmusic', '/assets/audio/backgroundmusic.mp3');
    // for (let i = 0; i < this.script.length; i++) {
    //   const audioKey = `Chapter1_line${i}`;
    //   this.load.audio(audioKey, `/assets/audio/chapter1/${audioKey}.mp3`);
    // }

    this.load.image('chapter1scene0', '/assets/chapter1scene0.png');
    this.load.image('chapter1', '/assets/chapter1.png');
    this.load.image('chapter1scene0', '/assets/chapter1scene0.png');
    this.load.video('chapter1scene1', '/assets/chapter1scene1.mp4');
    this.load.video('chapter1scene2', '/assets/chapter1scene2.mp4');
    this.load.video('chapter1scene3', '/assets/chapter1scene3.mp4');
    this.load.video('chapter1scene4', '/assets/chapter1scene4.mp4');
    this.load.video('chapter1scene5', '/assets/chapter1scene5.mp4');
    this.load.video('chapter1scene6', '/assets/chapter1scene6.mp4');
    
    

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
    try {
      this.userId = localStorage.getItem('userId');
    } catch (e) {
      console.warn('Could not access localStorage for userId:', e);
      this.userId = null;
    }

    addStoryModeUI(this, {
      userId: this.userId,
      currentChapter: this.currentChapter,
    });

    this.cameras.main.setBackgroundColor('#000000');

    this.coverImage = this.add.image(0, 0, 'chapter1')
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
        padding: { left: 32, right: 32, top: 16, bottom: 16 },
        borderRadius: 12
      }
    ).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      this.coverImage.destroy();
      this.playMusic();
      this.startStorySequence();
    });

    this.input.keyboard.on('keydown', (event) => {
      const allowedKeys = ['Space', 'Enter', 'ArrowRight', 'ArrowLeft', 'KeyZ', 'KeyX'];
      if (allowedKeys.includes(event.code) && this.startButton?.active) {
        this.startButton.emit('pointerdown');
      }
    });
  }

 playMusic() {
  if (this.musicStarted) return;
  this.musicStarted = true;

  const opening = this.sound.add('openingsong', { volume: 1 });
  this.bgm = this.sound.add('backgroundmusic', { volume: 0.3, loop: true }); 

  opening.play();
  this.time.delayedCall(opening.duration * 1000, () => {
    opening.stop();
    this.bgm.play();
  });
}


  startStorySequence() {
    if (this.background) this.background.destroy();
    if (this.bgVideo) this.bgVideo.destroy();

    this.bgStepIndex = 0;
    this.background = this.add.image(0, 0, this.bgSteps[this.bgStepIndex])
      .setOrigin(0, 0)
      .setDepth(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    if (!this.dialogueUI) this.dialogueUI = new DialogueUI(this, this.script);
    // if (!this.voiceNarrator) this.voiceNarrator = new VoiceNarratorManager(this);
    // Voice narration disabled for now. Re-enable when audio files & manager are available:
    // if (!this.voiceNarrator) this.voiceNarrator = new VoiceNarratorManager(this);

    // Create buttons only once
    if (!this.nextButton) {
      this.nextButton = this.add.text(900, 680, '▶ Next', {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#333',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }).setInteractive().setDepth(1000);
      this.nextButton.on('pointerdown', () => this.advanceDialogue());
    }

    if (!this.backButton) {
      this.backButton = this.add.text(820, 680, '◀ Back', {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#333',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }).setInteractive().setDepth(1000);
      this.backButton.on('pointerdown', () => this.rewindDialogue());
    }

    // Keyboard controls
    this.input.keyboard.on('keydown-ENTER', () => this.advanceDialogue());
    this.input.keyboard.on('keydown-SPACE', () => this.advanceDialogue());
    this.input.keyboard.on('keydown-RIGHT', () => this.advanceDialogue());
    this.input.keyboard.on('keydown-LEFT', () => this.rewindDialogue());

    this.currentLine = 0;
    this.showCurrentLine();
  }

  advanceDialogue() {
    if (this.currentLine < this.script.length - 1) {
      this.currentLine++;
      this.showCurrentLine();
    } else {
      this.events.once('shutdown', () => {
      if (this.bgm && this.bgm.isPlaying) {
        this.bgm.stop();
      }
    });
      this.scene.start('Chapter1game');
    }
  }

  rewindDialogue() {
    if (this.currentLine > 0) {
      this.currentLine--;
      this.showCurrentLine();
    }
  }

  showCurrentLine() {
    if (this.currentLine >= this.script.length) {
      this.scene.start('Chapter1game');
      return;
    }

    const nextLine = this.script[this.currentLine];
   // nextLine.audioKey = `Chapter1_line${this.currentLine}`;

    // Handle background or video changes
    if (
      typeof nextLine.sceneStep === 'number' &&
      nextLine.sceneStep !== this.bgStepIndex &&
      this.bgSteps[nextLine.sceneStep]
    ) {
      this.bgStepIndex = nextLine.sceneStep;

      if (this.background) {
        this.background.destroy();
        this.background = null;
      }
      if (this.bgVideo) {
        this.bgVideo.destroy();
        this.bgVideo = null;
      }

      const bgKey = this.bgSteps[this.bgStepIndex];
      if (this.cache.video.exists(bgKey)) {
        this.bgVideo = this.add.video(0, 0, bgKey)
          .setOrigin(0, 0)
          .setDepth(0);

        this.bgVideo.on('play', () => {
          const vidWidth = this.bgVideo.video.videoWidth;
          const vidHeight = this.bgVideo.video.videoHeight;
          const canvasWidth = this.sys.game.config.width;
          const canvasHeight = this.sys.game.config.height;

          let scale = Math.min(canvasWidth / vidWidth, canvasHeight / vidHeight);
          this.bgVideo.setDisplaySize(vidWidth * scale, vidHeight * scale);
        });

        this.bgVideo.play(true);
        this.bgVideo.setLoop(true);
      } else {
        this.background = this.add.image(0, 0, bgKey)
          .setOrigin(0, 0)
          .setDepth(0)
          .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
      }
    };

    this.dialogueUI.startDialogue([this.script[this.currentLine]]);
   // if (this.script[this.currentLine].audioKey) {
   //   this.voiceNarrator.play(this.script[this.currentLine].audioKey, { volume: 1 });
   // }
    this.dialogueUI.onLineComplete = () => {
      // TODO: closePopup() is referenced here but not defined in this file.
      // keep flow but flag for review to avoid runtime exceptions:
      // closePopup();
      this.advanceDialogue();
    };
  }
}
