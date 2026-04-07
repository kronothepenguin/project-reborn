// fuse_client/20_Variable API.ls → variable-api.js
// Variable manager API facade for system variables

import {
  symbol,
  voidP,
  value,
  field,
  convertToPropList,
  RETURN,
} from "../core/lingo-runtime.js";
import {
  createManager,
  getObjectManager,
  removeManager,
} from "./object-api.js";

function constructVariableManager() {
  return createManager(
    symbol("#variable_manager"),
    value(
      convertToPropList(field("System Props"), RETURN).getaProp(
        "variable.manager.class",
      ),
    ),
  );
}

function deconstructVariableManager() {
  return removeManager(symbol("#variable_manager"));
}

export function getVariableManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(symbol("#variable_manager"))) {
    return constructVariableManager();
  }
  return tMgr.getManager(symbol("#variable_manager"));
}

export function createVariable(tID, tValue) {
  return getVariableManager().create(tID, tValue);
}

export function removeVariable(tID) {
  return getVariableManager().Remove(tID);
}

export function setVariable(tID, tValue) {
  return getVariableManager().create(tID, tValue);
}

export function getVariable(tID, tDefault) {
  return getVariableManager().GET(tID, tDefault);
}

export function getIntVariable(tID, tDefault) {
  return getVariableManager().getInt(tID, tDefault);
}

export function getStructVariable(tID, tDefault) {
  return getVariableManager().GetValue(tID, tDefault);
}

export function getClassVariable(tID, tDefault) {
  return getVariableManager().GetValue(tID, tDefault);
}

export function getVariableValue(tID, tDefault) {
  return getVariableManager().GetValue(tID, tDefault);
}

export function variableExists(tID) {
  return getVariableManager().exists(tID);
}

export function printVariables() {
  return getVariableManager().print();
}

export function dumpVariableField(tField, tDelimiter) {
  return getVariableManager().dump(tField, tDelimiter);
}
