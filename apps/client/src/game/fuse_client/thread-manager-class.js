import {
  charOf,
  EMPTY,
  integerp,
  list,
  listp,
  member,
  objectp,
  propList,
  put,
  script,
  stringp,
  symbol,
  symbolp,
  the,
  value,
  VOID,
  voidp,
} from "../../director";

export default function () {
  let tMemNum, tThreadField, tCastNum, tThreadID, tMultipleDef, tThreadKeys;
  let tThreadObj, tSymbol, tPreIndex, tClass, tObject;
  let tObjMgr, tBase, tResMgr, tTemp, tInitFlag;

  return {
    pThreadList: VOID,
    pVarMngrObj: VOID,
    pIndexField: VOID,
    pObjBaseCls: VOID,

    construct() {
      this.pThreadList = propList();
      this.pVarMngrObj = _director.createObject(
        Symbol.for("temp"),
        _director.getClassVariable("variable.manager.class"),
      );
      this.pIndexField = _director.getVariable("thread.index.field");
      this.pObjBaseCls = script(_director.getmemnum("Object Base Class"));
      return 1;
    },

    deconstruct() {
      this.closeAll();
      this.pVarMngrObj = 0;
      this.pIndexField = 0;
      this.pObjBaseCls = 0;
      return 1;
    },

    create(tID, tInitField) {
      return this.initThread(tInitField, tID);
    },

    Remove(tID) {
      return this.closeThread(tID);
    },

    GET(tID) {
      tThreadObj = this.pThreadList[tID];
      if (voidp(tThreadObj)) {
        return 0;
      } else {
        return tThreadObj;
      }
    },

    exists(tID) {
      return !voidp(this.pThreadList[tID]);
    },

    initThread(tCastNumOrMemName, tID) {
      if (stringp(tCastNumOrMemName)) {
        tMemNum = _director.getResourceManager().getmemnum(tCastNumOrMemName);
        if (tMemNum === 0) {
          return _director.error(
            this,
            "Thread index field not found: " + tCastNumOrMemName,
            Symbol.for("initThread"),
            Symbol.for("major"),
          );
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
                if (
                  symbol(this.pVarMngrObj.GET("thread.id")) ===
                  tCastNumOrMemName
                ) {
                  return this.initThread(i, tID);
                }
              }
            }
          }
        } else {
          if (!integerp(tCastNumOrMemName)) {
            return _director.error(
              this,
              "Cast number expected: " + tCastNumOrMemName,
              Symbol.for("initThread"),
              Symbol.for("major"),
            );
          } else {
            if (
              tCastNumOrMemName < 1 ||
              tCastNumOrMemName > the.numberOfCastLibs
            ) {
              return _director.error(
                this,
                "Cast doesn't exist: " + tCastNumOrMemName,
                Symbol.for("initThread"),
                Symbol.for("major"),
              );
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
      if (symbolp(tID)) {
        tThreadID = tID;
      } else {
        tThreadID = symbol(this.pVarMngrObj.GET("thread.id"));
      }
      if (!symbolp(tThreadID)) {
        return _director.error(
          this,
          "Invalid thread ID: " + tThreadID,
          Symbol.for("initThread"),
          Symbol.for("major"),
        );
      }
      tMultipleDef = 0;
      if (listp(value(this.pVarMngrObj.GET("thread.id")))) {
        tThreadKeys = this.pVarMngrObj.GetValue("thread.id");
        tMultipleDef = 1;
      } else {
        tThreadKeys = list(this.pVarMngrObj.GET("thread.id"));
      }
      for (const tThreadKey of tThreadKeys) {
        tThreadID = symbol(tThreadKey);
        if (!this.exists(tThreadID)) {
          tThreadObj = _director.createObject(
            Symbol.for("temp"),
            _director.getClassVariable("thread.instance.class"),
          );
          tThreadObj.setID(tThreadID);
          for (const tModule of [
            Symbol.for("interface"),
            Symbol.for("component"),
            Symbol.for("handler"),
          ]) {
            tSymbol = symbol(tThreadKey + "_" + tModule.description);
            tPreIndex = EMPTY;
            if (tMultipleDef) {
              tPreIndex = tThreadKey + ".";
            }
            if (
              this.pVarMngrObj.exists(
                tPreIndex + tModule.description + ".class",
              )
            ) {
              tClass = this.pVarMngrObj.GET(
                tPreIndex + tModule.description + ".class",
              );
              if (charOf(tClass)[1] === "[") {
                tClass = value(tClass);
              }
              if (!listp(tClass)) {
                tClass = list(tClass);
              }
              tObject = this.buildThreadObj(tSymbol, tClass, tThreadObj);
              tThreadObj.setaProp(tModule, tObject);
            }
          }
          this.pThreadList[tThreadID] = tThreadObj;
        }
      }
      return 1;
    },

    initAll() {
      for (let i = the.numberOfCastLibs; i >= 1; i--) {
        this.initThread(i);
      }
      return 1;
    },

    closeThread(tCastNumOrID) {
      this.pVarMngrObj.clear();
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
          return _director.error(
            this,
            "Invalid argument: " + tCastNumOrID,
            Symbol.for("closeThread"),
            Symbol.for("major"),
          );
        }
      }
      for (const tID of tThreadKeys) {
        tThread = this.pThreadList[tID];
        if (voidp(tThread)) {
          return _director.error(
            this,
            "Thread not found: " + tID,
            Symbol.for("closeThread"),
            Symbol.for("minor"),
          );
        }
        tObjMgr = _director.getObjectManager();
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
    },

    closeAll() {
      for (let i = this.pThreadList.count; i >= 1; i--) {
        this.closeThread(this.pThreadList.getPropAt(i));
      }
      return 1;
    },

    print() {
      for (let i = 1; i <= this.pThreadList.count; i++) {
        put(this.pThreadList.getPropAt(i));
      }
    },

    buildThreadObj(tID, tClassList, tThreadObj) {
      tObject = VOID;
      tTemp = VOID;
      tBase = this.pObjBaseCls.new();
      tBase.construct();
      tBase[Symbol.for("ancestor")] = tThreadObj;
      tBase.setID(tID);
      tResMgr = _director.getResourceManager();
      tObjMgr = _director.getObjectManager();
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
            return _director.error(
              this,
              "Script not found: " + tMemNum,
              Symbol.for("buildThreadObj"),
              Symbol.for("major"),
            );
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
    },
  };
}
