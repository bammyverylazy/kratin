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
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?._id;
    const currentChapter = 'Chapter3game';

    console.log('userId:', userId, 'currentChapter:', currentChapter);
    saveGameProgress(userId, currentChapter);

    this.timer = 60;
    this.score = 0;
    this.hearts = 3;
    this.correctCount = 0;
    this.currentItem = null;
    this.heartIcons = [];

    this.add.video(0, 0, 'bloodflow').setOrigin(0, 0).play(true).setLoop(true);

    addStoryModeUI(this, {
      onSettings: (scene, box) =>
        scene
          .add.text(box.x, box.y, 'Settings', { fontSize: '24px', color: '#222' })
          .setOrigin(0.5)
          .setDepth(201),
      onBook: (scene, box) =>
        scene
          .add.text(box.x, box.y, 'Book', { fontSize: '24px', color: '#222' })
          .setOrigin(0.5)
          .setDepth(201),
    });

    this.cursors = this.input.keyboard.createCursorKeys() || this.input.touch.createCursorKeys();

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
      const label = this.add.text(x, y + 60, info.label, {
        fontSize: '24px',
        color: '#fff',
      }).setOrigin(0.5);
      this.targetBoxes.add(image);
      image.label = info.label;
    });

    for (let i = 0; i < 3; i++) {
      const star = this.add.image(100 + i * 40, 70, 'star')
        .setScrollFactor(0)
        .setDisplaySize(28, 28)
        .setDepth(10);
      this.heartIcons.push(star);
    }

    this.scoreText = this.add.text(80, 130, 'Score: 0', {
      fontSize: '24px',
      color: '#fff',
    }).setScrollFactor(0).setDepth(11);

    this.progressText = this.add.text(80, 100, 'Progress: 0/7', {
      fontSize: '24px',
      color: '#fff',
    }).setScrollFactor(0).setDepth(11);

    this.timerText = this.add.text(512, 92, 'Time: 60', {
      fontSize: '32px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(11);

    // Drag event handler for dragging currentItem horizontally
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject === this.currentItem) {
        // Clamp X to game bounds (adjust if your game width changes)
        gameObject.x = Phaser.Math.Clamp(dragX, 50, 974);
      }
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
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timer--;
        this.timerText.setText('Time: ' + this.timer);
        if (this.timer <= 0) this.endGame(true);
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
    const y = 0;

    const box = this.add.rectangle(0, 0, 100, 40, 0xffffff).setStrokeStyle(2, 0x000000);
    const label = this.add.text(0, 0, itemData.label, {
      fontSize: '18px',
      color: '#000',
    }).setOrigin(0.5);

    const container = this.add.container(x, y, [box, label]);
    this.physics.world.enable(container);
    container.body.setVelocityY(100);
    container.setData('target', itemData.target);

    // Make container interactive and draggable horizontally
    container.setInteractive(new Phaser.Geom.Rectangle(-50, -20, 100, 40), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(container);

    this.currentItem = container;
  }

  update() {
    if (!this.currentItem || this.timer <= 0) return;

    // Keyboard controls move the current item left/right
    if (this.cursors.left.isDown) {
      this.currentItem.x -= 4;
      if (this.currentItem.x < 50) this.currentItem.x = 50;  // clamp left bound
    } else if (this.cursors.right.isDown) {
      this.currentItem.x += 4;
      if (this.currentItem.x > 974) this.currentItem.x = 974; // clamp right bound
    }

    // Check if the item reached near bottom to evaluate
    if (this.currentItem.y >= 620) {
      this.evaluateItem();
    }
  }

  evaluateItem() {
    const targetBox = this.targetBoxes.getChildren().find(box =>
      Phaser.Geom.Rectangle.Contains(box.getBounds(), this.currentItem.x, this.currentItem.y)
    );

    const correctTarget = this.currentItem.getData('target');
    const matched = targetBox && targetBox.label === correctTarget;

    if (matched) {
      this.score += 10;
      this.correctCount++;
      this.scoreText.setText('Score: ' + this.score);
      this.progressText.setText(`Progress: ${this.correctCount}/${this.totalItems}`);

      if (this.hearts < 3) {
        const heart = this.heartIcons[this.hearts];
        heart.setAlpha(1).setVisible(true).setScale(0.5);

     // Pulse effect tween:
      this.tweens.add({
      targets: heart,
      scale: { from: 0.28, to: 0.35 },
      yoyo: true,
      repeat: 2,
      duration: 200,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        heart.setScale(0.28);
      },
    });


        this.hearts++;
      }

      const scoreText = this.add.text(this.currentItem.x, this.currentItem.y - 80, '+10', {
        fontSize: '28px',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(10);

      this.tweens.add({
        targets: scoreText,
        y: this.currentItem.y - 120,
        alpha: 0,
        duration: 700,
        ease: 'Cubic.easeOut',
        onComplete: () => scoreText.destroy(),
      });
    } else {
      if (this.hearts > 0) {
        this.hearts--;
        this.tweens.add({
          targets: this.heartIcons[this.hearts],
          alpha: 0,
          duration: 300,
          scale: 0.1,
        });
      }

      this.cameras.main.shake(200, 0.01);

      this.targetBoxes.getChildren().forEach(box => {
        this.tweens.add({
          targets: box,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
          yoyo: true,
          ease: 'Quad.easeInOut',
          onComplete: () => box.setScale(0.5),
        });
      });
    }

    this.currentItem.destroy(true);
    this.currentItem = null;

    if (this.hearts <= 0) {
      this.endGame(false);
    }

    if (this.correctCount >= this.totalItems) {
      this.endGame(true);
    }
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
    })
      .setOrigin(0.5)
      .setDepth(1002)
      .setInteractive({ useHandCursor: true });

    playAgainBtn.on('pointerdown', () => {
      this.scene.restart();
    });

    const nextBtn = this.add.text(512, 470, 'Proceed to Chapter 4', {
      fontSize: '28px',
      color: '#FFD700',
      backgroundColor: '#333',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    })
      .setOrigin(0.5)
      .setDepth(1002)
      .setInteractive({ useHandCursor: true });

    nextBtn.on('pointerdown', () => {
      this.scene.start('Chapter4');
    });
  }
}
