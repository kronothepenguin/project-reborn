import {
  Color,
  ImageObject,
  List,
  Member,
  Movie,
  Player,
  Point,
  PropList,
  ScriptRef,
  Sprite,
  Rect,
  _timeouts,
  createListProxy,
  createPropListProxy,
  CastLibrary,
  Sound,
  DirectorWindow,
  TimeoutRef,
  ImageObjectRef,
  createList,
  createPropList,
} from "./core";

// ── Director Core Objects ──

export const _global = {};

export const _movie = new Movie();

export const _player = new Player(_movie);

// ── Constants ──

export const EMPTY = "";
export const VOID = null;
export const RETURN = "\r";
export const TAB = "\t";
export const SPACE = " ";
export const QUOTE = '"';

// ── Methods ──

export function beep() {}

export function bitAnd() {}

// export function bitNot() {}

export function bitOr() {}

export function bitXor() {}

export function call() {}

export function callAncestor() {}

export function castLib() {}

export function chars(stringExpression, firstCharacter, lastCharacter) {
  return stringExpression.substring(firstCharacter - 1, lastCharacter);
}

export function charToNum(stringExpression) {
  return stringExpression.charCodeAt(0);
}

export function color() {}

export function rgb(r, g, b) {
  return new Color(r ?? 0, g ?? 0, b ?? 0);
}

export function cos(angle) {
  return Math.cos(angle);
}

export function createMask() {}

export function cursor() {}

export function date() {}

export function externalParamValue() {}

export function float(expression) {
  return parseFloat(expression);
}

export function floatP(expression) {
  return (
    typeof expression === "number" &&
    !Number.isNaN(expression) &&
    !Number.isInteger(expression)
  );
}

export function getAt(list, position) {}

export function getNetText(url, propertyList) {}

export function getPref() {}

export function getStreamStatus() {}

export function go(frameNameOrNum) {
  _movie.go(frameNameOrNum);
}

export function gotoNetPage() {}

export function ilk(object, type) {
  if (typeof type === "symbol") {
    const result = ilk(object);

    switch (type) {
      case Symbol.for("list"):
        return (
          result === Symbol.for("list") ||
          result === Symbol.for("proplist") ||
          result === Symbol.for("rect") ||
          result === Symbol.for("point")
        );

      case Symbol.for("linearlist"):
        return result === Symbol.for("list");

      case Symbol.for("number"):
        return (
          result === Symbol.for("integer") || result === Symbol.for("float")
        );

      case Symbol.for("object"):
        return (
          result === Symbol.for("instance") ||
          result === Symbol.for("member") ||
          result === Symbol.for("xtra") ||
          result === Symbol.for("script") ||
          result === Symbol.for("castLib") ||
          result === Symbol.for("sprite") ||
          result === Symbol.for("window") ||
          result === Symbol.for("media") ||
          result === Symbol.for("timeout") ||
          result === Symbol.for("image")
        );

      default:
        return result === type;
    }
  }

  if (object instanceof List) return Symbol.for("list");
  if (object instanceof PropList) return Symbol.for("propList");
  if (typeof object === "number" && Number.isInteger(object))
    return Symbol.for("integer");
  if (typeof object === "number" && !Number.isNaN(object))
    return Symbol.for("float");
  if (typeof object === "string") return Symbol.for("string");
  if (object instanceof Rect) return Symbol.for("rect");
  if (object instanceof Point) return Symbol.for("point");
  if (object instanceof Color) return Symbol.for("color");
  if (object instanceof Date) return Symbol.for("date");
  if (typeof object === "symbol") return Symbol.for("symbol");
  if (object == void 0) return Symbol.for("void");
  // #picture
  // #instance (parent script instance)
  // #instance (xtra instance)
  if (object instanceof Member) return Symbol.for("member");
  // #xtra
  // #script
  if (object instanceof CastLibrary) return Symbol.for("castlib");
  if (object instanceof Sprite) return Symbol.for("sprite");
  if (object instanceof Sound) return Symbol.for("sound");
  if (object instanceof DirectorWindow) return Symbol.for("window");
  // #media
  if (object instanceof TimeoutRef) return Symbol.for("timeout");
  if (object instanceof ImageObjectRef) return Symbol.for("image");

  throw new Error("unknown type");
}

export function image(intWidth, intHeight, intBitDepth) {}

export function importFileInto() {}

export function inside() {}

export function integer(expression) {
  if (typeof expression === "string") return parseInt(expression, 10);
  return Math.trunc(expression);
}

export function integerP(expression) {
  return Number.isInteger(expression);
}

export function intersect(rectangle1, rectangle2) {}

export function length(str) {
  str.length;
}

export function list(...args) {
  return createList(...args);
}

export function listP(item) {
  return item instanceof List;
}

export function max() {}

export function member(nameOrNum, castLibNum) {
  // FIXME: return member obj ref
  if (typeof nameOrNum === "number") {
    const castLib =
      castLibNum !== undefined ? _movie.castLib[castLibNum] : _movie.castLib[1];
    if (!castLib) return new Member(Symbol.for("empty"));
    return (
      castLib._memberRegistry[nameOrNum] || new Member(Symbol.for("empty"))
    );
  }
  for (const castNum in _movie.castLib) {
    const cast = _movie.castLib[castNum];
    if (cast._memberRegistry[nameOrNum]) {
      return cast._memberRegistry[nameOrNum];
    }
  }
  return new Member(Symbol.for("empty"));
}

export function min() {}

export function netDone() {}

export function netError() {}

export function netTextResult() {}

export function newFn() {}

export function nothing() {}

export function numToChar() {}

export function objectP(x) {
  // FIXME:
  return (
    x !== null &&
    x !== undefined &&
    typeof x === "object" &&
    typeof x.construct === "function"
  );
}

export function offset(sub, str) {
  if (typeof str !== "string" || typeof sub !== "string") return 0;
  const idx = str.indexOf(sub);
  return idx === -1 ? 0 : idx + 1;
}

export function pass() {
  // TODO:
}

export function point(intH, intV) {
  // FIXME:
  return new Point();
}

export function postNetText() {}

export function power() {}

export function preloadNetThing() {}

export function propList(...args) {
  return createPropList(...args);
}

export function puppetSprite(inSpriteNum, flag) {
  _movie.puppetSprite(inSpriteNum, flag);
}

export function puppetTempo(intTempo) {
  _movie.puppetTempo(intTempo);
}

export function put(str) {
  console.group("director");
  console.log(str);
  console.groupEnd();
}

export function random(integerExpression) {
  return Math.floor(Math.random() * integerExpression) + 1;
}

export function rect(left, top, right, bottom) {
  // FIXME:
  return new Rect();
}

export function rollOver(intSpriteNum = 0) {
  return _movie.rollOver(intSpriteNum);
}

export function script(nameOrNum, castNameOrNum) {
  // FIXME: use script ref
  const mem = member(nameOrNum, castNameOrNum);
  if (mem._raw && typeof mem._raw === "function") {
    return new ScriptRef(mem);
  }
  console.warn("[script] Script not found:", nameOrNum);
  return {
    new() {
      return {};
    },
    handler() {
      return false;
    },
  };
}

export function setPref(name, val) {
  // FIXME:
  try {
    localStorage.setItem("pref_" + name, string(val));
  } catch {
    // Silently fail
  }
}

export function sin(angle) {
  return Math.sin(angle);
}

export function sound() {}

export function sprite(nameOrNum) {
  return new Sprite();
}

export function stopEvent() {
  // TODO: _movie.stopEvent()
}

export function string(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "symbol") return val.description || "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

export function stringP(x) {
  return typeof x === "string";
}

export function symbol(str) {
  return Symbol.for(str);
}

export function symbolp(x) {
  return typeof x === "symbol";
}

export function time() {
  return new Date().toLocaleTimeString();
}

export function timeout(name) {
  // FIXME:
  return {
    new: function (ms, handler, obj) {
      const id = string(name);
      _timeouts[id] = setInterval(() => {
        if (obj && typeof obj[handler] === "function") {
          obj[handler](this);
        } else if (_global[handler]) {
          _global[handler]();
        }
      }, ms);
      return { name: id };
    },
    forget: function () {
      const id = string(name);
      if (_timeouts[id]) {
        clearInterval(_timeouts[id]);
        delete _timeouts[id];
      }
    },
  };
}

export function value(str) {
  // FIXME:
  if (typeof str !== "string") return str;
  const trimmed = str.trim();
  if (trimmed === "1" || trimmed === "TRUE") return true;
  if (trimmed === "0" || trimmed === "FALSE") return false;
  if (trimmed === "VOID") return null;
  if (trimmed === "EMPTY") return "";
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  return trimmed;
}

export function voidP(x) {
  return x == void 0;
}

export function xtra() {}
