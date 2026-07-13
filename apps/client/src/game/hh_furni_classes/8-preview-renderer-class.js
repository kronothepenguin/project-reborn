export default class {
  pPossibleParts;

  construct() {
    createMember("preview_rendered", Symbol.for("bitmap"));
    this.pPossibleParts = list("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l");
    return 1;
  }

  deconstruct() {
    removeMember("preview_rendered");
    return 1;
  }

  getPreviewMember(tImage) {
    if (tImage == VOID) {
      return 0;
    }
    const tMemNum = getmemnum("preview_rendered");
    member(tMemNum).image = tImage;
    return tMemNum;
  }

  solveClass(tClass, tMemStr) {
    let tName = tClass;
    let tSmallMem;
    if (tName contains "*") {
      tSmallMem = `${tName}_small`;
      tName = tName.char[`1..${offset("*", tName) - 1}`];
      if (!memberExists(tSmallMem)) {
        tSmallMem = `${tName}_small`;
      }
    } else {
      tSmallMem = `${tClass}_small`;
    }
    if (tMemStr == VOID) {
      tMemStr = EMPTY;
    }
    if (memberExists(tSmallMem)) {
      return tSmallMem;
    } else {
      if (memberExists(tMemStr)) {
        return tMemStr;
      } else {
        return "no_icon_small";
      }
    }
  }

  solveColorList(tpartColors) {
    if ((tpartColors == EMPTY) || voidp(tpartColors)) {
      tpartColors = "0,0,0";
    }
    const tPartList = list();
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    for (let i = 1; i <= tpartColors.item.count; i++) {
      tPartList.add(string(tpartColors.item[i]));
    }
    for (let j = tPartList.count; j <= 4; j++) {
      tPartList.add("*ffffff");
    }
    the.itemDelimiter = tDelim;
    return tPartList;
  }

  renderPreviewImage(tMemStr, tColorList, tColorListToSolve, tClass) {
    if (tMemStr == VOID) {
      tMemStr = this.solveClass(tClass, tMemStr);
    }
    if (getmemnum(tMemStr) == 0) {
      tMemStr = this.solveClass(tClass, tMemStr);
    }
    if (tColorListToSolve != VOID) {
      tColorList = this.solveColorList(tColorListToSolve);
    }
    if (!this.doLayersExist(tMemStr)) {
      if (getmemnum(tMemStr) == 0) {
        return member(getmemnum("no_icon_small")).image;
      }
      const tColor = this.getSmallsColor(tMemStr, tColorList);
      if (tColor == 0) {
        return member(getmemnum(tMemStr)).image;
      }
      return this.applyDarkenColor(member(getmemnum(tMemStr)).image, tColor);
    }
    const tMem = member(getmemnum(tMemStr));
    const tOffset = point(50, 50);
    const tRect = rect(tOffset.locH, tOffset.locV, tMem.rect.width + tOffset.locH, tMem.rect.height + tOffset.locV);
    let tRendered = image(tMem.rect.width + (tOffset.locH * 2), tMem.rect.height + (tOffset.locV * 2), 32);
    tRendered.copyPixels(tMem.image, tRect, tMem.rect);
    for (let i = 1; i <= this.pPossibleParts.count; i++) {
      if (memberExists(`${tMemStr}_${this.pPossibleParts[i]}`)) {
        tRendered = this.addLayerToImage(tRendered, i, tMemStr, tColorList, tOffset);
      }
    }
    tRendered = tRendered.trimWhiteSpace();
    return tRendered;
  }

  getSmallsColor(tMemStr, tColorList) {
    let tColor = this.getLastColor(tColorList);
    if ((tColor == "ffffff") || (tMemStr contains "*")) {
      return 0;
    }
    return tColor;
  }

  doLayersExist(tMemStr) {
    for (let i = 1; i <= this.pPossibleParts.count; i++) {
      if (memberExists(`${tMemStr}_${this.pPossibleParts[i]}`)) {
        return 1;
      }
    }
    return 0;
  }

  getLastColor(tColorList) {
    let tColor = "ffffff";
    if (tColorList.ilk == Symbol.for("list")) {
      for (let i = 1; i <= tColorList.count; i++) {
        if ((tColorList[i] contains "ffffff") || (tColorList[i] == "0") || (tColorList[i] == "null")) {
          nothing();
          continue;
        }
        tColor = tColorList[i];
      }
    }
    return tColor;
  }

  addLayerToImage(tImg, tNum, tMemStr, tColorList, tOffset) {
    const tAbc = this.pPossibleParts[tNum];
    if (tColorList == VOID) {
      tColorList = list();
    }
    let tColor;
    if (tColorList.count < tNum) {
      tColor = "ffffff";
    } else {
      tColor = tColorList[tNum];
    }
    const tImg2 = member(getmemnum(`${tMemStr}_${tAbc}`)).image;
    let tRegp = member(getmemnum(`${tMemStr}_${tAbc}`)).regPoint - member(getmemnum(tMemStr)).regPoint;
    tRegp = tRegp - tOffset;
    const tRect = tImg2.rect - rect(tRegp[1], tRegp[2], tRegp[1], tRegp[2]);
    const tMatte = tImg2.createMatte();
    const tColorObj = rgb(tColor);
    tImg.copyPixels(tImg2, tRect, tImg2.rect, propList("ink", 41, "bgColor", tColorObj, "maskImage", tMatte));
    return tImg;
  }

  applyDarkenColor(tOrgImg, tColor) {
    const tColorObj = rgb(tColor);
    const tImg = image(tOrgImg.width, tOrgImg.height, 32);
    const tMatte = tOrgImg.createMatte();
    tImg.copyPixels(tOrgImg, tImg.rect, tImg.rect, propList("ink", 41, "bgColor", tColorObj, "maskImage", tMatte));
    return tImg;
  }
}
