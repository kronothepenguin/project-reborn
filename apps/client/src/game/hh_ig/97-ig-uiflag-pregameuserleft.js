export default class {
  showInfo(tWindowList, tdata, tMode) {
    put("PreGameUserLeft showInfo");
    return 1;
  }

  getTitleText() {
    return getText("ig_ag_flag_user_left");
  }

  getLayout(tMode) {
    const tLayout = list("ig_ag_tip_title.window");
    return tLayout;
  }
}
