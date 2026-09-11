export default class {
  pPageData;
  pSmallImg;
  pSelectedOrderNum;
  pSelectedColorNum;
  pSelectedProduct;
  pLastProductNum;
  pNumOfColorBoxies;
  pCurrentProductNum;
  pPetTemplateObj;
  pPetRacesList;
  pNameCheckPending;
  pDefinitions;

  construct() {
    let tCataloguePage = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tCataloguePage) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("construct"), Symbol.for("major"));
    }
    let tPetClass = value(readValueFromField("fuse.object.classes", RETURN, "pet"));
    this.pPetTemplateObj = createObject(Symbol.for("temp"), tPetClass);
    this.pPageData = propList();
    this.pPetRacesList = propList();
    let tPetDEfText = member(getmemnum("pet.definitions")).text;
    tPetDEfText = replaceChunks(tPetDEfText, RETURN, EMPTY);
    this.pPetDefinitions = value(tPetDEfText);
    if (ilk(this.pPetDefinitions) != Symbol.for("propList")) {
      this.pPetDefinitions = propList();
      error(this, "Pet definitions has invalid data!", this.getID(), Symbol.for("construct"), Symbol.for("major"));
    }
    let i = 0;
    while (1) {
      let tRaceDefExists = this.pPetDefinitions.getaProp(string(i)) != VOID;
      let tRaceTextExists = textExists(`${"pet_race_"}${i}${`_000`}`);
      if (tRaceDefExists && tRaceTextExists) {
        let tPetType = string(i);
        let tTempRaces = list();
        tTempRaces.add("000");
        let f = 1;
        while (1) {
          let tTemp;
          if (string(f).length == 1) {
            tTemp = `${"00"}${f}`;
          } else if (string(f).length == 2) {
            tTemp = `${"0"}${f}`;
          } else {
            tTemp = string(f);
          }
          if (textExists(`${"pet_race_"}${i}${`_`}${tTemp}`)) {
            tTempRaces.add(tTemp);
          } else {
            let tColorList = list();
            let tPetColorId = this.pPetDefinitions[tPetType][Symbol.for("colorid")];
            if (memberExists(`${"petColors_"}${tPetColorId}`)) {
              let tColorTxt = member(getmemnum(`${"petColors_"}${tPetColorId}`)).text;
              for (let tLine = 1; tLine <= tColorTxt.line.count; tLine++) {
                if (tColorTxt.line[tLine].length == 7) {
                  tColorList.add(tColorTxt.line[tLine].char[`${2}..${7}`]);
                }
              }
            } else {
              error(this, "Couldn't find pet colors member!" && tPetColorId, Symbol.for("construct"), Symbol.for("major"));
              return 0;
            }
            this.pPetRacesList[tPetType] = propList("races", tTempRaces, "colors", tColorList);
            break;
          }
          f = f + 1;
        }
      } else {
        break;
      }
      i = i + 1;
    }
    this.regMsgList(1);
    return 1;
  }

  deconstruct() {
    this.regMsgList(0);
    return 1;
  }

  define(tPageProps) {
    if (tPageProps.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect Catalogue page data", Symbol.for("define"), Symbol.for("major"));
    }
    if (!voidp(tPageProps["productList"])) {
      let tProducts = tPageProps["productList"];
      for (let f = 1; f <= tProducts.count; f++) {
        if (!voidp(tProducts[f]["purchaseCode"])) {
          let tPurchaseCode = tProducts[f]["purchaseCode"];
          let tPetType = tPurchaseCode.char[tPurchaseCode.length];
          for (let tPetCount = 1; tPetCount <= 5; tPetCount++) {
            if (!voidp(this.pPetRacesList[tPetType])) {
              let tCount = this.pPetRacesList[tPetType]["races"].count;
              let tPetRace;
              if (tCount > 0) {
                tPetRace = this.pPetRacesList[tPetType]["races"][random(tCount)];
              } else {
                tPetRace = EMPTY;
              }
              tCount = this.pPetRacesList[tPetType]["colors"].count;
              let tColor;
              if (tCount > 0) {
                tColor = this.pPetRacesList[tPetType]["colors"][random(tCount)];
              } else {
                tColor = EMPTY;
              }
              let tProductData = tProducts[f].duplicate();
              tProductData.addProp("petType", tPetType);
              tProductData.addProp("petRace", tPetRace);
              tProductData.addProp("petColor", tColor);
              this.pPageData[`${"pet_"}${tPetType}${`_`}${tPetCount}`] = tProductData;
            }
          }
        }
      }
    }
    this.selectProduct(1);
  }

  petNameApproved() {
    if (this.pSelectedProduct.ilk == Symbol.for("propList")) {
      getThread(Symbol.for("catalogue")).getComponent().checkProductOrder(this.pSelectedProduct);
    }
  }

  petNameUnacceptable() {
    let tWndObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (tWndObj.elementExists("dedication_text")) {
      tWndObj.getElement("dedication_text").setText(EMPTY);
    }
    return executeMessage(Symbol.for("alert"), propList("Msg", "catalog_pet_unacceptable", "id", "ctlg_petunacceptable"));
  }

  definePet(tProps) {
    let tdata = propList();
    tdata[Symbol.for("name")] = "PetTemplate";
    tdata[Symbol.for("class")] = "Pet Class";
    tdata[Symbol.for("direction")] = list(1, 1, 1);
    tdata[Symbol.for("x")] = 1;
    tdata[Symbol.for("y")] = 1;
    tdata[Symbol.for("h")] = 1;
    tdata[Symbol.for("figure")] = `${tProps["petType"]} ${tProps["petRace"]} ${tProps["petColor"]}`;
    if (!voidp(this.pPetTemplateObj)) {
      this.pPetTemplateObj.setup(tdata);
      return 1;
    } else {
      return 0;
    }
  }

  selectProduct(tOrderNum) {
    let tCataloguePage = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tCataloguePage) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("selectProduct"), Symbol.for("major"));
    }
    let tWndObj = tCataloguePage;
    if (!integerp(tOrderNum)) {
      return error(this, "Incorrect value", Symbol.for("selectProduct"), Symbol.for("major"));
    }
    if (voidp(this.pPageData)) {
      return error(this, "product not found", Symbol.for("selectProduct"), Symbol.for("major"));
    }
    if (this.pPageData.count == 0) {
      return;
    }
    if (tOrderNum > this.pPageData.count) {
      return;
    }
    if (voidp(this.pPageData[tOrderNum][1])) {
      return;
    }
    this.pSelectedProduct = this.pPageData[tOrderNum];
    this.pSelectedColorNum = 1;
    this.pSelectedOrderNum = tOrderNum;
    if (this.definePet(this.pSelectedProduct) == 1) {
      let tElemID = "ctlg_teaserimg_1";
      if (tWndObj.elementExists(tElemID)) {
        let tElem = tWndObj.getElement(tElemID);
        let tImage = this.pPetTemplateObj.getPicture();
        if (tImage.ilk == Symbol.for("image")) {
          let tDestImg = tElem.getProperty(Symbol.for("image"));
          let tSourceImg = tImage;
          tDestImg.fill(tDestImg.rect, rgb(255, 255, 255));
          let tSourceRect = tSourceImg.rect * 2;
          let tdestrect = tDestImg.rect - tSourceRect;
          let tMargins = rect(14, -7, 14, -7);
          tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tSourceRect.width + (tdestrect.width / 2), (tdestrect.height / 2) + tSourceRect.height) + tMargins;
          tDestImg.copyPixels(tSourceImg, tdestrect, tSourceImg.rect, propList("ink", 36));
          tElem.feedImage(tDestImg);
        }
      }
    }
    if (tWndObj.elementExists("ctlg_text_2")) {
      let tText = getText(`${"pet_race_"}${this.pSelectedProduct["petType"]}${`_`}${this.pSelectedProduct["petRace"]}`);
      tWndObj.getElement("ctlg_text_2").setText(tText);
    }
    if (!voidp(this.pSelectedProduct["price"])) {
      if (tWndObj.elementExists("ctlg_price_1")) {
        let tText;
        if (value(this.pSelectedProduct["price"]) > 1) {
          tText = `${this.pSelectedProduct["price"]} ${getText("credits", "credits")}`;
        } else {
          tText = `${this.pSelectedProduct["price"]} ${getText("credit", "credit")}`;
        }
        tWndObj.getElement("ctlg_price_1").setText(tText);
      }
    }
    if (tWndObj.elementExists("ctlg_buy_button")) {
      tWndObj.getElement("ctlg_buy_button").setProperty(Symbol.for("visible"), 1);
    }
    this.pLastProductNum = this.pSelectedOrderNum;
  }

  nextProduct() {
    if (this.pPageData.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect data", Symbol.for("nextProduct"), Symbol.for("major"));
    }
    let tNext = this.pLastProductNum + 1;
    if (tNext > this.pPageData.count) {
      tNext = this.pPageData.count;
    }
    this.pSelectedOrderNum = tNext;
    this.selectProduct(tNext);
  }

  prevProduct() {
    if (this.pPageData.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect data", Symbol.for("prewProduct"), Symbol.for("major"));
    }
    let tPrev = this.pLastProductNum - 1;
    if (tPrev < 1) {
      tPrev = 1;
    }
    this.pSelectedOrderNum = tPrev;
    this.selectProduct(tPrev);
  }

  eventProc(tEvent, tSprID, tProp) {
    if (tEvent == Symbol.for("mouseUp")) {
      if (tSprID == "close") {
        return 0;
      }
    }
    if (tEvent == Symbol.for("mouseDown")) {
      if (tSprID == "ctlg_buy_button") {
        let tWndObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
        let tText = EMPTY;
        if (tWndObj.elementExists("dedication_text")) {
          tText = tWndObj.getElement("dedication_text").getText();
          tText = replaceChunks(tText, RETURN, "\r");
        }
        if (tText.length < 1) {
          return executeMessage(Symbol.for("alert"), propList("Msg", "catalog_give_petname", "id", "ctlg_petmsg"));
        } else {
          if (tText.length > 15) {
            return executeMessage(Symbol.for("alert"), propList("Msg", "catalog_pet_name_length", "id", "ctlg_petmsg"));
          }
        }
        tText = tText.char[`${1}..${15}`];
        tText = convertSpecialChars(tText, 1);
        if (this.pSelectedProduct.ilk != Symbol.for("propList")) {
          return error(this, "incorrect Selected Product Data", Symbol.for("eventProc"), Symbol.for("major"));
        }
        let tPet = `${numToChar(2)}${this.pSelectedProduct["petRace"]}${numToChar(2)}${this.pSelectedProduct["petColor"]}`;
        this.pSelectedProduct["extra_parm"] = `${tText}${tPet}`;
        if (connectionExists(getVariable("connection.info.id", Symbol.for("Info")))) {
          this.pNameCheckPending = 1;
          getConnection(getVariable("connection.info.id", Symbol.for("Info"))).send("APPROVENAME", propList("string", tText, "integer", 1));
        }
      } else {
        if (tSprID == "ctlg_nextmodel_button") {
          this.nextProduct();
        } else if (tSprID == "ctlg_prevmodel_button") {
          this.prevProduct();
        } else {
          if (tSprID == "ctlg_text_3") {
            putInto("TODO >>> link", "TODO >>> link");
          } else {
            return 0;
          }
        }
      }
    }
    return 1;
  }

  handle_nameapproved(tMsg) {
    if (!this.pNameCheckPending) {
      return 1;
    }
    this.pNameCheckPending = 0;
    let tParm = tMsg.connection.GetIntFrom(tMsg);
    if (tParm == 0) {
      this.petNameApproved();
    } else {
      this.petNameUnacceptable();
    }
  }

  regMsgList(tBool) {
    let tMsgs = propList();
    tMsgs.setaProp(36, Symbol.for("handle_nameapproved"));
    let tCmds = propList();
    tCmds.setaProp("APPROVENAME", 42);
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
