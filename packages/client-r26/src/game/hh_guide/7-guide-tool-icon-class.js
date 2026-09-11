export default class {
  pSpriteId;
  pIconSprite;
  pIconLoc;
  pFlashTimeoutID;

  construct() {
    this.pSpriteId = "guide_tool_icon_sprite";
    this.pIconSprite = VOID;
    this.pIconLoc = value(getVariable("guidetool.icon.loc"));
    this.pFlashTimeoutID = "guide_tool_icon_flash";
  }

  deconstruct() {
    if (this.pIconSprite.ilk == Symbol.for("sprite")) {
      releaseSprite(this.pIconSprite.spriteNum);
    }
  }

  show(tstate) {
    if (voidp(tstate)) {
      tstate = "normal";
    }
    if (this.pIconSprite.ilk != Symbol.for("sprite")) {
      this.pIconSprite = sprite(reserveSprite(this.getID()));
      if (this.pIconSprite == 0) {
        return 0;
      }
    }
    this.pIconSprite.member = member("guide_tool_icon_normal");
    this.pIconSprite.ink = 8;
    this.pIconSprite.loc = this.pIconLoc;
    this.pIconSprite.locZ = 200000000;
    this.pIconSprite.visible = 1;
    setEventBroker(this.pIconSprite.spriteNum, this.pSpriteId);
    this.pIconSprite.registerProcedure(Symbol.for("eventProcIcon"), this.getID(), Symbol.for("mouseUp"));
    this.pIconSprite.setcursor("cursor.finger");
    return 1;
  }

  hide() {
    if (this.pIconSprite.ilk == Symbol.for("sprite")) {
      this.pIconSprite.visible = 0;
    }
  }

  setFlashing(tstate) {
    if (tstate == 1) {
      if (!timeoutExists(this.pFlashTimeoutID)) {
        createTimeout(this.pFlashTimeoutID, 500, Symbol.for("updateFlash"), this.getID(), VOID, 0);
      }
    } else {
      if (timeoutExists(this.pFlashTimeoutID)) {
        removeTimeout(this.pFlashTimeoutID);
      }
      if (this.pIconSprite.ilk == Symbol.for("sprite")) {
        this.pIconSprite.member = member("guide_tool_icon_normal");
      }
    }
  }

  updateFlash() {
    if (this.pIconSprite.ilk != Symbol.for("sprite")) {
      return 0;
    }
    let tMemName = this.pIconSprite.member.name;
    if (tMemName == "guide_tool_icon_normal") {
      this.pIconSprite.member = member("guide_tool_icon_black");
    } else {
      this.pIconSprite.member = member("guide_tool_icon_normal");
    }
  }

  eventProcIcon(tEvent, tSprID, tProp) {
    executeMessage(Symbol.for("toggleGuideTool"));
  }
}
