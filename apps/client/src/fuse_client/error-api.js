// fuse_client/7_Error API.ls → error-api.js
// Global API facade for the error manager system

import {
  voidP,
  symbol,
  objectp,
  value,
  field,
  convertToPropList,
  script,
  RETURN,
} from '../core/lingo-runtime.js'
import { createObject } from './object-api.js'

// Global variable (Lingo: global gError)
let gError = null

function constructErrorManager() {
  if (objectp(gError)) {
    return gError
  }
  const tClass = value(convertToPropList(field('System Props'), RETURN).getaProp('error.manager.class'))[0]
  gError = script(tClass).new()
  try {
    gError.construct()
    createObject(symbol('#error_manager'), gError)
  } catch (e) {
    return gError
  }
  return gError
}

export function deconstructErrorManager() {
  if (!objectp(gError)) {
    return false
  }
  gError.deconstruct()
  gError = null
  return true
}

export function getErrorManager() {
  if (!objectp(gError)) {
    return constructErrorManager()
  }
  return gError
}

export function error(tObject, tMsg, tMethod, tErrorLevel) {
  return getErrorManager().error(tObject, tMsg, tMethod, tErrorLevel)
}

export function serverError(tErrorList) {
  return getErrorManager().serverError(tErrorList)
}

export function getClientErrors() {
  return getErrorManager().getClientErrors()
}

export function getServerErrors() {
  return getErrorManager().getServerErrors()
}

export function fatalError(tErrorData) {
  return getErrorManager().fatalError(tErrorData)
}

export function SystemAlert(tObject, tMsg, tMethod) {
  return getErrorManager().SystemAlert(tObject, tMsg, tMethod)
}

export function setDebugLevel(tLevel) {
  return getErrorManager().setDebugLevel(tLevel)
}

export function printErrors() {
  return getErrorManager().print()
}

// Re-export manager classes
export { ErrorManagerClass } from './error-manager-class.js'
