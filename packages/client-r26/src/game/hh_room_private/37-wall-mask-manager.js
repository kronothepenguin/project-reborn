export default class {
  pMask;
  pMaskImage;
  pMaskList;
  pREquiresUpdate;

  construct() {
    this.pMaskList = propList();
    this.initMask();
    return 1;
  }

  deconstruct() {
    return 1;
  }

  requiresUpdate() {
    return this.pREquiresUpdate;
  }

  getMask() {
    if (this.pREquiresUpdate) {
      this.renderMask();
    }
    this.pREquiresUpdate = 0;
    return this.pMask;
  }

  insertWallMaskItem(tID, tClassID, tloc, tdir, tSize) {
    const tMaskProps = propList();
    tMaskProps.setaProp(Symbol.for("id"), tID);
    tMaskProps.setaProp(Symbol.for("class"), tClassID);
    tMaskProps.setaProp(Symbol.for("loc"), tloc);
    tMaskProps.setaProp(Symbol.for("Dir"), tdir);
    tMaskProps.setaProp(Symbol.for("size"), tSize);
    this.pMaskList.setaProp(tID, tMaskProps);
    this.pREquiresUpdate = 1;
  }

  removeWallMaskItem(tID) {
    this.pMaskList.deleteProp(tID);
    this.pREquiresUpdate = 1;
  }

  getItemCount() {
    return this.pMaskList.count;
  }

  initMask() {
    const tWidth = the.stage.rect.width;
    const tHeight = the.stage.rect.height;
    this.pMaskImage = image(tWidth, tHeight, 8);
    this.pMaskImage.fill(this.pMaskImage.rect, rgb("FFFFFF"));
    let pIsChanged = 1;
  }

  renderMask() {
    this.pMaskImage.fill(this.pMaskImage.rect, rgb("FFFFFF"));
    for (const tMask of this.pMaskList) {
      let tloc = tMask[Symbol.for("loc")];
      const tClass = tMask[Symbol.for("class")];
      const tdir = tMask[Symbol.for("Dir")];
      const tSize = tMask[Symbol.for("size")];
      let tNameTemplate = getVariable("mask.membername.template");
      let tMemberName = replaceChunks(tNameTemplate, "%class%", tClass);
      tMemberName = replaceChunks(tMemberName, "%dir%", tdir);
      if (tSize == 32) {
        tMemberName = `s_${tMemberName}`;
      }
      if (!memberExists(tMemberName)) {
        continue;
      }
      const tMemNum = getmemnum(tMemberName);
      const tmember = member(abs(tMemNum));
      let tMaskImage = tmember.image;
      let tRegPoint = tmember.regPoint;
      if (tdir == "rightwall") {
        tRegPoint = point(tMaskImage.width - tRegPoint[1], tRegPoint[2]);
      }
      tloc = tloc - tRegPoint;
      const tBottomRight = tloc + point(tMaskImage.width, tMaskImage.height);
      let tQuad;
      if (tMemNum > 0) {
        tQuad = [tloc, point(tBottomRight[1], tloc[2]), tBottomRight, point(tloc[1], tBottomRight[2])];
      } else {
        tQuad = [point(tBottomRight[1], tloc[2]), tloc, point(tloc[1], tBottomRight[2]), tBottomRight];
      }
      this.pMaskImage.copyPixels(tMaskImage, tQuad, tMaskImage.rect, propList(Symbol.for("ink"), 36));
    }
    if (ilk(this.pMaskImage) == Symbol.for("image")) {
      this.pMask = this.pMaskImage.createMask();
    }
  }
}
