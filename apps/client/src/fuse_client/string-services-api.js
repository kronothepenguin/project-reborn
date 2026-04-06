// fuse_client/16_String Services API.ls → string-services-api.js
// String utilities API facade

import {
  symbol,
  voidP,
  getItemDelimiter,
  setItemDelimiter,
  offset,
  length,
  createManager,
  removeManager,
  getObjectManager,
  createPropList,
} from '../core/lingo-runtime.js'

function constructStringServices() {
  return createManager(symbol('#string_services'), getClassVariable('string.services.class'))
}

function deconstructStringServices() {
  return removeManager(symbol('#string_services'))
}

export function getStringServices() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#string_services'))) {
    return constructStringServices()
  }
  return tMgr.getManager(symbol('#string_services'))
}

export function convertToPropList(tString, tDelimiter) {
  const tOldDelim = getItemDelimiter()
  if (voidP(tDelimiter)) {
    tDelimiter = ','
  }
  setItemDelimiter(tDelimiter)
  const tProps = createPropList()
  const items = tString.split(tDelimiter)
  for (let i = 0; i < items.length; i++) {
    const tPair = items[i].trim()
    const eqOffset = tPair.indexOf('=')
    if (eqOffset > 0) {
      const tProp = tPair.substring(0, eqOffset).trim()
      const tValue = tPair.substring(eqOffset + 1).trim()
      tProps.setaProp(tProp, tValue)
    }
  }
  setItemDelimiter(tOldDelim)
  return tProps
}

export function convertToLowerCase(tString) {
  return getStringServices().convertToLowerCase(tString)
}

export function convertToHigherCase(tString) {
  return getStringServices().convertToHigherCase(tString)
}

export function convertSpecialChars(tString, tDirection) {
  return getStringServices().convertSpecialChars(tString, tDirection)
}

export function convertIntToHex(tInt) {
  return getStringServices().convertIntToHex(tInt)
}

export function convertHexToInt(tHex) {
  return getStringServices().convertHexToInt(tHex)
}

export function explode(tString, tDelimiter, tLimit) {
  return getStringServices().explode(tString, tDelimiter, tLimit)
}

export function implode(tList, tDelimiter) {
  return getStringServices().implode(tList, tDelimiter)
}

export function replaceChars(tString, tCharA, tCharB) {
  return getStringServices().replaceChars(tString, tCharA, tCharB)
}

export function replaceChunks(tString, tChunkA, tChunkB) {
  return getStringServices().replaceChunks(tString, tChunkA, tChunkB)
}

export function urlEncode(tString) {
  return getStringServices().urlEncode(tString)
}

export function obfuscate(tString) {
  return getStringServices().obfuscate(tString)
}

export function deobfuscate(tString) {
  return getStringServices().deobfuscate(tString)
}

export function getLocalFloat(tStrFloat) {
  return getStringServices().getLocalFloat(tStrFloat)
}

export function encodeUTF8(tStr) {
  return getStringServices().encodeUTF8(tStr)
}

export function decodeUTF8(tStr, tForceDecode) {
  return getStringServices().decodeUTF8(tStr, tForceDecode)
}

