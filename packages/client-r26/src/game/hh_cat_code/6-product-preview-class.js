export default class {
  pClass;
  pName;
  pCustom;
  pLayerProps;
  pDirection;
  pDimensions;
  pPartColors;
  pAnimFrame;
  pObjectType;
  pLoczList;
  pLocShiftList;

  construct() {
    this.pClass = EMPTY;
    this.pName = EMPTY;
    this.pCustom = EMPTY;
    this.pDirection = list();
    this.pDimensions = list();
    this.pPartColors = list();
    this.pAnimFrame = 0;
    this.pLayerProps = list();
    this.pObjectType = EMPTY;
    return 1;
  }

  deconstruct() {
    this.pLayerProps = list();
    return 1;
  }

  define(tdata) {
    this.pClass = tdata[Symbol.for("class")];
    this.pName = tdata[Symbol.for("name")];
    this.pCustom = tdata[Symbol.for("custom")];
    this.pDirection = tdata[Symbol.for("direction")];
    this.pDimensions = tdata[Symbol.for("dimensions")];
    this.pObjectType = tdata[Symbol.for("objectType")];
    if (this.pClass.contains("*")) {
      this.pClass = this.pClass.char[`${1}..${offset("*", this.pClass) - 1}`];
    }
    switch (this.pObjectType) {
      case "s":
        this.solveColors(tdata[Symbol.for("colors")]);
        if (this.solveStuffMembers() == 0) {
          return 0;
        }
        break;
      case "i":
        this.pPartColors = list();
        if (this.solveItemMembers() == 0) {
          return 0;
        }
    }
    return 1;
  }

  getPicture(tImg) {
    if (this.pLayerProps.ilk != Symbol.for("list")) {
      return error(this, "Properties not found!!!", Symbol.for("getImage"), Symbol.for("minor"));
    }
    if (this.pLayerProps.count < 1) {
      return error(this, "No Properties!!!", Symbol.for("getImage"), Symbol.for("minor"));
    }
    let tCanvas = image(300, 300, 32);
    tCanvas.fill(tCanvas.rect, rgb(255, 255, 255));
    let tFlipFlag = 0;
    let tFlipItem;
    switch (this.pObjectType) {
      case "i":
        let tProps = this.pLayerProps[1];
        let tMemNum = tProps[Symbol.for("member")];
        let tImage = member(tMemNum).image;
        tCanvas = tImage.duplicate();
        tFlipItem = tProps[Symbol.for("flipH")];
        break;
      case "s":
        let tTempLayerProps = propList();
        tTempLayerProps.sort();
        let tTempLocShifts = propList();
        tTempLocShifts.sort();
        for (let f = 1; f <= this.pLayerProps.count; f++) {
          let tlocz = this.pLoczList[f][this.pDirection[1] + 1];
          tTempLayerProps.addProp(tlocz, this.pLayerProps[f]);
          tTempLocShifts.addProp(tlocz, this.pLocShiftList[f][this.pDirection[1] + 1]);
        }
        for (let j = 1; j <= tTempLayerProps.count; j++) {
          let tProps = tTempLayerProps[j];
          let tMemNum = tProps[Symbol.for("member")];
          let tBlend = tProps[Symbol.for("blend")];
          let tColor = tProps[Symbol.for("bgColor")];
          let tInk = tProps[Symbol.for("ink")];
          let tImage = member(tMemNum).image;
          let tRegp = member(tMemNum).regPoint;
          let tX = 150 - tRegp[1];
          let tY = 150 - tRegp[2];
          if (ilk(tTempLocShifts[j]) == Symbol.for("point")) {
            tX = tX + tTempLocShifts[j].locH;
            tY = tY + tTempLocShifts[j].locV;
          } else if (ilk(tTempLocShifts[j]) == Symbol.for("integer")) {
            tX = tX + tTempLocShifts[j];
            tX = tX + tTempLocShifts[j];
          }
          let tRect = rect(tX, tY, tX + tImage.width, tY + tImage.height);
          if (tProps[Symbol.for("flipH")]) {
            tFlipFlag = 1;
          }
          let tMatte = tImage.createMatte();
          tCanvas.copyPixels(tImage, tRect, tImage.rect, propList("maskImage", tMatte, "ink", tInk, "bgColor", tColor, "blend", tBlend));
        }
    }
    if (voidp(tImg)) {
      tImg = tCanvas;
    } else {
      let tdestrect = tImg.rect - tCanvas.rect;
      tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tCanvas.width + (tdestrect.width / 2), (tdestrect.height / 2) + tCanvas.height);
      tImg.copyPixels(tCanvas, tdestrect, tCanvas.rect, propList("ink", 36));
    }
    if (tFlipItem) {
      tImg = this.flipImage(tImg);
    }
    return tImg.trimWhiteSpace();
  }

  flipImage(tImg_a) {
    let tPaletteRef = tImg_a.paletteRef;
    let tImg_b;
    if (tPaletteRef.ilk == Symbol.for("member")) {
      tImg_b = image(tImg_a.width, tImg_a.height, tImg_a.depth, member(tPaletteRef));
    } else {
      tImg_b = image(tImg_a.width, tImg_a.height, 32);
    }
    let tQuad = list(point(tImg_a.width, 0), point(0, 0), point(0, tImg_a.height), point(tImg_a.width, tImg_a.height));
    tImg_b.copyPixels(tImg_a, tQuad, tImg_a.rect);
    return tImg_b;
  }

  solveColors(tpartColors) {
    if (voidp(tpartColors)) {
      tpartColors = "0,0,0";
    }
    this.pPartColors = list();
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = ",";
    for (let i = 1; i <= tpartColors.item.count; i++) {
      this.pPartColors.add(string(tpartColors.item[i]));
    }
    for (let j = this.pPartColors.count; j <= 4; j++) {
      this.pPartColors.add("*ffffff");
    }
    the.itemDelimiter = tDelim;
  }

  solveInk(tPart) {
    if (!memberExists(`${this.pClass}.props`)) {
      return 8;
    }
    let tPropList = value(field(getmemnum(`${this.pClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${this.pClass}.props is not valid!`, Symbol.for("solveInk"), Symbol.for("minor"));
      return 8;
    } else {
      if (tPropList[tPart] == VOID) {
        return 8;
      }
      if (tPropList[tPart][Symbol.for("ink")] != VOID) {
        return tPropList[tPart][Symbol.for("ink")];
      }
    }
    return 8;
  }

  solveBlend(tPart) {
    if (!memberExists(`${this.pClass}.props`)) {
      return 100;
    }
    let tPropList = value(field(getmemnum(`${this.pClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${this.pClass}.props is not valid!`, Symbol.for("solveBlend"), Symbol.for("minor"));
      return 100;
    } else {
      if (tPropList[tPart] == VOID) {
        return 100;
      }
      if (tPropList[tPart][Symbol.for("blend")] != VOID) {
        return tPropList[tPart][Symbol.for("blend")];
      }
    }
    return 100;
  }

  solveStuffMembers() {
    let tMemNum = 1;
    let i = charToNum("a");
    let j = 1;
    this.pLayerProps = list();
    this.pLoczList = list();
    this.pLocShiftList = list();
    while (tMemNum > 0) {
      let tFound = 0;
      while (tFound == 0) {
        let tMemNameA = `${this.pClass}_${numToChar(i)}_${"0"}`;
        let tMemName;
        if (listp(this.pDimensions)) {
          tMemNameA = `${tMemNameA}_${this.pDimensions[1]}_${this.pDimensions[2]}`;
        }
        if (!voidp(this.pDirection)) {
          if (count(this.pDirection) >= j) {
            tMemName = `${tMemNameA}_${this.pDirection[j]}_${this.pAnimFrame}`;
          } else {
            tMemName = `${tMemNameA}_${this.pDirection[1]}_${this.pAnimFrame}`;
          }
        } else {
          tMemName = `${tMemNameA}_${this.pAnimFrame}`;
        }
        tMemNum = getmemnum(tMemName);
        let tOldMemName = tMemName;
        if (!tMemNum) {
          tMemName = `${tMemNameA}_0_${this.pAnimFrame}`;
          tMemNum = getmemnum(tMemName);
        }
        if (!tMemNum && (j == 1)) {
          tFound = 0;
          if (listp(this.pDirection)) {
            for (let tdir = 1; tdir <= this.pDirection.count; tdir++) {
              this.pDirection[tdir] = integer(this.pDirection[tdir] + 1);
            }
            if (this.pDirection[1] == 8) {
              error(this, "Couldn't define members:" && this.pClass, Symbol.for("solveMembers"), Symbol.for("minor"));
              tMemNum = getmemnum("room_object_placeholder");
              this.pDirection = list(0, 0, 0);
              tFound = 1;
            }
          }
          continue;
        }
        tFound = 1;
      }
      if (tMemNum != 0) {
        this.pLoczList.add(list());
        this.pLocShiftList.add(list());
        for (let tdir = 0; tdir <= 7; tdir++) {
          this.pLoczList.getLast().add(this.solveLocZ(numToChar(i), tdir) + i);
          this.pLocShiftList.getLast().add(this.solveLocShift(numToChar(i), tdir));
        }
        let tFlipH;
        if (tMemNum < 1) {
          tMemNum = abs(tMemNum);
          tFlipH = 1;
        } else {
          tFlipH = 0;
        }
        let tProps = propList();
        tProps[Symbol.for("member")] = tMemNum;
        tProps[Symbol.for("width")] = member(tMemNum).width;
        tProps[Symbol.for("height")] = member(tMemNum).height;
        tProps[Symbol.for("ink")] = this.solveInk(numToChar(i));
        tProps[Symbol.for("blend")] = this.solveBlend(numToChar(i));
        tProps[Symbol.for("flipH")] = tFlipH;
        if (j <= this.pPartColors.count) {
          if (string(this.pPartColors[j]).char[1] == "#") {
            tProps[Symbol.for("bgColor")] = rgb(this.pPartColors[j]);
            let tInk = 41;
          } else {
            tProps[Symbol.for("bgColor")] = paletteIndex(integer(this.pPartColors[j]));
          }
        }
        this.pLayerProps.append(tProps);
      }
      i = i + 1;
      j = j + 1;
    }
    if (this.pLayerProps.count > 0) {
      return 1;
    } else {
      return error(this, "Couldn't define members:" && this.pClass, Symbol.for("solveStuffMembers"), Symbol.for("minor"));
    }
  }

  solveItemMembers() {
    let tMemNum = 0;
    this.pLayerProps = list();
    let tMemName = `${"rightwall"} ${this.pClass}`;
    tMemNum = getmemnum(tMemName);
    let tProps = propList();
    tProps[Symbol.for("flipH")] = tMemNum < 0;
    tProps[Symbol.for("member")] = abs(tMemNum);
    if (tMemNum != 0) {
      this.pLayerProps.append(tProps);
    }
    if (this.pLayerProps.count > 0) {
      return 1;
    } else {
      if (!this.solveAnimatedItemMembers()) {
        return error(this, "Couldn't define members:" && this.pClass, Symbol.for("solveItemMembers"), Symbol.for("minor"));
      }
    }
  }

  solveAnimatedItemMembers() {
    let tMemNum = 1;
    let i = charToNum("a");
    let j = 1;
    this.pLayerProps = list();
    this.pLoczList = list();
    this.pLocShiftList = list();
    while (tMemNum > 0) {
      let tMemNameA = `${"rightwall"} ${this.pClass}_${numToChar(i)}_`;
      for (let tFrame = 0; tFrame <= 10; tFrame++) {
        let tMemName = `${tMemNameA}${string(tFrame)}`;
        tMemNum = getmemnum(tMemName);
        let tOldMemName = tMemName;
        if (tMemNum != 0) {
          break;
        }
      }
      if (tMemNum != 0) {
        this.pLoczList.add(list());
        this.pLocShiftList.add(list());
        for (let tdir = 0; tdir <= 7; tdir++) {
          this.pLoczList.getLast().add(this.solveLocZ(numToChar(i), tdir) + i);
          this.pLocShiftList.getLast().add(this.solveLocShift(numToChar(i), tdir));
        }
        let tFlipH;
        if (tMemNum < 1) {
          tMemNum = abs(tMemNum);
          tFlipH = 1;
        } else {
          tFlipH = 0;
        }
        let tProps = propList();
        tProps[Symbol.for("member")] = tMemNum;
        tProps[Symbol.for("width")] = member(tMemNum).width;
        tProps[Symbol.for("height")] = member(tMemNum).height;
        tProps[Symbol.for("ink")] = this.solveInk(numToChar(i));
        tProps[Symbol.for("blend")] = this.solveBlend(numToChar(i));
        tProps[Symbol.for("flipH")] = tFlipH;
        if (j <= this.pPartColors.count) {
          if (string(this.pPartColors[j]).char[1] == "#") {
            tProps[Symbol.for("bgColor")] = rgb(this.pPartColors[j]);
            let tInk = 41;
          } else {
            tProps[Symbol.for("bgColor")] = paletteIndex(integer(this.pPartColors[j]));
          }
        }
        this.pLayerProps.append(tProps);
      }
      i = i + 1;
      j = j + 1;
    }
    if (this.pLayerProps.count > 0) {
      this.pObjectType = "s";
      return 1;
    } else {
      return error(this, "Couldn't define members:" && this.pClass, Symbol.for("solveAnimatedItemMembers"), Symbol.for("minor"));
    }
  }

  solveLocZ(tPart, tdir) {
    if (!memberExists(`${this.pClass}.props`)) {
      return charToNum(tPart);
    }
    let tPropList = value(field(getmemnum(`${this.pClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${this.pClass}.props is not valid!`, Symbol.for("solveLocZ"), Symbol.for("minor"));
      return 0;
    } else {
      if (tPropList[tPart] == VOID) {
        return 0;
      }
      if (tPropList[tPart][Symbol.for("zshift")] == VOID) {
        return 0;
      }
      if (tPropList[tPart][Symbol.for("zshift")].count <= tdir) {
        tdir = 0;
      }
    }
    return tPropList[tPart][Symbol.for("zshift")][tdir + 1];
  }

  solveLocShift(tPart, tdir) {
    if (!memberExists(`${this.pClass}.props`)) {
      return 0;
    }
    let tPropList = value(field(getmemnum(`${this.pClass}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${this.pClass}.props is not valid!`, Symbol.for("solveLocShift"), Symbol.for("minor"));
      return 0;
    } else {
      if (voidp(tPropList[tPart])) {
        return 0;
      }
      if (voidp(tPropList[tPart][Symbol.for("locshift")])) {
        return 0;
      }
      if (tPropList[tPart][Symbol.for("locshift")].count <= tdir) {
        return 0;
      }
      let tShift = value(tPropList[tPart][Symbol.for("locshift")][tdir + 1]);
      if (ilk(tShift) == Symbol.for("point")) {
        return tShift;
      }
    }
    return 0;
  }
}
