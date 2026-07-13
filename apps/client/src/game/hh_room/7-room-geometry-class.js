export default class {
  pXOffset;
  pYOffset;
  pZOffset;
  pXFactor;
  pYFactor;
  pHFactor;
  pHeightMap;
  pPlaceMap;

  construct() {
    this.pXOffset = 0.0;
    this.pYOffset = 0.0;
    this.pZOffset = 0.0;
    this.pXFactor = 0.0;
    this.pYFactor = 0.0;
    this.pHFactor = 0.0;
    this.pHeightMap = [list()];
    this.pPlaceMap = [list()];
    return 1;
  }

  define(tdata) {
    this.pXOffset = getLocalFloat(tdata[Symbol.for("offsetx")]);
    this.pYOffset = getLocalFloat(tdata[Symbol.for("offsety")]);
    this.pZOffset = getLocalFloat(tdata[Symbol.for("offsetz")]);
    this.pXFactor = getLocalFloat(tdata[Symbol.for("factorx")]);
    this.pYFactor = getLocalFloat(tdata[Symbol.for("factory")]);
    this.pHFactor = getLocalFloat(tdata[Symbol.for("factorh")]);
    return 1;
  }

  loadHeightMap(tdata) {
    this.pHeightMap = [];
    this.pPlaceMap = [];
    for (let i = 1; i <= tdata.line.count; i++) {
      let l = [];
      let k = [];
      let tLine = tdata.line[i];
      if (tLine != EMPTY) {
        for (let j = 1; j <= length(tLine); j++) {
          if (tLine.char[j] == "x") {
            l.add(200000);
            k.add(200000);
            continue;
          }
          if (tLine.char[j] == "y") {
            l.add(0);
            k.add(100000);
            continue;
          }
          if ((charToNum(tLine.char[j]) >= 65) && (charToNum(tLine.char[j]) < 73)) {
            l.add(charToNum(tLine.char[j]) - 65);
            k.add(100000);
            continue;
          }
          l.add(integer(tLine.char[j]));
          k.add(0);
        }
        this.pHeightMap.add(l);
        this.pPlaceMap.add(k);
      }
    }
    return 1;
  }

  getScreenCoordinate(tLocX, tLocY, tHeight) {
    let tPrecision = the.floatPrecision;
    the.floatPrecision = 2;
    let tLocH = ((tLocX - tLocY) * (this.pXFactor * 0.5)) + this.pXOffset;
    let tLocV = float(((tLocY + tLocX) * this.pYFactor * 0.5) + this.pYOffset) - (tHeight * this.pHFactor);
    let tlocz = (1000 * (tLocX + tLocY + 1)) + this.pZOffset;
    the.floatPrecision = tPrecision;
    return [integer(tLocH), integer(tLocV), integer(tlocz)];
  }

  getCoordinateHeight(tX, tY) {
    tX = integer(tX);
    tY = integer(tY);
    if ((tY < 0) || (tY >= this.pHeightMap.count)) {
      return 0;
    }
    let tLine = this.pHeightMap[integer(tY + 1)];
    if ((tX < 0) || (tX >= tLine.count)) {
      return 0;
    }
    return tLine[tX + 1];
  }

  getWorldCoordinate(tLocX, tLocY) {
    if (voidp(this.pHeightMap)) {
      return VOID;
    }
    let tX = integer(((tLocX - this.pYFactor - this.pXOffset) / this.pXFactor) + ((tLocY - this.pYOffset) / this.pYFactor));
    let tY = integer(((tLocY - this.pYOffset) / this.pYFactor) - ((tLocX - this.pYFactor - this.pXOffset) / this.pXFactor));
    let tHeight = -1;
    if ((tY >= 0) && (tY < this.pHeightMap.count)) {
      if ((tX >= 0) && (tX < this.pHeightMap[tY + 1].count)) {
        tHeight = this.pHeightMap[tY + 1][tX + 1];
      }
    }
    if (tHeight == 0) {
      return [tX, tY, 0];
    } else {
      for (let i = 1; i <= 9; i++) {
        tX = integer(((tLocX - this.pYFactor - this.pXOffset) / this.pXFactor) + ((tLocY + (i * this.pHFactor) - this.pYOffset) / this.pYFactor));
        tY = integer(((tLocY + (i * this.pHFactor) - this.pYOffset) / this.pYFactor) - ((tLocX - this.pYFactor - this.pXOffset) / this.pXFactor));
        tHeight = -1;
        if ((tY >= 0) && (tY < this.pHeightMap.count)) {
          if ((tX >= 0) && (tX < this.pHeightMap[tY + 1].count)) {
            tHeight = this.pHeightMap[tY + 1][tX + 1];
          }
        }
        if (tHeight == i) {
          return [tX, tY, tHeight];
        }
      }
    }
    return 0;
  }

  getObjectPlaceMap() {
    return this.pPlaceMap;
  }

  getObjectHeightMap() {
    return this.pHeightMap;
  }

  getTileHeight() {
    return this.pYFactor;
  }

  getTileWidth() {
    return this.pXFactor;
  }

  emptyTile(tX, tY) {
    if (((tY + 1) > 0) && ((tY + 1) <= count(this.pPlaceMap))) {
      if (((tX + 1) > 0) && ((tX + 1) <= count(this.pPlaceMap[tY + 1]))) {
        if (this.pPlaceMap[tY + 1][tX + 1] > 1000) {
          return 0;
        }
      } else {
        return 0;
      }
    } else {
      return 0;
    }
    return 1;
  }

  print() {
    put("- - - - - - - - - - - - - - -");
    put("");
    put(`X offset ${this.pXOffset}`);
    put(`Y offset ${this.pYOffset}`);
    put(`Z offset ${this.pZOffset}`);
    put(`X factor ${this.pXFactor}`);
    put(`Y factor ${this.pYFactor}`);
    put(`H factor ${this.pHFactor}`);
    put("");
    put("HeightMap:");
    put("");
    for (let x = 1; x <= this.pHeightMap.count; x++) {
      let tStr = EMPTY;
      for (let y = 1; y <= this.pHeightMap[x].count; y++) {
        if (this.pHeightMap[x][y] < 100000) {
          tStr = `${tStr}${this.pHeightMap[x][y]}.`;
          continue;
        }
        if (this.pHeightMap[x][y] < 200000) {
          tStr = `${tStr}x.`;
          continue;
        }
        tStr = `${tStr}..`;
      }
      put(`  ${tStr} `);
    }
    put("");
    put("PlaceMap:");
    put("");
    for (let x = 1; x <= this.pPlaceMap.count; x++) {
      let tStr = EMPTY;
      for (let y = 1; y <= this.pPlaceMap[x].count; y++) {
        if (this.pPlaceMap[x][y] < 100000) {
          tStr = `${tStr}${this.pPlaceMap[x][y]}.`;
          continue;
        }
        if (this.pPlaceMap[x][y] < 200000) {
          tStr = `${tStr}x.`;
          continue;
        }
        tStr = `${tStr}..`;
      }
      put(`  ${tStr} `);
    }
    put("");
    put("- - - - - - - - - - - - - - -");
  }
}
