const Router = require("express").Router();

class Clan {
  constructor(data) {
    this.GroupName = data.GroupName;
    this.Settings = JSON.parse(data.Settings);
    this.Group = JSON.parse(data.Group);
    this.GroupId = data.GroupId;
    this.ClanAvatar = data.ClanAvatar;
    this.Region = data.Region;
    this.MemberRoleId = data.MemberRoleId;
    this.AdminRoleId = data.AdminRoleId;
    this.Roles = JSON.parse(data.Roles);
    this.Created = data.Created;
    this.Gallery = new Array();
    this.Members = new Array();

    this.DiscordOnly = JSON.parse(data.DiscordOnly);
  }

  HasPermission(playfabId) {
    if (!this.Settings.AdminInviteOnly) return true;

    return (
      this.Members.find((m) => m.RoleName === clan.Roles[0]).PlayFabId ===
      playfabId
    );
  }

  CanDelete(playfabId) {
    return (
      this.Members.find((m) => m.RoleName === clan.Roles[0]).PlayFabId ===
      playfabId
    );
  }

  /**
   * @param {Array} data
   */
  AddMembers(data) {
    data.forEach((d) => {
      this.Members.push({
        Id: d.Id,
        RoleId: d.RoleId,
        RoleName: d.RoleName,
        PlayFabId: d.PlayFabId,
        Key: JSON.parse(d.Key),
      });
    });

    return this;
  }

  /**
   *
   * @param {Array} data
   */
  SetGallery(data) {
    this.Gallery = data;
  }
}

class Application {
  constructor(data) {
    this.Id = data.Id;
    this.GroupId = data.GroupId;
    this.Group = JSON.parse(data.Group);
    this.Expires = data.Expires;
    this.Entity = JSON.parse(data.Entity);
  }
}

class Invite {
  constructor(data) {
    this.Id = data.Id;
    this.GroupId = data.GroupId;
    this.Group = JSON.parse(data.Group);
    this.Expires = data.Expires;
    this.InvitedByEntity = JSON.parse(data.InvitedByEntity);
    this.InvitedEntity = JSON.parse(data.InvitedEntity);
    this.RoleId = data.RoleId;
  }
}

const IsAbleToPerformAction = (con, playfabId, groupId, callback) => {
  con.query(`SELECT * FROM Clan WHERE GroupId='${groupId}'`, (err, groups) => {
    if (err)
      return callback({ Error: "Wasn't able to get clan", Success: null });

    if (groups.length <= 0)
      return callback({ Error: "Wasn't able to get clan", Success: null });

    const clan = new Clan(groups[0]);

    con.query(
      `SELECT * FROM ClanMembers WHERE GroupId='${groupId}'`,
      (err, members) => {
        if (err)
          return callback({
            Error: "Wasn't able to get members",
            Success: null,
          });

        if (groups.length <= 0)
          return callback({
            Error: "Wasn't able to get members",
            Success: null,
          });

        clan.AddMembers(members);

        if (!clan.HasPermission(playfabId))
          return callback({
            Error: "You don't have permissions to execute this",
            Success: null,
          });

        return callback({ Error: null, Success: null });
      },
    );
  });
};

Router.post("/createClan", (req, res) => {
  const { playfabId, entityKey, groupData, settings, region } = JSON.parse(
    req.headers["bodydata"],
  );

  const data = {
    GroupName: groupData.GroupName,
    GroupId: groupData.Group.Id,
    Settings: JSON.stringify(settings),
    Group: JSON.stringify(groupData.Group),
    ClanAvatar: "",
    Region: region ? region : "EU",
    MemberRoleId: groupData.MemberRoleId,
    AdminRoleId: groupData.AdminRoleId,
    Roles: JSON.stringify(
      Object.keys(groupData.Roles).map((r) => groupData.Roles[r]),
    ),
    Created: Date.now().toString(),
    DiscordOnly: JSON.stringify({
      Score: 0,
      PaymentAdmin: 50,
      PaymentMembers: 50,
    }),
  };

  req.con.query(`INSERT INTO Clan SET ?`, data, (err, inserted) => {
    if (err)
      return res
        .status(404)
        .json({ Error: "Wasn't able to create clan", Success: null });

    const clan = new Clan(data);

    const playerData = {
      GroupId: clan.GroupId,
      RoleId: clan.AdminRoleId,
      RoleName: clan.Roles[0],
      Key: JSON.stringify(entityKey),
      PlayFabId: playfabId,
    };

    req.con.query(
      `INSERT INTO ClanMembers SET ?`,
      playerData,
      (err, newMember) => {
        if (err)
          return res
            .status(404)
            .json({ Error: "Wasn't able to add player", Success: null });

        clan.AddMembers([
          {
            RoleId: clan.AdminRoleId,
            RoleName: clan.Roles[0],
            Key: JSON.stringify(entityKey),
            PlayFabId: playfabId,
          },
        ]);

        return res.status(201).json({ Error: null, Success: clan });
      },
    );
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

  const data = {
    GroupId: inviteResult.Group.Id,
    Group: JSON.stringify(inviteResult.Group),
    Expires: inviteResult.Expires,
    InvitedByEntity: JSON.stringify({
      Key: entityKey,
      PlayFabId: playfabId,
    }),
    InvitedEntity: JSON.stringify({
      Key: invitedEntityKey,
      PlayFabId: invitedPlayfabId,
    }),
    RoleId: inviteResult.RoleId,
  };

  IsAbleToPerformAction(req.con, playfabId, inviteResult.Group.Id, (result) => {
    if (result.Error) return res.status(404).json(result);

    req.con.query(`INSERT INTO ClanInvites SET ?`, data, (err, updated) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Wasn't able to create invite", Success: null });

      return res.status(201).json({ Error: null, Success: null });
    });
  });
});

Router.post("/addApp", (req, res) => {
  const { playfabId, applicationResult, entityKey } = JSON.parse(
    req.headers["bodydata"],
  );

  const data = {
    GroupId: applicationResult.Group.Id,
    Group: JSON.stringify(applicationResult.Group),
    Expires: applicationResult.Expires,
    Entity: JSON.stringify({
      Key: entityKey,
      PlayFabId: playfabId,
    }),
  };

  req.con.query(`INSERT INTO ClanApplications SET ?`, data, (err, updated) => {
    if (err)
      return res
        .status(404)
        .json({ Error: "Wasn't able to create application", Success: null });

    return res.status(201).json({ Error: null, Success: null });
  });
});

Router.post("/acceptInvite", (req, res) => {
  const { playfabId, entityKey, groupData } = JSON.parse(
    req.headers["bodydata"],
  );

  req.con.query(
    `SELECT * FROM Clan WHERE GroupId='${groupData.Group.Id}'`,
    (err, groups) => {
      if (err)
        return res.status(404).json({ Error: "No group found", Success: null });

      if (groups.length <= 0)
        return res.status(404).json({ Error: "No group found", Success: null });

      const clan = new Clan(groups[0]);

      req.con.query(
        `SELECT * FROM ClanInvites WHERE GroupId='${groupData.Group.Id}'`,
        (err, invites) => {
          if (err)
            return res
              .status(404)
              .json({ Error: "No invites in this clan found", Success: null });

          if (invites.length <= 0)
            return res
              .status(404)
              .json({ Error: "This clan sent no invites", Success: null });

          const invite = invites.find(
            (inv) => JSON.parse(inv.InvitedEntity).Key.Id === entityKey.Id,
          );
          if (!invite)
            return res
              .status(404)
              .json({ Error: "Player has no invites", Success: null });

          const playerData = {
            GroupId: clan.GroupId,
            RoleId: clan.MemberRoleId,
            RoleName: clan.Roles[1],
            Key: JSON.stringify(entityKey),
            PlayFabId: playfabId,
          };

          req.con.query(
            `INSERT INTO ClanMembers SET ?`,
            playerData,
            (err, updated) => {
              if (err)
                return res.status(404).json({
                  Error: "Wasn't able to store player",
                  Success: null,
                });

              req.con.query(
                `DELETE FROM ClanInvites WHERE Id='${invite.Id}'`,
                (err, deleted) => {
                  if (err)
                    return res.status(404).json({
                      Error: "Not able to delete invite",
                      Success: null,
                    });

                  req.con.query(
                    `SELECT * FROM ClanMembers WHERE GroupId='${clan.GroupId}'`,
                    (err, results) => {
                      if (err)
                        return res.status(404).json({
                          Error: "Wasn't able to get members",
                          Success: null,
                        });

                      clan.AddMembers(results);

                      return res
                        .status(201)
                        .json({ Error: null, Success: clan });
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
});

Router.post("/acceptApp", (req, res) => {
  const { entityKey, playfabId, groupData } = JSON.parse(
    req.headers["bodydata"],
  );

  req.con.query(
    `SELECT * FROM Clan WHERE GroupId='${groupData.Group.Id}'`,
    (err, groups) => {
      if (err)
        return res.status(404).json({ Error: "No group found", Success: null });

      if (groups.length <= 0)
        return res.status(404).json({ Error: "No group found", Success: null });

      const clan = new Clan(groups[0]);

      req.con.query(
        `SELECT * FROM ClanApplications WHERE GroupId='${clan.GroupId}'`,
        (err, apps) => {
          if (err)
            return res.status(404).json({
              Error: "No applications in this clan found",
              Success: null,
            });

          if (apps.length <= 0)
            return res.status(404).json({
              Error: "This user has no applications created",
              Success: null,
            });

          const app = apps.find(
            (a) => JSON.parse(a.Entity).Key.Id === entityKey.Id,
          );
          if (!app)
            return res.status(404).json({
              Error: "This user didn't create any apps",
              Success: null,
            });

          const playerData = {
            GroupId: clan.GroupId,
            RoleId: clan.MemberRoleId,
            RoleName: clan.Roles[1],
            Key: JSON.stringify(entityKey),
            PlayFabId: playfabId,
          };

          req.con.query(
            `INSERT INTO ClanMembers SET ?`,
            playerData,
            (err, updated) => {
              if (err)
                return res.status(404).json({
                  Error: "Wasn't able to store player",
                  Success: null,
                });

              req.con.query(
                `DELETE FROM ClanApplications WHERE Id='${app.Id}'`,
                (err, deleted) => {
                  if (err)
                    return res.status(404).json({
                      Error: "Not able to delete application",
                      Success: null,
                    });

                  req.con.query(
                    `SELECT * FROM ClanMembers WHERE GroupId='${clan.GroupId}'`,
                    (err, results) => {
                      if (err)
                        return res.status(404).json({
                          Error: "Wasn't able to get members",
                          Success: null,
                        });

                      clan.AddMembers(results);

                      return res
                        .status(201)
                        .json({ Error: null, Success: clan });
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
});

Router.get("/getClans", (req, res) => {
  req.con.query(`SELECT * FROM Clan`, (err, clans) => {
    if (err)
      return res
        .status(404)
        .json({ Error: "Couldn't retrieve clans", Success: null });

    if (clans.length <= 0)
      return res
        .status(404)
        .json({ Error: "Couldn't get clans", Success: null });

    req.con.query(`SELECT * FROM ClanMembers`, (err, members) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get members", Success: null });

      if (members.length <= 0)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get members", Success: null });

      const clanArr = new Array();

      clans.forEach((c) => {
        clanArr.push(
          new Clan(c).AddMembers(
            members.filter((m) => m.GroupId === c.GroupId),
          ),
        );
      });

      return res.status(201).json({ Error: null, Success: clanArr });
    });
  });
});

Router.get("/getClan", (req, res) => {
  const { name } = JSON.parse(req.headers["bodydata"]);

  req.con.query(
    `SELECT * FROM Clan WHERE GroupName='${name}'`,
    (err, clans) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Couldn't retrieve clan", Success: null });

      if (clans.length <= 0)
        return res
          .status(404)
          .json({ Error: "Couldn't find clan", Success: null });

      const clan = new Clan(clans[0]);

      req.con.query(
        `SELECT * FROM ClanMembers WHERE GroupId='${clan.GroupId}'`,
        (err, members) => {
          if (err)
            return res
              .status(404)
              .json({ Error: "Wasn't able to get members", Success: null });

          if (members.length <= 0)
            return res
              .status(404)
              .json({ Error: "Wasn't able to get members", Success: null });

          return res
            .status(201)
            .json({ Error: null, Success: clan.AddMembers(members) });
        },
      );
    },
  );
});

Router.get("/getApps", (req, res) => {
  const { groupId } = JSON.parse(req.headers["bodydata"]);

  req.con.query(
    `SELECT * FROM ClanApplications WHERE GroupId=${groupId}`,
    (err, apps) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get applications", Success: null });

      return res
        .status(201)
        .json({ Error: null, Success: apps.map((a) => new Application(a)) });
    },
  );
});

Router.get("/getInvites", (req, res) => {
  const { entityKey } = JSON.parse(req.headers["bodydata"]);

  req.con.query(`SELECT * FROM ClanInvites`, (err, invites) => {
    if (err)
      return res
        .status(404)
        .json({ Error: "Wasn't able to get invites", Success: null });

    const myInvites = invites
      .map((inv) => new Invite(inv))
      .filter((inv) => inv.InvitedEntity.Key.Id === entityKey.Id);

    return res.status(201).json({ Error: null, Success: myInvites });
  });
});

Router.get("/leaveClan", (req, res) => {
  const { playfabId, groupId } = JSON.parse(req.headers["bodydata"]);

  req.con.query(
    `SELECT * FROM ClanMembers WHERE PlayFabId='${playfabId}' AND GroupId='${groupId}'`,
    (err, members) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get members", Success: null });

      if (members.length <= 0)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get members", Success: null });

      if (members[0].RoleId === "admins")
        return res
          .status(404)
          .json({ Error: "Leaders can't leave the clan", Success: null });

      req.con.query(
        `DELETE FROM ClanMembers WHERE Id='${members[0].Id}'`,
        (err, deleted) => {
          if (err)
            return res
              .status(404)
              .json({ Error: "Wasn't able to delete object", Success: null });

          return res.status(201).json({ Error: null, Success: null });
        },
      );
    },
  );
});

Router.get("/deleteClan", (req, res) => {
  const { playfabId, groupId } = JSON.parse(req.headers["bodydata"]);

  req.con.query(
    `SELECT * FROM Clan WHERE GroupId='${groupId}'`,
    (err, clans) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Couldn't retrieve clan", Success: null });

      if (clans.length <= 0)
        return res
          .status(404)
          .json({ Error: "Couldn't find clan", Success: null });

      const clan = new Clan(clans[0]);

      req.con.query(
        `SELECT * FROM ClanMembers WHERE GroupId='${clan.GroupId}'`,
        (err, members) => {
          if (err)
            return res
              .status(404)
              .json({ Error: "Wasn't able to get members", Success: null });

          if (members.length <= 0)
            return res
              .status(404)
              .json({ Error: "Wasn't able to get members", Success: null });

          clan.AddMembers(members);

          if (!clan.CanDelete(playfabId))
            return res.status(404).json({
              Error: "You arent the owner of the clan",
              Success: null,
            });

          const ids = clan.Members.map((m) => m.Id);

          req.con.query(
            `DELETE FROM ClanMembers WHERE Id IN ('${ids.join("', '")}')`,
            (err, deletedMem) => {
              if (err)
                return res.status(404).json({
                  Error: "Wasn't able to delete members",
                  Success: null,
                });

              req.con.query(
                `DELETE FROM Clan WHERE Id='${groups[0].Id}'`,
                (err, deletedGroup) => {
                  if (err)
                    return res.status(404).json({
                      Error: "Wasn't able to delete group",
                      Success: null,
                    });

                  return res.status(201).json({ Error: null, Success: null });
                },
              );
            },
          );
        },
      );
    },
  );
});

Router.post("/deleteInvite", (req, res) => {
  const { playfabId, groupId } = JSON.parse(req.headers["bodydata"]);

  req.con.query(
    `SELECT * FROM ClanInvites WHERE GroupId='${groupId}'`,
    (err, invites) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get invites", Success: null });

      if (invites.length <= 0)
        return res
          .status(404)
          .json({ Error: "No invites in that group found", Success: null });

      const allInvites = invites.map((inv) => new Invite(inv));

      let index = allInvites.findIndex(
        (inv) => inv.InvitedEntity.PlayFabId === playfabId,
      );
      if (index === -1) {
        index = this.allInvites.findIndex(
          (inv) => inv.InvitedByEntity.PlayFabId === playfabId,
        );

        if (index === -1)
          return res
            .status(404)
            .json({ Error: "Wasn't able to find invite", Success: null });
      }

      req.con.query(
        `DELETE FROM ClanInvites WHERE Id='${allInvites[index].Id}'`,
        (err, deleted) => {
          if (err)
            return res
              .status(404)
              .json({ Error: "Wasn't able to delete invite", Success: null });

          return res.status(201).json({ Error: null, Success: null });
        },
      );
    },
  );
});

Router.post("/deleteApp", (req, res) => {
  const { playfabId, groupId } = JSON.parse(req.headers["bodydata"]);

  req.con.query(
    `SELECT * FROM ClanApplications WHERE GroupId='${groupId}'`,
    (err, apps) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get applications", Success: null });

      if (apps.length <= 0)
        return res.status(404).json({
          Error: "No applications in that group found",
          Success: null,
        });

      const allApps = apps.map((a) => new Application(a));

      let index = allApps.findIndex((a) => a.Entity.PlayFabId === playfabId);
      if (index === -1)
        return res.status(404).json({
          Error: "No application found associated with this id",
          Success: null,
        });

      req.con.query(
        `DELETE FROM ClanApplications WHERE Id='${allApps[index].Id}'`,
        (err, deleted) => {
          if (err)
            return res.status(404).json({
              Error: "Wasn't able to delete application",
              Success: null,
            });

          allApps.splice(index, 1);

          return res.status(201).json({ Error: null, Success: allApps });
        },
      );
    },
  );
});

module.exports = Router;
