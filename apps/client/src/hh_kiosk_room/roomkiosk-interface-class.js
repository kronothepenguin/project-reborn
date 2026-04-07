// hh_kiosk_room/3_RoomKiosk Interface Class.ls → roomkiosk-interface-class.js
// RoomKiosk interface - manages room creation wizard UI (RoomMatic)

import {
  symbol,
  voidP,
  charToNum,
  replaceChars,
  getmemnum,
  member,
  error,
  EMPTY,
  SPACE,
  RETURN,
  getText,
} from '../core/lingo-runtime.js'
import { createWindow, getWindow, windowExists, removeWindow } from '../fuse_client/window-api.js'
import { registerMessage, unregisterMessage, executeMessage } from '../fuse_client/broker-manager-api.js'
import { getObject } from '../fuse_client/object-api.js'
import { getThread, threadExists } from '../fuse_client/core-thread-api.js'
import { getVariableValue } from '../fuse_client/variable-api.js'
import { getStringServices } from '../fuse_client/string-services-api.js'

export class RoomKioskInterfaceClass {
  constructor() {
    this.pTempPassword = {}
    this.pWindowTitle = 'RoomMatic'
    this.pRoomProps = {}
    this.pRoomsProps = null
    this.pRoomIndex = 1
  }

  construct() {
    this.pTempPassword = {}
    this.pWindowTitle = 'RoomMatic'
    this.pRoomProps = {}
    this.pRoomsProps = getVariableValue('private.room.properties') || {}
    this.pRoomIndex = 1
    return true
  }

  deconstruct() {
    if (windowExists(this.pWindowTitle)) {
      removeWindow(this.pWindowTitle)
    }
    return true
  }

  getID() {
    return 'hh_kiosk_room.interface'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  showHideRoomKiosk() {
    if (windowExists(this.pWindowTitle)) {
      this.getComponent().updateState('start')
      removeWindow(this.pWindowTitle)
    } else {
      this.pTempPassword = {}
      this.pRoomProps = {}
      this.ChangeWindowView('roomatic1.window')
    }
  }

  ChangeWindowView(tWindowName) {
    createWindow(this.pWindowTitle, null, null, null, symbol('#modal'))
    if (windowExists(this.pWindowTitle)) {
      const tWndObj = getWindow(this.pWindowTitle)
      tWndObj.merge(tWindowName)
      tWndObj.moveTo(360 - tWndObj.getProperty(symbol('#width')) / 2, 540 - tWndObj.getProperty(symbol('#height')))
      tWndObj.registerClient(this.getID())
      tWndObj.registerProcedure(symbol('#eventProc'), this.getID(), symbol('#mouseUp'))
      tWndObj.registerProcedure(symbol('#eventProc'), this.getID(), symbol('#keyDown'))
      this.setPageValues(tWindowName)
    }
  }

  createRoom() {
    this.pRoomProps[symbol('#name')] = getStringServices().convertSpecialChars(this.pRoomProps['name'], 1)
    this.pRoomProps[symbol('#description')] = getStringServices().convertSpecialChars(this.pRoomProps['description'], 1)
    this.pRoomProps['marker'] = 'model_' + this.pRoomProps['model']
    let tFlatData = '/first floor/'
    for (const f of ['name', 'marker', 'door', 'showownername']) {
      tFlatData = tFlatData + replaceChars(this.pRoomProps[f] || '', '/', SPACE) + '/'
    }
    tFlatData = tFlatData.substring(0, tFlatData.length - 1)
    this.getComponent().sendNewRoomData(tFlatData)
  }

  flatcreated(tFlatName, tFlatID) {
    this.getComponent().sendFlatCategory(tFlatID, this.pRoomProps['category'])
    this.ChangeWindowView('roomatic7.window')
    const tWndObj = getWindow(this.pWindowTitle)
    this.pRoomProps['id'] = tFlatID
    this.pRoomProps['name'] = tFlatName
    if (this.pRoomProps['door'] === 'password') {
      this.pRoomProps['Password'] = this.getPassword()
    } else {
      this.pRoomProps['Password'] = EMPTY
    }
    let tText = getText('roomatic_roomnumber', 'Room number:') + ' ' + this.pRoomProps['id']
    if (tWndObj.elementExists('roomatic_newnumber')) {
      tWndObj.getElement('roomatic_newnumber').setText(tText)
    }
    tText = getText('roomatic_roomname', 'Room name:') + ' ' + this.pRoomProps['name']
    if (tWndObj.elementExists('roomatic_newname')) {
      tWndObj.getElement('roomatic_newname').setText(tText)
    }
    return this.sendFlatInfo()
  }

  sendFlatInfo() {
    let tFlatMsg = '/' + replaceChars(String(this.pRoomProps['id']), '/', SPACE) + '/' + '\n'
    tFlatMsg += 'description=' + replaceChars(this.pRoomProps['description'], '/', SPACE) + '\n'
    tFlatMsg += 'password=' + this.pRoomProps['Password'] + '\n'
    tFlatMsg += 'allsuperuser=' + this.pRoomProps['ableothersmovefurniture']
    this.getComponent().sendSetFlatInfo(tFlatMsg)
  }

  updateRadioButton(tElement, tListOfOtherElements) {
    const tOnImg = member(getmemnum('button.radio_green.on')).image
    const tOffImg = member(getmemnum('button.radio_green.off')).image
    const tWindowObj = getWindow(this.pWindowTitle)
    if (tWindowObj.elementExists(tElement)) {
      tWindowObj.getElement(tElement).feedImage(tOnImg)
    }
    for (const tElem of tListOfOtherElements) {
      if (tWindowObj.elementExists(tElem)) {
        tWindowObj.getElement(tElem).feedImage(tOffImg)
      }
    }
  }

  updateCheckButton(tElement, tProp, tChangeMode) {
    const tWindowObj = getWindow(this.pWindowTitle)
    const tOnImg = member(getmemnum('button.checkbox_green.on')).image
    const tOffImg = member(getmemnum('button.checkbox_green.off')).image
    if (voidP(this.pRoomProps[tProp])) {
      this.pRoomProps[tProp] = '0'
    }
    if (voidP(tChangeMode)) {
      tChangeMode = false
    }
    if (tChangeMode) {
      this.pRoomProps[tProp] = this.pRoomProps[tProp] === '1' ? '0' : '1'
    }
    if (tWindowObj.elementExists(tElement)) {
      tWindowObj.getElement(tElement).feedImage(this.pRoomProps[tProp] === '1' ? tOnImg : tOffImg)
    }
  }

  checkPassword() {
    const tPw1 = this.pTempPassword['roomatic_password_field'] || []
    const tPw2 = this.pTempPassword['roomatic_password2_field'] || []
    if (tPw1.length === 0) {
      return 'Alert_ForgotSetPassword'
    }
    if (tPw1.length < 3) {
      return 'nav_error_passwordtooshort'
    }
    if (tPw1.join('') !== tPw2.join('')) {
      return 'Alert_WrongPassword'
    }
    return true
  }

  getPassword() {
    if (Object.keys(this.pTempPassword).length === 0) {
      return EMPTY
    }
    return (this.pTempPassword['roomatic_password_field'] || []).join('')
  }

  getSpecialLayoutRights() {
    return getObject(symbol('#session')).GET('user_rights').indexOf('fuse_use_special_room_layouts') !== -1
  }

  setPageValues(tWindowName) {
    switch (tWindowName) {
      case 'roomatic2.window': {
        const tWndObj = getWindow(this.pWindowTitle)
        if (!tWndObj) return false
        if (!voidP(this.pRoomProps['name'])) {
          tWndObj.getElement('roomatic_roomname_field').setText(this.pRoomProps['name'])
        }
        if (!voidP(this.pRoomProps['description'])) {
          tWndObj.getElement('romatic_roomdescription_field').setText(this.pRoomProps['description'])
        }
        this.pRoomProps['owner'] = getObject(symbol('#session')).GET('user_name')
        tWndObj.getElement('roomatic_ownername_field').setText(this.pRoomProps['owner'])
        if (!voidP(this.pRoomProps['showownername'])) {
          if (this.pRoomProps['showownername'] === 1) {
            this.updateRadioButton('roomatic_namedisplayed_yes_check', ['roomatic_namedisplayed_no_check'])
          } else {
            this.updateRadioButton('roomatic_namedisplayed_no_check', ['roomatic_namedisplayed_yes_check'])
          }
        } else {
          this.pRoomProps['showownername'] = 1
          this.updateRadioButton('roomatic_namedisplayed_yes_check', ['roomatic_namedisplayed_no_check'])
        }
        // Dropdown handling - simplified
        break
      }
      case 'roomatic3.window':
      case 'roomatic_club.window': {
        const tRoomSpecs = this.pRoomsProps[this.pRoomIndex]
        this.pRoomProps['model'] = tRoomSpecs['model']
        const tWndObj = getWindow(this.pWindowTitle)
        if (!tWndObj) return false
        const tElem = tWndObj.getElement('rm_room_layout')
        const tMemName = 'rm_model_' + this.pRoomProps['model'] + '_layout'
        const tmember = member(getmemnum(tMemName))
        if (tWndObj.elementExists('rm_hc_icon')) {
          tRoomSpecs['club'] ? tWndObj.getElement('rm_hc_icon').show() : tWndObj.getElement('rm_hc_icon').hide()
        }
        if (tWndObj.elementExists('rm_hc_only')) {
          tRoomSpecs['club'] ? tWndObj.getElement('rm_hc_only').show() : tWndObj.getElement('rm_hc_only').hide()
        }
        if (tWndObj.elementExists('roomatic_3_button_next')) {
          if (tRoomSpecs['club'] && !this.getSpecialLayoutRights()) {
            tWndObj.getElement('roomatic_3_button_next').hide()
          } else {
            tWndObj.getElement('roomatic_3_button_next').show()
          }
        }
        let tSizeTxt = getText('roommatic_modify_size')
        tSizeTxt = tSizeTxt.replace('%tileCount%', tRoomSpecs['size'])
        tWndObj.getElement('rm_room_size').setText(tSizeTxt)
        break
      }
      case 'roomatic4.window':
        this.pTempPassword = {}
        if (!voidP(this.pRoomProps['door'])) {
          const tOthers = { open: 'roomatic_security_open', closed: 'roomatic_security_locked', password: 'roomatic_security_pwc' }
          const tActive = tOthers[this.pRoomProps['door']]
          delete tOthers[this.pRoomProps['door']]
          this.updateRadioButton(tActive, Object.values(tOthers))
        } else {
          this.pRoomProps['door'] = 'open'
          this.updateRadioButton('roomatic_security_open', ['roomatic_security_locked', 'roomatic_security_pwc'])
        }
        this.updateCheckButton('roomatic_security_letmove', 'ableothersmovefurniture', false)
        this.showPasswordFields(this.pRoomProps['door'] === 'password')
        break
    }
  }

  showPasswordFields(tVisible) {
    const tWndObj = getWindow(this.pWindowTitle)
    if (!tWndObj) {
      return error(this, 'No window!', symbol('#showPasswordFields'), symbol('#minor'))
    }
    const tElems = ['roomatic_password2_field', 'roomatic_password_field', 'roomatic_pwdfieldsbg', 'roomatic_pwd_desc']
    for (const tElemID of tElems) {
      const tElem = tWndObj.getElement(tElemID)
      if (!voidP(tElem)) {
        tElem.setProperty(symbol('#visible'), tVisible)
        if (tElemID === 'roomatic_password2_field' || tElemID === 'roomatic_password_field') {
          tElem.setText(EMPTY)
        }
      }
    }
  }

  eventProc(tEvent, tSprID, tParm) {
    if (tEvent === symbol('#mouseUp')) {
      switch (tSprID) {
        case 'roomatic_1_button_start':
          this.ChangeWindowView('roomatic2.window')
          executeMessage(symbol('#tutorial_roommatic_start_ready'))
          break
        case 'roomatic_1_button_cancel':
          this.showHideRoomKiosk()
          break
        case 'roomatic_choosecategory':
          this.pRoomProps['category'] = tParm
          break
        case 'roomatic_2_button_cancel':
          this.showHideRoomKiosk()
          break
        case 'roomatic_2_button_next': {
          const tRoomName = replaceChars(getWindow(this.pWindowTitle).getElement('roomatic_roomname_field').getText(), '/', EMPTY)
          if (tRoomName === EMPTY) {
            return executeMessage(symbol('#alert'), [{ Msg: 'roomatic_givename' }, { modal: 1 }])
          }
          this.pRoomProps['name'] = tRoomName
          this.pRoomProps['description'] = getWindow(this.pWindowTitle).getElement('romatic_roomdescription_field').getText()
          this.ChangeWindowView('roomatic3.window')
          executeMessage(symbol('#tutorial_roommatic_details_ready'))
          break
        }
        case 'roomatic_namedisplayed_yes_check':
          this.pRoomProps['showownername'] = 1
          this.updateRadioButton('roomatic_namedisplayed_yes_check', ['roomatic_namedisplayed_no_check'])
          break
        case 'roomatic_namedisplayed_no_check':
          this.pRoomProps['showownername'] = 0
          this.updateRadioButton('roomatic_namedisplayed_no_check', ['roomatic_namedisplayed_yes_check'])
          break
        case 'roomatic3_button_model_next':
          this.pRoomIndex = this.pRoomIndex + 1
          if (this.pRoomIndex > Object.keys(this.pRoomsProps).length) {
            this.pRoomIndex = 1
          }
          this.setPageValues('roomatic3.window')
          break
        case 'roomatic3_button_model_prev':
          this.pRoomIndex = this.pRoomIndex - 1
          if (this.pRoomIndex < 1) {
            this.pRoomIndex = Object.keys(this.pRoomsProps).length
          }
          this.setPageValues('roomatic3.window')
          break
        case 'roomatic_3_button_next':
          this.ChangeWindowView('roomatic4.window')
          executeMessage(symbol('#tutorial_roommatic_layout_ready'))
          break
        case 'roomatic_3_button_previous':
          this.ChangeWindowView('roomatic2.window')
          break
        case 'roomatic_4_button_done':
          if (this.pRoomProps['door'] === 'password') {
            const tReturnValue = this.checkPassword()
            if (tReturnValue !== true) {
              const tReturnText = getText(tReturnValue)
              this.ChangeWindowView('roomatic5.window')
              getWindow(this.pWindowTitle).getElement('roomatic_errorMsg').setText(tReturnText)
              return true
            }
          }
          this.createRoom()
          this.ChangeWindowView('roomatic6.window')
          executeMessage(symbol('#tutorial_roommatic_security_ready'))
          break
        case 'roomatic_4_button_previous':
          this.ChangeWindowView('roomatic3.window')
          break
        case 'goto_club_layouts':
          this.ChangeWindowView('roomatic_club.window')
          break
        case 'goto_normal_layouts':
          this.ChangeWindowView('roomatic3.window')
          break
        case 'roomatic_security_open':
          this.pRoomProps['door'] = 'open'
          this.updateRadioButton('roomatic_security_open', ['roomatic_security_locked', 'roomatic_security_pwc'])
          this.pTempPassword = {}
          this.showPasswordFields(false)
          break
        case 'roomatic_security_locked':
          this.pRoomProps['door'] = 'closed'
          this.updateRadioButton('roomatic_security_locked', ['roomatic_security_open', 'roomatic_security_pwc'])
          this.pTempPassword = {}
          this.showPasswordFields(false)
          break
        case 'roomatic_security_pwc':
          this.pRoomProps['door'] = 'password'
          this.updateRadioButton('roomatic_security_pwc', ['roomatic_security_open', 'roomatic_security_locked'])
          this.pTempPassword = {}
          this.showPasswordFields(true)
          break
        case 'roomatic_security_letmove':
          this.updateCheckButton('roomatic_security_letmove', 'ableothersmovefurniture', true)
          break
        case 'roomatic_5_button_back':
          this.ChangeWindowView('roomatic4.window')
          break
        case 'roomatic_7_button_go':
          this.showHideRoomKiosk()
          if (threadExists(symbol('#navigator'))) {
            getThread(symbol('#navigator')).getComponent().roomkioskGoingFlat(this.pRoomProps)
          }
          break
        case 'roomatic_7_button_cancel':
          this.showHideRoomKiosk()
          if (threadExists(symbol('#navigator'))) {
            getThread(symbol('#navigator')).getComponent().sendGetOwnFlats()
          }
          break
        case 'close':
          this.showHideRoomKiosk()
          break
      }
    } else if (tEvent === symbol('#keyDown')) {
      const tASCII = charToNum('the key')
      if (tASCII < 28 && tASCII !== 8 && tASCII !== 9) {
        return true
      }
      switch (tSprID) {
        case 'roomatic_password_field':
        case 'roomatic_password2_field':
          if (voidP(this.pTempPassword[tSprID])) {
            this.pTempPassword[tSprID] = []
          }
          // Key code handling simplified
          break
      }
    }
  }
}
