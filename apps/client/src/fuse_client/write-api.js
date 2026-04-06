// fuse_client/21_Write API.ls → write-api.js
// Writer manager API facade

import {
  symbol,
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructWriterManager() {
  return createManager(symbol('#writer_manager'), getClassVariable('writer.manager.class'))
}

function deconstructWriterManager() {
  return removeManager(symbol('#writer_manager'))
}

export function getWriterManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#writer_manager'))) {
    return constructWriterManager()
  }
  return tMgr.getManager(symbol('#writer_manager'))
}

export function createWriter(tID, tMetrics) {
  return getWriterManager().create(tID, tMetrics)
}

export function removeWriter(tID) {
  return getWriterManager().Remove(tID)
}

export function getWriter(tID, tDefault) {
  return getWriterManager().GET(tID, tDefault)
}

export function writerExists(tID) {
  return getWriterManager().exists(tID)
}

export function printWriters() {
  return getWriterManager().print()
}
