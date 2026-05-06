import { EMPTY, VOID, TAB, getObjectManager, propList, symbolp, stringp, voidp, call, put } from "../../director";

export default function () {
  let tList, tID, tMethod, tObject;

  return {
    pItemList: VOID,
    pLastExecutedMessage: VOID,

    construct() {
      this.pLastExecutedMessage = EMPTY;
      this.pItemList = propList();
      this.pItemList.sort();
      return 1;
    },

    deconstruct() {
      this.pItemList = propList();
      return 1;
    },

    create(tMessage) {
      if (!symbolp(tMessage) && !stringp(tMessage)) {
        return _director.error(
          this,
          "Symbol or string expected: " + tMessage,
          Symbol.for("create"),
          Symbol.for("major"),
        );
      }
      if (!voidp(this.pItemList[tMessage])) {
        return _director.error(
          this,
          "Broker task already exists: " + tMessage,
          Symbol.for("create"),
          Symbol.for("major"),
        );
      }
      this.pItemList[tMessage] = propList();
      return 1;
    },

    Remove(tMessage) {
      if (!symbolp(tMessage) && !stringp(tMessage)) {
        return _director.error(
          this,
          "Symbol or string expected: " + tMessage,
          Symbol.for("Remove"),
          Symbol.for("minor"),
        );
      }
      if (voidp(this.pItemList[tMessage])) {
        return _director.error(
          this,
          "Broker task not found: " + tMessage,
          Symbol.for("Remove"),
          Symbol.for("minor"),
        );
      }
      return this.pItemList.deleteProp(tMessage);
    },

    register(tMessage, tClientID, tMethod) {
      if (!symbolp(tMessage) && !stringp(tMessage)) {
        return _director.error(
          this,
          "Symbol or string expected: " + tMessage,
          Symbol.for("register"),
          Symbol.for("major"),
        );
      }
      if (!_director.objectExists(tClientID)) {
        return _director.error(
          this,
          "Object not found: " + tClientID,
          Symbol.for("register"),
          Symbol.for("major"),
        );
      }
      if (voidp(this.pItemList[tMessage])) {
        this.pItemList[tMessage] = propList();
      }
      this.pItemList[tMessage][tClientID] = tMethod;
      return 1;
    },

    unregister(tMessage, tClientID) {
      if (!symbolp(tMessage) && !stringp(tMessage)) {
        return _director.error(
          this,
          "Symbol or string expected: " + tMessage,
          Symbol.for("unregister"),
          Symbol.for("major"),
        );
      }
      tList = this.pItemList[tMessage];
      if (voidp(tList)) {
        return 0;
      }
      tList.deleteProp(tClientID);
      if (tList.count === 0) {
        this.Remove(tMessage);
      }
      return 1;
    },

    Execute(tMessage, tArgA, tArgB, tArgC) {
      tList = this.pItemList[tMessage];
      if (voidp(tList)) {
        return 0;
      }
      for (let i = tList.count; i >= 1; i--) {
        tID = tList.getPropAt(i);
        tMethod = tList[i];
        tObject = getObjectManager().GET(tID);
        if (tObject === 0) {
          this.unregister(tMessage, tID);
          continue;
        }
        if (tMethod !== Symbol.for("invalidateCrapFixer")) {
          this.pLastExecutedMessage = tMethod;
        }
        call(tMethod, [tObject], tArgA, tArgB, tArgC);
      }
      return 1;
    },

    exists(tMessage) {
      return !voidp(this.pItemList[tMessage]);
    },

    print(tMessage) {
      for (let i = 1; i <= this.pItemList.count; i++) {
        put(this.pItemList.getPropAt(i));
        for (let j = 1; j <= this.pItemList[i].count; j++) {
          put(TAB + this.pItemList[i].getPropAt(j) + " -> " + this.pItemList[i][j]);
        }
      }
      return 1;
    },

    getLastExecutedMessageId() {
      return this.pLastExecutedMessage;
    },
  };
}
