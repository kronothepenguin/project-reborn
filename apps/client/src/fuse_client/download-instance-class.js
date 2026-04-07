// fuse_client/48_Download Instance Class.ls → download-instance-class.js
// Download instance - handles individual file downloads with retry logic

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  listp,
  error,
} from "../core/lingo-runtime.js";
import { getVariable, getIntVariable, variableExists } from './variable-api.js'
import { getDownloadManager } from './download-api.js'
import { getSpecialServices } from './special-services-api.js'
import { createTimeout, timeoutExists, removeTimeout } from './timeout-api.js'

export class DownloadInstanceClass {
  constructor() {
    this.pStatus = null;
    this.pMemName = "";
    this.pMemNum = 0;
    this.pURL = "";
    this.pType = null;
    this.pCallBack = null;
    this.pNetId = 0;
    this.pPercent = 0.0;
    this.ptryCount = 0;
    this.pID = null;
  }

  deconstruct() {
    const timeoutName = "dl_timeout_" + this.pNetId;
    if (timeoutExists(timeoutName)) {
      removeTimeout(timeoutName);
    }
  }

  define(tMemName, tdata) {
    this.pStatus = symbol("#initializing");
    this.pMemName = tMemName;
    this.pMemNum = tdata.memNum;
    this.pURL = tdata.url;
    this.pType = tdata.type;
    this.pCallBack = tdata.callback;
    this.pPercent = 0.0;
    this.ptryCount = 0;
    return this.Activate();
  }

  addCallBack(tMemName, tCallback) {
    if (tMemName === this.pMemName) {
      this.pCallBack = tCallback;
      return true;
    } else {
      return false;
    }
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol("#status"):
        return this.pStatus;
      case symbol("#Percent"):
        return this.pPercent;
      case symbol("#url"):
        return this.pURL;
      case symbol("#type"):
        return this.pType;
      default:
        return 0;
    }
  }

  Activate() {
    this.pStatus = symbol("#LOADING");
    this.pPercent = 0.0;
    // In Director: pNetId = preloadNetThing(this.pURL)
    // In JS: fetch with progress tracking
    this._startFetch();
    return true;
  }

  activateWithTimeout() {
    this.pStatus = symbol("#paused");
    this.pPercent = 0.0;
    let tRetryTimeout = 2000;
    if (variableExists("download.retry.delay")) {
      tRetryTimeout = getVariable("download.retry.delay");
    }
    createTimeout(
      "dl_timeout_" + this.pNetId,
      tRetryTimeout,
      symbol("#Activate"),
      this.pID,
      null,
      false,
    );
  }

  update() {
    if (this.pStatus === symbol("#paused")) {
      return false;
    }
    if (this.pStatus !== symbol("#LOADING")) {
      return false;
    }
    // In Director: check getStreamStatus(pNetId) and netDone(pNetId)
    // In JS: handled by fetch response
  }

  importFileToCast() {
    // In Director: importFileInto(member, url)
    // In JS: handled by fetch response processing
    return true;
  }

  _startFetch() {
    // Placeholder for actual fetch implementation
    // Will be implemented when download system is connected to real network
    fetch(this.pURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Download failed: " + response.status);
        }
        const contentLength = response.headers.get("content-length");
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;

        return response.body
          .pipeThrough(
            new TextDecoderStream() ? new TextDecoderStream() : undefined,
          )
          .pipeTo(
            new WritableStream({
              write: function (chunk) {
                loaded += chunk.length;
                if (total > 0) {
                  this.pPercent = loaded / total;
                }
              }.bind(this),
            }),
          )
          .then(() => {
            this.pStatus = symbol("#complete");
            this.pPercent = 1.0;
            getDownloadManager().removeActiveTask(
              this.pMemName,
              this.pCallBack,
            );
          });
      })
      .catch((err) => {
        error(
          this,
          "Download error:\n" +
            this.pMemName +
            "\n" +
            err.message +
            "-" +
            this.pPercent +
            "percent",
          symbol("#update"),
          symbol("#minor"),
        );
        this.ptryCount++;
        if (this.ptryCount > getIntVariable("download.retry.count", 10)) {
          getDownloadManager().removeActiveTask(
            this.pMemName,
            this.pCallBack,
            false,
          );
          error(
            this,
            "Download failed too many times:\n" +
              this.pURL +
              "-" +
              err.message +
              "-" +
              this.pPercent +
              "percent",
            symbol("#update"),
            symbol("#major"),
          );
        } else {
          if (this.ptryCount > 2) {
            this.pURL = getSpecialServices().addRandomParamToURL(this.pURL);
          }
          this.activateWithTimeout();
        }
      });
  }
}
