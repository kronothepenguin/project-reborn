export default class {
  pTopicList;
  pTutorWindowID;
  pTutorWindow;
  pBubble;
  pDefPosX;
  pDefPosY;
  pDefPose;
  pDefSex;
  pPosX;
  pPosY;
  pPose;
  pSex;
  pimage;
  pFlipped;

  construct() {
    this.pTutorWindowID = "Tutor_character";
    createWindow(pTutorWindowID, "guide_character.window");
    this.pTutorWindow = getWindow(pTutorWindowID);
    this.pBubble = createObject(getUniqueID(), list("Bubble Class", "Link Bubble Class"));
    this.hide();
    this.pBubble.setProperty(Symbol.for("targetID"), "guide_image");
    this.pBubble.setProperty(propList("offsetx", 50));
    this.pBubble.update();
    if (variableExists("tutorial.tutor.default.x")) {
      this.pDefPosX = getVariable("tutorial.tutor.default.x");
    } else {
      this.pDefPosX = 20;
    }
    if (variableExists("tutorial.tutor.default.y")) {
      this.pDefPosY = getVariable("tutorial.tutor.default.y");
    } else {
      this.pDefPosY = 250;
    }
    this.pPose = 1;
    return 1;
  }

  deconstruct() {
    removeObject(this.pBubble.getID());
    removeWindow(this.pTutorWindow.getProperty(Symbol.for("id")));
  }

  hideLinks() {
    this.pBubble.setLinks(VOID);
  }

  update() {
    this.pBubble.update();
    return list(this.pTutorWindowID, this.pBubble.getProperty(Symbol.for("windowID")));
  }

  setProperties(tProperties) {
    if (!listp(tProperties)) {
      return 0;
    }
    for (let i = 1; i <= tProperties.count; i++) {
      this.setProperty(tProperties.getPropAt(i), tProperties[i]);
    }
  }

  getProperty(tProp) {
    switch (tProp) {
      case Symbol.for("sex"):
        return this.pSex;
    }
  }

  setProperty(tProperty, tValue) {
    switch (tProperty) {
      case Symbol.for("textKey"):
        tText = getText(tValue);
        tText = replaceChunks(tText, "\n", `${RETURN}${RETURN}`);
        this.pBubble.setText(tText);
        break;
      case Symbol.for("offsetx"):
        tValue = value(tValue);
        if (!tValue) {
          this.pPosX = this.pDefPosX;
        } else {
          this.pPosX = tValue;
        }
        this.pTutorWindow.moveTo(this.pPosX, this.pPosY);
        break;
      case Symbol.for("offsety"):
        tValue = value(tValue);
        if (!tValue) {
          this.pPosY = this.pDefPosY;
        } else {
          this.pPosY = tValue;
        }
        this.pTutorWindow.moveTo(this.pPosX, this.pPosY);
        break;
      case Symbol.for("links"):
        this.pBubble.setLinks(tValue);
        if (tValue.ilk == Symbol.for("propList")) {
          if (!voidp(tValue.getaProp(Symbol.for("menu")))) {
            this.pBubble.addText("tutorial_next");
          }
        }
        break;
      case Symbol.for("sex"):
        this.pSex = tValue;
        this.updateImage();
        break;
      case Symbol.for("pose"):
      case Symbol.for("direction"):
        this.pPose = tValue;
        this.updateImage();
        break;
      case Symbol.for("topics"):
        this.pTopicList = tValue;
        break;
      case Symbol.for("statuses"):
        this.pBubble.setCheckmarks(tValue);
        break;
    }
  }

  moveTo(tX, tY) {
    this.pPosX = tX;
    this.pPosY = tY;
    this.pTutorWindow.moveTo(this.pPosX, this.pPosY);
    this.pBubble.update();
  }

  hide() {
    this.pTutorWindow.hide();
    this.pBubble.hide();
  }

  show() {
    if (voidp(this.pimage)) {
      return 0;
    }
    this.updateImage();
    this.pTutorWindow.show();
    this.pBubble.show();
  }

  updateImage() {
    if (voidp(this.pSex) || voidp(pPose)) {
      return 0;
    }
    tPose = integer(this.pPose);
    this.pFlipped = 0;
    if (tPose > 10) {
      return 0;
    }
    tImageElem = pTutorWindow.getElement("guide_image");
    if (tPose < 0) {
      tPose = -tPose;
      this.pFlipped = 1;
    }
    tMemberName = `tutor_${this.pSex}_${string(tPose)}`;
    this.pimage = member(getmemnum(tMemberName)).image;
    if (voidp(this.pimage)) {
      return 0;
    }
    tImageElem.feedImage(this.pimage);
    if (this.pFlipped) {
      tImageElem.flipH();
      tImageElem.render();
    }
    tImageElem.resizeTo(this.pimage.width, this.pimage.height, 1);
    this.updateShadow();
  }

  updateShadow() {
    tShadow = image(this.pimage.width, this.pimage.height, 8);
    tBlack = image(this.pimage.width, this.pimage.height, 8);
    tBlack.fill(tBlack.rect, rgb("#000000"));
    tShadow.copyPixels(tBlack, tShadow.rect, tBlack.rect, propList("maskImage", this.pimage.createMatte()));
    tElem = this.pTutorWindow.getElement("guide_shadow");
    tElem.feedImage(tShadow);
    tElem.resizeTo(tShadow.width, tShadow.height, 1);
    if (this.pFlipped) {
      tElem.flipH();
      tElem.render();
    }
  }
}
