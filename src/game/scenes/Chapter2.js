// scenes/Chapter2.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';
import { saveGameProgress } from '../utils/saveProgress.js';

export class Chapter2 extends Scene {
  constructor() {
    super("Chapter2");
    this.coverImage = null;
    this.background = null;
    this.bgVideo = null;
    this.startButton = null;
    this.dialogueUI = null;
    this.script = [];
    this.currentLine = 0;
    this.bgSteps = [
      'Chapter2scene1',
      'map',
      'P1',
      'P2',
      'P3',
      'P4',
      'P5',
      'P6',
      'P7',
      'body'
    ];
    this.bgStepIndex = 0;
  }

  preload() {
    this.load.video('Chapter2scene1', '/assets/Chapter2fr.mp4');
    this.load.image('map', '/assets/map.jpg');
    this.load.image('P1', '/assets/C2P1.jpg');
    this.load.image('P2', '/assets/48.jpg');
    this.load.image('P3', '/assets/49.jpg');
    this.load.image('P4', '/assets/50.jpg');
    this.load.image('P5', '/assets/52.jpg');
    this.load.image('P6', '/assets/53.jpg');
    this.load.image('P7', '/assets/54.jpg');
    this.load.video('body','/assets/body.mp4');

    // UI assets
    this.load.image('magnifying', '/assets/magnifying.png');
    this.load.image('setting', '/assets/setting.png');
    this.load.image('book', '/assets/book.png');
    this.load.image('5.png', '/assets/5.png');
    this.load.image('6.png', '/assets/6.png');
    this.load.image('7.png', '/assets/7.png');
    this.load.image('8.png', '/assets/8.png');
    this.load.image('9.png', '/assets/9.png');
  }

  create() {


      const user = JSON.parse(localStorage.getItem('currentUser'));
      const userId = user?._id;
      const currentChapter = 'Chapter2';

      console.log('userId:', userId, 'currentChapter:', currentChapter);
      saveGameProgress(userId, currentChapter);
;
  
    this.cameras.main.setBackgroundColor('#000000');

    this.coverImage = this.add.video(0, 0, 'Chapter2scene1')
      .setOrigin(0, 0)
      .setDepth(0);
    this.coverImage.setMute(true);
    this.coverImage.play(true);

    this.coverImage.on('play', () => {
      const vidWidth = this.coverImage.video.videoWidth;
      const vidHeight = this.coverImage.video.videoHeight;
      const canvasWidth = this.sys.game.config.width;
      const canvasHeight = this.sys.game.config.height;
      let scale = Math.min(canvasWidth / vidWidth, canvasHeight / vidHeight);
      this.coverImage.setDisplaySize(vidWidth * scale, vidHeight * scale);
    });

    this.startButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 300,
      'Start',
      {
        fontSize: '48px',
        color: '#ffffff',
        padding: { left: 32, right: 32, top: 16, bottom: 16 },
        borderRadius: 12
      }
    ).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

    addStoryModeUI(this, {
      onSettings: (scene, box) => scene.add.text(box.x, box.y, 'Custom Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) => scene.add.text(box.x, box.y, 'Custom Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
    });

    this.script = [
      { speaker: "Senior Red Blood Cell (narrating):", text: "After a long journey through the dark, winding vein called the Inferior Vena Cava, you finally approach the mighty heart — the body’s powerful pump." },
      { speaker: "Senior Red Blood Cell (narrating):", text: "And your new friend just arrived from the Superior Vena Cava, bringing blood back from the upper body." },
      { speaker: "Senior Red Blood Cell (narrating):", text: "As you enter the heart, you spot a fellow red blood cell gliding smoothly toward you." },
      { speaker: "New Red Blood Cell:", text: "Hey there! I just arrived from the Superior Vena Cava. Looks like we’re teammates now!" },
      { speaker: "Narrator:", text: "Noobyzom has reached the heart, the control center of the circulatory system. Your next mission: navigate the heart’s four chambers — two atria and two ventricles — to continue the journey." },
      { speaker: "Narrator:", text: "Get ready to learn the path blood takes through the heart and help Noobyzom move forward." },
      { speaker: "Narrator:", text: "Now that you’ve reached the heart, it’s time to step up and become a true red blood cell.", sceneStep: 2 },
      { speaker: "Narrator:", text: "Your real mission begins here: delivering oxygen (O₂) to every part of the body!", sceneStep: 2 },
      { speaker: "Narrator:", text: "The Right Atrium is the first chamber of the heart to receive blood.", sceneStep: 3 },
      { speaker: "Narrator:", text: "It collects deoxygenated blood returning from the whole body through the Superior and Inferior Vena Cava.", sceneStep: 3 },
      { speaker: "Narrator:", text: "When the atrium fills, the heart contracts, pushing blood through the tricuspid valve into the Right Ventricle.", sceneStep: 3 },
      { speaker: "Narrator:", text: "The Right Ventricle contracts to pump oxygen-poor blood through the pulmonic valve into the pulmonary artery.", sceneStep: 4 },
      { speaker: "Narrator:", text: "This artery carries blood to the lungs, where it picks up fresh oxygen.", sceneStep: 4 },
      { speaker: "Narrator:", text: "Oxygen-poor blood flows through the tiny capillaries in the lungs.", sceneStep: 5 },
      { speaker: "Narrator:", text: "Oxygen molecules diffuse across the thin walls into the red blood cells, where hemoglobin quickly binds with the oxygen.", sceneStep: 5 },
      { speaker: "Narrator:", text: "The Left Atrium receives oxygen-rich blood from the lungs through the pulmonary veins.", sceneStep: 6 },
      { speaker: "Narrator:", text: "When the atrium is full, the heart contracts to push blood through the mitral valve into the Left Ventricle.", sceneStep: 6 },
      { speaker: "Narrator:", text: "The Left Ventricle receives oxygen-rich blood from the Left Atrium through the mitral valve.", sceneStep: 7 },
      { speaker: "Narrator:", text: "It has the thickest walls because it must contract forcefully enough to pump oxygenated blood through the aorta to the entire body!", sceneStep: 7 },
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
    if (this.background) this.background.destroy();

    this.bgStepIndex = 1;
    this.background = this.add.image(0, 0, this.bgSteps[this.bgStepIndex])
      .setOrigin(0, 0)
      .setDepth(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    if (!this.dialogueUI) this.dialogueUI = new DialogueUI(this);

    if (this.nextButton) this.nextButton.destroy();
    if (this.backButton) this.backButton.destroy();

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
      this.scene.launch('LoadingOverlay');
       this.scene.start('Chapter2game'); // Optional: auto-start next game scene
      return;
    }

    const nextLine = this.script[this.currentLine];

    this.dialogueUI.onLineComplete = () => {
      this.currentLine++;
      this.showCurrentLine();
    };

    // Background or video switching
    if (
      typeof nextLine.sceneStep === 'number' &&
      nextLine.sceneStep !== this.bgStepIndex &&
      this.bgSteps[nextLine.sceneStep]
    ) {
      this.bgStepIndex = nextLine.sceneStep;

      if (this.background) this.background.destroy();
      if (this.bgVideo) this.bgVideo.destroy();

      const bgKey = this.bgSteps[this.bgStepIndex];

      if (this.cache.video.exists(bgKey)) {
        this.bgVideo = this.add.video(0, 0, bgKey).setOrigin(0, 0).setDepth(0);
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

    this.backButton.setVisible(this.currentLine > 0);
    this.dialogueUI.startDialogue([nextLine]);
  }
}