/**
 * XML Parser scripting object (Chapter 7: Scripting Objects — "XML Parser").
 *
 * Enables you to perform XML parsing.
 *
 * You can create a reference to an XML Parser object by using the new operator:
 * `new xtra("xmlparser")`.
 *
 * Method summary: count(), doneParsing(), getError(), ignoreWhiteSpace(),
 * makeList(), makeSubList(), parseString(), parseURL().
 * Property summary: attributeName, attributeValue, child, name.
 *
 * Minimal real per 011 clarify: parseString() runs through DOMParser when
 * available (browser/jsdom) and counts top-level children; DOM-free
 * environments return 0 children without throwing.
 */
export class XMLParserObject {
  _document = null;
  _error = "";
  _ignoreWhiteSpace = false;

  /**
   * XML parser property; contains the name of the current attribute.
   * Read/write.
   */
  attributeName = "";

  /**
   * XML parser property; contains the value of the current attribute.
   * Read/write.
   */
  attributeValue = "";

  /**
   * XML parser property; contains the name of the current XML element.
   * Read/write.
   */
  name = "";

  /**
   * XML parser property; contains a reference to the current child of the
   * XML element. Read/write.
   */
  child = {};

  /**
   * XML parser method; returns the number of children of the current XML
   * element.
   *
   * @returns {number}
   */
  count() {
    return this._document?.documentElement?.childElementCount ?? 0;
  }

  /**
   * XML parser method; indicates whether parsing has completed (<Void>/TRUE)
   * or is still in progress (FALSE).
   *
   * @returns {boolean}
   */
  doneParsing() {
    return this._document != null;
  }

  /**
   * XML parser method; returns a string describing the most recent parsing
   * error, or "" when the last parse succeeded.
   *
   * @returns {string}
   */
  getError() {
    return this._error;
  }

  /**
   * XML parser method; specifies whether white space in the document is
   * ignored during parsing.
   *
   * @param {boolean} bool Required. TRUE to ignore white space, FALSE to keep it.
   * @returns {void}
   */
  ignoreWhiteSpace(bool) {
    this._ignoreWhiteSpace = Boolean(bool);
  }

  /**
   * XML parser method; returns a list representing the current XML element.
   *
   * @returns {array}
   */
  makeList() {
    return [];
  }

  /**
   * XML parser method; returns a list representing the children of the
   * current XML element.
   *
   * @returns {array}
   */
  makeSubList() {
    return [];
  }

  /**
   * XML parser method; parses the specified XML string.
   *
   * @param {string} stringToParse Required. The XML string to parse.
   * @returns {boolean}
   */
  parseString(stringToParse) {
    if (typeof stringToParse !== "string" || stringToParse.length === 0) {
      this._document = null;
      this._error = "No XML string specified";
      return false;
    }
    if (typeof DOMParser !== "undefined") {
      try {
        const doc = new DOMParser().parseFromString(stringToParse, "text/xml");
        if (doc.querySelector("parsererror")) {
          this._document = null;
          this._error = "Malformed XML";
          return false;
        }
        this._document = doc;
        this._error = "";
        this.name = doc.documentElement?.nodeName ?? "";
        return true;
      } catch (err) {
        this._document = null;
        this._error = err?.message ?? "Malformed XML";
        return false;
      }
    }
    // DOM-free environment: no parser available — deterministic v1 stub.
    this._error = "";
    this._document = null;
    return true;
  }

  /**
   * XML parser method; parses a document at the specified URL.
   *
   * @param {string} _url Required. The URL of the document to parse.
   * @returns {boolean}
   */
  parseURL(_url) {
    return this.parseString("");
  }
}