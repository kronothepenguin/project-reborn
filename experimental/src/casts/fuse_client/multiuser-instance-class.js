/**
 * Multiuser Instance Class
 * Translated from: 52_Multiuser Instance Class.ls
 * Extends Connection Instance with multi-user session management.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ConnectionInstance } from './connection-instance-class.js';
import { ObjectManager } from './object-manager-class.js';

export class MultiuserInstance extends ConnectionInstance {
  constructor() {
    super();
    this.sessionID = null;
    this.userID = null;
    this.connectedUsers = new Map();
  }
}

ObjectManager.registerClass('Multiuser Instance Class', MultiuserInstance);
