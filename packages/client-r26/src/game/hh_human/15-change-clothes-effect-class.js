export default class {
  pTotalAnimTime = undefined;
  pAnimStartTime = undefined;
  pScreenStartLoc = undefined;
  pSpriteData = undefined;
  pItemTravelDist = undefined;
  pMemberPrefix = undefined;
  pTimePerPhase = undefined;
  pFrameAmount = undefined;
  pPhaseAmount = undefined;
  pCurrentPhase = undefined;
  pCurrentFrame = undefined;
  pRunAnimation = undefined;
  pHostSpriteData = undefined;

  construct() {
    pTotalAnimTime = 700
    pPhaseAmount = 3
    pFrameAmount = 2
    pCurrentPhase = 1
    pCurrentFrame = random(pFrameAmount)
    pTimePerPhase = pTotalAnimTime / pPhaseAmount
    pMemberPrefix = "effect_cloud_"
    pSpriteData = list()
    pRunAnimation = 0
    pHostSpriteData = propList()
  }

  deconstruct() {
    removeUpdate(this.getID())
    for (const tSpriteData of pSpriteData) {
      releaseSprite(tSpriteData[Symbol.for("sprite")].spriteNum)
    }
    if (pHostSpriteData[Symbol.for("sprite")] != VOID) {
      pHostSpriteData[Symbol.for("sprite")].color = pHostSpriteData[Symbol.for("previousfcolor")]
      pHostSpriteData[Symbol.for("sprite")].ink = pHostSpriteData[Symbol.for("previousink")]
    }
    pSpriteData = list()
    pHostSpriteData = propList()
  }

  removeFromObjectManager() {
    if (objectExists(this.getID())) {
      removeObject(this.getID())
    }
  }

  defineWithSprite(tsprite, tSize) {
    if (ilk(tsprite) != Symbol.for("sprite")) {
      return 0
    }
    if (voidp(tSize)) {
      tSize = Symbol.for("large")
    }
    tWidth = tsprite.width
    tHeight = tsprite.height
    tloc = point(tsprite.locH + (tWidth / 2), tsprite.locV - (tHeight / 2))
    tlocz = tsprite.locZ
    tRect = tsprite.rect
    pHostSpriteData[Symbol.for("sprite")] = tsprite
    pHostSpriteData[Symbol.for("previousink")] = tsprite.ink
    pHostSpriteData[Symbol.for("previousfcolor")] = color(Symbol.for("rgb"), 0, 0, 0)
    tsprite.color = color(Symbol.for("rgb"), 150, 150, 150)
    tsprite.ink = 41
    this.define(tloc, tlocz, tSize)
  }

  define(tloc, tlocz, tSize) {
    if (voidp(tloc)) {
      return 0
    }
    if (ilk(tloc) != Symbol.for("point")) {
      return 0
    }
    if (voidp(tlocz)) {
      return 0
    }
    if (voidp(tSize)) {
      tSize = Symbol.for("large")
    }
    pScreenStartLoc = tloc
    tSpriteCount = 3
    tAngleSectorSize = 2 * PI / tSpriteCount
    tMaxItemTravelDist = 25
    tLocZVariance = 200
    if (tSize == Symbol.for("small")) {
      tMaxItemTravelDist = tMaxItemTravelDist / 2
      pMemberPrefix = `${pMemberPrefix}small_`
    }
    for (let i = 1; i <= tSpriteCount; i++) {
      tsprite = sprite(reserveSprite(this.getID()))
      tDirAngle = ((i - 1) * tAngleSectorSize) + random(tAngleSectorSize)
      tMaxTravelX = cos(tDirAngle) * tMaxItemTravelDist
      tMaxTravelY = sin(tDirAngle) * tMaxItemTravelDist
      tPixelsPerMillisecX = float(tMaxTravelX) / pTotalAnimTime
      tPixelsPerMillisecY = float(tMaxTravelY) / pTotalAnimTime
      tsprite.flipH = random(1)
      tsprite.flipV = random(1)
      tdata = propList()
      tdata[Symbol.for("IncrementX")] = tPixelsPerMillisecX
      tdata[Symbol.for("IncrementY")] = tPixelsPerMillisecY
      tdata[Symbol.for("sprite")] = tsprite
      pSpriteData.add(tdata)
      tsprite.member = member(getmemnum(`${pMemberPrefix}${pCurrentPhase}_${pCurrentFrame}`))
      tsprite.locZ = tlocz + random(tLocZVariance) - (tLocZVariance / 2)
      tsprite.ink = 8
    }
    pAnimStartTime = the.milliSeconds
    pRunAnimation = 1
    receiveUpdate(this.getID())
  }

  update() {
    if (!pRunAnimation) {
      return 0
    }
    tMoveTime = the.milliSeconds - pAnimStartTime
    if (tMoveTime > pTotalAnimTime) {
      pRunAnimation = 0
      this.removeFromObjectManager()
      return 0
    }
    tUpdatePhase = 0
    tCurrentPhase = integer(tMoveTime / pTimePerPhase) + 1
    if (tCurrentPhase != pCurrentPhase) {
      tUpdatePhase = 1
      pCurrentPhase = tCurrentPhase
    }
    for (const tSpriteData of pSpriteData) {
      tRandomUpdateTrigger = 3
      if ((random(tRandomUpdateTrigger) > (tRandomUpdateTrigger - 1)) || tUpdatePhase) {
        tNewFrame = random(pFrameAmount)
        tSpriteData[Symbol.for("sprite")].flipH = random(1)
        tSpriteData[Symbol.for("sprite")].flipV = random(1)
        tSpriteData[Symbol.for("sprite")].member = member(getmemnum(`${pMemberPrefix}${pCurrentPhase}_${tNewFrame}`))
        tSpriteData[Symbol.for("IncrementX")] = tSpriteData[Symbol.for("IncrementX")] * 1.05000000000000004
        tSpriteData[Symbol.for("IncrementY")] = tSpriteData[Symbol.for("IncrementY")] * 1.05000000000000004
      }
      tLocX = integer((tMoveTime * tSpriteData[Symbol.for("IncrementX")]) + pScreenStartLoc.locH)
      tLocY = integer((tMoveTime * tSpriteData[Symbol.for("IncrementY")]) + pScreenStartLoc.locV)
      tSpriteData[Symbol.for("sprite")].loc = point(tLocX, tLocY)
    }
    if (tMoveTime > (3.0 / 4 * pTotalAnimTime)) {
      this.removeFromObjectManager()
    } else {
      if ((tMoveTime > (2.0 / 4 * pTotalAnimTime)) && (pHostSpriteData[Symbol.for("sprite")] != VOID)) {
        pHostSpriteData[Symbol.for("sprite")].color = color(Symbol.for("rgb"), 50, 50, 50)
      } else {
        if ((tMoveTime > (1.0 / 4 * pTotalAnimTime)) && (pHostSpriteData[Symbol.for("sprite")] != VOID)) {
          pHostSpriteData[Symbol.for("sprite")].color = color(Symbol.for("rgb"), 150, 150, 150)
        } else {
          pHostSpriteData[Symbol.for("sprite")].color = color(Symbol.for("rgb"), 255, 255, 255)
        }
      }
    }
  }
}
