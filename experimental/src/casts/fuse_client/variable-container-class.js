/**
 * Variable Container Class
 * 
 * Translated from: casts/fuse_client/47_Variable Container Class.ls
 * 
 * Key-value store for system variables.
 * Used throughout the system for configuration and shared state.
 */

import { VOID, voidp, stringp, symbolp, integer, integerp, createPropList } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { error } from './error-api.js';

const QUOTE = '"';
const RETURN = '\n';
const SPACE = ' ';

export class VariableContainer extends ObjectBase {
  constructor() {
    super();

    /** @type {Map<string, *>} Variable store */
    this.itemList = new Map();
  }

  construct() {
    this.itemList = new Map();
    return 1;
  }

  deconstruct() {
    this.itemList.clear();
    return 1;
  }

  // ── Variable Operations ────────────────────────────────────────────

  /**
   * Create/set a variable
   */
  create(tVariable, tValue) {
    if (!stringp(tVariable) && !symbolp(tVariable)) {
      error(this, `String or symbol expected: ${tVariable}`, 'create', 'major');
      return 0;
    }
    const key = this._normalizeKey(tVariable);
    this.itemList.set(key, tValue);
    return 1;
  }

  /**
   * Set a variable (alias for create)
   */
  set(tVariable, tValue) {
    return this.create(tVariable, tValue);
  }

  /**
   * Get a variable with optional default
   */
  get(tVariable, tDefault) {
    const key = this._normalizeKey(tVariable);
    let value = this.itemList.get(key);

    if (voidp(value)) {
      let tError = `Variable not found: ${QUOTE}${tVariable}${QUOTE}`;
      if (!voidp(tDefault)) {
        value = tDefault;
        tError += ` Using given default: ${tDefault}`;
      } else {
        value = 0;
      }
      error(this, tError, 'get', 'minor');
    }

    return value;
  }

  /**
   * Get a variable as integer
   */
  getInt(tVariable, tDefault) {
    const key = this._normalizeKey(tVariable);
    let value = this.itemList.get(key);

    if (value !== undefined && value !== null) {
      return integer(value);
    }

    let tError = `Variable not found: ${QUOTE}${tVariable}${QUOTE}`;
    if (!voidp(tDefault)) {
      value = tDefault;
      tError += ` Using given default: ${tDefault}`;
    } else {
      value = 0;
    }
    error(this, tError, 'getInt', 'minor');
    return value;
  }

  /**
   * Get a variable, parsing its value (for lists/structs)
   * Returns a duplicate of complex types to prevent mutation.
   */
  getValue(tVariable, tDefault) {
    const key = this._normalizeKey(tVariable);
    let value = this.itemList.get(key);

    if (voidp(value)) {
      let tError = `Variable not found: ${QUOTE}${tVariable}${QUOTE}`;
      if (!voidp(tDefault)) {
        value = tDefault;
        tError += ` Using given default: ${tDefault}`;
      } else {
        value = 0;
      }
      error(this, tError, 'getValue', 'minor');
      return value;
    }

    // Duplicate complex types to prevent mutation
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      return JSON.parse(JSON.stringify(value));
    }

    return value;
  }

  /**
   * Remove a variable
   */
  remove(tVariable) {
    const key = this._normalizeKey(tVariable);
    return this.itemList.delete(key) ? 1 : 0;
  }

  /**
   * Check if variable exists
   */
  exists(tVariable) {
    const key = this._normalizeKey(tVariable);
    return this.itemList.has(key);
  }

  // ── Field Dumping ──────────────────────────────────────────────────

  /**
   * Dump variable field from a text string
   * 
   * Parses key=value pairs from a field/member string.
   * Format: "key1=value1\nkey2=value2\n..."
   */
  dump(tFieldContent, tDelimiter, tOverride) {
    if (tDelimiter === undefined || tDelimiter === null) {
      tDelimiter = RETURN;
    }
    if (tOverride === undefined || tOverride === null) {
      tOverride = 1;
    }

    const items = tFieldContent.split(tDelimiter);

    for (const pair of items) {
      const trimmed = pair.trim();
      if (trimmed.length === 0) continue;
      if (trimmed.startsWith('#')) continue;

      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 1) continue;

      const tProp = trimmed.substring(0, eqIdx).trim();
      let tValue = trimmed.substring(eqIdx + 1).trim();

      // Try to parse value type
      tValue = this._parseValue(tValue);

      // Store (respect override flag)
      if (tOverride || !this.itemList.has(tProp)) {
        this.itemList.set(tProp, tValue);
      }
    }

    return 1;
  }

  /**
   * Clear all variables
   */
  clear() {
    this.itemList.clear();
  }

  // ── Helpers ────────────────────────────────────────────────────────

  /**
   * Normalize a variable key (strip # from symbols)
   */
  _normalizeKey(tVariable) {
    if (symbolp(tVariable)) {
      return tVariable.replace(/^#/, '');
    }
    return String(tVariable);
  }

  /**
   * Parse a string value to appropriate type
   */
  _parseValue(tValue) {
    if (typeof tValue !== 'string') return tValue;

    // Empty
    if (tValue === '') return tValue;

    // Symbol: #name
    if (tValue.startsWith('#')) {
      return tValue; // Keep as symbol string
    }

    // Integer
    if (/^-?\d+$/.test(tValue)) {
      return parseInt(tValue, 10);
    }

    // Float
    if (/^-?\d+\.\d+$/.test(tValue)) {
      return parseFloat(tValue);
    }

    // Boolean-like
    if (tValue === 'TRUE' || tValue === 'true') return true;
    if (tValue === 'FALSE' || tValue === 'false') return false;

    return tValue;
  }

  // ── Debug ──────────────────────────────────────────────────────────

  print() {
    console.log('--- Variables ---');
    for (const [key, value] of this.itemList) {
      console.log(`  ${key} = ${JSON.stringify(value)}`);
    }
    return 1;
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Variable Container Class', VariableContainer);
