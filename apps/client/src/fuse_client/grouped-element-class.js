// fuse_client/57_Grouped Element Class.ls → grouped-element-class.js
// Grouped element - UI element that belongs to a wrapper group

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  point,
  rect,
  member,
  createPropList,
  getResourceManager,
} from '../core/lingo-runtime.js'

export class GroupedElementClass {
  constructor() {
    this.pID = null
    this.pMotherId = null
    this.pType = ''
    this.pBuffer = null
    this.pSprite = null
    this.pPalette = symbol('#systemMac')
    this.pScaleH = symbol('#fixed')
    this.pScaleV = symbol('#fixed')
    this.pLocX = 0
    this.pLocY = 0
    this.pwidth = 0
    this.pheight = 0
    this.pDepth = 0
    this.pimage = null
    this.pParams = null
    this.pProps = null
    this.pVisible = true
  }

  define(tProps) {
    this.pID = tProps.id
    this.pMotherId = tProps.mother
    this.pType = tProps.type
    this.pBuffer = tProps.buffer
    this.pSprite = tProps.sprite
    this.pPalette = tProps.palette
    this.pScaleH = tProps.scaleH
    this.pScaleV = tProps.scaleV
    this.pLocX = tProps.locH
    this.pLocY = tProps.locV
    this.pwidth = tProps.width
    this.pheight = tProps.height
    this.pProps = tProps
    this.pVisible = true

    if (voidP(this.pPalette)) {
      this.pPalette = symbol('#systemMac')
    } else if (stringp(this.pPalette)) {
      this.pPalette = member(getResourceManager().getmemnum(this.pPalette))
    }

    let tMemNum = 0
    if (!voidP(this.pProps.member)) {
      tMemNum = getResourceManager().getmemnum(this.pProps.member)
    }

    if ((tMemNum > 0) && (this.pType !== 'image')) {
      const tmember = member(tMemNum)
      this.pDepth = tmember.image ? tmember.image.depth : 32
      this.pimage = tmember.image ? { ...tmember.image } : null
      if (this.pimage && this.pimage.paletteRef !== this.pPalette) {
        this.pimage.paletteRef = this.pPalette
      }
    } else {
      this.pDepth = 32
      this.pimage = { width: 1, height: 1, depth: this.pDepth, paletteRef: this.pPalette }
    }

    if (this.pProps.flipH) this.flipH()
    if (this.pProps.flipV) this.flipV()

    this.pParams = createPropList()
    if (tProps.blend < 100) this.pParams.setaProp(symbol('#blend'), tProps.blend)
    if (tProps.color && (tProps.color.r !== 0 || tProps.color.g !== 0 || tProps.color.b !== 0)) {
      this.pParams.setaProp(symbol('#color'), tProps.color)
    }
    if (tProps.bgColor && (tProps.bgColor.r !== 255 || tProps.bgColor.g !== 255 || tProps.bgColor.b !== 255)) {
      this.pParams.setaProp(symbol('#bgColor'), tProps.bgColor)
    }
    if (tProps.ink !== 0) this.pParams.setaProp(symbol('#ink'), tProps.ink)
    if (this.pParams.count === 0) this.pParams = null

    return true
  }

  prepare() {
    // No-op
  }

  moveTo(tLocX, tLocY) {
    this.pLocX = tLocX
    this.pLocY = tLocY
    this.render()
  }

  moveBy(tOffX, tOffY) {
    this.pLocX += tOffX
    this.pLocY += tOffY
    this.render()
  }

  resizeTo(tX, tY) {
    return this.resizeBy(tX - this.pwidth, tY - this.pheight)
  }

  resizeBy(tOffH, tOffV) {
    switch (this.pScaleH) {
      case symbol('#move'):
        this.pLocX += tOffH
        break
      case symbol('#center'):
        this.pLocX += tOffH / 2
        break
      case symbol('#scale'):
        this.pwidth += tOffH
        break
    }
    switch (this.pScaleV) {
      case symbol('#move'):
        this.pLocY += tOffV
        break
      case symbol('#center'):
        this.pLocY += tOffV / 2
        break
      case symbol('#scale'):
        this.pheight += tOffV
        break
    }
    this.render()
  }

  flipH() {
    if (!this.pimage) return
    // In Director: copyPixels with flipped quad
    // In JS Canvas: this would be a horizontal flip operation
    this.pimage.flippedH = true
  }

  flipV() {
    if (!this.pimage) return
    this.pimage.flippedV = true
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#buffer'): return this.pBuffer
      case symbol('#sprite'): return this.pSprite
      case symbol('#width'): return this.pwidth
      case symbol('#height'): return this.pheight
      case symbol('#locX'): return this.pLocX
      case symbol('#locY'): return this.pLocY
      case symbol('#scaleH'): return this.pScaleH
      case symbol('#scaleV'): return this.pScaleV
      case symbol('#depth'): return this.pDepth
      case symbol('#palette'): return this.pPalette
      default: return 0
    }
  }

  render() {
    if (!this.pBuffer || !this.pBuffer.image) return
    // In Director: pBuffer.image.copyPixels(pimage, tTargetRect, tSourceRect, pParams)
    // In JS Canvas: drawImage with source/dest rects
    const tTargetRect = rect(this.pLocX, this.pLocY, this.pLocX + this.pwidth, this.pLocY + this.pheight)
    const tSourceRect = this.pimage ? rect(0, 0, this.pimage.width || 0, this.pimage.height || 0) : rect(0, 0, 0, 0)
    // Placeholder for actual Canvas rendering
  }

  draw(tRGB) {
    if (!tRGB || typeof tRGB !== 'object') {
      tRGB = { r: 0, g: 0, b: 255 }
    }
    // In Director: pBuffer.image.draw(rect, { shapeType: #rect, color: tRGB })
    // In JS Canvas: fillRect with color
  }
}
