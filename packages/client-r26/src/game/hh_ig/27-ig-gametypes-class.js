export default class {
  pGameTypeObjectList;

  construct() {
    pGameTypeObjectList = propList();
    return 1;
  }

  deconstruct() {
    pGameTypeObjectList = propList();
    return this.ancestor.deconstruct();
  }

  getGameTypeCount() {
    return 3;
  }

  convertGamePropsForCreate(tGameType, tParams) {
    const tFormat = this.getAction(tGameType, Symbol.for("get_create_defaults"));
    if (!listp(tFormat)) {
      return 0;
    }
    if (!listp(tParams)) {
      return 0;
    }
    const tOutputList = list();
    for (let i = 1; i <= tFormat.count; i++) {
      const tFormatItem = tFormat[i];
      const tFormatKey = tFormat.getPropAt(i);
      const tFormatIlk = tFormatItem.getaProp(Symbol.for("ilk"));
      let tParamValue;
      if (tParams.findPos(tFormatKey) == 0) {
        return error(this, `${tFormatKey} not defined!`, Symbol.for("convertGamePropsForCreate"));
      } else {
        tParamValue = tParams.getaProp(tFormatKey);
      }
      if (ilk(tParamValue) != tFormatIlk) {
        return error(this, `${tFormatKey} type mismatch. ${ilk(tParamValue)} ${tFormatIlk}`, Symbol.for("convertGamePropsForCreate"));
      }
      switch (tFormatIlk) {
        case Symbol.for("integer"):
          const tMax = tFormatItem.getaProp(Symbol.for("max"));
          if (!voidp(tMax) && (tParamValue > tMax)) {
            return 0;
          }
          const tMin = tFormatItem.getaProp(Symbol.for("min"));
          if (!voidp(tMin) && (tParamValue < tMin)) {
            return 0;
          }
          tOutputList.append(tParamValue);
          break;
        case Symbol.for("string"):
          if (tParamValue == EMPTY) {
            return 0;
          }
          tOutputList.append(tParamValue);
          break;
        case Symbol.for("list"):
          if (tParamValue == EMPTY) {
            return 0;
          }
          const tCount = tParamValue.count;
          tOutputList.append(tCount);
          for (let j = 1; j <= tCount; j++) {
            tOutputList.append(tParamValue[j]);
          }
          break;
        case Symbol.for("not_for_server"):
          nothing();
          break;
      }
    }
    return tOutputList;
  }

  getAction(tGameType, tKey, tParam1, tParam2) {
    const tTypeObject = this.getGameTypeInformation(tGameType);
    if (tTypeObject == 0) {
      return 0;
    }
    return tTypeObject.getAction(tKey, tParam1, tParam2);
  }

  getGameTypeString(tGameType) {
    switch (tGameType) {
      case 0:
        return "Snowwar";
      case 1:
        return "BB";
      case 2:
        return "GemHunt";
    }
    return 0;
  }

  getGameTypeInformation(tGameType) {
    if (voidp(tGameType)) {
      return 0;
    }
    let tTypeObject = pGameTypeObjectList.getaProp(tGameType);
    if (objectp(tTypeObject)) {
      return tTypeObject;
    }
    const tClass = `IG${this.getGameTypeString(tGameType)}GameType Class`;
    tTypeObject = createObject(Symbol.for("temp"), tClass);
    if (!objectp(tTypeObject)) {
      return error(this, `Game type information class unavailable for game type: ${tGameType}`, Symbol.for("getGameTypeInformation"));
    }
    pGameTypeObjectList.setaProp(tGameType, tTypeObject);
    return tTypeObject;
  }
}
