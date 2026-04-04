/**
 * Timeout Manager Class
 * 
 * Translated from: casts/fuse_client/35_Timeout Manager Class.ls
 * 
 * Manages timed callbacks using setTimeout.
 * Supports one-shot and repeating timeouts with iteration counts.
 */

import { VOID, voidp, stringp, symbolp, integerp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { error } from './error-api.js';
import { getObject, objectExists, objectp, getUniqueID } from './object-api.js';

export class TimeoutManager extends ObjectBase {
  constructor() {
    super();
    /** @type {Map<string, Object>} Timeout registry by ID */
    this.itemList = new Map();
  }

  construct() {
    this.itemList = new Map();
    return 1;
  }

  deconstruct() {
    for (const [id, task] of this.itemList) {
      if (task.timerId) {
        clearTimeout(task.timerId);
      }
    }
    this.itemList.clear();
    return 1;
  }

  /**
   * Create a timeout
   * 
   * @param {string} tID - Timeout ID
   * @param {number} tTime - Time in milliseconds
   * @param {string} tHandler - Method name to call
   * @param {string} tClientID - Object ID of the handler
   * @param {*} tArgument - Argument to pass
   * @param {number} tIterations - Number of times to fire (1 = once)
   */
  create(tID, tTime, tHandler, tClientID, tArgument, tIterations) {
    if (this.exists(tID)) {
      error(this, `Timeout already registered: ${tID}`, 'create', 'major');
      return 0;
    }
    if (!integerp(tTime)) {
      error(this, `Integer expected: ${tTime}`, 'create', 'major');
      return 0;
    }
    if (!symbolp(tHandler) && typeof tHandler !== 'string') {
      error(this, `Symbol expected: ${tHandler}`, 'create', 'major');
      return 0;
    }

    if (tClientID && objectExists(tClientID)) {
      const client = getObject(tClientID);
      if (client && typeof client[tHandler] !== 'function') {
        error(this, `Handler not found in object: ${tHandler} ${tClientID}`, 'create', 'major');
        return 0;
      }
    } else if (!voidp(tClientID)) {
      error(this, `Object ID or VOID expected: ${tClientID}`, 'create', 'major');
      return 0;
    }

    const handler = tHandler.replace(/^#/, ''); // Strip # prefix if symbol
    const iterations = tIterations || 1;

    // Schedule the timeout
    const timerId = setTimeout(() => {
      this.executeTimeout(tID, handler, tClientID, tArgument, iterations);
    }, tTime);

    this.itemList.set(tID, {
      timerId,
      handler,
      client: tClientID,
      argument: tArgument,
      iterations,
      count: 0,
      time: tTime,
    });

    return 1;
  }

  /**
   * Execute a timeout
   */
  executeTimeout(tID, handler, tClientID, tArgument, iterations) {
    const task = this.itemList.get(tID);
    if (!task) return;

    task.count++;

    // Call the handler
    if (voidp(tClientID)) {
      // Call as global function
      if (typeof window?.[handler] === 'function') {
        window[handler](tArgument);
      }
    } else {
      const client = getObject(tClientID);
      if (client && typeof client[handler] === 'function') {
        try {
          client[handler](tArgument);
        } catch (e) {
          console.error(`[TimeoutManager] Handler error (${handler}):`, e);
        }
      } else {
        this.remove(tID);
        return;
      }
    }

    // If iterations not reached, reschedule
    if (task.count < iterations) {
      task.timerId = setTimeout(() => {
        this.executeTimeout(tID, handler, tClientID, tArgument, iterations);
      }, task.time);
    } else {
      this.remove(tID);
    }
  }

  /**
   * Remove a timeout
   */
  remove(tID) {
    if (!this.exists(tID)) {
      error(this, `Item not found: ${tID}`, 'remove', 'minor');
      return 0;
    }

    const task = this.itemList.get(tID);
    if (task && task.timerId) {
      clearTimeout(task.timerId);
    }

    this.itemList.delete(tID);
    return 1;
  }

  /**
   * Get timeout info
   */
  get(tID) {
    if (!this.exists(tID)) return VOID;
    return this.itemList.get(tID);
  }

  /**
   * Check if timeout exists
   */
  exists(tID) {
    return this.itemList.has(tID);
  }

  /**
   * Print timeouts (debug)
   */
  print() {
    console.log('--- Timeouts ---');
    for (const [id, task] of this.itemList) {
      console.log(`  ${id}: handler=${task.handler} count=${task.count}/${task.iterations}`);
    }
    return 1;
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Timeout Manager Class', TimeoutManager);
