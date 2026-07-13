export default class {
  pPhotoCache;
  pPhotoWindow;
  pWindowID;
  pItemId;
  pPhotoId;
  pLastPhotoData;
  pLocX;
  pLocY;
  pPhotoMember;
  pFilm;
  pPhotoTime;
  pPhotoText;

  construct() {
    this.pWindowID = Symbol.for("photo_window");
    this.pPhotoCache = propList();
    this.pPhotoMember = VOID;
    createWriter(Symbol.for("photo_timestamp_writer_black"), propList("color", rgb(0, 0, 0)));
    createWriter(Symbol.for("photo_timestamp_writer_white"), propList("color", rgb(255, 255, 240)));
    return 1;
  }

  deconstruct() {
    if (this.pPhotoMember.ilk == Symbol.for("member")) {
      removeMember(this.pPhotoMember.name);
      this.pPhotoMember = VOID;
    }
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    removeWriter(Symbol.for("photo_timestamp_writer_black"));
    removeWriter(Symbol.for("photo_timestamp_writer_white"));
    return 1;
  }

  storePicture(tmember, tText) {
    if (!voidp(tText)) {
      tText = getStringServices().convertSpecialChars(tText, 1);
    }
    let tCS = this.countCS(tmember.image);
    let tdata = propList("image", tmember.media, "time", `${the.date} ${the.time}`, "cs", tCS);
    addMessageToBinaryQueue(`${"PHOTOTXT /"}${tText}`);
    storeBinaryData(tdata, this.getID());
    this.pLastPhotoData = tdata;
  }

  binaryDataStored(tID) {
    this.getInterface().saveOk();
    this.pPhotoCache.setaProp(tID, this.pLastPhotoData);
    this.pLastPhotoData = VOID;
  }

  binaryDataReceived(tdata, tID) {
    if (ilk(tdata) != Symbol.for("propList")) {
      return 0;
    }
    if (tdata[Symbol.for("image")] == VOID) {
      return 0;
    }
    let tText = this.pPhotoText;
    this.pPhotoCache.setaProp(tID, tdata);
    if (!windowExists(this.pWindowID)) {
      return 0;
    }
    getWindow(this.pWindowID).getElement("photo_text").setText(tText);
    if (this.pPhotoMember.ilk != Symbol.for("member")) {
      this.pPhotoMember = member(createMember(getUniqueID(), Symbol.for("bitmap")));
    }
    this.pPhotoMember.media = tdata[Symbol.for("image")];
    let tCheckSumOk;
    if (tdata[Symbol.for("cs")] != VOID) {
      tCheckSumOk = this.countCS(this.pPhotoMember.image) == tdata[Symbol.for("cs")];
    } else {
      tCheckSumOk = 0;
    }
    if (tCheckSumOk == 0) {
      this.pPhotoMember.media = member(getmemnum("photo_invalid")).media;
    } else {
      if ((this.pPhotoTime != VOID) && (length(this.pPhotoTime) > 5)) {
        let tBlackImg = getWriter(Symbol.for("photo_timestamp_writer_black")).render(this.pPhotoTime);
        let tWhiteImg = getWriter(Symbol.for("photo_timestamp_writer_white")).render(this.pPhotoTime);
        let tL = this.pPhotoMember.image.width - 3 - tBlackImg.width;
        let tt = this.pPhotoMember.image.height - 3 - tBlackImg.height;
        let tR = rect(tL, tt, tL + tBlackImg.width, tt + tBlackImg.height);
        this.pPhotoMember.image.copyPixels(tBlackImg, tR + rect(-1, 0, -1, 0), tBlackImg.rect, propList("ink", 36));
        this.pPhotoMember.image.copyPixels(tBlackImg, tR + rect(1, 0, 1, 0), tBlackImg.rect, propList("ink", 36));
        this.pPhotoMember.image.copyPixels(tBlackImg, tR + rect(0, 1, 0, 1), tBlackImg.rect, propList("ink", 36));
        this.pPhotoMember.image.copyPixels(tBlackImg, tR + rect(0, -1, 0, -1), tBlackImg.rect, propList("ink", 36));
        this.pPhotoMember.image.copyPixels(tWhiteImg, tR, tBlackImg.rect, propList("ink", 36));
      }
    }
    getWindow(this.pWindowID).getElement("photo_picture").setProperty(Symbol.for("buffer"), this.pPhotoMember);
  }

  openPhoto(tItemID, tLocX, tLocY) {
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    this.pLocX = tLocX;
    this.pLocY = tLocY;
    registerMessage(Symbol.for(`itemdata_received${tItemID}`), this.getID(), Symbol.for("setItemData"));
    getConnection(getVariable("connection.room.id")).send("G_IDATA", tItemID);
  }

  countCS(tImg) {
    let tL = list(3, 2, 73, 28, 83, 21, 43, 90, 92, 91, 37, 4, 3, 84, 12, 102, 103, 108, 97, 43, 44, 89, 109, 65, 61, -4, 76);
    let tA = 0;
    let tW = tImg.width;
    let tH = tImg.height;
    for (let i = 1; i <= 100; i++) {
      tA = (tA + (tImg.getPixel(i % tW, (i * i) % tH).paletteIndex * tL[((i % tL.count) + 1)])) % 85000;
    }
    return tA;
  }

  setFilm(tFilm) {
    this.pFilm = tFilm;
    this.getInterface().setButtonHilites();
    this.getInterface().updateFilm();
  }

  getFilm() {
    return this.pFilm;
  }

  setItemData(tMsg) {
    this.pItemId = tMsg[Symbol.for("id")];
    let tLine1 = tMsg[Symbol.for("text")].line[1];
    let tAuthId = tLine1.word[1];
    this.pPhotoTime = tLine1.word[`${2}..${tLine1.word.count}`];
    this.pPhotoText = tMsg[Symbol.for("text")].line[`${2}..${tMsg[Symbol.for("text")].line.count}`];
    this.pPhotoText = this.convertScandinavian(this.pPhotoText);
    unregisterMessage(Symbol.for(`itemdata_received${this.pItemId}`), this.getID());
    if (this.pLocX > 500) {
      this.pLocX = 500;
    }
    if (this.pLocY < 100) {
      this.pLocY = 100;
    }
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    if (!createWindow(this.pWindowID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pWindowID);
    tWndObj.merge("photo_window.window");
    tWndObj.moveTo(this.pLocX, this.pLocY);
    tWndObj.registerProcedure(Symbol.for("eventProcPhotoMouseDown"), this.getID(), Symbol.for("mouseDown"));
    if (this.pPhotoCache.getaProp(this.pPhotoId) == VOID) {
      retrieveBinaryData(this.pItemId, tAuthId, this.getID());
    } else {
      this.binaryDataReceived(this.pPhotoCache.getaProp(this.pPhotoId), this.pPhotoId);
    }
    let towner = getObject(Symbol.for("session")).GET("room_owner");
    let tCanRemovePhotos = getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_remove_photos");
    if (!towner && !tCanRemovePhotos) {
      tWndObj.getElement("photo_remove").setProperty(Symbol.for("visible"), 0);
    }
  }

  convertScandinavian(tString) {
    if (tString.length < 6) {
      return tString;
    }
    let tEncArray = propList("&AUML;", "ƒ", "&OUML;", "Ö", "&auml;", "ä", "&ouml;", "ö");
    let tOutputStr = EMPTY;
    for (let i = 1; i <= tString.length; i++) {
      let tChar = tString.char[i];
      if (!(tChar == "&")) {
        putAfter(tOutputStr, tChar);
        continue;
      }
      let tChunkArr = chars(tString, i, i + 5);
      let tChunkScan = getaProp(tEncArray, tChunkArr);
      if (tChunkScan != VOID) {
        putAfter(tOutputStr, tChunkScan);
        i = i + 5;
        continue;
      }
      putAfter(tOutputStr, "&");
    }
    return tOutputStr;
  }

  eventProcPhotoMouseDown(tEvent, tElemID, tParam) {
    switch (tElemID) {
      case "photo_close":
        removeWindow(this.pWindowID);
        break;
      case "photo_remove":
        if (getThread("room").getComponent().getRoomConnection().send("REMOVEITEM", this.pItemId)) {
          removeWindow(this.pWindowID);
        }
        break;
    }
  }
}
