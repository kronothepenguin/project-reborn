/**
 * String Services Class
 * Translated from: 37_String Services Class.ls
 * String manipulation: hex conversion, UTF-8, URL encoding, obfuscation.
 */
import { VOID, voidp, stringp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { error, getVariable, variableExists, setVariable } from './object-api.js';

const QUOTE = '"';
const RETURN = '\n';
const SPACE = ' ';

export class StringServices extends ObjectBase {
  constructor() {
    super();
    this.convList = new Map();
    this.digits = '0123456789ABCDEF';
    this.usesUTF8 = VOID;
    this.unicodeDirector = false;
  }

  construct() {
    this.convList = new Map();
    this.digits = '0123456789ABCDEF';
    this.usesUTF8 = VOID;
    this.unicodeDirector = false;
    this.initConvList();
    return 1;
  }

  // ── Case Conversion ──────────────────────────────────────────────

  convertToLowerCase(tString) {
    return tString.toLowerCase();
  }

  convertToHigherCase(tString) {
    return tString.toUpperCase();
  }

  // ── Special Chars ────────────────────────────────────────────────

  convertSpecialChars(tString, tDirection) {
    if (voidp(tDirection)) tDirection = 0;
    let result = '';

    if (tDirection === 0) {
      for (const char of tString) {
        const conv = this.convList.get(char);
        result += conv !== undefined ? conv : char;
      }
    } else {
      for (const char of tString) {
        let found = false;
        for (const [key, val] of this.convList) {
          if (val === char) {
            result += key;
            found = true;
            break;
          }
        }
        if (!found) result += char;
      }
    }
    return result;
  }

  // ── Hex Conversion ───────────────────────────────────────────────

  convertIntToHex(tInt) {
    if (tInt <= 0) return '00';
    let hexStr = '';
    while (tInt > 0) {
      const d = tInt % 16;
      tInt = Math.floor(tInt / 16);
      hexStr = this.digits[d] + hexStr;
    }
    if (hexStr.length % 2 === 1) hexStr = '0' + hexStr;
    return hexStr;
  }

  convertHexToInt(tHex) {
    return parseInt(tHex, 16) || 0;
  }

  // ── Explode/Implode ──────────────────────────────────────────────

  explode(tStr, tDelim, tLimit) {
    if (voidp(tStr)) return [];
    if (voidp(tLimit)) tLimit = Infinity;
    const parts = tStr.split(tDelim);
    if (parts.length >= tLimit) {
      return [...parts.slice(0, tLimit - 1), parts.slice(tLimit - 1).join(tDelim)];
    }
    return parts;
  }

  implode(tList, tDelim) {
    if (voidp(tDelim) || voidp(tList)) return 0;
    return tList.join(tDelim);
  }

  // ── Replace ──────────────────────────────────────────────────────

  replaceChars(tString, tCharA, tCharB) {
    if (tCharA === tCharB) return tString;
    return tString.split(tCharA).join(tCharB);
  }

  replaceChunks(tString, tChunkA, tChunkB) {
    if (voidp(tString) || voidp(tChunkA) || voidp(tChunkB)) {
      error(this, 'At least one of the parameters was void!', this.id, 'replaceChunks', 'minor');
      return '';
    }
    return tString.split(tChunkA).join(tChunkB);
  }

  // ── URL Encode ───────────────────────────────────────────────────

  urlEncode(tStr) {
    const okChars = '-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_';
    let encoded = '';
    for (const char of tStr) {
      if (okChars.includes(char)) {
        encoded += char;
      } else if (char === ' ') {
        encoded += '+';
      } else {
        encoded += '%' + this.convertIntToHex(char.charCodeAt(0));
      }
    }
    return encoded;
  }

  // ── Obfuscation ──────────────────────────────────────────────────

  obfuscate(tStr) {
    let result = '';
    for (let i = 0; i < tStr.length; i++) {
      const num = tStr.charCodeAt(i);
      let newNum1 = (num & 15) * 2;
      let newNum2 = (num & 240) / 8;
      const rand1 = Math.floor(Math.random() * 6) + 1;
      newNum1 += (rand1 & 6) * 16 + (rand1 & 1);
      const rand2 = Math.floor(Math.random() * 6) + 1;
      newNum2 += (rand2 & 6) * 16 + (rand2 & 1);
      result += String.fromCharCode(newNum2) + String.fromCharCode(newNum1);
    }
    return result;
  }

  deobfuscate(tStr) {
    let result = '';
    for (let i = 0; i < tStr.length; i += 2) {
      if (i >= tStr.length - 1) break;
      const raw = [tStr.charCodeAt(i + 1), tStr.charCodeAt(i)];
      const nums = [(raw[0] & 30) / 2, (raw[1] & 30) * 8];
      const num = nums[0] | nums[1];
      result += String.fromCharCode(num);
    }
    return result;
  }

  // ── Local Float ──────────────────────────────────────────────────

  getLocalFloat(tStrFloat) {
    if (!stringp(tStrFloat)) return parseFloat(tStrFloat);
    if (!tStrFloat.includes('.')) return parseFloat(tStrFloat);
    return parseFloat(tStrFloat.replace(',', '.'));
  }

  // ── UTF-8 ────────────────────────────────────────────────────────

  encodeUTF8(tStr) {
    if (voidp(this.usesUTF8)) {
      if (variableExists('client.textdata.utf8')) {
        this.usesUTF8 = getVariable('client.textdata.utf8');
      } else {
        this.usesUTF8 = VOID;
      }
    }
    if (!this.usesUTF8) return tStr;

    const utf8Data = [];
    for (let i = 0; i < tStr.length; i++) {
      const value = tStr.charCodeAt(i);
      if (value < 128) {
        utf8Data.push(value);
      } else if (value < 2048) {
        utf8Data.push(192 + ((value / 64) & 31));
        utf8Data.push(128 + (value & 63));
      } else {
        utf8Data.push(224 + ((value / (64 * 64)) & 15));
        utf8Data.push(128 + ((value / 64) & 63));
        utf8Data.push(128 + (value & 63));
      }
    }
    return utf8Data.map(v => String.fromCharCode(v)).join('');
  }

  decodeUTF8(tStr, tForceDecode) {
    if (voidp(this.usesUTF8)) {
      if (variableExists('client.textdata.utf8')) {
        this.usesUTF8 = getVariable('client.textdata.utf8');
      } else {
        this.usesUTF8 = VOID;
      }
    }
    if (!this.usesUTF8) return tStr;
    if (this.unicodeDirector && !tForceDecode) return tStr;

    // Use native TextDecoder
    try {
      const bytes = [];
      for (let i = 0; i < tStr.length; i++) {
        const val = tStr.charCodeAt(i);
        if (val < 255) bytes.push(val);
        else {
          bytes.push(Math.floor(val / 256));
          if (val % 256 !== 0) bytes.push(val % 256);
        }
      }
      return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
    } catch {
      return tStr;
    }
  }

  // ── Init Conversion List ─────────────────────────────────────────

  initConvList() {
    this.convList.clear();
    // Character conversion tables would be loaded from system props
    return 1;
  }
}

ObjectManager.registerClass('String Services Class', StringServices);
