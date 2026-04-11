import { Point } from "./core";
import { _movie, _player } from "./runtime";

// -- Keywords --
export function range(first, last) {
  return `${first}..${last}`;
}

// textMemberExpression.char[whichCharacter] -> char(textMemberExpression)[whichCharacter]
// char whichCharacter of fieldOrStringVariable -> char(whichCharacter).of(fieldOrStringVariable)
// textMemberExpression.char[firstCharacter..lastCharacter] -> char(textMemberExpression)[range(firstCharacter, lastCharacter)]
// char firstCharacter to lastCharacter of fieldOrStringVariable -> char(firstCharacter).to(lastCharacter).of(fieldOrStringVariable)
export function char(expr) {
  if (typeof expr === "number") {
    return {
      of(text) {
        return text.charAt(expr - 1);
      },

      to(last) {
        return {
          of(text) {
            return text.substring(expr - 1, last);
          },
        };
      },
    };
  }

  if (typeof expr === "string") {
    return new Proxy(
      {
        get count() {
          return expr.length;
        },
      },
      {
        get(target, p, receiver) {
          if (typeof p === "string" && p.includes("..")) {
            const [first, last] = p.split("..");
            const start = Number(first);
            const end = Number(last);
            return expr.substring(start - 1, end);
          }
          const n = Number(p);
          if (Number.isInteger(n)) {
            return expr.charAt(n - 1);
          }
          return Reflect.get(target, p, receiver);
        },
      },
    );
  }

  throw new SyntaxError("expecte number or string");
}

// textMemberExpression.item[whichItem]
// item whichItem of fieldOrStringVariable
// textMemberExpression.item[firstItem..lastItem]
// item firstItem to lastItem of fieldOrStringVariable
export function item(expr) {
  if (typeof expr === "number") {
    return {
      of(text) {
        const items = text.split(the.itemDelimiter);
        return items[expr - 1];
      },

      to(last) {
        return {
          of(text) {
            const items = text.split(the.itemDelimiter);
            return items.slice(expr - 1, last).join(the.itemDelimiter);
          },
        };
      },
    };
  }

  if (typeof expr === "string") {
    const items = expr.split(the.itemDelimiter);

    return new Proxy(
      {
        get count() {
          return expr.length;
        },
      },
      {
        get(target, p, receiver) {
          if (typeof p === "string" && p.includes("..")) {
            const [first, last] = p.split("..");
            const start = Number(first);
            const end = Number(last);
            return items.slice(start - 1, end).join(the.itemDelimiter);
          }
          const n = Number(p);
          if (Number.isInteger(n)) {
            return items[n - 1];
          }
          return Reflect.get(target, p, receiver);
        },
      },
    );
  }

  throw new SyntaxError("expecte number or string");
}

// textMemberExpression.line[whichLine]
// line whichLine of fieldOrStringVariable
// textMemberExpression.line[firstLine..lastLine]
// line firstLine to lastLine of fieldOrStringVariable
export function line(expr) {
  if (typeof expr === "number") {
    return {
      of(text) {
        const lines = text.split("\r");
        return lines[expr - 1];
      },

      to(last) {
        return {
          of(text) {
            const lines = text.split("\r");
            return lines.slice(expr - 1, last).join("\r");
          },
        };
      },
    };
  }

  if (typeof expr === "string") {
    const lines = expr.split("\r");

    return new Proxy(
      {
        get count() {
          return expr.length;
        },
      },
      {
        get(target, p, receiver) {
          if (typeof p === "string" && p.includes("..")) {
            const [first, last] = p.split("..");
            const start = Number(first);
            const end = Number(last);
            return lines.slice(start - 1, end).join("\r");
          }
          const n = Number(p);
          if (Number.isInteger(n)) {
            return lines[n - 1];
          }
          return Reflect.get(target, p, receiver);
        },
      },
    );
  }

  throw new SyntaxError("expecte number or string");
}

// member(whichCastMember).word[whichWord]
// textMemberExpression.word[whichWord]
// chunkExpression.word[whichWord]
// word whichWord of fieldOrStringVariable
// fieldOrStringVariable. word[whichWord]
// textMemberExpression.word[firstWord..lastWord]
// member(whichCastMember).word[firstWord..lastWord]
// word firstWord to lastWord of chunkExpression
// chunkExpression.word[whichWord..lastWord]
export function word(expr) {
  if (typeof expr === "number") {
    return {
      of(text) {
        const lines = text.split(/\s+/);
        return lines[expr - 1];
      },

      to(last) {
        return {
          of(text) {
            const lines = text.split(/\s+/);
            return lines.slice(expr - 1, last).join(" ");
          },
        };
      },
    };
  }

  if (typeof expr === "string") {
    const lines = expr.split(/\s+/);

    return new Proxy(
      {
        get count() {
          return expr.length;
        },
      },
      {
        get(target, p, receiver) {
          if (typeof p === "string" && p.includes("..")) {
            const [first, last] = p.split("..");
            const start = Number(first);
            const end = Number(last);
            return lines.slice(start - 1, end).join(" ");
          }
          const n = Number(p);
          if (Number.isInteger(n)) {
            return lines[n - 1];
          }
          return Reflect.get(target, p, receiver);
        },
      },
    );
  }

  throw new SyntaxError("expecte number or string");
}

// -- Properties --
export const the = new Proxy(
  {
    alertHook: 0,
    environment: {
      [Symbol.for("productVersion")]: navigator.userAgent,
      [Symbol.for("productBuildVersion")]: "",
      [Symbol.for("osVersion")]: navigator.platform,
    },
    frame: 1,
    itemDelimiter: ",",
    keyboardFocusSprite: 0,
    lastChannel: 100,
    longTime: 0,
    milliSeconds: 0,
    numberOfCastLibs: 0,
    mouseV: 0,
    mouseH: 0,
    mouseLoc: new Point(),
    runMode: "Plugin",
    // the last chunk of ( chunkExpression )
    // the last chunk in (chunkExpression)
    stageBottom: 0,
    stageLeft: 0,
    stageRight: 0,
    stageTop: 0,
  },
  {
    get(target, p, receiver) {
      switch (p) {
        case "milliSeconds":
          return Date.now();

        case "numberOfCastLibs":
          return _movie._castCount;

        case "mouseLoc":
          return new Point(); // TODO
      }
      return Reflect.get(target, p, receiver);
    },
    set(target, p, newValue, receiver) {
      switch (p) {
        default:
          return Reflect.set(target, p, newValue, receiver);
      }
    },
  },
);

export function numberOfCastMembersOfCastLib(castLibNum) {
  const cast = _movie.castLib[castLibNum];
  if (!cast) return 0;
  return Object.keys(cast._memberRegistry).filter((k) =>
    Number.isInteger(Number(k)),
  ).length;
}

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

export function itemOf(str) {
  const items = str.split(the.itemDelimiter);
  return createSplitterProxy(items, () => the.itemDelimiter);
}

export function lineOf(str) {
  const items = str.split("\r");
  return createSplitterProxy(items, "\r");
}

export function wordOf(str) {
  const items = str.split(/\s+/);
  return createSplitterProxy(items, " ");
}

export function putAfter(expression, chunkExpression) {
  // TODO:
  return "";
}
