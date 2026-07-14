import { Point } from "../types/point";

export class MouseObject {
  /**
   * Mouse property; identifies as a point the last place on the screen where the mouse was clicked.
   * Read-only.
   */
  clickLoc;

  /**
   * Mouse property; returns the last active sprite clicked by the user. Read-only.
   *
   * An active sprite is a sprite that has a sprite or cast member script associated with it.
   *
   * When the user clicks the Stage, clickOn returns 0. To detect whether the user clicks a sprite
   * with no script, you must assign a mouse event script to it so that it can be detected by clickOn.
   * For example:
   * -- Lingo syntax
   * on mouseUp me
   *     ...
   * end
   *
   * Buttons, check boxes, and radio buttons are detected by clickOn even if there is no script
   * attached to them.
   *
   * The clickOn property can be checked within a loop. However, neither clickOn nor clickLoc
   * change value when the handler is running. The value that you obtain is the value from before the
   * handler started.
   */
  clickOn;

  /**
   * Mouse property; tests whether two mouse clicks within the time set for a double-click occurred as
   * a double-click rather than two single clicks (TRUE), or if they didn’t occur within the time set,
   * treats them as single clicks (FALSE). Read-only.
   */
  doubleClick;

  /**
   * Mouse property; for field sprites, contains the number of the character that is under the pointer
   * when the property is called. Read-only.
   *
   * The count is from the beginning of the field. If the mouse pointer is not over a field or is in the
   * gutter of a field, the result is -1.
   *
   * The value of mouseChar can change in a handler or loop. If a handler or loop uses this property
   * multiple times, it’s usually a good idea to call the property once and assign its value to a
   * local variable.
   */
  mouseChar = -1;

  /**
   * Mouse property; indicates whether the mouse button is currently being pressed (TRUE) or not
   * (FALSE). Read-only.
   */
  mouseDown = false;

  /**
   * Mouse property; indicates the horizontal position of the mouse pointer. Read-only.
   *
   * The value of mouseH is the number of pixels the cursor is positioned from the left edge of
   * the Stage.
   *
   * The mouseH property is useful for moving sprites to the horizontal position of the mouse pointer
   * and checking whether the pointer is within a region of the Stage. Using the mouseH and mouseV
   * properties together, you can determine the cursor’s exact location.
   */
  mouseH = 0;

  /**
   * Mouse property; contains the number of the item under the pointer when the property is called
   * and the pointer is over a field sprite. Read-only.
   *
   * An item is any sequence of characters delimited by the current delimiter as set by the
   * itemDelimiter property. Counting starts at the beginning of the field. If the mouse pointer is
   * not over a field, the result is -1.
   *
   * The value of the mouseItem property can change in a handler or loop. If a handler or loop relies
   * on the initial value of mouseItem when the handler or loop begins, call this property once and
   * assign its value to a local variable.
   */
  mouseItem = -1;

  /**
   * Mouse property; contains the number of the line under the pointer when the property is called
   * and the pointer is over a field sprite. Read-only.
   *
   * Counting starts at the beginning of the field; a line is defined by Return delimiter, not by the
   * wrapping at the edge of the field. When the mouse pointer is not over a field sprite, the result
   * is -1.
   *
   * The value of the mouseLine property can change in a handler or loop. If a handler or loop uses
   * this property multiple times, it’s usually a good idea to call the property once and assign its value
   * to a local variable.
   */
  mouseLine = -1;

  /**
   * Mouse property; returns the current position of the mouse as a point(). Read-only.
   *
   * The point location is given as two coordinates, with the horizontal location first, then the
   * vertical location.
   */
  mouseLoc = new Point();

  /**
   * Mouse property; returns the cast member assigned to the sprite that is under the pointer when the
   * property is called. Read-only.
   *
   * When the pointer is not over a sprite, this property returns the result VOID (Lingo) or null
   * (JavaScript syntax).
   *
   * You can use this property to make a movie perform specific actions when the pointer rolls over a
   * sprite and the sprite uses a certain cast member.
   *
   * The value of the mouseMember property can change frequently. To use this property multiple
   * times in a handler with a consistent value, assign the mouseMember value to a local variable when
   * the handler starts and use the variable.
   */
  mouseMember = null;

  /**
   * Mouse property; indicates whether the mouse button is released (TRUE) or is being pressed
   * (FALSE). Read-only.
   */
  mouseUp = false;

  /**
   * Mouse property; indicates the vertical position of the mouse cursor, in pixels, from the top of the
   * Stage. Read-only.
   *
   * The value of this property increases as the cursor moves down and decreases as the cursor
   * moves up.
   *
   * The mouseV property is useful for moving sprites to the vertical position of the mouse cursor and
   * checking whether the cursor is within a region of the Stage. Using the mouseH and mouseV
   * properties together, you can identify the cursor’s exact location.
   */
  mouseV = 0;

  /**
   * Mouse property; contains the number of the word under the pointer when the property is called
   * and when the pointer is over a field sprite. Read-only.
   *
   * Counting starts from the beginning of the field. When the mouse is not over a field, the result
   * is -1.
   *
   * The value of the mouseWord property can change in a handler or loop. If a handler or loop uses
   * this property multiple times, it’s usually a good idea to call the function once and assign its value
   * to a local variable.
   */
  mouseWord = -1;

  /**
   * Mouse property; indicates whether the right mouse button (Windows) or the mouse button and
   * Control key (Macintosh) are being pressed (TRUE) or not (FALSE). Read-only.
   *
   * On the Macintosh, rightMouseDown is TRUE only if the emulateMultiButtonMouse property
   * is TRUE.
   */
  rightMouseDown = false;

  /**
   * Mouse property; indicates whether the right mouse button (Windows) or the mouse button and
   * Control key (Macintosh) are currently not being pressed (TRUE) or are currently being pressed
   * (FALSE). Read-only.
   *
   * On the Macintosh, rightMouseUp is TRUE only if the emulateMultiButtonMouse property
   * is TRUE.
   */
  rightMouseUp = false;

  /**
   * Mouse property; indicates whether the user is pressing the mouse button (TRUE) or not (FALSE).
   * Read-only.
   *
   * This function is useful within a mouseDown script to trigger certain events only after the
   * mouseUp function.
   *
   * Script cannot test stillDown when it is used inside a loop. Use the mouseDown function inside
   * loops instead.
   */
  stillDown = false;
}
