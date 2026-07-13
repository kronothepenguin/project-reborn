export default class {
  pState;
  pTraderPal;
  pAcceptFlagMe;
  pAcceptFlagHe;
  pMyStripItems;
  pItemListMe;
  pItemListHe;
  pTraderWndID;
  pMaxTradeItms;
  pItemSlotRect;
  pConfirmationWndID;
  pMySlotProps;
  pHerSlotProps;
  pIconPlaceholderName;
  pRequiredDownloadsToTrade;

  construct() {
    this.pState = Symbol.for("closed");
    this.pTraderWndID = getText("trading_title", "Safe Trading");
    this.pAcceptFlagMe = 0;
    this.pAcceptFlagHe = 0;
    this.pItemListMe = list();
    this.pItemListHe = list();
    this.pMyStripItems = list();
    this.pMaxTradeItms = 0;
    this.pItemSlotRect = rect(0, 0, 32, 32);
    this.pHerSlotCount = 0;
    this.pMySlotProps = propList();
    this.pHerSlotProps = propList();
    this.pConfirmationWndID = "safetrading_confirmationdialog";
    this.pIconPlaceholderName = "icon_placeholder";
    this.pRequiredDownloadsToTrade = list();
    return 1;
  }

  deconstruct() {
    return this.close();
  }

  open(tdata) {
    this.pRequiredDownloadsToTrade = list();
    let tList = propList();
    tList["showDialog"] = 1;
    executeMessage(Symbol.for("getHotelClosingStatus"), tList);
    if (tList["retval"] == 1) {
      return 1;
    }
    getThread(Symbol.for("room")).getInterface().cancelObjectMover();
    getThread(Symbol.for("room")).getInterface().setProperty(Symbol.for("clickAction"), "tradeItem");
    if (windowExists(this.pTraderWndID)) {
      return 0;
    }
    if (tdata.count > 1) {
      if (tdata.getPropAt(1) != getObject(Symbol.for("session")).GET("user_name")) {
        this.pTraderPal = tdata.getPropAt(1);
      } else {
        this.pTraderPal = tdata.getPropAt(2);
      }
    } else {
      this.pTraderPal = tdata.getPropAt(1);
    }
    if (voidp(this.pTraderPal) or (this.pTraderPal == EMPTY)) {
      this.pTraderPal = "He/she";
    }
    if (!createWindow(this.pTraderWndID, "habbo_basic.window")) {
      return 0;
    }
    let tWndObj = getWindow(this.pTraderWndID);
    if (!tWndObj.merge("habbo_trading.window")) {
      return tWndObj.close();
    }
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcTrading"), this.getID());
    tWndObj.getElement("trading_heoffers_text").setText(`${this.pTraderPal} ${getText("trading_offers", "offers")}`);
    tWndObj.getElement("trading_agrees_text").setText(`${this.pTraderPal} ${getText("trading_agrees", "agrees")}`);
    this.pMaxTradeItms = 0;
    while (1) {
      if (!getWindow(this.pTraderWndID).elementExists(`trading_mystuff_${this.pMaxTradeItms + 1}`)) {
        break;
      }
      this.pMaxTradeItms = this.pMaxTradeItms + 1;
    }
    for (let i = 1; i <= this.pMaxTradeItms; i++) {
      tWndObj.getElement(`trading_mystuff_${i}`).draw(rgb(100, 100, 100));
      tWndObj.getElement(`trading_herstuff_${i}`).draw(rgb(200, 200, 200));
    }
    let tWidth = tWndObj.getElement("trading_mystuff_1").getProperty(Symbol.for("width"));
    let tHeight = tWndObj.getElement("trading_mystuff_1").getProperty(Symbol.for("height"));
    this.pItemSlotRect = rect(0, 0, tWidth, tHeight);
    this.pState = Symbol.for("open");
    this.accept();
    return 1;
  }

  close(tdata) {
    getThread(Symbol.for("room")).getInterface().setProperty(Symbol.for("clickAction"), "moveHuman");
    getThread(Symbol.for("room")).getInterface().getObjectMover().clear();
    if (windowExists(this.pTraderWndID)) {
      this.pAcceptFlagMe = 0;
      this.pAcceptFlagHe = 0;
      this.pItemListMe = list();
      this.pItemListHe = list();
      this.pMyStripItems = list();
      this.pMySlotProps = propList();
      this.pHerSlotProps = propList();
      removeWindow(this.pTraderWndID);
      removeWindow(this.pConfirmationWndID);
    }
    this.pState = Symbol.for("closed");
    return 1;
  }

  accept(tuser, tValue) {
    if (this.pState == Symbol.for("closed")) {
      return 0;
    }
    if (!voidp(tuser) && !voidp(tValue)) {
      if (tuser == this.pTraderPal) {
        this.pAcceptFlagHe = tValue;
      } else {
        if (tuser == getObject(Symbol.for("session")).GET("user_name")) {
          this.pAcceptFlagMe = tValue;
          this.blendLockedSlots(tValue);
        }
      }
    }
    if (this.pAcceptFlagMe) {
      let tOnOff = "on";
    } else {
      let tOnOff = "off";
    }
    let tWndObj = getWindow(this.pTraderWndID);
    if (tWndObj == 0) {
      return 0;
    }
    let tImage = member(getmemnum(`button.checkbox.${tOnOff}`)).image;
    tWndObj.getElement("trading_confirm_check").feedImage(tImage);
    if (this.pAcceptFlagHe) {
      tOnOff = "on";
      let tBlend = 255;
    } else {
      tOnOff = "off";
      tBlend = 128;
    }
    let tImageA = member(getmemnum(`button.checkbox.${tOnOff}`)).image;
    let tImageB = image(tImageA.width, tImageA.height, tImageA.depth, tImageA.paletteRef);
    tImageB.copyPixels(tImageA, tImageA.rect, tImageA.rect, propList("blendLevel", tBlend));
    tWndObj.getElement("trading_buddycheck_image").feedImage(tImageB);
    return 1;
  }

  Refresh(tdata) {
    this.open(tdata);
    this.pMyStripItems = list();
    let tWndObj = getWindow(this.pTraderWndID);
    let tCreditFurniPrice = propList("me", 0, "he", 0);
    this.pItemListMe = tdata[getObject(Symbol.for("session")).GET("user_name")][Symbol.for("items")];
    this.pMySlotProps = propList();
    for (let i = 1; i <= this.pItemListMe.count; i++) {
      let tClass = this.pItemListMe[i][Symbol.for("class")];
      if (!voidp(this.pItemListMe[i][Symbol.for("props")])) {
        tClass = `${tClass}_${this.pItemListMe[i][Symbol.for("props")]}`;
      }
      let tSlotID = tClass;
      if (!voidp(this.pItemListMe[i][Symbol.for("slotID")])) {
        tSlotID = this.pItemListMe[i][Symbol.for("slotID")];
      }
      if (voidp(this.pMySlotProps[tSlotID])) {
        let tAddToSlot = this.pMySlotProps.count + 1;
        if (tWndObj.elementExists(`trading_mystuff_${tAddToSlot}`)) {
          let tSlotData = propList("count", 1, "slot", tAddToSlot, "name", this.pItemListMe[i][Symbol.for("name")]);
          if (!voidp(this.pItemListMe[i][Symbol.for("songID")])) {
            tSlotData["songID"] = this.pItemListMe[i][Symbol.for("songID")];
            if (!voidp(this.pItemListMe[i][Symbol.for("stuffdata")])) {
              let tArray = propList("source", this.pItemListMe[i][Symbol.for("stuffdata")]);
              executeMessage(Symbol.for("get_disk_data"), tArray);
              if (!voidp(tArray[Symbol.for("author")]) && !voidp(tArray[Symbol.for("songName")])) {
                let tText = getText("song_disk_trade_info");
                tText = replaceChunks(tText, "%author%", tArray[Symbol.for("author")]);
                tText = replaceChunks(tText, "%name%", tArray[Symbol.for("songName")]);
                tSlotData["name"] = tText;
              }
            }
          }
          this.pMySlotProps.addProp(tSlotID, tSlotData);
          tWndObj.getElement(`trading_mycount_${tAddToSlot}`).setText(this.pMySlotProps[tSlotID]["count"]);
          let tImage = this.createItemImg(this.pItemListMe[i]);
          tWndObj.getElement(`trading_mystuff_${tAddToSlot}`).feedImage(tImage);
          tWndObj.getElement(`trading_mystuff_${tAddToSlot}`).draw(rgb(64, 64, 64));
        }
      } else {
        let tCount = this.pMySlotProps[tSlotID]["count"];
        let tSlot = this.pMySlotProps[tSlotID]["slot"];
        this.pMySlotProps[tSlotID]["count"] = tCount + 1;
        tWndObj.getElement(`trading_mycount_${tSlot}`).setText(this.pMySlotProps[tSlotID]["count"]);
      }
      this.pMyStripItems.add(this.pItemListMe[i][Symbol.for("stripId")]);
      if (getThread(Symbol.for("room")).getComponent().isCreditFurniClass(this.pItemListMe[i][Symbol.for("class")])) {
        tCreditFurniPrice[Symbol.for("me")] = tCreditFurniPrice[Symbol.for("me")] + integer(this.pItemListMe[i][Symbol.for("stuffdata")]);
      }
    }
    if (tdata[this.pTraderPal] == VOID) {
      return 0;
    }
    this.pItemListHe = tdata[this.pTraderPal][Symbol.for("items")];
    this.pHerSlotProps = propList();
    for (let i = 1; i <= this.pItemListHe.count; i++) {
      let tClass = this.pItemListHe[i][Symbol.for("class")];
      if (!voidp(this.pItemListHe[i][Symbol.for("props")])) {
        tClass = `${tClass}${this.pItemListHe[i][Symbol.for("props")]}`;
      }
      let tSlotID = tClass;
      if (!voidp(this.pItemListHe[i][Symbol.for("slotID")])) {
        tSlotID = this.pItemListHe[i][Symbol.for("slotID")];
      }
      if (voidp(this.pHerSlotProps[tSlotID])) {
        let tAddToSlot = this.pHerSlotProps.count + 1;
        if (tWndObj.elementExists(`trading_herstuff_${tAddToSlot}`)) {
          let tSlotData = propList("count", 1, "slot", tAddToSlot, "name", this.pItemListHe[i][Symbol.for("name")]);
          if (!voidp(this.pItemListHe[i][Symbol.for("songID")])) {
            tSlotData["songID"] = this.pItemListHe[i][Symbol.for("songID")];
            if (!voidp(this.pItemListHe[i][Symbol.for("stuffdata")])) {
              let tArray = propList("source", this.pItemListHe[i][Symbol.for("stuffdata")]);
              executeMessage(Symbol.for("get_disk_data"), tArray);
              if (!voidp(tArray[Symbol.for("author")]) && !voidp(tArray[Symbol.for("songName")])) {
                let tText = getText("song_disk_trade_info");
                tText = replaceChunks(tText, "%author%", tArray[Symbol.for("author")]);
                tText = replaceChunks(tText, "%name%", tArray[Symbol.for("songName")]);
                tSlotData["name"] = tText;
                if (!voidp(tArray[Symbol.for("playIcon")])) {
                  tSlotData[Symbol.for("hiliteImage")] = this.cropToFit(tArray[Symbol.for("playIcon")]);
                }
              }
            }
          }
          this.pHerSlotProps.addProp(tSlotID, tSlotData);
          tWndObj.getElement(`trading_hercount_${tAddToSlot}`).setText(this.pHerSlotProps[tSlotID]["count"]);
          let tImage = this.createItemImg(this.pItemListHe[i]);
          tSlotData[Symbol.for("image")] = tImage;
          tWndObj.getElement(`trading_herstuff_${tAddToSlot}`).feedImage(tImage);
          tWndObj.getElement(`trading_herstuff_${tAddToSlot}`).draw(rgb(64, 64, 64));
        }
      } else {
        let tCount = this.pHerSlotProps[tSlotID]["count"];
        let tSlot = this.pHerSlotProps[tSlotID]["slot"];
        this.pHerSlotProps[tSlotID]["count"] = tCount + 1;
        tWndObj.getElement(`trading_hercount_${tSlot}`).setText(this.pHerSlotProps[tSlotID]["count"]);
      }
      if (getThread(Symbol.for("room")).getComponent().isCreditFurniClass(this.pItemListHe[i][Symbol.for("class")])) {
        tCreditFurniPrice[Symbol.for("he")] = tCreditFurniPrice[Symbol.for("he")] + integer(this.pItemListHe[i][Symbol.for("stuffdata")]);
      }
    }
    this.accept(tdata.getPropAt(1), value(tdata[1][Symbol.for("accept")]));
    this.accept(tdata.getPropAt(2), value(tdata[2][Symbol.for("accept")]));
    this.updateCreditFurniCount(tCreditFurniPrice);
  }

  updateCreditFurniCount(tCreditFurniPrice) {
    let tWndObj = getWindow(this.pTraderWndID);
    if (tWndObj == 0) {
      return 0;
    }
    if (tWndObj.elementExists("credit_count_1")) {
      let tPrice = tCreditFurniPrice[Symbol.for("he")];
      if (tPrice == 0) {
        let tText = EMPTY;
      } else {
        tText = replaceChunks(getText("credit_trade_value"), "%value%", string(tPrice));
      }
      tWndObj.getElement("credit_count_1").setText(tText);
    }
    if (tWndObj.elementExists("credit_count_2")) {
      tPrice = tCreditFurniPrice[Symbol.for("me")];
      if (tPrice == 0) {
        tText = EMPTY;
      } else {
        tText = replaceChunks(getText("credit_trade_value"), "%value%", string(tPrice));
      }
      tWndObj.getElement("credit_count_2").setText(tText);
    }
    return 1;
  }

  complete(tdata) {
    return this.close();
  }

  isUnderTrade(tStripID) {
    return this.pMyStripItems.getPos(tStripID) > 0;
  }

  getState() {
    return this.pState;
  }

  createItemImg(tProps, tDownloadPrevented) {
    if (voidp(tProps)) {
      error(this, "Invalid props!", Symbol.for("createItemImg"), Symbol.for("major"));
      return image(1, 1, 8);
    }
    let tImgProps = propList("ink", 8);
    if (voidp(tProps[Symbol.for("props")])) {
      tProps[Symbol.for("props")] = EMPTY;
    }
    let tClass = tProps[Symbol.for("class")];
    if (tProps[Symbol.for("class")] contains "*") {
      tClass = tProps[Symbol.for("class")].char[`1..${offset("*", tProps[Symbol.for("class")]) - 1}`];
    }
    if (tClass contains "post.it") {
      let tCount = integer(value(tProps[Symbol.for("props")]) / (20.0 / 6.0));
      if (tCount > 6) {
        tCount = 6;
      }
      if (tCount < 1) {
        tCount = 1;
      }
      if (memberExists(`${tClass}_${tCount}_small`)) {
        let tMemStr = `${tClass}_${tCount}_small`;
      } else {
        error(this, `Couldn't define member for trade item!${RETURN}${tProps}`, Symbol.for("createItemImg"), Symbol.for("major"));
      }
    } else {
      if (memberExists(`${tProps[Symbol.for("class")]}_${tProps[Symbol.for("props")]}_small`)) {
        tMemStr = `${tProps[Symbol.for("class")]}_${tProps[Symbol.for("props")]}_small`;
      } else {
        if (memberExists(`${tProps[Symbol.for("class")]}_small`)) {
          tMemStr = `${tProps[Symbol.for("class")]}_small`;
        } else {
          if (memberExists(`${tClass} ${tProps[Symbol.for("props")]}_small`)) {
            tMemStr = `${tClass} ${tProps[Symbol.for("props")]}_small`;
          } else {
            if (memberExists(`${tClass}_small`)) {
              tMemStr = `${tClass}_small`;
            } else {
              if (memberExists(`rightwall${tClass} ${tProps[Symbol.for("props")]}`)) {
                tMemStr = `rightwall${tClass} ${tProps[Symbol.for("props")]}`;
              } else {
                if (!tDownloadPrevented) {
                  let tDynThread = getThread(Symbol.for("dynamicdownloader"));
                  if (tDynThread == 0) {
                    error(this, `Couldn't define member for trade item!${RETURN}${tProps}`, Symbol.for("createItemImg"), Symbol.for("major"));
                    return image(1, 18, 8);
                  } else {
                    let tDynComponent = tDynThread.getComponent();
                    let tRoomSizePrefix = EMPTY;
                    let tRoomThread = getThread(Symbol.for("room"));
                    if (tRoomThread != 0) {
                      let tTileSize = tRoomThread.getInterface().getGeometry().getTileWidth();
                      if (tTileSize == 32) {
                        tRoomSizePrefix = "s_";
                      }
                    }
                    if (tProps[Symbol.for("class")] contains "poster") {
                      let tDownloadIdName = `${tClass} ${tProps[Symbol.for("props")]}`;
                    } else {
                      tDownloadIdName = tClass;
                    }
                    tDownloadIdName = tRoomSizePrefix + tDownloadIdName;
                    tDynComponent.downloadCastDynamically(tDownloadIdName, Symbol.for("unknown"), this.getID(), Symbol.for("traderItemDownloadCallback"), 1, tProps);
                    if (this.pRequiredDownloadsToTrade.getPos(tDownloadIdName) == 0) {
                      this.pRequiredDownloadsToTrade.add(tDownloadIdName);
                    }
                    tMemStr = this.pIconPlaceholderName;
                  }
                } else {
                  tMemStr = this.pIconPlaceholderName;
                }
              }
            }
          }
        }
      }
    }
    let tImage = getObject("Preview_renderer").renderPreviewImage(tMemStr, VOID, tProps[Symbol.for("colors")], tProps[Symbol.for("class")]);
    if (voidp(tImage)) {
      return image(1, 18, 8);
    }
    tImgProps[Symbol.for("maskImage")] = tImage.createMatte();
    let tNewImg = image(tImage.width, tImage.height, 32);
    tNewImg.copyPixels(tImage, tImage.rect, tImage.rect, tImgProps);
    return this.cropToFit(tNewImg);
  }

  traderItemDownloadCallback(tDownloadedId, tSuccess, tCallbackParams) {
    if (!tSuccess) {
      return 0;
    }
    if (this.pRequiredDownloadsToTrade.getPos(tDownloadedId) > 0) {
      this.pRequiredDownloadsToTrade.deleteOne(tDownloadedId);
    }
    let tWndObj = getWindow(this.pTraderWndID);
    for (let i = 1; i <= this.pItemListHe.count; i++) {
      let tClass = this.pItemListHe[i][Symbol.for("class")];
      if (!voidp(this.pItemListHe[i][Symbol.for("props")])) {
        tClass = `${tClass}${this.pItemListHe[i][Symbol.for("props")]}`;
      }
      if (voidp(this.pHerSlotProps[tClass])) {
        return 0;
        continue;
      }
      let tCount = this.pHerSlotProps[tClass]["count"];
      let tSlot = this.pHerSlotProps[tClass]["slot"];
      if (tWndObj.elementExists(`trading_mystuff_${tSlot}`)) {
        let tImage = this.createItemImg(this.pItemListHe[i], 1);
        tWndObj.getElement(`trading_herstuff_${tSlot}`).feedImage(tImage);
      }
    }
  }

  cropToFit(tImage) {
    let tOffset = rect(0, 0, 0, 0);
    if (tImage.width < this.pItemSlotRect.width) {
      tOffset[1] = integer((this.pItemSlotRect.width - tImage.width) / 2);
      tOffset[3] = tOffset[1];
    }
    if (tImage.height < this.pItemSlotRect.height) {
      tOffset[2] = integer((this.pItemSlotRect.height - tImage.height) / 2);
      tOffset[4] = tOffset[2];
    }
    let tNewImg = image(this.pItemSlotRect.width, this.pItemSlotRect.height, 32);
    tNewImg.copyPixels(tImage, tImage.rect + tOffset, tImage.rect);
    return tNewImg;
  }

  showInfo(tText) {
    if (this.pState == Symbol.for("closed")) {
      return 0;
    }
    if (voidp(tText)) {
      tText = getText("trading_additems");
    }
    return getWindow(this.pTraderWndID).getElement("trading_instructions_text").setText(tText);
  }

  blendLockedSlots(tBoolean) {
    if (this.pState == Symbol.for("closed")) {
      return 0;
    }
    if (tBoolean) {
      for (let i = 1; i <= this.pItemListMe.count; i++) {
        getWindow(this.pTraderWndID).getElement(`trading_mystuff_${i}`).setProperty(Symbol.for("blend"), 60);
        if (i == this.pMaxTradeItms) {
          break;
        }
      }
    } else {
      for (let i = 1; i <= this.pItemListMe.count; i++) {
        getWindow(this.pTraderWndID).getElement(`trading_mystuff_${i}`).setProperty(Symbol.for("blend"), 100);
        if (i == this.pMaxTradeItms) {
          break;
        }
      }
    }
  }

  eventProcTrading(tEvent, tSprID, tParam) {
    if (this.pState == Symbol.for("closed")) {
      return 0;
    }
    switch (tEvent) {
      case Symbol.for("mouseUp"):
        switch (tSprID) {
          case "trading_confirm_check":
            if (this.pAcceptFlagMe) {
              this.pAcceptFlagMe = 0;
              return getThread(Symbol.for("room")).getComponent().getRoomConnection().send("TRADE_UNACCEPT");
            } else {
              if (this.pHerSlotProps.count == 0) {
                if (this.pRequiredDownloadsToTrade.count > 0) {
                  return 1;
                }
                if (!createWindow(this.pConfirmationWndID, VOID, 0, 0, Symbol.for("modal"))) {
                  return 0;
                }
                let tWinObj = getWindow(this.pConfirmationWndID);
                let tWindowTitleStr = getText("win_error", "Notice!");
                tWinObj.setProperty(Symbol.for("title"), tWindowTitleStr);
                if (!tWinObj.merge("habbo_basic.window")) {
                  return tWinObj.close();
                }
                if (!tWinObj.merge("habbo_tradingalert_dialog.window")) {
                  return tWinObj.close();
                }
                tWinObj.center();
                tWinObj.registerProcedure(Symbol.for("eventProcTradingConfirmation"), this.getID(), Symbol.for("mouseUp"));
                return 1;
              } else {
                if (this.pRequiredDownloadsToTrade.count > 0) {
                  return 1;
                }
                this.pAcceptFlagMe = 1;
                return getThread(Symbol.for("room")).getComponent().getRoomConnection().send("TRADE_ACCEPT");
              }
            }
          case "close":
          case "trading_cancel":
            getThread(Symbol.for("room")).getComponent().getRoomConnection().send("TRADE_CLOSE");
            return this.close();
        }
        if (tSprID contains "trading_mystuff") {
          let tObjMover = getThread(Symbol.for("room")).getInterface().getObjectMover();
          if (objectp(tObjMover)) {
            let tClientID = tObjMover.getProperty(Symbol.for("clientID"));
            let tStripID = tObjMover.getProperty(Symbol.for("stripId"));
            if (tStripID != EMPTY) {
              if (this.pAcceptFlagMe) {
                getThread(Symbol.for("room")).getComponent().getRoomConnection().send("TRADE_UNACCEPT");
              }
              getThread(Symbol.for("room")).getComponent().getRoomConnection().send("TRADE_ADDITEM", tStripID);
              return tObjMover.clear();
            }
          }
        }
        if (tSprID contains "trading_herstuff") {
          if (integer(tSprID.char[length(tSprID)]) <= this.pHerSlotProps.count) {
            let tSongID = this.pHerSlotProps[integer(tSprID.char[length(tSprID)])][Symbol.for("songID")];
            if (!voidp(tSongID)) {
              executeMessage(Symbol.for("listen_song"), value(tSongID));
            }
          }
        }
        break;
      case Symbol.for("mouseEnter"):
        let tObjMover2 = getThread(Symbol.for("room")).getInterface().getObjectMover();
        if (tObjMover2 != 0) {
          tObjMover2.moveTrade();
        }
        switch (tSprID) {
          case "trading_confirm_check":
            return this.showInfo(getText("trading_youagree"));
          case "close":
          case "trading_cancel":
            return this.showInfo(getText("trading_cancel"));
        }
        if ((tSprID contains "trading_mystuff") && !this.pAcceptFlagMe) {
          if (integer(tSprID.char[length(tSprID)]) > this.pMySlotProps.count) {
            getWindow(this.pTraderWndID).getElement(tSprID).draw(rgb(200, 200, 200));
          } else {
            this.showInfo(this.pMySlotProps[integer(tSprID.char[length(tSprID)])][Symbol.for("name")]);
          }
        } else {
          if (tSprID contains "trading_herstuff") {
            if (integer(tSprID.char[length(tSprID)]) <= this.pHerSlotProps.count) {
              this.showInfo(this.pHerSlotProps[integer(tSprID.char[length(tSprID)])][Symbol.for("name")]);
              if (integer(tSprID.char[length(tSprID)]) <= this.pHerSlotProps.count) {
                let tSlotIndex = integer(tSprID.char[length(tSprID)]);
                let tImage = this.pHerSlotProps[tSlotIndex][Symbol.for("hiliteImage")];
                if (!voidp(tImage)) {
                  getWindow(this.pTraderWndID).getElement(tSprID).feedImage(tImage);
                  getWindow(this.pTraderWndID).getElement(tSprID).draw(rgb(64, 64, 64));
                }
              }
            }
          }
        }
        break;
      case Symbol.for("mouseLeave"):
        switch (tSprID) {
          case "trading_confirm_check":
            return this.showInfo(VOID);
          case "close":
          case "trading_cancel":
            return this.showInfo(VOID);
        }
        if ((tSprID contains "trading_mystuff") && !this.pAcceptFlagMe) {
          let tObjMover3 = getThread(Symbol.for("room")).getInterface().getObjectMover();
          if (tObjMover3 != 0) {
            tObjMover3.moveTrade();
          }
          if (integer(tSprID.char[length(tSprID)]) <= this.pMySlotProps.count) {
            getWindow(this.pTraderWndID).getElement(tSprID).draw(rgb(50, 50, 50));
          } else {
            getWindow(this.pTraderWndID).getElement(tSprID).draw(rgb(100, 100, 100));
          }
          this.showInfo(VOID);
        } else {
          if (tSprID contains "trading_herstuff") {
            this.showInfo(VOID);
            let tSlotIndex = integer(tSprID.char[length(tSprID)]);
            if (tSlotIndex <= this.pHerSlotProps.count) {
              let tSongID = this.pHerSlotProps[tSlotIndex][Symbol.for("songID")];
              if (!voidp(tSongID)) {
                executeMessage(Symbol.for("do_not_listen_song"), value(tSongID));
              }
              tImage = this.pHerSlotProps[tSlotIndex][Symbol.for("image")];
              if (!voidp(tImage)) {
                getWindow(this.pTraderWndID).getElement(tSprID).feedImage(tImage);
                getWindow(this.pTraderWndID).getElement(tSprID).draw(rgb(64, 64, 64));
              }
            }
          }
        }
        break;
    }
  }

  eventProcTradingConfirmation(tEvent, tElement, arg3, tWndName) {
    if (tElement == "habbo_tradingalert_ok") {
      this.pAcceptFlagMe = 1;
      removeWindow(tWndName);
      return getConnection(getVariable("connection.info.id")).send("TRADE_ACCEPT");
    } else {
      if (tElement == "habbo_tradingalert_cancel") {
        removeWindow(tWndName);
        return 1;
      }
    }
  }
}
