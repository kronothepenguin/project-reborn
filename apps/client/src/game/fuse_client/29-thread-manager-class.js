export default class {
  pThreadList;
  pVarMngrObj;
  pIndexField;
  pObjBaseCls;

  construct() {
    this.pThreadList = propList();
    this.pVarMngrObj = createObject(Symbol.for("temp"), getClassVariable("variable.manager.class"));
    this.pIndexField = getVariable("thread.index.field");
    this.pObjBaseCls = script(getmemnum("Object Base Class"));
    return 1;
  }

  deconstruct() {
    this.closeAll();
    this.pVarMngrObj = 0;
    this.pIndexField = 0;
    this.pObjBaseCls = 0;
    return 1;
  }

  create(tID, tInitField) {
    return this.initThread(tInitField, tID);
  }

  Remove(tID) {
    return this.closeThread(tID);
  }

  GET(tID) {
    const tThreadObj = this.pThreadList[tID];
    if (voidp(tThreadObj)) {
      return 0;
    } else {
      return tThreadObj;
    }
  }

  exists(tID) {
    return !voidp(this.pThreadList[tID]);
  }

  initThread(tCastNumOrMemName, tID) {
    let tThreadField;
    let tCastNum;
    if (stringp(tCastNumOrMemName)) {
      const tMemNum = getResourceManager().getmemnum(tCastNumOrMemName);
      if (tMemNum == 0) {
        return error(this, `Thread index field not found: ${tCastNumOrMemName}`, Symbol.for("initThread"), Symbol.for("major"));
      } else {
        tThreadField = tCastNumOrMemName;
        tCastNum = member(tMemNum).castLibNum;
      }
    } else {
      if (symbolp(tCastNumOrMemName)) {
        tThreadField = this.pIndexField;
        if (the.numberOfCastLibs > 1) {
          for (let i = 2; i <= the.numberOfCastLibs; i++) {
            if (member(tThreadField, i).number > 0) {
              this.pVarMngrObj.clear();
              this.pVarMngrObj.dump(member(tThreadField, i).number);
              if (symbol(this.pVarMngrObj.GET("thread.id")) == tCastNumOrMemName) {
                return this.initThread(i, tID);
              }
              break;
            }
          }
        }
      } else {
        if (!integerp(tCastNumOrMemName)) {
          return error(this, `Cast number expected: ${tCastNumOrMemName}`, Symbol.for("initThread"), Symbol.for("major"));
        } else {
          if ((tCastNumOrMemName < 1) || (tCastNumOrMemName > the.numberOfCastLibs)) {
            return error(this, `Cast doesn't exist: ${tCastNumOrMemName}`, Symbol.for("initThread"), Symbol.for("major"));
          }
        }
        tThreadField = this.pIndexField;
        tCastNum = tCastNumOrMemName;
        if (member(tThreadField, tCastNum).number < 1) {
          return 0;
        }
      }
    }
    this.pVarMngrObj.clear();
    this.pVarMngrObj.dump(member(tThreadField, tCastNum).number);
    let tThreadID;
    if (symbolp(tID)) {
      tThreadID = tID;
    } else {
      tThreadID = symbol(this.pVarMngrObj.GET("thread.id"));
    }
    if (!symbolp(tThreadID)) {
      return error(this, `Invalid thread ID: ${tThreadID}`, Symbol.for("initThread"), Symbol.for("major"));
    }
    let tThreadKeys;
    let tMultipleDef = 0;
    if (listp(value(this.pVarMngrObj.GET("thread.id")))) {
      tThreadKeys = this.pVarMngrObj.GetValue("thread.id");
      tMultipleDef = 1;
    } else {
      tThreadKeys = list(this.pVarMngrObj.GET("thread.id"));
    }
    for (let tThreadKey of tThreadKeys) {
      tThreadID = symbol(tThreadKey);
      if (!this.exists(tThreadID)) {
        const tThreadObj = createObject(Symbol.for("temp"), getClassVariable("thread.instance.class"));
        tThreadObj.setID(tThreadID);
        for (const tModule of list(Symbol.for("interface"), Symbol.for("component"), Symbol.for("handler"))) {
          const tSymbol = symbol(`${tThreadKey}_${tModule}`);
          let tPreIndex = EMPTY;
          if (tMultipleDef) {
            tPreIndex = `${tThreadKey}.`;
          }
          if (this.pVarMngrObj.exists(`${tPreIndex}${tModule}.class`)) {
            let tClass = this.pVarMngrObj.GET(`${tPreIndex}${tModule}.class`);
            if (tClass.char[1] == "[") {
              tClass = value(tClass);
            }
            if (!listp(tClass)) {
              tClass = list(tClass);
            }
            const tObject = this.buildThreadObj(tSymbol, tClass, tThreadObj);
            tThreadObj.setaProp(tModule, tObject);
          }
        }
        this.pThreadList[tThreadID] = tThreadObj;
      }
    }
    return 1;
  }

  initAll() {
    for (let i = the.numberOfCastLibs; i >= 1; i--) {
      this.initThread(i);
    }
    return 1;
  }

  closeThread(tCastNumOrID) {
    this.pVarMngrObj.clear();
    let tThreadKeys;
    if (integerp(tCastNumOrID)) {
      if (member(this.pIndexField, tCastNumOrID).number > 0) {
        this.pVarMngrObj.dump(member(this.pIndexField, tCastNumOrID).number);
        if (listp(value(this.pVarMngrObj.GET("thread.id")))) {
          tThreadKeys = this.pVarMngrObj.GetValue("thread.id");
        } else {
          tThreadKeys = list(this.pVarMngrObj.GET("thread.id"));
        }
      } else {
        return 0;
      }
    } else {
      if (symbolp(tCastNumOrID)) {
        tThreadKeys = list(tCastNumOrID);
      } else {
        return error(this, `Invalid argument: ${tCastNumOrID}`, Symbol.for("closeThread"), Symbol.for("major"));
      }
    }
    for (const tID of tThreadKeys) {
      const tThread = this.pThreadList[tID];
      if (voidp(tThread)) {
        return error(this, `Thread not found: ${tID}`, Symbol.for("closeThread"), Symbol.for("minor"));
      }
      const tObjMgr = getObjectManager();
      if (objectp(tThread.interface)) {
        tObjMgr.Remove(tThread.interface.getID());
      }
      if (objectp(tThread.component)) {
        tObjMgr.Remove(tThread.component.getID());
      }
      if (objectp(tThread.handler)) {
        tObjMgr.Remove(tThread.handler.getID());
      }
      this.pThreadList.deleteProp(tID);
    }
    return 1;
  }

  closeAll() {
    for (let i = this.pThreadList.count; i >= 1; i--) {
      this.closeThread(this.pThreadList.getPropAt(i));
    }
    return 1;
  }

  print() {
    for (let i = 1; i <= this.pThreadList.count; i++) {
      put(this.pThreadList.getPropAt(i));
    }
  }

  buildThreadObj(tID, tClassList, tThreadObj) {
    let tObject = VOID;
    let tTemp = VOID;
    let tInitFlag;
    const tBase = this.pObjBaseCls.new();
    tBase.construct();
    tBase[Symbol.for("ancestor")] = tThreadObj;
    tBase.setID(tID);
    const tResMgr = getResourceManager();
    const tObjMgr = getObjectManager();
    tObjMgr.registerObject(tID, tBase);
    tClassList.addAt(1, tBase);
    for (const tClass of tClassList) {
      if (objectp(tClass)) {
        tObject = tClass;
        tInitFlag = 0;
      } else {
        const tMemNum = tResMgr.getmemnum(tClass);
        if (tMemNum < 1) {
          tObjMgr.unregisterObject(tID);
          return error(this, `Script not found: ${tMemNum}`, Symbol.for("buildThreadObj"), Symbol.for("major"));
        }
        tObject = script(tMemNum).new();
        tInitFlag = tObject.handler(Symbol.for("construct"));
      }
      tObject[Symbol.for("ancestor")] = tTemp;
      tTemp = tObject;
      tObjMgr.unregisterObject(tID);
      tObjMgr.registerObject(tID, tObject);
      if (tInitFlag) {
        tObject.construct();
      }
    }
    return tObject;
  }
}
