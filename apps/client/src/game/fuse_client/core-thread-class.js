import {
  date,
  EMPTY,
  ilk,
  member,
  point,
  puppetTempo,
  sprite,
  the,
  VOID,
  voidp,
} from "../../director";

export default function () {
  return {
    pState: VOID,
    pLogoSpr: VOID,
    pFadingLogo: VOID,
    pLogoStartTime: VOID,
    pCrapFixing: VOID,
    pCrapFixSpr: VOID,
    pCrapFixRegionInvalidated: VOID,
    pFullScreenRefreshSpr: VOID,

    construct() {
      let tSession, tmember, tShowLogoForMs, tLogoNowShownMs, tBlend, tAssetId, tSuccess, tstate, tURL, tMemName, tMemNum, tDelim, tParamBundle, tParam, tKey, tValue, tTxtFile, tCastList, tLoadID, tNewList, tVarMngr, tFileName, i, j;

      tSession = _director.createObject(Symbol.for("session"), _director.getClassVariable("variable.manager.class"));
      tSession.set("client_startdate", date());
      tSession.set("client_starttime", the.longTime);
      tSession.set("client_version", _director.getVariable("system.version"));
      tSession.set("client_url", _director.getMoviePath());
      tSession.set("client_lastclick", EMPTY);
      _director.createObject(Symbol.for("headers"), _director.getClassVariable("variable.manager.class"));
      _director.createObject(Symbol.for("classes"), _director.getClassVariable("variable.manager.class"));
      _director.createObject(Symbol.for("cache"), _director.getClassVariable("variable.manager.class"));
      _director.createBroker(Symbol.for("Initialize"));
      _director.registerMessage(Symbol.for("requestHotelView"), this.getID(), Symbol.for("initTransferToHotelView"));
      _director.registerMessage(Symbol.for("invalidateCrapFixRegion"), this.getID(), Symbol.for("invalidateCrapFixer"));
      this.pFadingLogo = 0;
      this.pLogoStartTime = 0;
      this.pCrapFixSpr = sprite(_director.reserveSprite());
      if (ilk(this.pCrapFixSpr) === Symbol.for("sprite")) {
        this.pCrapFixSpr.member = member("crap.fixer");
        this.pCrapFixSpr.width = 560;
        this.pCrapFixSpr.height = 75;
        this.pCrapFixSpr.locZ = -2000000000;
        this.pCrapFixSpr.loc = point(-1, 0);
        this.pCrapFixSpr.visible = 0;
      }
      this.pCrapFixing = 0;
      this.pCrapFixRegionInvalidated = 1;
      this.pFullScreenRefreshSpr = sprite(_director.reserveSprite());
      if (ilk(this.pFullScreenRefreshSpr) === Symbol.for("sprite")) {
        this.pFullScreenRefreshSpr.member = member("crap.fixer");
        this.pFullScreenRefreshSpr.width = the.stage.image.width + 1;
        this.pFullScreenRefreshSpr.height = the.stage.image.height;
        this.pFullScreenRefreshSpr.locZ = -2000000000;
        this.pFullScreenRefreshSpr.loc = point(-1, 0);
        this.pFullScreenRefreshSpr.visible = 0;
      }
      return this.updateState("load_variables");
    },

    deconstruct() {
      if (_director.timeoutExists("client.refresh.timeout")) {
        _director.removeTimeout("client.refresh.timeout");
      }
      _director.unregisterMessage(Symbol.for("invalidateCrapFixRegion"), this.getID());
      _director.releaseSprite(this.pCrapFixSpr.spriteNum);
      return this.hideLogo();
    },

    showLogo() {
      let tmember;

      if (_director.memberExists("Logo")) {
        tmember = member(_director.getmemnum("Logo"));
        this.pLogoSpr = sprite(_director.reserveSprite(this.getID()));
        this.pLogoSpr.member = tmember;
        this.pLogoSpr.ink = 0;
        this.pLogoSpr.blend = 90;
        this.pLogoSpr.locZ = -20000001;
        this.pLogoSpr.loc = point(the.stage.rect.width / 2, (the.stage.rect.height / 2) - tmember.height);
        this.pLogoStartTime = the.milliSeconds;
      }
      return 1;
    },

    hideLogo() {
      if (ilk(this.pLogoSpr) === Symbol.for("sprite")) {
        _director.releaseSprite(this.pLogoSpr.spriteNum);
        this.pLogoSpr = VOID;
      }
      return 1;
    },

    initTransferToHotelView() {
      let tShowLogoForMs, tLogoNowShownMs;

      tShowLogoForMs = 1000;
      tLogoNowShownMs = the.milliSeconds - this.pLogoStartTime;
      if (tLogoNowShownMs >= tShowLogoForMs) {
        _director.createTimeout("logo_timeout", 2000, Symbol.for("initUpdate"), this.getID(), VOID, 1);
      } else {
        _director.createTimeout("init_timeout", tShowLogoForMs - tLogoNowShownMs + 1, Symbol.for("initTransferToHotelView"), this.getID(), VOID, 1);
      }
    },

    initUpdate() {
      this.pFadingLogo = 1;
      _director.receiveUpdate(this.getID());
    },

    invalidateCrapFixer() {
      this.pCrapFixRegionInvalidated = 1;
    },

    update() {
      let tBlend;

      if (this.pFadingLogo) {
        tBlend = 0;
        if (this.pLogoSpr !== VOID) {
          this.pLogoSpr.blend = this.pLogoSpr.blend - 10;
          tBlend = this.pLogoSpr.blend;
        }
        if (tBlend <= 0) {
          if (!this.pCrapFixing) {
            _director.removeUpdate(this.getID());
          }
          this.pFadingLogo = 0;
          this.hideLogo();
          _director.executeMessage(Symbol.for("showHotelView"));
          _director.callJavaScriptFunction("clientReady");
        }
      }
      if (this.pCrapFixing) {
        if (ilk(this.pCrapFixSpr) === Symbol.for("sprite")) {
          if (this.pCrapFixRegionInvalidated) {
            this.pCrapFixSpr.visible = 1;
            switch (this.pCrapFixSpr.loc.locH) {
              case 0:
                this.pCrapFixSpr.loc = point(-1, 0);
                break;
              case -1:
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
    },

    assetDownloadCallbacks(tAssetId, tSuccess) {
      if (tSuccess === 0) {
        switch (tAssetId) {
          case "load_variables":
          case "load_texts":
          case "load_casts":
            _director.fatalError({ error: tAssetId });
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
    },

    updateState(tstate) {
      let tURL, tMemName, tMemNum, tDelim, tParamBundle, tParam, tKey, tValue, tTxtFile, tCastList, tLoadID, tNewList, tVarMngr, tFileName, i, j;

      switch (tstate) {
        case "load_variables":
          this.pState = tstate;
          this.showLogo();
          _director.cursor(4);
          if (the.runMode.includes("Plugin")) {
            tDelim = the.itemDelimiter;
            for (let i = 1; i <= 9; i++) {
              tParamBundle = _director.externalParamValue("sw" + i);
              if (!voidp(tParamBundle)) {
                the.itemDelimiter = ";";
                for (let j = 1; j <= tParamBundle.item.count; j++) {
                  tParam = tParamBundle.item[j];
                  the.itemDelimiter = "=";
                  if (tParam.item.count > 1) {
                    tKey = tParam.item[1];
                    tValue = tParam.item.slice(2, tParam.item.count);
                    if (tKey === "client.fatal.error.url") {
                      _director.getVariableManager().set(tKey, tValue);
                    } else {
                      if (tKey === "client.allow.cross.domain") {
                        _director.getVariableManager().set(tKey, tValue);
                      } else {
                        if (tKey === "client.notify.cross.domain") {
                          _director.getVariableManager().set(tKey, tValue);
                        } else {
                          if (tKey === "external.variables.txt") {
                            _director.getSpecialServices().setExtVarPath(tValue);
                          } else {
                            if (tKey === "processlog.url") {
                              _director.getVariableManager().set(tKey, tValue);
                            } else {
                              if (tKey === "account_id") {
                                _director.getVariableManager().set(tKey, tValue);
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
          tURL = _director.getExtVarPath();
          tMemName = tURL;
          tMemNum = _director.queueDownload(tURL, tMemName, Symbol.for("field"), 1);
          _director.sendProcessTracking(9);
          if (tMemNum === 0) {
            _director.fatalError({ error: tstate });
            return 0;
          } else {
            return _director.registerDownloadCallback(tMemNum, Symbol.for("assetDownloadCallbacks"), this.getID(), tstate);
          }

        case "load_params":
          this.pState = tstate;
          _director.dumpVariableField(_director.getExtVarPath());
          _director.removeMember(_director.getExtVarPath());
          if (_director.variableExists("text.crap.fixing")) {
            this.pCrapFixing = _director.getVariableValue("text.crap.fixing");
          }
          if (_director.variableExists("client.full.refresh.period")) {
            _director.createTimeout("client.refresh.timeout", _director.getIntVariable("client.full.refresh.period"), Symbol.for("fullScreenRefresh"), this.getID(), VOID, 0);
          }
          if (the.runMode.includes("Plugin")) {
            tDelim = the.itemDelimiter;
            for (let i = 1; i <= 9; i++) {
              tParamBundle = _director.externalParamValue("sw" + i);
              if (!voidp(tParamBundle)) {
                the.itemDelimiter = ";";
                for (let j = 1; j <= tParamBundle.item.count; j++) {
                  tParam = tParamBundle.item[j];
                  the.itemDelimiter = "=";
                  if (tParam.item.count > 1) {
                    _director.getVariableManager().set(tParam.item[1], tParam.item.slice(2, tParam.item.count));
                  }
                  the.itemDelimiter = ";";
                }
              }
            }
            the.itemDelimiter = tDelim;
          }
          _director.setDebugLevel(0);
          _director.getStringServices().initConvList();
          puppetTempo(_director.getIntVariable("system.tempo", 30));
          if (_director.variableExists("client.reload.url")) {
            _director.getObject(Symbol.for("session")).set("client_url", _director.obfuscate(_director.getVariable("client.reload.url")));
          }
          return this.updateState("load_texts");

        case "load_texts":
          this.pState = tstate;
          tURL = _director.getVariable("external.texts.txt");
          tMemName = tURL;
          if (tMemName === EMPTY) {
            return this.updateState("load_casts");
          }
          tMemNum = _director.queueDownload(tURL, tMemName, Symbol.for("field"));
          _director.sendProcessTracking(12);
          if (tMemNum === 0) {
            _director.fatalError({ error: tstate });
            return 0;
          } else {
            return _director.registerDownloadCallback(tMemNum, Symbol.for("assetDownloadCallbacks"), this.getID(), tstate);
          }

        case "load_casts":
          this.pState = tstate;
          tTxtFile = _director.getVariable("external.texts.txt");
          if (tTxtFile !== 0) {
            if (_director.memberExists(tTxtFile)) {
              _director.dumpTextField(tTxtFile);
              _director.removeMember(tTxtFile);
            }
          }
          _director.sendProcessTracking(23);
          tCastList = [];
          i = 1;
          while (true) {
            if (!_director.variableExists("cast.entry." + i)) {
              break;
            }
            tFileName = _director.getVariable("cast.entry." + i);
            tCastList.add(tFileName);
            i = i + 1;
          }
          if (tCastList.count > 0) {
            tLoadID = _director.startCastLoad(tCastList, 1, VOID, VOID, 1);
            if (_director.getVariable("loading.bar.active")) {
              _director.showLoadingBar(tLoadID, { buffer: Symbol.for("window"), locY: 500, width: 300 });
            }
            return _director.registerCastloadCallback(tLoadID, Symbol.for("assetDownloadCallbacks"), this.getID(), tstate);
          } else {
            return this.updateState("init_threads");
          }

        case "validate_resources":
          this.pState = tstate;
          tCastList = [];
          tNewList = [];
          tVarMngr = _director.getVariableManager();
          i = 1;
          while (true) {
            if (!tVarMngr.exists("cast.entry." + i)) {
              break;
            }
            tFileName = tVarMngr.GET("cast.entry." + i);
            tCastList.add(tFileName);
            i = i + 1;
          }
          if (tCastList.count > 0) {
            for (const tCast of tCastList) {
              if (!_director.castExists(tCast)) {
                tNewList.add(tCast);
              }
            }
          }
          if (tNewList.count > 0) {
            tLoadID = _director.startCastLoad(tNewList, 1, VOID, VOID, 1);
            if (_director.getVariable("loading.bar.active")) {
              _director.showLoadingBar(tLoadID, { buffer: Symbol.for("window"), locY: 500, width: 300 });
            }
            return _director.registerCastloadCallback(tLoadID, Symbol.for("assetDownloadCallbacks"), this.getID(), tstate);
          } else {
            return this.updateState("init_threads");
          }

        case "init_threads":
          _director.sendProcessTracking(24);
          this.pState = tstate;
          _director.cursor(0);
          the.stage.title = _director.getVariable("client.window.title");
          this.hideLogo();
          _director.getThreadManager().initAll();
          return _director.executeMessage(Symbol.for("Initialize"), "initialize");

        default:
          return _director.error(this, "Unknown state: " + tstate, Symbol.for("updateState"), Symbol.for("major"));
      }
    },

    fullScreenRefresh() {
      if (ilk(this.pFullScreenRefreshSpr) === Symbol.for("sprite")) {
        this.pFullScreenRefreshSpr.visible = 1;
        switch (this.pFullScreenRefreshSpr.loc.locH) {
          case 0:
            this.pFullScreenRefreshSpr.loc = point(-1, 0);
            break;
          case -1:
            this.pFullScreenRefreshSpr.loc = point(0, 0);
            break;
          default:
            this.pFullScreenRefreshSpr.loc = point(0, 0);
            break;
        }
      }
    },
  };
}
