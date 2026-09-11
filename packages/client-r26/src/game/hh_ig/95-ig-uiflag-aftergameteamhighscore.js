export default class {
  showInfo(tWindowList, tdata, tMode) {
    if (!tMode) {
      return 1;
    }
    if (tWindowList.count < 2) {
      return 1;
    }
    let tWndObj = getWindow(tWindowList[2]);
    const tThisTeamId = tdata.getaProp(Symbol.for("this_team_id"));
    tdata = tdata.getaProp(Symbol.for("level_team_scores"));
    if (!listp(tdata)) {
      return 0;
    }
    let tCount;
    if (tdata.count < 3) {
      tCount = tdata.count;
    } else {
      tCount = 3;
    }
    for (let i = 1; i <= tCount; i++) {
      tWndObj = getWindow(tWindowList[i * 2]);
      if (tWndObj == 0) {
        return 0;
      }
      const tItem = tdata[i];
      const tPlayers = tItem.getaProp(Symbol.for("players"));
      const tHighlight = tItem.getaProp(Symbol.for("id")) == tThisTeamId;
      let tFontStruct;
      let tElem = tWndObj.getElement("ig_teamhigh_rank");
      if (tElem == 0) {
        return 0;
      }
      if (tHighlight) {
        tFontStruct = getStructVariable("struct.font.bold");
        tElem.setFont(tFontStruct);
      }
      tElem.setText(`${i}.`);
      tElem = tWndObj.getElement("ig_teamhigh_score");
      if (tElem == 0) {
        return 0;
      }
      if (tHighlight) {
        tElem.setFont(tFontStruct);
      }
      tElem.setText(tItem.getaProp(Symbol.for("score")));
      if (tHighlight) {
        tElem = tWndObj.getElement("ig_teamhigh_teamscore");
        if (tElem == 0) {
          return 0;
        }
        tElem.setFont(tFontStruct);
      }
      let tText = EMPTY;
      let tBreak = 0;
      for (let j = 1; j <= tPlayers.count; j++) {
        if (tPlayers[j].length > 14) {
          tText = `${tText}${tPlayers[j].char[`1..12`]}...`;
        } else {
          tText = `${tText}${tPlayers[j]}`;
        }
        if (tBreak) {
          tText = `${tText}${RETURN}`;
        } else {
          if (j < tPlayers.count) {
            tText = `${tText}, `;
          }
        }
        tBreak = !tBreak;
      }
      tElem = tWndObj.getElement("ig_teamhigh_team");
      if (tElem == 0) {
        return 0;
      }
      tElem.setText(tText);
      const tFont = tElem.getFont();
      const tLineHeight = tFont.getaProp(Symbol.for("lineHeight"));
      const tHeight = ((tPlayers.count + 1) / 2 * tLineHeight) + 14;
      tWndObj.resizeTo(tWndObj.getProperty(Symbol.for("width")), tHeight);
    }
    let tY = -1;
    for (let i = 1; i <= tWindowList.count; i++) {
      const tWndObj = getWindow(tWindowList[i]);
      if (tWndObj == 0) {
        return 0;
      }
      if (tY > 0) {
        tWndObj.moveTo(tWndObj.getProperty(Symbol.for("locX")), tY);
      }
      tY = tWndObj.getProperty(Symbol.for("locY")) + tWndObj.getProperty(Symbol.for("height"));
    }
    return 1;
  }

  getTitleText() {
    return getText("ig_ag_flag_teamhigh_title");
  }

  getLayout(tMode) {
    let tLayout;
    if (tMode) {
      tLayout = list("ig_ag_tip_title_exp.window", "ig_ag_teamhigh_mid.window", "ig_ag_teamhigh_brk.window", "ig_ag_teamhigh_mid.window", "ig_ag_teamhigh_brk.window", "ig_ag_teamhigh_mid.window", "ig_ag_teamhigh_btm.window");
    } else {
      tLayout = list("ig_ag_tip_title.window");
    }
    return tLayout;
  }
}
