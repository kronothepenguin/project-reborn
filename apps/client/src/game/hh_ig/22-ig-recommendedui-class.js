export default class {
  pWindowID;
  pTargetElementID;

  construct() {
    pWindowID = "IG Recommends";
    return 1;
  }

  deconstruct() {
    this.hide();
    return 1;
  }

  renderSubComponents() {
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    if (tService.isUpdateTimestampExpired()) {
      return tService.pollContentUpdate();
    }
    if (tService.getListCount() == 0) {
      return 1;
    }
    this.createMyWindow();
    return 1;
  }

  handleUpdate(tUpdateId, tSenderId) {
    put(`* IG RecommendedUI Class.handleUpdate ${tUpdateId} ${tSenderId} ${windowExists(pWindowID)}`);
    return this.renderUI();
  }

  hide() {
    this.removeMyWindow();
    return 1;
  }

  setTarget(tTargetID) {
    pTargetElementID = tTargetID;
  }

  createMyWindow() {
    if (!windowExists(pWindowID)) {
      createWindow(pWindowID, "ig_popup_bg.window");
      const tWndObj = getWindow(pWindowID);
      if (tWndObj == 0) {
        return error(this, "Cannot create window!", Symbol.for("createMyWindow"));
      }
      if (!tWndObj.merge("ig_recommeded_popup.window")) {
        return error(this, "Cannot merge in window!", Symbol.for("createMyWindow"));
      }
      tWndObj.lock();
      tWndObj.moveTo(471, 359);
      tWndObj.registerProcedure(Symbol.for("popupEntered"), this.getID(), Symbol.for("mouseEnter"));
      tWndObj.registerProcedure(Symbol.for("popupLeft"), this.getID(), Symbol.for("mouseLeave"));
      tWndObj.registerProcedure(Symbol.for("eventProcMouseDown"), this.getID(), Symbol.for("mouseUp"));
    }
    this.renderList();
    return 1;
  }

  renderList() {
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    const tWndObj = getWindow(pWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    for (let i = 1; i <= 3; i++) {
      this.renderListItem(i, tService.getGameEntry(tService.getListIdByIndex(i)), tWndObj);
    }
    return 1;
  }

  renderListItem(tIndex, tGameRef, tWndObj) {
    if (tGameRef == 0) {
      let tElem = tWndObj.getElement(`nav_popup_link_go${tIndex}`);
      if (tElem == 0) {
        return 0;
      }
      tElem.hide();
    } else {
      let tElem = tWndObj.getElement(`nav_popup_link_go${tIndex}`);
      if (tElem == 0) {
        return 0;
      }
      tElem.show();
      tElem = tWndObj.getElement(`info_gamemode${tIndex}`);
      if (tElem == 0) {
        return 0;
      }
      const tImage = tGameRef.getProperty(Symbol.for("game_type_icon"));
      if (tImage != 0) {
        tElem.feedImage(tImage);
      }
      tElem = tWndObj.getElement(`ig_level_name${tIndex}`);
      if (tElem == 0) {
        return 0;
      }
      tElem.setText(tGameRef.getProperty(Symbol.for("level_name")));
      tElem = tWndObj.getElement(`info_team_amount${tIndex}`);
      if (tElem == 0) {
        return 0;
      }
      const tMemNum = getmemnum(`ig_icon_teams_${tGameRef.getTeamCount()}`);
      if (tMemNum == 0) {
        return 0;
      }
      tElem.feedImage(member(tMemNum).image);
      tElem = tWndObj.getElement(`ig_players_joined${tIndex}`);
      if (tElem == 0) {
        return 0;
      }
      tElem.setText(`${tGameRef.getPlayerCount()}/${tGameRef.getMaxPlayerCount()}`);
    }
    return 1;
  }

  removeMyWindow() {
    if (windowExists(pWindowID)) {
      removeWindow(pWindowID);
    }
    return 1;
  }

  popupEntered() {
    executeMessage(Symbol.for("popupEntered"), pTargetElementID);
  }

  popupLeft() {
    executeMessage(Symbol.for("popupLeft"), pTargetElementID);
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    if (this.getMainThread() == 0) {
      return 0;
    }
    switch (tSprID) {
      case "ig_players_joined1":
      case "ig_players_joined2":
      case "ig_players_joined3":
      case "info_team_amount1":
      case "info_team_amount2":
      case "info_team_amount3":
      case "info_gamemode1":
      case "info_gamemode2":
      case "info_gamemode3":
      case "ig_level_name1":
      case "ig_level_name2":
      case "ig_level_name3":
      case "room_obj_disp_bg1":
      case "room_obj_disp_bg2":
      case "room_obj_disp_bg3":
      case "nav_popup_link_go1":
      case "nav_popup_link_go2":
      case "nav_popup_link_go3":
        const tIndex = integer(tSprID.char[tSprID.length]);
        if (tIndex == VOID) {
          return 0;
        }
        const tService = this.getIGComponent("GameList");
        if (tService == 0) {
          return 0;
        }
        const tID = tService.getListIdByIndex(tIndex);
        if (tID == -1) {
          return 0;
        }
        executeMessage(Symbol.for("sendTrackingPoint"), "/game/joined/recom");
        tService.joinTeamWithLeastMembers(tID);
        break;
      default:
        executeMessage(Symbol.for("show_ig"), "GameList");
        break;
    }
    this.Remove();
    return 1;
  }

  eventProcMouseHover(tEvent, tSprID, tParam, tWndID) {
    put("* IG RecommendedUI Class mousehover");
  }
}
