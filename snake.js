const Directions = (function() {
  const UP = [0, -1],
        RIGHT = [1, 0],
        DOWN = [0, 1],
        LEFT = [-1, 0];

  const directions = [UP, RIGHT, DOWN, LEFT];

  function next(dirNum) {
    return (dirNum + 1) % 4;
  }
  function prev(dirNum) {
    return (dirNum + 3) % 4;
  }
  function opposite(dirNum) {
    return (dirNum + 2) % 4;
  }
  function getDirNum(dir) {
    const [c, r] = dir;

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

function constructInitialSnake(length) {
  const UP = Directions.UP,
        RIGHT = Directions.RIGHT,
        DOWN = Directions.DOWN,
        LEFT = Directions.LEFT;

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

  let c, r;
  let horizontal = false,
      reverse = false;
  const edge = Math.floor(Math.random() * 4); // 0 to 3 = top, right, bottom & left
  const flip = Math.random() >= 0.5; // make row negative

  function randomEdgePoint() {
    return Math.floor(Math.random() * 12) + 4; // 4 to 15
  }

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
  return snake511.slice(0, length).map(function(dir) {
    let [dx, dy] = dir;

    if (flip) {
      dx = -dx;
    }
    if (reverse) {
      dy = -dy;
    }
    if (horizontal) {
      [dx, dy] = [dy, dx]; // swap col and row
    }
    c -= dx;
    r -= dy;
    return [c, r, Directions.getDirNum([dx, dy])];
  });
}

function createSnake(spec={}) {
  const {d=0, c=9, r=9, ncols=20, nrows=20, n=3} = spec;
  let {hardBorder=false} = spec;
  const snakeArray = [];

  let direction = d;
  let nextMoveDirection = d;

  function createParts(c, r) {
    snakeArray.push([c, r, direction]);
    for (let i = 1; i < n; i++) {
      [c, r] = rtranslate([c, r], direction);
      snakeArray.push([c, r, direction]);
    }
  }
  function reset() {
    snakeArray.length = 0;
    direction = d;
    nextMoveDirection = direction;
    createParts(c, r);
  }

  function translate([c, r], dir) {
    const [dx, dy] = Directions.get(dir);
    c += dx;
    r += dy;
    if (!hardBorder) {
      c = (c + ncols) % ncols;
      r = (r + nrows) % nrows;
    }
    return [c, r]
  }
  function oppositeDirection(dir) {
    return Directions.opposite(dir);
  }
  function rtranslate(pos, dir) {
    rdir = oppositeDirection(dir);
    return translate(pos, rdir);
  }
  function getDirection() {
    /*
     * 0 = UP
     * 1 = RIGHT
     * 2 = DOWN
     * 3 = LEFT
     */
    return direction;
  }
  function changeDirection(newDirection) {
    /*
     * 0 = UP
     * 1 = RIGHT
     * 2 = DOWN
     * 3 = LEFT
     */
    if (newDirection != oppositeDirection(direction)) {
      nextMoveDirection = newDirection;
    }
  }
  function move(extend=false) {
    direction = nextMoveDirection;

    pos = snakeArray[0];
    snakeArray.splice(1, 0, pos);

    newPos = translate(pos, direction);
    snakeArray[0] = [...newPos.slice(), direction];

    if (!extend) {
      return snakeArray.pop();
    }
  }
  function getPositions() {
    return snakeArray.map(function(part) {
      return part.slice();
    });
  }
  function setBorder(hard=false) {
    hardBorder = hard;
  }

  createParts(c, r);

  return {
    reset,
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
  let targetElem = null;
  function setPauseHandler(handler) {
    gameDiv.addEventListener("click", pauseHandler);
  }
  function drawBorder() {
    gameDiv.appendChild(createBorder(h, w));
  }
  setPauseHandler(pauseHandler);
  drawBorder();

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
  function reset() {
    setTimeout(function() {
      setPauseHandler(pauseHandler);
    }, 50);
    gameDiv.classList.remove("game-over");
    gameDiv.innerHTML = "";
    drawBorder();
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
  function setPaused() {
    const pausedDiv = createOverlay("paused-overlay", "PAUSED");

    gameDiv.classList.add("paused");
    gameDiv.appendChild(pausedDiv);
  }
  function unsetPaused() {
    gameDiv.classList.remove("paused");
    gameDiv.removeChild(document.getElementById("paused-overlay"));
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
  function createSnakePart(col, row, dir, isHead, isTail=false) {
    const elem = document.createElement("div");
    if (isHead) {
      elem.classList.add("snake-head");
    }
    if (isTail) {
      elem.classList.add("snake-tail");
    }
    elem.classList.add("snake", `col-${col}`, `row-${row}`, `dir-${dir}`);

    return elem;
  }
  function drawSnake(positions) {
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const head = i === 0;
      const tail = i === (positions.length - 1);
      const elem = createSnakePart(...pos, head, tail);
      gameDiv.appendChild(elem);
    };
  }
  function updateSnake(positions, remove) {
    if (positions.length > 0) {
      const headElem = gameDiv.querySelector(".snake-head");
      headElem.classList.remove("snake-head");

      let [col, row, dir] = positions[0];
      const elem = createSnakePart(col, row, dir, true);
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
  function removeSnake() {
    Array.from(gameDiv.children).forEach(function (elem) {
      if (elem.classList.contains("snake")) {
        gameDiv.removeChild(elem);
      }
    });
  }
  function removeTarget() {
    if (targetElem !== null) {
      gameDiv.removeChild(targetElem);
    }
  }
  function drawTarget([col, row]) {
    targetElem = document.createElement("div");
    targetElem.classList.add("target", `col-${col}`, `row-${row}`);
    gameDiv.appendChild(targetElem);
  }
  function drawScore(score) {
    const {code, message} = statusCodes[score % statusCodes.length];
    scoreDiv.innerHTML = `${code}`;
    statusDiv.innerHTML = `${message}`;
  }
  function setBorder(hard=false) {
    hardBorder = hard;
  }

  return {
    reset,
    setBorder,
    setPaused,
    unsetPaused,
    setGameOver,
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
