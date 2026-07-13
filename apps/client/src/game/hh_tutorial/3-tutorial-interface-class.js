export default class {
  pWriterPlain;
  pTutorialConfig;
  pTopicList;
  pView;
  pMenuID;
  pBubbles;
  pTutor;
  pExitMenuWindow;
  pFrameCount;

  construct() {
    this.pMenuID = Symbol.for("tutorial_menu");
    this.pWriterPlain = "tutorial_writer_plain";
    this.pFrameCount = 0;
    this.pTutor = createObject(getUniqueID(), "Tutor Character Class");
    this.pBubbles = list();
    this.createExitMenu();
    return 1;
  }

  deconstruct() {
    return 1;
  }

  createExitMenu() {
    tID = "Tutorial_buttons";
    createWindow(tID, "habbo_simple.window");
    this.pExitMenuWindow = getWindow(tID);
    this.pExitMenuWindow.merge("tutorial_exit_menu_bg.window");
    this.pExitMenuWindow.merge("tutorial_exit_menu.window");
    this.pExitMenuWindow.hide();
    this.pExitMenuWindow.moveTo(3, 3);
    this.pExitMenuWindow.registerProcedure(Symbol.for("eventHandlerTutorialExitMenu"), this.getID(), Symbol.for("mouseUp"));
  }

  setBubbles(tBubbleList) {
    for (let i = pBubbles.count; i >= 1; i--) {
      removeObject(pBubbles[i].getID());
    }
    this.pBubbles = list();
    if (voidp(tBubbleList)) {
      return 1;
    }
    for (let i = 1; i <= tBubbleList.count; i++) {
      tBubble = createObject(getUniqueID(), "Bubble Class");
      tBubble.setProperty(tBubbleList[i]);
      this.pBubbles.add(tBubble);
    }
  }

  setTutor(tTutorList) {
    this.pTutor.setProperties(tTutorList);
  }

  hide() {
    this.pTutor.hide();
    for (const tBubble of this.pBubbles) {
      tBubble.hide();
    }
    this.pExitMenuWindow.hide();
    removePrepare(this.getID());
  }

  show() {
    receivePrepare(this.getID());
    this.pTutor.show();
    for (const tBubble of this.pBubbles) {
      tBubble.show();
    }
    this.pExitMenuWindow.show();
  }

  prepare() {
    tWindowIdList = this.pTutor.update();
    tWindowIdList.add(this.pExitMenuWindow.getProperty(Symbol.for("id")));
    tWindowList = this.updateBubbles();
    for (const tID of tWindowIdList) {
      tPos = tWindowList.getPos(tID);
      if (tPos > 0) {
        tWindowList.deleteAt(tPos);
      }
      tWindowList.add(tID);
    }
    getWindowManager().reorder(tWindowList);
    return 1;
  }

  updateBubbles() {
    if (voidp(this.pBubbles)) {
      return 1;
    }
    tWindowList = getWindowIDList();
    tAttachedWindows = propList();
    for (const tBubble of this.pBubbles) {
      tBubble.update();
      tBubbleWindowID = tBubble.getProperty(Symbol.for("windowID"));
      tPos = tWindowList.getPos(tBubbleWindowID);
      if (tPos == 0) {
        continue;
      }
      tTargetWindowID = tBubble.getProperty(Symbol.for("targetWindowID"));
      if (voidp(tTargetWindowID)) {
        getWindow(tBubbleWindowID).hide();
        continue;
      } else {
        tWindowList.deleteAt(tPos);
      }
      if (voidp(tAttachedWindows.getaProp(tTargetWindowID))) {
        tAttachedWindows.setaProp(tTargetWindowID, list(tBubbleWindowID));
        continue;
      }
      tAttachedWindows[tTargetWindowID].add(tBubbleWindowID);
    }
    tPosRoombar = tWindowList.getPos("RoomBarID");
    tPosRoomInterface = tWindowList.getPos("Room_interface");
    if (tPosRoombar > 0 && tPosRoomInterface > 0 && tPosRoomInterface > tPosRoombar) {
      tWindowList.deleteAt(tPosRoomInterface);
      tWindowList.addAt(tPosRoombar, "Room_interface");
    }
    tOrderList = list();
    for (const tID of tWindowList) {
      tOrderList.add(tID);
      if (!voidp(tAttachedWindows.getaProp(tID))) {
        for (const tAttached of tAttachedWindows[tID]) {
          tOrderList.add(tAttached);
        }
      }
    }
    return tOrderList;
  }

  showMenu(tstate) {
    this.setBubbles(VOID);
    switch (tstate) {
      case Symbol.for("welcome"):
        tTextKey = `tutorial_welcome_${this.pTutor.getProperty(Symbol.for("sex"))}`;
        tPose = 2;
        break;
      case Symbol.for("offtopic"):
        tTextKey = "tutorial_offtopic";
        tPose = 3;
        break;
      default:
        tTextKey = `tutorial_topic_list_${this.pTutor.getProperty(Symbol.for("sex"))}`;
        tPose = 1;
        break;
    }
    tTutor = propList();
    tTutor.setaProp(Symbol.for("offsetx"), VOID);
    tTutor.setaProp(Symbol.for("offsety"), VOID);
    tTutor.setaProp(Symbol.for("textKey"), tTextKey);
    tTutor.setaProp(Symbol.for("pose"), tPose);
    tTutor.setaProp(Symbol.for("links"), this.getComponent().getProperty(Symbol.for("topics")));
    tTutor.setaProp(Symbol.for("statuses"), this.getComponent().getProperty(Symbol.for("statuses")));
    this.setTutor(tTutor);
  }

  setUserSex(tUserSex) {
    switch (tUserSex) {
      case "M":
        tTutorSex = "F";
        break;
      case "F":
        tTutorSex = "M";
        break;
    }
    this.pTutor.setProperty(Symbol.for("sex"), tTutorSex);
  }

  eventHandlerTutorialExitMenu(tEvent, tSpriteID, tParam) {
    switch (tSpriteID) {
      case "tutorial_button_quit":
        this.getComponent().tryExit();
        break;
      case "tutorial_button_menu":
        this.getComponent().showMenu();
        break;
    }
  }
}
