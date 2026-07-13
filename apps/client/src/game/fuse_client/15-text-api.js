export function constructTextManager() {
  return createManager(Symbol.for("text_manager"), getClassVariable("text.manager.class"));
}

export function deconstructTextManager() {
  return removeManager(Symbol.for("text_manager"));
}

export function getTextManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("text_manager"))) {
    return constructTextManager();
  }
  return tMgr.getManager(Symbol.for("text_manager"));
}

export function createText(tID, tValue) {
  return getTextManager().create(tID, tValue);
}

export function removeText(tID) {
  return getTextManager().Remove(tID);
}

export function setText(tID, tValue) {
  return getTextManager().create(tID, tValue);
}

export function getText(tID, tDefault) {
  return getTextManager().GET(tID, tDefault);
}

export function textExists(tID) {
  return getTextManager().exists(tID);
}

export function printTexts() {
  return getTextManager().print();
}

export function dumpTextField(tField, tDelimiter) {
  return getTextManager().dump(tField, tDelimiter);
}
