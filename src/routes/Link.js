const Router = require("express").Router();

Router.get("/:id", (req, res) => {
  const authCode = req.params.id;

  req.con.query(
    `SELECT * FROM PendingLinks WHERE AuthCode='${authCode}'`,
    (err, codes) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Not able to get links", Success: null });

      if (codes.length <= 0)
        return res
          .status(404)
          .json({
            Error: "No link found associated with this code",
            Success: null,
          });

      if (codes[0].Used)
        return res
          .status(404)
          .json({
            Error: "No link found associated with this code",
            Success: null,
          });

      req.con.query(
        `SELECT PlayFabId, DiscordId FROM Players WHERE PlayFabId='${codes[0].PlayFabId}' OR DiscordId='${codes[0].DiscordId}'`,
        (err, players) => {
          if (err)
            return res
              .status(404)
              .json({ Error: "Not able to get players", Success: null });

          if (players.length <= 0)
            return res
              .status(404)
              .json({
                Error: "No player found associated to that Id",
                Success: null,
              });

          if (players.length > 1)
            return res
              .status(404)
              .json({
                Error: "More than one user found, reach out to the devs",
                Success: null,
              });

          req.con.query(
            `UPDATE Players SET DiscordId='${codes[0].DiscordId}' WHERE PlayFabId='${codes[0].PlayFabId}'`,
            (err, updated) => {
              if (err)
                return res
                  .status(404)
                  .json({ Error: "Wasn't able to set Ids", Success: null });

              req.con.query(
                `DELETE FROM PendingLinks WHERE AuthCode='${authCode}'`,
                (err, deleted) => {
                  if (err)
                    return res
                      .status(404)
                      .json({
                        Error: "Wasn't able to delete entry",
                        Success: null,
                      });

                  require("../../index")
                    .Client.guilds.get("445544977070817290")
                    .members.get(codes[0].DiscordId)
                    .send("Your account is linked now!");

                  return res
                    .status(201)
                    .json({
                      Error: null,
                      Success: "Your account is linked now, enjoy!",
                    });
                },
              );
            },
          );
        },
      );
    },
  );
});

module.exports = Router;
