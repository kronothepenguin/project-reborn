// fuse_client/4_Client Initialization Script.ls → client-initialization.js
// Core client initialization: initCore, stopClient, resetClient

import {
  voidP,
  symbol,
  theRunMode,
  getMoviePath,
  objectExists,
  getObject,
  deobfuscate,
} from '../core/lingo-runtime.js'
import { constructObjectManager, deconstructObjectManager } from './object-api.js'
import { dumpVariableField } from './variable-api.js'
import { getResourceManager } from './resource-api.js'
import { dumpTextField } from './text-api.js'
import { getThreadManager } from './core-thread-api.js'
import { deconstructConnectionManager } from './connection-api.js'
import { deconstructErrorManager } from './error-api.js'
import { openNetPage } from './special-services-api.js'
import { getCastLoadManager } from './castload-api.js'

// ── Translated functions ─────────────────────────────────────────────────

export function initCore() {
  if (!constructObjectManager()) {
    return false
  }
  if (!dumpVariableField('System Props')) {
    return stopClient()
  }
  if (!getCastLoadManager().resetCastLibs(0, 0)) {
    return stopClient()
  }
  if (!getResourceManager().preIndexMembers()) {
    return stopClient()
  }
  if (!dumpTextField('System Texts')) {
    return stopClient()
  }
  if (!getThreadManager().create(symbol('#core'), symbol('#core'))) {
    return stopClient()
  }
  return true
}

export function stopClient() {
  if (theRunMode().includes('Author')) {
    if (theRunMode().includes('Author')) {
      deconstructConnectionManager()
      deconstructObjectManager()
      deconstructErrorManager()
    }
  }
  return false
}

export function resetClient() {
  if (theRunMode().includes('Author')) {
    stopClient()
  } else {
    let tURL = getMoviePath()
    if (objectExists(symbol('#session'))) {
      if (getObject(symbol('#session')).exists('client_url')) {
        tURL = deobfuscate(getObject(symbol('#session')).GET('client_url'))
      }
    }
    openNetPage(tURL)
  }
  return true
}
