/**
 * Window Instance Class
 * 
 * Translated from: casts/fuse_client/55_Window Instance Class.ls
 * 
 * Window instance with elements, positioning, dragging, and event routing.
 * Windows are UI containers built from layout definitions (.window.txt files).
 */

import { VOID, voidp, duplicate, createPropList } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { stage } from '../../core/stage.js';
import { removeWindow, removeUpdate, removePrepare } from './window-api.js';
import { error } from './error-api.js';
import { spriteManager } from '../../engine/sprite-manager.js';

/**
 * Window element wrapper
 */
class WindowElement {
  constructor(id, type, rect) {
    this.id = id;
    this.type = type || 'unknown';
    this.rect = rect || { left: 0, top: 0, right: 0, bottom: 0 };
    this.visible = true;
    this.enabled = true;
    this.blend = 100;
    this.ink = 0;
    this.member = null;
    this.memberName = '';
    this.cursor = -1;
    this.stretch = false;
    this.handlers = new Map();
  }

  registerProcedure(handler, clientID, event) {
    if (!this.handlers.has(handler)) {
      this.handlers.set(handler, []);
    }
    this.handlers.get(handler).push({ clientID, event });
  }
}

export class WindowInstance extends ObjectBase {
  constructor() {
    super();

    /** @type {string} Window title */
    this.title = '';

    /** @type {number} X position */
    this.locX = 0;

    /** @type {number} Y position */
    this.locY = 0;

    /** @type {number} Z position (layer) */
    this.locZ = 0;

    /** @type {number} Window width */
    this.width = 0;

    /** @type {number} Window height */
    this.height = 0;

    /** @type {boolean} Window visibility */
    this.visible = true;

    /** @type {boolean} Window is active */
    this.active = false;

    /** @type {boolean} Window is locked (no z-order changes) */
    this.locked = false;

    /** @type {boolean} Modal flag */
    this.modal = false;

    /** @type {boolean} Dragging flag */
    this.dragFlag = false;

    /** @type {number[]} Drag offset [x, y] */
    this.dragOffset = [0, 0];

    /** @type {Object} Boundary rect for dragging */
    this.boundary = null;

    /** @type {string|null} Client object ID */
    this.clientID = null;

    /** @type {Map<string, WindowElement>} Elements by ID */
    this.elemList = new Map();

    /** @type {Map<string, Object>} Members by name */
    this.memberList = new Map();

    /** @type {Array} Group data for merged layouts */
    this.groupData = [];

    /** @type {Map<string, Object>} Sprites by element ID */
    this.spriteList = new Map();

    /** @type {string[]} Special element IDs (drag, close, scale) */
    this.specialIDList = ['drag', 'close', 'scale'];

    /** @type {Map<string, Array>} Event procedures */
    this.procedures = new Map();

    /** @type {Object|null} Reference to window manager */
    this.windowManager = null;

    /** @type {number[]} Client rect [left, top, right, bottom] */
    this.clientRect = [0, 0, 0, 0];
  }

  construct() {
    this.title = this.id || '';
    this.locX = 0;
    this.locY = 0;
    this.locZ = 0;
    this.width = 0;
    this.height = 0;
    this.visible = true;
    this.active = false;
    this.locked = 0;
    this.modal = false;
    this.dragFlag = false;
    this.dragOffset = [0, 0];
    this.clientID = VOID;
    this.specialIDList = ['drag', 'close', 'scale'];
    this.procedures = this.createProcListTemplate();

    // Default boundary: stage rect + padding
    if (stage) {
      this.boundary = {
        left: -20,
        top: -20,
        right: stage.width + 20,
        bottom: stage.height + 20,
      };
    }

    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    removePrepare(this.getID());

    // Release sprites
    for (const [id, sprite] of this.spriteList) {
      if (sprite && sprite.channel) {
        spriteManager.clearSprite(sprite.channel);
      }
    }

    // Deconstruct elements
    for (const [id, elem] of this.elemList) {
      // Element cleanup
    }

    // Remove members
    for (const [name, member] of this.memberList) {
      // Member cleanup
    }

    this.elemList.clear();
    this.spriteList.clear();
    this.memberList.clear();
    this.groupData = [];
    this.clientID = VOID;
    this.windowManager = VOID;

    return 1;
  }

  // ── Definition ─────────────────────────────────────────────────────

  /**
   * Define window from properties
   */
  define(tProps) {
    if (tProps.locX !== undefined) this.locX = tProps.locX;
    if (tProps.locY !== undefined) this.locY = tProps.locY;
    if (tProps.locZ !== undefined) this.locZ = tProps.locZ;
    if (tProps.boundary !== undefined) this.boundary = tProps.boundary;
    if (tProps.elements !== undefined) this.elemClsList = tProps.elements;
    if (tProps.manager !== undefined) this.windowManager = tProps.manager;
    return 1;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────

  /**
   * Close/remove the window
   */
  close() {
    return removeWindow(this.getID());
  }

  /**
   * Merge a layout into this window
   */
  merge(tLayout) {
    this.setActive(false);
    // In production, this would parse tLayout and add elements
    // For now, just activate
    this.setActive(true);
    return 1;
  }

  /**
   * Unmerge the last merged layout
   */
  unmerge() {
    if (this.groupData.length === 0) {
      error(this, "Can't unmerge window without content!", 'unmerge', 'minor');
      return 0;
    }

    const groupData = this.groupData[this.groupData.length - 1];

    // Deconstruct items in group
    for (const item of groupData.items) {
      // item.deconstruct()
    }

    this.groupData.pop();
    return 1;
  }

  // ── State ──────────────────────────────────────────────────────────

  /**
   * Activate the window (show, focus)
   */
  activate() {
    this.active = true;
    this.visible = true;
    return 1;
  }

  /**
   * Deactivate the window
   */
  setActive(flag) {
    if (flag === undefined) flag = false;
    this.active = flag;
    if (!flag) {
      this.visible = false;
    }
    return 1;
  }

  /**
   * Deactivate
   */
  deactivate() {
    return this.setActive(false);
  }

  /**
   * Lock/unlock window
   */
  lock(tBoolean) {
    if (voidp(tBoolean)) tBoolean = true;
    this.locked = tBoolean ? 1 : 0;
    return 1;
  }

  /**
   * Unlock
   */
  unlock() {
    return this.lock(false);
  }

  // ── Positioning ────────────────────────────────────────────────────

  /**
   * Move window to absolute position
   */
  moveTo(x, y) {
    this.locX = x;
    this.locY = y;

    // Update all element sprites
    for (const [id, sprite] of this.spriteList) {
      if (sprite) {
        // Update sprite position relative to window
      }
    }

    return 1;
  }

  /**
   * Move window by relative offset
   */
  moveBy(dx, dy) {
    this.locX += dx;
    this.locY += dy;

    for (const [id, sprite] of this.spriteList) {
      if (sprite) {
        sprite.locX += dx;
        sprite.locY += dy;
      }
    }

    return 1;
  }

  // ── Element Access ─────────────────────────────────────────────────

  /**
   * Get an element by ID
   */
  elementExists(elemID) {
    return this.elemList.has(elemID);
  }

  /**
   * Get an element
   */
  getElement(elemID) {
    return this.elemList.get(elemID) || VOID;
  }

  /**
   * Get all element IDs
   */
  getElementList() {
    return Array.from(this.elemList.keys());
  }

  /**
   * Set element property
   */
  setElementProperty(elemID, prop, value) {
    const elem = this.elemList.get(elemID);
    if (!elem) return 0;

    switch (prop) {
      case 'visible':
        elem.visible = !!value;
        break;
      case 'enabled':
        elem.enabled = !!value;
        break;
      case 'blend':
        elem.blend = value;
        break;
      case 'member':
        elem.member = value;
        break;
      default:
        elem[prop] = value;
    }

    return 1;
  }

  /**
   * Get element property
   */
  getElementProperty(elemID, prop) {
    const elem = this.elemList.get(elemID);
    if (!elem) return VOID;
    return elem[prop] !== undefined ? elem[prop] : VOID;
  }

  // ── Properties ─────────────────────────────────────────────────────

  /**
   * Set window property
   */
  setProperty(prop, value) {
    switch (prop) {
      case 'locX': this.locX = value; break;
      case 'locY': this.locY = value; break;
      case 'locZ': this.locZ = value; break;
      case 'visible': this.visible = !!value; break;
      case 'active': this.active = !!value; break;
      case 'width': this.width = value; break;
      case 'height': this.height = value; break;
      case 'modal': this.modal = !!value; break;
      default:
        this[prop] = value;
    }
    return 1;
  }

  /**
   * Get window property
   */
  getProperty(prop) {
    switch (prop) {
      case 'locX': return this.locX;
      case 'locY': return this.locY;
      case 'locZ': return this.locZ;
      case 'visible': return this.visible;
      case 'active': return this.active;
      case 'width': return this.width;
      case 'height': return this.height;
      case 'modal': return this.modal;
      case 'locked': return this.locked;
      default:
        return this[prop] !== undefined ? this[prop] : VOID;
    }
  }

  // ── Client & Procedures ────────────────────────────────────────────

  /**
   * Register a client for this window
   */
  registerClient(tClientID) {
    this.clientID = tClientID;
    return 1;
  }

  /**
   * Register an event procedure on an element
   */
  registerProcedure(tHandler, tClientID, tEvent) {
    if (!this.procedures.has(tHandler)) {
      this.procedures.set(tHandler, []);
    }
    this.procedures.get(tHandler).push({ clientID: tClientID, event: tEvent });
    return 1;
  }

  /**
   * Create procedure list template
   */
  createProcListTemplate() {
    return new Map();
  }

  // ── Special IDs ────────────────────────────────────────────────────

  /**
   * Get special element by type (drag, close, scale)
   */
  getSpecialElement(type) {
    for (const id of this.specialIDList) {
      if (id.startsWith(type)) {
        return this.elemList.get(id) || VOID;
      }
    }
    return VOID;
  }

  // ── Debug ──────────────────────────────────────────────────────────

  print() {
    console.log(`Window: ${this.title} (${this.locX}, ${this.locY}) [${this.width}x${this.height}]`);
    console.log(`  Elements: ${this.elemList.size}`);
    for (const [id, elem] of this.elemList) {
      console.log(`    ${id}: ${elem.type} visible=${elem.visible}`);
    }
    return 1;
  }
}
