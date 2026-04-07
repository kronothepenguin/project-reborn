// hh_pets_common/2_Petpart Class.ls → petpart-class.js
// Pet part class - handles individual pet body parts (tail, body, head) rendering

import {
  symbol,
  voidP,
  integer,
  getmemnum,
  member,
  memberExists,
  point,
  rect,
  EMPTY,
} from '../core/lingo-runtime.js'
import { getVariable } from '../core/lingo-runtime.js'

export class PetpartClass {
  constructor() {
    this.ancestor = null
    this.pPart = null
    this.pmodel = null
    this.pDirection = 0
    this.pDrawProps = {}
    this.pMemString = EMPTY
    this.pCacheImage = null
    this.pCacheRectA = rect(0, 0, 0, 0)
    this.pCacheRectB = rect(0, 0, 0, 0)
    this.pCacheDir = -1
  }

  deconstruct() {
    this.ancestor = null
    return true
  }

  define(tPart, tmodel, tPalette, tColor, tDirection, tAction, tAncestor) {
    this.ancestor = tAncestor
    this.pPart = tPart
    this.pmodel = tmodel
    this.pDrawProps = { maskImage: 0, ink: 0, bgColor: 0, palette: tPalette }
    this.pCacheImage = null
    this.pCacheRectA = rect(0, 0, 0, 0)
    this.pCacheRectB = rect(0, 0, 0, 0)
    this.defineInk()
    this.setColor(tColor)
    this.pDirection = tDirection
    this.pAction = tAction
    this.pMemString = EMPTY
    this.pCacheDir = -1
    return true
  }

  update() {
    let tAnimCntr = 0
    const tAction = this.pAction
    const tPart = this.pPart
    const tdir = this.ancestor.pFlipList[this.pDirection + 1]
    let tUpdate = 0
    let tBodyDir = this.ancestor.pFlipList[this.ancestor.pDirection + 1] + 1
    if (tBodyDir > 4) {
      tBodyDir = 5
    }

    const tOffsetList = integer(this.ancestor.pXFactor) > 33
      ? this.ancestor.pOffsetList
      : this.ancestor.pOffsetListSmall

    let tXFix = 0
    let tYFix = 0

    switch (this.pPart) {
      case 'bd':
        switch (this.pAction) {
          case 'wlk':
          case 'jmp':
          case 'bnd':
            tAnimCntr = this.ancestor.pAnimCounter
            break
          case 'pla':
          case 'scr':
            tAnimCntr = 1 % this.ancestor.pAnimCounter
            break
        }
        if (this.pDirection !== this.pCacheDir) {
          tUpdate = 1
        }
        break

      case 'hd': {
        const pMainAction = this.ancestor.pMainAction
        if (pMainAction === 'jmp' || pMainAction === 'scr' || pMainAction === 'bnd') {
          const key = 'hd_' + pMainAction + '_' + this.ancestor.pAnimCounter
          tXFix = tOffsetList[key][tBodyDir][0]
          tYFix = tOffsetList[key][tBodyDir][1]
        } else {
          const key = 'hd_' + pMainAction
          tXFix = tOffsetList[key][tBodyDir][0]
          tYFix = tOffsetList[key][tBodyDir][1]
        }
        if (tAction === 'snf' || tAction === 'eat' || tAction === 'spk') {
          tAnimCntr = this.ancestor.pAnimCounter % 2
        }
        tUpdate = 1
        break
      }

      case 'tl': {
        const pMainAction = this.ancestor.pMainAction
        if (pMainAction === 'jmp' || pMainAction === 'scr' || pMainAction === 'bnd') {
          const key = 'tl_' + pMainAction + '_' + this.ancestor.pAnimCounter
          tXFix = tOffsetList[key][tBodyDir][0]
          tYFix = tOffsetList[key][tBodyDir][1]
        } else {
          const key = 'tl_' + pMainAction
          tXFix = tOffsetList[key][tBodyDir][0]
          tYFix = tOffsetList[key][tBodyDir][1]
        }
        if (tAction === 'wav') {
          tAnimCntr = this.ancestor.pAnimCounter % 2
        }
        tUpdate = 1
        break
      }
    }

    const tPartSize = getVariable('human.size.' + integer(this.ancestor.pXFactor))
    let tAnDir = this.ancestor.pDirection
    if (tAnDir > 3 && tAnDir < 7 && tPartSize === 'sh') {
      tXFix = tXFix + integer(this.ancestor.pXFactor) - 7
    }

    const tMemString = this.ancestor.pMemberNamePrefix + tAction + '_' + this.pPart + '_' + this.pmodel + '_' + tdir + '_' + tAnimCntr
    const tMemNum = getmemnum(tMemString)

    if ((this.pMemString !== tMemString) || tUpdate) {
      if (tMemNum > 0) {
        this.pMemString = tMemString
        const tmember = member(tMemNum)
        const tRegPnt = tmember.regPoint
        const tX = -tRegPnt[0] + tXFix
        const tY = this.ancestor.pBuffer.rect.height - tRegPnt[1] - 10 + tYFix
        this.ancestor.pUpdateRect = unionRect(this.ancestor.pUpdateRect, this.pCacheRectA)
        this.pCacheImage = tmember.image
        this.pCacheRectA = rect(tX, tY, tX + this.pCacheImage.width, tY + this.pCacheImage.height)
          .concat(rect(this.ancestor.pLocFix[0], this.ancestor.pLocFix[1], this.ancestor.pLocFix[0], this.ancestor.pLocFix[1]))
        this.pCacheRectB = this.pCacheImage.rect
        this.pDrawProps.maskImage = this.pCacheImage.createMatte()
        this.ancestor.pUpdateRect = unionRect(this.ancestor.pUpdateRect, this.pCacheRectA)
        this.pCacheDir = this.pDirection
      } else {
        if (this.pCacheRectA.width > 0) {
          this.ancestor.pUpdateRect = unionRect(this.ancestor.pUpdateRect, this.pCacheRectA)
          this.pCacheRectA = rect(0, 0, 0, 0)
        }
        return
      }
    }

    member(tMemNum).paletteRef = member(getmemnum(this.pDrawProps.palette))
    this.ancestor.pBuffer.copyPixels(this.pCacheImage, this.pCacheRectA, this.pCacheRectB, this.pDrawProps)
  }

  render() {
    if (memberExists(this.pMemString)) {
      this.ancestor.pBuffer.copyPixels(this.pCacheRectB, this.pCacheRectA, this.pCacheRectB, this.pDrawProps)
    }
  }

  defineDir(tdir, tPart) {
    if (voidP(tPart) || tPart === this.pPart) {
      this.pDirection = tdir
    }
  }

  defineDirMultiple(tdir, tTargetPartList) {
    if (tTargetPartList.indexOf(this.pPart) !== -1) {
      this.pDirection = tdir
    }
  }

  defineAct(tAct, tTargetPartList) {
    if (this.pAction === 'std') {
      this.pAction = tAct
    }
  }

  defineActMultiple(tAct, tTargetPartList) {
    if (tTargetPartList.indexOf(this.pPart) !== -1) {
      if (this.pAction === 'std') {
        this.pAction = tAct
      }
      if (tAct === 'std') {
        this.pAction = 'std'
      }
    }
  }

  defineInk(tInk) {
    if (voidP(tInk)) {
      switch (this.pPart) {
        case 'sd':
          tInk = 32
          break
        default:
          tInk = 41
      }
    }
    this.pDrawProps.ink = tInk
    return true
  }

  setModel(tmodel) {
    this.pmodel = tmodel
  }

  setColor(tColor) {
    if (voidP(tColor)) {
      return 0
    }
    if (tColor === EMPTY) {
      return 0
    }
    if (tColor && tColor.r !== undefined && this.pDrawProps.ink !== 36) {
      this.pDrawProps.bgColor = tColor
    } else {
      this.pDrawProps.bgColor = { r: 255, g: 255, b: 255 }
    }
    return true
  }

  layDown() {
    this.pAction = 'lay'
  }

  getCurrentMember() {
    return this.pMemString
  }

  getColor() {
    return this.pDrawProps.bgColor
  }

  getDirection() {
    return this.pDirection
  }

  copyPicture(tImg, tdir, tHumanSize, tAction, tAnimFrame) {
    if (voidP(tdir)) {
      tdir = '2'
    }
    if (voidP(tHumanSize)) {
      tHumanSize = 'p'
    }
    if (voidP(tAction)) {
      tAction = 'std'
    }
    if (voidP(tAnimFrame)) {
      tAnimFrame = '0'
    }

    let tOffsetList
    if (tHumanSize === 'p') {
      tOffsetList = this.ancestor.pOffsetList
    } else {
      tHumanSize = 's_p'
      tOffsetList = this.ancestor.pOffsetListSmall
    }

    let tOffX = 0
    let tOffY = 0
    if (this.pPart !== 'bd') {
      const key = this.pPart + '_' + tAction
      tOffX = tOffsetList[key][integer(tdir) + 1][0]
      tOffY = tOffsetList[key][integer(tdir) + 1][1]
    }

    const tMemName = tHumanSize + '_' + tAction + '_' + this.pPart + '_' + this.pmodel + '_' + tdir + '_' + tAnimFrame
    if (memberExists(tMemName)) {
      const tmember = member(getmemnum(tMemName))
      const tImage = tmember.image
      const tRegPnt = tmember.regPoint
      const tX = -tRegPnt[0] + tOffX
      const tY = tImg.rect.height - tRegPnt[1] - 10 + tOffY
      const tRect = rect(tX, tY, tX + tImage.width, tY + tImage.height)
      const tMatte = tImage.createMatte()
      tmember.paletteRef = member(getmemnum(this.pDrawProps.palette))
      tImg.copyPixels(tImage, tRect, tImage.rect, {
        maskImage: tMatte,
        ink: this.pDrawProps.ink,
        bgColor: this.pDrawProps.bgColor,
      })
      return true
    }
    return false
  }

  reset() {
    this.pAction = 'std'
  }
}

/**
 * Union of two rects - returns the smallest rect containing both
 */
function unionRect(a, b) {
  return rect(
    Math.min(a.left, b.left),
    Math.min(a.top, b.top),
    Math.max(a.right, b.right),
    Math.max(a.bottom, b.bottom),
  )
}
