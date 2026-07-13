export default class {
  pWindowID;

  construct() {
    pWindowID = getText("ig_arena_queue_header");
    return 1;
  }

  deconstruct() {
    if (windowExists(pWindowID)) {
      removeWindow(pWindowID);
    }
    return this.ancestor.deconstruct();
  }

  render(tQueuePos) {
    if (!windowExists(pWindowID)) {
      this.addWindows();
    }
    const tWndObj = getWindow(pWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_queue_text");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(replaceChunks(getText("ig_arena_queue_text"), "\x", string(tQueuePos)));
    return 1;
  }

  addWindows() {
    createWindow(pWindowID, VOID);
    const tWndObj = getWindow(pWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.merge("ig_arena_queue.window");
    tWndObj.registerProcedure(Symbol.for("eventProcMouseDown"), this.getID(), Symbol.for("mouseDown"));
  }

  eventProcMouseDown(tEvent, tSprID, tParam, tWndID) {
    if (tSprID != "ig_leave_game.button") {
      return 1;
    }
    this.getHandler().send_LEAVE_GAME();
    this.getHandler().send_EXIT_GAME(0);
    this.getComponent().setSystemState(Symbol.for("ready"));
    this.Remove();
    return 1;
  }
}
