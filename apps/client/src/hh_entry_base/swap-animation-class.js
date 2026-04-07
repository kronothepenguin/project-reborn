// hh_entry_base/5_Swap Animation Class.ls → swap-animation-class.js
// Swap animation - handles member swap and palette swap animations on sprites

import {
  symbol,
  voidP,
  chars,
  length,
  random,
  value,
  error,
  memberExists,
  member,
  EMPTY,
} from '../../core/lingo-runtime.js'
import { receiveUpdate, removeUpdate } from '../../fuse_client/object-api.js'

export class SwapAnimationClass {
  constructor() {
    this.pPrefs = null
    this.pAnimFrame = 0
    this.pInitDelayCounter = 0
    this.pAnimDelayCounter = 0
    this.pMemberClass = null
    this.pPaletteClass = null
    this.pCurrentFrame = 0
    this.pFrameList = []
    this.pAnimLoopCounter = 1
    this.pAnimStopped = 1
  }

  deconstruct() {
    removeUpdate(this.getID())
    this.pAnimStopped = 1
    return true
  }

  getID() {
    return 'hh_entry_base.swap_animation'
  }

  define(tPrefs) {
    this.pPrefs = tPrefs
    if (this.pPrefs[symbol('#animType')] === symbol('#memberSwap')) {
      const tMem = this.pPrefs[symbol('#sprite')].member.name
      this.pMemberClass = chars(tMem, 1, length(tMem) - 1)
    } else {
      if (this.pPrefs[symbol('#sprite')].member.paletteRef === undefined || this.pPrefs[symbol('#sprite')].member.paletteRef === null) {
        return error(this, 'Palette must be a cast member for palette animations!', symbol('#define'), symbol('#major'))
      }
      const tMem = this.pPrefs[symbol('#sprite')].member.paletteRef.name
      this.pPaletteClass = chars(tMem, 1, length(tMem) - 1)
    }
    this.setInitDelay()
    this.setAnimDelay()
    if (this.pPrefs[symbol('#frameList')] !== EMPTY) {
      this.pFrameList = value(this.pPrefs[symbol('#frameList')])
    } else {
      let tMemFound = 1
      let tIndex = 1
      while (tMemFound && tIndex < 100) {
        let tMem
        if (this.pMemberClass) {
          tMem = this.pMemberClass + tIndex
        } else {
          tMem = this.pPaletteClass + tIndex
        }
        if (memberExists(tMem)) {
          this.pFrameList.push(tIndex)
        } else {
          tMemFound = 0
        }
        tIndex = tIndex + 1
      }
    }
    this.pAnimStopped = 0
    receiveUpdate(this.getID())
    return true
  }

  setInitDelay() {
    if (this.pPrefs[symbol('#initDelayType')] === symbol('#random')) {
      this.pInitDelayCounter = random(this.pPrefs[symbol('#initDelay')])
    } else {
      this.pInitDelayCounter = this.pPrefs[symbol('#initDelay')]
    }
  }

  setAnimDelay() {
    if (this.pPrefs[symbol('#animDelayType')] === symbol('#random')) {
      this.pAnimDelayCounter = random(this.pPrefs[symbol('#animDelay')])
    } else {
      this.pAnimDelayCounter = this.pPrefs[symbol('#animDelay')]
    }
  }

  update() {
    if (this.pAnimStopped) {
      return false
    }
    this.pInitDelayCounter = this.pInitDelayCounter - 1
    if (this.pInitDelayCounter < 0) {
      this.pAnimDelayCounter = this.pAnimDelayCounter - 1
      if (this.pAnimDelayCounter < 0) {
        this.advanceAnimFrame()
        this.setAnimDelay()
      }
    }
  }

  advanceAnimFrame() {
    if (this.pAnimStopped) {
      return false
    }
    this.pCurrentFrame = this.pCurrentFrame + 1
    if (this.pCurrentFrame > this.pFrameList.length) {
      if (this.pPrefs[symbol('#animLoopCount')] > 0) {
        this.pAnimLoopCounter = this.pAnimLoopCounter + 1
        if (this.pAnimLoopCounter > this.pPrefs[symbol('#animLoopCount')]) {
          return removeUpdate(this.getID())
        }
      }
      this.setInitDelay()
      if (this.pInitDelayCounter > 0) {
        this.pCurrentFrame = 0
        return false
      } else {
        this.pCurrentFrame = 1
      }
    }
    if (Array.isArray(this.pFrameList) && this.pFrameList.length > 0) {
      const tAnimFrame = value(this.pFrameList[this.pCurrentFrame - 1])
      if (this.pAnimStopped) {
        // nothing
      } else if (!voidP(this.pMemberClass)) {
        const tMem = this.pMemberClass + tAnimFrame
        this.pPrefs[symbol('#sprite')].member = tMem
        this.pPrefs[symbol('#sprite')].width = member(tMem).width
        this.pPrefs[symbol('#sprite')].height = member(tMem).height
      } else {
        const tMem = this.pPaletteClass + tAnimFrame
        this.pPrefs[symbol('#sprite')].member.paletteRef = member(tMem)
      }
    }
  }
}
