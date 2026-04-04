/**
 * Broker Manager API (Message Broker)
 * 
 * Translated from: casts/fuse_client/19_Broker Manager API.ls
 * 
 * Global functions for the message broker system.
 * The broker routes messages between objects (publish/subscribe pattern).
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';
import { createManager, removeManager, getManager, managerExists } from './object-api.js';
import { getManagerClassList } from '../../system/system-props.js';

export function constructBrokerManager() {
  return createManager('broker_manager', getManagerClassList('broker'));
}

export function deconstructBrokerManager() {
  return removeManager('broker_manager');
}

export function getBrokerManager() {
  if (!managerExists('broker_manager')) {
    return constructBrokerManager();
  }
  return getManager('broker_manager');
}

export function createBroker(tMessage) {
  return getBrokerManager().create(tMessage);
}

export function removeBroker(tMessage) {
  return getBrokerManager().remove(tMessage);
}

export function getBroker(tMessage) {
  return getBrokerManager().get(tMessage);
}

export function brokerExists(tMessage) {
  return getBrokerManager().exists(tMessage);
}

export function printBrokers() {
  return getBrokerManager().print();
}

export function registerMessage(tMessage, tClientID, tMethod) {
  return getBrokerManager().register(tMessage, tClientID, tMethod);
}

export function unregisterMessage(tMessage, tClientID) {
  return getBrokerManager().unregister(tMessage, tClientID);
}

export function executeMessage(tMessage, tArgA, tArgB, tArgC) {
  return getBrokerManager().execute(tMessage, tArgA, tArgB, tArgC);
}
