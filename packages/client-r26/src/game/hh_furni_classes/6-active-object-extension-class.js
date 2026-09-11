export default class {
  pStateSequenceList;
  pStateIndex;
  pState;
  pStateStringList;
  pLayerDataList;
  pFrameNumberList;
  pFrameNumberList2;
  pLoopCountList;
  pFrameRepeatList;
  pIsAnimatingList;
  pBlendList;
  pInkList;
  pNameBase;
  pInitialized;
  pLoczList;
  pLocShiftList;

  deconstruct() {
    this.pStateSequenceList = list();
    this.pStateIndex = 1;
    this.pState = 1;
    this.pLayerDataList = propList();
    this.pStateStringList = list();
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
    this.pStateStringList = list();
    this.pFrameNumberList = list();
    this.pFrameNumberList2 = list();
    this.pLoopCountList = list();
    this.pBlendList = list();
    this.pInkList = list();
    this.pLoczList = list();
    this.pLocShiftList = list();
    this.pFrameRepeatList = list();
    this.pIsAnimatingList = list();
    let tClass = tProps[Symbol.for("class")];
    const tOffset = offset("*", tClass);
    if (tOffset > 0) {
      tClass = tClass.char[`1..${tOffset - 1}`];
    }
    this.pNameBase = tClass;
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
          if (voidp(this.pStateStringList)) {
            this.pStateStringList = list();
          }
          if (!this.validateStateSequenceList()) {
            this.pStateSequenceList = list();
          }
        }
      } else {
        outputList(tText);
      }
    }
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
      this.pInkList[tLayer] = this.solveInk(tLayerName, this.pNameBase);
      this.pBlendList[tLayer] = this.solveBlend(tLayerName, this.pNameBase);
    }
    this.pInitialized = 0;
    return callAncestor(Symbol.for("define"), [this], tProps);
  }

  prepare(tdata) {
    let tstate = tdata[Symbol.for("stuffdata")];
    if (this.pStateStringList.findPos(tstate) > 0) {
      tstate = this.pStateStringList.findPos(tstate);
    }
    this.setState(tstate);
    this.resetFrameNumbers();
    callAncestor(Symbol.for("prepare"), [this], tdata);
    return 1;
  }

  select() {
    if (the.doubleClick) {
      this.getNextState();
    } else {
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("MOVE", propList("short", this.pLocX, "short", this.pLocY));
    }
    callAncestor(Symbol.for("select"), [this]);
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

  solveMembers() {
    if (!this.pInitialized) {
      callAncestor(Symbol.for("solveMembers"), [this]);
    }
    let tMembersFound = 0;
    let tCount = this.pLocShiftList.count;
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
          tLayerName = this.pLayerDataList.getPropAt(tLayer);
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

  postProcessLayer(tLayer) {
    return 1;
  }

  getMemberName(tLayer) {
    let tName = this.pNameBase;
    const tLayerIndex = this.pLayerDataList.findPos(tLayer);
    const tFrameList = this.getFrameList(tLayer);
    let tDirection = 0;
    if (!voidp(this.pDirection)) {
      if (this.pDirection.count >= 1) {
        tDirection = this.pDirection[1];
      }
    }
    let tFrame = 0;
    if (!voidp(tFrameList) && !voidp(tLayerIndex)) {
      const tFrameSequence = tFrameList[Symbol.for("frames")];
      if (!voidp(tFrameSequence)) {
        const tFrameNumber = this.pFrameNumberList2[tLayerIndex];
        tFrame = tFrameSequence[tFrameNumber];
        if (tFrame < 0) {
          tFrame = random(abs(tFrame));
        }
      }
    }
    tName = `${tName}_${tLayer}_0_${this.pDimensions[1]}_${this.pDimensions[2]}_${tDirection}_${tFrame}`;
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

  updateStuffdata(tValue) {
    if (ilk(tValue) == Symbol.for("string")) {
      if (this.pStateStringList.findPos(tValue) > 0) {
        tValue = this.pStateStringList.findPos(tValue);
      }
    }
    this.setState(value(tValue));
  }

  setState(tNewState) {
    for (let tLayer = 1; tLayer <= this.pLayerDataList.count; tLayer++) {
      this.pLoopCountList[tLayer] = 0;
    }
    if (tNewState == EMPTY) {
      tNewState = 1;
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
      this.solveMembers();
      this.updateLocation();
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
    let tStr = string(tStateNew);
    if (this.pStateStringList.count >= tStateNew) {
      tStr = string(this.pStateStringList[tStateNew]);
    }
    return getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", tStr));
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
      this.pFrameNumberList[i] = 1;
      this.pFrameNumberList2[i] = 1;
      this.pFrameRepeatList[i] = 1;
      this.pIsAnimatingList[i] = 1;
    }
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
