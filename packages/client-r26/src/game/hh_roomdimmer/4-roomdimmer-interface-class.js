export default class {
  pWindowID;
  pSliderEventAgentID;
  pSelectedColor;
  pSelectedLightness;
  pSelectedEffectID;
  pSelectedPresetID;
  pSliderValue;
  pMinLightnesses;
  pCheckboxValue;
  pUIShown;
  pPaletteColorsRGB;
  pPaletteColorsHSL;

  construct() {
    this.pWindowID = "RoomdimmerWindow";
    this.pSliderEventAgentID = getUniqueID();
    this.pMinLightnesses = propList(1, 0.59999999999999998, 2, 0.29999999999999999);
    this.pUIShown = 0;
    this.pSelectedEffectID = 1;
    this.pPaletteColorsRGB = list();
    this.pPaletteColorsHSL = list();
    createObject(this.pSliderEventAgentID, getClassVariable("event.agent.class"));
    return 1;
  }

  deconstruct() {
    return 1;
  }

  showControlPanel() {
    if (!windowExists(this.pWindowID)) {
      createWindow(this.pWindowID, "roomdimmer_control_panel.window");
    }
    this.pUIShown = 1;
    this.preparePaletteSlots();
    const tPresetID = this.getComponent().getPresetID();
    this.selectPreset(tPresetID);
    receiveUpdate(this.getID());
    const tWnd = getWindow(this.pWindowID);
    tWnd.registerClient(this.getID());
    tWnd.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseUp"));
    tWnd.registerProcedure(Symbol.for("eventProc"), this.getID(), Symbol.for("mouseDown"));
  }

  update() {
    this.updateInterface();
    removeUpdate(this.getID());
  }

  hide() {
    if (windowExists(this.pWindowID)) {
      removeWindow(this.pWindowID);
    }
    this.pUIShown = 0;
    return 1;
  }

  preparePaletteSlots() {
    const tWnd = getWindow(this.pWindowID);
    const tColorCount = getVariable("dimmer.color.count");
    for (let tSlotNum = 1; tSlotNum <= tColorCount; tSlotNum++) {
      const tSlot = tWnd.getElement(`dimmer.paletteslot.${tSlotNum}`);
      const tWidth = tSlot.getProperty(Symbol.for("width"));
      const tHeight = tSlot.getProperty(Symbol.for("height"));
      const tImage = image(tWidth, tHeight, 8);
      const tColor = rgb(string(getVariable(`dimmer.color.${tSlotNum}`)));
      this.pPaletteColorsRGB[tSlotNum] = tColor;
      this.pPaletteColorsHSL[tSlotNum] = RGBtoHSL(tColor);
      tImage.fill(tImage.rect, tColor);
      tSlot.feedImage(tImage);
    }
  }

  selectPaletteSlot(tSlotNum) {
    const tSlotColor = rgb(string(getVariable(`dimmer.color.${tSlotNum}`)));
    this.pSelectedColor = tSlotColor;
    this.highlightPaletteSlot(tSlotNum);
    this.updatePreview();
  }

  selectPreset(tPresetNum) {
    const tPreset = this.getComponent().getPreset(tPresetNum);
    this.pSelectedPresetID = tPresetNum;
    this.pSelectedEffectID = tPreset.getaProp(Symbol.for("effectID"));
    this.pSelectedColor = tPreset.getaProp(Symbol.for("color"));
    this.pSelectedLightness = tPreset.getaProp(Symbol.for("lightness"));
    this.updateInterface();
  }

  highlightPaletteSlot(tSlotNum) {
    const tWnd = getWindow(this.pWindowID);
    const tSlot = tWnd.getElement(`dimmer.paletteslot.${tSlotNum}`);
    const tHighlighter = tWnd.getElement("dimmer.color.highlighter");
    const tLocH = tSlot.getProperty(Symbol.for("locH")) - 2;
    const tLocV = tSlot.getProperty(Symbol.for("locV")) - 2;
    tHighlighter.moveTo(tLocH, tLocV);
  }

  toggleEffect() {
    this.pSelectedEffectID = 3 - this.pSelectedEffectID;
    this.updateInterface();
  }

  initSliderAgent(tBoolean) {
    const tAgent = getObject(this.pSliderEventAgentID);
    if (tBoolean) {
      tAgent.registerEvent(this, Symbol.for("mouseUp"), Symbol.for("sliderMouseUp"));
      tAgent.registerEvent(this, Symbol.for("mouseWithin"), Symbol.for("sliderMouseWithin"));
    } else {
      tAgent.unregisterEvent(Symbol.for("mouseUp"));
      tAgent.unregisterEvent(Symbol.for("mouseWithin"));
    }
    this.pDrag = tBoolean;
  }

  sliderMouseUp() {
    this.initSliderAgent(0);
  }

  sliderMouseWithin() {
    const tWndObj = getWindow(this.pWindowID);
    const tScaleElem = tWndObj.getElement("dimmer.slider.scale");
    const tRect = tScaleElem.getProperty(Symbol.for("rect"));
    let tValue = float(the.mouseH - tRect[1]) / tRect.width;
    if (tValue < 0) {
      tValue = 0;
    } else {
      if (tValue > 1) {
        tValue = 1;
      }
    }
    const tMinLightness = this.pMinLightnesses.getaProp(this.pSelectedEffectID);
    const tMappedLightness = tMinLightness + ((1 - tMinLightness) * tValue);
    this.pSelectedLightness = integer(tMappedLightness * 255);
    this.updateSlider();
    this.updatePreview();
  }

  updateInterface() {
    if (!this.pUIShown) {
      return 1;
    }
    this.updateOnOff();
    this.updatePresetSelection();
    this.updateColorSelection();
    this.updateSlider();
    this.updateCheckbox();
    this.updatePreview();
  }

  updateOnOff() {
    const tIsOn = this.getComponent().isOn();
    const tWnd = getWindow(this.pWindowID);
    const tButton = tWnd.getElement("dimmer.button.onoff.text");
    if (tIsOn) {
      tButton.setText(getText("dimmer_turn_off"));
    } else {
      tButton.setText(getText("dimmer_turn_on"));
    }
    const tElem = tWnd.getElement("dimmer.disable.layer");
    if (this.getComponent().isOn()) {
      tElem.hide();
    } else {
      tElem.show();
    }
  }

  updatePresetSelection() {
    const tPresetID = this.pSelectedPresetID;
    const tWnd = getWindow(this.pWindowID);
    for (let tNum = 1; tNum <= 3; tNum++) {
      const tElem = tWnd.getElement(`dimmer.button.preset.${tNum}`);
      let tmember;
      if (tNum == tPresetID) {
        tmember = member(getmemnum("dimmer.button.radio.on"));
      } else {
        tmember = member(getmemnum("dimmer.button.radio.off"));
      }
      tElem.setProperty(Symbol.for("member"), tmember);
    }
  }

  updateColorSelection() {
    const tColor = this.pSelectedColor;
    if (voidp(this.pSelectedColor)) {
      return 0;
    }
    let tPos = this.pPaletteColorsRGB.findPos(tColor);
    if (tPos == 0) {
      const tHSL = RGBtoHSL(tColor);
      const tHueDiff = list();
      for (const tPaletteColor of this.pPaletteColorsHSL) {
        tHueDiff.add(abs(tPaletteColor[1] - tHSL[1]));
      }
      tPos = tHueDiff.findPos(tHueDiff.min());
      this.pSelectedColor = this.pPaletteColorsRGB[tPos];
    }
    this.highlightPaletteSlot(tPos);
  }

  updateSlider() {
    let tLightness = this.pSelectedLightness;
    tLightness = tLightness / 255.0;
    const tMinLightness = this.pMinLightnesses.getaProp(this.pSelectedEffectID);
    let tMappedValue = (tLightness - tMinLightness) / (1 - tMinLightness);
    if (tMappedValue < 0) {
      tMappedValue = 0;
    }
    const tWndObj = getWindow(this.pWindowID);
    const tScale = tWndObj.getElement("dimmer.slider.scale");
    const tHandle = tWndObj.getElement("dimmer.slider.handle");
    const tRect = tScale.getProperty(Symbol.for("rect"));
    const tLocV = tHandle.getProperty(Symbol.for("locV"));
    const tLocH = tScale.getProperty(Symbol.for("locH")) + (tRect.width * tMappedValue) - (tHandle.getProperty(Symbol.for("width")) / 2);
    tHandle.moveTo(tLocH, tLocV);
  }

  updateCheckbox() {
    const tEffectID = this.pSelectedEffectID;
    const tWndObj = getWindow(this.pWindowID);
    const tElem = tWndObj.getElement("dimmer.bgonly.checkbox");
    if (tEffectID == 1) {
      tElem.setProperty(Symbol.for("member"), member("dimmer.checkbox.unchecked"));
    } else {
      tElem.setProperty(Symbol.for("member"), member("dimmer.checkbox.checked"));
    }
    this.pCheckboxValue = tEffectID;
  }

  updatePreview() {
    const tColor = this.pSelectedColor;
    const tLightness = this.pSelectedLightness;
    const tEffectID = this.pSelectedEffectID;
    if (voidp(tColor) || voidp(tLightness) || voidp(tEffectID)) {
      return 0;
    }
    let tHSL = RGBtoHSL(tColor);
    tHSL[3] = tLightness;
    tColor = HSLtoRGB(tHSL);
    const tImage = member("dimmer.preview.all").image.duplicate();
    const tNewImage = image(tImage.width, tImage.height, 32);
    tNewImage.copyPixels(tImage, tNewImage.rect, tImage.rect, propList("ink", 41, "bgColor", tColor));
    const tWnd = getWindow(this.pWindowID);
    const tElem = tWnd.getElement("dimmer.preview.bg");
    tElem.feedImage(tNewImage);
    const tForeground = tWnd.getElement("dimmer.preview.foreground");
    if (tEffectID == 1) {
      tForeground.hide();
    } else {
      tForeground.show();
    }
  }

  applyEffect() {
    const tPreset = propList();
    tPreset.setaProp(Symbol.for("presetID"), this.pSelectedPresetID);
    tPreset.setaProp(Symbol.for("effectID"), this.pSelectedEffectID);
    tPreset.setaProp(Symbol.for("color"), this.pSelectedColor);
    tPreset.setaProp(Symbol.for("lightness"), this.pSelectedLightness);
    tPreset.setaProp(Symbol.for("apply"), 1);
    this.getComponent().savePreset(tPreset);
  }

  eventProc(tEvent, tElemID, tParam) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tElemID) {
        case "dimmer.bgonly.text":
        case "dimmer.bgonly.checkbox":
          this.toggleEffect();
          break;
        case "close":
          this.hide();
          break;
        case "dimmer.button.onoff":
        case "dimmer.button.onoff.text":
          this.getComponent().toggleOnoff();
          break;
        case "dimmer.button.apply":
        case "dimmer.button.apply.text":
          this.applyEffect();
          break;
        default:
          if (tElemID.contains("dimmer.paletteslot")) {
            const tSlotNum = tElemID.char[tElemID.length];
            this.selectPaletteSlot(tSlotNum);
          }
          if (tElemID.contains("dimmer.button.preset")) {
            const tItems = explode(tElemID, ".");
            const tPresetNum = value(tItems[4]);
            this.selectPreset(tPresetNum);
          }
          break;
      }
    }
    if ((tEvent == Symbol.for("mouseDown")) && (tElemID.contains("dimmer.slider"))) {
      this.initSliderAgent(1);
    }
  }
}
