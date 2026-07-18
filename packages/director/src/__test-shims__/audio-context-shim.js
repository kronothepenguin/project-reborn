// Test shim: minimal Web Audio API mock for vitest/jsdom (research.md R8).
// jsdom does not implement AudioContext (especially inside a Worker scope).
// Provides the node graph surface (`createGain`, `createStereoPanner`, …) and
// `decodeAudioData` so SoundChannel/Sound/SoundMember tests can exercise wiring.

export class MockAudioParam {
  constructor() {
    this.value = 0;
    this.minValue = -3.4028234663852886e38;
    this.maxValue = 3.4028234663852886e38;
    this.defaultValue = 0;
  }
  setValueAtTime(value) {
    this.value = value;
  }
  linearRampToValueAtTime(value) {
    this.value = value;
  }
  exponentialRampToValueAtTime(value) {
    this.value = value;
  }
  cancelScheduledValues() {}
}

export class MockAudioNode extends EventTarget {
  constructor() {
    super();
    this.numberOfInputs = 1;
    this.numberOfOutputs = 1;
    this.gain = new MockAudioParam();
    this.pan = new MockAudioParam();
    this.frequency = new MockAudioParam();
  }
  connect(destination) {
    return destination;
  }
  disconnect() {}
  start() {}
  stop() {}
}

export class MockAudioBuffer {
  constructor(numberOfChannels = 1, length = 0, sampleRate = 44100) {
    this.numberOfChannels = numberOfChannels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
    this._channels = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
  }
  getChannelData(c) {
    return this._channels[c] ?? new Float32Array(0);
  }
  copyFromChannel() {}
  copyToChannel() {}
}

export class MockAudioContext extends EventTarget {
  constructor() {
    super();
    this.sampleRate = 44100;
    this.state = "running";
    this.currentTime = 0;
    this.destination = new MockAudioNode();
    this.listener = new MockAudioNode();
    this._closed = false;
    this._suspended = false;
  }
  createBuffer(numberOfChannels, length, sampleRate) {
    return new MockAudioBuffer(numberOfChannels, length, sampleRate);
  }
  createBufferSource() {
    return new MockAudioNode();
  }
  createGain() {
    return new MockAudioNode();
  }
  createStereoPanner() {
    return new MockAudioNode();
  }
  createDynamicsCompressor() {
    return new MockAudioNode();
  }
  createAnalyser() {
    return new MockAudioNode();
  }
  createOscillator() {
    return new MockAudioNode();
  }
  decodeAudioData(data) {
    return Promise.resolve(this.createBuffer(1, 0, this.sampleRate));
  }
  suspend() {
    this._suspended = true;
    return Promise.resolve();
  }
  resume() {
    this._suspended = false;
    this.state = "running";
    return Promise.resolve();
  }
  close() {
    this._closed = true;
    this.state = "closed";
    return Promise.resolve();
  }
}

export function installAudioContextShim(target = globalThis) {
  const Ctor = target.AudioContext ?? MockAudioContext;
  if (!target.AudioContext || target.AudioContext.__isMock) {
    target.AudioContext = MockAudioContext;
    target.AudioContext.__isMock = true;
  }
  if (!target.webkitAudioContext) target.webkitAudioContext = MockAudioContext;
  if (!target.OfflineAudioContext || target.OfflineAudioContext.__isMock) {
    target.OfflineAudioContext = MockAudioContext;
    target.OfflineAudioContext.__isMock = true;
  }
  return target.AudioContext;
}