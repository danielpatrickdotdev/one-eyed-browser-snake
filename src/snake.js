import { Directions } from "./directions.js";

/**
 * Keeps a record of all the snake parts and their orientations,
 * and is responsible for moving the snake so needs to be told to
 * changeDirection() and move() when appropriate.
 *
 * @param {Object} [spec] - The initial settings for the snake.
 * @param {number} [spec.d=0] - integer between 0 and 3 - orientation of the
 *                              snake.
 * @param {number} [spec.c=9] - column in which to place head.
 * @param {number} [spec.r=9] - row in which to place head.
 * @param {number} [spec.ncols=20] - number of columns on game's board.
 * @param {number} [spec.nrows=20] - number of rows on game's board.
 * @param {boolean} [spec.hardBorder=false] - wether he snake can pass through
 *                                            the board's edges; this affects
 *                                            how the snake can be moved.
 * @param {number} [spec.n=3] - number of snake parts to draw including head and
 *                              tail.
 * @returns {Object} - Object with methods for controlling snake (eg. move).
 *
 * Note that the constructor will not check there are enough spaces in the board
 * for the snake, so this needs to be considered when choosing params.
 */
function createSnake(spec={}) {
  const {d=0, c=9, r=9, ncols=20, nrows=20, n=3} = spec;
  let {hardBorder=false} = spec;

  const snakeArray = [];
  /**
   * direction tracks the last direction actually moved, nextMoveDirection is
   * assigned when a changeDirection() instruction is received, and applied when
   * move() is called, at which point direction and nextMoveDirection will be
   * the same.
   */
  let direction;
  let nextMoveDirection;

  /**
   * Resets snake's state to zero; builds a snake of length n in direction d,
   * starting at position c, r.
   */
  function init() {
    function createInitialParts(x, y) {
      snakeArray.push([x, y, direction]);
      for (let i = 1; i < n; i++) {
        [x, y] = rtranslate(x, y, direction);
        snakeArray.push([x, y, direction]);
      }
    }
    snakeArray.length = 0; // clear Array
    direction = d;
    nextMoveDirection = direction;
    createInitialParts(c, r);
  }

  /**
   * Calculates and returns new x and y coordinates one unit away from given
   * x and y in the direction of dirNum.
   * @param {number} x - starting horizontal coordinate
   * @param {number} y - starting vertical coordinate
   * @param {dirNum} dirNum - direction to move in
   */
  function translate(x, y, dirNum) {
    [x, y] = Directions.translate(x, y, dirNum);

    if (!hardBorder) {
      x = (x + ncols) % ncols;
      y = (y + nrows) % nrows;
    }
    return [x, y]
  }
  /**
   * Returns the dirNum of the direction opposite the given dirNum
   * @param {dirNum} dirNum
   */
  function oppositeDirection(dirNum) {
    return Directions.opposite(dirNum);
  }
  /**
   * Calculates and returns new x and y coordinates one unit away from given
   * x and y in the opposite direction to the direction of dirNum.
   * @param {number} x - starting horizontal coordinate
   * @param {number} y - starting vertical coordinate
   * @param {dirNum} dirNum - oppisite of direction to move in
   */
  function rtranslate(x, y, dirNum) {
    const rdir = oppositeDirection(dirNum);
    return translate(x, y, rdir);
  }
  /**
   * Returns dirNum of the direction the snake is moving in currently.
   */
  function getDirection() {
    return direction;
  }
  /**
   * Tell the snake to make future moves in newDirection.
   *
   * newDirection must be a right or left turn from current direction - i.e.
   * if snake is currently travelling UP, newDirection of UP or DOWN will have
   * no impact.
   *
   * @param {dirNum} newDirection
   * @returns {boolean} - true if direction changed, false if not (i.e. because
   *                      invalid).
   */
  function changeDirection(newDirection) {
    if (newDirection != oppositeDirection(direction)) {
      nextMoveDirection = newDirection;
      snakeArray[0][2] = newDirection;
      return true;
    }
    return false;
  }
  /**
   * Move snake one space in its current direction.
   *
   * @param {boolean} extend - whether or not the snake should grow by one
   *                           block while moving.
   * @returns {(number[]|undefined)} - [x, y, dirNum] of removed tail. Will be
   *                                   undefined when extend=true because no
   *                                   tail is removed.
   */
  function move(extend=false) {
    // Update direction - any calls to getDirection will return the last
    // direction snake moved in
    direction = nextMoveDirection;

    // Calculate new head position using previous head position and current
    // direction; insert newHead into snakeArray.
    const [x, y, ] = snakeArray[0];
    const newHead = [...translate(x, y, direction), direction];
    snakeArray.unshift(newHead);

    // If we're not told to extend the snake's length, remove the last part
    if (!extend) {
      return snakeArray.pop();
    }
  }
  /**
   * @returns {number[][]} - Array of [x, y, dirNum] representing the snake's
   *                         parts' coordinates and orientation.
   */
  function getPositions() {
    return snakeArray.map(function(part) {
      return part.slice();
    });
  }
  /**
   * Set or unset snake's ability to move through borders (wraps around).
   * @params {boolean} hard - true allows snake to move through the borders.
   */
  function setBorder(hard=false) {
    hardBorder = hard;
  }

  // Set some initial values and construct initial snake
  init();

  return {
    reset: init,
    setBorder,
    move,
    getDirection,
    changeDirection,
    getPositions
  };
}

export { createSnake };
