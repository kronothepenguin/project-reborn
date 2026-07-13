export default class {
  pCatalogID;
  pWriterPages;
  pOpenWindow;
  pCurrentPageData;
  pPageListImg;
  pPagePropList;
  pPageLineHeight;
  pActivePageID;
  pProductPerPage;
  pSelectedProduct;
  pLastProductNum;
  pProductOffset;
  pPageLinkList;
  pSmallImg;
  pInfoWindowID;
  pPurchaseOkID;
  pPageProgramID;
  pLoaderObjID;
  pActiveOrderCode;
  pLoadingFlag;

  construct() {
    this.pCatalogID = "Catalogue_window";
    this.pPageLineHeight = 21;
    this.pProductPerPage = 0;
    this.pProductOffset = 0;
    this.pSmallImg = image(32, 32, 32);
    this.pInfoWindowID = "Purchase info";
    this.pPurchaseOkID = getText("catalog_buyingSuccesfull");
    this.pPageProgramID = "Catalogue_page_prg";
    this.pLoaderObjID = "Catalogue_loader";
    let tLoaderObj = createObject(this.pLoaderObjID, "Catalogue Loader Class");
    if (tLoaderObj == 0) {
      return error(this, "Failed to create LoaderObj", Symbol.for("construct"), Symbol.for("major"));
    }
    this.pLoadingFlag = 1;
    this.pWriterPages = getUniqueID();
    let tPlain = getStructVariable("struct.font.plain");
    let tBold = getStructVariable("struct.font.bold");
    let tLink = getStructVariable("struct.font.link");
    let tMetrics = propList("font", tBold.getaProp(Symbol.for("font")), "fontStyle", tBold.getaProp(Symbol.for("fontStyle")), "color", rgb("#000000"));
    createWriter(this.pWriterPages, tMetrics);
    registerMessage(Symbol.for("enterRoom"), this.getID(), Symbol.for("hideCatalogue"));
    registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("hideCatalogue"));
    registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("hideCatalogue"));
    registerMessage(Symbol.for("show_catalogue"), this.getID(), Symbol.for("showCatalogue"));
    registerMessage(Symbol.for("hide_catalogue"), this.getID(), Symbol.for("hideCatalogue"));
    registerMessage(Symbol.for("show_hide_catalogue"), this.getID(), Symbol.for("showHideCatalogue"));
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    if (objectExists(this.pPageProgramID)) {
      removeObject(this.pPageProgramID);
    }
    this.hideAllWindows();
    removeWriter(this.pWriterPages);
    unregisterMessage(Symbol.for("enterRoom"), this.getID());
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    unregisterMessage(Symbol.for("show_catalogue"), this.getID());
    unregisterMessage(Symbol.for("hide_catalogue"), this.getID());
    unregisterMessage(Symbol.for("show_hide_catalogue"), this.getID());
    return 1;
  }

  showHideCatalogue() {
    if (windowExists(this.pCatalogID)) {
      return this.hideCatalogue();
    } else {
      return this.showCatalogue();
    }
  }

  showCatalogue() {
    if (!windowExists(this.pCatalogID)) {
      let tList = propList();
      tList["showDialog"] = 1;
      executeMessage(Symbol.for("getHotelClosingStatus"), tList);
      if (tList["retval"] != 0) {
        return 1;
      }
      this.ChangeWindowView();
      return 1;
    } else {
      return 0;
    }
  }

  hideCatalogue() {
    if (objectExists(this.pLoaderObjID)) {
      getObject(this.pLoaderObjID).hideLoadingScreen();
    }
    let tProgram = getObject(this.pPageProgramID);
    call(Symbol.for("closePage"), [tProgram]);
    if (windowExists(this.pCatalogID)) {
      return removeWindow(this.pCatalogID);
    } else {
      return 0;
    }
  }

  getCatalogWindow() {
    if (!windowExists(this.pCatalogID)) {
      return 0;
    }
    return getWindow(this.pCatalogID);
  }

  getSelectedProduct() {
    return this.pSelectedProduct;
  }

  showOrderInfo(tstate, tInfo) {
    if (windowExists(this.pInfoWindowID)) {
      return 0;
    }
    let tMsgA;
    let tMsgB;
    let tWndType;
    if (tstate == "OK") {
      let tPrice = integer(value(tInfo[Symbol.for("price")]));
      let tWallet = integer(value(getObject(Symbol.for("session")).GET("user_walletbalance")));
      tMsgA = getText("catalog_costs", "\\x1 costs \\x2 credits");
      tMsgA = replaceChunks(tMsgA, "\\x1", tInfo[Symbol.for("name")]);
      tMsgA = replaceChunks(tMsgA, "\\x2", tPrice);
      tMsgB = replaceChunks(getText("catalog_credits"), "\\x", tWallet);
      this.pActiveOrderCode = tInfo[Symbol.for("code")];
      tWndType = "orderinfo";
      if (tWallet < value(tInfo[Symbol.for("price")])) {
        return this.showNoBalance(tInfo);
      }
    } else if (tstate == "ERROR") {
      tMsgA = "Error occured!";
      tMsgB = string(tInfo);
      this.pActiveOrderCode = EMPTY;
      tWndType = "message";
    }
    if (!memberExists(`habbo_${tWndType}_dialog.window`)) {
      return error(this, `Window description not found: habbo_${tWndType}_dialog.window`, Symbol.for("showOrderInfo"), Symbol.for("major"));
    }
    if (!createWindow(this.pInfoWindowID, "habbo_simple.window", VOID, VOID, Symbol.for("modal"))) {
      return error(this, "Couldn't create window to show purchase info!", Symbol.for("showOrderInfo"), Symbol.for("major"));
    }
    let tWndObj = getWindow(this.pInfoWindowID);
    if (!tWndObj.merge(`habbo_${tWndType}_dialog.window`)) {
      tWndObj.close();
      return error(this, "Couldn't create window to show purchase info!", Symbol.for("showOrderInfo"), Symbol.for("major"));
    }
    tWndObj.center();
    tWndObj.getElement(`habbo_${tWndType}_text_a`).setText(tMsgA);
    tWndObj.getElement(`habbo_${tWndType}_text_b`).setText(tMsgB);
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcInfoWnd"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.setProperty(Symbol.for("locZ"), 22000000);
    tWndObj.lock(1);
    if (!getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_trade")) {
      if (tWndObj.elementExists("buy_gift_ok")) {
        tWndObj.getElement("buy_gift_ok").setProperty(Symbol.for("blend"), 30);
      }
    }
    return 1;
  }

  hideOrderInfo() {
    if (!windowExists(this.pInfoWindowID)) {
      return 0;
    }
    removeWindow(this.pInfoWindowID);
    return 1;
  }

  showNoBalance(tInfo, tGeneralText) {
    if (windowExists(this.pInfoWindowID)) {
      return 0;
    }
    let tMsgA;
    if (tGeneralText) {
      tMsgA = getText("Alert_no_credits");
    } else {
      let tPrice = integer(value(tInfo[Symbol.for("price")]));
      let tWallet = integer(value(getObject(Symbol.for("session")).GET("user_walletbalance")));
      tMsgA = getText("catalog_costs", "\\x1 costs \\x2 credits");
      tMsgA = replaceChunks(tMsgA, "\\x1", tInfo[Symbol.for("name")]);
      tMsgA = replaceChunks(tMsgA, "\\x2", tPrice);
    }
    let tWndFile;
    if (getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_buy_credits")) {
      tWndFile = "habbo_orderinfo_nocredits.window";
    } else {
      tWndFile = "habbo_orderinfo_cantbuycredits.window";
    }
    if (!createWindow(this.pInfoWindowID, "habbo_simple.window", VOID, VOID, Symbol.for("modal"))) {
      return error(this, "Couldn't create window to show purchase info!", Symbol.for("showNoBalance"), Symbol.for("major"));
    }
    let tWndObj = getWindow(this.pInfoWindowID);
    if (!tWndObj.merge(tWndFile)) {
      tWndObj.close();
      return error(this, "Couldn't create window to show purchase info!", Symbol.for("showNoBalance"), Symbol.for("major"));
    }
    tWndObj.center();
    tWndObj.getElement("habbo_message_text_a").setText(tMsgA);
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcInfoWnd"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.setProperty(Symbol.for("locZ"), 22000000);
    tWndObj.lock(1);
    return 1;
  }

  showPurchaseOk() {
    if (!createWindow(this.pPurchaseOkID, "habbo_basic.window", VOID, VOID, Symbol.for("modal"))) {
      return 0;
    }
    let tWndObj = getWindow(this.pPurchaseOkID);
    if (!tWndObj.merge("habbo_message_dialog.window")) {
      return tWndObj.close();
    }
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("hidePurchaseOk"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.center();
    tWndObj.setProperty(Symbol.for("locZ"), 22000000);
    tWndObj.getElement("habbo_message_text_b").setText(getText("catalog_itsurs"));
    if (threadExists(Symbol.for("room"))) {
      if (getThread(Symbol.for("room")).getComponent().pRoomId == "private") {
        getThread(Symbol.for("room")).getInterface().getContainer().open();
      }
    }
    return 1;
  }

  hidePurchaseOk(tOptionalEvent, tOptionalSprID) {
    if (tOptionalEvent == Symbol.for("mouseUp")) {
      if (stringp(tOptionalSprID)) {
        if ((tOptionalSprID != "close") && (tOptionalSprID != "habbo_message_ok")) {
          return 0;
        }
      }
    }
    if (windowExists(this.pPurchaseOkID)) {
      removeWindow(this.pPurchaseOkID);
    }
    return 1;
  }

  showBuyAsGift(tBoolean) {
    let tWndObj = getWindow(this.pInfoWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    let tMsgA = tWndObj.getElement("habbo_orderinfo_text_a").getText();
    let tMsgB = tWndObj.getElement("habbo_orderinfo_text_b").getText();
    tWndObj.unmerge();
    if (tBoolean) {
      if (!tWndObj.merge("habbo_orderinfo_gift_dialog.window")) {
        return tWndObj.close();
      }
    } else {
      if (!tWndObj.merge("habbo_orderinfo_dialog.window")) {
        return tWndObj.close();
      }
    }
    tWndObj.setProperty(Symbol.for("locZ"), 22000000);
    tWndObj.getElement("habbo_orderinfo_text_a").setText(tMsgA);
    tWndObj.getElement("habbo_orderinfo_text_b").setText(tMsgB);
    tWndObj.registerProcedure(Symbol.for("eventProcKeyDown"), this.getID(), Symbol.for("keyDown"));
  }

  saveCatalogueIndex(tdata) {
    if (!windowExists(this.pCatalogID)) {
      return 0;
    }
    this.pPagePropList = tdata;
    this.renderPageList(this.pPagePropList);
    this.pActivePageID = VOID;
    this.selectPage(1);
    this.pLoadingFlag = 0;
  }

  cataloguePageData(tdata) {
    if (!windowExists(this.pCatalogID)) {
      return 0;
    }
    if (tdata.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect Catalogue page data", Symbol.for("cataloguePageData"), Symbol.for("major"));
    }
    this.pCurrentPageData = tdata.duplicate();
    let tLayout = `${this.pCurrentPageData["layout"]}.window`;
    if (!memberExists(tLayout)) {
      error(this, `Catalogue page Layout not found: ${tLayout}`, Symbol.for("cataloguePageData"), Symbol.for("minor"));
      tLayout = "ctlg_layout1.window";
    }
    if (!voidp(this.pCurrentPageData["linkList"])) {
      if (!voidp(this.pCurrentPageData["id"])) {
        if (!voidp(this.pPagePropList[this.pCurrentPageData["id"]])) {
          this.pPageLinkList = this.pCurrentPageData["linkList"].duplicate();
          this.pPageLinkList.addAt(1, this.pCurrentPageData["id"]);
        }
      }
    } else {
      if (!voidp(this.pPageLinkList)) {
        if (!voidp(this.pCurrentPageData["id"])) {
          if (this.pPageLinkList.findPos(this.pCurrentPageData["id"]) == 0) {
            this.pPageLinkList = VOID;
          }
        }
      }
    }
    this.ChangeWindowView(tLayout);
  }

  ChangeWindowView(tWindowName) {
    let tWndObj = getWindow(this.pCatalogID);
    if (objectp(tWndObj)) {
      if (objectExists(this.pLoaderObjID)) {
        getObject(this.pLoaderObjID).hideLoadingScreen();
      }
      if (!voidp(this.pOpenWindow)) {
        tWndObj.unmerge();
      }
    } else {
      if (!createWindow(this.pCatalogID, "habbo_catalogue.window")) {
        return error(this, "Failed to open Catalogue window!!!", Symbol.for("ChangeWindowView"), Symbol.for("major"));
      } else {
        tWndObj = getWindow(this.pCatalogID);
        tWndObj.center();
        tWndObj.moveBy(-60, -30);
        tWndObj.registerClient(this.getID());
        tWndObj.registerProcedure(Symbol.for("eventProcCatalogue"), this.getID(), Symbol.for("mouseUp"));
        tWndObj.registerProcedure(Symbol.for("eventProcCatalogue"), this.getID(), Symbol.for("mouseDown"));
        tWndObj.registerProcedure(Symbol.for("eventProcCatalogue"), this.getID(), Symbol.for("keyDown"));
        tWndObj.registerProcedure(Symbol.for("eventProcCatalogue"), this.getID(), Symbol.for("mouseEnter"));
        tWndObj.registerProcedure(Symbol.for("eventProcCatalogue"), this.getID(), Symbol.for("mouseLeave"));
      }
    }
    this.updatePurseSaldo();
    if (!voidp(tWindowName)) {
      let tResult = tWndObj.merge(tWindowName);
      if (tResult == 0) {
        tWndObj.close();
        return error(this, "Incorrect Window Format", Symbol.for("ChangeWindowView"), Symbol.for("major"));
      }
      this.pOpenWindow = tWindowName;
    } else {
      this.pOpenWindow = VOID;
    }
    if (voidp(this.pPagePropList)) {
      tWindowName = "ctlg_loading.window";
    }
    this.pProductOffset = 0;
    this.pProductPerPage = 0;
    this.pSelectedProduct = VOID;
    this.pLastProductNum = VOID;
    let tFeedDataFlag = 1;
    this.pProductPerPage = 0;
    for (let tProducts = 1; tProducts <= 50; tProducts++) {
      let tID = `${"ctlg_small_img_"}${tProducts}`;
      if (tWndObj.elementExists(tID)) {
        this.pProductPerPage = this.pProductPerPage + 1;
        continue;
      }
      break;
    }
    switch (tWindowName) {
      case VOID:
      case "ctlg_loading.window":
        this.renderPageList();
        this.getComponent().retrieveCatalogueIndex();
        return 1;
      case "frontpage.window":
      case "ctlg_layout1.window":
      case "ctlg_layout2.window":
      case "ctlg_soundmachine.window":
        if (!voidp(this.pCurrentPageData["teaserText"])) {
          let tText = this.pCurrentPageData["teaserText"];
          if (tWndObj.elementExists("ctlg_description")) {
            tWndObj.getElement("ctlg_description").setText(tText);
          }
        }
        if (tWndObj.elementExists("ctlg_buy_button")) {
          tWndObj.getElement("ctlg_buy_button").setProperty(Symbol.for("visible"), 0);
        }
        if (tWndObj.elementExists("ctlg_select_product") && textExists("catalog_select_product")) {
          tWndObj.getElement("ctlg_select_product").setText(getText("catalog_select_product"));
        }
        if (tWndObj.elementExists("ctlg_page_text") && textExists("catalog_page")) {
          tWndObj.getElement("ctlg_page_text").setText(getText("catalog_page"));
        }
        break;
      case "ctlg_productpage1.window":
      case "ctlg_productpage2.window":
      case "ctlg_productpage3.window":
      case "ctlg_productpage4.window":
        if (voidp(this.pCurrentPageData["teaserImgList"]) && !voidp(this.pCurrentPageData["productList"])) {
          if (this.pCurrentPageData["productList"].ilk == Symbol.for("list")) {
            if (this.pCurrentPageData["productList"].count > 0) {
              for (let tProductNum = 1; tProductNum <= this.pCurrentPageData["productList"].count; tProductNum++) {
                let tProps = this.pCurrentPageData["productList"][tProductNum];
                let tElemID = `${"ctlg_teaserimg_"}${tProductNum}`;
                this.showPreviewImage(tProps, tElemID);
              }
            }
          }
        }
        break;
      case "ctlg_collectibles.window":
        if (!voidp(this.pCurrentPageData["textList"])) {
          let tTextList = this.pCurrentPageData["textList"];
          if (tTextList.ilk == Symbol.for("list")) {
            let tText = tTextList[1];
            if (tWndObj.elementExists("ctlg_collectibles_link")) {
              tWndObj.getElement("ctlg_collectibles_link").setText(tText);
            }
          }
        }
        break;
    }
    if (tFeedDataFlag) {
      this.feedPageData();
    }
    if (objectExists(this.pPageProgramID)) {
      removeObject(this.pPageProgramID);
    }
    if (this.pCurrentPageData.ilk == Symbol.for("propList")) {
      if (!voidp(this.pCurrentPageData["layout"])) {
        let tDelim = the.itemDelimiter;
        the.itemDelimiter = "_";
        let tClassMem = `Catalogue ${this.pCurrentPageData["layout"].item[2]} Class`;
        the.itemDelimiter = tDelim;
        if (memberExists(tClassMem)) {
          let tPageObj = createObject(this.pPageProgramID, tClassMem);
          if (tPageObj == 0) {
            return error(this, "Failed to create pageProgram", Symbol.for("ChangeWindowView"), Symbol.for("major"));
          }
          if (getObject(this.pPageProgramID).handler(Symbol.for("define"))) {
            getObject(this.pPageProgramID).define(this.pCurrentPageData);
          }
        }
      }
    }
    this.pLoadingFlag = 0;
  }

  feedPageData() {
    if (this.pCurrentPageData.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect Data Format", Symbol.for("feedPageData"), Symbol.for("major"));
    }
    if (!windowExists(this.pCatalogID)) {
      return;
    }
    let tWndObj = getWindow(this.pCatalogID);
    if (tWndObj.elementExists("ctlg_header_img")) {
      if (!voidp(this.pCurrentPageData["headerImage"])) {
        if (this.pCurrentPageData["headerImage"] > 0) {
          let tElem = tWndObj.getElement("ctlg_header_img");
          let tDestImg = tElem.getProperty(Symbol.for("image"));
          let tSourceImg = member(this.pCurrentPageData["headerImage"]).image;
          let tdestrect = tDestImg.rect - tSourceImg.rect;
          let tMargins = rect(0, 0, 0, 0);
          tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tSourceImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tSourceImg.height) + tMargins;
          tDestImg.copyPixels(tSourceImg, tdestrect, tSourceImg.rect, propList("ink", 8));
          tElem.feedImage(tDestImg);
        }
      }
    }
    if (tWndObj.elementExists("ctlg_header_text")) {
      if (!voidp(this.pCurrentPageData["headerText"])) {
        tWndObj.getElement("ctlg_header_text").setText(this.pCurrentPageData["headerText"]);
      }
    }
    if (!voidp(this.pCurrentPageData["textList"])) {
      let tTextList = this.pCurrentPageData["textList"];
      if (tTextList.ilk == Symbol.for("list")) {
        for (let t = 1; t <= tTextList.count; t++) {
          if (tWndObj.elementExists(`${"ctlg_text_"}${t}`)) {
            tWndObj.getElement(`${"ctlg_text_"}${t}`).setText(tTextList[t]);
          }
        }
      }
    }
    if (!voidp(this.pCurrentPageData["teaserImgList"])) {
      let tImgList = this.pCurrentPageData["teaserImgList"];
      if (tImgList.ilk == Symbol.for("list")) {
        for (let t = 1; t <= tImgList.count; t++) {
          if (tWndObj.elementExists(`${"ctlg_teaserimg_"}${t}`)) {
            let tElem = tWndObj.getElement(`${"ctlg_teaserimg_"}${t}`);
            let tmember = tImgList[t];
            if (tmember != 0) {
              let tDestImg = tElem.getProperty(Symbol.for("image"));
              let tSourceImg = member(tmember).image;
              let tdestrect = tDestImg.rect - tSourceImg.rect;
              let tMargins = rect(0, 0, 0, 0);
              tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tSourceImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tSourceImg.height) + tMargins;
              tDestImg.copyPixels(tSourceImg, tdestrect, tSourceImg.rect, propList("ink", 36));
              tElem.feedImage(tDestImg);
            }
          }
        }
      }
    }
    if (!voidp(this.pCurrentPageData["teaserSpecialText"])) {
      this.showSpecialText(this.pCurrentPageData["teaserSpecialText"]);
    }
    if (!voidp(this.pCurrentPageData["productList"])) {
      if (this.pCurrentPageData["productList"].count > 0) {
        if (this.pProductPerPage > 0) {
          this.ShowSmallIcons();
          if (voidp(this.pPageLinkList)) {
            this.showProductPageCounter();
          }
        } else {
          for (let tNum = 1; tNum <= 25; tNum++) {
            let tID = `${"ctlg_buy_"}${tNum}`;
            if (tWndObj.elementExists(tID)) {
              if (tNum > this.pCurrentPageData["productList"].count) {
                tWndObj.getElement(tID).setProperty(Symbol.for("visible"), 0);
              } else {
                let tProduct = this.pCurrentPageData["productList"][tNum];
                if (!voidp(tProduct["name"])) {
                  if (tWndObj.elementExists(`${"ctlg_product_name_"}${tNum}`)) {
                    tWndObj.getElement(`${"ctlg_product_name_"}${tNum}`).setText(tProduct["name"]);
                  }
                }
                if (!voidp(tProduct["description"])) {
                  if (tWndObj.elementExists(`${"ctlg_description_"}${tNum}`)) {
                    tWndObj.getElement(`${"ctlg_description_"}${tNum}`).setText(tProduct["description"]);
                  }
                }
                if (!voidp(tProduct["price"])) {
                  if (tWndObj.elementExists(`${"ctlg_price_"}${tNum}`)) {
                    let tText;
                    if (value(tProduct["price"]) > 1) {
                      tText = `${tProduct["price"]} ${getText("credits", "credits")}`;
                    } else {
                      tText = `${tProduct["price"]} ${getText("credit", "credit")}`;
                    }
                    tWndObj.getElement(`${"ctlg_price_"}${tNum}`).setText(tText);
                  }
                }
              }
              continue;
            }
            break;
          }
        }
      }
    }
    if (tWndObj.elementExists("ctlg_price_box")) {
      tWndObj.getElement("ctlg_price_box").setProperty(Symbol.for("visible"), 0);
    }
    if (!voidp(this.pPageLinkList)) {
      this.showSubPageCounter();
    } else {
      let tID = "ctlg_nextpage_button";
      if (tWndObj.elementExists(tID)) {
        tWndObj.getElement(tID).setProperty(Symbol.for("visible"), 0);
      }
      tID = "ctlg_prevpage_button";
      if (tWndObj.elementExists(tID)) {
        tWndObj.getElement(tID).setProperty(Symbol.for("visible"), 0);
      }
    }
    let tID = "ctlg_loading_bg";
    if (tWndObj.elementExists(tID)) {
      tWndObj.getElement(tID).setProperty(Symbol.for("visible"), 0);
    }
    tID = "ctlg_loading_box";
    if (tWndObj.elementExists(tID)) {
      tWndObj.getElement(tID).setProperty(Symbol.for("visible"), 0);
    }
    tID = "ctlg_loading_anim";
    if (tWndObj.elementExists(tID)) {
      tWndObj.getElement(tID).setProperty(Symbol.for("visible"), 0);
    }
    tID = "ctlg_loading_text";
    if (tWndObj.elementExists(tID)) {
      tWndObj.getElement(tID).setProperty(Symbol.for("visible"), 0);
    }
  }

  showSpecialText(tSpecialText) {
    if (!windowExists(this.pCatalogID)) {
      return;
    }
    if (tSpecialText.ilk != Symbol.for("string")) {
      return;
    }
    if (tSpecialText.length < 2) {
      return;
    }
    let tWndObj = getWindow(this.pCatalogID);
    if (!tWndObj.elementExists("ctlg_special_img")) {
      return;
    }
    let tElem = tWndObj.getElement("ctlg_special_img");
    let tDelim = the.itemDelimiter;
    the.itemDelimiter = ":";
    let ttype = integer(tSpecialText.item[1]);
    let tText = tSpecialText.item[tSpecialText.item.count];
    the.itemDelimiter = tDelim;
    if (voidp(ttype)) {
      ttype = 1;
    }
    let tMem = `${"catalog_special_txtbg"}${ttype}`;
    if (memberExists(tMem)) {
      let tDestImg = tElem.getProperty(Symbol.for("image"));
      let tSourceImg = member(getmemnum(tMem)).image;
      tDestImg.fill(tDestImg.rect, rgb(255, 255, 255));
      let tdestrect = tDestImg.rect - tSourceImg.rect;
      let tMargins = rect(0, 0, 0, 0);
      tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tSourceImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tSourceImg.height) + tMargins;
      tDestImg.copyPixels(tSourceImg, tdestrect, tSourceImg.rect, propList("ink", 8));
      tElem.feedImage(tDestImg);
    }
    if (tWndObj.elementExists("ctlg_special_txt")) {
      tWndObj.getElement("ctlg_special_txt").setText(tText);
    }
  }

  hideSpecialText() {
    if (!windowExists(this.pCatalogID)) {
      return;
    }
    let tWndObj = getWindow(this.pCatalogID);
    if (tWndObj.elementExists("ctlg_special_img")) {
      tWndObj.getElement("ctlg_special_img").clearImage();
    }
    if (tWndObj.elementExists("ctlg_special_txt")) {
      tWndObj.getElement("ctlg_special_txt").setText(EMPTY);
    }
  }

  showProductPageCounter() {
    if (!windowExists(this.pCatalogID)) {
      return;
    }
    let tWndObj = getWindow(this.pCatalogID);
    if (!voidp(this.pCurrentPageData["productList"])) {
      if (this.pProductPerPage >= this.pCurrentPageData["productList"].count) {
        if (tWndObj.elementExists("ctlg_next_button")) {
          tWndObj.getElement("ctlg_next_button").setProperty(Symbol.for("visible"), 0);
        }
        if (tWndObj.elementExists("ctlg_prev_button")) {
          tWndObj.getElement("ctlg_prev_button").setProperty(Symbol.for("visible"), 0);
        }
        if (tWndObj.elementExists("ctlg_page_counter")) {
          tWndObj.getElement("ctlg_page_counter").setProperty(Symbol.for("visible"), 0);
        }
        if (tWndObj.elementExists("ctlg_page_text")) {
          tWndObj.getElement("ctlg_page_text").setProperty(Symbol.for("visible"), 0);
        }
      } else {
        if (tWndObj.elementExists("ctlg_page_text")) {
          let tPage = getText("catalog_page", "page");
          tWndObj.getElement("ctlg_page_text").setText(tPage);
        }
        let tNextButton;
        let tPrewButton;
        if (tWndObj.elementExists("ctlg_page_counter")) {
          let tCurrent = integer(this.pProductOffset / this.pProductPerPage) + 1;
          let tTotalPages = float(this.pCurrentPageData["productList"].count) / float(this.pProductPerPage);
          if ((tTotalPages - integer(tTotalPages)) > 0) {
            tTotalPages = integer(tTotalPages) + 1;
          } else {
            tTotalPages = integer(tTotalPages);
          }
          let tCounterText = `${string(tCurrent)}/${string(integer(tTotalPages))}`;
          tWndObj.getElement("ctlg_page_counter").setText(tCounterText);
          if (tCurrent == 1) {
            tNextButton = 1;
            tPrewButton = 0;
          } else {
            if (tCurrent == tTotalPages) {
              tNextButton = 0;
              tPrewButton = 1;
            } else {
              if ((tCurrent > 1) && (tCurrent < tTotalPages)) {
                tNextButton = 1;
                tPrewButton = 1;
              }
            }
          }
        }
        if (tWndObj.elementExists("ctlg_next_button")) {
          let tElem = tWndObj.getElement("ctlg_next_button");
          if (tNextButton) {
            tElem.Activate(this);
            tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
          } else {
            tElem.deactivate(this);
            tElem.setProperty(Symbol.for("cursor"), 0);
          }
        }
        if (tWndObj.elementExists("ctlg_prev_button")) {
          let tElem = tWndObj.getElement("ctlg_prev_button");
          if (tPrewButton) {
            tElem.Activate(this);
            tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
          } else {
            tElem.deactivate(this);
            tElem.setProperty(Symbol.for("cursor"), 0);
          }
        }
        if (tWndObj.elementExists("ctlg_next_button")) {
          tWndObj.getElement("ctlg_next_button").setProperty(Symbol.for("visible"), 1);
        }
        if (tWndObj.elementExists("ctlg_prev_button")) {
          tWndObj.getElement("ctlg_prev_button").setProperty(Symbol.for("visible"), 1);
        }
        if (tWndObj.elementExists("ctlg_page_counter")) {
          tWndObj.getElement("ctlg_page_counter").setProperty(Symbol.for("visible"), 1);
        }
        if (tWndObj.elementExists("ctlg_page_text")) {
          tWndObj.getElement("ctlg_page_text").setProperty(Symbol.for("visible"), 1);
        }
      }
    } else {
      if (tWndObj.elementExists("ctlg_next_button")) {
        tWndObj.getElement("ctlg_next_button").setProperty(Symbol.for("visible"), 0);
      }
      if (tWndObj.elementExists("ctlg_prev_button")) {
        tWndObj.getElement("ctlg_prev_button").setProperty(Symbol.for("visible"), 0);
      }
      if (tWndObj.elementExists("ctlg_page_counter")) {
        tWndObj.getElement("ctlg_page_counter").setProperty(Symbol.for("visible"), 0);
      }
      if (tWndObj.elementExists("ctlg_page_text")) {
        tWndObj.getElement("ctlg_page_text").setProperty(Symbol.for("visible"), 0);
      }
    }
  }

  showSubPageCounter() {
    if (!windowExists(this.pCatalogID)) {
      return error(this, "Catalogue window not exists", Symbol.for("showSubPageCounter"), Symbol.for("major"));
    }
    let tWndObj = getWindow(this.pCatalogID);
    let tNextButton;
    let tPrevButton;
    if (!voidp(this.pPageLinkList)) {
      let tID = this.pCurrentPageData["id"];
      let tPageNum = this.pPageLinkList.findPos(tID);
      if (tPageNum < 1) {
        tPageNum = 1;
      }
      if (tWndObj.elementExists("ctlg_subpage_counter")) {
        let tCounterText = `${tPageNum}/${this.pPageLinkList.count}`;
        tWndObj.getElement("ctlg_subpage_counter").setText(tCounterText);
      }
      if (tPageNum == 1) {
        tPrevButton = 0;
      } else {
        tPrevButton = 1;
      }
      if (tPageNum == this.pPageLinkList.count) {
        tNextButton = 0;
      } else {
        tNextButton = 1;
      }
    } else {
      let tNextBlend = 40;
      let tPrevBlend = 40;
    }
    if (tWndObj.elementExists("ctlg_page_text")) {
      let tPage = getText("catalog_page", "page");
      tWndObj.getElement("ctlg_page_text").setText(tPage);
    }
    let tID = "ctlg_nextpage_button";
    if (tWndObj.elementExists(tID)) {
      let tElem = tWndObj.getElement(tID);
      if (tNextButton) {
        tElem.Activate(this);
        tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
      } else {
        tElem.deactivate(this);
        tElem.setProperty(Symbol.for("cursor"), 0);
      }
    }
    tID = "ctlg_prevpage_button";
    if (tWndObj.elementExists(tID)) {
      let tElem = tWndObj.getElement(tID);
      if (tPrevButton) {
        tElem.Activate(this);
        tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
      } else {
        tElem.deactivate(this);
        tElem.setProperty(Symbol.for("cursor"), 0);
      }
    }
  }

  ShowSmallIcons(tstate, tPram) {
    if (!windowExists(this.pCatalogID)) {
      return;
    }
    let tWndObj = getWindow(this.pCatalogID);
    let tFirst;
    let tLast;
    switch (tstate) {
      case VOID:
        tFirst = this.pProductOffset + 1;
        tLast = tFirst + this.pProductPerPage;
        if (tLast > this.pCurrentPageData["productList"].count) {
          tLast = this.pCurrentPageData["productList"].count;
        }
        for (let f = 1; f <= this.pProductPerPage; f++) {
          let tID = `${"ctlg_small_img_"}${f}`;
          if (tWndObj.elementExists(tID)) {
            let tElem = tWndObj.getElement(tID);
            tElem.clearImage();
            tElem.setProperty(Symbol.for("cursor"), 0);
          }
        }
        break;
      case Symbol.for("hilite"):
      case Symbol.for("unhilite"):
        tFirst = tPram;
        tLast = tPram;
        break;
      default:
        return error(this, "unsupported mode", Symbol.for("ShowSmallIcons"), Symbol.for("minor"));
    }
    if (voidp(tFirst) || voidp(tLast)) {
      return;
    }
    if ((tFirst < 1) || (tLast < 1)) {
      return;
    }
    let tCount = 1;
    for (let f = tFirst; f <= tLast; f++) {
      if (!voidp(this.pCurrentPageData["productList"][f]["smallPrewImg"])) {
        let tmember = this.pCurrentPageData["productList"][f]["smallPrewImg"];
        let tClass = this.pCurrentPageData["productList"][f]["class"];
        let tpartColors = this.pCurrentPageData["productList"][f]["partColors"];
        let tDealNumber = this.pCurrentPageData["productList"][f]["dealNumber"];
        let tDealList = this.pCurrentPageData["productList"][f]["dealList"];
        let tID = `${"ctlg_small_img_"}${f - this.pProductOffset}`;
        if ((tmember != 0) || (!voidp(tDealNumber) && listp(tDealList))) {
          if (tWndObj.elementExists(tID)) {
            let tElem = tWndObj.getElement(tID);
            let tBgImage;
            if (!voidp(tstate)) {
              if ((tstate == Symbol.for("hilite")) && memberExists("ctlg_small_active_bg")) {
                tBgImage = getMember("ctlg_small_active_bg").image;
              }
            }
            let tWid = tElem.getProperty(Symbol.for("width"));
            let tHei = tElem.getProperty(Symbol.for("height"));
            let tRenderedImage;
            if (tClass != EMPTY) {
              tRenderedImage = getObject("Preview_renderer").renderPreviewImage(VOID, VOID, tpartColors, tClass);
            } else {
              if (tmember != 0) {
                tRenderedImage = member(tmember).image;
              } else {
                let tObj;
                if (!objectExists("ctlg_dealpreviewObj")) {
                  tObj = createObject("ctlg_dealpreviewObj", ["Deal Preview Class"]);
                  if (tObj == 0) {
                    return error(this, "Failed object creation!", Symbol.for("showHideDialog"), Symbol.for("major"));
                  }
                } else {
                  tObj = getObject("ctlg_dealpreviewObj");
                }
                tRenderedImage = tObj.renderDealPreviewImage(tDealNumber, tDealList, tWid, tHei);
              }
            }
            let tCenteredImage = image(tWid, tHei, 32);
            if (tBgImage != VOID) {
              tCenteredImage.copyPixels(tBgImage, tBgImage.rect, tBgImage.rect);
            }
            let tMatte = tRenderedImage.createMatte();
            let tXchange = (tCenteredImage.width - tRenderedImage.width) / 2;
            let tYchange = (tCenteredImage.height - tRenderedImage.height) / 2;
            let tRect1 = tRenderedImage.rect + rect(tXchange, tYchange, tXchange, tYchange);
            tCenteredImage.copyPixels(tRenderedImage, tRect1, tRenderedImage.rect, propList("maskImage", tMatte, "ink", 41));
            tElem.feedImage(tCenteredImage);
            tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
            tCount = tCount + 1;
          }
        }
      }
    }
  }

  showPreviewImage(tProps, tElemID) {
    if (!windowExists(this.pCatalogID)) {
      return 0;
    }
    let tWndObj = getWindow(this.pCatalogID);
    if (voidp(tElemID)) {
      tElemID = "ctlg_teaserimg_1";
    }
    if (!tWndObj.elementExists(tElemID)) {
      return;
    }
    if (tProps.ilk != Symbol.for("propList")) {
      return;
    }
    let tElem = tWndObj.getElement(tElemID);
    if (voidp(tProps["prewImage"])) {
      tProps["prewImage"] = 0;
    }
    let tImage;
    if (tProps["prewImage"] > 0) {
      tImage = member(tProps["prewImage"]).image;
    } else {
      if (!voidp(tProps["dealList"])) {
        let tObj;
        if (!objectExists("ctlg_dealpreviewObj")) {
          tObj = createObject("ctlg_dealpreviewObj", ["Deal Preview Class"]);
          if (tObj == 0) {
            return error(this, "Failed object creation!", Symbol.for("showHideDialog"), Symbol.for("major"));
          }
        } else {
          tObj = getObject("ctlg_dealpreviewObj");
        }
        tObj.define(tProps["dealList"]);
        tImage = tObj.getPicture();
      } else {
        if (voidp(tProps["class"])) {
          return error(this, "Class property missing", Symbol.for("showPreviewImage"), Symbol.for("minor"));
        } else {
          let tClass = tProps["class"];
        }
        if (voidp(tProps["direction"])) {
          return error(this, "Direction property missing", Symbol.for("showPreviewImage"), Symbol.for("minor"));
        } else {
          tProps["direction"] = "2,2,2";
          let tDirection = value(`[${tProps["direction"]}]`);
          if (tDirection.count < 3) {
            tDirection = list(0, 0, 0);
          }
        }
        if (voidp(tProps["dimensions"])) {
          return error(this, "Dimensions property missing", Symbol.for("showPreviewImage"), Symbol.for("minor"));
        } else {
          let tDimensions = value(`[${tProps["dimensions"]}]`);
          if (tDimensions.count < 2) {
            tDimensions = list(1, 1);
          }
        }
        if (voidp(tProps["partColors"])) {
          return error(this, "PartColors property missing", Symbol.for("showPreviewImage"), Symbol.for("minor"));
        } else {
          let tpartColors = tProps["partColors"];
          if ((tpartColors == EMPTY) || (tpartColors == "0,0,0")) {
            tpartColors = "*ffffff";
          }
        }
        if (voidp(tProps["objectType"])) {
          return error(this, "objectType property missing", Symbol.for("showPreviewImage"), Symbol.for("minor"));
        } else {
          let tObjectType = tProps["objectType"];
        }
        let tdata = propList();
        tdata[Symbol.for("id")] = "ctlg_previewObj";
        tdata[Symbol.for("class")] = tClass;
        tdata[Symbol.for("name")] = tClass;
        tdata[Symbol.for("custom")] = tClass;
        tdata[Symbol.for("direction")] = tDirection;
        tdata[Symbol.for("dimensions")] = tDimensions;
        tdata[Symbol.for("colors")] = tpartColors;
        tdata[Symbol.for("objectType")] = tObjectType;
        let tObj;
        if (!objectExists("ctlg_previewObj")) {
          tObj = createObject("ctlg_previewObj", ["Product Preview Class"]);
          if (tObj == 0) {
            return error(this, "Failed object creation!", Symbol.for("showHideDialog"), Symbol.for("major"));
          }
        } else {
          tObj = getObject("ctlg_previewObj");
        }
        tObj.define(tdata.duplicate());
        tImage = tObj.getPicture();
      }
    }
    if (tImage.ilk == Symbol.for("image")) {
      let tDestImg = tElem.getProperty(Symbol.for("image"));
      let tSourceImg = tImage;
      tDestImg.fill(tDestImg.rect, rgb(255, 255, 255));
      let tdestrect = tDestImg.rect - tSourceImg.rect;
      let tMargins = rect(0, 0, 0, 0);
      tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tSourceImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tSourceImg.height) + tMargins;
      tDestImg.copyPixels(tSourceImg, tdestrect, tSourceImg.rect, propList("ink", 36));
      tElem.feedImage(tDestImg);
    }
    return 1;
  }

  renderPageList(tPages) {
    if (variableExists("cat_index_marginv")) {
      let tIndexVertMargin = getVariable("cat_index_marginv");
    } else {
      let tIndexVertMargin = 0;
    }
    if (!windowExists(this.pCatalogID)) {
      return error(this, "Failed to render the list of Catalogue pages!!!", Symbol.for("renderPageList"), Symbol.for("major"));
    }
    let tWndObj = getWindow(this.pCatalogID);
    if (!tWndObj.elementExists("ctlg_pages")) {
      return error(this, "Element not exists, failed to render Catalogue index!", Symbol.for("renderPageList"), Symbol.for("major"));
    }
    let tElem = tWndObj.getElement("ctlg_pages");
    let tWidth = tElem.getProperty(Symbol.for("width"));
    let tHeight = tElem.getProperty(Symbol.for("height"));
    let tBgColor = rgb("#DDDDDD");
    let tLeftMarg = 6;
    let tWriteObj = getWriter(this.pWriterPages);
    let tVerticMarg = ((this.pPageLineHeight - tWriteObj.getFont()[Symbol.for("lineHeight")]) / 2) + tIndexVertMargin;
    let tPageCounter;
    if (tPages.ilk == Symbol.for("propList")) {
      tPageCounter = tPages.count;
    } else {
      tPageCounter = 0;
    }
    let tImgHeight = (this.pPageLineHeight * tPageCounter) + 1;
    if (tImgHeight < tHeight) {
      tImgHeight = tHeight;
    }
    this.pPageListImg = image(tWidth - tLeftMarg, tImgHeight, 8);
    this.pPageListImg.fill(rect(0, 0, this.pPageListImg.width, this.pPageListImg.height), tBgColor);
    this.pPageListImg.draw(rect(0, 0, this.pPageListImg.width, 1), propList("shapeType", Symbol.for("rect"), "lineSize", 1, "color", rgb("#AAAAAA")));
    if (tPages.ilk == Symbol.for("propList")) {
      for (let f = 1; f <= tPages.count; f++) {
        let tText = tPages[f];
        let tPageImg = tWriteObj.render(tText).duplicate();
        let tX1 = tLeftMarg;
        let tX2 = tX1 + tPageImg.width;
        let tY1 = tVerticMarg + (this.pPageLineHeight * (f - 1)) + 1;
        let tY2 = tY1 + tPageImg.height;
        let tDstRect = rect(tX1, tY1, tX2, tY2);
        this.pPageListImg.copyPixels(tPageImg, tDstRect, tPageImg.rect);
        this.pPageListImg.draw(rect(0, this.pPageLineHeight * f, this.pPageListImg.width, (this.pPageLineHeight * f) + 1), propList("shapeType", Symbol.for("rect"), "lineSize", 1, "color", rgb("#AAAAAA")));
      }
    }
    let tLeftImg = member(getmemnum("ctlg.pagelist.left")).image;
    this.pPageListImg.copyPixels(tLeftImg, rect(0, 0, tLeftImg.width, this.pPageListImg.height), tLeftImg.rect);
    tElem.feedImage(this.pPageListImg.duplicate());
  }

  renderSelectPage(tClickLine, tLastSelectLine) {
    if (!windowExists(this.pCatalogID)) {
      return error(this, "Catalogue window not exists", Symbol.for("renderSelectPage"), Symbol.for("major"));
    }
    let tWndObj = getWindow(this.pCatalogID);
    let tScrollOffset = 0;
    if (tWndObj.elementExists("ctlg_pages_scroll")) {
      tScrollOffset = tWndObj.getElement("ctlg_pages_scroll").getScrollOffset();
    }
    let tIndexVertMargin;
    if (variableExists("cat_index_marginv")) {
      tIndexVertMargin = getVariable("cat_index_marginv");
    } else {
      tIndexVertMargin = 0;
    }
    let tElem = tWndObj.getElement("ctlg_pages");
    let tImg = tElem.getProperty(Symbol.for("image"));
    let tY1 = ((tClickLine - 1) * this.pPageLineHeight) + 1;
    let tY2 = tY1 + this.pPageLineHeight - 1;
    tImg.fill(rect(0, tY1, tImg.width, tY2), rgb("#EEEEEE"));
    let tLeftImg = member(getmemnum("ctlg.pagelist.left.active")).image;
    tImg.copyPixels(tLeftImg, rect(0, tY1, tLeftImg.width, tY2), tLeftImg.rect);
    let tWriteObj = getWriter(this.pWriterPages);
    let tVerticMarg = (this.pPageLineHeight - tWriteObj.getFont()[Symbol.for("lineHeight")]) / 2;
    let tLeftMarg = 6;
    let tText = this.pPagePropList[tClickLine];
    let tPageImg = tWriteObj.render(tText).duplicate();
    let tX1 = tLeftMarg;
    let tX2 = tX1 + tPageImg.width;
    tY1 = tVerticMarg + (this.pPageLineHeight * (tClickLine - 1)) + 1 + tIndexVertMargin;
    tY2 = tY1 + tPageImg.height;
    let tDstRect = rect(tX1, tY1, tX2, tY2);
    tImg.copyPixels(tPageImg, tDstRect, tPageImg.rect);
    if (!voidp(tLastSelectLine)) {
      tY1 = ((tLastSelectLine - 1) * this.pPageLineHeight) + 1;
      tY2 = tY1 + this.pPageLineHeight - 1;
      tImg.copyPixels(this.pPageListImg, rect(0, tY1, tImg.width, tY2), rect(0, tY1, tImg.width, tY2));
    }
    tElem.feedImage(tImg);
    if ((tScrollOffset > 0) && tWndObj.elementExists("ctlg_pages_scroll")) {
      tWndObj.getElement("ctlg_pages_scroll").setScrollOffset(tScrollOffset);
    }
  }

  selectPage(tClickLine) {
    if (this.pPagePropList.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect PagePropList", Symbol.for("selectPage"), Symbol.for("major"));
    }
    if ((tClickLine > this.pPagePropList.count) || (tClickLine < 1)) {
      return error(this, "Failed to select Catalogue page!!!", Symbol.for("selectPage"), Symbol.for("minor"));
    }
    let tPageID = this.pPagePropList.getPropAt(tClickLine);
    let tLastSelectLine;
    if (!voidp(this.pActivePageID)) {
      if (tPageID == this.pActivePageID) {
        return 1;
      }
      tLastSelectLine = this.pPagePropList.findPos(this.pActivePageID);
    }
    this.renderSelectPage(tClickLine, tLastSelectLine);
    this.pActivePageID = tPageID;
    this.pLoadingFlag = 1;
    let tStatus = this.getComponent().retrieveCataloguePage(tPageID);
    if (tStatus) {
      if (objectExists(this.pLoaderObjID)) {
        getObject(this.pLoaderObjID).showLoadingScreen();
      }
    }
  }

  changeProductOffset(tDirection) {
    if (voidp(this.pCurrentPageData["productList"].count)) {
      return;
    }
    if (this.pProductPerPage >= this.pCurrentPageData["productList"].count) {
      return;
    }
    if (tDirection == 1) {
      if ((this.pProductOffset + this.pProductPerPage) < this.pCurrentPageData["productList"].count) {
        this.pProductOffset = this.pProductOffset + this.pProductPerPage;
      }
    } else {
      this.pProductOffset = this.pProductOffset - this.pProductPerPage;
      if (this.pProductOffset < 0) {
        this.pProductOffset = 0;
      }
    }
    this.ShowSmallIcons();
    this.showProductPageCounter();
  }

  changeLinkPage(tDirection) {
    if (!voidp(this.pPageLinkList)) {
      let tID = this.pCurrentPageData["id"];
      let tPos = this.pPageLinkList.findPos(tID);
      if (tPos > 0) {
        let tPageNum = tPos + tDirection;
        if (tPageNum < 1) {
          tPageNum = 1;
        }
        if (tPageNum > this.pPageLinkList.count) {
          tPageNum = this.pPageLinkList.count;
        }
        if (tPos != tPageNum) {
          let tPageID = this.pPageLinkList[tPageNum];
          this.pLoadingFlag = 1;
          let tStatus = this.getComponent().retrieveCataloguePage(tPageID);
          if (tStatus) {
            if (objectExists(this.pLoaderObjID)) {
              getObject(this.pLoaderObjID).showLoadingScreen();
            }
          }
        }
      }
    }
  }

  selectProduct(tOrderNum, tFeedFlag) {
    if (!windowExists(this.pCatalogID)) {
      return error(this, "Catalogue window not exists", Symbol.for("selectProduct"), Symbol.for("major"));
    }
    let tWndObj = getWindow(this.pCatalogID);
    if (!integerp(tOrderNum)) {
      return error(this, "Incorrect value", Symbol.for("selectProduct"), Symbol.for("major"));
    }
    if (voidp(this.pCurrentPageData["productList"])) {
      return 0;
    }
    let tProductNum = tOrderNum + this.pProductOffset;
    if (tProductNum == this.pLastProductNum) {
      return 0;
    }
    if (tProductNum > this.pCurrentPageData["productList"].count) {
      return 0;
    }
    this.pSelectedProduct = this.pCurrentPageData["productList"][tProductNum];
    if (this.pSelectedProduct.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect product data", Symbol.for("selectProduct"), Symbol.for("major"));
    }
    if (voidp(tFeedFlag)) {
      tFeedFlag = 0;
    }
    if (!tFeedFlag) {
      return 1;
    }
    this.showPreviewImage(this.pSelectedProduct);
    if (!voidp(this.pSelectedProduct["name"])) {
      if (tWndObj.elementExists("ctlg_product_name")) {
        tWndObj.getElement("ctlg_product_name").setText(this.pSelectedProduct["name"]);
      }
    }
    if (!voidp(this.pSelectedProduct["description"])) {
      if (tWndObj.elementExists("ctlg_description")) {
        tWndObj.getElement("ctlg_description").setText(this.pSelectedProduct["description"]);
      }
    }
    if (tWndObj.elementExists("ctlg_price_box")) {
      tWndObj.getElement("ctlg_price_box").setProperty(Symbol.for("visible"), 1);
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
    this.ShowSmallIcons(Symbol.for("hilite"), tProductNum);
    this.ShowSmallIcons(Symbol.for("unhilite"), this.pLastProductNum);
    this.hideSpecialText();
    if (!voidp(this.pSelectedProduct["specialText"])) {
      this.showSpecialText(this.pSelectedProduct["specialText"]);
    }
    this.pLastProductNum = tProductNum;
    return 1;
  }

  hideAllWindows() {
    this.hideCatalogue();
    this.hideOrderInfo();
    this.hidePurchaseOk();
  }

  updatePurseSaldo() {
    let tWndObj = this.getCatalogWindow();
    if (objectp(tWndObj)) {
      if (tWndObj.elementExists("catalog_credits_bottom")) {
        let tSaldo;
        if (getObject(Symbol.for("session")).exists("user_walletbalance")) {
          tSaldo = getObject(Symbol.for("session")).GET("user_walletbalance");
        } else {
          tSaldo = "-";
        }
        let tText = getText("catalog_coins_amount");
        tText = replaceChunks(tText, "%amount%", tSaldo);
        tWndObj.getElement("catalog_credits_bottom").setText(tText);
      }
    }
  }

  eventProcCatalogue(tEvent, tSprID, tParam) {
    let tloc = the.mouseLoc;
    if ((tSprID != "close") && this.pLoadingFlag) {
      return 0;
    }
    let tClassEventFlag = 0;
    if (objectExists(this.pPageProgramID)) {
      if (getObject(this.pPageProgramID).handler(Symbol.for("eventProc"))) {
        tClassEventFlag = getObject(this.pPageProgramID).eventProc(tEvent, tSprID, tParam);
      }
    }
    if (tClassEventFlag) {
      return 0;
    }
    if (tEvent == Symbol.for("mouseUp")) {
      if (tSprID == "close") {
        this.hideCatalogue();
      }
    }
    if (tEvent == Symbol.for("mouseDown")) {
      if (tSprID == "ctlg_pages") {
        if (this.pPagePropList.ilk != Symbol.for("propList")) {
          return;
        }
        if (!ilk(tParam, Symbol.for("point")) || (this.pPagePropList.count == 0)) {
          return;
        }
        let tClickLine = integer(tParam.locV / this.pPageLineHeight) + 1;
        this.selectPage(tClickLine);
      } else if (tSprID == "ctlg_next_button") {
        this.changeProductOffset(1);
      } else if (tSprID == "ctlg_prev_button") {
        this.changeProductOffset(-1);
      } else if (tSprID == "ctlg_nextpage_button") {
        this.changeLinkPage(1);
      } else if (tSprID == "ctlg_prevpage_button") {
        this.changeLinkPage(-1);
      } else {
        if (tSprID.contains("ctlg_small_img_")) {
          let tItemDeLimiter = the.itemDelimiter;
          the.itemDelimiter = "_";
          let tProductOrderNum = integer(tSprID.item[tSprID.item.count]);
          the.itemDelimiter = tItemDeLimiter;
          this.selectProduct(tProductOrderNum, 1);
        } else if (tSprID == "ctlg_buy_button") {
          getThread(Symbol.for("catalogue")).getComponent().checkProductOrder(this.pSelectedProduct);
        } else if (tSprID == "ctlg_collectibles_link") {
          if (variableExists("link.format.collectibles")) {
            openNetPage(getVariable("link.format.collectibles"));
            executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          }
        } else {
          if (tSprID.contains("ctlg_buy_")) {
            let tItemDeLimiter = the.itemDelimiter;
            the.itemDelimiter = "_";
            let tProductOrderNum = integer(tSprID.item[tSprID.item.count]);
            the.itemDelimiter = tItemDeLimiter;
            if (this.selectProduct(tProductOrderNum, 0)) {
              getThread(Symbol.for("catalogue")).getComponent().checkProductOrder(this.pSelectedProduct);
            }
          } else {
            if (tSprID.contains("catalog_get_credits_bottom")) {
              executeMessage(Symbol.for("externalLinkClick"), tloc);
              openNetPage(getText("url_purselink"));
            } else {
              nothing();
            }
          }
        }
      }
    }
  }

  eventProcInfoWnd(tEvent, tSprID, tParam, tWndID) {
    switch (tSprID) {
      case "habbo_decision_ok":
      case "habbo_message_ok":
      case "button_ok":
        if (this.pActiveOrderCode == EMPTY) {
          removeWindow(this.pInfoWindowID);
          return 1;
        }
        let tWndObj = getWindow(this.pInfoWindowID);
        let tGiftProps = propList();
        if (tWndObj.elementExists("shopping_gift_target")) {
          tGiftProps["gift"] = 1;
          tGiftProps["gift_receiver"] = tWndObj.getElement("shopping_gift_target").getText();
          tGiftProps["gift_msg"] = tWndObj.getElement("shopping_greeting_field").getText();
          if (tGiftProps["gift_receiver"] == EMPTY) {
            return error(this, "User name missing!", Symbol.for("eventProcInfoWnd"), Symbol.for("minor"));
          }
        } else {
          tGiftProps["gift"] = 0;
          tGiftProps["gift_receiver"] = EMPTY;
          tGiftProps["gift_msg"] = EMPTY;
        }
        this.getComponent().purchaseProduct(tGiftProps);
        this.hideOrderInfo();
        this.pActiveOrderCode = EMPTY;
        break;
      case "habbo_decision_cancel":
      case "button_cancel":
      case "close":
        this.hideOrderInfo();
        this.pActiveOrderCode = EMPTY;
        break;
      case "buy_gift_ok":
        if (getWindow(tWndID).getElement(tSprID).getProperty(Symbol.for("blend")) == 100) {
          this.showBuyAsGift(1);
        }
        break;
      case "buy_gift_cancel":
        this.showBuyAsGift(0);
        break;
      case "nobalance_ok":
        {
          if (!textExists("url_nobalance")) {
            return 0;
          }
          let tSession = getObject(Symbol.for("session"));
          let tURL = getText("url_nobalance");
          tURL = `${tURL}${urlEncode(tSession.GET(Symbol.for("userName")))}`;
          if (tSession.exists("user_checksum")) {
            tURL = `${tURL}&sum=${urlEncode(tSession.GET("user_checksum"))}`;
          }
          executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          openNetPage(tURL);
          this.hideOrderInfo();
          this.pActiveOrderCode = EMPTY;
          break;
        }
      case "subscribe":
        {
          let tSession = getObject(Symbol.for("session"));
          let tOwnName = tSession.GET(Symbol.for("userName"));
          let tURL = getText("url_subscribe");
          tURL = `${tURL}${urlEncode(tOwnName)}`;
          if (tSession.exists("user_checksum")) {
            tURL = `${tURL}&sum=${urlEncode(tSession.GET("user_checksum"))}`;
          }
          executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
          openNetPage(tURL, "_new");
          this.hideOrderInfo();
          break;
        }
    }
    return 1;
  }

  eventProcKeyDown(tEvent, tSprID, tParam) {
    if (the.key == TAB) {
      if (!windowExists(this.pInfoWindowID)) {
        return 0;
      }
      let tWndObj = getWindow(this.pInfoWindowID);
      if (tSprID == "shopping_greeting_field") {
        let tElem = tWndObj.getElement("shopping_gift_target");
        if (objectp(tElem)) {
          tElem.setFocus(1);
        }
      } else {
        let tElem = tWndObj.getElement("shopping_greeting_field");
        if (objectp(tElem)) {
          tElem.setFocus(1);
        }
      }
    } else {
      pass();
    }
  }
}
