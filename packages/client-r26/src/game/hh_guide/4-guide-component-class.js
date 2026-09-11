export default class {
  pState;
  pInvitationData;

  construct() {
    this.pState = Symbol.for("disabled");
    this.pInvitationData = propList();
    registerMessage(Symbol.for("userlogin"), this.getID(), Symbol.for("Init"));
    registerMessage(Symbol.for("showInvitation"), this.getID(), Symbol.for("setInvitation"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("userlogin"), this.getID(), Symbol.for("Init"));
    unregisterMessage(Symbol.for("showInvitation"), this.getID(), Symbol.for("setInvitation"));
    return 1;
  }

  setInvitation(tInvitationData) {
    if (tInvitationData.ilk != Symbol.for("propList")) {
      tInvitationData = propList();
    }
    this.pInvitationData = tInvitationData;
    this.setState(Symbol.for("ready"));
  }

  getInvitation() {
    return this.pInvitationData;
  }

  cancelInvitation() {
    this.pInvitationData = propList();
    this.setState(Symbol.for("waiting"));
  }

  getState() {
    return this.pState;
  }

  setState(tstate) {
    if (tstate == this.pState) {
      return 1;
    }
    this.pState = tstate;
    this.getInterface().update();
  }

  Init() {
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("MSG_INIT_TUTORSERVICE");
    }
  }

  startWaiting() {
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("MSG_WAIT_FOR_TUTOR_INVITATIONS");
    }
    this.setState(Symbol.for("waiting"));
  }

  cancelWaiting() {
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("MSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS");
    }
    this.setState(Symbol.for("enabled"));
  }

  acceptInvitation() {
    if (ilk(this.pInvitationData) != Symbol.for("propList")) {
      return 0;
    }
    let tSenderId = this.pInvitationData.getaProp(Symbol.for("userID"));
    if (voidp(tSenderId)) {
      return 0;
    }
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("MSG_ACCEPT_TUTOR_INVITATION", propList("string", tSenderId));
    }
    this.setState(Symbol.for("enabled"));
  }

  rejectInvitation() {
    let tSenderId = this.pInvitationData.getaProp(Symbol.for("userID"));
    if (voidp(tSenderId)) {
      return 0;
    }
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("MSG_REJECT_TUTOR_INVITATION", propList("string", tSenderId));
    }
    this.setState(Symbol.for("enabled"));
  }
}
