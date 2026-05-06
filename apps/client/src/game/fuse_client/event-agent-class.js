import {
  call,
  getmemnum,
  list,
  member,
  propList,
  rect,
  sprite,
  the,
  voidp,
  VOID,
} from "../../director";

export default function () {
  let tTarget;

  return {
    pSprite: VOID,
    pEventList: VOID,

    construct() {
      this.pEventList = propList();
      this.pSprite = sprite(_director.reserveSprite(this.getID()));
      if (this.pSprite.spriteNum === 0) {
        return 0;
      }
      this.pSprite.member = member(getmemnum("null"));
      this.pSprite.rect = rect(-90, -90, -80, -80);
      this.pSprite.locZ = 20000000;
      this.pSprite.blend = 0;
      _director.getSpriteManager().setEventBroker(this.pSprite.spriteNum, this.getID());
      return 1;
    },

    deconstruct() {
      _director.removePrepare(this.getID());
      _director.getSpriteManager().releaseSprite(this.pSprite.spriteNum);
      return 1;
    },

    registerEvent(tObj, tEvent, tMethod) {
      this.pEventList[tEvent] = list(tObj, tMethod);
      this.pSprite.registerProcedure(Symbol.for("eventProcDefault"), this.getID(), tEvent);
      this.pSprite.visible = 1;
      return _director.receivePrepare(this.getID());
    },

    unregisterEvent(tEvent) {
      this.pEventList.deleteProp(tEvent);
      if (this.pEventList.count === 0) {
        _director.removePrepare(this.getID());
        this.pSprite.visible = 0;
        this.pSprite.rect = rect(-90, -90, -80, -80);
      }
      return 1;
    },

    prepare() {
      this.pSprite.loc = the.mouseLoc - list(5, 5);
    },

    eventProcDefault(tEvent, tSprID, tParam) {
      tTarget = this.pEventList[tEvent];
      if (voidp(tTarget)) {
        return this.pSprite.removeProcedure(tEvent);
      }
      return call(tTarget[2], tTarget[1]);
    },

    null() {
    },
  };
}
