/**
 * Network Operations
 * 
 * Simulates Lingo's networking functions:
 * - postNetText()  - POST request
 * - preloadNetThing() - preload a file
 * - netDone() - check if preload finished
 * - getMoviePath() - get the movie URL path
 */

class NetworkManager {
  constructor() {
    this.preloadPromises = new Map();
    this.moviePath = window.location.origin + '/';
  }

  /**
   * Simulate getMoviePath() - returns the base URL of the movie
   */
  getMoviePath() {
    return this.moviePath;
  }

  /**
   * Simulate preloadNetThing(url) - start preloading a resource
   */
  preloadNetThing(url) {
    if (this.preloadPromises.has(url)) {
      return;
    }

    const promise = fetch(url, { method: 'HEAD' })
      .then(() => true)
      .catch(() => true); // Treat failure as "done" for preload

    this.preloadPromises.set(url, promise);
    console.log('[Network] preloadNetThing:', url);
  }

  /**
   * Simulate netDone() - check if all preloads are complete
   */
  netDone() {
    // In the original Lingo, this checks if the current preload operation is done
    // For simplicity, we consider it done if no pending preloads
    return this.preloadPromises.size === 0;
  }

  /**
   * Simulate postNetText(url, data) - POST request
   */
  async postNetText(url, data) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data),
      });
    } catch {
      // Silent fail for non-critical posts
    }
  }

  /**
   * Set the movie path (for resetClient redirect)
   */
  setMoviePath(path) {
    this.moviePath = path;
  }
}

export const networkManager = new NetworkManager();
export default networkManager;
