export default class {
  pPollWindowID;
  pOfferWindowID;
  pThanksWindowID;
  pConfirmWindowID;

  construct() {
    this.pPollWindowID = getText("poll_window");
    this.pOfferWindowID = getText("poll_offer_window");
    this.pThanksWindowID = getText("poll_thanks_window");
    this.pConfirmWindowID = getText("poll_confirm_window");
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("hideWindows"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("hideWindows"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    return 1;
  }

  showOffer(tDescription) {
    this.hideOffer();
    if (!createWindow(this.pOfferWindowID, "habbo_full.window", VOID, VOID)) {
      return error(this, "Failed to open Poll offer window!!!", Symbol.for("showOffer"));
    } else {
      tWndObj = getWindow(this.pOfferWindowID);
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcOffer"), this.getID(), Symbol.for("mouseUp"));
      tWndObj.registerProcedure(Symbol.for("eventProcOffer"), this.getID(), Symbol.for("mouseDown"));
      if (!tWndObj.merge("poll_offer.window")) {
        return tWndObj.close();
      }
      tElem = tWndObj.getElement("offer_scrollbar");
      if (tElem != 0) {
        tElem.setProperty(Symbol.for("visible"), 0);
      }
      tElem = tWndObj.getElement("poll_offer_text");
      if (tElem != 0) {
        tHeightNow = tElem.getProperty(Symbol.for("image")).rect.height;
        tElem.setText(tDescription);
        tNewHeight = tElem.getProperty(Symbol.for("image")).rect.height;
        tElem.setProperty(Symbol.for("height"), tNewHeight);
        tWndObj.pClientRect[2] = tWndObj.pClientRect[2] + (tNewHeight - tHeightNow);
      }
      if (!tWndObj.merge("poll_purkka.window")) {
        return tWndObj.close();
      }
    }
    return 1;
  }

  hideOffer() {
    if (windowExists(this.pOfferWindowID)) {
      return removeWindow(this.pOfferWindowID);
    } else {
      return 0;
    }
  }

  showQuestion() {
    tWndObj = getWindow(this.pPollWindowID);
    if (tWndObj != 0) {
      return 1;
    }
    if (!this.getComponent().getQuestionAvailable()) {
      this.showThanks();
      return 0;
    }
    if (!createWindow(this.pPollWindowID, "habbo_full.window", VOID, VOID)) {
      return error(this, "Failed to open Poll window!!!", Symbol.for("showPoll"));
    } else {
      tWndObj = getWindow(this.pPollWindowID);
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcQuestion"), this.getID(), Symbol.for("mouseUp"));
      tWndObj.registerProcedure(Symbol.for("eventProcQuestion"), this.getID(), Symbol.for("mouseDown"));
      if (!tWndObj.merge("poll_question_main.window")) {
        return tWndObj.close();
      }
      tElem = tWndObj.getElement("poll_description");
      if (tElem != 0) {
        tElem.setText(this.getComponent().getPollHeadLine());
      }
      tElem = tWndObj.getElement("poll_question_number");
      if (tElem != 0) {
        tText = getText("poll_question_number");
        tText = replaceChunks(tText, "%number%", this.getComponent().getQuestionNumber());
        tText = replaceChunks(tText, "%count%", this.getComponent().getQuestionCount());
        tElem.setText(tText);
      }
      tElem = tWndObj.getElement("question_scrollbar");
      if (tElem != 0) {
        tElem.setProperty(Symbol.for("visible"), 0);
      }
      tElem = tWndObj.getElement("question_text");
      if (tElem != 0) {
        tHeightNow = tElem.getProperty(Symbol.for("image")).rect.height;
        tElem.setText(this.getComponent().getQuestionText());
        tNewHeight = tElem.getProperty(Symbol.for("image")).rect.height;
        if (tNewHeight > tHeightNow) {
          tElem.setProperty(Symbol.for("height"), tNewHeight);
          tWndObj.pClientRect[2] = tWndObj.pClientRect[2] + (tNewHeight - tHeightNow);
        }
      }
      tQuestionType = this.getComponent().getQuestionType();
      if ((tQuestionType == 3) || (tQuestionType == 4)) {
        if (!tWndObj.merge("poll_question_open.window")) {
          return tWndObj.close();
        }
      } else {
        if ((tQuestionType == 1) || (tQuestionType == 2)) {
          tSelectionCount = this.getComponent().getSelectionCount();
          for (let i = 1; i <= tSelectionCount; i++) {
            if (!this.duplicateWindowRecording("poll_question_selection", "_1", `_${i}`)) {
              return tWndObj.close();
            }
            if (!tWndObj.merge(`poll_question_selection_${i}.window`)) {
              return tWndObj.close();
            }
            tElem = tWndObj.getElement(`selection_scrollbar_${i}`);
            if (tElem != 0) {
              tElem.setProperty(Symbol.for("visible"), 0);
            }
            tElem = tWndObj.getElement(`poll_selection_text_${i}`);
            if (tElem != 0) {
              tHeightNow = tElem.getProperty(Symbol.for("image")).rect.height;
              tElem.setText(this.getComponent().getSelectionText(i));
              tNewHeight = tElem.getProperty(Symbol.for("image")).rect.height;
              if (tNewHeight > tHeightNow) {
                tElem.setProperty(Symbol.for("height"), tNewHeight);
                tWndObj.pClientRect[2] = tWndObj.pClientRect[2] + (tNewHeight - tHeightNow);
              }
            }
          }
          this.updateSelectionButtons();
        }
      }
    }
    return 1;
  }

  hideQuestion() {
    if (windowExists(this.pPollWindowID)) {
      return removeWindow(this.pPollWindowID);
    } else {
      return 0;
    }
  }

  showThanks() {
    this.hideThanks();
    if (!createWindow(this.pThanksWindowID, "habbo_full.window", VOID, VOID)) {
      return error(this, "Failed to open Poll thanks window!!!", Symbol.for("showThanks"));
    } else {
      tWndObj = getWindow(this.pThanksWindowID);
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcThanks"), this.getID(), Symbol.for("mouseUp"));
      tWndObj.registerProcedure(Symbol.for("eventProcThanks"), this.getID(), Symbol.for("mouseDown"));
      if (!tWndObj.merge("poll_thank_you.window")) {
        return tWndObj.close();
      }
      tElem = tWndObj.getElement("thanks_scrollbar");
      if (tElem != 0) {
        tElem.setProperty(Symbol.for("visible"), 0);
      }
      tElem = tWndObj.getElement("poll_thanks_text");
      if (tElem != 0) {
        tHeightNow = tElem.getProperty(Symbol.for("image")).rect.height;
        tText = this.getComponent().getThanks();
        tElem.setText(tText);
        tNewHeight = tElem.getProperty(Symbol.for("image")).rect.height;
        tElem.setProperty(Symbol.for("height"), tNewHeight);
        tWndObj.pClientRect[2] = tWndObj.pClientRect[2] + (tNewHeight - tHeightNow);
      }
      if (!tWndObj.merge("poll_purkka.window")) {
        return tWndObj.close();
      }
    }
    return 1;
  }

  hideThanks() {
    if (windowExists(this.pThanksWindowID)) {
      return removeWindow(this.pThanksWindowID);
    } else {
      return 0;
    }
  }

  hideConfirm() {
    if (windowExists(this.pConfirmWindowID)) {
      return removeWindow(this.pConfirmWindowID);
    } else {
      return 0;
    }
  }

  hideWindows() {
    this.hideQuestion();
    this.hideConfirm();
    this.hideOffer();
    this.hideThanks();
  }

  confirmAction(tAction) {
    tResult = this.getComponent().confirmAction(tAction);
    if (tResult) {
      if (!windowExists(this.pConfirmWindowID)) {
        if (!createWindow(this.pConfirmWindowID, "habbo_full.window", VOID, VOID, Symbol.for("modal"))) {
          return error(this, "Failed to open Poll confirm window!!!", Symbol.for("confirmAction"));
        } else {
          tWndObj = getWindow(this.pConfirmWindowID);
          tWndObj.registerClient(this.getID());
          tWndObj.registerProcedure(Symbol.for("eventProcConfirm"), this.getID(), Symbol.for("mouseUp"));
          if (!tWndObj.merge("habbo_decision_dialog.window")) {
            return tWndObj.close();
          }
          tElem = tWndObj.getElement("habbo_decision_text_a");
          if (tElem != 0) {
            tText = getText(`poll_confirm_${tAction}`);
            tElem.setText(tText);
          }
          tElem = tWndObj.getElement("habbo_decision_text_b");
          if (tElem != 0) {
            tText = getText(`poll_confirm_${tAction}_long`);
            tElem.setText(tText);
          }
          tWndObj.center();
          tWndObj.moveBy(0, -30);
        }
      }
    }
    return tResult;
  }

  ShowAlert(ttype) {
    tTextId = `poll_alert_${ttype}`;
    executeMessage(Symbol.for("alert"), propList("Msg", tTextId, "modal", 1));
  }

  duplicateWindowRecording(tNameBase, tOriginalIDPart, tTargetIDPart) {
    tSourceMemName = `${tNameBase}${tOriginalIDPart}.window`;
    tSourceMember = member(tSourceMemName);
    if (tSourceMember.name != tSourceMemName) {
      return 0;
    }
    if (tSourceMember.type != Symbol.for("field")) {
      return 0;
    }
    tTargetMemName = `${tNameBase}${tTargetIDPart}.window`;
    if (member(tTargetMemName).name == tTargetMemName) {
      return 1;
    }
    tTargetMemberNum = createMember(tTargetMemName, tSourceMember.type, 0);
    if (tTargetMemberNum == 0) {
      return error(this, `Could not create a new member for copying: ${tTargetMemName}`, Symbol.for("duplicateWindowRecording"));
    }
    tTargetMember = member(tTargetMemberNum);
    tTargetMember.media = tSourceMember.media;
    tText = tTargetMember.text;
    tText = replaceChunks(tText, tOriginalIDPart, tTargetIDPart);
    tTargetMember.text = tText;
    return 1;
  }

  updateSelectionButtons() {
    tWndObj = getWindow(this.pPollWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    tSelectionCount = this.getComponent().getSelectionCount();
    tSelectionMax = this.getComponent().getSelectionMaxCount();
    if (tSelectionMax == 1) {
      tImageList = list("button.radio.on", "button.radio.off");
    } else {
      tImageList = list("button.checkbox.on", "button.checkbox.off");
    }
    for (let i = 1; i <= tSelectionCount; i++) {
      tElem = tWndObj.getElement(`poll_selection_button_${i}`);
      if (tElem != 0) {
        if (this.getComponent().getSelectionState(i)) {
          tElem.feedImage(member(tImageList[1]).image);
          continue;
        }
        tElem.feedImage(member(tImageList[2]).image);
      }
    }
    return 1;
  }

  eventProcOffer(tEvent, tSprID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
        case "poll_offer_cancel":
          this.getComponent().rejectPoll();
          this.hideOffer();
          break;
        case "poll_offer_ok":
          this.getComponent().acceptPoll();
          this.hideOffer();
          break;
      }
    }
  }

  eventProcQuestion(tEvent, tSprID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
        case "poll_question_cancel":
          this.confirmAction("cancel");
          break;
        case "poll_question_ok":
          tWndObj = getWindow(this.pPollWindowID);
          if (tWndObj != 0) {
            tElem = tWndObj.getElement("poll_answer");
            if (tElem != 0) {
              tText = tElem.getText();
              this.getComponent().setAnswerText(tText);
            }
          }
          tRetVal = this.getComponent().sendAnswer();
          if (tRetVal) {
            this.hideQuestion();
            this.showQuestion();
          } else {
            this.ShowAlert("answer_missing");
          }
          break;
      }
      if (offset("poll_selection_button_", tSprID) == 1) {
        tIndex = value(tSprID.char[`${"poll_selection_button_".length + 1}..${tSprID.length}`]);
        if (this.getComponent().changeSelectionState(tIndex)) {
          this.updateSelectionButtons();
        } else {
          this.ShowAlert("invalid_selection");
        }
      }
    }
    return 1;
  }

  eventProcThanks(tEvent, tSprID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
        case "poll_thanks_ok":
          this.hideThanks();
          break;
      }
    }
    return 1;
  }

  eventProcConfirm(tEvent, tSprID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
        case "habbo_decision_cancel":
          this.hideConfirm();
          break;
        case "habbo_decision_ok":
          this.getComponent().actionConfirmed();
          this.hideConfirm();
          break;
      }
    }
    return 1;
  }
}
