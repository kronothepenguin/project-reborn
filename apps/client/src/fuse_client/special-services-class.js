// fuse_client/44_Special Services Class.ls → special-services-class.js
// Special services - tooltips, cursors, navigation, machine ID, tracking, etc.

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  floatp,
  voidP,
  objectp,
  listp,
  offset,
  chars,
  length,
  random,
  charToNum,
  numToChar,
  bitXor,
  power,
  replaceChunks,
  createPropList,
  error,
  rect,
  cursor,
  field,
  member,
  getItemDelimiter,
  setItemDelimiter,
  RETURN,
  SPACE,
  EMPTY,
  QUOTE,
} from '../core/lingo-runtime.js'
import { getIntVariable, getVariable, variableExists, setVariable, getVariableManager, getClassVariable } from './variable-api.js'
import { getObject, objectExists, createObject, removeObject } from './object-api.js'
import { getText, textExists } from './text-api.js'
import { reserveSprite } from './sprite-api.js'
import { sprite } from '../core/lingo-runtime.js'
import { getMember, createMember, removeMember, memberExists, getmemnum } from './resource-api.js'
import { deobfuscate, obfuscate } from './string-services-api.js'

export class SpecialServicesClass {
  constructor() {
    this.pCatchFlag = 0
    this.pSavedHook = 0
    this.pToolTipAct = 0
    this.pToolTipSpr = null
    this.pToolTipMem = null
    this.pToolTipID = null
    this.pToolTipDel = 2000
    this.pCurrCursor = 0
    this.pLastCursor = 0
    this.pUniqueSeed = 0
    this.pDecoder = null
    this.pProcessList = []
    this.pID = null
  }

  construct() {
    this.pCatchFlag = 0
    this.pSavedHook = 0
    this.pToolTipAct = getIntVariable('tooltip.active', 0)
    this.pToolTipMem = null
    this.pToolTipSpr = null
    this.pCurrCursor = 0
    this.pLastCursor = 0
    this.pUniqueSeed = 0
    this.pProcessList = []
    this.pDecoder = createObject(symbol('#temp'), ['tYy1rX5j7e4PLYJLER'])
    if (this.pDecoder && this.pDecoder.qe2AkKOGGKDTTnd1Nei) {
      this.pDecoder.qe2AkKOGGKDTTnd1Nei('sulake1Unique2Key3Generator')
    }
    return true
  }

  deconstruct() {
    if (!voidP(this.pToolTipSpr)) {
      // releaseSprite(this.pToolTipSpr.spriteNum)
    }
    if (!voidP(this.pToolTipMem)) {
      // removeMember(this.pToolTipMem.name)
    }
    this.pDecoder = null
    return true
  }

  try() {
    this.pCatchFlag = 0
    // pSavedHook = the alertHook
    // the alertHook = this
    return true
  }

  catch() {
    // the alertHook = this.pSavedHook
    return this.pCatchFlag
  }

  callJavaScriptFunction(tCallString, tdata) {
    // In JS, we can use window.eval or a custom handler
    // script("JavaScript Proxy").callJavaScript(QUOTE + tCallString + QUOTE, QUOTE + tdata + QUOTE)
  }

  createToolTip(tText) {
    if (this.pToolTipAct) {
      if (voidP(this.pToolTipMem)) {
        this.prepareToolTip()
      }
      if (voidP(this.pToolTipSpr)) {
        this.prepareToolTip()
      }
      if (voidP(tText)) {
        tText = '...'
      }
      this.pToolTipSpr.visible = false
      // pToolTipMem.rect = rect(0, 0, length(tText) * 8, 20)
      // pToolTipMem.text = tText
      this.pToolTipID = Date.now()
      return this.delay(this.pToolTipDel, symbol('#renderToolTip'), this.pToolTipID)
    }
  }

  removeToolTip(tNextID) {
    if (this.pToolTipAct) {
      if (voidP(tNextID) || (this.pToolTipID === tNextID)) {
        this.pToolTipID = null
        this.pToolTipSpr.visible = false
        return true
      }
    }
  }

  renderToolTip(tNextID) {
    if (this.pToolTipAct) {
      if ((tNextID !== this.pToolTipID) || voidP(this.pToolTipID)) {
        return false
      }
      // pToolTipSpr.loc = the mouseLoc + [-2, 15]
      this.pToolTipSpr.visible = true
      this.delay(this.pToolTipDel * 2, symbol('#removeToolTip'), this.pToolTipID)
    }
  }

  setcursor(ttype) {
    switch (ttype) {
      case null:
        ttype = 0
        break
      case symbol('#arrow'):
        ttype = 0
        break
      case symbol('#ibeam'):
        ttype = 1
        break
      case symbol('#crosshair'):
        ttype = 2
        break
      case symbol('#crossbar'):
        ttype = 3
        break
      case symbol('#timer'):
        ttype = 4
        break
      case symbol('#previous'):
        ttype = this.pLastCursor
        break
    }
    cursor(ttype)
    this.pLastCursor = this.pCurrCursor
    this.pCurrCursor = ttype
    return true
  }

  openNetPage(tURL_key, tTarget) {
    if (!stringp(tURL_key)) {
      return false
    }
    let tURL
    if (textExists(tURL_key)) {
      tURL = getText(tURL_key, tURL_key)
    } else {
      tURL = tURL_key
    }
    tURL = this.getPredefinedURL(tURL)
    let tResolvedTarget = null
    let tTargetIsParent = 0
    if (voidP(tTarget)) {
      if (variableExists('default.url.open.target')) {
        tResolvedTarget = getVariable('default.url.open.target')
        tTargetIsParent = 1
      } else {
        tResolvedTarget = '_new'
      }
    } else {
      if ((tTarget === 'self') || (tTarget === '_self')) {
        tResolvedTarget = null
      } else if ((tTarget === '_new') || (tTarget === 'new')) {
        tResolvedTarget = '_new'
      } else {
        tResolvedTarget = tTarget
      }
    }
    let tURLStart = tURL
    let tURLEnd = ''
    const hashIdx = tURL.indexOf('#')
    if (hashIdx >= 0) {
      tURLStart = tURL.substring(0, hashIdx)
      tURLEnd = tURL.substring(hashIdx)
    }
    if (variableExists('client.http.request.sourceid') && tTargetIsParent) {
      const tSourceParamTxt = getVariable('client.http.request.sourceid') + '=1'
      if (!tURLStart.includes(tSourceParamTxt)) {
        if (tURLStart.includes('?')) {
          tURLStart = tURLStart + '&' + tSourceParamTxt
        } else {
          tURLStart = tURLStart + '?' + tSourceParamTxt
        }
      }
    }
    tURL = tURLStart + tURLEnd
    tURL = replaceChunks(tURL, '%random%', String(random(9999999999)))
    // gotoNetPage(tURL, tResolvedTarget)
    if (tResolvedTarget === '_new') {
      window.open(tURL, '_blank')
    } else if (tResolvedTarget === null) {
      window.location.href = tURL
    } else {
      window.open(tURL, tResolvedTarget)
    }
    console.log('Open page:', tURL, 'target:', tResolvedTarget)
    return true
  }

  showLoadingBar(tLoadID, tProps) {
    const tObj = createObject(symbol('#random'), getClassVariable('loading.bar.class'))
    if (tObj === 0) {
      return error(this, "Couldn't create loading bar instance!", symbol('#showLoadingBar'), symbol('#major'))
    }
    if (!tObj.define(tLoadID, tProps)) {
      removeObject(tObj.getID())
      return error(this, "Couldn't initialize loading bar instance!", symbol('#showLoadingBar'), symbol('#major'))
    }
    return tObj.getID()
  }

  getUniqueID() {
    this.pUniqueSeed++
    return 'uid:' + this.pUniqueSeed + ':' + Date.now()
  }

  getMachineID() {
    // Placeholder - browser doesn't have persistent prefs like Director
    return this.generateMachineId()
  }

  getMoviePath() {
    const tVariableID = 'system.v1'
    if (!variableExists(tVariableID)) {
      setVariable(tVariableID, obfuscate(window.location.origin + '/'))
    }
    return deobfuscate(getVariable(tVariableID))
  }

  getDomainPart(tPath) {
    if (voidP(tPath)) {
      return ''
    }
    if (tPath.substring(0, 8) === 'https://') {
      tPath = tPath.substring(8)
    } else if (tPath.substring(0, 7) === 'http://') {
      tPath = tPath.substring(7)
    }
    const tDelim = getItemDelimiter()
    setItemDelimiter('/')
    const pathParts = tPath.split('/')
    tPath = pathParts[0]
    setItemDelimiter('.')
    const domainParts = tPath.split('.')
    let tMaxItemCount = 2
    if (tPath.includes('.co.')) {
      tMaxItemCount = 3
    }
    tPath = domainParts.slice(domainParts.length - tMaxItemCount).join('.')
    setItemDelimiter(':')
    tPath = tPath.split(':')[0]
    setItemDelimiter(tDelim)
    return tPath
  }

  getPredefinedURL(tURL) {
    if (tURL.includes('http://%predefined%/')) {
      if (variableExists('url.prefix')) {
        let tReplace = 'http://%predefined%'
        const tPrefix = getVariable('url.prefix')
        if (tPrefix[tPrefix.length - 1] === '/') {
          tReplace = 'http://%predefined%/'
        }
        tURL = replaceChunks(tURL, tReplace, tPrefix)
      } else {
        return error(this, 'URL prefix not defined, invalid link.', symbol('#getPredefinedURL'), symbol('#minor'))
      }
    }
    return tURL
  }

  getExtVarPath() {
    const tVariableID = 'system.v2'
    if (!variableExists(tVariableID)) {
      return getVariableManager().GET('external.variables.txt')
    }
    return deobfuscate(getVariable(tVariableID))
  }

  sendProcessTracking(tStepValue) {
    this.pProcessList.push(tStepValue)
    if (variableExists('processlog.url')) {
      const tReportURL = String(getVariable('processlog.url'))
      if (tReportURL === 'javascript') {
        // JavaScript logging handler
      } else if ((tReportURL !== '') && !voidP(tReportURL)) {
        const tParams = { step: tStepValue, account_id: getVariable('account_id') }
        fetch(tReportURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tParams),
        }).catch(() => {})
      }
    }
  }

  getProcessTrackingList() {
    return this.pProcessList
  }

  secretDecode(tKey) {
    let tLength = tKey.length
    if (tLength % 2 === 1) {
      tLength = tLength - 1
    }
    const tTable = tKey.substring(0, tKey.length / 2)
    tKey = tKey.substring(tKey.length / 2, tLength)
    let tCheckSum = 0
    for (let i = 0; i < tKey.length; i++) {
      const c = tKey[i]
      let a = tTable.indexOf(c)
      if (a % 2 === 0) {
        a = a * 2
      }
      if (i % 3 === 0) {
        a = a * 3
      }
      if (a < 0) {
        a = tKey.length % 2
      }
      tCheckSum = tCheckSum + a
      tCheckSum = tCheckSum ^ (a * Math.pow(2, (i % 3) * 8))
    }
    return tCheckSum
  }

  readValueFromField(tField, tDelimiter, tSearchedKey) {
    const tStr = field(tField)
    const tDelim = getItemDelimiter()
    if (voidP(tDelimiter)) {
      tDelimiter = '\n'
    }
    setItemDelimiter(tDelimiter)
    const items = tStr.split(tDelimiter)
    for (let i = 0; i < items.length; i++) {
      const tPair = items[i]
      if ((tPair[0] !== '#') && (tPair !== '')) {
        setItemDelimiter('=')
        const parts = tPair.split('=')
        const tProp = parts[0].trim()
        let tValue = parts.slice(1).join('=').trim()
        if (tProp === tSearchedKey) {
          if (!tValue.includes(' ') && integerp(parseInt(tValue))) {
            if (String(parseInt(tValue)).length === tValue.length) {
              tValue = parseInt(tValue)
            }
          } else if (floatp(parseFloat(tValue))) {
            tValue = parseFloat(tValue)
          }
          setItemDelimiter(tDelim)
          return tValue
        }
      }
      setItemDelimiter(tDelimiter)
    }
    setItemDelimiter(tDelim)
    return 0
  }

  addRandomParamToURL(tURL) {
    const tRandomParamName = 'randp'
    let tSeparator = '?'
    if (tURL.includes('?')) {
      tSeparator = '&'
    }
    return tURL + tSeparator + tRandomParamName + random(999) + '=1'
  }

  checkForXtra(tXtraName) {
    // In JS, no xtraList concept
    return false
  }

  print(tObj, tMsg) {
    tObj = String(tObj)
    console.log('Print:\n\tObject:', tObj, '\n\tMessage:', tMsg)
  }

  generateMachineId(tMaxLength) {
    const tWhiteList = String(getVariable('machine.id.white.list'))
    const tRawMachineId = String(Date.now()) + String(new Date().toLocaleTimeString()) + String(new Date().toLocaleDateString())
    let tMachineID = ''
    for (let i = 0; i < tRawMachineId.length; i++) {
      const tChar = tRawMachineId[i]
      if (tWhiteList.includes(tChar)) {
        tMachineID += tChar
      }
    }
    tMachineID = replaceChunks(tMachineID, 'AM', '')
    tMachineID = replaceChunks(tMachineID, 'PM', '')
    tMachineID = replaceChunks(tMachineID, 'am', '')
    tMachineID = replaceChunks(tMachineID, 'pm', '')
    const maxLen = getVariable('machine.id.max.length')
    return tMachineID.substring(0, maxLen)
  }

  setExtVarPath(tURL) {
    return setVariable('system.v2', obfuscate(tURL))
  }

  prepareToolTip() {
    if (this.pToolTipAct) {
      const tFontStruct = getStructVariable('struct.font.tooltip')
      // pToolTipMem = member(createMember("ToolTip Text", #field))
      // pToolTipSpr = sprite(reserveSprite(this.pID))
      // pToolTipSpr.locZ = 200000000
      this.pToolTipID = null
      this.pToolTipDel = getIntVariable('tooltip.delay', 2000)
    }
  }

  alertHook() {
    this.pCatchFlag = 1
    // the alertHook = this.pSavedHook
    return true
  }

  getReceipt(tStamp) {
    const tReceipt = []
    for (let i = 0; i < tStamp.length; i++) {
      let tChar = charToNum(tStamp[i])
      tChar = (tChar * (i + 1)) + 309203
      tReceipt[i] = tChar
    }
    return tReceipt
  }

  getClientUpTime() {
    const tTimeNow = new Date().toLocaleTimeString()
    const tDateNow = new Date().toLocaleDateString()
    const tTimeStart = getObject(symbol('#session')).GET('client_starttime')
    const tDateStart = getObject(symbol('#session')).GET('client_startdate')
    let tSeconds = 0
    const tTimeDelimiter = this.getDelimiter(tTimeNow)
    if (tDateNow !== tDateStart) {
      tSeconds = (1 * 24 * 60 * 60) + this.calculateTimeDifference(tTimeStart, tTimeNow, tTimeDelimiter)
    } else {
      tSeconds = this.calculateTimeDifference(tTimeStart, tTimeNow, tTimeDelimiter)
    }
    return tSeconds
  }

  calculateTimeDifference(a_from, a_to, a_delimiter) {
    const tItemDeLim = getItemDelimiter()
    setItemDelimiter(a_delimiter)
    const fromParts = a_from.split(a_delimiter)
    const toParts = a_to.split(a_delimiter)
    let tHours = parseInt(toParts[0]) - parseInt(fromParts[0])
    let tMinutes = parseInt(toParts[1]) - parseInt(fromParts[1])
    let tSeconds = parseInt(toParts[2]) - parseInt(fromParts[2])
    let tAmPmMod = 0
    if ((a_from.includes('am') || a_from.includes('pm'))) {
      if ((a_from.includes('am') && a_to.includes('pm')) || (a_to.includes('am') && a_from.includes('pm'))) {
        tAmPmMod = 12 * 60 * 60
      }
    }
    setItemDelimiter(tItemDeLim)
    return (tHours * 60 * 60) + (tMinutes * 60) + tSeconds + tAmPmMod
  }

  getDelimiter(a_string) {
    const tLocaleDelimiters = ['.', ',', ':', ';', '/', '\\', ' ', '-', String.fromCharCode(10), String.fromCharCode(13)]
    for (let i = 0; i < tLocaleDelimiters.length; i++) {
      const tOffset = a_string.indexOf(tLocaleDelimiters[i])
      if ((tOffset > 0) && (tOffset < 5)) {
        return tLocaleDelimiters[i]
      }
    }
    return ':'
  }

  delay(ms, method, ...args) {
    setTimeout(() => {
      if (this[method]) this[method](...args)
    }, ms)
  }
}
