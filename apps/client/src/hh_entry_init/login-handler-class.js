// hh_entry_init/8_Login Handler Class.ls → login-handler-class.js
// Login handler - handles all login-related server messages

import {
  symbol,
  voidP,
  integerp,
  integer,
  stringp,
  EMPTY,
  RETURN,
  error,
  chars,
  replaceChunks,
  deobfuscate,
  numToChar,
  length,
  secretDecode,
  getMoviePath,
} from '../core/lingo-runtime.js'
import { registerMessage, unregisterMessage, executeMessage } from '../fuse_client/broker-manager-api.js'
import { getVariable } from '../fuse_client/variable-api.js'
import { registerListener, unregisterListener, registerCommands, unregisterCommands, getConnection } from '../fuse_client/connection-api.js'
import { getObject } from '../fuse_client/object-api.js'
import { createObject, objectExists } from '../fuse_client/object-api.js'
import { getText } from '../fuse_client/text-api.js'
import { openNetPage, fatalError, sendProcessTracking } from '../fuse_client/special-services-api.js'
import { getStringServices } from '../fuse_client/string-services-api.js'

export class LoginHandlerClass {
  constructor() {
    this.pCryptoParams = {}
    this.pBigJob = null
  }

  construct() {
    this.pCryptoParams = {}
    registerMessage(symbol('#hideLogin'), this.getID(), symbol('#hideLogin'))
    return this.regMsgList(1)
  }

  deconstruct() {
    unregisterMessage(symbol('#performLogin'), this.getID())
    unregisterMessage(symbol('#hideLogin'), this.getID())
    return this.regMsgList(0)
  }

  getID() {
    return 'hh_entry_init.login.handler'
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

  handleDisconnect(tMsg) {
    const tSession = getObject(symbol('#session'))
    let tUserLoggedIn = false
    if (tSession) {
      tUserLoggedIn = tSession.GET('userLoggedIn')
    }
    if (tUserLoggedIn) {
      this.getInterface().showDisconnect()
      return fatalError({ error: 'disconnect' })
    } else {
      const tErrorList = { error: this.getComponent().GetDisconnectErrorState() }
      const tConnection = getConnection(getVariable('connection.info.id'))
      if (tConnection) {
        tErrorList['host'] = tConnection.getProperty(symbol('#host'))
        tErrorList['port'] = tConnection.getProperty(symbol('#port'))
      }
      return fatalError(tErrorList)
    }
  }

  handleHello(tMsg) {
    this.getComponent().SetDisconnectErrorState('init_crypto')
    return tMsg.connection.send('INIT_CRYPTO')
  }

  handleSessionParameters(tMsg) {
    const tPairsCount = tMsg.connection.GetIntFrom()
    if (integerp(tPairsCount) && tPairsCount > 0) {
      for (let i = 0; i < tPairsCount; i++) {
        const tID = tMsg.connection.GetIntFrom()
        const tSession = getObject(symbol('#session'))
        switch (tID) {
          case 0: {
            const tValue = tMsg.connection.GetIntFrom()
            tSession.set('conf_coppa', tValue > 0)
            tSession.set('conf_strong_coppa_required', tValue > 1)
            break
          }
          case 1: {
            const tValue = tMsg.connection.GetIntFrom()
            tSession.set('conf_voucher', tValue > 0)
            break
          }
          case 2: {
            const tValue = tMsg.connection.GetIntFrom()
            tSession.set('conf_parent_email_request', tValue > 0)
            break
          }
          case 3: {
            const tValue = tMsg.connection.GetIntFrom()
            tSession.set('conf_parent_email_request_reregistration', tValue > 0)
            break
          }
          case 4: {
            const tValue = tMsg.connection.GetIntFrom()
            tSession.set('conf_allow_direct_mail', tValue > 0)
            break
          }
          case 5: {
            const tValue = tMsg.connection.GetStrFrom()
            if (objectExists(symbol('#dateFormatter'))) {
              const tDateForm = getObject(symbol('#dateFormatter'))
              if (tDateForm !== 0) tDateForm.define(tValue)
            }
            break
          }
          case 6: {
            const tValue = tMsg.connection.GetIntFrom()
            tSession.set('conf_partner_integration', tValue > 0)
            break
          }
          case 7: {
            const tValue = tMsg.connection.GetIntFrom()
            tSession.set('allow_profile_editing', tValue > 0)
            break
          }
          case 8: {
            const tValue = tMsg.connection.GetStrFrom()
            tSession.set('tracking_header', tValue)
            break
          }
          case 9: {
            const tValue = tMsg.connection.GetIntFrom()
            tSession.set('tutorial_enabled', tValue)
            break
          }
        }
      }
    }
    return this.getComponent().sendLogin(tMsg.connection)
  }

  handlePing(tMsg) {
    tMsg.connection.send('PONG')
  }

  handleLoginOK(tMsg) {
    sendProcessTracking(41)
    tMsg.connection.send('GET_INFO')
    tMsg.connection.send('GET_CREDITS')
    tMsg.connection.send('GETAVAILABLEBADGES')
    tMsg.connection.send('GET_POSSIBLE_ACHIEVEMENTS')
    tMsg.connection.send('GET_SOUND_SETTING')
    this.getComponent().initLatencyTest()
    if (objectExists(symbol('#session'))) {
      getObject(symbol('#session')).set('userLoggedIn', 1)
    }
    executeMessage(symbol('#userloggedin'))
    executeMessage(symbol('#sendTrackingPoint'), '/client/loggedin')
  }

  handleUserObj(tMsg) {
    const tuser = {}
    const tConn = tMsg.connection
    tuser['user_id'] = tConn.GetStrFrom()
    tuser['name'] = tConn.GetStrFrom()
    tuser['figure'] = tConn.GetStrFrom()
    tuser['sex'] = tConn.GetStrFrom()
    tuser['customData'] = tConn.GetStrFrom()
    tuser['ph_tickets'] = tConn.GetIntFrom()
    tuser['ph_figure'] = tConn.GetStrFrom()
    tuser['photo_film'] = tConn.GetIntFrom()
    tuser['directMail'] = tConn.GetIntFrom()
    tuser['figure_string'] = tuser['figure']
    if (tuser['sex']) {
      if (tuser['sex'].includes('F') || tuser['sex'].includes('f')) {
        tuser['sex'] = 'F'
      } else {
        tuser['sex'] = 'M'
      }
    }
    const tSession = getObject(symbol('#session'))
    const keys = Object.keys(tuser)
    for (let i = 0; i < keys.length; i++) {
      tSession.set('user_' + keys[i], tuser[keys[i]])
    }
    tSession.set(symbol('#userName'), tSession.GET('user_name'))
    executeMessage(symbol('#updateFigureData'))
    if (tSession.exists('user_logged')) {
      return
    } else {
      tSession.set('user_logged', 1)
    }
    this.getInterface().hideLogin()
    executeMessage(symbol('#userlogin'), 'userLogin')
  }

  handleUserBanned(tMsg) {
    const tBanMsg = getText('Alert_YouAreBanned') + '\n' + tMsg.content
    executeMessage(symbol('#openGeneralDialog'), symbol('#ban'), [{ id: 'BannWarning' }, { title: 'Alert_YouAreBanned_T' }, { Msg: tBanMsg }, { modal: 1 }])
    // removeConnection - placeholder
  }

  handleEPSnotify(tMsg) {
    let ttype = ''
    let tdata = ''
    const lines = tMsg.content.split('\n')
    for (const line of lines) {
      const parts = line.split('=')
      if (parts.length >= 2) {
        const tProp = parts[0]
        const tDesc = parts[1]
        switch (tProp) {
          case 't': ttype = integer(tDesc); break
          case 'p': tdata = tDesc; break
        }
      }
    }
    executeMessage(symbol('#notify'), ttype, tdata, tMsg.connection.getID())
  }

  handleSystemBroadcast(tMsg) {
    let tMsgContent = tMsg.content
    tMsgContent = replaceChunks(tMsgContent, '\r', '\n')
    tMsgContent = replaceChunks(tMsgContent, '<br>', '\n')
    executeMessage(symbol('#alert'), [{ Msg: tMsgContent }])
  }

  handleCheckSum(tMsg) {
    getObject(symbol('#session')).set('user_checksum', tMsg.content)
  }

  handleAvailableBadges(tMsg) {
    const tBadgeList = []
    const tBadgeCount = tMsg.connection.GetIntFrom()
    for (let i = 0; i < tBadgeCount; i++) {
      tBadgeList.push(tMsg.connection.GetStrFrom())
    }
    const tChosenBadgeCount = tMsg.connection.GetIntFrom()
    const tChosenBadges = {}
    for (let i = 0; i < tChosenBadgeCount; i++) {
      const tBadgeIndex = tMsg.connection.GetIntFrom()
      const tBadgeID = tMsg.connection.GetStrFrom()
      tChosenBadges[tBadgeIndex] = tBadgeID
    }
    getObject('session').set('available_badges', tBadgeList)
    getObject('session').set('chosen_badges', tChosenBadges)
  }

  handleRights(tMsg) {
    const tSession = getObject(symbol('#session'))
    const tRights = []
    let tPrivilegeFound = true
    while (tPrivilegeFound) {
      const tPrivilege = tMsg.connection.GetStrFrom()
      if (!tPrivilege || tPrivilege === EMPTY) {
        tPrivilegeFound = false
        continue
      }
      tRights.push(tPrivilege)
    }
    tSession.set('user_rights', tRights)
    return true
  }

  handleErr(tMsg) {
    error(this, 'Error from server: ' + tMsg.content, symbol('#handleErr'), symbol('#dummy'))
    if (tMsg.content.includes('login incorrect')) {
      // removeConnection - placeholder
      this.getComponent().setaProp(symbol('#pOkToLogin'), 0)
      if (getObject(symbol('#session')).exists('failed_password')) {
        openNetPage(getText('login_forgottenPassword_url'))
        this.getInterface().showLogin()
        executeMessage(symbol('#externalLinkClick'), null)
        return false
      } else {
        getObject(symbol('#session')).set('failed_password', 1)
        this.getInterface().showLogin()
        executeMessage(symbol('#alert'), [{ Msg: 'Alert_WrongNameOrPassword' }])
      }
    } else if (tMsg.content.includes('mod_warn')) {
      const parts = tMsg.content.split('/')
      const tTextStr = parts.slice(1).join('/')
      executeMessage(symbol('#alert'), [{ title: 'alert_warning' }, { Msg: tTextStr }, { modal: 1 }])
    } else if (tMsg.content.includes('Version not correct')) {
      executeMessage(symbol('#alert'), [{ Msg: 'alert_old_client' }])
    } else if (tMsg.content.includes('Duplicate session')) {
      this.getComponent().setaProp(symbol('#pOkToLogin'), 0)
      this.getInterface().showLogin()
      executeMessage(symbol('#alert'), [{ Msg: 'alert_duplicatesession' }])
    }
    return true
  }

  handleModAlert(tMsg) {
    const tConn = tMsg.connection
    if (!tConn) {
      error(this, 'Error in moderation alert.', symbol('#handleModerationAlert'), symbol('#minor'))
      return false
    }
    const tMessageText = tConn.GetStrFrom()
    const tURL = tConn.GetStrFrom()
    executeMessage(symbol('#alert'), [{ title: 'alert_warning' }, { Msg: tMessageText }, { modal: 1 }, { url: tURL || null }])
  }

  handleCryptoParameters(tMsg) {
    const tClientToServer = 1
    const tServerToClient = tMsg.connection.GetIntFrom() !== 0
    this.pCryptoParams = { ClientToServer: tClientToServer, ServerToClient: tServerToClient }
    if (tClientToServer) {
      this.responseWithPublicKey()
    } else if (tServerToClient) {
      error(this, 'Server to client encryption only is not supported.', symbol('#handleCryptoParameters'), symbol('#minor'))
      return tMsg.connection.disconnect(1)
    } else {
      this.startNewSession()
    }
    return true
  }

  responseWithPublicKey() {
    // Crypto placeholder - simplified
    const tConnection = getConnection(getVariable('connection.info.id'))
    // In production this would do Diffie-Hellman key exchange
    tConnection.send('GENERATEKEY', [{ string: '' }])
  }

  handleServerSecretKey(tMsg) {
    // Crypto placeholder - simplified
    this.startNewSession()
  }

  handleEndOfCryptoParams(tMsg) {
    this.startNewSession()
  }

  handleHotelLogout(tMsg) {
    const tLogoutMsgId = tMsg.connection.GetIntFrom()
    switch (tLogoutMsgId) {
      case -1:
        this.getComponent().disconnect()
        this.getInterface().showDisconnect()
        break
      case 1:
        openNetPage(getText('url_logged_out'), 'self')
        break
      case 2:
        openNetPage(getText('url_logout_concurrent'), 'self')
        break
      case 3:
        openNetPage(getText('url_logout_timeout'), 'self')
        break
    }
  }

  handleSoundSetting(tMsg) {
    const tstate = tMsg.connection.GetIntFrom()
    // setSoundState - placeholder
    executeMessage(symbol('#soundSettingChanged'), tstate)
  }

  handlePossibleAchievements(tMsg) {
    const tConn = tMsg.connection
    const tAchievements = {}
    const tCount = tConn.GetIntFrom()
    for (let i = 0; i < tCount; i++) {
      const tTypeID = tConn.GetIntFrom()
      const tLevel = tConn.GetIntFrom()
      const tBadgeID = tConn.GetStrFrom()
      tAchievements[tBadgeID] = { type: tTypeID, level: tLevel, badge: tBadgeID }
    }
    if (!objectExists(symbol('#session'))) {
      return error(this, 'Session object not found.', symbol('#handlePossibleUserAchievements'), symbol('#major'))
    }
    getObject(symbol('#session')).set('possible_achievements', tAchievements)
  }

  handleAchievementNotification(tMsg) {
    const tConn = tMsg.connection
    const ttype = tConn.GetIntFrom()
    const tLevel = tConn.GetIntFrom()
    const tBadgeID = tConn.GetStrFrom()
    const tRemovedBadgeID = tConn.GetStrFrom()
    if (!objectExists(symbol('#session'))) {
      return error(this, 'Session object not found.', symbol('#handleAchievementNotification'), symbol('#major'))
    }
    const tSession = getObject(symbol('#session'))
    const tAchievements = tSession.GET('possible_achievements')
    let tNotify = false
    if (tAchievements) {
      const keys = Object.keys(tAchievements)
      for (const key of keys) {
        const tAchievement = tAchievements[key]
        if (tAchievement && tAchievement.type === ttype && tAchievement.level <= tLevel) {
          delete tAchievements[key]
          tNotify = true
        }
      }
    }
    if (tNotify) {
      executeMessage(symbol('#achievementsUpdated'))
    }
    const tBadges = tSession.GET('available_badges') || []
    tBadges.push(tBadgeID)
    executeMessage(symbol('#badgeReceived'), tBadgeID)
    const tPos = tBadges.indexOf(tRemovedBadgeID)
    if (tPos > 0) {
      tBadges.splice(tPos, 1)
      executeMessage(symbol('#badgeRemoved'), tRemovedBadgeID)
    }
    this.getComponent().sendGetBadges()
  }

  startNewSession() {
    this.getComponent().SetDisconnectErrorState('start_session')
    const tConnection = getConnection(getVariable('connection.info.id'))
    const tClientURL = ''
    const tExtVarsURL = ''
    tConnection.send('VERSIONCHECK', [{ integer: getIntVariable('client.version.id') }, { string: tClientURL }, { string: tExtVarsURL }])
    tConnection.send('UNIQUEID', [{ string: '' }])
    tConnection.send('GET_SESSION_PARAMETERS')
  }

  hideLogin(tMsg) {
    this.getInterface().hideLogin()
  }

  handleLatencyTest(tMsg) {
    const tID = tMsg.connection.GetIntFrom()
    this.getComponent().handleLatencyTest(tID)
  }

  regMsgList(tBool) {
    const tMsgs = {}
    tMsgs['-1'] = symbol('#handleDisconnect')
    tMsgs['0'] = symbol('#handleHello')
    tMsgs['1'] = symbol('#handleServerSecretKey')
    tMsgs['2'] = symbol('#handleRights')
    tMsgs['3'] = symbol('#handleLoginOK')
    tMsgs['5'] = symbol('#handleUserObj')
    tMsgs['33'] = symbol('#handleErr')
    tMsgs['35'] = symbol('#handleUserBanned')
    tMsgs['50'] = symbol('#handlePing')
    tMsgs['52'] = symbol('#handleEPSnotify')
    tMsgs['139'] = symbol('#handleSystemBroadcast')
    tMsgs['141'] = symbol('#handleCheckSum')
    tMsgs['161'] = symbol('#handleModAlert')
    tMsgs['229'] = symbol('#handleAvailableBadges')
    tMsgs['257'] = symbol('#handleSessionParameters')
    tMsgs['277'] = symbol('#handleCryptoParameters')
    tMsgs['278'] = symbol('#handleEndOfCryptoParams')
    tMsgs['287'] = symbol('#handleHotelLogout')
    tMsgs['308'] = symbol('#handleSoundSetting')
    tMsgs['436'] = symbol('#handlePossibleAchievements')
    tMsgs['437'] = symbol('#handleAchievementNotification')
    tMsgs['354'] = symbol('#handleLatencyTest')
    const tCmds = {}
    tCmds['TRY_LOGIN'] = 756
    tCmds['VERSIONCHECK'] = 1170
    tCmds['UNIQUEID'] = 813
    tCmds['GET_INFO'] = 7
    tCmds['GET_CREDITS'] = 8
    tCmds['GETAVAILABLEBADGES'] = 157
    tCmds['GETSELECTEDBADGES'] = 159
    tCmds['GET_SESSION_PARAMETERS'] = 1817
    tCmds['PONG'] = 196
    tCmds['GENERATEKEY'] = 2002
    tCmds['SSO'] = 204
    tCmds['INIT_CRYPTO'] = 206
    tCmds['SECRETKEY'] = 207
    tCmds['GET_SOUND_SETTING'] = 228
    tCmds['GET_POSSIBLE_ACHIEVEMENTS'] = 370
    tCmds['TEST_LATENCY'] = 315
    tCmds['REPORT_LATENCY'] = 316
    const tConn = getVariable('connection.info.id')
    if (tBool) {
      registerListener(tConn, this.getID(), tMsgs)
      registerCommands(tConn, this.getID(), tCmds)
    } else {
      unregisterListener(tConn, this.getID(), tMsgs)
      unregisterCommands(tConn, this.getID(), tCmds)
    }
    return true
  }
}
