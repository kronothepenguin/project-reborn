export default class {
  pWindowID;
  pWindowList;

  construct() {
    pWindowList = list();
  }

  deconstruct() {
    for (const tWindowID of pWindowList) {
      removeWindow(tWindowID);
    }
    pWindowList = list();
    return this.ancestor.deconstruct();
  }

  toggle(tGameType) {
    if (pWindowList.count == 0) {
      return this.addWindows(tGameType);
    } else {
      return this.Remove();
    }
  }

  addWindows(tGameType) {
    this.pWindowID = "ru";
    const tStageWidth = the.stageRight - the.stageLeft;
    let tLocY = 10;
    const tWinChar = "a";
    const tLayoutList = list();
    for (let i = charToNum("a"); i <= charToNum("z"); i++) {
      const tLayoutID = `ig_pg_rules_${numToChar(i)}_${tGameType}.window`;
      if (memberExists(tLayoutID)) {
        tLayoutList.append(tLayoutID);
      }
    }
    for (let i = 1; i <= tLayoutList.count; i++) {
      const tWindowID = this.getWindowId(i);
      pWindowList.append(tWindowID);
      createWindow(tWindowID, tLayoutList[i]);
      const tWndObj = getWindow(tWindowID);
      if (tWndObj != 0) {
        const tLocX = tStageWidth - tWndObj.getProperty(Symbol.for("width")) - 10;
        tWndObj.moveTo(tLocX, tLocY);
        tLocY = tLocY + tWndObj.getProperty(Symbol.for("height")) + 2;
        tWndObj.registerProcedure(Symbol.for("eventProcMouseDown"), this.getID(), Symbol.for("mouseDown"));
      }
    }
    return 1;
  }

  getWindowId(tIndex) {
    return `${this.pWindowID}${tIndex}`;
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    if (tSprID != "ig_close") {
      return 1;
    }
    removeWindow(tWndID);
    pWindowList.deleteOne(tWndID);
    if (pWindowList.count == 0) {
      this.Remove();
    }
    return 1;
  }
}
