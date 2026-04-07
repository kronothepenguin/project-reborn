// hh_guide/4_Guide Component Class.ls → guide-component-class.js
// Guide component - manages guide tool state and invitations

import {
  symbol,
  voidP,
} from '../core/lingo-runtime.js'
import { registerMessage, unregisterMessage } from '../fuse_client/broker-manager-api.js'
import { getVariable } from '../fuse_client/variable-api.js'
import { connectionExists, getConnection } from '../fuse_client/connection-api.js'

export class GuideComponentClass {
  constructor() {
    this.pState = symbol('#disabled')
    this.pInvitationData = {}
  }

  construct() {
    this.pState = symbol('#disabled')
    this.pInvitationData = {}
    registerMessage(symbol('#userlogin'), this.getID(), symbol('#Init'))
    registerMessage(symbol('#showInvitation'), this.getID(), symbol('#setInvitation'))
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#userlogin'), this.getID())
    unregisterMessage(symbol('#showInvitation'), this.getID())
    return true
  }

  getID() {
    return 'hh_guide.component'
  }

  getInterface() {
    return this.pInterface
  }

  setInterface(tIface) {
    this.pInterface = tIface
  }

  setInvitation(tInvitationData) {
    if (typeof tInvitationData !== 'object' || tInvitationData === null || Array.isArray(tInvitationData)) {
      tInvitationData = {}
    }
    this.pInvitationData = tInvitationData
    this.setState(symbol('#ready'))
  }

  getInvitation() {
    return this.pInvitationData
  }

  cancelInvitation() {
    this.pInvitationData = {}
    this.setState(symbol('#waiting'))
  }

  getState() {
    return this.pState
  }

  setState(tstate) {
    if (tstate === this.pState) {
      return true
    }
    this.pState = tstate
    this.getInterface().update()
  }

  Init() {
    if (connectionExists(getVariable('connection.info.id'))) {
      getConnection(getVariable('connection.info.id')).send('MSG_INIT_TUTORSERVICE')
    }
  }

  startWaiting() {
    if (connectionExists(getVariable('connection.info.id'))) {
      getConnection(getVariable('connection.info.id')).send('MSG_WAIT_FOR_TUTOR_INVITATIONS')
    }
    this.setState(symbol('#waiting'))
  }

  cancelWaiting() {
    if (connectionExists(getVariable('connection.info.id'))) {
      getConnection(getVariable('connection.info.id')).send('MSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS')
    }
    this.setState(symbol('#enabled'))
  }

  acceptInvitation() {
    if (typeof this.pInvitationData !== 'object' || this.pInvitationData === null || Array.isArray(this.pInvitationData)) {
      return false
    }
    const tSenderId = this.pInvitationData[symbol('#userID')]
    if (voidP(tSenderId)) {
      return false
    }
    if (connectionExists(getVariable('connection.info.id'))) {
      getConnection(getVariable('connection.info.id')).send('MSG_ACCEPT_TUTOR_INVITATION', [{ string: tSenderId }])
    }
    this.setState(symbol('#enabled'))
  }

  rejectInvitation() {
    const tSenderId = this.pInvitationData[symbol('#userID')]
    if (voidP(tSenderId)) {
      return false
    }
    if (connectionExists(getVariable('connection.info.id'))) {
      getConnection(getVariable('connection.info.id')).send('MSG_REJECT_TUTOR_INVITATION', [{ string: tSenderId }])
    }
    this.setState(symbol('#enabled'))
  }
}
