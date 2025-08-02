import { Scene } from 'phaser';
const backendURL = import.meta.env.VITE_BACKEND_URL;

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

    // === Background gradient ===
    const grd = this.add.graphics();
    grd.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x4ca1af, 0x4ca1af, 1);
    grd.fillRect(0, 0, w, h);

    // Retrieve user ID safely
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userId = currentUser?._id;
    if (!userId) {
      this.add
        .text(w / 2, h / 2, 'User not logged in', {
          fontSize: '32px',
          color: '#fff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      return;
    }

    // === Header with shadow ===
    const headerY = h * 0.1;
    const headerText = this.add
      .text(w / 2, headerY, 'Dashboard', {
        fontSize: '68px',
        color: '#fff',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000',
        strokeThickness: 5,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 4,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(100);

    const starOffsetX = 226;
    this.add
      .image(headerText.x - starOffsetX, headerY, 'star')
      .setOrigin(0.5)
      .setScale(0.13)
      .setDepth(101);
    this.add
      .image(headerText.x + starOffsetX, headerY, 'star')
      .setOrigin(0.5)
      .setScale(0.13)
      .setDepth(101);

    // === Tooltip setup ===
    this.tooltipBg = this.add
      .roundedRectangle(0, 0, 220, 60, 8, 0x000000, 0.75)
      .setOrigin(0.5)
      .setDepth(300)
      .setVisible(false);

    this.tooltipText = this.add
      .text(0, 0, '', {
        fontSize: '16px',
        color: '#fff',
        wordWrap: { width: 200 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(301)
      .setVisible(false);

    this.tooltipFadeTween = null;

    this.showTooltip = (text, x, y) => {
      if (this.tooltipFadeTween) this.tooltipFadeTween.stop();

      this.tooltipText.setText(text);
      this.tooltipBg.setSize(this.tooltipText.width + 20, this.tooltipText.height + 20);

      this.tooltipBg.setPosition(x, y);
      this.tooltipText.setPosition(x, y);

      this.tooltipBg.setAlpha(0);
      this.tooltipText.setAlpha(0);

      this.tooltipBg.setVisible(true);
      this.tooltipText.setVisible(true);

      this.tooltipFadeTween = this.tweens.add({
        targets: [this.tooltipBg, this.tooltipText],
        alpha: 1,
        duration: 200,
        ease: 'Power2',
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
        },
      });
    };

    // === Graph Box with drop shadow ===
    const graphBox = this.add
      .rectangle(w * 0.25, h * 0.35, 460, 300, 0xffffff)
      .setStrokeStyle(2, 0xcccccc)
      .setDepth(10);

    this.add
      .text(w * 0.07, h * 0.18, '📈 Score & Hint Usage', {
        fontSize: '28px',
        color: '#111',
        fontStyle: 'bold',
      })
      .setDepth(11);

    // === Graph Legend with spacing ===
    const legendX = w * 0.07;
    const legendY = h * 0.57;
    this.add.rectangle(legendX, legendY, 20, 20, 0x4bc6f0).setOrigin(0, 0.5);
    this.add
      .text(legendX + 30, legendY, 'Score', {
        fontSize: '20px',
        color: '#111',
        fontWeight: '600',
      })
      .setOrigin(0, 0.5);

    this.add.rectangle(legendX + 120, legendY, 20, 20, 0xff7171).setOrigin(0, 0.5);
    this.add
      .text(legendX + 150, legendY, 'Hints Used', {
        fontSize: '20px',
        color: '#111',
        fontWeight: '600',
      })
      .setOrigin(0, 0.5);

    // === Y axis labels for graph ===
    const baseX = w * 0.07;
    const baseY = h * 0.43;
    const maxScoreHeight = 90;
    const maxScoreValue = 30; 

    // Y axis lines and labels
    for (let i = 0; i <= 3; i++) {
      const y = baseY - (maxScoreHeight / 3) * i;
      const val = (maxScoreValue / 3) * i;
      this.add.line(baseX - 5, y, 0, 0, 460, 0, 0xcccccc).setOrigin(0, 0.5).setAlpha(0.4);
      this.add
        .text(baseX - 40, y, val.toFixed(0), {
          fontSize: '16px',
          color: '#111',
          fontWeight: '600',
        })
        .setOrigin(1, 0.5);
    }

    // === Fetch gameplay data and draw bars with hover tooltips ===
    fetch(`${backendURL}/api/user/${userId}/gameplay-history`)
      .then((res) => res.json())
      .then((graphData) => {
        const barWidth = 30;
        const gap = 40;

        graphData.forEach((entry, i) => {
          const x = baseX + i * gap;
          const score = entry.score || 0;
          const hint = entry.hintUsed || 0;
          const avgTime = Math.floor(entry.avgTime || 0);

          // Score bar
          const scoreHeight = Math.min(score, maxScoreValue) * (maxScoreHeight / maxScoreValue);
          const scoreRect = this.add
            .rectangle(x, baseY, barWidth, -scoreHeight, 0x4bc6f0)
            .setOrigin(0, 1)
            .setInteractive({ cursor: 'pointer' });

          const hintHeight = Math.min(hint, 3) * 30;
          const hintRect = this.add
            .rectangle(x + 15, baseY, barWidth / 2, -hintHeight, 0xff7171)
            .setOrigin(0, 1)
            .setInteractive({ cursor: 'pointer' });

          this.add
            .text(x, baseY + 12, `${avgTime}s`, {
              fontSize: '14px',
              color: '#111',
              fontWeight: '600',
            })
            .setOrigin(0, 0);

          scoreRect.on('pointerover', () => {
            this.showTooltip(`Score: ${score}`, x + barWidth / 2, baseY - scoreHeight - 20);
          });
          scoreRect.on('pointerout', this.hideTooltip);

          hintRect.on('pointerover', () => {
            this.showTooltip(`Hints Used: ${hint}`, x + barWidth / 2 + 15, baseY - hintHeight - 20);
          });
          hintRect.on('pointerout', this.hideTooltip);
        });
      })
      .catch((err) => {
        console.error('Gameplay history error:', err);
      });

    // === Weakness List Box with shadow ===
    const weaknessBox = this.add
      .rectangle(w * 0.75, h * 0.35, 460, 300, 0xffffff)
      .setStrokeStyle(2, 0xcccccc)
      .setDepth(10);

    this.add
      .text(w * 0.58, h * 0.18, '❌ Missed Words', {
        fontSize: '28px',
        color: '#111',
        fontWeight: 'bold',
      })
      .setDepth(11);

    fetch(`${backendURL}/users/${userId}`)
      .then((res) => res.json())
      .then((userData) => {
        const missed = userData.weakness || [];
        const startY = h * 0.22;
        const spacing = 28;

        missed.slice(0, 12).forEach((item, i) => {
          const color = item.startsWith('TT') ? '#ff5555' : '#555555';
          this.add
            .text(w * 0.58, startY + i * spacing, `• ${item}`, {
              fontSize: '20px',
              color,
              fontWeight: '600',
            })
            .setOrigin(0, 0);
        });
      })
      .catch((err) => {
        console.error('User data error:', err);
      });

    // === Chapter Roadmap Title ===
    this.add
      .text(w / 2, h * 0.7, '📘 Chapter Roadmap', {
        fontSize: '32px',
        color: '#111',
        fontWeight: 'bold',
      })
      .setOrigin(0.5);

    // === Chapter Roadmap Entries with "Play Chapter" text button below each ===
    const chapterEntries = [
      {
        type: 'image',
        key: 'Chapter1scene1',
        scene: 'Chapter1Intro',
        gameScene: 'Chapter1game',
        desc: 'Learn about the circulatory system basics.',
      },
      {
        type: 'video',
        key: 'Chapter2scene1',
        scene: 'Chapter2Intro',
        gameScene: 'Chapter2game',
        desc: 'Explore the heart and blood vessels.',
      },
      {
        type: 'image',
        key: 'Chapter3scene1',
        scene: 'Chapter3Intro',
        gameScene: 'Chapter3game',
        desc: 'Understand oxygen transport.',
      },
      {
        type: 'video',
        key: 'Chapter4scene1',
        scene: 'Chapter4Intro',
        gameScene: 'Chapter4game',
        desc: 'Master the rhythm of the heartbeat.',
      },
    ];

    chapterEntries.forEach((entry, i) => {
      const x = w * 0.2 + i * (w * 0.2);
      const y = h * 0.78;

      // Create image or video preview
      let preview;
      if (entry.type === 'image') {
        preview = this.add
          .image(x, y, entry.key)
          .setDisplaySize(160, 90)
          .setInteractive({ useHandCursor: true })
          .setDepth(10);

        preview.on('pointerover', () => {
          this.tweens.add({ targets: preview, scale: 1.05, duration: 150, ease: 'Power1' });
          this.showTooltip(entry.desc, x, y - 70);
        });
        preview.on('pointerout', () => {
          this.tweens.add({ targets: preview, scale: 1, duration: 150, ease: 'Power1' });
          this.hideTooltip();
        });
        preview.on('pointerdown', () => this.scene.start(entry.scene));
      } else {
        preview = this.add
          .video(x, y, entry.key)
          .setDisplaySize(160, 90)
          .setInteractive({ useHandCursor: true })
          .setDepth(10)
          .setMute(true)
          .pause();

        preview.on('pointerover', () => {
          preview.play(true);
          this.tweens.add({ targets: preview, scale: 1.05, duration: 150, ease: 'Power1' });
          this.showTooltip(entry.desc, x, y - 70);
        });
        preview.on('pointerout', () => {
          preview.pause();
          this.tweens.add({ targets: preview, scale: 1, duration: 150, ease: 'Power1' });
          this.hideTooltip();
        });
        preview.on('pointerdown', () => this.scene.start(entry.scene));
      }
      const btnY = y + 65; 
      const btnBg = this.add
        .roundedRectangle(x, btnY, 140, 36, 8, 0x6067fe)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(11);
      const btnText = this.add
        .text(x, btnY, '▶ Play Chapter', {
          fontSize: '18px',
          color: '#fff',
          fontWeight: '600',
        })
        .setOrigin(0.5)
        .setDepth(12);

      btnBg.on('pointerover', () => {
        this.tweens.add({
          targets: [btnBg, btnText],
          scale: 1.05,
          duration: 150,
          ease: 'Power1',
        });
      });
      btnBg.on('pointerout', () => {
        this.tweens.add({
          targets: [btnBg, btnText],
          scale: 1,
          duration: 150,
          ease: 'Power1',
        });
      });

      // Click handler
      btnBg.on('pointerdown', () => {
        this.scene.start(entry.gameScene);
      });

      // Also make the text clickable (optional)
      btnText.setInteractive({ useHandCursor: true });
      btnText.on('pointerover', () => btnBg.emit('pointerover'));
      btnText.on('pointerout', () => btnBg.emit('pointerout'));
      btnText.on('pointerdown', () => btnBg.emit('pointerdown'));
    });

    // === Game Mode Button container with hover and click effect ===
    const playBtnContainer = this.add.container(w - 120, 50).setDepth(20);

    const playBtnRect = this.add
      .rectangle(0, 0, 200, 50, 0x6067fe)
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' })
      .setStrokeStyle(2, 0x4048c7)
      .setDepth(21);

    const playBtnText = this.add
      .text(0, 0, '🎮 Game Mode', {
        fontSize: '24px',
        color: '#fff',
        fontWeight: '600',
      })
      .setOrigin(0.5)
      .setDepth(22);

    playBtnContainer.add([playBtnRect, playBtnText]);

    // Hover effect
    playBtnRect.on('pointerover', () => {
      this.tweens.add({
        targets: playBtnRect,
        fillAlpha: 0.8,
        duration: 150,
      });
    });
    playBtnRect.on('pointerout', () => {
      this.tweens.add({
        targets: playBtnRect,
        fillAlpha: 1,
        duration: 150,
      });
    });

    // Click effect and action
    playBtnRect.on('pointerdown', () => {
      this.tweens.add({
        targets: playBtnContainer,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        ease: 'Power1',
        onComplete: () => {
          this.scene.start('Mode');
        },
      });
    });
  }
}
