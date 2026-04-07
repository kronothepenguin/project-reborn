// hh_entry_init/13_Opening Hours Handler Class.ls → opening-hours-handler-class.js
// Opening hours handler - handles hotel availability messages from server

import { symbol } from '../../core/lingo-runtime.js'
import { getVariable } from '../../fuse_client/variable-api.js'
import { registerListener, unregisterListener, registerCommands, unregisterCommands } from '../../fuse_client/connection-api.js'
import { executeMessage } from '../../fuse_client/broker-manager-api.js'

export class OpeningHoursHandlerClass {
  constructor() {
    this.pComponent = null
  }

  construct() {
    return this.regMsgList(1)
  }

  deconstruct() {
    return this.regMsgList(0)
  }

  getID() {
    return 'hh_entry_init.opening_hours.handler'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  handleAvailabilityStatus(tMsg) {
    const tIsOpen = tMsg.connection.GetIntFrom()
    const tShutDown = tMsg.connection.GetIntFrom()
    let tClosingState = 0
    if (!tIsOpen) {
      if (tShutDown) {
        tClosingState = 1
      } else {
        tClosingState = 2
      }
    }
    this.getComponent().setHotelClosingStatus(tClosingState)
  }

  handleInfoHotelClosing(tMsg) {
    const tMinutesUntil = tMsg.connection.GetIntFrom()
    this.getInterface().showHotelClosingAlert(tMinutesUntil)
  }

  handleInfoHotelClosed(tMsg) {
    const tOpenHour = tMsg.connection.GetIntFrom()
    const tOpenMinute = tMsg.connection.GetIntFrom()
    const tDisconnect = tMsg.connection.GetIntFrom()
    if (tDisconnect) {
      this.getComponent().setHotelClosedDisconnect(tOpenHour, tOpenMinute)
    } else {
      this.getInterface().showHotelClosedNotice(tOpenHour, tOpenMinute)
    }
  }

  handleAvailabilityTime(tMsg) {
    const tIsOpen = tMsg.connection.GetIntFrom()
    const tTimeUntil = tMsg.connection.GetIntFrom()
    executeMessage(symbol('#hotelAvailabilityTime'), tIsOpen, tTimeUntil)
  }

  handleLoginFailedHotelClosed(tMsg) {
    const tOpenHour = tMsg.connection.GetIntFrom()
    const tOpenMinute = tMsg.connection.GetIntFrom()
    this.getComponent().setHotelClosedDisconnect(tOpenHour, tOpenMinute)
  }

  regMsgList(tBool) {
    const tMsgs = {}
    tMsgs['290'] = symbol('#handleAvailabilityStatus')
    tMsgs['291'] = symbol('#handleInfoHotelClosing')
    tMsgs['292'] = symbol('#handleInfoHotelClosed')
    tMsgs['293'] = symbol('#handleAvailabilityTime')
    tMsgs['294'] = symbol('#handleLoginFailedHotelClosed')
    const tCmds = {}
    tCmds['GET_AVAILABILITY_TIME'] = 212

    const tConn = getVariable('connection.info.id')
    if (tBool) {
      registerListener(tConn, this.getID(), tMsgs)
      registerCommands(tConn, this.getID(), tCmds)
    } else {
      unregisterListener(tConn, this.getID(), tMsgs)
      unregisterCommands(tConn, this.getID(), tCmds)
    }
    return true
  }
}
