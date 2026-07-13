export default class {
  addWindows() {
    this.pWindowID = "jg_m";
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.addOneWindow(this.getWindowId(), "ig_jnd_minimized.window", this.pWindowSetId);
    return 1;
  }

  render() {
    const tListService = this.getIGComponent("GameList");
    if (tListService == 0) {
      return 0;
    }
    const tItemRef = tListService.getJoinedGame();
    if (tItemRef == 0) {
      return this.ChangeWindowView("GameList");
    }
    this.renderPlayerCount(tItemRef.getPlayerCount(), tItemRef.getMaxPlayerCount());
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
    if (tValue == VOID) {
      return 0;
    }
    if (tValue > 4) {
      return 0;
    }
    const tMemName = list("ig_icon_teams_1", "ig_icon_teams_2", "ig_icon_teams_3", "ig_icon_teams_4")[tValue];
    const tMemNum = getmemnum(tMemName);
    if (tMemNum == 0) {
      return 0;
    }
    const tTempImage = member(tMemNum).image;
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("info_team_amount");
    if (tElem == 0) {
      return 0;
    }
    if (ilk(tTempImage) == Symbol.for("image")) {
      tElem.feedImage(tTempImage);
    }
  }

  renderPlayerCount(tPlayerCount, tMaxPlayerCount) {
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_players_joined");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(`${tPlayerCount}/${tMaxPlayerCount}`);
    return 1;
  }
}
