export default class {
  pDoorbellQueue;
  pDoorbellWinID;
  pRingingUser;

  construct() {
    this.pDoorbellQueue = list();
    this.pDoorbellWinID = getText("win_doorbell", "Doorbell");
  }

  deconstruct() {
  }

  addDoorbellRinger(tName) {
    if (this.pDoorbellQueue.getPos(tName) > 0) {
      return 0;
    }
    if (!windowExists(this.pDoorbellWinID)) {
      if (!createWindow(this.pDoorbellWinID, "habbo_basic.window", 250, 200)) {
        return error(this, "Couldn't create window to show ringing doorbell!", Symbol.for("addDoorbellRinger"), Symbol.for("major"));
      }
      let tWndObj = getWindow(this.pDoorbellWinID);
      if (!tWndObj.merge("habbo_doorbell.window")) {
        tWndObj.close();
        return error(this, "Couldn't create window to show ringing doorbell!", Symbol.for("addDoorbellRinger"), Symbol.for("major"));
      }
      tWndObj.setProperty(Symbol.for("locZ"), 2000000);
      tWndObj.lock(1);
      tWndObj.registerClient(this.getID());
      tWndObj.registerProcedure(Symbol.for("eventProcDoorBell"), this.getID(), Symbol.for("mouseUp"));
    }
    this.pDoorbellQueue.append(tName);
    this.pRingingUser = this.pDoorbellQueue.count;
    this.updateDoorbellWindow();
    return 1;
  }

  removeRingingUser() {
    this.pDoorbellQueue.deleteAt(this.pRingingUser);
    this.updateDoorbellWindow();
    return 1;
  }

  removeFromList(tName) {
    let tRemoved = this.pDoorbellQueue.deleteOne(tName);
    if (tRemoved) {
      this.updateDoorbellWindow();
    }
  }

  displayNextDoorbellRinger() {
    this.pRingingUser = this.pRingingUser + 1;
    if (this.pRingingUser > this.pDoorbellQueue.count) {
      this.pRingingUser = 1;
    }
    this.updateDoorbellWindow();
    return 1;
  }

  displayPreviousDoorbellRinger() {
    this.pRingingUser = this.pRingingUser - 1;
    if (this.pRingingUser < 1) {
      this.pRingingUser = this.pDoorbellQueue.count;
    }
    this.updateDoorbellWindow();
    return 1;
  }

  updateDoorbellWindow() {
    if (this.pDoorbellQueue == list()) {
      this.hideDoorBell();
      return 1;
    }
    if (this.pRingingUser > this.pDoorbellQueue.count) {
      this.pRingingUser = this.pDoorbellQueue.count;
    }
    if (!windowExists(this.pDoorbellWinID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pDoorbellWinID);
    let tText = getText("room_doorbell", "rings the doorbell...");
    tWndObj.getElement("doorbell_name").setText(this.pDoorbellQueue[this.pRingingUser]);
    tWndObj.getElement("doorbell_text").setText(tText);
    let tCountText = "";
    if (this.pDoorbellQueue.count > 1) {
      tWndObj.getElement("doorbell_next").show();
      tWndObj.getElement("doorbell_prev").show();
      tCountText = `${this.pRingingUser}/${this.pDoorbellQueue.count}`;
    } else {
      tWndObj.getElement("doorbell_next").hide();
      tWndObj.getElement("doorbell_prev").hide();
      tCountText = EMPTY;
    }
    tWndObj.getElement("doorbell_req_num").setText(tCountText);
    return 1;
  }

  hideDoorBell() {
    this.pRingingUser = 0;
    this.pDoorbellQueue = list();
    if (!windowExists(this.pDoorbellWinID)) {
      return 0;
    }
    removeWindow(this.pDoorbellWinID);
    return 1;
  }

  eventProcDoorBell(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "doorbell_yes":
        getThread(Symbol.for("room")).getComponent().getRoomConnection().send("LETUSERIN", propList("string", this.pDoorbellQueue[this.pRingingUser], "boolean", 1));
        this.removeRingingUser();
        break;
      case "doorbell_no":
        getThread(Symbol.for("room")).getComponent().getRoomConnection().send("LETUSERIN", propList("string", this.pDoorbellQueue[this.pRingingUser], "boolean", 0));
        this.removeRingingUser();
        break;
      case "close":
        this.hideDoorBell();
        break;
      case "doorbell_next":
        this.displayNextDoorbellRinger();
        break;
      case "doorbell_prev":
        this.displayPreviousDoorbellRinger();
        break;
    }
  }
}
