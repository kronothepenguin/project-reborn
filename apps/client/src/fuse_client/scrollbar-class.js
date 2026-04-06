// fuse_client/66_Scrollbar Class.ls → scrollbar-class.js
// Scrollbar - vertical/horizontal scrollbar with buttons, track, and lift

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
  getmemnum,
  getObject,
  createObject,
  getClassVariable,
  variableExists,
  getVariable,
  removeObject,
  call,
  createPropList,
  float,
} from '../core/lingo-runtime.js'

export class ScrollbarClass {
  constructor() {
    this.pState = null
    this.pClientID = null
    this.pAgentID = null
    this.pButtonImg = createPropList()
    this.pParts = null
    this.pRects = createPropList()
    this.pScrollOffset = 0
    this.pViewClientRect = null
    this.pClientSourceRect = null
    this.pScrollStep = 1
    this.pButtonStates = createPropList()
    this.pMaxOffset = 0
    this.pPageSize = 0
    this.pClickPoint = null
    this.pClickPass = false
    this.pID = null
    this.pMotherId = null
    this.pType = ''
    this.pScaleH = null
    this.pScaleV = null
    this.pBuffer = null
    this.pSprite = null
    this.pLocX = 0
    this.pLocY = 0
    this.pwidth = 0
    this.pheight = 0
    this.pProps = null
    this.pimage = null
    this.pPalette = null
  }

  deconstruct() {
    removeObject(this.pAgentID)
    return true
  }

  define(tProps) {
    const tField = tProps.type + tProps.model + '.element'
    this.pParts = getObject(symbol('#layout_parser')).parse(tField)
    if (this.pParts === 0) return false
    this.pProps = tProps
    this.pID = tProps.id
    this.pMotherId = tProps.mother
    this.pType = tProps.type
    this.pScaleH = tProps.scaleH
    this.pScaleV = tProps.scaleV
    this.pBuffer = tProps.buffer
    this.pSprite = tProps.sprite
    this.pLocX = tProps.locX
    this.pLocY = tProps.locY
    this.pwidth = tProps.width
    this.pheight = tProps.height
    this.pClientID = tProps.client
    this.pScrollStep = tProps.offset
    this.pButtonImg = createPropList()
    if (variableExists('interface.palette')) {
      this.pPalette = member(getmemnum(getVariable('interface.palette')))
    } else {
      this.pPalette = symbol('#systemMac')
    }
    this.pRects = createPropList()
    this.pState = symbol('#waitMouseEvent')
    this.pScrollOffset = 0
    this.pButtonStates = createPropList()
    this.pButtonStates.setaProp(symbol('#top'), symbol('#up'))
    this.pButtonStates.setaProp(symbol('#bottom'), symbol('#up'))
    this.pButtonStates.setaProp(symbol('#bar'), symbol('#up'))
    this.pButtonStates.setaProp(symbol('#lift'), symbol('#up'))
    this.UpdateImageObjects(null, [symbol('#up'), symbol('#down'), symbol('#passive')])
    if (this.pType === 'scrollbarv') {
      this.pwidth = this.pButtonImg.getaProp('top_up') ? this.pButtonImg.getaProp('top_up').width : 0
    } else {
      this.pheight = this.pButtonImg.getaProp('top_up') ? this.pButtonImg.getaProp('top_up').height : 0
    }
    // this.pimage = image(this.pwidth, this.pheight, 8, this.pPalette)
    this.UpdateScrollBar([symbol('#top'), symbol('#bottom'), symbol('#bar'), symbol('#lift')], symbol('#up'))
    const tTempOffset = this.pBuffer ? this.pBuffer.regPoint : null
    if (this.pBuffer) {
      this.pBuffer.image = this.pimage
      this.pBuffer.regPoint = tTempOffset
    }
    this.pAgentID = this.pID + '_' + Date.now()
    createObject(this.pAgentID, getClassVariable('event.agent.class'))
    return true
  }

  prepare() {
    if (this.pSprite) {
      this.pSprite.width = this.pwidth
      this.pSprite.height = this.pheight
    }
    // call(#registerScroll, [getWindow(this.pMotherId).getElement(this.pClientID)], this.pID)
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#width'): return this.pwidth
      case symbol('#height'): return this.pheight
      case symbol('#locH'): return this.pLocX
      case symbol('#locV'): return this.pLocY
      case symbol('#locX'): return this.pLocX
      case symbol('#locY'): return this.pLocY
      case symbol('#offset'): return this.pScrollOffset
      case symbol('#scrollrange'):
        if (this.pType === 'scrollbarv') {
          return this.pClientSourceRect ? this.pClientSourceRect.bottom - this.pClientSourceRect.top : 0
        } else {
          return this.pClientSourceRect ? this.pClientSourceRect.right - this.pClientSourceRect.left : 0
        }
      case symbol('#scrollStep'): return this.pScrollStep
      default: return 0
    }
  }

  getScrollOffset() {
    return this.pScrollOffset
  }

  setScrollOffset(tOffset) {
    this.sendAdjustOffsetTo(tOffset)
    this.UpdateLiftPosition()
    this.ButtonsStates()
    return true
  }

  updateData(tViewClientRect, tClientSourceRect) {
    this.pViewClientRect = tViewClientRect
    this.pClientSourceRect = tClientSourceRect
    if (this.pType === 'scrollbarv') {
      if (this.pViewClientRect && (this.pViewClientRect.height % this.pScrollStep) !== 0) {
        this.pViewClientRect.bottom = this.pViewClientRect.bottom - (this.pViewClientRect.height % this.pScrollStep) + this.pScrollStep
      }
      if (this.pViewClientRect && this.pClientSourceRect && this.pViewClientRect.height > this.pClientSourceRect.height) {
        this.pScrollOffset = 0
      }
      this.pMaxOffset = (this.pClientSourceRect ? this.pClientSourceRect.height : 0) - (this.pViewClientRect ? this.pViewClientRect.height : 0)
      this.pPageSize = this.pViewClientRect ? this.pViewClientRect.height : 0
    } else {
      if (this.pViewClientRect && (this.pViewClientRect.width % this.pScrollStep) !== 0) {
        this.pViewClientRect.right = this.pViewClientRect.right - (this.pViewClientRect.width % this.pScrollStep) + this.pScrollStep
      }
      if (this.pViewClientRect && this.pClientSourceRect && this.pViewClientRect.width > this.pClientSourceRect.width) {
        this.pScrollOffset = 0
      }
      this.pMaxOffset = (this.pClientSourceRect ? this.pClientSourceRect.width : 0) - (this.pViewClientRect ? this.pViewClientRect.width : 0)
      this.pPageSize = this.pViewClientRect ? this.pViewClientRect.width : 0
    }
    this.sendAdjustOffsetTo(this.pScrollOffset)
    this.ButtonsStates()
  }

  ScrollBarPercentV() {
    const tHeight = float((this.pClientSourceRect ? this.pClientSourceRect.height : 0) - (this.pViewClientRect ? this.pViewClientRect.height : 0))
    if (tHeight === 0) return 0
    const tPercent = float(this.pScrollOffset) / tHeight
    return tPercent > 1.0 ? 1.0 : tPercent
  }

  ScrollBarPercentH() {
    const tWidth = float((this.pClientSourceRect ? this.pClientSourceRect.width : 0) - (this.pViewClientRect ? this.pViewClientRect.width : 0))
    if (tWidth === 0) return 0
    const tPercent = float(this.pScrollOffset) / tWidth
    return tPercent > 1.0 ? 1.0 : tPercent
  }

  mouseDown() {
    if (this.pSprite && this.pSprite.blend < 100) return false
    this.pClickPass = true
    this.pClickPoint = point(0, 0) // Placeholder for mouse position
    this.ScrollBarMouseEvent(symbol('#down'))
    this.render()
    return true
  }

  mouseUp() {
    this.initEventAgent(false)
    if (this.pSprite && this.pSprite.blend < 100) return false
    if (!this.pClickPass) return false
    this.pClickPass = false
    this.ScrollBarMouseEvent(symbol('#up'))
    this.pState = symbol('#waitMouseEvent')
    this.ButtonsStates()
    this.render()
    return true
  }

  mouseWithin() {
    if (this.pState === symbol('#lift')) {
      // Mouse tracking for lift drag - placeholder
      this.ScrollByLift()
      this.ButtonsStates()
    } else if ((this.pState === symbol('#top')) || (this.pState === symbol('#bottom'))) {
      this.ScrollBarMouseEvent(symbol('#down'))
      this.ButtonsStates()
    }
  }

  mouseUpOutSide() {
    if (this.pSprite && this.pSprite.blend < 100) return false
    this.pClickPass = false
    this.pState = symbol('#waitMouseEvent')
    this.ButtonsStates()
    this.render()
    return false
  }

  UpdateLiftPosition() {
    if (this.pType === 'scrollbarv') {
      const barRect = this.pRects.getaProp(symbol('#bar'))
      const liftRect = this.pRects.getaProp(symbol('#lift'))
      if (!barRect || !liftRect) return
      const tMoveAreaV = barRect.height - liftRect.height
      const tNewOffset = Math.floor(this.ScrollBarPercentV() * tMoveAreaV)
      const topRect = this.pRects.getaProp(symbol('#top'))
      this.pRects.setaProp(symbol('#lift'), rect(
        liftRect.left,
        tNewOffset + (topRect ? topRect.height : 0),
        liftRect.right,
        tNewOffset + (topRect ? topRect.height : 0) + liftRect.height
      ))
    } else {
      const barRect = this.pRects.getaProp(symbol('#bar'))
      const liftRect = this.pRects.getaProp(symbol('#lift'))
      if (!barRect || !liftRect) return
      const tMoveAreaH = barRect.width - liftRect.width
      const tNewOffset = Math.floor(this.ScrollBarPercentH() * tMoveAreaH)
      const topRect = this.pRects.getaProp(symbol('#top'))
      this.pRects.setaProp(symbol('#lift'), rect(
        tNewOffset + (topRect ? topRect.width : 0),
        liftRect.top,
        tNewOffset + (topRect ? topRect.width : 0) + liftRect.width,
        liftRect.bottom
      ))
    }
  }

  ScrollByLift() {
    if (this.pType === 'scrollbarv') {
      const barRect = this.pRects.getaProp(symbol('#bar'))
      const liftRect = this.pRects.getaProp(symbol('#lift'))
      if (!barRect || !liftRect) return
      const tMoveAreaV = barRect.height - liftRect.height
      if (tMoveAreaV === 0) return
      const tScrollPercent = ((liftRect.top - liftRect.height + 1) * 100) / tMoveAreaV
      const tNowOffset = Math.floor(((this.pClientSourceRect ? this.pClientSourceRect.bottom : 0) - (this.pViewClientRect ? this.pViewClientRect.height : 0)) * float(tScrollPercent) / 100)
      this.sendAdjustOffsetTo(tNowOffset)
    } else {
      const barRect = this.pRects.getaProp(symbol('#bar'))
      const liftRect = this.pRects.getaProp(symbol('#lift'))
      if (!barRect || !liftRect) return
      const tMoveAreaH = barRect.width - liftRect.width
      if (tMoveAreaH === 0) return
      const tScrollPercent = ((liftRect.left - liftRect.width + 1) * 100) / tMoveAreaH
      const tNowOffset = Math.floor(((this.pClientSourceRect ? this.pClientSourceRect.right : 0) - (this.pViewClientRect ? this.pViewClientRect.width : 0)) * float(tScrollPercent) / 100)
      this.sendAdjustOffsetTo(tNowOffset)
    }
  }

  sendAdjustOffsetTo(tNewOffset) {
    if ((Math.abs(this.pScrollOffset - tNewOffset) < this.pScrollStep) && (tNewOffset < this.pMaxOffset) && (tNewOffset > 0)) {
      return true
    }
    if (tNewOffset < this.pMaxOffset) {
      this.pScrollOffset = tNewOffset
      if (this.pScrollStep > 0) {
        this.pScrollOffset = Math.floor(this.pScrollOffset / this.pScrollStep) * this.pScrollStep
      }
    } else {
      this.pScrollOffset = this.pMaxOffset
    }
    if (this.pScrollOffset <= 0) this.pScrollOffset = 0
    // call(#setOffsetY/#setOffsetX, [getWindow(this.pMotherId).getElement(this.pClientID)], this.pScrollOffset)
  }

  UpdateImageObjects(tPalette, tListStates) {
    if (voidP(tPalette)) {
      tPalette = this.pPalette
    } else if (stringp(tPalette)) {
      tPalette = member(getmemnum(tPalette))
    }
    for (const f of [symbol('#top'), symbol('#lift'), symbol('#bottom'), symbol('#bar')]) {
      for (const i of tListStates) {
        const stateObj = this.pParts.getaProp ? this.pParts.getaProp(i) : this.pParts[i]
        if (!stateObj) continue
        const members = stateObj.members
        if (!members) continue
        const tDesc = members.getaProp ? members.getaProp(f) : members[f]
        if (!voidP(tDesc)) {
          const tmember = member(getmemnum(tDesc.member))
          if (!voidP(tDesc.palette)) {
            this.pPalette = member(getmemnum(tDesc.palette))
          } else {
            this.pPalette = tPalette
          }
          let tImage = tmember && tmember.image ? { ...tmember.image } : null
          if (tDesc.flipH) tImage = this.flipH(tImage)
          if (tDesc.flipV) tImage = this.flipV(tImage)
          if (!voidP(tDesc.rotate)) tImage = this.rotateImg(tImage, tDesc.rotate)
          this.pButtonImg.setaProp(f + '_' + i, tImage)
        }
      }
      this.DefineRects(f)
    }
    return tPalette
  }

  DefineRects(tElementPart) {
    const baseImg = this.pButtonImg.getaProp(tElementPart + '_up')
    if (!baseImg) return
    const topImg = this.pButtonImg.getaProp('top_up')
    const bottomImg = this.pButtonImg.getaProp('bottom_up')
    let tRect = { ...baseImg }
    if (this.pType === 'scrollbarv') {
      switch (tElementPart) {
        case symbol('#lift'):
          tRect = { ...tRect, top: tRect.top + (topImg ? topImg.height : 0), bottom: tRect.bottom + (topImg ? topImg.height : 0) }
          break
        case symbol('#bottom'):
          tRect = { ...tRect, top: this.pheight - (bottomImg ? bottomImg.height : 0), bottom: this.pheight }
          break
        case symbol('#bar'):
          tRect = { ...tRect, top: topImg ? topImg.height : 0, bottom: this.pheight - (bottomImg ? bottomImg.height : 0) - 1 }
          break
      }
    } else {
      switch (tElementPart) {
        case symbol('#lift'):
          tRect = { ...tRect, left: tRect.left + (topImg ? topImg.width : 0), right: tRect.right + (topImg ? topImg.width : 0) }
          break
        case symbol('#bottom'):
          tRect = { ...tRect, left: this.pwidth - (bottomImg ? bottomImg.width : 0), right: this.pwidth }
          break
        case symbol('#bar'):
          tRect = { ...tRect, left: topImg ? topImg.width : 0, right: this.pwidth - (bottomImg ? bottomImg.width : 0) - 1 }
          break
      }
    }
    this.pRects.setaProp(tElementPart, tRect)
  }

  UpdateScrollBar(tElementPartList, tstate) {
    for (const f of tElementPartList) {
      const tDstRect = this.pRects.getaProp(f)
      const tImgPropName = f + '_' + tstate
      const tImg = this.pButtonImg.getaProp(tImgPropName)
      if (tDstRect && tImg && this.pimage) {
        // this.pimage.copyPixels(tImg, tDstRect, tImg.rect, { ink: 36 })
      }
    }
  }

  ScrollBarMouseEvent(tstate) {
    const topState = this.pButtonStates.getaProp(symbol('#top'))
    const bottomState = this.pButtonStates.getaProp(symbol('#bottom'))
    if ((topState === symbol('#passive')) && (bottomState === symbol('#passive'))) return
    if (this.pState === symbol('#lift')) {
      this.UpdateScrollBar([symbol('#bar'), symbol('#lift')], symbol('#up'))
      this.pButtonStates.setaProp(symbol('#lift'), symbol('#up'))
      return
    }
    const tClickbutton = this.buttonOfClickArea(this.pClickPoint)
    if (voidP(tClickbutton)) return
    if (this.pButtonStates.getaProp(tClickbutton) === symbol('#passive')) return
    this.pButtonStates.setaProp(tClickbutton, tstate)
    this.pState = symbol(tClickbutton)
    if ((tClickbutton === symbol('#top')) || (tClickbutton === symbol('#bottom'))) {
      this.UpdateScrollBar([tClickbutton], tstate)
      if (tClickbutton === symbol('#top')) {
        this.sendAdjustOffsetTo(this.pScrollOffset - this.pScrollStep)
      } else {
        this.sendAdjustOffsetTo(this.pScrollOffset + this.pScrollStep)
      }
      this.UpdateLiftPosition()
      this.UpdateScrollBar([symbol('#bar'), symbol('#lift')], symbol('#up'))
    } else if (tClickbutton === symbol('#lift')) {
      this.UpdateScrollBar([symbol('#bar')], symbol('#up'))
      this.UpdateScrollBar([symbol('#lift')], tstate)
      this.initEventAgent(true)
    } else if ((tClickbutton === symbol('#bar')) && (tstate === symbol('#down'))) {
      this.UpdateLiftPosition()
      this.UpdateScrollBar([symbol('#bar')], tstate)
      this.UpdateScrollBar([symbol('#lift')], symbol('#up'))
    }
  }

  ButtonsStates() {
    const topState = this.pButtonStates.getaProp(symbol('#top'))
    const bottomState = this.pButtonStates.getaProp(symbol('#bottom'))
    const liftState = this.pButtonStates.getaProp(symbol('#lift'))
    if ((this.pScrollOffset > 0) && (topState !== symbol('#up')) && (this.pState !== symbol('#top'))) {
      this.pButtonStates.setaProp(symbol('#top'), symbol('#up'))
      this.UpdateScrollBar([symbol('#top')], symbol('#up'))
    } else if ((this.pScrollOffset <= 0) && (topState !== symbol('#passive'))) {
      this.pButtonStates.setaProp(symbol('#top'), symbol('#passive'))
      this.UpdateScrollBar([symbol('#top')], symbol('#passive'))
    }
    if ((this.pScrollOffset < this.pMaxOffset) && (bottomState !== symbol('#up')) && (this.pState !== symbol('#bottom'))) {
      this.pButtonStates.setaProp(symbol('#bottom'), symbol('#up'))
      this.UpdateScrollBar([symbol('#bottom')], symbol('#up'))
    } else if ((this.pScrollOffset >= this.pMaxOffset) && (bottomState !== symbol('#passive'))) {
      this.pButtonStates.setaProp(symbol('#bottom'), symbol('#passive'))
      this.UpdateScrollBar([symbol('#bottom')], symbol('#passive'))
    }
    if ((this.pButtonStates.getaProp(symbol('#top')) === symbol('#passive')) && (this.pButtonStates.getaProp(symbol('#bottom')) === symbol('#passive'))) {
      this.pButtonStates.setaProp(symbol('#lift'), symbol('#passive'))
      this.UpdateScrollBar([symbol('#bar')], symbol('#up'))
      this.UpdateScrollBar([symbol('#lift')], symbol('#passive'))
    } else if (this.pState !== symbol('#lift')) {
      this.pButtonStates.setaProp(symbol('#lift'), symbol('#up'))
      this.UpdateLiftPosition()
      this.UpdateScrollBar([symbol('#bar'), symbol('#lift')], symbol('#up'))
    }
    this.render()
  }

  buttonOfClickArea(tpoint) {
    if (!tpoint || !this.pSprite) return null
    const adjustedPoint = { locH: tpoint.locH - this.pSprite.locH, locV: tpoint.locV - this.pSprite.locV }
    const rectKeys = this.pRects.keys()
    for (const key of rectKeys) {
      const r = this.pRects.getaProp(key)
      if (r && adjustedPoint.locH >= r.left && adjustedPoint.locH <= r.right && adjustedPoint.locV >= r.top && adjustedPoint.locV <= r.bottom) {
        return key
      }
    }
    return null
  }

  initEventAgent(tBoolean) {
    const tAgent = getObject(this.pAgentID)
    if (tAgent) {
      if (tBoolean) {
        if (tAgent.registerEvent) {
          tAgent.registerEvent(this, symbol('#mouseUp'), symbol('#mouseUp'))
          tAgent.registerEvent(this, symbol('#mouseWithin'), symbol('#mouseWithin'))
        }
      } else {
        if (tAgent.unregisterEvent) {
          tAgent.unregisterEvent(symbol('#mouseUp'))
          tAgent.unregisterEvent(symbol('#mouseWithin'))
        }
      }
    }
  }

  resizeBy(tOffH, tOffV) {
    if ((tOffH !== 0) || (tOffV !== 0)) {
      if (this.pSprite) {
        switch (this.pScaleH) {
          case symbol('#move'): this.pSprite.locH += tOffH; break
          case symbol('#scale'): this.pSprite.width += tOffH; break
          case symbol('#center'): this.pSprite.locH += tOffH / 2; break
        }
        switch (this.pScaleV) {
          case symbol('#move'): this.pSprite.locV += tOffV; break
          case symbol('#scale'): this.pSprite.height += tOffV; break
          case symbol('#center'): this.pSprite.locV += tOffV / 2; break
        }
      }
      this.pRects = createPropList()
      this.pState = symbol('#waitMouseEvent')
      this.pScrollOffset = 0
      this.pButtonStates = createPropList()
      this.pButtonStates.setaProp(symbol('#top'), symbol('#up'))
      this.pButtonStates.setaProp(symbol('#bottom'), symbol('#up'))
      this.pButtonStates.setaProp(symbol('#bar'), symbol('#up'))
      this.pButtonStates.setaProp(symbol('#lift'), symbol('#up'))
      if (this.pType === 'scrollbarv') {
        this.pwidth = this.pButtonImg.getaProp('top_up') ? this.pButtonImg.getaProp('top_up').width : 0
        this.pheight = this.pSprite ? this.pSprite.height : 0
      } else {
        this.pwidth = this.pSprite ? this.pSprite.width : 0
        this.pheight = this.pButtonImg.getaProp('top_up') ? this.pButtonImg.getaProp('top_up').height : 0
      }
      if (this.pwidth < 1) this.pwidth = 1
      if (this.pheight < 1) this.pheight = 1
      this.UpdateImageObjects(null, [symbol('#up'), symbol('#down'), symbol('#passive')])
      // this.pimage = image(this.pwidth, this.pheight, 8, this.pPalette)
      this.UpdateScrollBar([symbol('#top'), symbol('#bottom'), symbol('#bar'), symbol('#lift')], symbol('#up'))
      const tTempOffset = this.pBuffer ? this.pBuffer.regPoint : null
      if (this.pBuffer) {
        this.pBuffer.image = this.pimage
        this.pBuffer.regPoint = tTempOffset
      }
    }
  }

  flipH(tImg) {
    if (!tImg) return tImg
    return { ...tImg, flippedH: true }
  }

  flipV(tImg) {
    if (!tImg) return tImg
    return { ...tImg, flippedV: true }
  }

  rotateImg(tImg, tDirection) {
    if (!tImg) return tImg
    return { ...tImg, rotated: tDirection }
  }

  render() {
    // Canvas rendering placeholder
  }
}
