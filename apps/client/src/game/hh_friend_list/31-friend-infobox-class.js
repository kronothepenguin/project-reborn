export default class {
  pBubbleObjectId;
  pBubbleWindowId;
  pPopupTimeoutId;
  pCurrentFriendId;
  pFriendInfo;
  pTargetRect;

  construct() {
    this.pBubbleObjectId = "fr_popup_bubble_obj";
    this.pBubbleWindowId = "fr_popup_bubble_win";
    this.pPopupTimeoutId = "fr_popup_timer";
    return 1;
  }

  deconstruct() {
    this.removePopupTimeout();
    this.removeBubbleObject();
    this.pFriendInfo = VOID;
    return 1;
  }

  showInfoPopup(tEventData, tWndX, tWndY, tContentElem) {
    if (!listp(tEventData)) {
      return this.removePopupTimeout();
    }
    const tFriend = tEventData.getaProp(Symbol.for("friend"));
    if (!listp(tFriend)) {
      return this.removePopupTimeout();
    }
    if (tContentElem == 0) {
      return this.removePopupTimeout();
    }
    const tFriendID = tFriend.getaProp(Symbol.for("id"));
    if (tFriendID == this.pCurrentFriendId) {
      return 1;
    }
    const tItemHeight = tEventData.getaProp(Symbol.for("item_height"));
    const tWidth = tContentElem.getProperty(Symbol.for("width"));
    const tElementLocX = tWndX + tContentElem.getProperty(Symbol.for("locX"));
    const tsprite = tContentElem.getProperty(Symbol.for("sprite"));
    if (tsprite.ilk != Symbol.for("sprite")) {
      return 0;
    }
    const tItemY = tsprite.locV + tEventData.getaProp(Symbol.for("item_y"));
    this.pTargetRect = rect(tElementLocX, tItemY, tElementLocX + tWidth, tItemY + tItemHeight);
    this.pCurrentFriendId = tFriendID;
    this.pFriendInfo = tFriend.duplicate();
    this.removeBubbleObject();
    this.createDetailsBubble(this.pTargetRect);
  }

  removeInfoPopup() {
    this.removePopupTimeout();
    this.removeBubbleObject();
    this.pFriendInfo = VOID;
    this.pCurrentFriendId = VOID;
  }

  createDetailsBubble(tTargetRect) {
    if (this.pFriendInfo == VOID) {
      return 0;
    }
    createObject(this.pBubbleObjectId, "Details Bubble Class");
    const tDetailsBubble = getObject(this.pBubbleObjectId);
    if (tDetailsBubble == 0) {
      return 0;
    }
    tDetailsBubble.createWithContent("friendlist_userinfo.window", tTargetRect, Symbol.for("right"));
    const tDetailsWindow = tDetailsBubble.getWindowObj();
    if (tDetailsWindow == 0) {
      return 0;
    }
    const tName = this.pFriendInfo.getaProp(Symbol.for("name"));
    const tFigure = this.pFriendInfo.getaProp(Symbol.for("figure"));
    const tsex = this.pFriendInfo.getaProp(Symbol.for("sex"));
    const tOnline = this.pFriendInfo.getaProp(Symbol.for("online"));
    let tElem = tDetailsWindow.getElement("user.info.image");
    if ((tElem != 0) && stringp(tFigure)) {
      const tElemWidth = tElem.getProperty(Symbol.for("width"));
      const tElemHeight = tElem.getProperty(Symbol.for("height"));
      const tHeadImage = this.getHumanImage(tFigure, tsex, tElemWidth, tElemHeight);
      if (tHeadImage.ilk == Symbol.for("image")) {
        tElem.feedImage(tHeadImage);
      }
    }
    tElem = tDetailsWindow.getElement("user.info.name");
    if (tElem != 0) {
      tElem.setText(this.pFriendInfo.getaProp(Symbol.for("name")));
    }
    tElem = tDetailsWindow.getElement("user.info.motto");
    if (tElem != 0) {
      tElem.setText(this.pFriendInfo.getaProp(Symbol.for("mission")));
    }
    tElem = tDetailsWindow.getElement("user.info.loc");
    if (tElem != 0) {
      if (tOnline) {
        tElem.setText(getText("friend_info_online"));
      } else {
        tElem.setText(`${getText("friend_info_lastvisit")} ${this.pFriendInfo.getaProp(Symbol.for("lastAccess"))}`);
      }
    }
  }

  removePopupTimeout() {
    if (timeoutExists(this.pPopupTimeoutId)) {
      removeTimeout(this.pPopupTimeoutId);
    }
  }

  getBubbleObject() {
    if (!objectExists(this.pBubbleObjectId)) {
      createObject(this.pBubbleObjectId, "Details Bubble Class");
    }
    return getObject(this.pBubbleObjectId);
  }

  removeBubbleObject() {
    if (objectExists(this.pBubbleObjectId)) {
      removeObject(this.pBubbleObjectId);
    }
    if (windowExists(this.pBubbleWindowId)) {
      removeWindow(this.pBubbleWindowId);
    }
  }

  getHumanImage(tFigure, tsex, tWidth, tHeight) {
    const tParserObj = getObject("Figure_System");
    if (tParserObj == 0) {
      return 0;
    }
    const tPreviewObj = getObject("Figure_Preview");
    if (tPreviewObj == 0) {
      return 0;
    }
    const tParsedFigure = tParserObj.parseFigure(tFigure, tsex, "user");
    let tImage = tPreviewObj.getHumanPartImg(Symbol.for("head"), tParsedFigure, 2, "sh");
    tImage = this.alignIconImage(tImage, tWidth, tHeight);
    tImage = this.alignIconImage(tImage, tWidth, tHeight);
    return tImage;
  }

  alignIconImage(tImage, tWidth, tHeight) {
    if (tImage.ilk != Symbol.for("image")) {
      return 0;
    }
    const tNewImage = image(tWidth, tHeight, tImage.depth);
    const tOffsetX = (tWidth - tImage.width) / 2;
    const tOffsetY = 0;
    tNewImage.copyPixels(tImage, tImage.rect + rect(tOffsetX, tOffsetY, tOffsetX, tOffsetY), tImage.rect);
    return tNewImage;
  }
}
