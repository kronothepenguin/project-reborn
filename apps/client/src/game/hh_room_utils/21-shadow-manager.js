export default class {
  pVisualizer;
  pShadowWrapper;
  pRenderDisabled;

  construct() {
    this.pRenderDisabled = 0;
    return 1;
  }

  deconstruct() {
    return 1;
  }

  define(tWrapID) {
    this.pVisualizer = getThread(Symbol.for("room")).getInterface().getRoomVisualizer();
    this.pShadowWrapper = this.pVisualizer.createWrapper(tWrapID);
    let tProps = propList();
    tProps[Symbol.for("id")] = tWrapID;
    tProps[Symbol.for("offsetx")] = 0;
    tProps[Symbol.for("offsety")] = 0;
    tProps[Symbol.for("locZ")] = this.pVisualizer.getProperty(Symbol.for("locZ")) - 9000;
    tProps[Symbol.for("typeDef")] = Symbol.for("other");
    this.pShadowWrapper.define(tProps);
    this.pShadowWrapper.setProperty(Symbol.for("blend"), 30);
    this.pShadowWrapper.setProperty(Symbol.for("ink"), 41);
    this.pShadowWrapper.setProperty(Symbol.for("palette"), Symbol.for("grayscale"));
    return 1;
  }

  addShadow(tProps) {
    let tmember = tProps[Symbol.for("member")];
    if (memberExists(tmember)) {
      this.pShadowWrapper.addPart(tProps);
      this.pShadowWrapper.setProperty(Symbol.for("ink"), 36);
    } else {
      put tProps[Symbol.for("member")];
    }
  }

  removeShadow(tID) {
    if (this.pRenderDisabled) {
      return 0;
    }
    if (!voidp(this.pShadowWrapper)) {
      this.pShadowWrapper.removePart(tID);
    }
  }

  disableRender(tDisable) {
    if (tDisable) {
      this.pRenderDisabled = 1;
    } else {
      this.pRenderDisabled = 0;
    }
  }

  render() {
    if (this.pRenderDisabled) {
      return 0;
    }
    this.pShadowWrapper.updateWrap();
  }
}
