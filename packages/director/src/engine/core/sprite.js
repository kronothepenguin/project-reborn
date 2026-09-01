import { Point } from "../base/point.js";
import { Rect } from "../base/rect.js";

export class SpriteObject {
  /**
   * Sprite property; sets the background color of a specified sprite according to the color value
   * assigned. Read/write.
   * Setting backColor of a sprite is the same as choosing the background color from the Tool palette
   * when the sprite is selected on the Stage. For the value that a script sets to last beyond the current
   * sprite, the sprite must be a scripted sprite. The background color applies to all bitmap cast
   * members, in addition to field, button, check box, and radio cast members.
   * The backColor value ranges from 0 to 255 for 8-bit color and from 0 to 15 for 4-bit color.
   * The numbers correspond to the index number of the background color in the current palette.
   * (A color’s index number appears in the color palette’s lower left corner when you click the color.)
   * If this property is set on bitmap cast members that are deeper than 1-bit, the backColor may not
   * be seen if the background of the bitmap is not visible.
   * If the blend of a sprite is less than 100 but greater than 0, the backColor will mix with the
   * transparent colors.
   * Note: It is recommended that the newer bgColor property be used instead of the backColor property.
   */
  backColor = 0;

  /**
   * Sprite property; returns or sets a sprite’s blend value, from 0 to 100, corresponding to the blend
   * values in the Sprite Properties dialog box. Read/write.
   * The possible colors depend on the colors available in the palette, regardless of the monitor’s
   * color depth.
   * For best results, use the blend ink with images that have a color depth greater than 8-bit.
   */
  blend = 100;

  /**
   * Sprite property; specifies the bottom vertical coordinate of the bounding rectangle of a sprite.
   * Read/write.
   */
  bottom = 0;

  castLib = 0;

  /**
   * Sprite property; determines whether the Registration point of a sprite is constrained to the
   * bounding rectangle of another sprite (1 or TRUE) or not (0 or FALSE, default). Read/write.
   * The constraint property is useful for constraining a moveable sprite to the bounding rectangle
   * of another sprite to simulate a track for a slider control or to restrict where on the screen a user
   * can drag an object in a game.
   * The constraint property affects moveable sprites and the locH and locV properties. The
   * constraint point of a moveable sprite cannot be moved outside the bounding rectangle of the
   * constraining sprite. (The constraint point for a bitmap sprite is the registration point. The
   * constraint point for a shape sprite is its top left corner.) When a sprite has a constraint set, the
   * constraint limits override any locH and locV property settings.
   */
  constraint = 0;

  /**
   * Sprite and sound channel property; returns the current playing time, in milliseconds, for a sound
   * sprite, QuickTime digital video sprite, or any Xtra extension that supports cue points. For a
   * sound channel, returns the current playing time of the sound member currently playing in the
   * given sound channel.
   * This property can be tested, but can only be set for traditional sound cast members (WAV, AIFF,
   * SND). When this property is set, the range of allowable values is from zero to the duration of
   * the member.
   * Shockwave Audio (SWA) sounds can appear as sprites in sprite channels, but they play sound in a
   * sound channel. You should refer to SWA sound sprites by their sprite channel number rather than
   * by a sound channel number.
   */
  currentTime = 0;

  /**
   * Sprite property; determines the cursor used when the pointer is over a sprite. Read/write.
   * This property stays in effect until you turn it off by setting the cursor to 0. Use the cursor
   * property to change the cursor when the mouse pointer is over specific regions of the screen and to
   * indicate regions where certain actions are possible when the user clicks on them.
   * When you set the cursor property in a given frame, Director keeps track of the sprite rectangle to
   * determine whether to alter the cursor. This rectangle persists when the movie enters another
   * frame unless you set the cursor property for that channel to 0.
   */
  cursor = 0;

  /**
   * Sprite property; determines whether a specified sprite can be edited on the Stage (TRUE) or not
   * (FALSE). Read/write.
   * When the cast member property is set, the setting is applied to all sprites that contain the field.
   * When this property is set, only the specified sprite is affected.
   * You can also make a field sprite editable by using the Editable option in the Field Cast Member
   * Properties dialog box.
   * You can make a field sprite editable by using the Editable option in the Score.
   * For the value set by a script to last beyond the current sprite, the sprite must be a scripted sprite.
   */
  editable = false;

  /**
   * Sprite property; returns the frame number of the end frame of the sprite span. Read-only.
   * This property is useful in determining the span in the Score of a particular sprite.
   * This property is available only in a frame that contains the sprite. It cannot be applied to sprites in
   * different frames of the movie.
   */
  endFrame = 0;

  /**
   * Sprite property; indicates whether a sprite’s image has been flipped horizontally on the Stage
   * (TRUE) or not (FALSE). Read-only.
   * The image itself is flipped around its registration point.
   * This means any rotation or skew remains constant; only the image data itself is flipped.
   */
  flipH = false;

  /**
   * Sprite property; indicates whether a sprite’s image has been flipped vertically on the Stage
   * (TRUE) or not (FALSE). Read-only.
   * The image itself is flipped around its registration point.
   * This means any rotation or skew remains constant; only the image data itself is flipped.
   */
  flipV = false;

  /**
   * Sprite property; returns or sets the foreground color of a sprite. Read/write.
   * It is not recommended to apply this property to bitmap cast members deeper than 1-bit, as the
   * results are difficult to predict.
   * It is recommended that the newer color property be used instead of the foreColor property.
   */
  foreColor = 0;

  /**
   * Image, Member, and Sprite property; for vector shape, Flash, animated GIF, RealMedia,
   * Windows Media, bitmap, and shape cast members, determines the height, in pixels, of the cast
   * member displayed on the Stage. Read-only for cast members and image objects, read/write
   * for sprites.
   */
  height = 0;

  /**
   * Sprite property; determines the ink effect applied to a sprite. Read/write.
   * Valid values of ink are as follows:
   *
   * 0—Copy                         32—Blend
   *
   * 1—Transparent                  33—Add pin
   *
   * 2—Reverse                      34—Add
   *
   * 3—Ghost                        35—Subtract pin
   *
   * 4—Not copy                     36—Background transparent
   *
   * 5—Not transparent              37—Lightest
   *
   * 6—Not reverse                  38—Subtract
   *
   * 7—Not ghost                    39—Darkest
   *
   * 8—Matte                        40—Lighten
   *
   * 9—Mask                         41—Darken
   *
   * In the case of 36 (background transparent), you select a sprite in the Score and select a
   * transparency color from the background color box in the Tools window. You can also do this by
   * setting the backColor property.
   * If you set this property within a script while the playhead is not moving, be sure to use the Movie
   * object’s updateStage() method to redraw the Stage. If you change several sprite properties—or
   * several sprites—use only one updateStage() method at the end of all the changes.
   */
  ink = 0;

  /**
   * Sprite property; identifies the left horizontal coordinate of the bounding rectangle of a sprite.
   * Read/write.
   * Sprite coordinates are measured in pixels, starting with (0,0) at the upper left corner of the Stage.
   */
  left = 0;

  loc = new Point();

  /**
   * Sprite property; indicates the horizontal position of a sprite’s registration point. Read/write.
   * Sprite coordinates are relative to the upper left corner of the Stage.
   * To make the value last beyond the current sprite, make the sprite a scripted sprite.
   */
  locH = 0;

  /**
   * Sprite property; indicates the vertical position of a sprite’s registration point. Read/write.
   * Sprite coordinates are relative to the upper left corner of the Stage.
   * To make the value last beyond the current sprite, make the sprite a scripted sprite.
   */
  locV = 0;

  /**
   * Sprite property; specifies the dynamic Z-order of a sprite, to control layering without having to
   * manipulate sprite channels and properties. Read/write.
   * This property can have an integer value from negative 2 billion to positive 2 billion. Larger
   * numbers cause the sprite to appear in front of sprites with smaller numbers. If two sprites have
   * the same locZ value, the channel number then takes precedence for deciding the final display order
   * of those two sprites. This means sprites in lower numbered channels appear behind sprites in
   * higher numbered channels even when the locZ values are equal.
   * By default, each sprite has a locZ value equal to its own channel number.
   * Layer-dependent operations such as hit detection and mouse events obey sprites’ locZ values, so
   * changing a sprite’s locZ value can make the sprite partially or completely obscured by other
   * sprites and the user may be unable to click on the sprite.
   * Other Director functions do not follow the locZ ordering of sprites. Generated events still begin
   * with channel 1 and increase consecutively from there, regardless of the sprite’s Z-order.
   */
  locZ = 0;

  /**
   * Sprite property; specifies a sprite’s cast member and cast library. Read/write.
   * The member Sprite property differs from the spriteNum Sprite property, which specifies only the
   * sprite’s number to identify its location in the cast library but doesn’t specify the cast library itself.
   * The member property also differs from the Mouse object’s mouseMember property, which does not
   * specify a sprite’s cast library.
   * When assigning a sprite’s member property, use one of the following formats:
   * • Specify the full cast member and cast library description (spriteObjRef.member =
   * member(intMemberNum {, castLibraryNameOrNum})).
   * • Specify the cast member name (spriteObjRef.member = member("stringMemberName").
   * • Specify the unique integer that includes all cast libraries and corresponds to the mouseMember
   * property (spriteObjRef.member = 132) .
   * If you use only the cast member name, Director finds the first cast member that has that name in
   * all current cast libraries. If the name is duplicated in two cast libraries, only the first name is used.
   * To specify a cast member by number when there are multiple casts, use the memberNum Sprite
   * property, which changes the member’s position in its cast library without affecting the sprite’s cast
   * library (spriteObjRef.memberNum = 10).
   * The cast member assigned to a sprite channel is only one of that sprite’s properties; other
   * properties vary by the type of media element in that channel in the Score. For example, if you
   * replace a bitmap with an unfilled shape by setting the member Sprite property, the shape sprite’s
   * lineSize property doesn’t automatically change, and you probably won’t see the shape.
   * Similar sprite property mismatches can occur if you change the member of a field sprite to a
   * video. It’s generally more useful and predictable to replace cast members with similar cast
   * members. For example, replace bitmap sprites with bitmap cast members.
   */
  member = null;

  memberNum = 0;

  /**
   * Sprite property; indicates whether a sprite can be moved by the user (TRUE) or not (FALSE).
   * You can make a sprite moveable by using the Moveable option in the Score. However, to control
   * whether a sprite is moveable and to turn this condition on and off as needed, use Lingo. For
   * example, to let users drag sprites one at a time and then make the sprites unmoveable after they
   * are positioned, turn the moveableSprite sprite property on and off at the appropriate times.
   * Note: For more customized control such as snapping back to the origin or animating while dragging,
   * create a behavior to manage the additional functionality.
   *
   * This property can be tested and set.
   */
  moveableSprite = false;

  /**
   * Sprite property; identifies the name of a sprite. Read/write during a Score recording session only.
   * Unlike sprite display properties such as backColor and blend, a sprite name cannot be a scripted
   * sprite. This means that the name can only be set during a Score recording session—between calls
   * to the Movie object’s beginRecording() and endRecording() methods. You can only set the
   * name if beginRecording() is called on or before a frame in the Score that contains the sprite.
   * Note: Starting a Score recording session using beginRecording() resets the properties of all scripted
   * sprites and sprite channels.
   *
   * If you use script to create a new sprite during a Score recording session and you use
   * updateFrame() to apply the sprite data to the session, you cannot set the sprite’s name until you
   * go back to the frame in which the sprite was created. Use a method such as go() to go back to a
   * specific frame.
   */
  name = "";

  puppet = false;

  /**
   * Sprite property; contains a list of four points, which are floating point values that describe the
   * corner points of a sprite on the Stage. Read/write.
   * The points of the quad are organized in the following order: upper left, upper right, lower right,
   * and lower left.
   * The points themselves can be manipulated to create perspective and other image distortions.
   * After you manipulate the quad of a sprite, you can reset it to the Score values by turning off the
   * scripted sprite with puppetSprite(intSpriteNum, FALSE). When the quad of a sprite is
   * disabled, you cannot rotate or skew the sprite.
   */
  quad = [new Point(), new Point(), new Point(), new Point()];

  /**
   * Sprite property; specifies the left, top, right, and bottom coordinates, as a rectangle, for the
   * rectangle of any graphic sprite such as a bitmap, shape, movie, or digital video. Read/write.
   */
  rect = new Rect();

  /**
   * Sprite property; indicates the distance, in pixels, of a sprite’s right edge from the left edge of the
   * Stage. Read/write.
   * Sprite coordinates are expressed relative to the upper left corner of the Stage.
   */
  right = 0;

  /**
   * Sprite property; controls the rotation of a QuickTime movie, animated GIF, Flash movie, or
   * bitmap sprite within a sprite’s bounding rectangle, without rotating that rectangle or the sprite’s
   * controller (in the case of QuickTime). Read/write.
   * In effect, the sprite’s bounding rectangle acts as a window through which you can see the Flash or
   * QuickTime movie. The bounding rectangles of bitmaps and animated GIFs change to
   * accommodate the rotating image.
   * Score rotation works for a Flash movie only if obeyScoreRotation is set to TRUE.
   * A Flash movie rotates around its origin point as specified by its originMode property. A
   * QuickTime movie rotates around the center of the bounding rectangle of the sprite. A bitmap
   * rotates around the registration point of the image.
   * For QuickTime media, if the sprite’s crop property is set to TRUE, rotating the sprite frequently
   * moves part of the image out of the viewable area; when the sprite’s crop property is set to FALSE,
   * the image is scaled to fit within the bounding rectangle (which may cause image distortion).
   * You specify the rotation in degrees as a floating-point number.
   * The Score can retain information for rotating an image from +21,474,836.47° to
   * -21,474,836.48°, allowing 59,652 full rotations in either direction.
   * When the rotation limit is reached (slightly past the 59,652th rotation), the rotation resets to
   * +116.47° or -116.48°—not 0.00°. This is because +21,474,836.47° is equal to +116.47°, and
   * -21,474,836.48° is equal to -116.48° (or +243.12°). To avoid this reset condition, when you use
   * script to perform continuous rotation, constrain the angles to ±360°.
   * The default value of this property is 0.
   */
  rotation = 0;

  /**
   * Sprite property; returns, as a float value in hundredths of a degree, the angle to which the vertical
   * edges of the sprite are tilted (skewed) from the vertical. Read/write.
   * Negative values indicate a skew to the left; positive values indicate a skew to the right. Values
   * greater than 90° flip an image vertically.
   * The Score can retain information for skewing an image from +21,474,836.47° to
   * -21,474,836.48°, allowing 59,652 full rotations in either direction.
   * When the skew limit is reached (slightly past the 59,652th rotation), the skew resets to +116.47°
   * or -116.48°—not 0.00°. This is because +21,474,836.47° is equal to +116.47°, and
   * -21,474,836.48° is equal to -116.48° (or +243.12°). To avoid this reset condition, constrain
   * angles to ±360° in either direction when using script to perform continuous skewing.
   */
  skew = 0;

  /**
   * Sprite property; determines the channel number the behavior’s sprite is in and makes it available
   * to any behaviors. Read-only.
   * Simply declare the property at the top of the behavior, along with any other properties the
   * behavior may use.
   * If you use a new() handler to create an instance of the behavior, the script’s new() handler must
   * explicitly set the spriteNum property to the sprite’s number. This provides a way to identify the
   * sprite the script is attached to. The sprite’s number must be passed to the new() handler as an
   * argument when the new() handler is called.
   */
  spriteNum = 0;

  /**
   * Sprite property; returns the frame number of the starting frame of a sprite span. Read-only.
   * This property is useful in determining the span in the Score that a particular sprite covers. It is
   * available only in a frame that contains the sprite, and cannot be applied to sprites in different
   * frames of the movie.
   */
  startFrame = 0;

  /**
   * Sprite property; returns or sets the top vertical coordinate of the bounding rectangle of a sprite as
   * the number of pixels from the upper left corner of the Stage. Read/write.
   */
  top = 0;

  /**
   * Sprite property; determines whether the sprite specified by whichSprite is visible (TRUE) or not
   * (FALSE). This property affects all sprites in the channel, regardless of their position in the Score.
   * Note: Setting the visible property of a sprite channel to FALSE makes the sprite invisible and
   * prevents only the mouse-related events from being sent to that channel. The beginSprite, endSprite,
   * prepareFrame, enterFrame, and exitFrame events continue to be sent regardless of the sprite’s
   * visibility setting. Clicking the Mute button on that channel in the Score, however, will set the visible
   * property to FALSE and prevent all events from being sent to that channel. Muting disables a channel,
   * while setting a sprite’s visible property to FALSE merely affects a graphic property.
   *
   * This property can be tested and set. If set to FALSE, this property will not automatically reset to
   * TRUE when the sprite ends. You must set the visible property of the sprite to TRUE in order to
   * see any other members using that channel.
   */
  visible = true;

  /**
   * Member, Image, and Sprite property; for vector shape, Flash, animated GIF, RealMedia,
   * Windows Media, bitmap, and shape cast members, determines the width, in pixels, of a cast
   * member. Read-only for cast members and image objects, read/write for sprites.
   * This property does not affect field and button cast members.
   */
  width = 0;

  /**
   * Sprite property; controls the volume of a digital video movie or Windows Media cast member
   * specified by name or number. The values range from 0 to 256. Values of 0 or less mute the sound.
   * Values exceeding 256 are loud and introduce considerable distortion.
   */
  volume = 256;

  constructor(number = 0) {
    this.spriteNum = number;
  }

  /**
   * Command; used to call a series of actions that reside in a frame of a Flash movie sprite.
   * This command sends a message to the Flash ActionScript engine and triggers the actions to
   * execute in the Flash movie.
   *
   * @param {number | string} [flashFrameNameOrNum] Required. A string or number that specifies the name or number of the frame to call.
   */
  callFrame(flashFrameNameOrNum) {
    // TODO(subsystems): route through Flash/Score engine.
  }

  /**
   * Function; returns the coordinate on the Director Stage that corresponds to a specified coordinate
   * in a Flash movie sprite. The function accepts both the Flash channel and movie coordinate and
   * returns the Director Stage coordinate as Director point values: for example, point(300,300).
   * Flash movie coordinates are measured in Flash movie pixels, which are determined by a movie’s
   * original size when it was created in Flash. For the purpose of calculating Flash movie coordinates,
   * point(0,0) of a Flash movie is always at its upper left corner. (The cast member’s originPoint
   * property is used only for rotation and scaling, not to calculate movie coordinates.)
   * The flashToStage and the corresponding stageToFlash functions are helpful for determining
   * which Flash movie coordinate is directly over a Director Stage coordinate. For both Flash and
   * Director, point(0,0) is the upper left corner of the Flash Stage or Director Stage. These
   * coordinates may not match on the Director Stage if a Flash sprite is stretched, scaled, or rotated.
   *
   * @param {object} [pointInFlashMovie] Required. The point in the Flash movie sprite whose coordinates are returned.
   * @returns {object}
   */
  flashToStage(pointInFlashMovie) {
    // TODO(subsystems): route through Flash coordinate mapping.
    return pointInFlashMovie;
  }

  /**
   * Command; plays a Flash movie sprite beginning at the frame identified by the frameNumber
   * parameter. You can identify the frame by either an integer indicating a frame number or by a
   * string indicating a label name. Using the goToFrame command has the same effect as setting a
   * Flash movie sprite’s frame property.
   *
   * @param {number | string} [frameNameOrNum] Required. A string or number that specifies the name or number of the frame.
   */
  goToFrame(frameNameOrNum) {
    // TODO(subsystems): route through Flash/Score engine.
  }

  /**
   * Function; indicates which part of a Flash movie is directly over a specific Director Stage location.
   * The Director Stage location is expressed as a Director point value: for example, point(100,50).
   * The hitTest function returns these values:
   * • #background—The specified Stage location falls within the background of the Flash movie
   * sprite.
   * • #normal—The specified Stage location falls within a filled object.
   * • #button—The specified Stage location falls within the active area of a button.
   * • #editText—The specified Stage location falls within a Flash editable text field.
   *
   * @param {object} [point] Required. Specifies the point to test.
   * @returns {symbol}
   */
  hitTest(point) {
    // TODO(subsystems): route through Flash hit detection.
    return Symbol.for("background");
  }

  /**
   * Digital video sprite property; returns the number of tracks in the specified digital video sprite.
   * This property can be tested but not set.
   *
   * @returns {number}
   */
  trackCount() {
    // TODO(subsystems): route through digital video track metadata.
    return 0;
  }

  /**
   * Digital video sprite property; sets the starting time of a digital video movie in the specified sprite
   * channel. The value of trackStartTime is measured in ticks.
   * This property can be tested but not set.
   *
   * @param {number} [whichTrack] Required. Specifies the track whose starting time is returned.
   * @returns {number}
   */
  trackStartTime(whichTrack) {
    // TODO(subsystems): route through digital video track metadata.
    return 0;
  }

  /**
   * Digital video sprite property; returns the stop time of the specified track of the specified digital
   * video sprite.
   * When a digital video movie is played, trackStopTime is when playback halts or loops if the loop
   * property is turned on.
   * This property can be tested but not set.
   *
   * @param {number} [whichTrack] Required. Specifies the track whose stop time is returned.
   * @returns {number}
   */
  trackStopTime(whichTrack) {
    // TODO(subsystems): route through digital video track metadata.
    return 0;
  }

  /**
   * Digital video sprite property; returns the type of media in the specified track of the specified
   * sprite. Possible values are #video, #sound, #text, and #music.
   * This property can be tested but not set.
   *
   * @param {number} [whichTrack] Required. Specifies the track whose type is returned.
   * @returns {symbol | null}
   */
  trackType(whichTrack) {
    // TODO(subsystems): route through digital video track metadata.
    return null;
  }
}