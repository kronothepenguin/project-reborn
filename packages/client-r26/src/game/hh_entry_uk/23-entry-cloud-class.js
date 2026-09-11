export default class {
  pSprite;
  pTurnPoint;
  pVertDir;
  pImg;
  pLoc;
  pTurnPointList;
  pCurrentTurnPoint;
  pCloudDir;
  pMemName;
  pCloudMember;

  define(tsprite, tCount) {
    this.pSprite = tsprite;
    if (memberExists(`entrycloud_${tCount}`)) {
      this.pCloudMember = member(getmemnum(`entrycloud_${tCount}`));
    } else {
      this.pCloudMember = member(createMember(`entrycloud_${tCount}`, Symbol.for("bitmap")));
    }
    this.pImg = this.pCloudMember.image;
    tTemp = the.itemDelimiter;
    the.itemDelimiter = "_";
    this.pMemName = this.pSprite.member.name.item[`${1}..${this.pSprite.member.name.item.count - 1}`];
    tdir = this.pSprite.member.name.item[this.pSprite.member.name.item.count];
    the.itemDelimiter = tTemp;
    if (tdir == "left") {
      this.pVertDir = -1;
    } else {
      this.pVertDir = 1;
    }
    this.pTurnPointList = list(330);
    this.pCurrentTurnPoint = 0;
    this.initCloud();
    this.pSprite.member = this.pCloudMember;
    this.pSprite.width = this.pCloudMember.width;
    this.pSprite.height = this.pCloudMember.height;
    this.getFirstTurnPoint();
    this.pCloudDir = this.pVertDir;
    return 1;
  }

  getFirstTurnPoint() {
    for (let f = 1; f <= this.pTurnPointList.count; f++) {
      if (this.pSprite.right < this.pTurnPointList[f]) {
        this.pCurrentTurnPoint = f;
        this.pTurnPoint = this.pTurnPointList[f];
        break;
      }
    }
  }

  initCloud() {
    if (this.pSprite.left > (the.stageRight - the.stageLeft)) {
      this.pVertDir = -1;
      this.pSprite.locH = -40;
      this.pSprite.locV = 260 - random(40);
      this.pMemName = `${this.pMemName.char[`${1}..${this.pMemName.length - 1}`]}${random(4) - 1}`;
      this.pCurrentTurnPoint = 1;
      this.pTurnPoint = this.pTurnPointList[1];
    }
    if (this.pVertDir == -1) {
      tdir = "left";
    } else {
      tdir = "right";
    }
    tTempImg = member(getmemnum(`${this.pMemName}_${tdir}`)).image;
    this.pCloudMember.image = image(tTempImg.width, 60, 8);
    tdestrect = this.pCloudMember.image.rect - tTempImg.rect;
    tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tTempImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tTempImg.height);
    this.pCloudMember.image.copyPixels(tTempImg, tdestrect, tTempImg.rect, propList("ink", 8));
    this.pLoc = this.pSprite.loc;
    this.pSprite.width = tTempImg.width;
  }

  getNextTurnPoint() {
    this.pCurrentTurnPoint = this.pCurrentTurnPoint + 1;
    if (this.pCurrentTurnPoint > this.pTurnPointList.count) {
      this.pCurrentTurnPoint = this.pTurnPointList.count;
    }
    this.pTurnPoint = this.pTurnPointList[this.pCurrentTurnPoint];
  }

  update() {
    if ((this.pSprite.right > this.pTurnPoint) && (this.pSprite.left <= this.pTurnPoint)) {
      this.turn();
      this.pVertDir = 0;
    }
    if (this.pSprite.left == this.pTurnPoint) {
      this.pVertDir = this.pCloudDir * -1;
      this.getNextTurnPoint();
    }
    this.pLoc.locH = this.pLoc.locH + 1;
    if ((this.pLoc.locH % 2) == 0) {
      this.pLoc.locV = this.pLoc.locV + this.pVertDir;
    }
    this.pSprite.loc = this.pLoc;
    if (this.pSprite.left > (the.stageRight - the.stageLeft + 30)) {
      this.initCloud();
    }
  }

  checkCloud() {
    if (this.pSprite.locH > this.pTurnPoint) {
      this.turn();
    } else {
      this.pVertDir = -1;
      this.pSprite.flipH = 0;
    }
  }

  turn() {
    if (this.pVertDir != 0) {
      this.pCloudDir = this.pVertDir;
    }
    if (this.pCloudDir == -1) {
      this.pImg.fill(this.pImg.rect, rgb(255, 255, 255));
      tImg = member(getmemnum(`${this.pMemName}_left`)).image;
      tWidth = this.pSprite.right - this.pTurnPoint;
      tHeigth = (-tWidth / 2) - 1;
      tSource = tImg.rect - rect(0, 0, tWidth, 0);
      tdestrect = tSource + rect(0, (this.pImg.height / 2) - (tSource.height / 2) + tHeigth, 0, (this.pImg.height / 2) - (tSource.height / 2) + tHeigth);
      this.pImg.copyPixels(tImg, tdestrect, tSource, propList("ink", 8));
      tImg = member(getmemnum(`${this.pMemName}_right`)).image;
      tWidth = tImg.width - tWidth;
      tHeigth = -tWidth / 2;
      tSource = rect(tWidth, 0, tImg.width, tImg.height);
      tDest = tSource + rect(0, (this.pImg.height / 2) - (tSource.height / 2) + tHeigth, 0, (this.pImg.height / 2) - (tSource.height / 2) + tHeigth);
      this.pImg.copyPixels(tImg, tDest, tSource, propList("ink", 8));
    } else {
      this.pImg.fill(this.pImg.rect, rgb(255, 255, 255));
      tImg = member(getmemnum(`${this.pMemName}_right`)).image;
      tWidth = this.pSprite.right - this.pTurnPoint;
      tHeigth = (tWidth / 2) + 1;
      tSource = tImg.rect - rect(0, 0, tWidth, 0);
      tdestrect = tSource + rect(0, (this.pImg.height / 2) - (tSource.height / 2) + tHeigth, 0, (this.pImg.height / 2) - (tSource.height / 2) + tHeigth);
      this.pImg.copyPixels(tImg, tdestrect, tSource, propList("ink", 8));
      tImg = member(getmemnum(`${this.pMemName}_left`)).image;
      tWidth = tImg.width - tWidth;
      tHeigth = tWidth / 2;
      tSource = rect(tWidth, 0, tImg.width, tImg.height);
      tDest = tSource + rect(0, (this.pImg.height / 2) - (tSource.height / 2) + tHeigth, 0, (this.pImg.height / 2) - (tSource.height / 2) + tHeigth);
      this.pImg.copyPixels(tImg, tDest, tSource, propList("ink", 8));
    }
  }
}
