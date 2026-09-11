export default class {
  pRequestList;

  construct() {
    this.pRequestList = propList();
  }

  deconstruct() {
  }

  addRequest(tRequestData) {
    if (ilk(tRequestData) != Symbol.for("propList")) {
      return 0;
    }
    const tUserID = string(tRequestData[Symbol.for("userID")]);
    const tPrevIndex = this.pRequestList.findPos(tUserID);
    if (tPrevIndex > 0) {
      this.pRequestList.deleteAt(tPrevIndex);
    }
    this.pRequestList[tUserID] = tRequestData;
  }

  updateRequest(tRequestData) {
    if (ilk(tRequestData) != Symbol.for("propList")) {
      return 0;
    }
    const tUserID = string(tRequestData[Symbol.for("userID")]);
    if (!this.pRequestList.findPos(tUserID)) {
      return 0;
    }
    const tRequestProps = this.pRequestList[tUserID];
    if (!voidp(tRequestProps)) {
      for (let tNo = 1; tNo <= tRequestData.count; tNo++) {
        const tProp = tRequestData.getPropAt(tNo);
        const tValue = tRequestData[tNo];
        tRequestProps[tProp] = tValue;
      }
      this.pRequestList[tUserID] = tRequestProps.duplicate();
    }
  }

  getRequestByUserID(tUserID) {
    const tRequest = this.pRequestList[string(tUserID)];
    if (voidp(tRequest)) {
      return 0;
    } else {
      return tRequest;
    }
  }

  getPendingRequests() {
    const tPendingList = propList();
    const tMaxAmount = getVariable("fr.requests.max.visible");
    for (let tNo = 1; tNo <= this.pRequestList.count; tNo++) {
      const tRequest = this.pRequestList[tNo];
      if ((tRequest[Symbol.for("state")] == Symbol.for("pending")) || (tRequest[Symbol.for("state")] == Symbol.for("error"))) {
        tPendingList[string(tRequest[Symbol.for("userID")])] = tRequest;
        if (tPendingList.count >= tMaxAmount) {
          break;
        }
      }
    }
    return tPendingList;
  }

  cleanUpHandled() {
    for (let tNo = 1; tNo <= this.pRequestList.count; tNo++) {
      const tRequest = this.pRequestList[tNo];
      if ((tRequest[Symbol.for("status")] == Symbol.for("rejected")) || (tRequest[Symbol.for("status")] == Symbol.for("accepted"))) {
        this.pRequestList.deleteAt(tNo);
      }
    }
  }
}
