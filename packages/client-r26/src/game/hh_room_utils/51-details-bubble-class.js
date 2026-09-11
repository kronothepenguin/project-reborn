export default class {
  pWndObj;

  construct() {
    this.pWndObj = VOID;
    return 1;
  }

  deconstruct() {
    this.destroy();
    return 1;
  }

  createWithContent(aWindow, atargetRect, aPreferSide) {
    if (!stringp(aWindow)) {
      return error(this, "Invalid window content!", Symbol.for("createWithContent"), Symbol.for("minor"));
    }
    if (!ilk(atargetRect, Symbol.for("rect"))) {
      return error(this, "Invalid target rect!", Symbol.for("createWithContent"), Symbol.for("minor"));
    }
    if (voidp(aPreferSide)) {
      aPreferSide = Symbol.for("right");
    }
    if (!((aPreferSide == Symbol.for("right")) || (aPreferSide == Symbol.for("left")))) {
      error(this, "Invalid side, must be #left or #right", Symbol.for("createWithContent"), Symbol.for("minor"));
    }
    let tWindowName = getUniqueID();
    if (!createWindow(tWindowName, "details_generic.window")) {
      return error(this, "Could not create window", Symbol.for("createWithContent"), Symbol.for("minor"));
    }
    this.pWndObj = getWindow(tWindowName);
    this.pWndObj.merge(aWindow);
    this.shapeAndPosition(atargetRect, aPreferSide);
  }

  destroy() {
    if (objectp(this.pWndObj)) {
      let tWindowName = this.pWndObj.getID();
      if (windowExists(tWindowName)) {
        removeWindow(tWindowName);
      }
    }
  }

  getWindowObj() {
    return this.pWndObj;
  }

  shapeAndPosition(atargetRect, aPreferSide) {
    let tWidth = this.pWndObj.getProperty(Symbol.for("width"));
    let tHeight = this.pWndObj.getProperty(Symbol.for("height"));
    let tLockPos = this.getLockPos(atargetRect, aPreferSide);
    switch (aPreferSide) {
      case Symbol.for("left"):
        if ((tLockPos.locH - tWidth) < 0) {
          aPreferSide = Symbol.for("right");
          tLockPos = this.getLockPos(atargetRect, aPreferSide);
        }
        break;
      case Symbol.for("right"):
        if (((the.stage).image.width - tLockPos.locH) < tWidth) {
          aPreferSide = Symbol.for("left");
          tLockPos = this.getLockPos(atargetRect, aPreferSide);
        }
        break;
    }
    if (aPreferSide == Symbol.for("left")) {
      tLockPos.locH = tLockPos.locH - tWidth;
    }
    let tVerticalPos = tLockPos.locV - 12;
    if (tVerticalPos < 0) {
      tVerticalPos = 0;
    }
    if ((tVerticalPos + tHeight) > (the.stage).image.height) {
      tVerticalPos = (the.stage).image.height - tHeight;
    }
    let tArrowElement;
    switch (aPreferSide) {
      case Symbol.for("left"):
        this.pWndObj.getElement("details.info.arrow.left").hide();
        this.pWndObj.getElement("details.info.arrow.right").show();
        tArrowElement = this.pWndObj.getElement("details.info.arrow.right");
        break;
      case Symbol.for("right"):
        this.pWndObj.getElement("details.info.arrow.left").show();
        this.pWndObj.getElement("details.info.arrow.right").hide();
        tArrowElement = this.pWndObj.getElement("details.info.arrow.left");
        break;
    }
    let tArrowPos = tLockPos.locV - (tArrowElement.getProperty(Symbol.for("height")) / 2) - tVerticalPos;
    if (tArrowPos < 3) {
      tArrowPos = 3;
    }
    if (tArrowPos > (tHeight - 14)) {
      tArrowPos = tHeight - 14;
    }
    tArrowElement.setProperty(Symbol.for("locY"), tArrowPos);
    this.pWndObj.moveTo(tLockPos.locH, tVerticalPos);
  }

  getLockPos(atargetRect, aPreferSide) {
    let tLockPos;
    switch (aPreferSide) {
      case Symbol.for("left"):
        tLockPos = point(atargetRect.left, (atargetRect.top + atargetRect.bottom) / 2);
        break;
      case Symbol.for("right"):
        tLockPos = point(atargetRect.right, (atargetRect.top + atargetRect.bottom) / 2);
        break;
    }
    return tLockPos;
  }
}
