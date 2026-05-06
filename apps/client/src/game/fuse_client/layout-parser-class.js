import {
  charOf,
  EMPTY,
  length,
  lineOf,
  list,
  listp,
  member,
  propList,
  rect,
  rgb,
  stringp,
  value,
  voidp,
  wordOf,
} from "../../director";

export default function () {
  let tdata, tSupportedTags, tLayDefinition, tOpenTagFlag, tTag, tOpen, tClose, tList, tElements, tResMngr, tElem, tSymbol, tPalette, tPalMemNum, tFontStruct, tRect, tElement, tItem, tOffX, tOffY, tProps, tLine, tValue, tClientRect, tWinWidth, tWinHeight, tBorder, tResult, f, i, x;

  return {
    pCache: VOID,

    construct() {
      this.pCache = propList();
      return 1;
    },

    parse(tFieldName) {
      if (_director.memberExists(tFieldName)) {
        if (listp(this.pCache[tFieldName])) {
          tdata = this.pCache[tFieldName];
        } else {
          if (tFieldName.includes(".window")) {
            tdata = this.parse_window(tFieldName);
            this.pCache[tFieldName] = tdata;
          } else {
            if (tFieldName.includes(".element")) {
              tdata = this.parse_element(tFieldName);
              this.pCache[tFieldName] = tdata;
            } else {
              if (tFieldName.includes(".room")) {
                tdata = this.parse_visual(tFieldName);
              } else {
                if (tFieldName.includes(".visual")) {
                  tdata = this.parse_visual(tFieldName);
                  this.pCache[tFieldName] = tdata;
                }
              }
            }
          }
        }
      } else {
        return _director.error(this, "Member not found: " + tFieldName, Symbol.for("parse"), Symbol.for("major"));
      }
      return tdata.duplicate();
    },

    parse_window(tFieldName) {
      tdata = member(_director.getResourceManager().getmemnum(tFieldName)).text;
      tSupportedTags = propList();
      tSupportedTags.setaProp(Symbol.for("elements"), propList());
      tSupportedTags.getaProp(Symbol.for("elements")).setaProp(Symbol.for("open"), "<elements>");
      tSupportedTags.getaProp(Symbol.for("elements")).setaProp(Symbol.for("close"), "</elements>");
      tSupportedTags.setaProp(Symbol.for("rect"), propList());
      tSupportedTags.getaProp(Symbol.for("rect")).setaProp(Symbol.for("open"), "<rect>");
      tSupportedTags.getaProp(Symbol.for("rect")).setaProp(Symbol.for("close"), "</rect>");
      tSupportedTags.setaProp(Symbol.for("border"), propList());
      tSupportedTags.getaProp(Symbol.for("border")).setaProp(Symbol.for("open"), "<border>");
      tSupportedTags.getaProp(Symbol.for("border")).setaProp(Symbol.for("close"), "</border>");
      tSupportedTags.setaProp(Symbol.for("clientrect"), propList());
      tSupportedTags.getaProp(Symbol.for("clientrect")).setaProp(Symbol.for("open"), "<clientrect>");
      tSupportedTags.getaProp(Symbol.for("clientrect")).setaProp(Symbol.for("close"), "</clientrect>");
      tLayDefinition = propList();
      tOpenTagFlag = 0;
      tTag = EMPTY;
      for (x = 1; x <= tSupportedTags.count; x++) {
        tOpen = tSupportedTags[x].getaProp(Symbol.for("open"));
        tClose = tSupportedTags[x].getaProp(Symbol.for("close"));
        tTag = tSupportedTags.getPropAt(x);
        tList = list();
        for (i = 1; i <= lineOf(tdata).count; i++) {
          if (wordOf(lineOf(tdata)[i])[1] === tOpen) {
            for (i = i + 1; i <= lineOf(tdata).count; i++) {
              tLine = lineOf(tdata)[i];
              if (wordOf(tLine)[1] === tClose) {
                break;
              }
              tList.add(value(tLine));
            }
          }
        }
        tLayDefinition[tTag] = tList;
      }
      tElements = propList();
      for (tElem of tLayDefinition[Symbol.for("elements")]) {
        if (voidp(tElem[Symbol.for("id")])) {
          tSymbol = "null";
        } else {
          tSymbol = tElem.getaProp(Symbol.for("id"));
        }
        if (voidp(tElements[tSymbol])) {
          tElements[tSymbol] = list();
        }
        tElements[tSymbol].add(tElem);
      }
      tResMngr = _director.getResourceManager();
      for (tElem of tLayDefinition[Symbol.for("elements")]) {
        if (stringp(tElem[Symbol.for("txtColor")])) {
          tElem.setaProp(Symbol.for("txtColor"), rgb(tElem[Symbol.for("txtColor")]));
        }
        if (stringp(tElem[Symbol.for("txtBgColor")])) {
          tElem.setaProp(Symbol.for("txtBgColor"), rgb(tElem[Symbol.for("txtBgColor")]));
        }
        if (voidp(tElem[Symbol.for("color")])) {
          tElem.setaProp(Symbol.for("color"), "#000000");
        }
        if (voidp(tElem[Symbol.for("bgColor")])) {
          tElem.setaProp(Symbol.for("bgColor"), "#FFFFFF");
        }
        tElem.setaProp(Symbol.for("color"), rgb(tElem[Symbol.for("color")]));
        tElem.setaProp(Symbol.for("bgColor"), rgb(tElem[Symbol.for("bgColor")]));
        tPalette = tElem[Symbol.for("palette")];
        if (stringp(tPalette)) {
          if (!tResMngr.exists(tPalette + " Duplicate")) {
            tPalMemNum = tResMngr.getmemnum(tPalette);
            if (tPalMemNum > 0) {
              member(tPalMemNum).duplicate(tResMngr.createMember(tPalette + " Duplicate", Symbol.for("palette")));
            } else {
              tResMngr.createMember(tPalette + " Duplicate", Symbol.for("palette"));
              _director.error(this, "Palette member missing: " + tPalette, Symbol.for("parse_window"), Symbol.for("minor"));
            }
          }
          tElem.setaProp(Symbol.for("palette"), tPalette + " Duplicate");
        }
        if (tElem[Symbol.for("type")] === "text") {
          tFontStruct = _director.getStructVariable("struct.font.plain");
          if (voidp(tElem[Symbol.for("wordWrap")])) {
            tElem.setaProp(Symbol.for("wordWrap"), 1);
          }
          if (voidp(tElem[Symbol.for("alignment")])) {
            tElem.setaProp(Symbol.for("alignment"), Symbol.for("left"));
          }
          if (voidp(tElem[Symbol.for("font")])) {
            tElem.setaProp(Symbol.for("font"), tFontStruct.getaProp(Symbol.for("font")));
          }
          if (voidp(tElem[Symbol.for("fontSize")])) {
            tElem.setaProp(Symbol.for("fontSize"), tFontStruct.getaProp(Symbol.for("fontSize")));
          }
          if (voidp(tElem[Symbol.for("fontStyle")])) {
            tElem.setaProp(Symbol.for("fontStyle"), tFontStruct.getaProp(Symbol.for("fontStyle")));
          }
          if (voidp(tElem[Symbol.for("txtColor")])) {
            tElem.setaProp(Symbol.for("txtColor"), tFontStruct.getaProp(Symbol.for("color")));
          }
          if (voidp(tElem[Symbol.for("txtBgColor")])) {
            tElem.setaProp(Symbol.for("txtBgColor"), rgb(255, 255, 255));
          }
          if (voidp(tElem[Symbol.for("fixedLineSpace")])) {
            tElem.setaProp(Symbol.for("fixedLineSpace"), tElem[Symbol.for("fontSize")]);
          }
        }
        if (!voidp(tElem[Symbol.for("strech")])) {
          tElem.setaProp(Symbol.for("scaleH"), Symbol.for("fixed"));
          tElem.setaProp(Symbol.for("scaleV"), Symbol.for("fixed"));
          switch (tElem[Symbol.for("strech")]) {
            case Symbol.for("moveH"):
              tElem.setaProp(Symbol.for("scaleH"), Symbol.for("move"));
              break;
            case Symbol.for("moveV"):
              tElem.setaProp(Symbol.for("scaleV"), Symbol.for("move"));
              break;
            case Symbol.for("strechH"):
              tElem.setaProp(Symbol.for("scaleH"), Symbol.for("scale"));
              break;
            case Symbol.for("strechV"):
              tElem.setaProp(Symbol.for("scaleV"), Symbol.for("scale"));
              break;
            case Symbol.for("centerH"):
              tElem.setaProp(Symbol.for("scaleH"), Symbol.for("center"));
              break;
            case Symbol.for("centerV"):
              tElem.setaProp(Symbol.for("scaleV"), Symbol.for("center"));
              break;
            case Symbol.for("moveHV"):
              tElem.setaProp(Symbol.for("scaleH"), Symbol.for("move"));
              tElem.setaProp(Symbol.for("scaleV"), Symbol.for("move"));
              break;
            case Symbol.for("strechHV"):
              tElem.setaProp(Symbol.for("scaleH"), Symbol.for("scale"));
              tElem.setaProp(Symbol.for("scaleV"), Symbol.for("scale"));
              break;
            case Symbol.for("centerHV"):
              tElem.setaProp(Symbol.for("scaleH"), Symbol.for("center"));
              tElem.setaProp(Symbol.for("scaleV"), Symbol.for("center"));
              break;
            case Symbol.for("moveHstrechV"):
              tElem.setaProp(Symbol.for("scaleH"), Symbol.for("move"));
              tElem.setaProp(Symbol.for("scaleV"), Symbol.for("scale"));
              break;
            case Symbol.for("moveVstrechH"):
              tElem.setaProp(Symbol.for("scaleH"), Symbol.for("scale"));
              tElem.setaProp(Symbol.for("scaleV"), Symbol.for("move"));
              break;
            case Symbol.for("moveHcenterV"):
              tElem.setaProp(Symbol.for("scaleH"), Symbol.for("move"));
              tElem.setaProp(Symbol.for("scaleV"), Symbol.for("center"));
              break;
            case Symbol.for("moveVcenterH"):
              tElem.setaProp(Symbol.for("scaleH"), Symbol.for("center"));
              tElem.setaProp(Symbol.for("scaleV"), Symbol.for("move"));
              break;
          }
          tElem.deleteProp(Symbol.for("strech"));
        }
      }
      if (tLayDefinition[Symbol.for("rect")].count === 0) {
        tRect = rect(10000, 10000, -10000, -10000);
        for (tElement of tElements) {
          for (tItem of tElement) {
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
        for (tElement of tElements) {
          for (tItem of tElement) {
            tItem.locH = tItem.locH - tRect[1];
            tItem.locV = tItem.locV - tRect[2];
          }
        }
      } else {
        tList = tLayDefinition[Symbol.for("rect")][1];
        tLayDefinition[Symbol.for("rect")][1] = rect(tList[1], tList[2], tList[3], tList[4]);
      }
      tOffX = tLayDefinition[Symbol.for("rect")][1][1];
      tOffY = tLayDefinition[Symbol.for("rect")][1][2];
      tLayDefinition[Symbol.for("rect")][1] = tLayDefinition[Symbol.for("rect")][1].subtract([tOffX, tOffY, tOffX, tOffY]);
      if (tLayDefinition[Symbol.for("border")].count === 0) {
        if (tLayDefinition[Symbol.for("clientrect")].count > 0) {
          tClientRect = tLayDefinition[Symbol.for("clientrect")][1];
          tWinWidth = tLayDefinition[Symbol.for("rect")][1][3];
          tWinHeight = tLayDefinition[Symbol.for("rect")][1][4];
          tBorder = [tClientRect[1], tClientRect[2], tWinWidth - tClientRect[3], tWinHeight - tClientRect[4]];
          tLayDefinition[Symbol.for("border")].add(tBorder);
        } else {
          tLayDefinition[Symbol.for("border")].add([0, 0, 0, 0]);
        }
      }
      tLayDefinition[Symbol.for("elements")] = tElements;
      return tLayDefinition;
    },

    parse_element(tFieldName) {
      tProps = propList();
      tdata = member(_director.getResourceManager().getmemnum(tFieldName)).text;
      for (f = 1; f <= lineOf(tdata).count; f++) {
        tLine = lineOf(tdata)[f];
        if (charOf(tLine)[1] !== "#") {
          if (length(tLine) > 1) {
            tValue = value(tLine);
            tProps.addProp(tValue[Symbol.for("state")], tValue);
          }
        }
      }
      return tProps;
    },

    parse_visual(tFieldName) {
      tdata = member(_director.getResourceManager().getmemnum(tFieldName)).text;
      tSupportedTags = propList();
      tSupportedTags.setaProp(Symbol.for("roomdata"), propList());
      tSupportedTags.getaProp(Symbol.for("roomdata")).setaProp(Symbol.for("open"), "<roomdata>");
      tSupportedTags.getaProp(Symbol.for("roomdata")).setaProp(Symbol.for("close"), "</roomdata>");
      tSupportedTags.setaProp(Symbol.for("rect"), propList());
      tSupportedTags.getaProp(Symbol.for("rect")).setaProp(Symbol.for("open"), "<rect>");
      tSupportedTags.getaProp(Symbol.for("rect")).setaProp(Symbol.for("close"), "</rect>");
      tSupportedTags.setaProp(Symbol.for("version"), propList());
      tSupportedTags.getaProp(Symbol.for("version")).setaProp(Symbol.for("open"), "<version>");
      tSupportedTags.getaProp(Symbol.for("version")).setaProp(Symbol.for("close"), "</version>");
      tSupportedTags.setaProp(Symbol.for("elements"), propList());
      tSupportedTags.getaProp(Symbol.for("elements")).setaProp(Symbol.for("open"), "<elements>");
      tSupportedTags.getaProp(Symbol.for("elements")).setaProp(Symbol.for("close"), "</elements>");
      tLayDefinition = propList();
      tOpenTagFlag = 0;
      tTag = EMPTY;
      for (x = 1; x <= tSupportedTags.count; x++) {
        tOpen = tSupportedTags[x].getaProp(Symbol.for("open"));
        tClose = tSupportedTags[x].getaProp(Symbol.for("close"));
        tTag = tSupportedTags.getPropAt(x);
        tList = list();
        for (i = 1; i <= lineOf(tdata).count; i++) {
          if (wordOf(lineOf(tdata)[i])[1] === tOpen) {
            for (i = i + 1; i <= lineOf(tdata).count; i++) {
              if (wordOf(lineOf(tdata)[i])[1] === tClose) {
                break;
              }
              if (!voidp(value(lineOf(tdata)[i]))) {
                tList.add(value(lineOf(tdata)[i]));
              }
            }
          }
        }
        if (tList.count > 0) {
          tLayDefinition[tTag] = tList;
        }
      }
      if (voidp(tLayDefinition[Symbol.for("version")])) {
        _director.error(this, "Old visualizer definition: " + tFieldName, Symbol.for("parse_room"), Symbol.for("minor"));
        for (tElem of tLayDefinition[Symbol.for("elements")]) {
          if ((tElem[Symbol.for("media")] === Symbol.for("field")) || (tElem[Symbol.for("media")] === Symbol.for("text"))) {
            tElem.setaProp(Symbol.for("txtColor"), tElem[Symbol.for("color")]);
            tElem.setaProp(Symbol.for("txtBgColor"), tElem[Symbol.for("bgColor")]);
            tElem.setaProp(Symbol.for("color"), "#000000");
            tElem.setaProp(Symbol.for("bgColor"), "#FFFFFF");
          }
          tElem.deleteProp(Symbol.for("foreColor"));
          tElem.deleteProp(Symbol.for("backColor"));
        }
      }
      for (tElem of tLayDefinition[Symbol.for("elements")]) {
        if (voidp(tElem[Symbol.for("color")])) {
          tElem.setaProp(Symbol.for("color"), "#000000");
        }
        if (voidp(tElem[Symbol.for("bgColor")])) {
          tElem.setaProp(Symbol.for("bgColor"), "#FFFFFF");
        }
        if (tElem[Symbol.for("type")] === "button") {
          tElem.setaProp(Symbol.for("Active"), 1);
        }
      }
      tResult = propList();
      tResult.setaProp(Symbol.for("name"), tLayDefinition[Symbol.for("name")]);
      tResult.setaProp(Symbol.for("roomdata"), tLayDefinition[Symbol.for("roomdata")]);
      tResult.setaProp(Symbol.for("rect"), tLayDefinition[Symbol.for("rect")]);
      tResult.setaProp(Symbol.for("elements"), tLayDefinition[Symbol.for("elements")]);
      return tResult;
    },
  };
}
