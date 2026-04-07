// hh_recycler/4_Recycler Component Class.ls → recycler-component-class.js
// Recycler component - manages recycler state, furniture pools, rewards

import {
  symbol,
  voidP,
  integer,
  getVariable,
  variableExists,
  getText,
  getVariableValue,
  getObject,
  connectionExists,
  getConnection,
  executeMessage,
  getThread,
  threadExists,
  createTimeout,
  removeTimeout,
  timeoutExists,
} from '../core/lingo-runtime.js'
import { registerMessage, unregisterMessage } from '../fuse_client/broker-manager-api.js'

export class RecyclerComponentClass {
  constructor() {
    this.pServiceEnabled = 0
    this.pRecyclerState = null
    this.pGiveFurniPool = []
    this.pGetFurniPool = {}
    this.pRewardProps = {}
    this.pRewardItems = []
    this.pTimeProps = {}
    this.pQuarantineMinutes = 0
    this.pRecyclingMinutes = 0
    this.pIsVisible = false
    this.pRecyclingTimeoutMinutes = 0
    this.pOpeningRequestPending = false
  }

  construct() {
    this.pIsVisible = false
    this.pRecyclerState = null
    this.pGiveFurniPool = []
    this.pGetFurniPool = {}
    this.pRewardProps = {}
    this.pRewardItems = []
    this.pTimeProps = {}
    this.pServiceEnabled = 0
    this.pOpeningRequestPending = false
    this.pRecyclingTimeoutMinutes = 0
    registerMessage(symbol('#userloggedin'), this.getID(), symbol('#Initialize'))
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#userloggedin'), this.getID())
    if (timeoutExists(symbol('#recyclingFinished'))) {
      removeTimeout(symbol('#recyclingFinished'))
    }
    return true
  }

  getID() {
    return 'hh_recycler.component'
  }

  getInterface() {
    return this.pInterface
  }

  setInterface(tIface) {
    this.pInterface = tIface
  }

  Initialize() {
    const tConn = getConnection(getVariableValue('connection.info.id'))
    tConn.send('GET_FURNI_RECYCLER_CONFIGURATION')
    this.requestRecyclerState()
  }

  enableService(tEnabled) {
    this.pServiceEnabled = tEnabled ? 1 : 0
  }

  requestRecyclerState() {
    const tConn = getConnection(getVariableValue('connection.info.id'))
    tConn.send('GET_FURNI_RECYCLER_STATUS')
  }

  openRecycler() {
    this.pOpeningRequestPending = true
    this.requestRecyclerState()
  }

  openRecyclerWithState(tstate) {
    if (this.pOpeningRequestPending) {
      this.pIsVisible = true
      this.pOpeningRequestPending = false
    }
    this.setStateTo(tstate)
  }

  closeRecycler() {
    this.pIsVisible = false
    this.pOpeningRequestPending = false
    if (threadExists(symbol('#room'))) {
      const tRoomInterface = getThread(symbol('#room')).getInterface()
      const tContainer = tRoomInterface.getContainer()
      this.pGiveFurniPool = []
      this.getInterface().setHostWindowObject(null)
      this.clearObjectMover()
      tContainer.Refresh()
    }
  }

  startRecycling() {
    const tSafeTrader = getThread(symbol('#room')).getInterface().getSafeTrader()
    if (!voidP(tSafeTrader)) {
      if (tSafeTrader.getState() === symbol('#open')) {
        executeMessage(symbol('#alert'), [{ Msg: getText('recycler_trader_open_alert') }, { modal: 1 }])
        return false
      }
    }
    const tRoomItemIds = []
    const tWallItemIds = []
    const tTargetItem = this.getRewardItemForCurrentAmount()
    if (voidP(tTargetItem)) {
      return false
    }
    const tGiveAmount = tTargetItem[symbol('#furniValue')]
    if (tGiveAmount > this.pGiveFurniPool.length) {
      return false
    }
    for (let tIndexNo = 0; tIndexNo < tGiveAmount; tIndexNo++) {
      const tItem = this.pGiveFurniPool[tIndexNo]
      if (tItem[symbol('#props')][symbol('#type')] === 'active') {
        tRoomItemIds.push(integer(tItem[symbol('#props')][symbol('#id')]))
        continue
      }
      tWallItemIds.push(integer(tItem[symbol('#props')][symbol('#id')]))
    }
    const tParams = {}
    tParams[symbol('#integer_room_count')] = tRoomItemIds.length
    tParams[symbol('#integer_room_ids')] = tRoomItemIds
    tParams[symbol('#integer_wall_count')] = tWallItemIds.length
    tParams[symbol('#integer_wall_ids')] = tWallItemIds
    getConnection(getVariable('connection.info.id')).send('START_FURNI_RECYCLING', tParams)
  }

  acceptRecycling() {
    const tConn = getConnection(getVariable('connection.info.id'))
    if (this.pRecyclerState === 'progress') {
      tConn.send('APPROVE_RECYCLED_FURNI', [{ integer: 1 }])
    } else {
      tConn.send('CONFIRM_FURNI_RECYCLING', [{ integer: 1 }])
    }
  }

  cancelRecycling() {
    const tConn = getConnection(getVariable('connection.info.id'))
    if (this.pRecyclerState === 'progress' || this.pRecyclerState === 'ready' || this.pRecyclerState === 'timeout') {
      tConn.send('CONFIRM_FURNI_RECYCLING', [{ integer: 0 }])
    }
    this.clearObjectMover()
  }

  clearObjectMover() {
    const tRoomInterface = getThread(symbol('#room')).getInterface()
    const tObjMover = tRoomInterface.getObjectMover()
    if (!voidP(tObjMover)) {
      tObjMover.clear()
    }
    tRoomInterface.setProperty(symbol('#clickAction'), 'moveHuman')
  }

  isRecyclerOpenAndVisible() {
    return (this.pRecyclerState === 'open') && this.pIsVisible
  }

  getGiveFurniPool() {
    return this.pGiveFurniPool
  }

  getState() {
    return this.pRecyclerState
  }

  removeFurniFromGivePool(tGiveFurniIndex) {
    if (this.pGiveFurniPool.length >= tGiveFurniIndex) {
      this.pGiveFurniPool.splice(tGiveFurniIndex - 1, 1)
    }
  }

  setRewardProps(tObjectType, tFurniClass) {
    this.pRewardProps[symbol('#objectType')] = tObjectType
    this.pRewardProps[symbol('#class')] = tFurniClass
    const tNameLocalizationKey = tObjectType === symbol('#roomItem')
      ? 'furni_' + tFurniClass + '_name'
      : 'wallitem_' + tFurniClass + '_name'
    this.pRewardProps[symbol('#name')] = getText(tNameLocalizationKey)
  }

  getRewardProps(tProp) {
    switch (tProp) {
      case symbol('#name'):
        return this.pRewardProps[symbol('#name')]
      case symbol('#type'):
        return this.pRewardProps[symbol('#objectType')]
      case symbol('#class'):
        return this.pRewardProps[symbol('#class')]
      default:
        return null
    }
  }

  setRewardItems(tItemList) {
    this.pRewardItems = tItemList
  }

  getRewardItemForCurrentAmount() {
    const tAmount = this.pGiveFurniPool.length
    let tRewardItem = null
    let tFurniValue = 0
    for (let tNo = 0; tNo < this.pRewardItems.length; tNo++) {
      const tItem = this.pRewardItems[tNo]
      if (tItem[symbol('#furniValue')] === tAmount) {
        return tItem
      }
      if (tItem[symbol('#furniValue')] > tFurniValue && tItem[symbol('#furniValue')] < tAmount) {
        tFurniValue = tItem[symbol('#furniValue')]
        tRewardItem = tItem
      }
    }
    return tRewardItem
  }

  getNextRewardItemForCurrentAmount() {
    const tAmount = this.pGiveFurniPool.length
    let tNextItem = null
    let tDifferenceToNext = 1000000
    for (let tNo = 0; tNo < this.pRewardItems.length; tNo++) {
      const tItem = this.pRewardItems[tNo]
      if (tItem[symbol('#furniValue')] > tAmount) {
        const diff = tItem[symbol('#furniValue')] - tAmount
        if (diff < tDifferenceToNext) {
          tNextItem = tItem
          tDifferenceToNext = diff
        }
      }
    }
    return tNextItem
  }

  setRecyclingTimes(tQuarantineMinutes, tRecyclingMinutes) {
    this.pQuarantineMinutes = tQuarantineMinutes
    this.pRecyclingMinutes = tRecyclingMinutes
  }

  setRecyclingTimeout(tMinutesToTimeout) {
    this.pRecyclingTimeoutMinutes = tMinutesToTimeout
  }

  getQuarantineMinutes() {
    return this.pQuarantineMinutes
  }

  getRecyclingMinutes() {
    return this.pRecyclingMinutes
  }

  setTimeLeftProps(tMinutesLeft) {
    this.pTimeProps[symbol('#minutesLeft')] = tMinutesLeft
    this.pTimeProps[symbol('#timeStamp')] = Date.now()
  }

  getMinutesLeftToRecycle() {
    if (typeof this.pTimeProps !== 'object' || this.pTimeProps === null) {
      return null
    }
    const tMillisSinceStarted = Date.now() - this.pTimeProps[symbol('#timeStamp')]
    const tMinutesSinceStarted = tMillisSinceStarted / 1000 / 60
    let tMinutesLeft = this.pTimeProps[symbol('#minutesLeft')] - tMinutesSinceStarted
    if (tMinutesLeft < 0) {
      tMinutesLeft = 0
    }
    return tMinutesLeft
  }

  addFurnitureToGivePool(tClass, tID, tProps) {
    if (this.isFurniInRecycler(tID)) {
      return false
    }
    const tObj = {}
    tObj[symbol('#class')] = tClass
    tObj[symbol('#id')] = tID
    tObj[symbol('#props')] = tProps
    this.pGiveFurniPool.push(tObj)
  }

  isFurniInRecycler(tStripID) {
    if (this.pRecyclerState !== 'open' || this.pGiveFurniPool.length === 0) {
      return false
    }
    for (let tNo = 0; tNo < this.pGiveFurniPool.length; tNo++) {
      if (this.pGiveFurniPool[tNo][symbol('#props')][symbol('#stripId')] === tStripID) {
        return true
      }
    }
    return false
  }

  setStateTo(tstate) {
    this.pRecyclerState = tstate
    if (!threadExists(symbol('#room'))) {
      return false
    }
    const tRoomInterface = getThread(symbol('#room')).getInterface()
    const tObjMover = tRoomInterface.getObjectMover()
    switch (tstate) {
      case 'open':
        if (!this.pServiceEnabled) {
          return this.setStateTo('disabled')
        }
        this.pGiveFurniPool = []
        this.pGetFurniPool = {}
        tRoomInterface.cancelObjectMover()
        tRoomInterface.setProperty(symbol('#clickAction'), 'tradeItem')
        if (!voidP(tObjMover)) {
          tObjMover.moveTrade()
        }
        break
      case 'progress':
      case 'ready':
      case 'disabled':
      case 'timeout':
      default:
        this.clearObjectMover()
        break
    }
    executeMessage(symbol('#recyclerStateChange'))
    this.getInterface().setViewToState(tstate)
  }
}
