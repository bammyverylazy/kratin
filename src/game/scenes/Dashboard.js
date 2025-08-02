import { Scene } from 'phaser';
const backendURL = 'https://cellvivor-backend.onrender.com';

export class Dashboard extends Scene {
  constructor() {
    super('Dashboard');
  }

  preload() {
    this.load.image('Chapter1scene1', '/assets/Chapter1scene1.png');
    this.load.image('Chapter2scene1', '/assets/Chapter2scene1Intro.png');
    this.load.image('Chapter3scene1', '/assets/Chapter3scene1.png');
    this.load.image('Chapter4scene1', '/assets/Chapter4scene1Intro.png');
    this.load.image('lock', '/assets/lock-icon.png');
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

    fetch(`${backendURL}/progress/load/${userId}`)
      .then(res => res.json())
      .then(data => {
        const currentChapterStr = data.lastScene || 'Chapter1';
        const currentChapterIndex = parseInt(currentChapterStr.replace('Chapter', ''));
        this.renderDashboard(w, h, currentChapterIndex, userId);
      })
      .catch(err => {
        console.error('Failed to load user progress:', err);
        this.add.text(w / 2, h / 2, 'Failed to load progress', {
          fontSize: '24px',
          color: '#f00',
        }).setOrigin(0.5);
      });
  }

  renderDashboard(w, h, currentChapterIndex, userId) {
    const graphX = 100;
    const graphY = 180;
    const graphWidth = w - 2 * graphX;
    const maxHeight = 200;
    const barWidth = 30;
    const barGap = 30; // increased gap for better spacing

    // White background rectangle
    const graphBg = this.add.rectangle(graphX - 20, graphY - 30, graphWidth + 40, maxHeight + 150, 0xffffff)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xaaaaaa)
      .setInteractive({ useHandCursor: false });
    if (graphBg.setCornerRadius) graphBg.setCornerRadius(20);

    // Title above graph
    this.add.text(w / 2, graphY - 60, 'Recent Game Scores & Hints Used', {
      fontSize: '35px',
      fontStyle: 'bold',
      color: '#5a3e1b',
    }).setOrigin(0.5);

    // Legend
    const legendX = graphX;
    const legendY = graphY - 10;
    // Score Legend
    this.add.rectangle(legendX, legendY, 20, 20, 0x3366ff).setOrigin(0, 0);
    this.add.text(legendX + 25, legendY + 2, 'Score', {
      fontSize: '18px',
      color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0, 0);

    // Hints Used Legend
    this.add.rectangle(legendX + 120, legendY, 20, 20, 0xff9933).setOrigin(0, 0);
    this.add.text(legendX + 145, legendY + 2, 'Hints Used', {
      fontSize: '18px',
      color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0, 0);

    fetch(`${backendURL}/api/user/${userId}/gameplay-history`)
      .then(res => res.json())
      .then((sessions) => {
        if (!sessions || sessions.length === 0) {
          this.add.text(w / 2, graphY + 80, 'No gameplay data to show', {
            fontSize: '24px',
            color: '#000',
          }).setOrigin(0.5);
          return;
        }

        const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
        const avgScore = (totalScore / sessions.length).toFixed(2);
        const missedKeywords = Array.from(new Set(sessions.flatMap(s => s.missedKeywords || [])));

        // Average score and missed keywords text 
        this.add.text(graphX, graphY + maxHeight + 10, `Average Score: ${avgScore}`, {
          fontSize: '26px',
          color: '#000',
          fontStyle: 'bold',
        });

        this.add.text(graphX + 350, graphY + maxHeight + 10, `Missed Keywords:`, {
          fontSize: '26px',
          color: '#000',
          fontStyle: 'bold',
        });

        // Wrap missed keywords below that label, limited width & max height
        this.add.text(graphX + 350, graphY + maxHeight + 50, missedKeywords.join(', ') || 'None', {
          fontSize: '22px',
          color: '#333',
          wordWrap: { width: w - graphX - 350 - 40 },
          maxLines: 3,
          fixedWidth: w - graphX - 350 - 40,
        });

        // Graph bars scaling
        const maxScore = Math.max(...sessions.map(s => s.score));
        const maxHints = Math.max(...sessions.map(s => s.hintsUsed));
        const scaleScore = maxScore > 0 ? maxHeight / maxScore : 0;
        const scaleHints = maxHints > 0 ? maxHeight / maxHints : 0;

        sessions.forEach((session, index) => {
          const x = graphX + index * (barWidth * 2 + barGap * 2); // adjusted gaps for better fit
          const scoreHeight = session.score * scaleScore;
          const hintsHeight = session.hintsUsed * scaleHints;

          // Blue bars for scores
          this.add.rectangle(x, graphY + maxHeight, barWidth, -scoreHeight, 0x3366ff).setOrigin(0, 1);
          // Orange bars for hints used
          this.add.rectangle(x + barWidth + barGap / 2, graphY + maxHeight, barWidth, -hintsHeight, 0xff9933).setOrigin(0, 1);

          // Score numbers above bars
          this.add.text(x + barWidth / 2, graphY + maxHeight - scoreHeight - 10, session.score, {
            fontSize: '16px',
            color: '#000',
            fontStyle: 'bold',
          }).setOrigin(0.5, 1);

          this.add.text(x + barWidth + barGap / 2 + barWidth / 2, graphY + maxHeight - hintsHeight - 10, session.hintsUsed, {
            fontSize: '16px',
            color: '#000',
            fontStyle: 'bold',
          }).setOrigin(0.5, 1);
        });
      });

    // === Game Maps ===
    const mapsY = h - 220;
    this.add.text(w / 2, mapsY - 40, 'Game Maps', {
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#5a3e1b',
    }).setOrigin(0.5);

    const chapters = [
      { key: 'Chapter1scene1', label: 'Chapter 1', scene: 'Chapter1game' },
      { key: 'Chapter2scene1', label: 'Chapter 2', scene: 'Chapter2game' },
      { key: 'Chapter3scene1', label: 'Chapter 3', scene: 'Chapter3game' },
      { key: 'Chapter4scene1', label: 'Chapter 4', scene: 'Chapter4game' },
    ];

    const thumbWidth = 150;
    const thumbHeight = 90;
    const thumbGap = 40;
    const totalWidth = chapters.length * (thumbWidth + thumbGap) - thumbGap;
    const startX = (w - totalWidth) / 2;

    chapters.forEach((ch, i) => {
      const chapterIndex = i + 1;
      const x = startX + i * (thumbWidth + thumbGap);
      const isUnlocked = chapterIndex <= currentChapterIndex;

      const thumb = this.add.image(x, mapsY, ch.key)
        .setDisplaySize(thumbWidth, thumbHeight)
        .setOrigin(0, 0);

      if (!isUnlocked) thumb.setAlpha(0.3);

      this.add.text(x + thumbWidth / 2, mapsY + thumbHeight + 10, ch.label, {
        fontSize: '18px',
        color: isUnlocked ? '#000' : '#888',
      }).setOrigin(0.5);

      if (isUnlocked) {
        const playBtn = this.add.text(x + thumbWidth / 2, mapsY + thumbHeight + 40, '▶ Play', {
          fontSize: '18px',
          backgroundColor: '#ffcc00',
          color: '#000',
          padding: { x: 10, y: 5 },
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

        playBtn.on('pointerdown', () => {
          this.scene.start(ch.scene);
        });
      } else {
        this.add.image(x + thumbWidth / 2, mapsY + thumbHeight + 40, 'lock')
          .setDisplaySize(32, 32)
          .setOrigin(0.5);
      }
    });
  }
}
