import { call, integer, integerp, propList, put, RETURN, string, symbolp, the, timeout, VOID, voidp, wordOf } from "../../director";

export default function () {
  let tUniqueId, tList, tID, tTask;

  return {
    id: VOID,
    valid: VOID,
    delays: VOID,

    construct() {
      this.valid = 1;
      this.delays = propList();
      return 1;
    },

    deconstruct() {
      if (this.delays.count > 0) {
        for (let i = 1; i <= this.delays.count; i++) {
          timeout(this.delays.getPropAt(i)).forget();
        }
      }
      this.delays = propList();
      return 1;
    },

    setID(tID) {
      if (voidp(this.id)) {
        this.id = tID;
      } else {
        _director.error(this, "Attempted to redefine object's ID:" + RETURN + this.id + " " + "->" + " " + tID, Symbol.for("setID"), Symbol.for("minor"));
      }
    },

    getID() {
      return this.id;
    },

    delay(tTime, tMethod, tArgument) {
      if (!integerp(tTime)) {
        return _director.error(this, "Integer expected: " + tTime, Symbol.for("delay"), Symbol.for("major"));
      }
      if (!symbolp(tMethod)) {
        return _director.error(this, "Symbol expected: " + tMethod, Symbol.for("delay"), Symbol.for("major"));
      }
      tUniqueId = "Delay " + this.getID() + " " + the.milliSeconds;
      timeout(tUniqueId).new(tTime, Symbol.for("executeDelay"), this);
      tList = propList();
      tList[Symbol.for("method")] = tMethod;
      tList[Symbol.for("argument")] = tArgument;
      this.delays[tUniqueId] = tList;
      return tUniqueId;
    },

    Cancel(tDelayID) {
      if (voidp(this.delays[tDelayID])) {
        return 0;
      }
      timeout(tDelayID).forget();
      return this.delays.deleteProp(tDelayID);
    },

    getRefCount() {
      return integer(wordOf(string(arguments[0]))[wordOf(string(arguments[0])).count - 1]) - 3;
    },

    print() {
      put(this);
    },

    executeDelay(tTimeout) {
      tID = tTimeout.name;
      tTask = this.delays[tID];
      this.Cancel(tID);
      call(tTask[Symbol.for("method")], this, tTask[Symbol.for("argument")]);
    },
  };
}
