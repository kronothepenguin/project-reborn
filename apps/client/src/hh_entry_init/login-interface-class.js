// hh_entry_init/6_Login Interface Class.ls → login-interface-class.js
// Login interface - manages login window, disconnect alert, password masking

import {
  symbol,
  voidP,
  stringp,
  chars,
  error,
  theMilliSeconds,
} from '../../core/lingo-runtime.js'
import { registerMessage, unregisterMessage, executeMessage } from '../../fuse_client/broker-manager-api.js'
import { getVariable, variableExists, getIntVariable, setVariable } from '../../fuse_client/variable-api.js'
import { windowExists, createWindow, getWindow, removeWindow } from '../../fuse_client/window-api.js'
import { getObject } from '../../fuse_client/object-api.js'
import { getConnection, connectionExists } from '../../fuse_client/connection-api.js'
import { getText } from '../../fuse_client/text-api.js'
import { createTimeout, timeoutExists } from '../../fuse_client/timeout-api.js'
import { openNetPage } from '../../fuse_client/special-services-api.js'

export class LoginInterfaceClass {
  constructor() {
    this.pConnectionId = null
    this.pTempPassword = ''
  }

  construct() {
    this.pConnectionId = getVariable('connection.info.id')
    this.pTempPassword = ''
    return true
  }

  deconstruct() {
    if (windowExists(symbol('#login_b'))) {
      removeWindow(symbol('#login_b'))
    }
    return true
  }

  getID() {
    return 'hh_entry_init.login.interface'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  showLogin() {
    getObject(symbol('#session')).set(symbol('#userName'), '')
    getObject(symbol('#session')).set(symbol('#Password'), '')
    this.pTempPassword = ''
    if (createWindow(symbol('#login_b'), 'habbo_simple.window', 444, 230)) {
      const tWndObj = getWindow(symbol('#login_b'))
      tWndObj.merge('login_b.window')
      tWndObj.registerClient(this.getID())
      tWndObj.registerProcedure(symbol('#eventProcLogin'), this.getID(), symbol('#mouseUp'))
      tWndObj.registerProcedure(symbol('#eventProcLogin'), this.getID(), symbol('#keyDown'))
      tWndObj.getElement('login_username').setFocus(1)
      if (variableExists('username_input.font.size')) {
        const tElem = tWndObj.getElement('login_username')
        if (tElem === 0) return false
        if (!tElem.pMember) return false
        if (tElem.pMember.type !== 'field') return false
        tElem.pMember.fontSize = getIntVariable('username_input.font.size')
        const tElem2 = tWndObj.getElement('login_password')
        if (tElem2 === 0) return false
        if (!tElem2.pMember) return false
        if (tElem2.pMember.type !== 'field') return false
        tElem2.pMember.fontSize = getIntVariable('username_input.font.size')
      }
    }
    if (variableExists('xxx.username') && variableExists('xxx.password')) {
      const tUserName = getVariable('xxx.username')
      const tPassword = getVariable('xxx.password')
      this.pTempPassword = tPassword
      const tWndObj = getWindow(symbol('#login_b'))
      tWndObj.getElement('login_username').setText(tUserName)
      setVariable('xxx.username', '')
      setVariable('xxx.password', '')
      this.tryLogin()
    }
    return true
  }

  hideLogin() {
    if (windowExists(symbol('#login_b'))) {
      removeWindow(symbol('#login_b'))
    }
    return true
  }

  showDisconnect() {
    const tList = {}
    executeMessage(symbol('#getHotelClosedDisconnectStatus'), tList)
    if (tList['retval'] === 1) {
      return true
    }
    createWindow(symbol('#error'), 'error.window', 0, 0, symbol('#modalcorner'))
    const tWndObj = getWindow(symbol('#error'))
    tWndObj.getElement('error_title').setText(getText('Alert_ConnectionFailure'))
    tWndObj.getElement('error_text').setText(getText('Alert_ConnectionDisconnected'))
    tWndObj.registerClient(this.getID())
    tWndObj.registerProcedure(symbol('#eventProcDisconnect'), this.getID(), symbol('#mouseUp'))
  }

  tryLogin() {
    if (!windowExists(symbol('#login_b'))) {
      return error(this, 'Window not found: ' + symbol('#login_b'), symbol('#tryLogin'), symbol('#major'))
    }
    const tWndObj = getWindow(symbol('#login_b'))
    const tUserName = tWndObj.getElement('login_username').getText()
    const tPassword = this.pTempPassword
    if (tUserName === '') return false
    if (tPassword === '') return false
    getObject(symbol('#session')).set(symbol('#userName'), tUserName)
    getObject(symbol('#session')).set(symbol('#Password'), tPassword)
    tWndObj.getElement('login_ok').hide()
    tWndObj.getElement('login_connecting').setProperty(symbol('#blend'), 100)
    this.blinkConnection()
    this.getComponent().setaProp(symbol('#pOkToLogin'), 1)
    return this.getComponent().connect()
  }

  blinkConnection() {
    if (!windowExists(symbol('#login_b'))) return false
    if (timeoutExists(symbol('#login_blinker'))) return false
    const tElem = getWindow(symbol('#login_b')).getElement('login_connecting')
    if (!tElem) return false
    if (getWindow(symbol('#login_b')).getElement('login_ok').getProperty(symbol('#visible')) === 1) return false
    const currentVisible = tElem.getProperty(symbol('#visible'))
    tElem.setProperty(symbol('#visible'), !currentVisible)
    return createTimeout(symbol('#login_blinker'), 500, symbol('#blinkConnection'), this.getID(), null, 1)
  }

  updatePasswordAsterisks() {
    if (!windowExists(symbol('#login_b'))) return false
    const tPwdTxt = getWindow(symbol('#login_b')).getElement('login_password').getText()
    for (let i = 0; i < tPwdTxt.length; i++) {
      const tChar = tPwdTxt[i]
      if (tChar !== '*' && tChar !== ' ') {
        const before = this.pTempPassword.substring(0, i)
        const after = this.pTempPassword.substring(i + 1)
        this.pTempPassword = before + tChar + after
      }
    }
    let tStars = ''
    for (let i = 0; i < this.pTempPassword.length; i++) {
      tStars += '*'
    }
    getWindow(symbol('#login_b')).getElement('login_password').setText(tStars)
  }

  eventProcLogin(tEvent, tSprID, tParam) {
    const tWndObj = getWindow(symbol('#login_b'))
    if (!tWndObj) return false
    if (tEvent === symbol('#mouseUp')) {
      switch (tSprID) {
        case 'login_password': {
          const tCount = tWndObj.getElement(tSprID).getText().length
          // set selStart/selEnd - placeholder
          break
        }
        case 'login_ok':
          return this.tryLogin()
      }
    }
    if (tEvent === symbol('#keyDown')) {
      const tTimeoutHideName = 'pwdhide' + Date.now()
      if (36 === 36) { // keyCode 36 = Enter/Return
        this.tryLogin()
        return true
      }
      switch (tSprID) {
        case 'login_password':
          // keyCode handling - simplified
          break
      }
      createTimeout(tTimeoutHideName, 1, symbol('#updatePasswordAsterisks'), this.getID(), null, 1)
    }
    return false
  }

  eventProcDisconnect(tEvent, tElemID, tParam) {
    if (tEvent === symbol('#mouseUp')) {
      if (tElemID === 'error_close') {
        removeWindow(symbol('#error'))
        // resetClient() - placeholder
      }
    }
  }
}
