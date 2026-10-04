/**
 * Web Audio API retro chiptune synthesizer and voice engine for Tetris
 * Includes:
 * - Upbeat 8-bit background music sequencer (Korobeiniki theme)
 * - Celebratory "Ураа!" voice and fanfare sound generator
 * - Sound effects for moves, drops, rotations, combos, and game over
 */

// Musical notes frequencies (Hz)
const NOTE = {
  REST: 0,
  // Bass
  Gs2: 103.83,
  A2: 110.00,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  Gs3: 207.65,
  // Mid
  A3: 220.00,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  Gs4: 415.30,
  // Treble
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  Gs5: 830.61,
  A5: 880.00,
  B5: 987.77,
  C6: 1046.50,
};

// Korobeiniki Melody: [Frequency, duration in 16th steps]
const KOROBEINIKI_MELODY: [number, number][] = [
  // Part 1
  [NOTE.E5, 4], [NOTE.B4, 2], [NOTE.C5, 2], [NOTE.D5, 4], [NOTE.C5, 2], [NOTE.B4, 2],
  [NOTE.A4, 4], [NOTE.A4, 2], [NOTE.C5, 2], [NOTE.E5, 4], [NOTE.D5, 2], [NOTE.C5, 2],
  [NOTE.B4, 6], [NOTE.C5, 2], [NOTE.D5, 4], [NOTE.E5, 4],
  [NOTE.C5, 4], [NOTE.A4, 4], [NOTE.A4, 6], [NOTE.REST, 2],

  // Part 1 repeat
  [NOTE.D5, 4], [NOTE.F5, 2], [NOTE.A5, 4], [NOTE.G5, 2], [NOTE.F5, 2],
  [NOTE.E5, 6], [NOTE.C5, 2], [NOTE.E5, 4], [NOTE.D5, 2], [NOTE.C5, 2],
  [NOTE.B4, 4], [NOTE.B4, 2], [NOTE.C5, 2], [NOTE.D5, 4], [NOTE.E5, 4],
  [NOTE.C5, 4], [NOTE.A4, 4], [NOTE.A4, 6], [NOTE.REST, 2],

  // Part 2 (chorus)
  [NOTE.E4, 8], [NOTE.C4, 8],
  [NOTE.D4, 8], [NOTE.B3, 8],
  [NOTE.C4, 8], [NOTE.A3, 8],
  [NOTE.Gs3, 8], [NOTE.B3, 8],

  [NOTE.E4, 8], [NOTE.C4, 8],
  [NOTE.D4, 8], [NOTE.B3, 8],
  [NOTE.C4, 4], [NOTE.E4, 4], [NOTE.A4, 4], [NOTE.A4, 4],
  [NOTE.Gs4, 8], [NOTE.REST, 8],
];

// Bassline for accompaniment: [Frequency, duration in 16th steps]
const KOROBEINIKI_BASS: [number, number][] = [
  // A minor groove
  [NOTE.E3, 2], [NOTE.REST, 2], [NOTE.B2, 2], [NOTE.REST, 2],
  [NOTE.E3, 2], [NOTE.REST, 2], [NOTE.B2, 2], [NOTE.REST, 2],
  [NOTE.A2, 2], [NOTE.REST, 2], [NOTE.E3, 2], [NOTE.REST, 2],
  [NOTE.A2, 2], [NOTE.REST, 2], [NOTE.E3, 2], [NOTE.REST, 2],

  [NOTE.Gs2 || NOTE.E3, 2], [NOTE.REST, 2], [NOTE.B2, 2], [NOTE.REST, 2],
  [NOTE.E3, 2], [NOTE.REST, 2], [NOTE.B2, 2], [NOTE.REST, 2],
  [NOTE.A2, 2], [NOTE.REST, 2], [NOTE.E3, 2], [NOTE.REST, 2],
  [NOTE.A2, 2], [NOTE.REST, 2], [NOTE.E3, 2], [NOTE.REST, 2],

  // Repeat groove
  [NOTE.D3, 2], [NOTE.REST, 2], [NOTE.A2, 2], [NOTE.REST, 2],
  [NOTE.D3, 2], [NOTE.REST, 2], [NOTE.A2, 2], [NOTE.REST, 2],
  [NOTE.C3, 2], [NOTE.REST, 2], [NOTE.G3, 2], [NOTE.REST, 2],
  [NOTE.C3, 2], [NOTE.REST, 2], [NOTE.G3, 2], [NOTE.REST, 2],

  [NOTE.B2, 2], [NOTE.REST, 2], [NOTE.E3, 2], [NOTE.REST, 2],
  [NOTE.B2, 2], [NOTE.REST, 2], [NOTE.E3, 2], [NOTE.REST, 2],
  [NOTE.A2, 2], [NOTE.REST, 2], [NOTE.E3, 2], [NOTE.REST, 2],
  [NOTE.A2, 2], [NOTE.REST, 2], [NOTE.E3, 2], [NOTE.REST, 2],
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;

  // Music sequencer state
  private isMusicPlaying: boolean = false;
  private musicStepTimeout: number | null = null;
  private melodyIndex: number = 0;
  private bassIndex: number = 0;
  private currentMelodyStepRemaining: number = 0;
  private currentBassStepRemaining: number = 0;
  private tempoBpm: number = 138; // Upbeat cheerful tempo

  constructor() {
    this.isMuted = false;
    this.isMusicMuted = false;
  }

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted) {
      this.stopMusic();
    } else {
      if (this.isMusicPlaying) {
        this.scheduleNextTick();
      }
    }
  }

  public getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  public playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number = 0.1,
    rampToFreq?: number
  ) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), this.ctx.currentTime);
      if (rampToFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, rampToFreq),
          this.ctx.currentTime + duration
        );
      }

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might fail in background
    }
  }

  /* ---------------- Sound Effects ---------------- */

  public playMove() {
    this.playTone(320, 'triangle', 0.04, 0.05);
  }

  public playRotate() {
    this.playTone(520, 'square', 0.06, 0.07, 700);
  }

  public playHold() {
    this.playTone(392, 'sine', 0.08, 0.08, 587);
  }

  public playSoftDrop() {
    this.playTone(190, 'triangle', 0.03, 0.04);
  }

  public playHardDrop() {
    this.playTone(160, 'square', 0.12, 0.14, 50);
  }

  public playFlagMatch() {
    // Sparkling coin / magic sound when identical flags match
    if (this.isMuted) return;
    const notes = [659.25, 880, 1318.51, 1760];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.08, 0.09);
      }, idx * 40);
    });
  }

  public playCoinScore() {
    if (this.isMuted) return;
    this.playTone(987.77, 'sine', 0.09, 0.08, 1318.51);
  }

  public playLineClear(lines: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const baseFreqs =
      lines >= 4
        ? [523.25, 659.25, 783.99, 1046.50, 1318.51] // High C major fanfare
        : lines === 3
        ? [440, 554.37, 659.25, 880] // A major
        : lines === 2
        ? [440, 554.37, 659.25]
        : [523.25, 659.25];

    baseFreqs.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'square', lines >= 4 ? 0.22 : 0.12, 0.12);
      }, i * 65);
    });
  }

  /**
   * Sound played when identical flags extinguish ("окшош желектер өчкөндө")
   * Voice is removed as requested ("голос кереги жок").
   * Plays a crisp rewarding fire arcade chime.
   */
  public playUraaOnly() {
    if (this.isMuted) return;
    this.init();

    // Cancel any speech synthesis if active
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }

    // Play sparkling flame chime tones (musical only, no voice)
    const flameChimes = [587.33, 739.99, 880, 1174.66];
    flameChimes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.2, 0.12, freq * 1.04);
      }, idx * 45);
    });
  }

  /**
   * Fanfare synthesizer when winning points / lines
   * Voice is removed as requested ("голос кереги жок").
   */
  public playUraaVoice(_customText?: string) {
    if (this.isMuted) return;
    this.init();

    // Cancel any speech synthesis if active
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }

    // Synthesize triumphant fanfare notes (musical only, no vocal)
    const fanfareNotes = [523.25, 659.25, 783.99, 1046.50];
    fanfareNotes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'triangle', 0.22, 0.14, f * 1.03);
      }, idx * 55);
    });
  }

  public playLevelUp() {
    if (this.isMuted) return;
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.18, 0.15);
      }, idx * 75);
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.stopMusic();
    const notes = [440, 415, 392, 349, 293, 220];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.25, 0.12);
      }, idx * 100);
    });
  }

  /**
   * Triumphant fanfare when player reaches 10 wins (10 утуш болгондо оюн жеңиш менен аяктайт)
   */
  public playVictory() {
    if (this.isMuted) return;
    this.stopMusic();
    this.init();

    // 1. Grand brass-like fanfare notes
    const fanfare = [
      { freq: 523.25, delay: 0, dur: 0.14 },
      { freq: 523.25, delay: 140, dur: 0.14 },
      { freq: 523.25, delay: 280, dur: 0.14 },
      { freq: 659.25, delay: 420, dur: 0.38 },
      { freq: 587.33, delay: 780, dur: 0.16 },
      { freq: 659.25, delay: 960, dur: 0.16 },
      { freq: 783.99, delay: 1140, dur: 0.55 },
      { freq: 1046.5, delay: 1720, dur: 0.95 },
    ];

    fanfare.forEach((n) => {
      setTimeout(() => {
        this.playTone(n.freq, 'sawtooth', 0.26, n.dur, n.freq * 1.01);
      }, n.delay);
    });
  }

  /* ---------------- Upbeat Background Music (Korobeiniki) ---------------- */

  public startMusic() {
    this.isMusicPlaying = true;
    if (this.isMusicMuted) return;
    this.init();
    if (!this.musicStepTimeout) {
      this.tickMusicStep();
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicStepTimeout) {
      window.clearTimeout(this.musicStepTimeout);
      this.musicStepTimeout = null;
    }
  }

  public pauseMusic() {
    if (this.musicStepTimeout) {
      window.clearTimeout(this.musicStepTimeout);
      this.musicStepTimeout = null;
    }
  }

  public resumeMusic() {
    if (this.isMusicPlaying && !this.isMusicMuted) {
      this.init();
      if (!this.musicStepTimeout) {
        this.tickMusicStep();
      }
    }
  }

  private scheduleNextTick() {
    if (!this.isMusicPlaying || this.isMusicMuted) return;
    const stepDurationMs = (60000 / this.tempoBpm) / 4; // 16th note duration
    this.musicStepTimeout = window.setTimeout(() => {
      this.tickMusicStep();
    }, stepDurationMs);
  }

  private tickMusicStep() {
    if (!this.isMusicPlaying || this.isMusicMuted || !this.ctx) {
      return;
    }

    const stepDurationSec = (60 / this.tempoBpm) / 4;

    // --- Lead Melody ---
    if (this.currentMelodyStepRemaining <= 0) {
      const [freq, durationSteps] = KOROBEINIKI_MELODY[this.melodyIndex];
      this.currentMelodyStepRemaining = durationSteps;
      this.melodyIndex = (this.melodyIndex + 1) % KOROBEINIKI_MELODY.length;

      if (freq > 0 && !this.isMuted) {
        const noteDuration = durationSteps * stepDurationSec * 0.85;
        this.playMusicNote(freq, 'square', noteDuration, 0.045);
      }
    }
    this.currentMelodyStepRemaining -= 1;

    // --- Bassline ---
    if (this.currentBassStepRemaining <= 0) {
      const [bassFreq, bassDurationSteps] = KOROBEINIKI_BASS[this.bassIndex];
      this.currentBassStepRemaining = bassDurationSteps;
      this.bassIndex = (this.bassIndex + 1) % KOROBEINIKI_BASS.length;

      if (bassFreq > 0 && !this.isMuted) {
        const noteDuration = bassDurationSteps * stepDurationSec * 0.9;
        this.playMusicNote(bassFreq, 'triangle', noteDuration, 0.065);
      }
    }
    this.currentBassStepRemaining -= 1;

    this.scheduleNextTick();
  }

  private playMusicNote(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number
  ) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Staccato retro envelope
      const attack = 0.01;
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        this.ctx.currentTime + duration
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio glitches
    }
  }
}

export const sound = new SoundEngine();
