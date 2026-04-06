// hh_entry_uk/24_Entry Car Class.ls → entry-car-class.js
// Entry car - animated vehicle that drives across the entry scene

import {
  symbol,
  integer,
  length,
  chars,
  random,
  point,
  getmemnum,
} from '../../core/lingo-runtime.js'

export class EntryCarClass {
  constructor() {
    this.pSprite = null
    this.pOffset = [0, 0]
    this.pTurnPnt = 0
    this.pDirection = null
  }

  define(tsprite, tCount) {
    const tdir = (tCount % 2) ? symbol('#right') : symbol('#left')
    this.pSprite = tsprite
    this.pOffset = [0, 0]
    this.pTurnPnt = 0
    this.pDirection = tdir
    this.reset()
    return true
  }

  reset() {
    const models = ['car1', 'car1', 'bus1', 'cab1']
    const tmodel = models[random(4) - 1]
    if (this.pDirection === symbol('#left')) {
      this.pSprite.castNum = getmemnum(tmodel)
      this.pSprite.flipH = false
      this.pSprite.locH = 740
      this.pSprite.locV = 498
      this.pOffset = [-2, -1]
      this.pTurnPnt = 488
    } else {
      this.pSprite.castNum = getmemnum(tmodel)
      this.pSprite.flipH = true
      this.pSprite.locH = 184
      this.pSprite.locV = 505
      this.pOffset = [2, -1]
      this.pTurnPnt = 490
    }
    if (this.pSprite.member) {
      this.pSprite.width = this.pSprite.member.width
      this.pSprite.height = this.pSprite.member.height
    }
    if (tmodel === 'car1') {
      this.pSprite.ink = 41
      this.pSprite.backColor = random(150) + 20
    } else {
      this.pSprite.ink = 36
      this.pSprite.backColor = 0
    }
  }

  update() {
    this.pSprite.locH += this.pOffset[0]
    this.pSprite.locV += this.pOffset[1]
    if (this.pSprite.locH === this.pTurnPnt) {
      this.pOffset[1] = -this.pOffset[1]
      if (this.pSprite.member) {
        const tMemName = this.pSprite.member.name
        const tDirNum = integer(chars(tMemName, tMemName.length, tMemName.length))
        const newDirNum = !(tDirNum - 1) + 1
        const newMemName = tMemName.substring(0, tMemName.length - 1) + newDirNum
        this.pSprite.castNum = getmemnum(newMemName)
      }
    }
    if (this.pSprite.locV > 510) {
      return this.reset()
    }
  }
}
