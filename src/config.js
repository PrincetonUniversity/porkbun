// configuration data for internal modules

// domain and port
const port = process.env.PORT || 3000;
const host = process.env.HOST || `http://localhost:${port}`;
module.exports.port = port;
module.exports.host = host;