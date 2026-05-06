import {
  EMPTY,
  VOID,
  call,
  getObjectManager,
  ilk,
  integerp,
  list,
  listp,
  propList,
  rect,
  the,
} from "../../director";

export default function () {
  let tID, tLayout, tLocX, tLocY, tItem, tProps, tObj, tItem2, tValue;

  return {
    pInstanceClass: VOID,
    pActiveItem: VOID,
    pDefaultLocZ: VOID,
    pAvailableLocZ: VOID,
    pPosCache: VOID,
    pHideList: VOID,
    pBoundary: VOID,

    construct() {
      this.pInstanceClass = _director.getClassVariable("visualizer.instance.class");
      this.pActiveItem = EMPTY;
      this.pPosCache = propList();
      this.pHideList = list();
      this.pDefaultLocZ = _director.getIntVariable("visualizer.default.locz", -20000000);
      this.pAvailableLocZ = this.pDefaultLocZ;
      this.pBoundary = rect(0, 0, (the.stage).rect.width, (the.stage).rect.height) + _director.getVariableValue("visualizer.boundary.limit");
      if (!_director.objectExists(Symbol.for("layout_parser"))) {
        _director.createObject(Symbol.for("layout_parser"), _director.getClassVariable("layout.parser.class"));
      }
      return 1;
    },

    create(tID, tLayout, tLocX, tLocY) {
      if (!integerp(tLocX)) {
        tLocX = 0;
      }
      if (!integerp(tLocY)) {
        tLocY = 0;
      }
      if (this.exists(tID)) {
        this.Remove(tID);
      }
      tItem = getObjectManager().create(tID, this.pInstanceClass);
      if (!tItem) {
        return _director.error(this, "Item creation failed:" + " " + tID, Symbol.for("create"), Symbol.for("major"));
      }
      tProps = propList();
      tProps[Symbol.for("locX")] = tLocX;
      tProps[Symbol.for("locY")] = tLocY;
      tProps[Symbol.for("locZ")] = this.pAvailableLocZ;
      tProps[Symbol.for("layout")] = tLayout;
      tProps[Symbol.for("boundary")] = this.pBoundary;
      if (!tItem.define(tProps)) {
        getObjectManager().Remove(tID);
        return 0;
      }
      this.pItemList.add(tID);
      this.pAvailableLocZ = this.pAvailableLocZ + tItem.getProperty(Symbol.for("sprCount"));
      return 1;
    },

    Remove(tID) {
      if (!this.exists(tID)) {
        return 0;
      }
      tItem = this.GET(tID);
      this.pAvailableLocZ = this.pAvailableLocZ - tItem.getProperty(Symbol.for("sprCount"));
      this.pPosCache[tID] = [tItem.getProperty(Symbol.for("locX")), tItem.getProperty(Symbol.for("locY"))];
      this.pItemList.deleteOne(tID);
      if (this.pActiveItem === tID) {
        this.pActiveItem = this.pItemList.getLast();
      }
      getObjectManager().Remove(tID);
      this.Activate(this.pItemList.getLast());
      return 1;
    },

    Activate(tID) {
      if (this.exists(tID)) {
        this.pActiveItem = tID;
        this.GET(tID).setActive();
        return 1;
      } else {
        return 0;
      }
    },

    deactivate(tID) {
      if (this.exists(tID)) {
        this.GET(tID).setDeactive();
        return 1;
      } else {
        return 0;
      }
    },

    hideAll() {
      for (tItem2 of this.pItemList) {
        tObj = this.GET(tItem2);
        if (tObj.getProperty(Symbol.for("visible"))) {
          tObj.hide();
          this.pHideList.add(tItem2);
        }
      }
      return 1;
    },

    showAll() {
      for (tItem2 of this.pHideList) {
        tObj = this.GET(tItem2);
        if (tObj !== 0) {
          tObj.show();
        }
      }
      this.pHideList = list();
      return 1;
    },

    getProperty(tProp) {
      switch (tProp) {
        case Symbol.for("defaultLocZ"):
          return this.pDefaultLocZ;
        case Symbol.for("boundary"):
          return this.pBoundary;
        case Symbol.for("count"):
          return this.pItemList.count;
      }
      return 0;
    },

    setProperty(tProp, tValue) {
      switch (tProp) {
        case Symbol.for("defaultLocZ"):
          return this.setDefaultLocZ(tValue);
        case Symbol.for("boundary"):
          return this.setBoundary(tValue);
      }
      return 0;
    },

    setDefaultLocZ(tValue) {
      if (!integerp(tValue)) {
        return _director.error(this, "integer expected:" + " " + tValue, Symbol.for("setDefaultLocZ"), Symbol.for("minor"));
      }
      this.pDefaultLocZ = tValue;
      return this.Activate();
    },

    setBoundary(tValue) {
      if (!listp(tValue) && ilk(tValue) !== Symbol.for("rect")) {
        return _director.error(this, "List or rect expected:" + " " + tValue, Symbol.for("setBoundary"), Symbol.for("minor"));
      }
      this.pBoundary[1] = tValue[1];
      this.pBoundary[2] = tValue[2];
      this.pBoundary[3] = tValue[3];
      this.pBoundary[4] = tValue[4];
      call(Symbol.for("moveBy"), this.pItemList, 0, 0);
      return 1;
    },
  };
}
