export default class {
  pREquiresUpdate;
  pwidth;
  pheight;
  pWallHeight;
  pRoomType;
  pAnimImage;
  pAnimID;
  pScale;
  pSize;
  pAnimInstanceList;
  pTurnPointList;
  pLandscapeType;
  pMember;
  pClouds;
  pAnimMemberId;
  pAnimMemberCount;
  pSkip;
  pSkippedFrames;
  pMaxItemAmount;
  pStopped;
  pSprite;
  pMaskImage;

  construct() {
    const tMemberName = "anim_frame_test";
    if (memberExists(tMemberName)) {
      this.pMember = getMember(tMemberName);
    } else {
      createMember(tMemberName, Symbol.for("bitmap"));
      this.pMember = getMember(tMemberName);
    }
    this.pMember.regPoint = point(0, 0);
    this.pwidth = 720;
    this.pheight = 400;
    this.pSkip = 0;
    this.pAnimInstanceList = list();
    this.pAnimImage = image(1, 1, 8);
    this.pMaxItemAmount = 15;
    this.pSkippedFrames = 20;
    this.pREquiresUpdate = 1;
    this.pStopped = 1;
    const tSpriteNum = reserveSprite(this.getID());
    this.pSprite = sprite(tSpriteNum);
    this.pSprite.member = this.pMember;
    this.resetImage();
    return 1;
  }

  deconstruct() {
    removeUpdate(this.getID());
    const tMemberName = "anim_frame_test";
    if (memberExists(tMemberName)) {
      removeMember(tMemberName);
    }
    this.pAnimInstanceList = list();
    if (this.pSprite != VOID) {
      releaseSprite(this.pSprite.spriteNum);
    }
    return 1;
  }

  define(tdata, tTurnOffsetList) {
    this.pwidth = tdata[Symbol.for("width")];
    this.pheight = tdata[Symbol.for("height")];
    this.pAnimID = tdata[Symbol.for("id")];
    this.pRoomTypeID = tdata[Symbol.for("roomtypeid")];
    this.pWallHeight = tdata.getaProp(Symbol.for("wallheight"));
    this.pLandscapeType = tdata.getaProp(Symbol.for("landscape"));
    this.pAnimMemberId = `lsd_${this.pLandscapeType}_cloud_`;
    let tMemNum = getmemnum(`${this.pAnimMemberId}0_left`);
    if (tMemNum == 0) {
      this.pAnimMemberId = "landscape_cloud_";
      this.pAnimMemberCount = 3;
    } else {
      this.pAnimMemberCount = 0;
      while (tMemNum != 0) {
        this.pAnimMemberCount = this.pAnimMemberCount + 1;
        tMemNum = getmemnum(`${this.pAnimMemberId}${this.pAnimMemberCount + 1}_left`);
      }
    }
    this.pTurnPointList = tTurnOffsetList;
    this.setStopped(1);
  }

  requiresUpdate() {
    return this.pREquiresUpdate;
  }

  initAnimation() {
    this.resetImage();
    if (this.pAnimMemberCount == 0) {
      return this.setStopped(1);
    }
    for (let i = 1; i <= this.pMaxItemAmount; i++) {
      const tProps = propList();
      tProps.setaProp(Symbol.for("type"), random(this.pAnimMemberCount) - 1);
      tProps.setaProp(Symbol.for("memberid"), this.pAnimMemberId);
      tProps.setaProp(Symbol.for("turnPointList"), this.pTurnPointList);
      tProps.setaProp(Symbol.for("wallheight"), this.pWallHeight);
      tProps.setaProp(Symbol.for("landscape"), this.pLandscapeType);
      const tCloud = createObject(Symbol.for("temp"), "Landscape Cloud");
      if (tCloud.define(tProps)) {
        this.pAnimInstanceList.append(tCloud);
      }
    }
  }

  setStopped(tStopped) {
    this.pStopped = tStopped;
    if (this.pStopped) {
      removeUpdate(this.getID());
      this.pAnimInstanceList = list();
      this.pAnimImage = image(1, 1, 32);
      this.pMember.image = image(1, 1, 32);
    } else {
      this.initAnimation();
      receiveUpdate(this.getID());
    }
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

  resetImage() {
    this.pMember.image = image(this.pwidth, this.pheight, 32);
    this.pAnimImage = image(this.pwidth, this.pheight, 32);
    this.pAnimImage.fill(0, 0, this.pwidth, this.pheight, color(112, 112, 112));
    this.pAnimInstanceList = list();
  }

  resetSprite(tVisSpr, tMaskImage) {
    this.pMaskImage = tMaskImage;
    this.pMember.regPoint = point(0, 0);
    this.pSprite.locH = tVisSpr.locH;
    this.pSprite.locV = tVisSpr.locV;
    this.pSprite.locZ = tVisSpr.locZ + 1;
    this.pSprite.member = this.pMember;
    this.pSprite.width = tVisSpr.width;
    this.pSprite.height = tVisSpr.height;
    this.pSprite.ink = 36;
  }

  renderFrame() {
    this.pAnimImage.fill(this.pAnimImage.rect, rgb(255, 255, 255));
    for (const tAnimInstance of this.pAnimInstanceList) {
      tAnimInstance.updateAnim();
      tAnimInstance.render(this.pAnimImage);
    }
    this.pMember.image.fill(this.pMember.image.rect, rgb(255, 255, 255));
    this.pMember.image.copyPixels(this.pAnimImage, this.pAnimImage.rect, this.pAnimImage.rect, propList(Symbol.for("maskImage"), this.pMaskImage));
    this.pSprite.member = this.pMember;
    this.pREquiresUpdate = 1;
  }

  copyToImage(tImage) {
    for (const tAnimInstance of this.pAnimInstanceList) {
      tAnimInstance.render(tImage);
    }
    return tImage;
  }

  getImage() {
    this.pREquiresUpdate = 0;
    return this.pAnimImage;
  }
}
