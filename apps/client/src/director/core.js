export const _params = {};

// ── Internal state ──

export const _timeouts = {};

// ── Point ──

export class Point {
  locH = 0;
  locV = 0;

  constructor(h, v) {
    this.locH = h ?? 0;
    this.locV = v ?? 0;
  }
}

export function createPointProxy(h, v) {
  return new Proxy(new Point(h, v), {
    get(target, prop) {
      if (prop in target) return target[prop];
      const n = Number(prop);
      if (Number.isInteger(n)) {
        return n === 1 ? target.locH : target.locV;
      }
      return undefined;
    },
    set(target, prop, value) {
      if (prop === "locH") {
        target.locH = value;
        return true;
      }
      if (prop === "locV") {
        target.locV = value;
        return true;
      }
      const n = Number(prop);
      if (Number.isInteger(n)) {
        if (n === 1) target.locH = value;
        else if (n === 2) target.locV = value;
        return true;
      }
      target[prop] = value;
      return true;
    },
  });
}

// ── Rect ──

export class Rect {
  left = 0;
  top = 0;
  right = 0;
  bottom = 0;

  constructor(left, top, right, bottom) {
    this.left = left ?? 0;
    this.top = top ?? 0;
    this.right = right ?? 0;
    this.bottom = bottom ?? 0;
  }

  get width() {
    return this.right - this.left;
  }

  get height() {
    return this.bottom - this.top;
  }

  add(other) {
    return new Rect(
      this.left + other.left,
      this.top + other.top,
      this.right + other.right,
      this.bottom + other.bottom,
    );
  }

  subtract(other) {
    return new Rect(
      this.left - other.left,
      this.top - other.top,
      this.right - other.right,
      this.bottom - other.bottom,
    );
  }
}

export function createRectProxy(left, top, right, bottom) {
  return new Proxy(new Rect(left, top, right, bottom), {
    get(target, prop) {
      if (prop in target) return target[prop];
      const n = Number(prop);
      if (Number.isInteger(n)) {
        switch (n) {
          case 1:
            return target.left;
          case 2:
            return target.top;
          case 3:
            return target.right;
          case 4:
            return target.bottom;
        }
      }
      return undefined;
    },
    set(target, prop, value) {
      switch (prop) {
        case "left":
        case "top":
        case "right":
        case "bottom":
          target[prop] = value;
          return true;
      }
      const n = Number(prop);
      if (Number.isInteger(n)) {
        switch (n) {
          case 1:
            target.left = value;
            break;
          case 2:
            target.top = value;
            break;
          case 3:
            target.right = value;
            break;
          case 4:
            target.bottom = value;
            break;
        }
        return true;
      }
      target[prop] = value;
      return true;
    },
  });
}

// ── Color ──

export class Color {
  red = 0;
  green = 0;
  blue = 0;

  constructor(r, g, b) {
    this.red = r ?? 0;
    this.green = g ?? 0;
    this.blue = b ?? 0;
  }
}

// ── ImageObject ──

export class ImageObject {
  /** @type {OffscreenCanvas} */
  _canvas = null;
  /** @type {CanvasRenderingContext2D} */
  _ctx = null;
  _depth = 32;

  // read/write
  paletteRef = null;
  useAlpha = false;

  constructor(width, height, depth, paletteRef) {
    this._canvas = new OffscreenCanvas(width, height);
    this._ctx = this._canvas.getContext("2d");
    this._depth = depth ?? 32;
    this.paletteRef = paletteRef ?? null;
  }

  // read-only
  get width() {
    return this._canvas.width;
  }

  get height() {
    return this._canvas.height;
  }

  get rect() {
    return createRectProxy(0, 0, this.width, this.height);
  }

  get depth() {
    return this._depth;
  }

  fill(color) {
    if (color instanceof Color) {
      this._ctx.fillStyle = `rgb(${color.red},${color.green},${color.blue})`;
    } else if (typeof color === "string") {
      this._ctx.fillStyle = color;
    }
    this._ctx.fillRect(0, 0, this.width, this.height);
  }

  getPixel(x, y) {
    const data = this._ctx.getImageData(x, y, 1, 1).data;
    return new Color(data[0], data[1], data[2]);
  }

  setPixel(x, y, color) {
    if (color instanceof Color) {
      this._ctx.fillStyle = `rgb(${color.red},${color.green},${color.blue})`;
    } else if (typeof color === "string") {
      this._ctx.fillStyle = color;
    }
    this._ctx.fillRect(x, y, 1, 1);
  }

  /**
   * copyPixels(sourceImage, destRect, sourceRect, options)
   * Lingo: copyPixels(sourceImage, destinationRect, sourceRect [, options])
   * options can include #ink, #maskImage, #maskOffset, etc.
   */
  copyPixels(sourceImage, destRect, sourceRect, options) {
    const ctx = this._ctx;
    const sW = sourceRect.right - sourceRect.left;
    const sH = sourceRect.bottom - sourceRect.top;
    const dW = destRect.right - destRect.left;
    const dH = destRect.bottom - destRect.top;

    if (sourceImage instanceof ImageObject) {
      ctx.drawImage(
        sourceImage._canvas,
        sourceRect.left,
        sourceRect.top,
        sW,
        sH,
        destRect.left,
        destRect.top,
        dW,
        dH,
      );
    } else if (sourceImage instanceof Member) {
      // Handle bitmap member images
      const memberImg = sourceImage;
      if (memberImg._imageData) {
        ctx.putImageData(memberImg._imageData, destRect.left, destRect.top);
      }
    }
  }

  crop(rect) {
    const w = rect.right - rect.left;
    const h = rect.bottom - rect.top;
    const imageData = this._ctx.getImageData(rect.left, rect.top, w, h);
    this._canvas = new OffscreenCanvas(w, h);
    this._ctx = this._canvas.getContext("2d");
    this._ctx.putImageData(imageData, 0, 0);
  }

  draw(image, x, y) {
    if (image instanceof ImageObject) {
      this._ctx.drawImage(image._canvas, x ?? 0, y ?? 0);
    }
  }

  duplicate() {
    const copy = new ImageObject(this.width, this.height, this._depth, this._paletteRef);
    copy._useAlpha = this._useAlpha;
    copy._ctx.drawImage(this._canvas, 0, 0);
    return copy;
  }
}

export class Member {
  // read/write — public properties
  name = "";
  fileName = "";
  media = new ArrayBuffer();
  regPoint = [0, 0];
  image = null;
  blend = 100;
  locH = 0;
  locV = 0;
  wordWrap = 0;
  font = "";
  fontStyle = null;
  fontSize = 12;
  color = null;
  text = "";
  fixedLineSpace = 0;
  alignment = Symbol.for("left");

  // read-only — backing fields
  _castLibNum = 0;
  _number = 0;
  _width = 0;
  _height = 0;
  _rect = new Rect();
  _type = Symbol.for("empty");
  _raw = null;
  _scriptType = Symbol.for("empty");
  _scriptInstance = null;

  constructor(type, name) {
    this._type = type;
    this.name = name;
  }

  // read-only getters
  get castLibNum() {
    return this._castLibNum;
  }

  get height() {
    return this._height;
  }

  get number() {
    return this._number;
  }

  get rect() {
    return this._rect;
  }

  get type() {
    return this._type;
  }

  get width() {
    return this._width;
  }

  get loc() {
    return createPointProxy(this.locH, this.locV);
  }

  set loc(p) {
    this.locH = p.locH;
    this.locV = p.locV;
  }

  charPosToLoc(charNum) {
    // TODO: implement when text rendering is available
    return createPointProxy(0, 0);
  }

  duplicate() {}

  erase() {}

  importFileInto() {}
}

export class CastLibrary {
  name = "";
  // • 0. Load the cast library when needed. This is the default value.
  // • 1. Load the cast library before frame 1.
  // • 2. Load the cast library after frame 1.
  preLoadMode = 0;

  /** @type{Record<any, Member>} */
  _memberRegistry = {};
  _memberCount = 0;

  constructor(name, number) {
    this.name = name;
    this._number = number;
  }

  get fileName() {
    return "";
  }

  get member() {
    return { ...this._memberRegistry };
  }

  get number() {
    return this._number;
  }

  _registerMember(name, member) {
    const memNum = this._memberCount + 1;
    this._memberCount++;

    this._memberRegistry[name] = member;
    this._memberRegistry[memNum] = member;
  }
}

export class Sprite {}

export class Movie {
  keyboardFocusSprite = -1;

  /** @type{Record<any, CastLibrary>} */
  _castRegistry = {};
  _castCount = 0;

  _tempo = 60; // 60 FPS

  constructor() {}

  get castLib() {
    return { ...this._castRegistry };
  }

  get lastChannel() {
    return 0;
  }

  puppetSprite(intTempo) {
    this._tempo = intTempo;
  }

  puppetTempo() {}

  stopEvent() {}

  updateStage() {}

  _registerCast(name, members) {
    const castLibs = this._castRegistry;

    if (!!castLibs[name]) {
      return;
    }

    const castNum = this._castCount + 1;
    this._castCount++;

    const cast = new CastLibrary(name, castNum);

    for (const member of members) {
      member._castLibNum = castNum;
      member._number = cast._memberCount;

      const memberName = member.name;

      cast._registerMember(memberName, member);
    }

    castLibs[name] = cast;
    castLibs[castNum] = cast;
  }
}

export class Player {
  constructor(movie) {
    this._movie = movie;
  }

  cursor() {}

  externalParamValue() {}

  getPref() {}

  setPref() {}
}

export class List {
  constructor(...args) {
    this._items = [...args];
  }

  get count() {
    return this._items.length;
  }

  add(item) {
    this._items.push(item);
  }

  getAt(index) {
    return this._items[index - 1];
  }

  setAt(index, value) {
    this._items[index - 1] = value;
  }

  deleteOne(item) {
    const idx = this._items.indexOf(item);
    if (idx !== -1) {
      this._items.splice(idx, 1);
      return true;
    }
    return false;
  }

  getOne(item) {
    const idx = this._items.indexOf(item);
    return idx !== -1 ? idx + 1 : 0;
  }

  contains(item) {
    return this._items.includes(item);
  }

  sort() {
    this._items.sort();
    return this;
  }

  reverse() {
    this._items.reverse();
    return this;
  }

  duplicate() {
    return createListProxy(...this._items);
  }
}

export function createListProxy(...args) {
  const list = new List(...args);

  return new Proxy(list, {
    get(target, prop) {
      if (prop in target) return target[prop];
      const num = Number(prop);
      if (Number.isInteger(num) && num > 0) {
        return target._items[num - 1];
      }
      return undefined;
    },
    set(target, prop, value) {
      const num = Number(prop);
      if (Number.isInteger(num) && num > 0) {
        target._items[num - 1] = value;
        return true;
      }
      target[prop] = value;
      return true;
    },
    has(target, prop) {
      const num = Number(prop);
      if (Number.isInteger(num) && num > 0) {
        return num - 1 < target._items.length;
      }
      return prop in target;
    },
    deleteProperty(target, prop) {
      const num = Number(prop);
      if (Number.isInteger(num) && num > 0) {
        target._items.splice(num - 1, 1);
        return true;
      }
      delete target[prop];
      return true;
    },
  });
}

export class PropList {
  constructor() {
    this._props = {};
  }

  get count() {
    return Object.keys(this._props).length;
  }

  setaProp(key, value) {
    this._props[key] = value;
  }

  getaProp(key) {
    return this._props[key];
  }

  getPropAt(index) {
    const keys = Object.keys(this._props);
    return this._props[keys[index - 1]];
  }

  getKeyAt(index) {
    const keys = Object.keys(this._props);
    return keys[index - 1];
  }

  deleteAProp(key) {
    delete this._props[key];
  }

  hasProp(key) {
    return key in this._props;
  }

  getKeys() {
    return Object.keys(this._props);
  }

  getPropList() {
    return { ...this._props };
  }

  duplicate() {
    const pl = createPropListProxy();
    for (const key of this.getKeys()) {
      pl.setaProp(key, this.getaProp(key));
    }
    return pl;
  }
}

export function createPropListProxy() {
  const pl = new PropList();

  return new Proxy(pl, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === Symbol.toStringTag) return "PropList";
      const num = Number(prop);
      if (Number.isInteger(num) && num > 0) {
        return target.getPropAt(num);
      }
      return target._props[prop];
    },
    set(target, prop, value) {
      if (prop in target) {
        target[prop] = value;
        return true;
      }
      const num = Number(prop);
      if (Number.isInteger(num) && num > 0) {
        const key = target.getKeyAt(num);
        if (key !== undefined) {
          target._props[key] = value;
        }
        return true;
      }
      target._props[prop] = value;
      return true;
    },
    has(target, prop) {
      return prop in target._props || prop in target;
    },
    deleteProperty(target, prop) {
      delete target._props[prop];
      return true;
    },
  });
}
