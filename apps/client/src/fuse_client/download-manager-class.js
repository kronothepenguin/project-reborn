// fuse_client/31_Download Manager Class.ls → download-manager-class.js
// Download manager - handles file downloads, queue management, and callbacks

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  offset,
  length,
  createPropList,
  member,
  memberExists,
  getmemnum,
  createMember,
  getMoviePath,
  getDomainPart,
  getPredefinedURL,
  getVariable,
  variableExists,
  value,
  getIntVariable,
  error,
  objectExists,
  getObject,
  getUniqueID,
  createObject,
  getClassVariable,
  receiveUpdate,
  removeUpdate,
  removeMember,
} from '../core/lingo-runtime.js'

export class DownloadManagerClass {
  constructor() {
    this.pTaskQueue = createPropList()
    this.pActiveTasks = createPropList()
    this.pReceivedTasks = []
    this.pCompleteTasks = []
    this.pTypeDefList = createPropList()
    this.pOwnDomain = ''
    this.pLastError = 0
    this.pID = null
  }

  construct() {
    this.pTaskQueue = createPropList()
    this.pActiveTasks = createPropList()
    this.pReceivedTasks = []
    this.pCompleteTasks = []
    this.pTypeDefList = createPropList()
    this.emptyCookies()
    this.pOwnDomain = getDomainPart(getMoviePath())
    this.pLastError = 0
    return true
  }

  deconstruct() {
    this.pTaskQueue = createPropList()
    this.pActiveTasks = createPropList()
    this.pReceivedTasks = []
    this.pCompleteTasks = []
    return true
  }

  create(tURL, tMemName, ttype, tForceFlag) {
    return this.queue(tURL, tMemName, ttype, tForceFlag)
  }

  Remove(tMemNameOrNum) {
    return this.abort(tMemNameOrNum)
  }

  exists(tMemName) {
    return !voidP(this.pTaskQueue.getaProp(tMemName)) || !voidP(this.pActiveTasks.getaProp(tMemName))
  }

  queue(tURL, tMemName, ttype, tForceFlag, tDownloadMethod, tRedirectType, tTarget) {
    if (typeof tURL !== 'string') {
      return error(this, 'Missing or invalid URL: ' + tURL, symbol('#queue'), symbol('#major'))
    }
    if (typeof tMemName !== 'string') {
      tMemName = tURL
    }
    if (typeof ttype !== 'symbol') {
      ttype = this.recognizeMemberType(tURL)
    }
    tURL = getPredefinedURL(tURL)
    const tOwnDomain = getDomainPart(getMoviePath())
    const tDownloadDomain = getDomainPart(tURL)
    if ((tOwnDomain !== tDownloadDomain) && (tURL.includes('http://') || tURL.includes('https://')) && !tURL.includes('://localhost')) {
      let tAllowCrossDomain = 0
      if (variableExists('client.allow.cross.domain')) {
        tAllowCrossDomain = value(getVariable('client.allow.cross.domain'))
      }
      let tNotifyCrossDomain = 1
      if (variableExists('client.notify.cross.domain')) {
        tNotifyCrossDomain = value(getVariable('client.notify.cross.domain'))
      }
      if (tNotifyCrossDomain) {
        // executeMessage("crossDomainDownload", tURL)
      }
      if (!tAllowCrossDomain) {
        return error(this, 'Cross domain download not allowed: ' + tURL, symbol('#queue'), symbol('#minor'))
      }
    }
    if (!voidP(this.pTaskQueue.getaProp(tMemName)) || !voidP(this.pActiveTasks.getaProp(tMemName))) {
      return error(this, 'File already downloading: ' + tMemName, symbol('#queue'), symbol('#minor'))
    }
    if (memberExists(tMemName)) {
      if (tForceFlag) {
        var tMemNum = getmemnum(tMemName)
      } else {
        return getmemnum(tMemName)
      }
    } else {
      tMemNum = createMember(tMemName, ttype)
    }
    if (tMemNum < 1) {
      return error(this, 'Failed to create member!', symbol('#queue'), symbol('#major'))
    }
    this.pReceivedTasks.push(tMemName)
    const tTempTask = {
      url: tURL,
      memNum: tMemNum,
      type: ttype,
      callback: null,
      downloadMethod: tDownloadMethod,
      redirectType: tRedirectType,
      target: tTarget,
    }
    this.pTaskQueue.setaProp(tMemName, tTempTask)
    this.updateQueue()
    return tMemNum
  }

  registerCallback(tMemNameOrNum, tMethod, tClientID, tArgument) {
    const tTaskData = this.searchTask(tMemNameOrNum)
    if (!tTaskData) {
      if (stringp(tMemNameOrNum)) {
        if (getmemnum(tMemNameOrNum) === 0) {
          return error(this, "Task doesn't exist: " + tMemNameOrNum, symbol('#registerCallback'), symbol('#major'))
        }
      } else if (integerp(tMemNameOrNum)) {
        if (member(tMemNameOrNum).type === 'empty') {
          return error(this, "Task doesn't exist: " + tMemNameOrNum, symbol('#registerCallback'), symbol('#major'))
        }
      } else {
        return error(this, "Member's name or number expected: " + tMemNameOrNum, symbol('#registerCallback'), symbol('#major'))
      }
      var tTaskDataObj = { status: symbol('#complete') }
    } else {
      var tTaskDataObj = tTaskData
    }
    if (!symbolp(tMethod)) {
      return error(this, 'Symbol referring to a handler expected: ' + tMethod, symbol('#registerCallback'), symbol('#major'))
    }
    if (!objectExists(tClientID)) {
      return error(this, 'Object not found: ' + tClientID, symbol('#registerCallback'), symbol('#major'))
    }
    if (!getObject(tClientID).handler || !getObject(tClientID).handler(tMethod)) {
      return error(this, 'Handler not found in object: ' + tMethod, tClientID, symbol('#registerCallback'), symbol('#major'))
    }
    const status = tTaskDataObj.status
    if (status === symbol('#complete')) {
      // call(tMethod, getObject(tClientID), tArgument)
    } else if (status === symbol('#queue')) {
      const task = this.pTaskQueue.getaProp(tTaskDataObj.name)
      if (task) task.callback = { method: tMethod, client: tClientID, argument: tArgument }
    } else if (status === symbol('#Active')) {
      // call(#addCallBack, pActiveTasks, tTaskData.name, ...)
    }
    return true
  }

  getLoadPercent(tMemNameOrNum) {
    let tMemName
    if (integerp(tMemNameOrNum)) {
      tMemName = member(tMemNameOrNum).name
    } else if (stringp(tMemNameOrNum)) {
      tMemName = tMemNameOrNum
    } else {
      return error(this, "Member's name or number expected: " + tMemNameOrNum, symbol('#getLoadPercent'), symbol('#minor'))
    }
    if (this.pReceivedTasks.indexOf(tMemName) === -1) {
      return error(this, 'Downloaded file not found: ' + tMemName, symbol('#getLoadPercent'), symbol('#minor'))
    }
    const activeTask = this.pActiveTasks.getaProp(tMemName)
    if (!voidP(activeTask)) {
      return activeTask.getProperty ? activeTask.getProperty(symbol('#Percent')) : 0
    } else {
      const queuedTask = this.pTaskQueue.getaProp(tMemName)
      if (!voidP(queuedTask)) {
        return 0.0
      } else {
        if (this.pCompleteTasks.indexOf(tMemName) >= 0) {
          return 1.0
        }
      }
    }
    return 1.0
  }

  getProperty(tPropID) {
    switch (tPropID) {
      case symbol('#curTaskCount'):
        return this.pTaskQueue.count + this.pActiveTasks.count
      case symbol('#actTaskCount'):
        return this.pActiveTasks.count
      case symbol('#maxTaskCount'):
        return getIntVariable('net.operation.count')
      case symbol('#defaultURL'):
        return getMoviePath()
      default:
        return 0
    }
  }

  setProperty(tPropID, tValue) {
    return 0
  }

  solveNetErrorMsg(tErrorCode) {
    const messages = {
      4: 'Bad MOA class. The required network or nonnetwork Xtras are improperly installed.',
      5: 'Bad MOA Interface. The required network or nonnetwork Xtras are improperly installed.',
      6: 'Bad URL or Bad MOA class.',
      20: 'Internal error.',
      4146: 'Connection could not be established with the remote host.',
      4149: 'Data supplied by the server was in an unexpected format.',
      4150: 'Unexpected early closing of connection.',
      4154: 'Operation could not be completed due to timeout.',
      4155: 'Not enough memory available to complete the transaction.',
      4156: 'Protocol reply to request indicates an error in the reply.',
      4157: 'Transaction failed to be authenticated.',
      4159: 'Invalid URL.',
      4164: 'Could not create a socket.',
      4165: 'Requested object could not be found (URL may be incorrect).',
      4166: 'Generic proxy failure.',
      4167: 'Transfer was intentionally interrupted by client.',
      4242: 'Download stopped by netAbort(url).',
      4836: 'Download stopped for an unknown reason.',
    }
    return messages[tErrorCode] || 'Unknown error!'
  }

  print() {
    const tListList = [this.pActiveTasks, this.pTaskQueue, this.pReceivedTasks]
    for (const tList of tListList) {
      const isPropList = typeof tList === 'object' && tList.getPropAt
      for (let i = 1; i <= tList.count; i++) {
        let tID = isPropList ? tList.getPropAt(i) : i
        if (symbolp(tID)) tID = '#' + tID.toString()
        console.log(tID, ':', isPropList ? tList.getAt(i) : tList[i - 1])
      }
    }
    return true
  }

  GetLastError() {
    return this.pLastError
  }

  update() {
    // call(#update, pActiveTasks)
  }

  searchTask(tMemNameOrNum) {
    if (stringp(tMemNameOrNum)) {
      if (this.pReceivedTasks.indexOf(tMemNameOrNum) < 0) {
        return 0
      }
      const tTaskData = { name: tMemNameOrNum, number: getmemnum(tMemNameOrNum), status: null }
      const queued = this.pTaskQueue.getaProp(tMemNameOrNum)
      if (!voidP(queued)) {
        tTaskData.status = symbol('#queue')
      }
      const active = this.pActiveTasks.getaProp(tMemNameOrNum)
      if (!voidP(active)) {
        tTaskData.status = symbol('#Active')
      }
      const complete = this.pCompleteTasks.indexOf(tMemNameOrNum)
      if (complete >= 0) {
        tTaskData.status = symbol('#complete')
      }
      if (tTaskData.status !== null) {
        return tTaskData
      }
      return error(this, 'Referred task not found: ' + tMemNameOrNum, symbol('#searchTask'), symbol('#minor'))
    } else if (integerp(tMemNameOrNum)) {
      return this.searchTask(member(tMemNameOrNum).name)
    }
    return error(this, "Member's name or number expected: " + tMemNameOrNum, symbol('#searchTask'), symbol('#minor'))
  }

  updateQueue() {
    if (this.pActiveTasks.count < getIntVariable('net.operation.count')) {
      if (this.pTaskQueue.count > 0) {
        this.pLastError = 0
        const tTaskName = this.pTaskQueue.getPropAt(1)
        const tTaskData = this.pTaskQueue.getaProp(tTaskName)
        this.pTaskQueue.deleteProp(tTaskName)
        if (tTaskData.downloadMethod === symbol('#httpcookie')) {
          this.pActiveTasks.setaProp(tTaskName, createObject(getUniqueID(), getClassVariable('httpcookie.instance.class')))
        } else {
          this.pActiveTasks.setaProp(tTaskName, createObject(getUniqueID(), getClassVariable('download.instance.class')))
        }
        const activeTask = this.pActiveTasks.getaProp(tTaskName)
        if (activeTask && activeTask.define) {
          activeTask.define(tTaskName, tTaskData)
        }
        receiveUpdate(this.pID)
      }
    }
    if (this.pActiveTasks.count === 0) {
      removeUpdate(this.pID)
    }
    return true
  }

  removeActiveTask(tMemName, tCallback, tSuccess) {
    if (voidP(tSuccess)) {
      tSuccess = 1
    }
    const props = this.pActiveTasks.keys()
    for (let i = 0; i < props.length; i++) {
      const taskName = props[i]
      const task = this.pActiveTasks.getaProp(taskName)
      if (task && task.pMemName === tMemName) {
        if (!tSuccess) {
          // pLastError = netError(pActiveTasks[i].pNetId)
        }
        if (task.deconstruct) task.deconstruct()
        this.pActiveTasks.deleteProp(taskName)
        this.pCompleteTasks.push(tMemName)
        this.updateQueue()
        break
      }
    }
    if (!voidP(tCallback)) {
      if (objectExists(tCallback.client)) {
        // call(tCallback.method, getObject(tCallback.client), tCallback.argument, tSuccess)
      }
    }
    return 0
  }

  eraseDownloadedItems() {
    for (let i = 0; i < this.pReceivedTasks.length; i++) {
      removeMember(this.pReceivedTasks[i])
    }
    return true
  }

  recognizeMemberType(tURL) {
    if (this.pTypeDefList.count === 0) {
      this.fillTypeDefinitions()
    }
    const tFileType = tURL.substring(Math.max(0, tURL.length - 5))
    const dotIdx = tFileType.indexOf('.')
    const ext = dotIdx >= 0 ? tFileType.substring(dotIdx + 1) : tFileType
    const tFileTypeResult = this.pTypeDefList.getaProp(ext)
    if (!symbolp(tFileTypeResult)) {
      error(this, "Couldn't recognize member's type: " + tURL, symbol('#recognizeMemberType'), symbol('#minor'))
      return symbol('#field')
    }
    return tFileTypeResult
  }

  emptyCookies() {
    const tCookiePrefLoc = getVariable('httpcookie.pref.name')
    // setPref(tCookiePrefLoc, '')
  }

  fillTypeDefinitions() {
    this.pTypeDefList = createPropList()
    this.pTypeDefList.setaProp('gif', symbol('#bitmap'))
    this.pTypeDefList.setaProp('jpg', symbol('#bitmap'))
    this.pTypeDefList.setaProp('bmp', symbol('#bitmap'))
    this.pTypeDefList.setaProp('png', symbol('#bitmap'))
    this.pTypeDefList.setaProp('tif', symbol('#bitmap'))
    this.pTypeDefList.setaProp('tiff', symbol('#bitmap'))
    this.pTypeDefList.setaProp('psd', symbol('#bitmap'))
    this.pTypeDefList.setaProp('txt', symbol('#field'))
    this.pTypeDefList.setaProp('html', symbol('#field'))
    this.pTypeDefList.setaProp('htm', symbol('#field'))
    this.pTypeDefList.setaProp('jsp', symbol('#field'))
    this.pTypeDefList.setaProp('xml', symbol('#field'))
    this.pTypeDefList.setaProp('nfo', symbol('#field'))
    this.pTypeDefList.setaProp('js', symbol('#field'))
    this.pTypeDefList.setaProp('css', symbol('#field'))
    this.pTypeDefList.setaProp('avi', symbol('#digitalVideo'))
    this.pTypeDefList.setaProp('mpg', symbol('#digitalVideo'))
    this.pTypeDefList.setaProp('mpeg', symbol('#digitalVideo'))
    this.pTypeDefList.setaProp('mp3', symbol('#sound'))
    this.pTypeDefList.setaProp('wav', symbol('#sound'))
    this.pTypeDefList.setaProp('snd', symbol('#sound'))
    this.pTypeDefList.setaProp('swa', symbol('#swa'))
    this.pTypeDefList.setaProp('fla', symbol('#flash'))
    this.pTypeDefList.setaProp('fnt', symbol('#font'))
    this.pTypeDefList.setaProp('ttf', symbol('#font'))
    this.pTypeDefList.setaProp('cur', symbol('#cursor'))
    return true
  }

  abort(tMemNameOrNum) {
    // Placeholder - abort download
    return true
  }
}
