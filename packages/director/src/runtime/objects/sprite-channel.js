export class SpriteChannelObject {
  #number;
  #name = "";
  #scripted = false;
  #sprite = null;

  constructor(number = 0) {
    this.#number = Number(number);
  }

  get number() {
    return this.#number;
  }

  set number(value) {
    this.#number = Number(value);
  }

  get name() {
    return this.#name;
  }

  set name(value) {
    this.#name = String(value ?? "");
  }

  get scripted() {
    return this.#scripted;
  }

  set scripted(value) {
    this.#scripted = Boolean(value);
  }

  get sprite() {
    return this.#sprite;
  }

  set sprite(value) {
    this.#sprite = value ?? null;
  }

  makeScriptedSprite(member) {
    this.#sprite = member ?? null;
    this.#scripted = true;
    return this.#sprite;
  }

  removeScriptedSprite() {
    this.#sprite = null;
    this.#scripted = false;
  }
}
