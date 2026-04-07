// hh_photo/3_Photo Component Class.ls → photo-component-class.js
// Photo component - manages photo cache, film count, storing/receiving photos

import {
  symbol,
  voidP,
  length,
  EMPTY,
  chars,
  getUniqueID,
} from '../../core/lingo-runtime.js'
import { registerMessage, unregisterMessage } from '../../fuse_client/broker-manager-api.js'
import { getConnection } from '../../fuse_client/connection-api.js'
import { getVariable } from '../../fuse_client/variable-api.js'
import { getStringServices } from '../../fuse_client/string-services-api.js'
import { addMessageToBinaryQueue, storeBinaryData, retrieveBinaryData } from '../../fuse_client/binary-api.js'
import { getObject } from '../../fuse_client/object-api.js'
import { windowExists, createWindow, getWindow, removeWindow, memberExists, getmemnum, member, createMember, removeMember } from '../../core/lingo-runtime.js'
import { getWriter, removeWriter, createWriter } from '../../fuse_client/write-api.js'

export class PhotoComponentClass {
  constructor() {
    this.pPhotoCache = {}
    this.pPhotoWindow = null
    this.pWindowID = symbol('#photo_window')
    this.pItemId = null
    this.pPhotoId = null
    this.pLastPhotoData = null
    this.pLocX = 0
    this.pLocY = 0
    this.pPhotoMember = null
    this.pFilm = 0
    this.pPhotoTime = null
    this.pPhotoText = null
  }

  construct() {
    this.pPhotoCache = {}
    createWriter(symbol('#photo_timestamp_writer_black'), [{ color: { r: 0, g: 0, b: 0 } }])
    createWriter(symbol('#photo_timestamp_writer_white'), [{ color: { r: 255, g: 255, b: 240 } }])
    return true
  }

  deconstruct() {
    if (this.pPhotoMember) {
      removeMember(this.pPhotoMember.name)
      this.pPhotoMember = null
    }
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID)
    }
    removeWriter(symbol('#photo_timestamp_writer_black'))
    removeWriter(symbol('#photo_timestamp_writer_white'))
    return true
  }

  getID() {
    return 'hh_photo.component'
  }

  getInterface() {
    return this.pInterface
  }

  setInterface(tIface) {
    this.pInterface = tIface
  }

  storePicture(tmember, tText) {
    if (!voidP(tText)) {
      tText = getStringServices().convertSpecialChars(tText, 1)
    }
    const tCS = this.countCS(tmember.image)
    const tdata = { image: tmember.media, time: Date.now(), cs: tCS }
    addMessageToBinaryQueue('PHOTOTXT /' + tText)
    storeBinaryData(tdata, this.getID())
    this.pLastPhotoData = tdata
  }

  binaryDataStored(tID) {
    this.getInterface().saveOk()
    this.pPhotoCache[tID] = this.pLastPhotoData
    this.pLastPhotoData = null
  }

  binaryDataReceived(tdata, tID) {
    if (typeof tdata !== 'object' || tdata === null || Array.isArray(tdata)) {
      return false
    }
    if (tdata.image === null || tdata.image === undefined) {
      return false
    }
    const tText = this.pPhotoText
    this.pPhotoCache[tID] = tdata
    if (!windowExists(this.pWindowID)) {
      return false
    }
    getWindow(this.pWindowID).getElement('photo_text').setText(tText)
    if (!this.pPhotoMember) {
      const memNum = createMember(getUniqueID(), 'bitmap')
      this.pPhotoMember = member(memNum)
    }
    this.pPhotoMember.media = tdata.image
    let tCheckSumOk = false
    if (tdata.cs !== null && tdata.cs !== undefined) {
      tCheckSumOk = this.countCS(this.pPhotoMember.image) === tdata.cs
    }
    if (!tCheckSumOk) {
      this.pPhotoMember.media = member(getmemnum('photo_invalid')).media
    } else {
      // Timestamp rendering - simplified placeholder
    }
    getWindow(this.pWindowID).getElement('photo_picture').setProperty(symbol('#buffer'), this.pPhotoMember)
  }

  openPhoto(tItemID, tLocX, tLocY) {
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID)
    }
    this.pLocX = tLocX
    this.pLocY = tLocY
    registerMessage(symbol('itemdata_received' + tItemID), this.getID(), symbol('#setItemData'))
    getConnection(getVariable('connection.room.id')).send('G_IDATA', tItemID)
  }

  countCS(tImg) {
    const tL = [3, 2, 73, 28, 83, 21, 43, 90, 92, 91, 37, 4, 3, 84, 12, 102, 103, 108, 97, 43, 44, 89, 109, 65, 61, -4, 76]
    let tA = 0
    const tW = tImg.width
    const tH = tImg.height
    for (let i = 1; i <= 100; i++) {
      tA = (tA + ((i % tW) * (i * i % tH) * tL[(i % tL.length)])) % 85000
    }
    return tA
  }

  setFilm(tFilm) {
    this.pFilm = tFilm
    this.getInterface().updateButtonHilites()
    this.getInterface().updateFilm()
  }

  getFilm() {
    return this.pFilm
  }

  setItemData(tMsg) {
    this.pItemId = tMsg[symbol('#id')]
    const tLine1 = tMsg[symbol('#text')].split('\n')[0]
    const tLine1Words = tLine1.split(' ')
    const tAuthId = tLine1Words[0]
    this.pPhotoTime = tLine1Words.slice(1).join(' ')
    this.pPhotoText = tMsg[symbol('#text')].split('\n').slice(1).join('\n')
    this.pPhotoText = this.convertScandinavian(this.pPhotoText)
    unregisterMessage(symbol('itemdata_received' + this.pItemId), this.getID())
    if (this.pLocX > 500) {
      this.pLocX = 500
    }
    if (this.pLocY < 100) {
      this.pLocY = 100
    }
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID)
    }
    if (!createWindow(this.pWindowID)) {
      return false
    }
    const tWndObj = getWindow(this.pWindowID)
    tWndObj.merge('photo_window.window')
    tWndObj.moveTo(this.pLocX, this.pLocY)
    tWndObj.registerProcedure(symbol('#eventProcPhotoMouseDown'), this.getID(), symbol('#mouseDown'))
    if (this.pPhotoCache[this.pPhotoId] === undefined) {
      retrieveBinaryData(this.pItemId, tAuthId, this.getID())
    } else {
      this.binaryDataReceived(this.pPhotoCache[this.pPhotoId], this.pPhotoId)
    }
    const tOwner = getObject(symbol('#session')).GET('room_owner')
    const tCanRemovePhotos = getObject(symbol('#session')).GET('user_rights').indexOf('fuse_remove_photos') !== -1
    if (!tOwner && !tCanRemovePhotos) {
      tWndObj.getElement('photo_remove').setProperty(symbol('#visible'), 0)
    }
  }

  convertScandinavian(tString) {
    if (tString.length < 6) {
      return tString
    }
    const tEncArray = { '&AUML;': 'Ä', '&OUML;': 'Ö', '&auml;': 'ä', '&ouml;': 'ö' }
    let tOutputStr = EMPTY
    for (let i = 0; i < tString.length; i++) {
      const tChar = tString[i]
      if (tChar !== '&') {
        tOutputStr += tChar
        continue
      }
      const tChunkArr = tString.substring(i, i + 6)
      const tChunkScan = tEncArray[tChunkArr]
      if (tChunkScan !== undefined) {
        tOutputStr += tChunkScan
        i += 5
        continue
      }
      tOutputStr += '&'
    }
    return tOutputStr
  }

  eventProcPhotoMouseDown(tEvent, tElemID, tParam) {
    switch (tElemID) {
      case 'photo_close':
        removeWindow(this.pWindowID)
        break
      case 'photo_remove':
        getConnection(getVariable('connection.room.id')).send('REMOVEITEM', this.pItemId)
        removeWindow(this.pWindowID)
        break
    }
  }
}
