// configuration data for internal modules

// domain and port
const port = process.env.PORT || 3000;
const host = process.env.HOST || `http://localhost:${port}`;
module.exports.port = port;
module.exports.host = host;

// mongoDB configs
const uri = "mongodb+srv://khatna:porkbun@porkbun-qae7b.mongodb.net/test?retryWrites=true"; // will need to hide this
const dbName = "porkbun";
module.exports.dbUri  = uri; 
module.exports.dbName = dbName; 