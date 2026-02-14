"use client";

// Arcade Sound Manager — Web Audio API
// Uses generated tones as placeholders until we add real sound packs

class ArcadeSoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  setEnabled(v: boolean) {
    this.enabled = v;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  private playTone(freq: number, duration: number, type: OscillatorType = "square", ramp = false) {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = this.volume * 0.3;
      if (ramp) {
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(freq * 2, ctx.currentTime + duration);
      }
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available
    }
  }

  coinInsert() {
    this.playTone(988, 0.1, "square");
    setTimeout(() => this.playTone(1319, 0.3, "square"), 100);
  }

  characterHover() {
    this.playTone(440, 0.05, "sine");
  }

  characterSelect() {
    this.playTone(523, 0.1, "square");
    setTimeout(() => this.playTone(659, 0.1, "square"), 80);
    setTimeout(() => this.playTone(784, 0.1, "square"), 160);
    setTimeout(() => this.playTone(1047, 0.2, "square"), 240);
  }

  characterDeselect() {
    this.playTone(523, 0.15, "square");
    setTimeout(() => this.playTone(392, 0.2, "square"), 100);
  }

  sliderClick() {
    this.playTone(800, 0.03, "square");
  }

  buttonClick() {
    this.playTone(660, 0.06, "square");
  }

  stageTransition() {
    this.playTone(262, 0.1, "square");
    setTimeout(() => this.playTone(330, 0.1, "square"), 100);
    setTimeout(() => this.playTone(392, 0.1, "square"), 200);
    setTimeout(() => this.playTone(523, 0.3, "square"), 300);
  }

  deployCountdown() {
    this.playTone(440, 0.15, "square");
  }

  deploySuccess() {
    // Victory fanfare
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, "square"), i * 120);
    });
  }

  error() {
    this.playTone(200, 0.1, "sawtooth");
    setTimeout(() => this.playTone(150, 0.2, "sawtooth"), 100);
  }

  powerUp() {
    this.playTone(300, 0.5, "square", true);
  }

  levelUp() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, "square"), i * 150);
    });
  }
}

// Singleton
export const arcadeSound = typeof window !== "undefined" ? new ArcadeSoundManager() : null;
