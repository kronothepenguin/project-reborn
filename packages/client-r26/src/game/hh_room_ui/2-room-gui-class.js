export default class {
  pRoomBarID;
  pRoomInfoID;
  pObjectDispID;

  construct() {
    this.pRoomBarID = "RoomBarProgram";
    this.pRoomInfoID = "RoomInfoProgram";
    this.pObjectDispID = "ObjectDisplayerProgram";
    createObject(this.pRoomInfoID, "Room Info Class");
    createObject(this.pRoomBarID, "Room Bar Class");
    createObject(this.pObjectDispID, "Room Object Displayer Class");
    return 1;
  }

  deconstruct() {
    return 1;
  }

  showRoomBar(tLayout) {
    let tRoomInfoObj = getObject(this.pRoomInfoID);
    if (!voidp(tRoomInfoObj) && (tRoomInfoObj != 0)) {
      tRoomInfoObj.showRoomInfo();
    }
    let tRoomBarObj = getObject(this.pRoomBarID);
    if (!voidp(tRoomBarObj) && (tRoomBarObj != 0)) {
      tRoomBarObj.showRoomBar(tLayout);
    }
    if (threadExists("new_user_help")) {
      let tComponent = getThread("new_user_help").getComponent();
      if (tComponent.isChatHelpOn()) {
        tRoomBarObj.applyChatHelpText();
      }
    }
  }

  hideRoomBar() {
    let tRoomInfoObj = getObject(this.pRoomInfoID);
    if (!voidp(tRoomInfoObj) && (tRoomInfoObj != 0)) {
      tRoomInfoObj.hideRoomInfo();
    }
    let tRoomBarObj = getObject(this.pRoomBarID);
    if (!voidp(tRoomBarObj) && (tRoomBarObj != 0)) {
      tRoomBarObj.hideRoomBar();
    }
  }

  setRollOverInfo(tInfoText) {
    let tRoomBarObj = getObject(this.pRoomBarID);
    if (!voidp(tRoomBarObj) && (tRoomBarObj != 0)) {
      tRoomBarObj.setRollOverInfo(tInfoText);
    }
  }

  showInfostand() {
  }

  hideInfoStand() {
    let tObjDisp = getObject(this.pObjectDispID);
    tObjDisp.clearWindowDisplayList();
  }

  showObjectInfo(tObjType) {
    let tObjDisp = getObject(this.pObjectDispID);
    tObjDisp.showObjectInfo(tObjType);
  }

  showVote() {
    let tRoomBarObj = getObject(this.pRoomBarID);
    if (!voidp(tRoomBarObj) && (tRoomBarObj != 0)) {
      tRoomBarObj.showVote();
    }
  }
}
