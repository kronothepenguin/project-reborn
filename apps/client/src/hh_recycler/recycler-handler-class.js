// hh_recycler/5_Recycler Handler Class.ls → recycler-handler-class.js
// Recycler handler - handles recycler server messages

import { symbol, integer } from '../core/lingo-runtime.js'
import { getVariable } from '../fuse_client/variable-api.js'
import { registerListener, unregisterListener, registerCommands, unregisterCommands } from '../fuse_client/connection-api.js'
import { getText } from '../fuse_client/text-api.js'
import { createTimeout } from '../fuse_client/timeout-api.js'

export class RecyclerHandlerClass {
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
    return 'hh_recycler.handler'
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

  handle_recycler_configuration(tMsg) {
    const tConn = tMsg.connection
    if (!tConn) return false
    const tServiceEnabled = tConn.GetIntFrom()
    const tQuarantineMinutes = tConn.GetIntFrom()
    const tRecyclingMinutes = tConn.GetIntFrom()
    const tMinutesToTimeout = tConn.GetIntFrom()
    const tNumOfRewardItems = tConn.GetIntFrom()
    const tRewardItems = []
    for (let tNo = 0; tNo < tNumOfRewardItems; tNo++) {
      const tItem = {}
      tItem[symbol('#furniValue')] = tConn.GetIntFrom()
      tItem[symbol('#type')] = tConn.GetIntFrom()
      switch (tItem[symbol('#type')]) {
        case 0:
          tItem[symbol('#class')] = tConn.GetStrFrom()
          tItem[symbol('#defaultDirection')] = tConn.GetIntFrom()
          tItem[symbol('#xDimension')] = tConn.GetIntFrom()
          tItem[symbol('#yDimension')] = tConn.GetIntFrom()
          tItem[symbol('#partColors')] = tConn.GetStrFrom()
          tItem[symbol('#name')] = getText('furni_' + tItem[symbol('#class')] + '_name')
          break
        case 1:
          tItem[symbol('#class')] = tConn.GetStrFrom()
          tItem[symbol('#name')] = getText('wallitem_' + tItem[symbol('#class')] + '_name')
          break
        case 2:
          tItem[symbol('#name')] = tConn.GetStrFrom()
          break
      }
      tRewardItems.push(tItem)
    }
    const tComponent = this.getComponent()
    tComponent.enableService(tServiceEnabled)
    tComponent.setRewardItems(tRewardItems)
    tComponent.setRecyclingTimes(tQuarantineMinutes, tRecyclingMinutes)
    tComponent.setRecyclingTimeout(tMinutesToTimeout)
  }

  handle_recycler_status(tMsg) {
    const tConn = tMsg.connection
    if (!tConn) return false
    const tStatus = tConn.GetIntFrom()
    let tStateStr = ''
    switch (tStatus) {
      case 0:
        tStateStr = 'open'
        break
      case 1: {
        tStateStr = 'progress'
        const tRewardType = tConn.GetIntFrom()
        const tFurniClass = tConn.GetStrFrom()
        const tMinutesLeft = tConn.GetIntFrom()
        const tRewardTypeEnum = tRewardType === 0 ? symbol('#roomItem') : symbol('#wallItem')
        this.getComponent().setRewardProps(tRewardTypeEnum, tFurniClass)
        this.getComponent().setTimeLeftProps(tMinutesLeft)
        const tTimeoutTime = (tMinutesLeft + 1) * 60 * 1000
        createTimeout('recycler_status_request', tTimeoutTime, symbol('#statusRequestTimeout'), this.getID(), null, 1)
        break
      }
      case 2: {
        tStateStr = 'ready'
        const tRewardType = tConn.GetIntFrom()
        const tFurniClass = tConn.GetStrFrom()
        const tRewardTypeEnum = tRewardType === 0 ? symbol('#roomItem') : symbol('#wallItem')
        this.getComponent().setRewardProps(tRewardTypeEnum, tFurniClass)
        break
      }
      case 3:
        tStateStr = 'timeout'
        break
    }
    this.getComponent().openRecyclerWithState(tStateStr)
  }

  handle_approve_recycling_result(tMsg) {
    const tConn = tMsg.connection
    if (!tConn) return false
    const tResult = tConn.GetIntFrom()
    if (tResult) {
      this.getComponent().requestRecyclerState()
    }
  }

  handle_start_recycling_result(tMsg) {
    const tConn = tMsg.connection
    if (!tConn) return false
    const tResult = tConn.GetIntFrom()
    if (tResult) {
      this.getComponent().requestRecyclerState()
    }
  }

  handle_confirm_recycling_result(tMsg) {
    const tConn = tMsg.connection
    if (!tConn) return false
    const tResult = tConn.GetIntFrom()
    if (tResult) {
      this.getComponent().setStateTo('open')
    }
  }

  statusRequestTimeout() {
    this.getComponent().requestRecyclerState()
  }

  regMsgList(tBool) {
    const tMsgs = {}
    tMsgs['303'] = symbol('#handle_recycler_configuration')
    tMsgs['304'] = symbol('#handle_recycler_status')
    tMsgs['305'] = symbol('#handle_approve_recycling_result')
    tMsgs['306'] = symbol('#handle_start_recycling_result')
    tMsgs['307'] = symbol('#handle_confirm_recycling_result')
    const tCmds = {}
    tCmds['GET_FURNI_RECYCLER_CONFIGURATION'] = 222
    tCmds['GET_FURNI_RECYCLER_STATUS'] = 223
    tCmds['APPROVE_RECYCLED_FURNI'] = 224
    tCmds['START_FURNI_RECYCLING'] = 225
    tCmds['CONFIRM_FURNI_RECYCLING'] = 226

    const tConnID = getVariable('connection.room.id')
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
