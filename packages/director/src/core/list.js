export class List {
  #items;
  #sorted;

  constructor(...args) {
    this.#items = args;
    this.#sorted = false;
  }

  get count() {
    return this.#items.length;
  }

  get sorted() {
    return this.#sorted;
  }

  [Symbol.iterator]() {
    let index = 0;
    const items = this.#items;
    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false };
        }
        return { done: true };
      },
    };
  }

  add(value) {
    if (this.#sorted) {
      let i = 0;
      while (i < this.#items.length && this.#items[i] < value) {
        i++;
      }
      this.#items.splice(i, 0, value);
    } else {
      this.#items.push(value);
    }
  }

  addAt(position, value) {
    this.#items.splice(position - 1, 0, value);
  }

  append(value) {
    this.#items.push(value);
  }

  deleteAt(position) {
    this.#items.splice(position - 1, 1);
  }

  deleteOne(value) {
    const index = this.#items.indexOf(value);
    if (index !== -1) {
      this.#items.splice(index, 1);
    }
  }

  deleteProp(item) {
    this.deleteAt(item);
  }

  duplicate() {
    const copy = this.#items.map((item) =>
      item instanceof List ? item.duplicate() : item
    );
    const newList = new List();
    newList.#items = copy;
    newList.#sorted = this.#sorted;
    return newList;
  }

  getAt(position) {
    return this.#items[position - 1];
  }

  getOne(value) {
    const index = this.#items.indexOf(value);
    return index === -1 ? 0 : index + 1;
  }

  getPos(value) {
    return this.getOne(value);
  }

  getLast() {
    return this.#items[this.#items.length - 1];
  }

  setAt(position, value) {
    while (this.#items.length < position) {
      this.#items.push(0);
    }
    this.#items[position - 1] = value;
  }

  sort() {
    this.#items.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.#sorted = true;
  }

  _getItems() {
    return this.#items;
  }
}

export function list(...args) {
  return createListProxy(...args);
}

function createListProxy(...args) {
  const l = new List(...args);
  return new Proxy(l, {
    get(target, prop) {
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
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num) && num >= 1) {
        target.setAt(num, value);
        return true;
      }
      return Reflect.set(target, prop, value);
    },
    has(target, prop) {
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num) && num >= 1) {
        return num <= target.count;
      }
      return Reflect.has(target, prop);
    },
  });
}
