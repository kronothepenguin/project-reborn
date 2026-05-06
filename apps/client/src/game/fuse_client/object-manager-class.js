import {
  call,
  ilk,
  list,
  listp,
  member,
  objectp,
  propList,
  put,
  script,
  stringp,
  symbolp,
  timeout,
  VOID,
  voidp,
} from "../../director";

export default function () {
  let tObj;

  return {
    pObjectList: VOID,
    pUpdateList: VOID,
    pPrepareList: VOID,
    pManagerList: VOID,
    pInstanceList: VOID,
    pEraseLock: VOID,
    pTimeout: VOID,
    pUpdatePause: VOID,
    pBaseClsMem: VOID,

    construct() {
      this.pObjectList = propList();
      this.pUpdateList = list();
      this.pPrepareList = list();
      this.pManagerList = list();
      this.pInstanceList = list();
      this.pEraseLock = 0;
      this.pTimeout = VOID;
      this.pUpdatePause = 0;
      this.pBaseClsMem = script("Object Base Class");
      this.pObjectList.sort();
      this.pUpdateList.sort();
      return true;
    },

    deconstruct() {
      this.pEraseLock = 1;
      if (objectp(this.pTimeout)) {
        this.pTimeout.forget();
        this.pTimeout = VOID;
      }
      for (let i = this.pInstanceList.count; i >= 1; i--) {
        this.Remove(this.pInstanceList[i]);
      }
      for (let i = this.pManagerList.count; i >= 1; i--) {
        this.Remove(this.pManagerList[i]);
      }
      this.pObjectList = propList();
      this.pUpdateList = list();
      this.pPrepareList = list();
      return true;
    },

    create(tID, tClassList) {
      if (!symbolp(tID) && !stringp(tID)) {
        return _director.error(
          this,
          "Symbol or string expected: " + tID,
          Symbol.for("create"),
          Symbol.for("major"),
        );
      }
      if (objectp(this.pObjectList[tID])) {
        return _director.error(
          this,
          "Object already exists: " + tID,
          Symbol.for("create"),
          Symbol.for("major"),
        );
      }
      if (tID === Symbol.for("random")) {
        tID = _director.getUniqueID();
      }
      if (voidp(tClassList)) {
        return _director.error(
          this,
          "Class member name expected!",
          Symbol.for("create"),
          Symbol.for("major"),
        );
      }
      if (!listp(tClassList)) {
        tClassList = list(tClassList);
      }
      tClassList = tClassList.duplicate();
      let tObject = VOID;
      let tTemp = VOID;
      let tBase = this.pBaseClsMem.new();
      tBase.construct();
      if (tID !== Symbol.for("temp")) {
        tBase.id = tID;
        this.pObjectList[tID] = tBase;
      }
      tClassList.addAt(1, tBase);
      for (const tClass of tClassList) {
        let tInitFlag = 0;
        if (objectp(tClass)) {
          tObject = tClass;
          tInitFlag = 0;
        } else {
          let tMemNum;
          if (this.managerExists(Symbol.for("resource_manager"))) {
            tMemNum = this.getManager(Symbol.for("resource_manager")).getmemnum(
              tClass,
            );
          } else {
            tMemNum = member(tClass).number;
          }
          if (tMemNum < 1) {
            if (tID !== Symbol.for("temp")) {
              this.pObjectList.deleteProp(tID);
            }
            return _director.error(
              this,
              "Script not found: " + tMemNum,
              Symbol.for("create"),
              Symbol.for("major"),
            );
          }
          tObject = script(tMemNum).new();
          tInitFlag = tObject.handler(Symbol.for("construct"));
        }
        if (ilk(tObject, Symbol.for("instance"))) {
          tObject[Symbol.for("ancestor")] = tTemp;
          tTemp = tObject;
        }
        if (tID !== Symbol.for("temp") && tClassList.getLast() === tClass) {
          this.pObjectList[tID] = tObject;
          this.pInstanceList.append(tID);
        }
        if (tInitFlag) {
          tObject.construct();
        }
      }
      return tObject;
    },

    GET(tID) {
      const tObj = this.pObjectList[tID];
      if (voidp(tObj)) {
        return false;
      }
      return tObj;
    },

    Remove(tID) {
      tObj = this.pObjectList[tID];
      if (voidp(tObj)) {
        return false;
      }
      if (ilk(tObj, Symbol.for("instance"))) {
        if (!tObj.valid) {
          return false;
        }
        for (let i = 1; i <= tObj.delays.count; i++) {
          const tDelayID = tObj.delays.getPropAt(i);
          tObj.Cancel(tDelayID);
        }
        tObj.deconstruct();
        tObj.valid = 0;
      }
      this.pUpdateList.deleteOne(tObj);
      this.pPrepareList.deleteOne(tObj);
      tObj = VOID;
      if (!this.pEraseLock) {
        this.pObjectList.deleteProp(tID);
        this.pInstanceList.deleteOne(tID);
        this.pManagerList.deleteOne(tID);
      }
      return true;
    },

    exists(tID) {
      if (voidp(tID)) {
        return false;
      }
      return objectp(this.pObjectList[tID]);
    },

    print() {
      for (let i = 1; i <= this.pObjectList.count; i++) {
        let tProp = this.pObjectList.getPropAt(i);
        if (symbolp(tProp)) {
          tProp = "#" + tProp.description;
        }
        put(tProp + " : " + this.pObjectList[i]);
      }
      return true;
    },

    registerObject(tID, tObject) {
      if (!objectp(tObject)) {
        return _director.error(
          this,
          "Invalid object: " + tObject,
          Symbol.for("register"),
          Symbol.for("major"),
        );
      }
      if (!voidp(this.pObjectList[tID])) {
        return _director.error(
          this,
          "Object already exists: " + tID,
          Symbol.for("register"),
          Symbol.for("minor"),
        );
      }
      this.pObjectList[tID] = tObject;
      this.pInstanceList.append(tID);
      return true;
    },

    unregisterObject(tID) {
      if (voidp(this.pObjectList[tID])) {
        return _director.error(
          this,
          "Referred object not found: " + tID,
          Symbol.for("unregister"),
          Symbol.for("minor"),
        );
      }
      tObj = this.pObjectList[tID];
      this.pObjectList.deleteProp(tID);
      this.pUpdateList.deleteOne(tObj);
      this.pPrepareList.deleteOne(tObj);
      this.pInstanceList.deleteOne(tID);
      tObj = VOID;
      return true;
    },

    registerManager(tID) {
      if (!this.exists(tID)) {
        return _director.error(
          this,
          "Referred object not found: " + tID,
          Symbol.for("registerManager"),
          Symbol.for("major"),
        );
      }
      if (this.pManagerList.getOne(tID) !== 0) {
        return _director.error(
          this,
          "Manager already registered: " + tID,
          Symbol.for("registerManager"),
          Symbol.for("minor"),
        );
      }
      this.pInstanceList.deleteOne(tID);
      this.pManagerList.append(tID);
      return true;
    },

    unregisterManager(tID) {
      if (!this.exists(tID)) {
        return _director.error(
          this,
          "Referred object not found: " + tID,
          Symbol.for("unregisterManager"),
          Symbol.for("minor"),
        );
      }
      if (this.pInstanceList.getOne(tID) !== 0) {
        return _director.error(
          this,
          "Manager already unregistered: " + tID,
          Symbol.for("unregisterManager"),
          Symbol.for("minor"),
        );
      }
      this.pManagerList.deleteOne(tID);
      this.pInstanceList.append(tID);
      return true;
    },

    getManager(tID) {
      if (!this.pManagerList.getOne(tID)) {
        return _director.error(
          this,
          "Manager not found: " + tID,
          Symbol.for("getManager"),
          Symbol.for("major"),
        );
      }
      return this.pObjectList[tID];
    },

    managerExists(tID) {
      return this.pManagerList.getOne(tID) !== 0;
    },

    receivePrepare(tID) {
      if (voidp(this.pObjectList[tID])) {
        return false;
      }
      if (this.pPrepareList.getPos(this.pObjectList[tID]) > 0) {
        return false;
      }
      this.pPrepareList.add(this.pObjectList[tID]);
      if (!this.pUpdatePause) {
        if (voidp(this.pTimeout)) {
          this.pTimeout = timeout("objectmanager" + the.milliSeconds).new(
            60 * 1000 * 60,
            Symbol.for("null"),
            this,
          );
        }
      }
      return true;
    },

    removePrepare(tID) {
      if (voidp(this.pObjectList[tID])) {
        return false;
      }
      if (this.pPrepareList.getOne(this.pObjectList[tID]) < 1) {
        return false;
      }
      this.pPrepareList.deleteOne(this.pObjectList[tID]);
      if (this.pPrepareList.count === 0 && this.pUpdateList.count === 0) {
        if (objectp(this.pTimeout)) {
          this.pTimeout.forget();
          this.pTimeout = VOID;
        }
      }
      return true;
    },

    receiveUpdate(tID) {
      if (voidp(this.pObjectList[tID])) {
        return false;
      }
      if (this.pUpdateList.getPos(this.pObjectList[tID]) > 0) {
        return false;
      }
      this.pUpdateList.add(this.pObjectList[tID]);
      if (!this.pUpdatePause) {
        if (voidp(this.pTimeout)) {
          this.pTimeout = timeout("objectmanager" + the.milliSeconds).new(
            60 * 1000 * 60,
            Symbol.for("null"),
            this,
          );
        }
      }
      return true;
    },

    removeUpdate(tID) {
      if (voidp(this.pObjectList[tID])) {
        return false;
      }
      if (this.pUpdateList.getOne(this.pObjectList[tID]) < 1) {
        return false;
      }
      this.pUpdateList.deleteOne(this.pObjectList[tID]);
      if (this.pPrepareList.count === 0 && this.pUpdateList.count === 0) {
        if (objectp(this.pTimeout)) {
          this.pTimeout.forget();
          this.pTimeout = VOID;
        }
      }
      return true;
    },

    pauseUpdate() {
      if (objectp(this.pTimeout)) {
        this.pTimeout.forget();
        this.pTimeout = VOID;
      }
      this.pUpdatePause = 1;
      return true;
    },

    resumeUpdate() {
      if (this.pUpdateList.count > 0 && voidp(this.pTimeout)) {
        this.pTimeout = timeout("objectmanager" + the.milliSeconds).new(
          60 * 1000 * 60,
          Symbol.for("null"),
          this,
        );
      }
      this.pUpdatePause = 0;
      return true;
    },

    prepareFrame() {
      call(Symbol.for("prepare"), this.pPrepareList);
      call(Symbol.for("update"), this.pUpdateList);
    },

    null() {},
  };
}
