import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter3game extends Phaser.Scene {
  constructor() {
    super('Chapter3game');
    this.timer = 60;
    this.score = 0;
    this.hearts = 3;
    this.heartIcons = [];
    this.currentItem = null;
    this.totalItems = 7;
    this.correctCount = 0;
    this.soundEnabled = true;
  }

  preload() {
    this.load.video('bloodflow', '/assets/bloodflow.mp4');
    this.load.image('star', '/assets/star.png');
    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('rbc', '/assets/rbc.png');
    this.load.image('wbc', '/assets/wbc.png');
    this.load.image('platelet', '/assets/platelet.png');
    this.load.image('plasma', '/assets/plasma.png');

    this.load.audio('bgm', '/assets/audio/gamemusic.mp3');
    this.load.audio('correctSound', '/assets/audio/correctsound.mp3');
    this.load.audio('wrongSound', '/assets/audio/wrongsound.mp3');
    this.load.audio('walkSound', '/assets/audio/walkingsound.mp3');
    this.load.audio('tick', '/assets/audio/tick.mp3'); // ✅ Ticking sound
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?._id;
    saveGameProgress(userId, 'Chapter3game');

    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

    this.bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
    this.correctSound = this.sound.add('correctSound');
    this.wrongSound = this.sound.add('wrongSound');
    this.walkSound = this.sound.add('walkSound', { loop: true, volume: 0.3 });
    this.tickSound = this.sound.add('tick', { volume: 0.3 }); // ✅ Ticking volume lower

    this.sound.mute = !this.soundEnabled;

    this.input.once('pointerdown', () => {
      if (this.soundEnabled && !this.bgm.isPlaying) this.bgm.play();
    });

    this.events.on('shutdown', () => this.stopAllSounds());
    this.events.on('destroy', () => this.stopAllSounds());

    this.add.video(0, 0, 'bloodflow').setOrigin(0, 0).play(true).setLoop(true);

    addStoryModeUI(this, {
      onBook: (scene, box) => scene.add.text(box.x, box.y, 'Book', { fontSize: '24px', color: '#222' }).setOrigin(0.5).setDepth(201),
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.targetBoxes = this.physics.add.staticGroup();
    const boxInfo = [
      { key: 'rbc', label: 'RBC' },
      { key: 'wbc', label: 'WBC' },
      { key: 'platelet', label: 'Platelets' },
      { key: 'plasma', label: 'Plasma' },
    ];

    boxInfo.forEach((info, i) => {
      const x = 180 + i * 220;
      const y = 650;
      const image = this.add.image(x, y - 69, info.key).setDisplaySize(100, 100).setDepth(1).setScale(0.5);
      const label = this.add.text(x, y + 60, info.label, { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
      this.targetBoxes.add(image);
      image.label = info.label;
    });

    for (let i = 0; i < 3; i++) {
      const star = this.add.image(100 + i * 40, 70, 'star').setScrollFactor(0).setDisplaySize(28, 28).setDepth(10);
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
          if (this.timer <= 5) {
            // Switch to faster ticking every 500ms
            if (this.tickTimer.delay !== 500) {
              this.tickTimer.reset({ delay: 500, loop: true, callback: this.tickTimer.callback, callbackScope: this });
            }
          }
          if (this.timer <= 10) {
            this.tickSound.play();
          }
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
    const itemData = Phaser.Utils.Array.GetRandom([
      { label: 'bloodclot', target: 'Platelets' },
      { label: 'hormone', target: 'Plasma' },
      { label: 'food', target: 'Plasma' },
      { label: 'waste', target: 'Plasma' },
      { label: 'bacteria', target: 'WBC' },
      { label: 'poison', target: 'WBC' },
      { label: 'oxygen', target: 'RBC' },
    ]);

    const x = Phaser.Math.Between(100, 924);
    const box = this.add.rectangle(0, 0, 100, 40, 0xffffff).setStrokeStyle(2, 0x000000);
    const label = this.add.text(0, 0, itemData.label, { fontSize: '18px', color: '#000' }).setOrigin(0.5);
    const container = this.add.container(x, 0, [box, label]);

    this.physics.world.enable(container);
    container.body.setVelocityY(100);
    container.setData('target', itemData.target);
    container.setInteractive(new Phaser.Geom.Rectangle(-50, -20, 100, 40), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(container);
    this.currentItem = container;
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
    } else {
      if (this.soundEnabled) this.wrongSound.play();
      if (this.hearts > 0) {
        this.hearts--;
        this.tweens.add({ targets: this.heartIcons[this.hearts], alpha: 0, duration: 300, scale: 0.1 });
      }
      this.cameras.main.shake(200, 0.01);
    }

    this.currentItem.destroy(true);
    this.currentItem = null;

    if (this.hearts <= 0) this.endGame(false);
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
