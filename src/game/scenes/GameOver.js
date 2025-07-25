// GameOver.js
import { Scene } from 'phaser';

export class GameOver extends Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.score = data.score || 0;
    this.results = data.results || []; // Array of { word, result }
  }

  create() {
    this.cameras.main.setBackgroundColor('#333');

    this.add.text(512, 100, 'Game Over', {
      fontSize: '64px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(512, 180, `Final Score: ${this.score}`, {
      fontSize: '40px', color: '#00ff00'
    }).setOrigin(0.5);

    this.add.text(512, 250, 'Keywords Played:', {
      fontSize: '32px', color: '#ffffff'
    }).setOrigin(0.5);

    let startY = 300;
    const rowHeight = 36;

    if (this.results.length === 0) {
      this.add.text(512, startY, 'No rounds played.', {
        fontSize: '24px', color: '#ffcc00'
      }).setOrigin(0.5);
    } else {
      this.results.forEach((entry, index) => {
        const displayText = `Keyword: ${entry.word} — ${
          entry.result === 'TT' || entry.result === 'FT' ? '✔ Correct' : '✘ Wrong'
        }`;

        this.add.text(512, startY + index * rowHeight, displayText, {
          fontSize: '24px',
          color: entry.result === 'TT' || entry.result === 'FT' ? '#00ff00' : '#ff4d4d'
        }).setOrigin(0.5);
      });
    }

    this.add.text(512, 600, 'Click to return to main menu', {
      fontSize: '24px', color: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('MainMenu');
    });
  }
}
