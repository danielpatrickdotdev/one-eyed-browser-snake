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
  {code: 404, message: "error on Wikipedia "},
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

function createSnake(spec={}) {
  const {d=0, c=9, r=9, ncols=20, nrows=20, n=3} = spec;
  let {hardBorder=false} = spec;
  const snakeArray = [];

  const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left
  let direction = directions[d];
  let nextMoveDirection = direction;

  function createParts(c, r) {
    snakeArray.push([c, r]);
    for (let i = 1; i < n; i++) {
      [c, r] = rtranslate([c, r], direction);
      snakeArray.push([c, r]);
    }
  }
  function reset() {
    snakeArray.length = 0;
    direction = directions[d];
    nextMoveDirection = direction;
    createParts(c, r);
  }

  function translate([c, r], dir) {
    c += dir[0];
    r += dir[1]; 
    if (!hardBorder) {
      c = (c + ncols) % ncols;
      r = (r + nrows) % nrows;
    }
    return [c, r]
  }
  function oppositeDirection(dir) {
    return directions[(directions.indexOf(dir) + 2) % 4];
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
    return directions.indexOf(direction);
  }
  function changeDirection(n) {
    /*
     * 0 = UP
     * 1 = RIGHT
     * 2 = DOWN
     * 3 = LEFT
     */
    newDirection = directions[n];
    if (newDirection != oppositeDirection(direction)) {
      nextMoveDirection = newDirection;
    }
  }
  function move(extend=false) {
    direction = nextMoveDirection;

    pos = snakeArray[0];
    snakeArray.splice(1, 0, pos);

    newPos = translate(pos, direction);
    snakeArray[0] = newPos.slice();

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
  function drawSnake(positions, dir) {
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const head = i === 0;
      const tail = i === (positions.length - 1);
      const elem = createSnakePart(...pos, dir, head, tail);
      gameDiv.appendChild(elem);
    };
  }
  function updateSnake(positions, dir, remove) {
    if (positions.length > 0) {
      const headElem = gameDiv.querySelector(".snake-head");
      headElem.classList.remove("snake-head");

      const [col, row] = positions[0];
      const elem = createSnakePart(col, row, dir, true);
      gameDiv.appendChild(elem);
      if (remove) {
        let [col, row] = remove;
        const elem = gameDiv.querySelector(`.snake.col-${col}.row-${row}`);
        gameDiv.removeChild(elem);

        [col, row] = positions.slice(-1)[0];
        const newTailElem = gameDiv.querySelector(`.snake.col-${col}.row-${row}`);
        newTailElem.classList.add("snake-tail");
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
  let score = 28;
  let extend = false;
  let state = "STOPPED";

  document.addEventListener("keypress", function(e) {
    if (state !== "STARTED") {
      return;
    }

    if (e.key == "ArrowUp") {
      snake.changeDirection(0);
      e.preventDefault();
    } else if (e.key == "ArrowRight") {
      snake.changeDirection(1);
      e.preventDefault();
    } else if (e.key == "ArrowDown") {
      snake.changeDirection(2);
      e.preventDefault();
    } else if (e.key == "ArrowLeft") {
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
  function pauseHandler(e) {
    if (state === "STARTED") {
      ui.setPaused();
      pause();
    } else if (state === "PAUSED") {
      ui.unsetPaused();
      start(speed);
    }
    e.preventDefault();
  }
  function start() {
    state = "STARTED";
    const speedFraction = (50 - speed) / 50;
    const interval = 50 + Math.floor(speedFraction ** 2 * 250);
    console.log(interval);
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
    ui.updateSnake(snake.getPositions(), snake.getDirection(), toRemove);
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
    snakePositions = snake.getPositions();
    setTarget(snakePositions);

    ui.drawScore(score);
    ui.drawTarget(target);
    ui.drawSnake(snakePositions, snake.getDirection());

    start();
  }

  //play(0);
  ui.drawScore(score);
  ui.setGameOver();
}

game();
