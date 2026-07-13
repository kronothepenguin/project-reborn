export default class {
  pREquiresUpdate;
  pwidth;
  pheight;
  pRoomType;
  pAnimBottom;
  pAnimTop;
  pAnimImage;
  pAnimID;
  pScale;
  pSize;
  pAnimInstanceList;
  pIsUpdated;
  pTurnPoint;
  pMember;
  pClouds;
  pSkip;
  pSkippedFrames;
  pMaxItemAmount;
  pStopped;

  construct() {
    const tMemberName = "anim_frame_test";
    if (memberExists(tMemberName)) {
      this.pMember = getMember(tMemberName);
    } else {
      createMember(tMemberName, Symbol.for("bitmap"));
      this.pMember = getMember(tMemberName);
    }
    this.pwidth = 720;
    this.pheight = 400;
    this.pAnimBottom = 400;
    this.pAnimTop = 200;
    this.pSkip = 0;
    this.pTurnPoint = this.pwidth / 2;
    this.pAnimInstanceList = propList();
    this.pAnimImage = image(1, 1, 8);
    this.pMaxItemAmount = 15;
    this.pSkippedFrames = 20;
    this.pREquiresUpdate = 1;
    this.pStopped = 1;
    return 1;
  }

  deconstruct() {
    const tMemberName = "anim_frame_test";
    if (memberExists(tMemberName)) {
      removeMember(tMemberName);
    }
    for (const pAnimInstance of this.pAnimInstanceList) {
      removeObject(pAnimInstance.getID());
    }
    removeUpdate(this.getID());
    return 1;
  }

  define(tdata) {
    this.pwidth = tdata[Symbol.for("width")];
    this.pheight = tdata[Symbol.for("height")];
    this.pAnimID = tdata[Symbol.for("id")];
    this.pRoomTypeID = tdata[Symbol.for("roomtypeid")];
    if (variableExists(`landscape.def.${this.pRoomTypeID}`)) {
      const tRoomDef = getVariableValue(`landscape.def.${this.pRoomTypeID}`);
      this.pTurnPoint = tRoomDef[Symbol.for("middle")];
      this.pAnimBottom = tRoomDef[Symbol.for("anim_bottom")];
      this.pAnimTop = tRoomDef[Symbol.for("anim_top")];
    }
    this.pTurnPoint = this.pTurnPoint + tdata[Symbol.for("offset")];
    this.initAnimation();
    receiveUpdate(this.getID());
  }

  requiresUpdate() {
    return this.pREquiresUpdate;
  }

  initAnimation() {
    this.pAnimImage = image(this.pwidth, this.pheight, 8);
    for (let i = 1; i <= this.pMaxItemAmount; i++) {
      const tProps = propList();
      tProps.setaProp(Symbol.for("type"), random(3) - 1);
      tProps.setaProp(Symbol.for("turnpoint"), this.pTurnPoint);
      tProps.setaProp(Symbol.for("initminv"), this.pAnimTop);
      tProps.setaProp(Symbol.for("initmaxv"), this.pAnimBottom);
      const tCloud = createObject(getUniqueID(), "Landscape Cloud");
      tCloud.define(tProps);
      this.pAnimInstanceList.setaProp(tCloud.getID(), tCloud);
    }
    this.renderFrame();
  }

  setStopped(tStopped) {
    this.pStopped = tStopped;
  }

  update() {
    if (this.pStopped) {
      return 0;
    }
    this.pSkip = this.pSkip - 1;
    if (this.pSkip <= 0) {
      this.pSkip = this.pSkippedFrames;
    } else {
      return 0;
    }
    this.renderFrame();
  }

  renderFrame() {
    this.pAnimImage.fill(this.pAnimImage.rect, rgb(255, 51, 255));
    for (const tAnimInstance of this.pAnimInstanceList) {
      tAnimInstance.updateAnim();
      tAnimInstance.render(this.pAnimImage);
    }
    this.pMember.image = this.pAnimImage;
    this.pREquiresUpdate = 1;
  }

  getImage() {
    this.pREquiresUpdate = 0;
    return this.pAnimImage;
  }
}
