let gError;

export function constructErrorManager() {
  if (objectp(gError)) {
    return gError;
  }
  const tClass = value(convertToPropList(field("System Props"), RETURN)["error.manager.class"])[1];
  gError = script(tClass).new();
  gError.construct();
  try();
  createObject(Symbol.for("error_manager"), gError);
  catch();
  return gError;
}

export function deconstructErrorManager() {
  if (!objectp(gError)) {
    return 0;
  }
  gError.deconstruct();
  gError = VOID;
  return 1;
}

export function getErrorManager() {
  if (!objectp(gError)) {
    return constructErrorManager();
  }
  return gError;
}

export function error(tObject, tMsg, tMethod, tErrorLevel) {
  return getErrorManager().error(tObject, tMsg, tMethod, tErrorLevel);
}

export function serverError(tErrorList) {
  return getErrorManager().serverError(tErrorList);
}

export function getClientErrors() {
  return getErrorManager().getClientErrors();
}

export function getServerErrors() {
  return getErrorManager().getServerErrors();
}

export function fatalError(tErrorData) {
  return getErrorManager().fatalError(tErrorData);
}

export function SystemAlert(tObject, tMsg, tMethod) {
  return getErrorManager().SystemAlert(tObject, tMsg, tMethod);
}

export function setDebugLevel(tLevel) {
  return getErrorManager().setDebugLevel(tLevel);
}

export function printErrors() {
  return getErrorManager().print();
}
