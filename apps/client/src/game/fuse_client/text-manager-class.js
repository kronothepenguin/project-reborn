import {
  chars,
  EMPTY,
  field,
  itemOf,
  list,
  propList,
  RETURN,
  SPACE,
  TAB,
  the,
  VOID,
  voidp,
} from "../../director";

export default function () {
  let tText, tError, tRawStr, tStrServices, tSpecialChunks, tLineChunks;
  let tMaxLinesPerChunk, tTotalChunkCount, tDelim;
  let tStr, tLineCount, tPair, tProp, tValue, tMark, tStartChunkIndex, tEndChunkIndex, tLines, tChunk, tLineNo, k;

  return {
    pItemList: VOID,

    GET(tKey, tDefault) {
      tText = this.pItemList[tKey];
      if (voidp(tText)) {
        tError = `Text not found: ${tKey}`;
        if (!voidp(tDefault)) {
          tText = tDefault;
          tError = tError + RETURN + `Using given default: ${tDefault}`;
        } else {
          tText = tKey;
        }
        _director.error(this, tError, Symbol.for("GET"), Symbol.for("minor"));
      }
      tText = _director.getStringServices().convertSpecialChars(tText);
      return tText;
    },

    dump(tField, tDelimiter) {
      if (!_director.memberExists(tField)) {
        return _director.error(this, `Field member expected: ${tField}`, Symbol.for("dump"), Symbol.for("major"));
      }
      tRawStr = field(tField);
      tRawStr = _director.decodeUTF8(tRawStr);
      tStrServices = _director.getStringServices();
      tSpecialChunks = propList();
      tSpecialChunks.setaProp(Symbol.for("\r"), RETURN);
      tSpecialChunks.setaProp(Symbol.for("\t"), TAB);
      tSpecialChunks.setaProp(Symbol.for("\s"), SPACE);
      tSpecialChunks.setaProp(Symbol.for("<BR>"), RETURN);
      tLineChunks = list();
      tMaxLinesPerChunk = 100;
      tTotalChunkCount = Math.floor(tRawStr.line.count / tMaxLinesPerChunk) + 1;
      for (tChunk = 1; tChunk <= tTotalChunkCount; tChunk++) {
        tStartChunkIndex = ((tChunk - 1) * tMaxLinesPerChunk) + 1;
        tEndChunkIndex = tStartChunkIndex + tMaxLinesPerChunk - 1;
        tLines = tRawStr.line.slice(tStartChunkIndex, tEndChunkIndex);
        tLineChunks[tChunk] = tLines;
      }
      tDelim = the.itemDelimiter;
      the.itemDelimiter = "=";
      for (tStr of tLineChunks) {
        tLineCount = tStr.line.count;
        for (tLineNo = 1; tLineNo <= tLineCount; tLineNo++) {
          tPair = tStr.line[tLineNo];
          if ((chars(tPair, 1, 1) !== "#") && (tPair !== EMPTY)) {
            tProp = itemOf(tPair)[1];
            tValue = itemOf(tPair).slice(2, itemOf(tPair).count);
            for (k = 1; k <= tSpecialChunks.count; k++) {
              tMark = tSpecialChunks.getPropAt(k);
              if (tValue.includes(tMark)) {
                tValue = tStrServices.replaceChunks(tValue, tMark, tSpecialChunks[k]);
              }
            }
            this.pItemList[tProp] = tValue;
          }
        }
      }
      the.itemDelimiter = tDelim;
      return 1;
    },
  };
}
