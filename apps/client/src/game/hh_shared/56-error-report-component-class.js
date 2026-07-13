export default class {
  pErrorLists;

  construct() {
    this.pErrorLists = list();
    registerMessage(Symbol.for("showErrorMessage"), this.getID(), Symbol.for("showErrorMessage"));
    registerMessage("crossDomainDownload", this.getID(), Symbol.for("registerCrossDomainError"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("showErrorMessage"), this.getID());
    this.pErrorLists = list();
    return 1;
  }

  registerCrossDomainError(tURL) {
    let tShowAlert = 1;
    const tSessionObj = getObject(Symbol.for("session"));
    if (!voidp(tSessionObj)) {
      const tRights = tSessionObj.GET("user_rights");
      if (listp(tRights)) {
        const tAlertRight = tRights.getOne("fuse_alert");
        if (!tAlertRight) {
          tShowAlert = 0;
        }
      }
    }
    if (tShowAlert) {
      const tMessage = `${getText("alert_cross_domain_download")}${RETURN}${tURL}`;
      this.showErrorMessage("client", tMessage);
    }
  }

  showErrorMessage(tErrorID, tErrorMessage) {
    const tErrorList = propList();
    tErrorList[Symbol.for("errorId")] = tErrorID;
    tErrorList[Symbol.for("errorMsg")] = tErrorMessage;
    this.storeErrorReport(tErrorList);
    this.getInterface().showErrors();
  }

  storeErrorReport(tErrorList) {
    this.pErrorLists.add(tErrorList);
  }

  getErrorLists() {
    return this.pErrorLists;
  }

  clearErrorLists(tIndex) {
    tIndex = min(tIndex, this.pErrorLists.count);
    for (let i = 1; i <= tIndex; i++) {
      this.pErrorLists.deleteAt(1);
    }
  }
}
