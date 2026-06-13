import {
  Color,
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
  CastLibrary,
  Sound,
  DirectorWindow,
  TimeoutRef,
  ImageObjectRef,
  createList,
  createPropList,
  Key,
  Mouse,
  System,
} from "./core";

// ── Director Core Objects ──

export const _global = {};

export const _key = new Key();

export const _mouse = new Mouse();

export const _movie = new Movie();

export const _player = new Player();

export const _sound = new Sound();

export const _system = new System();

export const _window = new DirectorWindow();

// ── Constants ──

export const EMPTY = "";
export const PI = Math.PI;
export const QUOTE = '"';
export const RETURN = "\r";
export const SPACE = " ";
export const TAB = "\t";
export const VOID = void 0;

// ── Methods ──

export function abs(numericExpression) {
  return Math.abs(numericExpression);
}

export function atan(angle) {
  return Math.atan(angle);
}

export function beep() {}

export function bitAnd(a, b) {
  return a & b;
}

export function bitNot(a) {
  return ~a;
}

export function bitOr(a, b) {
  return a | b;
}

export function bitXor(a, b) {
  return a ^ b;
}

export function call(handlerName, script, ...args) {
  const method = handlerName.description;

  if (listP(script)) {
    for (const instance of script) {
      instance[method].apply(instance, args);
    }
  } else {
    script[method].apply(script, args);
  }
}

export function callAncestor() {}

export function castLib() {}

export function chars(stringExpression, firstCharacter, lastCharacter) {
  return stringExpression.substring(firstCharacter - 1, lastCharacter);
}

export function charToNum(stringExpression) {
  return stringExpression.charCodeAt(0);
}

export function color() {}

export function copyPixels() {}

export function cos(angle) {
  return Math.cos(angle);
}

export function createMask() {}

export function cursor() {}

export function date() {
  if (arguments.length === 0) {
    return new Date().toLocaleDateString();
  }
  const [year, month, day] = arguments;
  return new Date(year, month - 1, day);
}

export function externalParamValue() {}

export function fill() {}

export function findPos(propList, symbol) {
  return propList.findPos(symbol);
}

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

export function getAt(list, position) {
  return list[position];
}

export function getNetText(url, propertyList) {}

export function getPixel() {}

export function getPref() {}

export function getProp(propList, symbol) {
  return propList.getaProp(symbol);
}

export function getPropAt(propList, index) {
  return propList.getPropAt(index);
}

export function getStreamStatus() {}

export function go(frameNameOrNum) {
  _movie.go(frameNameOrNum);
}

export function gotoNetPage() {}

export function halt() {
  _movie._frame = 0;
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
  if (object instanceof Member) return Symbol.for("member");
  if (object instanceof CastLibrary) return Symbol.for("castlib");
  if (object instanceof Sprite) return Symbol.for("sprite");
  if (object instanceof Sound) return Symbol.for("sound");
  if (object instanceof DirectorWindow) return Symbol.for("window");
  if (object instanceof TimeoutRef) return Symbol.for("timeout");
  if (object instanceof ImageObjectRef) return Symbol.for("image");

  throw new Error("unknown type");
}

export function length(str) {
  return str.length;
}

export function list(...args) {
  return createList(...args);
}

export function listP(item) {
  return item instanceof List;
}

export function log(number) {
  return Math.log(number);
}

export function max(...args) {
  if (args.length === 1 && args[0] instanceof List) {
    return Math.max(...args[0]._values);
  }
  return Math.max(...args);
}

export function member(nameOrNum, castLibNum) {
  if (typeof nameOrNum === "number") {
    const castLib =
      castLibNum !== undefined ? _movie.castLib[castLibNum] : _movie.castLib[1];
    if (!castLib) return new Member(Symbol.for("empty"));
    return (
      castLib._member[nameOrNum] || new Member(Symbol.for("empty"))
    );
  }
  for (const castNum in _movie.castLib) {
    const cast = _movie.castLib[castNum];
    if (cast && cast._member && cast._member[nameOrNum]) {
      return cast._member[nameOrNum];
    }
  }
  return new Member(Symbol.for("empty"));
}

export function min(...args) {
  if (args.length === 1 && args[0] instanceof List) {
    return Math.min(...args[0]._values);
  }
  return Math.min(...args);
}

export function moveToBack(window) {}

export function moveToFront(window) {}

export function netAbort(netID) {}

export function netDone() {}

export function netError() {}

export function netLastModDate(netID) {}

export function netMIME(netID) {}

export function netTextResult() {}

export function newFn(scriptRef) {
  return scriptRef.new();
}

export function newMember(type) {
  return new Member(type);
}

export function nothing() {}

export function numToChar(code) {
  return String.fromCharCode(code);
}

export function objectP(x) {
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

export function param(i) {
  return arguments[i];
}

export function paramCount() {
  return arguments.length;
}

export function pass() {}

export function playSound(channel, member) {}

export function point(intH, intV) {
  return new Point();
}

export function postNetText() {}

export function power(base, exponent) {
  return Math.pow(base, exponent);
}

export function preLoadMember(member) {}

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

export function queueSound(channel, member) {}

export function quit() {
  _movie._frame = 0;
}

export function random(integerExpression) {
  return Math.floor(Math.random() * integerExpression) + 1;
}

export function rawNew(scriptRef) {
  return scriptRef.new();
}

export function rect(left, top, right, bottom) {
  return new Rect();
}

export function resetCastLibs() {}

export function rollOver(intSpriteNum = 0) {
  return _movie.rollOver(intSpriteNum);
}

export function script(nameOrNum, castNameOrNum) {
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

export function setPixel() {}

export function setPref(name, val) {
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

export function soundBusy(channel) {
  return false;
}

export function sprite(nameOrNum) {
  return new Sprite();
}

export function sqrt(number) {
  return Math.sqrt(number);
}

export function stopEvent() {}

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

export function symbolP(x) {
  return typeof x === "symbol";
}

export function tan(angle) {
  return Math.tan(angle);
}

export function time() {
  return new Date().toLocaleTimeString();
}

export function timeout(name) {
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

export function unLoadMember(member) {}

export function updateStage() {
  _movie.updateStage();
}

export function value(str) {
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

// ── Type-check Function Aliases (lowercase for Lingo compatibility) ──

export const voidp = voidP;
export const integerp = integerP;
export const floatp = floatP;
export const listp = listP;
export const objectp = objectP;
export const stringp = stringP;
export const symbolp = symbolP;
export const rollover = rollOver;
