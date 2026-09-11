export default class {
  pLoadingProps;
  pCatalogProps;
  pProductOrderData;
  pLastSelectedPageID;
  pImageLibraryURL;

  construct() {
    this.pOrderInfoList = list();
    this.pCatalogProps = propList();
    this.pProductOrderData = propList();
    this.pLoadingProps = propList();
    this.pLastSelectedPageID = VOID;
    if (variableExists("ctlg.editmode")) {
      this.pCatalogProps["editmode"] = getVariable("ctlg.editmode");
    } else {
      this.pCatalogProps["editmode"] = "production";
    }
    this.pImageLibraryURL = getVariable("image.library.url", "http://images.habbohotel.com/c_images/");
    registerMessage(Symbol.for("edit_catalogue"), this.getID(), Symbol.for("editModeOn"));
    return 1;
  }

  deconstruct() {
    this.pOrderInfoList = list();
    this.pCatalogProps = propList();
    this.pLoadingProps = propList();
    unregisterMessage(Symbol.for("edit_catalogue"), this.getID());
    return 1;
  }

  editModeOn() {
    setVariable("ctlg.editmode", "develop");
    this.pCatalogProps["editmode"] = getVariable("ctlg.editmode");
  }

  getLanguage() {
    if (variableExists("language")) {
      let tLanguage = getVariable("language");
    } else {
      let tLanguage = "en";
    }
    return tLanguage;
  }

  checkProductOrder(tProductProps) {
    if (tProductProps.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect SelectedProduct proplist", Symbol.for("checkProductOrder"), Symbol.for("major"));
    }
    if (!voidp(tProductProps["purchaseCode"])) {
      let tProps = propList();
      let tstate = "OK";
      if (!voidp(tProductProps["name"])) {
        tProps[Symbol.for("name")] = tProductProps["name"];
      } else {
        tProps[Symbol.for("name")] = "ERROR";
        tstate = "ERROR";
      }
      if (!voidp(tProductProps["purchaseCode"])) {
        tProps[Symbol.for("code")] = tProductProps["purchaseCode"];
      } else {
        tProps[Symbol.for("code")] = "ERROR";
        tstate = "ERROR";
      }
      if (!voidp(tProductProps["price"])) {
        tProps[Symbol.for("price")] = tProductProps["price"];
      } else {
        tProps[Symbol.for("price")] = "ERROR";
        tstate = "ERROR";
      }
      this.pProductOrderData = tProductProps.duplicate();
      this.getInterface().showOrderInfo(tstate, tProps);
      return 1;
    } else {
      this.pProductOrderData = propList();
      return 0;
    }
  }

  purchaseProduct(tGiftProps) {
    if (this.pProductOrderData.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect Product data", Symbol.for("purchaseProduct"), Symbol.for("major"));
    }
    if (tGiftProps.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect Gift Props", Symbol.for("purchaseProduct"), Symbol.for("major"));
    }
    if (voidp(this.pProductOrderData["name"])) {
      return error(this, "Product name not found", Symbol.for("purchaseProduct"), Symbol.for("major"));
    }
    if (voidp(this.pProductOrderData["purchaseCode"])) {
      return error(this, "PurchaseCode name not found", Symbol.for("purchaseProduct"), Symbol.for("major"));
    }
    if (voidp(this.pProductOrderData["extra_parm"])) {
      this.pProductOrderData["extra_parm"] = "-";
    }
    if (voidp(this.pCatalogProps["editmode"])) {
      return error(this, "Catalogue mode not found", Symbol.for("purchaseProduct"), Symbol.for("major"));
    }
    if (voidp(this.pCatalogProps["lastPageID"])) {
      return error(this, "Catalogue page id missing", Symbol.for("purchaseProduct"), Symbol.for("major"));
    }
    let tGift;
    if (!voidp(tGiftProps["gift"])) {
      tGift = `${tGiftProps["gift"]}${RETURN}`;
      if (!voidp(tGiftProps["gift_receiver"])) {
        tGift = `${tGift}${tGiftProps["gift_receiver"]}${RETURN}`;
      } else {
        tGift = EMPTY;
      }
      if (!voidp(tGiftProps["gift_msg"])) {
        let tGiftMsg = tGiftProps["gift_msg"];
        tGiftMsg = convertSpecialChars(tGiftMsg, 1);
        tGift = `${tGift}${tGiftMsg}${RETURN}`;
      } else {
        tGift = EMPTY;
      }
    } else {
      tGift = "0";
    }
    let tOrderStr = EMPTY;
    tOrderStr = `${tOrderStr}${this.pCatalogProps["editmode"]}${RETURN}`;
    tOrderStr = `${tOrderStr}${this.pCatalogProps["lastPageID"]}${RETURN}`;
    tOrderStr = `${tOrderStr}${this.getLanguage()}${RETURN}`;
    tOrderStr = `${tOrderStr}${this.pProductOrderData["purchaseCode"]}${RETURN}`;
    let tExtra = this.pProductOrderData["extra_parm"];
    tExtra = convertSpecialChars(tExtra, 1);
    tOrderStr = `${tOrderStr}${tExtra}${RETURN}`;
    tOrderStr = `${tOrderStr}${tGift}`;
    if (!connectionExists(getVariable("connection.info.id"))) {
      return 0;
    }
    return getConnection(getVariable("connection.info.id")).send("GPRC", tOrderStr);
  }

  retrieveCatalogueIndex() {
    let tEditmode;
    if (!voidp(this.pCatalogProps["editmode"])) {
      tEditmode = this.pCatalogProps["editmode"];
    } else {
      tEditmode = "production";
    }
    let tLanguage = this.getLanguage();
    if (!voidp(this.pCatalogProps["catalogueIndex"]) && (tEditmode != "develop")) {
      this.getInterface().saveCatalogueIndex(this.pCatalogProps["catalogueIndex"]);
    } else {
      if (connectionExists(getVariable("connection.info.id"))) {
        return getConnection(getVariable("connection.info.id")).send("GCIX", `${tEditmode}/${tLanguage}`);
      } else {
        return 0;
      }
    }
  }

  retrieveCataloguePage(tPageID) {
    let tEditmode;
    if (!voidp(this.pCatalogProps["editmode"])) {
      tEditmode = this.pCatalogProps["editmode"];
    } else {
      tEditmode = "production";
    }
    let tLanguage = this.getLanguage();
    this.pProductOrderData = VOID;
    this.pLastSelectedPageID = tPageID;
    if (!voidp(this.pCatalogProps[tPageID]) && (tEditmode != "develop")) {
      this.pCatalogProps["lastPageID"] = tPageID;
      this.getInterface().cataloguePageData(this.pCatalogProps[tPageID]);
    } else {
      if (connectionExists(getVariable("connection.info.id"))) {
        return getConnection(getVariable("connection.info.id")).send("GCAP", `${tEditmode}/${tPageID}/${tLanguage}`);
      } else {
        return 0;
      }
    }
    return 0;
  }

  purchaseReady(tStatus, tMsg) {
    switch (tStatus) {
      case "OK":
        this.getInterface().showPurchaseOk();
        break;
      case "NOBALANCE":
        this.getInterface().showNoBalance(VOID, 1);
        break;
      case "ERROR":
        error(this, "Purchase error:" && tMsg, Symbol.for("purchaseReady"), Symbol.for("major"));
        break;
      default:
        error(this, "Unsupported purchase result:" && tStatus && tMsg, Symbol.for("purchaseReady"), Symbol.for("major"));
    }
    return 1;
  }

  saveCatalogueIndex(tdata) {
    if (tdata.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect Catalogue Format", Symbol.for("saveCatalogueIndex"), Symbol.for("major"));
    }
    if (tdata.count == 0) {
      return 0;
    }
    this.pCatalogProps["catalogueIndex"] = tdata;
    this.getInterface().saveCatalogueIndex(tdata);
  }

  saveCataloguePage(tdata) {
    if (tdata.ilk != Symbol.for("propList")) {
      return error(this, "Incorrect Catalogue Page Format", Symbol.for("saveCataloguePage"), Symbol.for("major"));
    }
    if (tdata.count == 0) {
      return 0;
    }
    if (!voidp(tdata["id"])) {
      if (this.processCataloguePage(tdata)) {
        tdata = this.solveCatalogueMembers(tdata);
        let tPageID = tdata["id"];
        this.pCatalogProps[tPageID] = tdata;
        this.pCatalogProps["lastPageID"] = tPageID;
        this.getInterface().cataloguePageData(tdata);
      }
    } else {
      return error(this, "Catalogue Page ID missing", Symbol.for("saveCataloguePage"), Symbol.for("major"));
    }
  }

  solveCatalogueMembers(tdata) {
    let tLanguage = this.getLanguage();
    if (!voidp(tdata["headerImage"])) {
      if (memberExists(tdata["headerImage"])) {
        tdata["headerImage"] = getmemnum(tdata["headerImage"]);
      } else {
        tdata["headerImage"] = 0;
      }
    }
    if (!voidp(tdata["teaserImgList"])) {
      let tImageNameList = tdata["teaserImgList"];
      let tMemList = list();
      if (tImageNameList.count > 0) {
        for (const tImg of tImageNameList) {
          if (memberExists(tImg)) {
            tMemList.add(getmemnum(tImg));
            continue;
          }
          tMemList.add(0);
        }
      }
      tdata["teaserImgList"] = tMemList;
    }
    if (!voidp(tdata["productList"])) {
      for (let f = 1; f <= tdata["productList"].count; f++) {
        let tProductData = tdata["productList"][f];
        if (!voidp(tProductData["purchaseCode"])) {
          let tPrewMember = "ctlg_pic_";
          let tPurchaseCode = tProductData["purchaseCode"];
          let tDealNumber = tProductData["dealNumber"];
          if (memberExists(`${tPrewMember}${tPurchaseCode}`)) {
            tdata["productList"][f]["prewImage"] = getmemnum(`${tPrewMember}${tPurchaseCode}`);
          } else {
            tdata["productList"][f]["prewImage"] = 0;
          }
          tdata["productList"][f]["smallColorFlag"] = 1;
          if (memberExists(`${tPrewMember}small_${tPurchaseCode}`)) {
            tdata["productList"][f]["smallPrewImg"] = getmemnum(`${tPrewMember}small_${tPurchaseCode}`);
          } else {
            tdata["productList"][f]["smallPrewImg"] = 0;
          }
        }
        if (!voidp(tProductData["class"])) {
          let tClass = tProductData["class"];
          let tSmallMem;
          if (tClass.contains("*")) {
            tSmallMem = `${tClass}_small`;
            tClass = tClass.char[`${1}..${offset("*", tClass) - 1}`];
            if (!memberExists(tSmallMem)) {
              tSmallMem = `${tClass}_small`;
            } else {
              tdata["productList"][f]["smallColorFlag"] = 0;
            }
          } else {
            tSmallMem = `${tClass}_small`;
          }
          if (tdata["productList"][f]["smallPrewImg"] == 0) {
            if (memberExists(tSmallMem)) {
              tdata["productList"][f]["smallPrewImg"] = getmemnum(tSmallMem);
            } else {
              tdata["productList"][f]["smallPrewImg"] = getmemnum("no_icon_small");
            }
          }
        }
        if (!voidp(tDealNumber)) {
          tdata["productList"][f]["smallPrewImg"] = 0;
        }
      }
    }
    return tdata;
  }

  processCataloguePage(tdata) {
    let tPageID = tdata["id"];
    let tObjectLoadList = list();
    if (!voidp(tdata["productList"]) && !voidp(tPageID)) {
      for (const tProduct of tdata["productList"]) {
        let tClass = this.getClassName(tProduct["class"]);
        if (!voidp(tClass) && (tClass != EMPTY)) {
          if (tObjectLoadList.findPos(tClass) == 0) {
            tObjectLoadList.add(tClass);
          }
        } else {
          nothing();
        }
        let tDeal = tProduct["dealList"];
        if (!voidp(tDeal)) {
          for (const tDealProduct of tDeal) {
            tClass = this.getClassName(tDealProduct["class"]);
            if (!voidp(tClass) && (tClass != EMPTY)) {
              if (tObjectLoadList.findPos(tClass) == 0) {
                tObjectLoadList.add(tClass);
              }
              continue;
            }
            nothing();
          }
        }
      }
      for (let tIndex = tObjectLoadList.count; tIndex >= 1; tIndex--) {
        let tClass = tObjectLoadList[tIndex];
        if (getThread(Symbol.for("dynamicdownloader")) == 0) {
          tObjectLoadList.deleteAt(tIndex);
          continue;
        }
        if (getThread(Symbol.for("dynamicdownloader")).getComponent().isAssetDownloaded(tClass)) {
          tObjectLoadList.deleteAt(tIndex);
          continue;
        }
        let ttype = Symbol.for("Active");
        getThread(Symbol.for("dynamicdownloader")).getComponent().downloadCastDynamically(tClass, ttype, this.getID(), Symbol.for("objectDownloadCompleted"), 1);
      }
    }
    let tHeaderImgName = tdata[Symbol.for("headerImage")];
    let tTeaserImgList = tdata[Symbol.for("teaserImgList")];
    if (string(tHeaderImgName).length > 0) {
      if (!memberExists(tHeaderImgName)) {
        let tSourceURL = `${this.pImageLibraryURL}catalogue/${tHeaderImgName}_${this.getLanguage()}.gif`;
        let tHeaderMemNum = queueDownload(tSourceURL, tHeaderImgName, Symbol.for("bitmap"), 1);
        if (tHeaderMemNum > 0) {
          registerDownloadCallback(tHeaderMemNum, Symbol.for("catalogImgDownloaded"), this.getID(), tHeaderImgName);
          if (tObjectLoadList.findPos(tHeaderImgName) == 0) {
            tObjectLoadList.add(tHeaderImgName);
          }
        }
      }
    }
    if (ilk(tTeaserImgList) == Symbol.for("list")) {
      for (const tTeaserImg of tTeaserImgList) {
        if (string(tTeaserImg).length > 0) {
          if (!memberExists(tTeaserImg)) {
            let tSourceURL = `${this.pImageLibraryURL}catalogue/${tTeaserImg}_${this.getLanguage()}.gif`;
            let tTeaserMemNum = queueDownload(tSourceURL, tTeaserImg, Symbol.for("bitmap"), 1);
            if (tTeaserMemNum > 0) {
              registerDownloadCallback(tTeaserMemNum, Symbol.for("catalogImgDownloaded"), this.getID(), tTeaserImg);
              if (tObjectLoadList.findPos(tTeaserImg) == 0) {
                tObjectLoadList.add(tTeaserImg);
              }
            }
          }
        }
      }
    }
    if (tObjectLoadList.count > 0) {
      this.pLoadingProps[tPageID] = propList("loadList", tObjectLoadList, "data", tdata.duplicate());
      return 0;
    } else {
      return 1;
    }
  }

  getClassName(tClass) {
    let tName = tClass;
    if (voidp(tName)) {
      return tName;
    }
    if (tName.contains("*")) {
      let tDelim = the.itemDelimiter;
      the.itemDelimiter = "*";
      tName = tName.item[1];
      the.itemDelimiter = tDelim;
    }
    return tName;
  }

  objectDownloadCompleted(tClass, tSuccess) {
    this.downloadCompleted(tClass, tSuccess);
  }

  catalogImgDownloaded(tImgId) {
    let tSuccess = 0;
    if (memberExists(tImgId)) {
      if (member(getmemnum(tImgId)).type == Symbol.for("bitmap")) {
        let tImage = member(getmemnum(tImgId)).image;
        if ((tImage.width == 0) || (tImage.height == 0)) {
          member(getmemnum(tImgId)).image = member(getmemnum("loading_icon")).image;
        } else {
          tSuccess = 1;
        }
      }
    }
    this.downloadCompleted(tImgId, tSuccess);
  }

  downloadCompleted(tClassID, tSuccess) {
    if (!tSuccess) {
      nothing();
    }
    let tLoadCount = this.pLoadingProps.count;
    for (let tIndex = tLoadCount; tIndex >= 1; tIndex--) {
      let tDownloadList = this.pLoadingProps[tIndex]["loadList"];
      let tPageID = this.pLoadingProps.getPropAt(tIndex);
      let tPos = tDownloadList.findPos(tClassID);
      if (tPos > 0) {
        tDownloadList.deleteAt(tPos);
      }
      if (tDownloadList.count == 0) {
        let tdata = this.pLoadingProps[tIndex]["data"].duplicate();
        tdata = this.solveCatalogueMembers(tdata);
        tPageID = tdata["id"];
        this.pCatalogProps[tPageID] = tdata;
        if (tPageID == this.pLastSelectedPageID) {
          this.pCatalogProps["lastPageID"] = tPageID;
          let tInterfaceId = this.getInterface().getID();
          createTimeout(Symbol.for("catalogpagedata"), 10, Symbol.for("cataloguePageData"), tInterfaceId, tdata, 1);
        }
        this.pLoadingProps.deleteAt(tIndex);
      }
    }
  }
}
