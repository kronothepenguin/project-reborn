/**
 * Broker Manager Class (Message Broker)
 * 
 * Translated from: casts/fuse_client/40_Broker Manager Class.ls
 * 
 * Publish/subscribe message routing between objects.
 * Objects register as listeners for specific message types.
 */

import { VOID, voidp, stringp, symbolp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { error } from './error-api.js';
import { getObjectManager, getObject } from './object-api.js';

export class BrokerManager extends ObjectBase {
  constructor() {
    super();

    /** @type {Map<string, Map<string, string>}} Message → (ClientID → Method) */
    this.itemList = new Map();

    /** @type {string|null} Last executed message */
    this.lastExecutedMessage = null;
  }

  construct() {
    this.itemList = new Map();
    this.lastExecutedMessage = null;
    return 1;
  }

  deconstruct() {
    this.itemList.clear();
    return 1;
  }

  // ── Message Types ──────────────────────────────────────────────────

  /**
   * Create a message type (broker task)
   */
  create(tMessage) {
    const msg = this._normalizeMessage(tMessage);
    if (msg === null) return 0;

    if (!voidp(this.itemList.get(msg))) {
      error(this, `Broker task already exists: ${msg}`, 'create', 'major');
      return 0;
    }

    this.itemList.set(msg, new Map());
    return 1;
  }

  /**
   * Remove a message type
   */
  remove(tMessage) {
    const msg = this._normalizeMessage(tMessage);
    if (msg === null) return 0;

    if (voidp(this.itemList.get(msg))) {
      error(this, `Broker task not found: ${msg}`, 'remove', 'minor');
      return 0;
    }

    this.itemList.delete(msg);
    return 1;
  }

  /**
   * Register a client as listener for a message
   */
  register(tMessage, tClientID, tMethod) {
    const msg = this._normalizeMessage(tMessage);
    if (msg === null) return 0;

    if (!objectExists(tClientID)) {
      error(this, `Object not found: ${tClientID}`, 'register', 'major');
      return 0;
    }

    // Auto-create message type if needed
    if (!this.itemList.has(msg)) {
      this.itemList.set(msg, new Map());
    }

    this.itemList.get(msg).set(tClientID, tMethod);
    return 1;
  }

  /**
   * Unregister a client from a message
   */
  unregister(tMessage, tClientID) {
    const msg = this._normalizeMessage(tMessage);
    if (msg === null) return 0;

    const clientMap = this.itemList.get(msg);
    if (!clientMap) return 0;

    clientMap.delete(tClientID);

    // Remove message type if no listeners
    if (clientMap.size === 0) {
      this.itemList.delete(msg);
    }

    return 1;
  }

  /**
   * Execute a message - call all registered listeners
   * 
   * @param {string} tMessage - Message type
   * @param {*} tArgA - First argument
   * @param {*} tArgB - Second argument
   * @param {*} tArgC - Third argument
   */
  execute(tMessage, tArgA, tArgB, tArgC) {
    const msg = this._normalizeMessage(tMessage);
    if (msg === null) return 0;

    const clientMap = this.itemList.get(msg);
    if (!clientMap) return 0;

    // Iterate backwards (like Lingo's "down to 1")
    const entries = Array.from(clientMap.entries());
    for (let i = entries.length - 1; i >= 0; i--) {
      const [clientID, method] = entries[i];

      // Check if client still exists
      if (!objectExists(clientID)) {
        this.unregister(tMessage, clientID);
        continue;
      }

      if (method !== 'invalidateCrapFixer') {
        this.lastExecutedMessage = method;
      }

      const client = getObject(clientID);
      if (client && typeof client[method] === 'function') {
        try {
          client[method](tArgA, tArgB, tArgC);
        } catch (e) {
          console.error(`[BrokerManager] Message handler error (${method}):`, e);
        }
      }
    }

    return 1;
  }

  /**
   * Check if a message type exists
   */
  exists(tMessage) {
    const msg = this._normalizeMessage(tMessage);
    return msg !== null && this.itemList.has(msg);
  }

  /**
   * Get broker info for a message
   */
  get(tMessage) {
    const msg = this._normalizeMessage(tMessage);
    if (msg === null) return VOID;
    const clientMap = this.itemList.get(msg);
    if (!clientMap) return VOID;

    // Return as object
    const result = {};
    for (const [clientID, method] of clientMap) {
      result[clientID] = method;
    }
    return result;
  }

  /**
   * Get last executed message
   */
  getLastExecutedMessageId() {
    return this.lastExecutedMessage;
  }

  /**
   * Normalize message (handle symbols and strings)
   */
  _normalizeMessage(tMessage) {
    if (symbolp(tMessage)) {
      return tMessage.replace(/^#/, '');
    }
    if (stringp(tMessage)) {
      return tMessage;
    }
    error(this, `Symbol or string expected: ${tMessage}`, 'normalize', 'major');
    return null;
  }

  /**
   * Print brokers (debug)
   */
  print() {
    console.log('--- Message Brokers ---');
    for (const [msg, clientMap] of this.itemList) {
      console.log(`  ${msg}:`);
      for (const [clientID, method] of clientMap) {
        console.log(`    ${clientID} -> ${method}`);
      }
    }
    return 1;
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Broker Manager Class', BrokerManager);
