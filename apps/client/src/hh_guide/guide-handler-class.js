// hh_guide/5_Guide Handler Class.ls → guide-handler-class.js
// Guide handler - handles guide/tutor server messages

import { symbol } from '../core/lingo-runtime.js'
import { getVariable } from '../fuse_client/variable-api.js'
import { registerListener, unregisterListener, registerCommands, unregisterCommands } from '../fuse_client/connection-api.js'
import { executeMessage } from '../fuse_client/broker-manager-api.js'

export class GuideHandlerClass {
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
    return 'hh_guide.handler'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  handleInvitation(tMsg) {
    const tConn = tMsg.connection
    if (tConn === 0 || !tConn) {
      return false
    }
    const tInvitationData = {}
    tInvitationData[symbol('#userID')] = tConn.GetStrFrom()
    tInvitationData[symbol('#name')] = tConn.GetStrFrom()
    this.getComponent().setInvitation(tInvitationData)
    return true
  }

  handleInvitationFollowFailed(tMsg) {
    executeMessage(symbol('#alert'), 'invitation_follow_failed')
  }

  handleInvitationCancelled(tMsg) {
    this.getComponent().cancelInvitation()
  }

  handleInitTutorServiceStatus(tMsg) {
    const tConn = tMsg.connection
    const tstate = tConn.GetIntFrom()
    switch (tstate) {
      case 1:
        this.getComponent().setState(symbol('#enabled'))
        break
      case 2:
      case 3:
        this.getComponent().setState(symbol('#disabled'))
        break
    }
  }

  handleEnableTutorServiceStatus(tMsg) {
    const tConn = tMsg.connection
    const tstate = tConn.GetIntFrom()
    switch (tstate) {
      case 2:
        executeMessage(symbol('#alert'), 'guide_tool_friendlist_full')
        this.getComponent().setState(symbol('#enabled'))
        break
      case 3:
        executeMessage(symbol('#alert'), 'guide_tool_service_disabled')
        this.getComponent().setState(symbol('#disabled'))
        break
      case 4:
        executeMessage(symbol('#alert'), 'guide_tool_max_newbies')
        this.getComponent().setState(symbol('#disabled'))
        break
    }
    const tGuidePoints = tConn.GetIntFrom()
  }

  regMsgList(tBool) {
    const tMsgs = {}
    tMsgs['355'] = symbol('#handleInvitation')
    tMsgs['359'] = symbol('#handleInvitationFollowFailed')
    tMsgs['360'] = symbol('#handleInvitationCancelled')
    tMsgs['425'] = symbol('#handleInitTutorServiceStatus')
    tMsgs['426'] = symbol('#handleEnableTutorServiceStatus')
    const tCmds = {}
    tCmds['MSG_ACCEPT_TUTOR_INVITATION'] = 357
    tCmds['MSG_REJECT_TUTOR_INVITATION'] = 358
    tCmds['MSG_INIT_TUTORSERVICE'] = 360
    tCmds['MSG_WAIT_FOR_TUTOR_INVITATIONS'] = 362
    tCmds['MSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS'] = 363

    const tConnID = getVariable('connection.info.id')
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
