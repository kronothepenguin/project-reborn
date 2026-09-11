export default class {
  pCryDataBase;

  construct() {
    this.pCryDataBase = propList();
    registerMessage(Symbol.for("sendCallForHelp"), this.getID(), Symbol.for("send_cryForHelp"));
    return 1;
  }

  deconstruct() {
    this.pCryDataBase = propList();
    unregisterMessage(Symbol.for("sendCallForHelp"), this.getID());
    return 1;
  }

  getPendingCFHs() {
    const tConnection = getConnection(getVariable("connection.info.id"));
    if (!tConnection) {
      error(this, "Connection not found.", Symbol.for("showDialog"), Symbol.for("major"));
    }
    tConnection.send("GET_PENDING_CALLS_FOR_HELP");
  }

  receive_cryforhelp(tMsg) {
    this.pCryDataBase[tMsg[Symbol.for("cry_id")]] = tMsg;
    this.getInterface().ShowAlert();
    this.getInterface().updateCryWnd();
    return 1;
  }

  receive_pickedCry(tMsg) {
    if (voidp(this.pCryDataBase[tMsg[Symbol.for("cry_id")]])) {
      return 0;
    }
    this.pCryDataBase[tMsg[Symbol.for("cry_id")]].picker = tMsg[Symbol.for("picker")];
    this.getInterface().updateCryWnd();
    return 1;
  }

  deleteCry(tID) {
    this.pCryDataBase.deleteProp(tID);
    if (this.pCryDataBase.count == 0) {
      this.getInterface().hideAlert();
    }
    this.getInterface().updateCryWnd();
    return 1;
  }

  send_changeCfhType(tCryID, tCategoryNum) {
    if (!connectionExists(getVariable("connection.info.id"))) {
      return 0;
    }
    let tNewCategory;
    if (tCategoryNum == 2) {
      tNewCategory = 1;
      executeMessage(Symbol.for("alert"), propList("Msg", "hobba_sent_to_moderators"));
    } else {
      if (tCategoryNum == 1) {
        tNewCategory = 2;
        executeMessage(Symbol.for("alert"), propList("Msg", "hobba_sent_to_helpers"));
      } else {
        return error(this, `Original category number illegal: ${tCategoryNum}`, Symbol.for("send_changeCfhType"), Symbol.for("major"));
      }
    }
    getConnection(getVariable("connection.info.id")).send("CHANGECALLCATEGORY", propList("string", tCryID, "integer", tNewCategory));
    return 1;
  }

  send_cryPick(tCryID, tGoHelp) {
    if (!connectionExists(getVariable("connection.info.id"))) {
      return 0;
    }
    getConnection(getVariable("connection.info.id")).send("PICK_CRYFORHELP", propList("string", tCryID));
    if (tGoHelp) {
      const tdata = this.pCryDataBase[tCryID].duplicate();
      if (voidp(tdata)) {
        return 0;
      }
      let tOk = 1;
      tOk = (tdata[Symbol.for("picker")].ilk == Symbol.for("string")) && tOk;
      tOk = (tdata[Symbol.for("url_id")].ilk == Symbol.for("string")) && tOk;
      tOk = (tdata[Symbol.for("roomname")].ilk == Symbol.for("string")) && tOk;
      tOk = (tdata[Symbol.for("cry_id")].ilk == Symbol.for("string")) && tOk;
      tOk = (tdata[Symbol.for("type")].ilk == Symbol.for("symbol")) && tOk;
      tOk = (tdata[Symbol.for("Msg")].ilk == Symbol.for("string")) && tOk;
      if (!tOk) {
        return error(this, "Invalid or missing data in saved help cry!", Symbol.for("send_cryPick"), Symbol.for("major"));
      }
      if (tdata[Symbol.for("room_id")] == 0) {
        tdata[Symbol.for("id")] = tdata[Symbol.for("roomname")];
      } else {
        tdata[Symbol.for("id")] = string(tdata[Symbol.for("room_id")]);
      }
      tdata[Symbol.for("name")] = tdata[Symbol.for("roomname")];
      if (tdata[Symbol.for("type")] == Symbol.for("private")) {
        tdata[Symbol.for("nodeType")] = 2;
        tdata[Symbol.for("flatId")] = tdata[Symbol.for("id")];
        tdata[Symbol.for("id")] = `f_${tdata[Symbol.for("id")]}`;
        tdata[Symbol.for("casts")] = getVariableValue("room.cast.private");
      } else {
        tdata[Symbol.for("nodeType")] = 1;
        tdata[Symbol.for("unitStrId")] = tdata[Symbol.for("roomname")];
        if (ilk(tdata[Symbol.for("casts")]) == Symbol.for("string")) {
          const tCasts = tdata[Symbol.for("casts")];
          tdata[Symbol.for("casts")] = list();
          const tDelim = the.itemDelimiter;
          the.itemDelimiter = ",";
          for (let c = 1; c <= tCasts.item.count; c++) {
            tdata[Symbol.for("casts")].add(tCasts.item[c]);
          }
          the.itemDelimiter = tDelim;
        }
      }
      executeMessage(Symbol.for("pickAndGoCFH"), tdata[Symbol.for("sender")]);
      getConnection(getVariable("connection.info.id")).send("FOLLOW_CRYFORHELP", propList("string", tCryID));
    }
    return 1;
  }

  send_cryForHelp(tMsg, ttype) {
    tMsg = replaceChars(tMsg, "/", SPACE);
    tMsg = replaceChunks(tMsg, RETURN, "<br>");
    tMsg = convertSpecialChars(tMsg, 1);
    let tSendType;
    if (ttype == Symbol.for("habbo_helpers")) {
      tSendType = 2;
    } else {
      if (ttype == Symbol.for("emergency")) {
        tSendType = 1;
      } else {
        return error(this, "Illegal type for CFH!", Symbol.for("send_cryForHelp"), Symbol.for("major"));
      }
    }
    const tPropList = propList("string", tMsg, "integer", tSendType);
    if (connectionExists(getVariable("connection.room.id"))) {
      return getConnection(getVariable("connection.room.id")).send("CALL_FOR_HELP", tPropList);
    } else {
      return error(this, "Failed to access room connection!", Symbol.for("send_cryForHelp"), Symbol.for("major"));
    }
  }

  send_CfhReply(tCryID, tMsg) {
    if (!connectionExists(getVariable("connection.info.id"))) {
      return 0;
    }
    let tCharsCounted = 0;
    for (let i = 1; i <= tMsg.char.count; i++) {
      tCharsCounted = tCharsCounted + 1;
      if ((tCharsCounted > 45) && (tMsg.char[i] == SPACE)) {
        putInto(tMsg.char[i], "<br>");
        tCharsCounted = 0;
      }
    }
    tMsg = replaceChunks(tMsg, RETURN, "<br>");
    tMsg = convertSpecialChars(tMsg, 1);
    getConnection(getVariable("connection.info.id")).send("MESSAGETOCALLER", propList("string", tCryID, "string", tMsg));
    return 1;
  }

  getCryDataBase() {
    return this.pCryDataBase;
  }

  clearCryDataBase() {
    this.pCryDataBase = propList();
    return 1;
  }
}
