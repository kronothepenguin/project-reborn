// hh_entry_init/12_Opening Hours Component Class.ls → opening-hours-component-class.js
// Opening hours component - manages hotel closing/availability status

import { symbol } from '../core/lingo-runtime.js'
import { registerMessage, unregisterMessage } from '../fuse_client/broker-manager-api.js'
import { getConnection, getVariable } from '../fuse_client/connection-api.js'

export class OpeningHoursComponentClass {
  constructor() {
    this.pHotelClosingStatus = 0
    this.pHotelClosedDisconnectStatus = 0
  }

  construct() {
    this.pHotelClosingStatus = 0
    this.pHotelClosedDisconnectStatus = 0
    registerMessage(symbol('#getHotelClosingStatus'), this.getID(), symbol('#getHotelClosingStatus'))
    registerMessage(symbol('#getHotelClosedDisconnectStatus'), this.getID(), symbol('#getHotelClosedDisconnectStatus'))
    registerMessage(symbol('#getAvailabilityTime'), this.getID(), symbol('#sendGetAvailabilityTime'))
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#getHotelClosingStatus'), this.getID())
    unregisterMessage(symbol('#getOpeningHours'), this.getID())
    unregisterMessage(symbol('#getHotelClosedDisconnectStatus'), this.getID())
    return true
  }

  getID() {
    return 'hh_entry_init.opening_hours.component'
  }

  getInterface() {
    return this.pInterface
  }

  setInterface(tIface) {
    this.pInterface = tIface
  }

  getHotelClosingStatus(tList) {
    let tValue = 0
    if (this.pHotelClosingStatus === 1) {
      tValue = 1
    }
    if (typeof tList === 'object' && tList !== null && !Array.isArray(tList)) {
      tList['retval'] = tValue
      if (tValue && tList['showDialog']) {
        this.getInterface().showHotelClosingNotice()
      }
    }
    return tValue
  }

  getHotelAvailabilityStatus(tList) {
    let tValue = 1
    if (this.pHotelClosingStatus === 2) {
      tValue = 0
    }
    if (typeof tList === 'object' && tList !== null && !Array.isArray(tList)) {
      tList['retval'] = tValue
    }
    return tValue
  }

  getHotelClosedDisconnectStatus(tList) {
    const tValue = this.pHotelClosedDisconnectStatus
    if (typeof tList === 'object' && tList !== null && !Array.isArray(tList)) {
      tList['retval'] = tValue
    }
    return tValue
  }

  setHotelClosingStatus(tStatus) {
    this.pHotelClosingStatus = tStatus
  }

  sendGetAvailabilityTime() {
    getConnection(getVariable('connection.info.id')).send('GET_AVAILABILITY_TIME')
  }

  setHotelClosedDisconnect(tOpenHour, tOpenMinute) {
    this.pHotelClosingStatus = 2
    this.pHotelClosedDisconnectStatus = 1
    this.getInterface().showHotelClosedDisconnectNotice(tOpenHour, tOpenMinute)
  }
}
