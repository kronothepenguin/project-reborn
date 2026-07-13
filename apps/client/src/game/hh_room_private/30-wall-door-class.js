export default class {
  prepare() {
    const tCount = this.pSprList.count;
    for (let i = 1; i <= tCount; i++) {
      const tOldSpr = this.pSprList[i];
      tOldSpr.ink = 41;
      const tNewSpr = sprite(reserveSprite(this.getID()));
      tNewSpr.member = tOldSpr.member;
      tNewSpr.loc = tOldSpr.loc;
      tNewSpr.locZ = tOldSpr.locZ + 1 + 75;
      tNewSpr.ink = 8;
      tNewSpr.blend = 0;
      const tBroker = tOldSpr.scriptInstanceList[1];
      tNewSpr.scriptInstanceList.add(tBroker);
      tOldSpr.scriptInstanceList.deleteAt(1);
      this.pSprList.add(tNewSpr);
    }
    return 1;
  }

  getInfo() {
    const tInfo = propList();
    tInfo[Symbol.for("name")] = "wall door";
    tInfo[Symbol.for("class")] = this.pClass;
    tInfo[Symbol.for("custom")] = this.pCustom;
    return tInfo;
  }
}
