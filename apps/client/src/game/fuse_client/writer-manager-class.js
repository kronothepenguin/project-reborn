import { call, propList, voidp, VOID } from "../../director";

export default function () {
  let tObj;

  return {
    pWriterClass: VOID,
    pPlainStruct: VOID,
    pItemList: VOID,

    construct() {
      this.pWriterClass = _director.getClassVariable("writer.instance.class");
      this.pPlainStruct = _director.getStructVariable("struct.font.plain");
      this.pItemList = propList();
      return 1;
    },

    deconstruct() {
      call(Symbol.for("deconstruct"), this.pItemList);
      this.pItemList = propList();
      return 1;
    },

    create(tID, tMetrics) {
      if (!voidp(this.pItemList[tID])) {
        return _director.error(this, "Writer already exists:" + " " + tID, Symbol.for("create"), Symbol.for("minor"));
      }
      tObj = _director.getObjectManager().create(Symbol.for("temp"), this.pWriterClass);
      if (!tObj) {
        return 0;
      }
      switch (tMetrics.ilk) {
        case Symbol.for("struct"):
          tObj.setFont(tMetrics);
          break;
        default:
          tObj.setFont(this.pPlainStruct);
          tObj.define(tMetrics);
      }
      this.pItemList[tID] = tObj;
      tObj.setID(tID);
      return 1;
    },

    Remove(tID) {
      tObj = this.pItemList[tID];
      if (voidp(tObj)) {
        return _director.error(this, "Writer not found:" + " " + tID, Symbol.for("Remove"), Symbol.for("minor"));
      }
      tObj.deconstruct();
      return this.pItemList.deleteProp(tID);
    },

    GET(tID) {
      tObj = this.pItemList[tID];
      if (voidp(tObj)) {
        return 0;
      }
      return tObj;
    },

    exists(tID) {
      return !voidp(this.pItemList[tID]);
    },
  };
}
