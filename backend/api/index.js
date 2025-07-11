const path = require("path");
const app = require(path.join(__dirname, "../src/server.js"));
console.log("[api/index.js] Loaded app");
module.exports = app;
