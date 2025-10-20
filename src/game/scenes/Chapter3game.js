import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter3game extends Phaser.Scene {
  constructor() {
    super('Chapter3game');
    this.timer = 60;
    this.score = 0;
    this.heartIcons = [];
    this.currentItem = null;
    this.totalItems = 7;
    this.correctCount = 0;
    this.soundEnabled = true;
  }

  preload() {
    this.load.video('chapter4scene1', '/assets/chapter4scene1.mp4');
    this.load.image('star', '/assets/star.png');
    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('red', '/assets/red.png');
    this.load.image('blue', '/assets/blue.png');
    this.load.image('yellow', '/assets/yellow.png');
    this.load.image('green', '/assets/green.png');
    this.load.image('notebook', '/assets/notebook.png');

    this.load.image('plasticbottles', '/assets/plasticbottles.png');
    this.load.image('leftovers', '/assets/leftovers.png');
    this.load.image('treeleaves', '/assets/treeleaves.png');
    this.load.image('facemask', '/assets/facemask.png');
    this.load.image('unrecycleabletrashes', '/assets/unrecycleabletrashes.png');
    this.load.image('electronicdevices', '/assets/electronicdevices.png');
    this.load.image('brokenglass', '/assets/brokenglass.png');

    // New item sprites (used by spawnItem) — ensure these files exist in /assets
    
    this.load.audio('bgm', '/assets/audio/gamemusic.mp3');
    this.load.audio('correctSound', '/assets/audio/correctsound.mp3');
    this.load.audio('wrongSound', '/assets/audio/wrongsound.mp3');
    this.load.audio('walkSound', '/assets/audio/walkingsound.mp3');
    this.load.audio('tick', '/assets/audio/tick.mp3');
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?._id;
    //saveGameProgress(userId, 'Chapter3game');

    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

    this.bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
    this.correctSound = this.sound.add('correctSound');
    this.wrongSound = this.sound.add('wrongSound');
    this.walkSound = this.sound.add('walkSound', { loop: true, volume: 0.3 });
    this.tickSound = this.sound.add('tick', { volume: 0.3 });

    this.sound.mute = !this.soundEnabled;

    this.input.once('pointerdown', () => {
      if (this.soundEnabled && !this.bgm.isPlaying) this.bgm.play();
    });

    this.events.on('shutdown', () => this.stopAllSounds());
    this.events.on('destroy', () => this.stopAllSounds());

    if (this.cache.video.exists('chapter4scene1')) {
      this.add.video(0, 0, 'chapter4scene1')
        .setOrigin(0, 0)
        .setDisplaySize(1024, 768)
        .play(true)
        .setLoop(true)
        .setDepth(-1);
    } else {
      // fallback if video missing: use static chapter4 image if present
      if (this.textures.exists('chapter4')) {
        this.add.image(0, 0, 'chapter4').setOrigin(0, 0).setDisplaySize(1024, 768).setDepth(-1);
      }
    }
    addStoryModeUI(this, {
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.targetBoxes = this.physics.add.staticGroup();
    const boxInfo = [
      { key: 'red', label: 'Hazardous Waste' },
      { key: 'blue', label: 'General Waste' },
      { key: 'yellow', label: 'Recycling Waste' },
      { key: 'green', label: 'Organic Waste' },
    ];

    boxInfo.forEach((info, i) => {
      const x = 180 + i * 220;
      const y = 650;
      const image = this.add.image(x, y - 69, info.key).setDisplaySize(100, 100).setDepth(1).setScale(0.5);
      const label = this.add.text(x, y + 65, info.label, { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
      this.targetBoxes.add(image);
      image.label = info.label;
    });

    for (let i = 0; i < this.totalItems; i++) {
      const star = this.add.image(100 + i * 40, 70, 'star')
        .setScrollFactor(0)
        .setDisplaySize(28, 28)
        .setDepth(10)
        .setAlpha(0); 
      this.heartIcons.push(star);
    }

    this.scoreText = this.add.text(80, 130, 'Score: 0', { fontSize: '24px', color: '#fff' }).setDepth(11);
    this.progressText = this.add.text(80, 100, 'Progress: 0/7', { fontSize: '24px', color: '#fff' }).setDepth(11);
    this.timerText = this.add.text(512, 92, 'Time: 60', { fontSize: '32px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(11);

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject === this.currentItem) gameObject.x = Phaser.Math.Clamp(dragX, 50, 974);
    });

    this.startCountdown(() => this.startGame());
  }

  startCountdown(onComplete) {
    const countdownText = this.add.text(512, 384, '', {
      fontSize: '80px',
      color: '#fff',
    }).setOrigin(0.5);

    const numbers = ['3', '2', '1', 'GO!'];
    let index = 0;

    this.time.addEvent({
      delay: 1000,
      repeat: numbers.length - 1,
      callback: () => {
        countdownText.setText(numbers[index]);
        index++;
        if (index === numbers.length) {
          countdownText.destroy();
          onComplete();
        }
      },
    });
  }

  startGame() {
    this.tickTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timer--;
        this.timerText.setText('Time: ' + this.timer);

        if (this.soundEnabled) {
          if (this.timer <= 5 && this.tickTimer.delay !== 500) {
            this.tickTimer.reset({ delay: 500, loop: true, callback: this.tickTimer.callback, callbackScope: this });
          }
          if (this.timer <= 10) this.tickSound.play();
        }

        if (this.timer <= 0) {
          this.tickTimer.remove();
          this.endGame(true);
        }
      },
    });

    this.time.addEvent({
      delay: 1200,
      loop: true,
      callback: () => {
        if (!this.currentItem) this.spawnItem();
      },
    });
  }

  spawnItem() {
    // Select random item and spawn as a single image sprite (physics-enabled)
    const itemData = Phaser.Utils.Array.GetRandom([
      { label: 'plasticbottles', target: 'yellow' },
      { label: 'facemask', target: 'red' },
      { label: 'treeleaves', target: 'green' },
      { label: 'leftovers', target: 'green' },
      { label: 'electronicdevices', target: 'red' },
      { label: 'unrecycleable trashes', target: 'blue' },
      { label: 'brokenglass', target: 'red' },
    ]);

    const x = Phaser.Math.Between(100, 924);
    // spawn physics image; set reasonable display size for items
    const sprite = this.physics.add.image(x, 0, itemData.label)
      .setDepth(5)
      .setDisplaySize(64, 64); // adjust size as needed

    sprite.setVelocityY(100);
    sprite.setData('target', itemData.target);
    sprite.setInteractive();
    this.input.setDraggable(sprite);
    this.currentItem = sprite;
  }

  update() {
    if (!this.currentItem || this.timer <= 0) return;

    let isMoving = false;

    if (this.cursors.left.isDown) {
      this.currentItem.x -= 4;
      if (this.currentItem.x < 50) this.currentItem.x = 50;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      this.currentItem.x += 4;
      if (this.currentItem.x > 974) this.currentItem.x = 974;
      isMoving = true;
    }

    if (this.soundEnabled) {
      if (isMoving && !this.walkSound.isPlaying) this.walkSound.play();
      if (!isMoving && this.walkSound.isPlaying) this.walkSound.pause();
    }

    if (this.currentItem.y >= 620) {
      this.evaluateItem();
    }
  }

  evaluateItem() {
    const targetBox = this.targetBoxes.getChildren().find(box =>
      Phaser.Geom.Rectangle.Contains(box.getBounds(), this.currentItem.x, this.currentItem.y)
    );

    const matched = targetBox && targetBox.label === this.currentItem.getData('target');

    if (matched) {
      if (this.soundEnabled) this.correctSound.play();
      this.score += 10;
      this.correctCount++;
      this.scoreText.setText('Score: ' + this.score);
      this.progressText.setText(`Progress: ${this.correctCount}/${this.totalItems}`);

      const earnedStar = this.heartIcons[this.correctCount - 1];
      if (earnedStar) {
        this.tweens.add({
          targets: earnedStar,
          alpha: 1,
          duration: 300
        });
      }
    } else {
      if (this.soundEnabled) this.wrongSound.play();
      this.cameras.main.shake(200, 0.01);
    }

    this.currentItem.destroy(true);
    this.currentItem = null;

    if (this.correctCount >= this.totalItems) this.endGame(true);
  }

  endGame(didWin = false) {
    this.physics.pause();

    this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.85)
      .setDepth(1000)
      .setOrigin(0.5)
      .setInteractive();

    const msg = didWin ? 'You Win!' : 'Game Over!';
    this.add.text(512, 300, msg, {
      fontSize: '48px',
      color: '#fff',
    }).setOrigin(0.5).setDepth(1001);

    const playAgainBtn = this.add.text(512, 400, 'Play Again', {
      fontSize: '28px',
      color: '#FFD700',
      backgroundColor: '#333',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    }).setOrigin(0.5).setDepth(1002).setInteractive();

    playAgainBtn.on('pointerdown', () => this.scene.restart());

    const nextBtn = this.add.text(512, 470, 'Proceed to Chapter 4', {
      fontSize: '28px',
      color: '#FFD700',
      backgroundColor: '#333',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    }).setOrigin(0.5).setDepth(1002).setInteractive();

    nextBtn.on('pointerdown', () => this.scene.start('Chapter4'));
  }

  stopAllSounds() {
    [this.bgm, this.correctSound, this.wrongSound, this.walkSound, this.tickSound].forEach(snd => {
      if (snd) {
        if (snd.isPlaying) snd.stop();
        snd.destroy();
      }
    });
  }
}
