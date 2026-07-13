export default class {
  pScore;
  pBoardImg;

  prepare(tdata) {
    this.pScore = 0;
    const tTemp = tdata.getaProp(Symbol.for("stuffdata"));
    this.setScore(tTemp, this.pSprList);
    return 1;
  }

  relocate(tSpriteList) {
    this.setScore(this.pScore, tSpriteList);
  }

  updateStuffdata(tValue) {
    this.setScore(tValue, this.pSprList);
  }

  setScore(tScore, tSpriteList) {
    if (tSpriteList.count < 4) {
      return 0;
    }
    let tClass;
    let tLoc3;
    let tLoc4;
    if (this.pXFactor == 32) {
      tClass = "s_hockey_score";
      if (this.pDirection[1] == 2) {
        tLoc3 = tSpriteList[1].loc + list(26, -100);
        tLoc4 = tSpriteList[1].loc + list(32, -103);
      } else {
        tLoc3 = tSpriteList[1].loc + list(-44, -105);
        tLoc4 = tSpriteList[1].loc + list(-38, -102);
      }
    } else {
      tClass = "hockey_score";
      if (this.pDirection[1] == 2) {
        tLoc3 = tSpriteList[1].loc + list(26, -100);
        tLoc4 = tSpriteList[1].loc + list(36, -105);
      } else {
        tLoc3 = tSpriteList[1].loc + list(-44, -105);
        tLoc4 = tSpriteList[1].loc + list(-34, -100);
      }
    }
    if (tScore == "x") {
      this.pScore = "x";
      tSpriteList[3].blend = 0;
      tSpriteList[4].blend = 0;
      return 1;
    }
    this.pScore = integer(tScore);
    if (this.pScore.ilk != Symbol.for("integer")) {
      this.pScore = 0;
    }
    if (this.pScore < 0) {
      this.pScore = 99;
    }
    if (this.pScore > 99) {
      this.pScore = 0;
    }
    let tString = string(this.pScore);
    if (length(tString) == 1) {
      tString = `0${tString}`;
    }
    tSpriteList[3].member = member(getmemnum(`${tClass}_${this.pDirection[1]}_${tString.char[1]}`));
    tSpriteList[4].member = member(getmemnum(`${tClass}_${this.pDirection[1]}_${tString.char[2]}`));
    tSpriteList[3].loc = tLoc3;
    tSpriteList[4].loc = tLoc4;
    tSpriteList[3].width = tSpriteList[3].member.width;
    tSpriteList[3].height = tSpriteList[3].member.height;
    tSpriteList[4].width = tSpriteList[4].member.width;
    tSpriteList[4].height = tSpriteList[4].member.height;
    tSpriteList[3].blend = 100;
    tSpriteList[4].blend = 100;
    return 1;
  }

  select() {
    if (this.pSprList.count < 1) {
      return 0;
    }
    let tUpdate = 0;
    let tScore = this.pScore;
    const tloc = point(the.mouseH - this.pSprList[1].left, the.mouseV - this.pSprList[1].top);
    let tRect1;
    let tRect2;
    if (this.pXFactor == 32) {
      tRect1 = rect(0, 53, 12, 66);
      tRect2 = rect(13, 53, 23, 66);
    } else {
      tRect1 = rect(14, 108, 22, 116);
      tRect2 = rect(26, 108, 34, 116);
    }
    if (this.pScore != "x") {
      if (inside(tloc, tRect1)) {
        tUpdate = 1;
        tScore = tScore - 1;
        if (tScore < 0) {
          tScore = 99;
        }
      } else {
        if (inside(tloc, tRect2)) {
          tUpdate = 1;
          tScore = tScore + 1;
          if (tScore > 99) {
            tScore = 0;
          }
        }
      }
    }
    if ((tUpdate == 0) && the.doubleClick) {
      tUpdate = 1;
      if (this.pScore == "x") {
        tScore = 0;
      } else {
        tScore = "x";
      }
    }
    if (tUpdate) {
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", string(tScore)));
    }
    return 1;
  }
}
