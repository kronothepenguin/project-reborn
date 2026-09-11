export default class {
  addWindows() {
    this.pWindowID = "ru";
    const tService = this.getIGComponent("PreGame");
    if (tService == 0) {
      return 0;
    }
    const tGameRef = tService.getJoinedGame();
    if (tGameRef == 0) {
      return 0;
    }
    const tGameType = tGameRef.getProperty(Symbol.for("game_type"));
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    let tScrollStartOffset = -100;
    let tWinChar = "a";
    const tLayoutList = list();
    for (let i = charToNum("a"); i <= charToNum("z"); i++) {
      const tLayoutID = `ig_pg_rules_${numToChar(i)}_${tGameType}.window`;
      if (memberExists(tLayoutID)) {
        tLayoutList.append(tLayoutID);
      }
    }
    for (let i = 1; i <= tLayoutList.count; i++) {
      if (i < tLayoutList.count) {
        tWrapObjRef.addOneWindow(this.getWindowId(i), tLayoutList[i], this.pWindowSetId, propList("scrollFromLocX", tScrollStartOffset, "spaceBottom", 2));
      } else {
        tWrapObjRef.addOneWindow(this.getWindowId(i), tLayoutList[i], this.pWindowSetId, propList("scrollFromLocX", tScrollStartOffset, "spaceBottom", 2));
      }
      tScrollStartOffset = tScrollStartOffset - 50;
    }
    return 1;
  }
}
