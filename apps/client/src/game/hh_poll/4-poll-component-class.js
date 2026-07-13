export default class {
  pQuestionList;
  pQuestionIndex;
  pConfirmedAction;
  pConnectionId;
  pPollOfferID;
  pThanksText;

  construct() {
    this.pQuestionList = list();
    this.pQuestionIndex = 1;
    this.pConnectionId = getVariableValue("connection.info.id", Symbol.for("Info"));
    registerMessage(Symbol.for("show_poll_question"), this.getID(), Symbol.for("parseQuestion"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("show_poll_question"), this.getID());
    return 1;
  }

  getQuestionAvailable() {
    if (this.pQuestionList.count >= this.pQuestionIndex) {
      return 1;
    }
    return 0;
  }

  getNewQuestion(tNext) {
    if (tNext) {
      if (this.pQuestionIndex < this.pQuestionList.count) {
        this.pQuestionIndex = this.pQuestionIndex + 1;
      }
    } else {
      if (this.pQuestionIndex > 1) {
        this.pQuestionIndex = this.pQuestionIndex - 1;
      }
    }
  }

  getPollHeadLine() {
    return this.getQuestionData(Symbol.for("pollHeadLine"));
  }

  getQuestionText() {
    return this.getQuestionData(Symbol.for("questionText"));
  }

  getQuestionNumber() {
    return this.getQuestionData(Symbol.for("questionNumber"));
  }

  getQuestionCount() {
    return this.getQuestionData(Symbol.for("questionCount"));
  }

  getQuestionType() {
    return this.getQuestionData(Symbol.for("questionType"));
  }

  getSelectionCount() {
    tSelectionData = this.getQuestionData(Symbol.for("selectionData"));
    if (voidp(tSelectionData)) {
      return 0;
    }
    tQuestions = tSelectionData[Symbol.for("questions")];
    if (voidp(tQuestions)) {
      return 0;
    }
    return tQuestions.count;
  }

  getSelectionMinCount() {
    tSelectionData = this.getQuestionData(Symbol.for("selectionData"));
    if (voidp(tSelectionData)) {
      return 0;
    }
    if (voidp(tSelectionData[Symbol.for("minSelect")])) {
      return 0;
    }
    return tSelectionData[Symbol.for("minSelect")];
  }

  getSelectionMaxCount() {
    tSelectionData = this.getQuestionData(Symbol.for("selectionData"));
    if (voidp(tSelectionData)) {
      return 0;
    }
    if (voidp(tSelectionData[Symbol.for("maxSelect")])) {
      return 0;
    }
    return tSelectionData[Symbol.for("maxSelect")];
  }

  getSelectionText(tIndex) {
    tSelectionData = this.getQuestionData(Symbol.for("selectionData"));
    if (voidp(tSelectionData)) {
      return 0;
    }
    tQuestions = tSelectionData[Symbol.for("questions")];
    if (voidp(tQuestions)) {
      return EMPTY;
    }
    if ((tIndex < 1) || (tIndex > tQuestions.count)) {
      return EMPTY;
    }
    return tQuestions[tIndex];
  }

  getSelectionState(tIndex) {
    tSelections = this.getQuestionData(Symbol.for("answerSelections"));
    if (voidp(tSelections)) {
      return 0;
    }
    if ((tIndex < 1) || (tIndex > tSelections.count)) {
      return 0;
    }
    return tSelections[tIndex];
  }

  changeSelectionState(tIndex) {
    tSelections = this.getQuestionData(Symbol.for("answerSelections"));
    if (voidp(tSelections)) {
      return 0;
    }
    if ((tIndex < 1) || (tIndex > tSelections.count)) {
      return 0;
    }
    tMaxSelect = this.getSelectionMaxCount();
    if (tMaxSelect == 1) {
      tstate = 1;
      for (let i = tSelections.count; i >= 1; i--) {
        tSelections[i] = 0;
      }
    } else {
      tstate = !tSelections[tIndex];
      tCount = 0;
      for (let i = tSelections.count; i >= 1; i--) {
        if (tSelections[i] != 0) {
          tCount = tCount + 1;
        }
      }
      if ((tCount + tstate) > tMaxSelect) {
        return 0;
      }
    }
    tSelections[tIndex] = tstate;
    return 1;
  }

  setAnswerText(tText) {
    if (this.pQuestionList.count < this.pQuestionIndex) {
      return 0;
    }
    this.pQuestionList[this.pQuestionIndex][Symbol.for("answerText")] = tText;
    return 1;
  }

  getAnswerText() {
    return this.getQuestionData(Symbol.for("answerText"));
  }

  getThanks() {
    return this.pThanksText;
  }

  confirmAction(tAction) {
    this.pConfirmedAction = tAction;
    return 1;
  }

  actionConfirmed() {
    if (this.pConfirmedAction == "cancel") {
      this.cancelAnswer();
      this.getInterface().hideQuestion();
    }
  }

  sendAnswer() {
    if (!this.getQuestionAvailable()) {
      return 0;
    }
    tQuestionIndex = this.pQuestionIndex;
    for (let tIndex = 1; tIndex <= tQuestionIndex; tIndex++) {
      this.pQuestionIndex = 1;
      tPollID = this.getQuestionData(Symbol.for("pollID"));
      tQuestionID = this.getQuestionData(Symbol.for("questionID"));
      tQuestionType = this.getQuestionData(Symbol.for("questionType"));
      tReply = propList("integer", tPollID, "integer", tQuestionID);
      tQuestionType = this.getQuestionType();
      if ((tQuestionType == 1) || (tQuestionType == 2)) {
        tSelectionCount = this.getSelectionCount();
        tMinSelect = this.getSelectionMinCount();
        tSelected = 0;
        tSelectionList = list();
        for (let i = 1; i <= tSelectionCount; i++) {
          tSelectionList[i] = this.getSelectionState(i);
          if (tSelectionList[i] != 0) {
            tSelected = tSelected + 1;
          }
        }
        if (tSelected < tMinSelect) {
          this.pQuestionIndex = tQuestionIndex - (tIndex - 1);
          return 0;
        }
        tReply.addProp(Symbol.for("integer"), tSelected);
        for (let i = 1; i <= tSelectionList.count; i++) {
          if (tSelectionList[i] != 0) {
            tReply.addProp(Symbol.for("integer"), i);
          }
        }
      } else {
        if ((tQuestionType == 3) || (tQuestionType == 4)) {
          tAnswer = this.getAnswerText();
          if (tAnswer.length == 0) {
            this.pQuestionIndex = tQuestionIndex - (tIndex - 1);
            return 0;
          }
          tAnswerText = this.getQuestionData(Symbol.for("answerText"));
          tReply.addProp(Symbol.for("string"), tAnswerText);
        }
      }
      if (getConnection(this.pConnectionId) != 0) {
        getConnection(this.pConnectionId).send("POLL_ANSWER", tReply);
      }
      this.pQuestionList.deleteAt(1);
    }
    this.pQuestionIndex = 1;
    return 1;
  }

  cancelAnswer() {
    tPollID = VOID;
    for (let i = 1; i <= this.pQuestionList.count; i++) {
      this.pQuestionIndex = i;
      tPollIDNew = this.getQuestionData(Symbol.for("pollID"));
      tQuestionID = this.getQuestionData(Symbol.for("questionID"));
      if (tPollIDNew != tPollID) {
        tPollID = tPollIDNew;
        tReply = propList("integer", tPollID, "integer", tQuestionID);
        if (getConnection(this.pConnectionId) != 0) {
          getConnection(this.pConnectionId).send("POLL_CANCEL", tReply);
        }
      }
    }
    this.pQuestionList = list();
    this.pQuestionIndex = 1;
  }

  getQuestionData(tProperty) {
    if (this.pQuestionList.count < this.pQuestionIndex) {
      return EMPTY;
    }
    return this.pQuestionList[this.pQuestionIndex][tProperty];
  }

  setThanks(tText) {
    this.pThanksText = tText;
  }

  offerPoll(tdata) {
    if (ilk(tdata) != Symbol.for("propList")) {
      return 0;
    }
    if (voidp(tdata[Symbol.for("pollID")]) || voidp(tdata[Symbol.for("pollDescription")])) {
      return 0;
    }
    this.pPollOfferID = tdata[Symbol.for("pollID")];
    tPollDescription = tdata[Symbol.for("pollDescription")];
    this.getInterface().showOffer(tPollDescription);
  }

  acceptPoll() {
    if (getConnection(this.pConnectionId) != 0) {
      getConnection(this.pConnectionId).send("POLL_START", propList("integer", this.pPollOfferID));
    }
  }

  rejectPoll() {
    if (getConnection(this.pConnectionId) != 0) {
      getConnection(this.pConnectionId).send("POLL_REJECT", propList("integer", this.pPollOfferID));
    }
  }

  parseQuestion(tdata) {
    if (!this.validateQuestion(tdata)) {
      return 0;
    }
    this.pQuestionList.add(tdata);
    tdata[Symbol.for("answerText")] = EMPTY;
    tdata[Symbol.for("answerSelections")] = list();
    tTmpIndex = this.pQuestionIndex;
    this.pQuestionIndex = this.pQuestionList.count();
    tSelectionCount = this.getSelectionCount();
    for (let i = 1; i <= tSelectionCount; i++) {
      tdata[Symbol.for("answerSelections")].add(0);
    }
    this.pQuestionIndex = tTmpIndex;
    this.getInterface().showQuestion();
  }

  validateQuestion(tdata) {
    if (ilk(tdata) != Symbol.for("propList")) {
      return 0;
    }
    tList = list(Symbol.for("pollID"), Symbol.for("pollHeadLine"), Symbol.for("questionID"), Symbol.for("questionNumber"), Symbol.for("questionCount"), Symbol.for("questionType"), Symbol.for("questionText"));
    for (const tItem of tList) {
      if (voidp(tdata[tItem])) {
        return 0;
      }
    }
    if ((tdata[Symbol.for("questionType")] == 1) || (tdata[Symbol.for("questionType")] == 2)) {
      if (voidp(tdata[Symbol.for("selectionData")])) {
        return 0;
      }
      tSelectionData = tdata[Symbol.for("selectionData")];
      tListSelection = list(Symbol.for("minSelect"), Symbol.for("maxSelect"), Symbol.for("questions"));
      for (const tItem of tListSelection) {
        if (voidp(tSelectionData[tItem])) {
          return 0;
        }
      }
      if (ilk(tSelectionData[Symbol.for("questions")]) != Symbol.for("list")) {
        return 0;
      }
      if (tSelectionData[Symbol.for("questions")].count == 0) {
        return 0;
      }
      tSelectionData[Symbol.for("maxSelect")] = value(tSelectionData[Symbol.for("maxSelect")]);
      if (tSelectionData[Symbol.for("maxSelect")] < 1) {
        return 0;
      }
      tSelectionData[Symbol.for("minSelect")] = value(tSelectionData[Symbol.for("minSelect")]);
      if (tSelectionData[Symbol.for("minSelect")] > tSelectionData[Symbol.for("maxSelect")]) {
        return 0;
      }
    }
    return 1;
  }

  pollError() {
    this.getInterface().hideWindows();
    this.getInterface().ShowAlert("server_error");
  }
}
