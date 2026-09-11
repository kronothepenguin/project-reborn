export default class {
  addWindows() {
    this.pWindowID = "rq";
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.addOneWindow(this.getWindowId(), "ig_ag_play_again.window", this.pWindowSetId, propList("scrollFromLocX", -400, "spaceBottom", 2));
    return 1;
  }

  render() {
    const tID = this.getBasicFlagId();
    const tService = this.getIGComponent("AfterGame");
    if (tService == 0) {
      return 0;
    }
    this.setInfoFlag(tID, this.getWindowId(), "ig_title_play_again", "AfterGameTime", propList("light", rgb("#8C8C8C")), tService.getMsecAtNextState());
    return 1;
  }
}
