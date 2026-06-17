export class SoundRef {
  #soundEnabled = true;

  get soundEnabled() {
    return this.#soundEnabled;
  }

  set soundEnabled(value) {
    this.#soundEnabled = Boolean(value);
  }

  beep() {
    if (!this.#soundEnabled) return;
    const ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "square";
    gain.gain.value = 0.3;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
    oscillator.onended = () => ctx.close();
  }
}

export const _sound = new SoundRef();
