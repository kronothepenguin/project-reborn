export default class {
  pFigurePartListLoadedFlag;
  pAvailableSetListLoadedFlag;
  pValidPartsList;
  pValidSetIDList;
  pSelectablePartsList;
  pSelectableSetIDList;

  construct() {
    this.pFigurePartListLoadedFlag = 0;
    this.pAvailableSetListLoadedFlag = 0;
    this.pValidPartsList = propList();
    this.pValidSetIDList = propList();
    this.pSelectablePartsList = propList();
    this.pSelectableSetIDList = propList();
    this.regMsgList(1);
    return 1;
  }

  deconstruct() {
    this.regMsgList(0);
    return 1;
  }

  define(tProps) {
    if (tProps.ilk != Symbol.for("propList")) {
      const tURL = getVariable("external.figurepartlist.txt");
      tProps = propList("type", "url", "source", tURL);
    }
    if (voidp(tProps["type"])) {
      error(this, "source type of figure list is void", Symbol.for("define"), Symbol.for("major"));
    }
    switch (tProps["type"]) {
      case "url":
        this.loadFigurePartList(tProps["source"]);
        break;
      case "member": {
        const tMemberName = tProps["source"];
        this.createValidPartList(tMemberName);
        break;
      }
      case "proplist": {
        const tProlist = tProps["source"];
        initializeValidPartLists(tProlist);
        break;
      }
      default:
        error(this, "incorret source type, can´t run define ", Symbol.for("define"), Symbol.for("major"));
    }
  }

  isFigureSystemReady() {
    if (this.pAvailableSetListLoadedFlag == 1) {
      return 1;
    } else {
      this.getAvailableSetList();
      return 0;
    }
  }

  getAvailableSetList() {
    if ((this.pFigurePartListLoadedFlag == 1) && (this.pAvailableSetListLoadedFlag == 0)) {
      if (connectionExists(getVariable("connection.info.id"))) {
        getConnection(getVariable("connection.info.id")).send("GETAVAILABLESETS");
      }
    }
  }

  setAvailableSetList(tList) {
    if (this.pFigurePartListLoadedFlag && !voidp(tList)) {
      this.initializeSelectablePartList(tList);
      this.pAvailableSetListLoadedFlag = 1;
      executeMessage(Symbol.for("figure_ready"));
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

  getCountOfPart(tPart, tsex) {
    if (voidp(tPart) || voidp(tsex)) {
      return error(this, `can´t get part count because tPart or tSex is VOID:${tPart} ${tsex}`, Symbol.for("getCountOfPart"), Symbol.for("major"));
    }
    if ((tsex.char[1] == "F") || (tsex.char[1] == "f")) {
      tsex = "F";
    } else {
      tsex = "M";
    }
    if (voidp(this.pSelectablePartsList[tsex])) {
      return 0;
    }
    if (!voidp(this.pSelectablePartsList[tsex][tPart])) {
      return this.pSelectablePartsList[tsex][tPart].count;
    } else {
      return error(this, `Can´t get part count:${tPart} ${tsex}`, Symbol.for("getCountOfPart"), Symbol.for("major"));
    }
  }

  getCountOfPartColors(tPart, tSetID, tsex) {
    if (voidp(tPart) || voidp(tSetID) || voidp(tsex)) {
      return error(this, `Can´t get part color count because tPart or setid or tSex is VOID${tPart} ${tsex}`, Symbol.for("getCountOfPartColors"), Symbol.for("major"));
    }
    if ((tsex.char[1] == "F") || (tsex.char[1] == "f")) {
      tsex = "F";
    } else {
      tsex = "M";
    }
    if (voidp(this.pSelectablePartsList[tsex])) {
      return 0;
    }
    if (voidp(this.pSelectablePartsList[tsex][tPart])) {
      return error(this, `Figure part not found${tPart}`, Symbol.for("getCountOfPartColors"), Symbol.for("major"));
    }
    if (voidp(this.pSelectableSetIDList[tsex].getaProp(tSetID))) {
      return error(this, `SetID not found${tSetID}`, Symbol.for("getCountOfPartColors"), Symbol.for("major"));
    }
    const tSetOrderNum = this.pSelectableSetIDList[tsex].getProp(tSetID)[Symbol.for("location")];
    if (!voidp(this.pSelectablePartsList[tsex][tPart][tSetOrderNum]["c"])) {
      return this.pSelectablePartsList[tsex][tPart][tSetOrderNum]["c"].count;
    } else {
      return error(this, `Can´t get part color count${tPart} ${tSetID} ${tsex}`, Symbol.for("getCountOfPartColors"), Symbol.for("major"));
    }
  }

  getModelOfPartByOrderNum(tPart, tOrderNum, tsex) {
    if (voidp(tOrderNum) || voidp(tPart) || voidp(tsex)) {
      return error(this, `Can´t get the model of part becouse tOrderNum or tPart or tSex is VOID:${tOrderNum} ${tPart} ${tsex}`, Symbol.for("getModelOfPartByOrderNum"), Symbol.for("major"));
    }
    if ((tsex.char[1] == "F") || (tsex.char[1] == "f")) {
      tsex = "F";
    } else {
      tsex = "M";
    }
    if (voidp(this.pSelectablePartsList[tsex])) {
      return 0;
    }
    if (voidp(this.pSelectablePartsList[tsex][tPart])) {
      return error(this, `figure part not found${tPart}`, Symbol.for("getModelOfPartByOrderNum"), Symbol.for("major"));
    }
    if (tOrderNum < 1) {
      tOrderNum = this.pSelectablePartsList[tsex][tPart].count;
    }
    if (tOrderNum > this.pSelectablePartsList[tsex][tPart].count) {
      tOrderNum = 1;
    }
    if (!voidp(this.pSelectablePartsList[tsex][tPart][tOrderNum])) {
      const tChangePartPropList = this.pSelectablePartsList[tsex][tPart][tOrderNum]["p"];
      const tSetID = this.pSelectablePartsList[tsex][tPart][tOrderNum]["s"];
      const tSelectedPart = tOrderNum;
      const tColor = this.pSelectablePartsList[tsex][tPart][tOrderNum]["c"][1];
      return propList("selectedpart", tSelectedPart, "changeparts", tChangePartPropList, "ordernum", tOrderNum, "firstcolor", tColor, "setid", tSetID);
    }
  }

  getColorOfPartByOrderNum(tPart, tOrderNum, tSetID, tsex) {
    if (voidp(tOrderNum) || voidp(tPart) || voidp(tsex)) {
      return error(this, `Can´t get part color beaouse tOrderNum or tPart or tSex is VOID:${tOrderNum} ${tPart} ${tsex}`, Symbol.for("getColorOfPartByOrderNum"), Symbol.for("major"));
    }
    if (voidp(tSetID)) {
      return error(this, `Can´t get part color because tSetID is VOID${tsex}`, Symbol.for("getColorOfPartByOrderNum"), Symbol.for("major"));
    }
    if ((tsex.char[1] == "F") || (tsex.char[1] == "f")) {
      tsex = "F";
    } else {
      tsex = "M";
    }
    if (voidp(this.pSelectablePartsList[tsex])) {
      return 0;
    }
    if (voidp(this.pSelectablePartsList[tsex][tPart])) {
      return error(this, `Figure part not found:${tPart}`, Symbol.for("getColorOfPartByOrderNum"), Symbol.for("major"));
    }
    if (voidp(this.pSelectableSetIDList[tsex].getaProp(tSetID))) {
      return error(this, `SetID not found:${tSetID}`, Symbol.for("getCountOfPartColors"), Symbol.for("major"));
    }
    const tSetOrderNum = this.pSelectableSetIDList[tsex].getProp(tSetID)[Symbol.for("location")];
    if (tOrderNum < 1) {
      tOrderNum = this.pSelectablePartsList[tsex][tPart][tSetOrderNum]["c"].count;
    }
    if (tOrderNum > this.pSelectablePartsList[tsex][tPart][tSetOrderNum]["c"].count) {
      tOrderNum = 1;
    }
    if (!voidp(this.pSelectablePartsList[tsex][tPart][tSetOrderNum]["c"][tOrderNum])) {
      const tChangePartPropList = this.pSelectablePartsList[tsex][tPart][tSetOrderNum]["p"];
      const tColor = this.pSelectablePartsList[tsex][tPart][tSetOrderNum]["c"][tOrderNum];
      return propList("color", tColor, "changeparts", tChangePartPropList, "ordernum", tOrderNum);
    }
  }

  loadFigurePartList(tURL) {
    const tMem = tURL;
    let tMemberCount = 0;
    const tCastList = ["hh_human_shirt", "hh_human_leg", "hh_human_shoe", "hh_human_body", "hh_human_face", "hh_human_hats", "hh_human_hair"];
    for (const tCastName of tCastList) {
      const tCastLib = castLib(tCastName);
      if (tCastLib != 0) {
        tMemberCount = tMemberCount + the.numberOfCastMembersOfCastLib(tCastName);
      }
    }
    let tSeparator = "?";
    if (tURL contains "?") {
      tSeparator = "&";
    }
    if (the.moviePath contains "http://") {
      tURL = `${tURL}${tSeparator}graphcount=${tMemberCount}`;
    } else {
      if (tURL contains "http://") {
        tURL = `${tURL}${tSeparator}graphcount=${tMemberCount}`;
      }
    }
    const tmember = queueDownload(tURL, tMem, Symbol.for("field"), 1);
    return registerDownloadCallback(tmember, Symbol.for("partListLoaded"), this.getID());
  }

  partListLoaded() {
    let tMemName = getVariable("external.figurepartlist.txt");
    if (tMemName == 0) {
      tMemName = EMPTY;
    }
    let tValidpartList;
    if (!memberExists(tMemName)) {
      tValidpartList = VOID;
      error(this, "Failure while loading part list", Symbol.for("partListLoaded"), Symbol.for("major"));
    } else {
      try();
      tValidpartList = value(member(getmemnum(tMemName)).text);
      if (catch()) {
        tValidpartList = VOID;
      }
    }
    this.initializeValidPartLists(tValidpartList);
    this.pFigurePartListLoadedFlag = 1;
    setVariable("figurepartlist.loaded", 1);
    if (memberExists(tMemName)) {
      removeMember(tMemName);
    }
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

  createValidPartList(tmember) {
    this.pValidPartsList = propList();
    this.pValidSetIDList = propList();
    this.pSelectablePartsList = propList();
    this.pSelectableSetIDList = propList();
    const tTempItemdelimiter = the.itemDelimiter;
    for (let tsex of ["Male", "Female"]) {
      if (!memberExists(tmember + tsex)) {
        error(this, `Can't create list of valid figure parts, member not found:${tmember}${tsex}`, Symbol.for("createValidPartList"), Symbol.for("major"));
        continue;
      }
      const tFigureIds = member(getmemnum(tmember + tsex)).text;
      tsex = tsex.char[1];
      if (voidp(this.pValidPartsList[tsex])) {
        this.pValidPartsList[tsex] = propList();
      }
      let ttempProp = VOID;
      let tPartId = VOID;
      let tMainPart = VOID;
      let tMultiPartProps = VOID;
      let ttempColor = list();
      for (let f = 1; f <= tFigureIds.line.count; f++) {
        const tLine = tFigureIds.line[f];
        if ((tLine.char[1] != "*") && (tLine.char.count > 7)) {
          the.itemDelimiter = ":";
          if (!voidp(ttempProp)) {
            ttempColor.add(tLine.item[2]);
          }
          continue;
        }
        if ((tLine.char[1] == "*") || (f == tFigureIds.line.count)) {
          if (!voidp(tMainPart)) {
            if (voidp(this.pValidPartsList[tsex][tMainPart])) {
              this.pValidPartsList[tsex][tMainPart] = list();
            }
          }
          if (!voidp(ttempProp) && (ttempColor != propList())) {
            this.pValidPartsList[tsex][tMainPart].add(propList("s", value(tPartId), "p", tMultiPartProps, "c", ttempColor));
            if (voidp(this.pValidSetIDList[tsex])) {
              this.pValidSetIDList[tsex] = propList();
            }
            if (voidp(this.pValidSetIDList[tsex][tPartId])) {
              this.pValidSetIDList[tsex].addProp(value(tPartId), propList("part", tMainPart, "location", this.pValidPartsList[tsex][tMainPart].count));
            }
          }
          ttempColor = list();
          tMultiPartProps = propList();
          the.itemDelimiter = "/";
          tPartId = tLine.item[2].char[`8..${tLine.item[2].char.count}`];
          ttempProp = tLine.item[3];
          the.itemDelimiter = "=";
          tMainPart = ttempProp.item[1];
          const tMainPartModel = ttempProp.item[2];
          the.itemDelimiter = "/";
          tMultiPartProps.addProp(tMainPart, tMainPartModel);
          if (tLine.item.count > 3) {
            for (let tMultiParts = 4; tMultiParts <= tLine.item.count; tMultiParts++) {
              const tPartItem = tLine.item[tMultiParts];
              ttempProp = `${ttempProp}/${tPartItem}`;
              the.itemDelimiter = "=";
              tMultiPartProps.addProp(tPartItem.item[1], tPartItem.item[2]);
              the.itemDelimiter = "/";
            }
          }
        }
      }
    }
    the.itemDelimiter = tTempItemdelimiter;
    this.pSelectablePartsList = this.pValidPartsList;
    this.pSelectableSetIDList = this.pValidSetIDList;
  }

  initializeValidPartLists(tPlist) {
    if (!(tPlist.ilk == Symbol.for("propList"))) {
      error(this, "Can't initialize valid part list", Symbol.for("initializeValidPartLists"), Symbol.for("minor"));
      if (memberExists("DefaultPartList")) {
        tPlist = value(member(getmemnum("DefaultPartList")).text);
      } else {
        return error(this, "not found default part list", Symbol.for("initializeValidPartLists"), Symbol.for("major"));
      }
    }
    this.pValidPartsList = tPlist;
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

  regMsgList(tBool) {
    const tMsgs = propList();
    const tCmds = propList();
    tCmds.setaProp("GETAVAILABLESETS", 9);
    if (tBool) {
      registerListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    }
  }
}
