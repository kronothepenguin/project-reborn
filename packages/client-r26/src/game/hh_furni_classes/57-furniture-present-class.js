export default class {
  pMessage;
  pCardObj;

  prepare(tdata) {
    this.pCardObj = "PackageCardObj";
    tdata = tdata[Symbol.for("stuffdata")];
    if (!voidp(tdata)) {
      if (tdata.char[1] == "!") {
        this.pMessage = tdata.char[`2..${length(tdata)}`];
      } else {
        const tDelim = the.itemDelimiter;
        the.itemDelimiter = ":";
        this.pMessage = tdata.item[`4..${tdata.item.count}`];
        the.itemDelimiter = tDelim;
      }
    }
    return 1;
  }

  select() {
    if (the.doubleClick) {
      this.showCard();
    }
    return 1;
  }

  showCard() {
    if (!objectExists(this.pCardObj)) {
      createObject(this.pCardObj, "Package Card Class");
    }
    getObject(this.pCardObj).define(propList("id", this.getID(), "Msg", this.pMessage, "loc", this.pSprList[1].loc));
    return 1;
  }
}
