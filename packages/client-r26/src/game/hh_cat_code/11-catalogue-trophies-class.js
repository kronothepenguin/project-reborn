export default class {
  pPageData;
  pSmallImg;
  pSelectedOrderNum;
  pSelectedColorNum;
  pSelectedProduct;
  pLastProductNum;
  pNumOfColorBoxies;
  pCurrentProductNum;

  construct() {
    let tCataloguePage = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tCataloguePage) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("construct"), Symbol.for("major"));
    }
    this.pPageData = propList();
    this.pSmallImg = image(32, 32, 32);
    this.pSelectedOrderNum = 1;
    this.pSelectedColorNum = 1;
    this.pLastProductNum = 0;
    this.pNumOfColorBoxies = 0;
    for (let f = 1; f <= 50; f++) {
      let tID = `${"ctlg_selectcolor_bg_"}${f}`;
      if (tCataloguePage.elementExists(tID)) {
        this.pNumOfColorBoxies = this.pNumOfColorBoxies + 1;
        continue;
      }
      break;
    }
    if (tCataloguePage.elementExists("trophies_habbo_name")) {
      let tUserName = getObject(Symbol.for("session")).GET(Symbol.for("userName"));
      tCataloguePage.getElement("trophies_habbo_name").setText(tUserName);
    }
    registerMessage(Symbol.for("serverDate"), this.getID(), Symbol.for("setDate"));
    if (objectExists(Symbol.for("getServerDate"))) {
      getObject(Symbol.for("getServerDate")).getDate();
    }
    return 1;
  }

  define(tPageProps) {
    if (tPageProps.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect Catalogue page data", Symbol.for("define"), Symbol.for("major"));
    }
    this.pPageData = propList();
    this.pPageData.sort();
    if (!voidp(tPageProps["productList"])) {
      let tProducts = tPageProps["productList"];
      for (let f = 1; f <= tProducts.count; f++) {
        if (!voidp(tProducts[f]["class"])) {
          let tClass = tProducts[f]["class"];
          if (tClass.contains("*")) {
            tClass = tClass.char[`${1}..${offset("*", tClass) - 1}`];
          }
          if (voidp(this.pPageData[tClass])) {
            this.pPageData[tClass] = propList();
            this.pPageData[tClass].sort();
          }
          this.pPageData[tClass].addProp(tProducts[f]["class"], tProducts[f]);
        }
      }
    }
    if (this.pPageData.count > 1) {
      this.pSelectedOrderNum = 1;
      this.pSelectedColorNum = 1;
      this.renderSmallIcons();
      this.selectProduct(1);
      this.renderProductColors(1);
    }
  }

  setDate(tDate) {
    let tCataloguePage = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tCataloguePage) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("construct"), Symbol.for("major"));
    }
    if (stringp(tDate)) {
      if (tCataloguePage.elementExists("trophies_date")) {
        if (objectExists(Symbol.for("dateFormatter"))) {
          tDate = getObject(Symbol.for("dateFormatter")).getLocalDateFromStr(tDate);
        }
        tCataloguePage.getElement("trophies_date").setText(tDate);
      }
    }
  }

  renderSmallIcons(tstate, tPram) {
    let tCataloguePage = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tCataloguePage) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("renderSmallIcons"), Symbol.for("major"));
    }
    let tWndObj = tCataloguePage;
    let tFirst;
    let tLast;
    switch (tstate) {
      case VOID:
        tFirst = 1;
        tLast = this.pPageData.count;
        for (let f = 1; f <= this.pPageData.count; f++) {
          let tID = `${"ctlg_small_img_"}${f}`;
          if (tWndObj.elementExists(tID)) {
            tWndObj.getElement(tID).clearImage();
            tWndObj.getElement(tID).setProperty(Symbol.for("ink"), 36);
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
    for (let f = tFirst; f <= tLast; f++) {
      if (!voidp(this.pPageData[f][1]["smallPrewImg"])) {
        let tmember = this.pPageData[f][1]["smallPrewImg"];
        let tID = `${"ctlg_small_img_"}${f}`;
        if (tmember != 0) {
          if (tWndObj.elementExists(tID)) {
            this.pSmallImg.fill(this.pSmallImg.rect, rgb(255, 255, 255));
            if (!voidp(tstate)) {
              if ((tstate == Symbol.for("hilite")) && memberExists("ctlg_small_active2_bg")) {
                let tBgImage = member("ctlg_small_active2_bg").image;
                this.pSmallImg.copyPixels(tBgImage, tBgImage.rect, this.pSmallImg.rect);
              }
            }
            let tTempSmallImg = member(tmember).image;
            let tdestrect = this.pSmallImg.rect - tTempSmallImg.rect;
            let tMargins = rect(0, 0, 0, 0);
            tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tTempSmallImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tTempSmallImg.height) + tMargins;
            this.pSmallImg.copyPixels(tTempSmallImg, tdestrect, tTempSmallImg.rect, propList("ink", 36));
            tWndObj.getElement(tID).clearImage();
            tWndObj.getElement(tID).feedImage(this.pSmallImg);
          }
        }
      }
    }
  }

  renderProductColors(tOrderNum) {
    if (!integerp(tOrderNum)) {
      return error(this, "Incorrect value", Symbol.for("renderProductColors"), Symbol.for("major"));
    }
    if (this.pPageData.ilk != Symbol.for("propList")) {
      return error(this, "page data not found", Symbol.for("renderProductColors"), Symbol.for("major"));
    }
    let tCataloguePage = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tCataloguePage) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("construct"), Symbol.for("major"));
    }
    let tWndObj = tCataloguePage;
    for (let f = 1; f <= this.pNumOfColorBoxies; f++) {
      let tID = `${"ctlg_selectcolor_bg_"}${f}`;
      if (tCataloguePage.elementExists(tID)) {
        let tColor = paletteIndex(0);
        tWndObj.getElement(tID).setProperty(Symbol.for("bgColor"), tColor);
        tWndObj.getElement(tID).setProperty(Symbol.for("blend"), 30);
      }
      tID = `${"ctlg_selectcolor_"}${f}`;
      if (tCataloguePage.elementExists(tID)) {
        tWndObj.getElement(tID).setProperty(Symbol.for("blend"), 30);
      }
    }
    if (tOrderNum <= this.pPageData.count) {
      let tProducts = this.pPageData[tOrderNum];
      for (let f = 1; f <= tProducts.count; f++) {
        if (!voidp(tProducts[f]["partColors"])) {
          let tItemDeLimiter = the.itemDelimiter;
          the.itemDelimiter = ",";
          let tColor = tProducts[f]["partColors"].item[tProducts[f]["partColors"].item.count];
          the.itemDelimiter = tItemDeLimiter;
          if (tColor.char[1] == "#") {
            tColor = rgb(tColor);
          } else {
            tColor = paletteIndex(integer(tColor));
          }
          let tID = `${"ctlg_selectcolor_bg_"}${f}`;
          if (tWndObj.elementExists(tID)) {
            tWndObj.getElement(tID).setProperty(Symbol.for("bgColor"), tColor);
            tWndObj.getElement(tID).setProperty(Symbol.for("blend"), 100);
          }
          tID = `${"ctlg_selectcolor_"}${f}`;
          if (tCataloguePage.elementExists(tID)) {
            tWndObj.getElement(tID).setProperty(Symbol.for("blend"), 100);
          }
        }
      }
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
    if (tOrderNum > this.pPageData.count) {
      return;
    }
    if (voidp(this.pPageData[tOrderNum][1])) {
      return;
    }
    this.pSelectedProduct = this.pPageData[tOrderNum][1];
    this.pSelectedColorNum = 1;
    this.pSelectedOrderNum = tOrderNum;
    this.renderProductColors(tOrderNum);
    getThread(Symbol.for("catalogue")).getInterface().showPreviewImage(this.pSelectedProduct);
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
    this.renderSmallIcons(Symbol.for("hilite"), tOrderNum);
    this.renderSmallIcons(Symbol.for("unhilite"), this.pLastProductNum);
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
    this.pSelectedColorNum = 1;
    this.selectProduct(tNext);
    this.renderProductColors(tNext);
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
    this.pSelectedColorNum = 1;
    this.selectProduct(tPrev);
    this.renderProductColors(tPrev);
  }

  selectColor(tOrderNum) {
    if (voidp(this.pSelectedOrderNum)) {
      return;
    }
    let tCataloguePage = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
    if (!tCataloguePage) {
      return error(this, "Couldn't access catalogue window!", Symbol.for("selectColor"), Symbol.for("major"));
    }
    let tWndObj = tCataloguePage;
    if (!integerp(this.pSelectedOrderNum)) {
      return error(this, "Incorrect SelectedOrderNum", Symbol.for("selectColor"), Symbol.for("major"));
    }
    if (!integerp(tOrderNum)) {
      return error(this, "Incorrect value", Symbol.for("selectColor"), Symbol.for("major"));
    }
    if (voidp(this.pPageData)) {
      return error(this, "product not found", Symbol.for("selectColor"), Symbol.for("major"));
    }
    if (voidp(this.pPageData[this.pSelectedOrderNum])) {
      return;
    }
    if (tOrderNum > this.pPageData[this.pSelectedOrderNum].count) {
      return;
    }
    this.pSelectedColorNum = tOrderNum;
    this.pSelectedProduct = this.pPageData[this.pSelectedOrderNum][this.pSelectedColorNum];
    getThread(Symbol.for("catalogue")).getInterface().showPreviewImage(this.pSelectedProduct);
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
  }

  eventProc(tEvent, tSprID, tProp) {
    if (tEvent == Symbol.for("mouseUp")) {
      if (tSprID == "close") {
        return 0;
      }
    }
    if (tEvent == Symbol.for("mouseDown")) {
      if (tSprID.contains("ctlg_small_img_")) {
        let tItemDeLimiter = the.itemDelimiter;
        the.itemDelimiter = "_";
        let tProductOrderNum = integer(tSprID.item[tSprID.item.count]);
        the.itemDelimiter = tItemDeLimiter;
        this.selectProduct(tProductOrderNum);
      } else {
        if (tSprID == "ctlg_nextmodel_button") {
          this.nextProduct();
        } else if (tSprID == "ctlg_prevmodel_button") {
          this.prevProduct();
        } else {
          if ((tSprID.contains("ctlg_selectcolor_")) || (tSprID.contains("ctlg_selectcolor_bg_10"))) {
            let tItemDeLimiter = the.itemDelimiter;
            the.itemDelimiter = "_";
            let tOrderNum = integer(tSprID.item[tSprID.item.count]);
            the.itemDelimiter = tItemDeLimiter;
            this.selectColor(tOrderNum);
          } else {
            if (tSprID == "ctlg_buy_button") {
              let tWndObj = getThread(Symbol.for("catalogue")).getInterface().getCatalogWindow();
              let tText = EMPTY;
              if (tWndObj.elementExists("dedication_text")) {
                tText = tWndObj.getElement("dedication_text").getText();
                tText = replaceChunks(tText, RETURN, "\r");
              }
              if (tText.length < 1) {
                return executeMessage(Symbol.for("alert"), propList("Msg", "catalog_give_trophymsg", "id", "ctlg_trophymsg"));
              } else {
                if (tText.length > 150) {
                  return executeMessage(Symbol.for("alert"), propList("Msg", "catalog_length_trophymsg", "id", "ctlg_trophymsg"));
                }
              }
              if (this.pSelectedProduct.ilk != Symbol.for("propList")) {
                return error(this, "incorrect Selected Product Data", Symbol.for("eventProc"), Symbol.for("major"));
              }
              this.pSelectedProduct["extra_parm"] = tText;
              getThread(Symbol.for("catalogue")).getComponent().checkProductOrder(this.pSelectedProduct);
            } else {
              return 0;
            }
          }
        }
      }
    }
    return 1;
  }
}
