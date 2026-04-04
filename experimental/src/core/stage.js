/**
 * Stage Emulation
 * 
 * Simulates Macromedia Director's Stage object - the main display surface.
 * Maps to the HTML Canvas element.
 */

import { lingoGlobals, lingoTheSet } from './lingo-runtime.js';

class Stage {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 800;
    this.height = 600;
    this.backgroundColor = '#000000';
    this.foremostWindow = null;
    this.exitLock = false;
  }

  /**
   * Initialize the stage with a canvas element
   */
  init(canvasElement, width = 800, height = 600) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.width = width;
    this.height = height;
    
    canvasElement.width = width;
    canvasElement.height = height;
    
    // Update Lingo globals
    lingoTheSet('stageLeft', 0);
    lingoTheSet('stageTop', 0);
    lingoTheSet('stageRight', width);
    lingoTheSet('stageBottom', height);
    lingoTheSet('stageWidth', width);
    lingoTheSet('stageHeight', height);
    
    // Clear with background
    this.clear();
  }

  /**
   * Clear the stage
   */
  clear() {
    if (this.ctx) {
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  /**
   * Move window/stage to front (equivalent of moveToFront(the stage))
   */
  moveToFront() {
    if (this.canvas) {
      this.canvas.style.zIndex = '1';
      this.canvas.focus();
    }
  }

  /**
   * Set exit lock (equivalent of set the exitLock to 1)
   */
  setExitLock(value) {
    this.exitLock = !!value;
    lingoTheSet('exitLock', value ? 1 : 0);
  }

  /**
   * Get stage dimensions as rect
   */
  getRect() {
    return { left: 0, top: 0, right: this.width, bottom: this.height };
  }

  /**
   * Render frame
   */
  render() {
    // Base stage render (clears background)
    this.clear();
  }
}

// Singleton
export const stage = new Stage();
export default stage;
