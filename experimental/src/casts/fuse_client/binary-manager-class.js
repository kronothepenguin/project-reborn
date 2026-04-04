/**
 * Binary Manager Class
 * Translated from: 42_Binary Manager Class.ls
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';

export class BinaryManager extends ObjectBase {
  constructor() {
    super();
    this.data = new Map();
    this.queue = [];
  }

  construct() { this.data = new Map(); this.queue = []; return 1; }
  deconstruct() { this.data.clear(); this.queue = []; return 1; }

  async retrieveData(tID, tAuth, tCallBackObject) {
    // In production, would fetch binary data from server
    return this.data.get(tID) || VOID;
  }

  storeData(tdata, tCallBackObject) {
    this.queue.push(tdata);
    return 1;
  }

  addMessageToQueue(tMsg) {
    this.queue.push(tMsg);
    return 1;
  }
}

ObjectManager.registerClass('Binary Manager Class', BinaryManager);
