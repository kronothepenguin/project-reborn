export default class {
  pDefaultCallType;
  pDefaultCallTemplate;

  construct() {
    if (variableExists("stats.tracking.javascript")) {
      this.pDefaultCallType = getVariable("stats.tracking.javascript");
    }
    if (variableExists("stats.tracking.javascript.template")) {
      this.pDefaultCallTemplate = getVariable("stats.tracking.javascript.template");
    }
    registerListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), propList(166, Symbol.for("handle_update_stats")));
    registerMessage(Symbol.for("sendTrackingData"), this.getID(), Symbol.for("handle_update_stats"));
    registerMessage(Symbol.for("sendTrackingPoint"), this.getID(), Symbol.for("sendTrackingPoint"));
    return 1;
  }

  deconstruct() {
    unregisterListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), propList(166, Symbol.for("updateStats")));
    unregisterMessage(Symbol.for("sendTrackingData"), this.getID());
    unregisterMessage(Symbol.for("sendTrackingPoint"), this.getID());
    this.pProxy = VOID;
    return 1;
  }

  sendJsMessage(tMsg, tMsgType) {
    if (voidp(tMsgType)) {
      tMsgType = this.pDefaultCallType;
    }
    let tMsgContent = tMsg;
    if ((tMsgType != "hello") && !voidp(this.pDefaultCallTemplate)) {
      tMsgContent = replaceChunks(this.pDefaultCallTemplate, "\TCODE", tMsg);
    }
    callJavaScriptFunction(tMsgType, tMsgContent);
  }

  sendTrackingPoint(tPointStr) {
    const tTrackingHeader = getObject(Symbol.for("session")).GET("tracking_header");
    if (tTrackingHeader == 0) {
      return error(this, "Tracking header not in session.", Symbol.for("sendTrackingCall"), Symbol.for("minor"));
    }
    if (chars(tPointStr, 1, 1) != "/") {
      tPointStr = `/${tPointStr}`;
    }
    const tTrackStr = tTrackingHeader + tPointStr;
    this.sendJsMessage(tTrackStr);
  }

  handle_update_stats(tMsg) {
    const tContent = tMsg.content;
    this.sendJsMessage(tContent);
  }
}
