export default class {
  pItemList;

  GET(tKey, tDefault) {
    let tText = this.pItemList[tKey];
    if (voidp(tText)) {
      let tError = `Text not found: ${tKey}`;
      if (!voidp(tDefault)) {
        tText = tDefault;
        tError = `${tError}${RETURN}Using given default: ${tDefault}`;
      } else {
        tText = tKey;
      }
      error(this, tError, Symbol.for("GET"), Symbol.for("minor"));
    }
    tText = getStringServices().convertSpecialChars(tText);
    return tText;
  }

  dump(tField, tDelimiter) {
    if (!memberExists(tField)) {
      return error(this, `Field member expected: ${tField}`, Symbol.for("dump"), Symbol.for("major"));
    }
    let tRawStr = field(tField);
    tRawStr = decodeUTF8(tRawStr);
    const tStrServices = getStringServices();
    const tSpecialChunks = propList("\r", RETURN, "\t", TAB, "\s", SPACE, "<BR>", RETURN);
    const tLineChunks = list();
    const tMaxLinesPerChunk = 100;
    const tTotalChunkCount = (tRawStr.line.count / tMaxLinesPerChunk) + 1;
    for (let tChunk = 1; tChunk <= tTotalChunkCount; tChunk++) {
      const tStartChunkIndex = ((tChunk - 1) * tMaxLinesPerChunk) + 1;
      const tEndChunkIndex = tStartChunkIndex + tMaxLinesPerChunk - 1;
      const tLines = tRawStr.line[`${tStartChunkIndex}..${tEndChunkIndex}`];
      tLineChunks[tChunk] = tLines;
    }
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = "=";
    for (const tStr of tLineChunks) {
      const tLineCount = tStr.line.count;
      for (let tLineNo = 1; tLineNo <= tLineCount; tLineNo++) {
        const tPair = tStr.line[tLineNo];
        if ((chars(tPair, 1, 1) != "#") && (tPair != EMPTY)) {
          const tProp = tPair.item[1];
          let tValue = tPair.item[`2..${tPair.item.count}`];
          for (let k = 1; k <= tSpecialChunks.count; k++) {
            const tMark = tSpecialChunks.getPropAt(k);
            if (tValue.contains(tMark)) {
              tValue = tStrServices.replaceChunks(tValue, tMark, tSpecialChunks[k]);
            }
          }
          this.pItemList[tProp] = tValue;
        }
      }
    }
    the.itemDelimiter = tDelim;
    return 1;
  }
}
