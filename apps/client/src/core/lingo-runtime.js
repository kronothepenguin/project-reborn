// Lingo Runtime - Incremental Director MX 2004 function implementations
// Add functions here as they are encountered during translation

// ── Director Movie Handlers ──────────────────────────────────────────────
// Special handlers: prepareMovie, stopMovie, exitFrame
// These are NOT regular functions - they are registered and called by the runtime

const _movieHandlers = {
  prepareMovie: [],
  stopMovie: [],
  exitFrame: [],
}

export function registerMovieHandler(type, fn, castName) {
  if (!_movieHandlers[type]) return
  _movieHandlers[type].push({ fn, cast: castName })
}

export function getMovieHandlers(type) {
  return _movieHandlers[type] || []
}

export function clearMovieHandlers() {
  _movieHandlers.prepareMovie = []
  _movieHandlers.stopMovie = []
  _movieHandlers.exitFrame = []
}

// ── Type Checking ────────────────────────────────────────────────────────

export function voidP(x) {
  return x === undefined || x === null
}

export function ilk(x) {
  if (x === undefined || x === null) return 'void'
  if (Array.isArray(x)) return 'list'
  if (typeof x === 'object' && x !== null && typeof x.setaProp === 'function') return 'propList'
  if (typeof x === 'number') return 'integer'
  if (typeof x === 'string') return 'string'
  if (typeof x === 'boolean') return 'integer'
  if (typeof x === 'symbol') return 'symbol'
  if (typeof x === 'function') return 'handler'
  return 'object'
}

export function integer(x) {
  return parseInt(x, 10)
}

export function float(x) {
  return parseFloat(x)
}

export function string(x) {
  return String(x)
}

// ── Type Check Helpers ───────────────────────────────────────────────────

// Lingo-style symbol with global registry: Symbol.for('#name') === Symbol.for('#name')
export function symbol(name) {
  return Symbol.for(name)
}

export function stringp(x) {
  return typeof x === 'string'
}

export function symbolp(x) {
  return typeof x === 'symbol'
}

export function listp(x) {
  return Array.isArray(x)
}

export function integerp(x) {
  return typeof x === 'number' && Number.isInteger(x)
}

export function objectp(x) {
  return typeof x === 'object' && x !== null
}

export function floatp(x) {
  return typeof x === 'number'
}

export function value(s) {
  // Lingo's value() parses a string into a value
  if (s === 'VOID') return null
  if (s === 'TRUE' || s === '1') return true
  if (s === 'FALSE' || s === '0') return false
  if (s === 'EMPTY') return ''
  const num = Number(s)
  if (!isNaN(num)) return num
  return s
}

// ── Property List (propList) ─────────────────────────────────────────────
// Lingo: [:] creates a property list
// Lingo: setaProp(#key, val), getaProp(#key), addProp(#key, val), deleteProp(#key)

export function createPropList(obj = {}) {
  const map = new Map()
  for (const [k, v] of Object.entries(obj)) {
    map.set(k, v)
  }

  return {
    setaProp(key, val) {
      map.set(key, val)
    },
    getaProp(key) {
      return map.has(key) ? map.get(key) : undefined
    },
    addProp(key, val) {
      map.set(key, val)
    },
    deleteProp(key) {
      return map.delete(key)
    },
    getProp(index) {
      const keys = Array.from(map.keys())
      return keys[index - 1] // Lingo is 1-indexed
    },
    getPropAt(index) {
      const keys = Array.from(map.keys())
      return keys[index - 1]
    },
    getAt(index) {
      const values = Array.from(map.values())
      return values[index - 1]
    },
    count: map.size,
    duplicate() {
      return createPropList(Object.fromEntries(map))
    },
    has(key) {
      return map.has(key)
    },
    keys() {
      return Array.from(map.keys())
    },
    values() {
      return Array.from(map.values())
    },
    entries() {
      return Array.from(map.entries())
    },
    _map: map,
  }
}

// ── Linear List helpers ──────────────────────────────────────────────────

export function list(...args) {
  return [...args]
}

export function add(list, item) {
  list.push(item)
}

export function deleteAt(list, index) {
  list.splice(index - 1, 1) // Lingo is 1-indexed
}

export function getOne(list, value) {
  const idx = list.indexOf(value)
  return idx >= 0 ? idx + 1 : 0 // Lingo returns 0 if not found
}

export function findPos(list, value) {
  const idx = list.indexOf(value)
  return idx >= 0 ? idx + 1 : 0
}

export function sort(list, fn) {
  list.sort(fn)
}

// ── String Operations ────────────────────────────────────────────────────

export function offset(searchStr, targetStr) {
  const idx = targetStr.indexOf(searchStr)
  return idx >= 0 ? idx + 1 : 0 // Lingo is 1-indexed
}

export function chars(str, start, end) {
  return str.substring(start - 1, end) // Lingo is 1-indexed inclusive
}

export function length(str) {
  return str.length
}

export function numToChar(n) {
  return String.fromCharCode(n)
}

export function charToNum(c) {
  return c.charCodeAt(0)
}

// ── Math ─────────────────────────────────────────────────────────────────

export function random(n) {
  return Math.floor(Math.random() * n) + 1 // Lingo random(5) returns 1-5
}

export function bitOr(a, b) {
  return a | b
}

export function bitAnd(a, b) {
  return a & b
}

// ── Constants ────────────────────────────────────────────────────────────

export const VOID = null
export const EMPTY = ''
export const QUOTE = '"'
export const RETURN = '\n'

// ── Placeholder functions (to be implemented as needed) ──────────────────

let _stage = null

export function setStage(stage) {
  _stage = stage
}

export function getStage() {
  return _stage
}

// the stage
export function theStage() {
  return _stage
}

// the mouseLoc - returns point(x, y)
let _mouseLoc = { locH: 0, locV: 0 }

export function setMouseLoc(x, y) {
  _mouseLoc = { locH: x, locV: y }
}

export function getMouseLoc() {
  return _mouseLoc
}

// the keyDown
let _keyDown = false

export function setKeyDown(val) {
  _keyDown = val
}

export function getKeyDown() {
  return _keyDown
}

// the date
export function theDate() {
  return new Date().toLocaleDateString()
}

// the long time
export function theLongTime() {
  return new Date().toLocaleTimeString()
}

// the milliSeconds
export function theMilliSeconds() {
  return Date.now()
}

// the runMode
export function theRunMode() {
  return 'Plugin' // In browser, always Plugin
}

// the itemDelimiter
let _itemDelimiter = ','

export function setItemDelimiter(d) {
  _itemDelimiter = d
}

export function getItemDelimiter() {
  return _itemDelimiter
}

// the number of castLibs
export function theNumberOfCastLibs() {
  return 1 // Will be updated as casts are loaded
}

// the debugPlaybackEnabled
let _debugPlaybackEnabled = false

export function setDebugPlaybackEnabled(val) {
  _debugPlaybackEnabled = val
}

export function getDebugPlaybackEnabled() {
  return _debugPlaybackEnabled
}

// the exitLock
let _exitLock = false

export function setExitLock(val) {
  _exitLock = val
}

export function getExitLock() {
  return _exitLock
}

// the title (stage title)
export function setStageTitle(title) {
  if (_stage) _stage.title = title
}

// ── Sprite System (Canvas-based) ─────────────────────────────────────────

let _spriteCounter = 0
let _reservedSprites = new Set()

export function reserveSprite(id) {
  _spriteCounter++
  const num = _spriteCounter
  _reservedSprites.add(num)
  return num
}

export function releaseSprite(num) {
  _reservedSprites.delete(num)
}

export function puppetSprite(num, flag) {
  // Take control of sprite - will be implemented with canvas rendering
}

export function sprite(num) {
  // Returns sprite object by channel number
  return null // Placeholder
}

export function sendSprite(id, msg, ...args) {
  // Send message to sprite
}

export function sendAllSprites(msg, ...args) {
  // Send message to all sprites
}

// ── Member System ────────────────────────────────────────────────────────
// Members are registered by casts based on their Members.csv files.
// Each cast exports its members and registers them with the runtime.

const _membersByName = {}
const _membersByNum = {}
let _memberCounter = 0

export function registerMember(name, num, type, castName) {
  const member = { name, number: num, type, castName, image: null, text: '', rect: null }
  _membersByName[name] = member
  _membersByNum[num] = member
  _memberCounter = Math.max(_memberCounter, num)
  return member
}

export function unregisterMember(nameOrNum) {
  if (typeof nameOrNum === 'number') {
    const mem = _membersByNum[nameOrNum]
    if (mem) delete _membersByName[mem.name]
    delete _membersByNum[nameOrNum]
  } else {
    const mem = _membersByName[nameOrNum]
    if (mem) delete _membersByNum[mem.number]
    delete _membersByName[nameOrNum]
  }
}

export function member(nameOrNum) {
  if (typeof nameOrNum === 'number') {
    return _membersByNum[nameOrNum] || null
  }
  return _membersByName[nameOrNum] || null
}

export function memberExists(name) {
  return name in _membersByName
}

export function getmemnum(name) {
  const mem = _membersByName[name]
  return mem ? mem.number : 0
}

export function removeMember(name) {
  unregisterMember(name)
}

export function createMember(name, type) {
  _memberCounter++
  return registerMember(name, _memberCounter, type)
}

// ── Cast System ──────────────────────────────────────────────────────────

const _castLibsByName = {}
const _castLibsByNum = {}
let _castLibCounter = 0

export function registerCastLib(name, num, fileName) {
  const castLib = { name, number: num, fileName, preloadMode: 0 }
  _castLibsByName[name] = castLib
  _castLibsByNum[num] = castLib
  _castLibCounter = Math.max(_castLibCounter, num)
  return castLib
}

export function castLib(nameOrNum) {
  if (typeof nameOrNum === 'number') {
    return _castLibsByNum[nameOrNum] || { name: '', fileName: '', number: 0, preloadMode: 0 }
  }
  return _castLibsByName[nameOrNum] || { name: '', fileName: '', number: 0, preloadMode: 0 }
}

export function castExists(name) {
  return name in _castLibsByName
}

export function theNumberOfCastLibs() {
  return _castLibCounter
}

// ── Network System ───────────────────────────────────────────────────────

const _netResults = {}
const _netDone = {}
const _netErrors = {}
let _netCounter = 0

export function preloadNetThing(url) {
  const id = ++_netCounter
  _netDone[id] = false
  _netErrors[id] = ''
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status)
      return r.blob()
    })
    .then(blob => {
      _netResults[id] = blob
      _netDone[id] = true
    })
    .catch(err => {
      _netErrors[id] = err.message
      _netDone[id] = true
    })
  return id
}

export function netDone(id) {
  return _netDone[id] || false
}

export function netError(id) {
  return _netErrors[id] || 'OK'
}

export function netTextResult(id) {
  return _netResults[id] || ''
}

export function getStreamStatus(id) {
  // Simplified - in Director this returns bytesSoFar, bytesTotal, error
  return { bytesSoFar: 0, bytesTotal: 0, error: _netErrors[id] || 'OK' }
}

// ── Timeout System ───────────────────────────────────────────────────────

const _timeouts = new Map()

export class Timeout {
  constructor(name, delay, handler, clientID, arg, repeat) {
    this.name = name
    this.delay = delay
    this.handler = handler
    this.clientID = clientID
    this.arg = arg
    this.repeat = repeat
    this._id = null
  }

  start() {
    if (this.repeat) {
      this._id = setInterval(() => {
        this.handler(this.arg)
      }, this.delay)
    } else {
      this._id = setTimeout(() => {
        this.handler(this.arg)
        _timeouts.delete(this.name)
      }, this.delay)
    }
  }

  stop() {
    if (this._id) {
      clearInterval(this._id)
      clearTimeout(this._id)
      this._id = null
    }
  }
}

export function createTimeout(name, delay, handler, clientID, arg, repeat) {
  if (_timeouts.has(name)) {
    _timeouts.get(name).stop()
  }
  const t = new Timeout(name, delay, handler, clientID, arg, repeat)
  _timeouts.set(name, t)
  t.start()
  return t
}

export function removeTimeout(name) {
  const t = _timeouts.get(name)
  if (t) {
    t.stop()
    _timeouts.delete(name)
  }
}

export function timeoutExists(name) {
  return _timeouts.has(name)
}

// ── Point ────────────────────────────────────────────────────────────────

export function point(x, y) {
  return { locH: x, locV: y }
}

// ── Rect ─────────────────────────────────────────────────────────────────

export function rect(left, top, right, bottom) {
  return { left, top, right, bottom, width: right - left, height: bottom - top }
}

// ── Cursor ───────────────────────────────────────────────────────────────

export function cursor(n) {
  // Lingo cursor numbers: 0=none, 4=watch/hourglass
  const cursors = {
    0: 'none',
    4: 'wait',
    280: 'default',
  }
  document.body.style.cursor = cursors[n] || 'default'
}

// ── Tempo ────────────────────────────────────────────────────────────────

export function puppetTempo(fps) {
  // Set frame rate (not directly applicable in JS, but can control update loop)
}

// ── Stage Operations ─────────────────────────────────────────────────────

export function updateStage() {
  // Force stage redraw
}

export function moveToFront(stage) {
  // Bring window to front
}

// ── Frame Control ────────────────────────────────────────────────────────

export function goToFrame(frame) {
  // In JS, this is handled by the state machine
}

// ── Network (additional helpers) ─────────────────────────────────────────

export function postNetText(url, data) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {})
}

// ── External Params ──────────────────────────────────────────────────────

const _externalParams = {}

export function registerExternalParam(key, value) {
  _externalParams[key] = value
}

export function externalParamValue(key) {
  return _externalParams[key]
}

// ── Variable System ──────────────────────────────────────────────────────
// Lingo: setVariable("key", value), getVariable("key"), variableExists("key")

const _variables = {}

export function setVariable(key, value) {
  _variables[key] = value
}

export function getVariable(key, defaultValue) {
  if (key in _variables) {
    return _variables[key]
  }
  return defaultValue !== undefined ? defaultValue : null
}

export function variableExists(key) {
  return key in _variables
}

export function getVariableValue(key, defaultValue) {
  return getVariable(key, defaultValue)
}

export function getIntVariable(key, defaultValue) {
  const val = getVariable(key, defaultValue)
  return typeof val === 'number' ? val : parseInt(val, 10) || defaultValue
}

// ── Struct System ────────────────────────────────────────────────────────
// Lingo: getStructVariable("struct.name") returns a struct (like a propList with special behavior)

const _structs = {}

export function registerStruct(name, data) {
  _structs[name] = data
}

export function getStructVariable(name) {
  if (_structs[name]) {
    return _structs[name]
  }
  // Return empty struct as fallback
  const empty = createPropList()
  _structs[name] = empty
  return empty
}

// ── Movie Path ───────────────────────────────────────────────────────────

export function getMoviePath() {
  return window.location.origin + '/'
}

// ── JavaScript Interop ───────────────────────────────────────────────────

export function callJavaScriptFunction(name, ...args) {
  if (window[name]) {
    return window[name](...args)
  }
}

// ── Utility ──────────────────────────────────────────────────────────────

export function post(msg) {
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log('[Lingo]', msg)
  }
}

export function alert(msg) {
  console.warn('[Lingo Alert]', msg)
}

// inside(point, rect)
export function inside(pt, r) {
  return pt.locH >= r.left && pt.locH <= r.right && pt.locV >= r.top && pt.locV <= r.bottom
}

// duplicate() for images/objects
export function duplicate(x) {
  if (x && typeof x.duplicate === 'function') return x.duplicate()
  if (Array.isArray(x)) return [...x]
  if (typeof x === 'object' && x !== null) return { ...x }
  return x
}

// replaceChunks - string replacement
export function replaceChunks(str, search, replace) {
  return str.split(search).join(replace)
}

// obfuscate/deobfuscate (simple encoding)
export function obfuscate(str) {
  return btoa(str)
}

export function secretDecode(str) {
  return atob(str)
}

export function deobfuscate(str) {
  return atob(str)
}

// UTF8 encoding/decoding
export function decodeUTF8(str, tForceDecode) {
  try {
    return decodeURIComponent(escape(str))
  } catch (e) {
    return str
  }
}

export function encodeUTF8(str) {
  try {
    return unescape(encodeURIComponent(str))
  } catch (e) {
    return str
  }
}

// ── Field / Script System ────────────────────────────────────────────────

// Lingo: field("name") returns the text content of a field member
export function field(nameOrNum) {
  // Placeholder - will be populated when field members are loaded
  return ''
}

// Lingo: convertToPropList(fieldText, delimiter) parses key=value text into a propList
export function convertToPropList(text, delimiter) {
  const result = createPropList()
  const lines = text.split(delimiter)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim()
      const valStr = trimmed.substring(eqIdx + 1).trim()
      result.setaProp(key, value(valStr))
    }
  }
  return result
}

// Lingo: script("name").new() creates an instance of a script
const _scriptRegistry = {}

export function registerScript(name, factory) {
  _scriptRegistry[name] = factory
}

export function script(nameOrNum) {
  const name = typeof nameOrNum === 'number' ? String(nameOrNum) : nameOrNum
  if (!_scriptRegistry[name]) {
    return {
      new() {
        return {}
      },
    }
  }
  return {
    new() {
      return _scriptRegistry[name]()
    },
  }
}

// ── Error / Debug ────────────────────────────────────────────────────────

export function error(me, msg, methodName, severity) {
  console.error(`[Lingo Error] ${methodName}: ${msg} (${severity})`)
  return false
}

export function fatalError(details) {
  console.error('[Lingo Fatal Error]', details)
}

export function setDebugLevel(level) {
  // Placeholder
}

// ── Special Services (placeholder) ───────────────────────────────────────

let _specialServices = null

export function getSpecialServices() {
  if (!_specialServices) {
    _specialServices = {
      openNetPage(url) {
        window.open(url, '_blank')
      },
      setExtVarPath(path) {
        // Placeholder
      },
    }
  }
  return _specialServices
}

export function registerSpecialServices(services) {
  _specialServices = services
}

// ── Event System ─────────────────────────────────────────────────────────

export function stopEvent() {
  // Placeholder - stops event propagation
}

export function pass() {
  // Placeholder - passes event to next handler
}

// ── Lingo call() function ────────────────────────────────────────────────

export function call(methodName, obj, ...args) {
  if (obj && typeof obj[methodName] === 'function') {
    return obj[methodName](...args)
  }
  return null
}
