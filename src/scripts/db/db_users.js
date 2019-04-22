let db = require('./db')
let users = db.users;
if (!users) console.log('db_users.js: connection not made to database');

const dhalls = ['roma', 'wucox', 'whitman', 'forbes', 'cjl'];
const days   = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const meals  = ['breakfast', 'lunch', 'dinner'];

// Helper functions -----------------------------------------------------------
  
// Add 'dish' to the dish preferences of user 'netid'
const addDishPref = (netid, dish) => {
  return new Promise((resolve, reject) => {
    users.updateOne({
      netid: netid
    }, {
      $addToSet: { dish_prefs: dish }
    }, {
      // 'upsert' option inserts a document before updating, if no matching documents exist
      upsert: true
    }, (err, res) => {
      if (err) return reject(err);
      return resolve('Success');
    });
  });
}

// Add preferred dining hall at preferred meal time 'meal' on preferred day
const addLocationPref = (netid, dhall, meal, day) => {
  if (day == 'all')
    days.forEach(async d => { await addLocationPref(netid, dhall, meal, d); });
  else if (meal == 'all')
    meals.forEach(async m => { await addLocationPref(netid, dhall, m, day); });
  else {
    if (!dhalls.includes(dhall) || !meals.includes(meal) || !days.includes(day)) {
      console.log('db_users.js: tried to add invalid location preference.');
      return;
    }
  
    return new Promise((resolve, reject) => {
      users.updateOne({
        netid: netid
      }, {
        $addToSet: { [`location_prefs.${day}.${meal}`]: dhall }
      }, {
        upsert:true 
      }, (err, res) => {
        if (err) return reject(err);
        return resolve('Success');
      });
    });
  }
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
const removeLocationPref = (netid, dhall, meal, day) => {
  return new Promise((resolve, reject) => {
    users.updateOne({
      netid: netid
    }, {
      $pull: { [`location_prefs.${day}.${meal}`]: dhall }
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
  return user.location_prefs || {};
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
