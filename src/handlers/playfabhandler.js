const { GetLevel } = require("./rankHandler");

const fakeDatabase = {
  PendingLinks: [],
  Players: [],
};

const CreateAuthCode = (codes, length = 25) => {
  const vals = "123456789abcdefghijklmnopqrstuvwxyz".split("");
  let code = "";
  for (let i = 0; i < length; i++) {
    code += vals[Math.floor(Math.random() * vals.length)];
  }
  if (codes.includes(code)) return CreateAuthCode(codes, length);
  return code;
};

const LinkAccount = (email, discordId, callback) => {
  const links = fakeDatabase.PendingLinks.filter(
    (link) => link.DiscordId === discordId,
  );
  if (links.length > 0) {
    return callback("You already have a pending link", null);
  }

  const players = fakeDatabase.Players.filter(
    (player) => player.Email === email || player.DiscordId === discordId,
  );
  if (players.length === 0) {
    return callback("Wasn't able to find player", null);
  } else if (players.length > 1) {
    return callback("More than one player returned", null);
  } else if (players[0].DiscordId) {
    return callback("Already signed up", null);
  }

  const authCode = CreateAuthCode(
    fakeDatabase.PendingLinks.map((l) => l.AuthCode),
  );
  fakeDatabase.PendingLinks.push({
    AuthCode: authCode,
    DiscordId: discordId,
    PlayFabId: players[0].PlayFabId,
    CreatedAt: Date.now(),
  });

  callback(null, "Link request has been created successfully.");
};

const GetPlayerStatistics = (discordId, callback) => {
  const players = fakeDatabase.Players.filter(
    (player) => player.DiscordId === discordId,
  );
  if (players.length === 0) {
    return callback("This user didn't link his account yet", null);
  }

  const { PlayFabId, XP, DisBotCoins } = players[0];
  const statistics = { Score: 100, Level: GetLevel(XP, 1).Level };
  const displayName = "SamplePlayer";

  callback(null, {
    Discord: { Rank: statistics.Level, DiscordCoins: DisBotCoins },
    Server: {
      Statistics: statistics,
      Coins: DisBotCoins,
      DisplayName: displayName,
    },
  });
};

module.exports = { LinkAccount, GetPlayerStatistics };
