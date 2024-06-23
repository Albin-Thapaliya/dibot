const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  Entity: {
    Key: {
      Id: String,
      Type: String,
    },
    PlayFabId: String,
  },
  Expires: String,
  Group: {
    Id: String,
    Type: String,
  },
});

module.exports = mongoose.model("application", Schema);
