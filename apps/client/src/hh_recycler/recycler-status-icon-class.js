// hh_recycler/7_Recycler Status Icon Class.ls → recycler-status-icon-class.js
// Recycler status icon - flashing button icon for recycler status

import {
  symbol,
  voidP,
  point,
  member,
  getmemnum,
  reserveSprite,
  sprite,
  setEventBroker,
  cursor,
  receivePrepare,
  removePrepare,
} from '../core/lingo-runtime.js'
import { createWindow, getWindow, windowExists, removeWindow } from '../fuse_client/window-api.js'
import { getText } from '../fuse_client/text-api.js'
import { getVariableValue } from '../fuse_client/variable-api.js'
import { error } from '../fuse_client/error-api.js'

export class RecyclerStatusIconClass {
  constructor() {
    this.pRecyclerButtonSpr = null
    this.pButtonLoc = point(40, 5)
    this.pNormalMem = null
    this.pHighlightMem = null
    this.pSkippedFrames = 0
    this.pFLashOn = false
    this.pStatusWindowID = null
  }

  construct() {
    this.pNormalMem = member(getmemnum(getVariableValue('recycler.status.icon.normal')))
    this.pHighlightMem = member(getmemnum(getVariableValue('recycler.status.icon.highlight')))
    this.pStatusWindowID = getText('recycler_status_window_title')
    return true
  }

  deconstruct() {
    removePrepare(this.getID())
    if (this.pRecyclerButtonSpr && this.pRecyclerButtonSpr.spriteNum) {
      this.pRecyclerButtonSpr.visible = false
    }
    this.pRecyclerButtonSpr = null
    return true
  }

  getID() {
    return 'hh_recycler.status_icon'
  }

  showRecyclerButton(tstate) {
    if (voidP(tstate)) {
      tstate = 'normal'
    }
    if (!this.pRecyclerButtonSpr || !this.pRecyclerButtonSpr.spriteNum) {
      this.pRecyclerButtonSpr = sprite(reserveSprite(this.getID()))
      if (!this.pRecyclerButtonSpr || this.pRecyclerButtonSpr.spriteNum === 0) {
        return false
      }
    }
    this.pRecyclerButtonSpr.member = this.pNormalMem
    this.pRecyclerButtonSpr.ink = 8
    this.pRecyclerButtonSpr.locH = this.pButtonLoc.locH
    this.pRecyclerButtonSpr.locV = this.pButtonLoc.locV
    this.pRecyclerButtonSpr.locZ = 200000000
    this.pRecyclerButtonSpr.visible = true
    setEventBroker(this.pRecyclerButtonSpr.spriteNum, this.getID() + '_spr')
    this.pRecyclerButtonSpr.registerProcedure(symbol('#eventProcRecyclerButton'), this.getID(), symbol('#mouseUp'))
    this.pRecyclerButtonSpr.cursor = cursor(1) // finger
    if (tstate === 'highlight') {
      this.setFlashing(true)
    } else {
      this.setFlashing(false)
    }
    return true
  }

  hideRecyclerButton() {
    if (!this.pRecyclerButtonSpr || !this.pRecyclerButtonSpr.spriteNum) {
      return false
    }
    this.pRecyclerButtonSpr.visible = false
  }

  setFlashing(tFlashingOn) {
    if (voidP(tFlashingOn)) {
      tFlashingOn = false
    }
    if (tFlashingOn) {
      receivePrepare(this.getID())
    } else {
      removePrepare(this.getID())
      if (this.pRecyclerButtonSpr && this.pRecyclerButtonSpr.spriteNum) {
        this.pRecyclerButtonSpr.member = this.pNormalMem
      }
    }
  }

  openCloseStatusWindow() {
    if (windowExists(this.pStatusWindowID)) {
      this.closeStatusWindow()
    } else {
      this.createStatusWindow()
    }
  }

  eventProcRecyclerButton(tEvent, tSprID, tProp) {
    if (tEvent === symbol('#mouseUp')) {
      switch (tSprID) {
        case 'recycler_note_ok':
        case 'rec_status_icon_spr':
          this.openCloseStatusWindow()
          break
      }
    }
  }

  createStatusWindow() {
    if (!createWindow(this.pStatusWindowID, 'habbo_full.window')) {
      return error(this, 'Failed to create status window', symbol('#createStatusWindow'), symbol('#major'))
    }
    const tWindowObj = getWindow(this.pStatusWindowID)
    tWindowObj.merge('recycler_notification.window')
    tWindowObj.registerProcedure(symbol('#eventProcRecyclerButton'), this.getID(), symbol('#mouseUp'))
  }

  closeStatusWindow() {
    removeWindow(this.pStatusWindowID)
  }

  prepare() {
    this.pSkippedFrames = this.pSkippedFrames - 1
    if (this.pSkippedFrames < 0) {
      this.pSkippedFrames = 15
    } else {
      return false
    }
    if (this.pFLashOn) {
      this.pRecyclerButtonSpr.member = this.pNormalMem
      this.pFLashOn = false
    } else {
      this.pRecyclerButtonSpr.member = this.pHighlightMem
      this.pFLashOn = true
    }
  }
}
