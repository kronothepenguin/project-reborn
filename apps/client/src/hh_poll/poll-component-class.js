// hh_poll/4_Poll Component Class.ls → poll-component-class.js
// Poll component - manages poll data, questions, answers

import {
  symbol,
  voidP,
  value,
  EMPTY,
  error,
} from '../../core/lingo-runtime.js'
import { registerMessage, unregisterMessage } from '../../fuse_client/broker-manager-api.js'
import { getVariableValue } from '../../fuse_client/variable-api.js'
import { getConnection } from '../../fuse_client/connection-api.js'

export class PollComponentClass {
  constructor() {
    this.pQuestionList = []
    this.pQuestionIndex = 1
    this.pConfirmedAction = null
    this.pConnectionId = null
    this.pPollOfferID = null
    this.pThanksText = null
  }

  construct() {
    this.pQuestionList = []
    this.pQuestionIndex = 1
    this.pConnectionId = getVariableValue('connection.info.id')
    registerMessage(symbol('#show_poll_question'), this.getID(), symbol('#parseQuestion'))
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#show_poll_question'), this.getID())
    return true
  }

  getID() {
    return 'hh_poll.component'
  }

  getInterface() {
    return this.pInterface
  }

  setInterface(tIface) {
    this.pInterface = tIface
  }

  getQuestionAvailable() {
    if (this.pQuestionList.length >= this.pQuestionIndex) {
      return true
    }
    return false
  }

  getNewQuestion(tNext) {
    if (tNext) {
      if (this.pQuestionIndex < this.pQuestionList.length) {
        this.pQuestionIndex = this.pQuestionIndex + 1
      }
    } else {
      if (this.pQuestionIndex > 1) {
        this.pQuestionIndex = this.pQuestionIndex - 1
      }
    }
  }

  getPollHeadLine() {
    return this.getQuestionData(symbol('#pollHeadLine'))
  }

  getQuestionText() {
    return this.getQuestionData(symbol('#questionText'))
  }

  getQuestionNumber() {
    return this.getQuestionData(symbol('#questionNumber'))
  }

  getQuestionCount() {
    return this.getQuestionData(symbol('#questionCount'))
  }

  getQuestionType() {
    return this.getQuestionData(symbol('#questionType'))
  }

  getSelectionCount() {
    const tSelectionData = this.getQuestionData(symbol('#selectionData'))
    if (voidP(tSelectionData)) {
      return 0
    }
    const tQuestions = tSelectionData[symbol('#questions')]
    if (voidP(tQuestions)) {
      return 0
    }
    return tQuestions.length
  }

  getSelectionMinCount() {
    const tSelectionData = this.getQuestionData(symbol('#selectionData'))
    if (voidP(tSelectionData)) {
      return 0
    }
    if (voidP(tSelectionData[symbol('#minSelect')])) {
      return 0
    }
    return tSelectionData[symbol('#minSelect')]
  }

  getSelectionMaxCount() {
    const tSelectionData = this.getQuestionData(symbol('#selectionData'))
    if (voidP(tSelectionData)) {
      return 0
    }
    if (voidP(tSelectionData[symbol('#maxSelect')])) {
      return 0
    }
    return tSelectionData[symbol('#maxSelect')]
  }

  getSelectionText(tIndex) {
    const tSelectionData = this.getQuestionData(symbol('#selectionData'))
    if (voidP(tSelectionData)) {
      return EMPTY
    }
    const tQuestions = tSelectionData[symbol('#questions')]
    if (voidP(tQuestions)) {
      return EMPTY
    }
    if (tIndex < 1 || tIndex > tQuestions.length) {
      return EMPTY
    }
    return tQuestions[tIndex - 1]
  }

  getSelectionState(tIndex) {
    const tSelections = this.getQuestionData(symbol('#answerSelections'))
    if (voidP(tSelections)) {
      return 0
    }
    if (tIndex < 1 || tIndex > tSelections.length) {
      return 0
    }
    return tSelections[tIndex - 1]
  }

  changeSelectionState(tIndex) {
    const tSelections = this.getQuestionData(symbol('#answerSelections'))
    if (voidP(tSelections)) {
      return false
    }
    if (tIndex < 1 || tIndex > tSelections.length) {
      return false
    }
    const tMaxSelect = this.getSelectionMaxCount()
    if (tMaxSelect === 1) {
      const tstate = 1
      for (let i = tSelections.length - 1; i >= 0; i--) {
        tSelections[i] = 0
      }
    } else {
      const tstate = !tSelections[tIndex - 1]
      let tCount = 0
      for (let i = tSelections.length - 1; i >= 0; i--) {
        if (tSelections[i] !== 0) {
          tCount = tCount + 1
        }
      }
      if ((tCount + tstate) > tMaxSelect) {
        return false
      }
      tSelections[tIndex - 1] = tstate
    }
    return true
  }

  setAnswerText(tText) {
    if (this.pQuestionList.length < this.pQuestionIndex) {
      return false
    }
    this.pQuestionList[this.pQuestionIndex - 1][symbol('#answerText')] = tText
    return true
  }

  getAnswerText() {
    return this.getQuestionData(symbol('#answerText'))
  }

  getThanks() {
    return this.pThanksText
  }

  confirmAction(tAction) {
    this.pConfirmedAction = tAction
    return true
  }

  actionConfirmed() {
    if (this.pConfirmedAction === 'cancel') {
      this.cancelAnswer()
      this.getInterface().hideQuestion()
    }
  }

  sendAnswer() {
    if (!this.getQuestionAvailable()) {
      return false
    }
    const tQuestionIndex = this.pQuestionIndex
    for (let tIndex = 0; tIndex < tQuestionIndex; tIndex++) {
      this.pQuestionIndex = 1
      const tPollID = this.getQuestionData(symbol('#pollID'))
      const tQuestionID = this.getQuestionData(symbol('#questionID'))
      const tQuestionType = this.getQuestionData(symbol('#questionType'))
      const tReply = [{ integer: tPollID }, { integer: tQuestionID }]
      const tQuestType = this.getQuestionType()
      if (tQuestType === 1 || tQuestType === 2) {
        const tSelectionCount = this.getSelectionCount()
        const tMinSelect = this.getSelectionMinCount()
        let tSelected = 0
        const tSelectionList = []
        for (let i = 0; i < tSelectionCount; i++) {
          tSelectionList[i] = this.getSelectionState(i + 1)
          if (tSelectionList[i] !== 0) {
            tSelected = tSelected + 1
          }
        }
        if (tSelected < tMinSelect) {
          this.pQuestionIndex = tQuestionIndex - tIndex
          return false
        }
        tReply.push({ integer: tSelected })
        for (let i = 0; i < tSelectionList.length; i++) {
          if (tSelectionList[i] !== 0) {
            tReply.push({ integer: i + 1 })
          }
        }
      } else if (tQuestType === 3 || tQuestType === 4) {
        const tAnswer = this.getAnswerText()
        if (tAnswer.length === 0) {
          this.pQuestionIndex = tQuestionIndex - tIndex
          return false
        }
        const tAnswerText = this.getQuestionData(symbol('#answerText'))
        tReply.push({ string: tAnswerText })
      }
      const tConn = getConnection(this.pConnectionId)
      if (tConn !== 0 && tConn) {
        tConn.send('POLL_ANSWER', tReply)
      }
      this.pQuestionList.splice(0, 1)
    }
    this.pQuestionIndex = 1
    return true
  }

  cancelAnswer() {
    let tPollID = null
    for (let i = 0; i < this.pQuestionList.length; i++) {
      this.pQuestionIndex = i + 1
      const tPollIDNew = this.getQuestionData(symbol('#pollID'))
      const tQuestionID = this.getQuestionData(symbol('#questionID'))
      if (tPollIDNew !== tPollID) {
        tPollID = tPollIDNew
        const tReply = [{ integer: tPollID }, { integer: tQuestionID }]
        const tConn = getConnection(this.pConnectionId)
        if (tConn !== 0 && tConn) {
          tConn.send('POLL_CANCEL', tReply)
        }
      }
    }
    this.pQuestionList = []
    this.pQuestionIndex = 1
  }

  getQuestionData(tProperty) {
    if (this.pQuestionList.length < this.pQuestionIndex) {
      return EMPTY
    }
    return this.pQuestionList[this.pQuestionIndex - 1][tProperty]
  }

  setThanks(tText) {
    this.pThanksText = tText
  }

  offerPoll(tdata) {
    if (typeof tdata !== 'object' || tdata === null || Array.isArray(tdata)) {
      return false
    }
    if (voidP(tdata[symbol('#pollID')]) || voidP(tdata[symbol('#pollDescription')])) {
      return false
    }
    this.pPollOfferID = tdata[symbol('#pollID')]
    const tPollDescription = tdata[symbol('#pollDescription')]
    this.getInterface().showOffer(tPollDescription)
  }

  acceptPoll() {
    const tConn = getConnection(this.pConnectionId)
    if (tConn !== 0 && tConn) {
      tConn.send('POLL_START', [{ integer: this.pPollOfferID }])
    }
  }

  rejectPoll() {
    const tConn = getConnection(this.pConnectionId)
    if (tConn !== 0 && tConn) {
      tConn.send('POLL_REJECT', [{ integer: this.pPollOfferID }])
    }
  }

  parseQuestion(tdata) {
    if (!this.validateQuestion(tdata)) {
      return false
    }
    this.pQuestionList.push(tdata)
    tdata[symbol('#answerText')] = EMPTY
    tdata[symbol('#answerSelections')] = []
    const tTmpIndex = this.pQuestionIndex
    this.pQuestionIndex = this.pQuestionList.length
    const tSelectionCount = this.getSelectionCount()
    for (let i = 0; i < tSelectionCount; i++) {
      tdata[symbol('#answerSelections')].push(0)
    }
    this.pQuestionIndex = tTmpIndex
    this.getInterface().showQuestion()
  }

  validateQuestion(tdata) {
    if (typeof tdata !== 'object' || tdata === null || Array.isArray(tdata)) {
      return false
    }
    const tList = [symbol('#pollID'), symbol('#pollHeadLine'), symbol('#questionID'), symbol('#questionNumber'), symbol('#questionCount'), symbol('#questionType'), symbol('#questionText')]
    for (const tItem of tList) {
      if (voidP(tdata[tItem])) {
        return false
      }
    }
    const tQuestType = tdata[symbol('#questionType')]
    if (tQuestType === 1 || tQuestType === 2) {
      if (voidP(tdata[symbol('#selectionData')])) {
        return false
      }
      const tSelectionData = tdata[symbol('#selectionData')]
      const tListSelection = [symbol('#minSelect'), symbol('#maxSelect'), symbol('#questions')]
      for (const tItem of tListSelection) {
        if (voidP(tSelectionData[tItem])) {
          return false
        }
      }
      if (!Array.isArray(tSelectionData[symbol('#questions')])) {
        return false
      }
      if (tSelectionData[symbol('#questions')].length === 0) {
        return false
      }
      tSelectionData[symbol('#maxSelect')] = value(tSelectionData[symbol('#maxSelect')])
      if (tSelectionData[symbol('#maxSelect')] < 1) {
        return false
      }
      tSelectionData[symbol('#minSelect')] = value(tSelectionData[symbol('#minSelect')])
      if (tSelectionData[symbol('#minSelect')] > tSelectionData[symbol('#maxSelect')]) {
        return false
      }
    }
    return true
  }

  pollError() {
    this.getInterface().hideWindows()
    this.getInterface().ShowAlert('server_error')
  }
}
