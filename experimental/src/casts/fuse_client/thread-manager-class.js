/**
 * Thread Manager Class
 * 
 * Translated from: casts/fuse_client/29_Thread Manager Class.ls
 * 
 * Manages the lifecycle of threads - persistent object containers
 * that organize code into logical modules (room, navigator, IM, etc.).
 * 
 * In Lingo, a thread is associated with a cast member's field
 * (thread.index.txt) that defines its component/interface/handler classes.
 * In JS, threads are module containers with registered components.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';

/**
 * Thread instance container
 */
class ThreadInstance extends ObjectBase {
  constructor() {
    super();
    this.threadId = VOID;
    this.initField = VOID;
    this.component = null;
    this.interface = null;
    this.handler = null;
    this.isInitialized = false;
    this.isClosed = false;
  }

  construct() {
    return 1;
  }

  deconstruct() {
    this.isClosed = true;
    if (this.component && typeof this.component.deconstruct === 'function') {
      this.component.deconstruct();
    }
    if (this.interface && typeof this.interface.deconstruct === 'function') {
      this.interface.deconstruct();
    }
    if (this.handler && typeof this.handler.deconstruct === 'function') {
      this.handler.deconstruct();
    }
    this.component = null;
    this.interface = null;
    this.handler = null;
    return 1;
  }

  getID() {
    return this.threadId;
  }

  getComponent() {
    return this.component;
  }

  getInterface() {
    return this.interface;
  }

  getHandler() {
    return this.handler;
  }
}

export class ThreadManager extends ObjectBase {
  constructor() {
    super();
    /** @type {Map<string|symbol, ThreadInstance>} Thread registry */
    this.threads = new Map();
    /** @type {Map<string, Object>} Thread index data (from .txt files) */
    this.threadIndexData = new Map();
  }

  construct() {
    this.threads = new Map();
    this.threadIndexData = new Map();
    return 1;
  }

  deconstruct() {
    for (const [id, thread] of this.threads) {
      thread.deconstruct();
    }
    this.threads.clear();
    this.threadIndexData.clear();
    return 1;
  }

  // ── Thread Index Registration ────────────────────────────────────────

  /**
   * Register thread index data
   * Parsed from files like "73_thread.index.txt":
   *   thread.id = core
   *   component.class = Core Thread Class
   */
  registerThreadIndex(threadId, data) {
    this.threadIndexData.set(threadId, data);
  }

  /**
   * Get registered thread index data
   */
  getThreadIndexData(threadId) {
    return this.threadIndexData.get(threadId) || null;
  }

  // ── Thread Lifecycle ─────────────────────────────────────────────────

  /**
   * Create a new thread
   * 
   * Original Lingo pattern:
   *   on create me, tID, tInitField
   *     tThread = createObject(tID, ...)
   *     tThread.threadId = tID
   *     tThread.initField = tInitField
   *     this.threads[tID] = tThread
   *     return tThread
   *   end
   */
  create(tID, tInitField) {
    if (voidp(tID)) return 0;
    if (this.threads.has(tID)) {
      return this.threads.get(tID);
    }

    const thread = new ThreadInstance();
    thread.threadId = tID;
    thread.initField = tInitField;

    // Check if there's index data for this thread
    const indexData = this.threadIndexData.get(tID);
    if (indexData) {
      // In full implementation, this would load the component/interface/handler
      // classes from the index data
      thread.component = this.createComponent(indexData);
      thread.interface = this.createInterface(indexData);
      thread.handler = this.createHandler(indexData);
    }

    this.threads.set(tID, thread);
    return thread;
  }

  /**
   * Create component from thread index data
   */
  createComponent(indexData) {
    if (!indexData.componentClass) return null;
    // In full implementation: instantiate the component class
    // For now, return a base object
    return { id: indexData.threadId };
  }

  /**
   * Create interface from thread index data
   */
  createInterface(indexData) {
    if (!indexData.interfaceClass) return null;
    return { id: indexData.threadId };
  }

  /**
   * Create handler from thread index data
   */
  createHandler(indexData) {
    if (!indexData.handlerClass) return null;
    return { id: indexData.threadId };
  }

  /**
   * Remove a thread
   */
  remove(tID) {
    if (!this.threads.has(tID)) return 0;
    const thread = this.threads.get(tID);
    thread.deconstruct();
    this.threads.delete(tID);
    return 1;
  }

  /**
   * Get a thread by ID
   */
  get(tID) {
    return this.threads.get(tID) || VOID;
  }

  /**
   * Check if a thread exists
   */
  exists(tID) {
    return this.threads.has(tID);
  }

  // ── Batch Operations ─────────────────────────────────────────────────

  /**
   * Initialize all threads
   */
  initAll() {
    for (const [id, thread] of this.threads) {
      if (!thread.isInitialized) {
        thread.isInitialized = true;
      }
    }
    return 1;
  }

  /**
   * Close all threads
   */
  closeAll() {
    for (const [id, thread] of this.threads) {
      thread.deconstruct();
    }
    this.threads.clear();
    return 1;
  }

  /**
   * Initialize a thread from a cast member reference
   */
  initThread(tCastNumOrMemName) {
    // In Lingo, this reads the thread.index field from a cast member
    // In JS, we use the pre-registered index data
    console.log(`[ThreadManager] initThread: ${String(tCastNumOrMemName)}`);
    return 1;
  }

  /**
   * Close a thread
   */
  closeThread(tCastNumOrID) {
    // In Lingo, this closes the thread associated with a cast member
    // In JS, we close by thread ID
    for (const [id, thread] of this.threads) {
      if (id === tCastNumOrID) {
        return this.remove(id);
      }
    }
    return 0;
  }

  // ── Debug ────────────────────────────────────────────────────────────

  print() {
    console.log('--- Threads ---');
    for (const [id, thread] of this.threads) {
      console.log(`  ${String(id)} [initialized=${thread.isInitialized}]`);
    }
    return 1;
  }
}

// Register the class
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Thread Manager Class', ThreadManager);
