// Linear list data type (Director MX 2004 Scripting Reference — list()).
// Verbatim JSDoc quoted from docs/drmx2004_scripting_ref/ (essentials + methods.txt).
//
// Refactor T006: removed `#` private fields (`#items`, `#sorted`) — `items` and
// `sorted` are plain public fields. `count` is a derived documented property
// (essentials: `trace(workerList.count)` → the number of entries) kept as a
// getter over `items.length`. Symbol.iterator retained. The bracket-access
// Proxy implements documented JS-syntax indexing (`workerList[2]`, `1 in list`).

// Alphanumeric comparison per the docs (director_scripting_essentials.txt
// 1759-1761): "sort in alphanumeric order, with numbers being sorted before
// strings" and "strings are sorted according to their initial letters".
function compareValues(a, b) {
  const an = typeof a === "number";
  const bn = typeof b === "number";
  if (an && bn) return a - b;
  if (!an && !bn) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
  return an ? -1 : 1;
}

export class List {
  /**
   * The entries of the linear list. The index into a linear list created with
   * list() always begins with 1.
   */
  items = [];

  /**
   * Whether the list is currently sorted. After the values in a list are
   * sorted, they remain sorted, even as values are added to or removed from the
   * list.
   */
  sorted = false;

  /**
   * Top level function; creates a linear list. When creating a list using the
   * syntax list(), with or without parameters, the index of list values begins
   * with 1.
   *
   * @param {...*} [values] Optional. A list of strings that specify the initial values in the list.
   */
  constructor(...values) {
    this.items = values;
    this.sorted = false;
  }

  /**
   * Property; returns the number of entries in a linear or property list.
   */
  get count() {
    return this.items.length;
  }

  [Symbol.iterator]() {
    let index = 0;
    const items = this.items;
    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false };
        }
        return { done: true };
      },
    };
  }

  /**
   * List command; adds a value to a sorted list at its proper position. For an
   * unsorted list, adds the value to the end of the list.
   *
   * @param {*} value A value to add to the list.
   */
  add(value) {
    if (this.sorted) {
      let i = 0;
      while (i < this.items.length && compareValues(this.items[i], value) <= 0) {
        i++;
      }
      this.items.splice(i, 0, value);
    } else {
      this.items.push(value);
    }
  }

  /**
   * List command; for linear lists only, adds a value at a specified position
   * in the list. This command returns an error when used with a property list.
   *
   * @param {number} position Required. An integer that specifies the position in the list to which the value specified by value is added.
   * @param {*} value      Required. A value to add to the list.
   */
  addAt(position, value) {
    this.items.splice(position - 1, 0, value);
  }

  /**
   * List command; for linear lists only, adds the specified value to the end of
   * a linear list. This differs from the add command, which adds a value to a
   * sorted list according to the list's order. This command returns a script
   * error when used with a property list.
   *
   * @param {*} value Required. The value to add to the end of the linear list.
   */
  append(value) {
    this.items.push(value);
  }

  /**
   * List command; deletes an item from a linear or property list. The deleteAt
   * command checks whether an item is in a list; if you try to delete an object
   * that isn't in the list, Director displays an alert.
   *
   * @param {number} position Required. Specifies the position of the item in the list to delete.
   */
  deleteAt(position) {
    if (position < 1 || position > this.items.length) return;
    this.items.splice(position - 1, 1);
  }

  /**
   * Deletes the first occurrence of a value from the list. Does nothing if the
   * value is not in the list.
   *
   * @param {*} value The value to delete.
   */
  deleteOne(value) {
    const index = this.items.indexOf(value);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  /**
   * List command; deletes the specified item from the specified list. For
   * linear lists, the deleteProp command is the same as the deleteAt command.
   *
   * @param {number} item Required. The item to delete from the list.
   */
  deleteProp(item) {
    this.deleteAt(item);
  }

  /**
   * List function; returns a copy of a list and copies nested lists (list
   * items that also are lists) and their contents. The function is useful for
   * saving a list's current content.
   *
   * @returns {List}
   */
  duplicate() {
    const copy = this.items.map((item) =>
      item instanceof List ? item.duplicate() : item
    );
    const newList = new List();
    newList.items = copy;
    newList.sorted = this.sorted;
    return newList;
  }

  /**
   * List function; retrieves the specified element of a list. If the list
   * contains fewer elements than the specified position, a script error occurs.
   *
   * @param {number} position Required. An integer specifying the 1-based position of the element to retrieve.
   * @returns {*}
   */
  getAt(position) {
    if (position < 1 || position > this.items.length) {
      throw new Error("Script error: the list does not contain an element at position " + position);
    }
    return this.items[position - 1];
  }

  /**
   * List function; identifies the position of a value in a list. When the
   * specified value is not in the list, returns the value 0. For values
   * contained in the list more than once, only the first occurrence is
   * displayed. Performs the same function as getPos for linear lists.
   *
   * @param {*} value Required. Specifies the value associated with the position.
   * @returns {number} The 1-indexed position, or 0 if not found.
   */
  getOne(value) {
    const index = this.items.indexOf(value);
    return index === -1 ? 0 : index + 1;
  }

  /**
   * List function; identifies the position of a value in a list. When the
   * specified value is not in the list, the getPos command returns the value 0.
   * For values contained in the list more than once, only the first occurrence
   * is displayed. Performs the same function as the getOne command for linear
   * lists.
   *
   * @param {*} value Required. Specifies the value associated with the position.
   * @returns {number} The 1-indexed position, or 0 if not found.
   */
  getPos(value) {
    return this.getOne(value);
  }

  /**
   * Returns the last value in the list.
   *
   * @returns {*} The last value, or VOID (null) if the list is empty.
   */
  getLast() {
    return this.items.length === 0 ? null : this.items[this.items.length - 1];
  }

  /**
   * Command; replaces the item specified by orderNumber with the value
   * specified by value in the list. When orderNumber is greater than the number
   * of items in a linear list, Director expands the list's blank entries to
   * provide the number of places specified by orderNumber.
   *
   * @param {number} position The 1-indexed position to replace (or extend to).
   * @param {*} value      The new value.
   */
  setAt(position, value) {
    while (this.items.length < position) {
      this.items.push(0);
    }
    this.items[position - 1] = value;
  }

  /**
   * Sorts the list in alphanumeric order, with numbers being sorted before
   * strings. After the values in a list are sorted, they remain sorted, even as
   * values are added to or removed from the list.
   */
  sort() {
    this.items.sort(compareValues);
    this.sorted = true;
  }
}

/**
 * list()
 * list(stringValue1, stringValue2, ...)
 *
 * Top level function; creates a linear list. When creating a list using the
 * syntax list(), with or without parameters, the index of list values begins
 * with 1.
 *
 * @param {...*} [values] Optional. A list of strings that specify the initial values in the list.
 * @returns {List}
 */
export function list(...values) {
  return createListProxy(...values);
}

function createListProxy(...values) {
  const target = new List(...values);
  return new Proxy(target, {
    get(t, prop) {
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num)) {
        return t.getAt(num);
      }
      const value = Reflect.get(t, prop);
      if (typeof value === "function") {
        return value.bind(t);
      }
      return value;
    },
    set(t, prop, value) {
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num) && num >= 1) {
        t.setAt(num, value);
        return true;
      }
      return Reflect.set(t, prop, value);
    },
    has(t, prop) {
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num) && num >= 1) {
        return num <= t.count;
      }
      return Reflect.has(t, prop);
    },
  });
}