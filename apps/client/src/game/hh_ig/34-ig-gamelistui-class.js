export default class {
  construct() {
    this.ancestor.construct();
    this.pViewMode = Symbol.for("Info");
    this.pViewModeComponents = propList(Symbol.for("Info"), list("List", "Details"), Symbol.for("highscore"), list("List", "Highscore"));
    return 1;
  }

  deconstruct() {
    return this.ancestor.deconstruct();
  }

  getGameTypeHandlerClass(tGameType) {
    const tGameTypeService = this.getIGComponent("GameTypes");
    if (tGameTypeService == 0) {
      return 0;
    }
    const tTypeStr = tGameTypeService.getGameTypeString(tGameType);
    const tMemName = `IG GameListUI ${tTypeStr} Class`;
    let tClass;
    if (!memberExists(tMemName)) {
      tClass = "IG GameListUI Details Class";
    } else {
      tClass = list("IG GameListUI Details Class", tMemName);
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
    switch (tID) {
      case "Highscore":
        tClass = list("IG GameListUI Details Class", "IG GameListUI Highscore Class");
        break;
      case "Details":
        const tService = this.getMasterIGComponent();
        if (tService == 0) {
          return 0;
        }
        let tItemRef = tService.getObservedGame();
        if (tItemRef == 0) {
          tItemRef = tService.getJoinedGame();
        }
        if (tItemRef == 0) {
          tClass = this.getGameTypeHandlerClass();
        } else {
          tClass = this.getGameTypeHandlerClass(tItemRef.getProperty(Symbol.for("game_type")));
        }
        break;
      default:
        tClass = `IG GameListUI ${tID} Class`;
        break;
    }
    return this.initializeSubComponent(tID, tClass);
  }

  getOwnPlayerName() {
    const tSession = getObject(Symbol.for("session"));
    if (tSession == 0) {
      return 0;
    }
    return tSession.GET(Symbol.for("user_name"));
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    const tListService = this.getIGComponent("GameList");
    if (tListService == 0) {
      return 0;
    }
    const tJoinedGameRef = tListService.getJoinedGame();
    const tJoinedGameId = tListService.getJoinedGameId();
    const tObservedGameId = tListService.getObservedGameId();
    switch (tSprID) {
      case "join_game.button":
        executeMessage(Symbol.for("sendTrackingPoint"), "/game/joined/ui");
        return tListService.joinTeamWithLeastMembers(tObservedGameId);
      case "leave_game.button":
        tListService.leaveJoinedGame(1);
        return executeMessage(Symbol.for("show_ig"), "GameList");
      case "ig_owngame_back.button":
        return this.ChangeWindowView("JoinedGame");
      case "ig_tab_highscores":
        return this.setViewMode(Symbol.for("highscore"));
      case "ig_level_name":
      case "ig_tab_gameinfo":
        return this.setViewMode(Symbol.for("Info"));
    }
    const tComponent = this.getSubComponent("List", 0);
    if (tComponent != 0) {
      tComponent.eventProcMouseDown(tEvent, tSprID, tParam, tWndID);
    }
    const tComponent2 = this.getSubComponent("Details", 0);
    if (tComponent2 != 0) {
      tComponent2.eventProcMouseDown(tEvent, tSprID, tParam, tWndID);
    }
    return 1;
  }

  eventProcMouseHover(tEvent, tSprID, tParam, tWndID) {
    const tComponent = this.getSubComponent("Details", 0);
    if (tComponent != 0) {
      return call(Symbol.for("eventProcMouseHover"), list(tComponent), tEvent, tSprID, tParam, tWndID);
    }
    return 0;
  }
}
