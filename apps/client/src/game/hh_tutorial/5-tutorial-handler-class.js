export default class {
  construct() {
    this.registerServerMessages(1);
    return 1;
  }

  deconstruct() {
    return this.registerServerMessages(0);
  }

  handleAccountPreferences(tMsg) {
    tConn = tMsg.getaProp(Symbol.for("connection"));
    if (!tConn) {
      return error(this, "Connection not found.", Symbol.for("handleAccountPreferences"), Symbol.for("major"));
    }
    tSounds = tConn.GetBoolFrom();
    tTutorial = tConn.GetIntFrom();
    this.getComponent().setEnabled(tTutorial);
  }

  handleTutorialConfig(tMsg) {
    tConn = tMsg.getaProp(Symbol.for("connection"));
    tConfig = propList();
    tTutorialID = tConn.GetIntFrom();
    tTutorialName = tConn.GetStrFrom();
    tNumOfTopics = tConn.GetIntFrom();
    tTopicList = propList();
    tStatusList = propList();
    for (let tTopic = 1; tTopic <= tNumOfTopics; tTopic++) {
      tTopicID = tConn.GetIntFrom();
      tTopicName = tConn.GetStrFrom();
      tTopicStatus = tConn.GetIntFrom();
      tTopicList.setaProp(tTopicID, tTopicName);
      tStatusList.setaProp(tTopicID, tTopicStatus);
    }
    tConfig.setaProp(Symbol.for("id"), tTutorialID);
    tConfig.setaProp(Symbol.for("name"), tTutorialName);
    tConfig.setaProp(Symbol.for("topics"), tTopicList);
    tConfig.setaProp(Symbol.for("statuses"), tStatusList);
    this.getComponent().setTutorialConfig(tConfig);
  }

  handleTopicConfig(tMsg) {
    tConn = tMsg.getaProp(Symbol.for("connection"));
    tTopic = propList();
    tSteps = propList();
    tTopicID = tConn.GetIntFrom();
    tNumOfSteps = tConn.GetIntFrom();
    for (let tStepNum = 1; tStepNum <= tNumOfSteps; tStepNum++) {
      tStepID = tConn.GetIntFrom();
      tStepName = tConn.GetStrFrom();
      tNumOfPrerequisites = tConn.GetIntFrom();
      tPreList = propList();
      for (let tPre = 1; tPre <= tNumOfPrerequisites; tPre++) {
        tMessage = tConn.GetStrFrom();
        tParam = tConn.GetStrFrom();
        tPreList.setaProp(tMessage, tParam);
      }
      tNumOfTriggers = tConn.GetIntFrom();
      tTriggerList = list();
      for (let tTrig = 1; tTrig <= tNumOfTriggers; tTrig++) {
        tTriggerList.add(tConn.GetStrFrom());
      }
      tNumOfRestrictions = tConn.GetIntFrom();
      tRestList = list();
      for (let tRest = 1; tRest <= tNumOfRestrictions; tRest++) {
        tRestList.add(tConn.GetStrFrom());
      }
      tNumOfContent = tConn.GetIntFrom();
      tContentList = list();
      for (let tCont = 1; tCont <= tNumOfContent; tCont++) {
        tContent = propList();
        tContent.setaProp(Symbol.for("textKey"), tConn.GetStrFrom());
        tContent.setaProp(Symbol.for("targetID"), tConn.GetStrFrom());
        tContent.setaProp(Symbol.for("direction"), tConn.GetStrFrom());
        tContent.setaProp(Symbol.for("offsetx"), tConn.GetStrFrom());
        tContent.setaProp(Symbol.for("offsety"), tConn.GetStrFrom());
        tContent.setaProp(Symbol.for("special"), tConn.GetStrFrom());
        if (tContent[Symbol.for("targetID")] == "tutor") {
          tContent.setaProp(Symbol.for("links"), VOID);
          tTutorList = tContent;
          continue;
        }
        tContentList.add(tContent);
      }
      tStep = propList();
      tStep.setaProp(Symbol.for("name"), tStepName);
      tStep.setaProp(Symbol.for("prerequisites"), tPreList);
      tStep.setaProp(Symbol.for("triggers"), tTriggerList);
      tStep.setaProp(Symbol.for("restrictions"), tRestList);
      tStep.setaProp(Symbol.for("content"), tContentList);
      tStep.setaProp(Symbol.for("tutor"), tTutorList);
      tSteps.setaProp(tStepID, tStep);
    }
    tTopic.setaProp(Symbol.for("id"), tTopicID);
    tTopic.setaProp(Symbol.for("steps"), tSteps);
    this.getComponent().setTopicConfig(tTopic);
  }

  handleTutorialStatus(tMsg) {
    tConn = tMsg.getaProp(Symbol.for("connection"));
    tTutorialID = tConn.GetIntFrom();
    tNumOfStatuses = tConn.GetIntFrom();
    tStatusList = propList();
    for (let tStatusNum = 1; tStatusNum <= tNumOfStatuses; tStatusNum++) {
      tID = tConn.GetIntFrom();
      tStatus = tConn.GetIntFrom();
      tStatusList.setaProp(tID, tStatus);
    }
    this.getComponent().setTutorialStatus(tStatusList);
  }

  handleTopicResult(tMsg) {
    tConn = tMsg.getaProp(Symbol.for("connection"));
    tUserRewarded = tConn.GetIntFrom();
    this.getComponent().setTopicResult(tUserRewarded);
  }

  registerServerMessages(tBool) {
    tMsgs = propList();
    tMsgs.setaProp(308, Symbol.for("handleAccountPreferences"));
    tMsgs.setaProp(327, Symbol.for("handleTutorialConfig"));
    tMsgs.setaProp(328, Symbol.for("handleTopicConfig"));
    tMsgs.setaProp(329, Symbol.for("handleTutorialStatus"));
    tMsgs.setaProp(330, Symbol.for("handleTopicResult"));
    tCmds = propList();
    tCmds.setaProp("GET_ACCOUNT_PREFERENCES", 228);
    tCmds.setaProp("SET_TUTORIAL_MODE", 249);
    tCmds.setaProp("GET_TUTORIAL_CONFIGURATION", 250);
    tCmds.setaProp("GET_TUTORIAL_TOPIC_CONFIGURATION", 251);
    tCmds.setaProp("GET_TUTORIAL_STATUS", 252);
    tCmds.setaProp("COMPLETE_TUTORIAL_TOPIC", 253);
    if (tBool) {
      registerListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tCmds);
    }
    return 1;
  }
}
