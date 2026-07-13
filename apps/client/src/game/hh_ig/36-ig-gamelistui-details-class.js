export default class {
  render() {
    this.pWindowID = "list_det";
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    const tSetID = `${this.pWindowSetId}_c`;
    if (!tWrapObjRef.existsSet(tSetID)) {
      tWrapObjRef.initSet(tSetID, 2);
    }
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    const tItemRef = tService.getObservedGame();
    let tHasCompleteData = tItemRef != 0;
    if (tHasCompleteData) {
      tHasCompleteData = tItemRef.hasCompleteData();
    }
    if (!tHasCompleteData) {
      tWrapObjRef.addOneWindow(this.getWindowId(), "ig_no_games.window", tSetID);
      tWrapObjRef.addOneWindow(this.getWindowId("btm"), VOID, tSetID);
      tWrapObjRef.addOneWindow(this.getWindowId("spec"), VOID, tSetID);
      tWrapObjRef.addOneWindow(this.getWindowId("hor"), "ig_divider_hor.window", tSetID, propList(Symbol.for("scaleV"), 1));
      tWrapObjRef.addOneWindow(this.getWindowId("btn_j"), "ig_frame_blank2_btm.window", tSetID);
      tWrapObjRef.render();
      return 1;
    }
    const tTeamCount = tItemRef.getTeamCount();
    const tTeamMaxSize = tItemRef.getTeamMaxSize();
    tWrapObjRef.addOneWindow(this.getWindowId(), `ig_tms_plrs_${tTeamCount}_${tTeamMaxSize}.window`, tSetID);
    this.renderTeams(tItemRef);
    tWrapObjRef.addOneWindow(this.getWindowId("btm"), "ig_tms_btm.window", tSetID);
    tWrapObjRef.addOneWindow(this.getWindowId("spec"), VOID, tSetID);
    tWrapObjRef.addOneWindow(this.getWindowId("hor"), "ig_divider_hor.window", tSetID, propList(Symbol.for("scaleV"), 1));
    const tPropList = tItemRef.dump();
    for (let i = 1; i <= tPropList.count; i++) {
      const tKey = tPropList.getPropAt(i);
      const tValue = tPropList[i];
      this.renderProperty(tKey, tValue);
    }
    this.renderButtons();
    tWrapObjRef.render();
    return 1;
  }

  renderProperty(tKey, tValue) {
    switch (tKey) {
      case Symbol.for("game_type_icon"):
        return this.renderType(tValue);
      case Symbol.for("level_name"):
        return this.renderName(tValue);
    }
    return 0;
  }

  renderType(tValue) {
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("info_gamemode");
    if (tElem == 0) {
      return 0;
    }
    if (ilk(tValue) == Symbol.for("image")) {
      tElem.feedImage(tValue);
    }
    return 1;
  }

  renderName(tValue) {
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_level_name");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(tValue);
    return 1;
  }

  renderButtons() {
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    const tSetID = `${this.pWindowSetId}_c`;
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    const tJoinedId = tService.getJoinedGameId();
    const tGameId = tService.getObservedGameId();
    let tLayout;
    if (tGameId == tJoinedId) {
      tLayout = "ig_frame_swap_own.window";
    } else {
      if (tJoinedId > -1) {
        tLayout = "ig_frame_swap.window";
      } else {
        tLayout = "ig_frame_join_btm.window";
      }
    }
    if (!windowExists(this.getWindowId("btn_j"))) {
      tWrapObjRef.addOneWindow(this.getWindowId("btn_j"), tLayout, tSetID);
    } else {
      tWrapObjRef.replaceOneWindow(this.getWindowId("btn_j"), tLayout, 1);
    }
    return 1;
  }

  renderTeams(tGameRef) {
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tTeams = tGameRef.getAllTeamData();
    const tOwnerFlag = tGameRef.checkIfOwnerOfGame();
    const tTeamCount = tGameRef.getTeamCount();
    const tTeamMaxSize = tGameRef.getTeamMaxSize();
    for (let tTeamIndex = 1; tTeamIndex <= tTeamCount; tTeamIndex++) {
      for (let tPlayerIndex = 1; tPlayerIndex <= tTeamMaxSize; tPlayerIndex++) {
        let tPlayerExists = tTeamIndex <= tTeams.count;
        if (tPlayerExists) {
          tPlayerExists = tPlayerIndex <= tTeams[tTeamIndex][Symbol.for("players")].count;
        }
        if (!tPlayerExists) {
          if (tGameRef.checkPlayerRequiredForSlot(tTeamIndex, tPlayerIndex)) {
            this.renderNoPlayer(1, tTeamIndex, tPlayerIndex);
          } else {
            this.renderNoPlayer(0, tTeamIndex, tPlayerIndex);
          }
          continue;
        }
        this.renderPlayer(tTeams[tTeamIndex][Symbol.for("players")][tPlayerIndex], tTeamIndex, tPlayerIndex, tOwnerFlag);
      }
    }
    return 1;
  }

  renderNoPlayer(tRequired, tTeamIndex, tPlayerIndex) {
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tSuffix = `${tTeamIndex}_${tPlayerIndex}`;
    let tElement = tWndObj.getElement(`ig_icon_team_player_${tSuffix}`);
    if (tElement != 0) {
      if (tRequired) {
        tElement.show();
        const tMemNum = getmemnum("ig_icon_player_needed");
        if (tMemNum != 0) {
          let tImage = member(tMemNum).image;
          tImage = this.alignIconImage(tImage, 18, 18);
          tElement.feedImage(tImage);
        }
      } else {
        tElement.hide();
      }
    }
    tElement = tWndObj.getElement(`ig_name_team_player_${tSuffix}`);
    if (tElement != 0) {
      if (tRequired) {
        tElement.setText(getText("ig_player_needed"));
      } else {
        tElement.setText("---");
      }
    }
    tElement = tWndObj.getElement(`ig_kick_team_player_${tSuffix}`);
    if (tElement != 0) {
      tElement.hide();
    }
    return 1;
  }

  renderPlayer(tInfo, tTeamIndex, tPlayerIndex, tOwnerFlag) {
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tSuffix = `${tTeamIndex}_${tPlayerIndex}`;
    let tElement = tWndObj.getElement(`ig_icon_team_player_${tSuffix}`);
    if (tElement == 0) {
      return 1;
    }
    tElement.show();
    const tOwnPlayer = tInfo.getaProp(Symbol.for("name")) == this.getOwnPlayerName();
    const tImage = this.getHeadImage(tInfo.getaProp(Symbol.for("figure")), tInfo.getaProp(Symbol.for("sex")), 18, 18);
    if (tImage.ilk == Symbol.for("image")) {
      tElement.setProperty(Symbol.for("image"), tImage);
    }
    tElement = tWndObj.getElement(`ig_name_team_player_${tSuffix}`);
    if (tElement != 0) {
      if (tOwnPlayer == 1) {
        const tFontStruct = getStructVariable("struct.font.bold");
        tElement.setFont(tFontStruct);
      }
      tElement.setText(tInfo.getProp(Symbol.for("name")));
      tElement.show();
    }
    tElement = tWndObj.getElement(`ig_kick_team_player_${tSuffix}`);
    if (tElement != 0) {
      if (tOwnerFlag || tOwnPlayer) {
        tElement.show();
      } else {
        tElement.hide();
      }
    }
    tElement = tWndObj.getElement(`join_${tTeamIndex}`);
    if (tElement != 0) {
      if (tOwnPlayer) {
        tElement.setProperty(Symbol.for("blend"), 30);
      } else {
        tElement.setProperty(Symbol.for("blend"), 100);
      }
    }
    return 1;
  }
}
