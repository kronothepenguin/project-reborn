/**
 * Error API
 * 
 * Translated from: casts/fuse_client/7_Error API.ls
 * 
 * Global error handling functions.
 * Provides error() for recoverable errors and fatalError() for critical failures.
 */

import { VOID, voidp } from '../../core/lingo-runtime.js';

/**
 * Report an error (non-fatal)
 * 
 * Original Lingo:
 *   on error me, tMsg, tHandler, tSeverity
 *     put tMsg
 *     -- May show error dialog in production
 *   end
 */
export function error(source, message, handler, severity = 'minor') {
  const sourceStr = voidp(source) ? 'unknown' : 
    (typeof source === 'object' ? source.constructor.name : String(source));
  const handlerStr = voidp(handler) ? '' : ` in ${String(handler)}`;
  const severityStr = voidp(severity) ? '' : ` [${String(severity)}]`;

  console.error(`[Error${severityStr}] ${sourceStr}${handlerStr}: ${message}`);
  
  // In production, could show a non-blocking error indicator
  return VOID;
}

/**
 * Report a fatal error and stop the client
 * 
 * Original Lingo:
 *   on fatalError tMsg
 *     put tMsg
 *     stopClient()
 *   end
 */
export function fatalError(message) {
  console.error(`[FATAL] ${message}`);
  
  // In production, show blocking error dialog
  // The stopClient call would be handled by the calling code
  // to avoid circular imports

  return VOID;
}

/**
 * Report a server connection error
 */
export function serverError(message) {
  console.error(`[Server Error] ${message}`);
  // Could trigger a reconnect attempt
  return VOID;
}
