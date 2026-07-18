// Property list data type (Director MX 2004 Scripting Reference — propList()).
// Verbatim JSDoc quoted from docs/drmx2004_scripting_ref/ (essentials + methods.txt).
//
// Refactor T009: removed `#` private fields (`#entries`, `#sorted`) — `entries`
// and `sorted` are plain public fields. `count` is a derived documented property
// kept as a getter over `entries.length`. Symbol.iterator retained. The
// bracket-access Proxy implements documented JS-syntax indexing and symbol-keyed
// property access (`foodList["breakfast"]`, `foodList[#Bruno]`).

import { List } from "./list.js";

function symbolToString(sym) {
  if (typeof sym === "symbol") {
    return sym.description || "";
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

export class PropList {
  /**
   * The name/value entries of the property list. The index of list values
   * begins with 1.
   */
  entries = [];

  /**
   * Whether the list is currently sorted. After the values in a property list
   * are sorted, they remain sorted, even as values are added to or removed from
   * the list. A property list is sorted according to the property names.
   */
  sorted = false;

  /**
   * Top level function; creates a property list, where each element in the list
   * consists of a name/value pair. When creating a property list using the
   * syntax propList() or [:] (Lingo only), with or without parameters, the index
   * of list values begins with 1.
   *
   * @param {...*} [pairs] Alternating property-name / value arguments.
   */
  constructor(...pairs) {
    this.entries = [];
    this.sorted = false;
    for (let i = 0; i < pairs.length; i += 2) {
      this.entries.push({ symbol: pairs[i], value: pairs[i + 1] });
    }
  }

  /**
   * Property; returns the number of entries in a linear or property list.
   */
  get count() {
    return this.entries.length;
  }

  [Symbol.iterator]() {
    let index = 0;
    const entries = this.entries;
    return {
      next() {
        if (index < entries.length) {
          return { value: entries[index++].value, done: false };
        }
        return { done: true };
      },
    };
  }

  /**
   * Property list command; for property lists only, adds a specified property
   * and its value to a property list. For an unsorted list, the value is added
   * to the end of the list. For a sorted list, the value is placed in its proper
   * order. If the property already exists in the list, both Lingo and JavaScript
   * syntax create a duplicate property. This command returns an error when used
   * with a linear list.
   *
   * @param {*} property Required. The property to add to the list.
   * @param {*} value    Required. The value of the property to add to the list.
   */
  addProp(property, value) {
    if (this.sorted) {
      const name = symbolToString(property);
      let i = 0;
      while (i < this.entries.length && symbolToString(this.entries[i].symbol) <= name) {
        i++;
      }
      this.entries.splice(i, 0, { symbol: property, value });
    } else {
      this.entries.push({ symbol: property, value });
    }
  }

  /**
   * List command; deletes an item from a linear or property list.
   *
   * @param {number} position Required. Specifies the position of the item in the list to delete.
   */
  deleteAt(position) {
    this.entries.splice(position - 1, 1);
  }

  /**
   * Deletes the first occurrence of a value from the list. Does nothing if the
   * value is not in the list.
   *
   * @param {*} value The value to delete.
   */
  deleteOne(value) {
    const index = this.entries.findIndex((e) => e.value === value);
    if (index !== -1) {
      this.entries.splice(index, 1);
    }
  }

  /**
   * List command; deletes the specified item from the specified list. For
   * property lists, replace item with the name of the property to be deleted.
   * Deleting a property also deletes its associated value. If the list has more
   * than one of the same property, only the first property in the list is
   * deleted.
   *
   * @param {*} property Required. The item to delete from the list.
   */
  deleteProp(property) {
    const index = this.entries.findIndex((e) => e.symbol === property);
    if (index !== -1) {
      this.entries.splice(index, 1);
    }
  }

  /**
   * List function; returns a copy of a list and copies nested lists (list items
   * that also are lists) and their contents.
   *
   * @returns {PropList}
   */
  duplicate() {
    const copy = new PropList();
    copy.entries = this.entries.map((e) => ({
      symbol: e.symbol,
      value:
        e.value instanceof List
          ? e.value.duplicate()
          : e.value instanceof PropList
            ? e.value.duplicate()
            : e.value,
    }));
    copy.sorted = this.sorted;
    return copy;
  }

  /**
   * List command; identifies the position of a property in a property list. The
   * findPos command is VOID when the specified property is not in the list.
   *
   * @param {*} property Required. The property whose position is identified.
   * @returns {number|undefined} The 1-indexed position, or undefined if not found.
   */
  findPos(property) {
    const index = this.entries.findIndex((e) => e.symbol === property);
    return index === -1 ? undefined : index + 1;
  }

  /**
   * List command; for sorted lists only, identifies the position of an item in a
   * specified sorted list. When the specified property is not in the list,
   * identifies the position of the value with the most similar alphanumeric name.
   *
   * @param {*} valueOrProperty Required. The value or property whose position is identified.
   * @returns {number} The 1-indexed position (1 if the list is empty).
   */
  findPosNear(valueOrProperty) {
    if (this.entries.length === 0) return 1;
    const name = symbolToString(valueOrProperty);
    let bestIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < this.entries.length; i++) {
      const entryName = symbolToString(this.entries[i].symbol);
      if (entryName === name) return i + 1;
      const dist = levenshtein(name, entryName);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }
    return bestIndex + 1;
  }

  /**
   * Retrieves the value associated with a property in a property list. Returns
   * undefined when the property is not in the list.
   *
   * @param {*} property The property whose value is retrieved.
   * @returns {*} The value, or undefined.
   */
  getaProp(property) {
    const entry = this.entries.find((e) => e.symbol === property);
    return entry ? entry.value : undefined;
  }

  /**
   * Retrieves the value at a 1-indexed position in the list.
   *
   * @param {number} position The 1-indexed position.
   * @returns {*} The value at that position, or undefined if out of range.
   */
  getAt(position) {
    const entry = this.entries[position - 1];
    return entry ? entry.value : undefined;
  }

  /**
   * List function; identifies the property associated with a value in a
   * property list. When the specified value is not in the list, returns 0. For
   * values contained in the list more than once, only the first occurrence is
   * displayed.
   *
   * @param {*} value Required. Specifies the value associated with the property.
   * @returns {*} The property symbol, or 0 if not found.
   */
  getOne(value) {
    const index = this.entries.findIndex((e) => e.value === value);
    return index === -1 ? 0 : this.entries[index].symbol;
  }

  /**
   * List function; identifies the position of a value in a list. When the
   * specified value is not in the list, returns the value 0. For values
   * contained in the list more than once, only the first occurrence is
   * displayed.
   *
   * @param {*} value Required. Specifies the value associated with the position.
   * @returns {number} The 1-indexed position, or 0 if not found.
   */
  getPos(value) {
    const index = this.entries.findIndex((e) => e.value === value);
    return index === -1 ? 0 : index + 1;
  }

  /**
   * Property list function; identifies the value associated with a property in a
   * property list. Almost identical to the getaProp command, the getProp command
   * displays an error message if the specified property is not in the list or if
   * you specify a linear list.
   *
   * @param {*} property Required. Specifies the property with which the identified value is associated.
   * @returns {*} The value associated with the property.
   */
  getProp(property) {
    const entry = this.entries.find((e) => e.symbol === property);
    if (!entry) {
      throw new Error(`Property not found: ${symbolToString(property)}`);
    }
    return entry.value;
  }

  /**
   * Property list function; for property lists only, identifies the property
   * name associated with a specified position in a property list. If the
   * specified item isn't in the list, or if you use getPropAt() with a linear
   * list, a script error occurs.
   *
   * @param {number} index Required. Specifies the index position of the property in the property list.
   * @returns {*} The property name at that position.
   */
  getPropAt(index) {
    const entry = this.entries[index - 1];
    if (!entry) {
      throw new Error(`Index out of bounds: ${index}`);
    }
    return entry.symbol;
  }

  /**
   * Command; replaces the value assigned to listProperty with the value
   * specified by newValue. Works with property lists. When the property isn't
   * already in the list, adds the new property and value.
   *
   * @param {*} listProperty Required. A symbol (Lingo only) or a string that specifies the name of the property whose value is changing.
   * @param {*} newValue     Required. The new value for the listProperty property.
   */
  setaProp(listProperty, newValue) {
    const entry = this.entries.find((e) => e.symbol === listProperty);
    if (entry) {
      entry.value = newValue;
    } else {
      this.entries.push({ symbol: listProperty, value: newValue });
    }
  }

  /**
   * Command; replaces the item specified by orderNumber with the value
   * specified by value in the list. When orderNumber is greater than the number
   * of items in a property list, the setAt command returns a script error.
   *
   * @param {number} position The 1-indexed position to replace.
   * @param {*} value      The new value.
   */
  setAt(position, value) {
    const entry = this.entries[position - 1];
    if (entry) {
      entry.value = value;
    }
  }

  /**
   * Sorts the property list in alphanumeric order according to the property
   * names. After the values in a list are sorted, they remain sorted, even as
   * values are added to or removed from the list.
   */
  sort() {
    this.entries.sort((a, b) => {
      const nameA = symbolToString(a.symbol);
      const nameB = symbolToString(b.symbol);
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
    this.sorted = true;
  }
}

/**
 * propList()
 * propList(string1, value1, string2, value2, ...)
 *
 * Top level function; creates a property list, where each element in the list
 * consists of a name/value pair. When creating a property list using the syntax
 * propList() or [:] (Lingo only), with or without parameters, the index of list
 * values begins with 1.
 *
 * @param {...*} [pairs] Optional. Alternating property-name / value arguments.
 * @returns {PropList}
 */
export function propList(...pairs) {
  return createPropListProxy(...pairs);
}

function createPropListProxy(...pairs) {
  const target = new PropList(...pairs);
  return new Proxy(target, {
    get(t, prop) {
      if (typeof prop === "symbol") {
        return t.getaProp(prop);
      }
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num) && num >= 1) {
        return t.getAt(num);
      }
      const value = Reflect.get(t, prop);
      if (typeof value === "function") {
        return value.bind(t);
      }
      return value;
    },
    set(t, prop, value) {
      if (typeof prop === "symbol") {
        t.setaProp(prop, value);
        return true;
      }
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num) && num >= 1) {
        t.setAt(num, value);
        return true;
      }
      return Reflect.set(t, prop, value);
    },
    has(t, prop) {
      if (typeof prop === "symbol") {
        return t.findPos(prop) !== undefined;
      }
      const num = typeof prop === "string" ? Number(prop) : prop;
      if (typeof num === "number" && Number.isInteger(num) && num >= 1) {
        return num <= t.count;
      }
      return Reflect.has(t, prop);
    },
  });
}