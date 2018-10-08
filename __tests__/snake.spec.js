import { createSnake } from "../src/snake.js";

describe("createSnake", function() {
  it("constructor uses default values d=0, c=9, r=9 & n=3", function() {
    const snake = createSnake();
    expect(snake.getPositions()).toEqual([[9, 9, 0], [9, 10, 0], [9, 11, 0]]);
  });

  it("constructor uses passed arguments for d, c, r & n", function() {
    const snake = createSnake({ d: 1, c: 3, r: 3, n: 2 });
    expect(snake.getPositions()).toEqual([[3, 3, 1], [2, 3, 1]]);
  });

  it("constructor uses default ncols value of 20", function() {
    const snake = createSnake({ c: 19, n: 1 });
    snake.changeDirection(1);
    snake.move();

    // Should wrap around to [0, 9]
    expect(snake.getPositions()).toEqual([[0, 9, 1]]);
  });

  it("constructor uses passed argument for ncols", function() {
    const snake = createSnake({ ncols: 10, n: 1 });
    snake.changeDirection(1);
    snake.move()

    // Should wrap around to [0, 9]
    expect(snake.getPositions()).toEqual([[0, 9, 1]]);
  });

  it("constructor uses default nrows value of 20", function() {
    const snake = createSnake({ r: 0, n: 1 });
    snake.move();

    // Should wrap around to [9, 19]
    expect(snake.getPositions()).toEqual([[9, 19, 0]]);
  });

  it("constructor uses passed argument for nrows", function() {
    const snake = createSnake({ r: 0, nrows: 10, n: 1 });
    snake.move();

    // Should wrap around to [9, 9]
    expect(snake.getPositions()).toEqual([[9, 9, 0]]);
  });

  it("constructor uses default hardBorder value of false", function() {
    const snake = createSnake({ r: 0, n: 1 }); // starting pos: [9, 0]
    snake.move();

    // hardBorder = false so should wrap around to [9, 19]
    expect(snake.getPositions()).toEqual([[9, 19, 0]]);
  });

  it("constructor uses passed argument for hardBorder", function() {
    const snake = createSnake({ r: 0, n: 1, hardBorder: true });
    // starting pos: [9, 0]
    snake.move();

    // hardBorder = true so should not wrap around
    expect(snake.getPositions()).toEqual([[9, -1, 0]]);
  });

  describe("reset", function() {
    it("resets length, starting position and direction of snake", function() {
      const snake = createSnake({ n: 1 });
      snake.move(true); // extend snake by 1
      snake.changeDirection(1);
      snake.move(true); // extend snake by 1

      snake.reset();
      expect(snake.getPositions()).toEqual([[9, 9, 0]]);
    });

    it("does not reset hardBorder", function() {
      const snake = createSnake({ n: 1, r: 0, hardBorder: false });
      snake.setBorder(true); // hard = true

      snake.reset(); // starting position = [9, 0]
      snake.move(); // move past border

      // hardBorder = true so should not wrap around to [9, 19]
      expect(snake.getPositions()).toEqual([[9, -1, 0]]);
    });
  });

  describe("getDirection", function() {
    it("returns last direction the snake moved in", function() {
      const snake = createSnake();
      snake.changeDirection(1);
      snake.move();

      expect(snake.getDirection()).toBe(1);

      snake.changeDirection(2);
      expect(snake.getDirection()).toBe(1);

      snake.move();
      expect(snake.getDirection()).toBe(2);
    });

    it("returns initial direction for snake that hasn't moved yet", function() {
      const snake = createSnake();
      expect(snake.getDirection()).toBe(0);
    });
  });

  describe("move", function() {
    it("changes positions of snake by one unit", function() {
      const snake = createSnake();
      snake.move();

      expect(snake.getPositions()).toEqual([[9, 8, 0], [9, 9, 0], [9, 10, 0]]);
    });

    it("if direction has changed, uses that direction", function() {
      const snake = createSnake();
      snake.changeDirection(1);
      snake.move();

      expect(snake.getPositions()).toEqual([[10, 9, 1], [9, 9, 0], [9, 10, 0]]);
    });

    it("updates direction if appropriate", function() {
      const snake = createSnake();
      snake.changeDirection(1);
      snake.move();

      expect(snake.getDirection()).toBe(1);
    });

    it("increases snake in length by one if passed extend=true", function() {
      const snake = createSnake();
      snake.move(true); // extend = true

      expect(snake.getPositions().length).toBe(4);
    });
  });

  describe("getPositions", function() {
    it("returns snake parts in expected format", function() {
      const snake = createSnake();
      expect(snake.getPositions()).toEqual([[9, 9, 0], [9, 10, 0], [9, 11, 0]]);
    });

    it("does not return reference to internal values", function() {
      const snake = createSnake();
      const snakePositions = snake.getPositions();
      snakePositions[0] = "OOPS";
      snakePositions[1][0] = "OH DEAR";

      expect(snakePositions).toEqual(["OOPS", ["OH DEAR", 10, 0], [9, 11, 0]]);
      expect(snake.getPositions()).toEqual([[9, 9, 0], [9, 10, 0], [9, 11, 0]]);
    });
  });

  describe("setBorder", function() {
    it("passing arg true makes snake unable to move through border", function() {
      const snake = createSnake({ n: 1, r: 0, hardBorder: false });
      snake.setBorder(true); // hard = true
      snake.move(); // move past border

      // hardBorder = true so should not wrap around to [9, 19]
      expect(snake.getPositions()).toEqual([[9, -1, 0]]);
    });

    it("passing arg false makes snake able to move through border", function() {
      const snake = createSnake({ n: 1, r: 0, hardBorder: true });
      snake.setBorder(false); // hard = true
      snake.move(); // move past border

      // hardBorder = false so should wrap around to [9, 19]
      expect(snake.getPositions()).toEqual([[9, 19, 0]]);
    });
  });
});
