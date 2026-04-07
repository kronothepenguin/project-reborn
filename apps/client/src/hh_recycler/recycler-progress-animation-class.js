// hh_recycler/6_Recycler Progress Animation Class.ls → recycler-progress-animation-class.js
// Recycler progress animation - jaw opening/closing animation for recycling progress

import {
  symbol,
  voidP,
  min,
  getVariableValue,
  receivePrepare,
  removePrepare,
} from '../core/lingo-runtime.js'

export class RecyclerProgressAnimationClass {
  constructor() {
    this.pWindowObj = null
    this.pAnimating = false
    this.pUpperJawElement = null
    this.pLowerJawElement = null
    this.pUpperElementDefaultPos = null
    this.pLowerElementDefaultPos = null
    this.pUpperFrameOffs = null
    this.pLowerFrameOffs = null
    this.pCurrentFrame = 1
    this.pCurrentSkipCounter = 0
    this.pMaxFrames = 0
  }

  construct() {
    this.pUpperFrameOffs = getVariableValue('jaw.upper.frame.offsets') || [[0, 0]]
    this.pLowerFrameOffs = getVariableValue('jaw.lower.frame.offsets') || [[0, 0]]
    this.pCurrentFrame = 1
    this.pCurrentSkipCounter = 0
    this.pMaxFrames = min([this.pUpperFrameOffs.length, this.pLowerFrameOffs.length])
    return true
  }

  deconstruct() {
    this.pWindowObj = null
    this.pAnimating = false
    return true
  }

  getID() {
    return 'hh_recycler.progress_anim'
  }

  startAnimation(tWindowObj) {
    if (voidP(tWindowObj)) {
      return false
    }
    this.pWindowObj = tWindowObj
    if (this.pWindowObj.elementExists('rec_jaw_upper')) {
      this.pUpperJawElement = this.pWindowObj.getElement('rec_jaw_upper')
      this.pUpperElementDefaultPos = [
        this.pUpperJawElement.getProperty(symbol('#locH')),
        this.pUpperJawElement.getProperty(symbol('#locV')),
      ]
    } else {
      return false
    }
    if (this.pWindowObj.elementExists('rec_jaw_lower')) {
      this.pLowerJawElement = this.pWindowObj.getElement('rec_jaw_lower')
      this.pLowerElementDefaultPos = [
        this.pLowerJawElement.getProperty(symbol('#locH')),
        this.pLowerJawElement.getProperty(symbol('#locV')),
      ]
    } else {
      return false
    }
    this.pCurrentFrame = 1
    this.pCurrentSkipCounter = 0
    this.pAnimating = true
    receivePrepare(this.getID())
  }

  stopAnimation() {
    this.pAnimating = false
    removePrepare(this.getID())
    if (!voidP(this.pWindowObj)) {
      if (this.pWindowObj.elementExists('rec_jaw_upper')) {
        this.pWindowObj.getElement('rec_jaw_upper').setProperty(symbol('#locV'), this.pUpperElementDefaultPos[1])
        this.pWindowObj.getElement('rec_jaw_upper').setProperty(symbol('#locH'), this.pUpperElementDefaultPos[0])
      }
      if (this.pWindowObj.elementExists('rec_jaw_lower')) {
        this.pWindowObj.getElement('rec_jaw_lower').setProperty(symbol('#locV'), this.pLowerElementDefaultPos[1])
        this.pWindowObj.getElement('rec_jaw_lower').setProperty(symbol('#locH'), this.pLowerElementDefaultPos[0])
      }
    }
  }

  getElementPosition(tElementType, tFrame) {
    let tOffsetList = [[0, 0]]
    let tDefaultPos = [0, 0]
    switch (tElementType) {
      case symbol('#upper'):
        tOffsetList = this.pUpperFrameOffs
        tDefaultPos = this.pUpperElementDefaultPos
        break
      case symbol('#lower'):
        tOffsetList = this.pLowerFrameOffs
        tDefaultPos = this.pLowerElementDefaultPos
        break
    }
    const tOffset = [tOffsetList[tFrame - 1][0], tOffsetList[tFrame - 1][1]]
    const tPosition = [tDefaultPos[0] + tOffset[0], tDefaultPos[1] + tOffset[1]]
    return tPosition
  }

  prepare() {
    if (this.pCurrentSkipCounter <= 0) {
      this.pCurrentSkipCounter = 4
    } else {
      this.pCurrentSkipCounter = this.pCurrentSkipCounter - 1
      return false
    }
    this.pCurrentFrame = this.pCurrentFrame + 1
    if (this.pCurrentFrame > this.pMaxFrames) {
      this.pCurrentFrame = 1
    }
    if (!voidP(this.pWindowObj)) {
      if (this.pWindowObj.elementExists('rec_jaw_upper')) {
        const tPos = this.getElementPosition(symbol('#upper'), this.pCurrentFrame)
        this.pUpperJawElement.setProperty(symbol('#locH'), tPos[0])
        this.pUpperJawElement.setProperty(symbol('#locV'), tPos[1])
      }
      if (this.pWindowObj.elementExists('rec_jaw_lower')) {
        const tPos = this.getElementPosition(symbol('#lower'), this.pCurrentFrame)
        this.pLowerJawElement.setProperty(symbol('#locH'), tPos[0])
        this.pLowerJawElement.setProperty(symbol('#locV'), tPos[1])
      }
    }
  }
}
