import { Directions } from "../src/directions.js";

describe("Directions", function() {
  describe("get", function() {
    it("converts int to appropriate cartesian", function() {
      expect(Directions.get(0)).toEqual([0, -1]);
      expect(Directions.get(1)).toEqual([1, 0]);
      expect(Directions.get(2)).toEqual([0, 1]);
      expect(Directions.get(3)).toEqual([-1, 0]);
    });
  });
});
