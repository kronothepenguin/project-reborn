/**
 * Visualizer Manager Class
 * 
 * Translated from: casts/fuse_client/38_Visualizer Manager Class.ls
 * 
 * Manages visualizer instances. Visualizers are rendering containers
 * that group sprites under logical IDs with positioning and visibility.
 */

import { VOID, voidp, integerp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ManagerTemplate } from './manager-template-class.js';
import { error, createObject, getObjectManager } from './object-api.js';
import { getVariableValue, getIntVariable } from './variable-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export class VisualizerManager extends ManagerTemplate {
  constructor() {
    super();

    /** @type {string} Visualizer instance class name */
    this.instanceClass = 'Visualizer Instance Class';

    /** @type {string|null} Currently active visualizer ID */
    this.activeItem = null;

    /** @type {number} Default Z position */
    this.defaultLocZ = -20000000;

    /** @type {number} Available Z position (auto-increment) */
    this.availableLocZ = this.defaultLocZ;

    /** @type {Object} Position cache: ID → [x, y] */
    this.posCache = new Map();

    /** @type {string[]} Hidden visualizer IDs */
    this.hideList = [];

    /** @type {Object} Boundary rect */
    this.boundary = { left: 0, top: 0, right: 800, bottom: 600 };
  }

  construct() {
    this.itemList = [];
    this.instanceClass = getManagerClassList('visualizerInstance')[0] || 'Visualizer Instance Class';
    this.activeItem = null;
    this.defaultLocZ = getIntVariable('visualizer.default.locz', -20000000);
    this.availableLocZ = this.defaultLocZ;
    this.posCache = new Map();
    this.hideList = [];

    // Set boundary from system props
    const boundaryLimit = getVariableValue('visualizer.boundary.limit', [-1000, -1000, 1000, 1000]);
    this.boundary = {
      left: boundaryLimit[0] || -1000,
      top: boundaryLimit[1] || -1000,
      right: boundaryLimit[2] || 1000,
      bottom: boundaryLimit[3] || 1000,
    };

    return 1;
  }

  deconstruct() {
    // Release all sprites from all visualizers
    for (const id of this.itemList) {
      const viz = this.get(id);
      if (viz && typeof viz.releaseSprites === 'function') {
        viz.releaseSprites();
      }
    }
    this.itemList = [];
    this.posCache.clear();
    this.hideList = [];
    return 1;
  }

  // ── Creation ───────────────────────────────────────────────────────

  /**
   * Create a visualizer
   * 
   * @param {string} tID - Visualizer ID
   * @param {string} tLayout - Layout file name
   * @param {number} tLocX - X position
   * @param {number} tLocY - Y position
   */
  create(tID, tLayout, tLocX, tLocY) {
    if (!integerp(tLocX)) tLocX = 0;
    if (!integerp(tLocY)) tLocY = 0;

    // Remove existing if present
    if (this.exists(tID)) {
      this.remove(tID);
    }

    // Create the visualizer instance
    const viz = getObjectManager().create(tID, [this.instanceClass]);
    if (!viz) {
      error(this, `Item creation failed: ${tID}`, 'create', 'major');
      return 0;
    }

    // Define properties
    const props = {
      locX: tLocX,
      locY: tLocY,
      locZ: this.availableLocZ,
      layout: tLayout,
      boundary: this.boundary,
    };

    if (!viz.define(props)) {
      getObjectManager().remove(tID);
      return 0;
    }

    this.itemList.push(tID);

    // Increment available Z based on sprite count
    const sprCount = viz.getProperty('sprCount') || 1;
    this.availableLocZ += sprCount;

    return viz;
  }

  // ── Removal ────────────────────────────────────────────────────────

  remove(tID) {
    if (!this.exists(tID)) return 0;

    const viz = this.get(tID);
    if (viz) {
      const sprCount = viz.getProperty('sprCount') || 1;
      this.availableLocZ -= sprCount;

      // Cache position for potential re-creation
      this.posCache.set(tID, [viz.getProperty('locX'), viz.getProperty('locY')]);
    }

    const idx = this.itemList.indexOf(tID);
    if (idx >= 0) this.itemList.splice(idx, 1);

    // Update active item
    if (this.activeItem === tID) {
      this.activeItem = this.itemList[this.itemList.length - 1] || null;
    }

    getObjectManager().remove(tID);
    this.activate(this.itemList[this.itemList.length - 1]);

    return 1;
  }

  // ── Activation ─────────────────────────────────────────────────────

  /**
   * Activate a visualizer (bring to front)
   */
  activate(tID) {
    if (!this.exists(tID)) return 0;

    this.activeItem = tID;
    const viz = this.get(tID);
    if (viz && typeof viz.setActive === 'function') {
      viz.setActive();
    }
    return 1;
  }

  /**
   * Deactivate a visualizer
   */
  deactivate(tID) {
    if (!this.exists(tID)) return 0;

    const viz = this.get(tID);
    if (viz && typeof viz.setDeactive === 'function') {
      viz.setDeactive();
    }
    return 1;
  }

  // ── Visibility ─────────────────────────────────────────────────────

  /**
   * Hide all visualizers
   */
  hideAll() {
    for (const id of this.itemList) {
      const viz = this.get(id);
      if (viz && viz.getProperty('visible')) {
        if (typeof viz.hide === 'function') viz.hide();
        this.hideList.push(id);
      }
    }
    return 1;
  }

  /**
   * Show all hidden visualizers
   */
  showAll() {
    for (const id of this.hideList) {
      const viz = this.get(id);
      if (viz && typeof viz.show === 'function') {
        viz.show();
      }
    }
    this.hideList = [];
    return 1;
  }

  // ── Properties ─────────────────────────────────────────────────────

  getProperty(tProp) {
    switch (tProp) {
      case 'defaultLocZ': return this.defaultLocZ;
      case 'boundary': return this.boundary;
      case 'count': return this.itemList.length;
      default: return 0;
    }
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case 'defaultLocZ':
        return this.setDefaultLocZ(tValue);
      case 'boundary':
        return this.setBoundary(tValue);
      default: return 0;
    }
  }

  setDefaultLocZ(tValue) {
    if (!integerp(tValue)) {
      error(this, `integer expected: ${tValue}`, 'setDefaultLocZ', 'minor');
      return 0;
    }
    this.defaultLocZ = tValue;
    return this.activate(this.activeItem);
  }

  setBoundary(tValue) {
    if (!Array.isArray(tValue) && typeof tValue !== 'object') {
      error(this, `List or rect expected: ${tValue}`, 'setBoundary', 'minor');
      return 0;
    }
    if (Array.isArray(tValue)) {
      this.boundary.left = tValue[0];
      this.boundary.top = tValue[1];
      this.boundary.right = tValue[2];
      this.boundary.bottom = tValue[3];
    } else {
      Object.assign(this.boundary, tValue);
    }
    return 1;
  }

  /**
   * Get cached position for a removed visualizer
   */
  getCachedPosition(tID) {
    return this.posCache.get(tID) || null;
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Visualizer Manager Class', VisualizerManager);
