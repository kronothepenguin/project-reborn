/**
 * Sprite Manager
 * 
 * Simulates Director's sprite channel system.
 * Each sprite has a member (bitmap/graphic), position, visibility, blend, ink, etc.
 * Sprites are rendered on the Canvas by the Stage.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { stage } from '../../core/stage.js';

/**
 * Sprite representation
 */
class Sprite {
  constructor(channel) {
    this.channel = channel;
    this.member = null;       // bitmap/image member
    this.memberName = '';
    this.visible = true;
    this.locX = 0;
    this.locY = 0;
    this.width = 0;
    this.height = 0;
    this.blend = 100;         // 0-100 alpha
    this.ink = 0;             // 0=copy, 8=background transparent, etc.
    this.cursor = -1;         // -1=arrow, 0=none, 1=ibeam, etc.
    this.zIndex = 0;
    this.rotation = 0;
    this.flipH = false;
    this.flipV = false;
    this.rect = { left: 0, top: 0, right: 0, bottom: 0 };
    this.eventProcedures = new Map(); // event handlers registered via Event Broker
  }

  /**
   * Set the member (bitmap) for this sprite
   */
  setMember(member) {
    if (voidp(member)) {
      this.member = null;
      this.memberName = '';
      this.width = 0;
      this.height = 0;
    } else if (typeof member === 'object') {
      // If member is an image object
      if (member.image) {
        this.member = member.image;
      } else if (member instanceof HTMLImageElement || member instanceof HTMLCanvasElement) {
        this.member = member;
      } else if (member.width && member.height) {
        this.member = member;
      }
      
      if (this.member) {
        this.width = this.member.width || 0;
        this.height = this.member.height || 0;
      }
    } else if (typeof member === 'string') {
      this.memberName = member;
      // Look up member by name in resource manager
    }
    return this;
  }

  /**
   * Get the member
   */
  getMember() {
    return this.member || VOID;
  }

  /**
   * Register an event procedure for this sprite
   */
  registerProcedure(eventName, clientID, method) {
    if (!this.eventProcedures.has(eventName)) {
      this.eventProcedures.set(eventName, []);
    }
    this.eventProcedures.get(eventName).push({ clientID, method });
  }

  /**
   * Remove event procedure
   */
  removeProcedure(eventName) {
    this.eventProcedures.delete(eventName);
  }

  /**
   * Check if point is within sprite bounds
   */
  containsPoint(x, y) {
    return x >= this.locX && 
           x <= this.locX + this.width && 
           y >= this.locY && 
           y <= this.locY + this.height;
  }

  /**
   * Get sprite's bounding rect
   */
  getRect() {
    return {
      left: this.locX,
      top: this.locY,
      right: this.locX + this.width,
      bottom: this.locY + this.height,
    };
  }
}

export class SpriteManager {
  constructor() {
    /** @type {Map<number, Sprite>} Sprite channels (1-based, like Director) */
    this.sprites = new Map();
    /** @type {number} Highest channel used */
    this.lastChannel = 0;
    /** @type {Map<string, number>} Name -> channel mapping */
    this.nameToChannel = new Map();
  }

  /**
   * Construct the manager
   */
  construct() {
    this.sprites = new Map();
    this.lastChannel = 0;
    this.nameToChannel = new Map();
    return 1;
  }

  /**
   * Deconstruct
   */
  deconstruct() {
    this.sprites.clear();
    this.nameToChannel.clear();
    return 1;
  }

  /**
   * Get or create a sprite channel
   */
  getSprite(channel) {
    if (!this.sprites.has(channel)) {
      const sprite = new Sprite(channel);
      this.sprites.set(channel, sprite);
      if (channel > this.lastChannel) {
        this.lastChannel = channel;
      }
    }
    return this.sprites.get(channel);
  }

  /**
   * Get sprite by name
   */
  getSpriteByName(name) {
    const channel = this.nameToChannel.get(name);
    if (channel !== undefined) {
      return this.getSprite(channel);
    }
    return null;
  }

  /**
   * Get the highest used channel
   */
  getLastChannel() {
    return this.lastChannel;
  }

  /**
   * Clear a sprite channel
   */
  clearSprite(channel) {
    this.sprites.delete(channel);
    // Remove from name mapping
    for (const [name, ch] of this.nameToChannel) {
      if (ch === channel) {
        this.nameToChannel.delete(name);
      }
    }
    return 1;
  }

  /**
   * Render all visible sprites to the stage canvas
   */
  render() {
    if (!stage.ctx) return;

    // Sort sprites by zIndex then channel
    const sortedSprites = Array.from(this.sprites.values())
      .filter(s => s.visible && s.member)
      .sort((a, b) => {
        if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
        return a.channel - b.channel;
      });

    for (const sprite of sortedSprites) {
      this.renderSprite(sprite);
    }
  }

  /**
   * Render a single sprite
   */
  renderSprite(sprite) {
    if (!sprite.visible || !sprite.member || !stage.ctx) return;

    const ctx = stage.ctx;
    ctx.save();

    // Apply blend (alpha)
    ctx.globalAlpha = sprite.blend / 100;

    // Apply position
    ctx.translate(sprite.locX, sprite.locY);

    // Apply rotation
    if (sprite.rotation !== 0) {
      ctx.rotate(sprite.rotation * Math.PI / 180);
    }

    // Apply flips
    if (sprite.flipH) ctx.scale(-1, 1);
    if (sprite.flipV) ctx.scale(1, -1);

    // Apply ink mode
    switch (sprite.ink) {
      case 0: // copy
        ctx.globalCompositeOperation = 'source-over';
        break;
      case 8: // background transparent
        ctx.globalCompositeOperation = 'source-over';
        break;
      case 36: // add pins (used for overlay tags)
        ctx.globalCompositeOperation = 'source-over';
        break;
      default:
        ctx.globalCompositeOperation = 'source-over';
    }

    // Draw the image
    if (sprite.member instanceof HTMLImageElement || 
        sprite.member instanceof HTMLCanvasElement) {
      ctx.drawImage(sprite.member, 0, 0, sprite.width, sprite.height);
    } else if (sprite.member instanceof ImageData) {
      ctx.putImageData(sprite.member, 0, 0);
    }

    ctx.restore();
  }

  /**
   * Find sprite at a given point
   */
  getSpriteAtPoint(x, y) {
    const sortedSprites = Array.from(this.sprites.values())
      .filter(s => s.visible && s.member)
      .sort((a, b) => {
        if (a.zIndex !== b.zIndex) return b.zIndex - a.zIndex;
        return b.channel - a.channel;
      });

    for (const sprite of sortedSprites) {
      if (sprite.containsPoint(x, y)) {
        return sprite;
      }
    }
    return null;
  }

  /**
   * Print debug info
   */
  print() {
    console.log('--- Sprites ---');
    for (const [channel, sprite] of this.sprites) {
      console.log(`  Channel ${channel}: ${sprite.memberName || '(no member)'} at (${sprite.locX}, ${sprite.locY}) visible=${sprite.visible}`);
    }
    return 1;
  }
}

// Singleton
export const spriteManager = new SpriteManager();
export default spriteManager;
