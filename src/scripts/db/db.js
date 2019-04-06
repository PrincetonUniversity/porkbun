// Load modules
const mongodb = require('mongodb');
const config  = require('../../config.js');

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

const users = require('./db_users');
const dishes = require('./db_dishes');
module.exports.updateDish = dishes.updateDish;
module.exports.addDishPref = users.addDishPref;
module.exports.addLocationPref = users.addLocationPref;