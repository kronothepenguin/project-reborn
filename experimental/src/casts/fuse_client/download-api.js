/**
 * Download API
 * 
 * Translated from: casts/fuse_client/11_Download API.ls
 * 
 * Global functions for file download management.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { createManager, removeManager, getManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructDownloadManager() {
  return createManager('download_manager', getManagerClassList('download'));
}

export function deconstructDownloadManager() {
  return removeManager('download_manager');
}

export function getDownloadManager() {
  if (!managerExists('download_manager')) {
    return constructDownloadManager();
  }
  return getManager('download_manager');
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
