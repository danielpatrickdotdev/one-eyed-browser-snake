import { statusCodes } from "../src/statusCodes.js";

describe("statusCodes", function() {
  it("to be iterable", function() {
    expect(statusCodes).not.toBeNull();
    expect(typeof statusCodes[Symbol.iterator]).toBe("function");
  });

  it("to contain 63 items", function() {
    expect(statusCodes.length).toBe(62);
  });

  it("the first item to be an object representing status 100", function() {
    const firstItem = statusCodes[0];
    expect(firstItem).toHaveProperty("code", 100);
    expect(firstItem).toHaveProperty("message", "Continue");
  });

  it("the last item to be an object representing status 511", function() {
    const firstItem = statusCodes[61];
    expect(firstItem).toHaveProperty("code", 511);
    expect(firstItem).toHaveProperty(
      "message", "Network Authentication Required"
    );
  });
});
