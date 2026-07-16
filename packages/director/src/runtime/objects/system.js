export class SystemObject {
  #colorDepth = 32;
  #deskTopRectList = [];
  #environmentPropList = [];
  #milliseconds = 0;

  get colorDepth() {
    if (this.#colorDepth !== 32) {
      return this.#colorDepth;
    }
    if (typeof globalThis !== "undefined" && globalThis.screen) {
      return globalThis.screen.colorDepth || 32;
    }
    return this.#colorDepth;
  }

  set colorDepth(value) {
    this.#colorDepth = Number(value) || 32;
  }

  get deskTopRectList() {
    return this.#deskTopRectList;
  }

  set deskTopRectList(value) {
    this.#deskTopRectList = Array.isArray(value) ? value : [];
  }

  get environmentPropList() {
    return this.#environmentPropList;
  }

  set environmentPropList(value) {
    this.#environmentPropList = Array.isArray(value) ? value : [];
  }

  get milliseconds() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return Math.trunc(performance.now());
    }
    return Date.now();
  }

  set milliseconds(value) {
    this.#milliseconds = Math.trunc(Number(value) || 0);
  }

  date() {
    return new Date();
  }

  time() {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  }

  restart() {
    return true;
  }

  shutDown() {
    return true;
  }
}
