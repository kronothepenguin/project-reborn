export default class {
  addWindows() {
    this.pWindowID = "rb";
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.addOneWindow(this.getWindowId(), "ig_pg_show_rules.window", this.pWindowSetId, propList("scrollFromLocX", -190, "spaceBottom", 0));
    return 1;
  }
}
