export function constructSpriteManager() {
  return createManager(Symbol.for("sprite_manager"), getClassVariable("sprite.manager.class"));
}

export function deconstructSpriteManager() {
  return removeManager(Symbol.for("sprite_manager"));
}

export function getSpriteManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("sprite_manager"))) {
    return constructSpriteManager();
  }
  return tMgr.getManager(Symbol.for("sprite_manager"));
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
