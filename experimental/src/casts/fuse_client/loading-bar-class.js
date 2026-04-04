/**
 * Loading Bar Class
 * Translated from: 68_Loading Bar Class.ls
 * Progress bar for downloads and cast loading.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { error, receivePrepare, removeObject } from './object-api.js';
import { removeWindow, createWindow, getWindow } from './window-api.js';
import { getCastLoadManager } from './castload-api.js';
import { getDownloadManager } from './download-api.js';

export class LoadingBar extends ObjectBase {
  constructor() {
    super();
    this.taskId = '';
    this.buffer = null;
    this.bgColor = '#000000';
    this.color = '#808080';
    this.width = 128;
    this.height = 16;
    this.barRect = null;
    this.offRect = null;
    this.taskType = 'cast';
    this.percent = 0;
    this.drawPoint = 0;
    this.windowID = '';
    this.readyFlag = 0;
  }

  construct() {
    this.taskId = '';
    this.buffer = null;
    this.width = 128;
    this.height = 16;
    this.bgColor = '#000000';
    this.color = '#808080';
    this.taskType = 'cast';
    this.drawPoint = 0;
    this.windowID = '';
    this.readyFlag = 0;
    this.percent = 0;
    return 1;
  }

  deconstruct() {
    this.taskId = VOID;
    removePrepare(this.id);
    if (this.windowID) {
      removeWindow(this.windowID);
      this.windowID = '';
    }
    return 1;
  }

  define(tLoadID, tProps) {
    if (typeof tLoadID !== 'string' && typeof tLoadID !== 'symbol') {
      error(this, `Invalid castload task ID: ${tLoadID}`, 'define', 'major');
      return 0;
    }

    this.taskId = tLoadID;
    this.percent = 0;
    this.drawPoint = 0;
    this.readyFlag = 0;

    if (typeof tProps === 'object' && tProps !== null) {
      if (tProps.width) this.width = tProps.width;
      if (tProps.height) this.height = tProps.height;
      if (tProps.bgColor) this.bgColor = tProps.bgColor;
      if (tProps.color) this.color = tProps.color;
      if (tProps.type) this.taskType = tProps.type;

      if (tProps.buffer === 'window') {
        if (this.windowID) removeWindow(this.windowID);
        this.windowID = this.id + '_' + Date.now();
        createWindow(this.windowID, 'system.window');
        const tWndObj = getWindow(this.windowID);
        if (tWndObj) {
          tWndObj.resizeTo?.(this.width, this.height);
        }
      }
    }

    // Set up bar rects
    const bufWidth = this.buffer?.width || 800;
    const bufHeight = this.buffer?.height || 600;
    const barLeft = (bufWidth / 2) - (this.width / 2);
    const barTop = (bufHeight / 2) - (this.height / 2);
    this.barRect = [barLeft, barTop, barLeft + this.width, barTop + this.height];
    this.offRect = [barLeft + 2, barTop + 2, barLeft + this.width - 2, barTop + this.height - 2];

    return receivePrepare(this.id);
  }

  prepare() {
    if (voidp(this.taskId) || this.readyFlag) {
      return removeObject(this.id);
    }

    let tPercent;
    if (this.taskType === 'cast') {
      tPercent = getCastLoadManager()?.getLoadPercent(this.taskId) || 0;
    } else {
      tPercent = getDownloadManager()?.getLoadPercent(this.taskId) || 0;
    }

    // Update draw
    this.drawPoint++;
    if (this.drawPoint <= tPercent * (this.offRect[2] - this.offRect[0])) {
      // Draw progress
    }

    if (tPercent !== this.percent) {
      // Redraw bar
      this.drawPoint = tPercent * (this.offRect[2] - this.offRect[0]);
      this.percent = tPercent;

      if (this.percent >= 1.0) {
        this.readyFlag = 1;
      }
    }
  }
}

ObjectManager.registerClass('Loading Bar Class', LoadingBar);
