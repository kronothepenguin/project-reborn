export default class {
  render() {
    this.ancestor.render(this);
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    const tItemRef = tService.getObservedGame();
    if (tItemRef == 0) {
      return 0;
    }
    let tWndObj = getWindow(this.getWindowId("btm"));
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.unmerge();
    tWndObj.resizeTo(0, 0);
    tWndObj = getWindow(this.getWindowId("spec"));
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.unmerge();
    tWndObj.merge("ig_duration.window");
    this.renderDuration(tItemRef.getProperty(Symbol.for("duration")) / 60);
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.render();
    return 1;
  }

  renderDuration(tValue) {
    const tWndObj = getWindow(this.getWindowId("spec"));
    if (tWndObj == 0) {
      return 0;
    }
    for (const i of list(2, 3, 5)) {
      const tElement = tWndObj.getElement(`ig_game_drt_${i}`);
      if (tElement != 0) {
        tElement.setProperty(Symbol.for("blend"), 0 + ((i == tValue) * 100));
      }
    }
  }
}
