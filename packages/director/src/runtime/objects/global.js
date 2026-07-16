export class GlobalObject {
  #vars = new Map();

  clearGlobals() {
    this.#vars.clear();
  }

  showGlobals() {
    return Array.from(this.#vars.entries()).map(([name, value]) => ({ name, value }));
  }

  _set(name, value) {
    this.#vars.set(String(name), value);
  }

  _get(name) {
    return this.#vars.get(String(name));
  }

  _has(name) {
    return this.#vars.has(String(name));
  }

  _delete(name) {
    return this.#vars.delete(String(name));
  }

  _list() {
    return Array.from(this.#vars.keys());
  }
}

export function createGlobalProxy(store = new GlobalObject()) {
  return new Proxy(store, {
    get(target, prop) {
      if (typeof prop === "symbol") return target[prop];
      if (prop === "clearGlobals" || prop === "showGlobals") return target[prop].bind(target);
      if (prop === "_set" || prop === "_get" || prop === "_has" || prop === "_delete" || prop === "_list") {
        return target[prop].bind(target);
      }
      return store._get(prop);
    },
    set(_target, prop, value) {
      if (typeof prop === "symbol") return true;
      store._set(prop, value);
      return true;
    },
    has(_target, prop) {
      if (typeof prop === "symbol") return false;
      return store._has(prop);
    },
    deleteProperty(_target, prop) {
      if (typeof prop === "symbol") return true;
      store._delete(prop);
      return true;
    },
    ownKeys() {
      return store._list();
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (typeof prop === "symbol") return undefined;
      if (!store._has(prop)) return undefined;
      return { configurable: true, enumerable: true, value: store._get(prop), writable: true };
    },
  });
}