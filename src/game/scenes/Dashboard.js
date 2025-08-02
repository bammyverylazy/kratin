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

  // Fetch gameplay history for graph
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

      // Graph positioning
      const graphX = 100;
      const graphY = h * 0.3;
      const maxHeight = 250;
      const barWidth = 30;
      const barGap = 15;

      // Title
      this.add.text(graphX + (sessions.length * (barWidth + barGap)) / 2, graphY - 40, 'Recent Game Scores & Hints Used', {
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#000',
      }).setOrigin(0.5, 0.5);

      // Find max score and hintsUsed for scaling
      const maxScore = Math.max(...sessions.map(s => s.score));
      const maxHints = Math.max(...sessions.map(s => s.hintsUsed));
      const scaleScore = maxScore > 0 ? maxHeight / maxScore : 0;
      const scaleHints = maxHints > 0 ? maxHeight / maxHints : 0;

      sessions.forEach((session, index) => {
        const x = graphX + index * (barWidth * 2 + barGap * 3);

        // Draw score bar (blue)
        const scoreHeight = session.score * scaleScore;
        this.add.rectangle(x, graphY + maxHeight - scoreHeight, barWidth, scoreHeight, 0x3366ff).setOrigin(0, 1);

        // Draw hintsUsed bar (orange), right beside score bar
        const hintsHeight = session.hintsUsed * scaleHints;
        this.add.rectangle(x + barWidth + barGap, graphY + maxHeight - hintsHeight, barWidth, hintsHeight, 0xff9933).setOrigin(0, 1);

        // Score label on top of score bar
        this.add.text(x + barWidth / 2, graphY + maxHeight - scoreHeight - 10, session.score.toString(), {
          fontSize: '14px',
          color: '#000',
        }).setOrigin(0.5, 1);

        // Hints label on top of hints bar
        this.add.text(x + barWidth + barGap + barWidth / 2, graphY + maxHeight - hintsHeight - 10, session.hintsUsed.toString(), {
          fontSize: '14px',
          color: '#000',
        }).setOrigin(0.5, 1);

        // Date label below bars
        const dateStr = new Date(session.timestamp).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
        this.add.text(x + barWidth, graphY + maxHeight + 10, dateStr, {
          fontSize: '12px',
          color: '#000',
          align: 'center',
        }).setOrigin(0.5, 0);
      });
    })
    .catch((err) => {
      console.error('Error fetching gameplay history:', err);
      this.add.text(w / 2, h / 2, 'Failed to load gameplay data', {
        fontSize: '24px',
        color: '#f00',
      }).setOrigin(0.5);
    });
}

}