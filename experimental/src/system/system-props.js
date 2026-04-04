/**
 * System Properties Parser
 * 
 * Translated from: casts/fuse_client/1_System Props.txt
 * 
 * Parses the system properties file that defines:
 * - System configuration (version, tempo, debug flags)
 * - Manager class registrations
 * - Class-to-script mappings
 * - Character conversion tables
 * - Font structs, array/message structs
 * 
 * In Lingo, these are stored as field members and parsed at runtime.
 * In JS, we embed them as structured data.
 */

import { lingoGlobals } from '../../core/lingo-runtime.js';
import { parseColor } from '../../core/lingo-runtime.js';

/**
 * System version
 */
export const SYSTEM_VERSION = '0.2.0';

/**
 * System tempo (default FPS)
 */
export const SYSTEM_TEMPO = 24;

/**
 * Debug window flag
 */
export const DEBUG_WINDOW = 0;

/**
 * Client window title
 */
export const WINDOW_TITLE = 'FuseClient(tm) : :';

/**
 * Manager class definitions
 * Maps manager type -> list of class names (ancestor chain)
 */
export const MANAGER_CLASSES = {
  object: ['Object Manager Class'],
  thread: ['Thread Manager Class'],
  visualizer: ['Manager Template Class', 'Visualizer Manager Class'],
  connection: ['Manager Template Class', 'Connection Manager Class'],
  multiuser: ['Manager Template Class', 'Connection Manager Class', 'Multiuser Manager Class'],
  sprite: ['Sprite Manager Class'],
  window: ['Manager Template Class', 'Visualizer Manager Class', 'Window Manager Class'],
  download: ['Download Manager Class'],
  resource: ['Resource Manager Class'],
  variable: ['Manager Template Class', 'Variable Container Class'],
  timeout: ['Manager Template Class', 'Timeout Manager Class'],
  text: ['Manager Template Class', 'Variable Container Class', 'Text Manager Class'],
  castlib: ['CastLoad Manager Class'],
  error: ['Error Manager Class'],
  broker: ['Broker Manager Class'],
  string: ['String Services Class'],
  binary: ['Binary Manager Class'],
  special: ['Special Services Class'],
  writer: ['Writer Manager Class'],
};

/**
 * Related class mappings
 * Maps class role -> list of class names
 */
export const RELATED_CLASSES = {
  objectBase: ['Object Base Class'],
  managerTemplate: ['Manager Template Class'],
  threadInstance: ['Thread Instance Class'],
  connectionInstance: ['Connection Instance Class'],
  connectionDecoder: ['RC4 Extended Class'],
  multiuserInstance: ['Multiuser Instance Class'],
  downloadInstance: ['Download Instance Class'],
  httpCookieInstance: ['HttpCookie Instance Class'],
  castloadInstance: ['CastLoad Instance Class'],
  castloadTask: ['CastLoad Task Class'],
  cacheInstance: ['Cache Instance Class'],
  loadingBar: ['Loading Bar Class'],
  methodManager: ['Method Manager Class'],
  variableContainer: ['Variable Container Class'],
  layoutParser: ['Layout Parser Class'],
  propertyContainer: ['Property Container Class'],
  visualizerInstance: ['Visualizer Instance Class'],
  windowInstance: ['Window Instance Class'],
  windowWrapper: ['Element Wrapper Class'],
  windowUnique: ['Unique Element Class'],
  windowGrouped: ['Grouped Element Class'],
  windowImage: ['Image Wrapper Class'],
  windowPattern: ['Pattern Wrapper Class'],
  windowTextImage: ['Image Wrapper Class', 'Text Wrapper Class'],
  windowTextEdit: ['Field Wrapper Class'],
  windowButton1: ['Common Button Class'],
  windowButton2: ['Common Button Class'],
  windowButton3: ['Common Button Class'],
  windowButton4: ['Common Button Class', 'Image Button Class'],
  windowButton5: ['Common Button Class', 'Icon Button Class'],
  windowButton6: ['Common Button Class'],
  windowDropMenu1: ['DropDown Class'],
  windowDropMenu2: ['DropDown Class'],
  windowScrollbarV0: ['Scrollbar Class'],
  windowScrollbarH0: ['Scrollbar Class'],
  windowScrollbarV1: ['Scrollbar Class'],
  windowScrollbarH1: ['Scrollbar Class'],
  windowScrollbarV3: ['Scrollbar Class'],
  windowScrollbarH3: ['Scrollbar Class'],
  writerInstance: ['Writer Class'],
  perfTest: ['FPS Test Class'],
  eventAgent: ['Event Agent Class'],
  visualizerWrapper: ['Visualizer Part Wrapper Class'],
};

/**
 * Font definitions (struct.font.*)
 */
export const FONTS = {
  plain: {
    font: 'Courier',
    fontSize: 9,
    lineHeight: 10,
    color: { r: 0, g: 0, b: 0 },
    fontStyle: ['plain'],
  },
  bold: {
    font: 'Courier',
    fontSize: 9,
    lineHeight: 10,
    color: { r: 0, g: 0, b: 0 },
    fontStyle: ['bold'],
  },
  italic: {
    font: 'Courier',
    fontSize: 9,
    lineHeight: 10,
    color: { r: 0, g: 0, b: 0 },
    fontStyle: ['italic'],
  },
  link: {
    font: 'Courier',
    fontSize: 9,
    lineHeight: 10,
    color: { r: 0, g: 0, b: 0x66 },
    fontStyle: ['underline'],
  },
  tooltip: {
    font: 'Courier',
    fontSize: 9,
    lineHeight: 10,
    color: { r: 0, g: 0, b: 0 },
    fontStyle: ['plain'],
  },
  empty: {
    font: null,
    fontSize: 0,
    lineHeight: 0,
    color: { r: 0, g: 0, b: 0 },
    fontStyle: ['plain'],
  },
  grey: {
    font: 'Courier',
    fontSize: 9,
    lineHeight: 10,
    color: { r: 0x33, g: 0x33, b: 0x33 },
    fontStyle: ['italic'],
  },
};

/**
 * Loading bar configuration
 */
export const LOADING_BAR = {
  active: 1,
  props: {
    color: { r: 128, g: 128, b: 128 },
    bgColor: { r: 0, g: 0, b: 0 },
    width: 128,
    height: 16,
  },
};

/**
 * Visualizer defaults
 */
export const VISUALIZER_DEFAULTS = {
  locX: 0,
  locY: 0,
  locZ: -20000000,
  boundaryLimit: { left: -1000, top: -1000, right: 1000, bottom: 1000 },
};

/**
 * Window defaults
 */
export const WINDOW_DEFAULTS = {
  locX: 100,
  locY: 100,
  locZ: 0,
  boundaryLimit: { left: -10, top: -10, right: 10, bottom: 10 },
};

/**
 * Tooltip config
 */
export const TOOLTIP = {
  active: 0,
  delay: 2000,
};

/**
 * CastLoad configuration
 */
export const CASTLOAD = {
  clearCasts: 1,
  retryCount: 8,
  retryDelay: 8000,
};

/**
 * Download configuration
 */
export const DOWNLOAD = {
  retryCount: 4,
  retryDelay: 2000,
};

/**
 * Network operation config
 */
export const NET_OPS = {
  count: 2,
};

/**
 * Connection config
 */
export const CONNECTION = {
  logLevel: 0,
};

/**
 * Cookie preference name
 */
export const HTTP_COOKIE_PREF_NAME = 'hh_httpcookies.txt';

/**
 * Machine ID whitelist chars
 */
export const MACHINE_ID_WHITELIST = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const MACHINE_ID_MAX_LENGTH = 24;

/**
 * Preference value ID (some kind of session/token identifier)
 */
export const PREF_VALUE_ID = '6FEB4C10';

/**
 * Character conversion table (Windows char code mapping)
 * Simplified version - full table from the props file
 */
export const CHAR_CONVERSION_WIN = [128, 164];
export const CHAR_CONVERSION_MAC = null; // Full mapping would be embedded here

/**
 * Get a system property by key path (e.g., 'object.manager.class')
 */
export function getSystemProp(keyPath) {
  const parts = keyPath.split('.');
  
  // Top-level constants
  switch (keyPath) {
    case 'system.version': return SYSTEM_VERSION;
    case 'system.tempo': return SYSTEM_TEMPO;
    case 'client.debug.window': return DEBUG_WINDOW;
    case 'client.window.title': return WINDOW_TITLE;
  }

  // Manager classes
  if (parts[0] === 'object' && parts[1] === 'manager' && parts[2] === 'class') {
    return MANAGER_CLASSES.object;
  }
  if (parts[0] === 'thread' && parts[1] === 'manager' && parts[2] === 'class') {
    return MANAGER_CLASSES.thread;
  }

  return undefined;
}

/**
 * Get manager class list by key
 */
export function getManagerClassList(managerType) {
  return MANAGER_CLASSES[managerType] || [];
}

/**
 * Get related class list by role
 */
export function getRelatedClassList(role) {
  return RELATED_CLASSES[role] || [];
}
