/**
 * Manager Template Class
 * 
 * Translated from: casts/fuse_client/26_Manager Template Class.ls
 * 
 * Base template for all manager classes.
 * Provides basic CRUD operations on a list of managed objects.
 */

import { VOID, voidp, symbolp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { error, getObjectManager } from './object-api.js';

export class ManagerTemplate extends ObjectBase {
  constructor() {
    super();

    /** @type {Array} List of managed object IDs */
    this.itemList = [];
  }

  construct() {
    this.itemList = [];
    return 1;
  }

  deconstruct() {
    const objMngr = getObjectManager();
    for (const id of this.itemList) {
      if (objMngr.exists(id)) {
        objMngr.remove(id);
      }
    }
    this.itemList = [];
    return 1;
  }

  /**
   * Create an object and add to the managed list
   */
  create(tID, tClass) {
    const objMngr = getObjectManager();
    if (objMngr.exists(tID)) {
      error(this, `Object already exists: ${tID}`, 'create', 'major');
      return 0;
    }
    if (!objMngr.create(tID, tClass)) {
      return 0;
    }
    this.itemList.push(tID);
    return 1;
  }

  /**
   * Get an object by ID
   */
  get(tID) {
    return getObjectManager().get(tID);
  }

  /**
   * Get list of all managed IDs
   */
  getIDList() {
    return [...this.itemList];
  }

  /**
   * Remove an object
   */
  remove(tID) {
    if (!this.exists(tID)) return 0;

    const idx = this.itemList.indexOf(tID);
    if (idx >= 0) this.itemList.splice(idx, 1);

    return getObjectManager().remove(tID);
  }

  /**
   * Check if object exists in managed list
   */
  exists(tID) {
    return this.itemList.includes(tID);
  }

  /**
   * Print managed objects (debug)
   */
  print() {
    const objMngr = getObjectManager();
    console.log(`--- ${this.id || 'Manager'} ---`);
    for (const tID of this.itemList) {
      const tObj = objMngr.get(tID);
      const idStr = symbolp(tID) ? '#' + tID : String(tID);
      console.log(`  ${idStr}: ${tObj}`);
    }
    return 1;
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Manager Template Class', ManagerTemplate);
