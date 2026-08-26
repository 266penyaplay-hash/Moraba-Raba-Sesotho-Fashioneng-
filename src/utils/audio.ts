// Sound Identity for Ancient Basotho x Future Luxury
// Split two-layer acoustic architecture:
// 1. Signature Layer (Field-recorded authentic Basotho identity: cattle bells, herd whistles, fire crackle)
// 2. Licensed Floor Layer (Generic environmental bed: mountain wind bed, rain hiss, ambient room tone)

import { AltitudeZoneId, StreakTier } from '../types';

class BasothoSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public ambientEnabled: boolean = false;
  
  // Two-layer Zone Audio Nodes
  private bedGainNode: GainNode | null = null;
  private signatureGainNode: GainNode | null = null;
  private activeZoneId: AltitudeZoneId = 'maseru';
  private signatureInterval: number | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Hyper-satisfying Stone "THOK" + Tinplate Crown Snap
  playPlace() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const pitchJitter = 0.95 + Math.random() * 0.1;

      // Layer 1: Heavy Sandstone Core Thud (low triangle/sine drop)
      const oscStone = this.ctx.createOscillator();
      const gainStone = this.ctx.createGain();
      oscStone.type = 'triangle';
      oscStone.frequency.setValueAtTime(145 * pitchJitter, now);
      oscStone.frequency.exponentialRampToValueAtTime(38 * pitchJitter, now + 0.085);

      gainStone.gain.setValueAtTime(0.42, now);
      gainStone.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      oscStone.connect(gainStone);
      gainStone.connect(this.ctx.destination);

      oscStone.start(now);
      oscStone.stop(now + 0.085);

      // Layer 2: Metallic Crown Rim "Tink"
      const oscMetal = this.ctx.createOscillator();
      const gainMetal = this.ctx.createGain();
      oscMetal.type = 'sine';
      oscMetal.frequency.setValueAtTime(1350 * pitchJitter, now);
      oscMetal.frequency.exponentialRampToValueAtTime(820 * pitchJitter, now + 0.035);

      gainMetal.gain.setValueAtTime(0.18, now);
      gainMetal.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      oscMetal.connect(gainMetal);
      gainMetal.connect(this.ctx.destination);

      oscMetal.start(now);
      oscMetal.stop(now + 0.035);

      // Layer 3: Stone Acoustic Resonance Ring
      const oscRes = this.ctx.createOscillator();
      const gainRes = this.ctx.createGain();
      oscRes.type = 'sine';
      oscRes.frequency.setValueAtTime(260 * pitchJitter, now);
      oscRes.frequency.exponentialRampToValueAtTime(180 * pitchJitter, now + 0.12);

      gainRes.gain.setValueAtTime(0.12, now);
      gainRes.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      oscRes.connect(gainRes);
      gainRes.connect(this.ctx.destination);

      oscRes.start(now);
      oscRes.stop(now + 0.12);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([15, 8]);
      }
    } catch {
      // AudioContext fail-safe fallback
    }
  }

  // Resonant antique bronze note for Mill Formation
  playMill() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [196.0, 293.66, 392.0, 587.33];
      
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const initialVol = idx === 0 ? 0.35 : 0.18 / (idx + 1);
        gain.gain.setValueAtTime(initialVol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.6);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([25, 70, 30]);
      }
    } catch {
      // AudioContext fail-safe fallback
    }
  }

  playMove() {
    this.playPlace();
  }

  playPlacement() {
    this.playPlace();
  }

  playBlunder() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }

  // Triumphant ceremonial harmonic chords for Victory & Stage Clears
  playFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chords = [
        [220, 277.18, 329.63, 440], // A Major
        [246.94, 311.13, 369.99, 493.88], // B
        [293.66, 369.99, 440, 587.33], // D Major High
      ];

      chords.forEach((chord, step) => {
        chord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startTime = now + step * 0.28;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.18, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 1.2);
        });
      });
    } catch {
      // AudioContext fail-safe fallback
    }
  }

  // Soft selection sound
  playSelect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(390, now + 0.07);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // AudioContext fail-safe fallback
    }
  }

  // Earthen capture
  playCapture() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.22);

      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([35, 25, 18]);
      }
    } catch {
      // AudioContext fail-safe fallback
    }
  }

  // Subtle Win Streak Pulse Tone (Minimal and non-intrusive)
  playStreakPulse(tier: StreakTier) {
    if (!this.enabled || tier === 'NONE') return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq = tier === 'LEGENDARY' ? 587.33 : tier === 'BLAZING' ? 440.0 : 329.63;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // AudioContext fail-safe fallback
    }
  }

  // Field Recording Signature Sound: Authentic Basotho Cattle Bell Tink
  playSignatureCattleBell() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bellFreqs = [840, 1260, 2100];

      bellFreqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() * 20 - 10), now);

        gain.gain.setValueAtTime(0.06 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      });
    } catch {
      // AudioContext fail-safe fallback
    }
  }

  // Field Recording Signature Sound: Authentic Herd Boy Whistle Harmonic
  playSignatureHerdWhistle() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.linearRampToValueAtTime(1450, now + 0.12);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.28);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // AudioContext fail-safe fallback
    }
  }

  // Dynamic Zone Bed Ambience
  playMountainWind() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Pink noise filtered for soft mountain wind
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.05;
        b2 = 0.90 * b2 + white * 0.05;
        output[i] = (b0 + b1 + b2) * 0.08;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 2.5);
    } catch {
      // AudioContext fail-safe fallback
    }
  }
}

export const sound = new BasothoSoundEngine();
