import { Point } from "../types/point.js";
import { Rect } from "../types/rect.js";

export class MemberObject {
  /**
   * Member constructor; sets the optional `type` and `name` of the cast member from the first
   * two arguments. Both arguments are optional; when omitted, the documented field defaults
   * (`type = Symbol.for("")`, `name = ""`) apply.
   *
   * @param {*} [type] The cast member type, typically a `Symbol.for("…")` value such as
   * `Symbol.for("bitmap")`. See the `type` property for the full list.
   * @param {string} [name] The cast member name.
   */
  constructor(type, name) {
    if (type !== undefined) this.type = type;
    if (name !== undefined) this.name = name;
  }
  // TODO(subsystems): route member-number registration through MemberRegistry (US2 T019) when context is active — v1 stub leaves number = 0

  /**
   * Member property; determines the number of the cast library that a cast member belongs to.
   * Read-only.
   */
  castLibNum = 0;

  /**
   * Member property; provides a place to store any comments you want to maintain about the given
   * cast member or any other strings you want to associate with the member. Read/write.
   *
   * This property can also be set in the Property inspector’s Member tab.
   */
  comments = "";

  /**
   * Member property; records the date that the cast member was first created by using the system date
   * on the computer. Read-only.
   * You can use this property to schedule a project; Director does not use it for anything.
   */
  creationDate = new Date();

  /**
   * Member property; refers to the name of the file assigned to a linked cast member. Read/write.
   *
   * This property is useful for switching the external linked file assigned to a cast member while a
   * movie plays, similar to the way you can switch cast members. When the linked file is in a different
   * folder than the movie, you must include the file’s pathname.
   *
   * You can also make unlinked media linked by setting the filename of those types of members that
   * support linked media.
   *
   * This property also accepts URLs as a reference. However, to use a file from a URL and minimize
   * download time, use the downloadNetThing() or preloadNetThing() methods to download the
   * file to a local disk first and then set the fileName property to the file on the local disk.
   *
   * After the filename is set, Director uses that file the next time the cast member is used.
   */
  fileName = "";

  /**
   * Image, Member, and Sprite property; for vector shape, Flash, animated GIF, RealMedia,
   * Windows Media, bitmap, and shape cast members, determines the height, in pixels, of the
   * cast member displayed on the Stage. Read-only for cast members and image objects, read/write
   * for sprites.
   */
  height = 0;

  /**
   * Member property; determines whether a check box or radio button created with the button tool
   * is selected (TRUE) or not (FALSE, default). Read/write.
   */
  hilite = false;

  /**
   * Member property; controls whether a script, Flash movie, or animated GIF file is stored in an
   * external file (TRUE, default), or inside the Director cast library (FALSE). Read/write for script,
   * Flash, and animated GIF members, read-only for all other member types.
   * When the data is stored externally in a linked file, the cast member’s pathName property must
   * point to the location where the movie file can be found.
   */
  linked = false;

  /**
   * Member property; specifies whether a specified cast member is loaded into memory (TRUE) or not
   * (FALSE). Read-only.
   *
   * Different cast member types have slightly different behaviors for loading:
   * • Shape and script cast members are always loaded into memory.
   * • Movie cast members are never unloaded.
   * • Digital video cast members can be preloaded and unloaded independent of whether they are
   *   being used. (A digital video cast member plays faster from memory than from disk.)
   */
  loaded = false;

  /**
   * Member property; identifies the specified cast member as a set of numbers. Read/write.
   *
   * Because setting this property can use large amounts of memory, it is best used during
   * authoring only.
   *
   * You can use the media property to copy the content of one cast member into another cast
   * member by setting the second member’s media value to the media value for the first member.
   *
   * For a film loop cast member, the media property specifies a selection of frames and channels in
   * the Score.
   *
   * To swap media in a projector, it is more efficient to set the member sprite property.
   */
  media = new ArrayBuffer(0);

  /**
   * Member property; determines whether the contents of a cast member, a movie or cast library file,
   * or a linked cast member is downloaded from the Internet and is available on the local disk (TRUE)
   * or not (FALSE). Read-only.
   *
   * This property is useful only when streaming a movie or cast library file. Movie streaming is
   * activated by setting the Movie:Playback properties in the Modify menu to Play While
   * Downloading Movie (default setting).
   *
   * For a demonstration of the mediaReady property, see the sample movie Streaming Shockwave in
   * Director Help.
   */
  mediaReady = false;

  /**
   * Member property; indicates whether a cast member has been modified since it was read from a
   * movie file. Read-only.
   * • When the modified property is TRUE (1), the cast member has been modified since it was read
   *   from the movie file.
   * • When the modified property is FALSE (0), the cast member has not been modified since it was
   *   read from the movie file.
   */
  modified = false;

  /**
   * Member property; records the name of the user who last edited the cast member. Read-only.
   *
   * The name is taken from the user name information provided during Director installation. You
   * can change this information in the Director General Preferences dialog box.
   *
   * This property is useful for tracking and coordinating Director projects with more than one
   * author, and may also be viewed in the Property inspector’s Member tab.
   */
  modifiedBy = "";

  /**
   * Member property; indicates the date and time that the cast member was last changed, using the
   * system time on the authoring computer. Read-only.
   *
   * This property is useful for tracking and coordinating Director projects. It can also be viewed in
   * the Property inspector’s Member tab and the Cast window list view.
   */
  modifiedDate = new Date();

  /**
   * Cast, Member, Movie, and Window property; returns or sets the name of an object. Read/write
   * for Cast, Member, and Window objects, read-only for Movie objects.
   */
  name = "";

  /**
   * Member property; indicates the cast library number of a specified cast member. Read-only.
   *
   * The value of this property is a unique identifier for the cast member that is a single integer
   * describing its location in and position in the cast library.
   */
  number = 0;

  /**
   * Member property; specifies the purge priority of a cast member. Read/write.
   *
   * A cast member’s purge priorities determine the priority that Director follows to choose which cast
   * members to delete from memory when memory is full. The higher the purge priority, the more
   * likely that the cast member will be deleted. The following purgePriority settings are available:
   * • 0—Never
   * • 1—Last
   * • 2—Next
   * • 3—Normal (default)
   *
   * The Normal setting lets Director purge cast members from memory at random. The Next, Last,
   * and Never settings allow some control over purging, but Last or Never may cause your movie to
   * run out of memory if several cast members are set to these values.
   *
   * Setting purgePriority for cast members is useful for managing memory when the size of the
   * movie’s cast library exceeds the available memory. As a general rule, you can minimize pauses
   * while the movie loads cast members and reduce the number of times Director reloads a cast
   * member by assigning a low purge priority to cast members that are used frequently in the course
   * of the movie.
   */
  purgePriority = 3;

  /**
   * Member property; specifies the left, top, right, and bottom coordinates, returned as a rectangle,
   * for the rectangle of any graphic cast member, such as a bitmap, shape, movie, or digital video.
   * Read-only for all cast members, read/write for field cast members only.
   *
   * For a bitmap, the rect property is measured from the upper left corner of the bitmap, instead of
   * from the upper left corner of the easel in the Paint window.
   *
   * For an Xtra extension cast member, the rect property is a rectangle whose upper left corner is
   * at (0,0).
   */
  rect = new Rect();

  /**
   * Member property; specifies the registration point of a cast member. Read/write.
   *
   * The registration point is listed as the horizontal and vertical coordinates of a point in the form
   * point(horizontal, vertical). Nonvisual members such as sounds do not have a useful
   * regPoint property.
   *
   * You can use the regPoint property to animate individual graphics in a film loop, changing the
   * film loop’s position in relation to other objects on the Stage.
   *
   * You can also use regPoint to adjust the position of a mask being used on a sprite.
   *
   * When a Flash movie cast member is first inserted into the cast library, its registration point is its
   * center and its centerRegPoint property is set to TRUE. If you subsequently use the regPoint
   * property to reposition the registration point, the centerRegPoint property is automatically set
   * to FALSE.
   */
  regPoint = new Point();

  /**
   * Member property; indicates the content of the script, if any, assigned to a cast member.
   * Read/write.
   *
   * The text of a script is removed when a movie is converted to a projector, protected, or compressed
   * for Shockwave Player. Such movies then lose their values for the scriptText property. Therefore,
   * the movie’s scriptText property values cannot be retrieved when the movie is played back by a
   * projector. However, Director can set new values for the scriptTex property inside the projector.
   * These newly assigned scripts are automatically compiled so that they execute quickly.
   */
  scriptText = "";

  /**
   * Member property; returns the size in memory, in bytes, of a specific cast member. Read-only.
   *
   * Divide bytes by 1024 to convert to kilobytes.
   */
  size = 0;

  /**
   * Member property; contains the image used to preview a cast member in the Cast window. Read/
   * write during authoring only.
   *
   * The image can be customized for any cast member.
   */
  thumbNail = new Image();

  /**
   * Member property; indicates a cast member’s type. Read-only.
   *
   * The type property can be one of the following values:
   *
   * #animgif              #ole
   * #bitmap               #palette
   * #button               #picture
   * #cursor               #QuickTimeMedia
   * #digitalVideo         #realMedia
   * #DVD                  #script
   * #empty                #shape
   * #field                #shockwave3D
   * #filmLoop             #sound
   * #flash                #swa
   * #flashcomponent       #text
   * #font                 #transition
   * #havok                #vectorShape
   * #movie                #windowsMedia
   *
   * This list includes those types of cast members that are available in Director and the Xtra
   * extensions that come with it. You can also define custom cast member types for custom
   * cast members.
   *
   * For movies created in Director 5 and 6, the type property returns #field for field cast members
   * and #richText for text cast members. However, field cast members originally created in Director
   * 4 return #text for the member type, providing backward compatibility for movies that were
   * created in Director 4.
   */
  type = Symbol.for("");

  /**
   * Member, Image, and Sprite property; for vector shape, Flash, animated GIF, RealMedia,
   * Windows Media, bitmap, and shape cast members, determines the width, in pixels, of a cast
   * member. Read-only for cast members and image objects, read/write for sprites.
   *
   * This property does not affect field and button cast members.
   */
  width = 0;

  /**
   * Member method; copies a specified cast member to the Clipboard.
   *
   * Calling this method does not require the Cast window to be active.
   *
   * This method is useful when copying cast members between movies or applications.
   */
  copyToClipBoard() {}

  /**
   * Member method; makes a copy of a specified cast member.
   *
   * This method is best used during authoring rather than during runtime; it creates another cast
   * member in memory, which could result in memory problems.
   *
   * Use this method to permanently save cast member changes with the file.
   *
   * @param {number} [intPosn] An integer that specifies the Cast window for the duplicate cast member. If
   * omitted, the duplicate cast member is placed in the first open Cast window position.
   */
  duplicate(intPosn) {}

  /**
   * Member method; deletes a specified cast member and leaves its slot in the Cast window empty.
   *
   * For best results, use this method during authoring and not in projectors. Using this method in
   * projectors may cause memory problems.
   */
  erase() {}

  /**
   * Member method; replaces the content of a specified cast member with a specified file.
   *
   * The importFileInto() method is useful in the following situations.
   * • When finishing or developing a movie, use it to embed external linked media so it can be
   *   edited during the project.
   * • When generating a Score from Lingo or JavaScript syntax during movie creation, use it to
   *   assign content to new cast members.
   * • When downloading files from the Internet, use it to download the file at a specific URL and
   *   set the filename of linked media.
   *   Note: To import a file from a URL, it is usually more efficient to use the preloadNetThing() to
   *   download the file to a local disk first, and then import the file from the local disk. Using
   *   preloadNetThing() also minimizes any potential downloading issues.
   * • Use it to import both RTF and HTML documents into text cast members with formatting and
   *   links intact.
   *
   * Using importFileInto() in projectors can quickly consume available memory, so reuse the same
   * members for imported data when possible.
   *
   * In Director and projectors, importFileInto() automatically downloads the file. In Shockwave
   * Player, call preloadNetThing() and wait for a successful completion of the download before
   * using importFileInto() with the file.
   *
   * @param {string} fileOrUrlString A string that specifies the file that will replace the content of the
   * cast member.
   */
  importFileInto(fileOrUrlString) {}

  /**
   * Member method; moves a specified cast member to either the first empty location in its
   * containing cast, or to a specified location in a given cast.
   *
   * For best results, use this method during authoring, not at runtime, because the move is typically
   * saved with the file. The actual location of a cast member does not affect most presentations
   * during playback for an end user. To switch the content of a sprite or change the display during
   * runtime, set the member of the sprite.
   *
   * @param {number} [intPosn] An integer that specifies the position in the cast library castLibName to
   * which the member is moved.
   * @param {string} [castLibName] A string that specifies the name of the cast library to which the member
   * is moved.
   */
  move(intPosn, castLibName) {}

  /**
   * Member method; pastes the contents of the Clipboard into a specified cast member, and erases
   * the existing cast member.
   *
   * Any item that is in a format that Director can use as a cast member can be pasted.
   *
   * When copying a string from another application, the string’s formatting is not retained.
   *
   * This method provides a convenient way to copy objects from other movies and from other
   * applications into the Cast window. Because copied cast members must be stored in RAM, avoid
   * using this command during playback in low memory situations.
   *
   * When using this method in Shockwave Player, or in the authoring environment and projectors
   * with the safePlayer property set to TRUE, a warning dialog will allow the user to cancel the
   * paste operation.
   */
  pasteClipBoardInto() {}

  /**
   * Member method; preloads a cast member or a range of cast members into memory, and stops
   * preloading when memory is full or when all specified cast members have been preloaded.
   *
   * When used without the toMemberObjRef parameter, preLoad() preloads all cast members used
   * from the current frame to the last frame of a movie.
   *
   * @param {MemberObject} toMemberObjRef A reference to the last cast member in a range of cast members that is
   * loaded into memory. The first cast member in the range is specified by memberObjRef.
   */
  preLoad(toMemberObjRef) {}

  /**
   * Member method; forces Director to clear the specified cast members from memory.
   * Director automatically unloads the least recently used cast members to accommodate preLoad()
   * methods or normal cast library loading.
   * • When used without a parameter, unLoad() clears from memory the cast members in all the
   *   frames of a movie.
   * • When used with the toMemberObjRef parameter, unLoad() clears from memory all the cast
   *   members in the range specified.
   *
   * When used in a new movie with no loaded cast members, this method returns an error.
   *
   * Cast members that you have modified during authoring or by setting picture,
   * pasteClipBoadInto(), and so on, cannot be unloaded.
   *
   * @param {MemberObject} toMemberObjRef A reference to the last cast member in the range to clear
   * from memory.
   */
  unLoad(toMemberObjRef) {}
}
