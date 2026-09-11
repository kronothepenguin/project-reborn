export default class {
  pState;

  construct() {
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("leaveEntry"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("enterEntry"));
    registerMessage(Symbol.for("Initialize"), this.getID(), Symbol.for("updateState"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("enterRoom"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("Initialize"), this.getID());
    this.updateState("reset");
    return 1;
  }

  enterEntry() {
    this.updateState(Symbol.for("hotelView"));
    this.updateState(Symbol.for("entryBar"));
    return 1;
  }

  leaveEntry() {
    return this.updateState("reset");
  }

  getState() {
    return this.pState;
  }

  updateState(tstate) {
    switch (tstate) {
      case "reset":
        this.pState = tstate;
        return this.getInterface().hideAll();
      case Symbol.for("hotelView"):
      case "initialize":
        this.pState = tstate;
        return this.getInterface().showHotel();
      case Symbol.for("entryBar"):
        this.pState = tstate;
        return this.getInterface().showEntryBar();
      default:
        return error(this, `Unknown state: ${tstate}`, Symbol.for("updateState"), Symbol.for("minor"));
    }
  }
}
