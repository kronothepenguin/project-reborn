import { call, castLib, integer, list, listp, objectExists, getObject, propList, symbolp, voidp, VOID } from "../../director";

export default function () {
  let tCast, tCastName, tTemp, tSuccess, tCall;

  return {
    pGroupId: VOID,
    pStatus: VOID,
    pLoadedSoFar: VOID,
    pCastList: VOID,
    pCastcount: VOID,
    pCallBack: VOID,
    pCurrPercent: VOID,
    pTempPercent: VOID,
    pLastPercent: VOID,
    pTmpLoadCount: VOID,
    pCurLoadCount: VOID,
    pAllowindexing: VOID,
    pContainsFailedItems: VOID,

    define(tdata) {
      this.pGroupId = tdata[Symbol.for("id")];
      this.pStatus = tdata[Symbol.for("status")];
      this.pLoadedSoFar = tdata[Symbol.for("sofar")];
      this.pCastcount = tdata[Symbol.for("casts")].count;
      this.pCallBack = tdata[Symbol.for("callback")];
      this.pCurrPercent = tdata[Symbol.for("Percent")];
      this.pAllowindexing = tdata[Symbol.for("doindexing")];
      this.pTempPercent = 0;
      this.pLastPercent = 0;
      this.pCurLoadCount = 0;
      this.pTmpLoadCount = 0;
      this.pContainsFailedItems = 0;
      this.pCastList = propList();
      for (const tCast of tdata[Symbol.for("casts")]) {
        this.pCastList[tCast] = 0;
      }
      return 1;
    },

    OneCastDone(tFile) {
      this.pLoadedSoFar = this.pLoadedSoFar + 1.0;
      if (integer(this.pLoadedSoFar) === this.pCastcount) {
        this.pStatus = Symbol.for("ready");
      }
      this.pCastList[tFile] = 1;
      while (true) {
        if (this.pCastList.count === 0) {
          break;
        }
        if (this.pCastList[1] === 1) {
          tCastName = this.pCastList.getPropAt(1);
          if (_director.getCastLoadManager().exists(tCastName)) {
            _director.getThreadManager().initThread(castLib(tCastName).number);
          }
          this.pCastList.deleteProp(tCastName);
          continue;
        }
        break;
      }
      return 1;
    },

    changeLoadingCount(tPosOrNeg) {
      this.pCurLoadCount = this.pCurLoadCount + tPosOrNeg;
    },

    resetPercentCounter() {
      this.pTempPercent = 0;
      this.pTmpLoadCount = 0;
      return 1;
    },

    UpdateTaskPercent(tInstancePercent, tFile) {
      this.pTmpLoadCount = this.pTmpLoadCount + 1;
      this.pTempPercent = this.pTempPercent + tInstancePercent;
      if (this.pTmpLoadCount === this.pCurLoadCount) {
        tTemp = 1.0 * (this.pTempPercent + this.pLoadedSoFar) / this.pCastcount;
        if ((tTemp <= 1.0) && (this.pLastPercent <= tTemp)) {
          this.pCurrPercent = tTemp;
        } else {
          this.pCurrPercent = this.pLastPercent;
        }
      }
    },

    getTaskState() {
      return this.pStatus;
    },

    getTaskPercent() {
      return this.pCurrPercent;
    },

    getIndexingAllowed() {
      return this.pAllowindexing;
    },

    DoCallBack(tstate) {
      tSuccess = 1;
      if (tstate !== Symbol.for("done")) {
        tSuccess = 0;
      }
      if (this.pStatus === Symbol.for("ready")) {
        if (listp(this.pCallBack)) {
          for (const tCall of this.pCallBack) {
            if (objectExists(tCall[Symbol.for("client")])) {
              call(tCall[Symbol.for("method")], getObject(tCall[Symbol.for("client")]), tCall[Symbol.for("argument")], tSuccess);
            }
          }
        }
      }
    },

    addCallBack(tID, tMethod, tClientID, tArgument) {
      if (!symbolp(tMethod)) {
        return _director.error(this, "Symbol referring to handler expected: " + tMethod, Symbol.for("addCallBack"), Symbol.for("major"));
      }
      if (!objectExists(tClientID)) {
        return _director.error(this, "Object not found: " + tClientID, Symbol.for("addCallBack"), Symbol.for("major"));
      }
      if (!getObject(tClientID).handler(tMethod)) {
        return _director.error(this, "Handler not found in object: " + tMethod + "/" + tClientID, Symbol.for("addCallBack"), Symbol.for("major"));
      }
      if (this.pStatus === Symbol.for("ready")) {
        call(tMethod, getObject(tClientID), tArgument);
        _director.getCastLoadManager().removeCastLoadTask(this.pGroupId);
      } else {
        if (this.pStatus === Symbol.for("LOADING")) {
          if (voidp(this.pCallBack)) {
            this.pCallBack = list([Symbol.for("method"): tMethod, Symbol.for("client"): tClientID, Symbol.for("argument"): tArgument]);
          } else {
            this.pCallBack.add([Symbol.for("method"): tMethod, Symbol.for("client"): tClientID, Symbol.for("argument"): tArgument]);
          }
        }
      }
      return 1;
    },

    setFailed() {
      this.pContainsFailedItems = 1;
    },

    getFailed() {
      return this.pContainsFailedItems;
    },
  };
}
