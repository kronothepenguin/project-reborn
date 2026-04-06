// hh_entry_uk/23_Entry Cloud Class.ls → entry-cloud-class.js
// Entry cloud - animated cloud sprite that moves across the entry scene

import {
  symbol,
  voidP,
  member,
  memberExists,
  getmemnum,
  createMember,
  random,
  rect,
  getItemDelimiter,
  setItemDelimiter,
} from '../../core/lingo-runtime.js'

export class EntryCloudClass {
  constructor() {
    this.pSprite = null
    this.pTurnPoint = 0
    this.pVertDir = 0
    this.pImg = null
    this.pLoc = null
    this.pTurnPointList = []
    this.pCurrentTurnPoint = 0
    this.pCloudDir = 0
    this.pMemName = ''
    this.pCloudMember = null
  }

  define(tsprite, tCount) {
    this.pSprite = tsprite
    if (memberExists('entrycloud_' + tCount)) {
      this.pCloudMember = member(getmemnum('entrycloud_' + tCount))
    } else {
      this.pCloudMember = member(createMember('entrycloud_' + tCount, symbol('#bitmap')))
    }
    this.pImg = this.pCloudMember.image
    const tTemp = getItemDelimiter()
    setItemDelimiter('_')
    const nameParts = this.pSprite.member.name.split('_')
    this.pMemName = nameParts.slice(0, -1).join('_')
    const tdir = nameParts[nameParts.length - 1]
    setItemDelimiter(tTemp)
    if (tdir === 'left') {
      this.pVertDir = -1
    } else {
      this.pVertDir = 1
    }
    this.pTurnPointList = [330]
    this.pCurrentTurnPoint = 0
    this.initCloud()
    this.pSprite.member = this.pCloudMember
    this.pSprite.width = this.pCloudMember.width
    this.pSprite.height = this.pCloudMember.height
    this.getFirstTurnPoint()
    this.pCloudDir = this.pVertDir
    return true
  }

  getFirstTurnPoint() {
    for (let f = 0; f < this.pTurnPointList.length; f++) {
      if ((this.pSprite.locH + this.pSprite.width) < this.pTurnPointList[f]) {
        this.pCurrentTurnPoint = f
        this.pTurnPoint = this.pTurnPointList[f]
        break
      }
    }
  }

  initCloud() {
    if (this.pSprite.locH > 800) { // stageRight - stageLeft
      this.pVertDir = -1
      this.pSprite.locH = -40
      this.pSprite.locV = 260 - random(40)
      this.pMemName = this.pMemName.substring(0, this.pMemName.length - 1) + (random(4) - 1)
      this.pCurrentTurnPoint = 1
      this.pTurnPoint = this.pTurnPointList[0]
    }
    const tdir = this.pVertDir === -1 ? 'left' : 'right'
    const tTempImg = member(getmemnum(this.pMemName + '_' + tdir)).image
    if (this.pCloudMember) {
      // this.pCloudMember.image = image(tTempImg.width, 60, 8)
    }
    if (this.pCloudMember && this.pCloudMember.image && tTempImg) {
      // Canvas placeholder for copyPixels
    }
    this.pLoc = { locH: this.pSprite.locH, locV: this.pSprite.locV }
    this.pSprite.width = tTempImg ? tTempImg.width : 0
  }

  getNextTurnPoint() {
    this.pCurrentTurnPoint++
    if (this.pCurrentTurnPoint >= this.pTurnPointList.length) {
      this.pCurrentTurnPoint = this.pTurnPointList.length - 1
    }
    this.pTurnPoint = this.pTurnPointList[this.pCurrentTurnPoint]
  }

  update() {
    if (((this.pSprite.locH + this.pSprite.width) > this.pTurnPoint) && (this.pSprite.locH <= this.pTurnPoint)) {
      this.turn()
      this.pVertDir = 0
    }
    if (this.pSprite.locH === this.pTurnPoint) {
      this.pVertDir = this.pCloudDir * -1
      this.getNextTurnPoint()
    }
    this.pLoc.locH++
    if ((this.pLoc.locH % 2) === 0) {
      this.pLoc.locV += this.pVertDir
    }
    this.pSprite.locH = this.pLoc.locH
    this.pSprite.locV = this.pLoc.locV
    if (this.pSprite.locH > 830) { // stageRight - stageLeft + 30
      this.initCloud()
    }
  }

  checkCloud() {
    if (this.pSprite.locH > this.pTurnPoint) {
      this.turn()
    } else {
      this.pVertDir = -1
      this.pSprite.flipH = false
    }
  }

  turn() {
    if (this.pVertDir !== 0) {
      this.pCloudDir = this.pVertDir
    }
    if (this.pCloudDir === -1) {
      // pImg.fill(pImg.rect, rgb(255, 255, 255))
      const tImg = member(getmemnum(this.pMemName + '_left')).image
      const tWidth = (this.pSprite.locH + this.pSprite.width) - this.pTurnPoint
      const tHeigth = (-tWidth / 2) - 1
      // Canvas placeholder for copyPixels operations
    } else {
      // pImg.fill(pImg.rect, rgb(255, 255, 255))
      const tImg = member(getmemnum(this.pMemName + '_right')).image
      const tWidth = (this.pSprite.locH + this.pSprite.width) - this.pTurnPoint
      const tHeigth = (tWidth / 2) + 1
      // Canvas placeholder for copyPixels operations
    }
  }
}
