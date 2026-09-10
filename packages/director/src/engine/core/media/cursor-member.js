import { MemberObject } from "../member.js";
import { Point } from "../../base/point.js";

/**
 * Cursor cast member (Chapter 6: Media Types — "Cursor").
 *
 * Represents a cursor cast member.
 *
 * You can add a cursor cast member to a movie by using the Movie object's newMember() method.
 *
 * Property summary: `castMemberList`, `cursorSize`, `hotSpot`, `interval`.
 *
 * See also: Member.
 */
export class CursorMember extends MemberObject {
  /**
   * Cursor cast member property; contains a list of the cast members in the cursor animation.
   * Read/write.
   * Cast members in the cursor animation can be 1-bit bitmaps. For best results, they should be
   * 16 pixels square, or multiples of 16 pixels square.
   */
  castMemberList = [];

  /**
   * Cursor cast member property; contains the width and height of the cursor, in pixels.
   * Read/write.
   * The cursorSize values must be in increments of 16 pixels each and between 1 and 32
   * pixels. Generally, only the first cast member in a cursor animation needs to be sized.
   */
  cursorSize = new Point();

  /**
   * Cursor cast member property; contains the x,y coordinates of the cursor's hot spot,
   * the point in the cursor image that is reported to the system as the cursor's location.
   * Read/write.
   */
  hotSpot = new Point();

  /**
   * Cursor cast member property; contains the number of milliseconds the cursor will display
   * each cast member in the cursor animation. Read/write.
   */
  interval = 100;
}