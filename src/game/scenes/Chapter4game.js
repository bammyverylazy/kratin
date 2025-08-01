import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter4game extends Phaser.Scene {
  constructor() {
    super('Chapter4game');
    this.rounds = [];
    this.currentRound = 0;
    this.score = 0;
    this.hearts = 3;
    this.heartIcons = [];
    this.requiredTaps = 0;
    this.currentTaps = 0;
    this.character = null;
    this.heartbeatVideo = null;
    this.progressText = null;
    this.scoreText = null;
    this.targetBpmText = null;

    this.correctPopup = null;
    this.correctOverlay = null;
  }

  preload() {
    this.load.image('star', '/assets/star.png');
    this.load.image('relaxing', '/assets/relaxing.png');
    this.load.image('resting', '/assets/resting.png');
    this.load.image('walking', '/assets/walking.png');
    this.load.image('jogging', '/assets/jogging.png');
    this.load.image('running', '/assets/running.png');
    this.load.video('heartbeat', '/assets/heartbeat.mp4');
    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('correct', '/assets/correct.png');
    this.load.image('End', '/assets/End.png'); 
  }

  create() {

      const user = JSON.parse(localStorage.getItem('currentUser'));
      const userId = user?._id;
      const currentChapter = 'Chapter4game';

      console.log('userId:', userId, 'currentChapter:', currentChapter);
      saveGameProgress(userId, currentChapter);

    this.cameras.main.setBackgroundColor('#000');

    this.heartbeatVideo = this.add.video(240, 400, 'heartbeat').setScale(1).setDepth(1).play(true);
    this.heartbeatVideo.setLoop(true);

    addStoryModeUI(this);
    this.createUI();

    this.generateRounds();
    this.startRound();

    this.input.keyboard.on('keydown-SPACE', () => this.handleTap());
    this.input.on('click', () => this.handleTap());
    this.input.on('pointerdown', () => this.handleTap());

    // Black overlay behind popup
    this.correctOverlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.6
    ).setDepth(199).setVisible(false);

    // Correct popup container — using the 'correct' image asset only
    this.correctPopup = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY)
      .setDepth(200)
      .setVisible(false);

    const correctImage = this.add.image(0, 0, 'correct').setOrigin(0.5);
    this.correctPopup.add(correctImage);
  }

  createUI() {
    this.progressText = this.add.text(80, 100, 'Progress: 0/2', {
      fontSize: '24px',
      color: '#fff',
    }).setScrollFactor(0).setDepth(100);

    this.scoreText = this.add.text(80, 130, 'Score: 0', {
      fontSize: '24px',
      color: '#fff',
    }).setScrollFactor(0).setDepth(100);

    this.targetBpmText = this.add.text(750, 180, 'Target BPM: --', {
      fontSize: '28px',
      color: '#ffff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(100 + i * 40, 70, 'star')
        .setScrollFactor(0)
        .setDisplaySize(28, 28)
        .setDepth(100);
      this.heartIcons.push(heart);
    }
  }

  generateRounds() {
    // Example rounds; targetInterval = ms between taps
    const rounds = [
      { label: 'Relaxing (Trial)', targetInterval: 1000, image: 'relaxing' }, // bpm 60 approx
      { label: 'Resting', targetInterval: 1090, image: 'resting' },          // bpm ~55
      { label: 'Walking', targetInterval: 860, image: 'walking' },           // bpm ~70
      { label: 'Jogging', targetInterval: 500, image: 'jogging' },           // bpm ~120
      { label: 'Running', targetInterval: 400, image: 'running' },           // bpm ~150
    ];
    Phaser.Utils.Array.Shuffle(rounds);
    this.rounds = [
      rounds[0], // trial
      rounds[1]  // only 2 rounds for demo
    ];
  }

  startRound() {
    if (this.currentRound >= 2) return this.endGame();

    const round = this.rounds[this.currentRound];
    const bpm = Math.round(60000 / round.targetInterval);

    this.requiredTaps = Math.round(bpm / 10);
    this.currentTaps = 0;

    this.progressText.setText(`Round ${this.currentRound + 1} of 2`);
    this.targetBpmText.setText(`Target BPM: ${bpm} \n (Tap ${this.requiredTaps} times)`);

    if (this.character) this.character.destroy();
    this.character = this.add.image(750, 400, round.image).setScale(0.6);
  }

  handleTap() {
    this.currentTaps++;

    if (this.currentTaps === this.requiredTaps) {
      // Player tapped correct amount → correct!
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
      this.addHeart();
      this.showCorrectPopup();
    } else if (this.currentTaps > this.requiredTaps) {
      // Too many taps → incorrect
      this.loseHeart();
      this.cameras.main.shake(200, 0.01);
      this.currentRound++;
      this.startRound();
    }
  }

  loseHeart() {
    if (this.hearts > 0) {
      this.hearts--;
      const heart = this.heartIcons[this.hearts];
      this.tweens.add({ targets: heart, alpha: 0, duration: 300 });
    }
  }

  addHeart() {
    if (this.hearts < 3) {
      const heart = this.heartIcons[this.hearts];
      heart.setAlpha(1);
      this.tweens.add({
        targets: heart,
        scale: 0.06,
        yoyo: true,
        duration: 300,
        onComplete: () => heart.setScale(0.04)
      });
      this.hearts++;
    }
  }

  showCorrectPopup() {
    this.correctOverlay.setVisible(true);
    this.correctPopup.setVisible(true);
    this.input.enabled = false;

    this.time.delayedCall(1500, () => {
      this.correctPopup.setVisible(false);
      this.correctOverlay.setVisible(false);
      this.input.enabled = true;

      this.currentRound++;
      this.startRound();
    });
  }

endGame() {
  // Show end image
  this.image = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'End')
    .setOrigin(0.5)
    .setScale(0.7)
    .setDepth(200);

  // Add semi-transparent overlay (no interaction!)
  this.overlay = this.add.rectangle(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    this.cameras.main.width,
    this.cameras.main.height,
    0x000000,
    0.6
  ).setDepth(199); // No .setInteractive()

  // Add continue button
  this.continueButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 200, 'Continue', {
    fontSize: '32px',
    backgroundColor: '#4BC6F0',
    color: '#fff',
    padding: { x: 20, y: 10 },
    fontStyle: 'bold',
    align: 'center',
    fixedWidth: 200
  })
  .setOrigin(0.5)
  .setDepth(201)
  .setInteractive({ useHandCursor: true });

  // Button click handler
  this.continueButton.on('pointerdown', () => {
    this.scene.start('Mode', { score: this.score });
  });

  // Do NOT disable input here so button works
  // this.input.enabled = false;
}

}
