export default class {
  pStateSequenceList;
  pStateIndex;
  pState;
  pLayerDataList;
  pFrameNumberList;
  pFrameNumberList2;
  pLoopCountList;
  pFrameRepeatList;
  pIsAnimatingList;
  pBlendList;
  pInkList;
  pLoczList;
  pLocShiftList;
  pNameBase;
  pInitialized;
  pDirection;

  deconstruct() {
    this.pStateSequenceList = list();
    this.pStateIndex = 1;
    this.pState = 1;
    this.pLayerDataList = propList();
    this.pFrameNumberList = list();
    this.pFrameNumberList2 = list();
    this.pLoopCountList = list();
    this.pBlendList = list();
    this.pInkList = list();
    this.pLoczList = list();
    this.pLocShiftList = list();
    this.pFrameRepeatList = list();
    this.pIsAnimatingList = list();
    this.pInitialized = 0;
    callAncestor(Symbol.for("deconstruct"), [this]);
  }

  define(tProps) {
    this.pStateSequenceList = list();
    this.pStateIndex = 1;
    this.pState = 1;
    this.pLayerDataList = propList();
    this.pFrameNumberList = list();
    this.pFrameNumberList2 = list();
    this.pLoopCountList = list();
    this.pBlendList = list();
    this.pInkList = list();
    this.pLoczList = list();
    this.pLocShiftList = list();
    this.pFrameRepeatList = list();
    this.pIsAnimatingList = list();
    this.pNameBase = tProps[Symbol.for("class")];
    let tClass = tProps[Symbol.for("class")];
    if (getThread(Symbol.for("room")).getInterface().getGeometry().pXFactor == 32) {
      this.pNameBase = `s_${this.pNameBase}`;
    }
    const tDataName = `${this.pNameBase}.data`;
    if (memberExists(tDataName)) {
      let tText = member(getmemnum(tDataName)).text;
      tText = replaceChunks(tText, RETURN, EMPTY);
      const tdata = value(tText);
      if (!voidp(tdata)) {
        if (tdata.ilk == Symbol.for("propList")) {
          this.pStateSequenceList = tdata[Symbol.for("states")];
          this.pLayerDataList = tdata[Symbol.for("layers")];
          if (voidp(this.pLayerDataList)) {
            this.pLayerDataList = propList();
          }
          const tLayerDataList = propList();
          for (let i = 1; i <= this.pLayerDataList.count; i++) {
            let tProp = string(this.pLayerDataList.getPropAt(i));
            if (charToNum(tProp) < charToNum("a")) {
              tProp = numToChar(charToNum("a") + (charToNum(tProp) - charToNum("A")));
            }
            const tLayerData = this.pLayerDataList[i];
            tLayerDataList.addProp(tProp, tLayerData);
          }
          this.pLayerDataList = tLayerDataList;
          if (voidp(this.pStateSequenceList)) {
            this.pStateSequenceList = list();
          }
          if (!this.validateStateSequenceList()) {
            this.pStateSequenceList = list();
          }
        }
      }
    }
    let tstate = tProps[Symbol.for("type")];
    if ((ilk(value(tstate)) != Symbol.for("integer")) || (value(tstate) == 0)) {
      tstate = 1;
    }
    this.setState(tstate);
    this.resetFrameNumbers();
    let tCount = 1;
    if (this.pLayerDataList.count > 0) {
      tCount = this.pLayerDataList.count;
    }
    for (let tLayer = 1; tLayer <= tCount; tLayer++) {
      let tLayerName = EMPTY;
      if (this.pLayerDataList.count >= tLayer) {
        tLayerName = this.pLayerDataList.getPropAt(tLayer);
      }
      this.pInkList[tLayer] = this.solveInk(tLayerName);
      this.pBlendList[tLayer] = this.solveBlend(tLayerName);
    }
    this.pInitialized = 0;
    this.pName = getText(`wallitem_${tClass}_name`);
    this.pCustom = getText(`wallitem_${tClass}_desc`);
    return callAncestor(Symbol.for("define"), [this], tProps);
  }

  select() {
    if (the.doubleClick) {
      this.getNextState();
    }
    return 1;
  }

  update() {
    if (this.pIsAnimatingList.findPos(1) == 0) {
      return 1;
    }
    const tIsAnimatingList = list();
    for (let tLayer = 1; tLayer <= this.pLayerDataList.count; tLayer++) {
      const tFrameList = this.getFrameList(this.pLayerDataList.getPropAt(tLayer));
      tIsAnimatingList[tLayer] = this.pIsAnimatingList[tLayer];
      if (!voidp(tFrameList) && tIsAnimatingList[tLayer]) {
        if (!voidp(tFrameList[Symbol.for("frames")])) {
          let tDelay = tFrameList[Symbol.for("delay")];
          if (voidp(tDelay) || voidp(integer(tDelay)) || (tDelay < 1)) {
            tDelay = 1;
          }
          if (this.pFrameRepeatList[tLayer] >= tDelay) {
            let tLoop = 1;
            const tFrameCount = tFrameList[Symbol.for("frames")].count;
            if (tFrameCount > 0) {
              if (this.pFrameNumberList[tLayer] == tFrameCount) {
                if (this.pLoopCountList[tLayer] > 0) {
                  this.pLoopCountList[tLayer] = this.pLoopCountList[tLayer] - 1;
                }
                tLoop = this.pLoopCountList[tLayer];
                if (this.pLoopCountList[tLayer] == 0) {
                  tIsAnimatingList[tLayer] = 0;
                }
              }
              if ((this.pFrameNumberList[tLayer] < tFrameCount) || tLoop) {
                this.pFrameNumberList[tLayer] = (this.pFrameNumberList[tLayer] % tFrameCount) + 1;
                let tRandom = 0;
                if (!voidp(tFrameList[Symbol.for("random")])) {
                  tRandom = 1;
                }
                if (tRandom && (tFrameCount > 1)) {
                  let tValue = random(tFrameCount);
                  if (tValue == this.pFrameNumberList2[tLayer]) {
                    tValue = (this.pFrameNumberList2[tLayer] % tFrameCount) + 1;
                  }
                  this.pFrameNumberList2[tLayer] = tValue;
                } else {
                  this.pFrameNumberList2[tLayer] = this.pFrameNumberList[tLayer];
                }
                if (!voidp(tFrameList[Symbol.for("blend")])) {
                  const tBlendList = tFrameList[Symbol.for("blend")];
                  if (tBlendList.count >= this.pFrameNumberList2[tLayer]) {
                    this.pSprList[tLayer].blend = tBlendList[this.pFrameNumberList2[tLayer]];
                  }
                }
              }
            }
            this.pFrameRepeatList[tLayer] = 1;
            continue;
          }
          this.pFrameRepeatList[tLayer] = this.pFrameRepeatList[tLayer] + 1;
        }
      }
    }
    this.solveMembers();
    for (let tLayer = 1; tLayer <= this.pLayerDataList.count; tLayer++) {
      this.pIsAnimatingList[tLayer] = tIsAnimatingList[tLayer];
    }
    return 1;
  }

  hasURL() {
    return textExists(`item_ad_url_${this.pClass}`);
  }

  GetUrl() {
    return getText(`item_ad_url_${this.pClass}`);
  }

  solveMembers() {
    let tMembersFound = 0;
    let tCount = 1;
    if (this.pLayerDataList.count > 0) {
      tCount = this.pLayerDataList.count;
    }
    for (let tLayer = 1; tLayer <= tCount; tLayer++) {
      let tAnimating = 1;
      if (this.pIsAnimatingList.count >= tLayer) {
        tAnimating = this.pIsAnimatingList[tLayer];
      }
      if (tAnimating) {
        let tLayerName = numToChar(charToNum("a") + tLayer - 1);
        if (this.pLayerDataList.count >= tLayer) {
          tLayerName = this.pLayerDataList.getPropAt(tLayer);
        }
        const tMemName = this.getMemberName(tLayerName);
        let tSpr;
        if (this.pSprList.count < tLayer) {
          tSpr = sprite(reserveSprite(this.getID()));
          const tTargetID = getThread(Symbol.for("room")).getInterface().getID();
          if (this.solveTransparency(tLayerName) == 0) {
            setEventBroker(tSpr.spriteNum, this.getID());
            tSpr.registerProcedure(Symbol.for("eventProcItemObj"), tTargetID, Symbol.for("mouseDown"));
            tSpr.registerProcedure(Symbol.for("eventProcItemRollOver"), tTargetID, Symbol.for("mouseEnter"));
            tSpr.registerProcedure(Symbol.for("eventProcItemRollOver"), tTargetID, Symbol.for("mouseLeave"));
          }
          this.pSprList.add(tSpr);
        } else {
          tSpr = this.pSprList[tLayer];
          if (!this.pInitialized) {
            if (this.solveTransparency(tLayerName)) {
              removeEventBroker(tSpr.spriteNum);
            }
          }
        }
        let tMemNum = getmemnum(tMemName);
        if (tMemNum != 0) {
          tMembersFound = tMembersFound + 1;
          if (tMemNum < 1) {
            tMemNum = abs(tMemNum);
            tSpr.rotation = 180;
            tSpr.skew = 180;
          } else {
            tSpr.rotation = 0;
            tSpr.skew = 0;
          }
          tSpr.castNum = tMemNum;
          tSpr.width = member(tMemNum).width;
          tSpr.height = member(tMemNum).height;
        } else {
          tSpr.width = 0;
          tSpr.height = 0;
          tSpr.castNum = 0;
          if (tLayer == 1) {
            break;
          }
        }
        if (!this.pInitialized) {
          if (this.pInkList.count < tLayer) {
            this.pInkList[tLayer] = this.solveInk(tLayerName, this.pNameBase);
          }
          if (this.pBlendList.count < tLayer) {
            this.pBlendList[tLayer] = this.solveBlend(tLayerName, this.pNameBase);
          }
          tSpr.ink = this.pInkList[tLayer];
          tSpr.blend = this.pBlendList[tLayer];
        }
        this.postProcessLayer(tLayer);
        continue;
      }
      if (this.pSprList.count >= tLayer) {
        const tSpr = this.pSprList[tLayer];
        if (tSpr.castNum != 0) {
          tMembersFound = tMembersFound + 1;
        }
      }
    }
    this.pInitialized = 1;
    if (tMembersFound == 0) {
      return 0;
    } else {
      return 1;
    }
  }

  updateLocation() {
    callAncestor(Symbol.for("updateLocation"), [this]);
    let tDirection = this.pDirection;
    if (ilk(tDirection) == Symbol.for("string")) {
      if (tDirection == "leftwall") {
        tDirection = 2;
      } else {
        if (tDirection == "rightwall") {
          tDirection = 4;
        }
      }
    }
    const tScreenLocs = getThread(Symbol.for("room")).getInterface().getGeometry().getScreenCoordinate(this.pWallX - 1, this.pWallY + 1, 0);
    if (ilk(tDirection) == Symbol.for("integer")) {
      let tCount = 1;
      if (this.pLayerDataList.count > 0) {
        tCount = this.pLayerDataList.count;
      }
      for (let tLayer = 1; tLayer <= tCount; tLayer++) {
        let tLayerName = EMPTY;
        if (this.pLayerDataList.count >= tLayer) {
          tLayerName = this.pLayerDataList.getPropAt(tLayer);
        }
        const tlocz = this.solveLocZ(tLayerName);
        this.pSprList[tLayer].locZ = tScreenLocs[3] + tlocz + tLayer;
        const tLocShift = this.solveLocShift(tLayerName);
        if (ilk(tLocShift) == Symbol.for("point")) {
          this.pSprList[tLayer].loc = this.pSprList[tLayer].loc + tLocShift;
        }
      }
    }
  }

  postProcessLayer(tLayer) {
    return 1;
  }

  getMemberName(tLayer) {
    let tName;
    if (offset("s_", this.pNameBase) == 1) {
      tName = `s_${this.pDirection} ${this.pNameBase.char[`3..${this.pNameBase.length}`]}`;
    } else {
      tName = `${this.pDirection} ${this.pNameBase}`;
    }
    const tLayerIndex = this.pLayerDataList.findPos(tLayer);
    const tFrameList = this.getFrameList(tLayer);
    if (!voidp(tFrameList) && !voidp(tLayerIndex)) {
      const tFrameSequence = tFrameList[Symbol.for("frames")];
      if (!voidp(tFrameSequence)) {
        const tFrameNumber = this.pFrameNumberList2[tLayerIndex];
        const tFrame = tFrameSequence[tFrameNumber];
        tName = `${tName}_${tLayer}_${tFrame}`;
      }
    }
    return tName;
  }

  getFrameList(tLayer) {
    if (!voidp(tLayer)) {
      if (!voidp(this.pLayerDataList[tLayer])) {
        const tLayerData = this.pLayerDataList[tLayer];
        let tAction = this.pState;
        if (tAction > tLayerData.count) {
          tAction = 1;
        }
        if ((tAction >= 1) && (tAction <= tLayerData.count)) {
          const tActionData = tLayerData[tAction];
          return tActionData;
        }
      }
    }
    return VOID;
  }

  setState(tNewState) {
    for (let tLayer = 1; tLayer <= this.pLayerDataList.count; tLayer++) {
      this.pLoopCountList[tLayer] = 0;
    }
    if (ilk(value(tNewState)) != Symbol.for("integer")) {
      return 0;
    }
    tNewState = value(tNewState);
    let tNewIndex = 0;
    for (let tIndex = 1; tIndex <= this.pStateSequenceList.count; tIndex++) {
      const tstate = this.pStateSequenceList[tIndex];
      if (ilk(tstate) == Symbol.for("list")) {
        for (let tIndex2 = 1; tIndex2 <= tstate.count; tIndex2++) {
          if (tstate[tIndex2] == tNewState) {
            tNewIndex = tIndex;
            break;
          }
        }
      } else {
        if (tstate == tNewState) {
          tNewIndex = tIndex;
        }
      }
      if (tNewIndex != 0) {
        break;
      }
    }
    if (tNewIndex == 0) {
      if (this.pStateSequenceList.count > 0) {
        const tstate = this.pStateSequenceList[1];
        if (ilk(tstate) == Symbol.for("list")) {
          if (tstate.count > 0) {
            tNewState = tstate[1];
            tNewIndex = 1;
          }
        } else {
          tNewState = tstate;
          tNewIndex = 1;
        }
      }
    }
    if (tNewIndex != 0) {
      this.pStateIndex = tNewIndex;
      this.pState = tNewState;
      this.resetFrameNumbers();
      for (let tLayer = 1; tLayer <= this.pLayerDataList.count; tLayer++) {
        const tFrameList = this.getFrameList(this.pLayerDataList.getPropAt(tLayer));
        if (!voidp(tFrameList)) {
          let tLoop = 1;
          if (!voidp(tFrameList[Symbol.for("loop")])) {
            tLoop = tFrameList[Symbol.for("loop")] - 1;
          }
          this.pLoopCountList[tLayer] = tLoop;
        }
      }
      return 1;
    }
    return 0;
  }

  getNextState() {
    if (this.pStateSequenceList.count < 1) {
      return 0;
    }
    const tStateIndex = (this.pStateIndex % this.pStateSequenceList.count) + 1;
    const tstate = this.pStateSequenceList[tStateIndex];
    let tStateNew;
    if (ilk(tstate) == Symbol.for("list")) {
      if (tstate.count < 1) {
        return 0;
      }
      tStateNew = tstate[random(tstate.count)];
    } else {
      tStateNew = tstate;
    }
    if (tStateNew == this.pState) {
      return 0;
    }
    return getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETITEMSTATE", propList("string", string(this.id), "integer", tStateNew));
  }

  validateStateSequenceList() {
    const tstatelist = list();
    for (let tIndex = 1; tIndex <= this.pStateSequenceList.count; tIndex++) {
      const tstate = this.pStateSequenceList[tIndex];
      if (ilk(tstate) == Symbol.for("list")) {
        if (tstate.count < 1) {
          return error(this, `Invalid state sequence list for item${this.pNameBase}`, Symbol.for("validateStateSequenceList"), Symbol.for("major"));
        }
        for (let tIndex2 = 1; tIndex2 <= tstate.count; tIndex2++) {
          const tState2 = tstate[tIndex2];
          if (tState2 < 1) {
            return error(this, `Invalid state sequence list for item${this.pNameBase}`, Symbol.for("validateStateSequenceList"), Symbol.for("major"));
          }
          if (tstatelist.count < tState2) {
            tstatelist[tState2] = 1;
            continue;
          }
          if (tstatelist[tState2] > 0) {
            return error(this, `Invalid state sequence list for item${this.pNameBase}`, Symbol.for("validateStateSequenceList"), Symbol.for("major"));
          }
        }
        continue;
      }
      if (tstate < 1) {
        return error(this, `Invalid state sequence list for item${this.pNameBase}`, Symbol.for("validateStateSequenceList"), Symbol.for("major"));
      }
      if (tstatelist.count < tstate) {
        tstatelist[tstate] = 1;
        continue;
      }
      if (tstatelist[tstate] > 0) {
        return error(this, `Invalid state sequence list for item${this.pNameBase}`, Symbol.for("validateStateSequenceList"), Symbol.for("major"));
        continue;
      }
      tstatelist[tstate] = 1;
    }
    return 1;
  }

  resetFrameNumbers() {
    this.pFrameRepeatList = list();
    this.pIsAnimatingList = list();
    this.pFrameNumberList = list();
    this.pFrameNumberList2 = list();
    for (let i = 1; i <= max(this.pLocShiftList.count, this.pLayerDataList.count); i++) {
      this.pFrameNumberList[i] = 0;
      this.pFrameNumberList2[i] = 1;
      this.pFrameRepeatList[i] = 1;
      this.pIsAnimatingList[i] = 1;
    }
  }

  solveInk(tPart) {
    const tName = this.pNameBase;
    if (memberExists(`${tName}.props`)) {
      const tPropList = value(member(getmemnum(`${tName}.props`)).text);
      if (ilk(tPropList) != Symbol.for("propList")) {
        error(this, `${tName}.props is not valid!`, Symbol.for("solveInk"), Symbol.for("minor"));
      } else {
        if (tPropList[tPart] != VOID) {
          if (tPropList[tPart][Symbol.for("ink")] != VOID) {
            return tPropList[tPart][Symbol.for("ink")];
          }
        }
      }
    }
    return 8;
  }

  solveBlend(tPart) {
    const tName = this.pNameBase;
    if (memberExists(`${tName}.props`)) {
      const tPropList = value(member(getmemnum(`${tName}.props`)).text);
      if (ilk(tPropList) != Symbol.for("propList")) {
        error(this, `${tName}.props is not valid!`, Symbol.for("solveBlend"), Symbol.for("minor"));
      } else {
        if (tPropList[tPart] != VOID) {
          if (tPropList[tPart][Symbol.for("blend")] != VOID) {
            return tPropList[tPart][Symbol.for("blend")];
          }
        }
      }
    }
    return 100;
  }

  solveLocShift(tPart, tdir) {
    const tName = this.pNameBase;
    if (!memberExists(`${tName}.props`)) {
      return 0;
    }
    const tPropList = value(field(getmemnum(`${tName}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${tName}.props is not valid!`, Symbol.for("solveLocShift"), Symbol.for("minor"));
      return 0;
    } else {
      if (voidp(tPropList[tPart])) {
        return 0;
      }
      if (voidp(tPropList[tPart][Symbol.for("locshift")])) {
        return 0;
      }
      if (tPropList[tPart][Symbol.for("locshift")].count <= tdir) {
        return 0;
      }
      const tShift = value(tPropList[tPart][Symbol.for("locshift")][tdir + 1]);
      if (ilk(tShift) == Symbol.for("point")) {
        return tShift;
      }
    }
    return 0;
  }

  solveLocZ(tPart, tdir) {
    const tName = this.pNameBase;
    if (!memberExists(`${tName}.props`)) {
      return charToNum(string(tPart)) - charToNum("a") + 1;
    }
    const tPropList = value(field(getmemnum(`${tName}.props`)));
    if (ilk(tPropList) != Symbol.for("propList")) {
      error(this, `${tName}.props is not valid!`, Symbol.for("solveLocZ"), Symbol.for("minor"));
      return 0;
    } else {
      if (tPropList[tPart] == VOID) {
        return 0;
      }
      if (tPropList[tPart][Symbol.for("zshift")] == VOID) {
        return 0;
      }
      if (ilk(tPropList[tPart][Symbol.for("zshift")]) == Symbol.for("list")) {
        if (tPropList[tPart][Symbol.for("zshift")].count <= tdir) {
          tdir = 0;
        }
      } else {
        tPropList[tPart][Symbol.for("zshift")] = list(0, 0, 0, 0, 0, 0, 0, 0);
        error(this, `${tName} zshift is not valid list`, Symbol.for("solveLocZ"), Symbol.for("minor"));
      }
    }
    return tPropList[tPart][Symbol.for("zshift")][tdir + 1];
  }

  solveTransparency(tPart) {
    const tName = this.pNameBase;
    if (memberExists(`${tName}.props`)) {
      const tPropList = value(member(getmemnum(`${tName}.props`)).text);
      if (ilk(tPropList) != Symbol.for("propList")) {
        error(this, `${tName}.props is not valid!`, Symbol.for("solveInk"), Symbol.for("minor"));
      } else {
        if (tPropList[tPart] != VOID) {
          if (tPropList[tPart][Symbol.for("transparent")] != VOID) {
            return tPropList[tPart][Symbol.for("transparent")];
          }
        }
      }
    }
    return 0;
  }
}
