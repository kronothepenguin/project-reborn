export default class {
  pToggleParts;
  pState;

  prepare(tdata) {
    this.pToggleParts = propList("0", list(propList("sprite", "c", "member", VOID), propList("sprite", "d", "member", VOID)), "1", list(propList("sprite", "c", "member", "0"), propList("sprite", "d", "member", "0")));
    this.setState(tdata[Symbol.for("stuffdata")]);
    return 1;
  }

  updateStuffdata(tValue) {
    this.setState(tValue);
  }

  setState(tValue) {
    if (!listp(this.pToggleParts)) {
      return 0;
    }
    if (tValue == VOID) {
      tValue = this.pToggleParts.getPropAt(1);
    }
    let tPartStates = this.pToggleParts[tValue];
    if (!listp(tPartStates)) {
      tPartStates = this.pToggleParts[1];
      tValue = this.pToggleParts.getPropAt(1);
    }
    this.pState = tValue;
    for (const tPart of tPartStates) {
      const tPartId = tPart[Symbol.for("sprite")];
      const tmember = tPart[Symbol.for("member")];
      if (tmember != VOID) {
        this.switchMember(tPartId, tmember);
      }
      this.setPartVisible(tPartId, tmember != VOID);
    }
    return 1;
  }

  select() {
    if (the.doubleClick) {
      switch (this.pState) {
        case "1":
          this.pState = "0";
          break;
        default:
          this.pState = "1";
          break;
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", this.pState));
    }
    return 1;
  }

  switchMember(tPart, tNewMem) {
    const tSprNum = charToNum(tPart) - (charToNum("a") - 1);
    if ((this.pSprList.count < tSprNum) || (tSprNum <= 0)) {
      return 0;
    }
    let tName = this.pSprList[tSprNum].member.name;
    tName = `${tName.char[`1..${tName.length - 1}`]}${tNewMem}`;
    if (memberExists(tName)) {
      const tmember = member(getmemnum(tName));
      this.pSprList[tSprNum].castNum = tmember.number;
      this.pSprList[tSprNum].width = tmember.width;
      this.pSprList[tSprNum].height = tmember.height;
    }
    return 1;
  }

  setPartVisible(tPart, tstate) {
    const tSprNum = charToNum(tPart) - (charToNum("a") - 1);
    if ((this.pSprList.count < tSprNum) || (tSprNum <= 0)) {
      return 0;
    }
    this.pSprList[tSprNum].visible = tstate;
    return 1;
  }
}
