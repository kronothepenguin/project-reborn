/**
 * CastLoad Instance Class
 * 
 * Translated from: casts/fuse_client/49_CastLoad Instance Class.ls
 * 
 * Individual cast loading instance with retry logic,
 * progress tracking, and network status monitoring.
 */

import { VOID, voidp, integer } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { getIntVariable } from './variable-api.js';
import { error } from './error-api.js';
import { getSpecialServices } from './special-services-api.js';
import { getCastLoadManager } from './castload-api.js';

export class CastLoadInstance extends ObjectBase {
  constructor() {
    super();

    /** @type {string} Cast file name */
    this.file = '';

    /** @type {string} URL to load from */
    this.url = '';

    /** @type {string|null} Network/preload ID */
    this.netId = null;

    /** @type {string|null} Group ID */
    this.groupId = null;

    /** @type {number} Load start time */
    this.loadTime = 0;

    /** @type {number} Bytes downloaded so far */
    this.bytesSoFar = 0;

    /** @type {number} Try count */
    this.tryCount = 1;

    /** @type {number} Download progress (0-1) */
    this.percent = 0;

    /** @type {string} State: 'LOADING', 'done', 'failed', 'error' */
    this.state = 'idle';

    /** @type {number} Retry delay (ms) */
    this.retryDelay = 10000;

    /** @type {number} Max retry count */
    this.castLoadMaxRetryCount = 10;

    /** @type {number|null} Retry timer ID */
    this.retryTimer = null;
  }

  /**
   * Define the download task
   */
  define(tFile, tURL, tPreloadId) {
    this.file = tFile;
    this.url = tURL;
    this.groupId = tPreloadId;
    this.tryCount = 1;
    this.retryDelay = getIntVariable('castload.retry.delay', 10000);
    this.castLoadMaxRetryCount = getIntVariable('castload.retry.count', 10);

    return this.activate();
  }

  /**
   * Start/restart the download
   */
  activate() {
    // Add cache-busting after 3 retries
    if (this.tryCount > 3 && this.url.includes('http://')) {
      const separator = this.url.includes('?') ? '&' : '?';
      this.url = this.url + separator + Date.now();
    }

    this.loadTime = Date.now();
    this.bytesSoFar = 0;
    this.percent = 0;
    this.state = 'LOADING';

    // Start the download
    this.startDownload();

    return 1;
  }

  /**
   * Start the actual download using fetch
   */
  async startDownload() {
    try {
      const response = await fetch(this.url, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        this.handleError(`HTTP ${response.status}: ${response.statusText}`);
        return;
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body?.getReader();

      if (!reader) {
        // Fallback: read as blob
        const blob = await response.blob();
        this.onDownloadComplete(blob);
        return;
      }

      let received = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        received += value.length;
        this.bytesSoFar = received;
        this.loadTime = Date.now();

        // Update progress
        if (contentLength > 0) {
          this.percent = received / contentLength;
        }

        const manager = getCastLoadManager();
        if (manager && typeof manager.tellStreamState === 'function') {
          manager.tellStreamState(this.file, this.state, this.percent, this.groupId);
        }
      }

      // Combine chunks
      const blob = new Blob(chunks);
      this.onDownloadComplete(blob);

    } catch (err) {
      this.handleError(err.message);
    }
  }

  /**
   * Handle download completion
   */
  onDownloadComplete(blob) {
    this.percent = 1.0;
    this.state = 'done';

    const manager = getCastLoadManager();
    if (manager && typeof manager.doneCurrentDownLoad === 'function') {
      manager.doneCurrentDownLoad(this.file, this.url, this.groupId, this.state);
    }
  }

  /**
   * Handle download error with retry logic
   */
  handleError(errorMsg) {
    console.error(`[CastLoadInstance] Failed: ${this.url} - ${errorMsg}`);

    this.tryCount++;

    if (this.tryCount >= this.castLoadMaxRetryCount) {
      // Max retries exceeded
      this.percent = 1.0;
      this.state = 'failed';

      const manager = getCastLoadManager();
      if (manager && typeof manager.doneCurrentDownLoad === 'function') {
        manager.doneCurrentDownLoad(this.file, this.url, this.groupId, this.state);
      }

      return;
    }

    // Retry after delay
    // Add random param after 3 retries
    if (this.tryCount > 3) {
      const specialServices = getSpecialServices();
      if (specialServices && typeof specialServices.addRandomParamToURL === 'function') {
        this.url = specialServices.addRandomParamToURL(this.url);
      }
    }

    // Schedule retry
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => {
      this.activate();
    }, this.retryDelay);

    const manager = getCastLoadManager();
    if (manager && typeof manager.tellStreamState === 'function') {
      manager.tellStreamState(this.file, 'error', 0, this.groupId);
    }
  }

  /**
   * Update method (called by frame loop)
   * In JS, the async fetch handles progress updates,
   * so this is mostly a no-op.
   */
  update() {
    if (this.state === 'done' || this.state === 'failed') return 1;
    return 1;
  }

  // ── Properties ─────────────────────────────────────────────────────

  getProperty(prop) {
    switch (prop) {
      case 'percent': return this.percent;
      case 'state': return this.state;
      case 'bytesSoFar': return this.bytesSoFar;
      case 'file': return this.file;
      case 'url': return this.url;
      case 'tryCount': return this.tryCount;
      default: return VOID;
    }
  }
}

// Register
import { ObjectManager } from './object-manager-class.js';
ObjectManager.registerClass('CastLoad Instance Class', CastLoadInstance);
