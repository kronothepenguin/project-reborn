/**
 * Writer Manager Class
 * Translated from: 43_Writer Manager Class.ls
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';

export class WriterManager extends ObjectBase {
  constructor() {
    super();
    this.items = new Map();
  }

  construct() { this.items = new Map(); return 1; }
  deconstruct() { this.items.clear(); return 1; }

  create(tID, tMetrics) {
    this.items.set(tID, { metrics: tMetrics });
    return 1;
  }

  get(tID) { return this.items.get(tID) || VOID; }
  remove(tID) { this.items.delete(tID); return 1; }
  exists(tID) { return this.items.has(tID); }

  print() {
    console.log('--- Writers ---');
    for (const [id, item] of this.items) console.log(`  ${id}: ${JSON.stringify(item)}`);
    return 1;
  }
}

ObjectManager.registerClass('Writer Manager Class', WriterManager);
