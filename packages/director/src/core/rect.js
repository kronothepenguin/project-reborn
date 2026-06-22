export class Rect {
  #left;
  #top;
  #right;
  #bottom;

  constructor(left = 0, top = 0, right = 0, bottom = 0) {
    this.#left = left;
    this.#top = top;
    this.#right = right;
    this.#bottom = bottom;
  }

  get left() {
    return this.#left;
  }

  set left(value) {
    this.#left = value;
  }

  get top() {
    return this.#top;
  }

  set top(value) {
    this.#top = value;
  }

  get right() {
    return this.#right;
  }

  set right(value) {
    this.#right = value;
  }

  get bottom() {
    return this.#bottom;
  }

  set bottom(value) {
    this.#bottom = value;
  }
}

export function rect(left, top, right, bottom) {
  return createRectProxy(left, top, right, bottom);
}

function createRectProxy(left, top, right, bottom) {
  const r = new Rect(left, top, right, bottom);
  return new Proxy(r, {
    get(target, prop) {
      if (prop === "1" || prop === 1) return target.left;
      if (prop === "2" || prop === 2) return target.top;
      if (prop === "3" || prop === 3) return target.right;
      if (prop === "4" || prop === 4) return target.bottom;
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      if (prop === "1" || prop === 1) {
        target.left = value;
        return true;
      }
      if (prop === "2" || prop === 2) {
        target.top = value;
        return true;
      }
      if (prop === "3" || prop === 3) {
        target.right = value;
        return true;
      }
      if (prop === "4" || prop === 4) {
        target.bottom = value;
        return true;
      }
      return Reflect.set(target, prop, value);
    },
    has(target, prop) {
      if (
        prop === "1" || prop === 1 ||
        prop === "2" || prop === 2 ||
        prop === "3" || prop === 3 ||
        prop === "4" || prop === 4
      ) return true;
      return Reflect.has(target, prop);
    },
  });
}
