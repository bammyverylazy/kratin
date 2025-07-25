// scenes/Chapter1.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';
import { saveGameProgress } from '../utils/saveProgress.js';


export class Chapter1 extends Scene {
  constructor() {
    super("Chapter1");
    this.coverImage = null;
    this.background = null;
    this.startButton = null;
    this.dialogueUI = null;
    this.script = [];
    this.currentLine = 0;
    this.bgSteps = [
      'Chapter1scene2',
      'bone',
      'bone1',
      'bone2',
      'Bonemarrow',
      'noobysleep',
      'noobywake',
      'CellBorn',
      'Blood',
      'body',
      'bloodvess',
      'noobywalkyellow',
      'RBCIntro',
      'RBCwalkpink',
      'BloodVessel',
      'BloodVesselA',
      'BloodVesselB'
    ];
    this.bgStepIndex = 0;
  }

  preload() {
    this.load.image('Chapter1scene1', 'assets/Chapter1scene1.png'); // Cover page
    this.load.image('Chapter1scene2', 'assets/Chapter1scene2.png'); // First background
    this.load.image('bone', 'assets/Bone.png');
    this.load.image('bone1', 'assets/Bone1.png');
    this.load.image('bone2', 'assets/Bone2.png');
    this.load.image('Bonemarrow', 'assets/Bonemarrow.png');
    this.load.image('noobysleep', 'assets/noobysleep.png');
    this.load.image('noobywake', 'assets/noobywake.png');
    this.load.video('CellBorn', 'assets/CellBorn.mp4');
    this.load.video('Blood', 'assets/Blood.mp4');
    this.load.video('body','assets/body.mp4')
    this.load.video('bloodvess', 'assets/bloodvess.mp4');
    this.load.video('noobywalkyellow', 'assets/noobywalkyellow.mp4');
    this.load.video('RBCIntro', 'assets/RBCIntro.mp4');
    this.load.video('RBCwalkpink', 'assets/RBCwalkpink.mp4');
    this.load.image('BloodVessel', 'assets/BloodVessel.png');
    this.load.image('BloodVesselA', 'assets/BloodVesselA.png');
    this.load.image('BloodVesselB', 'assets/BloodVesselB.png');

    this.load.image('magnifying', 'assets/magnifying.png');
    this.load.image('setting', 'assets/setting.png');
    this.load.image('book', 'assets/book.png');
    this.load.image('5.png', 'assets/5.png');
    this.load.image('6.png', 'assets/6.png');
    this.load.image('7.png', 'assets/7.png');
    this.load.image('8.png', 'assets/8.png');
    this.load.image('9.png', 'assets/9.png');
    // Preload other assets if needed
  }

  create() {

      const user = JSON.parse(localStorage.getItem('currentUser'));
      const userId = user?._id;
      const currentChapter = 'Chapter1';

      console.log('userId:', userId, 'currentChapter:', currentChapter);
      saveGameProgress(userId, currentChapter);

    // Start screen: black background
    this.cameras.main.setBackgroundColor('#000000');

    // Show cover image (Chapter1scene1.png)
    this.coverImage = this.add.image(0, 0, 'Chapter1scene1')
      .setOrigin(0, 0)
      .setDepth(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // Add Start button centered
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
    )
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    addStoryModeUI(this, {
      onSettings: (scene, box) => scene.add.text(box.x, box.y, 'Custom Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) => scene.add.text(box.x, box.y, 'Custom Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201 ),
    });
    // Prepare dialogue script with sceneStep for background changes
    this.script = [
      { speaker: "Narrator:", text: 'Welcome to your journey inside the body, This is "CELLVIVOR".' }, //once upon a time
    // bone
    { speaker: "Narrator:", text: " a vast network of cells works relentlessly to keep us alive.", sceneStep: 2 },
    { speaker: "Narrator", text: "And here, deep inside, is the marrow.", sceneStep: 3 },
    { speaker: "Narrator:", text: "The marrow is bustling with activity.", sceneStep: 4 }, // stays on same scene for 2nd click
    {speaker: "Noobyzom:", text: "☆*: .｡. o(≧▽≦)o .｡.:*☆", sceneStep: 5 }, // noobysleep
    { speaker: "Narrator:", text: "You are Noobyzom", sceneStep: 6 }, // noobywake
    { speaker: "Narrator:", text: "A newborn red blood cell, just created in the bone marrow, the body’s blood cell factory.", sceneStep: 7 }, // CellBorn
    { speaker: "Narrator:", text: " Born from hematopoietic stem cells, you have developed into a biconcave, flexible, nucleus-free hero", sceneStep: 8 },
    { speaker: "Narrator:", text: "  perfectly designed to carry one of life’s most precious elements: oxygen.", sceneStep: 8 },
   // { speaker: "Narrator", text: " Born from hematopoietic stem cells, you have developed into a biconcave, flexible, nucleus-free hero — perfectly designed to carry one of life’s most precious elements: oxygen.", sceneStep: 8 },
    { speaker: "Narrator:", text: "Your journey starts here. From the bone marrow, \nyou will enter the bloodstream through the vessels.", sceneStep: 10 },//bloodvess 
    { speaker: "Narrator:", text: "Your mission: Deliver oxygen to every cell in the body and maintain life.", sceneStep: 9 },
    { speaker: "Narrator:", text: "This is not just a task — it's the purpose of your existence.", sceneStep: 11 },
    { speaker: "Senior Red Blood Cell:", text: " Ah, fresh from the marrow, huh? I’m your senior — a well-traveled, oxygen-delivering expert.", sceneStep:  12},
    { speaker: "Senior Red Blood Cell:", text: " And lucky you — I’ve got a heart map just for you.", sceneStep:  12},
    { speaker: "Noobyzom:", text: "“A map? Wait… where exactly is the heart?", sceneStep:  11},
    { speaker: "Senior Red Blood Cell:", text: "Haha, rookie move! Don't worry, you’ll learn quickly.\nThe heart is our command center — the engine that pumps us through the body.", sceneStep:  13},
    { speaker: "Senior Red Blood Cell:", text: " Now listen up, I’ll walk you through the main routes: \nthe atria, ventricles, arteries, veins… It’s like a highway system in here!", sceneStep:  14},
    { speaker: "☆Arteries☆", text: "Arteries have thick, elastic walls that allow them to handle the high pressure of blood being pumped directly from the heart. They do not contain valves, and blood pulses strongly through them with each heartbeat. ", sceneStep:  15},
    { speaker: "☆Veins☆", text: "Veins have thinner walls than arteries and carry blood under lower pressure. They contain valves to prevent the backward flow of blood, and blood movement is aided by surrounding muscles and these valves. ", sceneStep:  16},
    { speaker: "☆Capillaries☆", text: "Capillaries are the smallest blood vessels, with walls only one cell thick. They are the sites where the exchange of gases, nutrients, and waste occurs between the blood and body cells. ", sceneStep:  14},
   // { speaker: "Red Blood Cell", text: "Welcome to your new life, red blood cell rookie!", sceneStep:  10},
  ];


    // Start button click handler
    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      this.coverImage.destroy();
      this.startStorySequence();
    });

    // Allow pressing Enter/Space to start
    this.input.keyboard.on('keydown', (event) => {
      if ((event.code === 'Space' || event.code === 'Enter') && this.startButton && this.startButton.active) {
        this.startButton.emit('pointerdown');
      }
    });
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

    // Remove old buttons if they exist
    if (this.nextButton) this.nextButton.destroy();
    if (this.backButton) this.backButton.destroy();

    // Add Next button
    this.nextButton = this.add.text(900, 680, '▶ Next', {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#333',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.nextButton.on('pointerdown', () => {
        this.dialogueUI.advance();
    });

    // Add Back button
    this.backButton = this.add.text(820, 680, '◀ Back', {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#333',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.backButton.on('pointerdown', () => {
        if (this.currentLine > 0) {
            this.currentLine -= 2; // Go back one line (since showCurrentLine will increment)
            if (this.currentLine < 0) this.currentLine = 0;
            this.showCurrentLine();
        }
    });

    // Keybinds for keyboard users
    this.input.keyboard.on('keydown-ENTER', () => {
      this.dialogueUI.advance();
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      this.dialogueUI.advance();
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
      this.dialogueUI.advance();
    });
    this.input.keyboard.on('keydown-LEFT', () => {
        if (this.currentLine > 0) {
            this.currentLine -= 2;
            if (this.currentLine < 0) this.currentLine = 0;
            this.showCurrentLine();
        }
    });

    this.currentLine = 0;

    // Start the first line
    this.showCurrentLine();
}

showCurrentLine() {
    // Always use this function to step through the script
    if (this.currentLine >= this.script.length) {
        // End of all dialogue
        this.scene.start('Chapter1game'); // Transition to Chapter1game scene
        return;
    }
    const nextLine = this.script[this.currentLine];

    this.dialogueUI.onLineComplete = () => {
        this.currentLine++;
        this.showCurrentLine();
    };

    // Handle background/video changes
    if (
        typeof nextLine.sceneStep === 'number' &&
        nextLine.sceneStep !== this.bgStepIndex &&
        this.bgSteps[nextLine.sceneStep]
    ) {
        this.bgStepIndex = nextLine.sceneStep;

        // Remove previous background
        if (this.background) {
            this.background.destroy();
            this.background = null;
        }
        if (this.bgVideo) {
            this.bgVideo.destroy();
            this.bgVideo = null;
        }

        const bgKey = this.bgSteps[this.bgStepIndex];
        // If the asset is a video (loaded with this.load.video), use video
        if (this.cache.video.exists(bgKey)) {
            this.bgVideo = this.add.video(0, 0, bgKey)
                .setOrigin(0, 0)
                .setDepth(0);

            // Wait for the video to be ready before sizing
            this.bgVideo.on('play', () => {
                const vidWidth = this.bgVideo.video.videoWidth;
                const vidHeight = this.bgVideo.video.videoHeight;
                const canvasWidth = this.sys.game.config.width;
                const canvasHeight = this.sys.game.config.height;

                // Scale to fit canvas while maintaining aspect ratio
                let scale = Math.min(canvasWidth / vidWidth, canvasHeight / vidHeight);
                this.bgVideo.setDisplaySize(vidWidth * scale, vidHeight * scale);
            });

            this.bgVideo.play(true);
            this.bgVideo.setLoop(true);
        } else {
            // Otherwise, use image
            this.background = this.add.image(0, 0, bgKey)
                .setOrigin(0, 0)
                .setDepth(0)
                .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        }
    }

    // Show/hide Back button
    if (this.backButton) {
        this.backButton.setVisible(this.currentLine > 0);
    }

    // --- POPUP LOGIC ---
    if (
        nextLine.speaker === "Senior Red Blood Cell" &&
        nextLine.text.includes("heart map")
    ) {
        this.dialogueUI.startDialogue([nextLine]);

        // Show popup after a short delay to allow dialogue to appear
        this.time.delayedCall(600, () => {
            if (this.popupContainer) return;
            this.popupContainer = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.5)
              .setOrigin(0.5).setDepth(299).setInteractive();
            const popupBox = this.add.rectangle(512, 320, 500, 200, 0xc7c7c7, 1)
              .setOrigin(0.5).setDepth(300).setInteractive();
            this.popupBook = this.add.image(332, 320, 'book')
              .setOrigin(0.5)
              .setDisplaySize(80, 80)
              .setDepth(301);
            this.popupText = this.add.text(547, 320, "You received a heart map!\nUse it to navigate the body.", {
              fontSize: '28px',
              color: '#222',
              wordWrap: { width: 340 }
            }).setOrigin(0.5).setDepth(301);

            // Close popup on click outside the white box
            this.popupContainer.on('pointerdown', (pointer) => {
              // If click is outside the popupBox area, close
              const px = pointer.x, py = pointer.y;
              if (
                px < popupBox.x - popupBox.width / 2 ||
                px > popupBox.x + popupBox.width / 2 ||
                py < popupBox.y - popupBox.height / 2 ||
                py > popupBox.y + popupBox.height / 2
              ) {
                this.popupContainer.destroy();
                popupBox.destroy();
                this.popupBook.destroy();
                this.popupText.destroy();
                this.popupContainer = null;
                this.popupBook = null;
                this.popupText = null;
              }
            });

            // Also close popup on next dialogue advance
            const closePopup = () => {
              if (this.popupContainer) this.popupContainer.destroy();
              if (popupBox) popupBox.destroy();
              if (this.popupBook) this.popupBook.destroy();
              if (this.popupText) this.popupText.destroy();
              this.popupContainer = null;
              this.popupBook = null;
              this.popupText = null;
            };
            // Remove previous listener to avoid stacking
            this.input.off('pointerdown', closePopup, this);
            this.input.on('pointerdown', closePopup, this);
            this.dialogueUI.onLineComplete = () => {
              closePopup();
              this.currentLine++;
              this.showCurrentLine();
            };
        });
    } else if (
        nextLine.speaker === "Senior Red Blood Cell" &&
        nextLine.text.includes("main routes")
    ) {
        this.dialogueUI.startDialogue([nextLine]);

            // Close popup on click outside the white box
            this.popupContainer.on('pointerdown', (pointer) => {
              const px = pointer.x, py = pointer.y;
              if (
                px < popupBox.x - popupBox.width / 2 ||
                px > popupBox.x + popupBox.width / 2 ||
                py < popupBox.y - popupBox.height / 2 ||
                py > popupBox.y + popupBox.height / 2
              ) {
                this.popupContainer.destroy();
                popupBox.destroy();
                this.popupText.destroy();
                this.popupContainer = null;
                this.popupText = null;
              }
            });

            // Also close popup on next dialogue advance
            const closePopup = () => {
              if (this.popupContainer) this.popupContainer.destroy();
              if (popupBox) popupBox.destroy();
              if (this.popupText) this.popupText.destroy();
              this.popupContainer = null;
              this.popupText = null;
            };
            this.input.off('pointerdown', closePopup, this);
            this.input.on('pointerdown', closePopup, this);
            this.dialogueUI.onLineComplete = () => {
              closePopup();
              this.currentLine++;
              this.showCurrentLine();
            };
    } else {
        this.dialogueUI.startDialogue([nextLine]);
    }
}
}


