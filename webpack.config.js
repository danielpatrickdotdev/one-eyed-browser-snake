const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "snake.bundle.js",
    path: path.resolve(__dirname, "dist"),
    library: 'snake'
  }
};
