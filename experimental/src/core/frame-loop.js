/**
 * Frame Loop / Tempo Manager
 * 
 * Simulates Director's frame loop system:
 * - puppetTempo(fps) sets the target frame rate
 * - go(the frame) creates a loop on the current frame
 * - exitFrame handler is called each frame
 */

import { lingoTheSet, lingoGlobals } from './lingo-runtime.js';
import { stage } from './stage.js';

class FrameLoop {
  constructor() {
    this.targetFPS = 24; // Default Director tempo
    this.frame = 1;
    this.running = false;
    this.animationId = null;
    this.lastTime = 0;
    this.frameInterval = 1000 / this.targetFPS;
    this.exitFrameHandler = null;
    this.stepFrameHandler = null;
    this.frameHandlers = [];
    this.renderHandlers = [];
  }

  /**
   * Set tempo (equivalent of puppetTempo(fps))
   */
  setTempo(fps) {
    this.targetFPS = fps;
    this.frameInterval = 1000 / fps;
    lingoTheSet('tempo', fps);
  }

  /**
   * Set the exitFrame handler
   */
  setExitFrameHandler(handler) {
    this.exitFrameHandler = handler;
  }

  /**
   * Add a per-frame handler (registered by objects that need per-frame updates)
   */
  addFrameHandler(handler) {
    if (!this.frameHandlers.includes(handler)) {
      this.frameHandlers.push(handler);
    }
  }

  /**
   * Add a render handler (called once per frame for rendering)
   */
  addRenderHandler(handler) {
    if (!this.renderHandlers.includes(handler)) {
      this.renderHandlers.push(handler);
    }
  }

  /**
   * Remove a frame handler
   */
  removeFrameHandler(handler) {
    const idx = this.frameHandlers.indexOf(handler);
    if (idx >= 0) this.frameHandlers.splice(idx, 1);
  }

  /**
   * Start the frame loop (equivalent of go(the frame))
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  /**
   * Stop the frame loop
   */
  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Main tick loop
   */
  tick(timestamp) {
    if (!this.running) return;

    const elapsed = timestamp - this.lastTime;

    if (elapsed >= this.frameInterval) {
      // Call exitFrame handler
      if (this.exitFrameHandler) {
        this.exitFrameHandler();
      }

      // Call all registered frame handlers
      for (const handler of this.frameHandlers) {
        handler(elapsed);
      }

      // Call render handlers (stage clear + sprite render)
      stage.clear();
      for (const handler of this.renderHandlers) {
        handler();
      }

      // Update frame counter
      this.frame++;
      lingoTheSet('frame', this.frame);

      // Update timing
      this.lastTime = timestamp - (elapsed % this.frameInterval);
    }

    this.animationId = requestAnimationFrame((t) => this.tick(t));
  }

  /**
   * Get current frame number
   */
  getFrame() {
    return this.frame;
  }
}

// Singleton
export const frameLoop = new FrameLoop();
export default frameLoop;
