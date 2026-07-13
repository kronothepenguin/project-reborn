export default class {
  pRemoteControlledUsers;
  pHighlightUser;

  construct() {
    this.pRemoteControlledUsers = list();
    return this.regMsgList(1);
  }

  deconstruct() {
    this.pRemoteControlledUsers = list();
    return this.regMsgList(0);
  }

  handle_opc_ok(tMsg) {
    if (this.getComponent().getRoomID() == "private") {
      this.getComponent().roomConnected(VOID, "OPC_OK");
    }
  }

  handle_clc() {
    this.getComponent().roomDisconnected();
  }

  handle_youaremod(tMsg) {
    return 1;
  }

  handle_flat_letin(tMsg) {
    let tConn = tMsg.connection;
    let tName = tConn.GetStrFrom();
    this.getInterface().showDoorBellAccepted(tName);
    if (tName != EMPTY) {
      return 1;
    }
    return this.getComponent().roomConnected(VOID, "FLAT_LETIN");
  }

  handle_room_ready(tMsg) {
    this.getComponent().roomConnected(tMsg.content.word[1], "ROOM_READY");
  }

  handle_logout(tMsg) {
    let tuser = tMsg.content.word[1];
    if (tuser != getObject(Symbol.for("session")).GET("user_index")) {
      this.getComponent().removeUserObject(tuser);
    }
  }

  handle_disconnect() {
    this.getComponent().roomDisconnected();
  }

  handle_error(tMsg) {
    let tErr = tMsg.content;
    error(this, `${tMsg.connection.getID()}: ${tErr}`, Symbol.for("handle_error"), Symbol.for("dummy"));
    switch (tErr) {
      case "info: No place for stuff":
        this.getInterface().stopObjectMover();
        break;
      case "Incorrect flat password":
        if (threadExists(Symbol.for("navigator"))) {
          getThread(Symbol.for("navigator")).getComponent().flatAccessResult(tErr);
        }
        break;
      case "Password required":
        if (threadExists(Symbol.for("navigator"))) {
          getThread(Symbol.for("navigator")).getComponent().flatAccessResult(tErr);
        }
        break;
      case "weird error":
        executeMessage(Symbol.for("leaveRoom"));
        break;
      case "Not owner":
        getObject(Symbol.for("session")).set("room_controller", 0);
        break;
    }
  }

  handle_doorbell_ringing(tMsg) {
    if (tMsg.content == EMPTY) {
      return this.getInterface().showDoorBellWaiting();
    } else {
      return this.getInterface().showDoorBellDialog(tMsg.content);
    }
  }

  handle_flatnotallowedtoenter(tMsg) {
    let tConn = tMsg.connection;
    let tName = tConn.GetStrFrom();
    return this.getInterface().showDoorBellRejected(tName);
  }

  handle_status(tMsg) {
    let tList = list();
    let tCount = tMsg.content.line.count;
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "/";
    for (let i = 1; i <= tCount; i++) {
      let tLine = tMsg.content.line[i];
      if (length(tLine) > 5) {
        let tuser = propList();
        tuser[Symbol.for("id")] = tLine.item[1].word[1];
        let tloc = tLine.item[1].word[2];
        the.itemDelimiter = ",";
        tuser[Symbol.for("x")] = integer(tloc.item[1]);
        tuser[Symbol.for("y")] = integer(tloc.item[2]);
        tuser[Symbol.for("h")] = getLocalFloat(tloc.item[3]);
        tuser[Symbol.for("dirHead")] = (integer(tloc.item[4]) % 8);
        tuser[Symbol.for("dirBody")] = (integer(tloc.item[5]) % 8);
        let tActions = list();
        the.itemDelimiter = "/";
        for (let j = 2; j <= tLine.item.count; j++) {
          if (length(tLine.item[j]) > 1) {
            tActions.add(propList("name", tLine.item[j].word[1], "params", tLine.item[j]));
          }
        }
        tuser[Symbol.for("actions")] = tActions;
        tList.add(tuser);
      }
    }
    the.itemDelimiter = tDelim;
    for (const tuser of tList) {
      if (!((this.pRemoteControlledUsers.getOne(tuser[Symbol.for("id")])) > 0)) {
        let tUserObj = this.getComponent().getUserObject(tuser[Symbol.for("id")]);
        if (tUserObj != 0) {
          tUserObj.resetValues(tuser[Symbol.for("x")], tuser[Symbol.for("y")], tuser[Symbol.for("h")], tuser[Symbol.for("dirHead")], tuser[Symbol.for("dirBody")]);
          let tPrimaryActions = ["mv", "sit", "lay"];
          let tActionList = list();
          for (let i = tuser[Symbol.for("actions")].count; i >= 1; i--) {
            let tAction = tuser[Symbol.for("actions")][i];
            if (tPrimaryActions.findPos(tAction[Symbol.for("name")])) {
              tActionList.add(tAction);
              tuser[Symbol.for("actions")].deleteAt(i);
            }
          }
          for (const tAction of tuser[Symbol.for("actions")]) {
            tActionList.add(tAction);
          }
          for (const tAction of tActionList) {
            call(symbol("action_" & tAction[Symbol.for("name")]), [tUserObj], tAction[Symbol.for("params")]);
          }
          tUserObj.Refresh(tuser[Symbol.for("x")], tuser[Symbol.for("y")], tuser[Symbol.for("h")]);
        }
      }
    }
  }

  handle_users(tMsg) {
    let tCount = tMsg.content.line.count;
    let tDelim = the.itemDelimiter;
    let tList = propList();
    let tuser = EMPTY;
    if (!objectExists("Figure_System")) {
      return error(this, "Figure system object not found!", Symbol.for("handle_users"), Symbol.for("major"));
    }
    for (let f = 1; f <= tCount; f++) {
      let tLine = tMsg.content.line[f];
      let tProp = tLine.char[1];
      let tdata = tLine.char[`3..${length(tLine)}`];
      switch (tProp) {
        case "i":
          tuser = tdata;
          tList[tuser] = propList();
          tList[tuser][Symbol.for("direction")] = [0, 0];
          tList[tuser][Symbol.for("id")] = tdata;
          break;
        case "n":
          tList[tuser][Symbol.for("name")] = tdata;
          if (tdata.contains(numToChar(4))) {
            tList[tuser][Symbol.for("class")] = "pet";
          } else {
            tList[tuser][Symbol.for("class")] = "user";
          }
          break;
        case "f":
          tList[tuser][Symbol.for("figure")] = tdata;
          break;
        case "l":
          tList[tuser][Symbol.for("x")] = integer(tdata.word[1]);
          tList[tuser][Symbol.for("y")] = integer(tdata.word[2]);
          tList[tuser][Symbol.for("h")] = getLocalFloat(tdata.word[3]);
          break;
        case "c":
          tList[tuser][Symbol.for("custom")] = tdata;
          break;
        case "s":
          if ((tdata.char[1] == "F") || (tdata.char[1] == "f")) {
            tList[tuser][Symbol.for("sex")] = "F";
          } else {
            tList[tuser][Symbol.for("sex")] = "M";
          }
          break;
        case "p":
          if (tdata.contains("ch=s")) {
            the.itemDelimiter = "/";
            let tmodel = tdata.char[`4..6`];
            let tColor = tdata.item[2];
            the.itemDelimiter = ",";
            if (tColor.item.count == 3) {
              tColor = value(`rgb(${tColor})`);
            } else {
              tColor = rgb("#EEEEEE");
            }
            tList[tuser][Symbol.for("phfigure")] = propList("model", tmodel, "color", tColor);
            tList[tuser][Symbol.for("class")] = "pelle";
          }
          break;
        case "b":
          let tBadges = propList();
          let tDataPairs = explode(tdata, ",");
          for (let tPairNum = 1; tPairNum <= tDataPairs.count; tPairNum++) {
            let tPair = explode(tDataPairs[tPairNum], ":");
            if (tPair.count < 2) {
              continue;
            }
            tBadges.setaProp(integer(tPair[1]), tPair[2]);
          }
          tList[tuser][Symbol.for("badge")] = tBadges;
          break;
        case "a":
          tList[tuser][Symbol.for("webID")] = tdata;
          break;
        case "g":
          tList[tuser][Symbol.for("groupID")] = tdata;
          break;
        case "t":
          tList[tuser][Symbol.for("groupstatus")] = tdata;
          break;
        case "x":
          tList[tuser][Symbol.for("xp")] = integer(tdata);
          break;
        default:
          if (tLine.word[1] == "[bot]") {
            tList[tuser][Symbol.for("class")] = "bot";
          }
          break;
      }
    }
    let tFigureParser = getObject("Figure_System");
    for (const tObject of tList) {
      tObject[Symbol.for("figure")] = tFigureParser.parseFigure(tObject[Symbol.for("figure")], tObject[Symbol.for("sex")], tObject[Symbol.for("class")]);
    }
    the.itemDelimiter = tDelim;
    if (count(tList) == 0) {
      this.getComponent().validateUserObjects(0);
    } else {
      let tName = getObject(Symbol.for("session")).GET(Symbol.for("userName"));
      for (const tuser of tList) {
        if (tuser[Symbol.for("name")] == tName) {
          getObject(Symbol.for("session")).set("user_index", tuser[Symbol.for("id")]);
        }
        this.getComponent().validateUserObjects(tuser);
        if (this.getComponent().getPickedCryName() == tuser[Symbol.for("name")]) {
          this.getComponent().showCfhSenderDelayed(tuser[Symbol.for("id")]);
        }
        if (tuser[Symbol.for("name")] == tName) {
          this.getInterface().eventProcUserObj(Symbol.for("selection"), tuser[Symbol.for("id")], Symbol.for("userEnters"));
          if (!voidp(this.pHighlightUser)) {
            this.getComponent().highlightUser(this.pHighlightUser);
            this.pHighlightUser = VOID;
          }
        }
      }
    }
  }

  handle_showprogram(tMsg) {
    let tLine = tMsg.content;
    let tDst = tLine.word[1];
    let tCmd = tLine.word[2];
    let tArg = tLine.word[`3..${tLine.word.count}`];
    let tdata = propList("command", "SHOWPROGRAM", "show_dest", tDst, "show_command", tCmd, "show_params", tArg);
    let tObj = this.getComponent().getRoomPrg();
    if (objectp(tObj)) {
      call(Symbol.for("showprogram"), [tObj], tdata);
    }
  }

  handle_no_user_for_gift(tMsg) {
    let tUserName = tMsg.content;
    let tAlertString = getText("no_user_for_gift");
    tAlertString = replaceChunks(tAlertString, "%user%", tUserName);
    executeMessage(Symbol.for("alert"), propList("Msg", tAlertString));
  }

  handle_heightmap(tMsg) {
    this.getComponent().validateHeightMap(tMsg.content);
  }

  handle_heightmapupdate(tMsg) {
    this.getComponent().updateHeightMap(tMsg.content);
  }

  handle_OBJECTS(tMsg) {
    let tList = list();
    let tCount = tMsg.content.line.count;
    for (let i = 1; i <= tCount; i++) {
      let tLine = tMsg.content.line[i];
      if (length(tLine) > 5) {
        let tObj = propList();
        tObj[Symbol.for("id")] = tLine.word[1];
        tObj[Symbol.for("class")] = tLine.word[2];
        tObj[Symbol.for("x")] = integer(tLine.word[3]);
        tObj[Symbol.for("y")] = integer(tLine.word[4]);
        tObj[Symbol.for("h")] = integer(tLine.word[5]);
        if (tLine.word.count == 6) {
          let tdir = (integer(tLine.word[6]) % 8);
          tObj[Symbol.for("direction")] = [tdir, tdir, tdir];
          tObj[Symbol.for("dimensions")] = 0;
        } else {
          let tWidth = integer(tLine.word[6]);
          let tHeight = integer(tLine.word[7]);
          tObj[Symbol.for("dimensions")] = [tWidth, tHeight];
          tObj[Symbol.for("x")] = tObj[Symbol.for("x")] + tObj[Symbol.for("width")] - 1;
          tObj[Symbol.for("y")] = tObj[Symbol.for("y")] + tObj[Symbol.for("height")] - 1;
        }
        if (tObj[Symbol.for("id")] != EMPTY) {
          tList.add(tObj);
        }
      }
    }
    if (count(tList) > 0) {
      for (const tObj of tList) {
        this.getComponent().validatePassiveObjects(tObj);
      }
    } else {
      this.getComponent().validatePassiveObjects(0);
    }
  }

  parseActiveObject(tConn) {
    if (!tConn) {
      return 0;
    }
    let tObj = propList();
    tObj[Symbol.for("id")] = tConn.GetStrFrom();
    tObj[Symbol.for("class")] = tConn.GetStrFrom();
    tObj[Symbol.for("x")] = tConn.GetIntFrom();
    tObj[Symbol.for("y")] = tConn.GetIntFrom();
    let tWidth = tConn.GetIntFrom();
    let tHeight = tConn.GetIntFrom();
    let tDirection = (tConn.GetIntFrom() % 8);
    tObj[Symbol.for("direction")] = [tDirection, tDirection, tDirection];
    tObj[Symbol.for("dimensions")] = [tWidth, tHeight];
    tObj[Symbol.for("altitude")] = getLocalFloat(tConn.GetStrFrom());
    tObj[Symbol.for("colors")] = tConn.GetStrFrom();
    if (tObj[Symbol.for("colors")] == EMPTY) {
      tObj[Symbol.for("colors")] = "0";
    }
    let tRuntimeData = tConn.GetStrFrom();
    let tExtra = tConn.GetIntFrom();
    let tStuffData = tConn.GetStrFrom();
    tObj[Symbol.for("props")] = propList("runtimedata", tRuntimeData, "extra", tExtra, "stuffdata", tStuffData);
    return tObj;
  }

  handle_activeobjects(tMsg) {
    let tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    let tList = list();
    let tCount = tConn.GetIntFrom();
    for (let i = 1; i <= tCount; i++) {
      if (tConn != 0) {
        let tObj = this.parseActiveObject(tConn);
        if (listp(tObj)) {
          tList.add(tObj);
        }
      }
    }
    if (count(tList) > 0) {
      for (const tObj of tList) {
        this.getComponent().validateActiveObjects(tObj);
      }
      executeMessage(Symbol.for("activeObjectsUpdated"));
    } else {
      this.getComponent().validateActiveObjects(0);
    }
  }

  handle_activeobject_remove(tMsg) {
    this.getComponent().removeActiveObject(tMsg.content.word[1]);
    executeMessage(Symbol.for("activeObjectRemoved"));
    return 1;
  }

  handle_activeobject_add(tMsg) {
    let tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    let tObj = this.parseActiveObject(tConn);
    if (!listp(tObj)) {
      return 0;
    }
    this.getComponent().validateActiveObjects(tObj);
    executeMessage(Symbol.for("activeObjectsUpdated"));
    return 1;
  }

  handle_activeobject_update(tMsg) {
    let tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    let tObj = this.parseActiveObject(tConn);
    if (!listp(tObj)) {
      return 0;
    }
    let tComponent = this.getComponent();
    if (tComponent.activeObjectExists(tObj[Symbol.for("id")])) {
      tObj = getThread(Symbol.for("buffer")).getComponent().processObject(tObj, "active");
      let tActiveObj = tComponent.getActiveObject(tObj[Symbol.for("id")]);
      tActiveObj.define(tObj);
      tComponent.removeSlideObject(tObj[Symbol.for("id")]);
      call(Symbol.for("movingFinished"), [tActiveObj]);
      executeMessage(Symbol.for("activeObjectsUpdated"));
    } else {
      return error(this, `Active object not found: ${tObj[Symbol.for("id")]}`, Symbol.for("handle_activeobject_update"), Symbol.for("major"));
    }
  }

  handle_items(tMsg) {
    let tList = list();
    let tDelim = the.itemDelimiter;
    for (let i = 1; i <= tMsg.content.line.count; i++) {
      the.itemDelimiter = TAB;
      let tLine = tMsg.content.line[i];
      if (tLine != EMPTY) {
        let tObj = propList();
        tObj[Symbol.for("id")] = tLine.item[1];
        tObj[Symbol.for("class")] = tLine.item[2];
        tObj[Symbol.for("owner")] = tLine.item[3];
        tObj[Symbol.for("type")] = tLine.item[5];
        if (!(tLine.item[4].char[1] == ":")) {
          tObj[Symbol.for("direction")] = tLine.item[4].word[1];
          if (tObj[Symbol.for("direction")] == "frontwall") {
            tObj[Symbol.for("direction")] = "rightwall";
          }
          let tlocation = tLine.item[4].word[`2..${tLine.item[4].word.count}`];
          the.itemDelimiter = ",";
          tObj[Symbol.for("x")] = 0;
          tObj[Symbol.for("y")] = tlocation.item[1];
          tObj[Symbol.for("h")] = getLocalFloat(tlocation.item[2]);
          tObj[Symbol.for("z")] = integer(tlocation.item[3]);
          tObj[Symbol.for("formatVersion")] = Symbol.for("old");
        } else {
          let tLocString = tLine.item[4];
          let tWallLoc = tLocString.word[1].char[`4..${length(tLocString.word[1])}`];
          the.itemDelimiter = ",";
          tObj[Symbol.for("wall_x")] = value(tWallLoc.item[1]);
          tObj[Symbol.for("wall_y")] = value(tWallLoc.item[2]);
          let tLocalLoc = tLocString.word[2].char[`3..${length(tLocString.word[2])}`];
          tObj[Symbol.for("local_x")] = value(tLocalLoc.item[1]);
          tObj[Symbol.for("local_y")] = value(tLocalLoc.item[2]);
          let tDirChar = tLocString.word[3];
          switch (tDirChar) {
            case "r":
              tObj[Symbol.for("direction")] = "rightwall";
              break;
            case "l":
              tObj[Symbol.for("direction")] = "leftwall";
              break;
          }
          tObj[Symbol.for("formatVersion")] = Symbol.for("new");
        }
        tList.add(tObj);
      }
    }
    the.itemDelimiter = tDelim;
    if (count(tList) > 0) {
      for (const tItem of tList) {
        this.getComponent().validateItemObjects(tItem);
      }
      executeMessage(Symbol.for("itemObjectsUpdated"));
    } else {
      this.getComponent().validateItemObjects(0);
    }
  }

  handle_removeitem(tMsg) {
    this.getComponent().removeItemObject(tMsg.content);
    executeMessage(Symbol.for("itemObjectRemoved"));
    this.getInterface().stopObjectMover();
  }

  handle_updateitem(tMsg) {
    let tItem = this.getComponent().getItemObject(tMsg.content.word[1]);
    if (objectp(tItem)) {
      tItem.setState(the.lastWordIn(tMsg.content));
    }
  }

  handle_stuffdataupdate(tMsg) {
    let tConn = tMsg.connection;
    if (!tConn) {
      return 0;
    }
    let tTarget = tConn.GetStrFrom();
    let tValue = tConn.GetStrFrom();
    if (this.getComponent().activeObjectExists(tTarget)) {
      call(Symbol.for("updateStuffdata"), [this.getComponent().getActiveObject(tTarget)], tValue);
    } else {
      return error(this, `Active object not found: ${tTarget}`, Symbol.for("handle_stuffdataupdate"), Symbol.for("major"));
    }
  }

  handle_presentopen(tMsg) {
    let ttype = tMsg.content.line[1];
    let tCode = tMsg.content.line[2];
    let tColors = tMsg.content.line[3];
    let tCard = "PackageCardObj";
    if (objectExists(tCard)) {
      getObject(tCard).showContent(propList("type", ttype, "code", tCode, "color", tColors));
    } else {
      error(this, "Package card obj not found!", Symbol.for("handle_presentopen"), Symbol.for("major"));
    }
  }

  handle_flatproperty(tMsg) {
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "/";
    let tLine = tMsg.content;
    let tdata = propList("key", tLine.item[1], "value", tLine.item[2]);
    the.itemDelimiter = tDelim;
    this.getComponent().setRoomProperty(tdata[Symbol.for("key")], tdata[Symbol.for("value")]);
  }

  handle_room_rights(tMsg) {
    switch (tMsg.subject) {
      case 42:
        getObject(Symbol.for("session")).set("room_controller", 1);
        break;
      case 43:
        getObject(Symbol.for("session")).set("room_controller", 0);
        break;
      case 47:
        getObject(Symbol.for("session")).set("room_owner", 1);
        break;
    }
  }

  handle_stripinfo(tMsg) {
    let tProps = propList("objects", list(), "count", 0);
    let tDelim = the.itemDelimiter;
    tProps[Symbol.for("count")] = integer(tMsg.content.line[tMsg.content.line.count]);
    the.itemDelimiter = "/";
    let tCount = tMsg.content.item.count;
    let tStripMax = 0;
    let tTotalItemCount = 0;
    for (let i = 1; i <= tCount; i++) {
      the.itemDelimiter = "/";
      let tItem = tMsg.content.item[i];
      if (tItem == EMPTY) {
        break;
      }
      the.itemDelimiter = numToChar(30);
      if (tItem.item.count < 2) {
        tTotalItemCount = integer(tItem - 1);
        break;
      }
      let tObj = propList();
      tObj[Symbol.for("stripId")] = tItem.item[2];
      let tObjectPos = integer(tItem.item[3]);
      tObj[Symbol.for("striptype")] = tItem.item[4];
      tObj[Symbol.for("id")] = tItem.item[5];
      tObj[Symbol.for("class")] = tItem.item[6];
      switch (tObj[Symbol.for("striptype")]) {
        case "S":
          tObj[Symbol.for("name")] = getText(`furni_${tObj[Symbol.for("class")]}_name`, `furni_${tObj[Symbol.for("class")]}_name`);
          tObj[Symbol.for("striptype")] = "active";
          tObj[Symbol.for("custom")] = getText(`furni_${tObj[Symbol.for("class")]}_name`, `furni_${tObj[Symbol.for("class")]}_desc`);
          tObj[Symbol.for("dimensions")] = [integer(tItem.item[7]), integer(tItem.item[8])];
          tObj[Symbol.for("stuffdata")] = tItem.item[9];
          tObj[Symbol.for("colors")] = tItem.item[10];
          tObj[Symbol.for("isRecyclable")] = tItem.item[11];
          if ((tItem.item[12] != EMPTY) && (tItem.item.count >= 12)) {
            tObj[Symbol.for("slotID")] = tItem.item[12];
          }
          if ((tItem.item[13] != EMPTY) && (tItem.item.count >= 13)) {
            tObj[Symbol.for("songID")] = tItem.item[13];
          }
          the.itemDelimiter = ",";
          if (tObj[Symbol.for("colors")].char[1] == "#") {
            if (tObj[Symbol.for("colors")].item.count > 1) {
              tObj[Symbol.for("stripColor")] = rgb(tObj[Symbol.for("colors")].item[tObj[Symbol.for("colors")].item.count]);
            } else {
              tObj[Symbol.for("stripColor")] = rgb(tObj[Symbol.for("colors")]);
            }
          } else {
            tObj[Symbol.for("stripColor")] = 0;
          }
          break;
        case "I":
          tObj[Symbol.for("striptype")] = "item";
          tObj[Symbol.for("props")] = tItem.item[7];
          tObj[Symbol.for("isRecyclable")] = tItem.item[8];
          switch (tObj[Symbol.for("class")]) {
            case "poster":
              tObj[Symbol.for("name")] = getText(`poster_${tObj[Symbol.for("props")]}_name`, `poster_${tObj[Symbol.for("props")]}_name`);
              break;
            default:
              tObj[Symbol.for("name")] = getText(`wallitem_${tObj[Symbol.for("class")]}_name`, `wallitem_${tObj[Symbol.for("class")]}_name`);
              break;
          }
          break;
      }
      tProps[Symbol.for("objects")].add(tObj);
      if (tObjectPos > tStripMax) {
        tStripMax = tObjectPos;
      }
    }
    the.itemDelimiter = tDelim;
    let tInventory = this.getInterface().getContainer();
    tInventory.setHandButton("next", tTotalItemCount > integer(tStripMax));
    tInventory.setHandButton("prev", integer(tStripMax) > 8);
    switch (tMsg.subject) {
      case 140:
        tInventory.updateStripItems(tProps[Symbol.for("objects")]);
        tInventory.setStripItemCount(tProps[Symbol.for("count")]);
        tInventory.open(1);
        tInventory.Refresh();
        break;
      case 98:
        tInventory.appendStripItem(tProps[Symbol.for("objects")][1]);
        tInventory.open(1);
        tInventory.Refresh();
        break;
      case 108:
        return tProps;
    }
  }

  handle_stripupdated(tMsg) {
    tMsg.connection.send("GETSTRIP", "new");
  }

  handle_removestripitem(tMsg) {
    this.getInterface().getContainer().removeStripItem(tMsg.content.word[1]);
    this.getInterface().getContainer().Refresh();
  }

  handle_youarenotallowed() {
    executeMessage(Symbol.for("alert"), propList("Msg", "trade_youarenotallowed", "id", "youarenotallowed"));
  }

  handle_othernotallowed() {
    executeMessage(Symbol.for("alert"), propList("Msg", "trade_othernotallowed", "id", "othernotallowed"));
  }

  handle_idata(tMsg) {
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = TAB;
    let tID = integer(tMsg.content.line[1].item[1]);
    let ttype = tMsg.content.line[1].item[2];
    let tText = `${tMsg.content.line[1].item[2]}${RETURN}${tMsg.content.line[`2..${tMsg.content.line.count}`]}`;
    the.itemDelimiter = tDelim;
    executeMessage(symbol("itemdata_received" & tID), propList("id", tID, "text", tText, "type", ttype));
  }

  handle_trade_items(tMsg) {
    let tMessage = propList();
    for (let i = 1; i <= 2; i++) {
      let tLine = tMsg.content.line[i];
      let tdata = propList();
      tdata[Symbol.for("accept")] = tLine.word[2];
      let tItemStr = `foo${RETURN}${tLine.word[`3..${tLine.word.count}`]}${RETURN}1`;
      tdata[Symbol.for("items")] = this.handle_stripinfo(propList("subject", 108, "content", tItemStr)).getaProp(Symbol.for("objects"));
      if (!listp(tdata[Symbol.for("items")])) {
        return error(this, "Invalid itemdata from server!", Symbol.for("handle_trade_items"), Symbol.for("major"));
      }
      let tUserName = tLine.word[1];
      if (tUserName == EMPTY) {
        return error(this, "No username from server", Symbol.for("handle_trade_items"), Symbol.for("major"));
      }
      if (this.getInterface().getIgnoreStatus(VOID, tUserName)) {
        return this.getComponent().getRoomConnection().send("TRADE_CLOSE");
      }
      tMessage[tUserName] = tdata;
    }
    return this.getInterface().getSafeTrader().Refresh(tMessage);
  }

  handle_trade_close(tMsg) {
    this.getInterface().getSafeTrader().close();
    tMsg.connection.send("GETSTRIP", "new");
  }

  handle_trade_accept(tMsg) {
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "/";
    let tuser = tMsg.content.item[1];
    let tValue = tMsg.content.item[2] == "true";
    the.itemDelimiter = tDelim;
    this.getInterface().getSafeTrader().accept(tuser, tValue);
  }

  handle_trade_completed(tMsg) {
    this.getInterface().getSafeTrader().complete();
  }

  handle_door_in(tMsg) {
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "/";
    let tDoor = tMsg.content.item[1];
    let tuser = tMsg.content.item[2];
    the.itemDelimiter = tDelim;
    let tDoorObj = this.getComponent().getActiveObject(tDoor);
    if (tDoorObj != 0) {
      call(Symbol.for("animate"), [tDoorObj], 18);
      if (getObject(Symbol.for("session")).GET("user_name") == tuser) {
        call(Symbol.for("prepareToKick"), [tDoorObj], tuser);
      }
    }
  }

  handle_door_out(tMsg) {
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "/";
    let tDoor = this.getComponent().getActiveObject(tMsg.content.item[1]);
    the.itemDelimiter = tDelim;
    if (tDoor != 0) {
      call(Symbol.for("animate"), [tDoor]);
    }
  }

  handle_doorflat(tMsg) {
    let tConn = tMsg.connection;
    let tTeleId = tConn.GetIntFrom();
    let tFlatID = tConn.GetIntFrom();
    if (!(tTeleId && tFlatID)) {
      return error(this, "Retarded doorflat data!", Symbol.for("handle_doorflat"), Symbol.for("major"));
    }
    this.getComponent().startTeleport(tTeleId, tFlatID);
  }

  handle_doordeleted(tMsg) {
    if (getObject(Symbol.for("session")).exists("current_door_ID")) {
      let tDoorID = getObject(Symbol.for("session")).GET("current_door_ID");
      let tDoorObj = this.getComponent().getActiveObject(tDoorID);
      if (tDoorObj != 0) {
        tDoorObj.kickOut();
      }
    }
  }

  handle_dice_value(tMsg) {
    let tID = tMsg.content.word[1];
    if (tMsg.content.word.count == 1) {
      let tValue = -1;
    } else {
      let tValue = integer(tMsg.content.word[2] - (tID * 38));
      if (tValue > 6) {
        tValue = 0;
      }
    }
    if (this.getComponent().activeObjectExists(tID)) {
      call(Symbol.for("diceThrown"), [this.getComponent().getActiveObject(tID)], tValue);
    }
  }

  handle_roomad(tMsg) {
    if (tMsg.content.length > 1) {
      let tDelim = the.itemDelimiter;
      the.itemDelimiter = TAB;
      let tSourceURL = tMsg.content.item[1];
      let tTargetURL = tMsg.content.item[2];
      the.itemDelimiter = tDelim;
      let tLayoutID = this.getInterface().getRoomVisualizer().pLayout;
      this.getComponent().getAd().Init(tSourceURL, tTargetURL, tLayoutID);
    } else {
      this.getComponent().getAd().Init(0);
    }
  }

  handle_petstat(tMsg) {
    let tPetObj = this.getComponent().getUserObject(tMsg.connection.GetIntFrom());
    if (tPetObj == 0) {
      return error(this, "Pet object not found!", Symbol.for("handle_petstat"), Symbol.for("major"));
    }
    let tName = tPetObj.getName();
    let tAge = tMsg.connection.GetIntFrom();
    let tHungry = getText(`pet_hung_${tMsg.connection.GetIntFrom()}`, "???");
    let tThirsty = getText(`pet_thir_${tMsg.connection.GetIntFrom()}`, "???");
    let tHappiness = getText(`pet_mood_${tMsg.connection.GetIntFrom()}`, "???");
    let tNature01 = getText(`pet_enrg_${tMsg.connection.GetIntFrom()}`, "???");
    let tNature02 = getText(`pet_frnd_${tMsg.connection.GetIntFrom()}`, "???");
    if (createWindow("pet_status_dialog")) {
      let tWndObj = getWindow("pet_status_dialog");
      tWndObj.moveTo(8, 8);
      tWndObj.setProperty(Symbol.for("title"), tName);
      if (!tWndObj.merge("habbo_full.window")) {
        return tWndObj.close();
      }
      if (!tWndObj.merge("petstatus.window")) {
        return tWndObj.close();
      }
      tWndObj.getElement("age").setText(tAge);
      tWndObj.getElement("hungry").setText(tHungry);
      tWndObj.getElement("thirsty").setText(tThirsty);
      tWndObj.getElement("happiness").setText(tHappiness);
      tWndObj.getElement("nature").setText(`${tNature01}, ${tNature02}`);
      tWndObj.getElement("picture").feedImage(tPetObj.getPicture());
      registerMessage(Symbol.for("leaveRoom"), tWndObj.getID(), Symbol.for("close"));
      registerMessage(Symbol.for("changeRoom"), tWndObj.getID(), Symbol.for("close"));
    }
  }

  handle_userbadge(tMsg) {
    if (voidp(tMsg.connection)) {
      return 0;
    }
    let tUserID = tMsg.connection.GetStrFrom();
    let tChosenBadgeCount = tMsg.connection.GetIntFrom();
    let tBadges = propList();
    for (let i = 1; i <= tChosenBadgeCount; i++) {
      let tBadgeIndex = tMsg.connection.GetIntFrom();
      let tBadgeID = tMsg.connection.GetStrFrom();
      tBadges.setaProp(tBadgeIndex, tBadgeID);
    }
    let tUserObj = this.getComponent().getUserObjectByWebID(tUserID);
    if (!objectp(tUserObj)) {
      return 0;
    }
    tUserObj.pBadges = tBadges;
    this.getInterface().unignoreAdmin(tUserID, tBadges);
    executeMessage(Symbol.for("updateInfoStandBadge"), tBadges, tUserID);
  }

  handle_slideobjectbundle(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tComponent = this.getComponent();
    let tTimeNow = the.milliSeconds;
    let tObjList = list();
    let tContainsObjects = 0;
    let tFromX = tConn.GetIntFrom();
    let tFromY = tConn.GetIntFrom();
    let tToX = tConn.GetIntFrom();
    let tToY = tConn.GetIntFrom();
    let tStuffCount = tConn.GetIntFrom();
    for (let tCount = 1; tCount <= tStuffCount; tCount++) {
      let tObj = list();
      let tItemID = tConn.GetIntFrom();
      let tItemFromH = getLocalFloat(tConn.GetStrFrom());
      let tItemToH = getLocalFloat(tConn.GetStrFrom());
      let tFrom = [tFromX, tFromY, tItemFromH];
      let tTo = [tToX, tToY, tItemToH];
      tObj = [tItemID, tFrom, tTo];
      tObjList.add(tObj);
      tContainsObjects = 1;
    }
    let tTileID = tConn.GetIntFrom();
    let tTileObj = tComponent.getActiveObject(tTileID);
    if (tTileObj != 0) {
      if (tTileObj.handler(Symbol.for("setAnimation"))) {
        call(Symbol.for("setAnimation"), tTileObj, 1);
      }
    }
    let tMoveType = tConn.GetIntFrom();
    switch (tMoveType) {
      case 0:
        let tHasCharacter = 0;
        break;
      case 1:
        tMoveType = "mv";
        let tHasCharacter = 1;
        break;
      case 2:
        tMoveType = "sld";
        let tHasCharacter = 1;
        break;
      default:
        return error(this, "Incompatible character movetype", Symbol.for("handle_slideobjectbundle"), Symbol.for("minor"));
    }
    if (tHasCharacter) {
      let tCharID = tConn.GetIntFrom();
      let tFromH = getLocalFloat(tConn.GetStrFrom());
      let tToH = getLocalFloat(tConn.GetStrFrom());
      let tUserObj = this.getComponent().getUserObject(tCharID);
      if (tUserObj != 0) {
        let tCommandStr = `${tMoveType} ${tToX},${tToY},${tToH} ${tContainsObjects.integer} ${tTimeNow}`;
        call(symbol("action_" & tMoveType), [tUserObj], tCommandStr);
      }
    }
    for (const tObj of tObjList) {
      tComponent.addSlideObject(tObj[1], tObj[2], tObj[3], tTimeNow, tHasCharacter);
    }
  }

  handle_interstitialdata(tMsg) {
    if (tMsg.content.length > 1) {
      let tDelim = the.itemDelimiter;
      the.itemDelimiter = TAB;
      let tSourceURL = tMsg.content.item[1];
      let tTargetURL = tMsg.content.item[2];
      the.itemDelimiter = tDelim;
      this.getComponent().getInterstitial().Init(tSourceURL, tTargetURL);
    } else {
      this.getComponent().getInterstitial().Init(0);
    }
  }

  handle_roomqueuedata(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tSetCount = tConn.GetIntFrom();
    let tQueueCollection = list();
    for (let i = 1; i <= tSetCount; i++) {
      let tQueueSetName = tConn.GetStrFrom();
      let tQueueTarget = tConn.GetIntFrom();
      let tNumberOfQueues = tConn.GetIntFrom();
      let tQueueData = propList();
      let tQueueSet = propList();
      for (let t = 1; t <= tNumberOfQueues; t++) {
        let tQueueID = tConn.GetStrFrom();
        let tQueueLength = tConn.GetIntFrom();
        tQueueData[tQueueID] = tQueueLength;
      }
      tQueueSet["name"] = tQueueSetName;
      tQueueSet["target"] = tQueueTarget;
      tQueueSet["data"] = tQueueData;
      tQueueCollection[i] = tQueueSet;
    }
    this.getInterface().updateQueueWindow(tQueueCollection);
  }

  handle_youarespectator() {
    return this.getComponent().setSpectatorMode(1);
  }

  handle_removespecs() {
    this.getInterface().showRemoveSpecsNotice();
  }

  handle_figure_change(tMsg) {
    let tConn = tMsg.connection;
    let tUserID = tConn.GetIntFrom();
    let tUserFigure = tConn.GetStrFrom();
    let tUserSex = tConn.GetStrFrom();
    let tUserCustomInfo = tConn.GetStrFrom();
    this.getComponent().updateCharacterFigure(tUserID, tUserFigure, tUserSex, tUserCustomInfo);
  }

  handle_spectator_amount(tMsg) {
    let tConn = tMsg.connection;
    let tSpecCount = tConn.GetIntFrom();
    let tSpecMax = tConn.GetIntFrom();
    this.getComponent().updateSpectatorCount(tSpecCount, tSpecMax);
  }

  handle_group_badges(tMsg) {
    let tConn = tMsg.connection;
    let tNumberOfGroups = tConn.GetIntFrom();
    let tGroupData = list();
    for (let tNo = 1; tNo <= tNumberOfGroups; tNo++) {
      let tGroup = propList();
      tGroup[Symbol.for("id")] = tConn.GetIntFrom();
      tGroup[Symbol.for("logo")] = tConn.GetStrFrom();
      tGroupData.add(tGroup);
    }
    this.getComponent().getGroupInfoObject().updateGroupInformation(tGroupData);
  }

  handle_group_details(tMsg) {
    let tConn = tMsg.connection;
    let tGroupData = list();
    let tGroup = propList();
    tGroup[Symbol.for("id")] = tConn.GetIntFrom();
    if (tGroup[Symbol.for("id")] == -1) {
      return 0;
    }
    tGroup[Symbol.for("name")] = tConn.GetStrFrom();
    tGroup[Symbol.for("desc")] = tConn.GetStrFrom();
    tGroup[Symbol.for("roomid")] = tConn.GetIntFrom();
    tGroup[Symbol.for("roomname")] = tConn.GetStrFrom();
    tGroupData.add(tGroup);
    this.getComponent().getGroupInfoObject().updateGroupInformation(tGroupData);
    executeMessage(Symbol.for("groupInfoRetrieved"), tGroup[Symbol.for("id")]);
  }

  handle_group_membership_update(tMsg) {
    let tConn = tMsg.connection;
    let tUserIndex = tConn.GetIntFrom();
    let tGroupId = tConn.GetIntFrom();
    let tStatus = tConn.GetIntFrom();
    let tuser = this.getComponent().getUserObject(tUserIndex);
    if (!voidp(tuser)) {
      if (tuser != 0) {
        tuser.setProperty(Symbol.for("groupID"), tGroupId);
        tuser.setProperty(Symbol.for("groupstatus"), tStatus);
      }
    }
  }

  handle_room_rating(tMsg) {
    let tConn = tMsg.connection;
    let tRoomRating = tConn.GetIntFrom();
    let tRoomRatingPercent = tConn.GetIntFrom();
    this.getComponent().setRoomRating(tRoomRating, tRoomRatingPercent);
    executeMessage(Symbol.for("roomRatingChanged"));
  }

  handle_user_tag_list(tMsg) {
    let tConn = tMsg.connection;
    let tUserID = tConn.GetIntFrom();
    let tNumOfTags = tConn.GetIntFrom();
    let tTagList = list();
    for (let tTagNum = 1; tTagNum <= tNumOfTags; tTagNum++) {
      let tTag = tConn.GetStrFrom();
      tTagList.add(tTag);
    }
    executeMessage(Symbol.for("updateUserTags"), tUserID, tTagList);
  }

  handle_user_typing_status(tMsg) {
    let tConn = tMsg.connection;
    let tUserID = tConn.GetIntFrom();
    let tstate = tConn.GetIntFrom();
    tUserID = string(tUserID);
    this.getComponent().setUserTypingStatus(tUserID, tstate);
  }

  handle_highlight_user(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tUserID = tConn.GetStrFrom();
    this.pHighlightUser = tUserID;
  }

  handle_roomevent_permission(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tCanCreate = tConn.GetIntFrom();
    if (tCanCreate) {
      executeMessage(Symbol.for("allowRoomeventCreation"));
    }
  }

  handle_roomevent_types(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tTypeCount = tConn.GetIntFrom();
    this.getComponent().setRoomEventTypeCount(tTypeCount);
  }

  handle_roomevent_list(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tTypeID = tConn.GetIntFrom();
    let tEventCount = tConn.GetIntFrom();
    let tEvents = list();
    for (let tEventNum = 1; tEventNum <= tEventCount; tEventNum++) {
      let tEvent = propList();
      tEvent.setaProp(Symbol.for("flatId"), tConn.GetStrFrom());
      tEvent.setaProp(Symbol.for("hostName"), tConn.GetStrFrom());
      tEvent.setaProp(Symbol.for("name"), tConn.GetStrFrom());
      tEvent.setaProp(Symbol.for("desc"), tConn.GetStrFrom());
      tEvent.setaProp(Symbol.for("time"), tConn.GetStrFrom());
      tEvents.add(tEvent);
    }
    this.getComponent().setRoomEventList(tTypeID, tEvents);
  }

  handle_roomevent_info(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tEventInfo = propList();
    let tHostID = tConn.GetStrFrom();
    tEventInfo.setaProp(Symbol.for("hostID"), tHostID);
    if (tHostID > 0) {
      tEventInfo.setaProp(Symbol.for("hostName"), tConn.GetStrFrom());
      tEventInfo.setaProp(Symbol.for("flatId"), tConn.GetStrFrom());
      tEventInfo.setaProp(Symbol.for("typeID"), tConn.GetIntFrom());
      tEventInfo.setaProp(Symbol.for("name"), tConn.GetStrFrom());
      tEventInfo.setaProp(Symbol.for("desc"), tConn.GetStrFrom());
      tEventInfo.setaProp(Symbol.for("time"), tConn.GetStrFrom());
    }
    this.getComponent().setRoomEvent(tEventInfo);
  }

  handle_ignore_user_result(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tResult = tConn.GetIntFrom();
    return executeMessage(Symbol.for("ignore_user_result"), tResult);
  }

  handle_ignore_list(tMsg) {
    let tConn = tMsg.getaProp(Symbol.for("connection"));
    let tCount = tConn.GetIntFrom();
    let tList = list();
    for (let i = 1; i <= tCount; i++) {
      tList.append(tConn.GetStrFrom());
    }
    return executeMessage(Symbol.for("save_ignore_list"), tList);
  }

  regMsgList(tBool) {
    let tMsgs = propList();
    tMsgs.setaProp(-1, Symbol.for("handle_disconnect"));
    tMsgs.setaProp(18, Symbol.for("handle_clc"));
    tMsgs.setaProp(19, Symbol.for("handle_opc_ok"));
    tMsgs.setaProp(28, Symbol.for("handle_users"));
    tMsgs.setaProp(29, Symbol.for("handle_logout"));
    tMsgs.setaProp(30, Symbol.for("handle_OBJECTS"));
    tMsgs.setaProp(31, Symbol.for("handle_heightmap"));
    tMsgs.setaProp(32, Symbol.for("handle_activeobjects"));
    tMsgs.setaProp(33, Symbol.for("handle_error"));
    tMsgs.setaProp(34, Symbol.for("handle_status"));
    tMsgs.setaProp(41, Symbol.for("handle_flat_letin"));
    tMsgs.setaProp(45, Symbol.for("handle_items"));
    tMsgs.setaProp(42, Symbol.for("handle_room_rights"));
    tMsgs.setaProp(43, Symbol.for("handle_room_rights"));
    tMsgs.setaProp(46, Symbol.for("handle_flatproperty"));
    tMsgs.setaProp(47, Symbol.for("handle_room_rights"));
    tMsgs.setaProp(48, Symbol.for("handle_idata"));
    tMsgs.setaProp(62, Symbol.for("handle_doorflat"));
    tMsgs.setaProp(63, Symbol.for("handle_doordeleted"));
    tMsgs.setaProp(64, Symbol.for("handle_doordeleted"));
    tMsgs.setaProp(69, Symbol.for("handle_room_ready"));
    tMsgs.setaProp(70, Symbol.for("handle_youaremod"));
    tMsgs.setaProp(71, Symbol.for("handle_showprogram"));
    tMsgs.setaProp(76, Symbol.for("handle_no_user_for_gift"));
    tMsgs.setaProp(83, Symbol.for("handle_items"));
    tMsgs.setaProp(84, Symbol.for("handle_removeitem"));
    tMsgs.setaProp(85, Symbol.for("handle_updateitem"));
    tMsgs.setaProp(88, Symbol.for("handle_stuffdataupdate"));
    tMsgs.setaProp(89, Symbol.for("handle_door_out"));
    tMsgs.setaProp(90, Symbol.for("handle_dice_value"));
    tMsgs.setaProp(91, Symbol.for("handle_doorbell_ringing"));
    tMsgs.setaProp(92, Symbol.for("handle_door_in"));
    tMsgs.setaProp(93, Symbol.for("handle_activeobject_add"));
    tMsgs.setaProp(94, Symbol.for("handle_activeobject_remove"));
    tMsgs.setaProp(95, Symbol.for("handle_activeobject_update"));
    tMsgs.setaProp(98, Symbol.for("handle_stripinfo"));
    tMsgs.setaProp(99, Symbol.for("handle_removestripitem"));
    tMsgs.setaProp(101, Symbol.for("handle_stripupdated"));
    tMsgs.setaProp(102, Symbol.for("handle_youarenotallowed"));
    tMsgs.setaProp(103, Symbol.for("handle_othernotallowed"));
    tMsgs.setaProp(105, Symbol.for("handle_trade_completed"));
    tMsgs.setaProp(108, Symbol.for("handle_trade_items"));
    tMsgs.setaProp(109, Symbol.for("handle_trade_accept"));
    tMsgs.setaProp(110, Symbol.for("handle_trade_close"));
    tMsgs.setaProp(112, Symbol.for("handle_trade_completed"));
    tMsgs.setaProp(129, Symbol.for("handle_presentopen"));
    tMsgs.setaProp(131, Symbol.for("handle_flatnotallowedtoenter"));
    tMsgs.setaProp(140, Symbol.for("handle_stripinfo"));
    tMsgs.setaProp(208, Symbol.for("handle_roomad"));
    tMsgs.setaProp(210, Symbol.for("handle_petstat"));
    tMsgs.setaProp(219, Symbol.for("handle_heightmapupdate"));
    tMsgs.setaProp(228, Symbol.for("handle_userbadge"));
    tMsgs.setaProp(230, Symbol.for("handle_slideobjectbundle"));
    tMsgs.setaProp(258, Symbol.for("handle_interstitialdata"));
    tMsgs.setaProp(259, Symbol.for("handle_roomqueuedata"));
    tMsgs.setaProp(254, Symbol.for("handle_youarespectator"));
    tMsgs.setaProp(283, Symbol.for("handle_removespecs"));
    tMsgs.setaProp(266, Symbol.for("handle_figure_change"));
    tMsgs.setaProp(298, Symbol.for("handle_spectator_amount"));
    tMsgs.setaProp(309, Symbol.for("handle_group_badges"));
    tMsgs.setaProp(310, Symbol.for("handle_group_membership_update"));
    tMsgs.setaProp(311, Symbol.for("handle_group_details"));
    tMsgs.setaProp(345, Symbol.for("handle_room_rating"));
    tMsgs.setaProp(350, Symbol.for("handle_user_tag_list"));
    tMsgs.setaProp(361, Symbol.for("handle_user_typing_status"));
    tMsgs.setaProp(362, Symbol.for("handle_highlight_user"));
    tMsgs.setaProp(367, Symbol.for("handle_roomevent_permission"));
    tMsgs.setaProp(368, Symbol.for("handle_roomevent_types"));
    tMsgs.setaProp(369, Symbol.for("handle_roomevent_list"));
    tMsgs.setaProp(370, Symbol.for("handle_roomevent_info"));
    tMsgs.setaProp(419, Symbol.for("handle_ignore_user_result"));
    tMsgs.setaProp(420, Symbol.for("handle_ignore_list"));
    let tCmds = propList();
    tCmds.setaProp(Symbol.for("room_directory"), 2);
    tCmds.setaProp("GETDOORFLAT", 28);
    tCmds.setaProp("CHAT", 52);
    tCmds.setaProp("SHOUT", 55);
    tCmds.setaProp("WHISPER", 56);
    tCmds.setaProp("QUIT", 53);
    tCmds.setaProp("GOVIADOOR", 54);
    tCmds.setaProp("TRYFLAT", 57);
    tCmds.setaProp("GOTOFLAT", 59);
    tCmds.setaProp("G_HMAP", 60);
    tCmds.setaProp("G_USRS", 61);
    tCmds.setaProp("G_OBJS", 62);
    tCmds.setaProp("G_ITEMS", 63);
    tCmds.setaProp("G_STAT", 64);
    tCmds.setaProp("GETSTRIP", 65);
    tCmds.setaProp("FLATPROPBYITEM", 66);
    tCmds.setaProp("ADDSTRIPITEM", 67);
    tCmds.setaProp("TRADE_UNACCEPT", 68);
    tCmds.setaProp("TRADE_ACCEPT", 69);
    tCmds.setaProp("TRADE_CLOSE", 70);
    tCmds.setaProp("TRADE_OPEN", 71);
    tCmds.setaProp("TRADE_ADDITEM", 72);
    tCmds.setaProp("MOVESTUFF", 73);
    tCmds.setaProp("SETSTUFFDATA", 74);
    tCmds.setaProp("MOVE", 75);
    tCmds.setaProp("THROW_DICE", 76);
    tCmds.setaProp("DICE_OFF", 77);
    tCmds.setaProp("PRESENTOPEN", 78);
    tCmds.setaProp("LOOKTO", 79);
    tCmds.setaProp("CARRYDRINK", 80);
    tCmds.setaProp("INTODOOR", 81);
    tCmds.setaProp("DOORGOIN", 82);
    tCmds.setaProp("G_IDATA", 83);
    tCmds.setaProp("SETITEMDATA", 84);
    tCmds.setaProp("REMOVEITEM", 85);
    tCmds.setaProp("CARRYITEM", 87);
    tCmds.setaProp("STOP", 88);
    tCmds.setaProp("USEITEM", 89);
    tCmds.setaProp("PLACESTUFF", 90);
    tCmds.setaProp("DANCE", 93);
    tCmds.setaProp("WAVE", 94);
    tCmds.setaProp("KICKUSER", 95);
    tCmds.setaProp("ASSIGNRIGHTS", 96);
    tCmds.setaProp("REMOVERIGHTS", 97);
    tCmds.setaProp("LETUSERIN", 98);
    tCmds.setaProp("REMOVESTUFF", 99);
    tCmds.setaProp("GOAWAY", 115);
    tCmds.setaProp("GETROOMAD", 126);
    tCmds.setaProp("GETPETSTAT", 128);
    tCmds.setaProp("SETBADGE", 158);
    tCmds.setaProp("GETINTERST", 182);
    tCmds.setaProp("CONVERT_FURNI_TO_CREDITS", 183);
    tCmds.setaProp("ROOM_QUEUE_CHANGE", 211);
    tCmds.setaProp("SETITEMSTATE", 214);
    tCmds.setaProp("GET_SPECTATOR_AMOUNT", 216);
    tCmds.setaProp("GET_GROUP_BADGES", 230);
    tCmds.setaProp("GET_GROUP_DETAILS", 231);
    tCmds.setaProp("SPIN_WHEEL_OF_FORTUNE", 247);
    tCmds.setaProp("RATEFLAT", 261);
    tCmds.setaProp("GET_USER_TAGS", 263);
    tCmds.setaProp("SET_RANDOM_STATE", 314);
    tCmds.setaProp("USER_START_TYPING", 317);
    tCmds.setaProp("USER_CANCEL_TYPING", 318);
    tCmds.setaProp("IGNOREUSER", 319);
    tCmds.setaProp("BANUSER", 320);
    tCmds.setaProp("GET_IGNORE_LIST", 321);
    tCmds.setaProp("UNIGNORE_USER", 322);
    tCmds.setaProp("CAN_CREATE_ROOMEVENT", 345);
    tCmds.setaProp("CREATE_ROOMEVENT", 346);
    tCmds.setaProp("QUIT_ROOMEVENT", 347);
    tCmds.setaProp("EDIT_ROOMEVENT", 348);
    tCmds.setaProp("GET_ROOMEVENT_TYPE_COUNT", 349);
    tCmds.setaProp("GET_ROOMEVENTS_BY_TYPE", 350);
    if (tBool) {
      registerListener(getVariable("connection.room.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.room.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.room.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.room.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
