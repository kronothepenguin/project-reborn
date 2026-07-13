export default class {
  constructor() {
    this.pPaletteList = propList();
    this.pColorList = propList();
    this.pSetList = propList();
    this.pSetTypeList = propList();
  }

  reset() {
    this.pPaletteList = propList();
    this.pColorList = propList();
    this.pSetList = propList();
    this.pSetTypeList = propList();
  }

  construct() {
    this.reset();
    return 1;
  }

  deconstruct() {
    this.reset();
    return 1;
  }

  parseData(tXMLData) {
    this.reset();
    let tParserObject = new(xtra("xmlparser"));
    let errCode = tParserObject.parseString(tXMLData);
    let errorString = tParserObject.getError();
    if (voidp(errorString)) {
      for (let i = 1; i <= tParserObject.child.count; i++) {
        let tName = tParserObject.child[i].name;
        if (tName == "figuredata") {
          let tElementFigureData = tParserObject.child[i];
          for (let j = 1; j <= tElementFigureData.child.count; j++) {
            let tElement = tElementFigureData.child[j];
            if (tElement.name == "colors") {
              if (this.parseColors(tElement) == 0) {
                this.reset();
                return 0;
              }
              continue;
            }
            if (tElement.name == "sets") {
              if (this.parseSets(tElement) == 0) {
                this.reset();
                return 0;
              }
            }
          }
        }
      }
    } else {
      return 0;
    }
    return 1;
  }

  getColor(tColorId) {
    let tColor = this.pColorList[string(tColorId)];
    if (voidp(tColor)) {
      return 0;
    }
    return tColor;
  }

  getPaletteColor(tPaletteID, tColorIndex) {
    let tPalette = this.pPaletteList[string(tPaletteID)];
    if (voidp(tPalette)) {
      return 0;
    }
    tColorIndex = value(tColorIndex);
    if ((tColorIndex < 1) || (tColorIndex > tPalette.count)) {
      return 0;
    }
    let tColor = tPalette[tColorIndex];
    if (voidp(tColor)) {
      return 0;
    }
    return tColor;
  }

  getPaletteColorID(tPaletteID, tColorIndex) {
    let tPalette = this.pPaletteList[string(tPaletteID)];
    if (voidp(tPalette)) {
      return 0;
    }
    tColorIndex = value(tColorIndex);
    if ((tColorIndex < 1) || (tColorIndex > tPalette.count)) {
      return 0;
    }
    return tPalette.getPropAt(tColorIndex);
  }

  getSetColor(tSetID, tColorIndex) {
    let tSetType = this.getSetType(tSetID);
    if (tSetType == 0) {
      return 0;
    }
    let tPaletteID = this.getSetTypePaletteID(tSetType);
    if (tPaletteID == 0) {
      return 0;
    }
    let tColor = this.getPaletteColor(tPaletteID, tColorIndex);
    return tColor;
  }

  getSetColorID(tSetID, tColorIndex) {
    let tSetType = this.getSetType(tSetID);
    if (tSetType == 0) {
      return 0;
    }
    let tPaletteID = this.getSetTypePaletteID(tSetType);
    if (tPaletteID == 0) {
      return 0;
    }
    return this.getPaletteColorID(tPaletteID, tColorIndex);
  }

  getSetType(tSetID) {
    let tSet = this.getSet(tSetID);
    if (tSet == 0) {
      return 0;
    }
    if (voidp(tSet["settype"])) {
      return 0;
    }
    return tSet["settype"];
  }

  getSetPartCount(tSetID) {
    let tParts = this.getSetParts(tSetID);
    if (tParts == 0) {
      return 0;
    }
    return tParts.count;
  }

  getSetPartData(tSetID, tPartIndex) {
    let tParts = this.getSetParts(tSetID);
    if (tParts == 0) {
      return 0;
    }
    if ((tPartIndex < 1) || (tPartIndex > tParts.count)) {
      return 0;
    }
    let tPartData = tParts[tPartIndex];
    let tdata = propList();
    tdata["id"] = tPartData["id"];
    tdata["type"] = tPartData["type"];
    tdata["colorable"] = tPartData["colorable"];
    return tdata;
  }

  getSetHiddenLayers(tSetID) {
    let tSet = this.getSet(tSetID);
    if (tSet == 0) {
      return 0;
    }
    if (ilk(tSet["hiddenlayers"]) != Symbol.for("list")) {
      return 0;
    }
    return tSet["hiddenlayers"].duplicate();
  }

  getSet(tSetID) {
    let tSet = this.pSetList[string(tSetID)];
    if (ilk(tSet) != Symbol.for("propList")) {
      return 0;
    }
    return tSet;
  }

  addSet(tSetID, tSetData) {
    if (this.pSetList.findPos(tSetID)) {
      return error(this, `multiple set elements with id ${tSetID} in figure XML!`, Symbol.for("addSet"), Symbol.for("major"));
    }
    this.pSetList[tSetID] = tSetData;
    return 1;
  }

  getSetTypePaletteID(tSetType) {
    tSetType = this.pSetTypeList[string(tSetType)];
    if (ilk(tSetType) != Symbol.for("propList")) {
      return 0;
    }
    if (voidp(tSetType["paletteid"])) {
      return 0;
    }
    return tSetType["paletteid"];
  }

  getSetParts(tSetID) {
    let tSet = this.getSet(tSetID);
    if (tSet == 0) {
      return 0;
    }
    if (voidp(tSet["parts"])) {
      return 0;
    }
    return tSet["parts"];
  }

  parseColors(tElementColors) {
    for (let i = 1; i <= tElementColors.child.count; i++) {
      let tElement = tElementColors.child[i];
      if (tElement.name == "palette") {
        let tID = VOID;
        for (let j = 1; j <= tElement.attributeName.count; j++) {
          if (tElement.attributeName[j] == "id") {
            tID = tElement.attributeValue[j];
          }
        }
        if (voidp(tID)) {
          return error(this, "missing id attribute for palette element in figure XML!", Symbol.for("parseColors"), Symbol.for("major"));
        }
        let tColorList = propList();
        for (let j = 1; j <= tElement.child.count; j++) {
          let tElementColor = tElement.child[j];
          if (tElementColor.name == "color") {
            let tColorId = VOID;
            for (let k = 1; k <= tElementColor.attributeName.count; k++) {
              if (tElementColor.attributeName[k] == "id") {
                tColorId = tElementColor.attributeValue[k];
              }
            }
            if (voidp(tColorId)) {
              return error(this, `missing id attribute for color element in palette element with id ${tID} in figure XML!`, Symbol.for("parseColors"), Symbol.for("major"));
            }
            if (tColorList.findPos(tColorId)) {
              return error(this, `multiple color elements with id ${tColorId} in palette element with id ${tID} in figure XML!`, Symbol.for("parseSets"), Symbol.for("major"));
            }
            if (tElementColor.child.count == 1) {
              let tColorValue = tElementColor.child[1].text;
            }
            if (voidp(tColorValue)) {
              return error(this, `missing color data for color element with id ${tColorId} in palette element with id ${tID} in figure XML!`, Symbol.for("parseColors"), Symbol.for("major"));
            }
            tColorList.addProp(tColorId, tColorValue);
            if (this.pColorList.findPos(tColorId)) {
              return error(this, `multiple color elements with id ${tColorId} in figure XML!`, Symbol.for("parseColors"), Symbol.for("major"));
            }
            this.pColorList.addProp(tColorId, tColorValue);
          }
        }
        if (this.pPaletteList.findPos(tID)) {
          return error(this, `multiple palette elements with id ${tID} in figure XML!`, Symbol.for("parseColors"), Symbol.for("major"));
        }
        this.pPaletteList.addProp(tID, tColorList);
      }
    }
    return 1;
  }

  parseSets(tElementSets) {
    for (let i = 1; i <= tElementSets.child.count; i++) {
      let tElement = tElementSets.child[i];
      if (tElement.name == "settype") {
        let tAttributes = propList("type", VOID, "paletteid", VOID);
        for (let j = 1; j <= tElement.attributeName.count; j++) {
          let tName = tElement.attributeName[j];
          let tValue = tElement.attributeValue[j];
          tAttributes[tName] = tValue;
        }
        if (voidp(tAttributes["type"])) {
          return error(this, "missing type attribute for settype element in figure XML!", Symbol.for("parseSets"), Symbol.for("major"));
        }
        if (voidp(tAttributes["paletteid"])) {
          return error(this, "missing paletteid attribute for settype element in figure XML!", Symbol.for("parseSets"), Symbol.for("major"));
        }
        for (let j = 1; j <= tElement.child.count; j++) {
          let tElementSet = tElement.child[j];
          if (tElementSet.name == "set") {
            if (this.parseSet(tElementSet, tAttributes["type"]) == 0) {
              return 0;
            }
          }
        }
        if (this.pSetTypeList.findPos(tAttributes["type"])) {
          return error(this, `multiple settype elements with type ${tAttributes["type"]} in figure XML!`, Symbol.for("parseSets"), Symbol.for("major"));
        }
        let tSetTypeData = propList("paletteid", tAttributes["paletteid"]);
        this.pSetTypeList.addProp(tAttributes["type"], tSetTypeData);
      }
    }
    return 1;
  }

  parseSet(tElementSet, tSetType) {
    let tAttributes = propList("id", VOID, "colorable", VOID);
    for (let j = 1; j <= tElementSet.attributeName.count; j++) {
      let tName = tElementSet.attributeName[j];
      let tValue = tElementSet.attributeValue[j];
      tAttributes[tName] = tValue;
    }
    if (voidp(tAttributes["id"])) {
      return error(this, "missing id attribute for set element in figure XML!", Symbol.for("parseSet"), Symbol.for("major"));
    }
    if (voidp(tAttributes["colorable"])) {
      return error(this, "missing colorable attribute for set element in figure XML!", Symbol.for("parseSet"), Symbol.for("major"));
    }
    let tPartData = list();
    let tHiddenLayers = list();
    for (let i = 1; i <= tElementSet.child.count; i++) {
      let tElement = tElementSet.child[i];
      if (tElement.name == "part") {
        let tAttributesPart = propList("id", VOID, "type", VOID, "colorable", VOID);
        for (let j = 1; j <= tElement.attributeName.count; j++) {
          let tName = tElement.attributeName[j];
          let tValue = tElement.attributeValue[j];
          tAttributesPart[tName] = tValue;
        }
        if (voidp(tAttributesPart["id"])) {
          return error(this, "missing id attribute for part element in figure XML!", Symbol.for("parseSet"), Symbol.for("major"));
        }
        if (voidp(tAttributesPart["type"])) {
          return error(this, "missing type attribute for part element in figure XML!", Symbol.for("parseSet"), Symbol.for("major"));
        }
        if (voidp(tAttributesPart["colorable"])) {
          return error(this, "missing colorable attribute for part element in figure XML!", Symbol.for("parseSet"), Symbol.for("major"));
        }
        let tColorable = value(tAttributes["colorable"]) && value(tAttributesPart["colorable"]);
        let tdata = propList("id", tAttributesPart["id"], "type", tAttributesPart["type"], "colorable", tColorable);
        tPartData.add(tdata);
        continue;
      }
      if (tElement.name == "hiddenlayers") {
        for (let j = 1; j <= tElement.child.count; j++) {
          let tElementLayer = tElement.child[j];
          if (tElementLayer.name == "layer") {
            let tPartType = VOID;
            for (let k = 1; k <= tElementLayer.attributeName.count; k++) {
              if (tElementLayer.attributeName[k] == "parttype") {
                tPartType = tElementLayer.attributeValue[k];
              }
            }
            if (voidp(tPartType)) {
              return error(this, `missing parttype attribute for layer element in hiddenlayers element in set element with id ${tAttributes["id"]} in figure XML!`, Symbol.for("parseColors"), Symbol.for("major"));
            }
            tHiddenLayers.add(tPartType);
          }
        }
      }
    }
    let tSetData = propList("settype", tSetType, "parts", tPartData, "hiddenlayers", tHiddenLayers);
    return this.addSet(tAttributes["id"], tSetData);
    return 1;
  }
}
