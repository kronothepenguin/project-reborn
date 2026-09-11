export default class {
  select() {
    if (!threadExists(Symbol.for("room"))) {
      return error(this, "Room thread not found!!!", Symbol.for("select"), Symbol.for("major"));
    }
    if (!threadExists(Symbol.for("roomkiosk"))) {
      if (FindCastNumber("habbo_kiosk_room") > 0) {
        initThread(FindCastNumber("habbo_kiosk_room"));
      } else {
        return error(this, "Room kiosk cast not found!!!", Symbol.for("select"), Symbol.for("major"));
      }
    }
    tUserObj = getThread(Symbol.for("room")).getComponent().getOwnUser();
    if (!tUserObj) {
      return error(this, `${"User object not found:"} ${getObject(Symbol.for("session")).GET("user_name")}`, Symbol.for("select"), Symbol.for("major"));
    }
    switch (this.pDirection[1]) {
      case 4:
        if ((this.pLocX == tUserObj.pLocX) && ((this.pLocY - tUserObj.pLocY) == -1)) {
          this.useRoomKiosk();
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList(Symbol.for("short"), this.pLocX, Symbol.for("short"), this.pLocY + 1));
        }
        break;
      case 0:
        if ((this.pLocX == tUserObj.pLocX) && ((this.pLocY - tUserObj.pLocY) == 1)) {
          this.useRoomKiosk();
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList(Symbol.for("short"), this.pLocX, Symbol.for("short"), this.pLocY - 1));
        }
        break;
      case 2:
        if ((this.pLocY == tUserObj.pLocY) && ((this.pLocX - tUserObj.pLocX) == -1)) {
          this.useRoomKiosk();
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList(Symbol.for("short"), this.pLocX + 1, Symbol.for("short"), this.pLocY));
        }
        break;
      case 6:
        if ((this.pLocY == tUserObj.pLocY) && ((this.pLocX - tUserObj.pLocX) == 1)) {
          this.useRoomKiosk();
        } else {
          getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList(Symbol.for("short"), this.pLocX - 1, Symbol.for("short"), this.pLocY));
        }
        break;
    }
    return 1;
  }

  useRoomKiosk() {
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("LOOKTO", `${this.pLocX} ${this.pLocY}`);
    executeMessage(Symbol.for("open_roomkiosk"));
  }
}
