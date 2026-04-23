'use strict';

/*
 * Simple Node.js web server for the Photo App backend using MongoDB + Mongoose.
 * Start with:
 *    node webServer.js
 */

/* jshint node: true */

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');

const User = require("./models/User.js");
const Photo = require("./models/photo.js");
const SchemaInfo = require("./models/schemaInfo.js");

const portno = 3000;
const app = express();

app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false
  })
);
app.use(bodyParser.json());

// Serve static files from current directory.
app.use(express.static(__dirname));

app.get('/', function (request, response) {
  response.send('Simple web server of files from ' + __dirname);
});

/*
 * POST /admin/login
 * Log in a user with login_name and password.
 */
app.post('/admin/login', async (request, response) => {
  try {
    const { login_name, password } = request.body;

    if (
      !login_name ||
      typeof login_name !== 'string' ||
      login_name.trim() === '' ||
      !password ||
      typeof password !== 'string' ||
      password.trim() === ''
    ) {
      return response.status(400).send('login_name and password are required');
    }

    const user = await User.findOne({
      login_name: login_name.trim(),
      password: password.trim()
    });

    if (!user) {
      return response.status(400).send('Invalid login name or password');
    }

    request.session.user_id = user._id;
    request.session.login_name = user.login_name;

    return response.status(200).send({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    });
  } catch (err) {
    console.error('Error logging in', err);
    return response.status(400).send('Error logging in');
  }
});

/*
 * POST /admin/logout
 * Log out current user.
 */
app.post('/admin/logout', (request, response) => {
  if (!request.session.user_id) {
    return response.status(400).send('No user is currently logged in');
  }

  request.session.destroy((err) => {
    if (err) {
      console.error('Error logging out', err);
      return response.status(400).send('Error logging out');
    }
    return response.status(200).send({});
  });
});

/*
 * POST /user
 * Register a new user.
 */
app.post('/user', async (request, response) => {
  try {
    const {
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation
    } = request.body;

    if (
      !login_name ||
      typeof login_name !== 'string' ||
      login_name.trim() === ''
    ) {
      return response.status(400).send('login_name is required');
    }

    if (
      !password ||
      typeof password !== 'string' ||
      password.trim() === ''
    ) {
      return response.status(400).send('password is required');
    }

    if (
      !first_name ||
      typeof first_name !== 'string' ||
      first_name.trim() === ''
    ) {
      return response.status(400).send('first_name is required');
    }

    if (
      !last_name ||
      typeof last_name !== 'string' ||
      last_name.trim() === ''
    ) {
      return response.status(400).send('last_name is required');
    }

    const existingUser = await User.findOne({ login_name: login_name.trim() });

    if (existingUser) {
      return response.status(400).send('login_name already exists');
    }

    const newUser = await User.create({
      login_name: login_name.trim(),
      password: password.trim(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      location: location ? location.trim() : '',
      description: description ? description.trim() : '',
      occupation: occupation ? occupation.trim() : ''
    });

    return response.status(200).send({
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      location: newUser.location,
      description: newUser.description,
      occupation: newUser.occupation,
      login_name: newUser.login_name
    });
  } catch (err) {
    console.error('Error registering user', err);
    return response.status(400).send('Error registering user');
  }
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
 * Requires login.
 */
app.get('/user/list', async (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const users = await User.find({}, '_id first_name last_name');
    return res.status(200).send(users);
  } catch (err) {
    console.error('Error fetching user list', err);
    return res.status(500).send({ error: 'Error fetching user list' });
  }
});

/*
 * URL /user/:id - Return user details:
 *   _id, first_name, last_name, location, description, occupation
 * Return 400 for invalid IDs or missing user.
 * Requires login.
 */
app.get('/user/:id', async (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send('Unauthorized');
  }

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

    return res.status(200).send(user);
  } catch (err) {
    console.error('Error fetching user', err);
    return res.status(500).send({ error: 'Error fetching user' });
  }
});

/*
 * URL /photosOfUser/:id - Return photos for user (id).
 * Each photo:
 *   _id, user_id, comments, file_name, date_time
 * Each comment must include:
 *   comment, date_time, user: { _id, first_name, last_name }
 * Return 400 for invalid IDs.
 * Requires login.
 */
app.get('/photosOfUser/:id', async (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send('Unauthorized');
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid user ID' });
  }

  try {
    const photos = await Photo.find({ user_id: id });

    const result = [];

    for (const photo of photos) {
      const cleanPhoto = JSON.parse(JSON.stringify(photo));

      for (const comment of cleanPhoto.comments) {
        const user = await User.findById(
          comment.user_id,
          '_id first_name last_name'
        );
        comment.user = user;
      }

      result.push(cleanPhoto);
    }

    return res.status(200).send(result);
  } catch (err) {
    console.error('Error fetching photos', err);
    return res.status(500).send({ error: 'Error fetching photos' });
  }
});

/*
 * Start server after connecting to MongoDB.
 */
mongoose
  .connect('mongodb://127.0.0.1:27017/project6')

  
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