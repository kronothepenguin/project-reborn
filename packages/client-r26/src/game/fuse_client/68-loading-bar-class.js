export default class {
  pTaskId;
  pBuffer;
  pBgColor;
  pcolor;
  pwidth;
  pheight;
  pBarRect;
  pOffRect;
  pTaskType;
  pPercent;
  pDrawPoint;
  pWindowID;
  pReadyFlag;

  construct() {
    let tProps = propList("bgColor", the.stage.bgColor, "color", rgb(128, 128, 128), "width", 128, "height", 16);
    tProps = getVariableValue("loading.bar.props", tProps);
    this.pTaskId = EMPTY;
    this.pBuffer = the.stage.image;
    this.pwidth = tProps[Symbol.for("width")];
    this.pheight = tProps[Symbol.for("height")];
    this.pBgColor = tProps[Symbol.for("bgColor")];
    this.pcolor = tProps[Symbol.for("color")];
    this.pTaskType = Symbol.for("cast");
    this.pDrawPoint = 0;
    this.pWindowID = EMPTY;
    this.pReadyFlag = 0;
    return 1;
  }

  deconstruct() {
    this.pTaskId = VOID;
    removePrepare(this.getID());
    if (this.pWindowID != EMPTY) {
      removeWindow(this.pWindowID);
      this.pWindowID = EMPTY;
    }
    return 1;
  }

  define(tLoadID, tProps) {
    if (!stringp(tLoadID) && !symbolp(tLoadID)) {
      return error(this, `Invalid castload task ID: ${tLoadID}`, Symbol.for("define"), Symbol.for("major"));
    }
    this.pTaskId = tLoadID;
    this.pPercent = 0.0;
    this.pDrawPoint = 0;
    this.pReadyFlag = 0;
    if (ilk(tProps, Symbol.for("propList"))) {
      if (ilk(tProps[Symbol.for("buffer")], Symbol.for("image"))) {
        this.pBuffer = tProps[Symbol.for("buffer")];
      }
      if (ilk(tProps[Symbol.for("width")], Symbol.for("integer"))) {
        this.pwidth = tProps[Symbol.for("width")];
      }
      if (ilk(tProps[Symbol.for("height")], Symbol.for("integer"))) {
        this.pheight = tProps[Symbol.for("height")];
      }
      if (ilk(tProps[Symbol.for("bgColor")], Symbol.for("color"))) {
        this.pBgColor = tProps[Symbol.for("bgColor")];
      }
      if (ilk(tProps[Symbol.for("color")], Symbol.for("color"))) {
        this.pcolor = tProps[Symbol.for("color")];
      }
      if (ilk(tProps[Symbol.for("type")], Symbol.for("symbol"))) {
        this.pTaskType = tProps[Symbol.for("type")];
      }
      if (tProps[Symbol.for("buffer")] == Symbol.for("window")) {
        if (this.pWindowID != EMPTY) {
          removeWindow(this.pWindowID);
        }
        this.pWindowID = `${this.getID()}${the.milliSeconds}`;
        createWindow(this.pWindowID, "system.window");
        const tWndObj = getWindow(this.pWindowID);
        tWndObj.resizeTo(this.pwidth, this.pheight);
        tWndObj.center();
        this.pBuffer = tWndObj.getElement("drag").getProperty(Symbol.for("buffer")).image;
      }
    }
    if (!voidp(tProps[Symbol.for("locY")])) {
      tWndObj.moveTo(tWndObj.getProperty(Symbol.for("locX")), tProps[Symbol.for("locY")]);
    }
    if (!voidp(tProps[Symbol.for("locX")])) {
      tWndObj.moveTo(tProps[Symbol.for("locX")], tWndObj.getProperty(Symbol.for("locY")));
    }
    const tRect = this.pBuffer.rect;
    if (this.pwidth > tRect.width) {
      this.pwidth = tRect.width;
    }
    if (this.pheight > tRect.height) {
      this.pheight = tRect.height;
    }
    this.pBarRect = rect((tRect.width / 2) - (this.pwidth / 2), (tRect.height / 2) - (this.pheight / 2), (tRect.width / 2) + (this.pwidth / 2), (tRect.height / 2) + (this.pheight / 2));
    this.pOffRect = rect(this.pBarRect[1] + 2, this.pBarRect[2] + 2, this.pBarRect[3] - 2, this.pBarRect[4] - 2);
    this.pBuffer.fill(this.pBarRect, this.pBgColor);
    this.pBuffer.draw(this.pBarRect, propList("color", this.pcolor, "shapeType", Symbol.for("rect")));
    return receivePrepare(this.getID());
  }

  prepare() {
    if (voidp(this.pTaskId) || this.pReadyFlag) {
      return removeObject(this.getID());
    }
    let tPercent;
    switch (this.pTaskType) {
      case Symbol.for("cast"):
        tPercent = getCastLoadManager().getLoadPercent(this.pTaskId);
        break;
      case Symbol.for("file"):
        tPercent = getDownloadManager().getLoadPercent(this.pTaskId);
        break;
    }
    this.pDrawPoint = this.pDrawPoint + 1;
    if (this.pDrawPoint <= (this.pPercent * this.pOffRect.width)) {
      const tRect = rect(this.pOffRect[1] + this.pDrawPoint - 1, this.pOffRect[2], this.pOffRect[1] + this.pDrawPoint, this.pOffRect[4]);
      this.pBuffer.fill(tRect, this.pcolor);
    }
    if (this.pPercent == tPercent) {
      return;
    }
    this.pBuffer.fill(this.pBarRect, this.pBgColor);
    this.pBuffer.draw(this.pBarRect, propList("color", this.pcolor, "shapeType", Symbol.for("rect")));
    const tRect = rect(this.pOffRect[1], this.pOffRect[2], (this.pPercent * this.pOffRect.width) + this.pOffRect[1], this.pOffRect[4]);
    this.pBuffer.fill(tRect, this.pcolor);
    this.pDrawPoint = this.pPercent * this.pOffRect.width;
    this.pPercent = tPercent;
    if (this.pPercent >= 1.0) {
      this.pBuffer.fill(this.pOffRect, this.pcolor);
      this.pReadyFlag = 1;
    }
  }
}
