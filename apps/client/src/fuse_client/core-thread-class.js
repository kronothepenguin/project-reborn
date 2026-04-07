// fuse_client/74_Core Thread Class.ls → core-thread-class.js
// Core thread - boot sequence orchestrator that loads variables, texts, casts, and initializes threads

import {
  symbol,
  symbolp,
  voidP,
  listp,
  length,
  count,
  point,
  rect,
  member,
  memberExists,
  getmemnum,
  sprite,
  reserveSprite,
  releaseSprite,
  cursor,
  theMilliSeconds,
  theRunMode,
  theDate,
  theLongTime,
  externalParamValue,
  getItemDelimiter,
  setItemDelimiter,
  error,
  createPropList,
  puppetTempo,
} from '../core/lingo-runtime.js'
import { createObject, removeObject, executeMessage, receiveUpdate, removeUpdate } from './object-api.js'
import { getClassVariable, getVariable, getVariableManager, variableExists, getVariableValue, getIntVariable } from './variable-api.js'
import { getSpecialServices, getExtVarPath, getMoviePath, setDebugLevel, sendProcessTracking, obfuscate } from './special-services-api.js'
import { fatalError } from '../core/lingo-runtime.js'
import { queueDownload, registerDownloadCallback } from './download-api.js'
import { dumpVariableField, dumpTextField } from './variable-api.js'
import { getStringServices } from './string-services-api.js'
import { startCastLoad, registerCastloadCallback } from './castload-api.js'
import { getThreadManager } from './core-thread-api.js'
import { createTimeout, timeoutExists, removeTimeout } from './timeout-api.js'
import { callJavaScriptFunction } from './javascript-proxy.js'

export class CoreThreadClass {
  constructor() {
    this.pState = null
    this.pLogoSpr = null
    this.pFadingLogo = false
    this.pLogoStartTime = 0
    this.pCrapFixing = false
    this.pCrapFixSpr = null
    this.pCrapFixRegionInvalidated = true
    this.pFullScreenRefreshSpr = null
    this.pID = null
  }

  construct() {
    const tSession = createObject(symbol('#session'), getClassVariable('variable.manager.class'))
    tSession.set('client_startdate', theDate())
    tSession.set('client_starttime', theLongTime())
    tSession.set('client_version', getVariable('system.version'))
    tSession.set('client_url', getMoviePath())
    tSession.set('client_lastclick', '')
    createObject(symbol('#headers'), getClassVariable('variable.manager.class'))
    createObject(symbol('#classes'), getClassVariable('variable.manager.class'))
    createObject(symbol('#cache'), getClassVariable('variable.manager.class'))
    // createBroker(symbol('#Initialize'))
    // registerMessage(symbol('#requestHotelView'), this.pID, symbol('#initTransferToHotelView'))
    // registerMessage(symbol('#invalidateCrapFixRegion'), this.pID, symbol('#invalidateCrapFixer'))
    this.pFadingLogo = false
    this.pLogoStartTime = 0
    this.pCrapFixSpr = sprite(reserveSprite())
    if (this.pCrapFixSpr) {
      this.pCrapFixSpr.member = member(getmemnum('crap.fixer'))
      if (this.pCrapFixSpr.member) {
        this.pCrapFixSpr.width = 560
        this.pCrapFixSpr.height = 75
      }
      this.pCrapFixSpr.locZ = -2000000000
      this.pCrapFixSpr.locH = -1
      this.pCrapFixSpr.locV = 0
      this.pCrapFixSpr.visible = false
    }
    this.pCrapFixing = false
    this.pCrapFixRegionInvalidated = true
    this.pFullScreenRefreshSpr = sprite(reserveSprite())
    if (this.pFullScreenRefreshSpr) {
      this.pFullScreenRefreshSpr.member = member(getmemnum('crap.fixer'))
      if (this.pFullScreenRefreshSpr.member) {
        this.pFullScreenRefreshSpr.width = 801 // (the stage).image.width + 1
        this.pFullScreenRefreshSpr.height = 600 // (the stage).image.height
      }
      this.pFullScreenRefreshSpr.locZ = -2000000000
      this.pFullScreenRefreshSpr.locH = -1
      this.pFullScreenRefreshSpr.locV = 0
      this.pFullScreenRefreshSpr.visible = false
    }
    return this.updateState('load_variables')
  }

  deconstruct() {
    if (timeoutExists('client.refresh.timeout')) {
      removeTimeout('client.refresh.timeout')
    }
    // unregisterMessage(symbol('#invalidateCrapFixRegion'), this.pID)
    if (this.pCrapFixSpr && this.pCrapFixSpr.spriteNum) {
      releaseSprite(this.pCrapFixSpr.spriteNum)
    }
    return this.hideLogo()
  }

  showLogo() {
    if (memberExists('Logo')) {
      const tmember = member(getmemnum('Logo'))
      this.pLogoSpr = sprite(reserveSprite(this.pID))
      if (this.pLogoSpr && tmember) {
        this.pLogoSpr.member = tmember
        this.pLogoSpr.ink = 0
        this.pLogoSpr.blend = 90
        this.pLogoSpr.locZ = -20000001
        this.pLogoSpr.locH = 400 // (the stage).rect.width / 2
        this.pLogoSpr.locV = (300 / 2) - (tmember.height || 0)
        this.pLogoStartTime = theMilliSeconds()
      }
    }
    return true
  }

  hideLogo() {
    if (this.pLogoSpr && this.pLogoSpr.spriteNum) {
      releaseSprite(this.pLogoSpr.spriteNum)
      this.pLogoSpr = null
    }
    return true
  }

  initTransferToHotelView() {
    const tShowLogoForMs = 1000
    const tLogoNowShownMs = theMilliSeconds() - this.pLogoStartTime
    if (tLogoNowShownMs >= tShowLogoForMs) {
      createTimeout('logo_timeout', 2000, symbol('#initUpdate'), this.pID, null, false)
    } else {
      createTimeout('init_timeout', tShowLogoForMs - tLogoNowShownMs + 1, symbol('#initTransferToHotelView'), this.pID, null, false)
    }
  }

  initUpdate() {
    this.pFadingLogo = true
    receiveUpdate(this.pID)
  }

  invalidateCrapFixer() {
    this.pCrapFixRegionInvalidated = true
  }

  update() {
    if (this.pFadingLogo) {
      let tBlend = 0
      if (this.pLogoSpr !== null) {
        this.pLogoSpr.blend -= 10
        tBlend = this.pLogoSpr.blend
      }
      if (tBlend <= 0) {
        if (!this.pCrapFixing) {
          removeUpdate(this.pID)
        }
        this.pFadingLogo = false
        this.hideLogo()
        executeMessage(symbol('#showHotelView'))
        callJavaScriptFunction('clientReady')
      }
    }
    if (this.pCrapFixing) {
      if (this.pCrapFixSpr) {
        if (this.pCrapFixRegionInvalidated) {
          this.pCrapFixSpr.visible = true
          switch (this.pCrapFixSpr.locH) {
            case 0:
              this.pCrapFixSpr.locH = -1
              break
            case -1:
              this.pCrapFixSpr.locH = 0
              break
            default:
              this.pCrapFixSpr.locH = 0
          }
          this.pCrapFixRegionInvalidated = false
        }
      }
    }
  }

  assetDownloadCallbacks(tAssetId, tSuccess) {
    if (tSuccess === false || tSuccess === 0) {
      switch (tAssetId) {
        case 'load_variables':
        case 'load_texts':
        case 'load_casts':
          fatalError({ error: tAssetId })
          return false
      }
      return false
    }
    switch (tAssetId) {
      case 'load_variables':
        this.updateState('load_params')
        break
      case 'load_texts':
        this.updateState('load_casts')
        break
      case 'load_casts':
        this.updateState('validate_resources')
        break
      case 'validate_resources':
        this.updateState('validate_resources')
        break
    }
  }

  updateState(tstate) {
    switch (tstate) {
      case 'load_variables': {
        this.pState = tstate
        this.showLogo()
        cursor(4)
        if (theRunMode().includes('Plugin')) {
          const tDelim = getItemDelimiter()
          for (let i = 1; i <= 9; i++) {
            const tParamBundle = externalParamValue('sw' + i)
            if (!voidP(tParamBundle)) {
              setItemDelimiter(';')
              const items = tParamBundle.split(';')
              for (const tParam of items) {
                setItemDelimiter('=')
                const parts = tParam.split('=')
                if (parts.length > 1) {
                  const tKey = parts[0]
                  const tValue = parts.slice(1).join('=')
                  switch (tKey) {
                    case 'client.fatal.error.url':
                    case 'client.allow.cross.domain':
                    case 'client.notify.cross.domain':
                    case 'processlog.url':
                    case 'account_id':
                      getVariableManager().set(tKey, tValue)
                      break
                    case 'external.variables.txt':
                      getSpecialServices().setExtVarPath(tValue)
                      break
                  }
                }
                setItemDelimiter(';')
              }
            }
          }
          setItemDelimiter(tDelim)
        }
        const tURL = getExtVarPath()
        const tMemName = tURL
        const tMemNum = queueDownload(tURL, tMemName, symbol('#field'), true)
        sendProcessTracking(9)
        if (tMemNum === 0) {
          fatalError({ error: tstate })
          return false
        }
        return registerDownloadCallback(tMemNum, symbol('#assetDownloadCallbacks'), this.pID, tstate)
      }
      case 'load_params': {
        this.pState = tstate
        dumpVariableField(getExtVarPath())
        removeMember(getExtVarPath())
        if (variableExists('text.crap.fixing')) {
          this.pCrapFixing = getVariableValue('text.crap.fixing')
        }
        if (variableExists('client.full.refresh.period')) {
          createTimeout('client.refresh.timeout', getIntVariable('client.full.refresh.period'), symbol('#fullScreenRefresh'), this.pID, null, true)
        }
        if (theRunMode().includes('Plugin')) {
          const tDelim = getItemDelimiter()
          for (let i = 1; i <= 9; i++) {
            const tParamBundle = externalParamValue('sw' + i)
            if (!voidP(tParamBundle)) {
              setItemDelimiter(';')
              const items = tParamBundle.split(';')
              for (const tParam of items) {
                setItemDelimiter('=')
                const parts = tParam.split('=')
                if (parts.length > 1) {
                  getVariableManager().set(parts[0], parts.slice(1).join('='))
                }
                setItemDelimiter(';')
              }
            }
          }
          setItemDelimiter(tDelim)
        }
        setDebugLevel(0)
        getStringServices().initConvList()
        puppetTempo(getIntVariable('system.tempo', 30))
        if (variableExists('client.reload.url')) {
          getObject(symbol('#session')).set('client_url', obfuscate(getVariable('client.reload.url')))
        }
        return this.updateState('load_texts')
      }
      case 'load_texts': {
        this.pState = tstate
        const tURL = getVariable('external.texts.txt')
        const tMemName = tURL
        if (tMemName === '' || voidP(tMemName)) {
          return this.updateState('load_casts')
        }
        const tMemNum = queueDownload(tURL, tMemName, symbol('#field'))
        sendProcessTracking(12)
        if (tMemNum === 0) {
          fatalError({ error: tstate })
          return false
        }
        return registerDownloadCallback(tMemNum, symbol('#assetDownloadCallbacks'), this.pID, tstate)
      }
      case 'load_casts': {
        this.pState = tstate
        const tTxtFile = getVariable('external.texts.txt')
        if (tTxtFile && tTxtFile !== 0) {
          if (memberExists(tTxtFile)) {
            dumpTextField(tTxtFile)
            removeMember(tTxtFile)
          }
        }
        sendProcessTracking(23)
        const tCastList = []
        let i = 1
        while (true) {
          if (!variableExists('cast.entry.' + i)) break
          const tFileName = getVariable('cast.entry.' + i)
          tCastList.push(tFileName)
          i++
        }
        if (tCastList.length > 0) {
          const tLoadID = startCastLoad(tCastList, true, null, null, true)
          if (getVariable('loading.bar.active')) {
            // showLoadingBar(tLoadID, { buffer: symbol('#window'), locY: 500, width: 300 })
          }
          return registerCastloadCallback(tLoadID, symbol('#assetDownloadCallbacks'), this.pID, tstate)
        }
        return this.updateState('init_threads')
      }
      case 'validate_resources': {
        this.pState = tstate
        const tCastList = []
        const tNewList = []
        const tVarMngr = getVariableManager()
        let i = 1
        while (true) {
          if (!tVarMngr.exists('cast.entry.' + i)) break
          const tFileName = tVarMngr.GET('cast.entry.' + i)
          tCastList.push(tFileName)
          i++
        }
        if (tCastList.length > 0) {
          for (const tCast of tCastList) {
            // if (!castExists(tCast)) tNewList.push(tCast)
          }
        }
        if (tNewList.length > 0) {
          // const tLoadID = startCastLoad(tNewList, true, null, null, true)
          // if (getVariable('loading.bar.active')) showLoadingBar(tLoadID, { buffer: symbol('#window'), locY: 500, width: 300 })
          // return registerCastloadCallback(tLoadID, symbol('#assetDownloadCallbacks'), this.pID, tstate)
        }
        return this.updateState('init_threads')
      }
      case 'init_threads': {
        sendProcessTracking(24)
        this.pState = tstate
        cursor(0)
        // (the stage).title = getVariable('client.window.title')
        this.hideLogo()
        getThreadManager().initAll()
        return executeMessage(symbol('#Initialize'), 'initialize')
      }
      default:
        return error(this, 'Unknown state: ' + tstate, symbol('#updateState'), symbol('#major'))
    }
  }

  fullScreenRefresh() {
    if (this.pFullScreenRefreshSpr) {
      this.pFullScreenRefreshSpr.visible = true
      switch (this.pFullScreenRefreshSpr.locH) {
        case 0:
          this.pFullScreenRefreshSpr.locH = -1
          break
        case -1:
          this.pFullScreenRefreshSpr.locH = 0
          break
        default:
          this.pFullScreenRefreshSpr.locH = 0
      }
    }
  }
}
