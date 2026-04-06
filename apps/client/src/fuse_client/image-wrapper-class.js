// fuse_client/59_Image Wrapper Class.ls → image-wrapper-class.js
// Image wrapper - handles image display with scrolling and offset support

import {
  symbol,
  symbolp,
  voidP,
  point,
  rect,
  error,
  call,
  createPropList,
} from '../core/lingo-runtime.js'
import { UniqueElementClass } from './unique-element-class.js'

export class ImageWrapperClass extends UniqueElementClass {
  constructor() {
    super()
    this.pOwnX = 0
    this.pOwnY = 0
    this.pOwnW = 0
    this.pOwnH = 0
    this.pOffX = 0
    this.pOffY = 0
    this.pScrolls = []
    this.pUpdateLock = false
  }

  prepare() {
    this.pOffX = 0
    this.pOffY = 0
    this.pOwnW = this.pProps.width
    this.pOwnH = this.pProps.height
    this.pScrolls = []
    this.pUpdateLock = false
    this.pDepth = 32
    // this.pimage = image(this.pwidth, this.pheight, this.pDepth)
    if (this.pProps.style === symbol('#unique')) {
      this.pOwnX = 0
      this.pOwnY = 0
    } else {
      this.pOwnX = this.pProps.locH
      this.pOwnY = this.pProps.locV
    }
    if (this.pProps.flipH) this.flipH()
    if (this.pProps.flipV) this.flipV()
    return true
  }

  feedImage(tImage) {
    if (!tImage || typeof tImage !== 'object') {
      return error(this, 'Image object expected! ' + tImage, symbol('#feedImage'), symbol('#minor'))
    }
    const tTargetRect = rect(this.pOwnX, this.pOwnY, this.pOwnX + this.pOwnW, this.pOwnY + this.pOwnH)
    // this.pBuffer.image.fill(tTargetRect, this.pProps.bgColor)
    this.pimage = tImage
    this.render()
    this.pUpdateLock = true
    this.registerScroll()
    this.pUpdateLock = false
    return true
  }

  clearImage() {
    const tTargetRect = rect(this.pOwnX, this.pOwnY, this.pOwnX + this.pOwnW, this.pOwnY + this.pOwnH)
    // this.pBuffer.image.fill(tTargetRect, this.pProps.bgColor)
  }

  clearBuffer() {
    // this.pimage.fill(this.pimage.rect, this.pProps.bgColor)
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
    const tSourceRect = rect(this.pOffX, this.pOffY, this.pOffX + this.pOwnW, this.pOffY + this.pOwnH)
    const tScrollList = []
    // const tWndObj = getWindowManager().GET(this.pMotherId)
    // for (const tScrollId of this.pScrolls) {
    //   tScrollList.push(tWndObj.getElement(tScrollId))
    // }
    // call(symbol('#updateData'), tScrollList, tSourceRect, this.pimage.rect)
  }

  adjustOffsetTo(tX, tY) {
    this.pOffX = tX
    this.pOffY = tY
    if (!this.pUpdateLock) {
      this.clearImage()
      this.render()
    }
  }

  adjustOffsetBy(tOffX, tOffY) {
    this.pOffX += tOffX
    this.pOffY += tOffY
    if (!this.pUpdateLock) {
      this.clearImage()
      this.render()
    }
  }

  adjustXOffsetTo(tX) {
    this.adjustOffsetTo(tX, this.pOffY)
  }

  adjustYOffsetTo(tY) {
    this.adjustOffsetTo(this.pOffX, tY)
  }

  setOffsetX(tX) {
    this.adjustOffsetTo(tX, this.pOffY)
  }

  setOffsetY(tY) {
    this.adjustOffsetTo(this.pOffX, tY)
  }

  getOffsetX() {
    return this.pOffX
  }

  getOffsetY() {
    return this.pOffY
  }

  resizeBy(tOffH, tOffV, tForcedTag) {
    if ((tOffH !== 0) || (tOffV !== 0)) {
      if (this.pProps.style === symbol('#unique')) {
        switch (this.pScaleH) {
          case symbol('#move'):
            this.moveBy(tOffH, 0)
            break
          case symbol('#scale'):
            this.pwidth += tOffH
            break
          case symbol('#center'):
            this.moveBy(tOffH / 2, 0)
            break
          case symbol('#fixed'):
            if (tForcedTag) this.pwidth += tOffH
            break
        }
        switch (this.pScaleV) {
          case symbol('#move'):
            this.moveBy(0, tOffV)
            break
          case symbol('#scale'):
            this.pheight += tOffV
            break
          case symbol('#center'):
            this.moveBy(0, tOffV / 2)
            break
          case symbol('#fixed'):
            if (tForcedTag) this.pheight += tOffV
            break
        }
        if (this.pwidth < 1) this.pwidth = 1
        if (this.pheight < 1) this.pheight = 1
        this.pOwnW = this.pwidth
        this.pOwnH = this.pheight
        // this.pBuffer.image = image(this.pOwnW, this.pOwnH, this.pDepth)
        if (this.pBuffer) this.pBuffer.regPoint = { locH: 0, locV: 0 }
        if (this.pSprite) {
          this.pSprite.width = this.pOwnW
          this.pSprite.height = this.pOwnH
        }
      } else {
        switch (this.pScaleH) {
          case symbol('#move'):
            this.pOwnX += tOffH
            break
          case symbol('#scale'):
            this.pOwnW += tOffH
            break
          case symbol('#center'):
            this.pOwnX += tOffH / 2
            break
          case symbol('#fixed'):
            if (tForcedTag && this.pSprite) {
              this.pSprite.width += tOffH
              this.pOwnW = this.pSprite.width
            }
            break
        }
        switch (this.pScaleV) {
          case symbol('#move'):
            this.pOwnY += tOffV
            break
          case symbol('#scale'):
            this.pOwnH += tOffV
            break
          case symbol('#center'):
            this.pOwnY += tOffV / 2
            break
          case symbol('#fixed'):
            if (tForcedTag && this.pSprite) {
              this.pSprite.height += tOffV
              this.pOwnH = this.pSprite.height
            }
            break
        }
      }
      this.registerScroll()
      this.render()
    }
  }

  render() {
    if (!this.pVisible) return
    const tTargetRect = rect(this.pOwnX, this.pOwnY, this.pOwnX + this.pOwnW, this.pOwnY + this.pOwnH)
    const tSourceRect = rect(this.pOffX, this.pOffY, this.pOffX + this.pOwnW, this.pOffY + this.pOwnH)
    // In Director: this.pBuffer.image.copyPixels(this.pimage, tTargetRect, tSourceRect, this.pParams)
    // In JS Canvas: drawImage with source/dest rects
  }

  mouseDown() {
    // return point(the mouseH - this.pSprite.locH + this.pOwnX + this.pOffX, the mouseV - this.pSprite.locV + this.pOwnY + this.pOffY)
    return point(0, 0) // Placeholder for mouse position
  }

  mouseUp() {
    // return point(the mouseH - this.pSprite.locH + this.pOwnX + this.pOffX, the mouseV - this.pSprite.locV + this.pOwnY + this.pOffY)
    return point(0, 0)
  }

  mouseWithin() {
    // return point(the mouseH - this.pSprite.locH + this.pOwnX + this.pOffX, the mouseV - this.pSprite.locV + this.pOwnY + this.pOffY)
    return point(0, 0)
  }
}
