import {
  EMPTY,
  RETURN,
  SPACE,
  VOID,
  integerp,
  list,
  member,
  propList,
  puppetSprite,
  put,
  rect,
  script,
  sprite,
  voidp,
} from "../../director";

export default function () {
  let tSprNum, tsprite, tClientID, tPropID, tValue, tCount;
  let i, tNum, tSymbol, tID;

  return {
    pTotalSprList: VOID,
    pFreeSprList: VOID,
    pClientList: VOID,
    pEventBroker: VOID,

    construct() {
      this.pTotalSprList = VOID;
      this.pFreeSprList = VOID;
      this.pClientList = VOID;
      this.pEventBroker = script(_director.getVariable("event.broker.behavior"));
      return this.preIndexChannels();
    },

    deconstruct() {
      return 1;
    },

    getProperty(tPropID) {
      switch (tPropID) {
        case Symbol.for("totalSprCount"):
          return this.pTotalSprList.count;
        case Symbol.for("freeSprCount"):
          return this.pFreeSprList.count;
        default:
          return 0;
      }
    },

    setProperty(tPropID, tValue) {
      switch (tPropID) {
        default:
          return 0;
      }
    },

    reserveSprite(tClientID) {
      if (this.pFreeSprList.count === 0) {
        _director.executeMessage(Symbol.for("releaseSpritesLevel1"));
        if (this.pFreeSprList.count === 0) {
          _director.executeMessage(Symbol.for("releaseSpritesLevel2"));
          if (this.pFreeSprList.count === 0) {
            _director.fatalError({ [Symbol.for("error")]: "Out of free sprites" });
          }
        }
      }
      tSprNum = this.pFreeSprList[1];
      tsprite = sprite(tSprNum);
      this.pFreeSprList.deleteAt(1);
      puppetSprite(tSprNum, 1);
      tsprite.stretch = 0;
      tsprite.locV = -1000;
      tsprite.visible = 1;
      this.pClientList[tSprNum] = tClientID;
      return tSprNum;
    },

    releaseSprite(tSprNum) {
      if (this.pTotalSprList.getPos(tSprNum) < 1) {
        return _director.error(this, "Sprite not marked as usable: " + tSprNum, Symbol.for("releaseSprite"), Symbol.for("minor"));
      }
      if (this.pFreeSprList.getPos(tSprNum) > 0) {
        return _director.error(this, "Attempting to release free sprite!", Symbol.for("releaseSprite"), Symbol.for("minor"));
      }
      tsprite = sprite(tSprNum);
      tsprite.member = member(0);
      tsprite.scriptInstanceList = list();
      tsprite.rect = rect(0, 0, 1, 1);
      tsprite.locZ = tSprNum;
      tsprite.visible = 0;
      tsprite.castNum = 0;
      tsprite.cursor = 0;
      tsprite.blend = 100;
      tsprite.skew = 0;
      tsprite.rotation = 0;
      puppetSprite(tSprNum, 0);
      tsprite.locZ = VOID;
      this.pFreeSprList.append(tSprNum);
      this.pClientList[tSprNum] = 0;
      return 1;
    },

    releaseAllSprites() {
      this.pFreeSprList = list();
      for (let tSprNum = 1; tSprNum <= this.pTotalSprList.count; tSprNum++) {
        this.releaseSprite(tSprNum);
      }
      return 1;
    },

    setEventBroker(tSprNum, tID) {
      if (this.pTotalSprList.getPos(tSprNum) < 1) {
        return _director.error(this, "Sprite not marked as usable: " + tSprNum, Symbol.for("setEventBroker"), Symbol.for("major"));
      }
      if (this.pFreeSprList.getPos(tSprNum) > 0) {
        return _director.error(this, "Attempted to modify non-reserved sprite!", Symbol.for("setEventBroker"), Symbol.for("major"));
      }
      tsprite = sprite(tSprNum);
      tsprite.scriptInstanceList = list(this.pEventBroker.new());
      tsprite.setID(tID);
      return 1;
    },

    removeEventBroker(tSprNum) {
      if (this.pTotalSprList.getPos(tSprNum) < 1) {
        return _director.error(this, "Sprite not marked as usable: " + tSprNum, Symbol.for("removeEventBroker"), Symbol.for("minor"));
      }
      if (this.pFreeSprList.getPos(tSprNum) > 0) {
        return _director.error(this, "Attempted to modify non reserved sprite!", Symbol.for("removeEventBroker"), Symbol.for("minor"));
      }
      sprite(tSprNum).scriptInstanceList = list();
      return 1;
    },

    print(tCount) {
      if (integerp(tCount)) {
        if (tCount > the.lastChannel) {
          tCount = the.lastChannel;
        }
        for (let i = 1; i <= tCount; i++) {
          put(`${sprite(i).spriteNum} -- ${sprite(i).member.name} -- ${sprite(i).locZ} -- ${sprite(i).rect} -- ${this.pClientList[sprite(i).spriteNum]}`);
        }
      } else {
        for (const tNum of this.pTotalSprList) {
          if (this.pFreeSprList.getPos(tNum) < 1) {
            tSymbol = "#";
          } else {
            tSymbol = SPACE;
          }
          put(`${tSymbol}${tNum} ${sprite(tNum).member.name} -- ${sprite(tNum).locZ} -- ${sprite(tNum).rect} -- ${this.pClientList[tNum]}`);
        }
      }
    },

    preIndexChannels() {
      this.pTotalSprList = list();
      this.pFreeSprList = list();
      this.pClientList = list();
      for (let i = 1; i <= the.lastChannel; i++) {
        this.pTotalSprList.add(i);
        this.pClientList.add(0);
        puppetSprite(i, 1);
        sprite(i).visible = 0;
      }
      this.pFreeSprList = this.pTotalSprList.duplicate();
      this.pTotalSprList.sort();
      return 1;
    },
  };
}
