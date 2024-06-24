const express = require("express");

module.exports = (client) => {
  const Router = express.Router();

  class Clan {
    constructor(data) {
      this.GroupName = data.GroupName;
      this.Settings = JSON.parse(data.Settings || "{}");
      this.Group = JSON.parse(data.Group || "{}");
      this.GroupId = data.GroupId;
      this.ClanAvatar = data.ClanAvatar;
      this.Region = data.Region;
      this.MemberRoleId = data.MemberRoleId;
      this.AdminRoleId = data.AdminRoleId;
      this.Roles = JSON.parse(data.Roles || "[]");
      this.Created = data.Created;
      this.Gallery = [];
      this.Members = [];
      this.DiscordOnly = JSON.parse(data.DiscordOnly || "{}");
    }

    HasPermission(playfabId) {
      return (
        !this.Settings.AdminInviteOnly ||
        this.Members.some(
          (m) => m.PlayFabId === playfabId && m.RoleName === this.Roles[0],
        )
      );
    }

    CanDelete(playfabId) {
      return this.Members.some(
        (m) => m.PlayFabId === playfabId && m.RoleName === this.Roles[0],
      );
    }

    AddMembers(data) {
      this.Members = this.Members.concat(
        data.map((d) => ({
          Id: d.Id,
          RoleId: d.RoleId,
          RoleName: d.RoleName,
          PlayFabId: d.PlayFabId,
          Key: JSON.parse(d.Key || "{}"),
        })),
      );
      return this;
    }

    SetGallery(data) {
      this.Gallery = data;
    }
  }

  Router.post("/createClan", async (req, res) => {
    try {
      const { playfabId, entityKey, groupData, settings, region } = req.body;

      const data = {
        GroupName: groupData.GroupName,
        GroupId: groupData.GroupId,
        Settings: JSON.stringify(settings),
        Group: JSON.stringify(groupData),
        ClanAvatar: "",
        Region: region || "EU",
        MemberRoleId: groupData.MemberRoleId,
        AdminRoleId: groupData.AdminRoleId,
        Roles: JSON.stringify(Object.values(groupData.Roles)),
        Created: Date.now().toString(),
        DiscordOnly: JSON.stringify({
          Score: 0,
          PaymentAdmin: 50,
          PaymentMembers: 50,
        }),
      };

      const insertResult = await req.con.query("INSERT INTO Clan SET ?", data);
      const clan = new Clan(data);

      const playerData = {
        GroupId: clan.GroupId,
        RoleId: clan.AdminRoleId,
        RoleName: clan.Roles[0],
        Key: JSON.stringify(entityKey),
        PlayFabId: playfabId,
      };

      await req.con.query("INSERT INTO ClanMembers SET ?", playerData);
      clan.AddMembers([playerData]);

      res.status(201).json({ Error: null, Success: clan });
    } catch (error) {
      console.error("Error creating clan:", error);
      res.status(500).json({ Error: "Failed to create clan", Success: null });
    }
  });
  return Router;
};
