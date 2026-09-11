export default class {
  pPupItemList;

  render() {
    const tService = this.getIGComponent("LevelList");
    if (tService == 0) {
      return 0;
    }
    const tItemRef = tService.getSelectedLevel();
    if (tItemRef == 0) {
      return 0;
    }
    let tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.unmerge();
    tWndObj.merge("ig_choose_teams_bb.window");
    tWndObj = getWindow(this.getWindowId("spec"));
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.unmerge();
    if (tItemRef.getProperty(Symbol.for("allow_powerups")) == 1) {
      tWndObj.merge("ig_choose_powerups.window");
      this.renderProperty(Symbol.for("bb_pups"), tItemRef.getProperty(Symbol.for("bb_pups")));
    }
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.render();
    this.ancestor.render();
    return 1;
  }

  renderProperty(tKey, tValue) {
    switch (tKey) {
      case Symbol.for("bb_pups"):
        return this.renderBBPowerups(tValue);
    }
    return this.ancestor.renderProperty(tKey, tValue);
  }

  renderBBPowerups(tPupList) {
    if (tPupList == 0) {
      return error(this, "Invalid powerup list for BB game", Symbol.for("render"));
    }
    const tWndObj = getWindow(this.getWindowId("spec"));
    if (tWndObj == 0) {
      return 0;
    }
    pPupItemList = tPupList;
    for (let i = 1; i <= 8; i++) {
      const tElement = tWndObj.getElement(`ig_icon_powerup_${i}`);
      if (tElement == 0) {
        return 0;
      }
      if (tPupList.findPos(i) == 0) {
        const tMemNum = getmemnum(`ig_bb_icon_pwrup_${i}_1`);
        if (tMemNum != 0) {
          tElement.setProperty(Symbol.for("image"), member(tMemNum).image);
        }
        continue;
      }
      const tMemNum2 = getmemnum(`ig_bb_icon_pwrup_${i}_0`);
      if (tMemNum2 != 0) {
        tElement.setProperty(Symbol.for("image"), member(tMemNum2).image);
      }
    }
    return 1;
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID, tIntParam) {
    const tService = this.getIGComponent("LevelList");
    if (tService == 0) {
      return 0;
    }
    switch (tSprID) {
      case "ig_icon_powerup":
        return tService.setProperty(Symbol.for("bb_pups"), tIntParam);
    }
    return 0;
  }

  eventProcMouseHover(tEvent, tSprID, tParam, tWndID) {
    if (!(tSprID contains "ig_icon_powerup")) {
      return 0;
    }
    const tObject = this.getMainThread().getInterface().getTooltipManager();
    if (tObject == 0) {
      return 0;
    }
    const tIndex = integer(tSprID.char[tSprID.length]);
    if (!integerp(tIndex)) {
      return 0;
    }
    return tObject.handleEvent(Symbol.for("mouseEnter"), tSprID, tWndID, `bb_powerup_desc_${tIndex}`);
  }
}
