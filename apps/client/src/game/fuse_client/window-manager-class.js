import {
  getClassVariable,
  getIntVariable,
  getVariableValue,
  image,
  integerp,
  list,
  member,
  propList,
  rect,
  rgb,
  the,
  VOID,
  voidp,
} from "../../director";

export default function () {
  let tNull, tLayout, tLocX, tLocY, tSpecial, tX, tY, tItem, tProps;
  let tWndObj, tNextActive, tModals, i, tCurrID, tSpr, tPosition, tModal;

  return {
    pLockLocZ: VOID,
    pDefLocX: VOID,
    pDefLocY: VOID,
    pClsList: VOID,
    pModalID: VOID,
    pLastEventData: VOID,
    pItemList: VOID,
    pHideList: VOID,
    pPosCache: VOID,
    pAvailableLocZ: VOID,
    pDefaultLocZ: VOID,
    pActiveItem: VOID,
    pBoundary: VOID,
    pInstanceClass: VOID,

    construct() {
      this.pLastEventData = propList();
      this.pLockLocZ = 0;
      this.pDefLocX = getIntVariable("window.default.locx", 100);
      this.pDefLocY = getIntVariable("window.default.locy", 100);
      this.pItemList = list();
      this.pHideList = list();
      this.setProperty(Symbol.for("defaultLocZ"), getIntVariable("window.default.locz", 0));
      this.pBoundary = rect(0, 0, (the.stage).rect.width, (the.stage).rect.height) + getVariableValue("window.boundary.limit");
      this.pInstanceClass = getClassVariable("window.instance.class");
      this.pClsList = propList();
      this.pModalID = Symbol.for("modal");
      this.pClsList[Symbol.for("wrapper")] = getClassVariable("window.wrapper.class");
      this.pClsList[Symbol.for("unique")] = getClassVariable("window.unique.class");
      this.pClsList[Symbol.for("grouped")] = getClassVariable("window.grouped.class");
      if (!_director.memberExists("null")) {
        tNull = member(_director.createMember("null", Symbol.for("bitmap")));
        tNull.image = image(1, 1, 8);
        tNull.image.setPixel(0, 0, rgb(0, 0, 0));
      }
      if (!_director.objectExists(Symbol.for("layout_parser"))) {
        _director.createObject(Symbol.for("layout_parser"), getClassVariable("layout.parser.class"));
      }
      return 1;
    },

    create(tID, tLayout, tLocX, tLocY, tSpecial) {
      switch (tSpecial) {
        case Symbol.for("modal"):
          return this.modal(tID, tLayout);
        case Symbol.for("modalcorner"):
          return this.modal(tID, tLayout, Symbol.for("corner"));
      }
      if (voidp(tLayout)) {
        tLayout = "empty.window";
      }
      if (this.exists(tID)) {
        if (voidp(tLocX)) {
          tLocX = this.GET(tID).getProperty(Symbol.for("locX"));
        }
        if (voidp(tLocY)) {
          tLocY = this.GET(tID).getProperty(Symbol.for("locY"));
        }
        this.Remove(tID);
      }
      if (integerp(tLocX) && integerp(tLocY)) {
        tX = tLocX;
        tY = tLocY;
      } else {
        if (!voidp(this.pPosCache[tID])) {
          tX = this.pPosCache[tID][1];
          tY = this.pPosCache[tID][2];
        } else {
          tX = this.pDefLocX;
          tY = this.pDefLocY;
        }
      }
      tItem = _director.getObjectManager().create(tID, this.pInstanceClass);
      if (!tItem) {
        return _director.error(this, `Failed to create window object: ${tID}`, Symbol.for("create"), Symbol.for("major"));
      }
      tProps = propList();
      tProps[Symbol.for("locX")] = tX;
      tProps[Symbol.for("locY")] = tY;
      tProps[Symbol.for("locZ")] = this.pAvailableLocZ;
      tProps[Symbol.for("boundary")] = this.pBoundary;
      tProps[Symbol.for("elements")] = this.pClsList;
      tProps[Symbol.for("manager")] = this;
      if (!tItem.define(tProps)) {
        _director.getObjectManager().Remove(tID);
        return 0;
      }
      if (!tItem.merge(tLayout)) {
        _director.getObjectManager().Remove(tID);
        return 0;
      }
      this.pItemList.add(tID);
      this.pAvailableLocZ = this.pAvailableLocZ + tItem.getProperty(Symbol.for("sprCount"));
      this.Activate();
      return 1;
    },

    Remove(tID) {
      tWndObj = this.GET(tID);
      if (tWndObj === 0) {
        return 0;
      }
      this.pPosCache[tID] = list(tWndObj.getProperty(Symbol.for("locX")), tWndObj.getProperty(Symbol.for("locY")));
      _director.getObjectManager().Remove(tID);
      this.pItemList.deleteOne(tID);
      if (this.pActiveItem === tID) {
        tNextActive = this.pItemList.getLast();
      } else {
        tNextActive = this.pActiveItem;
      }
      if (this.exists(this.pModalID)) {
        tModals = 0;
        for (let i = this.pItemList.count; i >= 1; i--) {
          tID = this.pItemList[i];
          if (this.GET(tID).getProperty(Symbol.for("modal"))) {
            tModals = 1;
            tNextActive = tID;
            break;
          }
        }
        if (!tModals) {
          this.Remove(this.pModalID);
        }
      }
      this.Activate(tNextActive);
      return 1;
    },

    Activate(tID) {
      if (this.pLockLocZ) {
        return 0;
      }
      if (this.pItemList.count === 0) {
        return 0;
      }
      if (this.exists(this.pActiveItem)) {
        if (this.GET(this.pActiveItem).getProperty(Symbol.for("modal"))) {
          tID = this.pActiveItem;
          if (this.exists(this.pModalID)) {
            this.pItemList.deleteOne(this.pModalID);
            this.pItemList.append(this.pModalID);
          }
        }
      }
      if (voidp(tID)) {
        tID = this.pItemList.getLast();
      } else {
        if (!this.exists(tID)) {
          return 0;
        }
      }
      this.pItemList.deleteOne(tID);
      this.pItemList.append(tID);
      this.pAvailableLocZ = this.pDefaultLocZ;
      for (const tCurrID of this.pItemList) {
        tWndObj = this.GET(tCurrID);
        tWndObj.setDeactive();
        for (const tSpr of tWndObj.getProperty(Symbol.for("spriteList"))) {
          tSpr.locZ = this.pAvailableLocZ;
          this.pAvailableLocZ = this.pAvailableLocZ + 1;
        }
      }
      this.pActiveItem = tID;
      return this.GET(tID).setActive();
    },

    reorder(tNewOrder) {
      if (tNewOrder === this.pItemList) {
        return 1;
      }
      this.pItemList = tNewOrder;
      this.pAvailableLocZ = this.pDefaultLocZ;
      for (const tCurrID of this.pItemList) {
        tWndObj = this.GET(tCurrID);
        for (const tSpr of tWndObj.getProperty(Symbol.for("spriteList"))) {
          tSpr.locZ = this.pAvailableLocZ;
          this.pAvailableLocZ = this.pAvailableLocZ + 1;
        }
      }
    },

    deactivate(tID) {
      if (this.exists(tID)) {
        if (!this.GET(tID).getProperty(Symbol.for("modal"))) {
          this.pItemList.deleteOne(tID);
          this.pItemList.addAt(1, tID);
          this.Activate();
          return 1;
        }
      }
      return 0;
    },

    lock() {
      this.pLockLocZ = 1;
      return 1;
    },

    unlock() {
      this.pLockLocZ = 0;
      return 1;
    },

    modal(tID, tLayout, tPosition) {
      if (voidp(tPosition)) {
        tPosition = Symbol.for("center");
      }
      if (!this.create(tID, tLayout)) {
        return 0;
      }
      tWndObj = this.GET(tID);
      switch (tPosition) {
        case Symbol.for("center"):
          tWndObj.center();
          break;
        case Symbol.for("corner"):
          tWndObj.moveTo(0, 0);
          break;
      }
      tWndObj.lock();
      tWndObj.setProperty(Symbol.for("modal"), 1);
      if (!this.exists(this.pModalID)) {
        if (this.create(this.pModalID, "modal.window")) {
          tModal = this.GET(this.pModalID);
          tModal.moveTo(0, 0);
          tModal.resizeTo((the.stage).rect.width, (the.stage).rect.height);
          tModal.lock();
          tModal.getElement("modal").setProperty(Symbol.for("blend"), 40);
        } else {
          _director.error(this, "Failed to create modal window layer!", Symbol.for("modal"), Symbol.for("major"));
        }
      }
      the.keyboardFocusSprite = 0;
      this.pActiveItem = tID;
      this.Activate(tID);
      return 1;
    },

    registerWindowEvent(tTitle, tSprID, tEvent) {
      this.pLastEventData[Symbol.for("title")] = tTitle;
      this.pLastEventData[Symbol.for("sprite")] = tSprID;
      this.pLastEventData[Symbol.for("Event")] = tEvent;
    },

    getLastEvent() {
      return this.pLastEventData[Symbol.for("title")] + "-" + this.pLastEventData[Symbol.for("sprite")] + "-" + this.pLastEventData[Symbol.for("Event")];
    },
  };
}
