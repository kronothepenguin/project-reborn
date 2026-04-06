// fuse_client/58_Unique Element Class.ls → unique-element-class.js
// Unique element - standalone UI element with its own sprite

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
  getMember,
  error,
  getResourceManager,
} from '../core/lingo-runtime.js'

export class UniqueElementClass {
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
    this.pVisible = true
    this.pDepth = 32
    this.pimage = null
    this.pParams = null
    this.pProps = null
  }

  define(tProps) {
    this.pID = tProps.id
    this.pMotherId = tProps.mother
    this.pType = tProps.type
    this.pScaleH = tProps.scaleH
    this.pScaleV = tProps.scaleV
    this.pBuffer = tProps.buffer
    this.pSprite = tProps.sprite
    this.pLocX = tProps.locH
    this.pLocY = tProps.locV
    this.pwidth = tProps.width
    this.pheight = tProps.height
    this.pPalette = tProps.palette
    this.pProps = tProps
    this.pDepth = 32
    this.pVisible = true

    if (voidP(this.pPalette)) {
      this.pPalette = symbol('#systemMac')
    } else if (stringp(this.pPalette)) {
      this.pPalette = member(getResourceManager().getmemnum(this.pPalette))
    }

    const tMemNum = getResourceManager().getmemnum(this.pProps.member)
    if (tMemNum > 0) {
      const tmember = member(tMemNum)
      if (tmember && tmember.type === symbol('#bitmap') && tmember.image) {
        this.pimage = { ...tmember.image }
        this.pDepth = tmember.image.depth || 32
        if (this.pimage.paletteRef !== this.pPalette) {
          this.pimage.paletteRef = this.pPalette
        }
      }
    }

    if (voidP(this.pimage)) {
      this.pDepth = 32
      this.pimage = { width: 1, height: 1, depth: this.pDepth, paletteRef: this.pPalette }
    }

    if (this.pProps.flipH) this.flipH()
    if (this.pProps.flipV) this.flipV()

    this.pParams = {}
    if (tProps.blend < 100) this.pParams.blend = tProps.blend
    if (tProps.color && (tProps.color.r !== 0 || tProps.color.g !== 0 || tProps.color.b !== 0)) {
      this.pParams.color = tProps.color
    }
    if (tProps.bgColor && (tProps.bgColor.r !== 255 || tProps.bgColor.g !== 255 || tProps.bgColor.b !== 255)) {
      this.pParams.bgColor = tProps.bgColor
    }
    if (tProps.ink !== 0) this.pParams.ink = tProps.ink
    if (Object.keys(this.pParams).length === 0) this.pParams = null

    return true
  }

  prepare() {}

  show() {
    this.pVisible = true
    if (this.pSprite) this.pSprite.visible = true
    return true
  }

  hide() {
    this.pVisible = false
    if (this.pSprite) this.pSprite.visible = false
    return true
  }

  moveTo(tLocX, tLocY) {
    const tOffX = tLocX - this.pLocX
    const tOffY = tLocY - this.pLocY
    this.pLocX = tLocX
    this.pLocY = tLocY
    if (this.pSprite) {
      this.pSprite.locH += tOffX
      this.pSprite.locV += tOffY
    }
  }

  moveBy(tOffX, tOffY) {
    this.pLocX += tOffX
    this.pLocY += tOffY
    if (this.pSprite) {
      this.pSprite.locH += tOffX
      this.pSprite.locV += tOffY
    }
  }

  resizeTo(tX, tY, tForcedTag) {
    return this.resizeBy(tX - (this.pSprite ? this.pSprite.width : 0), tY - (this.pSprite ? this.pSprite.height : 0), tForcedTag)
  }

  resizeBy(tOffH, tOffV, tForcedTag) {
    if ((tOffH !== 0) || (tOffV !== 0)) {
      switch (this.pScaleH) {
        case symbol('#move'):
          this.moveBy(tOffH, 0)
          break
        case symbol('#scale'):
          if (this.pSprite) this.pSprite.width += tOffH
          break
        case symbol('#center'):
          this.moveBy(tOffH / 2, 0)
          break
        case symbol('#fixed'):
          if (tForcedTag && this.pSprite) this.pSprite.width += tOffH
          break
      }
      switch (this.pScaleV) {
        case symbol('#move'):
          this.moveBy(0, tOffV)
          break
        case symbol('#scale'):
          if (this.pSprite) this.pSprite.height += tOffV
          break
        case symbol('#center'):
          this.moveBy(0, tOffV / 2)
          break
        case symbol('#fixed'):
          if (tForcedTag && this.pSprite) this.pSprite.height += tOffV
          break
      }
      if (this.pSprite) {
        this.pwidth = this.pSprite.width
        this.pheight = this.pSprite.height
      }
      this.render()
    }
  }

  flipH() {
    if (!this.pimage) return
    this.pimage.flippedH = true
  }

  flipV() {
    if (!this.pimage) return
    this.pimage.flippedV = true
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#image'): return this.pimage
      case symbol('#buffer'): return this.pBuffer
      case symbol('#member'): return this.pBuffer
      case symbol('#sprite'): return this.pSprite
      case symbol('#scaleH'): return this.pScaleH
      case symbol('#scaleV'): return this.pScaleV
      case symbol('#locX'): return this.pLocX
      case symbol('#locY'): return this.pLocY
      case symbol('#locH'): return this.pLocX
      case symbol('#locV'): return this.pLocY
      case symbol('#locZ'): return this.pSprite ? this.pSprite.locZ : 0
      case symbol('#width'): return this.pSprite ? this.pSprite.width : this.pwidth
      case symbol('#height'): return this.pSprite ? this.pSprite.height : this.pheight
      case symbol('#rect'): return this.pSprite ? this.pSprite.rect : rect(this.pLocX, this.pLocY, this.pLocX + this.pwidth, this.pLocY + this.pheight)
      case symbol('#depth'): return this.pDepth
      case symbol('#color'): return this.pSprite ? this.pSprite.color : null
      case symbol('#bgColor'): return this.pSprite ? this.pSprite.bgColor : null
      case symbol('#blend'): return this.pSprite ? this.pSprite.blend : 100
      case symbol('#ink'): return this.pSprite ? this.pSprite.ink : 0
      case symbol('#palette'): return this.pPalette
      case symbol('#visible'): return this.pVisible
      case symbol('#cursor'): return this.pSprite ? this.pSprite.cursor : null
      default: return 0
    }
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case symbol('#scaleH'):
        this.pScaleH = tValue
        break
      case symbol('#scaleV'):
        this.pScaleV = tValue
        break
      case symbol('#locX'):
        this.moveTo(tValue, this.pLocY)
        break
      case symbol('#locY'):
        this.moveTo(this.pLocX, tValue)
        break
      case symbol('#locH'):
        this.moveTo(tValue, this.pLocY)
        break
      case symbol('#locV'):
        this.moveTo(this.pLocX, tValue)
        break
      case symbol('#width'):
        this.resizeTo(tValue, this.pheight)
        break
      case symbol('#height'):
        this.resizeTo(this.pwidth, tValue)
        break
      case symbol('#color'):
        if (this.pSprite) this.pSprite.color = tValue
        break
      case symbol('#bgColor'):
        if (this.pSprite) this.pSprite.bgColor = tValue
        break
      case symbol('#blend'):
        if (this.pSprite) this.pSprite.blend = tValue
        break
      case symbol('#ink'):
        if (this.pSprite) this.pSprite.ink = tValue
        break
      case symbol('#cursor'):
        if (this.pSprite && this.pSprite.setcursor) this.pSprite.setcursor(tValue)
        break
      case symbol('#image'):
        this.pimage = tValue
        this.render()
        break
      case symbol('#buffer'):
      case symbol('#member'):
        if (objectp(tValue)) {
          if (this.pSprite) this.pSprite.member = tValue
        } else if (stringp(tValue)) {
          if (this.pSprite) this.pSprite.member = getMember(tValue)
        } else if (integerp(tValue)) {
          if (this.pSprite) this.pSprite.member = member(tValue)
        } else {
          return error(this, "Can't set #buffer/#member to type: " + typeof tValue, symbol('#setProperty'), symbol('#minor'))
        }
        if (this.pSprite && this.pSprite.member) {
          this.pSprite.width = this.pSprite.member.width
          this.pSprite.height = this.pSprite.member.height
        }
        break
      case symbol('#palette'):
        this.pPalette = tValue
        if (this.pimage) this.pimage.paletteRef = this.pPalette
        break
      case symbol('#depth'):
        this.pDepth = tValue
        if (this.pimage) {
          // Recreate image at new depth - Canvas placeholder
        }
        break
      case symbol('#visible'):
        if (tValue) this.show()
        else this.hide()
        break
      default:
        return false
    }
    return true
  }

  render() {
    if (!this.pBuffer || !this.pBuffer.image || !this.pimage) return
    // In Director: pBuffer.image.copyPixels(pimage, pBuffer.image.rect, pimage.rect, pParams)
    // In JS Canvas: drawImage with source/dest rects and blend/color params
  }

  draw(tRGB) {
    if (!tRGB || typeof tRGB !== 'object') {
      tRGB = { r: 255, g: 0, b: 0 }
    }
    // In Director: pBuffer.image.draw(rect, { shapeType: #rect, color: tRGB })
    // In JS Canvas: fillRect with color
  }
}
