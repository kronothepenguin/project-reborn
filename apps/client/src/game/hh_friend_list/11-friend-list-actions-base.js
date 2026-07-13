export default class {
  pSelectedFriends;

  isFriendselected(tName) {
    if (voidp(this.pSelectedFriends)) {
      this.pSelectedFriends = list();
    }
    return this.pSelectedFriends.getOne(tName) > 0;
  }

  selectFriend(tName) {
    if (voidp(this.pSelectedFriends)) {
      this.pSelectedFriends = list();
    }
    if (this.pSelectedFriends.getOne(tName) == 0) {
      this.pSelectedFriends.add(tName);
    }
  }

  deselectFriend(tName) {
    if (voidp(this.pSelectedFriends)) {
      this.pSelectedFriends = list();
    }
    if (this.pSelectedFriends.getOne(tName) > 0) {
      this.pSelectedFriends.deleteOne(tName);
    }
  }

  getSelectedFriends() {
    if (voidp(this.pSelectedFriends)) {
      this.pSelectedFriends = list();
    }
    const tList = list();
    for (const tName of this.pSelectedFriends) {
      const tFriendData = this.pContentList.getaProp(tName);
      if (ilk(tFriendData) == Symbol.for("propList")) {
        tList.add(tFriendData);
      }
    }
    return tList;
  }

  addFriend(tFriendData) {
    if (ilk(tFriendData) != Symbol.for("propList")) {
      return 0;
    }
    const tName = string(tFriendData[Symbol.for("name")]);
    if (this.pContentList.findPos(tName) > 0) {
      return 0;
    }
    this.pNeedsRender = 1;
    this.pContentList[tName] = tFriendData.duplicate();
    const tFriendImg = this.renderFriendItem(tFriendData, 0);
    const tIndex = this.pContentList.findPos(tName);
    const tPosV = (tIndex - 1) * this.pItemHeight;
    this.pListImg = this.insertImageTo(tFriendImg, this.pListImg.duplicate(), tPosV);
  }

  updateFriend(tFriendData) {
    const tName = string(tFriendData[Symbol.for("name")]);
    const tIndex = this.pContentList.findPos(tName);
    if (tIndex < 1) {
      return 0;
    }
    this.pContentList[tName] = tFriendData;
    const tFriendImg = this.renderFriendItem(tFriendData, 0);
    const tPosV = (tIndex - 1) * this.pItemHeight;
    this.pListImg = this.updateImagePart(tFriendImg, this.pListImg, tPosV);
  }

  removeFriend(tFriendID) {
    for (let tIndex = 1; tIndex <= this.pContentList.count; tIndex++) {
      const tFriend = this.pContentList[tIndex];
      if (tFriend[Symbol.for("id")] == tFriendID) {
        tIndex = this.pContentList.findPos(tFriend[Symbol.for("name")]);
        const tStartPosV = (tIndex - 1) * this.pItemHeight;
        const tEndPosV = tStartPosV + this.pItemHeight;
        this.pListImg = this.removeImagePart(this.pListImg.duplicate(), tStartPosV, tEndPosV);
        this.pContentList.deleteAt(tIndex);
        this.deselectFriend(tFriend[Symbol.for("name")]);
        this.pNeedsRender = 1;
        break;
      }
    }
  }

  setFriendSelection(tName, tSelected) {
    const tFriendData = this.pContentList[tName];
    const tFriendImg = this.renderFriendItem(tFriendData, tSelected);
    const tIndex = this.pContentList.findPos(tName);
    const tPosV = (tIndex - 1) * this.pItemHeight;
    this.pListImg = this.updateImagePart(tFriendImg, this.pListImg.duplicate(), tPosV);
    if (tSelected) {
      this.selectFriend(tFriendData[Symbol.for("name")]);
    } else {
      this.deselectFriend(tFriendData[Symbol.for("name")]);
    }
  }

  userSelectionEvent(tName) {
    if (voidp(tName)) {
      return 0;
    }
    const tFriendData = this.pContentList[tName];
    if (voidp(tFriendData)) {
      return 0;
    }
    if (this.isFriendselected(tName)) {
      this.setFriendSelection(tName, 0);
    } else {
      this.setFriendSelection(tName, 1);
    }
  }
}
