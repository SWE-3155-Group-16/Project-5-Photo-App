'use strict';

/* jshint node: true */
function normalizeId(id) {
  if (id === null || id === undefined) {
    return '';
  }
  if (typeof id === 'object') {
    if (id._id !== undefined) {
      return String(id._id);
    }
    if (id.id !== undefined) {
      return String(id.id);
    }
  }
  return String(id);
}

var express = require('express');
const mongoose = require('mongoose');

const User = require('./schema/user.js');
const Photo = require('./schema/photo.js');
const SchemaInfo = require('./schema/schemaInfo.js');

mongoose.connect('mongodb://127.0.0.1/photoApp');

var portno = 3000;
var app = express();

app.use(express.static(__dirname));

app.get('/', function (request, response) {
  response.send('Simple web server of files from ' + __dirname);
});

app.get('/user/list', async function (request, response) {
  try {
    const users = await User.find({}).lean();

    const userList = users.map((user) => ({
      _id: String(user._id),
      first_name: user.first_name,
      last_name: user.last_name,
    }));

    response.status(200).json(userList);
  } catch (err) {
    response.status(500).send(`Error fetching user list: ${err}`);
  }
});

app.get('/test/:p1', async function (request, response) {
  var param = request.params.p1;
  console.log('/test called with param1 = ', param);

  try {
    if (param === 'info') {
      const info = await SchemaInfo.find({});
      if (info.length === 0) {
        return response.status(500).send('Missing SchemaInfo');
      }
      return response.status(200).send(info);
    }

    if (param === 'counts') {
      const counts = {
        user: await User.countDocuments({}),
        photo: await Photo.countDocuments({}),
        schemaInfo: await SchemaInfo.countDocuments({}),
      };
      return response.status(200).send(counts);
    }

    return response.status(400).send('Not found');
  } catch (err) {
    return response.status(500).send(`Database error: ${err}`);
  }
});

app.get('/user/:id', async function (request, response) {
  try {
    const users = await User.find({}).lean();
    const user = users.find((u) => String(u._id) === request.params.id);

    if (!user) {
      response.status(400).send('Invalid user id');
      return;
    }

    response.status(200).json({
      _id: String(user._id),
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    });
  } catch (err) {
    response.status(400).send('Invalid user id');
  }
});

app.get('/photosOfUser/:id', async function (request, response) {
  try {
    const requestedId = request.params.id;

    const users = await User.find({}).lean();
    const userMap = {};

    users.forEach((u) => {
      userMap[normalizeId(u._id)] = u;
    });

    if (!userMap[requestedId]) {
      response.status(400).send('Invalid user id');
      return;
    }

    const photos = await Photo.find({}).lean();
    const result = [];

    photos.forEach((photo) => {
      if (normalizeId(photo.user_id) !== requestedId) {
        return;
      }

      const photoObj = {
        _id: normalizeId(photo._id),
        user_id: normalizeId(photo.user_id),
        comments: [],
        file_name: photo.file_name,
        date_time: photo.date_time,
      };

      if (Array.isArray(photo.comments)) {
        photo.comments.forEach((comment) => {
          const commentUserId = normalizeId(comment.user_id || comment.user);
          let commentUser = userMap[commentUserId];

          if (!commentUser && comment.user && typeof comment.user === 'object') {
            commentUser = {
              _id: normalizeId(comment.user._id || comment.user),
              first_name: comment.user.first_name,
              last_name: comment.user.last_name,
            };
          }

          if (!commentUser) {
            return;
          }

          photoObj.comments.push({
            _id: normalizeId(comment._id),
            comment: comment.comment,
            date_time: comment.date_time,
            user: {
              _id: normalizeId(commentUser._id),
              first_name: commentUser.first_name,
              last_name: commentUser.last_name,
            },
          });
        });
      }

      result.push(photoObj);
    });

    response.status(200).json(result);
  } catch (err) {
    console.error('photosOfUser error:', err);
    response.status(500).send('Server error');
  }
});

var server = app.listen(portno, function () {
  var port = server.address().port;
  console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});