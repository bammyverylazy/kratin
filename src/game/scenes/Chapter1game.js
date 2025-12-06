import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter1game extends Phaser.Scene {
  constructor() {
    super('Chapter1game');
    this.dropZones = {};
    this.properties = [];
    this.currentIndex = 0;
    this.correctCount = 0;
    this.totalCount = 0;
    this.progressText = null;
    this.soundEnabled = true;
  }

  preload() {
    this.load.image('earthcry', '/assets/earthcry.png');
    this.load.image('earthshy', '/assets/earthshy.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('correct', '/assets/correct.png');
    this.load.image('tryAgain', '/assets/tryAgain.png');
    this.load.image('quest1', '/assets/quest1.png');
    this.load.image('notebook', '/assets/notebook.png');

    this.load.audio('bgm', '/assets/audio/backgroundmusic.mp3');
    this.load.audio('correctSound', '/assets/audio/correctsound.mp3');
    this.load.audio('wrongSound', '/assets/audio/wrongsound.mp3');
  }

  create() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?._id;
    const currentChapter = 'Chapter1game';

    console.log('userId:', userId, 'currentChapter:', currentChapter);
    //saveGameProgress(userId, currentChapter);

    const storedSound = localStorage.getItem('soundEnabled');
    this.soundEnabled = storedSound === null ? true : (storedSound === 'true');
    this.sound.mute = !this.soundEnabled;

    this.bgm = this.sound.add('bgm', { loop: true, volume: 0.4 });
    this.correctSound = this.sound.add('correctSound', { volume: 1 });
    this.wrongSound = this.sound.add('wrongSound', { volume: 1 });

    this.input.once('pointerdown', () => {
      if (this.soundEnabled && !this.bgm.isPlaying) {
        this.bgm.play();
        console.log('Background music started after user interaction');
      }
    });

    this.events.on('shutdown', () => this.stopAllSounds());
    this.events.on('destroy', () => this.stopAllSounds());

    addStoryModeUI(this, {
    });

    const zoneData = [
      { key: 'earthcry', label: 'bad action', type: 'earthcry' },
      { key: 'earthshy', label: 'good action', type: 'earthshy' },
    ];

    const screenWidth = this.sys.game.config.width;
    const spacing = screenWidth / (zoneData.length + 1);

    zoneData.forEach((data, i) => {
      const x = spacing * (i + 1);
      const y = 380;
      const img = this.add.image(x, y, data.key).setScale(0.15).setOrigin(0.5);
      const zone = this.add.zone(x, y, img.displayWidth, img.displayHeight)
        .setRectangleDropZone(img.displayWidth, img.displayHeight);
      this.add.text(x, y + img.displayHeight / 2 + 30, data.label, {
        fontSize: '22px', color: '#000'
      }).setOrigin(0.5);
      zone.zoneType = data.type;
      this.dropZones[data.type] = zone;
    });

    this.properties = Phaser.Utils.Array.Shuffle([
    { text: "Throwing trash into the river", type: "earthcry" },
    { text: "Planting a new tree in the park", type: "earthshy" },
    { text: "Leaving the lights on all night", type: "earthcry" },
    { text: "Using a reusable water bottle", type: "earthshy" },
    { text: "Using plastic bags for shopping", type: "earthcry" },
    { text: "Riding a bicycle instead of a car", type: "earthshy" },
  ]);


    this.totalCount = this.properties.length;
    this.correctCount = 0;

    this.progressText = this.add.text(screenWidth / 2, 120, `0/${this.totalCount}`, {
      fontSize: '26px',
      color: '#333',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.showHowToPlayPopup(() => {
      this.showNextProperty();
    });

    this.input.on('drop', (pointer, box, dropZone) => {
      if (!dropZone || typeof dropZone !== 'object' || !box || typeof box !== 'object') {
        console.warn('Invalid drop detected:', { dropZone, box });
        return;
      }

      if (dropZone.zoneType === box.propType) {
        this.correctCount++;
        this.progressText.setText(`${this.correctCount}/${this.totalCount}`);
        if (this.soundEnabled) this.correctSound.play();

        this.showImagePopup('correct', () => {
          box.setVisible(false);
          box.textObj.setVisible(false);
          this.time.delayedCall(50, () => {
            box.textObj.destroy();
            box.destroy();
            this.showNextProperty();
          });
        });

      } else {
        if (this.soundEnabled) this.wrongSound.play();

        this.showImagePopup('tryAgain', () => {
          this.tweens.add({
            targets: [box, box.textObj],
            x: box.originalX,
            y: box.originalY,
            duration: 300,
            ease: 'Sine.easeInOut'
          });
        });
      }
    });

    this.add.text(screenWidth / 2, 170, 'Match the behavior on the right category', {
      fontSize: '30px',
      color: '#222',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  stopAllSounds() {
    if (this.bgm) {
      if (this.bgm.isPlaying) this.bgm.stop();
      this.bgm.destroy();
      this.bgm = null;
    }
    if (this.correctSound) {
      if (this.correctSound.isPlaying) this.correctSound.stop();
      this.correctSound.destroy();
      this.correctSound = null;
    }
    if (this.wrongSound) {
      if (this.wrongSound.isPlaying) this.wrongSound.stop();
      this.wrongSound.destroy();
      this.wrongSound = null;
    }
  }

  showNextProperty() {
    if (this.currentIndex >= this.properties.length) {
      const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.85)
        .setOrigin(0.5)
        .setDepth(1000)
        .setInteractive();

      this.add.text(512, 300, 'All Done!ヽ(*。>Д<)o゜', {
        fontSize: '38px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5).setDepth(1001);

      const continueBtn = this.add.text(512, 420, '▶ Continue to Chapter 2', {
        fontSize: '30px',
        backgroundColor: '#ffffff',
        color: '#000',
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
        borderRadius: 10
      }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

      continueBtn.on('pointerdown', () => {
        // Mark Chapter 2 as unlocked locally and attempt to save progress to backend
        try {
          const user = JSON.parse(localStorage.getItem('currentUser'));
          const userId = user?._id;
          // store local unlock
          const prev = localStorage.getItem('localLastScene') || 'Chapter1';
          const prevIdx = parseInt(prev.replace('Chapter', '')) || 1;
          if (prevIdx < 2) localStorage.setItem('localLastScene', 'Chapter2');
          if (userId) {
            // best-effort save to backend
            import('../utils/saveProgress.js').then(mod => mod.saveGameProgress(userId, 'Chapter2'));
          }
        } catch (e) { console.warn('Could not persist unlock locally', e); }
        this.scene.start('Chapter2');
      });

      return;
    }

    const prop = this.properties[this.currentIndex++];
    const x = this.sys.game.config.width / 2;
    const y = 660;
    const boxWidth = 360;

    const tempText = this.add.text(0, 0, prop.text, {
      fontSize: '18px',
      color: '#000',
      wordWrap: { width: boxWidth - 20 }
    }).setVisible(false);

    const textHeight = tempText.height;
    tempText.destroy();

    const boxHeight = textHeight + 32;

    const box = this.add.rectangle(x, y, boxWidth, boxHeight, 0xffffff)
      .setStrokeStyle(2, 0x888888)
      .setDepth(3)
      .setInteractive({ draggable: true });

    const text = this.add.text(x, y, prop.text, {
      fontSize: '18px',
      color: '#000',
      wordWrap: { width: boxWidth - 20 },
      align: 'center'
    }).setOrigin(0.5).setDepth(4);

    box.propType = prop.type;
    box.textObj = text;
    box.originalX = x;
    box.originalY = y;

    this.input.setDraggable(box);

    box.on('drag', (pointer, dragX, dragY) => {
      box.x = dragX;
      box.y = dragY;
      text.x = dragX;
      text.y = dragY;
    });
  }

  showImagePopup(key, onDone) {
    const overlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.6
    ).setDepth(998);

    const popup = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      key
    ).setOrigin(0.5)
      .setDepth(999)
      .setScale(0.8)
      .setAlpha(0);

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

  showHowToPlayPopup(onClose) {
    const overlay = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.66)
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(1000);

    const popup = this.add.image(512, 360, 'quest1')
      .setOrigin(0.5)
      .setDepth(1001)
      .setScale(0.5);

    overlay.once('pointerdown', () => {
      overlay.destroy();
      popup.destroy();
      if (onClose) onClose();
    });
  }
}
