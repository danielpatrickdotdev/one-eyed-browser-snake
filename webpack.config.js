const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/snake.js",
  output: {
    filename: "snake.bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
