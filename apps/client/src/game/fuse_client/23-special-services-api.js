export function constructSpecialServices() {
  return createManager(Symbol.for("special_services"), getClassVariable("special.services.class"));
}

export function deconstructSpecialServices() {
  return removeManager(Symbol.for("special_services"));
}

export function getSpecialServices() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("special_services"))) {
    return constructSpecialServices();
  }
  return tMgr.getManager(Symbol.for("special_services"));
}

export function try() {
  return getSpecialServices().try();
}

export function catch() {
  return getSpecialServices().catch();
}

export function createToolTip(tText) {
  return getSpecialServices().createToolTip(tText);
}

export function removeToolTip() {
  return getSpecialServices().removeToolTip();
}

export function setcursor(ttype) {
  return getSpecialServices().setcursor(ttype);
}

export function openNetPage(tURL_key, tTarget) {
  return getSpecialServices().openNetPage(tURL_key, tTarget);
}

export function showLoadingBar(tLoadID, tProps) {
  return getSpecialServices().showLoadingBar(tLoadID, tProps);
}

export function getUniqueID() {
  return getSpecialServices().getUniqueID();
}

export function getMachineID() {
  return getSpecialServices().getMachineID();
}

export function getPredefinedURL(tURL) {
  return getSpecialServices().getPredefinedURL(tURL);
}

export function getDomainPart(tURL) {
  return getSpecialServices().getDomainPart(tURL);
}

export function getMoviePath() {
  return getSpecialServices().getMoviePath();
}

export function getExtVarPath() {
  return getSpecialServices().getExtVarPath();
}

export function sendProcessTracking(tStepValue) {
  return getSpecialServices().sendProcessTracking(tStepValue);
}

export function getProcessTrackingList() {
  const tListStr = implode(getSpecialServices().getProcessTrackingList(), ",");
  return tListStr;
}

export function secretDecode(tKey) {
  return getSpecialServices().secretDecode(tKey);
}

export function readValueFromField(tFieldName, tDelimiter, tSearchedKey) {
  return getSpecialServices().readValueFromField(tFieldName, tDelimiter, tSearchedKey);
}

export function checkForXtra(tXtraName) {
  return getSpecialServices().checkForXtra(tXtraName);
}

export function performance() {
  if (objectExists(Symbol.for("perfTester"))) {
    return removeObject(Symbol.for("perfTester"));
  } else {
    return createObject(Symbol.for("perfTester"), getClassVariable("perf.test.class"));
  }
}

export function printMsg(tObj, tMsg) {
  getSpecialServices().print(tObj, tMsg);
}

export function callJavaScriptFunction(tCallString, tdata) {
  getSpecialServices().callJavaScriptFunction(tCallString, tdata);
}

export function getClientUpTime() {
  return getSpecialServices().getClientUpTime();
}
