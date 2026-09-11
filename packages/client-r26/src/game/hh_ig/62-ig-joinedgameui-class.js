export default class {
  construct() {
    this.ancestor.construct();
    this.pViewModeComponents = propList("Info", list("Details"), "change_team", list("ChangeTeam"), "highscore", list("Highscore"), "mini", list("Minimized"));
    return 1;
  }

  deconstruct() {
    return this.ancestor.deconstruct();
  }

  setViewMode(tMode) {
    const tWrapObj = this.getWindowWrapper();
    if (tWrapObj == 0) {
      return 0;
    }
    const tRealLoc = tWrapObj.getRealLocation();
    this.ancestor.setViewMode(tMode);
    tWrapObj.moveTo(tRealLoc[1], tRealLoc[2]);
  }

  getSubComponentClass(tID) {
    return list("IG JoinedGameUI Details Class", `IG JoinedGameUI ${tID} Class`);
  }

  getOwnPlayerName() {
    const tSession = getObject(Symbol.for("session"));
    if (tSession == 0) {
      return 0;
    }
    if (!tSession.exists(Symbol.for("user_name"))) {
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
    if (tJoinedGameRef == 0) {
      return 0;
    }
    const tMainThreadRef = this.getMainThread();
    const tIntParams = list();
    while (integerp(integer(tSprID.char[`${tSprID.length}`]))) {
      let tIntParam = 0;
      let tMultiplier = 1;
      while (integerp(integer(tSprID.char[`${tSprID.length}`]))) {
        tIntParam = tIntParam + (tMultiplier * integer(tSprID.char[`${tSprID.length}`]));
        tSprID = tSprID.char[`1..${tSprID.length - 1}`];
        tMultiplier = tMultiplier * 10;
      }
      tIntParams.addAt(1, tIntParam);
      if (tSprID.char[`${tSprID.length}`] == "_") {
        tSprID = tSprID.char[`1..${tSprID.length - 1}`];
      }
    }
    switch (tSprID) {
      case "ig_change_team.button":
        if (tJoinedGameRef.getTeamCount() < 3) {
          return tListService.setNextTeamInJoinedGame();
        } else {
          return this.setViewMode(Symbol.for("change_team"));
        }
      case "ig_icon_gamelist":
        return this.ChangeWindowView("GameList");
      case "ig_minimize":
        return this.setViewMode(Symbol.for("mini"));
      case "ig_maximize":
      case "ig_level_name":
      case "ig_tab_gameinfo_bg":
      case "info_gamemode":
        return this.setViewMode(Symbol.for("Info"));
      case "ig_tab_highscores":
        return this.setViewMode(Symbol.for("highscore"));
      case "ig_button_join_another_game":
        return this.ChangeWindowView("GameList");
      case "ig_leave_game.button":
        return tListService.leaveJoinedGame(0);
      case "ig_kick_team_player":
        if (tIntParams.count != 2) {
          return 0;
        }
        const tTeamIndex = tIntParams[1];
        const tPlayerIndex = tIntParams[2];
        const tTeamData = tJoinedGameRef.getTeamPlayers(tTeamIndex);
        if (tTeamData == 0) {
          return 0;
        }
        if (tTeamData.count < tPlayerIndex) {
          return 0;
        }
        const tPlayerData = tTeamData[tPlayerIndex];
        if (tPlayerData.getaProp(Symbol.for("name")) == this.getOwnPlayerName()) {
          return tListService.leaveJoinedGame(0);
        } else {
          return tMainThreadRef.getHandler().send_KICK_USER(tPlayerData.getaProp(Symbol.for("id")));
        }
      case "join":
        this.setViewMode(Symbol.for("Info"));
        if (tIntParams.count != 1) {
          return 0;
        }
        return tListService.setJoinedGameId(tListService.getJoinedGameId(), tIntParams[1]);
    }
    return 1;
  }
}
