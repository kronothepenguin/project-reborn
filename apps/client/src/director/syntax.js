import { createListProxy } from "./core";
import { _player } from "./runtime";

export const the = new Proxy(
  {
    frame: 1,
    itemDelimiter: ",",
    keyboardFocusSprite: 0,
    longTime: 0,
    mouseV: 0,
    mouseH: 0,
    runMode: "Plugin",
  },
  {
    set(target, p, newValue, receiver) {
      switch (p) {
        default:
          return Reflect.set(target, p, newValue, receiver);
      }
    },
  },
);

/**
 *
 * @param {string[]} items
 * @returns
 */
function createSplitterProxy(items, separator) {
  return new Proxy(
    {
      get count() {
        return items.length;
      },

      slice(start, end) {
        return items
          .slice(start ? start - 1 : undefined, end ? end - 1 : undefined)
          .join(typeof separator === "function" ? separator() : separator);
      },
    },
    {
      get(target, p, receiver) {
        if (p in target) return Reflect.get(target, p, receiver);
        const n = Number(p);
        if (Number.isInteger(n)) {
          return items[n - 1];
        }
        return Reflect.get(target, p, receiver);
      },
      // set(target, p, newValue, receiver) {
      //   if (p in target) return Reflect.set(target, p, newValue, receiver);
      //   const n = Number(p);
      //   if (Number.isInteger(n)) {
      //     if (n > 0 && n <= items.length) {
      //       items[n - 1] = newValue;
      //       return true;
      //     }
      //     return false;
      //   }
      //   return Reflect.set(target, p, newValue, receiver);
      // },
    },
  );
}

/**
 *
 * @param {string} str
 */
export function itemOf(str) {
  const items = str.split(the.itemDelimiter);
  return createSplitterProxy(items, () => the.itemDelimiter);
}

/**
 *
 * @param {string} str
 * @returns
 */
export function lineOf(str) {
  const items = str.split("\r");
  return createSplitterProxy(items, "\r");
}

/**
 *
 * @param {string} str
 */
export function wordOf(str) {
  const items = str.split(/\s+/);
  return createSplitterProxy(items, " ");
}

/**
 *
 * @param {string} str
 * @returns
 */
export function charOf(str) {
  return new Proxy(
    {
      get count() {
        return str.length;
      },

      slice(start, end) {
        return str.slice(
          start ? start - 1 : undefined,
          end ? end - 1 : undefined,
        );
      },
    },
    {
      get(target, p, receiver) {
        if (p in target) return Reflect.get(target, p, receiver);
        const n = Number(p);
        if (Number.isInteger(n)) {
          return str[n - 1];
        }
        return Reflect.get(target, p, receiver);
      },
    },
  );
}
