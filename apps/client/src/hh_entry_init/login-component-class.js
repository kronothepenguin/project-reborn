// hh_entry_init/7_Login Component Class.ls → login-component-class.js
// Login component - manages login state, latency testing, connection lifecycle

import {
  symbol,
  voidP,
  stringp,
  string,
  EMPTY,
  error,
} from '../core/lingo-runtime.js'
import { registerMessage, unregisterMessage, executeMessage } from '../fuse_client/broker-manager-api.js'
import { getVariable, variableExists, getIntVariable } from '../fuse_client/variable-api.js'
import { connectionExists, getConnection } from '../fuse_client/connection-api.js'
import { createObject, removeObject, objectExists } from '../fuse_client/object-api.js'
import { createTimeout, timeoutExists } from '../fuse_client/timeout-api.js'
import { sendProcessTracking } from '../fuse_client/special-services-api.js'

export class LoginComponentClass {
  constructor() {
    this.pOkToLogin = 0
    this.pLatencyTestID = 1
    this.pLatencyValueList = []
    this.pLatencyTestTimeStampList = {}
    this.pLatencyTotalValue = 0
    this.pLatencyValueCount = 0
    this.pLatencyClearedValue = 0
    this.pLatencyClearedCount = 0
    this.pLatencyReportIndex = 0
    this.pLatencyReported = 0
    this.pLatencyReportDelta = 0
    this.pLatencyTestInterval = 0
    this.pLatencyTestTimeoutID = 'latency.test.timeout'
    this.pDisconnectErrorState = 'socket_init'
  }

  construct() {
    this.pOkToLogin = 0
    this.pLatencyTestID = 1
    this.pLatencyValueList = []
    this.pLatencyTestTimeStampList = {}
    this.pLatencyTotalValue = 0
    this.pLatencyValueCount = 0
    this.pLatencyClearedValue = 0
    this.pLatencyClearedCount = 0
    this.pLatencyReportIndex = 0
    this.pLatencyReported = 0
    this.pLatencyReportDelta = 0

    if (variableExists('latencytest.interval')) {
      this.pLatencyTestInterval = getVariable('latencytest.interval')
    }
    if (variableExists('latencytest.report.index')) {
      this.pLatencyReportIndex = getVariable('latencytest.report.index')
    }
    if (variableExists('latencytest.report.delta')) {
      this.pLatencyReportDelta = getVariable('latencytest.report.delta')
    }

    this.pDisconnectErrorState = 'socket_init'
    registerMessage(symbol('#Initialize'), this.getID(), symbol('#initA'))
    registerMessage(symbol('#openConnection'), this.getID(), symbol('#openConnection'))
    registerMessage(symbol('#closeConnection'), this.getID(), symbol('#disconnect'))
    registerMessage(symbol('#performLogin'), this.getID(), symbol('#sendLogin'))
    registerMessage(symbol('#loginIsOk'), this.getID(), symbol('#setLoginOk'))
    return true
  }

  deconstruct() {
    this.pOkToLogin = 0
    if (objectExists('Figure_System')) removeObject('Figure_System')
    if (objectExists('Figure_Preview')) removeObject('Figure_Preview')
    if (objectExists('nav_problem_obj')) removeObject('nav_problem_obj')
    if (objectExists(symbol('#statsBroker'))) removeObject(symbol('#statsBroker'))
    if (objectExists(symbol('#statsBrokerJs'))) removeObject(symbol('#statsBrokerJs'))
    if (objectExists(symbol('#getServerDate'))) removeObject(symbol('#getServerDate'))
    if (objectExists('Help_Tooltip_Manager')) removeObject('Help_Tooltip_Manager')
    unregisterMessage(symbol('#openConnection'), this.getID())
    unregisterMessage(symbol('#closeConnection'), this.getID())
    if (connectionExists(getVariable('connection.info.id'))) {
      return this.disconnect()
    }
    return true
  }

  getID() {
    return 'hh_entry_init.login.component'
  }

  getInterface() {
    return this.pInterface
  }

  setInterface(tIface) {
    this.pInterface = tIface
  }

  initA() {
    if (getIntVariable('figurepartlist.loaded', 1) === 0) {
      return this.delay(250, symbol('#initA'))
    }
    return this.delay(1000, symbol('#initB'))
  }

  initB() {
    let tUseSSO = 0
    if (variableExists('use.sso.ticket')) {
      tUseSSO = getVariable('use.sso.ticket')
      if (variableExists('sso.ticket') && tUseSSO) {
        const tSsoTicket = string(getVariable('sso.ticket'))
        if (tSsoTicket.length > 1) {
          getObject(symbol('#session')).set(symbol('#SSO_ticket'), tSsoTicket)
          return this.openConnection()
        }
      }
    }
    if (tUseSSO === 0) {
      return this.getInterface().showLogin()
    } else {
      executeMessage(symbol('#alert'), [{ Msg: 'Alert_generic_login_error' }])
    }
  }

  sendLogin(tConnection) {
    this.setaProp(symbol('#pOkToLogin'), 1)
    if (voidP(tConnection)) {
      tConnection = getConnection(getVariable('connection.info.id'))
    }
    if (objectExists('nav_problem_obj')) {
      removeObject('nav_problem_obj')
    }
    if (this.isOkToLogin()) {
      let tSsoTicket = 0
      if (getObject(symbol('#session')).exists('SSO_ticket')) {
        tSsoTicket = getObject(symbol('#session')).GET('SSO_ticket')
      }
      if (tSsoTicket !== 0) {
        sendProcessTracking(15)
        return tConnection.send('SSO', [{ string: tSsoTicket }])
      } else {
        const tUserName = getObject(symbol('#session')).GET(symbol('#userName'))
        const tPassword = getObject(symbol('#session')).GET(symbol('#Password'))
        if (!stringp(tUserName) || !stringp(tPassword)) {
          return this.removeConnection(tConnection.getID())
        }
        if (tUserName === EMPTY || tPassword === EMPTY) {
          return this.removeConnection(tConnection.getID())
        }
        return tConnection.send('TRY_LOGIN', [{ string: tUserName }, { string: tPassword }])
      }
    }
    return true
  }

  openConnection() {
    this.setaProp(symbol('#pOkToLogin'), 1)
    this.connect()
  }

  connect() {
    const tHost = getVariable('connection.info.host')
    const tPort = getIntVariable('connection.info.port')
    const tConn = getVariable('connection.info.id')
    if (voidP(tHost) || voidP(tPort)) {
      return error(this, 'Server port/host data not found!', symbol('#connect'), symbol('#major'))
    }
    // createConnection - placeholder
    if (!objectExists(symbol('#getServerDate'))) {
      createObject(symbol('#getServerDate'), 'Server Date Class')
    }
    if (!objectExists('nav_problem_obj')) {
      createObject('nav_problem_obj', 'Connection Problem Class')
    }
    return true
  }

  disconnect() {
    const tConn = getVariable('connection.info.id')
    if (connectionExists(tConn)) {
      // removeConnection - placeholder
      return true
    } else {
      return error(this, 'Connection not found!', symbol('#disconnect'), symbol('#minor'))
    }
  }

  setAllowLogin() {
    this.pOkToLogin = 1
  }

  isOkToLogin() {
    return this.pOkToLogin
  }

  setaProp(tProp, tValue) {
    if (tProp === symbol('#pOkToLogin')) {
      this.pOkToLogin = tValue
    }
  }

  initLatencyTest() {
    if (this.pLatencyTestInterval <= 0) return false
    if (!timeoutExists(this.pLatencyTestTimeoutID)) {
      createTimeout(this.pLatencyTestTimeoutID, this.pLatencyTestInterval, symbol('#sendLatencyTest'), this.getID(), null, 0)
    }
    return true
  }

  sendLatencyTest() {
    if (!connectionExists(getVariable('connection.info.id'))) return false
    const tConnection = getConnection(getVariable('connection.info.id'))
    if (tConnection.send('TEST_LATENCY', [{ integer: this.pLatencyTestID }])) {
      this.pLatencyTestTimeStampList[string(this.pLatencyTestID)] = Date.now()
      this.pLatencyTestID = this.pLatencyTestID + 1
      return true
    }
    return false
  }

  sendGetBadges() {
    if (!connectionExists(getVariable('connection.info.id'))) return false
    const tConnection = getConnection(getVariable('connection.info.id'))
    return tConnection.send('GETSELECTEDBADGES')
  }

  handleLatencyTest(tID) {
    if (voidP(this.pLatencyTestTimeStampList[string(tID)])) return false
    if (!connectionExists(getVariable('connection.info.id'))) return false
    const tConnection = getConnection(getVariable('connection.info.id'))
    const tDelta = Date.now() - this.pLatencyTestTimeStampList[string(tID)]
    delete this.pLatencyTestTimeStampList[string(tID)]
    this.pLatencyValueList.push(tDelta)
    this.pLatencyValueCount = this.pLatencyValueCount + 1
    if (this.pLatencyValueList.length === this.pLatencyReportIndex && this.pLatencyReportIndex > 0) {
      for (let i = 0; i < this.pLatencyValueList.length; i++) {
        this.pLatencyTotalValue = this.pLatencyTotalValue + this.pLatencyValueList[i]
      }
      const tLatency = this.pLatencyTotalValue / this.pLatencyValueCount
      for (let i = 0; i < this.pLatencyValueList.length; i++) {
        if (this.pLatencyValueList[i] < (tLatency * 2)) {
          this.pLatencyClearedValue = this.pLatencyClearedValue + this.pLatencyValueList[i]
          this.pLatencyClearedCount = this.pLatencyClearedCount + 1
        }
      }
      const tLatencyCleared = this.pLatencyClearedValue / this.pLatencyClearedCount
      if (Math.abs(tLatency - this.pLatencyReported) > this.pLatencyReportDelta || this.pLatencyReported === 0) {
        this.pLatencyReported = tLatency
        tConnection.send('REPORT_LATENCY', [{ integer: tLatency }, { integer: tLatencyCleared }, { integer: this.pLatencyValueCount }])
      }
      this.pLatencyValueList = []
    }
    return true
  }

  SetDisconnectErrorState(tError) {
    this.pDisconnectErrorState = tError
  }

  GetDisconnectErrorState() {
    return this.pDisconnectErrorState
  }

  delay(tMs, tHandler) {
    // setTimeout placeholder
  }
}
