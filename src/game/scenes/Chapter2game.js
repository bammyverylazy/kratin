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

    // 🔊 Load audio files for background music and sound effects
    this.load.audio('bgm', '/assets/audio/gamemusic.mp3');          // renamed from backgroundmusic.mp3
    this.load.audio('correctSound', '/assets/audio/correctsound.mp3');
    this.load.audio('wrongSound', '/assets/audio/wrongsound.mp3');
    this.load.audio('walkSound', '/assets/audio/walking.mp3');      // walking sound effect
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?._id;
    const currentChapter = 'Chapter2game';

    console.log('userId:', userId, 'currentChapter:', currentChapter);
    saveGameProgress(userId, currentChapter);

    const storedSound = localStorage.getItem('soundEnabled');
    this.soundEnabled = storedSound === null ? true : (storedSound === 'true');

    // Setup sounds
    this.bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
    this.correctSound = this.sound.add('correctSound');
    this.wrongSound = this.sound.add('wrongSound');
    this.walkSound = this.sound.add('walkSound', { loop: true, volume: 0.3 });

    this.sound.mute = !this.soundEnabled;

    // Play bgm only after first user interaction
    this.input.once('pointerdown', () => {
      if (this.soundEnabled && !this.bgm.isPlaying) {
        this.bgm.play();
        console.log('Background music started after user interaction');
      }
    });

    // Stop & destroy all sounds on scene shutdown/destroy
    this.events.on('shutdown', () => this.stopAllSounds());
    this.events.on('destroy', () => this.stopAllSounds());

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

    // Handle walking sound based on movement
    if (moving && !this.isWalking) {
      if (this.soundEnabled) {
        this.walkSound.play();
      }
      this.isWalking = true;
    } else if (!moving && this.isWalking) {
      this.walkSound.stop();
      this.isWalking = false;
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
          return;
        }

        this.player.setPosition(100, 700);
        this.askQuestion();
      });

    } else {
      if (this.soundEnabled) this.wrongSound.play();

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

  stopAllSounds() {
    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.stop();
      this.bgm.destroy();
    }
    if (this.correctSound) {
      this.correctSound.stop();
      this.correctSound.destroy();
    }
    if (this.wrongSound) {
      this.wrongSound.stop();
      this.wrongSound.destroy();
    }
    if (this.walkSound && this.walkSound.isPlaying) {
      this.walkSound.stop();
      this.walkSound.destroy();
    }
    console.log('All sounds stopped and destroyed');
  }
}
