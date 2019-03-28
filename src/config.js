// configuration data for internal modules

// domain and port
const port = process.env.PORT || 3000;
const host = `http://localhost:${port}`;
module.exports.port = port;
module.exports.host = host;

// we should add code for connecting to the database etc here