// Error API
// Translated from: 7_Error API.ls

import {
  _global,
  objectp,
  script,
  VOID,
  field,
  RETURN,
  value,
} from "../../director";

export default function () {
  _global.gError = _global.gError ?? VOID;

  return {
    constructErrorManager() {
      if (objectp(_global.gError)) {
        return _global.gError;
      }
      const tClass = value(
        _director.convertToPropList(field("System Props"), RETURN)["error.manager.class"],
      )[1];
      _global.gError = script(tClass).new();
      _global.gError.construct();
      _director.tryFn();
      _director.createObject(Symbol.for("error_manager"), _global.gError);
      _director.catchFn();
      return _global.gError;
    },

    deconstructErrorManager() {
      if (!objectp(_global.gError)) {
        return 0;
      }
      _global.gError.deconstruct();
      _global.gError = VOID;
      return 1;
    },

    getErrorManager() {
      if (!objectp(_global.gError)) {
        return this.constructErrorManager();
      }
      return _global.gError;
    },

    error(tObject, tMsg, tMethod, tErrorLevel) {
      return this.getErrorManager().error(tObject, tMsg, tMethod, tErrorLevel);
    },

    serverError(tErrorList) {
      return this.getErrorManager().serverError(tErrorList);
    },

    getClientErrors() {
      return this.getErrorManager().getClientErrors();
    },

    getServerErrors() {
      return this.getErrorManager().getServerErrors();
    },

    fatalError(tErrorData) {
      return this.getErrorManager().fatalError(tErrorData);
    },

    SystemAlert(tObject, tMsg, tMethod) {
      return this.getErrorManager().SystemAlert(tObject, tMsg, tMethod);
    },

    setDebugLevel(tLevel) {
      return this.getErrorManager().setDebugLevel(tLevel);
    },

    printErrors() {
      return this.getErrorManager().print();
    },
  };
}
