export default class {
  pDateFormat;

  construct() {
    this.pDateFormat = "dd-mm-yyyy";
    this.pUseAMPM = 0;
    return 1;
  }

  deconstruct() {
    return 1;
  }

  define(tDateFormat) {
    if (voidp(tDateFormat)) {
      const tDateType = "dd-mm-yyyy";
    }
    this.pDateFormat = tDateFormat;
  }

  getLocalDateFromStr(tDateStr) {
    if (!stringp(tDateStr)) {
      return 0;
    }
    const tItemDeLim = the.itemDelimiter;
    the.itemDelimiter = "-";
    if (tDateStr.item.count < 3) {
      the.itemDelimiter = ".";
    }
    const tLocalDate = this.getLocalDate(tDateStr.item[1], tDateStr.item[2], tDateStr.item[3]);
    the.itemDelimiter = tItemDeLim;
    return tLocalDate;
  }

  getLocalDate(tDay, tMonth, tYear) {
    if (voidp(tDay) || voidp(tMonth) || voidp(tYear)) {
      return this.pDateFormat;
    }
    let tDate = this.pDateFormat;
    tDate = replaceChunks(tDate, "dd", integer(tDay));
    tDate = replaceChunks(tDate, "mm", integer(tMonth));
    tDate = replaceChunks(tDate, "yyyy", integer(tYear));
    return tDate;
  }
}
