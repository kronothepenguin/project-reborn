// hh_buffer/32_Furniture Placeholder Class.ls → furniture-placeholder-class.js
// Furniture placeholder - animated placeholder for furniture while downloading

import {
  symbol,
  voidP,
  random,
  memberExists,
  member,
  getmemnum,
} from '../../core/lingo-runtime.js'

export class FurniturePlaceholderClass {
  constructor() {
    this.pDelay = 0
    this.pFrame = 0
    this.pItem = null
    this.pPart = null
    this.pData = null
    this.pMaxFrames = 0
    this.pSprList = []
  }

  prepare(tdata) {
    if (this.pSprList.length < 1) {
      return false
    }
    this.pMaxFrames = 6
    const tName = this.pSprList[0].member.name
    const parts = tName.split('_')
    this.pItem = parts.slice(0, parts.length - 6).join('_')
    this.pPart = parts[parts.length - 6]
    this.pData = parts.slice(parts.length - 5, parts.length - 1).join('_')
    this.pFrame = random(this.pMaxFrames) - 1
    this.pDelay = 0
    this.setAnimMembersToFrame()
    this.pTimer = 1
    return true
  }

  update() {
    this.pDelay = this.pDelay + 1
    if (this.pDelay > 4) {
      this.pFrame = (this.pFrame + 1) % this.pMaxFrames
      this.setAnimMembersToFrame(this.pFrame)
      this.pDelay = 0
    }
  }

  setAnimMembersToFrame(tFrame) {
    if (this.pSprList.length < 1) {
      return false
    }
    const tLayerChar = 'a'
    const tNewName = this.pItem + '_' + tLayerChar + '_' + this.pData + '_' + tFrame
    if (memberExists(tNewName)) {
      const tmember = member(getmemnum(tNewName))
      this.pSprList[0].castNum = tmember.number
      this.pSprList[0].width = tmember.width
      this.pSprList[0].height = tmember.height
    }
  }
}
