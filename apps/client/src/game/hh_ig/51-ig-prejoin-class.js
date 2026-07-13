export default class {
  Initialize() {
    this.registerForIGComponentUpdates("GameList");
    return 1;
  }

  handleUpdate(tUpdateId, tSenderId) {
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    if (tUpdateId != tService.getObservedGameId()) {
      return 1;
    }
    const tRenderObj = getObject(this.getRendererID());
    if (tRenderObj != 0) {
      tRenderObj.render();
    }
  }
}
