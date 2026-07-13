export default class {
  pInfoStandName;
  pInfoStandId;
  pCurrentlySelectedUserId;

  construct() {
    this.pInfoStandId = "Info_Stand_Window";
    this.pInfoStandName = VOID;
    this.pCurrentlySelectedUserId = VOID;
    registerMessage(Symbol.for("hideInfoStand"), this.getID(), Symbol.for("hideInfoStand"));
    registerMessage(Symbol.for("groupLogoDownloaded"), this.getID(), Symbol.for("groupLogoDownloaded"));
  }

  deconstruct() {
    unregisterMessage(Symbol.for("hideInfoStand"), this.getID());
    unregisterMessage(Symbol.for("groupLogoDownloaded"), this.getID());
  }

  showInfostand() {
    if (!windowExists(this.pInfoStandId)) {
      createWindow(this.pInfoStandId, "info_stand.window", 552, 300);
      let tWndObj = getWindow(this.pInfoStandId);
      tWndObj.lock(1);
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcInfoStand"), this.getID(), Symbol.for("mouseUp"));
    }
    return 1;
  }

  hideInfoStand() {
    executeMessage(Symbol.for("hideObjectDEVELOPMENT"));
    if (windowExists(this.pInfoStandId)) {
      return removeWindow(this.pInfoStandId);
    }
  }

  showObjectInfo(tObjType) {
    executeMessage(Symbol.for("showObjectDEVELOPMENT"), tObjType);
    let tWndObj = getWindow(this.pInfoStandId);
    if (!tWndObj) {
      return 0;
    }
    let tRoomComponent = getThread(Symbol.for("room")).getComponent();
    let tRoomInterface = getThread(Symbol.for("room")).getInterface();
    let tSelectedObj = tRoomInterface.getSelectedObject();
    let tObj = 0;
    let tProps = 0;
    switch (tObjType) {
      case "user":
        tObj = tRoomComponent.getUserObject(tSelectedObj);
        this.pCurrentlySelectedUserId = tSelectedObj;
        break;
      case "active":
        tObj = tRoomComponent.getActiveObject(tSelectedObj);
        this.pCurrentlySelectedUserId = VOID;
        break;
      case "item":
        tObj = tRoomComponent.getItemObject(tSelectedObj);
        this.pCurrentlySelectedUserId = VOID;
        break;
      case "pet":
        tObj = tRoomComponent.getUserObject(tSelectedObj);
        this.pCurrentlySelectedUserId = VOID;
        break;
      default:
        error(this, `Unsupported object type: ${tObjType}`, Symbol.for("showObjectInfo"), Symbol.for("minor"));
        this.pCurrentlySelectedUserId = VOID;
        tObj = 0;
    }
    if (tObj == 0) {
      tProps = 0;
    } else {
      tProps = tObj.getInfo();
    }
    if (listp(tProps)) {
      tWndObj.getElement("bg_darken").show();
      tWndObj.getElement("info_name").show();
      tWndObj.getElement("info_text").show();
      tWndObj.getElement("info_name").setText(tProps[Symbol.for("name")]);
      tWndObj.getElement("info_text").setText(tProps[Symbol.for("custom")]);
      let tElem = tWndObj.getElement("info_image");
      if (ilk(tProps[Symbol.for("image")]) == Symbol.for("image")) {
        tElem.resizeTo(tProps[Symbol.for("image")].width, tProps[Symbol.for("image")].height);
        tElem.getProperty(Symbol.for("sprite")).member.regPoint = point(tProps[Symbol.for("image")].width / 2, tProps[Symbol.for("image")].height);
        tElem.feedImage(tProps[Symbol.for("image")]);
      }
      this.updateInfoStandBadge(tProps[Symbol.for("badge")]);
      this.updateInfoStandGroup(tProps[Symbol.for("groupID")]);
      if (tObjType == "user") {
        this.pInfoStandName = tProps[Symbol.for("name")];
      } else {
        this.pInfoStandName = VOID;
      }
      return 1;
    } else {
      return this.hideObjectInfo();
    }
  }

  updateInfostandAvatar(tUserObj) {
    if (call(Symbol.for("getClass"), list(tUserObj)) != "user") {
      return 1;
    }
    if (tUserObj.getName() != this.pInfoStandName) {
      return 1;
    }
    let tRoomInterface = getThread(Symbol.for("room")).getInterface();
    let tSelectedObj = tRoomInterface.getSelectedObject();
    let tSaveSelectedObj = tSelectedObj;
    tRoomInterface.setSelectedObject(tUserObj.getID());
    this.showObjectInfo("user");
    tRoomInterface.setSelectedObject(tSaveSelectedObj);
    return 1;
  }

  hideObjectInfo() {
    executeMessage(Symbol.for("hideObjectDEVELOPMENT"));
    if (objectExists("BadgeEffect")) {
      removeObject("BadgeEffect");
    }
    if (!windowExists(this.pInfoStandId)) {
      return 0;
    }
    let tWndObj = getWindow(this.pInfoStandId);
    tWndObj.getElement("info_image").clearImage();
    tWndObj.getElement("bg_darken").hide();
    tWndObj.getElement("info_name").hide();
    tWndObj.getElement("info_text").hide();
    tWndObj.getElement("info_badge_1").clearImage();
    tWndObj.getElement("info_group_badge").clearImage();
    this.pCurrentlySelectedUserId = VOID;
    this.updateInfoStandGroup();
    return 1;
  }

  updateInfoStandBadge(tBadgeID, tUserID) {
    let tRoomInterface = getThread(Symbol.for("room")).getInterface();
    let tSelectedObj = tRoomInterface.getSelectedObject();
    return tRoomInterface.getBadgeObject().updateInfoStandBadge(this.pInfoStandId, tSelectedObj, tBadgeID, tUserID);
  }

  updateInfoStandGroup(tGroupId) {
    if (windowExists(this.pInfoStandId)) {
      let tWindowObj = getWindow(this.pInfoStandId);
      let tElem;
      if (tWindowObj.elementExists("info_group_badge")) {
        tElem = tWindowObj.getElement("info_group_badge");
      } else {
        return 0;
      }
    } else {
      return 0;
    }
    if (voidp(tGroupId) || (tGroupId < 0)) {
      tElem.clearImage();
      tElem.setProperty(Symbol.for("cursor"), "cursor.arrow");
      return 0;
    }
    let tRoomComponent = getThread(Symbol.for("room")).getComponent();
    let tGroupInfoObject = tRoomComponent.getGroupInfoObject();
    let tLogoMemNum = tGroupInfoObject.getGroupLogoMemberNum(tGroupId);
    if (!voidp(tGroupId)) {
      tElem.clearImage();
      tElem.setProperty(Symbol.for("image"), member(tLogoMemNum).image);
      tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
    } else {
      tElem.clearImage();
      tElem.setProperty(Symbol.for("cursor"), "cursor.arrow");
    }
  }

  groupLogoDownloaded(tGroupId) {
    let tRoomInterface = getThread(Symbol.for("room")).getInterface();
    let tRoomComponent = getThread(Symbol.for("room")).getComponent();
    let tSelectedObj = tRoomInterface.getSelectedObject();
    let tObj = tRoomComponent.getUserObject(tSelectedObj);
    if (tObj == 0) {
      return 0;
    }
    let tUsersGroup = tObj.getProperty(Symbol.for("groupID"));
    if (tUsersGroup == tGroupId) {
      this.updateInfoStandGroup(tGroupId);
    }
  }

  eventProcInfoStand(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "info_badge":
        let tSession = getObject(Symbol.for("session"));
        let tRoomInterface = getThread(Symbol.for("room")).getInterface();
        let tSelectedObj = tRoomInterface.getSelectedObject();
        if (tSelectedObj == tSession.GET("user_index")) {
        }
        break;
      case "info_group_badge":
        let tRoomInterface2 = getThread(Symbol.for("room")).getInterface();
        let tSelectedObj2 = tRoomInterface2.getSelectedObject();
        if (!voidp(tSelectedObj2) && (tSelectedObj2 != EMPTY)) {
          let tRoomComponent = getThread(Symbol.for("room")).getComponent();
          let tInfoObj = tRoomComponent.getGroupInfoObject();
          tInfoObj.showUsersInfoByName(this.pInfoStandName);
        }
        break;
    }
    return 1;
  }
}
