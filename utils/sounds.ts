// Sound effects using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;
  private backgroundMusicGain: GainNode | null = null;
  private isPlayingMusic: boolean = false;
  private musicIntervalId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.audioContext) {
        this.backgroundMusicGain = this.audioContext.createGain();
        this.backgroundMusicGain.connect(this.audioContext.destination);
        this.backgroundMusicGain.gain.value = 0.15; // Low volume for background music
      }
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3, startTime: number = 0) {
    if (!this.audioContext || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const now = this.audioContext.currentTime + startTime;
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Play note with harmony (adds warmth)
  private playChord(frequencies: number[], duration: number, volume: number = 0.2, startTime: number = 0) {
    if (!this.audioContext || this.isMuted || !this.backgroundMusicGain) return;

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.backgroundMusicGain!);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const now = this.audioContext!.currentTime + startTime;
      // Reduce volume for harmonies
      const harmonyVolume = index === 0 ? volume : volume * 0.5;
      gainNode.gain.setValueAtTime(harmonyVolume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  }

  // Silent Night melody (warmer, slower)
  private playSilentNight() {
    if (!this.audioContext || this.isMuted || !this.backgroundMusicGain) return;

    const melody = [
      // Silent Night, Holy Night
      { notes: [783.99], duration: 0.6 }, // G
      { notes: [880.00], duration: 0.3 }, // A
      { notes: [783.99], duration: 0.3 }, // G
      { notes: [659.25], duration: 0.9 }, // E
      { notes: [783.99], duration: 0.6 }, // G
      { notes: [880.00], duration: 0.3 }, // A
      { notes: [783.99], duration: 0.3 }, // G
      { notes: [659.25], duration: 0.9 }, // E
      { notes: [1046.50], duration: 0.6 }, // C
      { notes: [1046.50], duration: 0.3 }, // C
      { notes: [987.77], duration: 0.9 }, // B
      { notes: [880.00], duration: 0.6 }, // A
      { notes: [880.00], duration: 0.3 }, // A
      { notes: [783.99], duration: 0.9 }, // G
    ];

    let time = 0;
    melody.forEach(({ notes, duration }) => {
      // Add harmony (thirds and fifths)
      const harmony = [
        notes[0],
        notes[0] * 1.25, // Major third
        notes[0] * 1.5   // Perfect fifth
      ];
      this.playChord(harmony, duration, 0.08, time);
      time += duration + 0.1;
    });

    return time;
  }

  // Jingle Bells melody with harmony
  private playJingleBells() {
    if (!this.audioContext || this.isMuted || !this.backgroundMusicGain) return;

    const melody = [
      { note: 659.25, duration: 0.3 }, // E
      { note: 659.25, duration: 0.3 }, // E
      { note: 659.25, duration: 0.6 }, // E
      { note: 659.25, duration: 0.3 }, // E
      { note: 659.25, duration: 0.3 }, // E
      { note: 659.25, duration: 0.6 }, // E
      { note: 659.25, duration: 0.3 }, // E
      { note: 783.99, duration: 0.3 }, // G
      { note: 523.25, duration: 0.4 }, // C
      { note: 587.33, duration: 0.3 }, // D
      { note: 659.25, duration: 0.9 }, // E
    ];

    let time = 0;
    melody.forEach(({ note, duration }) => {
      // Add harmony
      const harmony = [note, note * 1.25, note * 1.5];
      this.playChord(harmony, duration, 0.08, time);
      time += duration + 0.05;
    });

    return time;
  }

  // We Wish You a Merry Christmas
  private playMerryChristmas() {
    if (!this.audioContext || this.isMuted || !this.backgroundMusicGain) return;

    const melody = [
      { note: 523.25, duration: 0.3 }, // C
      { note: 587.33, duration: 0.3 }, // D
      { note: 587.33, duration: 0.3 }, // D
      { note: 659.25, duration: 0.3 }, // E
      { note: 587.33, duration: 0.3 }, // D
      { note: 523.25, duration: 0.3 }, // C
      { note: 523.25, duration: 0.3 }, // C
      { note: 523.25, duration: 0.3 }, // C
      { note: 659.25, duration: 0.3 }, // E
      { note: 783.99, duration: 0.3 }, // G
      { note: 880.00, duration: 0.3 }, // A
      { note: 880.00, duration: 0.3 }, // A
      { note: 880.00, duration: 0.3 }, // A
      { note: 783.99, duration: 0.6 }, // G
    ];

    let time = 0;
    melody.forEach(({ note, duration }) => {
      const harmony = [note, note * 1.25, note * 1.5];
      this.playChord(harmony, duration, 0.08, time);
      time += duration + 0.05;
    });

    return time;
  }

  // Start background music
  startBackgroundMusic() {
    if (this.isPlayingMusic || this.isMuted) return;
    this.isPlayingMusic = true;

    let songIndex = 0;
    const songs = [
      () => this.playSilentNight(),
      () => this.playJingleBells(),
      () => this.playMerryChristmas(),
    ];

    const playLoop = () => {
      const duration = songs[songIndex]();
      songIndex = (songIndex + 1) % songs.length; // Cycle through songs
      
      if (this.isPlayingMusic) {
        this.musicIntervalId = window.setTimeout(playLoop, (duration! + 3) * 1000); // Pause between songs
      }
    };

    playLoop();
  }

  // Stop background music
  stopBackgroundMusic() {
    this.isPlayingMusic = false;
    if (this.musicIntervalId) {
      clearTimeout(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  // Christmas bell sound
  christmasBell() {
    if (this.isMuted) return;
    this.playTone(1046.50, 0.3, 'sine', 0.4, 0); // C6
    this.playTone(1318.51, 0.3, 'sine', 0.3, 0.15); // E6
    this.playTone(1567.98, 0.4, 'sine', 0.3, 0.3); // G6
  }

  // Magical sparkle sound
  sparkle() {
    if (this.isMuted) return;
    const notes = [1046.50, 1318.51, 1567.98, 2093.00]; // C-E-G-C
    notes.forEach((note, i) => {
      this.playTone(note, 0.1, 'sine', 0.15, i * 0.05);
    });
  }

  // Ho ho ho sound
  hohoho() {
    if (this.isMuted) return;
    this.playTone(200, 0.15, 'sawtooth', 0.3, 0);
    this.playTone(200, 0.15, 'sawtooth', 0.3, 0.25);
    this.playTone(200, 0.2, 'sawtooth', 0.3, 0.5);
  }

  // Click sound with jingle
  click() {
    this.playTone(800, 0.08, 'sine', 0.2);
    this.playTone(1000, 0.06, 'sine', 0.15, 0.05);
  }

  // Success sound - Christmas chime
  success() {
    if (!this.audioContext || this.isMuted) return;
    this.christmasBell();
    setTimeout(() => this.sparkle(), 200);
  }

  // Spin start sound - sleigh bells
  spinStart() {
    if (!this.audioContext || this.isMuted) return;
    const bells = [1046.50, 1318.51, 1567.98, 1318.51, 1046.50];
    bells.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.08, 'sine', 0.2), i * 40);
    });
  }

  // Tick sound - small bell
  tick() {
    this.playTone(1567.98, 0.02, 'sine', 0.12);
  }

  // Win/celebration sound - full Christmas melody
  win() {
    if (!this.audioContext || this.isMuted) return;
    this.hohoho();
    setTimeout(() => {
      const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 783.99, 1046.50]; 
      notes.forEach((note, i) => {
        setTimeout(() => this.playTone(note, 0.15, 'sine', 0.25), i * 80);
      });
    }, 500);
  }

  // Error/invalid sound
  error() {
    if (!this.audioContext || this.isMuted) return;
    this.playTone(200, 0.1, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(150, 0.2, 'sawtooth', 0.2), 100);
  }

  // Whoosh sound for animations - magical
  whoosh() {
    if (!this.audioContext || this.isMuted) return;
    for (let i = 0; i < 15; i++) {
      setTimeout(() => this.playTone(1200 - i * 60, 0.04, 'sine', 0.12), i * 15);
    }
    setTimeout(() => this.sparkle(), 150);
  }

  // Delete sound
  delete() {
    if (!this.audioContext || this.isMuted) return;
    this.playTone(400, 0.05, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(200, 0.1, 'sawtooth', 0.2), 50);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  getIsPlayingMusic() {
    return this.isPlayingMusic;
  }
}

export const soundEffects = new SoundEffects();
