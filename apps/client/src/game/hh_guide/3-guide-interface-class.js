export default class {
  pIcon;
  pWindowID;
  pGuideToolAnimTimeoutID;
  pAnimFrame;
  pUseAlertSound;

  construct() {
    this.pIcon = createObject("guide_tool_icon_object", "Guide Tool Icon Class");
    this.pUseAlertSound = 1;
    this.pWindowID = "guide_tool_window_id";
    this.pGuideToolAnimTimeoutID = "guide_tool_anim_update_timeout_id";
    registerMessage(Symbol.for("toggleGuideTool"), this.getID(), Symbol.for("toggleGuideTool"));
    registerMessage(Symbol.for("gamesystem_constructed"), this.getID(), Symbol.for("hideAll"));
    registerMessage(Symbol.for("gamesystem_deconstructed"), this.getID(), Symbol.for("update"));
    return 1;
  }

  deconstruct() {
    removeObject(this.pIcon.getID());
    unregisterMessage(Symbol.for("toggleGuideTool"), this.getID());
    unregisterMessage(Symbol.for("gamesystem_constructed"), this.getID());
    unregisterMessage(Symbol.for("gamesystem_deconstructed"), this.getID());
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    return 1;
  }

  hideAll() {
    this.hideGuideToolIcon();
    this.closeGuideTool();
  }

  showGuideToolIcon() {
    if (objectp(this.pIcon)) {
      this.pIcon.show();
    }
  }

  hideGuideToolIcon() {
    if (objectp(this.pIcon)) {
      this.pIcon.hide();
    }
  }

  toggleGuideTool() {
    if (!windowExists(this.pWindowID)) {
      return this.openGuideTool();
    }
    let tWndObj = getWindow(this.pWindowID);
    if (tWndObj.getProperty(Symbol.for("visible"))) {
      this.closeGuideTool();
    } else {
      this.openGuideTool();
    }
  }

  openGuideTool() {
    if (windowExists(this.pWindowID)) {
      let tWindow = getWindow(this.pWindowID);
      tWindow.show();
    } else {
      let tstate = this.getComponent().getState();
      this.createGuideToolWindow(tstate);
    }
    return 1;
  }

  createGuideToolWindow(tstate) {
    let tUseDefaultLoc = 1;
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
      tUseDefaultLoc = 0;
    }
    let tLayout;
    switch (tstate) {
      case Symbol.for("disabled"):
        return 0;
      case Symbol.for("enabled"):
        tLayout = "guide_tool_start.window";
        break;
      case Symbol.for("waiting"):
        tLayout = "guide_tool_waiting.window";
        break;
      case Symbol.for("ready"):
        tLayout = "guide_tool_invite.window";
        break;
    }
    createWindow(this.pWindowID, tLayout);
    let tWndObj = getWindow(this.pWindowID);
    tWndObj.registerProcedure(Symbol.for("eventProcGuideTool"), this.getID(), Symbol.for("mouseUp"));
    if (tUseDefaultLoc) {
      let tloc = value(getVariable("guidetool.window.loc"));
      tWndObj.moveTo(tloc[1], tloc[2]);
    }
    if (timeoutExists(this.pGuideToolAnimTimeoutID)) {
      removeTimeout(this.pGuideToolAnimTimeoutID);
    }
    switch (tstate) {
      case Symbol.for("waiting"):
        createTimeout(this.pGuideToolAnimTimeoutID, 250, Symbol.for("updateGuideToolAnim"), this.getID(), VOID, 0);
        break;
      case Symbol.for("ready"):
        if (this.pUseAlertSound) {
          let tSoundMemName = getVariable("guidetool.alert.sound");
          playSound(tSoundMemName, Symbol.for("cut"), propList("loopCount", 1, "infiniteloop", 0, "volume", 255));
        }
        let tInvitationData = this.getComponent().getInvitation();
        if (tWndObj.elementExists("guide_tool_header")) {
          let tName = tInvitationData.getaProp(Symbol.for("name"));
          let tElem = tWndObj.getElement("guide_tool_header");
          tElem.setText(tName);
        }
        break;
    }
    this.updateCheckbox();
  }

  updateCheckbox() {
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pWindowID);
    if (!tWndObj.elementExists("guide_tool_checkbox")) {
      return 0;
    }
    if (!(memberExists("button.checkbox.on") && memberExists("button.checkbox.off"))) {
      return 0;
    }
    let tImageOn = member(getmemnum("button.checkbox.on")).image;
    let tImageOff = member(getmemnum("button.checkbox.off")).image;
    let tElem = tWndObj.getElement("guide_tool_checkbox");
    if (this.pUseAlertSound) {
      tElem.feedImage(tImageOn);
    } else {
      tElem.feedImage(tImageOff);
    }
  }

  updateGuideToolAnim() {
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pWindowID);
    if (!tWndObj.elementExists("guide_tool_progress_bar")) {
      return 0;
    }
    let tElem = tWndObj.getElement("guide_tool_progress_bar");
    this.pAnimFrame = this.pAnimFrame + 1;
    if (this.pAnimFrame > 3) {
      this.pAnimFrame = 1;
    }
    let tMemName = `nuh_search_${this.pAnimFrame}`;
    if (memberExists(tMemName)) {
      tElem.setProperty(Symbol.for("image"), member(getmemnum(tMemName)).image);
    }
  }

  closeGuideTool() {
    if (windowExists(this.pWindowID)) {
      let tWndObj = getWindow(this.pWindowID);
      tWndObj.hide();
    }
  }

  update() {
    let tstate = this.getComponent().getState();
    this.updateIcon(tstate);
    this.updateToolWindow(tstate);
  }

  isMinimized() {
    if (!windowExists(this.pWindowID)) {
      return 1;
    }
    let tWndObj = getWindow(this.pWindowID);
    return !tWndObj.getProperty(Symbol.for("visible"));
  }

  updateIcon(tstate) {
    if (tstate == Symbol.for("disabled")) {
      this.pIcon.hide();
    } else {
      this.pIcon.show();
    }
    if (tstate == Symbol.for("ready")) {
      this.pIcon.setFlashing(1);
    } else {
      this.pIcon.setFlashing(0);
    }
  }

  updateToolWindow(tstate) {
    let tIsMinimized = this.isMinimized();
    this.createGuideToolWindow(tstate);
    if (tIsMinimized && windowExists(this.pWindowID)) {
      let tWndObj = getWindow(this.pWindowID);
      tWndObj.hide();
    }
  }

  eventProcGuideTool(tEvent, tSprID, tProp) {
    switch (tSprID) {
      case "guide_tool_start":
        this.getComponent().startWaiting();
        break;
      case "guide_tool_close":
        this.closeGuideTool();
        break;
      case "guide_tool_cancel":
        this.getComponent().cancelWaiting();
        this.closeGuideTool();
        break;
      case "guide_tool_accept":
        this.getComponent().acceptInvitation();
        this.closeGuideTool();
        break;
      case "guide_tool_reject":
        this.getComponent().rejectInvitation();
        this.closeGuideTool();
        break;
      case "guide_tool_checkbox":
      case "guide_tool_checkbox_text":
        this.pUseAlertSound = !this.pUseAlertSound;
        this.updateCheckbox();
        break;
    }
  }
}
