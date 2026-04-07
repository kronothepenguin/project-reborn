// fuse_client/23_Special Services API.ls → special-services-api.js
// Special services API facade

import { symbol } from "../core/lingo-runtime.js";
import {
  createManager,
  createObject,
  getObjectManager,
  objectExists,
  removeManager,
  removeObject,
} from "./object-api.js";
import { implode } from "./string-services-api.js";
import { getClassVariable } from "./variable-api.js";

function constructSpecialServices() {
  return createManager(
    symbol("#special_services"),
    getClassVariable("special.services.class"),
  );
}

function deconstructSpecialServices() {
  return removeManager(symbol("#special_services"));
}

export function getSpecialServices() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(symbol("#special_services"))) {
    return constructSpecialServices();
  }
  return tMgr.getManager(symbol("#special_services"));
}

// Lingo 'try' is a reserved keyword in JS, renamed to tryAction
export function tryAction() {
  return getSpecialServices().try();
}

// Lingo 'catch' is a reserved keyword in JS, renamed to catchAction
export function catchAction() {
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
  return getSpecialServices().readValueFromField(
    tFieldName,
    tDelimiter,
    tSearchedKey,
  );
}

export function checkForXtra(tXtraName) {
  return getSpecialServices().checkForXtra(tXtraName);
}

export function performance() {
  if (objectExists(symbol("#perf_tester"))) {
    return removeObject(symbol("#perf_tester"));
  } else {
    return createObject(
      symbol("#perf_tester"),
      getClassVariable("perf.test.class"),
    );
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
