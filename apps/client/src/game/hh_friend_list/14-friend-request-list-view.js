export default class {
  pListImg;
  pWriterIdPlain;
  pContentList;
  pItemHeight;
  pItemWidth;
  pEmptyListText;

  construct() {
    this.pSelectedFriendID = VOID;
    this.pContentList = propList();
    this.pContentList.sort();
    this.pWriterIdPlain = getUniqueID();
    const tPlain = getStructVariable("struct.font.plain");
    const tMetrics = [Symbol.for("font"): tPlain.getaProp(Symbol.for("font")), Symbol.for("fontStyle"): tPlain.getaProp(Symbol.for("fontStyle")), Symbol.for("color"): rgb("#111111")];
    createWriter(this.pWriterIdPlain, tMetrics);
    this.pItemHeight = integer(getVariable("fr.requests.item.height"));
    this.pItemWidth = integer(getVariable("fr.list.panel.width"));
    this.pListImg = image(this.pItemWidth, 0, 32);
    this.pEmptyListText = getText("friend_list_no_requests");
  }

  deconstruct() {
    this.pListImg = VOID;
    removeWriter(this.pWriterIdPlain);
  }

  setListData(tdata) {
    this.pContentList = propList();
    this.pContentList.sort();
    for (let tNo = 1; tNo <= tdata.count; tNo++) {
      const tRequest = tdata[tNo];
      const tRequestId = string(tRequest[Symbol.for("id")]);
      this.pContentList[tRequestId] = tRequest;
    }
  }

  cleanUp() {
    const tNewList = propList();
    tNewList.sort();
    for (let tIndex = 1; tIndex <= this.pContentList.count; tIndex++) {
      const tRequest = this.pContentList[tIndex];
      if (tRequest[Symbol.for("state")] == Symbol.for("pending")) {
        tNewList[tRequest[Symbol.for("id")]] = tRequest;
      }
    }
    this.setListData(tNewList.duplicate());
    this.pListImg = image(this.pItemWidth, 0, 32);
    for (let tIndex = 1; tIndex <= tNewList.count; tIndex++) {
      const tRequest = tNewList[tIndex];
      const tRequestId = string(tRequest[Symbol.for("id")]);
      const tPosV = (tIndex - 1) * this.pItemHeight;
      const tRequestImg = this.renderRequestItem(tRequest);
      this.pListImg = this.insertImageTo(tRequestImg, this.pListImg.duplicate(), tPosV);
    }
  }

  addRequest(tRequest) {
    if (ilk(tRequest) != Symbol.for("propList")) {
      return 0;
    }
    const tRequestId = string(tRequest[Symbol.for("id")]);
    this.pContentList[tRequestId] = tRequest;
    const tIndex = this.pContentList.findPos(tRequestId);
    const tPosV = (tIndex - 1) * this.pItemHeight;
    const tRequestImg = this.renderRequestItem(tRequest);
    this.pListImg = this.insertImageTo(tRequestImg, this.pListImg.duplicate(), tPosV);
  }

  handleRequestState(tRequestId, tstate) {
    if (this.pContentList.findPos(tRequestId) == VOID) {
      return 0;
    }
    const tRequest = this.pContentList[string(tRequestId)];
    tRequest[Symbol.for("state")] = tstate;
    this.pContentList[tRequestId] = tRequest;
    const tIndex = this.pContentList.findPos(tRequestId);
    const tPosV = (tIndex - 1) * this.pItemHeight;
    const tRequestImg = this.renderRequestItem(tRequest);
    this.pListImg = this.updateImagePart(tRequestImg, this.pListImg.duplicate(), tPosV);
  }

  handleAll(tstate) {
    for (let tIndex = 1; tIndex <= this.pContentList.count; tIndex++) {
      const tRequest = this.pContentList[tIndex];
      if (tRequest[Symbol.for("state")] == Symbol.for("pending")) {
        tRequest[Symbol.for("state")] = tstate;
        this.pContentList[string(tRequest[Symbol.for("id")])] = tRequest;
        const tPosV = (tIndex - 1) * this.pItemHeight;
        const tRequestImg = this.renderRequestItem(tRequest);
        this.pListImg = this.updateImagePart(tRequestImg, this.pListImg.duplicate(), tPosV);
      }
    }
  }

  renderRequestItem(tRequestData) {
    const tNameWriter = getWriter(this.pWriterIdPlain);
    const tItemImg = image(this.pItemWidth, this.pItemHeight, 32);
    const tName = tRequestData[Symbol.for("name")];
    const tNameImg = tNameWriter.render(tName);
    let tSourceRect = tNameImg.rect;
    const tNamePosH = integer(getVariable("fr.requests.name.offset.h"));
    const tNamePosV = (this.pItemHeight - tNameImg.height) / 2;
    let tdestrect = tSourceRect + rect(tNamePosH, tNamePosV, tNamePosH, tNamePosV);
    tItemImg.copyPixels(tNameImg, tdestrect, tSourceRect);
    switch (tRequestData[Symbol.for("state")]) {
      case Symbol.for("pending"):
        {
          const tAcceptIconImg = getMember(getVariable("fr.requests.accept.icon")).image;
          const tAcceptIconRect = tAcceptIconImg.rect;
          const tAcceptIconPosH = integer(getVariable("fr.requests.accept.offset.h"));
          const tAcceptIconPosV = (this.pItemHeight - tAcceptIconImg.height) / 2;
          tdestrect = tAcceptIconRect + rect(tAcceptIconPosH, tAcceptIconPosV, tAcceptIconPosH, tAcceptIconPosV);
          tItemImg.copyPixels(tAcceptIconImg, tdestrect, tAcceptIconRect, [Symbol.for("ink"): 36]);
          const tRejectIconImg = getMember(getVariable("fr.requests.reject.icon")).image;
          const tRejectIconRect = tAcceptIconImg.rect;
          const tRejectIconPosH = integer(getVariable("fr.requests.reject.offset.h"));
          const tRejectIconPosV = (this.pItemHeight - tRejectIconImg.height) / 2;
          tdestrect = tRejectIconRect + rect(tRejectIconPosH, tRejectIconPosV, tRejectIconPosH, tRejectIconPosV);
          tItemImg.copyPixels(tRejectIconImg, tdestrect, tRejectIconRect, [Symbol.for("ink"): 36]);
          break;
        }
      case Symbol.for("accepted"):
        {
          const tImg = tNameWriter.render(getText("friend_request_accepted"));
          tSourceRect = tNameImg.rect;
          const tMargin = integer(getVariable("fr.requests.status.margin.h"));
          const tPosH = this.pItemWidth - (tImg.width + tMargin);
          const tPosV = (this.pItemHeight - tImg.height) / 2;
          tdestrect = tSourceRect + rect(tPosH, tPosV, tPosH, tPosV);
          tItemImg.copyPixels(tImg, tdestrect, tImg.rect);
          break;
        }
      case Symbol.for("rejected"):
        {
          const tImg = tNameWriter.render(getText("friend_request_declined"));
          tSourceRect = tNameImg.rect;
          const tMargin = integer(getVariable("fr.requests.status.margin.h"));
          const tPosH = this.pItemWidth - (tImg.width + tMargin);
          const tPosV = (this.pItemHeight - tImg.height) / 2;
          tdestrect = tSourceRect + rect(tPosH, tPosV, tPosH, tPosV);
          tItemImg.copyPixels(tImg, tdestrect, tImg.rect);
          break;
        }
      case Symbol.for("error"):
        {
          const tImg = tNameWriter.render(getText("friend_request_failed"));
          tSourceRect = tNameImg.rect;
          const tMargin = integer(getVariable("fr.requests.status.margin.h"));
          const tPosH = this.pItemWidth - (tImg.width + tMargin);
          const tPosV = (this.pItemHeight - tImg.height) / 2;
          tdestrect = tSourceRect + rect(tPosH, tPosV, tPosH, tPosV);
          tItemImg.copyPixels(tImg, tdestrect, tImg.rect);
          break;
        }
    }
    return tItemImg.duplicate();
  }

  renderBackgroundImage() {
    if (ilk(this.pContentList) != Symbol.for("propList")) {
      return image(1, 1, 32);
    }
    if (this.pContentList.count == 0) {
      return image(1, 1, 32);
    }
    const tDarkBg = rgb(string(getVariable("fr.requests.bg.dark")));
    this.pItemHeight = integer(getVariable("fr.requests.item.height"));
    this.pItemWidth = integer(getVariable("fr.list.panel.width"));
    const tImage = image(this.pItemWidth, this.pContentList.count * this.pItemHeight, 32);
    let tCurrentPosV = 0;
    for (let tIndex = 1; tIndex <= (this.pContentList.count / 2) + 1; tIndex++) {
      tImage.fill(0, tCurrentPosV, this.pItemWidth, tCurrentPosV + this.pItemHeight, tDarkBg);
      tCurrentPosV = tCurrentPosV + (this.pItemHeight * 2);
    }
    return tImage;
  }

  relayEvent(tEvent, tLocX, tLocY) {
    const tListIndex = (tLocY / this.pItemHeight) + 1;
    const tEventResult = propList();
    tEventResult[Symbol.for("event")] = tEvent;
    if (tEvent == Symbol.for("mouseWithin")) {
      return tEventResult;
    }
    if (tListIndex > this.pContentList.count) {
      nothing();
      tEventResult[Symbol.for("cursor")] = "cursor.arrow";
    } else {
      const tRequest = this.pContentList[tListIndex];
      tEventResult[Symbol.for("request")] = tRequest;
      if ((tLocX > integer(getVariable("fr.requests.reject.offset.h"))) && (tRequest[Symbol.for("state")] == Symbol.for("pending"))) {
        tEventResult[Symbol.for("element")] = Symbol.for("request_reject");
        tEventResult[Symbol.for("update")] = 1;
        tEventResult[Symbol.for("cursor")] = "cursor.finger";
        this.handleRequestState(tRequest[Symbol.for("id")], Symbol.for("rejected"));
      } else {
        if ((tLocX > integer(getVariable("fr.requests.accept.offset.h"))) && (tRequest[Symbol.for("state")] == Symbol.for("pending"))) {
          if (threadExists(Symbol.for("friend_list"))) {
            const tComponent = getThread(Symbol.for("friend_list")).getComponent();
            if (tComponent.isFriendListFull()) {
              executeMessage(Symbol.for("alert"), "console_fr_limit_exceeded_error");
              return 0;
            }
            tEventResult[Symbol.for("element")] = Symbol.for("request_accept");
            tEventResult[Symbol.for("update")] = 1;
            this.handleRequestState(tRequest[Symbol.for("id")], Symbol.for("accepted"));
          }
        } else {
          tEventResult[Symbol.for("element")] = Symbol.for("name");
        }
      }
    }
    return tEventResult;
  }
}
