import {
  EMPTY,
  ilk,
  rgb,
  rect,
  stringp,
  symbolp,
  the,
  voidp,
  VOID,
} from "../../director";

export default function () {
  let tProps, tRect, tPercent, tWndObj;

  return {
    pTaskId: VOID,
    pBuffer: VOID,
    pBgColor: VOID,
    pcolor: VOID,
    pwidth: VOID,
    pheight: VOID,
    pBarRect: VOID,
    pOffRect: VOID,
    pTaskType: VOID,
    pPercent: VOID,
    pDrawPoint: VOID,
    pWindowID: VOID,
    pReadyFlag: VOID,

    construct() {
      tProps = {
        [Symbol.for("bgColor")]: the.stage.bgColor,
        [Symbol.for("color")]: rgb(128, 128, 128),
        [Symbol.for("width")]: 128,
        [Symbol.for("height")]: 16,
      };
      tProps = _director.getVariableValue("loading.bar.props", tProps);
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
    },

    deconstruct() {
      this.pTaskId = VOID;
      _director.removePrepare(this.getID());
      if (this.pWindowID !== EMPTY) {
        _director.removeWindow(this.pWindowID);
        this.pWindowID = EMPTY;
      }
      return 1;
    },

    define(tLoadID, tProps) {
      if (!stringp(tLoadID) && !symbolp(tLoadID)) {
        return _director.error(this, `Invalid castload task ID: ${tLoadID}`, Symbol.for("define"), Symbol.for("major"));
      }
      this.pTaskId = tLoadID;
      this.pPercent = 0.0;
      this.pDrawPoint = 0;
      this.pReadyFlag = 0;
      if (ilk(tProps, Symbol.for("propList"))) {
        if (ilk(tProps[Symbol.for("buffer")]) === Symbol.for("image")) {
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
        if (tProps[Symbol.for("buffer")] === Symbol.for("window")) {
          if (this.pWindowID !== EMPTY) {
            _director.removeWindow(this.pWindowID);
          }
          this.pWindowID = this.getID() + " " + the.milliSeconds;
          _director.createWindow(this.pWindowID, "system.window");
          tWndObj = _director.getWindow(this.pWindowID);
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
      tRect = this.pBuffer.rect;
      if (this.pwidth > tRect.width) {
        this.pwidth = tRect.width;
      }
      if (this.pheight > tRect.height) {
        this.pheight = tRect.height;
      }
      this.pBarRect = rect(
        (tRect.width / 2) - (this.pwidth / 2),
        (tRect.height / 2) - (this.pheight / 2),
        (tRect.width / 2) + (this.pwidth / 2),
        (tRect.height / 2) + (this.pheight / 2),
      );
      this.pOffRect = rect(
        this.pBarRect.left + 2,
        this.pBarRect.top + 2,
        this.pBarRect.right - 2,
        this.pBarRect.bottom - 2,
      );
      this.pBuffer.fill(this.pBarRect, this.pBgColor);
      this.pBuffer.draw(this.pBarRect, {
        [Symbol.for("color")]: this.pcolor,
        [Symbol.for("shapeType")]: Symbol.for("rect"),
      });
      return _director.receivePrepare(this.getID());
    },

    prepare() {
      if (voidp(this.pTaskId) || this.pReadyFlag) {
        return _director.removeObject(this.getID());
      }
      switch (this.pTaskType) {
        case Symbol.for("cast"):
          tPercent = _director.getCastLoadManager().getLoadPercent(this.pTaskId);
          break;
        case Symbol.for("file"):
          tPercent = _director.getDownloadManager().getLoadPercent(this.pTaskId);
          break;
      }
      this.pDrawPoint = this.pDrawPoint + 1;
      if (this.pDrawPoint <= (this.pPercent * this.pOffRect.width)) {
        tRect = rect(
          this.pOffRect.left + this.pDrawPoint - 1,
          this.pOffRect.top,
          this.pOffRect.left + this.pDrawPoint,
          this.pOffRect.bottom,
        );
        this.pBuffer.fill(tRect, this.pcolor);
      }
      if (this.pPercent === tPercent) {
        return;
      }
      this.pBuffer.fill(this.pBarRect, this.pBgColor);
      this.pBuffer.draw(this.pBarRect, {
        [Symbol.for("color")]: this.pcolor,
        [Symbol.for("shapeType")]: Symbol.for("rect"),
      });
      tRect = rect(
        this.pOffRect.left,
        this.pOffRect.top,
        (this.pPercent * this.pOffRect.width) + this.pOffRect.left,
        this.pOffRect.bottom,
      );
      this.pBuffer.fill(tRect, this.pcolor);
      this.pDrawPoint = this.pPercent * this.pOffRect.width;
      this.pPercent = tPercent;
      if (this.pPercent >= 1.0) {
        this.pBuffer.fill(this.pOffRect, this.pcolor);
        this.pReadyFlag = 1;
      }
    },
  };
}
