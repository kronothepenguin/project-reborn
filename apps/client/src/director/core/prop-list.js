import { List } from "./list.js";

export class PropList {
  #entries;
  #sorted;

  constructor(...args) {
    this.#entries = [];
    this.#sorted = false;
    for (let i = 0; i < args.length; i += 2) {
      this.#entries.push({ symbol: args[i], value: args[i + 1] });
    }
  }

  get count() {
    return this.#entries.length;
  }

  get sorted() {
    return this.#sorted;
  }

  [Symbol.iterator]() {
    let index = 0;
    const entries = this.#entries;
    return {
      next() {
        if (index < entries.length) {
          return { value: entries[index++].value, done: false };
        }
        return { done: true };
      },
    };
  }

  addProp(symbol, value) {
    if (this.#sorted) {
      const name = symbolToString(symbol);
      let i = 0;
      while (i < this.#entries.length && symbolToString(this.#entries[i].symbol) <= name) {
        i++;
      }
      this.#entries.splice(i, 0, { symbol, value });
    } else {
      this.#entries.push({ symbol, value });
    }
  }

  deleteAt(position) {
    this.#entries.splice(position - 1, 1);
  }

  deleteOne(value) {
    const index = this.#entries.findIndex((e) => e.value === value);
    if (index !== -1) {
      this.#entries.splice(index, 1);
    }
  }

  deleteProp(symbol) {
    const index = this.#entries.findIndex((e) => e.symbol === symbol);
    if (index !== -1) {
      this.#entries.splice(index, 1);
    }
  }

  duplicate() {
    const copy = new PropList();
    copy.#entries = this.#entries.map((e) => ({
      symbol: e.symbol,
      value: e.value instanceof List ? e.value.duplicate() : e.value instanceof PropList ? e.value.duplicate() : e.value,
    }));
    copy.#sorted = this.#sorted;
    return copy;
  }

  findPos(symbol) {
    const index = this.#entries.findIndex((e) => e.symbol === symbol);
    return index === -1 ? undefined : index + 1;
  }

  findPosNear(symbol) {
    if (this.#entries.length === 0) return 1;
    const name = symbolToString(symbol);
    let bestIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < this.#entries.length; i++) {
      const entryName = symbolToString(this.#entries[i].symbol);
      if (entryName === name) return i + 1;
      const dist = levenshtein(name, entryName);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }
    return bestIndex + 1;
  }

  getaProp(symbol) {
    const entry = this.#entries.find((e) => e.symbol === symbol);
    return entry ? entry.value : undefined;
  }

  getAt(position) {
    const entry = this.#entries[position - 1];
    return entry ? entry.value : undefined;
  }

  getOne(value) {
    const index = this.#entries.findIndex((e) => e.value === value);
    return index === -1 ? 0 : this.#entries[index].symbol;
  }

  getPos(value) {
    const index = this.#entries.findIndex((e) => e.value === value);
    return index === -1 ? 0 : index + 1;
  }

  getProp(symbol) {
    const entry = this.#entries.find((e) => e.symbol === symbol);
    if (!entry) {
      throw new Error(`Property not found: ${symbolToString(symbol)}`);
    }
    return entry.value;
  }

  getPropAt(index) {
    const entry = this.#entries[index - 1];
    if (!entry) {
      throw new Error(`Index out of bounds: ${index}`);
    }
    return entry.symbol;
  }

  setaProp(symbol, value) {
    const entry = this.#entries.find((e) => e.symbol === symbol);
    if (entry) {
      entry.value = value;
    } else {
      this.#entries.push({ symbol, value });
    }
  }

  setAt(position, value) {
    const entry = this.#entries[position - 1];
    if (entry) {
      entry.value = value;
    }
  }

  sort() {
    this.#entries.sort((a, b) => {
      const nameA = symbolToString(a.symbol);
      const nameB = symbolToString(b.symbol);
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
    this.#sorted = true;
  }

  _getEntries() {
    return this.#entries;
  }
}

export function propList(...args) {
  return createPropListProxy(...args);
}

function createPropListProxy(...args) {
  const pl = new PropList(...args);
  return new Proxy(pl, {
    get(target, prop) {
      if (typeof prop === "symbol") {
        return target.getaProp(prop);
      }
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num) && num >= 1) {
        return target.getAt(num);
      }
      const value = Reflect.get(target, prop);
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
    set(target, prop, value) {
      if (typeof prop === "symbol") {
        target.setaProp(prop, value);
        return true;
      }
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num) && num >= 1) {
        target.setAt(num, value);
        return true;
      }
      return Reflect.set(target, prop, value);
    },
    has(target, prop) {
      if (typeof prop === "symbol") {
        return target.findPos(prop) !== undefined;
      }
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num) && num >= 1) {
        return num <= target.count;
      }
      return Reflect.has(target, prop);
    },
  });
}

function symbolToString(sym) {
  if (typeof sym === "symbol") {
    const desc = sym.description;
    return desc || "";
  }
  return String(sym);
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}
