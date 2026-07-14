export class CastLibraryObject {
  /**
   * Cast library property; returns or sets the filename of a cast library. Read-only for internal cast
   * libraries, read/write for external cast libraries.
   *
   * For external cast libraries, fileName returns the cast’s full pathname and filename.
   *
   * For internal cast libraries, fileName returns a value depending on which internal cast library
   * is specified.
   * • If the first internal cast library is specified, fileName returns the name of the movie.
   * • If any other internal cast library is specified, fileName returns an empty string.
   *
   * This property accepts URLs as references. However, to use a cast library from the Internet and
   * minimize download time, use the downloadNetThing() or preloadNetThing() methods to
   * download the cast’s file to a local disk, and then set fileName to the file on the disk.
   *
   * If a movie sets the filename of an external cast, do no use the Duplicate cast members for Faster
   * Loading option in the Project Options dialog box.
   */
  fileName = "";

  /**
   * Cast library property; provides indexed or named access to the members of a cast library.
   * Read-only.
   *
   * The memberNameOrNum argument can be a string that specifies the cast member by name or an
   * integer that specifies the cast member by number.
   */
  member = {};

  /**
   * Cast, Member, Movie, and Window property; returns or sets the name of an object. Read/write
   * for Cast, Member, and Window objects, read-only for Movie objects.
   */
  name = "";

  /**
   * Cast library property; returns the number of a specified cast library. Read-only.
   */
  number = 0;

  /**
   * Cast library property; determines the preload mode of a specified cast library. Read/write.
   *
   * Valid values of preLoadMode are:
   * • 0. Load the cast library when needed. This is the default value.
   * • 1. Load the cast library before frame 1.
   * • 2. Load the cast library after frame 1.
   *
   * Setting this property has the same effect as setting Load Cast in the Cast Properties dialog box.
   */
  preLoadMode = 0;

  /**
   * Cast library property; returns the cast members that are selected in a given Cast window. Read/
   * write.
   */
  selection;

  /**
   * Cast library method; displays the next empty cast member position or the position after a
   * specified cast member.
   *
   * This method is available only on the current cast library.
   *
   * @param {number} [memberObjRef] A reference to the cast member after which the next empty cast member position is displayed. If omitted, the next empty cast member position is displayed.
   */
  findEmpty(memberObjRef) {
    return 0;
  }
}
