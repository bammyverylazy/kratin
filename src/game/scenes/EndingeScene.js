import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';

export class EndingScene extends Scene {
  constructor() {
    super("EndingScene");
    this.background = null;
    this.dialogueUI = null;
    this.script = [];
    this.currentLine = 0;
    this.bgSteps = [
        'rbc',
        'wbc',
        'platelet',
        'plasma',
        'End'
    ];
    this.bgStepIndex = 0;
    this.certificateShown = false; // To track certificate display
  }

  preload() {
    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('5.png', '/assets/5.png');
    this.load.image('6.png', '/assets/6.png');
    this.load.image('7.png', '/assets/7.png');
    this.load.image('8.png', '/assets/8.png');
    this.load.image('9.png', '/assets/9.png');
    this.load.image('End', '/assets/End.png');
    this.load.image('rbc', '/assets/rbc.png');
    this.load.image('wbc', '/assets/wbc.png');
    this.load.image('platelet', '/assets/platelet.png');
    this.load.image('plasma', '/assets/plasma.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    addStoryModeUI(this, {
      onSettings: (scene, box) => scene.add.text(box.x, box.y, 'Custom Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) => scene.add.text(box.x, box.y, 'Custom Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201 ),
    });

    this.script = [
      { speaker: "Narrator:", text: 'Congratulations, Kratin. \nYou’ve journeyed through the bloodstream, tackled challenges in every chamber, and helped the body survive and thrive' },
      { speaker: "Senior Red Blood Cell:", text: "Red Blood Cells delivering oxygen.", sceneStep: 2 },
      { speaker: "White Blood Cell:", text: "White Blood Cells fighting infections.", sceneStep: 3 },
      { speaker: "Platelet:", text: "Platelets clotting wounds.", sceneStep: 4 },
      { speaker: "Plasma:", text: "Plasma transporting nutrients and waste." ,sceneStep: 5 },
      { speaker: "Narrator:", text: "And now, you’re ready to take on the next adventure in the body’s journey." ,sceneStep: 6}
    ];

    // Keyboard shortcut to start story sequence
    this.input.keyboard.on('keydown', (event) => {
      if ((event.code === 'Space' || event.code === 'Enter') && this.startButton && this.startButton.active) {
        this.startButton.emit('pointerdown');
      }
    });

    this.startStorySequence();
  }

  startStorySequence() {
    if (this.background) this.background.destroy();
    this.background = this.add.image(0, 0, this.bgSteps[0])
      .setOrigin(0, 0)
      .setDepth(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    if (!this.dialogueUI) {
      this.dialogueUI = new DialogueUI(this);
    }

    if (this.nextButton) this.nextButton.destroy();
    if (this.backButton) this.backButton.destroy();

    this.nextButton = this.add.text(900, 680, '▶ Next', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.nextButton.on('pointerdown', () => {
      this.dialogueUI.advance();
    });

    this.backButton = this.add.text(820, 680, '◀ Back', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

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
      if (!this.certificateShown) {
        this.certificateShown = true;
        this.showCertificate();
      }
      return;
    }
    const nextLine = this.script[this.currentLine];

    this.dialogueUI.onLineComplete = () => {
      this.currentLine++;
      this.showCurrentLine();
    };

    // Background/video changes
    if (
      typeof nextLine.sceneStep === 'number' &&
      nextLine.sceneStep !== this.bgStepIndex &&
      this.bgSteps[nextLine.sceneStep]
    ) {
      this.bgStepIndex = nextLine.sceneStep;
      if (this.background) {
        this.background.destroy();
        this.background = null;
      }
      if (this.bgVideo) {
        this.bgVideo.destroy();
        this.bgVideo = null;
      }
      const bgKey = this.bgSteps[this.bgStepIndex];
      if (this.cache.video.exists(bgKey)) {
        this.bgVideo = this.add.video(0, 0, bgKey)
          .setOrigin(0, 0)
          .setDepth(0);
        this.bgVideo.on('play', () => {
          const vidWidth = this.bgVideo.video.videoWidth;
          const vidHeight = this.bgVideo.video.videoHeight;
          const canvasWidth = this.sys.game.config.width;
          const canvasHeight = this.sys.game.config.height;
          let scale = Math.min(canvasWidth / vidWidth, canvasHeight / vidHeight);
          this.bgVideo.setDisplaySize(vidWidth * scale, vidHeight * scale);
        });
        this.bgVideo.play(true);
        this.bgVideo.setLoop(true);
      } else {
        this.background = this.add.image(0, 0, bgKey)
          .setOrigin(0, 0)
          .setDepth(0)
          .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
      }
    }

    if (this.backButton) {
      this.backButton.setVisible(this.currentLine > 0);
    }

    // Usual dialogue display (popup logic omitted here for brevity)
    this.dialogueUI.startDialogue([nextLine]);
  }

  showCertificate() {
    // Clear dialogue UI and buttons
    if (this.dialogueUI) {
      this.dialogueUI.clearText();
    }
    if (this.nextButton) this.nextButton.destroy();
    if (this.backButton) this.backButton.destroy();

    // Set lighter background for certificate
    this.cameras.main.setBackgroundColor('#fdf5e6');

    // Draw border
    const border = this.add.graphics();
    border.lineStyle(8, 0x8B4513); // brown border
    border.strokeRect(100, 80, 824, 600);

    const centerX = this.sys.game.config.width / 2;

    // Certificate title
    this.add.text(centerX, 140, 'Certificate of Completion', {
      fontFamily: 'Georgia',
      fontSize: '40px',
      color: '#5b3a29',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, 200, 'This certifies that you have completed', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#333',
    }).setOrigin(0.5);

    // Game title
    this.add.text(centerX, 250, '🌟 CELLVIVOR 🌟', {
      fontFamily: 'Georgia',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#e63946',
    }).setOrigin(0.5);

    // Player name placeholder — you can customize or pass from data if you want
    this.add.text(centerX, 310, '[Your Name Here]', {
      fontFamily: 'Georgia',
      fontSize: '28px',
      fontStyle: 'italic',
      color: '#1d3557',
    }).setOrigin(0.5);

    // Signature lines
    this.add.text(180, 500, 'Instructor', {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color: '#000',
    });
    this.add.text(180, 525, '______________', {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color: '#000',
    });
    this.add.text(680, 500, 'Date', {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color: '#000',
    });
    this.add.text(680, 525, '______________', {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color: '#000',
    });

    // Stamp / check mark circle
    this.add.circle(centerX, 400, 50, 0xffc107).setStrokeStyle(4, 0xffa000);
    this.add.text(centerX, 400, '✔', {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#4CAF50',
    }).setOrigin(0.5);

    // Return to Main Menu button
    const returnBtn = this.add.text(centerX, 600, '🏠 Return to Main Menu', {
      fontFamily: 'Arial',
      fontSize: '24px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    returnBtn.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });

    // Button subtle tween
    this.tweens.add({
      targets: returnBtn,
      scale: { from: 0.95, to: 1.05 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }
}
