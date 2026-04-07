// hh_club/3_Club Component Class.ls → club-component-class.js
// Club component - manages club status, gifts, subscriptions

import {
  symbol,
  voidP,
  error,
} from '../core/lingo-runtime.js'
import { getObject } from '../fuse_client/object-api.js'
import { getVariable, variableExists } from '../fuse_client/variable-api.js'
import { connectionExists, getConnection } from '../fuse_client/connection-api.js'
import { createTimeout, timeoutExists, removeTimeout } from '../fuse_client/timeout-api.js'
import { executeMessage } from '../fuse_client/broker-manager-api.js'

export class ClubComponentClass {
  constructor() {
    this.pClubStatus = {}
    this.pGiftCount = 0
    this.pGiftTimeOut = 'timeout_clubgift'
    this.pAcceptedGifts = 0
  }

  construct() {
    this.pClubStatus = {}
    this.pGiftCount = 0
    this.pAcceptedGifts = 0
    return true
  }

  deconstruct() {
    this.pClubStatus = {}
    if (timeoutExists(this.pGiftTimeOut)) {
      removeTimeout(this.pGiftTimeOut)
    }
    return true
  }

  getID() {
    return 'hh_club.component'
  }

  getInterface() {
    return this.pInterface
  }

  setInterface(tIface) {
    this.pInterface = tIface
  }

  showGifts(tCount) {
    this.pGiftCount = tCount
    this.pAcceptedGifts = 0
    if (this.pGiftCount > 0) {
      this.getInterface().show_giftinfo()
    }
    return true
  }

  acceptGift() {
    if (this.pGiftCount > this.pAcceptedGifts) {
      this.pAcceptedGifts = this.pAcceptedGifts + 1
      if (this.pGiftCount > this.pAcceptedGifts) {
        if (timeoutExists(this.pGiftTimeOut)) {
          removeTimeout(this.pGiftTimeOut)
        }
        createTimeout(this.pGiftTimeOut, 1000, symbol('#showNextGift'), this.getID(), null, 1)
      } else {
        return this.sendAcceptGift()
      }
    } else {
      return false
    }
  }

  rejectGift() {
    if (this.pGiftCount > 0) {
      this.pGiftCount = 0
      if (this.pAcceptedGifts > 0) {
        return this.sendAcceptGift()
      } else {
        return true
      }
    } else {
      return false
    }
  }

  sendAcceptGift() {
    const tAcceptedGifts = this.pAcceptedGifts
    this.resetGiftList()
    const tConnection = getConnection(getVariable('connection.info.id'))
    if (tConnection === 0 || !tConnection) {
      return error(this, "Couldn't find connection: " + getVariable('connection.info.id'), symbol('#sendAcceptGift'), symbol('#major'))
    }
    return tConnection.send('SCR_GIFT_APPROVAL', [{ integer: tAcceptedGifts }])
  }

  resetGiftList() {
    this.pGiftCount = 0
    this.pAcceptedGifts = 0
  }

  setStatus(tStatus, tResponseFlag) {
    const tOldClubStatus = this.pClubStatus
    this.pClubStatus = tStatus
    getObject(symbol('#session')).set('club_status', tStatus)
    this.getInterface().updateClubStatus(tStatus, tResponseFlag, tOldClubStatus)
    executeMessage(symbol('#updateClubStatus'), tStatus)
    return true
  }

  getStatus() {
    if (voidP(this.pClubStatus)) {
      return 0
    } else {
      return this.pClubStatus
    }
  }

  subscribe(tChosenLength) {
    if (connectionExists(getVariable('connection.info.id'))) {
      const tList = [{ string: 'club_habbo' }, { integer: tChosenLength }]
      return getConnection(getVariable('connection.info.id')).send('SCR_BUY', tList)
    } else {
      return error(this, "Couldn't find connection: " + getVariable('connection.info.id'), symbol('#subscribe'), symbol('#major'))
    }
  }

  askforBadgeUpdate() {
    if (connectionExists(getVariable('connection.info.id'))) {
      return getConnection(getVariable('connection.info.id')).send('GETAVAILABLEBADGES')
    } else {
      return error(this, "Couldn't find connection: " + getVariable('connection.info.id'), symbol('#askforBadgeUpdate'), symbol('#major'))
    }
  }

  showNextGift() {
    this.getInterface().show_giftinfo()
  }
}
