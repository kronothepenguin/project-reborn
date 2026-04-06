// fuse_client/19_Broker Manager API.ls → broker-manager-api.js
// Broker manager API facade for message routing

import {
  symbol,
  createManager,
  removeManager,
  getObjectManager,
} from './object-api.js'
import { getClassVariable } from './variable-api.js'

function constructBrokerManager() {
  return createManager(symbol('#broker_manager'), getClassVariable('broker.manager.class'))
}

function deconstructBrokerManager() {
  return removeManager(symbol('#broker_manager'))
}

export function getBrokerManager() {
  const tMgr = getObjectManager()
  if (!tMgr.managerExists(symbol('#broker_manager'))) {
    return constructBrokerManager()
  }
  return tMgr.getManager(symbol('#broker_manager'))
}

export function createBroker(tMessage) {
  return getBrokerManager().create(tMessage)
}

export function removeBroker(tMessage) {
  return getBrokerManager().Remove(tMessage)
}

export function getBroker(tMessage) {
  return getBrokerManager().GET(tMessage)
}

export function brokerExists(tMessage) {
  return getBrokerManager().exists(tMessage)
}

export function printBrokers() {
  return getBrokerManager().print()
}

export function registerMessage(tMessage, tClientID, tMethod) {
  return getBrokerManager().register(tMessage, tClientID, tMethod)
}

export function unregisterMessage(tMessage, tClientID) {
  return getBrokerManager().unregister(tMessage, tClientID)
}

export function executeMessage(tMessage, tArgA, tArgB, tArgC) {
  return getBrokerManager().Execute(tMessage, tArgA, tArgB, tArgC)
}
