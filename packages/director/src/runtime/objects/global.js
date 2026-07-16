export class GlobalObject {
  /**
   * Global method; sets all global variables to VOID (Lingo) or null (JavaScript syntax).
   * 
   * This method is useful when initializing global variables or when opening a new movie that
   * requires a new set of global variables.
   */
  clearGlobals() {}

  /**
   * Global method; displays all global variables in the Message window.
   * 
   * This method is useful for debugging scripts.
   */
  showGlobals() {}
}
