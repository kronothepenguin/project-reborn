export default class {
  pSongID;
  pSongName;
  pSongAuthor;
  pSongLength;
  pBurnDay;
  pBurnMonth;
  pBurnYear;
  pTextTemplate;

  construct() {
    this.pSongID = 0;
    this.pSongName = EMPTY;
    this.pSongLength = 0;
    this.pBurnDay = EMPTY;
    this.pBurnMonth = EMPTY;
    this.pBurnYear = EMPTY;
    this.pSongAuthor = EMPTY;
    this.pTextTemplate = getText("song_disk_text_template");
    callAncestor(Symbol.for("construct"), [this]);
    return 1;
  }

  deconstruct() {
    callAncestor(Symbol.for("deconstruct"), [this]);
    return 1;
  }

  define(tProps) {
    callAncestor(Symbol.for("define"), [this], tProps);
    if (!voidp(tProps[Symbol.for("props")])) {
      const tdata = tProps[Symbol.for("props")];
      if (!voidp(tdata[Symbol.for("extra")])) {
        this.pSongID = tdata[Symbol.for("extra")];
      }
      if (!voidp(tdata[Symbol.for("stuffdata")])) {
        const tArray = propList("source", tdata[Symbol.for("stuffdata")]);
        executeMessage(Symbol.for("get_disk_data"), tArray);
        if (!voidp(tArray[Symbol.for("author")])) {
          this.pSongAuthor = tArray[Symbol.for("author")];
        }
        if (!voidp(tArray[Symbol.for("burnDay")]) && !voidp(tArray[Symbol.for("burnMonth")]) && !voidp(tArray[Symbol.for("burnYear")])) {
          this.pBurnDay = tArray[Symbol.for("burnDay")];
          this.pBurnMonth = tArray[Symbol.for("burnMonth")];
          this.pBurnYear = tArray[Symbol.for("burnYear")];
        }
        if (!voidp(tArray[Symbol.for("songLength")])) {
          this.pSongLength = tArray[Symbol.for("songLength")];
        }
        if (!voidp(tArray[Symbol.for("songName")])) {
          this.pSongName = tArray[Symbol.for("songName")];
        }
      }
    }
    return 1;
  }

  getInfo() {
    const tInfo = callAncestor(Symbol.for("getInfo"), [this]);
    if (ilk(tInfo) != Symbol.for("propList")) {
      tInfo = propList();
    }
    let tCustom = this.pTextTemplate;
    const tTagList = list("%author%", "%day%", "%month%", "%year%", "%length%", "%name%");
    const tTextList = list(this.pSongAuthor, this.pBurnDay, this.pBurnMonth, this.pBurnYear, this.pSongLength, this.pSongName);
    for (let i = min(tTagList.count, tTextList.count); i >= 1; i--) {
      tCustom = replaceChunks(tCustom, tTagList[i], tTextList[i]);
    }
    tInfo[Symbol.for("custom")] = tCustom;
    return tInfo;
  }

  select() {
    return callAncestor(Symbol.for("select"), [this]);
    return 1;
  }

  setState(tNewState) {
    callAncestor(Symbol.for("setState"), [this], tNewState);
  }
}
