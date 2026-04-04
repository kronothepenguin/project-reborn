/**
 * Connection API
 * 
 * Translated from: casts/fuse_client/12_Connection API.ls
 * 
 * Global functions for network connection management.
 * Connections use RC4 encoding for server communication.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { createManager, removeManager, getManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

/**
 * Construct the connection manager
 */
export function constructConnectionManager() {
  return createManager('connection_manager', getManagerClassList('connection'));
}

/**
 * Deconstruct the connection manager
 */
export function deconstructConnectionManager() {
  return removeManager('connection_manager');
}

/**
 * Get the connection manager (lazy-init)
 */
export function getConnectionManager() {
  const tMgr = getManager('connection_manager');
  if (voidp(tMgr)) {
    return constructConnectionManager();
  }
  return tMgr;
}

/**
 * Create a connection
 */
export function createConnection(tID, tHost, tPort) {
  return getConnectionManager().create(tID, tHost, tPort);
}

/**
 * Remove a connection
 */
export function removeConnection(tID) {
  return getConnectionManager().remove(tID);
}

/**
 * Get a connection by ID
 */
export function getConnection(tID) {
  return getConnectionManager().get(tID);
}

/**
 * Check if a connection exists
 */
export function connectionExists(tID) {
  return getConnectionManager().exists(tID);
}

/**
 * Print connections (debug)
 */
export function printConnections() {
  return getConnectionManager().print();
}

/**
 * Register a listener for server messages
 */
export function registerListener(tID, tObjID, tMsgList) {
  return getConnectionManager().registerListener(tID, tObjID, tMsgList);
}

/**
 * Unregister a listener
 */
export function unregisterListener(tID, tObjID, tMsgList) {
  return getConnectionManager().unregisterListener(tID, tObjID, tMsgList);
}

/**
 * Register command handlers for a connection
 */
export function registerCommands(tID, tObjID, tCmdList) {
  return getConnectionManager().registerCommands(tID, tObjID, tCmdList);
}

/**
 * Unregister command handlers
 */
export function unregisterCommands(tID, tObjID, tCmdList) {
  return getConnectionManager().unregisterCommands(tID, tObjID, tCmdList);
}
