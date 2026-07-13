export default class {
  pSystemState;
  pActiveMode;
  pIGComponentProps;
  pIGComponents;

  construct() {
    pSystemState = 0;
    pIGComponents = propList();
    registerMessage(Symbol.for("userloggedin"), this.getID(), Symbol.for("Initialize"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("leaveRoom"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("leaveRoom"));
    registerMessage(Symbol.for("roomReady"), this.getID(), Symbol.for("enterRoom"));
    pIGComponentProps = propList("GameList", list(Symbol.for("always_on")), "LevelList", list(Symbol.for("always_on")), "GameData", list(Symbol.for("always_on")));
    return 1;
  }

  deconstruct() {
    pSystemState = 0;
    unregisterMessage(Symbol.for("userloggedin"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    unregisterMessage(Symbol.for("roomReady"), this.getID());
    for (const tObject of pIGComponents) {
      tObject = VOID;
    }
    pIGComponents = VOID;
    return 1;
  }

  setActiveIGComponent(tID, tHoldUpdates) {
    const tService = this.getComponent().getActiveIGComponent();
    if ((tService != 0) && (tID != pActiveMode)) {
      tService.setActiveFlag(0);
      const tProps = pIGComponentProps.getaProp(pActiveMode);
      if (listp(tProps)) {
        if (!tProps.findPos(Symbol.for("always_on"))) {
          removeIGComponent(pActiveMode);
        }
      }
    }
    const tService2 = this.getIGComponent(tID);
    if (tService2 == 0) {
      return 0;
    }
    if (tHoldUpdates == Symbol.for("hold_updates")) {
      tService2.setActiveFlag(0);
    } else {
      tService2.setActiveFlag(1);
    }
    pActiveMode = tID;
    return 1;
  }

  getActiveIGComponent() {
    if (pActiveMode == VOID) {
      return 0;
    }
    return this.pIGComponents.getaProp(pActiveMode);
  }

  getActiveIGComponentId() {
    return pActiveMode;
  }

  Initialize() {
    if (pSystemState == 0) {
      this.getHandler().send_CHECK_DIRECTORY_STATUS();
    }
  }

  getInitialData() {
    if (pSystemState != 0) {
      return 1;
    }
    for (let i = 1; i <= pIGComponentProps.count; i++) {
      const tID = pIGComponentProps.getPropAt(i);
      if (pIGComponentProps[i].findPos(Symbol.for("always_on"))) {
        const tService = this.getIGComponent(tID);
      }
    }
    for (let i = 1; i <= pIGComponents.count; i++) {
      pIGComponents[i].Initialize();
    }
    pActiveMode = "GameList";
    this.setSystemState(Symbol.for("ready"));
    return 1;
  }

  leaveRoom() {
    this.removeIGComponent("BottomBar");
    this.removeIGComponent("AfterGame");
    this.removeIGComponent("PreGame");
    switch (this.getSystemState()) {
      case Symbol.for("enter_arena"):
        nothing();
        break;
      case Symbol.for("pre_game"):
      case Symbol.for("in_game"):
      case Symbol.for("after_game"):
        const tService = this.getIGComponent("GameList");
        if (tService == 0) {
          return 0;
        }
        tService.leaveJoinedGame(0);
        this.getHandler().send_EXIT_GAME(0);
        this.setSystemState(Symbol.for("ready"));
        this.getInterface().resetToDefaultAndHide();
        break;
      default:
        const tService2 = this.getIGComponent("GameList");
        if (tService2 == 0) {
          return 0;
        }
        if (tService2.getJoinedGameId() == -1) {
          this.getInterface().resetToDefaultAndHide();
        }
        break;
    }
    return 1;
  }

  enterRoom() {
    if (this.getSystemState() == Symbol.for("pre_game")) {
      return 1;
    }
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    const tJoinedGame = tService.getJoinedGame();
    if (objectp(tJoinedGame)) {
      this.getHandler().send_ROOM_GAME_STATUS(1, tJoinedGame.getProperty(Symbol.for("id")), tJoinedGame.getProperty(Symbol.for("game_type")));
    }
  }

  setSystemState(tstate) {
    pSystemState = tstate;
    return 1;
  }

  getSystemState() {
    return pSystemState;
  }

  displayIGComponentEvent(tID, tEventType, tEventData, tCreateIfMissing) {
    let tService;
    if (tCreateIfMissing == 1) {
      tService = this.getIGComponent(tID);
    } else {
      tService = this.pIGComponents.getaProp(tID);
    }
    if (tService == 0) {
      return 0;
    }
    return tService.displayEvent(tEventType, tEventData);
  }

  getIGComponent(tID) {
    if (tID == VOID) {
      return error(this, `IGComponent ${tID} not found!`, Symbol.for("getIGComponent"));
    }
    if (pIGComponents.findPos(tID) == 0) {
      if (!this.createIGComponent(tID)) {
        return error(this, `IGComponent ${tID} could not be created!!`, Symbol.for("Initialize"));
      }
    }
    return pIGComponents.getaProp(tID);
  }

  IGComponentExists(tID) {
    return pIGComponents.findPos(tID) != 0;
  }

  createIGComponent(tID) {
    if (tID == VOID) {
      return 0;
    }
    const tServiceId = `ig_${tID}`;
    if (objectExists(tServiceId)) {
      return 1;
    }
    const tVarId = `ig.service.${tID}.class`;
    let tObject;
    if (variableExists(tVarId)) {
      tObject = createObject(tServiceId, getClassVariable(tVarId));
    } else {
      let tClass = list("IGComponent Base Class");
      if (memberExists(`IG${tID}Class`)) {
        tClass.append(`IG${tID}Class`);
      }
      tObject = createObject(tServiceId, tClass);
    }
    if (!objectp(tObject)) {
      return error(this, `Unable to create ${tID} component.`, Symbol.for("construct"));
    }
    tObject.pMainThreadId = this.getID();
    tObject.pIGComponentId = tID;
    tObject.Initialize();
    pIGComponents.setaProp(tID, tObject);
    return 1;
  }

  removeIGComponent(tID) {
    const tService = pIGComponents.getaProp(tID);
    if (!objectp(tService)) {
      return 1;
    }
    tService.setActiveFlag(0);
    tService.deconstruct();
    removeObject(`ig_${tID}`);
    pIGComponents.deleteProp(tID);
    return 1;
  }
}
