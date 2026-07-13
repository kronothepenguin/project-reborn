export default class {
  pSetIndex;
  pSetList;
  pSetOrderIndex;
  pProcedureList;
  pLocX;
  pLocY;
  pLocZ;
  pVisible;
  pUpdateCounter;

  construct() {
    this.pSetIndex = propList();
    this.pSetOrderIndex = list();
    this.pSetList = propList();
    this.pProcedureList = propList();
    this.pVisible = 1;
    receiveUpdate(this.getID());
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    this.removeAllParts();
    return 1;
  }

  update() {
    this.pUpdateCounter = this.pUpdateCounter + 1;
    if (this.pUpdateCounter < 3) {
      return 1;
    }
    this.pUpdateCounter = 0;
    for (const tObject of this.pSetList) {
      tObject.update();
    }
    return 1;
  }

  getProperty(tKey) {
    switch (tKey) {
      case Symbol.for("visible"):
        return this.pVisible;
      case Symbol.for("height"):
        return this.getWrapperProperty(Symbol.for("height"), Symbol.for("max"));
      case Symbol.for("width"):
        const tSetCount = this.pSetOrderIndex.count;
        let tWidth = 0;
        for (let i = 1; i <= tSetCount; i++) {
          tWidth = tWidth + this.getWrapperProperty(Symbol.for("width"), Symbol.for("max"), i);
        }
        return tWidth;
    }
    return 0;
  }

  moveTo(tLocX, tLocY) {
    this.pLocX = tLocX;
    this.pLocY = tLocY;
    let tOffsetX = 0;
    let tTopOffsetY = 0;
    const tColumnCount = this.pSetOrderIndex.count;
    for (const tSetColumn of this.pSetOrderIndex) {
      let tOffsetY = tTopOffsetY;
      let tColumnMaxWidth = 0;
      for (const tSetID of tSetColumn) {
        const tSetObject = this.pSetList.getaProp(tSetID);
        if (tSetObject != 0) {
          tSetObject.moveTo(tLocX + tOffsetX, tLocY + tOffsetY);
          tOffsetY = tOffsetY + tSetObject.getProperty(Symbol.for("height"));
          if (tSetObject.getProperty(Symbol.for("span_all_columns"))) {
            tTopOffsetY = tOffsetY;
            continue;
          }
          const tWidth = tSetObject.getProperty(Symbol.for("width"));
          if (tWidth > tColumnMaxWidth) {
            tColumnMaxWidth = tWidth;
          }
        }
      }
      tOffsetX = tOffsetX + tColumnMaxWidth;
    }
    return 1;
  }

  moveZ(tZ) {
    this.pLocZ = tZ;
    for (const tSetObject of this.pSetList) {
      if (tSetObject != 0) {
        tSetObject.moveZ(this.pLocZ);
      }
    }
    return 1;
  }

  addOneWindow(tPartId, tLayout, tSetID, tProps) {
    if (tSetID == VOID) {
      return 0;
    }
    if (this.pSetIndex.findPos(tPartId) > 0) {
      return this.replaceOneWindow(tPartId, tLayout, 0);
    }
    let tSetItem = this.getSet(tSetID);
    if (tSetItem == 0) {
      tSetItem = this.createSet(tSetID);
    }
    if (tSetItem == 0) {
      return 0;
    }
    const tOrderNum = tSetItem.getHighestIndex(tSetID) + 1;
    createWindow(tPartId, tLayout);
    const tWndObj = getWindow(tPartId);
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.lock();
    if (!this.pVisible) {
      tWndObj.hide();
    }
    this.addCurrentProceduresOnWindow(tWndObj);
    if (listp(tProps)) {
      const tScrollToPlace = tProps.findPos(Symbol.for("scrollFromLocX"));
      if (!tScrollToPlace && tProps.findPos(Symbol.for("locX")) && tProps.findPos(Symbol.for("locY"))) {
        tWndObj.moveTo(tProps.getaProp(Symbol.for("locX")), tProps.getaProp(Symbol.for("locY")));
      }
    }
    if (!tSetItem.addOneWindow(tPartId, tOrderNum, tProps)) {
      return 0;
    }
    this.pSetIndex.setaProp(tPartId, tSetID);
    return 1;
  }

  initSet(tSetID, tColumnNum, tOrderNum) {
    if (this.existsSet(tSetID)) {
      return this.clearSet(tSetID);
    } else {
      return this.createSet(tSetID, tColumnNum, tOrderNum);
    }
  }

  Activate() {
    for (const tSetColumn of this.pSetOrderIndex) {
      for (const tSetID of tSetColumn) {
        const tSetObject = this.pSetList.getaProp(tSetID);
        if (tSetObject != 0) {
          tSetObject.Activate();
        }
      }
    }
  }

  activateSet(tSetID) {
    const tSetObject = this.getSet(tSetID);
    if (tSetObject == 0) {
      return 0;
    }
    return tSetObject.Activate();
  }

  createSet(tSetID, tColumnNum, tOrderNum) {
    if (this.existsSet(tSetID)) {
      return 1;
    }
    const tSetObject = createObject(Symbol.for("temp"), "Multicomponent Window Wrapper Set Class");
    if (tSetObject == 0) {
      return 0;
    }
    tSetObject.define(tSetID);
    if (tColumnNum == VOID) {
      tColumnNum = 1;
    }
    if (tOrderNum == VOID) {
      tOrderNum = this.getNextFreeSetIndex(tColumnNum);
    }
    this.pSetList.setaProp(tSetID, tSetObject);
    if (this.pSetOrderIndex.count < tColumnNum) {
      const tCount = this.pSetOrderIndex.count;
      for (let i = tCount + 1; i <= tColumnNum; i++) {
        this.pSetOrderIndex[i] = propList();
      }
    }
    this.pSetOrderIndex[tColumnNum].setaProp(tOrderNum, tSetID);
    this.pSetOrderIndex[tColumnNum].sort();
    this.moveTo(this.pLocX, this.pLocY);
    return tSetObject;
  }

  clearSet(tSetID, tRender) {
    if (tSetID == VOID) {
      return 0;
    }
    const tSetObject = this.getSet(tSetID);
    if (tSetObject == VOID) {
      return 1;
    }
    tSetObject.clearSet();
    let i = 1;
    while (i <= this.pSetIndex.count) {
      if (this.pSetIndex[i] == tSetID) {
        this.pSetIndex.deleteAt(i);
        continue;
      }
      i = i + 1;
    }
    this.moveTo(this.pLocX, this.pLocY);
    return 1;
  }

  removeSet(tSetID, tRender) {
    if (tSetID == VOID) {
      return 0;
    }
    const tSetObject = this.getSet(tSetID);
    if (tSetObject == VOID) {
      return 1;
    }
    tSetObject.deconstruct();
    this.pSetList.deleteProp(tSetID);
    let i = 1;
    while (i <= this.pSetIndex.count) {
      if (this.pSetIndex[i] == tSetID) {
        this.pSetIndex.deleteAt(i);
        continue;
      }
      i = i + 1;
    }
    let tDone = 0;
    for (let i = 1; i <= this.pSetOrderIndex.count; i++) {
      const tSetColumn = this.pSetOrderIndex[i];
      for (let j = 1; j <= tSetColumn.count; j++) {
        if (tSetColumn[j] == tSetID) {
          tDone = 1;
          tSetColumn.deleteAt(j);
        }
        if (tDone == 1) {
          break;
        }
      }
      if (tDone == 1) {
        break;
      }
    }
    if (tRender) {
      this.render();
    }
    return 1;
  }

  removeMatchingSets(tWindowSetId, tRender) {
    if (tWindowSetId == VOID) {
      return 0;
    }
    const tIdLength = tWindowSetId.length;
    let i = 1;
    while (i <= this.pSetIndex.count) {
      const tTestString = this.pSetIndex[i];
      if (tTestString.char[`1..${tIdLength}`] == tWindowSetId) {
        this.removeSet(tTestString, tRender);
        continue;
      }
      i = i + 1;
    }
    return 1;
  }

  existsSet(tSetID) {
    if (this.pSetList.findPos(tSetID) > 0) {
      return 1;
    }
    return 0;
  }

  getSetItems(tSetID) {
    const tSetObject = this.pSetList.getaProp(tSetID);
    if (tSetObject == 0) {
      return 0;
    }
    return tSetObject.getItems();
  }

  removeOneWindow(tPartId, tRender) {
    const tSetID = this.pSetIndex.getaProp(tPartId);
    if (tSetID == 0) {
      return error(this, `Part not found in any set: ${tPartId}`, Symbol.for("removeOneWindow"));
    }
    const tSetObject = this.pSetList.getaProp(tSetID);
    if (tSetObject == 0) {
      return error(this, `Set object not found: ${tSetID}`, Symbol.for("removeOneWindow"));
    }
    if (tSetObject.removeOneWindow(tPartId)) {
      this.pSetIndex.deleteProp(tPartId);
      if (tSetObject.getCount() == 0) {
        this.removeSet(tSetID);
      }
    }
    if (tRender) {
      this.render();
    }
    return 1;
  }

  replaceOneWindow(tPartId, tLayout, tRender) {
    if (tPartId == VOID) {
      return 0;
    }
    const tSetID = this.pSetIndex.getaProp(tPartId);
    if (tSetID == 0) {
      return error(this, `Part not found in set index: ${tPartId}`, Symbol.for("replaceOneWindow"));
    }
    const tSetObject = this.pSetList.getaProp(tSetID);
    if (tSetObject == 0) {
      return error(this, `Set object not found: ${tSetID}`, Symbol.for("replaceOneWindow"));
    }
    removeWindow(tPartId);
    createWindow(tPartId, tLayout);
    const tWndObj = getWindow(tPartId);
    if (tWndObj == 0) {
      return error(this, `New window not found: ${tPartId}`, Symbol.for("replaceOneWindow"));
    }
    tWndObj.lock();
    this.addCurrentProceduresOnWindow(tWndObj);
    if (!this.pVisible) {
      tWndObj.hide();
    }
    if (tRender) {
      this.render();
    }
    return 1;
  }

  windowExists(tPartId) {
    if (tPartId == VOID) {
      return 0;
    }
    return this.pSetIndex.findPos(tPartId) != 0;
  }

  getElement(tElemID, tWndID) {
    for (const tSetObject of this.pSetList) {
      const tElem = tSetObject.getElement(tElemID);
      if (objectp(tElem)) {
        return tElem;
      }
    }
    return 0;
  }

  render() {
    const tOldLocation = this.getRealLocation();
    let tMaxHeight = this.getWrapperProperty(Symbol.for("height"), Symbol.for("total"), 1);
    const tColumnCount = this.pSetOrderIndex.count;
    for (const tSetColumn of this.pSetOrderIndex) {
      for (const tSetID of tSetColumn) {
        const tSetObject = this.pSetList.getaProp(tSetID);
        if (tSetObject != 0) {
          tSetObject.render(-1, tMaxHeight);
          if (tSetObject.getProperty(Symbol.for("span_all_columns"))) {
            tMaxHeight = tMaxHeight - tSetObject.getProperty(Symbol.for("height"));
          }
        }
      }
    }
    this.moveTo(tOldLocation[1], tOldLocation[2]);
    return 1;
  }

  hide() {
    this.pVisible = 0;
    for (const tSetObject of this.pSetList) {
      if (objectp(tSetObject)) {
        tSetObject.hide();
      }
    }
    return 1;
  }

  show() {
    this.pVisible = 1;
    for (const tSetObject of this.pSetList) {
      if (objectp(tSetObject)) {
        tSetObject.show();
      }
    }
    return 1;
  }

  registerProcedure(tMethod, tClientID, tEvent) {
    if (tEvent == VOID) {
      return 0;
    }
    if (tClientID == VOID) {
      return 0;
    }
    if (tMethod == VOID) {
      return 0;
    }
    let tEventItem = this.pProcedureList.getaProp(tEvent);
    if (tEventItem == VOID) {
      tEventItem = propList();
    }
    tEventItem.setaProp(tClientID, tMethod);
    this.pProcedureList.setaProp(tEvent, tEventItem);
    for (const tSetObject of this.pSetList) {
      if (tSetObject == 0) {
        return 0;
      }
      const tPartList = tSetObject.getItems();
      for (const tWindowID of tPartList) {
        const tWindow = getWindow(tWindowID);
        if (tWindow == 0) {
          return 0;
        }
        tWindow.registerProcedure(tMethod, tClientID, tEvent);
      }
    }
    return 1;
  }

  removeProcedure(tEvent) {
    if (tEvent == VOID) {
      return 0;
    }
    const tEventItem = this.pProcedureList.getaProp(tEvent);
    if (tEventItem == VOID) {
      return 1;
    }
    for (let i = 1; i <= tEventItem.count; i++) {
      const tItemClientId = tEventItem.getPropAt(i);
      const tWindow = getWindow(tItemClientId);
      if (tWindow != 0) {
        tWindow.removeProcedure(tEvent);
      }
    }
    this.pProcedureList.deleteProp(tEvent);
    return 1;
  }

  getRealLocation() {
    if (this.pSetOrderIndex.count == 0) {
      return point(this.pLocX, this.pLocY);
    }
    const tSetColumn = this.pSetOrderIndex[1];
    if (tSetColumn.count == 0) {
      return point(this.pLocX, this.pLocY);
    }
    const tSetObject = this.getSet(tSetColumn[1]);
    return tSetObject.getRealLocation();
  }

  getSet(tSetID) {
    return this.pSetList.getaProp(tSetID);
  }

  getWrapperProperty(tKey, tMode, tColumnNum, tResult) {
    const tSetCount = this.pSetOrderIndex.count;
    if (tColumnNum > tSetCount) {
      return 0;
    }
    if (tColumnNum < 1) {
      for (let i = 1; i <= tSetCount; i++) {
        const tValue = this.getWrapperProperty(tKey, Symbol.for("total"), i);
        switch (tMode) {
          case Symbol.for("total"):
            tResult = tResult + tValue;
            break;
          case Symbol.for("max"):
            if (tValue > tResult) {
              tResult = tValue;
            }
            break;
        }
      }
    } else {
      const tSetColumn = this.pSetOrderIndex[tColumnNum];
      for (let j = 1; j <= tSetColumn.count; j++) {
        const tSetObject = this.getSet(tSetColumn[j]);
        if (tSetObject == 0) {
          return error(this, `Set object not found: ${tSetColumn[j]}`, Symbol.for("getWrapperProperty"));
        }
        tResult = tSetObject.getAllWindowProperty(tKey, tMode, tResult);
      }
    }
    return tResult;
  }

  getNextFreeSetIndex(tColumnNum) {
    if (tColumnNum > this.pSetOrderIndex.count) {
      return 1;
    }
    const tSetColumn = this.pSetOrderIndex[tColumnNum];
    for (let i = 1; i <= tSetColumn.count; i++) {
      const tNextIndex = tSetColumn.getPropAt(i) + 1;
      if (tSetColumn.findPos(tNextIndex) == 0) {
        return tNextIndex;
      }
    }
    return 0;
  }

  addCurrentProceduresOnWindow(tWndObj) {
    if (tWndObj == 0) {
      return 0;
    }
    for (let i = 1; i <= this.pProcedureList.count; i++) {
      const tEvent = this.pProcedureList.getPropAt(i);
      const tProc = this.pProcedureList[i];
      for (let j = 1; j <= tProc.count; j++) {
        const tClientID = tProc.getPropAt(j);
        const tMethod = tProc[j];
        tWndObj.registerProcedure(tMethod, tClientID, tEvent);
      }
    }
    return 1;
  }

  removeAllParts() {
    for (let i = 1; i <= this.pSetOrderIndex.count; i++) {
      const tSetColumn = this.pSetOrderIndex[i];
      while (tSetColumn.count > 0) {
        const tSetID = tSetColumn[1];
        this.removeSet(tSetID);
      }
    }
    this.pItemList = propList();
    this.pSetIndex = propList();
    this.pSetList = propList();
    this.pSetOrderIndex = list();
    return 1;
  }
}
