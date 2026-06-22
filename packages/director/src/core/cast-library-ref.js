export class CastLibraryRef {
  #name;
  #number;
  #members = [];
  #membersByName = new Map();
  #fileName = "";
  #preLoadMode = 0;
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
        if (typeof prop === "number" || /^\d+$/.test(prop)) {
          return Number(prop) >= 1 && Number(prop) <= this.#members.length;
        }
        return this.#membersByName.has(prop);
      },
      ownKeys: () => {
        return this.#members.map((_, i) => String(i + 1));
      },
      getOwnPropertyDescriptor: (_target, prop) => {
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

  _addMember(memberRef) {
    this.#members.push(memberRef);
    if (memberRef && memberRef.name) {
      this.#membersByName.set(memberRef.name, memberRef);
    }
  }

  _removeMember(memberRef) {
    const idx = this.#members.indexOf(memberRef);
    if (idx !== -1) {
      this.#members.splice(idx, 1);
      if (memberRef && memberRef.name) {
        this.#membersByName.delete(memberRef.name);
      }
    }
  }

  static #activeCastLib = 1;

  static get activeCastLib() {
    return CastLibraryRef.#activeCastLib;
  }

  static set activeCastLib(value) {
    CastLibraryRef.#activeCastLib = value;
  }

  static #castLibs = [];
  static #castLibsByName = new Map();

  static castLib = new Proxy({}, {
    get: (_target, prop) => {
      if (typeof prop === "symbol") return undefined;
      const key = prop;
      if (typeof key === "number" || /^\d+$/.test(key)) {
        return CastLibraryRef.#castLibs[Number(key) - 1] ?? null;
      }
      return CastLibraryRef.#castLibsByName.get(key) ?? null;
    },
    set: () => {
      throw new Error("castLib is read-only");
    },
    has: (_target, prop) => {
      if (typeof prop === "number" || /^\d+$/.test(prop)) {
        return Number(prop) >= 1 && Number(prop) <= CastLibraryRef.#castLibs.length;
      }
      return CastLibraryRef.#castLibsByName.has(prop);
    },
    ownKeys: () => {
      return CastLibraryRef.#castLibs.map((_, i) => String(i + 1));
    },
    getOwnPropertyDescriptor: (_target, prop) => {
      if (typeof prop === "number" || /^\d+$/.test(prop)) {
        const idx = Number(prop) - 1;
        if (idx >= 0 && idx < CastLibraryRef.#castLibs.length) {
          return { configurable: true, enumerable: true, value: CastLibraryRef.#castLibs[idx] };
        }
      }
      return undefined;
    },
  });

  static _register(castLibRef) {
    CastLibraryRef.#castLibs.push(castLibRef);
    if (castLibRef && castLibRef.name) {
      CastLibraryRef.#castLibsByName.set(castLibRef.name, castLibRef);
    }
  }

  static _unregister(castLibRef) {
    const idx = CastLibraryRef.#castLibs.indexOf(castLibRef);
    if (idx !== -1) {
      CastLibraryRef.#castLibs.splice(idx, 1);
      if (castLibRef && castLibRef.name) {
        CastLibraryRef.#castLibsByName.delete(castLibRef.name);
      }
    }
  }

  static _reset() {
    CastLibraryRef.#castLibs = [];
    CastLibraryRef.#castLibsByName = new Map();
    CastLibraryRef.#activeCastLib = 1;
  }
}
