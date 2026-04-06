// fuse_client/60_Text Wrapper Class.ls → text-wrapper-class.js
// Text wrapper - handles text rendering with font properties

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  listp,
  rect,
  error,
  string,
  createPropList,
  getResourceManager,
  member,
  textExists,
  variableExists,
  getVariable,
  executeMessage,
  getObject,
  EMPTY,
} from '../core/lingo-runtime.js'
import { ImageWrapperClass } from './image-wrapper-class.js'

export class TextWrapperClass extends ImageWrapperClass {
  constructor() {
    super()
    this.pFontData = createPropList()
    this.pTextMem = null
    this.pNeedFill = false
    this.pTextRenderMode = 1
    this.pUnderliningDisabled = false
  }

  prepare() {
    this.pOffX = 0
    this.pOffY = 0
    this.pOwnW = this.pProps.width
    this.pOwnH = this.pProps.height
    this.pScrolls = []
    if (this.pProps.style === symbol('#unique')) {
      this.pOwnX = 0
      this.pOwnY = 0
    } else {
      this.pOwnX = this.pProps.locH
      this.pOwnY = this.pProps.locV
    }
    this.pFontData = createPropList()
    this.pFontData.setaProp(symbol('#color'), this.pProps.txtColor)
    this.pFontData.setaProp(symbol('#bgColor'), this.pProps.txtBgColor)
    this.pFontData.setaProp(symbol('#key'), this.pProps.key)
    this.pFontData.setaProp(symbol('#wordWrap'), this.pProps.wordWrap)
    this.pFontData.setaProp(symbol('#alignment'), symbol(this.pProps.alignment))
    this.pFontData.setaProp(symbol('#font'), this.pProps.font)
    this.pFontData.setaProp(symbol('#fontSize'), this.pProps.fontSize)
    this.pFontData.setaProp(symbol('#fontStyle'), this.pProps.fontStyle)
    if (integerp(this.pProps.fixedLineSpace)) {
      if (this.pProps.fixedLineSpace === this.pProps.fontSize) {
        this.pProps.fixedLineSpace = this.pProps.fixedLineSpace + 1
      }
      this.pFontData.setaProp(symbol('#fixedLineSpace'), this.pProps.fixedLineSpace)
    } else {
      this.pFontData.setaProp(symbol('#fixedLineSpace'), this.pProps.fontSize + 1)
    }
    if (voidP(this.pFontData.getaProp(symbol('#key')))) {
      this.pFontData.setaProp(symbol('#key'), '')
    }
    const bgColor = this.pFontData.getaProp(symbol('#bgColor'))
    this.pNeedFill = bgColor && (bgColor.r !== 255 || bgColor.g !== 255 || bgColor.b !== 255)

    if (variableExists('text.render.compatibility.mode')) {
      this.pTextRenderMode = getVariable('text.render.compatibility.mode')
    } else {
      this.pTextRenderMode = 1
    }
    if (variableExists('text.underlining.disabled')) {
      this.pUnderliningDisabled = getVariable('text.underlining.disabled')
    } else {
      this.pUnderliningDisabled = false
    }
    this.initResources(this.pFontData)
    return this.createImgFromTxt()
  }

  setText(tText) {
    tText = string(tText)
    this.pFontData.setaProp(symbol('#text'), tText)
    // this.pBuffer.image.fill(rect, rgb(255, 255, 255))
    this.createImgFromTxt()
    this.render()
    this.registerScroll()
    return true
  }

  getText() {
    return this.pFontData.getaProp(symbol('#text'))
  }

  setFont(tStruct) {
    this.pFontData.setaProp(symbol('#font'), tStruct.getaProp(symbol('#font')))
    this.pFontData.setaProp(symbol('#fontStyle'), tStruct.getaProp(symbol('#fontStyle')))
    this.pFontData.setaProp(symbol('#fontSize'), tStruct.getaProp(symbol('#fontSize')))
    this.pFontData.setaProp(symbol('#color'), tStruct.getaProp(symbol('#color')))
    this.pFontData.setaProp(symbol('#fixedLineSpace'), tStruct.getaProp(symbol('#lineHeight')))
    // this.pBuffer.image.fill(rect, rgb(255, 255, 255))
    this.createImgFromTxt()
    this.render()
    this.registerScroll()
    return true
  }

  getFont() {
    const tStruct = createPropList()
    tStruct.setaProp(symbol('#font'), this.pFontData.getaProp(symbol('#font')))
    tStruct.setaProp(symbol('#fontStyle'), this.pFontData.getaProp(symbol('#fontStyle')))
    tStruct.setaProp(symbol('#fontSize'), this.pFontData.getaProp(symbol('#fontSize')))
    tStruct.setaProp(symbol('#color'), this.pFontData.getaProp(symbol('#color')))
    tStruct.setaProp(symbol('#lineHeight'), this.pFontData.getaProp(symbol('#fixedLineSpace')))
    return tStruct
  }

  registerScroll(tID) {
    if (voidP(this.pScrolls)) {
      this.prepare()
    }
    if (!voidP(tID)) {
      if (this.pScrolls.indexOf(tID) === -1) {
        this.pScrolls.push(tID)
      }
    } else {
      if (this.pScrolls.length === 0) {
        return false
      }
    }
    // In Director: getWindowManager().GET().getElement()
    this.createImgFromTxt()
    // call(#updateData, tScrollList, tSourceRect, this.pimage.rect)
  }

  initResources(tFontProps) {
    let tMemNum = getResourceManager().getmemnum('visual window text')
    if (tMemNum === 0) {
      tMemNum = getResourceManager().createMember('visual window text', symbol('#text'))
      this.pTextMem = member(tMemNum)
      // pTextMem.boxType = #adjust
    } else {
      this.pTextMem = member(tMemNum)
    }
    executeMessage(symbol('#invalidateCrapFixRegion'))
    return true
  }

  createImgFromTxt() {
    if (!this.pTextMem) return false
    // pTextMem.rect = rect(0, 0, this.pOwnW, this.pOwnH)

    let fontStyle = this.pFontData.getaProp(symbol('#fontStyle'))
    if (!listp(fontStyle)) {
      const tList = []
      if (typeof fontStyle === 'string') {
        const items = fontStyle.split(',')
        for (const item of items) {
          tList.push(symbol(item.trim()))
        }
      }
      fontStyle = tList
      this.pFontData.setaProp(symbol('#fontStyle'), fontStyle)
    }

    if (this.pUnderliningDisabled && Array.isArray(fontStyle)) {
      const underlineIdx = fontStyle.indexOf(symbol('#underline'))
      if (underlineIdx >= 0) {
        fontStyle.splice(underlineIdx, 1)
        if (fontStyle.length === 0) {
          fontStyle.push(symbol('#plain'))
        }
      }
    }

    let textContent = this.pFontData.getaProp(symbol('#text'))
    if (voidP(textContent)) {
      const key = this.pFontData.getaProp(symbol('#key'))
      if (key === '') {
        textContent = ''
      } else if (typeof key === 'string' && key[0] === '%') {
        const tKey = symbol(key.substring(1))
        const parentObj = getObject(this.pMotherId)
        textContent = parentObj ? String(parentObj.getProperty(tKey)) : ''
      } else if (textExists(key)) {
        textContent = key // Placeholder for getTextManager().GET()
      } else {
        error(this, 'Text not found: ' + key, symbol('#createImgFromTxt'), symbol('#minor'))
        textContent = key
      }
    }
    this.pFontData.setaProp(symbol('#text'), textContent)

    if (this.pTextMem) {
      this.pTextMem.text = textContent
      if (this.pTextMem.fontStyle !== fontStyle) this.pTextMem.fontStyle = fontStyle
      if (this.pTextMem.wordWrap !== this.pFontData.getaProp(symbol('#wordWrap'))) {
        this.pTextMem.wordWrap = this.pFontData.getaProp(symbol('#wordWrap'))
      }
      if (this.pTextMem.alignment !== this.pFontData.getaProp(symbol('#alignment'))) {
        this.pTextMem.alignment = this.pFontData.getaProp(symbol('#alignment'))
      }
      if (this.pTextMem.font !== this.pFontData.getaProp(symbol('#font'))) {
        this.pTextMem.font = this.pFontData.getaProp(symbol('#font'))
      }
      if (this.pTextMem.fontSize !== this.pFontData.getaProp(symbol('#fontSize'))) {
        this.pTextMem.fontSize = this.pFontData.getaProp(symbol('#fontSize'))
      }
      if (this.pTextMem.fixedLineSpace !== this.pFontData.getaProp(symbol('#fixedLineSpace'))) {
        this.pTextMem.fixedLineSpace = this.pFontData.getaProp(symbol('#fixedLineSpace'))
      }
    }

    // Calculate width for center alignment
    if (this.pScaleH === symbol('#center')) {
      const tWidth = (textContent.length * (this.pFontData.getaProp(symbol('#fontSize')) || 12)) + 16
      if (this.pProps.style === symbol('#unique')) {
        this.pLocX += (this.pwidth - tWidth) / 2
        this.pwidth = tWidth
        this.pOwnW = tWidth
      } else {
        this.pOwnX += (this.pOwnW - tWidth) / 2
        this.pOwnW = tWidth
      }
    } else {
      if (this.pProps.style === symbol('#unique')) {
        this.pwidth = textContent.length * 8 // Approximate
        this.pOwnW = this.pwidth
      } else {
        this.pOwnW = textContent.length * 8
      }
    }

    // Create image from text - Canvas placeholder
    // this.pimage = image(this.pOwnW, tHeight, this.pDepth, this.pPalette)
    // if (this.pNeedFill) this.pimage.fill(this.pimage.rect, this.pFontData.getaProp(symbol('#bgColor')))
    // this.pimage.copyPixels(this.pTextMem.image, this.pimage.rect, this.pimage.rect, { ink: 8 })

    executeMessage(symbol('#invalidateCrapFixRegion'))
    return true
  }
}
