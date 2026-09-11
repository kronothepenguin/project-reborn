export default class {
  addWindows() {
    this.pWindowID = "cr";
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    const tSetID = `${this.pWindowSetId}_c`;
    tWrapObjRef.initSet(tSetID, 3);
    tWrapObjRef.addOneWindow(this.getWindowId(), "ig_choose_teams_ss.window", tSetID);
    tWrapObjRef.addOneWindow(this.getWindowId("spec"), VOID, tSetID);
    if (getObject(Symbol.for("session")).GET("lastroom") != "Entry") {
      tWrapObjRef.addOneWindow(this.getWindowId("invite"), "ig_choose_availability.window", tSetID);
    } else {
      tWrapObjRef.addOneWindow(this.getWindowId("horo"), "ig_tms_btm_drk.window", tSetID);
    }
    tWrapObjRef.addOneWindow(this.getWindowId("hor"), "ig_divider_hor.window", tSetID, propList(Symbol.for("scaleV"), 1));
    tWrapObjRef.addOneWindow(this.getWindowId("btn_j"), "ig_frame_create_btm.window", tSetID);
    return 1;
  }

  render() {
    const tService = this.getIGComponent("LevelList");
    if (tService == 0) {
      return 0;
    }
    const tItemRef = tService.getSelectedLevel();
    if (tItemRef == 0) {
      return 0;
    }
    const tPropList = tItemRef.dump();
    for (let i = 1; i <= tPropList.count; i++) {
      const tKey = tPropList.getPropAt(i);
      const tValue = tPropList[i];
      this.renderProperty(tKey, tValue);
    }
    return 1;
  }

  renderProperty(tKey, tValue) {
    switch (tKey) {
      case Symbol.for("game_type_icon"):
        return this.renderType(tValue);
      case Symbol.for("level_name"):
        return this.renderName(tValue);
      case Symbol.for("number_of_teams"):
        return this.renderNumberOfTeams(tValue);
      case Symbol.for("private"):
        return this.renderPrivateFlag(tValue);
    }
    return 0;
  }

  renderType(tValue) {
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("info_gamemode");
    if (tElem == 0) {
      return 0;
    }
    if (ilk(tValue) == Symbol.for("image")) {
      tElem.feedImage(tValue);
    }
    return 1;
  }

  renderName(tValue) {
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_level_name");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(tValue);
    return 1;
  }

  renderNumberOfTeams(tValue) {
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    for (let i = 1; i <= 4; i++) {
      const tElement = tWndObj.getElement(`ig_icon_team_amount_${i}`);
      if (tElement != 0) {
        let tMemNum;
        if (i == tValue) {
          tMemNum = getmemnum(`ig_ui_icon_tms_${i}_0`);
        } else {
          tMemNum = getmemnum(`ig_ui_icon_tms_${i}_1`);
        }
        if (tMemNum != 0) {
          tElement.setProperty(Symbol.for("image"), member(tMemNum).image);
        }
      }
    }
    return 1;
  }

  renderPrivateFlag(tValue) {
    const tWndObj = getWindow(this.getWindowId("invite"));
    if (tWndObj == 0) {
      return 0;
    }
    let tElem = tWndObj.getElement("ig_game_availability_0");
    if (tElem != 0) {
      tElem.setProperty(Symbol.for("blend"), 0 + (!tValue * 100));
    }
    tElem = tWndObj.getElement("ig_game_availability_1");
    if (tElem != 0) {
      tElem.setProperty(Symbol.for("blend"), 0 + (tValue * 100));
    }
    return 1;
  }
}
