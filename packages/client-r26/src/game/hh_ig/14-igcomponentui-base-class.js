export default class {
  pMasterIGComponentId;
  pMainThreadId;
  pFlagManagerId;
  pWindowSetId;
  pViewMode;
  pViewModeComponents;
  pSubComponentList;
  pModalSpr;

  construct() {
    pViewMode = Symbol.for("Info");
    pViewModeComponents = propList();
    pSubComponentList = propList();
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    const tObject = getObject(this.getID());
    tObject.removeWindows();
    return 1;
  }

  define(tMasterIGComponentId, tMainThreadId) {
    pMasterIGComponentId = tMasterIGComponentId;
    pMainThreadId = tMainThreadId;
    pWindowSetId = this.getID();
    return 1;
  }

  displayEvent(ttype, tParam) {
    return 0;
  }

  removeWindows() {
    removeUpdate(this.getID());
    this.removeComponents();
    this.removeFlagManager();
    this.removeModalWindow();
    return 1;
  }

  renderUI(tComponentSpec) {
    if (voidp(tComponentSpec)) {
      return this.renderSubComponents(1);
    }
    const tTopLevelRef = getObject(this.getID());
    if (stringp(tComponentSpec)) {
      const tComponent = pSubComponentList.getaProp(tComponentSpec);
      if (tComponent != 0) {
        return tComponent.render();
      }
    } else {
      if (listp(tComponentSpec)) {
        for (const tID of tComponentSpec) {
          const tComponent = pSubComponentList.getaProp(tID);
          if (tComponent != 0) {
            tComponent.render();
          }
        }
      }
    }
    return 1;
  }

  Remove() {
    this.getMasterIGComponent().Remove();
  }

  getWindowWrapper() {
    return getObject(Symbol.for("ig_window_wrapper"));
  }

  getMasterIGComponentId() {
    return pMasterIGComponentId;
  }

  getMasterIGComponent() {
    return getObject(pMasterIGComponentId);
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
    const tMainThreadRef = this.getMainThread();
    if (!objectp(tMainThreadRef)) {
      return 0;
    }
    const tInterface = tMainThreadRef.getInterface();
    if (tInterface == 0) {
      return 0;
    }
    return tInterface.ChangeWindowView(tMode);
  }

  getIGComponent(tServiceId) {
    const tMainThreadRef = this.getMainThread();
    if (!objectp(tMainThreadRef)) {
      return 0;
    }
    return tMainThreadRef.getIGComponent(tServiceId);
  }

  getSubComponent(tID, tAddIfMissing) {
    let tObject = this.pSubComponentList.getaProp(tID);
    if (tObject != 0) {
      return tObject;
    }
    if (!tAddIfMissing) {
      return 0;
    }
    tObject = this.initializeSubComponent(tID, this.getSubComponentClass(tID));
    if (tObject == 0) {
      return 0;
    }
    return tObject;
  }

  initializeSubComponent(tID, tClass) {
    if (tID == Symbol.for("modal")) {
      tClass = list();
    }
    if (tClass == 0) {
      return 0;
    }
    if (listp(tClass)) {
      tClass.addAt(1, "IGComponentUI Subcomponent Class");
    } else {
      if (stringp(tClass)) {
        tClass = list("IGComponentUI Subcomponent Class", tClass);
      } else {
        tClass = "IGComponentUI Subcomponent Class";
      }
    }
    const tObject = createObject(Symbol.for("temp"), tClass);
    if (tObject == 0) {
      return error(this, `Cannot create subcomponent ${tID}, class: ${tClass}`, Symbol.for("initializeSubComponent"));
    }
    tObject.setID(tID);
    tObject.pMainThreadId = this.pMainThreadId;
    tObject.pWindowSetId = `${this.pWindowSetId}_${tID}`;
    this.pSubComponentList.setaProp(tID, tObject);
    const tFlagManager = this.getFlagManager(1);
    if (tFlagManager == 0) {
      return 0;
    }
    tObject.pFlagManagerId = tFlagManager.getID();
    tObject.addWindows();
    return tObject;
  }

  setViewMode(tMode) {
    this.pViewMode = tMode;
    return this.renderSubComponents();
  }

  getViewMode() {
    return pViewMode;
  }

  resetSubComponent(tID) {
    const tPos = this.pSubComponentList.findPos(tID);
    if (tPos == 0) {
      return 0;
    }
    const tComponent = this.pSubComponentList.getaProp(tID);
    if (objectp(tComponent)) {
      tComponent.deconstruct();
    }
    this.pSubComponentList.deleteProp(tID);
    const tTopLevelRef = getObject(this.getID());
    const tNewComponent = tTopLevelRef.getSubComponent(tID, 1);
    if (tNewComponent == 0) {
      return error(this, `Error creating components: ${tID}`, Symbol.for("resetSubComponent"));
    }
    const tNewList = propList();
    for (let i = 1; i <= tPos - 1; i++) {
      tNewList.setaProp(this.pSubComponentList.getPropAt(i), this.pSubComponentList[i]);
    }
    tNewList.setaProp(tID, tNewComponent);
    for (let i = tPos; i <= this.pSubComponentList.count - 1; i++) {
      tNewList.setaProp(this.pSubComponentList.getPropAt(i), this.pSubComponentList[i]);
    }
    this.pSubComponentList = tNewList;
    tNewComponent.render();
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.render();
    return 1;
  }

  renderSubComponents(tComponentList) {
    const tTopLevelRef = getObject(this.getID());
    if (!listp(tComponentList)) {
      tComponentList = pViewModeComponents.getaProp(pViewMode);
      if (tComponentList == 0) {
        return 0;
      }
    }
    if (!this.verifyComponentList(tComponentList)) {
      const tNewSubComponentList = propList();
      const tPurgeList = list();
      let tRenderFlag;
      for (let i = 1; i <= tComponentList.count; i++) {
        const tID = tComponentList[i];
        let tCreated = 0;
        let j = i;
        while (j <= this.pSubComponentList.count) {
          if (tID == this.pSubComponentList.getPropAt(j)) {
            tCreated = 1;
            break;
          }
          const tObject = this.pSubComponentList[j];
          if (objectp(tObject)) {
            tObject.deconstruct();
          }
          this.pSubComponentList.deleteAt(j);
          tRenderFlag = 1;
        }
        if (!tCreated) {
          const tComponent = tTopLevelRef.getSubComponent(tID, 1);
          if (tComponent != 0) {
            tRenderFlag = 1;
          }
        }
      }
      if (tRenderFlag == 1) {
        const tWrapObjRef = this.getWindowWrapper();
        if (tWrapObjRef == 0) {
          return 0;
        }
        tWrapObjRef.render();
      }
    }
    for (const tID of tComponentList) {
      const tComponent = tTopLevelRef.getSubComponent(tID);
      if (tComponent != 0) {
        tComponent.render();
      }
    }
    receiveUpdate(this.getID());
  }

  removeComponents() {
    for (const tObject of pSubComponentList) {
      if (objectp(tObject)) {
        tObject.deconstruct();
      }
    }
    pSubComponentList = propList();
    return 1;
  }

  verifyComponentList(tComponentList) {
    const tCount = pSubComponentList.count;
    if (tCount != tComponentList.count) {
      return 0;
    }
    for (let i = 1; i <= tCount; i++) {
      if (pSubComponentList.getPropAt(i) != tComponentList[i]) {
        return 0;
      }
    }
    return 1;
  }

  getFlagManager(tCreateIfMissing) {
    if (objectExists(pFlagManagerId)) {
      return getObject(pFlagManagerId);
    }
    if (!tCreateIfMissing) {
      return 0;
    }
    return this.createFlagManager();
  }

  createFlagManager() {
    if (pFlagManagerId == VOID) {
      pFlagManagerId = `${this.getID()}_flagmanager`;
    }
    if (objectExists(pFlagManagerId)) {
      return 1;
    }
    if (!createObject(pFlagManagerId, "IG FlagManager Class")) {
      return 0;
    }
    return getObject(pFlagManagerId);
  }

  removeFlagManager() {
    if (!objectExists(pFlagManagerId)) {
      return 1;
    }
    removeObject(pFlagManagerId);
    return 1;
  }

  createModalWindow() {
    if (pModalSpr > 0) {
      return 1;
    }
    pModalSpr = reserveSprite(this.getID());
    const tsprite = sprite(pModalSpr);
    tsprite.member = member(getmemnum("null"));
    tsprite.blend = 70;
    tsprite.rect = rect(0, 0, the.stage.rect.width, the.stage.rect.height);
    const tVisualizer = getVisualizer("Room_visualizer");
    if (tVisualizer != 0) {
      tsprite.locZ = tVisualizer.getProperty(Symbol.for("locZ")) + 10000000;
    } else {
      tsprite.locZ = -10000000;
    }
    setEventBroker(tsprite.spriteNum, `${this.getID()}_spr`);
    return 1;
  }

  removeModalWindow() {
    if (pModalSpr > 0) {
      releaseSprite(pModalSpr);
      pModalSpr = VOID;
    }
    return 1;
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    return 1;
  }
}
