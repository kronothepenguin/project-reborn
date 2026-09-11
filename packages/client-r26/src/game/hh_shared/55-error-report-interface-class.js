export default class {
  pWindowID;
  pCurrentErrorIndex;
  pErrorLock;

  construct() {
    this.pWindowID = getText("error_report");
    this.pCurrentErrorIndex = 1;
    this.pErrorLock = 0;
    return 1;
  }

  deconstruct() {
    return 1;
  }

  showErrors() {
    if (this.pErrorLock) {
      return 1;
    }
    this.pErrorLock = 1;
    const tReportLists = this.getComponent().getErrorLists();
    if (tReportLists.count == 0) {
      this.pErrorLock = 0;
      return 0;
    }
    if (!windowExists(this.pWindowID)) {
      createWindow(this.pWindowID, "habbo_full.window");
      const tWndObj = getWindow(this.pWindowID);
      tWndObj.merge("error_report_details.window");
      tWndObj.center();
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcErrorReport"), this.getID(), Symbol.for("mouseUp"));
      tWndObj.getElement("error_report_prev").setText("<<<");
      tWndObj.getElement("error_report_next").setText(">>>");
    }
    this.updateErrorView();
    this.pErrorLock = 0;
  }

  showPreviousError() {
    const tTriedErrorIndex = this.pCurrentErrorIndex - 1;
    const tReportList = this.getComponent().getErrorLists();
    if ((tTriedErrorIndex < 1) || (tReportList.count == 0)) {
      return 0;
    }
    this.pCurrentErrorIndex = tTriedErrorIndex;
    this.updateErrorView();
  }

  showNextError() {
    const tTriedErrorIndex = this.pCurrentErrorIndex + 1;
    const tReportList = this.getComponent().getErrorLists();
    if (tTriedErrorIndex > tReportList.count) {
      return 0;
    }
    this.pCurrentErrorIndex = tTriedErrorIndex;
    this.updateErrorView();
  }

  updateErrorView() {
    const tWndObj = getWindow(this.pWindowID);
    const tIndexOfCurrentReport = this.pCurrentErrorIndex;
    const tReportList = this.getComponent().getErrorLists();
    const tErrorReport = tReportList[tIndexOfCurrentReport];
    const tCounts = `${this.pCurrentErrorIndex}/${tReportList.count}`;
    let tElement = tWndObj.getElement("error_report_count");
    if (tElement != 0) {
      tElement.setText(tCounts);
    }
    const tTexts = propList();
    tTexts["error_report_errorid"] = `ID:${tErrorReport[Symbol.for("errorId")]}`;
    let tExplainText = EMPTY;
    if (!voidp(tErrorReport[Symbol.for("time")])) {
      tExplainText = `${tErrorReport[Symbol.for("time")]}${RETURN}`;
    }
    if (!voidp(tErrorReport[Symbol.for("errorMsgId")])) {
      tExplainText = `${tExplainText}${getText("error_report_trigger_message")}: ${tErrorReport[Symbol.for("errorMsgId")]}`;
    } else {
      if (!voidp(tErrorReport[Symbol.for("errorMsg")])) {
        tExplainText = `${tExplainText}${tErrorReport[Symbol.for("errorMsg")]}`;
      }
    }
    tTexts["error_report_details"] = tExplainText;
    for (let tIndex = 1; tIndex <= tTexts.count; tIndex++) {
      const tElementName = tTexts.getPropAt(tIndex);
      const tText = tTexts[tIndex];
      if (tWndObj.elementExists(tElementName)) {
        const tElement = tWndObj.getElement(tElementName);
        tElement.setText(tText);
      }
    }
  }

  hideErrorReportWindow() {
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    this.getComponent().clearErrorLists(this.pCurrentErrorIndex);
    this.pCurrentErrorIndex = 1;
    const tWndObj = getWindow(this.pWindowID);
    tWndObj.close();
  }

  eventProcErrorReport(tEvent, tElemID, tParams) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "error_report_ok":
        case "close":
          this.hideErrorReportWindow();
          break;
        case "error_report_prev":
          this.showPreviousError();
          break;
        case "error_report_next":
          this.showNextError();
          break;
      }
    }
  }
}
