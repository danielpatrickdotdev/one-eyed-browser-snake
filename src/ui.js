import { statusCodes } from "./statusCodes.js";

/**
 * @typedef {object} ClickEvent
 */

/**
 * Construct UI controller
 * @param {Object} spec - The initial settings for the UI
 * @param {function(ClickEvent)} spec.pauseHandler - The event handler to be
 *                                                   called when the user
 *                                                   clicks on the game to
 *                                                   pause it.
 * @param {function(ClickEvent)} spec.newGameHandler - The event handler to be
 *                                                     called when the user
 *                                                     clicks a "new game" link.
 * @param {boolean} [spec.hardBorder=true] - Is border solid (true) or
 *                                           permeable?
 * @param {number} [spec.h=20] - Number of rows
 * @param {number} [spec.w=20] - Number of columns
 * @returns {Object} - Object with methods for controlling UI (eg. drawSnake)
 */
function createUI(spec) {
  const {pauseHandler, newGameHandler} = spec;
  let {hardBorder=true, h=20, w=20} = spec;

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
    if (hardBorder) {
      gameDiv.classList.remove("no-boundary");
    } else {
      gameDiv.classList.add("no-boundary");
    }
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
        let [col, row,] = remove;
        const elem = gameDiv.querySelector(`.snake.col-${col}.row-${row}`);
        gameDiv.removeChild(elem);

        [col, row,] = positions.slice(-1)[0];
        const newTailElem = gameDiv.querySelector(`.snake.col-${col}.row-${row}`);
        newTailElem.classList.add("snake-tail");
      }
    }
  }

  /**
   * Updates snake's head to new orientation
   *
   * @param {number} dirNum - Integer representing the snake head's new
   *                          orientation.
   */
  function changeSnakeDirection(dirNum) {
    const headElem = gameDiv.querySelector(".snake-head");
    headElem.classList.remove("dir-0", "dir-1", "dir-2", "dir-3");
    headElem.classList.add(`dir-${dirNum}`);
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

  return Object.freeze({
    reset: init,
    setGameOver,
    setPaused,
    unsetPaused,
    setBorder,
    drawSnake,
    updateSnake,
    changeSnakeDirection,
    drawTarget,
    removeTarget,
    drawScore
  });
}

export { createUI, statusCodes };
