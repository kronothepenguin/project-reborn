export default class {
  deconstruct() {
    callAncestor(Symbol.for("deconstruct"), [this]);
    executeMessage(Symbol.for("roomdimmer_removed"), this.getID());
    return 1;
  }

  define(tProps) {
    callAncestor(Symbol.for("define"), [this], tProps);
    if (voidp(tProps[Symbol.for("stripId")])) {
      executeMessage(Symbol.for("roomdimmer_defined"), this.getID());
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
      executeMessage(Symbol.for("roomdimmer_selected"), propList("id", this.getID(), "furniOn", tStateOn));
    } else {
      return callAncestor(Symbol.for("select"), [this]);
    }
    return 1;
  }

  setState(tNewState) {
    tNewState = string(tNewState);
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    if (tNewState.item.count < 5) {
      callAncestor(Symbol.for("setState"), [this], 1);
      return 0;
    }
    const tstate = tNewState.item[1];
    const tPresetID = tNewState.item[2];
    const tEffectID = tNewState.item[3];
    let tColor = tNewState.item[4];
    const tLightness = tNewState.item[5];
    the.itemDelimiter = tDelim;
    callAncestor(Symbol.for("setState"), [this], tstate);
    const tStateData = propList();
    tStateData.setaProp(Symbol.for("dimmerID"), this.getID());
    tStateData.setaProp(Symbol.for("isOn"), tstate == 2);
    tStateData.setaProp(Symbol.for("presetID"), value(tPresetID));
    tStateData.setaProp(Symbol.for("effectID"), value(tEffectID));
    tStateData.setaProp(Symbol.for("color"), rgb(tColor));
    tStateData.setaProp(Symbol.for("lightness"), value(tLightness));
    executeMessage(Symbol.for("roomdimmer_set_state"), tStateData);
  }
}
