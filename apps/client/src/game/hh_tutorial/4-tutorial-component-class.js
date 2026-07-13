export default class {
  pTutorialID;
  pTutorialName;
  pTopics;
  pTopicStatuses;
  pTopicID;
  pSteps;
  pWaitingForPrefs;
  pEnabled;
  pRunning;
  pQuitting;
  pCurrentTopicID;
  pCurrentTopicNumber;
  pCurrentStepID;
  pCurrentStepNumber;
  pTriggerList;
  pRestrictionList;
  pUserSex;
  pUserName;
  pDefaultTutorial;
  pEnabledOnServer;
  pMessages;

  construct() {
    this.pEnabled = 0;
    this.pRunning = 0;
    this.pWaitingForPrefs = 1;
    this.pQuitting = 0;
    if (variableExists("tutorial.name.new_user_flow")) {
      this.pDefaultTutorial = getVariable("tutorial.name.new_user_flow");
    }
    this.pMessages = propList();
    this.pMessages.setaProp(Symbol.for("userlogin"), Symbol.for("getUserProperties"));
    this.pMessages.setaProp(Symbol.for("restart_tutorial"), Symbol.for("restartTutorial"));
    this.pMessages.setaProp(Symbol.for("updateAvailableFlatCategories"), Symbol.for("startDefaultTutorial"));
    this.pMessages.setaProp(Symbol.for("enterRoom"), Symbol.for("hideTutorial"));
    this.pMessages.setaProp(Symbol.for("roomReady"), Symbol.for("showTutorial"));
    this.pMessages.setaProp(Symbol.for("leaveRoom"), Symbol.for("showTutorial"));
    this.pMessages.setaProp(Symbol.for("tutorial_send_console_message"), Symbol.for("sendConsoleMessage"));
    this.pMessages.setaProp(Symbol.for("tutorial_open_guestrooms_tab"), Symbol.for("openGuestroomsTab"));
    this.pMessages.setaProp(Symbol.for("tutorial_open_publicrooms_tab"), Symbol.for("openPublicroomsTab"));
    this.pMessages.setaProp(Symbol.for("exit_tutorial"), Symbol.for("exitTutorial"));
    this.pMessages.setaProp(Symbol.for("getHotelClosedDisconnectStatus"), Symbol.for("hideTutorial"));
    this.registerClientMessages(1);
    return 1;
  }

  deconstruct() {
    this.registerClientMessages(0);
    return 1;
  }

  registerClientMessages(tBool) {
    if (this.pMessages.ilk != Symbol.for("propList")) {
      return error(this, "Message list not initialized.", Symbol.for("registerClientMessages"), Symbol.for("major"));
    }
    for (let tMsgNo = 1; tMsgNo <= this.pMessages.count; tMsgNo++) {
      tMessage = this.pMessages.getPropAt(tMsgNo);
      tHandler = this.pMessages[tMsgNo];
      if (tBool) {
        registerMessage(tMessage, this.getID(), tHandler);
        continue;
      }
      unregisterMessage(tMessage, this.getID());
    }
  }

  showTutorial() {
    if (!this.pRunning || !this.pEnabled) {
      return 0;
    }
    this.getInterface().show();
    return 1;
  }

  hideTutorial() {
    this.getInterface().hide();
    return 1;
  }

  getUserProperties() {
    tSession = getObject(Symbol.for("session"));
    this.pUserName = tSession.GET(Symbol.for("userName"));
    this.pUserSex = tSession.GET(Symbol.for("user_sex"));
    this.pEnabledOnServer = tSession.GET(Symbol.for("tutorial_enabled"), 0);
    this.getInterface().setUserSex(this.pUserSex);
  }

  startDefaultTutorial() {
    if (voidp(this.pDefaultTutorial)) {
      return 0;
    }
    this.startTutorial(this.pDefaultTutorial);
  }

  restartTutorial() {
    this.pEnabled = 1;
    tConn = getConnection(getVariable("connection.info.id"));
    if (voidp(tConn)) {
      return error(this, "Connection not found.", Symbol.for("startTutorial"), Symbol.for("major"));
    }
    tConn.send("SET_TUTORIAL_MODE", propList("integer", 1));
    this.startTutorial(this.pDefaultTutorial);
    this.sendTrackingRequest(Symbol.for("restart"));
  }

  setEnabled(tBoolean) {
    this.pEnabled = tBoolean;
    if (this.pEnabled && this.pWaitingForPrefs && this.pRunning) {
      this.pWaitingForPrefs = 0;
      this.startTutorial();
    }
    return 1;
  }

  startTutorial(tTutorialName) {
    if (!this.pEnabledOnServer) {
      return 0;
    }
    this.pRunning = 1;
    if (!voidp(tTutorialName)) {
      this.pTutorialName = tTutorialName;
    }
    tConn = getConnection(getVariable("connection.info.id"));
    if (voidp(tConn)) {
      return error(this, "Connection not found.", Symbol.for("startTutorial"), Symbol.for("major"));
    }
    if (this.pWaitingForPrefs) {
      tConn.send("GET_ACCOUNT_PREFERENCES");
      return 0;
    }
    if (!this.pEnabled || voidp(this.pTutorialName)) {
      return 0;
    }
    tConn.send("GET_TUTORIAL_CONFIGURATION", propList("string", this.pTutorialName));
    return 1;
  }

  setTutorialConfig(tConfigList) {
    this.pTutorialID = tConfigList[Symbol.for("id")];
    this.pTutorialName = tConfigList[Symbol.for("name")];
    this.pTopics = tConfigList.getaProp(Symbol.for("topics"));
    for (let tTopicNum = 1; tTopicNum <= this.pTopics.count; tTopicNum++) {
      tTextKey = `${this.pTutorialName}_${this.pTopics[tTopicNum]}`;
      this.pTopics[tTopicNum] = tTextKey;
    }
    this.pTopicStatuses = tConfigList.getaProp(Symbol.for("statuses"));
    this.getInterface().show();
    this.showMenu(Symbol.for("welcome"));
  }

  setTopicConfig(tTopicConfig) {
    this.pTopicID = tTopicConfig[Symbol.for("id")];
    this.pSteps = tTopicConfig[Symbol.for("steps")];
    tTopicName = this.pTopics.getaProp(this.pTopicID);
    for (let tStepNum = 1; tStepNum <= this.pSteps.count; tStepNum++) {
      tStepName = this.pSteps[tStepNum][Symbol.for("name")];
      tContentList = this.pSteps[tStepNum][Symbol.for("content")];
      for (let tContentNum = 1; tContentNum <= tContentList.count; tContentNum++) {
        tContentName = tContentList[tContentNum][Symbol.for("textKey")];
        tTextKey = `${tTopicName}_${tStepName}_${tContentName}`;
        tContentList[tContentNum][Symbol.for("textKey")] = tTextKey;
      }
      this.pSteps[tStepNum][Symbol.for("tutor")][Symbol.for("textKey")] = `${tTopicName}_${tStepName}_tutor`;
    }
    this.pCurrentStepNumber = 0;
    this.nextStep();
    return 1;
  }

  selectTopic(tTopicID) {
    switch (tTopicID) {
      case Symbol.for("menu"):
      case Symbol.for("Cancel"):
        this.showMenu();
        return 1;
      case Symbol.for("quit"):
        this.exitTutorial();
        executeMessage(Symbol.for("show_navigator"));
        return 1;
      case Symbol.for("otherwise"):
        nothing();
        break;
    }
    tTopicName = this.pTopics.getaProp(tTopicID);
    tURLKey = `${tTopicName}_url`;
    if (textExists(tURLKey)) {
      tURL = getText(tURLKey);
      executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
      openNetPage(tURL);
    }
    this.pCurrentTopicID = tTopicID;
    this.pCurrentTopicNumber = this.pTopics.getPos(this.pTopics.getaProp(tTopicID));
    tConn = getConnection(getVariable("connection.info.id"));
    if (voidp(tConn)) {
      return error(this, "Connection not found.", Symbol.for("startTutorial"), Symbol.for("major"));
    }
    tConn.send("GET_TUTORIAL_TOPIC_CONFIGURATION", propList("integer", tTopicID));
  }

  nextStep() {
    if (!this.pEnabled || !this.pRunning) {
      return 0;
    }
    if (this.pSteps.count == 0) {
      return 1;
    }
    this.pCurrentStepNumber = this.pCurrentStepNumber + 1;
    if (this.pCurrentStepNumber > this.pSteps.count) {
      return 0;
    }
    this.sendTrackingRequest(Symbol.for("step"));
    this.pCurrentStepID = this.pSteps.getPropAt(this.pCurrentStepNumber);
    tTopic = this.pSteps[this.pCurrentStepNumber];
    this.clearTriggers();
    this.clearRestrictions();
    this.setTriggers(tTopic[Symbol.for("triggers")]);
    this.setRestrictions(tTopic[Symbol.for("restrictions")]);
    this.executePrerequisites(tTopic[Symbol.for("prerequisites")]);
    this.getInterface().setBubbles(tTopic[Symbol.for("content")]);
    tTutorList = tTopic[Symbol.for("tutor")];
    if (this.pCurrentStepNumber == this.pSteps.count) {
      tLinkList = propList();
      tNextTopicNumber = this.pCurrentTopicNumber + 1;
      if (tNextTopicNumber <= this.pTopics.count) {
        tNextTopicID = this.pTopics.getPropAt(tNextTopicNumber);
        tNextTopicName = this.pTopics[tNextTopicNumber];
        tLinkList.setaProp(tNextTopicID, tNextTopicName);
      }
      tLinkList.setaProp(Symbol.for("menu"), "tutorial_select_another_topic");
      tTutorList.setaProp(Symbol.for("links"), tLinkList);
      tStatusList = propList("menu", 1);
      tTutorList.setaProp(Symbol.for("statuses"), tStatusList);
      this.completeTopic(this.pTopicID);
    }
    this.getInterface().setTutor(tTutorList);
  }

  completeTopic(tTopicID) {
    this.pTopicStatuses.setaProp(tTopicID, 1);
    tConn = getConnection(getVariable("connection.info.id"));
    if (voidp(tConn)) {
      return error(this, "Connection not found.", Symbol.for("startTutorial"), Symbol.for("major"));
    }
    this.sendTrackingRequest(Symbol.for("topicCompleted"));
    tConn.send("COMPLETE_TUTORIAL_TOPIC", propList("integer", tTopicID));
    tConn.send("GET_TUTORIAL_STATUS", propList("integer", this.pTutorialID));
  }

  executePrerequisites(tPrerequisiteList) {
    for (let i = 1; i <= tPrerequisiteList.count; i++) {
      tMessage = tPrerequisiteList.getPropAt(i);
      tParam = tPrerequisiteList[i];
      executeMessage(symbol(tMessage), tParam);
    }
  }

  setTriggers(tTriggerList) {
    if (!listp(tTriggerList)) {
      return 0;
    }
    for (const tTrigger of tTriggerList) {
      registerMessage(symbol(tTrigger), this.getID(), Symbol.for("nextStep"));
    }
    this.pTriggerList = tTriggerList;
  }

  setRestrictions(tRestrictionList) {
    if (!listp(tRestrictionList)) {
      return 0;
    }
    for (const tRestriction of tRestrictionList) {
      registerMessage(symbol(tRestriction), this.getID(), Symbol.for("restriction"));
    }
    this.pRestrictionList = tRestrictionList;
  }

  clearTriggers(tForced) {
    if (!listp(this.pTriggerList)) {
      return 0;
    }
    for (const tTrigger of this.pTriggerList) {
      unregisterMessage(symbol(tTrigger), this.getID());
      tHandler = this.pMessages.getaProp(tTrigger);
      if (!voidp(tHandler)) {
        registerMessage(tTrigger, this.getID(), tHandler);
        if (!tForced) {
          call(tHandler, this);
        }
      }
    }
    this.pTriggerList = list();
  }

  clearRestrictions(tForced) {
    if (!listp(this.pRestrictionList)) {
      return 0;
    }
    for (const tRestriction of this.pRestrictionList) {
      unregisterMessage(symbol(tRestriction), this.getID());
      tHandler = this.pMessages.getaProp(tRestriction);
      if (!voidp(tHandler)) {
        registerMessage(tRestriction, this.getID(), tHandler);
        if (!tForced) {
          call(tHandler, this);
        }
      }
    }
    this.pRestrictionList = list();
  }

  exitTutorial() {
    this.pRunning = 0;
    this.getInterface().hide();
    tConn = getConnection(getVariable("connection.info.id"));
    if (voidp(tConn)) {
      return error(this, "Connection not found.", Symbol.for("exitTutorial"), Symbol.for("major"));
    }
    tConn.send("SET_TUTORIAL_MODE", propList("integer", 0));
    this.pEnabled = 0;
    this.sendTrackingRequest(Symbol.for("quit"));
  }

  restriction() {
    this.showMenu(Symbol.for("offtopic"));
  }

  getTopics() {
    return this.pTopics;
  }

  showMenu(tstate) {
    this.pQuitting = 0;
    this.clearTriggers(1);
    this.clearRestrictions(1);
    this.getInterface().showMenu(tstate);
  }

  setTopicResult(tBoolReward) {
    let tConn = getConnection(getVariable("connection.info.id"));
    if (voidp(tConn)) {
      return error(this, "Connection not found.", Symbol.for("stopTutorial"), Symbol.for("major"));
    }
    tConn.send("GET_TUTORIAL_STATUS", propList("integer", this.pTutorialID));
  }

  setTutorialStatus(tStatusList) {
    this.pTopicStatuses = tStatusList;
  }

  getProperty(tProp) {
    switch (tProp) {
      case Symbol.for("topics"):
        return this.pTopics;
      case Symbol.for("statuses"):
        return this.pTopicStatuses;
    }
  }

  sendTrackingRequest(tCase) {
    switch (tCase) {
      case Symbol.for("step"):
        tTopicName = this.pTopics.getaProp(this.pTopicID);
        tTrackMsg = `/client/tutorial/${tTopicName}/${string(this.pCurrentStepNumber)}`;
        break;
      case Symbol.for("topicCompleted"):
        tTopicName = this.pTopics.getaProp(this.pTopicID);
        tTrackMsg = `/client/tutorial/${tTopicName}/completed`;
        break;
      case Symbol.for("quit"):
        tTrackMsg = "/client/tutorial/closed";
        break;
      case Symbol.for("restart"):
        tTrackMsg = "/client/tutorial/restarted";
        break;
      default:
        return 0;
    }
    executeMessage(Symbol.for("sendTrackingPoint"), tTrackMsg);
    return 1;
  }

  tryExit() {
    if (this.pQuitting) {
      this.selectTopic(Symbol.for("quit"));
      return 1;
    }
    this.pQuitting = 1;
    tPrerequisites = propList();
    tPrerequisites.setaProp(Symbol.for("hide_navigator"), VOID);
    tPrerequisites.setaProp(Symbol.for("hide_purse"), VOID);
    tPrerequisites.setaProp(Symbol.for("hide_messenger"), VOID);
    tBubbles = propList();
    tBubble = propList();
    tBubble.setaProp(Symbol.for("textKey"), "tutorial_help_button_bubble");
    tBubble.setaProp(Symbol.for("targetID"), "help_icon_image");
    tBubble.setaProp(Symbol.for("direction"), 5);
    tBubble.setaProp(Symbol.for("offsetx"), 0);
    tBubble.setaProp(Symbol.for("offsety"), 0);
    tBubbles.setaProp(Symbol.for("help"), tBubble);
    tBubble = propList();
    tBubble.setaProp(Symbol.for("textKey"), "tutorial_restart_button_bubble");
    tBubble.setaProp(Symbol.for("targetID"), "help_restart_tutorial");
    tBubble.setaProp(Symbol.for("direction"), 6);
    tBubble.setaProp(Symbol.for("offsetx"), 50);
    tBubble.setaProp(Symbol.for("offsety"), 0);
    tBubbles.setaProp(Symbol.for("restart"), tBubble);
    tTutor = propList();
    tTutor.setaProp(Symbol.for("textKey"), "tutorial_quit_confirmation");
    tTutor.setaProp(Symbol.for("targetID"), "tutor");
    tTutor.setaProp(Symbol.for("direction"), 1);
    tTutor.setaProp(Symbol.for("offsetx"), 20);
    tTutor.setaProp(Symbol.for("offsety"), 310);
    tTutor.setaProp(Symbol.for("links"), propList("quit", "tutorial_quit", "Cancel", "cancel"));
    this.clearTriggers(1);
    this.clearRestrictions(1);
    this.executePrerequisites(tPrerequisites);
    this.getInterface().setBubbles(tBubbles);
    this.getInterface().setTutor(tTutor);
  }

  sendConsoleMessage(tTextKey) {
    return 0;
    if (!objectExists(Symbol.for("messenger_component"))) {
      return error(this, "Messenger component not found", Symbol.for("sendConsoleMessage"), Symbol.for("major"));
    }
    if (getObject(Symbol.for("messenger_component")).pItemList[Symbol.for("messages")].count > 0) {
      return 1;
    }
    tText = getText(tTextKey);
    tMsg = propList("campaign", 1, "id", "3", "url", "http://www.fi", "message", tText);
    getObject("messenger_component").receive_Message(tMsg);
  }

  openGuestroomsTab() {
    executeMessage(Symbol.for("show_navigator"));
    getObject(Symbol.for("navigator_interface")).ChangeWindowView("nav_gr0");
    getObject(Symbol.for("navigator_component")).expandHistoryItem(1);
    executeMessage(Symbol.for("hide_navigator"));
  }

  openPublicroomsTab() {
    executeMessage(Symbol.for("show_navigator"));
    getObject(Symbol.for("navigator_interface")).ChangeWindowView("nav_pr");
    getObject(Symbol.for("navigator_component")).expandHistoryItem(1);
    executeMessage(Symbol.for("hide_navigator"));
  }
}
