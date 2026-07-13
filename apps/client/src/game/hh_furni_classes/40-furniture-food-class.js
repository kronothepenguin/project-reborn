export default class {
  prepare(tdata) {
    if (tdata.count == 0) {
      tdata = propList("extra", "0");
    }
    return this.updateStuffdata(tdata[Symbol.for("extra")]);
  }

  updateStuffdata(tValue) {
    let tCount = integer(tValue);
    if (!ilk(tCount, Symbol.for("integer"))) {
      tCount = 0;
    }
    for (let i = 1; i <= this.pSprList.count; i++) {
      const tMemName = this.pSprList[i].member.name;
      deleteChunk(tMemName, "-30000");
      this.pSprList[i].member = member(getmemnum(`${tMemName}${tCount}`));
      this.pSprList[i].width = this.pSprList[i].member.width;
      this.pSprList[i].height = this.pSprList[i].member.height;
    }
    return 1;
  }
}
