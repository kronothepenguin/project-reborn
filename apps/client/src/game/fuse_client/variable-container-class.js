import {
  EMPTY,
  RETURN,
  SPACE,
  charToNum,
  chars,
  field,
  ilk,
  integer,
  integerp,
  length,
  propList,
  string,
  stringp,
  symbol,
  symbolp,
  the,
  value,
  voidp,
} from "../../director";

export default function () {
  let tStr, tDelim, tPair, tProp, tValue, tPos, tError, i, j;

  return {
    construct() {
      this.pItemList = propList();
      this.pItemList.sort();
      return 1;
    },

    deconstruct() {
      this.pItemList = propList();
      return 1;
    },

    create(tVariable, tValue) {
      if (!stringp(tVariable) && !symbolp(tVariable)) {
        return _director.error(this, "String or symbol expected: " + tVariable, Symbol.for("create"), Symbol.for("major"));
      }
      this.pItemList[tVariable] = tValue;
      return 1;
    },

    set(tVariable, tValue) {
      if (!stringp(tVariable) && !symbolp(tVariable)) {
        return _director.error(this, "String or symbol expected: " + tVariable, Symbol.for("set"), Symbol.for("major"));
      }
      this.pItemList[tVariable] = tValue;
      return 1;
    },

    GET(tVariable, tDefault) {
      tValue = this.pItemList[tVariable];
      if (voidp(tValue)) {
        tError = "Variable not found:" + SPACE + QUOTE + tVariable + QUOTE;
        if (!voidp(tDefault)) {
          tValue = tDefault;
          tError = tError + RETURN + "Using given default:" + SPACE + tDefault;
        } else {
          tValue = 0;
        }
        _director.error(this, tError, Symbol.for("GET"), Symbol.for("minor"));
      }
      return tValue;
    },

    getInt(tVariable, tDefault) {
      tValue = integer(this.pItemList[tVariable]);
      if (!integerp(tValue)) {
        tError = "Variable not found:" + SPACE + QUOTE + tVariable + QUOTE;
        if (!voidp(tDefault)) {
          tValue = tDefault;
          tError = tError + RETURN + "Using given default:" + SPACE + tDefault;
        }
        _director.error(this, tError, Symbol.for("getInt"), Symbol.for("minor"));
      }
      return tValue;
    },

    GetValue(tVariable, tDefault) {
      tValue = value(this.pItemList[tVariable]);
      if (voidp(tValue)) {
        tError = "Variable not found:" + SPACE + QUOTE + tVariable + QUOTE;
        if (!voidp(tDefault)) {
          tValue = tDefault;
          tError = tError + RETURN + "Using given default:" + SPACE + tDefault;
        }
        _director.error(this, tError, Symbol.for("GetValue"), Symbol.for("minor"));
      }
      if (ilk(tValue) === Symbol.for("list") || ilk(tValue) === Symbol.for("propList")) {
        return tValue.duplicate();
      }
      return tValue;
    },

    Remove(tVariable) {
      return this.pItemList.deleteProp(tVariable);
    },

    exists(tVariable) {
      return !voidp(this.pItemList[tVariable]);
    },

    dump(tField, tDelimiter, tOverride) {
      tStr = field(tField);
      tDelim = the.itemDelimiter;
      if (voidp(tDelimiter)) {
        tDelimiter = RETURN;
      }
      the.itemDelimiter = tDelimiter;
      if (voidp(tOverride)) {
        tOverride = 1;
      }
      for (i = 1; i <= itemOf(tStr).count; i++) {
        tPair = itemOf(tStr)[i];
        if (wordOf(tPair)[1].char[1] !== "#" && tPair !== EMPTY) {
          the.itemDelimiter = "=";
          tProp = wordOf(itemOf(tPair)[1]).slice(1, wordOf(itemOf(tPair)[1]).count);
          tValue = itemOf(tPair).slice(2, itemOf(tPair).count);
          tValue = wordOf(tValue).slice(1, wordOf(tValue).count);
          if (!tValue.includes(SPACE)) {
            if (charOf(tValue)[1] === "#") {
              tValue = symbol(chars(tValue, 2, length(tValue)));
            } else {
              if (integerp(integer(tValue))) {
                if (length(string(integer(tValue))) === length(tValue)) {
                  tValue = integer(tValue);
                }
              }
            }
          } else {
            if (!isNaN(parseFloat(tValue)) && isFinite(tValue)) {
              tValue = parseFloat(tValue);
            }
          }
          if (stringp(tValue)) {
            for (j = 1; j <= length(tValue); j++) {
              switch (charToNum(charOf(tValue)[j])) {
              }
            }
          }
          tPos = this.pItemList.findPos(tProp);
          if (tOverride || voidp(tPos)) {
            this.pItemList[tProp] = tValue;
          }
          the.itemDelimiter = tDelimiter;
        }
      }
      the.itemDelimiter = tDelim;
      return 1;
    },

    clear() {
      this.pItemList = propList();
    },
  };
}
