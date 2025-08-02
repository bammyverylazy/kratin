export default class VoiceNarratorManager {
  constructor(scene) {
    this.scene = scene;
    this.currentSound = null;
  }

  play(audioKey) {
    if (!audioKey) return;

    // Stop current sound if needed
    this.stop();

    const volume = parseFloat(localStorage.getItem('voiceVolume') || '1');

    if (this.scene.cache.audio.exists(audioKey)) {
      this.currentSound = this.scene.sound.add(audioKey, { volume });
      this.currentSound.play();
    } else {
      console.warn(`VoiceNarratorManager: Audio not loaded: ${audioKey}`);

      this.scene.load.audio(audioKey, `/assets/audio/chapter1/${audioKey}.mp3`);
      this.scene.load.once(`filecomplete-audio-${audioKey}`, () => {
        this.currentSound = this.scene.sound.add(audioKey, { volume });
        this.currentSound.play();
      });
      this.scene.load.start();
    }
  }

  stop() {
    if (this.currentSound) {
      if (this.currentSound.isPlaying) {
        this.currentSound.stop();
      }
      this.currentSound.destroy();
      this.currentSound = null;
    }
  }

  reset() {
    this.stop();
  }
}
