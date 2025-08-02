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
    const graphY = 160;
    const graphWidth = w - 2 * graphX;
    const graphHeight = 220;
    const barWidth = 40;
    const barGap = 30;

    // White background container
    const bg = this.add.rectangle(graphX - 40, graphY - 80, graphWidth + 80, graphHeight + 220, 0xffffff)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xaaaaaa);
    if (bg.setCornerRadius) bg.setCornerRadius(20);

    // Title
    this.add.text(w / 2, graphY - 50, 'Recent Game Performance', {
      fontSize: '36px',
      color: '#5a3e1b',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Legend
    const legendBaseX = graphX + 10;
    const legendY = graphY - 15;
    this.add.rectangle(legendBaseX, legendY, 20, 20, 0x3366ff).setOrigin(0, 0);
    this.add.text(legendBaseX + 28, legendY + 1, 'Score', { fontSize: '18px', color: '#000' });
    //this.add.text(legendBaseX + 120, legendY + 1, '(Hints shown above bars)', { fontSize: '16px', color: '#666' });

    fetch(`${backendURL}/api/user/${userId}/gameplay-history`)
      .then(res => res.json())
      .then((sessions) => {
        if (!sessions || sessions.length === 0) {
          this.add.text(w / 2, graphY + 100, 'No gameplay data to show', {
            fontSize: '24px',
            color: '#000',
          }).setOrigin(0.5);
          return;
        }

        // Sort sessions by oldest to newest
      // Sort sessions by date (oldest first) if possible, fallback to score
sessions.sort((a, b) => {
  const dateA = new Date(a.timestamp);
  const dateB = new Date(b.timestamp);
  return isNaN(dateA) || isNaN(dateB)
    ? a.score - b.score
    : dateA - dateB;
});

const maxY = Math.max(...sessions.map(s => Math.max(s.score, s.hintsUsed || 0)), 1);
const scaleY = graphHeight / maxY;


const graphMarginX = 120;  // push the whole graph right
const graphMarginY = 180;  // push the whole graph down
const graphWidth = w - 2 * graphMarginX;
const graphHeight = 220;
const barWidth = 30;
const barGap = 30;

const baseY = graphMarginY + graphHeight;  // bottom of the graph
// Y-axis: shifted right
this.add.line(0, 0, graphMarginX, baseY, graphMarginX, graphMarginY, 0x000000).setLineWidth(2);

// X-axis: aligned to graph bottom
this.add.line(0, 0, graphMarginX, baseY, graphMarginX + graphWidth, baseY, 0x000000).setLineWidth(2);
sessions.forEach((session, index) => {
  const groupX = graphMarginX + 20 + index * (2 * barWidth + barGap);
  const scoreHeight = session.score * scaleY;
  const hintHeight = (session.hintsUsed || 0) * scaleY;

  // Score bar (Blue)
  this.add.rectangle(groupX, baseY, barWidth, scoreHeight, 0x3366ff).setOrigin(0, 1);

  // Hint bar (Orange)
  this.add.rectangle(groupX + barWidth, baseY, barWidth, hintHeight, 0xfa821a).setOrigin(0, 1);

  // Label under group
  this.add.text(groupX + barWidth, baseY + 5, `#${index + 1}`, {
    fontSize: '14px',
    color: '#000',
  }).setOrigin(0.5, 0);
});


// Updated legend (Score + Hints)
this.add.rectangle(legendBaseX, legendY, 20, 20, 0x3366ff).setOrigin(0, 0);
this.add.text(legendBaseX + 28, legendY + 1, 'Score', { fontSize: '18px', color: '#000' });

this.add.rectangle(legendBaseX + 100, legendY, 20, 20, 0xfa821a).setOrigin(0, 0);
this.add.text(legendBaseX + 128, legendY + 1, 'Hints Used', { fontSize: '18px', color: '#000' });


        // Average Score
        this.add.text(graphX, graphY + graphHeight + 30, `Average Score: ${avgScore}`, {
          fontSize: '24px',
          color: '#000',
        });

        // Missed Keywords
        this.add.text(graphX + 280, graphY + graphHeight + 30, `Missed Keywords:`, {
          fontSize: '24px',
          color: '#000',
        });

        this.add.text(graphX + 280, graphY + graphHeight + 65, missedKeywords.join(', ') || 'None', {
          fontSize: '20px',
          color: '#333',
          wordWrap: { width: w - graphX - 300 },
        });
      });

    // === Game Maps ===
    const mapsY = h - 230;
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
