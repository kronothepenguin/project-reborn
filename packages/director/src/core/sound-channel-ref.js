export class SoundChannelRef {
  #channel;
  #volume = 256;
  #pan = 0;
  #loop = false;
  #currentTime = 0;
  #isPlaying = false;
  #member = null;

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

  play(member) {
    this.#member = member ?? null;
    this.#currentTime = 0;
    this.#isPlaying = true;
  }

  stop() {
    this.#isPlaying = false;
    this.#currentTime = 0;
  }

  rewind() {
    this.#currentTime = 0;
  }

  breakLoop() {
    this.#loop = false;
  }
}
