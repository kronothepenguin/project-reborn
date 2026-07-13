export default class {
  construct() {
    this.pTimeoutUpdates = 1;
    return 1;
  }

  Initialize() {
    this.setActiveFlag(1);
    this.registerForIGComponentUpdates("GameList");
  }

  pollContentUpdate(tForced) {
    const tMainThread = this.getMainThread();
    if (tMainThread == 0) {
      return 0;
    }
    const tService = this.getIGComponent("GameList");
    if (tService == 0) {
      return 0;
    }
    if (!tService.isUpdateTimestampExpired()) {
      return 0;
    }
    tService.pollContentUpdate(1);
  }
}
