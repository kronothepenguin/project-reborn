export default class {
  pSwimProps;
  pUnderWater;

  define(tPart, tmodel, tColor, tDirection, tAction, tBody, tFlipPart) {
    this.pSwimProps = propList("maskImage", 0, "ink", 0, "bgColor", rgb(0, 156, 156), "color", rgb(0, 156, 156), "blend", 60);
    callAncestor(Symbol.for("define"), list(this), tPart, tmodel, tColor, tDirection, tAction, tBody, tFlipPart);
    this.pUnderWater = 1;
    return 1;
  }

  update(tForcedUpdate, tRectMod) {
    callAncestor(Symbol.for("update"), list(this), tForcedUpdate, tRectMod);
    if (this.pUnderWater && this.pBody.pSwim) {
      for (let i = 1; i <= this.pLayerPropList.count; i++) {
        const tdata = this.pLayerPropList[i];
        const tDrawProps = tdata["drawProps"];
        this.pSwimProps[Symbol.for("maskImage")] = tDrawProps[Symbol.for("maskImage")];
        const tDrawArea = this.getDrawArea(i);
        if (tdata["cacheImage"] != 0) {
          this.pBody.pBuffer.copyPixels(tdata["cacheImage"], tDrawArea, tdata["cacheImage"].rect, this.pSwimProps);
        }
      }
    }
  }

  render() {
    callAncestor(Symbol.for("render"), list(this));
    for (let i = 1; i <= this.pLayerPropList.count; i++) {
      const tdata = this.pLayerPropList[i];
      if (memberExists(tdata["memString"])) {
        if (this.pBody.pSwim) {
          this.pSwimProps[Symbol.for("maskImage")] = tdata["drawProps"][Symbol.for("maskImage")];
          const tDrawArea = this.getDrawArea(i);
          if (tdata["cacheImage"] != 0) {
            this.pBody.pBuffer.copyPixels(tdata["cacheImage"], tDrawArea, tdata["cacheImage"].rect, this.pSwimProps);
          }
        }
      }
    }
  }

  defineInk(tInk) {
    callAncestor(Symbol.for("defineInk"), list(this), tInk);
    if (this.pLayerPropList.count > 0) {
      this.pSwimProps[Symbol.for("ink")] = this.pLayerPropList[1]["drawProps"][Symbol.for("ink")];
      return 1;
    }
    return 0;
  }

  setUnderWater(tUnderWater) {
    this.pUnderWater = tUnderWater;
  }

  getMemberNumber(tdir, tHumanSize, tAction, tAnimFrame, tLayerIndex) {
    let tArray = callAncestor(Symbol.for("getMemberNumber"), list(this), tdir, tHumanSize, tAction, tAnimFrame, tLayerIndex);
    const tMemNum = tArray[Symbol.for("memberNumber")];
    if (tMemNum == 0) {
      if (voidp(tLayerIndex)) {
        tLayerIndex = 1;
      }
      if ((tLayerIndex < 1) || (tLayerIndex > this.pLayerPropList.count)) {
        tLayerIndex = 1;
      }
      let tmodel;
      if (this.pLayerPropList.count >= tLayerIndex) {
        tmodel = this.pLayerPropList[tLayerIndex]["model"];
      }
      if (!voidp(tmodel)) {
        tmodel = tmodel.char[`${2}..${tmodel.length}`];
        while (tmodel.char[1] == "0") {
          tmodel = tmodel.char[`${2}..${tmodel.length}`];
        }
      }
      tArray = callAncestor(Symbol.for("getMemberNumber"), list(this), tdir, tHumanSize, tAction, tAnimFrame, tLayerIndex, tmodel);
    }
    return tArray;
  }
}
