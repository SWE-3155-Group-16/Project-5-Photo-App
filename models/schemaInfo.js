const mongoose = require("mongoose");

const schemaInfoSchema = new mongoose.Schema({
  version: String
});

module.exports = mongoose.model("SchemaInfo", schemaInfoSchema);