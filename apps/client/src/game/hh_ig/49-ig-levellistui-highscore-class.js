export default class {
  addWindows() {
    this.pWindowID = "cr";
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    const tSetID = `${this.pWindowSetId}_c`;
    tWrapObjRef.initSet(tSetID, 3);
    tWrapObjRef.addOneWindow(this.getWindowId(), "ig_level_highscores.window", tSetID);
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
    const tLevelData = tItemRef.getLevelHighscore();
    if (tLevelData == 0) {
      return 0;
    }
    const tTeamData = tItemRef.getLevelTeamHighscore();
    if (tTeamData == 0) {
      return 0;
    }
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    for (let i = 1; i <= tLevelData.count; i++) {
      const tItem = tLevelData[i];
      let tElement = tWndObj.getElement(`ig_highscore_player${i}`);
      if (tElement != 0) {
        tElement.setText(tItem.getaProp(Symbol.for("name")));
      }
      tElement = tWndObj.getElement(`ig_highscore_score${i}`);
      if (tElement != 0) {
        tElement.setText(tItem.getaProp(Symbol.for("score")));
      }
    }
    for (let i = 1; i <= tTeamData.count; i++) {
      const tItem = tTeamData[i];
      let tText = EMPTY;
      const tPlayers = tItem.getaProp(Symbol.for("players"));
      for (const tName of tPlayers) {
        tText = tText + tName + RETURN;
      }
      let tElement = tWndObj.getElement(`ig_teamhigh_team_${i}`);
      if (tElement != 0) {
        tElement.setText(tText);
      }
      tElement = tWndObj.getElement(`ig_teamhigh_score_${i}`);
      if (tElement != 0) {
        tElement.setText(tItem.getaProp(Symbol.for("score")));
      }
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
        return 1;
      case Symbol.for("game_type"):
        return this.renderType(tValue);
    }
    return this.ancestor.renderProperty(tKey, tValue);
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
    const tMemNum = getmemnum(`ig_icon_gamemode_${tValue}_b`);
    if (tMemNum > 0) {
      tElem.feedImage(member(tMemNum).image);
    }
    return 1;
  }
}
