/**
 * Event Broker Behavior
 * 
 * Translated from: casts/fuse_client/3_Event Broker Behavior.ls
 * 
 * Routes mouse and keyboard events to registered handlers.
 * In Lingo, this is a sprite behavior that intercepts events
 * and forwards them to registered procedures.
 * 
 * Original Lingo:
 *   property id, pSprite, pLink, pProcList
 *   
 *   on registerProcedure me, tMethod, tClientID, tEvent ...
 *   on mouseDown me ... redirectEvent(#mouseDown)
 *   on mouseUp me ... redirectEvent(#mouseUp)
 *   on keyDown me ... redirectEvent(#keyDown)
 *   on keyUp me ... redirectEvent(#keyUp)
 *   
 * In JS, we use DOM event listeners on the canvas element
 * and route them to registered object handlers.
 */

import { VOID, voidp, objectp } from '../../core/lingo-runtime.js';
import { getObject, objectExists } from './object-api.js';
import { spriteManager } from '../../engine/sprite-manager.js';

/**
 * Event types supported by the broker
 */
const EVENT_TYPES = [
  'mouseEnter',
  'mouseLeave',
  'mouseWithin',
  'mouseDown',
  'mouseUp',
  'mouseUpOutSide',
  'keyDown',
  'keyUp',
];

/**
 * Event Broker - routes DOM events to registered Lingo handlers
 */
class EventBroker {
  constructor() {
    /** @type {Map<string, Map<string, Object>} Event -> (spriteId -> handler info) */
    this.procedures = new Map();
    /** @type {Map<string, Object>} Sprite ID -> broker instance */
    this.brokers = new Map();
    /** @type {HTMLCanvasElement|null} The canvas to listen on */
    this.canvas = null;
    /** @type {boolean} Whether the broker is active */
    this.active = false;
  }

  /**
   * Initialize the broker with a canvas element
   */
  init(canvas) {
    this.canvas = canvas;
    this.active = true;

    // Mouse events
    canvas.addEventListener('mousedown', (e) => this.handleMouseEvent('mouseDown', e));
    canvas.addEventListener('mouseup', (e) => this.handleMouseEvent('mouseUp', e));
    canvas.addEventListener('mouseenter', (e) => this.handleMouseEvent('mouseEnter', e));
    canvas.addEventListener('mouseleave', (e) => this.handleMouseEvent('mouseLeave', e));
    canvas.addEventListener('mousemove', (e) => this.handleMouseEvent('mouseWithin', e));

    // Keyboard events
    canvas.addEventListener('keydown', (e) => this.handleKeyEvent('keyDown', e));
    canvas.addEventListener('keyup', (e) => this.handleKeyEvent('keyUp', e));

    // Enable keyboard focus
    canvas.tabIndex = 0;
    canvas.setAttribute('tabindex', '0');
  }

  /**
   * Handle a mouse event
   */
  handleMouseEvent(eventName, domEvent) {
    if (!this.active) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = domEvent.clientX - rect.left;
    const y = domEvent.clientY - rect.top;

    // Find the topmost sprite at this point
    const sprite = spriteManager.getSpriteAtPoint(x, y);

    if (sprite) {
      // Check if this sprite has event procedures registered
      const procs = sprite.eventProcedures.get(eventName);
      if (procs && procs.length > 0) {
        for (const proc of procs) {
          this.invokeProcedure(proc, eventName, sprite.channel, domEvent);
        }

        // Stop event propagation if handled (like stopEvent() in Lingo)
        domEvent.preventDefault();
        domEvent.stopPropagation();
      }
    }
  }

  /**
   * Handle a keyboard event
   */
  handleKeyEvent(eventName, domEvent) {
    if (!this.active) return;

    // Route to the keyboard focus sprite
    const focusSprite = spriteManager.getSprite(
      domEvent.target === this.canvas ? 1 : 0
    );

    if (focusSprite) {
      const procs = focusSprite.eventProcedures.get(eventName);
      if (procs && procs.length > 0) {
        for (const proc of procs) {
          this.invokeProcedure(proc, eventName, focusSprite.channel, domEvent);
        }
      }
    }
  }

  /**
   * Invoke a registered procedure
   */
  invokeProcedure(procInfo, eventName, spriteID, domEvent) {
    const { clientID, method } = procInfo;

    if (!objectExists(clientID)) return;

    const obj = getObject(clientID);
    if (!obj) return;

    // Call the method on the object
    // In Lingo: call(method, getObject(clientID), eventName, spriteID)
    // In JS: obj[method](eventName, spriteID, domEvent)
    if (typeof obj[method] === 'function') {
      try {
        obj[method](eventName, String(spriteID), domEvent);
      } catch (e) {
        console.error(`[EventBroker] Error invoking ${method} on ${clientID}:`, e);
      }
    }
  }

  /**
   * Register a procedure for a sprite
   * 
   * Equivalent of the Event Broker Behavior's registerProcedure handler.
   * 
   * @param {string|number} spriteId - Sprite channel or ID
   * @param {string} method - Method name to call on the handler object
   * @param {string|symbol} clientID - Object ID of the handler
   * @param {string} [event] - Specific event (or all events if void)
   */
  registerProcedure(spriteId, method, clientID, event) {
    const sprite = spriteManager.getSprite(spriteId);
    if (!sprite) {
      console.warn(`[EventBroker] Sprite ${spriteId} not found`);
      return 0;
    }

    // Register on the sprite
    if (voidp(event)) {
      // Register for all events
      for (const eventType of EVENT_TYPES) {
        sprite.registerProcedure(eventType, clientID, method);
      }
    } else {
      sprite.registerProcedure(event, clientID, method);
    }

    return 1;
  }

  /**
   * Remove procedure(s) for a sprite
   */
  removeProcedure(spriteId, event) {
    const sprite = spriteManager.getSprite(spriteId);
    if (!sprite) return 0;

    if (voidp(event)) {
      // Remove all
      sprite.eventProcedures.clear();
    } else {
      sprite.removeProcedure(event);
    }

    return 1;
  }

  /**
   * Set the sprite for this broker (equivalent of setMember)
   */
  setSprite(spriteId) {
    // In Lingo, the broker behavior is attached to a sprite
    // In JS, we use the sprite channel directly
    return 1;
  }

  /**
   * Deconstruct
   */
  deconstruct() {
    this.active = false;
    this.procedures.clear();
    this.brokers.clear();

    // Remove event listeners (by replacing canvas reference)
    if (this.canvas) {
      // Events will naturally stop since the canvas may be removed
      this.canvas = null;
    }

    return 1;
  }
}

// Singleton
export const eventBroker = new EventBroker();
export default eventBroker;

// ── Global API (matching Lingo patterns) ───────────────────────────────

/**
 * Register an event procedure on a sprite
 */
export function registerEventProcedure(spriteId, method, clientID, event) {
  return eventBroker.registerProcedure(spriteId, method, clientID, event);
}

/**
 * Remove event procedure(s)
 */
export function removeEventProcedure(spriteId, event) {
  return eventBroker.removeProcedure(spriteId, event);
}

/**
 * Stop event propagation (equivalent of Lingo's stopEvent())
 */
export function stopEvent() {
  // In JS, this is handled by preventing default in the DOM handler
  // This function exists for 1:1 translation compatibility
}

/**
 * Pass event to next handler (equivalent of Lingo's pass())
 */
export function pass() {
  // In JS, we just don't prevent default
  // This function exists for 1:1 translation compatibility
}
