// hh_kiosk_room/5_RoomKiosk Handler Class.ls → roomkiosk-handler-class.js
// RoomKiosk handler - handles flat creation and web shortcut messages

import { symbol, integer, error } from '../core/lingo-runtime.js'
import { getVariable } from '../fuse_client/variable-api.js'
import { registerListener, unregisterListener, registerCommands, unregisterCommands } from '../fuse_client/connection-api.js'
import { executeMessage } from '../fuse_client/broker-manager-api.js'
import { getText } from '../fuse_client/text-api.js'

export class RoomKioskHandlerClass {
  constructor() {
    this.pComponent = null
  }

  construct() {
    const tMessages = {}
    tMessages['59'] = symbol('#handle_flatcreated')
    tMessages['33'] = symbol('#handle_error')
    tMessages['353'] = symbol('#handle_webShortcut')
    registerListener(getVariable('connection.info.id'), this.getID(), tMessages)
    registerCommands(getVariable('connection.info.id'), this.getID(), { CREATEFLAT: 29 })
    return true
  }

  deconstruct() {
    const tMessages = {}
    tMessages['59'] = symbol('#handle_flatcreated')
    tMessages['33'] = symbol('#handle_error')
    tMessages['353'] = symbol('#handle_webShortcut')
    unregisterListener(getVariable('connection.info.id'), this.getID(), tMessages)
    unregisterCommands(getVariable('connection.info.id'), this.getID(), { CREATEFLAT: 29 })
    return true
  }

  getID() {
    return 'hh_kiosk_room.handler'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  getInterface() {
    return this.pInterface
  }

  setInterface(tIface) {
    this.pInterface = tIface
  }

  handle_flatcreated(tMsg) {
    const lines = tMsg.content.split('\n')
    const tID = lines[0].split(' ')[0]
    const tName = lines[1]
    this.getInterface().flatcreated(tName, tID)
  }

  handle_error(tMsg) {
    const tErr = tMsg.content
    switch (tErr) {
      case 'Error creating a private room':
        executeMessage(symbol('#alert'), [{ Msg: getText('roomatic_create_error') }])
        return this.getInterface().showHideRoomKiosk()
    }
    return true
  }

  handle_webShortcut(tMsg) {
    const tConn = tMsg.connection
    if (!tConn) {
      return error(this, 'Connection not found.', symbol('#handle_webShortcut'), symbol('#major'))
    }
    const tRequestId = tConn.GetIntFrom()
    if (tRequestId === 1) {
      executeMessage(symbol('#open_roomkiosk'))
      return true
    }
    return false
  }
}
