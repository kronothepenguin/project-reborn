/**
 * Connection Manager Class
 * 
 * Translated from: casts/fuse_client/33_Connection Manager Class.ls
 * 
 * Manages network connections with RC4 encoding.
 * Each connection has its own encoder/decoder instance and listener registry.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ConnectionInstance } from './connection-instance-class.js';
import { ObjectManager } from './object-manager-class.js';
import { error } from './error-api.js';

export class ConnectionManager extends ObjectBase {
  constructor() {
    super();

    /** @type {Map<string, ConnectionInstance>} Connection registry */
    this.connections = new Map();
  }

  construct() {
    this.connections = new Map();
    return 1;
  }

  deconstruct() {
    for (const [id, conn] of this.connections) {
      conn.deconstruct();
    }
    this.connections.clear();
    return 1;
  }

  // ── Connection Lifecycle ───────────────────────────────────────────

  /**
   * Create a new connection
   * 
   * Original Lingo:
   *   on create me, tID, tHost, tPort
   *     tConn = createObject(tID, ...)
   *     tConn.connectionID = tID
   *     tConn.connect(tHost, tPort)
   *     this.connections[tID] = tConn
   *     return tConn
   *   end
   */
  create(tID, tHost, tPort) {
    if (voidp(tID)) return 0;

    if (this.connections.has(tID)) {
      return this.connections.get(tID);
    }

    const conn = new ConnectionInstance();
    conn.connectionID = tID;
    conn.host = tHost;
    conn.port = tPort;

    this.connections.set(tID, conn);

    // Auto-connect
    if (tHost && tPort) {
      conn.connect(tHost, tPort);
    }

    return conn;
  }

  /**
   * Remove a connection
   */
  remove(tID) {
    if (!this.connections.has(tID)) return 0;

    const conn = this.connections.get(tID);
    conn.deconstruct();
    this.connections.delete(tID);
    return 1;
  }

  /**
   * Get a connection by ID
   */
  get(tID) {
    return this.connections.get(tID) || VOID;
  }

  /**
   * Check if a connection exists
   */
  exists(tID) {
    return this.connections.has(tID);
  }

  // ── Listener Registration ──────────────────────────────────────────

  /**
   * Register a listener for a connection
   */
  registerListener(tID, tObjID, tMsgList) {
    const conn = this.connections.get(tID);
    if (!conn) return 0;
    return conn.registerListener(tObjID, tMsgList);
  }

  /**
   * Unregister a listener
   */
  unregisterListener(tID, tObjID, tMsgList) {
    const conn = this.connections.get(tID);
    if (!conn) return 0;
    return conn.unregisterListener(tObjID, tMsgList);
  }

  /**
   * Register command handlers
   */
  registerCommands(tID, tObjID, tCmdList) {
    const conn = this.connections.get(tID);
    if (!conn) return 0;
    return conn.registerCommands(tObjID, tCmdList);
  }

  /**
   * Unregister command handlers
   */
  unregisterCommands(tID, tObjID, tCmdList) {
    const conn = this.connections.get(tID);
    if (!conn) return 0;
    return conn.unregisterCommands(tObjID, tCmdList);
  }

  // ── Debug ──────────────────────────────────────────────────────────

  print() {
    console.log('--- Connections ---');
    for (const [id, conn] of this.connections) {
      console.log(`  ${id}: ${conn.host}:${conn.port} [${conn.state}]`);
    }
    return 1;
  }
}

// Register the class
ObjectManager.registerClass('Connection Manager Class', ConnectionManager);
