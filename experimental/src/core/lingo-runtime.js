/**
 * Lingo Runtime Emulation Layer
 * 
 * Provides JavaScript equivalents of Macromedia Director Lingo built-in
 * types, operators, and helper functions used throughout the translated code.
 */

// ── Lingo Types ──────────────────────────────────────────────────────────

/**
 * Lingo VOID - equivalent of undefined in Lingo
 */
export const VOID = undefined;

/**
 * Check if a value is VOID (Lingo's voidp())
 */
export function voidp(val) {
  return val === VOID || val === undefined || val === null;
}

/**
 * Check if a value is a Lingo list (array)
 */
export function listp(val) {
  return Array.isArray(val);
}

/**
 * Check if a value is a Lingo property list (object with symbol keys)
 */
export function structp(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val) && val.ilk === 'struct';
}

/**
 * Check if a value is a Lingo symbol
 */
export function symbolp(val) {
  return typeof val === 'symbol' || (typeof val === 'string' && val.startsWith('#'));
}

/**
 * Check if a value is a Lingo string
 */
export function stringp(val) {
  return typeof val === 'string';
}

/**
 * Check if a value is a Lingo integer
 */
export function integerp(val) {
  return Number.isInteger(val);
}

/**
 * Check if a value is a Lingo object (instance)
 */
export function objectp(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val) && val.ilk !== 'struct';
}

// ── Lingo Constants ──────────────────────────────────────────────────────

/**
 * Lingo EMPTY - empty string
 */
export const EMPTY = '';

/**
 * Lingo RETURN - newline character
 */
export const RETURN = '\n';

/**
 * Lingo TAB - tab character
 */
export const TAB = '\t';

/**
 * Lingo QUOTE - double quote character
 */
export const QUOTE = '"';

// ── Symbol helpers ───────────────────────────────────────────────────────

/**
 * Create a Lingo symbol (stored as string with # prefix for readability)
 */
export function symbol(name) {
  return '#' + name.replace(/^#/, '');
}

/**
 * Get symbol name without # prefix
 */
export function symbolName(sym) {
  if (typeof sym === 'string') return sym.replace(/^#/, '');
  return String(sym);
}

/**
 * Convert symbol to plain string
 */
export function symbolToString(sym) {
  return typeof sym === 'string' ? sym.replace(/^#/, '') : String(sym);
}

// ── List / Property List helpers ─────────────────────────────────────────

/**
 * Create an empty Lingo list
 */
export function createList(...items) {
  return [...items];
}

/**
 * Create an empty Lingo property list (struct)
 * Usage: createPropList() or from object: createPropList({ key: value })
 */
export function createPropList(obj = null) {
  if (obj === null) {
    return { ilk: 'struct' };
  }
  const result = { ilk: 'struct' };
  for (const [key, val] of Object.entries(obj)) {
    result[key] = val;
  }
  return result;
}

/**
 * Add item to a Lingo list
 */
export function addToList(list, item) {
  list.push(item);
}

/**
 * Get property from a property list (getaProp)
 */
export function getaProp(struct, propName) {
  if (!structp(struct)) return VOID;
  return struct[propName] !== undefined ? struct[propName] : VOID;
}

/**
 * Set property on a property list (setaProp)
 */
export function setaProp(struct, propName, value) {
  if (!structp(struct)) return;
  struct[propName] = value;
}

/**
 * Get property at index from a property list
 */
export function getPropAt(struct, index) {
  if (!structp(struct)) return VOID;
  const keys = Object.keys(struct).filter(k => k !== 'ilk');
  if (index < 1 || index > keys.length) return VOID;
  return struct[keys[index - 1]];
}

/**
 * Delete a property from a property list
 */
export function deleteProp(struct, propName) {
  if (!structp(struct)) return;
  delete struct[propName];
}

/**
 * Count of properties in a property list
 */
export function propCount(struct) {
  if (!structp(struct)) return 0;
  return Object.keys(struct).filter(k => k !== 'ilk').length;
}

/**
 * Check if property exists in a property list
 */
export function getPropList(struct, propName) {
  if (!structp(struct)) return false;
  return struct[propName] !== undefined;
}

/**
 * Duplicate a Lingo value (deep copy for lists/structs)
 */
export function duplicate(val) {
  if (voidp(val)) return VOID;
  if (Array.isArray(val)) return [...val];
  if (structp(val)) return { ...val };
  if (typeof val === 'object' && val !== null) return { ...val };
  return val;
}

// ── String helpers ───────────────────────────────────────────────────────

/**
 * Lingo offset() - find position of substring
 */
export function offset(searchStr, targetStr) {
  if (!stringp(searchStr) || !stringp(targetStr)) return 0;
  const pos = targetStr.indexOf(searchStr);
  return pos >= 0 ? pos + 1 : 0; // Lingo uses 1-based indexing
}

/**
 * Lingo chars() - extract substring (1-based, inclusive)
 */
export function chars(str, startPos, endPos) {
  if (!stringp(str)) return EMPTY;
  return str.substring(startPos - 1, endPos);
}

/**
 * Lingo contains check
 */
export function contains(str, substr) {
  if (!stringp(str) || !stringp(substr)) return false;
  return str.includes(substr);
}

/**
 * Lingo integer() - convert string to integer
 */
export function integer(val) {
  if (integerp(val)) return val;
  if (stringp(val)) return parseInt(val, 10) || 0;
  return Math.floor(Number(val)) || 0;
}

/**
 * Lingo value() - convert string to value (list, struct, number, etc.)
 */
export function value(str) {
  if (!stringp(str)) return str;
  // Try JSON parsing for Lingo property lists and lists
  try {
    // Convert Lingo syntax to JSON
    let json = str
      .replace(/\[/g, '[')
      .replace(/\]/g, ']')
      .replace(/:/g, ':')
      .replace(/#(\w+)/g, '"#$1"'); // quote symbols
    return JSON.parse(json);
  } catch {
    // Try as number
    const num = Number(str);
    if (!isNaN(num)) return num;
    return str;
  }
}

// ── Color helper ─────────────────────────────────────────────────────────

/**
 * Parse Lingo rgb() color definition
 * rgb(128,128,128) or rgb("#000000")
 */
export function parseColor(colorStr) {
  if (!stringp(colorStr)) return { r: 0, g: 0, b: 0 };
  
  // rgb("#RRGGBB") format
  const hexMatch = colorStr.match(/#([0-9a-fA-F]{6})/);
  if (hexMatch) {
    const hex = hexMatch[1];
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }
  
  // rgb(r,g,b) format
  const rgbMatch = colorStr.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }
  
  return { r: 0, g: 0, b: 0 };
}

// ── Range helper ─────────────────────────────────────────────────────────

/**
 * Parse Lingo range notation [x1:y1, x2:y2] or [x1, y1, x2, y2]
 */
export function parseRange(rangeStr) {
  if (Array.isArray(rangeStr)) {
    if (rangeStr.length === 4) {
      return { left: rangeStr[0], top: rangeStr[1], right: rangeStr[2], bottom: rangeStr[3] };
    }
  }
  return { left: 0, top: 0, right: 0, bottom: 0 };
}

// ── Lingo "the" properties (stage, system info) ─────────────────────────

/**
 * Global stage/system properties - populated by Stage class
 */
export const lingoGlobals = {
  runMode: 'Author', // "Author", "Projector", "Web"
  debugPlaybackEnabled: 0,
  exitLock: 0,
  tempo: 24,
  stageLeft: 0,
  stageTop: 0,
  stageRight: 800,
  stageBottom: 600,
  stageWidth: 800,
  stageHeight: 600,
  itemDelimiter: ',',
  keyboardFocusSprite: 0,
  longTime: '',
  frame: 1,
};

/**
 * Simulate Lingo "the propertyName" access
 */
export function lingoThe(propName) {
  return lingoGlobals[propName];
}

/**
 * Simulate Lingo "the propertyName = value" assignment
 */
export function lingoTheSet(propName, value) {
  lingoGlobals[propName] = value;
}

// ── Message/Event system ─────────────────────────────────────────────────

/**
 * Simple message registry for registerMessage/unregisterMessage pattern
 */
class MessageRegistry {
  constructor() {
    this.messages = new Map();
  }

  register(messageName, targetId, handlerMethod) {
    if (!this.messages.has(messageName)) {
      this.messages.set(messageName, new Map());
    }
    const targets = this.messages.get(messageName);
    targets.set(targetId, { targetId, handlerMethod });
  }

  unregister(messageName, targetId) {
    if (this.messages.has(messageName)) {
      this.messages.get(messageName).delete(targetId);
    }
  }

  execute(messageName, params = []) {
    if (!this.messages.has(messageName)) return;
    const targets = this.messages.get(messageName);
    for (const { targetId, handlerMethod } of targets.values()) {
      // Will be routed through the object manager
      if (globalThis.executeMessageHandler) {
        globalThis.executeMessageHandler(targetId, handlerMethod, params);
      }
    }
  }

  getHandlers(messageName) {
    if (!this.messages.has(messageName)) return [];
    return Array.from(this.messages.get(messageName).values());
  }
}

export const messageRegistry = new MessageRegistry();

export function registerMessage(messageName, targetId, handlerMethod) {
  messageRegistry.register(messageName, targetId, handlerMethod);
}

export function unregisterMessage(messageName, targetId) {
  messageRegistry.unregister(messageName, targetId);
}

export function executeMessage(messageName, params) {
  messageRegistry.execute(messageName, params);
}

// ── Export all ───────────────────────────────────────────────────────────

export default {
  VOID,
  EMPTY,
  RETURN,
  TAB,
  QUOTE,
  voidp,
  listp,
  structp,
  symbolp,
  stringp,
  integerp,
  objectp,
  symbol,
  symbolName,
  symbolToString,
  createList,
  createPropList,
  addToList,
  getaProp,
  setaProp,
  getPropAt,
  deleteProp,
  propCount,
  getPropList,
  duplicate,
  offset,
  chars,
  contains,
  integer,
  value,
  parseColor,
  parseRange,
  lingoGlobals,
  lingoThe,
  lingoTheSet,
  registerMessage,
  unregisterMessage,
  executeMessage,
  message_registry: messageRegistry,
};
