export default class {
  render() {
    const tService = this.getIGComponent("LevelList");
    if (tService == 0) {
      return 0;
    }
    const tItemRef = tService.getSelectedLevel();
    if (tItemRef == 0) {
      return 0;
    }
    const tWndObj = getWindow(this.getWindowId("spec"));
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.unmerge();
    tWndObj.merge("ig_choose_duration.window");
    this.renderProperty(Symbol.for("duration"), tItemRef.getProperty(Symbol.for("duration")));
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.render();
    this.ancestor.render();
    return 1;
  }

  renderProperty(tKey, tValue) {
    switch (tKey) {
      case Symbol.for("duration"):
        return this.renderDuration(tValue / 60);
    }
    return this.ancestor.renderProperty(tKey, tValue);
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

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID, tIntParam) {
    put(`* eventProcMouseDown ${tEvent} ${tSprID} ${tParam} ${tWndID} ${tIntParam}`);
    const tService = this.getIGComponent("LevelList");
    if (tService == 0) {
      return 0;
    }
    switch (tSprID) {
      case "ig_game_drt":
        return tService.setProperty(Symbol.for("duration"), tIntParam * 60);
    }
    return 0;
  }
}
