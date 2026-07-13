export default class {
  setID(tID) {
    callAncestor(Symbol.for("setID"), [this], tID);
    executeMessage(Symbol.for("sound_machine_created"), this.getID(), 1);
    return 1;
  }

  deconstruct() {
    executeMessage(Symbol.for("sound_machine_removed"), this.getID());
    callAncestor(Symbol.for("deconstruct"), [this]);
    return 1;
  }

  define(tProps) {
    const tRetVal = callAncestor(Symbol.for("define"), [this], tProps);
    if (voidp(tProps[Symbol.for("stripId")])) {
      executeMessage(Symbol.for("sound_machine_defined"), this.getID());
    }
    return 1;
  }

  select() {
    let towner = 0;
    const tSession = getObject(Symbol.for("session"));
    if (tSession != 0) {
      if (tSession.GET("room_owner")) {
        towner = 1;
      }
    }
    if (the.doubleClick && towner) {
      let tStateOn = 0;
      if (this.pState == 2) {
        tStateOn = 1;
      }
      executeMessage(Symbol.for("sound_machine_selected"), propList("id", this.getID(), "furniOn", tStateOn));
    } else {
      return callAncestor(Symbol.for("select"), [this]);
    }
    return 1;
  }

  changeState(tStateOn) {
    let tNewState = 1;
    if (tStateOn) {
      tNewState = 2;
    }
    return getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", string(tNewState)));
  }

  setState(tNewState) {
    callAncestor(Symbol.for("setState"), [this], tNewState);
    if (voidp(tNewState)) {
      return 0;
    }
    let tStateOn = 0;
    if (this.pState == 2) {
      tStateOn = 1;
    }
    executeMessage(Symbol.for("sound_machine_set_state"), propList("id", this.getID(), "furniOn", tStateOn));
  }
}
