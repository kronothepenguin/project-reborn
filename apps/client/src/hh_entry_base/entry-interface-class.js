// hh_entry_base/3_Entry Interface Class.ls → entry-interface-class.js
// Entry interface - manages hotel view, entry bar, icons, and animations

import {
  symbol,
  symbolp,
  voidP,
  integerp,
  listp,
  registerMessage,
  unregisterMessage,
  executeMessage,
  visualizerExists,
  createVisualizer,
  getVisualizer,
  removeVisualizer,
  windowExists,
  createWindow,
  getWindow,
  removeWindow,
  objectExists,
  createObject,
  removeObject,
  getObject,
  getVariableValue,
  getVariable,
  getIntVariable,
  variableExists,
  getMember,
  getText,
  replaceChunks,
  timeoutExists,
  removeTimeout,
  createTimeout,
  receivePrepare,
  removePrepare,
  receiveUpdate,
  removeUpdate,
  random,
  rect,
  theMilliSeconds,
  error,
  call,
  getThread,
  threadExists,
  createPropList,
} from '../../core/lingo-runtime.js'

export class EntryInterfaceClass {
  constructor() {
    this.pEntryVisual = 'entry_view'
    this.pBottomBar = 'entry_bar'
    this.pSignSprList = []
    this.pSignSprLocV = 0
    this.pItemObjList = []
    this.pUpdateTasks = []
    this.pViewMaxTime = 500
    this.pViewOpenTime = null
    this.pViewCloseTime = null
    this.pAnimUpdate = 0
    this.pFirstInit = true
    this.pInActiveIconBlend = 40
    this.pMessengerFlash = 0
    this.pClubDaysCount = 0
    this.pSwapAnimations = []
    this.pBouncerID = symbol('#entry_im_icon_bouncer')
    this.pIMFlashTimeoutID = symbol('#im_icon_flash_timeout')
    this.pDisableRoomevents = 0
    this.pIMFlashState = false
    this.pID = null
  }

  construct() {
    this.pEntryVisual = 'entry_view'
    this.pBottomBar = 'entry_bar'
    this.pSignSprList = []
    this.pSignSprLocV = 0
    this.pItemObjList = []
    this.pUpdateTasks = []
    this.pViewMaxTime = 500
    this.pViewOpenTime = null
    this.pViewCloseTime = null
    this.pAnimUpdate = 0
    this.pFirstInit = true
    this.pInActiveIconBlend = 40
    this.pClubDaysCount = 0
    this.pSwapAnimations = []
    this.pBouncerID = symbol('#entry_im_icon_bouncer')
    this.pIMFlashTimeoutID = symbol('#im_icon_flash_timeout')
    this.pDisableRoomevents = 0
    this.pIMFlashState = false
    if (variableExists('disable.roomevents')) {
      this.pDisableRoomevents = getIntVariable('disable.roomevents')
    }
    registerMessage(symbol('#userlogin'), this.pID, symbol('#showEntryBar'))
    registerMessage(symbol('#showHotelView'), this.pID, symbol('#showHotel'))
    registerMessage(symbol('#IMStateChanged'), this.pID, symbol('#updateIMIcon'))
    executeMessage(symbol('#requestHotelView'))
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#userlogin'), this.pID)
    unregisterMessage(symbol('#showHotelView'), this.pID)
    unregisterMessage(symbol('#IMStateChanged'), this.pID)
    for (const tAnimation of this.pSwapAnimations) {
      if (tAnimation && tAnimation.deconstruct) tAnimation.deconstruct()
    }
    this.pSwapAnimations = []
    // tManager = getThread(symbol('#room')).getComponent().removeIconBarManager()
    return this.hideAll()
  }

  showHotel() {
    if (!visualizerExists(this.pEntryVisual)) {
      if (!createVisualizer(this.pEntryVisual, 'entry.visual')) {
        return false
      }
      const tVisObj = getVisualizer(this.pEntryVisual)
      this.pSignSprList = []
      this.pSignSprList.push(tVisObj.getSprById('entry_sign'))
      this.pSignSprList.push(tVisObj.getSprById('entry_sign_sd'))
      this.pSignSprLocV = this.pSignSprList[0].locV
      const tAnimations = tVisObj.getProperty(symbol('#swapAnims'))
      if (tAnimations !== 0) {
        for (const tAnimation of tAnimations) {
          const tObj = createObject(symbol('#random'), getVariableValue('swap.animation.class'))
          if (tObj === 0) {
            error(this, 'Error creating swap animation', symbol('#showHotel'), symbol('#minor'))
            continue
          }
          this.pSwapAnimations.push(tObj)
          this.pSwapAnimations[this.pSwapAnimations.length - 1].define(tAnimation)
        }
      }
      this.pItemObjList = []
      const tAnimations2 = getVariableValue('hotel.view.animations', [])
      for (let i = 0; i < tAnimations2.length; i++) {
        const tAnimationType = tAnimations2[i]
        let j = 1
        while (true) {
          const tSpr = tVisObj.getSprById(tAnimationType[0] + j)
          if (tSpr !== 0) {
            const tObj = createObject(symbol('#temp'), tAnimationType[1])
            if (tObj !== 0) {
              tObj.define(tSpr, j)
              this.pItemObjList.push(tObj)
            } else {
              error(this, 'Error creating object: ' + tAnimationType, symbol('#showHotel'), symbol('#minor'))
            }
          } else {
            break
          }
          j++
        }
      }
    }
    this.remAnimTask(symbol('#closeView'))
    this.pViewOpenTime = theMilliSeconds() + 500
    receivePrepare(this.pID)
    this.delay(500, symbol('#addAnimTask'), symbol('#openView'))
    return true
  }

  hideHotel() {
    if (visualizerExists(this.pEntryVisual)) {
      this.addAnimTask(symbol('#closeView'))
      this.remAnimTask(symbol('#animSign'))
      this.remAnimTask(symbol('#openView'))
      this.pViewCloseTime = theMilliSeconds()
    }
    this.pItemObjList = []
    removePrepare(this.pID)
    for (const tAnim of this.pSwapAnimations) {
      if (tAnim && tAnim.deconstruct) tAnim.deconstruct()
    }
    this.pSwapAnimations = []
    return true
  }

  showEntryBar() {
    if (!windowExists(this.pBottomBar)) {
      if (!createWindow(this.pBottomBar, 'entry_bar.window', 0, 535)) {
        return false
      }
      const tWndObj = getWindow(this.pBottomBar)
      tWndObj.setProperty(symbol('#boundary'), rect(-100, -100, 1000, 1000))
      tWndObj.lock(true)
      tWndObj.registerClient(this.pID)
      tWndObj.registerProcedure(symbol('#eventProcEntryBar'), this.pID, symbol('#mouseUp'))
      this.addAnimTask(symbol('#animEntryBar'))
    }
    if (this.pDisableRoomevents) {
      const tWndObj = getWindow(this.pBottomBar)
      const tEventsIcon = tWndObj.getElement('event_icon_image')
      tEventsIcon.setProperty(symbol('#member'), getMember('event_icon_disabled'))
    }
    this.updateIMIcon()
    // tManager = getThread(symbol('#room')).getComponent().getIconBarManager()
    // tManager.define(this.pBottomBar)
    registerMessage(symbol('#updateCreditCount'), this.pID, symbol('#updateCreditCount'))
    registerMessage(symbol('#updateFriendListIcon'), this.pID, symbol('#updateFriendListIcon'))
    registerMessage(symbol('#updateFigureData'), this.pID, symbol('#updateEntryBar'))
    registerMessage(symbol('#updateClubStatus'), this.pID, symbol('#updateClubStatus'))
    return this.updateEntryBar()
  }

  hideEntrybar() {
    unregisterMessage(symbol('#updateCreditCount'), this.pID)
    unregisterMessage(symbol('#updateFriendListIcon'), this.pID)
    unregisterMessage(symbol('#updateFigureData'), this.pID)
    unregisterMessage(symbol('#updateClubStatus'), this.pID)
    if (timeoutExists(symbol('#flash_messenger_icon'))) {
      removeTimeout(symbol('#flash_messenger_icon'))
    }
    if (windowExists(this.pBottomBar)) {
      removeWindow(this.pBottomBar)
    }
    if (objectExists(this.pBouncerID)) {
      removeObject(this.pBouncerID)
    }
    // tManager = getThread(symbol('#room')).getComponent().getIconBarManager()
    // tManager.hideExtensions()
    return true
  }

  hideAll() {
    this.hideHotel()
    this.hideEntrybar()
    return true
  }

  prepare() {
    this.pAnimUpdate = !this.pAnimUpdate
    if (this.pAnimUpdate) {
      const tVisual = getVisualizer(this.pEntryVisual)
      if (!tVisual) {
        return removePrepare(this.pID)
      }
      for (const item of this.pItemObjList) {
        if (item && item.update) item.update()
      }
    }
  }

  update() {
    for (const tMethod of [...this.pUpdateTasks]) {
      if (this[tMethod]) this[tMethod]()
    }
  }

  updateEntryBar() {
    const tWndObj = getWindow(this.pBottomBar)
    if (tWndObj === 0) return false
    const tSession = getObject(symbol('#session'))
    const tName = tSession.GET('user_name')
    const tText = tSession.GET('user_customData')
    let tCrds
    if (tSession.exists('user_walletbalance')) {
      tCrds = tSession.GET('user_walletbalance')
    } else {
      tCrds = getText('loading', 'Loading')
    }
    let tClub
    if (tSession.exists('club_status')) {
      tClub = tSession.GET('club_status')
    } else {
      tClub = getText('loading', 'Loading')
    }
    tWndObj.getElement('ownhabbo_name_text').setText(tName)
    tWndObj.getElement('ownhabbo_mission_text').setText(tText)
    if (this.pFirstInit) {
      this.deActivateAllIcons()
      this.pFirstInit = false
    }
    this.updateCreditCount(tCrds)
    executeMessage(symbol('#messageUpdateRequest'))
    executeMessage(symbol('#buddyUpdateRequest'))
    this.updateClubStatus(tClub)
    this.createMyHeadIcon()
    return true
  }

  addAnimTask(tMethod) {
    if (this.pUpdateTasks.indexOf(tMethod) === -1) {
      this.pUpdateTasks.push(tMethod)
    }
    return receiveUpdate(this.pID)
  }

  remAnimTask(tMethod) {
    const idx = this.pUpdateTasks.indexOf(tMethod)
    if (idx >= 0) this.pUpdateTasks.splice(idx, 1)
    if (this.pUpdateTasks.length === 0) {
      removeUpdate(this.pID)
    }
    return true
  }

  animSign() {
    const tVisObj = getVisualizer(this.pEntryVisual)
    if (tVisObj === 0) {
      return this.remAnimTask(symbol('#animSign'))
    }
    for (const tSpr of this.pSignSprList) {
      tSpr.locV += 30
    }
    if (this.pSignSprList[0].locV >= 0) {
      this.pSignSprList[0].locV = 0
      this.pSignSprList[1].locV = 0
      this.remAnimTask(symbol('#animSign'))
    }
  }

  openView() {
    const tVisObj = getVisualizer(this.pEntryVisual)
    if (tVisObj === 0) {
      return this.remAnimTask(symbol('#openView'))
    }
    const tTopSpr = tVisObj.getSprById('box_top')
    const tBotSpr = tVisObj.getSprById('box_bottom')
    const tTimeLeft = (this.pViewMaxTime - (theMilliSeconds() - this.pViewOpenTime)) / 1000.0
    const tmoveLeft = tTopSpr.height - Math.abs(tTopSpr.locV)
    let tOffset
    if (tTimeLeft <= 0) {
      tOffset = Math.abs(tmoveLeft)
    } else {
      tOffset = Math.abs(tmoveLeft / tTimeLeft) / 60 // the frameTempo
    }
    tTopSpr.locV -= tOffset
    tBotSpr.locV += tOffset
    if (tTopSpr.locV <= -tTopSpr.height) {
      this.addAnimTask(symbol('#animSign'))
      this.remAnimTask(symbol('#openView'))
    }
  }

  closeView() {
    const tVisObj = getVisualizer(this.pEntryVisual)
    if (tVisObj === 0) {
      return this.remAnimTask(symbol('#closeView'))
    }
    const tTopSpr = tVisObj.getSprById('box_top')
    const tBotSpr = tVisObj.getSprById('box_bottom')
    const tTimeLeft = (this.pViewMaxTime - (theMilliSeconds() - this.pViewCloseTime)) / 1000.0
    const tmoveLeft = 0 - Math.abs(tTopSpr.locV)
    let tOffset
    if (tTimeLeft <= 0) {
      tOffset = Math.abs(tmoveLeft)
    } else {
      tOffset = Math.abs(tmoveLeft / tTimeLeft) / 60 // the frameTempo
    }
    tTopSpr.locV += tOffset
    tBotSpr.locV -= tOffset
    if (tTopSpr.locV >= 0) {
      this.remAnimTask(symbol('#closeView'))
      removeVisualizer(this.pEntryVisual)
    }
  }

  animEntryBar() {
    const tWndObj = getWindow(this.pBottomBar)
    if (tWndObj === 0) {
      return this.remAnimTask(symbol('#animEntryBar'))
    }
    // if platform contains "windows": moveBy(0, -5) else moveTo(0, 485)
    tWndObj.moveTo(0, 485)
    if (tWndObj.getProperty(symbol('#locY')) <= 485) {
      this.remAnimTask(symbol('#animEntryBar'))
    }
  }

  updateCreditCount(tCount) {
    const tWndObj = getWindow(this.pBottomBar)
    if (tWndObj !== 0) {
      const tElement = tWndObj.getElement('own_credits_text')
      if (!tElement) return false
      tElement.setText(tCount + ' ' + getText('int_credits'))
    }
    return true
  }

  updateClubStatus(tStatus) {
    if (!tStatus || typeof tStatus !== 'object') return false
    const tWndObj = getWindow(this.pBottomBar)
    if (tWndObj === 0) return false
    if (!tWndObj.elementExists('club_bottombar_text1')) return false
    if (!tWndObj.elementExists('club_bottombar_text2')) return false
    const tDays = (tStatus.daysLeft || 0) + ((tStatus.PrepaidPeriods || 0) * 31)
    if ((tStatus.PrepaidPeriods || 0) < 0) {
      tWndObj.getElement('club_bottombar_text1').setText(getText('club_habbo.bottombar.text.member'))
      tWndObj.getElement('club_bottombar_text2').setText(getText('club_member'))
    } else {
      if (tDays === 0) {
        tWndObj.getElement('club_bottombar_text1').setText(getText('club_habbo.bottombar.text.notmember'))
        tWndObj.getElement('club_bottombar_text2').setText(getText('club_habbo.bottombar.link.notmember'))
      } else {
        let tStr = getText('club_habbo.bottombar.link.member')
        tStr = replaceChunks(tStr, '%days%', tDays)
        tWndObj.getElement('club_bottombar_text1').setText(getText('club_habbo.bottombar.text.member'))
        tWndObj.getElement('club_bottombar_text2').setText(tStr)
      }
    }
    return true
  }

  updateFriendListIcon(tActive) {
    const tWndObj = getWindow(this.pBottomBar)
    if (tWndObj === 0) return false
    const tIconElem = tWndObj.getElement('friend_list_icon')
    if (!tIconElem) return false
    if (tActive) {
      tIconElem.setProperty(symbol('#member'), 'friend_list_icon_notification')
    } else {
      tIconElem.setProperty(symbol('#member'), 'friend_list_icon')
    }
  }

  bounceIMIcon(tstate) {
    if (variableExists('bounce.messenger.icon')) {
      if (!getVariable('bounce.messenger.icon')) return false
    }
    if (!objectExists(this.pBouncerID)) {
      createObject(this.pBouncerID, 'Element Bouncer Class')
    }
    const tBouncer = getObject(this.pBouncerID)
    if (tstate === tBouncer.getState()) return true
    if (tstate) {
      tBouncer.registerElement(this.pBottomBar, ['im_icon'])
      tBouncer.setBounce(true)
    } else {
      tBouncer.setBounce(false)
    }
  }

  activateIcon(tIcon) {
    if (windowExists(this.pBottomBar)) {
      if (tIcon === symbol('#navigator')) {
        getWindow(this.pBottomBar).getElement('nav_icon_image').setProperty(symbol('#blend'), 100)
      }
    }
  }

  deActivateIcon(tIcon) {
    if (windowExists(this.pBottomBar)) {
      if (tIcon === symbol('#navigator')) {
        getWindow(this.pBottomBar).getElement('nav_icon_image').setProperty(symbol('#blend'), this.pInActiveIconBlend)
      }
    }
  }

  deActivateAllIcons() {
    const tIcons = []
    if (windowExists(this.pBottomBar)) {
      for (const tIcon of tIcons) {
        getWindow(this.pBottomBar).getElement(tIcon + '_icon_image').setProperty(symbol('#blend'), this.pInActiveIconBlend)
      }
    }
  }

  createMyHeadIcon() {
    if (objectExists('Figure_Preview')) {
      getObject('Figure_Preview').createHumanPartPreview(this.pBottomBar, 'ownhabbo_icon_image', symbol('#head'))
    }
  }

  updateIMIcon() {
    if (!windowExists(this.pBottomBar)) return false
    if (!threadExists(symbol('#instant_messenger'))) return false
    let tstate = getThread(symbol('#instant_messenger')).getInterface().getState()
    if (voidP(tstate)) tstate = symbol('#inactive')
    const tWnd = getWindow(this.pBottomBar)
    const tElem = tWnd.getElement('im_icon')
    let tmember
    switch (tstate) {
      case symbol('#Active'):
        tmember = getMember('im.icon.active')
        tElem.setProperty(symbol('#cursor'), 'cursor.finger')
        this.bounceIMIcon(false)
        this.flashIMIcon(symbol('#stop'))
        break
      case symbol('#highlighted'):
        tmember = getMember('im.icon.highlighted')
        tElem.setProperty(symbol('#cursor'), 'cursor.finger')
        this.bounceIMIcon(true)
        this.flashIMIcon(symbol('#start'))
        break
      case symbol('#inactive'):
        tmember = getMember('im.icon.inactive')
        tElem.setProperty(symbol('#cursor'), 0)
        this.bounceIMIcon(false)
        this.flashIMIcon(symbol('#stop'))
        break
      default:
        return false
    }
    tElem.setProperty(symbol('#member'), tmember)
    return true
  }

  flashIMIcon(tstate) {
    switch (tstate) {
      case symbol('#start'):
        if (timeoutExists(this.pIMFlashTimeoutID)) {
          removeTimeout(this.pIMFlashTimeoutID)
        }
        if (!timeoutExists(this.pIMFlashTimeoutID)) {
          createTimeout(this.pIMFlashTimeoutID, 500, symbol('#flashIMIcon'), this.pID, symbol('#flash'), false)
        }
        break
      case symbol('#stop'):
        if (timeoutExists(this.pIMFlashTimeoutID)) {
          removeTimeout(this.pIMFlashTimeoutID)
        }
        break
      case symbol('#flash'): {
        const tWnd = getWindow(this.pBottomBar)
        if (!tWnd) return false
        const tElem = tWnd.getElement('im_icon')
        if (this.pIMFlashState) {
          tElem.setProperty(symbol('#member'), 'im.icon.highlighted.2')
        } else {
          tElem.setProperty(symbol('#member'), 'im.icon.highlighted')
        }
        this.pIMFlashState = !this.pIMFlashState
        break
      }
    }
  }

  eventProcEntryBar(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case 'help_icon_image':
        return executeMessage(symbol('#openGeneralDialog'), 'help')
      case 'get_credit_text':
      case 'purse_icon_image':
        return executeMessage(symbol('#openGeneralDialog'), 'purse')
      case 'event_icon_image':
        if (!this.pDisableRoomevents) {
          return executeMessage(symbol('#show_hide_roomevents'))
        }
        return true
      case 'nav_icon_image':
        return executeMessage(symbol('#show_hide_navigator'))
      case 'friend_list_icon':
        return executeMessage(symbol('#toggle_friend_list'))
      case 'update_habboid_text':
      case 'ownhabbo_icon_image': {
        let tAllowModify = true
        const session = getObject(symbol('#session'))
        if (session.exists('allow_profile_editing')) {
          tAllowModify = session.GET('allow_profile_editing')
        }
        if (tAllowModify) {
          if (threadExists(symbol('#registration'))) {
            getThread(symbol('#registration')).getComponent().openFigureUpdate()
          }
        } else {
          // executeMessage(symbol('#externalLinkClick'), the mouseLoc)
          // openNetPage(getText('url_figure_editor'))
        }
        break
      }
      case 'club_icon_image':
      case 'club_bottombar_text2':
        return executeMessage(symbol('#show_clubinfo'))
      case 'im_icon':
        return executeMessage(symbol('#toggle_im'))
      case 'int_controller_image':
        return executeMessage(symbol('#toggle_ig'))
      case 'int_brochure_image':
        return executeMessage(symbol('#show_hide_catalogue'))
    }
  }

  delay(ms, method, ...args) {
    setTimeout(() => {
      if (this[method]) this[method](...args)
    }, ms)
  }
}
