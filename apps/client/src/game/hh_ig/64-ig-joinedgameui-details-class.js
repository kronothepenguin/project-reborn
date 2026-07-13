export default class {
  pOwnerFlag;
  pPreviousLayout;
  pCurrentText;

  addWindows(tView) {
    this.pWindowID = "jg";
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.initSet(this.pWindowSetId, 1);
    tWrapObjRef.addOneWindow(this.getWindowId(), VOID, this.pWindowSetId);
    return 1;
  }

  render(tView) {
    const tListService = this.getIGComponent("GameList");
    if (tListService == 0) {
      return 0;
    }
    const tItemRef = tListService.getJoinedGame();
    if (tItemRef == 0) {
      return 0;
    }
    this.pOwnerFlag = tItemRef.checkIfOwnerOfGame();
    const tTeamCount = tItemRef.getTeamCount();
    const tTeamMaxSize = tItemRef.getTeamMaxSize();
    if (tTeamCount == 0) {
      return 0;
    }
    if (this.pOwnerFlag) {
      var tMode = "std";
    } else {
      var tMode = "jnd";
    }
    if (tView == Symbol.for("change")) {
      var tLayout = "_change_";
    } else {
      var tLayout = "_tms_plrs_";
    }
    tLayout = `ig_${tMode}${tLayout}${tTeamCount}_${tTeamMaxSize}.window`;
    if (this.pPreviousLayout != tLayout) {
      const tWndObj = getWindow(this.getWindowId());
      if (tWndObj == 0) {
        return 0;
      }
      tWndObj.unmerge();
      tWndObj.merge(tLayout);
      this.pPreviousLayout = tLayout;
    }
    this.renderTeams(tItemRef);
    const tPropList = tItemRef.dump();
    for (let i = 1; i <= tPropList.count; i++) {
      const tKey = tPropList.getPropAt(i);
      const tValue = tPropList[i];
      this.renderProperty(tKey, tValue);
    }
    return 1;
  }

  renderProperty(tKey, tValue) {
    switch (tKey) {
      case Symbol.for("players_required"):
        return this.renderCanStart(tValue);
      case Symbol.for("game_type_icon"):
        return this.renderType(tValue);
      case Symbol.for("level_name"):
        return this.renderName(tValue);
    }
    return 0;
  }

  renderCanStart(tValue) {
    let tstate = 1;
    if (!listp(tValue)) {
      tstate = 1;
    }
    if (tValue.count == 0) {
      tstate = 1;
    }
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    let tText;
    if (tstate) {
      tText = getText("ig_info_can_start");
      this.setStartButtonState(this.pOwnerFlag, 1);
    } else {
      tText = getText("ig_info_waiting_for_players");
      this.setStartButtonState(this.pOwnerFlag, 0);
    }
    if (!this.pOwnerFlag) {
      return 1;
    }
    const tElem = tWndObj.getElement("ig_info_startable");
    if (tElem == 0) {
      return 1;
    }
    if (this.pCurrentText == tText) {
      return 1;
    }
    this.pCurrentText = tText;
    if (!writerExists(this.pWriterIdBold)) {
      const tWriter = this.getBoldWriter();
      if (tWriter == 0) {
        return 0;
      }
      const tFont = tWriter.getFont();
      tFont.setaProp(Symbol.for("color"), rgb(255, 255, 255));
      tFont.setaProp(Symbol.for("fontStyle"), list());
      tWriter.setFont(tFont);
    } else {
      const tWriter = this.getBoldWriter();
      if (tWriter == 0) {
        return 0;
      }
    }
    const tTextImage = tWriter.render(tText);
    const tBgImage = member(getmemnum("ig_frm_px_gray")).image;
    const tImage = image(tTextImage.width + 32, 20, 32);
    tImage.copyPixels(tBgImage, tImage.rect, tBgImage.rect);
    tImage.copyPixels(tTextImage, tTextImage.rect + rect(16, 5, 16, 5), tTextImage.rect);
    tElem.feedImage(tImage);
    const tOffsetH = (tWndObj.getProperty(Symbol.for("width")) - tImage.width) / 2;
    tElem.moveTo(tOffsetH, tElem.getProperty(Symbol.for("locY")));
    tElem.resizeTo(tImage.width, tImage.height);
    return 1;
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
      const tTeamSize = tTeams[tTeamIndex][Symbol.for("players")].count;
      for (let tPlayerIndex = 1; tPlayerIndex <= tTeamMaxSize; tPlayerIndex++) {
        if (tTeamIndex > tTeams.count) {
          this.renderNoPlayer(0, tTeamIndex, tPlayerIndex);
          continue;
        }
        if (tPlayerIndex > tTeamSize) {
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
      let tFontStruct = getStructVariable("struct.font.plain");
      tElement.setFont(tFontStruct);
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
      let tFontStruct;
      if (tOwnPlayer) {
        tFontStruct = getStructVariable("struct.font.bold");
      } else {
        tFontStruct = getStructVariable("struct.font.plain");
      }
      tElement.setFont(tFontStruct);
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
    return 1;
  }

  setStartButtonState(towner, tstate) {
    const tWndObj = getWindow(this.getWindowId());
    if (tWndObj == 0) {
      return 0;
    }
    const tElement = tWndObj.getElement("ig_startgame.button");
    if (tElement == 0) {
      return 0;
    }
    if (towner) {
      tElement.show();
      if (tstate) {
        tElement.setProperty(Symbol.for("blend"), 100);
        tElement.setProperty(Symbol.for("cursor"), "cursor.finger");
      } else {
        tElement.setProperty(Symbol.for("blend"), 40);
        tElement.setProperty(Symbol.for("cursor"), 0);
      }
    } else {
      tElement.hide();
    }
    return 1;
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    const tListService = this.getIGComponent("GameList");
    if (tListService == 0) {
      return 0;
    }
    switch (tSprID) {
      case "ig_change_team.button":
        return tListService.setNextTeamInJoinedGame();
      case "ig_icon_gamelist":
        return this.ChangeWindowView("GameList");
    }
    return 1;
  }
}
