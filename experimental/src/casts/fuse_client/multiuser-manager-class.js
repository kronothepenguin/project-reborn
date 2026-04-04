/**
 * Multiuser Manager Class
 * Translated from: 45_Multiuser Manager Class.ls
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ManagerTemplate } from './manager-template-class.js';
import { ObjectManager } from './object-manager-class.js';

export class MultiuserManager extends ManagerTemplate {
  constructor() {
    super();
  }

  create(tID, tHost, tPort) {
    return super.create(tID, ['Multiuser Instance Class']);
  }
}

ObjectManager.registerClass('Multiuser Manager Class', MultiuserManager);
