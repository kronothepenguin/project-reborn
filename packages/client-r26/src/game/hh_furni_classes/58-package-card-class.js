export default class {
  pMessage;
  pPackageID;
  pCardWndID;
  pNoIconPlaceholderName;
  pIconType;
  pIconCode;
  pIconColor;

  construct() {
    this.pMessage = EMPTY;
    this.pPackageID = EMPTY;
    this.pCardWndID = `Card ${getUniqueID()}`;
    this.pNoIconPlaceholderName = "icon_placeholder";
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("hideCard"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("hideCard"));
    this.pIconType = VOID;
    this.pIconCode = VOID;
    this.pIconColor = VOID;
    return 1;
  }

  deconstruct() {
    if (windowExists(this.pCardWndID)) {
      removeWindow(this.pCardWndID);
    }
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    return 1;
  }

  define(tProps) {
    this.pPackageID = tProps[Symbol.for("id")];
    this.pMessage = tProps[Symbol.for("Msg")];
    this.showCard(tProps[Symbol.for("loc")] + list(0, -220));
    return 1;
  }

  showCard(tloc) {
    if (windowExists(this.pCardWndID)) {
      removeWindow(this.pCardWndID);
    }
    if (voidp(tloc)) {
      tloc = list(100, 100);
    }
    if (tloc[1] > ((the.stage).rect.width - 260)) {
      tloc[1] = (the.stage).rect.width - 260;
    }
    if (tloc[2] < 2) {
      tloc[2] = 2;
    }
    if (!createWindow(this.pCardWndID, "package_card.window", tloc[1], tloc[2])) {
      return 0;
    }
    const tWndObj = getWindow(this.pCardWndID);
    const tUserRights = getObject(Symbol.for("session")).GET("user_rights");
    const tUserCanOpen = getObject(Symbol.for("session")).GET("room_owner") || tUserRights.findPos("fuse_pick_up_any_furni");
    if (!tUserCanOpen && (tWndObj.getElement("open_package") != 0)) {
      tWndObj.getElement("open_package").hide();
    }
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcCard"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.getElement("package_msg").setText(this.pMessage);
    return 1;
  }

  hideCard() {
    if (windowExists(this.pCardWndID)) {
      removeWindow(this.pCardWndID);
    }
    return 1;
  }

  openPresent() {
    return getThread(Symbol.for("room")).getComponent().getRoomConnection().send("PRESENTOPEN", this.pPackageID);
  }

  showContent(tdata) {
    if (!windowExists(this.pCardWndID)) {
      return 0;
    }
    this.pIconType = tdata[Symbol.for("type")];
    this.pIconCode = tdata[Symbol.for("code")];
    this.pIconColor = tdata[Symbol.for("color")];
    let tMemNum = VOID;
    if (this.pIconColor == EMPTY) {
      this.pIconColor = VOID;
    }
    switch (this.pIconType) {
      case "ticket":
        tMemNum = getmemnum("ticket_icon");
        break;
      case "film":
        tMemNum = getmemnum("film_icon");
        break;
    }
    if (this.pIconType.contains("*")) {
      const tDelim = the.itemDelimiter;
      the.itemDelimiter = "*";
      this.pIconType = this.pIconType.item[1];
      the.itemDelimiter = tDelim;
    }
    if (memberExists(`${this.pIconCode}_small`)) {
      tMemNum = getmemnum(`${this.pIconCode}_small`);
    } else {
      if (memberExists(`ctlg_pic_small_${this.pIconCode}`)) {
        tMemNum = getmemnum(`ctlg_pic_small_${this.pIconCode}`);
      }
    }
    let tImg;
    if (tMemNum == 0) {
      const tDynThread = getThread(Symbol.for("dynamicdownloader"));
      if (tDynThread == 0) {
        tImg = getObject("Preview_renderer").renderPreviewImage(VOID, VOID, this.pIconColor, this.pIconType);
      } else {
        let tDownloadIdName = EMPTY;
        if (this.pIconType.contains("poster")) {
          tDownloadIdName = this.pIconCode;
        } else {
          tDownloadIdName = this.pIconType;
        }
        const tDynComponent = tDynThread.getComponent();
        let tRoomSizePrefix = EMPTY;
        const tRoomThread = getThread(Symbol.for("room"));
        if (tRoomThread != 0) {
          const tTileSize = tRoomThread.getInterface().getGeometry().getTileWidth();
          if (tTileSize == 32) {
            tRoomSizePrefix = "s_";
          }
        }
        tDownloadIdName = `${tRoomSizePrefix}${tDownloadIdName}`;
        if (!tDynComponent.isAssetDownloaded(tDownloadIdName)) {
          tDynComponent.downloadCastDynamically(tDownloadIdName, Symbol.for("unknown"), this.getID(), Symbol.for("packetIconDownloadCallback"), 1);
          tImg = member(this.pNoIconPlaceholderName).image;
        } else {
          this.packetIconDownloadCallback(tDownloadIdName);
        }
      }
    } else {
      tImg = member(tMemNum).image.duplicate();
    }
    this.feedIconToCard(tImg);
  }

  packetIconDownloadCallback(tDownloadedClass) {
    let tImg;
    if (tDownloadedClass.contains("poster")) {
      tImg = getObject("Preview_renderer").renderPreviewImage(VOID, VOID, this.pIconColor, this.pIconCode);
    } else {
      tImg = getObject("Preview_renderer").renderPreviewImage(VOID, VOID, this.pIconColor, this.pIconType);
    }
    this.feedIconToCard(tImg);
  }

  feedIconToCard(tImg) {
    if (ilk(tImg) != Symbol.for("image")) {
      return error(this, "tImg is not an #image", Symbol.for("feedIconToCard"), Symbol.for("major"));
    }
    const tWndObj = getWindow(this.pCardWndID);
    const tElem = tWndObj.getElement("small_img");
    const tWid = tElem.getProperty(Symbol.for("width"));
    const tHei = tElem.getProperty(Symbol.for("height"));
    const tCenteredImage = image(tWid, tHei, 32);
    const tMatte = tImg.createMatte();
    const tXchange = (tCenteredImage.width - tImg.width) / 2;
    const tYchange = (tCenteredImage.height - tImg.height) / 2;
    const tRect1 = tImg.rect + rect(tXchange, tYchange, tXchange, tYchange);
    tCenteredImage.copyPixels(tImg, tRect1, tImg.rect, propList("maskImage", tMatte, "ink", 41));
    tElem.feedImage(tCenteredImage);
    tWndObj.getElement("card_icon").hide();
    tWndObj.getElement("small_img").setProperty(Symbol.for("blend"), 100);
    tWndObj.getElement("open_package").hide();
  }

  eventProcCard(tEvent, tElemID, tParam) {
    if (tEvent != Symbol.for("mouseUp")) {
      return 0;
    }
    switch (tElemID) {
      case "close":
        return this.hideCard();
      case "open_package":
        return this.openPresent();
    }
  }
}
