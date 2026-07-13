export default class {
  pBottomBarId;

  construct() {
    pBottomBarId = "RoomBarID";
    return 1;
  }

  deconstruct() {
    return this.ancestor.deconstruct();
  }

  displayEvent(ttype) {
    const tInterface = getObject(Symbol.for("room_interface"));
    if (tInterface == 0) {
      return 0;
    }
    switch (ttype) {
      case Symbol.for("stage_starting"):
      case Symbol.for("game_ending"):
        tInterface.showRoomBar("ig_roombar.window");
        break;
      default:
        return 0;
    }
    this.createMyHeadIcon();
    this.updateSoundButton();
    const tWndObj = getWindow(pBottomBarId);
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("keyDown"));
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("mouseEnter"));
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("mouseLeave"));
    return 1;
  }

  updateSoundButton() {
    const tWndObj = getWindow(pBottomBarId);
    if (tWndObj == 0) {
      return 0;
    }
    const tstate = getSoundState();
    const tElem = tWndObj.getElement("int_sound_image");
    if (tElem != 0) {
      if (tstate) {
        const tMemNum = getmemnum("sounds_small_on_icon");
        if (tMemNum > 0) {
          tElem.feedImage(member(tMemNum).image);
        }
      } else {
        const tMemNum2 = getmemnum("sounds_small_off_icon");
        if (tMemNum2 > 0) {
          tElem.feedImage(member(tMemNum2).image);
        }
      }
    }
  }

  createMyHeadIcon() {
    if (objectExists("Figure_Preview")) {
      getObject("Figure_Preview").createHumanPartPreview(pBottomBarId, "ownhabbo_icon_image", Symbol.for("head"));
    }
  }

  eventProcRoomBar(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case "game_rules_image":
        switch (tEvent) {
          case Symbol.for("mouseUp"):
            return executeMessage(Symbol.for("ig_show_game_rules"));
          case Symbol.for("mouseEnter"):
            return executeMessage(Symbol.for("setRollOverInfo"), getText("interface_icon_game_rules"));
          case Symbol.for("mouseLeave"):
            return executeMessage(Symbol.for("setRollOverInfo"), EMPTY);
        }
        return 1;
    }
    const tRoomBarObj = getObject("RoomBarProgram");
    if (tRoomBarObj == 0) {
      return 0;
    }
    if ((tEvent == Symbol.for("keyDown")) && (tSprID == "chat_field")) {
      const tChatField = getWindow(tRoomBarObj.pBottomBarId).getElement(tSprID);
      switch (the.keyCode) {
        case 36:
        case 76:
          if (tChatField.getText() == EMPTY) {
            return 1;
          }
          if (tRoomBarObj.pFloodblocking) {
            if (the.milliSeconds < tRoomBarObj.pFloodTimer) {
              return 0;
            } else {
              tRoomBarObj.pFloodEnterCount = VOID;
            }
          }
          if (voidp(tRoomBarObj.pFloodEnterCount)) {
            tRoomBarObj.pFloodEnterCount = 0;
            tRoomBarObj.pFloodblocking = 0;
            tRoomBarObj.pFloodTimer = the.milliSeconds;
          } else {
            tRoomBarObj.pFloodEnterCount = tRoomBarObj.pFloodEnterCount + 1;
            const tFloodCountLimit = 2;
            const tFloodTimerLimit = 3000;
            const tFloodTimeout = 30000;
            if (tRoomBarObj.pFloodEnterCount > tFloodCountLimit) {
              if (the.milliSeconds < (tRoomBarObj.pFloodTimer + tFloodTimerLimit)) {
                tChatField.setText(EMPTY);
                createObject("FloodBlocking", "Flood Blocking Class");
                getObject("FloodBlocking").Init(tRoomBarObj.pBottomBarId, tSprID, tFloodTimeout);
                tRoomBarObj.pFloodblocking = 1;
                tRoomBarObj.pFloodTimer = the.milliSeconds + tFloodTimeout;
              } else {
                tRoomBarObj.pFloodEnterCount = VOID;
              }
            }
          }
          getConnection(Symbol.for("Info")).send("GAME_CHAT", [Symbol.for("string"), tChatField.getText()]);
          tChatField.setText(EMPTY);
          return 1;
        case 117:
          tChatField.setText(EMPTY);
          break;
      }
      return 0;
    }
    const tResult = tRoomBarObj.eventProcRoomBar(tEvent, tSprID, tParam);
    return 1;
  }
}
