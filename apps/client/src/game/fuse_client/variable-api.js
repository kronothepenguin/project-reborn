// Variable API
// Translated from: 20_Variable API.ls

import {
  field,
  list,
  propList,
  RETURN,
  value,
  voidp,
  VOID,
} from "../../director";

export default function () {
  return {
    constructVariableManager() {
      return _director.createManager(
        Symbol.for("variable_manager"),
        value(
          _director.convertToPropList(field("System Props"), RETURN)["variable.manager.class"],
        ),
      );
    },

    deconstructVariableManager() {
      return _director.removeManager(Symbol.for("variable_manager"));
    },

    getVariableManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("variable_manager"))) {
        return this.constructVariableManager();
      }
      return tMgr.getManager(Symbol.for("variable_manager"));
    },

    createVariable(tID, tValue) {
      return this.getVariableManager().create(tID, tValue);
    },

    removeVariable(tID) {
      return this.getVariableManager().Remove(tID);
    },

    setVariable(tID, tValue) {
      return this.getVariableManager().create(tID, tValue);
    },

    getVariable(tID, tDefault) {
      return this.getVariableManager().GET(tID, tDefault);
    },

    getIntVariable(tID, tDefault) {
      return this.getVariableManager().getInt(tID, tDefault);
    },

    getStructVariable(tID, tDefault) {
      return this.getVariableManager().GetValue(tID, tDefault);
    },

    getClassVariable(tID, tDefault) {
      return this.getVariableManager().GetValue(tID, tDefault);
    },

    getVariableValue(tID, tDefault) {
      return this.getVariableManager().GetValue(tID, tDefault);
    },

    variableExists(tID) {
      return this.getVariableManager().exists(tID);
    },

    printVariables() {
      return this.getVariableManager().print();
    },

    dumpVariableField(tField, tDelimiter) {
      return this.getVariableManager().dump(tField, tDelimiter);
    },
  };
}
