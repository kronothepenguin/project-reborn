export default class {
  Initialize() {
    this.registerForIGComponentUpdates("GameList");
    this.registerForIGComponentUpdates("LevelList");
    return 1;
  }

  handleUpdate(tUpdateId, tSenderId) {
    if (tUpdateId == Symbol.for("owner_of_game")) {
      const tRenderObj = this.getRenderer();
      if (tRenderObj == 0) {
        return 0;
      }
      return tRenderObj.setViewMode(Symbol.for("Info"));
    }
    return this.renderUI();
  }
}
