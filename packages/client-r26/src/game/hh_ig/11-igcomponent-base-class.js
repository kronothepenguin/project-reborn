export default class {
  pIGComponentId;
  pActiveFlag;
  pTimeoutUpdates;
  pHiddenUpdates;
  pMainThreadId;
  pUpdateLastTimestamp;
  pUpdateInterval;
  pFeederList;
  pListenerList;

  construct() {
    pActiveFlag = 0;
    pTimeoutUpdates = 0;
    pHiddenUpdates = 0;
    pUpdateLastTimestamp = 0;
    if (variableExists("ig.update.interval")) {
      pUpdateInterval = getIntVariable("ig.update.interval");
    } else {
      pUpdateInterval = 5000;
    }
    pFeederList = list();
    pListenerList = list();
    return 1;
  }

  deconstruct() {
    this.setContentUpdatePollingTimeout(0);
    this.setActiveFlag(0);
    pListenerList = list();
    for (const tServiceId of pFeederList) {
      const tService = this.getIGComponent(tServiceId);
      if (tService != 0) {
        tService.unregisterUpdates(pIGComponentId);
      }
    }
    pFeederList = list();
    if (objectExists(this.getRendererID())) {
      removeObject(this.getRendererID());
    }
    return 1;
  }

  Initialize() {
    return 1;
  }

  setActiveFlag(tstate, tHoldUpdates) {
    pActiveFlag = tstate;
    if (!this.pHiddenUpdates) {
      if (!tHoldUpdates) {
        this.setContentUpdatePollingTimeout(tstate);
      } else {
        this.setContentUpdatePollingTimeout(0);
      }
    }
    if (tstate == 1) {
      receiveUpdate(this.getID());
    } else {
      removeUpdate(this.getID());
      this.discardRenderer();
    }
    return 1;
  }

  getActiveFlag() {
    return pActiveFlag;
  }

  update() {
    return 1;
  }

  displayEvent(ttype, tParam) {
    const tRenderObj = this.getRenderer(1);
    if (tRenderObj != 0) {
      return tRenderObj.displayEvent(ttype, tParam);
    }
    return 0;
  }

  Remove() {
    this.getComponent().removeIGComponent(pIGComponentId);
  }

  getMainThread() {
    return getObject(pMainThreadId);
  }

  getHandler() {
    const tMainThreadRef = this.getMainThread();
    if (!objectp(tMainThreadRef)) {
      return 0;
    }
    return tMainThreadRef.getHandler();
  }

  getComponent() {
    const tMainThreadRef = this.getMainThread();
    if (!objectp(tMainThreadRef)) {
      return 0;
    }
    return tMainThreadRef.getComponent();
  }

  getInterface() {
    const tMainThreadRef = this.getMainThread();
    if (!objectp(tMainThreadRef)) {
      return 0;
    }
    return tMainThreadRef.getInterface();
  }

  ChangeWindowView(tMode) {
    const tInterface = this.getInterface();
    if (tInterface == 0) {
      return 0;
    }
    return tInterface.ChangeWindowView(tMode);
  }

  renderUI(tComponentSpec) {
    const tRenderObj = getObject(this.getRendererID());
    if (tRenderObj == 0) {
      return 1;
    }
    return tRenderObj.renderUI(tComponentSpec);
  }

  resetSubComponent(tID) {
    const tRenderObj = getObject(this.getRendererID());
    if (tRenderObj == 0) {
      return 1;
    }
    return tRenderObj.resetSubComponent(tID);
  }

  getIGComponent(tServiceId) {
    const tMainThreadRef = this.getMainThread();
    if (!objectp(tMainThreadRef)) {
      return 0;
    }
    return tMainThreadRef.getIGComponent(tServiceId);
  }

  registerForIGComponentUpdates(tServiceId) {
    const tService = this.getIGComponent(tServiceId);
    if (tService == 0) {
      return 0;
    }
    if (tService.registerUpdates(pIGComponentId)) {
      if (pFeederList.findPos(tServiceId) == 0) {
        pFeederList.append(tServiceId);
      }
    }
    return 1;
  }

  unregisterFromIGComponentUpdates(tServiceId) {
    const tService = this.getIGComponent(tServiceId);
    if (tService == 0) {
      return 0;
    }
    if (tService.unregisterUpdates(pIGComponentId)) {
      pFeederList.deleteOne(tServiceId);
    }
    return 1;
  }

  registerUpdates(tServiceId) {
    if (tServiceId == VOID) {
      return 0;
    }
    if (pListenerList.findPos(tServiceId)) {
      return 1;
    }
    pListenerList.append(tServiceId);
    return 1;
  }

  unregisterUpdates(tServiceId) {
    pListenerList.deleteOne(tServiceId);
    return 1;
  }

  announceUpdate(tUpdateId) {
    if (this.getActiveFlag()) {
      this.handleUpdate(tUpdateId, pIGComponentId);
      return 1;
    }
    for (const tServiceId of pListenerList) {
      const tService = this.getIGComponent(tServiceId);
      if (tService != 0) {
        if (tService.getActiveFlag()) {
          tService.handleUpdate(tUpdateId, pIGComponentId);
        }
      }
    }
    return 1;
  }

  handleUpdate(tUpdateId, tSenderId) {
    if (!this.getActiveFlag()) {
      return 1;
    }
    const tRenderObj = getObject(this.getRendererID());
    if (tRenderObj == 0) {
      return 1;
    }
    call(Symbol.for("handleUpdate"), list(tRenderObj), tUpdateId, tSenderId);
  }

  getRenderer(tCreateIfMissing) {
    if (!tCreateIfMissing && !this.getActiveFlag()) {
      return 0;
    }
    let tRenderObj = getObject(this.getRendererID());
    if (objectp(tRenderObj)) {
      return tRenderObj;
    }
    tRenderObj = createObject(this.getRendererID(), list("IGComponentUI Base Class", `IG${this.pIGComponentId}UI Class`));
    if (tRenderObj == 0) {
      return 0;
    }
    tRenderObj.define(this.getID(), pMainThreadId);
    return tRenderObj;
  }

  discardRenderer() {
    const tID = this.getRendererID();
    const tRenderObj = getObject(tID);
    if (objectp(tRenderObj)) {
      tRenderObj.removeWindows();
      removeObject(tID);
    }
    return 1;
  }

  getRendererID() {
    return `${this.getID()}_UI`;
  }

  setContentUpdatePollingTimeout(tstate) {
    if (!pTimeoutUpdates) {
      return 1;
    }
    if (this.pIGComponentId == VOID) {
      return error(this, "IGComponent ID not defined before setting updates!", Symbol.for("setContentUpdatePollingTimeout"));
    }
    const tUpdateTimeoutId = `${pIGComponentId}_timer`;
    if ((tstate == 1) || pHiddenUpdates) {
      if (variableExists(`ig.${pIGComponentId}.update.interval`)) {
        pUpdateInterval = getIntVariable(`ig.${pIGComponentId}.update.interval`);
      }
      getObject(this.getID()).pollContentUpdate();
      if (!timeoutExists(tUpdateTimeoutId)) {
        createTimeout(tUpdateTimeoutId, pUpdateInterval, Symbol.for("pollContentUpdate"), this.getID(), VOID, 0);
      }
    } else {
      if (timeoutExists(tUpdateTimeoutId)) {
        removeTimeout(tUpdateTimeoutId);
      }
    }
    return 1;
  }

  pollContentUpdate(tForced) {
    return 0;
  }

  setUpdateTimestamp() {
    this.pUpdateLastTimestamp = the.milliSeconds;
    return 1;
  }

  isUpdateTimestampExpired() {
    const tTolerance = 1.05000000000000004;
    return (tTolerance * (the.milliSeconds - this.pUpdateLastTimestamp)) >= this.pUpdateInterval;
  }

  getOwnPlayerName() {
    const tSession = getObject(Symbol.for("session"));
    if (tSession == 0) {
      return 0;
    }
    return tSession.GET(Symbol.for("user_name"));
  }
}
