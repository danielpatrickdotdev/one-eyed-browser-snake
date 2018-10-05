import { Directions } from "./directions.js";

/**
 * Create a dummy snake Array intended for display purposes only.
 * @param {number} length - integer between 0 and 64
 * @returns {number[][]} - Array of [x, y, dirNum] representing the coordinates
 *                         and orientation of each part of the dummy snake.
 */
function constructInitialSnake(length) {
  const UP = Directions.UP,
        RIGHT = Directions.RIGHT,
        DOWN = Directions.DOWN,
        LEFT = Directions.LEFT;

  /**
   * snake55 represents the arbitrary orientations of a snake with length 64,
   * which is the length it would be at score = 61, i.e. when score displays as
   * status code 511.
   *
   * The snake is represented by an Array of directions UP, RIGHT, DOWN and
   * LEFT, which refer to orientation of each snake part - i.e. head is facing
   * UPwards by default.
   *
   * As positions of parts are calculated head to tail, each part'sdirection
   * will need to be reversed in order to calculate the next part's position.
   */
  const snake511 = [
    UP, UP, RIGHT, RIGHT, UP, UP,
    UP, LEFT, DOWN, LEFT, LEFT, LEFT,
    LEFT, LEFT, UP, UP, UP, RIGHT,
    RIGHT, RIGHT, RIGHT, RIGHT, RIGHT, RIGHT,
    RIGHT, UP, UP, UP, LEFT, LEFT,
    DOWN, DOWN, LEFT, LEFT, LEFT, LEFT,
    LEFT, UP, UP, RIGHT, RIGHT, UP,
    UP, LEFT, LEFT, UP, RIGHT, RIGHT,
    RIGHT, RIGHT, UP, UP, RIGHT, RIGHT,
    UP, UP, LEFT, LEFT, LEFT, LEFT,
    DOWN, DOWN, LEFT, UP
  ];

  // Starting x, y position
  let c, r;
  // Vertical orientation by default
  let horizontal = false;
  // Directions positive by default - i.e. head at top or left
  let reverse = false;

  // edge is a number between 0 and 3 inclusive - top, right, bottom or left
  const edge = Math.floor(Math.random() * 4);
  // flip, boolean, determines whether we'll use + or - dy
  const flip = Math.random() >= 0.5; // make row negative

  /**
   * randomEdgePoint returns a random number between 4 and 15, which represents
   * a point along a 20-sided square at which the snake's head can be placed.
   */
  function randomEdgePoint() {
    return Math.floor(Math.random() * 12) + 4;
  }

  /**
   * Pick a random point on the boundary to place the snake's head
   * and assign the other coordinate as -1 or 20 (just outside the boundary,
   * because our first move in snake511 will place us at 1 or 19).
   */
  switch (edge) {
    case 0: // top
      c = randomEdgePoint();
      r = -1;
      break;
    case 1: // right
      horizontal = true; // swap col and row
      reverse = true; // make col negative
      c = 20;
      r = randomEdgePoint();
      break;
    case 2: // bottom
      reverse = true; // make col negative
      c = randomEdgePoint();
      r = 20;
      break;
    default: // left
      horizontal = true; // swap col and row
      c = -1;
      r = randomEdgePoint();
  }
  // Slice snake to the given length (intended to be an index of statusCodes + 3)
  return snake511.slice(0, length).map(function(dir) {
    // dir is one of UP, RIGHT, DOWN or LEFT
    let [dx, dy] = dir;

    if (flip) {
    // Randomly (50%) reverse the snake's shape perpendicular to the border
      dx = -dx;
    }
    if (reverse) {
    // If we're starting from bottom or right, we need to deduct rather than
    // add to the coordinate
      dy = -dy;
    }
    if (horizontal) {
      // Rotate the directions by swapping col and row
      [dx, dy] = [dy, dx];
    }
    // Deduct dx and dy because they represent the orientation of the snake part
    // rather than the direction the next piece is in
    c -= dx;
    r -= dy;
    // Return the snake part position plus its orientation as an int (0 to 3)
    return [c, r, Directions.getDirNum([dx, dy])];
  });
}

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
    const [dx, dy] = Directions.get(dirNum);
    x += dx;
    y += dy;
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
   */
  function changeDirection(newDirection) {
    if (newDirection != oppositeDirection(direction)) {
      nextMoveDirection = newDirection;
    }
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

export { constructInitialSnake, createSnake };
