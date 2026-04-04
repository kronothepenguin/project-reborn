/**
 * Write API
 * Translated from: 21_Write API.ls
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { getManager, createManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructWriterManager() {
  return createManager('writer_manager', getManagerClassList('writer'));
}

export function deconstructWriterManager() {
  return removeManager('writer_manager');
}

export function getWriterManager() {
  if (!managerExists('writer_manager')) return constructWriterManager();
  return getManager('writer_manager');
}

export function createWriter(tID, tMetrics) {
  return getWriterManager().create(tID, tMetrics);
}

export function removeWriter(tID) {
  return getWriterManager().remove(tID);
}

export function getWriter(tID, tDefault) {
  return getWriterManager().get(tID, tDefault);
}

export function writerExists(tID) {
  return getWriterManager().exists(tID);
}

export function printWriters() {
  return getWriterManager().print();
}
