export default class {
  pCategories;
  pFriendList;
  pListLimit;

  construct() {
    this.pCategories = propList();
    this.pFriendList = propList();
    this.pListLimit = 0;
  }

  deconstruct() {
  }

  populateCategoryData(tdata) {
    this.pCategories = propList();
    let tCat = propList();
    let tID = "0";
    tCat[Symbol.for("id")] = tID;
    tCat[Symbol.for("name")] = getText("friend_list_online_category");
    this.pCategories[tID] = tCat;
    for (let tNo = 1; tNo <= tdata.count; tNo++) {
      tCat = propList();
      tID = string(tdata.getPropAt(tNo));
      tCat[Symbol.for("id")] = tID;
      tCat[Symbol.for("name")] = tdata[tNo];
      this.pCategories[tID] = tCat;
    }
    tCat = propList();
    tID = "-1";
    tCat[Symbol.for("id")] = tID;
    tCat[Symbol.for("name")] = getText("friend_list_offline_category");
    this.pCategories[tID] = tCat;
    tCat = propList();
    tID = "-2";
    tCat[Symbol.for("id")] = tID;
    tCat[Symbol.for("name")] = getText("friend_list_friend_requests_category");
    this.pCategories[tID] = tCat;
    tCat = propList();
    tID = "-3";
    tCat[Symbol.for("id")] = tID;
    tCat[Symbol.for("name")] = getText("friend_list_search_category", "Search");
    this.pCategories[tID] = tCat;
  }

  populateFriendData(tFriends) {
    for (const tFriend of tFriends) {
      this.addFriend(tFriend);
    }
  }

  setListLimit(tLimit) {
    this.pListLimit = tLimit;
  }

  isListFull() {
    if (this.pListLimit == -1) {
      return 0;
    }
    return this.pFriendList.count >= this.pListLimit;
  }

  addFriend(tFriend) {
    const tID = string(tFriend[Symbol.for("id")]);
    this.pFriendList[tID] = tFriend.duplicate();
  }

  updateFriend(tFriendData) {
    const tID = string(tFriendData[Symbol.for("id")]);
    const tFriendProps = this.pFriendList[tID];
    if (!voidp(tFriendProps)) {
      for (let tNo = 1; tNo <= tFriendData.count; tNo++) {
        const tProp = tFriendData.getPropAt(tNo);
        const tValue = tFriendData[tNo];
        if (!((tProp == Symbol.for("figure")) && (tValue == EMPTY))) {
          tFriendProps[tProp] = tValue;
        }
      }
      this.pFriendList[tID] = tFriendProps.duplicate();
    }
  }

  removeFriend(tFriendID) {
    this.pFriendList.deleteProp(string(tFriendID));
  }

  getFriendByID(tFriendID) {
    const tFriend = this.pFriendList[string(tFriendID)];
    if (voidp(tFriend)) {
      return 0;
    } else {
      return tFriend;
    }
  }

  getFriendByName(tName) {
    const tFriendID = string(tName);
    for (let tNo = 1; tNo <= this.pFriendList.count; tNo++) {
      const tFriend = this.pFriendList[tNo];
      if (tName == string(tFriend[Symbol.for("name")])) {
        return tFriend;
      }
    }
    return 0;
  }

  getFriendsInCategory(tCategoryId) {
    const tList = propList();
    tList.sort();
    for (let tNo = 1; tNo <= this.pFriendList.count; tNo++) {
      const tFriend = this.pFriendList[tNo];
      if (tFriend[Symbol.for("categoryId")] == tCategoryId) {
        tList.setaProp(tFriend.getaProp(Symbol.for("name")), tFriend);
      }
    }
    return tList;
  }

  getCategoryList() {
    return this.pCategories;
  }

  getCategoryName(tCatID) {
    const tCategory = this.pCategories[string(tCatID)];
    return tCategory[Symbol.for("name")];
  }
}
