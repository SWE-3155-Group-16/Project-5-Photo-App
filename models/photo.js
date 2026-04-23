const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  comment: String,
  date_time: Date,
  user_id: mongoose.Schema.Types.ObjectId
});

const photoSchema = new mongoose.Schema({
  file_name: String,
  date_time: Date,
  user_id: mongoose.Schema.Types.ObjectId,
  comments: [commentSchema]
});

module.exports = mongoose.model("Photo", photoSchema);