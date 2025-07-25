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
  }

  preload() {
    this.load.video('Chapter4scene1', '/assets/Chapter4scene1.mp4');
    this.load.video('heartbeat', '/assets/heartbeat.mp4');
    this.load.image('relaxing', '/assets/relaxing.png');
    this.load.image('resting', '/assets/resting.png');
    this.load.image('walking', '/assets/walking.png');
    this.load.image('Jogging', '/assets/jogging.png');
    this.load.image('running', '/assets/running.png');
    this.load.video('Blood', '/assets/Blood.mp4');
    this.load.video('Bloodflow', '/assets/Bloodflow.mp4');
    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');

    // Add quest4 asset for How To Play popup
    this.load.image('quest4', '/assets/quest4.png');
  }

  create() {

      const user = JSON.parse(localStorage.getItem('currentUser'));
      const userId = user?._id;
      const currentChapter = 'Chapter4';

      console.log('userId:', userId, 'currentChapter:', currentChapter);
      saveGameProgress(userId, currentChapter);

    this.cameras.main.setBackgroundColor('#000000');

    this.coverImage = this.add.video(0, 0, 'Chapter4scene1').setOrigin(0, 0).setDepth(0);
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
      onSettings: (scene, box) => scene.add.text(box.x, box.y, 'Settings', { fontSize: '28px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) => scene.add.text(box.x, box.y, 'Book', { fontSize: '28px', color: '#222' }).setOrigin(0.5).setDepth(201),
    });

    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      this.coverImage.destroy();
      this.startStorySequence();
    });
  }

  startStorySequence() {
    this.bgVideo = this.add.video(30, 100, 'heartbeat').setOrigin(-0.25, 0).setDepth(0);
    this.bgVideo.play(true).setLoop(true);

    this.dialogueUI = new DialogueUI(this);

    this.script = [
      { text: "Boom... boom... boom... Can you feel that?", speed: 0.8 },
      { text:  "The pulse is the rhythmic throbbing you can feel in your arteries, caused by the beating of the heart.", video: 'Bloodflow' },
      { text: " It’s like the body's natural drumbeat, marking each heartbeat as blood is pumped through your arteries.",video: 'Blood' },
      { text: "When you're relaxing 🧘 → ~50–60 bpm", speed: 0.2, bubble: "💨 Deep breathing... low pulse", image: "relaxing" },
      { text: "When you're resting 🛌 → ~60–80 bpm", speed: 0.5, bubble: "🛌 Resting... conserving energy", image: "resting" },
      { text: "When you're walking 🚶 → ~80–100 bpm", speed: 1.0, bubble: "🚶 Gentle movement... light pump", image: "walking" },
      { text: "Jogging 🏃‍♂️ → ~100–140 bpm", speed: 2.5, bubble: "🏃 Jogging... moderate effort", image: "running" },
      { text: "Running 🏃💨 → ~140–180 bpm", speed: 3, bubble: "💥 Intense exercise!", image: "running" },
      { text: "Now it’s your mission to match your heartbeat to the activity shown." }
    ];

    this.nextButton = this.add.text(900, 680, '▶ Next', {
      fontSize: '20px', fill: '#ffffff', backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.backButton = this.add.text(820, 680, '◀ Back', {
      fontSize: '20px', fill: '#ffffff', backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

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

    // 🔁 Background video switch
    if (this.bgVideo) {
      this.bgVideo.destroy();
      this.bgVideo = null;
    }

    if (line.video) {
      this.bgVideo = this.add.video(0, 0, line.video).setOrigin(0, 0).setDepth(0);
      this.bgVideo.setMute(true);
      this.bgVideo.play(true);
    } else {
      this.bgVideo = this.add.video(30, 100, 'heartbeat').setOrigin(-0.25, 0).setDepth(0);
      this.bgVideo.setMute(true);
      this.bgVideo.play(true);
      if (line.speed) this.bgVideo.setPlaybackRate(line.speed);
    }

    if (this.activityImage) this.activityImage.destroy();
    this.thoughtBubbles.forEach(b => b.destroy());
    this.thoughtBubbles = [];

    if (line.bubble) {
      const bubble = this.add.text(830, 200, line.bubble, {
        fontSize: '22px',
        color: '#000',
        backgroundColor: '#ffffff',
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
      this.activityImage = this.add.image(830, 200, line.image)
        .setOrigin(0.8, 0.1)
        .setScale(1)
        .setDepth(9);
    }

    this.dialogueUI.onLineComplete = () => {
      this.currentLine++;
      this.showCurrentLine();
    };

    this.backButton.setVisible(this.currentLine > 0);
    this.dialogueUI.startDialogue([{ speaker: 'Narrator', text: line.text }]);
  }

  showGameTransition() {
    // Dark semi-transparent overlay
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7)
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(1000);

    // Show quest4 image popup
    const popup = this.add.image(512, 384, 'quest4')
      .setOrigin(0.5)
      .setDepth(1001)
      .setScale(0.48);

    // Start Game button below popup
    const startBtn = this.add.text(512, 680, 'Start Game', {
      fontSize: '28px',
      color: '#FFD700',
      backgroundColor: '#333',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setDepth(1002)
      .setInteractive({ useHandCursor: true });

    startBtn.on('pointerdown', () => {
      overlay.destroy();
      popup.destroy();
      startBtn.destroy();
      this.scene.start('Chapter4game');
    });
  }
}
