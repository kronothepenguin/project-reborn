// hh_club/4_Club Handler Class.ls → club-handler-class.js
// Club handler - handles club-related server messages

import { symbol } from '../core/lingo-runtime.js'
import { getVariable } from '../fuse_client/variable-api.js'
import { registerListener, unregisterListener, registerCommands, unregisterCommands } from '../fuse_client/connection-api.js'

export class ClubHandlerClass {
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
    return 'hh_club.handler'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  handle_ok(tMsg) {
    tMsg.connection.send('SCR_GET_USER_INFO', [{ string: 'club_habbo' }])
  }

  handle_scr_sinfo(tMsg) {
    const tProdName = tMsg.connection.GetStrFrom()
    const tDaysLeft = tMsg.connection.GetIntFrom()
    const tElapsedPeriods = tMsg.connection.GetIntFrom()
    const tPrepaidPeriods = tMsg.connection.GetIntFrom()
    const tResponseFlag = tMsg.connection.GetIntFrom()
    const tList = {}
    tList[symbol('#productName')] = tProdName
    tList[symbol('#daysLeft')] = tDaysLeft
    tList[symbol('#ElapsedPeriods')] = tElapsedPeriods
    tList[symbol('#PrepaidPeriods')] = tPrepaidPeriods
    this.getComponent().setStatus(tList, tResponseFlag)
  }

  handle_gift(tMsg) {
    const tGiftCount = tMsg.connection.GetIntFrom()
    this.getComponent().showGifts(tGiftCount)
  }

  regMsgList(tBool) {
    const tMsgs = {}
    tMsgs['3'] = symbol('#handle_ok')
    tMsgs['7'] = symbol('#handle_scr_sinfo')
    tMsgs['280'] = symbol('#handle_gift')
    const tCmds = {}
    tCmds['SCR_GET_USER_INFO'] = 26
    tCmds['SCR_BUY'] = 190
    tCmds['SCR_GIFT_APPROVAL'] = 210

    const tConnID = getVariable('connection.info.id')
    if (tBool) {
      registerListener(tConnID, this.getID(), tMsgs)
      registerCommands(tConnID, this.getID(), tCmds)
    } else {
      unregisterListener(tConnID, this.getID(), tMsgs)
      unregisterCommands(tConnID, this.getID(), tCmds)
    }
    return true
  }
}
