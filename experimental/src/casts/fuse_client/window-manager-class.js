/**
 * Window Manager Class
 * 
 * Translated from: casts/fuse_client/39_Window Manager Class.ls
 * 
 * Manages all window instances. Handles creation, activation, z-ordering,
 * and visibility of windows.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { WindowInstance } from './window-instance-class.js';
import { error } from './error-api.js';
import { ObjectManager } from './object-manager-class.js';

export class WindowManager extends ObjectBase {
  constructor() {
    super();

    /** @type {Map<string, WindowInstance>} Window registry */
    this.windows = new Map();

    /** @type {string[]} Window ID list in z-order (first = bottom, last = top) */
    this.zOrder = [];

    /** @type {boolean} Z-order lock flag */
    this.layeringLocked = false;

    /** @type {string|null} Currently active window ID */
    this.activeWindow = null;
  }

  construct() {
    this.windows = new Map();
    this.zOrder = [];
    this.layeringLocked = false;
    this.activeWindow = null;
    return 1;
  }

  deconstruct() {
    for (const [id, win] of this.windows) {
      win.deconstruct();
    }
    this.windows.clear();
    this.zOrder = [];
    return 1;
  }

  // ── Window Creation ────────────────────────────────────────────────

  /**
   * Create a window
   * 
   * @param {string} tID - Window ID
   * @param {string} tLayout - Layout file name
   * @param {number} [tLocX] - X position
   * @param {number} [tLocY] - Y position
   * @param {string} [tSpecial] - Special flags
   */
  create(tID, tLayout, tLocX, tLocY, tSpecial) {
    if (voidp(tID)) return 0;

    if (this.windows.has(tID)) {
      return this.windows.get(tID);
    }

    const win = new WindowInstance();
    win.id = tID;
    win.title = tID;

    // Set position
    if (!voidp(tLocX)) win.locX = tLocX;
    if (!voidp(tLocY)) win.locY = tLocY;

    // Set manager reference
    win.windowManager = this;

    // Construct
    win.construct();

    // Register
    this.windows.set(tID, win);
    this.zOrder.push(tID);

    // Activate by default
    this.activate(tID);

    return win;
  }

  /**
   * Remove a window
   */
  remove(tID) {
    if (!this.windows.has(tID)) return 0;

    const win = this.windows.get(tID);
    win.deconstruct();
    this.windows.delete(tID);

    // Remove from z-order
    const idx = this.zOrder.indexOf(tID);
    if (idx >= 0) this.zOrder.splice(idx, 1);

    // Clear active if needed
    if (this.activeWindow === tID) {
      this.activeWindow = null;
    }

    return 1;
  }

  /**
   * Get a window by ID
   */
  get(tID) {
    return this.windows.get(tID) || VOID;
  }

  /**
   * Check if a window exists
   */
  exists(tID) {
    return this.windows.has(tID);
  }

  /**
   * Get list of all window IDs
   */
  getIDList() {
    return [...this.zOrder];
  }

  // ── Activation ─────────────────────────────────────────────────────

  /**
   * Activate a window (bring to front, show)
   */
  activate(tID) {
    if (!this.windows.has(tID)) return 0;

    const win = this.windows.get(tID);
    win.activate();

    // Move to front of z-order
    if (!this.layeringLocked) {
      const idx = this.zOrder.indexOf(tID);
      if (idx >= 0) this.zOrder.splice(idx, 1);
      this.zOrder.push(tID);
    }

    this.activeWindow = tID;
    return 1;
  }

  /**
   * Deactivate a window
   */
  deactivate(tID) {
    if (!this.windows.has(tID)) return 0;
    const win = this.windows.get(tID);
    win.deactivate();

    if (this.activeWindow === tID) {
      this.activeWindow = null;
    }
    return 1;
  }

  // ── Visibility ─────────────────────────────────────────────────────

  /**
   * Show all windows
   */
  showAll() {
    for (const [id, win] of this.windows) {
      win.visible = true;
    }
    return 1;
  }

  /**
   * Hide all windows
   */
  hideAll() {
    for (const [id, win] of this.windows) {
      win.visible = false;
    }
    return 1;
  }

  // ── Layering ───────────────────────────────────────────────────────

  /**
   * Lock z-order changes
   */
  lock() {
    this.layeringLocked = true;
    return 1;
  }

  /**
   * Unlock z-order changes
   */
  unlock() {
    this.layeringLocked = false;
    return 1;
  }

  /**
   * Bring window to front
   */
  bringToFront(tID) {
    if (!this.windows.has(tID)) return 0;
    if (this.layeringLocked) return 0;

    const idx = this.zOrder.indexOf(tID);
    if (idx >= 0) this.zOrder.splice(idx, 1);
    this.zOrder.push(tID);
    return 1;
  }

  /**
   * Send window to back
   */
  sendToBack(tID) {
    if (!this.windows.has(tID)) return 0;
    if (this.layeringLocked) return 0;

    const idx = this.zOrder.indexOf(tID);
    if (idx >= 0) this.zOrder.splice(idx, 1);
    this.zOrder.unshift(tID);
    return 1;
  }

  // ── Debug ──────────────────────────────────────────────────────────

  print() {
    console.log('--- Windows ---');
    for (const id of this.zOrder) {
      const win = this.windows.get(id);
      if (win) {
        const active = this.activeWindow === id ? ' [active]' : '';
        console.log(`  ${id} (${win.locX}, ${win.locY})${active}`);
      }
    }
    return 1;
  }
}

// Register the class
ObjectManager.registerClass('Window Manager Class', WindowManager);
