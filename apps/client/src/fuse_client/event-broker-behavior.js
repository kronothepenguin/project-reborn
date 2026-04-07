// fuse_client/3_Event Broker Behavior.ls → event-broker-behavior.js
// Sprite behavior that acts as an event broker/router for mouse/keyboard events

import {
  voidP,
  stringp,
  symbolp,
  listp,
  symbol,
  sprite,
  getmemnum,
  error,
  getSpecialServices,
  createPropList,
} from "../core/lingo-runtime.js";
import { getObject } from "./object-api.js";

export class EventBrokerBehavior {
  constructor() {
    this.id = null;
    this.pSprite = null;
    this.pLink = null;
    this.pProcList = null;
    this.spriteNum = 0;
  }

  registerProcedure(tMethod, tClientID, tEvent) {
    if (voidP(this.pProcList)) {
      this.pProcList = this.createProcListTemplate();
    }
    if (voidP(tEvent) && voidP(tMethod)) {
      for (let i = 1; i <= this.pProcList.count; i++) {
        this.pProcList._map.set(this.pProcList.getPropAt(i), [
          this.pProcList.getPropAt(i),
          tClientID,
        ]);
      }
    } else {
      if (voidP(tEvent)) {
        for (let i = 1; i <= this.pProcList.count; i++) {
          this.pProcList._map.set(this.pProcList.getPropAt(i), [
            tMethod,
            tClientID,
          ]);
        }
      } else {
        if (voidP(tMethod)) {
          tMethod = tEvent;
        }
        this.pProcList[tEvent] = [tMethod, tClientID];
      }
    }
    return true;
  }

  removeProcedure(tEvent) {
    if (voidP(tEvent)) {
      this.pProcList = this.createProcListTemplate();
    } else {
      if (this.pProcList.getaProp(tEvent) !== null) {
        this.pProcList[tEvent] = [symbol("#null"), 0];
      }
    }
    return true;
  }

  getID() {
    return this.id;
  }

  setID(tID) {
    this.pSprite = sprite(this.spriteNum);
    if (!stringp(tID)) {
      return error(this, "String expected: " + tID, "setID", "major");
    }
    this.id = tID;
    return true;
  }

  getMember() {
    return this.pSprite.member;
  }

  setMember(tmember) {
    this.pSprite.member = tmember;
    this.pSprite.width = this.pSprite.member.width;
    this.pSprite.height = this.pSprite.member.height;
    return true;
  }

  getCursor() {
    return this.pSprite.cursor;
  }

  setcursor(ttype) {
    if (symbolp(ttype)) {
      switch (ttype) {
        case symbol("#arrow"):
          ttype = -1;
          break;
        case symbol("#ibeam"):
          ttype = 1;
          break;
        case symbol("#crosshair"):
          ttype = 2;
          break;
        case symbol("#crossbar"):
          ttype = 3;
          break;
        case symbol("#timer"):
          ttype = 4;
          break;
      }
    } else {
      if (stringp(ttype)) {
        ttype = [getmemnum(ttype), getmemnum(ttype + ".mask")];
      } else {
        if (listp(ttype)) {
          ttype = [getmemnum(ttype[0]), getmemnum(ttype[1])];
        } else {
          if (voidP(ttype)) {
            ttype = 0;
          }
        }
      }
    }
    this.pSprite.cursor = ttype;
    return true;
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
      return true;
    } else {
      return false;
    }
  }

  mouseEnter() {
    return this.redirectEvent(symbol("#mouseEnter"));
  }

  mouseLeave() {
    return this.redirectEvent(symbol("#mouseLeave"));
  }

  mouseWithin() {
    return this.redirectEvent(symbol("#mouseWithin"));
  }

  mouseDown() {
    if (!voidP(this.pProcList)) {
      getObject(symbol("#session")).set(
        "client_lastclick",
        this.id +
          "->" +
          this.pProcList[symbol("#mouseDown")][1] +
          "/" +
          "the long time",
      );
    }
    let tResult = this.redirectEvent(symbol("#mouseDown"));
    if (tResult) {
      // stopEvent() - placeholder
    }
    return tResult;
  }

  mouseUp() {
    if (!voidP(this.pLink)) {
      getSpecialServices().openNetPage(this.pLink);
    }
    let tResult = this.redirectEvent(symbol("#mouseUp"));
    if (tResult) {
      // stopEvent() - placeholder
    }
    return tResult;
  }

  mouseUpOutSide() {
    return this.redirectEvent(symbol("#mouseUpOutSide"));
  }

  keyDown() {
    if (this.pSprite.spriteNum !== 0 /* the keyboardFocusSprite */) {
      return false;
    }
    if (this.redirectEvent(symbol("#keyDown"))) {
      return true;
    }
    // pass() - placeholder
  }

  keyUp() {
    if (this.pSprite.spriteNum !== 0 /* the keyboardFocusSprite */) {
      return false;
    }
    if (this.redirectEvent(symbol("#keyUp"))) {
      return true;
    }
    // pass() - placeholder
  }

  redirectEvent(tEvent) {
    if (voidP(this.pProcList)) {
      this.pProcList = this.createProcListTemplate();
    }
    if (!this.pProcList[tEvent][1]) {
      return false;
    }
    if (!objectExists(this.pProcList[tEvent][1])) {
      return false;
    }
    // call(method, object, ...args) - placeholder
    return true;
  }

  createProcListTemplate() {
    let tList = createPropList();
    tList.setaProp(symbol("#mouseEnter"), [symbol("#null"), 0]);
    tList.setaProp(symbol("#mouseLeave"), [symbol("#null"), 0]);
    tList.setaProp(symbol("#mouseWithin"), [symbol("#null"), 0]);
    tList.setaProp(symbol("#mouseDown"), [symbol("#null"), 0]);
    tList.setaProp(symbol("#mouseUp"), [symbol("#null"), 0]);
    tList.setaProp(symbol("#mouseUpOutSide"), [symbol("#null"), 0]);
    tList.setaProp(symbol("#keyDown"), [symbol("#null"), 0]);
    tList.setaProp(symbol("#keyUp"), [symbol("#null"), 0]);
    return tList;
  }
}
