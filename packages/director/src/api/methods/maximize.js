// @owner window
export function maximize(windowObjRef) {
  if (windowObjRef && typeof windowObjRef.maximize === "function") {
    windowObjRef.maximize();
  }
}
