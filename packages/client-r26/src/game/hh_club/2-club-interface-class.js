export default class {
  pDialogId;
  pGiftDialogID;
  pConnectionId;
  pChosenLength;
  pSubscribeFromHotel;

  construct() {
    this.pGiftDialogID = "window_clubgift";
    this.pDialogId = "window_clubinfo1";
    this.pConnectionId = getVariable("connection.info.id");
    this.pChosenLength = 1;
    if (variableExists("club.subscription.disabled")) {
      this.pSubscribeFromHotel = !(getVariable("club.subscription.disabled") > 0);
    } else {
      this.pSubscribeFromHotel = 1;
    }
    registerMessage(Symbol.for("show_clubinfo"), this.getID(), Symbol.for("show_clubinfo"));
    registerMessage(Symbol.for("notify"), this.getID(), Symbol.for("notify"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("show_clubinfo"), this.getID());
    unregisterMessage(Symbol.for("notify"), this.getID());
    return 1;
  }

  show_giftinfo() {
    if (windowExists(this.pGiftDialogID)) {
      return 0;
    }
    this.setupWindow(this.pGiftDialogID, Symbol.for("modal"));
    tWndObj = getWindow(this.pGiftDialogID);
    if (!objectp(tWndObj)) {
      return 0;
    }
    tWndObj.merge("habbo_club_confirm.window");
    tWndObj.center();
    tWndObj.getElement("club_confirm_title").setText(getText("club_confirm_gift_title"));
    tWndObj.getElement("club_confirm_text").setText(getText("club_confirm_gift_text"));
    tWndObj.registerProcedure(Symbol.for("eventProcGiftDialogMousedown"), this.getID(), Symbol.for("mouseDown"));
    return 1;
  }

  notify(ttype) {
    switch (ttype) {
      case 1001:
        executeMessage(Symbol.for("alert"), propList("Msg", getText("epsnotify_1001")));
        if (connectionExists(this.pConnectionId)) {
          removeConnection(this.pConnectionId);
        }
        break;
      case 551:
        executeMessage(Symbol.for("alert"), propList("Msg", getText("club_extend_failed")));
        break;
      case 552:
        executeMessage(Symbol.for("alert"), propList("Msg", getText("Alert_no_credits")));
        break;
    }
  }

  setupEndedWindow() {
    tClubInfo = this.getComponent().getStatus();
    tWndObj = getWindow(this.pDialogId);
    if (!objectp(tWndObj)) {
      return 0;
    }
    tElapsed = tClubInfo[Symbol.for("ElapsedPeriods")];
    tElem = tWndObj.getElement("club_elapsed_periods");
    tElem.setText(string(tElapsed));
    tWndObj.registerProcedure(Symbol.for("eventProcDialogMousedown"), this.getID(), Symbol.for("mouseDown"));
    return 1;
  }

  setupStatusWindow(ttype) {
    tClubInfo = this.getComponent().getStatus();
    tWndObj = getWindow(this.pDialogId);
    if (!objectp(tWndObj)) {
      return 0;
    }
    tDaysLeft = tClubInfo[Symbol.for("daysLeft")];
    tElapsed = tClubInfo[Symbol.for("ElapsedPeriods")];
    tPrepaid = tClubInfo[Symbol.for("PrepaidPeriods")];
    tArrowElem = tWndObj.getElement("club_arrow");
    tLocH = tArrowElem.getProperty(Symbol.for("locH"));
    tLocH = tLocH + ((31 - tDaysLeft) * 5);
    tArrowElem.setProperty(Symbol.for("locH"), tLocH);
    tElem = tWndObj.getElement("club_elapsed_periods");
    tElem.setText(string(tElapsed));
    if (ttype == Symbol.for("FirstTimer")) {
      tElem = tWndObj.getElement("club_status_title");
      tElem.setText(getText("club_thanks_title"));
      tElem = tWndObj.getElement("club_status_text");
      tElem.setText(getText("club_thanks_text"));
    }
    if (tClubInfo[Symbol.for("PrepaidPeriods")] == -1) {
      tElem = tWndObj.getElement("club_button_extend");
      tElem.hide();
    } else {
      tElem = tWndObj.getElement("club_isp_change");
      tElem.hide();
      tElem = tWndObj.getElement("club_isp_icon");
      tElem.hide();
      tElem = tWndObj.getElement("club_prepaid_periods");
      tElem.setText(string(tClubInfo[Symbol.for("PrepaidPeriods")]));
    }
    if (tElapsed == 0) {
      tElem = tWndObj.getElement("club_elapsed_periods");
      tElem.hide();
      tElem = tWndObj.getElement("club_elapsed");
      tElem.hide();
    }
    if (tPrepaid == 0) {
      tElem = tWndObj.getElement("club_prepaid_periods");
      tElem.hide();
      tElem = tWndObj.getElement("club_prepaid");
      tElem.hide();
    }
    if (!(getText("club_info_url").startsWith("http"))) {
      getWindow(this.pDialogId).getElement("club_general_infolink").setProperty(Symbol.for("visible"), 0);
    }
    tWndObj.registerProcedure(Symbol.for("eventProcDialogMousedown"), this.getID(), Symbol.for("mouseDown"));
    return 1;
  }

  changeTextsToExtend() {
    tWndObj = getWindow(this.pDialogId);
    if (!objectp(tWndObj)) {
      return 0;
    }
    tHeaderText = getText("club_extend_title");
    tText = getText("club_extend_text");
    tWndObj.getElement("club_intro_header").setText(tHeaderText);
    tWndObj.getElement("club_intro_text").setText(tText);
    return 1;
  }

  setupBuyWindow() {
    if (!(getText("club_info_url").startsWith("http"))) {
      getWindow(this.pDialogId).getElement("club_intro_link").setProperty(Symbol.for("visible"), 0);
    }
    getWindow(this.pDialogId).registerProcedure(Symbol.for("eventProcDialogMousedown"), this.getID(), Symbol.for("mouseDown"));
  }

  replaceCreditsText() {
    tCredits = getObject(Symbol.for("session")).GET("user_walletbalance");
    tWndObj = getWindow(this.pDialogId);
    tText = getText(`club_confirm_text${this.pChosenLength}`);
    tText = replaceChunks(tText, "%credits%", string(tCredits));
    tWndObj.getElement("club_confirm_text").setText(tText);
    return 1;
  }

  setupWindow(tWindowID, ttype) {
    if (windowExists(tWindowID)) {
      removeWindow(tWindowID);
    }
    if (ttype == Symbol.for("modal")) {
      if (!createWindow(tWindowID, VOID, 0, 0, Symbol.for("modal"))) {
        return 0;
      }
    } else {
      if (!createWindow(tWindowID)) {
        return 0;
      }
    }
    tWndObj = getWindow(tWindowID);
    tWndObj.setProperty(Symbol.for("title"), getText("club_habbo.window.title"));
    if (!tWndObj.merge("habbo_full.window")) {
      return tWndObj.close();
    }
    return 1;
  }

  show_clubinfo() {
    tClubInfo = this.getComponent().getStatus();
    if (tClubInfo != 0) {
      if (!windowExists(this.pDialogId)) {
        tList = propList();
        tList["showDialog"] = 1;
        executeMessage(Symbol.for("getHotelClosingStatus"), tList);
        if (tList["retval"] == 1) {
          return 1;
        }
        this.setupWindow(this.pDialogId);
        tWndObj = getWindow(this.pDialogId);
        if ((tClubInfo[Symbol.for("daysLeft")] == 0) && (tClubInfo[Symbol.for("ElapsedPeriods")] == 0)) {
          if (!this.pSubscribeFromHotel) {
            this.openBuyInHabboWeb();
            tWndObj.close();
            return 1;
          }
          if (!(getText("club_paybycash_url").startsWith("http"))) {
            tWndObj.merge("habbo_club_buy.window");
          } else {
            tWndObj.merge("habbo_club_buy_jp.window");
          }
          this.setupBuyWindow("intro");
        } else {
          if ((tClubInfo[Symbol.for("daysLeft")] == 0) && (tClubInfo[Symbol.for("ElapsedPeriods")] > 0)) {
            tWndObj.merge("habbo_club_ended.window");
            tWndObj.center();
            this.setupEndedWindow();
          } else {
            tWndObj.merge("habbo_club_status.window");
            this.setupStatusWindow();
          }
        }
        tWndObj.center();
      } else {
        removeWindow(this.pDialogId);
      }
    }
    return 1;
  }

  updateClubStatus(tStatus, tResponseFlag, tOldClubStatus) {
    if (tResponseFlag == 2) {
      this.setupWindow(this.pDialogId);
      tWndObj = getWindow(this.pDialogId);
      if (!objectp(tWndObj)) {
        return 0;
      }
      tWndObj.merge("habbo_club_status.window");
      tWndObj.center();
      if ((tOldClubStatus[Symbol.for("ElapsedPeriods")] == 0) && (tOldClubStatus[Symbol.for("daysLeft")] == 0)) {
        this.setupStatusWindow(Symbol.for("FirstTimer"));
      } else {
        this.setupStatusWindow(Symbol.for("BeenHcBefore"));
      }
    }
    if (tResponseFlag == 3) {
      this.setupWindow(this.pDialogId, Symbol.for("modal"));
      tWndObj = getWindow(this.pDialogId);
      tWndObj.merge("habbo_club_ended.window");
      tWndObj.center();
      this.setupEndedWindow();
    }
    return 1;
  }

  openBuyInHabboWeb() {
    if (getText("club_buy_url") == "club_buy_url") {
      return error(this, "key club_buy_url not defined!", Symbol.for("eventProcDialogMousedown"), Symbol.for("major"));
    } else {
      executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
      openNetPage("club_buy_url");
    }
    return 1;
  }

  eventProcDialogMousedown(tEvent, tSprID, tParam) {
    tClubInfo = this.getComponent().getStatus();
    switch (tSprID) {
      case "club_button_extend":
        tWndObj = getWindow(this.pDialogId);
        if (!objectp(tWndObj)) {
          return 0;
        }
        tWndObj.unmerge();
        if (!this.pSubscribeFromHotel) {
          this.openBuyInHabboWeb();
          tWndObj.close();
          return 1;
        }
        if (getText("club_paybycash_url").startsWith("http")) {
          tWndObj.merge("habbo_club_buy_jp.window");
        } else {
          tWndObj.merge("habbo_club_buy.window");
        }
        this.changeTextsToExtend();
        break;
      case "club_isp_change":
        tSession = getObject(Symbol.for("session"));
        tURL = getText("club_change_url");
        tURL = `${tURL}${urlEncode(tSession.GET("user_name"))}`;
        if (tSession.exists("user_checksum")) {
          tURL = `${tURL}${"&sum="}${urlEncode(tSession.GET("user_checksum"))}`;
        }
        executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
        openNetPage(tURL);
        break;
      case "club_intro_link":
      case "club_general_infolink":
        executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
        openNetPage("club_info_url");
        break;
      case "club_isp_buy":
        tSession = getObject(Symbol.for("session"));
        tURL = getText("club_paybycash_url");
        tURL = `${tURL}${urlEncode(tSession.GET("user_name"))}`;
        if (tSession.exists("user_checksum")) {
          tURL = `${tURL}${"&sum="}${urlEncode(tSession.GET("user_checksum"))}`;
        }
        executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
        openNetPage(tURL, "_new");
        break;
      case "club_button_1_period":
        tWndObj = getWindow(this.pDialogId);
        if (!objectp(tWndObj)) {
          return 0;
        }
        tWndObj.unmerge();
        tWndObj.merge("habbo_club_confirm.window");
        this.pChosenLength = 1;
        this.replaceCreditsText();
        break;
      case "club_button_2_period":
        tWndObj = getWindow(this.pDialogId);
        if (!objectp(tWndObj)) {
          return 0;
        }
        tWndObj.unmerge();
        tWndObj.merge("habbo_club_confirm.window");
        this.pChosenLength = 2;
        this.replaceCreditsText();
        break;
      case "club_button_3_period":
        tWndObj = getWindow(this.pDialogId);
        if (!objectp(tWndObj)) {
          return 0;
        }
        tWndObj.unmerge();
        tWndObj.merge("habbo_club_confirm.window");
        this.pChosenLength = 3;
        this.replaceCreditsText();
        break;
      case "club_confirm_ok":
        this.getComponent().subscribe(this.pChosenLength);
        removeWindow(this.pDialogId);
        break;
      case "club_confirm_cancel":
      case "club_button_close":
      case "close":
        removeWindow(this.pDialogId);
        break;
    }
    return 1;
  }

  eventProcGiftDialogMousedown(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "club_confirm_ok":
        removeWindow(this.pGiftDialogID);
        this.getComponent().acceptGift();
        break;
      case "club_confirm_cancel":
      case "club_button_close":
        removeWindow(this.pGiftDialogID);
        this.getComponent().rejectGift();
        break;
      case "close":
        this.getComponent().resetGiftList();
        break;
    }
    return 1;
  }
}
