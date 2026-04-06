// fuse_client/81_HttpCookie Instance Class.ls → httpcookie-instance-class.js
// HTTP Cookie instance - handles HTTP requests with cookie support

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  listp,
  length,
  offset,
  chars,
  charToNum,
  numToChar,
  value,
  member,
  memberExists,
  createMember,
  error,
  getVariable,
  variableExists,
  getDomainPart,
  getMoviePath,
  openNetPage,
  urlEncode,
  createPropList,
  getObjectManager,
} from '../core/lingo-runtime.js'

export class HttpCookieInstanceClass {
  constructor() {
    this.pMUXtra = null
    this.pServer = ''
    this.pPort = 80
    this.pDestination = '/'
    this.pData = createPropList()
    this.pMaxBytes = 16 * 1024
    this.pCRLF = '\r\n'
    this.pNetDone = false
    this.pNetResult = null
    this.pNetError = 0
    this.pNetRequest = null
    this.pUserAgent = 'HTTP-CLASS/0.1'
    this.pHttpVersion = '1.1'
    this.pResponseCbHandler = null
    this.pResponseCbObj = null
    this.pCookies = createPropList()
    this.pType = null
    this.pStatus = null
    this.pMemName = ''
    this.pMemNum = 0
    this.pCallBack = null
    this.pRedirectNetID = null
    this.pRedirectUrl = ''
    this.pRedirectType = null
    this.pTarget = null
  }

  define(tMemName, tdata) {
    this.pStatus = symbol('#initializing')
    this.pMemName = tMemName
    this.pMemNum = tdata.memNum
    this.pType = tdata.type
    this.pCallBack = tdata.callback
    this.pTarget = tdata.target
    if (voidP(tdata.redirectType)) {
      this.pRedirectType = symbol('#follow')
    } else {
      this.pRedirectType = tdata.redirectType
    }
    const tSeparatedURL = this.separateURL(tdata.url)
    this.pServer = tSeparatedURL.server
    this.pDestination = tSeparatedURL.destination
    this.pPort = tSeparatedURL.port
    if (voidP(this.pDestination)) this.pDestination = '/'
    if (!this.pDestination.startsWith('/')) this.pDestination = '/' + this.pDestination
    if (voidP(this.pPort)) this.pPort = 80
    this.pCRLF = '\r\n'
    this.pUserAgent = 'HTTP-CLASS/0.1'
    this.pHttpVersion = '1.1'
    this.pMaxBytes = 16 * 1024
    this.pData = createPropList()
    this.pNetDone = false
    if (voidP(this.pCookies)) this.pCookies = createPropList()
    this.pRedirectNetID = null
    return this.sendRequest()
  }

  separateURL(tURL) {
    tURL = tURL.replace('http://', '')
    const slashIdx = tURL.indexOf('/')
    const tServerURL = tURL.substring(0, slashIdx >= 0 ? slashIdx : tURL.length)
    const tDestination = slashIdx >= 0 ? tURL.substring(slashIdx) : '/'
    let tPort = 80
    let tServer = tServerURL
    const colonIdx = tServerURL.indexOf(':')
    if (colonIdx >= 0) {
      tServer = tServerURL.substring(0, colonIdx)
      tPort = parseInt(tServerURL.substring(colonIdx + 1), 10) || 80
    }
    return { server: tServer, destination: tDestination, port: tPort }
  }

  addCallBack(tMemName, tCallback) {
    if (tMemName === this.pMemName) {
      this.pCallBack = tCallback
      return true
    }
    return false
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#status'):
        return this.pStatus
      case symbol('#url'):
        return this.pServer + this.pDestination
      case symbol('#type'):
        return this.pType
      case symbol('#Percent'):
        return this.pNetDone ? 100 : 0.0
      default:
        return 0
    }
  }

  update() {
    if (this.pNetDone) {
      if ((this.pStatus === symbol('#error')) || (this.pStatus === symbol('#LOADING'))) {
        this.pStatus = symbol('#complete')
        // getDownloadManager().removeActiveTask(this.pMemName, this.pCallBack)
        return true
      }
    }
    if (!voidP(this.pRedirectNetID)) {
      // if (netDone(this.pRedirectNetID)) {
      //   if (!memberExists(this.pMemName)) createMember(this.pMemName, symbol('#bitmap'))
      //   // importFileInto(member(this.pMemName), this.pRedirectUrl)
      //   this.pNetDone = true
      //   this.pRedirectNetID = null
      // }
    }
    return false
  }

  sendRequest() {
    this.pNetResult = null
    this.pNetDone = false
    this.pNetError = 0
    this.pStatus = symbol('#LOADING')
    // In JS: use fetch() instead of Multiuser xtra
    this._fetchWithCookies()
    return true
  }

  getStoredCookies(tDomain) {
    if (voidP(tDomain)) tDomain = this.pServer
    const parts = tDomain.split('.')
    tDomain = parts.slice(-2).join('.')
    // In JS: use document.cookie or localStorage
    return []
  }

  setStoredCookies(tDomain, tNewCookies) {
    if (voidP(tDomain) || voidP(tNewCookies)) return false
    // In JS: use document.cookie or localStorage
    return true
  }

  createNetRequest() {
    let tPort = ':' + this.pPort
    if (tPort === ':80') tPort = ''
    const tHeaders = []
    tHeaders.push('Host: ' + this.pServer + tPort)
    tHeaders.push('User-Agent: ' + this.pUserAgent)
    tHeaders.push('Accept: text/*')
    tHeaders.push('Accept-Charset: ISO-8859-1')
    this.pCookies = this.getStoredCookies(this.pServer)
    let tCookieString = ''
    for (const tCookie of this.pCookies) {
      if (this.pDestination.startsWith(tCookie.path)) {
        if (tCookieString !== '') tCookieString += '; '
        tCookieString += tCookie.name + '=' + tCookie.value
      }
    }
    if (tCookieString !== '') {
      tHeaders.push('Cookie: ' + tCookieString)
    }
    let tDestination = this.pDestination
    if (this.pData.count > 0) {
      tDestination += '?' + this.getDataString()
    }
    const tCmd = 'GET ' + tDestination + ' HTTP/' + this.pHttpVersion
    return { cmd: tCmd, headers: tHeaders, body: '' }
  }

  messageHandler() {
    // In JS: handled by fetch response
  }

  handleHelloResponse() {
    // In JS: not needed, fetch handles connection
  }

  handleContentResponse(tContent) {
    // In JS: handled by fetch response processing
  }

  clearMU() {
    this.pMUXtra = null
  }

  parseResponse(tResponse) {
    const splitIdx = tResponse.indexOf('\r\n\r\n')
    if (splitIdx < 0) return { status_code: '', status_num: 0, headers: {}, body: tResponse }
    const tResponseHeaders = tResponse.substring(0, splitIdx)
    const tResponseBody = tResponse.substring(splitIdx + 4)
    const tResponseHeaderLines = tResponseHeaders.split('\r\n')
    const tHttpResponseLine = tResponseHeaderLines[0]
    const tResponseCodeNum = parseInt(tHttpResponseLine.split(' ')[1], 10) || 0
    const tResponseHeaderArray = {}
    for (let i = 1; i < tResponseHeaderLines.length; i++) {
      const headerLine = tResponseHeaderLines[i]
      const colonIdx = headerLine.indexOf(': ')
      if (colonIdx >= 0) {
        const tHeader = headerLine.substring(0, colonIdx)
        const tValue = headerLine.substring(colonIdx + 2)
        tResponseHeaderArray[tHeader] = tValue
      }
    }
    return {
      status_code: tHttpResponseLine,
      status_num: tResponseCodeNum,
      headers: tResponseHeaderArray,
      body: tResponseBody,
    }
  }

  parseRawBody(tRawbody) {
    let tBody = ''
    let remaining = tRawbody
    while (true) {
      const crlfIdx = remaining.indexOf('\r\n')
      if (crlfIdx < 0) {
        tBody += remaining
        break
      }
      const tLen = this.hex2dec(remaining.substring(0, crlfIdx))
      remaining = remaining.substring(crlfIdx + 2)
      tBody += remaining.substring(0, tLen)
      remaining = remaining.substring(tLen + 2)
    }
    return tBody
  }

  parseCookieString(tStr) {
    const tCookie = {}
    const tParts = tStr.split('; ')
    const tTemp = tParts[0].split('=')
    tCookie.name = tTemp[0]
    tCookie.value = tTemp[1] || ''
    for (let i = 1; i < tParts.length; i++) {
      const tTemp2 = tParts[i].split('=')
      if (tTemp2[0] === 'path') {
        tCookie.path = tTemp2[1]
      }
    }
    if (voidP(tCookie.path)) tCookie.path = '/'
    return tCookie
  }

  getDataString() {
    let tDataStr = ''
    const keys = this.pData.keys()
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      tDataStr += urlEncode(key) + '=' + urlEncode(this.pData.getaProp(key))
      if (i < keys.length - 1) tDataStr += '&'
    }
    return tDataStr
  }

  hex2dec(tHex) {
    return parseInt(tHex, 16) || 0
  }

  _fetchWithCookies() {
    // JS implementation using fetch API
    const url = 'http://' + this.pServer + ':' + this.pPort + this.pDestination
    fetch(url)
      .then(response => {
        if (response.redirected) {
          const redirectUrl = response.url
          if (this.pRedirectType === symbol('#follow')) {
            // Follow redirect
            return fetch(redirectUrl)
          } else {
            if (voidP(this.pTarget)) {
              openNetPage(redirectUrl, '_new')
            } else {
              openNetPage(redirectUrl, this.pTarget)
            }
            this.pNetDone = true
            return null
          }
        }
        return response.text()
      })
      .then(text => {
        if (text && this.pMemName) {
          // Store text in member
          const tMem = member(this.pMemName)
          if (tMem) tMem.text = text
        }
        this.pNetDone = true
        this.pStatus = symbol('#complete')
      })
      .catch(err => {
        this.pNetDone = true
        this.pStatus = symbol('#error')
        this.pNetError = err.message
      })
  }
}
