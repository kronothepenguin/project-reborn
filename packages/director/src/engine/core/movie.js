import { _score } from "../subsystem/score-slot.js";

export class MovieObject {
  /**
   * Movie property; a string entered during authoring in the Movie Properties dialog box. Read-only.
   */
  aboutInfo = "";

  /**
   * Movie property; Indicates the renderer currently in use by the movie for drawing 3D sprites. This
   * property is equivalent to the getRendererServices().renderer property. Read-only.
   *
   * The possible values of the active3dRenderer property are #openGL, #directX7_0,
   * #directX5_2, and #software. The values #openGL, #directX7_0, and #directX5_2, which are
   * video card drivers, will lead to much faster performance than #software, a software renderer used
   * when none of the first three options are available.
   *
   * Use getRendererServices().renderer to set this property.
   */
  active3dRenderer = null;

  /**
   * Movie property; a list of child objects that have been explicitly added to this list. Read/write.
   *
   * Objects in actorList receive a stepFrame message each time the playhead enters a frame.
   *
   * To add an object to the actorList, use _movie.actorList.append(newScriptObjRef). The
   * object’s stepFrame handler in its parent or ancestor script will then be called automatically at
   * each frame advance.
   *
   * To clear objects from the actorList, set actorList to [ ], which is an empty list.
   *
   * Director doesn’t clear the contents of actorList when branching to another movie, which can
   * cause unpredictable behavior in the new movie. To prevent child objects in the current movie
   * from being carried over to the new movie, insert the statement actorList = [ ] in the
   * prepareMovie handler of the new movie.
   */
  actorList = []; // Might be lingo list

  /**
   * Movie property; will contain information regarding a private cache in future versions of Director.
   * Read/write.
   *
   * This property defaults to TRUE.
   */
  allowCustomCaching = true;

  /**
   * Movie property; sets the availability of the graphic controls in the context menu when playing the
   * movie in a Macromedia Shockwave environment. Read/write.
   *
   * Set this property to FALSE if you would rather have a text menu displayed than the graphic
   * context menu.
   *
   * This property defaults to TRUE.
   */
  allowGraphicMenu = true;

  /**
   * Movie property; sets the availability of the Save control in the context menu when playing the
   * movie in a Shockwave Player environment. Read/write.
   *
   * This property is provided to allow for enhancements in future versions of Shockwave Player.
   *
   * This property defaults to TRUE.
   */
  allowSaveLocal = true;

  /**
   * Movie property; this property is provided to allow for enhancements in future versions
   * of Shockwave Player. Read/write.
   * This property defaults to TRUE.
   */
  allowTransportControl = true;

  /**
   * Movie property; sets the availability of the volume control in the context menu when playing the
   * movie in a Shockwave Player environment. Read/write.
   *
   * When set to TRUE one or the other volume control is active, and is disabled when the property is
   * set to FALSE.
   *
   * This property defaults to TRUE.
   */
  allowVolumeControl = true;

  /**
   * Movie property; determines whether the movie may be stretched or zoomed by the user when
   * playing back in Shockwave Player and ShockMachine. Read/write.
   *
   * Set this property to FALSE to prevent users from changing the size of the movie in browsers and
   * ShockMachine.
   *
   * The property defaults to TRUE.
   */
  allowZooming = true;

  /**
   * Movie property; determines whether the computer automatically beeps when the user clicks on
   * anything except an active sprite (TRUE), or not (FALSE, default). Read/write.
   *
   * Scripts that set beepOn should be placed in frame or movie scripts.
   */
  beepOn = false;

  /**
   * Movie property; determines the visual response of buttons while the mouse button is held down.
   * Read/write.
   *
   * This property applies only to buttons created with the Button tool in the Tool palette.
   *
   * The buttonStyle property can have these values:
   * • 0 (list style: default)—Subsequent buttons are highlighted when the pointer passes over them.
   *   Releasing the mouse button activates the script associated with that button.
   * • 1 (dialog style)—Only the first button clicked is highlighted. Subsequent buttons are not
   *   highlighted. Releasing the mouse button while the pointer is over a button other than the
   *   original button clicked does not activate the script associated with that button.
   */
  buttonStyle = 0;

  /**
   * Movie property; provides named or indexed access to the cast libraries of a movie, whether the
   * movie is active or not. Read-only.
   *
   * The castNameOrNum argument can be either a string that specifies the name of the movie to
   * access or an integer that specifies the number of the movie to access.
   *
   * This property provides functionality similar to the top level castLib() method, except that the
   * castLib() method applies only to the currently active movie.
   */
  castLib = {};

  /**
   * Movie property; determines whether the Stage is centered on the monitor when the movie is
   * loaded (TRUE, default) or not centered (FALSE). Read/write.
   *
   * Place the statement that includes this property in the movie that precedes the movie you want it
   * to affect.
   *
   * This property is useful for checking the Stage location before a movie plays from a projector.
   *
   * Note: Be aware that behavior while playing back in a projector differs between Windows and
   * Macintosh systems. Settings selected during creation of the projector may override this property.
   */
  centerStage = true;

  /**
   * Movie property; enters a string during authoring in the Movie Properties dialog box. This
   * property is provided to allow for enhancements in future versions of Shockwave Player.
   * Read-only.
   */
  copyrightInfo = "";

  /**
   * Movie property; provides access to a list of properties that are applied to the window in which a
   * movie is playing back. Read/write.
   *
   * The displayTemplate property provides access to the properties of the Window object that are
   * used to specify default window settings. Therefore, displayTemplate is used on the Movie
   * object to return or set default window settings in the same way the appearanceOptions and
   * titlebarOptions properties are used on the Window object.
   *
   * The displayTemplate property provides access to the following properties.
   *
   * Property             Description
   * appearanceOptions    A property list that stores appearance options for a window. The appearance
   *                      options are mask, border, metal, dragRegionMask, shadow, and liveresize. For
   *                      more information, see appearanceOptions.
   * dockingEnabled       Determines whether a movie in a window (MIAW) will be dockable when
   *                      opened during authoring. If TRUE, the window can be docked. If FALSE, the
   *                      window cannot be docked. The default value is FALSE. For more information, see
   *                      dockingEnabled.
   * resizable            Determines whether a window is resizable. If TRUE, the window is resizable. If
   *                      FALSE, the window is not resizable. The default value is TRUE. For more
   *                      information, see resizable.
   * title                Returns or sets the title of the display template. For more information,
   *                      see title.
   * titlebarOptions      A property list that stores title bar options for a window. The title bar options are
   *                      icon, visible, closebox, minimizebox, maximizebox, and sideTitlebar. For more
   *                      information, see titlebarOptions.
   * systemTrayIcon       (Microsoft Windows only) Determines whether a window has an associated
   *                      icon in the system tray of a user’s desktop.
   * systemTrayTooltip    (Microsoft Windows only) Determines the string that appears in the tooltip pop-
   *                      up of the system tray icon.
   * type                 Returns or sets the type of a window. If a window’s type is set, all of the
   *                      properties pertaining to that window type are set as well. The types of windows
   *                      are tool, document, and dialog. For more information, see type.
   */
  displayTemplate = {};

  /**
   * Movie and Window property; specifies whether a movie in a window (MIAW) will be a dockable
   * window when opened during authoring. Read/write.
   *
   * This property cannot be accessed directly from a Movie object; you access this property from the
   * Movie object’s displayTemplate property.
   *
   * The default value of this property is FALSE, which specifies that a MIAW will not be dockable
   * when opened during authoring. If this property is set to TRUE, the value of the Window object’s
   * type property determines how the window will appear during authoring.
   * • If dockingEnabled is TRUE and type is set to #document, the MIAW will look and act like a
   *   document windows in Director. The window will appear in the “view port” area and be
   *   dockable with the Stage, Score, and Cast windows, media editors, and message windows.
   *   However, the window will not be able to group with any of these windows.
   * • If dockingEnabled is TRUE and type is set to #tool, the MIAW will look and act like one of
   *   tool windows in Director. The window will be able to group with all tool windows except the
   *   Property inspector and the Tool palette.
   * • If dockingEnabled is TRUE and type is set to #dialog, the type is ignored and the window
   *   will be an authoring window.
   *
   * This property is ignored in projectors.
   */
  dockingEnabled = false;

  /**
   * Movie property; determines whether cut, copy, and paste operations and their keyboard shortcuts
   * function in the current movie. Read/write.
   *
   * When set to TRUE, these text operations function. When set to FALSE, these operations are not
   * allowed. The default is TRUE for movies made in Director 8 and later, FALSE for movies made in
   * versions of Director prior to Director 8.
   */
  editShortCutsEnabled = true;

  /**
   * Movie property; determines whether a sprite with Flash content can make any direct scripting
   * callbacks when using the Flash getURL() method. Read/write.
   *
   * The Flash getURL() method loads a new URL into a blank browser window.
   *
   * If enableFlashLingo is set to TRUE, a sprite with Flash content can execute any valid script
   * command (subject to standard Shockwave Player-safe rules) when getURL() is called.
   *
   * If enableFlashLingo is set to FALSE, a sprite with Flash content is prevented from executing
   * script commands when getURL() is called. The default value of this property is FALSE.
   *
   * This property is useful when creating a movie that displays Flash content of unknown origin,
   * such as in a projector that browses a system folder for SWF files, or a movie with Shockwave
   * content that accepts a URL for a SWF file from an end user.
   */
  enableFlashLingo = false;

  /**
   * Movie property; determines whether a user can quit to the Windows desktop or Macintosh
   * Finder from projectors (FALSE, default) or not (TRUE). Read/write.
   *
   * The user can quit to the desktop by pressing Control+period (Windows) or Command+period
   * (Macintosh), Control+Q (Windows) or Command+Q (Macintosh), or Control+W (Windows)
   * or Command+W (Macintosh); the Escape key is also supported in Windows.
   */
  exitLock = false;

  /**
   * Movie property; returns the number of unused bytes in the current movie caused by changes to
   * the cast libraries and cast members within a movie. Read-only.
   *
   * The Save and Compact and Save As commands rewrite the file to delete this free space.
   *
   * When the movie has no unused space, fileFreeSize returns 0.
   */
  fileFreeSize = 0;

  /**
   * Movie property; returns the number of bytes in the current movie saved on disk. Read-only.
   *
   * This is the same number returned when selecting File Properties in Windows or Get Info in the
   * Macintosh Finder.
   */
  fileSize = 0;

  /**
   * Movie property; indicates the version, as a string, of Director in which the movie was last saved.
   * Read-only.
   */
  fileVersion = "";

  /**
   * Movie property; determines whether the Stage size remains the same when you load a new movie
   * (TRUE, default), or not (FALSE), regardless of the Stage size saved with that movie, or the setting
   * for the centerStage. Read/write.
   *
   * The fixStageSize property cannot change the Stage size for a movie that is currently playing.
   */
  fixStageSize = true;

  /**
   * Movie property; returns the number of the current frame of the movie. Read-only.
   */
  frame = 0;

  /**
   * Movie property; identifies the label assigned to the current frame. Read/write during a Score
   * recording session only.
   *
   * When the current frame has no label, the value of the frameLabel property is 0.
   */
  frameLabel = 0;

  /**
   * Movie property; identifies the cast member number of the palette used in the current frame,
   * which is either the current palette or the palette set in the current frame. Read/write during a
   * Score recording session only.
   *
   * When you want exact control over colors, use Shockwave Player.
   */
  framePalette = 0;

  /**
   * Movie property; contains the unique cast member number of the frame script assigned to the
   * current frame. Read/write during a Score recording session only.
   *
   * During a Score generation session, you can also assign a frame script to the current frame by
   * setting the frameScript property.
   *
   * If there is no frame script assigned to the current frame, this property returns 0.
   */
  frameScript = 0;

  /**
   * Movie property; determines the number of the cast member assigned to the first sound channel in
   * the current frame. Read/write.
   *
   * This property can also be set during a Score recording session.
   */
  frameSound1 = 0;

  /**
   * Movie property; determines the number of the cast member assigned to the second sound
   * channel in the current frame. Read/write.
   *
   * This property can also be set during a Score recording session.
   */
  frameSound2 = 0;

  /**
   * Movie property; indicates the tempo assigned to the current frame. Read/write during a Score
   * recording session only.
   */
  frameTempo = 15;

  /**
   * Movie property; specifies the number of the transition cast member assigned to the current frame.
   * Read/write only during a Score recording session to specify transitions.
   */
  frameTransition = 0;

  /**
   * Movie property; determines the maximum number of ticks that passes until the movie sends an
   * idle message. Read/write.
   *
   * The default value is 1, which tells the movie to send idle handler messages no more than 60
   * times per second.
   *
   * When the playhead enters a frame, Director starts a timer, repaints the appropriate sprites on the
   * Stage, and issues an enterFrame event. Then, if the amount of time set for the tempo has elapsed,
   * Director generates an exitFrame event and goes to the next specified frame; if the amount of
   * time set for this frame hasn’t elapsed, Director waits until the time runs out and periodically
   * generates an idle message. The amount of time between idle events is determined by
   * idleHandlerPeriod.
   *
   * Possible settings for idleHandlerPeriod are:
   * • 0—As many idle events as possible
   * • 1—Up to 60 per second
   * • 2—Up to 30 per second
   * • 3—Up to 20 per second
   * • n—Up to 60/n per second
   *
   * The number of idle events per frame also depends on the frame rate of the movie and other
   * activity, including whether scripts are executing. If the tempo is 60 frames per second (fps) and
   * the idleHandlerPeriod value is 1, one idle event per frame occurs. If the tempo is 20 fps, three
   * idle events per frame occur. Idle time results when Director doesn’t have a current task to
   * perform and cannot generate any events.
   *
   * In contrast, if the idleHandlerPeriod property is set to 0 and the tempo is very low, thousands
   * of idle events can be generated.
   *
   * The default value for this property is 1.
   */
  idleHandlerPeriod = 1;

  /**
   * Movie property; determines when the preLoad() and preLoadMember() methods try to load
   * cast members during idle periods. Read/write.
   *
   * Idle periods can be one of the following values:
   * • 0—Does not perform idle loading
   * • 1—Performs idle loading when there is free time between frames
   * • 2—Performs idle loading during idle events
   * • 3—Performs idle loading as frequently as possible
   *
   * The idleLoadMode property performs no function and works only in conjunction with the
   * preLoad() and preLoadMember() methods.
   *
   * Cast members that were loaded using idle loading remain compressed until the movie uses
   * them. When the movie plays back, it may have noticeable pauses while it decompresses the
   * cast members.
   */
  idleLoadMode = 0;

  /**
   * Movie property; determines the number of ticks that Director waits before trying to load cast
   * members waiting to be loaded. Read/write.
   *
   * The default value for idleLoadPeriod is 0, which instructs Director to service the load queue as
   * frequently as possible.
   */
  idleLoadPeriod = 0;

  /**
   * Movie property; identifies or tags with a number the cast members that have been queued for
   * loading when the computer is idle. Read/write.
   *
   * The idleLoadTag property is a convenience that identifies the cast members in a group that you
   * want to preload, and can be any number that you choose.
   */
  idleLoadTag = 0;

  /**
   * Movie property; determines the maximum number of bytes that Director can load when it
   * attempts to load cast members from the load queue. Read/write.
   *
   * The default value of idleReadChunkSize is 32K.
   */
  idleReadChunkSize = 32 * 1024;

  /**
   * Description
   * Movie and bitmap cast member property; indicates the type of compression that Director applies
   * to internal (non-linked) bitmap cast members when saving a movie in Shockwave Player format.
   * Read/write.
   *
   * Valid values for imageCompression include the following:
   *
   * Value            Meaning
   * #standard        Use the Director standard internal compression format.
   * #movieSetting    Use the compression settings of the movie, as stored in the
   *                  _movie.imageCompression property. This is the default value for image formats
   *                  not restricted to standard compression.
   * #jpeg            Use JPEG compression. See imageQuality.
   *
   * You normally set this property in the Director Publish Settings dialog box.
   */
  imageCompression = Symbol.for("standard");

  /**
   * Movie and bitmap cast member property; indicates the level of compression to use when a movie’s
   * imageCompression property is set to #jpeg. Read/write during authoring only.
   *
   * The range of acceptable values is 0–100. Zero yields the lowest image quality and highest
   * compression; 100 yields the highest image quality and lowest compression.
   *
   * You can set this property only during authoring and it has no effect until the movie is saved in
   * Shockwave Player format.
   */
  imageQuality = 100;

  /**
   * Movie property; lets the user set the focus for keyboard input (without controlling the cursor’s
   * insertion point) on a particular text sprite currently on the screen. Read/write.
   *
   * This is the equivalent to using the Tab key when the autoTab property of the cast member
   * is selected.
   *
   * Setting keyboardFocusSprite to -1 returns keyboard focus control to the Score, and setting it to
   * 0 disables keyboard entry into any editable sprite.
   */
  keyboardFocusSprite = -1;

  /**
   * Movie property; the number of the last channel in the movie, as entered in the Movie Properties
   * dialog box. Read-only.
   *
   * To see an example of lastChannel used in a completed movie, see the QT and Flash movie in
   * the Learning/Lingo Examples folder inside the Director application folder.
   */
  lastChannel;

  /**
   * Movie property; displays the number of the last frame in the movie. Read-only.
   */
  lastFrame = 10;

  /**
   * Movie property; contains a script property list of the markers in the Score. Read-only.
   *
   * The list is of the format:
   *
   * frameNumber: "markerName"
   */
  markerList = [];

  /**
   * Movie property; provides indexed or named access to the members of a movie’s cast library.
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
   * Movie property; determines whether the movie remaps (TRUE) or does not remap (FALSE,
   * default) palettes for cast members whose palettes are different from the current movie palette.
   * Read/write.
   *
   * The effect of this property is similar to that of the Remap Palettes When Needed check box in the
   * Movie Properties dialog box.
   *
   * To display different bitmaps with different palettes simultaneously, set paletteMapping to TRUE.
   * Director looks at each onscreen cast member’s reference palette (the palette assigned in its Cast
   * Member Properties dialog box) and, if it is different from the current palette, finds the closest
   * match for each pixel in the new palette.
   *
   * The colors of the nonmatching bitmap will be close to the original colors.
   *
   * Remapping consumes processor time, and it’s usually better to adjust the bitmap’s palette
   * in advance.
   *
   * Remapping can also produce undesirable results. If the palette changes in the middle of a sprite
   * span, the bitmap immediately remaps to the new palette and appears in the wrong colors.
   * However, if anything refreshes the screen—a transition or a sprite moving across the Stage—then
   * the affected rectangle on the screen appears in remapped colors.
   */
  paletteMapping = false;

  /**
   * Movie property; indicates the pathname of the folder in which the current movie is located.
   * Read-only.
   *
   * For pathnames that work on both Windows and Macintosh computers, use the @ pathname
   * operator.
   *
   * To see an example of path used in a completed movie, see the Read and Write Text movie in the
   * Learning/Lingo Examples folder inside the Director application folder.
   */
  path = "";

  /**
   * Movie property; allows you to get or set the default renderer used to draw 3D sprites within a
   * particular movie if that renderer is available on the client machine. Read/write.
   *
   * If the specified renderer is not available on the client machine, the movie selects the most suitable
   * available renderer.
   *
   * The possible values for this property are as follows:
   * • #openGL specifies the openGL drivers for a hardware acceleration that work with both
   *   Macintosh and Windows platforms.
   * • #directX7_0 specifies the DirectX 7 drivers for hardware acceleration that work only with
   *   Windows platforms.
   * • #directX5_2 specifies the DirectX 5.2 drivers for hardware acceleration that work only with
   *   Windows platforms.
   * • #software specifies the Director built-in software renderer that works with both Macintosh
   *   and Windows platforms.
   * • #auto specifies that the most suitable renderer should be chosen. This is the default value for
   *   this property.
   *
   * The value set for this property is used as the default for the Renderer Services object’s
   * renderer property.
   *
   * This property differs from the getRendererServices() object’s renderer property in that the
   * preferred3dRenderer specifies the preferred renderer to use, whereas the
   * getRendererServices() object’s renderer property indicates what renderer is actually being
   * used by the movie.
   *
   * Shockwave Player users have the option of specifying the renderer of their choice using the 3D
   * Renderer context menu in Shockwave Player. If the user selects the “Obey content settings”
   * option, the renderer specified by the renderer or preferred3DRenderer property is used to
   * draw the movie (if available on the user’s system), otherwise, the renderer selected by the user
   * is used.
   */
  preferred3dRenderer = Symbol.for("auto");

  /**
   * Movie property; specifies whether pressing keys or clicking the mouse can stop the preloading of
   * cast members (TRUE) or not (FALSE, default). Read/write.
   *
   * Setting this property affects the current movie.
   */
  preLoadEventAbort = false;

  /**
   * Movie property; determines which Score is associated with the current movie. Read/write.
   *
   * This property can be useful for storing the current contents of the Score before wiping out and
   * generating a new one or for assigning the current Score contents to a film loop.
   */
  score = {};

  /**
   * Movie property; determines which channels are selected in the Score window. Read/write.
   *
   * The information is formatted as a linear list of linear lists. Each contiguous selection is in a list
   * format consisting of the starting channel number, ending channel number, starting frame
   * number, and ending frame number. Specify sprite channels by their channel numbers; use the
   * following numbers to specify the other channels.
   *
   * To specify:              Use:
   * Frame script channel     0
   * Sound channel 1          -1
   * Sound channel 2          -2
   * Transition channel       -3
   * Palette channel          -4
   * Tempo channel            -5
   *
   * You can select discontinuous channels or frames.
   */
  scoreSelection = 0;

  /**
   * Movie property; provides indexed or named access to the script cast members of a movie.
   * Read-only.
   *
   * The scriptNameOrNum argument can be either a string that specifies the name of the script cast
   * member or an integer that specifies the number of the script cast member.
   * • If scriptNameOrNum is a string, the script property provides access to the script cast member,
   *   regardless of which cast library contains that member.
   * • If scriptNameOrNum is an integer, the script property provides access only to the script cast
   *   member found within the first cast library of the referenced movie; you cannot use indexed
   *   access to specify a cast library other than the first one.
   */
  script = {};

  /**
   * Movie property; provides indexed or named access to a movie sprite. Read-only.
   *
   * The spriteNameOrNum argument can be either a string that specifies the name of the sprite or an
   * integer that specifies the number of the sprite.
   */
  sprite = {};

  /**
   * Movie property; refers to the main movie. Read-only.
   *
   * This property is useful when sending a message to the main movie from a child movie.
   */
  stage;

  /**
   * Movie property; a linear list containing all currently active timeout objects. Read-only.
   *
   * Use the forget() method to delete a timeout object.
   *
   * Timeout objects are added to the timeoutList with the new() method.
   */
  timeoutList = [];

  /**
   * Movie property; specifies the amount of information that is displayed about cast members as they
   * load. Read/write.
   *
   * Valid values for traceLoad are as follows.
   * • 0—Displays no information (default).
   * • 1—Displays cast members’ names.
   * • 2—Displays cast members’ names, the number of the current frame, the movie name, and the
   *   file seek offset (the relative amount the drive had to move to load the media).
   */
  traceLoad = 0;

  /**
   * Movie property; specifies the name of the file in which the Message window display is written.
   * Read/write.
   *
   * You can close the file by setting the traceLogFile property to EMPTY (Lingo) or an empty string
   * “ “ (JavaScript syntax). Any output that would appear in the Message window is written into this
   * file. You can use this property for debugging when running a movie in a projector and when
   * authoring.
   */
  traceLogFile = "";

  /**
   * Movie property; specifies whether the movie’s trace function is on (TRUE) or off (FALSE).
   * Read/write.
   *
   * When traceScript is on, the Message window displays each line of script that is being executed.
   */
  traceScript = false;

  /**
   * Movie property; determines whether the Stage is updated during Score recording (FALSE) or
   * not (TRUE). Read/write.
   *
   * You can keep the Stage display constant during a Score recording session by setting updateLock
   * to TRUE before script updates the Score. If updateLock is FALSE, the Stage updates to show a new
   * frame each time the frame is entered.
   *
   * You can also use updateLock to prevent unintentional Score updating when leaving a frame, such
   * as when you temporarily leave a frame to examine properties in another frame.
   *
   * Although this property can be used to mask changes to a frame during run time, be aware that
   * changes to field cast members appear immediately when the content is modified, unlike changes
   * to location or members with other sprites, which are not updated until this property is turned off.
   */
  updateLock = false;

  /**
   * Movie property; determines whether to use faster (TRUE) or slower (FALSE, default) quad
   * calculation operations. Read/write.
   *
   * When set to TRUE, Director uses a faster, less precise method for calculating quad operations. Fast
   * quads calculations are good for simple rotation and skew sprite effects.
   *
   * When set to FALSE, Director uses the slower, default quad calculation method that provides more
   * visually pleasing results when using quads for distortion and other arbitrary effects.
   *
   * Simple sprite rotation and skew operations always use the fast quad calculation method, regardless
   * of this setting. Setting useFastQuads to TRUE will not result in an increase in the speed of these
   * simple operations.
   */
  useFastQuads = false;

  /**
   * Movie property; displays a linear property list of all Xtra extensions in the Movies/Xtras dialog
   * box that have been added to the movie. Read-only.
   *
   * Two possible properties can appear in xtraList:
   * • #filename—Specifies the filename of the Xtra extension on the current platform. It is possible
   *   to have a list without a #filename entry, such as when the Xtra extension exists only on one
   *   platform.
   * • #packageurl—Specifies the location, as a URL, of the download package specified by
   *   #packagefiles.
   * • #packagefiles—Set only when the Xtra extension is marked for downloading. The value
   *   of this property is another list containing a property list for each file in the download package
   *   for the current platform. The properties in this subproperty list are #name and #version,
   *   which contain the same information as found in xtraList (Player).
   */
  xtraList = {};

  /**
   * Movie method; starts a Score generation session.
   *
   * When you call beginRecording(), the playhead automatically advances one frame and begins
   * recording in that frame. To avoid this behavior and begin recording in the frame in which
   * beginRecording() is called, place a statement such as _movie.go(_movie.frame - 1) between
   * the calls to beginRecording() and endRecording().
   *
   * Only one update session in a movie can be active at a time.
   *
   * Every call to beginRecording() must be matched by a call to endRecording(), which ends the
   * Score generation session.
   */
  beginRecording() {}

  /**
   * Movie method; cancels the loading of all cast members that have the specified load tag.
   *
   * @param {number} intLoadTag An integer that specifies a group of cast members that have been queued
   * for loading when the computer is idle.
   */
  cancelIdleLoad(intLoadTag) {}

  /**
   * Movie method; clears all sprite channels in a frame during Score recording.
   */
  clearFrame() {}

  /**
   * Movie method; returns an integer whose value depends on the horizontal coordinates of the left
   * and right sides of a sprite.
   *
   * The returned integer can be one of three possible values.
   * • If the intPosn parameter is between the values of the sprite’s left and right coordinates, the
   * returned integer equals intPosn.
   * • If the intPosn parameter is less than the value of the sprite’s left coordinate, the returned
   * integer changes to the value of the sprite’s left coordinate.
   * • If the intPosn parameter is greater than the value of the sprite’s right coordinate, the returned
   * integer changes to the value of the sprite’s right coordinate.
   *
   * This method does not change the sprite’s properties.
   *
   * Both the constrainH() and constrainV() methods constrain only one axis each.
   *
   * @param {number} intSpriteNum An integer that specifies the sprite whose horizontal coordinates are
   * evaluated against intPosn.
   * @param {number} intPosn An integer to be evaluated against by the horizontal coordinates of the left and
   * right sides of the sprite identified by intSpriteNum.
   */
  constrainH(intSpriteNum, intPosn) {}

  /**
   * Movie method; returns an integer whose value depends on the vertical coordinates of the top and
   * bottom sides of a sprite.
   *
   * The returned integer can be one of three possible values.
   * • If the intPosn parameter is between the values of the sprite’s top and bottom coordinates, the
   *   returned integer equals intPosn.
   * • If the intPosn parameter iis less than the value of the sprite’s top coordinate, the returned
   *   integer changes to the value of the sprite’s top coordinate.
   * • If the intPosn parameter iis greater than the value of the sprite’s bottom coordinate, the
   *   returned integer changes to the value of the sprite’s bottom coordinate.
   *
   * This method does not change the sprite’s properties.
   *
   * Both the constrainV() and constrainH()s constrain only one axis each.
   *
   * @param {number} intSpriteNum An integer that identifies the sprite whose vertical coordinates are
   * evaluated against intPosn.
   * @param {number} intPosn An integer to be evaluated against by the vertical coordinates of the left and
   * right sides of the sprite identified by intSpriteNum.
   */
  constrainV(intSpriteNum, intPosn) {}

  /**
   * Movie method; pauses the playhead for a given amount of time.
   *
   * The only mouse and keyboard activity possible during this time is stopping the movie by pressing
   * Control+Alt+period (Windows) or Command+period (Macintosh). Because it increases the time
   * of individual frames, delay() is useful for controlling the playback rate of a sequence of frames.
   *
   * The delay() method can be applied only when the playhead is moving. However, when delay()
   * is in effect, handlers still run; only the playhead halts, not script execution. Place scripts that use
   * delay() in either an enterFrame or exitFrame handler.
   *
   * To mimic the behavior of a halt in a handler when the playhead is not moving, use the
   * milliseconds property of the System object and wait for the specified amount of time to pass
   * before exiting the frame.
   *
   * @param {number} intTicks An integer that specifies the number of ticks to pause the playhead. Each
   * tick is 1/60 of a second.
   */
  delay(intTicks) {}

  /**
   * Movie method; deletes the current frame and makes the next frame the new current frame during
   * a Score generation session only.
   */
  deleteFrame() {}

  /**
   * Movie method; duplicates the current frame and its content, inserts the duplicate frame after the
   * current frame, and then makes the duplicate frame the current frame. This method can be used
   * during Score generation only.
   *
   * This method performs the same function as the insertFrame() method.
   */
  duplicateFrame() {}

  /**
   * Movie method; ends a Score update session.
   *
   * You can resume control of Score channels through scripting after calling endRecording().
   */
  endRecording() {}

  /**
   * Movie method; forces completion of loading for all the cast members that have the specified
   * load tag.
   *
   * @param {number} intLoadTag An integer that specifies the load tag of the cast members to be loaded.
   */
  finishIdleLoad(intLoadTag) {}

  /**
   * Movie method; for Director movies, projectors, and movies with Shockwave content, determines
   * whether the cast members of a frame or range of frames have been downloaded.
   *
   * This method returns TRUE if the specified cast members have been downloaded, and FALSE if not.
   *
   * For a demonstration of the frameReady() method used in a Director movie, see the sample
   * movie “Streaming Shockwave” in Director Help.
   *
   * @param {number} frameNumA Required if testing whether the cast members in a range of frames have been
   * downloaded. An integer that specifies the first frame in the range.
   * @param {number} frameNumB Required if testing whether the cast members in a range of frames have been
   * downloaded. An integer that specifies the last frame in the range.
   */
  frameReady(frameNumA, frameNumB) {}

  /**
   * Movie method; causes the playhead to branch to a specified frame in a specified movie.
   *
   * This method can be used to tell the playhead to loop to the previous marker, and is a convenient
   * means of keeping the playhead in the same section of the movie while script remains active.
   *
   * It is best to use marker labels for frameNameOrNum instead of frame numbers; editing a movie can
   * cause frame numbers to change. Using marker labels also makes it easier to read scripts.
   *
   * Calling go() with the movieName parameter loads frame 1 of the movie. If go() is called from
   * within a handler, the handler in which it is placed continues executing. To suspend the handler
   * while playing the movie, use the play() method, which may be followed by a subsequent call to
   * playDone() to return.
   *
   * When you specify a movie to play, specify its path if the movie is in a different folder, but to
   * prevent a potential load failure, don’t include the movie’s .dir, .dxr, or .dcr file extension.
   *
   * To more efficiently go to a movie at a URL, use the downloadNetThing() method to download
   * the movie file to a local disk first, and then use the go() method with the movieName parameter
   * to go to that movie on the local disk.
   *
   * The goLoop() method sends the playhead to the previous marker in a movie, which is a
   * convenient means of keeping the playhead in the same section of the movie while Lingo or
   * JavaScript syntax remains active.
   *
   * The following are reset when a movie is loaded: beepOn and constraint properties;
   * keyDownScript, mouseDownScript, and mouseUpScript; cursor and immediate sprite
   * properties; cursor() and puppetSprite() methods; and custom menus. However, the
   * timeoutScript is not reset when loading a movie.
   *
   * @param {string} frameNameOrNum A string that specifies the marker label of the frame to which the
   * playhead branches, or an integer that specifies the number of the frame to which the playhead
   * branches.
   * @param {string} movieName A string that specifies the movie that contains the frame specified by
   * frameNameOrNum. This value must specify a movie file; if the movie is in another folder,
   * movieName must also specify the path.
   */
  go(frameNameOrNum, movieName) {
    _score.go(frameNameOrNum);
  }

  /**
   * Movie method; sends the playhead to the previous marker in the movie, either one marker back
   * from the current frame if the current frame does not have a marker, or to the current frame if the
   * current frame has a marker.
   *
   * If no markers are to the left of the playhead, the playhead branches to:
   * • The next marker to the right if the current frame does not have a marker.
   * • The current frame if the current frame has a marker.
   * • Frame 1 if the movie contains no markers.
   */
  goLoop() {
    _score.goLoop();
  }

  /**
   * Movie method; sends the playhead to the next marker in the movie.
   *
   * If no markers are to the right of the playhead, the playhead goes to the last marker in the movie or
   * to frame 1 if there are no markers in the movie.
   */
  goNext() {
    _score.goNext();
  }

  /**
   * Movie method; sends the playhead to the previous marker in the movie.
   *
   * This marker is two markers back from the current frame if the current frame does not have a
   * marker or one marker back from the current frame if the current frame has a marker.
   *
   * If no markers are to the left of the playhead, the playhead branches to one of the following:
   * • The next marker to the right if the current frame does not have a marker
   * • The current frame if the current frame has a marker
   * • Frame 1 if the movie contains no markers
   */
  goPrevious() {
    _score.goPrevious();
  }

  /**
   * Movie method; reports whether all cast members with the given tag have been loaded (TRUE) or
   * are still waiting to be loaded (FALSE).
   *
   * @param {number} intLoadTag An integer that specifies the load tag for the cast members to test.
   */
  idleLoadDone(intLoadTag) {}

  /**
   * Movie method; duplicates the current frame and its content.
   *
   * The duplicate frame is inserted after the current frame and then becomes the current frame.
   *
   * This method can be used only during a Score recording session and performs the same function as
   * the duplicateFrame() method.
   */
  insertFrame() {}

  /**
   * Movie method; indicates the frame associated with a marker label.
   *
   * The parameter stringMarkerName should be a label in the current movie; if it’s not, this method
   * returns 0.
   *
   * @param {string} stringMarkerName A string that specifies the name of the marker label associated with
   * a frame.
   */
  label(stringMarkerName) {}

  /**
   * Movie method; returns the frame number of markers before or after the current frame.
   *
   * This method is useful for implementing a Next or Previous button or for setting up an
   * animation loop.
   *
   * If the parameter markerNameOrNum is an integer, it can evaluate to any positive or negative integer
   * or 0. For example:
   * • marker(2)—Returns the frame number of the second marker after the current frame.
   * • marker(1)—Returns the frame number of the first marker after the current frame.
   * • marker(0)—Returns the frame number of the current frame if the current frame is marked, or
   *   the frame number of the previous marker if the current frame is not marked.
   * • marker(-1)—Returns the frame number of the first marker before the marker(0).
   * • marker(-2)—Returns the frame number of the second marker before the marker(0).
   *
   * If the parameter markerNameOrNum is a string, marker() returns the frame number of the first
   * frame whose marker label matches the string.
   *
   * @param {string} markerNameOrNum A string that specifies a marker label, or an integer that specifies a
   * marker number.
   */
  marker(markerNameOrNum) {}

  /**
   * Movie method; merges an arbitrary number of display template properties into the existing set of
   * display template properties all at once.
   *
   * @param {*} propList A property list that contains the display template properties to merge into
   * the existing set of display template properties. In Lingo, propList can be either a comma-
   * separated list of name/value pairs or a comma-separated list of symbol/value pairs. In JavaScript
   * syntax, propList can only be a comma-separated list of name/value pairs.
   */
  mergeDisplayTemplate(propList) {}

  /**
   * Movie method; creates a new cast member and allows you to assign individual property values to
   * child objects.
   * 
   * For new cast members, the symbol or stringMemberType parameter sets the cast member’s type.
   * Possible predefined values correspond to the existing cast member types: #bitmap, #field, and so
   * on. The newMember() method can also create Xtra cast member types, which can be identified by
   * any name that the author chooses.
   * 
   * It’s also possible to create a new color cursor cast member using the Custom Cursor Xtra. Use
   * newMember(#cursor) and set the properties of the resulting cast member to make them available
   * for use.
   * 
   * After newMember() is called, the new cast member is placed in the first empty cast library slot.
   * 
   * When the argument for the new() function is a parent script, the new function creates a
   * child object. The parent script should include an on new handler that sets the child object’s initial
   * state or property values and returns the me reference to the child object.
   * 
   * The child object has all the handlers of the parent script. The child object also has the same
   * property variable names that are declared in the parent script, but each child object has its own
   * values for these properties.
   * 
   * Because a child object is a value, it can be assigned to variables, placed in lists, and passed
   * as a parameter.
   * 
   * As with other variables, you can use the put() method to display information about a child
   * object in the Message window.
   * 
   * When new() is used to create a timeout object, the timeoutPeriod sets the number of milliseconds
   * between timeout events sent by the timeout object. The #timeoutHandler is a symbol that
   * identifies the handler that will be called when each timeout event occurs. The targetObject
   * identifies the name of the child object that contains the #timeoutHandler. If no targetObject
   * is given, the #timeoutHandler is assumed to be in a movie script.
   * 
   * When a timeout object is created, it enables its targetObject to receive the system events
   * prepareMovie, startMovie, stopMovie, prepareFrame, and exitFrame. To take advantage of
   * this, the targetObject must contain handlers for these events. The events do not need to be
   * passed in order for the rest of the movie to have access to them.
   * 
   * To see an example of newMember() used in a completed movie, see the Parent Scripts, and Read
   * and Write Text movies in the Learning/Lingo folder inside the Director application folder.
   * 
   * @param {symbol | string} symbolOrStringMemberType A string that specifies the type of the new cast member.
   */
  newMember(symbolOrStringMemberType) {}

  /**
   * Movie method; preloads cast members in the specified frame or range of frames into memory
   * and stops when memory is full or when all of the specified cast members have been preloaded,
   * as follows:
   * • When used without arguments, this method preloads all cast members used from the current
   *   frame to the last frame of a movie.
   * • When used with one argument, frameNameOrNum, this method preloads all cast members used
   *   in the range of frames from the current frame to the frame frameNameOrNum, as specified by
   *   the frame number or label name.
   * • When used with two arguments, fromFrameNameOrNum and toFrameNameOrNum, preloads all
   *   cast members used in the range of frames from the frame fromFrameNameOrNum to the frame
   *   toFrameNameOrNum, as specified by the frame number or label name.
   *
   * The preLoad() method also returns the number of the last frame successfully loaded. To obtain
   * this value, use the result() method.
   *
   * @param {string | number} [frameNameOrNum] Optional. A string that specifies the specific frame to preload, or an integer that
   * specifies the number of the specific frame to preload.
   * @param {string | number} [fromFrameNameOrNum] Required if preloading a range of frames. A string that specifies the name
   * of the label of the first frame in the range of frames to preload, or an integer that specifies the
   * number of the first frame in the range of frames to preload.
   * @param {string | number} [toFrameNameOrNum] Required if preloading a range of frames. A string that specifies the name of
   * the label of the last frame in the range of frames to preload, or an integer that specifies the number
   * of the last frame in the range of frames to preload.
   */
  preLoad(frameNameOrNum, fromFrameNameOrNum, toFrameNameOrNum) {}

  /**
   * Movie method; preloads cast members and stops when memory is full or when all of the specified
   * cast members have been preloaded.
   *
   * This method returns the cast member number of the last cast member successfully loaded. To
   * obtain this value, use the result() method.
   *
   * When used without arguments, preLoadMember() preloads all cast members in the movie.
   * When used with the memberObjRef argument, preLoadMember() preloads just that cast member.
   * If memberObjRef is an integer, only the first cast library is referenced. If memberObjRef is a string,
   * the first member with the string as its name will be used.
   * When used with the arguments fromMemNameOrNum and toMemNameOrNum, preLoadMember()
   * preloads all cast members in the range specified by the cast member numbers or names.
   *
   * @param {*} [memberObjRef] Optional. A reference to the cast member to preload.
   * @param {string | number} [fromMemNameOrNum] Required when preloading a range of cast members. A string or an integer
   * that specifies the first cast member in the range of cast members to preload.
   * @param {string | number} [toMemNameOrNum] Required when preloading a range of cast members. A string or an integer that
   * specifies the first cast member in the range of cast members to preload.
   */
  preLoadMember(memberObjRef, fromMemNameOrNum, toMemNameOrNum) {}

  /**
   * Movie method; preloads the data and cast members associated with the first frame of the specified
   * movie. Preloading a movie helps it start faster when it is started by the go() or play() methods.
   *
   * To preload cast members from a URL, use preloadNetThing() to load the cast members directly
   * into the cache, or use downloadNetThing() to load a movie on a local disk from which you can
   * load the movie into memory and minimize downloading time.
   *
   * @param {string} stringMovieName Required. A string that specifies the name of the movie to preload.
   */
  preLoadMovie(stringMovieName) {}

  /**
   * Movie method; prints whatever is displayed on the Stage in each frame, whether or not the frame
   * is selected, starting at the frame specified by startFrame. Optionally, you can supply endFrame
   * and a reduction (redux) value (100%, 50%, or 25%).
   *
   * The frame being printed need not be currently displayed. This command always prints at 72 dots
   * per inch (dpi), bitmaps everything on the screen (text will not be as smooth in some cases), prints
   * in portrait (vertical) orientation, and ignores Page Setup settings. For more flexibility when
   * printing from within Director, see PrintOMatic Lite Xtra, which is on the installation disk.
   *
   * @param {string | number} startFrameNameOrNum Required. A string or integer that specifies the name or number of the
   * first frame to print.
   * @param {string | number} [endFrameNameOrNum] Optional. A string or integer that specifies the name or number of the last
   * frame to print.
   * @param {number} [redux] Optional. An integer that specifies the reduction value. Valid values are 100, 50, or 25.
   */
  printFrom(startFrameNameOrNum, endFrameNameOrNum, redux) {}

  /**
   * Movie method; causes the palette channel to act as a puppet and lets script override the palette
   * setting in the palette channel of the Score and assign palettes to the movie.
   *
   * The puppetPalette() method sets the current palette to the palette cast member specified by
   * palette. If palette evaluates to a string, it specifies the cast library name of the palette. If
   * palette evaluates to an integer, it specifies the member number of the palette.
   *
   * For best results, use the puppetPalette() method before navigating to the frame on which the
   * effect will occur so that Director can map to the desired palette before drawing the next frame.
   *
   * You can fade in the palette by replacing speed with an integer from 1 (slowest) to 60 (fastest). You
   * can also fade in the palette over several frames by replacing frames with an integer for the
   * number of frames.
   *
   * A puppet palette remains in effect until you turn it off using the syntax
   * _movie.puppetPalette(0). No subsequent palette changes in the Score are obeyed when the
   * puppet palette is in effect.
   *
   * Note: The browser controls the palette for the entire Web page. Thus, Shockwave Player always
   * uses the browser’s palette.
   *
   * @param {string | number} palette Required. A string or integer that specifies the name or number of the new palette.
   * @param {number} [speed] Optional. An integer that specifies the speed of a fade. Valid values range from 1 to 60.
   * @param {number} [frames] Optional. An integer that specifies the number of frames over which a fade takes place.
   */
  puppetPalette(palette, speed, frames) {}

  /**
   * Movie method; determines whether a sprite channel is a puppet and under script control (TRUE)
   * or not a puppet and under the control of the Score (FALSE).
   *
   * While the playhead is in the same sprite, turning off the sprite channel’s puppetting using the
   * syntax puppetSprite(intSpriteNum, FALSE) resets the sprite’s properties to those in the Score.
   * The sprite channel’s initial properties are whatever the channel’s settings are when the
   * puppetSprite() method is executed. You can use script to change sprite properties as follows:
   *
   * • If a sprite channel is a puppet, any changes that script makes to the channel’s sprite properties
   *   remain in effect after the playhead exits the sprite.
   * • If a sprite channel is not a puppet, any changes that script makes to a sprite last for the life of
   *   the current sprite only.
   *
   * The channel must contain a sprite when you use the puppetSprite() method.
   *
   * Making the sprite channel a puppet lets you control many sprite properties—such as member,
   * locH, and width—from script after the playhead exits the sprite.
   *
   * Use the syntax puppetSprite(intSpriteNum, FALSE) to return control to the Score when you
   * finish controlling a sprite channel from script and to avoid unpredictable results that may occur
   * when the playhead is in frames that aren’t intended to be puppets.
   *
   * Note: Version 6 of Director introduced autopuppetting, which made it unnecessary to explicitly
   * puppet a sprite under most circumstances. Explicit control is still useful if you want to retain complete
   * control over a channel’s contents even after a sprite span has finished playing.
   *
   * @param {number} intSpriteNum Required. An integer that specifies the sprite channel to test.
   * @param {boolean} bool Required. A boolean value that specifies whether a sprite channel is under script control
   * (TRUE) or under the control of the Score (FALSE).
   */
  puppetSprite(intSpriteNum, bool) {}

  /**
   * Movie method; causes the tempo channel to act as a puppet and sets the tempo to a specified
   * number of frames.
   *
   * When the tempo channel is a puppet, script can override the tempo setting in the Score and
   * change the tempo assigned to the movie.
   *
   * It’s unnecessary to turn off the puppet tempo condition to make subsequent tempo changes in the
   * Score take effect.
   *
   * Note: Although it is theoretically possible to achieve frame rates up to 30,000 frames per second
   * (fps) with the puppetTempo() method, you could do this only with little animation and a very powerful
   * machine.
   *
   * @param {number} intTempo Required. An integer that specifies the tempo.
   */
  puppetTempo(intTempo) {
    _score.setTempo(intTempo);
  }

  /**
   * Movie method; performs the specified transition between the current frame and the next frame.
   *
   * To use an Xtra transition cast member, use the puppetTransition(memberObjRef) syntax.
   * To use a built-in Director transition, replace int with a value in the following table. Replace time
   * with the number of quarter seconds used to complete the transition. The minimum value is 0; the
   * maximum is 120 (30 seconds). Replace size with the number of pixels in each chunk of the
   * transition. The minimum value is 1; the maximum is 128. Smaller chunk sizes yield smoother
   * transitions but are slower.
   *
   * Replace area with a value that determines whether the transition occurs only in the changing area
   * (TRUE) or over the entire Stage (FALSE, default). The area variable is an area within which sprites
   * have changed.
   *
   * @param {*} memberObjRef Required if using an Xtra transition cast member. A reference to the Xtra cast
   * member to use as the transition.
   * @param {number} [int] Required if using a built-in Director transition. An integer that specifies the number of the
   * transition to use.
   * @param {number} [time] Optional. An integer that specifies that number of quarter seconds used to complete the
   * transition. Valid values range from 0 to 120.
   * @param {number} [size] Optional. An integer that specifies the number of pixels in each chunk of the transition.
   * Valid values range from 1 to 128.
   * @param {boolean} [area] Optional. A boolean value that specifies whether the transition occurs only in the changing
   * area (TRUE) or over the entire Stage (FALSE).
   */
  puppetTransition(memberObjRef, int, time, size, area) {}

  /**
   * Movie method; determines the memory needed, in bytes, to display a range of frames. For
   * example, you can test the size of frames containing 32-bit artwork: if ramNeeded() is larger than
   * freeBytes(), then go to frames containing 8-bit artwork and divide by 1024 to convert bytes to
   * kilobytes (K).
   *
   * @param {number} intFromFrame Required. An integer that specifies the number of the first frame in the range.
   * @param {number} intToFrame Required. An integer that specifies the number of the last frame in the range.
   */
  ramNeeded(intFromFrame, intToFrame) {}

  /**
   * Movie method; indicates whether the pointer (cursor) is currently over the bounding rectangle of
   * a specified sprite (TRUE or 1) or not (FALSE or 0).
   *
   * The rollOver() method is typically used in frame scripts and is useful for creating handlers that
   * perform an action when the user places the pointer over a specific sprite.
   *
   * If the user continues to roll the mouse, the value of rollOver() can change while a script is
   * running a handler, and can result in unexpected behavior. You can make sure that a handler uses
   * a consistent rollover value by assigning rollOver() to a variable when the handler starts.
   *
   * When the pointer is over an area of the Stage where a sprite previously appeared, rollOver() still
   * occurs and reports the sprite as still being there. Avoid this behavior by not performing rollovers
   * over these locations, or by moving the sprite above the menu bar before removing it.
   *
   * @param {number} [intSpriteNum] Optional. An integer that specifies the sprite number.
   */
  rollOver(intSpriteNum) {}

  /**
   * Movie method; saves the current movie.
   *
   * Including the optional stringFilePath parameter saves the movie to the file specified. This
   * method does not work with compressed files. The specified filename must include the .dir
   * file extension.
   *
   * The saveMovie() method doesn’t support URLs as file references.
   *
   * @param {string} [stringFilePath] Optional. A string that specifies the path to and name of the file to which the
   * movie is saved.
   */
  saveMovie(stringFilePath) {}

  /**
   * Movie method; sends a designated message to all sprites, not just the sprite that was involved in
   * the event. As with any other message, the message is sent to every script attached to the sprite,
   * unless the stopEvent() method is used.
   *
   * For best results, send the message only to those sprites that will properly handle the message
   * through the sendSprite() method. No error will occur if the message is sent to all the sprites,
   * but performance may decrease. There may also be problems if different sprites have the
   * same handler in a behavior, so avoid conflicts by using unique names for messages that will
   * be broadcast.
   *
   * After the message has been passed to all behaviors, the event follows the regular message
   * hierarchy: cast member script, frame script, then movie script.
   *
   * When you use the sendAllSprites() method, be sure to do the following:
   * • Replace stringEventMessage with the message.
   * • Replace args with any arguments to be sent with the message.
   *
   * If no sprite has an attached behavior containing the given handler, sendAllSprites()
   * returns FALSE.
   *
   * @param {string} stringEventMessage Required. A string that specifies the message to send to all sprites.
   * @param {...*} [args] Optional. An argument or arguments to send with the message.
   */
  sendAllSprites(stringEventMessage, ...args) {}

  /**
   * Movie method; sends a message to all scripts attached to a specified sprite.
   *
   * Messages sent using sendSprite() are sent to each of the scripts attached to the sprite. The
   * messages then follow the regular message hierarchy: cast member script, frame script, and
   * movie script.
   *
   * If the given sprite does not have an attached behavior containing the given handler,
   * sendSprite() returns FALSE.
   *
   * @param {string | number} spriteNameOrNum Required. A string or an integer that specifies the name or number of the
   * sprite that will receive the event.
   * @param {*} event Required. A symbol or string that specifies the event to send to the specified sprite.
   * @param {...*} [args] Optional. An argument or arguments to send with the message.
   */
  sendSprite(spriteNameOrNum, event, ...args) {}

  /**
   * Movie method; prevents scripts from passing an event message to subsequent locations in the
   * message hierarchy.
   *
   * This method also applies to sprite scripts.
   *
   * Use the stopEvent() method to stop the message in a primary event handler or a sprite script,
   * thus making the message unavailable for subsequent sprite scripts.
   *
   * By default, messages are available first to a primary event handler (if one exists) and then to any
   * scripts attached to a sprite involved in the event. If more than one script is attached to the sprite,
   * the message is available to each of the sprite’s scripts. If no sprite script responds to the message,
   * the message passes to a cast member script, frame script, and movie script, in that order.
   *
   * The stopEvent() method applies only to the current event being handled. It does not affect
   * future events. The stopEvent() method applies only within primary event handlers, handlers
   * that primary event handlers call, or multiple sprite scripts. It has no effect elsewhere.
   */
  stopEvent() {}

  /**
   * Movie method; removes the specified preloaded movie from memory.
   *
   * This command is useful in forcing movies to unload when memory is low.
   *
   * You can use a URL as the file reference.
   *
   * If the movie isn’t already in RAM, the result is -1.
   *
   * @param {number} [intFromFrameNum] Optional. An integer that specifies the number of the first frame in a range to
   * unload from memory.
   * @param {number} [intToFrameNum] Optional. An integer that specifies the number of the last frame in a range to
   * unload from memory.
   */
  unLoad(intFromFrameNum, intToFrameNum) {}

  /**
   * Movie method; forces Director to clear the cast members used in a specified frame from memory.
   *
   * Director automatically unloads the least recently used cast members to accommodate preLoad()
   * methods or normal cast library loading.
   *
   * • When used without an argument, the unLoadMember() method clears from memory the cast
   *   members in all the frames of a movie.
   * • When used with one argument, memberObjRef, the unLoadMember() method clears from
   *   memory the cast members in that frame.
   * • When used with two arguments, fromMemberNameOrNum and toMemberNameOrNum, the
   *   unLoadMember() method unloads all cast members in the range specified. You can specify a
   *   range of cast members by frame numbers or frame labels.
   *
   * @param {*} [memberObjRef] Optional. A reference to the cast member to unload from memory.
   * @param {string | number} [fromMemberNameOrNum] Required if clearing a range of cast members. A string or integer that
   * specifies the name or number of the first cast member in a range to unload from memory.
   * @param {string | number} [toMemberNameOrNum] Required if clearing a range of cast members. A string or integer that
   * specifies the name or number of the last cast member in a range to unload from memory.
   */
  unLoadMember(memberObjRef, fromMemberNameOrNum, toMemberNameOrNum) {}

  /**
   * Movie method; removes the specified preloaded movie from memory.
   *
   * This command is useful in forcing movies to unload when memory is low.
   *
   * You can use a URL as the file reference.
   *
   * If the movie isn’t already in RAM, the result is -1.
   *
   * @param {string} stringMovieName Required. A string that specifies the name of the movie to unload
   * from memory.
   */
  unLoadMovie(stringMovieName) {}

  /**
   * Movie method; during Score generation only, enters the changes to the current frame that have
   * been made during Score recording and moves to the next frame. Any objects that were already in
   * the frame when the update session started remain in the frame. You must issue an
   * updateFrame() method for each frame that you are updating.
   */
  updateFrame() {}

  /**
   * Movie method; redraws the Stage immediately instead of only between frames.
   *
   * The updateStage() method redraws sprites, performs transitions, plays sounds, sends a
   * prepareFrame message (affecting movie and behavior scripts), and sends a stepFrame message
   * (which affects actorList).
   */
  updateStage() {}
}
