export default class {
  getAction(tKey, tParam1, tParam2) {
    switch (tKey) {
      case Symbol.for("get_room_class"):
        return "BB Arena Class";
      case Symbol.for("get_create_defaults"):
        return this.getCreateDefaults();
      case Symbol.for("get_icon_image"):
        return this.getIconImage();
      case Symbol.for("get_casts"):
        return this.getCastList();
      case Symbol.for("parse_create_game_info"):
        return this.parseCreateGameInfo(tParam1, tParam2);
      case Symbol.for("parse_short_data"):
        return this.parseShortData(tParam1, tParam2);
      case Symbol.for("parse_long_data"):
        return this.parseLongData(tParam1, tParam2);
      case Symbol.for("set_create_property"):
        return this.setCreateProperty(tParam1, tParam2);
      case Symbol.for("get_bottombar_layout"):
        return "bb_ui.window";
    }
    return error(this, `Undefined action for this type: ${tKey}`, Symbol.for("getAction"));
  }

  setCreateProperty(tKey, tValue) {
    put(`* setCreateProperty ${tKey} ${tValue}`);
    switch (tKey) {
      case Symbol.for("ig_checkbox_powerup"):
        break;
    }
    return 1;
  }

  getCreateDefaults() {
    const tParams = propList();
    tParams.addProp(Symbol.for("private"), propList(Symbol.for("ilk"), Symbol.for("integer"), Symbol.for("default"), 0));
    tParams.addProp(Symbol.for("number_of_teams"), propList(Symbol.for("ilk"), Symbol.for("integer"), Symbol.for("min"), 2, Symbol.for("max"), 4, Symbol.for("default"), 2));
    tParams.addProp(Symbol.for("bb_pups"), propList(Symbol.for("ilk"), Symbol.for("list"), Symbol.for("default"), list(1, 2, 3, 4, 5, 6, 7, 8)));
    return tParams;
  }

  getIconImage() {
    const tName = "ig_icon_gamemode_1";
    const tMemNum = getmemnum(tName);
    if (tMemNum == 0) {
      return 0;
    }
    const tmember = member(tMemNum);
    return tmember.image;
  }

  getCastList() {
    const tCastList = list("hh_ig_gamesys", "hh_ig_game_bb", "hh_ig_game_bb_ui", "hh_ig_game_bb_room");
    return tCastList;
  }

  parseCreateGameInfo(tdata, tConn) {
    tdata.setaProp(Symbol.for("use_1_team"), 0);
    tdata.setaProp(Symbol.for("game_type_icon"), this.getIconImage());
    tdata.setaProp(Symbol.for("allow_powerups"), tConn.GetIntFrom());
    const tParams = this.getCreateDefaults();
    if (tParams == 0) {
      return 0;
    }
    if (!tdata.getaProp(Symbol.for("allow_powerups"))) {
      tdata.setaProp(Symbol.for("bb_pups"), list());
    }
    for (let i = 1; i <= tParams.count; i++) {
      const tKey = tParams.getPropAt(i);
      if (tdata.findPos(tKey) == 0) {
        const tItem = tParams[i];
        if (tItem != 0) {
          tdata.setaProp(tKey, tItem.getaProp(Symbol.for("default")));
        }
      }
    }
    tdata.setaProp(Symbol.for("level_name"), getText(`bb_fieldname_${tdata.getaProp(Symbol.for("field_type"))}`));
    return tdata;
  }

  parseLongData(tdata, tConn) {
    tdata.setaProp(Symbol.for("level_name"), getText(`bb_fieldname_${tdata.getaProp(Symbol.for("field_type"))}`));
    const tList = list();
    const tCount = tConn.GetIntFrom();
    for (let i = 1; i <= tCount; i++) {
      tList.append(tConn.GetIntFrom());
    }
    tdata.setaProp(Symbol.for("bb_pups"), tList);
    return tdata;
  }

  parseShortData(tdata, tConn) {
    tdata.setaProp(Symbol.for("level_name"), getText(`bb_fieldname_${tdata.getaProp(Symbol.for("field_type"))}`));
    return tdata;
  }
}
