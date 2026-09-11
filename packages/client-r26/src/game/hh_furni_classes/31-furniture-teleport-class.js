export default class {
  pDoorOpentimer;
  pProcessActive;
  pAnimActive;
  pAnimTime;
  pKickTime;
  pTargetData;
  pCloseDoorTimer;

  prepare(tdata) {
    if (this.pProcessActive) {
      this.delay(50, Symbol.for("doorLogin"));
    } else {
      this.pTargetData = propList();
    }
    this.pProcessActive = 0;
    this.pAnimActive = 0;
    this.pAnimTime = 10;
    this.pKickTime = 0;
    this.pDoorOpentimer = 0;
    this.pCloseDoorTimer = 0;
    if (tdata.count > 0) {
      this.updateStuffdata(tdata[Symbol.for("stuffdata")]);
    } else {
      this.updateStuffdata(EMPTY);
    }
    if (getObject(Symbol.for("session")).exists("target_door_ID")) {
      if (getObject(Symbol.for("session")).GET("target_door_ID") == this.getID()) {
        getObject(Symbol.for("session")).set("target_door_ID", 0);
        this.animate(12);
        this.delay(800, Symbol.for("kickOut"));
      }
    }
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "TRUE") {
      tValue = 2;
      this.pDoorOpentimer = 18;
    } else {
      if (tValue == "FALSE") {
        tValue = 1;
        this.pDoorOpentimer = 0;
      }
    }
    this.setState(tValue);
  }

  select() {
    if (the.doubleClick) {
      const tRoom = getThread(Symbol.for("room")).getComponent();
      const tUserObj = tRoom.getOwnUser();
      if (tUserObj == 0) {
        return 1;
      }
      if ((this.pLocX == tUserObj.pLocX) && (this.pLocY == tUserObj.pLocY)) {
        return this.tryDoor();
      }
      let tUserIsClose = 0;
      const tCloseList = propList("0", list(0, 1), "2", list(-1, 0), "4", list(0, -1), "6", list(1, 0));
      const tDelta = tCloseList[string(this.pDirection[1])];
      if (!voidp(tDelta)) {
        if (((this.pLocX - tUserObj.pLocX) == tDelta[1]) && ((this.pLocY - tUserObj.pLocY) == tDelta[2])) {
          tUserIsClose = 1;
        } else {
          return tRoom.getRoomConnection().send("MOVE", propList("short", this.pLocX - tDelta[1], "short", this.pLocY - tDelta[2]));
        }
      }
      if (tUserIsClose) {
        tRoom.getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "TRUE"));
        tRoom.getRoomConnection().send("INTODOOR", this.getID());
        this.tryDoor();
      }
    }
    return 1;
  }

  tryDoor() {
    if (getObject(Symbol.for("session")).exists("target_door_ID")) {
      const tTargetDoorID = getObject(Symbol.for("session")).GET("target_door_ID");
      if (tTargetDoorID != 0) {
        return 1;
      }
    }
    getObject(Symbol.for("session")).set("current_door_ID", this.getID());
    if (connectionExists(getVariable("connection.info.id"))) {
      getConnection(getVariable("connection.info.id")).send("GETDOORFLAT", this.getID());
    }
    return 1;
  }

  startTeleport(tDataList) {
    this.pTargetData = tDataList;
    this.pProcessActive = 1;
    this.animate(50);
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("DOORGOIN", this.getID());
  }

  doorLogin() {
    this.pProcessActive = 0;
    getObject(Symbol.for("session")).set("target_door_ID", this.pTargetData[Symbol.for("teleport")]);
    return getThread(Symbol.for("room")).getComponent().enterDoor(this.pTargetData);
  }

  prepareToKick(tIncomer) {
    if (tIncomer == getObject(Symbol.for("session")).GET("user_name")) {
      this.pKickTime = 20;
    }
  }

  kickOut() {
    const tRoom = getThread(Symbol.for("room")).getComponent();
    tRoom.getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "TRUE"));
    const tCloseList = propList("0", list(0, -1), "2", list(1, 0), "4", list(0, 1), "6", list(-1, 0));
    const tDelta = tCloseList[string(this.pDirection[1])];
    if (!voidp(tDelta)) {
      tRoom.getRoomConnection().send("MOVE", propList("short", this.pLocX + tDelta[1], "short", this.pLocY + tDelta[2]));
    }
  }

  animate(tTime) {
    if (voidp(tTime)) {
      tTime = 25;
    }
    this.pAnimTime = tTime;
    this.pAnimActive = 1;
  }

  update() {
    callAncestor(Symbol.for("update"), [this]);
    if (this.pDoorOpentimer > 0) {
      this.pDoorOpentimer = this.pDoorOpentimer - 1;
      if (this.pDoorOpentimer == 0) {
        getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", "FALSE"));
      }
    }
    if (this.pAnimActive > 0) {
      this.pAnimActive = (this.pAnimActive + 1) % this.pAnimTime;
      if (this.pState == 1) {
        this.setState(3);
      }
    }
    if (this.pAnimActive == (this.pAnimTime - 1)) {
      this.pAnimActive = 0;
      this.pCloseDoorTimer = 20;
      if (this.pProcessActive) {
        return this.doorLogin();
      }
    }
    if (this.pKickTime > 0) {
      this.pKickTime = this.pKickTime - 1;
      if (this.pKickTime == 0) {
        this.kickOut();
      }
    }
    if (this.pCloseDoorTimer > 0) {
      this.pCloseDoorTimer = this.pCloseDoorTimer - 1;
      if (this.pCloseDoorTimer == 0) {
        this.setState(1);
      }
    }
  }
}
