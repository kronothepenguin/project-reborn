// hh_photo/5_Photo Item Class.ls → photo-item-class.js
// Photo item - handles photo item selection in room

import { symbol, listp } from '../../core/lingo-runtime.js'
import { getThread } from '../../fuse_client/core-thread-api.js'

export class PhotoItemClass {
  select() {
    if (!getThread(symbol('#photo'))) {
      return false
    }
    const tSprites = this.getSprites()
    if (!listp(tSprites) || tSprites.length < 1) {
      return false
    }
    const tloc = tSprites[0].loc
    getThread(symbol('#photo')).getComponent().openPhoto(this.getID(), tloc.locH, tloc.locV)
    return true
  }
}
