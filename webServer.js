'use strict';

/*
 * Simple Node.js web server for the Photo App backend using MongoDB + Mongoose.
 * Start with:
 *    node webServer.js
 */

/* jshint node: true */

const express = require('express');
const mongoose = require('mongoose');

const User = require('./schema/user.js');
const Photo = require('./schema/photo.js');
const SchemaInfo = require('./schema/schemaInfo.js');

const portno = 3000;
const app = express();

// Serve static files from current directory.
app.use(express.static(__dirname));

app.get('/', function (request, response) {
  response.send('Simple web server of files from ' + __dirname);
});

/*
 * URL /test/:p1
 *  - /test/info   → return SchemaInfo from DB
 *  - /test/counts → return counts of User, Photo, SchemaInfo
 */
app.get('/test/:p1', async (request, response) => {
  const param = request.params.p1;
  console.log('/test called with param1 = ', param);

  try {
    if (param === 'info') {
      const info = await SchemaInfo.find({});
      if (!info || info.length === 0) {
        return response.status(500).send('Missing SchemaInfo');
      }
      return response.status(200).send(info[0]);
    }

    if (param === 'counts') {
      const userCount = await User.countDocuments({});
      const photoCount = await Photo.countDocuments({});
      const schemaInfoCount = await SchemaInfo.countDocuments({});

      return response.status(200).send({
        user: userCount,
        photo: photoCount,
        schemaInfo: schemaInfoCount
      });
    }

    console.error('Nothing to be done for param: ', param);
    return response.status(400).send('Not found');
  } catch (err) {
    console.error('Error in /test/:p1', err);
    return response.status(500).send({ error: 'Internal error' });
  }
});

/*
 * Optional explicit endpoints if your tests call /test/info and /test/counts directly.
 */
app.get('/test/info', async (req, res) => {
  try {
    const info = await SchemaInfo.find({});
    if (!info || info.length === 0) {
      return res.status(500).send('Missing SchemaInfo');
    }
    res.status(200).send(info[0]);
  } catch (err) {
    console.error('Error fetching schema info', err);
    res.status(500).send({ error: 'Error fetching schema info' });
  }
});

app.get('/test/counts', async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    const photoCount = await Photo.countDocuments({});
    const schemaInfoCount = await SchemaInfo.countDocuments({});

    res.status(200).send({
      user: userCount,
      photo: photoCount,
      schemaInfo: schemaInfoCount
    });
  } catch (err) {
    console.error('Error fetching counts', err);
    res.status(500).send({ error: 'Error fetching counts' });
  }
});

/*
 * URL /user/list - Return all users with only _id, first_name, last_name.
 */
app.get('/user/list', async (req, res) => {
  try {
    const users = await User.find({}, '_id first_name last_name');
    res.status(200).send(users);
  } catch (err) {
    console.error('Error fetching user list', err);
    res.status(500).send({ error: 'Error fetching user list' });
  }
});

/*
 * URL /user/:id - Return user details:
 *   _id, first_name, last_name, location, description, occupation
 * Return 400 for invalid IDs or missing user.
 */
app.get('/user/:id', async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(
      id,
      '_id first_name last_name location description occupation'
    );

    if (!user) {
      return res.status(400).send({ error: 'User not found' });
    }

    res.status(200).send(user);
  } catch (err) {
    console.error('Error fetching user', err);
    res.status(500).send({ error: 'Error fetching user' });
  }
});

/*
 * URL /photosOfUser/:id - Return photos for user (id).
 * Each photo:
 *   _id, user_id, comments, file_name, date_time
 * Each comment must include:
 *   comment, date_time, user: { _id, first_name, last_name }
 * Return 400 for invalid IDs.
 */
app.get('/photosOfUser/:id', async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid user ID' });
  }

  try {
    const photos = await Photo.find({ user_id: id });

    const result = [];

    for (const photo of photos) {
      // Clone Mongoose document to plain object
      const cleanPhoto = JSON.parse(JSON.stringify(photo));

      // Populate each comment's user field
      for (const comment of cleanPhoto.comments) {
        const user = await User.findById(
          comment.user_id,
          '_id first_name last_name'
        );
        comment.user = user;
      }

      result.push(cleanPhoto);
    }

    res.status(200).send(result);
  } catch (err) {
    console.error('Error fetching photos', err);
    res.status(500).send({ error: 'Error fetching photos' });
  }
});

/*
 * Start server after connecting to MongoDB.
 */
mongoose
  .connect('mongodb://127.0.0.1:27017/cs142project6', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    const server = app.listen(portno, function () {
      const port = server.address().port;
      console.log(
        'Listening at http://localhost:' +
          port +
          ' exporting the directory ' +
          __dirname
      );
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });