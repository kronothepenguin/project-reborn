// fuse_client/26_Manager Template Class.ls → manager-template-class.js
// Base template class for all manager classes

import { symbol, symbolp, error } from "../core/lingo-runtime.js";
import { getObjectManager } from "./object-api.js";

export class ManagerTemplateClass {
  constructor() {
    this.pItemList = [];
  }

  construct() {
    this.pItemList = [];
    this.pItemList.sort();
    return true;
  }

  deconstruct() {
    const tObjMngr = getObjectManager();
    for (let i = 0; i < this.pItemList.length; i++) {
      if (tObjMngr.exists(this.pItemList[i])) {
        tObjMngr.Remove(this.pItemList[i]);
      }
    }
    this.pItemList = [];
    return true;
  }

  create(tID, tClass) {
    if (getObjectManager().exists(tID)) {
      return error(
        this,
        "Object already exists: " + tID,
        symbol("#create"),
        symbol("#major"),
      );
    }
    if (!getObjectManager().create(tID, tClass)) {
      return false;
    }
    this.pItemList.push(tID);
    return true;
  }

  GET(tID) {
    return getObjectManager().GET(tID);
  }

  getIDList() {
    const tIDList = [];
    const tListMode = typeof this.pItemList;
    for (let i = 0; i < this.pItemList.length; i++) {
      let tID;
      if (Array.isArray(this.pItemList)) {
        tID = this.pItemList[i];
      } else {
        // propList
        tID = this.pItemList.getPropAt(i + 1);
      }
      tIDList.push(tID);
    }
    return tIDList;
  }

  Remove(tID) {
    if (!this.exists(tID)) {
      return false;
    }
    const idx = this.pItemList.indexOf(tID);
    if (idx >= 0) this.pItemList.splice(idx, 1);
    return getObjectManager().Remove(tID);
  }

  exists(tID) {
    return this.pItemList.indexOf(tID) >= 0;
  }

  print() {
    const tListMode = typeof this.pItemList;
    for (let i = 0; i < this.pItemList.length; i++) {
      let tID;
      if (Array.isArray(this.pItemList)) {
        tID = this.pItemList[i];
      } else {
        tID = this.pItemList.getPropAt(i + 1);
      }
      const tObj = this.GET(tID);
      let tIDStr = symbolp(tID) ? "#" + tID.toString() : String(tID);
      console.log(tIDStr, ":", tObj);
    }
    return true;
  }
}
