export class KeyRef {
  #keyCode = 0;
  #key = "";
  #keyPressed = false;
  #commandDown = false;
  #controlDown = false;
  #shiftDown = false;
  #optionDown = false;
  #altDown = false;
  #capsLock = false;
  #numLock = false;
  #lastKey = 0;

  get keyCode() {
    return this.#keyCode;
  }

  set keyCode(_value) {
    throw new Error("keyCode is read-only");
  }

  get key() {
    return this.#key;
  }

  set key(_value) {
    throw new Error("key is read-only");
  }

  get keyPressed() {
    return this.#keyPressed;
  }

  set keyPressed(_value) {
    throw new Error("keyPressed is read-only");
  }

  get commandDown() {
    return this.#commandDown;
  }

  set commandDown(_value) {
    throw new Error("commandDown is read-only");
  }

  get controlDown() {
    return this.#controlDown;
  }

  set controlDown(_value) {
    throw new Error("controlDown is read-only");
  }

  get shiftDown() {
    return this.#shiftDown;
  }

  set shiftDown(_value) {
    throw new Error("shiftDown is read-only");
  }

  get optionDown() {
    return this.#optionDown;
  }

  set optionDown(_value) {
    throw new Error("optionDown is read-only");
  }

  get altDown() {
    return this.#altDown;
  }

  set altDown(_value) {
    throw new Error("altDown is read-only");
  }

  get capsLock() {
    return this.#capsLock;
  }

  set capsLock(_value) {
    throw new Error("capsLock is read-only");
  }

  get numLock() {
    return this.#numLock;
  }

  set numLock(_value) {
    throw new Error("numLock is read-only");
  }

  get lastKey() {
    return this.#lastKey;
  }

  set lastKey(_value) {
    throw new Error("lastKey is read-only");
  }

  _setKeyCode(value) {
    this.#keyCode = Number(value) || 0;
  }

  _setKey(value) {
    this.#key = String(value ?? "");
  }

  _setKeyPressed(value) {
    this.#keyPressed = Boolean(value);
  }

  _setCommandDown(value) {
    this.#commandDown = Boolean(value);
  }

  _setControlDown(value) {
    this.#controlDown = Boolean(value);
  }

  _setShiftDown(value) {
    this.#shiftDown = Boolean(value);
  }

  _setOptionDown(value) {
    this.#optionDown = Boolean(value);
  }

  _setAltDown(value) {
    this.#altDown = Boolean(value);
  }

  _setCapsLock(value) {
    this.#capsLock = Boolean(value);
  }

  _setNumLock(value) {
    this.#numLock = Boolean(value);
  }

  _setLastKey(value) {
    this.#lastKey = Number(value) || 0;
  }

  _reset() {
    this.#keyCode = 0;
    this.#key = "";
    this.#keyPressed = false;
    this.#commandDown = false;
    this.#controlDown = false;
    this.#shiftDown = false;
    this.#optionDown = false;
    this.#altDown = false;
    this.#capsLock = false;
    this.#numLock = false;
    this.#lastKey = 0;
  }
}

export const _key = new KeyRef();
