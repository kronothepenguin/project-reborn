/**
 * Thread Instance Class
 * Translated from: 70_Thread Instance Class.ls
 * Holds interface, component, and handler references for a thread.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';

export class ThreadInstance extends ObjectBase {
  constructor() {
    super();
    this.interface = 0;
    this.component = 0;
    this.handler = 0;
  }

  construct() {
    this.interface = 0;
    this.component = 0;
    this.handler = 0;
    return 1;
  }

  deconstruct() {
    this.interface = 0;
    this.component = 0;
    this.handler = 0;
    return 1;
  }

  getInterface() { return this.interface; }
  getComponent() { return this.component; }
  getHandler() { return this.handler; }
}

ObjectManager.registerClass('Thread Instance Class', ThreadInstance);
