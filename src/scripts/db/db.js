// Load modules
const mongodb = require('mongodb');
const config  = require('../../config.js');

// Constants
const MongoClient = mongodb.MongoClient;

// Initialize connection to MongoDB database
async function init() {
  await new Promise((resolve, reject) => {
    MongoClient.connect(config.dbUri, { useNewUrlParser: true })
      .then(client => {
        let db = client.db(config.dbName);
        module.exports.dishes = db.collection('dishes');
        module.exports.users = db.collection('users');
        return resolve("Success");
      })
      .catch(err => {
        return reject(err);
      });
  });

  const db_users = require('./db_users');
  const db_dishes = require('./db_dishes');
  module.exports.updateDish = db_dishes.updateDish;
  module.exports.addDishPref = db_users.addDishPref;
  module.exports.getDishPref = db_users.getDishPref;
  module.exports.removeDishPref = db_users.removeDishPref;
  module.exports.addLocationPref = db_users.addLocationPref;
  module.exports.matchPrefs = db_users.matchPrefs;
}

init();