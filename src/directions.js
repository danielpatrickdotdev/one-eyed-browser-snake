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
   * Returns the dirNum of the direction opposite the given dirNum
   * @param {dirNum} dirNum
   */
  function opposite(dirNum) {
    return (dirNum + 2) % 4;
  }

  /**
   * Calculates and returns new x and y coordinates one unit away from given
   * x and y in the direction of dirNum.
   * @param {number} x - starting horizontal coordinate
   * @param {number} y - starting vertical coordinate
   * @param {dirNum} dirNum - direction to move in
   */
  function translate(x, y, dirNum) {
    const [dx, dy] = get(dirNum);
    x += dx;
    y += dy;
    return [x, y];
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
    opposite,
    translate,
    getDirNum
  });
})();

export { Directions };
