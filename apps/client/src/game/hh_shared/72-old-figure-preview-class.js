export default class {
  pBodyPartObjects;

  createTemplateHuman(tSize, tdir, tAction, tActionProps) {
    const tProps = propList();
    const tObjectName = "temp_humanobj";
    let tmember;
    if (!objectExists(tObjectName)) {
      if (!createObject(tObjectName, "Human Template Class")) {
        return error(this, "Failed to init temporary human object!", Symbol.for("createTemplateHuman"), Symbol.for("major"));
      }
      tProps[Symbol.for("userName")] = "temp_human_figurecreator";
      tProps[Symbol.for("figure")] = getObject(Symbol.for("session")).GET("user_figure").duplicate();
      tProps[Symbol.for("direction")] = list(tdir, 1, 1);
      tProps[Symbol.for("x")] = 10000;
      tProps[Symbol.for("y")] = 10000;
      tProps[Symbol.for("h")] = 10000;
      if (tSize == "sh") {
        tProps[Symbol.for("type")] = 32;
      } else {
        tProps[Symbol.for("type")] = 64;
      }
      tmember = getObject(tObjectName).define(tProps);
    } else {
      tmember = getObject(tObjectName).getMember();
    }
    switch (tAction) {
      case "remove":
        removeObject(tObjectName);
        break;
      case "reset":
        call(Symbol.for("resetTemplateHuman"), list(getObject(tObjectName)));
        break;
      default:
        call(Symbol.for(`action_${tAction}`), list(getObject(tObjectName)), tActionProps);
    }
    return tmember;
  }

  getHumanPartImg(tPartList, tFigure, tdir, tSize, tAction, tAnimFrame) {
    this.createTemplateParts(tFigure, tPartList, tdir, tSize);
    const tHumanImg = image(64, 102, 16);
    this.getPartImg(tPartList, tHumanImg, tdir, tSize, tAction, tAnimFrame);
    return tHumanImg;
  }

  createHumanPartPreview(tWindowTitle, tElement, tPartList, tFigure) {
    if (voidp(tFigure)) {
      tFigure = getObject(Symbol.for("session")).GET("user_figure");
      if (tFigure.ilk == Symbol.for("propList")) {
        tFigure = tFigure.duplicate();
      } else {
        return error(this, "Figure data not found!", Symbol.for("createHumanPartPreview"), Symbol.for("major"));
      }
    }
    this.createTemplateParts(tFigure, tPartList, 3);
    this.setParts(tFigure, tPartList);
    this.feedHumanPreview(tWindowTitle, tElement, tPartList);
  }

  setParts(tFigure, tPartList) {
    for (const tPart of tPartList) {
      if (!(tPart contains "it")) {
        let tmodel = tFigure[tPart]["model"];
        const tColor = tFigure[tPart]["color"];
        switch (length(tmodel)) {
          case 1:
            tmodel = `00${tmodel}`;
            break;
          case 2:
            tmodel = `0${tmodel}`;
            break;
        }
        if (!voidp(this.pBodyPartObjects)) {
          call(Symbol.for("setColor"), list(this.pBodyPartObjects[tPart]), tColor);
          call(Symbol.for("setModel"), list(this.pBodyPartObjects[tPart]), tmodel);
        }
      }
    }
  }

  createTemplateParts(tFigure, tPartList, tdir, tSize) {
    if (voidp(tSize)) {
      this.pPeopleSize = "h";
    }
    this.pBuffer = image(1, 1, 8);
    this.pFlipList = list(0, 1, 2, 3, 2, 1, 0, 7);
    this.pBodyPartObjects = propList();
    for (const tPart of tPartList) {
      if (!(tPart contains "it")) {
        let tmodel = tFigure[tPart]["model"];
        const tColor = tFigure[tPart]["color"];
        const tDirection = tdir;
        const tAction = "std";
        const tAncestor = this;
        switch (length(tmodel)) {
          case 1:
            tmodel = `00${tmodel}`;
            break;
          case 2:
            tmodel = `0${tmodel}`;
            break;
        }
        const tTempPartObj = createObject(Symbol.for("temp"), "Bodypart Template Class");
        tTempPartObj.define(tPart, tmodel, tColor, tDirection, tAction, tAncestor);
        this.pBodyPartObjects.addProp(tPart, tTempPartObj);
      }
    }
  }

  feedHumanPreview(tWindowTitle, tElemID, tPartList) {
    if (!voidp(this.pBodyPartObjects) && windowExists(tWindowTitle)) {
      const tElem = getWindow(tWindowTitle).getElement(tElemID);
      let tTempPartImg = image(64, 102, 16);
      this.getPartImg(tPartList, tTempPartImg, 3);
      tTempPartImg = tTempPartImg.trimWhiteSpace();
      const tPrewImg = image(tElem.getProperty(Symbol.for("width")), tElem.getProperty(Symbol.for("height")), 16);
      let tdestrect = tPrewImg.rect - tTempPartImg.rect;
      const tMargins = rect(0, 0, 0, 0);
      tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tTempPartImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tTempPartImg.height) + tMargins;
      tPrewImg.copyPixels(tTempPartImg, tdestrect, tTempPartImg.rect, propList("ink", 8));
      tElem.clearImage();
      tElem.feedImage(tPrewImg);
    }
  }

  getPartImg(tPartList, tImg, tdir, tSize) {
    if (tPartList.ilk != Symbol.for("list")) {
      list(tPartList);
    }
    for (const tPart of tPartList) {
      if (!(tPart contains "it")) {
        call(Symbol.for("copyPicture"), list(this.pBodyPartObjects[tPart]), tImg, tdir, tSize);
      }
    }
  }
}
