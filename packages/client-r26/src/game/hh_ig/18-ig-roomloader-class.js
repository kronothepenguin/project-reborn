export default class {
  construct() {
    return 1;
  }

  deconstruct() {
    return this.ancestor.deconstruct();
  }

  constructArena(tdata, tMsg) {
    const tConn = tMsg.connection;
    const tMainThread = this.getMainThread();
    if (tMainThread == 0) {
      return 0;
    }
    const tRoomThread = getThread(Symbol.for("room"));
    if (tRoomThread == 0) {
      return 0;
    }
    const tRoomComponent = tRoomThread.getComponent();
    executeMessage(Symbol.for("hide_navigator"), Symbol.for("Remove"));
    const tMarker = tdata.getaProp(Symbol.for("room_marker"));
    tRoomComponent.pRoomId = Symbol.for("game");
    const tSaveData = propList();
    tSaveData.setaProp(Symbol.for("type"), Symbol.for("game"));
    tSaveData.setaProp(Symbol.for("id"), tMarker);
    tSaveData.setaProp(Symbol.for("marker"), tMarker);
    tRoomComponent.pSaveData = tSaveData;
    getObject(Symbol.for("session")).set("lastroom", tSaveData.duplicate());
    this.roomConnected(tdata.getaProp(Symbol.for("room_program_class")), tMarker);
    executeMessage(Symbol.for("gamesystem_sendevent"), Symbol.for("msgstruct_gamereset"), tMsg);
    this.updateProcess();
    return 1;
  }

  exitArena() {
    const tRoomThread = getThread(Symbol.for("room"));
    if (tRoomThread == 0) {
      return 0;
    }
    const tComponent = tRoomThread.getComponent();
    tComponent.roomDisconnected();
    return 1;
  }

  roomConnected(tClass, tMarker, tstate) {
    const tRoomThread = getThread(Symbol.for("room"));
    if (tRoomThread == 0) {
      return 0;
    }
    const tComponent = tRoomThread.getComponent();
    if (voidp(tMarker)) {
      error(this, "Missing room marker!!!", Symbol.for("roomConnected"), Symbol.for("major"));
    }
    tComponent.pSaveData[Symbol.for("marker")] = tMarker;
    tComponent.leaveRoom(1);
    if (!tComponent.getInterface().showRoom(tMarker)) {
      error(this, `Cannot showRoom: ${tMarker}`, Symbol.for("roomConnected"));
      return executeMessage(Symbol.for("leaveRoom"));
    }
    if (memberExists(tClass)) {
      createObject(tComponent.pRoomPrgID, tClass);
    }
    const tShadowManager = tComponent.getShadowManager();
    tShadowManager.define("roomShadow");
    return 1;
  }

  updateProcess(tKey, tValue) {
    const tRoomThread = getThread(Symbol.for("room"));
    if (tRoomThread == 0) {
      return 0;
    }
    const tComponent = tRoomThread.getComponent();
    tComponent.getInterface().hideLoaderBar();
    tComponent.getInterface().hideTrashCover();
    tComponent.pActiveFlag = 1;
    tComponent.pChatProps[Symbol.for("mode")] = "CHAT";
    setcursor(Symbol.for("arrow"));
    call(Symbol.for("prepare"), list(tComponent.getRoomPrg()));
    executeMessage(Symbol.for("roomReady"));
    return receivePrepare(tComponent.getID());
  }
}
