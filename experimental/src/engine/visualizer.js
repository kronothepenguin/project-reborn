/**
 * Visualizer System
 * 
 * Translated from: casts/fuse_client/38_Visualizer Manager Class.ls
 * and 54_Visualizer Instance Class.ls
 * 
 * Visualizers are high-level rendering containers that group sprites
 * under logical IDs. They support movement, animation, and sprite
 * lookup by name (getSprById).
 * 
 * In Lingo:
 *   createVisualizer(id, layoutFile) - creates a visualizer
 *   getVisualizer(id) - gets visualizer instance
 *   visualizer.moveTo(x, y)
 *   visualizer.moveBy(dx, dy)
 *   visualizer.getSprById(name) - get a sprite within the visualizer
 *   visualizer.setProperty(prop, value)
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { stage } from '../../core/stage.js';
import { spriteManager } from './sprite-manager.js';

/**
 * Visualizer instance - a group of sprites with logical IDs
 */
class VisualizerInstance {
  constructor(id) {
    this.id = id;
    this.locX = 0;
    this.locY = 0;
    this.locZ = 0;
    this.visible = true;
    this.blend = 100;
    this.width = 0;
    this.height = 0;

    /** @type {Map<string, Object>} Sprites by logical ID */
    this.spriteMap = new Map();

    /** @type {Array} Sprite channel list */
    this.spriteList = [];

    /** @type {Map<string, Object>} Properties */
    this.properties = new Map();

    /** @type {number} Base sprite channel */
    this.baseChannel = 0;
  }

  /**
   * Move visualizer to absolute position
   */
  moveTo(x, y) {
    const dx = x - this.locX;
    const dy = y - this.locY;
    this.locX = x;
    this.locY = y;
    
    // Move all sprites
    this.moveBy(dx, dy);
    return 1;
  }

  /**
   * Move visualizer by relative offset
   */
  moveBy(dx, dy) {
    this.locX += dx;
    this.locY += dy;

    // Move all registered sprites
    for (const [name, sprite] of this.spriteMap) {
      if (sprite) {
        sprite.locX += dx;
        sprite.locY += dy;
      }
    }
    return 1;
  }

  /**
   * Get a sprite by logical ID
   */
  getSprById(name) {
    return this.spriteMap.get(name) || VOID;
  }

  /**
   * Register a sprite under a logical ID
   */
  registerSprite(name, spriteOrChannel) {
    if (typeof spriteOrChannel === 'number') {
      const sprite = spriteManager.getSprite(spriteOrChannel);
      this.spriteMap.set(name, sprite);
      this.spriteList.push(sprite);
    } else if (spriteOrChannel) {
      this.spriteMap.set(name, spriteOrChannel);
      this.spriteList.push(spriteOrChannel);
    }
    return 1;
  }

  /**
   * Set a property
   */
  setProperty(prop, value) {
    this.properties.set(prop, value);
    
    switch (prop) {
      case 'locZ':
        this.locZ = value;
        // Update sprite z-ordering
        for (const sprite of this.spriteMap.values()) {
          if (sprite) sprite.zIndex = this.locZ;
        }
        break;
      case 'visible':
        this.visible = !!value;
        for (const sprite of this.spriteMap.values()) {
          if (sprite) sprite.visible = this.visible;
        }
        break;
      case 'blend':
        this.blend = value;
        for (const sprite of this.spriteMap.values()) {
          if (sprite) sprite.blend = this.blend;
        }
        break;
    }
    return 1;
  }

  /**
   * Get a property
   */
  getProperty(prop) {
    switch (prop) {
      case 'locX': return this.locX;
      case 'locY': return this.locY;
      case 'locZ': return this.locZ;
      case 'visible': return this.visible;
      case 'blend': return this.blend;
      case 'width': return this.width;
      case 'height': return this.height;
      case 'spriteList': return this.spriteList;
      default:
        return this.properties.get(prop) || VOID;
    }
  }

  /**
   * Set member on a sprite by ID
   */
  setSpriteMember(name, member) {
    const sprite = this.spriteMap.get(name);
    if (sprite) {
      sprite.setMember(member);
    }
    return 1;
  }

  /**
   * Deconstruct
   */
  deconstruct() {
    // Clear sprite references
    for (const [name, sprite] of this.spriteMap) {
      if (sprite && typeof sprite.clearSprite === 'function') {
        sprite.clearSprite(sprite.channel);
      }
    }
    this.spriteMap.clear();
    this.spriteList = [];
    this.properties.clear();
    return 1;
  }
}

/**
 * Visualizer Manager
 */
export class VisualizerManager {
  constructor() {
    /** @type {Map<string, VisualizerInstance>} Visualizer registry */
    this.visualizers = new Map();
    /** @type {number} Next base channel for sprite allocation */
    this.nextChannel = 100;
  }

  construct() {
    this.visualizers = new Map();
    this.nextChannel = 100;
    return 1;
  }

  deconstruct() {
    for (const [id, viz] of this.visualizers) {
      viz.deconstruct();
    }
    this.visualizers.clear();
    return 1;
  }

  /**
   * Create a visualizer
   * 
   * Original Lingo:
   *   createVisualizer(id, layoutFile)
   */
  create(id, layoutFile) {
    if (this.visualizers.has(id)) {
      return this.visualizers.get(id);
    }

    const visualizer = new VisualizerInstance(id);
    visualizer.baseChannel = this.nextChannel;
    this.nextChannel += 20; // Reserve channels for this visualizer

    // Parse layout file if provided
    if (layoutFile) {
      this.parseLayout(visualizer, layoutFile);
    }

    this.visualizers.set(id, visualizer);
    return visualizer;
  }

  /**
   * Parse a .visual layout file
   * In production, this would load and parse the layout definition
   */
  parseLayout(visualizer, layoutFile) {
    // Layout files define sprites, positions, and initial members
    // For now, this is a placeholder
    console.log(`[VisualizerManager] Parse layout: ${layoutFile}`);
  }

  /**
   * Remove a visualizer
   */
  remove(id) {
    if (!this.visualizers.has(id)) return 0;
    const viz = this.visualizers.get(id);
    viz.deconstruct();
    this.visualizers.delete(id);
    return 1;
  }

  /**
   * Get a visualizer
   */
  get(id) {
    return this.visualizers.get(id) || VOID;
  }

  /**
   * Check if visualizer exists
   */
  exists(id) {
    return this.visualizers.has(id);
  }

  /**
   * Print debug info
   */
  print() {
    console.log('--- Visualizers ---');
    for (const [id, viz] of this.visualizers) {
      console.log(`  ${id}: ${viz.spriteMap.size} sprites at (${viz.locX}, ${viz.locY})`);
    }
    return 1;
  }
}

// Global API functions (matching Lingo globals)

let gVisualizerManager = null;

function getVisualizerManager() {
  if (!gVisualizerManager) {
    gVisualizerManager = new VisualizerManager();
    gVisualizerManager.construct();
  }
  return gVisualizerManager;
}

/**
 * Create a visualizer (global API)
 */
export function createVisualizer(id, layoutFile) {
  return getVisualizerManager().create(id, layoutFile);
}

/**
 * Get a visualizer (global API)
 */
export function getVisualizer(id) {
  return getVisualizerManager().get(id);
}

/**
 * Remove a visualizer (global API)
 */
export function removeVisualizer(id) {
  return getVisualizerManager().remove(id);
}

/**
 * Check if visualizer exists (global API)
 */
export function visualizerExists(id) {
  return getVisualizerManager().exists(id);
}
