import {
  VOID,
  QUOTE,
  chars,
  charOf,
  charToNum,
  field,
  getPref,
  getVariable,
  gotoNetPage,
  integer,
  itemOf,
  length,
  lineOf,
  list,
  numToChar,
  objectp,
  offset,
  put,
  random,
  rect,
  RETURN,
  script,
  setPref,
  SPACE,
  sprite,
  string,
  stringp,
  TAB,
  voidp,
  wordOf,
} from "../../director";

export default function () {
  let tObj, tLoadID, tProps, tURL_key, tTarget, tURL, tResolvedTarget, tTargetIsPArent, tURLStart, tURLEnd, tSourceParamTxt, tStepValue, tKey, tLength, tTable, tCheckSum, c, a, i, tField, tDelimiter, tSearchedKey, tStr, tDelim, tPair, tProp, tValue, j, tRandomParamName, tSeparator, tXtraName, tList, tXtra, tXtraListName, tMsg, tMaxLength, tWhiteList, tRawMachineId, tMachineID, tCharNo, tChar, tLocaleDelimiters, tStamp, tReceipt, tTimeNow, tDateNow, tTimeStart, tDateStart, tSeconds, tTimeDelimiter, tDays, a_from, a_to, a_delimiter, tItemDeLim, tHours, tMinutes, tAmPmMod, a_string, tOffset, temp, tFontStruct, tCallString, tdata, tText, tNextID, ttype, tPath, tReplace, tPrefix, tJsHandler, tParams, tStoredMachineID;

  return {
    pCatchFlag: VOID,
    pSavedHook: VOID,
    pToolTipAct: VOID,
    pToolTipSpr: VOID,
    pToolTipMem: VOID,
    pToolTipID: VOID,
    pToolTipDel: VOID,
    pCurrCursor: VOID,
    pLastCursor: VOID,
    pUniqueSeed: VOID,
    pDecoder: VOID,
    pProcessList: VOID,

    construct() {
      this.pCatchFlag = 0;
      this.pSavedHook = 0;
      this.pToolTipAct = _director.getIntVariable("tooltip.active", 0);
      this.pToolTipMem = VOID;
      this.pToolTipSpr = VOID;
      this.pCurrCursor = 0;
      this.pLastCursor = 0;
      this.pUniqueSeed = 0;
      this.pProcessList = list();
      if (_player !== VOID) {
        if (_player.traceScript || _movie.traceScript) {
          return 0;
        }
      }
      _player.traceScript = 0;
      _movie.traceScript = 0;
      this.pDecoder = script("temp").new(["tYy1rX5j7e4PLYJLER"]);
      this.pDecoder.qe2AkKOGGKDTTnd1Nei("sulake1Unique2Key3Generator");
      return 1;
    },

    deconstruct() {
      if (!voidp(this.pToolTipSpr)) {
        _director.releaseSprite(this.pToolTipSpr.spriteNum);
      }
      if (!voidp(this.pToolTipMem)) {
        _director.removeMember(this.pToolTipMem.name);
      }
      this.pDecoder = VOID;
      return 1;
    },

    tryFn() {
      this.pCatchFlag = 0;
      this.pSavedHook = the.alertHook;
      the.alertHook = this;
      return 1;
    },

    catchFn() {
      the.alertHook = this.pSavedHook;
      return this.pCatchFlag;
      return 0;
    },

    callJavaScriptFunction(tCallString, tdata) {
      if (the.runMode === "Author") {
        return 0;
      }
      script("JavaScript Proxy").callJavaScript(QUOTE + tCallString + QUOTE, QUOTE + tdata + QUOTE);
    },

    createToolTip(tText) {
      if (this.pToolTipAct) {
        if (voidp(this.pToolTipMem)) {
          this.prepareToolTip();
        }
        if (voidp(this.pToolTipSpr)) {
          this.prepareToolTip();
        }
        if (voidp(tText)) {
          tText = "...";
        }
        this.pToolTipSpr.visible = 0;
        this.pToolTipMem.rect = rect(0, 0, length(lineOf(tText)[1]) * 8, 20);
        this.pToolTipMem.text = tText;
        this.pToolTipID = the.milliSeconds;
        return this.delay(this.pToolTipDel, Symbol.for("renderToolTip"), this.pToolTipID);
      }
    },

    removeToolTip(tNextID) {
      if (this.pToolTipAct) {
        if (voidp(tNextID) || (this.pToolTipID === tNextID)) {
          this.pToolTipID = VOID;
          this.pToolTipSpr.visible = 0;
          return 1;
        }
      }
    },

    renderToolTip(tNextID) {
      if (this.pToolTipAct) {
        if ((tNextID !== this.pToolTipID) || voidp(this.pToolTipID)) {
          return 0;
        }
        this.pToolTipSpr.loc = the.mouseLoc + point(-2, 15);
        this.pToolTipSpr.visible = 1;
        this.delay(this.pToolTipDel * 2, Symbol.for("removeToolTip"), this.pToolTipID);
      }
    },

    setcursor(ttype) {
      switch (ttype) {
        case VOID:
          ttype = 0;
          break;
        case Symbol.for("arrow"):
          ttype = 0;
          break;
        case Symbol.for("ibeam"):
          ttype = 1;
          break;
        case Symbol.for("crosshair"):
          ttype = 2;
          break;
        case Symbol.for("crossbar"):
          ttype = 3;
          break;
        case Symbol.for("timer"):
          ttype = 4;
          break;
        case Symbol.for("previous"):
          ttype = this.pLastCursor;
          break;
      }
      cursor(ttype);
      this.pLastCursor = this.pCurrCursor;
      this.pCurrCursor = ttype;
      return 1;
    },

    openNetPage(tURL_key, tTarget) {
      if (!stringp(tURL_key)) {
        return 0;
      }
      if (_director.textExists(tURL_key)) {
        tURL = _director.getText(tURL_key, tURL_key);
      } else {
        tURL = tURL_key;
      }
      tURL = this.getPredefinedURL(tURL);
      tResolvedTarget = VOID;
      tTargetIsPArent = 0;
      if (voidp(tTarget)) {
        if (_director.variableExists("default.url.open.target")) {
          tResolvedTarget = _director.getVariable("default.url.open.target");
          tTargetIsPArent = 1;
        } else {
          tResolvedTarget = "_new";
        }
      } else {
        if ((tTarget === "self") || (tTarget === "_self")) {
          tResolvedTarget = VOID;
        } else {
          if ((tTarget === "_new") || (tTarget === "new")) {
            tResolvedTarget = "_new";
          } else {
            tResolvedTarget = tTarget;
          }
        }
      }
      tURLStart = tURL;
      tURLEnd = "";
      if (tURL.includes("#")) {
        tURLStart = chars(tURL, 1, offset("#", tURL) - 1);
        tURLEnd = chars(tURL, offset("#", tURL), tURL.length);
      }
      if (_director.variableExists("client.http.request.sourceid") && tTargetIsPArent) {
        tSourceParamTxt = _director.getVariable("client.http.request.sourceid") + "=1";
        if (!tURLStart.includes(tSourceParamTxt)) {
          if (tURLStart.includes("?")) {
            tURLStart = tURLStart + "&" + tSourceParamTxt;
          } else {
            tURLStart = tURLStart + "?" + tSourceParamTxt;
          }
        }
      }
      tURL = tURLStart + tURLEnd;
      tURL = _director.replaceChunks(tURL, "%random%", random(9999999999.0));
      gotoNetPage(tURL, tResolvedTarget);
      put("Open page:" + " " + tURL + " " + "target:" + " " + tResolvedTarget);
      return 1;
    },

    showLoadingBar(tLoadID, tProps) {
      tObj = script(_director.getClassVariable("loading.bar.class")).new();
      if (tObj === 0) {
        return _director.error(this, "Couldn't create loading bar instance!", Symbol.for("showLoadingBar"), Symbol.for("major"));
      }
      if (!tObj.define(tLoadID, tProps)) {
        _director.removeObject(tObj.getID());
        return _director.error(this, "Couldn't initialize loading bar instance!", Symbol.for("showLoadingBar"), Symbol.for("major"));
      }
      return tObj.getID();
    },

    getUniqueID() {
      this.pUniqueSeed = this.pUniqueSeed + 1;
      return "uid:" + this.pUniqueSeed + ":" + the.milliSeconds;
    },

    getMachineID() {
      tStoredMachineID = string(getPref(_director.getVariable("pref.value.id")));
      if (tStoredMachineID !== "") {
        tWhiteList = _director.getVariable("machine.id.white.list");
        tMachineID = "";
        for (let tCharNo = 1; tCharNo <= tStoredMachineID.length; tCharNo++) {
          tChar = chars(tStoredMachineID, tCharNo, tCharNo);
          if (tWhiteList.includes(tChar)) {
            tMachineID = tMachineID + tChar;
          }
        }
        tMaxLength = _director.getVariable("machine.id.max.length");
        tMachineID = chars(tMachineID, 1, tMaxLength);
      } else {
        tMachineID = this.generateMachineId();
        setPref(_director.getVariable("pref.value.id"), "#" + tMachineID);
      }
      return tMachineID;
    },

    getMoviePath() {
      let tVariableID = "system.v1";
      if (!_director.variableExists(tVariableID)) {
        _director.setVariable(tVariableID, _director.obfuscate(the.moviePath));
      }
      return _director.deobfuscate(_director.getVariable(tVariableID));
    },

    getDomainPart(tPath) {
      if (voidp(tPath)) {
        return "";
      }
      if (chars(tPath, 1, 8) === "https://") {
        tPath = chars(tPath, 9, tPath.length);
      } else {
        if (chars(tPath, 1, 7) === "http://") {
          tPath = chars(tPath, 8, tPath.length);
        }
      }
      let tDelim = the.itemDelimiter;
      the.itemDelimiter = "/";
      tPath = itemOf(tPath)[1];
      the.itemDelimiter = ".";
      let tMaxItemCount = 2;
      if (tPath.includes(".co.")) {
        tMaxItemCount = tMaxItemCount + 1;
      }
      tPath = itemOf(tPath).slice(itemOf(tPath).count - tMaxItemCount + 1, itemOf(tPath).count);
      the.itemDelimiter = ":";
      tPath = itemOf(tPath)[1];
      the.itemDelimiter = tDelim;
      return tPath;
    },

    getPredefinedURL(tURL) {
      if (tURL.includes("http://%predefined%/")) {
        if (_director.variableExists("url.prefix")) {
          tReplace = "http://%predefined%";
          tPrefix = _director.getVariable("url.prefix");
          if (chars(tPrefix, tPrefix.length, tPrefix.length) === "/") {
            tReplace = "http://%predefined%/";
          }
          tURL = _director.replaceChunks(tURL, tReplace, tPrefix);
        } else {
          return _director.error(this, "URL prefix not defined, invalid link.", Symbol.for("getPredefinedURL"), Symbol.for("minor"));
        }
      }
      return tURL;
    },

    getExtVarPath() {
      let tVariableID = "system.v2";
      if (!_director.variableExists(tVariableID)) {
        return _director.getVariableManager().GET("external.variables.txt");
      }
      return _director.deobfuscate(_director.getVariable(tVariableID));
    },

    sendProcessTracking(tStepValue) {
      this.pProcessList.add(tStepValue);
      if (the.runMode.includes("Author")) {
      }
      if (_director.variableExists("processlog.url")) {
        let tReportURL = string(_director.getVariable("processlog.url"));
        if (tReportURL === "javascript") {
          tJsHandler = script("javascriptLog").newJavaScriptLog();
          if (objectp(tJsHandler)) {
            tJsHandler.call(tStepValue);
          }
        } else {
          if ((tReportURL !== "") && (tReportURL !== VOID)) {
            tParams = { step: tStepValue, account_id: _director.getVariable("account_id") };
            _director.postNetText(tReportURL, tParams);
          }
        }
      }
    },

    getProcessTrackingList() {
      return this.pProcessList;
    },

    secretDecode(tKey) {
      tLength = tKey.length;
      if ((tLength % 2) === 1) {
        tLength = tLength - 1;
      }
      tTable = charOf(tKey).slice(1, tKey.length / 2);
      tKey = charOf(tKey).slice(1 + (tKey.length / 2), tLength);
      tCheckSum = 0;
      for (let i = 1; i <= tKey.length; i++) {
        c = charOf(tKey)[i];
        a = offset(c, tTable) - 1;
        if ((a % 2) === 0) {
          a = a * 2;
        }
        if (((i - 1) % 3) === 0) {
          a = a * 3;
        }
        if (a < 0) {
          a = tKey.length % 2;
        }
        tCheckSum = tCheckSum + a;
        tCheckSum = _director.bitXor(tCheckSum, a * Math.pow(2, (i - 1) % 3 * 8));
      }
      return tCheckSum;
    },

    readValueFromField(tField, tDelimiter, tSearchedKey) {
      tStr = field(tField);
      tDelim = the.itemDelimiter;
      if (voidp(tDelimiter)) {
        tDelimiter = RETURN;
      }
      the.itemDelimiter = tDelimiter;
      for (let i = 1; i <= itemOf(tStr).count; i++) {
        tPair = itemOf(tStr)[i];
        if ((charOf(wordOf(tPair)[1])[1] !== "#") && (tPair !== "")) {
          the.itemDelimiter = "=";
          const tKeyItem = itemOf(tPair)[1];
          tProp = wordOf(tKeyItem).slice(1, wordOf(tKeyItem).count);
          tValue = itemOf(tPair).slice(2, itemOf(tPair).count);
          tValue = wordOf(tValue).slice(1, wordOf(tValue).count);
          if (tProp === tSearchedKey) {
            if (!tValue.includes(" ") && integerp(integer(tValue))) {
              if (length(string(integer(tValue))) === length(tValue)) {
                tValue = integer(tValue);
              }
            } else {
              if (_director.floatp(parseFloat(tValue))) {
                tValue = parseFloat(tValue);
              }
            }
            if (stringp(tValue)) {
              for (let j = 1; j <= length(tValue); j++) {
                switch (charToNum(charOf(tValue)[j])) {
                }
              }
            }
            the.itemDelimiter = tDelim;
            return tValue;
          }
        }
        the.itemDelimiter = tDelimiter;
      }
      the.itemDelimiter = tDelim;
      return 0;
    },

    addRandomParamToURL(tURL) {
      tRandomParamName = "randp";
      tSeparator = "?";
      if (tURL.includes("?")) {
        tSeparator = "&";
      }
      tURL = tURL + tSeparator + tRandomParamName + random(999) + "=1";
      return tURL;
    },

    checkForXtra(tXtraName) {
      tList = the.xtraList;
      for (const tXtra of tList) {
        tXtraListName = "";
        if (!voidp(tXtra[Symbol.for("name")])) {
          tXtraListName = tXtra[Symbol.for("name")];
        } else {
          if (!voidp(tXtra[Symbol.for("fileName")])) {
            tXtraListName = tXtra[Symbol.for("fileName")];
          }
        }
        if (tXtraListName !== "") {
          if (tXtraListName.includes(tXtraName)) {
            return 1;
          }
        }
      }
      return 0;
    },

    print(tObj, tMsg) {
      tObj = string(tObj);
      tObj = wordOf(tObj).slice(2, wordOf(tObj).count - 2);
      tObj = charOf(tObj).slice(2, length(tObj));
      put("Print:" + RETURN + TAB + " " + "Object: " + " " + tObj + RETURN + TAB + " " + "Message:" + " " + tMsg);
    },

    generateMachineId(tMaxLength) {
      tWhiteList = string(_director.getVariable("machine.id.white.list"));
      tRawMachineId = string(the.milliSeconds) + string(the.time) + string(the.date);
      tMachineID = "";
      for (let tCharNo = 1; tCharNo <= tRawMachineId.length; tCharNo++) {
        tChar = chars(tRawMachineId, tCharNo, tCharNo);
        if (tWhiteList.includes(tChar)) {
          tMachineID = tMachineID + tChar;
        }
      }
      tMachineID = _director.replaceChunks(tMachineID, "AM", "");
      tMachineID = _director.replaceChunks(tMachineID, "PM", "");
      tMachineID = _director.replaceChunks(tMachineID, "am", "");
      tMachineID = _director.replaceChunks(tMachineID, "pm", "");
      tMaxLength = _director.getVariable("machine.id.max.length");
      tMachineID = chars(tMachineID, 1, tMaxLength);
      return tMachineID;
    },

    generateMachineId_(tMaxLength) {
      tMachineID = string(the.milliSeconds) + string(the.time) + string(the.date);
      tLocaleDelimiters = list(".", ",", ":", ";", "/", "\\", "am", "pm", " ", "-", "AM", "PM", numToChar(10), numToChar(13));
      for (const tDelimiter of tLocaleDelimiters) {
        tMachineID = _director.replaceChunks(tMachineID, tDelimiter, "");
      }
      tMachineID = chars(tMachineID, 1, tMaxLength);
      return tMachineID;
    },

    setExtVarPath(tURL) {
      return _director.setVariable("system.v2", _director.obfuscate(tURL));
    },

    prepareToolTip() {
      if (this.pToolTipAct) {
        tFontStruct = _director.getStructVariable("struct.font.tooltip");
        this.pToolTipMem = member(_director.createMember("ToolTip Text", Symbol.for("field")));
        this.pToolTipMem.boxType = Symbol.for("adjust");
        this.pToolTipMem.wordWrap = 0;
        this.pToolTipMem.rect = rect(0, 0, 10, 20);
        this.pToolTipMem.border = 1;
        this.pToolTipMem.margin = 4;
        this.pToolTipMem.alignment = "center";
        this.pToolTipMem.font = tFontStruct.getaProp(Symbol.for("font"));
        this.pToolTipMem.fontSize = tFontStruct.getaProp(Symbol.for("fontSize"));
        this.pToolTipMem.color = tFontStruct.getaProp(Symbol.for("color"));
        this.pToolTipSpr = sprite(_director.reserveSprite(this.getID()));
        this.pToolTipSpr.member = this.pToolTipMem;
        this.pToolTipSpr.visible = 0;
        this.pToolTipSpr.locZ = 200000000;
        this.pToolTipID = VOID;
        this.pToolTipDel = _director.getIntVariable("tooltip.delay", 2000);
      }
    },

    alertHook() {
      this.pCatchFlag = 1;
      the.alertHook = this.pSavedHook;
      return 1;
    },

    getReceipt(tStamp) {
      tReceipt = list();
      for (let tCharNo = 1; tCharNo <= tStamp.length; tCharNo++) {
        tChar = chars(tStamp, tCharNo, tCharNo);
        tChar = charToNum(tChar);
        tChar = (tChar * tCharNo) + 309203;
        tReceipt[tCharNo] = tChar;
      }
      return tReceipt;
    },

    getClientUpTime() {
      tTimeNow = the.longTime;
      tDateNow = the.date;
      tTimeStart = _director.getObject(Symbol.for("session")).GET("client_starttime");
      tDateStart = _director.getObject(Symbol.for("session")).GET("client_startdate");
      tSeconds = 0;
      tTimeDelimiter = this.getDelimiter(tTimeNow);
      if (tDateNow !== tDateStart) {
        tDays = 1;
        tSeconds = (tDays * 24 * 60 * 60) + this.calculateTimeDifference(tTimeStart, tTimeNow, tTimeDelimiter);
      } else {
        tSeconds = this.calculateTimeDifference(tTimeStart, tTimeNow, tTimeDelimiter);
      }
      return tSeconds;
    },

    calculateTimeDifference(a_from, a_to, a_delimiter) {
      tItemDeLim = the.itemDelimiter;
      the.itemDelimiter = a_delimiter;
      tHours = integer(itemOf(a_to)[1]) - integer(itemOf(a_from)[1]);
      tMinutes = integer(itemOf(a_to)[2]) - integer(itemOf(a_from)[2]);
      tSeconds = integer(itemOf(a_to)[3]) - integer(itemOf(a_from)[3]);
      tAmPmMod = 0;
      if (a_from.includes("am") || a_from.includes("pm")) {
        if (a_from.includes("am") && a_to.includes("pm")) {
          tAmPmMod = 12 * 60 * 60;
        }
        if (a_to.includes("am") && a_from.includes("pm")) {
          tAmPmMod = 12 * 60 * 60;
        }
      }
      the.itemDelimiter = tItemDeLim;
      return (tHours * 60 * 60) + (tMinutes * 60) + tSeconds + tAmPmMod;
    },

    getDelimiter(a_string) {
      tLocaleDelimiters = list(".", ",", ":", ";", "/", "\\", " ", "-", numToChar(10), numToChar(13));
      for (let i = 1; i <= tLocaleDelimiters.count; i++) {
        tOffset = offset(tLocaleDelimiters[i], a_string);
        if ((tOffset > 0) && (tOffset < 5)) {
          temp = tLocaleDelimiters.duplicate()[i];
          return temp;
        }
      }
      return ":";
    },
  };
}
