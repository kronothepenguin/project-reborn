export default class {
  pState;
  pGameId;
  pNewGameId;
  pScoreIndex;
  pScoreIndexByRoomIndex;
  pScoreIndexByName;
  pOwnPlayerTeamId;
  pMsecAtNextState;

  deconstruct() {
    this.pState = 0;
    return this.ancestor.deconstruct();
  }

  Initialize() {
    this.pGameId = "JoinedGame!";
    this.pListItemContainerClass = list("IG ItemContainer Base Class", "IG GameInstanceData Class");
    this.pState = 0;
    this.pNewGameId = VOID;
    return this.registerForIGComponentUpdates("GameList");
  }

  handleUpdate(tUpdateId, tSenderId) {
    switch (tSenderId) {
      case "GameList":
        const tService = this.getIGComponent("GameList");
        if (tService == 0) {
          return 0;
        }
        const tGameRef = tService.getObservedGame();
        if (tGameRef == 0) {
          return 0;
        }
        if (voidp(this.pNewGameId)) {
          this.pNewGameId = tService.getObservedGameId();
          const tTeamData = tGameRef.getAllTeamData();
          for (const tTeam of tTeamData) {
            const tPlayers = tTeam.getaProp(Symbol.for("players"));
            for (const tPlayer of tPlayers) {
              this.displayPlayerRejoined(tPlayer);
            }
          }
        }
    }
    return 1;
  }

  displayEvent(ttype, tParam) {
    switch (ttype) {
      case Symbol.for("after_game"):
        return this.displayAfterGame(tParam);
      case Symbol.for("user_left_game"):
        return this.displayPlayerLeft(tParam);
      case Symbol.for("user_joined_game"):
        return this.displayPlayerRejoined(tParam);
      case Symbol.for("time_to_next_state"):
        return this.displayTimeLeft(tParam);
    }
    return 0;
  }

  getMsecAtNextState() {
    return this.pMsecAtNextState;
  }

  getScoreData() {
    return this.getListEntry(this.pGameId);
  }

  displayAfterGame(tdata) {
    this.getComponent().setSystemState(Symbol.for("after_game"));
    this.pNewGameId = VOID;
    if (!listp(tdata)) {
      return 0;
    }
    this.storePlayerIndex(tdata);
    tdata.setaProp(Symbol.for("id"), this.pGameId);
    this.updateEntry(tdata);
    this.pMsecAtNextState = the.milliSeconds + (tdata.getaProp(Symbol.for("time_to_next_state")) * 1000);
    this.pState = 1;
    const tRenderObj = this.getRenderer();
    if (objectp(tRenderObj)) {
      tRenderObj.pGameOverShown = 0;
    }
    executeMessage(Symbol.for("show_ig"), "AfterGame");
    this.displayWinningTeam(tdata);
    return 1;
  }

  displayPlayerLeft(tUserID) {
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    if (tUserID == -1) {
      return 0;
    }
    const tPlayerInfo = this.getPlayerInfo(tUserID);
    if (tPlayerInfo == 0) {
      return 0;
    }
    tPlayerInfo.setaProp(Symbol.for("disconnected"), 1);
    const tTeamId = tPlayerInfo.getaProp(Symbol.for("team_id"));
    const tName = tPlayerInfo.getaProp(Symbol.for("name"));
    const tText = replaceChunks(getText("ig_bubble_ag_userleft"), "\x", tName);
    executeMessage(Symbol.for("showCustomMessage"), propList("class", "IG Chat Bubble Info", "message", tText, "loc", point(450, 500), "color", this.getTeamColorDark(tTeamId)));
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    tRenderObj.displayPlayerLeft(tPlayerInfo.getaProp(Symbol.for("team_pos")), tPlayerInfo.getaProp(Symbol.for("pos")));
    return 1;
  }

  displayPlayerRejoined(tdata) {
    const tUserID = tdata.getaProp(Symbol.for("id"));
    const tPlayerInfo = this.getPlayerInfoByName(tdata.getaProp(Symbol.for("name")));
    if (tPlayerInfo == 0) {
      return 0;
    }
    tPlayerInfo.setaProp(Symbol.for("rejoined"), 1);
    const tTeamId = tdata.getaProp(Symbol.for("team_id"));
    const tName = tdata.getaProp(Symbol.for("name"));
    const tText = replaceChunks(getText("ig_bubble_ag_userrejoined"), "\x", tName);
    executeMessage(Symbol.for("showCustomMessage"), propList("class", "IG Chat Bubble Info", "message", tText, "loc", point(450, 500), "color", this.getTeamColorDark(tTeamId)));
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    tRenderObj.displayPlayerRejoined(tPlayerInfo.getaProp(Symbol.for("team_pos")), tPlayerInfo.getaProp(Symbol.for("pos")));
    return 1;
  }

  displayWinningTeam(tdata) {
    const tTeams = tdata.getaProp(Symbol.for("teams"));
    if (!listp(tTeams)) {
      return 0;
    }
    const tWinningTeam = tTeams[1];
    const tTeamId = tWinningTeam.getaProp(Symbol.for("id"));
    const tText = getText(`ig_bubble_ag_winner_${tTeamId}`);
    executeMessage(Symbol.for("showCustomMessage"), propList("class", "IG Chat Bubble Info", "message", tText, "loc", point(450, 500), "color", this.getTeamColorDark(tTeamId)));
    if (tTeamId == this.pOwnPlayerTeamId) {
      playSound("ig-winning");
    } else {
      playSound("ig-losing");
    }
    return 1;
  }

  displayTimeLeft(tTime) {
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    return tRenderObj.displayTimeLeft(tTime);
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

  storePlayerIndex(tdata) {
    this.pScoreIndex = propList();
    this.pScoreIndexByRoomIndex = propList();
    this.pScoreIndexByName = propList();
    const tTeams = tdata.getaProp(Symbol.for("teams"));
    const tOwnName = this.getOwnPlayerName();
    for (const tTeam of tTeams) {
      const tTeamPos = tTeam.getaProp(Symbol.for("pos"));
      const tPlayers = tTeam.getaProp(Symbol.for("players"));
      for (const tPlayer of tPlayers) {
        if (tOwnName == tPlayer.getaProp(Symbol.for("name"))) {
          this.pOwnPlayerTeamId = tPlayer.getaProp(Symbol.for("team_id"));
        }
        const tName = tPlayer.getaProp(Symbol.for("name"));
        this.pScoreIndexByName.setaProp(tName, tPlayer);
        const tID = tPlayer.getaProp(Symbol.for("id"));
        this.pScoreIndex.setaProp(tID, tPlayer);
        const tRoomIndex = tPlayer.getaProp(Symbol.for("room_index"));
        this.pScoreIndexByRoomIndex.setaProp(tRoomIndex, tPlayer);
      }
    }
    return 1;
  }

  getPlayerInfoByRoomIndex(tRoomIndex) {
    return this.pScoreIndexByRoomIndex.getaProp(tRoomIndex);
  }

  getPlayerInfo(tID) {
    return this.pScoreIndex.getaProp(tID);
  }

  getPlayerInfoByName(tName) {
    return this.pScoreIndexByName.getaProp(tName);
  }
}
