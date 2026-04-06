// fuse_client/61_Field Wrapper Class.ls → field-wrapper-class.js
// Field wrapper - handles editable text fields

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  rect,
  error,
  member,
  textExists,
  getText,
  getResourceManager,
  random,
  numToChar,
  string,
  createPropList,
} from '../core/lingo-runtime.js'
import { TextWrapperClass } from './text-wrapper-class.js'

export class FieldWrapperClass extends TextWrapperClass {
  constructor() {
    super()
    this.pMember = null
  }

  deconstruct() {
    if (this.pMember && this.pMember.name) {
      getResourceManager().removeMember(this.pMember.name)
    }
    return true
  }

  prepare() {
    const memberName = this.pProps.member + Date.now() + numToChar(random(99))
    this.pMember = member(getResourceManager().createMember(memberName, symbol('#field')))
    if (this.pMember) {
      this.pMember.wordWrap = this.pProps.wordWrap
      this.pMember.autoTab = this.pProps.autoTab
      this.pMember.alignment = this.pProps.alignment
      this.pMember.font = this.pProps.font
      this.pMember.fontSize = this.pProps.fontSize
      this.pMember.boxType = this.pProps.boxType
      this.pMember.fontStyle = this.pProps.fontStyle
      this.pMember.editable = true
      if (voidP(this.pProps.border)) {
        this.pProps.border = false
      }
      this.pMember.color = this.pProps.txtColor
      this.pMember.bgColor = this.pProps.txtBgColor
      this.pMember.border = this.pProps.border
      if (integerp(this.pProps.boxDropShadow)) {
        this.pMember.boxDropShadow = this.pProps.boxDropShadow
      }
      if (this.pProps.key === '') {
        this.pMember.text = ''
      } else if (textExists(this.pProps.key)) {
        this.pMember.text = getText(this.pProps.key)
      } else {
        error(this, 'Text not found: ' + this.pProps.key, symbol('#define'), symbol('#minor'))
        this.pMember.text = this.pProps.key
      }
      if (this.pSprite) {
        this.pSprite.member = this.pMember
      }
      this.pMember.rect = rect(0, 0, this.pwidth, this.pheight)
    }
    return true
  }

  getText() {
    return this.pMember ? this.pMember.text : ''
  }

  setText(tText) {
    if (!stringp(tText)) {
      tText = string(tText)
    }
    if (this.pMember) {
      this.pMember.text = tText
    }
    return true
  }

  setEdit(tBool) {
    if ((tBool !== true) && (tBool !== false) && (tBool !== 1) && (tBool !== 0)) {
      return false
    }
    const editable = tBool === true || tBool === 1
    if (this.pMember) this.pMember.editable = editable
    if (this.pSprite) this.pSprite.editable = editable
    return true
  }

  setFocus(tBool) {
    switch (tBool) {
      case true:
      case 1:
        // the keyboardFocusSprite = this.pSprite.spriteNum
        break
      case false:
      case 0:
        // the keyboardFocusSprite = 0
        break
      default:
        return false
    }
    return true
  }

  render() {
    if (this.pSprite) {
      this.pwidth = this.pSprite.width
      this.pheight = this.pSprite.height
    }
    if (this.pMember) {
      this.pMember.rect = rect(0, 0, this.pwidth, this.pheight)
    }
  }

  draw(tRGB) {
    if (!tRGB || typeof tRGB !== 'object') {
      tRGB = { r: 255, g: 0, b: 0 }
    }
    // (the stage).image.draw(this.pSprite.rect, { shapeType: #rect, color: tRGB })
    // Canvas placeholder
  }
}
