export default class {
  pBubbles;
  pInvitationWindowID;
  pInvitationStatusWindowID;
  pInvitationStatusTimeoutID;
  pSearchAnimFrame;

  construct() {
    pBubbles = propList();
    pUpdateOwnUserHelp = 0;
    pInvitationWindowID = Symbol.for("NUH_invite_window_ID");
    pInvitationStatusWindowID = Symbol.for("NUH_invite_status_window_ID");
    pInvitationStatusTimeoutID = Symbol.for("NUH_invite_status_timeout_ID");
    pSearchAnimFrame = 1;
    registerMessage(Symbol.for("gamesystem_constructed"), this.getID(), Symbol.for("hideInvitationStatusWindow"));
    return 1;
  }

  deconstruct() {
    this.removeAll();
    this.hideInvitationStatusWindow();
    unregisterMessage(Symbol.for("gamesystem_constructed"), this.getID());
    return 1;
  }

  removeAll() {
    for (let tItemNo = 1; tItemNo <= pBubbles.count; tItemNo++) {
      tBubble = pBubbles[tItemNo];
      tBubble.deconstruct();
    }
    pBubbles = propList();
    this.hideInvitationWindow();
  }

  showOwnUserHelp() {
    tRoomComponent = getThread("room").getComponent();
    tOwnRoomId = tRoomComponent.getUsersRoomId(getObject(Symbol.for("session")).GET("user_name"));
    tHumanObj = tRoomComponent.getUserObject(tOwnRoomId);
    if (tHumanObj == 0) {
      return 0;
    }
    tRoomComponent = getThread("room").getComponent();
    if (tRoomComponent == 0) {
      return 0;
    }
    tBubble = createObject(Symbol.for("random"), getVariableValue("update.bubble.class"));
    if (tBubble == 0) {
      return 0;
    }
    tHelpId = "own_user";
    tPointer = 7;
    tText = getText(`NUH_${tHelpId}`);
    tBubble.setProperty(Symbol.for("bubbleId"), tHelpId);
    tBubble.setText(tText);
    tBubble.selectPointerAndPosition(tPointer);
    tBubble.show();
    if (objectp(pBubbles.getaProp(tHelpId))) {
      tPreviousBubble = pBubbles[tHelpId];
      tPreviousBubble.deconstruct();
    }
    pBubbles[tHelpId] = tBubble;
  }

  showGenericHelp(tHelpId, tTargetLoc, tPointerIndex) {
    tRoomID = getThread(Symbol.for("room")).getComponent().getRoomID();
    if ((tRoomID == EMPTY) || (tRoomID == Symbol.for("game")) || (tRoomID == "game")) {
      return 0;
    }
    tLocX = 0;
    tLocY = 0;
    tText = EMPTY;
    tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    if (voidp(tTargetLoc) || !listp(tTargetLoc)) {
      tLocX = getVariable(`NUH.${tHelpId}.bubble.loc`).item[1];
      tLocY = getVariable(`NUH.${tHelpId}.bubble.loc`).item[2];
    } else {
      tLocX = tTargetLoc[1];
      tLocY = tTargetLoc[2];
    }
    the.itemDelimiter = tDelim;
    if (voidp(tPointerIndex)) {
      tPointer = getVariable(`NUH.${tHelpId}.pointer`);
    } else {
      tPointer = tPointerIndex;
    }
    tText = getText(`NUH_${tHelpId}`);
    tBubble = createObject(Symbol.for("random"), getVariableValue("static.bubble.class"));
    if (tBubble == 0) {
      return 0;
    }
    tBubble.setProperty(Symbol.for("bubbleId"), tHelpId);
    tBubble.setText(tText);
    tBubble.setProperty(Symbol.for("targetX"), tLocX);
    tBubble.setProperty(Symbol.for("targetY"), tLocY);
    tBubble.selectPointerAndPosition(tPointer);
    tBubble.show();
    tBubble.hideCloseButton();
    if (objectp(pBubbles.getaProp(tHelpId))) {
      tPreviousBubble = pBubbles[tHelpId];
      tPreviousBubble.deconstruct();
    }
    pBubbles[tHelpId] = tBubble;
  }

  removeHelpBubble(tHelpItemName) {
    tBubble = pBubbles.getaProp(tHelpItemName);
    if (objectp(tBubble)) {
      tBubble.deconstruct();
    }
  }

  showInviteWindow() {
    this.hideInvitationWindow();
    createWindow(pInvitationWindowID, "nuh_invitation.window");
    tWindow = getWindow(pInvitationWindowID);
    tLocX = getVariable("NUH.invitation.loc").item[1];
    tLocY = getVariable("NUH.invitation.loc").item[2];
    tHeader = getText("send_invitation_header");
    tWindow.getElement("nuh_invitation_header").setText(tHeader);
    tText = getText("send_invitation_text");
    tWindow.getElement("nuh_invitation_text").setText(tText);
    tWindow.moveTo(tLocX, tLocY);
    tWindow.registerProcedure(Symbol.for("eventProcInvitation"), this.getID(), Symbol.for("mouseUp"));
  }

  hideInvitationWindow() {
    if (windowExists(pInvitationWindowID)) {
      removeWindow(pInvitationWindowID);
    }
  }

  showInvitationStatusWindow(tstate) {
    this.hideInvitationStatusWindow();
    switch (tstate) {
      case Symbol.for("Search"):
        tLayout = "nuh_invitation_status.window";
        break;
      case Symbol.for("room_left"):
        tLayout = "nuh_room_left.window";
        break;
      case Symbol.for("success"):
        tLayout = "nuh_invitation_success.window";
        break;
      case Symbol.for("failure"):
        tLayout = "nuh_invitation_failure.window";
        break;
      default:
        return 0;
    }
    createWindow(pInvitationStatusWindowID, tLayout);
    tWindow = getWindow(pInvitationStatusWindowID);
    tWindow.moveTo(10, 10);
    tWindow.registerProcedure(Symbol.for("eventProcInvitationStatus"), this.getID(), Symbol.for("mouseUp"));
    if (timeoutExists(pInvitationStatusTimeoutID)) {
      removeTimeout(pInvitationStatusTimeoutID);
    }
    switch (tstate) {
      case Symbol.for("Search"):
        createTimeout(pInvitationStatusTimeoutID, 250, Symbol.for("updateInvitationStatusWindow"), this.getID(), VOID, 0);
        break;
      case Symbol.for("success"):
        createTimeout(pInvitationStatusTimeoutID, 3000, Symbol.for("hideInvitationStatusWindow"), this.getID(), VOID, 1);
        break;
    }
  }

  hideInvitationStatusWindow() {
    if (windowExists(pInvitationStatusWindowID)) {
      removeWindow(pInvitationStatusWindowID);
    }
    if (timeoutExists(pInvitationStatusTimeoutID)) {
      removeTimeout(pInvitationStatusTimeoutID);
    }
  }

  updateInvitationStatusWindow() {
    if (!windowExists(pInvitationStatusWindowID)) {
      return 0;
    }
    tWindow = getWindow(pInvitationStatusWindowID);
    if (tWindow.elementExists("nuh_search")) {
      tElem = tWindow.getElement("nuh_search");
      pSearchAnimFrame = pSearchAnimFrame + 1;
      if (pSearchAnimFrame > 3) {
        pSearchAnimFrame = 1;
      }
      tMemName = `nuh_search_${pSearchAnimFrame}`;
      if (memberExists(tMemName)) {
        tElem.setProperty(Symbol.for("image"), member(getmemnum(tMemName)).image);
      }
    }
    if (tWindow.elementExists("nuh_invitation_status_counter")) {
      tCount = this.getComponent().getGuideCount();
      tText = `${getText("NUH_invitation_guides_found")} ${tCount}`;
      tElem = tWindow.getElement("nuh_invitation_status_counter");
      tElem.setText(tText);
    }
  }

  eventProcInvitation(tEvent, tSprID) {
    switch (tSprID) {
      case "nuh_invitation_yes":
        this.getComponent().closeInvitation(Symbol.for("yes"));
        break;
      case "nuh_invitation_no":
        this.getComponent().closeInvitation(Symbol.for("no"));
        break;
      case "nuh_invitation_never":
        this.getComponent().closeInvitation(Symbol.for("never"));
        break;
    }
  }

  eventProcInvitationStatus(tEvent, tSprID) {
    if (tSprID.contains("nuh_invitation_option")) {
      tOption = tSprID.char[tSprID.length];
      tVarName = `NUH.invitation.option.${tOption}`;
      if (variableExists(tVarName)) {
        tMsg = value(getVariable(tVarName));
        executeMessage(tMsg);
        this.hideInvitationStatusWindow();
      }
      return 1;
    }
    switch (tSprID) {
      case "nuh_invitation_status_cancel":
      case "nuh_invitation_status_close":
        this.getComponent().cancelInvitations();
        this.hideInvitationStatusWindow();
        break;
      case "nuh_room_left_back":
        this.getComponent().goToInvitationRoom();
        break;
      case "close_button":
        this.hideInvitationStatusWindow();
        break;
    }
  }
}
