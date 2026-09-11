export default class {
  pWindowID;
  pTabsObj;
  pChatRenderers;
  pActiveChatID;
  pNames;
  pScaleEventAgentID;
  pOrigLocH;
  pOrigHeight;
  pScale;
  pMinHeight;
  pCachedChatIDs;
  pCacheSize;
  pEntryBuffer;
  pRenderTimeoutID;
  pBatchSize;
  pBatchInterval;
  pState;
  pInvitationWindowID;
  pFollowFlashList;
  pFollowFlashState;
  pFollowFlashTimeoutID;
  pView;

  construct() {
    this.pWindowID = "Instant Messenger";
    this.pInvitationWindowID = "Friend Invitation Window";
    this.pTabsObj = createObject(Symbol.for("temp"), "IM Tabs Class");
    this.pChatRenderers = propList();
    this.pNames = propList();
    this.pCachedChatIDs = list();
    this.pFollowFlashList = list();
    this.pFollowFlashTimeoutID = "Flash Follow Button Timeout";
    this.pMinHeight = getIntVariable("im.window.height.min");
    this.pBatchSize = getIntVariable("im.batch.size");
    this.pBatchInterval = getIntVariable("im.batch.interval");
    this.pCacheSize = getIntVariable("im.cached.chats");
    this.pScaleEventAgentID = getUniqueID();
    this.pRenderTimeoutID = Symbol.for("IMRenderTimeout");
    this.setState(Symbol.for("Active"));
    createObject(this.pScaleEventAgentID, getClassVariable("event.agent.class"));
    registerMessage(Symbol.for("toggle_im"), this.getID(), Symbol.for("toggleIMWindow"));
    registerMessage(Symbol.for("gamesystem_constructed"), this.getID(), Symbol.for("closeIMWindow"));
    return 1;
  }

  deconstruct() {
    if (objectExists(this.pScaleEventAgentID)) {
      removeObject(this.pScaleEventAgentID);
    }
    if (timeoutExists(this.pFollowFlashTimeoutID)) {
      removeTimeout(this.pFollowFlashTimeoutID);
    }
    if (timeoutExists(this.pRenderTimeoutID)) {
      removeTimeout(this.pRenderTimeoutID);
    }
    unregisterMessage(Symbol.for("toggle_im"), this.getID());
    unregisterMessage(Symbol.for("gamesystem_constructed"), this.getID());
    return 1;
  }

  createIMWindow() {
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    let tLocH = (the.stage).rect.width - getIntVariable("im.window.margin.right");
    let tLocV = getIntVariable("im.window.margin.top");
    createWindow(this.pWindowID, "instant_message.window", tLocH, tLocV);
    this.pView = Symbol.for("normal");
    let tWnd = getWindow(this.pWindowID);
    tWnd.registerProcedure(Symbol.for("eventProcIM"), this.getID(), Symbol.for("keyDown"));
    tWnd.registerProcedure(Symbol.for("eventProcIM"), this.getID(), Symbol.for("mouseUp"));
    tWnd.registerProcedure(Symbol.for("eventProcIM"), this.getID(), Symbol.for("mouseDown"));
  }

  openIMWindow() {
    if (!windowExists(this.pWindowID)) {
      this.createIMWindow();
    } else {
      let tWnd = getWindow(this.pWindowID);
      tWnd.show();
      activateWindowObj(this.pWindowID);
    }
    if (this.pChatRenderers.count == 0) {
      this.ChangeWindowView(Symbol.for("empty"));
    }
    this.updateInterface();
    this.setState(Symbol.for("Active"));
  }

  closeIMWindow() {
    if (windowExists(this.pWindowID)) {
      let tWnd = getWindow(this.pWindowID);
      if (tWnd.elementExists("chat.input")) {
        tWnd.getElement("chat.input").setFocus(0);
      }
      tWnd.hide();
    }
  }

  toggleIMWindow() {
    if (!windowExists(this.pWindowID)) {
      return this.openIMWindow();
    }
    let tWnd = getWindow(this.pWindowID);
    if (tWnd.getProperty(Symbol.for("visible"))) {
      this.closeIMWindow();
    } else {
      this.openIMWindow();
    }
  }

  addChat(tChatID, tFriend, tDontPlaySound) {
    this.getChatRenderer(tChatID);
    if (voidp(tFriend)) {
      tFriend = this.getComponent().getFriend(tChatID);
    }
    if (voidp(tFriend)) {
      return 0;
    }
    this.pTabsObj.addTab(tChatID);
    if (!tDontPlaySound) {
      let tSoundMemName = getVariable("im.new.tab.sound");
      let tVolume = getIntVariable("im.sound.volume", 255);
      playSound(tSoundMemName, Symbol.for("cut"), propList("loopCount", 1, "infiniteloop", 0, "volume", tVolume));
    }
    let tName = tFriend.getaProp(Symbol.for("name"));
    this.pNames.setaProp(tChatID, tName);
    if (this.pChatRenderers.count == 1) {
      this.activateChat(tChatID);
      this.pTabsObj.showTab(tChatID);
    }
    this.updateInterface();
    return 1;
  }

  removeChat(tChatID) {
    let tPos = this.pChatRenderers.findPos(tChatID);
    if (voidp(tPos)) {
      return 0;
    }
    this.pActiveChatID = 0;
    this.pChatRenderers.deleteProp(tChatID);
    this.pTabsObj.removeTab(tChatID);
    let tCachePos = this.pCachedChatIDs.getPos(tChatID);
    if (tCachePos > 0) {
      this.pCachedChatIDs.deleteAt(tCachePos);
    }
    if (this.pChatRenderers.count == 0) {
      this.ChangeWindowView(Symbol.for("empty"));
      return 1;
    }
    if (tPos > this.pChatRenderers.count) {
      tPos = this.pChatRenderers.count;
    }
    this.activateChat(this.pChatRenderers.getPropAt(tPos));
    return 1;
  }

  removeAllChats() {
    while (this.pChatRenderers.count > 0) {
      let tChatID = this.pChatRenderers.getPropAt(1);
      this.removeChat(tChatID);
    }
    this.closeIMWindow();
  }

  activateChat(tChatID) {
    if (!tChatID) {
      return 0;
    }
    this.ChangeWindowView(Symbol.for("normal"));
    switch (tChatID) {
      case Symbol.for("left"):
        this.pTabsObj.scrollLeft();
        break;
      case Symbol.for("right"):
        this.pTabsObj.scrollRight();
        break;
      default:
        this.pActiveChatID = tChatID;
        this.pTabsObj.activateTab(tChatID);
        if (this.pCachedChatIDs.getPos(tChatID) == 0) {
          this.startRendering(tChatID);
          if (this.pCachedChatIDs.count == this.pCacheSize) {
            let tRemoveID = this.pCachedChatIDs[1];
            this.pCachedChatIDs.deleteAt(1);
            this.getChatRenderer(tRemoveID).clearImage();
          }
          this.pCachedChatIDs.add(tChatID);
        } else {
          let tPos = this.pCachedChatIDs.getPos(tChatID);
          this.pCachedChatIDs.deleteAt(tPos);
          this.pCachedChatIDs.add(tChatID);
        }
        break;
    }
    let tPos = this.pFollowFlashList.getPos(tChatID);
    if (tPos > 0) {
      this.flashFollowButton(Symbol.for("start"));
      this.pFollowFlashList.deleteAt(tPos);
    } else {
      this.flashFollowButton(Symbol.for("stop"));
    }
    this.updateInterface();
  }

  flashFollowButton(tstate) {
    let tWnd = getWindow(this.pWindowID);
    if (!tWnd) {
      return 0;
    }
    if (!tWnd.elementExists("button.follow")) {
      if (timeoutExists(this.pFollowFlashTimeoutID)) {
        removeTimeout(this.pFollowFlashTimeoutID);
      }
      return 0;
    }
    let tElem = tWnd.getElement("button.follow");
    switch (tstate) {
      case Symbol.for("start"):
        if (!timeoutExists(this.pFollowFlashTimeoutID)) {
          createTimeout(this.pFollowFlashTimeoutID, 500, Symbol.for("flashFollowButton"), this.getID(), Symbol.for("flash"), 20);
        }
        this.pFollowFlashState = 0;
        break;
      case Symbol.for("stop"):
        if (timeoutExists(this.pFollowFlashTimeoutID)) {
          removeTimeout(this.pFollowFlashTimeoutID);
        }
        tElem.setProperty(Symbol.for("member"), "button.follow");
        break;
      case Symbol.for("flash"):
        if (this.pFollowFlashState == 1) {
          tElem.setProperty(Symbol.for("member"), "button.follow");
        } else {
          tElem.setProperty(Symbol.for("member"), "button.follow.highlight");
        }
        this.pFollowFlashState = !this.pFollowFlashState;
        break;
    }
  }

  startRendering(tChatID) {
    let tChat = this.getComponent().getChat(tChatID);
    if (!listp(tChat)) {
      return error(this, "Can't render empty chat", Symbol.for("startRendering"), Symbol.for("major"));
    }
    this.pEntryBuffer = tChat.duplicate();
    if (timeoutExists(this.pRenderTimeoutID)) {
      removeTimeout(this.pRenderTimeoutID);
    }
    let tChatRenderer = this.getChatRenderer(tChatID);
    tChatRenderer.clearImage();
    createTimeout(this.pRenderTimeoutID, this.pBatchInterval, Symbol.for("startBatchRender"), this.getID(), tChatID, 0);
    this.startBatchRender(tChatID);
  }

  startBatchRender(tChatID) {
    if (!listp(this.pEntryBuffer)) {
      return error(this, "Can't render empty chat", Symbol.for("startBatchRender"), Symbol.for("major"));
    }
    if (this.pEntryBuffer.count == 0) {
      this.stopBatchRender();
      return 1;
    }
    for (let i = 1; i <= this.pBatchSize; i++) {
      let tBufferSize = this.pEntryBuffer.count;
      let tEntry = this.pEntryBuffer[tBufferSize];
      let tChatRenderer = this.getChatRenderer(tChatID);
      let tSuccess = tChatRenderer.renderChatEntry(tEntry, Symbol.for("start"));
      this.pEntryBuffer.deleteAt(tBufferSize);
      if ((tBufferSize == 1) || !tSuccess) {
        this.stopBatchRender();
        break;
      }
    }
    this.updateInterface();
  }

  stopBatchRender() {
    if (timeoutExists(this.pRenderTimeoutID)) {
      removeTimeout(this.pRenderTimeoutID);
    }
  }

  addMessage(tChatID, tEntry) {
    if (voidp(this.pChatRenderers.findPos(tChatID))) {
      this.addChat(tChatID);
    } else {
      if (this.pCachedChatIDs.getPos(tChatID) > 0) {
        let tChatRenderer = this.getChatRenderer(tChatID);
        tChatRenderer.renderChatEntry(tEntry);
      }
    }
    let ttype = tEntry.getaProp(Symbol.for("type"));
    if ((ttype == Symbol.for("message")) || (ttype == Symbol.for("invitation"))) {
      this.pTabsObj.highlightTab(tChatID);
      if (!windowExists(this.pWindowID)) {
        this.setState(Symbol.for("highlighted"));
      } else {
        let tWnd = getWindow(this.pWindowID);
        let tVisible = tWnd.getProperty(Symbol.for("visible"));
        if (!tVisible) {
          this.setState(Symbol.for("highlighted"));
        }
      }
    }
    if (ttype == Symbol.for("invitation")) {
      if (tChatID == this.pActiveChatID) {
        this.flashFollowButton(Symbol.for("start"));
      } else {
        if (this.pFollowFlashList.getPos(tChatID) == 0) {
          this.pFollowFlashList.add(tChatID);
        }
      }
    }
    this.updateInterface();
  }

  getChatRenderer(tChatID) {
    let tChatRenderer = this.pChatRenderers.getaProp(tChatID);
    if (voidp(tChatRenderer)) {
      tChatRenderer = createObject(Symbol.for("temp"), "IM Chat Renderer Class");
      this.pChatRenderers.setaProp(tChatID, tChatRenderer);
    }
    return tChatRenderer;
  }

  updateInterface() {
    if (this.pView == Symbol.for("empty")) {
      return 1;
    }
    if (!this.pActiveChatID) {
      return 0;
    }
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tWnd = getWindow(this.pWindowID);
    if (!tWnd.elementExists("chat.output")) {
      return 0;
    }
    if (!tWnd.elementExists("tabs")) {
      return 0;
    }
    if (!tWnd.elementExists("tab.title")) {
      return 0;
    }
    if (!tWnd.elementExists("button.follow")) {
      return 0;
    }
    let tChatRenderer = this.getChatRenderer(this.pActiveChatID);
    let tChatImage = tChatRenderer.getChatImage();
    let tChatOutput = tWnd.getElement("chat.output");
    tChatOutput.feedImage(tChatImage);
    let tTabImage = this.pTabsObj.getImage();
    let tTabElement = tWnd.getElement("tabs");
    tTabElement.feedImage(tTabImage);
    let tTitleElem = tWnd.getElement("tab.title");
    let tName = this.pNames.getaProp(this.pActiveChatID);
    tTitleElem.setText(string(tName));
    let tFriend = this.getComponent().getFriend(this.pActiveChatID);
    let tCanFollow = tFriend.getaProp(Symbol.for("canfollow"));
    if (tCanFollow) {
      tWnd.getElement("button.follow").show();
    } else {
      tWnd.getElement("button.follow").hide();
    }
    let tFigure = tFriend.getaProp(Symbol.for("figure"));
    let tGender = tFriend.getaProp(Symbol.for("sex"));
    this.pTabsObj.updateHeadImage(this.pActiveChatID, tFigure, tGender);
    this.scrollBottom();
  }

  startScaling() {
    this.pScale = 1;
    this.pOrigLocH = the.mouseV;
    this.pOrigHeight = getWindow(this.pWindowID).getProperty(Symbol.for("height"));
    receiveUpdate(this.getID());
    let tAgent = getObject(this.pScaleEventAgentID);
    tAgent.registerEvent(this, Symbol.for("mouseUp"), Symbol.for("stopScaling"));
  }

  stopScaling() {
    this.pScale = 0;
    removeUpdate(this.getID());
    let tAgent = getObject(this.pScaleEventAgentID);
    tAgent.unregisterEvent(Symbol.for("mouseUp"));
    this.scrollBottom();
  }

  update() {
    if (!this.pScale) {
      return 1;
    }
    let tWnd = getWindow(this.pWindowID);
    let tLocOffset = the.mouseV - this.pOrigLocH;
    if ((tLocOffset + this.pOrigHeight) < this.pMinHeight) {
      tLocOffset = this.pMinHeight - this.pOrigHeight;
    }
    let tHeightOffset = tWnd.getProperty(Symbol.for("height")) - this.pOrigHeight;
    tWnd.resizeBy(0, tLocOffset - tHeightOffset);
    this.scrollBottom();
  }

  scrollBottom() {
    let tWnd = getWindow(this.pWindowID);
    if (!tWnd.elementExists("chat.scroll")) {
      return 0;
    }
    let tScroll = tWnd.getElement("chat.scroll");
    tScroll.setScrollOffset(the.maxinteger);
  }

  setState(tstate) {
    this.pState = tstate;
    executeMessage(Symbol.for("IMStateChanged"));
  }

  getState() {
    return this.pState;
  }

  showInvitationWindow(tCount) {
    if (!windowExists(this.pInvitationWindowID)) {
      createWindow(this.pInvitationWindowID, "friend_invitation.window");
      let tWnd = getWindow(this.pInvitationWindowID);
      tWnd.registerProcedure(Symbol.for("eventProcInvitation"), this.getID(), Symbol.for("mouseUp"));
    }
    activateWindowObj(this.pInvitationWindowID);
    let tSummaryText = replaceChunks(getText("friend_invitation_summary"), "%count%", tCount);
    let tWnd = getWindow(this.pInvitationWindowID);
    if (!tWnd.elementExists("invitation.summary")) {
      return 0;
    }
    tWnd.getElement("invitation.summary").setText(tSummaryText);
  }

  closeInvitationWindow() {
    if (windowExists(this.pInvitationWindowID)) {
      removeWindow(this.pInvitationWindowID);
    }
  }

  sendInvitation() {
    let tSession = getObject(Symbol.for("session"));
    if (tSession.GET("lastroom") == "Entry") {
      executeMessage(Symbol.for("alert"), getText("friend_invitation_cannot_send"));
      return 1;
    }
    let tWnd = getWindow(this.pInvitationWindowID);
    if (!tWnd.elementExists("invitation.text")) {
      return 0;
    }
    let tElem = tWnd.getElement("invitation.text");
    let tText = tElem.getText();
    if (tText == EMPTY) {
      executeMessage(Symbol.for("alert"), getText("friend_invitation_empty_alert"));
      return 0;
    }
    this.getComponent().sendInvitation(tText);
    this.closeInvitationWindow();
  }

  ChangeWindowView(tView) {
    if (tView == this.pView) {
      return 1;
    }
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tWnd = getWindow(this.pWindowID);
    if (!tWnd.elementExists("button.close.window")) {
      return 0;
    }
    let tVisible = tWnd.getProperty(Symbol.for("visible"));
    if (!tVisible) {
      tWnd.show();
    }
    switch (tView) {
      case Symbol.for("normal"):
        tWnd.unmerge();
        tWnd.merge("instant_message.window");
        break;
      case Symbol.for("empty"):
        tWnd.unmerge();
        tWnd.merge("empty_im.window");
        break;
      default:
        this.pView = 0;
        return 0;
    }
    if (!tVisible) {
      tWnd.hide();
    }
    this.pView = tView;
    this.updateInterface();
    return 1;
  }

  eventProcIM(tEvent, tElemID, tParam) {
    if ((tEvent == Symbol.for("keyDown")) && (tElemID == "chat.input")) {
      if ((the.keyCode == 36) || (the.keyCode == 76)) {
        let tWnd = getWindow(this.pWindowID);
        let tInput = tWnd.getElement("chat.input");
        let tText = tInput.getText();
        if (tText != EMPTY) {
          this.getComponent().sendMessage(this.pActiveChatID, tText);
        }
        tInput.setText(EMPTY);
        return 1;
      }
      return 0;
    }
    if ((tEvent == Symbol.for("mouseDown")) && (tElemID == "button.scale")) {
      this.startScaling();
      return 1;
    }
    if (tEvent != Symbol.for("mouseUp")) {
      return 1;
    }
    switch (tElemID) {
      case "button.close.window":
        this.closeIMWindow();
        break;
      case "button.close.chat":
        this.getComponent().removeChat(this.pActiveChatID);
        break;
      case "tabs":
        let tChatID = this.pTabsObj.getIdAt(tParam);
        this.activateChat(tChatID);
        break;
      case "button.follow":
        let tConn = getConnection(getVariable("connection.info.id"));
        tConn.send("FOLLOW_FRIEND", propList("integer", integer(this.pActiveChatID)));
        break;
      case "button.minimail":
        if (variableExists("link.format.mail.compose")) {
          let tID = string(this.pActiveChatID);
          let tDestURL = replaceChunks(getVariable("link.format.mail.compose"), "%recipientid%", tID);
          executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          openNetPage(tDestURL);
        }
        break;
    }
  }

  eventProcInvitation(tEvent, tElemID, tParam) {
    switch (tElemID) {
      case "button.send":
        this.sendInvitation();
        break;
      case "button.cancel":
        this.closeInvitationWindow();
        break;
      case "button.close.window":
        this.closeInvitationWindow();
        break;
    }
  }
}
