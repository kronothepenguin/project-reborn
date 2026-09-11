export default class {
  id;
  pSprite;
  pLink;
  pProcList;

  registerProcedure(tMethod, tClientID, tEvent) {
    if (voidp(this.pProcList)) {
      this.pProcList = this.createProcListTemplate();
    }
    if (voidp(tEvent) && voidp(tMethod)) {
      for (let i = 1; i <= this.pProcList.count; i++) {
        this.pProcList[i] = [this.pProcList.getPropAt(i), tClientID];
      }
    } else {
      if (voidp(tEvent)) {
        for (let i = 1; i <= this.pProcList.count; i++) {
          this.pProcList[i] = [tMethod, tClientID];
        }
      } else {
        if (voidp(tMethod)) {
          tMethod = tEvent;
        }
        this.pProcList[tEvent] = [tMethod, tClientID];
      }
    }
    return 1;
  }

  removeProcedure(tEvent) {
    if (voidp(tEvent)) {
      this.pProcList = this.createProcListTemplate();
    } else {
      if (this.pProcList.getaProp(tEvent) != VOID) {
        this.pProcList[tEvent] = [Symbol.for("null"), 0];
      }
    }
    return 1;
  }

  getID() {
    return this.id;
  }

  setID(tID) {
    this.pSprite = sprite(this.spriteNum);
    if (!stringp(tID)) {
      return error(this, `String expected: ${tID}`, Symbol.for("setID"), Symbol.for("major"));
    }
    this.id = tID;
    return 1;
  }

  getMember() {
    return this.pSprite.member;
  }

  setMember(tmember) {
    this.pSprite.member = tmember;
    this.pSprite.width = this.pSprite.member.width;
    this.pSprite.height = this.pSprite.member.height;
    return 1;
  }

  getCursor() {
    return this.pSprite.cursor;
  }

  setcursor(ttype) {
    if (symbolp(ttype)) {
      switch (ttype) {
        case Symbol.for("arrow"):
          ttype = -1;
          break;
        case Symbol.for("ibeam"):
          ttype = 1;
          break;
        case Symbol.for("crosshair"):
          ttype = 2;
          break;
        case Symbol.for("crossbar"):
          ttype = 3;
          break;
        case Symbol.for("timer"):
          ttype = 4;
          break;
      }
    } else {
      if (stringp(ttype)) {
        ttype = [getmemnum(ttype), getmemnum(`${ttype}.mask`)];
      } else {
        if (listp(ttype)) {
          ttype = [getmemnum(ttype[1]), getmemnum(ttype[2])];
        } else {
          if (voidp(ttype)) {
            ttype = 0;
          }
        }
      }
    }
    this.pSprite.cursor = ttype;
    return 1;
  }

  getLink() {
    if (stringp(this.pLink)) {
      return this.pLink;
    } else {
      return 0;
    }
  }

  setLink(tUrlOrKey) {
    if (stringp(tUrlOrKey)) {
      this.pLink = tUrlOrKey;
      return 1;
    } else {
      return 0;
    }
  }

  mouseEnter() {
    return this.redirectEvent(Symbol.for("mouseEnter"));
  }

  mouseLeave() {
    return this.redirectEvent(Symbol.for("mouseLeave"));
  }

  mouseWithin() {
    return this.redirectEvent(Symbol.for("mouseWithin"));
  }

  mouseDown() {
    if (!voidp(this.pProcList)) {
      getObject(Symbol.for("session")).set("client_lastclick", `${this.id} -> ${this.pProcList[Symbol.for("mouseDown")][2]} / ${the.longTime}`);
    }
    const tResult = this.redirectEvent(Symbol.for("mouseDown"));
    if (tResult) {
      stopEvent();
    }
    return tResult;
  }

  mouseUp() {
    if (!voidp(this.pLink)) {
      getSpecialServices().openNetPage(this.pLink);
    }
    const tResult = this.redirectEvent(Symbol.for("mouseUp"));
    if (tResult) {
      stopEvent();
    }
    return tResult;
  }

  mouseUpOutSide() {
    return this.redirectEvent(Symbol.for("mouseUpOutSide"));
  }

  keyDown() {
    if (this.pSprite.spriteNum != the.keyboardFocusSprite) {
      return 1;
    }
    if (this.redirectEvent(Symbol.for("keyDown"))) {
      return 1;
    }
    pass();
  }

  keyUp() {
    if (this.pSprite.spriteNum != the.keyboardFocusSprite) {
      return 1;
    }
    if (this.redirectEvent(Symbol.for("keyUp"))) {
      return 1;
    }
    pass();
  }

  redirectEvent(tEvent) {
    if (voidp(this.pProcList)) {
      this.pProcList = this.createProcListTemplate();
    }
    if (!this.pProcList[tEvent][2]) {
      return 0;
    }
    if (!objectExists(this.pProcList[tEvent][2])) {
      return 0;
    }
    return call(this.pProcList[tEvent][1], getObject(this.pProcList[tEvent][2]), tEvent, this.id);
  }

  createProcListTemplate() {
    const tList = propList();
    tList[Symbol.for("mouseEnter")] = [Symbol.for("null"), 0];
    tList[Symbol.for("mouseLeave")] = [Symbol.for("null"), 0];
    tList[Symbol.for("mouseWithin")] = [Symbol.for("null"), 0];
    tList[Symbol.for("mouseDown")] = [Symbol.for("null"), 0];
    tList[Symbol.for("mouseUp")] = [Symbol.for("null"), 0];
    tList[Symbol.for("mouseUpOutSide")] = [Symbol.for("null"), 0];
    tList[Symbol.for("keyDown")] = [Symbol.for("null"), 0];
    tList[Symbol.for("keyUp")] = [Symbol.for("null"), 0];
    return tList;
  }
}
