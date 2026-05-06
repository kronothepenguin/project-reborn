import { ilk, objectp, propList, stringp, symbolp, voidp, VOID } from "../../director";

export default function () {
  return {
    pMethodCache: VOID,
    pItemList: VOID,

    construct() {
      this.pMethodCache = propList();
      this.pMethodCache.sort();
      return 1;
    },

    deconstruct() {
      this.pItemList = propList();
      this.pMethodCache = propList();
      return 1;
    },

    create(tID, tObject) {
      if (!this.register(tID, tObject)) {
        return _director.error(
          this,
          `Failed to register object: ${tID}`,
          Symbol.for("create"),
          Symbol.for("major"),
        );
      } else {
        this.pItemList[tID] = tObject;
        return 1;
      }
    },

    getMethod(tConnectionID, tCommand) {
      let tMethods = this.pMethodCache[tConnectionID];
      if (voidp(tMethods)) {
        return _director.error(
          this,
          `Method list for connection not found: ${tConnectionID}`,
          Symbol.for("getMethod"),
          Symbol.for("major"),
        );
      } else {
        return tMethods[tCommand];
      }
    },

    Remove(tID) {
      if (voidp(this.pItemList[tID])) {
        return _director.error(
          this,
          `Object not found: ${tID}`,
          Symbol.for("Remove"),
          Symbol.for("minor"),
        );
      } else {
        this.unregister(tID);
        this.pItemList.deleteProp(tID);
        return 1;
      }
    },

    register(tID, tObject) {
      if (!tObject.handler(Symbol.for("getCommands"))) {
        return _director.error(
          this,
          `Invalid method object: ${tID}`,
          Symbol.for("register"),
          Symbol.for("major"),
        );
      }
      let tMethodList = tObject.getCommands();
      if (ilk(tMethodList) !== Symbol.for("propList")) {
        return _director.error(
          this,
          `Invalid method object: ${tID}`,
          Symbol.for("register"),
          Symbol.for("major"),
        );
      }
      for (let i = 1; i <= tMethodList.count; i++) {
        let tMethod = tMethodList.getPropAt(i);
        if (voidp(this.pMethodCache[tMethod])) {
          this.pMethodCache[tMethod] = propList();
          this.pMethodCache[tMethod].sort();
        }
        let tCurrentList = this.pMethodCache[tMethod];
        for (let j = 1; j <= tMethodList[i].count; j++) {
          if (tObject.handler(tMethodList[i][j])) {
            tCurrentList[tMethodList[i].getPropAt(j)] = [
              tMethodList[i][j],
              tID,
            ];
            continue;
          }
          _director.error(
            this,
            `Method #${tMethodList[i][j]} not found in object: ${tID}`,
            Symbol.for("register"),
            Symbol.for("major"),
          );
        }
      }
      return 1;
    },

    unregister(tObjectOrID) {
      let tID;
      if (objectp(tObjectOrID)) {
        tID = tObjectOrID.getID();
      } else {
        if (stringp(tObjectOrID) || symbolp(tObjectOrID)) {
          if (!this.GET(tObjectOrID)) {
            return _director.error(
              this,
              `Object not found: ${tObjectOrID}`,
              Symbol.for("unregister"),
              Symbol.for("minor"),
            );
          }
          tID = tObjectOrID;
        }
      }
      for (let tConnection = 1; tConnection <= this.pMethodCache.count; tConnection++) {
        for (let tCommand = this.pMethodCache[tConnection].count; tCommand >= 1; tCommand--) {
          if (this.pMethodCache[tConnection][tCommand][2] === tID) {
            this.pMethodCache[tConnection].deleteAt(tCommand);
          }
        }
      }
      return 1;
    },
  };
}
