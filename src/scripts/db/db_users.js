let database = require('./db')

var users;
database.init()
  .then(db =>   { users = db.collection('users'); })
  .catch(err => { console.log(err.message); });

// Operatring on 'users' collection ------------------------------------------------

// Insert user 'netid' into the database, if it doesn't exist yet
const insertUser = netid => {
  let emptyMealPref = {
    breakfast: [/* e.g. "roma" */],
    lunch:     [],
    dinner:    []
  }
  
  let emptyLocPrefs = {
    sunday:    emptyMealPref,
    monday:    emptyMealPref,
    tuesday:   emptyMealPref,
    wednesday: emptyMealPref,
    thursday:  emptyMealPref,
    friday:    emptyMealPref,
    saturday:  emptyMealPref,
  }
  
  return new Promise((resolve, reject) => {
    users.insertOne({
      netid: netid,
      location_prefs: emptyLocPrefs,
      dish_prefs: []
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
        let count = await users.countDocuments({netid: netid});
        if (count != 0) return resolve('Already in preferences');
        if (err) return reject(err);
        if (res.modifiedCount == 0)
          await insertUser(netid)
            .then(() =>   { addDishPref(netid, dish); })
            .catch(err => { return reject(err);       });
        return resolve("Success");
      });
    });
  }

module.exports.addDishPref = addDishPref;