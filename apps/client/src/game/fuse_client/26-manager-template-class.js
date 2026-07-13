export default class {
  pItemList;

  construct() {
    this.pItemList = list();
    this.pItemList.sort();
    return 1;
  }

  deconstruct() {
    const tObjMngr = getObjectManager();
    for (let i = 1; i <= this.pItemList.count; i++) {
      if (tObjMngr.exists(this.pItemList[i])) {
        tObjMngr.Remove(this.pItemList[i]);
      }
    }
    this.pItemList = list();
    return 1;
  }

  create(tID, tClass) {
    if (getObjectManager().exists(tID)) {
      return error(this, `Object already exists: ${tID}`, Symbol.for("create"), Symbol.for("major"));
    }
    if (!getObjectManager().create(tID, tClass)) {
      return 0;
    }
    this.pItemList.add(tID);
    return 1;
  }

  GET(tID) {
    return getObjectManager().GET(tID);
  }

  getIDList() {
    const tIDList = list();
    const tListMode = ilk(this.pItemList);
    for (let i = 1; i <= this.pItemList.count; i++) {
      let tID;
      if (tListMode == Symbol.for("list")) {
        tID = this.pItemList[i];
      } else {
        tID = this.pItemList.getPropAt(i);
      }
      tIDList.add(tID);
    }
    return tIDList;
  }

  Remove(tID) {
    if (!this.exists(tID)) {
      return 0;
    }
    this.pItemList.deleteOne(tID);
    return getObjectManager().Remove(tID);
  }

  exists(tID) {
    return this.pItemList.getOne(tID) > 0;
  }

  print() {
    const tListMode = ilk(this.pItemList);
    for (let i = 1; i <= this.pItemList.count; i++) {
      let tID;
      if (tListMode == Symbol.for("list")) {
        tID = this.pItemList[i];
      } else {
        tID = this.pItemList.getPropAt(i);
      }
      const tObj = this.GET(tID);
      if (symbolp(tID)) {
        tID = `#${tID}`;
      }
      put(tID, " ", ":", " ", tObj);
    }
    return 1;
  }
}
