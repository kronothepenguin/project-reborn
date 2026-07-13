export default class {
  pCatchFlag;
  pSavedHook;
  pToolTipAct;
  pToolTipSpr;
  pToolTipMem;
  pToolTipID;
  pToolTipDel;
  pCurrCursor;
  pLastCursor;
  pUniqueSeed;
  pDecoder;
  pProcessList;

  construct() {
    this.pCatchFlag = 0;
    this.pSavedHook = 0;
    this.pToolTipAct = getIntVariable("tooltip.active", 0);
    this.pToolTipMem = VOID;
    this.pToolTipSpr = VOID;
    this.pCurrCursor = 0;
    this.pLastCursor = 0;
    this.pUniqueSeed = 0;
    this.pProcessList = list();
    if (_player != VOID) {
      if (_player.traceScript || _movie.traceScript) {
        return 0;
      }
    }
    _player.traceScript = 0;
    _movie.traceScript = 0;
    this.pDecoder = createObject(Symbol.for("temp"), list("tYy1rX5j7e4PLYJLER"));
    this.pDecoder.qe2AkKOGGKDTTnd1Nei("sulake1Unique2Key3Generator");
    return 1;
  }

  deconstruct() {
    if (!voidp(this.pToolTipSpr)) {
      releaseSprite(this.pToolTipSpr.spriteNum);
    }
    if (!voidp(this.pToolTipMem)) {
      removeMember(this.pToolTipMem.name);
    }
    this.pDecoder = VOID;
    return 1;
  }

  try() {
    this.pCatchFlag = 0;
    this.pSavedHook = the.alertHook;
    the.alertHook = this;
    return 1;
  }

  catch() {
    the.alertHook = this.pSavedHook;
    return this.pCatchFlag;
    return 0;
  }

  callJavaScriptFunction(tCallString, tdata) {
    if (the.runMode == "Author") {
      return 0;
    }
    script("JavaScript Proxy").callJavaScript(`${QUOTE}${tCallString}${QUOTE}`, `${QUOTE}${tdata}${QUOTE}`);
  }

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
      this.pToolTipMem.rect = rect(0, 0, length(tText.line[1]) * 8, 20);
      this.pToolTipMem.text = tText;
      this.pToolTipID = the.milliSeconds;
      return this.delay(this.pToolTipDel, Symbol.for("renderToolTip"), this.pToolTipID);
    }
  }

  removeToolTip(tNextID) {
    if (this.pToolTipAct) {
      if (voidp(tNextID) || (this.pToolTipID == tNextID)) {
        this.pToolTipID = VOID;
        this.pToolTipSpr.visible = 0;
        return 1;
      }
    }
  }

  renderToolTip(tNextID) {
    if (this.pToolTipAct) {
      if ((tNextID != this.pToolTipID) || voidp(this.pToolTipID)) {
        return 0;
      }
      this.pToolTipSpr.loc = the.mouseLoc + list(-2, 15);
      this.pToolTipSpr.visible = 1;
      this.delay(this.pToolTipDel * 2, Symbol.for("removeToolTip"), this.pToolTipID);
    }
  }

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
  }

  openNetPage(tURL_key, tTarget) {
    if (!stringp(tURL_key)) {
      return 0;
    }
    let tURL;
    if (textExists(tURL_key)) {
      tURL = getText(tURL_key, tURL_key);
    } else {
      tURL = tURL_key;
    }
    tURL = this.getPredefinedURL(tURL);
    let tResolvedTarget;
    let tTargetIsPArent = 0;
    if (voidp(tTarget)) {
      if (variableExists("default.url.open.target")) {
        tResolvedTarget = getVariable("default.url.open.target");
        tTargetIsPArent = 1;
      } else {
        tResolvedTarget = "_new";
      }
    } else {
      if ((tTarget == "self") || (tTarget == "_self")) {
        tResolvedTarget = VOID;
      } else {
        if ((tTarget == "_new") || (tTarget == "new")) {
          tResolvedTarget = "_new";
        } else {
          tResolvedTarget = tTarget;
        }
      }
    }
    let tURLStart = tURL;
    let tURLEnd = EMPTY;
    if (tURL.contains("#")) {
      tURLStart = chars(tURL, 1, offset("#", tURL) - 1);
      tURLEnd = chars(tURL, offset("#", tURL), tURL.length);
    }
    if (variableExists("client.http.request.sourceid") && tTargetIsPArent) {
      const tSourceParamTxt = `${getVariable("client.http.request.sourceid")}=1`;
      if (!(tURLStart.contains(tSourceParamTxt))) {
        if (tURLStart.contains("?")) {
          tURLStart = `${tURLStart}&${tSourceParamTxt}`;
        } else {
          tURLStart = `${tURLStart}?${tSourceParamTxt}`;
        }
      }
    }
    tURL = `${tURLStart}${tURLEnd}`;
    tURL = replaceChunks(tURL, "%random%", random(9999999999.0));
    gotoNetPage(tURL, tResolvedTarget);
    put(`Open page: ${tURL} target: ${tResolvedTarget}`);
    return 1;
  }

  showLoadingBar(tLoadID, tProps) {
    const tObj = createObject(Symbol.for("random"), getClassVariable("loading.bar.class"));
    if (tObj == 0) {
      return error(this, "Couldn't create loading bar instance!", Symbol.for("showLoadingBar"), Symbol.for("major"));
    }
    if (!tObj.define(tLoadID, tProps)) {
      removeObject(tObj.getID());
      return error(this, "Couldn't initialize loading bar instance!", Symbol.for("showLoadingBar"), Symbol.for("major"));
    }
    return tObj.getID();
  }

  getUniqueID() {
    this.pUniqueSeed = this.pUniqueSeed + 1;
    return `uid:${this.pUniqueSeed}:${the.milliSeconds}`;
  }

  getMachineID() {
    const tStoredMachineID = string(getPref(getVariable("pref.value.id")));
    let tMachineID;
    if (tStoredMachineID != EMPTY) {
      const tWhiteList = getVariable("machine.id.white.list");
      tMachineID = EMPTY;
      for (let tCharNo = 1; tCharNo <= tStoredMachineID.length; tCharNo++) {
        const tChar = chars(tStoredMachineID, tCharNo, tCharNo);
        if (tWhiteList.contains(tChar)) {
          tMachineID = `${tMachineID}${tChar}`;
        }
      }
      const tMaxLength = getVariable("machine.id.max.length");
      tMachineID = chars(tMachineID, 1, tMaxLength);
    } else {
      tMachineID = this.generateMachineId();
      setPref(getVariable("pref.value.id"), `\#${tMachineID}`);
    }
    return tMachineID;
  }

  getMoviePath() {
    const tVariableID = "system.v1";
    if (!variableExists(tVariableID)) {
      setVariable(tVariableID, obfuscate(the.moviePath));
    }
    return deobfuscate(getVariable(tVariableID));
  }

  getDomainPart(tPath) {
    if (voidp(tPath)) {
      return EMPTY;
    }
    if (chars(tPath, 1, 8) == "https://") {
      tPath = chars(tPath, 9, tPath.length);
    } else {
      if (chars(tPath, 1, 7) == "http://") {
        tPath = chars(tPath, 8, tPath.length);
      }
    }
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = "/";
    tPath = tPath.item[1];
    the.itemDelimiter = ".";
    let tMaxItemCount = 2;
    if (tPath.contains(".co.")) {
      tMaxItemCount = tMaxItemCount + 1;
    }
    tPath = tPath.item[`${tPath.item.count - tMaxItemCount + 1}..${tPath.item.count}`];
    the.itemDelimiter = ":";
    tPath = tPath.item[1];
    the.itemDelimiter = tDelim;
    return tPath;
  }

  getPredefinedURL(tURL) {
    if (tURL.contains("http://%predefined%/")) {
      if (variableExists("url.prefix")) {
        let tReplace = "http://%predefined%";
        const tPrefix = getVariable("url.prefix");
        if (chars(tPrefix, tPrefix.length, tPrefix.length) == "/") {
          tReplace = "http://%predefined%/";
        }
        tURL = replaceChunks(tURL, tReplace, tPrefix);
      } else {
        return error(this, "URL prefix not defined, invalid link.", Symbol.for("getPredefinedURL"), Symbol.for("minor"));
      }
    }
    return tURL;
  }

  getExtVarPath() {
    const tVariableID = "system.v2";
    if (!variableExists(tVariableID)) {
      return getVariableManager().GET("external.variables.txt");
    }
    return deobfuscate(getVariable(tVariableID));
  }

  sendProcessTracking(tStepValue) {
    this.pProcessList.add(tStepValue);
    if (the.runMode.contains("Author")) {
    }
    if (variableExists("processlog.url")) {
      const tReportURL = string(getVariable("processlog.url"));
      if (tReportURL == "javascript") {
        const tJsHandler = script("javascriptLog").newJavaScriptLog();
        if (objectp(tJsHandler)) {
          tJsHandler.call(tStepValue);
        }
      } else {
        if ((tReportURL != EMPTY) && (tReportURL != VOID)) {
          const tParams = propList("step", tStepValue, "account_id", getVariable("account_id"));
          postNetText(tReportURL, tParams);
        }
      }
    }
  }

  getProcessTrackingList() {
    return this.pProcessList;
  }

  secretDecode(tKey) {
    let tLength = tKey.length;
    if ((tLength % 2) == 1) {
      tLength = tLength - 1;
    }
    const tTable = tKey.char[`1..${tKey.length / 2}`];
    tKey = tKey.char[`${1 + (tKey.length / 2)}..${tLength}`];
    let tCheckSum = 0;
    for (let i = 1; i <= tKey.length; i++) {
      const c = tKey.char[i];
      let a = offset(c, tTable) - 1;
      if ((a % 2) == 0) {
        a = a * 2;
      }
      if (((i - 1) % 3) == 0) {
        a = a * 3;
      }
      if (a < 0) {
        a = tKey.length % 2;
      }
      tCheckSum = tCheckSum + a;
      tCheckSum = bitXor(tCheckSum, a * power(2, ((i - 1) % 3) * 8));
    }
    return tCheckSum;
  }

  readValueFromField(tField, tDelimiter, tSearchedKey) {
    const tStr = field(tField);
    const tDelim = the.itemDelimiter;
    if (voidp(tDelimiter)) {
      tDelimiter = RETURN;
    }
    the.itemDelimiter = tDelimiter;
    for (let i = 1; i <= tStr.item.count; i++) {
      const tPair = tStr.item[i];
      if ((tPair.word[1].char[1] != "#") && (tPair != EMPTY)) {
        the.itemDelimiter = "=";
        const tProp = tPair.item[1].word[`1..${tPair.item[1].word.count}`];
        let tValue = tPair.item[`2..${tPair.item.count}`];
        tValue = tValue.word[`1..${tValue.word.count}`];
        if (tProp == tSearchedKey) {
          if (!(tValue.contains(SPACE)) && integerp(integer(tValue))) {
            if (length(string(integer(tValue))) == length(tValue)) {
              tValue = integer(tValue);
            }
          } else {
            if (floatp(float(tValue))) {
              tValue = float(tValue);
            }
          }
          if (stringp(tValue)) {
            for (let j = 1; j <= length(tValue); j++) {
              switch (charToNum(tValue.char[j])) {
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
  }

  addRandomParamToURL(tURL) {
    const tRandomParamName = "randp";
    let tSeparator = "?";
    if (tURL.contains("?")) {
      tSeparator = "&";
    }
    tURL = `${tURL}${tSeparator}${tRandomParamName}${random(999)}=1`;
    return tURL;
  }

  checkForXtra(tXtraName) {
    const tList = the.xtraList;
    for (const tXtra of tList) {
      let tXtraListName = EMPTY;
      if (!voidp(tXtra[Symbol.for("name")])) {
        tXtraListName = tXtra[Symbol.for("name")];
      } else {
        if (!voidp(tXtra[Symbol.for("fileName")])) {
          tXtraListName = tXtra[Symbol.for("fileName")];
        }
      }
      if (tXtraListName != EMPTY) {
        if (tXtraListName.contains(tXtraName)) {
          return 1;
        }
      }
    }
    return 0;
  }

  print(tObj, tMsg) {
    tObj = string(tObj);
    tObj = tObj.word[`2..${tObj.word.count - 2}`];
    tObj = tObj.char[`2..${length(tObj)}`];
    put(`Print:${RETURN}${TAB} Object: ${tObj}${RETURN}${TAB} Message:${tMsg}`);
  }

  generateMachineId(tMaxLength) {
    const tWhiteList = string(getVariable("machine.id.white.list"));
    const tRawMachineId = `${string(the.milliSeconds)}${string(the.time)}${string(the.date)}`;
    let tMachineID = EMPTY;
    for (let tCharNo = 1; tCharNo <= tRawMachineId.length; tCharNo++) {
      const tChar = chars(tRawMachineId, tCharNo, tCharNo);
      if (tWhiteList.contains(tChar)) {
        tMachineID = `${tMachineID}${tChar}`;
      }
    }
    tMachineID = replaceChunks(tMachineID, "AM", EMPTY);
    tMachineID = replaceChunks(tMachineID, "PM", EMPTY);
    tMachineID = replaceChunks(tMachineID, "am", EMPTY);
    tMachineID = replaceChunks(tMachineID, "pm", EMPTY);
    tMaxLength = getVariable("machine.id.max.length");
    tMachineID = chars(tMachineID, 1, tMaxLength);
    return tMachineID;
  }

  generateMachineId_(tMaxLength) {
    let tMachineID = `${string(the.milliSeconds)}${string(the.time)}${string(the.date)}`;
    const tLocaleDelimiters = list(".", ",", ":", ";", "/", "\\", "am", "pm", " ", "-", "AM", "PM", numToChar(10), numToChar(13));
    for (const tDelimiter of tLocaleDelimiters) {
      tMachineID = replaceChunks(tMachineID, tDelimiter, EMPTY);
    }
    tMachineID = chars(tMachineID, 1, tMaxLength);
    return tMachineID;
  }

  setExtVarPath(tURL) {
    return setVariable("system.v2", obfuscate(tURL));
  }

  prepareToolTip() {
    if (this.pToolTipAct) {
      const tFontStruct = getStructVariable("struct.font.tooltip");
      this.pToolTipMem = member(createMember("ToolTip Text", Symbol.for("field")));
      this.pToolTipMem.boxType = Symbol.for("adjust");
      this.pToolTipMem.wordWrap = 0;
      this.pToolTipMem.rect = rect(0, 0, 10, 20);
      this.pToolTipMem.border = 1;
      this.pToolTipMem.margin = 4;
      this.pToolTipMem.alignment = "center";
      this.pToolTipMem.font = tFontStruct.getaProp(Symbol.for("font"));
      this.pToolTipMem.fontSize = tFontStruct.getaProp(Symbol.for("fontSize"));
      this.pToolTipMem.color = tFontStruct.getaProp(Symbol.for("color"));
      this.pToolTipSpr = sprite(reserveSprite(this.getID()));
      this.pToolTipSpr.member = this.pToolTipMem;
      this.pToolTipSpr.visible = 0;
      this.pToolTipSpr.locZ = 200000000;
      this.pToolTipID = VOID;
      this.pToolTipDel = getIntVariable("tooltip.delay", 2000);
    }
  }

  alertHook() {
    this.pCatchFlag = 1;
    the.alertHook = this.pSavedHook;
    return 1;
  }

  getReceipt(tStamp) {
    const tReceipt = list();
    for (let tCharNo = 1; tCharNo <= tStamp.length; tCharNo++) {
      let tChar = chars(tStamp, tCharNo, tCharNo);
      tChar = charToNum(tChar);
      tChar = (tChar * tCharNo) + 309203;
      tReceipt[tCharNo] = tChar;
    }
    return tReceipt;
  }

  getClientUpTime() {
    const tTimeNow = the.longTime;
    const tDateNow = the.date;
    const tTimeStart = getObject(Symbol.for("session")).GET("client_starttime");
    const tDateStart = getObject(Symbol.for("session")).GET("client_startdate");
    let tSeconds = 0;
    const tTimeDelimiter = this.getDelimiter(tTimeNow);
    if (tDateNow != tDateStart) {
      const tDays = 1;
      tSeconds = (tDays * 24 * 60 * 60) + this.calculateTimeDifference(tTimeStart, tTimeNow, tTimeDelimiter);
    } else {
      tSeconds = this.calculateTimeDifference(tTimeStart, tTimeNow, tTimeDelimiter);
    }
    return tSeconds;
  }

  calculateTimeDifference(a_from, a_to, a_delimiter) {
    const tItemDeLim = the.itemDelimiter;
    the.itemDelimiter = a_delimiter;
    const tHours = integer(a_to.item[1]) - integer(a_from.item[1]);
    const tMinutes = integer(a_to.item[2]) - integer(a_from.item[2]);
    const tSeconds = integer(a_to.item[3]) - integer(a_from.item[3]);
    let tAmPmMod = 0;
    if ((a_from.contains("am")) || (a_from.contains("pm"))) {
      if ((a_from.contains("am")) && (a_to.contains("pm"))) {
        tAmPmMod = 12 * 60 * 60;
      }
      if ((a_to.contains("am")) && (a_from.contains("pm"))) {
        tAmPmMod = 12 * 60 * 60;
      }
    }
    the.itemDelimiter = tItemDeLim;
    return (tHours * 60 * 60) + (tMinutes * 60) + tSeconds + tAmPmMod;
  }

  getDelimiter(a_string) {
    const tLocaleDelimiters = list(".", ",", ":", ";", "/", "\\", " ", "-", numToChar(10), numToChar(13));
    for (let i = 1; i <= tLocaleDelimiters.count; i++) {
      const tOffset = offset(tLocaleDelimiters[i], a_string);
      if ((tOffset > 0) && (tOffset < 5)) {
        const temp = tLocaleDelimiters.duplicate()[i];
        return temp;
      }
    }
    return ":";
  }
}
