export default class {
  select() {
    let tPostItMgr = getObject(Symbol.for("postit_manager"));
    if (tPostItMgr == 0) {
      tPostItMgr = createObject(Symbol.for("postit_manager"), "PostIt Manager Class");
    }
    if (this.getSprites().count == 0) {
      return tPostItMgr.open(this.getID(), rgb(string(this.pType)), 200, 200);
    }
    const tloc = this.getSprites()[1].loc;
    tPostItMgr.open(this.getID(), rgb(string(this.pType)), tloc[1], tloc[2]);
    return 0;
  }

  setColor(tColor) {
    if (this.getSprites().count == 0) {
      return 1;
    }
    this.getSprites()[1].bgColor = tColor;
    this.pType = tColor.hexString();
    return 1;
  }
}
