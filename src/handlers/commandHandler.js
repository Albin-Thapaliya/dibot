const Discord = require("discord.js");
const { Client } = require("../../index");

const { ReachedNewLevel, GetLevel } = require("../handlers/rankHandler");

const { Prefix } = require("../../config");

Client.on("message", (message) => {
  if (message.author.id === Client.user.id) return;

  if (message.channel.type === "dm") return;

  if (!message.content.startsWith(Prefix)) {
    Client.con.query(
      `SELECT XP, SaviorCoins FROM Players WHERE DiscordId='${message.author.id}'`,
      (err, players) => {
        if (err) return console.error(err);

        if (players.length <= 0) return;

        const { XP, SaviorCoins } = players[0];
        const newXp = XP + message.content.length;
        const newLevel = ReachedNewLevel(newXp, GetLevel(XP, 1));
        const Reward = newLevel ? newLevel * 10 + SaviorCoins : SaviorCoins;

        if (newLevel) {
          message.channel.send(
            `Hey ${message.author.username}, you have reached level ${newLevel}!`,
          );
        }

        Client.con.query(
          `UPDATE Players SET XP='${newXp}', SaviorCoins='${Reward}' WHERE DiscordId='${message.author.id}'`,
          (err, updated) => {
            if (err) return console.error(err);
          },
        );
      },
    );
  }

  const content = message.content,
    args = content.split(" ").splice(1, 1),
    invoke = content.split(" ")[0].substr(Prefix.length).toLowerCase();

  const AllCommands = Client.commands.array();

  const index = AllCommands.findIndex(
    (cmd) => cmd.name === invoke || cmd.aliases.includes(invoke),
  );
  if (index === -1) return;

  const command = AllCommands[index];

  if (args.length < command.argsRequired)
    return message.channel.send(
      "Wrong arguments provided, use it like this: `" + command.format + "`",
    );

  if (command.permissionsRequired) {
    const { member } = message;

    if (!member.hasPermission(command.permissionsRequired)) {
      return message.channel.send(
        "Sorry, you don't have the permission to execute this command!",
      );
    }
  }

  command.execute(message, args, Client);
});
