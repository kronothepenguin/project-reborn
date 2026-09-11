export default class {
  pOwner;
  pConnectionId;
  pDiskList;
  pSelectedDisk;
  pSelectedEject;
  pSelectedLoad;
  pDiskListRenderList;
  pDiskListImage;
  pWriterID;
  pPlaylistWriterID;
  pItemWidth;
  pItemHeight;
  pItemMarginX;
  pItemMarginY;
  pDiskArrayWidth;
  pDiskArrayHeight;
  pPlaylistWidth;
  pPlaylistHeight;
  pPlaylistLimit;
  pItemName;
  pItemNameSelected;
  pItemNameEmpty;
  pItemNameEmptySelected;
  pEjectName;
  pEjectNameSelected;
  pTextEmpty;
  pTextLoadTrax;

  construct() {
    this.pConnectionId = getVariableValue("connection.info.id", Symbol.for("Info"));
    this.pWriterID = getUniqueID();
    const tBold = getStructVariable("struct.font.plain");
    const tMetrics = propList("font", tBold.getaProp(Symbol.for("font")), "fontStyle", tBold.getaProp(Symbol.for("fontStyle")), "color", rgb("#000000"));
    createWriter(this.pWriterID, tMetrics);
    this.pPlaylistWriterID = getUniqueID();
    const tMetrics2 = propList("font", tBold.getaProp(Symbol.for("font")), "fontStyle", tBold.getaProp(Symbol.for("fontStyle")), "color", rgb("#F59F0A"));
    createWriter(this.pPlaylistWriterID, tMetrics2);
    this.pDiskList = list(propList("name", "Kiss my nose, baby", "author", "Painimies"), propList("name", "Kiss my nose, baby"), propList("name", "Kiss my nose, baby"), VOID, VOID, propList("name", "Kiss my nose, baby"), propList("name", "Kiss my nose, baby"));
    this.pSelectedDisk = 0;
    this.pSelectedEject = 0;
    this.pSelectedLoad = 0;
    this.pItemWidth = 156;
    this.pItemHeight = 39;
    this.pItemMarginX = 6;
    this.pItemMarginY = 1;
    this.pDiskArrayWidth = 2;
    this.pDiskArrayHeight = 5;
    this.pPlaylistLimit = 9;
    this.pPlaylistWidth = 122;
    this.pPlaylistHeight = 14 * this.pPlaylistLimit;
    this.pItemName = "Jukebox slot";
    this.pItemNameSelected = "Jukebox slot2";
    this.pItemNameEmpty = "Jukebox slot empty";
    this.pItemNameEmptySelected = "Jukebox slot empty2";
    this.pEjectName = "Jukebox eject";
    this.pEjectNameSelected = "Jukebox eject2";
    this.pTextEmpty = getText("jukebox_empty");
    this.pTextLoadTrax = getText("jukebox_load_trax");
    this.pOwner = 1;
    this.pDiskListImage = VOID;
    this.pEditorSongID = 0;
  }

  deconstruct() {
    if (writerExists(this.pWriterID)) {
      removeWriter(this.pWriterID);
    }
    if (writerExists(this.pPlaylistWriterID)) {
      removeWriter(this.pPlaylistWriterID);
    }
  }

  setOwner(towner) {
    this.pOwner = towner;
  }

  getOwner() {
    return this.pOwner;
  }

  renderDiskList() {
    if (voidp(this.pDiskListImage)) {
      this.pDiskListRenderList = VOID;
    } else {
      if (this.pDiskListRenderList.findPos(this.pSelectedDisk) == 0) {
        this.pDiskListRenderList.add(this.pSelectedDisk);
      }
    }
    const tRetVal = this.renderList(this.pDiskListImage);
    if (tRetVal != 0) {
      this.pDiskListImage = tRetVal;
    }
    this.pDiskListRenderList = list();
    return tRetVal;
  }

  renderPlaylist(tSongList) {
    if (ilk(tSongList) != Symbol.for("list")) {
      return 0;
    }
    const tImg = image(this.pPlaylistWidth, this.pPlaylistHeight, 32);
    const tWriterObj = getWriter(this.pPlaylistWriterID);
    if (tWriterObj != 0) {
      const tLineSpace = this.pPlaylistHeight / this.pPlaylistLimit;
      for (let i = min(tSongList.count, this.pPlaylistLimit); i >= 1; i--) {
        const tTextImg = tWriterObj.render(tSongList[i]).duplicate();
        const tTextImgTrimmed = image(tTextImg.rect[3], tTextImg.rect[4], 32);
        tTextImgTrimmed.copyPixels(tTextImg, tTextImg.rect, tTextImg.rect, propList("ink", 8, "maskImage", tTextImg.createMatte()));
        const tTextImg2 = tTextImgTrimmed.trimWhiteSpace();
        const tSourceRect = tTextImg2.rect;
        if (tSourceRect[3] > this.pPlaylistWidth) {
          tSourceRect[3] = this.pPlaylistWidth;
        }
        const tTargetRect = tSourceRect.duplicate();
        tTargetRect[2] = tTargetRect[2] + (tLineSpace * (i - 1));
        tTargetRect[4] = tTargetRect[4] + (tLineSpace * (i - 1));
        tImg.copyPixels(tTextImg2, tTargetRect, tSourceRect, propList("ink", 36, "maskImage", tTextImg2.createMatte()));
      }
    }
    return tImg;
  }

  diskListMouseClick(tX, tY) {
    let tEmpty = 0;
    if ((this.pSelectedDisk < 1) || (this.pSelectedDisk > this.pDiskList.count)) {
      if ((this.pSelectedDisk > this.pDiskList.count) && (this.pSelectedDisk <= (this.pDiskArrayWidth * this.pDiskArrayHeight))) {
        tEmpty = 1;
      } else {
        return 0;
      }
    } else {
      if (voidp(this.pDiskList[this.pSelectedDisk])) {
        tEmpty = 1;
      }
    }
    if (tEmpty) {
      this.showLoadDisk();
    } else {
      if (this.pSelectedEject) {
        this.removeDisk();
      } else {
        this.addPlaylistDisk();
      }
    }
    return 0;
  }

  diskListMouseOver(tX, tY) {
    const tItemX = 1 + (tX / (this.pItemWidth + this.pItemMarginX));
    const tItemY = 1 + (tY / (this.pItemHeight + this.pItemMarginY));
    const tItem = tItemX + ((tItemY - 1) * this.pDiskArrayWidth);
    let tRetVal = 0;
    if ((tItem >= 1) && (tItem <= this.pDiskList.count)) {
      const tmember = getMember(this.pEjectNameSelected);
      if ((tmember != 0) && this.pOwner) {
        const tSourceImg = tmember.image;
        const tRect = tSourceImg.rect;
        const tImgWd = tRect[3] - tRect[1];
        const tImgHt = tRect[4] - tRect[2];
        tRect[1] = tRect[1] + ((this.pItemWidth + this.pItemMarginX) * (tItemX - 1)) + (this.pItemWidth - tImgWd);
        tRect[2] = tRect[2] + ((this.pItemHeight + this.pItemMarginY) * (tItemY - 1)) + (this.pItemHeight - tImgHt);
        tRect[3] = tRect[3] + ((this.pItemWidth + this.pItemMarginX) * (tItemX - 1)) + (this.pItemWidth - tImgWd);
        tRect[4] = tRect[4] + ((this.pItemHeight + this.pItemMarginY) * (tItemY - 1)) + (this.pItemHeight - tImgHt);
        if ((tX >= tRect[1]) && (tX <= tRect[3]) && (tY >= tRect[2]) && (tY <= tRect[4])) {
          if (!this.pSelectedEject) {
            tRetVal = 1;
            this.pSelectedEject = 1;
          }
        } else {
          if (this.pSelectedEject) {
            tRetVal = 1;
            this.pSelectedEject = 0;
          }
        }
      }
    }
    if (tItem != this.pSelectedDisk) {
      if (this.pDiskListRenderList.findPos(this.pSelectedDisk) == 0) {
        this.pDiskListRenderList.add(this.pSelectedDisk);
      }
      this.pSelectedDisk = tItem;
      return 1;
    }
    return tRetVal;
  }

  getJukeboxDisks() {
    this.pDiskList = list();
    this.pSelectedDisk = 0;
    this.pSelectedEject = 0;
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("GET_JUKEBOX_DISCS");
    }
    return 0;
  }

  renderList(tImg) {
    if (ilk(this.pDiskList) != Symbol.for("list")) {
      return 0;
    }
    const tWidth = ((this.pItemWidth + this.pItemMarginX) * this.pDiskArrayWidth) - this.pItemMarginX;
    const tHeight = ((this.pItemHeight + this.pItemMarginY) * this.pDiskArrayHeight) - this.pItemMarginY;
    if (voidp(tImg)) {
      tImg = image(tWidth, tHeight, 32);
    }
    const tMemberNormal = getMember(this.pItemName);
    const tMemberSelected = getMember(this.pItemNameSelected);
    const tMemberEmptyNormal = getMember(this.pItemNameEmpty);
    const tMemberEmptySelected = getMember(this.pItemNameEmptySelected);
    const tWriterObj = getWriter(this.pWriterID);
    for (let tY = 0; tY <= this.pDiskArrayHeight - 1; tY++) {
      for (let tX = 0; tX <= this.pDiskArrayWidth - 1; tX++) {
        const tIndex = 1 + tX + (tY * this.pDiskArrayWidth);
        let tRender = 1;
        if (!voidp(this.pDiskListRenderList)) {
          if (this.pDiskListRenderList.findPos(tIndex) == 0) {
            tRender = 0;
          }
        }
        let tmember;
        if (tRender) {
          if ((tIndex != this.pSelectedDisk) || !this.pOwner) {
            tmember = tMemberEmptyNormal;
          } else {
            tmember = tMemberEmptySelected;
          }
          if (tIndex <= this.pDiskList.count) {
            if (this.pDiskList[tIndex] != VOID) {
              if ((tIndex != this.pSelectedDisk) || this.pSelectedEject) {
                tmember = tMemberNormal;
              } else {
                tmember = tMemberSelected;
              }
            }
          }
        }
        if ((tmember != 0) && (tRender == 1)) {
          const tSourceImg = tmember.image;
          const tRect = tSourceImg.rect;
          const tImgWd = tRect[3] - tRect[1];
          const tImgHt = tRect[4] - tRect[2];
          tRect[1] = tRect[1] + ((this.pItemWidth + this.pItemMarginX) * tX);
          tRect[2] = tRect[2] + ((this.pItemHeight + this.pItemMarginY) * tY);
          tRect[3] = tRect[3] + ((this.pItemWidth + this.pItemMarginX) * tX);
          tRect[4] = tRect[4] + ((this.pItemHeight + this.pItemMarginY) * tY);
          tImg.copyPixels(tSourceImg, tRect, tSourceImg.rect, propList("ink", 8, "maskImage", tSourceImg.createMatte()));
          if (tWriterObj != 0) {
            const tDiskName = this.getDiskName(tIndex);
            const tDiskAuthor = this.getDiskAuthor(tIndex);
            const tTextList = list(tDiskName, tDiskAuthor);
            const tTextMarginX = 20;
            const tTextMarginY = 7;
            const tLineSpace = 17;
            for (let i = 1; i <= tTextList.count; i++) {
              const tTextImg = tWriterObj.render(tTextList[i]).duplicate();
              const tTextImgTrimmed = image(tTextImg.rect[3], tTextImg.rect[4], 32);
              tTextImgTrimmed.copyPixels(tTextImg, tTextImg.rect, tTextImg.rect, propList("ink", 8, "maskImage", tTextImg.createMatte()));
              const tTextImg2 = tTextImgTrimmed.trimWhiteSpace();
              const tSourceRect = tTextImg2.rect;
              if (tSourceRect[3] > (this.pItemWidth - (tTextMarginX * 2))) {
                tSourceRect[3] = this.pItemWidth - (tTextMarginX * 2);
              }
              const tTargetRect = tSourceRect.duplicate();
              const tImgWd2 = tTargetRect[3] - tTargetRect[1];
              const tImgHt2 = tTargetRect[4] - tTargetRect[2];
              tTargetRect[1] = tTargetRect[1] + ((this.pItemWidth + this.pItemMarginX) * tX) + ((this.pItemWidth - tImgWd2) / 2);
              tTargetRect[2] = tTargetRect[2] + ((this.pItemHeight + this.pItemMarginY) * tY) + tTextMarginY;
              tTargetRect[3] = tTargetRect[3] + ((this.pItemWidth + this.pItemMarginX) * tX) + ((this.pItemWidth - tImgWd2) / 2);
              tTargetRect[4] = tTargetRect[4] + ((this.pItemHeight + this.pItemMarginY) * tY) + tTextMarginY;
              tTargetRect[2] = tTargetRect[2] + (tLineSpace * (i - 1));
              tTargetRect[4] = tTargetRect[4] + (tLineSpace * (i - 1));
              tImg.copyPixels(tTextImg2, tTargetRect, tSourceRect, propList("ink", 36, "maskImage", tTextImg2.createMatte()));
            }
          }
        }
      }
    }
    if (this.pOwner) {
      tImg = this.renderEjectImage(tImg);
    }
    return tImg;
  }

  renderEjectImage(tImg) {
    const tWidth = ((this.pItemWidth + this.pItemMarginX) * this.pDiskArrayWidth) - this.pItemMarginX;
    const tHeight = ((this.pItemHeight + this.pItemMarginY) * this.pDiskArrayHeight) - this.pItemMarginY;
    if (voidp(tImg)) {
      tImg = image(tWidth, tHeight, 32);
    }
    const tmember = this.pSelectedEject ? getMember(this.pEjectNameSelected) : getMember(this.pEjectName);
    if ((this.pSelectedDisk < 1) || (this.pSelectedDisk > this.pDiskList.count)) {
      return tImg;
    }
    if (voidp(this.pDiskList[this.pSelectedDisk])) {
      return tImg;
    }
    const tY = (this.pSelectedDisk - 1) / this.pDiskArrayWidth;
    const tX = (this.pSelectedDisk - 1) % this.pDiskArrayWidth;
    if (tmember != 0) {
      const tSourceImg = tmember.image;
      const tRect = tSourceImg.rect;
      const tImgWd = tRect[3] - tRect[1];
      const tImgHt = tRect[4] - tRect[2];
      tRect[1] = tRect[1] + ((this.pItemWidth + this.pItemMarginX) * tX) + (this.pItemWidth - tImgWd);
      tRect[2] = tRect[2] + ((this.pItemHeight + this.pItemMarginY) * tY) + (this.pItemHeight - tImgHt);
      tRect[3] = tRect[3] + ((this.pItemWidth + this.pItemMarginX) * tX) + (this.pItemWidth - tImgWd);
      tRect[4] = tRect[4] + ((this.pItemHeight + this.pItemMarginY) * tY) + (this.pItemHeight - tImgHt);
      tImg.copyPixels(tSourceImg, tRect, tSourceImg.rect, propList("ink", 8, "maskImage", tSourceImg.createMatte()));
    }
    return tImg;
  }

  getDiskName(tIndex) {
    if ((tIndex < 1) || (tIndex > this.pDiskList.count)) {
      return this.pTextEmpty;
    }
    if (ilk(this.pDiskList[tIndex]) == Symbol.for("propList")) {
      if (!voidp(this.pDiskList[tIndex][Symbol.for("name")])) {
        return this.pDiskList[tIndex][Symbol.for("name")];
      }
    }
    return this.pTextEmpty;
  }

  getDiskAuthor(tIndex) {
    let tLoad = 0;
    if ((tIndex < 1) || (tIndex > this.pDiskList.count)) {
      tLoad = 1;
    } else {
      if (ilk(this.pDiskList[tIndex]) == Symbol.for("propList")) {
        if (!voidp(this.pDiskList[tIndex][Symbol.for("author")])) {
          return this.pDiskList[tIndex][Symbol.for("author")];
        }
      } else {
        tLoad = 1;
      }
    }
    if (tLoad && this.pOwner) {
      return this.pTextLoadTrax;
    }
    return EMPTY;
  }

  parseDiskList(tMsg) {
    if (voidp(tMsg.connection)) {
      return 0;
    }
    const tSlotCount = tMsg.connection.GetIntFrom();
    this.pDiskList = list();
    for (let i = 1; i <= tSlotCount; i++) {
      this.pDiskList.add(VOID);
    }
    const tDiskCount = tMsg.connection.GetIntFrom();
    for (let i = 1; i <= tDiskCount; i++) {
      const tSlot = tMsg.connection.GetIntFrom();
      const tID = tMsg.connection.GetIntFrom();
      const tLength = tMsg.connection.GetIntFrom();
      let tName = tMsg.connection.GetStrFrom();
      let tAuthor = tMsg.connection.GetStrFrom();
      tName = convertSpecialChars(tName, 0);
      tAuthor = convertSpecialChars(tAuthor, 0);
      const tDisk = propList("id", tID, "name", tName, "author", tAuthor);
      if ((tSlot >= 1) && (tSlot <= tSlotCount)) {
        this.pDiskList[tSlot] = tDisk;
      }
    }
    this.pDiskListImage = VOID;
    return 1;
  }

  showLoadDisk() {
    if (this.pOwner) {
      this.pSelectedLoad = this.pSelectedDisk;
      executeMessage(Symbol.for("show_select_disk"));
    }
  }

  insertDisk(tID) {
    if ((this.pSelectedLoad < 1) || (this.pSelectedLoad > this.pDiskList.count)) {
      return 0;
    }
    if (!voidp(this.pDiskList[this.pSelectedLoad])) {
      return 0;
    }
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("ADD_JUKEBOX_DISC", propList("integer", tID, "integer", this.pSelectedLoad));
    }
    return 0;
  }

  removeDisk() {
    if ((this.pSelectedDisk < 1) || (this.pSelectedDisk > this.pDiskList.count)) {
      return 0;
    }
    if (voidp(this.pDiskList[this.pSelectedDisk])) {
      return 0;
    }
    this.pDiskList[this.pSelectedDisk] = VOID;
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("REMOVE_JUKEBOX_DISC", propList("integer", this.pSelectedDisk));
    }
    return 0;
  }

  addPlaylistDisk() {
    if ((this.pSelectedDisk < 1) || (this.pSelectedDisk > this.pDiskList.count)) {
      return 0;
    }
    if (voidp(this.pDiskList[this.pSelectedDisk])) {
      return 0;
    }
    const tID = this.pDiskList[this.pSelectedDisk][Symbol.for("id")];
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("JUKEBOX_PLAYLIST_ADD", propList("integer", tID));
    }
    return 0;
  }
}
