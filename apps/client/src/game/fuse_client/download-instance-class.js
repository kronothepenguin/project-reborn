import {
  VOID,
  getNetText,
  preloadNetThing,
  getStreamStatus,
  netDone,
  netError,
  netTextResult,
  listp,
  member,
  importFileInto,
  getVariable,
  variableExists,
  getIntVariable,
  RETURN,
  createTimeout,
  removeTimeout,
  timeoutExists,
} from "../../director";

export default function () {
  return {
    pStatus: VOID,
    pMemName: VOID,
    pMemNum: VOID,
    pURL: VOID,
    pType: VOID,
    pCallBack: VOID,
    pNetId: VOID,
    pPercent: VOID,
    ptryCount: VOID,

    deconstruct() {
      if (timeoutExists("dl_timeout_" + this.pNetId)) {
        removeTimeout("dl_timeout_" + this.pNetId);
      }
    },

    define(tMemName, tdata) {
      this.pStatus = Symbol.for("initializing");
      this.pMemName = tMemName;
      this.pMemNum = tdata[Symbol.for("memNum")];
      this.pURL = tdata[Symbol.for("url")];
      this.pType = tdata[Symbol.for("type")];
      this.pCallBack = tdata[Symbol.for("callback")];
      this.pPercent = 0.0;
      this.ptryCount = 0;
      return this.Activate();
    },

    addCallBack(tMemName, tCallback) {
      if (tMemName === this.pMemName) {
        this.pCallBack = tCallback;
        return 1;
      } else {
        return 0;
      }
    },

    getProperty(tProp) {
      switch (tProp) {
        case Symbol.for("status"):
          return this.pStatus;
        case Symbol.for("Percent"):
          return this.pPercent;
        case Symbol.for("url"):
          return this.pURL;
        case Symbol.for("type"):
          return this.pType;
        default:
          return 0;
      }
    },

    Activate() {
      if (this.pType === Symbol.for("text") || this.pType === Symbol.for("field")) {
        this.pNetId = getNetText(this.pURL);
      } else {
        this.pNetId = preloadNetThing(this.pURL);
      }
      this.pStatus = Symbol.for("LOADING");
      this.pPercent = 0.0;
      return 1;
    },

    activateWithTimeout() {
      this.pStatus = Symbol.for("paused");
      this.pPercent = 0.0;
      let tRetryTimeout;
      if (variableExists("download.retry.delay")) {
        tRetryTimeout = getVariable("download.retry.delay");
      } else {
        tRetryTimeout = 2000;
      }
      createTimeout("dl_timeout_" + this.pNetId, tRetryTimeout, Symbol.for("Activate"), this.getID(), VOID, 1);
    },

    update() {
      if (this.pStatus === Symbol.for("paused")) {
        return 0;
      }
      if (this.pStatus !== Symbol.for("LOADING")) {
        return 0;
      }
      let tStreamStatus = getStreamStatus(this.pNetId);
      if (listp(tStreamStatus)) {
        let tBytesSoFar = tStreamStatus[Symbol.for("bytesSoFar")];
        let tBytesTotal = tStreamStatus[Symbol.for("bytesTotal")];
        if (tBytesTotal === 0) {
          tBytesTotal = tBytesSoFar;
        }
        if (tStreamStatus[Symbol.for("bytesSoFar")] > 0) {
          this.pPercent = 1.0 * tBytesSoFar / tBytesTotal;
        }
      }
      if (netDone(this.pNetId) === 1) {
        if (netError(this.pNetId) === "OK" && this.pPercent > 0) {
          this.importFileToCast();
          _director.getDownloadManager().removeActiveTask(this.pMemName, this.pCallBack);
          this.pStatus = Symbol.for("complete");
          return 1;
        } else {
          let tErrorID = netError(this.pNetId);
          let tError = _director.getDownloadManager().solveNetErrorMsg(tErrorID);
          _director.error(this, "Download error:" + RETURN + this.pMemName + RETURN + tErrorID + "-" + tError + "-" + this.pPercent + "percent", Symbol.for("update"), Symbol.for("minor"));
          switch (netError(this.pNetId)) {
            case 6:
            case 4159:
            case 4165:
              if (!this.pURL.includes(_director.getDownloadManager().getProperty(Symbol.for("defaultURL")))) {
                this.pURL = _director.getDownloadManager().getProperty(Symbol.for("defaultURL")) + this.pURL;
                this.activateWithTimeout();
                return 0;
              } else {
                _director.getDownloadManager().removeActiveTask(this.pMemName, this.pCallBack, 0);
                return 0;
              }
            case 4242:
              return _director.getDownloadManager().removeActiveTask(this.pMemName, this.pCallBack);
            case 4155:
              break;
          }
          this.ptryCount = this.ptryCount + 1;
          if (this.ptryCount > getIntVariable("download.retry.count", 10)) {
            _director.getDownloadManager().removeActiveTask(this.pMemName, this.pCallBack, 0);
            return _director.error(this, "Download failed too many times:" + RETURN + this.pURL + "-" + tErrorID + "-" + this.pPercent + "percent", Symbol.for("update"), Symbol.for("major"));
          } else {
            let tTriesBeforeRAndParams = 2;
            if (this.ptryCount > tTriesBeforeRAndParams) {
              this.pURL = _director.getSpecialServices().addRandomParamToURL(this.pURL);
            }
            this.activateWithTimeout();
          }
        }
      }
    },

    importFileToCast() {
      let tmember = member(this.pMemNum);
      switch (this.pType) {
        case Symbol.for("text"):
        case Symbol.for("field"):
          tmember.text = netTextResult(this.pNetId);
          break;
        case Symbol.for("bitmap"):
          importFileInto(tmember, this.pURL, { dither: 0, trimWhiteSpace: 0 });
          break;
        default:
          importFileInto(tmember, this.pURL);
          break;
      }
      tmember.name = this.pMemName;
      return 1;
    },
  };
}
