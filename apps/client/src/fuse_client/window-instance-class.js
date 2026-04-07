// fuse_client/55_Window Instance Class.ls → window-instance-class.js
// Window instance - handles window UI with elements, drag, scale, and event routing

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  listp,
  integer,
  rect,
  point,
  error,
  call,
  member,
  memberExists,
  sprite,
  releaseSprite,
  removeMember,
  createPropList,
} from '../core/lingo-runtime.js'
import { getMember, getResourceManager } from './resource-api.js'
import { createObject, getObject, objectExists, getClassVariable } from './object-api.js'
import { receiveUpdate, removeUpdate, receivePrepare, removePrepare } from './object-api.js'
import { getSpriteManager } from './sprite-api.js'
import { variableExists } from './variable-api.js'

export class WindowInstanceClass {
  constructor() {
    this.pTitle = null
    this.pClientID = null
    this.pProcedures = createPropList()
    this.pLock = false
    this.pLocX = 0
    this.pLocY = 0
    this.pLocZ = 0
    this.pwidth = 0
    this.pheight = 0
    this.pModal = false
    this.pActive = false
    this.pVisible = true
    this.pDragFlag = false
    this.pDragOffset = [0, 0]
    this.pBoundary = rect(0, 0, 800, 600)
    this.pScaleFlag = false
    this.pScaleOffset = [0, 0]
    this.pElemList = createPropList()
    this.pMemberList = createPropList()
    this.pGroupData = []
    this.pSpriteList = createPropList()
    this.pSpecialIDList = ['drag', 'close', 'scale']
    this.pClientRect = [0, 0, 0, 0]
    this.pElemClsList = createPropList()
    this.pWindowMngr = null
    this.pID = null
  }

  construct() {
    this.pTitle = this.pID
    this.pLocX = 0
    this.pLocY = 0
    this.pLocZ = 0
    this.pwidth = 0
    this.pheight = 0
    this.pVisible = true
    this.pActive = false
    this.pLock = false
    this.pModal = false
    this.pSpriteList = createPropList()
    this.pScaleFlag = false
    this.pDragFlag = false
    this.pDragOffset = [0, 0]
    this.pBoundary = rect(0, 0, 800, 600)
    this.pClientID = null
    this.pMemberList = createPropList()
    this.pElemList = createPropList()
    this.pGroupData = []
    this.pClientRect = [0, 0, 0, 0]
    this.pSpecialIDList = ['drag', 'close', 'scale']
    this.pProcedures = this.createProcListTemplate()
    return true
  }

  deconstruct() {
    removeUpdate(this.pID)
    removePrepare(this.pID)
    const sprKeys = this.pSpriteList.keys()
    for (const key of sprKeys) {
      const tSpr = this.pSpriteList.getaProp(key)
      if (tSpr && tSpr.spriteNum) releaseSprite(tSpr.spriteNum)
    }
    const elemKeys = this.pElemList.keys()
    for (const key of elemKeys) {
      const elem = this.pElemList.getaProp(key)
      if (elem && elem.deconstruct) elem.deconstruct()
    }
    const memKeys = this.pMemberList.keys()
    for (const key of memKeys) {
      const mem = this.pMemberList.getaProp(key)
      if (mem && mem.name) removeMember(mem.name)
    }
    this.pElemList = createPropList()
    this.pSpriteList = createPropList()
    this.pMemberList = createPropList()
    this.pGroupData = []
    this.pClientID = ''
    this.pWindowMngr = null
    return true
  }

  define(tProps) {
    this.pLocX = tProps.locX
    this.pLocY = tProps.locY
    this.pLocZ = tProps.locZ
    this.pBoundary = tProps.boundary
    this.pElemClsList = tProps.elements
    this.pWindowMngr = tProps.manager
    return true
  }

  close() {
    return this.pWindowMngr.Remove(this.pID)
  }

  merge(tLayout) {
    this.setDeactive()
    if (!this.buildVisual(tLayout)) {
      return false
    }
    this.pSpecialIDList.push('drag' + this.pGroupData.length)
    this.pSpecialIDList.push('close' + this.pGroupData.length)
    this.pWindowMngr.Activate(this.pID)
    return true
  }

  unmerge() {
    if (this.pGroupData.length === 0) {
      return error(this, "Can't unmerge window without content!", symbol('#unmerge'), symbol('#minor'))
    }
    const tGroupData = this.pGroupData[this.pGroupData.length - 1]
    const items = tGroupData.items
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item && item.deconstruct) item.deconstruct()
      }
    }
    this.pClientRect = [
      this.pClientRect[0] - tGroupData.border[0],
      this.pClientRect[1] - tGroupData.border[1],
      this.pClientRect[2] - tGroupData.border[2],
      this.pClientRect[3] - tGroupData.border[3],
    ]
    if (Array.isArray(tGroupData.items)) {
      for (const tItem of tGroupData.items) {
        const idx = this.pElemList.keys().indexOf(this.pElemList.keys().find(k => this.pElemList.getaProp(k) === tItem))
        if (idx >= 0) this.pElemList.deleteProp(this.pElemList.getPropAt(idx + 1))
      }
    }
    if (Array.isArray(tGroupData.sprites)) {
      for (const tsprite of tGroupData.sprites) {
        const idx = this.pSpriteList.keys().indexOf(this.pSpriteList.keys().find(k => this.pSpriteList.getaProp(k) === tsprite))
        if (idx >= 0) this.pSpriteList.deleteProp(this.pSpriteList.getPropAt(idx + 1))
        if (tsprite && tsprite.spriteNum) releaseSprite(tsprite.spriteNum)
      }
    }
    if (Array.isArray(tGroupData.members)) {
      for (const tmember of tGroupData.members) {
        const idx = this.pMemberList.keys().indexOf(this.pMemberList.keys().find(k => this.pMemberList.getaProp(k) === tmember))
        if (idx >= 0) this.pMemberList.deleteProp(this.pMemberList.getPropAt(idx + 1))
        if (tmember && tmember.name) removeMember(tmember.name)
      }
    }
    this.pSpecialIDList = this.pSpecialIDList.filter(s => s !== 'drag' + this.pGroupData.length && s !== 'close' + this.pGroupData.length)
    this.pGroupData.pop()
    return true
  }

  lock(tBoolean) {
    if (voidP(tBoolean)) tBoolean = true
    this.pLock = tBoolean
    return true
  }

  hide() {
    if (this.pVisible) {
      this.pVisible = false
      this.moveX(10000)
      return true
    }
    return false
  }

  show() {
    if (!this.pVisible) {
      this.pVisible = true
      this.moveX(-10000)
      return true
    }
    return false
  }

  moveTo(tX, tY) {
    this.moveBy(tX - this.pLocX, tY - this.pLocY)
  }

  moveBy(tOffX, tOffY) {
    if ((this.pLocX + tOffX) < this.pBoundary.left) tOffX = this.pBoundary.left - this.pLocX
    if ((this.pLocY + tOffY) < this.pBoundary.top) tOffY = this.pBoundary.top - this.pLocY
    if ((this.pLocX + this.pwidth + tOffX) > this.pBoundary.right) tOffX = this.pBoundary.right - this.pLocX - this.pwidth
    if ((this.pLocY + this.pheight + tOffY) > this.pBoundary.bottom) tOffY = this.pBoundary.bottom - this.pLocY - this.pheight
    this.pLocX += tOffX
    this.pLocY += tOffY
    this.moveXY(tOffX, tOffY)
  }

  moveZ(tZ) {
    if (!integerp(tZ)) {
      return error(this, 'Integer expected: ' + tZ, symbol('#moveZ'), symbol('#minor'))
    }
    const sprKeys = this.pSpriteList.keys()
    for (let i = 0; i < sprKeys.length; i++) {
      const tSpr = this.pSpriteList.getaProp(sprKeys[i])
      if (tSpr) tSpr.locZ = tZ + i
    }
    this.pLocZ = tZ
  }

  center() {
    const tX = (800 / 2) - (this.pwidth / 2)
    const tY = (600 / 2) - (this.pheight / 2)
    return this.moveTo(tX, tY)
  }

  resizeBy(tOffX, tOffY) {
    if ((tOffX !== 0) || (tOffY !== 0)) {
      this.pwidth += tOffX
      this.pheight += tOffY
      const elemKeys = this.pElemList.keys()
      for (const key of elemKeys) {
        const elem = this.pElemList.getaProp(key)
        if (elem && elem.resizeBy) elem.resizeBy(tOffX, tOffY)
      }
    }
  }

  resizeTo(tX, tY) {
    this.resizeBy(tX - this.pwidth, tY - this.pheight)
  }

  setActive() {
    if (!this.pActive) {
      this.pActive = true
      return true
    }
    return false
  }

  setDeactive() {
    if (this.pLock) return false
    if (this.pActive) {
      this.pActive = false
      return true
    }
    return false
  }

  getClientRect() {
    return rect(this.pLocX, this.pLocY, this.pLocX + this.pwidth, this.pLocY + this.pheight)
  }

  getElement(tID) {
    const tElement = this.pElemList.getaProp(tID)
    if (voidP(tElement)) return 0
    return tElement
  }

  elementExists(tID) {
    return !voidP(this.pElemList.getaProp(tID))
  }

  registerClient(tClientID) {
    if (!objectExists(tClientID)) {
      return error(this, 'Object not found: ' + tClientID, symbol('#registerClient'), symbol('#major'))
    }
    this.pClientID = tClientID
    return true
  }

  removeClient() {
    this.pClientID = null
    return true
  }

  registerProcedure(tMethod, tClientID, tEvent) {
    if (!symbolp(tMethod)) {
      return error(this, 'Symbol expected: ' + tMethod, symbol('#registerProcedure'), symbol('#major'))
    }
    if (!objectExists(tClientID)) {
      return error(this, 'Object not found: ' + tClientID, symbol('#registerProcedure'), symbol('#major'))
    }
    if (voidP(tEvent)) {
      const keys = this.pProcedures.keys()
      for (const key of keys) {
        this.pProcedures.setaProp(key, [tMethod, tClientID])
      }
    } else {
      this.pProcedures.setaProp(tEvent, [tMethod, tClientID])
    }
    return true
  }

  removeProcedure(tEvent) {
    if (voidP(tEvent)) {
      this.pProcedures = this.createProcListTemplate()
    } else {
      if (this.pProcedures.getaProp(tEvent) !== null) {
        this.pProcedures.setaProp(tEvent, [symbol('#null'), this.pID])
      }
    }
    return true
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#locX'): return this.pLocX
      case symbol('#locY'): return this.pLocY
      case symbol('#locZ'): return this.pLocZ
      case symbol('#boundary'): return this.pBoundary
      case symbol('#width'): return this.pwidth
      case symbol('#height'): return this.pheight
      case symbol('#visible'): return this.pVisible
      case symbol('#title'): return this.pTitle
      case symbol('#id'): return this.pID
      case symbol('#modal'): return this.pModal
      case symbol('#spriteList'): return this.pSpriteList
      case symbol('#elementList'): return this.pElemList
      case symbol('#Active'): return this.pActive
      case symbol('#lock'): return this.pLock
      default: return 0
    }
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case symbol('#locX'): this.moveX(tValue); return true
      case symbol('#locY'): this.moveY(tValue); return true
      case symbol('#locZ'): this.moveZ(tValue); return true
      case symbol('#boundary'): this.pBoundary = tValue; return true
      case symbol('#title'): this.pTitle = tValue; return true
      case symbol('#modal'): this.pModal = tValue; return true
      case symbol('#visible'): return tValue ? this.show() : this.hide()
      default: return false
    }
  }

  setBlend(tNewBlend) {
    const sprKeys = this.pSpriteList.keys()
    for (const key of sprKeys) {
      const tsprite = this.pSpriteList.getaProp(key)
      if (tsprite) tsprite.blend = tNewBlend
    }
    return true
  }

  mouseEnter(tNull, tSprID) {
    return this.redirectEvent(symbol('#mouseEnter'), tSprID)
  }

  mouseLeave(tNull, tSprID) {
    return this.redirectEvent(symbol('#mouseLeave'), tSprID)
  }

  mouseWithin(tNull, tSprID) {
    return this.redirectEvent(symbol('#mouseWithin'), tSprID)
  }

  mouseDown(tNull, tSprID) {
    if (!this.pActive && !this.pLock) {
      this.pWindowMngr.Activate(this.pID)
    }
    if (this.pSpecialIDList.indexOf(tSprID) >= 0) {
      if (tSprID.includes('drag')) {
        this.drag(true)
      } else if (tSprID.includes('scale')) {
        this.scale(true)
      }
    }
    return this.redirectEvent(symbol('#mouseDown'), tSprID)
  }

  mouseUp(tNull, tSprID) {
    if (this.pSpecialIDList.indexOf(tSprID) >= 0) {
      if (tSprID.includes('drag')) {
        this.drag(false)
      } else if (tSprID.includes('scale')) {
        this.scale(false)
      } else if (tSprID.includes('close')) {
        if (voidP(this.pClientID)) {
          return this.pWindowMngr.Remove(this.pID)
        } else {
          tSprID = 'close'
        }
      }
    }
    return this.redirectEvent(symbol('#mouseUp'), tSprID)
  }

  mouseUpOutSide(tNull, tSprID) {
    if (tSprID.includes('drag')) this.drag(false)
    if (tSprID.includes('scale')) this.scale(false)
    return this.redirectEvent(symbol('#mouseUpOutSide'), tSprID)
  }

  keyDown(tNull, tSprID) {
    return this.redirectEvent(symbol('#keyDown'), tSprID)
  }

  keyUp(tNull, tSprID) {
    return this.redirectEvent(symbol('#keyUp'), tSprID)
  }

  supportedEvents() {
    return [
      symbol('#mouseEnter'), symbol('#mouseLeave'), symbol('#mouseWithin'),
      symbol('#mouseDown'), symbol('#mouseUp'), symbol('#mouseUpOutSide'),
      symbol('#keyDown'), symbol('#keyUp'),
    ]
  }

  redirectEvent(tEvent, tSprID) {
    // getWindowManager().registerWindowEvent(this.pTitle, tSprID, tEvent)
    const proc = this.pProcedures.getaProp(tEvent)
    if (!proc) return false
    const tMethod = proc[0]
    const tTarget = proc[1]
    const elem = this.pElemList.getaProp(tSprID)
    const tParam = call(tEvent, elem, tSprID)
    if ((tParam === 0) && (typeof tParam === 'number')) return false
    const tClient = getObject(tTarget)
    if (tClient !== 0) {
      return call(tMethod, tClient, tEvent, tSprID, tParam, this.pID)
    } else {
      return this.removeProcedure(tEvent)
    }
  }

  buildVisual(tLayout) {
    const parsedLayout = getObject(symbol('#layout_parser')).parse(tLayout)
    if (!parsedLayout || typeof parsedLayout !== 'object') {
      return error(this, 'Invalid window definition: ' + tLayout, symbol('#buildVisual'), symbol('#major'))
    }
    const tGroupNum = this.pGroupData.length
    const tElemList = createPropList()
    const tmemberlist = createPropList()
    const tSpriteList = createPropList()
    const tGroupData = { members: [], sprites: [], items: [], rect: [], border: [] }
    const tSprManager = getSpriteManager()
    const tResManager = getResourceManager()

    const elements = parsedLayout.elements
    const elemKeys = elements.keys ? elements.keys() : Object.keys(elements)
    for (let eIdx = 0; eIdx < elemKeys.length; eIdx++) {
      const elemKey = elemKeys[eIdx]
      const tElement = elements.getaProp ? elements.getaProp(elemKey) : elements[elemKey]
      if (!Array.isArray(tElement) || tElement.length === 0) continue

      let tID = tElement[0].id
      if (!voidP(this.pElemList.getaProp(tID))) {
        tID = tID + tGroupNum
      }
      const tmember = member(tResManager.createMember(this.pID + '_' + tID, symbol('#bitmap')))
      const tsprite = sprite(tSprManager.reserveSprite(this.pID))
      if (!tsprite || tsprite.spriteNum < 1) {
        const sprKeys = tSpriteList.keys()
        for (const key of sprKeys) {
          const rSpr = tSpriteList.getaProp(key)
          if (rSpr && rSpr.spriteNum) releaseSprite(rSpr.spriteNum)
        }
        const memKeys = tmemberlist.keys()
        for (const key of memKeys) {
          const rMem = tmemberlist.getaProp(key)
          if (rMem && rMem.name) removeMember(rMem.name)
        }
        return error(this, 'Failed to build window. System out of sprites!', symbol('#buildVisual'), symbol('#major'))
      }
      tmemberlist.setaProp(tID, tmember)
      tSpriteList.setaProp(tID, tsprite)
      tsprite.castNum = tmember.number
      tsprite.ink = 8
      const tElemRect = { left: 2000, top: 2000, right: -2000, bottom: -2000 }
      tGroupData.members.push(tmember)
      tGroupData.sprites.push(tsprite)
      tSprManager.setEventBroker(tsprite.spriteNum, tID)
      // tsprite.registerProcedure(VOID, this.pID, VOID)

      let tBlend = tElement[0].blend
      let tInk = tElement[0].ink
      let tColor = tElement[0].color
      let tBgColor = tElement[0].bgColor
      let tPalette = tElement[0].palette
      let tIsBlendShared = true
      let tIsColorShared = true
      let tIsBgColorShared = true
      let tIsInkShared = true
      let tIsPaletteShared = true

      for (const tItem of tElement) {
        tItem.id = tID
        tItem.mother = this.pID
        tItem.buffer = tmember
        tItem.sprite = tsprite
        if (tItem.blend !== tBlend) tIsBlendShared = false
        if (tItem.ink !== tInk) tIsInkShared = false
        if (tItem.color !== tColor) tIsColorShared = false
        if (tItem.bgColor !== tBgColor) tIsBgColorShared = false
        if (tItem.palette !== tPalette) tIsPaletteShared = false
        if (tItem.type === 'image') tIsPaletteShared = false
        if (tItem.flipH) tItem.locH = tItem.locH - tItem.width
        if (tItem.flipV) tItem.locV = tItem.locV - tItem.height
        if (tItem.locH < tElemRect.left) tElemRect.left = tItem.locH
        if (tItem.locV < tElemRect.top) tElemRect.top = tItem.locV
        if ((tItem.locH + tItem.width) > tElemRect.right) tElemRect.right = tItem.locH + tItem.width
        if ((tItem.locV + tItem.height) > tElemRect.bottom) tElemRect.bottom = tItem.locV + tItem.height
        if (!voidP(tItem.cursor)) {
          tsprite.setcursor(tItem.cursor)
          continue
        }
        tsprite.setcursor(symbol('#arrow'))
      }

      // Create element wrapper
      if (tElement.length === 1) {
        const tItem = tElement[0]
        tItem.style = symbol('#unique')
        if (tIsBlendShared) tItem.blend = 100
        const tWrapper = this.CreateElement(tItem)
        if (objectp(tWrapper)) {
          tElemList.setaProp(tID, tWrapper)
          tGroupData.items.push(tWrapper)
        }
      } else {
        const tProps = {
          id: tID, type: symbol('#wrapper'), style: symbol('#wrapper'),
          buffer: tmember, sprite: tsprite,
          locX: tElemRect.left, locY: tElemRect.top,
        }
        const tWrapper = this.CreateElement(tProps)
        for (const tItem of tElement) {
          tItem.locH = tItem.locH - tElemRect.left
          tItem.locV = tItem.locV - tElemRect.top
          tItem.style = symbol('#grouped')
          if (tIsBlendShared) tItem.blend = 100
          tWrapper.add(this.CreateElement(tItem))
        }
        if (objectp(tWrapper)) {
          tElemList.setaProp(tID, tWrapper)
          tGroupData.items.push(tWrapper)
        }
      }

      if (tIsBlendShared) tsprite.blend = tBlend
      if (tIsInkShared) tsprite.ink = tInk
      if (tIsColorShared) tsprite.color = tColor
      if (tIsBgColorShared) tsprite.bgColor = tBgColor
      tsprite.locH = tElemRect.left + this.pClientRect[0]
      tsprite.locV = tElemRect.top + this.pClientRect[1]
      tsprite.width = tElemRect.right - tElemRect.left
      tsprite.height = tElemRect.bottom - tElemRect.top
    }

    tGroupData.rect = parsedLayout.rect ? parsedLayout.rect[0] : []
    tGroupData.border = parsedLayout.border ? parsedLayout.border[0] : [0, 0, 0, 0]
    if (tGroupNum === 0) {
      this.pLocX += tGroupData.rect[0] || 0
      this.pLocY += tGroupData.rect[1] || 0
      this.pwidth = (tGroupData.rect[2] || 0) - (tGroupData.rect[0] || 0)
      this.pheight = (tGroupData.rect[3] || 0) - (tGroupData.rect[1] || 0)
    } else {
      const tNewW = this.pClientRect[0] + this.pClientRect[2] + ((tGroupData.rect[2] || 0) - (tGroupData.rect[0] || 0))
      const tNewH = this.pClientRect[1] + this.pClientRect[3] + ((tGroupData.rect[3] || 0) - (tGroupData.rect[1] || 0))
      if ((tNewW !== this.pwidth) || (tNewH !== this.pheight)) {
        this.resizeTo(tNewW, tNewH)
      }
    }
    this.pClientRect = [
      this.pClientRect[0] + (tGroupData.border[0] || 0),
      this.pClientRect[1] + (tGroupData.border[1] || 0),
      this.pClientRect[2] + (tGroupData.border[2] || 0),
      this.pClientRect[3] + (tGroupData.border[3] || 0),
    ]

    const sprKeys = tSpriteList.keys()
    for (let i = 0; i < sprKeys.length; i++) {
      const tID = sprKeys[i]
      const tSpr = tSpriteList.getaProp(tID)
      const tMem = tmemberlist.getaProp(tID)
      this.pMemberList.setaProp(tID, tMem)
      this.pSpriteList.setaProp(tID, tSpr)
      if (tSpr) {
        tSpr.locH = this.pLocX + (tSpr.locH - (tGroupData.rect[0] || 0))
        tSpr.locV = this.pLocY + (tSpr.locV - (tGroupData.rect[1] || 0))
      }
    }
    const elemKeysList = tElemList.keys()
    for (const key of elemKeysList) {
      this.pElemList.setaProp(key, tElemList.getaProp(key))
    }
    this.pGroupData.push(tGroupData)

    // prepare and render
    if (Array.isArray(tGroupData.items)) {
      for (const item of tGroupData.items) {
        if (item && item.prepare) item.prepare()
      }
      for (const item of tGroupData.items) {
        if (item && item.render) item.render()
      }
    }
    return true
  }

  prepare() {
    // Scale preparation - placeholder for mouse position
    const tOffX = 0 - this.pScaleOffset[0]
    const tOffY = 0 - this.pScaleOffset[1]
    this.pScaleOffset = [0, 0]
    if ((this.pwidth + tOffX) < 64) tOffX = 64 - this.pwidth
    if ((this.pheight + tOffY) < 64) tOffY = 64 - this.pheight
    this.resizeBy(tOffX, tOffY)
  }

  update() {
    // this.moveTo(the mouseH - this.pDragOffset[0], the mouseV - this.pDragOffset[1])
  }

  CreateElement(tProps) {
    const tTemplate = this.pElemClsList.getaProp(tProps.style)
    const ttype = tProps.type
    const tmodel = tProps.model
    const tClass = 'window.' + ttype + tmodel + '.class'
    let tClsStruct
    if (!voidP(this.pElemClsList.getaProp(tClass))) {
      tClsStruct = this.pElemClsList.getaProp(tClass)
    } else if (variableExists(tClass)) {
      tClsStruct = getClassVariable(tClass)
      this.pElemClsList.setaProp(tClass, tClsStruct)
    } else {
      tClsStruct = null
    }
    let tElement
    if (voidP(tClsStruct)) {
      tElement = createObject(symbol('#temp'), tTemplate)
    } else {
      tElement = createObject(symbol('#temp'), tTemplate, tClsStruct)
    }
    if (!tElement) {
      return error(this, 'Illegal element type: ' + tProps.id + ' ' + tClass, symbol('#CreateElement'), symbol('#major'))
    }
    tElement.setID(tProps.id)
    tElement.define(tProps)
    return tElement
  }

  createProcListTemplate() {
    const tList = createPropList()
    for (const tEvent of this.supportedEvents()) {
      tList.setaProp(tEvent, [symbol('#null'), this.pID])
    }
    return tList
  }

  scale(tBoolean) {
    if ((tBoolean === true) && !this.pScaleFlag) {
      this.pScaleOffset = [0, 0] // the mouseLoc
      receivePrepare(this.pID)
      this.pScaleFlag = true
    } else if ((tBoolean === false) && this.pScaleFlag) {
      removePrepare(this.pID)
      this.pScaleFlag = false
    }
    return true
  }

  drag(tBoolean) {
    if ((tBoolean === true) && !this.pDragFlag) {
      this.pDragOffset = [0, 0] // the mouseLoc - [pLocX, pLocY]
      receiveUpdate(this.pID)
      this.pDragFlag = true
    } else if ((tBoolean === false) && this.pDragFlag) {
      removeUpdate(this.pID)
      this.pDragFlag = false
    }
    return true
  }

  draw(tRGB) {
    const elemKeys = this.pElemList.keys()
    for (const key of elemKeys) {
      const elem = this.pElemList.getaProp(key)
      if (elem && elem.draw) elem.draw(tRGB)
    }
  }

  moveX(tOffX) {
    const sprKeys = this.pSpriteList.keys()
    for (const key of sprKeys) {
      const tSpr = this.pSpriteList.getaProp(key)
      if (tSpr) tSpr.locH += tOffX
    }
  }

  moveY(tOffY) {
    const sprKeys = this.pSpriteList.keys()
    for (const key of sprKeys) {
      const tSpr = this.pSpriteList.getaProp(key)
      if (tSpr) tSpr.locV += tOffY
    }
  }

  moveXY(tOffX, tOffY) {
    const sprKeys = this.pSpriteList.keys()
    for (const key of sprKeys) {
      const tSpr = this.pSpriteList.getaProp(key)
      if (tSpr) {
        tSpr.locH += tOffX
        tSpr.locV += tOffY
      }
    }
  }

  null() {
    return false
  }

  movePartBy(ttype, tX, tY, tInverse) {
    const tsprite = this.pSpriteList.getaProp(ttype)
    if (voidP(tsprite)) return false
    if (tInverse) {
      const sprKeys = this.pSpriteList.keys()
      for (const key of sprKeys) {
        if (key !== ttype) {
          const s = this.pSpriteList.getaProp(key)
          if (s) {
            s.locH += tX
            s.locV += tY
          }
        }
      }
    } else {
      tsprite.locH += tX
      tsprite.locV += tY
    }
  }

  movePartTo(ttype, tX, tY, tInverse) {
    tX = tX - this.pLocX
    tY = tY - this.pLocY
    this.movePartBy(ttype, tX, tY, tInverse)
  }
}
