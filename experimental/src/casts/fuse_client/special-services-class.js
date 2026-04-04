/**
 * Special Services Class
 * 
 * Translated from: casts/fuse_client/44_Special Services Class.ls
 * 
 * Utility services: tooltips, cursor, URL handling, unique IDs,
 * machine ID, process tracking, obfuscation, etc.
 */

import { VOID, voidp, stringp, integer, objectp, contains, chars, offset, replaceChars } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { error } from './error-api.js';
import { createObject, removeObject, objectExists } from './object-api.js';
import { getVariable, setVariable, variableExists, getIntVariable, getStructVariable } from './variable-api.js';
import { getMember, memberExists } from './resource-api.js';
import { networkManager } from '../../system/network.js';
import { RC4Extended } from '../../system/encryption.js';

export class SpecialServices extends ObjectBase {
  constructor() {
    super();

    this.catchFlag = 0;
    this.savedHook = 0;
    this.toolTipActive = getIntVariable('tooltip.active', 0);
    this.toolTipSpr = VOID;
    this.toolTipMem = VOID;
    this.toolTipID = VOID;
    this.toolTipDelay = 2000;
    this.currCursor = 0;
    this.lastCursor = 0;
    this.uniqueSeed = 0;
    this.processList = [];
    this.decoder = null;
  }

  construct() {
    this.catchFlag = 0;
    this.savedHook = 0;
    this.toolTipActive = getIntVariable('tooltip.active', 0);
    this.toolTipSpr = VOID;
    this.toolTipMem = VOID;
    this.toolTipID = VOID;
    this.toolTipDelay = getIntVariable('tooltip.delay', 2000);
    this.currCursor = 0;
    this.lastCursor = 0;
    this.uniqueSeed = 0;
    this.processList = [];

    // Initialize decoder for machine ID generation
    this.decoder = new RC4Extended();
    this.decoder.setKey('sulake1Unique2Key3Generator');

    return 1;
  }

  deconstruct() {
    // Cleanup tooltip
    this.toolTipSpr = VOID;
    this.toolTipMem = VOID;
    this.decoder = null;
    return 1;
  }

  // ── Tooltips ───────────────────────────────────────────────────────

  createToolTip(tText) {
    if (!this.toolTipActive) return;

    if (voidp(tText)) tText = '...';

    // Create or update tooltip element
    if (!this.toolTipMem) {
      this.prepareToolTip();
    }

    // Position at mouse
    // In production, this would create a DOM tooltip element
    this.toolTipID = Date.now();

    // Delay showing
    setTimeout(() => {
      if (this.toolTipID) {
        this.toolTipSpr = { visible: true, text: tText };
        // Hide after delay
        setTimeout(() => {
          this.removeToolTip();
        }, this.toolTipDelay);
      }
    }, this.toolTipDelay);

    return this.toolTipID;
  }

  removeToolTip(tNextID) {
    if (!this.toolTipActive) return;

    if (voidp(tNextID) || this.toolTipID === tNextID) {
      this.toolTipID = VOID;
      if (this.toolTipSpr) {
        this.toolTipSpr.visible = false;
      }
      return 1;
    }
    return 0;
  }

  prepareToolTip() {
    // In production, create DOM element for tooltip
    this.toolTipSpr = { visible: false, text: '' };
  }

  // ── Cursor ─────────────────────────────────────────────────────────

  setcursor(ttype) {
    switch (ttype) {
      case VOID:
      case 'arrow':
        ttype = 0;
        break;
      case 'ibeam':
        ttype = 1;
        break;
      case 'crosshair':
        ttype = 2;
        break;
      case 'crossbar':
        ttype = 3;
        break;
      case 'timer':
        ttype = 4;
        break;
      case 'previous':
        ttype = this.lastCursor;
        break;
    }

    this.lastCursor = this.currCursor;
    this.currCursor = ttype;

    // Set CSS cursor
    if (typeof document !== 'undefined') {
      const cursors = ['default', 'text', 'crosshair', 'crosshair', 'wait'];
      document.body.style.cursor = cursors[ttype] || 'default';
    }

    return 1;
  }

  // ── URL / Navigation ───────────────────────────────────────────────

  openNetPage(tURL_key, tTarget) {
    if (!stringp(tURL_key)) return 0;

    // Resolve predefined URLs
    tURL_key = this.getPredefinedURL(tURL_key);

    // Resolve target
    let resolvedTarget = '_blank';
    if (tTarget === 'self' || tTarget === '_self') {
      resolvedTarget = '_self';
    } else if (tTarget === '_new' || tTarget === 'new') {
      resolvedTarget = '_blank';
    } else if (tTarget) {
      resolvedTarget = tTarget;
    }

    // Replace %random% placeholder
    tURL_key = tURL_key.replace(/%random%/g, Math.floor(Math.random() * 10000000000));

    // Open in browser
    if (typeof window !== 'undefined') {
      window.open(tURL_key, resolvedTarget);
    }

    console.log(`Open page: ${tURL_key} target: ${resolvedTarget}`);
    return 1;
  }

  getPredefinedURL(tURL) {
    if (tURL.includes('http://%predefined%/')) {
      if (variableExists('url.prefix')) {
        const tPrefix = getVariable('url.prefix');
        const tReplace = tPrefix.endsWith('/') ? 'http://%predefined%/' : 'http://%predefined%';
        tURL = tURL.replace(/http:\/\/%predefined%\/?/g, tPrefix);
      } else {
        error(this, 'URL prefix not defined, invalid link.', 'getPredefinedURL', 'minor');
      }
    }
    return tURL;
  }

  getDomainPart(tPath) {
    if (voidp(tPath)) return '';

    // Strip protocol
    if (tPath.startsWith('https://')) tPath = tPath.substring(8);
    else if (tPath.startsWith('http://')) tPath = tPath.substring(7);

    // Get domain part (before first /)
    const slashIdx = tPath.indexOf('/');
    if (slashIdx >= 0) tPath = tPath.substring(0, slashIdx);

    // Strip port
    const colonIdx = tPath.indexOf(':');
    if (colonIdx >= 0) tPath = tPath.substring(0, colonIdx);

    // Get main domain (e.g., example.com from sub.example.com)
    const parts = tPath.split('.');
    const maxCount = tPath.includes('.co.') ? 3 : 2;
    if (parts.length > maxCount) {
      tPath = parts.slice(parts.length - maxCount).join('.');
    }

    return tPath;
  }

  getMoviePath() {
    return networkManager.getMoviePath();
  }

  // ── Unique IDs ─────────────────────────────────────────────────────

  getUniqueID() {
    this.uniqueSeed++;
    return `uid:${this.uniqueSeed}:${Date.now()}`;
  }

  // ── Machine ID ─────────────────────────────────────────────────────

  getMachineID() {
    const prefValueId = getVariable('pref.value.id', 'pref.value.id');
    let storedMachineID = String(localStorage.getItem(prefValueId) || '');

    if (storedMachineID) {
      const whiteList = getVariable('machine.id.white.list', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
      const maxLength = getVariable('machine.id.max.length', 24);

      let machineID = '';
      for (const char of storedMachineID) {
        if (whiteList.includes(char)) {
          machineID += char;
        }
      }
      return machineID.substring(0, maxLength);
    } else {
      const machineID = this.generateMachineId();
      localStorage.setItem(prefValueId, '#' + machineID);
      return machineID;
    }
  }

  generateMachineId() {
    const whiteList = getVariable('machine.id.white.list', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    const maxLength = getVariable('machine.id.max.length', 24);

    const rawId = String(Date.now()) + String(new Date().toLocaleTimeString()) + String(new Date().toLocaleDateString());
    let machineID = '';
    for (const char of rawId) {
      if (whiteList.includes(char)) {
        machineID += char;
      }
    }

    machineID = machineID.replace(/AM|PM|am|pm/g, '');
    return machineID.substring(0, maxLength);
  }

  // ── Process Tracking ───────────────────────────────────────────────

  sendProcessTracking(tStepValue) {
    this.processList.push(tStepValue);

    if (variableExists('processlog.url')) {
      const reportURL = String(getVariable('processlog.url'));

      if (reportURL === 'javascript') {
        // JS tracking
        return;
      }

      if (reportURL) {
        const params = {
          step: tStepValue,
          account_id: getVariable('account_id', ''),
        };

        fetch(reportURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        }).catch(() => { /* Silent fail */ });
      }
    }
  }

  getProcessTrackingList() {
    return [...this.processList];
  }

  // ── Obfuscation ────────────────────────────────────────────────────

  secretDecode(tKey) {
    const length = tKey.length;
    const halfLength = Math.floor(length / 2);

    const table = tKey.substring(0, halfLength);
    const key = tKey.substring(0, length);

    let checkSum = 0;
    for (let i = 0; i < key.length; i++) {
      const c = key[i];
      let a = table.indexOf(c);
      if (a < 0) a = 0;

      if (a % 2 === 0) a = a * 2;
      if (i % 3 === 0) a = a * 3;
      if (a < 0) a = key.length % 2;

      checkSum += a;
      checkSum ^= a * Math.pow(2, (i % 3) * 8);
    }

    return checkSum;
  }

  // ── Loading Bar ────────────────────────────────────────────────────

  showLoadingBar(tLoadID, tProps) {
    // Create loading bar instance
    // In production, this would create a visual loading bar
    const loadingBarID = 'loading_bar_' + this.getUniqueID();
    return loadingBarID;
  }

  // ── JavaScript Bridge ──────────────────────────────────────────────

  callJavaScriptFunction(tCallString, tdata) {
    if (typeof window === 'undefined') return 0;

    try {
      // Safe eval through Function constructor
      const fn = new Function('data', `return ${tCallString}`);
      return fn(tdata);
    } catch (e) {
      console.error('[SpecialServices] JS call error:', e);
      return 0;
    }
  }

  // ── Client Uptime ──────────────────────────────────────────────────

  getClientUpTime() {
    const now = Date.now();
    // Would compare with client_starttime stored in session
    return Math.floor((now - (this._clientStartTime || now)) / 1000);
  }

  // ── Print ──────────────────────────────────────────────────────────

  print(tObj, tMsg) {
    console.log(`Print: Object: ${tObj} Message: ${tMsg}`);
  }

  // ── Try/Catch (alert hook) ─────────────────────────────────────────

  try() {
    this.catchFlag = 0;
    // In Director: the alertHook = me
    // In JS: we use try/catch at the call site
    return 1;
  }

  catch() {
    return this.catchFlag;
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Special Services Class', SpecialServices);
