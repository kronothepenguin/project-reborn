/**
 * Object Base Class
 * 
 * Translated from: casts/fuse_client/46_Object Base Class.ls
 * 
 * Base class for all FuseClient objects.
 * Provides the standard lifecycle methods (construct, deconstruct, update)
 * and common property access patterns used by all objects in the system.
 * 
 * Original Lingo:
 *   property id
 *   on construct me ...
 *   on deconstruct me ...
 *   on getID me ...
 *   on setID me, tID ...
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';

export class ObjectBase {
  constructor() {
    /** @type {string|symbol} Object ID */
    this.id = VOID;

    /** @type {Object|null} Ancestor chain link */
    this.ancestor = null;

    /** @type {Array} List of ancestor instances */
    this.ancestors = [];

    /** @type {Object} Instance properties */
    this.props = {};
  }

  // ── Lifecycle ────────────────────────────────────────────────────────

  /**
   * Construct the object
   * 
   * Override in subclasses. Return 1 on success, 0 on failure.
   */
  construct() {
    return 1;
  }

  /**
   * Deconstruct the object
   * 
   * Override in subclasses to clean up resources.
   */
  deconstruct() {
    this.ancestors = [];
    this.ancestor = null;
    this.props = {};
    return 1;
  }

  // ── Identity ─────────────────────────────────────────────────────────

  /**
   * Get object ID
   */
  getID() {
    return this.id;
  }

  /**
   * Set object ID
   */
  setID(tID) {
    if (voidp(tID)) {
      // In Lingo: error(me, "String expected:" && tID, #setID, #major)
      console.warn('[ObjectBase] setID: void ID provided');
      return 0;
    }
    this.id = tID;
    return 1;
  }

  // ── Property Access ──────────────────────────────────────────────────

  /**
   * Get a property value
   */
  getProperty(propName) {
    if (this.props[propName] !== undefined) {
      return this.props[propName];
    }
    return VOID;
  }

  /**
   * Set a property value
   */
  setProperty(propName, value) {
    this.props[propName] = value;
  }

  /**
   * Check if a property exists
   */
  hasProperty(propName) {
    return this.props[propName] !== undefined;
  }

  /**
   * Delete a property
   */
  deleteProperty(propName) {
    delete this.props[propName];
  }

  /**
   * Get all property names
   */
  getPropertyNames() {
    return Object.keys(this.props);
  }

  // ── Ancestor Chain Access ────────────────────────────────────────────

  /**
   * Get ancestor by position in chain (0 = first, -1 = last/leaf)
   */
  getAncestor(index) {
    if (index === -1) {
      // Last in chain (leaf)
      return this.ancestors[this.ancestors.length - 1] || null;
    }
    return this.ancestors[index] || null;
  }

  /**
   * Call a method on the leaf ancestor
   */
  callOnLeaf(methodName, ...args) {
    const leaf = this.getAncestor(-1);
    if (leaf && typeof leaf[methodName] === 'function') {
      return leaf[methodName](...args);
    }
    return VOID;
  }

  /**
   * Call a method on a specific ancestor by class name
   */
  callOn(className, methodName, ...args) {
    for (const ancestor of this.ancestors) {
      if (ancestor.constructor.name === className) {
        if (typeof ancestor[methodName] === 'function') {
          return ancestor[methodName](...args);
        }
      }
    }
    return VOID;
  }

  // ── Update ───────────────────────────────────────────────────────────

  /**
   * Per-frame update method (called when registered for receiveUpdate)
   * Override in subclasses.
   */
  update() {
    // No-op by default
  }

  // ── Debug ────────────────────────────────────────────────────────────

  /**
   * String representation
   */
  toString() {
    return `[ObjectBase id=${String(this.id)} ancestors=${this.ancestors.length}]`;
  }

  /**
   * Print debug info
   */
  print() {
    console.log(this.toString());
  }
}
