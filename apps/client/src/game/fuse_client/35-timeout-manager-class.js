export default class {
  pItemList;

  construct() {
    this.pItemList = propList();
    return 1;
  }

  deconstruct() {
    const tObjMngr = getObjectManager();
    for (let i = 1; i <= this.pItemList.count; i++) {
      const tID = this.pItemList[i][Symbol.for("timerid")];
      if (tObjMngr.exists(tID)) {
        tObjMngr.GET(tID).forget();
      }
    }
    this.pItemList = propList();
    return 1;
  }

  create(tID, tTime, tHandler, tClientID, tArgument, tIterations) {
    if (this.exists(tID)) {
      return error(this, `Timeout already registered: ${tID}`, Symbol.for("create"), Symbol.for("major"));
    }
    if (!integerp(tTime)) {
      return error(this, `Integer expected: ${tTime}`, Symbol.for("create"), Symbol.for("major"));
    }
    if (!symbolp(tHandler)) {
      return error(this, `Symbol expected: ${tHandler}`, Symbol.for("create"), Symbol.for("major"));
    }
    const tObjMngr = getObjectManager();
    if (tObjMngr.exists(tClientID)) {
      if (!tObjMngr.GET(tClientID).handler(tHandler)) {
        return error(this, `Handler not found in object: ${tHandler} ${tClientID}`, Symbol.for("create"), Symbol.for("major"));
      }
    } else {
      if (!voidp(tClientID)) {
        return error(this, `Object ID or VOID expected: ${tClientID}`, Symbol.for("create"), Symbol.for("major"));
      }
    }
    const tUniqueId = `Timeout ${getUniqueID()}`;
    tObjMngr.create(tUniqueId, timeout(tUniqueId).new(tTime, Symbol.for("executeTimeOut"), this));
    const tList = propList();
    tList[Symbol.for("uniqueid")] = tUniqueId;
    tList[Symbol.for("handler")] = tHandler;
    tList[Symbol.for("client")] = tClientID;
    tList[Symbol.for("argument")] = tArgument;
    tList[Symbol.for("iterations")] = tIterations;
    tList[Symbol.for("count")] = 0;
    this.pItemList[tID] = tList;
    return 1;
  }

  GET(tID) {
    if (!this.exists(tID)) {
      return error(this, `Item not found: ${tID}`, Symbol.for("GET"), Symbol.for("minor"));
    }
    const tTask = this.pItemList[tID];
    if (voidp(tTask[Symbol.for("client")])) {
      value(`${tTask[Symbol.for("handler")]}(${tTask[Symbol.for("argument")]})`);
    } else {
      const tObjMngr = getObjectManager();
      if (tObjMngr.exists(tTask[Symbol.for("client")])) {
        call(tTask[Symbol.for("handler")], tObjMngr.GET(tTask[Symbol.for("client")]), tTask[Symbol.for("argument")]);
      } else {
        return this.Remove(tID);
      }
    }
  }

  Remove(tID) {
    if (!this.exists(tID)) {
      return error(this, `Item not found: ${tID}`, Symbol.for("Remove"), Symbol.for("minor"));
    }
    const tObjMngr = getObjectManager();
    let tObject = tObjMngr.GET(this.pItemList[tID][Symbol.for("uniqueid")]);
    if (tObject != 0) {
      tObject.target = VOID;
      tObject.forget();
      tObject = VOID;
      tObjMngr.Remove(this.pItemList[tID][Symbol.for("uniqueid")]);
    }
    return this.pItemList.deleteProp(tID);
  }

  exists(tID) {
    return listp(this.pItemList[tID]);
  }

  executeTimeOut(tTimeout) {
    let tID;
    let tTask;
    for (let i = 1; i <= this.pItemList.count; i++) {
      if (this.pItemList[i][Symbol.for("uniqueid")] == tTimeout.name) {
        tID = this.pItemList.getPropAt(i);
        tTask = this.pItemList[tID];
        break;
      }
    }
    if (voidp(tID)) {
      tTimeout.forget();
      return 0;
    }
    this.pItemList[tID][Symbol.for("count")] = this.pItemList[tID][Symbol.for("count")] + 1;
    if (this.pItemList[tID][Symbol.for("count")] == this.pItemList[tID][Symbol.for("iterations")]) {
      this.Remove(tID);
    }
    if (voidp(tTask[Symbol.for("client")])) {
      value(`${tTask[Symbol.for("handler")]}(${tTask[Symbol.for("argument")]})`);
    } else {
      const tObject = getObject(tTask[Symbol.for("client")]);
      if (objectp(tObject)) {
        call(tTask[Symbol.for("handler")], tObject, tTask[Symbol.for("argument")]);
      } else {
        return this.Remove(tID);
      }
    }
    return 1;
  }
}
