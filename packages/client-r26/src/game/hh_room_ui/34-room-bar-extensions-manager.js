export default class {
  pRoomInvitationClass;
  pFriendRequestClass;
  pBottomBarId;
  pShowInstantFriendRequests;
  pInvitationData;
  pFriendRequestData;
  pVisibleItemID;
  pVisibleItem;

  construct() {
    this.pRoomInvitationClass = "Invitation Class";
    this.pFriendRequestClass = "Instant Friend Request Class";
    this.pVisibleItemID = "Visible Room Bar Extension Item";
    this.pInvitationData = propList();
    this.pFriendRequestData = propList();
    this.pVisibleItem = VOID;
    this.pShowInstantFriendRequests = 1;
    registerMessage(Symbol.for("FriendRequestListOpened"), this.getID(), Symbol.for("clearFriendRequestsFromStack"));
    registerMessage(Symbol.for("updateFriendRequestCount"), this.getID(), Symbol.for("viewNextItemInStack"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("FriendRequestListOpened"), this.getID());
    unregisterMessage(Symbol.for("updateFriendRequestCount"), this.getID());
    return 1;
  }

  define(tBottomBarID) {
    this.pBottomBarId = tBottomBarID;
  }

  hideExtensions() {
    this.hideInvitation();
    this.hideFriendRequest();
  }

  registerInvitation(tInvitationData) {
    this.pInvitationData = tInvitationData;
    this.showPendingInvitation();
  }

  clearFriendRequestsFromStack() {
    this.hideFriendRequest();
    this.showPendingInvitation();
  }

  showPendingInvitation() {
    if (this.pVisibleItem != VOID) {
      return 0;
    }
    if (this.pInvitationData.count < 1) {
      return 0;
    }
    if (objectExists(this.pVisibleItemID)) {
      return 1;
    }
    let tInvitationObj = createObject(this.pVisibleItemID, this.pRoomInvitationClass);
    if (!tInvitationObj) {
      return 0;
    }
    if (!tInvitationObj.show(this.pInvitationData, this.pBottomBarId, "friend_list_icon")) {
      if (objectExists(this.pVisibleItemID)) {
        removeObject(this.pVisibleItemID);
      }
      return 0;
    }
    this.pVisibleItem = Symbol.for("invitation");
    return 1;
  }

  showPendingInstantFriendRequest() {
    if (!this.pShowInstantFriendRequests) {
      return 0;
    }
    if (!voidp(this.pVisibleItem) && !(this.pVisibleItem == Symbol.for("friendrequest"))) {
      return 0;
    }
    if (objectExists(this.pVisibleItemID)) {
      return 1;
    }
    if (!threadExists(Symbol.for("friend_list"))) {
      return 0;
    }
    let tRoomComponent = getThread(Symbol.for("room")).getComponent();
    let tRoomData = tRoomComponent.getRoomData();
    if (!(ilk(tRoomData) == Symbol.for("propList"))) {
      return 0;
    }
    if (!((tRoomData[Symbol.for("type")] == Symbol.for("private")) || (tRoomData[Symbol.for("type")] == Symbol.for("public")))) {
      return 0;
    }
    if (!threadExists(Symbol.for("friend_list"))) {
      return 0;
    }
    let tFriendListComponent = getThread(Symbol.for("friend_list")).getComponent();
    let tFriendListInterface = getThread(Symbol.for("friend_list")).getInterface();
    if (tFriendListInterface.isFriendRequestViewOpen()) {
      return 0;
    }
    let tPendingRequests = tFriendListComponent.getPendingFriendRequests();
    if (tPendingRequests.count == 0) {
      this.hideFriendRequest();
      return 0;
    }
    for (const tPendingRequest of tPendingRequests) {
      let tRoomID = tRoomComponent.getUsersRoomId(tPendingRequest[Symbol.for("name")]);
      let tUserObj = tRoomComponent.getUserObject(tRoomID);
      if (!(tUserObj == 0)) {
        createObject(this.pVisibleItemID, this.pFriendRequestClass);
        let tObj = getObject(this.pVisibleItemID);
        tObj.define(this.pBottomBarId, "friend_list_icon", tPendingRequest, this.getID());
        tObj.show();
        this.pFriendRequestData = tPendingRequest;
        this.pVisibleItem = Symbol.for("friendrequest");
        return 1;
      }
    }
    return 0;
  }

  ignoreInstantFriendRequests() {
    this.pShowInstantFriendRequests = 0;
    this.hideFriendRequest();
    this.showPendingInvitation();
  }

  viewNextItemInStack() {
    let tFrShown = this.showPendingInstantFriendRequest();
    if (!tFrShown) {
      this.showPendingInvitation();
    }
  }

  confirmFriendRequest(tAccept) {
    if (!threadExists(Symbol.for("friend_list"))) {
      return 0;
    }
    let tFriendListComponent = getThread(Symbol.for("friend_list")).getComponent();
    let tFriendListInterface = getThread(Symbol.for("friend_list")).getInterface();
    let tRequestId = this.pFriendRequestData[Symbol.for("id")];
    if (tAccept) {
      if (tFriendListComponent.isFriendListFull()) {
        executeMessage(Symbol.for("alert"), "console_fr_limit_exceeded_error");
        this.hideFriendRequest();
        return 0;
      }
      tFriendListComponent.updateFriendRequest(this.pFriendRequestData, Symbol.for("accepted"));
    } else {
      tFriendListComponent.updateFriendRequest(this.pFriendRequestData, Symbol.for("rejected"));
    }
    this.hideFriendRequest();
  }

  acceptInvitation() {
    if (ilk(this.pInvitationData) != Symbol.for("propList")) {
      return 0;
    }
    let tSenderId = this.pInvitationData.getaProp(Symbol.for("userID"));
    if (voidp(tSenderId)) {
      return 0;
    }
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("MSG_ACCEPT_TUTOR_INVITATION", propList("string", tSenderId));
    }
    this.hideInvitation();
  }

  rejectInvitation() {
    let tSenderId = this.pInvitationData.getaProp(Symbol.for("userID"));
    if (voidp(tSenderId)) {
      return 0;
    }
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("MSG_REJECT_TUTOR_INVITATION", propList("string", tSenderId));
    }
    this.hideInvitation();
    createTimeout(Symbol.for("room_bar_extension_next_update"), 1000, Symbol.for("viewNextItemInStack"), this.getID(), VOID, 1);
  }

  hideInvitation() {
    if (this.pVisibleItem == Symbol.for("invitation")) {
      removeObject(this.pVisibleItemID);
      this.pVisibleItem = VOID;
    }
    this.pInvitationData = propList();
  }

  hideFriendRequest() {
    if (this.pVisibleItem == Symbol.for("friendrequest")) {
      removeObject(this.pVisibleItemID);
      this.pVisibleItem = VOID;
    }
    this.pFriendRequestData = propList();
  }

  invitationFollowFailed() {
    executeMessage(Symbol.for("alert"), "invitation_follow_failed");
  }
}
