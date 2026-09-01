export class SpriteChannelObject {
  /**
   * Sprite Channel property; returns the number of a sprite channel. Read-only.
   */
  number = 0;

  /**
   * Sprite Channel property; identifies the name of a sprite channel. Read/write during a Score
   * recording session only.
   * Set the name of a sprite channel during a Score recording session—between calls to the Movie
   * object’s beginRecording() and endRecording() methods.
   * Note: Starting a Score recording session using beginRecording() resets the properties of all scripted
   * sprites and sprite channels.
   *
   * Unlike a Sprite object’s name property, which can only be set on or after a frame in which a
   * sprite appears in the Score, a Sprite Channel object’s name property can be set on an empty
   * channel. This means that you do not need to call updateFrame() before setting the name of
   * the sprite channel.
   * A change to a sprite channel’s name using script is not reflected in the Score window.
   */
  name = "";

  /**
   * Sprite Channel property; specifies whether a sprite channel is under script control (TRUE) or
   * under Score control (FALSE). Read-only.
   */
  scripted = false;

  /**
   * Sprite Channel property; returns a reference to the sprite in the current frame of a sprite channel.
   * Read-only.
   */
  sprite = null;

  constructor(number = 0) {
    this.number = number;
  }

  /**
   * Sprite Channel method; switches control of a sprite channel from the Score to script, and
   * optionally places a sprite from a specified cast member at a specified location on the Stage.
   * Call removeScriptedSprite() to switch control of the sprite channel back to the Score.
   *
   * @param {object} [memberObjRef] Optional. A reference to the cast member from which a scripted sprite is created. Providing only this parameter places the sprite in the center of the Stage.
   * @param {object} [loc] Optional. A point that specifies the location on the Stage at which the scripted sprite is placed.
   */
  makeScriptedSprite(memberObjRef, _loc) {
    // TODO(subsystems): real Score sprite placement deferred per FR-031.
    this.sprite = memberObjRef ?? null;
    this.scripted = true;
    return this.sprite;
  }

  /**
   * Sprite Channel method; switches control of a sprite channel from script back to the Score.
   */
  removeScriptedSprite() {
    this.sprite = null;
    this.scripted = false;
  }
}