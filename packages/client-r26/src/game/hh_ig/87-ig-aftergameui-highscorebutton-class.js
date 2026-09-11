export default class {
  addWindows() {
    this.pWindowID = "hb";
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.addOneWindow(this.getWindowId(), "ig_ag_show_highscores.window", this.pWindowSetId, propList("scrollFromLocX", -450));
    return 1;
  }
}
