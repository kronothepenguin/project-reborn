export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handle_purchase_ok(tMsg) {
    this.getComponent().purchaseReady("OK");
  }

  handle_purchase_error(tMsg) {
    this.getComponent().purchaseReady("ERROR", tMsg.getaProp(Symbol.for("content")));
  }

  handle_purchase_nobalance(tMsg) {
    this.getComponent().purchaseReady("NOBALANCE", tMsg.getaProp(Symbol.for("content")));
  }

  handle_catalogindex(tMsg) {
    let tCount = tMsg.content.line.count;
    let tDelim = the.itemDelimiter;
    let tList = propList();
    the.itemDelimiter = TAB;
    for (let tLineNum = 1; tLineNum <= tCount; tLineNum++) {
      let tLine = tMsg.content.line[tLineNum];
      if (tLine.char.count > 3) {
        let tProp = tLine.item[1];
        let tdata = tLine.item[`${2}..${tLine.item.count}`];
        tList[tProp] = tdata;
      }
    }
    the.itemDelimiter = tDelim;
    this.getComponent().saveCatalogueIndex(tList);
  }

  handle_catalogpage(tMsg) {
    let tCount = tMsg.content.line.count;
    let tDelim = the.itemDelimiter;
    let tList = propList();
    let tProductList = list();
    let tTextList = propList();
    tTextList.sort();
    let tDealNumber = 1;
    for (let tLineNum = 1; tLineNum <= tCount; tLineNum++) {
      the.itemDelimiter = ":";
      let tLine = tMsg.content.line[tLineNum];
      let tProp = tLine.char[1];
      let tNum = integer(tLine.item[1].char[`${2}..${tLine.item[1].length}`]);
      let tdata = tLine.item[`${2}..${tLine.item.count}`];
      switch (tProp) {
        case "i":
          tList["id"] = tdata;
          break;
        case "n":
          tList["pageName"] = tdata;
          break;
        case "l":
          tList["layout"] = tdata;
          break;
        case "h":
          tList["headerText"] = replaceChunks(tdata, "<br>", RETURN);
          break;
        case "g":
          tList["headerImage"] = tdata;
          break;
        case "w":
          tList["teaserText"] = replaceChunks(tdata, "<br>", RETURN);
          break;
        case "e":
          {
            the.itemDelimiter = ",";
            let tTempList = list();
            for (let f = 1; f <= tdata.item.count; f++) {
              if (tdata.item[f].length > 0) {
                tTempList.add(tdata.item[f]);
              }
            }
            if (tTempList.count > 0) {
              tList["teaserImgList"] = tTempList;
            }
            break;
          }
        case "s":
          tList["teaserSpecialText"] = replaceChunks(tdata, "<br>", RETURN);
          break;
        case "t":
          if (!voidp(tNum)) {
            tTextList.addProp(tNum, replaceChunks(tdata, "<br>", RETURN));
          }
          break;
        case "u":
          {
            the.itemDelimiter = ",";
            let tTempList = list();
            for (let f = 1; f <= tdata.item.count; f++) {
              tTempList.add(tdata.item[f]);
            }
            tList["linkList"] = tTempList;
            break;
          }
        case "p":
          the.itemDelimiter = TAB;
          let tTemp = propList();
          tTemp["name"] = tdata.item[1];
          tTemp["description"] = tdata.item[2];
          tTemp["price"] = tdata.item[3];
          tTemp["specialText"] = tdata.item[4];
          tTemp["objectType"] = tdata.item[5];
          tTemp["class"] = tdata.item[6];
          tTemp["direction"] = tdata.item[7];
          tTemp["dimensions"] = tdata.item[8];
          tTemp["purchaseCode"] = tdata.item[9];
          tTemp["partColors"] = tdata.item[10];
          if (tdata.item.count > 10) {
            let tItemCount = tdata.item[11];
            if (tdata.item.count >= (11 + (tItemCount * 3))) {
              let tDealList = list();
              let tDealItem = propList();
              for (let i = 0; i <= tItemCount - 1; i++) {
                tDealItem["class"] = tdata.item[11 + (i * 3) + 1];
                tDealItem["count"] = tdata.item[11 + (i * 3) + 2];
                tDealItem["partColors"] = tdata.item[11 + (i * 3) + 3];
                tDealList[i + 1] = tDealItem.duplicate();
              }
              tTemp["dealList"] = tDealList;
              if (tDealList.count > 1) {
                tTemp["dealNumber"] = tDealNumber;
                tDealNumber = tDealNumber + 1;
              } else {
                tTemp["dealNumber"] = 0;
              }
            }
          }
          tProductList.add(tTemp);
          break;
      }
    }
    let tTempTextList = list();
    for (const tText of tTextList) {
      tTempTextList.add(tText);
    }
    tList["textList"] = tTempTextList;
    tList["productList"] = tProductList;
    the.itemDelimiter = tDelim;
    this.getComponent().saveCataloguePage(tList);
  }

  handle_purchasenotallowed(tMsg) {
    if (voidp(tMsg.connection)) {
      return 0;
    }
    let tCode = tMsg.connection.GetIntFrom(tMsg);
    switch (tCode) {
      case 0:
      case 1:
        return executeMessage(Symbol.for("alert"), propList("Msg", "catalog_purchase_not_allowed_hc", "modal", 1));
    }
    return 0;
  }

  handle_purse(tMsg) {
    let tPlaySnd = getObject(Symbol.for("session")).exists("user_walletbalance");
    let tCredits = integer(getLocalFloat(tMsg.content.word[1]));
    getObject(Symbol.for("session")).set("user_walletbalance", tCredits);
    this.getInterface().updatePurseSaldo();
    executeMessage(Symbol.for("updateCreditCount"), tCredits);
    if (tPlaySnd) {
      playSound("naw_snd_cash_cat", Symbol.for("cut"), propList("loopCount", 1, "infiniteloop", 0, "volume", 255));
    }
    return 1;
  }

  regMsgList(tBool) {
    let tMsgs = propList();
    tMsgs.setaProp(6, Symbol.for("handle_purse"));
    tMsgs.setaProp(67, Symbol.for("handle_purchase_ok"));
    tMsgs.setaProp(65, Symbol.for("handle_purchase_error"));
    tMsgs.setaProp(68, Symbol.for("handle_purchase_nobalance"));
    tMsgs.setaProp(126, Symbol.for("handle_catalogindex"));
    tMsgs.setaProp(127, Symbol.for("handle_catalogpage"));
    tMsgs.setaProp(296, Symbol.for("handle_purchasenotallowed"));
    let tCmds = propList();
    tCmds.setaProp("GPRC", 100);
    tCmds.setaProp("GCIX", 101);
    tCmds.setaProp("GCAP", 102);
    if (tBool) {
      registerListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
