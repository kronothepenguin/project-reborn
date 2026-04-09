// Sprite API
// Translated from: 13_Sprite API.ls

export default function () {
  return {
    constructSpriteManager() {
      return _director.createManager(
        Symbol.for("sprite_manager"),
        _director.getClassVariable("sprite.manager.class"),
      );
    },

    deconstructSpriteManager() {
      return _director.removeManager(Symbol.for("sprite_manager"));
    },

    getSpriteManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("sprite_manager"))) {
        return this.constructSpriteManager();
      }
      return tMgr.getManager(Symbol.for("sprite_manager"));
    },

    reserveSprite(tClientID) {
      return this.getSpriteManager().reserveSprite(tClientID);
    },

    releaseSprite(tSprNum) {
      return this.getSpriteManager().releaseSprite(tSprNum);
    },

    setEventBroker(tSprNum, tID) {
      return this.getSpriteManager().setEventBroker(tSprNum, tID);
    },

    removeEventBroker(tSprNum) {
      return this.getSpriteManager().removeEventBroker(tSprNum);
    },

    printSprites(tCount) {
      return this.getSpriteManager().print(tCount);
    },
  };
}
