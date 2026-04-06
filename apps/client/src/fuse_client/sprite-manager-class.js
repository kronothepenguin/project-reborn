// fuse_client/34_Sprite Manager Class.ls → sprite-manager-class.js
// Sprite manager - handles sprite reservation, release, and event brokers

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  createPropList,
  member,
  sprite,
  puppetSprite,
  rect,
  error,
  fatalError,
  executeMessage,
  getVariable,
  script,
} from '../core/lingo-runtime.js'

export class SpriteManagerClass {
  constructor() {
    this.pTotalSprList = []
    this.pFreeSprList = []
    this.pClientList = []
    this.pEventBroker = null
  }

  construct() {
    this.pTotalSprList = []
    this.pFreeSprList = []
    this.pClientList = []
    this.pEventBroker = script(getVariable('event.broker.behavior'))
    return this.preIndexChannels()
  }

  deconstruct() {
    return true
  }

  getProperty(tPropID) {
    switch (tPropID) {
      case symbol('#totalSprCount'):
        return this.pTotalSprList.length
      case symbol('#freeSprCount'):
        return this.pFreeSprList.length
      default:
        return 0
    }
  }

  setProperty(tPropID, tValue) {
    return 0
  }

  reserveSprite(tClientID) {
    if (this.pFreeSprList.length === 0) {
      executeMessage(symbol('#releaseSpritesLevel1'))
      if (this.pFreeSprList.length === 0) {
        executeMessage(symbol('#releaseSpritesLevel2'))
        if (this.pFreeSprList.length === 0) {
          fatalError({ error: 'Out of free sprites' })
        }
      }
    }
    const tSprNum = this.pFreeSprList[0]
    const tsprite = sprite(tSprNum)
    this.pFreeSprList.shift()
    puppetSprite(tSprNum, true)
    tsprite.stretch = false
    tsprite.locV = -1000
    tsprite.visible = true
    this.pClientList[tSprNum] = tClientID
    return tSprNum
  }

  releaseSprite(tSprNum) {
    if (this.pTotalSprList.indexOf(tSprNum) < 0) {
      return error(this, 'Sprite not marked as usable: ' + tSprNum, symbol('#releaseSprite'), symbol('#minor'))
    }
    if (this.pFreeSprList.indexOf(tSprNum) >= 0) {
      return error(this, 'Attempting to release free sprite!', symbol('#releaseSprite'), symbol('#minor'))
    }
    const tsprite = sprite(tSprNum)
    tsprite.member = member(0)
    tsprite.scriptInstanceList = []
    tsprite.rect = rect(0, 0, 1, 1)
    tsprite.locZ = tSprNum
    tsprite.visible = false
    tsprite.castNum = 0
    tsprite.cursor = 0
    tsprite.blend = 100
    tsprite.skew = 0
    tsprite.rotation = 0
    puppetSprite(tSprNum, false)
    tsprite.locZ = null
    this.pFreeSprList.push(tSprNum)
    this.pClientList[tSprNum] = 0
    return true
  }

  releaseAllSprites() {
    this.pFreeSprList = []
    for (let i = 0; i < this.pTotalSprList.length; i++) {
      this.releaseSprite(this.pTotalSprList[i])
    }
    return true
  }

  setEventBroker(tSprNum, tID) {
    if (this.pTotalSprList.indexOf(tSprNum) < 0) {
      return error(this, 'Sprite not marked as usable: ' + tSprNum, symbol('#setEventBroker'), symbol('#major'))
    }
    if (this.pFreeSprList.indexOf(tSprNum) >= 0) {
      return error(this, 'Attempted to modify non-reserved sprite!', symbol('#setEventBroker'), symbol('#major'))
    }
    const tsprite = sprite(tSprNum)
    // In Director: tsprite.scriptInstanceList = [new(this.pEventBroker)]
    // In JS: attach event broker behavior
    tsprite.scriptInstanceList = [this.pEventBroker.new()]
    tsprite.setID(tID)
    return true
  }

  removeEventBroker(tSprNum) {
    if (this.pTotalSprList.indexOf(tSprNum) < 0) {
      return error(this, 'Sprite not marked as usable: ' + tSprNum, symbol('#removeEventBroker'), symbol('#minor'))
    }
    if (this.pFreeSprList.indexOf(tSprNum) >= 0) {
      return error(this, 'Attempted to modify non reserved sprite!', symbol('#removeEventBroker'), symbol('#minor'))
    }
    sprite(tSprNum).scriptInstanceList = []
    return true
  }

  print(tCount) {
    if (integerp(tCount)) {
      const lastChannel = this.pTotalSprList.length
      if (tCount > lastChannel) tCount = lastChannel
      for (let i = 1; i <= tCount; i++) {
        const s = sprite(i)
        console.log(s.spriteNum, '--', s.member ? s.member.name : '', '--', s.locZ, '--', s.rect, '--', this.pClientList[s.spriteNum])
      }
    } else {
      for (const tNum of this.pTotalSprList) {
        const tSymbol = this.pFreeSprList.indexOf(tNum) < 0 ? '#' : ' '
        const s = sprite(tNum)
        console.log(tSymbol + tNum, s.member ? s.member.name : '', '--', s.locZ, '--', s.rect, '--', this.pClientList[tNum])
      }
    }
  }

  preIndexChannels() {
    this.pTotalSprList = []
    this.pFreeSprList = []
    this.pClientList = []
    // In Director: the lastChannel = 1000 or similar
    const lastChannel = 1000
    for (let i = 1; i <= lastChannel; i++) {
      this.pTotalSprList.push(i)
      this.pClientList.push(0)
      puppetSprite(i, true)
      sprite(i).visible = false
    }
    this.pFreeSprList = [...this.pTotalSprList]
    this.pTotalSprList.sort((a, b) => a - b)
    return true
  }
}
