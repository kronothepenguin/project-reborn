export default class {
  construct() {
    return 1;
  }

  deconstruct() {
    return this.ancestor.deconstruct();
  }

  executeGameChat(tdata) {
    const tSystemState = this.getComponent().getSystemState();
    switch (tSystemState) {
      case Symbol.for("after_game"):
      case Symbol.for("pre_game"):
        executeMessage(Symbol.for("showCustomMessage"), propList(Symbol.for("mode"), "CHAT", Symbol.for("id"), string(tdata.getaProp(Symbol.for("id"))), Symbol.for("message"), tdata.getaProp(Symbol.for("message")), Symbol.for("loc"), point(450, 500)));
        break;
      default:
        executeMessage(Symbol.for("showChatMessage"), "CHAT", string(tdata.getaProp(Symbol.for("id"))), tdata.getaProp(Symbol.for("message")));
        break;
    }
    return 1;
  }
}
