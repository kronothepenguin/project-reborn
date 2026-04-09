// Special Services API
// Translated from: 23_Special Services API.ls

export default function () {
  return {
    constructSpecialServices() {
      return _director.createManager(
        Symbol.for("special_services"),
        _director.getClassVariable("special.services.class"),
      );
    },

    deconstructSpecialServices() {
      return _director.removeManager(Symbol.for("special_services"));
    },

    getSpecialServices() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("special_services"))) {
        return this.constructSpecialServices();
      }
      return tMgr.getManager(Symbol.for("special_services"));
    },

    tryFn() {
      return this.getSpecialServices().try();
    },

    catchFn() {
      return this.getSpecialServices().catch();
    },

    createToolTip(tText) {
      return this.getSpecialServices().createToolTip(tText);
    },

    removeToolTip() {
      return this.getSpecialServices().removeToolTip();
    },

    setcursor(ttype) {
      return this.getSpecialServices().setcursor(ttype);
    },

    openNetPage(tURL_key, tTarget) {
      return this.getSpecialServices().openNetPage(tURL_key, tTarget);
    },

    showLoadingBar(tLoadID, tProps) {
      return this.getSpecialServices().showLoadingBar(tLoadID, tProps);
    },

    getUniqueID() {
      return this.getSpecialServices().getUniqueID();
    },

    getMachineID() {
      return this.getSpecialServices().getMachineID();
    },

    getPredefinedURL(tURL) {
      return this.getSpecialServices().getPredefinedURL(tURL);
    },

    getDomainPart(tURL) {
      return this.getSpecialServices().getDomainPart(tURL);
    },

    getMoviePath() {
      return this.getSpecialServices().getMoviePath();
    },

    getExtVarPath() {
      return this.getSpecialServices().getExtVarPath();
    },

    sendProcessTracking(tStepValue) {
      return this.getSpecialServices().sendProcessTracking(tStepValue);
    },

    getProcessTrackingList() {
      let tListStr = _director.implode(this.getSpecialServices().getProcessTrackingList(), ",");
      return tListStr;
    },

    secretDecode(tKey) {
      return this.getSpecialServices().secretDecode(tKey);
    },

    readValueFromField(tFieldName, tDelimiter, tSearchedKey) {
      return this.getSpecialServices().readValueFromField(tFieldName, tDelimiter, tSearchedKey);
    },

    checkForXtra(tXtraName) {
      return this.getSpecialServices().checkForXtra(tXtraName);
    },

    performance() {
      if (_director.objectExists(Symbol.for("perfTester"))) {
        return _director.removeObject(Symbol.for("perfTester"));
      } else {
        return _director.createObject(Symbol.for("perfTester"), _director.getClassVariable("perf.test.class"));
      }
    },

    printMsg(tObj, tMsg) {
      this.getSpecialServices().print(tObj, tMsg);
    },

    callJavaScriptFunction(tCallString, tdata) {
      this.getSpecialServices().callJavaScriptFunction(tCallString, tdata);
    },

    getClientUpTime() {
      return this.getSpecialServices().getClientUpTime();
    },
  };
}
