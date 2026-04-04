/**
 * Download Instance Class
 * Translated from: 48_Download Instance Class.ls
 * Individual download using fetch() with progress tracking.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { error } from './error-api.js';
import { getDownloadManager } from './download-api.js';
import { getIntVariable } from './variable-api.js';

export class DownloadInstance extends ObjectBase {
  constructor() {
    super();
    this.file = '';
    this.url = '';
    this.netId = null;
    this.groupId = null;
    this.loadTime = 0;
    this.bytesSoFar = 0;
    this.tryCount = 1;
    this.percent = 0;
    this.state = 'idle';
    this.retryDelay = 10000;
    this.maxRetryCount = 10;
    this.retryTimer = null;
  }

  define(tMemName, tdata) {
    this.file = tMemName;
    this.url = tdata.url;
    this.groupId = tdata.memNum;
    this.tryCount = 1;
    this.retryDelay = getIntVariable('castload.retry.delay', 10000);
    this.maxRetryCount = getIntVariable('castload.retry.count', 10);
    this.callback = tdata.callback;
    return this.activate();
  }

  async activate() {
    if (this.tryCount > 3 && this.url.includes('http://')) {
      const sep = this.url.includes('?') ? '&' : '?';
      this.url += sep + Date.now();
    }

    this.loadTime = Date.now();
    this.bytesSoFar = 0;
    this.percent = 0;
    this.state = 'LOADING';

    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        this.handleError(`HTTP ${response.status}`);
        return;
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      const blob = await response.blob();
      this.bytesSoFar = blob.size;
      this.percent = contentLength > 0 ? blob.size / contentLength : 1;
      this.state = 'done';

      // Store in member if needed
      const manager = getDownloadManager();
      if (manager && typeof manager.removeActiveTask === 'function') {
        manager.removeActiveTask(this.file, this.callback, true);
      }
    } catch (err) {
      this.handleError(err.message);
    }
  }

  handleError(errorMsg) {
    this.tryCount++;
    if (this.tryCount >= this.maxRetryCount) {
      this.percent = 1;
      this.state = 'failed';
      const manager = getDownloadManager();
      if (manager?.removeActiveTask) manager.removeActiveTask(this.file, this.callback, false);
      return;
    }
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.activate(), this.retryDelay);
  }

  getProperty(tProp) {
    switch (tProp) {
      case 'Percent': return this.percent;
      case 'status': return this.state;
      default: return VOID;
    }
  }

  addCallBack(tID, tMethod, tClientID, tArgument) {
    this.callback = { method: tMethod, client: tClientID, argument: tArgument };
    return 1;
  }
}

ObjectManager.registerClass('Download Instance Class', DownloadInstance);
