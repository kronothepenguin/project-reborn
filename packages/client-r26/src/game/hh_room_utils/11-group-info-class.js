export default class {
  pGroupWindowID;
  pGroupData;
  pCurrentShownGroupId;
  pGroupsWithDownloadedLogo;
  pGroupLogoMemPrefix;
  pGroupLogoTemplateMember;
  pGroupLogoUrlTemplate;
  pLastPendingData;

  construct() {
    this.pGroupWindowID = getText("group_window_title");
    this.pGroupData = propList();
    this.pCurrentShownGroupId = VOID;
    this.pGroupsWithDownloadedLogo = list();
    this.pLastPendingData = propList();
    this.pGroupLogoMemPrefix = "group_logo_";
    this.pGroupLogoTemplateMember = "logo_downloading_template";
    this.pGroupLogoUrlTemplate = getText("group_logo_url_template");
    registerMessage(Symbol.for("roomReady"), this.getID(), Symbol.for("requestGroups"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("clearGroups"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("clearGroups"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("userClicked"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    return 1;
  }

  updateGroupInformation(tGroupsArr) {
    if (!listp(tGroupsArr)) {
      return 0;
    }
    for (const tIncomingGroupData of tGroupsArr) {
      let tID = string(tIncomingGroupData[Symbol.for("id")]);
      let tCombinedData = propList();
      if (!voidp(this.pGroupData[tID])) {
        tCombinedData = this.pGroupData[tID];
      }
      let tKeyList = list(Symbol.for("id"), Symbol.for("name"), Symbol.for("desc"), Symbol.for("logo"), Symbol.for("roomid"), Symbol.for("roomname"));
      for (const tKey of tKeyList) {
        if (!voidp(tIncomingGroupData[tKey])) {
          tCombinedData[tKey] = tIncomingGroupData[tKey];
          if (tKey == Symbol.for("logo")) {
            tCombinedData[Symbol.for("download")] = Symbol.for("invalid");
          }
        }
      }
      this.pGroupData[tID] = tCombinedData;
      if (this.pLastPendingData[Symbol.for("groupID")] == tID) {
        this.showUsersInfo(this.pLastPendingData[Symbol.for("userindex")]);
        this.pGroupData[tID][Symbol.for("download")] = Symbol.for("done");
        this.pLastPendingData = propList();
      }
    }
  }

  getGroupInformation(tGroupId) {
    let tGroupInfo = propList();
    tGroupId = string(tGroupId);
    if (!voidp(this.pGroupData[tGroupId])) {
      tGroupInfo = this.pGroupData[tGroupId];
    }
    return tGroupInfo;
  }

  getGroupLogoMemberNum(tGroupId) {
    let tGroupData = this.pGroupData.getaProp(tGroupId);
    if (voidp(tGroupData)) {
      return getmemnum(this.pGroupLogoTemplateMember);
    }
    let tGroupLogoMem = `${this.pGroupLogoMemPrefix}${tGroupData[Symbol.for("logo")]}`;
    if (memberExists(tGroupLogoMem)) {
      return getmemnum(tGroupLogoMem);
    } else {
      this.requestLogoDownload(tGroupId);
      return getmemnum(this.pGroupLogoTemplateMember);
    }
  }

  closeView() {
    removeWindow(this.pGroupWindowID);
  }

  clearGroups() {
    this.closeView();
    this.pGroupInformation = propList();
    this.pCurrentShownGroupId = VOID;
  }

  requestGroups() {
    getConnection(getVariable("connection.room.id")).send("GET_GROUP_BADGES");
  }

  getLogoURL(tGroupId) {
    if (voidp(tGroupId)) {
      return 0;
    }
    let tURL = EMPTY;
    let tGroupData = this.pGroupData[tGroupId];
    if (ilk(tGroupData) == Symbol.for("propList")) {
      tURL = this.pGroupLogoUrlTemplate;
      let tGroupLogoPath = tGroupData[Symbol.for("logo")];
      tURL = replaceChunks(tURL, "%imagerdata%", tGroupLogoPath);
    }
    return tURL;
  }

  requestLogoDownload(tGroupId) {
    tGroupId = string(tGroupId);
    let tGroupData = this.pGroupData.getaProp(tGroupId);
    if (ilk(tGroupData) != Symbol.for("propList")) {
      return error(this, `No group found: ${tGroupId}`, this.getID(), Symbol.for("requestLogoDownload"), Symbol.for("minor"));
    }
    let tDownloadStatus = tGroupData[Symbol.for("download")];
    if (!(voidp(tDownloadStatus) || (tDownloadStatus == Symbol.for("invalid")))) {
      return 0;
    } else {
      this.pGroupData[tGroupId][Symbol.for("download")] = Symbol.for("downloading");
    }
    let tMemberName = `${this.pGroupLogoMemPrefix}${tGroupData[Symbol.for("logo")]}`;
    let tLogoURL = this.getLogoURL(tGroupId);
    let tMemNum = queueDownload(tLogoURL, tMemberName, Symbol.for("bitmap"), 1);
    registerDownloadCallback(tMemNum, Symbol.for("logoDownloadedCallback"), this.getID(), tGroupId);
  }

  logoDownloadedCallback(tGroupId) {
    executeMessage(Symbol.for("groupLogoDownloaded"), tGroupId);
    this.updateGroupLogoToWindow(tGroupId);
  }

  showUsersInfoByName(tUserName) {
    let tUserIndex = getThread(Symbol.for("room")).getComponent().getUsersRoomId(tUserName);
    if (tUserIndex != -1) {
      this.showUsersInfo(tUserIndex);
    }
  }

  showUsersInfo(tUserIndex) {
    let tRoomComponent = getThread(Symbol.for("room")).getComponent();
    let tuser = tRoomComponent.getUserObject(tUserIndex);
    if (voidp(tuser)) {
      return 0;
    }
    let tGroupId = tuser.getProperty(Symbol.for("groupID"));
    tGroupId = string(tGroupId);
    let tGroupStatus = tuser.getProperty(Symbol.for("groupstatus"));
    if (tGroupId == EMPTY) {
      return 0;
    }
    if (integer(tGroupId) < 0) {
      return 0;
    }
    if (voidp(this.pGroupData[tGroupId])) {
      this.pLastPendingData = propList("userindex", tUserIndex, "groupID", tGroupId);
      getConnection(getVariable("connection.info.id")).send("GET_GROUP_DETAILS", propList("integer", integer(tGroupId)));
      return 0;
    }
    if (voidp(this.pGroupData[tGroupId][Symbol.for("name")])) {
      this.pLastPendingData = propList("userindex", tUserIndex, "groupID", tGroupId);
      getConnection(getVariable("connection.info.id")).send("GET_GROUP_DETAILS", propList("integer", integer(tGroupId)));
      return 0;
    }
    if (!windowExists(this.pGroupWindowID)) {
      createWindow(this.pGroupWindowID, "habbo_full.window");
      let tWindowObj = getWindow(this.pGroupWindowID);
      tWindowObj.merge("group_info.window");
      tWindowObj.registerProcedure(Symbol.for("eventProcInfoWindow"), this.getID(), Symbol.for("mouseUp"));
    }
    let tWindowObj = getWindow(this.pGroupWindowID);
    let tGroup = this.pGroupData[tGroupId];
    let tUserStatusTxt = EMPTY;
    switch (tGroupStatus) {
      case 1:
        tUserStatusTxt = getText("group_owner");
        break;
      case 2:
        tUserStatusTxt = getText("group_admin");
        break;
      case 3:
        tUserStatusTxt = getText("group_member");
        break;
    }
    let tPrivilegesTxt = getText("group_privileges");
    tPrivilegesTxt = `${tPrivilegesTxt} ${tUserStatusTxt}`;
    tWindowObj.getElement("group_name").setText(tGroup[Symbol.for("name")]);
    tWindowObj.getElement("group_privileges").setText(tPrivilegesTxt);
    tWindowObj.getElement("group_description").setText(tGroup[Symbol.for("desc")]);
    this.pCurrentShownGroupId = tGroupId;
    let tRoomLinkElem = tWindowObj.getElement("group_room_link");
    if (tGroup[Symbol.for("roomid")] < 0) {
      tRoomLinkElem.hide();
    } else {
      let tRoomNameTemplate = getText("group_room_link");
      let tRoomLinkText = replaceChunks(tRoomNameTemplate, "%room_name%", tGroup[Symbol.for("roomname")]);
      tRoomLinkElem.setText(tRoomLinkText);
      tRoomLinkElem.show();
    }
    this.updateGroupLogoToWindow(tGroupId);
  }

  updateGroupLogoToWindow(tGroupId) {
    if (voidp(tGroupId)) {
      return 0;
    }
    if (!windowExists(this.pGroupWindowID)) {
      return 0;
    }
    if (this.pCurrentShownGroupId != tGroupId) {
      return 0;
    }
    let tWindowObj = getWindow(this.pGroupWindowID);
    if (!tWindowObj.elementExists("group_logo")) {
      return 0;
    }
    let tGroupLogoMemNum = this.getGroupLogoMemberNum(tGroupId);
    let tLogoImg = member(tGroupLogoMemNum).image;
    tWindowObj.getElement("group_logo").clearImage();
    tWindowObj.getElement("group_logo").feedImage(tLogoImg);
  }

  eventProcInfoWindow(tEvent, tSprID, tParams) {
    switch (tSprID) {
      case "group_homepage_link":
        let tGroupId = this.pGroupData[this.pCurrentShownGroupId][Symbol.for("id")];
        let tGroupURL = getText("group_homepage_url");
        tGroupURL = replaceChunks(tGroupURL, "%groupid%", tGroupId);
        executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
        openNetPage(tGroupURL);
        break;
      case "group_room_link":
        let tForwardId = string(this.pGroupData[this.pCurrentShownGroupId][Symbol.for("roomid")]);
        let tForwardType = Symbol.for("private");
        executeMessage(Symbol.for("roomForward"), tForwardId, tForwardType);
        break;
    }
  }
}
