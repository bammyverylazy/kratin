import { Scene } from 'phaser';
const backendURL = 'https://cellvivor-backend.onrender.com';

export class Dashboard extends Scene {
  constructor() {
    super('Dashboard');
  }

  preload() {
    this.load.image('Chapter1scene1', '/assets/Chapter1scene1.png');
    this.load.video('Chapter2scene1', '/assets/Chapter2fr.mp4');
    this.load.image('Chapter3scene1', '/assets/Chapter3scene1.png');
    this.load.video('Chapter4scene1', '/assets/Chapter4scene1.mp4');
    this.load.image('star', '/assets/star.png');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userId = currentUser?._id;
    if (!userId) {
      this.add.text(w / 2, h / 2, 'User not logged in', {
        fontSize: '32px',
        color: '#000',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      return;
    }

    const headerY = h * 0.1;
    const headerText = this.add.text(w / 2, headerY, 'Dashboard', {
      fontSize: '68px',
      color: '#000',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(100);

    const starOffsetX = 226;
    const addStar = (xOffset) => {
      this.add.image(headerText.x + xOffset + 2, headerY + 2, 'star')
        .setOrigin(0.5)
        .setScale(0.13)
        .setTint(0x000000)
        .setAlpha(0.5)
        .setDepth(100);
      this.add.image(headerText.x + xOffset, headerY, 'star')
        .setOrigin(0.5)
        .setScale(0.13)
        .setDepth(101);
    };
    addStar(-starOffsetX);
    addStar(starOffsetX);

    const tooltipGraphics = this.add.graphics();
    tooltipGraphics.fillStyle(0x000000, 0.75);
    tooltipGraphics.fillRoundedRect(-110, -30, 220, 60, 8);
    this.tooltipBg = tooltipGraphics.setDepth(300).setVisible(false);

    this.tooltipText = this.add.text(0, 0, '', {
      fontSize: '16px',
      color: '#fff',
      wordWrap: { width: 200 },
      align: 'center'
    }).setOrigin(0.5).setDepth(301).setVisible(false);

    this.tooltipFadeTween = null;

    this.showTooltip = (text, x, y) => {
      if (this.tooltipFadeTween) this.tooltipFadeTween.stop();

      this.tooltipText.setText(text);
      const width = this.tooltipText.width + 20;
      const height = this.tooltipText.height + 20;

      tooltipGraphics.clear();
      tooltipGraphics.fillStyle(0x000000, 0.75);
      tooltipGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, 8);

      this.tooltipBg.setPosition(x, y).setVisible(true).setAlpha(0);
      this.tooltipText.setPosition(x, y).setVisible(true).setAlpha(0);

      this.tooltipFadeTween = this.tweens.add({
        targets: [this.tooltipBg, this.tooltipText],
        alpha: 1,
        duration: 200,
        ease: 'Power2'
      });
    };

    this.hideTooltip = () => {
      if (this.tooltipFadeTween) this.tooltipFadeTween.stop();
      this.tooltipFadeTween = this.tweens.add({
        targets: [this.tooltipBg, this.tooltipText],
        alpha: 0,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          this.tooltipBg.setVisible(false);
          this.tooltipText.setVisible(false);
        }
      });
    };

    // Continue with rest of your graph and UI code...
  }
}
