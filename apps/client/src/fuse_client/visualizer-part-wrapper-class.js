// fuse_client/80_Visualizer Part Wrapper Class.ls → visualizer-part-wrapper-class.js
// Visualizer part wrapper - groups visualizer parts and renders them as a single image

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  listp,
  point,
  rect,
  member,
  memberExists,
  getmemnum,
  sprite,
  createMember,
  error,
  createPropList,
} from '../core/lingo-runtime.js'

export class VisualizerPartWrapperClass {
  constructor() {
    this.pPartList = []
    this.pImgMemberID = null
    this.pTypeDef = null
    this.pSprite = null
    this.pLocZ = 0
    this.pWrapperStatus = { rendered: false, rectOk: false }
    this.pOffsets = [0, 0]
    this.pWrapID = 'NoID'
    this.pBoundingRect = rect(0, 0, 0, 0)
    this.pCapturesEvents = false
    this.pSpriteProps = { blend: 100, ink: 41, bgColor: { r: 255, g: 255, b: 255 } }
    this.pOwnerID = null
    this.pVisualizerLocZ = 0
    this.pBgColor = { r: 254, g: 254, b: 254 }
    this.pID = null
  }

  construct() {
    this.pPartList = []
    this.pWrapperStatus = { rendered: false, rectOk: false }
    this.pOffsets = [0, 0]
    this.pWrapID = 'NoID'
    this.pBoundingRect = rect(0, 0, 0, 0)
    this.pCapturesEvents = false
    this.pSpriteProps = { blend: 100, ink: 41, bgColor: { r: 255, g: 255, b: 255 } }
    this.pVisualizerLocZ = 0
    this.pBgColor = { r: 254, g: 254, b: 254 }
    return true
  }

  deconstruct() {
    this.pPartList = []
    if (!voidP(this.pImgMemberID) && memberExists(this.pImgMemberID)) {
      // removeMember(this.pImgMemberID)
    }
    return true
  }

  define(tProps) {
    if (!tProps || typeof tProps !== 'object') {
      return error(this, 'Not a proplist: ' + tProps, symbol('#define'), symbol('#major'))
    }
    if (!voidP(tProps.palette)) {
      this.pSpriteProps.palette = tProps.palette
    }
    if (!voidP(tProps.id)) {
      this.pWrapID = tProps.id
    }
    this.pTypeDef = tProps.typeDef
    this.pOffsets = [integerp(tProps.offsetx) ? tProps.offsetx : 0, integerp(tProps.offsety) ? tProps.offsety : 0]
    this.pVisualizerLocZ = integerp(tProps.locZ) ? tProps.locZ : 0
    this.pImgMemberID = 'VizWrap_' + this.pWrapID + '_' + this.pID
    this.pWrapperStatus = { rendered: false, rectOk: false }
    return true
  }

  addPart(tProps) {
    if (!tProps || typeof tProps !== 'object') {
      return error(this, 'Not a proplist: ' + tProps, symbol('#addPart'), symbol('#major'))
    }
    let tPartMember = null
    if (!memberExists(tProps.member)) {
      const tpartNum = Math.abs(getmemnum(tProps.member))
      if (tpartNum > 0) {
        tPartMember = member(tpartNum)
      } else {
        return error(this, 'No member found: ' + tProps.member, symbol('#addPart'), symbol('#major'))
      }
    } else {
      tPartMember = member(Math.abs(getmemnum(tProps.member)))
    }
    const tX1 = tProps.locH + this.pOffsets[0] - (tPartMember.regPoint ? tPartMember.regPoint.locH || tPartMember.regPoint[0] : 0)
    const tY1 = tProps.locV + this.pOffsets[1] - (tPartMember.regPoint ? tPartMember.regPoint.locV || tPartMember.regPoint[1] : 0)
    const tX2 = tX1 + tProps.width
    const tY2 = tY1 + tProps.height
    tProps.screenrect = rect(tX1, tY1, tX2, tY2)

    if (typeof tProps.member === 'string') {
      const parts = tProps.member.split('_')
      tProps.class = parts[1] || ''
    }

    if (!voidP(tProps.locZ)) this.pLocZ = tProps.locZ
    if (!voidP(tProps.ink)) this.pSpriteProps.ink = tProps.ink
    if (!voidP(tProps.blend)) this.pSpriteProps.blend = tProps.blend
    if (!voidP(tProps.palette)) this.pSpriteProps.palette = tProps.palette
    if (!this.pCapturesEvents) this.pCapturesEvents = tProps.catchEvents

    this.pPartList.push(tProps)
    this.pWrapperStatus = { rendered: false, rectOk: false }
    return true
  }

  removePart(tPartId) {
    for (let tPos = 0; tPos < this.pPartList.length; tPos++) {
      if (this.pPartList[tPos].id === tPartId) {
        this.pPartList.splice(tPos, 1)
        this.pWrapperStatus = { rendered: false, rectOk: false }
        break
      }
    }
    return this.updateWrap()
  }

  setProperty(tProp, tValue) {
    if (voidP(tProp) || voidP(tValue)) return false
    switch (tProp) {
      case symbol('#sprite'):
        this.setSprite(tValue)
        break
      case symbol('#owner'):
        this.pOwnerID = tValue
        break
      case symbol('#locZ'):
        this.pLocZ = tValue
        break
      case symbol('#visLocZ'):
        this.pVisualizerLocZ = tValue
        break
      case symbol('#blend'):
        this.pSpriteProps.blend = tValue
        break
      case symbol('#ink'):
        this.pSpriteProps.ink = tValue
        break
      case symbol('#palette'):
        this.pSpriteProps.palette = tValue
        break
      default:
        return false
    }
    return true
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#locZ'):
        return this.pLocZ + this.pVisualizerLocZ
      case symbol('#sprite'):
        return this.pSprite
      case symbol('#type'):
        return this.pTypeDef
      case symbol('#id'):
        return this.pID
      case symbol('#imagePntr'):
        return this.getImagePointer()
      case symbol('#Active'):
        return this.pCapturesEvents
      case symbol('#blend'):
        return this.pSpriteProps.blend
      default:
        return 0
    }
  }

  fitRectToWall(tRect, tSlope) {
    if ((this.pTypeDef !== symbol('#wallleft')) && (this.pTypeDef !== symbol('#wallright'))) {
      return { insideWall: false }
    }
    const tB = this.getBounds()
    if ((tB.left > tRect.left) || (tB.top > tRect.top) || (tB.right < tRect.right) || (tB.bottom < tRect.bottom)) {
      return { insideWall: false }
    }
    // Wall fitting logic - simplified for JS
    return { insideWall: false }
  }

  setPartPattern(tPatternType, tPalette, tColor, tWrapType) {
    if (tWrapType !== this.pTypeDef) return false
    for (const tPart of this.pPartList) {
      if (typeof tPart.member === 'string') {
        const parts = tPart.member.split('_')
        const tClass = parts.slice(0, 2).join('_') + '_'
        const ttype = tPatternType + '_'
        const tLayer = parts[3] ? parts[3] + '_' : ''
        const tObs1 = parts[4] ? parts[4] + '_' : ''
        const tdir = parts[5] ? parts[5] + '_' : ''
        const tObs2 = parts[6] || ''
        const tNewMemName = tClass + ttype + tLayer + tObs1 + tdir + tObs2
        if (memberExists(tNewMemName)) {
          tPart.member = tNewMemName
        }
      }
      this.pSpriteProps.bgColor = tColor
      this.pSpriteProps.palette = tPalette
    }
    this.pWrapperStatus.rendered = false
    return this.updateWrap()
  }

  updateWrap() {
    if (!this.pWrapperStatus.rendered) {
      this.renderImage()
    }
    if (!this.pWrapperStatus.rectOk) {
      this.updateBounds()
    }
    return this.updateSprite()
  }

  getPartAt(tLocX, tLocY) {
    for (const tPart of this.pPartList) {
      if ((tPart.locX === tLocX) && (tPart.locY === tLocY)) {
        return {
          member: tPart.member,
          locH: tPart.locH + this.pOffsets[0],
          locV: tPart.locV + this.pOffsets[1],
          locZ: this.pLocZ + this.pVisualizerLocZ,
        }
      }
    }
    return 0
  }

  getBounds() {
    if (!this.pWrapperStatus.rectOk) {
      this.updateBounds()
    }
    return rect(
      this.pBoundingRect.left + this.pOffsets[0],
      this.pBoundingRect.top + this.pOffsets[1],
      this.pBoundingRect.right + this.pOffsets[0],
      this.pBoundingRect.bottom + this.pOffsets[1]
    )
  }

  renderWithColor(tColor) {
    if (tColor && typeof tColor === 'object') {
      this.pBgColor = tColor
      this.renderImage()
    }
  }

  getImagePointer() {
    if (!this.pWrapperStatus.rendered) {
      this.renderImage()
    }
    return this.pImgMemberID
  }

  setSprite(tSpr) {
    this.pSprite = sprite(tSpr)
    return true
  }

  updateBounds() {
    if (this.pPartList.length === 0) {
      this.pBoundingRect = rect(0, 0, 0, 0)
      this.pWrapperStatus.rectOk = true
      return true
    }
    let minX1 = Infinity, minY1 = Infinity, maxX2 = -Infinity, maxY2 = -Infinity
    for (const tPart of this.pPartList) {
      const tPartMem = member(Math.abs(getmemnum(tPart.member)))
      if (!tPartMem) continue
      const regX = tPartMem.regPoint ? (tPartMem.regPoint.locH || tPartMem.regPoint[0] || 0) : 0
      const regY = tPartMem.regPoint ? (tPartMem.regPoint.locV || tPartMem.regPoint[1] || 0) : 0
      const tX1 = tPart.locH - regX
      const tY1 = tPart.locV - regY
      if (tX1 < minX1) minX1 = tX1
      if (tY1 < minY1) minY1 = tY1
      if ((tX1 + tPart.width) > maxX2) maxX2 = tX1 + tPart.width
      if ((tY1 + tPart.height) > maxY2) maxY2 = tY1 + tPart.height
    }
    this.pBoundingRect = rect(minX1, minY1, maxX2, maxY2)
    this.pWrapperStatus.rectOk = true
    return true
  }

  updateSprite() {
    if (voidP(this.pSprite)) return false
    const tMemNum = getmemnum(this.pImgMemberID)
    if (tMemNum === 0) return false
    const tMem = member(tMemNum)
    if (!tMem) return false
    this.pSprite.member = tMem
    this.pSprite.width = tMem.width || 0
    this.pSprite.height = tMem.height || 0
    this.pSprite.locZ = this.pLocZ + this.pVisualizerLocZ
    this.pSprite.bgColor = this.pSpriteProps.bgColor
    this.pSprite.ink = this.pSpriteProps.ink
    this.pSprite.blend = this.pSpriteProps.blend
    this.pSprite.locH = this.pOffsets[0]
    this.pSprite.locV = this.pOffsets[1]
    return true
  }

  renderImage() {
    // Canvas rendering - placeholder for actual image compositing
    // In Director: creates a member, renders all parts with copyPixels
    // In JS: would use Canvas 2D context to draw images
    if (getmemnum(this.pImgMemberID) < 1) {
      createMember(this.pImgMemberID, symbol('#bitmap'))
    }
    // Render all parts to the image member
    this.pWrapperStatus.rendered = true
    return true
  }
}
