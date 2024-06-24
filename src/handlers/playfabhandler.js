const PlayFabClientAPI = require("playfab-sdk/Scripts/PlayFab/PlayFabClient");
const PlayFabServerAPI = require("playfab-sdk/Scripts/PlayFab/PlayFabServer");

const { GetLevel } = require("./rankHandler");

const PlayFab = require("playfab-sdk/Scripts/PlayFab/PlayFab");
const NodeMailer = require("nodemailer");

const { Client } = require("../../index");

const {
  TitleId,
  DeveloperSecretKey,
  TransportOptions,
  Url,
} = require("../../config");

const transporter = NodeMailer.createTransport(TransportOptions);

const CreateAuthCode = (codes, length = 25) => {
  const vals = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];

  let code = "";

  for (var i = 0; i <= length; i++) {
    code += vals[Math.floor(Math.random() * vals.length)];
  }

  if (codes.includes(code)) return CreateAuthCode(codes, length);

  return code;
};

const CreateEmailContent = (email, authcode) => {
  return {
    from: TransportOptions.auth.user,
    to: email,
    subject: "Link your Discord account with your DisBotCoins online account",
    html: `<p>Dear player,</p><br /><p>in order to link your DisBotCoins account with your Discord account click on the link:</p><br /><a href="${Url + `linkReqs/${authcode}`}">${Url + `linkReqs/${authcode}`}</a><br /><p>If you didn't request to link your accounts, please join our Discord and report an issue.</p>`,
  };
};

PlayFab.settings.titleId = TitleId;
PlayFab.settings.developerSecretKey = DeveloperSecretKey;

PlayFabClientAPI.LoginWithCustomID(
  { CreateAccount: true, CustomId: "DisBotCoinsBot" },
  (err, success) => {
    if (err) return console.error(err);

    console.log("Logged into playfab services");
  },
);

const LinkAccount = (email, id, callback) => {
  Client.con.query(
    `SELECT * FROM PendingLinks WHERE DiscordId='${id}'`,
    (err, links) => {
      if (err) return callback("Wasn't able to fetch links", null);

      if (links.length > 0)
        return callback("You already have a pending link", null);

      Client.con.query(
        `SELECT * FROM Players WHERE Email='${email}' OR DiscordId='${id}'`,
        (err, players) => {
          if (err) return callback("Wasn't able to get players", null);

          if (players.length <= 0)
            return callback("Wasn't able to find player", null);

          if (players.length > 1)
            return callback("More than one player returned", null);

          if (players[0].DiscordId) return callback("Already signed up", null);

          const authCode = CreateAuthCode(links.map((l) => l.AuthCode));

          Client.con.query(
            `INSERT INTO PendingLinks (AuthCode, DiscordId, PlayFabId, CreatedAt) Values ('${authCode}', '${id}', '${players[0].PlayFabId}', '${Date.now()}')`,
            (err, inserted) => {
              if (err)
                return callback("Wasn't able to create new object", null);

              transporter.sendMail(
                CreateEmailContent(email, authCode),
                (err, result) => {
                  if (err) return callback("Wasn't able to send Email", null);

                  return callback(
                    null,
                    "Sent email, please check your inbox to verify your account!",
                  );
                },
              );
            },
          );
        },
      );
    },
  );
};

const GetPlayerStatistics = (id, callback) => {
  Client.con.query(
    `SELECT PlayFabId, XP, FROM Players WHERE DiscordId='${id}'`,
    (err, players) => {
      if (err) return callback("Wasn't able to fetch player", null);

      if (players.length <= 0)
        return callback("This user didn't link his account yet", null);

      const { PlayFabId, XP, DisBotCoins } = players[0];

      PlayFabServerAPI.GetPlayerCombinedInfo(
        {
          PlayFabId,
          GetPlayerCombinedInfoRequestParams: {
            GetPlayerStatistics: true,
            GetPlayerProfile: true,
            ProfileConstraints: { ShowDisplayName: true },
          },
        },
        (err, playerResult) => {
          if (err) return callback("Wasn't able to retrieve user data", null);

          const statistics =
            playerResult.data.InfoResultPayload.PlayerStatistics;
          const displayName =
            playerResult.data.InfoResultPayload.PlayerProfile.DisplayName;

          PlayFabServerAPI.GetUserInventory({ PlayFabId }, (err, invResult) => {
            if (err)
              return callback("Wasn't able to retrive user currencies", null);

            const DisBotCoins = invResult.data.VirtualCurrencies["SC"];
            const DiscordLevel = GetLevel(XP, 1);

            return callback(null, {
              Discord: { Rank: DiscordLevel, DiscordCoins: DisBotCoins },
              Server: {
                Statistics: statistics,
                Coins: DisBotCoins,
                DisplayName: displayName,
              },
            });
          });
        },
      );
    },
  );
};

module.exports = { LinkAccount, GetPlayerStatistics };
