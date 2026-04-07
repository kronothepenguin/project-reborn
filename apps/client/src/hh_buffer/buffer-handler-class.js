// hh_buffer/4_Buffer Handler Class.ls → buffer-handler-class.js
// Buffer handler - parses active objects and handles room messages

import {
  symbol,
  voidP,
  listp,
} from '../../core/lingo-runtime.js'
import { getVariable } from '../../fuse_client/variable-api.js'
import { registerListener, unregisterListener, registerCommands, unregisterCommands } from '../../fuse_client/connection-api.js'
import { getLocalFloat } from '../../fuse_client/string-services-api.js'

export class BufferHandlerClass {
  constructor() {
    this.pComponent = null
  }

  construct() {
    return this.regMsgList(1)
  }

  deconstruct() {
    return this.regMsgList(0)
  }

  parseActiveObject(tConn) {
    if (!tConn) {
      return false
    }
    const tObj = {}
    tObj[symbol('#id')] = tConn.GetStrFrom()
    tObj[symbol('#class')] = tConn.GetStrFrom()
    tObj[symbol('#x')] = tConn.GetIntFrom()
    tObj[symbol('#y')] = tConn.GetIntFrom()
    const tWidth = tConn.GetIntFrom()
    const tHeight = tConn.GetIntFrom()
    const tDirection = tConn.GetIntFrom() % 8
    tObj[symbol('#direction')] = [tDirection, tDirection, tDirection]
    tObj[symbol('#dimensions')] = [tWidth, tHeight]
    tObj[symbol('#altitude')] = getLocalFloat(tConn.GetStrFrom())
    tObj[symbol('#colors')] = tConn.GetStrFrom()
    const tRuntimeData = tConn.GetStrFrom()
    const tExtra = tConn.GetIntFrom()
    const tStuffData = tConn.GetStrFrom()
    if (tObj[symbol('#colors')] === '') {
      tObj[symbol('#colors')] = '0'
    }
    tObj[symbol('#props')] = {
      runtimedata: tRuntimeData,
      extra: tExtra,
      stuffdata: tStuffData,
    }
    return tObj
  }

  handle_stuffdataupdate(tMsg) {
    const tConn = tMsg.connection
    if (!tConn) {
      return false
    }
    const tMsgTemp = {}
    const props = Object.keys(tMsg)
    for (let tIndex = 0; tIndex < props.length; tIndex++) {
      const tProp = props[tIndex]
      tMsgTemp[tProp] = tMsg[tProp]
    }
    tMsgTemp.connection = tConn
    const tTargetID = tConn.GetStrFrom()
    return this.getComponent().bufferMessage(tMsgTemp, tTargetID, 'active')
  }

  handle_activeobject_remove(tMsg) {
    return this.getComponent().removeObject(tMsg.content.word[0], 'active')
  }

  handle_activeobject_update(tMsg) {
    if (typeof tMsg !== 'object' || tMsg === null || Array.isArray(tMsg)) {
      return false
    }
    const tConn = tMsg.connection
    if (!tConn) {
      return false
    }
    const tMsgTemp = {}
    const props = Object.keys(tMsg)
    for (let tIndex = 0; tIndex < props.length; tIndex++) {
      const tProp = props[tIndex]
      tMsgTemp[tProp] = tMsg[tProp]
    }
    tMsgTemp.connection = tConn
    const tObj = this.parseActiveObject(tConn)
    if (!listp(tObj)) {
      return false
    }
    const tID = tObj[symbol('#id')]
    return this.getComponent().bufferMessage(tMsgTemp, tID, 'active')
  }

  handle_removeitem(tMsg) {
    return this.getComponent().removeObject(tMsg.content.word[0], 'item')
  }

  handle_updateitem(tMsg) {
    const tID = tMsg.content.word[0]
    return this.getComponent().bufferMessage(tMsg, tID, 'item')
  }

  regMsgList(tBool) {
    const tMsgs = {}
    tMsgs['88'] = symbol('#handle_stuffdataupdate')
    tMsgs['94'] = symbol('#handle_activeobject_remove')
    tMsgs['95'] = symbol('#handle_activeobject_update')
    tMsgs['84'] = symbol('#handle_removeitem')
    tMsgs['85'] = symbol('#handle_updateitem')
    const tCmds = {}

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

  getID() {
    return 'hh_buffer.handler'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }
}
