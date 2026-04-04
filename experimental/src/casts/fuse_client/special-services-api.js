/**
 * Special Services API
 * 
 * Translated from: casts/fuse_client/23_Special Services API.ls
 * 
 * Global utility functions: tooltips, cursor, URL handling, unique IDs, etc.
 */

import { VOID, voidp, objectp, integer } from '../../core/lingo-runtime.js';
import { createManager, removeManager, getManager, managerExists, createObject, removeObject, objectExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructSpecialServices() {
  return createManager('special_services', getManagerClassList('special'));
}

export function deconstructSpecialServices() {
  return removeManager('special_services');
}

export function getSpecialServices() {
  if (!managerExists('special_services')) {
    return constructSpecialServices();
  }
  return getManager('special_services');
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

/**
 * Generate a unique ID
 */
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
  return getSpecialServices().getProcessTrackingList();
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

/**
 * Toggle performance tester
 */
export function performance() {
  if (objectExists('perfTester')) {
    return removeObject('perfTester');
  } else {
    return createObject('perfTester', getManagerClassList('perf'));
  }
}

export function printMsg(tObj, tMsg) {
  return getSpecialServices().print(tObj, tMsg);
}

export function callJavaScriptFunction(tCallString, tdata) {
  return getSpecialServices().callJavaScriptFunction(tCallString, tdata);
}

export function getClientUpTime() {
  return getSpecialServices().getClientUpTime();
}
