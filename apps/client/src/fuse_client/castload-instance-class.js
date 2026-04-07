// fuse_client/49_CastLoad Instance Class.ls → castload-instance-class.js
// CastLoad instance - handles individual cast file downloads with retry logic

import {
  symbol,
  stringp,
  integerp,
  voidP,
  listp,
  error,
  QUOTE,
  RETURN,
} from '../core/lingo-runtime.js'
import { getIntVariable } from './variable-api.js'
import { getCastLoadManager } from './castload-api.js'
import { getSpecialServices } from './special-services-api.js'
import { SystemAlert } from './error-api.js'

export class CastLoadInstanceClass {
  constructor() {
    this.pFile = ''
    this.pURL = ''
    this.pNetId = 0
    this.pGroupId = ''
    this.pLoadTime = 0
    this.pBytesSoFar = 0
    this.ptryCount = 1
    this.pPercent = 0.0
    this.pState = null
    this.pRetryDelay = 10000
    this.pCastLoadMaxRetryCount = 10
    this.pID = null
  }

  define(tFile, tURL, tpreloadId) {
    this.pFile = tFile
    this.pURL = tURL
    this.pGroupId = tpreloadId
    this.ptryCount = 1
    this.pRetryDelay = getIntVariable('castload.retry.delay', 10000)
    this.pCastLoadMaxRetryCount = getIntVariable('castload.retry.count', 10)
    return this.Activate()
  }

  Activate() {
    if (this.ptryCount > 3) {
      if (this.pURL.includes('http://')) {
        if (this.pURL.includes('?')) {
          this.pURL = this.pURL + '&' + Date.now()
        } else {
          this.pURL = this.pURL + '?' + Date.now()
        }
      }
    }
    // In Director: pNetId = preloadNetThing(this.pURL)
    // In JS: fetch with progress tracking
    this.pLoadTime = Date.now()
    this.pBytesSoFar = 0
    this.pPercent = 0.0
    this.pState = symbol('#LOADING')
    this._startFetch()
    return true
  }

  update() {
    if ((this.pState === symbol('#done')) || (this.pState === symbol('#failed'))) {
      return true
    }
    // In Director: check getStreamStatus(pNetId) and netDone(pNetId)
    // In JS: handled by fetch response
  }

  _startFetch() {
    fetch(this.pURL)
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status)
        }
        const contentLength = response.headers.get('content-length')
        const total = contentLength ? parseInt(contentLength, 10) : 0
        let loaded = 0

        const reader = response.body.getReader()
        const read = () => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              this.pPercent = 1.0
              this.pState = symbol('#done')
              getCastLoadManager().DoneCurrentDownLoad(this.pFile, this.pURL, this.pGroupId, this.pState)
              return
            }
            loaded += value.length
            if (total > 0) {
              this.pPercent = loaded / total
            }
            getCastLoadManager().TellStreamState(this.pFile, this.pState, this.pPercent, this.pGroupId)
            this.pBytesSoFar = loaded
            this.pLoadTime = Date.now()
            return read()
          })
        }
        return read()
      })
      .catch(err => {
        const tErrorMsg = getCastLoadManager().solveNetErrorMsg(err.message)
        error(this, 'Failed network operation:\n' + this.pURL + '\n' + tErrorMsg, symbol('#update'), symbol('#minor'))
        this.ptryCount++
        if (this.ptryCount >= this.pCastLoadMaxRetryCount) {
          this.pPercent = 1.0
          this.pState = symbol('#error')
          this.pState = symbol('#failed')
          getCastLoadManager().DoneCurrentDownLoad(this.pFile, this.pURL, this.pGroupId, this.pState)
          SystemAlert(this, 'Failed download operation:\n' + 'Tried to load file ' + QUOTE + this.pFile + QUOTE + ' ' + this.ptryCount + ' times.', symbol('#update'))
          return
        }
        if (this.ptryCount > 3) {
          this.pURL = getSpecialServices().addRandomParamToURL(this.pURL)
        }
        getCastLoadManager().TellStreamState(this.pFile, this.pState, 0.0, this.pGroupId)
        this.Activate()
      })
  }
}
