const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  GroupName: String,
  Settings: {
    Description: String,
    MaxMemberCount: Number,
    IsPublic: Boolean,
    AdminInviteOnly: Boolean,
  },
  Group: {
    Id: String,
    Type: String,
  },
  MemberRoleId: String,
  AdminRoleId: String,
  Roles: Object,
  Created: String,
  Members: [
    {
      RoleId: String,
      RoleName: String,
      Members: [
        {
          Key: {
            Id: String,
            Type: String,
          },
          PlayFabId: String,
        },
      ],
    },
  ],
  DiscordOnly: {
    Score: Number,
    PaymentAdmin: Number,
    PaymentMembers: Number,
  },
});

module.exports = mongoose.model("clan", Schema);
