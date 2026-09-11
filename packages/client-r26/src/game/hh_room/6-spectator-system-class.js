export default class {
  pSpectatorMode;
  pVisualizerId;
  pSpecCountId;
  pSpecCountTimerId;
  pWriterBold;

  construct() {
    this.pSpectatorMode = 0;
    this.pVisualizerId = "passive_tv_screen";
    this.pSpecCountId = "spec_count_id";
    this.pSpecCountTimerId = "spec_count_timer";
    this.pWriterBold = "dialog_writer_bold";
    let tFontBold = getStructVariable("struct.font.bold");
    tFontBold.setaProp(Symbol.for("color"), rgb(240, 240, 240));
    createWriter(this.pWriterBold, tFontBold);
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("hideSpectatorView"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("hideSpectatorView"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    if (windowExists(this.pSpecCountId)) {
      removeWindow(this.pSpecCountId);
    }
    if (timeoutExists(this.pSpecCountTimerId)) {
      removeTimeout(this.pSpecCountTimerId);
    }
    if (writerExists(this.pWriterBold)) {
      removeWriter(this.pWriterBold);
    }
    return 1;
  }

  getSpectatorMode() {
    return this.pSpectatorMode;
  }

  setSpectatorMode(tstate, tSpaceType) {
    if (tstate == 1) {
      this.pSpectatorMode = 1;
      this.showSpectatorView();
      this.getSpectatorCount();
      executeMessage(Symbol.for("spectatorMode_on"));
    } else {
      this.pSpectatorMode = 0;
      switch (tSpaceType) {
        case Symbol.for("public"):
          if (getConnection(Symbol.for("Info")) != 0) {
            getConnection(Symbol.for("Info")).send("QUIT");
          }
          executeMessage(Symbol.for("leaveRoom"));
          executeMessage(Symbol.for("spectatorMode_off"));
          break;
        case Symbol.for("private"):
          break;
        case Symbol.for("game"):
          executeMessage(Symbol.for("spectatorMode_off"));
          break;
      }
    }
    return 1;
  }

  updateSpectatorCount(tSpectatorCount, tSpectatorMax) {
    createTimeout(this.pSpecCountTimerId, 15000, Symbol.for("getSpectatorCount"), this.getID(), VOID, 1);
    if (tSpectatorCount == -1) {
      if (windowExists(this.pSpecCountId)) {
        removeWindow(this.pSpecCountId);
      }
      return 1;
    }
    let tUnmerge = 1;
    if (!windowExists(this.pSpecCountId)) {
      createWindow(this.pSpecCountId, "spec_count.window");
      tUnmerge = 0;
    }
    let tText = getText("spectator_count");
    let tTextImg = getWriter(this.pWriterBold).render(tText).duplicate();
    let tTextWd = tTextImg.width;
    let tTextHt = tTextImg.height;
    tText = replaceChunks(tText, "%cnt%", tSpectatorCount);
    tText = replaceChunks(tText, "%max%", tSpectatorMax);
    tTextImg = getWriter(this.pWriterBold).render(tText).duplicate();
    let tWndObj = getWindow(this.pSpecCountId);
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.lock(1);
    if (tUnmerge) {
      tWndObj.unmerge();
    }
    if (!tWndObj.merge("spec_count_2.window")) {
      return 0;
    }
    let tElem = tWndObj.getElement("spec_count_text");
    if (tElem != 0) {
      tElem.setText(tText);
      let tElemWd = tElem.getProperty(Symbol.for("width"));
      let tWindowWd = tWndObj.getProperty(Symbol.for("width"));
      let tWindowHt = tWndObj.getProperty(Symbol.for("height"));
      tWndObj.resizeTo(tTextWd + (tWindowWd - tElemWd), tWindowHt);
      tElem.resizeTo(tTextWd, tElem.getProperty(Symbol.for("height")));
      tElem.moveBy((tTextWd - tTextImg.width) / 2, (tWindowHt - tTextHt) / 2);
      tElem.feedImage(tTextImg);
    }
    tWndObj.center();
    tWndObj.moveTo(tWndObj.getProperty(Symbol.for("locX")), 2);
    return 1;
  }

  showSpectatorView() {
    let tRoomInt = getObject(Symbol.for("room_interface"));
    if (objectp(tRoomInt)) {
      executeMessage(Symbol.for("removeObjectInfo"));
      tRoomInt.showRoomBar();
      if (tRoomInt.getHiliter() != 0) {
        removeUpdate(tRoomInt.getHiliter().getID());
        removeObject(tRoomInt.getHiliter().getID());
      }
    }
    if (visualizerExists(this.pVisualizerId)) {
      return 1;
    }
    if ((the.stage).rect.width <= 720) {
      createVisualizer(this.pVisualizerId, "habbo_tv.visual");
    } else {
      createVisualizer(this.pVisualizerId, "habbo_tv_wide.visual");
    }
    let tVisObj = getVisualizer(this.pVisualizerId);
    let tRoomVis = tRoomInt.getRoomVisualizer();
    if (tRoomVis == 0) {
      return 0;
    }
    tVisObj.moveZ(getIntVariable("window.default.locz") - 10);
    return 1;
  }

  hideSpectatorView() {
    this.pSpectatorMode = 0;
    if (visualizerExists(this.pVisualizerId)) {
      removeVisualizer(this.pVisualizerId);
    }
    if (windowExists(this.pSpecCountId)) {
      removeWindow(this.pSpecCountId);
    }
    if (timeoutExists(this.pSpecCountTimerId)) {
      removeTimeout(this.pSpecCountTimerId);
    }
    return 1;
  }

  getSpectatorCount() {
    getConnection(getVariable("connection.room.id")).send("GET_SPECTATOR_AMOUNT");
  }
}
