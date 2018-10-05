import { Directions } from "./directions.js";

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
        let [col, row,] = remove;
        const elem = gameDiv.querySelector(`.snake.col-${col}.row-${row}`);
        gameDiv.removeChild(elem);

        [col, row,] = positions.slice(-1)[0];
        const [prevCol, prevRow,] = positions.slice(-2)[0];
        const dir = Directions.getDirNum([prevCol - col, prevRow - row]);
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

export { createUI, statusCodes };
