/**
 * FPS Test Class
 * Translated from: 71_FPS Test Class.ls
 * Performance monitor window showing ms per frame.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { removeObject, receiveUpdate, removeUpdate } from './object-api.js';
import { createWindow, removeWindow, getWindow } from './window-api.js';

export class FPSTest extends ObjectBase {
  constructor() {
    super();
    this.wndID = 'PerfTest';
    this.timerA = 0;
    this.timerB = 0;
    this.frames = 0;
    this.currMs = 0;
  }

  construct() {
    this.wndID = 'PerfTest';
    this.timerA = Date.now();
    this.timerB = Date.now();
    this.frames = 0;
    this.currMs = 0;

    if (!createWindow(this.wndID)) return 0;

    const tWndObj = getWindow(this.wndID);
    if (tWndObj) {
      tWndObj.merge?.('performance.window');
      tWndObj.registerClient?.(this.id);
      tWndObj.registerProcedure?.('eventProc', this.id, 'mouseUp');
    }

    return receiveUpdate(this.id);
  }

  deconstruct() {
    removeUpdate(this.id);
    removeWindow(this.wndID);
    return 1;
  }

  update() {
    this.frames = (this.frames + 1) % 24; // frameTempo
    const tTime = Date.now() - this.timerA;

    const tWndObj = getWindow(this.wndID);
    if (tWndObj) {
      const perfPerFrm = tWndObj.getElement?.('perf_per_frm');
      if (perfPerFrm) perfPerFrm.setText?.(`${tTime}ms.`);
    }

    if (this.frames === 0) {
      const tCurrMs = Date.now() - this.timerB;
      if (tCurrMs !== this.currMs) {
        this.currMs = tCurrMs;
        if (tWndObj) {
          const perfTotal = tWndObj.getElement?.('perf_total');
          if (perfTotal) perfTotal.setText?.(`${this.currMs}ms.`);
        }
      }
      this.timerB = Date.now();
    }
    this.timerA = Date.now();
  }

  eventProc(tEvent, tElemID, tParam) {
    if (tElemID === 'close') {
      return removeObject(this.id);
    }
    return 0;
  }
}

ObjectManager.registerClass('FPS Test Class', FPSTest);
