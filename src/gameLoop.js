/**
 * Runs the game using provided callback. Calls callback at specified intervals.
 *
 * @param {function} callback - Callback to be called at specified interval.
 * @param {number} interval - Number of milliseconds between calls to callback.
 */
function gameLoop(callback, interval=null) {
  validateInterval();
  let state = "STOPPED";
  let timerId = null;

  function validateInterval() {
    if (interval !== null && interval < 10) {
      throw new Error(
        "timer interval must be at least 10ms"
      );
    }
  }

  // Starts timer
  function _start() {
    if (interval === null) {
      throw new Error(
        "timer interval must be set before timer can start"
      );
    }

    timerId = setInterval(function() {
      callback();
    }, interval);
  }

  // Stops timer, if started
  function _stop() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  /**
   * Start game loop
   */
  function start() {
    state = "STARTED";
    _start();
  }

  /**
   * Stop game loop
   */
  function stop() {
    state = "STOPPED";
    _stop();
  }

  /**
   * Pause game loop
   */
  function pause() {
    state = "PAUSED";
    _stop();
  }

  /**
   * Change interval between calls to callback
   *
   * @param {number} newInterval - Number of milliseconds to wait between calls
   *                               to callback.
   */
  function setInterval_(newInterval) {
    interval = newInterval;

    // If started, restart with new interval
    if (timerId !== null) {
      _stop();
      _start();
    }
  }

  /**
   * Returns true if game loop is started, false otherwise.
   */
  function isStarted() {
    return state === "STARTED";
  }

  /**
   * Returns true if game loop is stopped, false otherwise.
   */
  function isStopped() {
    return state === "STOPPED";
  }

  /**
   * Returns true if game loop is paused, false otherwise.
   */
  function isPaused() {
    return state === "PAUSED";
  }

  return {
    start,
    stop,
    pause,
    isStarted,
    isStopped,
    isPaused,
    setInterval: setInterval_
  }
}

export { gameLoop };
