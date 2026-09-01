import { MemberObject } from "../member.js";

/**
 * Animated GIF cast member (Chapter 6: Media Types — "Animated GIF").
 *
 * Represents an animated GIF cast member.
 * You can add an animated GIF cast member to a movie by using the Movie object's newMember()
 * method.
 *
 * Some of the following methods or properties may apply only to sprites that are created from an
 * animated GIF cast member.
 *
 * Method summary: `resume()`, `rewind()`.
 * Property summary: `directToStage`, `frameRate`, `linked`, `path`, `playBackMode`.
 */
export class AnimatedGIFMember extends MemberObject {
  /**
   * Member, Image, and Sprite property; for vector shape, Flash, animated GIF, RealMedia,
   * Windows Media, bitmap, and shape cast members, determines whether the cast member is drawn
   * directly to the screen (TRUE) or not (FALSE, default). Read/write.
   */
  directToStage = false;

  /**
   * Animated GIF, Flash, and SWA cast member property; specifies the rate at which an animated
   * GIF, Flash movie cast member, or SWA cast member plays.
   */
  frameRate = 0;

  /**
   * Member property; controls whether a script, Flash movie, or animated GIF file is stored in an
   * external file (TRUE, default), or inside the Director cast library (FALSE). Read/write for
   * script, Flash, and animated GIF members, read-only for all other member types.
   */
  linked = true;

  /**
   * Movie, Animated GIF, Film Loop, and Xtra extension cast member property; specifies the path
   * that stores the URL or file path for an external file required by a linked cast member.
   */
  path = "";

  /**
   * Flash, Animated GIF, and SWA cast member property; specifies how a linked or internal Flash
   * movie, animated GIF, or SWA cast member plays. Possible values: #play, #loop, #pause.
   */
  playBackMode = Symbol.for("play");

  /**
   * Animated GIF, Flash, and Vector Shape method; resumes playing a paused animated GIF, Flash
   * movie, or Vector shape cast member. Returns 0 (FALSE) if the playback can not be resumed; 1
   * (TRUE) if it was resumed successfully. Method only works for Flash movies and animated GIFs
   * downloaded from HTTP sites and for Vector shape cast members.
   */
  resume() {}

  /**
   * Animated GIF and Flash method; rewinds an animated GIF or Flash movie cast member to its first
   * frame and then stops it.
   */
  rewind() {}
}