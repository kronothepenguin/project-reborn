// -- Data Types --
export class Color {}

export class List {
  _values = new Array();

  _sorted = false;

  constructor(...args) {
    this._values.push(...args);
  }

  get count() {
    return this._values.length;
  }

  *[Symbol.iterator]() {
    for (const item of this._values) {
      yield item;
    }
  }

  add(value) {
    if (this._sorted) {
      const index = this._values.findIndex((other) => value < other);
      if (index === -1) {
        this._values.push(value);
      } else {
        this._values.splice(index, 0, value);
      }
    } else {
      this._values.push(value);
    }
  }

  addAt(position, value) {
    this._values[position - 1] = value;
  }

  append(value) {
    this._values.push(value);
  }

  deleteAt(number) {
    if (number > this._values.length) throw SyntaxError("index out of bounds");
    this._values.splice(number - 1, 1);
  }

  deleteOne(value) {
    const index = this._values.indexOf(value);
    if (index > -1) {
      this._values.splice(index, 1);
    }
  }

  deleteProp(item) {
    this.deleteAt(item);
  }

  duplicate() {
    return new List(...this._values);
  }

  getaProp(position) {
    if (position < 1 || position > this._values.length) {
      return void 0;
    }
    return this._values[position - 1];
  }

  getAt(position) {
    if (position < this._values.length) {
      throw SyntaxError("index out of bounds");
    }
    return this._values[position - 1];
  }

  getLast() {
    return this._values[this._values.length - 1];
  }

  getOne(value) {
    return this._values.indexOf(value) + 1;
  }

  getPos(value) {
    return this._values.indexOf(value) + 1;
  }

  setAt(orderNumber, value) {
    if (orderNumber > this._values.length) {
      // TODO: expand
    }
    this._values[orderNumber - 1] = value;
  }

  sort() {
    this._values.sort();
    this._sorted = true;
  }
}

export function createList(...args) {
  return new Proxy(new List(...args), {
    get(target, p, receiver) {
      if (Object.hasOwn(target, p)) {
        return Reflect.get(target, p, receiver);
      }

      const n = Number(p);
      if (Number.isInteger(n)) {
        return target.getAt(n);
      }

      return Reflect.get(target, p, receiver);
    },

    set(target, p, newValue, receiver) {
      if (Object.hasOwn(target, p)) {
        return Reflect.set(target, p, newValue, receiver);
      }

      const n = Number(p);
      if (Number.isInteger(n)) {
        target.setAt(n, newValue);
        return true;
      }

      return Reflect.set(target, p, newValue, receiver);
    },
  });
}

export class PropList {
  _keys = new Array();
  _values = new Array();

  _sorted = false;

  constructor(...args) {
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];

      this._keys.push(key);
      this._values.push(value);
    }
  }

  get count() {
    return this._keys.length;
  }

  addProp(property, value) {
    if (this._sorted) {
      const prop =
        typeof property === "symbol" ? property.description : property;
      const index = this._keys.findIndex((other) =>
        typeof other === "symbol"
          ? prop < String(other.description)
          : prop < other,
      );
      if (index === -1) {
        this._keys.push(property);
        this._values.push(value);
      } else {
        this._keys.splice(index, 0, property);
        this._values.splice(index, 0, value);
      }
    } else {
      this._keys.push(property);
      this._values.push(value);
    }
  }

  deleteAt(number) {
    this._keys.splice(number - 1, 1);
  }

  deleteOne(value) {
    const index = this._values.indexOf(value);
    if (index > -1) {
      this._keys.splice(index, 1);
      this._values.splice(index, 1);
    }
  }

  deleteProp(item) {
    const index = this._keys.indexOf(item);
    if (index > -1) {
      this._keys.splice(index, 1);
      this._values.splice(index, 1);
    }
  }

  duplicate() {
    const args = new Array(2 * this._keys.length);
    for (let i = 0; i < this._keys.length; i++) {
      args[2 * i] = this._keys[i];
      args[2 * i + 1] = this._values[i];
    }
    return new PropList(...args);
  }

  findPos(property) {
    const index = this._keys.indexOf(property);
    if (index === -1) {
      return void 0;
    }
    return index + 1;
  }

  getaProp(property) {
    const index = this._keys.indexOf(property);
    if (index === -1) {
      return void 0;
    }
    return this._values[index];
  }

  getLast() {
    return this._values[this._values.length - 1];
  }

  getOne(property) {
    return this._keys.indexOf(property) + 1;
  }

  getPos(value) {
    return this._values.indexOf(value) + 1;
  }

  getProp(property) {
    const index = this._keys.indexOf(property);
    if (index === -1) {
      throw new SyntaxError("index out of bounds");
    }
    return this._values[index];
  }

  getPropAt(index) {
    if (index < 1 || index > this._keys.length) {
      throw new SyntaxError("index out of bounds");
    }
    return this._values[index - 1];
  }

  setaProp(property, newValue) {
    const index = this._keys.indexOf(property);
    if (index === -1) {
      this.addProp(property, newValue);
    } else {
      this._values[index] = newValue;
    }
  }

  setAt(orderNumber, value) {
    if (orderNumber > this._keys.length) {
      throw new SyntaxError("index out of bounds");
    }
    this._values[orderNumber - 1] = value;
  }

  sort() {
    // TODO:
    this._sorted = true;
  }
}

export function createPropList(...args) {
  return new Proxy(new PropList(...args), {
    get(target, p, receiver) {
      return target.getaProp(p);
    },

    set(target, p, newValue, receiver) {
      target.setaProp(p, newValue);
      return true;
    },
  });
}

export class Point {
  inside(rectangle) {}
}

export class Rect {}

// -- Director Core Objects

function createIndexedRegistry() {
  const keys = new Array();
  const values = new Array();

  return new Proxy(
    {
      get count() {
        return keys.length;
      },
    },
    {
      get(target, p, receiver) {
        if (Object.hasOwn(target, p)) {
          return Reflect.get(target, p, receiver);
        }

        const n = Number(p);
        if (Number.isInteger(n)) {
          return values[n - 1];
        }

        if (typeof p === "string") {
          const index = keys.indexOf(p);
          if (index === -1) {
            return undefined;
          }
          return values[index];
        }

        return Reflect.get(target, p, receiver);
      },

      set(target, p, newValue, receiver) {
        if (keys.indexOf(p) > -1) {
          return false;
        }

        newValue._number = keys.push(p);
        values.push(newValue);

        return true;
      },
    },
  );
}

export class CastLibrary {
  _fileName = "";

  _member = createIndexedRegistry();

  name = "";

  _number = 0;

  // • 0. Load the cast library when needed. This is the default value.
  // • 1. Load the cast library before frame 1.
  // • 2. Load the cast library after frame 1.
  preLoadMode = 0;

  get fileName() {
    return this._fileName;
  }

  set fileName(name) {
    // TODO: check for external
    this._fileName = name;
  }

  get member() {
    return Object.freeze(this._member);
  }

  get number() {
    return this._number;
  }
}

export class Global {
  clearGlobals() {}

  showGlobals() {}
}

export class Key {}

export class Member {
  _castLibNum = 0;

  _height = 0;

  media = Object.create({});

  name = "";

  _number = 0;

  _rect = new Rect();

  regPoint = new Point();

  _type = Symbol.for("empty");

  _width = 0;

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

  set rect(r) {
    if (this._type !== Symbol.for("field"))
      throw SyntaxError(
        `trying to assign rect of ${this._type.description} member`,
      );
    this._rect = r;
  }

  get type() {
    return this._type;
  }

  get width() {
    return this._width;
  }

  duplicate() {
    return new Member();
  }

  erase() {
    // TODO: use _castLibNum to detect this member by _number and replace with #empty Member
    // this.castLibNum
  }
}

export class Mouse {}

export class Movie {
  _castLib = createIndexedRegistry();

  editShortCutsEnabled = 0;

  exitLock = 0;

  _frame = 0;

  _frameTempo = 0;

  keyboardFocusSprite = Object.create({});

  _lastChannel = 0;

  _name = "";

  _path = "";

  _sprite = createIndexedRegistry();

  _stage = Object.create({});

  _timeoutList = new Array();

  traceScript = 0;

  _xtraList = new Array();

  get castLib() {
    return Object.freeze(this._castLib);
  }

  get frame() {
    return this._frame;
  }

  get frameTempo() {
    return this._frameTempo;
  }

  get lastChannel() {
    return this._lastChannel;
  }

  get name() {
    return this._name;
  }

  get path() {
    return this._path;
  }

  get sprite() {
    return Object.freeze(this._sprite);
  }

  get stage() {
    return this._stage;
  }

  get xtraList() {
    return Object.freeze(this._xtraList);
  }

  go(frameNameOrNum, movieName = "") {}

  puppetSprite(intSpriteNum, flag) {}

  puppetTempo(intTempo) {}

  rollOver(intSpriteNum = 0) {}

  stopEvent() {}

  updateStage() {}
}

export class Player {
  alertHook = Object.create({});

  debugPlaybackEnabled = 0;

  _sound = new Array();

  _xtra = new Array();

  get sound() {
    return this._sound;
  }

  get xtra() {
    return this._xtra;
  }

  externalParamValue() {}

  getPref() {}

  setPref() {}
}

export class Sound {}

export class SoundChannel {}

export class Sprite {}

export class SpriteChannel {}

export class System {}

export class DirectorWindow {}

// -- Objects --

export class ParserObject {
  getError() {}

  parseString() {}
}

export class ScriptObject {
  handler() {}

  handlers() {}
}

// -- Object References --

export class MemberObjectRef {
  charPosToLoc(nthCharacter) {}

  erase() {}

  locToCharPos(location) {}
}

export class ImageObjectRef {
  copyPixels(sourceImgObj, destRectOrQuad, sourceRect, paramList) {}

  createMask() {}

  createMatte() {}

  draw() {}

  duplicate() {}

  fill() {}

  getPixel() {}

  setAlpha() {}

  setPixel() {}
}

export class TimeoutRef {
  forget() {}
}

export class SoundChannelObjectRef {
  getPlayList() {}

  isBusy() {}

  play() {}

  queue() {}

  setPlayList() {}

  stop() {}
}

export class SpriteObjectRef {
  print() {}
}

// -- Helpers --

export const _params = {};

export const _timeouts = {};

export function createScriptObject(prototype) {
  return new Proxy(
    {
      _prototype: prototype,

      handler(sym) {
        const name = typeof sym === "symbol" ? sym.description : sym;
        return typeof prototype[name] === "function";
      },
    },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (prop === Symbol.toStringTag) return "ScriptObject";
        const name = typeof prop === "symbol" ? prop.description : prop;
        const fn = target._prototype[name];
        return typeof fn === "function" ? fn.bind(target._prototype) : fn;
      },
      set(target, prop, value) {
        if (prop in target) {
          target[prop] = value;
          return true;
        }
        const name = typeof prop === "symbol" ? prop.description : prop;
        target._prototype[name] = value;
        return true;
      },
      has(target, prop) {
        if (prop === "_prototype") return true;
        const name = typeof prop === "symbol" ? prop.description : prop;
        return name in target._prototype || prop in target;
      },
    },
  );
}

export class ScriptRef {
  _factory = null;

  constructor(member) {
    this._factory = member._raw;
  }

  new() {
    if (typeof this._factory !== "function") return {};
    return createScriptObject(this._factory());
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
    const copy = new ImageObject(
      this.width,
      this.height,
      this._depth,
      this._paletteRef,
    );
    copy._useAlpha = this._useAlpha;
    copy._ctx.drawImage(this._canvas, 0, 0);
    return copy;
  }
}
