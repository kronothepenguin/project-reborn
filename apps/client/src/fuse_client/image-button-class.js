// fuse_client/64_Image Button Class.ls → image-button-class.js
// Image button - button with image states (active/pressed)

import {
  symbol,
  symbolp,
  stringp,
  voidP,
  member,
  getmemnum,
  createPropList,
  error,
} from '../core/lingo-runtime.js'
import { CommonButtonClass } from './common-button-class.js'

export class ImageButtonClass extends CommonButtonClass {
  constructor() {
    super()
  }

  prepare() {
    this.pBlend = this.pProps.blend
    this.pButtonImg = createPropList()
    if (voidP(this.pFixedSize)) this.pFixedSize = false

    // Extract member name without extension
    let tMemName = this.pProps.member
    if (typeof tMemName === 'string') {
      const dotIdx = tMemName.lastIndexOf('.')
      if (dotIdx >= 0) {
        tMemName = tMemName.substring(0, dotIdx)
      }
    }

    this.UpdateImageObjects(null, symbol('#up'), tMemName)
    this.UpdateImageObjects(null, symbol('#down'), tMemName)
    this.pimage = this.createButtonImg(symbol('#up'))

    const tTempOffset = this.pBuffer ? this.pBuffer.regPoint : null
    if (this.pBuffer) {
      this.pBuffer.image = this.pimage
      this.pBuffer.regPoint = tTempOffset
    }
    this.pwidth = this.pimage ? this.pimage.width : 0
    this.pheight = this.pimage ? this.pimage.height : 0
    if (this.pSprite) {
      this.pSprite.width = this.pwidth
      this.pSprite.height = this.pheight
    }
    return true
  }

  changeState(tstate) {
    this.pimage = this.createButtonImg(tstate)
    this.render()
  }

  UpdateImageObjects(tPalette, tstate, tMemName) {
    if (voidP(tPalette)) {
      tPalette = this.pPalette
    } else if (stringp(tPalette)) {
      tPalette = member(getmemnum(tPalette))
    }
    if (tstate === symbol('#up')) {
      tMemName = tMemName + '.active'
    } else if (tstate === symbol('#down')) {
      tMemName = tMemName + '.pressed'
    }
    const tMemNum = getmemnum(tMemName)
    if (tMemNum === 0) {
      return error(this, 'Member not found: ' + tMemName, symbol('#UpdateImageObjects'), symbol('#minor'))
    }
    const tmember = member(tMemNum)
    let tImage = tmember && tmember.image ? { ...tmember.image } : null
    if (tImage && tImage.paletteRef !== tPalette) {
      tImage.paletteRef = tPalette
    }
    this.pButtonImg.setaProp(tstate, tImage)
  }

  createButtonImg(tstate) {
    return this.pButtonImg.getaProp(tstate)
  }
}
