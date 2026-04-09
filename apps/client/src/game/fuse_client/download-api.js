// Download API
// Translated from: 11_Download API.ls

export default function () {
  return {
    constructDownloadManager() {
      return _director.createManager(
        Symbol.for("download_manager"),
        _director.getClassVariable("download.manager.class"),
      );
    },

    deconstructDownloadManager() {
      return _director.removeManager(Symbol.for("download_manager"));
    },

    getDownloadManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("download_manager"))) {
        return this.constructDownloadManager();
      }
      return tMgr.getManager(Symbol.for("download_manager"));
    },

    queueDownload(tURL, tMemName, tFileType, tForceFlag, tDownloadType, tRedirectType, tTarget) {
      return this.getDownloadManager().queue(tURL, tMemName, tFileType, tForceFlag, tDownloadType, tRedirectType, tTarget);
    },

    abortDownLoad(tMemNameOrNum) {
      return this.getDownloadManager().abort(tMemNameOrNum);
    },

    registerDownloadCallback(tMemNameOrNum, tMethod, tClientID, tArgument) {
      return this.getDownloadManager().registerCallback(tMemNameOrNum, tMethod, tClientID, tArgument);
    },

    getDownLoadPercent(tID) {
      return this.getDownloadManager().getLoadPercent(tID);
    },

    downloadExists(tID) {
      return this.getDownloadManager().exists(tID);
    },

    printDownloads() {
      return this.getDownloadManager().print();
    },
  };
}
