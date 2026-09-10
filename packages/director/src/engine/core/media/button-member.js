import { MemberObject } from "../member.js";

/**
 * Button cast member (Chapter 6: Media Types — "Button").
 *
 * Represents a button or check box cast member.
 *
 * You can add a button cast member to a movie by using the Movie object's newMember() method.
 *
 * Property summary: `hilite`.
 *
 * See also: Member.
 */
export class ButtonMember extends MemberObject {
  /**
   * Member property; toggles the highlight state of a button cast member sprite. Read/write.
   * When a button sprite is highlighted, it appears with its labels and its content reversed
   * (inverted).
   */
  hilite = false;
}