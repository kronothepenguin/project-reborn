// hh_recycler/3_Recycler Interface Class.ls → recycler-interface-class.js
// Recycler interface - manages recycler UI states, slots, progress, buttons

import {
  symbol,
  voidP,
  integer,
  min,
  float as lingoFloat,
  replaceChunks,
  member,
  memberExists,
  getmemnum,
  error,
  RETURN,
  getObject,
  getThread,
  createTimeout,
  removeTimeout,
  timeoutExists,
  executeMessage,
  openNetPage,
  getText,
  getClassVariable,
  createObject,
  removeObject,
} from '../core/lingo-runtime.js'
import { createWindow, getWindow, windowExists, removeWindow } from '../fuse_client/window-api.js'
import { getVariableValue } from '../fuse_client/variable-api.js'
import { registerMessage, unregisterMessage } from '../fuse_client/broker-manager-api.js'

export class RecyclerInterfaceClass {
  constructor() {
    this.pWindowObj = null
    this.pCurrentPageIndex = 1
    this.pLastPageIndex = 1
    this.pFurnisPerPage = 12
    this.pAcceptBtnActive = false
    this.pProgressAnimation = null
    this.pStatusIcon = null
    this.pTimeLeftTimeoutID = 'timeLeftTimeout'
    this.pHeaderImageNum = 0
  }

  construct() {
    this.pWindowObj = null
    this.pCurrentPageIndex = 1
    this.pLastPageIndex = 1
    this.pFurnisPerPage = 12
    this.pAcceptBtnActive = false
    this.pProgressAnimation = createObject('rec_prg_anim', getClassVariable('recycler.progress.animation.class'))
    this.pStatusIcon = createObject('rec_status_icon', getClassVariable('recycler.status.icon.class'))
    registerMessage(symbol('#gamesystem_constructed'), this.getID(), symbol('#hideRecyclerStatusButton'))
    registerMessage(symbol('#gamesystem_deconstructed'), this.getID(), symbol('#showRecyclerStatusButton'))
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#gamesystem_constructed'), this.getID())
    unregisterMessage(symbol('#gamesystem_deconstructed'), this.getID())
    if (this.pProgressAnimation) removeObject(this.pProgressAnimation.getID())
    if (this.pStatusIcon) removeObject(this.pStatusIcon.getID())
    return true
  }

  getID() {
    return 'hh_recycler.interface'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  setHostWindowObject(tHostWindowObj) {
    this.pWindowObj = tHostWindowObj
  }

  setHeaderImage(tMemberNo) {
    this.pHeaderImageNum = tMemberNo
  }

  setViewToState(tstate) {
    switch (tstate) {
      case 'open':
      case 'disabled':
        this.hideRecyclerStatusButton()
        break
      case 'progress':
      case 'ready':
      case 'timeout':
        this.showRecyclerStatusButton()
        break
    }
    if (voidP(this.pWindowObj)) return false
    let tHeaderText = ''
    switch (tstate) {
      case 'open':
        this.pCurrentPageIndex = 1
        this.pWindowObj.unmerge()
        this.pWindowObj.merge('ctlg_recycler_open.window')
        tHeaderText = getText('recycler_info_open')
        const tMinutesToRecycle = this.getComponent().getRecyclingMinutes()
        tHeaderText = this.replaceTimeKeysText(tHeaderText, tMinutesToRecycle, 'total_')
        const tQuarantineMinutes = this.getComponent().getQuarantineMinutes()
        tHeaderText = this.replaceTimeKeysText(tHeaderText, tQuarantineMinutes, 'quarantine_')
        if (timeoutExists(this.pTimeLeftTimeoutID)) {
          removeTimeout(this.pTimeLeftTimeoutID)
        }
        this.pProgressAnimation.stopAnimation()
        break
      case 'progress':
        this.pWindowObj.unmerge()
        this.pWindowObj.merge('ctlg_recycler_progress.window')
        tHeaderText = getText('recycler_info_progress')
        const tRecyclingMinutes = this.getComponent().getRecyclingMinutes()
        tHeaderText = this.replaceTimeKeysText(tHeaderText, tRecyclingMinutes)
        this.pProgressAnimation.startAnimation(this.pWindowObj)
        this.updateInProgressText()
        if (!timeoutExists(this.pTimeLeftTimeoutID)) {
          createTimeout(this.pTimeLeftTimeoutID, 60000, symbol('#updateInProgressText'), this.getID(), null, 0)
        }
        break
      case 'ready':
        this.pWindowObj.unmerge()
        this.pWindowObj.merge('ctlg_recycler_ready.window')
        tHeaderText = getText('recycler_info_ready')
        if (this.pWindowObj.elementExists('rec_ready_outcome')) {
          const tOutcomeElement = this.pWindowObj.getElement('rec_ready_outcome')
          let tOutcomeText = getText('recycler_ready_outcome')
          const tRewardName = this.getComponent().getRewardProps(symbol('#name'))
          tOutcomeText = replaceChunks(tOutcomeText, '%outcome%', tRewardName)
          tOutcomeElement.setText(tOutcomeText)
        }
        if (timeoutExists(this.pTimeLeftTimeoutID)) {
          removeTimeout(this.pTimeLeftTimeoutID)
        }
        this.pProgressAnimation.stopAnimation()
        break
      case 'timeout':
        this.pWindowObj.unmerge()
        this.pWindowObj.merge('ctlg_recycler_progress.window')
        tHeaderText = getText('recycler_info_timeout')
        break
      case 'disabled':
        this.pWindowObj.unmerge()
        this.pWindowObj.merge('ctlg_recycler_progress.window')
        tHeaderText = getText('recycler_info_closed')
        break
      default:
        return false
    }
    this.updateDynamicContent()
    const tHeaderImgElement = this.pWindowObj.getElement('ctlg_header_img')
    if (!voidP(tHeaderImgElement)) {
      if (this.pHeaderImageNum !== 0) {
        tHeaderImgElement.setProperty(symbol('#image'), member(this.pHeaderImageNum).image)
      }
    }
    const tHeaderTextElement = this.pWindowObj.getElement('ctlg_header_text')
    if (!voidP(tHeaderTextElement)) {
      tHeaderTextElement.setText(tHeaderText)
    }
  }

  eventProc(tEvent, tSprID, tProp) {
    if (tEvent === symbol('#mouseEnter')) {
      const tObjMover = getThread(symbol('#room')).getInterface().getObjectMover()
      if (!voidP(tObjMover)) {
        tObjMover.moveTrade()
      }
    } else if (tEvent === symbol('#mouseUp')) {
      if (tSprID.includes('rec_drop_slot_')) {
        const tObjMover = getThread(symbol('#room')).getInterface().getObjectMover()
        if (!voidP(tObjMover)) {
          const tClientObj = tObjMover.getProperty(symbol('#clientObj'))
          if (!voidP(tClientObj)) {
            if (tObjMover.getProperty(symbol('#stripId')) === '') {
              return false
            }
            const tClientProps = tObjMover.getProperty(symbol('#clientProps'))
            const tClass = tClientProps[symbol('#class')]
            const tClientID = tObjMover.getProperty(symbol('#clientID'))
            tClientProps[symbol('#type')] = tObjMover.pObjType
            if (!integer(tClientProps[symbol('#isRecyclable')])) {
              executeMessage(symbol('#alert'), [{ Msg: getText('recycler_furni_not_recyclable') }])
              this.getComponent().clearObjectMover()
              return false
            }
            this.getComponent().addFurnitureToGivePool(tClass, tClientID, tClientProps)
            this.getComponent().clearObjectMover()
            this.updateLastPageIndex()
            this.pCurrentPageIndex = this.pLastPageIndex
            this.updateDynamicContent()
            return true
          } else {
            const tSlotNo = tSprID.split('_')[3]
            this.removeItemFromSlot(tSlotNo)
          }
        }
      }
      switch (tSprID) {
        case 'rec_next':
          this.pCurrentPageIndex = this.pCurrentPageIndex + 1
          this.updateDynamicContent()
          break
        case 'rec_prev':
          this.pCurrentPageIndex = this.pCurrentPageIndex - 1
          this.updateDynamicContent()
          break
        case 'rec_accept_text':
        case 'rec_current_btn':
          if (this.getComponent().getState() === 'open' && this.pAcceptBtnActive) {
            this.getComponent().startRecycling()
          } else if (this.getComponent().getState() === 'ready') {
            this.getComponent().acceptRecycling()
          }
          break
        case 'rec_cancel_text':
        case 'rec_cancel_btn':
          this.getComponent().cancelRecycling()
          break
        case 'rec_moreinfo_link':
          executeMessage(symbol('#externalLinkClick'), null)
          openNetPage(getText('recycler_info_link_url'))
          break
      }
    }
    return false
  }

  updateDynamicContent() {
    const tstate = this.getComponent().getState()
    switch (tstate) {
      case 'open':
        this.updateFurniSlots()
        this.updateNextAndPrevButtons()
        this.updatePageIndexes()
        this.updateAcceptButtonOpenState()
        this.updateProgressBar()
        break
      case 'progress':
        this.updateCancelButton()
        break
      case 'ready':
        this.updateAcceptButton()
        this.updateCancelButton()
        break
      case 'timeout':
        this.updateCancelButton()
        break
      case 'disabled':
        this.hideCancelButton()
        break
    }
  }

  updateInProgressText() {
    if (this.getComponent().getState() !== 'progress' || voidP(this.pWindowObj)) {
      return false
    }
    let tTimeLeftText = getText('recycler_progress_timeleft')
    const tMinutesLeft = this.getComponent().getMinutesLeftToRecycle() + 1
    tTimeLeftText = this.replaceTimeKeysText(tTimeLeftText, tMinutesLeft)
    if (this.pWindowObj.elementExists('ctlg_time_left')) {
      this.pWindowObj.getElement('ctlg_time_left').setText(tTimeLeftText)
    }
  }

  replaceTimeKeysText(tText, tMinutes, tKeyPrefix) {
    if (!voidP(tMinutes)) {
      const tHours = Math.floor(tMinutes / 60)
      const tRemainingMinutes = tMinutes - (tHours * 60)
      tText = replaceChunks(tText, '%' + tKeyPrefix + 'hours%', tHours)
      tText = replaceChunks(tText, '%' + tKeyPrefix + 'minutes%', tRemainingMinutes)
    }
    return tText
  }

  showRecyclerStatusButton() {
    const tstate = this.getComponent().getState()
    if (tstate === 'ready' || tstate === 'timeout') {
      this.pStatusIcon.showRecyclerButton('highlight')
    } else if (tstate === 'progress') {
      this.pStatusIcon.showRecyclerButton('normal')
    }
  }

  hideRecyclerStatusButton() {
    this.pStatusIcon.hideRecyclerButton()
  }

  updateLastPageIndex() {
    const tGivenAmount = this.getComponent().getGiveFurniPool().length
    if (tGivenAmount < this.pFurnisPerPage) {
      this.pLastPageIndex = 1
    } else {
      this.pLastPageIndex = Math.floor(tGivenAmount / this.pFurnisPerPage) + 1
    }
  }

  removeItemFromSlot(tSlotNo) {
    tSlotNo = integer(tSlotNo)
    const tCurrentPageFirstIndex = ((this.pCurrentPageIndex - 1) * this.pFurnisPerPage) + 1
    const tRemovedIndex = tCurrentPageFirstIndex + tSlotNo - 1
    this.getComponent().removeFurniFromGivePool(tRemovedIndex)
    this.updateLastPageIndex()
    if (this.pCurrentPageIndex > this.pLastPageIndex) {
      this.pCurrentPageIndex = this.pLastPageIndex
    }
    this.updateDynamicContent()
  }

  updateFurniSlots() {
    const tGiveFurniPool = this.getComponent().getGiveFurniPool()
    const tFurniAmount = tGiveFurniPool.length
    const tCurrentPageFirstIndex = ((this.pCurrentPageIndex - 1) * this.pFurnisPerPage) + 1
    const tSlotWidth = this.pWindowObj.getElement('rec_drop_slot_1').getProperty(symbol('#width'))
    const tSlotHeight = this.pWindowObj.getElement('rec_drop_slot_1').getProperty(symbol('#height'))

    for (let tTemp = 1; tTemp <= this.pFurnisPerPage; tTemp++) {
      const tElement = this.pWindowObj.getElement('rec_drop_slot_' + tTemp)
      tElement.feedImage(null) // empty image
    }
    const tLastFurniIndexOnPage = Math.min([tFurniAmount, tCurrentPageFirstIndex + this.pFurnisPerPage - 1])
    let tSlotNo = 1
    for (let tFurniIndex = tCurrentPageFirstIndex; tFurniIndex <= tLastFurniIndexOnPage; tFurniIndex++) {
      const tFurniItem = tGiveFurniPool[tFurniIndex - 1]
      const tSlotElement = this.pWindowObj.getElement('rec_drop_slot_' + tSlotNo)
      const tProps = tFurniItem[symbol('#props')]
      const tClass = tFurniItem[symbol('#class')]
      const tMemStr = this.detectMemberName(tClass, tProps)
      const tFurniImage = getObject('Preview_renderer').renderPreviewImage(tMemStr, null, tProps[symbol('#colors')], tProps[symbol('#class')])
      const tWidthMargin = (tSlotWidth - tFurniImage.width) / 2
      const tHeightMargin = (tSlotHeight - tFurniImage.height) / 2
      tSlotElement.feedImage(tFurniImage)
      tSlotElement.setProperty(symbol('#blend'), 100)
      tSlotNo = tSlotNo + 1
    }
  }

  updateNextAndPrevButtons() {
    if (!this.pWindowObj.elementExists('rec_next') || !this.pWindowObj.elementExists('rec_prev')) {
      return false
    }
    const tNextElement = this.pWindowObj.getElement('rec_next')
    const tPrevElement = this.pWindowObj.getElement('rec_prev')
    tPrevElement.setProperty(symbol('#visible'), this.pCurrentPageIndex !== 1)
    tNextElement.setProperty(symbol('#visible'), this.pCurrentPageIndex !== this.pLastPageIndex)
  }

  updatePageIndexes() {
    if (!this.pWindowObj.elementExists('rec_page')) {
      return false
    }
    this.pWindowObj.getElement('rec_page').setText(this.pCurrentPageIndex + '/' + this.pLastPageIndex)
  }

  updateAcceptButtonOpenState() {
    const tComponent = this.getComponent()
    const tCurrentAmount = tComponent.getGiveFurniPool().length
    const tCurrentSelectableFurni = tComponent.getRewardItemForCurrentAmount()
    const tCurrentFurniElement = this.pWindowObj.getElement('rec_current_name')
    const tCurrentBarElement = this.pWindowObj.getElement('rec_current_btn')
    const tCurrentBarTextElement = this.pWindowObj.getElement('rec_accept_text')
    const tBarWidth = tCurrentBarElement.getProperty(symbol('#width'))
    let tActive = false
    if (!voidP(tCurrentSelectableFurni)) {
      if (tCurrentSelectableFurni[symbol('#furniValue')] <= tCurrentAmount) {
        tActive = true
        tCurrentFurniElement.setProperty(symbol('#blend'), 100)
        tCurrentBarElement.setProperty(symbol('#image'), this.getCustomButtonImage(tBarWidth, 'green'))
        tCurrentBarElement.setProperty(symbol('#cursor'), 'cursor.finger')
        tCurrentBarElement.setProperty(symbol('#blend'), 100)
        tCurrentBarTextElement.setProperty(symbol('#blend'), 100)
        tCurrentFurniElement.setText(tCurrentSelectableFurni[symbol('#name')])
        tCurrentBarTextElement.setProperty(symbol('#cursor'), 'cursor.finger')
        this.pAcceptBtnActive = true
      }
    }
    if (!tActive) {
      tCurrentFurniElement.setProperty(symbol('#blend'), 0)
      tCurrentBarElement.setProperty(symbol('#image'), this.getCustomButtonImage(tBarWidth, 'gray'))
      tCurrentBarElement.setProperty(symbol('#cursor'), 'cursor.arrow')
      tCurrentBarElement.setProperty(symbol('#blend'), 0)
      tCurrentBarTextElement.setProperty(symbol('#blend'), 0)
      tCurrentBarTextElement.setProperty(symbol('#cursor'), 'cursor.arrow')
      this.pAcceptBtnActive = false
    }
  }

  updateAcceptButton() {
    const tCurrentBarElement = this.pWindowObj.getElement('rec_accept_btn')
    const tBarWidth = tCurrentBarElement.getProperty(symbol('#width'))
    tCurrentBarElement.setProperty(symbol('#image'), this.getCustomButtonImage(tBarWidth, 'green'))
  }

  updateCancelButton() {
    const tCurrentBarElement = this.pWindowObj.getElement('rec_cancel_btn')
    const tBarTextElement = this.pWindowObj.getElement('rec_cancel_text')
    const tBarWidth = tCurrentBarElement.getProperty(symbol('#width'))
    tCurrentBarElement.setProperty(symbol('#visible'), true)
    tBarTextElement.setProperty(symbol('#visible'), true)
    tCurrentBarElement.setProperty(symbol('#image'), this.getCustomButtonImage(tBarWidth, 'orange'))
  }

  hideCancelButton() {
    const tCurrentBarElement = this.pWindowObj.getElement('rec_cancel_btn')
    tCurrentBarElement.setProperty(symbol('#visible'), false)
    const tBarTextElement = this.pWindowObj.getElement('rec_cancel_text')
    tBarTextElement.setProperty(symbol('#visible'), false)
  }

  updateProgressBar() {
    const tComponent = this.getComponent()
    const tCurrentAmount = tComponent.getGiveFurniPool().length
    const tNextItem = tComponent.getNextRewardItemForCurrentAmount()
    const tNextFurniElement = this.pWindowObj.getElement('rec_target_name')
    const tProgressBarElement = this.pWindowObj.getElement('rec_target_bar')
    const tNextCounterElement = this.pWindowObj.getElement('rec_target_counter')
    const tBarWidth = tProgressBarElement.getProperty(symbol('#width'))
    if (!voidP(tNextItem)) {
      let tCurrentAcceptableCount = 0
      const tCurrentSelectableFurni = tComponent.getRewardItemForCurrentAmount()
      const tNextAmount = tNextItem[symbol('#furniValue')]
      if (!voidP(tCurrentSelectableFurni)) {
        tCurrentAcceptableCount = tCurrentSelectableFurni[symbol('#furniValue')]
        var tPercentage = Math.floor(lingoFloat(tCurrentAmount - tCurrentAcceptableCount) / (tNextAmount - tCurrentAcceptableCount) * 100)
      } else {
        var tPercentage = Math.floor(lingoFloat(tCurrentAmount) / tNextAmount * 100)
      }
      tNextFurniElement.setProperty(symbol('#blend'), 100)
      tNextFurniElement.setText(tNextItem[symbol('#name')])
      tProgressBarElement.setProperty(symbol('#blend'), 100)
      tProgressBarElement.setProperty(symbol('#image'), this.getBarImage(tBarWidth, tPercentage, 'yellow'))
      tNextCounterElement.setProperty(symbol('#blend'), 100)
      tNextCounterElement.setText(tCurrentAmount + '/' + tNextAmount)
    } else {
      tNextFurniElement.setProperty(symbol('#blend'), 0)
      tProgressBarElement.setProperty(symbol('#blend'), 0)
      tNextCounterElement.setProperty(symbol('#blend'), 0)
    }
  }

  getCustomButtonImage(tWidth, tColor) {
    if (voidP(tColor)) {
      tColor = 'green'
    }
    return this.getBarImage(tWidth, 100, tColor)
  }

  getBarImage(tBarWidth, tPercentage, tColor) {
    if (voidP(tColor)) {
      tColor = 'orange'
    }
    const tBarHeight = 29
    const tMarginWidth = 8
    let tBgColor = 'gray'
    if (tPercentage === 100) {
      tBgColor = tColor
    } else if (tPercentage === 0) {
      tColor = tBgColor
    }
    const tMarginLeftImg = member(getmemnum('ctlg_recycler_bar_left_' + tColor)).image
    const tMarginRightImg = member(getmemnum('ctlg_recycler_bar_right_' + tBgColor)).image
    const tBarBgImg = member(getmemnum('ctlg_recycler_bar_middle_' + tBgColor)).image
    const tBarPercentageImg = member(getmemnum('ctlg_recycler_bar_middle_' + tColor)).image
    const tBarImage = { width: tBarWidth, height: tBarHeight }
    // copyPixels operations - simplified for canvas rendering
    return tBarImage
  }

  detectMemberName(tClass, tProps) {
    let tMemStr = 'no_icon_small'
    const parts = tClass.split('*')
    tClass = parts[0]
    if (tClass.includes('post.it')) {
      const tCount = Math.min(6, Math.max(1, Math.floor(integer(tProps[symbol('#props')]) / (20.0 / 6.0))))
      if (memberExists(tClass + '_' + tCount + '_' + 'small')) {
        tMemStr = tClass + '_' + tCount + '_' + 'small'
      } else {
        error(this, "Couldn't define member for recycler item!" + RETURN + tProps, symbol('#detectMemberNameString'), symbol('#minor'))
      }
    } else if (memberExists(tProps[symbol('#class')] + '_' + tProps[symbol('#props')] + '_small')) {
      tMemStr = tProps[symbol('#class')] + '_' + tProps[symbol('#props')] + '_small'
    } else if (memberExists(tProps[symbol('#class')] + '_small')) {
      tMemStr = tProps[symbol('#class')] + '_small'
    } else if (memberExists(tClass + ' ' + tProps[symbol('#props')] + '_small')) {
      tMemStr = tClass + ' ' + tProps[symbol('#props')] + '_small'
    } else if (memberExists(tClass + '_small')) {
      tMemStr = tClass + '_small'
    } else if (memberExists('rightwall ' + tClass + ' ' + tProps[symbol('#props')])) {
      tMemStr = 'rightwall ' + tClass + ' ' + tProps[symbol('#props')]
    }
    return tMemStr
  }
}
