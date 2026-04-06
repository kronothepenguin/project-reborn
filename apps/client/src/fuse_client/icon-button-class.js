// fuse_client/65_Icon Button Class.ls → icon-button-class.js
// Icon button - button with text and optional icon image

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
  createMember,
  getText,
  getObject,
  createPropList,
} from '../core/lingo-runtime.js'
import { CommonButtonClass } from './common-button-class.js'

export class IconButtonClass extends CommonButtonClass {
  constructor() {
    super()
    this.pIconImg = null
  }

  prepare() {
    const tField = this.pType + this.pProps.model + '.element'
    this.pProp = getObject(symbol('#layout_parser')).parse(tField)
    if (this.pProp === 0) return false
    this.pOrigWidth = this.pProps.width
    this.pMaxWidth = this.pProps.maxwidth
    this.pFixedSize = this.pProps.fixedsize
    this.pAlignment = this.pProps.alignment
    this.pButtonText = getText(this.pProps.key)
    this.pBlend = this.pProps.blend
    this.pCachedImgs = createPropList()

    if (!voidP(this.pProps.icon)) {
      const tMemNum = getmemnum(this.pProps.icon)
      if (tMemNum > 0) {
        const tmember = member(tMemNum)
        this.pIconImg = tmember && tmember.image ? { ...tmember.image } : null
      }
    }
    if (!integerp(this.pMaxWidth)) this.pMaxWidth = 300
    if (voidP(this.pFixedSize)) this.pFixedSize = false
    this.UpdateImageObjects(null, symbol('#up'))
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
    if (this.pSprite) {
      this.pSprite.width = this.pwidth
      this.pSprite.height = this.pheight
    }
    return true
  }

  createButtonImg(tText, tstate) {
    if (!voidP(this.pCachedImgs.getaProp(tstate))) {
      return this.pCachedImgs.getaProp(tstate)
    }
    let tMemNum = getmemnum('icon.button.text')
    if (tMemNum === 0) {
      tMemNum = createMember('icon.button.text', symbol('#text'))
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

    let tOptImgWidth = 0
    let tOptImgMargH = 0
    let tOptImgMargV = 0
    const iconConfig = this.pProp.getaProp ? this.pProp.getaProp(symbol('#icon')) : this.pProp.icon
    if (!voidP(iconConfig) && !voidP(this.pIconImg)) {
      const iconProps = iconConfig.props
      const tAlignment = iconProps.getaProp ? iconProps.getPropAt(1) : Object.keys(iconProps)[0]
      const alignProps = iconProps.getaProp ? iconProps.getaProp(tAlignment) : iconProps[tAlignment]
      tOptImgMargH = alignProps.marginH || 0
      tOptImgMargV = alignProps.marginV || 0
      tOptImgWidth = this.pIconImg.width + tOptImgMargH
    }

    let tTextWidth = this.getTextWidth(tTextMem)
    let tWidth
    if (this.pFixedSize) {
      tTextWidth = this.pOrigWidth - (tMarginH * 2)
      tWidth = this.pOrigWidth
    } else {
      if ((tTextWidth + (tMarginH * 2)) > this.pMaxWidth) {
        tTextWidth = this.pMaxWidth - (tMarginH * 2) + tOptImgWidth
      }
      tWidth = tTextWidth + (tMarginH * 2) + tOptImgWidth
    }

    const leftImg = this.pButtonImg.getaProp(symbol('#left'))
    const imgHeight = leftImg ? leftImg.height : 0
    // Create composite image - Canvas placeholder
    const tNewImg = { width: tWidth, height: imgHeight, depth: this.pDepth, paletteRef: this.pPalette }

    this.pCachedImgs.setaProp(tstate, tNewImg)
    return tNewImg
  }
}
