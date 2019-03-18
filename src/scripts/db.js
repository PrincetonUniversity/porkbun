const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const uri = "mongodb+srv://khatna:porkbun@porkbun-qae7b.mongodb.net/test?retryWrites=true";
const dbName = "porkbun";
const client = new MongoClient(uri, { useNewUrlParser: true });

const testInsert = () => {
  client.connect(err => {
    assert.equal(null, err);
    console.log("Connected to database");

    const db = client.db(dbName);

    // testing insertion
    db.collection("dishes").insertOne({
      name: "Chicken Bruschetta",
      location: "01",
      type: "Lunch"
    }, (err, r) => {
      assert.equal(null, err);
      assert.equal(1, r.insertedCount);
      client.close();
    });
  });
}

module.exports.testInsert = testInsert; 