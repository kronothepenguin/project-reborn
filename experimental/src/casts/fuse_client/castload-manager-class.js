/**
 * CastLoad Manager Class
 * 
 * Translated from: casts/fuse_client/32_CastLoad Manager Class.ls
 * 
 * Manages dynamic loading of cast libraries (.cct/.cst files).
 * In the original Director version, this downloads binary cast files over HTTP.
 * In the JS version, this loads ES module bundles via dynamic import().
 * 
 * Future: WASM module parses binary .cct files instead of JS bundles.
 */

import { VOID, voidp, integerp, createPropList } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { createObject, getObject, removeObject } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';
import { error } from './error-api.js';

/**
 * Unique ID generator (simplified version of getUniqueID)
 */
let _uidCounter = 0;
function getUniqueID() {
  return 'castload_' + (++_uidCounter);
}

/**
 * Cast Load Task class (inline, needed by the manager)
 */
class CastLoadTask {
  constructor() {
    this.id = VOID;
    this.status = 'idle';
    this.percent = 0;
    this.sofar = 0;
    this.casts = [];
    this.callback = VOID;
    this.doIndexing = true;
    this.callbackMethod = VOID;
    this.callbackClientID = VOID;
    this.callbackArgument = VOID;
  }

  define(props) {
    if (props.id !== undefined) this.id = props.id;
    if (props.status !== undefined) this.status = props.status;
    if (props.Percent !== undefined) this.percent = props.Percent;
    if (props.sofar !== undefined) this.sofar = props.sofar;
    if (props.casts !== undefined) this.casts = [...props.casts];
    if (props.callback !== undefined) this.callback = props.callback;
    if (props.doindexing !== undefined) this.doIndexing = props.doindexing;
  }

  addCallBack(tID, tMethod, tClientID, tArgument) {
    this.callbackMethod = tMethod;
    this.callbackClientID = tClientID;
    this.callbackArgument = tArgument;
    return 1;
  }

  notifyComplete() {
    if (this.callbackMethod && this.callbackClientID) {
      const client = getObject(this.callbackClientID);
      if (client && typeof client[this.callbackMethod] === 'function') {
        try {
          client[this.callbackMethod](this.id, this.callbackArgument);
        } catch (e) {
          console.error('[CastLoadTask] Callback error:', e);
        }
      }
    }
  }
}

export class CastLoadManager extends ObjectBase {
  constructor() {
    super();

    /** @type {Map<string, string[]>} Task ID → list of cast names waiting */
    this.waitList = new Map();

    /** @type {Map<string, CastLoadTask>} Task ID → task object */
    this.taskList = new Map();

    /** @type {string[]} Available dynamic casts (already loaded) */
    this.availableDynCasts = [];

    /** @type {Map<string, number>} Permanent cast level registry */
    this.permanentLevelList = new Map();

    /** @type {string|null} Latest task ID */
    this.latestTaskID = null;

    /** @type {Map<string, number>} Currently downloading casts */
    this.currentDownLoads = new Map();

    /** @type {Map<string, string>} Loaded casts: name → cast number */
    this.loadedCasts = new Map();

    /** @type {string[]} Temporary wait list */
    this.tempWaitList = [];

    /** @type {number} Total cast library count */
    this.castLibCount = 0;

    /** @type {number} System cast number (fuse_client) */
    this.sysCastNum = 1;

    /** @type {number} Bin cast number */
    this.binCastNum = 2;

    /** @type {string} Null/empty cast name prefix */
    this.nullCastName = 'empty';

    /** @type {string} File extension (.cct for production, .cst for author) */
    this.fileExtension = '.cct';

    /** @type {number} Last error code */
    this.lastError = 0;

    /** @type {Map<string, Function>} Cast bundle loader functions (registered) */
    this.castLoaders = new Map();
  }

  construct() {
    this.fileExtension = '.cct';
    this.loadedCasts = new Map();
    this.tempWaitList = [];
    this.castLibCount = 0;
    this.nullCastName = 'empty';
    this.lastError = 0;
    this.waitList = new Map();
    this.taskList = new Map();
    this.availableDynCasts = [];
    this.permanentLevelList = new Map();
    this.currentDownLoads = new Map();
    this.castLoaders = new Map();

    // Register built-in casts
    this.loadedCasts.set('fuse_client', 1);
    this.loadedCasts.set('bin', 2);

    return 1;
  }

  deconstruct() {
    this.waitList.clear();
    this.taskList.clear();
    this.loadedCasts.clear();
    this.castLoaders.clear();
    return 1;
  }

  // ── Cast Loader Registration ───────────────────────────────────────

  /**
   * Register a cast bundle loader function.
   * 
   * In production, each hh_* cast bundle exports an init function:
   *   registerCastLoader('hh_room', () => import('./casts/hh_room.js'))
   */
  registerCastLoader(castName, loaderFn) {
    this.castLoaders.set(castName, loaderFn);
  }

  /**
   * Check if a cast loader is registered
   */
  hasCastLoader(castName) {
    return this.castLoaders.has(castName);
  }

  // ── Cast Loading ───────────────────────────────────────────────────

  /**
   * Start loading one or more casts
   * 
   * Original Lingo:
   *   on startCastLoad me, tCasts, tPermanentFlag, tAdd, tDoIndexing, tDoTracking
   *     ... validates, queues, starts preloading ...
   *     return tID  -- task ID
   *   end
   */
  startCastLoad(tCasts, tPermanentFlag, tAdd, tDoIndexing, tDoTracking) {
    if (voidp(tPermanentFlag)) tPermanentFlag = 0;
    if (voidp(tAdd)) tAdd = 0;
    if (voidp(tDoIndexing)) tDoIndexing = 1;
    if (voidp(tDoTracking)) tDoTracking = 0;

    this.lastError = 0;

    // Normalize cast list
    const castList = [];
    this.tempWaitList = [];

    if (Array.isArray(tCasts)) {
      for (const castName of tCasts) {
        castList.push(castName);
        this.addOneCastToWaitList(castName, tPermanentFlag);
      }
    } else if (typeof tCasts === 'object' && tCasts !== null) {
      // Property list: { permanentLevel: castName, ... }
      for (const [level, castName] of Object.entries(tCasts)) {
        castList.push(castName);
        this.addOneCastToWaitList(castName, parseInt(level) || tPermanentFlag);
      }
    } else if (typeof tCasts === 'string') {
      castList.push(tCasts);
      this.addOneCastToWaitList(tCasts, tPermanentFlag);
    }

    if (castList.length === 0) return 0;

    const tID = getUniqueID();
    this.latestTaskID = tID;

    // Remove temporary casts if not adding
    if (tAdd === 0) {
      this.removeTemporaryCast(castList);
    }

    // Build wait list
    if (this.tempWaitList.length > 0) {
      this.waitList.set(tID, [...this.tempWaitList]);
    }

    // Determine status
    let status = 'ready';
    let percent = 1.0;
    if (this.waitList.size > 0) {
      status = 'LOADING';
      percent = 0;
    }

    // Create task
    const task = new CastLoadTask();
    task.define({
      id: tID,
      status,
      Percent: percent,
      sofar: 0,
      casts: [...this.tempWaitList],
      callback: VOID,
      doindexing: tDoIndexing,
    });
    this.taskList.set(tID, task);

    // Start loading casts
    this.lastError = 0;
    const netOpCount = 2; // getIntVariable("net.operation.count", 2)
    for (let i = 0; i < netOpCount; i++) {
      this.addNextPreloadNetThing();
    }

    return tID;
  }

  /**
   * Add one cast to the wait list
   */
  addOneCastToWaitList(castName, permanentLevel) {
    // Skip if already loaded
    if (this.loadedCasts.has(castName)) return;
    // Skip if already in wait list
    if (this.tempWaitList.includes(castName)) return;
    // Skip if already in waitList
    for (const [, casts] of this.waitList) {
      if (casts.includes(castName)) return;
    }

    this.tempWaitList.push(castName);

    // Track permanent level
    if (permanentLevel > 0) {
      this.permanentLevelList.set(castName, permanentLevel);
    }
  }

  /**
   * Remove temporary casts from tracking
   */
  removeTemporaryCast(castList) {
    for (const castName of castList) {
      if (!this.permanentLevelList.has(castName)) {
        // It's temporary, can be removed if not currently needed
      }
    }
  }

  /**
   * Add next preload operation
   */
  addNextPreloadNetThing() {
    // Find next cast to load from wait list
    if (this.waitList.size === 0) return;

    // Get first task
    const [taskID, casts] = this.waitList.entries().next().value;

    if (casts.length === 0) {
      this.waitList.delete(taskID);
      return;
    }

    const castName = casts.shift();
    if (casts.length === 0) {
      this.waitList.delete(taskID);
    }

    // Check if already loaded
    if (this.loadedCasts.has(castName)) return;

    // Load the cast
    this.loadCast(castName, taskID);
  }

  /**
   * Load a single cast via dynamic import or registered loader
   */
  async loadCast(castName, taskID) {
    const task = this.taskList.get(taskID);
    if (!task) return;

    this.currentDownLoads.set(castName, 0);

    try {
      // Try registered loader first
      const loader = this.castLoaders.get(castName);
      if (loader) {
        await loader();
      } else {
        // Try dynamic import from cast bundles
        // In production: await import(`./casts/fuse-client.${castName}.js`)
        console.warn(`[CastLoadManager] No loader registered for cast: ${castName}`);
        console.warn(`[CastLoadManager] Register with: registerCastLoader('${castName}', () => import('./casts/${castName}.js'))`);
      }

      // Mark as loaded
      const castNum = this.loadedCasts.size + 3; // Start after system casts
      this.loadedCasts.set(castName, castNum);
      this.availableDynCasts.push(castName);
      this.currentDownLoads.delete(castName);

      // Update task progress
      task.sofar++;
      task.percent = this.calcTaskPercent(taskID);
      if (task.percent >= 1.0) {
        task.status = 'ready';
        task.notifyComplete();
      }

    } catch (err) {
      this.lastError = 1;
      this.currentDownLoads.delete(castName);
      error(this, `Failed to load cast: ${castName} - ${err.message}`, 'loadCast', 'major');
    }
  }

  /**
   * Calculate task completion percentage
   */
  calcTaskPercent(taskID) {
    const task = this.taskList.get(taskID);
    if (!task || task.casts.length === 0) return 1.0;

    let loaded = 0;
    for (const castName of task.casts) {
      if (this.loadedCasts.has(castName)) loaded++;
    }
    return task.casts.length > 0 ? loaded / task.casts.length : 1.0;
  }

  // ── Callbacks ──────────────────────────────────────────────────────

  registerCallback(tID, tMethod, tClientID, tArgument) {
    const task = this.taskList.get(tID);
    if (!task) return 0;
    return task.addCallBack(tID, tMethod, tClientID, tArgument);
  }

  // ── Reset ──────────────────────────────────────────────────────────

  resetCastLibs(tClean, tForced) {
    if (tClean !== 1) tClean = 0;

    if (tClean) {
      // Clear all temporary casts
      for (const [name, num] of this.loadedCasts) {
        if (name !== 'fuse_client' && name !== 'bin') {
          this.loadedCasts.delete(name);
        }
      }
    }

    return this.initPreloader();
  }

  initPreloader() {
    // Initialize preloader state
    this.castLibCount = this.loadedCasts.size;
    return 1;
  }

  // ── Lookup ─────────────────────────────────────────────────────────

  getLoadPercent(tID) {
    if (voidp(tID)) tID = this.latestTaskID;
    const task = this.taskList.get(tID);
    if (!task) return 0;
    return Math.floor(task.percent * 100);
  }

  FindCastNumber(tCastName) {
    return this.loadedCasts.get(tCastName) || 0;
  }

  exists(tCastName) {
    return this.loadedCasts.has(tCastName) || this.castLoaders.has(tCastName);
  }

  // ── Debug ──────────────────────────────────────────────────────────

  print() {
    console.log('--- Cast Libraries ---');
    for (const [name, num] of this.loadedCasts) {
      const isPerm = this.permanentLevelList.has(name);
      console.log(`  ${name} → ${num}${isPerm ? ' [permanent]' : ''}`);
    }
    console.log(`  Available dynamic: ${this.availableDynCasts.join(', ') || '(none)'}`);
    console.log(`  Pending: ${this.waitList.size} tasks`);
    return 1;
  }
}

// Register the class
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('CastLoad Manager Class', CastLoadManager);
