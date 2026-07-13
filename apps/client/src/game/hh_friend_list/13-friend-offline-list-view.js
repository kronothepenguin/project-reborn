export default class {
  pListImg;
  pWriterIdPlain;
  pContentList;
  pItemHeight;
  pItemWidth;
  pEmptyListText;
  pContentListState;

  construct() {
    this.pListImg = image(1, 1, 32);
    this.pContentList = propList();
    this.pContentList.sort();
    this.pContentListState = VOID;
    this.pWriterIdPlain = getUniqueID();
    const tPlain = getStructVariable("struct.font.plain");
    const tMetrics = [Symbol.for("font"): tPlain.getaProp(Symbol.for("font")), Symbol.for("fontStyle"): tPlain.getaProp(Symbol.for("fontStyle")), Symbol.for("color"): rgb("#888888")];
    createWriter(this.pWriterIdPlain, tMetrics);
    this.pItemHeight = integer(getVariable("fr.offline.item.height"));
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
    this.pItemHeight = integer(getVariable("fr.offline.item.height"));
    this.pItemWidth = integer(getVariable("fr.list.panel.width"));
    const tNameWriter = getWriter(this.pWriterIdPlain);
    const tItemImg = image(this.pItemWidth, this.pItemHeight, 32);
    const tName = tFriendData[Symbol.for("name")];
    if (tSelected) {
      const tSelectedBg = rgb(string(getVariable("fr.offline.bg.selected")));
      tItemImg.fill(0, 0, this.pItemWidth, this.pItemHeight, tSelectedBg);
    }
    const tNameImg = tNameWriter.render(tName);
    let tSourceRect = tNameImg.rect;
    const tNamePosH = integer(getVariable("fr.offline.name.offset.h"));
    const tNamePosV = (this.pItemHeight - tNameImg.height) / 2;
    let tdestrect = tSourceRect + rect(tNamePosH, tNamePosV, tNamePosH, tNamePosV);
    tItemImg.copyPixels(tNameImg, tdestrect, tNameImg.rect);
    return tItemImg.duplicate();
  }

  renderListImage() {
    if (this.pContentList.count == 0) {
      this.pListImg = image(1, 1, 32);
      return this.pListImg;
    }
    this.pFriendRenderQueue = list();
    this.pItemHeight = integer(getVariable("fr.offline.item.height"));
    this.pItemWidth = integer(getVariable("fr.list.panel.width"));
    const tNamePosH = integer(getVariable("fr.offline.name.offset.h"));
    const tSelectedBg = rgb(string(getVariable("fr.offline.bg.selected")));
    this.pListImg = image(this.pItemWidth, this.pItemHeight * this.pContentList.count, 32);
    let tCurrentPosV = 0;
    const tNameWriter = getWriter(this.pWriterIdPlain);
    for (const tFriend of this.pContentList) {
      const tName = tFriend[Symbol.for("name")];
      if (this.isFriendselected(tName)) {
        this.pListImg.fill(0, tCurrentPosV, this.pItemWidth, tCurrentPosV + this.pItemHeight, tSelectedBg);
      }
      tFriend.setaProp(Symbol.for("posV"), tCurrentPosV);
      this.pFriendRenderQueue.append(tFriend);
      tCurrentPosV = tCurrentPosV + this.pItemHeight;
    }
  }

  renderFromQueue(tContentElement) {
    if (tContentElement == 0) {
      this.pFriendRenderQueue = list();
      return 1;
    }
    const tNamePosH = integer(getVariable("fr.offline.name.offset.h"));
    const tNameWriter = getWriter(this.pWriterIdPlain);
    for (let i = 1; i <= this.pTasksPerUpdate; i++) {
      if (this.pFriendRenderQueue.count > 0) {
        const tFriend = this.pFriendRenderQueue[1];
        this.pFriendRenderQueue.deleteAt(1);
        let tCurrentPosV = tFriend[Symbol.for("posV")];
        const tName = tFriend[Symbol.for("name")];
        if (this.isFriendselected(tName)) {
          this.pListImg.fill(0, tCurrentPosV, this.pItemWidth, tCurrentPosV + this.pItemHeight, rgb(string(getVariable("fr.offline.bg.selected"))));
        }
        const tNameImage = tNameWriter.render(tName);
        const tSourceRect = tNameImage.rect;
        const tNamePosV = tCurrentPosV + ((this.pItemHeight - tNameImage.height) / 2);
        const tdestrect = tSourceRect + rect(tNamePosH, tNamePosV, tNamePosH, tNamePosV);
        this.pListImg.copyPixels(tNameImage, tdestrect, tNameImage.rect);
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
    const tDarkBg = rgb(string(getVariable("fr.offline.bg.dark")));
    this.pItemHeight = integer(getVariable("fr.offline.item.height"));
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
    if (tListIndex > this.pContentList.count) {
      nothing();
    } else {
      const tFriend = this.pContentList[tListIndex];
      tEventResult[Symbol.for("friend")] = tFriend;
      tEventResult[Symbol.for("element")] = Symbol.for("name");
      tEventResult[Symbol.for("item_y")] = (tListIndex - 1) * this.pItemHeight;
      tEventResult[Symbol.for("item_height")] = this.pItemHeight;
      if (tEvent == Symbol.for("mouseUp")) {
        this.userSelectionEvent(tFriend[Symbol.for("name")]);
      }
      tEventResult[Symbol.for("update")] = 1;
    }
    return tEventResult;
  }
}
