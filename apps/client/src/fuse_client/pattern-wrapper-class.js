// fuse_client/62_Pattern Wrapper Class.ls → pattern-wrapper-class.js
// Pattern wrapper - tiles an image across an area

import {
  symbol,
  rect,
} from '../core/lingo-runtime.js'
import { ImageWrapperClass } from './image-wrapper-class.js'

export class PatternWrapperClass extends ImageWrapperClass {
  constructor() {
    super()
  }

  feedImage(tImage) {
    this.pimage = tImage
    this.render()
    return true
  }

  moveTo(tX, tY) {
    this.pLocX = tX
    this.pLocY = tY
    this.render()
  }

  moveBy(tX, tY) {
    this.pLocX += tX
    this.pLocY += tY
    this.render()
  }

  resizeTo(tX, tY) {
    return this.resizeBy(tX - this.pwidth, tY - this.pheight)
  }

  resizeBy(tOffH, tOffV) {
    if ((tOffH !== 0) || (tOffV !== 0)) {
      switch (this.pScaleH) {
        case symbol('#move'):
          this.pLocX += tOffH
          break
        case symbol('#scale'):
          this.pwidth += tOffH
          break
        case symbol('#center'):
          this.pLocX += tOffH / 2
          break
      }
      switch (this.pScaleV) {
        case symbol('#move'):
          this.pLocY += tOffV
          break
        case symbol('#scale'):
          this.pheight += tOffV
          break
        case symbol('#center'):
          this.pLocY += tOffV / 2
          break
      }
      this.render()
    }
  }

  render() {
    if (!this.pVisible || !this.pimage) return
    const tW = this.pimage.width || 0
    const tH = this.pimage.height || 0
    const tXW = Math.floor(this.pwidth / tW)
    const tXH = Math.floor(this.pheight / tH)
    // Tile the pattern image across the buffer
    for (let i = 0; i < tXW; i++) {
      for (let j = 0; j < tXH; j++) {
        const tXi = this.pLocX + (i * tW)
        const tYi = this.pLocY + (j * tH)
        const tRect = rect(tXi, tYi, tXi + tW, tYi + tH)
        // this.pBuffer.image.copyPixels(this.pimage, tRect, this.pimage.rect, this.pParams)
        // Canvas placeholder for pattern tiling
      }
    }
  }

  draw() {
    // this.pBuffer.image.draw(rect, { shapeType: #rect, color: rgb(255, 0, 128) })
  }
}
