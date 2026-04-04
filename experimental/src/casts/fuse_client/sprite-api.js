/**
 * Sprite API
 * Translated from: 13_Sprite API.ls
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { getManager, createManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructSpriteManager() {
  return createManager('sprite_manager', getManagerClassList('sprite'));
}

export function deconstructSpriteManager() {
  return removeManager('sprite_manager');
}

export function getSpriteManager() {
  if (!managerExists('sprite_manager')) return constructSpriteManager();
  return getManager('sprite_manager');
}

export function reserveSprite(tClientID) {
  return getSpriteManager().reserveSprite(tClientID);
}

export function releaseSprite(tSprNum) {
  return getSpriteManager().releaseSprite(tSprNum);
}

export function setEventBroker(tSprNum, tID) {
  return getSpriteManager().setEventBroker(tSprNum, tID);
}

export function removeEventBroker(tSprNum) {
  return getSpriteManager().removeEventBroker(tSprNum);
}

export function printSprites(tCount) {
  return getSpriteManager().print(tCount);
}
