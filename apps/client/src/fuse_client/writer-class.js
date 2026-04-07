// fuse_client/69_Writer Class.ls → writer-class.js
// Writer - text rendering with font metrics and alpha rendering support

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  listp,
  rect,
  error,
  member,
  createMember,
  createPropList,
} from '../core/lingo-runtime.js'
import { getResourceManager } from './resource-api.js'
import { variableExists, getVariable, getStructVariable } from './variable-api.js'
import { executeMessage } from './object-api.js'
import { getUniqueID } from './special-services-api.js'

export class WriterClass {
  constructor() {
    this.pMember = null
    this.pDefRect = rect(0, 0, 480, 480)
    this.pTxtRect = null
    this.pFntStru = null
    this.pTextRenderMode = 1
    this.pUnderliningDisabled = false
    this.pID = null
  }

  construct() {
    this.pDefRect = rect(0, 0, 480, 480)
    this.pTxtRect = null
    this.pFntStru = null
    const memberName = 'writer_' + getUniqueID()
    this.pMember = member(getResourceManager().createMember(memberName, symbol('#text')))
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
    if (!this.pMember || this.pMember.number === 0) {
      return false
    }
    this.pMember.alignment = symbol('#left')
    this.pMember.wordWrap = false
    return true
  }

  deconstruct() {
    if (this.pMember && this.pMember.name) {
      getResourceManager().removeMember(this.pMember.name)
      this.pMember = null
    }
    return true
  }

  define(tMetrics) {
    if (!tMetrics || typeof tMetrics !== 'object') return false
    if (stringp(tMetrics.font)) {
      if (this.pMember.font !== tMetrics.font) this.pMember.font = tMetrics.font
    }
    if (listp(tMetrics.fontStyle)) {
      if (this.pMember.fontStyle !== tMetrics.fontStyle) this.pMember.fontStyle = tMetrics.fontStyle
    }
    if (symbolp(tMetrics.alignment)) {
      if (this.pMember.alignment !== tMetrics.alignment) this.pMember.alignment = tMetrics.alignment
    }
    if (tMetrics.color && typeof tMetrics.color === 'object') {
      if (this.pMember.color !== tMetrics.color) this.pMember.color = tMetrics.color
    }
    if (tMetrics.bgColor && typeof tMetrics.bgColor === 'object') {
      if (this.pMember.bgColor !== tMetrics.bgColor) this.pMember.bgColor = tMetrics.bgColor
    }
    if (integerp(tMetrics.wordWrap)) {
      if (this.pMember.wordWrap !== tMetrics.wordWrap) this.pMember.wordWrap = tMetrics.wordWrap
    }
    if (integerp(tMetrics.antialias)) {
      if (this.pMember.antialias !== tMetrics.antialias) this.pMember.antialias = tMetrics.antialias
    }
    if (integerp(tMetrics.fontSize)) {
      if (this.pMember.fontSize !== tMetrics.fontSize) this.pMember.fontSize = tMetrics.fontSize
    }
    if (integerp(tMetrics.boxType)) {
      if (this.pMember.boxType !== tMetrics.boxType) this.pMember.boxType = tMetrics.boxType
    }
    if (tMetrics.rect && typeof tMetrics.rect === 'object') {
      if (this.pMember.width !== tMetrics.rect.width) {
        this.pMember.rect = tMetrics.rect
      }
    }
    if (this.pMember.fixedLineSpace !== this.pMember.fontSize) {
      this.pMember.fixedLineSpace = this.pMember.fontSize
    }
    if (integerp(tMetrics.fixedLineSpace)) {
      const tTopSpacing = tMetrics.fixedLineSpace - this.pMember.fontSize
      if (this.pMember.topSpacing !== tTopSpacing) {
        this.pMember.topSpacing = tTopSpacing
      }
    }
    executeMessage(symbol('#invalidateCrapFixRegion'))
    this.pTxtRect = tMetrics.rect
    return true
  }

  render(tText, tRect) {
    if (!this.pMember) return null
    this.pMember.text = tText
    if (tRect && typeof tRect === 'object' && tRect.left !== undefined) {
      if (this.pMember.width !== tRect.width) {
        this.pMember.rect = tRect
      }
    } else {
      if (voidP(this.pTxtRect)) {
        const tAlignment = this.pMember.alignment
        this.pMember.alignment = symbol('#left')
        this.pMember.rect = this.pDefRect
        // Approximate text width calculation
        const fontSize = this.pMember.fontSize || 12
        const lines = tText.split('\n')
        let maxWidth = 0
        for (const line of lines) {
          const lineWidth = line.length * fontSize * 0.6
          if (lineWidth > maxWidth) maxWidth = lineWidth
        }
        maxWidth += fontSize
        this.pMember.rect = rect(0, 0, maxWidth, this.pMember.height || (lines.length * fontSize * 1.2))
        this.pMember.alignment = tAlignment
      } else {
        if (this.pMember.width !== this.pTxtRect.width) {
          this.pMember.rect = this.pTxtRect
        }
      }
    }
    executeMessage(symbol('#invalidateCrapFixRegion'))
    if (this.pTextRenderMode === 1) {
      return this.pMember.image
    } else if (this.pTextRenderMode === 2) {
      return this.fakeAlphaRender()
    }
    return null
  }

  renderHTML(tHtml, tRect) {
    if (!this.pMember) return null
    const tFont = this.getFont()
    // this.pMember.html = tHtml - HTML rendering not directly supported in JS canvas
    this.pMember.text = tHtml.replace(/<[^>]*>/g, '') // Strip HTML tags for plain text
    if (tRect && typeof tRect === 'object' && tRect.left !== undefined) {
      if (this.pMember.width !== tRect.width) {
        this.pMember.rect = tRect
      }
    } else {
      if (voidP(this.pTxtRect)) {
        const tAlignment = this.pMember.alignment
        this.pMember.alignment = symbol('#left')
        this.pMember.rect = this.pDefRect
        const fontSize = this.pMember.fontSize || 12
        const lines = this.pMember.text.split('\n')
        let maxWidth = 0
        for (const line of lines) {
          const lineWidth = line.length * fontSize * 0.6
          if (lineWidth > maxWidth) maxWidth = lineWidth
        }
        maxWidth += fontSize
        this.pMember.rect = rect(0, 0, maxWidth, this.pMember.height || (lines.length * fontSize * 1.2))
        this.pMember.alignment = tAlignment
      } else {
        if (this.pMember.width !== this.pTxtRect.width) {
          this.pMember.rect = this.pTxtRect
        }
      }
    }
    this.setFont(tFont)
    if (this.pTextRenderMode === 1) {
      return this.pMember.image
    } else if (this.pTextRenderMode === 2) {
      return this.fakeAlphaRender()
    }
    return null
  }

  setFont(tStruct) {
    if (!tStruct || typeof tStruct !== 'object') {
      return error(this, 'Font struct expected!', symbol('#setFont'), symbol('#major'))
    }
    if (this.pMember.font !== tStruct.getaProp(symbol('#font'))) {
      this.pMember.font = tStruct.getaProp(symbol('#font'))
    }
    if (this.pMember.fontSize !== tStruct.getaProp(symbol('#fontSize'))) {
      this.pMember.fontSize = tStruct.getaProp(symbol('#fontSize'))
    }
    if (this.pMember.fontStyle !== tStruct.getaProp(symbol('#fontStyle'))) {
      this.pMember.fontStyle = tStruct.getaProp(symbol('#fontStyle'))
    }
    if (this.pMember.color !== tStruct.getaProp(symbol('#color'))) {
      this.pMember.color = tStruct.getaProp(symbol('#color'))
    }
    if (this.pMember.fixedLineSpace !== this.pMember.fontSize) {
      this.pMember.fixedLineSpace = this.pMember.fontSize
    }
    const tLineHeight = this.pMember.fontSize + (this.pMember.topSpacing || 0)
    if (tLineHeight !== tStruct.getaProp(symbol('#lineHeight'))) {
      this.pMember.topSpacing = tStruct.getaProp(symbol('#lineHeight')) - this.pMember.fontSize
    }
    executeMessage(symbol('#invalidateCrapFixRegion'))
    return true
  }

  getFont() {
    if (voidP(this.pFntStru)) {
      this.pFntStru = getStructVariable('struct.font.empty')
    }
    this.pFntStru.setaProp(symbol('#font'), this.pMember.font)
    this.pFntStru.setaProp(symbol('#fontStyle'), this.pMember.fontStyle)
    this.pFntStru.setaProp(symbol('#fontSize'), this.pMember.fontSize)
    this.pFntStru.setaProp(symbol('#color'), this.pMember.color)
    const tLineHeight = this.pMember.fontSize + (this.pMember.topSpacing || 0)
    this.pFntStru.setaProp(symbol('#lineHeight'), tLineHeight)
    return this.pFntStru
  }

  setProperty(tKey, tValue) {
    const tProps = createPropList()
    tProps.setaProp(tKey, tValue)
    return this.define(tProps)
  }

  fakeAlphaRender() {
    if (!this.pMember) return null
    const tColorWas = this.pMember.color
    const tBgColorWas = this.pMember.bgColor
    if (this.pUnderliningDisabled && Array.isArray(this.pMember.fontStyle)) {
      const underlineIdx = this.pMember.fontStyle.indexOf(symbol('#underline'))
      if (underlineIdx >= 0) {
        this.pMember.fontStyle = [symbol('#plain')]
      }
    }
    // In Director: create alpha mask image and composite
    // In JS Canvas: this would use globalCompositeOperation
    this.pMember.color = tColorWas
    this.pMember.bgColor = tBgColorWas
    return this.pMember.image
  }
}
