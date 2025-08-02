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
    this.zones = {};
    this.canCheckZone = false;
    this.soundEnabled = true;
    this.isWalking = false;
    this.enemies = []; // <-- enemies array for enemy sprites
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

    this.load.audio('bgm', '/assets/audio/gamemusic.mp3');
    this.load.audio('correctSound', '/assets/audio/correctsound.mp3');
    this.load.audio('wrongSound', '/assets/audio/wrongsound.mp3');
    this.load.audio('walkSound', '/assets/audio/walkingsound.mp3');
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?._id;
    saveGameProgress(userId, 'Chapter2game');

    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    this.sound.mute = !this.soundEnabled;

    this.bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
    this.correctSound = this.sound.add('correctSound');
    this.wrongSound = this.sound.add('wrongSound');
    this.walkSound = this.sound.add('walkSound', { loop: true, volume: 0.3 });

    this.input.once('pointerdown', () => {
      if (this.soundEnabled && !this.bgm.isPlaying) {
        this.bgm.play();
      }
    });

    this.events.on('shutdown', () => this.stopAllSounds());
    this.events.on('destroy', () => this.stopAllSounds());

    this.add.image(512, 384, 'map').setDepth(0);

    addStoryModeUI(this, {
       onBook: (scene, box) =>
        scene.add.text(box.x, box.y, 'Custom Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
    });

    this.questions = Phaser.Utils.Array.Shuffle([
      { room: 'Right Atrium', text: 'The Right Atrium receives blood from the vena cava.' },
      { room: 'Right Ventricle', text: 'The Right Ventricle pumps blood to the lungs.' },
      { room: 'Left Atrium', text: 'The Left Atrium receives oxygenated blood from the lungs.' },
      { room: 'Left Ventricle', text: 'The Left Ventricle pumps oxygenated blood to the body.' }
    ]);

    this.player = this.physics.add.sprite(100, 700, 'player').setDisplaySize(64, 64).setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.createZones();   // uses Phaser.Geom.Rectangle again
    this.createEnemies(); // creates enemies sprites and adds to this.enemies[]

    this.scoreText = this.add.text(80, 130, 'Score: 0', { fontSize: '24px', color: '#fff' });
    this.progressText = this.add.text(80, 100, 'Progress: 0/4', { fontSize: '24px', color: '#fff' });

    for (let i = 0; i < this.hearts; i++) {
      const star = this.add.image(100 + i * 40, 70, 'star').setScrollFactor(0).setDisplaySize(32, 32).setDepth(10);
      this.heartIcons.push(star);
    }

    this.showHowToPlayPopup(() => this.askQuestion());
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
    this.canCheckZone = true;
    const currentQ = this.questions[this.questionIndex];

    // Clear previous question text if any:
    if (this.questionText) {
      this.questionText.destroy();
    }
    this.questionText = this.add.text(512, 40, currentQ.text, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setDepth(10);
  }

  checkZoneEntry() {
    if (this.questionIndex >= this.questions.length) return;
    const { x, y } = this.player;
    const current = this.questions[this.questionIndex];

    if (this.answeredRooms.has(current.room)) return;

    const zone = this.zones[current.room];
    if (zone && zone.contains(x, y)) {
      this.answeredRooms.add(current.room);
      this.canCheckZone = false;
      this.handleAnswer(true);
    } else {
      // If player is inside any other zone (not the correct one)
      for (const [name, z] of Object.entries(this.zones)) {
        if (z.contains(x, y) && name !== current.room) {
          this.canCheckZone = false;
          this.handleAnswer(false);
          break;
        }
      }
    }
  }

  handleAnswer(correct) {
    if (correct) {
      if (this.soundEnabled) this.correctSound.play();

      this.showImagePopup('correct', () => {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        this.questionIndex++;
        this.progressText.setText(`Progress: ${this.questionIndex}/4`);

        if (this.questionIndex >= this.questions.length) {
          this.endGame(true);
        } else {
          this.player.setPosition(100, 700);
          this.askQuestion();
        }
      });
    } else {
      if (this.soundEnabled) this.wrongSound.play();

      this.showImagePopup('tryAgain', () => {
      this.hearts--;

      const lostHeartIcon = this.heartIcons[this.hearts];
      if (lostHeartIcon) {
        this.tweens.add({
          targets: lostHeartIcon,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            lostHeartIcon.setVisible(false);
          }
        });
        this.cameras.main.shake(200, 0.01);
      }

      if (this.hearts <= 0) {
        this.endGame(false);
      } else {
        this.player.setPosition(100, 700);
        this.askQuestion();
      }
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
        this.canCheckZone = false;
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
    if (!this.player || !this.cursors) return;

    this.handleMovement();

    // Walking sound logic
    const moving = this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0;

    if (moving && !this.isWalking) {
      if (this.soundEnabled) this.walkSound.play();
      this.isWalking = true;
    } else if (!moving && this.isWalking) {
      this.walkSound.stop();
      this.isWalking = false;
    }

    if (this.canCheckZone) {
      this.checkZoneEntry();
    }

    this.moveEnemies();
    this.checkEnemyCollisions();
  }
  endGame(success) {
    this.physics.pause();

    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8).setDepth(1000);
    const message = success ? 'Well done!' : 'Game Over!';
    const retryText = '⟳ Try Again';
    const nextText = '▶ Proceed to Chapter 3';

    this.add.text(512, 280, message, {
      fontSize: '38px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(1001);

    const retryBtn = this.add.text(512, 380, retryText, {
      fontSize: '30px',
      backgroundColor: '#ffffff',
      color: '#000',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

    const nextBtn = this.add.text(512, 460, nextText, {
      fontSize: '28px',
      backgroundColor: '#eeeeee',
      color: '#000',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

    retryBtn.on('pointerdown', () => {
      window.location.reload(); 
    });

    nextBtn.on('pointerdown', () => {
      this.scene.start('Chapter3');
    });
  }


  showHowToPlayPopup(onClose) {
    const overlay = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.66)
      .setOrigin(0.5).setInteractive().setDepth(1000);

    const popup = this.add.image(512, 360, 'quest2').setOrigin(0.5).setDepth(1001).setScale(0.5);

    overlay.once('pointerdown', () => {
      overlay.destroy();
      popup.destroy();
      if (onClose) onClose();
    });
  }

  showImagePopup(key, onDone) {
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.6).setDepth(998);
    const popup = this.add.image(512, 384, key).setOrigin(0.5).setDepth(999).setScale(0.8).setAlpha(0);

    this.tweens.add({
      targets: popup,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 700,
      onComplete: () => {
        popup.destroy();
        overlay.destroy();
        if (onDone) onDone();
      }
    });
  }

  stopAllSounds() {
    if (this.bgm) { this.bgm.stop(); this.bgm.destroy(); }
    if (this.correctSound) { this.correctSound.stop(); this.correctSound.destroy(); }
    if (this.wrongSound) { this.wrongSound.stop(); this.wrongSound.destroy(); }
    if (this.walkSound) { this.walkSound.stop(); this.walkSound.destroy(); }
  }
}
