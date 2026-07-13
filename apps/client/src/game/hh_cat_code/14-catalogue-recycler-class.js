export default class {
  construct() {
    let tWindowObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tWindowObj) {
      tWindowObj = VOID;
      return error(this, "Couldn't access catalogue window!", Symbol.for("construct"), Symbol.for("major"));
    }
    let tHeaderImageNo = getThread(Symbol.for("catalogue")).getComponent().pCatalogProps["Recycler"]["headerImage"];
    getThread(Symbol.for("recycler")).getInterface().setHeaderImage(tHeaderImageNo);
    getThread(Symbol.for("recycler")).getInterface().setHostWindowObject(tWindowObj);
    getThread(Symbol.for("recycler")).getComponent().openRecycler();
    return 1;
  }

  deconstruct() {
    getThread(Symbol.for("recycler")).getComponent().closeRecycler();
    return 1;
  }

  closePage() {
    getThread(Symbol.for("recycler")).getComponent().closeRecycler();
  }

  eventProc(tEvent, tSprID, tProp) {
    let tRecyclerInterface = getThread(Symbol.for("recycler")).getInterface();
    return tRecyclerInterface.eventProc(tEvent, tSprID, tProp);
  }
}
