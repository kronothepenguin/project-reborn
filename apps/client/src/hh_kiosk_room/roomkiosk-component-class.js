// hh_kiosk_room/4_RoomKiosk Component Class.ls → roomkiosk-component-class.js
// RoomKiosk component - manages room kiosk state and sends room data

import { symbol, integer, error } from '../core/lingo-runtime.js'
import { registerMessage, unregisterMessage, executeMessage } from '../fuse_client/broker-manager-api.js'
import { getVariable, variableExists, getIntVariable } from '../fuse_client/variable-api.js'
import { connectionExists, getConnection } from '../fuse_client/connection-api.js'
import { createTimeout, timeoutExists } from '../fuse_client/timeout-api.js'

export class RoomKioskComponentClass {
  constructor() {
    this.pState = null
  }

  construct() {
    registerMessage(symbol('#userlogin'), this.getID(), symbol('#checkWebShortcuts'))
    return this.updateState('start')
  }

  deconstruct() {
    unregisterMessage(symbol('#userlogin'), this.getID())
    return this.updateState('reset')
  }

  getID() {
    return 'hh_kiosk_room.component'
  }

  getInterface() {
    return this.pInterface
  }

  setInterface(tIface) {
    this.pInterface = tIface
  }

  showHideRoomKiosk() {
    return this.getInterface().showHideRoomKiosk()
  }

  sendNewRoomData(tFlatData) {
    if (connectionExists(getVariable('connection.info.id'))) {
      return getConnection(getVariable('connection.info.id')).send('CREATEFLAT', tFlatData)
    }
    return false
  }

  sendSetFlatInfo(tFlatMsg) {
    if (connectionExists(getVariable('connection.info.id'))) {
      getConnection(getVariable('connection.info.id')).send('SETFLATINFO', tFlatMsg)
    }
    return false
  }

  sendFlatCategory(tNodeId, tCategoryId) {
    if (symbol('#void') === null || tNodeId === null || tNodeId === undefined) {
      return error(this, 'Node ID expected!', symbol('#sendFlatCategory'), symbol('#major'))
    }
    if (tCategoryId === null || tCategoryId === undefined) {
      return error(this, 'Category ID expected!', symbol('#sendFlatCategory'), symbol('#major'))
    }
    if (connectionExists(getVariable('connection.info.id'))) {
      return getConnection(getVariable('connection.info.id')).send('SETFLATCAT', [{ integer: integer(tNodeId) }, { integer: integer(tCategoryId) }])
    }
    return false
  }

  updateState(tstate, tProps) {
    switch (tstate) {
      case 'reset':
        this.pState = tstate
        return unregisterMessage(symbol('#open_roomkiosk'), this.getID())
      case 'start':
        this.pState = tstate
        return registerMessage(symbol('#open_roomkiosk'), this.getID(), symbol('#showHideRoomKiosk'))
      default:
        return error(this, 'Unknown state: ' + tstate, symbol('#updateState'), symbol('#minor'))
    }
  }

  getState() {
    return this.pState
  }

  checkWebShortcuts(tChecked) {
    if (tChecked === 1) {
      executeMessage(symbol('#open_roomkiosk'))
      return true
    }
    if (variableExists('shortcut.id')) {
      const tShortcutID = getIntVariable('shortcut.id')
      if (tShortcutID === 1) {
        const tTimeoutID = symbol('#roommatic_opening_timeout')
        if (!timeoutExists(tTimeoutID)) {
          createTimeout(tTimeoutID, 2500, symbol('#checkWebShortcuts'), this.getID(), 1, 1)
        }
      }
    }
    return true
  }
}
