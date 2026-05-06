import {
  EMPTY,
  QUOTE,
  RETURN,
  VOID,
  getIntVariable,
  getStreamStatus,
  listp,
  netDone,
  netError,
  preloadNetThing,
  the,
} from "../../director";

export default function () {
  return {
    pFile: VOID,
    pURL: VOID,
    pNetId: VOID,
    pGroupId: VOID,
    pLoadTime: VOID,
    pBytesSoFar: VOID,
    ptryCount: VOID,
    pPercent: VOID,
    pState: VOID,
    pRetryDelay: VOID,
    pCastLoadMaxRetryCount: VOID,

    define(tFile, tURL, tpreloadId) {
      this.pFile = tFile;
      this.pURL = tURL;
      this.pGroupId = tpreloadId;
      this.ptryCount = 1;
      this.pRetryDelay = getIntVariable("castload.retry.delay", 10000);
      this.pCastLoadMaxRetryCount = getIntVariable("castload.retry.count", 10);
      return this.Activate();
    },

    Activate() {
      if (this.ptryCount > 3) {
        if (this.pURL.includes("http://")) {
          if (this.pURL.includes("?")) {
            this.pURL = this.pURL + "&" + the.milliSeconds;
          } else {
            this.pURL = this.pURL + "?" + the.milliSeconds;
          }
        }
      }
      this.pNetId = preloadNetThing(this.pURL);
      this.pLoadTime = the.milliSeconds;
      this.pBytesSoFar = 0;
      this.pPercent = 0.0;
      this.pState = Symbol.for("LOADING");
      return 1;
    },

    update() {
      if ((this.pState === Symbol.for("done")) || (this.pState === Symbol.for("failed"))) {
        return 1;
      }
      let tStreamStatus = getStreamStatus(this.pNetId);
      if (!listp(tStreamStatus)) {
        return _director.error(this, "Invalid stream status:" + " " + this.pFile + " " + "/" + " " + tStreamStatus, Symbol.for("update"), Symbol.for("minor"));
      }
      if ((tStreamStatus.bytesSoFar > 0) && (this.pState === Symbol.for("LOADING"))) {
        let tBytesSoFar = tStreamStatus.bytesSoFar;
        let tBytesTotal = tStreamStatus.bytesTotal;
        if (tBytesTotal === 0) {
          tBytesTotal = tBytesSoFar;
        }
        this.pPercent = 1.0 * tBytesSoFar / tBytesTotal;
        _director.getCastLoadManager().TellStreamState(this.pFile, this.pState, this.pPercent, this.pGroupId);
      }
      if (tStreamStatus.bytesSoFar !== this.pBytesSoFar) {
        this.pBytesSoFar = tStreamStatus.bytesSoFar;
        this.pLoadTime = the.milliSeconds;
      } else {
        if (((the.milliSeconds - this.pLoadTime) > this.pRetryDelay) || (this.pState === Symbol.for("error"))) {
          let tErrorMsg = _director.getCastLoadManager().solveNetErrorMsg(netError(this.pNetId));
          _director.error(this, "Failed network operation:" + RETURN + this.pURL + RETURN + tErrorMsg, Symbol.for("update"), Symbol.for("minor"));
          this.ptryCount = this.ptryCount + 1;
          if (this.ptryCount >= this.pCastLoadMaxRetryCount) {
            this.pPercent = 1.0;
            this.pState = Symbol.for("error");
            this.pState = Symbol.for("failed");
            _director.getCastLoadManager().DoneCurrentDownLoad(this.pFile, this.pURL, this.pGroupId, this.pState);
            return _director.SystemAlert(this, "Failed download operation:" + RETURN + "Tried to load file" + " " + QUOTE + this.pFile + QUOTE + " " + this.ptryCount + " " + "times.", Symbol.for("update"));
          } else {
            let tTriesBeforeRAndParams = 3;
            if (this.ptryCount > tTriesBeforeRAndParams) {
              this.pURL = _director.getSpecialServices().addRandomParamToURL(this.pURL);
            }
          }
          _director.getCastLoadManager().TellStreamState(this.pFile, this.pState, 0.0, this.pGroupId);
          this.Activate();
          return 0;
        }
      }
      if ((tStreamStatus.error !== EMPTY) && (tStreamStatus.error !== "OK")) {
        this.pState = Symbol.for("error");
      }
      if (netDone(this.pNetId) && (this.pState !== Symbol.for("error"))) {
        this.pPercent = 1.0;
        this.pState = Symbol.for("done");
        _director.getCastLoadManager().DoneCurrentDownLoad(this.pFile, this.pURL, this.pGroupId, this.pState);
      }
    },
  };
}
