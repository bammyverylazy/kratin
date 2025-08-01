export default class VoiceNarratorManager {
  constructor(scene) {
    this.scene = scene;
    this.playedKeys = new Set();
    this.currentSound = null;
  }

  play(audioKey) {
    if (!audioKey) return;

    // หยุดเสียงก่อนหน้า ถ้ามี
    if (this.currentSound && this.currentSound.isPlaying) {
      this.currentSound.stop();
    }

    // ถ้าเคยเล่นแล้ว — ข้าม
    if (this.playedKeys.has(audioKey)) return;

    // ถ้าเสียงนี้โหลดอยู่
    if (this.scene.sound.get(audioKey)) {
      this.currentSound = this.scene.sound.add(audioKey);
      this.currentSound.play();
      this.playedKeys.add(audioKey);
    } else {
      console.warn(`VoiceNarratorManager: Sound not found: ${audioKey}`);
    }
  }

  stop() {
    if (this.currentSound && this.currentSound.isPlaying) {
      this.currentSound.stop();
    }
  }

  reset() {
    this.playedKeys.clear();
    this.stop();
  }
}
