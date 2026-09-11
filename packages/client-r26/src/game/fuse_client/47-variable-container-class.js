export default class {
  pItemList;

  construct() {
    this.pItemList = propList();
    this.pItemList.sort();
    return 1;
  }

  deconstruct() {
    this.pItemList = propList();
    return 1;
  }

  create(tVariable, tValue) {
    if (!stringp(tVariable) && !symbolp(tVariable)) {
      return error(this, `String or symbol expected: ${tVariable}`, Symbol.for("create"), Symbol.for("major"));
    }
    this.pItemList[tVariable] = tValue;
    return 1;
  }

  set(tVariable, tValue) {
    if (!stringp(tVariable) && !symbolp(tVariable)) {
      return error(this, `String or symbol expected: ${tVariable}`, Symbol.for("set"), Symbol.for("major"));
    }
    this.pItemList[tVariable] = tValue;
    return 1;
  }

  GET(tVariable, tDefault) {
    let tValue = this.pItemList[tVariable];
    if (voidp(tValue)) {
      let tError = `Variable not found: ${QUOTE}${tVariable}${QUOTE}`;
      if (!voidp(tDefault)) {
        tValue = tDefault;
        tError = `${tError}${RETURN}Using given default: ${tDefault}`;
      } else {
        tValue = 0;
      }
      error(this, tError, Symbol.for("GET"), Symbol.for("minor"));
    }
    return tValue;
  }

  getInt(tVariable, tDefault) {
    let tValue = integer(this.pItemList[tVariable]);
    if (!integerp(tValue)) {
      let tError = `Variable not found: ${QUOTE}${tVariable}${QUOTE}`;
      if (!voidp(tDefault)) {
        tValue = tDefault;
        tError = `${tError}${RETURN}Using given default: ${tDefault}`;
      }
      error(this, tError, Symbol.for("getInt"), Symbol.for("minor"));
    }
    return tValue;
  }

  GetValue(tVariable, tDefault) {
    let tValue = value(this.pItemList[tVariable]);
    if (voidp(tValue)) {
      let tError = `Variable not found: ${QUOTE}${tVariable}${QUOTE}`;
      if (!voidp(tDefault)) {
        tValue = tDefault;
        tError = `${tError}${RETURN}Using given default: ${tDefault}`;
      }
      error(this, tError, Symbol.for("GetValue"), Symbol.for("minor"));
    }
    if ((ilk(tValue) == Symbol.for("list")) || (ilk(tValue) == Symbol.for("propList"))) {
      return tValue.duplicate();
    }
    return tValue;
  }

  Remove(tVariable) {
    return this.pItemList.deleteProp(tVariable);
  }

  exists(tVariable) {
    return !voidp(this.pItemList[tVariable]);
  }

  dump(tField, tDelimiter, tOverride) {
    const tStr = field(tField);
    const tDelim = the.itemDelimiter;
    if (voidp(tDelimiter)) {
      tDelimiter = RETURN;
    }
    the.itemDelimiter = tDelimiter;
    if (voidp(tOverride)) {
      tOverride = 1;
    }
    for (let i = 1; i <= tStr.item.count; i++) {
      const tPair = tStr.item[i];
      if ((tPair.word[1].char[1] != "#") && (tPair != EMPTY)) {
        the.itemDelimiter = "=";
        const tProp = tPair.item[1].word[`1..${tPair.item[1].word.count}`];
        let tValue = tPair.item[`2..${tPair.item.count}`];
        tValue = tValue.word[`1..${tValue.word.count}`];
        if (!(tValue.contains(SPACE))) {
          if (tValue.char[1] == "#") {
            tValue = symbol(chars(tValue, 2, length(tValue)));
          } else {
            if (integerp(integer(tValue))) {
              if (length(string(integer(tValue))) == length(tValue)) {
                tValue = integer(tValue);
              }
            }
          }
        } else {
          if (floatp(float(tValue))) {
            tValue = float(tValue);
          }
        }
        if (stringp(tValue)) {
          for (let j = 1; j <= length(tValue); j++) {
            switch (charToNum(tValue.char[j])) {
            }
          }
        }
        const tPos = this.pItemList.findPos(tProp);
        if (tOverride || voidp(tPos)) {
          this.pItemList[tProp] = tValue;
        }
        the.itemDelimiter = tDelimiter;
      }
    }
    the.itemDelimiter = tDelim;
    return 1;
  }

  clear() {
    this.pItemList = propList();
  }
}
