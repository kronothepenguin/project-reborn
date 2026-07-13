export default class {
  pLastRoomForwardTimeStamp;

  construct() {
    this.pLastRoomForwardTimeStamp = 0;
    return this.regMsgList(1);
  }

  deconstruct() {
    this.pLastRoomForwardTimeStamp = 0;
    return this.regMsgList(0);
  }

  handle_flatinfo(tMsg) {
    const tConn = tMsg.connection;
    const tFlat = propList();
    tFlat[Symbol.for("ableothersmovefurniture")] = tConn.GetIntFrom();
    tFlat[Symbol.for("door")] = tConn.GetIntFrom();
    tFlat[Symbol.for("flatId")] = string(tConn.GetIntFrom());
    tFlat[Symbol.for("id")] = `f_${tFlat[Symbol.for("flatId")]}`;
    tFlat[Symbol.for("owner")] = tConn.GetStrFrom();
    tFlat[Symbol.for("marker")] = tConn.GetStrFrom();
    tFlat[Symbol.for("name")] = tConn.GetStrFrom();
    tFlat[Symbol.for("description")] = tConn.GetStrFrom();
    tFlat[Symbol.for("showownername")] = tConn.GetIntFrom();
    tFlat[Symbol.for("trading")] = tConn.GetIntFrom();
    tFlat[Symbol.for("alert")] = tConn.GetIntFrom();
    tFlat[Symbol.for("maxVisitors")] = tConn.GetIntFrom();
    tFlat[Symbol.for("absoluteMaxVisitors")] = tConn.GetIntFrom();
    tFlat[Symbol.for("nodeType")] = 2;
    switch (tFlat[Symbol.for("door")]) {
      case 0:
        tFlat[Symbol.for("door")] = "open";
        break;
      case 1:
        tFlat[Symbol.for("door")] = "closed";
        break;
      case 2:
        tFlat[Symbol.for("door")] = "password";
        break;
    }
    if (tFlat[Symbol.for("maxVisitors")] < 1) {
      tFlat[Symbol.for("maxVisitors")] = 25;
    }
    if (tFlat[Symbol.for("absoluteMaxVisitors")] < 1) {
      tFlat[Symbol.for("absoluteMaxVisitors")] = 50;
    }
    this.getComponent().updateSingleSubNodeInfo(tFlat);
    this.getComponent().getInfoBroker().processNavigatorData(tFlat);
    return 1;
  }

  handle_flat_results(tMsg) {
    const tResult = propList();
    const tList = propList();
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = TAB;
    const tContent = tMsg.content;
    for (let i = 1; i <= tContent.line.count; i++) {
      const tLine = tContent.line[i];
      if ((tLine.item.count > 0) && (tLine.item.count < 9)) {
        continue;
      }
      if (tLine == EMPTY) {
        break;
      }
      const tFlat = propList();
      tFlat[Symbol.for("id")] = `f_${tLine.item[1]}`;
      tFlat[Symbol.for("flatId")] = tLine.item[1];
      tFlat[Symbol.for("name")] = tLine.item[2];
      tFlat[Symbol.for("owner")] = tLine.item[3];
      tFlat[Symbol.for("door")] = tLine.item[4];
      tFlat[Symbol.for("port")] = tLine.item[5];
      tFlat[Symbol.for("usercount")] = tLine.item[6];
      tFlat[Symbol.for("maxUsers")] = tLine.item[7];
      tFlat[Symbol.for("Filter")] = tLine.item[8];
      tFlat[Symbol.for("description")] = tLine.item[9];
      tFlat[Symbol.for("nodeType")] = 2;
      tList[tFlat[Symbol.for("id")]] = tFlat;
    }
    tResult.addProp(Symbol.for("children"), tList);
    switch (tMsg.subject) {
      case 16:
        tResult[Symbol.for("id")] = Symbol.for("own");
        break;
      case 55:
        tResult[Symbol.for("id")] = Symbol.for("src");
        break;
    }
    the.itemDelimiter = tDelim;
    this.getComponent().saveNodeInfo(tResult);
  }

  handle_favouriteroomresults(tMsg) {
    const tConn = tMsg.connection;
    const tNodeMask = tConn.GetIntFrom();
    const tNodeId = tConn.GetIntFrom();
    const tNodeType = tConn.GetIntFrom();
    const tNodeInfo = propList(Symbol.for("id"), string(tNodeId), Symbol.for("nodeType"), tNodeType, Symbol.for("name"), tConn.GetStrFrom(), Symbol.for("usercount"), tConn.GetIntFrom(), Symbol.for("maxUsers"), tConn.GetIntFrom(), Symbol.for("parentid"), string(tConn.GetIntFrom()));
    const tResult = propList(Symbol.for("id"), Symbol.for("fav"), Symbol.for("children"), propList());
    if (tNodeType == 2) {
      tResult[Symbol.for("children")] = this.parseFlatCategoryNode(tMsg);
    }
    while (tConn != VOID) {
      const tNode = this.parseNode(tMsg);
      if (listp(tNode)) {
        tResult[Symbol.for("children")].addProp(tNode[Symbol.for("id")], tNode);
        continue;
      }
      break;
    }
    return this.getComponent().saveNodeInfo(tResult);
  }

  handle_noflatsforuser(tMsg) {
    this.getComponent().noflatsforuser();
  }

  handle_noflats(tMsg) {
    this.getComponent().noflats();
  }

  handle_flatpassword_ok(tMsg) {
    this.getComponent().flatAccessResult("flatpassword_ok");
  }

  handle_navnodeinfo(tMsg) {
    const tConn = tMsg.connection;
    const tCategoryIndex = propList();
    const tNodeMask = tConn.GetIntFrom();
    const tNodeInfo = this.parseNode(tMsg);
    if (tNodeInfo == 0) {
      return 0;
    }
    tNodeInfo.addProp(Symbol.for("nodeMask"), tNodeMask);
    const tCategoryId = tNodeInfo[Symbol.for("id")];
    tCategoryIndex.setaProp(tCategoryId, propList(Symbol.for("name"), tNodeInfo[Symbol.for("name")], Symbol.for("parentid"), tNodeInfo[Symbol.for("parentid")], Symbol.for("children"), []));
    while (tConn != VOID) {
      const tNode = this.parseNode(tMsg);
      if (tNode == 0) {
        break;
      }
      const tNodeId = tNode[Symbol.for("id")];
      const tParentId = tNode[Symbol.for("parentid")];
      if (tParentId == tCategoryId) {
        tNodeInfo[Symbol.for("children")].setaProp(tNodeId, tNode);
      }
      if (tCategoryIndex[tParentId] != 0) {
        tCategoryIndex[tParentId][Symbol.for("children")].add(tNodeId);
      }
      if ((tNode[Symbol.for("nodeType")] == 0) || ((tNode[Symbol.for("nodeType")] == 1) && (tCategoryIndex[tNodeId] == 0))) {
        tCategoryIndex.setaProp(tNodeId, propList(Symbol.for("name"), tNode[Symbol.for("name")], Symbol.for("parentid"), tParentId, Symbol.for("children"), []));
      }
    }
    this.getComponent().updateCategoryIndex(tCategoryIndex);
    this.getComponent().saveNodeInfo(tNodeInfo);
    this.getComponent().getInfoBroker().processNavigatorData(tNodeInfo);
    return 1;
  }

  handle_error(tMsg) {
    const tErr = tMsg.content;
    error(this, `${tMsg.connection.getID()}: ${tErr}`, Symbol.for("handle_error"), Symbol.for("dummy"));
    switch (tErr) {
      case "Only 10 favorite rooms allowed!":
      case "nav_error_toomanyfavrooms":
        executeMessage(Symbol.for("alert"), propList(Symbol.for("Msg"), getText("nav_error_toomanyfavrooms")));
        break;
    }
    return 1;
  }

  parseNode(tMsg) {
    const tConn = tMsg.connection;
    const tNodeId = tConn.GetIntFrom();
    if (tNodeId <= 0) {
      return 0;
    }
    const tNodeType = tConn.GetIntFrom();
    const tNodeInfo = propList(Symbol.for("id"), string(tNodeId), Symbol.for("nodeType"), tNodeType, Symbol.for("name"), tConn.GetStrFrom(), Symbol.for("usercount"), tConn.GetIntFrom(), Symbol.for("maxUsers"), tConn.GetIntFrom(), Symbol.for("parentid"), string(tConn.GetIntFrom()));
    switch (tNodeType) {
      case 0:
        tNodeInfo.addProp(Symbol.for("children"), propList());
        break;
      case 1:
        {
          tNodeInfo.addProp(Symbol.for("unitStrId"), tConn.GetStrFrom());
          tNodeInfo.addProp(Symbol.for("port"), tConn.GetIntFrom());
          tNodeInfo.addProp(Symbol.for("door"), tConn.GetIntFrom());
          const tCasts = tConn.GetStrFrom();
          tNodeInfo.addProp(Symbol.for("casts"), []);
          const tDelim = the.itemDelimiter;
          the.itemDelimiter = ",";
          for (let c = 1; c <= tCasts.item.count; c++) {
            tNodeInfo[Symbol.for("casts")].add(tCasts.item[c]);
          }
          the.itemDelimiter = tDelim;
          tNodeInfo.addProp(Symbol.for("usersInQueue"), tConn.GetIntFrom());
          tNodeInfo.addProp(Symbol.for("isVisible"), tConn.GetBoolFrom());
          break;
        }
      case 2:
        tNodeInfo[Symbol.for("nodeType")] = 0;
        {
          const tFlatList = this.parseFlatCategoryNode(tMsg);
          tNodeInfo.addProp(Symbol.for("children"), tFlatList);
        }
        break;
    }
    return tNodeInfo;
  }

  parseFlatCategoryNode(tMsg) {
    const tConn = tMsg.connection;
    const tFlatCount = tConn.GetIntFrom();
    const tFlatList = propList();
    for (let i = 1; i <= tFlatCount; i++) {
      const tFlatID = string(tConn.GetIntFrom());
      const tFlatInfo = propList();
      tFlatInfo[Symbol.for("id")] = `f_${tFlatID}`;
      tFlatInfo[Symbol.for("flatId")] = tFlatID;
      tFlatInfo[Symbol.for("name")] = tConn.GetStrFrom();
      tFlatInfo[Symbol.for("owner")] = tConn.GetStrFrom();
      tFlatInfo[Symbol.for("door")] = tConn.GetStrFrom();
      tFlatInfo[Symbol.for("usercount")] = tConn.GetIntFrom();
      tFlatInfo[Symbol.for("maxUsers")] = tConn.GetIntFrom();
      tFlatInfo[Symbol.for("description")] = tConn.GetStrFrom();
      tFlatInfo[Symbol.for("nodeType")] = 2;
      tFlatList.addProp(`f_${tFlatID}`, tFlatInfo);
    }
    return tFlatList;
  }

  handle_userflatcats(tMsg) {
    const tList = propList();
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tItemCount = tConn.GetIntFrom();
    for (let t = 1; t <= tItemCount; t++) {
      const tNodeId = tConn.GetIntFrom();
      const tNodeName = tConn.GetStrFrom();
      tList.addProp(string(tNodeId), tNodeName);
    }
    getObject(Symbol.for("session")).set("user_flat_cats", tList);
    return 1;
  }

  handle_flatcat(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tFlatID = tConn.GetIntFrom();
    const tCategoryId = tConn.GetIntFrom();
    this.getComponent().setNodeProperty(`f_${tFlatID}`, Symbol.for("parentid"), tCategoryId);
    executeMessage(Symbol.for("flatcat_received"), propList(Symbol.for("flatId"), tFlatID, Symbol.for("id"), `f_${tFlatID}`, Symbol.for("parentid"), tCategoryId));
    return 1;
  }

  handle_spacenodeusers(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tNodeId = string(tConn.GetIntFrom());
    const tUserCount = tConn.GetIntFrom();
    const tUserList = [];
    for (let i = 1; i <= tUserCount; i++) {
      tUserList.append(tConn.GetStrFrom());
    }
    this.getInterface().showSpaceNodeUsers(tNodeId, tUserList);
    return 1;
  }

  handle_cantconnect(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    let tError = tConn.GetIntFrom();
    executeMessage(Symbol.for("leaveRoom"));
    switch (tError) {
      case 1:
        tError = "nav_error_room_full";
        break;
      case 2:
        tError = "nav_error_room_closed";
        break;
      case 3:
        tError = `queue_set.${tConn.GetStrFrom()}.alert`;
        break;
      case 4:
        tError = "nav_room_banned";
        break;
    }
    return executeMessage(Symbol.for("alert"), propList(Symbol.for("id"), "nav_error", Symbol.for("Msg"), tError));
  }

  handle_success(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tMsgId = tConn.GetIntFrom();
    return 1;
  }

  handle_failure(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tMsgId = tConn.GetIntFrom();
    const tErrorTxt = tConn.GetStrFrom();
    if (tErrorTxt != EMPTY) {
      executeMessage(Symbol.for("alert"), propList(Symbol.for("Msg"), tErrorTxt));
    }
    return 1;
  }

  handle_parentchain(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    let tChildId = string(tConn.GetIntFrom());
    const tNodeName = tConn.GetStrFrom();
    const tCategoryIndex = propList();
    while (tConn != VOID) {
      let tID = tConn.GetIntFrom();
      if (tID <= 0) {
        break;
      }
      tID = string(tID);
      const tName = tConn.GetStrFrom();
      if (tCategoryIndex[tChildId] != VOID) {
        tCategoryIndex[tChildId].setaProp(Symbol.for("parentid"), tID);
      }
      tCategoryIndex.addProp(tID, propList(Symbol.for("name"), tName, Symbol.for("parentid"), tID, Symbol.for("children"), [tChildId]));
      tChildId = tID;
    }
    return this.getComponent().updateCategoryIndex(tCategoryIndex);
  }

  handle_roomforward(tMsg) {
    const tTimeSinceLast = the.milliSeconds - this.pLastRoomForwardTimeStamp;
    const tTimeout = getVariable("navigator.room.forward.timeout");
    if (tTimeSinceLast < tTimeout) {
      return 0;
    } else {
      this.pLastRoomForwardTimeStamp = the.milliSeconds;
    }
    const tConn = tMsg.connection;
    const tIsPublic = tConn.GetIntFrom();
    let tStrRoomType;
    if (tIsPublic > 0) {
      tStrRoomType = Symbol.for("public");
    } else {
      tStrRoomType = Symbol.for("private");
    }
    const tStrRoomId = string(tConn.GetIntFrom());
    return executeMessage(Symbol.for("roomForward"), tStrRoomId, tStrRoomType);
  }

  handle_recommended_room_list(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tNodeInfo = propList(Symbol.for("children"), propList(), Symbol.for("id"), Symbol.for("recom"));
    const tNumOfRooms = tConn.GetIntFrom();
    for (let tRoomNum = 1; tRoomNum <= tNumOfRooms; tRoomNum++) {
      if (tRoomNum > 3) {
        error(this, `Server is providing too many (${tNumOfRooms}) room recommendations`, Symbol.for("handle_recommended_room_list"), Symbol.for("minor"));
        break;
      }
      const tRoomData = propList();
      const tID = tConn.GetIntFrom();
      tRoomData.setaProp(Symbol.for("id"), `f_${tID}`);
      tRoomData.setaProp(Symbol.for("flatId"), tID);
      tRoomData.setaProp(Symbol.for("name"), tConn.GetStrFrom());
      tRoomData.setaProp(Symbol.for("owner"), tConn.GetStrFrom());
      tRoomData.setaProp(Symbol.for("door"), tConn.GetStrFrom());
      tRoomData.setaProp(Symbol.for("usercount"), tConn.GetIntFrom());
      tRoomData.setaProp(Symbol.for("maxUsers"), tConn.GetIntFrom());
      tRoomData.setaProp(Symbol.for("description"), tConn.GetStrFrom());
      tRoomData.setaProp(Symbol.for("nodeType"), 2);
      tNodeInfo[Symbol.for("children")].setaProp(tRoomData[Symbol.for("id")], tRoomData);
    }
    this.getComponent().saveRecomNodeInfo(tNodeInfo);
    return 1;
  }

  regMsgList(tBool) {
    const tMsgs = propList();
    tMsgs.setaProp(16, Symbol.for("handle_flat_results"));
    tMsgs.setaProp(33, Symbol.for("handle_error"));
    tMsgs.setaProp(54, Symbol.for("handle_flatinfo"));
    tMsgs.setaProp(55, Symbol.for("handle_flat_results"));
    tMsgs.setaProp(57, Symbol.for("handle_noflatsforuser"));
    tMsgs.setaProp(58, Symbol.for("handle_noflats"));
    tMsgs.setaProp(61, Symbol.for("handle_favouriteroomresults"));
    tMsgs.setaProp(130, Symbol.for("handle_flatpassword_ok"));
    tMsgs.setaProp(220, Symbol.for("handle_navnodeinfo"));
    tMsgs.setaProp(221, Symbol.for("handle_userflatcats"));
    tMsgs.setaProp(222, Symbol.for("handle_flatcat"));
    tMsgs.setaProp(223, Symbol.for("handle_spacenodeusers"));
    tMsgs.setaProp(224, Symbol.for("handle_cantconnect"));
    tMsgs.setaProp(225, Symbol.for("handle_success"));
    tMsgs.setaProp(226, Symbol.for("handle_failure"));
    tMsgs.setaProp(227, Symbol.for("handle_parentchain"));
    tMsgs.setaProp(286, Symbol.for("handle_roomforward"));
    tMsgs.setaProp(351, Symbol.for("handle_recommended_room_list"));
    const tCmds = propList();
    tCmds.setaProp("SBUSYF", 13);
    tCmds.setaProp("SUSERF", 16);
    tCmds.setaProp("SRCHF", 17);
    tCmds.setaProp("GETFVRF", 18);
    tCmds.setaProp("ADD_FAVORITE_ROOM", 19);
    tCmds.setaProp("DEL_FAVORITE_ROOM", 20);
    tCmds.setaProp("GETFLATINFO", 21);
    tCmds.setaProp("DELETEFLAT", 23);
    tCmds.setaProp("UPDATEFLAT", 24);
    tCmds.setaProp("SETFLATINFO", 25);
    tCmds.setaProp("NAVIGATE", 150);
    tCmds.setaProp("GETUSERFLATCATS", 151);
    tCmds.setaProp("GETFLATCAT", 152);
    tCmds.setaProp("SETFLATCAT", 153);
    tCmds.setaProp("GETSPACENODEUSERS", 154);
    tCmds.setaProp("REMOVEALLRIGHTS", 155);
    tCmds.setaProp("GETPARENTCHAIN", 156);
    tCmds.setaProp("GET_RECOMMENDED_ROOMS", 264);
    if (tBool) {
      registerListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), tCmds);
    }
    return 1;
  }
}
