import { Directions } from "../src/directions.js";

describe("Directions", function() {
  it("is a frozen object", function() {
    expect(Object.isFrozen(Directions)).toBe(true);
  });

  describe("get", function() {
    it("converts int to appropriate cartesian", function() {
      expect(Directions.get(0)).toEqual([0, -1]);
      expect(Directions.get(1)).toEqual([1, 0]);
      expect(Directions.get(2)).toEqual([0, 1]);
      expect(Directions.get(3)).toEqual([-1, 0]);
    });
  });

  describe("getDirNum", function() {
    it("converts cartesian to appropriate int", function() {
      expect(Directions.getDirNum([0, -1])).toBe(0);
      expect(Directions.getDirNum([1, 0])).toBe(1);
      expect(Directions.getDirNum([0, 1])).toBe(2);
      expect(Directions.getDirNum([-1, 0])).toBe(3);
    });

    it("converts direction object to appropriate int", function() {
      expect(Directions.getDirNum(Directions.UP)).toBe(0);
      expect(Directions.getDirNum(Directions.RIGHT)).toBe(1);
      expect(Directions.getDirNum(Directions.DOWN)).toBe(2);
      expect(Directions.getDirNum(Directions.LEFT)).toBe(3);
    });
  });

  describe("opposite", function() {
    it("returns int for opposite direction", function() {
      expect(Directions.opposite(0)).toBe(2);
      expect(Directions.opposite(1)).toBe(3);
      expect(Directions.opposite(2)).toBe(0);
      expect(Directions.opposite(3)).toBe(1);
    });
  });
});
