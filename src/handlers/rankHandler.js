const ReachedNewLevel = (newXp, oldLevel) => {
  const { Level } = GetLevel(newXp, oldLevel);

  if (Level > oldLevel) return Level;
  else return false;
};

const AddXP = (client, message) => {
  client.con.query(
    `SELECT XP, SaviorCoins FROM Players WHERE DiscordId='${message.author.id}'`,
    (err, players) => {
      if (err) return console.error(err);

      if (players.length <= 0) return;

      const { XP, SaviorCoins } = players[0];
      const newXp = XP + message.content.length;
      const newLevel = ReachedNewLevel(newXp, GetLevel(XP, 1).Level);

      const Reward = newLevel ? (newLevel - 1) * 10 + SaviorCoins : SaviorCoins;

      if (newLevel) {
        message.channel.send(
          `Hey ${message.author.username}, you have reached level ${newLevel}!`,
        );
      }

      client.con.query(
        `UPDATE Players SET XP='${newXp}', SaviorCoins='${Reward}' WHERE DiscordId='${message.author.id}'`,
        (err, updated) => {
          if (err) return console.error(err);
        },
      );
    },
  );
};

const GetLevel = (xp, level) => {
  if (xp >= 50 * level * (level * 2)) return GetLevel(xp, level + 1);

  return { XP: xp, Level: level, Required: 50 * level * (level * 2) };
};

module.exports = { GetLevel, ReachedNewLevel, AddXP };
