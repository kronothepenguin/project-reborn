/**
 * SpeechXtra scripting object (Chapter 7: Scripting Objects — "SpeechXtra").
 *
 * Enables you to add text-to-speech functionality to a movie.
 *
 * You can create a reference to a SpeechXtra object by using the new operator:
 * `new xtra("speechxtra")`.
 *
 * Method summary: voiceCount(), voiceGet(), voiceGetAll(), voiceGetPitch(),
 * voiceGetRate(), voiceGetVolume(), voiceInitialize(), voicePause(),
 * voiceResume(), voiceSet(), voiceSetPitch(), voiceSetRate(), voiceSetVolume(),
 * voiceSpeak(), voiceState(), voiceStop(), voiceWordPos().
 *
 * Deterministic v1 stubs (no TTS engine in the runtime), per 011 clarify.
 */
export class SpeechXtraObject {
  _speaking = false;

  /**
   * Returns the number of available text-to-speech voices.
   *
   * @returns {number}
   */
  voiceCount() {
    return 0;
  }

  /**
   * Returns the current text-to-speech voice name.
   *
   * @returns {string}
   */
  voiceGet() {
    return "";
  }

  /**
   * Returns a list of all text-to-speech voices.
   *
   * @returns {array}
   */
  voiceGetAll() {
    return [];
  }

  /**
   * Returns the current voice pitch.
   *
   * @returns {number}
   */
  voiceGetPitch() {
    return 0;
  }

  /**
   * Returns the current voice speaking rate.
   *
   * @returns {number}
   */
  voiceGetRate() {
    return 0;
  }

  /**
   * Returns the current voice volume.
   *
   * @returns {number}
   */
  voiceGetVolume() {
    return 0;
  }

  /**
   * Initializes the text-to-speech engine.
   *
   * @param {string} _voiceName Required. The name of the voice to initialize.
   * @param {boolean} _useDefault Required. Whether to use the default settings.
   * @returns {void}
   */
  voiceInitialize(_voiceName, _useDefault) {}

  /**
   * Pauses the current speech output.
   *
   * @returns {void}
   */
  voicePause() {
    this._speaking = false;
  }

  /**
   * Resumes speech output after a pause.
   *
   * @returns {void}
   */
  voiceResume() {
    this._speaking = false;
  }

  /**
   * Sets the text-to-speech voice.
   *
   * @param {string} _voiceName Required. The name of the voice.
   * @returns {void}
   */
  voiceSet(_voiceName) {}

  /**
   * Sets the current voice pitch.
   *
   * @param {number} _pitch Required. The pitch value.
   * @returns {void}
   */
  voiceSetPitch(_pitch) {}

  /**
   * Sets the current voice speaking rate.
   *
   * @param {number} _rate Required. The rate value.
   * @returns {void}
   */
  voiceSetRate(_rate) {}

  /**
   * Sets the current voice volume.
   *
   * @param {number} _volume Required. The volume value.
   * @returns {void}
   */
  voiceSetVolume(_volume) {}

  /**
   * Speaks the specified text.
   *
   * @param {string} _textToSpeak Required. The text to speak.
   * @returns {void}
   */
  voiceSpeak(_textToSpeak) {
    this._speaking = true;
  }

  /**
   * Returns the current state of speech output.
   *
   * @returns {number}
   */
  voiceState() {
    return 0;
  }

  /**
   * Stops speech output.
   *
   * @returns {void}
   */
  voiceStop() {
    this._speaking = false;
  }

  /**
   * Returns the current word position in the speech output.
   *
   * @returns {number}
   */
  voiceWordPos() {
    return 0;
  }
}