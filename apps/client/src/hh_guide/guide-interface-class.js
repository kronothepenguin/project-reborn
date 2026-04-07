// hh_guide/3_Guide Interface Class.ls → guide-interface-class.js
// Guide interface - manages guide tool window, icon, animations

import {
  symbol,
  voidP,
  objectp,
  value,
  createMember,
} from '../../core/lingo-runtime.js'
import { registerMessage, unregisterMessage, executeMessage } from '../../fuse_client/broker-manager-api.js'
import { getVariable } from '../../fuse_client/variable-api.js'
import { windowExists, createWindow, getWindow, removeWindow } from '../../fuse_client/window-api.js'
import { memberExists, getmemnum, member } from '../../fuse_client/resource-api.js'
import { createObject, removeObject } from '../../fuse_client/object-api.js'
import { createTimeout, timeoutExists, removeTimeout } from '../../fuse_client/timeout-api.js'
import { getConnection, connectionExists } from '../../fuse_client/connection-api.js'

export class GuideInterfaceClass {
  constructor() {
    this.pIcon = null
    this.pWindowID = 'guide_tool_window_id'
    this.pGuideToolAnimTimeoutID = 'guide_tool_anim_update_timeout_id'
    this.pAnimFrame = 0
    this.pUseAlertSound = true
  }

  construct() {
    this.pIcon = createObject('guide_tool_icon_object', 'Guide Tool Icon Class')
    this.pUseAlertSound = true
    registerMessage(symbol('#toggleGuideTool'), this.getID(), symbol('#toggleGuideTool'))
    registerMessage(symbol('#gamesystem_constructed'), this.getID(), symbol('#hideAll'))
    registerMessage(symbol('#gamesystem_deconstructed'), this.getID(), symbol('#update'))
    return true
  }

  deconstruct() {
    removeObject(this.pIcon.getID())
    unregisterMessage(symbol('#toggleGuideTool'), this.getID())
    unregisterMessage(symbol('#gamesystem_constructed'), this.getID())
    unregisterMessage(symbol('#gamesystem_deconstructed'), this.getID())
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID)
    }
    if (timeoutExists(this.pGuideToolAnimTimeoutID)) {
      removeTimeout(this.pGuideToolAnimTimeoutID)
    }
    return true
  }

  getID() {
    return 'hh_guide.interface'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  hideAll() {
    this.hideGuideToolIcon()
    this.closeGuideTool()
  }

  showGuideToolIcon() {
    if (objectp(this.pIcon)) {
      this.pIcon.show()
    }
  }

  hideGuideToolIcon() {
    if (objectp(this.pIcon)) {
      this.pIcon.hide()
    }
  }

  toggleGuideTool() {
    if (!windowExists(this.pWindowID)) {
      return this.openGuideTool()
    }
    const tWndObj = getWindow(this.pWindowID)
    if (tWndObj.getProperty(symbol('#visible'))) {
      this.closeGuideTool()
    } else {
      this.openGuideTool()
    }
  }

  openGuideTool() {
    if (windowExists(this.pWindowID)) {
      const tWindow = getWindow(this.pWindowID)
      tWindow.show()
    } else {
      const tstate = this.getComponent().getState()
      this.createGuideToolWindow(tstate)
    }
    return true
  }

  createGuideToolWindow(tstate) {
    let tUseDefaultLoc = true
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID)
      tUseDefaultLoc = false
    }
    let tLayout = null
    switch (tstate) {
      case symbol('#disabled'):
        return false
      case symbol('#enabled'):
        tLayout = 'guide_tool_start.window'
        break
      case symbol('#waiting'):
        tLayout = 'guide_tool_waiting.window'
        break
      case symbol('#ready'):
        tLayout = 'guide_tool_invite.window'
        break
    }
    createWindow(this.pWindowID, tLayout)
    const tWndObj = getWindow(this.pWindowID)
    tWndObj.registerProcedure(symbol('#eventProcGuideTool'), this.getID(), symbol('#mouseUp'))
    if (tUseDefaultLoc) {
      const tloc = value(getVariable('guidetool.window.loc'))
      tWndObj.moveTo(tloc[0], tloc[1])
    }
    if (timeoutExists(this.pGuideToolAnimTimeoutID)) {
      removeTimeout(this.pGuideToolAnimTimeoutID)
    }
    switch (tstate) {
      case symbol('#waiting'):
        createTimeout(this.pGuideToolAnimTimeoutID, 250, symbol('#updateGuideToolAnim'), this.getID(), null, 0)
        break
      case symbol('#ready'):
        if (this.pUseAlertSound) {
          // playSound - placeholder
        }
        const tInvitationData = this.getComponent().getInvitation()
        if (tWndObj.elementExists('guide_tool_header')) {
          const tName = tInvitationData[symbol('#name')]
          const tElem = tWndObj.getElement('guide_tool_header')
          tElem.setText(tName)
        }
        break
    }
    this.updateCheckbox()
  }

  updateCheckbox() {
    if (!windowExists(this.pWindowID)) {
      return false
    }
    const tWndObj = getWindow(this.pWindowID)
    if (!tWndObj.elementExists('guide_tool_checkbox')) {
      return false
    }
    if (!memberExists('button.checkbox.on') || !memberExists('button.checkbox.off')) {
      return false
    }
    const tImageOn = member(getmemnum('button.checkbox.on')).image
    const tImageOff = member(getmemnum('button.checkbox.off')).image
    const tElem = tWndObj.getElement('guide_tool_checkbox')
    if (this.pUseAlertSound) {
      tElem.feedImage(tImageOn)
    } else {
      tElem.feedImage(tImageOff)
    }
  }

  updateGuideToolAnim() {
    if (!windowExists(this.pWindowID)) {
      return false
    }
    const tWndObj = getWindow(this.pWindowID)
    if (!tWndObj.elementExists('guide_tool_progress_bar')) {
      return false
    }
    const tElem = tWndObj.getElement('guide_tool_progress_bar')
    this.pAnimFrame = this.pAnimFrame + 1
    if (this.pAnimFrame > 3) {
      this.pAnimFrame = 1
    }
    const tMemName = 'nuh_search_' + this.pAnimFrame
    if (memberExists(tMemName)) {
      tElem.setProperty(symbol('#image'), member(getmemnum(tMemName)).image)
    }
  }

  closeGuideTool() {
    if (windowExists(this.pWindowID)) {
      const tWndObj = getWindow(this.pWindowID)
      tWndObj.hide()
    }
  }

  update() {
    const tstate = this.getComponent().getState()
    this.updateIcon(tstate)
    this.updateToolWindow(tstate)
  }

  isMinimized() {
    if (!windowExists(this.pWindowID)) {
      return true
    }
    const tWndObj = getWindow(this.pWindowID)
    return !tWndObj.getProperty(symbol('#visible'))
  }

  updateIcon(tstate) {
    if (tstate === symbol('#disabled')) {
      this.pIcon.hide()
    } else {
      this.pIcon.show()
    }
    if (tstate === symbol('#ready')) {
      this.pIcon.setFlashing(1)
    } else {
      this.pIcon.setFlashing(0)
    }
  }

  updateToolWindow(tstate) {
    const tIsMinimized = this.isMinimized()
    this.createGuideToolWindow(tstate)
    if (tIsMinimized && windowExists(this.pWindowID)) {
      const tWndObj = getWindow(this.pWindowID)
      tWndObj.hide()
    }
  }

  eventProcGuideTool(tEvent, tSprID, tProp) {
    switch (tSprID) {
      case 'guide_tool_start':
        this.getComponent().startWaiting()
        break
      case 'guide_tool_close':
        this.closeGuideTool()
        break
      case 'guide_tool_cancel':
        this.getComponent().cancelWaiting()
        this.closeGuideTool()
        break
      case 'guide_tool_accept':
        this.getComponent().acceptInvitation()
        this.closeGuideTool()
        break
      case 'guide_tool_reject':
        this.getComponent().rejectInvitation()
        this.closeGuideTool()
        break
      case 'guide_tool_checkbox':
      case 'guide_tool_checkbox_text':
        this.pUseAlertSound = !this.pUseAlertSound
        this.updateCheckbox()
        break
    }
  }
}
