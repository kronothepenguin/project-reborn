export default class {
  pValidPartsList;
  pValidSetIDList;
  pSelectablePartsList;
  pSelectableSetIDList;
  pFigureDataMember;

  construct() {
    this.pValidPartsList = propList();
    this.pValidSetIDList = propList();
    this.pSelectablePartsList = propList();
    this.pSelectableSetIDList = propList();
    this.pFigureDataMember = EMPTY;
    return 1;
  }

  initializeValidPartLists(tPartList) {
    if (!(tPartList.ilk == Symbol.for("propList"))) {
      error(this, "Can't initialize part list!", Symbol.for("initializeValidPartLists"), Symbol.for("major"));
      if (memberExists("DefaultPartList")) {
        tPartList = value(member(getmemnum("DefaultPartList")).text);
      } else {
        return error(this, "Missing default part list!", Symbol.for("initializeValidPartLists"), Symbol.for("major"));
      }
    }
    this.pValidPartsList = tPartList;
    this.pValidSetIDList = propList();
    for (const tsex of ["M", "F"]) {
      this.pValidSetIDList[tsex] = propList();
      for (let tPartSet = 1; tPartSet <= this.pValidPartsList[tsex].count; tPartSet++) {
        const tProp = this.pValidPartsList[tsex].getPropAt(tPartSet);
        const tDesc = this.pValidPartsList[tsex][tProp];
        for (let tP = 1; tP <= tDesc.count; tP++) {
          const tSetID = tDesc[tP]["s"];
          this.pValidSetIDList[tsex].addProp(tSetID, propList("part", tProp, "location", tP));
        }
      }
    }
  }

  initializeSelectablePartList(tSetIDList) {
    if (!(tSetIDList.ilk == Symbol.for("list"))) {
      return error(this, "Can't initialize selectable partlist", Symbol.for("initializeSelectablePartList"), Symbol.for("major"));
    }
    const tTempSetIDList = propList();
    tTempSetIDList["M"] = list();
    tTempSetIDList["F"] = list();
    for (const tSetID of tSetIDList) {
      if (!voidp(this.pValidSetIDList["M"].findPos(tSetID))) {
        tTempSetIDList["M"].add(tSetID);
        continue;
      }
      tTempSetIDList["F"].add(tSetID);
    }
    this.pSelectablePartsList = propList();
    this.pSelectableSetIDList = propList();
    for (const tsex of ["M", "F"]) {
      this.pSelectablePartsList[tsex] = propList();
      this.pSelectableSetIDList[tsex] = propList();
      const tSelectableIDs = tTempSetIDList[tsex];
      for (const tSetID of tSelectableIDs) {
        if (!voidp(this.pValidSetIDList[tsex].findPos(tSetID))) {
          const tPart = this.pValidSetIDList[tsex].getProp(tSetID)[Symbol.for("part")];
          const tlocation = this.pValidSetIDList[tsex].getProp(tSetID)[Symbol.for("location")];
          const tPropList = this.pValidPartsList[tsex][tPart][tlocation];
          if (voidp(this.pSelectablePartsList[tsex][tPart])) {
            this.pSelectablePartsList[tsex][tPart] = list();
          }
          this.pSelectablePartsList[tsex][tPart].add(tPropList);
          this.pSelectableSetIDList[tsex].addProp(tSetID, propList("part", tPart, "location", this.pSelectablePartsList[tsex][tPart].count));
        }
      }
    }
  }

  GenerateFigureDataToServerMode(tFigure, tsex) {
    tFigure = this.checkAndFixFigure(tFigure, tsex);
    let tFigureToServer = EMPTY;
    for (const tPart of ["hr", "hd", "lg", "sh", "ch"]) {
      if (!voidp(tFigure[tPart])) {
        if (!voidp(tFigure[tPart]["setid"]) && !voidp(tFigure[tPart]["colorid"])) {
          let tSetID = tFigure[tPart]["setid"];
          let tColorId = tFigure[tPart]["colorid"];
          if (!stringp(tSetID)) {
            tSetID = string(tSetID);
          }
          if (!stringp(tColorId)) {
            tColorId = string(tColorId);
          }
          if (tSetID.length == 1) {
            tSetID = `00${tSetID}`;
          } else {
            if (tSetID.length == 2) {
              tSetID = `0${tSetID}`;
            }
          }
          if (tColorId.char.count == 1) {
            tColorId = `0${tColorId}`;
          }
          tFigureToServer = `${tFigureToServer}${tSetID}${tColorId}`;
        }
      }
    }
    return propList("figuretoServer", tFigureToServer, "parsedfigure", tFigure);
  }

  checkAndFixFigure(tFigure, tsex) {
    if (tFigure.ilk != Symbol.for("propList")) {
      tFigure = propList();
    }
    for (const tPart of ["hr", "hd", "ey", "fc", "bd", "lh", "rh", "ch", "ls", "rs", "lg", "sh"]) {
      let tMainPart;
      switch (tPart) {
        case "ls":
        case "ch":
        case "rs":
          tMainPart = "ch";
          break;
        case "hd":
        case "ey":
        case "fc":
        case "bd":
        case "lh":
        case "rh":
          tMainPart = "hd";
          break;
        default:
          tMainPart = tPart;
      }
      const tChageParts = this.pValidPartsList[tsex][tMainPart][1]["p"];
      let tmodel = this.pValidPartsList[tsex][tMainPart][1]["p"][tPart];
      let tColorList = this.pValidPartsList[tsex][tMainPart][1]["c"][1];
      const tSetID = this.pValidPartsList[tsex][tMainPart][1]["s"];
      if (!listp(tColorList)) {
        tColorList = list(tColorList);
      }
      let tColorId;
      if (!voidp(tChageParts.findPos(tPart))) {
        tColorId = tChageParts.findPos(tPart);
      } else {
        tColorId = 1;
      }
      let tColor;
      if (tColorList.count >= tColorId) {
        tColor = rgb(tColorList[tColorId]);
      } else {
        tColor = rgb(tColorList[1]);
      }
      if (tmodel.length == 1) {
        tmodel = `00${tmodel}`;
      } else {
        if (tmodel.length == 2) {
          tmodel = `0${tmodel}`;
        }
      }
      if (voidp(tFigure[tPart])) {
        tFigure[tPart] = propList("model", tmodel, "color", tColor, "setid", tSetID, "colorid", 1);
        continue;
      }
      if (tFigure[tPart].ilk != Symbol.for("propList")) {
        tFigure[tPart] = propList();
      }
      if (voidp(tFigure[tPart]["model"]) || voidp(tFigure[tPart]["color"]) || voidp(tFigure[tPart]["setid"]) || voidp(tFigure[tPart]["colorid"])) {
        tFigure[tPart] = propList("model", tmodel, "color", tColor, "setid", tSetID, "colorid", 1);
      }
    }
    return tFigure;
  }

  generateFigureDataToOldServerMode(tFigure, tsex, tCheckValidParts) {
    if (voidp(tsex)) {
      tsex = "M";
    }
    if ((tsex contains "f") || (tsex contains "F")) {
      tsex = "F";
    } else {
      tsex = "M";
    }
    if (voidp(tCheckValidParts)) {
      tCheckValidParts = 0;
    }
    let tFigureData, tNewFigure;
    if (tCheckValidParts) {
      tNewFigure = this.GenerateFigureDataToServerMode(tFigure, tsex);
      tFigureData = this.ConvertServerModeFigureData(tNewFigure["parsedfigure"], tsex);
    } else {
      tFigureData = tFigure;
    }
    const tTemp = the.itemDelimiter;
    the.itemDelimiter = ",";
    tNewFigure = "sd=001/0";
    if (listp(tFigureData)) {
      for (let f = 1; f <= tFigureData.count; f++) {
        const tPart = tFigureData.getPropAt(f);
        let tmodel = tFigureData[tPart]["model"];
        let tColor = tFigureData[tPart]["color"];
        if (tPart != "sd") {
          if (tmodel.length == 1) {
            tmodel = `00${tmodel}`;
          } else {
            if (tmodel.length == 2) {
              tmodel = `0${tmodel}`;
            }
          }
          if (tColor == rgb("#EEEEEE")) {
            tColor = rgb(255, 255, 255);
          }
          tColor = string(tColor);
          if (tColor.item.count < 3) {
            putInto(undefined, "VIKAA SILMISSƒ");
          } else {
            const tR = value(tColor.item[1].char[`5..${length(tColor.item[1])}`]);
            const tG = value(tColor.item[2]);
            const tB = value(tColor.item[3].char[`1..${length(tColor.item[3]) - 1}`]);
            tColor = `${string(tR)},${string(tG)},${string(tB)}`;
          }
          if (tPart == "ey") {
            tColor = "0";
          }
          tNewFigure = `${tNewFigure}&${tPart}=${tmodel}/${tColor}`;
        }
      }
    } else {
      error(this, "Weirdness in figure data!!!", Symbol.for("generateFigureDataToOldServerMode"), Symbol.for("minor"));
      tNewFigure = tFigureData;
    }
    the.itemDelimiter = tTemp;
    return propList("figuretoServer", tNewFigure);
  }

  validateFigure(tFigure, tsex) {
    if ((tsex.char[1] == "F") || (tsex.char[1] == "f")) {
      tsex = "F";
    } else {
      tsex = "M";
    }
    if (voidp(this.pSelectablePartsList[tsex])) {
      return tFigure;
    }
    if (tFigure.ilk != Symbol.for("propList")) {
      tFigure = propList();
    }
    const tTempFigure = propList();
    for (let f = 1; f <= tFigure.count; f++) {
      if (!voidp(tFigure[f]["setid"])) {
        let tColor;
        if (voidp(tFigure[f]["setid"])) {
          tColor = 1;
        } else {
          tColor = tFigure[f]["colorid"];
        }
        const tPart = tFigure.getPropAt(1);
        const tSetID = tFigure[f]["setid"];
        if (!voidp(this.pSelectableSetIDList[tsex].getaProp(integer(tSetID)))) {
          tTempFigure[string(tSetID)] = tColor;
        }
      }
    }
    tFigure = this.parseNewTypeFigure(tTempFigure, tsex);
    return tFigure;
  }

  parseFigure(tFigureData, tsex, tClass, tCommand) {
    if (voidp(tClass)) {
      tClass = "user";
    }
    if (voidp(tCommand)) {
      tCommand = EMPTY;
    }
    let tTempFigure, tFigure;
    switch (tClass) {
      case "user":
      case "pelle":
        tTempFigure = propList();
        if ((tFigureData.char.count == 25) && integerp(integer(tFigureData))) {
          tFigureData = tFigureData.char[`1..${tFigureData.char.count}`];
          const tPartCount = tFigureData.char.count / 5;
          for (let i = 0; i <= tPartCount - 1; i++) {
            const tPart = tFigureData.char[`${(i * 5) + 1}..${(i * 5) + 5}`];
            const tSetID = tPart.char[`1..3`];
            const tColorId = tPart.char[`4..5`];
            tTempFigure[tSetID] = value(tColorId);
          }
        }
        tFigure = this.parseNewTypeFigure(tTempFigure, tsex);
        break;
      case "bot":
        the.itemDelimiter = "&";
        const tPartCount = tFigureData.item.count;
        tFigure = propList();
        for (let i = 1; i <= tPartCount; i++) {
          const tPart = tFigureData.item[i];
          the.itemDelimiter = "=";
          const tProp = tPart.item[1];
          const tDesc = tPart.item[2];
          the.itemDelimiter = "/";
          const tValue = propList();
          tValue["model"] = tDesc.item[1];
          let tColor = tDesc.item[2].line[1];
          the.itemDelimiter = ",";
          if (tColor.item.count == 1) {
            if (integer(tColor) == 0) {
              tValue["color"] = rgb("EEEEEE");
            } else {
              const tPalette = paletteIndex(integer(tColor));
              tValue["color"] = rgb(tPalette.red, tPalette.green, tPalette.blue);
            }
          } else {
            if (tColor.item.count == 3) {
              tValue["color"] = value(`rgb(${tColor})`);
              if (voidp(tValue["color"])) {
                tValue["color"] = rgb("EEEEEE");
              }
              if ((tValue["color"].red + tValue["color"].green + tValue["color"].blue) > (238 * 3)) {
                tValue["color"] = rgb("EEEEEE");
              }
            } else {
              tValue["color"] = rgb("EEEEEE");
            }
          }
          tFigure[tProp] = tValue;
          the.itemDelimiter = "&";
        }
        const tRequiredParts = ["hr", "hd", "ey", "fc", "bd", "lh", "rh", "ch", "ls", "rs", "lg", "sh"];
        for (const tItem of tRequiredParts) {
          if (!listp(tFigure[tItem])) {
            tFigure[tItem] = propList();
          }
          if (!ilk(tFigure[tItem]["color"], Symbol.for("color"))) {
            tFigure[tItem]["color"] = rgb(238, 238, 238);
          }
          if (!stringp(tFigure[tItem]["model"])) {
            tFigure[tItem]["model"] = "001";
          }
        }
        break;
      default:
        return tFigureData;
    }
    return tFigure;
  }

  parseNewTypeFigure(tFigure, tsex) {
    const tMainPartsList = propList();
    if (voidp(tsex)) {
      tsex = "M";
    }
    if ((tsex.char[1] == "F") || (tsex.char[1] == "f")) {
      tsex = "F";
    } else {
      tsex = "M";
    }
    for (let f = 1; f <= tFigure.count; f++) {
      const tSetID = tFigure.getPropAt(f);
      let tColorId = value(tFigure[tSetID]);
      if (!voidp(value(tSetID))) {
        if (voidp(tColorId)) {
          tColorId = 1;
        }
        let tMainPart, tlocation, tchangeparts, tColorList;
        if (!voidp(this.pValidSetIDList[tsex][tSetID])) {
          tMainPart = this.pValidSetIDList[tsex].getProp(tSetID)[Symbol.for("part")];
          tlocation = this.pValidSetIDList[tsex].getProp(tSetID)[Symbol.for("location")];
          tchangeparts = this.pValidPartsList[tsex][tMainPart][tlocation]["p"];
          tColorList = this.pValidPartsList[tsex][tMainPart][tlocation]["c"];
        }
        if (!voidp(tMainPart)) {
          tMainPartsList[tMainPart] = propList("changeparts", tchangeparts, "setid", tSetID, "colorlist", tColorList, "colorID", tColorId);
        }
      }
    }
    let tTempFigure = propList();
    for (const tMainPart of ["hr", "hd", "lg", "sh", "ch"]) {
      if (!voidp(tMainPartsList[tMainPart])) {
        const tSetID = tMainPartsList[tMainPart]["setid"];
        let tColorId = tMainPartsList[tMainPart]["colorID"];
        let tColorList = tMainPartsList[tMainPart]["colorlist"];
        const tchangeparts = tMainPartsList[tMainPart]["changeparts"];
        if (value(tColorId) < 1) {
          tColorId = 1;
        }
        let tColor;
        if (!listp(tColorList)) {
          tColor = rgb("#EEEEEE");
          tColorId = 1;
          error(this, "Weirdness in the list of figure parts!", Symbol.for("parseNewTypeFigure"), Symbol.for("minor"));
        } else {
          if (tColorId > tColorList.count) {
            tColorId = 1;
          }
          if (!listp(tColorList[tColorId])) {
            if (voidp(tColorList[tColorId])) {
              tColor = rgb("#EEEEEE");
            }
            tColor = rgb(tColorList[tColorId]);
          }
        }
        for (let i = 1; i <= tchangeparts.count; i++) {
          const tPart = tchangeparts.getPropAt(i);
          let tmodel = tchangeparts[tPart];
          if (tmodel.char.count == 1) {
            tmodel = `00${tmodel}`;
          } else {
            if (tmodel.char.count == 2) {
              tmodel = `0${tmodel}`;
            }
          }
          if (listp(tColorList[tColorId])) {
            let tPartColor;
            if (tColorList[tColorId].count >= i) {
              tPartColor = rgb(tColorList[tColorId][i]);
            } else {
              tPartColor = rgb(tColorList[tColorId][1]);
            }
            tTempFigure[tPart] = propList("model", tmodel, "color", tPartColor, "setid", tSetID, "colorid", tColorId);
            continue;
          }
          tTempFigure[tPart] = propList("model", tmodel, "color", tColor, "setid", tSetID, "colorid", tColorId);
        }
      }
    }
    tTempFigure = this.checkAndFixFigure(tTempFigure, tsex);
    return tTempFigure;
  }

  getDefaultFigure(tsex) {
    return this.checkAndFixFigure(propList(), tsex);
  }
}
