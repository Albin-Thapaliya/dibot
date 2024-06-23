const Router = require("express").Router();

const ClanSchema = require("../schema/ClanSchema");
const ApplicationSchema = require("../schema/ApplicationSchema");
const InviteSchema = require("../schema/InviteSchema");

Router.post("/createClan", (req, res) => {
  const { playfabId, entityKey, groupData, settings } = JSON.parse(
    req.headers["bodydata"],
  );

  new ClanSchema({
    GroupName: groupData.GroupName,
    Settings: settings,
    Group: groupData.Group,
    MemberRoleId: groupData.MemberRoleId,
    AdminRoleId: groupData.AdminRoleId,
    Roles: groupData.Roles,
    Created: groupData.Created,
    Members: [
      {
        RoleId: groupData.AdminRoleId,
        RoleName: groupData.Roles[groupData.AdminRoleId],
        Members: [
          {
            Key: entityKey,
            PlayFabId: playfabId,
          },
        ],
      },
      {
        RoleId: groupData.MemberRoleId,
        RoleName: groupData.Roles[groupData.MemberRoleId],
        Members: [],
      },
    ],
    DiscordOnly: {
      Score: 0,
      PaymentAdmin: 50,
      PaymentMembers: 50,
    },
  }).save((err, saved) => {
    if (err) return res.status(404).json(err);

    console.log("New clan created and received!");
    return res.status(201).json("Success");
  });
});

Router.post("/inviteMember", (req, res) => {
  const {
    playfabId,
    invitedEntityKey,
    invitedPlayfabId,
    entityKey,
    inviteResult,
  } = JSON.parse(req.headers["bodydata"]);

  new InviteSchema({
    Expires: inviteResult.Expres,
    Group: inviteResult.Group,
    InvitedByEntity: {
      Key: entityKey,
      PlayFabId: playfabId,
    },
    InvitedEntity: {
      Key: invitedEntityKey,
      PlayFabId: invitedPlayfabId,
    },
    RoleId: inviteResult.RoleId,
  }).save((err, saved) => {
    if (err) return res.status(404).json(err);

    console.log("New invite created");
    return res.status(201).json("Success");
  });
});

Router.post("/addApp", (req, res) => {
  const { playfabId, applicationResult, entityKey } = JSON.parse(
    req.headers["bodydata"],
  );

  new ApplicationSchema({
    Entity: {
      Key: entityKey,
      PlayFabId: playfabId,
    },
    Expires: applicationResult.Expires,
    Group: applicationResult.Group,
  }).save((err, saved) => {
    if (err) return res.status(404).json(err);

    console.log("Created app");
    return res.status(201).json("Success");
  });
});

Router.get("/getClan", (req, res) => {
  ClanSchema.findOne(
    { GroupName: JSON.parse(req.headers["bodydata"]).Name },
    (err, group) => {
      if (err) return res.status(404).json({ Error: "Group wasn't found" });

      if (!group) return res.status(404).json({ Error: "Group doesn't exist" });

      return res.status(201).json(group.toObject());
    },
  );
});

module.exports = Router;
