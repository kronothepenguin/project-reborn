import {
  call,
  createMultiuser,
  createTimeout,
  EMPTY,
  getMultiuser,
  getMultiuserManager,
  getIntVariable,
  getObject,
  getSpecialServices,
  getVariable,
  integer,
  list,
  multiuserExists,
  propList,
  removeMultiuser,
  removeTimeout,
  timeoutExists,
  VOID,
  voidp,
} from "../../director";

export default function () {
  return {
    pConnectionId: VOID,
    pTimeOutID: VOID,
    pQueue: VOID,
    pCrypto: VOID,
    pUseCrypto: VOID,
    pHandshakeFinished: VOID,

    construct() {
      let pCallBacks;

      if (_player !== VOID) {
        if (_player.traceScript || _movie.traceScript) {
          return 0;
        }
      }
      _player.traceScript = 0;
      _movie.traceScript = 0;
      this.pConnectionId = getVariable("connection.mus.id", Symbol.for("mus"));
      this.pTimeOutID = "mus_close_delay";
      pCallBacks = propList();
      this.pQueue = list();
      this.pCrypto = _director.createObject(Symbol.for("temp"), ["RC4 Class"]);
      this.pUseCrypto = 0;
      this.pHandshakeFinished = 0;
      return this.registerCmds(1);
    },

    deconstruct() {
      this.registerCmds(0);
      this.pHandshakeFinished = 0;
      this.pUseCrypto = 0;
      return removeMultiuser(this.pConnectionId);
    },

    retrieveData(tID, tAuth, tCallBackObj) {
      this.pQueue.add(
        propList(
          Symbol.for("type"),
          Symbol.for("retrieve"),
          Symbol.for("id"),
          tID,
          Symbol.for("auth"),
          tAuth,
          Symbol.for("callback"),
          tCallBackObj,
        ),
      );
      if (this.pQueue.count === 1 || !multiuserExists(this.pConnectionId)) {
        this.next();
      }
    },

    storeData(tdata, tCallBackObj) {
      this.pQueue.add(
        propList(
          Symbol.for("type"),
          Symbol.for("store"),
          Symbol.for("data"),
          tdata,
          Symbol.for("callback"),
          tCallBackObj,
        ),
      );
      if (this.pQueue.count === 1 || !multiuserExists(this.pConnectionId)) {
        this.next();
      }
    },

    addMessageToQueue(tMsg) {
      this.pQueue.add(
        propList(
          Symbol.for("type"),
          Symbol.for("fusemsg"),
          Symbol.for("message"),
          tMsg,
        ),
      );
      if (this.pQueue.count === 1 || !multiuserExists(this.pConnectionId)) {
        this.next();
      }
    },

    checkConnection() {
      let tUserID, tMachineID;

      if (!multiuserExists(this.pConnectionId)) {
        return _director.error(
          this,
          `MUS connection not found: ${this.pConnectionId}`,
          Symbol.for("checkConnection"),
          Symbol.for("minor"),
        );
      }
      if (
        getMultiuser(this.pConnectionId).connectionReady() &&
        this.pHandshakeFinished
      ) {
        tUserID = getObject(Symbol.for("session")).GET(
          Symbol.for("user_user_id"),
        );
        tMachineID = getSpecialServices().getMachineID();
        if (this.pUseCrypto) {
          tUserID = this.pCrypto.encipher(tUserID);
          tMachineID = this.pCrypto.encipher(tMachineID);
        }
        getMultiuser(this.pConnectionId).send(
          `LOGIN ${tUserID} ${tMachineID}`,
        );
        this.next();
      } else {
        this.delay(1000, Symbol.for("checkConnection"));
      }
    },

    next() {
      let tTask;

      if (!multiuserExists(this.pConnectionId)) {
        createMultiuser(
          this.pConnectionId,
          getVariable("connection.mus.host"),
          getIntVariable("connection.mus.port"),
        );
        getMultiuser(this.pConnectionId).registerBinaryDataHandler(
          this.getID(),
          Symbol.for("binaryDataReceived"),
        );
        this.delay(1000, Symbol.for("checkConnection"));
      } else {
        if (getMultiuser(this.pConnectionId).connectionReady()) {
          if (timeoutExists(this.pTimeOutID)) {
            removeTimeout(this.pTimeOutID);
          }
          if (this.pQueue.count > 0) {
            tTask = this.pQueue[1];
            switch (tTask.getaProp(Symbol.for("type"))) {
              case Symbol.for("store"):
                return getMultiuser(this.pConnectionId).sendBinary(
                  tTask.getaProp(Symbol.for("data")),
                );
              case Symbol.for("retrieve"):
                return getMultiuser(this.pConnectionId).send(
                  `GETBINDATA ${tTask.getaProp(Symbol.for("id"))} ${tTask.getaProp(Symbol.for("auth"))}`,
                );
              case Symbol.for("fusemsg"):
                this.pQueue.deleteAt(1);
                getMultiuser(this.pConnectionId).send(
                  tTask.getaProp(Symbol.for("message")),
                );
                this.next();
                return 1;
            }
          } else {
            createTimeout(
              this.pTimeOutID,
              30000,
              Symbol.for("delayedClosing"),
              this.getID(),
              VOID,
              1,
            );
          }
        }
      }
    },

    binaryDataStored(tMsg) {
      let tTask, tObject;

      tTask = this.pQueue[1];
      if (tTask.getaProp(Symbol.for("callback")) !== VOID) {
        tObject = getObject(tTask.getaProp(Symbol.for("callback")));
        if (tObject.ilk === Symbol.for("instance")) {
          call(
            Symbol.for("binaryDataStored"),
            tObject,
            tMsg.getaProp(Symbol.for("content")),
          );
        }
      }
      this.pQueue.deleteAt(1);
      this.next();
    },

    binaryDataAuthKeyError() {
      this.pQueue.deleteAt(1);
      this.next();
    },

    binaryDataReceived(tdata) {
      let tTask, tObject;

      tTask = this.pQueue[1];
      this.pQueue.deleteAt(1);
      if (tTask.getaProp(Symbol.for("callback")) !== VOID) {
        tObject = getObject(tTask.getaProp(Symbol.for("callback")));
        if (tObject.ilk === Symbol.for("instance")) {
          call(
            Symbol.for("binaryDataReceived"),
            tObject,
            tdata,
            tTask.getaProp(Symbol.for("id")),
          );
        }
      }
      this.next();
    },

    delayedClosing() {
      if (
        multiuserExists(this.pConnectionId) &&
        this.pQueue.count === 0
      ) {
        removeMultiuser(this.pConnectionId);
      }
    },

    registerCmds(tBool) {
      let tList;

      tList = propList();
      tList["BINDATA_SAVED"] = Symbol.for("binaryDataStored");
      tList["BINDATA_AUTHKEYERROR"] = Symbol.for("binaryDataAuthKeyError");
      tList["DISCONNECT"] = Symbol.for("deconstruct");
      tList["HELLO"] = Symbol.for("helloReply");
      tList["U_RTS"] = Symbol.for("foo");
      if (tBool) {
        return getMultiuserManager().registerListener(
          this.pConnectionId,
          this.getID(),
          tList,
        );
      } else {
        return getMultiuserManager().unregisterListener(
          this.pConnectionId,
          this.getID(),
          tList,
        );
      }
    },

    foo() {},

    helloReply(tMsg) {
      let tSecretKey;

      tSecretKey = tMsg.getaProp(Symbol.for("content"));
      tSecretKey = integer(tSecretKey);
      if (voidp(tSecretKey) || tSecretKey === EMPTY || tSecretKey === 0) {
        this.pUseCrypto = 0;
      } else {
        this.pCrypto.setKey(tSecretKey, Symbol.for("initPremix"));
        this.pUseCrypto = 1;
      }
      this.pHandshakeFinished = 1;
    },
  };
}
