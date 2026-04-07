// hh_kiosk_room/39_Roommatic Class.ls → roommatic-class.js
// Roommatic - room kiosk furniture item that triggers the room kiosk UI

import { symbol, error } from '../core/lingo-runtime.js'
import { executeMessage } from '../fuse_client/broker-manager-api.js'
import { getThread, threadExists } from '../fuse_client/core-thread-api.js'
import { getObject } from '../fuse_client/object-api.js'

export class RoommaticClass {
  select() {
    if (!threadExists(symbol('#room'))) {
      return error(this, 'Room thread not found!!!', symbol('#select'), symbol('#major'))
    }
    if (!threadExists(symbol('#roomkiosk'))) {
      // initThread - placeholder for dynamic cast loading
      return error(this, 'Room kiosk cast not found!!!', symbol('#select'), symbol('#major'))
    }
    const tUserObj = getThread(symbol('#room')).getComponent().getOwnUser()
    if (!tUserObj) {
      return error(this, 'User object not found: ' + getObject(symbol('#session')).GET('user_name'), symbol('#select'), symbol('#major'))
    }
    switch (this.pDirection[0]) {
      case 4:
        if (this.pLocX === tUserObj.pLocX && (this.pLocY - tUserObj.pLocY) === -1) {
          this.useRoomKiosk()
        } else {
          getThread(symbol('#room')).getComponent().getRoomConnection().send('MOVE', [{ short: this.pLocX }, { short: this.pLocY + 1 }])
        }
        break
      case 0:
        if (this.pLocX === tUserObj.pLocX && (this.pLocY - tUserObj.pLocY) === 1) {
          this.useRoomKiosk()
        } else {
          getThread(symbol('#room')).getComponent().getRoomConnection().send('MOVE', [{ short: this.pLocX }, { short: this.pLocY - 1 }])
        }
        break
      case 2:
        if (this.pLocY === tUserObj.pLocY && (this.pLocX - tUserObj.pLocX) === -1) {
          this.useRoomKiosk()
        } else {
          getThread(symbol('#room')).getComponent().getRoomConnection().send('MOVE', [{ short: this.pLocX + 1 }, { short: this.pLocY }])
        }
        break
      case 6:
        if (this.pLocY === tUserObj.pLocY && (this.pLocX - tUserObj.pLocX) === 1) {
          this.useRoomKiosk()
        } else {
          getThread(symbol('#room')).getComponent().getRoomConnection().send('MOVE', [{ short: this.pLocX - 1 }, { short: this.pLocY }])
        }
        break
    }
    return true
  }

  useRoomKiosk() {
    getThread(symbol('#room')).getComponent().getRoomConnection().send('LOOKTO', this.pLocX + ' ' + this.pLocY)
    executeMessage(symbol('#open_roomkiosk'))
  }
}
