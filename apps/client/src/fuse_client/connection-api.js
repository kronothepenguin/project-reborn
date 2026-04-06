// fuse_client/12_Connection API.ls → connection-api.js
// Connection manager API facade

import {
  symbol,
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructConnectionManager() {
  return createManager(symbol('#connection_manager'), getClassVariable('connection.manager.class'))
}

export function deconstructConnectionManager() {
  return removeManager(symbol('#connection_manager'))
}

export function getConnectionManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#connection_manager'))) {
    return constructConnectionManager()
  }
  return tMgr.getManager(symbol('#connection_manager'))
}

export function createConnection(tID, tHost, tPort) {
  return getConnectionManager().create(tID, tHost, tPort)
}

export function removeConnection(tID) {
  return getConnectionManager().Remove(tID)
}

export function getConnection(tID) {
  return getConnectionManager().GET(tID)
}

export function connectionExists(tID) {
  return getConnectionManager().exists(tID)
}

export function printConnections() {
  return getConnectionManager().print()
}

export function registerListener(tID, tObjID, tMsgList) {
  return getConnectionManager().registerListener(tID, tObjID, tMsgList)
}

export function unregisterListener(tID, tObjID, tMsgList) {
  return getConnectionManager().unregisterListener(tID, tObjID, tMsgList)
}

export function registerCommands(tID, tObjID, tCmdList) {
  return getConnectionManager().registerCommands(tID, tObjID, tCmdList)
}

export function unregisterCommands(tID, tObjID, tCmdList) {
  return getConnectionManager().unregisterCommands(tID, tObjID, tCmdList)
}

