export class SoundChannelObject {
  #channel;
  #volume = 256;
  #pan = 0;
  #loop = false;
  #currentTime = 0;
  #elapsedTime = 0;
  #startTime = 0;
  #endTime = 0;
  #loopStartTime = 0;
  #loopEndTime = 0;
  #loopCount = 0;
  #loopsRemaining = 0;
  #sampleCount = 0;
  #sampleRate = 44100;
  #channelCount = 1;
  #status = 0;
  #isPlaying = false;
  #member = null;
  #playList = [];

  constructor(channel) {
    this.#channel = Number(channel);
  }

  get channel() {
    return this.#channel;
  }

  set channel(_value) {
    throw new Error("channel is read-only");
  }

  get volume() {
    return this.#volume;
  }

  set volume(value) {
    this.#volume = Number(value);
  }

  get pan() {
    return this.#pan;
  }

  set pan(value) {
    this.#pan = Number(value);
  }

  get loop() {
    return this.#loop;
  }

  set loop(value) {
    this.#loop = Boolean(value);
  }

  get currentTime() {
    return this.#currentTime;
  }

  set currentTime(value) {
    this.#currentTime = Number(value);
  }

  get isPlaying() {
    return this.#isPlaying;
  }

  get member() {
    return this.#member;
  }

  set member(value) {
    this.#member = value;
  }

  get channelCount() {
    return this.#channelCount;
  }

  set channelCount(value) {
    this.#channelCount = Number(value) || 1;
  }

  get elapsedTime() {
    return this.#elapsedTime;
  }

  set elapsedTime(_value) {
    throw new Error("elapsedTime is read-only");
  }

  get endTime() {
    return this.#endTime;
  }

  set endTime(value) {
    this.#endTime = Number(value);
  }

  get loopCount() {
    return this.#loopCount;
  }

  set loopCount(value) {
    this.#loopCount = Number(value);
  }

  get loopEndTime() {
    return this.#loopEndTime;
  }

  set loopEndTime(value) {
    this.#loopEndTime = Number(value);
  }

  get loopStartTime() {
    return this.#loopStartTime;
  }

  set loopStartTime(value) {
    this.#loopStartTime = Number(value);
  }

  get loopsRemaining() {
    return this.#loopsRemaining;
  }

  set loopsRemaining(value) {
    this.#loopsRemaining = Number(value);
  }

  get sampleCount() {
    return this.#sampleCount;
  }

  set sampleCount(value) {
    this.#sampleCount = Number(value);
  }

  get sampleRate() {
    return this.#sampleRate;
  }

  set sampleRate(value) {
    this.#sampleRate = Number(value) || 44100;
  }

  get startTime() {
    return this.#startTime;
  }

  set startTime(value) {
    this.#startTime = Number(value);
  }

  get status() {
    return this.#status;
  }

  set status(value) {
    this.#status = Number(value);
  }

  play(member) {
    this.#member = member ?? null;
    this.#currentTime = 0;
    this.#elapsedTime = 0;
    this.#isPlaying = true;
    this.#status = 1;
  }

  stop() {
    this.#isPlaying = false;
    this.#currentTime = 0;
    this.#elapsedTime = 0;
    this.#status = 0;
  }

  pause() {
    if (this.#isPlaying) {
      this.#isPlaying = false;
      this.#status = 2;
    }
  }

  rewind() {
    this.#currentTime = 0;
    this.#elapsedTime = 0;
  }

  breakLoop() {
    this.#loop = false;
    this.#loopsRemaining = 0;
  }

  fadeIn(_durationMs) {
    return true;
  }

  fadeOut(_durationMs) {
    return true;
  }

  fadeTo(_volume, _durationMs) {
    return true;
  }

  getPlayList() {
    return this.#playList.slice();
  }

  setPlayList(list) {
    this.#playList = Array.isArray(list) ? list.slice() : [];
  }

  isBusy() {
    return this.#isPlaying;
  }

  playFile(_filePath) {
    this.#isPlaying = true;
    this.#status = 1;
  }

  playNext() {
    return null;
  }

  queue(member) {
    this.#playList.push(member);
  }
}
