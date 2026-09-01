import { Rect } from "../base/rect.js";

export class WindowObject {
  /**
   * Cast, Member, Movie, and Window property; returns or sets the name of an object.
   * Read/write for Cast, Member, and Window objects, read-only for Movie objects.
   */
  name = "";

  /**
   * Window property; assigns a title to a window. Read/write.
   */
  title = "";

  /**
   * Window property; refers to the filename of the movie assigned to a window. Read/write.
   * When the linked file is in a different folder than the movie, you must include the file's
   * pathname. To be able to play the movie in a window, you must set the fileName property to
   * the movie's filename. The fileName property accepts URLs as a reference. However, to use a
   * movie file from a URL and minimize the download time, use the downloadNetThing() or
   * preloadNetThing() methods to download the movie file to a local disk first and then set
   * fileName property to the file on the local disk.
   */
  fileName = "";

  /**
   * Window property; returns a reference to the movie object that is playing in a specified
   * window. Read-only.
   */
  movie = null;

  /**
   * Window property; specifies the left, top, right, and bottom coordinates, as a rectangle, of
   * a window. Read/write. If the size of the rectangle specified is less than that of the Stage
   * where the movie was created, the movie is cropped in the window, not resized. To pan or
   * scale the movie playing in the window, set the drawRect or sourceRect property of the
   * window.
   */
  rect = new Rect(0, 0, 640, 480);

  /**
   * Window property; specifies the original Stage coordinates of the movie playing in a window.
   * Read-only. This property is useful for returning a window to its original size and position
   * after it has been dragged or its rectangle has been set.
   */
  sourceRect = new Rect(0, 0, 640, 480);

  /**
   * Window property; identifies the rectangular coordinates of the Stage of the movie that
   * appears in a window. Read/write. The coordinates are given as a rectangle, with entries in
   * the order left, top, right, and bottom. This property is useful for scaling or panning
   * movies, but it does not rescale text and field cast members. Scaling bitmaps can affect
   * performance.
   */
  drawRect = new Rect(0, 0, 640, 480);

  /**
   * Window property; determines the background color of a window. Read/write.
   * Setting the bgColor property is equivalent to setting the color in the Movie Properties
   * dialog box.
   */
  bgColor = 0;

  /**
   * Window property; determines whether a window is visible (TRUE) or not (FALSE). Read/write.
   */
  visible = true;

  /**
   * Window property; specifies whether the window is resizable (TRUE, default) or not (FALSE).
   * Read/write.
   */
  resizable = true;

  /**
   * Window property; specifies the window type. Read/write. If the type property is set, all
   * properties pertaining to the new window are set accordingly. This property can be one of
   * the following values:
   * #document  Specifies that the window will appear with a standard title bar, a close box, a
   *            minimize box, and a maximize box. These types of windows can be moved.
   * #tool      Specifies that the window will appear with a shorter title bar and only a small
   *            close box in the upper right corner. These types of windows no longer receive
   *            activate or deactivate events, because #tool windows are always active. These
   *            types of windows will always layer with each other, and will always appear on
   *            top of #document windows.
   * #dialog    Specifies that the window will appear with a standard title bar, a close box,
   *            and no icon. These types of windows are modal, and will always appear on top of
   *            all other windows.
   * These properties can also be accessed by using the Movie object's displayTemplate property.
   */
  type = 1;

  /**
   * Window property; returns the size state of a window. Read-only.
   * The returned size state will be one of the following values:
   * #minimized  Specifies that the window is currently minimized.
   * #maximized  Specifies that the window is currently maximized.
   * #normal     Specifies that the window is currently neither minimized nor maximized.
   */
  sizeState = 0;

  /**
   * Window property; specifies a list of properties that stores the appearance options of a
   * window. Read/write. The property list contains the following properties.
   * #mask             Specifies the 1-bit cast member to use as a mask for the window.
   * #border           Specifies the type of border for the window. This property can be one of
   *                   three values:
   *                   - #none. Specifies no border around the window.
   *                   - #line. Specifies a 1-pixel black border around the window.
   *                   The #none and #line properties are only effective if the
   *                   titlebarOptions.visible property is set to FALSE.
   * #metal            (Macintosh only) Specifies whether the window should have a metal look
   *                   (TRUE). If FALSE, the window will have an ice look.
   * #dragRegionMask   Specifies the 1-bit cast member to use as a mask for a region of the
   *                   window.
   * #shadow           (Macintosh only) Specifies whether the window should have a shadow.
   *                   Macintosh windows typically have a shadow.
   * #liveresize       (Macintosh only) Specifies whether the window should have live resizing.
   *                   If TRUE, live resizing is enabled. If FALSE, live resizing is disabled.
   * These properties can also be accessed by using the Movie object's displayTemplate property.
   */
  appearanceOptions = 0;

  /**
   * Window property; specifies a list of properties that stores the title bar options of a
   * window. Read/write. The property list contains the following properties:
   * #icon           Specifies the cast member icon to use in the title bar. This property is
   *                 only available if the title bar is visible (the #visible property is set to
   *                 TRUE).
   * #visible        Specifies whether the title bar is visible. If FALSE, the title bar is not
   *                 visible, and all other title bar and window properties are unaffected. If
   *                 TRUE, the title bar is visible, and the window maintains the states of all
   *                 other title bar and window properties. The default value is TRUE.
   * #closebox       Specifies whether a close box appears in the upper right corner of the
   *                 window. If TRUE, a close box appears. If FALSE, a close box does not
   *                 appear. The default value is TRUE.
   * #minimizebox    Specifies whether a minimize box appears in the upper right corner of the
   *                 window. If TRUE, a minimize box appears. If FALSE, a minimize box does
   *                 not appear. The default value is TRUE.
   * #maximizebox    Specifies whether a maximize box appears in the upper right corner of the
   *                 window. If TRUE, a maximize box appears. If FALSE, a maximize box does
   *                 not appear. The default value is TRUE.
   * #sideTitlebar   (Macintosh only) Specifies whether the title bar should appear on the side
   *                 of the window. If TRUE, the title bar appears on the side of the window.
   *                 If FALSE, the title bar does not appear on the side of the window. The
   *                 default value is FALSE.
   * These properties can also be accessed by using the Movie object's displayTemplate property.
   */
  titlebarOptions = 0;

  /**
   * Window property; refers to the image object of a window. Read-only.
   * When you get the image of a window, Director creates a reference to the image of the
   * specified window. If you make changes to the image, the contents of the window change
   * immediately. If you plan to make a lot of changes to the image property, it is faster to
   * copy the image property into a new image object using the Member object's duplicate()
   * method, apply your changes to the new image object, and then set the original item's image
   * to the new image object. For nonbitmap members, it is always faster to use the
   * duplicate() method.
   */
  image = null;

  /**
   * Window property; provides a way to get a picture of the current contents of a
   * window—either the Stage window or a movie in a window (MIAW). Read-only. You can apply the
   * resulting bitmap data to an existing bitmap or use it to create a new one. If no picture
   * exists, this property returns VOID (Lingo) or null (JavaScript syntax).
   */
  picture = null;

  /**
   * Movie and Window property; specifies whether a movie in a window (MIAW) will be a
   * dockable window when opened during authoring. Read/write. This property cannot be
   * accessed directly from a Movie object; you access this property from the Movie object's
   * displayTemplate property. The default value of this property is FALSE, which specifies
   * that a MIAW will not be dockable when opened during authoring. If this property is set to
   * TRUE, the value of the Window object's type property determines how the window will
   * appear during authoring.
   * - If dockingEnabled is TRUE and type is set to #document, the MIAW will look and act
   *   like a document windows in Director. The window will appear in the "view port" area
   *   and be dockable with the Stage, Score, and Cast windows, media editors, and message
   *   windows. However, the window will not be able to group with any of these windows.
   * - If dockingEnabled is TRUE and type is set to #tool, the MIAW will look and act like
   *   one of tool windows in Director. The window will be able to group with all tool
   *   windows except the Property inspector and the Tool palette.
   * - If dockingEnabled is TRUE and type is set to #dialog, the type is ignored and the
   *   window will be an authoring window.
   * This property is ignored in projectors.
   */
  dockingEnabled = true;

  /**
   * Window property; returns a reference to the window that is behind all other windows.
   * Read-only.
   */
  windowBehind = null;

  /**
   * Window property; returns a reference to the window that is in front of all other windows.
   * Read-only.
   */
  windowInFront = null;

  constructor(name = "") {
    this.name = name;
  }

  /**
   * Window method; closes a window. Closing a window that is already closed has no effect.
   * Be aware that closing a window does not stop the movie in the window nor clear it from
   * memory. This method simply closes the window in which the movie is playing. You can
   * reopen it quickly by using the open() (Window) method. This allows rapid access to
   * windows that you want to keep available. If you want to completely dispose of a window
   * and clear it from memory, use the forget() method. Make sure that nothing refers to the
   * movie in that window if you use the forget() method, or you will generate errors when
   * scripts try to communicate or interact with the forgotten window.
   */
  close() {
    // TODO(subsystems): route through WindowRegistry (per FR-005/FR-036)
  }

  /**
   * Window method; instructs script to close a window and stop its playback when it's no
   * longer in use and no other variables refer to it.
   * Calling forget() on a window also removes that window's reference from the windowList.
   * When the forget() method is called, the window and the movie in a window (MIAW)
   * disappear without calling the stopMovie, closeWindow, or deactivateWindow handlers.
   * If there are many global references to the movie in a window, the window doesn't respond
   * to the forget() method.
   */
  forget() {
    // TODO(subsystems): route through WindowRegistry (per FR-005/FR-036)
  }

  /**
   * Window method; maximizes a window.
   * Use this method when making custom titlebars.
   */
  maximize() {
    // TODO(subsystems): route through WindowRegistry (per FR-005/FR-036)
  }

  /**
   * Window method; minimizes a window.
   * Use this method when making custom titlebars.
   */
  minimize() {
    // TODO(subsystems): route through WindowRegistry (per FR-005/FR-036)
  }

  /**
   * Window method; moves a window behind all other windows.
   */
  moveToBack() {
    // TODO(subsystems): route through WindowRegistry (per FR-005/FR-036)
  }

  /**
   * Window method; moves a window in front of all other windows.
   */
  moveToFront() {
    // TODO(subsystems): route through WindowRegistry (per FR-005/FR-036)
  }

  /**
   * Window method; opens a window and positions it in front of all other windows.
   * If no movie is assigned to the window on which open() is called, the Open File dialog
   * box appears. If the reference to the window object windowObjRef is replaced with a
   * movie's filename, the window uses the filename as the window name. However, a movie must
   * then be assigned to the window by using the window's fileName property. If the reference
   * to the window object windowObjRef is replaced with a window name, the window takes that
   * name. However, a movie must then be assigned to the window by using the window's
   * fileName property. To open a window that uses a movie from a URL, use
   * downloadNetThing() to download the movie's file to a local disk first, and then use the
   * file on the disk. This procedure minimizes problems with waiting for the movie to
   * download. When using a local movie, use preloadMovie() to load at least the first frame
   * of the movie prior to calling open(). This procedure reduces the possibility of movie
   * load delays. Opening a movie in a window is currently not supported in playback using a
   * browser.
   */
  open() {
    // TODO(subsystems): route through WindowRegistry; open()/MIAW deferred per FR-036
  }

  /**
   * Window method; restores a window after it has been maximized.
   * Use this method when making custom titlebars for movies in a window (MIAW).
   */
  restore() {
    // TODO(subsystems): route through WindowRegistry (per FR-005/FR-036)
  }

  /**
   * Windows method. Merges an arbitrary number of window properties, all at once, into the
   * existing set of window properties.
   *
   * @param {object} propList Required. A set of window properties to merge into the existing
   *   set of window properties. The properties are specified by the appearanceOptions and
   *   titlebarOptions properties. In Lingo, propList can be either a comma-separated list of
   *   name/value pairs or a comma-separated list of symbol/value pairs. In JavaScript
   *   syntax, propList can only be a comma-separated list of name/value pairs.
   */
  mergeProps(propList) {
    // TODO(subsystems): route through WindowRegistry (per FR-005/FR-036)
  }
}