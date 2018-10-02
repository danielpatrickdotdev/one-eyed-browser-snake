/**
 * The definition of directions, intended to reduce the amount that other
 * parts of the system have to deal with this logic.
 */
const Directions = (function() {
 /**
  * UP, DOWN, LEFT and RIGHT represent cartesian coordinates for the positions
  * one unit away from [0, 0]. They can be added to another cartesian coordinate
  * in order to produce a new coordinate one unit away in the chosen direction.
  */
  const UP = [0, -1],
        RIGHT = [1, 0],
        DOWN = [0, 1],
        LEFT = [-1, 0];

  /**
   * @typedef {number} dirNum - integer from 0 to 3 where:
   *   0 = UP
   *   1 = RIGHT
   *   2 = DOWN
   *   3 = LEFT
   */
  const directions = [UP, RIGHT, DOWN, LEFT];

  /**
   * Returns the dirNum of the given dirNum rotated 90 degrees to the right.
   * @param {dirNum} dirNum
   */
  function next(dirNum) {
    return (dirNum + 1) % 4;
  }
  /**
   * Returns the dirNum of the direction to the left of given dirNum
   * @param {dirNum} dirNum
   */
  function prev(dirNum) {
    return (dirNum + 3) % 4;
  }
  /**
   * Returns the dirNum of the direction opposite the given dirNum
   * @param {dirNum} dirNum
   */
  function opposite(dirNum) {
    return (dirNum + 2) % 4;
  }
  /**
   * Returns the dirNum given one of UP, RIGHT, DOWN or LEFT
   * @param {dirNum} dirNum
   */
  function getDirNum(dir) {
    const [c, r] = dir;

    // We can't compare Arrays so this ugliness will do for now
    if (c === 0 && r === -1) {
      return 0;
    } else if (c === 1 && r === 0) {
      return 1;
    } else if (c === 0 && r === 1) {
      return 2;
    } else if (c === -1 && r === 0) {
      return 3;
    }
    throw new Error("Invalid direction: " + dir);
  }
  /**
   * Returns the direction (UP, RIGHT, DOWN or LEFT) of the given dirNum
   * @param {dirNum} dirNum
   */
  function get(n) {
    return directions[n].slice();
  }

  return Object.freeze({
    UP, RIGHT, DOWN, LEFT,
    get,
    next,
    prev,
    opposite,
    getDirNum
  });
})();

/**
 * Scoring system is based on standard HTTP status codes.
 * The score at the start of a new game (i.e. zero) is status 100.
 * As we have a finite list of codes, we'll have to cycle back through this
 * in the unlikely event that someone gets to status 511).
 */
const statusCodes = [
  {code: 100, message: "Continue"},
  {code: 101, message: "Switching Protocols"},
  {code: 102, message: "Processing"},
  {code: 103, message: "Early Hints"},
  {code: 200, message: "OK"},
  {code: 201, message: "Created"},
  {code: 202, message: "Accepted"},
  {code: 203, message: "Non-Authoritative Information"},
  {code: 204, message: "No Content"},
  {code: 205, message: "Reset Content"},
  {code: 206, message: "Partial Content"},
  {code: 207, message: "Multi-Status"},
  {code: 208, message: "Already Reported"},
  {code: 226, message: "IM Used"},
  {code: 300, message: "Multiple Choices"},
  {code: 301, message: "Moved Permanently"},
  {code: 302, message: "Found"},
  {code: 303, message: "See Other"},
  {code: 304, message: "Not Modified"},
  {code: 305, message: "Use Proxy"},
  {code: 306, message: "Switch Proxy"},
  {code: 307, message: "Temporary Redirect"},
  {code: 308, message: "Permanent Redirect"},
  {code: 400, message: "Bad Request"},
  {code: 401, message: "Unauthorized"},
  {code: 402, message: "Payment Required"},
  {code: 403, message: "Forbidden"},
  {code: 404, message: "Not Found"},
  {code: 405, message: "Method Not Allowed"},
  {code: 406, message: "Not Acceptable"},
  {code: 407, message: "Proxy Authentication Required"},
  {code: 408, message: "Request Timeout"},
  {code: 409, message: "Conflict"},
  {code: 410, message: "Gone"},
  {code: 411, message: "Length Required"},
  {code: 412, message: "Precondition Failed"},
  {code: 413, message: "Payload Too Large"},
  {code: 414, message: "URI Too Long"},
  {code: 415, message: "Unsupported Media Type"},
  {code: 416, message: "Range Not Satisfiable"},
  {code: 417, message: "Expectation Failed"},
  {code: 418, message: "I'm a teapot"},
  {code: 421, message: "Misdirected Request"},
  {code: 422, message: "Unprocessable Entity"},
  {code: 423, message: "Locked"},
  {code: 424, message: "Failed Dependency"},
  {code: 426, message: "Upgrade Required"},
  {code: 428, message: "Precondition Required"},
  {code: 429, message: "Too Many Requests"},
  {code: 431, message: "Request Header Fields Too Large"},
  {code: 451, message: "Unavailable For Legal Reasons"},
  {code: 500, message: "Internal Server Error"},
  {code: 501, message: "Not Implemented"},
  {code: 502, message: "Bad Gateway"},
  {code: 503, message: "Service Unavailable"},
  {code: 504, message: "Gateway Timeout"},
  {code: 505, message: "HTTP Version Not Supported"},
  {code: 506, message: "Variant Also Negotiates"},
  {code: 507, message: "Insufficient Storage"},
  {code: 508, message: "Loop Detected"},
  {code: 510, message: "Not Extended"},
  {code: 511, message: "Network Authentication Required"}
];

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
    rdir = oppositeDirection(dirNum);
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

/**
 * @typedef {object} ClickEvent
 */

/**
 * Construct UI controller
 * @param {boolean} hardBorder - Is border solid (true) or permeable (false)?
 * @param {function(ClickEvent)} pauseHandler - This event handler will be
 *                                              called when the user clicks on
 *                                              the game to pause it.
 * @param {function(ClickEvent)} newGameHandler - This event handler will be
 *                                                called when the user clicks
 *                                                a "new game" link.
 * @param {number} [h=20] - Number of rows
 * @param {number} [w=20] - Number of columns
 * @returns {Object} - Object with methods for controlling UI (eg. drawSnake)
 */
function createUI(hardBorder, pauseHandler, newGameHandler, h=20, w=20) {
  const gameDiv = document.getElementById("game");
  if (!hardBorder) {
    // Game should display differently if the boundary is permeable
    gameDiv.classList.add("no-boundary");
  }
  const scoreDiv = document.getElementById("score");
  const statusDiv = document.getElementById("status-message");

  /**
   * Creates a collection of border blocks with appropriate classes for CSS
   * for the given height and width. Returns a document fragment.
   *
   * @param {number} h - Height in blocks of element border will be applied to.
   * @param {number} w - Width in blocks of element border will be applied to.
   * @returns {DocumentFragment} - Document fragment containing border blocks.
   */
  function createBorder(h, w) {
    function createBorderDiv(colClass, rowClass) {
      const div = document.createElement("div");
      div.classList.add("border", colClass, rowClass);
      return div;
    }
    const fragment = document.createDocumentFragment();
    fragment.appendChild(createBorderDiv("left-border", "top-border"));
    fragment.appendChild(createBorderDiv("left-border", "bottom-border"));
    fragment.appendChild(createBorderDiv("right-border", "top-border"));
    fragment.appendChild(createBorderDiv("right-border", "bottom-border"));
    for (let i = 0; i < w; i++) {
      fragment.appendChild(createBorderDiv(`col-${i}`, "top-border"));
      fragment.appendChild(createBorderDiv(`col-${i}`, "bottom-border"));
    }
    for (let i = 0; i < h; i++) {
      fragment.appendChild(createBorderDiv("left-border", `row-${i}`));
      fragment.appendChild(createBorderDiv("right-border", `row-${i}`));
    }

    return fragment;
  }

  /**
   * Creates border on gameDiv.
   */
  function drawBorder() {
    gameDiv.appendChild(createBorder(h, w));
  }

  /**
   * Draw overlay with given text and div id
   *
   * @param {string} id - id to give overlay div.
   * @param {string} text - Text to display in overlay.
   * @returns {Element} - overlay div.
   */
  function createOverlay(id, text) {
    const textDiv = document.createElement("div");
    textDiv.innerHTML = `<span>${text}</span>`;
    textDiv.classList.add("overlay-text");

    const div = document.createElement("div");
    div.id = id;
    div.classList.add("overlay");
    div.appendChild(createBorder(4, 8));
    div.appendChild(textDiv);
    return div;
  }

  /**
   * Create one block of a snake using supplied attributes
   *
   * @param {object} spec - specification of snake block
   * @param {number} spec.col - x-position of the block
   * @param {number} spec.row - y-position of the block
   * @param {dirNum} spec.dir - orientation of the block
   * @param {boolean} [spec.head=false] - is block the head of the snake?
   * @param {boolean} [spec.tail=false] - is block the tail of the snake?
   * @returns {Element} - div representing on block of a snake
   */
  function createSnakePart({col, row, dir, head=false, tail=false}) {
    const elem = document.createElement("div");
    if (head) {
      elem.classList.add("snake-head");
    }
    if (tail) {
      elem.classList.add("snake-tail");
    }
    elem.classList.add("snake", `col-${col}`, `row-${row}`, `dir-${dir}`);

    return elem;
  }

  init();

  // Public methods

  /**
   * Reset UI state for new game.
   */
  function init() {
    gameDiv.addEventListener("click", pauseHandler);
    gameDiv.classList.remove("game-over");
    gameDiv.innerHTML = "";
    drawBorder();
  }

  /**
   * Display gameover overlay and allow newGameHandler to listen for new game
   * event. Waits one second before displaying new game button.
   */
  function setGameOver() {
    const newGameLink = document.createElement("div");
    newGameLink.classList.add("overlay-text", "new-game-link");
    newGameLink.innerHTML = "<span>NEW GAME?</span>";
    newGameLink.addEventListener("click", newGameHandler);

    const gameOverDiv = createOverlay("game-over-overlay", "GAME OVER");
    setTimeout(function() {
      gameOverDiv.appendChild(newGameLink);
    }, 1000);

    gameDiv.classList.add("game-over");
    gameDiv.removeEventListener("click", pauseHandler);
    gameDiv.appendChild(gameOverDiv);
  }

  /**
   * Displays paused overlay.
   */
  function setPaused() {
    const pausedDiv = createOverlay("paused-overlay", "PAUSED");

    gameDiv.classList.add("paused");
    gameDiv.appendChild(pausedDiv);
  }

  /**
   * Removes paused overlay.
   */
  function unsetPaused() {
    gameDiv.classList.remove("paused");
    gameDiv.removeChild(document.getElementById("paused-overlay"));
  }

  /**
   * Changes display of border to hard/soft.
   * @param {boolean} [hard=false] - if true, displays a solid border to indicate
   *                                 its impermeability.
   */
  function setBorder(hard=false) {
    hardBorder = hard;
  }

  /**
   * Draws snake using supplied array of positions and orientations.
   *
   * @param {number[][]} positions - Array of [x, y, dirNum] representing the
   *                                 snake's parts' coordinates and orientation.
   */
  function drawSnake(positions) {
    for (let i = 0; i < positions.length; i++) {
      const partSpec = {
        head: i === 0,
        tail: i === (positions.length - 1)
      };
      [partSpec.col, partSpec.row, partSpec.dir] = positions[i];

      const elem = createSnakePart(partSpec);
      gameDiv.appendChild(elem);
    };
  }

  /**
   * As drawSnake but updates the snake displayed.
   *
   * @param {number[][]} positions - Array of [x, y, dirNum] representing the
   *                                 snake's parts' coordinates and orientation.
   * @param {boolean} remove - whether or not we should remove a block. If the
   *                           snake has grown this turn, this will be false.
   *                           This argument is required so that this method
   *                           can be optimised - we only need to amend the head
   *                           tail of the snake.
   */
  function updateSnake(positions, remove) {
    if (positions.length > 0) {
      const headElem = gameDiv.querySelector(".snake-head");
      headElem.classList.remove("snake-head");

      const partSpec = {head: true};
      [partSpec.col, partSpec.row, partSpec.dir] = positions[0];
      const elem = createSnakePart(partSpec);
      gameDiv.appendChild(elem);
      if (remove) {
        [col, row,] = remove;
        const elem = gameDiv.querySelector(`.snake.col-${col}.row-${row}`);
        gameDiv.removeChild(elem);

        [col, row,] = positions.slice(-1)[0];
        const [prevCol, prevRow,] = positions.slice(-2)[0];
        dir = Directions.getDirNum([prevCol - col, prevRow - row]);
        const newTailElem = gameDiv.querySelector(`.snake.col-${col}.row-${row}`);
        newTailElem.classList.add("snake-tail");
        newTailElem.classList.remove("dir-0", "dir-1", "dir-2", "dir-3", "dir-4");
        newTailElem.classList.add(`dir-${dir}`);
      }
    }
  }

  /**
   * Place a target on the board at given position.
   *
   * @param {number[]} - x and y coordinates of the target.
   */
  function drawTarget([col, row]) {
    const targetElem = document.createElement("div");
    targetElem.classList.add("target", `col-${col}`, `row-${row}`);
    gameDiv.appendChild(targetElem);
  }

  /**
   * Remove the target element from the board.
   */
  function removeTarget() {
    const targetElem = gameDiv.querySelector(".target");
    if (targetElem !== null) {
      gameDiv.removeChild(targetElem);
    }
  }

  /**
   * Display the given score.
   *
   * @param {number} score - integer
   */
  function drawScore(score) {
    const {code, message} = statusCodes[score % statusCodes.length];
    scoreDiv.innerHTML = `${code}`;
    statusDiv.innerHTML = `${message}`;
  }

  return {
    reset: init,
    setGameOver,
    setPaused,
    unsetPaused,
    setBorder,
    drawSnake,
    updateSnake,
    drawTarget,
    removeTarget,
    drawScore
  }
}

/**
 * Runs the game using provided callback. Calls callback at specified intervals.
 *
 * @param {function} callback - Callback to be called at specified interval.
 * @param {number} interval - Number of milliseconds between calls to callback.
 */
function gameLoop(callback, interval=null) {
  let state = "STOPPED";
  let timerId = null;

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

// Run the game.
function game() {
  let hardBorder = true;
  const snake = createSnake({hardBorder});
  const ui = createUI(hardBorder, pauseHandler, newGameHandler);

  const target = [-1, -1]; // Initialise with dummy values
  let speed, score, extend; // Assign initial values via init()
  const gameloop = gameLoop(move); // Set game loop callback

  // Listen for the key events the game uses, ignore all others
  document.addEventListener("keydown", function(e) {
    const key = e.key;

    if (key === " ") {
      // Handle spacebar => pause
      pauseHandler(e);
      return;
    } else if (!gameloop.isStarted()) {
      // All other keypresses only work if game in progress
      return;
    }

    // Handle arrow keys
    if (key === "ArrowUp") {
      snake.changeDirection(0);
      e.preventDefault();
    } else if (key === "ArrowRight") {
      snake.changeDirection(1);
      e.preventDefault();
    } else if (key === "ArrowDown") {
      snake.changeDirection(2);
      e.preventDefault();
    } else if (key === "ArrowLeft") {
      snake.changeDirection(3);
      e.preventDefault();
    }
  });

  /**
   * Calculates the interval between ticks for the given speed.
   *   Interval increases exponentially as speed decreases.
   *   i.e. the gap between intervals gets smaller as speed increases.
   *   This is because as we approach a 50ms interval, changes will be
   *   more noticable.
   *
   * @param {number} speed - Integer 0 to 50.
   * @returns {number} - Integer 50 to 300.
   */
  function calculateInterval(speed) {
    // If speed is < 0 or > 50, change to 0 or 50 respectively
    speed = Math.min(Math.max(0, speed), 50);

    const speedFraction = 1 - speed / 50;
    return 50 + Math.floor(speedFraction ** 2 * 250);
  }

  /**
   * Event handler to pause the game or restart a paused game.
   *
   * @params {event} [e] - DOM event object
   */
  function pauseHandler(e=null) {
    if (gameloop.isStarted()) {
      ui.setPaused();
      gameloop.pause();
    } else if (gameloop.isPaused()) {
      ui.unsetPaused();
      gameloop.start();
    }
    if (e !== null && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
  }

  /**
   * Increase speed and accelerate gameloop.
   * If speed is already at max (50) then does nothing.
   */
  function incrementSpeed() {
    if (speed === 50 || speed > (score * 2)) {
      return;
    }
    speed++;
    gameloop.setInterval(calculateInterval(speed));
  }

  /*
   * Tests if two sets of cartesian coordinates are equal. Only uses first two
   * elements of each argument; ignores any additional elements.
   *
   * @param {number[]} pos1 - first x, y position to compare.
   * @param {number[]} pos2 - second x, y position to compare.
   * @returns {boolean} - true if pos1 and pos2 are equal.
   */
  function positionsEqual(pos1, pos2) {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
  }

  /**
   * To be called when the snake has collided with the target.
   * Side affects will likely include removing the target, creating a new one,
   * and updating the score, speed and snake length.
   */
  function processTargetCollision() {
    ui.removeTarget();
    extend = true;
    score++;
    if (score % 2 === 0) {
      incrementSpeed();
    }
    ui.drawScore(score);
    setTarget(snake.getPositions());
    ui.drawTarget(target);
  }

  /**
   * Tests whether the snake has collided with itself or a game border, taking
   * into account whether borders are permeable or not (using hardBorder).
   *
   * @param {number[][]} positions - Array of [x, y, dirNum] representing the
   *                                 snake's parts' coordinates and orientation.
   * @returns {boolean} - true if snake has collided with border or itself.
   */
  function checkForCollisions(positions) {
    if (positions.length == 0) {
      return false;
    }
    const pos = positions[0];
    if (hardBorder && (pos[0] < 0 || pos[0] >= 20 || pos[1] < 0 || pos[1] >= 20)) {
      return true;
    }
    return positions.slice(1).some(function(otherPos) {
      return positionsEqual(pos, otherPos);
    }) || checkForCollisions(positions.slice(1));
  }

  /**
   * Updates moving game parts (snake) one tick.
   * Checks for collisions and ends game if appropriate. Checks for capturing
   * of target and updates score and other variables accordingly.
   */
  function move() {
    toRemove = snake.move(extend);
    extend = false;
    if (checkForCollisions(snake.getPositions())) {
      gameloop.stop();
      ui.setGameOver();
    } else {
      if (positionsEqual(snake.getPositions()[0], target)) {
        processTargetCollision();
      }
      ui.updateSnake(snake.getPositions(), toRemove);
    }
  }

  /**
   * Sets the target position as a random position on the board that
   * isn't currently occupied.
   *
   * @param {number[][]} occupied - Array of x, y positions which are already
   *                                occupied and therefore cannot accept the
   *                                target.
   */
  function setTarget(occupied) {
    function convertToCoords(n) {
      return [Math.floor(n / 20), n % 20];
    }
    /*
     * Construct an Array representing all 400 board positions, remove the
     * occupied ones and select a random position from the resulting Array.
     *
     * Yes, just selecting a random position and checking it's free might be
     * faster *most* of the time, but this is more precise.
     */
    const unoccupied = Array.from(Array(400).keys()).map(function(value) {
      return value;
    }).filter(function(index) {
      // Remove occupied positions
      return !occupied.some(function(tile) {
        return positionsEqual(convertToCoords(index), tile);
      });
    });

    // Select a random element from the list
    const randomIndex = Math.floor(Math.random() * unoccupied.length);
    [target[0], target[1]] = convertToCoords(unoccupied[randomIndex]);
  }

  /**
   * Reads the statusCode "score" from the DOM and converts into an integer
   * score (where status 100 becomes 0). If the DOM element with id "score"
   * is empty or contains an invalid score, result will be zero.
   *
   * @returns {number} - Integer representing the index of the statusCode
   *                     or zero if unable to recognise the statusCode.
   */
  function getScoreFromHTML() {
    const scoreDiv = document.getElementById("score");
    const scoreCode = parseInt(scoreDiv.innerHTML);
    if (isNaN(scoreCode)) {
      return 0;
    }
    const score = statusCodes.findIndex(function(statusCode) {
      return statusCode.code === scoreCode;
    });
    if (score === -1) {
      return 0;
    }
    return score;
  }

  /**
   * Sets game state (speed, score, etc) ready for a new game.
   */
  function init() {
    speed = 0;
    score = 0;
    extend = false;
    gameloop.setInterval(calculateInterval(speed));
  }

  /**
   * Resets game state, UI and snake ready for a new game.
   * Only needed after game has been completed - for first game init() will do.
   */
  function reset() {
    init();
    snake.reset();
    ui.reset();
  }

  /**
   * Handles events which call for a new game to be started.
   *
   * @params {event} [e] - DOM event object
   */
  function newGameHandler(e) {
    e.stopPropagation();
    reset();
    play();
    e.preventDefault();
  }

  /**
   * Starts the game playing - to be called after init() or reset() only.
   */
  function play() {
    const snakePositions = snake.getPositions();
    setTarget(snakePositions);

    ui.drawScore(score);
    ui.drawTarget(target);
    ui.drawSnake(snakePositions);

    gameloop.start();
  }

  // Set initial variables
  init();

  // Read score from DOM
  score = getScoreFromHTML();

  if (score === 0) {
    // No score set in DOM, or score was set to zero, so we
    // start playing immediately.
    play();
  } else {
    // If score was set in DOM, we start in gameover state

    // Create dummy snake to display
    const snakePositions = constructInitialSnake(score + 3);
    // Place target next to head of snake
    const targetPos = [0, 19].includes(snakePositions[0][0]) ?
                      [snakePositions[0][0], snakePositions[2][1]] :
                      [snakePositions[2][0], snakePositions[0][1]];

    // Draw game pieces and show gameover overlay
    ui.drawSnake(snakePositions);
    ui.drawTarget(targetPos);
    ui.drawScore(score);
    ui.setGameOver();
  }
}

game();
