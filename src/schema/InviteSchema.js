const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  Expires: String,
  Group: {
    Type: String,
    Id: String,
  },
  InvitedByEntity: {
    Key: {
      Id: String,
      Type: String,
    },
    PlayFabId: String,
  },
  InvitedEntity: {
    Key: {
      Id: String,
      Type: String,
    },
    PlayFabId: String,
  },
  RoleId: String,
});

module.exports = mongoose.model("claninvites", Schema);
