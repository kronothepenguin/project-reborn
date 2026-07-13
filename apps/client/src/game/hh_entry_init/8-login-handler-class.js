export default class {
  pCryptoParams;
  pBigJob;

  construct() {
    this.pCryptoParams = propList();
    this.pMD5ChecksumArr = list();
    this.pClientPrivKey = EMPTY;
    registerMessage(Symbol.for("hideLogin"), this.getID(), Symbol.for("hideLogin"));
    return this.regMsgList(1);
  }

  deconstruct() {
    unregisterMessage(Symbol.for("performLogin"), this.getID());
    unregisterMessage(Symbol.for("hideLogin"), this.getID());
    return this.regMsgList(0);
  }

  handleDisconnect(tMsg) {
    let tSession = getObject(Symbol.for("session"));
    let tUserLoggedIn = 0;
    if (objectp(tSession)) {
      tUserLoggedIn = tSession.GET("userLoggedIn");
    }
    error(this, `${"Connection was disconnected:"} ${tMsg.connection.getID()}`, Symbol.for("handleDisconnect"), Symbol.for("dummy"));
    if (tUserLoggedIn) {
      this.getInterface().showDisconnect();
      return fatalError(propList("error", "disconnect"));
    } else {
      let tErrorList = propList();
      tErrorList["error"] = this.getComponent().GetDisconnectErrorState();
      let tConnection = getConnection(getVariable("connection.info.id", Symbol.for("Info")));
      if (tConnection != VOID) {
        tErrorList["host"] = tConnection.getProperty(Symbol.for("host"));
        tErrorList["port"] = tConnection.getProperty(Symbol.for("port"));
      }
      return fatalError(tErrorList);
    }
  }

  handleHello(tMsg) {
    this.getComponent().SetDisconnectErrorState("init_crypto");
    return tMsg.connection.send("INIT_CRYPTO");
  }

  handleSessionParameters(tMsg) {
    let tPairsCount = tMsg.connection.GetIntFrom();
    if (integerp(tPairsCount)) {
      if (tPairsCount > 0) {
        for (let i = 1; i <= tPairsCount; i++) {
          let tID = tMsg.connection.GetIntFrom();
          let tSession = getObject(Symbol.for("session"));
          switch (tID) {
            case 0:
              let tValue = tMsg.connection.GetIntFrom();
              tSession.set("conf_coppa", tValue > 0);
              tSession.set("conf_strong_coppa_required", tValue > 1);
              break;
            case 1:
              tValue = tMsg.connection.GetIntFrom();
              tSession.set("conf_voucher", tValue > 0);
              break;
            case 2:
              tValue = tMsg.connection.GetIntFrom();
              tSession.set("conf_parent_email_request", tValue > 0);
              break;
            case 3:
              tValue = tMsg.connection.GetIntFrom();
              tSession.set("conf_parent_email_request_reregistration", tValue > 0);
              break;
            case 4:
              tValue = tMsg.connection.GetIntFrom();
              tSession.set("conf_allow_direct_mail", tValue > 0);
              break;
            case 5:
              tValue = tMsg.connection.GetStrFrom();
              if (!objectExists(Symbol.for("dateFormatter"))) {
                createObject(Symbol.for("dateFormatter"), list("Date Class"));
              }
              let tDateForm = getObject(Symbol.for("dateFormatter"));
              if (!(tDateForm == 0)) {
                tDateForm.define(tValue);
              }
              break;
            case 6:
              tValue = tMsg.connection.GetIntFrom();
              tSession.set("conf_partner_integration", tValue > 0);
              break;
            case 7:
              tValue = tMsg.connection.GetIntFrom();
              tSession.set("allow_profile_editing", tValue > 0);
              break;
            case 8:
              tValue = tMsg.connection.GetStrFrom();
              tSession.set("tracking_header", tValue);
              break;
            case 9:
              tValue = tMsg.connection.GetIntFrom();
              tSession.set("tutorial_enabled", tValue);
              break;
          }
        }
      }
    }
    return this.getComponent().sendLogin(tMsg.connection);
  }

  handlePing(tMsg) {
    tMsg.connection.send("PONG");
  }

  handleLoginOK(tMsg) {
    sendProcessTracking(41);
    tMsg.connection.send("GET_INFO");
    tMsg.connection.send("GET_CREDITS");
    tMsg.connection.send("GETAVAILABLEBADGES");
    tMsg.connection.send("GET_POSSIBLE_ACHIEVEMENTS");
    tMsg.connection.send("GET_SOUND_SETTING");
    this.getComponent().initLatencyTest();
    if (objectExists(Symbol.for("session"))) {
      getObject(Symbol.for("session")).set("userLoggedIn", 1);
    }
    executeMessage(Symbol.for("userloggedin"));
    executeMessage(Symbol.for("sendTrackingPoint"), "/client/loggedin");
  }

  handleUserObj(tMsg) {
    let tuser = propList();
    let tConn = tMsg.connection;
    tuser["user_id"] = tConn.GetStrFrom();
    tuser["name"] = tConn.GetStrFrom();
    tuser["figure"] = tConn.GetStrFrom();
    tuser["sex"] = tConn.GetStrFrom();
    tuser["customData"] = tConn.GetStrFrom();
    tuser["ph_tickets"] = tConn.GetIntFrom();
    tuser["ph_figure"] = tConn.GetStrFrom();
    tuser["photo_film"] = tConn.GetIntFrom();
    tuser["directMail"] = tConn.GetIntFrom();
    tuser["figure_string"] = tuser["figure"];
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "=";
    if (!voidp(tuser["sex"])) {
      if ((tuser["sex"].contains("F")) || (tuser["sex"].contains("f"))) {
        tuser["sex"] = "F";
      } else {
        tuser["sex"] = "M";
      }
    }
    if (objectExists("Figure_System")) {
      tuser["figure"] = getObject("Figure_System").parseFigure(tuser["figure"], tuser["sex"], "user", "USEROBJECT");
    }
    the.itemDelimiter = tDelim;
    let tSession = getObject(Symbol.for("session"));
    for (let i = 1; i <= tuser.count; i++) {
      tSession.set(`${"user_"}${tuser.getPropAt(i)}`, tuser[i]);
    }
    tSession.set(Symbol.for("userName"), tSession.GET("user_name"));
    executeMessage(Symbol.for("updateFigureData"));
    if (getObject(Symbol.for("session")).exists("user_logged")) {
      return;
    } else {
      getObject(Symbol.for("session")).set("user_logged", 1);
    }
    this.getInterface().hideLogin();
    executeMessage(Symbol.for("userlogin"), "userLogin");
  }

  handleUserBanned(tMsg) {
    let tBanMsg = `${getText("Alert_YouAreBanned")}${RETURN}${tMsg.content}`;
    executeMessage(Symbol.for("openGeneralDialog"), Symbol.for("ban"), propList("id", "BannWarning", "title", "Alert_YouAreBanned_T", "Msg", tBanMsg, "modal", 1));
    removeConnection(tMsg.connection.getID());
  }

  handleEPSnotify(tMsg) {
    let ttype = EMPTY;
    let tdata = EMPTY;
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "=";
    for (let f = 1; f <= tMsg.content.line.count; f++) {
      let tProp = tMsg.content.line[f].item[1];
      let tDesc = tMsg.content.line[f].item[2];
      switch (tProp) {
        case "t":
          ttype = integer(tDesc);
          break;
        case "p":
          tdata = tDesc;
          break;
      }
    }
    the.itemDelimiter = tDelim;
    switch (ttype) {
      case 580:
        if (!createObject("lang_test", "CLangTest")) {
          return error(this, "Failed to init lang tester!", Symbol.for("handleEPSnotify"), Symbol.for("minor"));
        } else {
          return getObject("lang_test").setWord(tdata);
        }
        break;
    }
    executeMessage(Symbol.for("notify"), ttype, tdata, tMsg.connection.getID());
  }

  handleSystemBroadcast(tMsg) {
    tMsg = tMsg[Symbol.for("content")];
    tMsg = replaceChunks(tMsg, "\r", RETURN);
    tMsg = replaceChunks(tMsg, "<br>", RETURN);
    executeMessage(Symbol.for("alert"), propList("Msg", tMsg));
    the.keyboardFocusSprite = 0;
  }

  handleCheckSum(tMsg) {
    getObject(Symbol.for("session")).set("user_checksum", tMsg.content);
  }

  handleAvailableBadges(tMsg) {
    let tBadgeList = list();
    let tBadgeCount = tMsg.connection.GetIntFrom();
    for (let i = 1; i <= tBadgeCount; i++) {
      let tBadgeID = tMsg.connection.GetStrFrom();
      tBadgeList.add(tBadgeID);
    }
    let tChosenBadgeCount = tMsg.connection.GetIntFrom();
    let tChosenBadges = propList();
    for (let i = 1; i <= tChosenBadgeCount; i++) {
      let tBadgeIndex = tMsg.connection.GetIntFrom();
      let tBadgeID = tMsg.connection.GetStrFrom();
      tChosenBadges.setaProp(tBadgeIndex, tBadgeID);
    }
    getObject("session").set("available_badges", tBadgeList);
    getObject("session").set("chosen_badges", tChosenBadges);
  }

  handleRights(tMsg) {
    let tSession = getObject(Symbol.for("session"));
    tSession.set("user_rights", list());
    let tRights = tSession.GET("user_rights");
    let tPrivilegeFound = 1;
    while (tPrivilegeFound == 1) {
      let tPrivilege = tMsg.connection.GetStrFrom();
      if ((tPrivilege == VOID) || (tPrivilege == EMPTY)) {
        tPrivilegeFound = 0;
        continue;
      }
      tRights.add(tPrivilege);
    }
    return 1;
  }

  handleErr(tMsg) {
    error(this, `${"Error from server:"} ${tMsg.content}`, Symbol.for("handleErr"), Symbol.for("dummy"));
    switch (1) {
      case (tMsg.content.contains("login incorrect")):
        removeConnection(tMsg.connection.getID());
        this.getComponent().setaProp(Symbol.for("pOkToLogin"), 0);
        if (getObject(Symbol.for("session")).exists("failed_password")) {
          openNetPage(getText("login_forgottenPassword_url"));
          this.getInterface().showLogin();
          executeMessage(Symbol.for("externalLinkClick"), point(the.stage.image.width / 2, the.stage.image.height / 2));
          return 0;
        } else {
          getObject(Symbol.for("session")).set("failed_password", 1);
          this.getInterface().showLogin();
          executeMessage(Symbol.for("alert"), propList("Msg", "Alert_WrongNameOrPassword"));
        }
        break;
      case (tMsg.content.contains("mod_warn")):
        let tDelim = the.itemDelimiter;
        the.itemDelimiter = "/";
        let tTextStr = tMsg.content.item[`2..${tMsg.content.item.count}`];
        the.itemDelimiter = tDelim;
        executeMessage(Symbol.for("alert"), propList("title", "alert_warning", "Msg", tTextStr, "modal", 1));
        break;
      case (tMsg.content.contains("Version not correct")):
        executeMessage(Symbol.for("alert"), propList("Msg", "alert_old_client"));
        break;
      case (tMsg.content.contains("Duplicate session")):
        removeConnection(tMsg.connection.getID());
        this.getComponent().setaProp(Symbol.for("pOkToLogin"), 0);
        this.getInterface().showLogin();
        executeMessage(Symbol.for("alert"), propList("Msg", "alert_duplicatesession"));
        break;
    }
    return 1;
  }

  handleModAlert(tMsg) {
    let tTest = tMsg.getaProp(Symbol.for("content"));
    let tConn = tMsg.connection;
    if (!tConn) {
      error(this, "Error in moderation alert.", Symbol.for("handleModerationAlert"), Symbol.for("minor"));
      return 0;
    }
    let tMessageText = tConn.GetStrFrom();
    let tURL = tConn.GetStrFrom();
    if (tURL == EMPTY) {
      tURL = VOID;
    }
    executeMessage(Symbol.for("alert"), propList("title", "alert_warning", "Msg", tMessageText, "modal", 1, "url", tURL));
  }

  handleCryptoParameters(tMsg) {
    let tClientToServer = 1;
    let tServerToClient = tMsg.connection.GetIntFrom() != 0;
    this.pCryptoParams = propList("ClientToServer", tClientToServer, "ServerToClient", tServerToClient);
    if (tClientToServer) {
      this.responseWithPublicKey();
    } else {
      if (tServerToClient) {
        error(this, "Server to client encryption only is not supported.", Symbol.for("handleCryptoParameters"), Symbol.for("minor"));
        return tMsg.connection.disconnect(1);
      }
      this.startNewSession();
    }
    return 1;
  }

  responseWithPublicKey(tConnection) {
    if (_player != VOID) {
      if (_player.traceScript || _movie.traceScript) {
        return 0;
      }
    }
    _player.traceScript = 0;
    _movie.traceScript = 0;
    let tCastLibNum = member("Login Handler Class").castLibNum;
    if (member("Login Subscript 2").castLibNum != tCastLibNum) {
      return 0;
    }
    if (castLib(tCastLibNum).member["Login Subscript 2"].script != script("Login Subscript 2")) {
      return 0;
    }
    tConnection = getConnection(getVariable("connection.info.id"));
    let tBigInt = script("Login Subscript 2");
    let tPublicKeyStr = EMPTY;
    let tTries = 1;
    while ((tPublicKeyStr.length < 72) && (tTries < 5)) {
      let tHex = EMPTY;
      let tLength = 40;
      let tHexChars = "012345679abcdef";
      for (let tNo = 1; tNo <= tLength * 2; tNo++) {
        let tRandPos = random(tHexChars.length);
        tHex = `${tHex}${char(tRandPos).to(tRandPos).of(tHexChars)}`;
      }
      let tFakeBigJob = BigInt_str2bigInt(tHex, 16, tLength);
      this.pBigJob = tBigInt.str2bigInt(tHex, 16, tLength);
      _ob38729_p = BigInt_str2bigInt("A8EA077D4943CC98E53C21F5F7C7A0DB8BCE7506F8361A7C1690392F2B090C96EE8BC67BAA0DCB7183F16401F5CB838E3B6EE86B9EF2E5D0F3C49D4DC4EDC2B9", 16);
      _ob38729_g = BigInt_str2bigInt("5", 16);
      let tJsPublicKey = script("Login Subscript").doPowmodMathCs(this.pBigJob);
      tPublicKeyStr = tBigInt.bigInt2str(tJsPublicKey, 16);
      tTries = tTries + 1;
    }
    if (!(the.platform.contains("windows")) && (tPublicKeyStr.length < 2)) {
      return this.forwardToRosettaDisablePage();
    }
    tConnection.send("GENERATEKEY", propList("string", tPublicKeyStr));
  }

  handleServerSecretKey(tMsg) {
    if (_player != VOID) {
      if (_player.traceScript || _movie.traceScript) {
        return 0;
      }
    }
    _player.traceScript = 0;
    _movie.traceScript = 0;
    let tCastLibNum = member("Login Handler Class").castLibNum;
    if (member("Login Subscript 2").castLibNum != tCastLibNum) {
      return 0;
    }
    if (castLib(tCastLibNum).member["Login Subscript 2"].script != script("Login Subscript 2")) {
      return 0;
    }
    let tConnection = tMsg.connection;
    let tBigInt = script("Login Subscript 2");
    _ob38729_p = BigInt_str2bigInt("A8EA077D4943CC98E53C21F5F7C7A0DB8BCE7506F8361A7C1690392F2B090C96EE8BC67BAA0DCB7183F16401F5CB838E3B6EE86B9EF2E5D0F3C49D4DC4EDC2B9", 16);
    _ob38729_g = BigInt_str2bigInt("5", 16);
    let t_sServerPublicKey = tMsg.content;
    let tFakeServerPublic = BigInt_str2bigInt(t_sServerPublicKey, 16);
    let serverPublic = tBigInt.str2bigInt(t_sServerPublicKey, 16);
    let tShared = script("Login Subscript").doPowmodMathSc(this.pBigJob, serverPublic);
    let t_sSharedKey = tBigInt.bigInt2str(tShared, 16);
    if ((t_sSharedKey.length % 2) != 0) {
      t_sSharedKey = `${"0"}${t_sSharedKey}`;
    }
    let tSharedKeyString = EMPTY;
    let tStrSrv = getStringServices();
    for (let a = 1; a <= t_sSharedKey.length; a++) {
      let t = tStrSrv.convertHexToInt(t_sSharedKey.char[`${a}..${a + 1}`]);
      tSharedKeyString = `${tSharedKeyString}${numToChar(t)}`;
      a = a + 1;
    }
    let tCryptoClass = "tYy1rX5j7e4PLYJLER";
    let tCastLibNum2 = 2;
    if (member(tCryptoClass).castLibNum != tCastLibNum2) {
      return 0;
    }
    if (castLib(tCastLibNum2).member[tCryptoClass].script != script(tCryptoClass)) {
      return 0;
    }
    let t_rDecoder = createObject(Symbol.for("temp"), list(tCryptoClass));
    t_rDecoder.qe2AkKOGGKDTTnd1Nei(tSharedKeyString, Symbol.for("initMUS"));
    tConnection.setDecoder(t_rDecoder);
    tConnection.setEncryption(1);
    tMsg.connection.setEncoder(createObject(Symbol.for("temp"), list(tCryptoClass)));
    tMsg.connection.getEncoder().qe2AkKOGGKDTTnd1Nei(tSharedKeyString, Symbol.for("initMUS"));
    tMsg.connection.setEncryption(1);
    if (this.pCryptoParams.getaProp(Symbol.for("ServerToClient")) == 1) {
      this.makeServerToClientKey();
    } else {
      this.startNewSession();
    }
    return 1;
  }

  handleEndOfCryptoParams(tMsg) {
    this.startNewSession();
  }

  handleHotelLogout(tMsg) {
    let tLogoutMsgId = tMsg.connection.GetIntFrom();
    switch (tLogoutMsgId) {
      case -1:
        this.getComponent().disconnect();
        this.getInterface().showDisconnect();
        break;
      case 1:
        openNetPage(getText("url_logged_out"), "self");
        break;
      case 2:
        openNetPage(getText("url_logout_concurrent"), "self");
        break;
      case 3:
        openNetPage(getText("url_logout_timeout"), "self");
        break;
    }
  }

  handleSoundSetting(tMsg) {
    let tstate = tMsg.connection.GetIntFrom();
    setSoundState(tstate);
    executeMessage(Symbol.for("soundSettingChanged"), tstate);
  }

  handlePossibleAchievements(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tAchievements = propList();
    let tCount = tConn.GetIntFrom();
    for (let i = 1; i <= tCount; i++) {
      let tTypeID = tConn.GetIntFrom();
      let tLevel = tConn.GetIntFrom();
      let tBadgeID = tConn.GetStrFrom();
      tAchievements.setaProp(tBadgeID, propList("type", tTypeID, "level", tLevel, "badge", tBadgeID));
    }
    if (!objectExists(Symbol.for("session"))) {
      return error(this, "Session object not found.", Symbol.for("handlePossibleUserAchievements"), Symbol.for("major"));
    }
    getObject(Symbol.for("session")).set("possible_achievements", tAchievements);
  }

  handleAchievementNotification(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let ttype = tConn.GetIntFrom();
    let tLevel = tConn.GetIntFrom();
    let tBadgeID = tConn.GetStrFrom();
    let tRemovedBadgeID = tConn.GetStrFrom();
    if (!objectExists(Symbol.for("session"))) {
      return error(this, "Session object not found.", Symbol.for("handleAchievementNotification"), Symbol.for("major"));
    }
    let tSession = getObject(Symbol.for("session"));
    let tAchievements = tSession.GET("possible_achievements");
    let tNotify = 0;
    for (let i = 1; i <= tAchievements.count; i++) {
      let tAchievement = tAchievements[i];
      if (tAchievement.ilk != Symbol.for("propList")) {
        continue;
      }
      if ((tAchievement.type == ttype) && (tAchievement.level <= tLevel)) {
        tAchievements.deleteAt(i);
        i = i - 1;
        tNotify = 1;
      }
    }
    if (tNotify) {
      executeMessage(Symbol.for("achievementsUpdated"));
    }
    let tBadges = tSession.GET("available_badges");
    tBadges.add(tBadgeID);
    executeMessage(Symbol.for("badgeReceived"), tBadgeID);
    let tPos = tBadges.getPos(tRemovedBadgeID);
    if (tPos > 0) {
      tBadges.deleteAt(tPos);
      executeMessage(Symbol.for("badgeRemoved"), tRemovedBadgeID);
    }
    this.getComponent().sendGetBadges();
  }

  makeServerToClientKey() {
    if (_player != VOID) {
      if (_player.traceScript || _movie.traceScript) {
        return 0;
      }
    }
    _player.traceScript = 0;
    _movie.traceScript = 0;
    let tConnection = getConnection(getVariable("connection.info.id"));
    let tDecoder = createObject(Symbol.for("temp"), list("x3hSfgRdzsh7CfHKUPwqjndo3bOVnl"));
    let tPublicKey = tDecoder.o();
    tConnection.send("SECRETKEY", propList("string", tPublicKey));
    let tKey = secretDecode(tPublicKey);
    tConnection.setDecoder(tDecoder);
    tConnection.getDecoder().WvUrP88jJ4snglkrhCh3u9vHu0ADDS(tKey);
    let tPremixChars = "eb11nmhdwbn733c2xjv1qln3ukpe0hvce0ylr02s12sv96rus2ohexr9cp8rufbmb1mdb732j1l3kehc0l0s2v6u2hx9prfmu";
    tConnection.getDecoder().prMixEValueBin(tPremixChars, 17);
    tConnection.setProperty(Symbol.for("deciphering"), 1);
  }

  startNewSession() {
    this.getComponent().SetDisconnectErrorState("start_session");
    let tClientURL = getMoviePath();
    let tExtVarsURL = getExtVarPath();
    let tConnection = getConnection(getVariable("connection.info.id"));
    let tHost = tConnection.getProperty(Symbol.for("host"));
    if (tHost.contains(deobfuscate(",y,?mf,BmylPl^nGoH"))) {
      tClientURL = EMPTY;
    }
    if (tHost.contains(deobfuscate("FbgeGnd=&Ae]F@E}"))) {
      tClientURL = EMPTY;
    }
    if (tHost.contains(deobfuscate("&bF2fee|&CFmGqd}"))) {
      tClientURL = EMPTY;
    }
    if (tHost.contains(deobfuscate("G#f@d\\fae<fa$]"))) {
      tClientURL = EMPTY;
    }
    if (!(the.runMode.contains("Plugin"))) {
      tClientURL = EMPTY;
      tExtVarsURL = EMPTY;
    } else {
      if (getMoviePath() != the.moviePath) {
        tClientURL = "3";
      }
    }
    tConnection.send("VERSIONCHECK", propList("integer", getIntVariable("client.version.id"), "string", tClientURL, "string", tExtVarsURL));
    tConnection.send("UNIQUEID", propList("string", getMachineID()));
    tConnection.send("GET_SESSION_PARAMETERS");
  }

  hideLogin() {
    this.getInterface().hideLogin();
  }

  handleLatencyTest(tMsg) {
    let tID = tMsg.connection.GetIntFrom();
    this.getComponent().handleLatencyTest(tID);
  }

  forwardToRosettaDisablePage() {
    openNetPage(getVariable("rosetta.warning.page.url"), "self");
  }

  regMsgList(tBool) {
    let tMsgs = propList();
    tMsgs.setaProp(-1, Symbol.for("handleDisconnect"));
    tMsgs.setaProp(0, Symbol.for("handleHello"));
    tMsgs.setaProp(1, Symbol.for("handleServerSecretKey"));
    tMsgs.setaProp(2, Symbol.for("handleRights"));
    tMsgs.setaProp(3, Symbol.for("handleLoginOK"));
    tMsgs.setaProp(5, Symbol.for("handleUserObj"));
    tMsgs.setaProp(33, Symbol.for("handleErr"));
    tMsgs.setaProp(35, Symbol.for("handleUserBanned"));
    tMsgs.setaProp(50, Symbol.for("handlePing"));
    tMsgs.setaProp(52, Symbol.for("handleEPSnotify"));
    tMsgs.setaProp(139, Symbol.for("handleSystemBroadcast"));
    tMsgs.setaProp(141, Symbol.for("handleCheckSum"));
    tMsgs.setaProp(161, Symbol.for("handleModAlert"));
    tMsgs.setaProp(229, Symbol.for("handleAvailableBadges"));
    tMsgs.setaProp(257, Symbol.for("handleSessionParameters"));
    tMsgs.setaProp(277, Symbol.for("handleCryptoParameters"));
    tMsgs.setaProp(278, Symbol.for("handleEndOfCryptoParams"));
    tMsgs.setaProp(287, Symbol.for("handleHotelLogout"));
    tMsgs.setaProp(308, Symbol.for("handleSoundSetting"));
    tMsgs.setaProp(436, Symbol.for("handlePossibleAchievements"));
    tMsgs.setaProp(437, Symbol.for("handleAchievementNotification"));
    tMsgs.setaProp(354, Symbol.for("handleLatencyTest"));
    let tCmds = propList();
    tCmds.setaProp("TRY_LOGIN", 756);
    tCmds.setaProp("VERSIONCHECK", 1170);
    tCmds.setaProp("UNIQUEID", 813);
    tCmds.setaProp("GET_INFO", 7);
    tCmds.setaProp("GET_CREDITS", 8);
    tCmds.setaProp("GET_PASSWORD", 47);
    tCmds.setaProp("LANGCHECK", 58);
    tCmds.setaProp("BTCKS", 105);
    tCmds.setaProp("GETAVAILABLEBADGES", 157);
    tCmds.setaProp("GETSELECTEDBADGES", 159);
    tCmds.setaProp("GET_SESSION_PARAMETERS", 1817);
    tCmds.setaProp("PONG", 196);
    tCmds.setaProp("GENERATEKEY", 2002);
    tCmds.setaProp("SSO", 204);
    tCmds.setaProp("INIT_CRYPTO", 206);
    tCmds.setaProp("SECRETKEY", 207);
    tCmds.setaProp("GET_SOUND_SETTING", 228);
    tCmds.setaProp("SET_SOUND_SETTING", 229);
    tCmds.setaProp("GET_POSSIBLE_ACHIEVEMENTS", 370);
    tCmds.setaProp("TEST_LATENCY", 315);
    tCmds.setaProp("REPORT_LATENCY", 316);
    let tConn = getVariable("connection.info.id", Symbol.for("Info"));
    if (tBool) {
      registerListener(tConn, this.getID(), tMsgs);
      registerCommands(tConn, this.getID(), tCmds);
    } else {
      unregisterListener(tConn, this.getID(), tMsgs);
      unregisterCommands(tConn, this.getID(), tCmds);
    }
    return 1;
  }

  handlers() {
    return list();
  }
}
