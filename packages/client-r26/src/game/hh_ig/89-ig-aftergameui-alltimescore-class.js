export default class {
  addWindows() {
    this.pWindowID = "ac";
    const tService = this.getIGComponent("AfterGame");
    if (tService == 0) {
      return 0;
    }
    const tGameRef = tService.getScoreData();
    if (tGameRef == 0) {
      return 0;
    }
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.moveTo(4, 2);
    const tOwnTeamId = tGameRef.getOwnPlayerTeam();
    const tOwnTeamInfo = tGameRef.getTeam(tOwnTeamId);
    const tOwnTeamPos = tOwnTeamInfo.getaProp(Symbol.for("pos"));
    const tOwnTeamScore = tOwnTeamInfo.getaProp(Symbol.for("score"));
    const tOwnPlayerInfo = tGameRef.getPlayerById(this.getOwnPlayerGameIndex(), tOwnTeamId);
    tWrapObjRef.addOneWindow(this.getWindowItemId(1), "ig_ag_score_min.window", this.pWindowSetId, propList("scrollFromLocX", -100, "spaceBottom", 2));
    this.setTeamScore(this.getWindowItemId(1), tOwnTeamId, tOwnTeamScore);
    this.setTeamColorBackground(this.getWindowItemId(1), tOwnTeamId);
    this.setScoreWindowIcon(this.getWindowItemId(1), tOwnTeamPos);
    this.setScoreWindowPlayer(this.getWindowItemId(1), 1, tOwnPlayerInfo, 1);
    let tScrollStartOffset = -100;
    if (tGameRef.hasTeamScores()) {
      tWrapObjRef.addOneWindow(this.getWindowItemId(3), "ig_ag_teamhigh_top.window", this.pWindowSetId, propList("scrollFromLocX", -130));
      tWrapObjRef.addOneWindow(this.getWindowItemId(4), "ig_ag_teamhigh_mid.window", this.pWindowSetId, propList("scrollFromLocX", -130));
      tWrapObjRef.addOneWindow(this.getWindowItemId(5), "ig_ag_teamhigh_brk.window", this.pWindowSetId, propList("scrollFromLocX", -130));
      tWrapObjRef.addOneWindow(this.getWindowItemId(6), "ig_ag_teamhigh_mid.window", this.pWindowSetId, propList("scrollFromLocX", -160));
      tWrapObjRef.addOneWindow(this.getWindowItemId(7), "ig_ag_teamhigh_brk.window", this.pWindowSetId, propList("scrollFromLocX", -160));
      tWrapObjRef.addOneWindow(this.getWindowItemId(8), "ig_ag_teamhigh_mid.window", this.pWindowSetId, propList("scrollFromLocX", -190));
      tWrapObjRef.addOneWindow(this.getWindowItemId(9), "ig_ag_teamhigh_btm.window", this.pWindowSetId, propList("scrollFromLocX", -190, "spaceBottom", 2));
      this.showTeamHighScore(tGameRef);
    }
    tWrapObjRef.addOneWindow(this.getWindowItemId(10), "ig_ag_highscores_top.window", this.pWindowSetId, propList("scrollFromLocX", -230));
    tWrapObjRef.addOneWindow(this.getWindowItemId(11), "ig_ag_highscores_btm.window", this.pWindowSetId, propList("scrollFromLocX", -230, "spaceBottom", 2));
    this.showPersonalHighScore(tGameRef);
    return 1;
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

  showTeamHighScore(tGameRef) {
    const tdata = tGameRef.getProperty(Symbol.for("level_team_scores"));
    if (!listp(tdata)) {
      return 0;
    }
    const tOwnTeamId = tGameRef.getOwnPlayerTeam();
    let tCount;
    if (tdata.count < 3) {
      tCount = tdata.count;
    } else {
      tCount = 3;
    }
    for (let i = 1; i <= tCount; i++) {
      const tWndObj = getWindow(this.getWindowItemId(2 + (i * 2)));
      if (tWndObj == 0) {
        return 0;
      }
      const tItem = tdata[i];
      const tPlayers = tItem.getaProp(Symbol.for("players"));
      const tHighlight = tItem.getaProp(Symbol.for("id")) == tOwnTeamId;
      let tFontStruct;
      let tElem = tWndObj.getElement("ig_teamhigh_rank");
      if (tElem == 0) {
        return 0;
      }
      if (tHighlight) {
        tFontStruct = getStructVariable("struct.font.bold");
        tElem.setFont(tFontStruct);
      }
      tElem.setText(`${i}.`);
      tElem = tWndObj.getElement("ig_teamhigh_score");
      if (tElem == 0) {
        return 0;
      }
      if (tHighlight) {
        tElem.setFont(tFontStruct);
      }
      tElem.setText(tItem.getaProp(Symbol.for("score")));
      if (tHighlight) {
        tElem = tWndObj.getElement("ig_teamhigh_teamscore");
        if (tElem == 0) {
          return 0;
        }
        tElem.setFont(tFontStruct);
      }
      let tText = EMPTY;
      let tBreak = 0;
      const tLineCount = 1 + (tPlayers.count / 2);
      for (let j = 1; j <= tPlayers.count; j++) {
        if (tPlayers[j].length > 14) {
          tText = `${tText}${tPlayers[j].char[`1..12`]}...`;
        } else {
          tText = `${tText}${tPlayers[j]}`;
        }
        if (tBreak) {
          tText = `${tText}${RETURN}`;
        } else {
          if (j < tPlayers.count) {
            tText = `${tText}, `;
          }
        }
        tBreak = !tBreak;
      }
      tElem = tWndObj.getElement("ig_teamhigh_team");
      if (tElem == 0) {
        return 0;
      }
      tElem.setText(tText);
      const tFont = tElem.getFont();
      const tLineHeight = tFont.getaProp(Symbol.for("lineHeight"));
      const tHeight = ((tPlayers.count + 1) / 2 * tLineHeight) + 16;
      tWndObj.resizeTo(tWndObj.getProperty(Symbol.for("width")), tHeight);
    }
    return 1;
  }

  showPersonalHighScore(tGameRef) {
    const tWndObj = getWindow(this.getWindowItemId(11));
    const tdata = tGameRef.getProperty(Symbol.for("top_level_scores"));
    if (!listp(tdata)) {
      return 0;
    }
    const tOwnId = this.getOwnPlayerGameIndex();
    let tDataCount = tdata.count;
    if (tDataCount > 5) {
      tDataCount = 5;
    }
    for (let i = 1; i <= tdata.count; i++) {
      const tItem = tdata[i];
      const tOwnUser = tItem.getaProp(Symbol.for("room_index")) == tOwnId;
      let tFontStruct;
      let tElem = tWndObj.getElement(`ig_highscore_rank${i}`);
      if (tElem == 0) {
        return 0;
      }
      if (tOwnUser) {
        tFontStruct = getStructVariable("struct.font.bold");
        tElem.setFont(tFontStruct);
      }
      tElem.setText(`${i}.`);
      tElem = tWndObj.getElement(`ig_highscore_player${i}`);
      if (tElem == 0) {
        return 0;
      }
      if (tOwnUser) {
        tElem.setFont(tFontStruct);
      }
      tElem.setText(tItem.getaProp(Symbol.for("name")));
      tElem = tWndObj.getElement(`ig_highscore_score${i}`);
      if (tElem == 0) {
        return 0;
      }
      if (tOwnUser) {
        tElem.setFont(tFontStruct);
      }
      tElem.setText(tItem.getaProp(Symbol.for("score")));
    }
    return 1;
  }

  setScoreWindowPlayer(tWindowID, tPlayerPos, tPlayerInfo) {
    let tOwnUser;
    if (tPlayerInfo != 0) {
      tOwnUser = tPlayerInfo.getaProp(Symbol.for("room_index")) == this.getOwnPlayerGameIndex();
    }
    const tWndObj = getWindow(tWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    let tElem = tWndObj.getElement("ig_icon_player");
    if (tElem == 0) {
      return 0;
    }
    if (tPlayerInfo == 0) {
      tElem.hide();
    } else {
      tElem.show();
      const tImage = this.getHeadImage(tPlayerInfo.getaProp(Symbol.for("figure")), tPlayerInfo.getaProp(Symbol.for("sex")), 18, 18);
      if (tImage != 0) {
        tElem.feedImage(tImage);
      }
    }
    tElem = tWndObj.getElement("ig_name_player");
    if (tElem == 0) {
      return 0;
    }
    if (tPlayerInfo == 0) {
      tElem.hide();
    } else {
      tElem.show();
      tElem.setText(tPlayerInfo.getaProp(Symbol.for("name")));
      if (tOwnUser) {
        const tFontStruct = getStructVariable("struct.font.bold");
        tElem.setFont(tFontStruct);
      }
    }
    tElem = tWndObj.getElement("ig_score_player");
    if (tElem == 0) {
      return 0;
    }
    if (tPlayerInfo == 0) {
      tElem.hide();
    } else {
      tElem.show();
      tElem.setText(tPlayerInfo.getaProp(Symbol.for("score")));
      if (tOwnUser) {
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

  getOwnPlayerGameIndex() {
    const tSession = getObject(Symbol.for("session"));
    if (tSession == 0) {
      return 0;
    }
    if (!tSession.exists("user_game_index")) {
      return -1;
    }
    const tIndex = tSession.GET("user_game_index");
    return tIndex;
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

  getWindowItemId(tNum) {
    return `${this.getWindowId()}_${tNum}`;
  }
}
