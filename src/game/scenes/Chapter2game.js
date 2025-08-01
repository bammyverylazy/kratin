import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter2game extends Phaser.Scene {
  constructor() {
    super('Chapter2game');
    this.player = null;
    this.cursors = null;
    this.score = 0;
    this.hearts = 3;
    this.heartIcons = [];
    this.questionIndex = 0;
    this.questions = [];
    this.answeredRooms = new Set();
    this.enemies = [];
    this.zones = {};
    this.canCheckZone = false;
  }

  preload() {
    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('map', '/assets/map.jpg');
    this.load.image('player', '/assets/noobynooby.png');
    this.load.image('enemy', '/assets/enemy.png');
    this.load.image('star', '/assets/star.png');

    this.load.image('correct', '/assets/correct.png');
    this.load.image('tryAgain', '/assets/tryAgain.png');
    this.load.image('quest2', '/assets/quest2.png');
  }

  create() {

      const user = JSON.parse(localStorage.getItem('currentUser'));
      const userId = user?._id;
      const currentChapter = 'Chapter2game';

      console.log('userId:', userId, 'currentChapter:', currentChapter);
      saveGameProgress(userId, currentChapter);

    this.hearts = 3;
    this.heartIcons = [];

    this.add.image(512, 384, 'map').setDepth(0);

    addStoryModeUI(this, {
      onSettings: (scene, box) =>
        scene.add.text(box.x, box.y, 'Custom Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) =>
        scene.add.text(box.x, box.y, 'Custom Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
    });

    this.questions = Phaser.Utils.Array.Shuffle([
      { room: 'Right Atrium', text: 'The Right Atrium receives blood from the vena cava.' },
      { room: 'Right Ventricle', text: 'The Right Ventricle pumps blood to the lungs.' },
      { room: 'Left Atrium', text: 'The Left Atrium receives oxygenated blood from the lungs.' },
      { room: 'Left Ventricle', text: 'The Left Ventricle pumps oxygenated blood to the body.' },
    ]);

    this.player = this.physics.add.sprite(100, 700, 'player');
    this.player.setDisplaySize(64, 64);
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys() || this.input.touch.createCursorKeys();

    this.createZones();
    this.createEnemies();

    this.scoreText = this.add.text(80, 130, 'Score: 0', { fontSize: '24px', color: '#fff' }).setScrollFactor(0);
    this.progressText = this.add.text(80, 100, 'Progress: 0/4', { fontSize: '24px', color: '#fff' }).setScrollFactor(0);

    for (let i = 0; i < this.hearts; i++) {
      const star = this.add.image(100 + i * 40, 70, 'star').setScrollFactor(0).setDisplaySize(32, 32).setDepth(10);
      this.heartIcons.push(star);
    }

    this.showHowToPlayPopup(() => this.askQuestion());
  }

  showHowToPlayPopup(onClose) {
    const overlay = this.add.rectangle(512, 344, 1024, 768, 0x000000, 0.7)
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(1000);

    const popup = this.add.image(512, 384, 'quest2')
      .setOrigin(0.5)
      .setDepth(1001)
      .setScale(0.5);

    overlay.once('pointerdown', () => {
      overlay.destroy();
      popup.destroy();
      if (onClose) onClose();
    });
  }

  showQuestionPopup(questionText) {
    this.physics.pause();
    this.canCheckZone = false;

    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.5).setDepth(299);
    const popupBox = this.add.rectangle(512, 320, 700, 200, 0xffffff).setDepth(300);
    const popupText = this.add.text(512, 320, questionText, {
      fontSize: '26px',
      color: '#222',
      align: 'center',
      wordWrap: { width: 640 }
    }).setOrigin(0.5).setDepth(301);

    const closeBtn = this.add.text(512, 410, 'Close', {
      fontSize: '24px',
      color: '#FFD700',
      backgroundColor: '#333',
      padding: { left: 16, right: 16, top: 8, bottom: 8 },
    }).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      popupBox.destroy();
      popupText.destroy();
      closeBtn.destroy();
      this.physics.resume();
      this.time.delayedCall(500, () => {
        this.canCheckZone = true;
      });
    });
  }

  // Modified showImagePopup to pause until user closes
  showImagePopup(key, onDone) {
    this.physics.pause();
    this.canCheckZone = false;

    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.66)
      .setOrigin(0.5)
      .setDepth(998)
      .setInteractive();

    const popup = this.add.image(512, 384, key)
      .setOrigin(0.5)
      .setDepth(999)
      .setScale(0.8);

    const closeBtn = this.add.text(512, 500, 'Close', {
      fontSize: '28px',
      color: '#FFD700',
      backgroundColor: '#333',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    })
      .setOrigin(0.5)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      popup.destroy();
      closeBtn.destroy();
      this.physics.resume();
      this.time.delayedCall(500, () => {
        this.canCheckZone = true;
      });
      if (onDone) onDone();
    });
  }

  createZones() {
    const zoneConfig = {
      'Right Atrium': new Phaser.Geom.Rectangle(530, 270, 160, 100),
      'Right Ventricle': new Phaser.Geom.Rectangle(520, 400, 200, 130),
      'Left Atrium': new Phaser.Geom.Rectangle(310, 270, 180, 90),
      'Left Ventricle': new Phaser.Geom.Rectangle(260, 390, 200, 130),
    };

    for (const [name, rect] of Object.entries(zoneConfig)) {
      this.zones[name] = rect;
    }
  }

  createEnemies() {
    const positions = [
      { x: 400, y: 300 },
      { x: 600, y: 400 },
    ];

    positions.forEach(pos => {
      const enemy = this.physics.add.sprite(pos.x, pos.y, 'enemy');
      enemy.setDisplaySize(48, 48);
      this.enemies.push(enemy);
    });
  }

  askQuestion() {
    if (this.questionIndex >= this.questions.length) return;
    const q = this.questions[this.questionIndex];
    this.showQuestionPopup(q.text);
  }

  checkZoneEntry() {
    const { x, y } = this.player;
    const current = this.questions[this.questionIndex];

    if (this.answeredRooms.has(current.room)) return;

    const zone = this.zones[current.room];
    if (zone && zone.contains(x, y)) {
      this.answeredRooms.add(current.room);
      this.handleAnswer(true);
    } else {
      for (const [name, z] of Object.entries(this.zones)) {
        if (z.contains(x, y) && name !== current.room) {
          this.handleAnswer(false);
        }
      }
    }
  }

  handleAnswer(correct) {
    if (correct) {
      this.showImagePopup('correct', () => {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        this.questionIndex++;
        this.progressText.setText(`Progress: ${this.questionIndex}/4`);

        const burst = this.add.circle(this.player.x, this.player.y, 10, 0xffffff, 0.5).setDepth(9);
        this.tweens.add({
          targets: burst,
          radius: 60,
          alpha: 0,
          duration: 400,
          ease: 'Cubic.easeOut',
          onComplete: () => burst.destroy()
        });

        const scoreText = this.add.text(this.player.x, this.player.y - 80, '+10', {
          fontSize: '28px',
          color: '#FFD700',
          fontStyle: 'bold',
          stroke: '#000',
          strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
          targets: scoreText,
          y: this.player.y - 120,
          alpha: 0,
          duration: 700,
          ease: 'Cubic.easeOut',
          onComplete: () => scoreText.destroy()
        });

        if (this.hearts < this.heartIcons.length) {
          const star = this.heartIcons[this.hearts];
          star.setVisible(true).setAlpha(1).setDisplaySize(32, 32);
        } else {
          const newStar = this.add.image(100 + (this.hearts) * 40, 70, 'star')
            .setScrollFactor(0).setDisplaySize(32, 32).setDepth(10);
          this.heartIcons.push(newStar);
        }

        this.hearts++;

        if (this.questionIndex >= this.questions.length) {
          this.endGame(true);
          return;
        }

        this.player.setPosition(100, 700);
        this.askQuestion();
      });

    } else {
      this.showImagePopup('tryAgain', () => {
        if (this.hearts > 0) {
          this.hearts--;
          const lostHeart = this.heartIcons[this.hearts];
          if (lostHeart) {
            this.tweens.add({
              targets: lostHeart,
              alpha: 0,
              scale: 1,
              duration: 300,
              ease: 'Back.easeIn',
              onComplete: () => lostHeart.setVisible(false)
            });
            this.cameras.main.shake(200, 0.01);
          }
        }

        if (this.hearts <= 0) {
          this.endGame(false);
          return;
        }

        this.player.setPosition(100, 700);
        this.askQuestion();
      });
    }
  }

  moveEnemies() {
    this.enemies.forEach(enemy => {
      if (!enemy || !enemy.body) return;
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const speed = 50;
        enemy.setVelocity((dx / dist) * speed, (dy / dist) * speed);
      }
    });
  }

  checkEnemyCollisions() {
    this.enemies.forEach(enemy => {
      if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 30) {
        this.handleAnswer(false);
      }
    });
  }

  handleMovement() {
    const speed = 160;
    this.player.setVelocity(0);
    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down.isDown) this.player.setVelocityY(speed);
  }

  update() {
    if (!this.player) return;
    this.handleMovement();
    if (this.canCheckZone) this.checkZoneEntry();
    this.moveEnemies();
    this.checkEnemyCollisions();
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
      color: '#fff'
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
      playAgainBtn.destroy();
      nextBtn.destroy();
      this.scene.restart();
    });

    const nextBtn = this.add.text(512, 470, 'Proceed to Chapter 3', {
      fontSize: '28px',
      color: '#FFD700',
      backgroundColor: '#333',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    })
      .setOrigin(0.5)
      .setDepth(1002)
      .setInteractive({ useHandCursor: true });

    nextBtn.on('pointerdown', () => {
      playAgainBtn.destroy();
      nextBtn.destroy();
      this.scene.launch('LoadingOverlay');
      this.scene.start('Chapter3');
    });
  }
}
