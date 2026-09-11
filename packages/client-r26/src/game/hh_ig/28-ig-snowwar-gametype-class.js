export default class {
  getAction(tKey, tParam1, tParam2) {
    switch (tKey) {
      case Symbol.for("get_room_class"):
        return "Snowwar Arena Class";
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
      case Symbol.for("get_bottombar_layout"):
        return 0;
        return "sw_ui.window";
    }
    return error(this, `Undefined action for this type: ${tKey}`, Symbol.for("getAction"));
  }

  getCreateDefaults() {
    const tParams = propList();
    tParams.addProp(Symbol.for("private"), propList(Symbol.for("ilk"), Symbol.for("integer"), Symbol.for("default"), 0));
    tParams.addProp(Symbol.for("number_of_teams"), propList(Symbol.for("ilk"), Symbol.for("integer"), Symbol.for("min"), 1, Symbol.for("max"), 4, Symbol.for("default"), 2));
    tParams.addProp(Symbol.for("duration"), propList(Symbol.for("ilk"), Symbol.for("integer"), Symbol.for("default"), 120));
    return tParams;
  }

  getIconImage() {
    const tName = "ig_icon_gamemode_0";
    const tMemNum = getmemnum(tName);
    if (tMemNum == 0) {
      return 0;
    }
    const tmember = member(tMemNum);
    return tmember.image;
  }

  getCastList() {
    const tCastList = list("hh_ig_gamesys", "hh_ig_game_snowwar", "hh_ig_game_snowwar_ui", "hh_ig_game_snowwar_room");
    return tCastList;
  }

  parseCreateGameInfo(tdata, tConn) {
    tdata.setaProp(Symbol.for("use_1_team"), 1);
    tdata.setaProp(Symbol.for("game_type_icon"), this.getIconImage());
    const tParams = this.getCreateDefaults();
    if (tParams == 0) {
      return 0;
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
    tdata.setaProp(Symbol.for("level_name"), getText(`sw_fieldname_${tdata.getaProp(Symbol.for("field_type"))}`));
    return tdata;
  }

  parseLongData(tdata, tConn) {
    tdata.setaProp(Symbol.for("level_name"), getText(`sw_fieldname_${tdata.getaProp(Symbol.for("field_type"))}`));
    tdata.setaProp(Symbol.for("duration"), tConn.GetIntFrom());
    return tdata;
  }

  parseShortData(tdata, tConn) {
    tdata.setaProp(Symbol.for("level_name"), getText(`sw_fieldname_${tdata.getaProp(Symbol.for("field_type"))}`));
    return tdata;
  }
}
