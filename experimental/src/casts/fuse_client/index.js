/**
 * fuse_client cast entry point
 * 
 * This file serves as the module entry point for the fuse_client cast.
 * It re-exports all public APIs from the core FuseClient framework.
 * 
 * In the original Director movie, this is fuse_client.cct.
 */

// ── Object API ───────────────────────────────────────────────────────
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

// ── Thread API ───────────────────────────────────────────────────────
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

// ── Resource API ─────────────────────────────────────────────────────
export {
  constructResourceManager,
  deconstructResourceManager,
  getResourceManager,
  createMember,
  removeMember,
  getMember,
  updateMember,
  registerMember,
  unregisterMember,
  replaceMember,
  memberExists,
  getmemnum,
  printMembers,
} from './resource-api.js';

// ── Download API ─────────────────────────────────────────────────────
export {
  constructDownloadManager,
  deconstructDownloadManager,
  getDownloadManager,
  queueDownload,
  abortDownLoad,
  registerDownloadCallback,
  getDownLoadPercent,
  downloadExists,
  printDownloads,
} from './download-api.js';

// ── Connection API ───────────────────────────────────────────────────
export {
  constructConnectionManager,
  deconstructConnectionManager,
  getConnectionManager,
  createConnection,
  removeConnection,
  getConnection,
  connectionExists,
  printConnections,
  registerListener,
  unregisterListener,
  registerCommands,
  unregisterCommands,
} from './connection-api.js';

// ── CastLoad API ─────────────────────────────────────────────────────
export {
  constructCastLoader,
  deconstructCastLoader,
  getCastLoadManager,
  startCastLoad,
  registerCastloadCallback,
  resetCastLibs,
  getCastLoadPercent,
  FindCastNumber,
  castExists,
  printCasts,
} from './castload-api.js';

// ── Timeout API ──────────────────────────────────────────────────────
export {
  constructTimeoutManager,
  deconstructTimeoutManager,
  getTimeoutManager,
  createTimeout,
  removeTimeout,
  getTimeout,
  timeoutExists,
  printTimeouts,
} from './timeout-api.js';

// ── Window API ───────────────────────────────────────────────────────
export {
  constructWindowManager,
  deconstructWindowManager,
  getWindowManager,
  createWindow,
  removeWindow,
  getWindow,
  getWindowIDList,
  windowExists,
  mergeWindow,
  activateWindowObj,
  deactivateWindowObj,
  registerClient,
  registerProcedure,
  showWindows,
  hideWindows,
  lockWindowLayering,
  unlockWindowLayering,
  printWindows,
} from './window-api.js';

// ── Broker Manager API ───────────────────────────────────────────────
export {
  constructBrokerManager,
  deconstructBrokerManager,
  getBrokerManager,
  createBroker,
  removeBroker,
  getBroker,
  brokerExists,
  printBrokers,
  registerMessage,
  unregisterMessage,
  executeMessage,
} from './broker-api.js';

// ── Variable API ─────────────────────────────────────────────────────
export {
  constructVariableManager,
  deconstructVariableManager,
  getVariableManager,
  createVariable,
  setVariable,
  removeVariable,
  getVariable,
  getIntVariable,
  getStructVariable,
  getClassVariable,
  getVariableValue,
  variableExists,
  printVariables,
  dumpVariableField,
} from './variable-api.js';

// ── Special Services API ─────────────────────────────────────────────
export {
  constructSpecialServices,
  deconstructSpecialServices,
  getSpecialServices,
  createToolTip,
  removeToolTip,
  setcursor,
  openNetPage,
  showLoadingBar,
  getUniqueID,
  getMachineID,
  getPredefinedURL,
  getDomainPart,
  getMoviePath,
  getExtVarPath,
  sendProcessTracking,
  getProcessTrackingList,
  secretDecode,
  readValueFromField,
  checkForXtra,
  performance,
  printMsg,
  callJavaScriptFunction,
  getClientUpTime,
} from './special-services-api.js';

// ── Multiuser API ────────────────────────────────────────────────────
export {
  constructMultiuserManager,
  deconstructMultiuserManager,
  getMultiuserManager,
  createMultiuser,
  removeMultiuser,
  getMultiuser,
  multiuserExists,
  printMultiusers,
} from './multiuser-api.js';

// ── Client Initialization ────────────────────────────────────────────
export { initCore, stopClient, resetClient } from './client-initialization.js';

// ── Error API ────────────────────────────────────────────────────────
export { error, fatalError, serverError } from './error-api.js';

// ── Event Broker ─────────────────────────────────────────────────────
export { eventBroker, registerEventProcedure, removeEventProcedure, stopEvent, pass } from './event-broker.js';

// ── Manager Classes ──────────────────────────────────────────────────
export { ObjectManager } from './object-manager-class.js';
export { ObjectBase } from './object-base-class.js';
export { ThreadManager } from './thread-manager-class.js';
export { ResourceManager } from './resource-manager-class.js';
export { DownloadManager } from './download-manager-class.js';
export { ConnectionManager } from './connection-manager-class.js';
export { CastLoadManager } from './castload-manager-class.js';
export { TimeoutManager } from './timeout-manager-class.js';
export { WindowManager } from './window-manager-class.js';
export { BrokerManager } from './broker-manager-class.js';
export { VariableContainer } from './variable-container-class.js';
export { SpecialServices } from './special-services-class.js';

// ── Instance Classes ─────────────────────────────────────────────────
export { ConnectionInstance } from './connection-instance-class.js';
export { WindowInstance } from './window-instance-class.js';

// ── Encryption ───────────────────────────────────────────────────────
export { RC4, RC4Extended } from '../../system/encryption.js';
