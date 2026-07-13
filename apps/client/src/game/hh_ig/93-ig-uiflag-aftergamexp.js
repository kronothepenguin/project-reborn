export default class {
  pXP;

  showInfo(tWindowList, tdata, tMode) {
    if (!listp(tdata)) {
      return 0;
    }
    this.pXP = tdata.getaProp(Symbol.for("xp_gained"));
    if (tWindowList.count < 1) {
      return 0;
    }
    let tWndObj = getWindow(tWindowList[1]);
    if (tWndObj == 0) {
      return 0;
    }
    this.ancestor.setTitleField(tWindowList[1]);
    if (!tMode) {
      return 1;
    }
    if (tWindowList.count < 2) {
      return 1;
    }
    tWndObj = getWindow(tWindowList[2]);
    let tElem = tWndObj.getElement("ig_tip_xp_today_amount");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(replaceChunks(getText("ig_tip_xp_value"), "\xp", string(tdata.getaProp(Symbol.for("xp_today")))));
    tElem = tWndObj.getElement("ig_tip_xp_month_amount");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(replaceChunks(getText("ig_tip_xp_value"), "\xp", string(tdata.getaProp(Symbol.for("xp_month")))));
    tElem = tWndObj.getElement("ig_tip_xp_alltime_amount");
    if (tElem == 0) {
      return 0;
    }
    tElem.setText(replaceChunks(getText("ig_tip_xp_value"), "\xp", string(tdata.getaProp(Symbol.for("xp_total")))));
    return 1;
  }

  getTitleText() {
    if (this.pXP == VOID) {
      this.pXP = 0;
    }
    return replaceChunks(getText("ig_ag_flag_xp_title"), "\xp", this.pXP);
  }

  getLayout(tMode) {
    let tLayout;
    if (tMode) {
      tLayout = list("ig_ag_tip_title_exp.window", "ig_ag_tip_xp.window");
    } else {
      tLayout = list("ig_ag_tip_title.window");
    }
    return tLayout;
  }
}
