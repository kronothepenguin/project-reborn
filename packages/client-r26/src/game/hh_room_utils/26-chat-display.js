export default class {
  pActiveItemList;
  pFreeChatItemList;
  pMarginFromScreenTop;
  pBalloonsVisible;
  pAutoScrollOn;
  pAutoScrollAmountPx;
  pAutoScrolledNow;
  pScrollDelayTime;
  pScrollDelayStartTime;
  pMessageBuffer;
  pUserCache;
  pChatItemCount;
  pMaximumChatBufferSize;
  pSpeedUpChatBufferLim;
  pForceScrollAmount;
  pScrollSpdMultiplier;

  construct() {
    this.pActiveItemList = list();
    this.pFreeChatItemList = list();
    this.pMarginFromScreenTop = 108;
    this.pBalloonsVisible = 1;
    this.pAutoScrollAmountPx = 18;
    this.pAutoScrollOn = 0;
    this.pScrollDelayTime = getVariableValue("chat.scroll.delay", 5000);
    this.pAutoScrolledNow = 0;
    this.pChatItemCount = 0;
    this.pMaximumChatBufferSize = 7;
    if (variableExists("chat.buffersize.maximum")) {
      getVariableValue("chat.buffersize.maximum");
    }
    this.pSpeedUpChatBufferLim = 2;
    if (variableExists("chat.buffersize.speedup")) {
      getVariableValue("chat.buffersize.speedup");
    }
    this.pScrollSpdMultiplier = 1.0;
    this.pMessageBuffer = list();
    this.pUserCache = list();
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("startUpdate"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("clearAll"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("clearAll"));
    registerMessage(Symbol.for("startChatDisplay"), this.getID(), Symbol.for("startUpdate"));
    registerMessage(Symbol.for("showChatMessage"), this.getID(), Symbol.for("insertChatMessage"));
    registerMessage(Symbol.for("showObjectMessage"), this.getID(), Symbol.for("insertObjectMessage"));
    registerMessage(Symbol.for("showCustomMessage"), this.getID(), Symbol.for("insertCustomMessage"));
  }

  deconstruct() {
    this.clearAll();
    unregisterMessage(Symbol.for("enterRoom"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    unregisterMessage(Symbol.for("startChatDisplay"), this.getID());
    unregisterMessage(Symbol.for("showChatMessage"), this.getID());
    unregisterMessage(Symbol.for("showObjectMessage"), this.getID());
    unregisterMessage(Symbol.for("showCustomMessage"), this.getID());
  }

  startUpdate() {
    receiveUpdate(this.getID());
  }

  clearAll() {
    this.pMessageBuffer = list();
    for (const tItem of this.pActiveItemList) {
      tItem.deconstruct();
    }
    this.pActiveItemList = list();
    for (const tItem of this.pFreeChatItemList) {
      tItem.deconstruct();
    }
    this.pFreeChatItemList = list();
    this.clearUserCache();
    this.pChatItemCount = 0;
  }

  showBalloons(tVisible) {
    if (voidp(tVisible)) {
      tVisible = 1;
    }
    this.pShowBalloons = tVisible;
    call(Symbol.for("showBalloon"), this.pActiveItemList, tVisible);
    call(Symbol.for("showBalloon"), this.pFreeChatItemList, tVisible);
  }

  insertObjectMessage(tMsgProps) {
    this.insertChatMessage(tMsgProps[Symbol.for("command")], tMsgProps[Symbol.for("id")], tMsgProps[Symbol.for("message")]);
  }

  insertCustomMessage(tMsgProps) {
    if (tMsgProps.findPos(Symbol.for("mode")) == 0) {
      tMsgProps.setaProp(Symbol.for("mode"), "CUSTOM");
    }
    this.pMessageBuffer.add(tMsgProps);
  }

  insertChatMessage(tChatMode, tID, tChatMessage) {
    switch (tChatMode) {
      case "CHAT":
      case "SHOUT":
      case "WHISPER":
      case "OBJECT":
        this.pMessageBuffer.add(propList("mode", tChatMode, "id", tID, "message", tChatMessage));
        break;
      case "UNHEARD":
        this.showChatItemUnheard(tID);
        break;
    }
  }

  showNextChatMessage() {
    if (this.pMessageBuffer.count == 0) {
      return 0;
    }
    let tMessage = this.pMessageBuffer[1];
    this.pMessageBuffer.deleteAt(1);
    let tloc = VOID;
    if (tMessage.findPos(Symbol.for("loc")) > 0) {
      tloc = tMessage.getaProp(Symbol.for("loc"));
    } else {
      if (tMessage.findPos(Symbol.for("id")) > 0) {
        if (tMessage[Symbol.for("mode")] == "OBJECT") {
          let tObj = getThread(Symbol.for("room")).getComponent().getActiveObject(tMessage[Symbol.for("id")]);
          if (!(tObj == 0)) {
            tloc = tObj.getScreenLocation();
          }
        } else {
          let tObj2 = getThread(Symbol.for("room")).getComponent().getUserObject(tMessage[Symbol.for("id")]);
          if (!(tObj2 == 0)) {
            tloc = tObj2.getPartLocation("hd");
          }
        }
      }
    }
    if (voidp(tloc)) {
      return 0;
    }
    tloc = point(tloc[1], this.pMarginFromScreenTop);
    let tMode = tMessage.getaProp(Symbol.for("mode"));
    let tChatItem = 0;
    switch (tMode) {
      case "CUSTOM":
        tChatItem = this.getCustomItem(tMessage);
        break;
      default:
        tChatItem = this.getChatItem(tMessage[Symbol.for("mode")], tMessage[Symbol.for("id")], tMessage[Symbol.for("message")]);
        break;
    }
    if (tChatItem == 0) {
      return 0;
    }
    tChatItem.setLocation(tloc);
  }

  getChatItem(tChatMode, tObjID, tChatMessage) {
    let tChatItem = 0;
    let tItemID = 0;
    if (this.pFreeChatItemList.count == 0) {
      tChatItem = createObject(Symbol.for("random"), "Chat Bubble Normal");
      this.pChatItemCount = this.pChatItemCount + 1;
      tItemID = this.pChatItemCount;
    } else {
      tChatItem = this.pFreeChatItemList[1];
      this.pFreeChatItemList.deleteAt(1);
      tItemID = tChatItem.getItemId();
    }
    let tUserID = VOID;
    let tBalloonColor;
    let tUserName = "";
    let tUserImg = VOID;
    let tSourceLoc;
    if (tChatMode == "OBJECT") {
      let tObj = getThread(Symbol.for("room")).getComponent().getActiveObject(tObjID);
      if (!tObj) {
        return 0;
      }
      tBalloonColor = rgb(232, 177, 55);
      let tObjInfo = tObj.getInfo();
      tUserName = tObjInfo[Symbol.for("name")];
      tUserImg = VOID;
      tSourceLoc = tObj.getScreenLocation();
    } else {
      let tUserObj = getThread(Symbol.for("room")).getComponent().getUserObject(tObjID);
      if (!tUserObj) {
        return 0;
      }
      if (tUserObj.getClass() == "pet") {
        tBalloonColor = tUserObj.getPartColor("hd");
        if (ilk(tBalloonColor) != Symbol.for("color")) {
          tBalloonColor = rgb(232, 177, 55);
        }
        tUserName = tUserObj.getInfo().getaProp(Symbol.for("name"));
        tUserImg = VOID;
      } else {
        tBalloonColor = tUserObj.getPartColor("ch");
        if (ilk(tBalloonColor) != Symbol.for("color")) {
          tBalloonColor = rgb(232, 177, 55);
        }
        tUserName = tUserObj.getInfo().getaProp(Symbol.for("name"));
        if (objectExists("Figure_Preview")) {
          let tPartList = tUserObj.pPartListSubSet[Symbol.for("head")];
          let tFigure = tUserObj.getRawFigure();
          tUserImg = getObject("Figure_Preview").getHumanPartImg(tPartList, tFigure, 2, "sh");
        }
        tUserID = tObjID;
      }
      tSourceLoc = tUserObj.getScrLocation();
    }
    tChatItem.defineBalloon(tChatMode, tBalloonColor, tUserName, tChatMessage, tItemID, tUserImg, tUserID, tSourceLoc);
    this.pActiveItemList.add(tChatItem);
    return tChatItem;
  }

  getCustomItem(tMessage) {
    let tClass;
    if (tMessage.findPos(Symbol.for("class")) > 0) {
      tClass = list("Chat Bubble Info Basic", tMessage.getaProp(Symbol.for("class")));
    } else {
      tClass = "Chat Bubble Info Basic";
    }
    let tChatItem = createObject(Symbol.for("random"), tClass);
    if (tChatItem == 0) {
      return 0;
    }
    this.pChatItemCount = this.pChatItemCount + 1;
    let tItemID = this.pChatItemCount;
    let tMode = tMessage[Symbol.for("mode")];
    let tSourceLoc = tMessage.getaProp(Symbol.for("loc"));
    let tBalloonColor = tMessage.getaProp(Symbol.for("color"));
    let tText = tMessage.getaProp(Symbol.for("message"));
    tChatItem.defineBalloon(tMode, tBalloonColor, tText, tItemID, tSourceLoc);
    this.pActiveItemList.add(tChatItem);
    return tChatItem;
  }

  clearUserCache() {
    for (const tUserName of this.pUserCache) {
      let tUserMemName = `chat_item_user_${tUserName}`;
      if (memberExists(tUserMemName)) {
        removeMember(tUserMemName);
      }
    }
  }

  showChatItemUnheard(tRoomUserId) {
    let tChatItem = createObject(Symbol.for("random"), "Chat Bubble Unheard");
    tChatItem.define(tRoomUserId);
  }

  moveAllItemsUpBy(tAmount) {
    for (let tItemNo = 1; tItemNo <= this.pActiveItemList.count; tItemNo++) {
      let tItem = this.pActiveItemList[tItemNo];
      let tLocV = tItem.moveVerticallyBy(tAmount);
      if (tLocV < -50) {
        this.pActiveItemList.deleteAt(tItemNo);
        if (tItem.handler(Symbol.for("getType"))) {
          if (tItem.getType() == "NORMAL") {
            this.pFreeChatItemList.add(tItem);
          } else {
            tItem.deconstruct();
          }
          continue;
        }
        tItem.deconstruct();
      }
    }
  }

  getLowestBalloonLocV() {
    let tLowestPoint = 0;
    for (const tItem of this.pActiveItemList) {
      let tItemLoc = tItem.getLowPoint();
      if (tItemLoc > tLowestPoint) {
        tLowestPoint = tItemLoc;
      }
    }
    return tLowestPoint;
  }

  update() {
    if ((this.pActiveItemList.count == 0) && (this.pMessageBuffer.count == 0)) {
      return 0;
    }
    if (this.pMessageBuffer.count > this.pSpeedUpChatBufferLim) {
      this.pScrollSpdMultiplier = 1.0 + (float(this.pMessageBuffer.count - this.pSpeedUpChatBufferLim) * 0.5);
    } else {
      this.pScrollSpdMultiplier = 1.0;
    }
    if (this.pAutoScrollOn) {
      let tOffV = integer(3.0 * this.pScrollSpdMultiplier);
      if ((tOffV + this.pAutoScrolledNow) > this.pAutoScrollAmountPx) {
        tOffV = this.pAutoScrollAmountPx - this.pAutoScrolledNow;
      }
      this.pAutoScrolledNow = this.pAutoScrolledNow + tOffV;
      this.moveAllItemsUpBy(-1 * tOffV);
      if (this.pAutoScrolledNow >= this.pAutoScrollAmountPx) {
        this.pAutoScrolledNow = 0;
        this.pAutoScrollOn = 0;
        this.pScrollDelayStartTime = the.milliSeconds;
      }
    } else {
      if (this.pMessageBuffer.count > 0) {
        let tSpaceAvailable = 0;
        if (this.pActiveItemList.count > 0) {
          if (this.getLowestBalloonLocV() <= (this.pMarginFromScreenTop - this.pAutoScrollAmountPx)) {
            tSpaceAvailable = 1;
          } else {
            tSpaceAvailable = 0;
          }
        } else {
          tSpaceAvailable = 1;
        }
        if (!tSpaceAvailable && (this.pMessageBuffer.count > this.pMaximumChatBufferSize)) {
          let tCount = this.pMessageBuffer.count;
          for (let k = 1; k <= tCount - this.pMaximumChatBufferSize; k++) {
            this.moveAllItemsUpBy(-1 * this.pAutoScrollAmountPx);
            if (k != 1) {
              this.showNextChatMessage();
            }
          }
          tSpaceAvailable = 1;
        }
        if (tSpaceAvailable) {
          this.pAutoScrollOn = 0;
          this.pScrollDelayStartTime = the.milliSeconds;
          this.showNextChatMessage();
        } else {
          this.pAutoScrollOn = 1;
        }
      } else {
        let tMillis = the.milliSeconds;
        let tTimeDiff = tMillis - this.pScrollDelayStartTime;
        if (tTimeDiff >= this.pScrollDelayTime) {
          this.pAutoScrollOn = 1;
        }
      }
    }
  }
}
