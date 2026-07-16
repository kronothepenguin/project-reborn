export class KeyObject {
  /**
   * Key property; determines whether the Control key (Windows) or the Command key (Macintosh)
   * is being pressed. Read-only.
   *
   * This property returns TRUE if the Control or Command key is being pressed; otherwise, it
   * returns FALSE.
   *
   * You can use commandDown together with the key property to determine whether the Control or
   * Command key is being pressed in combination with another key. This lets you create handlers
   * that are executed when the user presses specified Control or Command key combinations.
   *
   * Control or Command key equivalents for the Director authoring menus take precedence while
   * the movie is playing, unless you have installed custom Lingo or JavaScript syntax menus or are
   * playing a projector version of the movie.
   */
  commandDown = false;

  /**
   * Key property; determines whether the Control key is being pressed. Read-only.
   *
   * This property returns TRUE if the Control key is being pressed; otherwise, it returns FALSE.
   *
   * You can use controlDown together with the key property to determine whether the Control key
   * is being pressed in combination with another key. This lets you create handlers that are executed
   * when the user presses specified Control key combinations.
   *
   * Control or key equivalents for the Director authoring menus take precedence while the movie is
   * playing, unless you have installed custom Lingo or JavaScript syntax menus or are playing a
   * projector version of the movie.
   */
  controlDown = false;

  /**
   * Key property; returns the value of the last key that was pressed. Read-only.
   *
   * The returned value is the American National Standards Institute (ANSI) value that is assigned to
   * the key, not the numerical value.
   *
   * You can use key in handlers that perform certain actions when the user presses specific keys as
   * shortcuts and other forms of interactivity. When used in a primary event handler, the actions you
   * specify are the first to be executed.
   *
   * Note: The value of key isn’t updated if the user presses a key while Lingo or JavaScript syntax is in
   * a loop.
   *
   * Use the sample movie Keyboard Lingo to test which characters correspond to different keys on
   * different keyboards.
   */
  key = "";

  /**
   * Key property; returns the numerical code for the last key pressed. Read-only.
   *
   * The returned value is the key’s numerical value, not the American National Standards Institute
   * (ANSI) value.
   *
   * You can use keyCode to detect when the user has pressed an arrow or function key, which cannot
   * be specified by the key property.
   *
   * Use the sample movie Keyboard Lingo to test which characters correspond to different keys on
   * different keyboards.
   */
  keyCode = 0;

  /**
   * Key property; determines whether the user is pressing the Alt key (Windows) or the Option key
   * (Macintosh). Read-only.
   *
   * This property returns TRUE if the user is pressing the Alt or Option key; otherwise, it
   * returns FALSE.
   * optionDown
   *
   * In Windows, optionDown does not work in projectors if Alt is pressed without another
   * nonmodifier key. Avoid using optionDown if you intend to distribute a movie as a Windows
   * projector and need to detect only the modifier key press; use controlDown or shiftDown instead.
   *
   * On the Macintosh, pressing the Option key changes the key value, so use keyCode instead.
   */
  optionDown = false;

  /**
   * Key property; indicates whether the user is pressing the Shift key. Read-only.
   *
   * This property returns TRUE if the user is pressing the Shift key; otherwise, it returns FALSE.
   *
   * This property must be tested in conjunction with another key.
   */
  shiftDown = false;

  /**
   * Key method; returns the character string assigned to the key that was last pressed, or optionally
   * whether a specified key was pressed.
   *
   * If the keyCodeOrCharacter parameter is omitted, this method returns the character string
   * assigned to the last key that was pressed. If no key was pressed, this method returns an
   * empty string.
   *
   * If the keyCodeOrCharacter is used to specify the key being pressed, this method returns TRUE if
   * that particular key is being pressed, or FALSE if not.
   *
   * This method is updated when the user presses keys while in a repeat (Lingo) or for (JavaScript
   * syntax) loop. This is an advantage over the key property, which doesn’t update while in a repeat
   * or for loop.
   *
   * To test which characters correspond to different keys on different keyboards, use the Keyboard
   * Lingo sample movie.
   *
   * @param {number | string} [keyCodeOrCharacter] The key code or ASCII character string to test.
   */
  keyPressed(keyCodeOrCharacter) {
    if (keyCodeOrCharacter) {
      return false;
    }

    return "";
  }
}
