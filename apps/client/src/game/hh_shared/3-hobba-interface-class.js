export default class {
  pCryWindowID;
  pAlertSpr;
  pAlertTimer;
  pCurrCryID;
  pCurrCryNum;
  pCurrCryData;
  pModtoolButtonSpr;
  pModtoolWindowID;
  pModToolCheckBoxes;
  pModToolMode;
  pCryWndMode;
  pButtonLocH;
  pAudioAlertCheckBox;

  construct() {
    this.pCryWindowID = getText("hobba_alert");
    this.pModtoolWindowID = getText("modtool_header");
    this.pAlertSpr = VOID;
    this.pModtoolButtonSpr = VOID;
    this.pAlertTimer = 0;
    this.pCurrCryID = EMPTY;
    this.pCurrCryNum = 0;
    this.pCurrCryData = propList();
    this.pModToolCheckBoxes = list(0, 0);
    this.pModToolMode = "closed";
    this.pCryWndMode = "closed";
    this.pButtonLocH = 5;
    this.pAudioAlertCheckBox = 1;
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("showModtoolButton"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("hideModtoolButton"));
    registerMessage(Symbol.for("userClicked"), this.getID(), Symbol.for("userClicked"));
    registerMessage(Symbol.for("gamesystem_constructed"), this.getID(), Symbol.for("hideModtoolButton"));
    registerMessage(Symbol.for("gamesystem_deconstructed"), this.getID(), Symbol.for("hideModtoolButton"));
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    if (windowExists(this.pCryWindowID)) {
      removeWindow(this.pCryWindowID);
    }
    if (this.pAlertSpr.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pAlertSpr.spriteNum);
    }
    if (this.pModtoolButtonSpr.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pModtoolButtonSpr.spriteNum);
    }
    this.pCurrCryID = EMPTY;
    this.pCurrCryNum = 0;
    this.pCurrCryData = propList();
    unregisterMessage(Symbol.for("userlogin"), this.getID());
    unregisterMessage(Symbol.for("userClicked"), this.getID());
    unregisterMessage(Symbol.for("gamesystem_constructed"), this.getID());
    unregisterMessage(Symbol.for("gamesystem_deconstructed"), this.getID());
    return 1;
  }

  ShowAlert() {
    if (this.pAudioAlertCheckBox) {
      playSound("sound_cfh_received", Symbol.for("cut"));
    }
    if (this.pAlertSpr.ilk != Symbol.for("sprite")) {
      this.pAlertSpr = sprite(reserveSprite(this.getID()));
      if (this.pAlertSpr == sprite(0)) {
        return 0;
      }
      this.pAlertSpr.memberNum = getmemnum("hobba_alert_0");
      this.pAlertSpr.ink = 8;
      this.pAlertSpr.loc = point(this.buttonLocH(2), 5);
      this.pAlertSpr.locZ = 200000000;
      setEventBroker(this.pAlertSpr.spriteNum, `${this.getID()}_alert_spr`);
      this.pAlertSpr.registerProcedure(Symbol.for("eventProcAlert"), this.getID(), Symbol.for("mouseUp"));
      this.pAlertSpr.setcursor("cursor.finger");
      this.pAlertTimer = 0;
    }
    return receiveUpdate(this.getID());
  }

  showModtoolButton() {
    if (!listp(getObject(Symbol.for("session")).GET("user_rights"))) {
      return 0;
    }
    if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_kick") == 0) {
      return 1;
    }
    if (this.pModtoolButtonSpr.ilk != Symbol.for("sprite")) {
      this.pModtoolButtonSpr = sprite(reserveSprite(this.getID()));
      if (this.pModtoolButtonSpr == sprite(0)) {
        return 0;
      }
      this.pModtoolButtonSpr.memberNum = getmemnum("mod_tool_icon");
      this.pModtoolButtonSpr.ink = 8;
      this.pModtoolButtonSpr.loc = point(this.buttonLocH(1), 5);
      this.pModtoolButtonSpr.locZ = 200000000;
      setEventBroker(this.pModtoolButtonSpr.spriteNum, `${this.getID()}_modtool_spr`);
      this.pModtoolButtonSpr.registerProcedure(Symbol.for("eventProcModToolButton"), this.getID(), Symbol.for("mouseUp"));
      this.pModtoolButtonSpr.setcursor("cursor.finger");
      this.pAlertTimer = 0;
    }
    return 1;
  }

  hideModtoolButton() {
    if (voidp(this.pModtoolButtonSpr)) {
      return 0;
    }
    if (this.pModtoolButtonSpr.ilk == Symbol.for("sprite")) {
      if (this.pModtoolButtonSpr == sprite(0)) {
        return 0;
      }
      this.pModtoolButtonSpr.setcursor(Symbol.for("arrow"));
      this.pModtoolButtonSpr.removeProcedure(Symbol.for("mouseUp"));
      removeEventBroker(this.pModtoolButtonSpr.spriteNum);
      releaseSprite(this.pModtoolButtonSpr.spriteNum);
      this.pModtoolButtonSpr = VOID;
    }
  }

  hideAlert() {
    if (ilk(this.pAlertSpr, Symbol.for("sprite"))) {
      releaseSprite(this.pAlertSpr.spriteNum);
      this.pAlertSpr = VOID;
    }
    return removeUpdate(this.getID());
  }

  stopAlert() {
    if (ilk(this.pAlertSpr, Symbol.for("sprite"))) {
      this.pAlertSpr.memberNum = getmemnum("hobba_alert_0");
      removeUpdate(this.getID());
    }
  }

  showCryWnd() {
    if (windowExists(this.pCryWindowID)) {
      let tWndObj = getWindow(this.pCryWindowID);
      let tCryDB = this.getComponent().getCryDataBase();
      this.pCurrCryNum = tCryDB.count;
    } else {
      createWindow(this.pCryWindowID, "habbo_basic.window");
      let tWndObj = getWindow(this.pCryWindowID);
      tWndObj.merge("habbo_hobba_alert.window");
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcCryWnd"), this.getID(), Symbol.for("mouseUp"));
      tWndObj.registerProcedure(Symbol.for("eventProcCryWnd"), this.getID(), Symbol.for("keyDown"));
      let tCryDB = this.getComponent().getCryDataBase();
      if ((this.pCurrCryNum < 1) || (this.pCurrCryNum > tCryDB.count)) {
        this.pCurrCryNum = tCryDB.count;
      }
    }
    this.pCryWndMode = "browse";
    if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_see_chat_log_link") == 0) {
      getWindow(this.pCryWindowID).getElement("hobba_seelog").hide();
    }
    return this.updateCryData(this.pCurrCryNum);
  }

  hideCryWnd() {
    this.pCurrCryData = propList();
    if (windowExists(this.pCryWindowID)) {
      this.pCryWndMode = "closed";
      return removeWindow(this.pCryWindowID);
    } else {
      return 0;
    }
  }

  hideModToolWnd() {
    if (windowExists(this.pModtoolWindowID)) {
      return removeWindow(this.pModtoolWindowID);
    } else {
      return 0;
    }
  }

  updateCryWnd() {
    this.updateCryData(this.pCurrCryID);
    return 1;
  }

  showModToolWnd() {
    let tWndObj;
    if (windowExists(this.pModtoolWindowID)) {
      tWndObj = getWindow(this.pModtoolWindowID);
      tWndObj.unmerge();
    } else {
      createWindow(this.pModtoolWindowID, "habbo_full.window");
      tWndObj = getWindow(this.pModtoolWindowID);
      if (tWndObj == 0) {
        return 0;
      }
    }
    if (!tWndObj.merge("habbo_modtool_main.window")) {
      return removeWindow(this.pModtoolWindowID);
    }
    this.initAudioAlertCheckBox();
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcModToolWnd"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.registerProcedure(Symbol.for("eventProcModToolWnd"), this.getID(), Symbol.for("keyDown"));
    return 1;
  }

  buttonLocH(tPos) {
    if (tPos == 1) {
      return 75;
    } else {
      if (tPos == 2) {
        return 105;
      }
    }
    return 5;
  }

  userClicked(tName) {
    if (!windowExists(this.pModtoolWindowID)) {
      return 1;
    }
    if (tName == getObject(Symbol.for("session")).GET("user_name")) {
      return 1;
    }
    const tWndObj = getWindow(this.pModtoolWindowID);
    if (tWndObj.elementExists("modtool_name")) {
      tWndObj.getElement("modtool_name").setText(tName);
    }
    return 1;
  }

  changeModtoolView(tWndName, tAction) {
    this.pModToolMode = tAction;
    let tWndObj;
    if (windowExists(this.pModtoolWindowID)) {
      tWndObj = getWindow(this.pModtoolWindowID);
      tWndObj.unmerge();
    } else {
      createWindow(this.pModtoolWindowID, "habbo_full.window");
      if (!windowExists(this.pModtoolWindowID)) {
        return 0;
      }
      tWndObj = getWindow(this.pModtoolWindowID);
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcModToolWnd"), this.getID(), Symbol.for("mouseUp"));
      tWndObj.registerProcedure(Symbol.for("eventProcModToolWnd"), this.getID(), Symbol.for("keyDown"));
    }
    let tHeader = EMPTY;
    switch (tWndName) {
      case "user":
        if (!tWndObj.merge("habbo_modtool_user.window")) {
          return removeWindow(this.pModtoolWindowID);
        }
        switch (tAction) {
          case "kick":
            tHeader = getText("modtool_kickuser");
            break;
          case "alert":
            tHeader = getText("modtool_alertuser");
            break;
          case "ban":
            tHeader = getText("modtool_banuser");
            break;
        }
        tWndObj.getElement("modtool_subtitle").setText(getText("modtool_message"));
        break;
      case "room":
        if (!tWndObj.merge("habbo_modtool_room.window")) {
          return removeWindow(this.pModtoolWindowID);
        }
        switch (tAction) {
          case "roomalert":
            tHeader = getText("modtool_roomalert");
            break;
          case "roomkick":
            tHeader = getText("modtool_roomkick");
            break;
        }
        break;
      case "ban":
        tWndObj.merge("habbo_modtool_ban.window");
        this.InitializeBanCheckBoxes();
        this.initializeBanDropDown();
        break;
    }
    if (tHeader != EMPTY) {
      tWndObj.getElement("modtool_title").setText(tHeader);
    }
    return 1;
  }

  openCryReplyWindow() {
    if (!windowExists(this.pCryWindowID)) {
      return 0;
    }
    const tWndObj = getWindow(this.pCryWindowID);
    this.pCryWndMode = "reply";
    tWndObj.unmerge();
    if (!tWndObj.merge("habbo_hobba_reply.window")) {
      return removeWindow(this.pCryWindowID);
    }
    const tName = this.pCurrCryData[Symbol.for("sender")];
    const tMsg = this.pCurrCryData[Symbol.for("Msg")];
    tWndObj.getElement("hobba_reply_header").setText(`${getText("hobba_reply_cfh")} ${tName}`);
    tWndObj.getElement("hobba_reply_text").setText(tMsg);
    return 1;
  }

  update() {
    this.pAlertTimer = (this.pAlertTimer + 1) % 4;
    if (this.pAlertTimer != 0) {
      return 1;
    }
    if (this.pAlertSpr.ilk != Symbol.for("sprite")) {
      return removeUpdate(this.getID());
    }
    const tName = this.pAlertSpr.member.name;
    const tNum = integer(tName.char[length(tName)]);
    tName = tName.char[`1..${length(tName) - 1}`] + not tNum;
    this.pAlertSpr.memberNum = getmemnum(tName);
    return 1;
  }

  updateCryData(tCryNumOrID) {
    const tCryDB = this.getComponent().getCryDataBase();
    const tCryCount = tCryDB.count;
    if (tCryCount == 0) {
      this.hideAlert();
      this.hideCryWnd();
      return 1;
    }
    let tUnpickedFound = 0;
    for (const tCry in tCryDB) {
      if (tCry[Symbol.for("picker")] == EMPTY) {
        tUnpickedFound = 1;
        break;
      }
    }
    if (!tUnpickedFound) {
      this.stopAlert();
    }
    if (!windowExists(this.pCryWindowID)) {
      return 0;
    }
    let tCryID;
    if (stringp(tCryNumOrID)) {
      tCryID = tCryNumOrID;
      this.pCurrCryData = tCryDB[tCryID];
      for (let i = 1; i <= tCryCount; i++) {
        if (tCryDB.getPropAt(i) == tCryID) {
          this.pCurrCryNum = i;
          break;
        }
      }
    } else {
      if (integerp(tCryNumOrID)) {
        if ((tCryNumOrID < 1) || (tCryNumOrID > tCryCount)) {
          return 0;
        }
        tCryID = tCryDB.getPropAt(tCryNumOrID);
        this.pCurrCryData = tCryDB[tCryID];
        this.pCurrCryNum = tCryNumOrID;
      } else {
        return error(this, `String or integer expected: ${tCryNumOrID}`, Symbol.for("updateCryData"), Symbol.for("major"));
      }
    }
    if (voidp(this.pCurrCryData)) {
      let tNewID;
      if ((this.pCurrCryNum > 0) && (this.pCurrCryNum <= count(tCryDB))) {
        tNewID = tCryDB.getPropAt(this.pCurrCryNum);
      } else {
        tNewID = tCryDB.getPropAt(count(tCryDB));
      }
      return this.updateCryData(tNewID);
    } else {
      this.pCurrCryID = tCryID;
    }
    if (this.pCryWndMode != "browse") {
      return 1;
    }
    this.redrawCryWindow();
    return 1;
  }

  redrawCryWindow() {
    const tCryDB = this.getComponent().getCryDataBase();
    const tCryCount = tCryDB.count;
    const tName = this.pCurrCryData[Symbol.for("sender")];
    const tPlace = this.pCurrCryData[Symbol.for("roomname")];
    const tMsg = this.pCurrCryData[Symbol.for("Msg")];
    const tTime = this.pCurrCryData[Symbol.for("time")];
    const tCategory = this.pCurrCryData[Symbol.for("category")];
    const tRoomID = this.pCurrCryData[Symbol.for("room_id")];
    const ttype = this.pCurrCryData[Symbol.for("type")];
    let tShowRoomID;
    if ((tRoomID != VOID) && (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_see_flat_ids") != 0)) {
      tShowRoomID = `(id: ${tRoomID})`;
    } else {
      tShowRoomID = EMPTY;
    }
    const tWndObj = getWindow(this.pCryWindowID);
    const tNeededElements = ["hobba_header", "hobba_change_cfh_type", "hobba_pickedby", "hobba_cry_text", "page_num"];
    for (const tElem of tNeededElements) {
      if (!tWndObj.elementExists(tElem)) {
        return 0;
      }
    }
    if ((tCategory == 1) || (tCategory == 2)) {
      tWndObj.getElement("hobba_header").setProperty(Symbol.for("color"), rgb(0, 0, 0));
      tWndObj.getElement("hobba_header").setText(`${getText("hobba_emergency_help")} ${tName}`);
      tWndObj.getElement("hobba_change_cfh_type").setText(getText("hobba_mark_normal"));
    } else {
      if (tCategory == 3) {
        tWndObj.getElement("hobba_header").setProperty(Symbol.for("color"), rgb(255, 0, 0));
        tWndObj.getElement("hobba_header").setText(`${getText("hobba_cryforhelp")} ${tName}`);
        tWndObj.getElement("hobba_change_cfh_type").setText(getText("hobba_mark_emergency"));
      } else {
        if (tCategory == 4) {
          tWndObj.getElement("hobba_header").setProperty(Symbol.for("color"), rgb(255, 0, 0));
          tWndObj.getElement("hobba_header").setText(`${getText("hobba_im_cryforhelp")} ${tName}`);
          tWndObj.getElement("hobba_change_cfh_type").setText(getText("hobba_mark_emergency"));
        }
      }
    }
    if ((tCategory == 3) || (tCategory == 4)) {
      tWndObj.getElement("hobba_change_cfh_type").deactivate();
    } else {
      tWndObj.getElement("hobba_change_cfh_type").Activate();
    }
    const tGoButton = tWndObj.getElement("hobba_pickup_go");
    if (ttype == Symbol.for("instantMessage")) {
      tGoButton.deactivate();
    } else {
      tGoButton.Activate();
    }
    tWndObj.getElement("hobba_cry_text").setText(`${tPlace} ${tShowRoomID}${RETURN}${RETURN}${tMsg}`);
    tWndObj.getElement("page_num").setText(`${this.pCurrCryNum}/${tCryCount}`);
    if (this.pCurrCryData.picker == EMPTY) {
      tWndObj.getElement("hobba_pickedby").setText(tTime);
    } else {
      tWndObj.getElement("hobba_pickedby").setText(`${getText("hobba_pickedby")} ${this.pCurrCryData.picker}`);
    }
  }

  initAudioAlertCheckBox() {
    if (!windowExists(this.pModtoolWindowID)) {
      return 0;
    }
    const tWndObj = getWindow(this.pModtoolWindowID);
    if (!tWndObj.elementExists("modtool_checkbox_audioalert")) {
      return 0;
    }
    if (!memberExists("button.checkbox.off")) {
      return 0;
    }
    if (!memberExists("button.checkbox.on")) {
      return 0;
    }
    const tOffImg = getMember("button.checkbox.off").image;
    const tOnImg = getMember("button.checkbox.on").image;
    if (this.pAudioAlertCheckBox) {
      tWndObj.getElement("modtool_checkbox_audioalert").feedImage(tOnImg);
    } else {
      tWndObj.getElement("modtool_checkbox_audioalert").feedImage(tOffImg);
    }
  }

  InitializeBanCheckBoxes() {
    if (!windowExists(this.pModtoolWindowID)) {
      return 0;
    }
    const tWndObj = getWindow(this.pModtoolWindowID);
    if (!tWndObj.elementExists("modtool_checkbox_ip")) {
      return 0;
    }
    if (!memberExists("button.checkbox.off")) {
      return 0;
    }
    const tOffImg = getMember("button.checkbox.off").image;
    tWndObj.getElement("modtool_checkbox_ip").feedImage(tOffImg);
    tWndObj.getElement("modtool_checkbox_computer").feedImage(tOffImg);
    this.pModToolCheckBoxes = list(0, 0);
    return 1;
  }

  initializeBanDropDown() {
    const tWndObj = getWindow(this.pModtoolWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (!tWndObj.elementExists("ban_length_menu")) {
      return 0;
    }
    const tDropDown = tWndObj.getElement("ban_length_menu");
    const tHours = getText("modtool_hours");
    const tDays = getText("modtool_days");
    const tVisOptions = [`2 ${tHours}`, `4 ${tHours}`, `12 ${tHours}`, `24 ${tHours}`, `2 ${tDays}`, `3 ${tDays}`, `7 ${tDays}`, `14 ${tDays}`];
    tVisOptions.add(`21 ${tDays}`);
    tVisOptions.add(`30 ${tDays}`);
    tVisOptions.add(`60 ${tDays}`);
    tVisOptions.add(`365 ${tDays}`);
    tVisOptions.add(`730 ${tDays}`);
    tVisOptions.add(`4167 ${tDays}`);
    const tBanLengths = list(2, 4, 12, 24, 2 * 24, 3 * 24, 7 * 24, 14 * 24, 21 * 24, 30 * 24, 60 * 24, 365 * 24, 730 * 24, 100000);
    tDropDown.updateData(tVisOptions, tBanLengths, 1);
    tDropDown.setOrdering(0);
    return 1;
  }

  checkBoxClicked(ttype) {
    if (!windowExists(this.pModtoolWindowID)) {
      return 0;
    }
    if (!memberExists("button.checkbox.on")) {
      return 0;
    }
    const tMemOn = getMember("button.checkbox.on");
    const tMemOff = getMember("button.checkbox.off");
    if ((tMemOn.type != Symbol.for("bitmap")) || (tMemOff.type != Symbol.for("bitmap"))) {
      return 0;
    }
    const tWndObj = getWindow(this.pModtoolWindowID);
    switch (ttype) {
      case "ip":
        this.pModToolCheckBoxes[1] = not this.pModToolCheckBoxes[1];
        if (this.pModToolCheckBoxes[1]) {
          tWndObj.getElement("modtool_checkbox_ip").feedImage(tMemOn.image);
        } else {
          tWndObj.getElement("modtool_checkbox_ip").feedImage(tMemOff.image);
        }
        break;
      case "computer":
        this.pModToolCheckBoxes[2] = not this.pModToolCheckBoxes[2];
        if (this.pModToolCheckBoxes[2]) {
          tWndObj.getElement("modtool_checkbox_computer").feedImage(tMemOn.image);
        } else {
          tWndObj.getElement("modtool_checkbox_computer").feedImage(tMemOff.image);
        }
        break;
      case "audioalert":
        this.pAudioAlertCheckBox = not this.pAudioAlertCheckBox;
        if (this.pAudioAlertCheckBox) {
          tWndObj.getElement("modtool_checkbox_audioalert").feedImage(tMemOn.image);
        } else {
          tWndObj.getElement("modtool_checkbox_audioalert").feedImage(tMemOff.image);
        }
        break;
    }
    return 1;
  }

  sendModCommand() {
    if (!windowExists(this.pModtoolWindowID)) {
      return 1;
    }
    const tWndObj = getWindow(this.pModtoolWindowID);
    let tCommandString = EMPTY;
    let tName, tReason, tExtrainfo;
    if (tWndObj.elementExists("modtool_name")) {
      tName = tWndObj.getElement("modtool_name").getText();
    }
    if (tWndObj.elementExists("modtool_reason")) {
      tReason = tWndObj.getElement("modtool_reason").getText();
    }
    if (tWndObj.elementExists("modtool_extrainfo")) {
      tExtrainfo = tWndObj.getElement("modtool_extrainfo").getText();
    }
    let tTargetType, tActionType, tHours, tBanIP, tBanComputer, tStruct;
    switch (this.pModToolMode) {
      case "ban":
        if (!tWndObj.elementExists("ban_length_menu")) {
          return 0;
        }
        tHours = tWndObj.getElement("ban_length_menu").getSelection();
        tBanIP = this.pModToolCheckBoxes[1];
        tBanComputer = this.pModToolCheckBoxes[2];
        break;
      case "alert":
        tTargetType = 0;
        tActionType = 0;
        break;
      case "kick":
        tTargetType = 0;
        tActionType = 1;
        break;
      case "roomkick":
        tTargetType = 1;
        tActionType = 1;
        break;
      case "roomalert":
        tTargetType = 1;
        tActionType = 0;
        break;
    }
    if (this.pModToolMode == "ban") {
      tStruct = propList("integer", 0, "integer", 2, "string", tReason, "string", tExtrainfo, "string", tName, "integer", tHours, "integer", tBanComputer, "integer", tBanIP);
    } else {
      if (tTargetType == 0) {
        tStruct = propList("integer", tTargetType, "integer", tActionType, "string", tReason, "string", tExtrainfo, "string", tName);
      } else {
        tStruct = propList("integer", tTargetType, "integer", tActionType, "string", tReason, "string", tExtrainfo);
      }
    }
    getConnection(getVariable("connection.info.id")).send("MODERATIONACTION", tStruct);
    return this.showModToolWnd();
  }

  eventProcCryWnd(tEvent, tElemID, tParam) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "close":
          return this.hideCryWnd();
        case "hobba_prev":
          return this.updateCryData(this.pCurrCryNum - 1);
        case "hobba_next":
          return this.updateCryData(this.pCurrCryNum + 1);
        case "hobba_seelog": {
          const tUrlPrefix = getText("chatlog.url");
          if (tUrlPrefix contains "http") {
            executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
            return openNetPage(`${tUrlPrefix}${this.pCurrCryData[Symbol.for("url_id")]}`, "_new");
          } else {
            return error(this, `CFH log url prefix not defined or illegal: ${tUrlPrefix}`, Symbol.for("eventProcCryWnd"), Symbol.for("minor"));
          }
        }
        case "hobba_pickup":
          return this.getComponent().send_cryPick(this.pCurrCryID, 0);
        case "hobba_pickup_go":
          return this.getComponent().send_cryPick(this.pCurrCryID, 1);
        case "hobba_pickandreply":
          this.openCryReplyWindow();
          return this.getComponent().send_cryPick(this.pCurrCryID, 0);
        case "hobba_reply_button": {
          const tText = getWindow(this.pCryWindowID).getElement("hobba_reply_field").getText();
          this.getComponent().send_CfhReply(this.pCurrCryID, tText);
          this.hideCryWnd();
          return this.showCryWnd();
        }
        case "hobba_reply_cancel":
          this.hideCryWnd();
          return this.showCryWnd();
        case "hobba_change_cfh_type":
          return this.getComponent().send_changeCfhType(this.pCurrCryID, this.pCurrCryData[Symbol.for("category")]);
        default:
          return 0;
      }
    } else {
      if (tEvent == Symbol.for("keyDown")) {
        switch (tElemID) {
          case "hobba_reply_field": {
            const tKeyCode = the.keyCode;
            if (!((tKeyCode == 51) || (tKeyCode == 117))) {
              const tWndObj = getWindow(this.pCryWindowID);
              const tElem = tWndObj.getElement("hobba_reply_field");
              const tText = tElem.getText();
              const tMaxTextLength = 512;
              const tMaxLineCounts = 4;
              if ((tText.length >= 512) || (tText.line.count > tMaxLineCounts)) {
                return 1;
              }
            }
            pass();
          }
        }
      }
    }
  }

  eventProcModToolWnd(tEvent, tElemID, tParam) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "close":
          this.hideModToolWnd();
          break;
        case "modtool_cancel":
          this.showModToolWnd();
          break;
        case "modtool_kickuser":
          this.changeModtoolView("user", "kick");
          break;
        case "modtool_banuser":
          this.changeModtoolView("ban", "ban");
          break;
        case "modtool_alertuser":
          this.changeModtoolView("user", "alert");
          break;
        case "modtool_roomkick":
          this.changeModtoolView("room", "roomkick");
          break;
        case "modtool_roomalert":
          this.changeModtoolView("room", "roomalert");
          break;
        case "modtool_checkbox_ip":
          this.checkBoxClicked("ip");
          break;
        case "modtool_checkbox_computer":
          this.checkBoxClicked("computer");
          break;
        case "modtool_ok":
          return this.sendModCommand();
        case "modtool_checkbox_audioalert":
          this.checkBoxClicked("audioalert");
          break;
        case "aa_checkbox_text":
          this.checkBoxClicked("audioalert");
          break;
        default:
          return 0;
      }
    }
    if (tEvent == Symbol.for("keyDown")) {
      if (the.key == TAB) {
        if (!windowExists(this.pModtoolWindowID)) {
          return 0;
        }
        const tWndObj = getWindow(this.pModtoolWindowID);
        if (tElemID == "modtool_name") {
          const tElem = tWndObj.getElement("modtool_reason");
          if (objectp(tElem)) {
            tElem.setFocus(1);
          }
        } else {
          if (tElemID == "modtool_reason") {
            const tElem = tWndObj.getElement("modtool_extrainfo");
            if (objectp(tElem)) {
              tElem.setFocus(1);
            }
          } else {
            if (tElemID == "modtool_extrainfo") {
              let tElem = tWndObj.getElement("modtool_name");
              if (objectp(tElem)) {
                tElem.setFocus(1);
              } else {
                tElem = tWndObj.getElement("modtool_reason");
                if (objectp(tElem)) {
                  tElem.setFocus(1);
                }
              }
            }
          }
        }
      } else {
        const tKeyCode = the.keyCode;
        if (tElemID == "modtool_reason") {
          if (!((tKeyCode == 51) || (tKeyCode == 117))) {
            const tWndObj = getWindow(this.pModtoolWindowID);
            const tElem = tWndObj.getElement("modtool_reason");
            const tText = tElem.getText();
            const tMaxTextLength = 512;
            const tMaxLineCounts = 4;
            if ((tText.length >= 512) || (tText.line.count > tMaxLineCounts)) {
              return 1;
            }
          }
        }
        pass();
      }
    }
    return 1;
  }

  eventProcAlert(tEvent, tElemID, tParam) {
    this.showCryWnd();
    return 1;
  }

  eventProcModToolButton() {
    this.showModToolWnd();
    return 1;
  }
}
