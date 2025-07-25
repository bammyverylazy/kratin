// scenes/Chapter3.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter3 extends Scene {
  constructor() {
    super("Chapter3");
    this.characterSprites = {};
    this.currentWiggleTween = null;
    this.propertyText = null;
    this.hasShaken = false;
  }

  preload() {
    this.load.image('Chapter3scene1', '/assets/Chapter3scene1.png');
    this.load.video('bloodflow', '/assets/bloodflow.mp4');

    this.load.image('rbc', '/assets/rbc.png');
    this.load.image('wbc', '/assets/wbc.png');
    this.load.image('platelet', '/assets/platelet.png');
    this.load.image('plasma', '/assets/plasma.png');

    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('5.png', '/assets/5.png');
    this.load.image('6.png', '/assets/6.png');
    this.load.image('7.png', '/assets/7.png');
    this.load.image('8.png', '/assets/8.png');
    this.load.image('9.png', '/assets/9.png');
    this.load.image('quest3', '/assets/quest3.png');
  }

  create() {

      const user = JSON.parse(localStorage.getItem('currentUser'));
      const userId = user?._id;
      const currentChapter = 'Chapter3';

      console.log('userId:', userId, 'currentChapter:', currentChapter);
      saveGameProgress(userId, currentChapter);

    this.cameras.main.setBackgroundColor('#000000');

    this.coverImage = this.add.image(0, 0, 'Chapter3scene1')
      .setOrigin(0, 0)
      .setDepth(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.startButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 300,
      'Start',
      {
        fontSize: '48px',
        color: '#ffffff',
        padding: { left: 32, right: 32, top: 16, bottom: 16 }
      }
    ).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

    addStoryModeUI(this, {
      onSettings: (scene, box) => scene.add.text(box.x, box.y, 'Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) => scene.add.text(box.x, box.y, 'Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
    });

    this.script = [
      { speaker: "Narrator", text: "Let’s meet the blood components.", sceneStep: 1 },
      {
        speaker: "Red Blood Cells (Erythrocytes)",
        text: "They carry oxygen from the lungs to all the cells.",
        character: "rbc",
        property: "Carry oxygen from the lungs to all body cells.\nContain hemoglobin, the protein that binds oxygen."
      },
      {
        speaker: "White Blood Cells (Leukocytes)",
        text: "They fight infection and remove invaders.",
        character: "wbc",
        property: "Protect the body by fighting infections.\nPlay a key role in the immune system."
      },
      {
        speaker: "Platelets (Thrombocytes)",
        text: "They help blood clot when you're injured.",
        character: "platelet",
        property: "Help blood clot, preventing excessive bleeding.\nGather at wounds to seal vessels."
      },
      {
        speaker: "Plasma",
        text: "The yellow fluid that carries nutrients and cells.",
        character: "plasma",
        property: "Transports nutrients, hormones, and blood cells.\nHelps maintain blood pressure and volume."
      },
      { speaker: "Narrator", text: "Now that you’ve met them all, let's begin your mission!" }
    ];

    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      this.coverImage.destroy();
      this.startStorySequence();
    });

    this.input.keyboard.on('keydown', (event) => {
      if ((event.code === 'Space' || event.code === 'Enter') && this.startButton && this.startButton.active) {
        this.startButton.emit('pointerdown');
      }
    });
  }

  startStorySequence() {
    const bgKey = 'bloodflow';
    if (this.cache.video.exists(bgKey)) {
      this.bgVideo = this.add.video(0, 0, bgKey).setOrigin(0, 0).setDepth(0);
      this.bgVideo.play(true).setLoop(true);
    }

    const keys = ['rbc', 'wbc', 'platelet', 'plasma'];
    const spacing = 200;
    const startX = (this.sys.game.config.width / 2) - spacing * (keys.length - 1) / 2;
    const y = 480;

    keys.forEach((key, i) => {
      const sprite = this.add.image(startX + i * spacing, y, key)
        .setScale(0.5)
        .setDepth(100);
      this.characterSprites[key] = sprite;
    });

    if (!this.dialogueUI) this.dialogueUI = new DialogueUI(this);

    this.nextButton = this.add.text(900, 680, '▶ Next', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.backButton = this.add.text(820, 680, '◀ Back', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.nextButton.on('pointerdown', () => this.dialogueUI.advance());
    this.backButton.on('pointerdown', () => {
      if (this.currentLine > 0) {
        this.currentLine -= 2;
        if (this.currentLine < 0) this.currentLine = 0;
        this.showCurrentLine();
      }
    });

    this.input.keyboard.on('keydown-ENTER', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-SPACE', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-RIGHT', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.currentLine > 0) {
        this.currentLine -= 2;
        if (this.currentLine < 0) this.currentLine = 0;
        this.showCurrentLine();
      }
    });

    this.currentLine = 0;
    this.showCurrentLine();
  }
showCurrentLine() {
  if (this.currentLine >= this.script.length) {
    this.triggerEarthquakePopup(); // ⬅ NEW
    return;
  }

  const line = this.script[this.currentLine];

  if (this.currentWiggleTween) {
    this.currentWiggleTween.stop();
    this.currentWiggleTween = null;
  }

  Object.values(this.characterSprites).forEach(sprite => {
    this.tweens.killTweensOf(sprite);
    sprite.setScale(0.5);
    sprite.setAngle(0);
  });

  if (line.character && this.characterSprites[line.character]) {
    const char = this.characterSprites[line.character];
    char.setScale(0.65);

    this.currentWiggleTween = this.tweens.add({
      targets: char,
      angle: { from: -6, to: 6 },
      duration: 150,
      yoyo: true,
      repeat: -1
    });
  }

  if (this.propertyText) this.propertyText.destroy();

  if (line.property) {
    // Add emoji based on character
    let emoji = '';
    switch (line.character) {
      case 'rbc': emoji = '🧬 '; break;
      case 'wbc': emoji = '🛡️ '; break;
      case 'platelet': emoji = '🩹 '; break;
      case 'plasma': emoji = '💧 '; break;
    }

    const decoratedProperty = line.property
      .split('\n')
      .map(line => `${emoji}${line}`)
      .join('\n');

    this.propertyText = this.add.text(540, 160, decoratedProperty, {
      fontSize: '26px',
      color: '#ffffff',
      wordWrap: { width: 480 },
      backgroundColor: 'rgba(0,0,0,0.4)',
      padding: { left: 16, right: 16, top: 10, bottom: 10 }
    }).setAlpha(0).setDepth(200);

    this.tweens.add({
      targets: this.propertyText,
      alpha: 1,
      duration: 400,
      ease: 'Power2'
    });
  }

  this.backButton.setVisible(this.currentLine > 0);

  this.dialogueUI.onLineComplete = () => {
    this.currentLine++;
    this.showCurrentLine();
  };

  this.dialogueUI.startDialogue([line]);
}


  triggerEarthquakePopup() {
  if (this.hasShaken) return;
  this.hasShaken = true;

  this.cameras.main.shake(900, 0.04);

  this.time.delayedCall(1400, () => {
    // Add a semi-transparent dark overlay
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7)
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(1000);

    // Show the quest3 image as popup background
    const popup = this.add.image(512, 384, 'quest3')
      .setOrigin(0.5)
      .setDepth(1001)
      .setScale(0.48);

    // Add a "Start Game" button below the popup
    const startBtn = this.add.text(512, 680, 'Start Game', {
      fontSize: '28px',
      color: '#FFD700',
      backgroundColor: '#333',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    })
      .setOrigin(0.5)
      .setDepth(1002)
      .setInteractive({ useHandCursor: true });

    startBtn.on('pointerdown', () => {
      overlay.destroy();
      popup.destroy();
      startBtn.destroy();
      this.scene.start('Chapter3game');
    });
  });
}

}
