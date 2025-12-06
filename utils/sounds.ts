// Sound effects using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.audioContext || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Click sound
  click() {
    this.playTone(800, 0.1, 'sine', 0.2);
  }

  // Success sound
  success() {
    if (!this.audioContext || this.isMuted) return;
    this.playTone(523.25, 0.1, 'sine', 0.3); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.3), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.3), 200); // G5
  }

  // Spin start sound
  spinStart() {
    if (!this.audioContext || this.isMuted) return;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(200 + i * 100, 0.05, 'square', 0.1), i * 30);
    }
  }

  // Spin tick sound (for wheel rotation)
  tick() {
    this.playTone(300, 0.03, 'square', 0.15);
  }

  // Win/celebration sound
  win() {
    if (!this.audioContext || this.isMuted) return;
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C-D-E-G-A-C
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.15, 'sine', 0.25), i * 80);
    });
  }

  // Error/invalid sound
  error() {
    if (!this.audioContext || this.isMuted) return;
    this.playTone(200, 0.1, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(150, 0.2, 'sawtooth', 0.2), 100);
  }

  // Whoosh sound for animations
  whoosh() {
    if (!this.audioContext || this.isMuted) return;
    for (let i = 0; i < 10; i++) {
      setTimeout(() => this.playTone(800 - i * 60, 0.05, 'sine', 0.1), i * 20);
    }
  }

  // Delete sound
  delete() {
    if (!this.audioContext || this.isMuted) return;
    this.playTone(400, 0.05, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(200, 0.1, 'sawtooth', 0.2), 50);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }
}

export const soundEffects = new SoundEffects();
