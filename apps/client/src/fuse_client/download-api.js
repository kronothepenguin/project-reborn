// fuse_client/11_Download API.ls → download-api.js
// Download manager API facade

import { symbol } from "../core/lingo-runtime.js";
import {
  createManager,
  getObjectManager,
  removeManager,
} from "./object-api.js";
import { getClassVariable } from "./variable-api.js";

function constructDownloadManager() {
  return createManager(
    symbol("#download_manager"),
    getClassVariable("download.manager.class"),
  );
}

function deconstructDownloadManager() {
  return removeManager(symbol("#download_manager"));
}

export function getDownloadManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(symbol("#download_manager"))) {
    return constructDownloadManager();
  }
  return tMgr.getManager(symbol("#download_manager"));
}

export function queueDownload(
  tURL,
  tMemName,
  tFileType,
  tForceFlag,
  tDownloadType,
  tRedirectType,
  tTarget,
) {
  return getDownloadManager().queue(
    tURL,
    tMemName,
    tFileType,
    tForceFlag,
    tDownloadType,
    tRedirectType,
    tTarget,
  );
}

export function abortDownLoad(tMemNameOrNum) {
  return getDownloadManager().abort(tMemNameOrNum);
}

export function registerDownloadCallback(
  tMemNameOrNum,
  tMethod,
  tClientID,
  tArgument,
) {
  return getDownloadManager().registerCallback(
    tMemNameOrNum,
    tMethod,
    tClientID,
    tArgument,
  );
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
