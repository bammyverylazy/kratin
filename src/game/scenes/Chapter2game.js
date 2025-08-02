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
      onSettings: (scene, box) =>
        scene.add.text(box.x, box.y, 'Custom Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
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

    this.createZones();

    this.scoreText = this.add.text(80, 130, 'Score: 0', { fontSize: '24px', color: '#fff' });
    this.progressText = this.add.text(80, 100, 'Progress: 0/4', { fontSize: '24px', color: '#fff' });

    for (let i = 0; i < this.hearts; i++) {
      const star = this.add.image(100 + i * 40, 70, 'star').setScrollFactor(0).setDisplaySize(32, 32).setDepth(10);
      this.heartIcons.push(star);
    }

    this.showHowToPlayPopup(() => this.askQuestion());
  }

  update() {
    if (!this.cursors) return;
    let moving = false;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      moving = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      moving = true;
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
      moving = true;
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
      moving = true;
    } else {
      this.player.setVelocityY(0);
    }

    if (moving && !this.isWalking) {
      if (this.soundEnabled) this.walkSound.play();
      this.isWalking = true;
    } else if (!moving && this.isWalking) {
      this.walkSound.stop();
      this.isWalking = false;
    }
  }

  createZones() {
    const zoneData = {
      'Right Atrium': { x: 200, y: 150 },
      'Right Ventricle': { x: 400, y: 250 },
      'Left Atrium': { x: 600, y: 150 },
      'Left Ventricle': { x: 800, y: 250 }
    };

    for (const room in zoneData) {
      const pos = zoneData[room];
      const zone = this.add.zone(pos.x, pos.y, 120, 120).setOrigin(0.5).setName(room);
      this.physics.world.enable(zone);
      zone.body.setAllowGravity(false);
      zone.body.setImmovable(true);
      this.zones[room] = zone;

      this.physics.add.overlap(this.player, zone, () => {
        if (this.canCheckZone && !this.answeredRooms.has(room)) {
          this.answeredRooms.add(room);
          const correct = this.questions[this.questionIndex]?.room === room;
          this.canCheckZone = false;
          this.handleAnswer(correct);
        }
      }, null, this);
    }
  }

  askQuestion() {
    this.canCheckZone = true;
    const currentQ = this.questions[this.questionIndex];
    this.add.text(512, 40, currentQ.text, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setDepth(10);
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
        if (this.heartIcons[this.hearts]) {
          this.tweens.add({
            targets: this.heartIcons[this.hearts],
            alpha: 0,
            duration: 300,
            onComplete: () => this.heartIcons[this.hearts].setVisible(false)
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

  endGame(success) {
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8).setDepth(1000);
    const message = success ? 'Well done!' : 'Game Over!';
    const nextText = success ? '▶ Continue to Chapter 3' : '⟳ Try Again';

    this.add.text(512, 300, message, {
      fontSize: '38px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(1001);

    const btn = this.add.text(512, 420, nextText, {
      fontSize: '30px',
      backgroundColor: '#ffffff',
      color: '#000',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      this.scene.start(success ? 'Chapter3' : 'Chapter2game');
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
