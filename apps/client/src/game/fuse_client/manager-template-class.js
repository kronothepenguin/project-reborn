import { ilk, list, objectp, put, symbolp, VOID } from "../../director";

export default function () {
  return {
    pItemList: VOID,

    construct() {
      this.pItemList = list();
      this.pItemList.sort();
      return true;
    },

    deconstruct() {
      const tObjMngr = _director.getObjectManager();
      for (let i = 1; i <= this.pItemList.count; i++) {
        if (tObjMngr.exists(this.pItemList[i])) {
          tObjMngr.Remove(this.pItemList[i]);
        }
      }
      this.pItemList = list();
      return true;
    },

    create(tID, tClass) {
      if (_director.getObjectManager().exists(tID)) {
        return _director.error(this, "Object already exists: " + tID, Symbol.for("create"), Symbol.for("major"));
      }
      if (!_director.getObjectManager().create(tID, tClass)) {
        return false;
      }
      this.pItemList.add(tID);
      return true;
    },

    GET(tID) {
      return _director.getObjectManager().GET(tID);
    },

    getIDList() {
      const tIDList = list();
      const tListMode = ilk(this.pItemList);
      for (let i = 1; i <= this.pItemList.count; i++) {
        let tID;
        if (tListMode === Symbol.for("list")) {
          tID = this.pItemList[i];
        } else {
          tID = this.pItemList.getPropAt(i);
        }
        tIDList.add(tID);
      }
      return tIDList;
    },

    Remove(tID) {
      if (!this.exists(tID)) {
        return false;
      }
      this.pItemList.deleteOne(tID);
      return _director.getObjectManager().Remove(tID);
    },

    exists(tID) {
      return this.pItemList.getOne(tID) > 0;
    },

    print() {
      const tListMode = ilk(this.pItemList);
      for (let i = 1; i <= this.pItemList.count; i++) {
        let tID;
        if (tListMode === Symbol.for("list")) {
          tID = this.pItemList[i];
        } else {
          tID = this.pItemList.getPropAt(i);
        }
        const tObj = this.GET(tID);
        if (symbolp(tID)) {
          tID = "#" + tID.description;
        }
        put(tID + " : " + tObj);
      }
      return true;
    },
  };
}
