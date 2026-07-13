export default class {
  pUiObjectID;
  pPrice;

  construct() {
    this.pUiObjectID = "Credit Furni Redeem";
    return callAncestor(Symbol.for("construct"), [this]);
  }

  deconstruct() {
    if (objectExists(this.pUiObjectID)) {
      removeObject(this.pUiObjectID);
    }
    callAncestor(Symbol.for("deconstruct"), [this]);
  }

  prepare(tdata) {
    this.pPrice = tdata[Symbol.for("stuffdata")];
    return 1;
  }

  select() {
    if (the.doubleClick && getObject(Symbol.for("session")).GET("room_owner")) {
      this.showRedeemInterface();
    }
    return 1;
  }

  showRedeemInterface() {
    if (objectExists(this.pUiObjectID)) {
      return 1;
    }
    createObject(this.pUiObjectID, "Credit Redeem Confirmation Class");
    if (objectExists(this.pUiObjectID)) {
      getObject(this.pUiObjectID).Init(this.getID(), this.pPrice);
    }
    return 1;
  }
}
