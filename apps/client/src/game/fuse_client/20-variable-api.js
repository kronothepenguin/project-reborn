export function constructVariableManager() {
  return createManager(Symbol.for("variable_manager"), value(convertToPropList(field("System Props"), RETURN)["variable.manager.class"]));
}

export function deconstructVariableManager() {
  return removeManager(Symbol.for("variable_manager"));
}

export function getVariableManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("variable_manager"))) {
    return constructVariableManager();
  }
  return tMgr.getManager(Symbol.for("variable_manager"));
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
