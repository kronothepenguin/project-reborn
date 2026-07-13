export default class {
  pID;
  pItemList;
  pPropsList;
  pScrollStep;
  pScrollList;
  pLocX;
  pLocY;

  construct() {
    this.pItemList = propList();
    this.pPropsList = propList();
    this.pScrollList = list();
    this.pScrollStep = -1;
    return 1;
  }

  deconstruct() {
    this.clearSet();
    return 1;
  }

  update() {
    if (this.pScrollList.count == 0) {
      return 0;
    }
    let i = 1;
    while (i <= this.pScrollList.count) {
      const tWindowID = this.pScrollList[i];
      const tWndObj = getWindow(tWindowID);
      const tWindowX = tWndObj.getProperty(Symbol.for("locX"));
      let tLocX;
      let tScrollActive;
      if (this.pScrollStep > 0) {
        tScrollActive = (tWindowX + this.pScrollStep) < this.pLocX;
        if (tScrollActive) {
          tLocX = tWindowX + this.pScrollStep;
        }
      } else {
        tScrollActive = ((this.pLocX - tWindowX) / 2) >= 1;
        if (tScrollActive) {
          tLocX = tWindowX + ((this.pLocX - tWindowX) / 2);
        }
      }
      if (tScrollActive) {
        i = i + 1;
      } else {
        tLocX = this.pLocX;
        this.pScrollList.deleteOne(tWindowID);
      }
      tWndObj.moveBy(tLocX - tWindowX, 0);
    }
    return 1;
  }

  define(tSetID) {
    this.pID = tSetID;
    return 1;
  }

  show() {
    for (const tID of this.pItemList) {
      const tWndObj = getWindow(tID);
      if (tWndObj != 0) {
        tWndObj.show();
      }
    }
    return 1;
  }

  hide() {
    for (const tID of this.pItemList) {
      const tWndObj = getWindow(tID);
      if (tWndObj != 0) {
        tWndObj.hide();
      }
    }
    return 1;
  }

  Activate() {
    const tWndMgr = getWindowManager();
    if (tWndMgr == 0) {
      return 0;
    }
    for (const tID of this.pItemList) {
      tWndMgr.Activate(tID);
    }
    return 1;
  }

  addOneWindow(tPartId, tOrderNum, tProps) {
    this.pItemList.setaProp(tOrderNum, tPartId);
    this.pItemList.sort();
    this.pPropsList.setaProp(tPartId, tProps);
    return 1;
  }

  removeOneWindow(tPartId) {
    if (tPartId == VOID) {
      return 0;
    }
    if (!removeWindow(tPartId)) {
      error(this, `Problems removing window ${tPartId}`, Symbol.for("removeOneWindow"));
    }
    for (let i = 1; i <= this.pItemList.count; i++) {
      const tItemID = this.pItemList[i];
      if (tItemID == tPartId) {
        this.pItemList.deleteAt(i);
        break;
      }
    }
    this.pPropsList.deleteProp(tPartId);
    return 1;
  }

  getItems() {
    return this.pItemList;
  }

  getCount() {
    return this.pItemList.count;
  }

  getHighestIndex() {
    let tMaxIndex = -1;
    for (let i = 1; i <= this.pItemList.count; i++) {
      const tOrderNum = this.pItemList.getPropAt(i);
      if (tOrderNum > tMaxIndex) {
        tMaxIndex = tOrderNum;
      }
    }
    return tMaxIndex;
  }

  getProperty(tKey) {
    switch (tKey) {
      case Symbol.for("height"):
        return this.getAllWindowProperty(Symbol.for("height"), Symbol.for("total")) + this.getAllDefinitionProperty(Symbol.for("spaceBottom"), Symbol.for("total"));
      case Symbol.for("width"):
        return this.getAllWindowProperty(Symbol.for("width"), Symbol.for("max"));
      case Symbol.for("locX"):
        return this.pLocX;
      case Symbol.for("locY"):
        return this.pLocY;
      case Symbol.for("span_all_columns"):
        return this.getAllDefinitionProperty(Symbol.for("span_all_columns"));
    }
    return 0;
  }

  render(tMaxWidth, tMaxHeight) {
    const tCount = this.pItemList.count;
    const tOwnWidth = this.getProperty(Symbol.for("width"), Symbol.for("total"));
    if (tMaxWidth < 1) {
      tMaxWidth = tOwnWidth;
    }
    const tOwnHeight = this.getProperty(Symbol.for("height"), Symbol.for("total"));
    if (tMaxHeight < 1) {
      tMaxHeight = tOwnHeight;
    }
    for (const tWindowID of this.pItemList) {
      const tWndObj = getWindow(tWindowID);
      if (tWndObj == 0) {
        return 0;
      }
      const tProps = this.pPropsList.getaProp(tWindowID);
      if (tProps != VOID) {
        for (let j = 1; j <= tProps.count; j++) {
          const tKey = tProps.getPropAt(j);
          const tValue = tProps[j];
          switch (tKey) {
            case Symbol.for("scaleV"):
              const tHeightD = tMaxHeight - tOwnHeight;
              tWndObj.resizeBy(0, tHeightD);
              break;
            case Symbol.for("scrollFromLocX"):
              if (!this.pScrollList.findPos(tWindowID)) {
                this.pScrollList.append(tWindowID);
                const tBoundary = tWndObj.getProperty(Symbol.for("boundary")).duplicate();
                tBoundary[1] = tValue;
                tWndObj.setProperty(Symbol.for("boundary"), tBoundary);
                tWndObj.moveTo(tValue, tWndObj.getProperty(Symbol.for("locY")));
              }
              break;
          }
        }
      }
    }
    return 1;
  }

  clearSet() {
    for (const tPartId of this.pItemList) {
      if (!removeWindow(tPartId)) {
        error(this, `Unable to remove window ${tPartId}`, Symbol.for("deconstruct"));
      }
    }
    this.pItemList = propList();
    this.pPropsListList = propList();
    return 1;
  }

  getElement(tElemID) {
    const tCount = this.pItemList.count;
    for (const tWindowID of this.pItemList) {
      const tWndObj = getWindow(tWindowID);
      if (tWndObj == 0) {
        return 0;
      }
      const tElem = tWndObj.getElement(tElemID);
      if (objectp(tElem)) {
        return tElem;
      }
    }
    return 0;
  }

  moveZ(tZ) {
    for (const tWindowID of this.pItemList) {
      const tWndObj = getWindow(tWindowID);
      if (tWndObj == 0) {
        return 0;
      }
      tWndObj.moveZ(tZ);
      tZ = tZ + 1;
    }
    return 1;
  }

  moveTo(tLocX, tLocY) {
    this.pLocX = tLocX;
    this.pLocY = tLocY;
    for (const tWindowID of this.pItemList) {
      const tWndObj = getWindow(tWindowID);
      if (tWndObj == 0) {
        return 0;
      }
      const tProps = this.pPropsList.getaProp(tWindowID);
      tLocX = this.pLocX;
      let tFixed = 0;
      let tSpaceBottom = 0;
      if (tProps != VOID) {
        if (tProps.findPos(Symbol.for("locY"))) {
          tFixed = 1;
          tLocY = tProps.getaProp(Symbol.for("locY"));
        }
        if (tProps.findPos(Symbol.for("scrollFromLocX"))) {
          tLocX = tWndObj.getProperty(Symbol.for("locX"));
        }
        if (tProps.findPos(Symbol.for("spaceBottom"))) {
          tSpaceBottom = tProps.getaProp(Symbol.for("spaceBottom"));
        }
      }
      if (tFixed == 0) {
        tWndObj.moveTo(tLocX, tLocY);
      }
      tLocY = tLocY + tWndObj.getProperty(Symbol.for("height")) + tSpaceBottom;
    }
    return 1;
  }

  getRealLocation() {
    if (this.pItemList.count == 0) {
      return point(this.pLocX, this.pLocY);
    }
    const tWindowID = this.pItemList[1];
    const tProps = this.pPropsList.getaProp(tWindowID);
    if (listp(tProps)) {
      if (tProps.findPos(Symbol.for("scrollFromLocX"))) {
        return point(this.pLocX, this.pLocY);
      }
    }
    const tWndObj = getWindow(tWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    return point(tWndObj.getProperty(Symbol.for("locX")), tWndObj.getProperty(Symbol.for("locY")));
  }

  getAllDefinitionProperty(tKey, tMode, tResult) {
    const tCount = this.pPropsList.count;
    for (let i = 1; i <= tCount; i++) {
      const tList = this.pPropsList[i];
      if (listp(tList)) {
        if (tList.findPos(tKey)) {
          const tValue = tList.getaProp(tKey);
          switch (tMode) {
            case Symbol.for("total"):
              tResult = tResult + tValue;
              break;
            case Symbol.for("max"):
              if (tValue > tResult) {
                tResult = tValue;
              }
              break;
            default:
              return tValue;
          }
        }
      }
    }
    return tResult;
  }

  getAllWindowProperty(tKey, tMode, tResult) {
    const tCount = this.pItemList.count;
    for (let i = 1; i <= tCount; i++) {
      const tWindowID = this.pItemList[i];
      const tWndObj = getWindow(tWindowID);
      if (tWndObj == 0) {
        return 0;
      }
      const tValue = tWndObj.getProperty(tKey);
      switch (tMode) {
        case Symbol.for("total"):
          tResult = tResult + tValue;
          break;
        case Symbol.for("max"):
          if (tValue > tResult) {
            tResult = tValue;
          }
          break;
        default:
          return tValue;
      }
    }
    return tResult;
  }
}
