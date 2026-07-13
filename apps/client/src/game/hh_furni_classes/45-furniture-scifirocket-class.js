export default class {
  pActive;
  pSync;
  pChanges;
  pSmokelist;
  pSmokeLocs;
  pInitializeSprites;
  pPause;
  pSizeMultiplier;
  pAnimFrame;

  construct() {
    this.pSmokelist = list();
    this.pSmokeLocs = list();
    this.pInitializeSprites = 0;
    if (this.pXFactor == 32) {
      this.pSizeMultiplier = 0.40000000000000002;
    } else {
      this.pSizeMultiplier = 1.0;
    }
    return callAncestor(Symbol.for("deconstruct"), [this]);
  }

  deconstruct() {
    for (let i = 1; i <= this.pSmokelist.count; i++) {
      releaseSprite(this.pSmokelist[i].spriteNum);
    }
    return callAncestor(Symbol.for("deconstruct"), [this]);
  }

  prepareForMove() {
    if (this.pActive == 1) {
      return 1;
    }
    for (let i = 1; i <= this.pSmokelist.count; i++) {
      releaseSprite(this.pSmokelist[i].spriteNum);
    }
    this.pSmokelist = list();
    this.pChanges = 0;
    return 1;
  }

  prepare(tdata) {
    if (tdata[Symbol.for("stuffdata")] == "ON") {
      this.setOn();
    } else {
      this.setOff();
      this.pChanges = 0;
    }
    if (this.pSprList.count > 1) {
      removeEventBroker(this.pSprList[2].spriteNum);
    }
    this.pAnimFrame = 1;
    this.pSync = 1;
    if (this.pSmokelist.count >= 2) {
      this.pInitializeSprites = 1;
    }
    return 1;
  }

  createSmokeSprites(tNumOf) {
    if (this.pSprList.count < 4) {
      return 0;
    }
    for (let i = 1; i <= tNumOf; i++) {
      this.pSmokelist.add(sprite(reserveSprite(this.getID())));
    }
    return this.initializeSmokeSprites();
  }

  initializeSmokeSprites() {
    if (this.pSprList.count < 4) {
      return 0;
    }
    const tStartLoc = this.pSprList[4].loc + point(28, -60);
    const tSmokeBig = this.pSmokelist[1];
    tSmokeBig.loc = tStartLoc;
    tSmokeBig.ink = 8;
    tSmokeBig.blend = 100;
    this.changeMember(tSmokeBig, "scifirocket_sm_tiny");
    this.pSmokeLocs[1] = tSmokeBig.loc;
    tSmokeBig.visible = 0;
    tSmokeBig.locZ = this.pSprList[4].locZ + 2;
    for (let i = 2; i <= this.pSmokelist.count; i++) {
      const tSp = this.pSmokelist[i];
      tSp.loc = tStartLoc + ((point(-3, -21) + point(random(6), random(4))) * this.pSizeMultiplier);
      tSp.ink = 8;
      tSp.locZ = this.pSprList[4].locZ + 1;
      tSp.blend = 100;
      tSp.visible = 0;
      this.pSmokeLocs[i] = tSp.loc;
      if (random(3) == 1) {
        this.changeMember(tSp, "scifirocket_sm_tiny");
        continue;
      }
      this.changeMember(tSp, "scifirocket_sm_small");
    }
    this.pInitializeSprites = 0;
    return 1;
  }

  animateSmallSmokes(tVal) {
    switch (tVal) {
      case "move":
        for (let i = 2; i <= this.pSmokelist.count; i++) {
          switch (i) {
            case 2:
              if (random(2) == 2) {
                this.pSmokeLocs[i][2] = this.pSmokeLocs[i][2] - (0.59999999999999998 * this.pSizeMultiplier);
              }
              break;
            case 3:
              this.pSmokeLocs[i][1] = this.pSmokeLocs[i][1] + ((0.59999999999999998 - (random(6) / 12.0)) * this.pSizeMultiplier);
              break;
            case 4:
              this.pSmokeLocs[i][1] = this.pSmokeLocs[i][1] - (random(6) / 12.0 * this.pSizeMultiplier);
              break;
            case 5:
              this.pSmokeLocs[i][1] = this.pSmokeLocs[i][1] + ((1.0 - (random(6) / 12.0)) * this.pSizeMultiplier);
              this.pSmokeLocs[i][2] = this.pSmokeLocs[i][2] + (random(10) / 12.0 * this.pSizeMultiplier);
              break;
            case 6:
              this.pSmokeLocs[i][1] = this.pSmokeLocs[i][1] - ((0.5 + (random(6) / 12.0)) * this.pSizeMultiplier);
              this.pSmokeLocs[i][2] = this.pSmokeLocs[i][2] + (random(10) / 12.0 * this.pSizeMultiplier);
              break;
          }
          this.pSmokeLocs[i][2] = this.pSmokeLocs[i][2] - ((0.69999999999999996 - (random(6) / 12.0)) * this.pSizeMultiplier);
          this.pSmokeLocs[i][1] = this.pSmokeLocs[i][1] + sin(the.timer);
          this.pSmokelist[i].visible = 1;
          this.pSmokelist[i].loc = this.pSmokeLocs[i];
        }
        break;
      case "make_smaller":
        for (let i = 2; i <= this.pSmokelist.count; i++) {
          if (random(5) == 2) {
            this.changeMember(this.pSmokelist[i], "scifirocket_sm_tiny");
          }
        }
        break;
      case "blend":
        for (let i = 2; i <= this.pSmokelist.count; i++) {
          this.pSmokelist[i].blend = this.pSmokelist[i].blend - 15;
        }
        break;
    }
    return 1;
  }

  updateStuffdata(tValue) {
    if (tValue == "ON") {
      this.setOn();
    } else {
      this.setOff();
    }
    return 1;
  }

  update() {
    if (this.pSprList.count < 4) {
      return 0;
    }
    const tlight = this.pSprList[2];
    if (this.pActive) {
      tlight.blend = 100;
    } else {
      tlight.blend = 0;
    }
    if (this.pSync < 3) {
      this.pSync = this.pSync + 1;
      return 0;
    } else {
      this.pSync = 1;
    }
    if (!this.pChanges) {
      return 0;
    }
    if (this.pSmokelist.count == 0) {
      this.createSmokeSprites(4);
    }
    if (this.pInitializeSprites) {
      this.initializeSmokeSprites();
    }
    if (this.pAnimFrame == 1) {
      if (random(8) != 2) {
        return 1;
      }
    }
    const tSmokeBig = this.pSmokelist[1];
    if (this.pAnimFrame <= 23) {
      if (this.pAnimFrame == 4) {
        this.changeMember(tSmokeBig, "scifirocket_sm_small");
      }
      if (this.pAnimFrame == 9) {
        this.changeMember(tSmokeBig, "scifirocket_sm_med");
      }
      if (this.pAnimFrame == 14) {
        this.changeMember(tSmokeBig, "scifirocket_sm_big");
      }
      this.pSmokeLocs[1][2] = this.pSmokeLocs[1][2] - (0.90000000000000002 * this.pSizeMultiplier);
      tSmokeBig.visible = 1;
      tSmokeBig.loc = this.pSmokeLocs[1];
    } else {
      tSmokeBig.blend = tSmokeBig.blend - 20;
      if (this.pAnimFrame > 52) {
        this.animateSmallSmokes("make_smaller");
      }
      if (this.pAnimFrame > 60) {
        this.animateSmallSmokes("blend");
      }
      if (tSmokeBig.blend < 20) {
        tSmokeBig.visible = 0;
      }
      this.animateSmallSmokes("move");
    }
    this.pAnimFrame = this.pAnimFrame + 1;
    if (this.pAnimFrame > 66) {
      this.initializeSmokeSprites();
      this.pAnimFrame = 1;
      if (this.pActive == 0) {
        this.pChanges = 0;
      }
    }
  }

  changeMember(tSpr, tMemName) {
    if (this.pXFactor == 32) {
      tMemName = `s_${tMemName}`;
    }
    const tMem = getMember(tMemName);
    if (tMem == VOID) {
      return 0;
    }
    tSpr.member = tMem;
    tSpr.width = tMem.width;
    tSpr.height = tMem.height;
    return 1;
  }

  setOn() {
    this.pChanges = 1;
    this.pActive = 1;
    this.pSync = random(10) - 8;
  }

  setOff() {
    this.pChanges = 1;
    this.pActive = 0;
    this.pInitializeSprites = 0;
  }

  select() {
    if (the.doubleClick) {
      let tStr;
      if (this.pActive) {
        tStr = "OFF";
      } else {
        tStr = "ON";
      }
      getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SETSTUFFDATA", propList("string", string(this.getID()), "string", tStr));
    }
    return 1;
  }
}
