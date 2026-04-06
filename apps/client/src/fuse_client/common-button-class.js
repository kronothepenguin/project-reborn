// fuse_client/63_Common Button Class.ls → common-button-class.js
// Common button - text button with 9-slice styling

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  listp,
  point,
  rect,
  error,
  member,
  memberExists,
  getmemnum,
  createMember,
  getText,
  getObject,
  createPropList,
} from '../core/lingo-runtime.js'
import { UniqueElementClass } from './unique-element-class.js'

export class CommonButtonClass extends UniqueElementClass {
  constructor() {
    super()
    this.pmodel = null
    this.pOrigWidth = 0
    this.pMaxWidth = 0
    this.pFixedSize = false
    this.pAlignment = null
    this.pButtonImg = createPropList()
    this.pButtonText = ''
    this.pCachedImgs = createPropList()
    this.pClickPass = false
    this.pBlend = 100
    this.pProp = null
  }

  prepare() {
    const tField = this.pProps.type + this.pProps.model + '.element'
    this.pProp = getObject(symbol('#layout_parser')).parse(tField)
    if (this.pProp === 0) return false
    this.pmodel = this.pProps.model
    this.pOrigWidth = this.pProps.width
    this.pMaxWidth = this.pProps.maxwidth
    this.pFixedSize = this.pProps.fixedsize
    this.pAlignment = this.pProps.alignment
    this.pButtonText = getText(this.pProps.key)
    this.pBlend = this.pProps.blend
    this.pCachedImgs = createPropList()
    if (!integerp(this.pMaxWidth)) this.pMaxWidth = 300
    if (voidP(this.pFixedSize)) this.pFixedSize = false
    this.UpdateImageObjects(null, symbol('#up'))
    return this.setButtonImage()
  }

  setButtonImage() {
    const tOrigWidth = this.pwidth
    this.pimage = this.createButtonImg(this.pButtonText, symbol('#up'))
    const tTempOffset = this.pBuffer ? this.pBuffer.regPoint : null
    if (this.pBuffer) {
      this.pBuffer.image = this.pimage
      this.pBuffer.regPoint = tTempOffset
    }
    this.pwidth = this.pimage ? this.pimage.width : 0
    this.pheight = this.pimage ? this.pimage.height : 0
    this.pLocX = this.pSprite ? this.pSprite.locH : 0
    this.pLocY = this.pSprite ? this.pSprite.locV : 0
    switch (this.pAlignment) {
      case symbol('#center'):
        this.pLocX -= (this.pwidth - tOrigWidth) / 2
        break
      case symbol('#right'):
        this.pLocX -= (this.pwidth - tOrigWidth)
        break
    }
    if (this.pSprite) {
      this.pSprite.locH = this.pLocX
      this.pSprite.locV = this.pLocY
      this.pSprite.width = this.pwidth
      this.pSprite.height = this.pheight
    }
    return true
  }

  Activate() {
    if (this.pSprite) this.pSprite.blend = 100
    this.pBlend = 100
    return true
  }

  deactivate() {
    this.changeState(symbol('#up'))
    if (this.pSprite) this.pSprite.blend = 50
    this.pBlend = 50
    return true
  }

  setText(tText) {
    this.pButtonText = tText
    this.pCachedImgs = createPropList()
    return this.setButtonImage()
  }

  mouseDown() {
    if ((this.pBlend < 100) || (this.pSprite && this.pSprite.blend < 100)) return false
    this.pClickPass = true
    this.changeState(symbol('#down'))
    return true
  }

  mouseUp() {
    if ((this.pBlend < 100) || (this.pSprite && this.pSprite.blend < 100)) return false
    if (!this.pClickPass) return false
    this.pClickPass = false
    this.changeState(symbol('#up'))
    return true
  }

  mouseUpOutSide() {
    if ((this.pBlend < 100) || (this.pSprite && this.pSprite.blend < 100)) return false
    this.pClickPass = false
    this.changeState(symbol('#up'))
    return false
  }

  render() {
    if (!this.pBuffer || !this.pBuffer.image || !this.pimage) return
    // this.pBuffer.image.fill(this.pBuffer.image.rect, { r: 255, g: 255, b: 255 })
    // this.pBuffer.image.copyPixels(this.pimage, this.pBuffer.image.rect, this.pimage.rect, this.pParams)
  }

  changeState(tstate) {
    this.UpdateImageObjects(null, tstate)
    this.pimage = this.createButtonImg(this.pButtonText, tstate)
    this.render()
  }

  UpdateImageObjects(tPalette, tstate) {
    this.pButtonImg = createPropList()
    if (voidP(tPalette)) {
      tPalette = this.pPalette
    } else if (stringp(tPalette)) {
      tPalette = member(getmemnum(tPalette))
    }
    for (const f of [symbol('#left'), symbol('#middle'), symbol('#right')]) {
      const stateObj = this.pProp.getaProp ? this.pProp.getaProp(tstate) : this.pProp[tstate]
      if (!stateObj) continue
      const members = stateObj.members
      if (!members) continue
      const tDesc = members.getaProp ? members.getaProp(f) : members[f]
      if (!tDesc) continue
      const tmember = member(getmemnum(tDesc.member))
      if (!voidP(tDesc.palette)) {
        this.pPalette = member(getmemnum(tDesc.palette))
      } else {
        this.pPalette = tPalette
      }
      let tImage = tmember && tmember.image ? { ...tmember.image } : null
      if (tDesc.flipH) tImage = this.flipH(tImage)
      if (tDesc.flipV) tImage = this.flipV(tImage)
      this.pButtonImg.setaProp(f, tImage)
    }
  }

  createButtonImg(tText, tstate) {
    if (!voidP(this.pCachedImgs.getaProp(tstate))) {
      return this.pCachedImgs.getaProp(tstate)
    }
    let tMemNum = getmemnum('common.button.text')
    if (tMemNum === 0) {
      tMemNum = createMember('common.button.text', symbol('#text'))
    }
    const tTextMem = member(tMemNum)
    if (!tTextMem) return null

    const stateObj = this.pProp.getaProp ? this.pProp.getaProp(tstate) : this.pProp[tstate]
    const tFontDesc = stateObj ? stateObj.text : null
    if (!tFontDesc) return null

    const tFont = tFontDesc.font
    const tFontStyle = [symbol(tFontDesc.fontStyle)]
    const tFontSize = tFontDesc.fontSize
    const tColor = tFontDesc.color
    const tBgColor = tFontDesc.bgColor
    const tBoxType = tFontDesc.boxType
    const tSpace = tFontDesc.fontSize + 2
    const tMarginH = tFontDesc.marginH
    const tMarginV = tFontDesc.marginV

    if (tTextMem) {
      tTextMem.wordWrap = false
      tTextMem.font = tFont
      tTextMem.fontStyle = tFontStyle
      tTextMem.fontSize = tFontSize
      tTextMem.color = tColor
      tTextMem.bgColor = tBgColor
      tTextMem.boxType = tBoxType
      tTextMem.fixedLineSpace = tSpace
      tTextMem.text = tText
    }

    let tTextWidth = this.getTextWidth(tTextMem)
    let tWidth
    if (this.pFixedSize) {
      if ((tTextWidth + (tMarginH * 2)) > this.pOrigWidth) {
        tTextWidth = this.pOrigWidth - (tMarginH * 2)
      }
      tWidth = this.pOrigWidth
    } else {
      if ((tTextWidth + (tMarginH * 2)) > this.pMaxWidth) {
        tTextWidth = this.pMaxWidth - (tMarginH * 2)
      }
      tWidth = tTextWidth + (tMarginH * 2)
    }

    const leftImg = this.pButtonImg.getaProp(symbol('#left'))
    const rightImg = this.pButtonImg.getaProp(symbol('#right'))
    const middleImg = this.pButtonImg.getaProp(symbol('#middle'))
    const imgHeight = leftImg ? leftImg.height : 0

    // Create composite button image - Canvas placeholder
    const tNewImg = { width: tWidth, height: imgHeight, depth: this.pDepth, paletteRef: this.pPalette }

    this.pCachedImgs.setaProp(tstate, tNewImg)
    return tNewImg
  }

  flipH(tImg) {
    if (!tImg) return tImg
    return { ...tImg, flippedH: true }
  }

  flipV(tImg) {
    if (!tImg) return tImg
    return { ...tImg, flippedV: true }
  }

  getTextWidth(tTextMem) {
    if (!tTextMem) return 0
    // Approximate text width based on character count and font size
    const fontSize = tTextMem.fontSize || 12
    const text = tTextMem.text || ''
    return text.length * fontSize * 0.6
  }
}
