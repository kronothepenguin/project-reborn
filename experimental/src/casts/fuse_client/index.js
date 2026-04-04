/**
 * fuse_client cast entry point
 * 
 * This file serves as the module entry point for the fuse_client cast.
 * It re-exports all public APIs from the core FuseClient framework.
 * 
 * In the original Director movie, this is fuse_client.cct.
 */

// Object API
export {
  constructObjectManager,
  deconstructObjectManager,
  getObjectManager,
  createObject,
  removeObject,
  getObject,
  objectExists,
  printObjects,
  registerObject,
  unregisterObject,
  createManager,
  removeManager,
  getManager,
  managerExists,
  printManagers,
  registerManager,
  unregisterManager,
  receivePrepare,
  removePrepare,
  receiveUpdate,
  removeUpdate,
  pauseUpdate,
  unpauseUpdate,
} from './object-api.js';

// Thread API
export {
  constructThreadManager,
  deconstructThreadManager,
  getThreadManager,
  createThread,
  removeThread,
  getThread,
  threadExists,
  initThread,
  initExistingThreads,
  closeThread,
  closeExistingThreads,
  printThreads,
} from './thread-api.js';

// Client Initialization
export { initCore, stopClient, resetClient } from './client-initialization.js';

// Error API
export { error, fatalError, serverError } from './error-api.js';

// Event Broker
export { eventBroker, registerEventProcedure, removeEventProcedure, stopEvent, pass } from './event-broker.js';

// Object Manager Class (for registration)
export { ObjectManager } from './object-manager-class.js';
export { ObjectBase } from './object-base-class.js';
export { ThreadManager } from './thread-manager-class.js';
