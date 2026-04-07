// fuse_client/67_Event Agent Class.ls → event-agent-class.js
// Event agent - invisible sprite that captures mouse events and forwards them

import {
  symbol,
  voidP,
  rect,
  point,
  member,
  getmemnum,
  sprite,
  reserveSprite,
  call,
  createPropList,
} from '../core/lingo-runtime.js'
import { getSpriteManager } from './sprite-api.js'
import { receivePrepare, removePrepare } from './object-api.js'

export class EventAgentClass {
  constructor() {
    this.pSprite = null
    this.pEventList = createPropList()
    this.pID = null
  }

  construct() {
    this.pEventList = createPropList()
    this.pSprite = sprite(reserveSprite(this.pID))
    if (!this.pSprite || this.pSprite.spriteNum === 0) {
      return false
    }
    this.pSprite.member = member(getmemnum('null'))
    this.pSprite.rect = rect(-90, -90, -80, -80)
    this.pSprite.locZ = 20000000
    this.pSprite.blend = 0
    getSpriteManager().setEventBroker(this.pSprite.spriteNum, this.pID)
    return true
  }

  deconstruct() {
    removePrepare(this.pID)
    if (this.pSprite && this.pSprite.spriteNum) {
      getSpriteManager().releaseSprite(this.pSprite.spriteNum)
    }
    return true
  }

  registerEvent(tObj, tEvent, tMethod) {
    this.pEventList.setaProp(tEvent, [tObj, tMethod])
    if (this.pSprite && this.pSprite.registerProcedure) {
      this.pSprite.registerProcedure(symbol('#eventProcDefault'), this.pID, tEvent)
    }
    if (this.pSprite) this.pSprite.visible = true
    return receivePrepare(this.pID)
  }

  unregisterEvent(tEvent) {
    this.pEventList.deleteProp(tEvent)
    if (this.pEventList.count === 0) {
      removePrepare(this.pID)
      if (this.pSprite) {
        this.pSprite.visible = false
        this.pSprite.rect = rect(-90, -90, -80, -80)
      }
    }
    return true
  }

  prepare() {
    if (this.pSprite) {
      // this.pSprite.loc = the mouseLoc - point(5, 5)
      // Placeholder for mouse position tracking
    }
  }

  eventProcDefault(tEvent, tSprID, tParam) {
    const tTarget = this.pEventList.getaProp(tEvent)
    if (voidP(tTarget)) {
      if (this.pSprite && this.pSprite.removeProcedure) {
        return this.pSprite.removeProcedure(tEvent)
      }
      return false
    }
    return call(tTarget[1], tTarget[0])
  }

  null() {
    // No-op
  }
}
