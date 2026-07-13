export default class {
  pTempPassword;
  pWindowTitle;
  pRoomProps;
  pRoomsProps;
  pRoomIndex;

  construct() {
    this.pTempPassword = propList();
    this.pWindowTitle = "RoomMatic";
    this.pRoomProps = propList();
    this.pRoomsProps = getVariableValue("private.room.properties");
    this.pRoomIndex = 1;
    return 1;
  }

  deconstruct() {
    if (windowExists(this.pWindowTitle)) {
      removeWindow(this.pWindowTitle);
    }
    return 1;
  }

  showHideRoomKiosk() {
    if (windowExists(this.pWindowTitle)) {
      this.getComponent().updateState("start");
      removeWindow(this.pWindowTitle);
    } else {
      this.pTempPassword = propList();
      this.pRoomProps = propList();
      this.ChangeWindowView("roomatic1.window");
    }
  }

  ChangeWindowView(tWindowName) {
    createWindow(this.pWindowTitle, VOID, VOID, VOID, Symbol.for("modal"));
    if (windowExists(this.pWindowTitle)) {
      tWndObj = getWindow(this.pWindowTitle);
      tWndObj.merge(tWindowName);
      tWndObj.moveTo(((the.stage).rect.width - tWndObj.getProperty(Symbol.for("width"))) / 2, the.stage.rect.height - tWndObj.getProperty(Symbol.for("height")));
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
      tWndObj.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("keyDown"));
      this.setPageValues(tWindowName);
    }
  }

  createRoom() {
    this.pRoomProps[Symbol.for("name")] = getStringServices().convertSpecialChars(this.pRoomProps[Symbol.for("name")], 1);
    this.pRoomProps[Symbol.for("description")] = getStringServices().convertSpecialChars(this.pRoomProps[Symbol.for("description")], 1);
    this.pRoomProps[Symbol.for("marker")] = `${"model_"}${this.pRoomProps["model"]}`;
    tFlatData = "/first floor/";
    for (const f of [Symbol.for("name"), Symbol.for("marker"), Symbol.for("door"), Symbol.for("showownername")]) {
      tFlatData = `${tFlatData}${replaceChars(this.pRoomProps[f], "/", SPACE)}${"/"}`;
    }
    tFlatData = tFlatData.char[`${1}..${length(tFlatData) - 1}`];
    this.getComponent().sendNewRoomData(tFlatData);
  }

  flatcreated(tFlatName, tFlatID) {
    this.getComponent().sendFlatCategory(tFlatID, this.pRoomProps[Symbol.for("category")]);
    this.ChangeWindowView("roomatic7.window");
    tWndObj = getWindow(this.pWindowTitle);
    this.pRoomProps[Symbol.for("id")] = tFlatID;
    this.pRoomProps[Symbol.for("name")] = tFlatName;
    if (this.pRoomProps[Symbol.for("door")] == "password") {
      this.pRoomProps[Symbol.for("Password")] = this.getPassword();
    } else {
      this.pRoomProps[Symbol.for("Password")] = EMPTY;
    }
    tText = `${getText("roomatic_roomnumber", "Room number:")} ${this.pRoomProps[Symbol.for("id")]}`;
    if (tWndObj.elementExists("roomatic_newnumber")) {
      tWndObj.getElement("roomatic_newnumber").setText(tText);
    }
    tText = `${getText("roomatic_roomname", "Room name:")} ${this.pRoomProps[Symbol.for("name")]}`;
    if (tWndObj.elementExists("roomatic_newname")) {
      tWndObj.getElement("roomatic_newname").setText(tText);
    }
    return this.sendFlatInfo();
  }

  sendFlatInfo() {
    tFlatMsg = `${"/"}${replaceChars(string(this.pRoomProps[Symbol.for("id")]), "/", SPACE)}${"/"}${RETURN}`;
    tFlatMsg = `${tFlatMsg}${"description="}${replaceChars(this.pRoomProps[Symbol.for("description")], "/", SPACE)}${RETURN}`;
    tFlatMsg = `${tFlatMsg}${"password="}${this.pRoomProps[Symbol.for("Password")]}${RETURN}`;
    tFlatMsg = `${tFlatMsg}${"allsuperuser="}${this.pRoomProps[Symbol.for("ableothersmovefurniture")]}`;
    this.getComponent().sendSetFlatInfo(tFlatMsg);
  }

  updateRadioButton(tElement, tListOfOtherElements) {
    tOnImg = member(getmemnum("button.radio_green.on")).image;
    tOffImg = member(getmemnum("button.radio_green.off")).image;
    tWindowObj = getWindow(this.pWindowTitle);
    if (tWindowObj.elementExists(tElement)) {
      tWindowObj.getElement(tElement).feedImage(tOnImg);
    }
    for (const tElement of tListOfOtherElements) {
      if (tWindowObj.elementExists(tElement)) {
        tWindowObj.getElement(tElement).feedImage(tOffImg);
      }
    }
  }

  updateCheckButton(tElement, tProp, tChangeMode) {
    tWindowObj = getWindow(this.pWindowTitle);
    tOnImg = member(getmemnum("button.checkbox_green.on")).image;
    tOffImg = member(getmemnum("button.checkbox_green.off")).image;
    if (voidp(this.pRoomProps[tProp])) {
      this.pRoomProps[tProp] = "0";
    }
    if (voidp(tChangeMode)) {
      tChangeMode = 0;
    }
    if (tChangeMode) {
      if (this.pRoomProps[tProp] == "1") {
        this.pRoomProps[tProp] = "0";
      } else {
        this.pRoomProps[tProp] = "1";
      }
    }
    if (this.pRoomProps[tProp] == "1") {
      if (tWindowObj.elementExists(tElement)) {
        tWindowObj.getElement(tElement).feedImage(tOnImg);
      }
    } else {
      if (tWindowObj.elementExists(tElement)) {
        tWindowObj.getElement(tElement).feedImage(tOffImg);
      }
    }
  }

  checkPassword() {
    if (voidp(this.pTempPassword["roomatic_password_field"])) {
      tPw1 = list();
    } else {
      tPw1 = this.pTempPassword["roomatic_password_field"];
    }
    if (voidp(this.pTempPassword["roomatic_password2_field"])) {
      tPw2 = list();
    } else {
      tPw2 = this.pTempPassword["roomatic_password2_field"];
    }
    if (tPw1.count == 0) {
      return "Alert_ForgotSetPassword";
    }
    if (tPw1.count < 3) {
      return "nav_error_passwordtooshort";
    }
    if (tPw1 != tPw2) {
      return "Alert_WrongPassword";
    }
    return 1;
  }

  getPassword() {
    if (this.pTempPassword.count == 0) {
      return EMPTY;
    }
    tPw = EMPTY;
    for (let f = 1; f <= count(this.pTempPassword["roomatic_password_field"]); f++) {
      tPw = `${tPw}${this.pTempPassword["roomatic_password_field"][f]}`;
    }
    return tPw;
  }

  getSpecialLayoutRights() {
    return getObject(Symbol.for("session")).GET("user_rights").getPos("fuse_use_special_room_layouts");
  }

  setPageValues(tWindowName) {
    switch (tWindowName) {
      case "roomatic2.window":
        tWndObj = getWindow(this.pWindowTitle);
        if (tWndObj == 0) {
          return 0;
        }
        if (!voidp(this.pRoomProps[Symbol.for("name")])) {
          tWndObj.getElement("roomatic_roomname_field").setText(this.pRoomProps[Symbol.for("name")]);
        }
        if (!voidp(this.pRoomProps[Symbol.for("description")])) {
          tWndObj.getElement("romatic_roomdescription_field").setText(this.pRoomProps[Symbol.for("description")]);
        }
        this.pRoomProps[Symbol.for("owner")] = getObject(Symbol.for("session")).GET("user_name");
        tWndObj.getElement("roomatic_ownername_field").setText(this.pRoomProps[Symbol.for("owner")]);
        if (!voidp(this.pRoomProps[Symbol.for("showownername")])) {
          if (this.pRoomProps[Symbol.for("showownername")] == 1) {
            this.updateRadioButton("roomatic_namedisplayed_yes_check", list("roomatic_namedisplayed_no_check"));
          } else {
            this.updateRadioButton("roomatic_namedisplayed_no_check", list("roomatic_namedisplayed_yes_check"));
          }
        } else {
          this.pRoomProps[Symbol.for("showownername")] = 1;
          this.updateRadioButton("roomatic_namedisplayed_yes_check", list("roomatic_namedisplayed_no_check"));
        }
        tDropDown = tWndObj.getElement("roomatic_choosecategory");
        if (!ilk(tDropDown, Symbol.for("instance"))) {
          return error(this, `${"Unable to retrieve dropdown:"} ${tDropDown}`, Symbol.for("setPageValues"), Symbol.for("major"));
        }
        tCatProps = getObject(Symbol.for("session")).GET("user_flat_cats");
        if (!ilk(tCatProps, Symbol.for("propList"))) {
          return error(this, `${"Category list was not a property list:"} ${tCatProps}`, Symbol.for("setPageValues"), Symbol.for("major"));
        }
        tCatTxtItems = list();
        tCatKeyItems = list();
        for (let i = 1; i <= tCatProps.count; i++) {
          tCatTxtItems[i] = getAt(tCatProps, i);
          tCatKeyItems[i] = getPropAt(tCatProps, i);
        }
        if (!voidp(this.pRoomProps[Symbol.for("category")])) {
          tDropDown.updateData(tCatTxtItems, tCatKeyItems, VOID, this.pRoomProps[Symbol.for("category")]);
        } else {
          tDropDown.updateData(tCatTxtItems, tCatKeyItems);
        }
        break;
      case "roomatic3.window":
      case "roomatic_club.window":
        tRoomSpecs = this.pRoomsProps[this.pRoomIndex];
        this.pRoomProps[Symbol.for("model")] = tRoomSpecs[Symbol.for("model")];
        tWndObj = getWindow(this.pWindowTitle);
        if (tWndObj == 0) {
          return 0;
        }
        tElem = tWndObj.getElement("rm_room_layout");
        tMemName = `${"rm_model_"}${this.pRoomProps[Symbol.for("model")]}${"_layout"}`;
        tmember = member(getmemnum(tMemName));
        tTargetWidth = tElem.getProperty(Symbol.for("width"));
        tTargetHeight = tElem.getProperty(Symbol.for("height"));
        tTargetImg = image(tTargetWidth, tTargetHeight, 32);
        tSourceRect = tmember.image.rect;
        tOffsetX = (tTargetWidth - tmember.image.width) / 2;
        tOffsetY = (tTargetHeight - tmember.image.height) / 2;
        tTargetRect = tSourceRect + rect(tOffsetX, tOffsetY, tOffsetX, tOffsetY);
        tTargetImg.copyPixels(tmember.image, tTargetRect, tSourceRect);
        if (tmember.type == Symbol.for("bitmap")) {
          tElem.feedImage(tTargetImg);
        }
        if (tRoomSpecs[Symbol.for("club")]) {
          tWndObj.getElement("rm_hc_icon").show();
          tWndObj.getElement("rm_hc_only").show();
        } else {
          tWndObj.getElement("rm_hc_icon").hide();
          tWndObj.getElement("rm_hc_only").hide();
        }
        if (tRoomSpecs[Symbol.for("club")] && !this.getSpecialLayoutRights()) {
          tWndObj.getElement("roomatic_3_button_next").hide();
        } else {
          tWndObj.getElement("roomatic_3_button_next").show();
        }
        tSizeTxt = getText("roommatic_modify_size");
        tSizeTxt = replaceChunks(tSizeTxt, "%tileCount%", tRoomSpecs[Symbol.for("size")]);
        tWndObj.getElement("rm_room_size").setText(tSizeTxt);
        break;
      case "roomatic4.window":
        this.pTempPassword = propList();
        if (!voidp(this.pRoomProps[Symbol.for("door")])) {
          tOthers = propList("open", "roomatic_security_open", "closed", "roomatic_security_locked", "password", "roomatic_security_pwc");
          tActive = tOthers[this.pRoomProps[Symbol.for("door")]];
          tOthers.deleteProp(this.pRoomProps[Symbol.for("door")]);
          this.updateRadioButton(tActive, tOthers);
        } else {
          this.pRoomProps[Symbol.for("door")] = "open";
          tOthers = list("roomatic_security_locked", "roomatic_security_pwc");
          this.updateRadioButton("roomatic_security_open", tOthers);
        }
        this.updateCheckButton("roomatic_security_letmove", Symbol.for("ableothersmovefurniture"), 0);
        if (this.pRoomProps[Symbol.for("door")] != "password") {
          this.showPasswordFields(0);
        } else {
          this.showPasswordFields(1);
        }
        break;
    }
  }

  showPasswordFields(tVisible) {
    tWndObj = getWindow(this.pWindowTitle);
    if (tWndObj == 0) {
      return error(this, "No window!", Symbol.for("showPasswordFields"), Symbol.for("minor"));
    }
    tElems = list("roomatic_password2_field", "roomatic_password_field", "roomatic_pwdfieldsbg", "roomatic_pwd_desc");
    for (const tElemID of tElems) {
      tElem = tWndObj.getElement(tElemID);
      if (!voidp(tElem)) {
        tElem.setProperty(Symbol.for("visible"), tVisible);
        if ((tElemID == "roomatic_password2_field") || (tElemID == "roomatic_password_field")) {
          tElem.setText(EMPTY);
        }
      }
    }
  }

  eventProc(tEvent, tSprID, tParm) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "roomatic_1_button_start":
          this.ChangeWindowView("roomatic2.window");
          executeMessage(Symbol.for("tutorial_roommatic_start_ready"));
          break;
        case "roomatic_1_button_cancel":
          this.showHideRoomKiosk();
          break;
        case "roomatic_choosecategory":
          tWndObj = getWindow(this.pWindowTitle);
          tDropDown = tWndObj.getElement("roomatic_choosecategory");
          tDropDown.setSelection(tParm);
          this.pRoomProps[Symbol.for("category")] = tParm;
          break;
        case "roomatic_2_button_cancel":
          this.showHideRoomKiosk();
          break;
        case "roomatic_2_button_next":
          tRoomName = replaceChars(getWindow(this.pWindowTitle).getElement("roomatic_roomname_field").getText(), "/", EMPTY);
          if (tRoomName == EMPTY) {
            return executeMessage(Symbol.for("alert"), propList(Symbol.for("Msg"), "roomatic_givename", Symbol.for("modal"), 1));
          }
          this.pRoomProps[Symbol.for("name")] = tRoomName;
          this.pRoomProps[Symbol.for("description")] = getWindow(this.pWindowTitle).getElement("romatic_roomdescription_field").getText();
          this.ChangeWindowView("roomatic3.window");
          executeMessage(Symbol.for("tutorial_roommatic_details_ready"));
          break;
        case "roomatic_namedisplayed_yes_check":
          this.pRoomProps[Symbol.for("showownername")] = 1;
          this.updateRadioButton("roomatic_namedisplayed_yes_check", list("roomatic_namedisplayed_no_check"));
          break;
        case "roomatic_namedisplayed_no_check":
          this.pRoomProps[Symbol.for("showownername")] = 0;
          this.updateRadioButton("roomatic_namedisplayed_no_check", list("roomatic_namedisplayed_yes_check"));
          break;
        case "roomatic3_button_model_next":
          this.pRoomIndex = this.pRoomIndex + 1;
          if (this.pRoomIndex > this.pRoomsProps.count) {
            this.pRoomIndex = 1;
          }
          this.setPageValues("roomatic3.window");
          break;
        case "roomatic3_button_model_prev":
          this.pRoomIndex = this.pRoomIndex - 1;
          if (this.pRoomIndex < 1) {
            this.pRoomIndex = this.pRoomsProps.count;
          }
          this.setPageValues("roomatic3.window");
          break;
        case "roomatic_3_button_next":
          this.ChangeWindowView("roomatic4.window");
          executeMessage(Symbol.for("tutorial_roommatic_layout_ready"));
          break;
        case "roomatic_3_button_previous":
          this.ChangeWindowView("roomatic2.window");
          break;
        case "roomatic_4_button_done":
          if (this.pRoomProps[Symbol.for("door")] == "password") {
            tReturnValue = this.checkPassword();
            if (tReturnValue != 1) {
              tReturnText = getText(tReturnValue);
              this.ChangeWindowView("roomatic5.window");
              tWndObj = getWindow(this.pWindowTitle);
              tWndObj.getElement("roomatic_errorMsg").setText(tReturnText);
              return 1;
            }
          }
          this.createRoom();
          this.ChangeWindowView("roomatic6.window");
          executeMessage(Symbol.for("tutorial_roommatic_security_ready"));
          break;
        case "roomatic_4_button_previous":
          this.ChangeWindowView("roomatic3.window");
          break;
        case "goto_club_layouts":
          this.ChangeWindowView("roomatic_club.window");
          break;
        case "goto_normal_layouts":
          this.ChangeWindowView("roomatic3.window");
          break;
        case "roomatic_security_open":
          this.pRoomProps[Symbol.for("door")] = "open";
          tOthers = list("roomatic_security_locked", "roomatic_security_pwc");
          this.updateRadioButton("roomatic_security_open", tOthers);
          this.pTempPassword = propList();
          this.showPasswordFields(0);
          break;
        case "roomatic_security_locked":
          this.pRoomProps[Symbol.for("door")] = "closed";
          tOthers = list("roomatic_security_open", "roomatic_security_pwc");
          this.updateRadioButton("roomatic_security_locked", tOthers);
          this.pTempPassword = propList();
          this.showPasswordFields(0);
          break;
        case "roomatic_security_pwc":
          this.pRoomProps[Symbol.for("door")] = "password";
          tOthers = list("roomatic_security_open", "roomatic_security_locked");
          this.updateRadioButton("roomatic_security_pwc", tOthers);
          this.pTempPassword = propList();
          this.showPasswordFields(1);
          break;
        case "roomatic_security_letmove":
          this.updateCheckButton("roomatic_security_letmove", Symbol.for("ableothersmovefurniture"), 1);
          break;
        case "roomatic_5_button_back":
          this.ChangeWindowView("roomatic4.window");
          break;
        case "roomatic_7_button_go":
          this.showHideRoomKiosk();
          if (threadExists(Symbol.for("navigator"))) {
            getThread(Symbol.for("navigator")).getComponent().roomkioskGoingFlat(this.pRoomProps);
          }
          break;
        case "roomatic_7_button_cancel":
          this.showHideRoomKiosk();
          if (threadExists(Symbol.for("navigator"))) {
            getThread(Symbol.for("navigator")).getComponent().sendGetOwnFlats();
          }
          break;
        case "close":
          this.showHideRoomKiosk();
          break;
      }
    } else {
      if (tEvent == Symbol.for("keyDown")) {
        tASCII = charToNum(the.key);
        if (tASCII < 28) {
          if ((tASCII != 8) && (tASCII != 9)) {
            return 1;
          }
        }
        switch (tSprID) {
          case "roomatic_password_field":
          case "roomatic_password2_field":
            if (voidp(this.pTempPassword[tSprID])) {
              this.pTempPassword[tSprID] = list();
            }
            switch (the.keyCode) {
              case 48:
                return 0;
              case 51:
                if (this.pTempPassword[tSprID].count > 0) {
                  this.pTempPassword[tSprID].deleteAt(this.pTempPassword[tSprID].count);
                }
                break;
              case 117:
                this.pTempPassword[tSprID] = list();
                break;
              default:
                tValidKeys = getVariable("permitted.name.chars", "1234567890qwertyuiopasdfghjklzxcvbnm_-=+?!@<>:.,");
                tTheKey = the.key;
                tASCII = charToNum(tTheKey);
                if ((tASCII > 31) && (tASCII < 128)) {
                  if ((tValidKeys.contains(tTheKey)) || (tValidKeys == "void")) {
                    if (this.pTempPassword[tSprID].count < 32) {
                      this.pTempPassword[tSprID].append(tTheKey);
                    }
                  }
                }
                break;
            }
            tStr = EMPTY;
            for (const tChar of this.pTempPassword[tSprID]) {
              putAfter(tStr, "*");
            }
            getWindow(this.pWindowTitle).getElement(tSprID).setText(tStr);
            the.selStart = this.pTempPassword[tSprID].count;
            the.selEnd = this.pTempPassword[tSprID].count;
            return 1;
        }
      }
    }
  }
}
