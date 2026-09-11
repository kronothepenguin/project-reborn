// Scripting objects barrel (011) — the 4 Xtra scripting classes.
// Created via `new xtra("fileio" | "netlingo" | "speechxtra" | "xmlparser")`
// (docs: scripting_objects.txt "You can create a reference to a X object by
// using the new operator.").

import { FileioObject } from "./fileio.js";
import { NetLingoObject } from "./net-lingo.js";
import { SpeechXtraObject } from "./speech-xtra.js";
import { XMLParserObject } from "./xml-parser.js";

export { FileioObject };
export { NetLingoObject };
export { SpeechXtraObject };
export { XMLParserObject };

// The Xtra name → class map used by api/methods/xtra.js.
export const XTRA_CLASSES = {
  fileio: FileioObject,
  netlingo: NetLingoObject,
  speechxtra: SpeechXtraObject,
  xmlparser: XMLParserObject,
};