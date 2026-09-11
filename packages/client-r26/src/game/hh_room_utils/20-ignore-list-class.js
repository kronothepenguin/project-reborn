export default class {
  pUserNamesPending;
  pIgnoreList;

  construct() {
    this.pUserNamesPending = list();
    registerMessage(Symbol.for("userlogin"), this.getID(), Symbol.for("initIgnoreList"));
    registerMessage(Symbol.for("ignore_user_result"), this.getID(), Symbol.for("saveIgnoreResult"));
    registerMessage(Symbol.for("save_ignore_list"), this.getID(), Symbol.for("saveIgnoreList"));
  }

  deconstruct() {
    unregisterMessage(Symbol.for("userlogin"), this.getID());
    unregisterMessage(Symbol.for("ignore_user_result"), this.getID());
    unregisterMessage(Symbol.for("save_ignore_list"), this.getID());
  }

  initIgnoreList() {
    let tConnection = getConnection(Symbol.for("Info"));
    if (tConnection == 0) {
      return error(this, "Info connection not available.", Symbol.for("construct"));
    }
    tConnection.send("GET_IGNORE_LIST");
    unregisterMessage(Symbol.for("userlogin"), this.getID());
    return 1;
  }

  getIgnoreStatus(tUserName) {
    if (voidp(this.pIgnoreList)) {
      this.reset();
    }
    if (this.pIgnoreList == list()) {
      return 0;
    }
    return this.pIgnoreList.findPos(tUserName);
  }

  setIgnoreStatus(tUserName, tStatus) {
    if (voidp(this.pIgnoreList)) {
      this.reset();
    }
    let tConnection = getConnection(Symbol.for("Info"));
    if (tConnection == 0) {
      return error(this, "Info connection not available.", Symbol.for("construct"));
    }
    if (tUserName == VOID) {
      return 0;
    }
    this.pUserNamesPending.append(tUserName);
    if (tStatus) {
      tConnection.send("IGNOREUSER", propList("string", tUserName));
    } else {
      tConnection.send("UNIGNORE_USER", propList("string", tUserName));
    }
    return 1;
  }

  saveIgnoreList(tList) {
    this.pIgnoreList = tList;
    return 1;
  }

  saveIgnoreResult(tResult) {
    if (this.pUserNamesPending.count == 0) {
      return 0;
    }
    let tUserName = this.pUserNamesPending[1];
    this.pUserNamesPending.deleteAt(1);
    switch (tResult) {
      case 0:
        return error(this, "Ignore user failed.", Symbol.for("saveIgnoreResult"));
      case 1:
        this.addUserToIgnoreList(tUserName);
        break;
      case 2:
        this.addUserToIgnoreList(tUserName);
        this.removeOldestIgnore();
        break;
      case 3:
        this.removeUserFromIgnoreList(tUserName);
        break;
      default:
        return error(this, `Unsupported result for ignore user: ${tResult}`, Symbol.for("saveIgnoreResult"));
    }
    return 1;
  }

  addUserToIgnoreList(tUserName) {
    if (!this.pIgnoreList.findPos(tUserName)) {
      this.pIgnoreList.add(tUserName);
    }
  }

  removeUserFromIgnoreList(tUserName) {
    this.pIgnoreList.deleteOne(tUserName);
  }

  removeOldestIgnore() {
    if (voidp(this.pIgnoreList)) {
      return 0;
    }
    this.pIgnoreList.deleteAt(1);
    return 1;
  }

  reset() {
    this.pIgnoreList = list();
    return 1;
  }
}
