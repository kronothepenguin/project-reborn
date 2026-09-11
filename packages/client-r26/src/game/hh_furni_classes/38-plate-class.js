export default class {
  pPlateID;
  pFrameCounter;
  pStarProps;
  pNumberOfStars;

  construct() {
    this.pPlateID = "trophyplate";
    this.pStarProps = propList();
    this.pNumberOfStars = 3;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("leaveRoom"), this.getID());
    unregisterMessage(Symbol.for("changeRoom"), this.getID());
    removeUpdate(this.getID());
    this.hideStars();
    return 1;
  }

  hidePlate() {
    if (windowExists(this.pPlateID)) {
      removeWindow(this.pPlateID);
    }
    return removeObject(this.getID());
  }

  show(tName, tDate, tMsg, tWindowName) {
    if (windowExists(this.pPlateID)) {
      removeWindow(this.pPlateID);
    }
    if (!createWindow(this.pPlateID, tWindowName)) {
      return error(this, "Failed to open trophy plate window!!!", Symbol.for("show"), Symbol.for("major"));
    } else {
      const tWndObj = getWindow(this.pPlateID);
      tWndObj.center();
      for (const tElemID of list("dedication_text_1", "dedication_text_2")) {
        if (tWndObj.elementExists(tElemID)) {
          tWndObj.getElement(tElemID).setText(tMsg);
        }
      }
      for (const tElemID of list("plate_name_1", "plate_name_2")) {
        if (tWndObj.elementExists(tElemID)) {
          tWndObj.getElement(tElemID).setText(tName);
        }
      }
      for (const tElemID of list("plate_date_1", "plate_date_2")) {
        if (tWndObj.elementExists(tElemID)) {
          tWndObj.getElement(tElemID).setText(tDate);
        }
      }
      registerMessage(Symbol.for("leaveRoom"), this.getID(), Symbol.for("hidePlate"));
      registerMessage(Symbol.for("changeRoom"), this.getID(), Symbol.for("hidePlate"));
      receiveUpdate(this.getID());
    }
    return 1;
  }

  showStars() {
    this.pStarProps = propList();
    for (let f = 1; f <= this.pNumberOfStars; f++) {
      const tSprNum = reserveSprite(this.getID());
      if (tSprNum > 0) {
        this.pStarProps.addProp(f, propList("sprite", tSprNum, "frame", 1, "loc", point(-10, -10)));
        sprite(tSprNum).ink = 8;
        sprite(tSprNum).locZ = getWindow(this.pPlateID).getProperty(Symbol.for("locZ")) + getWindow(this.pPlateID).getProperty(Symbol.for("spriteList")).count;
      }
    }
  }

  hideStars() {
    if (this.pStarProps.ilk == Symbol.for("propList")) {
      if (this.pStarProps.count > 0) {
        for (let f = 1; f <= this.pStarProps.count; f++) {
          if (!voidp(this.pStarProps[f]["sprite"])) {
            const tSpr = this.pStarProps[f]["sprite"];
            releaseSprite(tSpr);
          }
        }
      }
    }
    this.pStarProps = propList();
  }

  update() {
    if (windowExists(this.pPlateID)) {
      if (this.pFrameCounter > 1) {
        if (this.pStarProps.count == 0) {
          showStars(this);
        }
        const tWndObj = getWindow(this.pPlateID);
        const tminX = tWndObj.getProperty(Symbol.for("locX")) + 10;
        const tMaxX = tWndObj.getProperty(Symbol.for("width")) - 10;
        const tMinY = tWndObj.getProperty(Symbol.for("locY")) + 10;
        const tMaxY = tWndObj.getProperty(Symbol.for("height")) - 10;
        this.animateStars(tminX, tMaxX, tMinY, tMaxY);
        this.pFrameCounter = 0;
      } else {
        this.pFrameCounter = this.pFrameCounter + 1;
      }
    } else {
      this.deconstruct();
    }
  }

  animateStars(tminX, tMaxX, tMinY, tMaxY) {
    if (this.pStarProps.ilk == Symbol.for("propList")) {
      if (this.pStarProps.count > 0) {
        for (let f = 1; f <= this.pStarProps.count; f++) {
          const tSpr = sprite(this.pStarProps[f]["sprite"]);
          const tFrame = this.pStarProps[f]["frame"];
          if (tFrame == 1) {
            this.pStarProps[f]["loc"] = point(tminX + random(tMaxX), tMinY + random(tMaxY));
            sprite(tSpr).blend = 40 + random(40);
          }
          if (tFrame > 9) {
            sprite(tSpr).blend = 0;
            if (random(10) == 1) {
              this.pStarProps[f]["frame"] = 1;
            }
            continue;
          }
          sprite(tSpr).loc = this.pStarProps[f]["loc"];
          if (memberExists(`starblink${tFrame}`)) {
            sprite(tSpr).member = member(getmemnum(`starblink${tFrame}`));
          }
          this.pStarProps[f]["frame"] = tFrame + 1;
        }
      }
    }
  }
}
