/**
 * String Services API
 * Translated from: 16_String Services API.ls
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { getManager, createManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructStringServices() {
  return createManager('string_services', getManagerClassList('string'));
}

export function deconstructStringServices() {
  return removeManager('string_services');
}

export function getStringServices() {
  if (!managerExists('string_services')) return constructStringServices();
  return getManager('string_services');
}

export function convertToPropList(tString, tDelimiter) {
  return getStringServices().convertToPropList(tString, tDelimiter);
}

export function convertToLowerCase(tString) {
  return getStringServices().convertToLowerCase(tString);
}

export function convertToHigherCase(tString) {
  return getStringServices().convertToHigherCase(tString);
}

export function convertSpecialChars(tString, tDirection) {
  return getStringServices().convertSpecialChars(tString, tDirection);
}

export function convertIntToHex(tInt) {
  return getStringServices().convertIntToHex(tInt);
}

export function convertHexToInt(tHex) {
  return getStringServices().convertHexToInt(tHex);
}

export function explode(tString, tDelimiter, tLimit) {
  return getStringServices().explode(tString, tDelimiter, tLimit);
}

export function implode(tList, tDelimiter) {
  return getStringServices().implode(tList, tDelimiter);
}

export function replaceChars(tString, tCharA, tCharB) {
  return getStringServices().replaceChars(tString, tCharA, tCharB);
}

export function replaceChunks(tString, tChunkA, tChunkB) {
  return getStringServices().replaceChunks(tString, tChunkA, tChunkB);
}

export function urlEncode(tString) {
  return getStringServices().urlEncode(tString);
}

export function obfuscate(tString) {
  return getStringServices().obfuscate(tString);
}

export function deobfuscate(tString) {
  return getStringServices().deobfuscate(tString);
}

export function getLocalFloat(tStrFloat) {
  return getStringServices().getLocalFloat(tStrFloat);
}

export function encodeUTF8(tStr) {
  return getStringServices().encodeUTF8(tStr);
}

export function decodeUTF8(tStr, tForceDecode) {
  return getStringServices().decodeUTF8(tStr, tForceDecode);
}
