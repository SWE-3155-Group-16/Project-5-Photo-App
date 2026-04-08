const { MongoClient } = require('mongodb');
const models = require('./modelData/photoApp.js').models;

async function loadDatabase() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('photoApp');

    // Drop existing collections to avoid duplicates
    await db.collection('users').drop().catch(() => {});
    await db.collection('photos').drop().catch(() => {});
    await db.collection('schema').drop().catch(() => {});

    // Load users
    const users = models.userListModel();
    await db.collection('users').insertMany(users);
    console.log('Users loaded');

    // Load photos for each user
    for (const user of users) {
      const photos = models.photoOfUserModel(user._id);
      if (photos.length > 0) {
        await db.collection('photos').insertMany(photos);
        console.log(`Photos for user ${user._id} loaded`);
      }
    }

    // Load schema info
    const schema = models.schemaModel();
    await db.collection('schema').insertOne(schema);
    console.log('Schema loaded');

  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

loadDatabase().catch(console.error);
