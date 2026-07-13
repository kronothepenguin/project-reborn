export default class {
  deconstruct() {
    callAncestor(Symbol.for("deconstruct"), [this]);
    if (threadExists(Symbol.for("room"))) {
      const tRoomComponent = getThread(Symbol.for("room")).getComponent();
      tRoomComponent.removeWallMaskItem(this.getID());
    }
    return 1;
  }

  define(tProps) {
    const tReturnValue = callAncestor(Symbol.for("define"), [this], tProps);
    if (ilk(this.pSprList, Symbol.for("list"))) {
      const tDefaultLocZ = getIntVariable("visualizer.default.locz", 0);
      for (let tSpriteNum = 1; tSpriteNum <= this.pSprList.count; tSpriteNum++) {
        this.pSprList[tSpriteNum].locZ = tDefaultLocZ + tSpriteNum - 50000;
      }
    }
    if (threadExists(Symbol.for("room"))) {
      const tRoomComponent = getThread(Symbol.for("room")).getComponent();
      tRoomComponent.insertWallMaskItem(this.getID(), this.getClass(), this.pSprList[1].loc, this.pDirection, this.pXFactor);
    }
    return tReturnValue;
  }
}
