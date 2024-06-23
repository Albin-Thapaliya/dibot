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

Router.post("/acceptInvite", (req, res) => {
  const { playfabId, entityKey, groupData } = JSON.parse(
    req.headers["bodydata"],
  );

  ClanSchema.findOne({ Group: groupData }, (err, clan) => {
    if (err) return console.error(err);

    if (!clan)
      return res.status(404).json({ Error: "No clan with that Id found" });

    InviteSchema.find({ Group: groupData }, (err, invites) => {
      if (err)
        return res.status(404).json({ Error: "No invites to that clan found" });

      if (invites.length <= 0)
        return res.status(404).json({ Error: "This clan sent no invites" });

      const invite = invites.find(
        (inv) => inv.InvitedEntity.Key.Id === entityKey.Id,
      );
      if (!invite)
        return res.status(404).json({ Error: "Player has no invites" });

      clan.Members[1].Members.push({
        Key: entityKey,
        PlayFabId: playfabId,
      });

      clan.save((err, saved) => {
        if (err)
          return res
            .status(404)
            .json({ Error: "Wasn't able to store the new clan object" });

        InviteSchema.deleteOne(invite.toObject(), (err, result) => {
          if (err) return console.error(err);
        });
        console.log("Player got invited");
        return res.status(201).json("Success");
      });
    });
  });
});

Router.post("/acceptApp", (req, res) => {
  const { entityKey, playfabId, groupData } = JSON.parse(
    req.headers["bodydata"],
  );

  ClanSchema.findOne({ Group: groupData }, (err, clan) => {
    if (err)
      return res.status(404).json({ Error: "No clan with that Id found" });

    ApplicationSchema.find({ Group: groupData }, (err, apps) => {
      if (err) return res.status(404).json({ Error: "This clan has no apps" });

      if (apps.length <= 0)
        return res.status(404).json({ Error: "This clan received no apps" });

      const app = apps.find((a) => a.Entity.Key.Id === entityKey.Id);
      if (!app)
        return res
          .status(404)
          .json({ Error: "This user didn't create any apps" });

      clan.Members[1].Members.push({
        Key: entityKey,
        PlayFabId: playfabId,
      });

      clan.save((err, saved) => {
        if (err)
          return res
            .status(404)
            .json({ Error: "Wasn't able to store the clan" });

        ApplicationSchema.deleteOne(app.toObject(), (err, result) => {
          if (err) return console.error(err);
        });
        console.log("Player added to clan");
        return res.status(201).json("Success");
      });
    });
  });
});

Router.post("/leaveClan", (req, res) => {});

Router.get("/getClans", (req, res) => {
  ClanSchema.find({}, (err, clans) => {
    if (err) return res.status(404).json({ Error: "Couldn't retrieve clans" });

    if (!clans.length)
      return res.status(404).json({ Error: "Couldn't get clans" });

    return res.status(201).json(clans.map((c) => c.toObject()));
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
