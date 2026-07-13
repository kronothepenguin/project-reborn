export default class {
  select() {
    if (threadExists(Symbol.for("photo"))) {
      let tSprites = this.getSprites();
      if (!listp(tSprites)) {
        return 0;
      }
      if (tSprites.count < 1) {
        return 0;
      }
      let tloc = tSprites[1].loc;
      getThread(Symbol.for("photo")).getComponent().openPhoto(this.getID(), tloc[1], tloc[2]);
      return 1;
    } else {
      return 0;
    }
  }
}
