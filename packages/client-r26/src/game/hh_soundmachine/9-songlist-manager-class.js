export default class {
  pConnectionId;
  pDiskList;
  pSelectedDisk;
  pDiskListRenderList;
  pDiskListImage;
  pSongList;
  pSelectedSong;
  pSongListRenderList;
  pSongListImage;
  pPlaylist;
  pPlaylistLimit;
  pSelectedPlaylistSong;
  pEditorSongID;
  pPlaylistChanged;
  pPlayTime;
  pInitialPlaylistTime;
  pWriterID;
  pItemWidth;
  pItemHeight;
  pItemName;
  pItemNameSelected;
  pItemNameBurnTag;
  pArrowListWidth;
  pArrowUpName;
  pArrowUpNameDimmed;
  pArrowDownName;
  pArrowDownNameDimmed;

  construct() {
    this.pConnectionId = getVariableValue("connection.info.id", Symbol.for("Info"));
    this.pWriterID = getUniqueID();
    const tBold = getStructVariable("struct.font.plain");
    const tMetrics = propList("font", tBold.getaProp(Symbol.for("font")), "fontStyle", tBold.getaProp(Symbol.for("fontStyle")), "color", rgb("#000000"));
    createWriter(this.pWriterID, tMetrics);
    this.pSongList = list();
    this.pPlaylist = list();
    this.pPlayTime = 0;
    this.pInitialPlaylistTime = 0;
    this.pPlaylistLimit = 5;
    this.pSelectedSong = 0;
    this.pItemWidth = 150;
    this.pItemHeight = 18;
    this.pArrowListWidth = 40;
    this.pItemName = "soundmachine_playlist_item";
    this.pItemNameSelected = "soundmachine_playlist_item2";
    this.pItemNameBurnTag = "soundmachine_playlist_burned_tag";
    this.pArrowUpName = "soundmachine_playlist_up";
    this.pArrowUpNameDimmed = "soundmachine_playlist_up2";
    this.pArrowDownName = "soundmachine_playlist_down";
    this.pArrowDownNameDimmed = "soundmachine_playlist_down2";
    this.pSelectedSong = 1;
    this.pSelectedPlaylistSong = 0;
    this.pPlaylistChanged = 0;
    this.pSongListImage = VOID;
    this.pSongListRenderList = list();
    this.pEditorSongID = 0;
    this.pDiskList = list();
    this.pSelectedDisk = 1;
    this.pDiskListRenderList = list();
    this.pDiskListImage = VOID;
  }

  deconstruct() {
    if (writerExists(this.pWriterID)) {
      removeWriter(this.pWriterID);
    }
  }

  addPlaylistSong() {
    const tIndex = this.pSelectedSong;
    if (this.pPlaylist.count >= this.pPlaylistLimit) {
      return 0;
    }
    if ((tIndex < 1) || (tIndex > this.pSongList.count)) {
      return 0;
    }
    this.pPlaylist[this.pPlaylist.count + 1] = this.pSongList[tIndex].duplicate();
    this.pPlaylistChanged = 1;
    return 1;
  }

  insertPlaylistSong(tID, tLength, tName, tAuthor) {
    if (voidp(tID) || voidp(tLength) || voidp(tName) || voidp(tAuthor)) {
      return 0;
    }
    this.pPlaylist[this.pPlaylist.count + 1] = propList("id", tID, "length", tLength, "name", tName, "author", tAuthor);
    if (this.pPlaylist.count == 1) {
      this.resetPlayTime();
    }
    return 1;
  }

  removePlaylistSong(tIndex) {
    if ((tIndex < 1) || (tIndex > this.pPlaylist.count)) {
      return 0;
    }
    this.pPlaylist.deleteAt(tIndex);
    this.pPlaylistChanged = 1;
    return 1;
  }

  getPlaylistCount() {
    return this.pPlaylist.count;
  }

  getPlaylistSong(tIndex) {
    if ((tIndex < 1) || (tIndex > this.pPlaylist.count)) {
      return 0;
    }
    return this.pPlaylist[tIndex].duplicate();
  }

  getPlaylistSongName(tIndex) {
    if ((tIndex >= 1) && (tIndex <= this.pPlaylist.count)) {
      let tSongName = EMPTY;
      if (ilk(this.pPlaylist[tIndex]) == Symbol.for("propList")) {
        if (!voidp(this.pPlaylist[tIndex][Symbol.for("name")])) {
          tSongName = this.pPlaylist[tIndex][Symbol.for("name")];
        }
      }
      return tSongName;
    }
    return EMPTY;
  }

  getPlaylistSongAuthor(tIndex) {
    if ((tIndex >= 1) && (tIndex <= this.pPlaylist.count)) {
      let tAuthor = EMPTY;
      if (ilk(this.pPlaylist[tIndex]) == Symbol.for("propList")) {
        if (!voidp(this.pPlaylist[tIndex][Symbol.for("author")])) {
          tAuthor = this.pPlaylist[tIndex][Symbol.for("author")];
        }
      }
      return tAuthor;
    }
    return EMPTY;
  }

  getSongName() {
    const tIndex = this.pSelectedSong;
    if ((tIndex >= 1) && (tIndex <= this.pSongList.count)) {
      let tSongName = EMPTY;
      if (ilk(this.pSongList[tIndex]) == Symbol.for("propList")) {
        if (!voidp(this.pSongList[tIndex][Symbol.for("name")])) {
          tSongName = this.pSongList[tIndex][Symbol.for("name")];
        }
      }
      return tSongName;
    }
    return EMPTY;
  }

  getSongDate() {
    return "1.1.2007";
  }

  getSongLength() {
    let tSongLength = -1;
    if ((this.pSelectedSong >= 1) && (this.pSelectedSong <= this.pSongList.count)) {
      if (ilk(this.pSongList[this.pSelectedSong]) == Symbol.for("propList")) {
        if (!voidp(this.pSongList[this.pSelectedSong][Symbol.for("length")])) {
          tSongLength = this.pSongList[this.pSelectedSong][Symbol.for("length")];
        }
      }
    }
    return tSongLength;
  }

  getPlaylistLength() {
    let tLength = 0;
    for (let i = 1; i <= this.pPlaylist.count; i++) {
      const tSong = this.pPlaylist[i];
      if (!voidp(tSong[Symbol.for("length")])) {
        if (tSong[Symbol.for("length")] == -1) {
          return -1;
        }
        tLength = tLength + tSong[Symbol.for("length")];
        continue;
      }
      return -1;
    }
    return tLength;
  }

  getPlaylistSongLength(tIndex) {
    if ((tIndex >= 1) && (tIndex <= this.pPlaylist.count)) {
      let tSongLength = -1;
      if (ilk(this.pPlaylist[tIndex]) == Symbol.for("propList")) {
        if (!voidp(this.pPlaylist[tIndex][Symbol.for("length")])) {
          tSongLength = this.pPlaylist[tIndex][Symbol.for("length")];
        }
      }
      return tSongLength;
    }
    return -1;
  }

  getEditorSongID() {
    return this.pEditorSongID;
  }

  getPlaylistChanged() {
    return this.pPlaylistChanged;
  }

  getSelectedDiskIndex() {
    return this.pSelectedDisk;
  }

  renderDiskList() {
    if (voidp(this.pDiskListImage)) {
      this.pDiskListRenderList = VOID;
    } else {
      if (this.pDiskListRenderList.findPos(this.pSelectedDisk) == 0) {
        this.pDiskListRenderList.add(this.pSelectedDisk);
      }
    }
    const tRetVal = this.renderList(this.pDiskList, this.pSelectedDisk, this.pDiskListRenderList, this.pDiskListImage);
    if (tRetVal != 0) {
      this.pDiskListImage = tRetVal;
    }
    this.pDiskListRenderList = list();
    return tRetVal;
  }

  renderSongList() {
    if (voidp(this.pSongListImage)) {
      this.pSongListRenderList = VOID;
    } else {
      if (this.pSongListRenderList.findPos(this.pSelectedSong) == 0) {
        this.pSongListRenderList.add(this.pSelectedSong);
      }
    }
    const tRetVal = this.renderList(this.pSongList, this.pSelectedSong, this.pSongListRenderList, this.pSongListImage);
    if (tRetVal != 0) {
      this.renderBurnedTag(tRetVal, this.pSongList, this.pSongListRenderList);
      this.pSongListImage = tRetVal;
    }
    this.pSongListRenderList = list();
    return tRetVal;
  }

  renderPlaylist() {
    return this.renderList(this.pPlaylist, this.pSelectedPlaylistSong, VOID, VOID, getText("sound_machine_song_remove"));
  }

  renderPlaylistArrows() {
    const tWidth = this.pArrowListWidth;
    const tHeight = this.pItemHeight * this.pPlaylist.count;
    const tImg = image(tWidth, tHeight, 32);
    const tMemberUp = getMember(this.pArrowUpName);
    const tMemberUp2 = getMember(this.pArrowUpNameDimmed);
    const tMemberDown = getMember(this.pArrowDownName);
    const tMemberDown2 = getMember(this.pArrowDownNameDimmed);
    for (let j = 1; j <= 2; j++) {
      for (let i = 1; i <= this.pPlaylist.count; i++) {
        let tmember;
        if (j == 1) {
          if (i == 1) {
            tmember = tMemberUp2;
          } else {
            tmember = tMemberUp;
          }
        } else {
          if (i == this.pPlaylist.count) {
            tmember = tMemberDown2;
          } else {
            tmember = tMemberDown;
          }
        }
        if (tmember != 0) {
          const tSourceImg = tmember.image;
          const tRect = tSourceImg.rect;
          const tImgWd = tRect[3] - tRect[1];
          const tImgHt = tRect[4] - tRect[2];
          tRect[1] = tRect[1] + (((tWidth / 2) - tImgWd) / 2) + (tWidth / 2 * (j - 1));
          tRect[2] = tRect[2] + ((i - 1) * this.pItemHeight) + ((this.pItemHeight - tImgHt) / 2);
          tRect[3] = tRect[3] + (((tWidth / 2) - tImgWd) / 2) + (tWidth / 2 * (j - 1));
          tRect[4] = tRect[4] + ((i - 1) * this.pItemHeight) + ((this.pItemHeight - tImgHt) / 2);
          tImg.copyPixels(tSourceImg, tRect, tSourceImg.rect, propList("ink", 8, "maskImage", tSourceImg.createMatte()));
        }
      }
    }
    return tImg;
  }

  diskListMouseClick(tX, tY) {
    const tItem = 1 + (tY / this.pItemHeight);
    if ((tItem >= 1) && (tItem <= this.pDiskList.count)) {
      if (this.pDiskListRenderList.findPos(this.pSelectedDisk) == 0) {
        this.pDiskListRenderList.add(this.pSelectedDisk);
      }
      this.pSelectedDisk = tItem;
      return 1;
    }
    return 0;
  }

  songListMouseClick(tX, tY) {
    const tItem = 1 + (tY / this.pItemHeight);
    if ((tItem >= 1) && (tItem <= this.pSongList.count)) {
      if (this.pSongListRenderList.findPos(this.pSelectedSong) == 0) {
        this.pSongListRenderList.add(this.pSelectedSong);
      }
      this.pSelectedSong = tItem;
      return 1;
    }
    return 0;
  }

  playlistMouseClick(tX, tY) {
    const tItem = 1 + (tY / this.pItemHeight);
    if ((tItem >= 1) && (tItem <= this.pPlaylist.count)) {
      return this.removePlaylistSong(tItem);
    }
    return 0;
  }

  playlistMouseOver(tX, tY) {
    const tItem = 1 + (tY / this.pItemHeight);
    if (tItem != this.pSelectedPlaylistSong) {
      this.pSelectedPlaylistSong = tItem;
      return 1;
    }
    return 0;
  }

  playlistArrowMouseClick(tX, tY) {
    const tItem = 1 + (tY / this.pItemHeight);
    if ((tItem >= 1) && (tItem <= this.pPlaylist.count)) {
      let tItem2;
      if (tX < (this.pArrowListWidth / 2)) {
        if (tItem == 1) {
          return 0;
        }
        tItem2 = tItem - 1;
      } else {
        if (tItem == this.pPlaylist.count) {
          return 0;
        }
        tItem2 = tItem + 1;
      }
      const tSong = this.pPlaylist[tItem];
      this.pPlaylist[tItem] = this.pPlaylist[tItem2];
      this.pPlaylist[tItem2] = tSong;
      this.pPlaylistChanged = 1;
      return 1;
    }
    return 0;
  }

  getPlayTime() {
    return this.pPlayTime + ((the.milliSeconds - this.pInitialPlaylistTime) / 100);
  }

  changePlayTime(tDelta) {
    this.pPlayTime = this.pPlayTime + tDelta;
  }

  resetPlayTime() {
    this.pPlayTime = 0;
    this.pInitialPlaylistTime = the.milliSeconds;
  }

  getPlaylistData() {
    this.pPlaylist = list();
    this.pSelectedPlaylistSong = 0;
    this.pPlayTime = 0;
    this.pInitialPlaylistTime = 0;
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("GET_PLAY_LIST");
    }
    return 0;
  }

  getSongListData() {
    this.pSongList = list();
    this.pSongListImage = VOID;
    this.pSelectedSong = 1;
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("GET_SONG_LIST");
    }
    return 0;
  }

  savePlaylist() {
    const tMessage = propList();
    tMessage.addProp(Symbol.for("integer"), this.pPlaylist.count);
    for (let i = 1; i <= this.pPlaylist.count; i++) {
      const tSong = this.pPlaylist[i];
      tMessage.addProp(Symbol.for("integer"), tSong[Symbol.for("id")]);
    }
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("UPDATE_PLAY_LIST", tMessage);
    }
    return 0;
  }

  editSong() {
    if ((this.pSelectedSong < 1) || (this.pSelectedSong > this.pSongList.count)) {
      return 0;
    }
    if (getConnection(this.pConnectionId) != 0) {
      const tSong = this.pSongList[this.pSelectedSong];
      this.pEditorSongID = tSong[Symbol.for("id")];
      return getConnection(this.pConnectionId).send("EDIT_SONG", propList("integer", this.pEditorSongID));
    }
    return 0;
  }

  newSong() {
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("NEW_SONG");
    }
    return 0;
  }

  deleteSong() {
    if ((this.pSelectedSong < 1) || (this.pSelectedSong > this.pSongList.count)) {
      return 0;
    }
    if (getConnection(this.pConnectionId) != 0) {
      const tSong = this.pSongList[this.pSelectedSong];
      this.pSongList.deleteAt(this.pSelectedSong);
      if (this.pSelectedSong > this.pSongList.count) {
        this.pSelectedSong = this.pSongList.count;
      }
      this.pSongListImage = VOID;
      const tID = tSong[Symbol.for("id")];
      return getConnection(this.pConnectionId).send("DELETE_SONG", propList("integer", tID));
    }
    return 0;
  }

  downloadSong(tID) {
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("GET_SONG_INFO", propList("integer", tID));
    }
    return 0;
  }

  burnSong() {
    if ((this.pSelectedSong < 1) || (this.pSelectedSong > this.pSongList.count)) {
      return 0;
    }
    if (getConnection(this.pConnectionId) != 0) {
      const tSong = this.pSongList[this.pSelectedSong];
      const tID = tSong[Symbol.for("id")];
      return getConnection(this.pConnectionId).send("BURN_SONG", propList("integer", tID));
    }
    return 0;
  }

  setDiskList(tDiskList) {
    this.pDiskList = tDiskList;
    this.pSelectedDisk = 1;
    this.pDiskListImage = VOID;
    return 1;
  }

  parseSongList(tMsg) {
    if (voidp(tMsg.connection)) {
      return 0;
    }
    this.pSongList = list();
    this.pSelectedSong = 1;
    const tCount = tMsg.connection.GetIntFrom();
    for (let i = 1; i <= tCount; i++) {
      const tID = tMsg.connection.GetIntFrom();
      const tLength = tMsg.connection.GetIntFrom();
      let tName = tMsg.connection.GetStrFrom();
      const tIslocked = tMsg.connection.GetIntFrom();
      tName = convertSpecialChars(tName, 0);
      this.pSongList[this.pSongList.count + 1] = propList("id", tID, "length", tLength, "name", tName, "locked", tIslocked, "author", EMPTY);
    }
    if (this.pPlaylistChanged) {
      for (let i = this.pPlaylist.count; i >= 1; i--) {
        let tFound = 0;
        const tID = this.pPlaylist[i][Symbol.for("id")];
        for (let j = 1; j <= this.pSongList.count; j++) {
          if (this.pSongList[j][Symbol.for("id")] == tID) {
            tFound = 1;
            break;
          }
        }
        if (!tFound) {
          this.pPlaylist.deleteAt(i);
        }
      }
    }
    this.pSongListImage = VOID;
    return 1;
  }

  parsePlaylist(tMsg) {
    if (voidp(tMsg.connection)) {
      return 0;
    }
    this.pPlaylist = list();
    this.pSelectedPlaylistSong = 0;
    this.pPlayTime = tMsg.connection.GetIntFrom();
    this.pInitialPlaylistTime = the.milliSeconds;
    const tCount = tMsg.connection.GetIntFrom();
    for (let i = 1; i <= tCount; i++) {
      const tID = tMsg.connection.GetIntFrom();
      const tLength = tMsg.connection.GetIntFrom();
      let tName = tMsg.connection.GetStrFrom();
      let tAuthor = tMsg.connection.GetStrFrom();
      tName = convertSpecialChars(tName, 0);
      tAuthor = convertSpecialChars(tAuthor, 0);
      this.pPlaylist[this.pPlaylist.count + 1] = propList("id", tID, "length", tLength, "name", tName, "author", tAuthor);
    }
    this.pPlaylistChanged = 0;
    return 1;
  }

  renderList(tList, tSelected, tRenderList, tImg, tSelectedText) {
    if (ilk(tList) != Symbol.for("list")) {
      return 0;
    }
    const tWidth = this.pItemWidth;
    const tHeight = this.pItemHeight * tList.count;
    if (voidp(tImg)) {
      tImg = image(tWidth, tHeight, 32);
    }
    const tMemberNormal = getMember(this.pItemName);
    const tMemberSelected = getMember(this.pItemNameSelected);
    const tWriterObj = getWriter(this.pWriterID);
    for (let i = 1; i <= tList.count; i++) {
      let tRender = 1;
      if (!voidp(tRenderList)) {
        if (tRenderList.findPos(i) == 0) {
          tRender = 0;
        }
      }
      const tmember = (i != tSelected) ? tMemberNormal : tMemberSelected;
      if ((tmember != 0) && (tRender == 1)) {
        const tSourceImg = tmember.image;
        const tRect = tSourceImg.rect;
        const tImgWd = tRect[3] - tRect[1];
        const tImgHt = tRect[4] - tRect[2];
        tRect[1] = tRect[1] + ((this.pItemWidth - tImgWd) / 2);
        tRect[2] = tRect[2] + ((i - 1) * this.pItemHeight) + ((this.pItemHeight - tImgHt) / 2);
        tRect[3] = tRect[3] + ((this.pItemWidth - tImgWd) / 2);
        tRect[4] = tRect[4] + ((i - 1) * this.pItemHeight) + ((this.pItemHeight - tImgHt) / 2);
        tImg.copyPixels(tSourceImg, tRect, tSourceImg.rect, propList("ink", 8, "maskImage", tSourceImg.createMatte()));
        if (tWriterObj != 0) {
          let tSongName = EMPTY;
          if (ilk(tList[i]) == Symbol.for("propList")) {
            if (!voidp(tList[i][Symbol.for("name")])) {
              tSongName = tList[i][Symbol.for("name")];
            }
          }
          if ((i == tSelected) && !voidp(tSelectedText)) {
            tSongName = tSelectedText;
          }
          const tTextImg = tWriterObj.render(tSongName).duplicate();
          const tTextImgTrimmed = image(tTextImg.rect[3], tTextImg.rect[4], 32);
          tTextImgTrimmed.copyPixels(tTextImg, tTextImg.rect, tTextImg.rect, propList("ink", 8, "maskImage", tTextImg.createMatte()));
          const tTextImg2 = tTextImgTrimmed.trimWhiteSpace();
          const tTextMargin = 20;
          const tSourceRect = tTextImg2.rect;
          if (tSourceRect[3] > (this.pItemWidth - (tTextMargin * 2))) {
            tSourceRect[3] = this.pItemWidth - (tTextMargin * 2);
          }
          const tTargetRect = tSourceRect.duplicate();
          const tImgWd2 = tTargetRect[3] - tTargetRect[1];
          const tImgHt2 = tTargetRect[4] - tTargetRect[2];
          tTargetRect[1] = tTargetRect[1] + tTextMargin;
          tTargetRect[2] = tTargetRect[2] + ((i - 1) * this.pItemHeight) + ((this.pItemHeight - tImgHt2) / 2);
          tTargetRect[3] = tTargetRect[3] + tTextMargin;
          tTargetRect[4] = tTargetRect[4] + ((i - 1) * this.pItemHeight) + ((this.pItemHeight - tImgHt2) / 2);
          tImg.copyPixels(tTextImg2, tTargetRect, tSourceRect, propList("ink", 36, "maskImage", tTextImg2.createMatte()));
        }
      }
    }
    return tImg;
  }

  renderBurnedTag(tImg, tList, tRenderList) {
    if (ilk(tList) != Symbol.for("list")) {
      return 0;
    }
    const tWidth = this.pItemWidth;
    const tHeight = this.pItemHeight * tList.count;
    if (voidp(tImg)) {
      tImg = image(tWidth, tHeight, 32);
    }
    const tmember = getMember(this.pItemNameBurnTag);
    for (let i = 1; i <= tList.count; i++) {
      let tRender = 0;
      if (!voidp(tList[i][Symbol.for("locked")])) {
        if (tList[i][Symbol.for("locked")]) {
          tRender = 1;
        }
      }
      if (!voidp(tRenderList)) {
        if (tRenderList.findPos(i) == 0) {
          tRender = 0;
        }
      }
      if ((tmember != 0) && (tRender == 1)) {
        const tSourceImg = tmember.image;
        const tRect = tSourceImg.rect;
        const tImgWd = tRect[3] - tRect[1];
        const tImgHt = tRect[4] - tRect[2];
        tRect[1] = tRect[1] + (this.pItemWidth - (tImgWd + 3));
        tRect[2] = tRect[2] + ((i - 1) * this.pItemHeight) + ((this.pItemHeight - tImgHt) / 2);
        tRect[3] = tRect[3] + (this.pItemWidth - (tImgWd + 3));
        tRect[4] = tRect[4] + ((i - 1) * this.pItemHeight) + ((this.pItemHeight - tImgHt) / 2);
        tImg.copyPixels(tSourceImg, tRect, tSourceImg.rect, propList("ink", 8, "maskImage", tSourceImg.createMatte()));
      }
    }
    return tImg;
  }
}
