export default class {
  pFlagIdPrefix;
  pFlagManagerId;

  construct() {
    this.pFlagIdPrefix = "fg";
    return this.ancestor.construct();
  }

  deconstruct() {
    const tFlagManager = this.getFlagManager();
    if (tFlagManager != 0) {
      tFlagManager.removeFlagSet(this.pID);
    }
    return this.ancestor.deconstruct();
  }

  setInfoFlag(tID, tWndID, tElemID, tFlagType, tColor, tItemInfo) {
    const tFlagManager = this.getFlagManager();
    if (tFlagManager == 0) {
      return 0;
    }
    return tFlagManager.setInfoFlag(this.pID, tID, tWndID, tElemID, tFlagType, tColor, tItemInfo);
  }

  existsFlagObject(tID) {
    const tFlagManager = this.getFlagManager();
    if (tFlagManager == 0) {
      return 0;
    }
    return tFlagManager.exists(tID);
  }

  removeFlagObject(tID) {
    const tFlagManager = this.getFlagManager();
    if (tFlagManager == 0) {
      return 0;
    }
    return tFlagManager.Remove(tID);
  }

  getFlagManager() {
    if (this.pFlagManagerId == VOID) {
      return 0;
    }
    return getObject(this.pFlagManagerId);
  }

  getBasicFlagId() {
    return `${this.getWindowId()}_${this.pFlagIdPrefix}`;
  }

  setTeamColorBackground(tWndID, tTeamIndex) {
    const tWndObj = getWindow(tWndID);
    if (tWndObj == 0) {
      return 0;
    }
    let tElem = tWndObj.getElement("ig_title_bg_dark");
    if (tElem != 0) {
      const tColor = this.getTeamColorDark(tTeamIndex);
      if (tColor.ilk == Symbol.for("color")) {
        tElem.setProperty(Symbol.for("bgColor"), tColor);
      }
    }
    tElem = tWndObj.getElement("ig_title_bg_light");
    if (tElem != 0) {
      const tColor = this.getTeamColorLight(tTeamIndex);
      if (tColor.ilk == Symbol.for("color")) {
        tElem.setProperty(Symbol.for("bgColor"), tColor);
      }
    }
    return 1;
  }

  getTeamColorDark(tTeamIndex) {
    switch (tTeamIndex) {
      case 1:
        return rgb("#c64000");
      case 2:
        return rgb("#1971c3");
      case 3:
        return rgb("#659217");
      case 4:
        return rgb("#e19f00");
    }
  }

  getTeamColorLight(tTeamIndex) {
    switch (tTeamIndex) {
      case 1:
        return rgb("#e86a3c");
      case 2:
        return rgb("#4696e1");
      case 3:
        return rgb("#91b159");
      case 4:
        return rgb("#fcc02d");
    }
  }
}
