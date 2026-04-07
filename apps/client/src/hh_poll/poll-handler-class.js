// hh_poll/5_Poll Handler Class.ls → poll-handler-class.js
// Poll handler - handles poll-related server messages

import { symbol } from '../core/lingo-runtime.js'
import { getVariable } from '../fuse_client/variable-api.js'
import { registerListener, unregisterListener, registerCommands, unregisterCommands } from '../fuse_client/connection-api.js'

export class PollHandlerClass {
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
    return 'hh_poll.handler'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  handle_poll_offer(tMsg) {
    const tPollID = tMsg.connection.GetIntFrom()
    const tPollDescription = tMsg.connection.GetStrFrom()
    const tdata = {}
    tdata[symbol('#pollID')] = tPollID
    tdata[symbol('#pollDescription')] = tPollDescription
    this.getComponent().offerPoll(tdata)
  }

  handle_poll_contents(tMsg) {
    const tPollID = tMsg.connection.GetIntFrom()
    const tPollHeadLine = tMsg.connection.GetStrFrom()
    const tPollThankYou = tMsg.connection.GetStrFrom()
    this.getComponent().setThanks(tPollThankYou)
    const tCount = tMsg.connection.GetIntFrom()
    for (let i = 0; i < tCount; i++) {
      const tdata = {}
      tdata[symbol('#pollID')] = tPollID
      tdata[symbol('#pollHeadLine')] = tPollHeadLine
      tdata[symbol('#questionID')] = tMsg.connection.GetIntFrom()
      tdata[symbol('#questionNumber')] = tMsg.connection.GetIntFrom()
      tdata[symbol('#questionCount')] = tCount
      tdata[symbol('#questionType')] = tMsg.connection.GetIntFrom()
      tdata[symbol('#questionText')] = tMsg.connection.GetStrFrom()
      const tQuestType = tdata[symbol('#questionType')]
      if (tQuestType === 1 || tQuestType === 2) {
        const tSelectionData = {}
        const tSelectionCount = tMsg.connection.GetIntFrom()
        tSelectionData[symbol('#minSelect')] = tMsg.connection.GetIntFrom()
        tSelectionData[symbol('#maxSelect')] = tMsg.connection.GetIntFrom()
        tSelectionData[symbol('#questions')] = []
        for (let j = 0; j < tSelectionCount; j++) {
          tSelectionData[symbol('#questions')].push(tMsg.connection.GetStrFrom())
        }
        tdata[symbol('#selectionData')] = tSelectionData
      }
      this.getComponent().parseQuestion(tdata)
    }
  }

  handle_poll_error(tMsg) {
    this.getComponent().pollError()
  }

  regMsgList(tBool) {
    const tMsgs = {}
    tMsgs['316'] = symbol('#handle_poll_offer')
    tMsgs['317'] = symbol('#handle_poll_contents')
    tMsgs['318'] = symbol('#handle_poll_error')
    const tCmds = {}
    tCmds['POLL_START'] = 234
    tCmds['POLL_REJECT'] = 235
    tCmds['POLL_ANSWER'] = 236

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
