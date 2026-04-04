/**
 * Resource Manager Class
 * 
 * Translated from: casts/fuse_client/30_Resource Manager Class.ls
 * 
 * Manages named member (resource) registry.
 * Maps member names to member numbers/IDs.
 * In Director, members are bitmaps, scripts, fields within cast libraries.
 * In JS, members are images, canvases, or other assets.
 */

import { VOID, voidp, integerp, createPropList } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { error } from './error-api.js';

export class ResourceManager extends ObjectBase {
  constructor() {
    super();

    /** @type {Map<string, number>} Name → member number mapping */
    this.allMemNumList = new Map();

    /** @type {number[]} Dynamic member numbers (created at runtime) */
    this.dynMemNumList = [];

    /** @type {number[]} Recyclable bitmap member numbers */
    this.bmpMemNumList = [];

    /** @type {string[]} Names allowed to have duplicates */
    this.legalDuplicates = [];

    /** @type {string} Bin cast name (for dynamic member creation) */
    this.binCast = 'bin';

    /** @type {Map<string, Object>} Actual member data by name */
    this.members = new Map();
  }

  construct() {
    this.allMemNumList = new Map();
    this.dynMemNumList = [];
    this.bmpMemNumList = [];
    this.legalDuplicates = ['thread.index', 'memberalias.index', 'texts.index', 'variable.index'];
    this.binCast = 'bin';
    this.members = new Map();
    return 1;
  }

  deconstruct() {
    this.deleteDynamicMembers();
    this.allMemNumList.clear();
    this.members.clear();
    return 1;
  }

  // ── Property Access ────────────────────────────────────────────────

  getProperty(tPropID) {
    switch (tPropID) {
      case 'memberCount':
        return this.allMemNumList.size;
      case 'dynMemCount':
        return this.dynMemNumList.length;
      default:
        return 0;
    }
  }

  setProperty(tPropID, tValue) {
    return 0;
  }

  // ── Member Creation ────────────────────────────────────────────────

  /**
   * Create a new member
   * 
   * Original Lingo:
   *   on createMember me, tMemName, ttype, tForcedDuplicate
   *     if not voidp(pAllMemNumList[tMemName]) and not tForcedDuplicate then
   *       return me.getmemnum(tMemName)
   *     end if
   *     if (ttype = #bitmap) and (pBmpMemNumList.count > 0) then
   *       tmember = member(pBmpMemNumList[1])
   *       pBmpMemNumList.deleteAt(1)
   *     else
   *       tmember = new(ttype, castLib(pBin))
   *     end if
   *     tmember.name = tMemName
   *     pAllMemNumList[tMemName] = tmember.number
   *     pDynMemNumList.add(tmember.number)
   *     return tmember.number
   *   end
   */
  createMember(tMemName, ttype, tForcedDuplicate) {
    if (!voidp(this.allMemNumList.get(tMemName)) && !tForcedDuplicate) {
      error(this, `Member already exists: ${tMemName}`, 'createMember', 'minor');
      return this.getmemnum(tMemName);
    }

    let memNum;

    if (ttype === 'bitmap' && this.bmpMemNumList.length > 0) {
      // Reuse existing bitmap slot
      memNum = this.bmpMemNumList.shift();
    } else {
      // Create new member
      memNum = this._nextMemNum;
      if (!this._nextMemNum) this._nextMemNum = 100;
      this._nextMemNum++;
    }

    // Register
    this.allMemNumList.set(tMemName, memNum);
    if (!this.dynMemNumList.includes(memNum)) {
      this.dynMemNumList.push(memNum);
    }

    // Create placeholder data
    if (ttype === 'bitmap') {
      this.members.set(tMemName, {
        type: 'bitmap',
        number: memNum,
        name: tMemName,
        image: null,
        width: 0,
        height: 0,
      });
    } else if (ttype === 'field') {
      this.members.set(tMemName, {
        type: 'field',
        number: memNum,
        name: tMemName,
        text: '',
      });
    } else {
      this.members.set(tMemName, {
        type: ttype || 'unknown',
        number: memNum,
        name: tMemName,
      });
    }

    return memNum;
  }

  /**
   * Remove a member by name
   */
  removeMember(tMemName) {
    const memNum = this.allMemNumList.get(tMemName);
    if (memNum === undefined || !this.dynMemNumList.includes(memNum)) {
      error(this, `Can't delete member: ${tMemName}`, 'removeMember', 'minor');
      return 0;
    }

    const member = this.members.get(tMemName);
    if (member && member.type === 'bitmap') {
      // Recycle bitmap slot
      member.name = '';
      this.bmpMemNumList.push(memNum);
    } else if (member) {
      this.members.delete(tMemName);
    }

    this.dynMemNumList = this.dynMemNumList.filter(n => n !== memNum);
    this.allMemNumList.delete(tMemName);
    return 1;
  }

  // ── Member Lookup ──────────────────────────────────────────────────

  /**
   * Get member data by name
   */
  getMember(tMemName) {
    const memNum = this.allMemNumList.get(tMemName);
    if (memNum === undefined) return VOID;
    return this.members.get(tMemName) || VOID;
  }

  /**
   * Get member number by name
   */
  getmemnum(tMemName) {
    return this.allMemNumList.get(tMemName) || 0;
  }

  /**
   * Check if member exists by name
   */
  exists(tMemName) {
    return this.allMemNumList.has(tMemName);
  }

  // ── Member Registration ────────────────────────────────────────────

  /**
   * Register a member by name and optional number
   */
  registerMember(tMemName, tMemberNum) {
    if (voidp(tMemberNum)) {
      const existing = this.members.get(tMemName);
      if (existing) {
        tMemberNum = existing.number;
      } else {
        tMemberNum = this._nextMemNum || 100;
        this._nextMemNum = tMemberNum + 1;
      }
    }
    if (tMemberNum < 1) return 0;

    this.allMemNumList.set(tMemName, tMemberNum);
    return tMemberNum;
  }

  /**
   * Unregister a member by name
   */
  unregisterMember(tMemName) {
    if (!this.allMemNumList.has(tMemName)) return 0;
    this.allMemNumList.delete(tMemName);
    return 1;
  }

  /**
   * Update/re-register a member
   */
  updateMember(tMemName) {
    if (typeof tMemName !== 'string') {
      error(this, `Member's name required: ${tMemName}`, 'updateMember', 'minor');
      return 0;
    }
    if (!this.unregisterMember(tMemName)) return 0;
    if (!this.registerMember(tMemName)) return 0;
    return 1;
  }

  /**
   * Replace an existing member with another
   */
  replaceMember(tExistingMemName, tReplacingMemName) {
    const existingNum = this.allMemNumList.get(tExistingMemName);
    if (existingNum === undefined) return 0;

    const replacingNum = this.allMemNumList.get(tReplacingMemName);
    if (replacingNum === undefined) return 0;

    // Swap: existing gets replacing's number
    this.allMemNumList.set(tExistingMemName, replacingNum);
    return 1;
  }

  // ── Pre-Index Members ──────────────────────────────────────────────

  /**
   * Pre-index all members from cast libraries.
   * 
   * In Director, this scans all castLibs and builds the name→number map.
   * In JS, members are pre-registered during module loading.
   */
  preIndexMembers(tCastNum) {
    // In JS, resources are registered when modules are imported
    // This is a placeholder for the full Director cast scanning logic
    return 1;
  }

  /**
   * Delete all dynamic members
   */
  deleteDynamicMembers() {
    for (const memNum of [...this.dynMemNumList]) {
      for (const [name, num] of this.allMemNumList) {
        if (num === memNum) {
          this.removeMember(name);
          break;
        }
      }
    }
  }

  /**
   * Empty dynamic bin (clear bitmap pool)
   */
  emptyDynamicBin() {
    this.bmpMemNumList = [];
  }

  // ── Debug ──────────────────────────────────────────────────────────

  print() {
    console.log('--- Resources ---');
    for (const [name, num] of this.allMemNumList) {
      console.log(`  ${name} → ${num}`);
    }
    return 1;
  }
}

// Register the class
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('Resource Manager Class', ResourceManager);
