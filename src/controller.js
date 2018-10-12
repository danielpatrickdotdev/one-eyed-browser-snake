import { createUI } from "./ui.js";
import { statusCodes } from "./statusCodes.js";
import { createSnake } from "./snake.js";
import { gameLoop } from "./gameLoop.js";


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
    const dirNum = [
      "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"
    ].indexOf(key);

    if (key !== -1) {
      if(snake.changeDirection(dirNum)) {
        ui.changeSnakeDirection(dirNum);
      }
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
    const toRemove = snake.move(extend);
    extend = false;
    if (checkForCollisions(snake.getPositions())) {
      gameloop.stop();
      ui.setGameOver();
    } else {
      if (positionsEqual(snake.getPositions()[0], target)) {
        extend = true;
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

  play();
}

export { game };
