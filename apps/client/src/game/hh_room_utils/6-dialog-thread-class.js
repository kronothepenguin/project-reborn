export default class {
  construct() {
    this.pWindowList = list();
    this.pAlertList = list();
    this.pUrlList = propList();
    this.pDefWndType = "habbo_basic.window";
    this.pReadyFlag = 0;
    registerMessage(Symbol.for("openGeneralDialog"), this.getID(), Symbol.for("showDialog"));
    registerMessage(Symbol.for("alert"), this.getID(), Symbol.for("ShowAlert"));
    this.pHelpChoiceCount = this.countHelpChoices();
    this.pChosenHelpRadio = 0;
    this.pCfhType = Symbol.for("none");
    this.pHelpWindowID = getText("win_help", "Help");
    return 1;
  }

  deconstruct() {
    if (this.pReadyFlag) {
      for (const tID of this.pWindowList) {
        if (windowExists(tID)) {
          removeWindow(tID);
        }
      }
      for (const tID of this.pAlertList) {
        if (windowExists(tID)) {
          removeWindow(tID);
        }
      }
      if (writerExists(this.pWriterPlain)) {
        removeWriter(this.pWriterPlain);
      }
      if (writerExists(this.pWriterLink)) {
        removeWriter(this.pWriterLink);
      }
      if (writerExists(this.pWriterBold)) {
        removeWriter(this.pWriterBold);
      }
    }
    this.pWindowList = list();
    this.pAlertList = list();
    this.pUrlList = propList();
    this.pReadyFlag = 0;
    unregisterMessage(Symbol.for("openGeneralDialog"), this.getID());
    unregisterMessage(Symbol.for("alert"), this.getID());
    return 1;
  }

  countHelpChoices() {
    if (!textExists("help_pointer_1")) {
      error(this, "No help choices defined. All go to emergency help.", Symbol.for("countHelpChoices"), Symbol.for("minor"));
      return 0;
    }
    for (let i = 2; i <= 7; i++) {
      if (!textExists(`help_pointer_${i}`)) {
        return i - 1;
      }
    }
    return 7;
  }

  ShowAlert(tProps) {
    if (!this.pReadyFlag) {
      this.buildResources();
    }
    if (voidp(tProps)) {
      return error(this, "Properties for window expected!", Symbol.for("showHideWindow"), Symbol.for("minor"));
    }
    if (stringp(tProps)) {
      tProps = propList("Msg", tProps);
    }
    let tActualID = "";
    if (voidp(tProps[Symbol.for("id")])) {
      tActualID = `alert ${the.milliSeconds}`;
    } else {
      tActualID = `alert ${tProps[Symbol.for("id")]}`;
    }
    let tSpecial = VOID;
    if (tProps[Symbol.for("modal")] == 1) {
      tSpecial = Symbol.for("modal");
    } else {
      tSpecial = VOID;
    }
    let tTitle = VOID;
    let tTitleImg = VOID;
    if (stringp(tProps[Symbol.for("title")])) {
      tTitle = getText(tProps[Symbol.for("title")]);
      getWriter(this.pWriterBold).define(propList("color", rgb(0, 0, 0)));
      tTitleImg = getWriter(this.pWriterBold).render(tTitle).duplicate();
    }
    let tText = "";
    if (textExists(tProps[Symbol.for("Msg")])) {
      tText = getText(tProps[Symbol.for("Msg")]);
    } else {
      tText = tProps[Symbol.for("Msg")];
    }
    let tTextImg = getWriter(this.pWriterPlain).render(tText).duplicate();
    let tURL = this.retrieveURL(tProps);
    let tLinkImg = VOID;
    if (!voidp(tURL)) {
      this.pUrlList.setaProp(tActualID, tURL);
      let tLinkLabel = getText("more_info_link");
      tLinkImg = getWriter(this.pWriterLink).render(tLinkLabel).duplicate();
    }
    if (this.pAlertList.getOne(tActualID)) {
      this.removeDialog(tActualID, this.pAlertList);
    }
    if (!createWindow(tActualID, VOID, VOID, VOID, tSpecial)) {
      return 0;
    }
    let tWndTitle = getText("win_error", "Notice!");
    let tWndObj = getWindow(tActualID);
    tWndObj.setProperty(Symbol.for("title"), tWndTitle);
    tWndObj.merge(this.pDefWndType);
    tWndObj.merge("habbo_alert_a.window");
    let tTitleElem = tWndObj.getElement("alert_title");
    let tTextElem = tWndObj.getElement("alert_text");
    let tLinkElem = tWndObj.getElement("alert_link");
    let tOffsetH = 0;
    let tOffsetW = 0;
    if (voidp(tTitle)) {
      tTitleElem.hide();
    } else {
      tTitleElem.feedImage(tTitleImg);
      tOffsetH = tOffsetH + tTitleImg.height - tTitleElem.getProperty(Symbol.for("height"));
      let tWidth = tTitleImg.width - tTitleElem.getProperty(Symbol.for("width"));
      if ((tWidth > 0) && (tWidth > tOffsetW)) {
        tOffsetW = tWidth;
      }
    }
    if (voidp(tText)) {
      tTextElem.hide();
    } else {
      tTextElem.feedImage(tTextImg);
      tTextElem.moveBy(0, tOffsetH);
      tOffsetH = tOffsetH + tTextImg.height - tTextElem.getProperty(Symbol.for("height"));
      let tWidth2 = tTextImg.width - tTextElem.getProperty(Symbol.for("width"));
      if ((tWidth2 > 0) && (tWidth2 > tOffsetW)) {
        tOffsetW = tWidth2;
      }
    }
    if (voidp(tURL)) {
      tLinkElem.hide();
    } else {
      tLinkElem.feedImage(tLinkImg);
      tLinkElem.moveBy(0, tOffsetH);
      tOffsetH = tOffsetH + tLinkImg.height - tLinkElem.getProperty(Symbol.for("height"));
      let tWidth3 = tLinkImg.width - tLinkElem.getProperty(Symbol.for("width"));
      if ((tWidth3 > 0) && (tWidth3 > tOffsetW)) {
        tOffsetW = tWidth3;
      }
    }
    tWndObj.resizeBy(tOffsetW, tOffsetH);
    if (!voidp(tTitle)) {
      let tLocV = tTitleElem.getProperty(Symbol.for("locV"));
      let tLocH = tTitleElem.getProperty(Symbol.for("locH"));
      tTitleElem.moveTo(((tWndObj.getProperty(Symbol.for("width")) - tTitleImg.width) / 2) - tLocH, tLocV);
    }
    if (!voidp(tText)) {
      let tLocV2 = tTextElem.getProperty(Symbol.for("locV"));
      let tLocH2 = tTextElem.getProperty(Symbol.for("locH"));
      tTextElem.moveTo(((tWndObj.getProperty(Symbol.for("width")) - tTextImg.width) / 2) - tLocH2, tLocV2);
    }
    if (!voidp(tURL)) {
      let tLocV3 = tLinkElem.getProperty(Symbol.for("locV"));
      let tLocH3 = tLinkElem.getProperty(Symbol.for("locH"));
      tLinkElem.moveTo(((tWndObj.getProperty(Symbol.for("width")) - tLinkImg.width) / 2) - tLocH3, tLocV3);
    }
    tWndObj.center();
    let tLocOff = this.pAlertList.count * 10;
    tWndObj.moveBy(tLocOff, tLocOff);
    tWndObj.registerClient(this.getID());
    if (symbolp(tProps[Symbol.for("registerProcedure")])) {
      tWndObj.registerProcedure(tProps[Symbol.for("registerProcedure")], this.getID(), Symbol.for("mouseUp"));
    } else {
      tWndObj.registerProcedure(Symbol.for("eventProcAlert"), this.getID(), Symbol.for("mouseUp"));
    }
    this.pAlertList.add(tActualID);
    return 1;
  }

  showDialog(tWndID, tProps) {
    if (!this.pReadyFlag) {
      this.buildResources();
    }
    switch (tWndID) {
      case Symbol.for("alert"):
      case "alert":
      case Symbol.for("modal_alert"):
      case "modal_alert":
        return this.ShowAlert(tProps);
      case Symbol.for("purse"):
      case "purse":
        return executeMessage(Symbol.for("show_hide_purse"));
      case Symbol.for("help"):
      case "help":
        this.showHelpWindow();
        break;
      case Symbol.for("call_for_help"):
      case "call_for_help":
        let tConnection = getConnection(getVariable("connection.info.id"));
        if (!tConnection) {
          error(this, "Connection not found.", Symbol.for("showDialog"), Symbol.for("major"));
        }
        tConnection.send("GET_PENDING_CALLS_FOR_HELP");
        break;
      case Symbol.for("help_choice"):
      case "help_choice":
        this.openHelpChoiceWindow();
        break;
      case Symbol.for("ban"):
      case "ban":
        tProps[Symbol.for("registerProcedure")] = Symbol.for("eventProcBan");
        return this.ShowAlert(tProps);
    }
  }

  retrieveURL(tProps) {
    let tURL = VOID;
    if (!voidp(tProps.getaProp(Symbol.for("url")))) {
      tURL = tProps.getaProp(Symbol.for("url"));
    }
    let tPostfixList = list("_url", "_URL", "_Url");
    for (const tPostfix of tPostfixList) {
      let tKey = tProps[Symbol.for("Msg")] + tPostfix;
      if (textExists(tKey)) {
        tURL = getText(tKey);
        break;
      }
    }
    if ((tURL starts "http://") || (tURL starts "https://")) {
      return tURL;
    }
    return VOID;
  }

  buildResources() {
    this.pWriterPlain = "dialog_writer_plain";
    this.pWriterLink = "dialog_writer_link";
    this.pWriterBold = "dialog_writer_bold";
    let tFontPlain = getStructVariable("struct.font.plain");
    let tFontLink = getStructVariable("struct.font.link");
    let tFontBold = getStructVariable("struct.font.bold");
    tFontPlain.setaProp(Symbol.for("lineHeight"), 14);
    tFontLink.setaProp(Symbol.for("lineHeight"), 14);
    tFontBold.setaProp(Symbol.for("lineHeight"), 14);
    createWriter(this.pWriterPlain, tFontPlain);
    createWriter(this.pWriterLink, tFontLink);
    createWriter(this.pWriterBold, tFontBold);
    this.pReadyFlag = 1;
    return 1;
  }

  createDialog(tWndTitle, tWndType, tContentType, tEventProc) {
    if (!createWindow(tWndTitle, tWndType)) {
      return 0;
    }
    let tWndObj = getWindow(tWndTitle);
    tWndObj.merge(tContentType);
    tWndObj.center();
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(tEventProc, this.getID(), Symbol.for("mouseUp"));
    this.pWindowList.add(tWndTitle);
    return 1;
  }

  removeDialog(tWndTitle, tWndList) {
    if (tWndList.getOne(tWndTitle)) {
      tWndList.deleteOne(tWndTitle);
      if (!voidp(this.pUrlList.getaProp(tWndTitle))) {
        this.pUrlList.deleteProp(tWndTitle);
      }
      return removeWindow(tWndTitle);
    } else {
      return error(this, `Attempted to remove unknown dialog: ${tWndTitle}`, Symbol.for("removeDialog"), Symbol.for("minor"));
    }
  }

  showAlertSentWindow(tWndObj) {
    tWndObj = getWindow(this.pHelpWindowID);
    tWndObj.unmerge();
    tWndObj.merge("habbo_hobba_alertsent.window");
    let tHeader = "";
    let tText = "";
    if (this.pCfhType == Symbol.for("habbo_helpers")) {
      tHeader = getText("callhelp_sent");
      tText = getText("callhelp_allwillreceive");
    } else {
      tHeader = getText("help_emergency_sent");
      tText = getText("help_emergency_whathappens");
    }
    tWndObj.getElement("alertsent_header").setText(tHeader);
    tWndObj.getElement("alertsent_text").setText(tText);
    return 1;
  }

  openCfhWindow() {
    let tWndTitle = getText("win_callforhelp");
    this.pHelpWindowID = tWndTitle;
    if (windowExists(tWndTitle)) {
      this.removeDialog(tWndTitle, this.pWindowList);
    }
    this.createDialog(tWndTitle, this.pDefWndType, "habbo_hobba_compose.window", Symbol.for("eventProcCallHelp"));
    let tWndObj = getWindow(tWndTitle);
    let tTopText = "";
    let tMidText = "";
    let tBotText = "";
    if (this.pCfhType == Symbol.for("habbo_helpers")) {
      tTopText = getText("callhelp_explanation");
      tMidText = getText("callhelp_writeyour");
      tBotText = getText("callhelp_example");
    } else {
      tTopText = getText("help_emergency_explanation");
      tMidText = getText("help_emergency_writeyour");
      tBotText = getText("help_emergency_example");
    }
    tWndObj.getElement("hobbaalert_top").setText(tTopText);
    tWndObj.getElement("hobbaalert_mid").setText(tMidText);
    tWndObj.getElement("hobbaalert_bottom").setText(tBotText);
    return 1;
  }

  openPendingCFHWindow(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    if (voidp(tConn)) {
      return error(this, "Invalid message.", Symbol.for("openPendingCFHWindow"), Symbol.for("major"));
    }
    let tID = tConn.GetStrFrom();
    let tTimestamp = tConn.GetStrFrom();
    let tCFH = tConn.GetStrFrom();
    let tWindowTitle = getText("win_callforhelp");
    if (windowExists(tWindowTitle)) {
      this.removeDialog(tWindowTitle, this.pWindowList);
    }
    this.createDialog(tWindowTitle, this.pDefWndType, "habbo_pending_cfh.window", Symbol.for("eventProcCallHelp"));
    let tWindowObj = getWindow(tWindowTitle);
    let tTopText = getText("you_have_pending_cfh");
    let tMiddleText = getText("pending_cfh_title");
    tWindowObj.getElement("pending_cfh_top").setText(tTopText);
    tWindowObj.getElement("pending_cfh_mid").setText(tMiddleText);
    tWindowObj.getElement("pending_cfh_text").setText(tCFH);
  }

  openHelpChoiceWindow() {
    if (windowExists(this.pHelpWindowID)) {
      this.removeDialog(this.pHelpWindowID, this.pWindowList);
    }
    if (this.pHelpChoiceCount == 0) {
      this.pCfhType = Symbol.for("emergency");
      return this.showDialog("call_for_help");
    }
    let tWndTitle = getText("win_callforhelp");
    this.pHelpWindowID = tWndTitle;
    if (windowExists(tWndTitle)) {
      return this.removeDialog(tWndTitle, this.pWindowList);
    }
    this.createDialog(tWndTitle, "habbo_full.window", "habbo_help_choise.window", Symbol.for("eventProcHelp"));
    let tWndObj = getWindow(tWndTitle);
    if (getMember("button.radio.off").type != Symbol.for("bitmap")) {
      return 0;
    }
    for (let i = 1; i <= this.pHelpChoiceCount; i++) {
      let tRadioImg = getMember("button.radio.off").image;
      let tText = getText(`help_option_${i}`);
      if (tText != `help_option_${i}`) {
        tWndObj.getElement(`help_option_${i}`).setText(tText);
        tWndObj.getElement(`help_radio_${i}`).feedImage(tRadioImg);
      }
    }
    tWndObj.getElement("help_choise_ok").deactivate();
    return 1;
  }

  helpChoiceMade() {
    if (this.pChosenHelpRadio == 0) {
      return 0;
    }
    let tAction = getText(`help_pointer_${this.pChosenHelpRadio}`);
    if (tAction starts "http") {
      openNetPage(tAction);
      let tValue = this.removeDialog(getText("win_callforhelp"), this.pWindowList);
      executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
      return tValue;
    }
    if (tAction == "hotel_help") {
      this.pCfhType = Symbol.for("habbo_helpers");
    } else {
      if (tAction == "emergency_help") {
        this.pCfhType = Symbol.for("emergency");
      }
    }
    if ((tAction == "hotel_help") || (tAction == "emergency_help")) {
      let tConnection = getConnection(getVariable("connection.info.id"));
      if (!tConnection) {
        error(this, "Connection not found.", Symbol.for("helpChoiceMade"), Symbol.for("major"));
      }
      tConnection.send("GET_PENDING_CALLS_FOR_HELP");
      return 1;
    }
    return error(this, `Help pointer ${this.pChosenHelpRadio} not working, check syntax.`, Symbol.for("helpChoiceMade"), Symbol.for("major"));
  }

  helpRadioClicked(tChoiceNum, tWndID) {
    if (!memberExists("button.radio.on")) {
      return 0;
    }
    let tRadioOnImg = getMember("button.radio.on").image;
    let tRadioOffImg = getMember("button.radio.off").image;
    let tWnd = getWindow(tWndID);
    if (!tWnd.elementExists(`help_radio_${this.pHelpChoiceCount}`)) {
      return 0;
    }
    for (let i = 1; i <= this.pHelpChoiceCount; i++) {
      let tElem = tWnd.getElement(`help_radio_${i}`);
      if (i == tChoiceNum) {
        tElem.feedImage(tRadioOnImg);
        continue;
      }
      tElem.feedImage(tRadioOffImg);
    }
    tWnd.getElement("help_choise_ok").Activate();
    this.pChosenHelpRadio = tChoiceNum;
    return 1;
  }

  showHelpWindow() {
    if (windowExists(this.pHelpWindowID)) {
      this.removeDialog(this.pHelpWindowID, this.pWindowList);
    }
    this.createDialog(this.pHelpWindowID, this.pDefWndType, "habbo_help.window", Symbol.for("eventProcHelp"));
    let tWndObj = getWindow(this.pHelpWindowID);
    let tStr = EMPTY;
    let i = 0;
    while (1) {
      i = i + 1;
      if (textExists(`help_txt_${i}`)) {
        tStr = `${tStr}${getText(`help_txt_${i}`)}${RETURN}`;
        continue;
      }
      break;
    }
    tStr = tStr.line[`1..${tStr.line.count - 1}`];
    let tLinkImg = getWriter(this.pWriterLink).render(tStr).duplicate();
    tWndObj.getElement("link_list").feedImage(tLinkImg);
    if (threadExists(Symbol.for("room"))) {
      if (getThread(Symbol.for("room")).getComponent().getRoomID() == EMPTY) {
        tWndObj.getElement("help_callforhelp_textlink").hide();
      }
    }
    if (tWndObj.elementExists("help_tutorial_link")) {
      let tLinkURL = getText("reg_tutorial_url", EMPTY);
      if (!stringp(tLinkURL) || (tLinkURL.length < 10)) {
        tWndObj.getElement("help_tutorial_link").setProperty(Symbol.for("visible"), 0);
      } else {
        tWndObj.getElement("help_tutorial_link").setText(`${getText("reg_tutorial_txt")} >>`);
      }
    }
    let tTutorialEnabled = getObject(Symbol.for("session")).GET("tutorial_enabled", 0);
    if (!tTutorialEnabled) {
      tWndObj.getElement("help_restart_tutorial").hide();
    }
  }

  eventProcAlert(tEvent, tElemID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "alert_ok":
        case "close":
          return this.removeDialog(tWndID, this.pAlertList);
        case "alert_link":
          let tURL = this.pUrlList.getaProp(tWndID);
          executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          return openNetPage(tURL);
      }
    }
  }

  eventProcPurse(tEvent, tElemID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "close":
        case "purse_close":
          return executeMessage(Symbol.for("hide_purse"));
        case "purse_link_text":
          let tSession = getObject(Symbol.for("session"));
          let tURL = "";
          if (tSession.GET("user_rights").getOne("can_buy_credits")) {
            tURL = getText("url_purselink");
          } else {
            tURL = getText("url_purse_subscribe");
          }
          tURL = `${tURL}${urlEncode(tSession.GET("user_name"))}`;
          if (tSession.exists("user_checksum")) {
            tURL = `${tURL}&sum=${urlEncode(tSession.GET("user_checksum"))}`;
          }
          executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          openNetPage(tURL);
          break;
      }
    }
  }

  eventProcHelp(tEvent, tElemID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "link_list":
          if (tParam.ilk != Symbol.for("point")) {
            return 0;
          }
          let tLineNum = (tParam[2] / 14) + 1;
          if (textExists(`url_help_${tLineNum}`)) {
            let tSession = getObject(Symbol.for("session"));
            let tURL = getText(`url_help_${tLineNum}`);
            let tName = urlEncode(tSession.GET("user_name"));
            if (tURL == EMPTY) {
              return 1;
            }
            if (tURL contains "\user_name") {
              tURL = replaceChunks(tURL, "\user_name", tName);
              if (tSession.exists("user_checksum")) {
                tURL = `${tURL}&sum=${urlEncode(tSession.GET("user_checksum"))}`;
              }
            }
            executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
            openNetPage(tURL);
          }
          return 1;
        case "close":
        case "help_ok":
        case "help_choise_cancel":
          return this.removeDialog(tWndID, this.pWindowList);
        case "help_tutorial_link":
          executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          openNetPage(getText("reg_tutorial_url"));
          break;
        case "help_callforhelp_textlink":
          this.openHelpChoiceWindow();
          break;
        case "help_choise_ok":
          this.helpChoiceMade();
          break;
        case "help_restart_tutorial":
          executeMessage(Symbol.for("restart_tutorial"));
          return this.removeDialog(tWndID, this.pWindowList);
        default:
          if (stringp(tElemID)) {
            if (tElemID.char[`1..11`] == "help_radio_") {
              this.helpRadioClicked(tElemID.char[12], tWndID);
            }
          }
          break;
      }
    }
  }

  eventProcCallHelp(tEvent, tElemID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "close":
        case "callhelp_cancel":
        case "alertsent_ok":
        case "pending_cfh_cancel":
          return this.removeDialog(tWndID, this.pWindowList);
        case "callhelp_send":
          let tWndObj = getWindow(tWndID);
          executeMessage(Symbol.for("sendCallForHelp"), tWndObj.getElement("callhelp_text").getText(), this.pCfhType);
          return 1;
        case "pending_cfh_delete":
          let tConnection = getConnection(getVariable("connection.info.id"));
          if (!tConnection) {
            error(this, "Connection not found.", Symbol.for("showDialog"), Symbol.for("major"));
          }
          tConnection.send("DELETE_PENDING_CALLS_FOR_HELP");
          break;
      }
    }
  }

  eventProcBan(tEvent, tElemID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "alert_ok":
        case "close":
          if (variableExists("use.sso.ticket")) {
            if (getVariable("use.sso.ticket") == "1") {
              openNetPage(getText("url_logged_out"), "self");
              return 1;
            }
          }
          this.removeDialog(tWndID, this.pAlertList);
          resetClient();
          break;
      }
    }
  }
}
