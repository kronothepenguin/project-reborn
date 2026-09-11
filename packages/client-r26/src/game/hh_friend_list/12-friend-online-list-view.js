export default class {
  pListImg;
  pWriterIdPlain;
  pContentList;
  pItemHeight;
  pItemWidth;
  pEmptyListText;

  construct() {
    this.pListImg = image(1, 1, 32);
    this.pListImg = member("friends_requests").image;
    this.pContentList = propList();
    this.pContentList.sort();
    this.pWriterIdPlain = getUniqueID();
    createWriter(this.pWriterIdPlain, getStructVariable("struct.font.plain"));
    this.pItemHeight = integer(getVariable("fr.online.item.height"));
    this.pItemWidth = integer(getVariable("fr.list.panel.width"));
    this.pEmptyListText = getText("friend_list_no_friends_online_category");
  }

  deconstruct() {
    this.pListImg = VOID;
    removeWriter(this.pWriterIdPlain);
  }

  setListData(tdata) {
    if (ilk(tdata) == Symbol.for("propList")) {
      this.pContentList = tdata.duplicate();
      this.renderListImage();
    }
  }

  renderFriendItem(tFriendData, tSelected) {
    const tNameWriter = getWriter(this.pWriterIdPlain);
    const tFigureParser = getObject("Figure_System");
    const tPreviewObj = getObject("Figure_Preview");
    const tItemImg = image(this.pItemWidth, this.pItemHeight, 32);
    const tName = tFriendData[Symbol.for("name")];
    if (tSelected) {
      const tSelectedBg = rgb(string(getVariable("fr.offline.bg.selected")));
      tItemImg.fill(0, 0, this.pItemWidth, this.pItemHeight, tSelectedBg);
    }
    const tFacePosH = integer(getVariable("fr.online.face.offset.h"));
    const tParsedFigure = tFigureParser.parseFigure(tFriendData[Symbol.for("figure")], tFriendData[Symbol.for("sex")], "user");
    const tHeadImage = tPreviewObj.getHumanPartImg(Symbol.for("head"), tParsedFigure, 2, "sh");
    let tSourceRect = tHeadImage.rect;
    const tFacePosV = (this.pItemHeight - tHeadImage.height) / 2;
    let tdestrect = tSourceRect + rect(tFacePosH, tFacePosV, tFacePosH, tFacePosV);
    tItemImg.copyPixels(tHeadImage, tdestrect, tSourceRect, [Symbol.for("ink"): 36]);
    const tNamePosH = integer(getVariable("fr.online.name.offset.h"));
    const tNameImage = tNameWriter.render(tFriendData[Symbol.for("name")]);
    tSourceRect = tNameImage.rect;
    const tNamePosV = (this.pItemHeight - tNameImage.height) / 2;
    tdestrect = tSourceRect + rect(tNamePosH, tNamePosV, tNamePosH, tNamePosV);
    tItemImg.copyPixels(tNameImage, tdestrect, tSourceRect, [Symbol.for("ink"): 36]);
    const tImIconImg = getMember(getVariable("fr.online.im.icon")).image;
    const tImIconRect = tImIconImg.rect;
    const tImIconPosH = integer(getVariable("fr.online.im.offset.h"));
    const tImIconPosV = (this.pItemHeight - tImIconImg.height) / 2;
    tdestrect = tImIconRect + rect(tImIconPosH, tImIconPosV, tImIconPosH, tImIconPosV);
    tItemImg.copyPixels(tImIconImg, tdestrect, tImIconRect, [Symbol.for("ink"): 36]);
    if (tFriendData[Symbol.for("canfollow")]) {
      const tFollowIconImg = getMember(getVariable("fr.online.follow.icon")).image;
      const tFollowIconRect = tFollowIconImg.rect;
      const tFollowIconPosH = integer(getVariable("fr.online.follow.offset.h"));
      const tFollowIconPosV = (this.pItemHeight - tFollowIconImg.height) / 2;
      tdestrect = tFollowIconRect + rect(tFollowIconPosH, tFollowIconPosV, tFollowIconPosH, tFollowIconPosV);
      tItemImg.copyPixels(tFollowIconImg, tdestrect, tFollowIconRect, [Symbol.for("ink"): 36]);
    }
    return tItemImg.duplicate();
  }

  renderListImage() {
    if (this.pContentList.count == 0) {
      this.pListImg = image(1, 1, 32);
    }
    this.pFriendRenderQueue = list();
    const tItemHeight = integer(getVariable("fr.online.item.height"));
    let tCurrentPosV = 0;
    for (let tNo = 1; tNo <= this.pContentList.count; tNo++) {
      const tFriend = this.pContentList[tNo];
      tFriend.setaProp(Symbol.for("posV"), tCurrentPosV);
      this.pFriendRenderQueue.append(tFriend);
      tCurrentPosV = tCurrentPosV + tItemHeight;
    }
    this.pListImg = this.renderBackgroundImage();
  }

  renderFromQueue(tContentElement) {
    if (tContentElement == 0) {
      this.pFriendRenderQueue = list();
      return 1;
    }
    const tItemHeight = integer(getVariable("fr.online.item.height"));
    const tWidth = integer(getVariable("fr.list.panel.width"));
    const tFacePosH = integer(getVariable("fr.online.face.offset.h"));
    const tNamePosH = integer(getVariable("fr.online.name.offset.h"));
    const tImage = image(tWidth, tItemHeight * this.pContentList.count, 32);
    let tCurrentPosV = 0;
    const tNameWriter = getWriter(this.pWriterIdPlain);
    const tFigureParser = getObject("Figure_System");
    const tPartList = Symbol.for("head");
    const tPreviewObj = getObject("Figure_Preview");
    const tImIconImg = getMember("friends_im_icon").image;
    const tImIconRect = tImIconImg.rect;
    const tImIconPosH = integer(getVariable("fr.online.im.offset.h"));
    const tImIconPosV = (tItemHeight - tImIconImg.height) / 2;
    const tFollowIconImg = getMember("friends_follow_icon").image;
    const tFollowIconRect = tFollowIconImg.rect;
    const tFollowIconPosH = integer(getVariable("fr.online.follow.offset.h"));
    const tFollowIconPosV = (tItemHeight - tFollowIconImg.height) / 2;
    for (let i = 1; i <= this.pTasksPerUpdate; i++) {
      if (this.pFriendRenderQueue.count > 0) {
        const tFriend = this.pFriendRenderQueue[1];
        this.pFriendRenderQueue.deleteAt(1);
        tCurrentPosV = tFriend[Symbol.for("posV")];
        if (this.isFriendselected(tFriend[Symbol.for("name")])) {
          const tSelectedBg = rgb(string(getVariable("fr.online.bg.selected")));
          this.pListImg.fill(0, tCurrentPosV, tWidth, tCurrentPosV + tItemHeight, tSelectedBg);
        }
        const tParsedFigure = tFigureParser.parseFigure(tFriend[Symbol.for("figure")], tFriend[Symbol.for("sex")], "user");
        const tHeadImage = tPreviewObj.getHumanPartImg(tPartList, tParsedFigure, 2, "sh");
        let tSourceRect = tHeadImage.rect;
        const tFacePosV = tCurrentPosV + ((tItemHeight - tHeadImage.height) / 2);
        let tdestrect = tSourceRect + rect(tFacePosH, tFacePosV, tFacePosH, tFacePosV);
        this.pListImg.copyPixels(tHeadImage, tdestrect, tSourceRect, [Symbol.for("ink"): 36]);
        const tNameImage = tNameWriter.render(tFriend[Symbol.for("name")]);
        tSourceRect = tNameImage.rect;
        const tNamePosV = tCurrentPosV + ((tItemHeight - tNameImage.height) / 2);
        tdestrect = tSourceRect + rect(tNamePosH, tNamePosV, tNamePosH, tNamePosV);
        this.pListImg.copyPixels(tNameImage, tdestrect, tSourceRect, [Symbol.for("ink"): 36]);
        tdestrect = tImIconRect + rect(tImIconPosH, tCurrentPosV + tImIconPosV, tImIconPosH, tCurrentPosV + tImIconPosV);
        this.pListImg.copyPixels(tImIconImg, tdestrect, tImIconRect, [Symbol.for("ink"): 36]);
        if (tFriend[Symbol.for("canfollow")]) {
          tdestrect = tFollowIconRect + rect(tFollowIconPosH, tCurrentPosV + tFollowIconPosV, tFollowIconPosH, tCurrentPosV + tFollowIconPosV);
          this.pListImg.copyPixels(tFollowIconImg, tdestrect, tFollowIconRect, [Symbol.for("ink"): 36]);
        }
      }
    }
    tContentElement.feedImage(this.pListImg);
  }

  renderBackgroundImage() {
    if (ilk(this.pContentList) != Symbol.for("propList")) {
      return image(1, 1, 32);
    }
    if (this.pContentList.count == 0) {
      return image(1, 1, 32);
    }
    const tDarkBg = rgb(string(getVariable("fr.online.bg.dark")));
    this.pItemHeight = integer(getVariable("fr.online.item.height"));
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
    const tItemHeight = integer(getVariable("fr.online.item.height"));
    const tListIndex = (tLocY / tItemHeight) + 1;
    const tEventResult = propList();
    tEventResult[Symbol.for("event")] = tEvent;
    tEventResult[Symbol.for("cursor")] = "cursor.arrow";
    if (tListIndex > this.pContentList.count) {
      return tEventResult;
    }
    const tFriend = this.pContentList[tListIndex];
    tEventResult[Symbol.for("friend")] = tFriend;
    if (tEvent == Symbol.for("mouseWithin")) {
      if (tLocX > integer(getVariable("fr.online.im.offset.h"))) {
        tEventResult[Symbol.for("element")] = Symbol.for("im");
        tEventResult[Symbol.for("cursor")] = "cursor.finger";
      } else {
        if ((tLocX > integer(getVariable("fr.online.follow.offset.h"))) && tFriend[Symbol.for("canfollow")]) {
          tEventResult[Symbol.for("element")] = Symbol.for("follow");
          tEventResult[Symbol.for("cursor")] = "cursor.finger";
        }
      }
      tEventResult[Symbol.for("item_y")] = (tListIndex - 1) * this.pItemHeight;
      tEventResult[Symbol.for("item_height")] = this.pItemHeight;
      return tEventResult;
    }
    if (tEvent != Symbol.for("mouseUp")) {
      return 1;
    }
    const tListWidth = integer(getVariable("fr.list.panel.width"));
    if (tLocX > integer(getVariable("fr.online.im.offset.h"))) {
      tEventResult[Symbol.for("element")] = Symbol.for("im");
    } else {
      if ((tLocX > integer(getVariable("fr.online.follow.offset.h"))) && tFriend[Symbol.for("canfollow")]) {
        tEventResult[Symbol.for("element")] = Symbol.for("follow");
      } else {
        if (the.doubleClick) {
          tEventResult[Symbol.for("element")] = Symbol.for("im");
          this.userSelectionEvent(tFriend[Symbol.for("name")]);
          tEventResult[Symbol.for("update")] = 1;
        } else {
          tEventResult[Symbol.for("element")] = Symbol.for("name");
          this.userSelectionEvent(tFriend[Symbol.for("name")]);
          tEventResult[Symbol.for("update")] = 1;
        }
      }
    }
    return tEventResult;
  }
}
