export default class {
  pEffectID;
  pcolor;
  pLightness;
  pEffects;
  pPresets;
  pIsOn;
  pPresetID;
  pFurniID;
  pAppliedEffectID;
  pAppliedColor;
  pAppliedLightness;
  pApplyTime;
  pTargetColor;
  pTargetLightness;
  pTargetTime;
  pTransitionTime;

  construct() {
    this.pcolor = rgb(255, 255, 255);
    this.pLightness = 1;
    this.pEffectID = 1;
    this.pAppliedEffectID = 0;
    this.pAppliedColor = rgb(255, 255, 255);
    this.pAppliedLightness = 255;
    this.pTransitionTime = 1500;
    this.pEffects = propList();
    this.pEffects.setaProp(1, Symbol.for("setDimmerColor"));
    this.pEffects.setaProp(2, Symbol.for("colorizeRoom"));
    registerMessage(Symbol.for("roomdimmer_defined"), this.getID(), Symbol.for("roomdimmerDefined"));
    registerMessage(Symbol.for("roomdimmer_selected"), this.getID(), Symbol.for("select"));
    registerMessage(Symbol.for("roomdimmer_removed"), this.getID(), Symbol.for("Remove"));
    registerMessage(Symbol.for("roomdimmer_set_state"), this.getID(), Symbol.for("setState"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("roomdimmer_selected"), this.getID());
    unregisterMessage(Symbol.for("roomdimmer_removed"), this.getID());
    return 1;
  }

  turnOff() {
    if (this.pAppliedEffectID > 0) {
      this.removeEffect(this.pAppliedEffectID);
    }
    this.pAppliedColor = rgb(255, 255, 255);
    this.pAppliedLightness = 255;
  }

  roomdimmerDefined(tFurniID) {
    this.pFurniID = tFurniID;
    if (connectionExists(getVariable("connection.info.id", Symbol.for("Info")))) {
      const tConn = getConnection(getVariable("connection.info.id", Symbol.for("Info")));
      tConn.send("MSG_ROOMDIMMER_GET_PRESETS");
    }
  }

  select() {
    if (voidp(this.pPresets)) {
      return 0;
    }
    this.getInterface().showControlPanel();
  }

  Remove(tID) {
    if (tID != this.pFurniID) {
      return 0;
    }
    this.getInterface().hide();
    if (this.pAppliedEffectID != 0) {
      this.removeEffect(this.pAppliedEffectID);
    }
  }

  applyPreset() {
    this.savePreset(1);
  }

  savePreset(tPreset) {
    const tPresetData = propList();
    tPresetData.addProp(Symbol.for("integer"), tPreset.getaProp(Symbol.for("presetID")));
    tPresetData.addProp(Symbol.for("integer"), tPreset.getaProp(Symbol.for("effectID")));
    const tColor = tPreset.getaProp(Symbol.for("color"));
    if (ilk(tColor) == Symbol.for("color")) {
      tPresetData.setaProp(Symbol.for("string"), tColor.hexString());
    } else {
      tPresetData.setaProp(Symbol.for("string"), tColor);
    }
    tPresetData.addProp(Symbol.for("integer"), tPreset.getaProp(Symbol.for("lightness")));
    tPresetData.addProp(Symbol.for("boolean"), tPreset.getaProp(Symbol.for("apply")));
    if (connectionExists(getVariable("connection.info.id", Symbol.for("Info")))) {
      const tConn = getConnection(getVariable("connection.info.id", Symbol.for("Info")));
      tConn.send("MSG_ROOMDIMMER_SET_PRESET", tPresetData);
    }
    this.pPresets.setaProp(tPreset.getaProp(Symbol.for("presetID")), tPreset);
  }

  getCurrentPreset() {
    return this.pPresetID;
  }

  setState(tStateData) {
    this.pDimmerID = tStateData.getaProp(Symbol.for("dimmerID"));
    this.pIsOn = tStateData.getaProp(Symbol.for("isOn"));
    this.pPresetID = tStateData.getaProp(Symbol.for("presetID"));
    this.pEffectID = tStateData.getaProp(Symbol.for("effectID"));
    const tColor = tStateData.getaProp(Symbol.for("color"));
    const tLightness = tStateData.getaProp(Symbol.for("lightness"));
    this.pTargetColor = tColor;
    this.pTargetLightness = tLightness;
    this.pTargetTime = the.milliSeconds + this.pTransitionTime;
    if (this.pIsOn) {
      this.pApplyTime = the.milliSeconds;
      receiveUpdate(this.getID());
    } else {
      removeUpdate(this.getID());
      this.turnOff();
    }
    this.getInterface().updateInterface();
  }

  update() {
    const tDiffR = this.pTargetColor.red - this.pAppliedColor.red;
    const tDiffG = this.pTargetColor.green - this.pAppliedColor.green;
    const tDiffB = this.pTargetColor.blue - this.pAppliedColor.blue;
    const tDiffL = this.pTargetLightness - this.pAppliedLightness;
    const tCurrentTime = the.milliSeconds;
    let tNewColor;
    let tNewLightness;
    if (tCurrentTime >= this.pTargetTime) {
      removeUpdate(this.getID());
      tNewColor = this.pTargetColor;
      tNewLightness = this.pTargetLightness;
    } else {
      const tRatio = (tCurrentTime - this.pApplyTime) / float(this.pTargetTime - this.pApplyTime);
      const tNewR = this.pAppliedColor.red + (tRatio * tDiffR);
      const tNewG = this.pAppliedColor.green + (tRatio * tDiffG);
      const tNewB = this.pAppliedColor.blue + (tRatio * tDiffB);
      tNewLightness = this.pAppliedLightness + (tRatio * tDiffL);
      tNewColor = rgb(tNewR, tNewG, tNewB);
    }
    this.applyEffect(this.pEffectID, tNewColor, tNewLightness);
  }

  getPreset(tPresetID) {
    return this.pPresets.getaProp(tPresetID);
  }

  getPresetID() {
    return this.pPresetID;
  }

  setPresets(tPresets) {
    this.pPresets = tPresets;
  }

  removeEffect(tEffectID) {
    const tEffect = this.pEffects.getaProp(this.pAppliedEffectID);
    if (voidp(tEffect)) {
      return 0;
    }
    executeMessage(tEffect, rgb(255, 255, 255));
    this.pAppliedEffectID = 0;
  }

  applyEffect(tEffectID, tColor, tLightness) {
    if ((this.pAppliedEffectID != tEffectID) && (this.pAppliedEffectID != 0)) {
      this.removeEffect(this.pAppliedEffectID);
    }
    const tEffect = this.pEffects.getaProp(tEffectID);
    if (voidp(tEffect)) {
      return 0;
    }
    const tHSL = RGBtoHSL(tColor);
    tHSL[3] = tLightness;
    executeMessage(tEffect, HSLtoRGB(tHSL));
    this.pAppliedEffectID = tEffectID;
    this.pAppliedColor = tColor;
    this.pAppliedLightness = tLightness;
    this.pApplyTime = the.milliSeconds;
  }

  toggleOnoff() {
    const tConn = getConnection(getVariable("connection.info.id", Symbol.for("Info")));
    if (!tConn) {
      return 0;
    }
    tConn.send("MSG_ROOMDIMMER_CHANGE_STATE");
    return 1;
  }

  isOn() {
    return this.pIsOn;
  }
}
