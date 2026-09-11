export default class {
  pEventData;
  pListLine;
  pWriter;
  pLineHeight;
  pListWidth;

  construct() {
    this.pEventData = list();
    this.pLineHeight = 20;
    this.pListWidth = 200;
    let tFont = getStructVariable("struct.font.plain");
    let tID = getUniqueID();
    createWriter(tID, tFont);
    this.pWriter = getWriter(tID);
    return 1;
  }

  deconstruct() {
    return 1;
  }

  setEvents(tEventData) {
    this.pEventData = tEventData;
  }

  generateTestData(tCount) {
    this.pEventData = list();
    for (let i = 1; i <= tCount; i++) {
      let tEvent = propList();
      tEvent.setaProp(Symbol.for("flatId"), i);
      tEvent.setaProp(Symbol.for("host"), `host ${i}`);
      tEvent.setaProp(Symbol.for("time"), `time ${i}`);
      tEvent.setaProp(Symbol.for("name"), `name ${i}`);
      tEvent.setaProp(Symbol.for("desc"), `desc ${i}`);
      this.pEventData.add(tEvent.duplicate());
    }
  }

  renderListImage() {
    if (!listp(this.pEventData)) {
      return 0;
    }
    let tListImage = image(this.pListWidth, this.pLineHeight * this.pEventData.count, 8);
    let tListColors = list(rgb("#EFEFEF"), rgb("#E1E1E1"));
    let tBgImages = list();
    for (const tColor of tListColors) {
      let tImage = image(this.pListWidth, this.pLineHeight, 8);
      tImage.fill(tImage.rect, tColor);
      tBgImages.add(tImage);
    }
    let tArrowsString = ">>";
    let tArrowImage = this.pWriter.render(tArrowsString).duplicate();
    let tMarginH = rect(5, 0, 5, 0);
    let tMarginV = rect(0, 5, 0, 5);
    if (this.pEventData.count > 0) {
      for (let tLine = 1; tLine <= this.pEventData.count; tLine++) {
        let tLineImage = tBgImages[(tLine % 2) + 1].duplicate();
        let tName = this.pEventData[tLine].getaProp(Symbol.for("name"));
        let tTextImage = this.pWriter.render(tName).duplicate();
        tLineImage.copyPixels(tTextImage, tTextImage.rect + tMarginH + tMarginV, tTextImage.rect);
        let tTargetRect = rect(tLineImage.width - tArrowImage.width, 0, tLineImage.width, tArrowImage.height);
        tLineImage.copyPixels(tArrowImage, tTargetRect + tMarginV, tArrowImage.rect);
        let tFullRect = rect(0, (tLine - 1) * this.pLineHeight, this.pListWidth, tLine * this.pLineHeight);
        tListImage.copyPixels(tLineImage, tFullRect, tLineImage.rect);
        this.pEventData[tLine].setaProp(Symbol.for("rect"), tFullRect);
      }
    } else {
      tListImage = image(this.pListWidth, this.pLineHeight, 8);
      let tLineImage = tBgImages[1].duplicate();
      let tTextImage = this.pWriter.render(getText("roomevent_not_available")).duplicate();
      tLineImage.copyPixels(tTextImage, tTextImage.rect + tMarginH + tMarginV, tTextImage.rect);
      tListImage.copyPixels(tLineImage, tLineImage.rect, tLineImage.rect);
    }
    return tListImage;
  }

  getEventAt(tpoint) {
    let tLine = (tpoint[2] / this.pLineHeight) + 1;
    if (tLine > this.pEventData.count) {
      return 0;
    }
    return this.pEventData[tLine];
  }
}
