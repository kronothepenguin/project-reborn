// fuse_client/17_Visualizer API.ls → visualizer-api.js
// Visualizer manager API facade

import { symbol } from '../core/lingo-runtime.js'
import {
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructVisualizerManager() {
  return createManager(symbol('#visualizer_manager'), getClassVariable('visualizer.manager.class'))
}

function deconstructVisualizerManager() {
  return removeManager(symbol('#visualizer_manager'))
}

export function getVisualizerManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#visualizer_manager'))) {
    return constructVisualizerManager()
  }
  return tMgr.getManager(symbol('#visualizer_manager'))
}

export function createVisualizer(tID, tLayout, tLocX, tLocY) {
  return getVisualizerManager().create(tID, tLayout, tLocX, tLocY)
}

export function removeVisualizer(tID) {
  return getVisualizerManager().Remove(tID)
}

export function getVisualizer(tID) {
  return getVisualizerManager().GET(tID)
}

export function visualizerExists(tID) {
  return getVisualizerManager().exists(tID)
}

export function printVisualizers() {
  return getVisualizerManager().print()
}
