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

  showTooltip(text, x, y) {
    if (this.tooltipText) this.tooltipText.destroy();
    this.tooltipText = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#000a',
      padding: { left: 8, right: 8, top: 4, bottom: 4 },
      align: 'center',
      wordWrap: { width: 200 }
    }).setDepth(300).setOrigin(0.5);
  }

  hideTooltip() {
    if (this.tooltipText) {
      this.tooltipText.destroy();
      this.tooltipText = null;
    }
  }

  async create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.main.setBackgroundColor('#fa821a');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userId = currentUser?._id;
    if (!userId) {
      this.add.text(w / 2, h / 2, 'User not logged in', { fontSize: '32px', color: '#000' }).setOrigin(0.5);
      return;
    }

    // === Header ===
    const headerY = h * 0.1;
    const headerText = this.add.text(w / 2, headerY, 'Dashboard', {
      fontSize: '68px',
      color: '#fff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(100);

    const starOffsetX = 226;
    this.add.image(headerText.x - starOffsetX, headerY, 'star').setOrigin(0.5).setScale(0.13).setDepth(101);
    this.add.image(headerText.x + starOffsetX, headerY, 'star').setOrigin(0.5).setScale(0.13).setDepth(101);

    // === Graph Box ===
    this.add.rectangle(w * 0.25, h * 0.35, 460, 300, 0xffffff).setStrokeStyle(2, 0xcccccc);
    this.add.text(w * 0.07, h * 0.18, '📈 Score & Hint Usage', { fontSize: '24px', color: '#000' });

    // === Graph Legend ===
    this.add.rectangle(w * 0.07, h * 0.57, 20, 20, 0x4BC6F0); // Score
    this.add.text(w * 0.07 + 30, h * 0.57, 'Score', { fontSize: '18px', color: '#000' });
    this.add.rectangle(w * 0.07 + 100, h * 0.57, 20, 20, 0xFF7171); // Hints
    this.add.text(w * 0.07 + 130, h * 0.57, 'Hints Used', { fontSize: '18px', color: '#000' });

    let graphData = [];
    try {
      const res = await fetch(`${backendURL}/api/user/${userId}/gameplay-history`);
      graphData = await res.json();
    } catch (err) {
      console.error('Gameplay history error:', err);
    }

    const baseX = w * 0.07;
    const baseY = h * 0.43;
    const barWidth = 30;
    const gap = 40;

    graphData.forEach((entry, i) => {
      const x = baseX + i * gap;
      const score = entry.score || 0;
      const hint = entry.hintUsed || 0;
      const avgTime = Math.floor(entry.avgTime || 0);

      this.add.rectangle(x, baseY, barWidth, -score * 3, 0x4BC6F0).setOrigin(0, 1);
      this.add.rectangle(x + 15, baseY, barWidth / 2, -hint * 10, 0xFF7171).setOrigin(0, 1);
      this.add.text(x, baseY + 10, `${avgTime}s`, { fontSize: '12px', color: '#000' }).setOrigin(0, 0);
    });

    // === Weakness List ===
    this.add.rectangle(w * 0.75, h * 0.35, 460, 300, 0xffffff).setStrokeStyle(2, 0xcccccc);
    this.add.text(w * 0.58, h * 0.18, '❌ Missed Words', { fontSize: '24px', color: '#000' });

    let userData = {};
    try {
      const res = await fetch(`${backendURL}/users/${userId}`);
      userData = await res.json();
    } catch (err) {
      console.error('User data error:', err);
    }

    const missed = userData.weakness || [];
    missed.slice(0, 12).forEach((item, i) => {
      const color = item.startsWith('TT') ? '#FF5555' : '#555555';
      this.add.text(w * 0.58, h * 0.22 + i * 22, `- ${item}`, { fontSize: '18px', color });
    });

    // === Chapter Roadmap ===
    this.add.text(w / 2, h * 0.7, '📘 Chapter Roadmap', { fontSize: '28px', color: '#000' }).setOrigin(0.5);

    const chapterEntries = [
      { type: 'image', key: 'Chapter1scene1', scene: 'Chapter1Intro', desc: 'Learn about the circulatory system basics.' },
      { type: 'video', key: 'Chapter2scene1', scene: 'Chapter2Intro', desc: 'Explore the heart and blood vessels.' },
      { type: 'image', key: 'Chapter3scene1', scene: 'Chapter3Intro', desc: 'Understand oxygen transport.' },
      { type: 'video', key: 'Chapter4scene1', scene: 'Chapter4Intro', desc: 'Master the rhythm of the heartbeat.' },
    ];

    chapterEntries.forEach((entry, i) => {
      const x = w * 0.2 + i * (w * 0.2);
      const y = h * 0.78;

      if (entry.type === 'image') {
        const img = this.add.image(x, y, entry.key).setDisplaySize(160, 90).setInteractive({ useHandCursor: true });
        img.on('pointerover', () => {
          img.setScale(1.05);
          this.showTooltip(entry.desc, x, y - 70);
        });
        img.on('pointerout', () => {
          img.setScale(1);
          this.hideTooltip();
        });
        img.on('pointerdown', () => this.scene.start(entry.scene));
      } else {
        const vid = this.add.video(x, y, entry.key).setDisplaySize(160, 90).setInteractive({ useHandCursor: true });
        vid.setLoop(true).setMute(true).play(true);
        vid.on('pointerover', () => {
          vid.setScale(1.05);
          this.showTooltip(entry.desc, x, y - 70);
        });
        vid.on('pointerout', () => {
          vid.setScale(1);
          this.hideTooltip();
        });
        vid.on('pointerdown', () => this.scene.start(entry.scene));
      }
    });

    // === Game Mode Button ===
    const playBtn = this.add.rectangle(w - 120, 50, 200, 50, 0x6067FE).setInteractive({ useHandCursor: true });
    this.add.text(w - 120, 50, '🎮 Game Mode', {
      fontSize: '22px',
      color: '#fff'
    }).setOrigin(0.5);

    playBtn.on('pointerdown', () => this.scene.start('Mode'));
  }
}
