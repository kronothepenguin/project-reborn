export default class {
  pState;
  pLogoSpr;
  pFadingLogo;
  pLogoStartTime;
  pCrapFixing;
  pCrapFixSpr;
  pCrapFixRegionInvalidated;
  pFullScreenRefreshSpr;
  i;

  construct() {
    const tSession = createObject(Symbol.for("session"), getClassVariable("variable.manager.class"));
    tSession.set("client_startdate", the.date);
    tSession.set("client_starttime", the.longTime);
    tSession.set("client_version", getVariable("system.version"));
    tSession.set("client_url", getMoviePath());
    tSession.set("client_lastclick", EMPTY);
    createObject(Symbol.for("headers"), getClassVariable("variable.manager.class"));
    createObject(Symbol.for("classes"), getClassVariable("variable.manager.class"));
    createObject(Symbol.for("cache"), getClassVariable("variable.manager.class"));
    createBroker(Symbol.for("Initialize"));
    registerMessage(Symbol.for("requestHotelView"), this.getID(), Symbol.for("initTransferToHotelView"));
    registerMessage(Symbol.for("invalidateCrapFixRegion"), this.getID(), Symbol.for("invalidateCrapFixer"));
    this.pFadingLogo = 0;
    this.pLogoStartTime = 0;
    this.pCrapFixSpr = sprite(reserveSprite());
    if (ilk(this.pCrapFixSpr) == Symbol.for("sprite")) {
      this.pCrapFixSpr.member = member("crap.fixer");
      this.pCrapFixSpr.width = 560;
      this.pCrapFixSpr.height = 75;
      this.pCrapFixSpr.locZ = -2000000000;
      this.pCrapFixSpr.loc = point(-1, 0);
      this.pCrapFixSpr.visible = 0;
    }
    this.pCrapFixing = 0;
    this.pCrapFixRegionInvalidated = 1;
    this.pFullScreenRefreshSpr = sprite(reserveSprite());
    if (ilk(this.pFullScreenRefreshSpr) == Symbol.for("sprite")) {
      this.pFullScreenRefreshSpr.member = member("crap.fixer");
      this.pFullScreenRefreshSpr.width = the.stage.image.width + 1;
      this.pFullScreenRefreshSpr.height = the.stage.image.height;
      this.pFullScreenRefreshSpr.locZ = -2000000000;
      this.pFullScreenRefreshSpr.loc = point(-1, 0);
      this.pFullScreenRefreshSpr.visible = 0;
    }
    return this.updateState("load_variables");
  }

  deconstruct() {
    if (timeoutExists("client.refresh.timeout")) {
      removeTimeout("client.refresh.timeout");
    }
    unregisterMessage(Symbol.for("invalidateCrapFixRegion"), this.getID());
    releaseSprite(this.pCrapFixSpr.spriteNum);
    return this.hideLogo();
  }

  showLogo() {
    if (memberExists("Logo")) {
      const tmember = member(getmemnum("Logo"));
      this.pLogoSpr = sprite(reserveSprite(this.getID()));
      this.pLogoSpr.member = tmember;
      this.pLogoSpr.ink = 0;
      this.pLogoSpr.blend = 90;
      this.pLogoSpr.locZ = -20000001;
      this.pLogoSpr.loc = point((the.stage.rect.width / 2), ((the.stage.rect.height / 2) - tmember.height));
      this.pLogoStartTime = the.milliSeconds;
    }
    return 1;
  }

  hideLogo() {
    if (this.pLogoSpr.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pLogoSpr.spriteNum);
      this.pLogoSpr = VOID;
    }
    return 1;
  }

  initTransferToHotelView() {
    const tShowLogoForMs = 1000;
    const tLogoNowShownMs = the.milliSeconds - this.pLogoStartTime;
    if (tLogoNowShownMs >= tShowLogoForMs) {
      createTimeout("logo_timeout", 2000, Symbol.for("initUpdate"), this.getID(), VOID, 1);
    } else {
      createTimeout("init_timeout", tShowLogoForMs - tLogoNowShownMs + 1, Symbol.for("initTransferToHotelView"), this.getID(), VOID, 1);
    }
  }

  initUpdate() {
    this.pFadingLogo = 1;
    receiveUpdate(this.getID());
  }

  invalidateCrapFixer() {
    this.pCrapFixRegionInvalidated = 1;
  }

  update() {
    if (this.pFadingLogo) {
      let tBlend = 0;
      if (this.pLogoSpr != VOID) {
        this.pLogoSpr.blend = this.pLogoSpr.blend - 10;
        tBlend = this.pLogoSpr.blend;
      }
      if (tBlend <= 0) {
        if (!this.pCrapFixing) {
          removeUpdate(this.getID());
        }
        this.pFadingLogo = 0;
        this.hideLogo();
        executeMessage(Symbol.for("showHotelView"));
        callJavaScriptFunction("clientReady");
      }
    }
    if (this.pCrapFixing) {
      if (ilk(this.pCrapFixSpr) == Symbol.for("sprite")) {
        if (this.pCrapFixRegionInvalidated) {
          this.pCrapFixSpr.visible = 1;
          switch (this.pCrapFixSpr.loc.locH) {
            case 0:
              this.pCrapFixSpr.loc = point(-1, 0);
              break;
            case (-1):
              this.pCrapFixSpr.loc = point(0, 0);
              break;
            default:
              this.pCrapFixSpr.loc = point(0, 0);
              break;
          }
          this.pCrapFixRegionInvalidated = 0;
        }
      }
    }
  }

  assetDownloadCallbacks(tAssetId, tSuccess) {
    if (tSuccess == 0) {
      switch (tAssetId) {
        case "load_variables":
        case "load_texts":
        case "load_casts":
          fatalError(propList("error", tAssetId));
          break;
      }
      return 0;
    }
    switch (tAssetId) {
      case "load_variables":
        this.updateState("load_params");
        break;
      case "load_texts":
        this.updateState("load_casts");
        break;
      case "load_casts":
        this.updateState("validate_resources");
        break;
      case "validate_resources":
        this.updateState("validate_resources");
        break;
    }
  }

  updateState(tstate) {
    switch (tstate) {
      case "load_variables":
        this.pState = tstate;
        this.showLogo();
        cursor(4);
        if (the.runMode.contains("Plugin")) {
          const tDelim = the.itemDelimiter;
          for (let i = 1; i <= 9; i++) {
            const tParamBundle = externalParamValue(`sw${i}`);
            if (!voidp(tParamBundle)) {
              the.itemDelimiter = ";";
              for (let j = 1; j <= tParamBundle.item.count; j++) {
                const tParam = tParamBundle.item[j];
                the.itemDelimiter = "=";
                if (tParam.item.count > 1) {
                  const tKey = tParam.item[1];
                  const tValue = tParam.item[`2..${tParam.item.count}`];
                  if (tKey == "client.fatal.error.url") {
                    getVariableManager().set(tKey, tValue);
                  } else {
                    if (tKey == "client.allow.cross.domain") {
                      getVariableManager().set(tKey, tValue);
                    } else {
                      if (tKey == "client.notify.cross.domain") {
                        getVariableManager().set(tKey, tValue);
                      } else {
                        if (tKey == "external.variables.txt") {
                          getSpecialServices().setExtVarPath(tValue);
                        } else {
                          if (tKey == "processlog.url") {
                            getVariableManager().set(tKey, tValue);
                          } else {
                            if (tKey == "account_id") {
                              getVariableManager().set(tKey, tValue);
                            }
                          }
                        }
                      }
                    }
                  }
                }
                the.itemDelimiter = ";";
              }
            }
          }
          the.itemDelimiter = tDelim;
        }
        const tURL = getExtVarPath();
        const tMemName = tURL;
        const tMemNum = queueDownload(tURL, tMemName, Symbol.for("field"), 1);
        sendProcessTracking(9);
        if (tMemNum == 0) {
          fatalError(propList("error", tstate));
          return 0;
        } else {
          return registerDownloadCallback(tMemNum, Symbol.for("assetDownloadCallbacks"), this.getID(), tstate);
        }
      case "load_params":
        this.pState = tstate;
        dumpVariableField(getExtVarPath());
        removeMember(getExtVarPath());
        if (variableExists("text.crap.fixing")) {
          this.pCrapFixing = getVariableValue("text.crap.fixing");
        }
        if (variableExists("client.full.refresh.period")) {
          createTimeout("client.refresh.timeout", getIntVariable("client.full.refresh.period"), Symbol.for("fullScreenRefresh"), this.getID(), VOID, 0);
        }
        if (the.runMode.contains("Plugin")) {
          const tDelim = the.itemDelimiter;
          for (let i = 1; i <= 9; i++) {
            const tParamBundle = externalParamValue(`sw${i}`);
            if (!voidp(tParamBundle)) {
              the.itemDelimiter = ";";
              for (let j = 1; j <= tParamBundle.item.count; j++) {
                const tParam = tParamBundle.item[j];
                the.itemDelimiter = "=";
                if (tParam.item.count > 1) {
                  getVariableManager().set(tParam.item[1], tParam.item[`2..${tParam.item.count}`]);
                }
                the.itemDelimiter = ";";
              }
            }
          }
          the.itemDelimiter = tDelim;
        }
        setDebugLevel(0);
        getStringServices().initConvList();
        puppetTempo(getIntVariable("system.tempo", 30));
        if (variableExists("client.reload.url")) {
          getObject(Symbol.for("session")).set("client_url", obfuscate(getVariable("client.reload.url")));
        }
        return this.updateState("load_texts");
      case "load_texts":
        this.pState = tstate;
        const tURL = getVariable("external.texts.txt");
        const tMemName = tURL;
        if (tMemName == EMPTY) {
          return this.updateState("load_casts");
        }
        const tMemNum = queueDownload(tURL, tMemName, Symbol.for("field"));
        sendProcessTracking(12);
        if (tMemNum == 0) {
          fatalError(propList("error", tstate));
          return 0;
        } else {
          return registerDownloadCallback(tMemNum, Symbol.for("assetDownloadCallbacks"), this.getID(), tstate);
        }
      case "load_casts":
        this.pState = tstate;
        const tTxtFile = getVariable("external.texts.txt");
        if (tTxtFile != 0) {
          if (memberExists(tTxtFile)) {
            dumpTextField(tTxtFile);
            removeMember(tTxtFile);
          }
        }
        sendProcessTracking(23);
        const tCastList = list();
        let i = 1;
        while (1) {
          if (!variableExists(`cast.entry.${i}`)) {
            break;
          }
          const tFileName = getVariable(`cast.entry.${i}`);
          tCastList.add(tFileName);
          i = i + 1;
        }
        if (count(tCastList) > 0) {
          const tLoadID = startCastLoad(tCastList, 1, VOID, VOID, 1);
          if (getVariable("loading.bar.active")) {
            showLoadingBar(tLoadID, propList("buffer", Symbol.for("window"), "locY", 500, "width", 300));
          }
          return registerCastloadCallback(tLoadID, Symbol.for("assetDownloadCallbacks"), this.getID(), tstate);
        } else {
          return this.updateState("init_threads");
        }
      case "validate_resources":
        this.pState = tstate;
        const tCastList2 = list();
        const tNewList = list();
        const tVarMngr = getVariableManager();
        let j = 1;
        while (1) {
          if (!tVarMngr.exists(`cast.entry.${j}`)) {
            break;
          }
          const tFileName = tVarMngr.GET(`cast.entry.${j}`);
          tCastList2.add(tFileName);
          j = j + 1;
        }
        if (count(tCastList2) > 0) {
          for (const tCast of tCastList2) {
            if (!castExists(tCast)) {
              tNewList.add(tCast);
            }
          }
        }
        if (count(tNewList) > 0) {
          const tLoadID = startCastLoad(tNewList, 1, VOID, VOID, 1);
          if (getVariable("loading.bar.active")) {
            showLoadingBar(tLoadID, propList("buffer", Symbol.for("window"), "locY", 500, "width", 300));
          }
          return registerCastloadCallback(tLoadID, Symbol.for("assetDownloadCallbacks"), this.getID(), tstate);
        } else {
          return this.updateState("init_threads");
        }
      case "init_threads":
        sendProcessTracking(24);
        this.pState = tstate;
        cursor(0);
        the.stage.title = getVariable("client.window.title");
        this.hideLogo();
        getThreadManager().initAll();
        return executeMessage(Symbol.for("Initialize"), "initialize");
      default:
        return error(this, `Unknown state: ${tstate}`, Symbol.for("updateState"), Symbol.for("major"));
    }
  }

  fullScreenRefresh() {
    if (ilk(this.pFullScreenRefreshSpr) == Symbol.for("sprite")) {
      this.pFullScreenRefreshSpr.visible = 1;
      switch (this.pFullScreenRefreshSpr.loc.locH) {
        case 0:
          this.pFullScreenRefreshSpr.loc = point(-1, 0);
          break;
        case (-1):
          this.pFullScreenRefreshSpr.loc = point(0, 0);
          break;
        default:
          this.pFullScreenRefreshSpr.loc = point(0, 0);
          break;
      }
    }
  }
}
