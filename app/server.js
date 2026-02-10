let express = require('express');
let path = require('path');
let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let app = express();

const MONGO_DB_USERNAME = process.env.MONGO_DB_USERNAME;
const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD;
const MONGO_DB_HOST = process.env.MONGO_DB_HOST;

const MONGO_URL = `mongodb://${MONGO_DB_USERNAME}:${MONGO_DB_PASSWORD}@${MONGO_DB_HOST}`;
const DATABASE_NAME = "user-account";
const COLLECTION_NAME = "users";

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

app.get('/get-profile', async function (req, res) {
  let response = {};
  let client;

  try {
    // Connect to the db using local application or docker compose variable in connection properties
    client = await MongoClient.connect(MONGO_URL);

    let db = client.db(DATABASE_NAME);
    let myquery = { userid: 1 };

    response = await db.collection(COLLECTION_NAME).findOne(myquery);

    res.send(response ? response : {});
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send({ error: 'Database error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.post('/update-profile', async function (req, res) {
  let userObj = req.body;
  let client;

  try {
    // Connect to the db using local application or docker compose variable in connection properties
    client = await MongoClient.connect(MONGO_URL);

    let db = client.db(DATABASE_NAME);
    userObj['userid'] = 1;

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    await db.collection(COLLECTION_NAME).updateOne(myquery, newvalues, {upsert: true});

    // Send response
    res.send(userObj);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send({ error: 'Database error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.listen(3000, function () {
  console.log("app listening on port 3000!");
});

