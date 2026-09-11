export default class {
  pState;
  pGameId;
  pMsecAtNextState;

  construct() {
    this.pGameId = "JoinedGame!";
    this.pListItemContainerClass = list("IG ItemContainer Base Class", "IG GameInstanceData Class");
    this.pState = 0;
    return 1;
  }

  deconstruct() {
    this.pState = 0;
    return this.ancestor.deconstruct();
  }

  displayEvent(ttype, tParam) {
    switch (ttype) {
      case Symbol.for("pre_game"):
        return this.displayPreGame(tParam);
      case Symbol.for("user_left_game"):
        return this.displayPlayerLeft(tParam);
      case Symbol.for("arena_entered"):
        return this.displayArenaEntered(tParam);
      case Symbol.for("still_loading"):
        return this.displayStillLoading(tParam);
      case Symbol.for("stage_starting"):
        return this.displayStageStarting(tParam);
    }
    return 0;
  }

  getJoinedGame() {
    return this.getListEntry(this.pGameId);
  }

  getMsecAtNextState() {
    return this.pMsecAtNextState;
  }

  displayPreGame(tdata) {
    this.pState = 1;
    if (!listp(tdata)) {
      return 0;
    }
    tdata.setaProp(Symbol.for("id"), this.pGameId);
    this.updateEntry(tdata);
    executeMessage(Symbol.for("show_ig"), "PreGame");
    executeMessage(Symbol.for("startChatDisplay"));
    return 1;
  }

  displayPlayerLeft(tID) {
    put("* PreGame.displayPlayerLeft", `${tID}`);
    const tGameRef = this.getJoinedGame();
    if (tGameRef == 0) {
      return 0;
    }
    tGameRef.removeUserFromGame(propList("id", tID));
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    tRenderObj.displayPlayerLeft(tID);
    return 1;
  }

  displayArenaEntered(tdata) {
    this.pMsecAtNextState = -1;
    if (!listp(tdata)) {
      return 0;
    }
    const tGameRef = this.getJoinedGame();
    if (tGameRef == 0) {
      return 0;
    }
    tGameRef.addUserToGame(tdata);
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    tRenderObj.displayPlayer(tdata);
    const tRoomComponent = getObject(Symbol.for("room_component"));
    if (tRoomComponent == 0) {
      return 0;
    }
    tdata = tdata.duplicate();
    const tFigureObj = getObject("Figure_System");
    if (tFigureObj == 0) {
      return 0;
    }
    tdata.setaProp(Symbol.for("figure"), tFigureObj.parseFigure(tdata.getaProp(Symbol.for("figure")), tdata.getaProp(Symbol.for("sex")), "user"));
    tdata.setaProp(Symbol.for("class"), "user");
    tdata.setaProp(Symbol.for("id"), string(tdata[Symbol.for("id")]));
    tdata.setaProp(Symbol.for("direction"), list(0, 0));
    tRoomComponent.createUserObject(tdata);
    return 1;
  }

  displayStillLoading(tdata) {
    if (!listp(tdata)) {
      return 0;
    }
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    tRenderObj.displayProgress(tdata.getaProp(Symbol.for("progress")));
    const tFinished = tdata.getaProp(Symbol.for("finished_players"));
    const tGameRef = this.getJoinedGame();
    if (tGameRef == 0) {
      return 0;
    }
    for (const tID of tFinished) {
      const tPlayerInfo = tGameRef.getPlayerById(tID);
      if (listp(tPlayerInfo)) {
        tRenderObj.displayPlayerDone(tID, tPlayerInfo.getaProp(Symbol.for("figure")), tPlayerInfo.getaProp(Symbol.for("sex")));
        continue;
      }
      error(this, "Player left, not handled correctly..FIX!", Symbol.for("displayStillLoading"));
    }
    return 1;
  }

  displayStageStarting(tdata) {
    const tTimeLeftSec = tdata.getaProp(Symbol.for("time_to_stage_running"));
    this.pMsecAtNextState = the.milliSeconds + (tTimeLeftSec * 1000);
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    tRenderObj.displayCountdown();
    return 1;
  }
}
