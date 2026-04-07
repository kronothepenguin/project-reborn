// hh_guide/7_Guide Tool Icon Class.ls → guide-tool-icon-class.js
// Guide tool icon - flashing sprite icon for the guide tool

import {
  symbol,
  voidP,
  value,
  member,
  getmemnum,
  reserveSprite,
  releaseSprite,
  sprite,
  setEventBroker,
  cursor,
} from '../../core/lingo-runtime.js'
import { createTimeout, timeoutExists, removeTimeout } from '../../fuse_client/timeout-api.js'
import { getVariable } from '../../fuse_client/variable-api.js'
import { executeMessage } from '../../fuse_client/broker-manager-api.js'

export class GuideToolIconClass {
  constructor() {
    this.pSpriteId = 'guide_tool_icon_sprite'
    this.pIconSprite = null
    this.pIconLoc = null
    this.pFlashTimeoutID = 'guide_tool_icon_flash'
  }

  construct() {
    this.pIconLoc = value(getVariable('guidetool.icon.loc'))
    return true
  }

  deconstruct() {
    if (this.pIconSprite && this.pIconSprite.spriteNum) {
      releaseSprite(this.pIconSprite.spriteNum)
    }
    if (timeoutExists(this.pFlashTimeoutID)) {
      removeTimeout(this.pFlashTimeoutID)
    }
    return true
  }

  getID() {
    return this.pSpriteId
  }

  show(tstate) {
    if (voidP(tstate)) {
      tstate = 'normal'
    }
    if (!this.pIconSprite || !this.pIconSprite.spriteNum) {
      this.pIconSprite = sprite(reserveSprite(this.getID()))
      if (this.pIconSprite === 0 || !this.pIconSprite) {
        return false
      }
    }
    this.pIconSprite.member = member(getmemnum('guide_tool_icon_normal'))
    this.pIconSprite.ink = 8
    this.pIconSprite.locH = this.pIconLoc.locH
    this.pIconSprite.locV = this.pIconLoc.locV
    this.pIconSprite.locZ = 200000000
    this.pIconSprite.visible = true
    setEventBroker(this.pIconSprite.spriteNum, this.pSpriteId)
    this.pIconSprite.registerProcedure(symbol('#eventProcIcon'), this.getID(), symbol('#mouseUp'))
    this.pIconSprite.cursor = cursor(1) // finger cursor
    return true
  }

  hide() {
    if (this.pIconSprite && this.pIconSprite.spriteNum) {
      this.pIconSprite.visible = false
    }
  }

  setFlashing(tstate) {
    if (tstate === 1) {
      if (!timeoutExists(this.pFlashTimeoutID)) {
        createTimeout(this.pFlashTimeoutID, 500, symbol('#updateFlash'), this.getID(), null, 0)
      }
    } else {
      if (timeoutExists(this.pFlashTimeoutID)) {
        removeTimeout(this.pFlashTimeoutID)
      }
      if (this.pIconSprite && this.pIconSprite.spriteNum) {
        this.pIconSprite.member = member(getmemnum('guide_tool_icon_normal'))
      }
    }
  }

  updateFlash() {
    if (!this.pIconSprite || !this.pIconSprite.spriteNum) {
      return false
    }
    const tMemName = this.pIconSprite.member.name
    if (tMemName === 'guide_tool_icon_normal') {
      this.pIconSprite.member = member(getmemnum('guide_tool_icon_black'))
    } else {
      this.pIconSprite.member = member(getmemnum('guide_tool_icon_normal'))
    }
  }

  eventProcIcon(tEvent, tSprID, tProp) {
    executeMessage(symbol('#toggleGuideTool'))
  }
}
