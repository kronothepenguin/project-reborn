// fuse_client/71_FPS Test Class.ls → fps-test-class.js
// FPS test - performance monitoring window

import {
  symbol,
  theMilliSeconds,
} from '../core/lingo-runtime.js'
import { receiveUpdate, removeUpdate, removeObject } from './object-api.js'

export class FPSTestClass {
  constructor() {
    this.pWndID = 'PerfTest'
    this.pTimerA = 0
    this.pTimerB = 0
    this.pFrames = 0
    this.pCurrMs = 0
    this.pID = null
  }

  construct() {
    this.pWndID = 'PerfTest'
    this.pTimerA = theMilliSeconds()
    this.pTimerB = theMilliSeconds()
    this.pFrames = 0
    this.pCurrMs = 0
    // if (!createWindow(this.pWndID)) return false
    // tWndObj = getWindow(this.pWndID)
    // tWndObj.merge('performance.window')
    // tWndObj.center()
    // tWndObj.registerClient(this.pID)
    // tWndObj.registerProcedure(symbol('#eventProc'), this.pID, symbol('#mouseUp'))
    // tWndObj.getElement('perf_per_frm').setEdit(false)
    // tWndObj.getElement('perf_total').setEdit(false)
    // tWndObj.getElement('close').setEdit(false)
    // tWndObj.getElement('close').setText('x')
    return receiveUpdate(this.pID)
  }

  deconstruct() {
    removeUpdate(this.pID)
    // removeWindow(this.pWndID)
    return true
  }

  update() {
    // pFrames = (pFrames + 1) mod the frameTempo
    this.pFrames = (this.pFrames + 1) % 60
    const tTime = theMilliSeconds() - this.pTimerA
    // tWndObj = getWindow(this.pWndID)
    // tWndObj.getElement('perf_per_frm').setText(tTime + ' ms.')
    if (this.pFrames === 0) {
      const tCurrMs = theMilliSeconds() - this.pTimerB
      if (tCurrMs !== this.pCurrMs) {
        this.pCurrMs = tCurrMs
        // tWndObj.getElement('perf_total').setText(this.pCurrMs + ' ms.')
      }
      this.pTimerB = theMilliSeconds()
    }
    this.pTimerA = theMilliSeconds()
  }

  eventProc(tEvent, tElemID, tParam) {
    if (tElemID === 'close') {
      return removeObject(this.pID)
    }
    return false
  }
}
