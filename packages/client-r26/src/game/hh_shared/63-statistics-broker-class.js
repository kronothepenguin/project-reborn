export default class {
  pTrackingURL;

  construct() {
    this.pTrackingURL = getVariable("stats.tracking.url");
    if ((this.pTrackingURL == 0) || (this.pTrackingURL == EMPTY)) {
      error(this, "Stats tracking URL not found!", Symbol.for("construct"), Symbol.for("minor"));
    }
    registerListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), propList(166, Symbol.for("updateStats")));
    registerMessage(Symbol.for("sendTrackingData"), this.getID(), Symbol.for("updateStats"));
    return 1;
  }

  deconstruct() {
    unregisterListener(getVariable("connection.info.id", Symbol.for("Info")), this.getID(), propList(166, Symbol.for("updateStats")));
    return 1;
  }

  updateStats(tMsg) {
    const tNetThing = replaceChunks(this.pTrackingURL, "\TCODE", tMsg.content);
    if (this.pTrackingURL.ilk == Symbol.for("string")) {
      preloadNetThing(tNetThing);
    }
  }
}
