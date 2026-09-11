export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handle_poll_offer(tMsg) {
    tPollID = tMsg.connection.GetIntFrom();
    tPollDescription = tMsg.connection.GetStrFrom();
    tdata = propList();
    tdata[Symbol.for("pollID")] = tPollID;
    tdata[Symbol.for("pollDescription")] = tPollDescription;
    this.getComponent().offerPoll(tdata);
  }

  handle_poll_contents(tMsg) {
    tPollID = tMsg.connection.GetIntFrom();
    tPollHeadLine = tMsg.connection.GetStrFrom();
    tPollThankYou = tMsg.connection.GetStrFrom();
    this.getComponent().setThanks(tPollThankYou);
    tCount = tMsg.connection.GetIntFrom();
    for (let i = 1; i <= tCount; i++) {
      tdata = propList();
      tdata[Symbol.for("pollID")] = tPollID;
      tdata[Symbol.for("pollHeadLine")] = tPollHeadLine;
      tdata[Symbol.for("questionID")] = tMsg.connection.GetIntFrom();
      tdata[Symbol.for("questionNumber")] = tMsg.connection.GetIntFrom();
      tdata[Symbol.for("questionCount")] = tCount;
      tdata[Symbol.for("questionType")] = tMsg.connection.GetIntFrom();
      tdata[Symbol.for("questionText")] = tMsg.connection.GetStrFrom();
      if ((tdata[Symbol.for("questionType")] == 1) || (tdata[Symbol.for("questionType")] == 2)) {
        tSelectionData = propList();
        tSelectionCount = tMsg.connection.GetIntFrom();
        tSelectionData[Symbol.for("minSelect")] = tMsg.connection.GetIntFrom();
        tSelectionData[Symbol.for("maxSelect")] = tMsg.connection.GetIntFrom();
        tSelectionData[Symbol.for("questions")] = list();
        for (let j = 1; j <= tSelectionCount; j++) {
          tSelectionData[Symbol.for("questions")].add(tMsg.connection.GetStrFrom());
        }
        tdata[Symbol.for("selectionData")] = tSelectionData;
      }
      this.getComponent().parseQuestion(tdata);
    }
  }

  handle_poll_error(tMsg) {
    this.getComponent().pollError();
  }

  regMsgList(tBool) {
    tMsgs = propList();
    tMsgs.setaProp(316, Symbol.for("handle_poll_offer"));
    tMsgs.setaProp(317, Symbol.for("handle_poll_contents"));
    tMsgs.setaProp(318, Symbol.for("handle_poll_error"));
    tCmds = propList();
    tCmds.setaProp("POLL_START", 234);
    tCmds.setaProp("POLL_REJECT", 235);
    tCmds.setaProp("POLL_ANSWER", 236);
    if (tBool) {
      registerListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
