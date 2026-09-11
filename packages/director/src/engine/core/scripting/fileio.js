/**
 * Fileio scripting object (Chapter 7: Scripting Objects — "Fileio").
 *
 * Enables you to perform file input and output operations.
 *
 * You can create a reference to a Fileio object by using the new operator:
 * `new xtra("fileio")`.
 *
 * Method summary: closeFile(), createFile(), delete(), displayOpen(),
 * displaySave(), error(), fileName(), getFinderInfo(), getLength(),
 * getOSDirectory(), getPosition(), openFile(), readChar(), readFile(),
 * readLine(), readToken(), readWord(), setFilterMask(), setFinderInfo(),
 * setNewLineConversion(), setPosition(), status(), version(), writeChar(),
 * writeReturn(), writeString().
 *
 * The browser runtime has no filesystem: all methods are documented
 * deterministic v1 stubs (no-op + documented defaults), per 011 clarify.
 */
export class FileioObject {
  _fileName = "";
  _position = 0;

  /**
   * Closes the open file.
   *
   * @returns {void}
   */
  closeFile() {}

  /**
   * Creates a file with the specified name.
   *
   * @param {string} _fileName Required. The name of the file to create.
   * @returns {void}
   */
  createFile(_fileName) {}

  /**
   * Deletes the specified file.
   *
   * @param {string} _fileName Required. The name of the file to delete.
   * @returns {void}
   */
  delete(_fileName) {}

  /**
   * Displays a dialog box that lets the user select a file and opens it.
   *
   * @returns {string}
   */
  displayOpen() {
    return "";
  }

  /**
   * Displays a dialog box that lets the user name a file and saves it.
   *
   * @returns {string}
   */
  displaySave() {
    return "";
  }

  /**
   * Returns the error string from the last file operation.
   *
   * @param {number} _whichFile Required. The specific file for which to report the error.
   * @returns {string}
   */
  error(_whichFile) {
    return "";
  }

  /**
   * Returns the name of the file associated with a Fileio object.
   *
   * @param {object} _fileObjRef Required. A reference to a Fileio object.
   * @returns {string}
   */
  fileName(_fileObjRef) {
    return this._fileName;
  }

  /**
   * Returns information about the specified file.
   *
   * @param {string} _fileName Required. The name of the file.
   * @param {string} _type Required. The type of information.
   * @returns {string}
   */
  getFinderInfo(_fileName, _type) {
    return "";
  }

  /**
   * Returns the length, in bytes, of the current open file.
   *
   * @param {number} _whichFile Required. The specific file for which to report the length.
   * @returns {number}
   */
  getLength(_whichFile) {
    return 0;
  }

  /**
   * Returns the name of the current system's OS directory.
   *
   * @returns {string}
   */
  getOSDirectory() {
    return "";
  }

  /**
   * Returns the position of the file cursor in the current open file.
   *
   * @param {number} _whichFile Required. The specific file for which to report the position.
   * @returns {number}
   */
  getPosition(_whichFile) {
    return this._position;
  }

  /**
   * Opens the specified file and associates it with a Fileio object.
   *
   * @param {string} _fileName Required. The name of the file to open.
   * @param {number} _accessType Required. The access mode for the file.
   * @returns {void}
   */
  openFile(_fileName, _accessType) {}

  /**
   * Reads a character from an open file.
   *
   * @param {number} _whichFile Required. The specific file to read from.
   * @returns {string}
   */
  readChar(_whichFile) {
    return "";
  }

  /**
   * Reads all data from the current open file and returns it as a string.
   *
   * @returns {string}
   */
  readFile() {
    return "";
  }

  /**
   * Reads one line from the current open file.
   *
   * @returns {string}
   */
  readLine() {
    return "";
  }

  /**
   * Reads characters from the current open file up to a specified delimiter.
   *
   * @param {string} _delimiter Required. The delimiter.
   * @returns {string}
   */
  readToken(_delimiter) {
    return "";
  }

  /**
   * Reads a word from the current open file.
   *
   * @returns {string}
   */
  readWord() {
    return "";
  }

  /**
   * Sets a filter mask for the displayOpen() and displaySave() dialog boxes.
   *
   * @param {string} _filterMask Required. The filter mask.
   * @returns {void}
   */
  setFilterMask(_filterMask) {}

  /**
   * Sets the Finder info for the specified file.
   *
   * @param {string} _fileName Required. The name of the file.
   * @param {string} _fileType Required. The file type.
   * @param {string} _creator Required. The creator code.
   * @returns {void}
   */
  setFinderInfo(_fileName, _fileType, _creator) {}

  /**
   * Sets the new-line conversion for the current open file.
   *
   * @param {number} _whichFile Required. The specific file.
   * @param {number} _conversionType Required. The conversion type.
   * @returns {void}
   */
  setNewLineConversion(_whichFile, _conversionType) {}

  /**
   * Sets the position of the file cursor in the current open file.
   *
   * @param {number} _whichFile Required. The specific file.
   * @param {number} _position Required. The new cursor position.
   * @returns {void}
   */
  setPosition(_whichFile, _position) {
    this._position = Number(_position) || 0;
  }

  /**
   * Returns the status of the current open file.
   *
   * @returns {number}
   */
  status() {
    return 0;
  }

  /**
   * Returns the version of the File Xtra.
   *
   * @param {object} _fileObjRef Required. A reference to a Fileio object.
   * @returns {string}
   */
  version(_fileObjRef) {
    return "";
  }

  /**
   * Writes a specified character to the current open file.
   *
   * @param {string} _character Required. The character to write.
   * @returns {void}
   */
  writeChar(_character) {}

  /**
   * Writes a carriage return to the current open file.
   *
   * @returns {void}
   */
  writeReturn() {}

  /**
   * Writes a specified string to the current open file.
   *
   * @param {string} _str Required. The string to write.
   * @returns {void}
   */
  writeString(_str) {}
}