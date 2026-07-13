export default class {
  pVisible;
  pTargetElementID;

  construct() {
    pVisible = 0;
    registerMessage(Symbol.for("toggle_ig"), this.getID(), Symbol.for("hide"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("toggle_ig"), this.getID());
    return 1;
  }

  Init(tTargetElementID) {
    pTargetElementID = tTargetElementID;
  }

  show() {
    if (pVisible) {
      return 1;
    }
    const tMainThread = getObject(Symbol.for("ig_component"));
    if (tMainThread == 0) {
      return this.hide();
    }
    if (tMainThread.getSystemState() != Symbol.for("ready")) {
      return this.hide();
    }
    if (tMainThread.getInterface().getWindowVisible()) {
      return 1;
    }
    const tService = tMainThread.getIGComponent("Recommended");
    if (tService == 0) {
      return 0;
    }
    const tRenderObj = tService.getRenderer(1);
    if (tRenderObj == 0) {
      return 0;
    }
    tService.renderUI();
    tRenderObj.setTarget(pTargetElementID);
    pVisible = 1;
    return 1;
  }

  hide() {
    if (!pVisible) {
      return 1;
    }
    pVisible = 0;
    const tService = getObject(Symbol.for("ig_component"));
    if (tService == 0) {
      return 0;
    }
    tService.removeIGComponent("Recommended");
    return 1;
  }
}
