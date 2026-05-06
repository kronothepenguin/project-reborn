import {
  EMPTY,
  VOID,
  chars,
  getPref,
  ilk,
  integer,
  list,
  member,
  netDone,
  numToChar,
  objectp,
  offset,
  openNetPage,
  propList,
  rgb,
  setPref,
  value,
  voidp,
} from "../../director";
import { itemOf, the, wordOf } from "../../director";

export default function () {
  let tSeparatedURL, tUrlParts, tDestinationOffset, tServerURL, tDestination, tPort, tServer, tPortOffset;
  let tCmd, tHeaders, tBody, tErrCode, tCookieString, tPos, tFinished, tNotChunkedResult, tEndOfResult;
  let tMsg, tSenderId, tSubject, tContent, tErrStr, tHttpStr, tHeader, tHeaderLine, tValue;
  let tTemp, tResponseHeaders, tResponseBody, tResponseHeaderLines, tHttpResponseLine, tResponseCode, tResponseCodeNum;
  let tResponseHeaderArray, tReturnArr, tRawbody, tLen,  tCookie, tParts;
  let tDelim, tDomainItemCount, tCookiePrefLoc, tAllCookies, tThisDomainCookies, tFlatCookieList;
  let tUniqueCookie, tNewCookie, tNewCookieID, tCompleteUrl, tmember, tRedirectUrl;
  let tOwnDomain, tDownloadDomain, tAllowCrossDomain, tNotifyCrossDomain;
  let tDataStr, tCol, tMethod;

  return {
    pMUXtra: VOID,
    pServer: VOID,
    pPort: VOID,
    pDestination: VOID,
    pData: VOID,
    pMaxBytes: VOID,
    pCRLF: VOID,
    pNetDone: VOID,
    pNetResult: VOID,
    pNetError: VOID,
    pNetRequest: VOID,
    pUserAgent: VOID,
    pHttpVersion: VOID,
    pResponseCbHandler: VOID,
    pResponseCbObj: VOID,
    pCookies: VOID,
    pType: VOID,
    pStatus: VOID,
    pMemName: VOID,
    pMemNum: VOID,
    pCallBack: VOID,
    pRedirectNetID: VOID,
    pRedirectUrl: VOID,
    pRedirectType: VOID,
    pTarget: VOID,
    pVERSION: VOID,

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
      tSeparatedURL = this.separateURL(tdata[Symbol.for("url")]);
      this.pServer = tSeparatedURL[Symbol.for("server")];
      this.pDestination = tSeparatedURL[Symbol.for("destination")];
      this.pPort = tSeparatedURL[Symbol.for("port")];
      if (voidp(this.pDestination)) {
        this.pDestination = "/";
      }
      if (!(this.pDestination.startsWith("/"))) {
        this.pDestination = "/" + this.pDestination;
      }
      if (voidp(this.pPort)) {
        this.pPort = 80;
      }
      this.pCRLF = numToChar(13) + numToChar(10);
      this.pVERSION = "0.1";
      this.pUserAgent = "HTTP-CLASS/" + this.pVERSION;
      this.pHttpVersion = "1.1";
      this.pMaxBytes = 16 * 1024;
      this.pData = propList();
      this.pNetDone = 0;
      if (this.pCookies === VOID) {
        this.pCookies = propList();
      }
      this.pRedirectNetID = VOID;
      return this.sendRequest();
    },

    separateURL(tURL) {
      tUrlParts = propList();
      tURL = _director.replaceChunks(tURL, "http://", EMPTY);
      tDestinationOffset = offset("/", tURL);
      tServerURL = chars(tURL, 1, tDestinationOffset - 1);
      tDestination = chars(tURL, tDestinationOffset, tURL.length);
      tPort = 80;
      tServer = tServerURL;
      if (tServerURL.includes(":")) {
        tPortOffset = offset(":", tServerURL);
        tServer = chars(tServerURL, 1, tPortOffset - 1);
        tPort = value(chars(tServerURL, tPortOffset + 1, tServerURL.length));
      }
      return propList().setaProp(Symbol.for("server"), tServer).setaProp(Symbol.for("destination"), tDestination).setaProp(Symbol.for("port"), tPort);
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
        case Symbol.for("url"):
          return this.pServer + this.pDestination;
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
    },

    update() {
      if (this.pNetDone) {
        if ((this.pStatus === Symbol.for("error")) || (this.pStatus === Symbol.for("LOADING"))) {
          this.pStatus = Symbol.for("complete");
          _director.getDownloadManager().removeActiveTask(this.pMemName, this.pCallBack);
          return 1;
        }
      }
      if (!voidp(this.pRedirectNetID)) {
        if (netDone(this.pRedirectNetID)) {
          if (!_director.memberExists(this.pMemName)) {
            _director.createMember(this.pMemName, Symbol.for("bitmap"));
          }
          _director.importFileInto(member(this.pMemName), this.pRedirectUrl, propList().setaProp(Symbol.for("dither"), 0).setaProp(Symbol.for("trimWhiteSpace"), 0));
          this.pNetDone = 1;
          this.pRedirectNetID = VOID;
        }
      }
      return 0;
    },

    sendRequest() {
      this.pNetResult = VOID;
      this.pNetDone = 0;
      this.pNetError = 0;
      this.pStatus = Symbol.for("LOADING");
      this.pMUXtra = _director.xtra("multiuser").new();
      this.pMUXtra.setNetBufferLimits(16 * 1024 * 2, this.pMaxBytes, 100);
      tErrCode = this.pMUXtra.setNetMessageHandler(Symbol.for("messageHandler"), this);
      if (tErrCode !== 0) {
        _director.error(this, "Error with setNetMessageHandler", Symbol.for("sendRequest"), Symbol.for("major"));
      }
      tErrCode = this.pMUXtra.connectToNetServer("*", "*", this.pServer, this.pPort, "HTTP_CLASS", 1);
      if (tErrCode !== 0) {
        _director.error(this, "Error sending ConnectToNetServer to server", Symbol.for("sendRequest"), Symbol.for("major"));
        this.pStatus = Symbol.for("error");
        this.pNetDone = 1;
        return 0;
      }
    },

    getStoredCookies(tDomain) {
      if (voidp(tDomain)) {
        tDomain = this.pServer;
      }
      tDelim = the.itemDelimiter;
      the.itemDelimiter = ".";
      tDomainItemCount = itemOf(tDomain).count;
      tDomain = itemOf(tDomain)[tDomainItemCount - 1] + itemOf(tDomain)[tDomainItemCount];
      the.itemDelimiter = tDelim;
      tCookiePrefLoc = _director.getVariable("httpcookie.pref.name");
      tAllCookies = value(getPref(tCookiePrefLoc));
      if (ilk(tAllCookies) !== Symbol.for("propList")) {
        tAllCookies = propList();
      }
      tThisDomainCookies = tAllCookies[tDomain];
      if (ilk(tThisDomainCookies) !== Symbol.for("propList")) {
        tThisDomainCookies = propList();
      }
      tFlatCookieList = list();
      for (const tUniqueCookie of tThisDomainCookies) {
        tFlatCookieList.add(tUniqueCookie);
      }
      return tFlatCookieList;
    },

    setStoredCookies(tDomain, tNewCookies) {
      if (voidp(tDomain) || voidp(tNewCookies)) {
        return 0;
      }
      tDelim = the.itemDelimiter;
      the.itemDelimiter = ".";
      tDomainItemCount = itemOf(tDomain).count;
      tDomain = itemOf(tDomain)[tDomainItemCount - 1] + itemOf(tDomain)[tDomainItemCount];
      the.itemDelimiter = tDelim;
      tCookiePrefLoc = _director.getVariable("httpcookie.pref.name");
      tAllCookies = value(getPref(tCookiePrefLoc));
      if (ilk(tAllCookies) !== Symbol.for("propList")) {
        tAllCookies = propList();
      }
      tThisDomainCookies = tAllCookies[tDomain];
      if (ilk(tThisDomainCookies) !== Symbol.for("propList")) {
        tThisDomainCookies = propList();
      }
      for (const tNewCookie of tNewCookies) {
        tNewCookieID = tNewCookie[1];
        tThisDomainCookies[tNewCookieID] = tNewCookie;
      }
      tAllCookies[tDomain] = tThisDomainCookies;
      setPref(tCookiePrefLoc, tAllCookies + EMPTY);
    },

    createNetRequest() {
      tCmd = EMPTY;
      tHeaders = list();
      tBody = EMPTY;
      tPort = ":" + this.pPort;
      if (tPort === ":80") {
        tPort = EMPTY;
      }
      tHeaders.add("Host: " + this.pServer + tPort);
      tHeaders.add("User-Agent: " + this.pUserAgent);
      tHeaders.add("Accept: text/*");
      tHeaders.add("Accept-Charset: ISO-8859-1");
      this.pCookies = this.getStoredCookies(this.pServer);
      tCookieString = EMPTY;
      for (const tCookie of this.pCookies) {
        if (this.pDestination.startsWith(tCookie["path"])) {
          if (tCookieString !== EMPTY) {
            tCookieString = tCookieString + "; ";
          }
          tCookieString = tCookieString + tCookie["name"] + "=" + tCookie["value"];
        }
      }
      if (tCookieString !== EMPTY) {
        tHeaders.add("Cookie: " + tCookieString);
      }
      tDestination = this.pDestination;
      if (this.pData.count) {
        tDestination = tDestination + "?" + this.getDataString(this.pData);
      }
      tMethod = "GET";
      tCmd = tMethod + " " + tDestination + " " + "HTTP/" + this.pHttpVersion;
      return propList().setaProp(Symbol.for("cmd"), tCmd).setaProp(Symbol.for("headers"), tHeaders).setaProp(Symbol.for("body"), tBody);
    },

    messageHandler() {
      tMsg = this.pMUXtra.getNetMessage();
      this.pNetError = tMsg.errorCode;
      tSenderId = tMsg.senderID;
      tSubject = tMsg.subject;
      tContent = tMsg.content;
      if (!(this.pNetError === 0)) {
        if ((tSenderId === "System") && (tSubject === "ConnectionProblem")) {
          _director.nothing();
        } else {
          tErrStr = this.pMUXtra.getNetErrorString(this.pNetError);
          this.pNetDone = 1;
          this.pStatus = Symbol.for("error");
          this.clearMU();
        }
        return 1;
      }
      if ((tSenderId === "System") && (tSubject === "ConnectToNetServer")) {
        this.handleHelloResponse(tMsg);
      } else {
        this.handleContentResponse(tMsg, tContent);
      }
    },

    handleHelloResponse(tMsg) {
      this.pNetRequest = this.createNetRequest();
      tHttpStr = this.pNetRequest["cmd"] + this.pCRLF;
      for (const tHeader of this.pNetRequest["headers"]) {
        tHttpStr = tHttpStr + tHeader + this.pCRLF;
      }
      tHttpStr = tHttpStr + this.pCRLF;
      tHttpStr = tHttpStr + this.pNetRequest["body"];
      this.pMUXtra.sendNetMessage("system", EMPTY, tHttpStr);
    },

    handleContentResponse(tMsg, tContent) {
      tFinished = 0;
      if (tContent.startsWith("HTTP/")) {
        this.pNetResult = this.parseResponse(tContent);
        tBody = this.pNetResult["body"];
        tNotChunkedResult = this.pNetResult["headers"]["Transfer-Encoding"] !== "chunked";
        tEndOfResult = chars(tBody, tBody.length - 4, tBody.length) === ("0" + this.pCRLF + this.pCRLF);
        if (tNotChunkedResult || tEndOfResult) {
          tFinished = 1;
        }
        this.pNetResult["body"] = tBody;
        tPos = this.pNetResult.headers.findPos("Set-Cookie");
        if (!voidp(tPos)) {
          while (1) {
            this.pCookies.add(this.parseCookieString(this.pNetResult.headers[tPos]));
            tPos = tPos + 1;
            if (tPos > this.pNetResult.headers.count) {
              break;
            }
            if (this.pNetResult.headers.getPropAt(tPos) !== "Set-Cookie") {
              break;
            }
          }
          this.setStoredCookies(this.pServer, this.pCookies);
        }
      } else {
        if (chars(tContent, tContent.length - 4, tContent.length) === ("0" + this.pCRLF + this.pCRLF)) {
          tContent = chars(tContent, 1, tContent.length - 7);
          tFinished = 1;
        }
        this.pNetResult["body"] = this.pNetResult["body"] + tContent;
      }
      if (tFinished) {
        if (this.pNetResult["headers"]["Transfer-Encoding"] === "chunked") {
          this.pNetResult["body"] = this.parseRawBody(this.pNetResult["body"]);
        }
        tRedirectUrl = this.pNetResult["headers"]["Location"];
        if (voidp(tRedirectUrl)) {
          tmember = member(this.pMemName);
          if (tmember.type !== Symbol.for("text")) {
            _director.error(this, "Incompatible download type. Maybe not redirected.", Symbol.for("handleContentResponse"), Symbol.for("minor"));
          } else {
            member(this.pMemName).text = this.pNetResult["body"];
            this.pNetDone = 1;
          }
        } else {
          tCompleteUrl = tRedirectUrl;
          if (!(tRedirectUrl.includes("http://"))) {
            if (!(tRedirectUrl.startsWith("/"))) {
              tRedirectUrl = "/" + tRedirectUrl;
            }
            tCompleteUrl = "http://" + this.pServer + tRedirectUrl;
          }
          if (this.pRedirectType === Symbol.for("follow")) {
            tOwnDomain = _director.getDomainPart(_director.getMoviePath());
            tDownloadDomain = _director.getDomainPart(tCompleteUrl);
            if ((tOwnDomain !== tDownloadDomain) && ((tCompleteUrl.includes("http://")) || (tCompleteUrl.includes("https://"))) && (!(tCompleteUrl.includes("://localhost")))) {
              tAllowCrossDomain = 0;
              if (_director.variableExists("client.allow.cross.domain")) {
                tAllowCrossDomain = _director.getVariable("client.allow.cross.domain");
              }
              tNotifyCrossDomain = 1;
              if (_director.variableExists("client.notify.cross.domain")) {
                tNotifyCrossDomain = value(_director.getVariable("client.notify.cross.domain"));
              }
              if (tNotifyCrossDomain) {
                _director.executeMessage("crossDomainDownload", tCompleteUrl);
              }
              if (!tAllowCrossDomain) {
                this.pNetDone = 1;
                return _director.error(this, "Cross domain download not allowed: " + tCompleteUrl, Symbol.for("handleContentResponse"), Symbol.for("minor"));
              }
            }
            if (this.pType === Symbol.for("bitmap")) {
              this.pRedirectUrl = tCompleteUrl;
              this.pRedirectNetID = _director.preloadNetThing(tCompleteUrl);
            } else {
              if (this.pType === Symbol.for("text")) {
                this.define(this.pMemName, propList().setaProp(Symbol.for("url"), tCompleteUrl).setaProp(Symbol.for("memNum"), this.pMemNum).setaProp(Symbol.for("type"), this.pType).setaProp(Symbol.for("callback"), this.pCallBack));
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
    },

    clearMU() {
      if (objectp(this.pMUXtra)) {
        tErrCode = this.pMUXtra.setNetMessageHandler(0, this);
        tErrCode = this.pMUXtra.setNetMessageHandler(0, this, "ConnectToNetServer");
      }
      this.pMUXtra = VOID;
    },

    parseResponse(tResponse) {
      tTemp = _director.explode(tResponse, this.pCRLF + this.pCRLF, 2);
      tResponseHeaders = tTemp[1];
      tResponseBody = tTemp[2];
      tResponseHeaderLines = _director.explode(tResponseHeaders, this.pCRLF);
      tHttpResponseLine = tResponseHeaderLines[1];
      tResponseCode = tHttpResponseLine;
      tResponseCodeNum = integer(wordOf(tResponseCode)[2]);
      tResponseHeaderArray = propList();
      for (let i = 2; i <= tResponseHeaderLines.count; i++) {
        tHeaderLine = tResponseHeaderLines[i];
        tTemp = _director.explode(tHeaderLine, ": ", 2);
        tHeader = tTemp[1];
        tValue = tTemp[2];
        tResponseHeaderArray.addProp(tHeader, tValue);
      }
      tResponseHeaderArray.sort();
      tReturnArr = propList();
      tReturnArr["status_code"] = tResponseCode;
      tReturnArr["status_num"] = tResponseCodeNum;
      tReturnArr["headers"] = tResponseHeaderArray;
      tReturnArr["body"] = tResponseBody;
      return tReturnArr;
    },

    parseRawBody(tRawbody) {
      tBody = EMPTY;
      while (1) {
        tTemp = _director.explode(tRawbody, this.pCRLF, 2);
        if (tTemp.count < 2) {
          tBody = tBody + tRawbody;
          break;
        }
        tLen = this.hex2dec(tTemp[1]);
        tRawbody = tTemp[2];
        tBody = tBody + chars(tRawbody, 1, tLen);
        delete char 1 to tLen + 2 of tRawbody;
      }
      return tBody;
    },

    parseCookieString(tStr) {
      tCookie = propList();
      tParts = _director.explode(tStr, "; ");
      tTemp = _director.explode(tParts[1], "=");
      tCookie["name"] = tTemp[1];
      tCookie["value"] = tTemp[2];
      for (let i = 2; i <= tParts.count; i++) {
        tTemp = _director.explode(tParts[i], "=");
        if (tTemp[1] === "path") {
          tCookie["path"] = tTemp[2];
        }
      }
      if (voidp(tCookie["path"])) {
        tCookie["path"] = "/";
      }
      return tCookie;
    },

    getDataString(tdata) {
      tDataStr = EMPTY;
      for (let i = 1; i <= tdata.count; i++) {
        tDataStr = tDataStr + _director.urlEncode(tdata.getPropAt(i)) + "=" + _director.urlEncode(tdata[i]);
        if (i < tdata.count) {
          tDataStr = tDataStr + "&";
        }
      }
      return tDataStr;
    },

    hex2dec(tHex) {
      tCol = rgb(tHex);
      return (tCol.red * 65536) + (tCol.green * 256) + tCol.blue;
    },
  };
}
