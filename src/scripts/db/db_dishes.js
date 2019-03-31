const database = require('./db')

var dishes;
database.init()
  .then(db =>   { dishes = db.collection('dishes'); })
  .catch(err => { console.log(err.message); });

// Operatring on 'dishes' collection ------------------------------------------------

// Insert one item into the dishes collection with parameters loc and meal
const insertDish = (item, loc, meal) => {
  return new Promise((resolve, reject) => {
    dishes.insertOne({
      name: item,
      count: 1,
      lastModified: new Date(),
      locations: [loc],
      meals: [meal]
    }, (err, res) => {
      if (err) return reject(err);
      if (res.insertedCount != 1) return reject(Error("Error while inserting into database"));
      return resolve(res);
    });
  });
}
  
// Increment the count of item and add loc and type to the appropriate arrays
const updateDish = (item, loc, meal) => {
  return new Promise((resolve, reject) => {
    const reDish = new RegExp('^' + item + '$', 'i');
  
    dishes.updateOne({
      name: reDish
    }, {
      $inc: { count: 1 }, 
      $set: { lastModified: new Date() },
      $addToSet: { locations: loc, meals: meal }
    }, async (err, res) => {
      if (err) return reject(err);
  
      // If no document is found for the item, set up and insert a document
      if (res.modifiedCount == 0)
        await insertDish(item, loc, meal)
          .catch(err => {
            return reject(err);
          });
      return resolve("Success");
    });
  });
}

module.exports.updateDish = updateDish;