// fuse_client/54_Visualizer Instance Class.ls → visualizer-instance-class.js
// Visualizer instance - renders visual layouts using sprites

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  listp,
  integer,
  length,
  rect,
  point,
  error,
  getSpriteManager,
  getResourceManager,
  getObjectManager,
  getMember,
  memberExists,
  createObject,
  getClassVariable,
  receiveUpdate,
  removeUpdate,
  releaseSprite,
  sprite,
  getThread,
  createPropList,
} from '../core/lingo-runtime.js'

export class VisualizerInstanceClass {
  constructor() {
    this.pTitle = null
    this.pLayout = []
    this.pLocX = 0
    this.pLocY = 0
    this.pLocZ = 0
    this.pwidth = 0
    this.pheight = 0
    this.pVisible = true
    this.pSpriteList = []
    this.pSpriteData = []
    this.pActSprList = createPropList()
    this.pDragFlag = false
    this.pDragOffset = [0, 0]
    this.pBoundary = rect(0, 0, 800, 600)
    this.pWrappedParts = createPropList()
    this.pSwapAnimList = createPropList()
    this.pID = null
  }

  construct() {
    this.pTitle = this.pID
    this.pLayout = []
    this.pLocX = 0
    this.pLocY = 0
    this.pLocZ = 0
    this.pwidth = 0
    this.pheight = 0
    this.pVisible = true
    this.pSpriteList = []
    this.pSpriteData = []
    this.pActSprList = createPropList()
    this.pDragFlag = false
    this.pDragOffset = [0, 0]
    this.pBoundary = rect(0, 0, 800, 600)
    this.pWrappedParts = createPropList()
    this.pSwapAnimList = createPropList()
    return true
  }

  deconstruct() {
    removeUpdate(this.pID)
    for (let i = 0; i < this.pSpriteList.length; i++) {
      releaseSprite(this.pSpriteList[i].spriteNum)
    }
    this.pSpriteList = []
    this.pSpriteData = []
    this.pActSprList = createPropList()
    this.pBoundary = rect(0, 0, 0, 0)
    const wrappedKeys = this.pWrappedParts.keys()
    for (const key of wrappedKeys) {
      const wrapper = this.pWrappedParts.getaProp(key)
      if (wrapper && wrapper.deconstruct) wrapper.deconstruct()
    }
    this.pWrappedParts = createPropList()
    return true
  }

  define(tProps) {
    if (voidP(tProps)) return false
    if (!voidP(tProps.locX)) this.pLocX = tProps.locX
    if (!voidP(tProps.locY)) this.pLocY = tProps.locY
    if (!voidP(tProps.locZ)) this.pLocZ = tProps.locZ
    if (!voidP(tProps.layout)) this.pLayout = tProps.layout
    if (!voidP(tProps.boundary)) this.pBoundary = tProps.boundary
    return this.open(this.pLayout)
  }

  open(tLayout) {
    if (voidP(tLayout)) tLayout = this.pLayout
    this.pLayout = tLayout
    if (this.pSpriteList.length > 0) {
      for (let i = 0; i < this.pSpriteList.length; i++) {
        releaseSprite(this.pSpriteList[i].spriteNum)
      }
      this.pSpriteList = []
    }
    return this.buildVisual(tLayout)
  }

  close() {
    return this.remove(this.pID)
  }

  moveTo(tX, tY) {
    this.moveBy(tX - this.pLocX, tY - this.pLocY)
  }

  moveBy(tOffX, tOffY) {
    if ((this.pLocX + tOffX) < this.pBoundary.left) {
      tOffX = this.pBoundary.left - this.pLocX
    }
    if ((this.pLocY + tOffY) < this.pBoundary.top) {
      tOffY = this.pBoundary.top - this.pLocY
    }
    if ((this.pLocX + this.pwidth + tOffX) > this.pBoundary.right) {
      tOffX = this.pBoundary.right - this.pLocX - this.pwidth
    }
    if ((this.pLocY + this.pheight + tOffY) > this.pBoundary.bottom) {
      tOffY = this.pBoundary.bottom - this.pLocY - this.pheight
    }
    this.pLocX = this.pLocX + tOffX
    this.pLocY = this.pLocY + tOffY
    this.moveXY(tOffX, tOffY)
  }

  moveZ(tZ) {
    if (!integerp(tZ)) {
      return error(this, 'Integer expected: ' + tZ, symbol('#moveZ'), symbol('#minor'))
    }
    for (let i = 0; i < this.pSpriteList.length; i++) {
      this.pSpriteList[i].locZ = tZ + i
    }
    const wrappedKeys = this.pWrappedParts.keys()
    for (const key of wrappedKeys) {
      const tPart = this.pWrappedParts.getaProp(key)
      if (tPart && tPart.setProperty) tPart.setProperty(symbol('#visLocZ'), tZ)
    }
    this.pLocZ = tZ
  }

  getSprite(tID) {
    return this.pActSprList.getaProp(tID)
  }

  getSprById(tID) {
    return this.pActSprList.getaProp(tID)
  }

  getSpriteByID(tID) {
    return this.pActSprList.getaProp(tID)
  }

  spriteExists(tID) {
    return !voidP(this.pActSprList.getaProp(tID))
  }

  moveSprBy(tID, tX, tY) {
    const tsprite = this.pActSprList.getaProp(tID)
    if (voidP(tsprite)) {
      return error(this, 'Sprite not found: ' + tID, symbol('#moveSprBy'), symbol('#minor'))
    }
    tsprite.locH += tX
    tsprite.locV += tY
    return this.Refresh()
  }

  moveSprTo(tID, tX, tY) {
    const tsprite = this.pActSprList.getaProp(tID)
    if (voidP(tsprite)) {
      return error(this, 'Sprite not found: ' + tID, symbol('#moveSprTo'), symbol('#minor'))
    }
    tsprite.locH = tX
    tsprite.locV = tY
    return this.Refresh()
  }

  setActive() {
    return true
  }

  setDeactive() {
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

  drag(tBoolean) {
    if ((tBoolean === true) && !this.pDragFlag) {
      // pDragOffset = the mouseLoc - [pLocX, pLocY]
      this.pDragOffset = [0, 0] // Placeholder for mouse position
      receiveUpdate(this.pID)
      this.pDragFlag = true
    } else if ((tBoolean === false) && this.pDragFlag) {
      removeUpdate(this.pID)
      this.pDragFlag = false
    }
    return true
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#layout'): return this.pLayout
      case symbol('#locX'): return this.pLocX
      case symbol('#locY'): return this.pLocY
      case symbol('#locZ'): return this.pLocZ
      case symbol('#boundary'): return this.pBoundary
      case symbol('#width'): return this.pwidth
      case symbol('#height'): return this.pheight
      case symbol('#sprCount'): return this.pSpriteList.length
      case symbol('#spriteList'): return this.pSpriteList
      case symbol('#spriteData'): return this.pSpriteData
      case symbol('#visible'): return this.pVisible
      case symbol('#title'): return this.pTitle
      case symbol('#id'): return this.pID
      case symbol('#swapAnims'): return this.pSwapAnimList
      default: return 0
    }
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case symbol('#layout'): return this.open(tValue)
      case symbol('#locX'): return this.moveX(tValue)
      case symbol('#locY'): return this.moveY(tValue)
      case symbol('#locZ'): return this.moveZ(tValue)
      case symbol('#boundary'): this.pBoundary = tValue; return true
      case symbol('#visible'): return tValue ? this.show() : this.hide()
      case symbol('#title'): this.pTitle = tValue; return true
      default: return false
    }
  }

  getWrappedParts(tWrapTypes) {
    if (voidP(tWrapTypes) || !Array.isArray(tWrapTypes)) {
      tWrapTypes = [symbol('#all')]
    }
    if (tWrapTypes.indexOf(symbol('#all')) >= 0) {
      return this.pWrappedParts
    }
    const tWrappedParts = createPropList()
    const wrappedKeys = this.pWrappedParts.keys()
    for (const key of wrappedKeys) {
      const tWrap = this.pWrappedParts.getaProp(key)
      if (tWrapTypes.indexOf(tWrap.getProperty(symbol('#type'))) >= 0) {
        tWrappedParts.setaProp(tWrap.getProperty(symbol('#id')), tWrap)
      }
    }
    return tWrappedParts
  }

  activateWrap(tWrapper) {
    const tSpr = tWrapper.getProperty(symbol('#sprite'))
    getSpriteManager().setEventBroker(tSpr.spriteNum, this.pID)
  }

  getPartAtLocation(tLocX, tLocY, tWrapperTypes) {
    if (!Array.isArray(tWrapperTypes)) {
      tWrapperTypes = [tWrapperTypes]
    }
    const wrappedKeys = this.pWrappedParts.keys()
    for (const key of wrappedKeys) {
      const tWrap = this.pWrappedParts.getaProp(key)
      if (tWrapperTypes.indexOf(tWrap.getProperty(symbol('#type'))) >= 0) {
        const tPart = tWrap.getPartAt(tLocX, tLocY)
        if (tPart && typeof tPart === 'object') {
          return tPart
        }
      }
    }
    return 0
  }

  createWrapper(tWrapID) {
    if (!voidP(this.pWrappedParts.getaProp(tWrapID))) {
      return error(this, 'Duplicate wrap id: ' + tWrapID, symbol('#createWrapper'))
    }
    const tWrap = createObject(symbol('#random'), getClassVariable('visualizer.wrapper.class'))
    tWrap.setProperty(symbol('#owner'), this.pID)
    this.pWrappedParts.setaProp(tWrapID, tWrap)
    const tSpr = sprite(getSpriteManager().reserveSprite(this.pID))
    tWrap.setProperty(symbol('#sprite'), tSpr)
    this.pSpriteList.push(tSpr)
    this.pSpriteData.push(createPropList())
    return tWrap
  }

  getWallPartUnderRect(tRect, tSlope) {
    const wrappedKeys = this.pWrappedParts.keys()
    for (const key of wrappedKeys) {
      const tWrap = this.pWrappedParts.getaProp(key)
      const tWrapType = tWrap.getProperty(symbol('#type'))
      if ((tWrapType === symbol('#wallleft')) || (tWrapType === symbol('#wallright'))) {
        const tPart = tWrap.fitRectToWall(tRect, tSlope)
        if (tPart.insideWall === 1) {
          return tPart
        }
      }
    }
    return { insideWall: 0 }
  }

  renderWrappedParts(tColor) {
    if (!tColor || typeof tColor !== 'object') {
      return false
    }
    if ((tColor.r + tColor.g + tColor.b) > (250 * 3)) {
      tColor = { r: 248, g: 248, b: 248 }
    }
    const wrappedKeys = this.pWrappedParts.keys()
    for (const key of wrappedKeys) {
      const tWrapper = this.pWrappedParts.getaProp(key)
      if (tWrapper && tWrapper.renderWithColor) {
        tWrapper.renderWithColor(tColor)
      }
    }
  }

  setDimmerColor(tColor) {
    if (!tColor || typeof tColor !== 'object') {
      return false
    }
    tColor = { r: 255 - tColor.r, g: 255 - tColor.g, b: 255 - tColor.b }
    if (memberExists('room_dimmer_image')) {
      const tMem = getMember('room_dimmer_image')
      // tMem.image.setPixel(0, 0, tColor)
    }
  }

  moveX(tOffX) {
    for (let i = 0; i < this.pSpriteList.length; i++) {
      this.pSpriteList[i].locH += tOffX
    }
  }

  moveY(tOffY) {
    for (let i = 0; i < this.pSpriteList.length; i++) {
      this.pSpriteList[i].locV += tOffY
    }
  }

  moveXY(tOffX, tOffY) {
    for (let i = 0; i < this.pSpriteList.length; i++) {
      this.pSpriteList[i].locH += tOffX
      this.pSpriteList[i].locV += tOffY
    }
  }

  update() {
    // this.moveTo(the mouseH - this.pDragOffset[0], the mouseV - this.pDragOffset[1])
  }

  Refresh() {
    const tRect = { left: 100000, top: 100000, right: -100000, bottom: -100000 }
    const wrappedKeys = this.pWrappedParts.keys()
    for (const key of wrappedKeys) {
      const tWrapper = this.pWrappedParts.getaProp(key)
      if (tWrapper && tWrapper.updateWrap) tWrapper.updateWrap()
    }
    for (const tSpr of this.pSpriteList) {
      if (tSpr.locH < tRect.left) tRect.left = tSpr.locH
      if (tSpr.locV < tRect.top) tRect.top = tSpr.locV
      if ((tSpr.locH + tSpr.width) > tRect.right) tRect.right = tSpr.locH + tSpr.width
      if ((tSpr.locV + tSpr.height) > tRect.bottom) tRect.bottom = tSpr.locV + tSpr.height
    }
    this.pLocX = tRect.left
    this.pLocY = tRect.top
    this.pwidth = tRect.right - tRect.left
    this.pheight = tRect.bottom - tRect.top
    if (this.pSpriteData.length > 0) {
      for (let i = 0; i < this.pSpriteList.length; i++) {
        if (this.pSpriteData[i] && typeof this.pSpriteData[i] === 'object') {
          this.pSpriteData[i].loc = {
            locH: this.pSpriteList[i].locH - tRect.left,
            locV: this.pSpriteList[i].locV - tRect.top,
          }
        }
      }
    }
    return true
  }

  buildVisual(tLayout) {
    let tLayoutName = tLayout
    let tPrivate = false
    if (tLayoutName.length >= 7) {
      tLayoutName = tLayoutName.substring(0, 6) + 'x' + tLayoutName.substring(7)
      if (tLayoutName === 'model_x.room') {
        tPrivate = true
      }
    }
    const parsedLayout = getObjectManager().GET(symbol('#layout_parser')).parse(tLayout)
    if (!parsedLayout || typeof parsedLayout !== 'object') {
      return error(this, 'Invalid visualizer definition: ' + tLayout, symbol('#buildVisual'), symbol('#major'))
    }
    if (!voidP(parsedLayout.rect) && parsedLayout.rect.length > 0) {
      const r = parsedLayout.rect[0]
      this.pLocX += r.left || r[0]
      this.pLocY += r.top || r[1]
    }
    const layoutElements = parsedLayout.elements || {}
    const tSpriteList = []
    const elementKeys = layoutElements.keys ? layoutElements.keys() : Object.keys(layoutElements)
    for (let i = 0; i < elementKeys.length; i++) {
      const elemKey = elementKeys[i]
      const elemList = layoutElements.getaProp ? layoutElements.getaProp(elemKey) : layoutElements[elemKey]
      if (!Array.isArray(elemList)) continue
      for (const tElem of elemList) {
        const tMemNum = getResourceManager().getmemnum(tElem.member)
        if (tMemNum < 1) {
          error(this, 'Member ' + tElem.member + ' required by visualizer: ' + this.pID + ' not found!', symbol('#buildVisual'), symbol('#major'))
          continue
        }
        if (!voidP(tElem.wrapperID)) {
          const tWrapID = tElem.wrapperID
          let tPartWrapper
          if (voidP(this.pWrappedParts.getaProp(tWrapID))) {
            tPartWrapper = this.createWrapper(tWrapID)
            tPartWrapper.define({
              id: tWrapID,
              palette: tElem.palette,
              offsetx: this.pLocX,
              offsety: this.pLocY,
              locZ: this.pLocZ,
              typeDef: tElem.typeDef,
            })
          } else {
            tPartWrapper = this.pWrappedParts.getaProp(tWrapID)
          }
          tPartWrapper.addPart(tElem)
        } else {
          const tSpr = sprite(getSpriteManager().reserveSprite(this.pID))
          if (!tSpr || tSpr.spriteNum < 1) {
            for (const rSpr of tSpriteList) {
              releaseSprite(rSpr.spriteNum)
            }
            return error(this, 'Failed to build visual. System out of sprites!', symbol('#buildVisual'), symbol('#major'))
          }
          tSpr.castNum = tMemNum
          tSpr.ink = tElem.ink || 0
          tSpr.locH = (tElem.locH || 0) + this.pLocX
          tSpr.locV = (tElem.locV || 0) + this.pLocY
          tSpr.width = tElem.width || 0
          tSpr.height = tElem.height || 0
          tSpr.blend = tElem.blend || 100
          tSpr.rotation = tElem.rotation || 0
          tSpr.skew = tElem.skew || 0
          tSpr.flipH = tElem.flipH || false
          tSpr.flipV = tElem.flipV || false
          tSpr.color = tElem.color || { r: 0, g: 0, b: 0 }
          tSpr.bgColor = tElem.bgColor || { r: 255, g: 255, b: 255 }
          if ((tElem.media === symbol('#text')) || (tElem.media === symbol('#field'))) {
            const tTxtMem = member(tMemNum)
            if (tTxtMem) {
              if (!voidP(tElem.txtColor)) tTxtMem.color = tElem.txtColor
              if (!voidP(tElem.txtBgColor)) tTxtMem.bgColor = tElem.txtBgColor
              if (!voidP(tElem.font)) tTxtMem.font = tElem.font
              if (!voidP(tElem.fontSize)) tTxtMem.fontSize = tElem.fontSize
              if (!voidP(tElem.fontStyle)) tTxtMem.fontStyle = tElem.fontStyle
              if (tElem.media === symbol('#text') && !voidP(tElem.fixedLineSpace)) {
                tTxtMem.fixedLineSpace = tElem.fixedLineSpace
              }
              if (tElem.media === symbol('#field') && !voidP(tElem.lineHeight)) {
                tTxtMem.lineHeight = tElem.lineHeight
              }
            }
          }
          if (voidP(tElem.locZ)) {
            tSpr.locZ = this.pLocZ + i
          } else {
            tSpr.locZ = integer(tElem.locZ) + this.pLocZ
          }
          if (!voidP(tElem.id)) {
            if ((tElem.Active === true) || (voidP(tElem.Active) && voidP(tElem.type))) {
              getSpriteManager().setEventBroker(tSpr.spriteNum, tElem.id)
              if (!voidP(tElem.cursor)) tSpr.setcursor(tElem.cursor)
              if (!voidP(tElem.link)) tSpr.setLink(tElem.link)
            }
            this.pActSprList.setaProp(tElem.id, tSpr)
          }
          this.pSpriteData.push(createPropList())
          tSpriteList.push(tSpr)
        }
        if (!voidP(tElem.swapAnimType)) {
          const tAnimProps = {
            sprite: null, // tSpr reference
            animType: tElem.swapAnimType,
            initDelayType: tElem.swapInitDelayType,
            initDelay: tElem.swapInitDelayValue,
            animDelayType: tElem.swapAnimDelayType,
            animDelay: tElem.swapAnimDelayValue,
            frameList: tElem.swapAnimFrameList,
            animLoopCount: tElem.swapAnimLoopCount,
          }
          if (!voidP(tElem.id)) {
            this.pSwapAnimList.setaProp(tElem.id, tAnimProps)
            continue
          }
          error(this, 'Animation had no ID', symbol('#buildVisual'), symbol('#minor'))
        }
      }
    }
    if (tPrivate) {
      const tThread = getThread(symbol('#room'))
      if (tThread !== 0) {
        const tSpr = sprite(getSpriteManager().reserveSprite(this.pID))
        const tmember = getMember('room_dimmer_image')
        if (tmember !== 0) {
          tSpr.member = tmember.number
          tSpr.ink = 35
          tSpr.locH = 0
          tSpr.locV = 0
          tSpr.width = 800
          tSpr.height = 600
          tSpr.blend = 100
          tSpr.locZ = (tSpriteList.length > 0 ? tSpriteList[tSpriteList.length - 1].locZ : 0) + 100000
          tSpriteList.push(tSpr)
          this.pSpriteData.push(createPropList())
        }
      }
    }
    for (const tSpr of tSpriteList) {
      this.pSpriteList.push(tSpr)
    }
    const wrappedKeys = this.pWrappedParts.keys()
    for (const key of wrappedKeys) {
      const tWrapper = this.pWrappedParts.getaProp(key)
      if (tWrapper && tWrapper.getProperty && tWrapper.getProperty(symbol('#Active'))) {
        this.activateWrap(tWrapper)
      }
    }
    return this.Refresh()
  }
}
