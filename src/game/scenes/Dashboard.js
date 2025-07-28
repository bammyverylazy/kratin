import { Scene } from 'phaser';
const backendURL = import.meta.env.VITE_BACKEND_URL;

export class Dashboard extends Scene {
  constructor() {
    super('Dashboard');
  }

  preload() {
    this.load.image('chapter1', '/assets/chapter1.png');
    this.load.image('chapter2', '/assets/chapter2.png');
    this.load.image('chapter3', '/assets/chapter3.png');
    this.load.image('chapter4', '/assets/chapter4.png');
  }

  async create() {
    this.cameras.main.setBackgroundColor('#E8F7FF');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userId = currentUser?._id;
    if (!userId) {
      this.add.text(512, 360, 'User not logged in', { fontSize: '32px', color: '#000' }).setOrigin(0.5);
      return;
    }

    // Title
    this.add.text(512, 40, '📊 Performance Dashboard', {
      fontSize: '38px',
      color: '#000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ========== [TOP LEFT] Graph Display ==========
    const graphBox = this.add.rectangle(256, 220, 460, 300, 0xffffff).setStrokeStyle(2, 0xcccccc);
    this.add.text(70, 90, '📈 Score & Hint Usage', { fontSize: '24px', color: '#000' });

    const graphData = await fetch(`${backendURL}/api/user/${userId}/gameplay-history`).then(res => res.json());

    const baseX = 80;
    const baseY = 320;
    const barWidth = 30;
    const gap = 40;

    graphData.forEach((entry, i) => {
      const x = baseX + i * gap;
      const score = entry.score || 0;
      const hint = entry.hintUsed || 0;
      const avgTime = Math.floor(entry.avgTime || 0);

      this.add.rectangle(x, baseY, barWidth, -score * 3, 0x4BC6F0).setOrigin(0, 1); // Score bar
      this.add.rectangle(x + 15, baseY, barWidth / 2, -hint * 10, 0xFF7171).setOrigin(0, 1); // Hint bar

      this.add.text(x, baseY + 10, `${avgTime}s`, { fontSize: '12px', color: '#000' }).setOrigin(0, 0);
    });

    // ========== [TOP RIGHT] Weakness List ==========
    const listBox = this.add.rectangle(760, 220, 460, 300, 0xffffff).setStrokeStyle(2, 0xcccccc);
    this.add.text(580, 90, '❌ Missed Words', { fontSize: '24px', color: '#000' });

    const userData = await fetch(`${backendURL}/users/${userId}`).then(res => res.json());
    const missed = userData.weakness || [];

    missed.slice(0, 12).forEach((item, i) => {
      this.add.text(580, 130 + i * 22, `- ${item}`, { fontSize: '18px', color: '#000' });
    });

    // ========== [BOTTOM] Chapter Roadmap ==========
    this.add.text(512, 500, '📘 Chapter Roadmap', { fontSize: '28px', color: '#000' }).setOrigin(0.5);

    const chapterImages = ['chapter1', 'chapter2', 'chapter3', 'chapter4'];
    const chapterNames = ['Chapter1Intro', 'Chapter2Intro', 'Chapter3Intro', 'Chapter4Intro'];

    chapterImages.forEach((key, i) => {
      const x = 220 + i * 200;
      const img = this.add.image(x, 580, key).setDisplaySize(160, 90).setInteractive({ useHandCursor: true });
      img.on('pointerdown', () => this.scene.start(chapterNames[i]));
    });

    // ========== [GAME MODE BUTTON] ==========
    const playBtn = this.add.rectangle(890, 50, 200, 50, 0x6067FE).setInteractive({ useHandCursor: true });
    this.add.text(890, 50, '🎮 Game Mode', {
      fontSize: '22px',
      color: '#fff'
    }).setOrigin(0.5);

    playBtn.on('pointerdown', () => this.scene.start('Mode'));
  }
}
