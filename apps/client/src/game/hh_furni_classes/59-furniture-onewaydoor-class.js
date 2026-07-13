export default class {
  select() {
    const tUserObj = getThread(Symbol.for("room")).getComponent().getOwnUser();
    if (tUserObj == 0) {
      return 0;
    }
    const tLocUser = list(tUserObj.pLocX, tUserObj.pLocY);
    const tLocDoor = list(this.pLocX, this.pLocY);
    let tLocWanted;
    switch (this.pDirection[1]) {
      case 0:
        tLocWanted = tLocDoor + list(0, -1);
        break;
      case 2:
        tLocWanted = tLocDoor + list(1, 0);
        break;
      case 4:
        tLocWanted = tLocDoor + list(0, 1);
        break;
      case 6:
        tLocWanted = tLocDoor + list(-1, 0);
        break;
      default:
        return 0;
    }
    const tConnection = getConnection(getVariable("connection.info.id", Symbol.for("Info")));
    if (voidp(tConnection)) {
      error(this, "No connection available.", this.getID(), Symbol.for("select"), Symbol.for("major"));
      return 0;
    }
    if (tLocUser == tLocWanted) {
      if (the.doubleClick) {
        tConnection.send("ENTER_ONEWAY_DOOR", propList("integer", integer(this.getID())));
      }
    } else {
      tConnection.send("MOVE", propList("short", tLocWanted[1], "short", tLocWanted[2]));
    }
    return 1;
  }

  setDoor(tStatus) {
    if (!((tStatus == 1) || (tStatus == 0))) {
      error(this, `Invalid door status: ${tStatus}`, Symbol.for("setDoor"), Symbol.for("minor"));
      return 0;
    }
    for (const tsprite of this.pSprList) {
      const tCurName = tsprite.member.name;
      const tNewName = `${tCurName.char[`1..${length(tCurName) - 1}`]}${tStatus}`;
      if (memberExists(tNewName)) {
        const tMem = member(getmemnum(tNewName));
        tsprite.member = tMem;
        tsprite.width = tMem.width;
        tsprite.height = tMem.height;
      }
    }
  }
}
