export default class {
  setID(tID) {
    callAncestor(Symbol.for("setID"), [this], tID);
    executeMessage(Symbol.for("sound_machine_created"), this.getID(), 0);
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
      executeMessage(Symbol.for("jukebox_defined"), this.getID());
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
    if (the.doubleClick) {
      executeMessage(Symbol.for("jukebox_selected"), propList("id", this.getID(), "owner", towner));
    } else {
      return callAncestor(Symbol.for("select"), [this]);
    }
    return 1;
  }

  getInfo() {
    const tInfo = callAncestor(Symbol.for("getInfo"), [this]);
    if (ilk(tInfo) != Symbol.for("propList")) {
      tInfo = propList();
    }
    if (voidp(tInfo[Symbol.for("custom")])) {
      tInfo[Symbol.for("custom")] = EMPTY;
    }
    tInfo[Symbol.for("custom")] = `${tInfo[Symbol.for("custom")]}${RETURN}`;
    const tArray = propList();
    executeMessage(Symbol.for("get_jukebox_song_info"), tArray);
    if (!voidp(tArray[Symbol.for("songName")])) {
      tInfo[Symbol.for("custom")] = `${tInfo[Symbol.for("custom")]}${tArray[Symbol.for("songName")]}${RETURN}`;
    }
    if (!voidp(tArray[Symbol.for("author")])) {
      tInfo[Symbol.for("custom")] = `${tInfo[Symbol.for("custom")]}${tArray[Symbol.for("author")]}`;
    }
    return tInfo;
  }

  setState(tNewState) {
    callAncestor(Symbol.for("setState"), [this], tNewState);
    if (voidp(tNewState)) {
      return 0;
    }
    const tStateOn = 1;
    executeMessage(Symbol.for("sound_machine_set_state"), propList("id", this.getID(), "furniOn", tStateOn));
  }
}
