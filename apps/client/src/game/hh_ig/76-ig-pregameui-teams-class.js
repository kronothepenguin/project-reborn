export default class {
  pTeamIndex;
  pLoadingElements;
  pUpdateCounter;

  addWindows() {
    this.pWindowID = "te";
    const tService = this.getIGComponent("PreGame");
    if (tService == 0) {
      return 0;
    }
    const tGameRef = tService.getJoinedGame();
    if (tGameRef == 0) {
      return 0;
    }
    const tTeamMaxSize = tGameRef.getTeamMaxSize();
    const tTeamCount = tGameRef.getTeamCount();
    const tTeams = tGameRef.getAllTeamData();
    this.pLoadingElements = propList();
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    let tScrollStartOffset = -100;
    let tTeamPos;
    for (tTeamPos = 1; tTeamPos <= tTeamCount - 1; tTeamPos++) {
      tWrapObjRef.addOneWindow(this.getWindowId(tTeamPos), `ig_pg_load_plrs_${tTeamMaxSize}.window`, this.pWindowSetId, propList("scrollFromLocX", tScrollStartOffset, "spaceBottom", 0));
      this.setTeamColorBackground(this.getWindowId(tTeamPos), tTeamPos);
      tScrollStartOffset = tScrollStartOffset - 50;
    }
    tWrapObjRef.addOneWindow(this.getWindowId(tTeamPos), `ig_pg_load_plrs_${tTeamMaxSize}_btm.window`, this.pWindowSetId, propList("scrollFromLocX", tScrollStartOffset, "spaceBottom", 2));
    this.setTeamColorBackground(this.getWindowId(tTeamPos), tTeamPos);
    this.pTeamIndex = propList();
    for (const tTeamInfo of tTeams) {
      const tPlayers = tTeamInfo.getaProp(Symbol.for("players"));
      for (const tPlayerInfo of tPlayers) {
        this.displayPlayer(tPlayerInfo);
      }
    }
    for (let tTeamId = 1; tTeamId <= tTeamCount; tTeamId++) {
      if (this.pTeamIndex.getaProp(tTeamId) == 0) {
        this.pTeamIndex.setaProp(tTeamId, list());
      }
      const tPlayerCount = this.pTeamIndex.getaProp(tTeamId).count;
      for (let i = tPlayerCount + 1; i <= tTeamMaxSize; i++) {
        this.displayPlayer(0, tTeamId, i);
      }
    }
    tWrapObjRef.moveTo(10, 10);
    return 1;
  }

  update() {
    this.pUpdateCounter = this.pUpdateCounter + 1;
    if ((this.pUpdateCounter % 5) > 0) {
      return 1;
    }
    if (this.pUpdateCounter >= 30) {
      this.pUpdateCounter = 0;
    }
    const tPhase = this.pUpdateCounter / 5;
    for (const tElemInfo of this.pLoadingElements) {
      const tWndObj = getWindow(this.getWindowId(tElemInfo[1]));
      if (tWndObj == 0) {
        return 0;
      }
      const tElem = tWndObj.getElement(`ig_icon_player_${tElemInfo[2]}`);
      if (tElem == 0) {
        return 0;
      }
      const tMemNum = getmemnum(`ig_icon_loading_${tPhase}`);
      if (tMemNum == 0) {
        return 0;
      }
      tElem.feedImage(this.alignIconImage(member(tMemNum).image, 19, 18));
    }
    return 1;
  }

  displayPlayer(tPlayerInfo, tTeamId, tPlayerPos) {
    let tPlayerId;
    if (tPlayerInfo != VOID) {
      tTeamId = tPlayerInfo.getaProp(Symbol.for("team_id"));
      tPlayerId = tPlayerInfo.getaProp(Symbol.for("id"));
      if (this.pTeamIndex.findPos(tTeamId) == 0) {
        const tTeam = list();
        this.pTeamIndex.setaProp(tTeamId, tTeam);
      } else {
        var tTeam = this.pTeamIndex.getaProp(tTeamId);
      }
      if (tTeam.findPos(tPlayerId) == 0) {
        for (tPlayerPos = 1; tPlayerPos <= tTeam.count; tPlayerPos++) {
          if (voidp(tTeam[tPlayerPos])) {
            tTeam[tPlayerPos] = tPlayerId;
            break;
          }
        }
        if (tTeam.findPos(tPlayerId) == 0) {
          tTeam.append(tPlayerId);
        }
      }
      tPlayerPos = tTeam.findPos(tPlayerId);
      var tName = tPlayerInfo.getaProp(Symbol.for("name"));
    } else {
      var tName = "---";
    }
    const tWndObj = getWindow(this.getWindowId(tTeamId));
    if (tWndObj == 0) {
      return 0;
    }
    let tElem = tWndObj.getElement(`ig_icon_player_${tPlayerPos}`);
    if (tElem == 0) {
      return 0;
    }
    if (tPlayerInfo == 0) {
      tElem.hide();
    } else {
      tElem.show();
      this.pLoadingElements.setaProp(tPlayerId, list(tTeamId, tPlayerPos));
      const tMemNum = getmemnum("ig_icon_loading_0");
      if (tMemNum != 0) {
        tElem.feedImage(member(tMemNum).image);
      }
    }
    tElem = tWndObj.getElement(`ig_name_player_${tPlayerPos}`);
    if (tElem == 0) {
      return 0;
    }
    const tOwnPlayer = tName == this.getOwnPlayerName();
    let tFontStruct;
    if (tOwnPlayer) {
      tFontStruct = getStructVariable("struct.font.bold");
    } else {
      tFontStruct = getStructVariable("struct.font.plain");
    }
    tElem.setFont(tFontStruct);
    tElem.setText(tName);
    const tFlagId = `${this.getBasicFlagId()}_p_${tTeamId}_${tPlayerPos}`;
    this.removeFlagObject(tFlagId);
    return 1;
  }

  displayPlayerDone(tID, tFigure, tsex) {
    const tElemInfo = this.pLoadingElements.getaProp(tID);
    if (tElemInfo == 0) {
      return 0;
    }
    const tWndObj = getWindow(this.getWindowId(tElemInfo[1]));
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement(`ig_icon_player_${tElemInfo[2]}`);
    if (tElem == 0) {
      return 0;
    }
    const tImage = this.getHeadImage(tFigure, tsex, 18, 18);
    if (tImage != 0) {
      tElem.feedImage(tImage);
    }
    this.pLoadingElements.deleteProp(tID);
    return 1;
  }

  displayPlayerLeft(tID) {
    let tPlayerPos = 0;
    for (let tTeamPos = 1; tTeamPos <= this.pTeamIndex.count; tTeamPos++) {
      tPlayerPos = this.pTeamIndex[tTeamPos].findPos(tID);
      if (tPlayerPos > 0) {
        break;
      }
    }
    if (tPlayerPos == 0) {
      return error(this, "Player not found.", Symbol.for("displayPlayerLeft"));
    }
    this.displayPlayer(0, tTeamPos, tPlayerPos);
    this.pTeamIndex[tTeamPos][tPlayerPos] = VOID;
    const tFlagId = `${this.getBasicFlagId()}_p_${tTeamPos}_${tPlayerPos}`;
    this.removeFlagObject(tFlagId);
    const tElemID = `ig_icon_player_${tPlayerPos}`;
    const tColorDark = this.getTeamColorDark(tTeamPos);
    this.setInfoFlag(tFlagId, this.getWindowId(tTeamPos), tElemID, "PreGameUserLeft", tColorDark);
    return 1;
  }
}
