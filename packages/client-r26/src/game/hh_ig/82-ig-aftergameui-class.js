export default class {
  pGameOverShown;

  construct() {
    this.ancestor.construct();
    this.pViewMode = Symbol.for("game_score");
    this.pGameOverShown = 0;
    this.pViewModeComponents.setaProp(Symbol.for("game_score"), list(Symbol.for("modal"), "Gameover", "GameScore", "ReplayQuery", "HighscoreButton"));
    this.pViewModeComponents.setaProp(Symbol.for("alltime_score"), list(Symbol.for("modal"), "AlltimeScore", "ReplayQuery", "GamescoreButton"));
    this.pViewModeComponents.setaProp(Symbol.for("rejoin"), list(Symbol.for("modal"), "Rejoin"));
    return 1;
  }

  displayPlayerLeft(tTeamId, tPlayerPos) {
    if (this.pViewMode != Symbol.for("game_score")) {
      return 1;
    }
    const tComponent = this.getSubComponent("GameScore");
    if (tComponent == 0) {
      return 0;
    }
    return tComponent.displayPlayerLeft(tTeamId, tPlayerPos);
  }

  displayPlayerRejoined(tTeamId, tPlayerPos) {
    if (this.pViewMode == Symbol.for("game_score")) {
      const tComponent = this.getSubComponent("GameScore");
      if (tComponent == 0) {
        return 0;
      }
      return tComponent.displayPlayerRejoined(tTeamId, tPlayerPos);
    } else {
      if (this.pViewMode == Symbol.for("rejoin")) {
        const tComponent = this.getSubComponent("Rejoin");
        if (tComponent == 0) {
          return 0;
        }
        return tComponent.render();
      }
    }
  }

  displayTimeLeft(tTime) {
    const tComponent = this.getSubComponent("Rejoin");
    if (tComponent == 0) {
      return 0;
    }
    return tComponent.displayTimeLeft(tTime);
  }

  update() {
    let tComponent = this.getSubComponent("Gameover");
    if (tComponent != 0) {
      tComponent.update();
    }
    tComponent = this.getSubComponent("Rejoin");
    if (tComponent != 0) {
      tComponent.update();
    }
    return 1;
  }

  getSubComponentClass(tID) {
    if (tID == "Gameover") {
      if (this.pGameOverShown) {
        return list();
      }
      this.pGameOverShown = 1;
    }
    return list("IG TeamUI Subcomponent Class", `IG AfterGameUI ${tID} Class`);
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    switch (tSprID) {
      case "playagain_no.button":
      case "ig_link_leave_game":
        const tService = this.getIGComponent("GameList");
        if (tService == 0) {
          return 0;
        }
        tService.leaveJoinedGame(0);
        this.getComponent().setSystemState(Symbol.for("ready"));
        return this.getHandler().send_EXIT_GAME(1);
      case "playagain_yes.button":
        executeMessage(Symbol.for("sendTrackingPoint"), "/game/joined/replay");
        return this.getHandler().send_PLAY_AGAIN();
      case "join.button":
        const tTeamIndex = integer(tWndID.char[`${tWndID.length}`]);
        if (!integerp(tTeamIndex)) {
          return 0;
        }
        const tService2 = this.getIGComponent("GameList");
        if (tService2 == 0) {
          return 0;
        }
        return tService2.setJoinedGameId(tService2.getJoinedGameId(), tTeamIndex);
      case "ig_tip_title":
      case "ig_title_bg":
      case "ig_tip_close":
      case "ig_title_bg_light":
        const tFlagManager = this.getFlagManager();
        if (tFlagManager == 0) {
          return 0;
        }
        if (tEvent == Symbol.for("mouseDown")) {
          if (tFlagManager.getFlagState(tWndID)) {
            return tFlagManager.Remove(tWndID);
          }
        }
        return tFlagManager.toggle(tWndID);
      case "ig_link_highscores_show":
        return this.setViewMode(Symbol.for("alltime_score"));
      case "ig_link_highscores_hide":
        return this.setViewMode(Symbol.for("game_score"));
    }
    return 1;
  }

  eventProcMouseHover(tEvent, tSprID, tParam, tWndID, tTargetID) {
    switch (tSprID) {
      case "ig_tip_title":
      case "ig_title_bg":
      case "ig_tip_close":
      case "ig_title_bg_light":
        const tFlagManager = this.getFlagManager();
        if (tFlagManager == 0) {
          return 0;
        }
        if (tEvent == Symbol.for("mouseEnter")) {
          tFlagManager.open(tWndID);
        } else {
          tFlagManager.close(tWndID);
        }
        return 1;
    }
    return 0;
  }
}
