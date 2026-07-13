export default class {
  pPupItemList;

  render() {
    this.ancestor.render(this);
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    const tItemRef = tService.getObservedGame();
    if (tItemRef == 0) {
      return 0;
    }
    let tWndObj = getWindow(this.getWindowId("btm"));
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.unmerge();
    tWndObj.resizeTo(0, 0);
    tWndObj = getWindow(this.getWindowId("spec"));
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.unmerge();
    tWndObj.merge("ig_bb_powerups.window");
    tWndObj.registerProcedure(Symbol.for("eventProcMouseHover"), this.getMainThread().getInterface().getID(), Symbol.for("mouseWithin"));
    this.renderBBPowerups(tItemRef.getProperty(Symbol.for("bb_pups")));
    const tWrapObjRef = this.getWindowWrapper();
    if (tWrapObjRef == 0) {
      return 0;
    }
    tWrapObjRef.render();
    return 1;
  }

  renderBBPowerups(tList) {
    if (tList == 0) {
      tList = list();
    }
    pPupItemList = tList;
    if (tList.count == 0) {
      tList.append(0);
    }
    const tWndObj = getWindow(this.getWindowId("spec"));
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("ig_chosen_powerups");
    if (tElem == 0) {
      return 0;
    }
    const tWidth = tList.count * 32;
    const tHeight = tElem.getProperty(Symbol.for("height"));
    const tImage = image(tWidth, tHeight, 8);
    let tOffsetX = (tWidth / 2) - (tList.count * 16);
    for (const ttype of tList) {
      const tMemNum = getmemnum(`ig_bb_icon_pwrup_${ttype}`);
      if (tMemNum > 0) {
        const tIcon = member(tMemNum).image;
        tImage.copyPixels(tIcon, tIcon.rect + rect(tOffsetX, 0, tOffsetX, 0), tIcon.rect);
        tOffsetX = tOffsetX + 32;
      }
    }
    tElem.feedImage(tImage);
    tElem.moveBy((tElem.getProperty(Symbol.for("width")) / 2) - (tImage.width / 2), 0);
    return 1;
  }

  eventProcMouseHover(tEvent, tSprID, tParam, tWndID) {
    if (tSprID != "ig_chosen_powerups") {
      return 0;
    }
    const tObject = this.getMainThread().getInterface().getTooltipManager();
    if (tObject == 0) {
      return 0;
    }
    const tWndObj = getWindow(tWndID);
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement(tSprID);
    if (tElem == 0) {
      return 0;
    }
    const tsprite = tElem.getProperty(Symbol.for("sprite"));
    if (tsprite == 0) {
      return 0;
    }
    if (pPupItemList.count == 0) {
      return 0;
    }
    const tIndex = ((the.mouseH - tsprite.left) / 32) + 1;
    if (tIndex < 1) {
      return 0;
    }
    if (tIndex > pPupItemList.count) {
      return 0;
    }
    const tLocX = tsprite.left + (tIndex * 32) - 16;
    const tLocY = tsprite.locV;
    return tObject.createTooltipWindow(getText(`bb_powerup_desc_${pPupItemList[tIndex]}`), tLocX, tLocY);
  }
}
