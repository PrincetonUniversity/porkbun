// Load node modules
const mongodb = require('mongodb');
const assert = require('assert');

// Constants
const MongoClient = mongodb.MongoClient;
const uri = "mongodb+srv://khatna:porkbun@porkbun-qae7b.mongodb.net/test?retryWrites=true";
const dbName = "porkbun";
//const client = new MongoClient(uri, { useNewUrlParser: true });
var db;

// Initialize connection to MongoDB database
const init = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(uri, { useNewUrlParser: true })
      .then(client => {
        db = client.db(dbName);
        return resolve("Success");
      })
      .catch(err => {
        return reject(err);
      });
  });
}

// Insert one item into the dishes collection with parameters loc and meal
const insertDish = (item, loc, meal) => {
  const date = new Date();
  const locArr = [loc];
  const mealArr = [meal];

  const dishes = db.collection('dishes');
  dishes.insertOne({
    name: item,
    count: 1,
    lastModified: date,
    locations: locArr,
    meals: mealArr
  }, (err, res) => {
    assert((err == null), Error("Failed to insert into database"));
    assert((res.insertedCount == 1), Error("Error while inserting into database"));
  });
}

// Increment the count of items and add loc and type to the appropriate arrays
// If no document is found, set up and insert a document
const updateDishes = (items, loc, meal) => {
  const dishes = db.collection('dishes');
  const date = new Date();

  for (item of items) {
    const reDish = new RegExp('^' + item + '$', 'i');

    dishes.updateOne({ 
      name: reDish
    }, { 
      $inc: { count: 1 }, 
      $set: { lastModified: date },
      $addToSet: { locations: loc, meals: meal }
    }, (err, res) => {
      assert((err == null), Error("Failed to update database"));
      if (res.modifiedCount == 0)
        insertDish(item, loc, meal);
    });
  }
}

const updateDish = (item, loc, meal) => {
  const dishes = db.collection('dishes');
  const date = new Date();
  const reDish = new RegExp('^' + item + '$', 'i');

  dishes.updateOne({
    name: reDish
  }, {
    $inc: { count: 1 }, 
    $set: { lastModified: date },
    $addToSet: { locations: loc, meals: meal }
  }, (err, res) => {
    assert((err == null), Error("Failed to update database"));
    if (res.modifiedCount == 0)
      insertDish(item, loc, meal);
  });
}

// Test method to test updating one item to the test collection
const testUpdate = (item, loc, meal) => {
  const dishes = db.collection('test');
  const date = new Date();
  const reDish = new RegExp('^' + item + '$', 'i');

  dishes.updateOne({
    name: reDish
  }, {
    $inc: { count: 1 }, 
    $set: { lastModified: date },
    $addToSet: { locations: loc, meals: meal }
  }, (err, res) => {
    assert((err == null), Error("Failed to update database"));
    console.log(res);
    if (res.modifiedCount == 0)
      testInsert(item, loc, meal);
  });
}

const testInsert = (item, loc, meal) => {
  const date = new Date();
  const locArr = [loc];
  const mealArr = [meal];

  const dishes = db.collection('test');
  dishes.insertOne({
    name: item,
    count: 1,
    lastModified: date,
    locations: locArr,
    meals: mealArr
  }, (err, res) => {
    assert((err == null), Error("Failed to insert into database"));
    assert((res.insertedCount == 1), Error("Error while inserting into database"));
  });
}

// Export modules
module.exports.init = init;
module.exports.updateDishes = updateDishes;
module.exports.updateDish = updateDish;
module.exports.testUpdate = testUpdate;