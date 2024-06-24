const { RichEmbed } = require("discord.js");

const { GetPlayerStatistics } = require("../playfabhandler");

module.exports = {
  name: "statistics",
  aliases: ["stats"],
  permissionsRequired: [],
  argsRequired: 0,

  execute: (message, args, client) => {
    let user = message.author;

    if (message.mentions.users.array().length > 0)
      user = message.mentions.users.array()[0];

    GetPlayerStatistics(user.id, (err, result) => {
      if (err) return message.channel.send(err);

      const { Discord, Server } = result;

      const embed = new RichEmbed()
        .setTitle(`Statistics of ${user.username}/${Server.DisplayName}`)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setDescription(
          "Shows the statistics from a discord users ingame info and discord info, if the user linked the account",
        )
        .addField(
          "Server info",
          `SaviorCoins: ${Server.Coins}\nStats:\n${Object.keys(Server.Statistics).map(`${k}: ${Server.Statistics[k]}`).join("\n")}`,
        )
        .addField(
          "Discord info",
          `SaviorCoins: ${Discord.DiscordCoins}\nRank: ${Object.keys(Discord.Rank).map(`${k}: ${Discord.Rank[k]}`).join("\n")}`,
        )
        .setColor("0x007f00");

      message.channel.send(embed).catch(console.error);
    });
  },
};
