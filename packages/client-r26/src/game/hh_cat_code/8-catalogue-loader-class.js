export default class {
  pState;
  pAnimImage;
  pQuad;
  pFrameCounter;

  construct() {
    this.pState = 0;
    this.pFrameCounter = 0;
    return 1;
  }

  deconstruct() {
    return 1;
  }

  showLoadingScreen() {
    this.pState = 1;
    let tWinObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tWinObj) {
      return;
    }
    if (!tWinObj.elementExists("ctlg_loading_box")) {
      if (!tWinObj.merge("ctlg_loading.window")) {
        return tWinObj.close();
      }
      let tID = "ctlg_loading_bg";
      if (tWinObj.elementExists(tID)) {
        tWinObj.getElement(tID).setProperty(Symbol.for("visible"), 1);
        tWinObj.getElement(tID).setProperty(Symbol.for("blend"), 70);
      }
      for (const tID of ["ctlg_loading_box", "ctlg_loading_anim", "ctlg_loading_text"]) {
        if (tWinObj.elementExists(tID)) {
          tWinObj.getElement(tID).setProperty(Symbol.for("visible"), 1);
          tWinObj.getElement(tID).setProperty(Symbol.for("blend"), 100);
        }
      }
    }
    if (this.pAnimImage.ilk != Symbol.for("image")) {
      if (memberExists("ctlg_loading_icon2")) {
        this.pAnimImage = member(getmemnum("ctlg_loading_icon2")).image;
        this.pQuad = list(point(0, 0), point(this.pAnimImage.width, 0), point(this.pAnimImage.width, this.pAnimImage.height), point(0, this.pAnimImage.height));
      }
    }
    this.pFrameCounter = 100;
    update(this);
    receiveUpdate(this.getID());
  }

  hideLoadingScreen() {
    this.pState = 0;
    removeUpdate(this.getID());
    let tWinObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tWinObj) {
      return;
    }
    if (tWinObj.elementExists("ctlg_loading_box")) {
      tWinObj.unmerge();
    }
  }

  update() {
    if (!this.pState) {
      return;
    }
    if (this.pAnimImage.ilk != Symbol.for("image")) {
      return;
    }
    if (this.pFrameCounter > 2) {
      let tWinObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
      if (!tWinObj) {
        removeUpdate(this.getID());
      }
      let tID = "ctlg_loading_anim";
      if (tWinObj.elementExists(tID)) {
        let t1 = this.pQuad[1];
        let t2 = this.pQuad[2];
        let t3 = this.pQuad[3];
        let t4 = this.pQuad[4];
        this.pQuad = list(t2, t3, t4, t1);
        let tImage = tWinObj.getElement(tID).getProperty(Symbol.for("image"));
        tImage.copyPixels(this.pAnimImage, this.pQuad, this.pAnimImage.rect);
        tWinObj.getElement(tID).feedImage(tImage);
      }
      this.pFrameCounter = 0;
    }
    this.pFrameCounter = this.pFrameCounter + 1;
  }
}
