// hh_club/2_Club Interface Class.ls → club-interface-class.js
// Club interface - Habbo Club UI, buy/extend/gift windows

import {
  symbol,
  voidP,
  objectp,
  string,
  replaceChunks,
  error,
} from '../../core/lingo-runtime.js'
import { registerMessage, unregisterMessage, executeMessage } from '../../fuse_client/broker-manager-api.js'
import { getVariable, variableExists } from '../../fuse_client/variable-api.js'
import { windowExists, createWindow, getWindow, removeWindow } from '../../fuse_client/window-api.js'
import { getObject } from '../../fuse_client/object-api.js'
import { connectionExists, removeConnection } from '../../fuse_client/connection-api.js'
import { getText } from '../../fuse_client/text-api.js'
import { openNetPage, urlEncode } from '../../fuse_client/special-services-api.js'

export class ClubInterfaceClass {
  constructor() {
    this.pDialogId = 'window_clubinfo1'
    this.pGiftDialogID = 'window_clubgift'
    this.pConnectionId = null
    this.pChosenLength = 1
    this.pSubscribeFromHotel = true
  }

  construct() {
    this.pConnectionId = getVariable('connection.info.id')
    if (variableExists('club.subscription.disabled')) {
      this.pSubscribeFromHotel = !(getVariable('club.subscription.disabled') > 0)
    } else {
      this.pSubscribeFromHotel = true
    }
    registerMessage(symbol('#show_clubinfo'), this.getID(), symbol('#show_clubinfo'))
    registerMessage(symbol('#notify'), this.getID(), symbol('#notify'))
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#show_clubinfo'), this.getID())
    unregisterMessage(symbol('#notify'), this.getID())
    return true
  }

  getID() {
    return 'hh_club.interface'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  show_giftinfo() {
    if (windowExists(this.pGiftDialogID)) {
      return false
    }
    this.setupWindow(this.pGiftDialogID, symbol('#modal'))
    const tWndObj = getWindow(this.pGiftDialogID)
    if (!objectp(tWndObj)) {
      return false
    }
    tWndObj.merge('habbo_club_confirm.window')
    tWndObj.center()
    tWndObj.getElement('club_confirm_title').setText(getText('club_confirm_gift_title'))
    tWndObj.getElement('club_confirm_text').setText(getText('club_confirm_gift_text'))
    tWndObj.registerProcedure(symbol('#eventProcGiftDialogMousedown'), this.getID(), symbol('#mouseDown'))
    return true
  }

  notify(ttype) {
    switch (ttype) {
      case 1001:
        executeMessage(symbol('#alert'), [{ Msg: 'epsnotify_1001' }])
        if (connectionExists(this.pConnectionId)) {
          removeConnection(this.pConnectionId)
        }
        break
      case 551:
        executeMessage(symbol('#alert'), [{ Msg: getText('club_extend_failed') }])
        break
      case 552:
        executeMessage(symbol('#alert'), [{ Msg: getText('Alert_no_credits') }])
        break
    }
  }

  setupEndedWindow() {
    const tClubInfo = this.getComponent().getStatus()
    const tWndObj = getWindow(this.pDialogId)
    if (!objectp(tWndObj)) {
      return false
    }
    const tElapsed = tClubInfo[symbol('#ElapsedPeriods')]
    const tElem = tWndObj.getElement('club_elapsed_periods')
    tElem.setText(string(tElapsed))
    tWndObj.registerProcedure(symbol('#eventProcDialogMousedown'), this.getID(), symbol('#mouseDown'))
    return true
  }

  setupStatusWindow(ttype) {
    const tClubInfo = this.getComponent().getStatus()
    const tWndObj = getWindow(this.pDialogId)
    if (!objectp(tWndObj)) {
      return false
    }
    const tDaysLeft = tClubInfo[symbol('#daysLeft')]
    const tElapsed = tClubInfo[symbol('#ElapsedPeriods')]
    const tPrepaid = tClubInfo[symbol('#PrepaidPeriods')]
    const tArrowElem = tWndObj.getElement('club_arrow')
    let tLocH = tArrowElem.getProperty(symbol('#locH'))
    tLocH = tLocH + ((31 - tDaysLeft) * 5)
    tArrowElem.setProperty(symbol('#locH'), tLocH)
    const tElem = tWndObj.getElement('club_elapsed_periods')
    tElem.setText(string(tElapsed))
    if (ttype === symbol('#FirstTimer')) {
      tWndObj.getElement('club_status_title').setText(getText('club_thanks_title'))
      tWndObj.getElement('club_status_text').setText(getText('club_thanks_text'))
    }
    if (tClubInfo[symbol('#PrepaidPeriods')] === -1) {
      tWndObj.getElement('club_button_extend').hide()
    } else {
      tWndObj.getElement('club_isp_change').hide()
      tWndObj.getElement('club_isp_icon').hide()
      tWndObj.getElement('club_prepaid_periods').setText(string(tClubInfo[symbol('#PrepaidPeriods')]))
    }
    if (tElapsed === 0) {
      tWndObj.getElement('club_elapsed_periods').hide()
      tWndObj.getElement('club_elapsed').hide()
    }
    if (tPrepaid === 0) {
      tWndObj.getElement('club_prepaid_periods').hide()
      tWndObj.getElement('club_prepaid').hide()
    }
    if (!getText('club_info_url').startsWith('http')) {
      getWindow(this.pDialogId).getElement('club_general_infolink').setProperty(symbol('#visible'), 0)
    }
    tWndObj.registerProcedure(symbol('#eventProcDialogMousedown'), this.getID(), symbol('#mouseDown'))
    return true
  }

  changeTextsToExtend() {
    const tWndObj = getWindow(this.pDialogId)
    if (!objectp(tWndObj)) {
      return false
    }
    const tHeaderText = getText('club_extend_title')
    const tText = getText('club_extend_text')
    tWndObj.getElement('club_intro_header').setText(tHeaderText)
    tWndObj.getElement('club_intro_text').setText(tText)
    return true
  }

  setupBuyWindow() {
    if (!getText('club_info_url').startsWith('http')) {
      getWindow(this.pDialogId).getElement('club_intro_link').setProperty(symbol('#visible'), 0)
    }
    getWindow(this.pDialogId).registerProcedure(symbol('#eventProcDialogMousedown'), this.getID(), symbol('#mouseDown'))
  }

  replaceCreditsText() {
    const tCredits = getObject(symbol('#session')).GET('user_walletbalance')
    const tWndObj = getWindow(this.pDialogId)
    let tText = getText('club_confirm_text' + this.pChosenLength)
    tText = replaceChunks(tText, '%credits%', string(tCredits))
    tWndObj.getElement('club_confirm_text').setText(tText)
    return true
  }

  setupWindow(tWindowID, ttype) {
    if (windowExists(tWindowID)) {
      removeWindow(tWindowID)
    }
    if (ttype === symbol('#modal')) {
      if (!createWindow(tWindowID, null, 0, 0, symbol('#modal'))) {
        return false
      }
    } else {
      if (!createWindow(tWindowID)) {
        return false
      }
    }
    const tWndObj = getWindow(tWindowID)
    tWndObj.setProperty(symbol('#title'), getText('club_habbo.window.title'))
    if (!tWndObj.merge('habbo_full.window')) {
      return tWndObj.close()
    }
    return true
  }

  show_clubinfo() {
    const tClubInfo = this.getComponent().getStatus()
    if (tClubInfo !== 0) {
      if (!windowExists(this.pDialogId)) {
        const tList = { showDialog: 1 }
        executeMessage(symbol('#getHotelClosingStatus'), tList)
        if (tList['retval'] === 1) {
          return true
        }
        this.setupWindow(this.pDialogId)
        const tWndObj = getWindow(this.pDialogId)
        if ((tClubInfo[symbol('#daysLeft')] === 0) && (tClubInfo[symbol('#ElapsedPeriods')] === 0)) {
          if (!this.pSubscribeFromHotel) {
            this.openBuyInHabboWeb()
            tWndObj.close()
            return true
          }
          if (!getText('club_paybycash_url').startsWith('http')) {
            tWndObj.merge('habbo_club_buy.window')
          } else {
            tWndObj.merge('habbo_club_buy_jp.window')
          }
          this.setupBuyWindow('intro')
        } else {
          if ((tClubInfo[symbol('#daysLeft')] === 0) && (tClubInfo[symbol('#ElapsedPeriods')] > 0)) {
            tWndObj.merge('habbo_club_ended.window')
            tWndObj.center()
            this.setupEndedWindow()
          } else {
            tWndObj.merge('habbo_club_status.window')
            this.setupStatusWindow()
          }
        }
        tWndObj.center()
      } else {
        removeWindow(this.pDialogId)
      }
    }
    return true
  }

  updateClubStatus(tStatus, tResponseFlag, tOldClubStatus) {
    if (tResponseFlag === 2) {
      this.setupWindow(this.pDialogId)
      const tWndObj = getWindow(this.pDialogId)
      if (!objectp(tWndObj)) {
        return false
      }
      tWndObj.merge('habbo_club_status.window')
      tWndObj.center()
      if ((tOldClubStatus[symbol('#ElapsedPeriods')] === 0) && (tOldClubStatus[symbol('#daysLeft')] === 0)) {
        this.setupStatusWindow(symbol('#FirstTimer'))
      } else {
        this.setupStatusWindow(symbol('#BeenHcBefore'))
      }
    }
    if (tResponseFlag === 3) {
      this.setupWindow(this.pDialogId, symbol('#modal'))
      const tWndObj = getWindow(this.pDialogId)
      tWndObj.merge('habbo_club_ended.window')
      tWndObj.center()
      this.setupEndedWindow()
    }
    return true
  }

  openBuyInHabboWeb() {
    if (getText('club_buy_url') === 'club_buy_url') {
      return error(this, 'key club_buy_url not defined!', symbol('#eventProcDialogMousedown'), symbol('#major'))
    } else {
      executeMessage(symbol('#externalLinkClick'), null /* the mouseLoc */)
      openNetPage(getText('club_buy_url'))
    }
    return true
  }

  eventProcDialogMousedown(tEvent, tSprID, tParam) {
    const tClubInfo = this.getComponent().getStatus()
    switch (tSprID) {
      case 'club_button_extend': {
        const tWndObj = getWindow(this.pDialogId)
        if (!objectp(tWndObj)) {
          return false
        }
        tWndObj.unmerge()
        if (!this.pSubscribeFromHotel) {
          this.openBuyInHabboWeb()
          tWndObj.close()
          return true
        }
        if (getText('club_paybycash_url').startsWith('http')) {
          tWndObj.merge('habbo_club_buy_jp.window')
        } else {
          tWndObj.merge('habbo_club_buy.window')
        }
        this.changeTextsToExtend()
        break
      }
      case 'club_isp_change': {
        const tSession = getObject(symbol('#session'))
        let tURL = getText('club_change_url')
        tURL = tURL + urlEncode(tSession.GET('user_name'))
        if (tSession.exists('user_checksum')) {
          tURL = tURL + '&sum=' + urlEncode(tSession.GET('user_checksum'))
        }
        executeMessage(symbol('#externalLinkClick'), null)
        openNetPage(tURL)
        break
      }
      case 'club_intro_link':
      case 'club_general_infolink':
        executeMessage(symbol('#externalLinkClick'), null)
        openNetPage(getText('club_info_url'))
        break
      case 'club_isp_buy': {
        const tSession = getObject(symbol('#session'))
        let tURL = getText('club_paybycash_url')
        tURL = tURL + urlEncode(tSession.GET('user_name'))
        if (tSession.exists('user_checksum')) {
          tURL = tURL + '&sum=' + urlEncode(tSession.GET('user_checksum'))
        }
        executeMessage(symbol('#externalLinkClick'), null)
        openNetPage(tURL, '_new')
        break
      }
      case 'club_button_1_period': {
        const tWndObj = getWindow(this.pDialogId)
        if (!objectp(tWndObj)) {
          return false
        }
        tWndObj.unmerge()
        tWndObj.merge('habbo_club_confirm.window')
        this.pChosenLength = 1
        this.replaceCreditsText()
        break
      }
      case 'club_button_2_period': {
        const tWndObj = getWindow(this.pDialogId)
        if (!objectp(tWndObj)) {
          return false
        }
        tWndObj.unmerge()
        tWndObj.merge('habbo_club_confirm.window')
        this.pChosenLength = 2
        this.replaceCreditsText()
        break
      }
      case 'club_button_3_period': {
        const tWndObj = getWindow(this.pDialogId)
        if (!objectp(tWndObj)) {
          return false
        }
        tWndObj.unmerge()
        tWndObj.merge('habbo_club_confirm.window')
        this.pChosenLength = 3
        this.replaceCreditsText()
        break
      }
      case 'club_confirm_ok':
        this.getComponent().subscribe(this.pChosenLength)
        removeWindow(this.pDialogId)
        break
      case 'club_confirm_cancel':
      case 'club_button_close':
        removeWindow(this.pDialogId)
        break
      case 'close':
        removeWindow(this.pDialogId)
        break
    }
    return true
  }

  eventProcGiftDialogMousedown(tEvent, tSprID, tParam) {
    switch (tSprID) {
      case 'club_confirm_ok':
        removeWindow(this.pGiftDialogID)
        this.getComponent().acceptGift()
        break
      case 'club_confirm_cancel':
      case 'club_button_close':
        removeWindow(this.pGiftDialogID)
        this.getComponent().rejectGift()
        break
      case 'close':
        this.getComponent().resetGiftList()
        break
    }
    return true
  }
}
