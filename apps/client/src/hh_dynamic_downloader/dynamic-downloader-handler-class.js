// hh_dynamic_downloader/4_Dynamic Downloader Handler Class.ls → dynamic-downloader-handler-class.js
// Dynamic downloader handler - handles furni revisions and alias list messages

import { symbol, voidP } from '../../core/lingo-runtime.js'
import { getVariable } from '../../fuse_client/variable-api.js'
import { registerListener, unregisterListener, registerCommands, unregisterCommands } from '../../fuse_client/connection-api.js'

export class DynamicDownloaderHandlerClass {
  constructor() {
    this.pComponent = null
  }

  construct() {
    return this.regMsgList(1)
  }

  deconstruct() {
    return this.regMsgList(0)
  }

  getID() {
    return 'hh_dynamic_downloader.handler'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  handle_furni_revisions(tMsg) {
    const tConn = tMsg.connection
    if (!tConn) {
      return false
    }
    const tTypeList = [1, 0]
    for (const ttype of tTypeList) {
      const tCount = tConn.GetIntFrom()
      for (let tIndex = 0; tIndex < tCount; tIndex++) {
        const tClass = tConn.GetStrFrom()
        const tRevision = tConn.GetIntFrom()
        this.getComponent().setFurniRevision(tClass, tRevision, ttype)
      }
    }
    this.getComponent().setFurniRevision(null, null, null)
    return true
  }

  handle_alias_list(tMsg) {
    const tConn = tMsg.connection
    if (!tConn) {
      return false
    }
    const tCount = tConn.GetIntFrom()
    for (let tIndex = 0; tIndex < tCount; tIndex++) {
      const tOriginalClass = tConn.GetStrFrom()
      const tAliasClass = tConn.GetStrFrom()
      this.getComponent().setAssetAlias(tOriginalClass, tAliasClass)
    }
    this.getComponent().setAssetAlias(null, null)
    this.getComponent().tryNextDownload()
  }

  regMsgList(tBool) {
    const tMsgs = {}
    tMsgs['295'] = symbol('#handle_furni_revisions')
    tMsgs['297'] = symbol('#handle_alias_list')
    const tCmds = {}
    tCmds['GET_FURNI_REVISIONS'] = 213
    tCmds['GET_ALIAS_LIST'] = 215

    const tConnID = getVariable('connection.room.id')
    if (tBool) {
      registerListener(tConnID, this.getID(), tMsgs)
      registerCommands(tConnID, this.getID(), tCmds)
    } else {
      unregisterListener(tConnID, this.getID(), tMsgs)
      unregisterCommands(tConnID, this.getID(), tCmds)
    }
    return true
  }
}
