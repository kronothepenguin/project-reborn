import {
  Color,
  ImageObject,
  List,
  Member,
  Movie,
  Player,
  Point,
  PropList,
  Sprite,
  Rect,
  _timeouts,
  createListProxy,
  createPropListProxy,
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

// ── Native Director: image() ──

export function image(width, height, depth, paletteRef) {
  return new ImageObject(width, height, depth, paletteRef);
}

// ── Call ──

export function call(handler, objOrList, ...args) {
  if (!objOrList) return;
  if (objOrList instanceof List) {
    for (const item of objOrList._items) {
      if (item && typeof item[handler] === "function") {
        item[handler](...args);
      }
    }
  } else if (objOrList instanceof PropList) {
    const keys = objOrList.getKeys();
    for (const key of keys) {
      const item = objOrList.getaProp(key);
      if (item && typeof item[handler] === "function") {
        item[handler](...args);
      }
    }
  } else if (typeof objOrList[handler] === "function") {
    objOrList[handler](...args);
  }
}

// ── Cast/Member access ──

export function castLib(castNameOrNum) {
  return _movie.castLib[castNameOrNum];
}

export function chars(str, start, end) {
  if (typeof str !== "string") return "";
  return str.substring(start, end + 1);
}

// ── Date/Time ──

export function date() {
  return new Date().toLocaleDateString();
}

export function field(nameOrNum, castLibNum) {
  const mem = member(nameOrNum, castLibNum);
  if (mem._raw !== undefined) return mem._raw;
  return "";
}

export function getPref(name) {
  try {
    return localStorage.getItem("pref_" + name) || "";
  } catch {
    return "";
  }
}

export function go(frameNum) {
  // TODO: needs _currentFrame in core.js — ask user
}

export function gotoNetPage(url) {
  openNetPage(url, "self");
}

export function ilk(x) {
  if (x === null || x === undefined) return null;
  if (typeof x === "symbol") return Symbol.for("symbol");
  if (x instanceof List) return Symbol.for("list");
  if (x instanceof PropList) return Symbol.for("propList");
  if (typeof x === "object") {
    return Symbol.for("instance");
  }
  if (typeof x === "number")
    return Number.isInteger(x) ? Symbol.for("integer") : Symbol.for("float");
  if (typeof x === "string") return Symbol.for("string");
  if (typeof x === "boolean") return Symbol.for("boolean");
  return Symbol.for("unknown");
}

export function integerp(x) {
  return Number.isInteger(x);
}

export function length(str) {
  if (typeof str === "string") return str.length;
  if (str instanceof List) return str.count;
  if (Array.isArray(str)) return str.length;
  return 0;
}

export function list() {
  const args = Array.prototype.slice.call(arguments);
  return createListProxy(...args);
}

export function listp(x) {
  return x instanceof List;
}

export function member(nameOrNum, castLibNum) {
  if (typeof nameOrNum === "number") {
    const castLib =
      castLibNum !== undefined ? _movie.castLib[castLibNum] : _movie.castLib[1];
    if (!castLib) return new Member(Symbol.for("empty"));
    return (
      castLib._memberRegistry[nameOrNum] ||
      new Member(Symbol.for("empty"))
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

export function netDone() {
  // TODO: implement when netLingo is translated
  return true;
}

export function newMember(type, castLib) {
  console.warn("[new] Dynamic member creation not fully implemented:", type);
  return member(0);
}

export function objectp(x) {
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

export function openNetPage(url, target) {
  if (url) window.open(url, target || "_self");
}

export function param(n) {
  // Translated to arguments[n - 1] at call site
  // This function exists for Director API compatibility
  return undefined;
}

export function pass() {
  // TODO:
}

export function point(h, v) {
  return new Point(h ?? 0, v ?? 0);
}

export function propList() {
  return createPropListProxy();
}

export function puppetTempo(intTempo) {
  _movie._tempo = intTempo;
}

export function put(str) {
  console.log("[director]", str);
}

export function random(n) {
  return Math.floor(Math.random() * n) + 1;
}

export function rect(left, top, right, bottom) {
  return new Rect(left ?? 0, top ?? 0, right ?? 0, bottom ?? 0);
}

export function rgb(r, g, b) {
  return new Color(r ?? 0, g ?? 0, b ?? 0);
}

export function script(nameOrNum) {
  const mem = member(nameOrNum);
  return {
    new: function () {
      if (mem._raw instanceof Promise) {
        console.warn("[script] Module not yet loaded:", nameOrNum);
        return {};
      }
      if (mem._raw && typeof mem._raw === "object") {
        const mod = mem._raw;
        if (typeof mod.default === "function") return new mod.default();
        if (typeof mod.new === "function") return mod.new();
        return { ...mod };
      }
      console.warn("[script] Script not found:", nameOrNum);
      return {};
    },
  };
}

export function setPref(name, val) {
  try {
    localStorage.setItem("pref_" + name, string(val));
  } catch {
    // Silently fail
  }
}

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

export function stringp(x) {
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

export function voidp(x) {
  return x === undefined || x === null;
}
