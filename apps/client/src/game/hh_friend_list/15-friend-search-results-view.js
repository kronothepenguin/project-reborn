export default class {
  pListImg;
  pWriterIdPlain;
  pWriterIdBold;
  pContentList;
  pItemHeight;
  pItemWidth;
  pEmptyListText;

  construct() {
    this.pSelectedFriendID = VOID;
    this.pContentList = [Symbol.for("friends"): list(), Symbol.for("habbos"): list()];
    this.pContentList.sort();
    this.pWriterIdPlain = getUniqueID();
    const tPlain = getStructVariable("struct.font.plain");
    let tMetrics = [Symbol.for("font"): tPlain.getaProp(Symbol.for("font")), Symbol.for("fontStyle"): tPlain.getaProp(Symbol.for("fontStyle")), Symbol.for("color"): rgb("#111111")];
    createWriter(this.pWriterIdPlain, tMetrics);
    this.pWriterIdBold = getUniqueID();
    const tBold = getStructVariable("struct.font.bold");
    tMetrics = [Symbol.for("font"): tBold.getaProp(Symbol.for("font")), Symbol.for("fontStyle"): tBold.getaProp(Symbol.for("fontStyle")), Symbol.for("color"): rgb("#111111")];
    createWriter(this.pWriterIdBold, tMetrics);
    this.pItemHeight = integer(getVariable("fr.requests.item.height"));
    this.pItemWidth = integer(getVariable("fr.list.panel.width"));
    this.renderListImage();
    this.pEmptyListText = EMPTY;
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

  renderFriendItem(tFriendData) {
    this.pItemHeight = integer(getVariable("fr.search.item.height"));
    this.pItemWidth = integer(getVariable("fr.list.panel.width"));
    const tNameWriter = getWriter(this.pWriterIdBold);
    const tItemImg = image(this.pItemWidth, this.pItemHeight, 32);
    const tName = tFriendData[Symbol.for("name")];
    const tNameImg = tNameWriter.render(tName);
    let tSourceRect = tNameImg.rect;
    const tNamePosH = integer(getVariable("fr.offline.name.offset.h"));
    const tNamePosV = (this.pItemHeight - tNameImg.height) / 2;
    let tdestrect = tSourceRect + rect(tNamePosH, tNamePosV, tNamePosH, tNamePosV);
    tItemImg.copyPixels(tNameImg, tdestrect, tNameImg.rect);
    return tItemImg.duplicate();
  }

  renderListImageFriends(tContentList) {
    if (!listp(tContentList)) {
      return image(1, 1, 32);
    }
    if (tContentList.count == 0) {
      return image(1, 1, 32);
    }
    this.pItemHeight = integer(getVariable("fr.search.item.height"));
    this.pItemWidth = integer(getVariable("fr.list.panel.width"));
    const tNamePosH = integer(getVariable("fr.search.name.offset.h"));
    const tFacePosH = integer(getVariable("fr.search.face.offset.h"));
    const tFigureParser = getObject("Figure_System");
    const tPartList = Symbol.for("head");
    const tPreviewObj = getObject("Figure_Preview");
    const tImIconImg = getMember("friends_im_icon").image;
    const tImIconRect = tImIconImg.rect;
    const tImIconPosH = integer(getVariable("fr.search.im.offset.h"));
    const tImIconPosV = (this.pItemHeight - tImIconImg.height) / 2;
    const tMailIconImg = getMember("friends_mail_list_icon").image;
    const tMailIconRect = tMailIconImg.rect;
    const tMailIconPosH = integer(getVariable("fr.search.mail.offset.h"));
    const tMailIconPosV = (this.pItemHeight - tMailIconImg.height) / 2;
    const tFollowIconImg = getMember("friends_follow_icon").image;
    const tFollowIconRect = tFollowIconImg.rect;
    const tFollowIconPosH = integer(getVariable("fr.search.follow.offset.h"));
    const tFollowIconPosV = (this.pItemHeight - tFollowIconImg.height) / 2;
    const tImage = image(this.pItemWidth, this.pItemHeight * tContentList.count, 32);
    let tCurrentPosV = 0;
    const tNameWriter = getWriter(this.pWriterIdPlain);
    for (const tFriend of tContentList) {
      const tName = tFriend[Symbol.for("name")];
      const tParsedFigure = tFigureParser.parseFigure(tFriend[Symbol.for("figure")], tFriend[Symbol.for("sex")], "user");
      const tHeadImage = tPreviewObj.getHumanPartImg(tPartList, tParsedFigure, 2, "sh");
      let tSourceRect = tHeadImage.rect;
      const tFacePosV = tCurrentPosV + ((this.pItemHeight - tHeadImage.height) / 2);
      let tdestrect = tSourceRect + rect(tFacePosH, tFacePosV, tFacePosH, tFacePosV);
      tImage.copyPixels(tHeadImage, tdestrect, tSourceRect, [Symbol.for("ink"): 36]);
      const tNameImage = tNameWriter.render(tName);
      tSourceRect = tNameImage.rect;
      const tNamePosV = tCurrentPosV + ((this.pItemHeight - tNameImage.height) / 2);
      tdestrect = tSourceRect + rect(tNamePosH, tNamePosV, tNamePosH, tNamePosV);
      tImage.copyPixels(tNameImage, tdestrect, tNameImage.rect);
      if (tFriend[Symbol.for("online")]) {
        tdestrect = tImIconRect + rect(tImIconPosH, tCurrentPosV + tImIconPosV, tImIconPosH, tCurrentPosV + tImIconPosV);
        tImage.copyPixels(tImIconImg, tdestrect, tImIconRect, [Symbol.for("ink"): 36]);
        if (tFriend[Symbol.for("canfollow")]) {
          tdestrect = tFollowIconRect + rect(tFollowIconPosH, tCurrentPosV + tFollowIconPosV, tFollowIconPosH, tCurrentPosV + tFollowIconPosV);
          tImage.copyPixels(tFollowIconImg, tdestrect, tFollowIconRect, [Symbol.for("ink"): 36]);
        }
      } else {
        tdestrect = tMailIconRect + rect(tMailIconPosH, tCurrentPosV + tMailIconPosV, tMailIconPosH, tCurrentPosV + tMailIconPosV);
        tImage.copyPixels(tMailIconImg, tdestrect, tMailIconRect, [Symbol.for("ink"): 36]);
      }
      tCurrentPosV = tCurrentPosV + this.pItemHeight;
    }
    return tImage;
  }

  renderListImageUsers(tContentList) {
    if (!listp(tContentList)) {
      return image(1, 1, 32);
    }
    if (tContentList.count == 0) {
      return image(1, 1, 32);
    }
    this.pItemHeight = integer(getVariable("fr.search.item.height"));
    this.pItemWidth = integer(getVariable("fr.list.panel.width"));
    const tNamePosH = integer(getVariable("fr.search.name.offset.h"));
    const tFigureParser = getObject("Figure_System");
    const tPartList = Symbol.for("head");
    const tPreviewObj = getObject("Figure_Preview");
    const tAddFriendIconImg = getMember("friends_addfriend_icon").image;
    const tAddFriendIconRect = tAddFriendIconImg.rect;
    const tAddFriendIconPosH = integer(getVariable("fr.search.addfriend.offset.h"));
    const tAddFriendIconPosV = (this.pItemHeight - tAddFriendIconImg.height) / 2;
    const tImage = image(this.pItemWidth, this.pItemHeight * tContentList.count, 32);
    let tCurrentPosV = 0;
    const tNameWriter = getWriter(this.pWriterIdPlain);
    const tOwnName = getObject(Symbol.for("session")).GET(Symbol.for("userName"));
    for (const tFriend of tContentList) {
      const tName = tFriend[Symbol.for("name")];
      const tNameImage = tNameWriter.render(tName);
      let tSourceRect = tNameImage.rect;
      const tNamePosV = tCurrentPosV + ((this.pItemHeight - tNameImage.height) / 2);
      let tdestrect = tSourceRect + rect(tNamePosH, tNamePosV, tNamePosH, tNamePosV);
      tImage.copyPixels(tNameImage, tdestrect, tNameImage.rect);
      if (!tFriend.getaProp(Symbol.for("fr_pending"))) {
        if (tName != tOwnName) {
          tdestrect = tAddFriendIconRect + rect(tAddFriendIconPosH, tCurrentPosV + tAddFriendIconPosV, tAddFriendIconPosH, tCurrentPosV + tAddFriendIconPosV);
          tImage.copyPixels(tAddFriendIconImg, tdestrect, tAddFriendIconRect, [Symbol.for("ink"): 36]);
        }
      }
      tCurrentPosV = tCurrentPosV + this.pItemHeight;
    }
    return tImage;
  }

  renderListImage() {
    const tImage1 = this.renderListImageFriends(this.pContentList[Symbol.for("friends")]);
    const tImage2 = this.renderListImageUsers(this.pContentList[Symbol.for("habbos")]);
    let tText;
    if (this.pContentList[Symbol.for("friends")].count == 0) {
      tText = getText("friend_result_nofriendsfound");
    } else {
      tText = replaceChunks(getText("friend_result_friends"), "%cnt%", this.pContentList[Symbol.for("friends")].count);
    }
    const tFriendsResultLine = this.renderFriendItem([Symbol.for("name"): tText]);
    if (this.pContentList[Symbol.for("habbos")].count == 0) {
      tText = getText("friend_result_noothersfound");
    } else {
      tText = replaceChunks(getText("friend_result_other"), "%cnt%", this.pContentList[Symbol.for("habbos")].count);
    }
    const tHabbosResultLine = this.renderFriendItem([Symbol.for("name"): tText]);
    const tImage = this.concatenateImages([tFriendsResultLine, tImage1, tHabbosResultLine, tImage2]);
    this.pListImg = tImage.duplicate();
  }

  renderBackgroundImage() {
    if (ilk(this.pContentList) != Symbol.for("propList")) {
      return image(1, 1, 32);
    }
    if (this.pContentList.count == 0) {
      return image(1, 1, 32);
    }
    const tCount = this.pContentList[Symbol.for("friends")].count + this.pContentList[Symbol.for("habbos")].count + 2;
    const tDarkBg = rgb(string(getVariable("fr.offline.bg.dark")));
    this.pItemHeight = integer(getVariable("fr.offline.item.height"));
    this.pItemWidth = integer(getVariable("fr.list.panel.width"));
    const tImage = image(this.pItemWidth, tCount * this.pItemHeight, 32);
    let tCurrentPosV = 0;
    for (let tIndex = 1; tIndex <= (tCount / 2) + 1; tIndex++) {
      tImage.fill(0, tCurrentPosV, this.pItemWidth, tCurrentPosV + this.pItemHeight, tDarkBg);
      tCurrentPosV = tCurrentPosV + (this.pItemHeight * 2);
    }
    return tImage;
  }

  hideAddFriendLink(tIndex, tCurrentPosV) {
    const tAddFriendIconImg = getMember("friends_addfriend_icon").image;
    const tAddFriendIconRect = tAddFriendIconImg.rect;
    const tAddFriendIconPosH = integer(getVariable("fr.search.addfriend.offset.h"));
    const tAddFriendIconPosV = (this.pItemHeight - tAddFriendIconImg.height) / 2;
    const tdestrect = tAddFriendIconRect + rect(tAddFriendIconPosH, tCurrentPosV + tAddFriendIconPosV, tAddFriendIconPosH, tCurrentPosV + tAddFriendIconPosV);
    this.pListImg.fill(tdestrect, rgb(255, 255, 255));
  }

  relayEvent(tEvent, tLocX, tLocY) {
    const tListIndex = (tLocY / this.pItemHeight) + 1;
    const tEventResult = propList();
    tEventResult[Symbol.for("event")] = tEvent;
    if (this.pContentList.count == 0) {
      tEventResult[Symbol.for("cursor")] = "cursor.arrow";
      return tEventResult;
    }
    if ((tListIndex > 1) && (tListIndex <= (this.pContentList[Symbol.for("friends")].count + 1))) {
      const tFriend = this.pContentList[Symbol.for("friends")][tListIndex - 1];
      tEventResult[Symbol.for("friend")] = tFriend;
      if (tEvent == Symbol.for("mouseWithin")) {
        if (tFriend.getaProp(Symbol.for("online"))) {
          if ((tLocX > integer(getVariable("fr.search.im.offset.h"))) && tFriend[Symbol.for("online")]) {
            tEventResult[Symbol.for("element")] = Symbol.for("im");
            tEventResult[Symbol.for("cursor")] = "cursor.finger";
          } else {
            if ((tLocX > integer(getVariable("fr.search.follow.offset.h"))) && tFriend[Symbol.for("canfollow")]) {
              tEventResult[Symbol.for("element")] = Symbol.for("follow");
              tEventResult[Symbol.for("cursor")] = "cursor.finger";
            }
          }
        } else {
          if (tLocX > integer(getVariable("fr.search.mail.offset.h"))) {
            tEventResult[Symbol.for("element")] = Symbol.for("mail");
            tEventResult[Symbol.for("cursor")] = "cursor.finger";
          }
        }
        tEventResult[Symbol.for("item_y")] = (tListIndex - 1) * this.pItemHeight;
        tEventResult[Symbol.for("item_height")] = this.pItemHeight;
        return tEventResult;
      }
      if (tFriend.getaProp(Symbol.for("online"))) {
        if ((tLocX > integer(getVariable("fr.search.im.offset.h"))) && tFriend[Symbol.for("online")]) {
          tEventResult[Symbol.for("element")] = Symbol.for("im");
          tEventResult[Symbol.for("cursor")] = "cursor.finger";
        } else {
          if ((tLocX > integer(getVariable("fr.search.follow.offset.h"))) && tFriend[Symbol.for("canfollow")]) {
            tEventResult[Symbol.for("element")] = Symbol.for("follow");
            tEventResult[Symbol.for("cursor")] = "cursor.finger";
          }
        }
      } else {
        if (tLocX > integer(getVariable("fr.search.mail.offset.h"))) {
          tEventResult[Symbol.for("element")] = Symbol.for("mail");
          tEventResult[Symbol.for("cursor")] = "cursor.finger";
        }
      }
    } else {
      if (((tListIndex - 2) > this.pContentList[Symbol.for("friends")].count) && ((tListIndex - 2 - this.pContentList[Symbol.for("friends")].count) <= this.pContentList[Symbol.for("habbos")].count)) {
        const tFriend = this.pContentList[Symbol.for("habbos")][tListIndex - 2 - this.pContentList[Symbol.for("friends")].count];
        tEventResult[Symbol.for("friend")] = tFriend;
        let tDisableFR = 0;
        if (tFriend.getaProp(Symbol.for("name")) == getObject(Symbol.for("session")).GET(Symbol.for("userName"))) {
          tDisableFR = 1;
        }
        if (tFriend.getaProp(Symbol.for("fr_pending"))) {
          tDisableFR = 1;
        }
        if (tEvent == Symbol.for("mouseWithin")) {
          if (tLocX > integer(getVariable("fr.search.addfriend.offset.h"))) {
            if (tDisableFR) {
              return 1;
            }
            tEventResult[Symbol.for("element")] = Symbol.for("addFriend");
            tEventResult[Symbol.for("cursor")] = "cursor.finger";
            tEventResult[Symbol.for("item_y")] = (tListIndex - 1) * this.pItemHeight;
            tEventResult[Symbol.for("item_height")] = this.pItemHeight;
          }
          tEventResult[Symbol.for("item_y")] = (tListIndex - 1) * this.pItemHeight;
          tEventResult[Symbol.for("item_height")] = this.pItemHeight;
          return tEventResult;
        }
        if (tDisableFR) {
          return 1;
        }
        if (tLocX > integer(getVariable("fr.search.addfriend.offset.h"))) {
          tEventResult[Symbol.for("element")] = Symbol.for("addFriend");
          tEventResult[Symbol.for("cursor")] = "cursor.finger";
          this.hideAddFriendLink(tListIndex, (tListIndex - 1) * this.pItemHeight);
          tEventResult[Symbol.for("update")] = 1;
        }
      }
    }
    return tEventResult;
  }

  concatenateImages(tImageList) {
    let tHeight = 0;
    for (const tImage of tImageList) {
      tHeight = tHeight + tImage.height;
    }
    const tImageOut = image(this.pItemWidth, tHeight, 32);
    let tOffRect = rect(0, 0, 0, 0);
    for (const tImage of tImageList) {
      tImageOut.copyPixels(tImage, tImage.rect + tOffRect, tImage.rect);
      tOffRect = tOffRect + rect(0, tImage.height, 0, tImage.height);
    }
    return tImageOut;
  }
}
