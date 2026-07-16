export class CastLibraryObject {
  #name;
  #number;
  #members = [];
  #membersByName = new Map();
  #fileName = "";
  #preLoadMode = 0;
  #selection = null;
  #castMemberList = [];
  #castLibNum;
  #broadcastProps = true;

  constructor({ number = 0, name = "", castLibNum } = {}) {
    this.#number = number;
    this.#name = name;
    this.#castLibNum = castLibNum ?? number;

    this.member = new Proxy({}, {
      get: (_target, prop) => {
        if (typeof prop === "symbol") return undefined;
        const key = prop;
        if (typeof key === "number" || /^\d+$/.test(key)) {
          return this.#members[Number(key) - 1] ?? null;
        }
        return this.#membersByName.get(key) ?? null;
      },
      set: () => {
        throw new Error("member is read-only");
      },
      has: (_target, prop) => {
        if (typeof prop === "symbol") return false;
        if (typeof prop === "number" || /^\d+$/.test(prop)) {
          return Number(prop) >= 1 && Number(prop) <= this.#members.length;
        }
        return this.#membersByName.has(prop);
      },
      ownKeys: () => {
        return this.#members.map((_, i) => String(i + 1));
      },
      getOwnPropertyDescriptor: (_target, prop) => {
        if (typeof prop === "symbol") return undefined;
        if (typeof prop === "number" || /^\d+$/.test(prop)) {
          const idx = Number(prop) - 1;
          if (idx >= 0 && idx < this.#members.length) {
            return { configurable: true, enumerable: true, value: this.#members[idx] };
          }
        }
        return undefined;
      },
    });

    return this;
  }

  get name() {
    return this.#name;
  }

  set name(value) {
    this.#name = value;
  }

  get number() {
    return this.#number;
  }

  get fileName() {
    return this.#fileName;
  }

  set fileName(value) {
    this.#fileName = value;
  }

  get preLoadMode() {
    return this.#preLoadMode;
  }

  set preLoadMode(value) {
    if (![0, 1, 2].includes(value)) {
      throw new RangeError("preLoadMode must be 0, 1, or 2");
    }
    this.#preLoadMode = value;
  }

  get selection() {
    return this.#selection;
  }

  set selection(value) {
    this.#selection = value;
  }

  get castMemberList() {
    return this.#castMemberList;
  }

  set castMemberList(value) {
    this.#castMemberList = Array.isArray(value) ? value : [];
  }

  get castLibNum() {
    return this.#castLibNum;
  }

  get broadcastProps() {
    return this.#broadcastProps;
  }

  set broadcastProps(value) {
    this.#broadcastProps = Boolean(value);
  }

  findEmpty() {
    const used = new Set(this.#members.map((m) => m?.number ?? 0));
    let slot = 1;
    while (used.has(slot)) slot++;
    return slot;
  }

  _addMember(memberObject) {
    this.#members.push(memberObject);
    if (memberObject && memberObject.name) {
      this.#membersByName.set(memberObject.name, memberObject);
    }
  }

  _removeMember(memberObject) {
    const idx = this.#members.indexOf(memberObject);
    if (idx !== -1) {
      this.#members.splice(idx, 1);
      if (memberObject && memberObject.name) {
        this.#membersByName.delete(memberObject.name);
      }
    }
  }

  static #activeCastLib = 1;

  static get activeCastLib() {
    return CastLibraryObject.#activeCastLib;
  }

  static set activeCastLib(value) {
    CastLibraryObject.#activeCastLib = value;
  }

  static #castLibs = [];
  static #castLibsByName = new Map();

  static castLib = new Proxy({}, {
    get: (_target, prop) => {
      if (typeof prop === "symbol") return undefined;
      const key = prop;
      if (typeof key === "number" || /^\d+$/.test(key)) {
        return CastLibraryObject.#castLibs[Number(key) - 1] ?? null;
      }
      return CastLibraryObject.#castLibsByName.get(key) ?? null;
    },
    set: () => {
      throw new Error("castLib is read-only");
    },
    has: (_target, prop) => {
      if (typeof prop === "symbol") return false;
      if (typeof prop === "number" || /^\d+$/.test(prop)) {
        return Number(prop) >= 1 && Number(prop) <= CastLibraryObject.#castLibs.length;
      }
      return CastLibraryObject.#castLibsByName.has(prop);
    },
    ownKeys: () => {
      return CastLibraryObject.#castLibs.map((_, i) => String(i + 1));
    },
    getOwnPropertyDescriptor: (_target, prop) => {
      if (typeof prop === "symbol") return undefined;
      if (typeof prop === "number" || /^\d+$/.test(prop)) {
        const idx = Number(prop) - 1;
        if (idx >= 0 && idx < CastLibraryObject.#castLibs.length) {
          return { configurable: true, enumerable: true, value: CastLibraryObject.#castLibs[idx] };
        }
      }
      return undefined;
    },
  });

  static _register(castLibObject) {
    CastLibraryObject.#castLibs.push(castLibObject);
    if (castLibObject && castLibObject.name) {
      CastLibraryObject.#castLibsByName.set(castLibObject.name, castLibObject);
    }
  }

  static _unregister(castLibObject) {
    const idx = CastLibraryObject.#castLibs.indexOf(castLibObject);
    if (idx !== -1) {
      CastLibraryObject.#castLibs.splice(idx, 1);
      if (castLibObject && castLibObject.name) {
        CastLibraryObject.#castLibsByName.delete(castLibObject.name);
      }
    }
  }

  static _reset() {
    CastLibraryObject.#castLibs = [];
    CastLibraryObject.#castLibsByName = new Map();
    CastLibraryObject.#activeCastLib = 1;
  }
}
