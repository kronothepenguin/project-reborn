export default class {
  construct() {
    this.ancestor.construct();
    this.pViewMode = Symbol.for("teams");
    this.pViewModeComponents.setaProp(Symbol.for("teams"), list(Symbol.for("modal"), "ProgressBar", "Teams", "Countdown"));
    this.pViewModeComponents.setaProp(Symbol.for("countdown"), list("Countdown"));
    return 1;
  }

  deconstruct() {
    return this.ancestor.deconstruct();
  }

  displayPlayer(tPlayerInfo) {
    if (this.pViewMode != Symbol.for("teams")) {
      return 1;
    }
    const tComponent = this.getSubComponent("Teams");
    if (tComponent == 0) {
      return 0;
    }
    return tComponent.displayPlayer(tPlayerInfo);
  }

  displayPlayerLeft(tID) {
    if (this.pViewMode != Symbol.for("teams")) {
      return 1;
    }
    const tComponent = this.getSubComponent("Teams");
    if (tComponent == 0) {
      return 0;
    }
    return tComponent.displayPlayerLeft(tID);
  }

  displayProgress(tProgress) {
    const tComponent = this.getSubComponent("ProgressBar");
    if (tComponent == 0) {
      return 0;
    }
    return tComponent.render(tProgress);
  }

  displayPlayerDone(tID, tFigure, tsex) {
    if (this.pViewMode != Symbol.for("teams")) {
      return 1;
    }
    const tComponent = this.getSubComponent("Teams");
    if (tComponent == 0) {
      return 0;
    }
    return tComponent.displayPlayerDone(tID, tFigure, tsex);
  }

  displayCountdown() {
    this.pViewMode = Symbol.for("countdown");
    return this.renderSubComponents();
  }

  update() {
    let tComponent = this.getSubComponent("ProgressBar");
    if (tComponent != 0) {
      tComponent.update();
    }
    tComponent = this.getSubComponent("Countdown");
    if (tComponent != 0) {
      tComponent.render();
    }
    tComponent = this.getSubComponent("Teams");
    if (tComponent != 0) {
      tComponent.update();
    }
    return 1;
  }

  getSubComponentClass(tID) {
    return list("IG TeamUI Subcomponent Class", `IG PreGameUI ${tID} Class`);
  }
}
