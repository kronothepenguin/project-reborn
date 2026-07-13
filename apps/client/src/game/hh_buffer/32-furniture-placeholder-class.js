export default class {
  pDelay;
  pFrame;
  pItem;
  pPart;
  pData;
  pMaxFrames;

  prepare(tdata) {
    if (this.pSprList.count < 1) {
      return 0;
    }
    this.pMaxFrames = 6;
    tDelim = the.itemDelimiter;
    the.itemDelimiter = "_";
    tName = this.pSprList[1].member.name;
    this.pItem = tName.item[`${1}..${tName.item.count - 6}`];
    this.pPart = tName.item[tName.item.count - 5];
    this.pData = tName.item[`${tName.item.count - 4}..${tName.item.count - 1}`];
    the.itemDelimiter = tDelim;
    this.pFrame = random(this.pMaxFrames) - 1;
    this.pDelay = 0;
    this.setAnimMembersToFrame();
    pTimer = 1;
    return 1;
  }

  update() {
    this.pDelay = this.pDelay + 1;
    if (this.pDelay > 4) {
      this.pFrame = (this.pFrame + 1) % this.pMaxFrames;
      this.setAnimMembersToFrame(this.pFrame);
      this.pDelay = 0;
    }
  }

  setAnimMembersToFrame(tFrame) {
    if (this.pSprList.count < 1) {
      return 0;
    }
    tLayerChar = "a";
    tNewName = `${this.pItem}_${tLayerChar}_${this.pData}_${tFrame}`;
    if (memberExists(tNewName)) {
      tmember = member(getmemnum(tNewName));
      this.pSprList[1].castNum = tmember.number;
      this.pSprList[1].width = tmember.width;
      this.pSprList[1].height = tmember.height;
    }
  }
}
