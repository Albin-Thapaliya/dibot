const PlayFabClientAPI = require("playfab-sdk/Scripts/PlayFab/PlayFabClient");
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

const CreateAuthCode = (length = 25) => {
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

  return code;
};

const CreateEmailContent = (email, authcode) => {
  return {
    from: TransportOptions.auth.user,
    to: email,
    subject: "Link your Discord account with your game online account",
    html: `<p>Dear player,</p><br /><p>in order to link your game account with your Discord account click on the link:</p><br /><a href="${Url + `linkReqs/${authcode}`}">${Url + `linkReqs/${authcode}`}</a><br /><p>If you didn't request to link your accounts, please join our Discord and report an issue.</p>`,
  };
};

PlayFab.settings.titleId = TitleId;
PlayFab.settings.developerSecretKey = DeveloperSecretKey;

PlayFabClientAPI.LoginWithCustomID(
  { CreateAccount: true, CustomId: "DisBot" },
  (err, success) => {
    if (err) return console.error(err);

    console.log("Logged into playfab services");
  },
);

const LinkAccount = (email, id, callback) => {
  Client.con.query(
    `SELECT * FROM Players WHERE Email='${email}'`,
    (err, players) => {
      if (err) return callback("Wasn't able to get players", null);

      if (players.length <= 0)
        return callback("Wasn't able to find player", null);

      const authCode = CreateAuthCode();

      Client.con.query(
        `INSERT INTO PendingLinks (AuthCode, DiscordId, PlayFabId, CreatedAt) Values ('${authCode}', '${id}', '${players[0].PlayFabId}', '${Date.now()}')`,
        (err, inserted) => {
          if (err) return callback("Wasn't able to create new object", null);

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
};

module.exports = { LinkAccount };
