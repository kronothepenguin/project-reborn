/**
 * Error Manager Class
 * 
 * Translated from: casts/fuse_client/28_Error Manager Class.ls
 * 
 * Centralized error handling with caching, debug levels,
 * and error dialog display.
 */

import { VOID, voidp, stringp, symbolp, objectp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { error as globalError, fatalError } from './error-api.js';
import { getObjectManager } from './object-api.js';
import { getIntVariable, variableExists, getVariable } from './variable-api.js';
import { executeMessage } from '../../core/lingo-runtime.js';

export class ErrorManager extends ObjectBase {
  constructor() {
    super();

    /** @type {number} Debug level (1-3) */
    this.debugLevel = 1;

    /** @type {string} Cached error log */
    this.errorCache = '';

    /** @type {number} Max cache size (lines) */
    this.cacheSize = 30;

    /** @type {string} Error dialog level */
    this.errorDialogLevel = 'critical';

    /** @type {string[]} Error levels */
    this.errorLevelList = ['minor', 'major', 'critical'];

    /** @type {string[]} Client error list */
    this.clientErrorList = [];

    /** @type {string[]} Server error list */
    this.serverErrorList = [];

    /** @type {boolean} Whether fatal error was reported */
    this.fatalReported = 0;

    /** @type {string[]} Fatal report parameter order */
    this.fatalReportParamOrder = [
      'error', 'version', 'build', 'os', 'host', 'port',
      'client_version', 'mus_errorcode', 'error_id',
    ];
  }

  construct() {
    this.debugLevel = 1;
    this.errorCache = '';
    this.cacheSize = 30;
    this.fatalReported = 0;
    this.clientErrorList = [];
    this.serverErrorList = [];
    this.errorLevelList = ['minor', 'major', 'critical'];

    // Set error dialog level from config
    if (variableExists('client.debug.level')) {
      const level = getVariable('client.debug.level');
      if (this.errorLevelList.includes(level)) {
        this.errorDialogLevel = level;
      } else {
        this.errorDialogLevel = 'critical';
      }
    } else {
      this.errorDialogLevel = 'critical';
    }

    return 1;
  }

  deconstruct() {
    // Cleanup
    this.clientErrorList = [];
    this.serverErrorList = [];
    this.errorCache = '';
    return 1;
  }

  // ── Error Handling ─────────────────────────────────────────────────

  /**
   * Handle an error
   */
  error(tObject, tMsg, tMethod, tErrorLevel) {
    // Format object name
    let objStr = 'Unknown';
    if (objectp(tObject)) {
      objStr = tObject.constructor?.name || 'Unknown';
    } else if (stringp(tObject)) {
      objStr = tObject;
    }

    if (!stringp(tMsg)) tMsg = 'Unknown';
    if (!symbolp(tMethod) && typeof tMethod !== 'string') tMethod = 'Unknown';

    // Build error string
    const errorLines = [];
    errorLines.push(`Time: ${new Date().toLocaleTimeString()}`);
    errorLines.push(`Method: ${tMethod}`);
    errorLines.push(`Object: ${objStr}`);
    errorLines.push(`Message: ${tMsg.split('\n')[0]}`);

    const errorStr = errorLines.join('\n');

    // Add to client error list
    const compactStr = `${new Date().toLocaleTimeString()}-${tMethod}-${objStr}-${tMsg.split('\n')[0]}`;
    this.clientErrorList.push(compactStr);

    // Update cache
    this.errorCache += errorStr + '\n';
    const lines = this.errorCache.split('\n');
    if (lines.length > this.cacheSize) {
      this.errorCache = lines.slice(lines.length - this.cacheSize).join('\n');
    }

    // Log based on debug level
    switch (this.debugLevel) {
      case 1:
      case 2:
      default:
        console.error(`Error:\n${errorStr}`);
        break;
      case 3:
        executeMessage('debugdata', `Error: ${errorStr}`);
        break;
    }

    // Show error dialog if level warrants it
    const errorLevelIdx = this.errorLevelList.indexOf(tErrorLevel || 'minor');
    const dialogLevelIdx = this.errorLevelList.indexOf(this.errorDialogLevel);

    if (errorLevelIdx >= dialogLevelIdx) {
      const dialogMsg = `Method: ${tMethod}\nObject: ${objStr}\nMessage: ${tMsg.split('\n')[0]}`;
      executeMessage('showErrorMessage', 'client', dialogMsg);
    }

    return 0;
  }

  /**
   * Handle a server error
   */
  serverError(tErrorList) {
    if (typeof tErrorList === 'object' && tErrorList !== null) {
      const errorStr = `${tErrorList.errorId}-${tErrorList.errorMsgId}-${tErrorList.time}`;
      this.serverErrorList.push(errorStr);
    }
  }

  // ── Error Retrieval ────────────────────────────────────────────────

  getClientErrors() {
    return this.clientErrorList.join('\n');
  }

  getServerErrors() {
    return this.serverErrorList.join('\n');
  }

  getErrorCache() {
    return this.errorCache;
  }

  clearErrors() {
    this.clientErrorList = [];
    this.serverErrorList = [];
    this.errorCache = '';
    return 1;
  }

  // ── Fatal Error Reporting ──────────────────────────────────────────

  reportFatalError(errorData) {
    if (this.fatalReported) return 0;
    this.fatalReported = 1;

    // Build report
    const report = {};
    for (const param of this.fatalReportParamOrder) {
      report[param] = errorData[param] || '';
    }

    console.error('[Fatal Error Report]', report);

    // In production, would send to error reporting server
    return 1;
  }

  // ── Debug Level ────────────────────────────────────────────────────

  setDebugLevel(level) {
    if (level >= 1 && level <= 3) {
      this.debugLevel = level;
      return 1;
    }
    return 0;
  }

  getDebugLevel() {
    return this.debugLevel;
  }

  // ── Alert Hook (catch runtime errors) ──────────────────────────────

  alertHook() {
    // Would catch Director runtime alerts
    // In JS, we use window.onerror or try/catch
    return 1;
  }

  // ── Debug ──────────────────────────────────────────────────────────

  print() {
    console.log('--- Error Manager ---');
    console.log(`  Debug level: ${this.debugLevel}`);
    console.log(`  Dialog level: ${this.errorDialogLevel}`);
    console.log(`  Client errors: ${this.clientErrorList.length}`);
    console.log(`  Server errors: ${this.serverErrorList.length}`);
    return 1;
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Error Manager Class', ErrorManager);
