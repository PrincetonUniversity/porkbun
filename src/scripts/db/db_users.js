let db = require('./db')
let users = db.users;
if (!users) console.log('db_users.js: connection not made to database');

const dhalls = ['roma', 'wucox', 'whitman', 'forbes', 'cjl'];
const days   = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const meals  = ['breakfast', 'lunch', 'dinner'];

// Operatring on 'users' collection ------------------------------------------------

// Insert user 'netid' into the database, if it doesn't exist yet
const insertUser = netid => {
  return new Promise((resolve, reject) => {
    users.insertOne({
      netid: netid
    }, (err, res) => {
      if (err) return reject(err);
      if (res.insertedCount != 1) return reject('Error while inserting user');
      return resolve(res);
    });
  });
}
  
// Add 'dish' to the dish preferences of user 'netid'
const addDishPref = (netid, dish) => {
  return new Promise((resolve, reject) => {
    users.updateOne({
      netid: netid
    }, {
      $addToSet: { dish_prefs: dish }
    }, async (err, res) => {
      if (err) return reject(err);
      if (await users.countDocuments({netid: netid}) == 0) {
        await insertUser(netid);
        addDishPref(netid, dish);
      }
      return resolve('Success');
    });
  });
}

// Add preferred dining hall at preferred meal time 'meal' on preferred day
const addLocationPref = (netid, dhall, meal, day) => {
  if (!meal || !day) return; // for now

  if (!dhalls.includes(dhall) || !meals.includes(meal) || !days.includes(day)) {
    console.log(meal, day, dhall);
    console.log(meals, days, dhalls);
    console.log('db_users.js: tried to add invalid location preference.');
    return;
  }
  
  let key = `location_prefs.${day}.${meal}`;
  return new Promise((resolve, reject) => {
    users.updateOne({
      netid: netid
    }, {
      $addToSet: { [key]: dhall }
    }, async (err, res) => {
      if (err) return reject(err);
      if (await users.countDocuments({netid: netid}) == 0) {
        await insertUser(netid);
        addLocationPref(netid, dhall, meal, day);
      }
      return resolve('Success');
    });
  });
}

// Get the user's dish preferences as an array
const getDishPref = async (netid) => {
  const user = await users.findOne({ netid: netid });
  if (!user) return [];
  return user.dish_prefs;
}

// Remove 'dish' from user's dish preferences
const removeDishPref = (netid, dish) => {
  return new Promise((resolve, reject) => {
    users.updateOne({
      netid: netid
    }, {
      $pull: { dish_prefs: dish }
    }, async (err, res) => {
      if (err) return reject(err);
      return resolve('Success');
    });
  });
}

// See if given dish is in user's dish preferences
const matchPrefs = (prefs, menuItem) => {
  for (var i in prefs) {
    const rePref = new RegExp(prefs[i], 'i');
    if (menuItem.match(rePref))
      return true;
  }
  return false;
}

// Export functions
module.exports.addDishPref = addDishPref;
module.exports.getDishPref = getDishPref;
module.exports.removeDishPref = removeDishPref;
module.exports.addLocationPref = addLocationPref;
module.exports.matchPrefs = matchPrefs;