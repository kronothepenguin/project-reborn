import { SoundChannelObject } from "./sound-channel.js";

export class SoundObject {
  #soundEnabled = true;
  #soundDevice = "";
  #soundDeviceList = [];
  #soundKeepDevice = true;
  #soundLevel = 256;
  #soundMixMedia = true;
  #channels = new Map();

  get soundEnabled() {
    return this.#soundEnabled;
  }

  set soundEnabled(value) {
    this.#soundEnabled = Boolean(value);
  }

  get soundDevice() {
    return this.#soundDevice;
  }

  set soundDevice(value) {
    this.#soundDevice = String(value ?? "");
  }

  get soundDeviceList() {
    return this.#soundDeviceList;
  }

  set soundDeviceList(value) {
    this.#soundDeviceList = Array.isArray(value) ? value : [];
  }

  get soundKeepDevice() {
    return this.#soundKeepDevice;
  }

  set soundKeepDevice(value) {
    this.#soundKeepDevice = Boolean(value);
  }

  get soundLevel() {
    return this.#soundLevel;
  }

  set soundLevel(value) {
    this.#soundLevel = Number(value);
  }

  get soundMixMedia() {
    return this.#soundMixMedia;
  }

  set soundMixMedia(value) {
    this.#soundMixMedia = Boolean(value);
  }

  beep() {
    if (!this.#soundEnabled) return;
    const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
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

  channel(channelNumber) {
    const key = Number(channelNumber);
    if (!this.#channels.has(key)) {
      this.#channels.set(key, new SoundChannelObject(key));
    }
    return this.#channels.get(key);
  }
}
