let db = require('./db')
let users = db.users;
if (!users) console.log('db_users.js: connection not made to database');

const dhalls = ['roma', 'wucox', 'whitman', 'forbes', 'cjl'];
const days   = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const meals  = ['breakfast', 'lunch', 'dinner'];

// Helper functions -----------------------------------------------------------

// Generate location preferences with given queries
let generatePrefs = (dhall, day, meal, prefs) => {
  if (day == 'all')
    days.forEach(d => generatePrefs(dhall, d, meal, prefs));
  else if (meal == 'all')
    meals.forEach(m => generatePrefs(dhall, day, m, prefs));
  else 
    prefs.push({
      dhall: dhall,
      day: day,
      meal: meal
    });
};

// Public methods -------------------------------------------------------------

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
  if (!dhalls.includes(dhall) || !meals.includes(meal) || !days.includes(day)) {
    if (meal != 'all' && day !='all') {
      console.log('db_users.js: tried to add invalid location preference.');
      return;
    }
  }

  let prefs = []; generatePrefs(dhall, day, meal, prefs);
  return new Promise((resolve, reject) => {
    users.updateOne({
      netid: netid
    }, {
      $addToSet: { "location_prefs": { $each:prefs }}
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

// Remove location preference from user database
const removeLocationPref = (netid, pref) => {
  return new Promise((resolve, reject) => {
    users.updateOne({
      netid: netid
    }, {
      $pull: { location_prefs: {
        dhall: pref.dhall,
        day: pref.day,
        meal: pref.meal
      } }
    }, async (err, res) => {
      if (err) return reject(err);
      return resolve('Success');
    });
  });
}

// Get the user's dish preferences as an array
const getDishPrefs = async (netid) => {
  const user = await users.findOne({ netid: netid });
  if (!user) return [];
  return user.dish_prefs || [];
}

// Get the user's location preferences as an array
const getLocationPrefs = async (netid) => {
  const user = await users.findOne({ netid: netid });
  if (!user) return [];
  return user.location_prefs || [];
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
module.exports.getDishPrefs = getDishPrefs;
module.exports.getLocationPrefs = getLocationPrefs;
module.exports.removeDishPref = removeDishPref;
module.exports.addLocationPref = addLocationPref;
module.exports.removeLocationPref = removeLocationPref;
module.exports.getLocationPref = addLocationPref;
module.exports.matchPrefs = matchPrefs;
