// hh_entry_init/11_Opening Hours Interface Class.ls → opening-hours-interface-class.js
// Opening hours interface - manages hotel closing/availability windows

import {
  symbol,
  voidP,
  string,
  replaceChunks,
} from '../../core/lingo-runtime.js'
import { windowExists, createWindow, getWindow, removeWindow } from '../../fuse_client/window-api.js'
import { getText } from '../../fuse_client/text-api.js'

export class OpeningHoursInterfaceClass {
  constructor() {
    this.pHotelClosingID = null
    this.pLoginFailedID = 'opening_hours_login_failed'
  }

  construct() {
    this.pHotelClosingID = getText('opening_hours_title')
    return true
  }

  deconstruct() {
    return this.hideAll()
  }

  getID() {
    return 'hh_entry_init.opening_hours.interface'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  hideAll() {
    this.hideHotelClosingAlert()
    this.hideHotelClosingNotice()
    this.hideHotelClosedNotice()
    this.hideHotelClosedDisconnectNotice()
  }

  showHotelClosingAlert(tTimeDelta) {
    if (!windowExists(this.pHotelClosingID)) {
      createWindow(this.pHotelClosingID, 'habbo_basic.window', 0, 0, symbol('#modal'))
      const tWndObj = getWindow(this.pHotelClosingID)
      if (tWndObj === 0) return false
    } else {
      const tWndObj = getWindow(this.pHotelClosingID)
      tWndObj.unmerge()
    }
    const tWindow = 'openhrs'
    const tWndObj = getWindow(this.pHotelClosingID)
    if (!tWndObj.merge(tWindow + '.window')) {
      return this.hideHotelClosingStatusAlert()
    }
    let tText = getText('opening_hours_text_shutdown')
    if (voidP(tTimeDelta)) {
      tText = replaceChunks(tText, '%d%', '')
    } else {
      tText = replaceChunks(tText, '%d%', string(tTimeDelta))
    }
    tWndObj.getElement('openhrs_txt').setText(tText)
    tWndObj.center()
    tWndObj.registerClient(this.getID())
    tWndObj.registerProcedure(symbol('#eventProcStatus'), this.getID(), symbol('#mouseUp'))
  }

  showHotelClosingNotice() {
    if (!windowExists(this.pHotelClosingID)) {
      createWindow(this.pHotelClosingID, 'habbo_basic.window', 0, 0, symbol('#modal'))
      const tWndObj = getWindow(this.pHotelClosingID)
      if (tWndObj === 0) return false
    } else {
      const tWndObj = getWindow(this.pHotelClosingID)
      tWndObj.unmerge()
    }
    const tWndObj = getWindow(this.pHotelClosingID)
    if (!tWndObj.merge('openhrs.window')) {
      return this.hideHotelClosingNotice()
    }
    tWndObj.center()
    const tText = getText('opening_hours_text_disabled')
    tWndObj.getElement('openhrs_txt').setText(tText)
    tWndObj.registerClient(this.getID())
    tWndObj.registerProcedure(symbol('#eventProcNotice'), this.getID(), symbol('#mouseUp'))
  }

  showHotelClosedDisconnectNotice(tOpenHour, tOpenMinute) {
    if (!windowExists(this.pLoginFailedID)) {
      createWindow(this.pLoginFailedID, 'error.window', 0, 0, symbol('#modal'))
      const tWndObj = getWindow(this.pLoginFailedID)
      if (tWndObj === 0) return false
      tWndObj.center()
      let tText = getText('opening_hours_text_opening_time')
      let tHour = string(tOpenHour)
      if (tHour.length === 1) tHour = '0' + tHour
      let tMinute = string(tOpenMinute)
      if (tMinute.length === 1) tMinute = '0' + tMinute
      tText = replaceChunks(tText, '%h%', tHour)
      tText = replaceChunks(tText, '%m%', tMinute)
      tWndObj.getElement('error_title').setText(getText('Alert_ConnectionFailure'))
      tWndObj.getElement('error_text').setText(tText)
      tWndObj.registerClient(this.getID())
      tWndObj.registerProcedure(symbol('#eventProcLoginFailed'), this.getID(), symbol('#mouseUp'))
    }
    return true
  }

  showHotelClosedNotice(tOpenHour, tOpenMinute) {
    if (!windowExists(this.pHotelClosingID)) {
      createWindow(this.pHotelClosingID, 'habbo_basic.window', 0, 0, symbol('#modal'))
      const tWndObj = getWindow(this.pHotelClosingID)
      if (tWndObj === 0) return false
    } else {
      const tWndObj = getWindow(this.pHotelClosingID)
      tWndObj.unmerge()
    }
    const tWndObj = getWindow(this.pHotelClosingID)
    if (!tWndObj.merge('openhrs.window')) {
      return this.hideHotelClosedNotice()
    }
    tWndObj.center()
    let tText = getText('opening_hours_text_closed')
    let tHour = string(tOpenHour)
    if (tHour.length === 1) tHour = '0' + tHour
    let tMinute = string(tOpenMinute)
    if (tMinute.length === 1) tMinute = '0' + tMinute
    tText = replaceChunks(tText, '%h%', tHour)
    tText = replaceChunks(tText, '%m%', tMinute)
    tWndObj.getElement('openhrs_txt').setText(tText)
    tWndObj.registerClient(this.getID())
    tWndObj.registerProcedure(symbol('#eventProcClosed'), this.getID(), symbol('#mouseUp'))
  }

  hideHotelClosingAlert() {
    if (windowExists(this.pHotelClosingID)) {
      return removeWindow(this.pHotelClosingID)
    }
    return false
  }

  hideHotelClosingNotice() {
    if (windowExists(this.pHotelClosingID)) {
      return removeWindow(this.pHotelClosingID)
    }
    return false
  }

  hideHotelClosedDisconnectNotice() {
    if (windowExists(this.pLoginFailedID)) {
      return removeWindow(this.pLoginFailedID)
    }
    return false
  }

  hideHotelClosedNotice() {
    if (windowExists(this.pHotelClosingID)) {
      return removeWindow(this.pHotelClosingID)
    }
    return false
  }

  eventProcStatus(tEvent, tElemID, tParam) {
    if (tEvent === symbol('#mouseUp')) {
      switch (tElemID) {
        case 'close':
        case 'openhrs_ok':
          return this.hideHotelClosingAlert()
        default:
          return false
      }
    }
    return true
  }

  eventProcNotice(tEvent, tElemID, tParam) {
    if (tEvent === symbol('#mouseUp')) {
      switch (tElemID) {
        case 'close':
        case 'openhrs_ok':
          return this.hideHotelClosingNotice()
        default:
          return false
      }
    }
    return true
  }

  eventProcLoginFailed(tEvent, tElemID, tParam) {
    if (tEvent === symbol('#mouseUp')) {
      return false
    }
    return true
  }

  eventProcClosed(tEvent, tElemID, tParam) {
    if (tEvent === symbol('#mouseUp')) {
      switch (tElemID) {
        case 'close':
        case 'openhrs_ok':
          return this.hideHotelClosingNotice()
        default:
          return false
      }
    }
    return true
  }
}
