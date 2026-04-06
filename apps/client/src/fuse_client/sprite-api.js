// fuse_client/13_Sprite API.ls → sprite-api.js
// Sprite manager API facade

import {
  symbol,
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructSpriteManager() {
  return createManager(symbol('#sprite_manager'), getClassVariable('sprite.manager.class'))
}

function deconstructSpriteManager() {
  return removeManager(symbol('#sprite_manager'))
}

export function getSpriteManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#sprite_manager'))) {
    return constructSpriteManager()
  }
  return tMgr.getManager(symbol('#sprite_manager'))
}

export function reserveSprite(tClientID) {
  return getSpriteManager().reserveSprite(tClientID)
}

export function releaseSprite(tSprNum) {
  return getSpriteManager().releaseSprite(tSprNum)
}

export function setEventBroker(tSprNum, tID) {
  return getSpriteManager().setEventBroker(tSprNum, tID)
}

export function removeEventBroker(tSprNum) {
  return getSpriteManager().removeEventBroker(tSprNum)
}

export function printSprites(tCount) {
  return getSpriteManager().print(tCount)
}

