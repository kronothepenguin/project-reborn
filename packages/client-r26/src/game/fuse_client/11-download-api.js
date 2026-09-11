export function constructDownloadManager() {
  return createManager(Symbol.for("download_manager"), getClassVariable("download.manager.class"));
}

export function deconstructDownloadManager() {
  return removeManager(Symbol.for("download_manager"));
}

export function getDownloadManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("download_manager"))) {
    return constructDownloadManager();
  }
  return tMgr.getManager(Symbol.for("download_manager"));
}

export function queueDownload(tURL, tMemName, tFileType, tForceFlag, tDownloadType, tRedirectType, tTarget) {
  return getDownloadManager().queue(tURL, tMemName, tFileType, tForceFlag, tDownloadType, tRedirectType, tTarget);
}

export function abortDownLoad(tMemNameOrNum) {
  return getDownloadManager().abort(tMemNameOrNum);
}

export function registerDownloadCallback(tMemNameOrNum, tMethod, tClientID, tArgument) {
  return getDownloadManager().registerCallback(tMemNameOrNum, tMethod, tClientID, tArgument);
}

export function getDownLoadPercent(tID) {
  return getDownloadManager().getLoadPercent(tID);
}

export function downloadExists(tID) {
  return getDownloadManager().exists(tID);
}

export function printDownloads() {
  return getDownloadManager().print();
}
