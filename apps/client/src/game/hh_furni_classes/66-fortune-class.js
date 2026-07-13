export default class {
  pShowSymbol;
  pTargetBlend;

  define(tProps) {
    this.pShowSymbol = 0;
    this.pBlend = 100;
    const tReturnValue = callAncestor(Symbol.for("define"), [this], tProps);
    this.pTargetBlend = this.pBlendList[6];
    return tReturnValue;
  }

  select() {
    if (!(the.doubleClick)) {
      return 0;
    }
    const tUserObj = getThread(Symbol.for("room")).getComponent().getOwnUser();
    if (!tUserObj) {
      return 1;
    }
    if ((abs(tUserObj.pLocX - this.pLocX) > 1) || (abs(tUserObj.pLocY - this.pLocY) > 1)) {
      for (let tX = this.pLocX - 1; tX <= this.pLocX + 1; tX++) {
        for (let tY = this.pLocY - 1; tY <= this.pLocY + 1; tY++) {
          if (getThread(Symbol.for("room")).getInterface().getGeometry().emptyTile(tX, tY)) {
            getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", tX, "short", tY));
            return 1;
          }
        }
      }
    } else {
      const tConn = getThread(Symbol.for("room")).getComponent().getRoomConnection();
      tConn.send("SET_RANDOM_STATE", propList("integer", integer(this.getID())));
    }
    return 1;
  }

  update() {
    if (this.pShowSymbol) {
      const tsprite = this.pSprList[6];
      let tBlend = tsprite.blend;
      if (tBlend < this.pTargetBlend) {
        tBlend = tBlend + 1;
        if (tBlend > this.pTargetBlend) {
          tBlend = this.pTargetBlend;
        }
        tsprite.blend = tBlend;
      }
    }
    return callAncestor(Symbol.for("update"), [this]);
  }

  setState(tNewState) {
    tNewState = value(tNewState);
    let tsprite;
    if (tNewState.ilk != Symbol.for("integer")) {
      tNewState = 2;
      this.pShowSymbol = 0;
    } else {
      tNewState = tNewState + 2;
      tsprite = this.pSprList[6];
      tsprite.blend = 0;
      this.pShowSymbol = 1;
    }
    callAncestor(Symbol.for("setState"), [this], tNewState);
  }
}
