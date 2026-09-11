export default class {
  pWindowID;
  pDetailsWindowID;
  pEventListObj;
  pLineHeight;
  pEventID;
  pTypeCount;
  pTypeTextKeyBody;
  pSelectedType;
  pEditedEventData;
  pView;

  construct() {
    this.pWindowID = Symbol.for("eventBrowserWindow");
    this.pDetailsWindowID = Symbol.for("eventBrowserDetailsWindow");
    this.pEventListObj = createObject(Symbol.for("temp"), "RoomEvent List Class");
    this.pTypeTextKeyBody = "roomevent_type_";
    this.pSelectedType = 0;
    this.ChangeWindowView(Symbol.for("browse"));
    registerMessage(Symbol.for("allowRoomeventCreation"), this.getID(), Symbol.for("enableCreateButton"));
    registerMessage(Symbol.for("roomEventTypeCountUpdated"), this.getID(), Symbol.for("updateDropMenu"));
    registerMessage(Symbol.for("roomEventsUpdated"), this.getID(), Symbol.for("updateEventList"));
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("Remove"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("Remove"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("Remove"));
    this.pTypeCount = getThread(Symbol.for("room")).getComponent().getRoomEventTypeCount();
    return 1;
  }

  deconstruct() {
    this.hide();
    return 1;
  }

  hide() {
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    this.removeDetailsBubble();
  }

  Remove() {
    removeObject(this.getID());
  }

  editEvent(tEventData) {
    this.pEditedEventData = tEventData;
    this.ChangeWindowView(Symbol.for("edit"));
  }

  ChangeWindowView(tView) {
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    createWindow(this.pWindowID, "habbo_basic_red.window");
    let tWnd = getWindow(this.pWindowID);
    this.pView = tView;
    switch (tView) {
      case Symbol.for("browse"):
        tWnd.merge("roomevent_browser.window");
        let tCreateButton = tWnd.getElement("roomevent.browser.create");
        tCreateButton.deactivate();
        this.askCreatePermission();
        tWnd.registerProcedure(Symbol.for("eventProcBrowse"), this.getID(), Symbol.for("mouseWithin"));
        tWnd.registerProcedure(Symbol.for("eventProcBrowse"), this.getID(), Symbol.for("mouseUp"));
        tWnd.registerProcedure(Symbol.for("eventProcBrowse"), this.getID(), Symbol.for("mouseLeave"));
        this.updateDropMenu();
        this.updateEventList();
        break;
      case Symbol.for("create"):
        tWnd.merge("roomevent_create.window");
        tWnd.registerProcedure(Symbol.for("eventProcCreate"), this.getID(), Symbol.for("mouseUp"));
        this.updateDropMenu();
        tWnd.getElement("roomevent.create.name").setText(getText("roomevent_default_name"));
        tWnd.getElement("roomevent.create.description").setText(getText("roomevent_default_desc"));
        break;
      case Symbol.for("edit"):
        tWnd.merge("roomevent_create.window");
        tWnd.registerProcedure(Symbol.for("eventProcEdit"), this.getID(), Symbol.for("mouseUp"));
        let tName = this.pEditedEventData.getaProp(Symbol.for("name"));
        let tDesc = this.pEditedEventData.getaProp(Symbol.for("desc"));
        tWnd.getElement("roomevent.create.name").setText(tName);
        tWnd.getElement("roomevent.create.description").setText(tDesc);
        tWnd.getElement("roomevent.create.create").setText(getText("roomevent_edit"));
        this.pSelectedType = this.pEditedEventData.getaProp(Symbol.for("typeID"));
        this.updateDropMenu();
        tWnd.getElement("roomevent.type").deactivate();
        break;
    }
    activateWindowObj(this.pWindowID);
  }

  askCreatePermission() {
    let tConn = getConnection(getVariable("connection.info.id", Symbol.for("Info")));
    tConn.send("CAN_CREATE_ROOMEVENT");
  }

  enableCreateButton() {
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tWnd = getWindow(this.pWindowID);
    if (!tWnd.elementExists("roomevent.browser.create")) {
      return 0;
    }
    tWnd.getElement("roomevent.browser.create").Activate();
    return 1;
  }

  updateDropMenu() {
    this.pTypeCount = getThread(Symbol.for("room")).getComponent().getRoomEventTypeCount();
    if (this.pTypeCount == 0) {
      return 0;
    }
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tWnd = getWindow(this.pWindowID);
    if (!tWnd.elementExists("roomevent.type")) {
      return 0;
    }
    let tTextList = list();
    let tTextKeys = list();
    let tStartIndex = 0;
    if (this.pView == Symbol.for("browse")) {
      tStartIndex = 0;
    } else {
      tStartIndex = 1;
    }
    for (let tIndex = tStartIndex; tIndex <= this.pTypeCount; tIndex++) {
      let tKey = `${this.pTypeTextKeyBody}${tIndex}`;
      tTextKeys.add(tKey);
      tTextList.add(getText(tKey));
    }
    tWnd.getElement("roomevent.type").updateData(tTextList, tTextKeys, this.pSelectedType);
    return 1;
  }

  updateEventList() {
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tWnd = getWindow(this.pWindowID);
    if (!tWnd.elementExists("roomevent.browser.list")) {
      return 0;
    }
    if (!tWnd.elementExists("roomevent.type")) {
      return 0;
    }
    let tEventList = getThread(Symbol.for("room")).getComponent().getRoomEventList(this.pSelectedType);
    this.pEventListObj.setEvents(tEventList);
    let tListImage = this.pEventListObj.renderListImage();
    let tListElem = tWnd.getElement("roomevent.browser.list");
    tListElem.feedImage(tListImage);
  }

  updateDetailsBubble(tpoint) {
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tEventData = this.pEventListObj.getEventAt(tpoint);
    if (!tEventData) {
      this.removeDetailsBubble();
      return 1;
    }
    let tEventID = tEventData.getaProp(Symbol.for("flatId"));
    if (tEventID == this.pEventID) {
      return 1;
    }
    this.pEventID = tEventID;
    let tEventRect = tEventData.getaProp(Symbol.for("rect"));
    let tWnd = getWindow(this.pWindowID);
    let tListElem = tWnd.getElement("roomevent.browser.list");
    let tListRect = tListElem.getProperty(Symbol.for("rect"));
    let tScrollElem = tWnd.getElement("roomevent.browser.scroll");
    let tScrollOffset = tScrollElem.getScrollOffset();
    let tLocY = tListRect[2] - tScrollOffset;
    let tLocX = tListRect[1];
    let tTargetRect = tEventRect + rect(tLocX, tLocY, tLocX, tLocY);
    if (objectExists(this.pDetailsWindowID)) {
      removeObject(this.pDetailsWindowID);
    }
    let tDetailsBubble = createObject(this.pDetailsWindowID, "Details Bubble Class");
    tDetailsBubble.createWithContent("roomevent_info.window", tTargetRect, Symbol.for("right"));
    let tDetailsWindow = tDetailsBubble.getWindowObj();
    let tHost = `${getText("roomevent_host")} ${tEventData.getaProp(Symbol.for("hostName"))}`;
    tDetailsWindow.getElement("roomevent.info.host").setText(tHost);
    let tText = `${QUOTE}${tEventData.getaProp(Symbol.for("desc"))}${QUOTE}`;
    tDetailsWindow.getElement("roomevent.info.desc").setText(tText);
    let tstart = `${getText("roomevent_starttime")} ${tEventData.getaProp(Symbol.for("time"))}`;
    tDetailsWindow.getElement("roomevent.info.time").setText(tstart);
  }

  removeDetailsBubble() {
    if (objectExists(this.pDetailsWindowID)) {
      removeObject(this.pDetailsWindowID);
    }
    this.pEventID = VOID;
  }

  selectEvent(tpoint) {
    let tEventData = this.pEventListObj.getEventAt(tpoint);
    if (!tEventData) {
      return 0;
    }
    let tFlatID = tEventData.getaProp(Symbol.for("flatId"));
    executeMessage(Symbol.for("roomForward"), tFlatID, Symbol.for("private"));
  }

  createEvent(tOperation) {
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    let tWnd = getWindow(this.pWindowID);
    if (!tWnd.elementExists("roomevent.type")) {
      return 0;
    }
    let ttype = tWnd.getElement("roomevent.type").getSelection(Symbol.for("key"));
    let tChunks = explode(ttype, "_");
    let tTypeID = value(tChunks[tChunks.count]);
    let tName = tWnd.getElement("roomevent.create.name").getText();
    let tDesc = tWnd.getElement("roomevent.create.description").getText();
    let tValid = 1;
    if ((tName == getText("roomevent_default_name")) || (tDesc == getText("roomevent_default_desc"))) {
      tValid = 0;
    }
    let tMinLength = 3;
    if ((tName.length < tMinLength) || (tDesc.length < tMinLength)) {
      tValid = 0;
    }
    if (!tValid) {
      executeMessage(Symbol.for("alert"), "roomevent_invalid_input");
      return 0;
    }
    let tEvent = propList("integer", tTypeID, "string", tName, "string", tDesc);
    let tConn = getConnection(getVariable("connection.info.id", Symbol.for("Info")));
    if (tOperation == Symbol.for("edit")) {
      tConn.send("EDIT_ROOMEVENT", tEvent);
    } else {
      tConn.send("CREATE_ROOMEVENT", tEvent);
    }
    return 1;
  }

  eventProcBrowse(tEvent, tElemID, tParam) {
    if (tElemID == "roomevent.browser.list") {
      switch (tEvent) {
        case Symbol.for("mouseWithin"):
          if (tParam.ilk != Symbol.for("point")) {
            return 0;
          }
          this.updateDetailsBubble(tParam);
          break;
        case Symbol.for("mouseLeave"):
          this.removeDetailsBubble();
          break;
        case Symbol.for("mouseUp"):
          this.selectEvent(tParam);
          break;
      }
    }
    if (tEvent != Symbol.for("mouseUp")) {
      return 1;
    }
    switch (tElemID) {
      case "roomevent.browser.create":
        this.ChangeWindowView(Symbol.for("create"));
        break;
      case "roomevent.close":
        this.Remove();
        break;
      case "roomevent.type":
        let tChunks = explode(tParam, "_");
        this.pSelectedType = value(tChunks[tChunks.count]);
        this.updateEventList();
        break;
    }
  }

  eventProcCreate(tEvent, tElemID, tParam) {
    switch (tElemID) {
      case "roomevent.create.create":
        if (this.createEvent()) {
          this.Remove();
        }
        break;
      case "roomevent.cancel.icon":
      case "roomevent.cancel.text":
        this.ChangeWindowView(Symbol.for("browse"));
        break;
      case "roomevent.close":
        this.Remove();
        break;
      case "roomevent.create.name":
        let tWnd = getWindow(this.pWindowID);
        let tElem = tWnd.getElement(tElemID);
        if (tElem.getText() == getText("roomevent_default_name")) {
          tElem.setText(EMPTY);
        }
        break;
      case "roomevent.create.description":
        let tWnd2 = getWindow(this.pWindowID);
        let tElem2 = tWnd2.getElement(tElemID);
        if (tElem2.getText() == getText("roomevent_default_desc")) {
          tElem2.setText(EMPTY);
        }
        break;
    }
  }

  eventProcEdit(tEvent, tElemID, tParam) {
    switch (tElemID) {
      case "roomevent.create.create":
        this.createEvent(Symbol.for("edit"));
        this.Remove();
        break;
      case "roomevent.cancel.icon":
      case "roomevent.cancel.text":
      case "roomevent.close":
        this.Remove();
        break;
    }
  }
}
