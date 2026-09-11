export default class {
  pWindowID;
  pDisplayedGameId;

  construct() {
    this.pWindowID = "pj";
    return 1;
  }

  deconstruct() {
    this.getMasterIGComponent().unregisterFromIGComponentUpdates("GameList");
    removeWindow(pWindowID);
    return this.ancestor.deconstruct();
  }

  displayEvent(ttype, tParam) {
    this.getMasterIGComponent().setActiveFlag(1);
    if (ttype != Symbol.for("show")) {
      return 0;
    }
    if (voidp(tParam)) {
      return 0;
    }
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    if (tService.getActiveFlag()) {
      tService.setObservedGameId(tParam);
    } else {
      tService.setObservedGameIdExplicit(tParam);
    }
    this.getMasterIGComponent().registerForIGComponentUpdates("GameList");
    this.render();
    return 1;
  }

  render() {
    let tWndObj;
    if (!windowExists(pWindowID)) {
      createWindow(pWindowID, "ig_prejoin.window");
      tWndObj = getWindow(pWindowID);
      if (tWndObj == 0) {
        return 0;
      }
      tWndObj.registerProcedure(Symbol.for("eventProcMouseDown"), this.getID(), Symbol.for("mouseDown"));
      const tLocX = 400;
      const tLocY = 150;
      tWndObj.lock();
      tWndObj.moveTo(tLocX, tLocY);
    } else {
      tWndObj = getWindow(pWindowID);
      if (tWndObj == 0) {
        return 0;
      }
    }
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    const tGameRef = tService.getObservedGame();
    if (tGameRef == 0) {
      return 1;
    }
    pDisplayedGameId = tGameRef.getProperty(Symbol.for("id"));
    let tElem = tWndObj.getElement("ig_level_name");
    if (tElem != 0) {
      tElem.setText(tGameRef.getProperty(Symbol.for("level_name")));
    }
    const tImage = tGameRef.getProperty(Symbol.for("game_type_icon"));
    tElem = tWndObj.getElement("info_gamemode");
    if ((tElem != 0) && (tImage.ilk == Symbol.for("image"))) {
      tElem.feedImage(tImage);
    }
    const tMemNum = getmemnum(`ig_icon_teams_${tGameRef.getProperty(Symbol.for("number_of_teams"))}`);
    if (tMemNum > 0) {
      const tImage2 = member(tMemNum).image;
      tElem = tWndObj.getElement("info_team_amount");
      if ((tElem != 0) && (tImage2.ilk == Symbol.for("image"))) {
        tElem.feedImage(tImage2);
      }
    }
    tElem = tWndObj.getElement("ig_players_joined");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(`${tGameRef.getProperty(Symbol.for("player_count"))}/${tGameRef.getProperty(Symbol.for("player_max_count"))}`);
    return 1;
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    switch (tSprID) {
      case "drag":
        return 1;
      case "ig_close":
      case "ig_prejoin_no.button":
        const tService = this.getIGComponent("GameList");
        if (tService == 0) {
          return 0;
        }
        tService.setObservedGameId(-1);
        return this.Remove();
      case "ig_prejoin_yes.button":
        const tService2 = this.getIGComponent("GameList");
        if (tService2 == 0) {
          return 0;
        }
        executeMessage(Symbol.for("sendTrackingPoint"), "/game/joined/icon");
        return tService2.joinTeamWithLeastMembers(pDisplayedGameId);
    }
    executeMessage(Symbol.for("show_ig"), "GameList");
    this.Remove();
    return 1;
  }
}
