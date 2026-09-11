export default class {
  pName;
  pMsg;
  pDate;
  pWindowName;
  pPlateObjID;

  prepare(tdata) {
    this.pPlateObjID = "trophy_plate";
    this.pName = EMPTY;
    this.pMsg = EMPTY;
    this.pDate = EMPTY;
    this.pWindowName = "plate_gold.window";
    if (tdata.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect data", Symbol.for("prepare"), Symbol.for("major"));
    }
    if (voidp(tdata[Symbol.for("stuffdata")])) {
      return 1;
    } else {
      const tTemp = tdata[Symbol.for("stuffdata")];
      const tDelim = the.itemDelimiter;
      the.itemDelimiter = TAB;
      if (tTemp.item.count > 2) {
        this.pName = tTemp.item[1];
        this.pDate = tTemp.item[2];
        this.pMsg = tTemp.item[`3..${tTemp.item.count}`];
        this.pMsg = replaceChunks(this.pMsg, "\r", RETURN);
      } else {
        if (tTemp.item.count == 2) {
          this.pName = tTemp.item[1];
          this.pDate = tTemp.item[2];
        } else {
          this.pName = EMPTY;
          this.pDate = EMPTY;
          this.pMsg = EMPTY;
          error(this, "Name and date missing", Symbol.for("prepare"), Symbol.for("minor"));
        }
      }
      the.itemDelimiter = tDelim;
      if (this.pPartColors.ilk == Symbol.for("list")) {
        if (this.pPartColors.count == 5) {
          let tSilverDetected = 0;
          const tCol = this.pPartColors[3];
          if ((chars(tCol, 2, 3) == chars(tCol, 4, 5)) && (chars(tCol, 2, 3) == chars(tCol, 6, 7))) {
            tSilverDetected = 1;
          }
          if (tSilverDetected) {
            this.pWindowName = "plate_silver.window";
          } else {
            if (this.pPartColors[3] == "#996600") {
              this.pWindowName = "plate_bronze.window";
            }
          }
        }
      }
    }
    return 1;
  }

  select() {
    if (the.doubleClick) {
      let tObj;
      if (!objectExists(this.pPlateObjID)) {
        tObj = createObject(this.pPlateObjID, "Plate Class");
      } else {
        tObj = getObject(this.pPlateObjID);
      }
      if (tObj != 0) {
        tObj.show(this.pName, this.pDate, this.pMsg, this.pWindowName);
      }
    }
    return 1;
  }
}
