// hh_poll/3_Poll Interface Class.ls → poll-interface-class.js
// Poll interface - manages poll windows (offer, question, thanks, confirm)

import {
  symbol,
  voidP,
  error,
  replaceChunks,
  value,
  offset,
  length,
  member,
  createMember,
  getmemnum,
} from '../core/lingo-runtime.js'
import { registerMessage, unregisterMessage, executeMessage } from '../fuse_client/broker-manager-api.js'
import { windowExists, createWindow, getWindow, removeWindow } from '../fuse_client/window-api.js'
import { getText } from '../fuse_client/text-api.js'
import { memberExists } from '../fuse_client/resource-api.js'

export class PollInterfaceClass {
  constructor() {
    this.pPollWindowID = null
    this.pOfferWindowID = null
    this.pThanksWindowID = null
    this.pConfirmWindowID = null
  }

  construct() {
    this.pPollWindowID = getText('poll_window')
    this.pOfferWindowID = getText('poll_offer_window')
    this.pThanksWindowID = getText('poll_thanks_window')
    this.pConfirmWindowID = getText('poll_confirm_window')
    registerMessage(symbol('#leaveRoom'), this.getID(), symbol('#hideWindows'))
    registerMessage(symbol('#changeRoom'), this.getID(), symbol('#hideWindows'))
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#leaveRoom'), this.getID())
    unregisterMessage(symbol('#changeRoom'), this.getID())
    return true
  }

  getID() {
    return 'hh_poll.interface'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  showOffer(tDescription) {
    this.hideOffer()
    if (!createWindow(this.pOfferWindowID, 'habbo_full.window', null, null)) {
      return error(this, 'Failed to open Poll offer window!!!', symbol('#showOffer'))
    } else {
      const tWndObj = getWindow(this.pOfferWindowID)
      tWndObj.registerClient(this.getID())
      tWndObj.registerProcedure(symbol('#eventProcOffer'), this.getID(), symbol('#mouseUp'))
      tWndObj.registerProcedure(symbol('#eventProcOffer'), this.getID(), symbol('#mouseDown'))
      if (!tWndObj.merge('poll_offer.window')) {
        return tWndObj.close()
      }
      const tElem = tWndObj.getElement('offer_scrollbar')
      if (tElem !== 0) {
        tElem.setProperty(symbol('#visible'), 0)
      }
      const tTextElem = tWndObj.getElement('poll_offer_text')
      if (tTextElem !== 0) {
        tTextElem.setText(tDescription)
      }
      if (!tWndObj.merge('poll_purkka.window')) {
        return tWndObj.close()
      }
    }
    return true
  }

  hideOffer() {
    if (windowExists(this.pOfferWindowID)) {
      return removeWindow(this.pOfferWindowID)
    }
    return false
  }

  showQuestion() {
    const tWndObj = getWindow(this.pPollWindowID)
    if (tWndObj !== 0) {
      return true
    }
    if (!this.getComponent().getQuestionAvailable()) {
      this.showThanks()
      return false
    }
    if (!createWindow(this.pPollWindowID, 'habbo_full.window', null, null)) {
      return error(this, 'Failed to open Poll window!!!', symbol('#showPoll'))
    } else {
      const tWndObj = getWindow(this.pPollWindowID)
      tWndObj.registerClient(this.getID())
      tWndObj.registerProcedure(symbol('#eventProcQuestion'), this.getID(), symbol('#mouseUp'))
      tWndObj.registerProcedure(symbol('#eventProcQuestion'), this.getID(), symbol('#mouseDown'))
      if (!tWndObj.merge('poll_question_main.window')) {
        return tWndObj.close()
      }
      const tDescElem = tWndObj.getElement('poll_description')
      if (tDescElem !== 0) {
        tDescElem.setText(this.getComponent().getPollHeadLine())
      }
      const tNumElem = tWndObj.getElement('poll_question_number')
      if (tNumElem !== 0) {
        let tText = getText('poll_question_number')
        tText = replaceChunks(tText, '%number%', this.getComponent().getQuestionNumber())
        tText = replaceChunks(tText, '%count%', this.getComponent().getQuestionCount())
        tNumElem.setText(tText)
      }
      const tScrollElem = tWndObj.getElement('question_scrollbar')
      if (tScrollElem !== 0) {
        tScrollElem.setProperty(symbol('#visible'), 0)
      }
      const tQuestType = this.getComponent().getQuestionType()
      if (tQuestType === 3 || tQuestType === 4) {
        if (!tWndObj.merge('poll_question_open.window')) {
          return tWndObj.close()
        }
      } else if (tQuestType === 1 || tQuestType === 2) {
        const tSelectionCount = this.getComponent().getSelectionCount()
        for (let i = 1; i <= tSelectionCount; i++) {
          if (!this.duplicateWindowRecording('poll_question_selection', '_1', '_' + i)) {
            return tWndObj.close()
          }
          if (!tWndObj.merge('poll_question_selection_' + i + '.window')) {
            return tWndObj.close()
          }
          const tSelScrollElem = tWndObj.getElement('selection_scrollbar_' + i)
          if (tSelScrollElem !== 0) {
            tSelScrollElem.setProperty(symbol('#visible'), 0)
          }
          const tSelTextElem = tWndObj.getElement('poll_selection_text_' + i)
          if (tSelTextElem !== 0) {
            tSelTextElem.setText(this.getComponent().getSelectionText(i))
          }
        }
        this.updateSelectionButtons()
      }
    }
    return true
  }

  hideQuestion() {
    if (windowExists(this.pPollWindowID)) {
      return removeWindow(this.pPollWindowID)
    }
    return false
  }

  showThanks() {
    this.hideThanks()
    if (!createWindow(this.pThanksWindowID, 'habbo_full.window', null, null)) {
      return error(this, 'Failed to open Poll thanks window!!!', symbol('#showThanks'))
    } else {
      const tWndObj = getWindow(this.pThanksWindowID)
      tWndObj.registerClient(this.getID())
      tWndObj.registerProcedure(symbol('#eventProcThanks'), this.getID(), symbol('#mouseUp'))
      tWndObj.registerProcedure(symbol('#eventProcThanks'), this.getID(), symbol('#mouseDown'))
      if (!tWndObj.merge('poll_thank_you.window')) {
        return tWndObj.close()
      }
      const tThanksElem = tWndObj.getElement('thanks_scrollbar')
      if (tThanksElem !== 0) {
        tThanksElem.setProperty(symbol('#visible'), 0)
      }
      const tThanksTextElem = tWndObj.getElement('poll_thanks_text')
      if (tThanksTextElem !== 0) {
        const tText = this.getComponent().getThanks()
        tThanksTextElem.setText(tText)
      }
      if (!tWndObj.merge('poll_purkka.window')) {
        return tWndObj.close()
      }
    }
    return true
  }

  hideThanks() {
    if (windowExists(this.pThanksWindowID)) {
      return removeWindow(this.pThanksWindowID)
    }
    return false
  }

  hideConfirm() {
    if (windowExists(this.pConfirmWindowID)) {
      return removeWindow(this.pConfirmWindowID)
    }
    return false
  }

  hideWindows() {
    this.hideQuestion()
    this.hideConfirm()
    this.hideOffer()
    this.hideThanks()
  }

  confirmAction(tAction) {
    const tResult = this.getComponent().confirmAction(tAction)
    if (tResult) {
      if (!windowExists(this.pConfirmWindowID)) {
        if (!createWindow(this.pConfirmWindowID, 'habbo_full.window', null, null, symbol('#modal'))) {
          return error(this, 'Failed to open Poll confirm window!!!', symbol('#confirmAction'))
        } else {
          const tWndObj = getWindow(this.pConfirmWindowID)
          tWndObj.registerClient(this.getID())
          tWndObj.registerProcedure(symbol('#eventProcConfirm'), this.getID(), symbol('#mouseUp'))
          if (!tWndObj.merge('habbo_decision_dialog.window')) {
            return tWndObj.close()
          }
          const tElemA = tWndObj.getElement('habbo_decision_text_a')
          if (tElemA !== 0) {
            tElemA.setText(getText('poll_confirm_' + tAction))
          }
          const tElemB = tWndObj.getElement('habbo_decision_text_b')
          if (tElemB !== 0) {
            tElemB.setText(getText('poll_confirm_' + tAction + '_long'))
          }
          tWndObj.center()
          tWndObj.moveBy(0, -30)
        }
      }
    }
    return tResult
  }

  ShowAlert(ttype) {
    const tTextId = 'poll_alert_' + ttype
    executeMessage(symbol('#alert'), [{ Msg: tTextId }, { modal: 1 }])
  }

  duplicateWindowRecording(tNameBase, tOriginalIDPart, tTargetIDPart) {
    const tSourceMemName = tNameBase + tOriginalIDPart + '.window'
    const tSourceMember = member(getmemnum(tSourceMemName))
    if (!tSourceMember || tSourceMember.name !== tSourceMemName) {
      return false
    }
    const tTargetMemName = tNameBase + tTargetIDPart + '.window'
    if (memberExists(tTargetMemName)) {
      return true
    }
    const tTargetMemberNum = createMember(tTargetMemName, 'field', 0)
    if (tTargetMemberNum === 0) {
      return error(this, 'Could not create a new member for copying: ' + tTargetMemName, symbol('#duplicateWindowRecording'))
    }
    return true
  }

  updateSelectionButtons() {
    const tWndObj = getWindow(this.pPollWindowID)
    if (tWndObj === 0) {
      return false
    }
    const tSelectionCount = this.getComponent().getSelectionCount()
    const tSelectionMax = this.getComponent().getSelectionMaxCount()
    const tImageList = tSelectionMax === 1
      ? ['button.radio.on', 'button.radio.off']
      : ['button.checkbox.on', 'button.checkbox.off']
    for (let i = 1; i <= tSelectionCount; i++) {
      const tElem = tWndObj.getElement('poll_selection_button_' + i)
      if (tElem !== 0) {
        if (this.getComponent().getSelectionState(i)) {
          tElem.feedImage(member(getmemnum(tImageList[0])).image)
          continue
        }
        tElem.feedImage(member(getmemnum(tImageList[1])).image)
      }
    }
    return true
  }

  eventProcOffer(tEvent, tSprID, tParam, tWndID) {
    if (tEvent === symbol('#mouseUp')) {
      switch (tSprID) {
        case 'close':
        case 'poll_offer_cancel':
          this.getComponent().rejectPoll()
          this.hideOffer()
          break
        case 'poll_offer_ok':
          this.getComponent().acceptPoll()
          this.hideOffer()
          break
      }
    }
  }

  eventProcQuestion(tEvent, tSprID, tParam, tWndID) {
    if (tEvent === symbol('#mouseUp')) {
      switch (tSprID) {
        case 'close':
        case 'poll_question_cancel':
          this.confirmAction('cancel')
          break
        case 'poll_question_ok': {
          const tWndObj = getWindow(this.pPollWindowID)
          if (tWndObj !== 0) {
            const tElem = tWndObj.getElement('poll_answer')
            if (tElem !== 0) {
              const tText = tElem.getText()
              this.getComponent().setAnswerText(tText)
            }
          }
          const tRetVal = this.getComponent().sendAnswer()
          if (tRetVal) {
            this.hideQuestion()
            this.showQuestion()
          } else {
            this.ShowAlert('answer_missing')
          }
          break
        }
      }
      if (offset('poll_selection_button_', tSprID) === 1) {
        const tIndex = value(tSprID.substring('poll_selection_button_'.length))
        if (this.getComponent().changeSelectionState(tIndex)) {
          this.updateSelectionButtons()
        } else {
          this.ShowAlert('invalid_selection')
        }
      }
    }
    return true
  }

  eventProcThanks(tEvent, tSprID, tParam, tWndID) {
    if (tEvent === symbol('#mouseUp')) {
      switch (tSprID) {
        case 'close':
        case 'poll_thanks_ok':
          this.hideThanks()
          break
      }
    }
    return true
  }

  eventProcConfirm(tEvent, tSprID, tParam, tWndID) {
    if (tEvent === symbol('#mouseUp')) {
      switch (tSprID) {
        case 'close':
        case 'habbo_decision_cancel':
          this.hideConfirm()
          break
        case 'habbo_decision_ok':
          this.getComponent().actionConfirmed()
          this.hideConfirm()
          break
      }
    }
    return true
  }
}
