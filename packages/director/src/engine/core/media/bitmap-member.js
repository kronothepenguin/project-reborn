import { MemberObject } from "../member.js";
import { Rect } from "../../base/rect.js";

/**
 * Bitmap cast member (Chapter 6: Media Types — "Bitmap").
 *
 * Represents a bitmap cast member.
 *
 * Method summary: `crop()` (Image), `pictureP()`.
 * Property summary: `alphaThreshold`, `backColor`, `blend` (Sprite), `depth` (Bitmap), `dither`,
 * `foreColor`, `image` (Image), `imageCompression`, `imageQuality`, `palette`, `picture`
 * (Member), `rect` (Image), `trimWhiteSpace`, `useAlpha`.
 */
export class BitmapMember extends MemberObject {
  /**
   * Bitmap cast member property; governs how the bitmap's alpha channel affects hit detection.
   * This property is a value from 0 to 255, that exactly matches alpha values in the alpha
   * channel for a 32-bit bitmap image. For a given alphaThreshold setting, Director detects a
   * mouse click if the pixel value of the alpha map at that point is equal to or greater than
   * the threshold. Setting the alphaThreshold to 0 makes all pixels opaque to hit detection
   * regardless of the contents of the alpha channel.
   */
  alphaThreshold = 0;

  /**
   * Sprite property; sets the background color of a specified sprite according to the color
   * value assigned. Read/write. The backColor value ranges from 0 to 255 for 8-bit color and
   * from 0 to 15 for 4-bit color. The numbers correspond to the index number of the background
   * color in the current palette. If this property is set on bitmap cast members that are deeper
   * than 1-bit, the backColor may not be seen if the background of the bitmap is not visible.
   *
   * Note: It is recommended that the newer bgColor property be used instead of the backColor
   * property.
   */
  backColor = 0;

  /**
   * Sprite property; returns or sets a sprite's blend value, from 0 to 100, corresponding to the
   * blend values in the Sprite Properties dialog box. Read/write. The possible colors depend on
   * the colors available in the palette, regardless of the monitor's color depth. For best
   * results, use the blend ink with images that have a color depth greater than 8-bit.
   */
  blend = 100;

  /**
   * Image object or bitmap cast member property; displays the color depth of the given image
   * object or bitmap cast member.
   */
  depth = 0;

  /**
   * Bitmap cast member property; dithers the cast member when it is displayed at a color depth of
   * 8 bits or less (256 colors) if the display must show a color gradation not in the cast
   * member (TRUE), or tells Director to choose the nearest color out of those available in the
   * current palette (FALSE). For both performance and quality reasons, you should set dither to
   * TRUE only when higher display quality is necessary. Dithering is slower than remapping, and
   * artifacts may be more apparent when animating over a dithered image. If the color depth is
   * greater than 8 bits, this property has no effect.
   */
  dither = false;

  /**
   * Sprite property; returns or sets the foreground color of a sprite. Read/write. It is not
   * recommended to apply this property to bitmap cast members deeper than 1-bit, as the results
   * are difficult to predict. It is recommended that the newer color property be used instead of
   * the foreColor property.
   */
  foreColor = 0;

  /**
   * Image property. Refers to the image object of a bitmap or text cast member, of the Stage, or
   * of a window. Read/write for a cast member's image, read-only for an image of the Stage or a
   * window. Setting a cast member's image property immediately changes the contents of the
   * member. However, when getting the image of a member or window, Director creates a reference
   * to the image of the specified member or window.
   */
  image = new Image();

  /**
   * Movie and bitmap cast member property; indicates the type of compression that Director
   * applies to internal (non-linked) bitmap cast members when saving a movie in Shockwave
   * Player format. Read/write. Valid values for imageCompression include the following:
   *  • #jpeg
   *  • #png (default)
   */
  imageCompression = Symbol.for("png");

  /**
   * Movie and bitmap cast member property; indicates the level of compression to use when a
   * movie's imageCompression property is set to #jpeg. Read/write during authoring only. The
   * range of acceptable values is 0-100. Zero yields the lowest image quality and highest
   * compression; 100 yields the highest image quality and lowest compression.
   */
  imageQuality = 100;

  /**
   * Cast member property; for bitmap cast members only, determines which palette is associated
   * with the cast member specified by whichCastMember. This property can be tested and set.
   */
  palette = 0;

  /**
   * Cast member property; determines which image is associated with a bitmap, text, or PICT cast
   * member. To update changes to a cast member's registration point or update changes to an
   * image after relinking it using the fileName property, use the following statement:
   * `member(whichCastMember).picture = member(whichCastMember).picture`. Because changes to
   * cast members are stored in RAM, this property is best used during authoring. Avoid setting
   * it in projectors. The property can be tested and set.
   */
  picture = 0;

  /**
   * Member, Image, and Sprite property; specifies the left, top, right, and bottom coordinates,
   * returned as a rectangle, for the rectangle of any graphic cast member, such as a bitmap,
   * shape, movie, or digital video. Read-only for all cast members, read/write for field cast
   * members only. For a bitmap, the rect property is measured from the upper left corner of the
   * bitmap, instead of from the upper left corner of the easel in the Paint window. For an Xtra
   * extension cast member, the rect property is a rectangle whose upper left corner is at (0,0).
   */
  rect = new Rect();

  /**
   * Cast member property. Determines whether the white pixels around the edge of a bitmap cast
   * member are removed or left in place. This property is set when the member is imported. It
   * can be changed in Lingo or in the Bitmap tab of the Property inspector.
   */
  trimWhiteSpace = true;

  /**
   * Bitmap cast member property; controls whether an alpha channel is used (TRUE) or ignored
   * (FALSE). When useAlpha is FALSE, the alpha channel is ignored, and the bitmap is opaque.
   */
  useAlpha = true;

  /**
   * Cast member property; scales a digital video cast member to fit exactly inside the sprite
   * rectangle in which it appears (FALSE), or it crops but doesn't scale the cast member to fit
   * inside the sprite rectangle (TRUE). This property can be tested and set.
   */
  crop() {}

  /**
   * Function; reports whether the state of the picture member property for the specified cast
   * member is TRUE (1) or FALSE (0). Because pictureP doesn't directly check whether a picture
   * is associated with a cast member, you must test for a picture by checking the cast member's
   * picture member property.
   */
  pictureP() { return false; }
}