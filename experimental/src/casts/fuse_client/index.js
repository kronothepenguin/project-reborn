/**
 * fuse_client cast entry point
 * Re-exports ALL public APIs from the core FuseClient framework.
 */

// ── APIs ─────────────────────────────────────────────────────────────
export {
  constructObjectManager, deconstructObjectManager, getObjectManager,
  createObject, removeObject, getObject, objectExists, printObjects,
  registerObject, unregisterObject, createManager, removeManager,
  getManager, managerExists, printManagers, registerManager, unregisterManager,
  receivePrepare, removePrepare, receiveUpdate, removeUpdate, pauseUpdate, unpauseUpdate,
} from './object-api.js';

export {
  constructThreadManager, deconstructThreadManager, getThreadManager,
  createThread, removeThread, getThread, threadExists, initThread,
  initExistingThreads, closeThread, closeExistingThreads, printThreads,
} from './thread-api.js';

export {
  constructResourceManager, deconstructResourceManager, getResourceManager,
  createMember, removeMember, getMember, updateMember, registerMember,
  unregisterMember, replaceMember, memberExists, getmemnum, printMembers,
} from './resource-api.js';

export {
  constructDownloadManager, deconstructDownloadManager, getDownloadManager,
  queueDownload, abortDownLoad, registerDownloadCallback,
  getDownLoadPercent, downloadExists, printDownloads,
} from './download-api.js';

export {
  constructConnectionManager, deconstructConnectionManager, getConnectionManager,
  createConnection, removeConnection, getConnection, connectionExists,
  printConnections, registerListener, unregisterListener,
  registerCommands, unregisterCommands,
} from './connection-api.js';

export {
  constructCastLoader, deconstructCastLoader, getCastLoadManager,
  startCastLoad, registerCastloadCallback, resetCastLibs,
  getCastLoadPercent, FindCastNumber, castExists, printCasts,
} from './castload-api.js';

export {
  constructTimeoutManager, deconstructTimeoutManager, getTimeoutManager,
  createTimeout, removeTimeout, getTimeout, timeoutExists, printTimeouts,
} from './timeout-api.js';

export {
  constructWindowManager, deconstructWindowManager, getWindowManager,
  createWindow, removeWindow, getWindow, getWindowIDList, windowExists,
  mergeWindow, activateWindowObj, deactivateWindowObj,
  registerClient, registerProcedure, showWindows, hideWindows,
  lockWindowLayering, unlockWindowLayering, printWindows,
} from './window-api.js';

export {
  constructBrokerManager, deconstructBrokerManager, getBrokerManager,
  createBroker, removeBroker, getBroker, brokerExists, printBrokers,
  registerMessage, unregisterMessage, executeMessage,
} from './broker-api.js';

export {
  constructVariableManager, deconstructVariableManager, getVariableManager,
  createVariable, setVariable, removeVariable, getVariable, getIntVariable,
  getStructVariable, getClassVariable, getVariableValue,
  variableExists, printVariables, dumpVariableField,
} from './variable-api.js';

export {
  constructStringServices, deconstructStringServices, getStringServices,
  convertToPropList, convertToLowerCase, convertToHigherCase,
  convertSpecialChars, convertIntToHex, convertHexToInt,
  explode, implode, replaceChars, replaceChunks,
  urlEncode, obfuscate, deobfuscate, getLocalFloat, encodeUTF8, decodeUTF8,
} from './string-services-api.js';

export {
  constructWriterManager, deconstructWriterManager, getWriterManager,
  createWriter, removeWriter, getWriter, writerExists, printWriters,
} from './write-api.js';

export {
  constructBinaryManager, deconstructBinaryManager, getBinaryManager,
  retrieveBinaryData, storeBinaryData, addMessageToBinaryQueue,
} from './binary-api.js';

export {
  constructSpriteManager, deconstructSpriteManager, getSpriteManager,
  reserveSprite, releaseSprite, setEventBroker, removeEventBroker, printSprites,
} from './sprite-api.js';

export {
  constructTextManager, deconstructTextManager, getTextManager,
  createText, removeText, setText, getText, textExists, printTexts, dumpTextField,
} from './text-api.js';

export {
  constructSpecialServices, deconstructSpecialServices, getSpecialServices,
  createToolTip, removeToolTip, setcursor, openNetPage, showLoadingBar,
  getUniqueID, getMachineID, getPredefinedURL, getDomainPart,
  getMoviePath, getExtVarPath, sendProcessTracking, getProcessTrackingList,
  secretDecode, readValueFromField, checkForXtra, performance,
  printMsg, callJavaScriptFunction, getClientUpTime,
} from './special-services-api.js';

export {
  constructMultiuserManager, deconstructMultiuserManager, getMultiuserManager,
  createMultiuser, removeMultiuser, getMultiuser, multiuserExists, printMultiusers,
} from './multiuser-api.js';

// ── Initialization ───────────────────────────────────────────────────
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
export { ManagerTemplate } from './manager-template-class.js';
export { VisualizerManager } from './visualizer-manager-class.js';
export { ErrorManager } from './error-manager-class.js';
export { TextManager } from './text-manager-class.js';
export { StringServices } from './string-services-class.js';
export { WriterManager } from './writer-manager-class.js';
export { BinaryManager } from './binary-manager-class.js';
export { MethodManager } from './method-manager-class.js';
export { MultiuserManager } from './multiuser-manager-class.js';

// ── Instance Classes ─────────────────────────────────────────────────
export { ConnectionInstance } from './connection-instance-class.js';
export { WindowInstance } from './window-instance-class.js';
export { VisualizerInstance } from './visualizer-instance-class.js';
export { CastLoadInstance } from './castload-instance-class.js';
export { CastLoadTask } from './castload-task-class.js';
export { DownloadInstance } from './download-instance-class.js';
export { MultiuserInstance } from './multiuser-instance-class.js';
export { ThreadInstance } from './thread-instance-class.js';
export { HttpCookieInstance } from './httpcookie-instance-class.js';

// ── Element Wrappers ─────────────────────────────────────────────────
export { ElementWrapper } from './element-wrapper-class.js';
export { GroupedElement } from './grouped-element-class.js';
export { UniqueElement } from './unique-element-class.js';
export { ImageWrapper } from './image-wrapper-class.js';
export { TextWrapper } from './text-wrapper-class.js';
export { FieldWrapper } from './field-wrapper-class.js';
export { PatternWrapper } from './pattern-wrapper-class.js';
export { DropDown } from './dropdown-class.js';
export { Scrollbar } from './scrollbar-class.js';
export { VisualizerPartWrapper } from './visualizer-part-wrapper-class.js';

// ── Button Classes ───────────────────────────────────────────────────
export { ImageButton } from './image-button-class.js';
export { IconButton } from './icon-button-class.js';

// ── Utility Classes ──────────────────────────────────────────────────
export { EventAgent } from './event-agent-class.js';
export { LoadingBar } from './loading-bar-class.js';
export { FPSTest } from './fps-test-class.js';
export { LayoutParser } from './layout-parser-class.js';
export { CoreThread } from './core-thread-class.js';

// ── Encryption ───────────────────────────────────────────────────────
export { RC4, RC4Extended } from '../../system/encryption.js';
