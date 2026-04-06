// fuse_client/56_Element Wrapper Class.ls → element-wrapper-class.js
// Element wrapper - groups UI elements and handles scaling/movement

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  listp,
  point,
  error,
  call,
  member,
  getMember,
  createPropList,
} from '../core/lingo-runtime.js'

export class ElementWrapperClass {
  constructor() {
    this.pID = null
    this.pElemList = []
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
  }

  construct() {
    this.pElemList = []
    this.pPalette = symbol('#systemMac')
    this.pScaleH = symbol('#fixed')
    this.pScaleV = symbol('#fixed')
    this.pLocX = 0
    this.pLocY = 0
    this.pwidth = 0
    this.pheight = 0
    this.pVisible = true
    return true
  }

  deconstruct() {
    for (const elem of this.pElemList) {
      if (elem && elem.deconstruct) elem.deconstruct()
    }
    this.pElemList = []
    this.pBuffer = null
    this.pSprite = null
    return true
  }

  define(tProps) {
    this.pID = tProps.id
    this.pBuffer = tProps.buffer
    this.pSprite = tProps.sprite
    this.pLocX = tProps.locX
    this.pLocY = tProps.locY
    this.pwidth = this.pBuffer ? this.pBuffer.width : 0
    this.pheight = this.pBuffer ? this.pBuffer.height : 0
    this.pPalette = this.pBuffer ? this.pBuffer.paletteRef : symbol('#systemMac')
    return true
  }

  add(tElement) {
    if (!objectp(tElement)) return false
    if (tElement.getProperty(symbol('#scaleH')) !== symbol('#fixed')) {
      this.pScaleH = symbol('#scale')
    }
    if (tElement.getProperty(symbol('#scaleV')) !== symbol('#fixed')) {
      this.pScaleV = symbol('#scale')
    }
    this.pElemList.push(tElement)
    return true
  }

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
    this.moveBy(tLocX - this.pLocX, tLocY - this.pLocY)
  }

  moveBy(tOffX, tOffY) {
    this.pLocX += tOffX
    this.pLocY += tOffY
    if (this.pSprite) {
      this.pSprite.locH += tOffX
      this.pSprite.locV += tOffY
    }
  }

  resizeBy(tOffW, tOffH) {
    if ((tOffW !== 0) || (tOffH !== 0)) {
      let actualOffW = tOffW
      let actualOffH = tOffH
      switch (this.pScaleH) {
        case symbol('#fixed'):
          actualOffW = 0
          break
        case symbol('#scale'):
          this.pwidth += tOffW
          break
        case symbol('#move'):
          this.moveBy(tOffW, 0)
          break
        case symbol('#center'):
          this.moveBy(tOffW / 2, 0)
          break
      }
      if (this.pScaleH !== symbol('#scale')) actualOffW = 0

      switch (this.pScaleV) {
        case symbol('#fixed'):
          actualOffH = 0
          break
        case symbol('#scale'):
          this.pheight += tOffH
          break
        case symbol('#move'):
          this.moveBy(0, tOffH)
          break
        case symbol('#center'):
          this.moveBy(0, tOffH / 2)
          break
      }
      if (this.pScaleV !== symbol('#scale')) actualOffH = 0

      if ((actualOffW !== 0) || (actualOffH !== 0)) {
        if (this.pwidth < 1) this.pwidth = 1
        if (this.pheight < 1) this.pheight = 1
        // pBuffer.image = image(pwidth, pheight, depth, palette) - Canvas placeholder
        if (this.pBuffer) {
          this.pBuffer.regPoint = { locH: 0, locV: 0 }
        }
        if (this.pSprite) {
          this.pSprite.width = this.pwidth
          this.pSprite.height = this.pheight
          this.pSprite.stretch = false
        }
        for (const elem of this.pElemList) {
          if (elem && elem.resizeBy) elem.resizeBy(actualOffW, actualOffH)
        }
      }
    }
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#image'): return this.pBuffer ? this.pBuffer.image : null
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
      case symbol('#width'): return this.pwidth
      case symbol('#height'): return this.pheight
      case symbol('#depth'): return this.pBuffer && this.pBuffer.image ? this.pBuffer.image.depth : 0
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
        this.resizeBy(this.pwidth - tValue, 0)
        break
      case symbol('#height'):
        this.resizeBy(0, this.pheight - tValue)
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
        if (this.pBuffer) {
          const tRegPnt = this.pBuffer.regPoint
          this.pBuffer.image = tValue
          this.pBuffer.regPoint = tRegPnt
          if (this.pSprite) {
            this.pSprite.width = this.pBuffer.width
            this.pSprite.height = this.pBuffer.height
          }
          this.pwidth = this.pBuffer.width
          this.pheight = this.pBuffer.height
        }
        break
      case symbol('#buffer'):
      case symbol('#member'):
        if (stringp(tValue)) {
          this.pBuffer = getMember(tValue)
        } else if (integerp(tValue)) {
          this.pBuffer = member(tValue)
        } else {
          return error(this, "Can't set #buffer/#member to type: " + typeof tValue, symbol('#setProperty'), symbol('#minor'))
        }
        this.pwidth = this.pBuffer.width
        this.pheight = this.pBuffer.height
        this.pPalette = this.pBuffer.paletteRef
        if (this.pSprite) this.pSprite.castNum = this.pBuffer.number
        break
      case symbol('#palette'):
        this.pPalette = tValue
        if (this.pBuffer && this.pBuffer.image) this.pBuffer.image.paletteRef = this.pPalette
        break
      case symbol('#depth'):
        if (this.pBuffer && this.pBuffer.image) {
          // Duplicate and recreate image at new depth - Canvas placeholder
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

  prepare() {
    for (const elem of this.pElemList) {
      if (elem && elem.prepare) elem.prepare()
    }
  }

  render() {
    if (this.pVisible) {
      for (const elem of this.pElemList) {
        if (elem && elem.render) elem.render()
      }
    }
  }

  draw(tRGB) {
    for (const elem of this.pElemList) {
      if (elem && elem.draw) elem.draw(tRGB)
    }
  }
}
