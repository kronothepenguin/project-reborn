export default class {
  pCache;

  construct() {
    this.pCache = propList();
    return 1;
  }

  parse(tFieldName) {
    if (memberExists(tFieldName)) {
      let tdata;
      if (listp(this.pCache[tFieldName])) {
        tdata = this.pCache[tFieldName];
      } else {
        if (tFieldName.contains(".window")) {
          tdata = this.parse_window(tFieldName);
          this.pCache[tFieldName] = tdata;
        } else {
          if (tFieldName.contains(".element")) {
            tdata = this.parse_element(tFieldName);
            this.pCache[tFieldName] = tdata;
          } else {
            if (tFieldName.contains(".room")) {
              tdata = this.parse_visual(tFieldName);
            } else {
              if (tFieldName.contains(".visual")) {
                tdata = this.parse_visual(tFieldName);
                this.pCache[tFieldName] = tdata;
              }
            }
          }
        }
      }
    } else {
      return error(this, `Member not found: ${tFieldName}`, Symbol.for("parse"), Symbol.for("major"));
    }
    return tdata.duplicate();
  }

  parse_window(tFieldName) {
    const tdata = member(getResourceManager().getmemnum(tFieldName)).text;
    const tSupportedTags = propList("elements", propList("open", "<elements>", "close", "</elements>"), "rect", propList("open", "<rect>", "close", "</rect>"), "border", propList("open", "<border>", "close", "</border>"), "clientrect", propList("open", "<clientrect>", "close", "</clientrect>"));
    const tLayDefinition = propList();
    let tTag = EMPTY;
    for (let x = 1; x <= tSupportedTags.count; x++) {
      const tOpen = tSupportedTags[x].open;
      const tClose = tSupportedTags[x].close;
      tTag = tSupportedTags.getPropAt(x);
      const tList = list();
      for (let i = 1; i <= tdata.line.count; i++) {
        if (tdata.line[i].word[1] == tOpen) {
          for (let i = i + 1; i <= tdata.line.count; i++) {
            const tLine = tdata.line[i];
            if (tLine.word[1] == tClose) {
              break;
            }
            tList.add(value(tLine));
          }
        }
      }
      tLayDefinition[tTag] = tList;
    }
    const tElements = propList();
    for (const tElem of tLayDefinition[Symbol.for("elements")]) {
      let tSymbol;
      if (voidp(tElem[Symbol.for("id")])) {
        tSymbol = "null";
      } else {
        tSymbol = tElem.id;
      }
      if (voidp(tElements[tSymbol])) {
        tElements[tSymbol] = list();
      }
      tElements[tSymbol].add(tElem);
    }
    const tResMngr = getResourceManager();
    for (const tElem of tLayDefinition[Symbol.for("elements")]) {
      if (stringp(tElem[Symbol.for("txtColor")])) {
        tElem[Symbol.for("txtColor")] = rgb(tElem[Symbol.for("txtColor")]);
      }
      if (stringp(tElem[Symbol.for("txtBgColor")])) {
        tElem[Symbol.for("txtBgColor")] = rgb(tElem[Symbol.for("txtBgColor")]);
      }
      if (voidp(tElem[Symbol.for("color")])) {
        tElem[Symbol.for("color")] = "#000000";
      }
      if (voidp(tElem[Symbol.for("bgColor")])) {
        tElem[Symbol.for("bgColor")] = "#FFFFFF";
      }
      tElem[Symbol.for("color")] = rgb(tElem[Symbol.for("color")]);
      tElem[Symbol.for("bgColor")] = rgb(tElem[Symbol.for("bgColor")]);
      const tPalette = tElem[Symbol.for("palette")];
      if (stringp(tPalette)) {
        if (!tResMngr.exists(`${tPalette}Duplicate`)) {
          const tPalMemNum = tResMngr.getmemnum(tPalette);
          if (tPalMemNum > 0) {
            member(tPalMemNum).duplicate(tResMngr.createMember(`${tPalette}Duplicate`, Symbol.for("palette")));
          } else {
            tResMngr.createMember(`${tPalette}Duplicate`, Symbol.for("palette"));
            error(this, `Palette member missing: ${tPalette}`, Symbol.for("parse_window"), Symbol.for("minor"));
          }
        }
        tElem[Symbol.for("palette")] = `${tPalette}Duplicate`;
      }
      if (tElem[Symbol.for("type")] == "text") {
        const tFontStruct = getStructVariable("struct.font.plain");
        if (voidp(tElem[Symbol.for("wordWrap")])) {
          tElem[Symbol.for("wordWrap")] = 1;
        }
        if (voidp(tElem[Symbol.for("alignment")])) {
          tElem[Symbol.for("alignment")] = Symbol.for("left");
        }
        if (voidp(tElem[Symbol.for("font")])) {
          tElem[Symbol.for("font")] = tFontStruct.getaProp(Symbol.for("font"));
        }
        if (voidp(tElem[Symbol.for("fontSize")])) {
          tElem[Symbol.for("fontSize")] = tFontStruct.getaProp(Symbol.for("fontSize"));
        }
        if (voidp(tElem[Symbol.for("fontStyle")])) {
          tElem[Symbol.for("fontStyle")] = tFontStruct.getaProp(Symbol.for("fontStyle"));
        }
        if (voidp(tElem[Symbol.for("txtColor")])) {
          tElem[Symbol.for("txtColor")] = tFontStruct.getaProp(Symbol.for("color"));
        }
        if (voidp(tElem[Symbol.for("txtBgColor")])) {
          tElem[Symbol.for("txtBgColor")] = rgb(255, 255, 255);
        }
        if (voidp(tElem[Symbol.for("fixedLineSpace")])) {
          tElem[Symbol.for("fixedLineSpace")] = tElem[Symbol.for("fontSize")];
        }
      }
      if (!voidp(tElem[Symbol.for("strech")])) {
        tElem[Symbol.for("scaleH")] = Symbol.for("fixed");
        tElem[Symbol.for("scaleV")] = Symbol.for("fixed");
        switch (tElem[Symbol.for("strech")]) {
          case Symbol.for("moveH"):
            tElem[Symbol.for("scaleH")] = Symbol.for("move");
            break;
          case Symbol.for("moveV"):
            tElem[Symbol.for("scaleV")] = Symbol.for("move");
            break;
          case Symbol.for("strechH"):
            tElem[Symbol.for("scaleH")] = Symbol.for("scale");
            break;
          case Symbol.for("strechV"):
            tElem[Symbol.for("scaleV")] = Symbol.for("scale");
            break;
          case Symbol.for("centerH"):
            tElem[Symbol.for("scaleH")] = Symbol.for("center");
            break;
          case Symbol.for("centerV"):
            tElem[Symbol.for("scaleV")] = Symbol.for("center");
            break;
          case Symbol.for("moveHV"):
            tElem[Symbol.for("scaleH")] = Symbol.for("move");
            tElem[Symbol.for("scaleV")] = Symbol.for("move");
            break;
          case Symbol.for("strechHV"):
            tElem[Symbol.for("scaleH")] = Symbol.for("scale");
            tElem[Symbol.for("scaleV")] = Symbol.for("scale");
            break;
          case Symbol.for("centerHV"):
            tElem[Symbol.for("scaleH")] = Symbol.for("center");
            tElem[Symbol.for("scaleV")] = Symbol.for("center");
            break;
          case Symbol.for("moveHstrechV"):
            tElem[Symbol.for("scaleH")] = Symbol.for("move");
            tElem[Symbol.for("scaleV")] = Symbol.for("scale");
            break;
          case Symbol.for("moveVstrechH"):
            tElem[Symbol.for("scaleH")] = Symbol.for("scale");
            tElem[Symbol.for("scaleV")] = Symbol.for("move");
            break;
          case Symbol.for("moveHcenterV"):
            tElem[Symbol.for("scaleH")] = Symbol.for("move");
            tElem[Symbol.for("scaleV")] = Symbol.for("center");
            break;
          case Symbol.for("moveVcenterH"):
            tElem[Symbol.for("scaleH")] = Symbol.for("center");
            tElem[Symbol.for("scaleV")] = Symbol.for("move");
            break;
        }
        tElem.deleteProp(Symbol.for("strech"));
      }
    }
    if (tLayDefinition[Symbol.for("rect")].count == 0) {
      const tRect = rect(10000, 10000, -10000, -10000);
      for (const tElement of tElements) {
        for (const tItem of tElement) {
          if (tItem.locH < tRect[1]) {
            tRect[1] = tItem.locH;
          }
          if (tItem.locV < tRect[2]) {
            tRect[2] = tItem.locV;
          }
          if ((tItem.locH + tItem.width) > tRect[3]) {
            tRect[3] = tItem.locH + tItem.width;
          }
          if ((tItem.locV + tItem.height) > tRect[4]) {
            tRect[4] = tItem.locV + tItem.height;
          }
        }
      }
      tLayDefinition[Symbol.for("rect")].add(tRect);
      for (const tElement of tElements) {
        for (const tItem of tElement) {
          tItem.locH = tItem.locH - tRect[1];
          tItem.locV = tItem.locV - tRect[2];
        }
      }
    } else {
      const tList = tLayDefinition[Symbol.for("rect")][1];
      tLayDefinition[Symbol.for("rect")][1] = rect(tList[1], tList[2], tList[3], tList[4]);
    }
    const tOffX = tLayDefinition[Symbol.for("rect")][1][1];
    const tOffY = tLayDefinition[Symbol.for("rect")][1][2];
    tLayDefinition[Symbol.for("rect")][1] = tLayDefinition[Symbol.for("rect")][1] - list(tOffX, tOffY, tOffX, tOffY);
    if (tLayDefinition[Symbol.for("border")].count == 0) {
      if (tLayDefinition[Symbol.for("clientrect")].count > 0) {
        const tClientRect = tLayDefinition[Symbol.for("clientrect")][1];
        const tWinWidth = tLayDefinition[Symbol.for("rect")][1][3];
        const tWinHeight = tLayDefinition[Symbol.for("rect")][1][4];
        const tBorder = list(tClientRect[1], tClientRect[2], tWinWidth - tClientRect[3], tWinHeight - tClientRect[4]);
        tLayDefinition[Symbol.for("border")].add(tBorder);
      } else {
        tLayDefinition[Symbol.for("border")].add(list(0, 0, 0, 0));
      }
    }
    tLayDefinition[Symbol.for("elements")] = tElements;
    return tLayDefinition;
  }

  parse_element(tFieldName) {
    const tProps = propList();
    const tdata = member(getResourceManager().getmemnum(tFieldName)).text;
    for (let f = 1; f <= tdata.line.count; f++) {
      const tLine = tdata.line[f];
      if (tLine.char[1] != "#") {
        if (length(tLine) > 1) {
          const tValue = value(tLine);
          tProps.addProp(tValue[Symbol.for("state")], tValue);
        }
      }
    }
    return tProps;
  }

  parse_visual(tFieldName) {
    const tdata = member(getResourceManager().getmemnum(tFieldName)).text;
    const tSupportedTags = propList("roomdata", propList("open", "<roomdata>", "close", "</roomdata>"), "rect", propList("open", "<rect>", "close", "</rect>"), "version", propList("open", "<version>", "close", "</version>"), "elements", propList("open", "<elements>", "close", "</elements>"));
    const tLayDefinition = propList();
    let tTag = EMPTY;
    for (let x = 1; x <= tSupportedTags.count; x++) {
      const tOpen = tSupportedTags[x].open;
      const tClose = tSupportedTags[x].close;
      tTag = tSupportedTags.getPropAt(x);
      const tList = list();
      for (let i = 1; i <= tdata.line.count; i++) {
        if (tdata.line[i].word[1] == tOpen) {
          for (let i = i + 1; i <= tdata.line.count; i++) {
            if (tdata.line[i].word[1] == tClose) {
              break;
            }
            if (!voidp(value(tdata.line[i]))) {
              tList.add(value(tdata.line[i]));
            }
          }
        }
      }
      if (tList.count > 0) {
        tLayDefinition[tTag] = tList;
      }
    }
    if (voidp(tLayDefinition[Symbol.for("version")])) {
      error(this, `Old visualizer definition: ${tFieldName}`, Symbol.for("parse_room"), Symbol.for("minor"));
      for (const tElem of tLayDefinition[Symbol.for("elements")]) {
        if ((tElem[Symbol.for("media")] == Symbol.for("field")) || (tElem[Symbol.for("media")] == Symbol.for("text"))) {
          tElem[Symbol.for("txtColor")] = tElem[Symbol.for("color")];
          tElem[Symbol.for("txtBgColor")] = tElem[Symbol.for("bgColor")];
          tElem[Symbol.for("color")] = "#000000";
          tElem[Symbol.for("bgColor")] = "#FFFFFF";
        }
        tElem.deleteProp(Symbol.for("foreColor"));
        tElem.deleteProp(Symbol.for("backColor"));
      }
    }
    for (const tElem of tLayDefinition[Symbol.for("elements")]) {
      if (voidp(tElem[Symbol.for("color")])) {
        tElem[Symbol.for("color")] = "#000000";
      }
      if (voidp(tElem[Symbol.for("bgColor")])) {
        tElem[Symbol.for("bgColor")] = "#FFFFFF";
      }
      if (tElem[Symbol.for("type")] == "button") {
        tElem[Symbol.for("Active")] = 1;
      }
    }
    return propList("name", tLayDefinition[Symbol.for("name")], "roomdata", tLayDefinition[Symbol.for("roomdata")], "rect", tLayDefinition[Symbol.for("rect")], "elements", tLayDefinition[Symbol.for("elements")]);
  }
}
