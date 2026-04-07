// hh_entry_base/4_Entry Component Class.ls → entry-component-class.js
// Entry component - manages entry state (hotel view, entry bar, etc.)

import { symbol, error } from '../../core/lingo-runtime.js'
import { registerMessage, unregisterMessage } from '../../fuse_client/broker-manager-api.js'

export class EntryComponentClass {
  constructor() {
    this.pState = null
  }

  construct() {
    registerMessage(symbol('#enterRoom'), this.getID(), symbol('#leaveEntry'))
    registerMessage(symbol('#leaveRoom'), this.getID(), symbol('#enterEntry'))
    registerMessage(symbol('#Initialize'), this.getID(), symbol('#updateState'))
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#enterRoom'), this.getID())
    unregisterMessage(symbol('#leaveRoom'), this.getID())
    unregisterMessage(symbol('#Initialize'), this.getID())
    this.updateState('reset')
    return true
  }

  getID() {
    return 'hh_entry_base.component'
  }

  enterEntry() {
    this.updateState(symbol('#hotelView'))
    this.updateState(symbol('#entryBar'))
    return true
  }

  leaveEntry() {
    return this.updateState('reset')
  }

  getState() {
    return this.pState
  }

  updateState(tstate) {
    switch (tstate) {
      case 'reset':
        this.pState = tstate
        return this.getInterface().hideAll()
      case symbol('#hotelView'):
      case 'initialize':
        this.pState = tstate
        return this.getInterface().showHotel()
      case symbol('#entryBar'):
        this.pState = tstate
        return this.getInterface().showEntryBar()
      default:
        return error(this, 'Unknown state: ' + tstate, symbol('#updateState'), symbol('#minor'))
    }
  }

  getInterface() {
    // Reference to the entry interface - resolved at runtime
    return null
  }
}
