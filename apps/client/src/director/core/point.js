export class Point {
  #locH;
  #locV;

  constructor(locH = 0, locV = 0) {
    this.#locH = locH;
    this.#locV = locV;
  }

  get locH() {
    return this.#locH;
  }

  set locH(value) {
    this.#locH = value;
  }

  get locV() {
    return this.#locV;
  }

  set locV(value) {
    this.#locV = value;
  }
}

export function point(h, v) {
  return createPointProxy(h, v);
}

function createPointProxy(h, v) {
  const p = new Point(h, v);
  return new Proxy(p, {
    get(target, prop) {
      if (prop === "1" || prop === 1) return target.locH;
      if (prop === "2" || prop === 2) return target.locV;
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      if (prop === "1" || prop === 1) {
        target.locH = value;
        return true;
      }
      if (prop === "2" || prop === 2) {
        target.locV = value;
        return true;
      }
      return Reflect.set(target, prop, value);
    },
    has(target, prop) {
      if (prop === "1" || prop === 1 || prop === "2" || prop === 2) return true;
      return Reflect.has(target, prop);
    },
  });
}
