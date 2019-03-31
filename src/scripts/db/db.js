// Load node modules
const mongodb = require('mongodb');
const config  = require('../../config');

// Constants
const MongoClient = mongodb.MongoClient;

// Initialize connection to MongoDB database
const init = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(config.dbUri, { useNewUrlParser: true })
      .then(client => { return resolve(client.db(config.dbName)); })
      .catch(err =>   { return reject(err); });
  });
}

// Export modules
module.exports.init = init;
module.exports.updateDish = require('./db_dishes').updateDish;
module.exports.addDishPref = require('./db_users').addDishPref;