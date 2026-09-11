export default class {
  addWindows() {
    this.pWindowID = "gb";
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.addOneWindow(this.getWindowId(), "ig_ag_hide_highscores.window", this.pWindowSetId, propList("scrollFromLocX", -450));
    return 1;
  }
}
