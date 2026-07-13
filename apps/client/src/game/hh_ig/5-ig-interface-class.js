export default class {
  pMainWindowWrapperId;
  pSideWindowWrapperId;
  pTooltipManager;

  construct() {
    pActiveMode = "GameList";
    pMainWindowWrapperId = "ig_window_wrapper";
    pSideWindowWrapperId = "ig_window2_wrapper";
    registerMessage(Symbol.for("toggle_ig"), this.getID(), Symbol.for("toggleWindow"));
    registerMessage(Symbol.for("hide_ig"), this.getID(), Symbol.for("hideWindow"));
    registerMessage(Symbol.for("show_ig"), this.getID(), Symbol.for("showWindow"));
    registerMessage(Symbol.for("show_game_info"), this.getID(), Symbol.for("showRecommended"));
    registerMessage(Symbol.for("hide_game_info"), this.getID(), Symbol.for("hideRecommended"));
    registerMessage(Symbol.for("ig_show_game_rules"), this.getID(), Symbol.for("showGameRules"));
    registerMessage(Symbol.for("ig_hide_game_rules"), this.getID(), Symbol.for("hideGameRules"));
    return 1;
  }

  deconstruct() {
    this.removeTooltipManager();
    removeObject(pMainWindowWrapperId);
    removeObject(pSideWindowWrapperId);
    unregisterMessage(Symbol.for("toggle_ig"), this.getID());
    unregisterMessage(Symbol.for("hide_ig"), this.getID());
    unregisterMessage(Symbol.for("show_ig"), this.getID());
    unregisterMessage(Symbol.for("show_game_info"), this.getID());
    unregisterMessage(Symbol.for("hide_game_info"), this.getID());
    return 1;
  }

  toggleWindow() {
    if (this.getComponent().getSystemState() != Symbol.for("ready")) {
      return 1;
    }
    switch (this.getWindowVisible()) {
      case 0:
        return this.showWindow();
      case 1:
        return this.resetToDefaultAndHide();
    }
    return 1;
  }

  showWindow(tMode, tPage) {
    if (this.getComponent().getSystemState() == 0) {
      return 1;
    }
    const tWrapObjRef = this.getMainWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.show();
    if (tMode == VOID) {
      this.ChangeWindowView(this.getComponent().getActiveIGComponentId());
    } else {
      this.ChangeWindowView(tMode, tPage);
    }
    return 1;
  }

  hideWindow() {
    const tComponent = this.getComponent();
    const tServiceId = tComponent.getActiveIGComponentId();
    if (tServiceId == "JoinedGame") {
      return 0;
    }
    let tService = tComponent.getIGComponent("GameList");
    if (tService.getJoinedGameId() > -1) {
      return this.ChangeWindowView("JoinedGame");
    }
    tService = tComponent.getActiveIGComponent();
    if (tService != 0) {
      tService.setActiveFlag(0);
    }
    const tWrapObjRef = this.getMainWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    return tWrapObjRef.hide();
  }

  showRecommended() {
    if (this.getComponent().getSystemState() == 0) {
      return 1;
    }
    const tService = this.getComponent().getIGComponent("Recommended");
    if (tService != 0) {
      tService.show();
    }
    return 1;
  }

  hideRecommended() {
    const tService = this.getComponent().getIGComponent("Recommended");
    if (tService != 0) {
      tService.hide();
    }
    return 1;
  }

  showGameRules() {
    if (this.getComponent().IGComponentExists("GameRules")) {
      return this.hideGameRules();
    }
    let tService = this.getComponent().getIGComponent("GameData");
    if (tService == 0) {
      return 0;
    }
    if (!tService.exists(Symbol.for("game_type"))) {
      return 0;
    }
    const tGameType = tService.getProperty(Symbol.for("game_type"));
    tService = this.getComponent().getIGComponent("GameRules");
    if (tService == 0) {
      return 0;
    }
    const tRenderObj = tService.getRenderer(1);
    if (tRenderObj != 0) {
      tRenderObj.toggle(tGameType);
    }
    return 1;
  }

  hideGameRules() {
    this.getComponent().removeIGComponent("GameRules");
  }

  showArenaQueue(tQueuePos) {
    const tService = this.getComponent().getIGComponent("ArenaQueue");
    if (tService == 0) {
      return 0;
    }
    const tRenderObj = tService.getRenderer(1);
    if (tRenderObj != 0) {
      tRenderObj.render(tQueuePos);
    }
    return 1;
  }

  hideArenaQueue() {
    return this.getComponent().removeIGComponent("ArenaQueue");
  }

  ChangeWindowView(tMode, tPage) {
    if (this.getComponent().getSystemState() == 0) {
      return 1;
    }
    const tComponent = this.getComponent();
    if (tComponent == 0) {
      return 0;
    }
    const tService = tComponent.getActiveIGComponent();
    const tServiceId = tComponent.getActiveIGComponentId();
    let tServiceActive;
    if (tService != 0) {
      tServiceActive = tService.getActiveFlag();
    }
    if ((tServiceId != tMode) || !tServiceActive) {
      if (!this.getWindowVisible()) {
        tComponent.setActiveIGComponent(tMode, Symbol.for("hold_updates"));
        return 1;
      } else {
        if (tMode == "GameList") {
          executeMessage(Symbol.for("sendTrackingPoint"), "/game/ui");
        }
        tComponent.setActiveIGComponent(tMode);
      }
      this.resetWindowWrapper();
    }
    const tUIService = this.getActiveUI();
    if (tUIService == 0) {
      return 0;
    }
    if (tPage != VOID) {
      if (tUIService.getViewMode() != tPage) {
        tUIService.setViewMode(tPage);
      }
    } else {
      tUIService.renderSubComponents();
    }
    return 1;
  }

  resetToDefaultAndHide() {
    const tComponent = this.getComponent();
    tComponent.removeIGComponent("Prejoin");
    tComponent.removeIGComponent("Recommended");
    tComponent.removeIGComponent("AfterGame");
    tComponent.removeIGComponent("GameAssetImport");
    tComponent.removeIGComponent("RoomLoader");
    tComponent.removeIGComponent("PreGame");
    tComponent.removeIGComponent("GameChat");
    tComponent.removeIGComponent("GameTypes");
    tComponent.removeIGComponent("GameRules");
    const tService = tComponent.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    if (tService.getJoinedGameId() == -1) {
      tComponent.setActiveIGComponent("GameList", Symbol.for("hold_updates"));
      this.hideWindow();
    } else {
      this.ChangeWindowView("JoinedGame");
    }
    return 1;
  }

  getUI(tMode) {
    let tService = this.getComponent().getIGComponent(tMode);
    if (tService != 0) {
      tService = tService.getRenderer();
    }
    if (tService == 0) {
      return 0;
    }
    return tService;
  }

  getActiveUI() {
    return this.getUI(this.getComponent().getActiveIGComponentId());
  }

  showBasicAlert(tKey) {
    return executeMessage(Symbol.for("alert"), propList("Msg", getText(tKey)));
  }

  getWindowVisible() {
    const tWrapObjRef = this.getMainWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    return tWrapObjRef.getProperty(Symbol.for("visible"));
  }

  getMainWindowWrapper(tClientID) {
    let tWrapObjRef = getObject(pMainWindowWrapperId);
    if (tWrapObjRef == 0) {
      tWrapObjRef = this.createWindowWrapper(pMainWindowWrapperId, tClientID);
      if (tWrapObjRef == 0) {
        return 0;
      }
      tWrapObjRef.moveTo(90, 70);
      tWrapObjRef.moveZ(1000000);
    }
    return tWrapObjRef;
  }

  createWindowWrapper(tID, tClientID) {
    const tWrapObjRef = createObject(tID, "Multicomponent Window Wrapper Class");
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.hide();
    if (tClientID == VOID) {
      tClientID = this.getID();
    }
    tWrapObjRef.registerProcedure(Symbol.for("eventProcMouseDown"), tClientID, Symbol.for("mouseDown"));
    tWrapObjRef.registerProcedure(Symbol.for("eventProcMouseHover"), tClientID, Symbol.for("mouseEnter"));
    tWrapObjRef.registerProcedure(Symbol.for("eventProcMouseHover"), tClientID, Symbol.for("mouseLeave"));
    return tWrapObjRef;
  }

  resetWindowWrapper() {
    const tWrapObj = this.getMainWindowWrapper();
    if (tWrapObj == 0) {
      return 0;
    }
    tWrapObj.removeAllParts();
    return 1;
  }

  getTooltipManager() {
    if (objectp(pTooltipManager)) {
      return pTooltipManager;
    }
    pTooltipManager = createObject(Symbol.for("temp"), "IG TooltipManager Class");
    return pTooltipManager;
  }

  removeTooltipManager() {
    if (!objectp(this.pTooltipManager)) {
      return 1;
    }
    this.pTooltipManager.deconstruct();
    pTooltipManager = VOID;
    return 1;
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID, tTargetID) {
    const tObject = getObject(pMainWindowWrapperId);
    if (tObject != 0) {
      tObject.Activate();
    }
    switch (tSprID) {
      case "creategame.button":
      case "ig_link_startnew":
        return this.ChangeWindowView("LevelList");
      case "cancel.button":
      case "create_cancel.button":
        return this.ChangeWindowView("GameList");
      case "startgame.button":
      case "ig_startgame.button":
        return this.getHandler().send_START_GAME();
      case "ig_close":
        const tService = this.getComponent().getIGComponent("GameList");
        if (tService == 0) {
          return 0;
        }
        if (tService.getJoinedGameId() == -1) {
          return this.hideWindow();
        } else {
          return this.ChangeWindowView("JoinedGame", Symbol.for("mini"));
        }
        break;
    }
    let tService2;
    if (voidp(tTargetID)) {
      tService2 = this.getActiveUI();
    } else {
      tService2 = this.getUI(tTargetID);
    }
    if (tService2 == 0) {
      return 0;
    }
    return tService2.eventProcMouseDown(tEvent, tSprID, tParam, tWndID);
  }

  eventProcMouseHover(tEvent, tSprID, tParam, tWndID, tTargetID) {
    let tService;
    if (voidp(tTargetID)) {
      tService = this.getActiveUI();
    } else {
      tService = this.getUI(tTargetID);
    }
    if (tService == 0) {
      return 0;
    }
    const tResult = call(Symbol.for("eventProcMouseHover"), list(tService), tEvent, tSprID, tParam, tWndID);
    if (tResult == 1) {
      return 1;
    }
    const tObject = this.getTooltipManager();
    if (tObject == 0) {
      return 0;
    }
    tObject.handleEvent(tEvent, tSprID, tWndID);
    return 1;
  }

  eventProcMouseDownIcon(tEvent, tSprID, tParam, tWndID, tTargetID) {
    const tComponent = this.getComponent();
    if (tComponent.getSystemState() == 0) {
      return 1;
    }
    const tService = tComponent.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    const tBreakOffset = offset("_", tSprID);
    if (tBreakOffset == 0) {
      return 0;
    }
    const tGameId = integer(tSprID.char[`1..${tBreakOffset - 1}`]);
    if (!integerp(tGameId)) {
      return 0;
    }
    const tGameType = integer(tSprID.char[`${tBreakOffset + 1}..${tSprID.length}`]);
    if (!integerp(tGameType)) {
      return 0;
    }
    if (tService.getJoinedGameId() == tGameId) {
      return 1;
    }
    tComponent.displayIGComponentEvent("Prejoin", Symbol.for("show"), tGameId, 1);
    return 1;
  }

  eventProcRollOverIcon(tEvent, tSprID, tParam, tWndID, tTargetID) {
    if (this.getComponent().getSystemState() == 0) {
      return 1;
    }
    if (tEvent == Symbol.for("mouseEnter")) {
      const tBreakOffset = offset("_", tSprID);
      if (tBreakOffset == 0) {
        return 0;
      }
      const tGameId = integer(tSprID.char[`1..${tBreakOffset - 1}`]);
      if (!integerp(tGameId)) {
        return 0;
      }
      const tGameType = integer(tSprID.char[`${tBreakOffset + 1}..${tSprID.length}`]);
      if (!integerp(tGameType)) {
        return 0;
      }
      const tService = this.getComponent().getIGComponent("GameList");
      if (tService == 0) {
        return 0;
      }
      if (tService.getJoinedGameId() == tGameId) {
        return executeMessage(Symbol.for("setRollOverInfo"), getText("ig_tooltip_game_joined"));
      }
      executeMessage(Symbol.for("setRollOverInfo"), getText(`ig_tooltip_gametype_${tGameType}`));
    } else {
      executeMessage(Symbol.for("setRollOverInfo"), EMPTY);
    }
    return 1;
  }
}
