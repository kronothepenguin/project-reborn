// Text API
// Translated from: 15_Text API.ls

export default function () {
  return {
    constructTextManager() {
      return _director.createManager(
        Symbol.for("text_manager"),
        _director.getClassVariable("text.manager.class"),
      );
    },

    deconstructTextManager() {
      return _director.removeManager(Symbol.for("text_manager"));
    },

    getTextManager() {
      let tMgr = _director.getObjectManager();
      if (!tMgr.managerExists(Symbol.for("text_manager"))) {
        return this.constructTextManager();
      }
      return tMgr.getManager(Symbol.for("text_manager"));
    },

    createText(tID, tValue) {
      return this.getTextManager().create(tID, tValue);
    },

    removeText(tID) {
      return this.getTextManager().Remove(tID);
    },

    setText(tID, tValue) {
      return this.getTextManager().create(tID, tValue);
    },

    getText(tID, tDefault) {
      return this.getTextManager().GET(tID, tDefault);
    },

    textExists(tID) {
      return this.getTextManager().exists(tID);
    },

    printTexts() {
      return this.getTextManager().print();
    },

    dumpTextField(tField, tDelimiter) {
      return this.getTextManager().dump(tField, tDelimiter);
    },
  };
}
