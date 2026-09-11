export default class {
  addWindows() {
    this.pWindowID = "a";
    const tService = this.getIGComponent("AfterGame");
    if (tService == 0) {
      return 0;
    }
    const tGameRef = tService.getScoreData();
    if (tGameRef == 0) {
      return 0;
    }
    const tTeamMaxSize = tGameRef.getTeamMaxSize();
    const tTeamCount = tGameRef.getTeamCount();
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.moveTo(4, 2);
    let tScrollStartOffset = -100;
    for (let tTeamPos = 1; tTeamPos <= tTeamCount; tTeamPos++) {
      tWrapObjRef.addOneWindow(this.getWindowId(tTeamPos), `ig_ag_score_plrs_${tTeamMaxSize}.window`, this.pWindowSetId, propList("scrollFromLocX", tScrollStartOffset, "spaceBottom", 2));
      tScrollStartOffset = tScrollStartOffset - 50;
    }
    tWrapObjRef.render();
    const tTeams = tGameRef.getAllTeamData();
    if (!listp(tTeams)) {
      return 0;
    }
    const tTeamMaxSize2 = tGameRef.getTeamMaxSize();
    const tTeamCount2 = tTeams.count;
    for (let tTeamPos = 1; tTeamPos <= tTeamCount2; tTeamPos++) {
      const tWndID = this.getWindowId(tTeamPos);
      const tTeam = tTeams[tTeamPos];
      const tTeamId = tTeam.getaProp(Symbol.for("id"));
      const tTeamPlayers = tTeam.getaProp(Symbol.for("players"));
      if (tGameRef.hasTeamScores()) {
        this.setScoreWindowIcon(tWndID, tTeamPos);
        this.setTeamColorBackground(tWndID, tTeamId);
        this.setTeamScore(tWndID, tTeamId, tTeam.getaProp(Symbol.for("score")));
        this.setTeamFlags(tWndID, tTeam, tTeamId, tGameRef);
      }
      for (let tPlayerPos = 1; tPlayerPos <= tTeamPlayers.count; tPlayerPos++) {
        const tPlayer = tTeamPlayers[tPlayerPos];
        this.setScoreWindowPlayer(tTeamPos, tPlayerPos, tPlayer);
        this.setPlayerFlags(tWndID, tPlayerPos, tTeamId, tPlayer, tGameRef);
      }
      for (let tPlayerPos = tTeamPlayers.count + 1; tPlayerPos <= tTeamMaxSize2; tPlayerPos++) {
        this.setScoreWindowPlayer(tTeamPos, tPlayerPos, 0, 0);
        this.setPlayerFlags(tWndID, tPlayerPos, tTeamId, 0);
      }
    }
  }

  displayPlayerLeft(tTeamId, tPlayerPos) {
    this.setPlayerFlags(this.getWindowId(tTeamId), tPlayerPos, tTeamId);
    const tWndObj = getWindow(this.getWindowId(tTeamId));
    if (tWndObj == 0) {
      return 0;
    }
    let tElem = tWndObj.getElement(`ig_icon_player_${tPlayerPos}`);
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
    tElem.moveBy((tElem.getProperty(Symbol.for("width")) - tImage.width) / 2, (tElem.getProperty(Symbol.for("height")) - tImage.height) / 2);
    tElem = tWndObj.getElement(`info_rejoined_${tPlayerPos}`);
    if (tElem == 0) {
      return 0;
    }
    tElem.hide();
    return 1;
  }

  displayPlayerRejoined(tTeamPos, tPlayerPos) {
    const tWndObj = getWindow(this.getWindowId(tTeamPos));
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement(`info_rejoined_${tPlayerPos}`);
    if (tElem == 0) {
      return 0;
    }
    const tMemNum = getmemnum("ig_icon_rejoined");
    if (tMemNum == 0) {
      return 0;
    }
    const tImage = member(tMemNum).image;
    tElem.feedImage(tImage);
    tElem.moveBy((tElem.getProperty(Symbol.for("width")) - tImage.width) / 2, (tElem.getProperty(Symbol.for("height")) - tImage.height) / 2);
    return 1;
  }

  setPlayerFlags(tWndID, tPlayerPos, tTeamId, tItemInfo, tGameRef) {
    const tID = `${this.getBasicFlagId()}_p_${tTeamId}_${tPlayerPos}`;
    if (this.existsFlagObject(tID)) {
      return 1;
    }
    if (!listp(tItemInfo)) {
      return 0;
    }
    if (tItemInfo.getaProp(Symbol.for("disconnected"))) {
      return 1;
    }
    const tElemID = `ig_score_player_${tPlayerPos}`;
    const tColorDark = this.getTeamColorDark(tTeamId);
    let tFlagType;
    if (tGameRef != 0) {
      const tHiScore = tItemInfo.getaProp(Symbol.for("is_highscore"));
      if (tHiScore == 1) {
        tFlagType = "AfterGameHighscore";
        tItemInfo = tItemInfo.duplicate();
        tItemInfo.setaProp(Symbol.for("top_level_scores"), tGameRef.getProperty(Symbol.for("top_level_scores")));
      } else {
        if (tItemInfo.getaProp(Symbol.for("name")) == this.getOwnPlayerName()) {
          tFlagType = "AfterGameXP";
        } else {
          return 1;
        }
      }
    }
    this.setInfoFlag(tID, tWndID, tElemID, tFlagType, tColorDark, tItemInfo);
  }

  setTeamFlags(tWndID, tItemInfo, tTeamId, tGameRef) {
    const tID = `${this.getBasicFlagId()}_t_${tTeamId}`;
    this.removeFlagObject(tID);
    const tElemID = "ig_score_team";
    if (tItemInfo != 0) {
      const tHiScore = tItemInfo.getaProp(Symbol.for("is_highscore"));
      let tFlagType;
      if (tHiScore == 1) {
        tFlagType = "AfterGameTeamHighscore";
        tItemInfo.setaProp(Symbol.for("level_team_scores"), tGameRef.getProperty(Symbol.for("level_team_scores")));
        tItemInfo.setaProp(Symbol.for("this_team_id"), tTeamId);
      } else {
        return 1;
      }
      const tColorDark = this.getTeamColorDark(tTeamId);
      this.setInfoFlag(tID, tWndID, tElemID, tFlagType, tColorDark, tItemInfo);
    }
  }

  setTeamScore(tWndID, tTeamIndex, tScore) {
    const tWndObj = getWindow(tWndID);
    if (tWndObj == 0) {
      return 0;
    }
    let tElem = tWndObj.getElement("ig_name_team");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(getText(`ig_teamname_${tTeamIndex}`));
    tElem = tWndObj.getElement("ig_score_team");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(tScore);
    return 1;
  }

  setScoreWindowPlayer(tTeamPos, tPlayerPos, tPlayerInfo, tPlayerActive) {
    const tWndID = this.getWindowId(tTeamPos);
    let tOwnUser;
    if (tPlayerInfo != 0) {
      tOwnUser = tPlayerInfo.getaProp(Symbol.for("name")) == this.getOwnPlayerName();
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
      if (!tPlayerInfo.getaProp(Symbol.for("disconnected")) && (tPlayerInfo.findPos(Symbol.for("figure")) > 0)) {
        tImage = this.getHeadImage(tPlayerInfo.getaProp(Symbol.for("figure")), tPlayerInfo.getaProp(Symbol.for("sex")), 18, 18);
      } else {
        this.displayPlayerLeft(tTeamPos, tPlayerPos);
      }
      if (tImage != 0) {
        tElem.feedImage(tImage);
      }
      if (tPlayerInfo.getaProp(Symbol.for("rejoined"))) {
        this.displayPlayerRejoined(tTeamPos, tPlayerPos);
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
      if (tOwnUser) {
        const tFontStruct = getStructVariable("struct.font.bold");
        tElem.setFont(tFontStruct);
      }
    }
    tElem = tWndObj.getElement(`ig_score_player_${tPlayerPos}`);
    if (tElem == 0) {
      return 0;
    }
    if (tPlayerInfo == 0) {
      tElem.hide();
    } else {
      tElem.show();
      tElem.setText(tPlayerInfo.getaProp(Symbol.for("score")));
      if (tOwnUser) {
        const tFontStruct = getStructVariable("struct.font.bold");
        tElem.setFont(tFontStruct);
      }
    }
    return 1;
  }

  setScoreWindowIcon(tWndID, tTeamPosition) {
    const tWndObj = getWindow(tWndID);
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_icon_medal");
    if (tElem == 0) {
      return 0;
    }
    const tMemNum = getmemnum(`ig_icon_medal_${tTeamPosition}`);
    if (tMemNum == 0) {
      return 0;
    }
    tElem.setProperty(Symbol.for("image"), member(tMemNum).image);
    return 1;
  }
}
