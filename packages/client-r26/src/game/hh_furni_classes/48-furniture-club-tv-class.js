export default class {
  pChanges;
  pActive;
  pLineSprite1;
  pLineSprite2;
  pLinesOrigLocV;
  pCoverSprite;
  pGlowSprite;
  pNoiseSprite;
  pActiveEffect;
  pEffectCounter;
  pRandomEffectList;
  pMovedByUser;

  prepare(tdata) {
    if (this.pSprList.count < 9) {
      return 0;
    }
    this.pRandomEffectList = list(Symbol.for("noise1"), Symbol.for("lines1"), Symbol.for("lines1"));
    removeEventBroker(this.pSprList[7].spriteNum);
    this.pLineSprite1 = this.pSprList[2];
    this.pLineSprite2 = this.pSprList[3];
    this.pGlowSprite = this.pSprList[7];
    this.pCoverSprite = this.pSprList[8];
    this.pNoiseSprite = this.pSprList[9];
    this.pMovedByUser = 0;
    this.hideAllEffects();
    if (tdata[Symbol.for("stuffdata")] == "ON") {
      this.pActive = 1;
    } else {
      this.pActive = 0;
    }
    this.pChanges = 1;
    return 1;
  }

  prepareForMove() {
    this.pLinesOrigLocV = VOID;
    this.pMovedByUser = 1;
  }

  movingFinished() {
    this.pMovedByUser = 0;
  }

  hideAllEffects() {
    this.pLineSprite1.visible = 0;
    this.pLineSprite2.visible = 0;
    if (!voidp(this.pLinesOrigLocV)) {
      this.pLineSprite1.locV = this.pLinesOrigLocV[1];
      this.pLineSprite2.locV = this.pLinesOrigLocV[2];
    }
    this.pNoiseSprite.visible = 0;
    this.pActiveEffect = Symbol.for("none");
    this.pEffectCounter = 0;
  }

  updateStuffdata(tValue) {
    if (tValue == "OFF") {
      this.pActive = 0;
    } else {
      this.pActive = 1;
    }
    this.pChanges = 1;
  }

  update() {
    if (this.pMovedByUser) {
      return 1;
    }
    if ((random(40) == 5) && (this.pActiveEffect == Symbol.for("none"))) {
      this.startRandomEffect();
    }
    if (this.pActiveEffect != Symbol.for("none")) {
      this.runEffect();
    }
    if (!this.pChanges) {
      return;
    }
    if (this.pLinesOrigLocV == VOID) {
      this.pLinesOrigLocV = list(this.pLineSprite1.locV, this.pLineSprite2.locV);
    }
    if (this.pActive) {
      this.pGlowSprite.visible = 1;
      this.pCoverSprite.visible = 0;
    } else {
      this.pGlowSprite.visible = 0;
      this.pCoverSprite.visible = 1;
      this.hideAllEffects();
    }
  }

  startRandomEffect() {
    this.pActiveEffect = this.pRandomEffectList[random(this.pRandomEffectList.count)];
    return 1;
  }

  runEffect() {
    this.pEffectCounter = this.pEffectCounter + 1;
    switch (this.pActiveEffect) {
      case Symbol.for("noise1"):
        if (random(6) == 5) {
          this.pNoiseSprite.visible = 0;
        } else {
          this.pNoiseSprite.visible = 1;
        }
        if (this.pEffectCounter > 5) {
          this.hideAllEffects();
        }
        break;
      case Symbol.for("lines1"):
        if ((this.pEffectCounter % 2) == 1) {
          return 1;
        }
        this.pLineSprite1.visible = 1;
        this.pLineSprite2.visible = 1;
        this.pLineSprite1.locV = this.pLineSprite1.locV + 1;
        this.pLineSprite2.locV = this.pLineSprite2.locV + 1;
        if (this.pEffectCounter > 90) {
          this.hideAllEffects();
        }
        break;
      case Symbol.for("lines2"):
        this.pLineSprite1.visible = 1;
        this.pLineSprite2.visible = 1;
        if (this.pEffectCounter < 45) {
          this.pLineSprite1.locV = this.pLineSprite1.locV + 1;
        } else {
          this.pLineSprite1.locV = this.pLineSprite1.locV - 1;
        }
        if (this.pEffectCounter > 90) {
          this.hideAllEffects();
        }
        break;
    }
    return 1;
  }

  setOn() {
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "ON"));
  }

  setOff() {
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "OFF"));
  }

  select(tSprID) {
    const tSprNum = the.clickOn;
    const tBottompartList = list(3, 4, 5);
    if (the.doubleClick) {
      for (let i = 1; i <= tBottompartList.count; i++) {
        if (this.pSprList[tBottompartList[i]].spriteNum == tSprNum) {
          return 0;
        }
      }
      this.setOnOff();
    }
    return 1;
  }

  setOnOff() {
    if (this.pActive) {
      this.setOff();
    } else {
      this.setOn();
    }
    return 1;
  }
}
