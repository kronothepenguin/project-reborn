export default class {
  pOwnPlayerId;
  pUserTeamsIndex;

  construct() {
    pOwnPlayerId = -1;
    pUserTeamsIndex = propList();
    return this.ancestor.construct();
  }

  deconstruct() {
    pOwnPlayerId = -1;
    pUserTeamsIndex = propList();
    return this.ancestor.deconstruct();
  }

  Refresh(tdata) {
    const tAllTeamData = tdata.getaProp(Symbol.for("teams"));
    if (listp(tAllTeamData)) {
      for (let i = 1; i <= tAllTeamData.count; i++) {
        const tTeam = tAllTeamData[i];
        const tPlayers = tTeam.getaProp(Symbol.for("players"));
        for (const tPlayer of tPlayers) {
          this.addUserToGame(tPlayer, 1);
        }
      }
    }
    this.ancestor.Refresh(tdata);
    return 1;
  }

  addUserToGame(tdata, tHoldAnnounce) {
    if (!listp(tdata)) {
      return 0;
    }
    const tUserID = tdata.getaProp(Symbol.for("id"));
    if (tdata.findPos(Symbol.for("players_required"))) {
      this.pData.setaProp(Symbol.for("players_required"), tdata.getaProp(Symbol.for("players_required")));
    }
    const tTeamId = tdata.getaProp(Symbol.for("team_id"));
    if (voidp(tTeamId)) {
      return 0;
    }
    const tOldTeamId = this.getTeamIdFromIndex(tUserID);
    if (tOldTeamId != 0) {
      if (tOldTeamId != tTeamId) {
        this.removeUserFromGame(tdata);
      }
    }
    this.storeToIndex(tUserID, tTeamId);
    this.pData.setaProp(Symbol.for("player_count"), pUserTeamsIndex.count);
    if (this.pData.findPos(Symbol.for("teams")) == 0) {
      this.pData.setaProp(Symbol.for("teams"), propList());
    }
    const tAllTeamData = this.pData.getaProp(Symbol.for("teams"));
    if (tAllTeamData.findPos(tTeamId) == 0) {
      tAllTeamData.setaProp(tTeamId, [Symbol.for("players"), propList()]);
    }
    const tPlayers = tAllTeamData.getaProp(tTeamId).getaProp(Symbol.for("players"));
    const tPlayerData = propList();
    for (const tKey of list(Symbol.for("id"), Symbol.for("name"), Symbol.for("figure"), Symbol.for("sex"), Symbol.for("team_id"), Symbol.for("room_index"))) {
      if (tdata.findPos(tKey)) {
        tPlayerData.setaProp(tKey, tdata.getaProp(tKey));
      }
    }
    if (tdata.getaProp(Symbol.for("name")) == this.getOwnPlayerName()) {
      pOwnPlayerId = tUserID;
    }
    tPlayers.setaProp(tUserID, tPlayerData);
    if (!tHoldAnnounce) {
      const towner = this.getOwnerIGComponent();
      if (towner != 0) {
        towner.announceUpdate(this.getProperty(Symbol.for("id")));
      }
    }
    return 1;
  }

  removeUserFromGame(tdata) {
    const tUserID = tdata.getaProp(Symbol.for("id"));
    const tAllTeamData = this.pData.getaProp(Symbol.for("teams"));
    if (tAllTeamData == 0) {
      return 0;
    }
    const tTeamId = this.getTeamIdFromIndex(tUserID);
    if (tTeamId == 0) {
      return 1;
    }
    this.storeToIndex(tUserID, -1);
    if (pOwnPlayerId == tUserID) {
      pOwnPlayerId = -1;
    }
    const tTeam = tAllTeamData.getaProp(tTeamId);
    const tPlayers = tTeam.getaProp(Symbol.for("players"));
    if (!tPlayers.findPos(tUserID)) {
      return 0;
    }
    tPlayers.deleteProp(tUserID);
    this.pData.setaProp(Symbol.for("player_count"), pUserTeamsIndex.count);
    if (tdata.findPos(Symbol.for("players_required"))) {
      this.pData.setaProp(Symbol.for("players_required"), tdata.getaProp(Symbol.for("players_required")));
    }
    const towner = this.getOwnerIGComponent();
    if (towner != 0) {
      towner.announceUpdate(this.getProperty(Symbol.for("id")));
    }
    return 1;
  }

  getLevelHighscore() {
    const tLevelRef = this.getLevelRef();
    if (tLevelRef == 0) {
      return 0;
    }
    return tLevelRef.getLevelHighscore();
  }

  getLevelTeamHighscore() {
    const tLevelRef = this.getLevelRef();
    if (tLevelRef == 0) {
      return 0;
    }
    return tLevelRef.getLevelTeamHighscore();
  }

  getPlayerById(tID) {
    const tAllTeamData = this.pData.getaProp(Symbol.for("teams"));
    if (tAllTeamData == 0) {
      return 0;
    }
    for (const tTeam of tAllTeamData) {
      const tPlayers = tTeam.getaProp(Symbol.for("players"));
      for (const tPlayer of tPlayers) {
        if (listp(tPlayer)) {
          if (tPlayer.getaProp(Symbol.for("id")) == tID) {
            return tPlayer;
          }
        }
      }
    }
    return 0;
  }

  getAllTeamData() {
    return this.pData.getaProp(Symbol.for("teams"));
  }

  getTeam(tTeamId) {
    const tTeamData = this.pData.getaProp(Symbol.for("teams"));
    if (tTeamData == VOID) {
      return 0;
    }
    return tTeamData.getaProp(tTeamId);
  }

  getTeamPlayers(tTeamIndex) {
    const tAllTeamData = this.getAllTeamData();
    if (!listp(tAllTeamData)) {
      return 0;
    }
    const tTeamData = tAllTeamData.getaProp(tTeamIndex);
    if (!listp(tTeamData)) {
      return 0;
    }
    return tTeamData.getaProp(Symbol.for("players"));
  }

  getPlayerCount() {
    if (this.pData.findPos(Symbol.for("player_count")) == 0) {
      return 0;
    }
    return this.pData.getaProp(Symbol.for("player_count"));
  }

  getMaxPlayerCount() {
    if (this.pData.findPos(Symbol.for("player_max_count")) == 0) {
      return 0;
    }
    return this.pData.getaProp(Symbol.for("player_max_count"));
  }

  getTeamSize(tTeamIndex) {
    const tdata = this.getTeamPlayers(tTeamIndex);
    if (listp(tdata)) {
      return tdata.count;
    } else {
      return 0;
    }
  }

  getTeamCount() {
    if (this.pData.findPos(Symbol.for("number_of_teams")) == 0) {
      return 0;
    }
    return this.pData.getaProp(Symbol.for("number_of_teams"));
  }

  getTeamMaxSize() {
    const tTeamCount = this.getTeamCount();
    let tCount;
    switch (tTeamCount) {
      case 1:
        tCount = 12;
        break;
      case 2:
        switch (this.getProperty(Symbol.for("game_type"))) {
          case 0:
          case 1:
            tCount = 6;
            break;
          default:
            tCount = 4;
            break;
        }
        break;
      case 3:
        tCount = 4;
        break;
      case 4:
        tCount = 3;
        break;
    }
    return tCount;
  }

  checkPlayerRequiredForSlot(tTeamIndex, tPlayerIndex) {
    const tPlayersRequired = this.getProperty(Symbol.for("players_required"));
    if (!listp(tPlayersRequired)) {
      return 0;
    }
    const tRequiredCount = tPlayersRequired.getaProp(tTeamIndex);
    if (voidp(tRequiredCount)) {
      return 0;
    }
    const tTeamSize = this.getTeamSize(tTeamIndex);
    return (tTeamSize + tRequiredCount) == tPlayerIndex;
  }

  getGameState() {
    return this.pData.getaProp(Symbol.for("state"));
  }

  getGameStateTimer() {
    return this.pData.getaProp(Symbol.for("state_timer"));
  }

  getBiggestTeamPlayerCount() {
    let tResult = 0;
    const tTeamCount = this.getTeamCount();
    for (let tTeamIndex = 1; tTeamIndex <= tTeamCount; tTeamIndex++) {
      const tTeam = this.getTeamPlayers(tTeamIndex);
      const tPlayerCount = tTeam.count;
      if (tPlayerCount > tResult) {
        tResult = tPlayerCount;
      }
    }
    return tResult;
  }

  canStart() {
    const tList = this.pData.getaProp(Symbol.for("players_required"));
    if (!listp(tList)) {
      return 1;
    }
    if (tList.count == 0) {
      return 1;
    }
    return 0;
  }

  getOwnPlayerTeam() {
    return this.getTeamIdFromIndex(this.getOwnPlayerId());
  }

  getOwnPlayerName() {
    const tSession = getObject(Symbol.for("session"));
    if (tSession == 0) {
      return 0;
    }
    return tSession.GET(Symbol.for("user_name"));
  }

  getOwnPlayerId() {
    return pOwnPlayerId;
  }

  checkIfOwnerOfGame() {
    const tSession = getObject(Symbol.for("session"));
    if (tSession == 0) {
      return 0;
    }
    return tSession.GET(Symbol.for("user_name")) == this.pData.getaProp(Symbol.for("owner_name"));
  }

  hasCompleteData() {
    return listp(this.getAllTeamData());
  }

  hasTeamScores() {
    return this.pData.findPos(Symbol.for("level_team_scores")) > 0;
  }

  getTeamIdFromIndex(tID) {
    return pUserTeamsIndex.getaProp(tID);
  }

  storeToIndex(tID, tTeamId) {
    if (voidp(tID) || voidp(tTeamId)) {
      return 0;
    }
    if (tTeamId == -1) {
      pUserTeamsIndex.deleteProp(tID);
    } else {
      pUserTeamsIndex.setaProp(tID, tTeamId);
    }
    return 1;
  }

  getLevelRef() {
    const tLevelId = this.getProperty(Symbol.for("level_id"));
    if (voidp(tLevelId)) {
      return 0;
    }
    const tService = this.getIGComponent("LevelList");
    if (tService == 0) {
      return 0;
    }
    return tService.getListEntry(tLevelId);
  }
}
