export default class {
  pMUXtra;
  pServer;
  pPort;
  pDestination;
  pData;
  pMaxBytes;
  pCRLF;
  pNetDone;
  pNetResult;
  pNetError;
  pNetRequest;
  pUserAgent;
  pHttpVersion;
  pResponseCbHandler;
  pResponseCbObj;
  pCookies;
  pType;
  pStatus;
  pMemName;
  pMemNum;
  pCallBack;
  pRedirectNetID;
  pRedirectUrl;
  pRedirectType;
  pTarget;

  define(tMemName, tdata) {
    this.pStatus = Symbol.for("initializing");
    this.pMemName = tMemName;
    this.pMemNum = tdata[Symbol.for("memNum")];
    this.pType = tdata[Symbol.for("type")];
    this.pCallBack = tdata[Symbol.for("callback")];
    this.pTarget = tdata[Symbol.for("target")];
    if (voidp(tdata[Symbol.for("redirectType")])) {
      this.pRedirectType = Symbol.for("follow");
    } else {
      this.pRedirectType = tdata[Symbol.for("redirectType")];
    }
    const tSeparatedURL = this.separateURL(tdata[Symbol.for("url")]);
    this.pServer = tSeparatedURL[Symbol.for("server")];
    this.pDestination = tSeparatedURL[Symbol.for("destination")];
    this.pPort = tSeparatedURL[Symbol.for("port")];
    if (voidp(this.pDestination)) {
      this.pDestination = "/";
    }
    if (!(this.pDestination.starts("/"))) {
      putBefore(this.pDestination, "/");
    }
    if (voidp(this.pPort)) {
      this.pPort = 80;
    }
    this.pCRLF = `${numToChar(13)}${numToChar(10)}`;
    this.pUserAgent = `HTTP-CLASS/0.1`;
    this.pHttpVersion = "1.1";
    this.pMaxBytes = 16 * 1024;
    this.pData = propList();
    this.pNetDone = 0;
    if (this.pCookies == VOID) {
      this.pCookies = propList();
    }
    this.pRedirectNetID = VOID;
    return this.sendRequest();
  }

  separateURL(tURL) {
    const tUrlParts = propList();
    tURL = replaceChunks(tURL, "http://", EMPTY);
    const tDestinationOffset = offset("/", tURL);
    const tServerURL = chars(tURL, 1, tDestinationOffset - 1);
    const tDestination = chars(tURL, tDestinationOffset, tURL.length);
    let tPort = 80;
    let tServer = tServerURL;
    if (tServerURL.contains(":")) {
      const tPortOffset = offset(":", tServerURL);
      tServer = chars(tServerURL, 1, tPortOffset - 1);
      tPort = value(chars(tServerURL, tPortOffset + 1, tServerURL.length));
    }
    return propList("server", tServer, "destination", tDestination, "port", tPort);
  }

  addCallBack(tMemName, tCallback) {
    if (tMemName == this.pMemName) {
      this.pCallBack = tCallback;
      return 1;
    } else {
      return 0;
    }
  }

  getProperty(tProp) {
    switch (tProp) {
      case Symbol.for("status"):
        return this.pStatus;
      case Symbol.for("url"):
        return `${this.pServer}${this.pDestination}`;
      case Symbol.for("type"):
        return this.pType;
      case Symbol.for("Percent"):
        if (this.pNetDone) {
          return 100;
        } else {
          return 0.0;
        }
      default:
        return 0;
    }
  }

  update() {
    if (this.pNetDone) {
      if ((this.pStatus == Symbol.for("error")) || (this.pStatus == Symbol.for("LOADING"))) {
        this.pStatus = Symbol.for("complete");
        getDownloadManager().removeActiveTask(this.pMemName, this.pCallBack);
        return 1;
      }
    }
    if (!voidp(this.pRedirectNetID)) {
      if (netDone(this.pRedirectNetID)) {
        if (!memberExists(this.pMemName)) {
          createMember(this.pMemName, Symbol.for("bitmap"));
        }
        importFileInto(member(this.pMemName), this.pRedirectUrl, propList("dither", 0, "trimWhiteSpace", 0));
        this.pNetDone = 1;
        this.pRedirectNetID = VOID;
      }
    }
    return 0;
  }

  sendRequest() {
    this.pNetResult = VOID;
    this.pNetDone = 0;
    this.pNetError = 0;
    this.pStatus = Symbol.for("LOADING");
    this.pMUXtra = xtra("multiuser").new();
    this.pMUXtra.setNetBufferLimits(16 * 1024 * 2, this.pMaxBytes, 100);
    const tErrCode = this.pMUXtra.setNetMessageHandler(Symbol.for("messageHandler"), this);
    if (tErrCode != 0) {
      error(this, "Error with setNetMessageHandler", Symbol.for("sendRequest"), Symbol.for("major"));
    }
    const tErrCode2 = this.pMUXtra.connectToNetServer("*", "*", this.pServer, this.pPort, "HTTP_CLASS", 1);
    if (tErrCode2 != 0) {
      error(this, "Error sending ConnectToNetServer to server", Symbol.for("sendRequest"), Symbol.for("major"));
      this.pStatus = Symbol.for("error");
      this.pNetDone = 1;
      return 0;
    }
  }

  getStoredCookies(tDomain) {
    if (voidp(tDomain)) {
      tDomain = this.pServer;
    }
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = ".";
    const tDomainItemCount = tDomain.item.count;
    tDomain = `${tDomain.item[tDomainItemCount - 1]}${tDomain.item[tDomainItemCount]}`;
    the.itemDelimiter = tDelim;
    const tCookiePrefLoc = getVariable("httpcookie.pref.name");
    let tAllCookies = value(getPref(tCookiePrefLoc));
    if (ilk(tAllCookies) != Symbol.for("propList")) {
      tAllCookies = propList();
    }
    let tThisDomainCookies = tAllCookies[tDomain];
    if (ilk(tThisDomainCookies) != Symbol.for("propList")) {
      tThisDomainCookies = propList();
    }
    const tFlatCookieList = list();
    for (const tUniqueCookie of tThisDomainCookies) {
      tFlatCookieList.add(tUniqueCookie);
    }
    return tFlatCookieList;
  }

  setStoredCookies(tDomain, tNewCookies) {
    if (voidp(tDomain) || voidp(tNewCookies)) {
      return 0;
    }
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = ".";
    const tDomainItemCount = tDomain.item.count;
    tDomain = `${tDomain.item[tDomainItemCount - 1]}${tDomain.item[tDomainItemCount]}`;
    the.itemDelimiter = tDelim;
    const tCookiePrefLoc = getVariable("httpcookie.pref.name");
    let tAllCookies = value(getPref(tCookiePrefLoc));
    if (ilk(tAllCookies) != Symbol.for("propList")) {
      tAllCookies = propList();
    }
    let tThisDomainCookies = tAllCookies[tDomain];
    if (ilk(tThisDomainCookies) != Symbol.for("propList")) {
      tThisDomainCookies = propList();
    }
    for (const tNewCookie of tNewCookies) {
      const tNewCookieID = tNewCookie[1];
      tThisDomainCookies[tNewCookieID] = tNewCookie;
    }
    tAllCookies[tDomain] = tThisDomainCookies;
    setPref(tCookiePrefLoc, `${tAllCookies}${EMPTY}`);
  }

  createNetRequest() {
    let tCmd = EMPTY;
    const tHeaders = list();
    const tBody = EMPTY;
    let tPort = `:${this.pPort}`;
    if (tPort == ":80") {
      tPort = EMPTY;
    }
    tHeaders.add(`Host: ${this.pServer}${tPort}`);
    tHeaders.add(`User-Agent:${this.pUserAgent}`);
    tHeaders.add("Accept: text/*");
    tHeaders.add("Accept-Charset: ISO-8859-1");
    this.pCookies = this.getStoredCookies(this.pServer);
    let tCookieString = EMPTY;
    for (const tCookie of this.pCookies) {
      if (this.pDestination.starts(tCookie["path"])) {
        if (tCookieString != EMPTY) {
          putAfter(tCookieString, "; ");
        }
        putAfter(tCookieString, `${tCookie["name"]}=${tCookie["value"]}`);
      }
    }
    if (tCookieString != EMPTY) {
      tHeaders.add(`Cookie:${tCookieString}`);
    }
    let tDestination = this.pDestination;
    if (count(this.pData)) {
      putAfter(tDestination, `?${this.getDataString(this.pData)}`);
    }
    const tMethod = "GET";
    tCmd = `${tMethod} ${tDestination} HTTP/${this.pHttpVersion}`;
    return propList("cmd", tCmd, "headers", tHeaders, "body", tBody);
  }

  messageHandler() {
    const tMsg = this.pMUXtra.getNetMessage();
    this.pNetError = tMsg.errorCode;
    const tSenderId = tMsg.senderID;
    const tSubject = tMsg.subject;
    const tContent = tMsg.content;
    if (!(this.pNetError == 0)) {
      if ((tSenderId == "System") && (tSubject == "ConnectionProblem")) {
        nothing();
      } else {
        const tErrStr = this.pMUXtra.getNetErrorString(this.pNetError);
        this.pNetDone = 1;
        this.pStatus = Symbol.for("error");
        this.clearMU();
      }
      return 1;
    }
    if ((tSenderId == "System") && (tSubject == "ConnectToNetServer")) {
      this.handleHelloResponse(tMsg);
    } else {
      this.handleContentResponse(tMsg, tContent);
    }
  }

  handleHelloResponse(tMsg) {
    this.pNetRequest = this.createNetRequest();
    let tHttpStr = `${this.pNetRequest["cmd"]}${this.pCRLF}`;
    for (const tHeader of this.pNetRequest["headers"]) {
      putAfter(tHttpStr, `${tHeader}${this.pCRLF}`);
    }
    putAfter(tHttpStr, this.pCRLF);
    putAfter(tHttpStr, this.pNetRequest["body"]);
    this.pMUXtra.sendNetMessage("system", EMPTY, tHttpStr);
  }

  handleContentResponse(tMsg, tContent) {
    let tFinished = 0;
    if (tContent.starts("HTTP/")) {
      this.pNetResult = this.parseResponse(tContent);
      let tBody = this.pNetResult["body"];
      const tNotChunkedResult = this.pNetResult["headers"]["Transfer-Encoding"] != "chunked";
      const tEndOfResult = tBody.char[`${tBody.length - 4}..${tBody.length}`] == (`0${this.pCRLF}${this.pCRLF}`);
      if (tNotChunkedResult || tEndOfResult) {
        tFinished = 1;
      }
      this.pNetResult["body"] = tBody;
      let tPos = this.pNetResult.headers.findPos("Set-Cookie");
      if (!voidp(tPos)) {
        while (1) {
          this.pCookies.add(this.parseCookieString(this.pNetResult.headers[tPos]));
          tPos = tPos + 1;
          if (tPos > this.pNetResult.headers.count) {
            break;
          }
          if (this.pNetResult.headers.getPropAt(tPos) != "Set-Cookie") {
            break;
          }
        }
        this.setStoredCookies(this.pServer, this.pCookies);
      }
    } else {
      if (tContent.char[`${tContent.length - 4}..${tContent.length}`] == (`0${this.pCRLF}${this.pCRLF}`)) {
        tContent = tContent.char[`1..${tContent.length - 7}`];
        tFinished = 1;
      }
      this.pNetResult["body"] = `${this.pNetResult["body"]}${tContent}`;
    }
    if (tFinished) {
      if (this.pNetResult["headers"]["Transfer-Encoding"] == "chunked") {
        this.pNetResult["body"] = this.parseRawBody(this.pNetResult["body"]);
      }
      const tRedirectUrl = this.pNetResult["headers"]["Location"];
      if (voidp(tRedirectUrl)) {
        const tmember = member(this.pMemName);
        if (tmember.type != Symbol.for("text")) {
          error(this, "Incompatible download type. Maybe not redirected.", Symbol.for("handleContentResponse"), Symbol.for("minor"));
        } else {
          member(this.pMemName).text = this.pNetResult["body"];
          this.pNetDone = 1;
        }
      } else {
        let tCompleteUrl = tRedirectUrl;
        if (!(tRedirectUrl.contains("http://"))) {
          if (!(tRedirectUrl.starts("/"))) {
            putBefore(tRedirectUrl, "/");
          }
          tCompleteUrl = `http://${this.pServer}${tRedirectUrl}`;
        }
        if (this.pRedirectType == Symbol.for("follow")) {
          const tOwnDomain = getDomainPart(getMoviePath());
          const tDownloadDomain = getDomainPart(tCompleteUrl);
          if ((tOwnDomain != tDownloadDomain) && ((tCompleteUrl.contains("http://")) || (tCompleteUrl.contains("https://"))) && !(tCompleteUrl.contains("://localhost"))) {
            let tAllowCrossDomain = 0;
            if (variableExists("client.allow.cross.domain")) {
              tAllowCrossDomain = getVariable("client.allow.cross.domain");
            }
            let tNotifyCrossDomain = 1;
            if (variableExists("client.notify.cross.domain")) {
              tNotifyCrossDomain = value(getVariable("client.notify.cross.domain"));
            }
            if (tNotifyCrossDomain) {
              executeMessage("crossDomainDownload", tCompleteUrl);
            }
            if (!tAllowCrossDomain) {
              this.pNetDone = 1;
              return error(this, `Cross domain download not allowed: ${tCompleteUrl}`, Symbol.for("handleContentResponse"), Symbol.for("minor"));
            }
          }
          if (this.pType == Symbol.for("bitmap")) {
            this.pRedirectUrl = tCompleteUrl;
            this.pRedirectNetID = preloadNetThing(tCompleteUrl);
          } else {
            if (this.pType == Symbol.for("text")) {
              this.define(this.pMemName, propList("url", tCompleteUrl, "memNum", this.pMemNum, "type", this.pType, "callback", this.pCallBack));
            }
          }
        } else {
          if (voidp(this.pTarget)) {
            openNetPage(tCompleteUrl, "_new");
          } else {
            openNetPage(tCompleteUrl, this.pTarget);
          }
          this.pNetDone = 1;
        }
      }
    }
  }

  clearMU() {
    if (objectp(this.pMUXtra)) {
      let tErrCode = this.pMUXtra.setNetMessageHandler(0, this);
      tErrCode = this.pMUXtra.setNetMessageHandler(0, this, "ConnectToNetServer");
    }
    this.pMUXtra = VOID;
  }

  parseResponse(tResponse) {
    const tTemp = explode(tResponse, `${this.pCRLF}${this.pCRLF}`, 2);
    const tResponseHeaders = tTemp[1];
    let tResponseBody = tTemp[2];
    const tResponseHeaderLines = explode(tResponseHeaders, this.pCRLF);
    const tHttpResponseLine = tResponseHeaderLines[1];
    const tResponseCode = tHttpResponseLine;
    const tResponseCodeNum = integer(tResponseCode.word[2]);
    const tResponseHeaderArray = propList();
    for (let i = 2; i <= tResponseHeaderLines.count; i++) {
      const tHeaderLine = tResponseHeaderLines[i];
      const tTemp2 = explode(tHeaderLine, ": ", 2);
      const tHeader = tTemp2[1];
      const tValue = tTemp2[2];
      tResponseHeaderArray.addProp(tHeader, tValue);
    }
    tResponseHeaderArray.sort();
    const tReturnArr = propList();
    tReturnArr["status_code"] = tResponseCode;
    tReturnArr["status_num"] = tResponseCodeNum;
    tReturnArr["headers"] = tResponseHeaderArray;
    tReturnArr["body"] = tResponseBody;
    return tReturnArr;
  }

  parseRawBody(tRawbody) {
    let tBody = EMPTY;
    while (1) {
      const tTemp = explode(tRawbody, this.pCRLF, 2);
      if (tTemp.count < 2) {
        putAfter(tBody, tRawbody);
        break;
      }
      const tLen = this.hex2dec(tTemp[1]);
      tRawbody = tTemp[2];
      putAfter(tBody, tRawbody.char[`1..${tLen}`]);
      deleteChunk(tRawbody, `1..${tLen + 2}`);
    }
    return tBody;
  }

  parseCookieString(tStr) {
    const tCookie = propList();
    const tParts = explode(tStr, "; ");
    const tTemp = explode(tParts[1], "=");
    tCookie["name"] = tTemp[1];
    tCookie["value"] = tTemp[2];
    for (let i = 2; i <= tParts.count; i++) {
      const tTemp2 = explode(tParts[i], "=");
      if (tTemp2[1] == "path") {
        tCookie["path"] = tTemp2[2];
      }
    }
    if (voidp(tCookie["path"])) {
      tCookie["path"] = "/";
    }
    return tCookie;
  }

  getDataString(tdata) {
    let tDataStr = EMPTY;
    for (let i = 1; i <= tdata.count; i++) {
      putAfter(tDataStr, `${urlEncode(tdata.getPropAt(i))}=${urlEncode(tdata[i])}`);
      if (i < tdata.count) {
        putAfter(tDataStr, "&");
      }
    }
    return tDataStr;
  }

  hex2dec(tHex) {
    const tCol = rgb(tHex);
    return (tCol.red * 65536) + (tCol.green * 256) + tCol.blue;
  }
}
