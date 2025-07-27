const path = require('path');
const serverPath = path.join(process.cwd(), '../../backend/src/server.js');
const app = require(serverPath);

module.exports = app; 