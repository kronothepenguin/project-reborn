export default class {
  pEntryVisual;
  pBottomBar;
  pSignSprList;
  pSignSprLocV;
  pItemObjList;
  pUpdateTasks;
  pViewMaxTime;
  pViewOpenTime;
  pViewCloseTime;
  pAnimUpdate;
  pFirstInit;
  pInActiveIconBlend;
  pMessengerFlash;
  pClubDaysCount;
  pSwapAnimations;
  pBouncerID;
  pIMFlashTimeoutID;
  pIMFlashState;
  pDisableRoomevents;

  construct() {
    this.pEntryVisual = "entry_view";
    this.pBottomBar = "entry_bar";
    this.pSignSprList = list();
    this.pSignSprLocV = 0;
    this.pItemObjList = list();
    this.pUpdateTasks = list();
    this.pViewMaxTime = 500;
    this.pViewOpenTime = VOID;
    this.pViewCloseTime = VOID;
    this.pAnimUpdate = 0;
    this.pInActiveIconBlend = 40;
    this.pClubDaysCount = 0;
    this.pMessengerFlash = 0;
    this.pFirstInit = 1;
    this.pSwapAnimations = list();
    this.pBouncerID = Symbol.for("entry_im_icon_bouncer");
    this.pIMFlashTimeoutID = Symbol.for("im_icon_flash_timeout");
    this.pDisableRoomevents = 0;
    if (variableExists("disable.roomevents")) {
      this.pDisableRoomevents = getIntVariable("disable.roomevents");
    }
    registerMessage(Symbol.for("userlogin"), this.getID(), Symbol.for("showEntryBar"));
    registerMessage(Symbol.for("showHotelView"), this.getID(), Symbol.for("showHotel"));
    registerMessage(Symbol.for("IMStateChanged"), this.getID(), Symbol.for("updateIMIcon"));
    executeMessage(Symbol.for("requestHotelView"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("userlogin"), this.getID());
    unregisterMessage(Symbol.for("showHotelView"), this.getID());
    unregisterMessage(Symbol.for("IMStateChanged"), this.getID());
    for (const tAnimation of this.pSwapAnimations) {
      tAnimation.deconstruct();
    }
    this.pSwapAnimations = list();
    let tManager = getThread(Symbol.for("room")).getComponent().removeIconBarManager();
    return this.hideAll();
  }

  showHotel() {
    if (!visualizerExists(this.pEntryVisual)) {
      if (!createVisualizer(this.pEntryVisual, "entry.visual")) {
        return 0;
      }
      let tVisObj = getVisualizer(this.pEntryVisual);
      this.pSignSprList = list();
      this.pSignSprList.add(tVisObj.getSprById("entry_sign"));
      this.pSignSprList.add(tVisObj.getSprById("entry_sign_sd"));
      this.pSignSprLocV = this.pSignSprList[1].locV;
      let tAnimations = tVisObj.getProperty(Symbol.for("swapAnims"));
      if (tAnimations != 0) {
        for (const tAnimation of tAnimations) {
          let tObj = createObject(Symbol.for("random"), getVariableValue("swap.animation.class"));
          if (tObj == 0) {
            error(this, "Error creating swap animation", Symbol.for("showHotel"), Symbol.for("minor"));
            continue;
          }
          this.pSwapAnimations.add(tObj);
          this.pSwapAnimations[this.pSwapAnimations.count].define(tAnimation);
        }
      }
      this.pItemObjList = list();
      tAnimations = getVariableValue("hotel.view.animations", list());
      for (let i = 1; i <= tAnimations.count; i++) {
        let j = 1;
        let tAnimationType = tAnimations[i];
        while (1) {
          let tSpr = tVisObj.getSprById(`${tAnimationType[1]}${j}`);
          if (tSpr != 0) {
            let tObj = createObject(Symbol.for("temp"), tAnimationType[2]);
            if (tObj != 0) {
              tObj.define(tSpr, j);
              this.pItemObjList.add(tObj);
            } else {
              error(this, `Error creating object: ${tAnimationType}`, Symbol.for("showHotel"), Symbol.for("minor"));
            }
          } else {
            break;
          }
          j = j + 1;
        }
      }
    }
    this.remAnimTask(Symbol.for("closeView"));
    this.pViewOpenTime = the.milliSeconds + 500;
    receivePrepare(this.getID());
    this.delay(500, Symbol.for("addAnimTask"), Symbol.for("openView"));
    return 1;
  }

  hideHotel() {
    if (visualizerExists(this.pEntryVisual)) {
      this.addAnimTask(Symbol.for("closeView"));
      this.remAnimTask(Symbol.for("animSign"));
      this.remAnimTask(Symbol.for("openView"));
      this.pViewCloseTime = the.milliSeconds;
    }
    this.pItemObjList = list();
    removePrepare(this.getID());
    for (const tAnim of this.pSwapAnimations) {
      tAnim.deconstruct();
    }
    this.pSwapAnimations = list();
    return 1;
  }

  showEntryBar() {
    if (!windowExists(this.pBottomBar)) {
      if (!createWindow(this.pBottomBar, "entry_bar.window", 0, 535)) {
        return 0;
      }
      let tWndObj = getWindow(this.pBottomBar);
      tWndObj.setProperty(Symbol.for("boundary"), rect(-100, -100, 1000, 1000));
      tWndObj.lock(1);
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcEntryBar"), this.getID(), Symbol.for("mouseUp"));
      this.addAnimTask(Symbol.for("animEntryBar"));
    }
    if (this.pDisableRoomevents) {
      let tWndObj = getWindow(this.pBottomBar);
      let tEventsIcon = tWndObj.getElement("event_icon_image");
      tEventsIcon.setProperty(Symbol.for("member"), getMember("event_icon_disabled"));
    }
    this.updateIMIcon();
    let tManager = getThread(Symbol.for("room")).getComponent().getIconBarManager();
    tManager.define(this.pBottomBar);
    registerMessage(Symbol.for("updateCreditCount"), this.getID(), Symbol.for("updateCreditCount"));
    registerMessage(Symbol.for("updateFriendListIcon"), this.getID(), Symbol.for("updateFriendListIcon"));
    registerMessage(Symbol.for("updateFigureData"), this.getID(), Symbol.for("updateEntryBar"));
    registerMessage(Symbol.for("updateClubStatus"), this.getID(), Symbol.for("updateClubStatus"));
    return this.updateEntryBar();
  }

  hideEntrybar() {
    unregisterMessage(Symbol.for("updateCreditCount"), this.getID());
    unregisterMessage(Symbol.for("updateFriendListIcon"), this.getID());
    unregisterMessage(Symbol.for("updateFigureData"), this.getID());
    unregisterMessage(Symbol.for("updateClubStatus"), this.getID());
    if (timeoutExists(Symbol.for("flash_messenger_icon"))) {
      removeTimeout(Symbol.for("flash_messenger_icon"));
    }
    if (windowExists(this.pBottomBar)) {
      removeWindow(this.pBottomBar);
    }
    if (objectExists(this.pBouncerID)) {
      removeObject(this.pBouncerID);
    }
    let tManager = getThread(Symbol.for("room")).getComponent().getIconBarManager();
    tManager.hideExtensions();
    return 1;
  }

  hideAll() {
    this.hideHotel();
    this.hideEntrybar();
    return 1;
  }

  prepare() {
    this.pAnimUpdate = !this.pAnimUpdate;
    if (this.pAnimUpdate) {
      let tVisual = getVisualizer(this.pEntryVisual);
      if (!tVisual) {
        return removePrepare(this.getID());
      }
      call(Symbol.for("update"), this.pItemObjList);
    }
  }

  update() {
    for (const tMethod of this.pUpdateTasks.duplicate()) {
      call(tMethod, this);
    }
  }

  updateEntryBar() {
    let tWndObj = getWindow(this.pBottomBar);
    if (tWndObj == 0) {
      return 0;
    }
    let tSession = getObject(Symbol.for("session"));
    let tName = tSession.GET("user_name");
    let tText = tSession.GET("user_customData");
    let tCrds;
    if (tSession.exists("user_walletbalance")) {
      tCrds = tSession.GET("user_walletbalance");
    } else {
      tCrds = getText("loading", "Loading");
    }
    let tClub;
    if (tSession.exists("club_status")) {
      tClub = tSession.GET("club_status");
    } else {
      tClub = getText("loading", "Loading");
    }
    tWndObj.getElement("ownhabbo_name_text").setText(tName);
    tWndObj.getElement("ownhabbo_mission_text").setText(tText);
    if (this.pFirstInit) {
      this.deActivateAllIcons();
      this.pFirstInit = 0;
    }
    this.updateCreditCount(tCrds);
    executeMessage(Symbol.for("messageUpdateRequest"));
    executeMessage(Symbol.for("buddyUpdateRequest"));
    this.updateClubStatus(tClub);
    this.createMyHeadIcon();
    return 1;
  }

  addAnimTask(tMethod) {
    if (this.pUpdateTasks.getPos(tMethod) == 0) {
      this.pUpdateTasks.add(tMethod);
    }
    return receiveUpdate(this.getID());
  }

  remAnimTask(tMethod) {
    this.pUpdateTasks.deleteOne(tMethod);
    if (this.pUpdateTasks.count == 0) {
      removeUpdate(this.getID());
    }
    return 1;
  }

  animSign() {
    let tVisObj = getVisualizer(this.pEntryVisual);
    if (tVisObj == 0) {
      return this.remAnimTask(Symbol.for("animSign"));
    }
    for (const tSpr of this.pSignSprList) {
      tSpr.locV = tSpr.locV + 30;
    }
    if (this.pSignSprList[1].locV >= 0) {
      this.pSignSprList[1].locV = 0;
      this.pSignSprList[2].locV = 0;
      this.remAnimTask(Symbol.for("animSign"));
    }
  }

  openView() {
    let tVisObj = getVisualizer(this.pEntryVisual);
    if (tVisObj == 0) {
      return this.remAnimTask(Symbol.for("openView"));
    }
    let tTopSpr = tVisObj.getSprById("box_top");
    let tBotSpr = tVisObj.getSprById("box_bottom");
    let tTimeLeft = (this.pViewMaxTime - (the.milliSeconds - this.pViewOpenTime)) / 1000.0;
    let tmoveLeft = tTopSpr.height - abs(tTopSpr.locV);
    let tOffset;
    if (tTimeLeft <= 0) {
      tOffset = abs(tmoveLeft);
    } else {
      tOffset = abs(tmoveLeft / tTimeLeft) / the.frameTempo;
    }
    tTopSpr.locV = tTopSpr.locV - tOffset;
    tBotSpr.locV = tBotSpr.locV + tOffset;
    if (tTopSpr.locV <= -tTopSpr.height) {
      this.addAnimTask(Symbol.for("animSign"));
      this.remAnimTask(Symbol.for("openView"));
    }
  }

  closeView() {
    let tVisObj = getVisualizer(this.pEntryVisual);
    if (tVisObj == 0) {
      return this.remAnimTask(Symbol.for("closeView"));
    }
    let tTopSpr = tVisObj.getSprById("box_top");
    let tBotSpr = tVisObj.getSprById("box_bottom");
    let tTimeLeft = (this.pViewMaxTime - (the.milliSeconds - this.pViewCloseTime)) / 1000.0;
    let tmoveLeft = 0 - abs(tTopSpr.locV);
    let tOffset;
    if (tTimeLeft <= 0) {
      tOffset = abs(tmoveLeft);
    } else {
      tOffset = abs(tmoveLeft / tTimeLeft) / the.frameTempo;
    }
    tTopSpr.locV = tTopSpr.locV + tOffset;
    tBotSpr.locV = tBotSpr.locV - tOffset;
    if (tTopSpr.locV >= 0) {
      this.remAnimTask(Symbol.for("closeView"));
      removeVisualizer(this.pEntryVisual);
    }
  }

  animEntryBar() {
    let tWndObj = getWindow(this.pBottomBar);
    if (tWndObj == 0) {
      return this.remAnimTask(Symbol.for("animEntryBar"));
    }
    tWndObj = getWindow(this.pBottomBar);
    if (the.platform.contains("windows")) {
      tWndObj.moveBy(0, -5);
    } else {
      tWndObj.moveTo(0, 485);
    }
    if (tWndObj.getProperty(Symbol.for("locY")) <= 485) {
      this.remAnimTask(Symbol.for("animEntryBar"));
    }
  }

  updateCreditCount(tCount) {
    let tWndObj = getWindow(this.pBottomBar);
    if (tWndObj != 0) {
      let tElement = tWndObj.getElement("own_credits_text");
      if (!tElement) {
        return 0;
      }
      tElement.setText(`${tCount} ${getText("int_credits")}`);
    }
    return 1;
  }

  updateClubStatus(tStatus) {
    if (tStatus.ilk != Symbol.for("propList")) {
      return 0;
    }
    let tWndObj = getWindow(this.pBottomBar);
    if (tWndObj != 0) {
      if (!tWndObj.elementExists("club_bottombar_text1")) {
        return 0;
      }
      if (!tWndObj.elementExists("club_bottombar_text2")) {
        return 0;
      }
      let tDays = tStatus[Symbol.for("daysLeft")] + (tStatus[Symbol.for("PrepaidPeriods")] * 31);
      if (tStatus[Symbol.for("PrepaidPeriods")] < 0) {
        tWndObj.getElement("club_bottombar_text1").setText(getText("club_habbo.bottombar.text.member"));
        tWndObj.getElement("club_bottombar_text2").setText(getText("club_member"));
      } else {
        if (tDays == 0) {
          tWndObj.getElement("club_bottombar_text1").setText(getText("club_habbo.bottombar.text.notmember"));
          tWndObj.getElement("club_bottombar_text2").setText(getText("club_habbo.bottombar.link.notmember"));
        } else {
          let tStr = getText("club_habbo.bottombar.link.member");
          tStr = replaceChunks(tStr, "%days%", tDays);
          tWndObj.getElement("club_bottombar_text1").setText(getText("club_habbo.bottombar.text.member"));
          tWndObj.getElement("club_bottombar_text2").setText(tStr);
        }
      }
    }
    return 1;
  }

  updateFriendListIcon(tActive) {
    let tWndObj = getWindow(this.pBottomBar);
    if (tWndObj == 0) {
      return 0;
    }
    let tIconElem = tWndObj.getElement("friend_list_icon");
    if (!tIconElem) {
      return 0;
    }
    if (tActive) {
      tIconElem.setProperty(Symbol.for("member"), "friend_list_icon_notification");
    } else {
      tIconElem.setProperty(Symbol.for("member"), "friend_list_icon");
    }
  }

  bounceIMIcon(tstate) {
    if (variableExists("bounce.messenger.icon")) {
      if (!getVariable("bounce.messenger.icon")) {
        return 0;
      }
    }
    if (!objectExists(this.pBouncerID)) {
      createObject(this.pBouncerID, "Element Bouncer Class");
    }
    let tBouncer = getObject(this.pBouncerID);
    if (tstate == tBouncer.getState()) {
      return 1;
    }
    if (tstate) {
      tBouncer.registerElement(this.pBottomBar, list("im_icon"));
      tBouncer.setBounce(1);
    } else {
      tBouncer.setBounce(0);
    }
  }

  activateIcon(tIcon) {
    if (windowExists(this.pBottomBar)) {
      switch (tIcon) {
        case Symbol.for("navigator"):
          getWindow(this.pBottomBar).getElement("nav_icon_image").setProperty(Symbol.for("blend"), 100);
          break;
      }
    }
  }

  deActivateIcon(tIcon) {
    if (windowExists(this.pBottomBar)) {
      switch (tIcon) {
        case Symbol.for("navigator"):
          getWindow(this.pBottomBar).getElement("nav_icon_image").setProperty(Symbol.for("blend"), this.pInActiveIconBlend);
          break;
      }
    }
  }

  deActivateAllIcons() {
    let tIcons = list();
    if (windowExists(this.pBottomBar)) {
      for (const tIcon of tIcons) {
        getWindow(this.pBottomBar).getElement(`${tIcon}_icon_image`).setProperty(Symbol.for("blend"), this.pInActiveIconBlend);
      }
    }
  }

  createMyHeadIcon() {
    if (objectExists("Figure_Preview")) {
      getObject("Figure_Preview").createHumanPartPreview(this.pBottomBar, "ownhabbo_icon_image", Symbol.for("head"));
    }
  }

  updateIMIcon() {
    if (!windowExists(this.pBottomBar)) {
      return 0;
    }
    if (!threadExists(Symbol.for("instant_messenger"))) {
      return 0;
    }
    let tstate = getThread(Symbol.for("instant_messenger")).getInterface().getState();
    if (voidp(tstate)) {
      tstate = Symbol.for("inactive");
    }
    let tWnd = getWindow(this.pBottomBar);
    let tElem = tWnd.getElement("im_icon");
    let tmember;
    switch (tstate) {
      case Symbol.for("Active"):
        tmember = getMember("im.icon.active");
        tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
        this.bounceIMIcon(0);
        this.flashIMIcon(Symbol.for("stop"));
        break;
      case Symbol.for("highlighted"):
        tmember = getMember("im.icon.highlighted");
        tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
        this.bounceIMIcon(1);
        this.flashIMIcon(Symbol.for("start"));
        break;
      case Symbol.for("inactive"):
        tmember = getMember("im.icon.inactive");
        tElem.setProperty(Symbol.for("cursor"), 0);
        this.bounceIMIcon(0);
        this.flashIMIcon(Symbol.for("stop"));
        break;
      default:
        return 0;
    }
    tElem.setProperty(Symbol.for("member"), tmember);
    return 1;
  }

  flashIMIcon(tstate) {
    switch (tstate) {
      case Symbol.for("start"):
        if (timeoutExists(this.pIMFlashTimeoutID)) {
          removeTimeout(this.pIMFlashTimeoutID);
        }
        if (!timeoutExists(this.pIMFlashTimeoutID)) {
          createTimeout(this.pIMFlashTimeoutID, 500, Symbol.for("flashIMIcon"), this.getID(), Symbol.for("flash"), 0);
        }
        break;
      case Symbol.for("stop"):
        if (timeoutExists(this.pIMFlashTimeoutID)) {
          removeTimeout(this.pIMFlashTimeoutID);
        }
        break;
      case Symbol.for("flash"): {
        let tWnd = getWindow(this.pBottomBar);
        if (!tWnd) {
          return 0;
        }
        let tElem = tWnd.getElement("im_icon");
        if (this.pIMFlashState == 1) {
          tElem.setProperty(Symbol.for("member"), "im.icon.highlighted.2");
        } else {
          tElem.setProperty(Symbol.for("member"), "im.icon.highlighted");
        }
        this.pIMFlashState = !this.pIMFlashState;
        break;
      }
    }
  }

  eventProcEntryBar(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "help_icon_image":
        return executeMessage(Symbol.for("openGeneralDialog"), "help");
      case "get_credit_text":
      case "purse_icon_image":
        return executeMessage(Symbol.for("openGeneralDialog"), "purse");
      case "event_icon_image":
        if (!this.pDisableRoomevents) {
          return executeMessage(Symbol.for("show_hide_roomevents"));
        }
        return 1;
      case "nav_icon_image":
        return executeMessage(Symbol.for("show_hide_navigator"));
      case "friend_list_icon":
        return executeMessage(Symbol.for("toggle_friend_list"));
      case "update_habboid_text":
      case "ownhabbo_icon_image": {
        let tAllowModify = 1;
        if (getObject(Symbol.for("session")).exists("allow_profile_editing")) {
          tAllowModify = getObject(Symbol.for("session")).GET("allow_profile_editing");
        }
        if (tAllowModify) {
          if (threadExists(Symbol.for("registration"))) {
            getThread(Symbol.for("registration")).getComponent().openFigureUpdate();
          }
        } else {
          executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          openNetPage(getText("url_figure_editor"));
        }
        break;
      }
      case "club_icon_image":
      case "club_bottombar_text2":
        return executeMessage(Symbol.for("show_clubinfo"));
      case "im_icon":
        return executeMessage(Symbol.for("toggle_im"));
      case "int_controller_image":
        return executeMessage(Symbol.for("toggle_ig"));
      case "int_brochure_image":
        return executeMessage(Symbol.for("show_hide_catalogue"));
    }
  }
}
