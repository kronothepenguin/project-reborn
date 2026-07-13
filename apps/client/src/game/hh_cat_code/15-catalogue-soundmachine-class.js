export default class {
  pSoundPackagePreviewPrefix;
  pPlayTimeoutMillis;
  pLastPlayTime;

  construct() {
    this.pSoundPackagePreviewPrefix = "sound_set_preview_";
    this.pPlayTimeoutMillis = 1000;
    this.pLastPlayTime = 0;
    return 1;
  }

  deconstruct() {
    return 1;
  }

  define(tPageProps) {
    this.setPreviewState(Symbol.for("hidden"));
  }

  setPreviewState(tstate) {
    let tWindowObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tWindowObj) {
      tWindowObj = VOID;
      return error(this, "Couldn't access catalogue window!", Symbol.for("setPreviewState"), Symbol.for("major"));
    }
    let tPreviewTextElem = "play_preview_text";
    let tPreviewIconElem = "play_preview_icon";
    if (!tWindowObj.elementExists(tPreviewTextElem)) {
      return 0;
    }
    if (!tWindowObj.elementExists(tPreviewIconElem)) {
      return 0;
    }
    if (voidp(tstate)) {
      then(tstate = Symbol.for("hidden"));
    }
    let tTextElem = tWindowObj.getElement(tPreviewTextElem);
    let tIconElem = tWindowObj.getElement(tPreviewIconElem);
    switch (tstate) {
      case Symbol.for("hidden"):
        tTextElem.setProperty(Symbol.for("visible"), 0);
        tIconElem.setProperty(Symbol.for("visible"), 0);
        break;
      case Symbol.for("download"):
        tTextElem.setProperty(Symbol.for("visible"), 1);
        tTextElem.setText(getText("preview_downloading"));
        tIconElem.setProperty(Symbol.for("visible"), 1);
        tIconElem.setProperty(Symbol.for("blend"), 50);
        break;
      case Symbol.for("playable"):
        tTextElem.setProperty(Symbol.for("visible"), 1);
        tTextElem.setText(getText("play_preview"));
        tIconElem.setProperty(Symbol.for("visible"), 1);
        tIconElem.setProperty(Symbol.for("blend"), 100);
        break;
    }
  }

  prepareItemPreview(tItem) {
    let tSoundSetClass = tItem[Symbol.for("class")];
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    let tSoundSetNo = tSoundSetClass.item[3];
    the.itemDelimiter = tDelim;
    let tPreviewPackage = `${this.pSoundPackagePreviewPrefix}${tSoundSetNo}`;
    if (!memberExists(tPreviewPackage)) {
      if (threadExists(Symbol.for("dynamicdownloader"))) {
        let tParentId = `${"sound_set_"}${tSoundSetNo}`;
        getThread(Symbol.for("dynamicdownloader")).getComponent().downloadCastDynamically(tPreviewPackage, Symbol.for("sound"), this.getID(), Symbol.for("soundDownloadCompleted"), VOID, VOID, tParentId);
      } else {
        return error(this, "Dynamic downloader does not exist, cannot download sound.", Symbol.for("startSampleDownload"), Symbol.for("major"));
      }
      this.setPreviewState(Symbol.for("download"));
    } else {
      this.setPreviewState(Symbol.for("playable"));
    }
  }

  soundDownloadCompleted(tPreviewPackage) {
    let tThread = getThread(Symbol.for("catalogue"));
    let tCatInterface = tThread.getInterface();
    let tSelectedProduct = tCatInterface.getSelectedProduct();
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    let tSelectedProductPreviewNo = tSelectedProduct[Symbol.for("class")].item[3];
    let tPreviewPackageNo = tPreviewPackage.item[4];
    the.itemDelimiter = tDelim;
    if (tSelectedProductPreviewNo == tPreviewPackageNo) {
      this.setPreviewState(Symbol.for("playable"));
    }
  }

  playPreviewOfSelected() {
    if ((the.milliSeconds - this.pLastPlayTime) < this.pPlayTimeoutMillis) {
      return 0;
    }
    this.pLastPlayTime = the.milliSeconds;
    let tThread = getThread(Symbol.for("catalogue"));
    let tCatInterface = tThread.getInterface();
    let tSelectedProduct = tCatInterface.getSelectedProduct();
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    let tSelectedProductPreviewNo = tSelectedProduct[Symbol.for("class")].item[3];
    the.itemDelimiter = tDelim;
    let tPreviewPackage = `${this.pSoundPackagePreviewPrefix}${tSelectedProductPreviewNo}`;
    if (memberExists(tPreviewPackage)) {
      playSound(tPreviewPackage, Symbol.for("cut"), propList("loopCount", 1, "infiniteloop", 0, "volume", 255));
    }
  }

  eventProc(tEvent, tSprID, tProp) {
    let tThread = getThread(Symbol.for("catalogue"));
    let tCatInterface = tThread.getInterface();
    let tSelectedProduct = tCatInterface.getSelectedProduct();
    if (tEvent == Symbol.for("mouseUp")) {
      if (tSprID.contains("ctlg_small_img")) {
        if (ilk(tSelectedProduct) == Symbol.for("propList")) {
          if (tSelectedProduct[Symbol.for("class")].contains("sound_set")) {
            this.prepareItemPreview(tSelectedProduct);
          } else {
            this.setPreviewState(Symbol.for("hidden"));
          }
        } else {
          this.setPreviewState(Symbol.for("hidden"));
        }
      } else {
        switch (tSprID) {
          case "play_preview_icon":
            this.playPreviewOfSelected();
            break;
        }
      }
    }
  }
}
