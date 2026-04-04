/**
 * Object Manager Class
 * 
 * Translated from: casts/fuse_client/27_Object Manager Class.ls
 * 
 * Central registry for all objects and managers in the FuseClient system.
 * Manages creation, destruction, and lookup of objects by ID.
 * 
 * The Object Manager is the heart of the system - everything goes through it.
 */

import { VOID, voidp, createPropList, objectp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { frameLoop } from '../../core/frame-loop.js';

export class ObjectManager {
  constructor() {
    /** @type {Map<string|symbol, Object>} Object registry */
    this.objects = new Map();

    /** @type {Set<string|symbol>} Registered manager IDs */
    this.managers = new Set();

    /** @type {Set<string|symbol>} Objects pending receive */
    this.receivePrepareSet = new Set();

    /** @type {Set<string|symbol>} Objects pending update */
    this.receiveUpdateSet = new Set();

    /** @type {boolean} Whether updates are paused */
    this.updatesPaused = false;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────

  /**
   * Construct the manager (equivalent of `on construct me`)
   */
  construct() {
    this.objects = new Map();
    this.managers = new Set();
    this.receivePrepareSet = new Set();
    this.receiveUpdateSet = new Set();
    this.updatesPaused = false;
    return 1;
  }

  /**
   * Deconstruct the manager
   */
  deconstruct() {
    // Deconstruct all objects
    for (const [id, obj] of this.objects) {
      if (obj && typeof obj.deconstruct === 'function') {
        obj.deconstruct();
      }
    }
    this.objects.clear();
    this.managers.clear();
    this.receivePrepareSet.clear();
    this.receiveUpdateSet.clear();
    return 1;
  }

  // ── Object Creation ──────────────────────────────────────────────────

  /**
   * Create an object with ancestor chaining
   * 
   * Original Lingo:
   *   on create me, tID, tClassList
   *     tObject = [:]
   *     repeat with tClass in tClassList
   *       tTemp = script(tClass).new()
   *       tObject[#ancestor] = tTemp
   *       tObject = tTemp
   *     end repeat
   *     tObject.construct()
   *     this.objects[tID] = tObject
   *     return tObject
   *   end
   * 
   * In JS, ancestor chaining is simulated by composing objects.
   * Each class in the chain becomes a property of the final object.
   */
  create(tID, tClassList) {
    if (voidp(tID)) return 0;
    if (this.objects.has(tID)) {
      return this.objects.get(tID);
    }

    // Create the object with ancestor chaining
    // In JS, we create instances and chain them via a base object
    let baseObject = new ObjectBase();

    // Chain each class as an "ancestor"
    // In Lingo: tObject[#ancestor] = tTemp creates a prototype chain
    // In JS: we attach each class instance as a named component
    const ancestors = [];

    for (const className of tClassList) {
      // Import the class dynamically by name
      const Class = this.resolveClass(className);
      if (Class) {
        const instance = new Class();
        ancestors.push(instance);
      }
    }

    // Set up ancestor chain: base -> first class -> second class -> ...
    let current = baseObject;
    for (const ancestor of ancestors) {
      current.ancestor = ancestor;
      current = ancestor;
    }

    // Store object
    this.objects.set(tID, baseObject);
    baseObject.id = tID;
    baseObject.ancestors = ancestors;

    // Call construct on the leaf (last in chain)
    if (current && typeof current.construct === 'function') {
      current.construct();
    }

    return baseObject;
  }

  /**
   * Resolve a class name to a constructor
   */
  resolveClass(className) {
    // Classes are registered in the class registry
    if (ObjectManager.classRegistry.has(className)) {
      return ObjectManager.classRegistry.get(className);
    }

    console.warn(`[ObjectManager] Class not found: ${className}`);
    return null;
  }

  /**
   * Register a class constructor by name
   */
  static registerClass(name, Class) {
    ObjectManager.classRegistry.set(name, Class);
  }

  // Static class registry
  static classRegistry = new Map();

  // ── Object Removal ───────────────────────────────────────────────────

  /**
   * Remove/deconstruct an object
   */
  remove(tID) {
    if (!this.objects.has(tID)) return 0;

    const obj = this.objects.get(tID);

    // Call deconstruct
    if (obj && typeof obj.deconstruct === 'function') {
      obj.deconstruct();
    }

    // Remove from update/prepare sets
    this.receiveUpdateSet.delete(tID);
    this.receivePrepareSet.delete(tID);

    // Remove manager registration
    this.managers.delete(tID);

    this.objects.delete(tID);
    return 1;
  }

  // ── Object Lookup ────────────────────────────────────────────────────

  /**
   * Get an object by ID (equivalent of GET in Lingo)
   */
  get(tID) {
    return this.objects.get(tID) || VOID;
  }

  /**
   * Check if an object exists
   */
  exists(tID) {
    return this.objects.has(tID);
  }

  // ── Object Registration ──────────────────────────────────────────────

  /**
   * Register an existing object
   */
  registerObject(tID, tObject) {
    this.objects.set(tID, tObject);
    return 1;
  }

  /**
   * Unregister an object
   */
  unregisterObject(tID) {
    return this.remove(tID);
  }

  // ── Manager Management ───────────────────────────────────────────────

  /**
   * Register a manager ID
   */
  registerManager(tID) {
    this.managers.add(tID);
    return 1;
  }

  /**
   * Unregister a manager
   */
  unregisterManager(tID) {
    this.managers.delete(tID);
    return 1;
  }

  /**
   * Check if a manager exists
   */
  managerExists(tID) {
    return this.managers.has(tID);
  }

  /**
   * Get a manager by ID
   */
  getManager(tID) {
    if (!this.managers.has(tID)) return VOID;
    return this.objects.get(tID) || VOID;
  }

  /**
   * Print managers (debug)
   */
  printManagers() {
    console.log('--- Managers ---');
    for (const id of this.managers) {
      console.log(`  ${String(id)}`);
    }
    return 1;
  }

  // ── Property Access ──────────────────────────────────────────────────

  /**
   * Set a property on an object (setaProp equivalent)
   */
  setProp(tID, value) {
    const obj = this.objects.get(tID);
    if (!obj) return 0;

    // Store the manager instance as a property
    // In Lingo: tObjMngr.setaProp(tID, tObjInst)
    // This is used to associate the manager ID with its instance
    obj._managerInstance = value;
    return 1;
  }

  /**
   * Get a property from an object
   */
  getProp(tID) {
    const obj = this.objects.get(tID);
    if (!obj) return VOID;
    return obj._managerInstance || VOID;
  }

  // ── Receive/Prepare/Update ───────────────────────────────────────────

  /**
   * Register object for receive prepare
   */
  receivePrepare(tID) {
    if (this.objects.has(tID)) {
      this.receivePrepareSet.add(tID);
    }
    return 1;
  }

  /**
   * Remove receive prepare
   */
  removePrepare(tID) {
    this.receivePrepareSet.delete(tID);
    return 1;
  }

  /**
   * Register object for receive update
   */
  receiveUpdate(tID) {
    if (this.objects.has(tID)) {
      this.receiveUpdateSet.add(tID);
      frameLoop.addFrameHandler(() => this.updateObject(tID));
    }
    return 1;
  }

  /**
   * Remove receive update
   */
  removeUpdate(tID) {
    this.receiveUpdateSet.delete(tID);
    return 1;
  }

  /**
   * Update a single object (called by frame loop)
   */
  updateObject(tID) {
    if (this.updatesPaused) return;
    if (!this.receiveUpdateSet.has(tID)) return;

    const obj = this.objects.get(tID);
    if (obj && typeof obj.update === 'function') {
      obj.update();
    }
  }

  /**
   * Pause all updates
   */
  pauseUpdate() {
    this.updatesPaused = true;
    return 1;
  }

  /**
   * Resume all updates
   */
  resumeUpdate() {
    this.updatesPaused = false;
    return 1;
  }

  // ── Debug ────────────────────────────────────────────────────────────

  /**
   * Print all objects (debug)
   */
  print() {
    console.log('--- Objects ---');
    for (const [id, obj] of this.objects) {
      const isManager = this.managers.has(id);
      console.log(`  ${String(id)}${isManager ? ' [manager]' : ''}`);
    }
    return 1;
  }
}
