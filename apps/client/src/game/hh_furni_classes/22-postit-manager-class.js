export default class {
  pActivePostItId;
  pText;
  pcolor;
  pWindowID;
  pLocX;
  pLocY;
  pIsController;
  pChanged;
  pIsOwner;
  pCanRemoveStickies;

  construct() {
    this.pWindowID = Symbol.for("postit_window");
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("close"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("close"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    return 1;
  }

  open(tID, tColor, tLocX, tLocY) {
    this.pcolor = tColor;
    this.pLocX = tLocX;
    this.pLocY = tLocY;
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    registerMessage(symbol(`itemdata_received${tID}`), Symbol.for("postit_manager"), Symbol.for("setItemData"));
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("G_IDATA", tID);
    this.pIsController = getObject(Symbol.for("session")).GET("room_controller");
    if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_any_room_controller")) {
      this.pIsController = 1;
    }
    this.pIsOwner = getObject(Symbol.for("session")).GET("room_owner");
    this.pCanRemoveStickies = getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_remove_stickies");
  }

  close() {
    if (this.pActivePostItId > 0) {
      const tColorHex = this.pcolor.hexString();
      const tWindow = getWindow(this.pWindowID);
      if (tWindow == 0) {
        return 0;
      }
      let tStickieText = tWindow.getElement("stickies_text_field").getText();
      tStickieText = convertSpecialChars(tStickieText, 1);
      const tdata = `${tColorHex.char[`2..${length(tColorHex)}`]} ${tStickieText}`;
      if (this.pChanged == 1) {
        getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETITEMDATA", `${this.pActivePostItId}/${tdata}`);
      }
    }
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
  }

  delete() {
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    getThread(Symbol.for("room")).getComponent().getRoomConnection().send("REMOVEITEM", this.pActivePostItId);
  }

  setItemData(tMsg) {
    const tID = tMsg[Symbol.for("id")];
    let ttype = tMsg[Symbol.for("type")];
    const tText = tMsg[Symbol.for("text")].word[`2..${tMsg[Symbol.for("text")].word.count}`];
    unregisterMessage(symbol(`itemdata_received${tID}`), Symbol.for("postit_manager"));
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    this.pActivePostItId = tID;
    this.pText = tText;
    const tObject = getThread(Symbol.for("room")).getComponent().getItemObject(string(this.pActivePostItId));
    if (tObject == 0) {
      return error(this, `Couldn't find stickie: ${this.pActivePostItId}`, Symbol.for("setItemData"), Symbol.for("major"));
    }
    let tWndType;
    if (tObject.getClass() == "post.it.vd") {
      tWndType = "habbo_stickie_vd.window";
      ttype = "FFFFFF";
    } else {
      tWndType = "habbo_stickies.window";
    }
    createWindow(this.pWindowID, tWndType);
    const tWindow = getWindow(this.pWindowID);
    if (!tWindow) {
      return 0;
    }
    if (this.pLocX > ((the.stage).image.width - tWindow.getProperty(Symbol.for("width")))) {
      this.pLocX = (the.stage).image.width - tWindow.getProperty(Symbol.for("width"));
    }
    if (this.pLocY < 100) {
      this.pLocY = 100;
    }
    this.setColor(rgb(ttype));
    tWindow.moveTo(this.pLocX, this.pLocY);
    tWindow.getElement("stickies_text_field").getProperty(Symbol.for("sprite")).ink = 36;
    tWindow.getElement("stickies_text_field").setText(this.pText);
    tWindow.registerProcedure(Symbol.for("eventProcMouseUp"), this.getID(), Symbol.for("mouseUp"));
    tWindow.registerProcedure(Symbol.for("eventProcKeyDown"), this.getID(), Symbol.for("keyDown"));
    if (tWndType == "habbo_stickies.window") {
      if (this.pIsOwner || this.pCanRemoveStickies) {
        tWindow.getElement("stickies_delete_button").setProperty(Symbol.for("blend"), 100);
      } else {
        tWindow.getElement("stickies_delete_button").setProperty(Symbol.for("cursor"), 0);
      }
      if (this.pIsController) {
        tWindow.getElement("stickies_color1_button").setProperty(Symbol.for("blend"), 100);
        tWindow.getElement("stickies_color2_button").setProperty(Symbol.for("blend"), 100);
        tWindow.getElement("stickies_color3_button").setProperty(Symbol.for("blend"), 100);
        tWindow.getElement("stickies_color4_button").setProperty(Symbol.for("blend"), 100);
      } else {
        tWindow.getElement("stickies_color1_button").setProperty(Symbol.for("cursor"), 0);
        tWindow.getElement("stickies_color2_button").setProperty(Symbol.for("cursor"), 0);
        tWindow.getElement("stickies_color3_button").setProperty(Symbol.for("cursor"), 0);
        tWindow.getElement("stickies_color4_button").setProperty(Symbol.for("cursor"), 0);
      }
    } else {
      if (tWndType == "habbo_stickies_vd.window") {
        if (this.pIsOwner || this.pCanRemoveStickies) {
          tWindow.getElement("stickies_delete_button").setProperty(Symbol.for("blend"), 100);
        } else {
          tWindow.getElement("stickies_delete_button").setProperty(Symbol.for("cursor"), 0);
        }
      }
    }
    this.pChanged = 0;
  }

  setColor(tColor, tByUser) {
    if (tByUser) {
      this.pChanged = 1;
    }
    this.pcolor = tColor;
    const tBgElem = getWindow(this.pWindowID).getElement("stickies_bg");
    if (tBgElem == 0) {
      return;
    }
    tBgElem.getProperty(Symbol.for("sprite")).bgColor = this.pcolor;
    const tItemObject = getThread(Symbol.for("room")).getComponent().getItemObject(string(this.pActivePostItId));
    if (objectp(tItemObject)) {
      tItemObject.setColor(this.pcolor);
    }
  }

  eventProcMouseUp(tEvent, tElemID, tParam, tWndID) {
    if (getWindow(tWndID).getElement(tElemID).getProperty(Symbol.for("blend")) == 100) {
      switch (tElemID) {
        case "stickies_close_button":
          this.close();
          break;
        case "stickies_color4_button":
          if (this.pIsController) {
            this.setColor(rgb(156, 206, 255), 1);
          }
          break;
        case "stickies_color3_button":
          if (this.pIsController) {
            this.setColor(rgb(255, 156, 255), 1);
          }
          break;
        case "stickies_color2_button":
          if (this.pIsController) {
            this.setColor(rgb(156, 255, 156), 1);
          }
          break;
        case "stickies_color1_button":
          if (this.pIsController) {
            this.setColor(rgb(255, 255, 51), 1);
          }
          break;
        case "stickies_delete_button":
          if (this.pIsOwner || this.pCanRemoveStickies) {
            this.delete();
          }
          break;
      }
    }
    return 1;
  }

  eventProcKeyDown(tEvent, tSprID, tParam) {
    if (tSprID == "stickies_text_field") {
      if ((the.selStart < length(this.pText)) && (this.pIsController == 0)) {
        error(this, "Cannot edit postIts - only add!", Symbol.for("eventProcKeyDown"), Symbol.for("minor"));
        return 1;
      }
      this.pChanged = 1;
    }
  }
}
