export const _params = {};

// ── Internal state ──

export const _timeouts = {};

class Rect {}

export class Member {
  fileName = "";
  media = new ArrayBuffer();
  name = "";
  regPoint = [0, 0];

  /** @type{any} */
  _raw = null;

  _scriptType = Symbol.for("empty");
  _scriptInstance = null;

  _castLibNum = 0;
  _number = 0;

  _width = 0;
  _height = 0;

  _rect = new Rect();

  constructor(type, name) {
    this._type = type;
    this.name = name;
  }

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
    // #animgif         #ole
    // #bitmap          #palette
    // #button          #picture
    // #cursor          #QuickTimeMedia
    // #digitalVideo    #realMedia
    // #DVD             #script
    // #empty           #shape
    // #field           #shockwave3D
    // #filmLoop        #sound
    // #flash           #swa
    // #flashcomponent  #text
    // #font            #transition
    // #havok           #vectorShape
    // #movie           #windowsMedia
    return this._type;
  }

  get width() {
    return this._width;
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
      return target._props[prop];
    },
    set(target, prop, value) {
      if (prop in target) {
        target[prop] = value;
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
