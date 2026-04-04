/**
 * Variable API
 * 
 * Translated from: casts/fuse_client/20_Variable API.ls
 * 
 * Global functions for variable storage and retrieval.
 * Variables are key-value pairs used throughout the system for configuration.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { createManager, removeManager, getManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructVariableManager() {
  return createManager('variable_manager', getManagerClassList('variable'));
}

export function deconstructVariableManager() {
  return removeManager('variable_manager');
}

export function getVariableManager() {
  if (!managerExists('variable_manager')) {
    return constructVariableManager();
  }
  return getManager('variable_manager');
}

export function createVariable(tID, tValue) {
  return getVariableManager().create(tID, tValue);
}

export function setVariable(tID, tValue) {
  return getVariableManager().set(tID, tValue);
}

export function removeVariable(tID) {
  return getVariableManager().remove(tID);
}

export function getVariable(tID, tDefault) {
  return getVariableManager().get(tID, tDefault);
}

export function getIntVariable(tID, tDefault) {
  return getVariableManager().getInt(tID, tDefault);
}

export function getStructVariable(tID, tDefault) {
  return getVariableManager().getValue(tID, tDefault);
}

export function getClassVariable(tID, tDefault) {
  return getVariableManager().getValue(tID, tDefault);
}

export function getVariableValue(tID, tDefault) {
  return getVariableManager().getValue(tID, tDefault);
}

export function variableExists(tID) {
  return getVariableManager().exists(tID);
}

export function printVariables() {
  return getVariableManager().print();
}

export function dumpVariableField(tField, tDelimiter) {
  return getVariableManager().dump(tField, tDelimiter);
}
