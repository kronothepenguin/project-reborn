export default class {
  prepare(tdata) {
    if (tdata.count == 0) {
      tdata = propList("extra", "1");
    }
    this.updateStuffdata(tdata[Symbol.for("extra")]);
    return 1;
  }

  updateStuffdata(tValue) {
    if (this.pSprList.count < 2) {
      return 0;
    }
    const tMemName = this.pSprList[2].member.name;
    this.pSprList[2].member = member(getmemnum(`${tMemName.char[`1..${length(tMemName) - 1}`]}${tValue}`));
    this.pSprList[2].width = this.pSprList[2].member.width;
    this.pSprList[2].height = this.pSprList[2].member.height;
  }

  select() {
    if (the.doubleClick) {
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "5"));
    }
    return 1;
  }
}
