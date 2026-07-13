export default class {
  pChatImage;
  pListLine;
  pWriter;
  pChatWidth;
  pHighlightUserID;
  pMaxHeight;
  pMargin;

  construct() {
    this.pChatData = list();
    this.pChatWidth = 185;
    this.pMargin = 3;
    this.pMaxHeight = getIntVariable("im.chat.length.max");
    this.clearImage();
    let tFont = getStructVariable("struct.font.plain");
    tFont.setaProp(Symbol.for("wordWrap"), 1);
    tFont.setaProp(Symbol.for("rect"), rect(0, 0, this.pChatWidth - (2 * this.pMargin), 0));
    let tID = getUniqueID();
    createWriter(tID, tFont);
    this.pWriter = getWriter(tID);
    this.pWriter.define(tFont);
    this.pHighlightUserID = getObject(Symbol.for("session")).GET("user_user_id");
    return 1;
  }

  deconstruct() {
    removeObject(this.pWriter.getID());
    return 1;
  }

  setWidth(tWidth) {
    this.pChatWidth = tWidth;
  }

  renderChatEntry(tEntry, tPos) {
    let ttype = tEntry.getaProp(Symbol.for("type"));
    let tUserID = tEntry.getaProp(Symbol.for("userID"));
    let tText = tEntry.getaProp(Symbol.for("Msg"));
    let tUseTime = (ttype == Symbol.for("message")) || (ttype == Symbol.for("invitation"));
    if (tUseTime) {
      tText = `${tEntry.getaProp(Symbol.for("time"))} ${tText}`;
    }
    let tColor;
    switch (ttype) {
      case Symbol.for("invitation"):
        tColor = getVariable("im.color.invitation", "FFFFFF");
        break;
      case Symbol.for("notification"):
        tColor = getVariable("im.color.notification", "FFFFFF");
        break;
      case Symbol.for("error"):
        tColor = getVariable("im.color.error", "FFFFFF");
        break;
      case Symbol.for("message"):
        if (tUserID == this.pHighlightUserID) {
          tColor = getVariable("im.color.sender", "FFFFFF");
        } else {
          tColor = getVariable("im.color.receiver", "FFFFFF");
        }
        break;
      default:
        tColor = "FFFFFF";
        break;
    }
    let tTextImage = this.pWriter.render(tText).duplicate();
    let tEntryImage = image(this.pChatWidth, tTextImage.height + (2 * this.pMargin), 8);
    tEntryImage.fill(tEntryImage.rect, rgb(tColor));
    let tTargetRect = tTextImage.rect + rect(this.pMargin, this.pMargin, this.pMargin, this.pMargin);
    tEntryImage.copyPixels(tTextImage, tTargetRect, tTextImage.rect);
    let tNewHeight = this.pChatImage.height + tEntryImage.height;
    if (tNewHeight > this.pMaxHeight) {
      tNewHeight = this.pMaxHeight;
    }
    let tNewChatImage = image(this.pChatWidth, tNewHeight, 8);
    if (tPos == Symbol.for("start")) {
      if (tNewHeight == this.pMaxHeight) {
        return 0;
      }
      tNewChatImage.copyPixels(tEntryImage, tEntryImage.rect, tEntryImage.rect);
      let tTargetRect = rect(0, tEntryImage.height, this.pChatWidth, tEntryImage.height + this.pChatImage.height);
      tNewChatImage.copyPixels(this.pChatImage, tTargetRect, this.pChatImage.rect);
    } else {
      let tTop = tNewChatImage.height - tEntryImage.height - this.pChatImage.height;
      let tBottom = tTop + this.pChatImage.height;
      let tTargetRect = rect(0, tTop, this.pChatImage.width, tBottom);
      tNewChatImage.copyPixels(this.pChatImage, tTargetRect, this.pChatImage.rect);
      tTop = tNewChatImage.height - tEntryImage.height;
      tTargetRect = rect(0, tTop, this.pChatWidth, tNewChatImage.height);
      tNewChatImage.copyPixels(tEntryImage, tTargetRect, tEntryImage.rect);
    }
    this.pChatImage = tNewChatImage;
    return 1;
  }

  clearImage() {
    this.pChatImage = image(this.pChatWidth, 0, 8);
  }

  getChatImage() {
    return this.pChatImage;
  }
}
