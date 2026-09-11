export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handleDimmerPresets(tMsg) {
    const tConn = tMsg.getaProp(Symbol.for("connection"));
    const tNumOfPresets = tConn.GetIntFrom();
    const tSelectedPresetID = tConn.GetIntFrom();
    const tPresets = propList();
    for (let tPresetNum = 1; tPresetNum <= tNumOfPresets; tPresetNum++) {
      const tPresetData = propList();
      const tPresetID = tConn.GetIntFrom();
      const tEffectID = tConn.GetIntFrom();
      const tColor = tConn.GetStrFrom();
      const tLightness = tConn.GetIntFrom();
      tPresetData.setaProp(Symbol.for("effectID"), tEffectID);
      tPresetData.setaProp(Symbol.for("color"), rgb(tColor));
      tPresetData.setaProp(Symbol.for("lightness"), tLightness);
      tPresets.setaProp(tPresetID, tPresetData);
    }
    this.getComponent().setPresets(tPresets);
    return tPresets;
  }

  regMsgList(tBool) {
    const tMsgs = propList();
    tMsgs.setaProp(365, Symbol.for("handleDimmerPresets"));
    const tCmds = propList();
    tCmds.setaProp("MSG_ROOMDIMMER_GET_PRESETS", 341);
    tCmds.setaProp("MSG_ROOMDIMMER_SET_PRESET", 342);
    tCmds.setaProp("MSG_ROOMDIMMER_CHANGE_STATE", 343);
    if (tBool) {
      registerListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
