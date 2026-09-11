export default class {
  pChanges;
  pActive;

  prepare(tdata) {
    if (tdata[Symbol.for("stuffdata")] == "ON") {
      this.setOn();
      this.pChanges = 1;
    } else {
      this.setOff();
      this.pChanges = 0;
    }
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "ON") {
      this.setOn();
    } else {
      this.setOff();
    }
    this.pChanges = 1;
  }

  update() {
    if (!this.pChanges) {
      return;
    }
    if (this.pSprList.count < 2) {
      return;
    }
    const tCurName = this.pSprList[2].member.name;
    const tNewName = `${tCurName.char[`1..${length(tCurName) - 1}`]}${this.pActive}`;
    const tMemNum = getmemnum(tNewName);
    if (this.pActive) {
      const tDelim = the.itemDelimiter;
      the.itemDelimiter = "_";
      const tItemCount = tNewName.item.count;
      if ((tNewName.item[tItemCount - 1] == "0") || (tNewName.item[tItemCount - 1] == "6")) {
        this.pSprList[2].locZ = this.pSprList[1].locZ + 502;
      } else {
        if ((tNewName.item[tItemCount - 1] != "0") && (tNewName.item[tItemCount - 1] != "6")) {
          this.pSprList[2].locZ = this.pSprList[1].locZ + 2;
        }
      }
      the.itemDelimiter = tDelim;
    } else {
      this.pSprList[2].locZ = this.pSprList[1].locZ + 1;
    }
    if (tMemNum > 0) {
      const tmember = member(tMemNum);
      this.pSprList[2].castNum = tMemNum;
      this.pSprList[2].width = tmember.width;
      this.pSprList[2].height = tmember.height;
    }
    this.pChanges = 0;
  }

  setOn() {
    this.pActive = 1;
    if (this.pLoczList.count < 2) {
      return 0;
    }
    this.pLoczList[2] = list(200, 200, 0, 0, 0, 0, 200, 200);
  }

  setOff() {
    this.pActive = 0;
    if (this.pLoczList.count < 2) {
      return 0;
    }
    this.pLoczList[2] = list(0, 0, 0, 0, 0, 0, 0, 0);
  }

  select() {
    if (the.doubleClick) {
      let tStr;
      if (this.pActive) {
        tStr = "OFF";
      } else {
        tStr = "ON";
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", tStr));
    } else {
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX, "short", this.pLocY));
    }
    return 1;
  }
}
