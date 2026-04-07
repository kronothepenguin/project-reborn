// fuse_client/27_Object Manager Class.ls → object-manager-class.js
// Core object manager - handles object lifecycle, updates, and managers

import {
  symbol,
  symbolp,
  stringp,
  voidP,
  objectp,
  listp,
  error,
  member,
  script,
  createPropList,
  Timeout,
  theMilliSeconds,
} from "../core/lingo-runtime.js";
import { getUniqueID } from "./special-services-api.js";

export class ObjectManagerClass {
  constructor() {
    this.pObjectList = createPropList();
    this.pUpdateList = [];
    this.pPrepareList = [];
    this.pManagerList = [];
    this.pInstanceList = [];
    this.pEraseLock = 0;
    this.pTimeout = null;
    this.pUpdatePause = 0;
    this.pBaseClsMem = null;
  }

  construct() {
    this.pObjectList = createPropList();
    this.pUpdateList = [];
    this.pPrepareList = [];
    this.pManagerList = [];
    this.pInstanceList = [];
    this.pEraseLock = 0;
    this.pTimeout = null;
    this.pUpdatePause = 0;
    // pBaseClsMem = script("Object Base Class") - will be resolved at runtime
    return true;
  }

  deconstruct() {
    this.pEraseLock = 1;
    if (objectp(this.pTimeout)) {
      this.pTimeout.stop();
      this.pTimeout = null;
    }
    for (let i = this.pInstanceList.length - 1; i >= 0; i--) {
      this.Remove(this.pInstanceList[i]);
    }
    for (let i = this.pManagerList.length - 1; i >= 0; i--) {
      this.Remove(this.pManagerList[i]);
    }
    this.pObjectList = createPropList();
    this.pUpdateList = [];
    this.pPrepareList = [];
    return true;
  }

  create(tID, tClassList) {
    if (!symbolp(tID) && !stringp(tID)) {
      return error(
        this,
        "Symbol or string expected: " + tID,
        symbol("#create"),
        symbol("#major"),
      );
    }
    if (objectp(this.pObjectList.getaProp(tID))) {
      return error(
        this,
        "Object already exists: " + tID,
        symbol("#create"),
        symbol("#major"),
      );
    }
    if (tID === symbol("#random")) {
      tID = getUniqueID();
    }
    if (voidP(tClassList)) {
      return error(
        this,
        "Class member name expected!",
        symbol("#create"),
        symbol("#major"),
      );
    }
    if (!listp(tClassList)) {
      tClassList = [tClassList];
    }
    const tClassListDup = [...tClassList];
    let tObject = null;
    let tTemp = null;
    const tBase = script("Object Base Class").new();
    tBase.construct();
    if (tID !== symbol("#temp")) {
      tBase.id = tID;
      this.pObjectList.setaProp(tID, tBase);
    }
    tClassListDup.unshift(tBase);
    for (const tClass of tClassListDup) {
      if (objectp(tClass)) {
        tObject = tClass;
        var tInitFlag = 0;
      } else {
        let tMemNum = 0;
        if (this.managerExists(symbol("#resource_manager"))) {
          tMemNum = this.getManager(symbol("#resource_manager")).getmemnum(
            tClass,
          );
        } else {
          tMemNum = member(tClass).number;
        }
        if (tMemNum < 1) {
          if (tID !== symbol("#temp")) {
            this.pObjectList.deleteProp(tID);
          }
          return error(
            this,
            "Script not found: " + tMemNum,
            symbol("#create"),
            symbol("#major"),
          );
        }
        tObject = script(tMemNum).new();
        tInitFlag = typeof tObject.construct === "function" ? 1 : 0;
      }
      if (tObject && typeof tObject === "object") {
        tObject.ancestor = tTemp;
        tTemp = tObject;
      }
      if (
        tID !== symbol("#temp") &&
        tClassListDup[tClassListDup.length - 1] === tClass
      ) {
        this.pObjectList.setaProp(tID, tObject);
        this.pInstanceList.push(tID);
      }
      if (tInitFlag) {
        tObject.construct();
      }
    }
    return tObject;
  }

  GET(tID) {
    const tObj = this.pObjectList.getaProp(tID);
    if (voidP(tObj)) {
      return 0;
    } else {
      return tObj;
    }
  }

  Remove(tID) {
    const tObj = this.pObjectList.getaProp(tID);
    if (voidP(tObj)) {
      return false;
    }
    if (tObj && typeof tObj === "object") {
      if (!tObj.valid) {
        return false;
      }
      if (tObj.delays) {
        for (let i = 0; i < tObj.delays.length; i++) {
          const tDelayID = tObj.delays[i];
          if (tObj.Cancel) tObj.Cancel(tDelayID);
        }
      }
      if (typeof tObj.deconstruct === "function") {
        tObj.deconstruct();
      }
      tObj.valid = false;
    }
    const updateIdx = this.pUpdateList.indexOf(tObj);
    if (updateIdx >= 0) this.pUpdateList.splice(updateIdx, 1);
    const prepareIdx = this.pPrepareList.indexOf(tObj);
    if (prepareIdx >= 0) this.pPrepareList.splice(prepareIdx, 1);
    if (!this.pEraseLock) {
      this.pObjectList.deleteProp(tID);
      const instIdx = this.pInstanceList.indexOf(tID);
      if (instIdx >= 0) this.pInstanceList.splice(instIdx, 1);
      const mgrIdx = this.pManagerList.indexOf(tID);
      if (mgrIdx >= 0) this.pManagerList.splice(mgrIdx, 1);
    }
    return true;
  }

  exists(tID) {
    if (voidP(tID)) {
      return false;
    }
    return objectp(this.pObjectList.getaProp(tID));
  }

  print() {
    for (let i = 1; i <= this.pObjectList.count; i++) {
      let tProp = this.pObjectList.getPropAt(i);
      if (symbolp(tProp)) {
        tProp = "#" + tProp.toString();
      }
      console.log(tProp, ":", this.pObjectList.getAt(i));
    }
    return true;
  }

  registerObject(tID, tObject) {
    if (!objectp(tObject)) {
      return error(
        this,
        "Invalid object: " + tObject,
        symbol("#register"),
        symbol("#major"),
      );
    }
    if (!voidP(this.pObjectList.getaProp(tID))) {
      return error(
        this,
        "Object already exists: " + tID,
        symbol("#register"),
        symbol("#minor"),
      );
    }
    this.pObjectList.setaProp(tID, tObject);
    this.pInstanceList.push(tID);
    return true;
  }

  unregisterObject(tID) {
    if (voidP(this.pObjectList.getaProp(tID))) {
      return error(
        this,
        "Referred object not found: " + tID,
        symbol("#unregister"),
        symbol("#minor"),
      );
    }
    const tObj = this.pObjectList.getaProp(tID);
    this.pObjectList.deleteProp(tID);
    const updateIdx = this.pUpdateList.indexOf(tObj);
    if (updateIdx >= 0) this.pUpdateList.splice(updateIdx, 1);
    const prepareIdx = this.pPrepareList.indexOf(tObj);
    if (prepareIdx >= 0) this.pPrepareList.splice(prepareIdx, 1);
    const instIdx = this.pInstanceList.indexOf(tID);
    if (instIdx >= 0) this.pInstanceList.splice(instIdx, 1);
    return true;
  }

  registerManager(tID) {
    if (!this.exists(tID)) {
      return error(
        this,
        "Referred object not found: " + tID,
        symbol("#registerManager"),
        symbol("#major"),
      );
    }
    if (this.pManagerList.indexOf(tID) >= 0) {
      return error(
        this,
        "Manager already registered: " + tID,
        symbol("#registerManager"),
        symbol("#minor"),
      );
    }
    const instIdx = this.pInstanceList.indexOf(tID);
    if (instIdx >= 0) this.pInstanceList.splice(instIdx, 1);
    this.pManagerList.push(tID);
    return true;
  }

  unregisterManager(tID) {
    if (!this.exists(tID)) {
      return error(
        this,
        "Referred object not found: " + tID,
        symbol("#unregisterManager"),
        symbol("#minor"),
      );
    }
    if (this.pInstanceList.indexOf(tID) >= 0) {
      return error(
        this,
        "Manager already unregistered: " + tID,
        symbol("#unregisterManager"),
        symbol("#minor"),
      );
    }
    const mgrIdx = this.pManagerList.indexOf(tID);
    if (mgrIdx >= 0) this.pManagerList.splice(mgrIdx, 1);
    this.pInstanceList.push(tID);
    return true;
  }

  getManager(tID) {
    if (!this.pManagerList.includes(tID)) {
      return error(
        this,
        "Manager not found: " + tID,
        symbol("#getManager"),
        symbol("#major"),
      );
    }
    return this.pObjectList.getaProp(tID);
  }

  managerExists(tID) {
    return this.pManagerList.indexOf(tID) >= 0;
  }

  receivePrepare(tID) {
    if (voidP(this.pObjectList.getaProp(tID))) {
      return false;
    }
    if (this.pPrepareList.includes(this.pObjectList.getaProp(tID))) {
      return false;
    }
    this.pPrepareList.push(this.pObjectList.getaProp(tID));
    if (!this.pUpdatePause) {
      if (voidP(this.pTimeout)) {
        this.pTimeout = new Timeout(
          "objectmanager" + theMilliSeconds(),
          60 * 1000 * 60,
          () => this.null(),
          this,
          null,
          0,
        );
        this.pTimeout.start();
      }
    }
    return true;
  }

  removePrepare(tID) {
    if (voidP(this.pObjectList.getaProp(tID))) {
      return false;
    }
    const idx = this.pPrepareList.indexOf(this.pObjectList.getaProp(tID));
    if (idx < 0) {
      return false;
    }
    this.pPrepareList.splice(idx, 1);
    if (this.pPrepareList.length === 0 && this.pUpdateList.length === 0) {
      if (objectp(this.pTimeout)) {
        this.pTimeout.stop();
        this.pTimeout = null;
      }
    }
    return true;
  }

  receiveUpdate(tID) {
    if (voidP(this.pObjectList.getaProp(tID))) {
      return false;
    }
    if (this.pUpdateList.includes(this.pObjectList.getaProp(tID))) {
      return false;
    }
    this.pUpdateList.push(this.pObjectList.getaProp(tID));
    if (!this.pUpdatePause) {
      if (voidP(this.pTimeout)) {
        this.pTimeout = new Timeout(
          "objectmanager" + theMilliSeconds(),
          60 * 1000 * 60,
          () => this.null(),
          this,
          null,
          0,
        );
        this.pTimeout.start();
      }
    }
    return true;
  }

  removeUpdate(tID) {
    if (voidP(this.pObjectList.getaProp(tID))) {
      return false;
    }
    const idx = this.pUpdateList.indexOf(this.pObjectList.getaProp(tID));
    if (idx < 0) {
      return false;
    }
    this.pUpdateList.splice(idx, 1);
    if (this.pPrepareList.length === 0 && this.pUpdateList.length === 0) {
      if (objectp(this.pTimeout)) {
        this.pTimeout.stop();
        this.pTimeout = null;
      }
    }
    return true;
  }

  pauseUpdate() {
    if (objectp(this.pTimeout)) {
      this.pTimeout.stop();
      this.pTimeout = null;
    }
    this.pUpdatePause = 1;
    return true;
  }

  resumeUpdate() {
    if (this.pUpdateList.length > 0 && voidP(this.pTimeout)) {
      this.pTimeout = new Timeout(
        "objectmanager" + theMilliSeconds(),
        60 * 1000 * 60,
        () => this.null(),
        this,
        null,
        0,
      );
      this.pTimeout.start();
    }
    this.pUpdatePause = 0;
    return true;
  }

  prepareFrame() {
    for (const obj of this.pPrepareList) {
      if (typeof obj.prepare === "function") obj.prepare();
    }
    for (const obj of this.pUpdateList) {
      if (typeof obj.update === "function") obj.update();
    }
  }

  null() {
    // No-op handler for timeout
  }
}
