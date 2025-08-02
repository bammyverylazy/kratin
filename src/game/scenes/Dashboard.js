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
    this.load.image('lock', '/assets/lock-icon.png'); // Optional lock icon
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
    const graphY = h * 0.25;
    const maxHeight = 250;
    const barWidth = 30;
    const barGap = 15;

    fetch(`${backendURL}/api/user/${userId}/gameplay-history`)
      .then(res => res.json())
      .then((sessions) => {
        if (!sessions || sessions.length === 0) {
          this.add.text(w / 2, h / 2, 'No gameplay data to show', {
            fontSize: '24px',
            color: '#000',
          }).setOrigin(0.5);
          return;
        }

        const graphX = 100;
        const maxScore = Math.max(...sessions.map(s => s.score));
        const maxHints = Math.max(...sessions.map(s => s.hintsUsed));
        const scaleScore = maxScore > 0 ? maxHeight / maxScore : 0;
        const scaleHints = maxHints > 0 ? maxHeight / maxHints : 0;

        this.add.text(w / 2, graphY - 40, 'Recent Game Scores & Hints Used', {
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#000',
        }).setOrigin(0.5);

        sessions.forEach((session, index) => {
          const x = graphX + index * (barWidth * 2 + barGap * 3);
          const scoreHeight = session.score * scaleScore;
          const hintsHeight = session.hintsUsed * scaleHints;

          this.add.rectangle(x, graphY + maxHeight, barWidth, -scoreHeight, 0x3366ff).setOrigin(0, 1);
          this.add.rectangle(x + barWidth + barGap, graphY + maxHeight, barWidth, -hintsHeight, 0xff9933).setOrigin(0, 1);

          this.add.text(x + barWidth / 2, graphY + maxHeight - scoreHeight - 10, session.score, {
            fontSize: '14px',
            color: '#000',
          }).setOrigin(0.5, 1);

          this.add.text(x + barWidth + barGap + barWidth / 2, graphY + maxHeight - hintsHeight - 10, session.hintsUsed, {
            fontSize: '14px',
            color: '#000',
          }).setOrigin(0.5, 1);

          const dateStr = new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          this.add.text(x + barWidth, graphY + maxHeight + 10, dateStr, {
            fontSize: '12px',
            color: '#000',
          }).setOrigin(0.5, 0);
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
      { key: 'Chapter1scene1', label: 'Chapter 1', type: 'image', scene: 'Chapter1game' },
      { key: 'Chapter2scene1', label: 'Chapter 2', type: 'video', scene: 'Chapter2game' },
      { key: 'Chapter3scene1', label: 'Chapter 3', type: 'image', scene: 'Chapter3game' },
      { key: 'Chapter4scene1', label: 'Chapter 4', type: 'video', scene: 'Chapter4game' },
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

      let thumb;
      if (ch.type === 'video') {
        thumb = this.add.video(x, mapsY, ch.key)
          .setDisplaySize(thumbWidth, thumbHeight)
          .setOrigin(0, 0)
          .setPaused(true);
      } else {
        thumb = this.add.image(x, mapsY, ch.key)
          .setDisplaySize(thumbWidth, thumbHeight)
          .setOrigin(0, 0);
      }

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
