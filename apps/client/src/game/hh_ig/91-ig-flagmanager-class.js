export default class {
  pFlagList;
  pFlagSetIndex;
  pCloseTimerList;
  pUpdateCounter;
  pUpdateInterval;
  pFlagCloseTimeout;

  construct() {
    this.pUpdateInterval = 3;
    this.pFlagCloseTimeout = 4;
    this.pFlagList = propList();
    this.pFlagSetIndex = propList();
    this.pCloseTimerList = propList();
    receiveUpdate(this.getID());
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    this.reset();
    return 1;
  }

  toggle(tID) {
    tID = this.getMatchingFlagId(tID);
    if (tID == VOID) {
      return 0;
    }
    const tObject = this.pFlagList.getaProp(tID);
    if (!objectp(tObject)) {
      return 0;
    }
    tObject.toggle(tID);
    this.alignZ();
    return 1;
  }

  open(tID) {
    if (this.pCloseTimerList.findPos(tID)) {
      this.pCloseTimerList.deleteProp(tID);
    }
    for (let i = 1; i <= this.pFlagList.count; i++) {
      const tObject = this.pFlagList[i];
      if (tID.contains(this.pFlagList.getPropAt(i))) {
        this.pCloseTimerList.deleteProp(this.pFlagList.getPropAt(i));
        tObject.open();
        continue;
      }
      tObject.close();
    }
    this.alignZ();
    return 1;
  }

  close(tID) {
    if (tID == VOID) {
      for (let i = 1; i <= this.pFlagList.count; i++) {
        const tObject = this.pFlagList[i];
        tID = this.pFlagList.getPropAt(i);
        this.pCloseTimerList.setaProp(tID, list(tObject, this.pFlagCloseTimeout));
      }
    } else {
      tID = this.getMatchingFlagId(tID);
      const tObject = this.pFlagList.getaProp(tID);
      if (objectp(tObject)) {
        if (this.pCloseTimerList.findPos(tID) == 0) {
          this.pCloseTimerList.setaProp(tID, list(tObject, this.pFlagCloseTimeout));
        }
      }
    }
    return 1;
  }

  reset() {
    return removeAllFlagObjects();
  }

  getFlagState(tID) {
    tID = this.getMatchingFlagId(tID);
    const tObject = this.pFlagList.getaProp(tID);
    if (tObject == 0) {
      return 0;
    }
    return tObject.getState();
  }

  alignZ() {
    for (const tObject of this.pFlagList) {
      tObject.alignZ();
    }
    return 1;
  }

  update() {
    this.pUpdateCounter = this.pUpdateCounter + 1;
    if (this.pUpdateCounter < this.pUpdateInterval) {
      return 1;
    }
    this.pUpdateCounter = 0;
    if (this.pFlagList.count == 0) {
      return 0;
    }
    for (const tObject of this.pFlagList) {
      tObject.update();
    }
    let tChanges = 0;
    let i = 1;
    while (i <= this.pCloseTimerList.count) {
      const tItem = this.pCloseTimerList[i];
      if (tItem[2] == 0) {
        const tObject = tItem[1];
        tObject.close();
        this.pCloseTimerList.deleteAt(i);
        tChanges = 1;
        continue;
      }
      this.pCloseTimerList[i][2] = tItem[2] - 1;
      i = i + 1;
    }
    if (tChanges) {
      this.alignZ();
    }
    return 1;
  }

  setInfoFlag(tSetID, tID, tWndID, tElemID, tFlagType, tColor, tItemInfo) {
    if (this.exists(tID)) {
      return 1;
    }
    const tWndObj = getWindow(tWndID);
    if (tWndObj == 0) {
      return error(this, `Reference window not found: ${tWndID}`, Symbol.for("setInfoFlag"));
    }
    const tElem = tWndObj.getElement(tElemID);
    if (tElem == 0) {
      return error(this, `Reference element not found in window: ${tWndID} ${tElemID}`, Symbol.for("setInfoFlag"));
    }
    const tLocV = tWndObj.getProperty(Symbol.for("locY")) + tElem.getProperty(Symbol.for("locY")) - 7;
    const tlocz = tWndObj.getProperty(Symbol.for("locZ")) + (tElem.getProperty(Symbol.for("locY")) * 10);
    const tObject = this.getFlagObject(tSetID, tID, tFlagType, 1);
    tObject.define(tID, tLocV, tlocz, tColor, tFlagType, tItemInfo);
    tObject.createWindows(tObject);
    return 1;
  }

  removeFlagSet(tSetID) {
    if (this.pFlagSetIndex.findPos(tSetID) == 0) {
      return 1;
    }
    const tFlagSet = this.pFlagSetIndex.getaProp(tSetID);
    for (const tObjectID of tFlagSet) {
      this.Remove(tObjectID);
    }
    this.pFlagSetIndex.deleteProp(tSetID);
    return 1;
  }

  Remove(tID) {
    tID = this.getMatchingFlagId(tID);
    if (tID == VOID) {
      return 0;
    }
    const tObject = this.pFlagList.getaProp(tID);
    if (tObject != 0) {
      tObject.deconstruct();
    }
    this.pFlagList.deleteProp(tID);
    this.pFlagSetIndex.deleteProp(tID);
    this.pCloseTimerList.deleteProp(tID);
    return 1;
  }

  exists(tID) {
    tID = this.getMatchingFlagId(tID);
    if (tID == VOID) {
      return 0;
    }
    return this.pFlagList.findPos(tID) > 0;
  }

  getMatchingFlagId(tWndID) {
    for (let i = 1; i <= this.pFlagList.count; i++) {
      const tItemName = this.pFlagList.getPropAt(i);
      if ((tWndID == tItemName) || (tWndID.contains(`${tItemName}_`))) {
        return this.pFlagList.getPropAt(i);
      }
    }
    return 0;
  }

  getFlagObject(tSetID, tID, tFlagType, tAddIfMissing) {
    if (tSetID == VOID) {
      return 0;
    }
    if (tID == VOID) {
      return 0;
    }
    let tObject = this.pFlagList.getaProp(tID);
    if (tObject != 0) {
      return tObject;
    }
    if (!tAddIfMissing) {
      return 0;
    }
    if (memberExists(`IG UIFlag ${tFlagType}`)) {
      tObject = createObject(getUniqueID(), list("IG UIFlag Class", `IG UIFlag ${tFlagType}`));
    } else {
      tObject = createObject(getUniqueID(), "IG UIFlag Class");
    }
    if (tObject == 0) {
      return 0;
    }
    this.pFlagList.setaProp(tID, tObject);
    let tSetIndex = this.pFlagSetIndex.getaProp(tSetID);
    if (!listp(tSetIndex)) {
      tSetIndex = list();
    }
    tSetIndex.append(tID);
    this.pFlagSetIndex.setaProp(tSetID, tSetIndex);
    return tObject;
  }

  removeAllFlagObjects() {
    for (const tObject of this.pFlagList) {
      tObject.deconstruct();
    }
    this.pFlagList = propList();
    this.pFlagSetIndex = propList();
    this.pCloseTimerList = propList();
    return 1;
  }

  getWindowWrapper() {
    return getObject(Symbol.for("ig_window_wrapper"));
  }
}
