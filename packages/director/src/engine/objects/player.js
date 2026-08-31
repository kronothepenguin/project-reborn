export class PlayerObject {
  /**
   * Player property; indicates which cast library was most recently activated. Read-only.
   * The activeCastLib property’s value is the cast library’s number.
   * The activeCastLib property is useful when working with the Cast object’s selection property.
   * Use it to determine which cast library the selection refers to.
   */
  activeCastLib = 1;

  /**
   * Player property; indicates which movie window is currently active. Read-only.
   * For the main movie, activeWindow is the Stage. For a movie in a window (MIAW),
   * activeWindow is the movie in the window.
   */
  activeWindow = null;

  /**
   * Player property; specifies a parent script that contains the alertHook handler. Read/write.
   * Use alertHook to control the display of alerts about file errors or script errors. When an error
   * occurs and a parent script is assigned to alertHook, Director runs the alertHook handler in the
   * parent script.
   * Although it is possible to place alertHook handlers in movie scripts, it is strongly recommended
   * that you place an alertHook handler in a behavior or parent script to avoid unintentionally
   * calling the handler from a wide variety of locations and creating confusion about where the
   * error occurred.
   * Because the alertHook handler runs when an error occurs, avoid using the alertHook handler
   * for script that isn't involved in handling an error. For example, the alertHook handler is a bad
   * location for a go() statement.
   * The alertHook handler is passed an instance argument, two string arguments that describe the
   * error, and an optional argument specifying an additional event that invokes the handler.
   * The fourth argument can have 1 of these 4 values:
   * • #alert—causes the handler to be triggered by the alert() method.
   * • #movie—causes the handler to be triggered by a file not found error while performing a go()
   *   command.
   * • #script—causes the handler to be triggered by a script error.
   * • #safeplayer—causes the handler to be triggered by a check of the safePlayer property.
   * Depending on the script within it, the alertHook handler can ignore the error or report it in
   * another way.
   */
  alertHook = null;

  /**
   * Player property; specifies the name of the running copy of the Director application during
   * authoring, or the name of a projector file during runtime. Read-only.
   * The property value is a string.
   * Shockwave Player does not support this property.
   */
  applicationName = "";

  /**
   * Player property; determines the path or location of the folder containing the running copy of the
   * Director application during authoring, or the folder containing the projector during runtime.
   * Read-only.
   * The property value is a string.
   * If you use applicationPath followed by & and a path to a subfolder, enclose the entire
   * expression in parentheses so that script parses the expression as one phrase.
   * Shockwave Player does not support this property.
   */
  applicationPath = "";

  /**
   * Player property; indicates the channel number of the sprite whose script is currently running.
   * Read-only.
   * This property is valid in behaviors and cast member scripts. When used in frame scripts or movie
   * scripts, the currentSpriteNum property’s value is 0.
   * The currentSpriteNum property is similar to the Sprite object’s spriteNum property.
   * Note: This property was more useful during transitions from older movies to Director 6, when
   * behaviors were introduced. It allowed some behavior-like functionality without having to completely
   * rewrite script. It is not necessary when authoring with behaviors and is therefore less useful than in
   * the past.
   */
  currentSpriteNum = 0;

  /**
   * Player property; in Windows, opens a Message window for debugging purposes in Shockwave
   * and projectors. On the Macintosh, a log file is generated to allow put statements to output data
   * for debugging purposes. Read/write.
   * In Windows, this property does not have any effect when used in the Director application. Once
   * the Message window is closed, it cannot be reopened for a particular Shockwave Player or
   * projector session. If more than one movie with Shockwave content uses this script in a single
   * browser, only the first will open a Message window, and the Message window will be tied to the
   * first movie alone.
   * On the Macintosh, the generated log file is located in the Shockwave Player folder at HardDrive/
   * System Folder/Extensions/Macromedia/Shockwave.
   * To open this Message window, set the debugPlaybackEnabled property to TRUE. To close the
   * window, set the debugPlaybackEnabled property to FALSE.
   */
  debugPlaybackEnabled = false;

  /**
   * Player property; determines the time scale, in units per second, that the system uses to track
   * digital video cast members. Read/write.
   * The digitalVideoTimeScale property can be set to any value you choose.
   * The value of this property determines the fraction of a second that is used to track the video, as in
   * the following examples:
   * • 100—The time scale is 1/100 of a second (and the movie is tracked in 100 units per second).
   * • 500—The time scale is 1/500 of a second (and the movie is tracked in 500 units per second).
   * • 0—Director uses the time scale of the movie that is currently playing.
   * Set digitalVideoTimeScale to precisely access tracks by ensuring that the system’s time unit for
   * video is a multiple of the digital video’s time unit. Set the digitalVideoTimeScale property to a
   * higher value to enable finer control of video playback.
   */
  digitalVideoTimeScale = 1;

  /**
   * Player property; determines whether Director automatically takes Stage scrolling or zooming into
   * account capturing the image of the Stage. Read/write.
   * When TRUE, this property prevents Director from automatically taking Stage scrolling or zooming
   * into account when the image property is used to get the image of the Stage. Zooming and
   * scrolling of the Stage will affect the appearance of the image captured by using image.
   * When FALSE, Director will always capture the image of the Stage as if the Stage window was
   * zoomed at 100% and was not scrolled out from the center of the Stage window. FALSE is the
   * default value.
   */
  disableImagingTransformation = false;

  /**
   * Player property; determines whether a movie interprets a mouse click with the Control key
   * pressed on the Macintosh the same as a right mouse click in Windows (TRUE) or not (FALSE,
   * default). Read/write.
   * Right-clicking has no direct Macintosh equivalent.
   * Setting this property to TRUE lets you provide consistent mouse button responses for cross-
   * platform movies.
   */
  emulateMultibuttonMouse = false;

  /**
   * Movie property; determines whether a user can quit to the Windows desktop or Macintosh
   * Finder from projectors (FALSE, default) or not (TRUE). Read/write.
   * The user can quit to the desktop by pressing Control+period (Windows) or Command+period
   * (Macintosh), Control+Q (Windows) or Command+Q (Macintosh), or Control+W (Windows)
   * or Command+W (Macintosh); the Escape key is also supported in Windows.
   */
  exitLock = false;

  /**
   * Player property; returns the number of parameters that an HTML <EMBED> or <OBJECT> tag
   * is passing to a movie with Shockwave content. Read-only.
   * This property is valid only for movies with Shockwave content that are running in a browser. It
   * doesn’t work for movies during authoring or for projectors.
   * For more information about the valid external parameters, see externalParamName() and
   * externalParamValue().
   */
  // TODO(subsystems): recompute from context externalParams in US7.
  externalParamCount = 0;

  /**
   * Player property; indicates which movie in a window (MIAW) is currently frontmost on the
   * screen. Read-only.
   * When the Stage is frontmost, frontWindow is the Stage. When a media editor or floating palette
   * is frontmost, frontWindow returns VOID (Lingo) or null (JavaScript syntax).
   */
  // TODO(subsystems): route through WindowRegistry in US7.
  frontWindow = null;

  /**
   * Player property; determines whether the Director Inline IME feature is turned on. Read/write.
   * When TRUE, this property allows the user to enter double-byte characters directly into the
   * Director Text, Field, Script, and Message windows on Japanese systems.
   * The default value is determined by the Enable Inline IME setting in Director General
   * Preferences.
   */
  inlineImeEnabled = false;

  /**
   * Player property; returns the time in ticks (1 tick = 1/60 of a second) since the mouse button was
   * last pressed. Read-only.
   */
  lastClick = 0;

  /**
   * Player property; returns the time in ticks (1 tick = 1/60 of a second) since the last mouse click,
   * rollover, or key press occurred. Read-only.
   */
  lastEvent = "";

  /**
   * Player property; gives the time in ticks (1 tick = 1/60 of a second) since the last key was pressed.
   * Read-only.
   */
  lastKey = 0;

  /**
   * Player property; gives the time in ticks (1 tick = 1/60 of a second) since the mouse was last moved.
   * Read-only.
   */
  lastRoll = 0;

  /**
   * Player property; returns a linear list of all media Xtra extensions available to the Director player.
   * Read-only.
   */
  mediaXtraList = [];

  /**
   * Player property; determines whether the Xtra extensions needed to access the Internet are
   * available but does not report whether an Internet connection is currently active. Read-only.
   * If the Net Support Xtra extensions are not available, netPresent will function properly, but
   * netPresent() will cause a script error.
   */
  netPresent = false;

  /**
   * Player property; in the Macintosh authoring environment, allows you to control the frequency of
   * servicing to a network operation. Read/write.
   * The default value is 15. The higher the value is set, the smoother the movie playback and
   * animation is, but less time is spent servicing any network activity. A low setting allows more time
   * to be spent on network operations, but will adversely affect playback and animation performance.
   * This property only affects the authoring environment and projectors on the Macintosh. It is
   * ignored on Windows or Shockwave Player on the Mac.
   */
  netThrottleTicks = 0;

  /**
   * Player property; contains the company name entered during installation of Director. Read-only.
   * This property is available in the authoring environment only. It can be used in a movie in a
   * window tool that is personalized to show the user’s information.
   */
  organizationName = "";

  /**
   * Player property; returns the name of the Director application. Read-only.
   */
  productName = "Director";

  /**
   * Player property; returns the version number of the Director application. Read-only.
   */
  productVersion = "MX 2004";

  /**
   * Player property; controls whether or not safety features in Director are turned on. Read/write.
   * In a moview with Shockwave content, this property can be tested but not set. It is always TRUE
   * in Shockwave Player.
   * In the authoring environment and in projectors, the default value is FALSE. This property may be
   * returned, but it may only be set to TRUE. Once it has been set to TRUE, it cannot be set back to
   * FALSE without restarting Director or the projector.
   *
   * When safePlayer is TRUE, the following safety features are in effect:
   * • Only safe Xtra extensions may be used.
   * • The safePlayer property cannot be reset.
   * • Pasting content from the Clipboard by using the pasteClipBoardInto() method generates a
   *    warning dialog box that allows the user to cancel the operation.
   * • Saving a movie or cast by using script is disabled.
   * • Printing by using the printFrom() method is disabled.
   * • Opening an application by using the open() method is disabled.
   * • The ability to stop an application or the user’s computer by using the restart() or
   *    shutDown() methods is disabled.
   * • Opening a file that is outside the DSWMedia folder is disabled.
   * • Discovering a local filename is disabled.
   * • Using getNetText() or postNetText(), or otherwise accessing a URL that does not have the
   *    same domain as the movie, generates a security dialog box.
   */
  safePlayer = true;

  /**
   * Player property; returns a linear list of all scripting Xtra extensions available to the Director player.
   * Read-only.
   * The Xtra extensions are those that are present in the Configuration\Xtras folder.
   */
  scriptingXtraList = [];

  /**
   * Player property; determines whether Director searches the current folder when searching
   * filenames. Read/write.
   * • When the searchCurrentFolder property is TRUE (1), Director searches the current folder
   *    when resolving filenames.
   * • When the searchCurrentFolder property is FALSE (0), Director does not search the current
   *    folder when resolving filenames.
   * This property is TRUE by default.
   */
  searchCurrentFolder = true;

  /**
   * Player property; a list of paths that Director searches when trying to find linked media such as
   * digital video, GIFs, bitmaps, or sound files. Read/write.
   * Each item in the list of paths is a fully qualified pathname as it appears on the current platform
   * at runtime.
   * The value of searchPathList is a linear list that you can manipulate the same as any other list by
   * using commands such as add(), addAt(), append(), deleteAt(), and setAt(). The default
   * value is an empty list.
   * URLs should not be used as file references in the search paths.
   * Adding a large number of paths to searchPaths slows searching. Try to minimize the number of
   * paths in the list.
   * Note: This property will function on all subsequent movies after being set. Because the current
   * movie’s assets have already been loaded, changing the setting will not affect any of these assets.
   */
  searchPathList = [];

  /**
   * Movie property; a string containing the serial number entered when Director was installed.
   * Read-only.
   * This property is available in the authoring environment only. It could be used in a movie in a
   * window (MIAW) tool that is personalized to show the user’s information.
   */
  serialNumber = "";

  /**
   * Player property; provides indexed access to a Sound Channel object by using a Player property.
   * Read-only.
   * The intSoundChannelNum argument is an integer that specifies the number of the sound channel
   * to access.
   * The functionality of this property is identical to the top level sound() method.
   */
  // TODO(subsystems): route through Sound subsystem in US7.
  sound = null;

  /**
   * Player property; determines whether Director switches the monitor that the Stage occupies to the
   * color depth of the movie being loaded (TRUE) or leaves the color depth of the monitor unchanged
   * when a movie is loaded (FALSE, default). Read/write.
   * When switchColorDepth is TRUE, nothing happens until a new movie is loaded.
   * Setting the monitor’s color depth to that of the movie is good practice.
   * • When the monitor’s color depth is set below that of the movie, resetting it to the color depth of
   *   the movie (assuming that the monitor can provide that color depth) helps maintain the movie’s
   *   original appearance.
   * • When the monitor’s color depth is higher than that of the movie, reducing the monitor’s color
   *   depth plays the movie using the minimum amount of memory, loads cast members more
   *   efficiently, and causes animation to occur more quickly.
   * The value of this property can also be set using the Reset Monitor to Movie’s Color Depth option
   * in the General Preferences dialog box.
   */
  switchColorDepth = 0;

  /**
   * Player property; returns a linear list of all tool Xtra extensions available to the Director player.
   * Read-only.
   */
  toolXtraList = [];

  /**
   * Player property; returns a linear list of all transition Xtra extensions available to the Director
   * player. Read-only.
   */
  transitionXtraList = [];

  /**
   * Player property; a string containing the user name entered when Director was installed.
   * Read-only.
   * This property is available in the authoring environment only. It could be used in a movie in a
   * window (MIAW) tool that is personalized to show the user’s information.
   */
  userName = "";

  /**
   * Player property; provides indexed or named access to the Window objects created by the Director
   * player. Read-only.
   * The windowNameOrNum argument is either a string that specifies the name of the window to access
   * or an integer that specifies the index position of the window to access.
   * The functionality of this property is identical to the top level window() method.
   */
  // TODO(subsystems): FR-036 MIAW lookup deferred; route through WindowRegistry in US7.
  window = null;

  /**
   * Player property; displays a list of references to all known movie windows. Read-only.
   * The Stage is also considered a window.
   */
  // TODO(subsystems): FR-036 MIAW lookup deferred; route through WindowRegistry in US7.
  windowList = [];

  /**
   * Player property; provides indexed or named access to the Xtra extensions available to the Director
   * player. Read-only.
   * The xtraNameOrNum argument is either a string that specifies the name of the Xtra extension to
   * access or an integer that specifies the index position of the Xtra extension to access.
   * The functionality of this property is identical to the top level xtra() method.
   */
  // TODO(subsystems): route through XtraRegistry in US7.
  xtra = null;

  /**
   * Player property; displays a linear property list of all available Xtra extensions and their file
   * versions. Read-only.
   * This property is useful when the functionality of a movie depends on a certain version of an Xtra
   * extension.
   * There are two possible properties that can appear in xtraList:
   * • #filename—Specifies the filename of the Xtra extension on the current platform. It is possible
   *   to have a list without a #filename entry, such as when the Xtra extension exists only on one
   *   platform.
   * • #version—Specifies the same version number that appears in the Properties dialog box
   *   (Windows) or Info window (Macintosh) when the file is selected on the desktop. An Xtra
   *   extension may not necessarily have a version number.
   */
  xtraList = [];

  runMode = "Plugin";

  editShortcutsEnabled = false;

  parameters = {};

  currentCursor = 0;

  /**
   * Player method; causes a system beep and displays an alert dialog box containing a specified string.
   * The alert message must be a string. If you want to include a number variable in an alert, convert
   * the variable to a string before passing it to alert().
   *
   * @param {string} displayString Required. A string that represents the text displayed in the alert dialog box. The
   *   string can contain up to 255 characters.
   */
  alert(displayString) {}

  /**
   * Player method; in Microsoft Windows, causes a projector to minimize to the Windows Task Bar.
   * On the Macintosh, causes a projector to be hidden.
   * On the Macintosh, reopen a hidden projector from the Macintosh application menu.
   * This method is useful for projectors and MIAWs that play back without a title bar.
   */
  appMinimize() {}

  /**
   * Player method; changes the cast member or built-in cursor that is used for a cursor and stays in
   * effect until you turn it off by setting the cursor to 0.
   * • Use the syntax _player.cursor(cursorMemNum, maskMemNum) to specify the number of a
   *   cast member to use as a cursor and its optional mask. The cursor’s hot spot is the registration
   *   point of the cast member.
   *   The cast member that you specify must be a 1-bit cast member. If the cast member is larger
   *   than 16 by 16 pixels, Director crops it to a 16-by-16-pixel square, starting in the upper left
   *   corner of the image. The cursor’s hot spot is still the registration point of the cast member.
   * • Use the syntax _player.cursor(cursorMemRef) for the custom cursors available through the
   *   Cursor Xtra.
   *   Note: Although the Cursor Xtra allows cursors of different cast library types, text cast members
   *   cannot be used as cursors.
   * • Use the syntax _player.cursor(intCursorNum) to specify default system cursors. The term
   *   intCursorNum must be one of the following integer values:
   *
   * @param {number} [intCursorNum] Required when using an integer to identify a cursor. An integer that specifies the
   *   built-in cursor to use as a cursor.
   * @param {number} [cursorMemNum] Required when using a cast member number and its optional mask to identify the
   *   cursor. An integer that specifies the cast member number to use as a cursor.
   * @param {number} [maskMemNum] Required when using a cast member number and its optional mask to identify the
   *   cursor. An integer that specifies the mask number of cursorMemNum.
   * @param {object} [cursorMemRef] Required when using a cast member reference to identify the cursor. A reference
   *   to the cast member to use as a cursor.
   */
  cursor(intCursorNum, cursorMemNum, maskMemNum, cursorMemRef) {}

  /**
   * Player method; returns the name of a specified parameter in the list of external parameters from
   * an HTML <EMBED> or <OBJECT> tag.
   * If specifying a parameter by name, this method returns any parameter names that matches
   * paramNameOrNum. The match is not case sensitive. If no matching parameter name is found, this
   * method returns VOID (Lingo) or null (JavaScript syntax).
   * If specifying a parameter by number, this method returns the parameter name at the
   * paramNameOrNum position in the parameter list. If no matching parameter position is found, this
   * method returns VOID or null.
   * This method is valid only for movies with Shockwave content that are running in a browser. It
   * cannot be used with Director movies or projectors.
   *
   * @param {string | number} paramNameOrNum Required. A string that specifies the name of the parameter name to return, or
   *   an integer that specifies the index location of the parameter name to return.
   * @returns {string | null}
   */
  externalParamName(paramNameOrNum) {
  return null;
  }

  /**
   * Returns the value of a specified parameter in the list of external parameters from an HTML
   * <EMBED> or <OBJECT> tag.
   * If specifying a parameter value by name, this method returns the value of the first parameter
   * whose name matches paramNameOrNum. The match is not case sensitive. If no matching
   * parameter value is found, this method returns VOID (Lingo) or null (JavaScript syntax).
   * If specifying a parameter value by index, this method returns the value of the parameter at the
   * paramNameOrNum position in the parameter list. If no matching parameter position is found, this
   * method returns VOID or null.
   * This method is valid only for movies with Shockwave content that are running in a browser. It
   * cannot be used with Director movies or projectors.
   *
   * @param {string | number} paramNameOrNum Required. A string that specifies the name of the parameter value to return, or
   *   an integer that specifies the index location of the parameter value to return.
   * @returns {undefined}
   */
  externalParamValue(paramNameOrNum) {
  // TODO(subsystems): route through context externalParams in US7.
  return undefined;
  }

  /**
   * Player method; flushes any waiting mouse or keyboard events from the Director message queue.
   * Generally this is useful when script is in a tight loop and the author wants to make sure any
   * mouse clicks or keyboard presses don't get through.
   * This method operates at runtime only and has no effect during authoring.
   */
  flushInputEvents() {}

  /**
   * Player method; retrieves the content of the specified file.
   * When you use this method, replace stringPrefName with the name of a file created by
   * the setPref() method. If no such file exists, getPref() returns VOID (Lingo) or null
   * (JavaScript syntax).
   * The filename used for stringPrefName must be a valid filename only, not a full path; Director
   * supplies the path. The path to the file is handled by Director. The only valid file extensions for
   * stringPrefName1 are .txt and .htm; any other extension is rejected.
   *
   * Do not use this method to access read-only or locked media.
   * Note: In a browser, data written by setPref() is not private. Any movie with Shockwave content can
   * read this information and upload it to a server. Confidential information should not be stored using
   * setPref().
   *
   * @param {string} stringPrefName Required. A string that specifies the file for which content is retrieved.
   * @returns {undefined}
   */
  getPref(stringPrefName) {
  // TODO(subsystems): route through context externalParams / localStorage in US7.
  return undefined;
  }

  /**
   * Movie method; exits the current handler and any handler that called it and stops the movie
   * during authoring or quits the projector during runtime from a projector.
   */
  halt() {}

  /**
   * Player method; opens a specified application, and optionally opens a specified file when the
   * applicatin opens.
   * When either stringDocPath or stringAppPath are in a different folder than the current movie,
   * you must specify the full pathname to the file or files.
   * The computer must have enough memory to run both Director and other applications at the
   * same time.
   * This is a very simple method for opening an application or a document within an application. For
   * more control, look at options available in third-party Xtra extensions.
   *
   * @param {string} [stringDocPath] Optional. A string that specifies the document to open when the application
   *   specified by stringAppPath opens.
   * @param {string} stringAppPath Required. A string that specifies the path to the application to open.
   */
  open(stringDocPath, stringAppPath) {}

  /**
   * Player method; exits from Director or a projector to the Windows desktop or Macintosh Finder.
   */
  quit() {}

  /**
   * Player method; writes a specified string to a specified file on the computer’s local disk. The file is
   * a standard text file.
   * After setPref() runs, if the movie is playing in a browser, a folder named Prefs is created in the
   * Plug-In Support folder. The setPref() method can write only to that folder.
   * If the movie is playing in a projector or Director, a folder is created in the same folder as the
   * application. The folder receives the name Prefs.
   * Do not use this method to write to read-only media. Depending on the platform and version of
   * the operating system, you may encounter errors or other problems.
   * In a browser, data written by setPref() is not private; any movie with Shockwave content can
   * read this information and upload it to a server. Do not store confidential information using
   * setPref().
   * On Windows, setPref() fails if the user is a restricted user.
   *
   * @param {string} prefName Required. A string that specifies the file to write to. The prefName parameter must be
   *   a valid filename. To make sure the filename is valid on all platforms, use no more than eight
   *   alphanumeric characters for the file name.
   * @param {string} prefValue Required. A string that specifies the text to write to the file prefName.
   */
  setPref(prefName, prefValue) {}

  /**
   * Player method; indicates whether the object specified by stringWindowName is running as a
   * movie in a window (TRUE) or not (FALSE).
   * If a window had been opened, windowPresent() remains TRUE for the window until the window
   * has been removed from the windowList property.
   * The stringWindowName argument must be the window’s name as it appears in the windowList
   * property.
   *
   * @param {string} stringWindowName Required. A string that specifies the name of the window to test.
   * @returns {boolean}
   */
  windowPresent(stringWindowName) {
  return false;
  }
  }