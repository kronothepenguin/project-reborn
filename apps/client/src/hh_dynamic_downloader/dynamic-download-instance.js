// hh_dynamic_downloader/5_Dynamic Download Instance.ls → dynamic-download-instance.js
// Dynamic download instance - handles individual download tasks with callbacks

import {
  symbol,
  symbolp,
  voidP,
  error,
  offset,
  call,
} from '../../core/lingo-runtime.js'
import { createTimeout } from '../../fuse_client/timeout-api.js'
import { getObject } from '../../fuse_client/object-api.js'

export class DynamicDownloadInstance {
  constructor() {
    this.pListenerList = []
    this.pAssetId = null
    this.pDownloadURL = null
    this.pAllowindexing = 0
    this.pAssetType = null
    this.pParentId = null
  }

  addCallbackListener(tObjectID, tHandlerName, tCallbackParams) {
    const tNewListener = {}
    tNewListener[symbol('#objectID')] = tObjectID
    tNewListener[symbol('#handlerName')] = tHandlerName
    tNewListener[symbol('#callbackParams')] = tCallbackParams
    this.pListenerList.push(tNewListener)
  }

  purgeCallbacks(tSuccess) {
    const tTimeoutName = 'dyndownload' + Date.now()
    let tCounter = 1
    for (const tListener of this.pListenerList) {
      const tObject = getObject(tListener[symbol('#objectID')])
      const tHandler = tListener[symbol('#handlerName')]
      const tCallbackParams = tListener[symbol('#callbackParams')]
      if ((tObject !== 0) && symbolp(tHandler)) {
        createTimeout(tTimeoutName + tCounter, 10, symbol('#sendTimeoutCallbacks'), 'hh_dynamic_downloader.instance', [tHandler, tObject, this.pAssetId, tSuccess, tCallbackParams], 1)
      } else {
        error(this, 'Object or handler invalid: ' + tObject + ' ' + tHandler, symbol('#purgeCallbacks'), symbol('#minor'))
      }
      tCounter = tCounter + 1
    }
    this.pListenerList = []
  }

  setAssetId(tAssetId) {
    this.pAssetId = tAssetId
  }

  getAssetId() {
    return this.pAssetId
  }

  setAssetType(tAssetType) {
    this.pAssetType = tAssetType
  }

  getAssetType() {
    return this.pAssetType
  }

  setDownloadName(tURL) {
    this.pDownloadURL = tURL
  }

  getDownloadName() {
    const tOffset = offset('?', this.pDownloadURL)
    if (tOffset) {
      return this.pDownloadURL.substring(0, tOffset - 1)
    } else {
      return this.pDownloadURL
    }
  }

  setIndexing(tAllowIndexing) {
    this.pAllowindexing = tAllowIndexing
  }

  getIndexing() {
    return this.pAllowindexing
  }

  setParentId(tParentId) {
    this.pParentId = tParentId
  }

  getParentId() {
    return this.pParentId
  }

  sendTimeoutCallbacks(tArguments) {
    call(tArguments[0], tArguments[1], tArguments[2], tArguments[3], tArguments[4])
  }
}
