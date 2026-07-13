export default class {
  pWindowID;
  pmode;
  pCamMember;
  pCamShotImage;
  pDisplaymem;
  pZoomLevel;
  pHNoiseCenter;
  pVNoiseCenter;
  pDialogId;
  pHandItemData;
  pNoiseDirH;
  pNoiseDirV;

  construct() {
    this.pCamMember = member(createMember("__cam_display_mem", Symbol.for("bitmap")));
    this.pWindowID = Symbol.for("photo_camera_window");
    this.pDialogId = Symbol.for("camera_dialog");
    this.pNoiseDirH = 1;
    this.pNoiseDirV = 1;
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    if (windowExists(this.pDialogId)) {
      removeWindow(this.pDialogId);
    }
    if (memberExists("__cam_display_mem")) {
      removeMember("__cam_display_mem");
    }
    removeUpdate(this.getID());
    return 1;
  }

  open() {
    if (!createWindow(this.pWindowID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pWindowID);
    tWndObj.merge("photo_camera.window");
    tWndObj.moveTo(100, 100);
    tWndObj.registerProcedure(Symbol.for("eventProcCameraMouseDown"), this.getID(), Symbol.for("mouseDown"));
    tWndObj.registerProcedure(Symbol.for("eventProcCameraMouseUp"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.registerProcedure(Symbol.for("eventProcCameraMouseEnter"), this.getID(), Symbol.for("mouseEnter"));
    tWndObj.registerProcedure(Symbol.for("eventProcCameraMouseLeave"), this.getID(), Symbol.for("mouseLeave"));
    this.pmode = Symbol.for("live");
    this.pDisplaymem = tWndObj.getElement("cam_display").getProperty(Symbol.for("buffer"));
    this.setCameraToLiveMode();
    this.setButtonHilites();
    this.updateFilm();
    tWndObj.getElement("cam_savetxt").setProperty(Symbol.for("visible"), 0);
    getConnection(getVariable("connection.room.id")).send("CARRYITEM", "20");
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("close"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("close"));
    return receiveUpdate(this.getID());
  }

  close() {
    if (connectionExists(getVariable("connection.room.id"))) {
      getConnection(getVariable("connection.room.id")).send("STOP", "CarryItem");
    }
    this.pmode = Symbol.for("closed");
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    if (windowExists(this.pDialogId)) {
      removeWindow(this.pDialogId);
    }
    removeUpdate(this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    return 1;
  }

  updateFilm() {
    if (windowExists(this.pWindowID)) {
      getWindow(this.pWindowID).getElement("photo_picnumber").setText(this.getComponent().getFilm());
    }
  }

  update() {
    if (!windowExists(this.pWindowID)) {
      return removeUpdate(this.getID());
    }
    if (this.pmode == Symbol.for("live")) {
      let tWndObj = getWindow(this.pWindowID);
      let tDispWidth = tWndObj.getElement("cam_display").getProperty(Symbol.for("width"));
      let tDispHeight = tWndObj.getElement("cam_display").getProperty(Symbol.for("height"));
      let tDispLocX = tWndObj.getElement("cam_display").getProperty(Symbol.for("locH"));
      let tDispLocY = tWndObj.getElement("cam_display").getProperty(Symbol.for("locV"));
      let tVertElem = tWndObj.getElement("cam_display_noise_vertical");
      let tLocX = tVertElem.getProperty(Symbol.for("locH"));
      let tLocY = tVertElem.getProperty(Symbol.for("locV")) + this.pNoiseDirV;
      if (tLocY >= (tDispLocY + tDispHeight - tVertElem.getProperty(Symbol.for("height")))) {
        this.pNoiseDirV = -1;
      } else {
        if (tLocY <= tDispLocY) {
          this.pNoiseDirV = 1;
        }
      }
      tVertElem.moveTo(tLocX, tLocY);
      let tHorElem = tWndObj.getElement("cam_display_noise_horizontal");
      tLocX = tHorElem.getProperty(Symbol.for("locH")) + this.pNoiseDirH;
      tLocY = tHorElem.getProperty(Symbol.for("locV"));
      if (tLocX >= (tDispLocX + tDispWidth - tHorElem.getProperty(Symbol.for("width")))) {
        this.pNoiseDirH = -1;
      } else {
        if (tLocX <= tDispLocX) {
          this.pNoiseDirH = 1;
        }
      }
      tHorElem.moveTo(tLocX, tLocY);
    }
  }

  setCameraToLiveMode() {
    let tWndObj = getWindow(this.pWindowID);
    tWndObj.getElement("cam_display_noise_horizontal").setProperty(Symbol.for("visible"), 1);
    tWndObj.getElement("cam_display_noise_horizontal").setProperty(Symbol.for("blend"), 100);
    tWndObj.getElement("cam_display_noise_vertical").setProperty(Symbol.for("visible"), 1);
    tWndObj.getElement("cam_display_noise_vertical").setProperty(Symbol.for("blend"), 100);
    tWndObj.getElement("cam_display").setProperty(Symbol.for("buffer"), this.pDisplaymem);
    tWndObj.getElement("cam_display").setProperty(Symbol.for("blend"), 100);
    tWndObj.getElement("cam_display").setProperty(Symbol.for("ink"), 33);
    tWndObj.getElement("cam_display").setProperty(Symbol.for("color"), rgb("#000000"));
    tWndObj.getElement("cam_display").setProperty(Symbol.for("bgColor"), rgb("#ffffff"));
    return 1;
  }

  eventProcCameraMouseEnter(tEvent, tSprID, tParam) {
    if (!getThread(Symbol.for("room")).getComponent().roomExists(VOID)) {
      return 0;
    }
    this.showHelpLine(tSprID);
  }

  eventProcCameraMouseLeave(tEvent, tSprID, tParam) {
    if (!getThread(Symbol.for("room")).getComponent().roomExists(VOID)) {
      return 0;
    }
    this.hideHelpLine(tSprID);
  }

  eventProcCameraMouseDown(tEvent, tSprID, tParam) {
    if (!getThread(Symbol.for("room")).getComponent().roomExists(VOID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pWindowID);
    switch (tSprID) {
      case "cam_shoot":
        if (this.pmode != Symbol.for("live")) {
          return;
        }
        getConnection(getVariable("connection.room.id")).send("USEITEM", `${"20"}${TAB}${"1500"}`);
        this.pZoomLevel = 1;
        tWndObj.getElement("cam_display").setProperty(Symbol.for("visible"), 0);
        tWndObj.getElement("cam_display_noise_horizontal").setProperty(Symbol.for("visible"), 0);
        tWndObj.getElement("cam_display_noise_vertical").setProperty(Symbol.for("visible"), 0);
        getThread(Symbol.for("room")).getComponent().getBalloon().hideBalloons();
        let tHandVis = getThread(Symbol.for("room")).getInterface().getContainer().getVisual();
        if (tHandVis != 0) {
          tHandVis.hide();
        }
        hideWindows();
        executeMessage(Symbol.for("takingPhoto"));
        tWndObj.show();
        updateStage();
        let tRect = tWndObj.getElement("cam_display").getProperty(Symbol.for("rect"));
        this.pCamShotImage = image(tRect.right - tRect.left, tRect.bottom - tRect.top, 8, Symbol.for("grayscale"));
        this.pCamShotImage.copyPixels((the.stage).image, this.pCamShotImage.rect, tRect);
        this.pCamShotImage.draw(this.pCamShotImage.rect.left, this.pCamShotImage.rect.top, this.pCamShotImage.rect.right, this.pCamShotImage.rect.bottom, propList("color", rgb(0, 0, 0), "shapeType", Symbol.for("rect")));
        this.pCamMember.image = this.pCamShotImage;
        this.pCamMember.regPoint = point(0, 0);
        getThread(Symbol.for("room")).getComponent().getBalloon().showBalloons();
        tHandVis = getThread(Symbol.for("room")).getInterface().getContainer().getVisual();
        if (tHandVis != 0) {
          tHandVis.show();
        }
        showWindows();
        executeMessage(Symbol.for("photoTaken"));
        let tDispElem = tWndObj.getElement("cam_display");
        tDispElem.setProperty(Symbol.for("buffer"), this.pCamMember);
        tDispElem.setProperty(Symbol.for("visible"), 1);
        tDispElem.setProperty(Symbol.for("blend"), 100);
        tDispElem.setProperty(Symbol.for("color"), rgb("681F10"));
        tDispElem.setProperty(Symbol.for("bgColor"), rgb("FFCC66"));
        tDispElem.setProperty(Symbol.for("ink"), 41);
        updateStage();
        this.pmode = Symbol.for("still");
        break;
      case "cam_release":
        if (this.pmode == Symbol.for("still")) {
          this.setCameraToLiveMode();
          this.pmode = Symbol.for("live");
        }
        break;
      case "cam_save":
        if ((this.pmode == Symbol.for("still")) && (this.getComponent().getFilm() > 0)) {
          tWndObj.getElement("cam_display").setProperty(Symbol.for("blend"), 50);
          tWndObj.getElement("cam_savetxt").setProperty(Symbol.for("visible"), 1);
          tWndObj.getElement("cam_display").setProperty(Symbol.for("buffer"), this.pDisplaymem);
          this.getComponent().storePicture(this.pCamMember, tWndObj.getElement("photo_text").getText());
          this.pmode = Symbol.for("save");
        } else {
          beep(1);
        }
        if ((this.pmode == Symbol.for("still")) && (this.getComponent().getFilm() == 0)) {
          executeMessage(Symbol.for("alert"), propList("Msg", "cam_save_nofilm"));
        }
        break;
      case "cam_zoom_in":
        if (this.pmode == Symbol.for("still")) {
          if (this.pZoomLevel < 11) {
            this.pZoomLevel = this.pZoomLevel + 1;
          }
          this.zoom();
        } else {
          beep(1);
        }
        break;
      case "cam_zoom_out":
        if (this.pmode == Symbol.for("still")) {
          this.pZoomLevel = this.pZoomLevel - 1;
          if (this.pZoomLevel < 1) {
            this.pZoomLevel = 1;
          }
          this.zoom();
        } else {
          beep(1);
        }
        break;
    }
    this.setButtonHilites();
  }

  eventProcCameraMouseUp(tEvent, tSprID, tParam) {
    if (!getThread(Symbol.for("room")).getComponent().roomExists(VOID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pWindowID);
    switch (tSprID) {
      case "cam_close":
        this.close();
        return 1;
    }
  }

  setButtonHilites() {
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    switch (this.pmode) {
      case Symbol.for("live"):
        this.hilite(list("cam_shoot"));
        this.unhilite(list("cam_release", "cam_save", "cam_zoom_in", "cam_zoom_out", "cam_txtscreen"));
        break;
      case Symbol.for("still"):
        if (this.getComponent().getFilm() > 0) {
          this.hilite(list("cam_save", "cam_zoom_in", "cam_zoom_out"));
        }
        this.unhilite(list("cam_shoot"));
        this.hilite(list("cam_release", "cam_txtscreen"));
        break;
      case Symbol.for("save"):
        this.unhilite(list("cam_shoot", "cam_release", "cam_save", "cam_zoom_in", "cam_zoom_out", "cam_txtscreen"));
        break;
    }
  }

  saveOk() {
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    this.pmode = Symbol.for("live");
    this.setCameraToLiveMode();
    getWindow(this.pWindowID).getElement("cam_savetxt").setProperty(Symbol.for("visible"), 0);
    this.setButtonHilites();
    this.updateFilm();
    return 1;
  }

  hilite(tElements) {
    let tWndObj = getWindow(this.pWindowID);
    for (const tID of tElements) {
      let tName = `${tID}_hi`;
      tWndObj.getElement(tID).setProperty(Symbol.for("buffer"), member(getmemnum(tName)));
    }
  }

  unhilite(tElements) {
    let tWndObj = getWindow(this.pWindowID);
    for (const tID of tElements) {
      let tName = tID;
      tWndObj.getElement(tID).getProperty(Symbol.for("buffer"), member(getmemnum(tName)));
    }
  }

  zoom() {
    let tRect = this.pCamShotImage.rect;
    let tH = this.pCamShotImage.height / this.pZoomLevel;
    let tW = this.pCamShotImage.width / this.pZoomLevel;
    tRect.top = (this.pCamShotImage.height / 2) - (tH / 2);
    tRect.bottom = tRect.top + tH;
    tRect.left = (this.pCamShotImage.width / 2) - (tW / 2);
    tRect.right = tRect.left + tW;
    this.pCamMember.image.copyPixels(this.pCamShotImage, this.pCamMember.image.rect, tRect, propList("bgColor", rgb(238, 238, 238)));
  }

  showHelpLine(tElemID) {
    let tElement = getWindow(this.pWindowID).getElement("cam_statusbar");
    let tText;
    switch (tElemID) {
      case "cam_shoot":
        tText = getText("cam_shoot.help");
        break;
      case "cam_release":
        tText = getText("cam_release.help");
        break;
      case "cam_save":
        tText = getText("cam_save.help");
        break;
      case "cam_zoom_in":
        tText = getText("cam_zoom_in.help");
        break;
      case "cam_zoom_out":
        tText = getText("cam_zoom_out.help");
        break;
      case "cam_txtscreen":
        tText = getText("cam_txtscreen.help");
        break;
      case "photo_picnumber":
        tText = getText("cam_film.help");
        break;
    }
    if (tText != VOID) {
      tElement.setText(tText);
    }
  }

  hideHelpLine() {
    getWindow(this.pWindowID).getElement("cam_statusbar").setText(EMPTY);
  }

  handItemSelect(tdata) {
    if (getThread(Symbol.for("room")).getComponent().getRoomID() != "private") {
      this.open();
    } else {
      this.pHandItemData = tdata;
      createWindow(this.pDialogId, "habbo_simple.window", 300, 300);
      let tWndObj = getWindow(this.pDialogId);
      tWndObj.merge("camera_dialog.window");
      tWndObj.registerProcedure(Symbol.for("eventProcDialogMouseUp"), this.getID(), Symbol.for("mouseUp"));
    }
  }

  eventProcDialogMouseUp(tEvent, tElemID, tParam) {
    switch (tElemID) {
      case "camera_dialog_open":
        this.open();
        removeWindow(this.pDialogId);
        break;
      case "camera_dialog_place":
        removeWindow(this.pDialogId);
        if (threadExists(Symbol.for("room"))) {
          getThread(Symbol.for("room")).getInterface().getContainer().startItemPlacing(this.pHandItemData);
        }
        break;
    }
  }
}
