// Director "the" proxy
// Provides access to all system properties via `the.<propertyName>`
// See: docs/drmx2004_scripting_ref.txt Chapter 14: Properties
import { _movie, _mouse, _key, _player, _sound, _system } from "../subsystem/singletons.js";
import { CastLibraryObject } from "../core/cast-library.js";

const READ_ONLY = new Set([
  // Movie (read-only)
  "frame",
  "frameLabel",
  "framePalette",
  "frameRate",
  "framesEnabled",
  "movieName",
  "moviePath",
  "copyrightInfo",
  "lastChannel",
  "stage",
  "stageLeft",
  "stageTop",
  "stageRight",
  "stageBottom",
  "stageColor",
  "sprite",
  "member",
  "castLib",
  "numberOfCastLibs",
  "numberOfMembers",
  "numberOfXtras",
  "numberOfMenus",
  "numberOfSounds",
  "currentSpriteNum",
  "currentTime",
  "marker",
  "markerList",
  "label",
  "labelList",
  "frameScript",
  "timeoutLapsed",
  "timeoutKey",
  "sound",
  "machineType",
  "platform",
  "productName",
  "productVersion",
  "version",
  "environment",
  "colorDepth",
  "colorQD",
  "movie",
  "script",
  "date",
  "long",
  "abbreviated",
  "abbreviatedTime",
  "short",
  "shortTime",
  "systemDate",
  "systemMilliseconds",
  "pi",
  "true",
  "false",
  "void",
  "empty",
  "tab",
  "space",
  "maxInteger",
  "paramCount",
  "externalEventEnabled",
  "externalParamName",
  "paramNames",
  "selChunk",
  "quickTimePresent",
  "soundDevice",
  "soundMixer",
  "videoMixer",
  "videoForWindowsPresent",
  "netBrowserName",
  "netBrowserVendor",
  "netBrowserVersion",
  "netLastModDate",
  "netMIME",
  "netPresent",
  "netTextResult",
  "safePlayer",
  "romanLingo",
  "scriptingXtrasAvailable",
  "tellAppAvailable",
  "xtras",
  "windowList",
  "window",
  "systemVolume",
  "rollover",
  "stepFrame",
  // Mouse (read-only)
  "mouseDown",
  "mouseUp",
  "mouseH",
  "mouseV",
  "mouseChar",
  "mouseItem",
  "mouseLine",
  "mouseWord",
  "mouseLoc",
  "mouseMember",
  "clickLoc",
  "clickOn",
  "rightMouseDown",
  "rightMouseUp",
  "stillDown",
  "doubleClick",
  "lastClick",
  "lastEvent",
  // Key (read-only)
  "key",
  "keyCode",
  "keyPressed",
  "commandDown",
  "controlDown",
  "shiftDown",
  "optionDown",
  "altDown",
  "capsLock",
  "numLock",
  "lastKey",
  // Player (read-only)
  "runMode",
  "xtraList",
  // Time
  "time",
]);

const BACKING = {
  wordDelimiter: " ",
  itemDelimiter: ",",
  lineDelimiter: "\n",
  exitLock: false,
  alertHook: null,
  cursor: 0,
  keyDownScript: "",
  keyUpScript: "",
  mouseDownScript: "",
  mouseUpScript: "",
  mouseEnterScript: "",
  mouseLeaveScript: "",
  mouseWithinScript: "",
  debugPlaybackEnabled: false,
  editShortcutsEnabled: false,
  editShortCutsEnabled: true,
  soundEnabled: true,
  multiSound: true,
  floatPrecision: 4,
  trace: false,
  traceScript: false,
  beepOn: true,
  centerStage: false,
  checkBoxAccess: true,
  fixStageSize: true,
  fixedLineHeight: 0,
  pasteAllowed: true,
  printAsBitmap: true,
  previewAllowed: true,
  updateMovieEnabled: true,
  showGlobals: true,
  searchCurrentPath: "",
  searchPath: [],
  preLoadRAM: 0,
  quickTimePresent: false,
  netPresent: true,
  beep: 0,
  selection: "",
  selStart: 0,
  selEnd: 0,
  field: "",
  char: 0,
  word: 0,
  item: 0,
  line: 0,
  soundLevel: 0,
  result: "",
  param: "",
  string: "",
  timer: 0,
  pauseState: false,
  playing: false,
};

function detectPlatform() {
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("win")) return "Windows";
    if (ua.includes("mac")) return "Macintosh";
    if (ua.includes("linux")) return "Linux";
  }
  return "JavaScript";
}

function detectColorDepth() {
  if (typeof globalThis !== "undefined" && globalThis.screen) {
    return globalThis.screen.colorDepth || 32;
  }
  return 32;
}

function formatDate(d) {
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(d) {
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function formatAbbreviatedDate(d) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatShortDate(d) {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function get(target, prop) {
  if (typeof prop === "symbol") {
    return target[prop];
  }

  switch (prop) {
    // Movie (delegating)
    case "frame":
      return _movie.frame;
    case "frameLabel":
      return _movie.frameLabel;
    case "framePalette":
      return _movie.framePalette;
    case "frameRate":
      return _movie.frameTempo;
    case "framesEnabled":
      return true;
    case "movieName":
      return _movie.name;
    case "moviePath":
      return _movie.path;
    case "copyrightInfo":
      return _movie.copyrightInfo;
    case "lastChannel":
      return _movie.lastChannel;
    case "stage":
      return _movie.stage;
    case "stageLeft":
      return _movie.stage.left;
    case "stageTop":
      return _movie.stage.top;
    case "stageRight":
      return _movie.stage.right;
    case "stageBottom":
      return _movie.stage.bottom;
    case "stageColor":
      return 0;
    case "sprite":
      return _movie.sprite;
    case "member":
      return _movie.member;
    case "castLib":
      return _movie.castLib;
    case "numberOfCastLibs":
      return CastLibraryObject.castLib ? Object.keys(CastLibraryObject.castLib).length : 0;
    case "numberOfMembers":
      return 0;
    case "numberOfXtras":
      return 0;
    case "numberOfMenus":
      return 0;
    case "numberOfSounds":
      return 0;
    case "currentSpriteNum":
      return 0;
    case "currentTime":
      return _movie.frameTempo;
    case "marker":
      return "";
    case "markerList":
      return _movie.markerList;
    case "label":
      return "";
    case "labelList":
      return [];
    case "frameScript":
      return _movie.frameScript;
    case "timeoutLapsed":
      return 0;
    case "timeoutKey":
      return "";
    case "movie":
      return _movie;

    // Mouse (delegating)
    case "mouseH":
      return _mouse.mouseH;
    case "mouseV":
      return _mouse.mouseV;
    case "mouseDown":
      return _mouse.mouseDown;
    case "mouseUp":
      return _mouse.mouseUp;
    case "doubleClick":
      return _mouse.doubleClick;
    case "clickOn":
      return _mouse.clickOn;
    case "clickLoc":
      return _mouse.clickLoc;
    case "rollover":
      return _mouse.rollover;
    case "stillDown":
      return _mouse.stillDown;
    case "mouseChar":
      return _mouse.mouseChar;
    case "mouseItem":
      return _mouse.mouseItem;
    case "mouseLine":
      return _mouse.mouseLine;
    case "mouseLoc":
      return _mouse.mouseLoc;
    case "mouseMember":
      return _mouse.mouseMember;
    case "mouseWord":
      return _mouse.mouseWord;
    case "rightMouseDown":
      return _mouse.rightMouseDown;
    case "rightMouseUp":
      return _mouse.rightMouseUp;
    case "lastClick":
      return _mouse.lastClick;
    case "lastEvent":
      return _mouse.lastEvent;

    // Key (delegating)
    case "key":
      return _key.key;
    case "keyCode":
      return _key.keyCode;
    case "keyPressed":
      return _key.keyPressed();
    case "commandDown":
      return _key.commandDown;
    case "controlDown":
      return _key.controlDown;
    case "shiftDown":
      return _key.shiftDown;
    case "optionDown":
      return _key.optionDown;
    case "altDown":
      return _key.altDown;
    case "capsLock":
      return _key.capsLock;
    case "numLock":
      return _key.numLock;
    case "lastKey":
      return _key.lastKey;

    // Player (delegating)
    case "runMode":
      return _player.runMode;
    case "xtraList":
      return _player.xtraList;
    case "window":
      return _player.window;
    case "windowList":
      return _player.windowList;

    // Sound
    case "soundEnabled":
      return _sound.soundEnabled;
    case "soundDevice":
      return _sound.soundDevice;
    case "soundMixer":
      return _sound.soundMixer;

    // Date/time (computed)
    case "date":
    case "long": {
      const d = new Date();
      return formatDate(d);
    }
    case "time": {
      const d = new Date();
      return formatTime(d);
    }
    case "abbreviated": {
      const d = new Date();
      return formatAbbreviatedDate(d);
    }
    case "abbreviatedTime": {
      const d = new Date();
      return formatTime(d);
    }
    case "short": {
      const d = new Date();
      return formatShortDate(d);
    }
    case "shortTime": {
      const d = new Date();
      return formatTime(d);
    }
    case "systemDate":
      return new Date().toString();
    case "systemMilliseconds":
      return _system.milliseconds;

    // Constants
    case "pi":
      return Math.PI;
    case "true":
      return true;
    case "false":
      return false;
    case "void":
      return undefined;
    case "empty":
      return "";
    case "tab":
      return "\t";
    case "space":
      return " ";
    case "maxInteger":
      return Number.MAX_SAFE_INTEGER;
    case "newline":
      return "\n";
    case "return":
      return "\r";
    case "quote":
      return '"';
    case "singleQuote":
      return "'";

    // System
    case "machineType":
      return "Browser";
    case "platform":
      return detectPlatform();
    case "productName":
      return _player.productName;
    case "productVersion":
      return _player.productVersion;
    case "version":
      return _player.productVersion;
    case "environment":
      return "Plugin";
    case "colorDepth":
      return _system.colorDepth;
    case "colorQD":
      return _system.colorDepth >= 16;
    case "netBrowserName":
      return (typeof navigator !== "undefined" && navigator.userAgent) || "";
    case "netBrowserVendor":
      return (typeof navigator !== "undefined" && navigator.vendor) || "";
    case "netBrowserVersion":
      return (typeof navigator !== "undefined" && navigator.appVersion) || "";
    case "netLastModDate":
      return "";
    case "netMIME":
      return "";
    case "netPresent":
      return typeof navigator !== "undefined";
    case "netTextResult":
      return "";
    case "romanLingo":
      return true;
    case "scriptingXtrasAvailable":
      return true;
    case "tellAppAvailable":
      return false;
    case "xtras":
      return _player.xtra;

    // Script
    case "script":
      return "";
    case "result":
      return target.result;
    case "param":
      return target.param;
    case "paramCount":
      return 0;
    case "field":
      return target.field;
    case "string":
      return target.string;
    case "selection":
      return target.selection;
    case "selStart":
      return target.selStart;
    case "selEnd":
      return target.selEnd;
    case "selChunk":
      return target.selection;

    // Misc
    case "exitLock":
      return target.exitLock;
    case "beepOn":
      return target.beepOn;
    case "beep":
      return target.beep;
    case "centerStage":
      return target.centerStage;
    case "checkBoxAccess":
      return target.checkBoxAccess;
    case "fixStageSize":
      return target.fixStageSize;
    case "fixedLineHeight":
      return target.fixedLineHeight;
    case "pasteAllowed":
      return target.pasteAllowed;
    case "printAsBitmap":
      return target.printAsBitmap;
    case "previewAllowed":
      return target.previewAllowed;
    case "rollover":
      return _mouse.rollover;
    case "searchCurrentPath":
      return target.searchCurrentPath;
    case "searchPath":
      return target.searchPath;
    case "showGlobals":
      return target.showGlobals;
    case "stepFrame":
      return 1;
    case "updateMovieEnabled":
      return target.updateMovieEnabled;
    case "pauseState":
      return target.pauseState;
    case "playing":
      return target.playing;
    case "safePlayer":
      return _player.safePlayer;
    case "systemVolume":
      return 0;
    case "externalEventEnabled":
      return false;
    case "externalParamName":
      return null;
    case "paramNames":
      return [];
    case "preLoadRAM":
      return target.preLoadRAM;
    case "quickTimePresent":
      return target.quickTimePresent;
    case "timer":
      return target.timer;
    case "char":
      return target.char;
    case "word":
      return target.word;
    case "item":
      return target.item;
    case "line":
      return target.line;
    case "soundLevel":
      return target.soundLevel;

    // Writable handlers (delegate setters/getters to backing)
    case "wordDelimiter":
      return target.wordDelimiter;
    case "itemDelimiter":
      return target.itemDelimiter;
    case "lineDelimiter":
      return target.lineDelimiter;
    case "alertHook":
      return _player.alertHook;
    case "cursor":
      return _player.currentCursor;
    case "keyDownScript":
      return _mouse.keyDownScript;
    case "keyUpScript":
      return _mouse.keyUpScript;
    case "mouseDownScript":
      return _mouse.mouseDownScript;
    case "mouseUpScript":
      return _mouse.mouseUpScript;
    case "mouseEnterScript":
      return _mouse.mouseEnterScript;
    case "mouseLeaveScript":
      return _mouse.mouseLeaveScript;
    case "mouseWithinScript":
      return _mouse.mouseWithinScript;
    case "debugPlaybackEnabled":
      return _player.debugPlaybackEnabled;
    case "editShortcutsEnabled":
      return _player.editShortcutsEnabled;
    case "editShortCutsEnabled":
      return _movie.editShortCutsEnabled;
    case "soundEnabled":
      return _sound.soundEnabled;
    case "multiSound":
      return target.multiSound;
    case "floatPrecision":
      return target.floatPrecision;
    case "trace":
      return target.trace;
    case "traceScript":
      return _movie.traceScript;
    case "sound":
      return _sound;

    default:
      return target[prop];
  }
}

function set(target, prop, value) {
  if (typeof prop === "symbol") {
    target[prop] = value;
    return true;
  }

  if (READ_ONLY.has(prop)) {
    throw new Error(`Cannot set read-only property: the ${prop}`);
  }

  switch (prop) {
    case "wordDelimiter":
      target.wordDelimiter = String(value ?? " ");
      if (typeof globalThis !== "undefined") globalThis.the = the;
      return true;
    case "itemDelimiter":
      target.itemDelimiter = String(value ?? ",");
      if (typeof globalThis !== "undefined") globalThis.the = the;
      return true;
    case "lineDelimiter":
      target.lineDelimiter = String(value ?? "\n");
      if (typeof globalThis !== "undefined") globalThis.the = the;
      return true;
    case "alertHook":
      _player.alertHook = value;
      return true;
    case "cursor":
      _player.cursor(value);
      target.cursor = _player.currentCursor;
      return true;
    case "keyDownScript":
      _mouse.keyDownScript = value;
      return true;
    case "keyUpScript":
      _mouse.keyUpScript = value;
      return true;
    case "mouseDownScript":
      _mouse.mouseDownScript = value;
      return true;
    case "mouseUpScript":
      _mouse.mouseUpScript = value;
      return true;
    case "mouseEnterScript":
      _mouse.mouseEnterScript = value;
      return true;
    case "mouseLeaveScript":
      _mouse.mouseLeaveScript = value;
      return true;
    case "mouseWithinScript":
      _mouse.mouseWithinScript = value;
      return true;
    case "debugPlaybackEnabled":
      _player.debugPlaybackEnabled = value;
      return true;
    case "editShortcutsEnabled":
      _player.editShortcutsEnabled = value;
      return true;
    case "editShortCutsEnabled":
      _movie.editShortCutsEnabled = value;
      return true;
    case "soundEnabled":
      _sound.soundEnabled = value;
      return true;
    case "multiSound":
      target.multiSound = Boolean(value);
      return true;
    case "floatPrecision":
      target.floatPrecision = Number(value);
      return true;
    case "trace":
      target.trace = Boolean(value);
      return true;
    case "traceScript":
      _movie.traceScript = value;
      return true;
    case "exitLock":
      target.exitLock = Boolean(value);
      return true;
    case "beepOn":
      target.beepOn = Boolean(value);
      return true;
    case "beep":
      target.beep = Number(value) || 0;
      return true;
    case "centerStage":
      target.centerStage = Boolean(value);
      return true;
    case "checkBoxAccess":
      target.checkBoxAccess = Boolean(value);
      return true;
    case "fixStageSize":
      target.fixStageSize = Boolean(value);
      return true;
    case "fixedLineHeight":
      target.fixedLineHeight = Number(value);
      return true;
    case "pasteAllowed":
      target.pasteAllowed = Boolean(value);
      return true;
    case "printAsBitmap":
      target.printAsBitmap = Boolean(value);
      return true;
    case "previewAllowed":
      target.previewAllowed = Boolean(value);
      return true;
    case "searchCurrentPath":
      target.searchCurrentPath = String(value ?? "");
      return true;
    case "searchPath":
      target.searchPath = Array.isArray(value) ? value : [];
      return true;
    case "showGlobals":
      target.showGlobals = Boolean(value);
      return true;
    case "updateMovieEnabled":
      target.updateMovieEnabled = Boolean(value);
      return true;
    case "pauseState":
      target.pauseState = Boolean(value);
      return true;
    case "playing":
      target.playing = Boolean(value);
      return true;
    case "preLoadRAM":
      target.preLoadRAM = Number(value) || 0;
      return true;
    case "quickTimePresent":
      target.quickTimePresent = Boolean(value);
      return true;
    case "timer":
      target.timer = Number(value) || 0;
      return true;
    case "soundLevel":
      target.soundLevel = Number(value) || 0;
      return true;
    case "field":
      target.field = String(value ?? "");
      return true;
    case "string":
      target.string = String(value ?? "");
      return true;
    case "selection":
      target.selection = String(value ?? "");
      return true;
    case "selStart":
      target.selStart = Number(value) || 0;
      return true;
    case "selEnd":
      target.selEnd = Number(value) || 0;
      return true;
    case "char":
      target.char = Number(value) || 0;
      return true;
    case "word":
      target.word = Number(value) || 0;
      return true;
    case "item":
      target.item = Number(value) || 0;
      return true;
    case "line":
      target.line = Number(value) || 0;
      return true;
    case "result":
      target.result = String(value ?? "");
      return true;
    case "param":
      target.param = String(value ?? "");
      return true;
    default:
      target[prop] = value;
      return true;
  }
}

function has(target, prop) {
  if (typeof prop === "symbol") {
    return prop in target;
  }
  return prop in target || true;
}

function ownKeys(target) {
  return Reflect.ownKeys(target);
}

function getOwnPropertyDescriptor(target, prop) {
  return Reflect.getOwnPropertyDescriptor(target, prop);
}

export const the = new Proxy(BACKING, {
  get,
  set,
  has,
  ownKeys,
  getOwnPropertyDescriptor,
});

if (typeof globalThis !== "undefined") {
  globalThis.the = the;
}

export function _reset() {
  for (const key of Object.keys(BACKING)) {
    delete BACKING[key];
  }
  BACKING.wordDelimiter = " ";
  BACKING.itemDelimiter = ",";
  BACKING.lineDelimiter = "\n";
  BACKING.exitLock = false;
  BACKING.alertHook = null;
  BACKING.cursor = 0;
  BACKING.keyDownScript = "";
  BACKING.keyUpScript = "";
  BACKING.mouseDownScript = "";
  BACKING.mouseUpScript = "";
  BACKING.mouseEnterScript = "";
  BACKING.mouseLeaveScript = "";
  BACKING.mouseWithinScript = "";
  BACKING.debugPlaybackEnabled = false;
  BACKING.editShortcutsEnabled = false;
  BACKING.editShortCutsEnabled = true;
  BACKING.soundEnabled = true;
  BACKING.multiSound = true;
  BACKING.floatPrecision = 4;
  BACKING.trace = false;
  BACKING.traceScript = false;
  BACKING.beepOn = true;
  BACKING.centerStage = false;
  BACKING.checkBoxAccess = true;
  BACKING.fixStageSize = true;
  BACKING.fixedLineHeight = 0;
  BACKING.pasteAllowed = true;
  BACKING.printAsBitmap = true;
  BACKING.previewAllowed = true;
  BACKING.updateMovieEnabled = true;
  BACKING.showGlobals = true;
  BACKING.searchCurrentPath = "";
  BACKING.searchPath = [];
  BACKING.preLoadRAM = 0;
  BACKING.quickTimePresent = false;
  BACKING.beep = 0;
  BACKING.selection = "";
  BACKING.selStart = 0;
  BACKING.selEnd = 0;
  BACKING.field = "";
  BACKING.char = 0;
  BACKING.word = 0;
  BACKING.item = 0;
  BACKING.line = 0;
  BACKING.soundLevel = 0;
  BACKING.result = "";
  BACKING.param = "";
  BACKING.string = "";
  BACKING.timer = 0;
  BACKING.pauseState = false;
  BACKING.playing = false;
  _mouse._reset();
  _key._reset();
  if (typeof globalThis !== "undefined") {
    globalThis.the = the;
  }
}
