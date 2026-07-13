export default class {
  pWindowObj;
  pCurrentPageIndex;
  pLastPageIndex;
  pFurnisPerPage;
  pAcceptBtnActive;
  pProgressAnimation;
  pStatusIcon;
  pTimeLeftTimeoutID;
  pHeaderImageNum;

  construct() {
    pWindowObj = VOID;
    pCurrentPageIndex = 1;
    pLastPageIndex = 1;
    pFurnisPerPage = 12;
    pAcceptBtnActive = 0;
    pTimeLeftTimeoutID = "timeLeftTimeout";
    pProgressAnimation = createObject("rec_prg_anim", getClassVariable("recycler.progress.animation.class"));
    pStatusIcon = createObject("rec_status_icon", getClassVariable("recycler.status.icon.class"));
    registerMessage(Symbol.for("gamesystem_constructed"), this.getID(), Symbol.for("hideRecyclerStatusButton"));
    registerMessage(Symbol.for("gamesystem_deconstructed"), this.getID(), Symbol.for("showRecyclerStatusButton"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("gamesystem_constructed"), this.getID());
    unregisterMessage(Symbol.for("gamesystem_deconstructed"), this.getID());
    removeObject(pProgressAnimation);
    removeObject(pStatusIcon);
    return 1;
  }

  setHostWindowObject(tHostWindowObj) {
    pWindowObj = tHostWindowObj;
  }

  setHeaderImage(tMemberNo) {
    pHeaderImageNum = tMemberNo;
  }

  setViewToState(tstate) {
    switch (tstate) {
      case "open":
      case "disabled":
        this.hideRecyclerStatusButton();
        break;
      case "progress":
      case "ready":
      case "timeout":
        this.showRecyclerStatusButton();
        break;
    }
    if (voidp(pWindowObj)) {
      return 0;
    }
    switch (tstate) {
      case "open":
        pCurrentPageIndex = 1;
        pWindowObj.unmerge();
        pWindowObj.merge("ctlg_recycler_open.window");
        tHeaderText = getText("recycler_info_open");
        tMinutesToRecycle = this.getComponent().getRecyclingMinutes();
        tHeaderText = this.replaceTimeKeysText(tHeaderText, tMinutesToRecycle, "total_");
        tQuarantineMinutes = this.getComponent().getQuarantineMinutes();
        tHeaderText = this.replaceTimeKeysText(tHeaderText, tQuarantineMinutes, "quarantine_");
        if (timeoutExists(pTimeLeftTimeoutID)) {
          removeTimeout(pTimeLeftTimeoutID);
        }
        pProgressAnimation.stopAnimation();
        break;
      case "progress":
        pWindowObj.unmerge();
        pWindowObj.merge("ctlg_recycler_progress.window");
        tHeaderText = getText("recycler_info_progress");
        tRecyclingMinutes = this.getComponent().getRecyclingMinutes();
        tHeaderText = this.replaceTimeKeysText(tHeaderText, tRecyclingMinutes);
        pProgressAnimation.startAnimation(pWindowObj);
        this.updateInProgressText();
        if (!timeoutExists(pTimeLeftTimeoutID)) {
          createTimeout(pTimeLeftTimeoutID, 60000, Symbol.for("updateInProgressText"), this.getID(), VOID, 0);
        }
        break;
      case "ready":
        pWindowObj.unmerge();
        pWindowObj.merge("ctlg_recycler_ready.window");
        tHeaderText = getText("recycler_info_ready");
        if (pWindowObj.elementExists("rec_ready_outcome")) {
          tOutcomeElement = pWindowObj.getElement("rec_ready_outcome");
          tOutcomeText = getText("recycler_ready_outcome");
          tRewardName = this.getComponent().getRewardProps(Symbol.for("name"));
          tOutcomeText = replaceChunks(tOutcomeText, "%outcome%", tRewardName);
          tOutcomeElement.setText(tOutcomeText);
        }
        if (timeoutExists(pTimeLeftTimeoutID)) {
          removeTimeout(pTimeLeftTimeoutID);
        }
        pProgressAnimation.stopAnimation();
        break;
      case "timeout":
        pWindowObj.unmerge();
        pWindowObj.merge("ctlg_recycler_progress.window");
        tHeaderText = getText("recycler_info_timeout");
        break;
      case "disabled":
        pWindowObj.unmerge();
        pWindowObj.merge("ctlg_recycler_progress.window");
        tHeaderText = getText("recycler_info_closed");
        break;
      default:
        return 0;
    }
    this.updateDynamicContent();
    tHeaderImgElement = pWindowObj.getElement("ctlg_header_img");
    if (!voidp(tHeaderImgElement)) {
      if (pHeaderImageNum != 0) {
        tHeaderImgElement.setProperty(Symbol.for("image"), member(pHeaderImageNum).image);
      }
    }
    tHeaderTextElement = pWindowObj.getElement("ctlg_header_text");
    if (!voidp(tHeaderTextElement)) {
      tHeaderTextElement.setText(tHeaderText);
    }
  }

  eventProc(tEvent, tSprID, tProp) {
    if (tEvent == Symbol.for("mouseEnter")) {
      tObjMover = getThread(Symbol.for("room")).getInterface().getObjectMover();
      if (tObjMover != 0) {
        tObjMover.moveTrade();
      }
    } else {
      if (tEvent == Symbol.for("mouseUp")) {
        if (tSprID.includes("rec_drop_slot_")) {
          tObjMover = getThread(Symbol.for("room")).getInterface().getObjectMover();
          tContainer = getThread(Symbol.for("room")).getInterface().getContainer();
          if (objectp(tObjMover)) {
            tClientObj = tObjMover.getProperty(Symbol.for("clientObj"));
            if (objectp(tClientObj)) {
              if (tObjMover.getProperty(Symbol.for("stripId")) == EMPTY) {
                return 0;
              }
              tClientProps = tObjMover.getProperty(Symbol.for("clientProps"));
              tClass = tClientProps[Symbol.for("class")];
              tClientID = tObjMover.getProperty(Symbol.for("clientID"));
              tClientProps[Symbol.for("type")] = tObjMover.pObjType;
              if (!integer(tClientProps[Symbol.for("isRecyclable")])) {
                executeMessage(Symbol.for("alert"), propList("Msg", getText("recycler_furni_not_recyclable")));
                this.getComponent().clearObjectMover();
                return 0;
              }
              this.getComponent().addFurnitureToGivePool(tClass, tClientID, tClientProps);
              this.getComponent().clearObjectMover();
              this.updateLastPageIndex();
              pCurrentPageIndex = pLastPageIndex;
              this.updateDynamicContent();
              return 1;
            } else {
              tDelim = the.itemDelimiter;
              the.itemDelimiter = "_";
              tSlotNo = tSprID.item[4];
              the.itemDelimiter = tDelim;
              this.removeItemFromSlot(tSlotNo);
            }
            tContainer.Refresh();
          }
        }
        switch (tSprID) {
          case "rec_next":
            pCurrentPageIndex = pCurrentPageIndex + 1;
            this.updateDynamicContent();
            break;
          case "rec_prev":
            pCurrentPageIndex = pCurrentPageIndex - 1;
            this.updateDynamicContent();
            break;
          case "rec_accept_text":
          case "rec_current_btn":
            if ((this.getComponent().getState() == "open") && (pAcceptBtnActive == 1)) {
              this.getComponent().startRecycling();
            } else {
              if (this.getComponent().getState() == "ready") {
                this.getComponent().acceptRecycling();
              }
            }
            break;
          case "rec_cancel_text":
          case "rec_cancel_btn":
            this.getComponent().cancelRecycling();
            break;
          case "rec_moreinfo_link":
            executeMessage(Symbol.for("externalLinkClick"), the.mouseLoc);
            openNetPage("recycler_info_link_url");
            break;
        }
      }
    }
    return 0;
  }

  updateDynamicContent() {
    tstate = this.getComponent().getState();
    switch (tstate) {
      case "open":
        this.updateFurniSlots();
        this.updateNextAndPrevButtons();
        this.updatePageIndexes();
        this.updateAcceptButtonOpenState();
        this.updateProgressBar();
        break;
      case "progress":
        this.updateCancelButton();
        break;
      case "ready":
        this.updateAcceptButton();
        this.updateCancelButton();
        break;
      case "timeout":
        this.updateCancelButton();
        break;
      case "disabled":
        this.hideCancelButton();
        break;
    }
  }

  updateInProgressText() {
    if ((this.getComponent().getState() != "progress") || voidp(pWindowObj)) {
      return 0;
    }
    tTimeLeftText = getText("recycler_progress_timeleft");
    tMinutesLeft = this.getComponent().getMinutesLeftToRecycle() + 1;
    tTimeLeftText = this.replaceTimeKeysText(tTimeLeftText, tMinutesLeft);
    if (pWindowObj.elementExists("ctlg_time_left")) {
      pWindowObj.getElement("ctlg_time_left").setText(tTimeLeftText);
    }
  }

  replaceTimeKeysText(tText, tMinutes, tKeyPrefix) {
    if (!voidp(tMinutes)) {
      tHours = tMinutes / 60;
      tMinutes = tMinutes - (tHours * 60);
      tText = replaceChunks(tText, `${"%"}${tKeyPrefix}${"hours%"}`, tHours);
      tText = replaceChunks(tText, `${"%"}${tKeyPrefix}${"minutes%"}`, tMinutes);
    }
    return tText;
  }

  showRecyclerStatusButton() {
    tstate = this.getComponent().getState();
    if ((tstate == "ready") || (tstate == "timeout")) {
      pStatusIcon.showRecyclerButton("highlight");
    } else {
      if (tstate == "progress") {
        pStatusIcon.showRecyclerButton("normal");
      } else {
        nothing();
      }
    }
  }

  hideRecyclerStatusButton() {
    pStatusIcon.hideRecyclerButton();
  }

  updateLastPageIndex() {
    tGivenAmount = this.getComponent().getGiveFurniPool().count;
    if (tGivenAmount < pFurnisPerPage) {
      pLastPageIndex = 1;
    } else {
      pLastPageIndex = (tGivenAmount / pFurnisPerPage) + 1;
    }
  }

  removeItemFromSlot(tSlotNo) {
    tSlotNo = integer(tSlotNo);
    tCurrentPageFirstIndex = ((pCurrentPageIndex - 1) * pFurnisPerPage) + 1;
    tRemovedIndex = tCurrentPageFirstIndex + tSlotNo - 1;
    this.getComponent().removeFurniFromGivePool(tRemovedIndex);
    this.updateLastPageIndex();
    if (pCurrentPageIndex > pLastPageIndex) {
      pCurrentPageIndex = pLastPageIndex;
    }
    this.updateDynamicContent();
  }

  updateFurniSlots() {
    tGiveFurniPool = this.getComponent().getGiveFurniPool();
    tFurniAmount = tGiveFurniPool.count;
    tCurrentPageFirstIndex = ((pCurrentPageIndex - 1) * pFurnisPerPage) + 1;
    tSlotWidth = pWindowObj.getElement("rec_drop_slot_1").getProperty(Symbol.for("width"));
    tSlotHeight = pWindowObj.getElement("rec_drop_slot_1").getProperty(Symbol.for("height"));
    tEmptyImage = image(tSlotWidth, tSlotHeight, 8);
    for (let tTemp = 1; tTemp <= pFurnisPerPage; tTemp++) {
      tElement = pWindowObj.getElement(`rec_drop_slot_${tTemp}`);
      tElement.feedImage(tEmptyImage);
    }
    tLastFurniIndexOnPage = min(list(tFurniAmount, tCurrentPageFirstIndex + pFurnisPerPage - 1));
    tSlotNo = 1;
    for (let tFurniIndex = tCurrentPageFirstIndex; tFurniIndex <= tLastFurniIndexOnPage; tFurniIndex++) {
      tFurniItem = tGiveFurniPool[tFurniIndex];
      tIconImage = image(tSlotWidth, tSlotHeight, 32);
      tIconImage.fill(0, 0, tSlotWidth, tSlotHeight, propList("color", color(255, 255, 255)));
      tSlotElement = pWindowObj.getElement(`rec_drop_slot_${tSlotNo}`);
      tProps = tFurniItem[Symbol.for("props")];
      tClass = tFurniItem[Symbol.for("class")];
      tMemStr = this.detectMemberName(tClass, tProps);
      tFurniImage = getObject("Preview_renderer").renderPreviewImage(tMemStr, VOID, tProps[Symbol.for("colors")], tProps[Symbol.for("class")]);
      tWidthMargin = (tSlotWidth - tFurniImage.width) / 2;
      tHeightMargin = (tSlotHeight - tFurniImage.height) / 2;
      tTargetRect = tFurniImage.rect + rect(tWidthMargin, tHeightMargin, tWidthMargin, tHeightMargin);
      tIconImage.copyPixels(tFurniImage, tTargetRect, tFurniImage.rect);
      tSlotElement.feedImage(tIconImage);
      tSlotElement.setProperty(Symbol.for("blend"), 100);
      tSlotNo = tSlotNo + 1;
    }
  }

  updateNextAndPrevButtons() {
    if (pWindowObj.elementExists("rec_next") && pWindowObj.elementExists("rec_prev")) {
      tNextElement = pWindowObj.getElement("rec_next");
      tPrevElement = pWindowObj.getElement("rec_prev");
    } else {
      return 0;
    }
    if (pCurrentPageIndex == 1) {
      tPrevElement.setProperty(Symbol.for("visible"), 0);
    } else {
      tPrevElement.setProperty(Symbol.for("visible"), 1);
    }
    if (pCurrentPageIndex == pLastPageIndex) {
      tNextElement.setProperty(Symbol.for("visible"), 0);
    } else {
      tNextElement.setProperty(Symbol.for("visible"), 1);
    }
  }

  updatePageIndexes() {
    if (pWindowObj.elementExists("rec_page")) {
      pWindowObj.getElement("rec_page").setText(`${pCurrentPageIndex}/${pLastPageIndex}`);
    } else {
      return 0;
    }
  }

  updateAcceptButtonOpenState() {
    tComponent = this.getComponent();
    tCurrentAmount = tComponent.getGiveFurniPool().count;
    tCurrentSelectableFurni = tComponent.getRewardItemForCurrentAmount();
    tCurrentFurniElement = pWindowObj.getElement("rec_current_name");
    tCurrentBarElement = pWindowObj.getElement("rec_current_btn");
    tCurrentBarTextElement = pWindowObj.getElement("rec_accept_text");
    tBarWidth = tCurrentBarElement.getProperty(Symbol.for("width"));
    tActive = 0;
    if (tCurrentSelectableFurni != VOID) {
      if (tCurrentSelectableFurni[Symbol.for("furniValue")] <= tCurrentAmount) {
        tActive = 1;
        tCurrentFurniElement.setProperty(Symbol.for("blend"), 100);
        tCurrentBarElement.setProperty(Symbol.for("image"), this.getCustomButtonImage(tBarWidth, "green"));
        tCurrentBarElement.setProperty(Symbol.for("cursor"), "cursor.finger");
        tCurrentBarElement.setProperty(Symbol.for("blend"), 100);
        tCurrentBarTextElement.setProperty(Symbol.for("blend"), 100);
        tCurrentFurniElement.setText(tCurrentSelectableFurni[Symbol.for("name")]);
        tCurrentBarTextElement.setProperty(Symbol.for("cursor"), "cursor.finger");
        pAcceptBtnActive = 1;
      }
    }
    if (!tActive) {
      tCurrentFurniElement.setProperty(Symbol.for("blend"), 0);
      tCurrentBarElement.setProperty(Symbol.for("image"), this.getCustomButtonImage(tBarWidth, "gray"));
      tCurrentBarElement.setProperty(Symbol.for("cursor"), "cursor.arrow");
      tCurrentBarElement.setProperty(Symbol.for("blend"), 0);
      tCurrentBarTextElement.setProperty(Symbol.for("blend"), 0);
      tCurrentBarTextElement.setProperty(Symbol.for("cursor"), "cursor.arrow");
      pAcceptBtnActive = 0;
    }
  }

  updateAcceptButton() {
    tCurrentBarElement = pWindowObj.getElement("rec_accept_btn");
    tBarWidth = tCurrentBarElement.getProperty(Symbol.for("width"));
    tCurrentBarElement.setProperty(Symbol.for("image"), this.getCustomButtonImage(tBarWidth, "green"));
  }

  updateCancelButton() {
    tCurrentBarElement = pWindowObj.getElement("rec_cancel_btn");
    tBarTextElement = pWindowObj.getElement("rec_cancel_text");
    tBarWidth = tCurrentBarElement.getProperty(Symbol.for("width"));
    tCurrentBarElement.setProperty(Symbol.for("visible"), 1);
    tBarTextElement.setProperty(Symbol.for("visible"), 1);
    tCurrentBarElement.setProperty(Symbol.for("image"), this.getCustomButtonImage(tBarWidth, "orange"));
  }

  hideCancelButton() {
    tCurrentBarElement = pWindowObj.getElement("rec_cancel_btn");
    tCurrentBarElement.setProperty(Symbol.for("visible"), 0);
    tBarTextElement = pWindowObj.getElement("rec_cancel_text");
    tBarTextElement.setProperty(Symbol.for("visible"), 0);
  }

  updateProgressBar() {
    tComponent = this.getComponent();
    tCurrentAmount = tComponent.getGiveFurniPool().count;
    tNextItem = tComponent.getNextRewardItemForCurrentAmount();
    tNextFurniElement = pWindowObj.getElement("rec_target_name");
    tProgressBarElement = pWindowObj.getElement("rec_target_bar");
    tNextCounterElement = pWindowObj.getElement("rec_target_counter");
    tBarWidth = tProgressBarElement.getProperty(Symbol.for("width"));
    if (tNextItem != VOID) {
      tCurrentAcceptapleCount = 0;
      tCurrentSelectableFurni = tComponent.getRewardItemForCurrentAmount();
      tNextAmount = tNextItem[Symbol.for("furniValue")];
      if (tCurrentSelectableFurni != VOID) {
        tCurrentAcceptableCount = tCurrentSelectableFurni[Symbol.for("furniValue")];
        tPercentage = integer(float(tCurrentAmount - tCurrentAcceptableCount) / (tNextAmount - tCurrentAcceptableCount) * 100);
      } else {
        tPercentage = integer(float(tCurrentAmount) / tNextAmount * 100);
      }
      tNextFurniElement.setProperty(Symbol.for("blend"), 100);
      tNextFurniElement.setText(tNextItem[Symbol.for("name")]);
      tProgressBarElement.setProperty(Symbol.for("blend"), 100);
      tProgressBarElement.setProperty(Symbol.for("image"), this.getBarImage(tBarWidth, tPercentage, "yellow"));
      tNextCounterElement.setProperty(Symbol.for("blend"), 100);
      tNextCounterElement.setText(`${tCurrentAmount}/${tNextAmount}`);
    } else {
      tNextFurniElement.setProperty(Symbol.for("blend"), 0);
      tProgressBarElement.setProperty(Symbol.for("blend"), 0);
      tNextCounterElement.setProperty(Symbol.for("blend"), 0);
    }
  }

  getCustomButtonImage(tWidth, tColor) {
    if (voidp(tColor)) {
      tColor = "green";
    }
    return this.getBarImage(tWidth, 100, tColor);
  }

  getBarImage(tBarWidth, tPercentage, tColor) {
    if (voidp(tColor)) {
      tColor = "orange";
    }
    tBarHeight = 29;
    tMarginWidth = 8;
    tBgColor = "gray";
    if (tPercentage == 100) {
      tBgColor = tColor;
    } else {
      if (tPercentage == 0) {
        tColor = tBgColor;
      }
    }
    tMarginLeftImg = member(getmemnum(`ctlg_recycler_bar_left_${tColor}`)).image;
    tMarginRightImg = member(getmemnum(`ctlg_recycler_bar_right_${tBgColor}`)).image;
    tBarBgImg = member(getmemnum(`ctlg_recycler_bar_middle_${tBgColor}`)).image;
    tBarPercentageImg = member(getmemnum(`ctlg_recycler_bar_middle_${tColor}`)).image;
    tBarImage = image(tBarWidth, tBarHeight, 32);
    tTargetRect = rect(0, 0, tMarginWidth, tBarHeight);
    tBarImage.copyPixels(tMarginLeftImg, tTargetRect, tMarginLeftImg.rect);
    tTargetRect = rect(tBarWidth - tMarginWidth, 0, tBarWidth, tBarHeight);
    tBarImage.copyPixels(tMarginRightImg, tTargetRect, tMarginRightImg.rect);
    tTargetRect = rect(tMarginWidth, 0, tBarWidth - tMarginWidth, tBarHeight);
    tBarImage.copyPixels(tBarBgImg, tTargetRect, tBarBgImg.rect);
    tPercentagePixels = integer((tBarWidth - (2 * tMarginWidth)) * (tPercentage / 100.0));
    tTargetRect = rect(tMarginWidth, 0, tMarginWidth + tPercentagePixels, tBarHeight);
    tBarImage.copyPixels(tBarPercentageImg, tTargetRect, tBarPercentageImg.rect);
    return tBarImage;
  }

  detectMemberName(tClass, tProps) {
    tMemStr = "no_icon_small";
    tDelim = the.itemDelimiter;
    the.itemDelimiter = "*";
    tClass = tClass.item[1];
    the.itemDelimiter = tDelim;
    if (tClass.includes("post.it")) {
      tCount = integer(value(tProps[Symbol.for("props")]) / (20.0 / 6.0));
      if (tCount > 6) {
        tCount = 6;
      }
      if (tCount < 1) {
        tCount = 1;
      }
      if (memberExists(`${tClass}_${tCount}_small`)) {
        tMemStr = `${tClass}_${tCount}_small`;
      } else {
        error(this, `Couldn't define member for recycler item!${RETURN}${tProps}`, Symbol.for("detectMemberNameString"), Symbol.for("minor"));
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
              if (memberExists(`rightwall ${tClass} ${tProps[Symbol.for("props")]}`)) {
                tMemStr = `rightwall ${tClass} ${tProps[Symbol.for("props")]}`;
              }
            }
          }
        }
      }
    }
    return tMemStr;
  }
}
