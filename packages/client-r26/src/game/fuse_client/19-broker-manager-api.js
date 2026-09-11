export function constructBrokerManager() {
  return createManager(Symbol.for("broker_manager"), getClassVariable("broker.manager.class"));
}

export function deconstructBrokerManager() {
  return removeManager(Symbol.for("broker_manager"));
}

export function getBrokerManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("broker_manager"))) {
    return constructBrokerManager();
  }
  return tMgr.getManager(Symbol.for("broker_manager"));
}

export function createBroker(tMessage) {
  return getBrokerManager().create(tMessage);
}

export function removeBroker(tMessage) {
  return getBrokerManager().Remove(tMessage);
}

export function getBroker(tMessage) {
  return getBrokerManager().GET(tMessage);
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
  return getBrokerManager().Execute(tMessage, tArgA, tArgB, tArgC);
}
