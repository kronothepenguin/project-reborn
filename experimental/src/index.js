/**
 * FuseClient - Main Entry Point
 * 
 * Bootstrap sequence for the translated LingoScript → JavaScript client.
 * 
 * Load order (matches original Director movie):
 * 1. habbo/Initialization → prepareMovie
 * 2. habbo/Init → waits for preload, calls initCore()
 * 3. fuse_client/client-initialization → initCore()
 * 4. Frame loop begins (habbo/Loop → go(the frame))
 * 
 * ── Exported API ─────────────────────────────────────────────────────
 * 
 *   import { mount } from 'fuse-client';
 *   mount('#canvas', { processLogUrl: '...', accountId: '...' });
 *   mount(document.getElementById('stage'), { ... });
 */

import { stage } from './core/stage.js';
import { frameLoop } from './core/frame-loop.js';
import { prepareMovie, registerExternalParam } from './casts/habbo/initialization.js';
import { exitFrameInit } from './casts/habbo/init.js';
import { spriteManager } from './engine/sprite-manager.js';
import { eventBroker } from './casts/fuse_client/event-broker.js';

// ── Internal boot ────────────────────────────────────────────────────

async function boot(canvas, params = {}) {
  const width = params.width || 800;
  const height = params.height || 600;

  // 1. Initialize the stage
  stage.init(canvas, width, height);

  // 2. Register external parameters (from env or options)
  for (const [key, value] of Object.entries(params)) {
    registerExternalParam(key, value);
  }

  // 3. Run prepareMovie (habbo/Initialization)
  prepareMovie();

  // 4. Run the init frame handler → initCore()
  exitFrameInit();

  // 5. Register sprite manager as render handler
  frameLoop.addRenderHandler(() => spriteManager.render());

  // 6. Initialize event broker for mouse/keyboard routing
  eventBroker.init(canvas);

  console.log('[FuseClient] Boot complete');
}

// ── Exported mount() function (React-style) ──────────────────────────

/**
 * @typedef {Object} MountOptions
 * @property {string} [processLogUrl] - Process log endpoint
 * @property {string} [accountId] - Account/session ID
 * @property {string} [clientUrl] - Client base URL
 * @property {number} [width] - Stage width (default: 800)
 * @property {number} [height] - Stage height (default: 600)
 * @property {string} [serverHost] - Game server hostname
 * @property {number} [serverPort] - Game server port
 * @property {boolean} [debug] - Enable debug mode
 * @property {Object} [customParams] - Additional custom external params
 */

/**
 * Mount the FuseClient application to a DOM element.
 * 
 * @param {string|HTMLElement} target - CSS selector or DOM element
 * @param {MountOptions} [options] - Configuration options
 * @returns {Promise<{unmount: () => void}>} Cleanup function
 * 
 * @example
 * import { mount } from 'fuse-client';
 * 
 * const client = await mount('#game-canvas', {
 *   processLogUrl: 'https://api.habbo.com/processlog',
 *   accountId: 'user-123',
 *   serverHost: 'game.habbo.com',
 *   serverPort: 30001,
 *   width: 1024,
 *   height: 768,
 * });
 * 
 * client.unmount();
 */
export async function mount(target, options = {}) {
  // Resolve target element
  let canvas;
  if (typeof target === 'string') {
    canvas = document.querySelector(target);
    if (!canvas) {
      throw new Error(`FuseClient: target "${target}" not found`);
    }
  } else if (target instanceof HTMLElement) {
    canvas = target;
  } else {
    throw new Error('FuseClient: target must be a CSS selector or HTMLElement');
  }

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('FuseClient: target must be a <canvas> element');
  }

  // Build external params object
  const params = {};

  // Map named options to Lingo param format
  if (options.processLogUrl) params['processlog.url'] = options.processLogUrl;
  if (options.accountId) params['account_id'] = options.accountId;
  if (options.clientUrl) params['client_url'] = options.clientUrl;
  if (options.serverHost) params['server.host'] = options.serverHost;
  if (options.serverPort) params['server.port'] = String(options.serverPort);

  // Add custom params
  if (options.customParams) {
    Object.assign(params, options.customParams);
  }

  // Add dimensions
  if (options.width) params.width = options.width;
  if (options.height) params.height = options.height;

  // Boot the application
  await boot(canvas, params);

  // Return cleanup function
  return {
    unmount: () => {
      frameLoop.stop();
      eventBroker.deconstruct();
    },
  };
}

// ── Dev mode auto-init (Vite dev server) ──────────────────────────────

if (typeof window !== 'undefined' && !window.__fuseClientMounted) {
  window.__fuseClientMounted = true;

  document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('stage');
    if (!canvas) return;

    // Build params from Vite env vars (import.meta.env.VITE_*)
    const params = {};

    if (import.meta.env.VITE_PROCESS_LOG_URL) {
      params['processlog.url'] = import.meta.env.VITE_PROCESS_LOG_URL;
    }
    if (import.meta.env.VITE_ACCOUNT_ID) {
      params['account_id'] = import.meta.env.VITE_ACCOUNT_ID;
    }
    if (import.meta.env.VITE_CLIENT_URL) {
      params['client_url'] = import.meta.env.VITE_CLIENT_URL;
    }
    if (import.meta.env.VITE_SERVER_HOST) {
      params['server.host'] = import.meta.env.VITE_SERVER_HOST;
    }
    if (import.meta.env.VITE_SERVER_PORT) {
      params['server.port'] = import.meta.env.VITE_SERVER_PORT;
    }

    console.log('[FuseClient] Dev params from .env:', params);
    await boot(canvas, params);
  });
}

// ── Default export ───────────────────────────────────────────────────

export default { mount };
