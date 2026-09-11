export default class {
  construct() {
    this.regMsgList(1);
    return 1;
  }

  deconstruct() {
    this.regMsgList(0);
    return 1;
  }

  send_CHECK_DIRECTORY_STATUS() {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    return tConn.send("IG_CHECK_DIRECTORY_STATUS");
  }

  send_ROOM_GAME_STATUS(tJoinedFlag, tGameId, tGameType) {
    if (this.getComponent().getSystemState() != Symbol.for("ready")) {
      return 0;
    }
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    if (tJoinedFlag == 1) {
      return tConn.send("IG_ROOM_GAME_STATUS", [Symbol.for("integer"), 1, Symbol.for("integer"), tGameId, Symbol.for("integer"), tGameType]);
    } else {
      return tConn.send("IG_ROOM_GAME_STATUS", [Symbol.for("integer"), 0]);
    }
  }

  send_PLAY_AGAIN() {
    const tList = propList();
    tList["showDialog"] = 1;
    executeMessage(Symbol.for("getHotelClosingStatus"), tList);
    if (tList["retval"] == 1) {
      return 0;
    }
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    return tConn.send("IG_PLAY_AGAIN");
  }

  send_GET_LEVEL_HALL_OF_FAME(tLevelId) {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tLevelId = integer(tLevelId);
    if (!integerp(tLevelId)) {
      return 0;
    }
    return tConn.send("IG_GET_LEVEL_HALL_OF_FAME", [Symbol.for("integer"), tLevelId]);
  }

  send_CREATE_GAME(tLevelId, tGameParams) {
    const tList = propList();
    tList["showDialog"] = 1;
    executeMessage(Symbol.for("getHotelClosingStatus"), tList);
    if (tList["retval"] == 1) {
      return 0;
    }
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    const tParamList = [Symbol.for("string"), tLevelId];
    for (let i = 1; i <= tGameParams.count; i++) {
      const tValue = tGameParams[i];
      tParamList.addProp(ilk(tValue), tValue);
    }
    return tConn.send("IG_CREATE_GAME", tParamList);
  }

  send_GET_GAME_LIST(tStartObservingFirstGame, tMaxResultCount) {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    const tParams = propList();
    if (tStartObservingFirstGame == VOID) {
      tStartObservingFirstGame = 0;
    }
    tStartObservingFirstGame = tStartObservingFirstGame && (this.getComponent().getSystemState() == Symbol.for("ready"));
    tParams.addProp(Symbol.for("integer"), integer(tStartObservingFirstGame));
    tParams.addProp(Symbol.for("integer"), integer(tMaxResultCount));
    tConn.send("IG_GET_GAME_LIST", tParams);
    return 1;
  }

  send_GET_CREATE_GAME_INFO() {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tConn.send("IG_GET_CREATE_GAME_INFO");
    return 1;
  }

  send_LIST_POSSIBLE_INVITEES(tQuery) {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    const tDefaultInviteMax = 10;
    tConn.send("IG_LIST_POSSIBLE_INVITEES", [Symbol.for("integer"), tQuery - 1, Symbol.for("integer"), tDefaultInviteMax]);
  }

  send_INVITE_USER(tUserName, tMessage) {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tConn.send("IG_INVITE_USER", [Symbol.for("string"), tUserName, Symbol.for("string"), tMessage]);
  }

  send_KICK_USER(tUserID) {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tConn.send("IG_KICK_USER", [Symbol.for("integer"), tUserID]);
    return 1;
  }

  send_START_GAME() {
    const tList = propList();
    tList["showDialog"] = 1;
    executeMessage(Symbol.for("getHotelClosingStatus"), tList);
    if (tList["retval"] == 1) {
      return 0;
    }
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tConn.send("IG_START_GAME");
    return 1;
  }

  send_JOIN_GAME(tGameId, tTeamId) {
    const tList = propList();
    tList["showDialog"] = 1;
    executeMessage(Symbol.for("getHotelClosingStatus"), tList);
    if (tList["retval"] == 1) {
      return 0;
    }
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tConn.send("IG_JOIN_GAME", [Symbol.for("integer"), tGameId, Symbol.for("integer"), tTeamId]);
    return 1;
  }

  send_LEAVE_GAME() {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tConn.send("IG_LEAVE_GAME");
    return 1;
  }

  send_START_OBSERVING_GAME(tGameId, tLongData) {
    if (this.getComponent().getSystemState() != Symbol.for("ready")) {
      return 0;
    }
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tConn.send("IG_START_OBSERVING_GAME", [Symbol.for("integer"), tGameId, Symbol.for("integer"), tLongData]);
    return 1;
  }

  send_STOP_OBSERVING_GAME(tGameId) {
    if (this.getComponent().getSystemState() != Symbol.for("ready")) {
      return 0;
    }
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    if (voidp(tGameId)) {
      tGameId = this.getComponent().getIGComponent("GameList").getObservedGameId();
    }
    if (tGameId == -1) {
      return 0;
    }
    tConn.send("IG_STOP_OBSERVING_GAME", [Symbol.for("integer"), tGameId]);
    return 1;
  }

  send_ACCEPT_INVITE_REQUEST(tGameId) {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tConn.send("IG_ACCEPT_INVITE_REQUEST", [Symbol.for("integer"), tGameId]);
    return 1;
  }

  send_DECLINE_INVITE_REQUEST(tGameId) {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tConn.send("IG_DECLINE_INVITE_REQUEST", [Symbol.for("integer"), tGameId]);
    return 1;
  }

  send_LOAD_STAGE_READY(tPercentage) {
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    tPercentage = integer(tPercentage * 100);
    tConn.send("IG_LOAD_STAGE_READY", [Symbol.for("integer"), tPercentage]);
    return 1;
  }

  send_EXIT_GAME(tRedirectFlag) {
    executeMessage(Symbol.for("ig_clear_game_info"));
    const tConn = this.getGameConnection();
    if (tConn == 0) {
      return 0;
    }
    if (voidp(tRedirectFlag)) {
      tRedirectFlag = 1;
    }
    tConn.send("IG_EXIT_GAME", [Symbol.for("integer"), integer(tRedirectFlag)]);
    return 1;
  }

  handle_directory_status(tMsg) {
    const tConn = tMsg.connection;
    const tCode = tConn.GetIntFrom();
    if (tCode == 0) {
      return this.getComponent().getInitialData();
    }
    error(this, `TODO: Directory not available, code: ${tCode}`, Symbol.for("handle_directory_status"));
    return 1;
  }

  handle_ENTER_ARENA_FAILED(tMsg) {
    const tConn = tMsg.connection;
    const tCode = tConn.GetIntFrom();
    this.getInterface().showBasicAlert(`ig_error_enter_arena_${tCode}`);
    return 1;
  }

  handle_GAME_REJOIN(tMsg) {
    const tConn = tMsg.connection;
    const tTimeLeft = tConn.GetIntFrom();
    this.getComponent().displayIGComponentEvent("AfterGame", Symbol.for("time_to_next_state"), tTimeLeft);
    return 1;
  }

  handle_player_exited_game_arena(tMsg) {
    const tConn = tMsg.connection;
    const tRoomIndex = tConn.GetIntFrom();
    const tActiveMode = this.getComponent().getActiveIGComponentId();
    const tGameDataService = this.getComponent().getIGComponent("GameData");
    if (tGameDataService == 0) {
      return error(this, "Game data IGComponent not found.", Symbol.for("handle_game_ending"));
    }
    switch (tActiveMode) {
      case "PreGame":
        this.getComponent().displayIGComponentEvent(tActiveMode, Symbol.for("user_left_game"), tRoomIndex);
        break;
      case "AfterGame":
        const tPlayerId = tGameDataService.getPlayerIdByRoomIndex(tRoomIndex);
        this.getComponent().displayIGComponentEvent(tActiveMode, Symbol.for("user_left_game"), tPlayerId);
        break;
    }
    const tPlayerId2 = tGameDataService.getPlayerIdByRoomIndex(tRoomIndex);
    if (tPlayerId2 != -1) {
      executeMessage(Symbol.for("gamesystem_sendevent"), Symbol.for("remove_game_object"), propList("id", tPlayerId2));
    }
    executeMessage(Symbol.for("ig_user_left_game"), tRoomIndex);
    return 1;
  }

  handle_level_hall_of_fame(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    tdata.setaProp(Symbol.for("id"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("name"), tConn.GetStrFrom());
    const tNumTopLevelScores = tConn.GetIntFrom();
    const tList = list();
    for (let i = 1; i <= tNumTopLevelScores; i++) {
      const tPlayer = propList();
      tPlayer.setaProp(Symbol.for("name"), tConn.GetStrFrom());
      tPlayer.setaProp(Symbol.for("score"), tConn.GetIntFrom());
      tList.append(tPlayer);
    }
    tdata.setaProp(Symbol.for("top_level_scores"), tList);
    const tNumLevelTeamScores = tConn.GetIntFrom();
    const tList2 = list();
    for (let i = 1; i <= tNumLevelTeamScores; i++) {
      const tItem = propList();
      tItem.setaProp(Symbol.for("score"), tConn.GetIntFrom());
      const tNumPlayers = tConn.GetIntFrom();
      const tPlayers = list();
      for (let j = 1; j <= tNumPlayers; j++) {
        tPlayers.append(tConn.GetStrFrom());
      }
      tItem.setaProp(Symbol.for("players"), tPlayers);
      tList2.append(tItem);
    }
    tdata.setaProp(Symbol.for("level_team_scores"), tList2);
    tdata.setaProp(Symbol.for("score_data_pending"), 0);
    const tService = this.getComponent().getIGComponent("LevelList");
    if (tService == 0) {
      return 0;
    }
    return tService.updateEntry(tdata);
  }

  handle_start_failed(tMsg) {
    const tConn = tMsg.connection;
    const tCode = tConn.GetIntFrom();
    this.getInterface().showBasicAlert(`ig_error_start_failed_${tCode}`);
    return 1;
  }

  handle_join_failed(tMsg) {
    const tConn = tMsg.connection;
    const tCode = tConn.GetIntFrom();
    this.getInterface().showBasicAlert(`ig_error_join_failed_${tCode}`);
    const tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    tService.storeJoinedGameInstance(0);
    return 1;
  }

  handle_in_arena_queue(tMsg) {
    this.getComponent().removeIGComponent("JoinedGame");
    this.getComponent().setSystemState(Symbol.for("pre_game"));
    this.getInterface().resetToDefaultAndHide();
    const tConn = tMsg.connection;
    const tQueuePos = tConn.GetIntFrom();
    return this.getInterface().showArenaQueue(tQueuePos);
  }

  handle_stage_still_loading(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    tdata.setaProp(Symbol.for("progress"), tConn.GetIntFrom());
    const tFinishedPlayers = list();
    const tNumItems = tConn.GetIntFrom();
    for (let i = 1; i <= tNumItems; i++) {
      tFinishedPlayers.append(tConn.GetIntFrom());
    }
    tdata.setaProp(Symbol.for("finished_players"), tFinishedPlayers);
    this.getComponent().displayIGComponentEvent("PreGame", Symbol.for("still_loading"), tdata);
    return 1;
  }

  handle_game_not_found(tMsg) {
    const tConn = tMsg.connection;
    const tGameId = tConn.GetIntFrom();
    const tObserving = tConn.GetIntFrom();
    if (!tObserving && (this.getComponent().getSystemState() == Symbol.for("ready"))) {
      error(this, `Game not found, id: ${tGameId}`, Symbol.for("handle_game_not_found"));
      this.getInterface().showBasicAlert("ig_error_game_deleted");
    }
    const tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    return tService.removeGameInstance(tGameId);
  }

  handle_game_chat(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    tdata.setaProp(Symbol.for("id"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("message"), tConn.GetStrFrom());
    const tService = this.getComponent().getIGComponent("GameChat");
    if (tService == 0) {
      return 0;
    }
    return tService.executeGameChat(tdata);
  }

  handle_enter_arena(tMsg) {
    const tConn = tMsg.connection;
    this.getComponent().removeIGComponent("JoinedGame");
    this.getComponent().removeIGComponent("ArenaQueue");
    const tdata = propList();
    tdata.setaProp(Symbol.for("game_type"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("level_id"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("number_of_teams"), tConn.GetIntFrom());
    executeMessage(Symbol.for("sendTrackingPoint"), `/game/started/${tdata.getaProp(Symbol.for("game_type"))}/${tdata.getaProp(Symbol.for("level_id"))}`);
    const tUserCount = tConn.GetIntFrom();
    const tTeamList = propList();
    for (let i = 1; i <= tUserCount; i++) {
      const tuser = propList();
      const tID = tConn.GetIntFrom();
      tuser.setaProp(Symbol.for("id"), tID);
      tuser.setaProp(Symbol.for("name"), tConn.GetStrFrom());
      tuser.setaProp(Symbol.for("figure"), tConn.GetStrFrom());
      tuser.setaProp(Symbol.for("sex"), tConn.GetStrFrom());
      const tTeamId = tConn.GetIntFrom();
      tuser.setaProp(Symbol.for("team_id"), tTeamId);
      if (tTeamList.findPos(tTeamId) == 0) {
        tTeamList.setaProp(tTeamId, [Symbol.for("players"), propList()]);
      }
      const tTeam = tTeamList.getaProp(tTeamId).getaProp(Symbol.for("players"));
      tTeam.setaProp(tID, tuser);
      executeMessage(Symbol.for("ig_store_gameplayer_info"), tdata);
    }
    tdata.setaProp(Symbol.for("teams"), tTeamList);
    this.getComponent().setSystemState(Symbol.for("enter_arena"));
    executeMessage(Symbol.for("changeRoom"));
    const tConnection = getConnection(Symbol.for("Info"));
    if (tConnection != 0) {
      tConnection.send("QUIT");
    }
    if (threadExists(Symbol.for("entry"))) {
      getThread(Symbol.for("entry")).getComponent().leaveEntry();
    }
    getObject(Symbol.for("session")).set("lastroom", EMPTY);
    executeMessage(Symbol.for("hide_navigator"));
    executeMessage(Symbol.for("ig_clear_game_info"));
    executeMessage(Symbol.for("ig_store_game_info"), tdata);
    this.getComponent().setSystemState(Symbol.for("pre_game"));
    this.getComponent().displayIGComponentEvent("PreGame", Symbol.for("pre_game"), tdata, 1);
    const tService = this.getComponent().getIGComponent("BottomBar");
    if (tService == 0) {
      return 0;
    }
    tService.setActiveFlag(1);
    tService.displayEvent(Symbol.for("stage_starting"), tdata);
    return 1;
  }

  handle_arena_entered(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    this.parse_player(tdata, tConn);
    tdata.setaProp(Symbol.for("team_id"), tConn.GetIntFrom());
    this.getComponent().displayIGComponentEvent("PreGame", Symbol.for("arena_entered"), tdata);
    return 1;
  }

  handle_load_stage(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    tdata.addProp(Symbol.for("game_type"), tConn.GetIntFrom());
    const tService = this.getComponent().getIGComponent("GameAssetImport");
    if (tService == 0) {
      return 0;
    }
    return tService.startCastDownload(tdata);
  }

  handle_stage_starting(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    tdata.setaProp(Symbol.for("game_type"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("room_marker"), tConn.GetStrFrom());
    tdata.setaProp(Symbol.for("state"), Symbol.for("created"));
    const tTypeService = this.getComponent().getIGComponent("GameTypes");
    if (tTypeService == 0) {
      return 0;
    }
    tdata.setaProp(Symbol.for("room_program_class"), tTypeService.getAction(tdata.getaProp(Symbol.for("game_type")), Symbol.for("get_room_class")));
    tdata.setaProp(Symbol.for("time_to_stage_running"), tConn.GetIntFrom());
    const tService = this.getComponent().getIGComponent("RoomLoader");
    if (tService == 0) {
      return 0;
    }
    tService.constructArena(tdata, tMsg);
    executeMessage(Symbol.for("ig_store_game_info"), tdata);
    this.getComponent().displayIGComponentEvent("PreGame", Symbol.for("stage_starting"), tdata);
    return 1;
  }

  handle_stage_running(tMsg) {
    const tConn = tMsg.connection;
    this.getComponent().removeIGComponent("GameAssetImport");
    this.getComponent().removeIGComponent("RoomLoader");
    this.getComponent().removeIGComponent("PreGame");
    const tdata = propList();
    tdata.addProp(Symbol.for("state"), Symbol.for("started"));
    const tTimer = tConn.GetIntFrom();
    tdata.addProp(Symbol.for("state_duration"), tTimer);
    tdata.addProp(Symbol.for("time_to_next_state"), tTimer);
    tdata.addProp(Symbol.for("time_until_game_end"), tTimer);
    let tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    tService.storeJoinedGameInstance(0);
    this.getComponent().setSystemState(Symbol.for("in_game"));
    this.getInterface().resetToDefaultAndHide();
    executeMessage(Symbol.for("gamesystem_sendevent"), Symbol.for("gamestart"), tdata);
    tService = this.getComponent().getIGComponent("BottomBar");
    if (tService == 0) {
      return 0;
    }
    tService.setActiveFlag(1);
    tService.displayEvent(Symbol.for("stage_running"), tdata);
    return 1;
  }

  handle_stage_ending(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    tdata.setaProp(Symbol.for("time_to_next_state"), tConn.GetIntFrom());
    executeMessage(Symbol.for("gamesystem_sendevent"), Symbol.for("gameend"), tdata);
    return 1;
  }

  handle_game_ending(tMsg) {
    const tConn = tMsg.connection;
    put("* received game_ending");
    const tGameDataService = this.getComponent().getIGComponent("GameData");
    if (tGameDataService == 0) {
      return error(this, "Game data IGComponent not found.", Symbol.for("handle_game_ending"));
    }
    const tGameType = tGameDataService.getProperty(Symbol.for("game_type"));
    const tLevelId = tGameDataService.getProperty(Symbol.for("level_id"));
    executeMessage(Symbol.for("sendTrackingPoint"), `/game/ended/${tGameType}/${tLevelId}`);
    const tdata = propList();
    tdata.setaProp(Symbol.for("time_to_next_state"), tConn.GetIntFrom());
    let tMaxNumPlayers = 0;
    const tNumTeams = tConn.GetIntFrom();
    const tTeams = propList();
    for (let i = 1; i <= tNumTeams; i++) {
      const tTeam = propList();
      tTeam.setaProp(Symbol.for("id"), tConn.GetIntFrom());
      tTeam.setaProp(Symbol.for("pos"), i);
      tTeam.setaProp(Symbol.for("score"), tConn.GetIntFrom());
      tTeam.setaProp(Symbol.for("is_highscore"), tConn.GetIntFrom());
      const tPlayers = propList();
      const tNumPlayers = tConn.GetIntFrom();
      if (tNumPlayers > tMaxNumPlayers) {
        tMaxNumPlayers = tNumPlayers;
      }
      for (let j = 1; j <= tNumPlayers; j++) {
        const tPlayer = propList();
        tPlayer.setaProp(Symbol.for("room_index"), tConn.GetIntFrom());
        tPlayer.setaProp(Symbol.for("pos"), j);
        tPlayer.setaProp(Symbol.for("team_id"), tTeam.getaProp(Symbol.for("id")));
        tPlayer.setaProp(Symbol.for("team_pos"), i);
        tPlayer.setaProp(Symbol.for("score"), tConn.GetIntFrom());
        tPlayer.setaProp(Symbol.for("is_highscore"), tConn.GetIntFrom());
        tPlayer.setaProp(Symbol.for("xp_gained"), tConn.GetIntFrom());
        tPlayer.setaProp(Symbol.for("xp_today"), tConn.GetIntFrom());
        tPlayer.setaProp(Symbol.for("xp_month"), tConn.GetIntFrom());
        tPlayer.setaProp(Symbol.for("xp_total"), tConn.GetIntFrom());
        const tPlayerInfo = tGameDataService.getPlayerInfoByRoomIndex(tPlayer.getaProp(Symbol.for("room_index")));
        const tKeyList = list(Symbol.for("id"), Symbol.for("figure"), Symbol.for("sex"), Symbol.for("class"), Symbol.for("name"), Symbol.for("disconnected"));
        if (tPlayerInfo != 0) {
          for (const tKey of tKeyList) {
            tPlayer.setaProp(tKey, tPlayerInfo.getaProp(tKey));
          }
        }
        tPlayers.setaProp(tPlayer.getaProp(Symbol.for("id")), tPlayer);
      }
      tTeam.setaProp(Symbol.for("players"), tPlayers);
      tTeams.setaProp(tTeam.getaProp(Symbol.for("id")), tTeam);
    }
    tdata.setaProp(Symbol.for("teams"), tTeams);
    tdata.setaProp(Symbol.for("number_of_teams"), tNumTeams);
    const tNumTopLevelScores = tConn.GetIntFrom();
    const tList = list();
    for (let i = 1; i <= tNumTopLevelScores; i++) {
      const tPlayer = propList();
      tPlayer.setaProp(Symbol.for("name"), tConn.GetStrFrom());
      tPlayer.setaProp(Symbol.for("score"), tConn.GetIntFrom());
      tPlayer.setaProp(Symbol.for("room_index"), tConn.GetIntFrom());
      tList.append(tPlayer);
    }
    tdata.setaProp(Symbol.for("top_level_scores"), tList);
    const tNumLevelTeamScores = tConn.GetIntFrom();
    const tList2 = list();
    for (let i = 1; i <= tNumLevelTeamScores; i++) {
      const tItem = propList();
      tItem.setaProp(Symbol.for("score"), tConn.GetIntFrom());
      tItem.setaProp(Symbol.for("id"), tConn.GetIntFrom());
      const tNumPlayers = tConn.GetIntFrom();
      const tPlayers = list();
      for (let j = 1; j <= tNumPlayers; j++) {
        tPlayers.append(tConn.GetStrFrom());
      }
      tItem.setaProp(Symbol.for("players"), tPlayers);
      tList2.append(tItem);
    }
    tdata.setaProp(Symbol.for("level_team_scores"), tList2);
    this.getComponent().displayIGComponentEvent("AfterGame", Symbol.for("after_game"), tdata, 1);
    const tService = this.getComponent().getIGComponent("BottomBar");
    if (tService == 0) {
      return 0;
    }
    tService.setActiveFlag(1);
    tService.displayEvent(Symbol.for("game_ending"), tdata);
    return 1;
  }

  handle_game_created(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    this.parse_game_long_data(tdata, tConn);
    const tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    tService.storeJoinedGameInstance(tdata);
    this.send_ROOM_GAME_STATUS(1, tdata.getaProp(Symbol.for("id")), tdata.getaProp(Symbol.for("game_type")));
    const tSystemState = this.getComponent().getSystemState();
    if (tSystemState == Symbol.for("ready")) {
      this.getInterface().showWindow("JoinedGame");
    } else {
      if (tSystemState == Symbol.for("after_game")) {
        this.getInterface().showWindow("AfterGame", Symbol.for("rejoin"));
      }
    }
    return 1;
  }

  handle_game_long_data(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    this.parse_game_long_data(tdata, tConn);
    const tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    tService.storeGameInstance(tdata);
    return 1;
  }

  handle_create_game_info(tMsg) {
    const tConn = tMsg.connection;
    let tService = this.getComponent().getIGComponent("GameTypes");
    if (tService == 0) {
      return 0;
    }
    const tLevels = list();
    const tNumLevels = tConn.GetIntFrom();
    for (let i = 1; i <= tNumLevels; i++) {
      const tItem = propList();
      tItem.addProp(Symbol.for("id"), tConn.GetStrFrom());
      tItem.addProp(Symbol.for("level_name"), tConn.GetStrFrom());
      tItem.addProp(Symbol.for("game_type"), tConn.GetIntFrom());
      tItem.addProp(Symbol.for("field_type"), tConn.GetIntFrom());
      tService.getAction(tItem.getaProp(Symbol.for("game_type")), Symbol.for("parse_create_game_info"), tItem, tConn);
      tLevels.add(tItem);
    }
    this.getComponent().removeIGComponent("GameTypes");
    tService = this.getComponent().getIGComponent("LevelList");
    if (tService == 0) {
      return 0;
    }
    return tService.storeLevelListInfo(tLevels);
  }

  handle_game_list(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    const tInstanceCount = tConn.GetIntFrom();
    tdata.setaProp(Symbol.for("instance_count"), tInstanceCount);
    const tInstanceList = list();
    for (let i = 1; i <= tInstanceCount; i++) {
      const tInstance = propList();
      this.parse_game_short_data(tInstance, tConn);
      tInstanceList.append(tInstance);
    }
    tdata.addProp(Symbol.for("list"), tInstanceList);
    const tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    return tService.storeGameList(tdata);
  }

  parse_game_short_data(tdata, tConn) {
    tdata.setaProp(Symbol.for("id"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("level_name"), tConn.GetStrFrom());
    tdata.setaProp(Symbol.for("game_type"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("field_type"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("number_of_teams"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("player_count"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("player_max_count"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("owner_name"), tConn.GetStrFrom());
    const tTypeService = this.getComponent().getIGComponent("GameTypes");
    if (tTypeService == 0) {
      return 0;
    }
    tdata.setaProp(Symbol.for("game_type_icon"), tTypeService.getAction(tdata.getaProp(Symbol.for("game_type")), Symbol.for("get_icon_image")));
    tTypeService.getAction(tdata.getaProp(Symbol.for("game_type")), Symbol.for("parse_short_data"), tdata, tConn);
    return tdata;
  }

  parse_game_long_data(tdata, tConn) {
    this.parse_game_short_data(tdata, tConn);
    tdata.setaProp(Symbol.for("level_id"), tConn.GetIntFrom());
    const tTeamCount = tConn.GetIntFrom();
    const tAllTeamData = propList();
    tdata.setaProp(Symbol.for("number_of_teams"), tTeamCount);
    for (let tTeamIndex = 1; tTeamIndex <= tTeamCount; tTeamIndex++) {
      const tTeamInfo = propList();
      const tPlayerList = propList();
      const tPlayerCount = tConn.GetIntFrom();
      for (let j = 1; j <= tPlayerCount; j++) {
        const tPlayerInfo = [Symbol.for("team_id"), tTeamIndex];
        this.parse_player(tPlayerInfo, tConn);
        tPlayerList.setaProp(tPlayerInfo.getaProp(Symbol.for("id")), tPlayerInfo);
      }
      tTeamInfo.setaProp(Symbol.for("players"), tPlayerList);
      tAllTeamData.setaProp(tTeamIndex, tTeamInfo);
    }
    tdata.setaProp(Symbol.for("teams"), tAllTeamData);
    this.parse_required_players(tdata, tConn);
    const tTypeService = this.getComponent().getIGComponent("GameTypes");
    if (tTypeService == 0) {
      return 0;
    }
    tTypeService.getAction(tdata.getaProp(Symbol.for("game_type")), Symbol.for("parse_long_data"), tdata, tConn);
    return tdata;
  }

  parse_required_players(tdata, tConn) {
    const tInvalidTeamCount = tConn.GetIntFrom();
    const tList = propList();
    for (let i = 1; i <= tInvalidTeamCount; i++) {
      const tTeamId = tConn.GetIntFrom();
      const tNumNeeded = tConn.GetIntFrom();
      tList.setaProp(tTeamId, tNumNeeded);
    }
    tdata.setaProp(Symbol.for("players_required"), tList);
    return tdata;
  }

  handle_user_joined_game(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    tdata.setaProp(Symbol.for("game_id"), tConn.GetIntFrom());
    this.parse_player(tdata, tConn);
    tdata.setaProp(Symbol.for("team_id"), tConn.GetIntFrom());
    this.parse_required_players(tdata, tConn);
    const tGameId = tdata.getaProp(Symbol.for("game_id"));
    const tSystemState = this.getComponent().getSystemState();
    const tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    tService.addUserToGame(tdata);
    if (tGameId == tService.getJoinedGameId()) {
      const tJoinedGame = tService.getJoinedGame();
      if (tJoinedGame == 0) {
        return 0;
      }
      if (tJoinedGame.getOwnPlayerId() == tdata.getaProp(Symbol.for("id"))) {
        this.getComponent().removeIGComponent("Prejoin");
        this.send_ROOM_GAME_STATUS(1, tGameId, tJoinedGame.getProperty(Symbol.for("game_type")));
        if (tSystemState == Symbol.for("ready")) {
          this.getInterface().showWindow("JoinedGame");
        } else {
          if (tSystemState == Symbol.for("after_game")) {
            this.getInterface().showWindow("AfterGame", Symbol.for("rejoin"));
          }
        }
      }
    }
    if (tSystemState == Symbol.for("after_game")) {
      this.getComponent().displayIGComponentEvent("AfterGame", Symbol.for("user_joined_game"), tdata);
    }
  }

  parse_player(tdata, tConn) {
    if (tdata == VOID) {
      tdata = propList();
    }
    tdata.setaProp(Symbol.for("id"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("name"), tConn.GetStrFrom());
    tdata.setaProp(Symbol.for("figure"), tConn.GetStrFrom());
    tdata.setaProp(Symbol.for("sex"), tConn.GetStrFrom());
    return tdata;
  }

  handle_user_left_game(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    tdata.setaProp(Symbol.for("game_id"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("id"), tConn.GetIntFrom());
    tdata.setaProp(Symbol.for("was_kicked"), tConn.GetIntFrom());
    this.parse_required_players(tdata, tConn);
    const tGameId = tdata.getaProp(Symbol.for("game_id"));
    const tPlayerId = tdata.getaProp(Symbol.for("id"));
    const tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    tService.removeUserFromGame(tdata);
    return 1;
  }

  handle_game_observation_started_short(tMsg) {
    const tConn = tMsg.connection;
    const tdata = propList();
    this.parse_game_short_data(tdata, tConn);
    const tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    return tService.storeGameInstance(tdata);
  }

  handle_game_cancelled(tMsg) {
    const tConn = tMsg.connection;
    const tGameId = tConn.GetIntFrom();
    const tReasonCode = tConn.GetIntFrom();
    const tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    if (tGameId == tService.getJoinedGameId()) {
      this.getComponent().removeIGComponent("JoinedGame");
    }
    if (tGameId == tService.getObservedGameId()) {
      this.getComponent().removeIGComponent("Prejoin");
    }
    return tService.removeGameInstance(tGameId);
  }

  handle_game_started(tMsg) {
    const tConn = tMsg.connection;
    const tGameId = tConn.GetIntFrom();
    const tService = this.getComponent().getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    if (tGameId == tService.getJoinedGameId()) {
      this.getInterface().resetToDefaultAndHide();
      this.getComponent().setSystemState(Symbol.for("enter_arena"));
    }
    return tService.removeGameInstance(tGameId);
  }

  getOwnPlayerName() {
    const tSession = getObject(Symbol.for("session"));
    if (tSession == 0) {
      return 0;
    }
    return tSession.GET(Symbol.for("user_name"));
  }

  getGameConnection() {
    return getConnection(Symbol.for("Info"));
  }

  regMsgList(tBool) {
    const tMsgs = propList();
    tMsgs.setaProp(387, Symbol.for("handle_directory_status"));
    tMsgs.setaProp(388, Symbol.for("handle_ENTER_ARENA_FAILED"));
    tMsgs.setaProp(389, Symbol.for("handle_GAME_REJOIN"));
    tMsgs.setaProp(390, Symbol.for("handle_player_exited_game_arena"));
    tMsgs.setaProp(391, Symbol.for("handle_level_hall_of_fame"));
    tMsgs.setaProp(392, Symbol.for("handle_start_failed"));
    tMsgs.setaProp(393, Symbol.for("handle_join_failed"));
    tMsgs.setaProp(394, Symbol.for("handle_in_arena_queue"));
    tMsgs.setaProp(395, Symbol.for("handle_stage_still_loading"));
    tMsgs.setaProp(396, Symbol.for("handle_game_not_found"));
    tMsgs.setaProp(399, Symbol.for("handle_game_chat"));
    tMsgs.setaProp(400, Symbol.for("handle_enter_arena"));
    tMsgs.setaProp(401, Symbol.for("handle_arena_entered"));
    tMsgs.setaProp(402, Symbol.for("handle_load_stage"));
    tMsgs.setaProp(403, Symbol.for("handle_stage_starting"));
    tMsgs.setaProp(404, Symbol.for("handle_stage_running"));
    tMsgs.setaProp(405, Symbol.for("handle_stage_ending"));
    tMsgs.setaProp(406, Symbol.for("handle_game_ending"));
    tMsgs.setaProp(407, Symbol.for("handle_game_created"));
    tMsgs.setaProp(408, Symbol.for("handle_game_long_data"));
    tMsgs.setaProp(409, Symbol.for("handle_create_game_info"));
    tMsgs.setaProp(410, Symbol.for("handle_game_list"));
    tMsgs.setaProp(413, Symbol.for("handle_user_joined_game"));
    tMsgs.setaProp(414, Symbol.for("handle_user_left_game"));
    tMsgs.setaProp(415, Symbol.for("handle_game_observation_started_short"));
    tMsgs.setaProp(416, Symbol.for("handle_game_cancelled"));
    tMsgs.setaProp(417, Symbol.for("handle_game_long_data"));
    tMsgs.setaProp(418, Symbol.for("handle_game_started"));
    const tCmds = propList();
    tCmds.setaProp("IG_CHECK_DIRECTORY_STATUS", 288);
    tCmds.setaProp("IG_ROOM_GAME_STATUS", 289);
    tCmds.setaProp("IG_PLAY_AGAIN", 290);
    tCmds.setaProp("GAME_CHAT", 298);
    tCmds.setaProp("IG_CREATE_GAME", 300);
    tCmds.setaProp("IG_GET_GAME_LIST", 301);
    tCmds.setaProp("IG_GET_CREATE_GAME_INFO", 302);
    tCmds.setaProp("IG_CHANGE_PARAMETERS", 303);
    tCmds.setaProp("IG_LIST_POSSIBLE_INVITEES", 304);
    tCmds.setaProp("IG_INVITE_USER", 305);
    tCmds.setaProp("IG_KICK_USER", 306);
    tCmds.setaProp("IG_START_GAME", 307);
    tCmds.setaProp("IG_CANCEL_GAME", 308);
    tCmds.setaProp("IG_JOIN_GAME", 309);
    tCmds.setaProp("IG_LEAVE_GAME", 310);
    tCmds.setaProp("IG_START_OBSERVING_GAME", 311);
    tCmds.setaProp("IG_STOP_OBSERVING_GAME", 312);
    tCmds.setaProp("IG_GET_LEVEL_HALL_OF_FAME", 291);
    tCmds.setaProp("IG_ACCEPT_INVITE_REQUEST", 292);
    tCmds.setaProp("IG_DECLINE_INVITE_REQUEST", 293);
    tCmds.setaProp("IG_LOAD_STAGE_READY", 295);
    tCmds.setaProp("MSG_PLAYER_INPUT", 296);
    tCmds.setaProp("IG_EXIT_GAME", 299);
    if (tBool) {
      registerListener(getVariable("connection.room.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.room.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.room.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.room.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
