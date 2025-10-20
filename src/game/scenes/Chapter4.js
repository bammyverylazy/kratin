import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter4 extends Scene {
  constructor() {
    super("Chapter4");
    this.currentLine = 0;
    this.dialogueUI = null;

    // background / video management (chapter2/chapter1 style)
    this.bgSteps = ['chapter4scene1', 'chapter4scene2'];
    this.bgStepIndex = 0;
    this.background = null;
    this.bgVideo = null;

    // UI / controls
    this.startButton = null;
    this.nextButton = null;
    this.backButton = null;

    // audio
    this.bgm = null;
    this.soundEnabled = true;

    // dialogue visuals
    this.thoughtBubbles = [];
    this.activityImage = null;
  }

  preload() {
    // Preload both scene videos and a fallback image
    this.load.video('chapter4scene1', '/assets/chapter4scene1.mp4');
    this.load.video('chapter4scene2', '/assets/chapter4scene2.mp4');
    this.load.image('chapter4', '/assets/chapter4.png');

    // small extra video used elsewhere
    this.load.video('earthymoving', '/assets/earthymoving.mp4');

    // UI images
    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('quest4', '/assets/quest4.png');
    this.load.image('notebook', '/assets/notebook.png');

    // Use the shared background music (as requested)
    this.load.audio('backgroundmusic', '/assets/audio/backgroundmusic.mp3');
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = user?._id;
    //saveGameProgress(this.userId, 'Chapter4');

    // sound settings
    const storedSound = localStorage.getItem('soundEnabled');
    this.soundEnabled = storedSound === null ? true : (storedSound === 'true');
    this.sound.mute = !this.soundEnabled;

    // background music (use backgroundmusic instead of pressureBgm)
    this.bgm = this.sound.add('backgroundmusic', { loop: true, volume: 0.35 });
    if (this.soundEnabled) this.bgm.play();

    this.cameras.main.setBackgroundColor('#a7d8e8');

    // cover: prefer image first, then video if preloaded (chapter1/chapter2 style fallback)
    this.coverImage = this.add.image(0, 0, 'chapter4').setOrigin(0, 0).setDepth(0);
    if (this.cache.video.exists('chapter4scene1')) {
      // if video exists, use it as cover (but keep the image fallback)
      this.coverImage = this.add.video(0, 0, 'chapter4scene1').setOrigin(0, 0).setDepth(0);
      this.coverImage.setMute(true);
      this.coverImage.play(true);
      this.coverImage.on('play', () => {
        const vw = this.coverImage.video.videoWidth || this.sys.game.config.width;
        const vh = this.coverImage.video.videoHeight || this.sys.game.config.height;
        const scale = Math.min(this.sys.game.config.width / vw, this.sys.game.config.height / vh);
        this.coverImage.setDisplaySize(vw * scale, vh * scale);
      });
    } else {
      this.coverImage.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    }

    // Start button + UI
    this.startButton = this.add.text(512, 680, 'Start', {
      fontSize: '48px',
      color: '#ffffff',
      padding: { left: 24, right: 24, top: 12, bottom: 12 }
    }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

    addStoryModeUI(this, {});

    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      if (this.coverImage) { try { this.coverImage.destroy(); } catch (e) {} }
      this.startStorySequence();
    });

    // Ensure sounds stop on scene shutdown
    this.events.on('shutdown', () => this.stopAllSounds());
    this.events.on('destroy', () => this.stopAllSounds());
  }

  startStorySequence() {
    // Clean any previous backgrounds
    if (this.background) { this.background.destroy(); this.background = null; }
    if (this.bgVideo) { this.bgVideo.destroy(); this.bgVideo = null; }

    // start with first bgStep (image or video)
    this.bgStepIndex = 0;
    const initialKey = this.bgSteps[this.bgStepIndex];
    if (this.cache.video.exists(initialKey)) {
      this.bgVideo = this.add.video(0, 0, initialKey).setOrigin(0, 0).setDepth(0);
      this.bgVideo.setMute(true);
      this.bgVideo.on('play', () => {
        const vw = this.bgVideo.video.videoWidth || this.sys.game.config.width;
        const vh = this.bgVideo.video.videoHeight || this.sys.game.config.height;
        const scale = Math.min(this.sys.game.config.width / vw, this.sys.game.config.height / vh);
        this.bgVideo.setDisplaySize(vw * scale, vh * scale);
      });
      this.bgVideo.play(true);
      if (typeof this.bgVideo.setLoop === 'function') this.bgVideo.setLoop(true);
    } else {
      this.background = this.add.image(0, 0, initialKey).setOrigin(0, 0).setDepth(0)
        .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    }

    // Dialogue UI
    if (!this.dialogueUI) this.dialogueUI = new DialogueUI(this);

    // Next / Back buttons (chapter2 style)
    this.nextButton?.destroy();
    this.backButton?.destroy();

    this.nextButton = this.add.text(900, 680, '▶ Next', {
      fontSize: '20px', fill: '#ffffff', backgroundColor: '#333', padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.backButton = this.add.text(820, 680, '◀ Back', {
      fontSize: '20px', fill: '#ffffff', backgroundColor: '#333', padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.nextButton.on('pointerdown', () => this.advanceDialogue());
    this.backButton.on('pointerdown', () => {
      if (this.currentLine > 0) {
        this.currentLine = Math.max(0, this.currentLine - 2);
        this.showCurrentLine();
      }
    });

    this.input.keyboard.on('keydown-ENTER', () => this.advanceDialogue());
    this.input.keyboard.on('keydown-SPACE', () => this.advanceDialogue());
    this.input.keyboard.on('keydown-RIGHT', () => this.advanceDialogue());
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.currentLine > 0) {
        this.currentLine = Math.max(0, this.currentLine - 2);
        this.showCurrentLine();
      }
    });

    // Prepare script (kept same content)
    this.script = [
      { speaker: "Narrator:", text: "Kratin and Earthy travel to the city where people move in many ways — cars, bikes, buses, and on foot." },
      { speaker: "Earthy:", text: "Hmm… I feel warm when there are too many cars. The smoke makes the air heavy.", sceneStep: 1 },
      { speaker: "Kratin:", text: "Let’s choose cleaner ways to travel — walking, biking, or using renewable energy!", sceneStep: 2 },
      { speaker: "Narrator:", text: "Each good choice helps the world glow brighter and keeps Earthy cool and happy.", sceneStep: 2 },
      { speaker: "Kratin:", text: "Let’s find the best way to move — the one that makes Earthy smile!", sceneStep: 2 }
    ];

    this.currentLine = 0;
    this.showCurrentLine();
  }

  advanceDialogue() {
    if (this.currentLine < this.script.length - 1) {
      this.currentLine++;
      this.showCurrentLine();
    } else {
      // stop music when leaving scene (chapter1 style)
      this.events.once('shutdown', () => {
        if (this.bgm?.isPlaying) this.bgm.stop();
      });
      this.scene.start('Chapter4game');
    }
  }

  showCurrentLine() {
    if (this.currentLine >= this.script.length) {
      this.showGameTransition();
      return;
    }

    const nextLine = this.script[this.currentLine];

    // Handle sceneStep => bgSteps mapping (chapter2 style)
    if (
      typeof nextLine.sceneStep === 'number' &&
      nextLine.sceneStep !== this.bgStepIndex &&
      this.bgSteps[nextLine.sceneStep]
    ) {
      this.bgStepIndex = nextLine.sceneStep;

      // destroy existing bg
      if (this.background) { this.background.destroy(); this.background = null; }
      if (this.bgVideo) { try { this.bgVideo.destroy(); } catch(e){}; this.bgVideo = null; }

      const bgKey = this.bgSteps[this.bgStepIndex];
      if (this.cache.video.exists(bgKey)) {
        this.bgVideo = this.add.video(0, 0, bgKey).setOrigin(0, 0).setDepth(0);
        this.bgVideo.setMute(true);
        this.bgVideo.on('play', () => {
          const vidWidth = this.bgVideo.video.videoWidth || this.sys.game.config.width;
          const vidHeight = this.bgVideo.video.videoHeight || this.sys.game.config.height;
          const canvasWidth = this.sys.game.config.width;
          const canvasHeight = this.sys.game.config.height;
          const scale = Math.min(canvasWidth / vidWidth, canvasHeight / vidHeight);
          this.bgVideo.setDisplaySize(vidWidth * scale, vidHeight * scale);
        });
        // play/loop safely
        try { this.bgVideo.play(true); } catch (e) {}
        if (typeof this.bgVideo.setLoop === 'function') this.bgVideo.setLoop(true);
      } else {
        this.background = this.add.image(0, 0, bgKey).setOrigin(0, 0).setDepth(0)
          .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
      }
    }

    // clean dialog visuals
    if (this.activityImage) { try { this.activityImage.destroy(); } catch(e){}; this.activityImage = null; }
    this.thoughtBubbles.forEach(b => { try { b.destroy(); } catch(e){}; });
    this.thoughtBubbles = [];

    if (nextLine.bubble) {
      const bubble = this.add.text(830, 200, nextLine.bubble, {
        fontSize: '22px', color: '#000', backgroundColor: '#ffffff',
        padding: { left: 12, right: 12, top: 8, bottom: 8 }
      }).setOrigin(1, 1.3).setAlpha(0).setDepth(10);

      this.tweens.add({
        targets: bubble,
        x: 920,
        alpha: 1,
        duration: 600,
        ease: 'Sine.easeInOut'
      });
      this.thoughtBubbles.push(bubble);
    }

    if (nextLine.image) {
      this.activityImage = this.add.image(830, 200, nextLine.image).setOrigin(0.8, 0.1).setScale(1).setDepth(9);
    }

    this.backButton.setVisible(this.currentLine > 0);

    // start dialogue line via DialogueUI
    if (!this.dialogueUI) this.dialogueUI = new DialogueUI(this);
    this.dialogueUI.onLineComplete = () => {
      this.currentLine++;
      this.showCurrentLine();
    };
    this.dialogueUI.startDialogue([nextLine]);
  }

  showGameTransition() {
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7)
      .setOrigin(0.5).setInteractive().setDepth(1000);

    const popup = this.add.image(512, 384, 'quest4').setOrigin(0.5).setDepth(1001).setScale(0.48);

    const startBtn = this.add.text(512, 680, 'Start Game', {
      fontSize: '28px',
      color: '#FFD700',
      backgroundColor: '#333',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setDepth(1002).setInteractive({ useHandCursor: true });

    startBtn.on('pointerdown', () => {
      overlay.destroy();
      popup.destroy();
      startBtn.destroy();
      this.scene.start('Chapter4game');
    });
  }

  stopAllSounds() {
    if (this.bgm?.isPlaying) this.bgm.stop();
    this.bgm?.destroy();
    this.bgm = null;
  }
}