export default class {
  construct() {
    this.ancestor.construct();
    this.pViewModeComponents = propList(Symbol.for("Info"), list("List", "Details"), Symbol.for("highscore"), list("List", "Highscore"));
    return 1;
  }

  deconstruct() {
    return this.ancestor.deconstruct();
  }

  renderProperty(tKey, tValue) {
    if (this.pViewMode != Symbol.for("Info")) {
      return 1;
    }
    const tComponent = this.getSubComponent("Details", 0);
    if (tComponent == 0) {
      return 0;
    }
    return tComponent.renderProperty(tKey, tValue);
  }

  getGameTypeHandlerClass(tGameType) {
    const tGameTypeService = this.getIGComponent("GameTypes");
    if (tGameTypeService == 0) {
      return 0;
    }
    const tTypeStr = tGameTypeService.getGameTypeString(tGameType);
    const tMemName = `IG LevelListUI ${tTypeStr} Class`;
    let tClass;
    if (!memberExists(tMemName)) {
      tClass = "IG LevelListUI Details Class";
    } else {
      tClass = list("IG LevelListUI Details Class", tMemName);
    }
    return tClass;
  }

  getSubComponent(tID, tAddIfMissing) {
    let tObject = this.pSubComponentList.getaProp(tID);
    if (tObject != 0) {
      return tObject;
    }
    if (!tAddIfMissing) {
      return 0;
    }
    let tClass;
    if (tID != "Details") {
      tClass = list("IG LevelListUI Details Class", `IG LevelListUI ${tID} Class`);
    } else {
      const tService = this.getMasterIGComponent();
      if (tService == 0) {
        return 0;
      }
      const tItemRef = tService.getSelectedLevel();
      if (tItemRef == 0) {
        return 0;
      }
      tClass = this.getGameTypeHandlerClass(tItemRef.getProperty(Symbol.for("game_type")));
    }
    return this.initializeSubComponent(tID, tClass);
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    const tService = this.getMasterIGComponent();
    if (tService == 0) {
      return 0;
    }
    const tItemRef = tService.getSelectedLevel();
    let tMultiplier = 1;
    let tIntParam = 0;
    while (integerp(integer(tSprID.char[tSprID.length]))) {
      tIntParam = tIntParam + (tMultiplier * integer(tSprID.char[tSprID.length]));
      tSprID = tSprID.char[`1..${tSprID.length - 1}`];
      tMultiplier = tMultiplier * 10;
    }
    if (tSprID.char[tSprID.length] == "_") {
      tSprID = tSprID.char[`1..${tSprID.length - 1}`];
    }
    switch (tSprID) {
      case "ig_gamelist":
        if (ilk(tParam) != Symbol.for("point")) {
          return 0;
        }
        const tComponent = this.getSubComponent("List");
        if (tComponent == 0) {
          return 0;
        }
        const tIndex = tComponent.getItemIndexFromPoint(tParam);
        const tID = tService.getListIdByIndex(tIndex);
        if ((tService.getSelectedLevelId() != tID) && (tID > -1)) {
          return tService.selectLevel(tID, 1);
        }
        return 0;
      case "ig_icon_team_amount":
        return tService.setProperty(Symbol.for("number_of_teams"), tIntParam);
      case "ig_game_availability":
        return tService.setProperty(Symbol.for("private"), tIntParam);
      case "create_confirmation.button":
        return tService.createGame();
      case "create_cancel.button":
        return tService.selectLevel(-1, 1);
      case "ig_tab_highscores":
        return this.setViewMode(Symbol.for("highscore"));
      case "ig_level_name":
      case "ig_tab_gameinfo":
        return this.setViewMode(Symbol.for("Info"));
    }
    if (this.pViewMode != Symbol.for("Info")) {
      return 0;
    }
    const tComponent2 = this.getSubComponent("Details");
    if (tComponent2 == 0) {
      return 0;
    }
    if (tItemRef != VOID) {
      return tComponent2.eventProcMouseDown(tEvent, tSprID, tParam, tWndID, tIntParam);
    }
    return 0;
  }

  eventProcMouseHover(tEvent, tSprID, tParam, tWndID) {
    const tComponent = this.getSubComponent("Details", 0);
    if (tComponent != 0) {
      return call(Symbol.for("eventProcMouseHover"), list(tComponent), tEvent, tSprID, tParam, tWndID);
    }
    return 0;
  }
}
