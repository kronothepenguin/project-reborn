export default class {
  pWindowObj;
  pAnimating;
  pUpperJawElement;
  pLowerJawElement;
  pUpperElementDefaultPos;
  pLowerElementDefaultPos;
  pUpperFrameOffs;
  pLowerFrameOffs;
  pCurrentFrame;
  pCurrentSkipCounter;
  pMaxFrames;

  construct() {
    pWindowObj = VOID;
    pAnimating = 0;
    pUpperJawElement = VOID;
    pLowerJawElement = VOID;
    pUpperElementDefaultPos = VOID;
    pLowerElementDefaultPos = VOID;
    pUpperFrameOffs = getVariableValue("jaw.upper.frame.offsets");
    pLowerFrameOffs = getVariableValue("jaw.lower.frame.offsets");
    pCurrentFrame = 1;
    pCurrentSkipCounter = 0;
    pMaxFrames = min(list(pUpperFrameOffs.count, pLowerFrameOffs.count));
  }

  deconstruct() {
    pWindowObj = VOID;
    pAnimating = 0;
  }

  startAnimation(tWindowObj) {
    if (voidp(tWindowObj)) {
      return 0;
    }
    pWindowObj = tWindowObj;
    if (pWindowObj.elementExists("rec_jaw_upper")) {
      pUpperJawElement = pWindowObj.getElement("rec_jaw_upper");
      pUpperElementDefaultPos = list(pUpperJawElement.getProperty(Symbol.for("locH")), pUpperJawElement.getProperty(Symbol.for("locV")));
    } else {
      return 0;
    }
    if (pWindowObj.elementExists("rec_jaw_lower")) {
      pLowerJawElement = pWindowObj.getElement("rec_jaw_lower");
      pLowerElementDefaultPos = list(pLowerJawElement.getProperty(Symbol.for("locH")), pLowerJawElement.getProperty(Symbol.for("locV")));
    } else {
      return 0;
    }
    pCurrentFrame = 1;
    pCurrentSkipCounter = 0;
    pAnimating = 1;
    receivePrepare(this.getID());
  }

  stopAnimation() {
    pAnimating = 0;
    removePrepare(this.getID());
    if (!voidp(pWindowObj)) {
      if (pWindowObj.elementExists("rec_jaw_upper")) {
        pWindowObj.getElement("rec_jaw_upper").setProperty(Symbol.for("locV"), pUpperElementDefaultPos[1]);
        pWindowObj.getElement("rec_jaw_upper").setProperty(Symbol.for("locH"), pUpperElementDefaultPos[2]);
      }
      if (pWindowObj.elementExists("rec_jaw_lower")) {
        pWindowObj.getElement("rec_jaw_lower").setProperty(Symbol.for("locV"), pLowerElementDefaultPos[1]);
        pWindowObj.getElement("rec_jaw_lower").setProperty(Symbol.for("locH"), pLowerElementDefaultPos[2]);
      }
    }
  }

  getElementPosition(tElementType, tFrame) {
    tOffsetList = list(list(0, 0));
    tDefaultPos = list(0, 0);
    switch (tElementType) {
      case Symbol.for("upper"):
        tOffsetList = pUpperFrameOffs;
        tDefaultPos = pUpperElementDefaultPos;
        break;
      case Symbol.for("lower"):
        tOffsetList = pLowerFrameOffs;
        tDefaultPos = pLowerElementDefaultPos;
        break;
    }
    tOffset = list(tOffsetList[tFrame][1], tOffsetList[tFrame][2]);
    tPosition = tDefaultPos + tOffset;
    return tPosition;
  }

  prepare() {
    if (pCurrentSkipCounter <= 0) {
      pCurrentSkipCounter = 4;
    } else {
      pCurrentSkipCounter = pCurrentSkipCounter - 1;
      return 0;
    }
    pCurrentFrame = pCurrentFrame + 1;
    if (pCurrentFrame > pMaxFrames) {
      pCurrentFrame = 1;
    }
    if (!voidp(pWindowObj)) {
      if (pWindowObj.elementExists("rec_jaw_upper")) {
        tPos = this.getElementPosition(Symbol.for("upper"), pCurrentFrame);
        pUpperJawElement.setProperty(Symbol.for("locH"), tPos[1]);
        pUpperJawElement.setProperty(Symbol.for("locV"), tPos[2]);
      }
      if (pWindowObj.elementExists("rec_jaw_lower")) {
        tPos = this.getElementPosition(Symbol.for("lower"), pCurrentFrame);
        pLowerJawElement.setProperty(Symbol.for("locH"), tPos[1]);
        pLowerJawElement.setProperty(Symbol.for("locV"), tPos[2]);
      }
    }
  }
}
