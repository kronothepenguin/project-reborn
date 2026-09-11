export default class {
  id;
  valid;
  delays;

  construct() {
    this.valid = 1;
    this.delays = propList();
    return 1;
  }

  deconstruct() {
    if (count(this.delays) > 0) {
      for (let i = 1; i <= count(this.delays); i++) {
        timeout(this.delays.getPropAt(i)).forget();
      }
    }
    this.delays = propList();
    return 1;
  }

  setID(tID) {
    if (voidp(this.id)) {
      this.id = tID;
    } else {
      error(this, `Attempted to redefine object's ID:${RETURN} ${this.id} -> ${tID}`, Symbol.for("setID"), Symbol.for("minor"));
    }
  }

  getID() {
    return this.id;
  }

  delay(tTime, tMethod, tArgument) {
    if (!integerp(tTime)) {
      return error(this, `Integer expected: ${tTime}`, Symbol.for("delay"), Symbol.for("major"));
    }
    if (!symbolp(tMethod)) {
      return error(this, `Symbol expected: ${tMethod}`, Symbol.for("delay"), Symbol.for("major"));
    }
    const tUniqueId = `Delay ${this.getID()} ${the.milliSeconds}`;
    timeout(tUniqueId).new(tTime, Symbol.for("executeDelay"), this);
    const tList = propList("method", tMethod, "argument", tArgument);
    this.delays[tUniqueId] = tList;
    return tUniqueId;
  }

  Cancel(tDelayID) {
    if (voidp(this.delays[tDelayID])) {
      return 0;
    }
    timeout(tDelayID).forget();
    return this.delays.deleteProp(tDelayID);
  }

  getRefCount() {
    return integer(string(param(1)).word[`${string(param(1)).word.count - 1}`]) - 3;
  }

  print() {
    put(this);
  }

  executeDelay(tTimeout) {
    const tID = tTimeout.name;
    const tTask = this.delays[tID];
    this.Cancel(tID);
    call(tTask[Symbol.for("method")], this, tTask[Symbol.for("argument")]);
  }
}
