export default class {
  pFigurePartListLoadedFlag;
  pAvailableSetListLoadedFlag;
  pFigureData;

  construct() {
    this.pFigurePartListLoadedFlag = 0;
    this.pAvailableSetListLoadedFlag = 0;
    setVariable("figurepartlist.loaded", 0);
    setVariable("figure.xml.loaded", 0);
    this.regMsgList(1);
    this.loadPartSetXML();
    this.loadActionSetXML();
    this.loadAnimationSetXML();
    this.pFigureData = createObject(Symbol.for("temp"), "Figure Data Class");
    return 1;
  }

  deconstruct() {
    this.regMsgList(0);
    return 1;
  }

  define(tProps) {
    let tURL, tProlist;
    if (tProps.ilk != Symbol.for("propList")) {
      tURL = getVariable("external.figurepartlist.txt");
      tProps = propList("type", "url", "source", tURL);
    }
    if (voidp(tProps["type"])) {
      error(this, "source type of figure list is void", Symbol.for("define"), Symbol.for("major"));
    }
    switch (tProps["type"]) {
      case "url":
        this.loadFigurePartList(tProps["source"]);
        break;
      case "proplist":
        tProlist = tProps["source"];
        initializeValidPartLists(tProlist);
        break;
      default:
        error(this, "incorrect source type, can´t run define ", Symbol.for("define"), Symbol.for("major"));
        break;
    }
  }

  parseFigure(tFigureData, tsex, tClass) {
    let tFigure, tTempFigure, tPartCount, tPart, tSetID, tColorId, tDelim, tPartData, tSetType, tProp, tDesc, tValue, tColor, tPalette;
    if (voidp(tClass)) {
      tClass = "user";
    }
    switch (tClass) {
      case "user":
      case "pelle":
        tTempFigure = propList();
        if (((tFigureData.char.count % 5) == 0) && integerp(integer(tFigureData))) {
          tFigureData = tFigureData.char[`1..${tFigureData.char.count}`];
          tPartCount = tFigureData.char.count / 5;
          for (let i = 0; i <= tPartCount - 1; i++) {
            tPart = tFigureData.char[`${(i * 5) + 1}..${(i * 5) + 5}`];
            tSetID = tPart.char[`1..3`];
            tColorId = tPart.char[`4..5`];
            tTempFigure[tSetID] = value(tColorId);
          }
        } else {
          tDelim = the.itemDelimiter;
          the.itemDelimiter = ".";
          tPartCount = tFigureData.item.count;
          for (let i = 1; i <= tPartCount; i++) {
            the.itemDelimiter = ".";
            tPartData = tFigureData.item[i];
            the.itemDelimiter = "-";
            if (tPartData.item.count >= 3) {
              tSetType = tPartData.item[1];
              tSetID = tPartData.item[2];
              tColorId = tPartData.item[3];
              tTempFigure[tSetID] = tColorId;
            }
          }
          the.itemDelimiter = tDelim;
        }
        tFigure = this.parseNewTypeFigure(tTempFigure, tsex);
        break;
      case "bot":
        the.itemDelimiter = "&";
        tPartCount = tFigureData.item.count;
        tFigure = propList();
        for (let i = 1; i <= tPartCount; i++) {
          tPart = tFigureData.item[i];
          the.itemDelimiter = "=";
          tProp = tPart.item[1];
          tDesc = tPart.item[2];
          the.itemDelimiter = "/";
          tValue = propList();
          tValue["model"] = tDesc.item[1];
          while (tValue["model"].char[1] == "0") {
            tValue["model"] = tValue["model"].char[`2..${tValue["model"].length}`];
          }
          tColor = tDesc.item[2].line[1];
          the.itemDelimiter = ",";
          if (tColor.item.count == 1) {
            if (integer(tColor) == 0) {
              tValue["color"] = rgb("EEEEEE");
            } else {
              tPalette = paletteIndex(integer(tColor));
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
        break;
      default:
        return tFigureData;
    }
    return tFigure;
  }

  parseNewTypeFigure(tFigure, tsex) {
    let tTempFigure = propList();
    let tHiddenLayers = propList();
    for (let f = 1; f <= tFigure.count; f++) {
      let tSetID = tFigure.getPropAt(f);
      let tColorId = tFigure[tSetID];
      if (voidp(tColorId)) {
        tColorId = 1;
      }
      let tColor = this.pFigureData.getColor(tColorId);
      if (tColor == 0) {
        tColor = rgb("#EEEEEE");
      } else {
        tColor = rgb(tColor);
      }
      let tPartCount = this.pFigureData.getSetPartCount(tSetID);
      for (let i = 1; i <= tPartCount; i++) {
        let tPartData = this.pFigureData.getSetPartData(tSetID, i);
        if (tPartData != 0) {
          let tmodel = tPartData["id"];
          let tPart = tPartData["type"];
          if (tPartData["colorable"]) {
            tTempFigure.addProp(tPart, propList("model", tmodel, "color", tColor, "setid", tSetID, "colorid", tColorId));
            continue;
          }
          tTempFigure.addProp(tPart, propList("model", tmodel, "color", rgb("#EEEEEE"), "setid", tSetID, "colorid", tColorId));
        }
      }
      let tHidden = this.pFigureData.getSetHiddenLayers(tSetID);
      let tSetType = this.pFigureData.getSetType(tSetID);
      if ((tHidden != 0) && (tSetType != 0)) {
        tHiddenLayers[tSetType] = tHidden;
      }
    }
    tTempFigure = this.checkAndFixFigure(tTempFigure, tHiddenLayers);
    return tTempFigure;
  }

  checkDataLoaded() {
    const tList = list("partsets.xml.loaded", "draworder.xml.loaded", "animation.xml.loaded", "figure.xml.loaded");
    for (const tName of tList) {
      if (!variableExists(tName)) {
        return 0;
      }
      if (getVariable(tName) != 1) {
        return 0;
      }
    }
    let tStamp = EMPTY;
    for (let tNo = 1; tNo <= 100; tNo++) {
      let tChar = numToChar(random(48) + 74);
      tStamp = `${tStamp}${tChar}`;
    }
    let tFuseReceipt = getSpecialServices().getReceipt(tStamp);
    let tReceipt = list();
    for (let tCharNo = 1; tCharNo <= tStamp.length; tCharNo++) {
      let tChar = chars(tStamp, tCharNo, tCharNo);
      tChar = charToNum(tChar);
      tChar = (tChar * tCharNo) + 309203;
      tReceipt[tCharNo] = tChar;
    }
    if (tReceipt != tFuseReceipt) {
      error(this, "Invalid build structure", Symbol.for("checkDataLoaded"), Symbol.for("critical"));
      return 0;
    }
    setVariable("figurepartlist.loaded", 1);
    return 1;
  }

  loadFigurePartList(tURL) {
    const tMem = tURL;
    let tMemberCount = 0;
    const tCastList = list("hh_human_shirt", "hh_human_leg", "hh_human_shoe", "hh_human_body", "hh_human_face", "hh_human_hats", "hh_human_hair");
    for (const tCastName of tCastList) {
      const tCastLib = castLib(tCastName);
      if (tCastLib != 0) {
        tMemberCount = tMemberCount + the.numberOfCastMembersOfCastLib(tCastName);
      }
    }
    let tSeparator = "?";
    if (tURL.contains("?")) {
      tSeparator = "&";
    }
    if (the.moviePath.contains("http://")) {
      tURL = `${tURL}${tSeparator}graphcount=${tMemberCount}`;
    } else {
      if (tURL.contains("http://")) {
        tURL = `${tURL}${tSeparator}graphcount=${tMemberCount}`;
      }
    }
    sendProcessTracking(13);
    const tmember = queueDownload(tURL, tMem, Symbol.for("field"), 1);
    return registerDownloadCallback(tmember, Symbol.for("partListLoaded"), this.getID());
  }

  partListLoaded(tParams, tSuccess) {
    let tMemName, tContent, tValidpartList;
    if (!tSuccess) {
      fatalError(propList("error", "part_list"));
      return error(this, "Failure while loading part list", Symbol.for("partListLoaded"), Symbol.for("critical"));
    }
    tMemName = getVariable("external.figurepartlist.txt");
    if (tMemName == 0) {
      tMemName = EMPTY;
    }
    if (!memberExists(tMemName)) {
      tValidpartList = VOID;
      error(this, "Failure while loading part list", Symbol.for("partListLoaded"), Symbol.for("major"));
    } else {
      tContent = member(getmemnum(tMemName)).text;
      if (!this.pFigureData.parseData(tContent)) {
        return error(this, "Failure while parsing part list", Symbol.for("partListLoaded"), Symbol.for("critical"));
      }
    }
    this.pFigurePartListLoadedFlag = 1;
    setVariable("figure.xml.loaded", 1);
    this.checkDataLoaded();
    if (memberExists(tMemName)) {
      removeMember(tMemName);
    }
  }

  checkAndFixFigure(tFigure, tHiddenLayers) {
    let tPartDefinition, tHiddenLayersOrdered, tRemoveList;
    if (tFigure.ilk != Symbol.for("propList")) {
      tFigure = propList();
    }
    tFigure = tFigure.duplicate();
    if (tHiddenLayers.ilk != Symbol.for("propList")) {
      tHiddenLayers = propList();
    }
    tPartDefinition = getVariableValue("human.parts.h");
    if (tPartDefinition == 0) {
      tPartDefinition = list();
    }
    tHiddenLayersOrdered = propList();
    for (let i = tPartDefinition.count; i >= 1; i--) {
      let tPartSymbol = tPartDefinition[i];
      if (!voidp(tHiddenLayers[tPartSymbol])) {
        tHiddenLayersOrdered.addProp(tPartSymbol, tHiddenLayers[tPartSymbol]);
      }
    }
    for (let i = 1; i <= tHiddenLayersOrdered.count; i++) {
      tRemoveList = tHiddenLayersOrdered[i];
      for (const tPart of tRemoveList) {
        while (tFigure.findPos(tPart) > 0) {
          tFigure.deleteProp(tPart);
        }
        if (tHiddenLayersOrdered.findPos(tPart) > i) {
          tHiddenLayersOrdered.deleteProp(tPart);
        }
      }
    }
    tRemoveList = getVariable("human.parts.removeList");
    if (ilk(tRemoveList) != Symbol.for("propList")) {
      tRemoveList = propList();
    }
    for (let i = 1; i <= tRemoveList.count; i++) {
      let tPart = tRemoveList.getPropAt(i);
      if (tFigure.findPos(tPart) > 0) {
        let tRemovePart = tRemoveList[i];
        tFigure.deleteProp(tRemovePart);
      }
    }
    return tFigure;
  }

  loadPartSetXML() {
    let tURL, tMem, tmember;
    if (variableExists("partsets.xml.loaded")) {
      if (getVariable("partsets.xml.loaded") == 1) {
        return 1;
      }
    }
    tURL = getVariable("figure.partsets.xml");
    if (tURL == 0) {
      return error(this, "Can't load partset XML - no URL configured", Symbol.for("loadPartSetXML"), Symbol.for("critical"));
    }
    tMem = tURL;
    sendProcessTracking(14);
    tmember = queueDownload(tURL, tMem, Symbol.for("field"), 1);
    return registerDownloadCallback(tmember, Symbol.for("partSetLoaded"), this.getID());
  }

  loadActionSetXML() {
    let tURL, tMem, tmember;
    if (variableExists("draworder.xml.loaded")) {
      if (getVariable("draworder.xml.loaded") == 1) {
        return 1;
      }
    }
    tURL = getVariable("figure.draworder.xml");
    if (tURL == 0) {
      return error(this, "Can't load action set XML - no URL configured", Symbol.for("loadActionSetXML"), Symbol.for("critical"));
    }
    tMem = tURL;
    sendProcessTracking(16);
    tmember = queueDownload(tURL, tMem, Symbol.for("field"), 1);
    return registerDownloadCallback(tmember, Symbol.for("actionSetLoaded"), this.getID());
  }

  loadAnimationSetXML() {
    let tURL, tMem, tmember;
    if (variableExists("animation.xml.loaded")) {
      if (getVariable("animation.xml.loaded") == 1) {
        return 1;
      }
    }
    tURL = getVariable("figure.animation.xml");
    if (tURL == 0) {
      return error(this, "Can't load animation XML - no URL configured", Symbol.for("loadAnimationSetXML"), Symbol.for("critical"));
    }
    tMem = tURL;
    sendProcessTracking(17);
    tmember = queueDownload(tURL, tMem, Symbol.for("field"), 1);
    return registerDownloadCallback(tmember, Symbol.for("animationSetLoaded"), this.getID());
  }

  partSetLoaded(tParams, tSuccess) {
    let tMemName, tdata, tPeopleSize, tPeopleSize50, tParserObject, errCode, errorString, tElementPartSet, tFullList, tSwimList, tSmallList, tSwimSmallList, tFlipList, tRemoveList, tElementPart, tAttributes, tName, tValue, tPartList, tID, tElementAction;
    sendProcessTracking(18);
    if (!tSuccess) {
      fatalError(propList("error", "part_sets"));
      return error(this, "Failure while loading partset XML", Symbol.for("partSetLoaded"), Symbol.for("critical"));
    }
    tMemName = getVariable("figure.partsets.xml");
    if (tMemName == 0) {
      return error(this, "Failure while loading partset XML", Symbol.for("partSetLoaded"), Symbol.for("critical"));
    }
    if (!memberExists(tMemName)) {
      return error(this, "Failure while loading partset XML", Symbol.for("partSetLoaded"), Symbol.for("critical"));
    }
    tdata = member(tMemName).text;
    if (!voidp(tdata)) {
      tPeopleSize = getVariable("human.size.64");
      tPeopleSize50 = getVariable("human.size.32");
      tParserObject = new(xtra("xmlparser"));
      errCode = tParserObject.parseString(tdata);
      errorString = tParserObject.getError();
      if (!voidp(errorString)) {
        fatalError(propList("error", "part_sets_invalid"));
        return error(this, "Failure while parsing partset XML", Symbol.for("partSetLoaded"), Symbol.for("critical"));
      }
      for (let i = 1; i <= tParserObject.child.count; i++) {
        tName = tParserObject.child[i].name;
        if (tName == "partSets") {
          for (let j = 1; j <= tParserObject.child[i].child.count; j++) {
            tElementPartSet = tParserObject.child[i].child[j];
            if (tElementPartSet.name == "partSet") {
              tFullList = list();
              tSwimList = list();
              tSmallList = list();
              tSwimSmallList = list();
              tFlipList = propList();
              tRemoveList = propList();
              for (let k = 1; k <= tElementPartSet.child.count; k++) {
                tElementPart = tElementPartSet.child[k];
                if (tElementPart.name == "part") {
                  tAttributes = propList("swim", 1, "small", 1);
                  for (let l = 1; l <= tElementPart.attributeName.count; l++) {
                    tName = tElementPart.attributeName[l];
                    tValue = tElementPart.attributeValue[l];
                    tAttributes[tName] = tValue;
                  }
                  if (!voidp(tAttributes["set-type"])) {
                    tFullList.add(tAttributes["set-type"]);
                    if (value(tAttributes["swim"])) {
                      tSwimList.add(tAttributes["set-type"]);
                      if (value(tAttributes["small"])) {
                        tSwimSmallList.add(tAttributes["set-type"]);
                      }
                    }
                    if (value(tAttributes["small"])) {
                      tSmallList.add(tAttributes["set-type"]);
                    }
                    if (!voidp(tAttributes["flipped-set-type"])) {
                      tFlipList.addProp(tAttributes["set-type"], tAttributes["flipped-set-type"]);
                    }
                    if (!voidp(tAttributes["remove-set-type"])) {
                      tRemoveList.addProp(tAttributes["set-type"], tAttributes["remove-set-type"]);
                    }
                    continue;
                  }
                  error(this, "missing set-type attribute for part in partSet element!", Symbol.for("loadPartSetXML"), Symbol.for("major"));
                }
              }
              setVariable(`human.parts.${tPeopleSize}`, tFullList);
              setVariable(`human.parts.${tPeopleSize50}`, tSmallList);
              setVariable(`swimmer.parts.${tPeopleSize}`, tSwimList);
              setVariable(`swimmer.parts.${tPeopleSize50}`, tSwimSmallList);
              setVariable("human.parts.flipList", tFlipList);
              setVariable("human.parts.removeList", tRemoveList);
              continue;
            }
            if (tElementPartSet.name == "activePartSet") {
              tPartList = list();
              tID = VOID;
              for (let l = 1; l <= tElementPartSet.attributeName.count; l++) {
                tName = tElementPartSet.attributeName[l];
                tValue = tElementPartSet.attributeValue[l];
                if (tName == "id") {
                  tID = tValue;
                }
              }
              if (!voidp(tID)) {
                for (let k = 1; k <= tElementPartSet.child.count; k++) {
                  tElementPart = tElementPartSet.child[k];
                  if (tElementPart.name == "activePart") {
                    tAttributes = propList("set-type", VOID);
                    for (let l = 1; l <= tElementPart.attributeName.count; l++) {
                      tName = tElementPart.attributeName[l];
                      tValue = tElementPart.attributeValue[l];
                      tAttributes[tName] = tValue;
                    }
                    if (!voidp(tAttributes["set-type"])) {
                      tPartList.add(tAttributes["set-type"]);
                    }
                  }
                }
                setVariable(`human.partset.${tID}.${tPeopleSize}`, tPartList);
                setVariable(`human.partset.${tID}.${tPeopleSize50}`, tPartList);
                continue;
              }
              error(this, "missing id attribute for activePartSet!", Symbol.for("loadPartSetXML"), Symbol.for("major"));
            }
          }
        }
      }
    }
    setVariable("partsets.xml.loaded", 1);
    this.checkDataLoaded();
  }

  actionSetLoaded(tParams, tSuccess) {
    let tMemName, tdata, tPeopleSize, tPeopleSize50, tParserObject, errCode, errorString, tElementAction, tID, tElementDirection, tDirection, tPartList, tElementPartList;
    sendProcessTracking(19);
    if (!tSuccess) {
      fatalError(propList("error", "action_set"));
      return error(this, "Failure while loading action set XML", Symbol.for("actionSetLoaded"), Symbol.for("critical"));
    }
    tMemName = getVariable("figure.draworder.xml");
    if (tMemName == 0) {
      return error(this, "Failure while loading action set XML", Symbol.for("actionSetLoaded"), Symbol.for("critical"));
    }
    if (!memberExists(tMemName)) {
      return error(this, "Failure while loading action set XML", Symbol.for("actionSetLoaded"), Symbol.for("critical"));
    }
    tdata = member(tMemName).text;
    if (!voidp(tdata)) {
      tPeopleSize = getVariable("human.size.64");
      tPeopleSize50 = getVariable("human.size.32");
      tParserObject = new(xtra("xmlparser"));
      errCode = tParserObject.parseString(tdata);
      errorString = tParserObject.getError();
      if (!voidp(errorString)) {
        fatalError(propList("error", "action_set_invalid"));
        return error(this, "Failure while parsing action set XML", Symbol.for("actionSetLoaded"), Symbol.for("critical"));
      }
      for (let i = 1; i <= tParserObject.child.count; i++) {
        tName = tParserObject.child[i].name;
        if (tName == "actionSet") {
          for (let j = 1; j <= tParserObject.child[i].child.count; j++) {
            tElementAction = tParserObject.child[i].child[j];
            if (tElementAction.name == "action") {
              tID = VOID;
              for (let l = 1; l <= tElementAction.attributeName.count; l++) {
                tName = tElementAction.attributeName[l];
                tValue = tElementAction.attributeValue[l];
                if (tName == "id") {
                  tID = tValue;
                }
              }
              if (!voidp(tID)) {
                for (let k = 1; k <= tElementAction.child.count; k++) {
                  tElementDirection = tElementAction.child[k];
                  if (tElementDirection.name == "direction") {
                    tDirection = VOID;
                    for (let l = 1; l <= tElementDirection.attributeName.count; l++) {
                      tName = tElementDirection.attributeName[l];
                      tValue = tElementDirection.attributeValue[l];
                      if (tName == "id") {
                        tDirection = tValue;
                      }
                    }
                    if (!voidp(tDirection)) {
                      tPartList = list();
                      for (let l = 1; l <= tElementDirection.child.count; l++) {
                        tElementPartList = tElementDirection.child[l];
                        if (tElementPartList.name == "partList") {
                          tPartList = this.parsePartListXML(tElementPartList);
                        }
                      }
                      if (tID == "std") {
                        setVariable(`human.parts.${tPeopleSize}.${tDirection}`, tPartList);
                        setVariable(`human.parts.${tPeopleSize50}.${tDirection}`, tPartList);
                      } else {
                        setVariable(`human.parts.${tPeopleSize}.${tID}.${tDirection}`, tPartList);
                        setVariable(`human.parts.${tPeopleSize50}.${tID}.${tDirection}`, tPartList);
                      }
                      continue;
                    }
                  }
                }
                continue;
              }
              error(this, "missing id attribute for partSet!", Symbol.for("loadPartSetXML"), Symbol.for("major"));
            }
          }
        }
      }
    }
    setVariable("draworder.xml.loaded", 1);
    this.checkDataLoaded();
  }

  animationSetLoaded(tParams, tSuccess) {
    let tAnimationData = propList();
    let tMemName, tdata, tPeopleSize, tPeopleSize50, tParserObject, errCode, errorString, tElementAction, tID, tElementPart, tAttributes, tName, tValue, tFrameList;
    sendProcessTracking(20);
    if (!tSuccess) {
      fatalError(propList("error", "animation_set"));
      return error(this, "Failure while loading animation XML", Symbol.for("animationSetLoaded"), Symbol.for("critical"));
    }
    tMemName = getVariable("figure.animation.xml");
    if (tMemName == 0) {
      return error(this, "Failure while loading animation XML", Symbol.for("animationSetLoaded"), Symbol.for("critical"));
    }
    if (!memberExists(tMemName)) {
      return error(this, "Failure while loading animation XML", Symbol.for("animationSetLoaded"), Symbol.for("critical"));
    }
    tdata = member(tMemName).text;
    if (!voidp(tdata)) {
      tPeopleSize = getVariable("human.size.64");
      tPeopleSize50 = getVariable("human.size.32");
      tParserObject = new(xtra("xmlparser"));
      errCode = tParserObject.parseString(tdata);
      errorString = tParserObject.getError();
      if (!voidp(errorString)) {
        fatalError(propList("error", "animation_set_invalid"));
        return error(this, "Failure while parsing animation XML", Symbol.for("animationSetLoaded"), Symbol.for("critical"));
      }
      for (let i = 1; i <= tParserObject.child.count; i++) {
        tName = tParserObject.child[i].name;
        if (tName == "animationSet") {
          for (let j = 1; j <= tParserObject.child[i].child.count; j++) {
            tElementAction = tParserObject.child[i].child[j];
            if (tElementAction.name == "action") {
              tID = VOID;
              for (let l = 1; l <= tElementAction.attributeName.count; l++) {
                tName = tElementAction.attributeName[l];
                tValue = tElementAction.attributeValue[l];
                if (tName == "id") {
                  tID = tValue;
                }
              }
              if (!voidp(tID)) {
                for (let k = 1; k <= tElementAction.child.count; k++) {
                  tElementPart = tElementAction.child[k];
                  if (tElementPart.name == "part") {
                    tAttributes = propList("set-type", VOID);
                    for (let l = 1; l <= tElementPart.attributeName.count; l++) {
                      tName = tElementPart.attributeName[l];
                      tValue = tElementPart.attributeValue[l];
                      tAttributes[tName] = tValue;
                    }
                    if (!voidp(tAttributes["set-type"])) {
                      tFrameList = this.parseFrameListXML(tElementPart);
                      if (voidp(tAnimationData[tAttributes["set-type"]])) {
                        tAnimationData[tAttributes["set-type"]] = propList();
                      }
                      tAnimationData[tAttributes["set-type"]][tID] = tFrameList;
                      continue;
                    }
                    error(this, "missing set-type attribute for part in action element!", Symbol.for("loadPartSetXML"), Symbol.for("major"));
                  }
                }
              }
              continue;
            }
            error(this, "missing id attribute in action element!", Symbol.for("loadPartSetXML"), Symbol.for("major"));
          }
        }
      }
    }
    setVariable("human.parts.animationList", tAnimationData);
    setVariable("animation.xml.loaded", 1);
    this.checkDataLoaded();
  }

  parsePartListXML(tElement) {
    let tPartList = list();
    let tIndex = 1;
    for (let i = 1; i <= tElement.child.count; i++) {
      let tElementPart = tElement.child[i];
      if (tElementPart.name == "part") {
        let tAttributes = propList("set-type", VOID);
        for (let l = 1; l <= tElementPart.attributeName.count; l++) {
          let tName = tElementPart.attributeName[l];
          let tValue = tElementPart.attributeValue[l];
          tAttributes[tName] = tValue;
        }
        if (!voidp(tAttributes["set-type"])) {
          tPartList[tIndex] = tAttributes["set-type"];
          tIndex = tIndex + 1;
          continue;
        }
        error(this, "missing set-type attribute for part!", Symbol.for("parsePartListXML"), Symbol.for("major"));
      }
    }
    return tPartList;
  }

  parseFrameListXML(tElement) {
    let tFrameList = list();
    let tIndex = 1;
    for (let i = 1; i <= tElement.child.count; i++) {
      let tElementFrame = tElement.child[i];
      if (tElementFrame.name == "frame") {
        let tAttributes = propList("number", VOID);
        for (let l = 1; l <= tElementFrame.attributeName.count; l++) {
          let tName = tElementFrame.attributeName[l];
          let tValue = tElementFrame.attributeValue[l];
          tAttributes[tName] = tValue;
        }
        if (!voidp(tAttributes["number"])) {
          tFrameList[tIndex] = tAttributes["number"];
          tIndex = tIndex + 1;
          continue;
        }
        error(this, "missing number attribute for frame!", Symbol.for("parseFrameListXML"), Symbol.for("major"));
      }
    }
    return tFrameList;
  }

  regMsgList(tBool) {
    let tMsgs = propList();
    let tCmds = propList();
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
