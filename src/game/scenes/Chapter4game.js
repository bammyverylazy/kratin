import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter4game extends Phaser.Scene {
  constructor() {
    super('Chapter4game');

    // game state
    this.score = 0;
    this.ecoScore = 0; // 0..100 eco meter
    this.badCatches = 0;
    this.maxBadCatches = 3;

    // visuals / groups
    this.player = null;
    this.earthy = null;
    this.items = null;
    this.spawnEvent = null;

    // UI
    this.scoreText = null;
    this.ecoMeterBg = null;
    this.ecoMeterFill = null;
    this.heartIcons = [];
  }

  preload() {
    // keep previous assets already used elsewhere
    this.load.image('star', '/assets/star.png');
    this.load.image('publictransportation', '/assets/publictransportation.png');
    this.load.image('car', '/assets/car.png');
    this.load.image('walking', '/assets/walking.png');
    this.load.image('bicycle', '/assets/bicycle.png');
    this.load.image('airplane', '/assets/airplane.png');
    this.load.image('electriccar', '/assets/electriccar.png');

    this.load.image('player', '/assets/noobynooby.png');
    this.load.image('earthcry', '/assets/earthcry.png');
    this.load.image('earthshy', '/assets/earthshy.png');

    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('correct', '/assets/correct.png');
    this.load.image('End', '/assets/End.png');
    this.load.image('notebook', '/assets/notebook.png');
    // sounds (optional)
    this.load.audio('catchGood', '/assets/audio/correctsound.mp3');
    this.load.audio('catchBad', '/assets/audio/wrongsound.mp3');
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = user?._id;
    //saveGameProgress(this.userId, 'Chapter4game');

    this.cameras.main.setBackgroundColor('#a7d8e8');

    addStoryModeUI(this);

    // Earthy sprite at bottom center
    this.earthy = this.add.image(this.cameras.main.centerX, this.cameras.main.height - 120, 'earthshy')
      .setOrigin(0.5, 0.5)
      .setDepth(5)
      .setScale(0.7);

    // Player (basket / Kratin) - controllable left/right
    this.player = this.physics.add.image(this.cameras.main.centerX, this.cameras.main.height - 60, 'player')
      .setCollideWorldBounds(true)
      .setImmovable(true)
      .setDepth(10)
      .setScale(0.6);

    // Item group (falling transport/activity icons)
    this.items = this.physics.add.group();

    // UI: score and eco meter
    this.scoreText = this.add.text(80, 80, 'Score: 0', { fontSize: '22px', color: '#fff' }).setDepth(20);

    // eco meter background and fill
    const meterX = this.cameras.main.width - 260;
    const meterY = 60;
    const meterW = 200;
    const meterH = 24;
    this.ecoMeterBg = this.add.rectangle(meterX, meterY, meterW, meterH, 0x444444).setOrigin(0, 0.5).setDepth(20);
    this.ecoMeterFill = this.add.rectangle(meterX + 2, meterY, 0, meterH - 4, 0x33cc66).setOrigin(0, 0.5).setDepth(21);

    this.add.text(meterX, meterY - 18, 'Eco Meter', { fontSize: '14px', color: '#fff' }).setDepth(20);

    // hearts for bad catches
    for (let i = 0; i < this.maxBadCatches; i++) {
      const h = this.add.image(80 + i * 36, 120, 'star').setDisplaySize(28, 28).setDepth(20);
      this.heartIcons.push(h);
    }

    // input: keyboard and touch
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointermove', (pointer) => {
      // allow dragging player with pointer for mobile
      this.player.x = Phaser.Math.Clamp(pointer.x, this.player.displayWidth / 2, this.cameras.main.width - this.player.displayWidth / 2);
    });

    // physics overlap: catching
    this.physics.add.overlap(this.player, this.items, (player, item) => this.evaluateItem(player, item), null, this);

    // spawn items regularly
    this.spawnEvent = this.time.addEvent({
      delay: 900,
      loop: true,
      callback: this.spawnItem,
      callbackScope: this
    });

    // sounds
    this.catchGood = this.sound.add('catchGood', { volume: 0.6 });
    this.catchBad = this.sound.add('catchBad', { volume: 0.6 });

    // small white overlay used to brighten/darken world
    this.flashRect = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xffffff, 0)
      .setOrigin(0, 0).setDepth(999);

    // win/lose flags
    this.ended = false;
  }

  spawnItem() {
    if (this.ended) return;

    // item types with carbon classification
    const pool = [
      { key: 'walking', carbon: 'low' },
      { key: 'bicycle', carbon: 'low' },
      { key: 'publictransportation', carbon: 'low' },
      { key: 'electriccar', carbon: 'low' },
      { key: 'car', carbon: 'high' },
      { key: 'airplane', carbon: 'high' }
    ];

    const itemData = Phaser.Utils.Array.GetRandom(pool);
    const x = Phaser.Math.Between(60, this.cameras.main.width - 60);
    const sprite = this.items.create(x, -50, itemData.key).setDepth(5).setScale(0.6);

    // physics properties
    sprite.setVelocityY(Phaser.Math.Between(80, 140));
    sprite.setData('carbon', itemData.carbon);
    sprite.setInteractive();
    sprite.body.setAllowGravity(false); // use velocity to fall; gravity disabled for stable speed

    // auto-destroy when out of bounds
    sprite.checkWorldBounds = true;
    sprite.outOfBoundsKill = true;
  }

  evaluateItem(player, item) {
    if (this.ended) return;
    if (!item.active) return;

    const carbon = item.getData('carbon');

    // remove item immediately to avoid double-catch
    item.disableBody(true, true);
    item.destroy();

    if (carbon === 'low') {
      // good catch
      this.score += 10;
      this.ecoScore = Phaser.Math.Clamp(this.ecoScore + 10, 0, 100);

      // brighten world briefly and show happy Earthy
      this.cameras.main.flash(200, 200, 240, 200);
      this.earthy.setTexture('earthshy');
    } else {
      // bad catch
      this.score = Math.max(0, this.score - 5);
      this.badCatches++;
      // darken world briefly and show sad Earthy
      this.tweens.add({
        targets: this.flashRect,
        alpha: 0.18,
        duration: 120,
        yoyo: true,
        onStart: () => { this.earthy.setTexture('earthcry'); }
      });

      // update heart icons (fade out)
      const idx = Math.max(0, this.maxBadCatches - this.badCatches);
      if (this.heartIcons[idx]) {
        this.tweens.add({ targets: this.heartIcons[idx], alpha: 0.2, duration: 300 });
      }
    }

    // update UI
    this.scoreText.setText('Score: ' + this.score);
    this.updateEcoMeter();

    // check win/lose
    if (this.ecoScore >= 100) {
      this.endGame(true);
    } else if (this.badCatches >= this.maxBadCatches) {
      this.endGame(false);
    } else {
      // small delay to restore earthy happy face if not lost
      this.time.delayedCall(800, () => {
        if (!this.ended) this.earthy.setTexture('earthshy');
      });
    }
  }

  updateEcoMeter() {
    const meterW = this.ecoMeterBg.width - 4;
    const pct = Phaser.Math.Clamp(this.ecoScore / 100, 0, 1);
    this.ecoMeterFill.width = Math.round(meterW * pct);
    // reposition fill to align left inside bg
    this.ecoMeterFill.x = this.ecoMeterBg.x + 2;
  }

  update(time, delta) {
    if (this.ended) return;

    // player movement - keyboard
    const speed = 400;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // remove items that passed bottom
    this.items.children.each((it) => {
      if (it.y > this.cameras.main.height + 64) {
        // if it's low-carbon and missed, penalize slightly (optional)
        if (it.active && it.getData && it.getData('carbon') === 'low') {
          this.ecoScore = Phaser.Math.Clamp(this.ecoScore - 5, 0, 100);
          this.updateEcoMeter();
        }
        try { it.destroy(); } catch (e) {}
      }
    }, this);
  }

  endGame(didWin = false) {
    this.ended = true;

    // stop spawning
    if (this.spawnEvent) this.spawnEvent.remove(false);

    // stop all items
    this.items.clear(true, true);

    // clear input velocities
    this.player.setVelocity(0, 0);

    // overlay
    const overlay = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.6).setDepth(1000);

    const title = didWin ? 'You made Earthy happy! ' : 'Try again and make greener choices!';
    this.add.text(this.cameras.main.centerX, 200, title, { fontSize: '36px', color: '#ffffff' }).setOrigin(0.5).setDepth(1001);

    // show Earthy image according to result
    const resImg = didWin ? 'earthshy' : 'earthcry';
    this.add.image(this.cameras.main.centerX, 360, resImg).setOrigin(0.5).setScale(0.9).setDepth(1001);

    const retry = this.add.text(this.cameras.main.centerX, 520, 'Try Again', {
      fontSize: '26px', backgroundColor: '#ffffff', color: '#000', padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

    const next = this.add.text(this.cameras.main.centerX, 580, 'Proceed', {
      fontSize: '24px', backgroundColor: '#eeeeee', color: '#000', padding: { left: 18, right: 18, top: 8, bottom: 8 }
    }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

    retry.on('pointerdown', () => {
      this.scene.restart();
    });

    next.on('pointerdown', () => {
      // save progress optionally
      // saveGameProgress(this.userId, 'Chapter4game_result', { score: this.score, ecoScore: this.ecoScore, success: didWin });
      this.scene.start('Mode');
    });
  }

  stopAllSounds() {
    if (this.catchGood) { try { this.catchGood.stop(); this.catchGood.destroy(); } catch(e) {} }
    if (this.catchBad) { try { this.catchBad.stop(); this.catchBad.destroy(); } catch(e) {} }
  }
}
