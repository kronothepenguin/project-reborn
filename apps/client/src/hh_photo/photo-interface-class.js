// hh_photo/2_Photo Interface Class.ls → photo-interface-class.js
// Photo interface - manages camera window, live/still modes, zoom, noise animation

import {
  symbol,
  voidP,
  member,
  getmemnum,
  createMember,
  removeMember,
  memberExists,
  removeMember,
  point,
  TAB,
  EMPTY,
  updateStage,
  theStage,
  theDate,
  theLongTime,
  receiveUpdate,
  removeUpdate,
  hideWindows,
  showWindows,
} from '../../core/lingo-runtime.js'
import { registerMessage, unregisterMessage, executeMessage } from '../../fuse_client/broker-manager-api.js'
import { windowExists, createWindow, getWindow, removeWindow } from '../../fuse_client/window-api.js'
import { getConnection, connectionExists } from '../../fuse_client/connection-api.js'
import { getVariable } from '../../fuse_client/variable-api.js'
import { getThread, threadExists } from '../../fuse_client/core-thread-api.js'

export class PhotoInterfaceClass {
  constructor() {
    this.pWindowID = symbol('#photo_camera_window')
    this.pmode = null
    this.pCamMember = null
    this.pCamShotImage = null
    this.pDisplaymem = null
    this.pZoomLevel = 1
    this.pHNoiseCenter = 0
    this.pVNoiseCenter = 0
    this.pDialogId = symbol('#camera_dialog')
    this.pHandItemData = null
    this.pNoiseDirH = 1
    this.pNoiseDirV = 1
  }

  construct() {
    const memNum = createMember('__cam_display_mem', 'bitmap')
    this.pCamMember = member(memNum)
    this.pNoiseDirH = 1
    this.pNoiseDirV = 1
    return true
  }

  deconstruct() {
    unregisterMessage(symbol('#leaveRoom'), this.getID())
    unregisterMessage(symbol('#changeRoom'), this.getID())
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID)
    }
    if (windowExists(this.pDialogId)) {
      removeWindow(this.pDialogId)
    }
    if (memberExists('__cam_display_mem')) {
      removeMember('__cam_display_mem')
    }
    removeUpdate(this.getID())
    return true
  }

  getID() {
    return 'hh_photo.interface'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  open() {
    if (!createWindow(this.pWindowID)) {
      return false
    }
    const tWndObj = getWindow(this.pWindowID)
    tWndObj.merge('photo_camera.window')
    tWndObj.moveTo(100, 100)
    tWndObj.registerProcedure(symbol('#eventProcCameraMouseDown'), this.getID(), symbol('#mouseDown'))
    tWndObj.registerProcedure(symbol('#eventProcCameraMouseUp'), this.getID(), symbol('#mouseUp'))
    tWndObj.registerProcedure(symbol('#eventProcCameraMouseEnter'), this.getID(), symbol('#mouseEnter'))
    tWndObj.registerProcedure(symbol('#eventProcCameraMouseLeave'), this.getID(), symbol('#mouseLeave'))
    this.pmode = symbol('#live')
    this.pDisplaymem = tWndObj.getElement('cam_display').getProperty(symbol('#buffer'))
    this.setCameraToLiveMode()
    this.setButtonHilites()
    this.updateFilm()
    tWndObj.getElement('cam_savetxt').setProperty(symbol('#visible'), 0)
    getConnection(getVariable('connection.room.id')).send('CARRYITEM', '20')
    registerMessage(symbol('#leaveRoom'), this.getID(), symbol('#close'))
    registerMessage(symbol('#changeRoom'), this.getID(), symbol('#close'))
    return receiveUpdate(this.getID())
  }

  close() {
    if (connectionExists(getVariable('connection.room.id'))) {
      getConnection(getVariable('connection.room.id')).send('STOP', 'CarryItem')
    }
    this.pmode = symbol('#closed')
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID)
    }
    if (windowExists(this.pDialogId)) {
      removeWindow(this.pDialogId)
    }
    removeUpdate(this.getID())
    unregisterMessage(symbol('#leaveRoom'), this.getID())
    unregisterMessage(symbol('#changeRoom'), this.getID())
    return true
  }

  updateFilm() {
    if (windowExists(this.pWindowID)) {
      getWindow(this.pWindowID).getElement('photo_picnumber').setText(this.getComponent().getFilm())
    }
  }

  update() {
    if (!windowExists(this.pWindowID)) {
      return removeUpdate(this.getID())
    }
    if (this.pmode === symbol('#live')) {
      const tWndObj = getWindow(this.pWindowID)
      const tDispWidth = tWndObj.getElement('cam_display').getProperty(symbol('#width'))
      const tDispHeight = tWndObj.getElement('cam_display').getProperty(symbol('#height'))
      const tDispLocX = tWndObj.getElement('cam_display').getProperty(symbol('#locH'))
      const tDispLocY = tWndObj.getElement('cam_display').getProperty(symbol('#locV'))
      const tVertElem = tWndObj.getElement('cam_display_noise_vertical')
      let tLocX = tVertElem.getProperty(symbol('#locH'))
      let tLocY = tVertElem.getProperty(symbol('#locV')) + this.pNoiseDirV
      if (tLocY >= (tDispLocY + tDispHeight - tVertElem.getProperty(symbol('#height')))) {
        this.pNoiseDirV = -1
      } else if (tLocY <= tDispLocY) {
        this.pNoiseDirV = 1
      }
      tVertElem.moveTo(tLocX, tLocY)
      const tHorElem = tWndObj.getElement('cam_display_noise_horizontal')
      tLocX = tHorElem.getProperty(symbol('#locH')) + this.pNoiseDirH
      tLocY = tHorElem.getProperty(symbol('#locV'))
      if (tLocX >= (tDispLocX + tDispWidth - tHorElem.getProperty(symbol('#width')))) {
        this.pNoiseDirH = -1
      } else if (tLocX <= tDispLocX) {
        this.pNoiseDirH = 1
      }
      tHorElem.moveTo(tLocX, tLocY)
    }
  }

  setCameraToLiveMode() {
    const tWndObj = getWindow(this.pWindowID)
    tWndObj.getElement('cam_display_noise_horizontal').setProperty(symbol('#visible'), 1)
    tWndObj.getElement('cam_display_noise_horizontal').setProperty(symbol('#blend'), 100)
    tWndObj.getElement('cam_display_noise_vertical').setProperty(symbol('#visible'), 1)
    tWndObj.getElement('cam_display_noise_vertical').setProperty(symbol('#blend'), 100)
    tWndObj.getElement('cam_display').setProperty(symbol('#buffer'), this.pDisplaymem)
    tWndObj.getElement('cam_display').setProperty(symbol('#blend'), 100)
    tWndObj.getElement('cam_display').setProperty(symbol('#ink'), 33)
    return true
  }

  eventProcCameraMouseEnter(tEvent, tSprID, tParam) {
    if (!getThread(symbol('#room')).getComponent().roomExists(null)) {
      return false
    }
    this.showHelpLine(tSprID)
  }

  eventProcCameraMouseLeave(tEvent, tSprID, tParam) {
    if (!getThread(symbol('#room')).getComponent().roomExists(null)) {
      return false
    }
    this.hideHelpLine(tSprID)
  }

  eventProcCameraMouseDown(tEvent, tSprID, tParam) {
    if (!getThread(symbol('#room')).getComponent().roomExists(null)) {
      return false
    }
    const tWndObj = getWindow(this.pWindowID)
    switch (tSprID) {
      case 'cam_shoot':
        if (this.pmode !== symbol('#live')) {
          return
        }
        getConnection(getVariable('connection.room.id')).send('USEITEM', '20' + TAB + '1500')
        this.pZoomLevel = 1
        tWndObj.getElement('cam_display').setProperty(symbol('#visible'), 0)
        tWndObj.getElement('cam_display_noise_horizontal').setProperty(symbol('#visible'), 0)
        tWndObj.getElement('cam_display_noise_vertical').setProperty(symbol('#visible'), 0)
        getThread(symbol('#room')).getComponent().getBalloon().hideBalloons()
        const tHandVis = getThread(symbol('#room')).getInterface().getContainer().getVisual()
        if (tHandVis !== 0) {
          tHandVis.hide()
        }
        hideWindows()
        executeMessage(symbol('#takingPhoto'))
        tWndObj.show()
        updateStage()
        const tRect = tWndObj.getElement('cam_display').getProperty(symbol('#rect'))
        this.pCamShotImage = { width: tRect.right - tRect.left, height: tRect.bottom - tRect.top }
        this.pCamMember.image = this.pCamShotImage
        this.pCamMember.regPoint = point(0, 0)
        getThread(symbol('#room')).getComponent().getBalloon().showBalloons()
        if (tHandVis !== 0) {
          tHandVis.show()
        }
        showWindows()
        executeMessage(symbol('#photoTaken'))
        const tDispElem = tWndObj.getElement('cam_display')
        tDispElem.setProperty(symbol('#buffer'), this.pCamMember)
        tDispElem.setProperty(symbol('#visible'), 1)
        tDispElem.setProperty(symbol('#blend'), 100)
        tDispElem.setProperty(symbol('#ink'), 41)
        updateStage()
        this.pmode = symbol('#still')
        break
      case 'cam_release':
        if (this.pmode === symbol('#still')) {
          this.setCameraToLiveMode()
          this.pmode = symbol('#live')
        }
        break
      case 'cam_save':
        if (this.pmode === symbol('#still') && this.getComponent().getFilm() > 0) {
          tWndObj.getElement('cam_display').setProperty(symbol('#blend'), 50)
          tWndObj.getElement('cam_savetxt').setProperty(symbol('#visible'), 1)
          tWndObj.getElement('cam_display').setProperty(symbol('#buffer'), this.pDisplaymem)
          this.getComponent().storePicture(this.pCamMember, tWndObj.getElement('photo_text').getText())
          this.pmode = symbol('#save')
        } else {
          // beep(1)
        }
        if (this.pmode === symbol('#still') && this.getComponent().getFilm() === 0) {
          executeMessage(symbol('#alert'), [{ Msg: 'cam_save_nofilm' }])
        }
        break
      case 'cam_zoom_in':
        if (this.pmode === symbol('#still')) {
          if (this.pZoomLevel < 11) {
            this.pZoomLevel = this.pZoomLevel + 1
          }
          this.zoom()
        } else {
          // beep(1)
        }
        break
      case 'cam_zoom_out':
        if (this.pmode === symbol('#still')) {
          this.pZoomLevel = this.pZoomLevel - 1
          if (this.pZoomLevel < 1) {
            this.pZoomLevel = 1
          }
          this.zoom()
        } else {
          // beep(1)
        }
        break
    }
    this.setButtonHilites()
  }

  eventProcCameraMouseUp(tEvent, tSprID, tParam) {
    if (!getThread(symbol('#room')).getComponent().roomExists(null)) {
      return false
    }
    const tWndObj = getWindow(this.pWindowID)
    switch (tSprID) {
      case 'cam_close':
        this.close()
        return true
    }
  }

  setButtonHilites() {
    if (!windowExists(this.pWindowID)) {
      return false
    }
    switch (this.pmode) {
      case symbol('#live'):
        this.hilite(['cam_shoot'])
        this.unhilite(['cam_release', 'cam_save', 'cam_zoom_in', 'cam_zoom_out', 'cam_txtscreen'])
        break
      case symbol('#still'):
        if (this.getComponent().getFilm() > 0) {
          this.hilite(['cam_save', 'cam_zoom_in', 'cam_zoom_out'])
        }
        this.unhilite(['cam_shoot'])
        this.hilite(['cam_release', 'cam_txtscreen'])
        break
      case symbol('#save'):
        this.unhilite(['cam_shoot', 'cam_release', 'cam_save', 'cam_zoom_in', 'cam_zoom_out', 'cam_txtscreen'])
        break
    }
  }

  saveOk() {
    if (!windowExists(this.pWindowID)) {
      return false
    }
    this.pmode = symbol('#live')
    this.setCameraToLiveMode()
    getWindow(this.pWindowID).getElement('cam_savetxt').setProperty(symbol('#visible'), 0)
    this.setButtonHilites()
    this.updateFilm()
    return true
  }

  hilite(tElements) {
    const tWndObj = getWindow(this.pWindowID)
    for (const tID of tElements) {
      const tName = tID + '_hi'
      tWndObj.getElement(tID).setProperty(symbol('#buffer'), member(getmemnum(tName)))
    }
  }

  unhilite(tElements) {
    const tWndObj = getWindow(this.pWindowID)
    for (const tID of tElements) {
      tWndObj.getElement(tID).setProperty(symbol('#buffer'), member(getmemnum(tID)))
    }
  }

  zoom() {
    const tRect = { left: 0, top: 0, right: this.pCamShotImage.width, bottom: this.pCamShotImage.height }
    const tH = this.pCamShotImage.height / this.pZoomLevel
    const tW = this.pCamShotImage.width / this.pZoomLevel
    tRect.top = (this.pCamShotImage.height / 2) - (tH / 2)
    tRect.bottom = tRect.top + tH
    tRect.left = (this.pCamShotImage.width / 2) - (tW / 2)
    tRect.right = tRect.left + tW
    // copyPixels placeholder
  }

  showHelpLine(tElemID) {
    const tElement = getWindow(this.pWindowID).getElement('cam_statusbar')
    let tText = null
    switch (tElemID) {
      case 'cam_shoot': tText = 'Take a photo'; break
      case 'cam_release': tText = 'Release photo'; break
      case 'cam_save': tText = 'Save photo'; break
      case 'cam_zoom_in': tText = 'Zoom in'; break
      case 'cam_zoom_out': tText = 'Zoom out'; break
      case 'cam_txtscreen': tText = 'Add text'; break
      case 'photo_picnumber': tText = 'Film remaining'; break
    }
    if (tText !== null) {
      tElement.setText(tText)
    }
  }

  hideHelpLine() {
    getWindow(this.pWindowID).getElement('cam_statusbar').setText(EMPTY)
  }

  handItemSelect(tdata) {
    if (getThread(symbol('#room')).getComponent().getRoomID() !== 'private') {
      this.open()
    } else {
      this.pHandItemData = tdata
      createWindow(this.pDialogId, 'habbo_simple.window', 300, 300)
      const tWndObj = getWindow(this.pDialogId)
      tWndObj.merge('camera_dialog.window')
      tWndObj.registerProcedure(symbol('#eventProcDialogMouseUp'), this.getID(), symbol('#mouseUp'))
    }
  }

  eventProcDialogMouseUp(tEvent, tElemID, tParam) {
    switch (tElemID) {
      case 'camera_dialog_open':
        this.open()
        removeWindow(this.pDialogId)
        break
      case 'camera_dialog_place':
        removeWindow(this.pDialogId)
        if (threadExists(symbol('#room'))) {
          getThread(symbol('#room')).getInterface().getContainer().startItemPlacing(this.pHandItemData)
        }
        break
    }
  }
}
