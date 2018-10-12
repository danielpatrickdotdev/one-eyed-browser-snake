import { createUI } from "../src/ui.js";

jest.useFakeTimers();

describe("createUI", function() {
  beforeEach(function() {
    document.body.innerHTML = `
      <div id="score"></div>
      <div id="status-message"></div>
      <div id="game"></div>`;
  });

  function dummyCallback() {}
  const pauseHandler = dummyCallback;
  const newGameHandler = dummyCallback;

  describe("constructor", function() {
    it("returns a frozen object", function() {
      const UI = createUI({pauseHandler, newGameHandler});
      expect(Object.isFrozen(UI)).toBe(true);
    });

    it("uses default values h=20, w=20", function() {
      const UI = createUI({pauseHandler, newGameHandler});
      const topBorder = document.querySelectorAll("#game div.top-border");
      const rightBorder = document.querySelectorAll("#game div.right-border");
      const bottomBorder = document.querySelectorAll("#game div.bottom-border");
      const leftBorder = document.querySelectorAll("#game div.left-border");

      // NodeList.length should equal 22 (20 + one extra either end)
      expect(topBorder.length).toBe(22);
      expect(rightBorder.length).toBe(22);
      expect(bottomBorder.length).toBe(22);
      expect(leftBorder.length).toBe(22);
    });

    it("uses passed h & w", function() {
      const UI = createUI({pauseHandler, newGameHandler, h: 10, w: 10});
      const topBorder = document.querySelectorAll("#game .top-border");
      const rightBorder = document.querySelectorAll("#game .right-border");
      const bottomBorder = document.querySelectorAll("#game .bottom-border");
      const leftBorder = document.querySelectorAll("#game .left-border");

      // NodeList.length should equal 12 (10 + one extra either end)
      expect(topBorder.length).toBe(12);
      expect(rightBorder.length).toBe(12);
      expect(bottomBorder.length).toBe(12);
      expect(leftBorder.length).toBe(12);
    });

    it("uses default hardBorder = true", function() {
      const UI = createUI({pauseHandler, newGameHandler, h: 1, w: 1});
      const gameDiv = document.getElementById("game");
      expect(gameDiv.classList.contains("no-boundary")).toBe(false);
    });

    it("uses passed hardBorder: true", function() {
      const UI = createUI({
        hardBorder: true, pauseHandler, newGameHandler, h: 1, w: 1
      });
      const gameDiv = document.getElementById("game");
      expect(gameDiv.classList.contains("no-boundary")).toBe(false);
    });

    it("uses passed hardBorder: false", function() {
      const UI = createUI({
        hardBorder: false, pauseHandler, newGameHandler, h: 1, w: 1
      });
      const gameDiv = document.getElementById("game");
      expect(gameDiv.classList.contains("no-boundary")).toBe(true);
    });

    it("uses passed pauseHandler", function() {
      const handler = jest.fn();
      const UI = createUI({pauseHandler: handler, newGameHandler});
      const gameDiv = document.getElementById("game");
      expect(handler).not.toHaveBeenCalled();

      gameDiv.click();
      expect(handler).toHaveBeenCalled();
    });

    it("uses passed newGameHandler", function() {
      const handler = jest.fn();
      const UI = createUI({pauseHandler, newGameHandler: handler});
      UI.setGameOver();
      jest.runAllTimers(); // advance setTimeout to finish instantly
      const newGameLink = document.querySelector(".new-game-link");

      expect(handler).not.toHaveBeenCalled();
      newGameLink.click();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("reset", function() {
    it("tells game to listen to pause event", function() {
      const handler = jest.fn();
      const UI = createUI({pauseHandler: handler, newGameHandler});
      UI.setGameOver(); // should remove pause listener

      const gameDiv = document.getElementById("game");
      gameDiv.click();
      UI.reset();
      expect(handler).not.toHaveBeenCalled();

      gameDiv.click();
      expect(handler).toHaveBeenCalled();
    });

    it("removes game-over class from gameDiv", function() {
      const UI = createUI({pauseHandler, newGameHandler});
      UI.setGameOver(); // should add game-over class to gameDiv
      const gameDiv = document.getElementById("game");

      expect(gameDiv.classList.contains("game-over")).toBe(true);
      UI.reset();
      expect(gameDiv.classList.contains("game-over")).toBe(false);
    });

    it("resets gameDiv innerHTML", function() {
      const UI = createUI({pauseHandler, newGameHandler});
      const gameDiv = document.getElementById("game");
      const gameDivInnerHTML = gameDiv.innerHTML;

      UI.drawSnake([[9, 9, 0], [9, 10, 0], [9, 11, 0]]);

      expect(gameDiv.innerHTML).not.toBe(gameDivInnerHTML);
      UI.reset();
      // A very rough way to test what we want to test. Could easily fail due
      // to elements being in a different order
      expect(gameDiv.innerHTML).toBe(gameDivInnerHTML);
    });

    it("updates border to hard/soft style if changed before reset", function() {
      const UI = createUI({pauseHandler, newGameHandler});
      const gameDiv = document.getElementById("game");
      // Constructor uses default of true = no-boundary
      expect(gameDiv.classList.contains("no-boundary")).toBe(false);

      UI.setBorder(false);
      // Unchanged because we haven't started a new game yet (reset)
      expect(gameDiv.classList.contains("no-boundary")).toBe(false);

      UI.reset();
      // We started a new game, so border should change now
      expect(gameDiv.classList.contains("no-boundary")).toBe(true);

      UI.setBorder(true);
      // Unchanged because we haven't started a new game yet (reset)
      expect(gameDiv.classList.contains("no-boundary")).toBe(true);

      UI.reset();
      // We started a new game, so border should change now
      expect(gameDiv.classList.contains("no-boundary")).toBe(false);
    });
  });

  describe("setGameOver", function() {
    describe("setGameOver without callbacks", function() {
      beforeEach(function() {
        const UI = createUI({pauseHandler, newGameHandler});
        UI.setGameOver();
      });

      it("adds game-over class to gameDiv", function() {
        const gameDiv = document.getElementById("game");
        expect(gameDiv.classList.contains("game-over")).toBe(true);
      });

      it("creates game over overlay", function() {
        const overlay = document.querySelector("#game .overlay");
        const border = overlay.querySelectorAll("#game .overlay .border");
        const overlayText = overlay.querySelector(".overlay-text");

        expect(overlay.id).toBe("game-over-overlay"); 
        // 4 x 8 (4 x 2 + 8 x 2 + 4 corners)
        expect(border.length).toBe(28);
        expect(overlayText.outerHTML).toBe(
          "<div class=\"overlay-text\"><span>GAME OVER</span></div>"
        );
      });

      it("waits one second before displaying new game link", function() {
        let newGameLink = document.querySelector(".new-game-link");

        expect(newGameLink).toBeNull();

        jest.runTimersToTime(999);
        expect(newGameLink).toBeNull();

        jest.runTimersToTime(1);
        newGameLink = document.querySelector(".new-game-link");

        expect(newGameLink.outerHTML).toBe(
          "<div class=\"overlay-text new-game-link\"><span>NEW GAME?</span></div>"
        );
      });
    });

    it("makes new game link listen for newGameHandler", function() {
      const handler = jest.fn();
      const UI = createUI({pauseHandler, newGameHandler: handler});
      UI.setGameOver();

      jest.runTimersToTime(1000);
      const newGameLink = document.querySelector(".new-game-link");

      expect(handler).not.toHaveBeenCalled();
      newGameLink.click();
      expect(handler).toHaveBeenCalled();
    });

    it("stops game listening for pause event", function() {
      const gameDiv = document.getElementById("game");
      const handler = jest.fn();
      const UI = createUI({pauseHandler: handler, newGameHandler});
      gameDiv.click();
      // Works as expected before setGameOver()
      expect(handler).toHaveBeenCalled();

      handler.mockReset();
      UI.setGameOver();
      gameDiv.click();
      // Now the handler isn't called
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("setPaused", function() {
    beforeEach(function() {
      const UI = createUI({pauseHandler, newGameHandler});
      UI.setPaused();
    });

    it("adds paused class to gameDiv", function() {
      const gameDiv = document.getElementById("game");
      expect(gameDiv.classList.contains("paused")).toBe(true);
    });

    it("creates paused overlay", function() {
      const overlay = document.querySelector("#game .overlay");
      const border = overlay.querySelectorAll("#game .overlay .border");
      const overlayText = overlay.querySelector(".overlay-text");

      expect(overlay.id).toBe("paused-overlay"); 
      // 4 x 8 (4 x 2 + 8 x 2 + 4 corners)
      expect(border.length).toBe(28);
      expect(overlayText.outerHTML).toBe(
        "<div class=\"overlay-text\"><span>PAUSED</span></div>"
      );
    });
  });

  describe("unsetPaused", function() {
    beforeEach(function() {
      const UI = createUI({pauseHandler, newGameHandler});
      UI.setPaused();
      UI.unsetPaused();
    });

    it("removes paused class from gameDiv", function() {
      const gameDiv = document.getElementById("game");
      expect(gameDiv.classList.contains("paused")).toBe(false);
    });

    it("removes paused overlay", function() {
      const overlay = document.querySelector("#game .overlay");
      expect(overlay).toBeNull();
    });
  });

  describe("setBorder", function() {
    it("setBorder(false) changes border after reset", function() {
      const gameDiv = document.getElementById("game");
      const UI = createUI({hardBorder: true, pauseHandler, newGameHandler});
      expect(gameDiv.classList.contains("no-boundary")).toBe(false);

      UI.setBorder(false);
      expect(gameDiv.classList.contains("no-boundary")).toBe(false);

      UI.reset();
      expect(gameDiv.classList.contains("no-boundary")).toBe(true);
    });

    it("setBorder(true) removes no-boundary class from gameDiv", function() {
      const gameDiv = document.getElementById("game");
      const UI = createUI({hardBorder: false, pauseHandler, newGameHandler});
      expect(gameDiv.classList.contains("no-boundary")).toBe(true);

      UI.setBorder(true);
      expect(gameDiv.classList.contains("no-boundary")).toBe(true);

      UI.reset();
      expect(gameDiv.classList.contains("no-boundary")).toBe(false);
    });
  });

  describe("drawSnake", function() {
    it("draws snake array with expected html classes", function() {
      const snakeParts = [[8, 10, 1], [8, 9, 2], [9, 9, 3]];
      const UI = createUI({pauseHandler, newGameHandler});
      UI.drawSnake(snakeParts);

      const snakeElems = document.querySelectorAll("#game div.snake");
      expect(snakeElems.length).toBe(3);

      const snakeHead = document.querySelector(
        "#game div.snake.snake-head.col-8.row-10.dir-1:not(.snake-tail)"
      );
      expect(snakeHead.classList.length).toBe(5);

      const snakeMiddle = document.querySelector(
        "#game div.snake.col-8.row-9.dir-2:not(.snake-head):not(.snake-tail)"
      );
      expect(snakeMiddle.classList.length).toBe(4);

      const snakeTail = document.querySelector(
        "#game div.snake.snake-tail.col-9.row-9.dir-3:not(.snake-head)"
      );
      expect(snakeTail.classList.length).toBe(5);
    });
  });

  describe("updateSnake", function() {
    it("redraws snake array with expected html classes", function() {
      let snakeParts = [[8, 10, 1], [8, 9, 2], [9, 9, 3]];
      const UI = createUI({pauseHandler, newGameHandler});
      UI.drawSnake(snakeParts);

      const firstSnakeHead = document.querySelector("#game div.snake");
      expect(firstSnakeHead.classList.contains("col-8")).toBe(true);
      expect(firstSnakeHead.classList.contains("row-10")).toBe(true);

      const toRemove = snakeParts[2];
      snakeParts = [[9, 10, 0], [8, 10, 1], [8, 9, 2]];
      UI.updateSnake(snakeParts, toRemove);

      const snakeElems = document.querySelectorAll("#game div.snake");
      expect(snakeElems.length).toBe(3);

      const snakeHead = document.querySelector(
        "#game div.snake.snake-head.col-9.row-10.dir-0:not(.snake-tail)"
      );
      expect(snakeHead.classList.length).toBe(5);

      const snakeMiddle = document.querySelector(
        "#game div.snake.col-8.row-10.dir-1:not(.snake-head):not(.snake-tail)"
      );
      expect(snakeMiddle.classList.length).toBe(4);

      const snakeTail = document.querySelector(
        "#game div.snake.snake-tail.col-8.row-9.dir-2:not(.snake-head)"
      );
      expect(snakeTail.classList.length).toBe(5);
    });

    describe("testing growing snake", function() {
      it("snake grows if no removed passed", function() {
        const snakeParts = [[8, 9, 2], [9, 9, 3]];
        const UI = createUI({pauseHandler, newGameHandler});
        UI.drawSnake(snakeParts);

        const firstSnake = document.querySelectorAll("#game div.snake");
        expect(firstSnake.length).toBe(2);

        snakeParts.unshift([8, 10, 1]);
        UI.updateSnake(snakeParts);

        const snake = document.querySelectorAll("#game div.snake");
        expect(snake.length).toBe(3);
      });

      beforeEach(function() {
        const snakeParts = [[8, 9, 2], [9, 9, 3]];
        const UI = createUI({pauseHandler, newGameHandler});
        UI.drawSnake(snakeParts);

        snakeParts.unshift([8, 10, 1]);
        UI.updateSnake(snakeParts);
      });

      it("growing snake has expected new head", function() {
        const snake = document.querySelectorAll("#game div.snake");
        expect(snake.length).toBe(3);

        const snakeHead = document.querySelector("#game div.snake-head");
        expect(snakeHead.classList.contains("snake-tail")).toBe(false);
        expect(snakeHead.classList.contains("col-8")).toBe(true);
        expect(snakeHead.classList.contains("row-10")).toBe(true);
        expect(snakeHead.classList.contains("dir-1")).toBe(true);
        expect(snakeHead.classList.length).toBe(5); // including .snake
      });

      it("growing snake doesn't leave two head or tail elements", function() {
        const snakeHeads = document.querySelectorAll("#game div.snake-head");
        expect(snakeHeads.length).toBe(1);

        const snakeTails = document.querySelectorAll("#game div.snake-tail");
        expect(snakeTails.length).toBe(1);

        const snakeMiddles = document.querySelectorAll(
          "#game div.snake:not(.snake-head):not(.snake-tail)"
        );
        expect(snakeMiddles.length).toBe(1);
      });
    });
  });

  describe("changeSnakeDirection", function() {
    it("updates snake head dir-N class", function() {
      const snakeParts = [[9, 8, 0], [9, 9, 0]];
      const UI = createUI({pauseHandler, newGameHandler});
      UI.drawSnake(snakeParts);
      UI.changeSnakeDirection(1);

      const snakeHead = document.querySelector("#game div.snake-head");
      expect(snakeHead.classList.contains("dir-1")).toBe(true);

      const snakeTail = document.querySelector("#game div.snake-tail");
      expect(snakeTail.classList.contains("dir-0")).toBe(true);
    });
  });

  describe("drawTarget", function() {
    it("adds target div at position specified", function() {
      const UI = createUI({pauseHandler, newGameHandler});
      UI.drawTarget([1, 2]);
      const target = document.querySelector("#game .target");

      expect(target.classList.contains("col-1")).toBe(true);
      expect(target.classList.contains("row-2")).toBe(true);
    });
  });

  describe("removeTarget", function() {
    it("adds target div at position specified", function() {
      const UI = createUI({pauseHandler, newGameHandler});
      UI.drawTarget([1, 2]);
      UI.removeTarget();

      expect(document.querySelector("#game .target")).toBeNull();
    });
  });

  describe("drawScore", function() {
    it("adds target div at position specified", function() {
      const scoreDiv = document.getElementById("score");
      const msgDiv = document.getElementById("status-message");
      const UI = createUI({pauseHandler, newGameHandler});

      UI.drawScore(62);
      expect(scoreDiv.innerHTML).toBe("100");
      expect(msgDiv.innerHTML).toBe("Continue");

      UI.drawScore(41);
      expect(scoreDiv.innerHTML).toBe("418");
      expect(msgDiv.innerHTML).toBe("I'm a teapot");
    });
  });
});
