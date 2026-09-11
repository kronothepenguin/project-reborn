export default class {
  pEndTime;
  pAnimFrame;
  pUpdateCounter;
  pCurrentLayout;

  update() {
    this.pUpdateCounter = this.pUpdateCounter + 1;
    if (this.pUpdateCounter < 4) {
      return 1;
    }
    this.pUpdateCounter = 0;
    const tTimeLeft = this.getTimeLeft();
    if (tTimeLeft <= 0) {
      return 1;
    }
    const tWndObj = getWindow(this.getWindowId("top"));
    if (tWndObj == 0) {
      return 0;
    }
    let tElem = tWndObj.getElement("ig_info_status");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(replaceChunks(getText("ig_info_game_start_in_x"), "\x", this.getFormatTime()));
    tElem = tWndObj.getElement("ig_icon_getready");
    if (tElem == 0) {
      return 0;
    }
    this.pAnimFrame = this.pAnimFrame + 1;
    if (this.pAnimFrame > 5) {
      this.pAnimFrame = 0;
    }
    const tMemNum = getmemnum(`ig_icon_loading_${this.pAnimFrame}`);
    if (tMemNum == 0) {
      return 0;
    }
    tElem.setProperty(Symbol.for("image"), member(tMemNum).image);
  }

  addWindows() {
    this.pWindowID = "a";
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    const tGameRef = tService.getJoinedGame();
    if (tGameRef == 0) {
      return 0;
    }
    const tTeamMaxSize = tGameRef.getTeamMaxSize();
    const tTeamCount = tGameRef.getTeamCount();
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.addOneWindow(this.getWindowId("top"), VOID, this.pWindowSetId, propList("spaceBottom", 2));
    let tScrollStartOffset = -100;
    for (let tTeamIndex = 1; tTeamIndex <= tTeamCount; tTeamIndex++) {
      tWrapObjRef.addOneWindow(this.getWindowId(tTeamIndex), `ig_ag_join_plrs_${tTeamMaxSize}.window`, this.pWindowSetId, propList("scrollFromLocX", tScrollStartOffset, "spaceBottom", 2));
      this.setTeamColorBackground(this.getWindowId(tTeamIndex), tTeamIndex);
      tScrollStartOffset = tScrollStartOffset - 50;
    }
    tWrapObjRef.addOneWindow(this.getWindowId("btn"), "ig_ag_leave_game.window", this.pWindowSetId);
    tWrapObjRef.moveTo(4, 10);
    return 1;
  }

  render() {
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    const tGameRef = tService.getJoinedGame();
    if (tGameRef == 0) {
      return 0;
    }
    let tLayout;
    if (this.getTimeLeft() > 0) {
      tLayout = "ig_ag_game_starting.window";
    } else {
      tLayout = "ig_ag_waiting_players.window";
    }
    if (tLayout != this.pCurrentLayout) {
      this.pCurrentLayout = tLayout;
      const tWndObj = getWindow(this.getWindowId("top"));
      if (tWndObj == 0) {
        return 0;
      }
      tWndObj.unmerge();
      tWndObj.merge(this.pCurrentLayout);
      const tWrapObjRef = this.getWindowWrapper();
      if (tWrapObjRef == 0) {
        return 0;
      }
      tWrapObjRef.render();
    }
    const tTeams = tGameRef.getAllTeamData();
    if (!listp(tTeams)) {
      return 0;
    }
    const tTeamMaxSize = tGameRef.getTeamMaxSize();
    const tTeamCount = tTeams.count;
    const tOwnTeamIndex = tGameRef.getOwnPlayerTeam();
    for (let tTeamIndex = 1; tTeamIndex <= tTeamCount; tTeamIndex++) {
      const tWndID = this.getWindowId(tTeamIndex);
      const tTeam = tTeams[tTeamIndex];
      const tTeamPlayers = tTeam.getaProp(Symbol.for("players"));
      for (let tPlayerPos = 1; tPlayerPos <= tTeamPlayers.count; tPlayerPos++) {
        const tPlayer = tTeamPlayers[tPlayerPos];
        this.setScoreWindowPlayer(tWndID, tPlayerPos, tPlayer);
      }
      for (let tPlayerPos = tTeamPlayers.count + 1; tPlayerPos <= tTeamMaxSize; tPlayerPos++) {
        this.setScoreWindowPlayer(tWndID, tPlayerPos, 0, 0);
      }
      this.setJoinButtonState(tTeamIndex, (tTeamIndex != tOwnTeamIndex) && (tTeamPlayers.count < tTeamMaxSize));
    }
  }

  displayPlayerLeft(tTeamId, tPlayerPos) {
    this.setPlayerFlags(this.getWindowId(tTeamId), tPlayerPos, tTeamId);
    const tWndObj = getWindow(this.getWindowId(tTeamId));
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement(`ig_icon_player_${tPlayerPos}`);
    if (tElem == 0) {
      return 0;
    }
    tElem.show();
    const tMemNum = getmemnum("ig_icon_gameleft");
    if (tMemNum == 0) {
      return 0;
    }
    const tImage = member(tMemNum).image;
    tElem.feedImage(tImage);
    return 1;
  }

  displayTimeLeft(tTime) {
    this.pEndTime = (tTime * 1000) + the.milliSeconds;
    this.render();
    return 1;
  }

  setScoreWindowPlayer(tWndID, tPlayerPos, tPlayerInfo, tPlayerActive) {
    let tOwnPlayer;
    if (tPlayerInfo != 0) {
      tOwnPlayer = tPlayerInfo.getaProp(Symbol.for("name")) == this.getOwnPlayerName();
    }
    const tWndObj = getWindow(tWndID);
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
      let tImage;
      if (!tPlayerInfo.getaProp(Symbol.for("disconnected"))) {
        tImage = this.getHeadImage(tPlayerInfo.getaProp(Symbol.for("figure")), tPlayerInfo.getaProp(Symbol.for("sex")), 18, 18);
      } else {
        const tMemNum = getmemnum("ig_icon_gameleft");
        if (tMemNum > 0) {
          tImage = member(tMemNum).image;
        }
      }
      if (tImage != 0) {
        tElem.feedImage(tImage);
      }
    }
    tElem = tWndObj.getElement(`ig_name_player_${tPlayerPos}`);
    if (tElem == 0) {
      return 0;
    }
    if (tPlayerInfo == 0) {
      tElem.setText("---");
    } else {
      tElem.setText(tPlayerInfo.getaProp(Symbol.for("name")));
      let tFontStruct;
      if (tOwnPlayer) {
        tFontStruct = getStructVariable("struct.font.bold");
      } else {
        tFontStruct = getStructVariable("struct.font.plain");
      }
      tElem.setFont(tFontStruct);
    }
    return 1;
  }

  setJoinButtonState(tTeamIndex, tstate) {
    const tWndObj = getWindow(this.getWindowId(tTeamIndex));
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("join.button");
    if (tElem == 0) {
      return 0;
    }
    tElem.setProperty(Symbol.for("blend"), 20 + (tstate * 80));
    if (tstate) {
      tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
    } else {
      tElem.setProperty(Symbol.for("cursor"), 0);
    }
    return 1;
  }

  getFormatTime() {
    const tTimeLeft = integer((this.pEndTime - the.milliSeconds) / 1000.0);
    if (tTimeLeft < 0) {
      return "0:00";
    }
    const tMinutes = tTimeLeft / 60;
    let tSeconds = tTimeLeft % 60;
    if (tSeconds < 10) {
      tSeconds = `0${tSeconds}`;
    }
    return `${tMinutes}:${tSeconds}`;
  }

  getTimeLeft() {
    const tTimeLeft = (this.pEndTime - the.milliSeconds) / 1000.0;
    if (tTimeLeft < 0) {
      return 0;
    }
    return tTimeLeft;
  }
}
