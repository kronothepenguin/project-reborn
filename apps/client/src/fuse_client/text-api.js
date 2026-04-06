// fuse_client/15_Text API.ls → text-api.js
// Text manager API facade for localized strings

import {
  symbol,
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructTextManager() {
  return createManager(symbol('#text_manager'), getClassVariable('text.manager.class'))
}

function deconstructTextManager() {
  return removeManager(symbol('#text_manager'))
}

export function getTextManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#text_manager'))) {
    return constructTextManager()
  }
  return tMgr.getManager(symbol('#text_manager'))
}

export function createText(tID, tValue) {
  return getTextManager().create(tID, tValue)
}

export function removeText(tID) {
  return getTextManager().Remove(tID)
}

export function setText(tID, tValue) {
  return getTextManager().create(tID, tValue)
}

export function getText(tID, tDefault) {
  return getTextManager().GET(tID, tDefault)
}

export function textExists(tID) {
  return getTextManager().exists(tID)
}

export function printTexts() {
  return getTextManager().print()
}

export function dumpTextField(tField, tDelimiter) {
  return getTextManager().dump(tField, tDelimiter)
}

