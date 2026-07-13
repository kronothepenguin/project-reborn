export default class {
  pMessageBuffer;
  pPlaceHolderList;
  pDownloader;
  pTempTimeOutID;
  pTempDownloadList;
  pSimulatedDownload;

  construct() {
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("leaveRoom"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("leaveRoom"));
    registerMessage(Symbol.for("downloadObject"), this.getID(), Symbol.for("downloadObject"));
    this.pPlaceHolderList = propList("active", propList(), "item", propList());
    this.pMessageBuffer = propList("active", propList(), "item", propList());
    this.pTempTimeOutID = "temp_temp_timeout";
    this.pTempDownloadList = propList();
    this.pSimulatedDownload = max(0, getIntVariable("buffer.simulateddownload", 0));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    unregisterMessage(Symbol.for("downloadObject"), this.getID());
    this.pPlaceHolderList = propList();
    this.pMessageBuffer = propList();
    if (timeoutExists(this.pTempTimeOutID)) {
      removeTimeout(this.pTempTimeOutID);
    }
    return 1;
  }

  processObject(tObj, ttype) {
    tClass = this.getClassName(tObj[Symbol.for("class")], tObj[Symbol.for("type")]);
    tID = tObj[Symbol.for("id")];
    if (voidp(tClass) || voidp(tID)) {
      return tObj;
    }
    if ((ttype != "active") && (ttype != "item")) {
      return tObj;
    }
    if (this.pSimulatedDownload) {
      tIsDownloaded = this.pTempDownloadList[tClass];
    } else {
      if (getThread(Symbol.for("dynamicdownloader")) == 0) {
        tIsDownloaded = 1;
      } else {
        tIsDownloaded = getThread(Symbol.for("dynamicdownloader")).getComponent().isAssetDownloaded(tClass);
      }
    }
    if (!tIsDownloaded) {
      if (voidp(this.pPlaceHolderList[ttype])) {
        this.pPlaceHolderList[ttype] = propList();
      }
      tObjCopy = tObj.duplicate();
      if (voidp(this.pPlaceHolderList[ttype].findPos(tID))) {
        this.pPlaceHolderList[ttype].addProp(tID, tObjCopy);
      } else {
        this.pPlaceHolderList[ttype][tID] = tObjCopy;
      }
      tAssetType = EMPTY;
      if (ttype == "active") {
        tObj[Symbol.for("dimensions")] = list(1, 1);
        tObj[Symbol.for("class")] = "active_placeholder";
        tAssetType = Symbol.for("Active");
      } else {
        if (ttype == "item") {
          tObj[Symbol.for("class")] = "item_placeholder";
          tObj[Symbol.for("type")] = EMPTY;
          tAssetType = Symbol.for("item");
        }
      }
      this.downloadClass(tClass, tAssetType);
    }
    return tObj;
  }

  downloadCompleted(tClassID, tSuccess) {
    for (let ttype = 1; ttype <= this.pPlaceHolderList.count; ttype++) {
      tUpdated = 0;
      tTypeName = this.pPlaceHolderList.getPropAt(ttype);
      tPlaceHolderList = this.pPlaceHolderList[ttype];
      for (let tIndex = tPlaceHolderList.count; tIndex >= 1; tIndex--) {
        tObj = tPlaceHolderList[tIndex];
        tClass = this.getClassName(tObj[Symbol.for("class")], tObj[Symbol.for("type")]);
        if (tClass == tClassID) {
          tID = tObj[Symbol.for("id")];
          tExists = 0;
          if (tTypeName == "active") {
            tExists = getThread(Symbol.for("room")).getComponent().activeObjectExists(tID);
          } else {
            if (tTypeName == "item") {
              tExists = getThread(Symbol.for("room")).getComponent().itemObjectExists(tID);
            }
          }
          if (tExists && tSuccess) {
            if (tTypeName == "active") {
              getThread(Symbol.for("room")).getComponent().validateActiveObjects(tObj);
              if (!voidp(tObj.findPos(Symbol.for("stripId")))) {
                getThread(Symbol.for("room")).getComponent().getActiveObject(tID).setaProp(Symbol.for("stripId"), tObj[Symbol.for("stripId")]);
              }
            } else {
              if (tTypeName == "item") {
                getThread(Symbol.for("room")).getComponent().validateItemObjects(tObj);
                if (!voidp(tObj.findPos(Symbol.for("stripId")))) {
                  getThread(Symbol.for("room")).getComponent().getItemObject(tID).setaProp(Symbol.for("stripId"), tObj[Symbol.for("stripId")]);
                }
              }
            }
            this.processMessageBuffer(tID, ttype);
            tUpdated = 1;
            executeMessage(Symbol.for("objectFinalized"), tID);
          } else {
            if (!voidp(this.pMessageBuffer[ttype])) {
              this.pMessageBuffer[ttype].deleteProp(tID);
            }
          }
          tPlaceHolderList.deleteAt(tIndex);
        }
      }
      if (tUpdated) {
        if (tTypeName == "active") {
          executeMessage(Symbol.for("activeObjectsUpdated"));
          continue;
        }
        if (tTypeName == "item") {
          executeMessage(Symbol.for("itemObjectsUpdated"));
        }
      }
    }
  }

  downloadObject(tdata) {
    if (ilk(tdata) != Symbol.for("propList")) {
      return 0;
    }
    tClass = this.getClassName(tdata[Symbol.for("class")], tdata[Symbol.for("type")]);
    if (getThread(Symbol.for("dynamicdownloader")) == 0) {
      tIsDownloaded = 1;
    } else {
      tIsDownloaded = getThread(Symbol.for("dynamicdownloader")).getComponent().isAssetDownloaded(tClass);
    }
    if (tIsDownloaded) {
      tdata[Symbol.for("ready")] = 1;
      return 1;
    }
    tdata[Symbol.for("ready")] = 0;
    this.downloadClass(tClass, tdata[Symbol.for("type")]);
    return 1;
  }

  removeObject(tID, ttype) {
    if (!voidp(this.pPlaceHolderList[ttype])) {
      this.pPlaceHolderList[ttype].deleteProp(tID);
    }
    if (!voidp(this.pMessageBuffer[ttype])) {
      this.pMessageBuffer[ttype].deleteProp(tID);
    }
  }

  bufferMessage(tMsg, tID, ttype) {
    if (!listp(tMsg)) {
      return 0;
    }
    tSubject = tMsg[Symbol.for("subject")];
    if (voidp(tID) || voidp(ttype) || voidp(tSubject)) {
      return 0;
    }
    if (voidp(this.pPlaceHolderList[ttype]) || voidp(this.pMessageBuffer[ttype])) {
      return 0;
    }
    if (!voidp(this.pPlaceHolderList[ttype].findPos(tID))) {
      if (voidp(this.pMessageBuffer[ttype].findPos(tID))) {
        this.pMessageBuffer[ttype][tID] = list();
      }
      tBuffer = this.pMessageBuffer[ttype][tID];
      for (let tIndex = 1; tIndex <= tBuffer.count; tIndex++) {
        tMsg_old = tBuffer[tIndex];
        tSubjectOld = tMsg_old[Symbol.for("subject")];
        if (tSubject == tSubjectOld) {
          tBuffer.deleteAt(tIndex);
          break;
        }
      }
      this.pMessageBuffer[ttype][tID].add(tMsg);
    }
  }

  processMessageBuffer(tID, ttype) {
    if (voidp(tID) || voidp(ttype)) {
      return 0;
    }
    if (voidp(this.pMessageBuffer[ttype])) {
      return 0;
    }
    tBuffer = this.pMessageBuffer[ttype].getaProp(tID);
    if (!voidp(tBuffer)) {
      for (const tMsg of tBuffer) {
        tSubject = tMsg[Symbol.for("subject")];
        tContent = tMsg.content;
        tConn = tMsg.connection;
        if (!voidp(tConn)) {
          tMsgStr = tConn.getProperty(Symbol.for("message"));
          tMsgCopy = propList();
          for (let tIndex = 1; tIndex <= tMsgStr.count; tIndex++) {
            tProp = tMsgStr.getPropAt(tIndex);
            tValue = tMsgStr[tIndex];
            tMsgCopy[tProp] = tValue;
            tMsgStr[tProp] = tMsg.getaProp(tProp);
          }
          switch (tSubject) {
            case "88":
              getThread(Symbol.for("room")).getHandler().handle_stuffdataupdate(tMsg);
              break;
            case "95":
              getThread(Symbol.for("room")).getHandler().handle_activeobject_update(tMsg);
              break;
            case "85":
              getThread(Symbol.for("room")).getHandler().handle_updateitem(tMsg);
              break;
          }
          for (let tIndex = 1; tIndex <= tMsgCopy.count; tIndex++) {
            tProp = tMsgCopy.getPropAt(tIndex);
            tValue = tMsgCopy[tIndex];
            tMsgStr[tProp] = tValue;
          }
        }
      }
      this.pMessageBuffer[ttype].deleteProp(tID);
    }
    return 1;
  }

  leaveRoom() {
    this.pPlaceHolderList = propList("active", propList(), "item", propList());
    this.pMessageBuffer = propList("active", propList(), "item", propList());
  }

  getClassName(tClass, ttype) {
    tName = tClass;
    if (tName.includes("*")) {
      tDelim = the.itemDelimiter;
      the.itemDelimiter = "*";
      tName = tName.item[1];
      the.itemDelimiter = tDelim;
    }
    if (getThread(Symbol.for("room")).getInterface().getGeometry().getTileWidth() < 64) {
      tName = `s_${tName}`;
    }
    if (!voidp(ttype) && (ttype != EMPTY) && (tClass == "poster")) {
      tName = `${tName} ${string(ttype)}`;
    }
    return tName;
  }

  downloadClass(tClass, ttype) {
    if (this.pSimulatedDownload) {
      if (voidp(this.pTempDownloadList.findPos(tClass))) {
        this.pTempDownloadList.addProp(tClass, 0);
      }
      if (timeoutExists(this.pTempTimeOutID)) {
        removeTimeout(this.pTempTimeOutID);
      }
      createTimeout(this.pTempTimeOutID, this.pSimulatedDownload, Symbol.for("tempCallback"), this.getID(), VOID, 1);
    } else {
      getThread(Symbol.for("dynamicdownloader")).getComponent().downloadCastDynamically(tClass, ttype, this.getID(), Symbol.for("downloadCompleted"));
    }
  }

  tempCallback() {
    tIndex = this.pTempDownloadList.getPos(0);
    if (tIndex > 0) {
      this.pTempDownloadList[tIndex] = 1;
      this.downloadCompleted(this.pTempDownloadList.getPropAt(tIndex), 1);
      if (timeoutExists(this.pTempTimeOutID)) {
        removeTimeout(this.pTempTimeOutID);
      }
      createTimeout(this.pTempTimeOutID, this.pSimulatedDownload, Symbol.for("tempCallback"), this.getID(), VOID, 1);
    }
  }
}
