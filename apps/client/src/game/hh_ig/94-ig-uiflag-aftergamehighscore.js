export default class {
  showInfo(tWindowList, tdata, tMode) {
    if (!tMode) {
      return 1;
    }
    if (tWindowList.count < 2) {
      return 1;
    }
    const tWndObj = getWindow(tWindowList[2]);
    const tScoreData = tdata.getaProp(Symbol.for("top_level_scores"));
    if (!listp(tScoreData)) {
      return 0;
    }
    const tRankText = EMPTY;
    const tNameText = EMPTY;
    const tScoreText = EMPTY;
    let tOwnPos = 0;
    const tOwnId = tdata.getaProp(Symbol.for("room_index"));
    let tDataCount = tScoreData.count;
    if (tDataCount > 5) {
      tDataCount = 5;
    }
    for (let i = 1; i <= tDataCount; i++) {
      const tItem = tScoreData[i];
      const tOwnUser = (tOwnId > -1) && (tItem.getaProp(Symbol.for("room_index")) == tOwnId);
      let tFontStruct;
      let tElem = tWndObj.getElement(`ig_highscore_rank${i}`);
      if (tElem == 0) {
        return 0;
      }
      if (tOwnUser) {
        tFontStruct = getStructVariable("struct.font.bold");
        tElem.setFont(tFontStruct);
      }
      tElem.setText(`${i}.`);
      tElem = tWndObj.getElement(`ig_highscore_player${i}`);
      if (tElem == 0) {
        return 0;
      }
      if (tOwnUser) {
        tElem.setFont(tFontStruct);
      }
      tElem.setText(tItem.getaProp(Symbol.for("name")));
      tElem = tWndObj.getElement(`ig_highscore_score${i}`);
      if (tElem == 0) {
        return 0;
      }
      if (tOwnUser) {
        tElem.setFont(tFontStruct);
      }
      tElem.setText(tItem.getaProp(Symbol.for("score")));
    }
    return 1;
  }

  getTitleText() {
    return getText("ig_ag_flag_high_title");
  }

  getLayout(tMode) {
    let tLayout;
    if (tMode) {
      tLayout = list("ig_ag_tip_title_exp.window", "ig_ag_highscores_btm.window");
    } else {
      tLayout = list("ig_ag_tip_title.window");
    }
    return tLayout;
  }
}
