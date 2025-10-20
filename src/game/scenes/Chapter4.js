import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter4 extends Scene {
  constructor() {
    super("Chapter4");
    this.currentLine = 0;
    this.thoughtBubbles = [];
    this.activityImage = null;
    // track which scene step/video is currently shown
    this.currentSceneStep = null;
    this.bgVideo = null;
  }

  preload() {
    this.load.video('chapter4scene1', '/assets/chapter4scene1.mp4');
    this.load.video('chapter4scene2', '/assets/chapter4scene2.mp4');
    this.load.image('chapter4', '/assets/chapter4.png');

     this.load.video('earthymoving', '/assets/earthymoving.mp4');

    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('quest4', '/assets/quest4.png');
    this.load.image('notebook', '/assets/notebook.png');

    // Audio
    // this.load.audio('narration1', '/assets/audio/line1.mp3'); // For future
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?._id;
    const currentChapter = 'Chapter4';
    //saveGameProgress(userId, currentChapter);

    this.cameras.main.setBackgroundColor('#a7d8e8');
  
    // Use the same key as in preload: 'chapter4scene1' (lowercase).
    this.coverImage = this.add.video(0, 0, 'chapter4scene1').setOrigin(0, 0).setDepth(0);
    this.coverImage.setMute(true);
    this.coverImage.play(true);

    this.coverImage.on('play', () => {
      const scale = Math.min(
        this.sys.game.config.width / this.coverImage.video.videoWidth,
        this.sys.game.config.height / this.coverImage.video.videoHeight
      );
      this.coverImage.setDisplaySize(
        this.coverImage.video.videoWidth * scale,
        this.coverImage.video.videoHeight * scale
      );
    });

    this.startButton = this.add.text(512, 680, 'Start', {
      fontSize: '48px',
      color: '#ffffff',
      padding: { left: 24, right: 24, top: 12, bottom: 12 }
    }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

    addStoryModeUI(this, {
         });

    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      this.coverImage.destroy();
      this.startStorySequence();
    });
  }

  startStorySequence() {
    this.dialogueUI = new DialogueUI(this);

    this.script = [
         { speaker: "Narrator:", text: "Kratin and Earthy travel to the city where people move in many ways — cars, bikes, buses, and on foot." },
        { speaker: "Earthy:", text: "Hmm… I feel warm when there are too many cars. The smoke makes the air heavy." ,sceneStep:1},
        { speaker: "Kratin:", text: "Let’s choose cleaner ways to travel — walking, biking, or using renewable energy!" ,sceneStep:2},
        { speaker: "Narrator:", text: "Each good choice helps the world glow brighter and keeps Earthy cool and happy." ,sceneStep:2},
        { speaker: "Kratin:", text: "Let’s find the best way to move — the one that makes Earthy smile!", sceneStep:2},

    ];
    // TODO: 'Bloodflow' and 'Blood' are referenced by the script but are NOT preloaded above.
    // Either preload these video keys in preload() or remove/replace them.

    this.bgVideo = null;
    this.nextButton = this.add.text(900, 680, '▶ Next', { fontSize: '20px', fill: '#ffffff', backgroundColor: '#333', padding: { left: 10, right: 10, top: 5, bottom: 5 } }).setInteractive().setDepth(1000);
    this.backButton = this.add.text(820, 680, '◀ Back', { fontSize: '20px', fill: '#ffffff', backgroundColor: '#333', padding: { left: 10, right: 10, top: 5, bottom: 5 } }).setInteractive().setDepth(1000);

    this.nextButton.on('pointerdown', () => this.advanceDialogue());
    this.backButton.on('pointerdown', () => {
      if (this.currentLine > 0) {
        this.currentLine -= 2;
        this.showCurrentLine();
      }
    });

    this.input.keyboard.on('keydown-RIGHT', () => this.advanceDialogue());
    this.input.keyboard.on('keydown-ENTER', () => this.advanceDialogue());
    this.input.keyboard.on('keydown-SPACE', () => this.advanceDialogue());
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.currentLine > 0) {
        this.currentLine -= 2;
        this.showCurrentLine();
      }
    });

    this.showCurrentLine();
  }

  advanceDialogue() {
    this.dialogueUI.advance();
  }

 

  showCurrentLine() {
    if (this.currentLine >= this.script.length) {
      this.nextButton.destroy();
      this.backButton.destroy();
      this.showGameTransition();
      return;
    }

    const line = this.script[this.currentLine];

    // Switch background video/image according to sceneStep (if provided)
    const newStep = line.sceneStep ?? null;
    if (newStep !== this.currentSceneStep) {
      const newKey = newStep ? `chapter4scene${newStep}` : null;
      this._switchBackgroundTo(newKey);
    }

    // 🎤 Future voice narration (placeholder)
    // this.playNarration(this.currentLine);

    if (this.activityImage) this.activityImage.destroy();
    this.thoughtBubbles.forEach(b => b.destroy());
    this.thoughtBubbles = [];

    if (line.bubble) {
      const bubble = this.add.text(830, 200, line.bubble, {
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

    if (line.image) {
      this.activityImage = this.add.image(830, 200, line.image).setOrigin(0.8, 0.1).setScale(1).setDepth(9);
    }

    this.dialogueUI.onLineComplete = () => {
      this.currentLine++;
      this.showCurrentLine();
    };

    this.backButton.setVisible(this.currentLine > 0);
    this.dialogueUI.startDialogue([{ speaker: 'Narrator', text: line.text }]);
  }

  // Helper: smoothly switch background to provided video key (or fallback image).
  _switchBackgroundTo(key) {
    // If current key is same, do nothing
    if (key && this.bgVideo && this.bgVideo.getData('key') === key) {
      this.currentSceneStep = key.replace('chapter4scene','') || this.currentSceneStep;
      return;
    }
    
    // Create new background (video preferred). New object starts invisible (alpha=0)
    let newBg = null;
    if (key && this.cache.video.exists(key)) {
      newBg = this.add.video(0, 0, key).setOrigin(0, 0).setDepth(0).setAlpha(0);
      newBg.setMute(true);
      // play and loop
      try { newBg.play(true); } catch (e) { /* ignore play errors */ }
      if (typeof newBg.setLoop === 'function') newBg.setLoop(true);
      // scale once playback begins (videoWidth available after 'play')
      newBg.on('play', () => {
        const vw = newBg.video.videoWidth || newBg.width || this.sys.game.config.width;
        const vh = newBg.video.videoHeight || newBg.height || this.sys.game.config.height;
        const scale = Math.min(this.sys.game.config.width / vw, this.sys.game.config.height / vh);
        newBg.setDisplaySize(vw * scale, vh * scale);
      });
      newBg.setData('key', key);
    } else if (this.textures.exists('chapter4')) {
      // fallback to static image if video missing
      newBg = this.add.image(0, 0, 'chapter4').setOrigin(0, 0).setDepth(0).setAlpha(0);
      newBg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
      newBg.setData('key', 'chapter4');
    } else {
      // Nothing to show — clear existing background
      if (this.bgVideo) {
        this.tweens.add({
          targets: this.bgVideo,
          alpha: 0,
          duration: 400,
          onComplete: () => {
            try { this.bgVideo.destroy(); } catch (e) {}
            this.bgVideo = null;
          }
        });
        this.currentSceneStep = null;
      }
      return;
    }

    // Fade in new background while fading out old one
    const duration = 600;
    // Fade out existing
    if (this.bgVideo) {
      this.tweens.add({
        targets: this.bgVideo,
        alpha: 0,
        duration,
        onComplete: () => {
          try { this.bgVideo.destroy(); } catch (e) {}
        }
      });
    }

    // Fade in new
    this.tweens.add({
      targets: newBg,
      alpha: 1,
      duration,
      ease: 'Sine.easeInOut'
    });

    this.bgVideo = newBg;
    // update currentSceneStep numeric value where possible
    if (key && key.startsWith('chapter4scene')) {
      const stepNum = parseInt(key.replace('chapter4scene',''), 10);
      this.currentSceneStep = Number.isFinite(stepNum) ? stepNum : null;
    } else {
      this.currentSceneStep = null;
    }
  }

  //  Voice narration system (future use)
  playNarration(lineIndex) {
    // const narrationKey = `narration${lineIndex}`;
    // if (this.sound.get(narrationKey)) {
    //   this.sound.play(narrationKey);
    // }
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
}