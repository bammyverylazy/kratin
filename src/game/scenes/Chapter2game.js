import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter2game extends Phaser.Scene {
  constructor() {
    super('Chapter2game');
    this.player = null;
    this.cursors = null;
    this.score = 0;
    // Timer (seconds)
    this.timer = 180; // 3 minutes
    this.timerText = null;
    this.foundCount = 0;
    this.totalLeakages = 4; // will match number of questions
    this.heartIcons = [];
    this.questionIndex = 0;
    this.questions = [];
    this.answeredRooms = new Set();
    this.zones = {};
    // interaction ready when inside correct zone and player presses key / taps
    this.canInteract = false;
    this.soundEnabled = true;
    this.isWalking = false;
    // touch controls helpers
    this.touchPointer = null;
  }

  preload() {
    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('map', '/assets/map.png');
    this.load.image('bathroom', '/assets/bathroom.png');
    this.load.image('bedroom', '/assets/bedroom.png');
    this.load.image('livingroom', '/assets/livingroom.png');
    this.load.image('kitchen', '/assets/kitchen.png');
    this.load.image('player', '/assets/noobynooby.png');
    this.load.image('star', '/assets/star.png');
    this.load.image('correct', '/assets/correct.png');
    this.load.image('tryAgain', '/assets/tryAgain.png');
    this.load.image('quest2', '/assets/quest2.png');
    this.load.image('notebook', '/assets/notebook.png');

    this.load.audio('bgm', '/assets/audio/gamemusic.mp3');
    this.load.audio('correctSound', '/assets/audio/correctsound.mp3');
    this.load.audio('wrongSound', '/assets/audio/wrongsound.mp3');
    this.load.audio('walkSound', '/assets/audio/walkingsound.mp3');
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?._id;
    //saveGameProgress(userId, 'Chapter2game');

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

    // Background / floor plan
    this.mapImage = this.add.image(512, 384, 'map').setDepth(0);
    // Make responsive: scale to fit if canvas differs
    this.mapImage.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    addStoryModeUI(this, {});

    // Leakage questions — one per room, shuffled order
    const baseQuestions = [
      { room: 'Living Room', text: 'The TV is left ON overnight.' , target: 'living'},
      { room: 'Bedroom', text: 'The window is open while the heater is ON.' , target: 'bedroom'},
      { room: 'Kitchen', text: 'The fridge door is left open.' , target: 'kitchen'},
      { room: 'Bathroom', text: 'The tap keeps running after brushing teeth.' , target: 'bathroom'}
    ];
    this.questions = Phaser.Utils.Array.Shuffle(baseQuestions);
    this.totalLeakages = this.questions.length;

    // Player sprite (enlarged)
    this.player = this.physics.add.sprite(100, 700, 'player')
      .setDisplaySize(96, 96) // larger than previous
      .setCollideWorldBounds(true);

    // Controls: arrow keys + WASD
    this.cursors = this.input.keyboard.createCursorKeys();
    this.WASD = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Interaction key (Space / Enter / E)
    this.interactKeys = this.input.keyboard.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      e: Phaser.Input.Keyboard.KeyCodes.E
    });

    // Create logical room zones (match UI positions)
    this.createZones();

    // UI: Score, progress, timer and tracker
    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '20px', color: '#fff' }).setDepth(50);
    this.timerText = this.add.text(this.sys.game.config.width / 2, 16, 'Time: 03:00', { fontSize: '26px', color: '#fff' }).setOrigin(0.5).setDepth(50);
    this.trackerText = this.add.text((this.sys.game.config.width / 2) + 140, 20, `Found: 0/${this.totalLeakages}`, { fontSize: '20px', color: '#fff' }).setOrigin(0.5).setDepth(50);

    // heart icons kept for compatibility but not used as lives in this mode
    for (let i = 0; i < 3; i++) {
      const star = this.add.image(80 + i * 40, 60, 'star').setScrollFactor(0).setDisplaySize(32, 32).setDepth(10);
      this.heartIcons.push(star);
    }

    // Question UI
    this.questionText = this.add.text(this.sys.game.config.width / 2, 64, '', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setDepth(50);

    // show initial instructions popup then start
    this.showHowToPlayPopup(() => {
      this.startTimer();
      this.askQuestion();
    });

    // Interaction: keyboard and touch
    this.input.keyboard.on('keydown', (event) => {
      if (['SPACE', 'ENTER', 'E'].includes(event.code) || event.key === ' ' ) {
        this.tryInteract();
      }
    });

    // Touch: move to pointer on touch and also tap to interact if inside zone
    this.input.on('pointerdown', (pointer) => {
      this.touchPointer = pointer;
      // if tap (short press) and already near a zone, attempt interact
      // We'll move player toward pointer; interaction will be attempted when player is inside zone and pointer is a tap.
      this.input.once('pointerup', (up) => {
        const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, up.x, up.y);
        if (dist < 10) {
          // consider a tap -> attempt interaction if in zone
          this.tryInteract();
        }
      });
    });

    // Visual helper: draw zone outlines for player feedback
    this.zoneGraphics = this.add.graphics().setDepth(40);
    this.drawZoneOutlines();
  }

  createZones() {
    // Zones positioned relative to 1024x768 layout; adjust if canvas size changes
    const w = this.sys.game.config.width;
    const h = this.sys.game.config.height;

    // Determine relative positions to keep responsive
    // Top-left = Bedroom, Top-right = Living Room, Bottom-right = Kitchen, Bottom-left = Bathroom
    const paddingX = 120;
    const paddingY = 120;
    const zoneW = 300;
    const zoneH = 220;

    // compute centers
    const bedroomRect = new Phaser.Geom.Rectangle(paddingX, paddingY, zoneW, zoneH);
    const livingRect = new Phaser.Geom.Rectangle(w - paddingX - zoneW, paddingY, zoneW, zoneH);
    const kitchenRect = new Phaser.Geom.Rectangle(w - paddingX - zoneW, h - paddingY - zoneH, zoneW, zoneH);
    const bathroomRect = new Phaser.Geom.Rectangle(paddingX, h - paddingY - zoneH, zoneW, zoneH);

    this.zones = {
      'Bedroom': bedroomRect,
      'Living Room': livingRect,
      'Kitchen': kitchenRect,
      'Bathroom': bathroomRect
    };
  }

  askQuestion() {
    // Show next unresolved question
    if (this.questionIndex >= this.questions.length) {
      // all found
      this.endGame(true);
      return;
    }
    const currentQ = this.questions[this.questionIndex];

    // update display
    this.questionText.setText(currentQ.text);
    this.canInteract = true;
    // update tracker if some found already
    this.trackerText.setText(`Found: ${this.foundCount}/${this.totalLeakages}`);
  }

  // Called when player presses interact key or taps
  tryInteract() {
    if (!this.player) return;
    if (this.questionIndex >= this.questions.length) return;

    const px = this.player.x;
    const py = this.player.y;
    const currentQ = this.questions[this.questionIndex];

    // Check if player is inside the correct zone
    const targetZone = this.zones[currentQ.room];
    if (targetZone && targetZone.contains(px, py)) {
      // success: show correct popup, increment found, advance
      if (this.soundEnabled) this.correctSound.play();
      this.showImagePopup('correct', () => {
        this.score += 10;
        this.foundCount++;
        this.trackerText.setText(`Found: ${this.foundCount}/${this.totalLeakages}`);
        this.questionIndex++;
        if (this.questionIndex >= this.questions.length) {
          this.endGame(true);
        } else {
          this.askQuestion();
        }
      });
    } else {
      // wrong location: show tryAgain feedback, encourage correct room
      if (this.soundEnabled) this.wrongSound.play();
      this.showImagePopup('tryAgain', () => {
        // no life penalty in escape-room mode; just keep question and let player try again
      });
    }
  }

  // Draw outlines and highlight current zone if player inside
  drawZoneOutlines() {
    this.zoneGraphics.clear();
    const colors = {
      'Bedroom': 0x3366ff,
      'Living Room': 0x33cc66,
      'Kitchen': 0xffcc33,
      'Bathroom': 0xff6666
    };

    for (const [name, rect] of Object.entries(this.zones)) {
      this.zoneGraphics.lineStyle(3, colors[name] || 0xffffff, 0.6);
      this.zoneGraphics.strokeRectShape(rect);
      // label
      this.zoneGraphics.fillStyle(0x000000, 0.0);
    }
  }

  handleMovement() {
    const speed = 200;
    const body = this.player.body;
    body.setVelocity(0);

    // Arrow keys
    if (this.cursors.left.isDown || this.WASD.left.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.WASD.right.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.WASD.up.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.WASD.down.isDown) {
      body.setVelocityY(speed);
    }

    // Touch pointer: move toward touch position for mobile
    if (this.touchPointer && this.touchPointer.isDown) {
      const pointer = this.touchPointer;
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.x, pointer.y);
      this.physics.velocityFromRotation(angle, 180, body.velocity);
    }
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

    // Highlight zone if player is inside any
    let insideAny = false;
    for (const [name, rect] of Object.entries(this.zones)) {
      if (rect.contains(this.player.x, this.player.y)) {
        insideAny = true;
        // draw highlight
        this.zoneGraphics.clear();
        this.drawZoneOutlines();
        this.zoneGraphics.fillStyle(0xffff00, 0.08);
        this.zoneGraphics.fillRectShape(rect);
        // show a small helper text near bottom if this is the target room
        const cur = this.questions[this.questionIndex];
        if (cur && cur.room === name) {
          // show prompt to press SPACE to interact
          if (!this.helperText) {
            this.helperText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height - 40, 'Press SPACE / E / TAP to inspect', { fontSize: '20px', color: '#fff', backgroundColor: '#000000' }).setOrigin(0.5).setDepth(60);
          }
        } else {
          if (this.helperText) { this.helperText.destroy(); this.helperText = null; }
        }
        break;
      }
    }
    if (!insideAny) {
      this.zoneGraphics.clear();
      this.drawZoneOutlines();
      if (this.helperText) { this.helperText.destroy(); this.helperText = null; }
    }
  }

  startTimer() {
    // Update displayed timer every second
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timer--;
        const mins = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const secs = (this.timer % 60).toString().padStart(2, '0');
        this.timerText.setText(`Time: ${mins}:${secs}`);
        if (this.timer <= 0) {
          this.timerEvent.remove(false);
          this.endGame(false);
        }
      }
    });
  }

  endGame(success) {
    // stop timers and sounds
    if (this.timerEvent) this.timerEvent.remove(false);
    this.physics.pause();
    if (this.bgm) { this.bgm.stop(); }

    const overlay = this.add.rectangle(this.sys.game.config.width/2, this.sys.game.config.height/2, this.sys.game.config.width, this.sys.game.config.height, 0x000000, 0.8).setDepth(1000);
    const message = success ? 'All leakages fixed! Good job!' : 'Time Up! Try Again!';
    this.add.text(this.sys.game.config.width/2, 220, message, { fontSize: '36px', color: '#ffffff' }).setOrigin(0.5).setDepth(1001);

    const retryBtn = this.add.text(this.sys.game.config.width/2, 360, '⟳ Try Again', {
      fontSize: '28px',
      backgroundColor: '#ffffff',
      color: '#000',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

    const nextBtn = this.add.text(this.sys.game.config.width/2, 440, '▶ Proceed', {
      fontSize: '26px',
      backgroundColor: '#eeeeee',
      color: '#000',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

    retryBtn.on('pointerdown', () => {
      // restart scene to reset state
      this.scene.restart();
    });

    nextBtn.on('pointerdown', () => {
      // proceed to next chapter if success, otherwise restart behavior
      if (success) {
        this.scene.start('Chapter3');
      } else {
        this.scene.restart();
      }
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
