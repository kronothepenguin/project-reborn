export class SystemObject {
  /**
   * System property; determines the color depth of the computer’s monitor. Read/write.
   * • In Windows, using this property lets you check and set the monitor’s color depth. Some video
   *   card and driver combinations may not enable you to set the colorDepth property. Always
   *   verify that the color depth has actually changed after you attempt to set it.
   * • On the Macintosh, this property lets you check the color depth of different monitors and
   *   change it when appropriate.
   *
   * Possible values are the following:
   * 1                       Black and white
   * 2                       4 colors
   * 4                       16 colors
   * 8                       256 colors
   * 16                      32,768 or 65,536 colors
   * 32                      16,777,216 colors
   *
   * If you try to set a monitor’s color depth to a value that monitor does not support, the monitor’s
   * color depth doesn’t change.
   *
   * On computers with more than one monitor, the colorDepth property refers to the monitor
   * displaying the Stage. If the Stage spans more than one monitor, the colorDepth property
   * indicates the greatest depth of those monitors; colorDepth tries to set all those monitors to the
   * specified depth.
   */
  colorDepth = 32;

  /**
   * System property; displays the size and position on the desktop of the monitors connected to a
   * computer. Read-only.
   * This property is useful for checking whether objects such as windows, sprites, and pop-up
   * windows appear entirely on one screen.
   * The result is a list of rectangles, where each rectangle is the boundary of a monitor. The
   * coordinates for each monitor are relative to the upper left corner of monitor 1, which has the
   * value (0,0). The first set of rectangle coordinates is the size of the first monitor. If a second
   * monitor is present, a second set of coordinates shows where the corners of the second monitor are
   * relative to the first monitor.
   */
  deskTopRectList = [];

  /**
   * System property; contains a list with information about the environment under which the
   * Director content is currently running. Read-only.
   *
   * This design enables Macromedia to add information to the environmentPropList property in
   * the future, without affecting existing movies.
   *
   * The information is in the form of property and value pairs for that area.
   *
   * #shockMachine           Integer TRUE or FALSE value indicating whether the movie is playing in
   *                         ShockMachine.
   * #shockMachineVersion    String indicating the installed version number of ShockMachine.
   * #platform               String containing “Macintosh,PowerPC”, or “Windows,32”. This is
   *                         based on the current OS and hardware that the movie is running under.
   * #runMode                String containing “Author”, “Projector”, or “Plugin”. This is based on the
   *                         current application that the movie is running under.
   * #colorDepth             Integer representing the bit depth of the monitor the Stage appears on.
   *                         Possible values are 1, 2, 4, 8, 16, or 32.
   * #internetConnected      Symbol indicating whether the computer the movie is playing on has an
   *                         active Internet connection. Possible values are #online and #offline.
   * #uiLanguage             String indicating the language the computer is using to display its user
   *                         interface. This can be different from the #osLanguage on computers with
   *                         specific language kits installed.
   * #osLanguage             String indicating the native language of the computer’s operating system.
   * #productBuildVersion    String indicating the internal build number of the playback application.
   *
   * The properties contain exactly the same information as the properties and functions of the
   * same name.
   */
  environmentPropList = {};

  /**
   * System property; returns the current time in milliseconds (1/1000 of a second). Read-only.
   * Counting begins from the time the computer is started.
   */
  milliseconds = 0;

  /**
   * System method; returns the current date in the system clock.
   * The format Director uses for the date varies, depending on how the date is formatted on the
   * computer.
   * • In Windows, you can customize the date display by using the International control panel.
   *   (Windows stores the current short date format in the System.ini file. Use this value to
   *   determine what the parts of the short date indicate.)
   * • On the Macintosh, you can customize the date display by using the Date and Time
   *   control panel.
   *
   * @param {number} [yyyymmdd] A number that specifies the four-digit year (yyyy), two-digit month (mm),
   * and two-digit day (dd) of the returned date.
   */
  date(yyyymmdd) {
    return "";
    // return new Date().toUTCString();
  }

  /**
   * System method; closes all open applications and restarts the computer.
   */
  restart() {}

  /**
   * System method; closes all open applications and turns off the computer.
   */
  shutDown() {}

  /**
   * System method; returns the current time in the system clock as a string.
   * The returned time is formatted as follows:
   * 1:30 PM
   */
  time() {}
}
