export default class {
  pFriendRenderQueue;
  pTasksPerUpdate;
  pNeedsRender;

  construct() {
    this.pFriendRenderQueue = list();
    this.pTasksPerUpdate = 6;
    this.pNeedsRender = 1;
    return this.ancestor.construct();
  }

  hasQueue() {
    return this.pFriendRenderQueue.count > 0;
  }

  update(tContentElem) {
    if (this.pFriendRenderQueue.count == 0) {
      return 1;
    }
    this.renderFromQueue(tContentElem);
  }

  renderListImage() {
    nothing();
  }

  needsRender() {
    return this.pNeedsRender;
  }

  resetRenderFlag() {
    this.pNeedsRender = 0;
  }

  getViewImage() {
    if (this.pContentList.count == 0) {
      const tID = getUniqueID();
      createWriter(tID);
      const tWriter = getWriter(tID);
      const tFont = getStructVariable("struct.font.plain");
      tFont.setaProp(Symbol.for("wordWrap"), 1);
      const tOffsets = rect(5, 2, 5, 2);
      const tWidth = getVariable("fr.list.panel.width") - (tOffsets[1] * 2);
      tFont.setaProp(Symbol.for("rect"), rect(0, 0, tWidth, 0));
      tWriter.define(tFont);
      const tEmptyListTextImg = tWriter.render(this.pEmptyListText);
      const tEmptyListImg = image(tEmptyListTextImg.width + tOffsets[1], tEmptyListTextImg.height + tOffsets[2], 32);
      tEmptyListImg.copyPixels(tEmptyListTextImg, tEmptyListImg.rect + tOffsets, tEmptyListImg.rect);
      return tEmptyListImg;
    }
    const tImage = this.renderBackgroundImage();
    tImage.copyPixels(this.pListImg, this.pListImg.rect, this.pListImg.rect, [Symbol.for("ink"): 36]);
    return tImage;
  }

  insertImageTo(tSourceImg, tTargetImg, tPosV) {
    const tNewImg = image(tTargetImg.width, tTargetImg.height + tSourceImg.height, 32);
    const tTopRect = rect(0, 0, tTargetImg.width, tPosV);
    tNewImg.copyPixels(tTargetImg, tTopRect, tTopRect);
    let tdestrect = rect(0, tTopRect.height, tSourceImg.width, tTopRect.height + tSourceImg.height);
    tNewImg.copyPixels(tSourceImg, tdestrect, tSourceImg.rect);
    const tSourceRect = rect(0, tPosV, tTargetImg.width, tTargetImg.height);
    tdestrect = tSourceRect + rect(0, tSourceImg.height, 0, tSourceImg.height);
    tNewImg.copyPixels(tTargetImg, tdestrect, tSourceRect);
    return tNewImg;
  }

  updateImagePart(tSourceImg, tTargetImg, tPosV) {
    const tdestrect = rect(0, tPosV, tSourceImg.width, tPosV + tSourceImg.height);
    tTargetImg.copyPixels(tSourceImg, tdestrect, tSourceImg.rect);
    return tTargetImg;
  }

  removeImagePart(tImage, tStartPosV, tEndPosV) {
    const tNewImg = image(this.pItemWidth, tImage.height - (tEndPosV - tStartPosV), 32);
    const tTopRect = rect(0, 0, tImage.width, tStartPosV);
    tNewImg.copyPixels(tImage, tTopRect, tTopRect);
    const tSourceRect = rect(0, tEndPosV, tImage.width, tImage.height);
    const tdestrect = rect(0, tStartPosV, tImage.width, tNewImg.height);
    tNewImg.copyPixels(tImage, tdestrect, tSourceRect);
    return tNewImg;
  }
}
