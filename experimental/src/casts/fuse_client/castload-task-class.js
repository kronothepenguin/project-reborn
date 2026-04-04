/**
 * CastLoad Task Class
 * 
 * Translated from: casts/fuse_client/50_CastLoad Task Class.ls
 * 
 * Tracks the progress of a cast loading operation.
 * Manages multiple casts, progress percentage, and callbacks.
 */

import { VOID, voidp, symbolp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { error, getObject, objectExists, getThreadManager } from './object-api.js';
import { getCastLoadManager } from './castload-api.js';

export class CastLoadTask extends ObjectBase {
  constructor() {
    super();

    /** @type {string|null} Group/task ID */
    this.groupId = null;

    /** @type {string} Task status: 'LOADING', 'ready', 'failed' */
    this.status = 'idle';

    /** @type {number} Number of casts loaded so far */
    this.loadedSoFar = 0;

    /** @type {string[]} List of cast names */
    this.castList = new Map();

    /** @type {number} Total number of casts */
    this.castCount = 0;

    /** @type {Array} Callback list */
    this.callBack = [];

    /** @type {number} Current task percentage (0-1) */
    this.currPercent = 0;

    /** @type {number} Temporary percent accumulator */
    this.tempPercent = 0;

    /** @type {number} Last reported percent */
    this.lastPercent = 0;

    /** @type {number} Temp load count */
    this.tmpLoadCount = 0;

    /** @type {number} Current load count */
    this.curLoadCount = 0;

    /** @type {boolean} Whether indexing is allowed after load */
    this.allowIndexing = true;

    /** @type {boolean} Whether task contains failed items */
    this.containsFailedItems = false;
  }

  /**
   * Define task from properties
   */
  define(tdata) {
    this.groupId = tdata.id;
    this.status = tdata.status || 'LOADING';
    this.loadedSoFar = tdata.sofar || 0;
    this.castCount = (tdata.casts || []).length;
    this.callBack = tdata.callback || VOID;
    this.currPercent = tdata.Percent || 0;
    this.allowIndexing = tdata.doindexing !== undefined ? tdata.doindexing : true;
    this.tempPercent = 0;
    this.lastPercent = 0;
    this.curLoadCount = 0;
    this.tmpLoadCount = 0;
    this.containsFailedItems = false;

    // Build cast list
    this.castList = new Map();
    for (const tCast of (tdata.casts || [])) {
      this.castList.set(tCast, 0); // 0 = not done
    }

    return 1;
  }

  /**
   * Mark one cast as done
   */
  oneCastDone(tFile) {
    this.loadedSoFar += 1;

    if (Math.floor(this.loadedSoFar) === this.castCount) {
      this.status = 'ready';
    }

    this.castList.set(tFile, 1);

    // Process completed casts
    while (this.castList.size > 0) {
      const [firstCast, done] = this.castList.entries().next().value;

      if (done === 1) {
        // Cast is loaded - init its thread
        const manager = getCastLoadManager();
        if (manager && manager.exists(firstCast)) {
          const threadManager = getThreadManager();
          if (threadManager) {
            // In production, would call threadManager.initThread(castNum)
            console.log(`[CastLoadTask] Init thread for cast: ${firstCast}`);
          }
        }
        this.castList.delete(firstCast);
        continue;
      }
      break;
    }

    return 1;
  }

  /**
   * Change loading count (positive or negative)
   */
  changeLoadingCount(tPosOrNeg) {
    this.curLoadCount += tPosOrNeg;
  }

  /**
   * Reset percent counter for new batch
   */
  resetPercentCounter() {
    this.tempPercent = 0;
    this.tmpLoadCount = 0;
    return 1;
  }

  /**
   * Update task percentage from instance progress
   */
  updateTaskPercent(tInstancePercent, tFile) {
    this.tmpLoadCount++;
    this.tempPercent += tInstancePercent;

    if (this.tmpLoadCount === this.curLoadCount) {
      let tempPercent = (this.tempPercent + this.loadedSoFar) / this.castCount;

      if (tempPercent <= 1.0 && this.lastPercent <= tempPercent) {
        this.currPercent = tempPercent;
      } else {
        this.currPercent = this.lastPercent;
      }
    }
  }

  // ── Status Access ──────────────────────────────────────────────────

  getTaskState() {
    return this.status;
  }

  getTaskPercent() {
    return this.currPercent;
  }

  getIndexingAllowed() {
    return this.allowIndexing;
  }

  hasFailedItems() {
    return this.containsFailedItems;
  }

  // ── Callback ───────────────────────────────────────────────────────

  /**
   * Execute callback when task is complete
   */
  doCallBack(tstate) {
    const success = tstate === 'done' ? 1 : 0;

    if (this.status === 'ready') {
      if (Array.isArray(this.callBack)) {
        for (const tCall of this.callBack) {
          if (tCall && tCall.client && objectExists(tCall.client)) {
            const client = getObject(tCall.client);
            if (client && typeof client[tCall.method] === 'function') {
              try {
                client[tCall.method](tCall.argument, success);
              } catch (e) {
                console.error('[CastLoadTask] Callback error:', e);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Add a callback
   */
  addCallBack(tID, tMethod, tClientID, tArgument) {
    if (!symbolp(tMethod) && typeof tMethod !== 'string') {
      error(this, `Symbol referring to handler expected: ${tMethod}`, 'addCallBack', 'major');
      return 0;
    }

    this.callBack.push({
      method: tMethod,
      client: tClientID,
      argument: tArgument,
    });

    return 1;
  }

  // ── Debug ──────────────────────────────────────────────────────────

  print() {
    console.log(`Task: ${this.groupId} [${this.status}] ${Math.floor(this.currPercent * 100)}%`);
    console.log(`  Loaded: ${this.loadedSoFar}/${this.castCount}`);
    console.log(`  Casts: ${Array.from(this.castList.keys()).join(', ')}`);
    return 1;
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('CastLoad Task Class', CastLoadTask);
