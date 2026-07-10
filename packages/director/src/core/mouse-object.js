export class MouseObject {
  #mouseH = 0;
  #mouseV = 0;
  #mouseDown = false;
  #mouseUp = true;
  #doubleClick = false;
  #clickOn = 0;
  #clickLoc = { h: 0, v: 0 };
  #rightMouseDown = false;
  #rightMouseUp = true;
  #stillDown = false;
  #mouseChar = "";
  #mouseItem = "";
  #mouseLine = 0;
  #mouseMember = 0;
  #mouseWord = 0;
  #lastClick = 0;
  #lastEvent = "mouseUp";
  #rollover = 0;
  #cursor = 0;
  #keyDownScript = "";
  #keyUpScript = "";
  #mouseDownScript = "";
  #mouseUpScript = "";
  #mouseEnterScript = "";
  #mouseLeaveScript = "";
  #mouseWithinScript = "";

  get clickLoc() {
    return this.#clickLoc;
  }

  set clickLoc(_value) {
    throw new Error("clickLoc is read-only");
  }

  get clickOn() {
    return this.#clickOn;
  }

  set clickOn(_value) {
    throw new Error("clickOn is read-only");
  }

  get doubleClick() {
    return this.#doubleClick;
  }

  set doubleClick(_value) {
    throw new Error("doubleClick is read-only");
  }

  get mouseChar() {
    return this.#mouseChar;
  }

  set mouseChar(_value) {
    throw new Error("mouseChar is read-only");
  }

  get mouseDown() {
    return this.#mouseDown;
  }

  set mouseDown(_value) {
    throw new Error("mouseDown is read-only");
  }

  get mouseH() {
    return this.#mouseH;
  }

  set mouseH(_value) {
    throw new Error("mouseH is read-only");
  }

  get mouseItem() {
    return this.#mouseItem;
  }

  set mouseItem(_value) {
    throw new Error("mouseItem is read-only");
  }

  get mouseLine() {
    return this.#mouseLine;
  }

  set mouseLine(_value) {
    throw new Error("mouseLine is read-only");
  }

  get mouseLoc() {
    return { h: this.#mouseH, v: this.#mouseV };
  }

  set mouseLoc(_value) {
    throw new Error("mouseLoc is read-only");
  }

  get mouseMember() {
    return this.#mouseMember;
  }

  set mouseMember(_value) {
    throw new Error("mouseMember is read-only");
  }

  get mouseUp() {
    return this.#mouseUp;
  }

  set mouseUp(_value) {
    throw new Error("mouseUp is read-only");
  }

  get mouseV() {
    return this.#mouseV;
  }

  set mouseV(_value) {
    throw new Error("mouseV is read-only");
  }

  get mouseWord() {
    return this.#mouseWord;
  }

  set mouseWord(_value) {
    throw new Error("mouseWord is read-only");
  }

  get rightMouseDown() {
    return this.#rightMouseDown;
  }

  set rightMouseDown(_value) {
    throw new Error("rightMouseDown is read-only");
  }

  get rightMouseUp() {
    return this.#rightMouseUp;
  }

  set rightMouseUp(_value) {
    throw new Error("rightMouseUp is read-only");
  }

  get stillDown() {
    return this.#stillDown;
  }

  set stillDown(_value) {
    throw new Error("stillDown is read-only");
  }

  get rollover() {
    return this.#rollover;
  }

  set rollover(_value) {
    throw new Error("rollover is read-only");
  }

  get cursor() {
    return this.#cursor;
  }

  set cursor(value) {
    this.#cursor = Number(value);
  }

  get lastClick() {
    return this.#lastClick;
  }

  set lastClick(_value) {
    throw new Error("lastClick is read-only");
  }

  get lastEvent() {
    return this.#lastEvent;
  }

  set lastEvent(_value) {
    throw new Error("lastEvent is read-only");
  }

  get keyDownScript() {
    return this.#keyDownScript;
  }

  set keyDownScript(value) {
    this.#keyDownScript = String(value ?? "");
  }

  get keyUpScript() {
    return this.#keyUpScript;
  }

  set keyUpScript(value) {
    this.#keyUpScript = String(value ?? "");
  }

  get mouseDownScript() {
    return this.#mouseDownScript;
  }

  set mouseDownScript(value) {
    this.#mouseDownScript = String(value ?? "");
  }

  get mouseUpScript() {
    return this.#mouseUpScript;
  }

  set mouseUpScript(value) {
    this.#mouseUpScript = String(value ?? "");
  }

  get mouseEnterScript() {
    return this.#mouseEnterScript;
  }

  set mouseEnterScript(value) {
    this.#mouseEnterScript = String(value ?? "");
  }

  get mouseLeaveScript() {
    return this.#mouseLeaveScript;
  }

  set mouseLeaveScript(value) {
    this.#mouseLeaveScript = String(value ?? "");
  }

  get mouseWithinScript() {
    return this.#mouseWithinScript;
  }

  set mouseWithinScript(value) {
    this.#mouseWithinScript = String(value ?? "");
  }

  _setMouseH(value) {
    this.#mouseH = Number(value) || 0;
  }

  _setMouseV(value) {
    this.#mouseV = Number(value) || 0;
  }

  _setMouseDown(value) {
    this.#mouseDown = Boolean(value);
    this.#mouseUp = !this.#mouseDown;
    this.#stillDown = this.#mouseDown;
  }

  _setDoubleClick(value) {
    this.#doubleClick = Boolean(value);
  }

  _setClickOn(value) {
    this.#clickOn = Number(value) || 0;
  }

  _setClickLoc(h, v) {
    this.#clickLoc = { h: Number(h) || 0, v: Number(v) || 0 };
  }

  _setRollover(value) {
    this.#rollover = Number(value) || 0;
  }

  _setMouseChar(value) {
    this.#mouseChar = String(value ?? "");
  }

  _setMouseItem(value) {
    this.#mouseItem = String(value ?? "");
  }

  _setMouseLine(value) {
    this.#mouseLine = Number(value) || 0;
  }

  _setMouseMember(value) {
    this.#mouseMember = Number(value) || 0;
  }

  _setMouseWord(value) {
    this.#mouseWord = Number(value) || 0;
  }

  _setLastClick(value) {
    this.#lastClick = Number(value) || 0;
  }

  _setLastEvent(value) {
    this.#lastEvent = String(value ?? "");
  }

  _reset() {
    this.#mouseH = 0;
    this.#mouseV = 0;
    this.#mouseDown = false;
    this.#mouseUp = true;
    this.#doubleClick = false;
    this.#clickOn = 0;
    this.#clickLoc = { h: 0, v: 0 };
    this.#rightMouseDown = false;
    this.#rightMouseUp = true;
    this.#stillDown = false;
    this.#mouseChar = "";
    this.#mouseItem = "";
    this.#mouseLine = 0;
    this.#mouseMember = 0;
    this.#mouseWord = 0;
    this.#lastClick = 0;
    this.#lastEvent = "mouseUp";
    this.#rollover = 0;
    this.#cursor = 0;
  }
}

export const _mouse = new MouseObject();
