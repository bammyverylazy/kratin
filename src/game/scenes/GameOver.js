// GameOver.js
import { Scene } from 'phaser';

const backendURL = 'https://cellvivor-backend.onrender.com'; 

export class GameOver extends Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.score = data.score || 0;
    this.results = data.results || []; // Array of { word, result }
    this.userId = data.userId || null; // ต้องส่ง userId มาด้วยตอนเปลี่ยนฉาก
  }

  create() {
    this.cameras.main.setBackgroundColor('#333');
     const arrow = this.add.text(60, 90, '<', {
            fontSize: '48px', color: '#ffffffff', align: 'Left'
        }).setOrigin(0.5).setDepth(200).setInteractive();

        arrow.on('pointerdown', () => {
            this.scene.stop();    
            this.children.removeAll(); 
            this.scene.start('Mode');
        });

    this.add.text(512, 100, 'Game Over', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(512, 180, `Final Score: ${this.score}`, {
      fontSize: '40px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.add.text(512, 250, 'Keywords Played:', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    let startY = 300;
    const rowHeight = 36;

    if (this.results.length === 0) {
      this.add.text(512, startY, 'No rounds played.', {
        fontSize: '24px',
        color: '#ffcc00'
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

    // แสดงคำผิดที่ควรทบทวน
    const wrongKeywords = this.results
      .filter(r => r.result === 'FF' || r.result === 'FT')
      .map(r => r.word);

    if (wrongKeywords.length > 0) {
      this.add.text(512, startY + this.results.length * rowHeight + 30,
        `Words to review: ${wrongKeywords.join(', ')}`, {
          fontSize: '22px',
          color: '#ff4d4d',
          wordWrap: { width: 800 }
        }).setOrigin(0.5);
    }

    this.add.text(512, 600, 'Click to Navigate to Dashboard', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // เรียกอัปเดต weakness ใน DB
    this.updateWeakness(this.userId, wrongKeywords);

    this.input.once('pointerdown', () => {
      this.scene.start('Dashboard');
    });
  }

  async updateWeakness(userId, wrongWords) {
    if (!userId || wrongWords.length === 0) return;

    try {
      const res = await fetch(`${backendURL}/api/users/${userId}/add-weakness`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newWeakness: wrongWords }),
      });
      const data = await res.json();
      if (data.success) {
        console.log('Weakness updated successfully:', data.weakness);
      } else {
        console.warn('Failed to update weakness:', data);
      }
    } catch (err) {
      console.error('Error updating weakness:', err);
    }
  }
}
