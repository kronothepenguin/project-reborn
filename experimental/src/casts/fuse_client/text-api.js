/**
 * Text API
 * Translated from: 15_Text API.ls
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { getManager, createManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructTextManager() {
  return createManager('text_manager', getManagerClassList('text'));
}

export function deconstructTextManager() {
  return removeManager('text_manager');
}

export function getTextManager() {
  if (!managerExists('text_manager')) return constructTextManager();
  return getManager('text_manager');
}

export function createText(tID, tValue) {
  return getTextManager().create(tID, tValue);
}

export function removeText(tID) {
  return getTextManager().remove(tID);
}

export function setText(tID, tValue) {
  return getTextManager().set(tID, tValue);
}

export function getText(tID, tDefault) {
  return getTextManager().get(tID, tDefault);
}

export function textExists(tID) {
  return getTextManager().exists(tID);
}

export function printTexts() {
  return getTextManager().print();
}

export function dumpTextField(tField, tDelimiter) {
  return getTextManager().dump(tField, tDelimiter);
}
