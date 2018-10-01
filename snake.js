/**
 * The definition of directions, intended to reduce the amount that other
 * parts of the system have to deal with this logic.
 */
const Directions = (function() {
 /**
  * UP, DOWN, LEFT and RIGHT represent the cartesian coordinate that would need
  * to be added to another cartesian coordinate, A, in order to produce a new
  * coordinate, B, where B is positioned one unit away in that direction from A.
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

function createUI(hardBorder, pauseHandler, newGameHandler, h=20, w=20) {
  const gameDiv = document.getElementById("game");
  if (!hardBorder) {
    gameDiv.classList.add("no-boundary");
  }
  const scoreDiv = document.getElementById("score");
  const statusDiv = document.getElementById("status-message");

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
  function drawBorder() {
    gameDiv.appendChild(createBorder(h, w));
  }
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
  function init() {
    gameDiv.addEventListener("click", pauseHandler);
    gameDiv.classList.remove("game-over");
    gameDiv.innerHTML = "";
    drawBorder();
  }
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
  function setPaused() {
    const pausedDiv = createOverlay("paused-overlay", "PAUSED");

    gameDiv.classList.add("paused");
    gameDiv.appendChild(pausedDiv);
  }
  function unsetPaused() {
    gameDiv.classList.remove("paused");
    gameDiv.removeChild(document.getElementById("paused-overlay"));
  }
  function setBorder(hard=false) {
    hardBorder = hard;
  }
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
  function drawTarget([col, row]) {
    const targetElem = document.createElement("div");
    targetElem.classList.add("target", `col-${col}`, `row-${row}`);
    gameDiv.appendChild(targetElem);
  }
  function removeTarget() {
    const targetElem = gameDiv.querySelector(".target");
    if (targetElem !== null) {
      gameDiv.removeChild(targetElem);
    }
  }
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

function game() {
  //let hardBorder = false;
  let hardBorder = true;
  const snake = createSnake({hardBorder});
  const ui = createUI(hardBorder, pauseHandler, newGameHandler);

  const target = [-1, -1];
  let speed = 0;
  let score = getScoreFromHTML();
  let extend = false;
  let state = "STOPPED";

  document.addEventListener("keydown", function(e) {
    const key = e.key;

    if ((state === "STARTED" || state === "PAUSED") && key === " ") {
      // Handle spacebar => pause
      togglePaused();
      e.preventDefault();
    } else if (state !== "STARTED") {
      // All other keypresses only work if game in progress
      return;
    }

    if (key == "Space") {
    } else if (key === "ArrowUp") {
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

  let timerId = null;
  function positionsEqual(pos1, pos2) {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
  }
  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }
  function stop() {
    state = "STOPPED";
    stopTimer();
  }
  function pause() {
    state = "PAUSED";
    stopTimer();
  }
  function togglePaused() {
    if (state === "STARTED") {
      ui.setPaused();
      pause();
    } else if (state === "PAUSED") {
      ui.unsetPaused();
      start(speed);
    }
  }
  function pauseHandler(e) {
    togglePaused();
    e.preventDefault();
  }
  function start() {
    state = "STARTED";
    const speedFraction = (50 - speed) / 50;
    const interval = 50 + Math.floor(speedFraction ** 2 * 250);
    timerId = setInterval(function() {
      move();
    }, interval);
  }
  function gameOver() {
    stop();
    ui.setGameOver();
  }
  function incrementSpeed() {
    if (speed === 50 || speed > (score * 2)) {
      return;
    }
    speed++;
    stop();
    start();
  }
  function incrementScore() {
    score++;
    if (score % 2 === 0) {
      incrementSpeed();
    }
  }
  function move() {
    toRemove = snake.move(extend);
    extend = false;
    if (checkForCollisions(snake.getPositions())) {
      gameOver();
      return;
    } else if (positionsEqual(snake.getPositions()[0], target)) {
      ui.removeTarget();
      extend = true;
      incrementScore();
      ui.drawScore(score);
      setTarget(snake.getPositions());
      ui.drawTarget(target);
    }
    ui.updateSnake(snake.getPositions(), toRemove);
  }
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
  function setTarget(occupied) {
    if (occupied.length < 200) {
      function randomTarget() {
        target[0] = Math.floor(Math.random() * 20);
        target[1] = Math.floor(Math.random() * 20);
      }

      randomTarget();
      while (occupied.some(function(tile) {
        return positionsEqual(target, tile);
      })) {
        randomTarget();
      };
    } else {
      const unoccupied = Array.from(Array(400).keys()).map(function(value) {
        return [Math.floor(value / 20), value % 20];
      }).filter(function(pos) {
        return !occupied.some(function(tile) {
          return positionsEqual(pos, tile);
        });
      });
    }
  }
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

  function newGameHandler(e) {
    e.stopPropagation();
    snake.reset();
    ui.reset();
    speed = 0;
    score = 0;
    extend = false;
    play();
    e.preventDefault();
  }
  function play() {
    const snakePositions = snake.getPositions();
    setTarget(snakePositions);

    ui.drawScore(score);
    ui.drawTarget(target);
    ui.drawSnake(snakePositions);

    start();
  }

  //play(0);
  const snakePositions = constructInitialSnake(score + 3);
  // Place target next to head of snake
  const targetPos = [0, 19].includes(snakePositions[0][0]) ?
                    [snakePositions[0][0], snakePositions[2][1]] :
                    [snakePositions[2][0], snakePositions[0][1]];
  ui.drawSnake(snakePositions);
  ui.drawTarget(targetPos);
  ui.drawScore(score);
  ui.setGameOver();
}

game();
