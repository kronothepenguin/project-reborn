// Director "the" proxy
// A single `the` object exposing the documented `the`-property surface
// (movie/player/sound/key/mouse/system state + constants + computed values).
//
// `the` is EXPORTED, not self-installed onto globalThis — registering the
// runtime globals (including `globalThis.the`) is the player runner's job
// (feature 008 installs all globals before the movie bundle import).
//
// Reads delegate through the ESM live-binding singleton slots, so an activated
// context's instances are reflected automatically; the no-context default
// instances serve otherwise. Read-only writes and unknown names throw script
// errors (C5/C6). Score/stage-backed rows return documented no-op defaults
// until feature 004.
import { _movie, _mouse, _key, _player, _sound, _system } from "../subsystem/singletons.js";
import { splitChars, splitItems, splitLines, splitWords } from "./chunk-split.js";

const START = Date.now();

const BACKING = {
  itemDelimiter: ",",
  floatPrecision: 4,
  randomSeed: 0,
  selection: "",
  selStart: 0,
  selEnd: 0,
  rollover: 0,
  movieName: "",
  moviePath: "",
  platform: "JavaScript",
};

const ALIASES = {
  milliSeconds: "milliseconds",
  maxinteger: "maxInteger",
};

const COMPUTED = {
  milliseconds: () => Date.now(),
  timer: () => Date.now() - START,
  ticks: () => Math.floor((Date.now() - START) / (1000 / 60)),
  time: () => new Date().toLocaleTimeString(),
  date: () => new Date().toLocaleDateString(),
  longTime: () => new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
  long: () => new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  short: () => new Date().toLocaleDateString(undefined, { year: "2-digit", month: "2-digit", day: "2-digit" }),
  abbreviated: () => new Date().toLocaleDateString(undefined, { year: "2-digit", month: "short", day: "numeric" }),
  abbreviatedTime: () => new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
  systemDate: () => new Date().toLocaleString(),
};

const FUNCTION_FORMS = {
  numberOfCharsIn(str) { return splitChars(typeof str === "string" ? str : "").length; },
  numberOfItemsIn(str) { return splitItems(typeof str === "string" ? str : "", itemDelimiterValue()).length; },
  numberOfLinesIn(str) { return splitLines(typeof str === "string" ? str : "").length; },
  numberOfWordsIn(str) { return splitWords(typeof str === "string" ? str : "").length; },
  lastCharIn(str) { const p = splitChars(typeof str === "string" ? str : ""); return p.length === 0 ? "" : p[p.length - 1]; },
  lastItemIn(str) { const p = splitItems(typeof str === "string" ? str : "", itemDelimiterValue()); return p.length === 0 ? "" : p[p.length - 1]; },
  lastLineIn(str) { const p = splitLines(typeof str === "string" ? str : ""); return p.length === 0 ? "" : p[p.length - 1]; },
  lastWordIn(str) { const p = splitWords(typeof str === "string" ? str : ""); return p.length === 0 ? "" : p[p.length - 1]; },
  numberOfCastMembersOfCastLib() { return 0; },
};

function itemDelimiterValue() {
  const d = BACKING.itemDelimiter;
  return typeof d === "string" && d.length > 0 ? d : ",";
}

// Row kinds:
//   core     - read/write the named field on the named singleton object
//   local    - read/write the proxy's own backing (no core object owns it)
//   computed - computed on read (C9)
//   constant - fixed documented value
//   noop     - Score/stage-backed: documented stable default until feature 004
const SINGLETONS = { movie: _movie, player: _player, sound: _sound, key: _key, mouse: _mouse, system: _system };

const TABLE = {
  itemDelimiter: { kind: "local", ro: false },
  floatPrecision: { kind: "local", ro: false },
  randomSeed: { kind: "local", ro: false },
  selection: { kind: "local", ro: false },
  selStart: { kind: "local", ro: false },
  selEnd: { kind: "local", ro: false },
  rollover: { kind: "local", ro: true },

  mouseH: { kind: "core", owner: "mouse", field: "mouseH", ro: true, def: 0 },
  mouseV: { kind: "core", owner: "mouse", field: "mouseV", ro: true, def: 0 },
  mouseDown: { kind: "core", owner: "mouse", field: "mouseDown", ro: true, def: false },
  mouseUp: { kind: "core", owner: "mouse", field: "mouseUp", ro: true, def: false },
  clickOn: { kind: "core", owner: "mouse", field: "clickOn", ro: true, def: 0 },
  clickLoc: { kind: "core", owner: "mouse", field: "clickLoc", ro: true, def: null },
  doubleClick: { kind: "core", owner: "mouse", field: "doubleClick", ro: true, def: false },

  key: { kind: "core", owner: "key", field: "key", ro: true, def: "" },
  keyCode: { kind: "core", owner: "key", field: "keyCode", ro: true, def: 0 },
  shiftDown: { kind: "core", owner: "key", field: "shiftDown", ro: true, def: false },
  controlDown: { kind: "core", owner: "key", field: "controlDown", ro: true, def: false },
  commandDown: { kind: "core", owner: "key", field: "commandDown", ro: true, def: false },
  optionDown: { kind: "core", owner: "key", field: "optionDown", ro: true, def: false },

  frame: { kind: "noop", ro: true, def: 0 },
  frameLabel: { kind: "noop", ro: true, def: 0 },
  framePalette: { kind: "noop", ro: true, def: 0 },
  frameTempo: { kind: "core", owner: "movie", field: "frameTempo", ro: true, def: 15 },
  marker: { kind: "noop", ro: true, def: "" },
  markerList: { kind: "noop", ro: true, def: [] },
  label: { kind: "noop", ro: true, def: "" },
  labelList: { kind: "noop", ro: true, def: "" },
  lastChannel: { kind: "noop", ro: true, def: 0 },
  currentTime: { kind: "noop", ro: true, def: 0 },
  numberOfCastLibs: { kind: "noop", ro: true, def: 1 },
  numberOfMembers: { kind: "noop", ro: true, def: 0 },
  timeoutLapsed: { kind: "noop", ro: true, def: 0 },

  movieName: { kind: "local", ro: true },
  moviePath: { kind: "local", ro: true },
  path: { kind: "core", owner: "movie", field: "path", ro: true, def: "" },
  name: { kind: "core", owner: "movie", field: "name", ro: true, def: "" },
  copyrightInfo: { kind: "core", owner: "movie", field: "copyrightInfo", ro: true, def: "" },
  exitLock: { kind: "core", owner: "movie", field: "exitLock", ro: false, def: false },
  beepOn: { kind: "core", owner: "movie", field: "beepOn", ro: false, def: false },
  centerStage: { kind: "core", owner: "movie", field: "centerStage", ro: false, def: true },
  keyboardFocusSprite: { kind: "core", owner: "movie", field: "keyboardFocusSprite", ro: false, def: -1 },
  editShortCutsEnabled: { kind: "core", owner: "movie", field: "editShortCutsEnabled", ro: false, def: true },

  alertHook: { kind: "core", owner: "player", field: "alertHook", ro: false, def: null },
  debugPlaybackEnabled: { kind: "core", owner: "player", field: "debugPlaybackEnabled", ro: false, def: false },
  runMode: { kind: "core", owner: "player", field: "runMode", ro: true, def: "Plugin" },
  productName: { kind: "core", owner: "player", field: "productName", ro: true, def: "Director" },
  productVersion: { kind: "core", owner: "player", field: "productVersion", ro: true, def: "MX 2004" },
  version: { kind: "core", owner: "player", field: "productVersion", ro: true, def: "MX 2004" },

  platform: { kind: "local", ro: true },
  colorDepth: { kind: "core", owner: "system", field: "colorDepth", ro: true, def: 32 },

  soundEnabled: { kind: "core", owner: "sound", field: "soundEnabled", ro: false, def: true },
  soundLevel: { kind: "core", owner: "sound", field: "soundLevel", ro: false, def: 7 },

  numberOfXtras: { kind: "noop", ro: true, def: 0 },
  numberOfMenus: { kind: "noop", ro: true, def: 0 },

  milliseconds: { kind: "computed", ro: true, get: COMPUTED.milliseconds },
  timer: { kind: "computed", ro: true, get: COMPUTED.timer },
  ticks: { kind: "computed", ro: true, get: COMPUTED.ticks },
  time: { kind: "computed", ro: true, get: COMPUTED.time },
  date: { kind: "computed", ro: true, get: COMPUTED.date },
  longTime: { kind: "computed", ro: true, get: COMPUTED.longTime },
  long: { kind: "computed", ro: true, get: COMPUTED.long },
  short: { kind: "computed", ro: true, get: COMPUTED.short },
  abbreviated: { kind: "computed", ro: true, get: COMPUTED.abbreviated },
  abbreviatedTime: { kind: "computed", ro: true, get: COMPUTED.abbreviatedTime },
  systemDate: { kind: "computed", ro: true, get: COMPUTED.systemDate },

  pi: { kind: "constant", ro: true, value: Math.PI },
  maxInteger: { kind: "constant", ro: true, value: 2147483647 },
  true: { kind: "constant", ro: true, value: true },
  false: { kind: "constant", ro: true, value: false },
  void: { kind: "constant", ro: true, value: null },
  empty: { kind: "constant", ro: true, value: "" },
  tab: { kind: "constant", ro: true, value: "\t" },
  space: { kind: "constant", ro: true, value: " " },
  return: { kind: "constant", ro: true, value: "\r" },
  quote: { kind: "constant", ro: true, value: '"' },
};

const KNOWN = new Set([...Object.keys(TABLE), ...Object.keys(ALIASES), ...Object.keys(FUNCTION_FORMS)]);

function unknownError(name) {
  return new Error(`Script error: unknown the property: ${name}`);
}

function readOnlyError(name) {
  return new Error(`Cannot set read-only property: the ${name}`);
}

function canonicalOf(prop) {
  return ALIASES[prop] ?? prop;
}

export function _reset() {
  Object.assign(BACKING, {
    itemDelimiter: ",",
    floatPrecision: 4,
    randomSeed: 0,
    selection: "",
    selStart: 0,
    selEnd: 0,
    rollover: 0,
    movieName: "",
    moviePath: "",
    platform: "JavaScript",
  });
}

function read(row, name) {
  switch (row.kind) {
    case "constant":
      return row.value;
    case "computed":
      return row.get();
    case "noop":
      return row.def;
    case "local":
      return BACKING[name];
    case "core": {
      const inst = SINGLETONS[row.owner];
      const v = inst ? inst[row.field] : undefined;
      return v === undefined ? row.def : v;
    }
  }
}

function write(row, name, value) {
  if (row.kind === "local") {
    BACKING[name] = value;
  } else if (row.kind === "core") {
    const inst = SINGLETONS[row.owner];
    if (inst && row.field in inst) inst[row.field] = value;
    else BACKING[name] = value;
  }
}

export const the = new Proxy({}, {
  get(target, prop, receiver) {
    if (typeof prop === "symbol") return Reflect.get(target, prop, receiver);
    const name = canonicalOf(prop);
    if (name === "_reset") return _reset;
    if (name in FUNCTION_FORMS) return FUNCTION_FORMS[name];
    const row = TABLE[name];
    if (!row) throw unknownError(name);
    return read(row, name);
  },
  set(target, prop, value, receiver) {
    if (typeof prop === "symbol") return Reflect.set(target, prop, value, receiver);
    const name = canonicalOf(prop);
    const row = TABLE[name];
    if (!row) throw unknownError(name);
    if (row.ro) throw readOnlyError(name);
    write(row, name, value);
    return true;
  },
  has(target, prop) {
    if (typeof prop === "symbol") return Reflect.has(target, prop);
    return KNOWN.has(canonicalOf(prop));
  },
  ownKeys() {
    return [...Object.keys(TABLE), ...Object.keys(FUNCTION_FORMS)];
  },
  getOwnPropertyDescriptor(target, prop) {
    const name = canonicalOf(String(prop));
    if (name in FUNCTION_FORMS) {
      return { enumerable: true, configurable: true, writable: true, value: FUNCTION_FORMS[name] };
    }
    if (KNOWN.has(name)) {
      return { enumerable: true, configurable: true, writable: true, value: read(TABLE[name], name) };
    }
    return undefined;
  },
});