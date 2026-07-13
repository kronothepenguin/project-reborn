export default class {
  pWindowID;
  pUseRatings;
  pEventInfoWindowID;

  construct() {
    this.pWindowID = "RoomInfoWindow";
    this.pEventInfoWindowID = "EventInfoWindow";
    this.pUseRatings = 0;
    if (variableExists("room.rating.enable")) {
      if (getVariable("room.rating.enable") == 1) {
        this.pUseRatings = 1;
      }
    }
    registerMessage(Symbol.for("roomRatingChanged"), this.getID(), Symbol.for("updateRatingData"));
    registerMessage(Symbol.for("roomEventInfoUpdated"), this.getID(), Symbol.for("updateRoomEventInfo"));
    return 1;
  }

  deconstruct() {
    return 1;
  }

  showRoomInfo() {
    let tRoomData = getThread(Symbol.for("room")).getComponent().getRoomData();
    let tRoomType;
    if (listp(tRoomData)) {
      tRoomType = tRoomData.getaProp(Symbol.for("type"));
    }
    if (tRoomType == Symbol.for("private")) {
      let tWndObj = this.createInfoWindow();
      if (tWndObj == 0) {
        return 0;
      }
      tRoomData = getThread(Symbol.for("room")).getComponent().pSaveData;
      tWndObj.getElement("room_info_room_name").setText(tRoomData[Symbol.for("name")]);
      tWndObj.getElement("room_info_owner").setText(`${getText("room_owner")} ${tRoomData[Symbol.for("owner")]}`);
      this.updateRatingData();
      this.updateRoomEventInfo();
    } else {
      this.hideRoomInfo();
    }
  }

  hideRoomInfo() {
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    if (windowExists(this.pEventInfoWindowID)) {
      removeWindow(this.pEventInfoWindowID);
    }
  }

  createInfoWindow() {
    if (!windowExists(this.pWindowID)) {
      let tSuccess = createWindow(this.pWindowID, "room_info.window", 10, 420);
      if (tSuccess == 0) {
        return 0;
      } else {
        let tWndObj = getWindow(this.pWindowID);
        tWndObj.lock();
        tWndObj.registerProcedure(Symbol.for("eventProcInfo"), this.getID());
        return tWndObj;
      }
    } else {
      return getWindow(this.pWindowID);
    }
  }

  sendFlatRate(tValue) {
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("RATEFLAT", propList("integer", tValue));
  }

  updateRatingData() {
    let tWndObj = getWindow(this.pWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (!tWndObj.elementExists("room_info_rate_plus")) {
      return 0;
    }
    if (!this.pUseRatings) {
      this.hideRatingElements();
      return 1;
    }
    let tRoomRatings = getThread(Symbol.for("room")).getComponent().getRoomRating();
    if (tRoomRatings[Symbol.for("rate")] == -1) {
      tWndObj.getElement("room_info_rate_plus").setProperty(Symbol.for("visible"), 1);
      tWndObj.getElement("room_info_rate_minus").setProperty(Symbol.for("visible"), 1);
      tWndObj.getElement("room_info_rate_room").setProperty(Symbol.for("visible"), 1);
      tWndObj.getElement("room_info_rate_value").setProperty(Symbol.for("visible"), 0);
    } else {
      tWndObj.getElement("room_info_rate_plus").setProperty(Symbol.for("visible"), 0);
      tWndObj.getElement("room_info_rate_minus").setProperty(Symbol.for("visible"), 0);
      tWndObj.getElement("room_info_rate_room").setProperty(Symbol.for("visible"), 0);
      tWndObj.getElement("room_info_rate_value").setProperty(Symbol.for("visible"), 1);
      let tRateText = `${getText("room_info_rated")} ${tRoomRatings[Symbol.for("rate")]}`;
      tWndObj.getElement("room_info_rate_value").setText(tRateText);
    }
  }

  hideRatingElements() {
    let tWndObj = getWindow(this.pWindowID);
    tWndObj.getElement("room_info_rate_room").setProperty(Symbol.for("visible"), 0);
    tWndObj.getElement("room_info_rate_plus").setProperty(Symbol.for("visible"), 0);
    tWndObj.getElement("room_info_rate_minus").setProperty(Symbol.for("visible"), 0);
    tWndObj.getElement("room_info_rate_value").setProperty(Symbol.for("visible"), 0);
  }

  updateRoomEventInfo() {
    let tRoomEventData = getThread(Symbol.for("room")).getComponent().getRoomEvent();
    if (voidp(tRoomEventData)) {
      return 0;
    }
    let tWnd = getWindow(this.pWindowID);
    if (tWnd == 0) {
      return 0;
    }
    let tLinkElem = tWnd.getElement("roominfo_event_link");
    let tHostID = tRoomEventData.getaProp(Symbol.for("hostID"));
    if (tHostID > 0) {
      tLinkElem.show();
      let tName = tRoomEventData.getaProp(Symbol.for("name"));
      tLinkElem.setText(tName);
    } else {
      tLinkElem.hide();
    }
  }

  showEventInfo() {
    let tRoomEventData = getThread(Symbol.for("room")).getComponent().getRoomEvent();
    createWindow(this.pEventInfoWindowID, "eventinfo_bubble.window");
    let tWnd = getWindow(this.pEventInfoWindowID);
    tWnd.merge("room_info_event_details.window");
    let tName = tRoomEventData.getaProp(Symbol.for("name"));
    let tDesc = tRoomEventData.getaProp(Symbol.for("desc"));
    tWnd.getElement("room_info_event_details_header").setText(tName);
    tWnd.getElement("room_info_event_details_text").setText(tDesc);
    tWnd.registerProcedure(Symbol.for("eventProcEventInfo"), this.getID(), Symbol.for("mouseUp"));
    tWnd.moveTo(5, 355);
    let tSessionObj = getObject(Symbol.for("session"));
    let tUserRights = tSessionObj.GET("user_rights");
    let tRoomOwner = tSessionObj.GET("room_owner");
    let tCanQuit = tUserRights.getOne("fuse_cancel_roomevent") != 0;
    if (tRoomOwner || tCanQuit) {
      tWnd.getElement("room_info_event_details_quit").show();
      tWnd.getElement("room_info_event_details_edit").show();
    } else {
      tWnd.getElement("room_info_event_details_quit").hide();
      tWnd.getElement("room_info_event_details_edit").hide();
    }
  }

  removeEventInfo() {
    removeWindow(this.pEventInfoWindowID);
  }

  quitEvent() {
    let tConn = getConnection(getVariable("connection.info.id", Symbol.for("Info")));
    tConn.send("QUIT_ROOMEVENT");
    this.removeEventInfo();
  }

  editEvent() {
    executeMessage(Symbol.for("editRoomevent"));
    this.removeEventInfo();
  }

  eventProcInfo(tEvent, tSprID, tParam) {
    if (tEvent != Symbol.for("mouseUp")) {
      return 0;
    }
    switch (tSprID) {
      case "room_info_rate_plus":
        this.sendFlatRate(1);
        break;
      case "room_info_rate_minus":
        this.sendFlatRate(-1);
        break;
      case "roominfo_event_link":
        this.showEventInfo();
        break;
    }
  }

  eventProcEventInfo(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "room_info_event_details_close":
        this.removeEventInfo();
        break;
      case "room_info_event_details_quit":
        this.quitEvent();
        break;
      case "room_info_event_details_edit":
        this.editEvent();
        break;
    }
  }
}
