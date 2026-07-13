export default class {
  pTabData;
  pTabsImage;
  pFirstShownTab;
  pMaxTabs;
  pTabPieces;
  pTabWidth;
  pTabHeight;
  pHeadImages;
  pRects;

  construct() {
    this.pTabData = propList();
    this.pHeadImages = propList();
    this.pRects = propList();
    this.pFirstShownTab = 1;
    this.pMaxTabs = 7;
    this.pTabWidth = 30;
    this.pTabHeight = 30;
    this.pTabsImage = image(this.pMaxTabs * this.pTabWidth, this.pTabHeight, 32);
    this.initTabPieces();
    this.renderTabs();
    return 1;
  }

  deconstruct() {
    return 1;
  }

  initTabPieces() {
    this.pTabPieces = propList();
    this.pTabPieces.setaProp(Symbol.for("active"), getMember("tab.active").image.duplicate());
    this.pTabPieces.setaProp(Symbol.for("inactive"), getMember("tab.inactive").image.duplicate());
    this.pTabPieces.setaProp(Symbol.for("highlighted"), getMember("tab.highlighted").image.duplicate());
    this.pTabPieces.setaProp(Symbol.for("background"), getMember("tab.bg").image.duplicate());
    this.pTabPieces.setaProp(Symbol.for("leftArrow"), getMember("tab.prev").image.duplicate());
    this.pTabPieces.setaProp(Symbol.for("rightArrow"), getMember("tab.next").image.duplicate());
    this.pTabPieces.setaProp(Symbol.for("leftArrowHighlighted"), getMember("tab.prev.highlighted").image.duplicate());
    this.pTabPieces.setaProp(Symbol.for("rightArrowHighlighted"), getMember("tab.next.highlighted").image.duplicate());
    this.pTabPieces.setaProp(Symbol.for("tempHead"), getMember("tab.head.temp").image.duplicate());
  }

  getImage() {
    return this.pTabsImage;
  }

  addTab(tTabID) {
    if (this.pTabData.findPos(tTabID) > 0) {
      return 0;
    }
    let tTab = propList("id", tTabID, "state", Symbol.for("inactive"));
    this.pTabData.setaProp(tTabID, tTab);
    this.highlightTab(tTabID);
    this.renderTabs();
  }

  activateTab(tTabID) {
    if (voidp(this.pTabData.getaProp(tTabID))) {
      this.addTab(tTabID);
    }
    for (const tTab of this.pTabData) {
      if (tTab[Symbol.for("state")] == Symbol.for("active")) {
        tTab[Symbol.for("state")] = Symbol.for("inactive");
      }
    }
    let tTab = this.pTabData.getaProp(tTabID);
    tTab[Symbol.for("state")] = Symbol.for("active");
    this.renderTabs();
    return 1;
  }

  highlightTab(tTabID) {
    if (voidp(this.pTabData.findPos(tTabID))) {
      this.addTab(tTabID);
    }
    let tTab = this.pTabData.getaProp(tTabID);
    if (tTab[Symbol.for("state")] == Symbol.for("active")) {
      return 1;
    }
    tTab[Symbol.for("state")] = Symbol.for("highlighted");
    this.renderTabs();
  }

  showTab(tTabID) {
    let tPos = this.pTabData.findPos(tTabID);
    this.setFirstShownTab(tPos);
  }

  setFirstShownTab(tTabNum) {
    this.pFirstShownTab = tTabNum;
    if (this.pFirstShownTab > (this.pTabData.count - this.pMaxTabs)) {
      this.pFirstShownTab = this.pTabData.count - this.pMaxTabs + 1;
    }
    if (this.pFirstShownTab < 1) {
      this.pFirstShownTab = 1;
    }
    this.renderTabs();
  }

  removeTab(tTabID) {
    let tPos = this.pTabData.findPos(tTabID);
    if (tPos == 0) {
      return 0;
    }
    this.pTabData.deleteProp(tTabID);
    this.setFirstShownTab(this.pFirstShownTab - 1);
  }

  removeAllTabs() {
    this.pTabData = propList();
    this.pHeadImages = propList();
    this.pRects = propList();
    this.renderTabs();
  }

  scrollLeft() {
    this.setFirstShownTab(this.pFirstShownTab - this.pMaxTabs + 2);
  }

  scrollRight() {
    this.setFirstShownTab(this.pFirstShownTab + this.pMaxTabs - 2);
  }

  renderTabs() {
    let tBgImage = this.pTabPieces.getaProp(Symbol.for("background"));
    this.pTabsImage.copyPixels(tBgImage, this.pTabsImage.rect, tBgImage.rect);
    this.pRects = propList();
    for (let tTabPos = 1; tTabPos <= this.pMaxTabs; tTabPos++) {
      let tTabNum = this.pFirstShownTab - 1 + tTabPos;
      if (tTabNum > this.pTabData.count) {
        break;
      }
      let tUseTab = 0;
      let tImage;
      let tRectID;
      if (tTabPos == 1) {
        if (this.pFirstShownTab > 1) {
          tImage = this.getArrowImage(Symbol.for("left"));
          tRectID = Symbol.for("left");
        } else {
          tUseTab = 1;
        }
      } else {
        if (tTabPos == this.pMaxTabs) {
          if (this.pTabData.count > tTabNum) {
            tImage = this.getArrowImage(Symbol.for("right"));
            tRectID = Symbol.for("right");
          } else {
            tUseTab = 1;
          }
        } else {
          tUseTab = 1;
        }
      }
      if (tUseTab) {
        let tTab = this.pTabData[tTabNum];
        tImage = this.getTabImage(tTab);
        tRectID = tTab.getaProp(Symbol.for("id"));
      }
      let tTargetRect = rect((tTabPos - 1) * this.pTabWidth, 0, tTabPos * this.pTabWidth, this.pTabHeight);
      this.pTabsImage.copyPixels(tImage, tTargetRect, tImage.rect);
      this.pRects.setaProp(tRectID, tTargetRect);
    }
    return 1;
  }

  getArrowImage(tdir) {
    let tHighlightLeft = 0;
    let tHighlightRight = 0;
    let tLastShownTab = this.pFirstShownTab + this.pMaxTabs - 1;
    for (let tTabNum = 1; tTabNum <= this.pTabData.count; tTabNum++) {
      let tTab = this.pTabData[tTabNum];
      let tstate = tTab.getaProp(Symbol.for("state"));
      if ((tTabNum < this.pFirstShownTab) && (tstate == Symbol.for("highlighted"))) {
        tHighlightLeft = 1;
      }
      if ((tTabNum > tLastShownTab) && (tstate == Symbol.for("highlighted"))) {
        tHighlightRight = 1;
      }
    }
    if (tdir == Symbol.for("left")) {
      if (tHighlightLeft) {
        return this.pTabPieces.getaProp(Symbol.for("leftArrowHighlighted"));
      } else {
        return this.pTabPieces.getaProp(Symbol.for("leftArrow"));
      }
    } else {
      if (tHighlightRight) {
        return this.pTabPieces.getaProp(Symbol.for("rightArrowHighlighted"));
      } else {
        return this.pTabPieces.getaProp(Symbol.for("rightArrow"));
      }
    }
    return image(1, 1, 32);
  }

  getIdAt(tpoint) {
    if (ilk(tpoint) != Symbol.for("point")) {
      return 0;
    }
    for (let tRectNum = 1; tRectNum <= this.pRects.count; tRectNum++) {
      let tRect = this.pRects[tRectNum];
      if (tpoint.inside(tRect)) {
        return this.pRects.getPropAt(tRectNum);
      }
    }
    return 0;
  }

  getTabImage(tTabData) {
    let tUserID = tTabData.getaProp(Symbol.for("id"));
    let tstate = tTabData.getaProp(Symbol.for("state"));
    let tTabImage = this.pTabPieces.getaProp(tstate).duplicate();
    let tHeadImage = this.getHeadImage(tUserID);
    let tMarginH = (tTabImage.width - tHeadImage.width) * 0.5;
    let tMarginV = (tTabImage.height - tHeadImage.height) * 0.5;
    let tMargin = rect(tMarginH, tMarginV, tMarginH, tMarginV);
    tTabImage.copyPixels(tHeadImage, tHeadImage.rect + tMargin, tHeadImage.rect, propList("ink", 36));
    return tTabImage;
  }

  getHeadImage(tUserID) {
    let tHeadImage = this.pHeadImages.getaProp(tUserID);
    if (voidp(tHeadImage)) {
      let tFriend = getObject(Symbol.for("friend_list_component")).getFriendByID(tUserID);
      let tFigure = tFriend.getaProp(Symbol.for("figure"));
      let tGender = tFriend.getaProp(Symbol.for("sex"));
      tHeadImage = this.renderHeadImage(tFigure, tGender);
      this.pHeadImages.setaProp(tUserID, tHeadImage);
    }
    return tHeadImage;
  }

  updateHeadImage(tTabID, tFigure, tGender) {
    let tHeadImage = this.renderHeadImage(tFigure, tGender);
    this.pHeadImages.setaProp(tTabID, tHeadImage);
    this.renderTabs();
  }

  renderHeadImage(tFigure, tGender) {
    if (voidp(tFigure) || (tFigure == EMPTY)) {
      return this.pTabPieces.getaProp(Symbol.for("tempHead"));
    }
    let tFigureParser = getObject("Figure_System");
    let tPreviewObj = getObject("Figure_Preview");
    let tParsedFigure = tFigureParser.parseFigure(tFigure, tGender, "user");
    let tHeadImage = tPreviewObj.getHumanPartImg(Symbol.for("head"), tParsedFigure, 2, "sh");
    return tHeadImage;
  }
}
