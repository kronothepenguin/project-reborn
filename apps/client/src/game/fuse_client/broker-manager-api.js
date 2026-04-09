// Broker Manager API
// Translated from: 19_Broker Manager API.ls

export default function () {
  return {
    constructBrokerManager() {
      return _director.createManager(
        Symbol.for("broker_manager"),
        _director.getClassVariable("broker.manager.class"),
      );
    },

    deconstructBrokerManager() {
      return _director.removeManager(Symbol.for("broker_manager"));
    },

    getBrokerManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("broker_manager"))) {
        return this.constructBrokerManager();
      }
      return tMgr.getManager(Symbol.for("broker_manager"));
    },

    createBroker(tMessage) {
      return this.getBrokerManager().create(tMessage);
    },

    removeBroker(tMessage) {
      return this.getBrokerManager().Remove(tMessage);
    },

    getBroker(tMessage) {
      return this.getBrokerManager().GET(tMessage);
    },

    brokerExists(tMessage) {
      return this.getBrokerManager().exists(tMessage);
    },

    printBrokers() {
      return this.getBrokerManager().print();
    },

    registerMessage(tMessage, tClientID, tMethod) {
      return this.getBrokerManager().register(tMessage, tClientID, tMethod);
    },

    unregisterMessage(tMessage, tClientID) {
      return this.getBrokerManager().unregister(tMessage, tClientID);
    },

    executeMessage(tMessage, tArgA, tArgB, tArgC) {
      return this.getBrokerManager().Execute(tMessage, tArgA, tArgB, tArgC);
    },
  };
}
