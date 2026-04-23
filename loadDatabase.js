/**
 * This Node.js program loads the Project 7 model data into Mongoose
 * defined objects in a MongoDB database. It can be run with the command:
 *     node loadDatabase.js
 * Be sure to have an instance of the MongoDB running on the localhost.
 *
 * This script loads the data into the MongoDB database named 'project6'.
 * In loads into collections named User and Photos. The Comments are added in
 * the Photos of the comments. Any previous objects in those collections are
 * discarded.
 */

// We use the Mongoose to define the schema stored in MongoDB.
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/project6");

// Get the magic models we used in the previous projects.
const models = require("./modelData/photoApp.js").models;

// Load the Mongoose schema for Use and Photo
const User = require("./models/User.js");
const Photo = require("./models/photo.js");
const SchemaInfo = require("./models/schemaInfo.js");

const versionString = "1.0";

// We start by removing anything that existing in the collections.
const removePromises = [
  User.deleteMany({}),
  Photo.deleteMany({}),
  SchemaInfo.deleteMany({}),
];

Promise.all(removePromises)
  .then(function () {
    const userModels = models.userListModel();
    const mapFakeId2RealId = {};

    const userPromises = userModels.map(function (user) {
      return User.create({
        first_name: user.first_name,
        last_name: user.last_name,
        location: user.location,
        description: user.description,
        occupation: user.occupation,
        login_name: user.last_name.toLowerCase(),
        password: "weak",
      })
        .then(function (userObj) {
          mapFakeId2RealId[user._id] = userObj._id;
          user.objectID = userObj._id;
          console.log(
            "Adding user:",
            user.first_name + " " + user.last_name,
            " with ID ",
            user.objectID
          );
        })
        .catch(function (err) {
          console.error("Error create user", err);
        });
    });

    return Promise.all(userPromises).then(function () {
      const photoModels = [];
      const userIDs = Object.keys(mapFakeId2RealId);
      userIDs.forEach(function (id) {
        photoModels.push(...models.photoOfUserModel(id));
      });

      const photoPromises = photoModels.map(function (photo) {
        return Photo.create({
          file_name: photo.file_name,
          date_time: photo.date_time,
          user_id: mapFakeId2RealId[photo.user_id],
        })
          .then(function (photoObj) {
            photo.objectID = photoObj._id;
            if (photo.comments) {
              photo.comments.forEach(function (comment) {
                photoObj.comments = photoObj.comments.concat([
                  {
                    comment: comment.comment,
                    date_time: comment.date_time,
                    user_id: comment.user.objectID,
                  },
                ]);
                console.log(
                  "Adding comment of length %d by user %s to photo %s",
                  comment.comment.length,
                  comment.user.objectID,
                  photo.file_name
                );
              });
            }

            return photoObj.save().then(function () {
              console.log(
                "Adding photo:",
                photo.file_name,
                " of user ID ",
                photoObj.user_id
              );
            });
          })
          .catch(function (err) {
            console.error("Error create photo", err);
          });
      });

      return Promise.all(photoPromises).then(function () {
        return SchemaInfo.create({
          version: versionString,
        })
          .then(function (schemaInfo) {
            console.log(
              "SchemaInfo object created with version ",
              schemaInfo.version
            );
          })
          .catch(function (err) {
            console.error("Error create schemaInfo", err);
          });
      });
    });
  })
  .then(function () {
    console.log("loadDatabase Completed");
    setTimeout(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }, 200);
  })
  .catch(function (err) {
    console.error("Error finishing loadDatabase", err);
    process.exit(1);
  });